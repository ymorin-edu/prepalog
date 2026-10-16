// ENT-8.3 — Action, « un autre site, un autre prestataire » : les DONNÉES PURES de la séance (lieux de la carte, banques, tirage, chaîne de
// Romain, lectures de la base de l’élève). Aucun effet de bord, aucune interface : importé par le contenu (`contenus/action-ent83.js`), les
// questions (`contenus/questions/ENT-8.3.js`, qui ne peuvent pas importer le contenu : il les importe) et le corrigé
// (`contenus/corriges/ENT-8.3.js`). Brief `docs/briefs/ENT-8.3-action-autre-site.md` §6, §6.1, §6 bis ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-action.md` §6.2.
//
// VÉRIFIÉ (brief §2, recherche de Cowork du 15 et du 16/10/2026) : Labastide-Saint-Pierre (82) exploité par GXO (avant : XPO) ; Ensuès-la-
// Redonne (13) par Geodis ; Belleville (69) et Verrières-en-Anjou (49) par Kuehne+Nagel ; Onnaing (59) par GXO, le plus récent ;
// Moissy-Cramayel (77) par GXO, après ID Logistics puis XPO. Roques : l’arrivée d’Action est annoncée (adresse et ouverture non trouvées).
// CONSTRUIT : Romain ; le fait que Labastide livre Roques ; la chaîne dessinée par Romain et ses erreurs ; les acteurs et leurs rôles (texte
// de Cowork) ; les situations de « Ce que je change » (texte de Cowork, écrit tel quel). Positions : centres de commune (OSM), approchées.

import { declarerTirage, hasard } from '../core/tirage.js';
import { LIEUX, LIEU_ROQUES, LIEU_ONNAING } from './action.js';

export const ID = 'action-autre-site';
export const VUE = 'action-carte-83';
export const ID_VOLET = 'action-ent83';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { qui: 'qui', chaine: 'chaine', change: 'change' };

// ─────────────────────────────────────────────────────────────── la carte (lieux propres à la séance, décision du chef de chantier §6.2)
// Labastide : copié de `LIEUX` (ENT-8.1, où il est BONUS) avec un `indice` et sans `bonus` (il est dans le socle ici). Le port : celui de
// `LIEUX`, tel quel. Roques et Onnaing : `contenus/action.js` (exports nouveaux, positions au centre de la commune).
const DE_81 = (id) => LIEUX.find((l) => l.id === id);
const { bonus: _b, ...LABASTIDE_81 } = DE_81('labastide');
export const LIEU_LABASTIDE = { ...LABASTIDE_81, id: 'entrepot',
  nom: 'L’entrepôt GXO de Labastide-Saint-Pierre', role: 'GXO y stocke et prépare les commandes des magasins Action du Sud-Ouest.',
  indice: 'Au sud du département, entre Montauban et Toulouse.', etiq: 'g' };
export const LIEUX_83 = [LIEU_LABASTIDE, LIEU_ROQUES, DE_81('port'), LIEU_ONNAING];
export const FLUX_83 = ['port', 'entrepot', 'magasin'];
// Les autres entrepôts Action (ronds creux, centres de commune) : Ensuès est ajouté (lieu d’ENT-8.1) ; Labastide n’y est pas (lieu joué) ;
// Onnaing y est (la vue ne le redessine pas chez un confirmé, qui le joue comme lieu : filtre à moins de 2 km).
export const RESEAU_83 = {
  libelle: 'autres entrepôts Action',
  sites: [
    { ville: 'Ensuès-la-Redonne', lonlat: DE_81('entrepot').lonlat },
    { ville: 'Moissy-Cramayel', lonlat: [2.5937, 48.6272] },
    { ville: 'Belleville-en-Beaujolais', lonlat: [4.7216, 46.1144] },
    { ville: 'Verrières-en-Anjou', lonlat: [-0.4675, 47.5179] },
    { ville: 'Onnaing', lonlat: LIEU_ONNAING.lonlat },
  ],
};

// ─────────────────────────────────────────────────────────────── les images nouvelles (chantier images du 16/10/2026)
// Crédits et empreintes : `contenus/images/action/CREDITS.md`. Les deux dessins sont à l’encre (`currentColor`), affichés en `<img>` : ils
// sortent noirs, d’où un fond clair sous eux dans les documents. `alt` sans nombre ni réponse.
const IMG = './contenus/images/action/';
export const IMAGES_83 = {
  quaiNumero: { src: `${IMG}porte-quai-numero.jpg`, alt: 'Des portes de quai fermées sur la façade d’un entrepôt, avec une plaque numérotée au-dessus de chacune',
    mention: 'Photo d’un autre quai — Simeon Galabov / Pexels' },
  rassemblement: { src: `${IMG}point-rassemblement.svg`, alt: 'Un panneau carré : des flèches venues des quatre côtés vont vers un petit groupe de personnes',
    mention: 'Dessin Prepalog' },
  remorque: { src: `${IMG}remorque-deux-planchers.svg`, alt: 'Une semi-remorque vue de côté, la paroi ouverte : des palettes de cartons rangées sur deux planchers, l’un au-dessus de l’autre',
    mention: 'Dessin Prepalog' },
};

// ─────────────────────────────────────────────────────────────── « Qui est qui ? », partie 1 : qui fait tourner cet entrepôt ?
// Les choix (mêmes pour chaque ligne, ordre fixe, brief §4). Clés courtes ; le texte affiché est le nom.
export const EXPLOITANTS = [
  { v: 'gxo', lib: 'GXO' }, { v: 'geodis', lib: 'Geodis' }, { v: 'kn', lib: 'Kuehne+Nagel' }, { v: 'action', lib: 'Action lui-même' },
];
// La banque (ids JAMAIS supprimés ni renumérotés). Labastide est fixe. Le brief ne donne pas de difficulté aux entrepôts tirés : tous
// `moyen` (le tirage veut une difficulté), 2 tirés. VÉRIFIÉ : les exploitants (brief §2).
export const ENTREPOTS = [
  { id: 'labastide', nom: 'L’entrepôt de Labastide-Saint-Pierre', exploitant: 'gxo' },          // fixe
  { id: 'ensues', nom: 'L’entrepôt d’Ensuès-la-Redonne', exploitant: 'geodis', difficulte: 'moyen' },
  { id: 'verrieres', nom: 'L’entrepôt de Verrières-en-Anjou', exploitant: 'kn', difficulte: 'moyen' },
  { id: 'belleville', nom: 'L’entrepôt de Belleville', exploitant: 'kn', difficulte: 'moyen' },
  { id: 'onnaing', nom: 'Le centre d’Onnaing', exploitant: 'gxo', difficulte: 'moyen' },
  { id: 'moissy', nom: 'L’entrepôt de Moissy-Cramayel', exploitant: 'gxo', difficulte: 'moyen' },
];

// ─────────────────────────────────────────────────────────────── « Qui est qui ? », partie 2 : quel est son rôle ? (textes de Cowork, construits)
// Les 7 rôles, offerts à CHAQUE ligne, ORDRE FIXE (brief §6 bis) : les 5 rôles justes, puis deux pièges. Les clés ne nomment pas l’acteur.
export const ROLES = [
  { v: 'vend', lib: 'vend les produits aux clients' },
  { v: 'guide', lib: 'te guide pendant ton stage' },
  { v: 'forme', lib: 't’envoie en stage et suit ta formation' },
  { v: 'fabrique', lib: 'fabrique les produits qu’Action achète' },
  { v: 'emmene', lib: 'emmène les palettes de l’entrepôt au magasin' },
  { v: 'stocke', lib: 'stocke et prépare les commandes pour Action' },
  { v: 'achete', lib: 'achète au magasin' },
];
export const ACTEURS = [
  { id: 'roques', nom: 'Le nouveau magasin de Roques', role: 'vend', difficulte: 'facile' },
  { id: 'romain', nom: 'Romain', role: 'guide', difficulte: 'facile' },
  { id: 'lycee', nom: 'Ton lycée', role: 'forme', difficulte: 'moyen' },
  { id: 'fournisseur', nom: 'Un fournisseur', role: 'fabrique', difficulte: 'moyen' },
  { id: 'transporteur', nom: 'Le transporteur', role: 'emmene', difficulte: 'difficile' },
];

// ─────────────────────────────────────────────────────────────── la chaîne de Romain (brief §6.1, fixe ; erreurs §6 bis)
// Les étiquettes ont des clés NEUTRES (une lettre) : la valeur d’une option ne dit ni « juste » ni « fausse » à qui lit la page.
export const CHAINE = [
  { n: 1, v: 'q', lib: 'Une usine en Asie fabrique le produit' },
  { n: 2, v: 'w', lib: 'Un porte-conteneurs le transporte' },
  { n: 3, v: 'k', lib: 'Le port du Havre le reçoit' },
  { n: 4, v: 'r', lib: 'L’entrepôt GXO de Labastide le stocke et le prépare' },
  { n: 5, v: 't', lib: 'Le nouveau magasin de Roques le vend' },
  { n: 6, v: 'z', lib: 'Le client l’achète' },
];
// Les étiquettes fausses : DEUX banques (décision du constructeur, §6.2 du chef de chantier) — une erreur facile, puis une moyenne OU
// difficile. Le tirage veut des effectifs fixes par difficulté : dans `erreursMd`, les quatre sont déclarées `moyen` ; leur difficulté du
// brief est gardée dans `niveau` (pour le corrigé). Chaque erreur est sur une case différente des autres : deux erreurs tirées ne tombent
// jamais sur la même case (contrôlé aussi par `ecartsJeu`).
export const ERREURS_FACILES = [
  { id: 'e-avion', difficulte: 'facile', niveau: 'facile', n: 2, v: 'b', lib: 'Un avion le transporte' },
  { id: 'e-nimes', difficulte: 'facile', niveau: 'facile', n: 5, v: 'g', lib: 'Le magasin de Nîmes le vend' },
];
export const ERREURS_MD = [
  { id: 'e-ensues', difficulte: 'moyen', niveau: 'moyen', n: 4, v: 'd', lib: 'L’entrepôt Geodis d’Ensuès le stocke et le prépare' },
  { id: 'e-marseille', difficulte: 'moyen', niveau: 'moyen', n: 3, v: 'f', lib: 'Le port de Marseille le reçoit' },
  { id: 'e-labastide', difficulte: 'moyen', niveau: 'difficile', n: 1, v: 'h', lib: 'Une usine à Labastide fabrique le produit' },
  { id: 'e-fournisseur', difficulte: 'moyen', niveau: 'difficile', n: 6, v: 'n', lib: 'Le fournisseur l’achète' },
];
export const ERREURS = [...ERREURS_FACILES, ...ERREURS_MD];

// ─────────────────────────────────────────────────────────────── « Ce que je change » (textes de Cowork, construits, brief §6 bis)
// Une situation, la conséquence juste (la première), ses 2 pièges, et « Rien ne change au magasin » (4 choix, ordre mélangé par élève). Une
// clé par conséquence, différente d’une situation à l’autre (comme ENT-8.1) : la valeur d’une option ne trahit pas la bonne réponse.
const RIEN = { v: 'rien', lib: 'Rien ne change au magasin' };
const sit = (id, difficulte, texte, [kj, juste], [k1, p1], [k2, p2]) => ({ id, difficulte, texte, juste: kj,
  choix: [{ v: kj, lib: juste }, { v: k1, lib: p1 }, { v: k2, lib: p2 }, RIEN] });
export const SITUATIONS = [
  sit('s-etiquette', 'facile', 'Tu colles l’étiquette « Nîmes » sur une palette pour Roques.', ['nimes', 'La palette part à Nîmes : le rayon de Roques reste vide.'],
    ['corrige', 'Rien, le magasin corrige l’étiquette'], ['vite', 'La palette arrive plus vite']),
  sit('s-film', 'facile', 'Tu oublies de filmer une palette.', ['casse', 'Des cartons tombent dans le camion : des produits arrivent cassés.'],
    ['inutile', 'Rien, le film ne sert à rien'], ['vite', 'Le camion part plus vite']),
  sit('s-cartons', 'facile', 'Tu prépares 10 cartons de bougies au lieu de 12.', ['manque', 'Il manque 2 cartons de bougies en rayon.'],
    ['trop', 'Il y a 2 cartons de trop'], ['personne', 'Rien, personne ne compte']),
  sit('s-emplacement', 'moyen', 'Tu ranges une palette de jouets au mauvais emplacement.', ['introuvable', 'On ne la trouve pas pour préparer Roques : les jouets manquent.'],
    ['double', 'Les jouets arrivent en double'], ['autres', 'Rien, le magasin a d’autres jouets']),
  sit('s-lourd', 'moyen', 'Tu poses une palette lourde sur des cartons fragiles.', ['ecrase', 'Des produits fragiles arrivent écrasés.'],
    ['protege', 'Rien, le carton protège tout'], ['vite', 'La palette arrive plus vite']),
  sit('s-compte', 'moyen', 'À la réception, tu notes 50 cartons au lieu de 40.', ['incomplete', 'L’ordinateur croit qu’il y a du stock : la commande de Roques est incomplète.'],
    ['plus', 'Le magasin reçoit 10 cartons de plus'], ['detail', 'Rien, c’est un détail']),
  sit('s-ordre', 'difficile', 'Roques est le premier magasin livré, mais tu charges sa palette au fond du camion.',
    ['retard', 'Le chauffeur doit décharger d’autres palettes : Roques est livré en retard.'], ['trouve', 'Rien, le chauffeur trouve toujours'],
    ['deux', 'Roques reçoit deux fois ses produits']),
  sit('s-reserve', 'difficile', 'Un carton arrive abîmé du fournisseur et tu ne le signales pas.',
    ['abime', 'Le magasin reçoit un produit abîmé, et on ne peut plus se retourner contre le fournisseur.'], ['remplace', 'Le fournisseur le remplace tout seul'],
    ['voit', 'Rien, le client ne verra pas']),
];

// ─────────────────────────────────────────────────────────────── le tirage (règle du 08/10/2026)
// L’équité (vide = conforme) : au moins 2 exploitants différents parmi les 3 entrepôts (sinon « tout GXO » rapporterait) ; deux erreurs sur
// deux cases différentes ; jamais `s-etiquette` avec `e-nimes` (elles se ressemblent).
export function ecartsJeu(jeu) {
  const E = [];
  const P = jeu.pieces || {};
  const ent = (P.entrepots || []).filter(Boolean);           // la pièce fixe (Labastide) y est déjà
  const exploitants = new Set(ent.map((p) => p.exploitant));
  if (!ent.some((p) => p.id === 'labastide')) E.push('entrepôts : Labastide absente');
  if (new Set(ent.map((p) => p.id)).size !== ent.length) E.push('entrepôts : un entrepôt en double');
  if (exploitants.size < 2) E.push(`entrepôts : ${exploitants.size} exploitant(s) seulement sur les lignes (au moins 2)`);
  const err = [...(P.erreurs || []), ...(P.erreursMd || [])];
  if (err.length === 2 && err[0].n === err[1].n) E.push('chaîne : les deux erreurs sont sur la même case');
  const sits = [...(P.situations || []), ...(((jeu.bonus || {}).situations) || [])];
  if (err.some((e) => e.id === 'e-nimes') && sits.some((s) => s.id === 's-etiquette')) E.push('s-etiquette tirée avec e-nimes');
  return E;
}
export const TIRAGE = declarerTirage({
  banques: {
    entrepots: { pieces: ENTREPOTS, fixes: ['labastide'], melange: { moyen: 2 }, ordre: 'melange' },
    acteurs: { pieces: ACTEURS, melange: { facile: 1, moyen: 1 }, ordre: 'melange' },
    erreurs: { pieces: ERREURS_FACILES, melange: { facile: 1 }, ordre: 'fixe' },
    erreursMd: { pieces: ERREURS_MD, melange: { moyen: 1 }, ordre: 'fixe' },
    situations: { pieces: SITUATIONS, melange: { facile: 1, moyen: 1, difficile: 1 }, bonus: { confirme: { moyen: 1 } }, ordre: 'melange' },
  },
  verifier: ecartsJeu,
});
TIRAGE.lier(ID);

// ─────────────────────────────────────────────────────────────── le jeu de l’élève, lu dans SA base
// Sans tirage rangé (base vide du contrôle au chargement, enseignant) : un jeu modèle fixe, conforme.
const parId = (B, id) => B.find((p) => p.id === id);
export const DEFAUT = { entrepots: ['labastide', 'ensues', 'belleville'], acteurs: ['roques', 'lycee'], erreurs: ['e-avion', 'e-ensues'],
  situations: ['s-film', 's-lourd', 's-ordre'] };
const tire = (db) => !!TIRAGE.tirage(db);
export const entrepotsDe = (db) => (tire(db) ? TIRAGE.piecesTirees(db, 'entrepots') : DEFAUT.entrepots.map((id) => parId(ENTREPOTS, id)));
export const acteursDe = (db) => (tire(db) ? TIRAGE.piecesTirees(db, 'acteurs') : DEFAUT.acteurs.map((id) => parId(ACTEURS, id)));
// Les deux erreurs de l’élève : la facile, puis la moyenne ou difficile (ordre des jalons ; jamais montré à l’élève).
export const erreursDe = (db) => (tire(db) ? [...TIRAGE.piecesTirees(db, 'erreurs'), ...TIRAGE.piecesTirees(db, 'erreursMd')]
  : DEFAUT.erreurs.map((id) => parId(ERREURS, id)));
export const situationsSocle = (db) => (tire(db) ? TIRAGE.piecesTirees(db, 'situations') : DEFAUT.situations.map((id) => parId(SITUATIONS, id)));
export const situationsDe = (db) => [...situationsSocle(db), ...TIRAGE.piecesBonus(db, 'situations')];
const graineDe = (db) => { const r = TIRAGE.tirage(db); return (r && r.graine) || 'modele'; };
const melange = (db, cle, L) => hasard(`${graineDe(db)}|${ID}|${cle}`).melanger(L);

// La chaîne telle que Romain l’a dessinée pour CET élève : les 6 cases, ses 2 cases fausses à leur place.
export function chaineDessinee(db) {
  const E = erreursDe(db);
  return CHAINE.map((c) => { const e = E.find((x) => x.n === c.n); return { n: c.n, lib: e ? e.lib : c.lib }; });
}
// Les étiquettes offertes dans la fiche : les 6 justes + 3 fausses (les 2 de l’élève + une 3e tirée parmi les autres), mélangées par élève.
export function etiquettesDe(db) {
  const E = erreursDe(db);
  const autres = ERREURS.filter((e) => !E.some((x) => x.id === e.id));
  const troisieme = hasard(`${graineDe(db)}|${ID}|troisieme`).choisir(autres);
  return melange(db, 'etiquettes', [...CHAINE, ...E, troisieme].map((x) => ({ v: x.v, lib: x.lib })));
}
export const CASES = CHAINE.map((c) => ({ v: String(c.n), lib: String(c.n) }));
export const libEtiquette = (v) => ([...CHAINE, ...ERREURS].find((x) => x.v === v) || {}).lib || v;
export const justeDeCase = (n) => CHAINE.find((c) => c.n === Number(n));

export const champEntrepot = (i) => `entrepot-${i + 1}`;
export const champActeur = (i) => `acteur-${i + 1}`;
export const champSituation = (i) => `situation-${i + 1}`;
// Les lignes de la chaîne (deux cadres « Erreur 1 » / « Erreur 2 ») : la case nommée, l’étiquette proposée.
export const CHAMPS_CHAINE = [{ cas: 'case-1', etiq: 'etiquette-1' }, { cas: 'case-2', etiq: 'etiquette-2' }];
export const choixSituation = (db, p) => melange(db, `choix|${p.id}`, p.choix);
const libDe = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
export const libRole = (v) => libDe(ROLES, v);
export const libExploitant = (v) => libDe(EXPLOITANTS, v);
// Une fiche envoyée (lecture seule, sans tirer `core/types/fiche.js` et l’interface) : { envoye, valeurs }.
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
// Une fiche déjà envoyée une fois (même rouverte par « Corriger » ensuite) : l’écran suivant ne se referme pas.
export const dejaEnvoyee = (id) => (db) => { const f = db && db.fiches && db.fiches[id]; return !!(f && (f.envoye || f.envois)); };

// ─────────────────────────────────────────────────────────────── le jugement de la chaîne, SANS ORDRE (brief §5)
// F = les deux cases fausses de l’élève. « Erreur trouvée n° i » : une des deux lignes nomme la case de fi. « Erreur corrigée n° i » : une
// ligne qui nomme fi propose l’étiquette juste de fi. Une même case nommée deux fois ne trouve qu’une erreur ; une case juste nommée ne
// rapporte rien. Rend [{ trouvee, corrigee }] dans l’ordre de `erreursDe` (facile, puis l’autre).
export function jugerChaine(db, valeurs) {
  const lignes = CHAMPS_CHAINE.map((c) => ({ n: Number(valeurs[c.cas]), v: valeurs[c.etiq] }));
  return erreursDe(db).map((e) => {
    const qui = lignes.filter((l) => l.n === e.n);
    return { trouvee: qui.length > 0, corrigee: qui.some((l) => l.v === justeDeCase(e.n).v) };
  });
}
