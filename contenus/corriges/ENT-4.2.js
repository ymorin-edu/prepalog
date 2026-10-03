// Corrigé d'ENT-4.2 (Picard, deux camions, un seul quai), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance et les jalons de la vue (`jalonsQuai`), jamais
// recopié. Le parcours juste (camion A d'abord) se lit sur une base neuve ; l'autre ordre, sur une base
// où le camion A s'ouvre au plus tôt possible après B (14 min 30 de quai).

import { QUAI_ENT42, PALETTES_A, PALETTES_B } from '../picard-ent42.js';
import { jalonsQuai, DECISIONS, MOTIFS } from '../../core/types/quai.js';

const attendus = jalonsQuai({}, QUAI_ENT42).L;
const attendu = (id) => (attendus.find((l) => l.id === id) || {}).attendu || '';
// B d'abord : le camion A ne s'ouvre qu'après 14 min 30 de quai, au mieux.
const tard = jalonsQuai({ quais: { [QUAI_ENT42.id]: { minute: 14.5, ouvertA: 14.5, palettes: {}, suivants: [{}] } } }, QUAI_ENT42).L;
const attenduTard = (id) => (tard.find((l) => l.id === id) || {}).attendu || '';
const reel = (p) => p.W * p.D * p.L - (p.manque || []).length;
const ALEA = {
  A1: 'aucun', A2: 'deux références sur la palette : compter chacune (citron : 3 couches, framboise : 1)', A3: 'aucun',
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
    { etape: 3, etapeTitre: 'Contrôle des palettes', genre: 'tableau', texte: 'Le contrôle de chaque palette (camion A d’abord)',
      contexte: 'Comptage, aléa et décision attendue (le jalon de décision exige aussi la palette sondée ; pour B3, l’étiquette arrière lue).',
      entetes: ['Palette', 'Produit', 'BL', 'Cartons réels', 'Aléa', 'Décision — motif'],
      reponses: PAL.map((p) => [p.id,
        p.refs ? p.refs.map((r) => `${r.nom} (${r.ref})`).join(' + ') : `${p.nom} (${p.ref})`,
        p.refs ? p.refs.map((r) => r.bl).join(' + ') : String(p.bl),
        p.refs ? p.refs.map((r) => `${r.ref} : ${r.couches.length * p.W * p.D}`).join(' · ') : `${reel(p)} (${p.W} × ${p.D} × ${p.L}${(p.manque || []).length ? ` − ${p.manque.length}` : ''})`,
        ALEA[p.id] || '', attendu(`${p.id}-decision`)]) },
    { etape: 4, etapeTitre: 'Réserves et chambre froide', genre: 'tableau', texte: 'Les réserves écrites sur les BL (camion A d’abord)',
      contexte: 'Les lignes attendues, telles qu’elles s’écrivent à l’écran. Camion A : aucune ligne.',
      entetes: ['Palette', 'Ligne écrite sur le BL'],
      reponses: PAL.filter((p) => p.attendu !== 'accepter').map((p) => [p.id, attendu(`${p.id}-reserve`)]) },
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
