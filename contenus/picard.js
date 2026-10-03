// Picard (Sainghin-en-Mélantois) — l'univers commun des séances ENT-4.x (réception de surgelés, C1.4).
//
// Ce fichier porte ce qui est COMMUN aux quatre séances : identité, charte, lieu (quai et chambre
// froide), réglages du quai qui ne changent pas d'une séance à l'autre. Chaque séance apporte son
// camion, ses palettes, ses aides et ses jalons : voir `contenus/picard-ent41.js`.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (brief `docs/briefs/ENT-4.1-picard-premier-camion.md` §2)
//
// Vérifié (Cowork, recherche web du 03/10/2026) : Picard et son logo ; l'entrepôt de
// Sainghin-en-Mélantois (59), exploité par GXO ; le contrôle de température à chaque réception ;
// −18 °C à cœur, tolérance brève −15 °C au déchargement, sans durée chiffrée dans les textes ;
// « sous réserve de déballage » sans valeur juridique ; réserves à confirmer au transporteur
// sous 3 jours (art. L133-3 du Code de commerce).
//
// Construit, et annoncé comme tel à l'écran : le quai 32 et son numéro, le fournisseur
// « Surgelés du Littoral », le transporteur « Transports Givrex », le chauffeur (silhouette sans
// visage), les produits, colisages, lots, températures, durées, le repère hors froid de 30 min
// pour un quai réfrigéré à +4 °C, les coûts des gestes. Le chef de quai est un personnage fictif.
//
// Charte relevée sur le site de Picard le 03/10/2026 (docs/briefs/picard/LISEZMOI.md) : accent
// #0011AC (bleu des titres et boutons), fond glacier très pâle. Le vert « juste » reste celui de
// Prepalog, distinct du bleu.

import { catalogueSimple } from './entreprise-commun.js';

export const ENTREPRISE = {
  id: 'picard',
  nom: 'Picard',
  sousTitre: 'Entrepôt de Sainghin-en-Mélantois (59) — réception',
  exercice: 'Réceptionner des surgelés au quai',
  logo: './contenus/trames/logos/picard.svg',
};

export const VOCAB = {
  unit: 'carton', unitPl: 'cartons',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'picard-quai.example',
};

export const THEME = {
  accent: '#0011ac',
  clair: { fond: '#eef5f7', panneau: '#fbfdfd', survol: '#f3f8fa', filet: '#d6e1e6' },
};

// Le lieu, commun aux quatre séances (construit, sauf l'entrepôt).
export const LIEU = {
  nom: 'Quai 32', temp: 4, refrigere: true,
  chambre: { nom: 'Chambre froide n° 2', temp: -23 },
};
export const PHOTOS = {
  arrivee: './contenus/picard/quai-remorques.jpg',
  quai: './contenus/picard/quai-interieur.jpg',
  porte: { x0: 455, x1: 786, y0: 352, y1: 585 }, // coordonnées dans la photo 1280 × 853
};
// Durée du déchargement (construite) : 30 s d'ouverture + 1 min par palette. Mêmes valeurs pour
// les exercices de planification de quai.
export const DECHARGEMENT = { ouverture: 0.5, parPalette: 1 };
export const COUTS = { ticket: 2, sonder: 1, tourner: 0.5, etiquette: 0.5, compter: 1, rentrer: 3, ligne: 1, signer: 1 };
export const SEUIL_HORS_FROID = 30;

export const AVERTISSEMENT = 'Réels : Picard, son logo, l’entrepôt de Sainghin-en-Mélantois (exploité par GXO) et le contrôle de '
  + 'température à chaque réception. Le quai 32 et son numéro sont un décor. Fournisseur, transporteur, produits, colisages, '
  + 'températures, durées et seuils sont <b>construits pour l’exercice</b>.';
export const BON_A_SAVOIR = 'Bon à savoir : la réserve écrite sur le BL ne suffit pas. Pour une avarie ou un manquant, il faut la '
  + 'confirmer au transporteur par <b>lettre recommandée dans les 3 jours</b> (hors jours fériés), sinon on ne peut plus rien lui '
  + 'réclamer (Code de commerce, art. L133-3).';

// Le relevé de l'enregistreur, toutes les 15 min, tel que l'imprime le camion : stable vers
// −21 °C, avec la remontée de la séance (`remontee` : minute → température). Généré, pas recopié.
export function releves(remontee = {}, fin = 360) {
  const L = [];
  for (let m = 15; m <= fin; m += 15) {
    const t = remontee[m] != null ? remontee[m] : -21 + Math.sin(m / 23) * 0.4;
    L.push([`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`, Math.round(t * 10) / 10]);
  }
  return L;
}

// Le catalogue de l'environnement : les produits livrés (articles simples, stock nul au départ).
export function catalogue(produits) {
  return catalogueSimple(produits.map((p) => ({ ref: p.ref, designation: p.nom, categorie: 'Surgelés',
    prix: 0, cout: 0, emplacement: '', stock: 0, fournisseur: 'F-SDL' })));
}
export const SUPPLIERS = [
  { id: 'F-SDL', brand: 'Surgelés du Littoral', name: 'Surgelés du Littoral (fictif)', adr: '', cp: '', ville: '',
    contact: '', tel: '', email: 'commandes@surgeles-littoral.example', delai: 2, franco: 0, pay: '30 jours net', moq: 1 },
];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};

export function baseDeDepart() {
  return {
    v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
    customers: [], suppliers: [], seq: 1, _depart: [],
  };
}
