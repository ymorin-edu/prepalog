// La copie rendue — ce que l'ESPACE ENSEIGNANT en fait. Écrit le 02/10/2026 (chantier A).
//
// Une évaluation se déclare `copie: true` dans le `meta` de son activité (et le passe à
// `creerEntreprise`). Côté élève, tout est dans `core/types/entreprise.js` : rien ne remonte
// au suivi pendant le travail, aucune correction à l'écran, un bouton « Rendre ma copie », une
// seule remise, puis l'environnement en lecture seule, sans note affichée.
//
// La copie rendue est un résultat (`travaux/…`) qui porte `rendu` (l'heure de la remise) :
//   { score, max, detail, meilleur: score, tentatives: 1, rendu: ts, ramasse: bool }
// Il est FIGÉ pour l'élève — par le backend (ecrireScore ne le remplace plus) et, en service
// réel, par firestore.rules. Seul l'enseignant y touche, avec les deux gestes de ce fichier :
//
//   - RAMASSER : l'élève n'a pas rendu à la fin de l'heure. L'enseignant lit sa base (il en a le
//     droit en lecture), la fait noter par l'activité elle-même (`module.noter(base)`, les mêmes
//     jalons que la remise), et enregistre la copie au nom de l'élève, marquée `ramasse`.
//   - ROUVRIR : copie rendue par erreur, élève absent remplacé… Le résultat est effacé ; l'élève
//     rouvre la séance et reprend son travail là où il l'avait laissé (sa base n'est pas touchée).

export const estCopie = (meta) => !!(meta && meta.copie);
export const estRendue = (travail) => !!(travail && travail.rendu);

export const heureRendu = (ts) => new Date(ts)
  .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');

// « le 15/10 à 10 h 42 » : quand le jour peut différer de celui de la remise (infobulles d'alerte).
export const dateHeureRendu = (ts) => `le ${new Date(ts)
  .toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} à ${heureRendu(ts)}`;

// Signal du suivi (audit du 15/10/2026) : une copie REMISE PAR L'ÉLÈVE avant la première ouverture de la
// séance par l'enseignant n'a pas pu être faite dans l'application (écriture depuis la console). Une copie
// ramassée est écrite par l'enseignant, donc jamais suspecte. `ouvertLe` absent (séance ouverte avant que
// la date soit enregistrée) : pas d'alerte, on ne devine rien.
export const renduAvantOuverture = (travail, ouvertLe) =>
  estRendue(travail) && !travail.ramasse && typeof ouvertLe === 'number' && travail.rendu < ouvertLe;

// « rendue à 10 h 42 » / « ramassée à 11 h 00 », pour l'infobulle et la mention du suivi.
export function libelleRendu(travail) {
  if (!estRendue(travail)) return '';
  return `${travail.ramasse ? 'ramassée' : 'rendue'} à ${heureRendu(travail.rendu)}`;
}

// La base privée de l'élève, telle que l'enregistre `core/store.js` (texte JSON en service
// réel, objet en démonstration). `null` si l'élève n'a jamais ouvert la séance.
export async function baseDeLEleve(B, uid, jeuId) {
  const s = await B.lireJeuPrive(uid, jeuId);
  let brut = s ? s.data : null;
  if (typeof brut === 'string') { try { brut = JSON.parse(brut); } catch (e) { brut = null; } }
  return brut && Object.keys(brut).length ? brut : null;
}

// Ramasser la copie d'un élève. Rend `{ ok: true, travail }`, ou `{ ok: false, raison }` :
//   'rendue'  — déjà rendue ou ramassée (rien à faire) ;
//   'vide'    — l'élève n'a jamais ouvert la séance : pas de copie. Un absent garde son tiret ;
//               un présent qui n'a rien fait, l'enseignant lui met 0 comme ailleurs ;
//   'module'  — l'activité ne sait pas se noter hors de l'écran (pas de `noter`).
export async function ramasser(B, { gid, eleve, module }) {
  const meta = module.meta;
  if (typeof module.noter !== 'function') return { ok: false, raison: 'module' };
  const deja = await B.lireScore(gid, eleve.uid, meta.id);
  if (estRendue(deja)) return { ok: false, raison: 'rendue', travail: deja };
  const base = await baseDeLEleve(B, eleve.uid, meta.jeuId || meta.id);
  if (!base) return { ok: false, raison: 'vide' };
  const res = module.noter(base);
  const travail = await B.rendreCopie(gid, eleve.uid, meta.id, {
    score: res.score, max: res.max, detail: res.detail || null,
    nom: eleve.nom || '', prenom: eleve.prenom || '', ramasse: true,
  });
  return { ok: true, travail };
}

// Vérifier une copie rendue : on recalcule la note depuis le travail enregistré de l'élève (sa base
// privée) avec les mêmes jalons que la remise, et on la compare à la note enregistrée. Une lecture par
// élève : à ne lancer que sur demande (quota Firebase). Ne modifie rien. Rend `{ etat, recalcul }` :
//   'ok'        — le recalcul donne la même note ;
//   'ecart'     — la note enregistrée ne correspond pas au recalcul (`recalcul` = { score, max, … }) ;
//   'sans-base' — l'élève n'a aucun travail enregistré pour cette séance ;
//   'module'    — l'activité ne sait pas se recalculer (pas de `noter`).
export async function verifierCopie(B, { eleve, module, travail }) {
  if (typeof module.noter !== 'function') return { etat: 'module', recalcul: null };
  const meta = module.meta;
  const base = await baseDeLEleve(B, eleve.uid, meta.jeuId || meta.id);
  if (!base) return { etat: 'sans-base', recalcul: null };
  const res = module.noter(base);
  const ecart = Math.abs(res.score - travail.score) > 0.01 || res.max !== travail.max;
  return { etat: ecart ? 'ecart' : 'ok', recalcul: { score: res.score, max: res.max } };
}

// Rouvrir : le résultat part, l'élève peut reprendre et rendre de nouveau.
export async function rouvrir(B, { gid, uid, aid }) {
  await B.poserNote(gid, uid, aid, null);
}
