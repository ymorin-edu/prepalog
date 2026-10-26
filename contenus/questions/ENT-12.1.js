// Les questions d'ENT-12.1 — IKEA, « une commande, deux chemins » (brief `docs/briefs/ENT-12.1-ikea-une-commande-deux-chemins.md` §4 bis et §4 ter ; choix de Tristan du 26/10/2026 : propositions
// du brief prises telles quelles). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Claire est CONSTRUITE.
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions de Claire ») : `pourquoi-port` (au département posé, 1,5, corrigée tout de suite), `lampe-six-jours` (au mode de la
// lampe, 1,5, corrigée AU BILAN), `devant-chez-vous` (★ éco-droit, au mode de l'armoire, 1, corrigée tout de suite ; art. 4.1.2.1 des conditions de vente du 10/08/2026, déjà dans `cgv-122`).
// RÉFLEXIONS non notées : `peniche-km` (la péniche évite environ 300 000 km de camion par an : chiffre d'IKEA relevé le 26/10/2026, à citer « d'après IKEA ») et `limay` (le futur centre de Limay,
// pas encore ouvert en août 2026).
// « Avant de commencer » : NON noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6, corrigées à l'écran. Le droit de rétractation (14 jours) et la reprise d'un meuble usagé sont REFORMULÉS : aucun
// texte de loi n'est cité (non relus sur Légifrance). Les images du brief (photo de péniche) ne sont pas montrées.

import { apresGeste } from '../../core/declencheurs.js';
import { ID } from '../ikea-ent121-donnees.js';

const GROUPE = 'Les questions de Claire';
const CLAIRE = { nom: 'Claire', role: 'responsable du service livraison', appel: 'Claire' };
const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'claire', doc, rubrique, enonce, choix, juste, retour, ...o });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { claire: CLAIRE },
  ouverture: { id: 'avant-de-commencer', de: 'claire', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour et bienvenue ! Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['cdc-121', 'droit-121', 'cgv-122'],
    tirage: { preparation: 2, droit: 1 },
    questions: ['cdc', 'vad', 'relais', 'peniche', 'retract', 'gratuit'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    q('cdc', 'preparation', 'cdc-121', 'Un centre de distribution clients, c’est…',
      [{ v: 'entrepot', lib: 'un entrepôt qui prépare et expédie les commandes des clients' }, { v: 'magasin', lib: 'un magasin' }, { v: 'usine', lib: 'une usine' }], 'entrepot',
      'Le centre reçoit les articles des fournisseurs, les range, puis prépare et expédie la commande de chaque client.', { cle: true }),
    q('vad', 'preparation', 'cdc-121', 'Commander sur internet et se faire livrer, c’est…',
      [{ v: 'distance', lib: 'la vente à distance' }, { v: 'directe', lib: 'la vente directe' }, { v: 'libre', lib: 'le libre-service' }], 'distance',
      'Le client et le vendeur ne se voient pas : c’est de la vente à distance.', { cle: true }),
    q('relais', 'preparation', 'cdc-121', 'Un Point Relais, c’est…',
      [{ v: 'commerce', lib: 'un commerce qui garde ton colis pour que tu viennes le chercher' }, { v: 'poste', lib: 'un bureau de poste' }, { v: 'entrepot', lib: 'un entrepôt' }], 'commerce',
      'Une boutique, un commerce de quartier : il garde les colis en attendant le client.', { cle: true }),
    q('peniche', 'preparation', 'cdc-121', 'Une péniche transporte…',
      [{ v: 'fleuve', lib: 'des marchandises sur un fleuve ou un canal' }, { v: 'mer', lib: 'des passagers en mer' }, { v: 'avion', lib: 'des colis par avion' }], 'fleuve',
      'Une péniche est un bateau de rivière ou de canal : ici, elle remonte la Seine.', { cle: true }),
    // ── droit (2 : l'élève en reçoit 1)
    q('retract', 'droit', 'droit-121', 'Tu achètes sur internet. Tu as combien de temps pour changer d’avis ?',
      [{ v: '14', lib: '14 jours' }, { v: '7', lib: '7 jours' }, { v: 'aucun', lib: 'aucun délai' }], '14',
      'Pour un achat à distance, le client a 14 jours pour se rétracter (Code de la consommation).', { cle: true }),
    q('gratuit', 'droit', 'cgv-122', 'IKEA reprend ton vieux canapé quand il livre le neuf. C’est…',
      [{ v: 'obligation', lib: 'une règle pour le vendeur, dans la limite de ce qu’il vend' }, { v: 'cadeau', lib: 'un cadeau' }, { v: 'interdit', lib: 'interdit' }], 'obligation',
      'Un vendeur de meubles reprend un meuble usagé de même nature quand il en livre un neuf ; les conditions de vente d’IKEA en donnent les détails.', { cle: true }),
    // ── au fil du travail
    { id: 'pourquoi-port', type: 'fil', de: 'claire', quand: apresGeste('localiser:cdc:departement'), poids: 1.5, groupe: GROUPE,
      enonce: 'Pourquoi IKEA a-t-il installé ce centre à Gennevilliers, au bord de la Seine ?',
      choix: [{ v: 'seine', lib: 'Le fleuve et les routes permettent de livrer Paris par la péniche et par camion' }, { v: 'terrain', lib: 'Le terrain y est gratuit' }, { v: 'vue', lib: 'Pour la vue' }],
      juste: 'seine', retour: 'Gennevilliers est à côté de Paris, sur la Seine : depuis 2022, une péniche relie le centre au port de Bercy, ce qui évite des camions sur les routes.' },
    { id: 'peniche-km', type: 'fil', de: 'claire', quand: apresGeste(`fiche:armoire-121:armoire`), reflexion: true,
      enonce: 'D’après IKEA, la péniche évite environ 300 000 km de camion par an. Qu’est-ce que ça change pour Paris ?',
      choix: [{ v: 'camions', lib: 'Moins de camions dans les rues, et moins de CO₂' }, { v: 'vite', lib: 'Des livraisons plus rapides' }, { v: 'rien', lib: 'Rien du tout' }],
      retour: 'Moins de camions veut dire moins d’embouteillages et moins d’émissions de CO₂ : c’est l’intérêt du fleuve pour une ville. En revanche, la péniche n’est pas plus rapide.' },
    { id: 'lampe-six-jours', type: 'fil', de: 'claire', quand: apresGeste('fiche:chemins-121:mode_lampe'), apres: 'bilan', poids: 1.5, groupe: GROUPE,
      enonce: 'Mme Benali ne retire pas sa lampe en 6 jours. Que se passe-t-il ?',
      choix: [{ v: 'retour', lib: 'Le colis repart chez IKEA' }, { v: 'reste', lib: 'Il reste au Point Relais, sans limite' }, { v: 'jete', lib: 'Il est jeté' }],
      juste: 'retour', retour: 'Un colis reste cinq jours au Point Relais : passé ce délai, il repart. D’où l’intérêt de prévenir la cliente de ne pas tarder.' },
    { id: 'devant-chez-vous', type: 'fil', de: 'claire', quand: apresGeste('fiche:chemins-121:mode_armoire'), poids: 1, groupe: GROUPE,
      enonce: 'Mme Benali habite au 4e étage sans ascenseur. Avec la livraison « devant chez vous », qui monte l’armoire ?',
      choix: [{ v: 'elle', lib: 'Elle-même : « devant chez vous » dépose les colis devant la porte principale de l’immeuble (art. 4.1.2.1)' }, { v: 'livreur', lib: 'Le livreur, jusqu’à son appartement' }, { v: 'personne', lib: 'Personne : l’armoire reste dans le camion' }],
      juste: 'elle', retour: 'Article 4.1.2.1 : « devant chez vous » dépose les colis devant la porte principale de l’immeuble ; le client les transporte ensuite. Pour que le livreur monte l’armoire, il faut un autre mode.' },
    { id: 'limay', type: 'fil', de: 'claire', quand: apresGeste('fiche:chemins-121:envoyer'), apres: 'bilan', reflexion: true,
      enonce: 'IKEA prépare un deuxième centre à Limay, lui aussi au bord de la Seine (pas encore ouvert en août 2026). Pourquoi ouvrir un deuxième centre au bord de l’eau ?',
      choix: [{ v: 'fleuve', lib: 'Pour livrer aussi par le fleuve, comme à Gennevilliers' }, { v: 'place', lib: 'Pour avoir plus de place' }, { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les deux premières réponses se tiennent : un centre au bord du fleuve peut livrer par bateau, et un deuxième centre soulage le premier.' },
  ],
};
