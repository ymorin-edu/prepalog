// Notes : un module, une note sur 20.
//
// Règle arrêtée le 01/10/2026. Tout module que le noyau corrige lui-même remonte au suivi
// de classe une NOTE SUR 20, quel que soit le nombre d'exercices qu'il contient. On lit
// « 14 / 20 », pas « 9 / 13 ».
//
// Pourquoi : un dénominateur qui change d'un module à l'autre — 13 pour le CAP OL, 10 pour
// les stocks, 6 pour l'inventaire — n'est comparable par personne, ni par l'élève qui veut
// savoir où il en est, ni par l'enseignant qui lit une ligne de tableau. Et il changeait
// aussi d'un ÉLÈVE à l'autre quand les exercices étaient filtrés par niveau : deux élèves
// de la même classe pouvaient être notés sur des totaux différents.
//
// Deux conséquences utiles :
//
// - le score brut reste enregistré tel quel (`score` et `max`). La note est calculée à
//   l'affichage. Rien n'est perdu, rien n'est à migrer, et la règle se change sans
//   toucher aux données déjà écrites ;
// - un module dont le nombre d'exercices change ne rend pas les anciennes notes
//   incomparables. 3 réussis sur 3 et 10 réussis sur 10 donnent tous les deux 20 / 20.
//
// Ne concerne PAS deux cas, et c'est volontaire :
//
// - `notation: 'prof'` — la note est saisie à la main, sur le barème que le module
//   déclare. La convertir reviendrait à retoucher ce que l'enseignant a écrit ;
// - `notation: 'avancement'` — ce sont des jalons franchis dans un environnement
//   d'entreprise, pas une note. « 3 / 3 » est l'information juste ; l'afficher 20 / 20
//   laisserait croire à une évaluation là où il n'y a qu'un état d'avancement.

export const BAREME_AFFICHE = 20;

/**
 * Note sur 20 à partir d'un score brut. Rend `null` si le calcul n'a pas de sens —
 * un max nul ou absent, un score non numérique — pour que l'appelant affiche « — »
 * plutôt qu'un NaN ou un faux zéro.
 */
export function noteSur20(score, max) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return null;
  if (typeof max !== 'number' || !Number.isFinite(max) || max <= 0) return null;
  // Arrondi au demi-point : une note de bulletin ne s'écrit pas avec trois décimales,
  // et le demi-point est le pas que l'enseignant utilise déjà dans sa saisie à la main.
  return Math.round((score / max) * BAREME_AFFICHE * 2) / 2;
}

/**
 * Le « meilleur » score à ranger quand un nouveau résultat arrive : le plus haut jamais écrit.
 * Quand le `max` a changé depuis (une séance dont on a refait le barème : ENT-5.1 est passée de 9 à 20 points,
 * 07/10/2026), l'ancien meilleur est converti en PROPORTION du nouveau max, sinon un élève à 9/9 s'afficherait
 * 9/20. L'élève garde sa note : jamais recalculée à la baisse.
 */
export function meilleurScore(anc, res) {
  const ancien = anc && typeof anc.meilleur === 'number' ? anc.meilleur : null;
  if (ancien === null) return res.score;
  let garde = ancien;
  if (typeof anc.max === 'number' && anc.max > 0 && typeof res.max === 'number' && res.max > 0 && anc.max !== res.max) {
    garde = Math.round((ancien / anc.max) * res.max * 1000) / 1000;
  }
  return Math.max(garde, res.score);
}

/**
 * Ce module remonte-t-il une note sur 20 ? Seuls ceux que le noyau corrige tout seul,
 * c'est-à-dire ceux qui ne déclarent pas de `notation`.
 */
export function noteConvertie(meta) {
  return !meta || !meta.notation;
}

/** « 13,5 » et non « 13.5 » : on écrit les nombres en français. */
export function formaterNote(n) {
  if (n === null || n === undefined) return '—';
  return String(n).replace('.', ',');
}

/**
 * Le texte complet d'une note sur 20, prêt à lire : « 13,5 / 20 ».
 * Sert partout où l'on n'a pas besoin de séparer la note de son barème.
 */
export function texteNoteSur20(score, max) {
  const n = noteSur20(score, max);
  return n === null ? '—' : `${formaterNote(n)} / ${BAREME_AFFICHE}`;
}
