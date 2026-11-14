// ENT-25.1 — « Et si tu choisissais la Logistique ? » : la séance de la semaine des filières pour les 2de GATL (novembre 2026).
// Demande de Tristan du 12/11/2026 (fil « Préparer la semaine des filières en 2de ») : « le but est de mettre en avant le BAC PRO logistique », 2de GATL, 1 h.
// Après deux versions (une visite de quatre entreprises, en fiches puis en écrans de jeu), Tristan, 14/11/2026 : « je veux tout retirer pour laisser que
// Spartoo » ; « la carte pour Spartoo », puis « une réception comme Spartoo : camion qui arrive, 1 palette, contrôle qualitatif et quantitatif, mise en stock
// dans un emplacement, puis saisie informatique dans le stock » ; « tout se fera à l'écran, pas de trame ».
// Brief et compte rendu : `docs/briefs/ENT-25.1-vitrine-logistique.md` ; activité : `activites/vitrine-logistique.js` ; corrigé : `contenus/corriges/ENT-25.1.js`.
//
// Quatre écrans du moteur (aucune vue nouvelle, rien dans `core/`) :
//   ⓪ la carte de France (vue « Localiser ») : Toolog, l'entrepôt de Spartoo, à Saint-Quentin-Fallavier (38) ;
//   ① le quai (vue « Quai », rendu iso, comme ENT-1.1) : le camion, le BL, la palette de Puma (12 cartons annoncés, un manquant au fond de la couche du haut,
//      un carton enfoncé sur la face arrière), compter, faire le tour, décider, écrire les réserves, faire signer ;
//   ② la mise en stock (vue « Plan d'entrepôt », rangement) : le bon côté (sport / ville), la bonne travée (rotation), un emplacement libre ;
//   ③ la saisie (écran Réceptions) : le lot, les PAIRES annoncées et comptées (cartons × 6), l'état, la décision ; l'entrée en stock.
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) : vérifiés pour ENT-1.1 et 1.2 (briefs du 06 et du 09/10/2026) : Spartoo, son entrepôt exploité par sa filiale Toolog à
// Saint-Quentin-Fallavier (38), 88 000 m², environ 150 salariés, 2 millions de paires, 100 % RFID, produits rangés par catégorie et non par marque ; Puma,
// Geodis ; 6 paires par carton (choix de Tristan pour ENT-1.1). Position sur la carte APPROCHÉE (centre de la commune). Construits : Sarah, le quai, le
// camion, le BL, le lot, la palette et ses défauts, le plan à palettes, le stock et les règles de rangement (le vrai stockage de Toolog est en massifs sur
// cinq étages, pas en rayonnages à palettes), la réception.
// Notation : découverte non comptée dans les compétences (`competences: []`) ; 20 points pour que l'élève voie un résultat.

import { catalogueSimple } from './entreprise-commun.js';
import { FRANCE } from './france-contours.js';
import { THEME as THEME_SPARTOO } from './spartoo.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { jalonsEntrepot } from '../core/types/entrepot.js';
import { jalonsQuai } from '../core/types/quai.js';
import { localiserFini } from '../core/declencheurs.js';

export const ID = 'vitrine-logistique';
export const ID_VOLET = 'vitrine-251-spartoo';
export const VUE_CARTE = 'vitrine-carte';
export const QUAI_ID = 'vitrine-quai';
export const ENTREPOT_ID = 'vitrine-rangement';
export const JOUR = { iso: '2026-11-16', lib: 'lundi 16 novembre 2026' };

const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const ENTREPRISE = {
  id: 'vitrine-logistique',
  nom: 'Spartoo',
  sousTitre: 'Semaine des filières — une réception à Toolog, l’entrepôt de Spartoo',
  exercice: 'La réception',
  logo: './contenus/trames/logos/spartoo.jpg',
};
export const VOCAB = { unit: 'paire', unitPl: 'paires', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'lycee.example' };
// La charte de Spartoo (cramoisi, module sombre), celle d'ENT-1.x : le moteur garde le rouge au bandeau et au menu (décision du 05/10/2026).
export const THEME = THEME_SPARTOO;

// L'article reçu, et le fournisseur (références et numéros CONSTRUITS, comme dans ENT-1.1).
export const PAIRES_PAR_CARTON = 6;
export const REF = 'PM-RSX-BL-42';
export const NOM = 'Puma RS-X Blanc T.42';
export const CATALOGUE = catalogueSimple([{ ref: REF, designation: 'RS-X Blanc T.42', marque: 'Puma', categorie: 'Chaussures de sport', fournisseur: 'F-PUMA', stock: 0 }]);
export const SUPPLIERS = [{ id: 'F-PUMA', brand: 'Puma', name: 'Puma France, B2B', adr: '', cp: '', ville: '', contact: '', tel: '', email: 'b2b@puma.example',
  delai: 3, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((x) => [x.id, x]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

// ─────────────────────────────────────────────────────────────── ⓪ la carte de France (vue « Localiser »)
// Position APPROCHÉE : centre de la commune (l'entrepôt est au parc de Chesnes, sur la commune). Les « autres » villes sont en Isère, à plus de 8 km.
export const LOCALISER = {
  id: VUE_CARTE, libelle: 'Carte de France', titre: 'Où est l’entrepôt de Spartoo ?', contours: FRANCE,
  lieux: [
    { id: 'toolog', lettre: 'T', type: 'entrepot', nom: 'Toolog, l’entrepôt de Spartoo', role: 'L’entrepôt d’où partent les chaussures vendues sur spartoo.com.',
      ville: 'Saint-Quentin-Fallavier', dep: '38', region: '84', lonlat: [5.1094, 45.6436], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Vienne', lonlat: [4.8742, 45.5253] }, { ville: 'Bourgoin-Jallieu', lonlat: [5.2736, 45.5861] }, { ville: 'Voiron', lonlat: [5.5917, 45.3644] }],
      reperes: [{ ville: 'Lyon', lonlat: [4.8357, 45.7640] }], indice: 'Entre Lyon et Grenoble, à l’est de Lyon.', etiq: 'd' },
  ],
  fin: { titre: 'Toolog, entre Lyon et Grenoble',
    texte: 'L’entrepôt est près de l’autoroute et de l’aéroport de Lyon : les camions partent vite vers toute la France. '
      + '(La place sur la carte est approchée : c’est le centre de la commune.)' },
};

// ─────────────────────────────────────────────────────────────── ① le quai (vue « Quai », rendu iso) — CONSTRUIT
// La palette : 2 × 2 cartons par couche, 3 couches = 12 cartons annoncés (72 paires). Un carton manque (couche du haut, au fond : invisible de face) ; un
// carton est enfoncé sur la face ARRIÈRE (il faut faire le tour). Accepter avec réserves, deux motifs.
export const BL = 'BL-77436';
export const LOT = 'LOT-PM-2611';
export const REC = 'REC-04140';
export const COMMANDE = 'CF-20261110';
export const PALETTE = {
  id: 'P1', ref: REF, nom: NOM, bl: 12, parCarton: `${PAIRES_PAR_CARTON} paires`,
  etiq: { marque: 'PUMA', ref: REF, nom: 'Puma RS-X · Blanc', poids: `Taille 42 · ${PAIRES_PAR_CARTON} paires par carton`, court: `T.42 · ${PAIRES_PAR_CARTON} paires`,
    lot: LOT, commande: COMMANDE },
  W: 2, D: 2, L: 3,
  manque: ['0,0,2'],              // couche du haut, au fond
  avarie: { '1,0,1': [0, -1] },    // couche du milieu, enfoncé sur la face arrière
  attendu: 'reserves', motifAttendu: 'avarie', motif2Attendu: 'manquant',
};
export const CARTONS_RECUS = PALETTE.W * PALETTE.D * PALETTE.L - PALETTE.manque.length;   // 11
export const QUAI = {
  id: QUAI_ID, libelle: '① Le camion arrive', rendu: 'iso',
  titre: 'Toolog (Spartoo), Saint-Quentin-Fallavier (38) — Quai 7, réception',
  destinataire: 'Spartoo · Toolog, Saint-Quentin-Fallavier',
  avertissement: 'Réels : Spartoo, son entrepôt Toolog de Saint-Quentin-Fallavier, Puma, Geodis. Le quai 7, l’horaire, le chauffeur, la référence, le lot, '
    + 'les quantités et les défauts sont <b>construits pour l’exercice</b>.',
  froid: false,
  recommencer: false,
  motifs: ['avarie', 'manquant'],
  deuxMotifs: true,
  lieu: { nom: 'Quai 7', temp: 15, refrigere: false },
  zone: { nom: 'Zone de réception' },
  dechargement: { ouverture: 0.5, parPalette: 1, par: 'chauffeur' },
  aides: { regleCouches: true, detailComptage: true, repere: true, chefDeQuai: true, consignes: true },
  camions: [{
    transporteur: 'Geodis, tournée 14', fournisseur: 'Puma France, B2B', bl: BL, arrivee: '09:00', commande: COMMANDE, lot: LOT, expedie: -1,
    parole: 'Bonjour ! Geodis, une palette de chez Puma pour Spartoo. Voilà le bon de livraison : vous me signez quand c’est bon ?',
    palettes: [PALETTE],
  }],
};

// ─────────────────────────────────────────────────────────────── ③ la réception dans le logiciel (écran Réceptions) — CONSTRUIT
// Semée au début ; l'écran reste fermé jusqu'au rangement. Le bon de réception se remplit en PAIRES (cartons × 6), comme ENT-1.1.
export function reception() {
  const now = Date.now();
  const colis = [];
  for (let n = 1; n <= CARTONS_RECUS; n++) colis.push({ no: n, sku: REF, qty: PAIRES_PAR_CARTON, etat: n === 1 ? 'abime' : 'ok' });
  return {
    no: REC, supId: 'F-PUMA', ts: now - 3600e3, transporteur: 'Geodis, tournée 14',
    bl: { no: BL, date: now - 864e5, lot: LOT, lines: [{ sku: REF, qty: PALETTE.bl * PAIRES_PAR_CARTON }] },
    colis, ctrl: null,
    colisVisibles: false, colisLibelle: '1 palette',
    consigneQuai: 'Les cartons ont été comptés au quai : reprends ce que tu as noté. Sur le bon de réception, on écrit des <b>paires</b> (6 paires par carton).',
  };
}
// Ce que le bon de réception doit dire (écrit à la main ici, pour le corrigé et les jalons) : 72 paires annoncées, 66 comptées, un carton abîmé,
// accepté sous réserve ; 66 paires entrent en stock.
export const SAISIE = { lot: LOT, annonce: 72, compte: 66, etat: 'abime', decision: 'reserve' };

// ─────────────────────────────────────────────────────────────── ② la mise en stock (vue « Plan d'entrepôt », rangement) — CONSTRUIT
// Toolog range « par catégorie et non par marque » (vérifié) : ici, côté A1 les chaussures de sport, côté A2 les chaussures de ville. Le plan à palettes,
// le stock et la rotation sont construits pour la séance.
export const GAMMES = { SPO: 'Chaussures de sport', VIL: 'Chaussures de ville' };
export const PRODUITS = {
  RSX: { nom: NOM, ref: REF, gamme: 'SPO', court: 'RS-X' },
  SUE: { nom: 'Puma Suede Classic XXI Rouge T.39', ref: 'PM-SUE-RG-39', gamme: 'SPO', court: 'Suede' },
  MOC: { nom: 'Mocassins cuir marron T.43', ref: 'VL-MOC-MA-43', gamme: 'VIL', court: 'mocassins' },
  BOT: { nom: 'Bottines cuir noir T.38', ref: 'VL-BOT-NR-38', gamme: 'VIL', court: 'bottines' },
};
export const PLAN = {
  allees: [{ id: 'A', cotes: ['A1', 'A2'] }],
  cotes: { A1: { gammes: ['SPO'], charge: { 1: 1000, 2: 600, 3: 600 } }, A2: { gammes: ['VIL'], charge: { 1: 1000, 2: 600, 3: 600 } } },
  travees: 3, niveaux: 3, emplacements: 2,
  horsService: ['A2-T01-N2-E2'],
  zones: { quais: ['QUAI 7', 'QUAI 8'] },
  rotation: {
    A: { lib: 'rapide', travees: [1], niveaux: [1, 2], texte: 'T01, niveau N1 ou N2' },
    B: { lib: 'moyenne', travees: [2], niveaux: [1, 2, 3], texte: 'T02' },
    C: { lib: 'lente', travees: [3], niveaux: [1, 2, 3], texte: 'T03' },
  },
};
const P = (produit, kg) => ({ produit, kg });
// Le stock de départ, figé : pour une palette de sport à rotation rapide, une seule bonne place libre (A1-T01-N2-E2).
export const STOCK = {
  'A1-T01-N1-E1': P('RSX', 80), 'A1-T01-N1-E2': P('SUE', 75), 'A1-T01-N2-E1': P('RSX', 80), 'A1-T01-N3-E1': P('SUE', 70),
  'A1-T02-N1-E1': P('SUE', 75), 'A1-T02-N1-E2': P('SUE', 70), 'A1-T02-N2-E1': P('RSX', 80), 'A1-T02-N2-E2': P('SUE', 75),
  'A1-T03-N1-E1': P('SUE', 70), 'A1-T03-N2-E2': P('RSX', 75),
  'A2-T01-N1-E1': P('MOC', 90), 'A2-T01-N1-E2': P('MOC', 85), 'A2-T01-N2-E1': P('BOT', 95), 'A2-T01-N3-E2': P('BOT', 90),
  'A2-T02-N1-E1': P('BOT', 95), 'A2-T02-N2-E2': P('MOC', 90), 'A2-T02-N3-E1': P('BOT', 85),
  'A2-T03-N1-E1': P('MOC', 85), 'A2-T03-N3-E1': P('BOT', 90),
};
export const PLACE_JUSTE = 'A1-T01-N2-E2';
export const PALETTES = [
  { id: 'P1', produit: 'RSX', kg: 75, rotation: 'A', reception: 'acceptée avec réserves (1 carton enfoncé, 1 carton manquant) : elle va quand même en stock' },
];
export const REGLES = {
  titre: 'Les règles',
  lignes: [
    '<b>Catégorie</b> : les chaussures de sport côté A1, les chaussures de ville côté A2.',
    '<b>Rotation</b> : A rapide → T01 (près des quais), N1 ou N2 · B moyenne → T02 · C lente → T03.',
    'Un emplacement <b>libre</b> et <b>en service</b>.',
  ],
  encadre: 'Plus un produit part souvent, plus il est rangé près des quais : le préparateur marche moins. Plan, stock et règles construits pour la séance.',
};
export const ENTREPOT = {
  id: ENTREPOT_ID, libelle: '② La mise en stock', mode: 'rangement',
  personnage: { nom: 'Sarah', role: 'élève de Terminale, ta guide', date: 'lun. 16 nov., 9 h 30',
    texte: {
      guidage: 'La palette que tu viens de contrôler est à ranger. Regarde sa catégorie et sa rotation : le bon côté, la bonne travée, un emplacement libre (ouvre « Les règles »).',
      entrainement: 'Range la palette en appliquant les règles de l’entrepôt.',
      evaluation: 'Range la palette.',
    } },
  plan: PLAN, gammes: GAMMES, produits: PRODUITS, stock: STOCK,
  criteres: [{ type: 'etat' }, { type: 'gamme' }, { type: 'rotation' }, { type: 'charge' }], regles: REGLES, palettes: PALETTES,
};

// ─────────────────────────────────────────────────────────────── lecture de la base : quand chaque étape est finie
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
const receptionDe = (db) => ((db && db.receptions) || []).find((r) => r.no === REC) || null;
const place = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID] && db.entrepots[ENTREPOT_ID].place) || {};
export const carteFaite = (db) => localiserFini(VUE_CARTE)(db, ID);
export const quaiFait = (db) => !!(etatQuai(db) && etatQuai(db).signe);
export const rangementFait = (db) => PALETTES.every((p) => !!place(db)[p.id]);
export const saisieFaite = (db) => { const r = receptionDe(db); return !!(r && r.ctrl && r.ctrl.validated); };

// ─────────────────────────────────────────────────────────────── le document (papier, encre ; le logo en tête)
export const STYLE = `
--douce:#555047;
.vl-doc{padding:14px 18px 0}
.vl-doc p{margin:0 0 8px}
.vl-logo{display:block; height:30px; width:auto; max-width:180px; margin:0 0 8px}
.vl-t{margin:0; font-size:1.08rem; font-weight:800}
.vl-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.vl-table{border-collapse:collapse; width:100%; font-size:.92rem; margin:4px 0 10px}
.vl-table th,.vl-table td{border:1px solid #d9d3c6; padding:5px 8px; text-align:left; vertical-align:top}
.vl-ul{margin:4px 0 8px; padding-left:20px; font-size:.95rem}
.vl-ul li{margin:4px 0}
.vl-art{margin:8px 0 2px; font-size:.9rem}
.vl-loi{margin:4px 0 10px; padding:6px 10px; border-left:3px solid #b9ad97; font-style:italic; font-size:.9rem}
.vl-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;
const pied = (t) => `<p class="vl-pied">${ech(t)}</p>`;
export const DOC_SPARTOO = { id: 'spartoo-251', titre: 'Spartoo et son entrepôt Toolog', court: 'Spartoo',
  html: `<article class="vl-doc" aria-label="Spartoo et son entrepôt Toolog">
    <img class="vl-logo" src="${ENTREPRISE.logo}" alt="Spartoo">
    <p class="vl-t">Spartoo : des chaussures vendues sur Internet</p>
    <p class="vl-st">L’entrepôt Toolog, à Saint-Quentin-Fallavier (Isère)</p>
    <table class="vl-table"><tbody>
      <tr><th scope="row">L’entrepôt</th><td><b>88 000 m²</b> (une douzaine de terrains de football), environ <b>150 salariés</b>, <b>2 millions de paires</b> en stock.</td></tr>
      <tr><th scope="row">Le rangement</th><td>Les produits sont rangés <b>par catégorie</b>, pas par marque. Chacun a un emplacement enregistré dans le logiciel.</td></tr>
      <tr><th scope="row">Le suivi</th><td>Une puce <b>RFID</b> sur chaque boîte : l’ordinateur sait où est chaque paire.</td></tr>
    </tbody></table>
    <p><b>Ton travail aujourd’hui :</b> recevoir une palette de chaussures Puma, en trois temps.</p>
    <table class="vl-table"><tbody>
      <tr><th scope="row">① Au quai</th><td>Contrôler <b>avant de signer</b> le bon de livraison : compter les cartons (contrôle <b>quantitatif</b>) et faire le tour de la palette pour
        voir si un carton est abîmé (contrôle <b>qualitatif</b>). Un problème : accepter <b>avec réserves</b> et les écrire sur le bon.</td></tr>
      <tr><th scope="row">② Ranger</th><td>La mise en stock dans un <b>emplacement</b> : la bonne catégorie, la bonne travée, un emplacement libre.</td></tr>
      <tr><th scope="row">③ Saisir</th><td>Dans le logiciel, l’<b>entrée en stock</b> : le lot, les paires annoncées, les paires comptées, l’état, la décision.</td></tr>
    </tbody></table>
    <p>Recevoir, contrôler, ranger, saisir : c’est le métier qu’on apprend en <b>Bac Pro Logistique</b>.</p>
    ${pied('Réels : Spartoo, son entrepôt Toolog de Saint-Quentin-Fallavier, sa surface, ses salariés, son stock, son rangement par catégorie et ses puces RFID. Construits : Sarah, le camion, la palette, le plan et les règles de la séance. Document pédagogique.')}
  </article>` };
// « Accepter avec réserves » (demande de Tristan, 14/11/2026). L'exemple de réserve n'est PAS celui de la palette (P2, 3 cartons) :
// le document explique la notion, il ne souffle pas le jalon. L133-3, 1er alinéa : recopié d'ENT-8.8 (Légifrance, LEGIARTI000021486442, relu le 17/10/2026).
export const TEXTE_L133_3 = 'La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si dans les trois '
  + 'jours, non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire '
  + 'ou par lettre recommandée, sa protestation motivée.';
export const DOC_RESERVES = { id: 'reserves-251', titre: 'Accepter avec réserves', court: 'Accepter avec réserves',
  html: `<article class="vl-doc" aria-label="Accepter avec réserves">
    <p class="vl-t">Accepter avec réserves, c’est quoi ?</p>
    <p class="vl-st">Au quai, après le contrôle, le réceptionnaire a trois choix</p>
    <table class="vl-table"><tbody>
      <tr><th scope="row">Accepter</th><td>Tout est là, rien n’est abîmé : on signe le bon de livraison, sans rien écrire.</td></tr>
      <tr><th scope="row">Accepter <b>avec réserves</b></th><td>On <b>garde</b> la marchandise, mais quelque chose ne va pas (un carton abîmé, un carton qui manque) :
        on <b>écrit le problème sur le bon</b>, puis le chauffeur signe. Une « réserve », c’est cette phrase écrite sur le bon.</td></tr>
      <tr><th scope="row">Refuser</th><td>La marchandise est inutilisable, ou ce n’est pas ce qu’on a commandé : elle repart dans le camion.</td></tr>
    </tbody></table>
    <p><b>Une bonne réserve est précise :</b> quelle palette, quoi, combien. Par exemple : « P2 : 3 cartons écrasés ».
      « Sous réserve de déballage » ne dit rien : ce n’est pas une réserve.</p>
    <p><b>Pourquoi avant que le chauffeur reparte ?</b> Le chauffeur signe tes réserves : c’est la preuve du problème, pour se faire rembourser.
      Un bon signé sans réserve veut dire « j’ai tout reçu en bon état ». Après, la loi ne laisse que trois jours pour protester :</p>
    <p class="vl-art"><b>Code de commerce, article L133-3</b> (1er alinéa ; le voiturier = le transporteur)</p>
    <p class="vl-loi">« ${TEXTE_L133_3} »</p>
    ${pied('Texte de loi réel, recopié de Légifrance. Explications écrites pour la séance. Document pédagogique.')}
  </article>` };
// « Le Bac Pro Logistique en bref » (repris de la version du 12/11/2026, d'après la fiche Onisep relevée le 12/11/2026), joint au dernier message.
export const DOC_BAC = { id: 'bac-251', titre: 'Le Bac Pro Logistique en bref', court: 'Le Bac Pro Logistique',
  html: `<article class="vl-doc" aria-label="Le Bac Pro Logistique en bref">
    <p class="vl-t">Le Bac Pro Logistique en bref</p>
    <p class="vl-st">Bac pro « Métiers de la logistique », en 1re et en Terminale, après la 2de GATL</p>
    <ul class="vl-ul">
      <li>Il forme à <b>toute la chaîne logistique</b> : recevoir, ranger, suivre les stocks, préparer les commandes, expédier, organiser une petite équipe.</li>
      <li>Tu apprends à <b>conduire des engins de manutention</b> (les chariots) en sécurité.</li>
      <li>Tu passes environ <b>20 semaines en entreprise</b> (les PFMP) sur les trois ans.</li>
      <li>Des métiers : <b>préparateur de commandes</b>, <b>magasinier cariste</b>, agent de transit, puis chef d’équipe.</li>
      <li>Après le bac : travailler, ou continuer, par exemple en <b>BTS Gestion des transports et logistique associée</b>.</li>
    </ul>
    <p>Aujourd’hui, chez Spartoo, tu as fait le travail d’un réceptionnaire : contrôler, ranger, saisir.</p>
    ${pied('D’après la fiche Onisep « Bac pro métiers de la logistique », relevée le 12/11/2026. Document pédagogique.')}
  </article>` };
export const DOCUMENTS = [DOC_SPARTOO, DOC_RESERVES, DOC_BAC];

// ─────────────────────────────────────────────────────────────── les jalons (20 points ; l'inaction vaut 0)
const ok = { status: 'ok' }, attente = { status: 'attente' };
export const GROUPES = { carte: '⓪ La carte de France', quai: '① Au quai : le contrôle', ranger: '② La mise en stock', saisie: '③ La saisie dans le logiciel' };
// Poids proposés par Claude le 14/11/2026, à valider par Tristan : carte 2, quai 9, rangement 3, saisie 6.
export const POIDS = {
  carte: 1,                                               // × 2 (région et département, au premier coup) = 2
  quai: { comptage: 3, decision: 3, reserve: 3 },         // 9 (la signature ne compte pas : passage)
  ranger: 3,                                              // 3
  saisie: { lot: 1, quantites: 3, decision: 2 },          // 6
};
const ligneQuai = (db, id) => jalonsQuai(db, QUAI).L.find((l) => l.id === id) || {};
const decidee = (db) => { const e = etatQuai(db), x = e && e.palettes && e.palettes[PALETTE.id]; return !!(x && (x.decision || x.valide)); };
const statut = (bon, essaye, detail) => (bon ? ok : essaye ? { status: 'ko', detail } : attente);
const LIB_ETAT = { ok: 'conforme', abime: 'endommagé' };
const LIB_DEC = { accepte: 'accepté', reserve: 'accepté sous réserve', refuse: 'refusé', litige: 'en litige' };
const lignePlan = (db, palette) => jalonsEntrepot(db, ENTREPOT).L.find((l) => l.palette === palette);
const vide = (x) => (x === '' || x == null ? '(vide)' : x);
// Une case de la saisie : jugée dès que la réception est validée.
const jalonSaisie = (cle, titre, juge, detail) => ({
  id: `saisie-${cle}`, titre, groupe: GROUPES.saisie, poids: POIDS.saisie[cle],
  verifier(db) {
    const r = receptionDe(db);
    if (!r || !r.ctrl || !r.ctrl.validated) return attente;
    const c = r.ctrl, x = (c.rows || {})[REF] || {};
    return juge(c, x) ? ok : { status: 'ko', detail: detail(c, x) };
  },
});
const nLot = (s) => String(s || '').toUpperCase().replace(/\s+/g, '');
export const ETAPES = [
  ...etapesLocaliser(LOCALISER, ID).map((j) => Object.assign(j, { poids: POIDS.carte, groupe: GROUPES.carte })),
  { id: 'quai-comptage', titre: 'Les cartons comptés (11 sur 12 annoncés)', groupe: GROUPES.quai, poids: POIDS.quai.comptage,
    verifier(db) { const l = ligneQuai(db, `${PALETTE.id}-comptage`); return statut(l.ok, decidee(db), `compté : ${l.fait}`); } },
  { id: 'quai-decision', titre: 'Accepter avec réserves : un carton enfoncé, un carton manquant', groupe: GROUPES.quai, poids: POIDS.quai.decision,
    verifier(db) { const l = ligneQuai(db, `${PALETTE.id}-decision`); return statut(l.ok, decidee(db), `décidé : ${l.fait}`); } },
  { id: 'quai-reserve', titre: 'Les réserves précises écrites sur le bon de livraison', groupe: GROUPES.quai, poids: POIDS.quai.reserve,
    verifier(db) { const l = ligneQuai(db, `${PALETTE.id}-reserve`), e = etatQuai(db); return statut(l.ok, !!(e && e.ecrit), `écrit : ${l.fait}`); } },
  { id: 'quai-signature', titre: 'Le bon de livraison signé par le chauffeur', groupe: GROUPES.quai, compte: false,
    verifier(db) { return quaiFait(db) ? ok : attente; } },
  ...PALETTES.map((p) => ({ id: `palette-${p.id}`, titre: 'La palette rangée à sa place (côté sport, rotation A)', groupe: GROUPES.ranger, poids: POIDS.ranger,
    verifier(db) {
      const l = lignePlan(db, p.id), ou = place(db)[p.id];
      if (l && l.ok) return ok;
      if (ou) return { status: 'ko', detail: `posée en ${ou}` };
      return attente;
    } })),
  jalonSaisie('lot', 'Le numéro de lot', (c) => nLot(c.lot) === SAISIE.lot, (c) => `lot ${vide(c.lot)} (attendu ${SAISIE.lot})`),
  jalonSaisie('quantites', 'Les paires annoncées et comptées (72 et 66)', (c, x) => x.annonce === SAISIE.annonce && x.compte === SAISIE.compte,
    (c, x) => `annoncé ${vide(x.annonce)} (attendu ${SAISIE.annonce}), compté ${vide(x.compte)} (attendu ${SAISIE.compte})`),
  jalonSaisie('decision', 'L’état et la décision (endommagé, accepté sous réserve)', (c, x) => x.etat === SAISIE.etat && x.decision === SAISIE.decision,
    (c, x) => `état ${LIB_ETAT[x.etat] || '(vide)'} (attendu ${LIB_ETAT[SAISIE.etat]}), décision ${LIB_DEC[x.decision] || '(vide)'} (attendu ${LIB_DEC[SAISIE.decision]})`),
];

// ─────────────────────────────────────────────────────────────── les messages de Sarah (au tu)
const SARAH = { nom: 'Sarah', mail: 'sarah@lycee.example' };
function heure(db, hhmm) {
  const [a, m, j] = JOUR.iso.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '08:45'), from: SARAH.nom, fromMail: SARAH.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJETS = {
  accueil: 'Bienvenue chez Spartoo !', quai: 'Le camion de Puma arrive', ranger: 'On range la palette', saisir: 'On saisit l’entrée en stock', fin: 'Bravo, la réception est finie',
};
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ receptions: [reception()], mails: [mail(prenom, SUJETS.accueil,
    `Salut ${prenom} ! Je m’appelle Sarah, je suis en Terminale Bac Pro Logistique.\n\n`
      + 'Aujourd’hui, tu es réceptionnaire chez Toolog, l’entrepôt de Spartoo, le site qui vend des chaussures sur Internet. Un camion va arriver avec une palette '
      + 'de chaussures Puma : c’est toi qui la reçois, la ranges et l’entres dans le stock.\n\n'
      + 'D’abord, lis le document « Spartoo » (joint), puis ouvre « Carte de France » dans le menu : où est l’entrepôt ?\n\nSarah',
    { db, extra: { pieces: [DOC_SPARTOO.id] } })] }),
  declencheurs: [
    { id: 'quai', quand: carteFaite, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.quai,
      'Le camion Geodis recule au quai 7. Le chauffeur va te tendre le bon de livraison : il annonce ce que Puma a envoyé, pas forcément ce qui est arrivé.\n\n'
        + 'Avant de signer, on contrôle :\n'
        + '- on compte les cartons (le contrôle quantitatif) : autant que sur le bon ?\n'
        + '- on fait le tour de la palette (le contrôle qualitatif) : un carton abîmé ?\n\n'
        + 'S’il y a un problème, on accepte « avec réserves » et on les écrit sur le bon, avant que le chauffeur reparte. '
        + 'Relis le document joint « Accepter avec réserves » si tu as un doute.\n\n'
        + 'Ouvre « ① Le camion arrive ».\n\nSarah',
      { db, heure: '09:00', extra: { pieces: [DOC_RESERVES.id] } })] }) },
    { id: 'ranger', quand: quaiFait, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.ranger,
      'Le chauffeur est reparti avec son bon signé. La palette attend en zone de réception : il faut la mettre en stock dans un emplacement.\n\n'
        + 'Ouvre « ② La mise en stock » : prends la palette, choisis la travée sur le plan, puis l’emplacement. Le bon côté (sport ou ville), la bonne travée '
        + '(plus un produit part souvent, plus il est près des quais), un emplacement libre.\n\nSarah',
      { db, heure: '09:20' })] }) },
    { id: 'saisir', quand: rangementFait, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.saisir,
      'La palette est rangée. Dernière étape : le logiciel doit savoir ce qui est entré dans le stock.\n\n'
        + `Ouvre « Réceptions » dans le menu, puis la réception ${REC} (bon de livraison ${BL}). Écris le numéro de lot, les paires annoncées sur le bon, `
        + 'les paires que tu as comptées, l’état et ta décision, puis valide.\n\n'
        + 'Attention : sur le bon de livraison, ce sont des cartons ; dans le logiciel, on compte des paires. Un carton = 6 paires. '
        + 'Et on saisit ce qui est vraiment arrivé, pas ce que dit le bon.\n\nSarah',
      { db, heure: '09:30' })] }) },
    { id: 'fin', quand: saisieFaite, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.fin,
      'Bravo ! Tu as fait une réception complète : contrôler au quai, écrire les réserves, ranger, saisir l’entrée en stock. C’est le quotidien d’un '
        + 'réceptionnaire, et c’est ce qu’on apprend en Bac Pro Logistique (avec la préparation des commandes, les expéditions, les transports, la conduite des chariots…).\n\n'
        + 'Le document joint « Le Bac Pro Logistique » te dit tout en cinq lignes. '
        + 'Si tu as des questions sur la filière, pose-les à ton professeur : les élèves de 1re et de Terminale sont là aussi pour te répondre.\n\nSarah',
      { db, heure: '09:40', extra: { pieces: [DOC_BAC.id] } })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
export const LEXIQUE = {
  'bon de livraison': 'Le document que le chauffeur remet avec la marchandise : ce que le fournisseur annonce avoir envoyé. On le signe après avoir contrôlé.',
  'réserves': 'Ce qu’on écrit sur le bon de livraison quand la marchandise n’est pas conforme (manquant, abîmé), avant de signer.',
  'avec réserves': 'Accepter avec réserves : on garde la marchandise, mais on écrit sur le bon ce qui ne va pas (quelle palette, quoi, combien), puis le chauffeur signe. C’est la preuve pour se faire rembourser.',
  'lot': 'Le numéro qui suit une fabrication : il permet de retrouver d’où vient un produit.',
  'rotation': 'La vitesse à laquelle un produit sort du stock : rapide (A), moyenne (B), lente (C).',
  'RFID': 'Une puce qui se lit par radio, sans la voir : elle dit quel produit est où.',
};
export const MENTION = 'Réels : Spartoo et son entrepôt Toolog de Saint-Quentin-Fallavier (surface, salariés, stock, rangement par catégorie, RFID), Puma, Geodis, '
  + 'déjà vérifiés pour les séances Spartoo de Prepalog. Construits : Sarah, le quai, le camion, le bon de livraison, le lot, la palette et ses défauts, le plan, le stock et les règles de rangement.';
export const ACCUEIL = {
  titre: 'Et si tu choisissais la Logistique ?',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Sarah', 'Menu Messagerie : Sarah, élève de Terminale, te guide chez Spartoo.'],
    ['⓪ La carte de France', 'Où est Toolog, l’entrepôt de Spartoo ? La région, puis le département.'],
    ['① Le camion arrive', 'Contrôle la palette avant de signer : compte les cartons, fais le tour.'],
    ['② La mise en stock', 'Range la palette dans un emplacement du plan.'],
    ['③ La saisie', 'Menu Réceptions : saisis l’entrée en stock, en paires.'],
    ['Bon à savoir', MENTION],
  ],
};
export const SUITE = [
  { vue: 'localiser', libelle: 'Carte de France', fait: carteFaite },
  { vue: 'quai', libelle: '① Le camion arrive', fait: quaiFait },
  { vue: 'entrepot', libelle: '② La mise en stock', fait: rangementFait },
  { vue: 'receptions', libelle: '③ La saisie dans le logiciel', fait: saisieFaite },
];
export const OPTIONS = {
  suite: SUITE,
  menu: ['receptions'],
  exercice: 'La réception',
  sansTrame: 'Tout se fait à l’écran',
  SUPPLIERS,
  SUP_BY_ID,
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  localiser: LOCALISER,
  quai: QUAI,
  entrepot: ENTREPOT,
  fermetures: {
    quai: { ouvertSi: carteFaite, message: 'Après la carte de France' },
    entrepot: { ouvertSi: quaiFait, message: 'Après le camion' },
    receptions: { ouvertSi: rangementFait, message: 'Après la mise en stock' },
  },
  finFige: 'La carte se joue au premier essai, et le bon de livraison signé ne se corrige plus.',
};
