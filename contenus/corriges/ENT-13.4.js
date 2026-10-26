// Corrigé d'ENT-13.4 (Stellantis, « ranger et compter selon ABC »), montré dans l'onglet « Corrigés » de l'enseignant. `CORRIGE` donne ce qui est commun ;
// `corrigeEleve(base)` rend le classement de CET élève, calculé depuis son tirage (jamais recopié). N'importe que les données pures : se charge aussi sous Node.

import { calcul, calculSorties, sorties, valeurLigne, PALETTES, LIGNES_COMPTAGE } from '../stellantis-ent134-donnees.js';
import { parRef } from '../stellantis.js';

export const CORRIGE = {
  code: 'ENT-13.4',
  titre: 'Stellantis Sochaux — ranger et compter selon ABC',
  trame: '(pas de trame : tout se fait à l’écran et dans le tableur)',
  items: [
    { etape: 1, etapeTitre: 'Ranger selon la rotation (4 points)', genre: 'question', texte: 'Quatre palettes',
      rep: 'P1 (clips, A) en travée 1, niveau 1 ou 2 · P2 (joints, B) en travée 2 · P3 (caches, C) en travée 3 ou 4 · P4 (rétroviseurs, C, lourde) en travée 3 ou 4 au SOL (niveau 1).',
      note: 'Un emplacement libre et en service ; la charge totale d’un niveau ne dépasse pas sa plaque.' },
    { etape: 2, etapeTitre: 'Classer sur la valeur (6 points)', genre: 'question', texte: 'Valeur, total, part, cumul, classe',
      rep: 'Valeur = Sorties × Prix unitaire (=D2*E2) · liste triée par valeur décroissante · total avec SOMME · part au format % · cumul · classe avec SI (80 % / 95 %).',
      note: 'La vis sort des milliers de fois et vaut quelques centimes (C en valeur) ; le rétroviseur sort quelques dizaines de fois et vaut 82 € (A en valeur).' },
    { etape: 3, etapeTitre: 'Compter les A (5 points)', genre: 'question', texte: 'Relevé saisi, écarts calculés, deux décisions',
      rep: 'Rétroviseur droit : −2, une caisse reposée sur l’emplacement des gauches → remettre en place, sans toucher au stock. Faisceau d’habitacle : −1, une sortie non scannée → régulariser, motif « Sortie non saisie ».',
      note: 'Les deux autres lignes (rétroviseur gauche, poignée extérieure) n’ont pas d’écart : « 0 » est la bonne réponse.' },
    { etape: 4, etapeTitre: 'Les questions notées (5 points)', genre: 'question', texte: 'Quelles références compter, deux classements, l’écart',
      rep: 'Les A en valeur (2) · les clips près de la sortie (1) · la vis A en sorties et C en valeur (1) · on cherche la cause avant de régulariser (1).',
      note: 'La question sur l’inventaire annuel (art. L123-12) n’est pas notée.' },
  ],
};

export function corrigeEleve(base) {
  const K = calcul(base), S = calculSorties(base);
  const L = sorties(base);
  const f = (x) => (x * 100).toFixed(1).replace('.', ',');
  const items = [
    { genre: 'fait', texte: 'Valeur totale (€)', rep: String(Math.round(K.total * 100) / 100).replace('.', ',') },
    ...K.ordre.map((ref, i) => { const l = L.find((x) => x.ref === ref); return { genre: 'fait', texte: `${i + 1}. ${ref} — ${parRef[ref].designation}`,
      rep: `${l.v} sorties × ${String(l.prix).replace('.', ',')} € = ${String(Math.round(valeurLigne(l) * 100) / 100).replace('.', ',')} € · part ${f(K.part[ref])} % · cumul ${f(K.cumul[ref])} % · classe ${K.classe[ref]} (en sorties : ${S.classe[ref]})` }; }),
    { genre: 'fait', texte: 'Les références à compter (A en valeur)', rep: K.ordre.filter((r) => K.classe[r] === 'A').join(', ') },
    ...LIGNES_COMPTAGE.map((l) => ({ genre: 'fait', texte: `${l.ref} : logiciel ${l.systeme}, compté ${l.compte}`, rep: l.attendu ? `${l.attendu === 'regul' ? 'Régulariser' : 'Remettre en place'}${l.motif ? ` (motif « ${l.motif} »)` : ''}` : 'aucun écart' })),
    ...PALETTES.map((p) => ({ genre: 'fait', texte: `${p.id} (${p.nom}), classe ${p.rotation}${p.contrainte ? ', lourde' : ''}`, rep: p.rotation === 'A' ? 'travée 1, niveau 1 ou 2' : p.rotation === 'B' ? 'travée 2' : `travée 3 ou 4${p.contrainte ? ', au sol' : ''}` })),
  ];
  return { texte: 'Classement de cet élève sur la valeur (calculé depuis son tirage).', items };
}
