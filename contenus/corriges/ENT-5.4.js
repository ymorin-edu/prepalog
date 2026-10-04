// Corrigé d'ENT-5.4 (Smoby, premier déchargement), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/smoby-ent54.js`) et les jalons de la
// vue quai (`jalonsQuai`) : constat de sécurité attendu, tableau des palettes, réserves écrites, message.
// Rien n'est recopié.

import { QUAI_ENT54, PALETTES_ENT54, SECURITE, PHRASES } from '../smoby-ent54.js';
import { jalonsQuai, DECISIONS, MOTIFS } from '../../core/types/quai.js';

// Les marques des mots cliquables (« [[cale|calé]] ») ne servent qu'à l'écran de la séance.
const net = (t) => String(t).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, m, a) => a || m);
const attendus = jalonsQuai({}, QUAI_ENT54).L;
const attendu = (id) => net((attendus.find((l) => l.id === id) || {}).attendu || '');
const reel = (p) => p.W * p.D * p.L - p.manque.length;
const ALEA = {
  P1: 'aucun',
  P2: 'couche du dessus incomplète mais conforme au BL',
  P3: 'carton écrasé, visible seulement de l’arrière (faire le tour)',
  P4: 'cartons manquants, dont un dans le coin du fond',
};
const juste = (l) => (l.texte != null ? l.texte : l.choix[l.juste]);

export const CORRIGE = {
  code: 'ENT-5.4',
  titre: 'Smoby — premier déchargement',
  items: [
    { etape: 0, etapeTitre: 'Avant de décharger', genre: 'tableau', texte: 'Le constat de sécurité',
      contexte: 'Jalon 1 : signaler la cale au chef de quai AVANT « Commencer à décharger ». Jalon 2 : chaque point jugé juste.',
      entetes: ['Point', 'Constat attendu'],
      reponses: SECURITE.points.map((x) => [net(x.lib), x.ok ? 'OK' : 'Pas OK → signaler']) },
    { etape: 3, etapeTitre: 'Contrôle des palettes', genre: 'tableau', texte: 'Le contrôle de chaque palette',
      contexte: 'Un jalon par palette : comptage ET décision justes.',
      entetes: ['Palette', 'Produit', 'BL', 'Cartons réels', 'Aléa', 'Décision — motif'],
      reponses: PALETTES_ENT54.map((p) => [p.id, `${p.nom} (${p.ref})`, String(p.bl),
        `${reel(p)} (${p.W} × ${p.D} × ${p.L}${p.manque.length ? ` − ${p.manque.length}` : ''})`, ALEA[p.id] || '',
        `${DECISIONS[p.attendu]} — ${MOTIFS[p.motifAttendu]}`]) },
    { etape: 4, etapeTitre: 'Réserves et zone de réception', genre: 'tableau', texte: 'Les réserves écrites sur le BL',
      contexte: 'Jalons 7 et 8 ; puis la signature du chauffeur (jalon 9). Pas de « sous réserve de déballage » (aucune valeur, non noté ici).',
      entetes: ['Palette', 'Ligne écrite sur le BL'],
      reponses: PALETTES_ENT54.filter((p) => p.attendu !== 'accepter').map((p) => [p.id, attendu(`${p.id}-reserve`)]) },
    { etape: 5, etapeTitre: 'Compte rendu à Bruno', genre: 'question', texte: 'Le message juste (phrases à choisir)',
      rep: PHRASES.lignes.map(juste).join(' '),
      note: 'Jalon 10 : seule la ligne des réserves est notée. Le dernier envoi compte.' },
  ],
};
