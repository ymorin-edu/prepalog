// Corrigé d'ENT-12.1 (IKEA, « une commande, deux chemins »), montré dans l'onglet « Corrigés » de l'enseignant.
// Chaque élève a reçu SON ordre de départ (`contenus/ikea-ent121-donnees.js`) ; `CORRIGE` donne ce qui est commun, `corrigeEleve` le départ d'un élève.
// N'importe que les données pures : se charge aussi sous Node.

import { ID, TIRAGE, ARMOIRE, LAMPE, ARTICLES, MODES, libEtape, ordreDepart, ORDRE_ARMOIRE, ORDRE_LAMPE } from '../ikea-ent121-donnees.js';
import { FRANCE } from '../france-contours.js';

const REG = new Map(FRANCE.regions.map((r) => [r.code, r])), DEP = new Map(FRANCE.deps.map((d) => [d.code, d]));
const reg = REG.get('11'), dep = DEP.get('92');
const modeLib = (v) => (MODES.find((m) => m.v === v) || {}).lib || v;

export const CORRIGE = {
  code: 'ENT-12.1',
  titre: 'IKEA — une commande, deux chemins',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'La carte de France (4 points)', genre: 'question', texte: 'Où est le centre de distribution clients ?',
      rep: `Région ${reg.nom} (11) · département ${dep.nom} (92) · ville Gennevilliers, au nord-ouest de Paris, au bord de la Seine.`,
      note: 'Notés au PREMIER essai : la région et le département (2 points chacun). La ville se joue sans note. La carte ne se rejoue pas.' },
    { etape: 2, etapeTitre: 'Le chemin de l’armoire (4 points)', genre: 'question', texte: 'L’ordre juste des 7 étapes',
      rep: ARMOIRE.map((e) => e.lib).join(' → '),
      note: 'Départ mélangé par élève (au moins deux inversions). Ordre exact : 4 points, sinon 0.' },
    { etape: 3, etapeTitre: 'Le chemin de la lampe (3 points)', genre: 'question', texte: 'L’ordre juste des 6 étapes',
      rep: LAMPE.map((e) => e.lib).join(' → '),
      note: 'Départ mélangé par élève (au moins deux inversions). Ordre exact : 3 points, sinon 0. C’est le chemin que l’élève a vu chez Mondial Relay (S3).' },
    { etape: 4, etapeTitre: 'Pourquoi deux chemins ? (5 points)', genre: 'tableau', texte: 'Le mode de livraison de chaque article',
      entetes: ['Article', 'Mode attendu'],
      reponses: ARTICLES.map((a) => [`${a.lib} : ${a.detail}`, modeLib(a.mode)]),
      note: 'Lampe 1 point · armoire 2 points · canapé 2 points. La règle : un article de moins de 19 kg et 115 cm au plus peut voyager en Point Relais ou en colis ; sinon, livraison de meubles.' },
    { etape: 5, etapeTitre: 'Les questions de Claire (4 points)', genre: 'question', texte: 'Trois questions notées au fil du travail',
      rep: 'Pourquoi un centre au bord de la Seine (1,5) · la lampe non retirée en 6 jours : elle repart, le délai est de cinq jours (1,5, corrigée au bilan) · « devant chez vous » : le client monte lui-même, art. 4.1.2.1 (1).',
      note: 'Deux réflexions ne sont pas notées (la péniche et ses 300 000 km, le futur centre de Limay). « Avant de commencer » (trois questions tirées) n’est pas noté.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const items = [
    { genre: 'fait', texte: 'L’armoire : son ordre de départ', rep: ordreDepart(db, 'armoire').map((v) => libEtape(ARMOIRE, v)).join(' · ') },
    { genre: 'fait', texte: 'L’armoire : l’ordre juste', rep: ORDRE_ARMOIRE.map((v) => libEtape(ARMOIRE, v)).join(' → ') },
    { genre: 'fait', texte: 'La lampe : son ordre de départ', rep: ordreDepart(db, 'lampe').map((v) => libEtape(LAMPE, v)).join(' · ') },
    { genre: 'fait', texte: 'La lampe : l’ordre juste', rep: ORDRE_LAMPE.map((v) => libEtape(LAMPE, v)).join(' → ') },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
