// Royal Canin — l'entrepôt de produits finis d'Aimargues : les DONNÉES PURES des séances ENT-16.1 à 16.5 (Terminale, C1.6 « gérer le suivi des stocks »
// par les indicateurs, C2.2 « optimiser les préparations de commandes », C3.1 « adapter le processus logistique selon le type de produit ou de flux »).
// Importé par la fabrique (`contenus/royal-canin.js`), les contenus de séance, les corrigés et les tests. Cadrage :
// `docs/briefs/royal-canin/CADRAGE-royal-canin-tle.md`.
//
// VÉRIFIÉ (recherche web, 26/10/2026) : royalcanin.com — deux usines françaises de croquettes, Aimargues (Gard, site historique et siège mondial,
// 1 200 personnes) et Cambrai ; 349 454 tonnes produites en 2024, environ 85 % exportées vers plus de 102 marchés ; marque du groupe Mars.
// mecalux.com (étude de cas) — l'entrepôt de produits finis d'Aimargues : 1 800 palettes, rayonnages de 7 m, canaux dynamiques à rouleaux aux niveaux
// bas pour les petits produits (réapprovisionnés par l'arrière), prélèvement sur palettes au sol, terminaux radio guidés par le WMS, zone de
// consolidation avec convoyeurs.
// CONSTRUIT : les références (désignations génériques, pas de noms de gamme réels), les stocks, les sorties, les délais, les lignes de commande, les
// lots et leurs dates de durabilité minimale (DDM), le client export et son exigence, les règles du site (objectif de couverture, règle
// d'implantation, capacité d'un canal), les prénoms (Sandrine, Mehdi).

// ─────────────────────────────────────────── les références (CONSTRUITES)
// `delai` : du lancement en production à l'arrivée à l'entrepôt, en jours ouvrés (le WMS l'exporte avec le stock). `site` : l'usine qui la produit ;
// l'extraction du WMS France mélange les deux sites, l'élève ne garde qu'Aimargues (ENT-16.2 et l'évaluation).
export const SITE = 'Aimargues', AUTRE_SITE = 'Cambrai';
export const REFS = [
  { ref: 'CH-ADU-15', nom: 'Croquettes chien adulte grande taille', kg: 15, delai: 4 },
  { ref: 'CT-INT-02', nom: 'Croquettes chat d’intérieur', kg: 2, carton: 6, delai: 3 },
  { ref: 'CH-CHI-03', nom: 'Croquettes chiot petite taille', kg: 3, carton: 4, delai: 6 },
  { ref: 'CT-STE-04', nom: 'Croquettes chat stérilisé', kg: 4, carton: 3, delai: 5 },
  { ref: 'VET-REN-02', nom: 'Aliment diététique vétérinaire, chat (reins)', kg: 2, carton: 6, delai: 10 },
  { ref: 'CH-MIN-08', nom: 'Croquettes chien mini adulte', kg: 8, delai: 4 },
  { ref: 'VET-DIG-10', nom: 'Aliment diététique vétérinaire, chien (digestion)', kg: 10, delai: 8 },
  { ref: 'CT-KIT-04', nom: 'Croquettes chaton', kg: 4, carton: 3, delai: 5 },
  // Ajoutées le 27/10/2026 pour les extractions du tableur (CONSTRUITES, comme les huit premières).
  { ref: 'CH-MED-10', nom: 'Croquettes chien taille moyenne adulte', kg: 10, delai: 5 },
  { ref: 'CH-SEN-12', nom: 'Croquettes chien senior grande taille', kg: 12, delai: 6 },
  { ref: 'CH-CHI-15', nom: 'Croquettes chiot grande taille', kg: 15, delai: 6 },
  { ref: 'CH-STE-08', nom: 'Croquettes chien stérilisé', kg: 8, delai: 5 },
  { ref: 'CH-LIG-12', nom: 'Croquettes chien contrôle du poids', kg: 12, delai: 6 },
  { ref: 'CT-SEN-04', nom: 'Croquettes chat senior', kg: 4, carton: 3, delai: 5 },
  { ref: 'CT-POI-02', nom: 'Croquettes chat beauté du poil', kg: 2, carton: 6, delai: 3 },
  { ref: 'CT-DIG-04', nom: 'Croquettes chat digestion sensible', kg: 4, carton: 3, delai: 5 },
  { ref: 'CT-URI-02', nom: 'Croquettes chat confort urinaire', kg: 2, carton: 6, delai: 3 },
  { ref: 'CT-STE-10', nom: 'Croquettes chat stérilisé, grand sac', kg: 10, delai: 5 },
  { ref: 'VET-URI-04', nom: 'Aliment diététique vétérinaire, chat (urinaire)', kg: 4, carton: 3, delai: 8 },
  { ref: 'VET-POI-12', nom: 'Aliment diététique vétérinaire, chien (poids)', kg: 12, delai: 8 },
  { ref: 'CH-MIN-02', nom: 'Croquettes chiot mini', kg: 2, carton: 6, delai: 4 },
  { ref: 'CT-INT-10', nom: 'Croquettes chat d’intérieur, grand sac', kg: 10, delai: 3 },
  { ref: 'VET-PEA-02', nom: 'Aliment diététique vétérinaire, chat (peau)', kg: 2, carton: 6, delai: 9 },
  { ref: 'VET-REN-07', nom: 'Aliment diététique vétérinaire, chien (reins)', kg: 7, delai: 10 },
  // Les références de l'autre usine française (Cambrai), présentes dans l'extraction du WMS France : à écarter.
  { ref: 'CH-MAX-15', nom: 'Croquettes chien très grande taille', kg: 15, delai: 5, site: AUTRE_SITE },
  { ref: 'CH-JUN-04', nom: 'Croquettes chiot taille moyenne', kg: 4, carton: 3, delai: 5, site: AUTRE_SITE },
  { ref: 'CH-ACT-15', nom: 'Croquettes chien actif', kg: 15, delai: 6, site: AUTRE_SITE },
  { ref: 'CT-ADU-04', nom: 'Croquettes chat adulte', kg: 4, carton: 3, delai: 4, site: AUTRE_SITE },
  { ref: 'CT-ADU-10', nom: 'Croquettes chat adulte, grand sac', kg: 10, delai: 4, site: AUTRE_SITE },
  { ref: 'CT-KIT-10', nom: 'Croquettes chaton, grand sac', kg: 10, delai: 5, site: AUTRE_SITE },
  { ref: 'CT-SEN-10', nom: 'Croquettes chat senior, grand sac', kg: 10, delai: 5, site: AUTRE_SITE },
  { ref: 'CH-SEN-03', nom: 'Croquettes chien senior petite taille', kg: 3, carton: 4, delai: 6, site: AUTRE_SITE },
];
export const REF = Object.fromEntries(REFS.map((r) => [r.ref, r]));
export const REFS_AIMARGUES = REFS.filter((r) => !r.site).map((r) => r.ref);
export const REFS_CAMBRAI = REFS.filter((r) => r.site === AUTRE_SITE).map((r) => r.ref);

// ─────────────────────────────────────────── les règles du site (CONSTRUITES, écrites dans les fiches méthode)
export const JOURS = 20;              // jours ouvrés du mois
export const OBJECTIF_COUVERTURE = 15; // au-delà : surstock
export const CAPACITE_CANAL = 24;     // cartons dans un canal dynamique
// Implantation du picking : 1) moins de 5 colis par jour → réserve (niveaux hauts, descendu à la demande) ; 2) sinon, sac de 8 kg ou plus → palette
// au sol ; 3) sinon → canal dynamique (cartons de petits sacs).
export function zoneDe(ref, colisJour) {
  if (colisJour < 5) return 'reserve';
  if (REF[ref].kg >= 8) return 'sol';
  return 'canal';
}
export const ZONES = { canal: 'Canal dynamique (niveau bas)', sol: 'Palette au sol', reserve: 'Réserve (niveaux hauts, à la demande)' };

// ─────────────────────────────────────────── les indicateurs
// ind : [réf, stock début, stock fin, sorties du mois, délai de réapprovisionnement en jours ouvrés]
export function indicateurs(D) {
  const out = {};
  for (const [ref, deb, fin, sorties, delai] of D.ind) {
    const sm = (deb + fin) / 2, conso = sorties / JOURS;
    out[ref] = { sm, rotation: Math.round((sorties / sm) * 100) / 100, conso, couverture: Math.round((fin / conso) * 100) / 100, delai };
  }
  const surstock = D.ind.map((x) => x[0]).filter((r) => out[r].couverture > OBJECTIF_COUVERTURE);
  const rupture = D.ind.map((x) => x[0]).filter((r) => out[r].couverture < out[r].delai);
  const service = Math.round((D.lignes.completes * 1000) / D.lignes.commandees) / 10;
  // La rupture la plus urgente : celle à qui il manque le plus de jours (délai − couverture).
  const urgente = rupture.slice().sort((a, b) => (out[b].delai - out[b].couverture) - (out[a].delai - out[a].couverture))[0] || null;
  return { par: out, surstock, rupture, service, urgente };
}

// ─────────────────────────────────────────── l'export : DDM restante exigée, FEFO parmi les lots conformes
// export : { client, exigeMois, aujourdhui 'AAAA-MM-JJ', ref, palettes, lots: [[lot, ddm 'AAAA-MM-JJ', palettes]] }
export const ajouterMois = (iso, m) => { const [a, mo, j] = iso.split('-').map(Number); const d = new Date(Date.UTC(a, mo - 1 + m, j)); return d.toISOString().slice(0, 10); };
export const fdate = (iso) => iso.split('-').reverse().join('/');
export function preparationExport(E) {
  const limite = ajouterMois(E.aujourdhui, E.exigeMois);
  const tries = E.lots.slice().sort((a, b) => (a[1] < b[1] ? -1 : 1));
  const conformes = tries.filter((l) => l[1] >= limite);
  const nonConformes = tries.filter((l) => l[1] < limite).map((l) => l[0]);
  let reste = E.palettes;
  const prises = [];
  for (const [lot, , n] of conformes) { if (reste <= 0) break; const q = Math.min(n, reste); prises.push([lot, q]); reste -= q; }
  // FIFO naïf (le collègue d'ENT-16.4) : les plus anciens d'abord, sans regarder l'exigence.
  let r2 = E.palettes;
  const fifo = [];
  for (const [lot, , n] of tries) { if (r2 <= 0) break; const q = Math.min(n, r2); fifo.push([lot, q]); r2 -= q; }
  return { limite, nonConformes, prises, lotsPris: prises.map((x) => x[0]), fifo, fifoNonConformes: fifo.map((x) => x[0]).filter((l) => nonConformes.includes(l)) };
}

// ─────────────────────────────────────────── l'implantation
// impl : [[réf, colis par jour]] ; reappro : réfs dont on demande les réappros par jour (en canal).
export function implantation(D) {
  const zones = Object.fromEntries(D.impl.map(([r, c]) => [r, zoneDe(r, c)]));
  const reappros = Object.fromEntries((D.reappro || []).map((r) => [r, Math.ceil(D.impl.find((x) => x[0] === r)[1] / CAPACITE_CANAL)]));
  return { zones, reappros };
}

// ─────────────────────────────────────────── les jeux
// ENT-16.1 (guidage, C1.6, tableur) : octobre, vingt références d'Aimargues, le même jeu pour tous (guidage). Ruptures CT-INT-02 (2 j / 3), CH-MIN-08
// (2 j / 4, la plus urgente) et CH-SEN-12 (5 j / 6) ; surstocks CH-CHI-03 (18 j), VET-REN-02 (25 j), CH-LIG-12 (20 j), VET-URI-04 (17,5 j) ;
// CH-MED-10 (6 j / 5) et CT-POI-02 (5 j / 3) n'en sont pas. Les questions au fil parlent de CH-ADU-15 (rotation 4) et de CT-INT-02.
export const D161 = {
  code: 'ENT-16.1', jour: 'lundi 2 novembre', mois: 'octobre',
  ind: [['CH-ADU-15', 500, 500, 2000, 4], ['CT-INT-02', 1400, 600, 6000, 3], ['CH-CHI-03', 160, 1440, 1600, 6],
    ['CT-STE-04', 400, 1200, 4000, 5], ['VET-REN-02', 300, 500, 400, 10], ['CH-MIN-08', 750, 300, 3000, 4],
    ['CH-MED-10', 900, 840, 2800, 5], ['CH-SEN-12', 400, 300, 1200, 6], ['CH-CHI-15', 600, 900, 2400, 6], ['CH-STE-08', 300, 600, 1600, 5],
    ['CH-LIG-12', 200, 1000, 1000, 6], ['CT-SEN-04', 500, 700, 2000, 5], ['CT-POI-02', 800, 900, 3600, 3], ['CT-DIG-04', 300, 450, 1200, 5],
    ['CT-URI-02', 600, 960, 2400, 3], ['CT-STE-10', 250, 350, 1000, 5], ['VET-URI-04', 150, 700, 800, 8], ['VET-POI-12', 200, 300, 600, 8],
    ['CH-MIN-02', 700, 900, 4000, 4], ['CT-INT-10', 300, 500, 1600, 3]],
  lignes: { commandees: 1250, completes: 1150 },
};
// ENT-16.2 (entraînement, C1.6, tableur) : novembre ; les valeurs sont TIRÉES pour chaque élève (`contenus/royal-canin-tableur.js`), 24 références
// d'Aimargues et 8 de Cambrai à écarter.
export const D162 = { code: 'ENT-16.2', jour: 'mardi 1er décembre', mois: 'novembre' };
// ENT-16.3 (présenter les indicateurs à la réunion, C1.6 et C3.4) : décembre ; valeurs TIRÉES pour chaque élève, 24 références d'Aimargues.
export const D163 = { code: 'ENT-16.3', jour: 'lundi 4 janvier', mois: 'décembre' };
// ENT-16.4 (guidage, C2.2 et C3.1) : la zone de picking ; six références à implanter ; réappros des deux canaux (120 → 5, 60 → 3).
export const D164 = {
  code: 'ENT-16.4', jour: 'jeudi 7 janvier',
  impl: [['CH-ADU-15', 100], ['CT-INT-02', 120], ['VET-REN-02', 3], ['CH-MIN-08', 90], ['CT-KIT-04', 60], ['VET-DIG-10', 4]],
  reappro: ['CT-INT-02', 'CT-KIT-04'],
};
// ENT-16.5 (erreur induite, C3.1) : la commande export préparée par Mehdi en FIFO ; le client exige 9 mois de DDM au départ.
export const D165 = {
  code: 'ENT-16.5', jour: 'lundi 1er mars 2027', collegue: 'Mehdi',
  export: { client: 'un distributeur à l’export (Asie du Sud-Est)', exigeMois: 9, aujourdhui: '2027-03-01', ref: 'CH-ADU-15', palettes: 4,
    lots: [['L7124', '2027-09-15', 2], ['L7203', '2027-11-20', 2], ['L7298', '2028-01-05', 1], ['L7312', '2028-02-10', 3], ['L7335', '2028-03-25', 2]] },
};
// ENT-16.6 (évaluation) : jeu NEUF sur les trois gestes ; les indicateurs de mars sont TIRÉS pour chaque élève (tableur, dépôt unique).
export const D166 = {
  code: 'ENT-16.6', jour: 'jeudi 1er avril 2027', mois: 'mars',
  export: { client: 'un distributeur à l’export (Amérique du Sud)', exigeMois: 8, aujourdhui: '2027-04-01', ref: 'CT-STE-04', palettes: 3,
    lots: [['L8011', '2027-10-10', 1], ['L8056', '2027-12-15', 2], ['L8102', '2028-01-20', 2], ['L8140', '2028-02-28', 1]] },
  impl: [['VET-REN-02', 2], ['CT-STE-04', 50]],
};

export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
