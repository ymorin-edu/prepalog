// ENT-12.2 — IKEA, « la demande de Mme Benali » : les DONNÉES PURES (brief `docs/briefs/ENT-12.2-ikea-demande-de-mme-benali.md` §4 à §6 bis ; choix de
// Tristan du 26/10/2026, `docs/briefs/ikea/A-TRANCHER.md`). Aucun effet de bord, aucune interface : importé par le contenu (`contenus/ikea-ent122.js`), les
// questions (`contenus/questions/ENT-12.2.js`), le corrigé (`contenus/corriges/ENT-12.2.js`, chargé aussi sous Node) et les tests. Univers : `contenus/ikea.js`.
//
// VÉRIFIÉ (page « Livraison » d'IKEA France relevée le 26/10/2026 ; conditions de vente version du 10/08/2026) : voir l'univers. En particulier :
// la reprise de l'ancien meuble (art. 14.2.2) vise un meuble de MÊME NATURE que le produit acheté, de plus de deux mètres (largeur + longueur + hauteur), démonté,
// et se RÉSERVE À LA COMMANDE ; l'absence se signale au plus tard 72 heures avant (art. 4.1.2.3) ; « devant chez vous » dépose au pied de l'immeuble (art. 4.1.2.1).
// CONSTRUIT (dit à l'élève) : Mme Benali, sa commande, les poids et les prix des articles, les créneaux, le fait que le service livraison du centre rappelle la cliente.
// La règle « tarif dans la pièce » est appliquée au montant des meubles (hors lampe, qui part seule en Point Relais) : simplification de l'exercice, dite à l'élève.
//
// CE QUI EST TIRÉ (par élève, une fois, à sa première ouverture) : le poids des trois colis de l'armoire (35 à 45 kg), le prix de l'armoire et du canapé, et le fait
// que Mme Benali soit membre IKEA Family ou non. La pièce fixe : la cliente, l'adresse, l'étage, le canapé repris, la chaise.

import { declarerTirage } from '../core/tirage.js';
import { prixMode, lireNombre } from './ikea.js';

export const ID = 'ikea-demande-cliente';
export const ID_VOLET = 'ik-ent122';
export const DIALOGUE_ID = 'ik-appel-benali';
export const FICHE_ID = 'mode-livraison-122';
export const PHRASES_ID = 'reponse-benali-122';
export const MAIL_BENALI = 'leila.benali@mail.example';
export { lireNombre };

export const JOUR_APPEL = { iso: '2027-03-09', lib: 'mardi 9 mars 2027' };
export const CRENEAUX = [
  { v: 'mardi-matin', lib: 'mardi 16 mars 2027, de 8 h à 12 h' },
  { v: 'mardi-aprem', lib: 'mardi 16 mars 2027, de 14 h à 18 h' },
  { v: 'jeudi-aprem', lib: 'jeudi 18 mars 2027, de 14 h à 18 h' },
];
export const CRENEAU_JUSTE = 'mardi-matin';

// ─────────────────────────────────────────────────────────────── le tirage
export const PRIX_ARMOIRE = [149, 199, 249, 299];
export const PRIX_CANAPE = [249, 349, 449, 549];
export const valeurs122 = (h) => ({
  kg: [h.entier(35, 45), h.entier(35, 45), h.entier(35, 45)],
  armoire: h.choisir(PRIX_ARMOIRE), canape: h.choisir(PRIX_CANAPE),
  membre: h.reel() < 0.5,
});
export function ecartsJeu(jeu) {
  const E = [], V = jeu.valeurs || {};
  if (!(V.kg && V.kg.length === 3 && V.kg.every((k) => k >= 35 && k <= 45))) E.push('poids des colis hors bornes');
  const m = (V.armoire || 0) + (V.canape || 0);
  if (!(m > 300 && m <= 1000)) E.push(`montant des meubles hors bornes : ${m}`);
  return E;
}
export const TIRAGE = declarerTirage({
  banques: { commande: { pieces: [{ id: 'commande-benali' }], fixes: ['commande-benali'], melange: {}, ordre: 'fixe' } },   // une pièce fixe : la commande de Mme Benali
  valeurs: valeurs122, verifier: ecartsJeu });
TIRAGE.lier(ID);

export const DEFAUT = { kg: [40, 38, 34], armoire: 249, canape: 349, membre: false };
export const POIDS_CANAPE = [42, 31];   // fixes : le canapé en deux colis
export const POIDS_LAMPE = 1.8;
export const PRIX_LAMPE = 29;

// La situation d'un élève, CALCULÉE (jamais recopiée).
export function situationDe(db) {
  const rec = db ? TIRAGE.tirage(db) : null;
  const V = rec ? TIRAGE.valeursTirees(db) : {};
  const kg = V.kg || DEFAUT.kg, armoire = V.armoire != null ? V.armoire : DEFAUT.armoire, canape = V.canape != null ? V.canape : DEFAUT.canape;
  const membre = V.membre != null ? !!V.membre : DEFAUT.membre;
  const meubles = armoire + canape;
  const relais = prixMode('relais', PRIX_LAMPE, membre), piece = prixMode('piece', meubles, membre);
  return {
    kg, armoire, canape, membre, meubles, relais, piece, total: relais + piece,
    kgArmoire: kg.reduce((a, b) => a + b, 0), kgCanape: POIDS_CANAPE.reduce((a, b) => a + b, 0),
  };
}
// L'économie d'un membre sur CETTE livraison (indépendante du statut de l'élève tiré) : non-membre − membre.
export const economieMembre = (db) => {
  const S = situationDe(db);
  return (prixMode('relais', PRIX_LAMPE, false) + prixMode('piece', S.meubles, false)) - (prixMode('relais', PRIX_LAMPE, true) + prixMode('piece', S.meubles, true));
};

// ─────────────────────────────────────────────────────────────── l'appel de Mme Benali (guidage : une réplique maladroite fait réagir)
// Chaque réplique a UNE bonne réponse. Les clés sont lues par les jalons (première réponse dite).
export const REPLIQUES = [
  { id: 'accueil', dit: 'Allô ? Oui, bonjour, c’est Leïla Benali.',
    choix: [
      { v: 'presente', juste: true, lib: 'Bonjour Madame Benali, {prenom}, service livraison d’IKEA Gennevilliers. Je vous appelle au sujet de votre commande : c’est bien vous ?' },
      { v: 'familier', lib: 'Salut, c’est IKEA pour votre livraison.', reaction: 'Euh… bonjour. Vous êtes qui, exactement ?' },
      { v: 'sec', lib: 'Ouais, c’est pour votre commande.', reaction: '… Oui ? Vous pouvez vous présenter, s’il vous plaît ?', accepte: true },
    ] },
  { id: 'acces', dit: 'Oui, c’est bien moi. Vous m’appelez pour ma livraison ? Qu’est-ce que vous voulez savoir ?',
    choix: [
      { v: 'acces', juste: true, lib: 'Pour préparer la livraison : à quel étage habitez-vous, y a-t-il un ascenseur, et quelle est la largeur de l’escalier ?' },
      { v: 'etage', lib: 'À quel étage habitez-vous ?', reaction: 'Au 4e. Mais vous ne me demandez pas s’il y a un ascenseur, ni si l’escalier est large ?' },
      { v: 'date', lib: 'Quand voulez-vous être livrée ?', reaction: 'On y viendra, mais d’abord : vous ne voulez pas savoir comment on accède chez moi ?' },
    ] },
  { id: 'creneau', dit: 'Je suis au 4e étage, sans ascenseur, et l’escalier est étroit, un mètre à peu près. Pour la date, plutôt le matin : l’après-midi, je travaille.',
    choix: [
      { v: 'matin', juste: true, lib: 'Je vous propose le mardi 16 mars, de 8 h à 12 h. Cela vous convient ?' },
      { v: 'aprem', lib: 'Je vous propose le jeudi 18 mars, de 14 h à 18 h.', reaction: 'L’après-midi ? Je viens de vous dire que je travaille…' },
      { v: 'plustard', lib: 'Le livreur vous appellera le jour même pour fixer l’heure.', reaction: 'Ah non, j’ai besoin de savoir avant : je dois poser une matinée.' },
    ] },
  { id: 'reprise', dit: 'Parfait pour mardi matin. Autre chose : j’ai coché la reprise de mon vieux canapé sur le site. Et j’ai aussi une vieille chaise dont je voudrais me débarrasser. Vous reprenez les deux ?',
    choix: [
      { v: 'canape', juste: true, lib: 'Votre ancien canapé sera repris à la livraison, à condition qu’il soit démonté. La chaise, non : la reprise concerne un meuble de même nature que celui que vous achetez.' },
      { v: 'tout', lib: 'Oui, bien sûr, nous reprenons le canapé et la chaise.', reaction: 'Super, merci ! Je mets les deux devant la porte.' },
      { v: 'rien', lib: 'Non, nous ne reprenons aucun ancien meuble.', reaction: 'Mais j’ai coché la reprise sur le site…' },
    ] },
  { id: 'devant', dit: 'Dernière chose : sur le site, j’ai choisi « devant chez vous » pour mes meubles. Mais l’armoire pèse plus de cent kilos… Vous me la montez jusqu’au 4e, hein ?',
    choix: [
      { v: 'piece', juste: true, lib: 'Avec « devant chez vous », le livreur dépose au pied de l’immeuble. Pour qu’il monte jusqu’à votre pièce, il faut le mode « dans la pièce de votre choix » : je vous le propose.' },
      { v: 'monte', lib: 'Oui, bien sûr, le livreur vous la montera.', reaction: 'Ah, très bien, je compte sur vous alors.' },
      { v: 'debrouille', lib: 'Non, il faudra vous débrouiller avec vos voisins.', reaction: 'Pardon ? Vous plaisantez ?' },
    ] },
  { id: 'relais', dit: 'Et la petite lampe, je préfère aller la chercher moi-même : il y a un Point Relais en bas de chez moi.',
    choix: [
      { v: 'accord', juste: true, lib: 'Très bien : la lampe partira en Point Relais, elle est légère, et vos meubles seront livrés chez vous.' },
      { v: 'tout-chez', lib: 'Non, tout sera livré chez vous, c’est plus simple.', reaction: 'Mais je viens de vous dire que je préfère la retirer en bas…' },
      { v: 'rien', lib: 'La lampe sera dans le même camion que l’armoire.', reaction: 'Elle monte avec les meubles ? Je pensais plutôt la récupérer au Point Relais…' },
    ] },
];
export const FIN_APPEL = 'Merci beaucoup. J’attends votre confirmation par écrit. Bonne journée !';
export const ACCES_DEMANDE = (appel, rep) => rep(appel, 'acces') === 'acces';
export const CRENEAU_ET_REPRISE = (appel, rep) => rep(appel, 'creneau') === 'matin' && rep(appel, 'reprise') === 'canape';
export const PROMESSES = [['reprise', 'tout'], ['devant', 'monte']];
export const SANS_PROMESSE_FAUSSE = (appel, rep) => !PROMESSES.some(([r, v]) => rep(appel, r) === v);
export const TON_DE_L_APPEL = (appel, rep) => rep(appel, 'accueil') === 'presente';

// ─────────────────────────────────────────────────────────────── la fiche « mode de livraison »
export const RAISONS = [
  { v: 'leger', lib: 'Article léger (moins de 19 kg), que la cliente veut retirer près de chez elle' },
  { v: 'monter', lib: 'La cliente ne peut pas monter l’article seule jusqu’au 4e sans ascenseur' },
  { v: 'lourd', lib: 'L’article pèse plus de 19 kg : il faut un colis à domicile' },
  { v: 'prix', lib: 'C’est le mode le moins cher' },
];
export const ARTICLES = [
  { id: 'lampe', lib: 'La lampe', mode: 'relais', raison: 'leger' },
  { id: 'armoire', lib: 'L’armoire (3 colis)', mode: 'piece', raison: 'monter' },
  { id: 'canape', lib: 'Le canapé (2 colis)', mode: 'piece', raison: 'monter' },
];
export const CHAMP = (art, quoi) => `${quoi}_${art}`;     // mode_lampe, raison_armoire…

// ─────────────────────────────────────────────────────────────── le message par phrases (au vous : c'est une cliente)
export const DATES = CRENEAUX.map((c) => `Votre livraison aura lieu le ${c.lib}.`);
export const MODES_PHRASES = [
  'Vos meubles seront livrés dans la pièce de votre choix, et la lampe vous attendra au Point Relais.',
  'Tout sera déposé devant chez vous, au pied de l’immeuble.',
  'Tout sera livré en colis à domicile.',
];
export const REPRISES = [
  'Votre ancien canapé sera repris à la livraison, s’il est démonté. La chaise ne peut pas être reprise.',
  'Votre ancien canapé et votre chaise seront repris à la livraison.',
  'Nous ne pouvons reprendre aucun ancien meuble.',
];
export const RAPPELS = [
  'Si vous ne pouvez pas être présente, prévenez-nous au plus tard 72 heures avant la livraison.',
  'Si vous ne pouvez pas être présente, prévenez-nous la veille de la livraison.',
  'Si vous ne pouvez pas être présente, ne vous inquiétez pas : le livreur repassera.',
];
export const prixPhrases = (S) => {
  const l = [S.total, S.total + 20, Math.max(S.total - 20, 7), S.relais + prixMode('devant', S.meubles, S.membre)];
  return Array.from(new Set(l));
};
export const phrasesReponse = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: ['Bonjour Madame Benali,', 'Salut Leïla,', 'Coucou,'], juste: 0 },
  { id: 'creneau', choix: DATES, juste: CRENEAUX.findIndex((c) => c.v === CRENEAU_JUSTE) },
  { id: 'mode', choix: MODES_PHRASES, juste: 0 },
  { id: 'prix', choix: (db) => prixPhrases(situationDe(db)).map((p) => `Le prix de la livraison sera de ${p} €.`), juste: (db) => prixPhrases(situationDe(db)).indexOf(situationDe(db).total) },
  { id: 'reprise', choix: REPRISES, juste: 0 },
  { id: 'rappel', choix: RAPPELS, juste: 0 },
  { id: 'fin', choix: [`Cordialement, ${prenom}, service livraison IKEA Gennevilliers`, 'Bisous', 'À plus !'], juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── lire la base (sans interface)
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
