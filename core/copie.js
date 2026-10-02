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

// « rendue à 10 h 42 » / « ramassée à 11 h 00 », pour l'infobulle et la mention du suivi.
export function libelleRendu(travail) {
  if (!estRendue(travail)) return '';
  return `${travail.ramasse ? 'ramassée' : 'rendue'} à ${heureRendu(travail.rendu)}`;
}

// La base privée de l'élève, telle que l'enregistre `core/store.js` (texte JSON en service
// réel, objet en démonstration). `null` si l'élève n'a jamais ouvert la séance.
async function baseDeLEleve(B, uid, jeuId) {
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

// Rouvrir : le résultat part, l'élève peut reprendre et rendre de nouveau.
export async function rouvrir(B, { gid, uid, aid }) {
  await B.poserNote(gid, uid, aid, null);
}
