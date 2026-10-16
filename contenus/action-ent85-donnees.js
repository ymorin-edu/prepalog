// ENT-8.5 — Action, évaluation « se situer dans un nouveau site » : les DONNÉES PURES de la séance (site de l’élève, banques, tirage, chaîne,
// lectures de la base). Aucun effet de bord, aucune interface : importé par le contenu (`contenus/action-ent85.js`), les questions
// (`contenus/questions/ENT-8.5.js`) et le corrigé (`contenus/corriges/ENT-8.5.js`). Brief `docs/briefs/ENT-8.5-action-evaluation-se-situer.md`
// §5, §6, §6.1, §6 bis ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §7.
//
// Les deux sites (Onnaing / GXO / La Sentinelle, Belleville-en-Beaujolais / Kuehne+Nagel / Villefranche-sur-Saône) et le tirage du site
// (fonction pure de l’identifiant de l’élève, même site en ENT-8.6) : `contenus/action-eval-sites.js`, module partagé.
// CONSTRUIT (textes de Cowork, brief §6 bis, écrits tels quels, à relire à l’écran) : les rôles des acteurs, la chaîne du site, les
// situations de « Ce que je change » (reprises d’ENT-8.3 et d’ENT-8.1, réécrites pour le magasin de l’élève). Les trois situations reprises
// d’ENT-8.1 (`s-retard`, `s-camion`, `s-scan`) ont reçu un second piège (leur « Rien : … » d’ENT-8.1) et « Rien ne change au magasin » : même
// forme que celles d’ENT-8.3 (décision du constructeur, compte rendu du brief).

import { declarerTirage, hasard } from '../core/tirage.js';
import { SITES, siteDeBase, remplir } from './action-eval-sites.js';

export const ID = 'action-evaluation-se-situer';
export const VUE = 'action-carte-85';
export const ID_VOLET = 'action-ent85';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { qui: 'qui', chaine: 'chaine', change: 'change' };

// Le site de l’élève (l’objet de `SITES`), lu dans sa base ; base vide : Onnaing.
export const siteEleve = (db) => siteDeBase(db, ID);
export { SITES, remplir };

// ─────────────────────────────────────────────────────────────── « Qui est qui ? » (brief §6 bis, textes de Cowork)
// Les 8 rôles, offerts à CHAQUE ligne, ORDRE FIXE : les 7 rôles justes et le piège « te guide pendant ton stage », mêlés. Les clés ne
// nomment pas l’acteur.
export const ROLES = [
  { v: 'vend', lib: 'vend les produits aux clients' },
  { v: 'guide', lib: 'te guide pendant ton stage' },
  { v: 'possede', lib: 'possède les produits et choisit qui les stocke' },
  { v: 'forme', lib: 't’envoie en stage et suit ta formation' },
  { v: 'fabrique', lib: 'fabrique les produits qu’Action achète' },
  { v: 'emmene', lib: 'emmène les palettes de l’entrepôt au magasin' },
  { v: 'stocke', lib: 'stocke et prépare les commandes pour Action' },
  { v: 'achete', lib: 'achète les produits au magasin' },
];
// La banque (ids JAMAIS supprimés ni renumérotés). Action est fixe ; les 7 rôles justes sont tous différents (un même rôle partout ne
// rapporte qu’une ligne). `nom` : texte à trous, rempli pour le site de l’élève.
export const ACTEURS = [
  { id: 'action', nom: 'Action', role: 'possede' },                                                        // fixe
  { id: 'prestataire', nom: '{prestataire}', role: 'stocke', difficulte: 'facile' },
  { id: 'magasin', nom: 'Le magasin Action de {ville}', role: 'vend', difficulte: 'facile' },
  { id: 'client', nom: 'Le client du magasin', role: 'achete', difficulte: 'moyen' },
  { id: 'lycee', nom: 'Ton lycée', role: 'forme', difficulte: 'moyen' },
  { id: 'fournisseur', nom: 'Un fournisseur', role: 'fabrique', difficulte: 'difficile' },
  { id: 'transporteur', nom: 'Le transporteur', role: 'emmene', difficulte: 'difficile' },
];
export const nomActeur = (p, S) => remplir(p.nom, S);

// ─────────────────────────────────────────────────────────────── la chaîne du site (brief §6.1)
// Les étiquettes ont des clés NEUTRES (une lettre) : la valeur d’une option ne dit pas sa place. Textes à trous.
export const CHAINE = [
  { v: 'q', lib: 'Une usine en Asie fabrique le produit' },
  { v: 'w', lib: 'Un porte-conteneurs le transporte' },
  { v: 'k', lib: 'Le port du Havre le reçoit' },
  { v: 'r', lib: 'L’entrepôt {prestataire} {de-site} le stocke et le prépare' },
  { v: 't', lib: 'Le magasin Action de {ville} le vend' },
  { v: 'z', lib: 'Le client l’achète' },
];
export const ORDRE_JUSTE = CHAINE.map((c) => c.v);
export const PLACE_JUSTE = 'r';
export const DEBUT = ORDRE_JUSTE.slice(0, 3);
export const FIN = ORDRE_JUSTE.slice(3);
export const libChaine = (v, S) => remplir((CHAINE.find((c) => c.v === v) || {}).lib || v, S);
const memes = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
// Les deux moitiés (brief §5) : positions 1 à 3 = les étapes 1, 2, 3 dans l’ordre ; positions 4 à 6 = les étapes 4, 5, 6 dans l’ordre.
export const debutJuste = (o) => Array.isArray(o) && o.length === 6 && memes(o.slice(0, 3), DEBUT);
export const finJuste = (o) => Array.isArray(o) && o.length === 6 && memes(o.slice(3), FIN);
// Sans tirage (base vide, contrôle au chargement) : un ordre de départ fixe, sans aucune moitié juste.
const ORDRE_SANS_TIRAGE = ['z', 'k', 'r', 'q', 't', 'w'];

// ─────────────────────────────────────────────────────────────── « Ce que je change » (brief §6 bis, textes de Cowork)
// Une situation, la conséquence juste (la première), ses 2 pièges, et « Rien ne change au magasin » (4 choix, ordre mélangé par élève).
// Une clé par conséquence, différente d’une situation à l’autre : la valeur d’une option ne trahit pas la bonne réponse. Textes à trous.
const RIEN = { v: 'rien', lib: 'Rien ne change au magasin' };
const sit = (id, difficulte, texte, [kj, juste], [k1, p1], [k2, p2]) => ({ id, difficulte, texte, juste: kj,
  choix: [{ v: kj, lib: juste }, { v: k1, lib: p1 }, { v: k2, lib: p2 }, RIEN] });
export const SITUATIONS = [
  // ── reprises d’ENT-8.3
  sit('s-etiquette', 'facile', 'Tu colles l’étiquette « {autre} » sur une palette pour {ville}.', ['ailleurs', 'La palette part à {autre} : le rayon de {ville} reste vide.'],
    ['corrige', 'Rien, le magasin corrige l’étiquette'], ['vite', 'La palette arrive plus vite']),
  sit('s-film', 'facile', 'Tu oublies de filmer une palette.', ['casse', 'Des cartons tombent dans le camion : des produits arrivent cassés.'],
    ['inutile', 'Rien, le film ne sert à rien'], ['rapide', 'Le camion part plus vite']),
  sit('s-cartons', 'facile', 'Tu prépares 10 cartons de bougies au lieu de 12.', ['manque', 'Il manque 2 cartons de bougies en rayon.'],
    ['trop', 'Il y a 2 cartons de trop'], ['personne', 'Rien, personne ne compte']),
  sit('s-emplacement', 'moyen', 'Tu ranges une palette de jouets au mauvais emplacement.', ['introuvable', 'On ne la trouve pas pour préparer {ville} : les jouets manquent.'],
    ['double', 'Les jouets arrivent en double'], ['autres', 'Rien, le magasin a d’autres jouets']),
  sit('s-lourd', 'moyen', 'Tu poses une palette lourde sur des cartons fragiles.', ['ecrase', 'Des produits fragiles arrivent écrasés.'],
    ['protege', 'Rien, le carton protège tout'], ['tot', 'La palette arrive plus vite']),
  sit('s-compte', 'moyen', 'À la réception, tu notes 50 cartons au lieu de 40.', ['incomplete', 'L’ordinateur croit qu’il y a du stock : la commande de {ville} est incomplète.'],
    ['plus', 'Le magasin reçoit 10 cartons de plus'], ['detail', 'Rien, c’est un détail']),
  sit('s-ordre', 'difficile', 'Le magasin de {ville} est le premier livré, mais tu charges sa palette au fond du camion.',
    ['retard', 'Le chauffeur doit décharger d’autres palettes : le magasin de {ville} est livré en retard.'], ['trouve', 'Rien, le chauffeur trouve toujours'],
    ['deux', 'Le magasin de {ville} reçoit deux fois ses produits']),
  sit('s-reserve', 'difficile', 'Un carton arrive abîmé du fournisseur et tu ne le signales pas.',
    ['abime', 'Le magasin reçoit un produit abîmé, et on ne peut plus se retourner contre le fournisseur.'], ['remplace', 'Le fournisseur le remplace tout seul'],
    ['voit', 'Rien, le client ne verra pas']),
  // ── reprises d’ENT-8.1 (un second piège : leur « Rien : … » d’ENT-8.1)
  sit('s-retard', 'moyen', 'Tu finis ta préparation avec une heure de retard.', ['tard', 'Le camion part en retard : le magasin de {ville} est livré plus tard.'],
    ['avance', 'Le magasin est livré plus tôt'], ['attend', 'Rien : le camion attend toujours']),
  sit('s-camion', 'moyen', 'Tu charges la palette de {ville} dans le camion d’un autre magasin.', ['echange', 'Le magasin de {ville} ne la reçoit pas, l’autre magasin l’a en trop.'],
    ['les-deux', 'Les deux magasins la reçoivent'], ['memes', 'Rien : les deux magasins vendent les mêmes produits']),
  sit('s-scan', 'difficile', 'Tu oublies de scanner un carton, mais tu le mets bien sur la palette.', ['stock', 'Le magasin reçoit un carton que sa liste ne prévoit pas : son stock est faux.'],
    ['absent', 'Le carton n’arrive pas au magasin'], ['labas', 'Rien : le carton est bien là']),
];
export const texteSituation = (p, S) => remplir(p.texte, S);
export const choixSituationTexte = (L, S) => L.map((c) => ({ v: c.v, lib: remplir(c.lib, S) }));
export const justeSituation = (p, S) => remplir((p.choix.find((c) => c.v === p.juste) || {}).lib, S);

// ─────────────────────────────────────────────────────────────── le tirage (règle du 08/10/2026), ni bonus ni niveau
// L’équité (vide = conforme) : l’ordre de départ de la chaîne n’a AUCUNE moitié juste (envoyer sans toucher rapporte 0 sur l’ordre) ;
// deux situations qui se soufflent ne vont pas ensemble : `s-etiquette` et `s-camion` (la palette d’un autre magasin), `s-ordre` et
// `s-retard` (le magasin livré en retard).
export const PAIRES_EXCLUES = [['s-etiquette', 's-camion'], ['s-ordre', 's-retard']];
export function ecartsJeu(jeu) {
  const E = [];
  const P = jeu.pieces || {};
  const o = jeu.valeurs && jeu.valeurs.chaine;
  if (!Array.isArray(o) || o.length !== 6) E.push('chaîne : pas d’ordre de départ');
  else {
    if (debutJuste(o)) E.push('chaîne : les 3 premières étapes sont déjà dans l’ordre au départ');
    if (finJuste(o)) E.push('chaîne : les 3 dernières étapes sont déjà dans l’ordre au départ');
  }
  const act = (P.acteurs || []).filter(Boolean);
  if (!act.some((p) => p.id === 'action')) E.push('acteurs : Action absente');
  if (new Set(act.map((p) => p.role)).size !== act.length) E.push('acteurs : deux rôles justes identiques');
  const ids = (P.situations || []).map((p) => p.id);
  PAIRES_EXCLUES.forEach(([a, b]) => { if (ids.includes(a) && ids.includes(b)) E.push(`situations : ${a} tirée avec ${b}`); });
  return E;
}
export const TIRAGE = declarerTirage({
  banques: {
    acteurs: { pieces: ACTEURS, fixes: ['action'], melange: { facile: 1, moyen: 1, difficile: 1 }, ordre: 'melange' },
    situations: { pieces: SITUATIONS, melange: { facile: 1, moyen: 1, difficile: 1 }, ordre: 'melange' },
  },
  // L’ordre de départ de la chaîne, tiré par élève et RANGÉ (re-tiré par `verifier` s’il a une moitié juste).
  valeurs: (h) => ({ chaine: h.melanger(ORDRE_JUSTE) }),
  verifier: ecartsJeu,
});
TIRAGE.lier(ID);

// ─────────────────────────────────────────────────────────────── le jeu de l’élève, lu dans SA base
// Sans tirage rangé (base vide du contrôle au chargement) : un jeu modèle fixe, conforme.
const parId = (B, id) => B.find((p) => p.id === id);
export const DEFAUT = { acteurs: ['prestataire', 'action', 'lycee', 'fournisseur'], situations: ['s-film', 's-lourd', 's-ordre'] };
const tire = (db) => !!TIRAGE.tirage(db);
export const acteursDe = (db) => (tire(db) ? TIRAGE.piecesTirees(db, 'acteurs') : DEFAUT.acteurs.map((id) => parId(ACTEURS, id)));
export const situationsDe = (db) => (tire(db) ? TIRAGE.piecesTirees(db, 'situations') : DEFAUT.situations.map((id) => parId(SITUATIONS, id)));
export function ordreDepart(db) {
  const o = TIRAGE.valeursTirees(db).chaine;
  return Array.isArray(o) && o.length === ORDRE_JUSTE.length ? o : ORDRE_SANS_TIRAGE;
}
const graineDe = (db) => { const r = TIRAGE.tirage(db); return (r && r.graine) || 'modele'; };
export const choixSituation = (db, p) => choixSituationTexte(hasard(`${graineDe(db)}|${ID}|choix|${p.id}`).melanger(p.choix), siteEleve(db));

export const champActeur = (i) => `acteur-${i + 1}`;
export const champSituation = (i) => `situation-${i + 1}`;
const libDe = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
export const libRole = (v) => libDe(ROLES, v);
// Une fiche envoyée (lecture seule, sans tirer `core/types/fiche.js` et l’interface) : { envoye, valeurs }.
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
export const envoyee = (id) => (db) => fiche(db, id).envoye;
