// Les questions d'ENT-12.7 — IKEA, évaluation « la livraison de ta cliente » (brief `docs/briefs/ENT-12.7-ikea-evaluation-transport.md` §4, §4 bis ; choix de Tristan du 26/10/2026 :
// propositions du brief prises telles quelles). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Claire est CONSTRUITE.
//
// ÉVALUATION, comme ENT-12.8. « Avant de commencer » : NOTÉ (`part: 4` sur 20), sans aide ni mot cliquable ; l'élève reçoit quatre questions tirées (2 de préparation, 2 de droit) parmi
// huit ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0 ; « Réponse enregistrée. » sans correction. Les questions de 12.2 et 12.3 sont reprises, SANS
// la mention de l'article dans leur choix (en évaluation, elle donnerait la réponse). Les TROIS questions du brief §4 bis, au fil du travail, sont des RÉFLEXIONS non notées, sans retour
// montré (« Merci, je note ») : les 20 points sont déjà distribués (le point « questions au fil » du brief a été donné à la nouvelle date proposée aux clients).
// La question d'éco-droit appliquée au cas est `annuler-demain` (art. L216-6 reformulé d'après la fiche pratique de la DGCCRF, lue le 26/10/2026 ; le texte de loi n'est pas cité).

import { apresPlanning, apresFiche } from '../../core/declencheurs.js';
import { ID, PL, FICHE_MODE, FICHE_PREVENIR, jeuDeBase, clienteDe, kg } from '../ikea-ent127-donnees.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'claire', doc, rubrique, enonce, choix, juste, retour, ...o });

export const QUESTIONS = {
  id: ID,
  personnes: { claire: { nom: 'Claire', role: 'responsable du service livraison', appel: 'Claire' } },
  ouverture: { id: 'avant-de-commencer', de: 'claire', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions, sans aide.',
    documents: ['poste-127', 'cgv-122', 'droit-123'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['reformuler', 'acces', 'poids', 'engagement', 'promesse', 'fenetre', 'annuler', 'essentielle'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    q('reformuler', 'preparation', 'poste-127', 'Au téléphone, reformuler la demande du client sert à…',
      [{ v: 'compris', lib: 'vérifier qu’on a bien compris' }, { v: 'temps', lib: 'gagner du temps' }, { v: 'attendre', lib: 'le faire attendre' }], 'compris',
      'Reformuler évite de livrer autre chose que ce que le client attend.', { cle: true }),
    q('acces', 'preparation', 'poste-127', 'Pour livrer une armoire au 4e étage, il faut savoir…',
      [{ v: 'escalier', lib: 's’il y a un ascenseur et si l’escalier est assez large' }, { v: 'porte', lib: 'la couleur de la porte' }, { v: 'age', lib: 'l’âge du client' }], 'escalier',
      'L’accès décide du mode de livraison : un meuble qui ne passe pas dans l’escalier ne se livre pas.', { cle: true }),
    q('poids', 'preparation', 'poste-127', 'Une commande de trois colis de 40 kg, 38 kg et 34 kg pèse…',
      [{ v: '112', lib: '112 kg' }, { v: '40', lib: '40 kg' }, { v: '3', lib: '3 kg' }], '112',
      '40 + 38 + 34 = 112 kg : c’est le poids qu’il faudra porter, pas celui d’un seul colis.', { cle: true }),
    q('engagement', 'preparation', 'poste-127', 'Le client a choisi un créneau de 14 h à 16 h. L’engagement est tenu si le livreur arrive…',
      [{ v: 'creneau', lib: 'entre 14 h et 16 h' }, { v: 'avant18', lib: 'avant 18 h' }, { v: 'lendemain', lib: 'le lendemain' }], 'creneau',
      'IKEA s’est engagé sur le créneau : le tenir fait partie du service vendu.', { cle: true }),
    // ── droit (4 : l'élève en reçoit 2)
    q('promesse', 'droit', 'cgv-122', 'IKEA s’est engagé sur la date et le créneau. Le livreur arrive trois heures après la fin du créneau, sans prévenir. IKEA…',
      [{ v: 'engagement', lib: 'n’a pas tenu son engagement' }, { v: 'rien', lib: 'n’a rien promis' }, { v: 'quand', lib: 'peut venir quand il veut' }], 'engagement',
      'Un créneau annoncé est un engagement : le tenir fait partie du service vendu.', { cle: true }),
    q('fenetre', 'droit', 'cgv-122', 'Un meuble ne passe pas dans l’escalier. Qui paie la livraison par la fenêtre ?',
      [{ v: 'client', lib: 'Le client : IKEA n’assure pas la livraison par la fenêtre' }, { v: 'ikea', lib: 'IKEA' }, { v: 'livreur', lib: 'Le livreur' }], 'client',
      'D’où l’importance de demander l’accès avant : le client doit signaler les difficultés à l’achat.'),
    q('annuler', 'droit', 'droit-123', 'Le vendeur ne livre pas à la date promise. Le client peut annuler…',
      [{ v: 'delai', lib: 'après avoir laissé au vendeur un délai supplémentaire raisonnable, par écrit' }, { v: 'toujours', lib: 'tout de suite, toujours' }, { v: 'jamais', lib: 'jamais' }], 'delai',
      'Le client demande d’abord au vendeur de livrer dans un délai raisonnable. Si le vendeur ne livre pas dans ce délai, le client peut mettre fin au contrat.', { cle: true }),
    q('essentielle', 'droit', 'droit-123', 'Un client commande un meuble pour son mariage, le 5 juin, et l’a dit au vendeur. Livraison le 8 juin. Il peut annuler…',
      [{ v: 'tout-de-suite', lib: 'tout de suite : la date était essentielle' }, { v: 'delai', lib: 'seulement après un délai supplémentaire' }, { v: 'non', lib: 'non, jamais' }], 'tout-de-suite',
      'Quand la date est une condition essentielle du contrat (dite au vendeur), le client n’a pas à attendre.'),
    // ── au fil du travail : trois réflexions, non notées (brief §4 bis)
    { id: 'pourquoi-mode', type: 'fil', de: 'claire', reflexion: true, groupe: 'Le mode de livraison', quand: apresFiche(FICHE_MODE),
      enonce: 'Pourquoi ce mode pour ton article le plus lourd ?',
      selon: (db) => { const a = clienteDe(jeuDeBase(db)).articles.slice().sort((x, y) => kg(y) - kg(x))[0]; return { enonce: `Pourquoi ce mode pour ton article le plus lourd (${a.lib.toLowerCase()}) ?` }; },
      choix: [{ v: 'client', lib: 'Parce que le client le dit : ce qu’il peut ou non porter, et les règles du mode, décident' }, { v: 'prix', lib: 'Parce que c’est le moins cher, quoi qu’il arrive' }, { v: 'vite', lib: 'Parce que c’est le plus rapide' }],
      retour: 'Le mode se choisit d’après le client (accès, ce qu’il peut porter) ET les conditions du mode (poids, montant de la commande) : le prix vient après.' },
    { id: 'annuler-demain', type: 'fil', de: 'claire', reflexion: true, groupe: 'Les engagements', quand: apresPlanning(PL, 2),
      enonce: 'Un client veut annuler parce que tu le livres demain au lieu d’aujourd’hui. Le peut-il tout de suite ?',
      choix: [{ v: 'delai', lib: 'Non : il doit d’abord laisser à IKEA un délai raisonnable, sauf si la date était essentielle' }, { v: 'oui', lib: 'Oui, toujours' }, { v: 'jamais', lib: 'Jamais' }],
      retour: 'Il peut annuler si IKEA ne livre pas dans le délai supplémentaire qu’il lui laisse par écrit ; tout de suite seulement si la date était une condition essentielle du contrat.' },
    { id: 'pas-tous', type: 'fil', de: 'claire', reflexion: true, groupe: 'Prévenir les clients', quand: apresFiche(FICHE_PREVENIR),
      enonce: 'Pourquoi ne pas prévenir tous les clients du jour ?',
      choix: [{ v: 'inquieter', lib: 'On inquiéterait pour rien ceux dont la livraison est tenue' }, { v: 'cout', lib: 'Cela coûterait trop cher' }, { v: 'interdit', lib: 'C’est interdit' }],
      retour: 'On prévient ceux dont la promesse ne sera pas tenue, pas les autres : prévenir à tort inquiète pour rien et fait perdre du temps à tous.' },
  ],
};
