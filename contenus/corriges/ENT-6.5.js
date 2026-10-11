// Corrigé d'ENT-6.5 (France Boissons, ranger les fûts), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/france-boissons-ent65-donnees.js`), la vue Plan d'entrepôt (`bonnesReponses` :
// toutes les bonnes places sur le stock de départ) et le fichier de questions. Rien n'est recopié.

import { FIFO, MASSE, PALETTES, REGLES, POIDS, attenduLigne } from '../france-boissons-ent65-donnees.js';
import { QUESTIONS } from '../questions/ENT-6.5.js';
import { bonnesReponses } from '../../core/types/entrepot.js';

const net = (t) => String(t).replace(/<[^>]+>/g, '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, m, a) => a || m);
const libDe = (q) => (q.choix.find((c) => c.v === q.juste) || {}).lib || '';
const nomRef = (k) => MASSE.references[k].nom;
const places = bonnesReponses(MASSE);
const fil = QUESTIONS.liste.filter((q) => q.type !== 'ouverture');
const somme = Object.values(POIDS).reduce((t, p) => t + p, 0);
const parts = FIFO.parties.filter((p) => p.question);

export const CORRIGE = {
  code: 'ENT-6.5',
  titre: 'France Boissons — ranger les fûts',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Comprendre le FIFO', genre: 'tableau', texte: 'Les deux questions de l’animation (la première réponse compte)',
      contexte: 'Place de la bonne réponse tirée par élève. « Répondre de nouveau » et « Tout revoir » ne changent pas la première réponse.',
      entetes: ['Question', 'Réponse attendue', 'Explication montrée'],
      reponses: parts.map((p) => [p.question.enonce, p.question.choix[p.question.juste], p.question.explication]),
      note: `À retenir (affiché à la fin) : ${net(FIFO.aRetenir)}` },
    { etape: 2, etapeTitre: 'Ranger dans la zone de masse', genre: 'tableau', texte: 'Toutes les bonnes places, sur le stock de départ',
      contexte: 'Position 1 = le fond, niveau 1 = le sol. Une palette posée seule dans un couloir vide respecte toutes les règles : P2 et P4 sont '
        + 'justes aussi en M02 ou M06 (choix de Tristan du 11/10/2026) ; il ne reste alors qu’un couloir vide pour P1 et P3, et l’élève peut '
        + 'reprendre une palette avant de valider. Le bilan nomme le critère faux, jamais la bonne place.',
      entetes: ['Palette', 'Référence', 'Fûts', 'Bonnes places (toutes)'],
      reponses: PALETTES.map((p) => [p.id, nomRef(p.ref), String(p.futs), places[p.id].join(' ; ')]),
      note: `Les règles : ${REGLES.map(net).join(' ')}` },
    { etape: 3, etapeTitre: 'Entrée en stock', genre: 'tableau', texte: 'La fiche attendue (une ligne par palette)',
      contexte: 'Le couloir attendu est celui où l’élève a LUI-MÊME posé la palette (une erreur de rangement n’est pas comptée deux fois). '
        + 'Le lot et le stock avant ne sont pas notés à part (le stock avant est contenu dans le stock après).',
      entetes: ['Palette', 'Référence', 'Lot', 'Fûts entrés', 'Stock avant → après', 'Couloir'],
      reponses: PALETTES.map((p) => { const a = attenduLigne(p.id); return [p.id, nomRef(a.ref), a.lot, String(a.futs), `${a.avant} → ${a.apres}`, 'celui de l’élève']; }),
      note: 'Pièges : P2 est de la Pelforth (le BL annonce de l’Affligem) ; P3 n’a que 7 fûts (le 8e fuit, il est en zone litiges) ; P4 a 7 fûts (une place vide).' },
    { etape: 4, etapeTitre: 'Les questions', genre: 'tableau', texte: 'Les questions posées pendant la séance',
      contexte: 'Deux sont notées (3 points sur 20), une est pour réfléchir. Les questions de l’écran « Avant de commencer » ne comptent pas.',
      entetes: ['Question', 'Quand', 'Réponse attendue'],
      reponses: fil.map((q) => [net(q.enonce).slice(0, 110), q.reflexion ? 'pour réfléchir' : `notée ${q.poids}`, q.juste ? libDe(q) : 'sans réponse unique']) },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: `Jalons sur ${somme} points : comprendre le FIFO 3,5 (question 1 : 1,5, question 2 : 2), rangement 8,5 (P1 : 2,5, P2 : 2,5, P3 : 1,5, P4 : 2), `
        + 'entrée en stock 5 (P1 : 1, P2 : 1,5, P3 : 1,5, P4 : 1). Questions notées 3 (1,5 + 1,5). Total 20. C1.5 = 12, C1.6 = 8.',
      note: 'Rien n’est vrai sans geste : une palette non posée ou un rangement non validé est faux, une fiche non envoyée aussi. '
        + 'Règle du premier bilan : « Corriger » rouvre la fiche d’entrée en stock seulement (le rangement est figé à la validation).' },
  ],
};
