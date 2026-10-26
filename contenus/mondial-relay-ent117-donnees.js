// ENT-11.7 — Mondial Relay, évaluation « la lampe d'Inès » : les DONNÉES PURES (brief
// `docs/briefs/ENT-11.7-mondial-relay-evaluation-client.md` §4 à §6 bis ; choix de Tristan du 26/10/2026, `docs/briefs/mondial-relay/A-TRANCHER.md`).
// Aucun effet de bord, aucune interface : importé par le contenu (`contenus/mondial-relay-ent117.js`), les questions
// (`contenus/questions/ENT-11.7.js`), le corrigé (`contenus/corriges/ENT-11.7.js`, chargé aussi sous Node) et les tests.
// Univers commun : `contenus/mondial-relay.js` (utilisé, jamais modifié).
//
// VÉRIFIÉ (conditions générales de vente Mondial Relay, offre Start, 07/01/2026 ; voir `CGV` de l'univers) : pour un dommage visible, la
// réclamation se fait dans les 72 heures suivant la livraison ; au Point Relais, le destinataire doit refuser le colis abîmé pour que la
// réclamation soit recevable ; l'indemnité est limitée à 25 € par colis, frais d'envoi non remboursés ; une assurance en option permet d'être
// indemnisé au-delà, jusqu'à 500 € selon le niveau choisi.
// CONSTRUIT (dit à l'élève dans les documents) : Inès, sa lampe, les prix, les dates, le suivi du colis, la valeur déclarée à l'assurance
// du cas (b). Les montants réels des niveaux d'assurance N1 à N5 ne sont PAS vérifiés : aucun montant de niveau n'est écrit nulle part ; la
// valeur déclarée du cas (b) est une valeur construite, inférieure à 500 €. Le délai de versement d'une indemnité n'est pas vérifié non plus :
// il n'est écrit nulle part.
//
// CE QUI EST TIRÉ (par élève, une fois, à sa première ouverture, voir `core/tirage.js`) : UN cas parmi quatre, à parts égales, avec le même
// nombre de décisions à prendre pour tous (la même chaîne : écouter, appliquer la règle, ouvrir le dossier, répondre) ;
//   a. colis REFUSÉ au Point Relais, réclamation dans les 72 h, sans assurance      → recevable, 25 € ;
//   b. colis REFUSÉ, réclamation dans les 72 h, AVEC assurance en option             → recevable, la valeur déclarée à l'assurance ;
//   c. colis RETIRÉ par le destinataire (qui l'ouvre ensuite chez lui), puis réclamation → non recevable, 0 € ;
//   d. colis refusé, mais réclamation au 5e jour (ou au 6e)                          → hors délai, 0 €.
// et des valeurs : le prix de la lampe, le jour de livraison au Point Relais (du 17 novembre au 11 décembre 2026, du mardi au samedi, aucun
// jour férié) et le nombre de jours écoulés au moment de l'appel (0, 1 ou 2 jours dans les cas a, b, c ; 5 ou 6 dans le cas d).

import { declarerTirage, graineDeBase } from '../core/tirage.js';
import { FIL_ROUGE, CGV, SOURCE_CGV } from './mondial-relay.js';

export const ID = 'mondial-relay-evaluation-client';
export const ID_VOLET = 'mr-ent117';
export const DIALOGUE_ID = 'mr-appel-ines-117';
export const PHRASES_ID = 'reponse-ines-117';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { regle: 'regle-reclamation-117', dossier: 'dossier-reclamation-117' };
// L'adresse d'Inès (cliente, construite : domaine réservé aux exemples).
export const MAIL_INES = 'ines.garnier@mail.example';

// ─────────────────────────────────────────────────────────────── les dates (sans dépendre du fuseau ni de la langue du navigateur)
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const utc = (iso) => { const [a, m, j] = iso.split('-').map(Number); return Date.UTC(a, m - 1, j); };
export const plusJours = (iso, n) => new Date(utc(iso) + n * 86400000).toISOString().slice(0, 10);
export const jourDeSemaine = (iso) => new Date(utc(iso)).getUTCDay();
// « 17 novembre 2026 », « 1er décembre 2026 » (aucun jour de la semaine écrit).
export const libDate = (iso) => {
  const d = new Date(utc(iso));
  const j = d.getUTCDate();
  return `${j === 1 ? '1er' : j} ${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
// Les jours de livraison possibles : du mardi au samedi (livraison des Points Relais), du 17 novembre au 11 décembre 2026 : aucun jour férié
// jusqu'à six jours plus tard, donc aucun doute sur « 72 heures, jours fériés exclus ».
export const JOURS_POSSIBLES = (() => {
  const L = [];
  for (let d = '2026-11-17'; d <= '2026-12-11'; d = plusJours(d, 1)) { const s = jourDeSemaine(d); if (s >= 2 && s <= 6) L.push(d); }
  return L;
})();

// ─────────────────────────────────────────────────────────────── les quatre cas
export const CAS = {
  a: { refuse: true, assure: false, tard: false, conclusion: 'recevable' },
  b: { refuse: true, assure: true, tard: false, conclusion: 'recevable' },
  c: { refuse: false, assure: false, tard: false, conclusion: 'retire' },
  d: { refuse: true, assure: false, tard: true, conclusion: 'delai' },
};
export const IDS_CAS = Object.keys(CAS);
export const INDEMNITE_DE_BASE = 25;     // CGV art. 12 : 25 € par colis, sans assurance
export const PRIX = [45, 60, 65, 75, 80, 90, 110, 120];   // le prix de la lampe, tiré (construit, toujours bien en dessous de 500 €)

// ─────────────────────────────────────────────────────────────── le tirage
export const BANQUE_CAS = IDS_CAS.map((c) => ({ id: `cas-${c}`, cas: c, difficulte: 'moyen' }));
export const valeurs117 = (h) => ({ prix: h.choisir(PRIX), jour: h.choisir(JOURS_POSSIBLES), retard: h.entier(0, 2), tard: h.entier(5, 6) });
// L'équité : un seul cas, des valeurs dans les bornes (le prix très au-dessus de 25 €, très en dessous de 500 € ; le retard du cas d hors délai
// pour de bon, celui des autres dans les 72 heures).
export function ecartsJeu(jeu) {
  const E = [];
  const cas = (jeu.pieces && jeu.pieces.cas) || [];
  const V = jeu.valeurs || {};
  if (cas.length !== 1) E.push(`il faut exactement un cas tiré (${cas.length})`);
  if (!(V.prix > INDEMNITE_DE_BASE && V.prix < 500)) E.push(`prix de la lampe hors bornes : ${V.prix}`);
  if (!JOURS_POSSIBLES.includes(V.jour)) E.push(`jour de livraison inconnu : ${V.jour}`);
  if (!(V.retard >= 0 && V.retard <= 2)) E.push(`retard hors des 72 heures : ${V.retard}`);
  if (!(V.tard >= 5 && V.tard <= 6)) E.push(`retard du cas d trop court : ${V.tard}`);
  return E;
}
export const TIRAGE = declarerTirage({
  banques: { cas: { pieces: BANQUE_CAS, melange: { moyen: 1 }, ordre: 'fixe' } },
  valeurs: valeurs117,
  verifier: ecartsJeu,
});
TIRAGE.lier(ID);

// Sans tirage (base vide au chargement, enseignant) : un jeu témoin fixe.
export const DEFAUT = { cas: 'a', prix: 60, jour: '2026-11-17', retard: 1, tard: 5 };

// La situation d'un élève, CALCULÉE (jamais recopiée) : le cas, les dates, ce que la règle donne.
export function situationDe(db) {
  const rec = db ? TIRAGE.tirage(db) : null;
  const V = rec ? TIRAGE.valeursTirees(db) : {};
  const piece = rec ? TIRAGE.piecesTirees(db, 'cas')[0] : null;
  const cas = piece ? piece.cas : DEFAUT.cas;
  const prix = V.prix != null ? V.prix : DEFAUT.prix;
  const jour = V.jour || DEFAUT.jour;
  const C = CAS[cas];
  const jours = C.tard ? (V.tard != null ? V.tard : DEFAUT.tard) : (V.retard != null ? V.retard : DEFAUT.retard);
  const valeur = C.assure ? prix : null;                       // la valeur déclarée à l'assurance (cas b : celle de la lampe)
  const montant = C.conclusion !== 'recevable' ? 0 : (C.assure ? valeur : INDEMNITE_DE_BASE);
  return {
    cas, ...C, prix, jour, jours, aujourdhui: plusJours(jour, jours), valeur, montant,
    decision: C.conclusion === 'recevable' ? 'acceptee' : 'refusee',
  };
}
export const situationDeBase = (db) => situationDe(db || {});
export const graineEleve = (db) => graineDeBase(db || {});

// ─────────────────────────────────────────────────────────────── l'appel d'Inès (évaluation : aucune réaction, la première réponse compte)
// Quatre répliques ; chaque réplique a UNE bonne réponse (`juste`, exigée par la vue) ; les autres sont maladroites par le CONTENU, ou par le TON
// (clés listées dans `TON_MAUVAIS` : familier ou agressif). Les clés sont les mêmes pour les quatre cas ; seuls les textes de la reformulation
// changent (calculés une fois à l'arrivée de la réplique, `selon`).
export const TON_MAUVAIS = [['accueil', 'familier'], ['accueil', 'agressif'], ['numero', 'familier'], ['promesse', 'agace']];
export const PROMESSES = [['numero', 'promet'], ['promesse', 'promet']];

const faitRefus = (S) => (S.refuse ? 'l’acheteur a refusé le colis au Point Relais' : 'l’acheteur a retiré le colis, puis l’a ouvert chez lui');
const faitContraire = (S) => (S.refuse ? 'l’acheteur a retiré le colis, puis l’a ouvert chez lui' : 'l’acheteur a refusé le colis au Point Relais');

// Les deux reformulations qui parlent du fait (refus ou retrait) : la juste dit le fait du cas, l'autre dit le contraire.
const libsReformule = (S) => ({
  reformule: `Si je comprends bien, votre lampe est arrivée cassée, ${faitRefus(S)}${S.assure ? ' et vous aviez pris l’assurance' : ''}, et vous demandez une indemnisation.`,
  'faux-fait': `Si je comprends bien, votre lampe est arrivée cassée, ${faitContraire(S)}${S.assure ? ' et vous aviez pris l’assurance' : ''}, et vous demandez une indemnisation.`,
});

export const REPLIQUES = [
  { id: 'accueil', dit: 'Allô ? Bonjour… C’est bien le service client de Mondial Relay ? J’ai un gros souci avec un colis.',
    choix: [
      { v: 'presente', juste: true, lib: 'Bonjour, {prenom}, service client Mondial Relay. Je vous écoute.' },
      { v: 'familier', lib: 'Salut, c’est pour quoi ?' },
      { v: 'agressif', lib: 'Encore un colis ? Dépêchez-vous de m’expliquer, il y a du monde en attente.' },
    ] },
  { id: 'numero',
    dit: (db) => {
      const S = situationDe(db);
      return `J’ai envoyé une lampe en céramique à un acheteur de Bar-sur-Seine, je l’ai vendue ${S.prix} € ! Il dit qu’elle est cassée. `
        + `${S.refuse ? 'Il a refusé le colis au Point Relais en voyant le carton enfoncé.' : 'Il a pris le colis et l’a ouvert chez lui : la lampe est en morceaux.'}`
        + `${S.assure ? ' J’avais pourtant pris l’assurance en option !' : ''} Je suis furieuse.`;
    },
    choix: [
      { v: 'numero', juste: true, lib: 'Je comprends que ce soit agaçant. Pouvez-vous me donner votre numéro de colis, que je retrouve son suivi ?' },
      { v: 'promet', lib: 'Pas de souci, votre lampe sera remboursée en entier.' },
      { v: 'raconter', lib: 'Racontez-moi tout depuis le début, on verra le numéro de colis plus tard.' },
      { v: 'familier', lib: 'File-moi ton numéro de colis, je regarde.' },
    ] },
  { id: 'reformule',
    dit: `Le numéro, c’est le ${FIL_ROUGE.colis}. Je veux juste qu’on règle ça : je ne veux pas rester avec ma lampe cassée sur les bras.`,
    selon: (db) => ({ libs: libsReformule(situationDe(db)) }),
    choix: [
      { v: 'reformule', juste: true, lib: libsReformule(situationDe({})).reformule },
      { v: 'faux-fait', lib: libsReformule(situationDe({}))['faux-fait'] },
      { v: 'faux-perdu', lib: 'Si je comprends bien, votre colis est perdu et vous voulez que nous le retrouvions.' },
      { v: 'faux-renvoi', lib: 'Si je comprends bien, vous voulez que nous renvoyions la lampe à l’acheteur.' },
    ] },
  { id: 'promesse',
    dit: (db) => `Bon… Alors, je serai remboursée de mes ${situationDe(db).prix} € ?`,
    selon: (db) => ({ libs: { promet: `Oui, bien sûr, vous serez remboursée de ${situationDe(db).prix} €.` } }),
    choix: [
      { v: 'verifier', juste: true, lib: 'Je ne peux pas vous le confirmer tout de suite : je vérifie les dates et nos conditions de vente, puis je vous réponds par écrit.' },
      { v: 'promet', lib: `Oui, bien sûr, vous serez remboursée de ${DEFAUT.prix} €.` },
      { v: 'refuse', lib: 'Non, ce n’est pas possible, nos conditions de vente ne le permettent pas.' },
      { v: 'agace', lib: 'Écoutez, ce n’est pas moi qui ai cassé votre lampe !' },
    ] },
];
export const FIN_APPEL = 'D’accord. J’attends votre message, alors. Au revoir.';
// Les jalons de l'appel lisent la PREMIÈRE réponse dite à chaque réplique (`premiereReponse`).
export const NUMERO_DEMANDE = (appel, rep) => rep(appel, 'numero') === 'numero';
export const SITUATION_REFORMULEE = (appel, rep) => rep(appel, 'reformule') === 'reformule';
export const SANS_PROMESSE = (appel, rep) => rep(appel, 'promesse') === 'verifier' && !PROMESSES.some(([r, v]) => rep(appel, r) === v);
export const TON_DE_L_APPEL = (appel, rep) => !TON_MAUVAIS.some(([r, v]) => rep(appel, r) === v);

// ─────────────────────────────────────────────────────────────── la fiche « La règle »
// Quatre conclusions possibles (les mêmes pour tous ; la bonne dépend du cas), un montant à écrire.
export const CONCLUSIONS = [
  { v: 'recevable', lib: 'Recevable : le colis a été refusé au Point Relais, dans les 72 heures' },
  { v: 'retire', lib: 'Non recevable : le colis a été retiré, il n’a pas été refusé' },
  { v: 'delai', lib: 'Non recevable : la réclamation arrive plus de 72 heures après la livraison' },
  { v: 'toujours', lib: 'Recevable : un colis abîmé donne toujours droit à une indemnité' },
];
export const DOMMAGES = [
  { v: 'abime', lib: 'Colis abîmé : la lampe est cassée' },
  { v: 'perdu', lib: 'Colis perdu' },
  { v: 'retard', lib: 'Colis livré en retard' },
  { v: 'manquant', lib: 'Contenu manquant' },
];
export const SUITES = [
  { v: 'acceptee', lib: 'Réclamation acceptée' },
  { v: 'refusee', lib: 'Réclamation refusée' },
];
// Le numéro de colis écrit dans le dossier : seuls les chiffres comptent (« MR 4417 2184 », « MR44172184 », « 4417 2184 »).
export const chiffres = (s) => String(s == null ? '' : s).replace(/\D/g, '');
export const NUMERO_COLIS = FIL_ROUGE.colis;
export const COLIS_JUSTE = (s) => chiffres(s) === chiffres(NUMERO_COLIS);

// ─────────────────────────────────────────────────────────────── le courriel de réponse (phrases à choisir, au vous : c'est une cliente)
// Quatre décisions possibles, quatre montants possibles, trois rappels de la règle : les mêmes pour tous les cas ; seul le rang de la bonne
// dépend du cas. Le rang est celui de l'ordre DÉCLARÉ (l'ordre affiché est tiré par élève et rangé avec le message).
export const DECISIONS = [
  { cle: 'recevable', phrase: 'Votre réclamation est recevable : le colis abîmé a été refusé au Point Relais, dans les 72 heures.' },
  { cle: 'retire', phrase: 'Votre réclamation n’est pas recevable : le colis a été retiré, et non refusé, au Point Relais.' },
  { cle: 'delai', phrase: 'Votre réclamation n’est pas recevable : elle nous est parvenue plus de 72 heures après la livraison.' },
  { cle: 'toujours', phrase: 'Nous vous indemnisons dans tous les cas : un colis abîmé donne toujours droit à une indemnité.' },
];
export const rangDecision = (S) => DECISIONS.findIndex((d) => d.cle === S.conclusion);
export const MONTANTS = (S) => [
  { cle: 'base', phrase: `Nous pouvons vous indemniser de ${INDEMNITE_DE_BASE} € au plus : les frais d’envoi ne sont pas remboursés.` },
  { cle: 'assure', phrase: `Nous vous indemnisons à hauteur de ${S.prix} €, la valeur déclarée à l’assurance de votre colis.` },
  { cle: 'tout', phrase: 'Nous vous remboursons votre lampe et vos frais d’envoi en entier.' },
  { cle: 'aucun', phrase: 'Aucune indemnité ne peut être versée pour ce colis.' },
];
export const rangMontant = (S) => MONTANTS(S).findIndex((m) => m.cle === (S.montant === 0 ? 'aucun' : S.assure ? 'assure' : 'base'));
export const RAPPELS = [
  'Pour un colis abîmé, la réclamation doit être faite dans les 72 heures suivant la livraison, et le colis doit être refusé au Point Relais.',
  'Pour un colis abîmé, la réclamation peut être faite dans le mois, que le colis ait été refusé ou retiré.',
  'Pour un colis abîmé, il suffit de nous écrire quand vous le souhaitez.',
];
export const phrasesReponse = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: ['Bonjour Madame Garnier,', 'Salut Inès,', 'Bonjour,'], juste: 0 },
  { id: 'decision', choix: DECISIONS.map((d) => d.phrase), juste: (db) => rangDecision(situationDe(db)) },
  { id: 'montant', choix: (db) => MONTANTS(situationDe(db)).map((m) => m.phrase), juste: (db) => rangMontant(situationDe(db)) },
  { id: 'regle', choix: RAPPELS, juste: 0 },
  { id: 'fin', choix: [`Cordialement, ${prenom}, service client Mondial Relay`, 'Cordialement', 'À plus !'], juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── lire la base (sans interface)
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Une fiche déjà envoyée une fois : la suite ne se referme pas.
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
// Un nombre saisi (« 25 », « 25,00 », « 25 € »…), comme `lireNombre` de la fiche sans importer ce module (il tire l'interface).
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

// ─────────────────────────────────────────────────────────────── les extraits des conditions de vente (documents joints)
export { CGV, SOURCE_CGV };
