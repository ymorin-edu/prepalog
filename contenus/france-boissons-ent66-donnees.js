// ENT-6.6 — France Boissons, « inventaire tournant à la voix » : les DONNÉES PURES de la séance (écran du matériel, zone de masse en
// comptage avec son terminal vocal, inventaire, poids). À part de `contenus/france-boissons-ent66.js` parce que ce fichier-ci se charge
// aussi hors navigateur : le corrigé (`contenus/corriges/ENT-6.6.js`) le lit, et le test « tout corrigé déclaré existe » l'importe dans
// Node, où `core/types/fiche.js` ne se charge pas. Rien ici n'importe le moteur. Le contenu de la séance réexporte tout.
//
// Vérifié (brief §2) : préparation à la voix chez France Boissons (Vocollect, 2014 ; toujours citée par l'entreprise) ; principe de
// l'inventaire tournant et du taux de fiabilité ; consigne de 40 € par fût (arrêté du 6 février 2026) ; réemploi des fûts (CNE, chiffres
// de 2014). Construit : l'inventaire à la voix (non trouvé chez France Boissons), les codes de contrôle, le stock du logiciel, les trois
// écarts et leurs causes, l'heure. 8 fûts à plat sur palette de rétention = règle de l'exercice (décision 52).

import { CONSIGNES } from './france-boissons.js';
import { MASSE as MASSE65, PALETTES as PALETTES65 } from './france-boissons-ent65-donnees.js';

export const ID = 'france-boissons-inventaire';
export const PLAN_ID = 'fb-ent66-masse';
export const INV_ID = 'INV-0617';
export const FICHE_ID = 'compte-rendu';
export const ID_VOLET = 'fb-ent66';

// Jeudi 17 juin 2027, 7 h (calendrier de S2, décision 31).
export const SCENARIO = { date: '2027-06-17' };

const IMG = './contenus/images/france-boissons/';

// ─────────────────────────────────────────────────────────────── étape 0 : le matériel du poste (brief §4, étape 0)
// Même brique qu'ENT-6.5 : une animation faite seulement d'écrans, entrée « Le matériel » du menu, sans jalon.
export const MATERIEL = {
  id: 'fb-ent66-materiel',
  libelle: 'Le matériel',
  ecrans: [
    { titre: 'Le terminal vocal',
      image: { src: IMG + 'materiel-terminal-vocal.svg', alt: 'Un préparateur porte un terminal à la ceinture, relié à un casque avec micro ; ses deux mains sont libres',
        mention: 'Dessin — matériel générique, sans marque' },
      blocs: ['Le <b>[[terminal vocal]]</b> se porte à la ceinture, avec un <b>casque</b> et un <b>micro</b>.',
        'Il te dit où aller et ce qu’il faut faire ; tu réponds à voix haute. Tes mains et tes yeux restent libres.',
        'Ici, tu tapes tes réponses au clavier. Dans cet exercice, le terminal sert aussi à compter.'] },
  ],
  parties: [],
};

// ─────────────────────────────────────────────────────────────── étape 1 : compter avec le terminal (brief §4, étape 1)
// Les codes de contrôle des couloirs (construits, brief §4), lus sur le panneau du couloir ouvert.
export const CODES = { M01: '47', M02: '82', M03: '15', M04: '63', M05: '29', M06: '54', M07: '31', M08: '91' };

// Le stock du soir d'ENT-6.5, palettes rangées à leur BONNE place (chaque séance repart d'un dossier propre, brief §4) : P1 en M02,
// P2 sur la pile de M03, P3 en M06, P4 en M07. C'est ce que le LOGICIEL croit : le stock théorique est CALCULÉ d'ici.
export const RANGEMENT_ENT65 = { P1: 'M02', P2: 'M03', P3: 'M06', P4: 'M07' };
const FUTS = 8;
const futsDe = (x) => (x.futs == null ? FUTS : x.futs);
export function stockLogiciel() {
  const S = {};
  const ajouter = (c, ref, lot, n) => { const k = `${c}|${ref}|${lot || ''}`; S[k] = (S[k] || 0) + n; };
  Object.entries(MASSE65.stock).forEach(([c, piles]) => piles.flat().forEach((x) => ajouter(c, x.ref, x.lot, futsDe(x))));
  PALETTES65.forEach((p) => ajouter(RANGEMENT_ENT65[p.id], p.ref, p.lot, p.futs));
  return S;
}

// La liste du terminal (brief §4), dans son ordre : le périmètre = ce qui part vendredi chez les clients, et les vides.
// M07 (Edelweiss) n'est pas compté : pas dans la commande de vendredi.
export const LIGNES = [
  { couloir: 'M01', ref: 'HEI30', lot: 'S20' },
  { couloir: 'M02', ref: 'HEI30', lot: 'S24' },
  { couloir: 'M03', ref: 'PEL20', lot: 'S24' },
  { couloir: 'M04', ref: 'PEL20', lot: 'S19' },
  { couloir: 'M05', ref: 'AFF20', lot: 'S18' },
  { couloir: 'M06', ref: 'AFF20', lot: 'S24' },
  { couloir: 'M08', ref: 'VIDES' },
];
// Le stock du logiciel, ligne par ligne (calculé) : M01 16 · M02 8 · M03 24 · M04 8 · M05 2 · M06 7 · M08 22.
export const SYSTEME = (() => {
  const S = stockLogiciel();
  return Object.fromEntries(LIGNES.map((l) => [l.couloir, S[`${l.couloir}|${l.ref}|${l.lot || ''}`] || 0]));
})();

const pile = (ref, lot, n, futs) => Array.from({ length: n }, () => (futs == null ? { ref, lot } : { ref, lot, futs }));
// Ce qu'on VOIT jeudi à 7 h (construit, brief §4) : le stock du logiciel, avec trois écarts.
//   M01 : la palette du dessus n'a que 7 fûts (le 8e, percé hier à 19 h par une fourche, est en zone litiges : casse non saisie) ;
//   M02 : la palette de Pelforth S19 a été reposée hier soir sur la Heineken S24 (elle manque donc en M04, vide) ;
//   M08 : la palette de vides de devant n'en a que 3 au lieu de 6 (cause inconnue).
export const STOCK_JEUDI = {
  M01: [[{ ref: 'HEI30', lot: 'S20' }, { ref: 'HEI30', lot: 'S20', futs: 7 }]],
  M02: [[{ ref: 'HEI30', lot: 'S24' }, { ref: 'PEL20', lot: 'S19' }]],
  M03: [pile('PEL20', 'S24', 3)],
  M05: [pile('AFF20', 'S18', 1, 2)],
  M06: [pile('AFF20', 'S24', 1, 7)],
  M07: [pile('EDW20', 'S24', 3), pile('EDW20', 'S24', 1, 7)],
  M08: [pile('VIDES', null, 2), pile('VIDES', null, 1, 3)],
};

// La phrase du terminal pour chaque référence (affichée ET dite) : « Heineken, fût de 30 litres. Lot S20. Combien de fûts ? ».
const VOIX = { HEI30: 'Heineken, fût de 30 litres', PEL20: 'Pelforth Blonde, fût de 20 litres', AFF20: 'Affligem Blonde, fût de 20 litres',
  EDW20: 'Edelweiss, fût de 20 litres', VIDES: 'Fûts vides' };

export const PLAN = {
  id: PLAN_ID,
  libelle: 'Zone de masse',
  mode: 'masse',
  comptage: true,
  personnage: { nom: 'Nadia', role: 'cheffe de quai', date: 'jeudi 17 juin, 7 h',
    texte: { guidage: 'Le terminal te dit où aller. Ne regarde pas le stock du logiciel : compte ce que tu vois.' } },
  consigne: 'Écoute (ou lis) le terminal, va au couloir, compte, réponds.',
  plan: {
    couloirs: MASSE65.plan.couloirs.map((c) => Object.assign({}, c, { code: CODES[c.id] })),
    reception: MASSE65.plan.reception,
    litiges: { titre: 'Zone litiges', charges: [
      { ref: 'AFF20', lot: 'S24', futs: 1, fuite: true, etiq: 'Réception 16/06 — fuit' },
      { ref: 'HEI30', lot: 'S20', futs: 1, fuite: true, etiq: 'Percé par une fourche — 16/06, 19 h' },
    ] },
    quais: MASSE65.plan.quais,
  },
  references: Object.fromEntries(Object.entries(MASSE65.references).map(([k, r]) => [k, Object.assign({}, r, { voix: VOIX[k] })])),
  hauteurs: MASSE65.hauteurs,
  portee: MASSE65.portee,
  lots: MASSE65.lots,
  stock: STOCK_JEUDI,
  terminal: {
    titre: 'Inventaire tournant',
    lignes: LIGNES,
    // Jalons 1 à 5 du brief (§5) : M01, M02, M04, M08, puis M03, M05 et M06 ensemble. Les nombres attendus se calculent depuis le stock.
    jalons: [
      { id: 'compte-M01', lib: 'M01 : Heineken 30 L compté juste', lignes: ['M01'] },
      { id: 'compte-M02', lib: 'M02 : Heineken 30 L compté juste', lignes: ['M02'] },
      { id: 'compte-M04', lib: 'M04 : Pelforth 20 L compté juste', lignes: ['M04'] },
      { id: 'compte-M08', lib: 'M08 : fûts vides comptés justes', lignes: ['M08'] },
      { id: 'compte-autres', lib: 'M03, M05 et M06 comptés justes', lignes: ['M03', 'M05', 'M06'] },
    ],
    fin: 'Comptage terminé : 7 lignes. Merci.',
  },
  regles: { titre: 'Compter les fûts', entete: 'Compter les fûts', lignes: [
    'Une palette pleine = <b>8 fûts</b>.',
    'Compte les palettes de chaque pile, puis regarde s’il manque des fûts sur une palette.',
    'Ne compte que la référence demandée.',
  ] },
};

// ─────────────────────────────────────────────────────────────── étape 2 : écarts et décisions (brief §4, étape 2)
// Une ligne libre par ligne du terminal (`cle` = le couloir), avec le stock du LOGICIEL. Les comptages de l'élève arrivent par
// `comptages(db)`, branché dans `contenus/france-boissons-ent66.js` (il lit le terminal). Rien n'est jugé avant le bilan
// (`correction: 'aucune'`) : un écart faux est gardé tel quel (jalon 6), comme une décision fausse.
const NOMS = { HEI30: 'Heineken 30 L', PEL20: 'Pelforth 20 L', AFF20: 'Affligem 20 L' };
const ATTENDUS = {
  M01: { attendu: 'regul', motif: 'Casse', explication: 'Le fût percé hier soir est en zone litiges : il est perdu, on régularise −1, motif Casse.' },
  M04: { attendu: 'rayon', explication: 'La palette de Pelforth S19 a été reposée en M02, sur la Heineken : on la remet en M04, on ne touche pas au stock.' },
  M08: { attendu: 'regul', motif: 'Vides manquants', explication: 'Trois vides manquent : on régularise, motif Vides manquants, et on prévient Nadia.' },
};
export const MOTIFS = ['Casse', 'Vides manquants', 'Erreur de réception', 'Erreur de rangement'];
export const INVENTAIRE = {
  id: INV_ID,
  libelle: 'Inventaire',
  titre: 'Inventaire tournant — zone de masse',
  sousTitre: 'jeudi 17 juin, 7 h · 7 lignes',
  source: 'comptages',
  attenteComptage: 'Termine d’abord le comptage au terminal : l’inventaire s’ouvrira avec tes comptages.',
  ecarts: 'eleve',
  correction: 'aucune',
  taux: false,
  actions: ['regul', 'rayon'],
  libelles: { regul: 'Régulariser le stock du logiciel', rayon: 'Remettre en place' },
  motifs: MOTIFS,
  conseil: '<b>Avant de corriger.</b> Un écart, c’est un signal. Cherche d’abord <b>pourquoi</b> : une palette ailleurs ? un fût cassé ? '
    + 'On ne corrige le stock que si les fûts ont vraiment disparu.',
  lignes: LIGNES.map((l) => Object.assign({
    cle: l.couloir, emplacement: l.couloir, ref: l.ref,
    designation: l.ref === 'VIDES' ? 'Fûts vides' : `${NOMS[l.ref]} — lot ${l.lot}`,
    systeme: SYSTEME[l.couloir],
  }, ATTENDUS[l.couloir] || {})),
};

// ─────────────────────────────────────────────────────────────── étape 3 : le compte rendu (brief §4, étape 3)
// Ce que la fiche doit porter, CALCULÉ depuis les comptages DE L'ÉLÈVE (pas de double peine, brief §5) : `comptes` = { M01: 15, … }.
export const CONSIGNE_FUT = CONSIGNES.fut;
export function attenduCompteRendu(comptes) {
  const C = comptes || {};
  const manquants = C.M08 == null ? null : Math.max(0, SYSTEME.M08 - C.M08);
  const justes = LIGNES.filter((l) => C[l.couloir] != null && C[l.couloir] === SYSTEME[l.couloir]).length;
  return { videsManquants: manquants, euros: manquants == null ? null : manquants * CONSIGNE_FUT,
    justes, lignes: LIGNES.length, taux: Math.round(justes / LIGNES.length * 100) };
}

// ─────────────────────────────────────────────────────────────── les jalons (10, pondérés : 16 + 4 de questions = 20)
// Poids validés par Tristan le 12/10/2026 : compter 8 (M01 2, M02 2, M04 1,5, M08 1,5, M03-M05-M06 1), écarts et décisions 5,5
// (écarts 1,5, M04 remettre en place 2,5, M01 régulariser Casse 1,5), compte rendu 2,5 (vides 1,5, taux 1), plus 4 pour les trois
// questions notées (`part`). Aucun jalon de forme.
export const GROUPES = { compter: 'Compter avec le terminal', decider: 'Écarts et décisions', compteRendu: 'Compte rendu à Nadia' };
export const POIDS = {
  'compte-M01': 2, 'compte-M02': 2, 'compte-M04': 1.5, 'compte-M08': 1.5, 'compte-autres': 1,
  ecarts: 1.5, 'decision-M04': 2.5, 'decision-M01': 1.5,
  'vides-euros': 1.5, taux: 1,
};
