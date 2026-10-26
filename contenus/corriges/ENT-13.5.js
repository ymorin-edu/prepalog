// Corrigé d'ENT-13.5 (Stellantis, « évaluation de rentrée »), montré dans l'onglet « Corrigés » de l'enseignant. `CORRIGE` donne ce qui est commun ; `corrigeEleve(base)` rend le JEU de CET élève
// (son camion, son classement, son rangement, son écart), relu depuis sa graine : jamais recopié. N'importe que les données pures : se charge aussi sous Node.

import { jeuDeBase, calcul, sortiesDe, planDe, reserveAttendue, causeDe, RANGEMENT_JUSTE } from '../stellantis-ent135-donnees.js';
import { graineDeBase } from '../../core/tirage.js';
import { parRef } from '../stellantis.js';

export const CORRIGE = {
  code: 'ENT-13.5',
  titre: 'Stellantis Sochaux — évaluation de rentrée',
  trame: '(pas de trame : tout se fait à l’écran et dans le tableur)',
  items: [
    { etape: 1, etapeTitre: 'Contrôler le camion (3 points) et les réserves (2 points)', genre: 'question', texte: 'Cinq palettes, deux anomalies tirées',
      rep: 'Trois palettes conformes (accepter, aucune réserve). Une anomalie visible : cartons écrasés sur la face arrière (accepter avec réserves, motif avarie) OU couche du dessus incomplète mais conforme au bon (accepter, rien à signaler : le piège « tout refuser »). '
        + 'Une anomalie au bon : cartons manquants (accepter avec réserves, motif manquant) OU étiquette d’une autre référence (refuser, motif produit).',
      note: 'Réserves précises : nombre de cartons, référence, nature du dommage ; jamais « sous réserve de déballage » ; écrites avant la signature du chauffeur.' },
    { etape: 2, etapeTitre: 'Le classement ABC (5 points)', genre: 'question', texte: 'Cumul et classe',
      rep: 'Liste triée par sorties décroissantes, total avec SOMME, part au format %, cumul (cumul de la ligne du dessus + part), classe avec SI (80 % / 95 %). Un seul dépôt.',
      note: 'Les 15 références donnent toujours 3 A, 5 B et 7 C ; les trois premières références du magasin (par popularité) sont les A.' },
    { etape: 3, etapeTitre: 'Ranger (2 points)', genre: 'question', texte: 'Les trois palettes sans litige',
      rep: 'R1 (classe A) en travée 1, niveau 1 ou 2 · R2 (classe B) en travée 2 · R3 (classe C) en travée 3 ou 4. Un emplacement libre et en service ; la charge d’un niveau ne dépasse pas sa plaque.',
      note: 'La classe de rotation est sur la fiche de la palette (repli du brief §7.2).' },
    { etape: 4, etapeTitre: 'L’écart d’inventaire (2 points)', genre: 'question', texte: 'Une ligne, une cause',
      rep: 'Caisse reposée à côté : remettre en place, sans toucher au stock. Pièces sorties sans être scannées : régulariser, motif « Sortie non saisie ».', note: 'La cause est dans le message de Karim, après le calcul de l’écart.' },
    { etape: 5, etapeTitre: 'Les questions notées (6 points)', genre: 'question', texte: 'Avant de commencer (4) et trois questions au fil (2)',
      rep: 'Quatre questions tirées (réception, calcul ABC, inventaire, droit). Au fil : protestation motivée sous trois jours (L133-3) · « tes A » : leur nombre et leur part des sorties · pourquoi chercher la cause avant de régulariser.',
      note: 'Fausse : −1 ÷ (mauvaises réponses) ; « Je ne sais pas » : 0 ; plancher 0.' },
  ],
};

export function corrigeEleve(base) {
  const jeu = jeuDeBase(base);
  const K = calcul(base);
  const f = (x) => (x * 100).toFixed(1).replace('.', ',');
  const L = sortiesDe(base);
  const I = causeDe(base);
  const items = [
    ...jeu.palettes.map((p) => ({ genre: 'fait', texte: `${p.id} — ${p.nom} (étiquette ${p.etiq.ref}, ${p.bl} annoncés au bon)`,
      rep: p.attendu === 'accepter' ? (p.role === 'couche' ? 'accepter, sans réserve (couche incomplète mais conforme au bon)' : 'accepter, sans réserve')
        : `${p.attendu === 'refuser' ? 'refuser' : 'accepter avec réserves'}, motif ${p.motifAttendu} : ${p.motifAttendu === 'produit' ? `référence lue ${reserveAttendue(p)}` : `${reserveAttendue(p)} cartons`}` })),
    { genre: 'fait', texte: 'Total des sorties', rep: String(K.total) },
    ...K.ordre.map((ref, i) => { const l = L.find((x) => x.ref === ref); return { genre: 'fait', texte: `${i + 1}. ${ref} — ${parRef[ref].designation}`,
      rep: `${l.v} sorties · part ${f(K.part[ref])} % · cumul ${f(K.cumul[ref])} % · classe ${K.classe[ref]}` }; }),
    ...planDe(graineDeBase(base)).palettes.map((p) => ({ genre: 'fait', texte: `${p.id} (${p.nom}), classe ${p.rotation}`, rep: p.rotation === 'A' ? 'travée 1, niveau 1 ou 2' : p.rotation === 'B' ? 'travée 2' : 'travée 3 ou 4' })),
    { genre: 'fait', texte: `Inventaire : ${I.ref} (${parRef[I.ref].designation}) — logiciel ${I.systeme}, compté ${I.compte}`,
      rep: I.cause === 'regul' ? 'régulariser, motif « Sortie non saisie »' : 'remettre en place, sans toucher au stock' },
  ];
  return { texte: 'Le jeu de cet élève (calculé depuis son identifiant).', items };
}
export { RANGEMENT_JUSTE };
