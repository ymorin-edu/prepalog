// Boost — ENT-3.1, « la tournée du vélo-cargo ». C2.4, organiser une tournée de livraison.
//
// Première des quatre séances de C2.4, et séance de GUIDAGE : organiser une tournée est une
// notion entièrement nouvelle pour les élèves. La doctrine des trois temps est dans
// `claude/prepalog-progression-pedagogique.md` — guidage, entraînement, erreur induite,
// évaluation — et c'est elle qui décide de la notation et de ce qu'on rend à l'élève.
//
// ── Les deux temps tiennent dans UNE séance ──────────────────────────────────────────────
// Repérer les clients sur le plan, puis ordonner le passage : ce sont deux moments du même
// geste professionnel, pas deux étapes d'apprentissage, et le second est impossible sans le
// premier. Décision de Tristan, prise deux fois. Le noyau tient l'enchaînement tout seul :
// la vue « Tournée » reste fermée tant que le repérage n'est pas validé.
//
// ── Ce que l'élève fait, dans l'ordre ───────────────────────────────────────────────────
//   1. il lit la fiche de tournée : sept clients, une adresse de RUE pour chacun ;
//   2. il ouvre un plan en ligne dans un autre onglet, situe chaque adresse, et écrit la
//      case du quadrillage sur notre plan. C'est le geste du métier : on reçoit une adresse,
//      on la situe, puis on construit la tournée ;
//   3. les sept noms apparaissent sur le plan ; il découvre que les commandes pèsent 237 kg
//      pour 180 kg de charge utile, donc qu'il faut laisser un client à quai ;
//   4. il ordonne les arrêts, en glissant ou avec les flèches, et regarde les jauges ;
//   5. il calcule dans la feuille (poids total, puis temps en trois étapes) ; il reporte deux
//      résultats — la masse totale et ce qui ne peut pas partir — dans des cases qui se
//      corrigent seules.
//
// ── La notation : jalons ET note sur 20 ─────────────────────────────────────────────────
// Tristan, le 02/10 : « les élèves sont motivés par les notes, je peux l'utiliser avec un
// petit coefficient pour récompenser leur implication ». Donc cette séance déclare
// `bareme: ETAPES.length` et **PAS** `notation: 'avancement'` — c'est son seul écart avec les
// trois séances Spartoo. Vérifié dans le code : `noteConvertie` de `core/notes.js` rend vrai
// dès qu'un module ne déclare pas de `notation`, le score est ramené sur 20, et le score brut
// en jalons reste lisible en infobulle dans le suivi de classe. Aucun ajout au moteur.
//
// ── L'autocorrection dans une séance de guidage ─────────────────────────────────────────
// Les cases de report se corrigent seules, ce qui s'écarte de la règle « un environnement ne
// rend rien à l'élève pendant l'exercice ». C'est la décision n° 2 de Tristan, et dans une
// séance de guidage l'écart devient cohérent : on corrige parce qu'on guide. ENT-3.4,
// l'évaluation, devra resserrer ce point.
//
// Même esprit pour le repérage : une case fausse est tolérée (`toleres: 1`), la suite n'attend
// pas la perfection, et au bout de trois validations infructueuses une porte de sortie
// apparaît. Règle de Tristan : « il ne faut pas que l'élève se retrouve complètement bloqué
// mais il faut en même temps lui laisser la possibilité de faire certaines erreurs ».
// **Débloquer n'est pas valider** : le jalon ne compte le point que si les sept cases sont
// justes, et le suivi montre la différence.

import { creerTournee } from '../core/types/tournee.js';
import { PLAN_NIMES, DESTINATAIRES, VELO } from './boost.js';

export const TRANSPORT_ID = 'boost-ent31';

/* ======================================================================= le plan ====== */

export const PLAN = Object.assign({}, PLAN_NIMES, {
  libelle: 'Plan de Nîmes',
  titre: 'Situer les sept clients sur le plan de Nîmes',
  consigne: "La fiche de tournée ne donne que le nom de la rue. Pour chaque client, trouvez "
    + "la rue sur un plan en ligne, repérez-la sur le plan de Nîmes ci-dessous, puis écrivez "
    + 'sa case du quadrillage (une lettre et un chiffre, par exemple C2), et choisissez son '
    + 'quartier dans le menu déroulant.',
  // Un lien vers un plan libre, qui s'ouvre dans un autre onglet. On n'intègre AUCUNE carte
  // en ligne dans Prepalog : pas d'iframe, pas de fond repris. L'élève cherche, puis revient.
  enLigne: {
    libelle: 'Ouvrir un plan de Nîmes (OpenStreetMap)',
    url: 'https://www.openstreetmap.org/#map=13/43.8367/4.3601',
  },
  reperage: {
    consigne: 'Sept clients : pour chacun, une case et un quartier à trouver. Validez quand '
      + 'vous les avez tous : les noms apparaîtront sur le plan et la tournée s’ouvrira.',
    champ: 'Case',
    // Un menu déroulant par ligne (Tristan, 05/10/2026), douze quartiers pour sept clients :
    // les cinq en trop empêchent de finir par élimination. Ce sont des quartiers réels de
    // Nîmes, qu'aucun client n'habite ; ils ne sont pas dessinés sur le plan. Rangés par ordre
    // alphabétique, pour que la liste ne suive ni l'ordre de la fiche ni celui du plan.
    quartiers: [...DESTINATAIRES.map((d) => d.zone),
      'Carémeau', 'Gambetta', 'Mas de Mingue', 'Pissevin', 'Valdegour']
      .sort((a, b) => a.localeCompare(b, 'fr')),
    // Le libellé du mode hors connexion, qui vit dans le BANDEAU du module et non dans la vue
    // (décision de Tristan du 03/10 : sous la carte, les élèves cliquaient dessus pour avoir
    // les réponses). Il donne le QUARTIER, pas la case, et son usage est horodaté dans la base.
    secours: 'Mode hors connexion',
    // Une case fausse n'empêche pas d'avancer, et elle reste visible à l'écran comme dans le
    // suivi. Le jalon, lui, exige les sept.
    toleres: 1,
    blocant: true,
    essaisAvantIssue: 3,
    issue: 'Je ne trouve pas, continuer quand même',
  },
});

/* ==================================================================== la tournée ====== */

export const TOURNEE = {
  libelle: 'Tournée du 14 avril',
  titre: 'Organiser la tournée du vélo-cargo',
  consigne: `Le vélo-cargo part de l’entrepôt à ${Math.floor(VELO.depart / 60)} h 00 et doit `
    + `être à la gare de Nîmes-Centre avant ${Math.floor(VELO.train / 60)} h `
    + `${String(VELO.train % 60).padStart(2, '0')}, départ du train pour Paris. Il emporte au `
    + `plus ${VELO.chargeUtile} kg. Les sept commandes dépassent cette charge : chargez `
    + 'ce qui peut partir, laissez le reste à quai, puis mettez les arrêts dans un ordre qui '
    + 'tienne l’horaire.',
  // Le vélo-cargo part VIDE : l'élève le charge. Décision de Tristan du 03/10 — trouver tous
  // les arrêts déjà chargés n'est pas intuitif, et c'est l'inverse du geste réel. La jauge
  // part de zéro et monte jusqu'au plafond, ce qui montre la contrainte au lieu de l'annoncer.
  departAQuai: true,
  libelleCharge: 'Chargé dans le vélo-cargo',
  libelleQuai: 'Commandes restées à quai',
  libelleCharger: 'charger',
  // Les résultats ne se valident pas tant que la tournée ne tient pas. Sans ça, les quatre
  // cases ci-dessous donnent les mêmes valeurs quel que soit l'ordre — 237, 57, 179, 36 — et
  // un élève obtient 4/4 en manquant le train de cinquante minutes. Relevé par Tristan le
  // 03/10 : « il suffit de garder les 6 premières et on tombe juste, aucun travail de tournée
  // à faire ».
  exigeConforme: true,
  // ── Les jauges ne donnent plus les totaux, et l'élève les calcule ──────────────────────
  // Tristan, le 03/10 au soir : *« il doit disposer d'un petit espace tableur intégré où il
  // doit saisir la formule pour trouver le temps. Même chose pour le poids : il doit
  // construire avec une somme pour avoir le poids total. »*
  //
  // Les deux vont ensemble, et l'ordre compte : tant que la jauge affiche « 179 / 180 kg »,
  // l'élève lit le nombre et le recopie, et la feuille de calcul est décorative. C'est le même
  // défaut que celui relevé le matin du 03/10 sur les cases de report, d'un cran plus haut.
  jaugesRepere: true,
  // L'entrepôt et la gare ne sont plus du décor : l'élève les pose comme les autres arrêts.
  // Tristan, le 04/10 : *« l'élève ne sélectionne ni le départ (entrepôt Boost) ni l'arrivée
  // (la gare) »*. Ces deux trajets pèsent pourtant lourd — l'aller depuis Carémeau et le retour
  // vers la gare font à eux seuls une bonne part des 22,1 km qu'il doit faire entrer dans son
  // temps de route. Avec `exigeConforme`, une chaîne incomplète refuse le report : oublier la
  // gare ne peut pas devenir une façon d'attraper le train.
  extremitesACliquer: true,
  // Les contraintes (charge, train) quittent le haut de l'écran et se posent à droite de la
  // feuille de calcul. Tristan, le 05/10 : *« les contraintes de droite descendent dans la
  // partie tableur »* — l'élève calcule à gauche, compare à droite.
  contraintesDansGrille: true,
  grille: {
    titre: 'Feuille de calcul du vélo-cargo',
    consigne: 'Les cellules colorées sont à remplir, et il faut y écrire une FORMULE — elle '
      + 'commence par « = ». Le résultat s’affiche à droite de chaque case au fur et à mesure. '
      + 'En jaune, les étapes du calcul ; en violet, les deux résultats à comparer aux '
      + 'contraintes. L’heure de départ, elle, se tape simplement (13:00). Si vous changez votre '
      + 'tournée, les données changent et vos formules se recalculent toutes seules.',
    colonnes: ['A', 'B'],
    decimales: 1,
    // Engendrée depuis le parcours que l'élève vient de cliquer : les lignes des arrêts sont
    // les SIENNES, dans SON ordre. Avec six arrêts chargés, les poids occupent B2 à B7 et le
    // total tombe en B8 — mais s'il en charge cinq, tout remonte d'une ligne. C'est voulu :
    // une plage se lit sur la grille qu'on a sous les yeux, pas apprise par cœur.
    //
    // Le temps se calcule en TROIS ÉTAPES (jaunes) puis un résultat (violet), dans l'ordre où
    // on le ferait à la main. Demande de Tristan, le 05/10 : d'abord distance ÷ vitesse, qui
    // donne des HEURES ; puis la conversion en minutes ; puis le temps aux arrêts ; enfin
    // l'heure de départ + le temps de route (en minutes) + le temps aux arrêts = l'heure
    // d'arrivée à la gare, qu'on compare au train. Les heures sont comptées en minutes depuis
    // minuit (13 h 00 = 780) : voir `heureFr` dans `core/formules.js`.
    lignes: (b) => {
      const n = b.retenus.length;
      // La distance est ARRONDIE au dixième comme elle est affichée, et les valeurs attendues
      // sont recalculées depuis cet arrondi : sinon l'élève, qui ne peut taper que ce qu'il
      // lit, serait en désaccord avec le moteur d'un centième de minute.
      const km = Math.round(b.km * 10) / 10;
      const heures = km / VELO.vitesse;
      const route = heures * 60;
      const service = n * VELO.service;
      return [
        { A: 'Arrêt', B: 'Poids (kg)', entete: true },
        ...b.retenus.map((p) => ({ A: p.nom, B: p.kg })),
        { A: 'Poids total chargé (kg)', type: 'resultat',
          note: 'Additionnez les poids de vos arrêts avec SOMME.',
          B: { saisie: true, formule: true, attendu: b.cumuls.charge, libelle: 'poids total' } },
        { A: 'Charge utile maximale (kg)', type: 'contrainte', B: VELO.chargeUtile },
        {},
        { A: 'Distance du parcours (km)', B: km },
        { A: 'Vitesse en ville (km/h)', B: VELO.vitesse },
        { A: 'Étape 1 · Temps de route (heures)', type: 'etape',
          note: 'Distance (km) ÷ vitesse (km/h) = temps (h). Exemple : 6 km à 12 km/h → 6 ÷ 12 = 0,5 h.',
          B: { saisie: true, formule: true, attendu: heures, tolerance: 0.01, decimales: 2,
               libelle: 'temps de route en heures' } },
        { A: 'Étape 2 · Temps de route (min)', type: 'etape',
          note: '1 heure = 60 minutes : on multiplie les heures par 60. Exemple : 0,5 h × 60 = 30 min.',
          B: { saisie: true, formule: true, attendu: route, tolerance: 0.5,
               libelle: 'temps de route en minutes' } },
        { A: 'Nombre d’arrêts', B: n },
        { A: 'Temps par arrêt (min)', B: VELO.service },
        { A: 'Étape 3 · Temps aux arrêts (min)', type: 'etape',
          note: 'Nombre d’arrêts × temps par arrêt.',
          B: { saisie: true, formule: true, attendu: service, libelle: 'temps aux arrêts' } },
        { A: 'Heure de départ',
          note: 'À taper sous la forme 13:00 (pas de formule ici).',
          B: { saisie: true, formule: false, attendu: VELO.depart, format: 'heure',
               placeholder: 'ex. 13:00', libelle: 'heure de départ' } },
        { A: 'Heure d’arrivée à la gare', type: 'resultat',
          note: 'Heure de départ + temps de route (min) + temps aux arrêts (min).',
          B: { saisie: true, formule: true, attendu: VELO.depart + route + service, tolerance: 0.5,
               format: 'heure', libelle: 'heure d’arrivée' } },
        { A: 'Départ du train (contrainte)', type: 'contrainte',
          B: { valeur: VELO.train, format: 'heure' } },
      ];
    },
  },
  mesures: [
    { id: 'charge', libelle: 'Charge du vélo-cargo', unite: 'kg', champ: 'kg', max: VELO.chargeUtile,
      comparaison: 'À comparer au poids total chargé (cellule violette).' },
    { id: 'colis', libelle: 'Colis chargés', unite: 'colis', champ: 'colis' },
  ],
  horaire: {
    depart: VELO.depart, limite: VELO.train, vitesse: VELO.vitesse, service: VELO.service,
    libelleLimite: 'départ du train',
    comparaison: 'À comparer à l’heure d’arrivée à la gare (cellule violette).',
  },
  titreReport: 'Reportez vos résultats sur la fiche de tournée',
  consigneReport: 'Ces deux résultats portent sur la décision, pas sur le calcul : aucune jauge '
    + 'ne les donne, il faut additionner la fiche. Les cases ne donnent pas la réponse : elles '
    + 'disent seulement si la vôtre est juste.',
  // DEUX cases, depuis le 05/10 (Tristan : « tu prends tes recommandations »). Il y en avait
  // quatre — 237, 57, 179, 36 — et deux d'entre elles faisaient doublon avec la feuille de
  // calcul : le poids chargé (179) et le temps aux arrêts (36) y sont calculés par formule et
  // corrigés par « Vérifier ». L'élève les tapait deux fois. C'est maintenant le jalon
  // « formules » qui note ce travail.
  //
  // Les deux qui restent portent sur la DÉCISION, que la feuille ne travaille pas : il faut
  // additionner les sept masses de la fiche — aucune jauge ne donne ce total, puisque la jauge
  // ne compte que ce qui est chargé — puis mesurer le dépassement.
  //
  // Ce qu'on NE demande pas, et volontairement : l'avance sur le départ du train. La valeur
  // attendue deviendrait négative dès qu'un élève est en retard, et faire taper « −12 » à un
  // élève de première qui s'est déjà trompé n'apprend rien. La jauge le lui dit en clair, et
  // c'est le jalon « horaire » qui en tient le compte.
  report: [
    { id: 'total', libelle: 'Masse totale des sept commandes', unite: 'kg',
      valeur: (b) => b.retenus.concat(b.ecartes).reduce((t, p) => t + Number(p.kg || 0), 0) },
    { id: 'trop', libelle: 'Masse qui ne peut pas partir aujourd’hui', unite: 'kg',
      valeur: (b) => b.retenus.concat(b.ecartes).reduce((t, p) => t + Number(p.kg || 0), 0)
        - VELO.chargeUtile },
  ],
};

/* ====================================================================== l'accueil ===== */

export const ACCUEIL = {
  titre: 'Organiser la tournée, dans l’ordre',
  // Une seule tuile : les écrans Catalogue, Stock, Réceptions et Commandes sont vides pour
  // cette séance (voir `contenus/boost.js`), et des compteurs à zéro ne diraient rien.
  kpis: ['mail'],
  etapes: [
    ['Lire la consigne du responsable', 'Menu Messagerie : la fiche de tournée du jour et ce qu’on attend de vous.'],
    ['Situer les sept clients', 'Menu Plan de Nîmes. Vous n’avez que le nom de la rue : cherchez-la sur un plan en ligne, puis écrivez la case.'],
    ['Valider le repérage', 'Les noms s’affichent sur le plan, et la tournée s’ouvre.'],
    ['Charger le vélo-cargo', 'Menu Tournée. Il part vide : cliquez les clients sur la carte, dans l’ordre où vous voulez y passer. Les sept commandes pèsent plus que sa charge utile, il faudra en laisser une à quai.'],
    ['Ordonner les arrêts', 'L’ordre est celui de vos clics. Pour en insérer un au milieu, utilisez les flèches ↑ et ↓ du récapitulatif. Le tracé et l’heure de retour suivent votre ordre.'],
    ['Calculer dans la feuille', 'Sous la carte : le poids total, puis le temps en trois étapes jusqu’à l’heure d’arrivée à la gare. Les contraintes sont à droite : comparez-les à vos deux résultats.'],
    ['Reporter vos résultats', 'Les deux cases du bas de la page, puis « Valider mes résultats ».'],
  ],
};

/* ======================================================================== le volet ==== */

export const VOLET = {
  id: 'boost-ent31',
  semer(prenom) {
    const now = Date.now();
    const fiche = DESTINATAIRES
      .map((d, i) => `${i + 1}. ${d.nom} — ${d.adresse} — ${d.colis} colis, ${d.kg} kg (${d.marque})`)
      .join('\n');
    return {
      mails: [
        { folder: 'in', ts: now - 3600e3 * 2, from: 'M. Morin, responsable d’exploitation',
          fromMail: 'exploitation@boost.example', to: prenom,
          subject: 'Tournée vélo-cargo du jour — à organiser avant 13 h', kind: 'text',
          text: `Bonjour ${prenom},\n\nVous prenez la tournée du vélo-cargo cet après-midi. `
            + `Rappel de la règle maison : nos colis partent en vélo-cargo jusqu’à la gare de `
            + `Nîmes-Centre, puis en train. Le train de Paris part à 16 h 10. Un colis qui `
            + `arrive après, c’est un client livré un jour plus tard.\n\nLe vélo-cargo emporte `
            + `au plus ${VELO.chargeUtile} kg. Vous partez de l’entrepôt à 13 h 00, comptez `
            + `${VELO.service} minutes par arrêt et une douzaine de kilomètres à l’heure en `
            + `ville.\n\nVoici les sept commandes à livrer :\n\n${fiche}\n\nTrois choses dans `
            + `l’ordre :\n\n1. Les clients ne nous donnent que le nom de leur rue. Situez-les `
            + `vous-même sur un plan, c’est la première chose qu’on fait ici.\n2. Additionnez `
            + `les masses. Si ça ne passe pas, décidez ce qui reste à quai — et dites-vous bien `
            + `que ce qui reste partira demain, donc autant que ce soit le moins pénalisant.\n`
            + `3. Mettez les arrêts dans un ordre qui vous ramène à la gare à l’heure.\n\n`
            + `Bon courage,\nM. Morin` },
      ],
    };
  },
};

/* ============================ Suivi de l'exercice ============================
 * Six jalons. Le barème de la séance, c'est leur nombre : chacun vaut 3,33 points sur 20
 * (il y en avait cinq, à 4 points, avant l'ajout du jalon « formules » le 05/10).
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente il est commencé, la réponse manque
 *   na      l'élève n'en est pas encore là
 *
 * Les jalons ne recalculent RIEN eux-mêmes : ils montent une seconde instance de la vue
 * tournée et lui demandent son bilan. Deux calculs parallèles — un pour l'écran, un pour le
 * suivi — finiraient par ne plus dire la même chose, et c'est l'enseignant qui le
 * découvrirait en corrigeant.
 */

const VUE = creerTournee(Object.assign({ plan: PLAN }, TOURNEE));

const etatDe = (db, vue) => (db && db.transport && db.transport[TRANSPORT_ID]
  ? db.transport[TRANSPORT_ID][vue] : null);

// L'élève a-t-il commencé ? Depuis que le vélo-cargo part VIDE (`departAQuai`), la réponse
// est simple : il a commencé dès qu'il a chargé quelque chose, ou tapé un résultat. Tant
// qu'il n'a rien chargé, on ne lui reproche rien — ni la charge, ni l'horaire.
//
// Ce n'est pas un détail : avec le véhicule vide, la charge est à 0 sur 180 et un jalon naïf
// la déclarerait « respectée » avant même que l'élève ait touché à quoi que ce soit. Il
// gagnerait un point en ne faisant rien.
function commencee(etat) {
  if (!etat || !etat.ordre) return false;
  if (etat.ordre.length) return true;
  return Object.keys(etat.report || {}).some((k) => String(etat.report[k] || '').trim() !== '');
}

const nomDe = (id) => (DESTINATAIRES.find((d) => String(d.id) === String(id)) || {}).nom || id;
const hhmm = (m) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')}`;

// Le client qu'il faut laisser à quai, et c'est le SEUL possible : avec 237 kg pour 180 kg
// utiles, il faut écarter au moins 57 kg, et La Pointe Sud (58 kg) est la seule commande qui
// y suffise à elle seule. Vérifié par énumération des 128 combinaisons, deux fois — avant et
// après le déplacement de l'entrepôt. Recalculé ici plutôt que recopié : si un poids change
// un jour, le jalon suit.
const A_QUAI = (() => {
  const trop = DESTINATAIRES.reduce((t, d) => t + d.kg, 0) - VELO.chargeUtile;
  const seuls = DESTINATAIRES.filter((d) => d.kg >= trop);
  return seuls.length === 1 ? String(seuls[0].id) : null;
})();

export const ETAPES = [
  {
    id: 'reperage',
    titre: 'Les sept clients situés sur le plan de Nîmes',
    verifier(db) {
      const e = etatDe(db, 'plan');
      if (!e || !e.juge || !Object.keys(e.juge).length) {
        return { status: e && e.secours ? 'attente' : 'na' };
      }
      const faux = DESTINATAIRES.filter((d) => e.juge[d.id] !== true);
      const detail = (faux.length
        ? `À revoir : ${faux.map((d) => d.nom).join(', ')}.`
        : 'Les sept points (case et quartier) sont justes.')
        + ` ${e.essais || 0} validation(s).`
        + (e.secours ? ' Mode hors connexion utilisé.' : '')
        + (e.force ? ' A continué sans avoir validé le repérage.' : '');
      if (e.force && !e.valide) return { status: 'ko', detail, ts: e.force };
      if (!e.valide) return { status: 'attente', detail };
      // Le repérage peut être « validé » avec une case fausse (toleres: 1). Le point, non.
      return { status: faux.length === 0 ? 'ok' : 'ko', detail, ts: e.valide };
    },
  },
  {
    id: 'choix',
    titre: 'La bonne commande laissée à quai',
    verifier(db) {
      const e = etatDe(db, 'tournee');
      if (!e || !e.ordre) return { status: 'na' };
      if (!commencee(e)) return { status: 'attente', detail: 'Rien n’est encore chargé.' };
      const quai = (e.quai || []).map(String);
      if (!quai.length) return { status: 'ko', detail: 'Tout a été chargé : le vélo-cargo déborde.' };
      const detail = `Laissé(s) à quai : ${quai.map(nomDe).join(', ')}.`
        + (A_QUAI ? ` Attendu : ${nomDe(A_QUAI)} seul.` : '');
      const juste = A_QUAI && quai.length === 1 && quai[0] === A_QUAI;
      return { status: juste ? 'ok' : 'ko', detail };
    },
  },
  {
    id: 'charge',
    titre: 'La charge utile du vélo-cargo est respectée',
    verifier(db) {
      const e = etatDe(db, 'tournee');
      if (!e || !e.ordre) return { status: 'na' };
      if (!commencee(e)) return { status: 'attente' };
      const b = VUE.bilan(e);
      const detail = `${b.cumuls.charge} kg chargés sur ${VELO.chargeUtile} kg utiles, `
        + `${b.retenus.length} arrêt(s).`;
      // Un vélo-cargo vide respecte le plafond, évidemment. Ça ne vaut pas un point.
      if (!b.retenus.length) return { status: 'attente', detail };
      return { status: b.cumuls.charge <= VELO.chargeUtile ? 'ok' : 'ko', detail };
    },
  },
  {
    id: 'horaire',
    titre: 'Le train de 16 h 10 est attrapé',
    verifier(db) {
      const e = etatDe(db, 'tournee');
      if (!e || !e.ordre) return { status: 'na' };
      if (!commencee(e)) return { status: 'attente' };
      const b = VUE.bilan(e);
      // Un ordre qui tient l'horaire en dépassant la charge ne vaut rien : le vélo n'aurait
      // pas pu partir chargé comme ça. Les deux contraintes se jugent ensemble.
      if (b.cumuls.charge > VELO.chargeUtile) {
        return { status: 'ko', detail: 'Le vélo-cargo est surchargé : l’horaire ne veut rien dire.' };
      }
      if (b.arrivee == null) return { status: 'attente' };
      const detail = `Retour prévu à ${hhmm(b.arrivee)} pour un train à ${hhmm(VELO.train)} — `
        + `${Math.round(Math.abs(VELO.train - b.arrivee))} min `
        + (b.enRetard ? 'de retard' : 'd’avance') + `, ${b.km.toFixed(1)} km.`;
      return { status: b.enRetard ? 'ko' : 'ok', detail };
    },
  },
  {
    id: 'report',
    titre: 'Les deux résultats reportés sont justes',
    verifier(db) {
      const e = etatDe(db, 'tournee');
      if (!e || !e.juge || !Object.keys(e.juge).length) return { status: 'na' };
      const faux = TOURNEE.report.filter((r) => e.juge[r.id] !== true);
      const b = VUE.bilan(e);
      const detail = TOURNEE.report.map((r) => `${r.libelle} : `
        + `${e.report && e.report[r.id] !== undefined && String(e.report[r.id]).trim() !== ''
          ? e.report[r.id] : '(vide)'} `
        + `(attendu ${r.valeur(b)}) — ${e.juge[r.id] === true ? 'juste' : 'à revoir'}`).join('\n');
      return { status: faux.length === 0 ? 'ok' : 'ko', detail, ts: e.valide || undefined };
    },
  },
  {
    // Ajouté le 05/10. Il note le travail de la feuille de calcul : toutes les formules justes,
    // c'est-à-dire « Vérifier » entièrement vert. Il se lit sur l'état de la feuille, que la
    // tournée efface dès que l'élève change son parcours (`invalider`) : un verdict ancien ne
    // peut donc pas valoir pour une tournée qui n'est plus la même.
    id: 'formules',
    titre: 'Les formules de la feuille de calcul sont justes',
    verifier(db) {
      const e = etatDe(db, 'tournee');
      const g = e && e.grille;
      if (!g) return { status: 'na' };
      const saisies = Object.keys(g.cases || {}).some((k) => String(g.cases[k] || '').trim() !== '');
      const juge = g.juge || {};
      if (!Object.keys(juge).length) return { status: saisies ? 'attente' : 'na' };
      // Une cellule restée vide n'est pas une faute, c'est du travail qui manque : `attente`.
      const faux = Object.keys(juge).filter((k) => juge[k] !== 'ok' && juge[k] !== 'vide');
      const vides = Object.keys(juge).filter((k) => juge[k] === 'vide');
      if (faux.length) return { status: 'ko', detail: `Cellules à revoir : ${faux.join(', ')}.` };
      if (vides.length || !g.valide) {
        return { status: 'attente', detail: vides.length ? `Cellules à remplir : ${vides.join(', ')}.` : undefined };
      }
      return { status: 'ok', detail: 'Toutes les formules sont justes.', ts: g.valide };
    },
  },
];
