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
 *   ouverts[id] absent     → le niveau décide
 *
 * Sans groupe (enseignant sans groupe actif), tout est visible.
 */
export function activiteVisible(meta, groupe) {
  if (!meta.pret) return false;
  if (!groupe) return true;
  const forcage = groupe.ouverts ? groupe.ouverts[meta.id] : undefined;
  if (forcage === false) return false;
  if (forcage === true) return true;
  const niveaux = meta.niveaux && meta.niveaux.length ? meta.niveaux : TOUS_NIVEAUX;
  if (!groupe.niveau) return true;            // groupe sans niveau : on n'exclut rien
  return niveaux.includes(groupe.niveau);
}

// Pourquoi les ÉLÈVES de ce groupe ne voient pas une activité, ou null s'ils la voient.
// Depuis le 02/10/2026 (demande de Tristan : « possible que les enseignants voient tout ? »),
// l'enseignant voit TOUTES les activités à l'accueil, y compris celles qu'il faut encore valider
// (`pret: false`) : c'est le seul moyen de les essayer dans le vrai site. Sa tuile dit alors ce
// que voient les élèves, pour qu'il ne croie pas une séance ouverte alors qu'elle ne l'est pas.
export function raisonCachee(meta, groupe) {
  if (!meta.pret) return 'en préparation';
  if (activiteVisible(meta, groupe)) return null;
  const forcage = groupe && groupe.ouverts ? groupe.ouverts[meta.id] : undefined;
  return forcage === false ? 'fermée pour ce groupe' : 'hors niveau du groupe';
}

// Vrai si l'activité ne correspond pas au niveau du groupe et n'est visible
// que parce que l'enseignant l'a forcée : utile pour le signaler dans son espace.
export function horsNiveau(meta, groupe) {
  if (!groupe || !groupe.niveau) return false;
  const niveaux = meta.niveaux && meta.niveaux.length ? meta.niveaux : TOUS_NIVEAUX;
  return !niveaux.includes(groupe.niveau);
}
