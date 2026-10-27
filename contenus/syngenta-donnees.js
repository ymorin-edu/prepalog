// Syngenta — ranger des produits dangereux : les DONNÉES PURES des séances ENT-15.1 à 15.4 (1re, C3.1 « adapter le processus logistique selon le type
// de produit ou de flux », et C1.5 « mettre en stock les produits »). Importé par la fabrique (`contenus/syngenta.js`), les contenus de séance, les
// corrigés et les tests. Cadrage : `docs/briefs/syngenta/CADRAGE-syngenta-1re.md`.
//
// VÉRIFIÉ (recherche web, 26/10/2026) : l'usine Syngenta Production France d'Aigues-Vives (Gard), classée SEVESO SEUIL HAUT ; elle formule et
// conditionne environ 45 matières actives en 400 produits LIQUIDES phytosanitaires (herbicides, insecticides, fongicides) ; dangers cités : liquides
// toxiques ou nocifs, liquides combustibles ; stockages de matières premières et de produits finis ; site entièrement sur rétention (fiche
// d'information du public, georisques.gouv.fr). Environ 25 millions de litres par an, en bidons, pour des agriculteurs de France et de l'étranger
// (Reporterre, 28/10/2020). Les pictogrammes de danger (règlement CLP) et leur sens.
// CONSTRUIT : le magasin des produits finis, ses quatre cellules, leurs places et leurs rétentions installées, la RÈGLE DE RANGEMENT (ordre des dangers)
// et la RÈGLE DE RÉTENTION de l'exercice (50 % du volume pour les inflammables, 20 % sinon, 800 L au moins : inspirée des règles courantes des
// installations classées, pas citée comme un texte), les produits (noms, formulations, pictogrammes), les palettes, les volumes, les prénoms.

// ─────────────────────────────────────────── les pictogrammes (règlement CLP, réels)
export const PICTOS = {
  SGH02: { nom: 'Flamme', sens: 'inflammable' },
  SGH05: { nom: 'Corrosion', sens: 'corrosif : brûle la peau, les yeux, attaque les métaux' },
  SGH06: { nom: 'Tête de mort', sens: 'toxique : peut tuer à petite dose' },
  SGH07: { nom: 'Point d’exclamation', sens: 'nocif, irritant' },
  SGH08: { nom: 'Danger pour la santé', sens: 'effets graves sur la santé (cancer, organes…)' },
  SGH09: { nom: 'Environnement', sens: 'dangereux pour les milieux aquatiques' },
};

// ─────────────────────────────────────────── le magasin (construit) : la règle de rangement
// Un produit va dans la cellule de son danger le PLUS FORT, dans cet ordre : SGH02 → C1 ; sinon SGH06 ou SGH08 → C2 ; sinon SGH05 → C3 ; sinon → C4.
// Une cellule pleine : la palette reste en ZONE D'ATTENTE du quai (jamais dans une autre cellule) et on prévient le responsable. Les palettes se rangent
// dans l'ordre de leur numéro.
export const CELLULES = [
  { id: 'C1', nom: 'Cellule 1 — inflammables', inflammable: true },
  { id: 'C2', nom: 'Cellule 2 — toxiques et dangers pour la santé' },
  { id: 'C3', nom: 'Cellule 3 — corrosifs' },
  { id: 'C4', nom: 'Cellule 4 — autres dangers' },
];
export const CELLULE = Object.fromEntries(CELLULES.map((c) => [c.id, c]));
export const ATTENTE = 'attente';
export function celluleDe(pictos) {
  if (pictos.includes('SGH02')) return 'C1';
  if (pictos.includes('SGH06') || pictos.includes('SGH08')) return 'C2';
  if (pictos.includes('SGH05')) return 'C3';
  return 'C4';
}
// La rétention d'une cellule (règle de l'exercice) : 50 % du volume stocké pour les inflammables, 20 % pour les autres, jamais moins de 800 L
// (ou tout le volume s'il fait moins de 800 L).
export function retention(cellule, volume) {
  const part = CELLULE[cellule].inflammable ? 0.5 : 0.2;
  return Math.max(Math.round(volume * part), Math.min(800, volume));
}

// ─────────────────────────────────────────── les produits (CONSTRUITS : noms, formulations, pictogrammes)
export const PRODUITS = [
  { ref: 'HM-960', nom: 'Herbicide maïs, concentré émulsionnable', pictos: ['SGH02', 'SGH07', 'SGH09'] },
  { ref: 'FV-250', nom: 'Fongicide vigne, suspension concentrée', pictos: ['SGH09'] },
  { ref: 'IN-050', nom: 'Insecticide, concentré émulsionnable', pictos: ['SGH02', 'SGH06', 'SGH09'] },
  { ref: 'HB-400', nom: 'Herbicide blé, solution', pictos: ['SGH05', 'SGH09'] },
  { ref: 'RG-100', nom: 'Régulateur de croissance, solution', pictos: ['SGH08'] },
  { ref: 'IN-200', nom: 'Insecticide, suspension concentrée', pictos: ['SGH06', 'SGH09'] },
  { ref: 'FC-500', nom: 'Fongicide céréales, émulsion', pictos: ['SGH07', 'SGH08', 'SGH09'] },
  { ref: 'AD-010', nom: 'Adjuvant mouillant', pictos: ['SGH07'] },
  { ref: 'HD-720', nom: 'Désherbant, solution', pictos: ['SGH05', 'SGH07'] },
];
export const PRODUIT = Object.fromEntries(PRODUITS.map((p) => [p.ref, p]));

// ─────────────────────────────────────────── les jeux
// palettes : [numéro, référence, bidons, litres par bidon] ; etat : { cellule: [litres déjà stockés, places libres, rétention installée en L] }.
// ENT-15.1 (guidage) : six palettes, de la place partout ; la rétention de C1 (1 200 + 600 + 600 = 2 400 L → 1 200 L).
export const D151 = {
  code: 'ENT-15.1', jour: 'lundi 15 mars', retention: ['C1'],
  etat: { C1: [1200, 6, 2000], C2: [1800, 5, 1000], C3: [600, 4, 1000], C4: [2400, 6, 1000] },
  palettes: [['PAL-1', 'HM-960', 60, 10], ['PAL-2', 'FV-250', 40, 20], ['PAL-3', 'IN-200', 120, 5], ['PAL-4', 'HB-400', 40, 20],
    ['PAL-5', 'IN-050', 60, 10], ['PAL-6', 'RG-100', 120, 5]],
};
// ENT-15.2 (entraînement) : huit palettes ; C1 n'a que deux places (PAL-17 reste en attente) ; la rétention de C1 ne suffit plus (2 100 L contre 2 000) ;
// celle de C3 tombe sur le minimum de 800 L.
export const D152 = {
  code: 'ENT-15.2', jour: 'mardi 16 mars', retention: ['C1', 'C3'],
  etat: { C1: [3000, 2, 2000], C2: [1200, 5, 1000], C3: [2400, 3, 1000], C4: [1800, 6, 1000] },
  palettes: [['PAL-11', 'FC-500', 60, 10], ['PAL-12', 'HD-720', 40, 20], ['PAL-13', 'IN-050', 120, 5], ['PAL-14', 'AD-010', 40, 20],
    ['PAL-15', 'HM-960', 60, 10], ['PAL-16', 'IN-200', 60, 10], ['PAL-17', 'HM-960', 40, 20], ['PAL-18', 'FV-250', 40, 20]],
};
// ENT-15.3 (erreur induite) : le plan de rangement de Lucas, avec deux palettes mal rangées (IN-050 en C2, HD-720 en C4) et la rétention de C1 prise
// à 20 % (il trouve 800 L, « installée 1 500 L : OK ») : la vraie est 1 900 L, la rétention ne suffit pas.
export const D153 = {
  code: 'ENT-15.3', jour: 'jeudi 18 mars', retention: ['C1'], collegue: 'Lucas',
  etat: { C1: [1800, 6, 1500], C2: [1200, 5, 1000], C3: [600, 4, 1000], C4: [1200, 6, 1000] },
  palettes: [['PAL-21', 'IN-050', 60, 10], ['PAL-22', 'FV-250', 40, 20], ['PAL-23', 'HD-720', 40, 20], ['PAL-24', 'HM-960', 60, 10],
    ['PAL-25', 'RG-100', 120, 5], ['PAL-26', 'HM-960', 40, 20]],
  planCollegue: { 'PAL-21': 'C2', 'PAL-22': 'C4', 'PAL-23': 'C4', 'PAL-24': 'C1', 'PAL-25': 'C2', 'PAL-26': 'C1' },
  partCollegue: 0.2,
};
// ENT-15.4 (évaluation) : jeu NEUF ; C2 n'a qu'une place (PAL-35 en attente) ; la rétention de C2 tombe sur le minimum (3 000 L → 800 L, installée
// 1 000 L : elle suffit).
export const D154 = {
  code: 'ENT-15.4', jour: 'lundi 22 mars', retention: ['C2'],
  etat: { C1: [600, 5, 1500], C2: [2400, 1, 1000], C3: [1200, 4, 1000], C4: [1800, 6, 1000] },
  palettes: [['PAL-31', 'FC-500', 120, 5], ['PAL-32', 'IN-050', 40, 20], ['PAL-33', 'AD-010', 60, 10], ['PAL-34', 'HB-400', 40, 20],
    ['PAL-35', 'IN-200', 60, 10], ['PAL-36', 'HM-960', 60, 10]],
};

// ─────────────────────────────────────────── le bilan d'un jeu
export const litres = ([, , b, l]) => b * l;
export function bilan(D) {
  const places = Object.fromEntries(Object.entries(D.etat).map(([c, e]) => [c, e[1]]));
  const rangement = {};
  const ajoute = { C1: 0, C2: 0, C3: 0, C4: 0 };
  for (const p of D.palettes) {
    const c = celluleDe(PRODUIT[p[1]].pictos);
    if (places[c] > 0) { places[c] -= 1; rangement[p[0]] = c; ajoute[c] += litres(p); } else rangement[p[0]] = ATTENTE;
  }
  const volumes = Object.fromEntries(Object.keys(D.etat).map((c) => [c, D.etat[c][0] + ajoute[c]]));
  const retentions = Object.fromEntries(Object.keys(D.etat).map((c) => [c, retention(c, volumes[c])]));
  const suffit = Object.fromEntries(Object.keys(D.etat).map((c) => [c, D.etat[c][2] >= retentions[c]]));
  const attente = D.palettes.map((p) => p[0]).filter((p) => rangement[p] === ATTENTE);
  return { rangement, volumes, retentions, suffit, attente };
}
// Ce qu'a fait le collègue d'ENT-15.3 : son plan, son volume de C1, sa rétention de C1.
export function travailDeLucas(D) {
  const B = bilan(D);
  const faux = D.palettes.map((p) => p[0]).filter((p) => D.planCollegue[p] !== B.rangement[p]);
  const volC1 = D.etat.C1[0] + D.palettes.filter((p) => D.planCollegue[p[0]] === 'C1').reduce((t, p) => t + litres(p), 0);
  const retC1 = Math.max(Math.round(volC1 * D.partCollegue), Math.min(800, volC1));
  return { faux, volC1, retC1, ok: D.etat.C1[2] >= retC1 };
}

export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
