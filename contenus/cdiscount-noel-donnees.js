// Cdiscount — le pic de Noël : les DONNÉES PURES des séances ENT-2.7 à 2.10 (1re, C2.2 « optimiser les préparations de commandes en fonction des
// demandes »). Importé par la fabrique (`contenus/cdiscount-noel.js`), les contenus de séance (`contenus/cdiscount-ent27.js` …), les corrigés et les
// tests. Cadrage : `docs/briefs/cdiscount-noel/CADRAGE-cdiscount-noel-1re.md`.
//
// VÉRIFIÉ (recherche web, 26/10/2026) : l'entrepôt historique de Cdiscount à Cestas (Gironde) ; les robots Skypod d'Exotec qui y préparent les petits
// articles depuis 2016 ; pour le Black Friday 2018, un pic annoncé à 156 commandes par seconde et des équipes d'entrepôt triplées, surtout par
// des intérimaires (Journal du Net, 27/11/2018) ; le Code du travail, art. L1251-6 (le recours à l'intérim, dont l'« accroissement temporaire de
// l'activité de l'entreprise »).
// CONSTRUIT : la zone de préparation manuelle « M » (une allée, douze emplacements, leurs distances), les références qui y sont rangées et leurs
// lignes de commande, les commandes de la vague, la prévision du jour de pic, la productivité, les effectifs, les prénoms (Nadia vient des séances
// ENT-2.1 à 2.6, Yanis est nouveau). Les marques des articles sont celles, inventées, du catalogue Cdiscount de Prepalog.

// ─────────────────────────────────────────── la règle des calculs (écrite dans les fiches méthode)
// Une LIGNE de commande = une référence dans une commande, quelle que soit la quantité.
// Classe A : les références les plus demandées, prises dans l'ordre, jusqu'à ATTEINDRE 80 % des lignes (celle qui fait atteindre 80 % est en A).
// Implantation : les références de classe A vont aux emplacements les plus proches du poste d'emballage, la plus demandée au plus près.
// Distance : chaque ligne préparée commande par commande = un aller-retour poste → emplacement (2 × la distance d'aller).
// Une tournée (une commande, ou un lot de commandes) va jusqu'à l'emplacement le plus LOIN qu'elle doit servir et revient : 2 × la plus grande
// distance d'aller ; on passe devant les autres emplacements en chemin.
// Marche : 1 mètre par seconde. Tri d'un lot au poste : TRI secondes par ligne (on prélève en vrac, on répartit ensuite par commande).
// Effectif : préparateurs = lignes ÷ (productivité × heures), arrondi au nombre ENTIER SUPÉRIEUR ; intérimaires = préparateurs − permanents.

// ─────────────────────────────────────────── l'allée de la zone M (construite) : [emplacement, distance d'aller depuis le poste en m, référence]
const ALLEE_48 = [
  ['M-01', 4, 'PIL-AA-8'], ['M-02', 8, 'VEI-LED'], ['M-03', 12, 'COR-SAU'], ['M-04', 16, 'HUB-USB-4'],
  ['M-05', 20, 'SUP-VOIT'], ['M-06', 24, 'CLE-64G'], ['M-07', 28, 'CHG-20W'], ['M-08', 32, 'CAS-FIL-01'],
  ['M-09', 36, 'ECO-BT-01'], ['M-10', 40, 'SOU-SF-02'], ['M-11', 44, 'LAM-FRO'], ['M-12', 48, 'BAT-10K'],
];
const ALLEE_50 = [
  ['M-01', 4, 'COR-SAU'], ['M-02', 8, 'PIL-AA-8'], ['M-03', 12, 'HUB-USB-4'], ['M-04', 16, 'VEI-LED'],
  ['M-05', 20, 'CLE-64G'], ['M-06', 24, 'GOU-ISO-75'], ['M-07', 28, 'SUP-VOIT'], ['M-08', 32, 'LAM-FRO'],
  ['M-09', 36, 'CAS-FIL-01'], ['M-10', 40, 'CLA-SF-01'],
];

// ─────────────────────────────────────────── les jeux
// ENT-2.7 (guidage) : la semaine 48, celle du Black Friday (27/11/2026). Trois références font 80 % des lignes (1 600 sur 2 000), rangées loin du poste.
export const D27 = {
  code: 'ENT-2.7', semaine: 48, jour: 'lundi 30 novembre',
  allee: ALLEE_48,
  lignes: { 'PIL-AA-8': 40, 'VEI-LED': 10, 'COR-SAU': 25, 'HUB-USB-4': 35, 'SUP-VOIT': 50, 'CLE-64G': 60, 'CHG-20W': 380, 'CAS-FIL-01': 70,
    'ECO-BT-01': 700, 'SOU-SF-02': 90, 'LAM-FRO': 20, 'BAT-10K': 520 },
};
// ENT-2.8 (entraînement) : la vague de 8 h de la zone M, dix commandes, un chariot de cinq commandes au plus. Allée de la semaine 48 (avant
// réimplantation : c'est la vague de ce matin, l'implantation d'ENT-2.7 n'est faite que cette nuit).
export const D28 = {
  code: 'ENT-2.8', jour: 'mardi 1er décembre, 8 h',
  allee: ALLEE_48, chariot: 5, tri: 15,
  commandes: [
    ['C-4801', ['M-03']], ['C-4802', ['M-12', 'M-03']], ['C-4803', ['M-09']], ['C-4804', ['M-09', 'M-01']], ['C-4805', ['M-12']],
    ['C-4806', ['M-10', 'M-07']], ['C-4807', ['M-12']], ['C-4808', ['M-09', 'M-02', 'M-07']], ['C-4809', ['M-11']], ['C-4810', ['M-12', 'M-09']],
  ],
};
// ENT-2.9 (erreur induite) : l'effectif du lundi du pic, calculé par Yanis sur les COLIS au lieu des LIGNES, et arrondi vers le bas.
export const D29 = {
  code: 'ENT-2.9', jour: 'mercredi 2 décembre', pic: 'lundi 7 décembre',
  prevision: { lignes: 9600, colis: 6000, commandes: 4800 }, productivite: 60, heures: 7, permanents: 9,
  collegue: 'Yanis', base: 'colis',
};
// ENT-2.10 (évaluation) : la semaine 50, avant Noël. Jeu NEUF sur les trois gestes : deux références font 80 % (1 200 sur 1 500), huit commandes
// et un chariot de quatre, l'effectif du lundi 21 décembre (7 200 lignes, 4 500 colis : le piège des colis reste possible).
export const D210 = {
  code: 'ENT-2.10', semaine: 50, jour: 'lundi 14 décembre',
  allee: ALLEE_50,
  lignes: { 'COR-SAU': 30, 'PIL-AA-8': 80, 'HUB-USB-4': 15, 'VEI-LED': 5, 'CLE-64G': 60, 'GOU-ISO-75': 750, 'SUP-VOIT': 40, 'LAM-FRO': 50,
    'CAS-FIL-01': 20, 'CLA-SF-01': 450 },
  chariot: 4, tri: 15,
  commandes: [
    ['C-5201', ['M-08']], ['C-5202', ['M-10', 'M-02']], ['C-5203', ['M-05']], ['C-5204', ['M-10']],
    ['C-5205', ['M-09']], ['C-5206', ['M-03', 'M-07']], ['C-5207', ['M-10']], ['C-5208', ['M-06']],
  ],
  pic: 'lundi 21 décembre', prevision: { lignes: 7200, colis: 4500, commandes: 3600 }, productivite: 60, heures: 7, permanents: 9,
};

// ─────────────────────────────────────────── les calculs
export const distanceDe = (D, emp) => { const e = D.allee.find((x) => x[0] === emp); if (!e) throw new Error(`${D.code} : emplacement inconnu ${emp}`); return e[1]; };
export const refDe = (D, emp) => D.allee.find((x) => x[0] === emp)[2];
export const empDe = (D, ref) => D.allee.find((x) => x[2] === ref)[0];

// La classe A et ce qu'elle pèse.
export function abc(D) {
  const total = Object.values(D.lignes).reduce((t, x) => t + x, 0);
  const tri = Object.entries(D.lignes).sort((a, b) => b[1] - a[1]);
  const A = [];
  let cumul = 0;
  for (const [ref, n] of tri) { if (cumul * 100 >= 80 * total) break; A.push(ref); cumul += n; }
  return { total, tri, classeA: A, lignesA: cumul, pctLignes: Math.round((cumul * 1000) / total) / 10, pctRefs: Math.round((A.length * 1000) / tri.length) / 10 };
}

// La réimplantation de la classe A : la plus demandée au plus près ; distance de la semaine pour la classe A, avant et après (aller-retour par ligne).
export function implantation(D) {
  const { classeA } = abc(D);
  const proches = D.allee.slice().sort((a, b) => a[1] - b[1]).slice(0, classeA.length).map((x) => x[0]);
  const places = Object.fromEntries(classeA.map((r, i) => [r, proches[i]]));
  const avant = classeA.reduce((t, r) => t + 2 * D.lignes[r] * distanceDe(D, empDe(D, r)), 0);
  const apres = classeA.reduce((t, r) => t + 2 * D.lignes[r] * distanceDe(D, places[r]), 0);
  return { places, emplacements: proches, avant, apres };
}

// Commande par commande ou par lots (dans l'ordre d'arrivée, D.chariot commandes par lot).
export function preparation(D) {
  const tournee = (emps) => 2 * Math.max(...emps.map((e) => distanceDe(D, e)));
  const parCommande = D.commandes.map(([c, emps]) => [c, tournee(emps)]);
  const lots = [];
  for (let i = 0; i < D.commandes.length; i += D.chariot) lots.push(D.commandes.slice(i, i + D.chariot));
  const parLot = lots.map((L) => [L.map((x) => x[0]), tournee(L.flatMap((x) => x[1]))]);
  const cmd = parCommande.reduce((t, x) => t + x[1], 0);
  const lot = parLot.reduce((t, x) => t + x[1], 0);
  const nLignes = D.commandes.reduce((t, x) => t + x[1].length, 0);
  const marche = (cmd - lot) / 60;           // minutes gagnées à la marche (1 m/s)
  const tri = (nLignes * D.tri) / 60;         // minutes de tri ajoutées par les lots
  return { parCommande, parLot, cmd, lot, nLignes, marche, tri, gainNet: marche - tri, methode: marche > tri ? 'lots' : 'commande' };
}

// L'effectif du jour de pic, et le calcul du collègue (sur les colis, arrondi vers le bas) quand il y en a un.
export function effectif(D) {
  const parPrep = D.productivite * D.heures;
  const besoin = Math.ceil(D.prevision.lignes / parPrep);
  const interim = Math.max(0, besoin - D.permanents);
  const out = { parPrep, besoin, interim, brut: D.prevision.lignes / parPrep };
  if (D.collegue) {
    const brutC = D.prevision[D.base] / parPrep;
    const besoinC = Math.floor(brutC);
    out.collegue = { brut: brutC, besoin: besoinC, interim: Math.max(0, besoinC - D.permanents) };
    out.retard = D.prevision.lignes - besoinC * parPrep;    // lignes non préparées à la fin du poste avec son effectif
  }
  return out;
}

export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
