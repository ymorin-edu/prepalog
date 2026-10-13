// ENT-6.10 — France Boissons, « le retour de Lucas » : les DONNÉES PURES de la séance (ticket, comptes au quai, compte de consignes,
// chiffrage du réemploi). À part de `contenus/france-boissons-ent610.js` parce que ce fichier-ci se charge aussi hors navigateur (le
// corrigé `contenus/corriges/ENT-6.10.js` le lit dans Node) : rien ici n'importe le moteur.
//
// Tout est CALCULÉ depuis les données communes, jamais recopié : la commande prise en ENT-6.2 (`ATTENDU` : 6 Heineken 30 L, 2 Affligem,
// 2 Pelforth en remplacement, 3 casiers d'eau, vides annoncés 9 fûts et 5 casiers), le solde de consignes du client avant la tournée
// (`CABANE.consignes`) et les montants de consigne 2027 (`CONSIGNES`).
//
// Vérifié (brief §2, 06/10/2026) : le terminal du chauffeur enregistre le non-livré avec son motif, traite les consignes et imprime le
// ticket ; les emballages rendus donnent un avoir ; consignes 2027 (arrêté du 6 février 2026) 40 € le fût, 4 € le casier ; fût Euro 30 L
// 9,5 kg vide ; bouteille 33 cl 225 g vide ; un fût sert 53,5 fois en 15 ans (Conseil national de l'emballage, 2014).
// Construit (annoncé) : le fût cabossé et refusé, le ticket et son numéro, les vides du ticket recopiés de la commande, le 9e vide resté
// chez Malo, les textes des personnages.

import { evaluerGrille } from '../core/formules.js';
import { ATTENDU } from './france-boissons-ent62.js';
import { CABANE, CONSIGNES, article } from './france-boissons.js';

export const ID = 'france-boissons-retour';
export const ID_VOLET = 'fb-ent610';
// Vendredi 18 juin 2027, 17 h (calendrier 31) : Lucas est rentré à Buchelay avec T1, quai 14.
export const SCENARIO = { date: '2027-06-18', heure: '17:00' };

// Les écrans (ids JAMAIS modifiés : écrits dans la base de l'élève).
export const FICHE_CONTROLE = 'controle';
export const FICHE_COMPTE = 'consignes';
export const FICHE_CHIFFRAGE = 'chiffrage';
export const BLOC_COMPTE = 'compte';
export const BLOC_CHIFFRAGE = 'reemploi';
export const ANIM = 'fb-boucle-vides';
export const MSG_MALO = 'reponse-malo-consignes';
export const MSG_INES = 'reponse-ines-facture';
export const CLE_MALO = 'malo-consignes';
export const CLE_INES = 'ines-facture';

// ─────────────────────────────────────────────────────────────── le ticket de Lucas (reconstitution)
export const NUMERO_TICKET = 'LR-27-0618-C04';
// Construit : un Heineken 30 L cabossé au déchargement, refusé par Malo, revenu plein avec Lucas.
export const REFUS = { article: 'heineken30', q: 1, motif: 'fût abîmé au déchargement, refusé' };

// Les lignes livrées, dans l'ordre du bon de commande d'ENT-6.2 : commandé (le bon juste) et livré (moins le refus).
export const LIVRAISON = [
  ...Object.entries(ATTENDU.futs).map(([id, q]) => ({ article: id, commande: q })),
  { article: ATTENDU.remplacement.article, commande: ATTENDU.remplacement.q },
  { article: 'eau', commande: ATTENDU.eau },
].filter((l) => l.commande > 0).map((l) => {
  const refuse = l.article === REFUS.article ? REFUS.q : 0;
  return { ...l, court: article(l.article).court, livre: l.commande - refuse, refuse, motif: refuse ? REFUS.motif : '' };
});
const estFut = (l) => l.article !== 'eau';
export const LIVRES = {
  futs: LIVRAISON.filter(estFut).reduce((s, l) => s + l.livre, 0),
  casiers: LIVRAISON.filter((l) => !estFut(l)).reduce((s, l) => s + l.livre, 0),
  commandesFuts: LIVRAISON.filter(estFut).reduce((s, l) => s + l.commande, 0),
};

// Les vides du ticket : RECOPIÉS de la commande (« reprends mes vides : 9 fûts et 5 casiers »), c'est l'erreur à trouver.
export const VIDES_TICKET = { futs: ATTENDU.vides.futs, casiers: ATTENDU.vides.casiers };
// Ce qui est vraiment au quai (construit) : un fût vide est resté dans la réserve de Malo ; les casiers sont tous là ; le fût refusé
// est revenu PLEIN (ce n'est pas un vide).
export const AU_QUAI = { futs: VIDES_TICKET.futs - 1, casiers: VIDES_TICKET.casiers, plein: REFUS.q };

// La réponse juste à « Le ticket est-il juste ? » : calculée (écart sur les fûts, sur les casiers, sur les deux, ou aucun).
export const CHOIX_TICKET = [
  { v: 'oui', lib: 'Oui' },
  { v: 'futs', lib: 'Non, écart sur les fûts vides' },
  { v: 'casiers', lib: 'Non, écart sur les casiers' },
  { v: 'deux', lib: 'Non, écart sur les deux' },
];
export const TICKET_JUSTE = (() => {
  const f = AU_QUAI.futs !== VIDES_TICKET.futs, c = AU_QUAI.casiers !== VIDES_TICKET.casiers;
  return f && c ? 'deux' : f ? 'futs' : c ? 'casiers' : 'oui';
})();

// ─────────────────────────────────────────────────────────────── le compte de consignes (le réel)
export const AVANT = { futs: CABANE.consignes.futs, casiers: CABANE.consignes.casiers };
export const REEL = (() => {
  const apres = { futs: AVANT.futs + LIVRES.futs - AU_QUAI.futs, casiers: AVANT.casiers + LIVRES.casiers - AU_QUAI.casiers };
  const ecart = { futs: apres.futs - AVANT.futs, casiers: apres.casiers - AVANT.casiers };
  const montant = { futs: ecart.futs * CONSIGNES.fut, casiers: ecart.casiers * CONSIGNES.casier };
  return { apres, ecart, montant, total: montant.futs + montant.casiers };
})();

// Une saisie de nombre, telle que tapée → un nombre ou NaN (« 8 », « 8,0 », « 1 084 »). Même lecture que `lireNombre` de la fiche.
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
// Ce que l'élève a envoyé à la fiche 1 (ses comptes), ou null tant qu'elle n'est pas envoyée.
export function comptesEleve(db) {
  const f = db && db.fiches && db.fiches[FICHE_CONTROLE];
  if (!f || !f.envoye) return null;
  const v = f.valeurs || {}, n = (k) => { const x = lireNombre(v[k]); return Number.isFinite(x) ? x : null; };
  return { futs: n('futs'), casiers: n('casiers'), plein: n('plein'), ticket: v.ticket || null };
}

// Les lignes de la feuille « Compte de consignes » (adresses stables : ligne 2 = avant, 3 = livrés, 4 = repris…). Les attendus des
// lignes 5 à 9 se calculent sur SES saisies (une erreur ne se paie qu'une fois) ; ceux de la ligne 4, sur SES comptes de la fiche 1.
const calc = (refs, f) => (lire) => { const v = refs.map(lire); return v.some((x) => x == null || !Number.isFinite(x)) ? null : f(...v); };
// Pas de texte d'invite dans une case à saisir (« votre réponse » ne tient pas dans une colonne étroite) ; « = » dans une case à formule.
const saisie = (attendu, o = {}) => ({ saisie: true, attendu, placeholder: ' ', ...o });
const formule = (refs, f) => saisie(calc(refs, f), { formule: true, placeholder: '=' });
const pluriel = (n, mot) => `${n} ${mot}${Math.abs(n) > 1 ? 's' : ''}`;
export function lignesCompte(db) {
  const c = comptesEleve(db);
  // L'aide de la ligne 4 rappelle SES comptes, tels qu'envoyés (même faux, sans dire s'ils sont justes : alerte 28).
  const vu = (k, mot) => (c[k] == null ? `? ${mot}s` : pluriel(c[k], mot));
  const aideRepris = c ? `Tu as compté au quai : ${vu('futs', 'fût')}, ${vu('casiers', 'casier')}.` : 'Ce que tu as compté au quai.';
  return [
    { A: '', B: 'Fûts', C: 'Casiers', entete: true },
    { A: 'Chez le client avant la tournée', B: AVANT.futs, C: AVANT.casiers, note: 'Donné (fiche client).' },
    { A: '+ Pleins livrés', B: saisie(LIVRES.futs), C: saisie(LIVRES.casiers), note: 'Colonne « Livré » du ticket.' },
    { A: '− Vides repris', B: saisie(() => (c ? c.futs : null)), C: saisie(() => (c ? c.casiers : null)),
      note: aideRepris },
    { A: '= Chez le client après la tournée', B: formule(['B2', 'B3', 'B4'], (a, l, r) => a + l - r), C: formule(['C2', 'C3', 'C4'], (a, l, r) => a + l - r),
      note: 'Avant + livré − repris.' },
    { A: 'Écart (après − avant)', B: formule(['B5', 'B2'], (x, y) => x - y), C: formule(['C5', 'C2'], (x, y) => x - y), note: 'Après − avant.' },
    { A: 'Consigne (€)', B: saisie(CONSIGNES.fut), C: saisie(CONSIGNES.casier), note: 'Conditions de vente.' },
    { A: 'Montant (€)', B: formule(['B6', 'B7'], (x, y) => x * y), C: formule(['C6', 'C7'], (x, y) => x * y), note: 'Écart × consigne. Négatif = avoir.' },
    { A: 'Total de la tournée (€)', B: formule(['B8', 'C8'], (x, y) => x + y), C: '', note: 'Fûts + casiers.' },
  ];
}
// Les cases de chaque jalon de la feuille (adresses).
export const CASES_COMPTE = { lus: ['B3', 'C3', 'B7', 'C7'], solde: ['B4', 'C4', 'B5', 'C5'], montants: ['B6', 'C6', 'B8', 'C8', 'B9'] };
// La feuille juste, pour le corrigé et les tests : les formules d'un tableur (comptes de l'élève = ceux du quai).
export const FORMULES_COMPTE = {
  B3: String(LIVRES.futs), C3: String(LIVRES.casiers), B4: String(AU_QUAI.futs), C4: String(AU_QUAI.casiers),
  B5: '=B2+B3-B4', C5: '=C2+C3-C4', B6: '=B5-B2', C6: '=C5-C2', B7: String(CONSIGNES.fut), C7: String(CONSIGNES.casier),
  B8: '=B6*B7', C8: '=C6*C7', B9: '=B8+C8',
};

// ─────────────────────────────────────────────────────────────── le chiffrage du réemploi (« Un fût, une bouteille »)
// Vérifié (brief §2) : fût Euro 30 L ; bouteille 33 cl ; 225 g vide ; 53,5 utilisations sur 15 ans (CNE 2014, arrondi à 53 dans la
// fiche, comme le brief) ; fût vide 9,5 kg.
export const FUT_BOUTEILLE = [
  { lib: 'Volume d’un fût de Heineken', valeur: 30, unite: 'L', ecrit: '30 L' },
  { lib: 'Volume d’une bouteille de bière', valeur: 0.33, unite: 'L', ecrit: '33 cl = 0,33 L' },
  { lib: 'Poids d’une bouteille vide (verre)', valeur: 0.225, unite: 'kg', ecrit: '225 g = 0,225 kg' },
  { lib: 'Nombre d’utilisations d’un fût sur sa vie (15 ans)', valeur: 53, unite: '', ecrit: '53' },
  { lib: 'Poids d’un fût vide', valeur: 9.5, unite: 'kg', ecrit: '9,5 kg' },
];
export function lignesChiffrage() {
  const d = (k, note, o = {}) => ({ saisie: true, placeholder: ' ', attendu: FUT_BOUTEILLE[k].valeur, tolerance: FUT_BOUTEILLE[k].valeur < 1 ? 0.0005 : 0.01, ...o, note });
  const f = (refs, fn) => ({ saisie: true, formule: true, placeholder: '=', attendu: calc(refs, fn), tolerance: '1 %' });
  return [
    { A: '', B: 'Valeur', entete: true },
    { A: 'Volume d’un fût (L)', B: d(0), note: 'Fiche, ligne 1.' },
    { A: 'Volume d’une bouteille (L)', B: d(1), note: 'Fiche, ligne 2 — en litres.' },
    { A: 'Poids d’une bouteille vide (kg)', B: d(2), note: 'Fiche, ligne 3 — en kg.' },
    { A: 'Utilisations d’un fût', B: d(3), note: 'Fiche, ligne 4.' },
    { A: 'Poids d’un fût vide (kg)', B: d(4), note: 'Fiche, ligne 5.' },
    { A: 'Bouteilles pour remplacer 1 fût', B: f(['B2', 'B3'], (v, b) => v / b), note: 'Volume du fût ÷ volume d’une bouteille.' },
    { A: 'Verre jeté pour 1 fût (kg)', B: f(['B7', 'B4'], (n, p) => n * p), note: 'Bouteilles × poids d’une bouteille.' },
    { A: 'Verre jeté sur la vie du fût (kg)', B: f(['B8', 'B5'], (k, u) => k * u), note: '× le nombre d’utilisations.' },
    { A: 'Combien de fois le poids du fût ?', B: f(['B9', 'B6'], (k, p) => k / p), note: 'Verre jeté ÷ poids du fût.' },
  ];
}
export const CASES_CHIFFRAGE = { donnees: ['B2', 'B3', 'B4', 'B5', 'B6'], calculs: ['B7', 'B8', 'B9', 'B10'] };
export const FORMULES_CHIFFRAGE = {
  B2: '30', B3: '0,33', B4: '0,225', B5: '53', B6: '9,5', B7: '=B2/B3', B8: '=B7*B4', B9: '=B8*B5', B10: '=B9/B6',
};
// Les résultats justes (pour le corrigé, la question au fil n° 4 et le message de fin).
export const CHIFFRAGE = (() => {
  const [vol, bout, poids, util, fut] = FUT_BOUTEILLE.map((x) => x.valeur);
  const bouteilles = vol / bout, verre = bouteilles * poids, vie = verre * util;
  return { bouteilles, verre, vie, fois: vie / fut };
})();

// La valeur d'une case de SA feuille de chiffrage (ce que montre sa feuille), ou null : pour la question au fil n° 4 (« Ton calcul : … »).
export function valeurChiffrage(db, ref) {
  const f = db && db.fiches && db.fiches[FICHE_CHIFFRAGE];
  const cases = (f && f.valeurs && f.valeurs[BLOC_CHIFFRAGE] && f.valeurs[BLOC_CHIFFRAGE].cases) || {};
  const c = {};
  lignesChiffrage().forEach((L, i) => ['A', 'B'].forEach((col) => {
    const v = L[col], a = `${col}${i + 1}`;
    if (v && typeof v === 'object') { if (v.saisie) c[a] = cases[a] == null ? '' : cases[a]; } else if (v != null) c[a] = v;
  }));
  const x = evaluerGrille(c).valeurs[ref];
  return x == null || !Number.isFinite(x) ? null : x;
}
