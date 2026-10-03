// Corrigé d'ENT-4.4 (Picard, le rush du lundi — évaluation), montré dans l'onglet « Corrigés » de
// l'enseignant.
//
// Chaque élève a reçu SON camion (tirage par élève, `contenus/picard-ent44.js`) : il n'y a pas de
// corrigé fixe. `CORRIGE` décrit la règle et la structure commune ; `corrigeEleve(base, uid)` rend le
// corrigé d'un élève — le camion reçu, l'attendu, sa réponse jalon par jalon et sa note — calculé
// depuis sa base (lue comme au ramassage des copies) et jamais recopié. Un élève qui n'a pas encore
// ouvert la séance : son camion se lit quand même (graine = son identifiant), sans réponse.

import { quaiDe, NOTE_ENT44 } from '../picard-ent44.js';
import { jalonsQuai, noteQuai, DECISIONS, libMotifs } from '../../core/types/quai.js';
import { graineDeBase } from '../../core/tirage.js';

const ALEA = {
  double: 'cartons manquants (couche du dessus) ET cartons écrasés (face arrière)',
  temp: 'température à cœur au-dessus de −15 °C (sonde)',
  produit: 'étiquette d’une autre référence que le BL',
  avarie: 'cartons écrasés, visibles seulement de l’arrière',
  couche: 'couche du dessus incomplète, conforme au BL',
  conforme: 'aucun',
};
const v1 = (n) => String(n).replace('.', ',').replace('-', '−');
const seuils = (L, f = 1) => L.map(([m, p]) => `≤ ${v1(Math.round(m * f * 10) / 10)} min : ${p} pt${p > 1 ? 's' : ''}`).join(' · ');

export const CORRIGE = {
  code: 'ENT-4.4',
  titre: 'Picard — le rush du lundi (évaluation)',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Un camion par élève', genre: 'question',
      texte: 'Pourquoi pas de corrigé unique ?',
      rep: 'Chaque élève reçoit un camion tiré pour lui (graine = son identifiant) : produits, dimensions des palettes, ordre des aléas, quantités, températures et moment de la remontée du ticket changent d’un élève à l’autre.',
      note: 'Choisissez un élève ci-dessus pour lire SON corrigé : le camion reçu, l’attendu et ce qu’il a fait.' },
    { etape: 1, etapeTitre: 'Un camion par élève', genre: 'tableau', texte: 'La structure commune (la même pour tous)',
      contexte: 'Six palettes, exactement ces six aléas, dans un ordre tiré ; un ticket avec une remontée qui a duré, à signaler.',
      entetes: ['Aléa', 'Décision attendue'],
      reponses: [
        ['Manquant + cartons écrasés sur la même palette', 'Accepter avec réserves — manquant + cartons endommagés (deux constats, deux quantités)'],
        ['Température à cœur au-dessus de −15 °C', 'Refuser — température (valeur relevée)'],
        ['Étiquette d’une autre référence', 'Refuser — produit différent (référence lue)'],
        ['Cartons écrasés seuls, face arrière', 'Accepter avec réserves — cartons endommagés (nombre)'],
        ['Couche du dessus incomplète, conforme au BL', 'Accepter'],
        ['Conforme', 'Accepter'],
      ] },
    { etape: 2, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: `${NOTE_ENT44.reception} points de réception (20 jalons) + 5 points de rapidité : 3 sur le temps hors froid (${seuils(NOTE_ENT44.horsFroid)}), 2 sur le temps réel (${seuils(NOTE_ENT44.reel)} ; × 4/3 en tiers-temps). Rapidité seulement si la réception est complète (tout décidé, lot rentré, BL signé), en proportion des palettes justes.`,
      note: 'Seuils du temps réel PROVISOIRES, réglables dans contenus/picard-ent44.js (NOTE_ENT44). Ne pas modifier la réserve de produits ni le tirage pendant l’évaluation : le camion de chaque élève changerait.' },
  ],
};

export function corrigeEleve(base, uid) {
  const db = base || {};
  const graine = graineDeBase(db) || String(uid || '');
  const Q = quaiDe(graine);
  const P = Q.camions[0].palettes;
  const ouvert = !!(db.quais && db.quais[Q.id]);
  const items = [
    { genre: 'tableau', texte: 'Le camion reçu par cet élève',
      contexte: `${Q.camions[0].fournisseur} (fictif), BL ${Q.camions[0].bl}, transporteur ${Q.camions[0].transporteur}. Ticket : une remontée qui a duré, à signaler.`,
      entetes: ['Palette', 'Produit', 'BL', 'Cartons réels', 'Aléa', 'Température', 'Décision attendue'],
      reponses: P.map((p) => [p.id, `${p.nom} (${p.ref})${p.etiq.ref !== p.ref ? ` — étiquette ${p.etiq.ref}` : ''}`, String(p.bl),
        `${p.W * p.D * p.L - p.manque.length} (${p.W} × ${p.D} × ${p.L}${p.manque.length ? ` − ${p.manque.length}` : ''})`,
        `${ALEA[p.alea] || p.alea}${Object.keys(p.avarie).length ? ` (${Object.keys(p.avarie).length} écrasé${Object.keys(p.avarie).length > 1 ? 's' : ''})` : ''}`,
        `${v1(p.temp.toFixed(1))} °C`, `${DECISIONS[p.attendu]} — ${libMotifs([p.motifAttendu, p.motif2Attendu].filter((m) => m && m !== 'aucun'))}`]) },
  ];
  if (!ouvert) {
    return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le camion qu’il recevra.', items };
  }
  const L = jalonsQuai(db, Q).L.filter((l) => l.compte);
  const n = noteQuai(db, Q);
  items.push({ genre: 'tableau', texte: 'Sa réception, jalon par jalon',
    entetes: ['Jalon', 'Ce que l’élève a fait', 'Attendu', ''],
    reponses: L.map((l) => [l.lib, l.fait, l.attendu, l.ok ? '✓ juste' : '✗ faux']) });
  items.push({ genre: 'question', texte: 'Sa note',
    rep: `${v1(Math.round(n.score * 10) / 10)} / ${n.max} — réception ${n.pts}/${n.nJalons} jalons (${v1(Math.round(n.reception * 10) / 10)} / ${NOTE_ENT44.reception}), rapidité ${v1(Math.round(n.vitesse * 10) / 10)} / ${n.max - NOTE_ENT44.reception}`,
    note: `${n.complet ? `Réception complète, ${n.justes}/${n.nPalettes} palettes justes.` : 'Réception incomplète : pas de points de rapidité.'} Temps hors froid : ${v1(n.froid)} min (${n.ptsFroid} pt). Temps réel : ${Math.floor(n.reel / 60)} min ${String(Math.floor(n.reel % 60)).padStart(2, '0')} (${n.ptsReel} pt${n.tiersTemps ? ', tiers-temps' : ''}). La note de la copie est celle enregistrée à la remise ou au ramassage.` });
  return { texte: '', items };
}
