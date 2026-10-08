// Vue « tournée » — organiser l'ordre des arrêts sous contrainte, puis reporter ses résultats.
//
// Seconde des deux vues de transport du noyau, écrite le 02/10/2026. Comme la vue plan, elle
// ne connaît ni l'entreprise, ni le véhicule, ni l'unité : **le contenu déclare ce qui se
// cumule et ce qui est plafonné**. Le noyau tient l'ordre, les déplacements, les cumuls, les
// jauges, les cases de report et leur correction.
//
// **Le geste principal est le clic sur la carte** (depuis le 04/10/2026, voir `CLIQUABLE` plus
// bas) : l'élève clique les clients dans l'ordre où il veut y passer, et chacun s'ajoute à la
// fin de la tournée. C'est le geste du métier, et c'est le seul qui marche partout — le clic
// n'a jamais échoué sur un poste, contrairement au glisser-déposer.
//
// Deux autres gestes restent, pour que personne ne reste bloqué (décision de Tristan du
// 02/10/2026) : l'élève **glisse** les arrêts pour les ordonner, et deux **flèches** font la
// même chose au clic. Ce ne sont plus les gestes de construction mais ceux de la retouche —
// insérer un arrêt au milieu sans défaire la fin. C'est le même choix que dans
// `core/types/ordre.js`.
//
// Un arrêt peut être **laissé à quai** : c'est ce qui rend la contrainte de charge parlante.
// Le véhicule ne peut pas tout emporter, donc il faut choisir — et le cumul se recalcule.
//
// Enfin l'élève **reporte** ses résultats dans des cases qui se corrigent seules. Le contenu
// décide, case par case, quelle valeur est attendue : c'est lui qui sait ce que l'élève doit
// calculer lui-même et ce qu'une jauge lui donne déjà.
//
//   creerTournee({
//     libelle: 'Tournée',                  // entrée de menu
//     titre, consigne,
//     plan: PLAN,                           // le même objet que la vue plan : positions, échelle
//     points: [{ id, nom, zone, kg, colis, … }],   // facultatif : par défaut, ceux du plan
//     mesures: [                            // ce qui se cumule sur les arrêts retenus
//       { id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: 180 },
//       { id: 'colis',  libelle: 'Colis',  unite: 'colis', champ: 'colis' },
//     ],
//     horaire: {                            // facultatif : la contrainte de temps
//       depart: 13 * 60, limite: 16 * 60 + 10, vitesse: 12, service: 6,
//       libelleLimite: 'départ du train',
//     },                                    // `service` : un nombre de minutes par arrêt, OU
//                                           //   { base: 4, parColis: 1, champ: 'colis' } (voir `serviceDe`)
//     report: [{ id, libelle, unite, tolerance, valeur: (bilan) => … }],
//   })
//
// L'état, rangé par l'appelant dans la base de l'élève :
//   { ordre: [id…], quai: [id…], report: { [id]: '…' }, juge: { [id]: bool }, valide: ts }
//
// `bilan` passé aux cases de report et aux jalons du contenu :
//   { retenus, ecartes, cumuls: { [idMesure]: nombre }, km, minutes, service, arrivee,
//     depassements: [idMesure…], enRetard,
//     arrivees: { [idPoint]: minutes }, creneaux: [{ id, nom, avant, libelle, charge, arrivee, rate }],
//     creneauxRates: [idPoint…], creneauRate }
//
// Deux options de séance d'ERREUR INDUITE (ENT-3.3, « la tournée à corriger », 02/10/2026) :
//
//   etatInitial: { ordre: [id…], quai: [id…], depart: true, arrivee: true }
//     La tournée est DÉJÀ construite à l'ouverture — celle d'un collègue, avec son erreur. `quai`
//     est facultatif (tout ce qui n'est pas dans `ordre`). Voir `amorcer` : l'état n'est installé
//     qu'UNE FOIS, marqué `amorce` dans la base de l'élève, et ne réécrase jamais son travail.
//     « Recommencer la tournée » remet alors CETTE tournée, pas une tournée vide.
//   sansVerdict: true
//     Les jauges gardent leurs limites mais ne disent plus si elles sont tenues (ni « dépassée »,
//     ni « raté », ni « respectée »), comme en copie rendue — sans les autres effets de la copie :
//     la feuille de calcul garde son bouton « Vérifier ». Quand l'élève doit DIAGNOSTIQUER une
//     tournée, l'écran ne doit pas lui donner le diagnostic.
//
// Des PASTILLES D'AVANCEMENT (ENT-3.3, chantier A du plan Boost, 03/10/2026) :
//
//   pastilles: [{ libelle: 'Contrôler', texte: 'Ne touchez pas encore à la carte…',
//                 fait: (db, etat) => booléen }, …]
//   rappel: ['Charge utile : 180 kg', …]     // facultatif : puces discrètes sous les étapes
//     Les étapes s'affichent en tête de la vue, en liste numérotée, chacune avec sa pastille :
//     grise « à faire », ou « fait » avec une coche et une bordure verte (jamais d'aplat : le vert
//     plein dit « juste » ailleurs). `fait` lit la base de l'élève (`db`, et `etat` = l'état de la
//     tournée) et ne juge JAMAIS : « une valeur est saisie », « un message est parti », « la tournée
//     a changé » — pas « c'est juste ». Sans `pastilles`, rien n'est dessiné.
//
// Un point peut porter un CRÉNEAU de livraison : `creneau: { avant: 14 * 60 + 45, libelle }`
// (ENT-3.2 : la Pâtisserie Arnaud n'accepte qu'avant 14 h 45). Voir `bilanDe`.
//
// Des PHASES : la journée change en cours de séance (ENT-3.2, « l'imprévu », chantier C du plan
// Boost, 03/10/2026) :
//
//   phases: { 2: { annules: [id…],                         // commandes annulées : barrées, non chargeables
//                  creneaux: { [id]: { avant, libelle } | null },   // créneau posé, déplacé ou levé (null)
//                  sansVerdict: true,                       // la phase ne dit plus si les limites tiennent
//                  consigne: '…' } }                        // facultatif : remplace la consigne
//     La phase en cours est rangée dans l'état (`etat.phase = { n, depuis, avant, depart }`), posée
//     par `passerPhase(etat, n)` — l'hôte l'appelle quand le contenu le décide (message déclenché,
//     voir `volet.declencheurs` dans entreprise.js). Sans `etat.phase`, c'est la phase 1 : la
//     journée telle que le contenu la déclare. Le bilan, la feuille, les jauges et les jalons lisent
//     tous les données de la phase EN COURS, par le même `bilanDe`. `avant` garde la tournée (et la
//     feuille) telle qu'elle était à l'instant du changement : les jalons de la phase 1 la lisent.
//     « Recommencer » remet la tournée de départ de la phase en cours (`depart`), pas une tournée
//     vide. Sans `phases`, rien de tout cela n'existe : ENT-3.1 ne bouge pas.
//
// ENT-3.3 EN DEUX TEMPS (chantier E du plan Boost, 03/10/2026, brief `ENT-3.3-deux-temps.md`) :
// contrôler le travail d'un collègue FIGÉ, puis le corriger. Options déclarées sur la vue OU sur
// une phase (`phases[n]`, la phase l'emporte) ; une vue qui n'en déclare aucune ne change pas :
//
//   fige: true                la tournée et la feuille se LISENT : carte non cliquable, aucun bouton
//                             (↑ ↓ retirer, charger, placer, Recommencer, ↺, Vérifier), champs en
//                             lecture seule, pas de pointage de cellule. Rien ne change l'état.
//   recapitulatif: false      ni la liste des arrêts, ni les bouts, ni le quai sous la carte.
//   etiquettes: true          les jauges (et leurs phrases) deviennent une ligne d'étiquettes au-dessus
//                             de la feuille — « Charge du vélo-cargo : 190 kg au plus » — sans verdict.
//                             Un tableau de textes remplace les étiquettes calculées.
//   consigneFeuille: '…'      remplace la consigne de la feuille de calcul.
//   pastilles, rappel         les pastilles et le rappel de la phase (voir plus haut).
//   raz: { libelle, confirmer, titre, toast }   les textes du bouton « Recommencer » de la phase.
//   termine: { libelle, confirmer, fait, rouvrir }
//                             un bouton « J'ai terminé » sous la feuille. Deux clics (le premier arme,
//                             comme « Recommencer ») ; il horodate `etat.termine`, et la vue se FIGE
//                             tant qu'il y est. Aucun verdict. `fait` est le texte affiché ensuite
//                             (« {h} » = l'heure) ; `rouvrir`, s'il est donné, est le libellé d'un
//                             bouton qui efface `termine` (sinon c'est définitif).
//
// DES ONGLETS qui suivent le parcours de l'élève (ENT-3.2, chantier F, décisions de Tristan du
// 03/10/2026 : « organiser la page en fonction du parcours élève ») — sur la vue ou sur une phase :
//
//   onglets: [{ id: 'donnees', libelle: 'Données et poids', texte: '…', fait: (db, etat) => booléen,
//               contenu: 'feuille', lignesFeuille: 11 },     // le haut de la feuille seulement
//             { id: 'tournee', libelle: 'Tournée', contenu: 'tournee', … },   // carte, arrêts, quai
//             { id: 'heures',  libelle: 'Heures',  contenu: 'calcul', … }]    // feuille entière
//     Un seul onglet à l'écran ; ils sont LIBRES (on va et vient), chacun avec sa pastille « à faire »
//     / « ✓ fait » (`fait` ne juge jamais) et un bouton « Étape suivante » en bas. Sur la carte, les
//     contraintes s'affichent en étiquettes ; sur « calcul », à droite de la feuille comme d'habitude.
//     L'onglet ouvert est gardé en mémoire le temps de la page ; à l'ouverture, et quand la phase
//     change (l'imprévu), c'est le premier qui n'est pas fait.

import { ech } from '../ui.js';
import { svgPlan, legendePlan, distanceKm } from './plan.js';
import { planDeCarte, kmCarte, carteTournee } from './carte.js';
import { normaliser, estJuste } from './numerique.js';
import { creerGrille } from './grille.js';

// On arrondit la minute AVANT de couper en heures : sinon 14 h 59 min 42 s s'écrivait « 14 h 60 ».
// L'heure d'un horodatage, en minutes depuis minuit, pour l'écrire avec `hhmm`.
const minutesDuJour = (ts) => { const d = new Date(ts); return d.getHours() * 60 + d.getMinutes(); };
export const hhmm = (m) => { const r = Math.round(m); return `${String(Math.floor(r / 60)).padStart(2, '0')} h ${String(r % 60).padStart(2, '0')}`; };
const fr = (n, d = 2) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d }).format(n);

export function creerTournee(T) {
  // Le plan est FACULTATIF. Une séance peut n'avoir qu'une contrainte de charge — ordonner
  // des arrêts et voir le plafond — sans aucune carte : c'est le cas de la plupart des
  // scénarios Simulog, où le transport n'est qu'une contrainte de plus et non le sujet.
  // Sans plan, pas de carte dessinée et pas de distance, donc pas d'horaire : seuls les
  // cumuls et leurs plafonds jouent. Avec plan, tout fonctionne.
  //
  // Depuis le 02/10/2026, le plan peut être la VRAIE carte de la ville (`plan.carte`, voir
  // `carte.js`). La tournée n'en sait presque rien : `planDeCarte` lui rend un plan comme les
  // autres (points, départ, arrivée), la distance d'un trajet se lit dans la table des
  // itinéraires par les rues au lieu de se mesurer à vol d'oiseau, et le dessin est délégué.
  // Tout le reste — ordre, quai, cumuls, horaire, report, feuille de calcul — est le même code.
  const PLAN = T.plan ? (T.plan.carte ? planDeCarte(T.plan) : T.plan) : null;
  const CARTE = PLAN && PLAN.carte ? carteTournee(PLAN) : null;
  const km1 = (a, b) => (CARTE ? kmCarte(PLAN, a, b) : distanceKm(PLAN, a, b));
  const POINTS = T.points || (PLAN ? PLAN.points : []);
  const MESURES = T.mesures || [];
  const H = T.horaire || null;
  const REPORT = T.report || [];
  const pointDe = (id) => POINTS.find((p) => String(p.id) === String(id));

  // ── Le temps de service d'un arrêt (chantier D, 03/10/2026, pour ENT-3.4) ───────────────
  // `horaire.service` est un nombre (6 min par arrêt, comme jusqu'ici) OU `{ base, parColis }` :
  // un arrêt coûte `base` minutes plus `parColis` minutes par colis livré (`champ`, 'colis' par
  // défaut). Un seul calcul, ici, que lisent les arrivées, le créneau, les jauges et le report —
  // et `outils/carte/calibrer.mjs` applique la même formule.
  const SERVICE_COLIS = !!(H && H.service && typeof H.service === 'object');
  const serviceDe = (p) => {
    if (!H) return 0;
    if (!SERVICE_COLIS) return Number(H.service || 0);
    const S = H.service;
    return Number(S.base || 0) + Number(S.parColis || 0) * Number((p && p[S.champ || 'colis']) || 0);
  };
  // Le temps par arrêt tel que l'écran le dit.
  const texteService = () => (SERVICE_COLIS
    ? `${fr(Number(H.service.base || 0))} min par arrêt, plus ${fr(Number(H.service.parColis || 0))} min par colis`
    : `${fr(Number(H.service || 0))} min par arrêt`);

  // ── Les phases de la journée (voir l'en-tête) ───────────────────────────────────────────
  // Une erreur de contenu (un client inconnu) est une erreur franche à la création, comme
  // `etatInitial` plus bas.
  const PHASES = T.phases || {};
  Object.keys(PHASES).forEach((n) => {
    const c = PHASES[n] || {};
    [...(c.annules || []), ...Object.keys(c.creneaux || {})].forEach((id) => {
      if (!pointDe(id)) throw new Error(`creerTournee : la phase ${n} cite « ${id} », qui n'est pas un point`);
    });
  });
  const numPhase = (e) => (e && e.phase && e.phase.n) || 1;
  const cfgPhase = (e) => PHASES[numPhase(e)] || null;
  const annulesDe = (e) => ((cfgPhase(e) || {}).annules || []).map(String);
  const estAnnule = (e, id) => annulesDe(e).includes(String(id));
  // Une option de la phase en cours, sinon celle de la vue (ENT-3.3 en deux temps).
  const optDe = (e, cle) => {
    const c = cfgPhase(e);
    return c && Object.prototype.hasOwnProperty.call(c, cle) ? c[cle] : T[cle];
  };
  // Figée par la phase, ou parce que l'élève a dit « J'ai terminé ».
  const figeDe = (e) => !!optDe(e, 'fige') || (!!optDe(e, 'termine') && !!(e && e.termine));
  // Les points de la phase en cours : sans les annulés, avec les créneaux de la phase. Un point
  // dont le créneau a changé porte `creneauChange` (et `creneauLeve` s'il n'en a plus) : l'écran
  // le repère. Les objets du contenu ne sont jamais modifiés.
  const pointsDe = (e) => {
    const c = cfgPhase(e);
    if (!c) return POINTS;
    const an = annulesDe(e);
    const cr = c.creneaux || {};
    return POINTS.filter((p) => !an.includes(String(p.id))).map((p) => {
      if (!Object.prototype.hasOwnProperty.call(cr, String(p.id))) return p;
      const q = Object.assign({}, p, { creneauChange: true });
      if (cr[String(p.id)]) q.creneau = cr[String(p.id)];
      else { delete q.creneau; q.creneauLeve = true; }
      return q;
    });
  };
  // Le numéro du client, celui que portent la fiche de tournée, le mail du responsable et le
  // rond bleu de la carte. Il ne bouge jamais ; l'ordre de passage, lui, est la pastille verte.
  const numeroDe = (id) => {
    const p = pointDe(id);
    if (p && p.numero != null) return p.numero;
    const i = POINTS.findIndex((q) => String(q.id) === String(id));
    return i < 0 ? '' : i + 1;
  };

  // ── La carte cliquable ──────────────────────────────────────────────────────────────────
  // Tristan, le 03/10/2026, après avoir fait tourner ENT-3.1 : *« en termes d'ergonomie je ne
  // suis pas totalement satisfait. Tout est laborieux, on pourrait repartir sur une carte
  // cliquable beaucoup plus intuitive ? »* Charger six commandes demandait six clics dans une
  // liste, les ordonner une dizaine de plus, et au moment d'ordonner la carte était déjà sortie
  // de l'écran.
  //
  // Donc : **on construit la tournée en cliquant les points sur la carte, dans l'ordre où on
  // veut y passer.** Un clic sur un point à quai l'ajoute À LA FIN de la tournée ; un clic sur
  // un point déjà chargé le retire. C'est aussi plus proche du métier — un logiciel de tournées
  // se pilote à la carte — et c'est le cahier des charges de Simulog.
  //
  // **Ajouter à la fin** est la règle la plus simple à expliquer à une classe : on ne discute
  // pas de l'endroit où l'arrêt se glisse, on le met au bout et on retouche ensuite avec les
  // flèches du récapitulatif. Celui-ci ne disparaît donc pas : c'est lui qui permet d'insérer
  // un arrêt au milieu sans défaire la fin, et c'est le second chemin si un poste du lycée
  // rendait le clic sur SVG capricieux.
  //
  // Elle n'existe que s'il y a un plan : sans carte, le récapitulatif reste la seule interface.
  const CLIQUABLE = !!PLAN && T.carteCliquable !== false;

  // Chaque clic redessine la vue entière, donc l'élément qui avait le focus DISPARAÎT. Au
  // clavier, l'élève se retrouvait renvoyé en haut de la page : son premier Entrée ajoutait
  // bien l'arrêt, le second ne faisait plus rien. Vu à l'essai, pas par un test — d'où ce
  // report du focus sur le même point après le redessin.
  //
  // Il n'est armé QUE par le clavier. Le rendre aussi après un clic de souris déplacerait la
  // page sous le curseur de l'élève à chaque arrêt ajouté.
  let focusApresRedessin = null;

  // ── Recommencer la tournée (Tristan, 02/10/2026 au soir) ────────────────────────────────
  // *« il faudrait une case où on peut reset le trajet dans le bandeau à droite »*. Défaire une
  // tournée de sept arrêts demandait sept clics « retirer » et deux sur les bouts. Le bouton
  // remet TOUT à quai, bouts compris, et efface la correction — mais garde les formules de la
  // feuille de calcul : l'élève qui recommence son ordre ne doit pas réécrire `=SOMME(…)`.
  //
  // Deux temps, sans boîte de dialogue du navigateur (elles bloquent les postes et les tests) :
  // le premier clic arme le bouton (« Tout remettre à quai ? »), le second confirme. Armé, il se
  // désarme au premier autre geste, puisque la vue se redessine.
  let razArme = false;
  let terminerArme = false;   // « J'ai terminé » : même geste en deux clics que « Recommencer »
  let ongletActif = null;     // les onglets (voir l'en-tête) : celui qui est ouvert, en mémoire
  let phaseVue = null;        // la phase du dernier dessin : un changement rouvre le premier onglet à faire

  // ── Les jauges se taisent ───────────────────────────────────────────────────────────────
  // `jaugesRepere: true`. Dès qu'on demande à l'élève de CALCULER le poids total et le temps,
  // les jauges ne doivent plus les afficher : sinon il lit *179 kg* sur la jauge, il le
  // recopie dans sa case, et la feuille de calcul ne sert à rien. C'est exactement le défaut
  // que Tristan avait relevé le 03/10 sur les cases de report — *« aucun travail de tournée à
  // faire »* — transposé d'un cran.
  //
  // Ce que l'outil continue de donner, parce que ce ne sont pas des compétences : la
  // **distance** du parcours (c'est de la géométrie sur une carte, et c'est le produit du
  // clic), le poids de chaque commande, la vitesse, le temps par arrêt, et les **limites**.
  // Ce qu'il ne donne plus : le poids **total**, le temps **total** et l'heure de retour.
  //
  // Les jauges deviennent donc des repères de limite. Elles gardent une chose, et une seule :
  // dire QUE la limite est franchie — sans dire de combien, ce qui redonnerait le total par
  // soustraction. Sans ça, l'élève n'aurait plus aucun moyen de savoir que son vélo-cargo est
  // trop chargé, et la contrainte disparaîtrait de la séance.
  //
  // Et elles se remplissent **après** validation, comme retour : le travail fait, le chiffre
  // revient.
  // ── La copie rendue (évaluation, 02/10/2026) ────────────────────────────────────────────
  // `copie: true`, posé par l'environnement d'entreprise quand la séance est une évaluation
  // (`meta.copie`). Décision de Tristan : « jauges muettes seulement ». L'élève garde les
  // LIMITES (180 kg, le train, le créneau) mais l'outil ne dit plus si elles sont tenues — ni
  // « dépassée », ni « raté », ni « limite respectée » : vérifier sa tournée fait partie de
  // l'épreuve. Le report s'enregistre sans juste / faux et sans refus (`exigeConforme` ne joue
  // plus), la feuille de calcul n'a plus de bouton « Vérifier », et rien ne se dévoile. La note
  // se calcule à la remise de la copie, par les jalons de la séance.
  const COPIE = !!T.copie;
  // Ne plus rien dire des contraintes franchies : la copie le veut, et la séance « à corriger »
  // aussi (`sansVerdict`) sans pour autant devenir une copie.
  const SANS_VERDICT = COPIE || !!T.sansVerdict;
  const REPERE = !!T.jaugesRepere || COPIE || !!T.sansVerdict;
  // Une PHASE peut aussi se taire (`phases[n].sansVerdict`, ENT-3.2 après l'imprévu : *« ma tournée
  // d'avant ne tient plus et rien à l'écran ne me le dit »*). `sv` est la valeur du dessin EN
  // COURS, posée en tête de `html` : les jauges la lisent pendant ce dessin, et lui seul.
  const svDe = (e) => SANS_VERDICT || !!(cfgPhase(e) || {}).sansVerdict;
  let sv = SANS_VERDICT;

  // La feuille de calcul, facultative. Elle n'est pas une vue de menu : elle se pose dans
  // cette page, sous les jauges, parce qu'elle est tirée des données que l'élève vient de
  // construire en cliquant.
  // ── Les deux bouts de la chaîne sont des arrêts à poser ─────────────────────────────────
  // `extremitesACliquer: true`. Tristan, le 04/10 : *« l'élève ne sélectionne ni le départ
  // (entrepôt Boost) ni l'arrivée (la gare) »*. Tant qu'ils étaient du décor, l'élève pouvait
  // finir la séance sans voir que sa tournée part de l'entrepôt et finit à la gare — alors que
  // ces deux trajets pèsent dans la distance et dans le temps qu'on lui fait calculer.
  //
  // Ils se cliquent donc comme les clients, et la tournée n'est **complète** que quand les deux
  // sont posés. Ils restent aux extrémités : on ne discute pas de l'endroit où ils vont, c'est
  // précisément la leçon — une tournée part du dépôt et finit là où on l'a dit.
  const EXTREMITES = !!T.extremitesACliquer;
  const departPose = (e) => !EXTREMITES || !!(e && e.depart);
  const arriveePose = (e) => !EXTREMITES || !!(e && e.arrivee);
  const chaineComplete = (e) => departPose(e) && arriveePose(e);

  const estRevele = (e) => !COPIE && !!(e && e.valide && e.juge && Object.keys(e.juge).length);

  const GRILLE = T.grille ? creerGrille(T.grille) : null;
  // ── Les contraintes descendent dans la feuille de calcul ─────────────────────────────────
  // `contraintesDansGrille: true`. Tristan, le 05/10 : *« les contraintes de droite descendent
  // dans la partie tableur »*. Les jauges quittaient l'écran de la carte pour se poser à droite
  // de la feuille : l'élève calcule son poids total et son heure d'arrivée à gauche, et lit à
  // droite si la limite est tenue — la comparaison qu'on lui demande de faire se fait d'un coup
  // d'œil. La carte et le récapitulatif, eux, se partagent le haut de la page.
  const DANS_GRILLE = !!T.contraintesDansGrille && !!GRILLE;
  const lignesGrille = (etat) => (T.grille && T.grille.lignes ? T.grille.lignes(bilanDe(etat)) : []);

  // ── D'où part l'élève : véhicule vide, ou véhicule plein ? ──────────────────────────────
  // Par défaut, tous les arrêts sont déjà chargés et l'élève retire ce qui ne passe pas.
  // `departAQuai: true` inverse le geste : le véhicule part **vide** et l'élève le charge.
  //
  // Tristan, le 03/10/2026 : *« lorsqu'on débloque la tournée, toutes les commandes sont
  // sélectionnées, ce n'est pas intuitif, je préfère qu'elle commence dans la catégorie
  // laissés à quai »*. Il a raison, et c'est aussi le geste réel : on charge un véhicule, on
  // ne le décharge pas. La jauge part alors de zéro et monte jusqu'au plafond, ce qui montre
  // la contrainte au lieu de l'annoncer.
  //
  // L'option reste déclarative : un scénario où le transporteur arrive déjà chargé et où le
  // travail consiste à retirer le surplus garde l'ancien comportement sans rien écrire.
  const vide = () => (T.departAQuai
    ? { ordre: [], quai: POINTS.map((p) => String(p.id)), report: {}, juge: {}, valide: null }
    : { ordre: POINTS.map((p) => String(p.id)), quai: [], report: {}, juge: {}, valide: null });

  // ── L'état de départ d'une séance « à corriger » ─────────────────────────────────────────
  // Une erreur de contenu (un client inconnu, un client à la fois chargé et à quai) est une erreur
  // franche à la création, pas un trou qu'on découvrirait à l'écran — comme `creerCarte`.
  const ids = POINTS.map((p) => String(p.id));
  if (T.etatInitial) {
    const I = T.etatInitial;
    const ordre = (I.ordre || []).map(String);
    const quai = (I.quai || ids.filter((id) => !ordre.includes(id))).map(String);
    [...ordre, ...quai].forEach((id) => {
      if (!ids.includes(id)) throw new Error(`creerTournee : etatInitial cite « ${id} », qui n'est pas un point`);
    });
    if (ordre.some((id) => quai.includes(id)) || new Set([...ordre, ...quai]).size !== ids.length) {
      throw new Error('creerTournee : etatInitial doit répartir chaque point une fois, chargé ou à quai');
    }
  }
  // Une copie neuve à chaque appel : l'élève modifie ces tableaux, le contenu ne doit jamais bouger.
  const etatDepart = () => {
    const I = T.etatInitial;
    if (!I) return vide();
    const ordre = (I.ordre || []).map(String);
    const quai = (I.quai || ids.filter((id) => !ordre.includes(id))).map(String);
    return { ordre, quai, report: {}, juge: {}, valide: null,
      depart: I.depart ? Date.now() : null, arrivee: I.arrivee ? Date.now() : null };
  };
  // Le départ de la PHASE EN COURS : après un imprévu, c'est la tournée telle qu'elle était à
  // l'arrivée du message (client annulé retiré), pas la tournée vide de la phase 1.
  const departDe = (e) => (numPhase(e) > 1 && e.phase.depart
    ? Object.assign({ report: {}, juge: {}, valide: null }, JSON.parse(JSON.stringify(e.phase.depart)))
    : etatDepart());
  // Le bouton « Recommencer » est inutile tant que la tournée est celle de départ.
  const estDepart = (e) => {
    const d = departDe(e);
    const cle = (x) => JSON.stringify([x.ordre, [...x.quai].sort(), !!x.depart, !!x.arrivee]);
    return cle(e) === cle(d);
  };

  /* ------------------------------------------------------------------ le calcul du bilan */
  // Tout se recalcule à partir de l'ordre courant, à chaque dessin. Rien n'est mémorisé :
  // une valeur mise en cache finirait par mentir après un déplacement.
  function bilanDe(etat) {
    // Les points de la PHASE en cours : un client annulé n'est ni chargé ni à quai — il ne
    // compte nulle part, même si un état ancien le citait encore.
    const PTS = pointsDe(etat);
    const dePhase = (id) => PTS.find((p) => String(p.id) === String(id));
    const retenus = etat.ordre.map(dePhase).filter(Boolean);
    const ecartes = etat.quai.map(dePhase).filter(Boolean);

    const cumuls = {};
    const depassements = [];
    MESURES.forEach((m) => {
      const s = retenus.reduce((t, p) => t + Number(p[m.champ] || 0), 0);
      cumuls[m.id] = s;
      if (m.max != null && s > m.max) depassements.push(m.id);
    });

    // Le trajet : départ → arrêts dans l'ordre → arrivée. Un arrêt coûte en plus son temps
    // de service, qui pèse souvent plus lourd que la distance en ville.
    // Le trajet ne compte que les bouts RÉELLEMENT posés. Une chaîne incomplète donne donc une
    // distance plus courte — et c'est exactement pour ça que le report des résultats la refuse :
    // sans ce garde-fou, oublier la gare deviendrait la façon la plus simple d'attraper le train.
    //
    // ── L'heure d'arrivée chez chaque client (02/10/2026, pour le créneau d'ENT-3.2) ─────────
    // Elle se lit dans la même boucle que les km : départ, plus les trajets cumulés jusqu'à ce
    // client (par les rues sur la carte réelle), plus le service des arrêts PRÉCÉDENTS — on
    // arrive chez le quatrième client après avoir servi les trois premiers, pas après l'avoir
    // servi lui. C'est la règle de `outils/carte/calibrer.mjs`, qui a calé la journée : les
    // deux calculs doivent tomber sur les mêmes 371 ordres, et un test le vérifie.
    let km = 0, minutes = 0, arrivee = null, service = 0;
    const arrivees = {};
    if (H && PLAN && retenus.length) {
      const suite = [];
      if (PLAN.depart && departPose(etat)) suite.push(PLAN.depart);
      retenus.forEach((p) => suite.push(p));
      if (PLAN.arrivee && arriveePose(etat)) suite.push(PLAN.arrivee);
      // Le service des arrêts déjà servis, cumulé au fil de la tournée.
      let servi = 0;
      suite.forEach((p, i) => {
        if (i > 0) km += km1(suite[i - 1], p);
        const j = retenus.indexOf(p);
        if (j >= 0) {
          arrivees[String(p.id)] = H.depart + km / H.vitesse * 60 + servi;
          servi += serviceDe(p);
        }
      });
      service = retenus.reduce((t, p) => t + serviceDe(p), 0);
      minutes = km / H.vitesse * 60 + service;
      arrivee = H.depart + minutes;
    }
    const enRetard = !!(H && arrivee != null && H.limite != null && arrivee > H.limite);

    // ── Les créneaux de livraison ────────────────────────────────────────────────────────
    // Décision de Tristan (02/10/2026) pour ENT-3.2 : un client n'accepte qu'avant une heure
    // donnée, et c'est ce qui fait que l'ordre compte vraiment — le plus court chemin le rate.
    // Un créneau ne se juge que si le client est CHARGÉ : laissé à quai, il n'est pas livré
    // aujourd'hui, ce n'est pas un retard. Sans horaire ni plan, aucune heure d'arrivée, donc
    // aucun créneau jugé — comme le train.
    //
    // « Avant 14 h 45 » admet 14 h 45 pile (`<=`), comme le calage.
    const creneaux = [];
    PTS.forEach((p) => {
      if (!p.creneau || p.creneau.avant == null) return;
      const id = String(p.id);
      const a = arrivees[id] == null ? null : arrivees[id];
      creneaux.push({
        id, nom: p.nom, avant: p.creneau.avant,
        libelle: p.creneau.libelle || `livraison avant ${hhmm(p.creneau.avant)}`,
        charge: etat.ordre.some((x) => String(x) === id),
        arrivee: a, rate: a != null && a > p.creneau.avant,
      });
    });
    const creneauxRates = creneaux.filter((c) => c.rate).map((c) => c.id);

    return {
      retenus, ecartes, cumuls, km, minutes, arrivee, depassements, enRetard,
      // Le temps passé aux arrêts, en minutes (avec un service par colis, il dépend des clients).
      service,
      arrivees, creneaux, creneauxRates, creneauRate: creneauxRates.length > 0,
      // Exposé pour les jalons du contenu, qui doivent pouvoir distinguer « mal organisé » de
      // « pas fini ». `arrivee` est déjà l'HEURE de retour, d'où les noms explicites.
      departPose: departPose(etat), arriveePose: arriveePose(etat), complete: chaineComplete(etat),
      // La phase et ses données, pour la feuille de calcul du contenu (elle suit la journée en cours).
      phase: numPhase(etat), points: PTS, annules: annulesDe(etat),
    };
  }

  /* --------------------------------------------------------------------------- les jauges */
  // `muet` : la jauge est un repère de limite et ne dit plus le total. Elle perd aussi sa
  // barre — un trait rempli à 99 % sur un plafond de 180 kg annoncerait « 179 » aussi sûrement
  // que le chiffre.
  function jauge(m, valeur, muet) {
    const max = m.max;
    const trop = max != null && valeur > max;
    const part = max ? Math.min(100, valeur / max * 100) : 0;
    // Seules les mesures PLAFONNÉES se taisent. Une mesure sans plafond n'est pas une
    // contrainte, donc il n'y a pas de « repère de limite » à en faire — et afficher
    // « à calculer » sur un total que personne ne demande enverrait l'élève travailler pour
    // rien. Vu à l'écran : les colis de Boost n'ont pas de maximum et aucune case ne les
    // réclame ; leur jauge disait pourtant « à calculer ».
    if (muet && max != null) {
      return `<div class="tour-jauge tour-jauge-repere ${trop && !sv ? 'trop' : ''}">
        <div class="tour-j-tete"><span>${ech(m.libelle)}</span>
          <b class="mono">max ${fr(max)} ${ech(m.unite || '')}</b></div>
        <span class="note">C'est la limite à ne pas dépasser.
          Le total, c'est à vous de le calculer.</span>
        ${m.comparaison ? `<span class="tour-compare">${ech(m.comparaison)}</span>` : ''}
        ${sv ? '' : (trop ? `<span class="pastille crit">${ech(m.libelle)} dépassée</span>`
          : (DANS_GRILLE && valeur > 0 ? '<span class="pastille ok">limite respectée</span>' : ''))}
      </div>`;
    }
    return `<div class="tour-jauge ${trop ? 'trop' : ''}">
      <div class="tour-j-tete"><span>${ech(m.libelle)}</span>
        <b class="mono">${fr(valeur)}${max != null ? ` / ${fr(max)}` : ''} ${ech(m.unite || '')}</b></div>
      ${max != null ? `<div class="tour-j-barre"><i style="width:${part}%"></i></div>` : ''}
      ${trop ? `<span class="pastille crit">${ech(m.libelle)} dépassée de ${fr(valeur - max)} ${ech(m.unite || '')}</span>` : ''}
    </div>`;
  }

  function jaugeHoraire(b, muet) {
    if (!H || b.arrivee == null) return '';
    const part = H.limite ? Math.min(100, (b.arrivee - H.depart) / (H.limite - H.depart) * 100) : 0;
    if (muet) {
      // La distance reste donnée : elle est le produit du parcours cliqué, pas un calcul que
      // l'élève doit savoir faire. Le nombre d'arrêts et le temps par arrêt aussi — ce sont
      // les données de son calcul, pas son résultat.
      return `<div class="tour-jauge tour-jauge-repere ${b.enRetard && !sv ? 'trop' : ''}">
        <div class="tour-j-tete"><span>${ech(H.libelleLimite || 'Horaire limite')}</span>
          <b class="mono">${H.limite != null ? hhmm(H.limite) : '—'}</b></div>
        ${DANS_GRILLE
          // Les données du calcul (distance, vitesse, arrêts) sont dans la feuille, à gauche :
          // les répéter ici les ferait lire deux fois sans rien apprendre.
          ? `<span class="note">Il faut être à la gare avant cette heure.
              L'heure d'arrivée, c'est à vous de la calculer.</span>`
          : `<span class="note">Départ à ${hhmm(H.depart)}. ${fr(b.km, 1)} km à parcourir,
              ${b.retenus.length} arrêt${b.retenus.length > 1 ? 's' : ''},
              ${ech(texteService())}, ${ech(String(H.vitesse))} km/h en ville.
              L'heure de retour, c'est à vous de la calculer.</span>`}
        ${H.comparaison ? `<span class="tour-compare">${ech(H.comparaison)}</span>` : ''}
        ${sv ? '' : (b.enRetard ? `<span class="pastille crit">${ech(H.libelleLimite || 'Horaire limite')} manqué</span>`
          : (DANS_GRILLE && b.complete ? '<span class="pastille ok">horaire tenu</span>' : ''))}
      </div>`;
    }
    return `<div class="tour-jauge ${b.enRetard ? 'trop' : ''}">
      <div class="tour-j-tete"><span>Retour prévu</span>
        <b class="mono">${hhmm(b.arrivee)}${H.limite != null ? ` / ${hhmm(H.limite)}` : ''}</b></div>
      <div class="tour-j-barre"><i style="width:${part}%"></i></div>
      <span class="note">${fr(b.km, 1)} km parcourus, ${fr(b.minutes, 0)} min au total
        (${b.retenus.length} arrêt${b.retenus.length > 1 ? 's' : ''}
        ${SERVICE_COLIS ? `: ${ech(texteService())}` : `× ${H.service || 0} min de service`}).</span>
      ${b.enRetard ? `<span class="pastille crit">${ech(H.libelleLimite || 'Horaire limite')} manqué
        de ${fr(b.arrivee - H.limite, 0)} min</span>` : ''}
    </div>`;
  }

  // Le retard à un créneau, en minutes entières : le même arrondi que l'heure affichée
  // (`hhmm`), et jamais « raté de 0 min » pour quelques secondes de trop.
  const retardMin = (c) => Math.max(1, Math.round(c.arrivee - c.avant));

  // Une jauge par client à créneau, sous celle du train : c'est une contrainte de plus, au même
  // rang que la charge et l'horaire. Muette (`jaugesRepere`), elle dit QUE le créneau est raté,
  // jamais de combien ni à quelle heure on arrive — ce serait la réponse de la feuille de
  // calcul. Parlante, elle donne l'heure d'arrivée et le retard.
  function jaugeCreneau(c, b, muet) {
    if (!H || !PLAN) return '';
    // Titre court : avec le nom du client, il passait sur deux lignes dans la colonne de droite
    // (vu à l'écran le 02/10) ; le nom va dans la note.
    const tete = `<div class="tour-j-tete"><span>Créneau</span>
        <b class="mono">${c.charge && c.arrivee != null && !muet ? `${hhmm(c.arrivee)} / ` : ''}${hhmm(c.avant)}</b></div>`;
    if (!c.charge) {
      return `<div class="tour-jauge tour-jauge-creneau${muet ? ' tour-jauge-repere' : ''}" data-creneau="${ech(c.id)}">
        ${tete}<span class="note">${ech(c.nom)} : ${ech(c.libelle)}. Ce client n’est pas dans la tournée.</span></div>`;
    }
    if (muet) {
      return `<div class="tour-jauge tour-jauge-creneau tour-jauge-repere ${c.rate && !sv ? 'trop' : ''}" data-creneau="${ech(c.id)}">
        ${tete}
        <span class="note">${ech(c.nom)} : ${ech(c.libelle)}. Il faut arriver chez ce client avant cette heure.
          L’heure d’arrivée chez lui, c’est à vous de la calculer.</span>
        ${sv ? '' : (c.rate ? '<span class="pastille crit">Créneau raté</span>'
          : (DANS_GRILLE && b.complete ? '<span class="pastille ok">créneau tenu</span>' : ''))}
      </div>`;
    }
    return `<div class="tour-jauge tour-jauge-creneau ${c.rate ? 'trop' : ''}" data-creneau="${ech(c.id)}">
      ${tete}
      <span class="note">${ech(c.nom)} : ${ech(c.libelle)}. Arrivée prévue à ${hhmm(c.arrivee)}.</span>
      ${c.rate ? `<span class="pastille crit">Créneau raté de ${retardMin(c)} min</span>`
        : '<span class="pastille ok">créneau tenu</span>'}
    </div>`;
  }

  /* ------------------------------------------------------------------- les pastilles */
  const pastillesDe = (e) => optDe(e, 'pastilles') || [];
  const faitDe = (p, db, etat) => { try { return !!p.fait(db, etat); } catch (e) { return false; } };
  const pastilleHtml = (fait) => `<span class="tour-pastille${fait ? ' fait' : ''}" data-etape-etat>`
    + `${fait ? '<span aria-hidden="true">✓</span> fait' : 'à faire'}</span>`;
  const etapesHtml = (etat, db) => (!pastillesDe(etat).length ? '' : `<ol class="tour-etapes" data-tour-etapes>
      ${pastillesDe(etat).map((p, i) => `<li class="tour-etape${faitDe(p, db, etat) ? ' fait' : ''}" data-etape="${i}">
        <span class="tour-etape-texte"><strong>${i + 1}. ${ech(p.libelle)}</strong>${p.texte ? ` : ${ech(p.texte)}` : ''}</span>
        ${pastilleHtml(faitDe(p, db, etat))}</li>`).join('')}
    </ol>${(optDe(etat, 'rappel') || []).length ? `<div class="tour-rappel">${optDe(etat, 'rappel').map((r) => `<span class="tour-rappel-puce">${ech(r)}</span>`).join('')}</div>` : ''}`);
  // Remet les pastilles à jour SANS redessiner : la feuille de calcul se remplit sur la même page.
  const majEtapes = (z, etat, db) => {
    z.querySelectorAll('[data-onglet-i]').forEach((b) => {
      const o = (optDe(etat, 'onglets') || [])[+b.dataset.ongletI];
      const sp = b.querySelector('[data-etape-etat]');
      if (!o || !sp) return;
      const fait = faitDe(o, db, etat);
      sp.classList.toggle('fait', fait);
      sp.innerHTML = fait ? '<span aria-hidden="true">✓</span> fait' : 'à faire';
    });
    z.querySelectorAll('[data-etape]').forEach((li) => {
      const p = pastillesDe(etat)[+li.dataset.etape];
      if (!p) return;
      const fait = faitDe(p, db, etat);
      li.classList.toggle('fait', fait);
      const sp = li.querySelector('[data-etape-etat]');
      if (sp) { sp.classList.toggle('fait', fait); sp.innerHTML = fait ? '<span aria-hidden="true">✓</span> fait' : 'à faire'; }
    });
  };

  /* ------------------------------------------------------------------------------- la vue */
  return {
    nav: { id: 'tournee', libelle: T.libelle || 'Tournée' },

    html(etat0, opts = {}) {
      const etat = Object.assign(vide(), etat0 || {});
      sv = svDe(etat);
      const b = bilanDe(etat);
      // Ce que l'écran affiche est la journée de la phase en cours (créneaux compris).
      const PTS = pointsDe(etat);
      const pointDe = (id) => PTS.find((p) => String(p.id) === String(id));
      const annules = annulesDe(etat);
      const juge = etat.juge || {};
      const aJuge = Object.keys(juge).length > 0;
      const n = etat.ordre.length;
      // ENT-3.3 en deux temps : la vue figée se lit, rien ne s'y clique (voir l'en-tête).
      const fige = figeDe(etat);
      const clic = CLIQUABLE && !fige;
      const recap = optDe(etat, 'recapitulatif') !== false;
      const etiq = optDe(etat, 'etiquettes');

      // Le repérage d'abord : sans lui, l'élève ne sait pas où sont les points, et la
      // tournée se ferait au hasard. La vue le dit plutôt que de se laisser ouvrir à vide.
      if (opts.verrou) {
        return `<div class="ent-tete"><h2>${ech(T.titre || 'Tournée')}</h2></div>
          <div class="avis">${ech(opts.verrou)}</div>`;
      }

      // Le créneau se lit aussi sur la ligne du client : c'est une donnée de son calcul.
      // Un créneau qui a CHANGÉ avec la phase est repéré (« nouveau », ou « plus de créneau ») :
      // l'élève doit voir ce qui a bougé, sans qu'on lui dise ce que ça fait à sa tournée.
      const creneauNote = (p) => {
        if (p.creneauLeve) return ' · <span class="tour-creneau tour-creneau-change" data-creneau-change>plus de créneau aujourd’hui</span>';
        if (!p.creneau || p.creneau.avant == null) return '';
        return ` · <span class="tour-creneau${p.creneauChange ? ' tour-creneau-change' : ''}"${p.creneauChange ? ' data-creneau-change' : ''}>`
          + `${ech(p.creneau.libelle || `livraison avant ${hhmm(p.creneau.avant)}`)}${p.creneauChange ? ' · nouveau' : ''}</span>`;
      };

      // Le récapitulatif, compact : une ligne par arrêt. Le numéro du client est posé AVANT le
      // nom — « 3 · La Pointe Sud » — pour faire le lien avec la fiche et avec le rond bleu de
      // la carte, et il reste en dehors du `<strong>` qui ne porte que le nom.
      const ligne = (id, pos) => {
        const p = pointDe(id);
        if (!p) return '';
        return `<li class="tour-item" draggable="${fige ? 'false' : 'true'}" data-pos="${pos}">
          <span class="tour-rang">${pos + 1}</span>
          <span class="tour-texte">
            <span class="tour-nom"><span class="tour-num mono">${ech(numeroDe(id))} ·</span><strong>${ech(p.nom)}</strong></span>
            <span class="note">${ech(p.zone || '')}${MESURES.map((m) => ` · ${fr(Number(p[m.champ] || 0))} ${ech(m.unite || '')}`).join('')}${creneauNote(p)}</span>
          </span>
          ${fige ? '' : `<span class="tour-boutons">
            <button class="btn btn-s" data-haut="${pos}" ${pos === 0 ? 'disabled' : ''}
              aria-label="Monter ${ech(p.nom)}">↑</button>
            <button class="btn btn-s" data-bas="${pos}" ${pos === n - 1 ? 'disabled' : ''}
              aria-label="Descendre ${ech(p.nom)}">↓</button>
            <button class="btn btn-s" data-quai="${ech(id)}"
              title="Laisser cet arrêt à quai, pour une autre tournée">retirer</button>
          </span>`}
        </li>`;
      };

      // Les deux bouts de la chaîne, encadrant le récapitulatif : l'élève lit sa tournée de
      // haut en bas comme elle se déroule — on part de l'entrepôt, on passe les clients, on
      // finit à la gare. Tant qu'un bout n'est pas posé, la ligne le dit et le bouton l'offre :
      // la carte reste le geste principal, mais personne ne doit rester coincé parce qu'il n'a
      // pas vu qu'un carré se cliquait.
      const bout = (quoi) => {
        if (!EXTREMITES || !PLAN) return '';
        const p = quoi === 'depart' ? PLAN.depart : PLAN.arrivee;
        if (!p) return '';
        const pose = quoi === 'depart' ? !!etat.depart : !!etat.arrivee;
        const mot = quoi === 'depart' ? 'Départ' : 'Arrivée';
        return `<div class="tour-bout${pose ? ' tour-bout-pose' : ''}">
          <span class="tour-rang tour-rang-bout">${quoi === 'depart' ? 'D' : 'A'}</span>
          <span class="tour-texte"><span class="tour-nom">
            <span class="tour-bout-lbl mono">${ech(mot)} ·</span><strong>${ech(p.nom)}</strong></span>
            <span class="note">${pose
              ? (quoi === 'depart' ? 'La tournée part d’ici.' : 'La tournée se termine ici.')
              : (fige ? 'Pas placé.' : `À placer : cliquez ${quoi === 'depart' ? 'l’entrepôt' : 'ce point'} sur la carte.`)}</span>
          </span>
          ${fige ? '' : `<span class="tour-boutons">
            <button class="btn btn-s" data-bout="${quoi}">${pose ? 'retirer' : 'placer'}</button>
          </span>`}
        </div>`;
      };

      // Les laissés à quai : un bandeau de puces et non plus une seconde liste de cartes.
      // Deux listes symétriques se confondaient (quatrième défaut relevé par Tristan) et elles
      // poussaient la carte hors de l'écran au moment même où l'élève en avait besoin. Ici,
      // c'est une ligne de puces, et la carte reste visible.
      const aQuai = etat.quai.filter((id) => pointDe(id));
      // Les commandes annulées par la phase : barrées, sans bouton — elles ne se chargent plus.
      const lignesAnnulees = !annules.length ? '' : `<div class="tour-annules" data-tour-annules>
        <div class="ent-lbl">Commandes annulées (${annules.length})</div>
        <ul class="tour-liste tour-puces">${annules.map((id) => {
          const p = POINTS.find((q) => String(q.id) === id);
          return !p ? '' : `<li class="tour-item tour-puce tour-puce-annule" data-annule="${ech(id)}">
            <span class="tour-texte"><span class="tour-nom"><s><span class="tour-num mono">${ech(numeroDe(id))} ·</span><strong>${ech(p.nom)}</strong></s></span>
            <span class="note">commande annulée : ne se charge plus</span></span></li>`;
        }).join('')}</ul></div>`;
      const quai = `<div class="tour-quai">
        <div class="ent-lbl">${ech(T.libelleQuai || 'Laissés à quai')} (${aQuai.length})</div>
        ${aQuai.length === 0
          ? '<p class="note">Aucun. Tout est chargé dans le véhicule.</p>'
          : `<ul class="tour-liste tour-liste-quai tour-puces">${aQuai.map((id) => {
              const p = pointDe(id);
              return !p ? '' : `<li class="tour-item tour-puce">
                <span class="tour-texte">
                <span class="tour-nom"><span class="tour-num mono">${ech(numeroDe(id))} ·</span><strong>${ech(p.nom)}</strong></span>
                <span class="note">${MESURES.map((m) => `${fr(Number(p[m.champ] || 0))} ${ech(m.unite || '')}`).join(' · ')}${creneauNote(p)}</span>
                </span>${fige ? '' : `<span class="tour-boutons">
                <button class="btn btn-s" data-reprendre="${ech(id)}">${ech(T.libelleCharger || 'reprendre')}</button>
                </span>`}</li>`;
            }).join('')}</ul>`}
        ${lignesAnnulees}
      </div>`;

      // Les jauges se taisent tant que le travail n'est pas validé. Après, elles le rendent :
      // c'est le retour, et il n'a plus rien à donner puisque l'élève a déjà répondu.
      //
      // Le dévoilement suit la correction EN COURS (`juge`), pas seulement l'horodatage de la
      // validation : `juge` est effacé dès que l'élève touche à sa tournée, donc les jauges se
      // retaisent au premier changement. Se fier au seul `valide` laissait une validation
      // ancienne dévoiler les totaux d'une tournée qui n'avait plus rien à voir.
      // Une phase qui se tait (`sansVerdict`) rend aussi les jauges muettes, validation ou pas.
      const muet = (REPERE && !estRevele(etat)) || (sv && !SANS_VERDICT);

      // Ce que dit la feuille quand ses formules sont toutes justes et que la tournée, elle,
      // ne tient pas : l'élève doit voir que ce n'est PAS son calcul qui est en cause. On dit
      // QUE une contrainte est franchie, jamais de combien (alerte n° 28).
      const gj = (etat.grille && etat.grille.juge) || {};
      const formulesJustes = Object.keys(gj).length > 0 && Object.values(gj).every((x) => x === 'ok');
      const contrainteFranchie = (b.depassements && b.depassements.length > 0) || b.enRetard || b.creneauRate;
      const avertissement = !sv && DANS_GRILLE && formulesJustes && contrainteFranchie
        ? 'Vos formules sont justes, mais la tournée ne respecte pas toutes les contraintes '
          + '(colonne de droite, en rouge). Le calcul est bon : c’est la tournée qu’il faut revoir.'
        : '';
      // Avec un état de départ (séance « à corriger »), recommencer = retrouver la tournée du
      // collègue, pas la vider : le bouton ne sert à rien tant qu'on y est. Après un imprévu
      // (phase 2 et plus), recommencer = retrouver la tournée de l'arrivée du message.
      const enPhase = numPhase(etat) > 1;
      const vierge = (T.etatInitial || enPhase) ? estDepart(etat) : (!n && !etat.depart && !etat.arrivee);
      const R = optDe(etat, 'raz') || {};
      const razTitre = R.titre ? R.titre : enPhase
        ? 'Remettre la tournée telle qu’elle était à l’arrivée du message. Les formules de la feuille de calcul sont gardées.'
        : (T.etatInitial
          ? 'Retrouver la tournée telle qu’elle était à l’ouverture. Les formules de la feuille de calcul sont gardées.'
          : 'Remettre toutes les commandes à quai et retirer le départ et l’arrivée. Les formules de la feuille de calcul sont gardées.');
      const razLibelle = razArme
        ? (R.confirmer ? R.confirmer : enPhase ? 'Revenir à la tournée de l’arrivée du message ? Cliquez pour confirmer'
          : (T.etatInitial ? 'Retrouver la tournée de départ ? Cliquez pour confirmer' : 'Tout remettre à quai ? Cliquez pour confirmer'))
        : (R.libelle ? R.libelle : (T.etatInitial && !enPhase ? 'Retrouver la tournée de départ' : 'Recommencer la tournée'));
      const raz = fige ? '' : `<div class="tour-raz">
          <button class="btn btn-s${razArme ? ' btn-alerte btn-p' : ''}" data-tour-raz ${vierge ? 'disabled' : ''}
            title="${razTitre}">${razLibelle}</button>
          ${razArme ? '<button class="btn btn-s" data-tour-raz-non>Annuler</button>' : ''}
        </div>`;
      const ONG = optDe(etat, 'onglets') || [];
      const jaugesHtml = `${etiq || ONG.length ? '' : raz}${MESURES.map((m) => jauge(m, b.cumuls[m.id], muet)).join('')}
            ${jaugeHoraire(b, muet)}${b.creneaux.map((c) => jaugeCreneau(c, b, muet)).join('')}`;
      // Les contraintes en ÉTIQUETTES : la limite seule, sans phrase ni verdict, en une ligne
      // au-dessus de la feuille. La feuille prend alors toute la largeur.
      const etiquettes = !etiq ? [] : (Array.isArray(etiq) ? etiq : [
        ...MESURES.filter((m) => m.max != null).map((m) => `${m.libelle} : ${fr(m.max)} ${m.unite || ''} au plus`.replace(/\s+/g, ' ')),
        ...(H && H.limite != null ? [`${(H.libelleLimite || 'Horaire limite').replace(/^./, (x) => x.toUpperCase())} : ${hhmm(H.limite)}`] : []),
        ...b.creneaux.map((c) => `${c.nom} : avant ${hhmm(c.avant)}`),
      ]);
      const etiquettesHtml = !etiq ? '' : `<div class="tour-etiquettes" data-tour-etiquettes>
          <span class="ent-lbl">Contraintes</span>
          ${etiquettes.map((x) => `<span class="tour-etiquette">${ech(x)}</span>`).join('')}
        </div>`;
      const avecDroite = DANS_GRILLE && !etiq;
      const consigneFeuille = optDe(etat, 'consigneFeuille');
      const grille = !GRILLE ? '' : GRILLE.html(lignesGrille(etat), etat.grille, Object.assign(avecDroite
        ? { droite: `<div class="tour-jauges gr-contraintes">${jaugesHtml}</div>`, avertissement }
        : {}, COPIE ? { sansCorrection: true } : {}, fige ? { lectureSeule: true } : {},
        consigneFeuille ? { consigne: consigneFeuille } : {}));

      // « J'ai terminé » (voir l'en-tête) : sous la feuille, jamais sur une phase figée d'office.
      const TE = !optDe(etat, 'fige') ? optDe(etat, 'termine') : null;
      const termine = !TE ? '' : (etat.termine
        ? `<div class="avis tour-termine" data-tour-termine>${ech(String(TE.fait || 'Terminé à {h}.')
            .replace('{h}', hhmm(minutesDuJour(etat.termine))))}
            ${TE.rouvrir ? `<button class="btn btn-s" data-tour-rouvrir>${ech(TE.rouvrir)}</button>` : ''}</div>`
        : `<div class="rangee tour-terminer">
            <button class="btn btn-p${terminerArme ? ' btn-alerte' : ''}" data-tour-terminer>${ech(terminerArme
              ? (TE.confirmer || 'Confirmer ? Cliquez encore') : (TE.libelle || 'J’ai terminé'))}</button>
            ${terminerArme ? '<button class="btn btn-s" data-tour-terminer-non>Annuler</button>' : ''}
          </div>`);

      const cases = !REPORT.length ? '' : `
        <div class="tour-report">
          <div class="ent-lbl">${ech(T.titreReport || 'Reportez vos résultats')}</div>
          ${T.consigneReport ? `<p class="note">${ech(T.consigneReport)}</p>` : ''}
          <div class="tour-cases">
            ${REPORT.map((r) => {
              const v = etat.report[r.id] == null ? '' : String(etat.report[r.id]);
              const j = juge[r.id];
              const cl = (!aJuge || COPIE) ? '' : (j ? 'juste' : 'faux');
              return `<label class="tour-case">
                <span>${ech(r.libelle)}</span>
                <span class="tour-saisie">
                  <input type="text" inputmode="decimal" class="champ ${cl}"
                    data-report="${ech(r.id)}" value="${ech(v)}" autocomplete="off">
                  ${r.unite ? `<span class="num-unite">${ech(r.unite)}</span>` : ''}
                </span>
                ${(!aJuge || COPIE) ? '' : (j
                  ? '<span class="pastille ok">juste</span>'
                  : '<span class="pastille crit">à revoir</span>')}
              </label>`;
            }).join('')}
          </div>
          ${etat.bloque && !COPIE ? `<div class="avis avis-err">${ech(etat.bloque)}</div>` : ''}
          ${COPIE && etat.enregistre ? `<div class="avis" data-tour-enregistre>Résultats enregistrés à ${ech(hhmm(minutesDuJour(etat.enregistre)))}.
            Ils seront corrigés quand vous rendrez votre copie ; vous pouvez encore les modifier d’ici là.</div>` : ''}
          ${(etat.bloque || !aJuge || COPIE) ? '' : (REPORT.every((r) => juge[r.id])
            ? '<div class="avis avis-ok">Tous les résultats sont justes.</div>'
            : `<div class="avis avis-err">${REPORT.filter((r) => !juge[r.id]).length} résultat(s)
                 à revoir. Reprenez votre calcul : les cases ne donnent pas la réponse.</div>`)}
          <div class="rangee" style="margin-top:12px">
            <button class="btn btn-p" data-tour-valider>${COPIE ? 'Enregistrer mes résultats' : 'Valider mes résultats'}</button>
          </div>
        </div>`;

      // La consigne de la phase en cours : après l'imprévu, celle d'avant serait fausse.
      const consigne = (cfgPhase(etat) || {}).consigne || T.consigne;
      // Le « Nouveau message » n'est plus affiché ici : l'hôte l'annonce par une carte qui reste, sur tous
      // les écrans (brief MOTEUR-questions-au-fil, lot 1, 08/10/2026).
      const blocCarte = `
        <div class="tour-grille${DANS_GRILLE && recap ? ' tour-grille-deux' : ''}${fige ? ' tour-fige' : ''}">
          <div class="tour-col">
            ${PLAN ? `<div class="plan-boite${clic ? ' plan-boite-clic' : ''}">
              ${CARTE ? CARTE.html({
                ordre: etat.ordre, cliquable: clic, annules,
                extremites: EXTREMITES, departPose: etat.depart, arriveePose: etat.arrivee,
              }) : svgPlan(PLAN, {
                noms: true, ordre: etat.ordre, cliquable: clic, id: 'tournee',
                extremites: EXTREMITES, departPose: etat.depart, arriveePose: etat.arrivee,
              })}
              ${legendePlan(PLAN, { ordre: etat.ordre, extremites: EXTREMITES })}
            </div>` : ''}
            ${!recap ? '' : `${DANS_GRILLE ? '</div><div class="tour-col">' : ''}
            ${T.libelleCharge ? `<div class="ent-lbl">${ech(T.libelleCharge)} (${n})</div>` : ''}
            ${fige ? `<p class="note">${ech(optDe(etat, 'noteFige') || 'Tournée en lecture seule : elle ne se modifie pas.')}</p>` : n === 0
              ? (CLIQUABLE
                ? `<p class="note">Rien n'est chargé. <strong>Cliquez les clients sur la carte</strong>,
                   dans l'ordre où vous voulez y passer : chacun s'ajoute à la fin de la tournée.${
                     EXTREMITES ? ' Et n’oubliez pas les deux bouts : le départ et l’arrivée se cliquent aussi.' : ''}</p>`
                : `<p class="note">Rien n'est chargé. Prenez les arrêts dans
                   « ${ech(T.libelleQuai || 'Laissés à quai')} » ci-dessous, puis ordonnez-les.</p>`)
              : (CLIQUABLE
                ? `<p class="note">Cliquez un client de la carte pour l'ajouter à la fin, ou pour le
                   retirer s'il est déjà chargé. Le tracé du plan suit votre ordre ; les flèches
                   ↑ et ↓ servent à insérer un arrêt au milieu.</p>`
                : `<p class="note">Glissez les arrêts pour les ordonner, ou utilisez les flèches
                   ↑ et ↓.${PLAN ? ' Le tracé du plan suit votre ordre.' : ''}</p>`)}
            ${bout('depart')}
            <ul class="tour-liste" id="tourListe">
              ${etat.ordre.map((id, i) => ligne(id, i)).join('')}
            </ul>
            ${bout('arrivee')}
            ${quai}`}
            ${etiq || ONG.length ? raz : ''}
          </div>
          ${DANS_GRILLE || etiq ? '' : `<div class="tour-jauges">${jaugesHtml}</div>`}
        </div>`;
      const tete = `
        <div class="ent-tete"><h2>${ech(T.titre || 'Tournée')}</h2></div>
        ${consigne ? `<p class="note">${ech(consigne)}</p>` : ''}`;

      // ── Les onglets (voir l'en-tête) : un seul à l'écran, dans l'ordre du parcours ─────────
      if (ONG.length) {
        if (phaseVue !== numPhase(etat)) { phaseVue = numPhase(etat); ongletActif = null; }
        if (!ONG.some((o) => o.id === ongletActif)) ongletActif = (ONG.find((o) => !faitDe(o, opts.db, etat)) || ONG[0]).id;
        const k = ONG.findIndex((o) => o.id === ongletActif);
        const O = ONG[k];
        const barreOnglets = `<div class="tour-onglets" role="tablist" aria-label="Étapes">${ONG.map((o, i) => `
          <button type="button" role="tab" class="tour-onglet${i === k ? ' actif' : ''}" aria-selected="${i === k}"
            data-tour-onglet="${ech(o.id)}" data-onglet-i="${i}"><span class="tour-onglet-num mono">${i + 1}</span>
            <span class="tour-onglet-lbl">${ech(o.libelle)}</span>${pastilleHtml(faitDe(o, opts.db, etat))}</button>`).join('')}
          </div>`;
        let corps = '';
        if (O.contenu === 'feuille') {
          corps = !GRILLE ? '' : GRILLE.html(lignesGrille(etat), etat.grille, Object.assign({ jusqua: O.lignesFeuille, sansVerifier: true },
            COPIE ? { sansCorrection: true } : {}, fige ? { lectureSeule: true } : {}, O.consigne ? { consigne: O.consigne } : {}));
        } else if (O.contenu === 'tournee') {
          // Sur la carte, les contraintes en étiquettes : l'élève les a sous les yeux en construisant.
          const etq = etiquettes.length ? etiquettes : [
            ...MESURES.filter((m) => m.max != null).map((m) => `${m.libelle} : ${fr(m.max)} ${m.unite || ''} au plus`.replace(/\s+/g, ' ')),
            ...(H && H.limite != null ? [`${(H.libelleLimite || 'Horaire limite').replace(/^./, (x) => x.toUpperCase())} : ${hhmm(H.limite)}`] : []),
            ...b.creneaux.map((c) => `${c.nom} : avant ${hhmm(c.avant)}`),
          ];
          corps = `<div class="tour-etiquettes" data-tour-etiquettes><span class="ent-lbl">Contraintes</span>
            ${etq.map((x) => `<span class="tour-etiquette">${ech(x)}</span>`).join('')}</div>${blocCarte}`;
        } else {
          corps = `${etiquettesHtml}${grille}${termine}${cases}`;
        }
        const suivant = k < ONG.length - 1 ? `<div class="rangee tour-suivant">
            <button type="button" class="btn btn-p" data-tour-onglet="${ech(ONG[k + 1].id)}">Étape suivante : ${ech(ONG[k + 1].libelle)} →</button>
          </div>` : '';
        return `${tete}${barreOnglets}
          ${O.texte ? `<p class="note tour-onglet-texte">${ech(O.texte)}</p>` : ''}
          <div role="tabpanel" data-tour-panneau="${ech(O.id)}">${corps}</div>${suivant}`;
      }

      return `${tete}
        ${etapesHtml(etat, opts.db)}
        ${blocCarte}
        ${etiquettesHtml}
        ${grille}
        ${termine}
        ${cases}`;
    },

    // Exposé pour les jalons du contenu : `verifier(db)` recalcule le bilan sans dessiner.
    bilan: bilanDe,

    // ── Installer la tournée de départ (séance « à corriger ») ──────────────────────────────
    // Appelé par l'hôte AVANT de dessiner. **Une seule fois** : l'état porte `amorce` (l'horodatage
    // de la pose), et tant qu'il y est, rien n'est refait — ni à la réouverture, ni au redessin,
    // ni après une reconnexion. C'est ce qui garantit qu'on n'écrase jamais le travail de l'élève.
    //
    // Un état qui porte DÉJÀ du travail (un arrêt chargé, un bout posé) mais pas de marque n'est
    // pas touché non plus : on pose seulement la marque. Rend vrai si quelque chose a changé, pour
    // que l'hôte sauve.
    amorcer(etat) {
      if (!T.etatInitial || !etat || etat.amorce) return false;
      const aTravaille = (etat.ordre && etat.ordre.length) || etat.depart || etat.arrivee;
      if (aTravaille) { etat.amorce = Date.now(); return true; }
      Object.assign(etat, etatDepart(), { amorce: Date.now() });
      return true;
    },

    // ── Passer à une phase de la journée (l'imprévu d'ENT-3.2) ─────────────────────────────
    // Appelé par l'hôte quand le contenu le décide. **Une seule fois** par phase : un état déjà à
    // cette phase (ou au-delà) n'est pas touché — ni au remontage, ni après une reconnexion.
    // Garde la tournée et la feuille d'AVANT (les jalons de la phase précédente les lisent),
    // retire les clients annulés de la tournée comme du quai, et note la tournée de départ de la
    // phase (celle que remet « Recommencer »). La correction en cours ne vaut plus rien : les
    // données ont changé sous les formules. Rend vrai si quelque chose a changé, pour que l'hôte sauve.
    passerPhase(etat, n) {
      if (!PHASES[n] || !etat || numPhase(etat) >= n) return false;
      if (!etat.ordre) Object.assign(etat, vide());
      const copie = (x) => JSON.parse(JSON.stringify(x));
      const bouts = (e) => ({ ordre: e.ordre, quai: e.quai, depart: e.depart || null, arrivee: e.arrivee || null });
      const avant = copie(Object.assign(bouts(etat), { grille: etat.grille || null }));
      const an = (PHASES[n].annules || []).map(String);
      etat.ordre = etat.ordre.filter((x) => !an.includes(String(x)));
      etat.quai = etat.quai.filter((x) => !an.includes(String(x)));
      etat.phase = { n, depuis: Date.now(), avant, depart: copie(bouts(etat)) };
      etat.juge = {}; etat.bloque = null; etat.valide = null; etat.termine = null;
      if (etat.grille) { etat.grille.juge = {}; etat.grille.valide = null; }
      return true;
    },

    brancher(z, api) {
      const etat = api.etat;
      if (!etat.ordre) Object.assign(etat, vide());
      const etaitArme = razArme;
      razArme = false;          // tout redessin désarme ; seul le premier clic ci-dessous réarme
      const terminerEtaitArme = terminerArme;
      terminerArme = false;
      // La carte réelle a son zoom, son échelle et ses traits à épaisseur d'écran : la scène se
      // remonte après chaque redessin, en gardant le zoom où l'élève l'avait laissé.
      if (CARTE) CARTE.brancher(z, { lecture: figeDe(etat) });
      if (!etat.report) etat.report = {};

      // Les onglets : changer d'onglet redessine, et remonte la page jusqu'à la barre des onglets.
      z.querySelectorAll('[data-tour-onglet]').forEach((b) => b.addEventListener('click', () => {
        ongletActif = b.dataset.tourOnglet;
        api.redessiner();
        const barre = z.querySelector('.tour-onglets');
        if (barre && barre.scrollIntoView) barre.scrollIntoView({ block: 'nearest' });
      }));

      // « J'ai terminé » : le premier clic arme, le second horodate et fige ; « Reprendre » défige.
      z.querySelector('[data-tour-terminer]')?.addEventListener('click', () => {
        if (!terminerEtaitArme) { terminerArme = true; api.redessiner(); return; }
        etat.termine = Date.now();
        api.sauver(); api.redessiner();
        if (api.toast) api.toast('Correction terminée.');
      });
      z.querySelector('[data-tour-terminer-non]')?.addEventListener('click', () => api.redessiner());
      z.querySelector('[data-tour-rouvrir]')?.addEventListener('click', () => {
        etat.termine = null;
        api.sauver(); api.redessiner();
      });

      // Figée : la feuille se lit (ses « ? » s'ouvrent encore), et rien d'autre ne se branche —
      // aucun geste ne peut changer l'état, même un clic forcé sur un bouton qui n'existe plus.
      if (figeDe(etat)) {
        if (GRILLE) {
          GRILLE.brancher(z, { etat: etat.grille || { cases: {}, juge: {} }, lignes: () => lignesGrille(etat), lectureSeule: true,
            sauver: () => {}, redessiner: api.redessiner, toast: api.toast });
        }
        return;
      }

      // Un ordre ou un chargement modifié invalide tout ce qui avait été jugé : les résultats
      // reportés ne valent plus rien. Les effacer est plus honnête que de laisser « juste »
      // affiché sous une tournée qui a changé.
      //
      // **`valide` part avec le reste**, et c'est ce qui manquait : il commande aussi le
      // dévoilement des jauges (`jaugesRepere`). Sans ça, un élève validait une tournée facile,
      // les jauges lui rendaient les totaux, et il lisait ensuite les chiffres de n'importe
      // quelle autre tournée sans plus rien calculer — le défaut même qu'on corrigeait.
      const invalider = () => {
        etat.juge = {};
        etat.bloque = null;
        etat.valide = null;
        // La correction de la feuille ne vaut plus rien non plus : les données ont changé sous
        // les formules. Sans ça, « juste » restait affiché sur un total devenu faux, et le
        // message « vos formules sont justes, mais… » se fondait sur un verdict périmé.
        if (etat.grille) { etat.grille.juge = {}; etat.grille.valide = null; }
      };

      const deplacer = (de, vers) => {
        if (vers < 0 || vers >= etat.ordre.length) return;
        const [x] = etat.ordre.splice(de, 1);
        etat.ordre.splice(vers, 0, x);
        invalider();
        api.sauver(); api.redessiner();
      };

      z.querySelectorAll('[data-haut]').forEach((btn) => btn.addEventListener('click', (e) => {
        e.stopPropagation(); deplacer(+btn.dataset.haut, +btn.dataset.haut - 1);
      }));
      z.querySelectorAll('[data-bas]').forEach((btn) => btn.addEventListener('click', (e) => {
        e.stopPropagation(); deplacer(+btn.dataset.bas, +btn.dataset.bas + 1);
      }));
      // Retirer et charger, les deux seuls mouvements entre la tournée et le quai. Le clic sur
      // la carte ci-dessous ne fait rien d'autre que les appeler : un seul chemin de code, donc
      // un seul endroit où l'état peut se tromper.
      const retirer = (id) => {
        etat.ordre = etat.ordre.filter((x) => String(x) !== String(id));
        if (!etat.quai.some((x) => String(x) === String(id))) etat.quai.push(String(id));
        invalider();
        api.sauver(); api.redessiner();
      };
      // **À la fin, toujours.** C'est la règle expliquée à la classe, et c'est ce qui fait de la
      // carte une construction et non une correction.
      const charger = (id) => {
        // Une commande annulée par la phase ne se charge plus, quel que soit le chemin du clic.
        if (estAnnule(etat, id)) return;
        etat.quai = etat.quai.filter((x) => String(x) !== String(id));
        if (!etat.ordre.some((x) => String(x) === String(id))) etat.ordre.push(String(id));
        invalider();
        api.sauver(); api.redessiner();
      };

      z.querySelectorAll('[data-quai]').forEach((btn) => btn.addEventListener('click', () => {
        retirer(btn.dataset.quai);
      }));
      z.querySelectorAll('[data-reprendre]').forEach((btn) => btn.addEventListener('click', () => {
        charger(btn.dataset.reprendre);
      }));

      // Les deux bouts : même bascule que les clients, au clic sur la carte comme au bouton du
      // récapitulatif. Les poser ou les retirer invalide la correction comme n'importe quel
      // autre changement — la tournée n'est plus la même.
      const basculerBout = (quoi) => {
        const cle = quoi === 'depart' ? 'depart' : 'arrivee';
        etat[cle] = etat[cle] ? null : Date.now();
        invalider();
        api.sauver(); api.redessiner();
      };
      z.querySelectorAll('[data-bout]').forEach((btn) => btn.addEventListener('click', () => {
        basculerBout(btn.dataset.bout);
      }));
      z.querySelectorAll('[data-clic-extremite]').forEach((cible) => {
        const quoi = cible.dataset.clicExtremite;
        cible.addEventListener('click', () => basculerBout(quoi));
        cible.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          basculerBout(quoi);
        });
      });

      // Le clic sur la carte. Un point déjà chargé se retire, un point à quai s'ajoute à la
      // fin : le même geste dans les deux sens, comme une case qu'on cocherait.
      //
      // Le CLAVIER est traité ici et non plus tard : chaque cible est un bouton (`role`,
      // `tabindex` posés dans `svgPlan`), donc Entrée et Espace doivent faire ce que fait la
      // souris. `preventDefault` sur Espace empêche la page de défiler sous l'élève.
      z.querySelectorAll('[data-clic-point]').forEach((cible) => {
        const id = cible.dataset.clicPoint;
        const basculer = () => {
          if (etat.ordre.some((x) => String(x) === String(id))) retirer(id); else charger(id);
        };
        cible.addEventListener('click', basculer);
        cible.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          focusApresRedessin = String(id);
          basculer();
        });
      });

      // Le report du focus, après que les cibles du nouveau dessin sont branchées.
      if (focusApresRedessin) {
        const vise = focusApresRedessin;
        focusApresRedessin = null;
        z.querySelectorAll('[data-clic-point]').forEach((c) => {
          if (String(c.dataset.clicPoint) === vise && c.focus) c.focus();
        });
      }

      // Glisser-déposer. Le repli au clic ci-dessus reste la voie sûre : si ce bloc ne
      // fonctionne pas sur un poste, la séance tient quand même.
      z.querySelectorAll('#tourListe .tour-item').forEach((li) => {
        li.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', li.dataset.pos);
          li.classList.add('glisse');
        });
        li.addEventListener('dragend', () => li.classList.remove('glisse'));
        li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('survol'); });
        li.addEventListener('dragleave', () => li.classList.remove('survol'));
        li.addEventListener('drop', (e) => {
          e.preventDefault();
          const de = +e.dataTransfer.getData('text/plain');
          deplacer(de, +li.dataset.pos);
        });
      });

      // La feuille de calcul. Elle a son propre état, rangé dans celui de la tournée : ses
      // formules survivent à un changement d'ordre, et c'est voulu — l'élève qui déplace un
      // arrêt ne doit pas avoir à réécrire `=SOMME(B2:B7)`. Les valeurs, elles, recalculent
      // toutes seules, et sa correction est effacée parce qu'elle ne vaut plus rien.
      if (GRILLE) {
        if (!etat.grille) etat.grille = { cases: {}, juge: {}, valide: null };
        GRILLE.brancher(z, {
          etat: etat.grille,
          lignes: () => lignesGrille(etat),
          sauver: () => { api.sauver(); majEtapes(z, etat, api.db); },
          redessiner: api.redessiner,
          toast: api.toast,
        });
      }

      z.querySelectorAll('[data-report]').forEach((el) => {
        const maj = () => { etat.report[el.dataset.report] = el.value; api.sauver(); };
        el.addEventListener('input', maj);
        el.addEventListener('change', maj);
      });

      z.querySelector('[data-tour-raz]')?.addEventListener('click', () => {
        if (!etaitArme) { razArme = true; api.redessiner(); return; }
        const enPhase = numPhase(etat) > 1;
        const neuf = departDe(etat);
        etat.ordre = neuf.ordre; etat.quai = neuf.quai;
        etat.depart = neuf.depart; etat.arrivee = neuf.arrivee;
        invalider();
        api.sauver(); api.redessiner();
        if (api.toast) {
          api.toast((optDe(etat, 'raz') || {}).toast || (enPhase ? 'Tournée remise comme à l’arrivée du message.'
            : (T.etatInitial ? 'Tournée de départ retrouvée.' : 'Tournée remise à zéro : tout est à quai.')));
        }
      });
      z.querySelector('[data-tour-raz-non]')?.addEventListener('click', () => api.redessiner());

      z.querySelector('[data-tour-valider]')?.addEventListener('click', () => {
        // Évaluation : on enregistre, on ne corrige pas, on ne refuse rien. Les cases sont déjà
        // sauvées à la frappe ; ce bouton rassure l'élève et horodate son report.
        if (COPIE) {
          etat.enregistre = Date.now();
          etat.juge = {}; etat.bloque = null; etat.valide = null;
          api.sauver(); api.redessiner();
          if (api.toast) api.toast('Résultats enregistrés.');
          return;
        }
        const b = bilanDe(etat);
        // ── Les résultats ne se valident pas tant que la tournée ne tient pas ──────────────
        // Défaut relevé par Tristan le 03/10/2026 : *« il suffit de garder les 6 premières et
        // on tombe juste, aucun travail de tournée à faire »*. Il a raison, et la cause est
        // structurelle : chaque case se corrige contre le bilan DE L'ÉLÈVE, donc une case ne
        // peut jamais juger son ordre. Dans ENT-3.1 (à l’époque des quatre cases), les valeurs attendues étaient même
        // identiques quel que soit l'ordre — 237, 57, 179, 36 — si bien qu'un élève obtenait
        // 4/4 en manquant le train de cinquante minutes.
        //
        // La réponse n'est pas de tordre une case, c'est de refuser le report tant que les
        // contraintes sont violées. L'élève est renvoyé à sa tournée, pas à son calcul, et
        // l'écran cesse de se contredire (quatre « juste » sous une jauge rouge).
        //
        // Déclaratif : `exigeConforme: true`. Une séance où le report porte sur un chargement
        // volontairement impossible n'en veut pas.
        const muetAuReport = (REPERE && !estRevele(etat)) || svDe(etat);
        if (T.exigeConforme) {
          // Quand les jauges se taisent, ce message doit se taire aussi : « dépassée de 57 kg »
          // sur un plafond de 180 rend le total par une soustraction, et l'élève n'a plus rien
          // à calculer. On dit QUE ça ne passe pas, pas DE COMBIEN.
          const maux = [];
          (b.depassements || []).forEach((id) => {
            const m = MESURES.find((x) => x.id === id);
            if (!m) return;
            maux.push(muetAuReport
              ? `${m.libelle.toLowerCase()} dépassée`
              : `${m.libelle.toLowerCase()} dépassée de ${fr(b.cumuls[id] - m.max)} ${m.unite || ''}`.trim());
          });
          if (b.enRetard) {
            maux.push(muetAuReport
              ? `${H.libelleLimite || 'horaire limite'} manqué`
              : `${H.libelleLimite || 'horaire limite'} manqué de ${fr(b.arrivee - H.limite, 0)} min`);
          }
          // Le créneau raté refuse le report au même titre que le train : c'est le cœur d'ENT-3.2.
          b.creneaux.filter((c) => c.rate).forEach((c) => {
            maux.push(muetAuReport
              ? `créneau raté chez ${c.nom}`
              : `créneau raté chez ${c.nom} (${retardMin(c)} min de retard)`);
          });
          if (!b.retenus.length) maux.push('aucun arrêt chargé');
          // La chaîne incomplète est refusée au même titre qu'une charge dépassée. Sans ça,
          // oublier la gare raccourcit le trajet et fait attraper le train sans rien faire —
          // le même trou que « il suffit de garder les 6 premières », à un autre endroit.
          if (!b.departPose && !b.arriveePose) maux.push('ni le départ ni l’arrivée ne sont placés');
          else if (!b.departPose) maux.push('le départ n’est pas placé');
          else if (!b.arriveePose) maux.push('l’arrivée n’est pas placée');
          if (maux.length) {
            etat.bloque = `Votre tournée ne tient pas encore : ${maux.join(', ')}. `
              + 'Reprenez le chargement et l’ordre des arrêts avant de reporter vos résultats.';
            etat.juge = {};
            etat.valide = null;
            api.sauver(); api.redessiner();
            if (api.toast) api.toast('Tournée à revoir avant de reporter.');
            return;
          }
        }
        etat.bloque = null;
        const juge = {};
        REPORT.forEach((r) => {
          juge[r.id] = estJuste(normaliser(etat.report[r.id]), r.valeur(b), r.tolerance);
        });
        etat.juge = juge;
        const fini = REPORT.every((r) => juge[r.id]);
        if (fini) etat.valide = Date.now(); else etat.valide = null;
        api.sauver(); api.redessiner();
        if (api.toast) api.toast(fini ? 'Résultats justes.' : 'Résultats à revoir.');
      });
    },
  };
}
