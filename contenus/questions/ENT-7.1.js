// Les questions d'ENT-7.1 — Decathlon, ton premier conteneur (brief `docs/briefs/ENT-7.1-decathlon-choisir-transporteur.md` §4 bis et
// §4 ter, choix de Tristan du 13/10/2026 : §11 n° 7 et 8). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personne et situations CONSTRUITES (Claire Vasseur).
//
// AU FIL (5 actives, dont 3 notées : `part: 3`, 1 point chacune) :
// - `co2-obligatoire` (NOTÉE, tout de suite, éco-droit appliqué au cas) : Claire, quand l'élève a reporté le CO₂ de la ROUTE (sortie d'une
//   case de la feuille ③ : le geste de la feuille est publié pour toute case, la condition attend que SA case CO₂ de la route soit remplie).
//   ÉCART au brief (à valider par Tristan) : la réponse juste proposée (« Oui : la loi l'oblige ») est FAUSSE pour ce trajet : l'article
//   L1431-3 (version 2025, lu sur Légifrance le 13/10/2026), 3e alinéa, renvoie à plus tard les transports qui partent ou arrivent hors de
//   France ; Anvers est en Belgique. La juste devient « ici, c'est le cahier des charges de Decathlon qui l'exige ».
// - `retard-magasins` (NOTÉE, au bilan) : Claire, quand l'élève a répondu « Tient la date ? » pour l'offre EN RETARD de son tirage.
// - `liste-referencee` (NOTÉE, au bilan) : Claire, quand l'élève a répondu « Dans la liste référencée ? » pour l'offre hors liste.
// - `barge-moins` : en réserve (`actif: false`).
// - `directeur` : réflexion non notée à l'envoi du comparateur, corrigée au bilan (§4 bis n° 5 ; pas de point d'étape : rien à fermer après l'envoi).
// - `semaine-plus-tard` : « Pour réfléchir » du brief §4, réponse libre non notée, à l'envoi, lue au bilan.
//
// AVANT DE COMMENCER : une banque de 11 questions NON notées, 5 tirées par élève (1 rappel, 2 préparation, 2 droit).
// ÉCART : `d2` est posée sur un trajet en France (la loi ne vise pas encore un trajet parti d'Anvers, voir plus haut).

import { apresGeste, apresFiche } from '../../core/declencheurs.js';
import { EQUIPE, quand as date, euros, kg } from '../decathlon.js';
import { ID, FICHE, B, COL, jeuEleve, fiche, tri, caseDe, caseCO2, lireNombre } from '../decathlon-ent71-donnees.js';

// Une condition « geste fait ET case remplie », qui déclare ses gestes (le moteur vérifie qu'une vue les publie).
const condition = (gestes, f) => { const q = (db, s) => f(db, s); q.gestes = gestes; return q; };
const fait = (db, s, nom) => apresGeste(nom)(db, s);

// ── Le CO₂ de la route, tel que l'élève l'a reporté (sa case de la feuille ③).
const co2RouteSaisi = (db) => { const J = jeuEleve(db); return caseDe(fiche(db).v, caseCO2(J, 'route')); };
const quandCO2Route = condition([`fiche:${FICHE}:${B.offres}`], (db, s) => fait(db, s, `fiche:${FICHE}:${B.offres}`)
  && co2RouteSaisi(db) != null && String(co2RouteSaisi(db)).trim() !== '');
const selonCO2 = (db) => {
  const x = lireNombre(co2RouteSaisi(db));
  return { enonce: Number.isFinite(x)
    ? `Ce chiffre de ${kg(x)} de CO₂ sur le devis de la route : le transporteur était-il obligé de te le donner ?`
    : 'Le CO₂ écrit sur le devis de la route : le transporteur était-il obligé de te le donner ?' };
};
// ── L'offre en retard de SON tirage (le rail ou la barge).
const quandRetard = condition([`fiche:${FICHE}:${B.tri}:rail`, `fiche:${FICHE}:${B.tri}:barge`], (db, s) => {
  const J = jeuEleve(db);
  return fait(db, s, `fiche:${FICHE}:${B.tri}:${J.retard}`) && tri(fiche(db).v, J.retard, COL.date) !== undefined;
});
const selonRetard = (db) => {
  const o = jeuEleve(db).enRetard;
  return { enonce: `${o.nom} arrive ${date(o.arrivee.iso, o.arrivee.h, { long: true })}. Si le conteneur arrive après jeudi 14 h, qu’est-ce qui se passe pour les magasins ?` };
};
// ── L'offre hors liste de SON tirage.
const quandHorsListe = condition([`fiche:${FICHE}:${B.tri}:horsliste`], (db, s) => fait(db, s, `fiche:${FICHE}:${B.tri}:horsliste`)
  && tri(fiche(db).v, 'horsliste', COL.liste) !== undefined);
const selonHorsListe = (db) => {
  const J = jeuEleve(db), h = J.horsListe, r = J.offres.find((o) => o.slot === 'route');
  return { enonce: `${h.nom} propose ${euros(h.prix)}, ${euros(r.prix - h.prix)} de moins que ${r.nom}. Pourquoi Decathlon ne commande-t-il qu’aux prestataires de sa liste ?` };
};
// ── À l'envoi : l'offre retenue, l'offre en retard.
const selonDirecteur = (db) => {
  const J = jeuEleve(db), o = J.offres.find((x) => x.slot === fiche(db).v[B.retenue]);
  return { enonce: `Tu as retenu ${o ? o.nom : 'une offre'}. Le directeur de l’entrepôt demande à Claire pourquoi on ne prend pas la moins chère. Que lui répond-elle ?` };
};
const selonSemaine = (db) => {
  const J = jeuEleve(db), b = J.offres.find((o) => o.slot === 'barge');
  return { enonce: `Pour réfléchir : ${J.enRetard.nom} arrivait trop tard. Si la mise en rayon était une semaine plus tard, quelle offre choisirais-tu, et pourquoi ?`,
    retour: `Une semaine plus tard, les trois offres de la liste tiendraient la date : le cahier des charges ferait choisir la moins émettrice, la barge de `
      + `${b.nom} (${kg(b.co2)} de CO₂), puisqu’elle reste dans le budget.` };
};

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: { claire: EQUIPE.claire },
  ouverture: { id: 'avant-de-commencer', de: 'claire', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Bienvenue au transport amont. Ce matin, tu vas choisir le transporteur d’un conteneur. Avant de commencer, lis les '
      + 'documents à gauche et réponds à mes questions.',
    documents: ['decathlon', 'cahier', 'avis', 'liste', 'itineraires', 'droit', 'devis-a'],
    tirage: { rappel: 1, preparation: 2, droit: 2 },
    questions: ['r1', 'r2', 'p1', 'p2', 'p3', 'p4', 'p5', 'd1', 'd2', 'd3', 'd4'] },
  liste: [
    // ── rappel (2 : l'élève en reçoit 1). Écrites pour marcher même sans avoir joué Decathlon en 2de (décision 13).
    { id: 'r1', type: 'ouverture', de: 'claire', doc: 'decathlon', rubrique: 'rappel',
      enonce: 'À quoi sert l’entrepôt Decathlon de Rouvignies ?',
      aide: 'Lis « Decathlon en bref », à gauche.',
      choix: [{ v: 'nord', lib: 'Il approvisionne les magasins Decathlon d’Europe du Nord.' }, { v: 'velos', lib: 'Il fabrique les vélos de la marque.' },
        { v: 'internet', lib: 'Il livre directement les clients qui commandent sur Internet.' }],
      juste: 'nord',
      retour: 'Rouvignies reçoit les produits et les renvoie vers les magasins du nord de l’Europe : c’est pour eux que ton conteneur doit arriver à l’heure.' },
    { id: 'r2', type: 'ouverture', de: 'claire', doc: 'decathlon', rubrique: 'rappel',
      enonce: 'D’où viennent les chaussures de randonnée de ton conteneur, et comment arrivent-elles en Europe ?',
      aide: 'Lis « Decathlon en bref », à gauche.',
      choix: [{ v: 'vietnam', lib: 'Du Vietnam, par porte-conteneurs jusqu’à un grand port européen.' },
        { v: 'chine', lib: 'De Chine, par avion jusqu’à Lille.' }, { v: 'france', lib: 'De France : elles sont fabriquées à Rouvignies.' }],
      juste: 'vietnam',
      retour: 'Le bateau les a posées à Anvers. Il reste à les amener d’Anvers à Rouvignies : c’est ton travail ce matin.' },
    // ── préparation (5 : l'élève en reçoit 2)
    { id: 'p1', type: 'ouverture', de: 'claire', doc: 'avis', rubrique: 'preparation', cle: true,
      enonce: 'Un conteneur « 40 pieds high cube », c’est…',
      aide: 'Lis la ligne « Type » de l’avis ; le mot [[40 pieds high cube]] est dans le lexique.',
      choix: [{ v: 'boite', lib: 'une boîte de 12 m de long, plus haute qu’un conteneur standard' }, { v: 'camion', lib: 'un camion de 40 tonnes' },
        { v: 'barge', lib: 'une barge de 40 conteneurs' }],
      juste: 'boite',
      retour: 'Un seul conteneur, 12 m de long : il tient sur un camion, sur un wagon ou sur une barge.' },
    { id: 'p2', type: 'ouverture', de: 'claire', doc: 'cahier', rubrique: 'preparation', cle: true,
      enonce: 'Ton conteneur est « dédouané à Anvers ». Qu’est-ce que ça change pour la suite du trajet ?',
      aide: 'Lis la ligne « Situation » du cahier des charges ; le mot [[dédouané]] est dans le lexique.',
      choix: [{ v: 'libre', lib: 'Il circule librement jusqu’en France, sans nouveau passage en douane.' },
        { v: 'frontiere', lib: 'Il doit repasser la douane à la frontière française.' }, { v: 'belgique', lib: 'Il ne peut voyager qu’en Belgique.' }],
      juste: 'libre',
      retour: 'La Belgique et la France sont dans l’Union européenne : une fois dédouané à Anvers, le conteneur va jusqu’à Rouvignies sans autre formalité.' },
    { id: 'p3', type: 'ouverture', de: 'claire', doc: 'itineraires', rubrique: 'preparation',
      enonce: 'L’offre « barge + camion » : pourquoi un camion ?',
      aide: 'Lis la ligne « Barge + camion » des itinéraires.',
      choix: [{ v: 'derniers', lib: 'La barge s’arrête au terminal fluvial ; il faut finir les derniers kilomètres jusqu’au quai.' },
        { v: 'tire', lib: 'Le camion tire la barge.' }, { v: 'papiers', lib: 'Le camion transporte les papiers du conteneur.' }],
      juste: 'derniers',
      retour: 'L’entrepôt n’est pas au bord du quai fluvial : un camion fait les derniers kilomètres depuis le terminal de Bruay.' },
    { id: 'p4', type: 'ouverture', de: 'claire', doc: 'liste', rubrique: 'preparation', cle: true,
      enonce: 'Une liste de prestataires référencés, c’est…',
      aide: 'Lis l’en-tête et le bas de la liste ; le mot [[prestataire référencé]] est dans le lexique.',
      choix: [{ v: 'verifies', lib: 'la liste des transporteurs avec qui l’entreprise a le droit de travailler, après vérification' },
        { v: 'moins-chers', lib: 'la liste des transporteurs les moins chers du moment' }, { v: 'annuaire', lib: 'l’annuaire de tous les transporteurs de Belgique' }],
      juste: 'verifies',
      retour: 'Un prestataire hors de la liste ne reçoit pas de commande, même moins cher.' },
    { id: 'p5', type: 'ouverture', de: 'claire', doc: 'itineraires', rubrique: 'preparation',
      enonce: 'Combien de fois le conteneur change-t-il de moyen de transport avec l’offre barge ?',
      aide: 'Une [[rupture de charge]], c’est un changement de moyen de transport.',
      choix: [{ v: 'une', lib: 'Une fois : de la barge au camion, au terminal de Bruay.' }, { v: 'aucune', lib: 'Aucune.' }, { v: 'trois', lib: 'Trois fois.' }],
      juste: 'une',
      retour: 'Une rupture de charge : la barge, puis le camion. La route n’en a aucune.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'd1', type: 'ouverture', de: 'claire', doc: 'devis-a', rubrique: 'droit', cle: true,
      enonce: 'Sur les devis, où trouves-tu le CO₂ émis par chaque transport ?',
      aide: 'Regarde le devis à gauche, en bas.',
      choix: [{ v: 'ligne', lib: 'Sur chaque devis : la ligne « Information CO₂ de la prestation ».' },
        { v: 'calcul', lib: 'Nulle part : c’est à Decathlon de le calculer seul.' }, { v: 'avis', lib: 'Sur l’avis de mise à disposition.' }],
      juste: 'ligne',
      retour: 'Chaque transporteur donne son CO₂ : c’est ce chiffre que tu reporteras dans le comparateur.' },
    { id: 'd2', type: 'ouverture', de: 'claire', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Un transporteur emmène un camion de marchandises de Lille à Rouvignies pour Decathlon. D’après la loi, qui doit informer qui du CO₂ émis ?',
      aide: 'Lis le premier alinéa de l’article L1431-3, à gauche.',
      choix: [{ v: 'transporteur', lib: 'Le transporteur informe Decathlon, son client.' }, { v: 'decathlon', lib: 'Decathlon informe le transporteur.' },
        { v: 'personne', lib: 'Personne : ce n’est pas obligatoire.' }],
      juste: 'transporteur',
      retour: 'Celui qui vend le transport informe celui qui en bénéficie. Pour un trajet qui part de l’étranger, comme Anvers, la loi ne s’applique pas encore : '
        + 'c’est le cahier des charges de Decathlon qui demande le CO₂.' },
    { id: 'd3', type: 'ouverture', de: 'claire', doc: 'droit', rubrique: 'droit',
      enonce: 'Decathlon vise −20 % d’émissions du transport. Est-ce une obligation de la loi ?',
      aide: 'Lis la fin du document « Le droit ».',
      choix: [{ v: 'engagement', lib: 'Non : c’est un engagement de l’entreprise ; la loi oblige seulement à informer du CO₂.' },
        { v: 'loi', lib: 'Oui : la loi impose −20 % à toutes les entreprises.' }, { v: 'transporteurs', lib: 'Oui, mais seulement aux transporteurs.' }],
      juste: 'engagement',
      retour: 'Informer, c’est la loi. Réduire, c’est le choix de Decathlon : c’est pour ça que son cahier des charges départage les offres par le CO₂.' },
    { id: 'd4', type: 'ouverture', de: 'claire', doc: 'droit', rubrique: 'droit',
      enonce: 'Le devis dit « calcul selon la méthode du Code des transports ». Qui fixe la façon de calculer ce CO₂ ?',
      aide: 'Lis ce que disent les articles D1431-1 à D1431-23.',
      choix: [{ v: 'code', lib: 'Des articles du Code des transports (partie réglementaire).' }, { v: 'chacun', lib: 'Chaque transporteur, comme il veut.' },
        { v: 'cahier', lib: 'Decathlon, dans son cahier des charges.' }],
      juste: 'code',
      retour: 'Même méthode pour tous : les chiffres des devis se comparent entre eux.' },
    // ── au fil du travail (notées : 1 point chacune)
    { id: 'co2-obligatoire', type: 'fil', de: 'claire', quand: quandCO2Route, poids: 1, selon: selonCO2,
      enonce: 'Le CO₂ écrit sur le devis de la route : le transporteur était-il obligé de te le donner ?',
      choix: [{ v: 'cahier', lib: 'Ici, c’est notre cahier des charges qui l’exige : la loi ne vise pas encore un transport parti de l’étranger.' },
        { v: 'loi', lib: 'Oui : la loi française l’impose pour tout transport, même parti de Belgique.' },
        { v: 'commercial', lib: 'Non : c’est un geste commercial, sans règle.' },
        { v: 'avion', lib: 'Oui, mais seulement pour un transport en avion.' }],
      juste: 'cahier', groupe: 'Question de Claire : l’information CO₂',
      retour: 'La loi (Code des transports, L1431-3) oblige à informer le client du CO₂, mais pour un trajet qui part ou arrive hors de France, elle renvoie '
        + 'à plus tard. Anvers est en Belgique : ici, c’est Decathlon qui exige le chiffre dans son cahier des charges.' },
    { id: 'retard-magasins', type: 'fil', de: 'claire', quand: quandRetard, poids: 1, apres: 'bilan', selon: selonRetard,
      enonce: 'Une offre arrive après la limite. Si le conteneur arrive après jeudi 14 h, qu’est-ce qui se passe pour les magasins ?',
      choix: [{ v: 'rayon', lib: 'Les produits du printemps manquent en rayon au lancement.' }, { v: 'range', lib: 'Rien, l’entrepôt le range plus tard.' },
        { v: 'paie', lib: 'Le transporteur paie le retard, donc ce n’est pas grave.' }, { v: 'repart', lib: 'Le conteneur repart à Anvers.' }],
      juste: 'rayon', groupe: 'Question de Claire : un conteneur en retard',
      retour: 'Une offre qui arrive après la limite est écartée, même moins chère ou moins émettrice : sans les produits, la mise en rayon du vendredi rate.' },
    { id: 'liste-referencee', type: 'fil', de: 'claire', quand: quandHorsListe, poids: 1, apres: 'bilan', selon: selonHorsListe,
      enonce: 'Une offre hors de la liste est moins chère. Pourquoi Decathlon ne commande-t-il qu’aux prestataires de sa liste ?',
      choix: [{ v: 'verifie', lib: 'Il a vérifié leur contrat, leur assurance et leur sécurité.' }, { v: 'moins-chers', lib: 'Parce qu’ils sont toujours les moins chers.' },
        { v: 'loi', lib: 'Parce que la loi interdit les autres transporteurs.' }, { v: 'francais', lib: 'Parce qu’ils sont tous français.' }],
      juste: 'verifie', groupe: 'Question de Claire : la liste référencée',
      retour: 'Un prestataire référencé a été vérifié avant : contrat, assurance, sécurité. Une offre hors liste ne peut pas être commandée, même moins chère.' },
    { id: 'barge-moins', type: 'fil', de: 'claire', actif: false, quand: apresFiche(FICHE), poids: 1, apres: 'bilan',
      enonce: 'La barge fait plus de kilomètres que la route, et émet moins. Pourquoi ?',
      choix: [{ v: 'dizaines', lib: 'Une barge porte des dizaines de conteneurs : chacun émet moins par kilomètre.' }, { v: 'electricite', lib: 'La barge roule à l’électricité.' },
        { v: 'eau', lib: 'Les kilomètres sur l’eau ne comptent pas.' }, { v: 'vite', lib: 'La barge va plus vite.' }],
      juste: 'dizaines', groupe: 'Question de Claire : pourquoi la barge émet moins',
      retour: 'Le CO₂ se partage entre tous les conteneurs du bateau : par conteneur et par kilomètre, la barge émet beaucoup moins qu’un camion.' },
    { id: 'directeur', type: 'fil', de: 'claire', quand: apresFiche(FICHE), reflexion: true, apres: 'bilan', selon: selonDirecteur,
      enonce: 'Le directeur de l’entrepôt demande à Claire pourquoi on ne prend pas la moins chère. Que lui répond-elle ?',
      choix: [{ v: 'date-co2', lib: 'La date passe d’abord ; parmi les offres qui la tiennent, le cahier des charges demande le moins de CO₂.' },
        { v: 'fiable', lib: 'La moins chère n’est jamais fiable.' }, { v: 'budget', lib: 'Le budget n’a pas d’importance chez Decathlon.' }],
      retour: 'La date d’abord, puis le CO₂ : c’est l’ordre du cahier des charges. Le budget, lui, est une limite à ne pas dépasser, pas le critère de choix.' },
    { id: 'semaine-plus-tard', type: 'fil', de: 'claire', quand: apresFiche(FICHE), reflexion: true, libre: true, apres: 'bilan', selon: selonSemaine,
      enonce: 'Pour réfléchir : une offre arrivait trop tard. Si la mise en rayon était une semaine plus tard, quelle offre choisirais-tu, et pourquoi ?',
      retour: 'Une semaine plus tard, les trois offres de la liste tiendraient la date : le cahier des charges ferait choisir la moins émettrice, la barge, '
        + 'puisqu’elle reste dans le budget.' },
  ],
};
