// ENT-8.12 — Action, « l'inventaire tournant du matin » : les DONNÉES PURES de la séance (la banque des 12 adresses à compter, le formats des
// palettes, le tirage des 6 adresses par élève avec leurs écarts, l'entrepôt d'un élève pour le mode `palettier`, les choix de la fiche des écarts,
// les phrases du compte rendu calculées sur CE QUE L'ÉLÈVE A COMPTÉ). Aucun effet de bord à l'import, aucune dépendance au navigateur : le contenu
// (`contenus/action-ent812.js`), les questions (`contenus/questions/ENT-8.12.js`), le corrigé (`contenus/corriges/ENT-8.12.js`) et les tests
// l'importent. Brief : `docs/briefs/ENT-8.12-action-inventaire-tournant.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-palettier.md`
// §3 (elles passent avant le brief là où elles diffèrent).
//
// VÉRIFIÉ (Cowork, 15 et 21/10/2026, brief §2) : l'entrepôt d'Action à Ensuès-la-Redonne, exploité par Geodis ; Geodis recrutait des « inventoristes »
// pour Ensuès à l'ouverture (Voxlog, 15/09/2022) ; 150 à 200 nouveautés par semaine chez Action ; Geodis propose un robot d'inventaire (Countbot, brochure
// Geodis) sans que rien ne dise qu'il sert à Ensuès ; l'inventaire tournant en général (on compte une partie du stock à la fois, souvent le matin).
// CONSTRUIT (dit dans la séance) : COMMENT Geodis fait ses inventaires à Ensuès (rien de publié), le Terminal, les adresses comptées, les stocks du
// système, les écarts et leurs causes ; Samia (cheffe d'équipe, tutrice) est construite (univers `contenus/action.js`).
//
// L'ALLÉE ET LES PRODUITS sont ceux d'ENT-8.11 (`contenus/action-ent811-donnees.js`, LU : plan, stock de départ, produits et cartons par palette) ;
// RIEN n'est lu dans la base d'ENT-8.11 : le plan et le stock sont redéclarés ici, le lendemain à 6 h.
//
// LE FORMAT D'UNE PALETTE (COORDINATION §3 n° 14 : mêmes cartons par palette qu'ENT-8.11 ; ici on les compte en couches) :
//   Lessive 3 × 3 × 4 = 36 · Nettoyant 2 × 4 × 5 = 40 · Serviettes 2 × 4 × 5 = 40 · Croquettes 2 × 4 × 4 = 32 · Boîtes 2 × 3 × 4 = 24 · Cahiers
//   2 × 3 × 5 = 30 · Peluches 2 × 4 × 3 = 24 (les bougies, 60 cartons, n'entrent pas : 3 × 4 × 5 sort des formats du brief). Une palette PLEINE a ce
//   nombre de cartons ; un compte ne dépasse jamais « une couche de plus » (règle de la vue).
//
// LE TIRAGE (par élève, graine = son identifiant + « |action-inventaire-tournant », `tirerJeu` de `core/tirage.js`) : six produits DIFFÉRENTS parmi
// les sept de la banque (le septième produit est celui de la 7e adresse du confirmé), une adresse tirée parmi celles de la banque qui portent
// chacun (1 ou 2) ; la liste est rangée dans l'ordre de l'allée. RÔLES (§6.1 du brief) : 1 manque, 1 surplus, 4 conformes, au hasard parmi les six.
//   conforme : couche du dessus INCOMPLÈTE (2 cartons ou plus, jamais pleine), réel = système ;
//   manque   : couche du dessus incomplète, 2 à 4 cartons de moins que le système (il en reste 2 au moins sur le dessus) ;
//   surplus  : palette pleine et 1 à 3 cartons POSÉS DESSUS (réel = système + 1 à 3).
//   bonus (confirmé, 7e adresse, en fin de liste) : un second manque, jalons `compte-7` et `recompte-bonus` en bonus.
// CLÉS (une par adresse : la liste est tirée, le moteur l'exige) : `manque`, `surplus`, `ok1` … `ok4` (conformes, dans l'ordre de la liste), `bonus` — le moteur
// refuse le tiret dans une clé (`ok-1` du brief devient `ok1`), d'où les jalons `recompte-manque`, `recompte-surplus`, `recompte-ok1` … `recompte-ok4`, `recompte-bonus`.
// TOUTES au niveau 1 (COORDINATION n° 12 : on compte depuis le sol). Le nombre du système n'est jamais dans la page avant « Terminer le comptage ».
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : ne pas changer le tirage, la banque ou les formats pendant qu'une
// classe joue la séance.

import { tirerJeu, graineDeBase, hasard, niveauEleve } from '../core/tirage.js';
import { PRODUITS, PLAN, STOCK, decoupe, HORS_SERVICE, SAMIA_MAIL as SAMIA_MAIL_811, MAIL_DOMAINE as MAIL_DOMAINE_811, MENTION_ALLEE as MENTION_ALLEE_811,
  unDe } from './action-ent811-donnees.js';

export { PRODUITS, PLAN, STOCK, decoupe, unDe };
export const ID = 'action-inventaire-tournant';
export const ID_VOLET = 'action-ent812';
export const ENTREPOT_ID = 'action-inventaire-tournant';      // les gestes publiés : `entrepot:action-inventaire-tournant:<geste>`
export const FICHE_ID = 'ecarts';
export const PHRASES_ID = 'samia';
export const MAIL_DOMAINE = MAIL_DOMAINE_811;
export const SAMIA_MAIL = SAMIA_MAIL_811;
export const MENTION_ALLEE = MENTION_ALLEE_811;
// Les sujets des messages (lus par les tests).
export const SUJETS = { accueil: 'Ce matin : l’inventaire', ecarts: 'Tes écarts', bilan: 'Un mot pour finir', fin: 'Merci' };
export const CONSIGNE_PLAN = 'Compte les adresses de la liste.';   // neutre (§6 bis) : ni combien, ni qu'il y a des écarts

// Le nom complet d'un geste publié par le plan d'entrepôt.
export const GESTE = (n) => `entrepot:${ENTREPOT_ID}:${n}`;
// Le geste `nom` est-il rangé dans la base (une fois, avec son heure) ?
export const gesteFait = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const COMPTES_GESTES = [1, 2, 3, 4, 5, 6, 7].map((r) => GESTE(`compte:${r}`));
// Vraie dès que `n` adresses au moins sont comptées (comptes confirmés `compte:<rang>`) ; garde les gestes cités (contrôlés au chargement).
export function auMoinsComptes(n) {
  const f = (db) => COMPTES_GESTES.filter((g) => gesteFait(db, g)).length >= n;
  f.gestes = COMPTES_GESTES.slice();
  return f;
}

/* ================================================================== les formats de palette (construits) */
export const FORMATS = {
  LES: { couche: [3, 3], couches: 4 }, NET: { couche: [2, 4], couches: 5 }, SER: { couche: [2, 4], couches: 5 }, CRO: { couche: [2, 4], couches: 4 },
  BOI: { couche: [2, 3], couches: 4 }, CAH: { couche: [2, 3], couches: 5 }, PEL: { couche: [2, 4], couches: 3 },
};
export const PRODUITS_BANQUE = Object.keys(FORMATS);
export const parCouche = (k) => FORMATS[k].couche[0] * FORMATS[k].couche[1];
export const pleine = (k) => parCouche(k) * FORMATS[k].couches;
PRODUITS_BANQUE.forEach((k) => { if (pleine(k) !== PRODUITS[k].cartons) throw new Error(`ENT-8.12 : le format de ${k} (${pleine(k)} cartons) n’est pas celui d’ENT-8.11 (${PRODUITS[k].cartons})`); });

/* ================================================================== la banque des 12 adresses (niveau 1, occupées par le stock d'ENT-8.11) */
// Chacune est une adresse du stock de départ d'ENT-8.11 (au sol, produit connu) : le produit n'est pas redéclaré (la vue garde celui du stock).
export const BANQUE = ['A1-T03-N1-E2', 'B1-T03-N1-E1', 'A2-T01-N1-E1', 'B2-T02-N1-E1', 'A2-T01-N1-E2', 'B2-T01-N1-E1', 'A2-T03-N1-E1', 'B1-T04-N1-E1',
  'A2-T03-N1-E2', 'B2-T03-N1-E1', 'A2-T04-N1-E3', 'B1-T04-N1-E2'];
BANQUE.forEach((a) => {
  const d = decoupe(a), s = STOCK[a];
  if (!d || d.n !== 1 || !s || !FORMATS[s.produit] || HORS_SERVICE.includes(a)) throw new Error(`ENT-8.12 : l’adresse ${a} de la banque n’est pas un emplacement au sol occupé par un produit de la banque`);
});
export const produitDe = (a) => STOCK[a].produit;
const banqueDe = (k) => BANQUE.filter((a) => produitDe(a) === k);

/* ================================================================== le tirage des 6 adresses */
// Les chiffres d'un rôle pour un produit : { systeme, reel }.
function chiffres(role, k, h) {
  const par = parCouche(k), bas = par * (FORMATS[k].couches - 1), plein = pleine(k);
  if (role === 'ok') { const n = bas + h.entier(2, par - 1); return { systeme: n, reel: n }; }
  if (role === 'manque' || role === 'bonus') { const e = h.entier(2, 4); const s = bas + h.entier(e + 2, par); return { systeme: s, reel: s - e }; }
  return { systeme: plein, reel: plein + h.entier(1, 3) };   // surplus
}
function tirer(h) {
  const produits = h.melanger(PRODUITS_BANQUE);
  const six = produits.slice(0, 6), septieme = produits[6];
  const roles = h.melanger(['manque', 'surplus', 'ok', 'ok', 'ok', 'ok']);
  const brut = six.map((k, i) => ({ adresse: h.choisir(banqueDe(k)), produit: k, role: roles[i] })).sort((a, b) => (a.adresse < b.adresse ? -1 : 1));
  let ok = 0;
  const liste = brut.map((x, i) => Object.assign({ rang: i + 1, cle: x.role === 'ok' ? `ok${++ok}` : x.role }, x, chiffres(x.role, x.produit, h)));
  const bonus = { rang: 7, adresse: h.choisir(banqueDe(septieme)), produit: septieme, role: 'bonus', cle: 'bonus', ...chiffres('bonus', septieme, h) };
  return { liste, bonus };
}
// Les contraintes d'équité, en clair (liste vide = jeu conforme ; sinon il est retiré). Rejouées sur 200 graines par le bloc de tests.
export function verifier(jeu) {
  const f = [];
  if (!jeu || !Array.isArray(jeu.liste) || !jeu.bonus) return ['jeu incomplet'];
  const L = jeu.liste, tous = [...L, jeu.bonus];
  if (L.length !== 6) return ['pas six adresses'];
  if (tous.some((x) => !FORMATS[x.produit] || !BANQUE.includes(x.adresse) || produitDe(x.adresse) !== x.produit)) return ['adresse ou produit hors banque'];
  if (new Set(tous.map((x) => x.adresse)).size !== 7) f.push('deux fois la même adresse');
  if (new Set(tous.map((x) => x.produit)).size !== 7) f.push('un produit en double (les sept produits sortent une fois)');
  const roles = (r) => L.filter((x) => x.role === r).length;
  if (roles('manque') !== 1 || roles('surplus') !== 1 || roles('ok') !== 4) f.push('rôles : 1 manque, 1 surplus, 4 conformes');
  if (L.some((x, i) => i && L[i - 1].adresse >= x.adresse)) f.push('la liste n’est pas dans l’ordre de l’allée');
  if (new Set(tous.map((x) => x.cle)).size !== 7) f.push('une clé en double');
  tous.forEach((x) => {
    const par = parCouche(x.produit), plein = pleine(x.produit), bas = plein - par, e = x.reel - x.systeme;
    if (!(x.reel > bas)) f.push(`${x.adresse} : couche du dessus vide`);
    if (x.role === 'ok' && (e !== 0 || x.reel >= plein || x.reel - bas < 2)) f.push(`${x.adresse} : conforme mal formée`);
    if ((x.role === 'manque' || x.role === 'bonus') && (e < -4 || e > -2 || x.reel >= plein || x.reel - bas < 2)) f.push(`${x.adresse} : manque mal formé`);
    if (x.role === 'surplus' && (x.systeme !== plein || e < 1 || e > 3)) f.push(`${x.adresse} : surplus mal formé`);
  });
  return f;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-action-ent812').jeu;
if (!DECL.secours) throw new Error('ENT-8.12 : le tirage ne donne aucun jeu conforme (tirer et verifier se contredisent)');
export const TIRAGE = DECL;

const jeux = new Map();
// Le jeu d'une graine (l'identifiant de l'élève ; '' : le jeu de référence, vu par l'enseignant), toujours le même pour la même graine.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!jeux.has(g)) jeux.set(g, tirerJeu(TIRAGE, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));

/* ================================================================== l'entrepôt d'un élève (lot 0 : fonction de la graine) */
export const REGLES = {
  titre: 'Compter une palette',
  entete: 'Compter une palette',
  lignes: [
    'Une <b>couche</b> = les cartons en largeur × les cartons en profondeur.',
    'Multiplie par le nombre de <b>couches pleines</b>, puis ajoute les cartons de la <b>couche du dessus</b>.',
    'Le Terminal dit que ça ne colle pas : <b>recompte</b>. Si c’est toujours pareil, <b>confirme</b>.',
  ],
};
// Les adresses à compter, au format du mode `palettier` (le `produit` est celui du stock) ; la 7e, au confirmé seulement, en fin de liste.
export const adressesDe = (jeu) => [
  ...jeu.liste.map((x) => ({ adresse: x.adresse, produit: x.produit, systeme: x.systeme, reel: x.reel, couche: FORMATS[x.produit].couche.slice(), couches: FORMATS[x.produit].couches, cle: x.cle })),
  { adresse: jeu.bonus.adresse, produit: jeu.bonus.produit, systeme: jeu.bonus.systeme, reel: jeu.bonus.reel, couche: FORMATS[jeu.bonus.produit].couche.slice(),
    couches: FORMATS[jeu.bonus.produit].couches, cle: 'bonus', niveaux: ['confirme'] },
];
// La déclaration de l'élève (graine, niveau). Guidage (brief §4 : l'encadré « Compter une palette » ouvert) : « Les règles » dépliées au chargement en standard et
// accompagné, repliées au confirmé (comme ENT-8.11) ; après « Terminer le comptage », le verdict `'critere'` (le nom du critère faux, jamais le nombre réel) pour
// tous ; l'accompagné a en plus le nombre de cartons PAR COUCHE de la palette ouverte (jamais le total). Aucune copie.
export function entrepotDe(graine, { niveau = 'standard' } = {}) {
  const jeu = jeuDe(graine);
  return {
    id: ENTREPOT_ID, libelle: 'Plan de l’entrepôt', mode: 'palettier',
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'le lendemain, 6 h', texte: CONSIGNE_PLAN },
    plan: PLAN,
    produits: Object.fromEntries(Object.keys(PRODUITS).map((k) => [k, { nom: PRODUITS[k].nom, court: PRODUITS[k].court }])),
    stock: STOCK,
    terminal: { nom: 'Terminal' },
    comptage: { adresses: adressesDe(jeu), recompte: 'ecart', ...(niveau === 'accompagne' ? { aideCouche: true } : {}) },
    verdict: 'critere',
    regles: niveau === 'confirme' ? REGLES : { ...REGLES, ouvertes: true },
  };
}

/* ================================================================== la fiche « Mes écarts » (choix, jugés sur LE SENS de l'écart de l'élève) */
// Ce que je fais : une seule bonne réponse. Une cause : deux réponses justes par sens (une suffit). Le texte des choix est CONSTRUIT : les pièges d'un
// sens sont des causes qui iraient dans l'autre sens, ou absurdes (les « on a livré trop au magasin » et « le magasin a rendu des cartons » du brief
// pouvaient être justes : remplacés, dit au compte rendu).
export const FAIRE = [
  { v: 'signaler', lib: 'je le signale à Samia' },
  { v: 'corriger', lib: 'je corrige le stock moi-même' },
  { v: 'rien', lib: 'je ne dis rien, c’est peut-être une erreur du système' },
];
export const FAIRE_JUSTE = 'signaler';
export const CAUSES = {
  manque: [
    { v: 'abimes', lib: 'des cartons abîmés ont été retirés sans être déclarés', juste: true },
    { v: 'ailleurs', lib: 'la palette a été mise à une autre adresse en partie', juste: true },
    { v: 'dessus', lib: 'des cartons d’une autre palette ont été posés dessus' },
    { v: 'pluie', lib: 'il a plu dans l’entrepôt' },
  ],
  surplus: [
    { v: 'dessus', lib: 'des cartons d’une autre palette du même produit ont été posés dessus', juste: true },
    { v: 'saisie', lib: 'une réception a été saisie avec trop peu de cartons', juste: true },
    { v: 'abimes', lib: 'des cartons abîmés ont été retirés sans être déclarés' },
    { v: 'double', lib: 'le système a compté deux fois la même réception' },
  ],
};
export const causesJustes = (sens) => CAUSES[sens].filter((c) => c.juste).map((c) => c.v);
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };
export const nomSens = (sens) => (sens === 'manque' ? 'il manque des cartons' : 'il y a des cartons en trop');

/* ================================================================== les valeurs tirées des questions (jamais celles de l'élève) */
// `q-colisage` : un exemple d'articles (n cartons de a articles et un carton ouvert de r) : 4 résultats distincts.
export function valeursColisage(db) {
  const h = hasard(`${graineDeBase(db) || 'reference'}|${ID}|q-colisage`);
  const n = h.entier(4, 9), a = h.choisir([12, 20, 24, 30]), r = h.entier(3, a - 4);
  return { n, a, r, juste: n * a + r, somme: n + a + r, sans: n * a, produit: n * a * r };
}
// `q-que-faire` : le système dit S, l'élève a compté C deux fois. S ≥ 100 : jamais un compte de palette (60 au plus).
export function valeursQueFaire(db) {
  const h = hasard(`${graineDeBase(db) || 'reference'}|${ID}|q-que-faire`);
  const s = h.entier(120, 250), e = h.entier(4, 9);
  return { systeme: s, compte: s - e };
}
// `q-cause` : un AUTRE cas que le sien, sur une autre adresse : n cartons de trop ou de moins (le sens est tiré).
export function valeursCause(db) {
  const h = hasard(`${graineDeBase(db) || 'reference'}|${ID}|q-cause`);
  return { sens: h.choisir(['manque', 'surplus']), n: h.entier(2, 5) };
}

/* ================================================================== les phrases du compte rendu (brief §6.2), calculées */
export const SALUTATIONS = ['Bonjour Samia,', 'Salut,', 'Salut Samia,'];
export const finsDe = (prenom) => [prenom, 'À plus', 'Cordialement'];
const pl = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
// La ligne juste : `adresses` comptées (les siennes) et `ecarts` (les lignes de sa fiche). Les pièges : un autre nombre d'écarts, ou « Tout est bon. ».
export const bilanJuste = (adresses, ecarts) => `${adresses} adresse${adresses > 1 ? 's' : ''} comptée${adresses > 1 ? 's' : ''}, ${pl(ecarts, 'écart')} signalé${ecarts > 1 ? 's' : ''} dans la fiche.`;
export function choixBilan(adresses, ecarts) {
  return [bilanJuste(adresses, ecarts), bilanJuste(adresses, ecarts + 1), ecarts > 0 ? 'Tout est bon.' : 'Il y a des écarts partout.'];
}
export const niveauDeBase = (db) => niveauEleve(db);
