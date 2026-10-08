// Type « entreprise » — un environnement de travail complet, façon ERP.
//
// Portage de LogiSim dans Prepalog. Chaque élève travaille dans SA base : messagerie,
// commandes clients, préparation et bon de préparation, catalogue, stock, tiers, console.
// Rien n'est partagé entre élèves — c'est la portée `eleve`, un blob JSON par activité.
//
// Ce que Prepalog apporte et que LogiSim portait lui-même : la connexion, les groupes, le
// suivi de classe. Ce fichier ne garde que l'environnement lui-même.
//
// Le suivi est automatique : chaque univers déclare ses `etapes`, qui savent lire la base
// d'un élève et dire si le travail attendu est fait. Le score remonté au suivi de classe
// est le nombre d'étapes réussies.

import { ech, toast, confirmer, confirmerDansLaPage } from '../ui.js';
import { creerPlan } from './plan.js';
import { creerCarte } from './carte.js';
import { creerTournee } from './tournee.js';
import { creerInventaire } from './inventaire.js';
import { creerQuai } from './quai.js';
import { creerPlanning } from './planning.js';
import { creerLecteur } from './animation.js';
import { creerEntrepot } from './entrepot.js';
import { monterCalculette, demonterCalculette } from '../calculette.js';
import { creerDocuments } from './documents.js';
import { creerFiche } from './fiche.js';
import { compilerQuestions, etapesQuestions, reponse, repondu, etapeArrivee, etapeFaite, htmlQuestion, htmlPanneau, htmlEtape,
  appel, CLE_ETAPES } from './questions.js';
import { creerGesteTableur, retourDeTemps } from './export-tableur.js';
import { graineDeBase, poserGraine } from '../tirage.js';
import { gestesDe } from '../declencheurs.js';
import { preparerPhrases, texteCompose } from '../phrases.js';
import { brancherLexique, compterAide } from '../lexique.js';
import { controlerOptions, controlerIdentifiants } from './entreprise-options.js';
import { styleTheme, accentRougeOuVert } from './entreprise-theme.js';
import { eur, fdate, fdt, norm, pad, pastille, creerArticles } from './entreprise-outils.js';
import { bandeauFin as bandeauFinHtml } from './entreprise-fin.js';
import { monterBase } from './entreprise-base.js';
import { monterTiers } from './entreprise-tiers.js';
import { monterCatalogue } from './entreprise-catalogue.js';
import { monterStock } from './entreprise-stock.js';
import { monterBlocage } from './entreprise-blocage.js';
import { monterCommandes } from './entreprise-commandes.js';
import { monterReceptions } from './entreprise-receptions.js';
import { monterConsole } from './entreprise-console.js';
// Les formats ont changé d'adresse (lot 9c, module 3) : ils restent importables d'ici.
export { eur, fdate, fdt, norm, normLoc } from './entreprise-outils.js';
// La table des options a changé d'adresse (lot 9c, module 1) : `OPTIONS` reste importable d'ici (un test la lit).
export { OPTIONS } from './entreprise-options.js';


export function creerEntreprise(U) {
  controlerOptions(U);
  const { ENTREPRISE, VOCAB, CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM,
    baseDeDepart, etapes: etapesSeance = [], THEME = {} } = U;
  const { MODELS, MM, VARIANTS, VM } = CATALOGUE;
  // Les QUESTIONS AU FIL et les POINTS D'ÉTAPE (08/10/2026, brief MOTEUR-questions-au-fil, lot 2) : seulement si la séance
  // déclare `questions` (format en tête de `core/types/questions.js`). Contrôlées ici : une question mal déclarée empêche
  // la séance de se charger. Le moteur ajoute lui-même un jalon par question notée (poids pris dans la `part`).
  const MQ = U.questions ? compilerQuestions(U.questions, U.equipe) : null;
  const etapes = MQ ? etapesSeance.concat(etapesQuestions(MQ)) : etapesSeance;

  // Une entreprise porte plusieurs séances, qui partagent son univers mais pas leur consigne.
  // `exercice` (la ligne sous « Bonjour {prénom} ») et `accueil` (la marche à suivre) sont
  // donc déclarés par l'activité, pas par l'entreprise. Sans eux, on retombe sur ce que
  // portait ENTREPRISE : les modules écrits avant continuent de fonctionner.
  const exercice = U.exercice || ENTREPRISE.exercice || '';
  const accueil = U.accueil || null;
  // Le volet de la base propre à la séance : ses messages, ses livraisons. Il est semé au
  // premier passage, sans toucher au travail déjà fait dans les autres séances.
  const volet = U.volet || null;

  // La trame de la séance, téléchargeable depuis le BANDEAU — révisée le 01/10/2026.
  //
  // La règle du 30/09 voulait que la trame vive uniquement sur le document distribué : le
  // site porte l'environnement, la trame porte les consignes. Le principe ne change pas —
  // les consignes ne sont toujours pas recopiées dans les écrans — mais le fichier, lui,
  // est désormais à portée de clic. Deux raisons, toutes deux pratiques : l'enseignant
  // retrouve en deux secondes le PDF à imprimer, et une séance où l'impression n'a pas pu
  // se faire n'est plus perdue — l'élève télécharge sa trame et travaille dessus.
  //
  //   trame: { pdf: './contenus/trames/x-trame-eleve.pdf',
  //            docx: './contenus/trames/x-trame-eleve.docx' }
  //
  // **Déclarer la trame, c'est la valider.** Une séance dont la trame n'est pas relue n'en
  // déclare pas : le bandeau n'affiche alors rien, et personne ne travaille sur un
  // brouillon. Les deux formats sont facultatifs l'un comme l'autre.
  //
  // Les liens vivaient au milieu du menu de gauche jusqu'au 01/10/2026 au soir. Ils sont
  // remontés dans le bandeau avec la remise à zéro : ce sont des actions de séance, pas
  // des écrans de l'application, et en bas d'un menu de douze entrées personne ne les
  // cherchait.
  const trame = U.trame || null;
  // Une séance qui se fait tout entière à l'écran le dit dans le bandeau, à la place des
  // liens de trame (02/10/2026) : `sansTrame: "Tout à l'écran"`. Sans effet si une trame est
  // déclarée — on ne montre jamais les deux.
  const sansTrame = !trame && U.sansTrame ? String(U.sansTrame) : null;

  // Les deux vues de transport, ajoutées le 02/10/2026 pour la tournée du vélo-cargo.
  // Elles n'existent que si la séance les déclare : une entreprise qui n'a pas de
  // transport garde exactement les écrans d'avant, sans entrée de menu en plus. Le code
  // générique vit dans `plan.js` et `tournee.js` — il ne connaît ni la ville, ni le
  // véhicule, et TechPro comme le choix du véhicule en hériteront tels quels.
  //
  // Depuis le 02/10/2026, une séance peut déclarer la VRAIE carte de la ville à la place du
  // plan schématique : `plan.carte` (le module généré par `outils/carte/construire.py`) fait
  // choisir `carte.js`. Même contrat pour l'hôte — `nav`, `ouvreSuite`, `html`, `brancher` —
  // donc rien d'autre ne change ici. ENT-3.1 ne déclare pas de carte : elle garde son plan.
  // ── La copie rendue (évaluation, 02/10/2026, chantier A) ─────────────────────────────────
  // `copie: true`, passé par l'activité ET déclaré dans son `meta` (le suivi de classe et
  // `core/app.js` le lisent là). Décisions de Tristan pour ENT-3.4, et toutes les évaluations :
  //   - pendant le travail, rien ne remonte au suivi : pas de « meilleur score » qu'on améliore
  //     en réessayant ;
  //   - aucune correction à l'écran : la tournée garde ses limites, sans dire si elles sont
  //     tenues, et ses cases s'enregistrent sans juste / faux (voir `copie` dans tournee.js) ;
  //   - « Rendre ma copie », une seule fois ; la note est calculée à la remise et figée ;
  //   - après la remise, l'environnement se consulte mais ne se modifie plus, sans note affichée.
  // L'enseignant ramasse les copies non rendues et peut en rouvrir une (core/copie.js).
  const COPIE = !!U.copie;
  const VPLAN = U.plan ? (U.plan.carte ? creerCarte(U.plan) : creerPlan(U.plan)) : null;
  const VTOUR = U.tournee ? creerTournee(Object.assign({ plan: U.plan }, U.tournee, COPIE ? { copie: true } : {})) : null;
  // L'écran « Inventaire » (02/10/2026, chantier E), sur le même principe : il n'existe que si
  // la séance déclare un `inventaire` — format dans `claude/prepalog-inventaire-format.md`.
  //
  // UN INVENTAIRE TIRÉ PAR ÉLÈVE (évaluation, 04/10/2026, Cdiscount ENT-2.5), sur le modèle du quai :
  // la séance passe `inventaire` sous forme de FONCTION de la graine (`(graine) => déclaration`).
  // L'écran est celui de CETTE base (`invDeBase`), fixé par `rendre` après la pose de la graine.
  const INV_TIRE = typeof U.inventaire === 'function' ? U.inventaire : null;
  const invsTires = new Map();
  const invDeGraine = (g) => {
    if (!invsTires.has(g)) invsTires.set(g, creerInventaire(INV_TIRE(g), CATALOGUE));
    return invsTires.get(g);
  };
  let VINV = INV_TIRE ? invDeGraine('') : (U.inventaire ? creerInventaire(U.inventaire, CATALOGUE) : null);
  // Le GESTE TABLEUR (04/10/2026, chantier C5, `core/types/export-tableur.js`) : il n'existe que si
  // la séance déclare un `tableur` — écran « Extractions » (critères au-dessus du tableau,
  // « Exporter » sort ce qu'on voit), écran « Fichiers » (le dépôt), rappel dans le bandeau d'aide.
  const VTAB = U.tableur ? creerGesteTableur(U.tableur) : null;
  // L'écran « Quai de réception » (03/10/2026, chantier P1, pilote Picard), même principe : il
  // n'existe que si la séance déclare un `quai` (format en tête de `core/types/quai.js`). Son
  // état vit dans `db.quais[<quai.id>]`. En évaluation, il porte le chrono réel et la note sur 20.
  //
  // UN QUAI TIRÉ PAR ÉLÈVE (évaluation, 03/10/2026, chantier P6, `core/tirage.js`) : la séance passe
  // alors `quai` sous forme de FONCTION de la graine (`(graine) => déclaration du quai`). La graine
  // (l'identifiant de l'élève) est posée dans sa base à la première ouverture (`db.tirage`) ; l'écran,
  // la note et le ramassage lisent tous le quai de CETTE base (`quaiDeBase`), jamais un quai commun.
  const OPTS_QUAI = COPIE ? { copie: true } : {};
  const QUAI_TIRE = typeof U.quai === 'function' ? U.quai : null;
  const quaisTires = new Map();
  const quaiDeGraine = (g) => {
    if (!quaisTires.has(g)) quaisTires.set(g, creerQuai(QUAI_TIRE(g), OPTS_QUAI));
    return quaisTires.get(g);
  };
  const QUAI_FIXE = U.quai && !QUAI_TIRE ? creerQuai(U.quai, OPTS_QUAI) : null;
  const quaiDeBase = (db) => (QUAI_TIRE ? quaiDeGraine(graineDeBase(db)) : QUAI_FIXE);
  // Le quai de l'écran ouvert : celui de la base de l'élève, fixé par `rendre`.
  let VQUAI = QUAI_TIRE ? quaiDeGraine('') : QUAI_FIXE;
  // L'écran « Planning » (04/10/2026, brief `docs/briefs/MOTEUR-vue-planning.md`), même principe : il
  // n'existe que si la séance déclare un `planning` (format en tête de `core/types/planning.js`). Son
  // état vit dans `db.plannings[<planning.id>]`. L'aléa arrive par un déclencheur `phasePlanning: 2`.
  const VPL = U.planning ? creerPlanning(U.planning, COPIE ? { copie: true } : {}) : null;
  // L'écran « Plan d'entrepôt » (04/10/2026, brief `docs/briefs/MOTEUR-vue-plan-entrepot.md`), même
  // principe : il n'existe que si la séance déclare un `entrepot` (format en tête de
  // `core/types/entrepot.js`). Son état vit dans `db.entrepots[<entrepot.id>]`.
  const VENT = U.entrepot ? creerEntrepot(U.entrepot, COPIE ? { copie: true } : {}) : null;
  // Les DOCUMENTS JOINTS (04/10/2026, brief `docs/briefs/MOTEUR-documents-formulaire.md`, lot 1) : une
  // fiche de poste, des CV… que l'élève lit sans les saisir. Ils n'existent que si la séance les déclare
  // (format en tête de `core/types/documents.js`) ; un mail semé les joint par `pieces: [ids]`.
  const VDOC = U.documents ? creerDocuments(U.documents, U.documentsStyle) : null;
  // La FICHE À REMPLIR (même brief, lot 2) : un écran de plus, seulement si la séance déclare `fiche`
  // (format en tête de `core/types/fiche.js`). Son état vit dans `db.fiches[<fiche.id>]`.
  // Plusieurs fiches (05/10/2026, ENT-5.8) : `fiches: [F1, F2]` ; la première garde l'écran `fiche`, les
  // autres ont `fiche:<id>`. Une fiche qui déclare `quand(db)` reste hors du menu tant que c'est faux.
  const VFICHES = [].concat(U.fiche || [], U.fiches || []).map((F) => creerFiche(F, VDOC));
  const VFICHE = VFICHES[0] || null;
  // L'ANIMATION À QUESTIONS (05/10/2026, brief `docs/briefs/MOTEUR-vue-animation.md`) : un écran de plus,
  // seulement si la séance déclare `animation` (ou `animations: [A, B]`, rare) — format en tête de
  // `core/types/animation.js`. Son état vit dans `db.animations[<animation.id>]`. Le contenu est vérifié
  // ici : un pas, une place ou un objet inconnu empêche la séance de se charger.
  const VANIMS = [].concat(U.animation || [], U.animations || []).map((A) => creerLecteur(A));
  VANIMS.forEach((VA, i) => { if (VANIMS.findIndex((x) => x.id === VA.id) !== i) throw new Error(`animation ${VA.id} déclarée deux fois`); });
  controlerIdentifiants([['quai', 'quais', [VQUAI].filter(Boolean)], ['planning', 'plannings', [VPL].filter(Boolean)],
    ["plan d'entrepôt", "plans d'entrepôt", [VENT].filter(Boolean)], ['fiche', 'fiches', VFICHES], ['animation', 'animations', VANIMS]]);
  const vueAnim = (VA) => `animation:${VA.id}`;
  // LES GESTES connus de la séance (questions au fil, lot 3) : la liste que publie chaque vue déclarée. Un `apresGeste`
  // qui en cite un autre (faute de frappe, vue absente) empêche la séance de se charger : on ne découvre pas en classe
  // une question qui n'arrive jamais. Contrôlé plus bas, quand toutes les vues sont créées.
  const animDeVue = (v) => VANIMS.find((VA) => vueAnim(VA) === v) || null;
  const vueDeFiche = (VF) => (VF === VFICHE ? 'fiche' : `fiche:${VF.id}`);
  const ficheDeVue = (v) => VFICHES.find((VF) => vueDeFiche(VF) === v) || null;
  {
    const connus = new Set([...VFICHES, ...VANIMS, VPL, VENT, VQUAI].filter(Boolean).flatMap((V) => V.signaux || []));
    const cites = [];
    (U.volet && U.volet.declencheurs || []).forEach((d) => gestesDe(d.quand).forEach((g) => cites.push([g, `message « ${d.id} »`])));
    if (MQ) {
      MQ.fil.forEach((q) => [q.quand, q.rattrapage].forEach((f) => gestesDe(f).forEach((g) => cites.push([g, `question « ${q.id} »`]))));
      MQ.etapes.forEach((e) => gestesDe(e.apres).forEach((g) => cites.push([g, `point d’étape « ${e.id} »`])));
    }
    cites.forEach(([g, ou]) => {
      if (!connus.has(g)) throw new Error(`${ou} : geste inconnu « ${g} » (gestes des vues de cette séance : ${[...connus].join(', ') || 'aucun'})`);
    });
  }

  // Couleurs des variantes et modes de livraison : fournis par le contenu (univers de l'entreprise), jamais importés
  // par le moteur. Sans table, une couleur inconnue n'a ni nom ni pastille ; un code de livraison inconnu s'affiche
  // tel quel, avec un port de 0.
  const COLORS = U.couleurs || {};
  // Le menu de la séance (05/10/2026, demande de Tristan : « il est mélangé, parfois on a des données parfois
  // non »). Les écrans propres à la séance (fiche, quai, planning, plan d'entrepôt, plan, tournée, inventaire,
  // extractions, fichiers) n'apparaissent que si elle les déclare, comme avant. Les écrans de DONNÉES,
  // communs à toutes les entreprises, se choisissent avec `menu: ['receptions', 'stock', …]` ; sans `menu`,
  // tous restent (rien ne disparaît d'une séance qui ne l'a pas demandé). Accueil et Messagerie : toujours.
  const ECRANS_DONNEES = ['commandes', 'receptions', 'stock', 'catalogue', 'blocage', 'clients', 'fournisseurs', 'console'];
  if (U.menu) U.menu.forEach((id) => { if (!ECRANS_DONNEES.includes(id)) throw new Error(`menu : écran inconnu « ${id} » (écrans : ${ECRANS_DONNEES.join(', ')})`); });
  const MENU = U.menu ? new Set(U.menu) : null;
  // Un écran de données absent du menu ne s'ouvre pas non plus par un lien (tuile de l'accueil, retour).
  // ÉCRAN FERMÉ PAR UNE CONDITION (ENT-1.1 §7.10, 06/10/2026) : `fermetures: { quai: { ouvertSi(db), message } }`.
  // L'entrée du menu reste visible, grisée, avec le message, tant que `ouvertSi(db)` est faux ; l'écran ne
  // s'ouvre pas non plus par un autre chemin. Pour l'élève seulement : l'enseignant navigue librement.
  const FERMETURES = U.fermetures || {};
  const montre = (v) => !MENU || !ECRANS_DONNEES.includes(v) || MENU.has(v)
    || (v === 'commande' && MENU.has('commandes')) || (v === 'reception' && MENU.has('receptions')) || (v === 'produit' && MENU.has('catalogue'));
  // Les aides « articles » (désignation, couleur, taille, état du stock) : `entreprise-outils.js` (lot 9c, module 3).
  const A = creerArticles({ CATALOGUE, VOCAB, couleurs: COLORS });
  const { SIMPLE, unite, label, nomCouleur, swatch, precision, precisionTexte, thVariante, tdVariante,
    etatStock, pastilleStock, REF_EX, MODELE_EX } = A;

  // La note d'une base : le nombre d'étapes réussies. Sert au suivi en direct, à la remise de la
  // copie, et à l'enseignant qui ramasse une copie (il lit la base de l'élève sans l'ouvrir).
  // Une étape qui plante sur une base incomplète compte comme non faite, sans tout arrêter.
  // POIDS (lot A bis, 07/10/2026) : un jalon peut déclarer `poids`, sa part de la note ; la somme des poids d'une
  // séance vaut 20 (le moteur le vérifie à l'ouverture). Sans `poids`, chaque jalon vaut 1 (le score est le
  // nombre de jalons réussis, comme avant). `compte: false` (lot 2 de SMOBY-notation, 07/10/2026) : un jalon de
  // passage (la signature du BL en ENT-5.4) qui ne pèse rien et n'a pas de ligne au bandeau de fin ; il doit
  // quand même être jugé pour que la séance soit finie.
  const poidsDe = (e) => (e.compte === false ? 0 : typeof e.poids === 'number' ? e.poids : 1);
  const AVEC_POIDS = etapes.some((e) => typeof e.poids === 'number');
  const MAX_POIDS = Math.round(etapes.reduce((t, e) => t + poidsDe(e), 0) * 1e6) / 1e6;
  const ERREUR_POIDS = AVEC_POIDS && Math.abs(MAX_POIDS - 20) > 1e-6
    ? `La somme des poids des jalons${MQ && MQ.part ? ` (avec la part des questions, ${MQ.part})` : ''} vaut ${MAX_POIDS} au lieu de 20 : la note sur 20 serait faussée.` : '';
  if (ERREUR_POIDS) console.warn('[entreprise] ' + ERREUR_POIDS);
  const arrondi = (x) => Math.round(x * 1000) / 1000;

  // UN JALON QUI PLANTE (chantier 5 de docs/chantiers.md, 08/10/2026). Un `verifier(db)` qui lève une exception est un bug
  // du CONTENU (clé renommée, donnée absente, coquille), pas une faute de l'élève : il prend l'état 'erreur', distinct
  // de 'ok', 'ko' et 'attente'. Il ne rapporte aucun point (comme 'ko'), mais il n'est pas compté « faux » (bandeau de
  // fin : « à vérifier », jamais ✗), il n'entre pas dans `premier` du repérage, et il compte comme JUGÉ pour la fin de
  // séance (`bilanComplet`, photo de fin, rattrapage des questions) : aucun élève n'est bloqué par un bug de contenu.
  // L'erreur est journalisée (`console.error`, une fois par séance + jalon + message) et rangée chez l'élève,
  // `db.indicateurs[séance].erreurs = { [jalon]: message }`, d'où elle remonte au Suivi de classe (encadré Repérage).
  let seanceMontee = '';                        // posé par `rendre` : l'id de la séance, pour le journal et le rangement
  let ecritureErreurs = () => false;            // posé par `rendre` : vrai chez l'élève dont la copie n'est pas rendue
  const dejaSignale = new Set();
  function signaler(quoi, x) {
    const message = x && x.message ? x.message : String(x);
    const cle = `${seanceMontee}|${quoi}|${message}`;
    if (!dejaSignale.has(cle)) {
      dejaSignale.add(cle);
      console.error(`[entreprise] séance ${seanceMontee || ENTREPRISE.id || ENTREPRISE.nom || '?'} : ${quoi} : ${message}`);
    }
    return message;
  }
  // Les messages du moment, tels que `noterBase` vient de les relever : ce qui ne plante plus s'efface du repérage.
  function rangerErreurs(db, erreurs) {
    if (!db || !seanceMontee || !ecritureErreurs()) return;
    const r = db.indicateurs && db.indicateurs[seanceMontee];
    const aucune = !Object.keys(erreurs).length;
    if (aucune && !(r && r.erreurs)) return;
    if (!db.indicateurs) db.indicateurs = {};
    const R = r || (db.indicateurs[seanceMontee] = {});
    if (aucune) delete R.erreurs; else R.erreurs = erreurs;
  }

  function noterBase(db) {
    const detail = {};
    const erreurs = {};
    let ok = 0;
    etapes.forEach((e) => {
      let st = 'ko';
      try { st = e.verifier(db, U).status; } catch (x) { st = 'erreur'; erreurs[e.id] = signaler(`le jalon « ${e.id} » plante`, x); }
      detail[e.id] = st;
      if (st === 'ok') ok += poidsDe(e);
    });
    rangerErreurs(db, erreurs);
    // Le niveau figé dans la séance, pour l'enseignant qui relit le détail d'une note.
    if (db && db.aisance === 'confirme') detail.niveau = 'confirmé';
    // Un jeu tiré par élève (inventaire tiré, ou `tirage: true`) : la graine, pour retrouver son jeu.
    if (INV_TIRE || U.tirage) detail.graine = graineDeBase(db);
    // Le repérage de l'élève (2de, lot 6) : temps, aides ouvertes, jalons réussis du premier coup,
    // par séance. Lu par l'enseignant seul, dans le suivi de classe ; jamais montré à l'élève.
    if (db && db.indicateurs) detail.indicateurs = db.indicateurs;
    // Les réponses aux questions (et les sorties de page) remontent avec le repérage de la séance : rien de neuf côté
    // Firebase, aucune règle à publier. Copie, pour ne pas les ranger deux fois dans la base de l'élève.
    if (MQ && db && db.questions && db.questions[MQ.id]) {
      const ind = Object.assign({}, detail.indicateurs || {});
      ind[MQ.id] = Object.assign({}, ind[MQ.id] || {}, { questions: db.questions[MQ.id] });
      detail.indicateurs = ind;
    }
    // Les titres des jalons (07/10/2026), pour que le Repérage nomme les jalons ratés au lieu de leurs identifiants
    // (`ligne-laura`) : le suivi ne charge pas la séance, il lit tout ici. Aucune écriture de plus : la première
    // remontée de la note après l'ouverture écrit de toute façon. Pas de titres sans repérage.
    if (db && db.indicateurs) detail.titres = Object.fromEntries(etapes.map((e) => [e.id, e.titre || e.id]));
    // Les documents de la séance (nombre et noms courts), pour la colonne « Documents ouverts » du repérage :
    // le suivi ne charge pas la séance, il lit tout ici.
    if (VDOC) detail.documents = { total: VDOC.ids().length,
      noms: Object.fromEntries(VDOC.ids().map((id) => [id, VDOC.doc(id).court || VDOC.doc(id).titre || id])) };
    // Le quai range aussi ses temps dans le détail : le temps réel passé en guidage sert à caler
    // les seuils de rapidité de l'évaluation (décision de Tristan, 03/10/2026). En évaluation, la
    // note n'est plus le nombre d'étapes : 15 points de réception + 5 de rapidité (`noteQuai`).
    // Le planning en évaluation : jalons réussis / jalons × 20, détail jalon par jalon (brief §7).
    if (VPL && VPL.note) {
      const n = VPL.note(db);
      detail.planning = n.detail;
      return { score: n.score, max: n.max, detail };
    }
    // Le plan d'entrepôt en évaluation : même principe (jalons réussis / jalons × 20).
    if (VENT && VENT.note) {
      const n = VENT.note(db);
      detail.entrepot = n.detail;
      return { score: n.score, max: n.max, detail };
    }
    const VQ = quaiDeBase(db);
    if (VQ) {
      const q = (db && db.quais && db.quais[VQ.id]) || {};
      detail.quai = { reel: Math.round(q.reel || 0), froid: q.froid || 0, tiersTemps: !!q.tiersTemps };
      // Quai tiré : le jeu reçu, l'attendu et la réponse, jalon par jalon (lisible par l'enseignant).
      if (QUAI_TIRE) {
        detail.quai.graine = graineDeBase(db);
        if (VQ.resume) detail.quai.jeu = VQ.resume(db);
      }
      if (VQ.note) {
        const n = VQ.note(db);
        Object.assign(detail.quai, { reception: Math.round(n.reception * 100) / 100, jalons: n.pts, sur: n.nJalons,
          horsFroid: n.ptsFroid, reelPts: n.ptsReel, rapidite: Math.round(n.vitesse * 100) / 100,
          complet: n.complet, justes: n.justes, palettes: n.nPalettes });
        return { score: n.score, max: n.max, detail };
      }
    }
    return { score: arrondi(ok), max: arrondi(MAX_POIDS), detail };
  }

  return {
    copie: COPIE,
    // Pour le ramassage des copies (core/copie.js) : la note de la base d'un élève.
    noter(db) { return noterBase(JSON.parse(JSON.stringify(db || {}))); },
    rendre(hote, ctx) {
      if (!!(ctx.meta && ctx.meta.copie) !== COPIE) {
        hote.innerHTML = `<div class="avis avis-err">Évaluation mal déclarée : « copie » doit figurer
          dans le meta de l'activité ET dans ce qu'elle passe à creerEntreprise.</div>`;
        return;
      }
      if (ERREUR_POIDS) {
        hote.innerHTML = `<div class="avis avis-err">${ech(ERREUR_POIDS)}</div>`;
        return;
      }
      if (MQ && MQ.id !== ctx.meta.id) {
        hote.innerHTML = `<div class="avis avis-err">Les questions déclarent la séance « ${ech(MQ.id)} », mais cette séance est « ${ech(ctx.meta.id)} ».</div>`;
        return;
      }
      if (ctx.meta.portee !== 'eleve') {
        hote.innerHTML = `<div class="avis avis-err">Un environnement d'entreprise doit être de portée « eleve ».</div>`;
        return;
      }

      const db = ctx.jeu.etat();
      const prenom = ctx.profil.prenom || ctx.profil.nom || 'Élève';
      const estProf = ctx.profil.role === 'prof';
      seanceMontee = ctx.meta.id;
      // Le message d'un écran fermé par sa condition (voir FERMETURES), ou '' s'il est ouvert. Une condition
      // qui plante sur une base incomplète n'enferme personne.
      const fermeture = (v) => {
        const fe = etapeQuiFerme(`ecran:${v}`);
        if (fe) return `Fais d’abord le point d’étape avec ${appel(MQ.personnes[fe.de])}.`;
        const F = FERMETURES[v];
        if (!F || estProf) return '';
        try { return F.ouvertSi(db) ? '' : (F.message || 'Pas encore ouvert.'); } catch (x) { signaler(`la condition d'ouverture de l'écran « ${v} » plante`, x); return ''; }
      };

      // Le niveau de l'élève DANS CETTE SÉANCE (brief MOTEUR-statut-annulee, 03/10/2026) :
      // `db.aisance`, 'standard' ou 'confirme', recopié du réglage de l'enseignant (`ctx.aisance`,
      // core/amenagements.js) à la création de la base, puis FIGÉ : un changement de réglage vaut
      // pour les séances suivantes, jamais pour une séance commencée. `db.aisancePour` dit quelle
      // séance l'a figé : une base reprise d'une autre séance (photo `precedente`, parcours à base
      // partagée) le refige pour la sienne. L'enseignant qui ouvre une séance : toujours standard.
      // Le moteur n'en fait rien lui-même ; `baseDeDepart`, `semer`, les déclencheurs et les jalons
      // le lisent dans la base. Jamais affiché à l'élève.
      const aisanceReglee = () => (!estProf && ctx.aisance === 'confirme' ? 'confirme' : 'standard');
      function figerAisance() {
        if (db.aisancePour === ctx.meta.id && (db.aisance === 'standard' || db.aisance === 'confirme')) return false;
        db.aisance = aisanceReglee();
        db.aisancePour = ctx.meta.id;
        return true;
      }

      // Premier passage : on sème la base de départ. `_depart` porte les messages, qui
      // reçoivent ici leur identifiant — le reste de l'application n'a plus à s'en soucier.
      const baseNeuve = !db.v;
      if (baseNeuve) {
        figerAisance();
        const depart = baseDeDepart(prenom, { aisance: db.aisance });
        Object.keys(depart).forEach((k) => { if (k !== '_depart') db[k] = depart[k]; });
        (depart._depart || []).forEach((m) => ajouterMail(m));
        ctx.jeu.sauver();
      }
      // Les listes que tout le moteur suppose présentes. Appelée à l'ouverture ET après une
      // remise à zéro : `baseDeDepart` n'en fournit qu'une partie (ni `receptions`, ni `transport`).
      function normaliserBase() {
        ['moves', 'mails', 'orders', 'receptions', 'customers', 'suppliers'].forEach((k) => { if (!db[k]) db[k] = []; });
        // L'état des vues de transport vit dans la base de l'élève, comme le reste de son
        // travail : un repérage validé doit se retrouver après une fermeture d'onglet, et
        // d'une semaine sur l'autre.
        if (!db.transport) db.transport = {};
      }
      normaliserBase();
      // Une base d'avant le niveau (ou reprise d'une autre séance) le reçoit à son ouverture. Pas
      // une copie d'évaluation déjà commencée : elle peut être rendue, plus rien ne s'y écrit.
      if (!baseNeuve && !COPIE && figerAisance()) ctx.jeu.sauver();
      // Jeu tiré par élève (quai, inventaire, ou `tirage: true` pour une séance qui ne tire que ses
      // données) : la graine (son identifiant) posée une fois pour toutes, AVANT le volet — qui peut
      // la lire — puis son quai et son inventaire.
      if (QUAI_TIRE || INV_TIRE || U.tirage) {
        if (poserGraine(db, ctx.profil.uid || prenom)) ctx.jeu.sauver();
        if (QUAI_TIRE) VQUAI = quaiDeBase(db);
        if (INV_TIRE) VINV = invDeGraine(graineDeBase(db));
      }

      // Le volet de la séance. Chaque activité sème le sien une seule fois, sans toucher au
      // reste : un élève qui a fait la réception la semaine dernière retrouve son stock, et
      // reçoit en plus les messages de la séance du jour. `db.volets` retient ce qui a été
      // semé, pour ne pas le refaire à chaque ouverture.
      // `semer` reçoit la base : une séance peut donc regarder ce que l'élève a déjà fait
      // avant de décider quoi semer. C'est ce qui permet à la traçabilité de fonctionner
      // pour un élève qui a manqué la réception — elle lui pose l'historique qui manque —
      // sans rien réécrire chez celui qui l'a faite.
      //
      // Fonction à part depuis le 02/10/2026 : la remise à zéro (`reinitialiser`) efface aussi
      // `db.volets`, et ne ressemait pas le volet — l'élève qui cliquait « Réinitialiser » en
      // ENT-1.1 se retrouvait avec une réception vide et sans les messages de la séance, jusqu'à
      // ce qu'il quitte et rouvre. Une base remise à zéro doit être celle d'un premier passage.
      function semerVolet() {
        if (!volet) return;
        if (!db.volets) db.volets = {};
        if (!db.volets[volet.id]) {
          const g = volet.semer(prenom, db) || {};
          (g.receptions || []).forEach((r) => db.receptions.push(r));
          (g.orders || []).forEach((o) => db.orders.push(o));
          // Des mouvements déjà datés : une réception enregistrée par un collègue, des
          // commandes parties les jours précédents. Ils portent leur lot, donc ils se
          // remontent comme les autres. `stockDe` n'est pas encore défini ici.
          (g.mouvements || []).forEach((m) => {
            db.stock[m.sku] = (db.stock[m.sku] == null ? 0 : db.stock[m.sku]) + m.delta;
            db.moves.push({ ts: m.ts || Date.now(), sku: m.sku, type: m.type, delta: m.delta,
              after: db.stock[m.sku], ref: m.ref || '', lot: m.lot || '', by: m.by || prenom });
          });
          if ((g.mouvements || []).length) db.moves.sort((a, b) => a.ts - b.ts);
          (g.mails || []).forEach((m) => ajouterMail(m));
          db.volets[volet.id] = Date.now();
          ctx.jeu.sauver();
        }
      }
      semerVolet();

      // ── Les messages DÉCLENCHÉS (ENT-3.2, « l'imprévu », 03/10/2026) ─────────────────────────
      // `semer` ne pose ses messages qu'à l'ouverture. Un volet peut aussi déclarer des messages
      // qui arrivent PLUS TARD, quand le travail de l'élève rend une condition vraie :
      //
      //   volet.declencheurs: [{ id: 'imprevu', quand: (db) => booléen,
      //                          semer: (prenom, db) => ({ mails: […] }), phaseTournee: 2 }]
      //   (ou `phaseQuai: 2` pour un quai « déjà réceptionné », voir core/types/quai.js)
      //
      // Vérifié à chaque sauvegarde (et à l'ouverture). **Une seule fois** : la marque est rangée
      // dans `db.volets` (`<volet>#<id>`), comme celle du volet, donc rien ne se rejoue au
      // remontage ni à la reconnexion. `phaseTournee` fait passer la tournée de la séance à cette
      // phase (`passerPhase` dans tournee.js) au même instant que le message arrive. Les messages
      // portent `declenche` : ils s'annoncent par une CARTE qui reste tant qu'ils ne sont pas lus
      // (voir « Les cartes des messages » plus bas). Une condition qui plante compte comme fausse,
      // sans rien arrêter. Les conditions toutes faites (après un jalon, après un mail envoyé) sont
      // dans `core/declencheurs.js`. La bulle ne sert plus qu'à la confirmation d'un envoi (« Réponse
      // envoyée. ») : l'arrivée d'un message va dans une carte (brief MOTEUR-questions-au-fil, lot 1).
      function declencher() {
        if (!volet || !(volet.declencheurs || []).length) return false;
        if (!db.volets) db.volets = {};
        let fait = false;
        volet.declencheurs.forEach((d) => {
          const cle = `${volet.id}#${d.id}`;
          if (db.volets[cle]) return;
          let vrai = false;
          try { vrai = !!d.quand(db, ctx.meta.id); } catch (x) { signaler(`le déclencheur « ${cle} » plante`, x); vrai = false; }
          if (!vrai) return;
          const g = (d.semer ? d.semer(prenom, db) : null) || {};
          (g.mails || []).forEach((m) => ajouterMail(Object.assign(m, { declenche: d.id })));
          if (d.phaseTournee && VTOUR) VTOUR.passerPhase(etatTransport('tournee'), d.phaseTournee);
          // Même principe pour un quai « déjà réceptionné » (ENT-4.3) : le temps 2 s'ouvre avec le message.
          if (d.phaseQuai && VQUAI && VQUAI.passerPhase) VQUAI.passerPhase(etatQuai(), d.phaseQuai);
          // Et pour un planning : l'aléa s'applique, le planning de l'élève reste tel quel (« à reprendre »).
          if (d.phasePlanning && VPL) VPL.passerPhase(etatPlanning(), d.phasePlanning);
          db.volets[cle] = Date.now();
          fait = true;
        });
        if (fait) majCartes();
        return fait;
      }

      // ----------------------------------------------------------- état d'écran
      // Volontairement hors de la base : ce sont des choix d'affichage, pas du travail.
      const E = {
        vue: 'accueil', no: null, ref: null,
        mailSel: null, dossier: 'in', redige: false,
        // La pièce jointe ouverte dans le lecteur du mail (null : le texte du mail). `vus` : les pièces
        // ouvertes par l'enseignant, qui ne laisse rien dans le repérage.
        piece: null, vus: {},
        // Les fiches, par id : le document affiché à gauche, et la raison d'un envoi refusé (gardée d'un écran à l'autre).
        fiche: {},
        // Message par phrases en cours de composition, par mail : { idMail: { idLigne: n } }. Hors de
        // la base (rien n'est envoyé tant que l'élève n'a pas cliqué), mais à l'abri d'un redessin.
        brouillon: {},
        onglet: {}, console: [{ cmd: null, html: '<span class="note">Console. Tapez <b>.help</b> pour la liste des commandes.</span>' }],
        // Le Stock est verrouillé pour l'élève (Spartoo : forcer la console) ; une séance l'ouvre avec
        // `stockOuvert: true` (Smoby, décision de Tristan du 05/10/2026).
        stockOuvert: estProf || !!U.stockOuvert, erreurCode: '',
        blocage: { lot: '', ref: '', qte: '', motif: '' }, erreurBlocage: '', okBlocage: '',
      };

      // ── Les cartes des messages (brief MOTEUR-questions-au-fil, lot 1, 08/10/2026) ──────────────
      // Un message déclenché (`m.declenche`) s'annonce par une CARTE en haut à droite, sur tous les écrans,
      // qui RESTE tant qu'il n'est pas lu : une bulle qui part seule au bout de 2,6 s est un défaut connu
      // (WCAG 2.2.1), et l'élève qui regardait ailleurs ne voyait rien. Au bout de 8 s, la carte se réduit à
      // une ligne pour moins cacher le travail. Elle part quand le message est ouvert (par elle ou par la
      // messagerie) ou fermée (×). Trois au plus, puis « … et n autres ».
      //
      // Ce qui s'affiche vient de la base (message déclenché, non lu) ; la fermeture et la réduction sont des
      // choix d'affichage, hors de la base comme `E` : rien de plus ne s'écrit (quota). À la réouverture de
      // la séance, un message non lu revient en carte réduite. La pile est UN élément `role="status"` créé
      // une fois et reposé à chaque dessin : il ne prend jamais le focus de lui-même. Elle sert aussi aux
      // questions du lot 2.
      const CARTES = { reduites: new Set(), fermees: new Set(), minuteurs: {} };
      db.mails.forEach((m) => { if (m.declenche && !m.read) CARTES.reduites.add(m.id); });
      if (MQ) MQ.etapes.forEach((e) => { if (etapeArrivee(db, MQ, e.id) && !etapeFaite(db, MQ, e)) CARTES.reduites.add(`e:${e.id}`); });
      const PILE = document.createElement('div');
      PILE.className = 'ent-cartes';
      PILE.setAttribute('role', 'status');
      PILE.dataset.cartes = '';
      const CARTES_MAX = 3, CARTE_REDUITE_APRES = 8000;
      function majCartes() {
        // Les points d'étape qui attendent (lot 2) d'abord, puis les messages, du plus récent au plus ancien.
        const etapesEnAttente = !MQ || estProf || rendue() ? [] : MQ.etapes
          .filter((e) => etapeArrivee(db, MQ, e.id) && !etapeFaite(db, MQ, e) && !CARTES.fermees.has(`e:${e.id}`))
          .map((e) => ({ etape: e, id: `e:${e.id}` }));
        const L = etapesEnAttente.concat(rendue() ? [] : db.mails
          .filter((m) => m.declenche && m.folder === 'in' && !m.read && !CARTES.fermees.has(m.id))
          .sort((a, b) => b.id - a.id));
        const vues = L.slice(0, CARTES_MAX), reste = L.length - vues.length;
        // Le focus, au clavier, reste sur le même bouton quand la carte se réduit.
        const av = document.activeElement;
        const cle = av && PILE.contains(av) ? av.dataset.cle : null;
        PILE.innerHTML = vues.map((m) => {
          if (m.etape) {
            const e = m.etape, qui = `<strong>${ech(appel(MQ.personnes[e.de]))}</strong> · ${ech(e.titre || 'Point d’étape')}`;
            const x = `<button type="button" class="ent-carte-x" data-carte-fermer="${m.id}" data-cle="x${m.id}"
              aria-label="Fermer la notification" title="Fermer">×</button>`;
            if (CARTES.reduites.has(m.id)) {
              return `<div class="ent-carte ent-carte-reduite" data-carte-etape="${ech(e.id)}">
                <button type="button" class="ent-carte-ligne" data-carte-aller="${ech(e.id)}" data-cle="l${m.id}"
                  title="Aller au point d’étape"><span aria-hidden="true">?</span> ${qui}</button>${x}</div>`;
            }
            return `<div class="ent-carte" data-carte-etape="${ech(e.id)}">
              <span class="ent-carte-icone" aria-hidden="true">?</span>
              <div class="ent-carte-texte"><span class="ent-carte-titre">Point d’étape</span> — ${qui}</div>
              <button type="button" class="btn btn-s btn-p" data-carte-aller="${ech(e.id)}" data-cle="l${m.id}">Y aller</button>${x}</div>`;
          }
          const qui = `<strong>${ech(m.from || 'Messagerie')}</strong> · ${ech(m.subject || '')}`;
          const x = `<button type="button" class="ent-carte-x" data-carte-fermer="${m.id}" data-cle="x${m.id}"
            aria-label="Fermer la notification" title="Fermer">×</button>`;
          if (CARTES.reduites.has(m.id)) {
            return `<div class="ent-carte ent-carte-reduite" data-carte-mail="${m.id}">
              <button type="button" class="ent-carte-ligne" data-carte-lire="${m.id}" data-cle="l${m.id}"
                title="Lire le message"><span aria-hidden="true">✉</span> ${qui}</button>${x}</div>`;
          }
          return `<div class="ent-carte" data-carte-mail="${m.id}">
            <span class="ent-carte-icone" aria-hidden="true">✉</span>
            <div class="ent-carte-texte"><span class="ent-carte-titre">Nouveau message</span> — ${qui}</div>
            <button type="button" class="btn btn-s btn-p" data-carte-lire="${m.id}" data-cle="l${m.id}">Lire le message</button>${x}</div>`;
        }).join('') + (reste ? `<button type="button" class="ent-carte-reste" data-cartes-reste data-cle="reste">… et ${reste}
          autre${reste > 1 ? 's' : ''} : voir Messagerie</button>` : '');
        vues.forEach((m) => {
          if (CARTES.reduites.has(m.id) || CARTES.minuteurs[m.id]) return;
          CARTES.minuteurs[m.id] = setTimeout(() => {
            delete CARTES.minuteurs[m.id];
            CARTES.reduites.add(m.id);
            if (hote.isConnected) majCartes();
          }, CARTE_REDUITE_APRES);
        });
        if (cle) PILE.querySelector(`[data-cle="${cle}"]`)?.focus();
      }
      // ── Les QUESTIONS AU FIL et les POINTS D'ÉTAPE (brief MOTEUR-questions-au-fil, lot 2, 08/10/2026) ───────────
      // Format et état : en tête de `core/types/questions.js`. Ici, le branchement : l'arrivée (avec les messages
      // déclenchés, à chaque sauvegarde et à l'ouverture), le panneau à droite, le GEL du travail pendant une question au
      // fil, l'écran du point d'étape, ce qu'il garde fermé, les sorties de page. Rien de tout cela pour l'enseignant :
      // il voit les points d'étape et les questions au fil (écran à lui), la bonne réponse marquée, et n'écrit rien.
      // `QF` = l'état d'écran (hors de la base, comme `E`) : le choix en cours, le panneau affiché, les sorties de page.
      const QF = { choisi: {}, brouillon: {}, panneau: null, sorties: {} };
      const etatQ = () => { if (!db.questions) db.questions = {}; return db.questions[MQ.id] || (db.questions[MQ.id] = {}); };
      const graineQ = ctx.profil.uid || prenom;
      // La question au fil ARRIVÉE et sans réponse (une seule à la fois).
      const filOuverte = () => (!MQ || estProf || rendue() ? null
        : MQ.fil.find((q) => { const r = reponse(db, MQ, q.id); return !!(r && r.arrivee) && !repondu(r); }) || null);
      // La question du panneau : celle qu'on vient de répondre (jusqu'à « Reprendre mon travail »), sinon l'ouverte.
      const questionDuPanneau = () => (QF.panneau && MQ.parId.get(QF.panneau)) || filOuverte();
      // Le travail est gelé tant que le panneau est là (élève seulement, copie non rendue).
      const gelActif = () => !!(MQ && !estProf && !rendue() && questionDuPanneau());
      // Le point d'étape (arrivé, pas fini) qui garde fermé cet écran ou ce geste.
      function etapeQuiFerme(cle) {
        if (!MQ || estProf) return null;
        return MQ.etapes.find((e) => e.ferme === cle && etapeArrivee(db, MQ, e.id) && !etapeFaite(db, MQ, e)) || null;
      }
      // Un jalon qui plante (état 'erreur') est jugé : le rattrapage ne doit pas attendre un bug de contenu.
      const jalonJuge = (j) => { try { const st = j.verifier(db, U).status; return st === 'ok' || st === 'ko'; } catch (x) { signaler(`le jalon « ${j.id} » plante`, x); return true; } };
      const essai = (f, quoi) => { try { return !!f(db, ctx.meta.id); } catch (x) { signaler(`la condition ${quoi || 'd’une question'} plante`, x); return false; } };
      // L'ARRIVÉE. Un point d'étape arrive quand son envoi a eu lieu (juste ou faux) ; ses questions sont « arrivées » avec
      // lui. Une question au fil arrive à son geste, une à la fois, jamais pendant qu'on lit le retour de la précédente.
      // RATTRAPAGE (jamais un élève bloqué) : une question au fil dont le geste n'a pas eu lieu arrive par sa condition
      // `rattrapage`, ou au plus tard quand tous les autres jalons de la séance sont jugés. Rend vrai si quelque chose
      // est arrivé (la base a changé).
      function arriverQuestions() {
        if (!MQ || estProf || rendue()) return false;
        const S = etatQ();
        let fait = false;
        MQ.etapes.forEach((e) => {
          if (etapeArrivee(db, MQ, e.id) || !essai(e.apres, `"apres" du point d'étape « ${e.id} »`)) return;
          (S[CLE_ETAPES] || (S[CLE_ETAPES] = {}))[e.id] = Date.now();
          e.questions.forEach((id) => { if (!S[id]) S[id] = { arrivee: Date.now() }; });
          fait = true;
        });
        const enLecture = QF.panneau && repondu(reponse(db, MQ, QF.panneau));
        if (!filOuverte() && !enLecture) {
          // D'abord une question dont le geste (ou le rattrapage déclaré) a eu lieu ; sinon, le rattrapage du moteur.
          const enAttente = MQ.fil.filter((x) => !(S[x.id] && S[x.id].arrivee));
          let q = enAttente.find((x) => essai(x.quand, `"quand" de la question « ${x.id} »`) || (x.rattrapage && essai(x.rattrapage, `"rattrapage" de la question « ${x.id} »`)));
          if (!q && enAttente.length && etapesSeance.length && etapesSeance.every(jalonJuge)) q = enAttente[0];
          if (q) { S[q.id] = { arrivee: Date.now() }; QF.panneau = q.id; fait = true; }
        }
        if (fait) { majCartes(); majQuestions(); }
        return fait;
      }
      // Ce que montre une question : le choix en cours, « Merci, je note » (évaluation ; `apres: 'bilan'` jusqu'au bilan),
      // la ligne des sorties de page.
      function optionsQuestion(id) {
        const q = MQ.parId.get(id);
        const auBilan = !COPIE && q.apres === 'bilan' && fini(noterBase(db).detail);
        return { graine: graineQ, estProf, choisi: QF.choisi[id], brouillon: QF.brouillon[id], copie: COPIE,
          merci: COPIE || (q.apres === 'bilan' && !auBilan), sortie: !!(QF.sorties[id] && QF.sorties[id].n) };
      }
      // Le panneau et le bandeau du haut, sans redessiner l'écran de travail (une question qui arrive au milieu d'une
      // fiche ne doit pas effacer ce qui est en cours). Le focus, au clavier, reste sur le même bouton.
      function majQuestions() {
        if (!MQ) return;
        const shell = hote.querySelector('.ent-shell'), ancre = hote.querySelector('[data-qf-ancre]'), bandeau = hote.querySelector('[data-qf-bandeau]');
        if (!shell || !ancre || !bandeau) return;
        const av = document.activeElement;
        const cle = av && (ancre.contains(av) || bandeau.contains(av)) ? av.dataset.cle : null;
        const q = !estProf && !rendue() ? questionDuPanneau() : null;
        ancre.innerHTML = q ? htmlPanneau(MQ, q, reponse(db, MQ, q.id), optionsQuestion(q.id)) : '';
        shell.classList.toggle('ent-avec-panneau', !!q);
        let b = '';
        if (q && !repondu(reponse(db, MQ, q.id))) {
          b = `<div class="avis" role="status" data-qf-gel-avis><span><b>${ech(appel(MQ.personnes[q.de]))} te pose une question</b> (à droite).
            Tu peux regarder le stock, les messages et ton travail ; tu reprends ton travail dès que tu as répondu.</span></div>`;
        } else if (!q && !estProf && !rendue()) {
          const e = MQ.etapes.find((x) => etapeArrivee(db, MQ, x.id) && !etapeFaite(db, MQ, x) && E.vue !== `etape:${x.id}`);
          if (e) {
            const qui = ech(appel(MQ.personnes[e.de]));
            b = `<div class="avis" data-qf-attend="${ech(e.id)}"><span><b>${qui} t’attend pour un point d’étape.</b></span>
              <button type="button" class="btn btn-s btn-p" data-q-aller-etape="${ech(e.id)}" data-cle="attend">Continuer : point d’étape avec ${qui} →</button></div>`;
          }
        }
        bandeau.innerHTML = b;
        appliquerGel();
        if (cle) (ancre.querySelector(`[data-cle="${cle}"]`) || bandeau.querySelector(`[data-cle="${cle}"]`))?.focus();
      }
      // Répondre : la PREMIÈRE réponse est rangée (la clé du choix), avec sa durée et les sorties de page. Jamais réécrite.
      function repondreQuestion(id) {
        const q = MQ.parId.get(id);
        if (!q || estProf || rendue()) return;
        const S = etatQ();
        const r = S[id] || (S[id] = { arrivee: Date.now() });
        if (repondu(r)) return;
        if (q.libre) {
          const t = String(QF.brouillon[id] || '').trim();
          if (!t) { toast('Écris ta réponse.'); return; }
          r.libre = t;
        } else {
          if (!QF.choisi[id]) return;
          r.premiere = QF.choisi[id];
        }
        r.duree = Math.round((Date.now() - (r.arrivee || Date.now())) / 1000);
        const so = QF.sorties[id];
        if (so && so.n) { r.sorties = so.n; r.horsPage = Math.round(so.s); }
        if (q.type === 'fil') QF.panneau = id;
        sauver();
        if (E.vue.startsWith('etape:')) dessinerVue();
        majQuestions();
        majCartes();
      }
      // « Reprendre mon travail » : le panneau se ferme, le travail dégèle ; une question en attente peut arriver.
      function reprendre() {
        QF.panneau = null;
        if (arriverQuestions()) ctx.jeu.sauver();
        majQuestions();
        majCartes();
      }
      // « Continuer » du point d'étape : vers ce qu'il gardait fermé.
      function continuerEtape(eid) {
        const e = MQ.etapes.find((x) => x.id === eid);
        if (!e || !etapeFaite(db, MQ, e)) return;
        const [genre, cle] = e.ferme ? [e.ferme.slice(0, e.ferme.indexOf(':')), e.ferme.slice(e.ferme.indexOf(':') + 1)] : [null, null];
        if (genre === 'ecran') { aller(cle); return; }
        if (genre === 'repondre') {
          const m = db.mails.find((x) => x.folder === 'in' && (x.cle === cle || (x.phrases && x.phrases.id === cle)));
          if (m) { E.vue = 'mail'; E.dossier = 'in'; ouvrirMail(m.id); hote.scrollIntoView({ block: 'start' }); return; }
        }
        aller('accueil');
      }
      // Les écrans des points d'étape (élève : ceux qui sont arrivés ; enseignant : tous, et ses questions au fil).
      const vueEtape = (e) => htmlEtape(MQ, e, db, { estProf, parQuestion: optionsQuestion });
      function vueQuestionsProf() {
        return `<div class="ent-tete"><h2>Questions au fil</h2><p class="note">Ce que voit l’élève au moment du geste,
          bonne réponse marquée (vous seul voyez cet écran).</p></div>
          <section class="panneau">${MQ.fil.map((q) => `<p class="note qf-num">${ech(appel(MQ.personnes[q.de]))}${q.reflexion ? ' · pour réfléchir, non notée'
            : q.apres === 'bilan' ? ' · corrigée au bilan' : ''}</p>${htmlQuestion(MQ, q, null, optionsQuestion(q.id))}`).join('')
          || '<p class="note">Aucune question au fil dans cette séance.</p>'}</section>`;
      }
      const itemsQuestions = (item) => (!MQ ? [] : [
        ...MQ.etapes.filter((e) => estProf || etapeArrivee(db, MQ, e.id))
          .map((e) => item(`etape:${e.id}`, `Point d’étape avec ${appel(MQ.personnes[e.de])}`)),
        estProf && MQ.fil.length && item('questions-fil', 'Questions au fil'),
      ]);
      // Les clics des questions (panneau, écran du point d'étape, bandeau) : un seul écouteur, posé une fois.
      if (MQ) {
        hote.addEventListener('click', (ev) => {
          const b = ev.target.closest && ev.target.closest('[data-q-choix], [data-q-repondre], [data-q-reprendre], [data-q-continuer], [data-q-aller-etape]');
          if (!b || !hote.contains(b) || b.disabled) return;
          if (b.dataset.qChoix) {
            const id = b.dataset.q;
            if (estProf || repondu(reponse(db, MQ, id))) return;
            QF.choisi[id] = b.dataset.qChoix;
            if (b.closest('[data-qf-ancre]')) majQuestions();
            else {
              // Sur l'écran du point d'étape : sans redessiner l'écran (le focus reste sur le choix).
              const bloc = b.closest('[data-question]');
              bloc.querySelectorAll('[data-q-choix]').forEach((x) => {
                const pris = x.dataset.qChoix === QF.choisi[id];
                x.classList.toggle('qf-pris', pris); x.setAttribute('aria-pressed', pris ? 'true' : 'false');
              });
              const r = bloc.querySelector('[data-q-repondre]');
              if (r) r.disabled = false;
            }
          } else if (b.dataset.qRepondre) repondreQuestion(b.dataset.qRepondre);
          else if (b.hasAttribute('data-q-reprendre')) reprendre();
          else if (b.dataset.qContinuer) continuerEtape(b.dataset.qContinuer);
          else if (b.dataset.qAllerEtape) aller(`etape:${b.dataset.qAllerEtape}`);
        });
        hote.addEventListener('input', (ev) => {
          const t = ev.target;
          if (t && t.dataset && t.dataset.qLibre) QF.brouillon[t.dataset.qLibre] = t.value;
        });
      }
      // LES SORTIES DE PAGE pendant une question (§4.8 bis, décision de Tristan du 08/10/2026) : tant qu'une question est
      // ouverte et sans réponse (panneau, ou écran du point d'étape affiché), l'onglet caché ou la fenêtre quittée plus de
      // 3 s compte une sortie (un aller-retour). Gardé à l'écran, rangé AVEC la réponse (aucune écriture de plus) ;
      // l'élève voit une ligne dans la question ; aucun effet sur la note. Rien chez l'enseignant.
      if (MQ && !estProf) {
        const ouvertes = () => {
          const L = [];
          const f = filOuverte();
          if (f && questionDuPanneau() === f) L.push(f.id);
          const e = E.vue.startsWith('etape:') && MQ.etapes.find((x) => `etape:${x.id}` === E.vue);
          if (e) e.questions.forEach((id) => { if (!repondu(reponse(db, MQ, id))) L.push(id); });
          return L;
        };
        let depart = null, cache = false, pendant = [];
        const partir = (h) => {
          if (!hote.isConnected) { nettoyer(); return; }
          if (h) cache = true;
          if (depart !== null || rendue()) return;
          pendant = ouvertes();
          if (pendant.length) depart = Date.now();
        };
        const revenir = () => {
          if (!hote.isConnected) { nettoyer(); return; }
          if (depart === null) { cache = false; return; }
          const dt = (Date.now() - depart) / 1000, compte = cache || dt > 3;
          depart = null; cache = false;
          if (!compte) return;
          let vu = false;
          pendant.forEach((id) => {
            if (repondu(reponse(db, MQ, id))) return;
            const so = QF.sorties[id] || (QF.sorties[id] = { n: 0, s: 0 });
            so.n += 1; so.s += dt; vu = true;
          });
          if (!vu) return;
          if (E.vue.startsWith('etape:')) dessinerVue();
          majQuestions();
        };
        const vis = () => (document.visibilityState === 'hidden' ? partir(true) : revenir());
        const flou = () => partir(false);
        const nettoyer = () => {
          document.removeEventListener('visibilitychange', vis);
          window.removeEventListener('blur', flou);
          window.removeEventListener('focus', revenir);
        };
        document.addEventListener('visibilitychange', vis);
        window.addEventListener('blur', flou);
        window.addEventListener('focus', revenir);
      }

      PILE.addEventListener('click', (ev) => {
        const b = ev.target.closest && ev.target.closest('button');
        if (!b) return;
        if (b.dataset.carteFermer) {
          const f = b.dataset.carteFermer;
          CARTES.fermees.add(f.startsWith('e:') ? f : Number(f)); majCartes(); return;
        }
        if (b.dataset.carteAller) { aller(`etape:${b.dataset.carteAller}`); return; }
        E.vue = 'mail'; E.dossier = 'in';
        if (b.dataset.carteLire) ouvrirMail(Number(b.dataset.carteLire));
        else { E.mailSel = null; dessiner(); }
        hote.scrollIntoView({ block: 'start' });
      });

      // Les couleurs de l'entreprise remplacent celles de Prepalog, mais seulement pendant
      // que le module est ouvert : dès qu'on en sort, le site retrouve sa charte et son
      // thème clair/sombre.
      //
      // Deux niveaux. THEME.accent seul : seule la couleur d'accent change, le module suit
      // le thème du site. THEME.sombre en plus : le module repeint aussi les surfaces et
      // impose son ambiance sombre, quel que soit le réglage du site — c'est le rendu de
      // LogiSim d'origine, que l'élève doit retrouver en entrant dans l'entreprise.
      // Le calcul (variables CSS de la charte, jugement « rouge ou vert ») est dans `entreprise-theme.js` (lot 9c, module 2).
      // Deux accents à juger séparément : celui des textes et bordures, celui des aplats (Boost : texte menthe à
      // neutraliser, aplats bleus à garder, ils disent « le client » sur la carte et dans la liste).
      const SOMBRE = THEME.sombre || {};
      const TRAVAIL_NEUTRE = accentRougeOuVert(SOMBRE.accent || THEME.accent);
      const TRAVAIL_NEUTRE_FOND = accentRougeOuVert(SOMBRE.accentFond || SOMBRE.accent || THEME.accent);


      // L'ambiance doit couvrir toute la fenêtre, pas seulement la colonne de contenu :
      // les variables sont posées sur <body>, et retirées à la sortie du module.
      function habiller() {
        document.body.classList.add('immersion');
        document.body.setAttribute('style', styleTheme(THEME));
        // La mise en page des documents de la séance (`documentsStyle`), et rien de celle d'avant.
        if (VDOC) VDOC.poserStyle(); else document.head.querySelectorAll('style[data-ent-documents]').forEach((x) => x.remove());
      }
      function deshabiller() {
        document.body.classList.remove('immersion');
        document.body.removeAttribute('style');
        document.head.querySelectorAll('style[data-ent-documents]').forEach((x) => x.remove());
      }
      // Les mots cliquables (2de, `core/lexique.js`) : seulement si le contenu déclare un lexique.
      // Chaque ouverture est comptée pour l'enseignant (lot 6), jamais chez l'enseignant lui-même.
      const debrancherLexique = U.lexique ? brancherLexique(hote, U.lexique, (mot) => {
        if (estProf || rendue()) return;
        compterAide(db, ctx.meta.id, 'mots', mot); sauver();
      }) : () => {};
      // Le temps passé dans la séance (repérage, lot 6) : compté en secondes, par écart d'horloge, seulement
      // quand l'onglet est visible. Toutes les 2 minutes de temps compté (brief MOTEUR-temps-passe, 06/10/2026),
      // il est envoyé à l'enseignant par une écriture légère (`ctx.enregistrerTemps` : ni score ni tentative),
      // et le jeu privé est sauvé au même moment — sinon, à la réouverture, l'élève repartirait d'un temps plus
      // bas et la prochaine écriture le ferait redescendre. Document pas encore créé : une fois, la remontée
      // complète (`remonterEtapes(true)`), qui le crée. Rien en évaluation (seule la remise compte).
      // PAS de sauvegarde à la fermeture de l'onglet (`pagehide`) : elle réécrivait la base juste après un
      // effacement voulu (page d'essai qui repart de zéro). Au pire, moins de 2 minutes sont perdues.
      let minuterieTemps = null;
      if (!estProf) {
        let dernierTic = Date.now(), tempsEnvoye = null;
        minuterieTemps = setInterval(() => {
          if (!hote.isConnected) { clearInterval(minuterieTemps); minuterieTemps = null; return; }
          const t = Date.now(), dt = Math.min(70, (t - dernierTic) / 1000);
          dernierTic = t;
          if (document.visibilityState === 'hidden' || rendue() || (COPIE && !copie.charge)) return;
          const r = reperageSeance();
          r.temps = Math.round(((r.temps || 0) + dt) * 10) / 10;
          if (tempsEnvoye === null) tempsEnvoye = r.temps - dt;
          if (COPIE || r.temps - tempsEnvoye < 120) return;
          tempsEnvoye = r.temps;
          ctx.jeu.sauver();
          Promise.resolve(ctx.enregistrerTemps?.(r.temps)).then((fait) => {
            if (fait === false && hote.isConnected && !rendue()) remonterEtapes(true);
          }, () => {});
        }, 5000);
      }
      function arreterTemps() {
        if (!minuterieTemps) return;
        clearInterval(minuterieTemps); minuterieTemps = null;
        if (!rendue()) { ctx.jeu.sauver(); remonterEtapes(true); }
      }
      // Une seule fois, quelle que soit la sortie : bouton « Quitter », Précédent du navigateur
      // (le site appelle le nettoyage déclaré par `ctx.surSortie`), retour à l'accueil.
      let sortie = false;
      const sortir = (fn) => {
        if (!sortie) { sortie = true; arreterChrono(); arreterTemps(); debrancherLexique(); deshabiller(); demonterCalculette(); }
        if (fn) fn();
      };
      ctx.surSortie?.(() => sortir());

      // L'état de la copie (évaluation). `charge` : on sait si elle est déjà rendue — tant qu'on
      // ne le sait pas, le bouton « Rendre » n'est pas offert. Côté enseignant, rien à rendre.
      const copie = { rendue: null, ramassee: false, arme: false, envoi: false, charge: !COPIE || estProf };
      const rendue = () => !!(COPIE && copie.rendue);
      ecritureErreurs = () => !estProf && !rendue();
      // CORRECTION (lots A et A bis du brief SMOBY-retours-classe-5.1, 07/10/2026) : la séance déclare
      // `meta.correction: true`. Elle suit alors la règle « premier bilan » : la séance suivante s'ouvre dès que
      // tous les jalons sont jugés, l'élève peut corriger les envois fautifs, la note est la moyenne du premier
      // bilan et de l'état actuel, le bandeau de fin liste tous les groupes en ✓ / ✗. Sans le drapeau, tout reste
      // comme avant (séance suivante ouverte quand tout est juste, ancien bandeau). Cela suppose que les jalons de
      // la séance restent « à faire » jusqu'à l'envoi (la photo de fin et la note moyennée en dépendent) :
      // Spartoo et Boost jugent leurs jalons en continu, ils n'ont pas le drapeau.
      const CORRECTION = !!(ctx.meta && ctx.meta.correction);
      // SUITE AU BILAN (lot 0 du brief SMOBY-notation-5.3-5.8, 07/10/2026 ; règle absolue de Tristan : « aucun élève
      // bloqué à la fin »). `meta.suiteAuBilan: true` : la séance suivante s'ouvre au premier bilan, comme pour
      // `correction`, mais sans bouton « Corriger » ni note moyennée (le bandeau d'origine, dont la dernière phrase
      // change). `correction` l'implique. « Fini » = tous les jalons jugés ; une séance dont les jalons ne sont jamais
      // « faux » déclare `seanceFinie(db)` dans `creerEntreprise` (ENT-5.6 : la préparation terminée et vérifiée).
      // PREMIER ESSAI (lot 3 du même brief) : le plan d'entrepôt déclare `premierEssai: true` (ENT-5.3, la visite) ; ses
      // cases sont jugées au premier essai, l'élève recommence quand même jusqu'à trouver. Il l'implique aussi, et
      // prend le bandeau par blocs ✓ / ✗ : ✓ « du premier coup », ✗ « après une erreur » (sans `correction`).
      const PREMIER_ESSAI = !!(U.entrepot && U.entrepot.premierEssai);
      const SUITE_AU_BILAN = CORRECTION || PREMIER_ESSAI || !!(ctx.meta && ctx.meta.suiteAuBilan);
      const fini = (st) => bilanComplet(st) || (SUITE_AU_BILAN && typeof U.seanceFinie === 'function' && !!U.seanceFinie(db));
      // Copie rendue : plus rien ne s'écrit dans la base, même si un geste passait le verrou.
      const sauver = () => { if (rendue()) return; declencher(); arriverQuestions(); ctx.jeu.sauver(); remonterEtapes(); };
      // LES GESTES (questions au fil, lot 3, 08/10/2026) : une vue dit « l'élève vient de faire ce geste » (`api.signal`),
      // juste avant sa sauvegarde. Le geste est rangé une fois, avec son heure, cloisonné par séance :
      // `db.gestes[<séance>][<nom>]`. Les conditions `apresGeste(nom)` le lisent. Rien pour l'enseignant ni après la remise.
      function signal(nom) {
        if (estProf || rendue()) return;
        if (!db.gestes) db.gestes = {};
        const G = db.gestes[ctx.meta.id] || (db.gestes[ctx.meta.id] = {});
        if (!G[nom]) G[nom] = Date.now();
      }

      function ajouterMail(m) {
        m.id = db.seq++; if (m.read === undefined) m.read = false;
        // Réponse par phrases à choisir (2de) : choix calculés et ordre tiré une fois pour toutes.
        if (m.phrases) preparerPhrases(m, db, graineDeBase(db) || ctx.profil.uid || prenom);
        db.mails.push(m); return m;
      }
      // Le socle de la base (stock, mouvements, lots, clients, fournisseurs) : `entreprise-base.js` (lot 9c, module 5).
      const B = monterBase({ db, prenom, CUSTOMERS, CM, SUPPLIERS });
      const { stockDe, mouvement, restesParLot, sortirFifo, resteDuLot, tousClients, tousFournisseurs, clientDe, codeSuivant } = B;

      // LE BANDEAU DE FIN DE SÉANCE (06/10/2026 ; Spartoo ENT-1.1 §7.6 = Smoby C1, décisions de Tristan). Refait le
      // 07/10/2026 (lot A bis du brief SMOBY-retours-classe-5.1 ; page d'essai validée par Tristan). Pour l'ÉLÈVE d'une
      // séance de parcours, hors évaluation, quand TOUS les jalons sont jugés (aucun « à faire ») : TOUS les groupes
      // sont listés, ✓ en vert (juste) ou ✗ en rouge (à corriger), jamais la réponse ni les points perdus.
      // Un jalon déclare `groupe` (la ligne du bandeau : il ne descend pas à la case, une case oui/non nommée fausse
      // donnerait la réponse) ; sans `groupe`, la ligne est son `titre`. Un groupe est juste quand toutes ses cases le sont.
      // « Corriger » (pas si tout est juste) rouvre l'envoi fautif : voir `corriger()` plus bas.
      // Sur tous les écrans (au-dessus du menu), remis à jour à chaque sauvegarde.
      // Fini = tout est jugé. Un jalon qui plante (état 'erreur') est jugé : un bug de contenu ne bloque personne.
      const bilanComplet = (st) => etapes.length > 0 && etapes.every((e) => st[e.id] === 'ok' || st[e.id] === 'ko' || st[e.id] === 'erreur');
      const sansFaux = (st) => etapes.every((e) => st[e.id] === 'ok' || st[e.id] === 'erreur');
      // Les écrans à rouvrir : ceux des jalons faux qui déclarent un `ecran` ('fiche:<id>', 'phrases:<id>' ou 'planning:<id>').
      function ecransAFaire(st) {
        const L = [];
        etapes.forEach((e) => { if (st[e.id] === 'ko' && e.ecran && !L.includes(e.ecran)) L.push(e.ecran); });
        return L;
      }
      // Les questions corrigées AU BILAN (`apres: 'bilan'`, questions au fil) : leur explication vient avec le bandeau de fin.
      function retoursAuBilan() {
        if (!MQ) return '';
        const L = MQ.notees.filter((q) => q.apres === 'bilan' && repondu(reponse(db, MQ, q.id)));
        if (!L.length) return '';
        return `<div class="ent-fin-retours" data-fin-retours>${L.map((q) => `<p data-fin-retour="${ech(q.id)}"><b>${ech(appel(MQ.personnes[q.de]))}</b>
          (${ech(q.groupe)}) : « ${ech(q.retour)} »</p>`).join('')}</div>`;
      }
      function bandeauFin(res) {
        if (estProf || COPIE || !ctx.meta.parcours || !etapes.length) return '';
        const st = res || noterBase(db).detail;
        if (!fini(st)) return '';
        // Le HTML est fabriqué par `entreprise-fin.js` (lot 9c, module 4) ; ici, ce qui dépend de la séance en cours.
        return bandeauFinHtml(st, { etapes, correction: CORRECTION, premierEssai: PREMIER_ESSAI, suiteAuBilan: SUITE_AU_BILAN,
          suivante: ctx.suivante, reinitialisable: ctx.meta.reinitialisable, avecQuestions: !!MQ, finFige: U.finFige,
          retours: retoursAuBilan, peutCorriger: ecransAFaire(st).length > 0 });
      }
      function brancherBandeauFin() {
        hote.querySelector('[data-fin-quitter]')?.addEventListener('click', () => sortir(ctx.quitter));
        hote.querySelector('[data-fin-corriger]')?.addEventListener('click', corriger);
      }
      function majBandeauFin(res) {
        const z = hote.querySelector('[data-fin-seance]');
        if (!z) return;
        const h = bandeauFin(res);
        if (z.innerHTML.trim() === h.trim()) return;
        z.innerHTML = h;
        brancherBandeauFin();
      }

      // CORRIGER (lot A, 07/10/2026). Après le premier bilan, l'élève peut reprendre les envois qui portent une
      // étape fausse. Une fiche est ROUVERTE (`envoye` retiré, ses cases gardées : ses jalons repassent « à faire »,
      // « rien n'est vrai avant l'envoi », et le bandeau s'efface jusqu'au renvoi). Une réponse par phrases se
      // renvoie telle quelle (c'est déjà possible : le dernier envoi fait foi) ; son brouillon est prérempli
      // avec les choix de l'élève, jamais avec la bonne réponse. Le premier écran concerné s'ouvre.
      function corriger() {
        if (estProf || COPIE || rendue() || !CORRECTION) return;
        const st = noterBase(db).detail;
        const ecrans = ecransAFaire(st);
        if (!ecrans.length) return;
        let vers = null;
        ecrans.forEach((x) => {
          const genre = x.slice(0, x.indexOf(':')), id = x.slice(x.indexOf(':') + 1);
          if (genre === 'fiche') {
            const VF = VFICHES.find((v) => v.id === id);
            const e = VF && db.fiches && db.fiches[id];
            if (e && e.envoye) { delete e.envoye; if (!vers) vers = { vue: vueDeFiche(VF) }; }
          } else if (genre === 'planning') {
            if (VPL && VPL.id === id && VPL.rouvrir(etatPlanning()) && !vers) vers = { vue: 'planning' };
          } else if (genre === 'phrases') {
            const m = db.mails.find((y) => y.folder === 'in' && y.phrases && y.phrases.id === id);
            if (m && !vers) {
              const envois = db.mails.filter((y) => y.folder === 'out' && y.phrases && y.phrases.id === id);
              const dernier = envois[envois.length - 1];
              if (dernier) E.brouillon[m.id] = Object.assign({}, dernier.phrases.choix);
              vers = { vue: 'mail', mail: m.id };
            }
          }
        });
        if (!vers) return;
        sauver();
        E.vue = vers.vue;
        if (vers.mail) { E.dossier = 'in'; E.mailSel = vers.mail; E.piece = null; }
        dessiner();
        hote.querySelector('[data-fiche-envoyer], #formPhr')?.scrollIntoView({ block: 'nearest' });
      }

      // La note du suivi de classe : les points des jalons réussis (le nombre de jalons réussis quand ils n'ont pas
      // de poids). Pour une séance `correction` (règle de Tristan, 07/10/2026) :
      //   - avant toute correction : la note est le PREMIER BILAN (le premier moment où tous les jalons sont jugés) ;
      //   - après la PREMIÈRE correction : la moyenne du premier bilan et de l'état à ce moment-là, figée ;
      //   - corrections suivantes : comptées (`corrections`), la note ne bouge plus.
      // Une correction = un renvoi après le premier envoi (fiche rouverte, réponse par phrases renvoyée, planning
      // renvoyé). Le premier
      // bilan, l'état de la première correction et le nombre de corrections sont rangés dans
      // `db.indicateurs[séance]` (`bilan1`, `bilan2`, `corrections`) : ils survivent à « Réinitialiser ». Ce n'est pas
      // `premier` (le premier jugement de CHAQUE jalon, qui peut tomber en cours de route). Une séance qui note
      // autrement (planning, quai, plan d'entrepôt : le score n'est pas la somme des jalons) n'est pas moyennée.
      function nombreDeCorrections() {
        let n = 0;
        const vus = new Set();
        etapes.forEach((e) => {
          if (!e.ecran || vus.has(e.ecran)) return;
          vus.add(e.ecran);
          const i = e.ecran.indexOf(':'), genre = e.ecran.slice(0, i), id = e.ecran.slice(i + 1);
          if (genre === 'fiche') n += Math.max(0, ((db.fiches && db.fiches[id] && db.fiches[id].envois) || 0) - 1);
          else if (genre === 'phrases') n += Math.max(0, db.mails.filter((m) => m.folder === 'out' && m.phrases && m.phrases.id === id).length - 1);
          else if (genre === 'planning' && VPL && VPL.id === id) n += VPL.corrections(db.plannings && db.plannings[id]);
        });
        return n;
      }
      function noteDuSuivi(res, score) {
        if (COPIE || !CORRECTION) return score;
        const points = (st) => etapes.reduce((t, e) => t + (st[e.id] === 'ok' ? poidsDe(e) : 0), 0);
        const complet = bilanComplet(res);
        const actuels = points(res);
        if (complet && Math.abs(actuels - score) > 0.01) return score;      // le score brut est arrondi au millième
        const r = reperageSeance();
        if (!r.bilan1) {
          if (!complet) return score;
          r.bilan1 = Object.fromEntries(etapes.map((e) => [e.id, res[e.id]]));
        }
        const n = nombreDeCorrections();
        if (n !== (r.corrections || 0)) r.corrections = n;
        if (!r.bilan2 && n >= 1 && complet) r.bilan2 = Object.fromEntries(etapes.map((e) => [e.id, res[e.id]]));
        if (r.bilan2) return arrondi((points(r.bilan1) + points(r.bilan2)) / 2);
        return complet ? actuels : score;
      }

      // Le score du suivi de classe : l'avancement (voir `noteDuSuivi`). Il n'est réécrit en base que s'il
      // a changé, temps passé mis à part (il avance tout seul) ; `forcer` (sortie de la séance)
      // l'écrit quoi qu'il arrive, pour que l'enseignant lise le temps à jour.
      // Un jalon ne se juge jamais PENDANT LA FRAPPE : chaque réécriture de la note coûte une lecture et une
      // écriture (quota Spark). Les jalons de fiche et de message basculent à l'envoi, d'un seul coup.
      let clePhoto = null;
      function remonterEtapes(forcer) {
        if (estProf || !etapes.length) return;
        const { score: brut, max, detail: res } = noterBase(db);
        noterPremiers(res);
        majBandeauFin(res);
        const ok = noteDuSuivi(res, brut);
        const cle = JSON.stringify({ ok, max, res }, (k, v) => (k === 'temps' && typeof v === 'number' ? undefined : v));
        // Évaluation : rien ne remonte pendant le travail, seule la remise compte.
        if (!COPIE) ctx.enregistrer({ score: ok, max, detail: res }, { siChange: !forcer, cle });
        // Premier bilan complet (tous les jalons jugés, justes ou faux — lot A, 07/10/2026) : on range une photo du
        // travail. Elle ouvre la séance suivante et sert de point de reprise (voir core/parcours.js). Elle est
        // REMPLACÉE à chaque nouveau bilan complet qui change, pour que la suite parte du travail corrigé.
        // En évaluation, la règle d'avant : tout juste.
        // Un jalon qui plante ('erreur') ne retient pas la séance suivante : sans rien de faux, il vaut « tout juste ».
        if (ctx.meta.parcours && (SUITE_AU_BILAN && !COPIE ? fini(res) : (brut === max || (sansFaux(res) && etapes.some((e) => res[e.id] === 'erreur'))))) {
          if (!db.points) db.points = {};
          const cleBilan = etapes.map((e) => res[e.id]).join();
          if (!db.points[ctx.meta.id] || (clePhoto !== null && clePhoto !== cleBilan)) {
            const { points, reprise, ...reste } = db;
            db.points[ctx.meta.id] = JSON.parse(JSON.stringify(reste));
            ctx.jeu.sauver();
          }
          clePhoto = cleBilan;
        }
      }

      // Le repérage (2de, lot 6 de MOTEUR-2de-S1) : `db.indicateurs[idSeance]` = { temps (s), mots, aides,
      // premier }. `premier[idEtape]` = le PREMIER jugement de l'étape ('ok' ou 'ko'), posé une fois :
      // une étape juste du premier coup est une étape dont le premier jugement était 'ok'. Il suppose
      // qu'une étape rend 'attente' tant que l'élève n'a rien tenté (premier envoi, premier dépôt,
      // première validation) — une étape qui rend 'ko' avant tout geste compte comme ratée.
      // Rien chez l'enseignant ni dans une copie rendue. Il survit à « Réinitialiser ».
      const SEANCE = ctx.meta.id;
      const reperageSeance = () => {
        if (!db.indicateurs) db.indicateurs = {};
        return db.indicateurs[SEANCE] || (db.indicateurs[SEANCE] = {});
      };
      function noterPremiers(res) {
        if (estProf || rendue()) return;
        const dejaVu = (db.indicateurs && db.indicateurs[SEANCE] && db.indicateurs[SEANCE].premier) || {};
        etapes.forEach((e) => {
          if (dejaVu[e.id]) return;
          let st = res && res[e.id];
          if (st === undefined) { try { st = e.verifier(db, U).status; } catch (x) { signaler(`le jalon « ${e.id} » plante (premier jugement)`, x); st = 'attente'; } }
          if (st !== 'ok' && st !== 'ko') return;      // ni 'attente' ni 'erreur' (un bug de contenu n'est pas un premier coup raté)
          const r = reperageSeance();
          (r.premier || (r.premier = {}))[e.id] = st;
        });
      }

      /* ====================================================== commandes clients */
      // Les commandes (liste, fiche, bon de préparation) : `entreprise-commandes.js` (lot 9c, module 10).
      const COM = monterCommandes({ db, E, hote, prenom, ENTREPRISE, A, VM, VOCAB, livraisons: U.livraisons || {}, B, sauver, dessiner });
      const { statutCommande, totaux, livraisonDe, preparer, corpsMailCommande } = COM;

      /* ============================================================== rendu */
      function dessiner() {
        const nonLus = db.mails.filter((m) => m.folder === 'in' && !m.read).length;
        const aFaire = COM.aFaire();
        const aRecevoir = REC.aRecevoir();
        // Un groupe du menu : son titre, puis ses entrées ; rien du tout s'il n'en a aucune.
        const groupe = (titre, L) => { const ok = L.filter(Boolean); return ok.length ? `<div class="ent-sep">${ech(titre)}</div>${ok.join('')}` : ''; };
        const item = (id, lbl, n, alias) => {
          const actif = (alias || [id]).includes(E.vue);
          const f = fermeture(id);
          if (f) return `<button class="ent-nav ent-nav-ferme" data-vue-fermee="${id}" disabled title="${ech(f)}">
            <span>${ech(lbl)}</span><span class="ent-nav-pourquoi">${ech(f)}</span></button>`;
          return `<button class="ent-nav ${actif ? 'on' : ''}" data-vue="${id}">
            <span>${ech(lbl)}</span>${n ? `<span class="ent-n">${n}</span>` : ''}</button>`;
        };
        // Le mode hors connexion de la vue plan, remonté dans le BANDEAU le 03/10/2026.
        // Tristan : *« il ne faut pas mettre ça ici, la majorité des élèves va juste cliquer
        // dessus pour avoir les réponses »*. Sous la carte, au milieu du travail, il se lisait
        // comme une aide à l'exercice ; à côté de « Réinitialiser », il se lit comme un réglage
        // de poste. Le mécanisme, lui, n'a pas bougé : l'état reste `plan.secours`, horodaté.
        //
        // Lecture SANS création : on passe par la base à la main plutôt que par
        // `etatTransport('plan')`, pour que le simple affichage du bandeau n'aille pas poser
        // l'état de la vue plan dans la base d'un élève qui ne l'a jamais ouverte.
        const horsCo = !!(db.transport && db.transport[cleTransport]
          && db.transport[cleTransport].plan && db.transport[cleTransport].plan.secours);

        // Le menu de gauche replié (lot 3 du brief MOTEUR-documents-formulaire, 04/10/2026) : sur tous les
        // écrans de toutes les entreprises. Le choix est rangé dans la base de l'élève (`db.menuReplie`) :
        // gardé d'un écran à l'autre, retrouvé à la séance suivante. Le Planning garde « Agrandir le
        // planning », qui cache le menu entier (bande comprise) puis le rend dans l'état choisi ici.
        const replie = !!db.menuReplie;

        hote.innerHTML = `
          <div class="ent-page${TRAVAIL_NEUTRE ? ' ent-travail-neutre' : ''}${TRAVAIL_NEUTRE_FOND ? ' ent-travail-neutre-fond' : ''}" style="${styleTheme(THEME)}${THEME.papier ? ';color:var(--encre);background:var(--fond)' : ''}">
            <header class="ent-bandeau">
              ${ENTREPRISE.logo ? `<img class="ent-logo" src="${ech(ENTREPRISE.logo)}" alt="${ech(ENTREPRISE.nom)}">` : ''}
              <span class="ent-marque">${ech(ENTREPRISE.nom)}</span>
              <span class="ent-baseline">${ech(ENTREPRISE.sousTitre)}</span>
              ${etiquetteSeance()}
              <span class="pousse ent-qui">${ech(prenom)}</span>
              <!-- Les actions du bandeau, dans cet ordre : remise à zéro, puis les deux trames
                   de la séance (elles vont par paire), puis le réglage de poste. ENT-3.1 n'a pas
                   encore de trame, mais elle en aura une comme les trois Spartoo : la place est
                   donc tenue, et le mode hors connexion reste en bout de file. -->
              ${boutonsCopie()}
              ${ctx.meta && ctx.meta.reinitialisable && !rendue() ? `<button class="ent-act ent-act-raz" data-raz
                title="Effacer votre travail et repartir d'une base neuve">Réinitialiser</button>` : ''}
              ${trame && trame.pdf ? `<a class="ent-act" href="${ech(trame.pdf)}" download
                title="Le carnet de bord de la séance, à imprimer ou à lire à l'écran">Trame PDF</a>` : ''}
              ${trame && trame.docx ? `<a class="ent-act" href="${ech(trame.docx)}" download
                title="Le même carnet, à compléter au clavier">Trame Word</a>` : ''}
              ${/* La fiche d'intention du scénario (03/10/2026) : à l'enseignant SEUL, jamais à un élève. */
                estProf && ctx.intention && ctx.intention.pdf ? `<a class="ent-act" data-intention href="${ech(ctx.intention.pdf)}" download
                title="Fiche d'intention pédagogique du scénario (enseignant seulement)">Fiche d'intention PDF</a>` : ''}
              ${estProf && ctx.intention && ctx.intention.docx ? `<a class="ent-act" data-intention href="${ech(ctx.intention.docx)}" download
                title="La même fiche, en Word">Fiche d'intention Word</a>` : ''}
              ${VTAB && VTAB.aide ? `<button class="ent-act${E.aideTableur ? ' on' : ''}" data-aide-tableur aria-expanded="${E.aideTableur ? 'true' : 'false'}"
                title="Un rappel court des fonctions du tableur">Rappel tableur</button>` : ''}
              ${sansTrame ? `<span class="ent-sans-trame" title="Pas de feuille à rendre : tout se fait dans l'environnement">${ech(sansTrame)}</span>` : ''}
              ${!(VPLAN && VPLAN.horsConnexion) ? '' : `<button class="ent-act" data-hors-connexion
                ${horsCo ? 'disabled' : ''}
                title="${horsCo
                  ? 'Les quartiers sont affichés sur le plan. La case du quadrillage reste à trouver.'
                  : 'Si les plans en ligne ne passent pas depuis ce poste : affiche le quartier de chaque point sur le plan. La case du quadrillage reste à trouver.'}"
                >${ech(VPLAN.horsConnexion.libelle)}${horsCo ? ' ✓' : ''}</button>`}
              <span class="ent-barre" aria-hidden="true"></span>
              <button class="ent-sortie" data-quitter>Quitter</button>
            </header>
            ${VTAB && VTAB.aide && E.aideTableur ? `<div class="ent-aide" data-aide-tableur-texte style="white-space:pre-line">${ech(VTAB.aide)}</div>` : ''}
            <div data-fin-seance>${bandeauFin()}</div>
            ${MQ ? '<div class="qf-bandeau" data-qf-bandeau></div>' : ''}
            <div class="ent-cartes-ancre" data-cartes-ancre></div>
            <div class="ent-shell${replie ? ' ent-menu-replie' : ''}">
              <aside class="ent-side">
                ${boutonMenu(replie)}
                <div class="ent-side-liste" id="entMenuListe"${replie ? ' hidden' : ''}>
                ${item('accueil', 'Accueil')}
                ${item('mail', 'Messagerie', nonLus)}
                ${groupe((VPLAN || VTOUR) && !VFICHE && !VQUAI && !VPL && !VENT && !VINV && !VANIMS.length ? U.transportSection || 'Transport' : 'Mon poste', [
                  ...VANIMS.map((VA) => item(vueAnim(VA), VA.nav.libelle)),
                  ...VFICHES.filter((VF) => !VF.quand || VF.quand(db)).map((VF) => item(vueDeFiche(VF), VF.nav.libelle)),
                  VQUAI && item('quai', VQUAI.nav.libelle),
                  VPL && item('planning', VPL.nav.libelle), VENT && item('entrepot', VENT.nav.libelle),
                  VPLAN && item('plan', VPLAN.nav.libelle), VTOUR && item('tournee', VTOUR.nav.libelle),
                  VINV && item('inventaire', VINV.nav.libelle), ...itemsQuestions(item)])}
                ${groupe('Données', [
                  montre('commandes') && item('commandes', 'Commandes', aFaire, ['commandes', 'commande']),
                  montre('receptions') && item('receptions', 'Réceptions', aRecevoir, ['receptions', 'reception']),
                  montre('stock') && item('stock', 'Stock'),
                  montre('catalogue') && item('catalogue', 'Catalogue', 0, ['catalogue', 'produit']),
                  montre('blocage') && item('blocage', 'Blocage qualité')])}
                ${groupe('Tiers', [montre('clients') && item('clients', 'Clients'), montre('fournisseurs') && item('fournisseurs', 'Fournisseurs')])}
                ${groupe('Outils', [montre('console') && item('console', 'Console'),
                  VTAB && VTAB.navExtractions && item('extractions', VTAB.navExtractions.libelle), VTAB && item('fichiers', VTAB.nav.libelle)])}
                </div>
              </aside>
              <div class="ent-main" id="entMain"></div>
              ${MQ ? '<div class="qf-ancre" data-qf-ancre></div>' : ''}
            </div>
          </div>`;

        // La pile des cartes, reposée telle quelle (même élément) : voir « Les cartes des messages ».
        hote.querySelector('[data-cartes-ancre]').appendChild(PILE);
        majCartes();
        majQuestions();
        hote.querySelectorAll('[data-vue]').forEach((b) => b.addEventListener('click', () => aller(b.dataset.vue)));
        // Replier / déplier sur place, sans redessin : le focus reste sur le bouton.
        hote.querySelector('[data-menu-replier]').addEventListener('click', (ev) => {
          const r = !db.menuReplie;
          db.menuReplie = r;
          hote.querySelector('.ent-shell').classList.toggle('ent-menu-replie', r);
          hote.querySelector('#entMenuListe').hidden = r;
          poserBoutonMenu(ev.currentTarget, r);
          if (!rendue()) ctx.jeu.sauver();
        });
        hote.querySelector('[data-raz]')?.addEventListener('click', reinitialiser);
        hote.querySelector('[data-aide-tableur]')?.addEventListener('click', () => {
          E.aideTableur = !E.aideTableur;
          // Une ouverture du rappel est une aide ouverte (repérage, lot 6) ; la fermeture ne compte pas.
          if (E.aideTableur && !estProf && !rendue()) { compterAide(db, ctx.meta.id, 'aides', 'Rappel tableur'); sauver(); }
          dessiner();
        });
        hote.querySelector('[data-hors-connexion]')?.addEventListener('click', () => {
          VPLAN.activerHorsConnexion(etatTransport('plan'));
          sauver(); dessiner();
          toast('Mode hors connexion : les quartiers sont affichés sur le plan.');
        });
        hote.querySelector('[data-quitter]').addEventListener('click', () => sortir(ctx.quitter));
        brancherBandeauFin();
        hote.querySelector('[data-copie-rendre]')?.addEventListener('click', () => {
          if (!copie.arme) { copie.arme = true; dessiner(); return; }
          rendreLaCopie();
        });
        hote.querySelector('[data-copie-annuler]')?.addEventListener('click', () => { copie.arme = false; dessiner(); });
        habiller();
        dessinerVue();
      }

      // Le bouton en tête du menu. Déplié : « « Replier le menu » ; replié : « » » seul, dans la bande étroite.
      const MENU = { false: ['« Replier le menu', 'Replier le menu pour donner toute la largeur au travail'],
        true: ['»', 'Déplier le menu'] };
      const boutonMenu = (r) => `<button type="button" class="ent-replier" data-menu-replier aria-controls="entMenuListe"
        aria-expanded="${!r}" aria-label="${r ? 'Déplier le menu' : 'Replier le menu'}" title="${MENU[r][1]}">${ech(MENU[r][0])}</button>`;
      function poserBoutonMenu(b, r) {
        b.setAttribute('aria-expanded', String(!r));
        b.setAttribute('aria-label', r ? 'Déplier le menu' : 'Replier le menu');
        b.title = MENU[r][1]; b.textContent = MENU[r][0];
      }

      /* ------------------------------------------------------------- la copie rendue */
      // Le bouton du bandeau, en deux temps sans boîte de dialogue du navigateur (elles bloquent
      // les postes et les tests) : le premier clic arme, le second rend. Même geste que
      // « Recommencer la tournée ».
      function boutonsCopie() {
        if (!COPIE) return '';
        if (estProf) return '<span class="ent-copie" title="Les élèves rendent leur copie ici ; vous la ramassez depuis le suivi.">Évaluation</span>';
        if (copie.rendue) {
          return `<span class="ent-copie ent-copie-rendue" data-copie-etat="rendue">${
            copie.ramassee ? 'Copie ramassée' : 'Copie rendue'} à ${ech(heureDe(copie.rendue))}</span>`;
        }
        if (!copie.charge) return '<span class="ent-copie">Évaluation</span>';
        return `<span class="ent-copie">Évaluation</span>
          <button class="ent-act ent-act-copie${copie.arme ? ' ent-act-arme' : ''}" data-copie-rendre ${copie.envoi ? 'disabled' : ''}
            title="Remettre votre travail à l'enseignant. Une seule remise : vous ne pourrez plus rien modifier.">${
            copie.envoi ? 'Envoi…' : (copie.arme ? 'Rendre définitivement ? Cliquez pour confirmer' : 'Rendre ma copie')}</button>
          ${copie.arme && !copie.envoi ? '<button class="ent-act" data-copie-annuler>Annuler</button>' : ''}`;
      }
      const heureDe = (ts) => new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');

      async function rendreLaCopie() {
        if (copie.envoi || copie.rendue) return;
        copie.envoi = true; dessiner();
        const res = noterBase(db);
        try {
          // Le travail d'abord : la base de l'élève est ce que l'enseignant consultera.
          ctx.jeu.sauver();
          if (ctx.jeu.vidange) await ctx.jeu.vidange();
          const t = await ctx.rendreCopie(res);
          copie.rendue = (t && t.rendu) || Date.now();
          copie.ramassee = !!(t && t.ramasse);
          toast('Copie rendue. Votre enseignant vous donnera la note.');
        } catch (e) {
          // Déjà rendue (ramassée par l'enseignant pendant qu'on travaillait, ou un double clic
          // sur deux onglets) : on relit ce qui fait foi.
          const t = await ctx.lireScore().catch(() => null);
          if (t && t.rendu) { copie.rendue = t.rendu; copie.ramassee = !!t.ramasse; toast('Cette copie a déjà été remise.'); }
          else toast("La copie n'a pas pu être rendue. Réessayez, ou appelez votre enseignant.");
        }
        copie.envoi = false; copie.arme = false;
        dessiner();
      }

      // Après la remise : on regarde, on ne touche plus. Le verrou est posé UNE fois sur l'hôte,
      // en phase de capture, donc avant les écouteurs de chaque vue — une vue écrite demain sera
      // verrouillée sans rien savoir de la copie. Restent libres : le menu, la sortie, le zoom
      // de la carte. `sauver` ne fait plus rien non plus : deux gardes valent mieux qu'une.
      // `[data-libre]` : ce qu'une vue déclare consultable (les étapes et onglets du quai).
      const LIBRE = '.ent-nav, [data-menu-replier], [data-aide-tableur], [data-quitter], [data-ct-zoom], [data-ct-ensemble], [data-libre]';
      if (COPIE && !estProf) {
        const verrou = (ev) => {
          if (!rendue()) return;
          const t = ev.target;
          if (t && t.closest && t.closest(LIBRE)) return;
          if (ev.type === 'keydown' && ev.key === 'Tab') return;
          ev.stopPropagation(); ev.preventDefault();
        };
        ['click', 'dblclick', 'mousedown', 'input', 'change', 'keydown', 'submit', 'dragstart', 'drop', 'paste']
          .forEach((type) => hote.addEventListener(type, verrou, true));
      }
      // LE GEL pendant une question au fil (lot 2 de MOTEUR-questions-au-fil) : l'élève regarde, il ne touche pas. Même
      // principe que le verrou de la copie rendue : UN écouteur en phase de capture sur l'hôte, donc une vue écrite demain
      // est gelée sans rien savoir des questions. Restent libres : le menu, la sortie, les cartes, le panneau, et ce qui
      // sert à CONSULTER (messages, pièces jointes, documents, onglets, filtres du stock). Les champs et boutons de
      // travail de l'écran sont aussi désactivés (marqués `data-qf-gel`, rendus à la réponse).
      const GEL_LIBRE = `${LIBRE}, [data-mail], [data-dossier], [data-mail-retour], [data-pj], [data-pj-retour], [data-doc],
        [data-fiche-doc], [data-onglet], [data-filtre], [data-deverrouiller], #codeStock, a[download]`;
      const libreAuGel = (t) => !!(t && t.closest && (t.closest(GEL_LIBRE) || t.closest('[data-qf-ancre], [data-qf-bandeau], [data-cartes]')));
      if (MQ && !estProf) {
        const gel = (ev) => {
          if (!gelActif() || libreAuGel(ev.target)) return;
          ev.stopPropagation(); ev.preventDefault();
        };
        ['click', 'dblclick', 'input', 'change', 'submit', 'dragstart', 'drop', 'paste']
          .forEach((type) => hote.addEventListener(type, gel, true));
      }
      function appliquerGel() {
        const z = hote.querySelector('#entMain');
        if (!z || !MQ) return;
        const g = gelActif();
        z.classList.toggle('qf-gele', g);
        if (g) {
          z.querySelectorAll('input, select, textarea, button').forEach((el) => {
            if (el.disabled || el.matches(GEL_LIBRE)) return;
            el.disabled = true; el.dataset.qfGel = '';
          });
        } else {
          z.querySelectorAll('[data-qf-gel]').forEach((el) => { el.disabled = false; delete el.dataset.qfGel; });
        }
      }
      function figerVue(z) {
        if (!rendue()) return;
        z.querySelectorAll('input, select, textarea').forEach((el) => { el.disabled = true; });
        z.querySelectorAll('button').forEach((el) => { if (!el.matches(LIBRE)) el.disabled = true; });
        z.insertAdjacentHTML('afterbegin', `<div class="avis ent-copie-avis" data-copie-avis>
          <strong>${copie.ramassee ? 'Copie ramassée' : 'Copie rendue'} à ${ech(heureDe(copie.rendue))}.</strong>
          Votre travail est enregistré tel quel : vous pouvez le consulter, plus le modifier.
          Votre enseignant vous donnera la note.</div>`);
      }

      // La séance en cours, affichée dans le bandeau depuis le 01/10/2026 : trois séances
      // Spartoo partagent la même entreprise et le même décor, donc rien à l'écran ne disait
      // laquelle était ouverte. L'enseignant qui passe dans les rangs doit pouvoir le lire
      // d'un coup d'œil, sans se pencher sur la machine.
      //
      // Le titre de l'activité commence par le nom de l'entreprise (« Spartoo — réception »),
      // déjà affiché deux centimètres à gauche : on le retire pour ne garder que la séance.
      function etiquetteSeance() {
        const code = String((ctx.meta && ctx.meta.code) || '').trim();
        const titre = String((ctx.meta && ctx.meta.titre) || '').trim();
        const nom = String(ENTREPRISE.nom || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let court = nom ? titre.replace(new RegExp('^\\s*' + nom + '\\s*[\u2014\u2013-]\\s*', 'i'), '') : titre;
        court = (court || titre).trim();
        if (court) court = court.charAt(0).toUpperCase() + court.slice(1);
        if (!code && !court) return '';
        return `<span class="ent-seance">${code ? `<b class="mono">${ech(code)}</b>` : ''}${
          code && court ? ' · ' : ''}${ech(court)}</span>`;
      }

      function aller(v, p) {
        if (!montre(v) || fermeture(v)) return;
        E.vue = v; Object.assign(E, p || {});
        dessiner();
        hote.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }

      function dessinerVue() {
        const z = hote.querySelector('#entMain');
        const vues = {
          accueil: vueAccueil, mail: vueMail, ...COM.vues, ...REC.vues,
          plan: vuePlan, tournee: vueTournee,
          ...CAT.vues, ...STK.vues, ...BLO.vues,
          inventaire: VINV ? vueInventaire : vueAccueil,
          quai: VQUAI ? vueQuai : vueAccueil,
          planning: VPL ? vuePlanning : vueAccueil,
          entrepot: VENT ? vueEntrepot : vueAccueil,
          ...Object.fromEntries(VFICHES.map((VF) => [vueDeFiche(VF), () => vueFiche(VF)])),
          ...Object.fromEntries(VANIMS.map((VA) => [vueAnim(VA), () => VA.html(etatAnim(VA), apiAnim())])),
          fiche: VFICHE ? () => vueFiche(VFICHE) : vueAccueil,
          fichiers: VTAB ? vueFichiers : vueAccueil,
          extractions: VTAB && VTAB.navExtractions ? vueExtractions : vueAccueil,
          ...TIERS.vues, ...CON.vues,
          ...(MQ ? Object.fromEntries(MQ.etapes.filter((e) => estProf || etapeArrivee(db, MQ, e.id))
            .map((e) => [`etape:${e.id}`, () => vueEtape(e)])) : {}),
          ...(MQ && estProf ? { 'questions-fil': vueQuestionsProf } : {}),
        };
        // Un écran fermé par sa condition (accès direct, base rouverte dessus) : on reste à l'accueil.
        if (fermeture(E.vue)) E.vue = 'accueil';
        z.innerHTML = (vues[E.vue] || vueAccueil)();
        brancher(z);
        figerVue(z);
        appliquerGel();
        // Le bandeau « … t'attend pour un point d'étape » disparaît sur l'écran du point d'étape.
        if (MQ) majQuestions();
        CAT.apres(z);
        STK.apres(z);
        TIERS.apres(z);
        CON.apres(z);
      }

      async function reinitialiser() {
        if (!confirmer('Effacer tout votre travail et repartir d\'une base neuve ?')) return;
        // Ce qui survit à la remise à zéro : les photos de fin de séance (la validation reste
        // acquise) et la reprise demandée par l'enseignant (voir core/app.js), qui sans cela
        // serait rejouée à la prochaine ouverture et effacerait le travail refait depuis.
        const reprise = db.reprise, points = db.points, indicateurs = db.indicateurs, menuReplie = db.menuReplie, versionBase = db.versionBase;
        // Les réponses aux questions survivent aussi (sinon on effacerait une mauvaise première réponse).
        const questions = db.questions;
        const photo = ctx.meta.precedente && points && points[ctx.meta.precedente];
        Object.keys(db).forEach((k) => delete db[k]);
        if (photo) {
          // Repartir de ce que l'élève a réellement fait à la séance précédente.
          Object.assign(db, JSON.parse(JSON.stringify(photo)));
          // Le niveau est relu à la remise à zéro : celui du réglage actuel, pas celui de la photo.
          delete db.aisancePour;
          figerAisance();
        } else {
          figerAisance();
          const depart = baseDeDepart(prenom, { aisance: db.aisance });
          Object.keys(depart).forEach((k) => { if (k !== '_depart') db[k] = depart[k]; });
          (depart._depart || []).forEach((m) => ajouterMail(m));
        }
        if (reprise) db.reprise = reprise;
        if (points) db.points = points;
        // La version de la base (core/parcours.js) : la perdre ferait tout effacer à la prochaine ouverture.
        if (versionBase) db.versionBase = versionBase;
        // Le repérage n'est pas du travail : repartir de zéro n'efface ni le temps ni les aides ouvertes.
        if (indicateurs) db.indicateurs = indicateurs;
        if (questions) db.questions = questions;
        // Le menu replié est un réglage d'écran, pas du travail.
        if (menuReplie) db.menuReplie = true;
        normaliserBase();
        semerVolet();
        E.vue = 'accueil'; E.mailSel = null; E.no = null;
        sauver(); dessiner(); toast('Base réinitialisée.');
      }

      /* ---------------------------------------------------------- accueil */
      function vueAccueil() {
        const nonLus = db.mails.filter((m) => m.folder === 'in' && !m.read).length;
        const aFaire = COM.aFaire();
        const aRecevoir = REC.aRecevoir();
        let total = 0, rupture = 0;
        VARIANTS.forEach((v) => { const q = stockDe(v.sku); total += q; if (q <= 0) rupture++; });

        // La marche à suivre est celle de la SÉANCE, pas de l'entreprise : réceptionner,
        // préparer ou remonter une traçabilité ne se fait pas dans le même ordre. Sans bloc
        // déclaré, on garde celui du premier exercice.
        const bloc = accueil || {
          titre: "Traiter une commande, dans l'ordre",
          etapes: [
            ['Lire la commande', 'Ouvrez la Messagerie et cliquez sur le mail « Nouvelle commande web ».'],
            ['Enregistrer la commande', 'Le bouton du mail la place dans le menu Commandes.'],
            ['Contrôler le stock de chaque ligne', 'Depuis la commande, ou avec la console : .getstock REF.'],
            ['Éditer le bon de préparation', 'Les articles sont classés par emplacement pour optimiser le parcours.'],
            ['Valider la préparation', 'Le stock est diminué et les mouvements sont enregistrés.'],
          ],
        };
        const kpis = (accueil && accueil.kpis) || ['mail', 'commandes', 'stock', 'rupture'];
        const KPI = {
          mail: ['mail', nonLus, 'messages non lus'],
          commandes: ['commandes', aFaire, 'commandes à préparer'],
          receptions: ['receptions', aRecevoir, 'livraisons à contrôler'],
          stock: ['stock', total, unite(total) + ' en stock'],
          rupture: ['stock', rupture, 'références en rupture'],
          // La tuile de l'animation (`accueil.kpis: ['animation', …]`), qui ouvre la première déclarée.
          animation: VANIMS.length ? [vueAnim(VANIMS[0]), '▶', VANIMS[0].nav.libelle] : null,
        };

        return `
          <div class="ent-tete"><h2>Bonjour ${ech(prenom)}</h2>
            <p class="note">${ech(ENTREPRISE.nom)} · ${ech(exercice)}</p></div>
          <div class="ent-kpis">
            ${kpis.filter((k) => KPI[k]).map((k) => { const x = KPI[k];
              return montre(x[0]) ? `<button class="ent-kpi" data-vue2="${x[0]}"><b>${x[1]}</b><span>${ech(x[2])}</span></button>`
                : `<div class="ent-kpi fixe"><b>${x[1]}</b><span>${ech(x[2])}</span></div>`; }).join('')}
          </div>
          <section class="panneau"><h3>${ech(bloc.titre)}</h3>
            <ol class="ent-etapes">
              ${bloc.etapes.map((e) => `<li><strong>${ech(e[0])}</strong><br><span class="note">${ech(e[1])}</span></li>`).join('')}
            </ol></section>`;
      }

      /* -------------------------------------------------------- messagerie */
      function vueMail() {
        const adresse = `${norm(prenom).replace(/ /g, '')}@${VOCAB.mailDomain}`;
        if (E.redige) {
          const fs = tousFournisseurs().slice().sort((a, b) => (a.brand < b.brand ? -1 : 1));
          return `<div class="ent-tete"><h2>Messagerie</h2><p class="note">Adresse : ${ech(adresse)}</p></div>
            <section class="panneau">
              <button class="lien-accueil" data-annuler>← Retour</button>
              <h3>Nouveau message</h3>
              <div class="champ"><label for="mTo">Destinataire (fournisseur)</label>
                <select id="mTo"><option value="">Choisir…</option>
                ${fs.map((s) => `<option value="${ech(s.id)}">${ech(s.brand)} — ${ech(s.name)}</option>`).join('')}</select></div>
              <div class="champ"><label for="mObj">Objet</label>
                <input id="mObj" value="Commande de réapprovisionnement"></div>
              <div class="champ"><label for="mTxt">Message</label>
                <textarea id="mTxt" rows="8" placeholder="Précisez, pour chaque référence, sa quantité (ex. ${ech(VARIANTS[0] ? VARIANTS[0].sku : 'REF')} : 12 ${ech(VOCAB.unitPl)})."></textarea></div>
              <button class="btn btn-p" data-envoyer-fou>Envoyer</button>
            </section>`;
        }

        const liste = db.mails.filter((m) => m.folder === E.dossier).sort((a, b) => b.ts - a.ts);
        const sel = liste.find((m) => m.id === E.mailSel);
        const items = liste.map((m) => `
          <button class="ent-mitem ${m.read || E.dossier === 'out' ? '' : 'nonlu'} ${sel && sel.id === m.id ? 'on' : ''}" data-mail="${m.id}">
            <span class="ent-de"><span>${ech(E.dossier === 'in' ? m.from : 'À : ' + m.to)}</span><span class="note">${fdate(m.ts)}</span></span>
            <span class="ent-obj">${ech(m.subject)}</span></button>`).join('')
          || '<div class="vide">Aucun message.</div>';

        let lecteur = '<div class="ent-vide-lect note">Sélectionnez un message pour le lire.</div>';
        if (sel) {
          const enregistree = sel.kind === 'order' && db.orders.some((o) => o.no === sel.order.no);
          const recDuMail = sel.kind === 'bl' ? receptionDe(sel.rec) : null;
          const corps = sel.kind === 'order' ? corpsMailCommande(sel.order)
            : sel.kind === 'bl' ? `<p>${ech(sel.text).replace(/\n/g, '<br>')}</p>${recDuMail ? bonDeLivraison(recDuMail) : ''}`
            : sel.kind === 'releve' ? `<p>${ech(sel.text || '').replace(/\n/g, '<br>')}</p>${VINV && sel.inventaire === VINV.id ? VINV.releve(sel) : ''}`
            : `<p>${ech(sel.text).replace(/\n/g, '<br>')}</p>`;
          let actions = '';
          if (E.dossier === 'in') {
            if (sel.kind === 'order') {
              actions += enregistree
                ? `<button class="btn btn-p" data-ouvrir-cmd="${ech(sel.order.no)}">Ouvrir la commande</button>`
                : `<button class="btn btn-p" data-enreg-cmd="${sel.id}">Enregistrer la commande</button>`;
            }
            VFICHES.filter((VF) => sel.ouvreFiche === VF.id && (!VF.quand || VF.quand(db))).forEach((VF) => {
              actions += `<button class="btn btn-p" data-vue2="${ech(vueDeFiche(VF))}" data-libre>${ech(VF.bouton)}</button>`;
            });
            if (sel.kind === 'bl' && recDuMail) {
              actions += `<button class="btn btn-p" data-ouvrir-rec="${ech(recDuMail.no)}">Ouvrir la réception</button>`;
            }
            // Un point d'étape qui garde la réponse fermée (`ferme: 'repondre:<clé>'`) : le bouton laisse la place au cadenas.
            const fe = etapeQuiFerme(`repondre:${sel.cle || (sel.phrases && sel.phrases.id) || ''}`);
            if (fe) {
              const qui = ech(appel(MQ.personnes[fe.de]));
              actions += `<div class="qf-ferme" data-qf-ferme><span>🔒 Fais d’abord le point d’étape avec ${qui}.</span>
                <button class="btn btn-s btn-p" data-q-aller-etape="${ech(fe.id)}" data-libre>Y aller</button></div>`;
            } else actions += '<button class="btn" data-repondre>Répondre</button>';
          }
          // Une pièce jointe ouverte prend la place du texte, dans le même lecteur.
          const piece = VDOC && E.piece && VDOC.pieces(sel.pieces).includes(E.piece) ? E.piece : null;
          if (piece) lecteur = `<div class="ent-lecteur">${VDOC.visionneuse(piece, sel.pieces)}</div>`;
          else lecteur = `<div class="ent-lecteur">
            <button class="lien-accueil" data-mail-retour>← Retour</button>
            <h3>${ech(sel.subject)}</h3>
            <p class="note">${E.dossier === 'in' ? 'De : ' + ech(sel.from + ' <' + sel.fromMail + '>') : 'À : ' + ech(sel.to + ' <' + (sel.toMail || '') + '>')} · ${fdt(sel.ts)}</p>
            ${corps}
            ${VDOC ? VDOC.rangee(sel.pieces, docVu) : ''}
            ${actions ? `<div class="rangee" style="margin-top:14px">${actions}</div>` : ''}
            ${E.dossier === 'in' && sel.phrases ? (etapeQuiFerme(`repondre:${sel.cle || sel.phrases.id}`) ? '' : formPhrases(sel)) : `<form id="formRep" hidden style="margin-top:14px">
              <div class="champ"><label for="repT">Votre réponse</label><textarea id="repT" rows="${sel.amorce ? 8 : 6}">${ech(sel.amorce || '')}</textarea></div>
              <button class="btn btn-p" type="submit">Envoyer</button></form>`}</div>`;
        }

        // Venu du quai par son bouton « Messagerie » (ENT-4.3) : un lien pour y revenir.
        const retourQuai = VQUAI && E.retourQuai ? '<button class="lien-accueil" data-retour-quai>← Revenir au quai</button>' : '';
        return `<div class="ent-tete"><h2>Messagerie</h2><p class="note">Adresse : ${ech(adresse)}</p>${retourQuai}</div>
          <section class="panneau">
            <div class="rangee" style="margin-bottom:12px">
              <button class="btn btn-s ${E.dossier === 'in' ? 'btn-p' : ''}" data-dossier="in">Réception</button>
              <button class="btn btn-s ${E.dossier === 'out' ? 'btn-p' : ''}" data-dossier="out">Envoyés</button>
              <span class="pousse"><button class="btn btn-s btn-p" data-nouveau>Nouveau message</button></span>
            </div>
            <div class="ent-boite ${sel ? 'sel' : ''}"><div class="ent-mlist">${items}</div>${lecteur}</div>
          </section>`;
      }

      // La réponse par phrases à choisir (2de, `core/phrases.js`) : une liste déroulante par ligne, dans
      // l'ordre tiré pour l'élève, une ligne imposée en clair, l'aperçu du message en dessous. Le
      // formulaire reste ouvert d'un redessin à l'autre tant qu'un choix est commencé.
      function formPhrases(sel) {
        const P = sel.phrases, b = E.brouillon[sel.id] || {};
        const lignes = P.lignes.map((l, k) => {
          if (l.texte != null) return `<li class="ent-phr-fixe">${ech(l.texte)}</li>`;
          const val = Number.isInteger(b[l.id]) ? b[l.id] : '';
          return `<li><select id="phr-${k}" data-phrase="${ech(l.id)}" aria-label="Ligne ${k + 1} du message">
              <option value=""${val === '' ? ' selected' : ''}>Choisir une phrase…</option>
              ${l.ordre.map((i) => `<option value="${i}"${val === i ? ' selected' : ''}>${ech(l.choix[i])}</option>`).join('')}
            </select></li>`;
        }).join('');
        return `<form id="formPhr" ${E.brouillon[sel.id] ? '' : 'hidden'} class="ent-phrases">
            <p class="note">Choisissez une phrase à chaque ligne.</p>
            <ol class="ent-phr-lignes">${lignes}</ol>
            <p class="note">Aperçu du message</p>
            <div class="ent-phr-apercu" data-phr-apercu>${apercuPhrases(sel)}</div>
            <button class="btn btn-p" type="submit">Envoyer</button></form>`;
      }
      const apercuPhrases = (sel) => texteCompose(sel.phrases, E.brouillon[sel.id] || {}).split('\n')
        .map((x) => (x ? ech(x) : '<span class="ent-phr-trou">…</span>')).join('<br>');

      let confirmeEnvoi = false;
      function envoyerPhrases() {
        const m = db.mails.find((x) => x.id === E.mailSel);
        if (!m || !m.phrases) return;
        const b = E.brouillon[m.id] || {};
        const manque = m.phrases.lignes.some((l) => l.texte == null && !Number.isInteger(b[l.id]));
        if (manque) return toast('Choisissez une phrase à chaque ligne.');
        // Envoi définitif : d'abord une confirmation dans la page (06/10/2026, Smoby C2).
        const dejaEnvoyees = db.mails.filter((x) => x.folder === 'out' && x.phrases && x.phrases.id === m.phrases.id).length;
        if (!confirmeEnvoi) {
          confirmerDansLaPage(hote.querySelector('#formPhr button[type="submit"]'), dejaEnvoyees
            ? `Tu renvoies ta réponse corrigée à ${m.from} ?`
            : `Tu envoies ta réponse à ${m.from} ? Tu ne pourras plus la modifier.`,
            () => { confirmeEnvoi = true; envoyerPhrases(); });
          return;
        }
        confirmeEnvoi = false;
        const choix = {};
        m.phrases.lignes.forEach((l) => { if (l.texte == null) choix[l.id] = b[l.id]; });
        ajouterMail({ folder: 'out', ts: Date.now(), from: prenom, fromMail: '', to: m.from, toMail: m.fromMail,
          subject: 'RE : ' + m.subject.replace(/^RE : /, ''), kind: 'text', text: texteCompose(m.phrases, choix),
          phrases: { id: m.phrases.id, choix }, read: true });
        delete E.brouillon[m.id];
        const arrive = !rendue() && declencher();
        if (!arrive && !rendue() && dejaEnvoyees) accuseCorrection(m.phrases.id, dejaEnvoyees + 1);
        sauver(); E.dossier = 'out'; E.mailSel = null; dessiner();
        toast('Réponse envoyée.');
      }

      // Une pièce jointe ouverte (lot 1) : comptée à chaque ouverture, onglet ou précédent / suivant compris.
      const docVu = (id) => !!(E.vus[id] || (db.indicateurs && db.indicateurs[SEANCE]
        && db.indicateurs[SEANCE].docs && db.indicateurs[SEANCE].docs[id]));
      function compterDoc(id) {
        if (estProf || rendue()) { E.vus[id] = true; return; }
        compterAide(db, SEANCE, 'docs', id); sauver();
      }
      function ouvrirPiece(id) {
        E.piece = id; compterDoc(id); dessinerVue();
        hote.querySelector('.ent-lecteur')?.scrollIntoView({ block: 'nearest' });
      }

      function ouvrirMail(id) {
        E.mailSel = id; E.piece = null;
        const m = db.mails.find((x) => x.id === id);
        if (m && !m.read) { m.read = true; sauver(); }
        dessiner();
      }

      function enregistrerCommande(idMail) {
        const m = db.mails.find((x) => x.id === idMail);
        if (!m) return;
        if (!db.orders.some((o) => o.no === m.order.no)) {
          const o = JSON.parse(JSON.stringify(m.order));
          preparer(o); db.orders.push(o); sauver();
        }
        aller('commande', { no: m.order.no });
      }

      function envoyerReponse() {
        const t = (hote.querySelector('#repT').value || '').trim();
        if (!t) return;
        const m = db.mails.find((x) => x.id === E.mailSel);
        if (!m) return;
        ajouterMail({ folder: 'out', ts: Date.now(), from: prenom, fromMail: '', to: m.from, toMail: m.fromMail,
          subject: 'RE : ' + m.subject.replace(/^RE : /, ''), kind: 'text', text: t, read: true });
        if (!rendue()) declencher();
        sauver(); E.dossier = 'out'; E.mailSel = null; dessiner();
        toast('Réponse envoyée.');
      }

      // Le fournisseur répond tout seul : l'outil retrouve dans le message les références et
      // les quantités citées, et rappelle le minimum de commande — respecté ou non. On cherche les
      // références DU CATALOGUE de ce fournisseur, quel que soit leur format (05/10/2026 : seul le format
      // Spartoo `XX-MODELE-CC-NN` était reconnu, les autres entreprises recevaient « référence introuvable »).
      const echRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      function lireRefsQtes(texte, supId) {
        const T = String(texte || '').toUpperCase(), out = [];
        VARIANTS.filter((v) => v.model.sup === supId).forEach((v) => {
          const re = new RegExp(`(?:^|[^A-Z0-9-])${echRe(v.sku)}(?![A-Z0-9-])[^0-9]{0,20}?(\\d{1,4})`, 'g');
          let m;
          while ((m = re.exec(T))) out.push({ sku: v.sku, qty: parseInt(m[1], 10), v, i: m.index });
        });
        return out.sort((a, b) => a.i - b.i);
      }

      function envoyerAuFournisseur() {
        const id = hote.querySelector('#mTo').value;
        const sup = SUP_BY_ID[id] || (db.suppliers || []).find((s) => s.id === id);
        if (!sup) return toast('Choisissez un fournisseur.');
        const objet = (hote.querySelector('#mObj').value || '').trim() || 'Commande de réapprovisionnement';
        const corps = (hote.querySelector('#mTxt').value || '').trim();
        if (!corps) return toast('Le message est vide.');

        ajouterMail({ folder: 'out', ts: Date.now(), from: prenom, fromMail: '', to: sup.contact, toMail: sup.email,
          subject: objet, kind: 'text', text: corps, read: true });

        const trouves = lireRefsQtes(corps, sup.id);
        let total = 0; trouves.forEach((x) => { total += x.qty; });
        let reponse;
        // Un message qui n'est pas une commande (des réserves sur une livraison, par exemple)
        // reçoit la réponse que l'univers a prévue pour lui, pas un rappel du minimum de
        // commande. Trouvé le 02/10/2026 en jouant ENT-1.1 : Puma répondait aux réserves
        // « pour un total de 14 paires, notre minimum de commande est de 20 ».
        const speciale = (U.reponsesFournisseur || []).map((f) => f(corps, sup, db, prenom)).find(Boolean);
        if (speciale) {
          reponse = speciale;
        } else if (!trouves.length) {
          reponse = `Bonjour,\n\nNous ne parvenons pas à identifier, dans votre message, de référence ${sup.brand} accompagnée d'une quantité claire. Merci de préciser pour chaque article sa référence exacte et la quantité souhaitée.\n\nCordialement,\n${sup.contact}\n${sup.name}`;
        } else if (total < (sup.moq || 0)) {
          reponse = `Bonjour,\n\nNous avons bien reçu votre demande, pour un total de ${total} ${unite(total)}. Pour rappel, notre minimum de commande est de ${sup.moq} ${VOCAB.unitPl} : merci de compléter votre commande avant que nous puissions la traiter.\n\nCordialement,\n${sup.contact}\n${sup.name}`;
        } else {
          reponse = `Bonjour,\n\nCommande bien reçue, pour un total de ${total} ${VOCAB.unitPl} : le minimum de commande (${sup.moq} ${VOCAB.unitPl}) est respecté. Livraison prévue sous ${sup.delai} jours.\n\nCordialement,\n${sup.contact}\n${sup.name}`;
        }
        ajouterMail({ folder: 'in', ts: Date.now() + 1000, from: sup.contact, fromMail: sup.email, to: prenom,
          subject: 'RE : ' + objet, kind: 'text', text: reponse, read: false });

        if (!rendue()) declencher();
        sauver(); E.redige = false; E.dossier = 'in'; E.mailSel = null; dessiner();
        toast('Message envoyé.');
      }


      /* ========================================================== réceptions */
      // Les réceptions (liste, fiche, bon de livraison) : `entreprise-receptions.js` (lot 9c, module 11).
      const REC = monterReceptions({ db, E, hote, ENTREPRISE, A, VM, SUP_BY_ID, litige: !!U.receptionLitige, B, sauver, dessiner });
      const { receptionDe, bonDeLivraison } = REC;


      // Le blocage qualité : `entreprise-blocage.js` (lot 9c, module 9).
      const BLO = monterBlocage({ db, E, hote, A, VM, VOCAB, B, sauver, dessinerVue });

      /* ---------------------------------------------------------- catalogue */
      /* ------------------------------------------------- transport : plan et tournée */
      // Les deux vues sont génériques et vivent dans leurs propres fichiers. Ici, on ne
      // fait que leur prêter la base de l'élève, la sauvegarde et le redessin.
      // **Un état par SÉANCE, pas par entreprise.** Les séances d'une même entreprise
      // partagent une seule base (`meta.jeuId`) : deux d'entre elles qui déclareraient
      // chacune sa tournée se seraient écrasées l'une l'autre, et un repérage validé la
      // semaine dernière aurait ouvert d'office le temps 2 d'une autre séance. La clé est
      // donc l'identifiant de l'activité, unique par construction ; `transportId` permet au
      // contenu de la forcer, par exemple pour que deux séances partagent à dessein le même
      // repérage. Les jalons lisent `db.transport[<id de la séance>].plan` / `.tournee`.
      const cleTransport = String(U.transportId || (ctx.meta && ctx.meta.id) || 'transport');
      const etatTransport = (vue) => {
        if (!db.transport) db.transport = {};
        if (!db.transport[cleTransport]) db.transport[cleTransport] = {};
        if (!db.transport[cleTransport][vue]) db.transport[cleTransport][vue] = {};
        return db.transport[cleTransport][vue];
      };
      const apiTransport = (cle) => ({ etat: etatTransport(cle), sauver, redessiner: dessiner, toast, db });

      function vuePlan() { return VPLAN.html(etatTransport('plan')); }

      /* ---------------------------------------------------------- inventaire */
      // L'état de l'inventaire vit dans la base de l'élève, sous le numéro de campagne. Il est
      // créé à la première ouverture de l'écran, avec la PHOTO du stock système de ce moment-là.
      const lireInventaire = () => (VINV && db.inventaires ? db.inventaires[VINV.id] : null);
      function etatInventaire() {
        if (!db.inventaires) db.inventaires = {};
        if (!db.inventaires[VINV.id]) { db.inventaires[VINV.id] = VINV.etatNeuf(stockDe, db); ctx.jeu.sauver(); }
        else if (VINV.completer(db.inventaires[VINV.id], db, stockDe)) ctx.jeu.sauver();
        return db.inventaires[VINV.id];
      }
      // L'enseignant voit toujours le stock : il prépare et corrige.
      const inventaireBloque = () => !!VINV && !estProf && VINV.bloqueStock(lireInventaire());
      // Ce que l'écran demande à l'environnement. Un ajustement passe par les mêmes chemins
      // qu'à la console : une baisse entame les lots dans l'ordre d'entrée (la traçabilité reste
      // juste), une hausse entre sans lot.
      const apiInventaire = () => ({
        sauver, toast, db,
        redessiner: dessinerVue,
        mouvements: () => db.moves,
        ajuster(sku, delta, origine) {
          if (delta < 0) sortirFifo(sku, -delta, 'Ajustement inventaire', origine);
          else if (delta > 0) { db.stock[sku] = stockDe(sku) + delta; mouvement(sku, 'Ajustement inventaire', delta, origine); }
        },
      });
      // Périmètre pas encore choisi par l'élève (`perimetre` de la séance) : l'écran attend.
      function vueInventaire() { return VINV.attente(db) ? VINV.attenteHtml() : VINV.html(etatInventaire(), apiInventaire()); }

      /* ---------------------------------------------------------- geste tableur */
      // Ce que le geste demande à l'environnement. La graine des salissures : l'élève (son
      // identifiant, à défaut son nom) et la séance. Le retour au dépôt : celui que la séance
      // déclare, sinon celui de son temps pédagogique. Un export ne donne jamais le stock du jour
      // pendant un comptage à l'aveugle (`aveugle`).
      const apiTableur = () => ({
        db, sauver, toast, redessiner: dessinerVue,
        graine: ctx.profil.uid || [ctx.profil.prenom, ctx.profil.nom].filter(Boolean).join(' '),
        seance: (ctx.meta && ctx.meta.id) || '',
        retour: (U.tableur && U.tableur.depot && U.tableur.depot.retour) || retourDeTemps(ctx.meta && ctx.meta.temps),
        aveugle: () => !!VINV && VINV.bloqueStock(lireInventaire()),
        fige: () => rendue(),
      });
      function vueFichiers() { return VTAB.html(apiTableur()); }
      function vueExtractions() { return VTAB.htmlExtractions(apiTableur()); }

      /* ---------------------------------------------------------- quai de réception */
      // L'état vit dans la base de l'élève, sous l'identifiant du quai de la séance. Il est créé dès
      // l'ouverture : le temps réel compte de l'ouverture de la séance à la remise de la copie,
      // quel que soit l'écran affiché (décision de Tristan, 03/10/2026).
      function etatQuai() {
        if (!db.quais) db.quais = {};
        if (!db.quais[VQUAI.id]) db.quais[VQUAI.id] = VQUAI.etatNeuf();
        return db.quais[VQUAI.id];
      }
      const apiQuai = () => ({
        sauver, toast, estProf, signal,
        redessiner: dessinerVue,
        zone: () => hote.querySelector('#entMain'),
        haut: () => hote.scrollIntoView({ block: 'start' }),
        // La base entière (les jalons d'un quai « déjà réceptionné » lisent aussi les messages).
        db: () => db,
        // Le bouton « Messagerie » du quai (ENT-4.3) : la boîte de réception, avec un lien de retour.
        messagerie: () => { E.retourQuai = true; aller('mail', { redige: false, mailSel: null, dossier: 'in' }); },
        copieRendue: rendue,
        rendreCopie: () => { if (COPIE && !estProf) rendreLaCopie(); },
        // « Recommencer la réception » (guidage) : un quai neuf, le reste de la base intact.
        recommencer: () => {
          const tt = etatQuai().tiersTemps;
          db.quais[VQUAI.id] = VQUAI.etatNeuf();
          db.quais[VQUAI.id].tiersTemps = tt;
          sauver(); dessinerVue();
        },
      });
      function vueQuai() { return VQUAI.html(etatQuai(), apiQuai()); }

      /* ---------------------------------------------------------- planning */
      // L'état vit dans la base de l'élève, sous l'identifiant du planning de la séance (cloisonné par
      // séance). Le temps pédagogique vient du meta (`temps`) ; une évaluation (`copie`) l'impose.
      function etatPlanning() {
        if (!db.plannings) db.plannings = {};
        if (!db.plannings[VPL.id]) db.plannings[VPL.id] = VPL.etatNeuf();
        return db.plannings[VPL.id];
      }
      const tempsPlanning = () => {
        const t = ctx.meta && ctx.meta.temps;
        return t === 'evaluation' || t === 'entrainement' || t === 'guidage' ? t : t === 'erreur' ? 'entrainement' : 'guidage';
      };
      const apiPlanning = () => ({
        sauver, toast, estProf, signal, temps: tempsPlanning(),
        redessiner: dessinerVue,
        zone: () => hote.querySelector('#entMain'),
        haut: () => hote.scrollIntoView({ block: 'start' }),
        // Un déclencheur de la séance ouvre-t-il la phase 2 ? Sinon la vue y passe seule au 1er envoi.
        aleaParMessage: !!(volet && (volet.declencheurs || []).some((d) => d.phasePlanning)),
        copieRendue: rendue,
        rendreCopie: () => { if (COPIE && !estProf) rendreLaCopie(); },
        // Un planning renvoyé après correction (séance `correction`) : l'accusé du volet.
        corrige: (n) => { if (CORRECTION && !rendue()) accuseCorrection(VPL.id, n); },
      });
      function vuePlanning() { return VPL.html(etatPlanning(), apiPlanning()); }

      /* ---------------------------------------------------------- plan d'entrepôt */
      // Cloisonné par séance : `db.entrepots[<id de l'entrepôt de cette séance>]`. Même temps
      // pédagogique et même copie rendue que le planning.
      function etatEntrepot() {
        if (!db.entrepots) db.entrepots = {};
        if (!db.entrepots[VENT.id]) db.entrepots[VENT.id] = VENT.etatNeuf();
        return db.entrepots[VENT.id];
      }
      const apiEntrepot = () => ({
        sauver, estProf, signal, temps: tempsPlanning(),
        redessiner: dessinerVue,
        copieRendue: rendue,
        rendreCopie: () => { if (COPIE && !estProf) rendreLaCopie(); },
      });
      function vueEntrepot() { return VENT.html(etatEntrepot(), apiEntrepot()); }

      /* ---------------------------------------------------------- fiche à remplir */
      // Cloisonnée par séance : `db.fiches[<id de la fiche de cette séance>]`.
      function etatFiche(VF) {
        if (!db.fiches) db.fiches = {};
        if (!db.fiches[VF.id]) db.fiches[VF.id] = VF.etatNeuf();
        return db.fiches[VF.id];
      }
      // Ce qui reste à l'écran d'une fiche (document choisi, raison d'un envoi refusé), fiche par fiche.
      const uiFiche = (VF) => E.fiche[VF.id] || (E.fiche[VF.id] = { doc: null, manque: '' });
      const apiFiche = () => ({
        sauver, docVu, compterDoc, signal, figee: rendue(),
        // L'envoi : un geste métier comme un mail (les déclencheurs `apresFiche` le lisent), puis la fiche figée.
        envoyee(e) {
          const arrive = !rendue() && declencher();
          // Un envoi CORRIGÉ (le deuxième, le troisième…) reçoit l'accusé du volet, sans rejouer le premier message.
          if (!arrive && !rendue() && e && e.envois > 1) accuseCorrection(e.id, e.envois);
          sauver(); dessiner();
          toast('Fiche envoyée.');
        },
      });
      function vueFiche(VF) { return VF.html(etatFiche(VF), uiFiche(VF), apiFiche()); }
      // L'accusé d'un envoi corrigé (lot A, 07/10/2026) : `volet.corrections[<id de la fiche ou du message>](prenom, n)`.
      // Il ne dit jamais si la correction est juste. Rend vrai si un message est arrivé. Il s'annonce par une
      // carte, comme un message déclenché (`declenche` : « correction:<id> »).
      function accuseCorrection(id, n) {
        const f = volet && volet.corrections && volet.corrections[id];
        const g = f && f(prenom, n, db);
        if (!g || !(g.mails || []).length) return false;
        g.mails.forEach((m) => ajouterMail(Object.assign(m, { declenche: 'correction:' + id })));
        majCartes();
        return true;
      }

      /* ---------------------------------------------------------- animation à questions */
      // Cloisonnée par séance : `db.animations[<id de l'animation de cette séance>]`. L'enseignant n'y
      // écrit rien (le lecteur le sait par `estProf`). Une réponse rangée n'est jamais suivie d'un redessin
      // de l'écran (l'animation repartirait) : un message déclenché attend la prochaine navigation.
      function etatAnim(VA) {
        if (!db.animations) db.animations = {};
        if (!db.animations[VA.id]) db.animations[VA.id] = VA.etatNeuf();
        return db.animations[VA.id];
      }
      const apiAnim = () => ({
        estProf, signal, figee: rendue(), graine: ctx.profil.uid || prenom,
        sauver() {
          if (rendue()) return;
          declencher(); arriverQuestions();
          ctx.jeu.sauver(); remonterEtapes();
        },
      });

      // Le chrono réel. Il compte en secondes, par écart d'horloge (un onglet en arrière-plan ne
      // reçoit plus qu'un tic par minute), s'arrête à la clôture de la réception ou à la remise
      // de la copie, et ne tourne pas tant qu'on ne sait pas si la copie est déjà rendue. Il est
      // rangé dans la base toutes les 60 s et à la sortie : il survit à un rechargement. (60 s et non
      // 10 s : chaque sauvegarde est une écriture Firebase, et le quota gratuit est compté par jour.)
      // Le tiers-temps de l'élève (brief MOTEUR-tiers-temps, à venir) est recopié dans l'état à
      // chaque ouverture : `noter(db)` et le ramassage le lisent là.
      let minuterie = null;
      const jeton = {};
      function sauverChrono() { if (!rendue()) ctx.jeu.sauver(); }
      function arreterChrono() {
        if (!minuterie) return;
        clearInterval(minuterie); minuterie = null;
        window.removeEventListener('pagehide', sauverChrono);
        sauverChrono();
      }
      if (VQUAI) {
        const q0 = etatQuai();
        const tt = !!(ctx.tiersTemps || (ctx.profil && ctx.profil.tiersTemps));
        if (q0.tiersTemps !== tt) q0.tiersTemps = tt;
        hote.__quaiChrono = jeton;
        let dernier = Date.now(), sauve = Date.now();
        minuterie = setInterval(() => {
          if (!hote.isConnected || hote.__quaiChrono !== jeton) { clearInterval(minuterie); minuterie = null; return; }
          const t = Date.now(), dt = Math.min(70, (t - dernier) / 1000);
          dernier = t;
          if (rendue() || (COPIE && !estProf && !copie.charge)) return;
          const q = etatQuai();
          if (q.fini) return;
          q.reel = Math.round(((q.reel || 0) + dt) * 10) / 10;
          if (t - sauve >= 60000) { sauve = t; ctx.jeu.sauver(); }
          if (E.vue === 'quai') VQUAI.tic(hote.querySelector('#entMain'), q);
        }, 1000);
        window.addEventListener('pagehide', sauverChrono);
      }

      // La tournée reste fermée tant que le repérage n'est pas validé : sans lui, l'élève
      // ne sait pas où sont les points et ordonnerait au hasard. C'est le « deux temps »
      // décidé le 02/10/2026, tenu par l'état et non par un réglage d'affichage.
      // L'enseignant, lui, n'est jamais retenu (03/10/2026) : il essaie la tournée sans refaire
      // le repérage à chaque fois. Rien n'est écrit dans sa base : le jalon de repérage reste à faire.
      function vueTournee() {
        const verrou = VPLAN && !estProf && !VPLAN.ouvreSuite(etatTransport('plan'))
          ? `Commencez par « ${VPLAN.nav.libelle} » : situez chaque point sur le plan, puis validez le repérage.`
          : null;
        // Séance « à corriger » : la tournée du collègue est posée à la première ouverture, une
        // seule fois (voir `amorcer` dans tournee.js). Sans `etatInitial`, rien ne se passe.
        if (!verrou && VTOUR.amorcer && VTOUR.amorcer(etatTransport('tournee'))) sauver();
        return VTOUR.html(etatTransport('tournee'), { verrou, db });
      }

      // Catalogue et fiche produit : `entreprise-catalogue.js` (lot 9c, module 7).
      const CAT = monterCatalogue({ E, hote, A, MODELS, MM, VARIANTS, VOCAB, SUP_BY_ID, couleurs: COLORS, aller });

      // Le stock : `entreprise-stock.js` (lot 9c, module 8).
      const STK = monterStock({ db, E, hote, A, MODELS, VARIANTS, VINV, B, inventaireBloque, codeStock: () => ctx.codeStock, dessinerVue });

      // Clients et fournisseurs : `entreprise-tiers.js` (lot 9c, module 6).
      const TIERS = monterTiers({ E, hote, VOCAB, B });

      // La console : `entreprise-console.js` (lot 9c, module 12).
      const CON = monterConsole({ db, E, hote, A, MODELS, MM, VM, VARIANTS, VOCAB, CUSTOMERS, SUPPLIERS, SUP_BY_ID, B, COM,
        inventaireBloque, sauver, aller, dessinerVue });


      /* ------------------------------------------------------- branchements */
      function brancher(z) {
        z.querySelectorAll('[data-vue2]').forEach((b) => b.addEventListener('click', () => aller(b.dataset.vue2)));
        z.querySelectorAll('[data-onglet]').forEach((b) => b.addEventListener('click', () => {
          E.onglet[b.dataset.onglet] = b.dataset.val; dessinerVue();
        }));
        z.querySelectorAll('[data-mail]').forEach((b) => b.addEventListener('click', () => ouvrirMail(+b.dataset.mail)));
        z.querySelectorAll('[data-dossier]').forEach((b) => b.addEventListener('click', () => {
          E.dossier = b.dataset.dossier; E.mailSel = null; E.piece = null; dessiner();
        }));
        z.querySelector('[data-mail-retour]')?.addEventListener('click', () => { E.mailSel = null; E.piece = null; dessiner(); });
        z.querySelectorAll('[data-pj]').forEach((b) => b.addEventListener('click', () => ouvrirPiece(b.dataset.pj)));
        z.querySelector('[data-pj-retour]')?.addEventListener('click', () => {
          const pj = E.piece; E.piece = null; dessinerVue();
          z.querySelector(`[data-pj="${pj}"]`)?.focus();
        });
        z.querySelector('[data-nouveau]')?.addEventListener('click', () => { E.redige = true; dessiner(); });
        z.querySelector('[data-retour-quai]')?.addEventListener('click', () => { E.retourQuai = false; aller('quai'); });
        z.querySelector('[data-annuler]')?.addEventListener('click', () => { E.redige = false; dessiner(); });
        z.querySelector('[data-envoyer-fou]')?.addEventListener('click', envoyerAuFournisseur);
        z.querySelector('[data-repondre]')?.addEventListener('click', () => {
          const fp = z.querySelector('#formPhr');
          if (fp) {
            fp.hidden = !fp.hidden;
            if (!fp.hidden) fp.querySelector('select')?.focus();
            return;
          }
          const f = z.querySelector('#formRep'); f.hidden = !f.hidden;
          if (f.hidden) return;
          const t = z.querySelector('#repT'); t.focus();
          // Réponse amorcée (mail avec `amorce`) : le curseur attend au bout de la première ligne.
          if (t.value) { const i = t.value.indexOf('\n'); const p = i < 0 ? t.value.length : i; t.setSelectionRange(p, p); }
        });
        z.querySelector('#formRep')?.addEventListener('submit', (e) => { e.preventDefault(); envoyerReponse(); });
        z.querySelector('#formPhr')?.addEventListener('submit', (e) => { e.preventDefault(); envoyerPhrases(); });
        // Un choix met à jour l'aperçu sur place (pas de redessin : le focus reste dans la liste).
        z.querySelectorAll('[data-phrase]').forEach((el) => el.addEventListener('change', () => {
          const sel = db.mails.find((x) => x.id === E.mailSel);
          if (!sel) return;
          const b = E.brouillon[sel.id] || (E.brouillon[sel.id] = {});
          if (el.value === '') delete b[el.dataset.phrase]; else b[el.dataset.phrase] = +el.value;
          const ap = z.querySelector('[data-phr-apercu]'); if (ap) ap.innerHTML = apercuPhrases(sel);
        }));
        z.querySelectorAll('[data-enreg-cmd]').forEach((b) => b.addEventListener('click', () => enregistrerCommande(+b.dataset.enregCmd)));
        z.querySelectorAll('[data-ouvrir-cmd]').forEach((b) => b.addEventListener('click', () => aller('commande', { no: b.dataset.ouvrirCmd })));
        z.querySelectorAll('[data-ouvrir-rec]').forEach((b) => b.addEventListener('click', () => aller('reception', { no: b.dataset.ouvrirRec })));
        REC.brancher(z);
        COM.brancher(z);
        BLO.brancher(z);
        CAT.brancher(z);
        STK.brancher(z);
        TIERS.brancher(z);
        CON.brancher(z);
        if (E.vue === 'plan' && VPLAN) VPLAN.brancher(z, apiTransport('plan'));
        if (E.vue === 'tournee' && VTOUR) VTOUR.brancher(z, apiTransport('tournee'));
        if (E.vue === 'fichiers' && VTAB) VTAB.brancher(z, apiTableur());
        if (E.vue === 'extractions' && VTAB && VTAB.navExtractions) VTAB.brancherExtractions(z, apiTableur());
        if (E.vue === 'inventaire' && VINV && !VINV.attente(db)) VINV.brancher(z, etatInventaire(), apiInventaire());
        if (E.vue === 'quai' && VQUAI) VQUAI.brancher(z, etatQuai(), apiQuai());
        if (E.vue === 'planning' && VPL) VPL.brancher(z, etatPlanning(), apiPlanning());
        if (E.vue === 'entrepot' && VENT) VENT.brancher(z, etatEntrepot(), apiEntrepot());
        // La calculette du site, sur l'écran du plan seulement (entraînement, évaluation : voir entrepot.js).
        // Posée sur la page, hors de la zone de la séance : elle prendrait l'accent de la charte (le rouge de
        // Smoby dirait « faux », un vert « juste »). Son bouton est donc à l'encre, quelle que soit l'entreprise.
        if (VENT) {
          if (E.vue === 'entrepot' && VENT.calculette && VENT.calculette(apiEntrepot())) {
            const b = monterCalculette().querySelector('.calc-fab');
            if (b) { b.style.background = 'var(--encre)'; b.style.color = 'var(--panneau)'; }
          } else demonterCalculette();
        }
        const VFv = ficheDeVue(E.vue);
        if (VFv) VFv.brancher(z, etatFiche(VFv), uiFiche(VFv), apiFiche());
        const VAv = animDeVue(E.vue);
        if (VAv) VAv.brancher(z, etatAnim(VAv), apiAnim());
      }

      // Un message déclenché dont la condition est déjà vraie à l'ouverture (travail fait sur un
      // autre poste, coupure entre la sauvegarde et l'envoi) arrive maintenant. Ici et pas plus
      // haut : la tournée de la séance doit exister pour passer de phase.
      if (!rendue() && (declencher() | arriverQuestions())) ctx.jeu.sauver();
      remonterEtapes();
      dessiner();
      // Évaluation : la copie est-elle déjà rendue ? Ce qui fait foi est le résultat enregistré
      // (que l'enseignant peut ramasser ou rouvrir), pas la base de l'élève.
      if (COPIE && !estProf) {
        Promise.resolve(ctx.lireScore ? ctx.lireScore() : null).catch(() => null).then((t) => {
          if (t && t.rendu) { copie.rendue = t.rendu; copie.ramassee = !!t.ramasse; }
          copie.charge = true;
          if (hote.isConnected) dessiner();
        });
      }
    },
  };
}
