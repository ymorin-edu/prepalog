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
      contexte: 'Sécurité (4 points sur 20) : signaler la cale au chef de quai AVANT « Commencer à décharger » (3) ; chaque point jugé juste (1, une seule case).',
      entetes: ['Point', 'Constat attendu'],
      reponses: SECURITE.points.map((x) => [net(x.lib), x.ok ? 'OK' : 'Pas OK → signaler']) },
    { etape: 3, etapeTitre: 'Contrôle des palettes', genre: 'tableau', texte: 'Le contrôle de chaque palette',
      contexte: 'Deux cases par palette, jugées chacune seule : la décision avec son motif (1,25) et le comptage (0,75).',
      entetes: ['Palette', 'Produit', 'BL', 'Cartons réels', 'Aléa', 'Décision — motif'],
      reponses: PALETTES_ENT54.map((p) => [p.id, `${p.nom} (${p.ref})`, String(p.bl),
        `${reel(p)} (${p.W} × ${p.D} × ${p.L}${p.manque.length ? ` − ${p.manque.length}` : ''})`, ALEA[p.id] || '',
        `${DECISIONS[p.attendu]} — ${MOTIFS[p.motifAttendu]}`]) },
    { etape: 4, etapeTitre: 'Réserves et zone de réception', genre: 'tableau', texte: 'Les réserves écrites sur le BL',
      contexte: 'Une réserve juste vaut 2 points. Puis la signature du chauffeur (non notée). Pas de « sous réserve de déballage » (aucune valeur, non noté ici). Le BL signé ne se corrige plus.',
      entetes: ['Palette', 'Ligne écrite sur le BL'],
      reponses: PALETTES_ENT54.filter((p) => p.attendu !== 'accepter').map((p) => [p.id, attendu(`${p.id}-reserve`)]) },
    { etape: 5, etapeTitre: 'Compte rendu à Bruno', genre: 'question', texte: 'Le message juste (phrases à choisir)',
      rep: PHRASES.lignes.map(juste).join(' '),
      note: 'Les réserves 3 points, la salutation et la fin 0,5 chacune. C’est le seul envoi que « Corriger » rouvre.' },
  ],
};
