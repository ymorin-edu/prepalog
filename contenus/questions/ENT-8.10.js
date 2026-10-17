// Les questions d’ENT-8.10 — Action, évaluation « recevoir un camion dans un nouveau site » (brief `docs/briefs/ENT-8.10-action-evaluation-reception.md`,
// §4 bis et §4 ter ; questions de Cowork, décision du 17/10/2026 sur délégation de Tristan). Modifier ce fichier suffit : voir « Modifier les
// questions d’une séance » dans `activites/FICHE-SEANCE.md`.
//
// ÉVALUATION : AUCUNE question au fil. Seul l’écran « Avant de commencer » est NOTÉ (`part: 4`) : 12 questions clés reprises d’ENT-8.2, 8.7, 8.8
// et 8.9 (9 de préparation, 3 d’image), l’élève en reçoit 4 (`tirage: { preparation: 3, image: 1 }`) ; aucune aide, aucun mot cliquable,
// « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.
// « Le droit » (C. trav. R4515-4, R4515-8 ; C. com. L133-1, L133-3) est lisible à gauche (`doc: 'droit'`).
//
// ÉCART au brief (le même qu’en ENT-8.5 et 8.6) : le moteur ne sait pas écrire le site de l’élève dans une question d’ouverture. `k-qui-ecrit`
// dit « l’entreprise qui t’accueille » (au lieu de {prestataire}), `k-attendre` « le cariste » et « ton tuteur » (au lieu de {cariste}, {tuteur}),
// `k-qui-paie` « l’entreprise qui t’accueille » ; la personne est « Ton tuteur ». Le site est écrit dans le document « Ton stage ».
// Les `retour` (jamais montrés en évaluation, lus par l’enseignant) sont écrits par Claude Code.

import { ID } from '../action-ent810-donnees.js';

// La personne qui pose les questions : le tuteur ou la tutrice du site (CONSTRUIT), nommé sans prénom (voir l’en-tête).
export const TUTEUR = { nom: 'Ton tuteur', role: 'chef d’équipe à la réception', appel: 'Ton tuteur', registre: 'tu' };

const img = (id, src, alt, credit) => ({ id, court: 'Une photo', titre: 'Une photo du quai', type: 'images', images: [{ src, alt, credit, large: true }] });
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'tuteur', doc, rubrique, enonce, choix, juste, retour });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { tuteur: TUTEUR },
  ouverture: { id: 'avant-de-commencer', de: 'tuteur', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, réponds à mes questions, sans aide. Pour trois d’entre elles, lis « Le droit », à gauche.',
    documents: ['stage', 'droit', 'protocole-entete', 'dessin-cale', 'carton-ecrase',
      img('photo-niveleur', './contenus/smoby/quai-interieur.jpg', 'Une porte de quai ouverte sur l’intérieur d’une remorque ; au sol, une plaque bleue au bord du quai',
        'Photo d’un autre entrepôt — Pexels n° 1267327, marques effacées')],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-protocole', 'k-qui-ecrit', 'k-plan-circulation', 'k-anomalie', 'k-attendre', 'k-reserve', 'k-signer', 'k-trois-jours', 'k-qui-paie',
      'k-img-cale', 'k-img-carton-ecrase', 'k-img-niveleur'] },
  liste: [
    // ── préparation (9 : l’élève en reçoit 3)
    q('k-protocole', 'preparation', 'protocole-entete', 'Un protocole de sécurité, c’est…',
      [{ v: 'document', lib: 'un document qui dit comment livrer et décharger sans danger sur ce site' }, { v: 'contrat', lib: 'un contrat de vente' },
        { v: 'planning', lib: 'le planning des camions' }], 'document',
      'Le document qui dit comment livrer et décharger sans danger, ici, sur ce site.'),
    q('k-qui-ecrit', 'preparation', 'droit', 'Le protocole de ce quai, qui l’a écrit ? (lis « Le droit »)',
      [{ v: 'ensemble', lib: 'l’entreprise qui t’accueille et le transporteur, ensemble, avant la première livraison' },
        { v: 'chauffeur', lib: 'le chauffeur, seul' }, { v: 'action', lib: 'Action' }], 'ensemble',
      'Les deux employeurs, ensemble, avant l’opération (R4515-8).'),
    q('k-plan-circulation', 'preparation', 'stage', 'Le plan de circulation d’un site montre…',
      [{ v: 'passages', lib: 'par où passent les camions et les piétons' }, { v: 'rayons', lib: 'les rayons du magasin' },
        { v: 'horaires', lib: 'les horaires de l’équipe' }], 'passages',
      'Par où roulent les camions et par où passent les piétons, pour qu’ils ne se croisent pas.'),
    q('k-anomalie', 'preparation', 'stage', 'Une anomalie, c’est…',
      [{ v: 'signale', lib: 'quelque chose qui n’est pas normal et qu’on signale' }, { v: 'palette', lib: 'une palette de plus' }, { v: 'pause', lib: 'une pause' }],
      'signale', 'Ce qui n’est pas normal : on ne le règle pas seul, on le signale.'),
    q('k-attendre', 'preparation', 'stage', 'Le cariste veut décharger avant que le problème du quai soit réglé. Que fais-tu ?',
      [{ v: 'attendre', lib: 'on attend que ton tuteur ait réglé le problème' }, { v: 'laisser', lib: 'je le laisse faire' },
        { v: 'moi', lib: 'je décharge moi-même' }], 'attendre',
      'On attend : un camion pas sûr, on n’y entre pas.'),
    q('k-reserve', 'preparation', 'stage', 'Une réserve, c’est…',
      [{ v: 'remarque', lib: 'une remarque écrite sur le document du transporteur, qui dit ce qui ne va pas' },
        { v: 'secours', lib: 'une palette de secours' }, { v: 'stock', lib: 'un carton en stock' }], 'remarque',
      'Une remarque écrite sur le document du transporteur : quelle palette, quoi, combien.'),
    q('k-signer', 'preparation', 'stage', 'Pourquoi le chauffeur signe-t-il sous tes réserves ?',
      [{ v: 'reconnaitre', lib: 'pour reconnaître ce qui a été constaté devant lui' }, { v: 'paye', lib: 'pour être payé' },
        { v: 'partir', lib: 'pour partir plus vite' }], 'reconnaitre',
      'En signant, il reconnaît ce qui a été constaté devant lui.'),
    q('k-trois-jours', 'preparation', 'droit', 'Une palette acceptée sans réserve est abîmée. Combien de temps pour protester auprès du transporteur ? (lis « Le droit »)',
      [{ v: '3j', lib: '3 jours, sans compter les jours fériés, par lettre recommandée' }, { v: '1m', lib: '1 mois, par courriel' }, { v: '1a', lib: '1 an' }],
      '3j', '3 jours, non compris les jours fériés, par lettre recommandée (L133-3).'),
    q('k-qui-paie', 'preparation', 'droit', 'Des cartons sont abîmés pendant le transport. Qui en répond ? (lis « Le droit »)',
      [{ v: 'transporteur', lib: 'le transporteur' }, { v: 'accueil', lib: 'l’entreprise qui t’accueille' }, { v: 'magasin', lib: 'le magasin' }],
      'transporteur', 'Le voiturier (le transporteur) est garant des avaries (L133-1).'),
    // ── images (3 : l’élève en reçoit 1)
    q('k-img-cale', 'image', 'dessin-cale', 'Cet objet devant la roue sert à…',
      [{ v: 'immobiliser', lib: 'empêcher le camion de bouger' }, { v: 'gonfler', lib: 'gonfler le pneu' }, { v: 'laver', lib: 'laver la roue' }],
      'immobiliser', 'C’est une cale : elle empêche le camion de bouger pendant qu’on décharge.'),
    q('k-img-carton-ecrase', 'image', 'carton-ecrase', 'Ce carton est…',
      [{ v: 'ecrase', lib: 'écrasé : la marchandise dedans est peut-être abîmée' }, { v: 'neuf', lib: 'neuf' }, { v: 'vide', lib: 'vide' }],
      'ecrase', 'Il est écrasé : ce qu’il y a dedans est peut-être cassé.'),
    q('k-img-niveleur', 'image', 'photo-niveleur', 'Cette plaque au bord du quai sert à…',
      [{ v: 'passer', lib: 'passer du quai au camion avec l’engin' }, { v: 'bloquer', lib: 'bloquer les roues' }, { v: 'peser', lib: 'peser la palette' }],
      'passer', 'C’est le niveleur : il fait le pont entre le quai et le plancher du camion.'),
  ],
};
