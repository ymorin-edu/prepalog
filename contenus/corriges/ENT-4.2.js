// Corrigé d'ENT-4.2 (Picard, deux camions, un seul quai), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance et les jalons de la vue (`jalonsQuai`), jamais
// recopié. Le parcours juste (camion A d'abord) se lit sur une base où A s'ouvre à 4 min ; l'autre ordre, sur une base
// où le camion A s'ouvre au plus tôt possible après B (14 min 30 de quai).

import { QUAI_ENT42, PALETTES_A, PALETTES_B } from '../picard-ent42.js';
import { jalonsQuai, DECISIONS, MOTIFS } from '../../core/types/quai.js';

// A d'abord : le camion A s'ouvre après les deux tickets (4 min de quai), ses glaces à −17,5 °C.
const attendus = jalonsQuai({ quais: { [QUAI_ENT42.id]: { minute: 4, ouvertA: 4, palettes: {}, suivants: [{}] } } }, QUAI_ENT42).L;
const attendu = (id) => (attendus.find((l) => l.id === id) || {}).attendu || '';
// B d'abord : le camion A ne s'ouvre qu'après 14 min 30 de quai, au mieux.
const tard = jalonsQuai({ quais: { [QUAI_ENT42.id]: { minute: 14.5, ouvertA: 14.5, palettes: {}, suivants: [{}] } } }, QUAI_ENT42).L;
const attenduTard = (id) => (tard.find((l) => l.id === id) || {}).attendu || '';
const reel = (p) => p.W * p.D * p.L - (p.manque || []).length;
const ALEA = {
  A1: 'groupe froid faible : −17,5 °C à cœur (entre −18 et −15 °C)', A2: 'deux références : compter chacune (citron : 3 couches, framboise : 1) ; −17,5 °C à cœur',
  A3: 'groupe froid faible : −17,5 °C à cœur (entre −18 et −15 °C)',
  B1: 'aucun', B2: 'trop chaude à cœur malgré un ticket parfait (sonde)', B3: 'étiquette avant déchirée ; l’arrière dit CFL-1000',
  B4: '1 carton manquant dans le coin du fond, en haut', B5: 'aucun',
};
const PAL = PALETTES_A.concat(PALETTES_B);
const ordre = QUAI_ENT42.ordre;

export const CORRIGE = {
  code: 'ENT-4.2',
  titre: 'Picard — deux camions, un seul quai',
  trame: '(pas encore de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Les camions arrivent', genre: 'question',
      texte: 'Que montrent les deux tickets ?',
      rep: `Camion A : ${attendu('ticket-A')} (la température de l’air remonte de plus en plus vite sur la dernière heure, jusqu’à −17,4 °C à l’arrivée). Camion B : ${attendu('ticket-B')}.`,
      note: 'Chaque ticket coûte 2 min de quai ; le choix de l’ordre ne s’ouvre qu’une fois les deux lus.' },
    { etape: 1, etapeTitre: 'Les camions arrivent', genre: 'question',
      texte: ordre.question,
      rep: `${attendu('ordre')}.`,
      note: 'Si B passe d’abord, le camion A attend porte fermée et gagne 0,25 °C par minute : au plus tôt, il s’ouvre après 14 min 30, ses glaces sont à −14,9 °C à cœur et sont à refuser. Le jalon lit la température réellement sondée.' },
    { etape: 3, etapeTitre: 'Contrôle des palettes', genre: 'question',
      texte: 'La règle du quai pour la température à cœur (construite pour l’exercice)',
      rep: '−18 °C ou plus froid : accepter. Entre −18 et −15 °C : accepter avec réserves, en écrivant la température relevée. Au-dessus de −15 °C : refuser.',
      note: 'Vérifié : −18 °C exigé en tout point, tolérance brève jusqu’à −15 °C au déchargement. Les trois zones sont la règle de ce quai.' },
    { etape: 3, etapeTitre: 'Contrôle des palettes', genre: 'tableau', texte: 'Le contrôle de chaque palette (camion A d’abord)',
      contexte: 'Comptage, aléa et décision attendue (le jalon de décision exige aussi la palette sondée ; pour B3, l’étiquette arrière lue).',
      entetes: ['Palette', 'Produit', 'BL', 'Cartons réels', 'Aléa', 'Décision — motif'],
      reponses: PAL.map((p) => [p.id,
        p.refs ? p.refs.map((r) => `${r.nom} (${r.ref})`).join(' + ') : `${p.nom} (${p.ref})`,
        p.refs ? p.refs.map((r) => r.bl).join(' + ') : String(p.bl),
        p.refs ? p.refs.map((r) => `${r.ref} : ${r.couches.length * p.W * p.D}`).join(' · ') : `${reel(p)} (${p.W} × ${p.D} × ${p.L}${(p.manque || []).length ? ` − ${p.manque.length}` : ''})`,
        ALEA[p.id] || '', attendu(`${p.id}-decision`)]) },
    { etape: 4, etapeTitre: 'Réserves et chambre froide', genre: 'tableau', texte: 'Les réserves écrites sur les BL (camion A d’abord)',
      contexte: 'Les lignes attendues, telles qu’elles s’écrivent à l’écran (camion A ouvert à 4 min : −17,5 °C à cœur).',
      entetes: ['Palette', 'Ligne écrite sur le BL'],
      reponses: PAL.map((p) => [p.id, attendu(`${p.id}-reserve`)]).filter((r) => r[1] && !/^aucune ligne/.test(r[1])) },
    { etape: 4, etapeTitre: 'Réserves et chambre froide', genre: 'tableau', texte: 'Si le camion B a été déchargé d’abord',
      contexte: 'Valeurs au plus tôt (camion A ouvert à 14 min 30 de quai) : la température réelle se lit à la sonde.',
      entetes: ['Palette', 'Décision — motif', 'Ligne écrite sur le BL'],
      reponses: PALETTES_A.map((p) => [p.id, attenduTard(`${p.id}-decision`), attenduTard(`${p.id}-reserve`)]) },
    { etape: 4, etapeTitre: 'Réserves et chambre froide', genre: 'question',
      texte: 'Dans quel ordre finir chaque réception ?',
      rep: 'Pour chaque camion : le froid d’abord, les papiers ensuite. Rentrer le lot accepté en chambre froide (son temps hors froid s’arrête), puis écrire les réserves et faire signer le chauffeur. Le second camion ne se met à quai qu’une fois le premier reparti (BL signé). Ne jamais ajouter « sous réserve de déballage ».',
      note: `Parcours juste : ${attendus.filter((l) => l.compte).length} jalons. L’ordre froid / papiers n’est pas noté, seulement rappelé au bilan.` },
  ],
};
