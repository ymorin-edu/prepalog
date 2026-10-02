// Données d'ESSAI de l'écran « Inventaire » (core/types/inventaire.js) — chantier E, 02/10/2026.
//
// Une entreprise FICTIVE, « LogiDémo », fournitures de bureau : elle n'est pas une séance et
// n'apparaît dans aucun menu. Elle sert à la page `outils/essai-inventaire.html` et au bloc de
// tests `outils/test/inventaire.mjs`. Volontairement PAS Cdiscount : l'écran doit servir à toute
// entreprise, et les données de Cdiscount appartiennent au chantier D.
//
// Elle est écrite dans le format de la fiche `claude/prepalog-inventaire-format.md`, catalogue
// simple compris — c'est donc aussi l'exemple complet de ce format.
//
// Les trois écarts reprennent les trois cas de la maquette validée :
//   AGR-24-6   un retour client saisi, resté en zone retours   → ne pas régulariser (en rayon)
//   CAL-SCI    une casse non saisie                            → régulariser, motif « Casse »
//   CLE-USB-32 une erreur de comptage                          → recompter (l'écart disparaît)
// Taux d'écart attendu : (3 + 1 + 3) ÷ 191 × 100 = 3,7 %.

import { catalogueSimple } from '../contenus/entreprise-commun.js';

export const ENTREPRISE = {
  nom: 'LogiDémo',
  sousTitre: "Entreprise fictive d'essai — magasin de fournitures",
  logo: null,
};
export const VOCAB = {
  unit: 'article', unitPl: 'articles',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'logidemo.example',
};
export const THEME = { accent: '#2f5d8a' };

export const SUPPLIERS = [
  { id: 'F001', brand: 'Bureau Pro', name: 'Bureau Pro, grossiste', adr: '1 rue de l\'Essai', cp: '30000', ville: 'Nîmes',
    contact: 'Paul Essai', tel: '04 00 00 00 00', email: 'commandes@bureaupro.example', delai: 3, franco: 300, pay: '30 jours net', moq: 10 },
];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};

export const CATALOGUE = catalogueSimple([
  { ref: 'RAM-A4-80', designation: 'Ramette papier A4, 80 g', categorie: 'Papier', prix: 6.90, cout: 3.20, emplacement: 'A-01-1', stock: 40, min: 10, max: 60, fournisseur: 'F001' },
  { ref: 'STY-BL-50', designation: 'Stylos bille bleus, boîte de 50', categorie: 'Écriture', prix: 12.90, cout: 6.50, emplacement: 'A-01-2', stock: 25, min: 5, max: 40, fournisseur: 'F001' },
  { ref: 'AGR-24-6', designation: 'Agrafeuse 24/6', categorie: 'Petit matériel', prix: 15.90, cout: 7.80, emplacement: 'A-02-1', stock: 12, min: 4, max: 20, fournisseur: 'F001' },
  { ref: 'CLA-LEV-75', designation: 'Classeur à levier, dos 75 mm', categorie: 'Classement', prix: 3.90, cout: 1.70, emplacement: 'A-02-2', stock: 30, min: 10, max: 50, fournisseur: 'F001' },
  { ref: 'CAL-SCI', designation: 'Calculatrice scientifique', marque: 'Calcul+', categorie: 'Petit matériel', prix: 29.90, cout: 14.90, emplacement: 'A-03-1', stock: 10, min: 3, max: 15, fournisseur: 'F001' },
  { ref: 'CLE-USB-32', designation: 'Clé USB 32 Go', categorie: 'Informatique', prix: 11.90, cout: 5.40, emplacement: 'A-03-2', stock: 20, min: 5, max: 30, fournisseur: 'F001' },
  { ref: 'SUR-JAU-4', designation: 'Surligneurs jaunes, lot de 4', categorie: 'Écriture', prix: 4.50, cout: 1.90, emplacement: 'A-04-1', stock: 36, min: 10, max: 50, fournisseur: 'F001' },
  { ref: 'POC-A4-100', designation: 'Pochettes perforées A4, paquet de 100', categorie: 'Classement', prix: 5.90, cout: 2.60, emplacement: 'A-04-2', stock: 18, min: 5, max: 30, fournisseur: 'F001' },
]);

const JOUR = 864e5;
// Les dates sont relatives à l'ouverture : le dernier inventaire il y a dix jours.
export const DEPUIS = () => Date.now() - 10 * JOUR;

export const INVENTAIRE = {
  id: 'INV-ESSAI-01',
  titre: 'Inventaire tournant — allée A',
  sousTitre: '8 emplacements',
  source: 'releve',
  aveugle: true,
  ecarts: 'eleve',
  correction: 'detaillee',
  motifObligatoire: true,
  lignes: [
    { ref: 'RAM-A4-80', compte: 40 },
    { ref: 'STY-BL-50', compte: 25 },
    { ref: 'AGR-24-6', compte: 11, attendu: 'rayon',
      explication: "Les 3 agrafeuses du retour R-0042 existent : elles attendent en zone retours. Régulariser ferait disparaître une marchandise vendable ; il faut la contrôler et la remettre en A-02-1." },
    { ref: 'CLA-LEV-75', compte: 30 },
    { ref: 'CAL-SCI', compte: 7, attendu: 'regul', motif: 'Casse',
      explication: 'La calculatrice tombée est détruite : le stock doit baisser de 1, avec le motif « Casse ».' },
    { ref: 'CLE-USB-32', compte: 23, recompte: 20, attendu: 'recompter',
      explication: "Aucun mouvement n'explique +3 ; le recomptage donne 20 : trois clés 64 Go étaient rangées avec les 32 Go." },
    { ref: 'SUR-JAU-4', compte: 36 },
    { ref: 'POC-A4-100', compte: 18 },
  ],
};

export function baseDeDepart() {
  const stock = {};
  CATALOGUE.VARIANTS.forEach((v) => { stock[v.sku] = v.qty0; });
  return { v: 1, created: Date.now(), stock, moves: [], mails: [], orders: [], seq: 1, customers: [], suppliers: [] };
}

// Le volet : les mouvements depuis le dernier inventaire, le relevé et les deux indices.
export const VOLET = {
  id: 'inventaire-essai',
  semer(prenom) {
    const now = Date.now();
    return {
      mouvements: [
        { ts: now - 6 * JOUR, sku: 'AGR-24-6', type: 'Préparation', delta: -1, ref: 'CMD-000311', by: 'Inès' },
        { ts: now - 4 * JOUR, sku: 'AGR-24-6', type: 'Retour client', delta: 3, ref: 'R-0042', by: 'Marc' },
        { ts: now - 5 * JOUR, sku: 'CAL-SCI', type: 'Préparation', delta: -2, ref: 'CMD-000305', by: 'Léa' },
      ],
      mails: [
        { folder: 'in', ts: now - 2 * 3600e3, from: 'Marc, équipe de comptage', fromMail: 'marc@logidemo.example', to: prenom,
          subject: 'Relevé de comptage — allée A', kind: 'releve', inventaire: 'INV-ESSAI-01',
          text: 'Bonjour,\n\nVoici le relevé du comptage de ce matin.\n\nMarc', remarque: 'A-03-2 : rangé un peu en vrac, compté vite.' },
        { folder: 'in', ts: now - 3600e3, from: "Chef d'équipe", fromMail: 'chef@logidemo.example', to: prenom,
          subject: 'Calculatrice cassée', kind: 'text',
          text: "Une calculatrice est tombée du rayon A-03-1 hier, écran fendu, jetée. Pas eu le temps de la saisir." },
        { folder: 'in', ts: now - 3000e3, from: 'Zone retours', fromMail: 'retours@logidemo.example', to: prenom,
          subject: 'Retours à contrôler', kind: 'text',
          text: 'Trois agrafeuses (retour R-0042) attendent en zone retours, étiquette « à contrôler ».' },
      ],
    };
  },
};

// L'univers complet à donner à `creerEntreprise`, avec des réglages d'inventaire modifiables.
export function univers(reglages = {}) {
  return {
    ENTREPRISE, VOCAB, CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM, THEME,
    baseDeDepart, etapes: [], exercice: "Essai de l'écran Inventaire", volet: VOLET,
    inventaire: Object.assign({}, INVENTAIRE, { depuis: DEPUIS() }, reglages),
  };
}
