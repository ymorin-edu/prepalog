// Picard — ENT-4.4 « Le rush du lundi » (évaluation) : le quai de CHAQUE élève, tiré pour lui.
//
// Brief `docs/briefs/ENT-4.4-picard-evaluation.md`, décision du 03/10/2026
// (`docs/briefs/DECISION-jeu-unique-evaluations.md`) : un camion tiré par élève, graine = son
// identifiant (`core/tirage.js`). La STRUCTURE est commune à tous, c'est la contrainte d'équité :
// six palettes, exactement ces six aléas, dans un ordre tiré :
//
//   double    manquant + cartons écrasés sur la même palette   → réserves — manquant + cartons endommagés
//   temp      température à cœur au-dessus de −15 °C           → refuser — température
//   produit   étiquette d'une autre référence que le BL        → refuser — produit différent
//   avarie    cartons écrasés seuls, face arrière               → réserves — cartons endommagés
//   couche    couche du dessus incomplète, conforme au BL       → accepter
//   conforme  rien                                             → accepter
//
// et un ticket avec une remontée qui a duré, à signaler. TIRÉS : les six produits (réserve
// ci-dessous), les dimensions des palettes, l'ordre des aléas, les quantités (manquants, cartons
// écrasés, cartons absents de la couche du dessus), les températures (froides : −22,4 à −18,6 °C ;
// la palette chaude : −14,6 à −12,4 °C, au-dessus du seuil de refus de la règle du quai), le
// moment de la remontée du ticket, les lots, le numéro du BL. Les valeurs attendues ne sont écrites
// nulle part : la vue les calcule depuis la palette (`core/types/quai.js`).
//
// Tout est CONSTRUIT (voir `contenus/picard.js`) : fournisseur « Les Cuisines de la Deûle » et
// transporteur « Transports Polarix », fictifs (aucune société de ce nom trouvée par recherche web
// le 03/10/2026), produits plausibles d'un fournisseur de pâtisseries et plats cuisinés surgelés,
// références, colisages, lots, températures.
//
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : ne rien changer à la
// réserve ni au tirage entre l'ouverture de l'évaluation et le ramassage (le test « jeu figé »
// du bloc `picard` le rappelle). Les SEUILS de la note, eux, se changent librement (NOTE_ENT44).

import { etapesQuaiTire } from '../core/types/quai.js';
import { tirerJeu, graineDeBase } from '../core/tirage.js';
import { LIEU, PHOTOS, DECHARGEMENT, COUTS, SEUIL_HORS_FROID, AVERTISSEMENT, BON_A_SAVOIR, releves } from './picard.js';

/* ======================================================================== réglage de la note
   ┌───────────────────────────────────────────────────────────────────────────────────────┐
   │ RÉGLAGE À AJUSTER par Tristan (brief §6). Seuils en minutes, du plus exigeant au moins  │
   │ exigeant : [minutes, points]. « reel » = temps réel passé, PROVISOIRE (12 / 16 min),    │
   │ à caler sur les temps mesurés en ENT-4.1 ; multiplié par `tiersTemps` pour un élève qui │
   │ a le tiers-temps. Communs à tous les élèves (ils ne dépendent pas du jeu tiré).         │
   └───────────────────────────────────────────────────────────────────────────────────────┘ */
export const NOTE_ENT44 = {
  reception: 15,                               // points de réception (jalons réussis / jalons × 15)
  horsFroid: [[20, 3], [25, 2], [30, 1]],      // temps hors froid du lot : ≤ 20 min → 3, ≤ 25 → 2, ≤ 30 → 1
  reel: [[12, 2], [16, 1]],                    // temps réel : ≤ 12 min → 2, ≤ 16 → 1 (PROVISOIRE)
  tiersTemps: 4 / 3,                           // seuils du temps réel × 4/3 en tiers-temps
};

/* ================================================================== la réserve de produits */
// `voisin` : la référence proche livrée par erreur quand le produit tiré porte l'aléa « produit
// différent » (comme EPH-450 / EPB-450 en ENT-4.1). Construit.
export const RESERVE = [
  { ref: 'LAS-1000', nom: 'Lasagnes à la bolognaise 1 kg', etiq: 'LASAGNES À LA BOLOGNAISE', poids: '6 × 1 kg', voisin: { ref: 'LAV-1000', nom: 'LASAGNES AUX LÉGUMES' } },
  { ref: 'GRD-1000', nom: 'Gratin dauphinois 1 kg', etiq: 'GRATIN DAUPHINOIS', poids: '6 × 1 kg', voisin: { ref: 'GRS-1000', nom: 'GRATIN SAVOYARD' } },
  { ref: 'HAP-800', nom: 'Hachis parmentier 800 g', etiq: 'HACHIS PARMENTIER', poids: '8 × 800 g', voisin: { ref: 'HAC-800', nom: 'HACHIS PARMENTIER DE CANARD' } },
  { ref: 'BOB-900', nom: 'Bœuf bourguignon 900 g', etiq: 'BŒUF BOURGUIGNON', poids: '8 × 900 g', voisin: { ref: 'BOC-900', nom: 'BŒUF CAROTTES' } },
  { ref: 'BLV-900', nom: 'Blanquette de veau 900 g', etiq: 'BLANQUETTE DE VEAU', poids: '8 × 900 g', voisin: { ref: 'BLD-900', nom: 'BLANQUETTE DE DINDE' } },
  { ref: 'PAE-1000', nom: 'Paëlla royale 1 kg', etiq: 'PAËLLA ROYALE', poids: '6 × 1 kg', voisin: { ref: 'PAP-1000', nom: 'PAËLLA AU POULET' } },
  { ref: 'RIC-900', nom: 'Risotto aux champignons 900 g', etiq: 'RISOTTO AUX CHAMPIGNONS', poids: '8 × 900 g', voisin: { ref: 'RIA-900', nom: 'RISOTTO AUX ASPERGES' } },
  { ref: 'TCM-500', nom: 'Tarte au citron meringuée 500 g', etiq: 'TARTE AU CITRON MERINGUÉE', poids: '8 × 500 g', voisin: { ref: 'TCI-500', nom: 'TARTE AU CITRON' } },
  { ref: 'TAP-750', nom: 'Tarte aux pommes 750 g', etiq: 'TARTE AUX POMMES', poids: '6 × 750 g', voisin: { ref: 'TAF-750', nom: 'TARTE FINE AUX POMMES' } },
  { ref: 'ECC-4', nom: 'Éclairs au chocolat × 4', etiq: 'ÉCLAIRS AU CHOCOLAT', poids: '10 × 4 pièces', voisin: { ref: 'ECF-4', nom: 'ÉCLAIRS AU CAFÉ' } },
  { ref: 'MAC-12', nom: 'Macarons assortis × 12', etiq: 'MACARONS ASSORTIS', poids: '12 × 12 pièces', voisin: { ref: 'MCH-12', nom: 'MACARONS AU CHOCOLAT' } },
  { ref: 'MOC-2', nom: 'Moelleux au chocolat × 2', etiq: 'MOELLEUX AU CHOCOLAT', poids: '12 × 2 × 90 g', voisin: { ref: 'MOK-2', nom: 'MOELLEUX CŒUR CARAMEL' } },
  { ref: 'PRO-12', nom: 'Profiteroles au chocolat × 12', etiq: 'PROFITEROLES AU CHOCOLAT', poids: '10 × 12 pièces', voisin: { ref: 'CHC-12', nom: 'CHOUX À LA CRÈME' } },
  { ref: 'TIR-4', nom: 'Tiramisu × 4', etiq: 'TIRAMISU', poids: '8 × 4 × 90 g', voisin: { ref: 'TIF-4', nom: 'TIRAMISU À LA FRAMBOISE' } },
];

export const ALEAS = ['double', 'temp', 'produit', 'avarie', 'couche', 'conforme'];
const ATTENDU = {
  double: ['reserves', 'manquant', 'avarie'], temp: ['refuser', 'temperature'], produit: ['refuser', 'produit'],
  avarie: ['reserves', 'avarie'], couche: ['accepter', 'aucun'], conforme: ['accepter', 'aucun'],
};
const FROID = [-22.4, -18.6], CHAUD = [-14.6, -12.4];
const pad2 = (n) => String(n).padStart(2, '0');
// Les cellules de la couche du dessus, et celles de la face arrière (j = 0) sous la couche du dessus :
// les cartons écrasés y sont visibles seulement en faisant le tour (comme P2 d'ENT-4.1).
const dessus = (W, D, L) => { const c = []; for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) c.push(`${i},${j},${L - 1}`); return c; };
const arriere = (W, L) => { const c = []; for (let i = 0; i < W; i++) for (let k = 0; k < L - 1; k++) c.push(`${i},0,${k}`); return c; };

/* ========================================================================= le tirage */
function tirer(h) {
  const produits = h.prendre(RESERVE, 6);
  const aleas = h.melanger(ALEAS);
  const palettes = aleas.map((alea, n) => {
    const pr = produits[n];
    const W = h.entier(3, 4), D = h.entier(2, 3), L = h.entier(4, 5);
    const plein = W * D * L;
    let manque = [], avarie = {}, bl = plein, etiq = { ref: pr.ref, nom: pr.etiq };
    if (alea === 'couche') { manque = h.prendre(dessus(W, D, L), h.entier(2, W * D - 2)); bl = plein - manque.length; }
    if (alea === 'double') manque = h.prendre(dessus(W, D, L), h.entier(1, 2));
    if (alea === 'double' || alea === 'avarie') h.prendre(arriere(W, L), h.entier(1, 3)).forEach((c) => { avarie[c] = [0, -1]; });
    if (alea === 'produit') etiq = { ref: pr.voisin.ref, nom: pr.voisin.nom };
    const [attendu, motifAttendu, motif2Attendu] = ATTENDU[alea];
    const p = {
      id: `P${n + 1}`, ref: pr.ref, nom: pr.nom, bl,
      etiq: Object.assign(etiq, { poids: pr.poids, lot: `L26-${h.entier(2000, 3999)}`, ddm: `${pad2(h.entier(1, 12))}/${h.entier(2027, 2028)}` }),
      W, D, L, manque, avarie, temp: alea === 'temp' ? h.dixieme(...CHAUD) : h.dixieme(...FROID), attendu, motifAttendu, alea,
    };
    if (motif2Attendu) p.motif2Attendu = motif2Attendu;
    return p;
  });
  // La remontée du ticket : 1 h, entre 01:00 et 05:30 (le camion est parti à 00:00, arrive à 06:00).
  const debut = 15 * h.entier(4, 18);
  const remontee = {
    [debut]: h.dixieme(-17.4, -16.2), [debut + 15]: h.dixieme(-13.4, -12.2), [debut + 30]: h.dixieme(-12.8, -11.8),
    [debut + 45]: h.dixieme(-13.6, -12.4), [debut + 60]: h.dixieme(-17.8, -16.6),
  };
  return { palettes, remontee, bl: `CD-26-${h.entier(1000, 1999)}`, remorque: `FR-${h.entier(500, 899)}` };
}

// Les contraintes d'équité, en clair. Liste vide = jeu conforme (sinon il est retiré).
export function verifier(jeu) {
  const f = [];
  const P = jeu && jeu.palettes;
  if (!Array.isArray(P) || P.length !== 6) return ['il faut 6 palettes'];
  if (P.map((p) => p.id).join() !== 'P1,P2,P3,P4,P5,P6') f.push('palettes mal numérotées');
  if ([...P.map((p) => p.alea)].sort().join() !== [...ALEAS].sort().join()) f.push(`aléas : ${P.map((p) => p.alea)}`);
  if (new Set(P.map((p) => p.ref)).size !== 6) f.push('deux palettes du même produit');
  P.forEach((p) => {
    const plein = p.W * p.D * p.L, reel = plein - p.manque.length, av = Object.keys(p.avarie);
    const top = new Set(dessus(p.W, p.D, p.L)), dos = new Set(arriere(p.W, p.L));
    const [a, m1, m2] = ATTENDU[p.alea] || [];
    if (p.attendu !== a || p.motifAttendu !== m1 || (p.motif2Attendu || undefined) !== m2) f.push(`${p.id} : attendu incohérent avec l'aléa ${p.alea}`);
    if (new Set(p.manque).size !== p.manque.length || p.manque.some((c) => !top.has(c))) f.push(`${p.id} : manquant hors de la couche du dessus`);
    if (av.some((c) => !dos.has(c) || p.avarie[c][0] !== 0 || p.avarie[c][1] !== -1)) f.push(`${p.id} : carton écrasé hors de la face arrière`);
    // La règle du quai (−18 / −15 °C) : seule la palette « temp » est au-dessus de −18, et elle est au-dessus de −15.
    if (p.alea === 'temp' ? !(p.temp > -15 && p.temp <= -12) : !(p.temp <= -18.5)) f.push(`${p.id} : température ${p.temp} hors zone`);
    const etiqAutre = p.etiq.ref !== p.ref;
    if (etiqAutre !== (p.alea === 'produit')) f.push(`${p.id} : étiquette`);
    if (etiqAutre && P.some((q) => q.ref === p.etiq.ref)) f.push(`${p.id} : l'étiquette est celle d'une autre palette du camion`);
    const ok = {
      double: p.manque.length >= 1 && p.manque.length <= 2 && av.length >= 1 && av.length <= 3 && p.bl === plein,
      avarie: !p.manque.length && av.length >= 1 && av.length <= 3 && p.bl === plein,
      couche: p.manque.length >= 2 && p.manque.length <= p.W * p.D - 2 && !av.length && p.bl === reel,
      temp: !p.manque.length && !av.length && p.bl === plein,
      produit: !p.manque.length && !av.length && p.bl === plein,
      conforme: !p.manque.length && !av.length && p.bl === plein,
    }[p.alea];
    if (!ok) f.push(`${p.id} : quantités hors règle pour l'aléa ${p.alea}`);
  });
  // Le ticket : une seule remontée au-dessus de −15 °C, d'au moins 30 min (trois relevés de suite), et
  // tout le reste du trajet à −18 °C ou plus froid.
  const R = releves(jeu.remontee || {});
  const chauds = R.map(([, t], n) => (t > -15 ? n : -1)).filter((n) => n >= 0);
  const suite = chauds.length >= 3 && chauds.every((n, k) => !k || n === chauds[k - 1] + 1);
  if (!suite) f.push('ticket : pas une remontée unique d’au moins 30 min');
  if (R.some(([, t], n) => !chauds.includes(n) && t > -16)) f.push('ticket : relevé tiède hors de la remontée');
  return f;
}

// Le jeu de secours (donné seulement si 40 tirages de suite échouaient, ce que la suite de tests
// interdit sur des centaines de graines) : tiré une fois pour toutes sur une graine fixe, et vérifié
// par la suite de tests.
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), 'secours-picard-ent44').jeu;
export const TIRAGE = DECL;

/* ================================================================= le quai d'un élève */
export function quaiDuJeu(jeu) {
  return {
    id: 'picard-ent44',
    titre: 'Entrepôt Picard de Sainghin-en-Mélantois (59) — Quai 32, réception',
    destinataire: 'Picard',
    avertissement: AVERTISSEMENT,
    bonASavoir: BON_A_SAVOIR,
    lieu: LIEU,
    seuilHorsFroid: SEUIL_HORS_FROID,
    dechargement: DECHARGEMENT,
    couts: COUTS,
    aides: {},            // évaluation : aucune aide (ni chef de quai, ni repère, ni règle des couches)
    deuxMotifs: true,     // un second motif proposé pour chaque palette (une seule en a besoin)
    note: NOTE_ENT44,
    photos: PHOTOS,
    camions: [{
      transporteur: 'Transports Polarix', fournisseur: 'Les Cuisines de la Deûle', fictif: true, bl: jeu.bl, arrivee: '06:00',
      ticket: { remorque: jeu.remorque, societe: 'Polarix', consigne: -20, depart: '00:00', releves: releves(jeu.remontee) },
      qcmTicket: { attendu: 'long' },
      palettes: jeu.palettes,
    }],
  };
}
const cache = new Map();
// Le quai d'une graine (l'identifiant de l'élève), toujours le même pour la même graine.
export function quaiDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!cache.has(g)) cache.set(g, quaiDuJeu(tirerJeu(TIRAGE, g).jeu));
  return cache.get(g);
}
// Un quai de référence (graine vide), relu par le test de la règle du quai comme les autres contenus.
export const QUAI_REFERENCE = quaiDe('');

// 20 jalons pour tous : ticket, 6 comptages, 6 décisions, 4 réserves (double, temp, produit, avarie),
// pas de mention de déballage, signature, lot rentré.
export const ETAPES = etapesQuaiTire(quaiDe, graineDeBase);

export const ACCUEIL = {
  titre: 'Le rush du lundi — évaluation',
  kpis: ['mail'],
  etapes: [
    ['Lire le message du chef de quai', 'Menu Messagerie.'],
    ['Réceptionner le camion', 'Menu Quai de réception.'],
    ['Rendre ta copie', 'À la fin de la réception, ou quand ton enseignant le demande.'],
  ],
};

// Le mail d'accueil du chef de quai (personnage fictif) : court, sans conseil (brief §4). Texte écrit
// par Claude Code, à relire par Tristan.
export const VOLET = {
  id: 'picard-ent44',
  semer(prenom) {
    return { mails: [{ folder: 'in', ts: Date.now() - 600e3, from: 'Le chef de quai', fromMail: 'chef.quai@picard-quai.example',
      to: prenom, subject: 'Quai 32 : le camion de 6 h 00', kind: 'text',
      text: `Bonjour ${prenom}, lundi chargé : tu réceptionnes le camion de 6 h 00 au quai 32, sans moi. `
        + 'Les Cuisines de la Deûle, 6 palettes, transporteur Transports Polarix. — Le chef de quai' }] };
  },
};
