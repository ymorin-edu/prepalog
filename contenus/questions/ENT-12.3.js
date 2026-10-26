// Les questions d'ENT-12.3 — IKEA, « la Seine est en crue » (brief `docs/briefs/ENT-12.3-ikea-seine-en-crue.md` §4 bis et §4 ter ; choix de Tristan du 26/10/2026 : propositions du brief prises
// telles quelles). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Claire et Mme Roux sont CONSTRUITES.
// Entraînement : 4 questions notées au fil (part 4 sur 20, 1 point chacune), corrigées tout de suite, et une réflexion non notée.
//
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (4 + 2) ; la question `duree` a des VALEURS TIRÉES (départ, route, livraison).
// Le droit de la date de livraison (annuler après un délai raisonnable ; tout de suite si la date est essentielle) est REFORMULÉ d'après la fiche pratique de la DGCCRF (lue le 26/10/2026) :
// le texte de l'article L216-6 n'est pas cité mot pour mot (non relu sur Légifrance). La règle des 4,30 m d'Austerlitz est celle du document HAROPA cité en tête du brief.

import { apresPlanning, apresMail } from '../../core/declencheurs.js';
import { ID, PL, MAIL_ROUX, COTE, KM_TOTAL, KM_SANS_REPORTEES } from '../ikea-ent123-donnees.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'claire', doc, rubrique, enonce, choix, juste, retour, ...o });
const hm = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;

// `duree` : un camion part à D h, roule R min, livre en L min. Libre à… (la route ET la livraison comptent).
const varianteDuree = (h) => {
  const d = h.choisir([8, 9, 10]);
  let r, l;
  do { r = h.choisir([30, 45, 60]); l = h.choisir([30, 45, 60]); } while (r === l);
  const fin = d * 60 + r + l;
  return {
    enonce: `Un camion part à ${d} h, roule ${r} min, livre en ${l} min. Il est libre à…`,
    libs: { juste: hm(fin), sans: hm(fin - l), route: hm(fin - r) },
    retour: `${d} h + ${r} min de route + ${l} min de livraison : le camion est libre à ${hm(fin)}.`,
  };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: {
    claire: { nom: 'Claire', role: 'responsable du service livraison', appel: 'Claire' },
    roux: { nom: 'Camille Roux', role: 'cliente', appel: 'Mme Roux' },
  },
  ouverture: { id: 'avant-de-commencer', de: 'claire', titre: 'Avant de commencer', continuer: 'voir l’accueil', calculette: true,
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['poste-123', 'droit-123'],
    tirage: { preparation: 2, droit: 1 },
    questions: ['engagement', 'prevenir', 'secours', 'duree', 'annuler', 'essentielle'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    q('engagement', 'preparation', 'poste-123', 'Le client a choisi un créneau de 14 h à 16 h. L’engagement est tenu si le livreur arrive…',
      [{ v: 'creneau', lib: 'entre 14 h et 16 h' }, { v: 'avant18', lib: 'avant 18 h' }, { v: 'lendemain', lib: 'le lendemain' }], 'creneau',
      'IKEA s’est engagé sur le créneau : le tenir fait partie du service vendu.', { cle: true }),
    q('prevenir', 'preparation', 'poste-123', 'Le livreur sera en retard. Il faut…',
      [{ v: 'prevenir', lib: 'prévenir le client avant, et lui proposer une autre heure' }, { v: 'rien', lib: 'ne rien dire' }, { v: 'livrer', lib: 'livrer quand même, sans prévenir' }], 'prevenir',
      'On prévient avant, pas après : le client peut s’organiser, et IKEA propose une autre heure.', { cle: true }),
    q('secours', 'preparation', 'poste-123', 'La péniche ne passe pas. On peut encore livrer…',
      [{ v: 'camion', lib: 'en camion, depuis le centre' }, { v: 'avion', lib: 'par avion' }, { v: 'non', lib: 'on ne livre pas du tout' }], 'camion',
      'D’où l’intérêt de garder des camions, même quand la péniche fonctionne : un mode de secours.'),
    q('duree', 'preparation', 'poste-123', 'Un camion part à 9 h, roule 45 min, livre en 30 min. Il est libre à…',
      [{ v: 'juste', lib: '10 h 15' }, { v: 'sans', lib: '9 h 45' }, { v: 'route', lib: '9 h 30' }], 'juste',
      '9 h + 45 min de route + 30 min de livraison = 10 h 15.', { cle: true, variante: varianteDuree }),
    // ── droit (2 : l'élève en reçoit 1)
    q('annuler', 'droit', 'droit-123', 'Le vendeur ne livre pas à la date promise. Le client peut annuler…',
      [{ v: 'delai', lib: 'après avoir laissé au vendeur un délai supplémentaire raisonnable, par écrit' }, { v: 'toujours', lib: 'tout de suite, toujours' }, { v: 'jamais', lib: 'jamais' }], 'delai',
      'Le client demande d’abord au vendeur de livrer dans un délai raisonnable. Si le vendeur ne livre pas dans ce délai, le client peut mettre fin au contrat.', { cle: true }),
    q('essentielle', 'droit', 'droit-123', 'Un client commande un meuble pour son mariage, le 5 juin, et l’a dit au vendeur. Livraison le 8 juin. Il peut annuler…',
      [{ v: 'tout-de-suite', lib: 'tout de suite : la date était essentielle' }, { v: 'delai', lib: 'seulement après un délai supplémentaire' }, { v: 'non', lib: 'non, jamais' }], 'tout-de-suite',
      'Quand la date est une condition essentielle du contrat (dite au vendeur), le client n’a pas à attendre.'),
    // ── au fil du travail : quatre questions notées, une réflexion
    { id: 'peniche-pourquoi', type: 'fil', de: 'claire', groupe: 'Le planning', quand: apresPlanning(PL),
      enonce: 'Pourquoi la péniche ne peut-elle pas passer quand la Seine monte ?',
      choix: [{ v: 'ponts', lib: 'Elle doit passer sous des ponts qui deviennent trop bas, et le courant devient trop fort' }, { v: 'poids', lib: 'Elle devient trop lourde' }, { v: 'vide', lib: 'Il n’y a plus assez d’eau' }],
      juste: 'ponts', retour: `Quand l’eau monte, les ponts deviennent trop bas pour la péniche (à ${COTE.seuil} à Austerlitz, la navigation est interdite entre Grenelle et l’Arsenal) : il reste les camions.` },
    { id: 'creneau-hors', type: 'fil', de: 'claire', groupe: 'Les engagements', quand: apresPlanning(PL, 2),
      enonce: 'M. Diallo attendait entre 14 h et 16 h. Tu le livres à 17 h. Qu’est-ce qu’IKEA ne tient pas ?',
      choix: [{ v: 'creneau', lib: 'Son engagement de créneau' }, { v: 'prix', lib: 'Son prix' }, { v: 'rien', lib: 'Rien' }],
      juste: 'creneau', retour: 'IKEA s’est engagé sur la date et le créneau. Livrer à 17 h, c’est ne pas tenir cet engagement : il faut tenir le créneau, ou prévenir avant.' },
    { id: 'km-en-plus', type: 'fil', de: 'claire', groupe: 'Les engagements', quand: apresPlanning(PL, 2),
      enonce: 'Les camions font un aller-retour jusqu’à chaque client (la colonne « km » de la liste des commandes). Pour les dix commandes, combien de km de camion en plus à cause de la crue ?',
      choix: [{ v: 'juste', lib: `${KM_TOTAL} km` }, { v: 'moitie', lib: `${KM_TOTAL / 2} km` }, { v: 'huit', lib: `${KM_SANS_REPORTEES} km` }, { v: 'dix', lib: '10 km' }],
      juste: 'juste', retour: `On additionne les kilomètres des dix commandes : ${KM_TOTAL} km. Avec la péniche, les camions ne roulaient pas dans Paris.` },
    { id: 'roux-annuler', type: 'fil', de: 'claire', groupe: 'La réponse à Mme Roux', quand: apresMail({ a: MAIL_ROUX }),
      enonce: 'Mme Roux peut-elle annuler tout de suite ?',
      choix: [{ v: 'delai', lib: 'Non : elle doit d’abord laisser à IKEA un délai raisonnable, sauf si la date était essentielle' }, { v: 'oui', lib: 'Oui, toujours' }, { v: 'jamais', lib: 'Jamais' }],
      juste: 'delai', retour: 'Elle peut annuler si IKEA ne livre pas dans le délai supplémentaire qu’elle lui laisse. Elle pourrait annuler tout de suite seulement si la date était une condition essentielle (un mariage, par exemple).' },
    { id: 'camions-secours', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_ROUX }),
      enonce: 'Pourquoi IKEA garde-t-il des camions, même avec la péniche ?',
      choix: [{ v: 'secours', lib: 'Pour avoir un mode de secours quand la péniche ne peut pas partir' }, { v: 'decor', lib: 'Pour faire joli' }, { v: 'moins-cher', lib: 'Parce que les camions sont toujours moins chers' }],
      retour: 'Un seul mode de transport, c’est un risque : quand il tombe, tout s’arrête. Un mode de secours permet de continuer à livrer.' },
  ],
};
