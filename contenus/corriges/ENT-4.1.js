// Corrigé d'ENT-4.1 (Picard, le premier camion), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Pas de générateur Python ici : le corrigé est CALCULÉ à l'ouverture depuis les données de la
// séance et les jalons de la vue (`jalonsQuai`), jamais recopié. Une palette modifiée dans
// `contenus/picard-ent41.js` change donc le corrigé avec elle.

import { QUAI_ENT41, PALETTES_ENT41 } from '../picard-ent41.js';
import { jalonsQuai, DECISIONS, MOTIFS } from '../../core/types/quai.js';
import { CORRIGE as TRAME } from './ENT-4.1-trame.js';

// Le corrigé de la trame élève (généré, validée par Tristan le 03/10/2026), après celui calculé
// depuis la séance. Ses étapes sont celles de la trame : marquées « (trame) », sinon l'onglet
// Corrigés, qui regroupe par numéro d'étape, les mêlerait aux étapes de l'écran (mêmes numéros).
const DE_LA_TRAME = TRAME.items.map((it) => ({ ...it, etape: `${it.etape} (trame)` }));

const attendus = jalonsQuai({}, QUAI_ENT41).L;
const attendu = (id) => (attendus.find((l) => l.id === id) || {}).attendu || '';
const reel = (p) => p.W * p.D * p.L - p.manque.length;
const ALEA = {
  P1: 'couche du dessus incomplète mais conforme au BL',
  P2: 'cartons écrasés, visibles seulement en faisant le tour',
  P3: 'température à cœur trop haute (sonde)',
  P4: 'cartons manquants, dont un dans le coin du fond',
  P5: 'étiquette d’une autre référence que le BL',
};

export const CORRIGE = {
  code: 'ENT-4.1',
  titre: 'Picard — le premier camion',
  trame: TRAME.trame,
  items: [
    { etape: 1, etapeTitre: 'Le camion arrive', genre: 'question',
      texte: 'Que montre le ticket de l’enregistreur ?',
      rep: 'Une remontée qui a duré (de 03:45 à 04:45, jusqu’à −12,1 °C) : je la signale et je sonde chaque palette à cœur.',
      note: 'Lire le ticket portes fermées ne coûte aucun temps hors froid.' },
    { etape: 3, etapeTitre: 'Contrôle des palettes', genre: 'tableau', texte: 'Le contrôle de chaque palette',
      contexte: 'Comptage, aléa et décision attendue pour chaque palette (le jalon de décision exige aussi la palette sondée).',
      entetes: ['Palette', 'Produit', 'BL', 'Cartons réels', 'Aléa', 'Décision — motif'],
      reponses: PALETTES_ENT41.map((p) => [p.id, `${p.nom} (${p.ref})`, String(p.bl),
        `${reel(p)} (${p.W} × ${p.D} × ${p.L}${p.manque.length ? ` − ${p.manque.length}` : ''})`, ALEA[p.id] || '',
        `${DECISIONS[p.attendu]} — ${MOTIFS[p.motifAttendu]}`]) },
    { etape: 4, etapeTitre: 'Réserves et chambre froide', genre: 'tableau', texte: 'Les réserves écrites sur le BL',
      contexte: 'Les réserves attendues sur le BL, telles qu’elles s’écrivent à l’écran.',
      entetes: ['Palette', 'Ligne écrite sur le BL'],
      reponses: PALETTES_ENT41.filter((p) => p.attendu !== 'accepter').map((p) => [p.id, attendu(`${p.id}-reserve`)]) },
    { etape: 4, etapeTitre: 'Réserves et chambre froide', genre: 'question',
      texte: 'Dans quel ordre finir la réception ?',
      rep: 'Le froid d’abord, les papiers ensuite : rentrer le lot accepté en chambre froide (le temps hors froid s’arrête), puis écrire les réserves et faire signer le chauffeur. Ne pas ajouter « sous réserve de déballage ».',
      note: 'Parcours juste : 18 jalons, 20 min hors froid (repère 30 min). L’ordre froid / papiers n’est pas noté, seulement enseigné.' },
    ...DE_LA_TRAME,
  ],
};
