// Cdiscount — ENT-2.4 « Régularisé à l'aveugle ». Entraînement (erreur induite), C1.6.
//
// Troisième séance de l'environnement Cdiscount. Après ENT-2.1 (lire les mouvements) et
// ENT-2.3 (faire un inventaire), l'élève découvre l'envers de l'inventaire : un AJUSTEMENT passé
// sans enquête peut effacer un vrai problème. Ici, un magasinier de nuit a compté l'allée B,
// trouvé quatre mixeurs de moins que le système, et passé « −4, Démarque inconnue » sans regarder
// plus loin ; son message pousse à conclure que « c'est de la démarque, ça arrive ». C'est
// l'ERREUR INDUITE de la séance.
//
// Ce qui s'est vraiment passé : la palette Gardéo reçue six jours plus tôt (REC-26-0447)
// portait quatre mixeurs de moins que le bon de livraison (deux cartons de quatre au lieu de
// trois). Le réceptionnaire a validé la quantité du BL sans additionner les colis. Le stock du
// système était donc faux dès la réception ; l'ajustement l'a remis d'accord avec les étagères,
// et a ENFOUI la preuve : un litige fournisseur jamais déclaré, 50,40 € payés pour rien, et une
// « démarque inconnue » de 4 mixeurs qui n'en est pas une.
//
// Un deuxième ajustement de la semaine (un grille-pain cassé, motif « Casse ») est, lui,
// JUSTIFIÉ : un constat de casse existe. Sans lui, l'élève conclurait que « tout ajustement est
// suspect » ; avec lui, il apprend à distinguer un ajustement documenté d'un ajustement orphelin.
//
// L'élève répond à la cheffe d'équipe en recopiant huit lignes à intitulé ; les jalons les lisent
// (même mécanique qu'ENT-2.1). Rien n'est à changer dans le moteur : l'écran Stock, les
// Mouvements, les Réceptions (BL contre colis) et la messagerie suffisent.
//
// Piste de sortie (`claude/prepalog-erreurs-et-phases.md`, règle 1) : l'élève n'est jamais
// bloqué — il peut répondre à tout moment, et un jalon faux ne fait tomber que lui. Le délai de
// réclamation (huit jours) donne un enjeu sans rien verrouiller.
//
// Volume : 6 références, 11 documents, 22 mouvements (ENT-2.1 : 5, 10, 19 ; ENT-2.3 : 8, 16, 27).
//
// RECADRÉE LE 04/10/2026 (brief `docs/briefs/ENT-2.4-regularise-export.md`, chantier C7) : l'élève
// COMMENCE PAR LE TABLEUR — il exporte les ajustements du mois (écran Extractions), repère avec SI ceux
// qui n'ont pas de justificatif, les compte par motif avec NB.SI, dépose son fichier (retour
// d'entraînement : « n résultats justes sur m ») — puis enquête comme avant. Un SECOND PLAIGNANT,
// un vendeur de la place de marché, pointe la même réception : les 12 mixeurs de REC-26-0447 ont
// été livrés par Gardéo pour son compte. Deux jalons tableur en tête, les six d'avant ensuite.
//
// Vérifié (03/10/2026) : Cdiscount stocke pour des vendeurs de sa place de marché (stockage,
// emballage, expédition, retours), qui suivent leur stock dans leur espace vendeur.
// CONSTRUIT : tout le reste — dont le vendeur (Julien Mounet) et sa boutique (Bassin Cuisine),
// FICTIFS, annoncés comme tels.
//
// Niveau (`db.aisance`, jamais montré) : un CONFIRMÉ exporte 30 ajustements au lieu de 20 (dix de
// plus, tous avec un document) ; toujours une seule ligne sans justificatif (les mixeurs).
//
// Tout est CONSTRUIT (voir l'en-tête de `contenus/cdiscount.js`).

import { CATALOGUE as CATALOGUE_COMPLET, CUSTOMERS, EQUIPE, mailBienvenue, sousCatalogue } from './cdiscount.js';
import { ligne, nombres } from './cdiscount-mouvements.js';
import { resultatDepot, statutExport, TOUS } from '../core/types/export-tableur.js';
import { ponderer } from './ponderation.js';

/* ------------------------------------------------------------------ périmètre */

// L'allée B (maison et cuisine) : une autre zone que les deux séances précédentes.
export const MODELES = ['BOU-17L', 'GRP-2F', 'MIX-PLG', 'MUL-4P', 'PIL-AA-8', 'VEI-LED'];
export const CATALOGUE = sousCatalogue(MODELES);

const [BOU, GRP, MIX, MUL, PIL, VEI] = MODELES;

// Le stock compté au dernier inventaire, il y a douze jours : la base de départ de l'élève.
export const INVENTAIRE_PRECEDENT = { [BOU]: 8, [GRP]: 6, [MIX]: 6, [MUL]: 20, [PIL]: 40, [VEI]: 12 };
export const JOURS_DEPUIS_INVENTAIRE = 12;

export const VOLUME = { references: 6, documents: 11, mouvements: 22 };

// Délai pendant lequel Gardéo accepte une réclamation, en jours après la livraison. La séance se
// passe six jours après : il en reste deux.
export const DELAI_RECLAMATION = 8;

/* ------------------------------------------------------------------ les documents */

// `lignes` : [référence, quantité du BON DE LIVRAISON, cartons réellement posés sur le quai].
// Le stock entre à la quantité du BL (c'est ce que le réceptionnaire a validé) ; les colis, eux,
// disent ce qui est arrivé. Pour les mixeurs de Gardéo, les deux ne sont pas d'accord : 12 sur
// le BL, 4 + 4 = 8 dans les colis. Partout ailleurs, les colis font le compte.
const RECEPTIONS = [
  { no: 'REC-26-0441', supId: 'F06', j: 9, h: 9.6, bl: 'BL-VL-70558', lot: 'LOT-VL-2704', transporteur: 'Voltéo, livraison directe',
    lignes: [[MUL, 20, [10, 10]], [PIL, 40, [20, 20]]] },
  { no: 'REC-26-0447', supId: 'F07', j: 6, h: 9.4, bl: 'BL-GD-30912', lot: 'LOT-GD-2711', transporteur: 'Transports Lasserre, tournée Mios',
    lignes: [[BOU, 12, [4, 4, 4]], [GRP, 8, [4, 4]], [MIX, 12, [4, 4]]] },
];

// La réception qui porte le manque, et l'article : la séance les connaît, les jalons les
// RELISENT dans la base de l'élève (`manques`).
export const RECEPTION_LITIGE = 'REC-26-0447';

const COMMANDES = [
  { no: 'CMD-732602', client: 'C0005', ship: 'COL', j: 8, h: 10.5, lignes: [[BOU, 2], [MUL, 1]] },
  { no: 'CMD-732608', client: 'C0010', ship: 'REL', j: 7, h: 14, lignes: [[PIL, 3], [GRP, 1]] },
  { no: 'CMD-732611', client: 'C0003', ship: 'COL', j: 5, h: 11, lignes: [[MIX, 1], [BOU, 1]] },
  { no: 'CMD-732624', client: 'C0014', ship: 'CHR', j: 5, h: 15.5, lignes: [[MIX, 2]] },
  { no: 'CMD-732632', client: 'C0007', ship: 'COL', j: 4, h: 10.25, lignes: [[MUL, 2], [PIL, 2]] },
  { no: 'CMD-732640', client: 'C0012', ship: 'REL', j: 4, h: 14.5, lignes: [[GRP, 1], [MIX, 1]] },
  { no: 'CMD-732655', client: 'C0018', ship: 'COL', j: 4, h: 16, lignes: [[MIX, 1], [VEI, 2]] },
  { no: 'CMD-732668', client: 'C0016', ship: 'COL', j: 1, h: 10, lignes: [[BOU, 1], [VEI, 1]] },
];

export const TYPES = {
  reception: 'Entrée : réception',
  preparation: 'Sortie : préparation',
  ajustement: 'Ajustement inventaire',
};

// Les deux ajustements de la semaine, tous deux passés par le magasinier de nuit.
//   - MIX −4 « Démarque inconnue » : l'ajustement ORPHELIN, celui qui cache le litige ;
//   - GRP −1 « Casse » : l'ajustement JUSTIFIÉ, un constat de casse existe (DEM-26-0036).
export const ID_CAMPAGNE = 'INV-2026-47';
export const AJUSTEMENT_ORPHELIN = { sku: MIX, delta: -4, motif: 'Démarque inconnue', j: 3, h: 6.5, no: 'AJ-26-0217', doc: '' };
export const AJUSTEMENT_JUSTIFIE = { sku: GRP, delta: -1, motif: 'Casse', j: 2, h: 7.2, no: 'AJ-26-0219', doc: 'DEM-26-0036' };

// Le vendeur de la place de marché (FICTIF, comme sa boutique) : les 12 mixeurs de REC-26-0447
// ont été livrés par Gardéo à Cestas pour son compte.
export const VENDEUR = { nom: 'Julien Mounet', boutique: 'Bassin Cuisine', mail: 'j.mounet@bassin-cuisine.example' };

/* ------------------------------------------------------------------ l'historique du mois
 * Les autres ajustements du mois, dans tout l'entrepôt (allées A, B, C), TOUS avec un document :
 * DEM-… constat de casse, BP-… bon de préparation (erreur de prélèvement), REC-… réception (erreur
 * de réception), FR-… fiche de recomptage (démarque inconnue établie après recomptage). Ceux de
 * l'allée B datent d'avant le dernier inventaire (la base de l'élève commence là). Le 9e champ :
 * seulement dans l'export d'un élève confirmé. [N°, jour, heure, référence, quantité, motif, document, par, confirmé]
 */
const KEVIN = 'Kevin Larrieu', SOFIANE = 'Sofiane Brettes', NADIA = 'Nadia Ferrand', SAMIR_NOM = 'Samir Benkhelifa';
export const AJUSTEMENTS_AUTRES = [
  ['AJ-26-0190', 24, 8.5, 'TAP-YOG', -1, 'Casse', 'DEM-26-0008', KEVIN],
  ['AJ-26-0191', 23, 10, 'PIL-AA-8', -2, 'Erreur de prélèvement', 'BP-731811', SOFIANE],
  ['AJ-26-0192', 23, 16, 'COR-SAU', -1, 'Casse', 'DEM-26-0010', KEVIN, true],
  ['AJ-26-0193', 22, 9, 'CLE-64G', 2, 'Erreur de réception', 'REC-26-0402', NADIA],
  ['AJ-26-0194', 21, 14, 'BAL-FOOT', -1, 'Démarque inconnue', 'FR-26-0014', SAMIR_NOM],
  ['AJ-26-0195', 20, 11, 'ECO-BT-01', -1, 'Casse', 'DEM-26-0013', KEVIN],
  ['AJ-26-0196', 20, 17, 'GOU-ISO-75', -1, 'Erreur de prélèvement', 'BP-731850', SOFIANE, true],
  ['AJ-26-0197', 19, 8, 'VEI-LED', -1, 'Casse', 'DEM-26-0015', KEVIN],
  ['AJ-26-0198', 18, 13, 'LAM-FRO', 1, 'Erreur de prélèvement', 'BP-731877', SOFIANE],
  ['AJ-26-0199', 17, 9.5, 'ELA-FIT-3', -2, 'Démarque inconnue', 'FR-26-0016', SAMIR_NOM, true],
  ['AJ-26-0200', 17, 15, 'AMP-LED-E27', -1, 'Casse', 'DEM-26-0018', KEVIN],
  ['AJ-26-0201', 16, 10, 'TAP-YOG', -3, 'Erreur de réception', 'REC-26-0411', NADIA],
  ['AJ-26-0202', 15, 14, 'SUP-VOIT', -1, 'Erreur de prélèvement', 'BP-731912', SOFIANE],
  ['AJ-26-0203', 15, 18, 'HUB-USB-4', 1, 'Erreur de réception', 'REC-26-0414', NADIA, true],
  ['AJ-26-0204', 14, 8, 'GOU-ISO-75', -1, 'Casse', 'DEM-26-0021', KEVIN],
  ['AJ-26-0206', 13, 16, 'CHG-20W', -1, 'Démarque inconnue', 'FR-26-0019', SAMIR_NOM],
  ['AJ-26-0207', 11, 9, 'BAL-FOOT', -2, 'Erreur de prélèvement', 'BP-731968', SOFIANE],
  ['AJ-26-0208', 10, 14, 'COR-SAU', -2, 'Démarque inconnue', 'FR-26-0021', SAMIR_NOM],
  ['AJ-26-0209', 10, 17, 'CAS-FIL-01', -1, 'Casse', 'DEM-26-0025', KEVIN, true],
  ['AJ-26-0210', 9, 10, 'LAM-FRO', -1, 'Erreur de prélèvement', 'BP-732005', SOFIANE, true],
  ['AJ-26-0211', 8, 15, 'ELA-FIT-3', 4, 'Erreur de réception', 'REC-26-0438', NADIA],
  ['AJ-26-0212', 7, 9, 'SOU-SF-02', -1, 'Casse', 'DEM-26-0029', KEVIN],
  ['AJ-26-0213', 6, 13, 'COQ-UNI-01', -1, 'Erreur de prélèvement', 'BP-732098', SOFIANE, true],
  ['AJ-26-0214', 5, 8, 'TAP-YOG', -1, 'Démarque inconnue', 'FR-26-0024', SAMIR_NOM],
  ['AJ-26-0215', 4, 11, 'CLA-SF-01', -1, 'Erreur de réception', 'REC-26-0449', NADIA, true],
  ['AJ-26-0216', 4, 16, 'GOU-ISO-75', -1, 'Erreur de prélèvement', 'BP-732301', SOFIANE],
  ['AJ-26-0218', 3, 12, 'BAL-FOOT', -1, 'Démarque inconnue', 'FR-26-0027', SAMIR_NOM, true],
  ['AJ-26-0220', 1, 10, 'LAM-FRO', -1, 'Casse', 'DEM-26-0038', KEVIN, true],
];

// Le magasinier de nuit (inventé, adresse en .example).
export const SAMIR = { nom: 'Samir Benkhelifa', role: 'magasinier de nuit', mail: 's.benkhelifa@cdiscount.example' };

// Le motif qu'aurait dû porter l'écart, dans la liste de l'écran Inventaire.
export const MOTIF_JUSTE = 'Erreur de réception';

/* ------------------------------------------------------------------ outils */

const JOUR = 3600e3 * 24;
const minuit = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const quand = (now, j, h) => minuit(now) - j * JOUR + Math.round(h * 3600e3);
const bp = (cmd) => 'BP-' + cmd.replace('CMD-', '');
const nrm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const euros = (n) => n.toFixed(2).replace('.', ',') + ' €';

export function dateInventaire(now = Date.now()) {
  return quand(now, JOURS_DEPUIS_INVENTAIRE, 7);
}

/* ------------------------------------------------------------------ l'export des ajustements */

export const ID_EXPORT = 'ajustements';
export const ID_DEPOT = 'analyse';
export const COLONNES = ['Date', 'Type', 'N° mouvement', 'Référence', 'Désignation', 'Allée', 'Quantité', 'Motif', 'Document', 'Saisi par'];
const designation = (sku) => { const v = CATALOGUE_COMPLET.VM[sku]; return v ? [v.model.brand, v.model.name].filter(Boolean).join(' ') : sku; };
const allee = (sku) => { const v = CATALOGUE_COMPLET.VM[sku]; return v ? v.loc.slice(0, 1) : ''; };
const estConfirme = (db) => !!db && db.aisance === 'confirme';

// Le jour de la séance, relu dans la base (fonction pure) : l'ajustement de Samir date de J-3.
const jourDeSeance = (db) => {
  const a = ((db && db.moves) || []).find((m) => m.type === TYPES.ajustement && m.sku === AJUSTEMENT_ORPHELIN.sku);
  return a ? a.ts + AJUSTEMENT_ORPHELIN.j * JOUR - Math.round(AJUSTEMENT_ORPHELIN.h * 3600e3) : minuit(Date.now());
};

// Les ajustements du mois de CET élève : ceux de sa base (les deux de Samir, et tout ajustement
// qu'il aurait passé lui-même à la console : sans document), plus l'historique du mois.
export function lignesAjustements(db) {
  const now = jourDeSeance(db);
  const connus = { [AJUSTEMENT_ORPHELIN.sku]: AJUSTEMENT_ORPHELIN, [AJUSTEMENT_JUSTIFIE.sku]: AJUSTEMENT_JUSTIFIE };
  let autre = 300;
  const base = ((db && db.moves) || []).filter((m) => m.type === TYPES.ajustement).map((m) => {
    const k = connus[m.sku] && m.by === SAMIR.nom ? connus[m.sku] : null;
    const motif = String(m.ref || '').includes('·') ? String(m.ref).split('·').pop().trim() : '';
    return { ts: m.ts, no: k ? k.no : `AJ-26-0${autre++}`, sku: m.sku, qty: m.delta, motif, doc: k ? k.doc : '', par: m.by || '' };
  });
  const histo = AJUSTEMENTS_AUTRES.filter((a) => !a[8] || estConfirme(db))
    .map(([no, j, h, sku, qty, motif, doc, par]) => ({ ts: quand(now, j, h), no, sku, qty, motif, doc, par }));
  return [...base, ...histo].sort((a, b) => a.ts - b.ts || (a.no < b.no ? -1 : 1))
    .map((a) => [a.ts, TYPES.ajustement, a.no, a.sku, designation(a.sku), allee(a.sku), a.qty, a.motif, a.doc, a.par]);
}

// Les lignes À ÉCARTER de la liste « Mouvements de stock » (04/10/2026, export filtré) : les
// réceptions et préparations de la base de l'élève, quelques mouvements du mois dans les autres
// allées, et les ajustements du MOIS PRÉCÉDENT (plus de 30 jours, tous avec un document). Aucune
// ne passe la demande (type Ajustement inventaire, 30 derniers jours) : un test le vérifie.
export const MOUVEMENTS_VOISINS = [
  // [jour, heure, type, N°, référence, quantité, par]
  [22, 9, 'reception', 'REC-26-0405', 'CAB-USBC-1M', 40, 'Équipe quai'],
  [18, 14, 'preparation', 'BP-731871', 'BAL-FOOT', -2, 'Équipe préparation'],
  [14, 10.5, 'preparation', 'BP-731920', 'CHG-20W', -1, 'Équipe préparation'],
  [11, 8.5, 'reception', 'REC-26-0420', 'LAM-FRO', 24, 'Équipe quai'],
  [7, 15, 'preparation', 'BP-732071', 'TAP-YOG', -1, 'Équipe préparation'],
  [2, 11, 'preparation', 'BP-732688', 'CLE-64G', -3, 'Équipe préparation'],
];
export const AJUSTEMENTS_MOIS_PRECEDENT = [
  // [N°, jour, heure, référence, quantité, motif, document, par]
  ['AJ-26-0171', 44, 9, 'CHG-20W', -1, 'Casse', 'DEM-26-0001', KEVIN],
  ['AJ-26-0174', 42, 15, 'PIL-AA-8', -2, 'Erreur de prélèvement', 'BP-731602', SOFIANE],
  ['AJ-26-0177', 40, 10, 'BAL-FOOT', 1, 'Erreur de réception', 'REC-26-0371', NADIA],
  ['AJ-26-0180', 38, 14, 'VEI-LED', -1, 'Démarque inconnue', 'FR-26-0009', SAMIR_NOM],
  ['AJ-26-0183', 36, 8.5, 'LAM-FRO', -1, 'Casse', 'DEM-26-0004', KEVIN],
  ['AJ-26-0186', 34, 16, 'ECO-BT-01', -2, 'Erreur de prélèvement', 'BP-731690', SOFIANE],
  ['AJ-26-0188', 32, 11, 'GOU-ISO-75', -1, 'Casse', 'DEM-26-0006', KEVIN],
];
export function lignesAEcarter(db) {
  const now = jourDeSeance(db);
  const base = ((db && db.moves) || []).filter((m) => m.type !== TYPES.ajustement)
    .map((m) => [m.ts, m.type, m.ref, m.sku, designation(m.sku), allee(m.sku), m.delta, '', '', m.by || '']);
  const voisins = MOUVEMENTS_VOISINS.map(([j, h, t, no, sku, q, par]) => [quand(now, j, h), TYPES[t], no, sku, designation(sku), allee(sku), q, '', '', par]);
  const anciens = AJUSTEMENTS_MOIS_PRECEDENT.map(([no, j, h, sku, q, motif, doc, par]) => [quand(now, j, h), TYPES.ajustement, no, sku, designation(sku), allee(sku), q, motif, doc, par]);
  return [...base, ...voisins, ...anciens];
}

export const AIDE = 'SI(test ; si vrai ; si faux) — NB.SI(plage ; ce qu’on compte). Une cellule vide s’écrit "" .';

// Les comptes par motif (calculés, jamais en dur) : ceux de la demande, ou ceux de l'export que
// l'élève a réellement fait (`propres`, objets colonne → valeur) — une erreur d'export ne se paie
// qu'une fois.
export function parMotif(db, propres = null) {
  const o = {};
  const motifs = propres ? propres.map((l) => l.Motif) : lignesAjustements(db).map((l) => l[7]);
  motifs.forEach((m) => { if (m) o[m] = (o[m] || 0) + 1; });
  return o;
}

export function controles(db, propres = null) {
  return [
    { type: 'colonne', id: 'averifier', libelle: 'Colonne « À vérifier » (fonction SI)', feuille: 'Mouvements',
      titre: 'À vérifier', cle: 'N° mouvement', attendu: (l) => (l.Document ? '' : 'À VÉRIFIER'), fonctions: ['IF'] },
    { type: 'table', id: 'synthese', libelle: 'Synthèse : nombre d’ajustements par motif (fonction NB.SI)', feuille: 'Synthèse',
      cle: 'Motif', colonne: 'Nombre', attendu: parMotif(db, propres), fonctions: ['COUNTIF'] },
  ];
}

export const TABLEUR = {
  aide: AIDE,
  exports: [{
    id: ID_EXPORT, liste: 'Mouvements de stock', fichier: 'cdiscount-mouvements-de-stock.xlsx',
    // Niveau 2 (premier entraînement) : le message de Nadia donne les critères en clair.
    indications: 2, autres: lignesAEcarter, aujourdhui: jourDeSeance,
    filtres: [
      { id: 'type', libelle: 'Type de mouvement', colonne: 'Type', tous: 'Tous', juste: TYPES.ajustement },
      { id: 'allee', libelle: 'Allée', colonne: 'Allée', tous: 'Toutes', juste: TOUS },
      { id: 'periode', libelle: 'Période', periode: 'Date', juste: '30j' },
    ],
    feuilles: [{ nom: 'Mouvements', colonnes: COLONNES, types: { Date: 'date' }, lignes: lignesAjustements },
      // L'amorce de la synthèse : les en-têtes seuls (entraînement : l'élève écrit les motifs).
      { nom: 'Synthèse', colonnes: ['Motif', 'Nombre'], lignes: () => [] }],
  }],
  depot: { id: ID_DEPOT, export: ID_EXPORT, libelle: 'Déposer mon fichier', retour: 'entrainement', controles },
};

/* ------------------------------------------------------------------ base et volet */

export const EXERCICE = 'Exercice 4 : contrôler les ajustements de la semaine';

export const ACCUEIL = {
  titre: 'Un ajustement doit toujours avoir une cause',
  kpis: ['mail', 'stock'],
  etapes: [
    ['Lire le message de Nadia Ferrand', 'Messagerie. Elle vous confie les ajustements de la semaine et vous dit ce qu’elle attend dans votre réponse.'],
    ['Commencer par le tableur', 'Extractions : la liste « Mouvements de stock », avec les critères que donne Nadia, puis « Exporter ». Colonne « À vérifier » (SI), feuille Synthèse (NB.SI), puis menu Fichiers pour déposer.'],
    ['Retrouver les ajustements', 'Menu Stock, onglet Mouvements : un ajustement est une ligne « Ajustement inventaire », avec son motif et son auteur.'],
    ['Chercher un document pour chacun', 'Un constat de casse, une réception, une commande… Un ajustement sans document est un ajustement orphelin.'],
    ['Remonter à l’origine de l’écart', 'Reprenez les mouvements de l’article, puis ouvrez le document d’entrée : le bon de livraison dit ce qui était annoncé, les colis disent ce qui est arrivé.'],
    ['Chiffrer ce qui manque', 'Quantité manquante × prix d’achat de l’article (menu Catalogue).'],
    ['Répondre à Nadia Ferrand', 'Recopiez les huit lignes de son message dans votre réponse, complétées.'],
  ],
};

export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: { ...INVENTAIRE_PRECEDENT }, moves: [], mails: [], orders: [], seq: 1,
    customers: [], suppliers: [], _depart: [] };
}

const CLIENTS = Object.fromEntries(CUSTOMERS.map((c) => [c.id, c]));

// Les huit lignes à recopier sont celles que lisent les jalons : on n'évalue pas sur une règle
// cachée.
export const LIGNES_REPONSE = [
  'Ajustement à revoir :',
  'Ajustement justifié :',
  'Réception concernée :',
  'Annoncé sur le bon de livraison :',
  'Réellement reçu :',
  'Valeur du manque :',
  'Motif exact :',
  'Suite à donner :',
];

function mailMission(prenom, now) {
  return { folder: 'in', ts: now - 3600e3 * 2, from: `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`,
    fromMail: EQUIPE.cheffe.mail, to: prenom,
    subject: `Ajustements de la semaine : à vérifier avant la clôture (${ID_CAMPAGNE})`, kind: 'text',
    text: `Bonjour ${prenom},\n\nCe mois-ci, la démarque inconnue me paraît élevée, et un vendeur de la place de marché se plaint (je vous transfère son message). Commencez par le tableur : dans Extractions, liste « Mouvements de stock », exportez les ajustements du mois avec ces critères : Type de mouvement « Ajustement inventaire », Allée « Toutes », Période « 30 derniers jours ». Ajoutez une colonne « À vérifier » qui affiche À VÉRIFIER quand un ajustement n'a pas de document justificatif (fonction SI), et, dans la feuille Synthèse, comptez les ajustements par motif (fonction NB.SI). Déposez votre fichier (menu Fichiers). Ensuite seulement, enquêtez.\n\nSamir a passé deux ajustements dans l'allée B cette semaine (campagne ${ID_CAMPAGNE}). Je clôture le mois ce soir et je ne signe pas un ajustement dont je ne connais pas la cause : un ajustement change le stock pour de bon, et il efface la trace de ce qui s'est passé.\n\nPour chacun :\n\n1. Retrouvez-le dans le système (Stock, onglet Mouvements : lignes « Ajustement inventaire »).\n2. Cherchez le document qui le justifie : un constat de casse, une réception, une commande. Lisez vos messages.\n3. Si un ajustement ne se justifie par aucun document, remontez l'historique de l'article : réceptions et commandes. Au menu Réceptions, le bon de livraison dit ce qui était annoncé, et les colis disent ce qui est arrivé : additionnez-les.\n\nRépondez à ce message en recopiant ces huit lignes et en les complétant :\n\n${LIGNES_REPONSE[0]} (la référence de l'article et la quantité de l'ajustement qui ne se justifie pas)\n${LIGNES_REPONSE[1]} (la référence de l'article et le document qui le justifie)\n${LIGNES_REPONSE[2]} (le numéro REC-… où l'écart est né)\n${LIGNES_REPONSE[3]} (la quantité annoncée pour cet article)\n${LIGNES_REPONSE[4]} (la quantité réellement arrivée, d'après les colis)\n${LIGNES_REPONSE[5]} (la quantité manquante × le prix d'achat, en euros)\n${LIGNES_REPONSE[6]} (le motif qui aurait dû figurer sur l'ajustement, d'après la colonne Motif de l'export)\n${LIGNES_REPONSE[7]} (ce qu'il faut faire maintenant, et auprès de qui)\n\nUne ligne par information, s'il vous plaît.\n\nAttention au temps : notre fournisseur n'accepte une réclamation que dans les ${DELAI_RECLAMATION} jours qui suivent la livraison.\n\nMerci,\n${EQUIPE.cheffe.nom}` };
}

// Le vendeur, transféré par Nadia à l'ouverture (pas de déclencheur). Il pointe la même réception.
// « le 1er octobre », pas « le 1 octobre ».
const jour = (t) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }).replace(/^1 /, '1er ');
function mailVendeur(prenom, now, tRec, tOrph) {
  return { folder: 'in', ts: now - 3600e3 * 2.5, from: `${EQUIPE.cheffe.nom}, ${EQUIPE.cheffe.role}`,
    fromMail: EQUIPE.cheffe.mail, to: prenom, subject: `TR : Stock affiché — ${VENDEUR.boutique}`, kind: 'text',
    text: `Bonjour ${prenom},\n\nJe vous transfère le message d'un vendeur de notre place de marché : ses articles sont stockés chez nous, il suit son stock dans son espace vendeur.\n\n${EQUIPE.cheffe.nom}\n\n----- Message transféré -----\nDe : ${VENDEUR.nom}, ${VENDEUR.boutique} (vendeur de la place de marché) <${VENDEUR.mail}>\n\nBonjour, je vends sur votre place de marché des mixeurs plongeants Gardéo, stockés chez vous à Cestas. Gardéo vous en a livré 12 pour mon compte le ${jour(tRec)}. Depuis le ${jour(tOrph)}, mon espace vendeur n'en affiche plus que 8. Je n'en ai vendu aucun depuis. Le stock affiché dans mon espace ne correspond pas à ce que je vous ai envoyé. Où sont passés mes 4 mixeurs ?\n\n${VENDEUR.nom}, ${VENDEUR.boutique}\n\n(Vendeur et boutique fictifs, inventés pour l'exercice.)` };
}

export const VOLET = {
  id: 'regularise-1',
  semer(prenom, db) {
    const now = Date.now();
    const mouvements = [];
    const receptions = [];
    const orders = [];

    RECEPTIONS.forEach((r) => {
      const ts = quand(now, r.j, r.h);
      const rows = {};
      let n = 0;
      const colis = [];
      r.lignes.forEach(([s, q, cartons]) => {
        // Le réceptionnaire a validé la quantité du BL : le stock entre à `q`, même quand les
        // colis (`cartons`) n'en font pas le compte. C'est précisément l'erreur de la séance.
        rows[s] = { annonce: q, compte: q, etat: 'ok', decision: 'accepte' };
        cartons.forEach((c) => colis.push({ no: ++n, sku: s, qty: c, etat: 'ok' }));
        mouvements.push({ sku: s, type: TYPES.reception, delta: q, ref: r.no, lot: r.lot, ts, by: EQUIPE.quai.nom });
      });
      receptions.push({ no: r.no, supId: r.supId, ts, transporteur: r.transporteur,
        bl: { no: r.bl, date: ts - JOUR, lot: r.lot, lines: r.lignes.map(([s, q]) => ({ sku: s, qty: q })) },
        colis, ctrl: { lot: r.lot, rows, validated: true, at: ts + 3600e3 * 0.5 } });
    });

    COMMANDES.forEach((c) => {
      const ts = quand(now, c.j, c.h);
      const rows = {};
      c.lignes.forEach(([s, q]) => {
        const v = CATALOGUE.VM[s];
        rows[s] = { seen: '', loc: v.loc, qty: q, status: 'ok' };
        mouvements.push({ sku: s, type: TYPES.preparation, delta: -q, ref: bp(c.no), ts, by: 'Équipe préparation' });
      });
      orders.push({ no: c.no, date: ts - 3600e3 * 5, customerId: c.client, ship: c.ship,
        lines: c.lignes.map(([s, q]) => ({ sku: s, qty: q })),
        prep: { rows, doc: true, validated: true, complete: true, at: ts, par: 'Équipe préparation' } });
    });

    // Les deux ajustements, passés par le magasinier de nuit : le motif est écrit dans l'origine,
    // comme le fait l'écran Inventaire (« INV-… · Motif »).
    const tOrph = quand(now, AJUSTEMENT_ORPHELIN.j, AJUSTEMENT_ORPHELIN.h);
    mouvements.push({ sku: AJUSTEMENT_ORPHELIN.sku, type: TYPES.ajustement, delta: AJUSTEMENT_ORPHELIN.delta,
      ref: `${ID_CAMPAGNE} · ${AJUSTEMENT_ORPHELIN.motif}`, ts: tOrph, by: SAMIR.nom });
    const tJust = quand(now, AJUSTEMENT_JUSTIFIE.j, AJUSTEMENT_JUSTIFIE.h);
    mouvements.push({ sku: AJUSTEMENT_JUSTIFIE.sku, type: TYPES.ajustement, delta: AJUSTEMENT_JUSTIFIE.delta,
      ref: `${ID_CAMPAGNE} · ${AJUSTEMENT_JUSTIFIE.motif}`, ts: tJust, by: SAMIR.nom });

    // Le stock « après » de chaque mouvement se calcule dans l'ordre où le moteur les reçoit.
    mouvements.sort((a, b) => a.ts - b.ts);

    // Le « vu en stock » du bon de préparation : le stock juste avant la sortie.
    const courant = { ...((db && db.stock) || INVENTAIRE_PRECEDENT) };
    mouvements.forEach((m) => {
      if (m.type === TYPES.preparation) {
        const o = orders.find((x) => bp(x.no) === m.ref);
        if (o) o.prep.rows[m.sku].seen = courant[m.sku] || 0;
      }
      courant[m.sku] = (courant[m.sku] || 0) + m.delta;
    });

    const tRec = quand(now, RECEPTIONS[1].j, RECEPTIONS[1].h);
    const aDejaBienvenue = ((db && db.mails) || []).some((m) => /^Bienvenue à l’entrepôt/.test(m.subject || ''));
    const mails = [
      ...(aDejaBienvenue ? [] : [mailBienvenue(prenom, now - 3600e3 * 30, ['stock', 'commandes', 'receptions', 'console', 'extractions'])]),
      // L'INDICE de la livraison : un cariste a vu un vide sur la palette, sans y donner suite. Il
      // l'écrit après coup, quand la réception était déjà validée.
      { folder: 'in', ts: tRec + 3600e3 * 4, from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: `Palette Gardéo ${RECEPTION_LITIGE} : un trou dans la couche de mixeurs ?`, kind: 'text',
        text: `Bonjour,\n\nCe matin, en déchargeant la palette Gardéo (${RECEPTION_LITIGE}), j'ai trouvé un vide dans la dernière couche, du côté des mixeurs : comme s'il manquait un carton. Je n'avais pas le bon de livraison sous la main et la réception était déjà validée, alors je n'ai rien dit.\n\nJe ne sais pas si ça compte.\n\n${EQUIPE.quai.nom}` },
      // L'ERREUR INDUITE : le magasinier de nuit conclut trop vite.
      { folder: 'in', ts: tOrph + 3600e3 * 0.5, from: `${SAMIR.nom}, ${SAMIR.role}`, fromMail: SAMIR.mail, to: prenom,
        subject: 'Inventaire de nuit : écart sur les mixeurs régularisé', kind: 'text',
        text: `Bonjour,\n\nCette nuit, j'ai compté l'allée B. Pour les mixeurs plongeants (${MIX}), il y en avait 9 sur l'étagère alors que le système en annonçait 13.\n\nJ'ai regardé le bac, j'ai recompté deux fois, rien de plus. J'ai donc passé un ajustement de ${AJUSTEMENT_ORPHELIN.delta}, motif « ${AJUSTEMENT_ORPHELIN.motif} » (${ID_CAMPAGNE}).\n\nC'est de la démarque, ça arrive avec les petits articles. Pas besoin d'aller plus loin.\n\n${SAMIR.nom}` },
      // L'ajustement JUSTIFIÉ : le constat de casse existe.
      { folder: 'in', ts: tJust - 3600e3 * 1.5, from: `${EQUIPE.quai.nom}, ${EQUIPE.quai.role}`, fromMail: EQUIPE.quai.mail, to: prenom,
        subject: `Constat de casse ${AJUSTEMENT_JUSTIFIE.doc}`, kind: 'text',
        text: `Bonjour,\n\nConstat de casse.\n\nDocument : ${AJUSTEMENT_JUSTIFIE.doc}\nArticle : ${GRP}, grille-pain 2 fentes\nQuantité : ${-AJUSTEMENT_JUSTIFIE.delta}\nCirconstance : un carton est tombé du chariot en allée B-03 ; le boîtier est fendu, la prise brisée, invendable.\nDécision : sorti du stock et mis au rebut. Je n'ai pas eu le temps de le saisir : Samir l'a passé en ajustement « ${AJUSTEMENT_JUSTIFIE.motif} » ce matin.\n\n${EQUIPE.quai.nom}` },
      mailVendeur(prenom, now, tRec, tOrph),
      mailMission(prenom, now),
    ];

    return { receptions, orders, mouvements, mails };
  },
};

/* ============================ Suivi de l'exercice ============================
 * Six jalons, sur le modèle d'ENT-2.1 : ils lisent la réponse de l'élève à Nadia Ferrand et
 * retiennent son meilleur essai. Aucun retour n'est donné à l'élève pendant l'exercice.
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente aucune réponse envoyée
 *   na      l'élève n'en est pas encore là (la semaine n'est pas semée)
 *
 * **Rien n'est écrit en dur** : l'ajustement orphelin, la réception, les quantités et la valeur
 * du manque se DÉDUISENT de la base de l'élève — le manque est la différence entre le bon de
 * livraison et les colis de chaque réception, l'ajustement orphelin est celui qui porte sur
 * l'article en manque, le justifié est l'autre. Si la séance change ses chiffres, les jalons
 * suivent.
 *
 * Lecture d'une ligne : la DERNIÈRE ligne de la réponse qui porte l'intitulé ; on en retire les
 * références (MIX-PLG, REC-26-0447…) et les dates, et on lit les nombres qui restent. Pour un
 * résultat, c'est le DERNIER nombre de la ligne qui compte : « 4 × 12,60 = 50,40 € » se lit
 * 50,40, et le calcul reste visible pour l'enseignant.
 */

const ajustements = (db) => (db.moves || []).filter((m) => m.type === TYPES.ajustement);

// Les écarts entre bon de livraison et colis, réception par réception. Une séance bien construite
// en a un seul ; les jalons les lisent tous.
export function manques(db) {
  const out = [];
  (db.receptions || []).forEach((r) => {
    ((r.bl && r.bl.lines) || []).forEach((l) => {
      const recu = (r.colis || []).filter((c) => c.sku === l.sku).reduce((n, c) => n + c.qty, 0);
      if (recu < l.qty) out.push({ rec: r.no, sku: l.sku, annonce: l.qty, recu, manque: l.qty - recu });
    });
  });
  return out;
}

const coutDe = (sku) => (CATALOGUE.VM[sku] ? CATALOGUE.VM[sku].model.cost : 0);

// Le litige de la base de l'élève : le manque dont l'article porte un ajustement. Null tant que
// la semaine n'est pas semée.
export function litige(db) {
  const m = manques(db);
  const adj = ajustements(db);
  const l = m.find((x) => adj.some((a) => a.sku === x.sku));
  if (!l) return null;
  return { ...l, valeur: l.manque * coutDe(l.sku), ajustement: adj.find((a) => a.sku === l.sku),
    justifies: adj.filter((a) => a.sku !== l.sku) };
}

function reponses(db) {
  return (db.mails || []).filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(EQUIPE.cheffe.mail))
    .sort((a, b) => a.ts - b.ts);
}

function meilleur(mails, juger) {
  const evals = mails.map(juger);
  return evals.find((e) => e.ok) || evals[evals.length - 1];
}

const envoye = (msg) => `Réponse envoyée le ${new Date(msg.ts).toLocaleString('fr-FR')}.\n`;

// Le dernier nombre décimal d'une ligne (« 50,40 € » → 50.4), références et dates retirées.
function dernierDecimal(l) {
  const propre = String(l || '')
    .replace(/\b[A-Z]{2,}[A-Z0-9]*(?:-[A-Z0-9]+)+\b/gi, ' ')
    .replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, ' ')
    .replace(/(\d),(\d)/g, '$1.$2');
  const n = propre.match(/\d+(?:\.\d+)?/g);
  return n ? parseFloat(n[n.length - 1]) : null;
}
const dernierEntier = (l) => { const n = nombres(l); return n.length ? n[n.length - 1] : null; };

// Exécute `juger(msg, L)` sur chaque réponse, avec le litige déjà relu dans la base ; renvoie le
// statut d'un jalon.
function jalon(db, juger) {
  const L = litige(db);
  if (!L) return { status: 'na' };
  const mails = reponses(db);
  if (!mails.length) return { status: 'attente' };
  const best = meilleur(mails, (msg) => { const r = juger(msg, L); return { ts: msg.ts, ...r, detail: envoye(msg) + r.detail }; });
  return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
}

// Les deux jalons du tableur lisent le MEILLEUR dépôt (entraînement : redépôt possible). Ils ne
// conditionnent rien : un élève qui rate le tableur peut réussir l'enquête.
const jalonControle = (id) => (db) => {
  const r = resultatDepot(db, ID_DEPOT);
  const c = r.depose ? r.controles[id] : null;
  if (!c) return { status: 'attente' };
  return { status: c.ok ? 'ok' : 'ko', detail: `${c.justes} juste(s) sur ${c.total}.` };
};

const JALONS = [
  { id: 'export', titre: 'Les ajustements du mois exportés (bons critères)', verifier: (db) => statutExport(db, ID_EXPORT, ID_DEPOT) },
  { id: 'averifier', titre: 'Ajustements sans justificatif repérés avec SI', verifier: jalonControle('averifier') },
  { id: 'parmotif', titre: 'Ajustements comptés par motif avec NB.SI', verifier: jalonControle('synthese') },
  {
    id: 'ajustements',
    titre: 'Ajustement orphelin repéré, ajustement justifié reconnu',
    verifier(db) {
      return jalon(db, (msg, L) => {
        const lr = String(ligne(msg.text, LIGNES_REPONSE[0]) || '').toUpperCase();
        const lj = String(ligne(msg.text, LIGNES_REPONSE[1]) || '').toUpperCase();
        const revoirOk = lr.includes(L.ajustement.sku) && !L.justifies.some((a) => lr.includes(a.sku));
        // Le justifié est reconnu à son article ET à son document : citer l'article seul, c'est
        // deviner ; il faut avoir trouvé le constat de casse dans la messagerie.
        const docsJustifies = L.justifies.map((a) => (a.sku === AJUSTEMENT_JUSTIFIE.sku ? AJUSTEMENT_JUSTIFIE.doc : null)).filter(Boolean);
        const justifieOk = L.justifies.length > 0 && L.justifies.every((a) => lj.includes(a.sku))
          && docsJustifies.every((d) => lj.includes(d)) && !lj.includes(L.ajustement.sku);
        return { ok: revoirOk && justifieOk,
          detail: `À revoir : ${L.ajustement.sku} — ${revoirOk ? 'repéré' : (lr ? 'pas celui-là, ou les deux confondus' : 'ligne absente')}.\n`
            + `Justifié : ${L.justifies.map((a) => a.sku).join(', ')} — ${justifieOk ? 'reconnu avec son constat' : (lj ? 'article ou document manquant' : 'ligne absente')}.` };
      });
    },
  },
  {
    id: 'reception',
    titre: 'Réception où l’écart est né retrouvée',
    verifier(db) {
      const autres = [...new Set((db.moves || []).filter((m) => m.type === TYPES.reception).map((m) => m.ref))];
      return jalon(db, (msg, L) => {
        const l = String(ligne(msg.text, LIGNES_REPONSE[2]) || '').toUpperCase();
        const intrus = autres.filter((r) => r !== L.rec && l.includes(r));
        const ok = l.includes(L.rec) && !intrus.length;
        return { ok, detail: l === '' ? 'Ligne « Réception concernée » absente.'
          : `Réception ${L.rec} : ${l.includes(L.rec) ? 'citée' : 'absente'}`
            + (intrus.length ? ` ; cite aussi ${intrus.join(', ')}, qui n'a aucun écart` : '') };
      });
    },
  },
  {
    id: 'quantites',
    titre: 'Quantité annoncée et quantité reçue relevées (BL contre colis)',
    verifier(db) {
      return jalon(db, (msg, L) => {
        const la = ligne(msg.text, LIGNES_REPONSE[3]);
        const lc = ligne(msg.text, LIGNES_REPONSE[4]);
        const a = dernierEntier(la), c = dernierEntier(lc);
        return { ok: a === L.annonce && c === L.recu,
          detail: `Annoncé : ${a === null ? '(aucun nombre)' : a} — attendu ${L.annonce}.\nReçu : ${c === null ? '(aucun nombre)' : c} — attendu ${L.recu}.` };
      });
    },
  },
  {
    id: 'valeur',
    titre: 'Valeur du manque calculée (quantité × prix d’achat)',
    verifier(db) {
      return jalon(db, (msg, L) => {
        const l = ligne(msg.text, LIGNES_REPONSE[5]);
        const lu = dernierDecimal(l);
        return { ok: lu !== null && Math.abs(lu - L.valeur) < 0.005,
          detail: l === null ? 'Ligne « Valeur du manque » absente.'
            : `Lu en fin de ligne : ${lu === null ? '(aucun nombre)' : String(lu).replace('.', ',')} — attendu ${String(L.valeur.toFixed(2)).replace('.', ',')} (${L.manque} × ${String(coutDe(L.sku).toFixed(2)).replace('.', ',')} €).` };
      });
    },
  },
  {
    id: 'motif',
    titre: 'Bon motif retrouvé : l’écart est une erreur de réception, pas une démarque',
    verifier(db) {
      return jalon(db, (msg) => {
        const l = nrm(ligne(msg.text, LIGNES_REPONSE[6]) || '');
        // « Erreur de réception » (le motif de la liste) ou une formulation équivalente.
        const ok = /erreur de reception|livraison incompl|reception incompl|manque a la reception/.test(l);
        return { ok, detail: l === '' ? 'Ligne « Motif exact » absente.'
          : `Motif lu : « ${l.trim()} » — attendu « ${MOTIF_JUSTE} » (ou livraison incomplète).` };
      });
    },
  },
  {
    id: 'suite',
    titre: 'Suite à donner : réclamer auprès du fournisseur',
    verifier(db) {
      return jalon(db, (msg) => {
        const l = nrm(ligne(msg.text, LIGNES_REPONSE[7]) || '');
        const ok = /reclam|litige|\bavoir\b|\breserve/.test(l);
        return { ok, detail: l === '' ? 'Ligne « Suite à donner » absente.'
          : `Suite lue : « ${l.trim()} » — attendu une réclamation (ou litige, avoir) auprès du fournisseur.` };
      });
    },
  },
];

// NOTE PONDÉRÉE SUR 20 (poids validés par Tristan le 10/10/2026, lot 4 de `docs/briefs/NOTATION-ponderation.md`). Le cœur : trouver que l'écart est une erreur de réception et non une démarque, puis la suite à donner ; le tableur pèse 5 points, l'enquête 15.
export const BAREME = {
  export: [1.5],
  averifier: [1.5],
  parmotif: [2],
  ajustements: [3],
  reception: [2],
  quantites: [2],
  valeur: [2],
  motif: [3.5],
  suite: [2.5],
};
export const ETAPES = ponderer(JALONS, BAREME, 'ENT-2.4');

// Pour les tests et le corrigé : ce que doit dire une réponse juste, relu dans la base.
export function reponseAttendue(db) {
  const L = litige(db);
  if (!L) return null;
  const j = L.justifies[0];
  return [
    `${LIGNES_REPONSE[0]} ${L.ajustement.sku}, ${L.ajustement.delta}`,
    `${LIGNES_REPONSE[1]} ${j.sku}, constat de casse ${AJUSTEMENT_JUSTIFIE.doc}`,
    `${LIGNES_REPONSE[2]} ${L.rec}`,
    `${LIGNES_REPONSE[3]} ${L.annonce}`,
    `${LIGNES_REPONSE[4]} ${L.recu}`,
    `${LIGNES_REPONSE[5]} ${L.manque} × ${coutDe(L.sku).toFixed(2).replace('.', ',')} = ${euros(L.valeur)}`,
    `${LIGNES_REPONSE[6]} ${MOTIF_JUSTE}`,
    `${LIGNES_REPONSE[7]} Réclamation auprès de Gardéo (livraison incomplète), dans les ${DELAI_RECLAMATION} jours`,
  ].join('\n');
}
