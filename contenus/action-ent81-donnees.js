// ENT-8.1 — Action : les DONNÉES PURES de la séance (banques, tirage, lectures de la base de l’élève). Aucun effet de bord, aucune
// interface : importé par le contenu (`contenus/action-ent81.js`), les questions (`contenus/questions/ENT-8.1.js`, qui ne peuvent pas
// importer le contenu : il les importe) et le corrigé (`contenus/corriges/ENT-8.1.js`). Brief `docs/briefs/ENT-8.1-action-se-situer.md` §6 bis.
// Textes des acteurs, des rôles et des situations : CONSTRUITS par Cowork (brief §6 bis, §11 n° 4), écrits tels quels.

import { declarerTirage, hasard } from '../core/tirage.js';

export const ID = 'action-se-situer';
export const VUE = 'action-carte';
export const ID_VOLET = 'action-ent81';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { qui: 'qui', chaine: 'chaine', change: 'change' };

// ─────────────────────────────────────────────────────────────── les banques (brief §6 bis ; ids JAMAIS supprimés ni renumérotés)
// Les 7 rôles, offerts à CHAQUE ligne de « Qui est qui ? » quel que soit le tirage. Les clés `v` ne nomment pas l’acteur (une clé
// « geodis » sur le bon rôle donnerait la réponse à qui lit la page).
export const ROLES = [
  { v: 'stocke', lib: 'stocke et prépare les commandes des magasins' },
  { v: 'possede', lib: 'possède les magasins et choisit les produits à vendre' },
  { v: 'vend', lib: 'vend les produits aux clients' },
  { v: 'fabrique', lib: 'fabrique les produits' },
  { v: 'achete', lib: 'achète les produits au magasin' },
  { v: 'forme', lib: 't’envoie en stage et suit ta formation' },
  { v: 'amene', lib: 'amène les marchandises en camion' },
];
export const ACTEURS = [
  { id: 'geodis', nom: 'Geodis', role: 'stocke' },                                             // fixe
  { id: 'lycee', nom: 'Ton lycée', role: 'forme', difficulte: 'facile' },
  { id: 'client', nom: 'Le client du magasin', role: 'achete', difficulte: 'facile' },
  { id: 'fournisseur', nom: 'Un fournisseur', role: 'fabrique', difficulte: 'facile' },
  { id: 'magasin', nom: 'Le magasin Action de Nîmes', role: 'vend', difficulte: 'moyen' },
  { id: 'transporteur', nom: 'Le transporteur', role: 'amene', difficulte: 'moyen' },
  { id: 'action', nom: 'Action', role: 'possede', difficulte: 'difficile' },                     // se confond avec le magasin
];
// « Ce que je change » : une situation, ses 3 conséquences (clés neutres), la juste. Textes construits par Cowork (§6 bis).
export const SITUATIONS = [
  { id: 's-cartons', difficulte: 'facile', texte: 'Tu prépares 10 cartons de bougies au lieu de 12.', juste: 'manque',
    choix: [{ v: 'manque', lib: 'Il manque des bougies dans le rayon' }, { v: 'trop', lib: 'Le magasin a des bougies en trop' },
      { v: 'rien', lib: 'Rien : personne ne le voit' }] },
  { id: 's-chute', difficulte: 'facile', texte: 'Un colis mal filmé tombe dans le camion.', juste: 'casse',
    choix: [{ v: 'casse', lib: 'Des produits arrivent cassés au magasin' }, { v: 'vite', lib: 'Le camion arrive plus vite' },
      { v: 'rien', lib: 'Rien ne change pour le magasin' }] },
  { id: 's-etiquette', difficulte: 'facile', texte: 'Tu colles sur une palette l’étiquette d’un autre magasin.', juste: 'ailleurs',
    choix: [{ v: 'ailleurs', lib: 'La palette part dans un autre magasin : elle manque à Nîmes' },
      { v: 'double', lib: 'Le magasin de Nîmes la reçoit deux fois' }, { v: 'rien', lib: 'Rien : le chauffeur corrige' }] },
  { id: 's-emplacement', difficulte: 'moyen', texte: 'Tu ranges une palette au mauvais emplacement.', juste: 'introuvable',
    choix: [{ v: 'introuvable', lib: 'Le préparateur ne la trouve pas : le produit manque dans la commande du magasin' },
      { v: 'double', lib: 'Le magasin reçoit le produit deux fois' }, { v: 'rien', lib: 'Rien : l’ordinateur la retrouve tout seul' }] },
  { id: 's-retard', difficulte: 'moyen', texte: 'Tu finis ta préparation avec une heure de retard.', juste: 'tard',
    choix: [{ v: 'tard', lib: 'Le camion part en retard : le magasin est livré plus tard' }, { v: 'tot', lib: 'Le magasin est livré plus tôt' },
      { v: 'rien', lib: 'Rien : le camion attend toujours' }] },
  { id: 's-camion', difficulte: 'moyen', texte: 'Tu charges la palette de Nîmes dans le camion d’un autre magasin.', juste: 'echange',
    choix: [{ v: 'echange', lib: 'Nîmes ne la reçoit pas, l’autre magasin l’a en trop' }, { v: 'deux', lib: 'Les deux magasins la reçoivent' },
      { v: 'rien', lib: 'Rien : les deux magasins vendent les mêmes produits' }] },
  { id: 's-scan', difficulte: 'difficile', texte: 'Tu oublies de scanner un carton, mais tu le mets bien sur la palette.', juste: 'stock',
    choix: [{ v: 'stock', lib: 'Le magasin reçoit un carton que sa liste ne prévoit pas : son stock est faux' },
      { v: 'absent', lib: 'Le carton n’arrive pas au magasin' }, { v: 'rien', lib: 'Rien : le carton est bien là' }] },
  { id: 's-abime', difficulte: 'difficile', texte: 'Tu vois un carton abîmé et tu le prépares sans rien dire.', juste: 'invendable',
    choix: [{ v: 'invendable', lib: 'Le magasin reçoit un produit qu’il ne pourra pas vendre' },
      { v: 'moins-cher', lib: 'Le magasin le vend moins cher, c’est mieux' }, { v: 'rien', lib: 'Rien : le client ne regarde pas' }] },
];
// « La chaîne » : les 6 étiquettes, DANS L’ORDRE JUSTE (« le bateau » et non « le porte-conteneurs » : décision n° 2 du chef de chantier).
export const CHAINE = [
  { v: 'usine', lib: 'l’usine, en Asie' },
  { v: 'bateau', lib: 'le bateau' },
  { v: 'havre', lib: 'le hub d’import du Havre' },
  { v: 'ensues', lib: 'l’entrepôt d’Ensuès-la-Redonne' },
  { v: 'magasin', lib: 'le magasin Action de Nîmes' },
  { v: 'client', lib: 'le client' },
];
export const ORDRE_JUSTE = CHAINE.map((c) => c.v);
export const PLACE_JUSTE = 'ensues';
export const memeOrdre = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
// Sans tirage (base vide, contrôle au chargement) : un ordre de départ fixe, jamais juste.
const ORDRE_SANS_TIRAGE = ['client', 'bateau', 'magasin', 'usine', 'ensues', 'havre'];

// L’équité du tirage : l’ordre de départ de la chaîne n’est JAMAIS l’ordre juste (sinon envoyer sans rien toucher rapporterait 2,5 points).
export function ecartsEquite(jeu) {
  const E = [];
  if (!jeu.valeurs || memeOrdre(jeu.valeurs.chaine, ORDRE_JUSTE)) E.push('chaîne : l’ordre de départ tiré est l’ordre juste');
  return E;
}
export const TIRAGE = declarerTirage({
  banques: {
    acteurs: { pieces: ACTEURS, fixes: ['geodis'], melange: { facile: 1, moyen: 1, difficile: 1 }, ordre: 'melange' },
    situations: { pieces: SITUATIONS, melange: { facile: 1, moyen: 1, difficile: 1 }, bonus: { confirme: { moyen: 1 } }, ordre: 'melange' },
  },
  // L’ordre de départ de la chaîne, tiré par élève et RANGÉ (re-tiré par `verifier` s’il tombe juste).
  valeurs: (h) => ({ chaine: h.melanger(ORDRE_JUSTE) }),
  verifier: ecartsEquite,
});
TIRAGE.lier(ID);

// ─────────────────────────────────────────────────────────────── le jeu de l’élève, lu dans SA base (base vide : rien de tiré)
const graineDe = (db) => { const r = TIRAGE.tirage(db); return (r && r.graine) || 'modele'; };
const melange = (db, cle, L) => hasard(`${graineDe(db)}|${ID}|${cle}`).melanger(L);
export const acteursDe = (db) => TIRAGE.piecesTirees(db, 'acteurs');
// Les situations dans l’ordre de la fiche : le socle (ordre tiré), puis le cas bonus du confirmé en dernier.
export const situationsSocle = (db) => TIRAGE.piecesTirees(db, 'situations');
export const situationsDe = (db) => [...situationsSocle(db), ...TIRAGE.piecesBonus(db, 'situations')];
export function ordreDepart(db) {
  const o = TIRAGE.valeursTirees(db).chaine;
  return Array.isArray(o) && o.length === ORDRE_JUSTE.length ? o : ORDRE_SANS_TIRAGE;
}
export const champActeur = (i) => `acteur-${i + 1}`;
export const champSituation = (i) => `situation-${i + 1}`;
// Les 7 rôles, dans un ordre tiré par élève (le même à chaque ligne : plus simple à lire).
export const rolesDe = (db) => melange(db, 'roles', ROLES);
export const choixSituation = (db, p) => melange(db, `choix|${p.id}`, p.choix);
const libDe = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
export const libRole = (v) => libDe(ROLES, v);
export const libChaine = (v) => libDe(CHAINE, v);
// Une fiche envoyée (lecture seule, sans tirer `core/types/fiche.js` et l’interface) : { envoye, valeurs }.
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
// Une fiche déjà envoyée une fois (même rouverte par « Corriger » ensuite) : la suite ne se referme pas.
export const dejaEnvoyee = (id) => (db) => { const f = db && db.fiches && db.fiches[id]; return !!(f && (f.envoye || f.envois)); };
