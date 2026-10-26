// Corrigé d'ENT-13.3 (Stellantis, « la méthode ABC au tableur »), montré dans l'onglet « Corrigés » de l'enseignant. `CORRIGE` donne ce qui est commun ;
// `corrigeEleve(base)` rend le classement de CET élève, calculé depuis son tirage (jamais recopié). N'importe que les données pures : se charge aussi sous Node.

import { calcul, sorties, lesA } from '../stellantis-ent133-donnees.js';
import { parRef, REF_AU_MEILLEUR, MEILLEUR_EMPLACEMENT } from '../stellantis.js';

export const CORRIGE = {
  code: 'ENT-13.3',
  titre: 'Stellantis Sochaux — la méthode ABC au tableur',
  trame: '(pas de trame : tout se fait à l’écran et dans le tableur)',
  items: [
    { etape: 1, etapeTitre: 'Le total des sorties (2 points)', genre: 'question', texte: 'Total avec SOMME',
      rep: 'Une ligne « Total » (colonne Désignation) sous les références, et dans la colonne Sorties la formule =SOMME(…) de toutes les références.',
      note: 'Un total tapé à la main ne compte pas : la formule est exigée.' },
    { etape: 2, etapeTitre: 'La part de chaque référence (3 points)', genre: 'question', texte: 'Part = sorties ÷ total',
      rep: '=E2/E$20 (le total est fixé par le $), au format pourcentage : la cellule vaut 0,32 et affiche 32 %. Une part multipliée par 100 est refusée.',
      note: 'Le dépôt dit quelle ligne est fausse.' },
    { etape: 3, etapeTitre: 'Le cumul (4 points)', genre: 'question', texte: 'Pourcentage cumulé, liste triée',
      rep: 'Liste triée par sorties décroissantes ; cumul de la première = sa part, puis cumul de la ligne du dessus + part de la ligne. Une liste non triée donne des cumuls faux.',
      note: 'Le contrôle porte sur chaque référence : il vérifie le tri sans le dire (les tirages n’ont jamais d’égalité).' },
    { etape: 4, etapeTitre: 'La classe (4 points)', genre: 'question', texte: 'A, B ou C avec SI',
      rep: '=SI(G2<=80%;"A";SI(G2<=95%;"B";"C")). Classe écrite à la main : refusée.',
      note: 'Seuils de la séance : 80 % et 95 %, écrits dans la fiche méthode.' },
    { etape: 5, etapeTitre: 'Les questions notées (7 points)', genre: 'question', texte: 'Lire son classement, décider, le stock qui dort',
      rep: 'Combien de A et leur part des sorties (lus sur le fichier juste) · les A près de la sortie à hauteur d’homme (N2) · la référence C au meilleur emplacement se déplace (le faisceau de plafonnier) · le stock qui dort immobilise de l’argent. Réflexions non notées : le pari de départ, le transstockeur (chaque référence répartie sur les 4 allées).',
      note: 'Corrigées tout de suite. « Avant de commencer » n’est pas noté.' },
  ],
};

export function corrigeEleve(base) {
  const K = calcul(base);
  const L = sorties(base);
  const A = lesA(base);
  const r = parRef[REF_AU_MEILLEUR];
  const items = [
    { genre: 'fait', texte: 'Total des sorties', rep: String(K.total) },
    ...K.ordre.map((ref, i) => ({ genre: 'fait', texte: `${i + 1}. ${ref} — ${parRef[ref].designation}`,
      rep: `${L.find((x) => x.ref === ref).v} sorties · part ${(K.part[ref] * 100).toFixed(1).replace('.', ',')} % · cumul ${(K.cumul[ref] * 100).toFixed(1).replace('.', ',')} % · classe ${K.classe[ref]}` })),
    { genre: 'fait', texte: 'Ses A', rep: `${A.n} références sur ${A.total}, ${(A.part * 100).toFixed(1).replace('.', ',')} % des sorties : ${A.refs.join(', ')}` },
    { genre: 'fait', texte: 'La référence C au meilleur emplacement', rep: `${r.designation} (${r.ref}) occupe ${MEILLEUR_EMPLACEMENT} : classe ${K.classe[r.ref]} dans son classement` },
  ];
  return { texte: 'Classement de cet élève (calculé depuis son tirage).', items };
}
