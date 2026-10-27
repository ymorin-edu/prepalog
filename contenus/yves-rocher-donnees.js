// Yves Rocher — les DONNÉES des séances ENT-23.1 à 23.6 (2de Bac Pro, plateforme de La Villouët à La Gacilly) : les produits (adresse de
// prélèvement, colisage), les commandes des boutiques, le chariot multi-commandes, le contrôle d'un colis, les réclamations, les demandes du pic,
// les retours, et les trois jeux de l'évaluation. Tout est CONSTRUIT (produits génériques, adresses, colisages, quantités, boutiques servies, jours
// de livraison) ; le réel (la plateforme, ses chiffres, ses trois façons de préparer, le chariot de quatre ou cinq commandes) est dans `yves-rocher.js`.
//
// ⚠ Les jeux de l'évaluation (23.6) sont une fonction de la graine de l'élève ET de ce fichier : ne rien y changer pendant qu'une classe joue.

import { empreinte, graineDeBase } from '../core/tirage.js';

// ─────────────────────────────────────────── les produits (adresse = allée-emplacement de la zone de préparation au détail)
export const PRODUITS = {
  huile: { id: 'huile', nom: 'Huile sèche 100 ml', parCarton: 12, adr: '02-07' },
  gel: { id: 'gel', nom: 'Gel douche 200 ml', parCarton: 24, adr: '03-12' },
  shamp: { id: 'shamp', nom: 'Shampooing 300 ml', parCarton: 12, adr: '05-04' },
  lait: { id: 'lait', nom: 'Lait corps 390 ml', parCarton: 12, adr: '07-02' },
  creme: { id: 'creme', nom: 'Crème mains 75 ml', parCarton: 36, adr: '07-15' },
  deo: { id: 'deo', nom: 'Déodorant bille 50 ml', parCarton: 30, adr: '09-08' },
  savon: { id: 'savon', nom: 'Savon solide 80 g', parCarton: 40, adr: '11-06' },
  masque: { id: 'masque', nom: 'Masque visage 75 ml', parCarton: 24, adr: '12-10' },
  rouge: { id: 'rouge', nom: 'Rouge à lèvres', parCarton: 48, adr: '14-03' },
  vernis: { id: 'vernis', nom: 'Vernis à ongles', parCarton: 60, adr: '14-11' },
  edt: { id: 'edt', nom: 'Eau de toilette 100 ml', parCarton: 6, adr: '16-05' },
  soin: { id: 'soin', nom: 'Crème de jour 50 ml', parCarton: 12, adr: '18-09' },
};
export const nomDe = (p) => PRODUITS[p].nom;
export const nombreFr = (x) => String(x).replace('.', ',');

// ─────────────────────────────────────────── préparer une ligne : cartons complets, détail, ou les deux
export const TYPES = [
  { v: 'carton', lib: 'En cartons complets' },
  { v: 'detail', lib: 'Au détail, dans le carton panaché' },
  { v: 'mixte', lib: 'Des cartons complets, et le reste au détail' },
];
export const cartons = (L) => Math.floor(L.qte / PRODUITS[L.prod].parCarton);
export const detail = (L) => L.qte % PRODUITS[L.prod].parCarton;
export const typeDe = (L) => (detail(L) === 0 ? 'carton' : cartons(L) === 0 ? 'detail' : 'mixte');
// L'ordre de prélèvement : allée par allée, dans l'ordre des numéros, puis emplacement par emplacement.
export const ordreDe = (L) => L.slice().sort((a, b) => (PRODUITS[a.prod].adr < PRODUITS[b.prod].adr ? -1 : 1)).map((x) => x.prod);
const lg = (prod, qte) => ({ prod, qte });

// ─────────────────────────────────────────── ENT-23.1 : la commande de la boutique de Rennes (les lignes dans l'ordre du bon : alphabétique)
export const CMD231 = { boutique: 'Rennes', lignes: [lg('creme', 10), lg('edt', 15), lg('gel', 48), lg('rouge', 30), lg('savon', 40)] };
export const VOYAGE = [
  { v: 'usine', lib: 'Une usine du groupe fabrique le gel douche' },
  { v: 'plateforme', lib: 'La plateforme de La Villouët le stocke et prépare les commandes' },
  { v: 'boutique', lib: 'Un camion livre la boutique' },
  { v: 'cliente', lib: 'Une cliente l’achète en boutique' },
];
export const VOYAGE_DEPART = ['boutique', 'cliente', 'usine', 'plateforme'];
export const DESTINATAIRES = [
  { v: 'boutiques', lib: 'Les boutiques Yves Rocher de France' },
  { v: 'usines', lib: 'Les usines du groupe' },
  { v: 'filiales', lib: 'Les filiales du groupe à l’étranger' },
];
export const DESTINATAIRES_JUSTES = ['boutiques', 'filiales'];

// ─────────────────────────────────────────── ENT-23.2 : le chariot de quatre commandes
export const CHARIOT232 = [
  { bac: 1, boutique: 'Rennes', lignes: [lg('gel', 24), lg('deo', 12)] },
  { bac: 2, boutique: 'Vannes', lignes: [lg('gel', 6), lg('savon', 40)] },
  { bac: 3, boutique: 'Lorient', lignes: [lg('deo', 30), lg('vernis', 10)] },
  { bac: 4, boutique: 'Saint-Malo', lignes: [lg('gel', 30), lg('huile', 5)] },
];
// Les lignes dont l'élève donne la façon de préparer (bac, ligne).
export const TYPES232 = [[2, 'gel'], [2, 'savon'], [3, 'deo'], [4, 'gel']];
export const ligneDe = (C, bac, prod) => C.find((b) => b.bac === bac).lignes.find((l) => l.prod === prod);
export const arrets = (C) => [...new Set(C.flatMap((b) => b.lignes.map((l) => l.prod)))];
export const ordreChariot = (C) => arrets(C).sort((a, b) => (PRODUITS[a].adr < PRODUITS[b].adr ? -1 : 1));
export const totalA = (C, prod) => C.reduce((t, b) => t + b.lignes.filter((l) => l.prod === prod).reduce((s, l) => s + l.qte, 0), 0);
export const bacDe = (C, prod) => C.find((b) => b.lignes.some((l) => l.prod === prod)).bac;
export const BACS = (C) => C.map((b) => ({ v: String(b.bac), lib: `Bac ${b.bac} : ${b.boutique}` }));

// ─────────────────────────────────────────── ENT-23.3 : le contrôle du colis panaché de Lorient (préparé par Maël)
export const STATUTS = [
  { v: 'conforme', lib: 'Conforme' },
  { v: 'manque', lib: 'Il en manque' },
  { v: 'trop', lib: 'Il y en a trop' },
  { v: 'reference', lib: 'Ce n’est pas le bon produit' },
];
export const CONTROLE233 = [
  { prod: 'vernis', attendu: 10, scanne: 10 },
  { prod: 'creme', attendu: 12, scanne: 10 },
  { prod: 'masque', attendu: 6, scanne: 8 },
  { prod: 'rouge', attendu: 20, scanne: 20, teinte: 'teinte 12', teinteScannee: 'teinte 15' },
  { prod: 'soin', attendu: 4, scanne: 4 },
];
export const statutDe = (C) => (C.teinte && C.teinteScannee !== C.teinte ? 'reference' : C.scanne < C.attendu ? 'manque' : C.scanne > C.attendu ? 'trop' : 'conforme');
export const COLIS_CHOIX = [
  { v: 'fermer', lib: 'Je ferme le colis et je préviens la boutique qu’il y a des erreurs' },
  { v: 'corriger', lib: 'Je corrige le colis avant de le fermer : je complète, je retire, j’échange' },
  { v: 'refaire', lib: 'Je vide le colis et je recommence toute la commande' },
];
export const PRATIQUES = [
  { v: 'scanner', lib: 'Scanner chaque article au moment où je le prends' },
  { v: 'vite', lib: 'Aller plus vite pour rattraper le retard' },
  { v: 'lire', lib: 'Lire la teinte ou le parfum sur l’étiquette, pas seulement le nom' },
  { v: 'memoire', lib: 'Prendre les articles de mémoire, sans regarder l’adresse' },
  { v: 'compter', lib: 'Compter deux fois quand je prends plusieurs articles' },
];
export const PRATIQUES_JUSTES = ['scanner', 'lire', 'compter'];

// ─────────────────────────────────────────── les réclamations (ENT-23.4 et l'évaluation)
// `cas` : 'manque' (la plateforme en a préparé moins que commandé) → renvoyer ; 'casse' (photo de la casse jointe) → remplacer ;
// 'hors' (le produit n'était pas dans la commande) → expliquer.
export const DECISIONS = [
  { v: 'renvoyer', lib: 'Envoyer les articles qui manquent avec la prochaine livraison' },
  { v: 'remplacer', lib: 'Remplacer les articles cassés, la photo le prouve' },
  { v: 'expliquer', lib: 'Expliquer que ces articles n’étaient pas commandés' },
];
export const decisionDe = (R) => ({ manque: 'renvoyer', casse: 'remplacer', hors: 'expliquer' })[R.cas];
export const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
// Les jours de livraison des boutiques (CONSTRUITS).
export const TOURNEES = { Rennes: ['lundi', 'jeudi'], Vannes: ['mardi', 'vendredi'], Lorient: ['mardi', 'vendredi'], 'Saint-Malo': ['mercredi'],
  Quimper: ['lundi', 'jeudi'], Brest: ['mercredi', 'vendredi'], Dinan: ['mardi'], Auray: ['jeudi'], Fougères: ['lundi', 'mercredi'] };
// La prochaine livraison après le jour où la réclamation est traitée (jamais le jour même : les camions du jour sont partis).
export const prochaine = (boutique, jour) => { const k = JOURS.indexOf(jour); for (let i = 1; i <= 5; i++) { const j = JOURS[(k + i) % 5]; if (TOURNEES[boutique].includes(j)) return j; } return null; };
export const RECLAM234 = {
  boutique: 'Vannes', jour: 'lundi', commande: 'la commande livrée vendredi',
  bon: [{ prod: 'gel', commande: 24, prepare: 18 }, { prod: 'edt', commande: 12, prepare: 12 }, { prod: 'masque', commande: 10, prepare: 10 }, { prod: 'lait', commande: 6, prepare: 6 }],
  plaintes: [{ prod: 'gel', qte: 6, cas: 'manque' }, { prod: 'edt', qte: 2, cas: 'casse' }, { prod: 'rouge', qte: 12, cas: 'hors' }],
};
export const D_ABORD = [
  { v: 'croire', lib: 'J’envoie tout ce que la boutique demande, sans vérifier' },
  { v: 'comparer', lib: 'Je compare la réclamation avec la commande et le bon de préparation' },
  { v: 'refuser', lib: 'Je réponds que la plateforme ne se trompe jamais' },
];

// ─────────────────────────────────────────── ENT-23.5 : le pic de fin novembre (heure limite et stock CONSTRUITS)
export const HEURE_LIMITE = '14:00';
export const DEMANDES235 = [
  { id: 'quimper', boutique: 'Quimper', heure: '11:20', lignes: [lg('gel', 24), lg('huile', 5)], stock: { gel: 300, huile: 80 } },
  { id: 'lorient', boutique: 'Lorient', heure: '14:40', lignes: [lg('shamp', 12)], stock: { shamp: 150 } },
  { id: 'brest', boutique: 'Brest', heure: '13:10', lignes: [lg('creme', 60)], stock: { creme: 36 } },
];
export const SUITES = [
  { v: 'soir', lib: 'Préparée et livrée avec le camion de ce soir' },
  { v: 'partiel', lib: 'Ce qu’il y a en stock ce soir, le reste plus tard' },
  { v: 'demain', lib: 'Préparée demain : elle est arrivée après l’heure limite' },
];
export const suiteDe = (D) => (D.heure > HEURE_LIMITE ? 'demain' : D.lignes.some((l) => D.stock[l.prod] < l.qte) ? 'partiel' : 'soir');
export const reliquat = (D) => D.lignes.reduce((t, l) => t + Math.max(0, l.qte - D.stock[l.prod]), 0);
// Ce qui part ce soir (les lignes à préparer) : Quimper en entier, Brest ce que le stock permet.
export const PREP235 = [['quimper', 'gel', 24], ['quimper', 'huile', 5], ['brest', 'creme', 36]].map(([id, prod, qte]) => ({ id: `${id}-${prod}`, boutique: DEMANDES235.find((d) => d.id === id).boutique, prod, qte }));
export const RETOURS = [
  { id: 'masques', lib: '18 masques visage intacts, toujours vendus en boutique', sort: 'stock' },
  { id: 'coffrets', lib: '30 coffrets de Noël de l’an dernier, intacts : la gamme a changé, ils ne se vendent plus', sort: 'don' },
  { id: 'laits', lib: '4 flacons de lait corps qui fuient', sort: 'recycler' },
];
export const SORTS = [
  { v: 'stock', lib: 'Remettre en stock' },
  { v: 'don', lib: 'Donner à une association' },
  { v: 'recycler', lib: 'Envoyer au recyclage' },
  { v: 'jeter', lib: 'Jeter à la poubelle' },
];

// ─────────────────────────────────────────── ENT-23.6 : trois jeux (un par élève, d'après sa graine)
const JEUX236 = [
  { boutique: 'Dinan', lignes: [lg('creme', 20), lg('edt', 8), lg('gel', 24), lg('huile', 7), lg('savon', 80)], voisin: { boutique: 'Rennes', prod: 'gel', qte: 12 },
    reclam: { boutique: 'Dinan', jour: 'mercredi', commande: 'la commande livrée mardi',
      bon: [{ prod: 'shamp', commande: 12, prepare: 8 }, { prod: 'masque', commande: 6, prepare: 6 }, { prod: 'soin', commande: 6, prepare: 6 }],
      plaintes: [{ prod: 'shamp', qte: 4, cas: 'manque' }, { prod: 'vernis', qte: 10, cas: 'hors' }, { prod: 'soin', qte: 2, cas: 'casse' }] } },
  { boutique: 'Auray', lignes: [lg('deo', 45), lg('lait', 5), lg('rouge', 96), lg('shamp', 24), lg('vernis', 20)], voisin: { boutique: 'Vannes', prod: 'shamp', qte: 6 },
    reclam: { boutique: 'Auray', jour: 'lundi', commande: 'la commande livrée jeudi',
      bon: [{ prod: 'edt', commande: 6, prepare: 6 }, { prod: 'gel', commande: 24, prepare: 20 }, { prod: 'creme', commande: 12, prepare: 12 }],
      plaintes: [{ prod: 'edt', qte: 3, cas: 'casse' }, { prod: 'gel', qte: 4, cas: 'manque' }, { prod: 'huile', qte: 6, cas: 'hors' }] } },
  { boutique: 'Fougères', lignes: [lg('deo', 60), lg('edt', 4), lg('gel', 10), lg('masque', 48), lg('soin', 13)], voisin: { boutique: 'Rennes', prod: 'masque', qte: 10 },
    reclam: { boutique: 'Fougères', jour: 'jeudi', commande: 'la commande livrée mercredi',
      bon: [{ prod: 'lait', commande: 12, prepare: 12 }, { prod: 'savon', commande: 40, prepare: 40 }, { prod: 'rouge', commande: 24, prepare: 18 }],
      plaintes: [{ prod: 'deo', qte: 15, cas: 'hors' }, { prod: 'lait', qte: 2, cas: 'casse' }, { prod: 'rouge', qte: 6, cas: 'manque' }] } },
];
export const indiceJeu = (db, n, sel) => empreinte(`${graineDeBase(db)}|yves-rocher|${sel}`) % n;
export const TOUS_JEUX236 = JEUX236;
export const jeu236 = (db) => JEUX236[indiceJeu(db, JEUX236.length, '236')];
