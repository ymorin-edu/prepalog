// Niveaux de classe.
//
// Règle retenue : un élève appartient à un groupe, un groupe porte un niveau.
// Une activité déclare le ou les niveaux auxquels elle s'adresse.
// L'enseignant garde le dernier mot : il peut forcer l'ouverture d'une activité
// d'un autre niveau pour un groupe donné, ou en fermer une qui correspondait.

export const NIVEAUX = [
  { id: '2de', label: 'Seconde GATL', court: '2de' },
  { id: '1re', label: 'Première Bac Pro', court: '1re' },
  { id: 'tle', label: 'Terminale Bac Pro', court: 'Tle' },
  { id: 'cap', label: 'CAP Opérateur logistique', court: 'CAP' },
];

export const TOUS_NIVEAUX = NIVEAUX.map((n) => n.id);

export function niveau(id) {
  return NIVEAUX.find((n) => n.id === id) || null;
}

export function libelleNiveau(id) {
  return niveau(id)?.label || id || '—';
}

export function courtNiveau(id) {
  return niveau(id)?.court || id || '—';
}

// Libellé compact d'une liste de niveaux : « 1re · Tle », ou « tous niveaux ».
export function libelleNiveaux(liste) {
  const l = liste && liste.length ? liste : TOUS_NIVEAUX;
  if (l.length >= TOUS_NIVEAUX.length) return 'tous niveaux';
  return l.map(courtNiveau).join(' · ');
}

/**
 * Un contenu déclarant `niveaux` concerne-t-il ce niveau de classe ?
 *
 * Sert aux activités qui portent une série d'exercices de difficulté inégale : chaque
 * exercice déclare ses niveaux, et l'élève ne voit que les siens. Sans niveau de groupe
 * connu — un enseignant sans groupe actif, par exemple — tout est concerné.
 */
export function concerneNiveau(niveaux, niveauGroupe) {
  if (!niveauGroupe) return true;
  const l = niveaux && niveaux.length ? niveaux : TOUS_NIVEAUX;
  return l.includes(niveauGroupe);
}

/**
 * Une activité est-elle visible pour un groupe ?
 *
 *   ouverts[id] === true   → forcée ouverte, même hors niveau
 *   ouverts[id] === false  → fermée, même si le niveau correspond
 *   ouverts[id] absent     → le niveau décide — sauf `meta.ouverture === 'prof'` : fermée
 *
 * `ouverture: 'prof'` (03/10/2026, brief `MOTEUR-ouverture-par-enseignant`) : la séance est
 * construite et validée (`pret: true`), mais aucun élève ne la voit tant que l'enseignant ne l'a
 * pas cochée pour son groupe dans « Conduite de séance ». Ouvrir une séance ne demande plus de
 * commit. Sans ce champ, rien ne change.
 *
 * Sans groupe (enseignant sans groupe actif), tout est visible.
 */
export const ouvertureParProf = (meta) => !!meta && meta.ouverture === 'prof';

// Demi-groupes (brief MOTEUR-demi-groupes, 06/10/2026). Une classe peut être coupée en
// demi-groupes (1L → 1L1 / 1L2), rangés DANS le document du groupe comme les équipes :
//   demis: [{ id, nom }]          — l'id est technique et stable, le nom libre et renommable ;
//   demiDe: { uid: idDemi }       — affectation des élèves (absent = aucun demi-groupe) ;
//   ouvertsDemi: { idDemi: { aid: bool } } — ouverture propre à un demi-groupe.
export const demisDe = (groupe) => (groupe && Array.isArray(groupe.demis) ? groupe.demis : []);
export const nomDemi = (groupe, id) => demisDe(groupe).find((d) => d.id === id)?.nom || '';

// Le demi-groupe d'un élève dans cette classe, ou null. Une affectation à un demi-groupe qui
// n'existe plus ne compte pas : l'élève suit alors la classe.
export function demiDe(groupe, uid) {
  const id = groupe && groupe.demiDe ? groupe.demiDe[uid] : null;
  return id && demisDe(groupe).some((d) => d.id === id) ? id : null;
}

// Le réglage d'ouverture qui s'applique : celui du demi-groupe s'il en porte un pour cette
// activité, sinon celui de la classe. « Toute la classe » reste le réglage par défaut, le
// demi-groupe ne fait que le contredire.
export function forcage(meta, groupe, demi) {
  if (!groupe) return undefined;
  const d = demi && groupe.ouvertsDemi ? groupe.ouvertsDemi[demi] : null;
  if (d && typeof d[meta.id] === 'boolean') return d[meta.id];
  return groupe.ouverts ? groupe.ouverts[meta.id] : undefined;
}

// `demi` : l'id du demi-groupe de l'élève (ou de celui que l'enseignant règle), sinon rien.
export function activiteVisible(meta, groupe, demi) {
  if (!meta.pret) return false;
  if (!groupe) return true;
  const f = forcage(meta, groupe, demi);
  if (f === false) return false;
  if (f === true) return true;
  if (ouvertureParProf(meta)) return false;   // pas encore cochée pour ce groupe
  const niveaux = meta.niveaux && meta.niveaux.length ? meta.niveaux : TOUS_NIVEAUX;
  if (!groupe.niveau) return true;            // groupe sans niveau : on n'exclut rien
  return niveaux.includes(groupe.niveau);
}

// Pourquoi les ÉLÈVES de ce groupe ne voient pas une activité, ou null s'ils la voient.
// Depuis le 02/10/2026 (demande de Tristan : « possible que les enseignants voient tout ? »),
// l'enseignant voit TOUTES les activités à l'accueil, y compris celles qu'il faut encore valider
// (`pret: false`) : c'est le seul moyen de les essayer dans le vrai site. Sa tuile dit alors ce
// que voient les élèves, pour qu'il ne croie pas une séance ouverte alors qu'elle ne l'est pas.
// Une séance fermée à la classe mais ouverte à un demi-groupe le dit (« ouverte pour 1L1 seulement »).
export function raisonCachee(meta, groupe, demi) {
  if (!meta.pret) return 'en préparation';
  if (activiteVisible(meta, groupe, demi)) return null;
  if (!demi) {
    const ouverts = demisDe(groupe).filter((d) => activiteVisible(meta, groupe, d.id)).map((d) => d.nom);
    if (ouverts.length) return `ouverte pour ${ouverts.join(', ')} seulement`;
  }
  if (forcage(meta, groupe, demi) === false) return 'fermée pour ce groupe';
  return ouvertureParProf(meta) ? 'pas encore ouverte à ce groupe' : 'hors niveau du groupe';
}

// Vrai si l'activité ne correspond pas au niveau du groupe et n'est visible
// que parce que l'enseignant l'a forcée : utile pour le signaler dans son espace.
export function horsNiveau(meta, groupe) {
  if (!groupe || !groupe.niveau) return false;
  const niveaux = meta.niveaux && meta.niveaux.length ? meta.niveaux : TOUS_NIVEAUX;
  return !niveaux.includes(groupe.niveau);
}
