// Les questions d'ENT-7.3 — Decathlon, la barge ne passe plus (brief `docs/briefs/ENT-7.3-decathlon-la-barge-ne-passe-plus.md` §4 bis et §4 ter,
// choix de Tristan du 15/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`.
// Personnes CONSTRUITES (Claire Vasseur, Mehdi Benali).
//
// AU FIL (3 notées : `part: 3`, 1 point chacune) :
// - `force-majeure` (NOTÉE, tout de suite, éco-droit appliqué au cas, Code civil art. 1218) : Claire, quand l'élève a répondu « Tient la date ? »
//   pour la BARGE dans le comparateur n° 2 (le tri est déjà fait : elle ne souffle pas le jalon 1).
// - `railco-hors-liste` (NOTÉE, au bilan) : Claire, quand l'élève a répondu « Dans la liste référencée ? » pour RailCo Express.
// - `ce-qui-a-change` (NOTÉE, tout de suite, POINT D'ÉTAPE) : Claire, à l'envoi du comparateur n° 2 ; elle garde fermé le second ordre de transport
//   (`ferme: 'ecran:fiche:ot2'`) jusqu'à la réponse.
// - `prevenir-qui` (réflexion non notée, au bilan) : Mehdi, au raccrochage. - `lundi-ce-soir` : « Pour réfléchir » du brief §4, libre, au bilan.
// - La question n° 4 du brief (« Pourquoi ne pas annuler Contargo tout de suite ? ») est ÉCARTÉE (elle soufflerait le jalon « annuler au bon moment »).
//
// AVANT DE COMMENCER : banque de 9 questions NON notées, 4 tirées par élève (2 préparation, 2 droit).
// ÉCARTS au brief (dits à Tristan à la livraison) : d3 (L. 1431-3) réécrite : la réponse proposée par le brief (« Oui, la loi l'y oblige ») est
// FAUSSE pour un transport qui part d'Anvers (3e alinéa : l'étranger est renvoyé à plus tard, vérifié sur Légifrance le 13/10/2026, cf. ENT-7.1) ;
// d4 (art. 1103) REMPLACÉE par la question de Tristan sur l'art. 1231-1 ; p2 : le schéma d'écluse de Cowork n'est pas dans le dépôt, une courte
// explication en texte le remplace à gauche.

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE } from '../decathlon.js';
import { ID, CMP1, CMP2, COL, B, DIALOGUE, jeuEleve, fiche, tri } from '../decathlon-ent73-donnees.js';

// Une condition « geste fait ET case remplie », qui déclare ses gestes (le moteur vérifie qu'une vue les publie).
const condition = (gestes, f) => { const q = (db, s) => f(db, s); q.gestes = gestes; return q; };
const quandBarge = condition([`fiche:${CMP2}:${B.tri}:barge`], (db, s) => apresGeste(`fiche:${CMP2}:${B.tri}:barge`)(db, s)
  && tri(fiche(db, CMP2).v, 'barge', COL.date) !== undefined);
const quandHorsListe = condition([`fiche:${CMP2}:${B.tri}:horsliste`], (db, s) => apresGeste(`fiche:${CMP2}:${B.tri}:horsliste`)(db, s)
  && tri(fiche(db, CMP2).v, 'horsliste', COL.liste) !== undefined);

// Ce que l'élève retient au comparateur n° 2, dit comme Claire le dirait.
const retenu = (db) => { const o = jeuEleve(db).offres.find((x) => x.slot === fiche(db, CMP2).v[B.retenue]); return o || null; };
const selonChange = (db) => {
  const o = retenu(db);
  const apres = !o ? 'aujourd’hui, tu as refait ton choix' : o.slot === 'rail' ? 'aujourd’hui le rail' : o.slot === 'route' ? 'aujourd’hui la route'
    : o.slot === 'barge' ? 'et aujourd’hui tu la retiens encore' : `aujourd’hui ${o.nom}`;
  return { enonce: `Lundi tu as pris la barge, ${apres}. Qu’est-ce qui a changé ?` };
};

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: { claire: EQUIPE.claire, mehdi: EQUIPE.mehdi },
  ouverture: { id: 'avant-de-commencer', de: 'claire', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, tu commandes le transport d’un conteneur, comme d’habitude. Avant de commencer, lis les documents à gauche et réponds à mes questions.',
    documents: ['fait', 'ecluse', 'confirmation', 'forcemajeure', 'ecrit', 'droit', 'responsabilite'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['p1', 'p2', 'p3', 'p4', 'p5', 'd1', 'd2', 'd3', 'd4'] },
  etapes: [
    { id: 'avant-ordre-2', de: 'claire', apres: (db) => !!(db && db.fiches && db.fiches[CMP2] && db.fiches[CMP2].envoye), ferme: 'ecran:fiche:ot2',
      titre: 'Point d’étape avant le nouvel ordre de transport', continuer: 'passer au nouvel ordre',
      situation: 'J’ai ton nouveau choix. Avant que tu passes la commande, une question.',
      questions: ['ce-qui-a-change'] },
  ],
  liste: [
    // ── préparation (5 : l'élève en reçoit 2)
    { id: 'p1', type: 'ouverture', de: 'claire', doc: 'fait', rubrique: 'preparation',
      enonce: 'Un « arrêt de navigation », c’est…',
      aide: 'Le mot [[arrêt de navigation]] est dans le lexique ; l’exemple de 2024 est à gauche.',
      choix: [{ v: 'bateaux', lib: 'une période où les bateaux ne peuvent pas passer sur une voie d’eau' },
        { v: 'greve', lib: 'une grève des chauffeurs routiers' }, { v: 'port', lib: 'un arrêt obligatoire du bateau au port' }],
      juste: 'bateaux',
      retour: 'Quand une écluse est fermée, aucun bateau ne passe : la voie d’eau est arrêtée, parfois pendant des semaines.' },
    { id: 'p2', type: 'ouverture', de: 'claire', doc: 'ecluse', rubrique: 'preparation',
      enonce: 'Une écluse, à quoi sert-elle ?',
      aide: 'Le mot [[écluse]] est dans le lexique ; lis l’explication à gauche.',
      choix: [{ v: 'niveau', lib: 'À faire passer un bateau d’un niveau d’eau à un autre.' }, { v: 'peser', lib: 'À peser les bateaux.' },
        { v: 'papiers', lib: 'À contrôler les papiers des conteneurs.' }],
      juste: 'niveau',
      retour: 'L’écluse est un sas : elle monte ou descend l’eau pour que le bateau passe là où le fleuve change de niveau.' },
    { id: 'p3', type: 'ouverture', de: 'claire', doc: 'confirmation', rubrique: 'preparation', cle: true,
      enonce: 'Pour annuler une commande à un prestataire, quel moyen utilises-tu ?',
      aide: 'Regarde le message du prestataire à gauche : il est écrit.',
      choix: [{ v: 'courriel', lib: 'Un courriel : il laisse une trace écrite.' }, { v: 'appel', lib: 'Un appel : c’est plus rapide.' },
        { v: 'rien', lib: 'Rien : il comprendra.' }],
      juste: 'courriel',
      retour: 'Ce qui engage ou défait une commande s’écrit : en cas de désaccord, le courriel prouve qui a dit quoi, et quand.' },
    { id: 'p4', type: 'ouverture', de: 'claire', doc: 'confirmation', rubrique: 'preparation', cle: true,
      enonce: 'Qu’est-ce qu’une « confirmation écrite » d’un prestataire ?',
      aide: 'Lis le message du prestataire à gauche.',
      choix: [{ v: 'engage', lib: 'Un message où il s’engage à faire le transport demandé.' }, { v: 'devis', lib: 'Le devis.' }, { v: 'facture', lib: 'La facture.' }],
      juste: 'engage',
      retour: 'Le devis propose, la facture réclame : c’est la confirmation qui dit « c’est entendu, nous le ferons ».' },
    { id: 'p5', type: 'ouverture', de: 'claire', doc: 'fait', rubrique: 'preparation',
      enonce: 'VNF publie chaque année des « avis à la batellerie ». À quoi servent-ils ?',
      aide: 'Lis le document à gauche.',
      choix: [{ v: 'arrets', lib: 'À annoncer à l’avance les arrêts programmés des voies d’eau.' }, { v: 'prix', lib: 'À fixer le prix des barges.' },
        { v: 'liste', lib: 'À lister les transporteurs référencés.' }],
      juste: 'arrets',
      retour: 'Un arrêt programmé s’annonce longtemps avant ; une avarie, non : c’est toute la différence entre un arrêt prévu et un imprévu.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'd1', type: 'ouverture', de: 'claire', doc: 'forcemajeure', rubrique: 'droit', cle: true,
      enonce: 'Si l’arrêt de l’Escaut avait été annoncé en janvier, avant ta commande, Contargo pourrait-il invoquer la force majeure ?',
      aide: 'Lis l’article 1218 du Code civil, à gauche : l’événement doit être imprévisible lors de la conclusion du contrat.',
      choix: [{ v: 'non', lib: 'Non : l’événement pouvait être prévu au moment de la commande.' }, { v: 'toujours', lib: 'Oui : un arrêt de navigation est toujours une force majeure.' },
        { v: 'ecrit', lib: 'Oui, si Contargo prévient par écrit.' }],
      juste: 'non',
      retour: 'La force majeure suppose un événement imprévisible à la conclusion du contrat. Un arrêt annoncé avant la commande aurait pu être prévu.' },
    { id: 'd2', type: 'ouverture', de: 'claire', doc: 'ecrit', rubrique: 'droit', cle: true,
      enonce: 'Ton courriel d’annulation a-t-il la même valeur qu’une lettre signée ?',
      aide: 'Lis l’article 1366 du Code civil, à gauche.',
      choix: [{ v: 'oui', lib: 'Oui, si l’on sait qu’il vient de toi et qu’il n’a pas été modifié.' }, { v: 'recommande', lib: 'Non, seulement un recommandé papier.' },
        { v: 'jamais', lib: 'Non, un courriel n’engage jamais.' }],
      juste: 'oui',
      retour: 'L’écrit électronique a la même force probante que le papier, si la personne est identifiée et si le texte est conservé sans modification.' },
    { id: 'd3', type: 'ouverture', de: 'claire', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Le rail te confirme un transport au départ d’Anvers. D’après la loi, doit-il te donner le CO₂ de la prestation ?',
      aide: 'Lis la fin du document « Le droit », à gauche.',
      choix: [{ v: 'cahier', lib: 'Pas encore : la loi renvoie à plus tard les transports qui partent de l’étranger ; ici, c’est le cahier des charges de Decathlon qui l’exige.' },
        { v: 'loi', lib: 'Oui : la loi l’y oblige pour tout transport.' }, { v: 'demande', lib: 'Non, seulement s’il en reçoit la demande.' }],
      juste: 'cahier',
      retour: 'Le Code des transports (L1431-3) oblige à informer du CO₂, mais renvoie à plus tard les transports qui partent ou arrivent hors de France. Anvers est en Belgique : c’est Decathlon qui exige le chiffre.' },
    { id: 'd4', type: 'ouverture', de: 'claire', doc: 'responsabilite', rubrique: 'droit',
      enonce: 'Un transporteur te confirme un transport par écrit, puis ne vient pas, sans raison valable. Que peut faire Decathlon ?',
      aide: 'Lis l’article 1231-1 du Code civil, à gauche.',
      choix: [{ v: 'reparer', lib: 'Lui demander de réparer le préjudice : le contrat l’engageait.' }, { v: 'rien', lib: 'Rien : un courriel n’engage pas.' },
        { v: 'douane', lib: 'Le signaler à la douane.' }],
      juste: 'reparer',
      retour: 'Un contrat conclu engage : celui qui n’exécute pas, sans que la force majeure l’en empêche, doit réparer le dommage qu’il cause.' },
    // ── au fil du travail (notées : 1 point chacune)
    { id: 'force-majeure', type: 'fil', de: 'claire', quand: quandBarge, poids: 1,
      enonce: 'La barge ne part pas à cause de l’avarie de l’écluse. Decathlon peut-il réclamer des pénalités à Contargo ?',
      choix: [{ v: 'force-majeure', lib: 'Non : l’avarie était imprévisible et Contargo ne pouvait pas l’éviter ; c’est un cas de force majeure.' },
        { v: 'oui', lib: 'Oui : Contargo s’était engagé, il doit payer.' }, { v: 'charge', lib: 'Oui, mais seulement si le conteneur était déjà chargé.' },
        { v: 'paye', lib: 'Non, parce que Decathlon n’a pas encore payé.' }],
      juste: 'force-majeure', groupe: 'Question de Claire : un arrêt imprévu',
      retour: 'Une avarie ne se prévoit pas, et Contargo ne pouvait pas l’éviter : c’est de la force majeure (Code civil, art. 1218). Contargo n’a donc pas de pénalités à payer, et Decathlon peut annuler sans frais. Si l’arrêt avait été annoncé avant la commande, ce serait autre chose.' },
    { id: 'railco-hors-liste', type: 'fil', de: 'claire', quand: quandHorsListe, poids: 1, apres: 'bilan',
      enonce: 'RailCo est moins cher et émet moins que le rail référencé. Si on le commandait et qu’un carton disparaissait, qu’est-ce qui poserait problème ?',
      choix: [{ v: 'verifie', lib: 'Decathlon n’aurait vérifié ni son contrat ni son assurance.' }, { v: 'rembourse', lib: 'Rien, RailCo rembourserait forcément.' },
        { v: 'douane', lib: 'La douane bloquerait le conteneur.' }],
      juste: 'verifie', groupe: 'Question de Claire : le prestataire hors liste',
      retour: 'Un prestataire référencé a été vérifié avant : contrat, assurance, sécurité. RailCo ne l’a pas été : en cas de perte, rien ne garantit que Decathlon soit remboursé. C’est pour ça qu’il n’est pas dans la liste, même moins cher.' },
    { id: 'ce-qui-a-change', type: 'transition', de: 'claire', selon: selonChange,
      enonce: 'Lundi tu as pris la barge, aujourd’hui le rail. Qu’est-ce qui a changé ?',
      choix: [{ v: 'date', lib: 'La barge ne tient plus la date : elle sort de la comparaison.' }, { v: 'prix', lib: 'Le rail est devenu moins cher.' },
        { v: 'co2', lib: 'Decathlon a changé d’objectif CO₂.' }, { v: 'liste', lib: 'La liste référencée a changé.' }],
      juste: 'date', groupe: 'Question de Claire : ce qui a changé',
      retour: 'Rien n’a changé dans les prix, le CO₂ ni la liste : seule la date a bougé. La barge, toujours la moins émettrice, ne peut plus arriver à temps ; parmi les offres qui tiennent la date, la moins émettrice est maintenant une autre.' },
    // ── en réflexion
    { id: 'prevenir-qui', type: 'fil', de: 'mehdi', quand: apresGeste(`dialogue:${DIALOGUE}:fin`), reflexion: true, libre: true, apres: 'bilan',
      enonce: 'Le conteneur arrive vendredi à 15 h au lieu de 9 h. Qui d’autre faut-il prévenir chez Decathlon ?',
      retour: 'Tout ce qui attendait le conteneur à 9 h : l’équipe de réception, et surtout les magasins, dont la mise en rayon dépend de l’heure d’arrivée.' },
    { id: 'lundi-ce-soir', type: 'fil', de: 'claire', quand: apresGeste(`dialogue:${DIALOGUE}:fin`), reflexion: true, libre: true, apres: 'bilan',
      enonce: 'Pour réfléchir : lundi matin, la barge était le meilleur choix. Ce soir, ce n’est plus vrai. Qu’est-ce qui a changé, et qu’est-ce qui n’a pas changé dans ta façon de choisir ?',
      retour: 'Ce qui a changé : la barge ne tient plus la date. Ce qui n’a pas changé : la façon de choisir. D’abord la liste référencée, puis la date, puis le CO₂. Et une commande ne s’annule qu’une fois la suivante confirmée par écrit.' },
  ],
};
