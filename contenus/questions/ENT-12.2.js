// Les questions d'ENT-12.2 — IKEA, « la demande de Mme Benali » (brief `docs/briefs/ENT-12.2-ikea-demande-de-mme-benali.md` §4 bis et §4 ter ; choix de Tristan du
// 26/10/2026 : propositions du brief prises telles quelles). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`.
// Claire et Mme Benali sont CONSTRUITES. Guidage : 4 questions notées (part 3 sur 20, 0,75 point chacune), corrigées tout de suite, et une réflexion non notée.
//
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6, corrigées à l'écran. Sur les cinq questions du brief §4 bis,
// la question ★ d'éco-droit (la vieille chaise) s'appuie sur l'article 14.2.2 des conditions de vente d'IKEA (version du 10/08/2026), jointe aux documents ;
// le texte de loi sur la reprise « un pour un » n'est pas cité (non relu à la source).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { ID, DIALOGUE_ID, FICHE_ID, MAIL_BENALI, situationDe } from '../ikea-ent122-donnees.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'claire', doc, rubrique, enonce, choix, juste, retour, ...o });

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: {
    claire: { nom: 'Claire', role: 'responsable du service livraison', appel: 'Claire' },
    benali: { nom: 'Leïla Benali', role: 'cliente', appel: 'Mme Benali' },
  },
  ouverture: { id: 'avant-de-commencer', de: 'claire', titre: 'Avant de commencer', continuer: 'voir l’accueil', calculette: true,
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['poste-122', 'cgv-122'],
    tirage: { preparation: 2, droit: 1 },
    questions: ['reformuler', 'acces', 'poids', 'creneau', 'promesse', 'fenetre'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    q('reformuler', 'preparation', 'poste-122', 'Au téléphone, reformuler la demande du client sert à…',
      [{ v: 'compris', lib: 'vérifier qu’on a bien compris' }, { v: 'temps', lib: 'gagner du temps' }, { v: 'attendre', lib: 'le faire attendre' }], 'compris',
      'Reformuler évite de livrer autre chose que ce que le client attend.', { cle: true }),
    q('acces', 'preparation', 'poste-122', 'Pour livrer une armoire au 4e étage, il faut savoir…',
      [{ v: 'escalier', lib: 's’il y a un ascenseur et si l’escalier est assez large' }, { v: 'porte', lib: 'la couleur de la porte' }, { v: 'age', lib: 'l’âge du client' }], 'escalier',
      'L’accès décide du mode de livraison : un meuble qui ne passe pas dans l’escalier ne se livre pas.', { cle: true }),
    q('poids', 'preparation', 'poste-122', 'Une commande de trois colis de 40 kg, 38 kg et 34 kg pèse…',
      [{ v: '112', lib: '112 kg' }, { v: '40', lib: '40 kg' }, { v: '3', lib: '3 kg' }], '112',
      '40 + 38 + 34 = 112 kg : c’est le poids qu’il faudra porter, pas celui d’un seul colis.', { cle: true }),
    q('creneau', 'preparation', 'poste-122', 'Un créneau de livraison, c’est…',
      [{ v: 'plage', lib: 'une plage horaire où le client attend le livreur' }, { v: 'prix', lib: 'le prix de la livraison' }, { v: 'nom', lib: 'le nom du livreur' }], 'plage',
      'Le client réserve une demi-journée : il faut la lui tenir.'),
    // ── droit (2 : l'élève en reçoit 1)
    q('promesse', 'droit', 'cgv-122', 'IKEA s’est engagé sur la date et le créneau. Le livreur arrive trois heures après la fin du créneau, sans prévenir. IKEA…',
      [{ v: 'engagement', lib: 'n’a pas tenu son engagement (art. 4.1.2 : « IKEA s’engage à vous livrer à la date et au créneau horaire que vous aurez choisi »)' },
        { v: 'rien', lib: 'n’a rien promis' }, { v: 'quand', lib: 'peut venir quand il veut' }], 'engagement',
      'Un créneau annoncé est un engagement : le tenir fait partie du service vendu.', { cle: true }),
    q('fenetre', 'droit', 'cgv-122', 'L’armoire ne passe pas dans l’escalier. Qui paie la livraison par la fenêtre ?',
      [{ v: 'cliente', lib: 'La cliente : IKEA n’assure pas la livraison par la fenêtre (art. 4.1.2)' }, { v: 'ikea', lib: 'IKEA' }, { v: 'livreur', lib: 'Le livreur' }], 'cliente',
      'D’où l’importance de demander l’accès avant : le client doit signaler les difficultés à l’achat.'),
    // ── au fil du travail
    { id: 'pourquoi-etage', type: 'fil', de: 'claire', groupe: 'L’appel : écouter la cliente', quand: apresGeste(`dialogue:${DIALOGUE_ID}:acces`),
      enonce: 'Pourquoi l’étage compte-t-il pour le transport ?',
      choix: [{ v: 'livreurs', lib: 'Il faut deux livreurs et plus de temps pour monter un meuble lourd' }, { v: 'prix', lib: 'Le prix du meuble change selon l’étage' }, { v: 'rien', lib: 'Il ne compte pas pour le transport' }],
      juste: 'livreurs', retour: 'Chaque étage sans ascenseur ajoute du temps et des bras : c’est ce qui fait choisir « dans la pièce de votre choix » plutôt que « devant chez vous ».' },
    { id: 'pourquoi-pas-relais', type: 'fil', de: 'claire', groupe: 'Le mode de livraison', quand: apresGeste(`fiche:${FICHE_ID}:mode_armoire`),
      enonce: 'Ton armoire pèse 112 kg en trois colis. Pourquoi pas le Point Relais ?',
      selon: (db) => ({ enonce: `Ton armoire pèse ${situationDe(db).kgArmoire} kg en trois colis. Pourquoi pas le Point Relais ?` }),
      choix: [{ v: 'poids', lib: 'Chaque colis dépasse les 19 kg autorisés au Point Relais' }, { v: 'cher', lib: 'Le Point Relais coûte trop cher' }, { v: 'loin', lib: 'Le Point Relais est trop loin de chez elle' }],
      juste: 'poids', retour: 'Au Point Relais, chaque article doit peser moins de 19 kg : un colis de 40 kg n’y entre pas.' },
    { id: 'chaise', type: 'fil', de: 'claire', groupe: 'L’appel : écouter la cliente', quand: apresGeste(`dialogue:${DIALOGUE_ID}:reprise`),
      enonce: 'Mme Benali veut aussi faire reprendre une vieille chaise. IKEA doit-il la reprendre ?',
      choix: [{ v: 'nature', lib: 'Non : la reprise vise un meuble de même nature que celui qu’elle achète (art. 14.2.2), et une chaise n’est pas un canapé' },
        { v: 'tout', lib: 'Oui : IKEA reprend tous les anciens meubles' }, { v: 'paie', lib: 'Oui, si elle paie la reprise' }],
      juste: 'nature', retour: 'Article 14.2.2 : meuble de même nature que le produit acheté, démonté, plus de deux mètres en tout. Une promesse trop large, c’est un livreur qui ne peut pas la tenir.' },
    { id: 'economie-membre', type: 'fil', de: 'claire', groupe: 'Le mode de livraison', quand: apresFiche(FICHE_ID),
      enonce: 'Mme Benali devient membre IKEA Family. Combien économise-t-elle sur cette livraison ?',
      choix: [{ v: 'juste', lib: '25 €' }, { v: 'relais', lib: '5 €' }, { v: 'piece', lib: '20 €' }, { v: 'plus', lib: '35 €' }],
      juste: 'juste', retour: '7 − 2 = 5 € sur la lampe, 20 € d’écart sur les meubles dans les deux tranches (80 − 60, 100 − 80) : 25 €. On compare le même mode au tarif non-membre et au tarif membre, pour la lampe et pour les meubles, puis on additionne.' },
    { id: 'absente-72h', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_BENALI }),
      enonce: 'Mme Benali est absente le jour de la livraison. Jusqu’à quand peut-elle prévenir ?',
      choix: [{ v: '72h', lib: 'Au plus tard 72 heures avant la livraison' }, { v: 'veille', lib: 'La veille' }, { v: 'jour', lib: 'Le jour même' }],
      retour: 'Les conditions de vente demandent de reprogrammer au plus tard 72 heures avant la date prévue (art. 4.1.2) : c’est pourquoi on le rappelle dans le message.' },
  ],
};
