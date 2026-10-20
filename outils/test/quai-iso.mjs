// Suite de tests de Prepalog — bloc « quai-iso » : le kit de dessin du quai iso (core/iso.js) et, plus tard, le
// mode scène de la vue quai (core/types/quai.js). Chantier moteur D-4, brief `docs/briefs/MOTEUR-quai-inspection.md`.
//
// `node outils/test.mjs quai-iso` ne lance que ce bloc. Un bloc à part (décision du 10/10/2026) : un bloc
// d'entreprise ne doit pas porter un mode générique, et celui-ci tourne en même temps que les autres.
//
// ÉTAPE 0 — LA RÉFÉRENCE SPARTOO. `outils/test/fichiers/quai-iso-reference.json` fige, AVANT toute retouche du
// kit, ce que dessinent aujourd'hui les objets du quai (façade, camion à trois reculs, niveleur, mur à trois
// ouvertures, sol, palette à quatre rotations…) et le SVG des écrans ① à ④ du quai d'ENT-1.1 (Spartoo, la seule
// séance en `rendu: 'iso'`). Le cas compare OCTET POUR OCTET : tout ce que l'on ajoute au kit prend ses
// paramètres EN DERNIER, avec pour défaut le dessin d'aujourd'hui, et cette référence doit rester verte.
// Les bulles de parole (`data-iso-bulle`) sont retirées de la capture : leur largeur dépend de la police.
//
// ÉTAPE 2 — L'INSPECTION SUR LA SCÈNE (`securite.mode: 'scene'`) : la validation du contenu, l'état de chaque objet, les zones et
// le point touché (fonctions pures), puis la scène d'ENT-6.4 jouée à la souris dans le vrai moteur d'entreprise.
//
// ÉTAPE 3 — LA PALETTE DE FÛTS (`forme: 'fut'`) : le kit (`paletteFuts`), la validation du contenu, le total / réel / avaries calculés, ② ③ ④ jouées
// avec les quatre palettes d'ENT-6.4 de la page d'essai.
//
// ÉTAPE 4 — L'UNITÉ ET LES LIBELLÉS (`unite`, `libelles`, `motifs`) : sans eux, les textes d'aujourd'hui, caractère pour caractère ; avec `fûts`, plus un seul « carton » à l'écran.
//
// ÉTAPE 5 — LE DÉCHARGEMENT AU CHARIOT FRONTAL (`dechargement.par: 'cariste'` + `rendu: 'iso'`) : le plan du chariot (fonction pure : ordre de sortie, ouverture, aucune collision),
// le dessin (gilet jaune, roues rondes, coupé au mur), les mêmes places qu'avec le chauffeur, le mouvement réduit. Sans `cariste`, rien ne change (référence de l'étape 0).
//
// MOTEUR-CHEP, LOT B — LES PILES DE PALETTES VIDES (`forme: 'pile'`, 18/10/2026) : `comptePile` et la décision calculée (valeurs écrites à la main),
// les refus au chargement, le kit (dégât de deux vues seulement, pile moins haute, ni texte ni vert), l'écran ③ (rien ne nomme le pool ni le dégât),
// les accords au féminin, la réserve chiffrée « d'un autre pool », pas de « Refuser », le bon de collecte (« BC »), la partie 5 de la page jouée de bout en bout.
//
// Pour régénérer la référence (seulement si le dessin de Spartoo doit vraiment changer, avec l'accord de
// Tristan) : QUAI_ISO_REGENERER=1 node outils/test.mjs quai-iso

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function bloc({ v, nav, BASE, ROOT, egal, vrai }) {

const FICHIER_REF = path.join(ROOT, 'outils', 'test', 'fichiers', 'quai-iso-reference.json');
const REGENERER = process.env.QUAI_ISO_REGENERER === '1';

const erreurs = [];
// Mouvement réduit : le quai montre tout de suite l'état final de chaque animation (aucune image n'est
// jouée par le temps), donc la capture ne dépend d'aucune horloge.
const ctx = await nav.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
async function nouvellePage() {
  const p = await ctx.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  return p;
}
const pg = await nouvellePage();

/* ------------------------------------------------------------------ étape 0 : la référence */

// Les sorties du kit, une chaîne SVG par clé. Les projections sont celles que prend la vue quai : « dehors »
// (arrivée) et « dedans » (intérieur), plus la palette en grand de l'écran ③.
const capturerKit = () => pg.evaluate(async () => {
  const K = await import('/core/iso.js');
  const dehors = K.projection({ unite: 54, origine: [330, 150] });
  const dedans = K.projection({ unite: 60, origine: [470, 235] });
  const grand = K.projection({ unite: 150, origine: [470, 190] });
  const x = K.X_PORTE_FACADE[1];
  const palette = {
    nW: 2, nD: 2, nL: 3, total: 12,
    cartons: [].concat(...[0, 1, 2].map((k) => [0, 1].map((j) => [0, 1].map((i) => ({
      i, j, k, no: 1 + k * 4 + j * 2 + i, absent: i === 0 && j === 0 && k === 2, abime: i === 1 && j === 0 && k === 1 ? 'N' : null,
      etiq: { haut: 'PUMA', no: `${1 + k * 4 + j * 2 + i}/12`, ref: `REF-${k}`, bas: `T.${k}` },
    }))))).flat(),
  };
  const R = {};
  R.facade = K.facadeQuai(dehors, ['6', '7', '8']);
  R.facadeParDefaut = K.facadeQuai(dehors);
  R.camion = {};
  for (const yr of [0.35, 4, 8.5]) R.camion[`recul-${yr}`] = K.camionPorteur(dehors, x, yr);
  R.camionAutrePorte = K.camionPorteur(dehors, K.X_PORTE_FACADE[0], 2);
  R.niveleur = { dedans: K.niveleur(dedans, 'dedans'), dehors: K.niveleur(dedans, 'dehors'), parDefaut: K.niveleur(dedans) };
  R.mur = {};
  for (const ouv of [0, 0.5, 1]) R.mur[`ouverture-${ouv}`] = K.murQuai(dedans, ouv, 'Quai 7');
  R.murSansNom = K.murQuai(dedans, 0.5);
  R.sol = K.solQuai(dedans, 'Zone de réception');
  R.solParDefaut = K.solQuai(dedans);
  R.remorque = K.remorqueInterieur(dedans);
  R.ouverture = K.ouvertureQuai(dedans);
  R.horloge = K.horlogeQuai(dedans, 6.6, 0.01, 2.25, '10:30');
  R.personne = { debout: K.personne(dehors, 5.05, 3.2), dos: K.personne(dedans, 2.6, 2.1, { dos: true, pas: 0.25 }) };
  const tp = K.transpaletteManuel(dedans, 2.6, -1);
  R.transpalette = { svg: tp.svg, poignee: tp.poignee.map((n) => +n.toFixed(1)) };
  R.palette = {};
  for (const r of [0, 1, 2, 3]) {
    R.palette[`rotation-${r}`] = K.paletteCartons(grand, palette, -0.6 + 0.85, -0.4 + 0.2, r, { lisible: true, sel: 6,
      attrs: (c) => `data-c="${c.no}"` });
  }
  R.paletteDansRemorque = K.paletteCartons(dedans, palette, 2.6, -2.9, 3, { yMin: -99, yMax: 0, lisible: false });
  R.paletteDevantMur = K.paletteCartons(dedans, palette, 2.6, 2.1, 3, { yMin: 0, yMax: 99, lisible: false });
  return R;
});
// Le SVG des écrans ① à ④ du quai d'ENT-1.1, monté dans le vrai moteur d'entreprise sur le contenu de
// Spartoo (le quai seul, sans la messagerie : le questionnaire n'a rien à voir avec le dessin), puis joué
// comme le fait `spartoo.mjs` (« quai en 2D iso »). Les `data-iso-bulle` sont retirés, et rien d'autre.
const monterSpartoo = (p) => p.evaluate(async () => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-animation.js');
  const S = await import('/contenus/spartoo-reception.js');
  document.querySelector('#qiTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'qiTest'; document.body.prepend(hote);
  const db = {};
  const U = Object.assign(E.univers(), { quai: S.QUAI, animations: [], etapes: [] });
  const ctx = {
    meta: { id: 'essai-quai-iso', code: 'ESSAI', titre: 'Essai du quai iso', portee: 'eleve', immersif: true, temps: 'guidage', bareme: 2 },
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  };
  creerEntreprise(U).rendre(hote, ctx);
  document.querySelector('#qiTest .ent-nav[data-vue="quai"]').click();
});
const svgSansBulles = (p, sel) => p.$eval(sel, (n) => {
  const s = n.cloneNode(true);
  s.querySelectorAll('[data-iso-bulle]').forEach((b) => b.remove());
  return s.outerHTML;
});
async function capturerSpartoo() {
  const p = await nouvellePage();
  await monterSpartoo(p);
  const R = {};
  await p.waitForSelector('#qiTest [data-q-arrivee]');
  await p.waitForSelector('#qiTest [data-q-apres-arrivee]:not([hidden])');
  R.ecran1 = await svgSansBulles(p, '#qiTest [data-q-arrivee]');
  await p.click('#qiTest [data-q="decharger"]');
  await p.waitForSelector('#qiTest [data-q="vers3"]:not([disabled])');
  R.ecran2 = await svgSansBulles(p, '#qiTest [data-q-scene2]');
  await p.click('#qiTest [data-q="vers3"]');
  await p.waitForSelector('#qiTest [data-q-palette] [data-q-carton]');
  R.ecran3 = await svgSansBulles(p, '#qiTest [data-q-palette]');
  // Palette tournée d'un demi-tour : l'enfoncement du carton 6 apparaît.
  await p.click('#qiTest [data-q="tourner"]:not([data-sens])'); await p.click('#qiTest [data-q="tourner"]:not([data-sens])');
  R.ecran3Arriere = await svgSansBulles(p, '#qiTest [data-q-palette]');
  await p.click('#qiTest [data-q="tourner"][data-sens="-1"]'); await p.click('#qiTest [data-q="tourner"][data-sens="-1"]');
  await p.check('#qiTest [data-q-fr="ras"][data-ref="PM-SUE-RG-39"]');
  await p.fill('#qiTest [data-q-fr="endo"][data-ref="PM-RSX-BL-42"]', '1');
  await p.fill('#qiTest [data-q-fr="manq"][data-ref="PM-SUE-MA-41"]', '1');
  for (const [ref, n] of [['PM-SUE-RG-39', 4], ['PM-RSX-BL-42', 4], ['PM-SUE-MA-41', 3]]) {
    await p.fill(`#qiTest [data-q-compte-ref="${ref}"]`, String(n)); await p.press(`#qiTest [data-q-compte-ref="${ref}"]`, 'Enter');
  }
  await p.click('#qiTest #qDec-reserves'); await p.click('#qiTest #qMot-avarie'); await p.click('#qiTest #qMot-manquant');
  await p.click('#qiTest [data-q="valider"]');
  await p.click('#qiTest [data-q="vers4"]'); await p.click('#qiTest [data-q="vers4"]');
  await p.waitForSelector('#qiTest #qRes-P1');
  R.ecran4 = await svgSansBulles(p, '#qiTest [data-q-cf]');
  await p.fill('#qiTest #qRes-P1', '1'); await p.fill('#qiTest #qRes2-P1', '1');
  await p.click('#qiTest [data-q="ecrire"]');
  await p.click('#qiTest [data-q="signer"]');
  await p.waitForFunction(() => /reparti/.test((document.querySelector('#qiTest [data-q-etatcf]') || {}).textContent || ''));
  R.ecran4Parti = await svgSansBulles(p, '#qiTest [data-q-cf]');
  await p.close();
  return R;
}

await v('Quai iso : le kit et les écrans ① à ④ de Spartoo restent identiques à la référence (octet pour octet)', async () => {
  const mesure = { kit: await capturerKit(), spartoo: await capturerSpartoo() };
  if (REGENERER) {
    fs.mkdirSync(path.dirname(FICHIER_REF), { recursive: true });
    fs.writeFileSync(FICHIER_REF, JSON.stringify(mesure, null, 1) + '\n');
    console.log('  (référence régénérée : ' + FICHIER_REF + ')');
    return;
  }
  const ref = JSON.parse(fs.readFileSync(FICHIER_REF, 'utf8'));
  const ecarts = [];
  const comparer = (a, b, chemin) => {
    if (typeof a === 'string' && typeof b === 'string') {
      if (a === b) return;
      let i = 0; while (i < a.length && a[i] === b[i]) i++;
      ecarts.push(`${chemin} : premier écart au caractère ${i} (référence « ${a.slice(Math.max(0, i - 25), i + 40)} », maintenant « ${b.slice(Math.max(0, i - 25), i + 40)} »)`);
    } else if (a && b && typeof a === 'object' && typeof b === 'object') {
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) comparer(a[k], b[k], `${chemin}.${k}`);
    } else if (JSON.stringify(a) !== JSON.stringify(b)) ecarts.push(`${chemin} : ${JSON.stringify(a)} -> ${JSON.stringify(b)}`);
  };
  comparer(ref, mesure, 'référence');
  if (ecarts.length) throw new Error(`${ecarts.length} écart(s) avec la référence de Spartoo :\n    ${ecarts.slice(0, 6).join('\n    ')}`);
});

/* ------------------------------------------------------------------ étape 1 : le kit de sécurité */

// La page d'essai (outils/essai-quai-inspection.html) : les deux vues et un sélecteur d'état par objet. Les tests
// la pilotent comme Tristan : ils règlent un état, puis lisent ce qui est dessiné et la zone annoncée.
const ctxLarge = await nav.newContext({ viewport: { width: 1400, height: 1100 }, reducedMotion: 'reduce' });
const ctxMouvement = await nav.newContext({ viewport: { width: 1400, height: 1100 }, reducedMotion: 'no-preference' });
async function pageEssai(c = ctxLarge) {
  const p = await c.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE + 'outils/essai-quai-inspection.html');
  await p.waitForSelector('svg[data-vue="dehors"] [data-essai-objet]');
  return p;
}
const pe = await pageEssai();
const regler = (p, nom, val) => p.check(`input[name="${nom}"][value="${val}"]`);
// Chaque cas repart de l'état de départ de la page (un cas qui échoue ne fausse pas le suivant).
const ETATS_PAGE = { cabine: 'conduite', fumee: 'true', cale: 'posee', butoirs: 'enPlace', niveleur: 'pose', lampe: 'allumee' };
const remettre = async (p = pe) => { for (const [k, val] of Object.entries(ETATS_PAGE)) await regler(p, k, val); await p.uncheck('[data-montrer-zones]'); };

// Ce qu'on voit d'un objet dans la page : la zone annoncée (rectangle de la vue), les groupes d'essai qui le
// dessinent (réunis), et ce que touche le centre de la zone (`elementFromPoint`, donc ce qu'un clic atteindrait).
const mesurer = (p, nom) => p.evaluate((nom) => {
  const zone = document.querySelector(`rect[data-zone="${nom}"]`);
  const groupes = [...document.querySelectorAll(`[data-essai-objet="${nom}"]`)];
  const pleins = groupes.filter((g) => g.children.length);
  const R = { zone: null, groupes: groupes.length, pleins: pleins.length, etat: groupes[0] ? groupes[0].dataset.etat : null, bbox: null, centre: null };
  if (pleins.length) {
    const B = pleins.map((g) => g.getBBox());
    const x0 = Math.min(...B.map((b) => b.x)), y0 = Math.min(...B.map((b) => b.y));
    R.bbox = { x: x0, y: y0, x2: Math.max(...B.map((b) => b.x + b.width)), y2: Math.max(...B.map((b) => b.y + b.height)) };
  }
  if (!zone) return R;
  const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((a) => Number(zone.getAttribute(a)));
  R.zone = { x, y, x2: x + w, y2: y + h };
  const svg = zone.ownerSVGElement;
  svg.scrollIntoView({ block: 'center' });
  const pt = svg.createSVGPoint(); pt.x = x + w / 2; pt.y = y + h / 2;
  const c = pt.matrixTransform(svg.getScreenCTM());
  const el = document.elementFromPoint(c.x, c.y);
  const g = el && el.closest('[data-essai-objet]');
  R.centre = g ? g.dataset.essaiObjet : (el ? el.tagName.toLowerCase() : null);
  return R;
}, nom);

await v('Quai iso : boiteEcran — valeurs écrites à la main (une boîte, deux boîtes, marge, liste vide)', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 100, origine: [0, 0] });
    const J = K.projection({ unite: 100, origine: [10, 20] });
    return {
      une0: K.boiteEcran(I, [0, 0, 0, 1, 1, 1], 0), une12: K.boiteEcran(I, [0, 0, 0, 1, 1, 1], 12), defaut: K.boiteEcran(I, [0, 0, 0, 1, 1, 1]),
      liste1: K.boiteEcran(I, [[0, 0, 0, 1, 1, 1]], 0),
      deux: K.boiteEcran(J, [[0, 0, 0, 1, 1, 1], [2, 0, 0, 3, 1, 2]], 5), vide: K.boiteEcran(I, []),
    };
  });
  // Cube unité, 100 px par mètre : x = (x−y)·86,6 va de −86,6 à 86,6 ; y = (x+y)·50 − 100·z va de −100 à 100.
  egal(r.une0, { x: -86.6, y: -100, w: 173.2, h: 200 }, 'cube sans marge');
  egal(r.une12, { x: -98.6, y: -112, w: 197.2, h: 224 }, 'cube, marge 12');
  egal(r.defaut, r.une12, 'la marge par défaut est 12');
  egal(r.liste1, r.une0, 'une boîte seule ou une liste d’une boîte, même rectangle');
  // Deux boîtes, origine (10, 20), marge 5 : x de 10 − 86,6 à 10 + 259,8 ; y de 20 − 100 à 20 + 200.
  egal(r.deux, { x: -81.6, y: -85, w: 356.4, h: 310 }, 'deux boîtes réunies');
  egal(r.vide, null, 'aucune boîte, aucun rectangle');
});

// Chaque objet dans chaque état : la zone contient ce qui est dessiné, et son centre touche l'objet. Les états
// sont écrits à la main (jamais lus dans le module testé).
const CAS_OBJETS = [['cabine', 'conduite'], ['cabine', 'vide'], ['fumee', 'true'], ['cale', 'posee'], ['butoirs', 'enPlace'],
  ['niveleur', 'pose'], ['niveleur', 'releve'], ['lampe', 'allumee'], ['lampe', 'eteinte']];
await v('Quai iso : chaque objet de sécurité, dans chaque état — sa zone contient son dessin et son centre le touche', async () => {
  const fautes = [];
  for (const [nom, etat] of CAS_OBJETS) {
    await remettre();
    await regler(pe, nom, etat);
    const m = await mesurer(pe, nom);
    if (!m.zone) { fautes.push(`${nom}/${etat} : pas de zone`); continue; }
    if (!m.bbox) { fautes.push(`${nom}/${etat} : rien de dessiné dans le groupe d’essai`); continue; }
    const e = 0.5, z = m.zone, b = m.bbox;
    if (b.x < z.x - e || b.y < z.y - e || b.x2 > z.x2 + e || b.y2 > z.y2 + e) {
      fautes.push(`${nom}/${etat} : le dessin sort de la zone (dessin ${[b.x, b.y, b.x2, b.y2].map((n) => n.toFixed(1))}, zone ${[z.x, z.y, z.x2, z.y2].map((n) => n.toFixed(1))})`);
    }
    if (m.centre !== nom) fautes.push(`${nom}/${etat} : le centre de la zone touche « ${m.centre} », pas l’objet`);
  }
  if (fautes.length) throw new Error(fautes.join(' ; '));
});

// Les états sans dessin : leur zone reste là où l'objet devrait être (un défaut à signaler se clique là où il manque).
await v('Quai iso : cale et butoirs absents — rien de dessiné, mais la zone reste à la place de l’objet', async () => {
  await remettre();
  const avant = { cale: await mesurer(pe, 'cale'), butoirs: await mesurer(pe, 'butoirs') };
  await regler(pe, 'cale', 'absente'); await regler(pe, 'butoirs', 'absents');
  const apres = { cale: await mesurer(pe, 'cale'), butoirs: await mesurer(pe, 'butoirs') };
  for (const nom of ['cale', 'butoirs']) {
    egal(apres[nom].pleins, 0, `${nom} absent : un groupe d’essai plein`);
    egal(apres[nom].etat, nom === 'cale' ? 'absente' : 'absents', `${nom} : état annoncé`);
    egal(apres[nom].zone, avant[nom].zone, `${nom} : la zone ne bouge pas quand l’objet manque`);
  }
  // Les autres butoirs (portes 6 et 8, et la paire gauche de la 7) restent dessinés : l'absence n'efface pas la façade.
  const restent = await pe.$$eval('svg[data-vue="dehors"] polygon[fill="#111"], svg[data-vue="dehors"] polygon[fill="#1a1a1a"], svg[data-vue="dehors"] polygon[fill="#0c0c0c"]', (L) => L.length);
  vrai(restent > 0, 'plus aucun butoir dessiné');
});

await v('Quai iso : zones d’une même vue disjointes, dans tous les états', async () => {
  const fautes = [];
  const combos = [
    { cabine: 'conduite', fumee: 'true', cale: 'posee', butoirs: 'enPlace', niveleur: 'pose', lampe: 'allumee' },
    { cabine: 'vide', fumee: 'true', cale: 'absente', butoirs: 'absents', niveleur: 'releve', lampe: 'eteinte' },
    { cabine: 'conduite', fumee: 'false', cale: 'absente', butoirs: 'enPlace', niveleur: 'releve', lampe: 'allumee' },
  ];
  await remettre();
  for (const c of combos) {
    for (const [k, val] of Object.entries(c)) await regler(pe, k, val);
    const Z = await pe.$$eval('rect[data-zone]', (L) => L.map((r) => ({ nom: r.dataset.zone, vue: r.ownerSVGElement.dataset.vue,
      x: +r.getAttribute('x'), y: +r.getAttribute('y'), x2: +r.getAttribute('x') + +r.getAttribute('width'), y2: +r.getAttribute('y') + +r.getAttribute('height') })));
    for (let i = 0; i < Z.length; i++) for (let j = i + 1; j < Z.length; j++) {
      const a = Z[i], b = Z[j];
      if (a.vue === b.vue && a.x < b.x2 && b.x < a.x2 && a.y < b.y2 && b.y < a.y2) fautes.push(`${a.nom} et ${b.nom} se chevauchent (${JSON.stringify(c)})`);
    }
  }
  if (fautes.length) throw new Error(fautes.join(' ; '));
});

await v('Quai iso : cale et lampe absentes par défaut — aucun élément ; les zones ne se montrent que sur demande', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 54, origine: [330, 150] });
    const J = K.projection({ unite: 60, origine: [470, 235] });
    const vide = K.camionPorteur(I, 3.7, 0.35), vide2 = K.camionPorteur(I, 3.7, 0.35, {});
    const E = await import('/outils/essai-quai-inspection.js');
    const sans = E.sceneDedans({ niveleur: 'pose', lampe: null }, true) + E.sceneDehors({ cabine: 'vide', fumee: false, cale: null, butoirs: 'enPlace' }, true);
    return { identiques: vide === vide2, rougeCale: /#d93a2b|#a8291d/.test(vide), classes: /class=/.test(vide), essaiSurDefaut: /data-essai/.test(vide),
      groupesSansCaleNiLampe: [...sans.matchAll(/data-essai-objet="([a-z]+)"/g)].map((m) => m[1]), lampeTete: K.lampeQuai(J, 'eteinte').cone };
  });
  vrai(r.identiques, 'camionPorteur sans option et avec {} diffèrent');
  vrai(!r.rougeCale, 'le camion par défaut dessine une cale rouge');
  vrai(!r.classes && !r.essaiSurDefaut, 'le camion par défaut porte des classes ou des groupes d’essai');
  vrai(!r.groupesSansCaleNiLampe.includes('cale') && !r.groupesSansCaleNiLampe.includes('lampe'), `cale ou lampe dessinées sans qu’on les demande : ${r.groupesSansCaleNiLampe}`);
  egal(r.lampeTete, '', 'une lampe éteinte n’a pas de faisceau');
  // Dans la page : « non dessinée » = aucun groupe, aucune zone ; les zones sont cachées tant qu'on ne coche pas.
  await remettre();
  await regler(pe, 'cale', 'null'); await regler(pe, 'lampe', 'null');
  egal(await pe.$$eval('[data-essai-objet="cale"], [data-essai-objet="lampe"], rect[data-zone="cale"], rect[data-zone="lampe"]', (L) => L.length), 0, 'éléments de cale ou de lampe');
  vrai(!(await pe.isVisible('rect[data-zone="cabine"]')), 'les zones sont visibles sans avoir coché la case');
  await pe.check('[data-montrer-zones]');
  vrai(await pe.isVisible('rect[data-zone="cabine"]'), 'les zones restent cachées une fois la case cochée');
  await remettre();
});

await v('Quai iso : options du kit — butoirs d’une porte retirés (et seulement eux), niveleur relevé, aucun nom d’objet hors essai', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 54, origine: [330, 150] }), J = K.projection({ unite: 60, origine: [470, 235] });
    const n = (s) => (s.match(/<polygon/g) || []).length;
    const defaut = K.facadeQuai(I), absents = K.facadeQuai(I, undefined, { butoirs: { porte: 1, etat: 'absents' } }),
      enPlace = K.facadeQuai(I, undefined, { butoirs: { porte: 1, etat: 'enPlace' } }), autrePorte = K.facadeQuai(I, undefined, { butoirs: { porte: 0, etat: 'absents' } });
    const tout = K.camionPorteur(I, 3.7, 0.35, { cabine: 'conduite', fumee: true, cale: 'posee' }) + K.facadeQuai(I, undefined, { butoirs: { porte: 1, etat: 'absents' } })
      + K.niveleur(J, 'dedans', 'releve') + K.niveleur(J, 'dehors', 'releve') + K.lampeQuai(J, 'allumee').cone + K.lampeQuai(J, 'allumee').tete;
    return { polyDefaut: n(defaut), polyAbsents: n(absents), polyEnPlace: n(enPlace), polyAutre: n(autrePorte), tout,
      releveDedans: K.niveleur(J, 'dedans', 'releve'), releveDehors: K.niveleur(J, 'dehors', 'releve'), poseDedans: K.niveleur(J, 'dedans', 'pose'), poseDehors: K.niveleur(J, 'dehors') };
  });
  // Chaque butoir est une boîte de 3 faces : 4 butoirs = 12 polygones de moins, et rien d'autre ne change de nombre.
  egal(r.polyDefaut - r.polyAbsents, 12, 'les quatre butoirs de la porte 7 (12 faces)');
  egal(r.polyDefaut - r.polyAutre, 12, 'les quatre butoirs de la porte 6 (12 faces)');
  egal(r.polyEnPlace, r.polyDefaut, 'butoirs en place : autant de faces que le dessin d’avant');
  vrai(r.releveDedans !== r.poseDedans && r.releveDehors !== r.poseDehors, 'le niveleur relevé se dessine comme le niveleur posé');
  vrai(/#0b0c0d/.test(r.releveDedans) && /#0b0c0d/.test(r.releveDehors), 'le vide sombre du niveleur relevé n’est pas dessiné');
  vrai(/#e7c628/.test(r.releveDehors), 'la lèvre jaune et noire de la plaque dressée n’est pas dessinée');
  const nommes = ['data-essai', 'title', 'tabindex', 'role=', 'aria-', 'data-'].filter((m) => r.tout.includes(m));
  egal(nommes, [], 'attributs nommant un objet hors de l’option essai');
  vrai(!/var\(/.test(r.tout), 'une variable CSS dans le kit (les teintes du kit sont fixes)');
});

await v('Quai iso : chauffeur au volant sans visage, cale rouge = signalisation (ni vert ni rouge pour dire « conforme »)', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 54, origine: [330, 150] });
    const conduite = K.camionPorteur(I, 3.7, 0.35, { cabine: 'conduite' }), vide = K.camionPorteur(I, 3.7, 0.35);
    const complet = K.camionPorteur(I, 3.7, 0.35, { cabine: 'conduite', fumee: true, cale: 'posee', essai: true });
    const cabine = (complet.match(/<g data-essai-objet="cabine"[^>]*>([\s\S]*?)<\/g>/) || [])[1] || '';
    return { cercles: (cabine.match(/<circle/g) || []).length, textes: (cabine.match(/<text/g) || []).length, lignes: (cabine.match(/<polyline/g) || []).length,
      polygones: (cabine.match(/<polygon/g) || []).length, conduite: conduite !== vide, vert: /#1f5f3a|#107c41|#7CFC9A|#0b6634/i.test(complet) };
  });
  vrai(r.conduite, 'le chauffeur au volant ne se dessine pas');
  egal(r.cercles, 0, 'des cercles (yeux ?) sur la silhouette du chauffeur');
  egal(r.textes, 0, 'du texte dans la cabine');
  // pare-brise + gilet, bande, cou, tête, cheveux, volant : sept polygones, aucun trait de visage.
  egal(r.polygones, 7, 'polygones de la cabine (vitre + silhouette)');
  vrai(!r.vert, 'du vert dans le camion de sécurité');
});

// ÉTAPE 1 bis (retours de Tristan, 10/10/2026) : le sens de la cale, et la lampe allumée qui se distingue au premier coup d'œil.
await v('Quai iso : la cale a sa pente tournée vers le pneu (pointe au sol contre la roue, dos vertical à l’extérieur) ; la lampe allumée ne ressemble pas à l’éteinte', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 54, origine: [330, 150] }), J = K.projection({ unite: 60, origine: [470, 235] });
    const cale = K.camionPorteur(I, 3.7, 0.35, { cale: 'posee' });
    const face = (couleur) => (cale.match(new RegExp('<polygon points="([^"]+)" fill="' + couleur + '"')) || [])[1] || null;
    const allumee = K.lampeQuai(J, 'allumee'), eteinte = K.lampeQuai(J, 'eteinte');
    return { pente: face('#d93a2b'), dos: face('#bd3326'), cercles: (allumee.tete.match(/<circle/g) || []).length, rayons: (allumee.tete.match(/<line/g) || []).length,
      lentille: [/#fff6c2/.test(allumee.tete), /#fff6c2/.test(eteinte.tete)], halo: [allumee.tete.includes('rgba(255,214,90'), ['rgba(255,214,90', '<line', '<circle'].some((m) => eteinte.tete.includes(m))],
      cone: [allumee.cone.length > 0, eteinte.cone.length > 0] };
  });
  // Valeurs écrites à la main : camion en (3,7 ; 0,35), unité 54, origine (330 ; 150). La pente part de la bande de roulement
  // (y = 1,46 m, au sol) et monte vers l'extérieur (y = 1,90 m, 0,22 m de haut) ; le dos vertical est à y = 1,90 m.
  egal(r.pente, '470.3,309.8 482.5,316.9 461.9,316.9 449.7,309.8', 'la pente de la cale : pointe au sol côté roue, haut à l’extérieur');
  egal(r.dos, '449.7,321.7 461.9,328.7 461.9,316.9 449.7,309.8', 'le dos vertical de la cale, à l’extérieur');
  egal(r.lentille, [true, false], 'la lentille de la lampe : claire allumée, noire éteinte');
  egal(r.halo, [true, false], 'le halo : autour de la tête allumée seulement');
  egal([r.cercles, r.rayons], [2, 8], 'le halo (deux anneaux) et ses huit rayons');
  egal(r.cone, [true, false], 'le faisceau : allumée seulement');
});

// La fumée : dessinée dans tous les cas, animée seulement si l'élève n'a pas demandé moins de mouvement.
await v('Quai iso : fumée — trois bouffées, immobiles mais dessinées en mouvement réduit ; animées sinon', async () => {
  const lire = (p) => p.$$eval('svg[data-vue="dehors"] .iso-fumee', (L) => L.map((c) => { const r = c.getBoundingClientRect(); return { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), anim: getComputedStyle(c).animationName, n: c.getAnimations().length }; }));
  // Mouvement réduit demandé au système (contexte `reducedMotion: 'reduce'`).
  await remettre();
  const a1 = await lire(pe);
  await pe.waitForTimeout(700);
  const a2 = await lire(pe);
  egal(a1.length, 3, 'bouffées de fumée dessinées en mouvement réduit');
  vrai(a1.every((c) => c.w > 4), 'une bouffée sans taille');
  egal(a1.map((c) => c.anim), ['none', 'none', 'none'], 'animation CSS appliquée malgré le mouvement réduit');
  egal(a1.map((c) => c.n), [0, 0, 0], 'animations en cours malgré le mouvement réduit');
  egal(a2, a1, 'la fumée bouge en mouvement réduit');
  // La case « mouvement réduit » de la page simule le réglage : même résultat, sans toucher au système.
  const libre = await pageEssai(ctxMouvement);
  const b1 = await lire(libre);
  await libre.waitForTimeout(700);
  const b2 = await lire(libre);
  egal(b1.length, 3, 'bouffées de fumée avec le mouvement normal');
  vrai(b1.every((c) => c.anim === 'iso-fumee' && c.n === 1), `la fumée n’est pas animée avec le mouvement normal : ${JSON.stringify(b1)}`);
  vrai(JSON.stringify(b1) !== JSON.stringify(b2), 'la fumée ne bouge pas avec le mouvement normal');
  await libre.check('[data-calme]');
  const c1 = await lire(libre);
  egal(c1.map((c) => c.n), [0, 0, 0], 'la case « mouvement réduit » de la page n’arrête pas la fumée');
  vrai(c1.every((c) => c.w > 4), 'la case « mouvement réduit » fait disparaître la fumée');
  await libre.close();
});

// Étape 1 bis : les bouffées sont plus grandes ; la zone de la fumée doit les contenir sur toute leur course (montée, grossissement).
await v('Quai iso : fumée — à chaque instant de sa course animée, chaque bouffée visible reste dans la zone de la fumée', async () => {
  const libre = await pageEssai(ctxMouvement);
  await libre.check('[data-montrer-zones]');
  const r = await libre.evaluate(async () => {
    const z = document.querySelector('rect[data-zone="fumee"]').getBoundingClientRect();
    const m = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9, n: 0 };
    for (let t = 0; t < 64; t++) {
      await new Promise((ok) => setTimeout(ok, 50));
      for (const c of document.querySelectorAll('svg[data-vue="dehors"] .iso-fumee')) {
        if (Number(getComputedStyle(c).opacity) < 0.05) continue;
        const b = c.getBoundingClientRect(); m.n++;
        m.x0 = Math.min(m.x0, b.x); m.y0 = Math.min(m.y0, b.y); m.x1 = Math.max(m.x1, b.right); m.y1 = Math.max(m.y1, b.bottom);
      }
    }
    return { zone: { x0: z.x, y0: z.y, x1: z.right, y1: z.bottom }, fumee: m };
  });
  await libre.close();
  vrai(r.fumee.n > 20, `trop peu de bouffées visibles échantillonnées : ${r.fumee.n}`);
  vrai(r.zone.x1 > r.zone.x0, 'la zone de la fumée n’est pas visible');
  vrai(r.fumee.x0 >= r.zone.x0 && r.fumee.y0 >= r.zone.y0 && r.fumee.x1 <= r.zone.x1 && r.fumee.y1 <= r.zone.y1, `une bouffée sort de la zone : ${JSON.stringify(r)}`);
});

/* ------------------------------------------------------------------ étape 2 : l'inspection sur la scène */
// `securite.mode: 'scene'` de la vue quai (core/types/quai.js) : la validation, l'état de chaque objet, les zones et le point
// touché (fonctions pures, jouées ici sans navigateur), puis la scène d'ENT-6.4 jouée À LA SOURIS dans le vrai moteur
// d'entreprise (la déclaration d'essai de `outils/essai-quai-inspection.js`). Les valeurs attendues sont écrites à la main.

const quaiMod = await import(pathToFileURL(path.join(ROOT, 'core', 'types', 'quai.js')).href);

// Les cinq points du brief ENT-6.4 : deux défauts (cabine, niveleur) et trois pièges (cale, butoirs, lampe en ordre).
const PT = {
  cabine: { id: 'cabine', objet: 'cabine', etat: 'conduite', vue: 'dehors', ok: false, lib: 'Chauffeur au volant', repare: 'Cabine réparée.' },
  niveleur: { id: 'niveleur', objet: 'niveleur', etat: 'releve', vue: 'dedans', ok: false, lib: 'Niveleur relevé', repare: 'Niveleur posé.' },
  cale: { id: 'cale', objet: 'cale', etat: 'posee', vue: 'dehors', ok: true, lib: 'Cale de roue' },
  butoirs: { id: 'butoirs', objet: 'butoirs', etat: 'enPlace', vue: 'dehors', ok: true, lib: 'Butoirs' },
  lampe: { id: 'lampe', objet: 'lampe', etat: 'allumee', vue: 'dedans', ok: true, lib: 'Lampe' },
};
const SEC5 = () => ({ mode: 'scene', arret: false, points: [PT.cabine, PT.niveleur, PT.cale, PT.butoirs, PT.lampe].map((p) => ({ ...p })) });
const QBON = (m = {}) => { const S = SEC5(); const Q = { id: 't', rendu: 'iso', froid: false, securite: S }; m.Q?.(Q); m.S?.(S); return Q; };

await v('Quai scène : verifierQuai accepte une déclaration juste, les listes existantes et l’absence de sécurité', async () => {
  egal(quaiMod.verifierQuai(QBON()), [], 'la déclaration d’ENT-6.4');
  egal(quaiMod.verifierQuai({ id: 'x' }), [], 'quai sans sécurité');
  // Une liste OK / Pas OK (lot 5, Smoby) : texte d'arrêt, signaler, photo… rien n'y est refusé.
  egal(quaiMod.verifierQuai({ id: 'x', securite: { scene: 'S', points: [{ id: 'a', lib: 'A', ok: false }], arret: 'Stop.', signaler: { bouton: 'B' }, photo: 'p.jpg' } }), [], 'liste, arrêt = texte');
  egal(quaiMod.verifierQuai({ id: 'x', securite: { points: [{ id: 'a', lib: 'A', ok: false }], arret: true } }), [], 'liste, arret: true');
  egal(quaiMod.verifierQuai(QBON({ S: (S) => { S.arret = 'Stop, regarde encore.'; } })), [], 'scène, arrêt = texte');
  egal(quaiMod.verifierQuai(QBON({ S: (S) => { delete S.arret; S.points.forEach((p) => { delete p.vue; delete p.repare; }); } })), [], 'scène : arret, vue et repare facultatifs');
});

// 20/10/2026 : securite.signaler.reponse = la réponse unique du collègue (même clé que la vue inspection du poste).
const REP_SC = 'Noté. J’y regarde dans un instant.';
await v('Quai scène : verifierQuai refuse une signaler.reponse vide ou qui n’est pas une phrase ; accepte une phrase', async () => {
  const f = (r) => quaiMod.verifierQuai(QBON({ S: (S) => { S.signaler = { reponse: r }; } }));
  egal(f(REP_SC), [], 'une phrase');
  [['vide', ''], ['espaces', '   '], ['un nombre', 3]].forEach(([nom, r]) => vrai(f(r).some((e) => /signaler.reponse/.test(e)), `« ${nom} » n’est pas refusée : ${f(r)}`));
});

// Chaque refus du tableau 2.1 a, avec le mot qui doit figurer dans le message (en français, pas un code).
const REFUS = [
  ['mode inconnu', (Q) => { Q.securite.mode = 'liste'; }, /securite\.mode/],
  ['scène sans rendu iso', (Q) => { delete Q.rendu; }, /rendu: 'iso'/],
  ['points absents', (Q) => { delete Q.securite.points; }, /securite\.points/],
  ['points vides', (Q) => { Q.securite.points = []; }, /vide/],
  ['id vide', (Q) => { Q.securite.points[2].id = ''; }, /id vide/],
  ['id en double', (Q) => { Q.securite.points[3].id = 'cale'; }, /id en double/],
  ['id aucun-faux', (Q) => { Q.securite.points[3].id = 'aucun-faux'; }, /aucun-faux/],
  ['objet inconnu', (Q) => { Q.securite.points[3].objet = 'extincteur'; }, /objet « extincteur » inconnu/],
  ['deux points sur le même objet', (Q) => { Q.securite.points.push({ id: 'cale2', objet: 'cale', etat: 'absente', ok: false, lib: 'Cale absente' }); }, /même objet/],
  ['état inconnu pour l’objet', (Q) => { Q.securite.points[0].etat = 'dormant'; }, /état « dormant » inconnu pour cabine/],
  ['état d’un autre objet', (Q) => { Q.securite.points[1].etat = 'enPlace'; }, /inconnu pour niveleur/],
  ['vue différente de celle de l’objet', (Q) => { Q.securite.points[0].vue = 'dedans'; }, /se voit dehors/],
  ['ok absent', (Q) => { delete Q.securite.points[2].ok; }, /ok manque/],
  ['ok vrai sur un état dangereux', (Q) => { Q.securite.points[0].ok = true; }, /ok: true sur un état dangereux/],
  ['ok faux sur l’état sûr', (Q) => { Q.securite.points[2].ok = false; }, /ok: false sur l’état sûr/],
  ['lib absent', (Q) => { delete Q.securite.points[4].lib; }, /lib manque/],
  ['photo en mode scène', (Q) => { Q.securite.photo = 'quai.jpg'; }, /photo/],
  ['arrêt ni booléen ni texte', (Q) => { Q.securite.arret = 3; }, /securite\.arret/],
];
await v('Quai scène : verifierQuai refuse chaque déclaration fautive, avec un message clair', async () => {
  const fautes = [];
  for (const [nom, mute, motif] of REFUS) {
    const Q = QBON(); mute(Q);
    const E = quaiMod.verifierQuai(Q);
    if (!E.length) fautes.push(`« ${nom} » n’est pas refusé`);
    else if (!E.some((m) => motif.test(m))) fautes.push(`« ${nom} » : message sans « ${motif} » (${E.join(' | ')})`);
  }
  // En liste, `arret: false` serait ignoré sans bruit : refusé (contradiction 1 du cadrage).
  const liste = quaiMod.verifierQuai({ id: 'x', securite: { points: [{ id: 'a', lib: 'A', ok: false }], arret: false } });
  if (!liste.some((m) => /arret: false/.test(m))) fautes.push(`liste + arret: false n’est pas refusé (${liste})`);
  if (fautes.length) throw new Error(fautes.join(' ; '));
});

await v('Quai scène : état de chaque objet — déclaré, sûr dès qu’il est signalé ou que l’inspection est figée', async () => {
  const S = SEC5();
  egal(quaiMod.etatsScene(S, null), { cabine: 'conduite', cale: 'posee', butoirs: 'enPlace', niveleur: 'releve', lampe: 'allumee' }, 'rien signalé');
  egal(quaiMod.etatsScene(S, { signaux: [{ points: ['cabine'] }] }), { cabine: 'vide', cale: 'posee', butoirs: 'enPlace', niveleur: 'releve', lampe: 'allumee' }, 'cabine signalée');
  egal(quaiMod.etatsScene(S, { signaux: [{ points: ['cabine'] }, { points: ['niveleur', 'lampe'] }] }).niveleur, 'pose', 'niveleur signalé');
  egal(quaiMod.etatsScene(S, { signaux: [], fait: true }), { cabine: 'vide', cale: 'posee', butoirs: 'enPlace', niveleur: 'pose', lampe: 'allumee' }, 'inspection figée : tout est sûr');
  // Un piège mal réglé : butoirs absents, lampe éteinte (défauts) → l'état sûr les rétablit.
  const S2 = { points: [{ id: 'b', objet: 'butoirs', etat: 'absents', ok: false, lib: 'B' }, { id: 'l', objet: 'lampe', etat: 'eteinte', ok: false, lib: 'L' }] };
  egal(quaiMod.etatsScene(S2, null), { cabine: 'vide', cale: null, butoirs: 'absents', niveleur: 'pose', lampe: 'eteinte' }, 'objets non déclarés : état d’aujourd’hui ; cale non dessinée');
  egal(quaiMod.etatsScene(S2, { fait: true }).butoirs, 'enPlace', 'butoirs rétablis');
  egal(quaiMod.etatsScene({ points: [] }, null), { cabine: 'vide', cale: null, butoirs: 'enPlace', niveleur: 'pose', lampe: null }, 'rien de déclaré = le quai d’aujourd’hui');
});

await v('Quai scène : point touché — le premier point déclaré de la vue ; mur et autre vue = null (rien n’est posé à l’écran) ; zones qui suivent l’état dessiné', async () => {
  const S = SEC5(), E0 = quaiMod.etatsScene(S, null);
  const Z0 = quaiMod.zonesScene(S, E0);
  egal(Z0.map((z) => [z.id, z.vue, z.rects.length]), [['cabine', 'dehors', 2], ['niveleur', 'dedans', 1], ['cale', 'dehors', 1], ['butoirs', 'dehors', 1], ['lampe', 'dedans', 1]], 'une zone par point (cabine : pare-brise + fumée)');
  const centre = (r) => [r.x + r.w / 2, r.y + r.h / 2];
  for (const z of Z0) for (const r of z.rects) {
    const [x, y] = centre(r);
    egal(quaiMod.pointTouche(S, E0, z.vue, x, y), z.id, `centre de la zone ${z.id}`);
    egal(quaiMod.pointTouche(S, E0, z.vue === 'dehors' ? 'dedans' : 'dehors', x, y) === z.id, false, `${z.id} ne se touche que dans sa vue`);
  }
  egal(quaiMod.pointTouche(S, E0, 'dehors', 587, 223), null, 'le mur de la façade entre deux portes');
  // La zone déborde de l'objet de 12 unités du viewBox de chaque côté (brief 2.3 : au moins 12 px de marge).
  const isoMod = await import(pathToFileURL(path.join(ROOT, 'core', 'iso.js')).href);
  const Ib = isoMod.projection({ unite: 54, origine: [330, 150] }), nu = isoMod.boiteEcran(Ib, isoMod.boitesButoirs(1), 0);
  const zb = Z0.find((z) => z.id === 'butoirs').rects[0];
  const arr = (n) => Math.round(n * 10) / 10;
  egal(zb, { x: arr(nu.x - 12), y: arr(nu.y - 12), w: arr(nu.w + 24), h: arr(nu.h + 24) }, 'la zone des butoirs = leur boîte projetée + 12 de chaque côté');
  egal(quaiMod.pointTouche(S, E0, 'dehors', nu.x - 10, nu.y + nu.h / 2), 'butoirs', 'à 10 unités à gauche des butoirs : touché');
  egal(quaiMod.pointTouche(S, E0, 'dehors', nu.x - 14, nu.y + nu.h / 2), null, 'à 14 unités à gauche des butoirs : à côté');
  egal(quaiMod.pointTouche(S, E0, 'dehors', -999, -999), null, 'hors du dessin');
  // Cabine réparée : plus de fumée donc plus de zone de fumée ; niveleur posé : une autre zone que relevé.
  const Er = quaiMod.etatsScene(S, { signaux: [{ points: ['cabine', 'niveleur'] }] });
  egal(quaiMod.zonesScene(S, Er).find((z) => z.id === 'cabine').rects.length, 1, 'cabine réparée : le pare-brise seul');
  vrai(JSON.stringify(quaiMod.zonesScene(S, Er).find((z) => z.id === 'niveleur').rects) !== JSON.stringify(Z0.find((z) => z.id === 'niveleur').rects), 'niveleur posé : même zone que relevé');
  // Cale absente : la zone reste à l'emplacement de la cale.
  const Sc = { points: [{ id: 'c', objet: 'cale', etat: 'absente', ok: false, lib: 'C' }] };
  egal(quaiMod.zonesScene(Sc, quaiMod.etatsScene(Sc, null))[0].rects, quaiMod.zonesScene(SEC5(), E0).find((z) => z.id === 'cale').rects, 'cale absente : même zone que cale posée');
  // « Le premier point déclaré gagne » ne sert que si deux zones se chevauchent : dans les quatre combinaisons d'états
  // (cabine conduite / vide, niveleur relevé / posé), les zones d'une même vue sont disjointes, donc aucun clic n'est ambigu.
  const fautes = [];
  for (const cab of ['conduite', 'vide']) for (const niv of ['releve', 'pose']) {
    const Z = quaiMod.zonesScene(S, { cabine: cab, niveleur: niv });
    for (const u of Z) for (const w of Z) if (u.id < w.id && u.vue === w.vue) for (const r of u.rects) for (const q of w.rects) {
      if (Math.max(r.x, q.x) < Math.min(r.x + r.w, q.x + q.w) && Math.max(r.y, q.y) < Math.min(r.y + r.h, q.y + q.h)) fautes.push(`${u.id}/${w.id} (${cab}, ${niv})`);
    }
  }
  egal(fautes, [], 'zones qui se chevauchent');
});

// Les jalons : calculés depuis les signaux, jamais rangés. Bases écrites à la main.
const jalonsDe = (securite, S = SEC5()) => {
  const Q = { id: 't', rendu: 'iso', froid: false, securite: S, camions: [{ palettes: [] }] };
  const L = quaiMod.jalonsQuai({ quais: { t: { securite } } }, Q).L.filter((l) => /^securite-/.test(l.id));
  return Object.fromEntries(L.map((l) => [l.id, l.ok]));
};
const SIG = (points, o = {}) => Object.assign({ points, rien: 0, marques: [], apresArret: false }, o);
await v('Quai scène : jalons — un par défaut, plus « aucun faux signalement » ; aucun n’est vrai par inaction', async () => {
  const ids = quaiMod.jalonsQuai({}, { id: 't', rendu: 'iso', froid: false, securite: SEC5(), camions: [{ palettes: [] }] }).L.filter((l) => /^securite-/.test(l.id)).map((l) => l.id);
  egal(ids, ['securite-cabine', 'securite-niveleur', 'securite-aucun-faux'], 'les jalons de sécurité, dans l’ordre des points déclarés');
  egal(jalonsDe(undefined), { 'securite-cabine': false, 'securite-niveleur': false, 'securite-aucun-faux': false }, 'base vide');
  egal(jalonsDe({ signaux: [], fait: true }), { 'securite-cabine': false, 'securite-niveleur': false, 'securite-aucun-faux': false }, 'inaction : rien signalé, décharger quand même');
  egal(jalonsDe({ signaux: [SIG(['cabine'])] }), { 'securite-cabine': true, 'securite-niveleur': false, 'securite-aucun-faux': true }, 'un seul défaut signalé');
  egal(jalonsDe({ signaux: [SIG(['cabine']), SIG(['niveleur'])] }), { 'securite-cabine': true, 'securite-niveleur': true, 'securite-aucun-faux': true }, 'deux envois, tout juste');
  egal(jalonsDe({ signaux: [SIG(['cabine', 'niveleur'])] }), { 'securite-cabine': true, 'securite-niveleur': true, 'securite-aucun-faux': true }, 'un seul envoi pour les deux');
  egal(jalonsDe({ signaux: [SIG(['cabine', 'cale'])] })['securite-aucun-faux'], false, 'une cale conforme signalée');
  // Base ANCIENNE (rangée avant le 20/10/2026, quand un clic dans le vide posait une marque « à côté ») : `rien: 1` est encore lu,
  // le jalon tombe, et la phrase d'avant reste. Une base neuve ne produit plus jamais `rien > 0` (voir le cas du clic dans le vide).
  egal(jalonsDe({ signaux: [SIG(['cabine'], { rien: 1 })] })['securite-aucun-faux'], false, 'base ancienne : une marque à côté (rien: 1) fait encore tomber le jalon');
  const fauxFait = (securite) => quaiMod.jalonsQuai({ quais: { t: { securite } } }, { id: 't', rendu: 'iso', froid: false, securite: SEC5(), camions: [{ palettes: [] }] }).L.find((l) => l.id === 'securite-aucun-faux').fait;
  egal(fauxFait({ signaux: [SIG(['cabine'], { rien: 1 })] }), '1 marque à côté de tout danger', 'base ancienne : la phrase d’avant est gardée');
  egal(fauxFait({ signaux: [SIG(['cabine', 'cale'])] }), 'signalé à tort : ' + PT.cale.lib, 'base neuve : le libellé ne parle que du point en ordre signalé, jamais de « marque à côté »');
  egal(jalonsDe({ signaux: [SIG(['cabine']), SIG(['lampe'])] })['securite-aucun-faux'], false, 'une lampe en ordre signalée au second envoi');
  egal(jalonsDe({ signaux: [SIG(['cabine']), SIG(['cabine'])] }), { 'securite-cabine': true, 'securite-niveleur': false, 'securite-aucun-faux': true }, 'un défaut déjà réparé re-signalé n’est pas un faux signalement');
  egal(jalonsDe({ signaux: [SIG(['cabine'], { apresArret: true })] })['securite-cabine'], false, 'signalé seulement après l’arrêt du chef de quai');
  egal(jalonsDe({ signaux: [SIG(['cabine'], { apresArret: true }), SIG(['cabine'])] })['securite-cabine'], true, 'signalé avant, puis encore après');
  // Le libellé reste neutre (il peut se lire avant la fin) ; le défaut n'est nommé que dans « attendu ».
  const L = quaiMod.jalonsQuai({ quais: { t: { securite: { signaux: [] } } } }, { id: 't', rendu: 'iso', froid: false, securite: SEC5(), camions: [{ palettes: [] }] }).L.filter((l) => /^securite-/.test(l.id));
  egal(L.map((l) => l.lib), ['Danger n° 1 signalé avant de décharger', 'Danger n° 2 signalé avant de décharger', 'Aucun faux signalement'], 'libellés neutres');
  vrai(L.slice(0, 2).every((l, i) => l.attendu.includes([PT.cabine, PT.niveleur][i].lib)), 'l’attendu nomme le défaut par son lib');
  vrai(L.every((l) => !/cabine|niveleur|Chauffeur|Niveleur|fumée|moteur/i.test(l.lib)), 'un libellé nomme un objet');
});

/* ---- la scène jouée dans le vrai moteur d'entreprise, à la souris */

const ctxS = await nav.newContext({ viewport: { width: 1366, height: 1000 }, reducedMotion: 'reduce' });
const ctxSM = await nav.newContext({ viewport: { width: 1366, height: 1000 }, reducedMotion: 'no-preference' });
const HOTE = '#qiScene';
// Monte la séance d'essai (le quai d'ENT-6.4 de la page d'essai) dans le vrai moteur. `o.q` : { arret, securite } ;
// `o.copie` : une évaluation ; `o.db` : une base de départ (copiée).
const monterScene = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-quai-inspection.js');
  document.querySelector('#qiScene')?.remove();
  const hote = document.createElement('div'); hote.id = 'qiScene'; document.body.prepend(hote);
  const Q = E.quaiEssai(o.q || {});
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__qs = { db, Q, enregistres: [] };
  const meta = Object.assign({ id: 'essai-inspection', code: 'ESSAI', titre: 'Essai de l’inspection', portee: 'eleve', immersif: true, temps: 'guidage', bareme: 20 }, o.copie ? { copie: true, temps: 'evaluation' } : {});
  const ctx = {
    meta, profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__qs.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  };
  creerEntreprise(E.universQuai(Q, { copie: !!o.copie })).rendre(hote, ctx);
  document.querySelector('#qiScene .ent-nav[data-vue="quai"]').click();
}, o);
async function pageScene(c = ctxS, o = {}) {
  const p = await c.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  await monterScene(p, o);
  // Avec le mouvement normal, l'arrivée du camion dure 5,2 s : « Passer l'animation ».
  await p.waitForSelector(`${HOTE} [data-q-inspection], ${HOTE} [data-q="passer1"]`);
  if (await p.$(`${HOTE} [data-q="passer1"]`)) await p.click(`${HOTE} [data-q="passer1"]`);
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  return p;
}
const etatQ = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__qs.db.quais[window.__qs.Q.id] || null)));
const secQ = async (p) => (await etatQ(p)).securite;
const SVG = `${HOTE} [data-q-inspection]`;
const vueActuelle = (p) => p.$eval(SVG, (s) => s.dataset.vue);
// Les zones calculées par le moteur, sur l'état dessiné maintenant.
const zonesDe = (p) => p.evaluate(async () => {
  const Q = await import('/core/types/quai.js');
  const S = window.__qs.Q.securite, q = window.__qs.db.quais[window.__qs.Q.id];
  return Q.zonesScene(S, Q.etatsScene(S, q && q.securite));
});
// Clic à la souris en (x, y) du viewBox : on retrouve le pixel par la `boundingBox()` du <svg> et son `viewBox`
// (sans `preserveAspectRatio`, le dessin est centré et mis à l'échelle sans déformation), jamais par le moteur.
async function cliquerViewBox(p, x, y) {
  const loc = p.locator(SVG);
  await loc.scrollIntoViewIfNeeded();
  const bb = await loc.boundingBox();
  const [vx, vy, vw, vh] = await loc.evaluate((s) => s.getAttribute('viewBox').split(' ').map(Number));
  const k = Math.min(bb.width / vw, bb.height / vh);
  await p.mouse.click(bb.x + (bb.width - vw * k) / 2 + (x - vx) * k, bb.y + (bb.height - vh * k) / 2 + (y - vy) * k);
}
async function allerVue(p, vue) {
  if ((await vueActuelle(p)) === vue) return;
  if (vue === 'dedans' && !(await p.$(`${HOTE} [data-q="sc-vue"]`))) await p.click(`${HOTE} [data-q="sc-ouvrir"]`);
  else await p.click(`${HOTE} [data-q="sc-vue"]`);
  await p.waitForFunction((v) => document.querySelector('#qiScene [data-q-inspection]').dataset.vue === v, vue);
}
// Clic au centre de la zone `id` (rectangle `i`), dans la vue de l'objet ; rend la marque posée.
async function cliquerZone(p, id, i = 0, coin = false) {
  const Z = (await zonesDe(p)).find((z) => z.id === id);
  await allerVue(p, Z.vue);
  const r = Z.rects[i];
  // `coin` : près d'un coin de la zone, hors du rond d'une marque déjà posée au centre.
  await cliquerViewBox(p, coin ? r.x + 4 : r.x + r.w / 2, coin ? r.y + 4 : r.y + r.h / 2);
  const M = (await secQ(p)).marques;
  return M[M.length - 1];
}
const signaler = (p) => p.click(`${HOTE} [data-q="sc-signaler"]`);
const reponse = (p) => p.$eval(`${HOTE} [data-q-secu-chef]`, (n) => n.textContent.trim());
const gestes = (p) => p.evaluate(() => Object.keys((window.__qs.db.gestes || {})['essai-inspection'] || {}));
const decharger = async (p) => { await p.click(`${HOTE} [data-q="sc-decharger"]`); await p.click(`${HOTE} [data-q="sc-decharger"]`); };
const jalonsPage = (p) => p.evaluate(async () => {
  const Q = await import('/core/types/quai.js');
  return Object.fromEntries(Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.filter((l) => /^securite-/.test(l.id)).map((l) => [l.id, l.ok]));
});

await v('Quai scène : le déroulé — ① à ④, pas d’étape ⓪, ② à ④ fermées, la scène après l’arrivée sans bulle ni BL', async () => {
  const p = await pageScene();
  const marches = await p.$$eval(`${HOTE} .quai-stepper button`, (L) => L.map((b) => [b.textContent.trim().charAt(0), b.disabled]));
  egal(marches, [['①', false], ['②', true], ['③', true], ['④', true]], 'le stepper : ① ouvert, ② à ④ fermés');
  const e = await etatQ(p);
  egal(e.etape, 1, 'l’étape de départ');
  egal(e.securite, { mode: 'scene', marques: [], compteur: 0, signaux: [], ouverte: false, arrete: false, fait: false, chef: '' }, 'l’état neuf de l’inspection');
  egal(await p.$$eval(`${HOTE} [data-q-securite]`, (L) => L.length), 0, 'l’écran ⓪ en liste n’existe pas');
  egal(await p.$$eval(`${HOTE} [data-q-apres-arrivee], ${HOTE} [data-iso-bulle], ${HOTE} [data-q="decharger"]`, (L) => L.length), 0, 'ni BL, ni bulle, ni « Oui, vous pouvez décharger » avant la fin de l’inspection');
  egal(await p.$eval(`${HOTE} [data-q-consigne]`, (n) => n.textContent.trim()), 'Clique sur ce qui ne va pas, puis signale-le à Nadia.', 'la consigne');
  egal(await p.$eval(`${HOTE} [data-q="sc-signaler"]`, (n) => n.textContent.trim()), 'Signaler à Nadia', 'le bouton');
  egal(await p.$eval(`${HOTE} [data-q="sc-decharger"]`, (n) => n.textContent.trim()), 'C’est bon, on peut décharger →', 'le bouton de fin');
  egal(await vueActuelle(p), 'dehors', 'on commence dehors');
  // Les titres des jalons ne s'affichent pas pendant la séance (ni sur le quai, ni à l'accueil) : seulement au bilan.
  const titres = /Danger n° d|signalé avant de décharger|Aucun faux signalement|Chauffeur au volant|Niveleur relevé/;
  vrai(!titres.test(await p.$eval(HOTE, (n) => n.textContent)), 'un titre de jalon visible sur le quai');
  await cliquerZone(p, 'cabine', 0); await signaler(p);
  vrai(!titres.test(await p.$eval(HOTE, (n) => n.textContent)), 'un titre de jalon visible après un signalement');
  await p.click(`${HOTE} .ent-nav[data-vue="accueil"]`);
  vrai(!titres.test(await p.$eval(HOTE, (n) => n.textContent)), 'un titre de jalon visible à l’accueil');
  await p.click(`${HOTE} .ent-nav[data-vue="quai"]`);
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  await p.evaluate(() => { const E = window.__qs.db.quais[window.__qs.Q.id]; E.securite.marques = []; E.securite.signaux = []; E.securite.compteur = 0; E.securite.chef = ''; });
  await p.click(`${HOTE} .ent-nav[data-vue="accueil"]`); await p.click(`${HOTE} .ent-nav[data-vue="quai"]`);
  egal(await p.$eval(SVG, (s) => s.getAttribute('viewBox')), '70 -30 800 520', 'le cadre de « dehors » : celui d’aujourd’hui');
  egal(await p.$$eval(`${HOTE} [data-q="sc-vue"]`, (L) => L.length), 0, 'pas de « Voir dedans » tant que la porte n’est pas ouverte');
  // Les deux couches dans l'ordre : le décor (réécrit par une boucle d'animation), puis les marques, hors du décor.
  egal(await p.$eval(SVG, (s) => [...s.children].filter((n) => n.tagName === 'g').map((n) => n.getAttribute('data-g') || (n.hasAttribute('data-q-marques') ? 'marques' : '?'))), ['iso', 'marques'], 'le décor puis la couche des marques');
  egal(await p.$eval(`${SVG} [data-q-marques]`, (n) => !!n.closest('[data-g="iso"]')), false, 'les marques sont hors du décor');
  // ② à ④ ne s'ouvrent pas tant que l'inspection n'est pas figée, même par un clic forcé.
  await p.$eval(`${HOTE} .quai-stepper button[data-n="3"]`, (b) => b.click());
  egal((await etatQ(p)).etape, 1, 'forcer l’étape ③');
  await p.close();
});

await v('Quai scène : clic au centre de chaque zone, à la souris, dans les deux vues → le bon point ; le mur et l’autre vue → rien de posé, message affiché', async () => {
  const p = await pageScene();
  const fautes = [];
  for (const [id, i, vue] of [['cabine', 0, 'dehors'], ['cabine', 1, 'dehors'], ['cale', 0, 'dehors'], ['butoirs', 0, 'dehors'], ['niveleur', 0, 'dedans'], ['lampe', 0, 'dedans']]) {
    const m = await cliquerZone(p, id, i);
    if (!m || m.point !== id) fautes.push(`${id}/${i} : point touché ${m && m.point}`);
    else if (m.vue !== vue) fautes.push(`${id} : la marque est sur la vue ${m.vue}`);
  }
  // Le mur de la façade (entre les portes 2 et 3, hors de toute zone) : rien n'est posé (20/10/2026), le message s'affiche.
  await allerVue(p, 'dehors');
  const mur = await p.evaluate(async () => { const K = await import('/core/iso.js'); return K.projection({ unite: 54, origine: [330, 150] }).P(5.5, 0, 1.4); });
  const nbAvant = (await secQ(p)).marques.length;
  await cliquerViewBox(p, mur[0], mur[1]);
  let M = (await secQ(p)).marques;
  if (M.length !== nbAvant) fautes.push(`le mur pose une marque : ${JSON.stringify(M[M.length - 1])}`);
  if (await p.$eval(`${HOTE} [data-q-nb-marques]`, (n) => n.textContent) !== 'Clique un objet du quai.') fautes.push('le mur : pas de message « Clique un objet du quai. »');
  // Le niveleur ne se touche que dedans : ses coordonnées de « dedans » cliquées dehors ne posent rien non plus.
  const Zn = (await zonesDe(p)).find((z) => z.id === 'niveleur').rects[0];
  await cliquerViewBox(p, Zn.x + Zn.w / 2, Zn.y + Zn.h / 2);
  M = (await secQ(p)).marques;
  if (M.length !== nbAvant) fautes.push(`le niveleur cliqué dehors pose une marque : ${JSON.stringify(M[M.length - 1])}`);
  // Les marques gardent leur vue, leurs coordonnées arrondies au dixième, un numéro jamais réutilisé ; aucune n'est « à côté ».
  M = (await secQ(p)).marques;
  egal(M.map((m) => m.n), [1, 2, 3, 4, 5, 6], 'numéros dans l’ordre des clics, toutes vues confondues, sans trou (les clics dans le vide ne comptent pas)');
  vrai(M.every((m) => m.point), 'une marque posée ne touche aucun point');
  vrai(M.every((m) => m.envoi === null && Math.abs(m.x * 10 - Math.round(m.x * 10)) < 1e-6 && Math.abs(m.y * 10 - Math.round(m.y * 10)) < 1e-6), 'les marques ne sont pas envoyées / arrondies');
  if (fautes.length) throw new Error(fautes.join(' ; '));
  await p.close();
});

// 20/10/2026 : même règle que l'inspection du poste (validée par Tristan le 19/10) — AUCUNE MARQUE DANS LE VIDE.
await v('Quai scène : un clic dans le vide ne pose rien — compteur immobile, « Clique un objet du quai. » ; un clic sur un objet pose la marque n° 1 ; le jalon « aucun faux » ne tombe pas', async () => {
  const p = await pageScene();
  const mur = await p.evaluate(async () => { const K = await import('/core/iso.js'); return K.projection({ unite: 54, origine: [330, 150] }).P(5.5, 0, 1.4); });
  const NB = `${HOTE} [data-q-nb-marques]`, MARQUES = `${SVG} [data-q-marque]`;
  egal(await p.$eval(NB, (n) => n.textContent), '', 'au départ, pas de compteur ni de message');
  await cliquerViewBox(p, mur[0], mur[1]);
  await cliquerViewBox(p, mur[0], mur[1]);
  let s = await secQ(p);
  egal([s.marques, s.compteur], [[], 0], 'deux clics dans le vide : aucune marque rangée, le compteur ne bouge pas');
  egal(await p.$$eval(MARQUES, (L) => L.length), 0, 'aucun rond dessiné');
  egal(await p.$eval(NB, (n) => n.textContent), 'Clique un objet du quai.', 'le message à la place du compteur');
  egal(await p.$eval(NB, (n) => n.classList.contains('insp-hors')), true, 'le message est en gris discret (même classe que l’inspection du poste)');
  egal(await p.$eval(NB, (n) => n.textContent), 'Clique un objet du quai.', 'le message reste');
  // Un clic sur un objet : la marque n° 1 se pose, le message laisse la place au compteur.
  const m = await cliquerZone(p, 'cabine', 0);
  egal([m.n, m.point], [1, 'cabine'], 'la marque n° 1 sur la cabine');
  egal(await p.$$eval(MARQUES, (L) => L.map((n) => n.getAttribute('data-q-marque'))), ['1'], 'un rond numéroté 1 dessiné');
  egal(await p.$eval(NB, (n) => n.textContent), '1 marque à envoyer', 'le compteur revient');
  egal(await p.$eval(NB, (n) => n.classList.contains('insp-hors')), false, 'plus de style de message');
  // Un clic dans le vide avec une marque posée : rien de plus, la marque reste, le message revient.
  await cliquerViewBox(p, mur[0], mur[1]);
  s = await secQ(p);
  egal([s.marques.length, s.compteur], [1, 1], 'la marque reste seule, le compteur est à 1');
  egal(await p.$eval(NB, (n) => n.textContent), 'Clique un objet du quai.', 'le message revient');
  // « Signaler » : le message disparaît, le signal ne porte aucune marque à côté, le jalon reste juste.
  await signaler(p);
  s = await secQ(p);
  egal(s.signaux, [{ points: ['cabine'], rien: 0, marques: [1], apresArret: false }], 'le signal : la cabine, rien: 0');
  egal(await p.$eval(NB, (n) => n.textContent), '', 'le message est parti après l’envoi');
  egal((await jalonsPage(p))['securite-aucun-faux'], true, 'aucun faux signalement : cliquer dans le vide n’en est pas un');
  await p.close();
});

await v('Quai scène : un clic dans le vide dit la phrase de securite.signaler.horsObjet quand le contenu la déclare', async () => {
  const p = await pageScene(ctxS, { q: { securite: Object.assign(SEC5(), { signaler: { horsObjet: 'Touche un objet de la scène.' } }) } });
  const mur = await p.evaluate(async () => { const K = await import('/core/iso.js'); return K.projection({ unite: 54, origine: [330, 150] }).P(5.5, 0, 1.4); });
  await cliquerViewBox(p, mur[0], mur[1]);
  egal(await p.$eval(`${HOTE} [data-q-nb-marques]`, (n) => n.textContent), 'Touche un objet de la scène.', 'la phrase du contenu');
  egal((await secQ(p)).marques, [], 'rien de posé');
  await p.close();
});

await v('Quai scène : marque retirée avant l’envoi ne compte pas ; envoyée, elle compte et devient inerte', async () => {
  const p = await pageScene();
  // Une marque sur le pare-brise, retirée d'un clic : un « Signaler » n'a plus rien à envoyer.
  await cliquerZone(p, 'cabine', 0);
  egal((await secQ(p)).marques.length, 1, 'une marque');
  await p.click(`${SVG} [data-q-marque="1"]`);
  egal((await secQ(p)).marques.length, 0, 'la marque retirée');
  egal(await p.$eval(`${HOTE} [data-q-nb-marques]`, (n) => n.textContent), '', 'le compteur de marques à envoyer');
  await signaler(p);
  let s = await secQ(p);
  egal(s.signaux, [], 'rien n’est envoyé sans marque');
  egal(await reponse(p), 'Nadia : « Qu’est-ce qui ne va pas ? Clique d’abord sur ce que tu veux me signaler. »', 'la réponse sans marque');
  // La marque retirée ne compte pas : cabine posée puis retirée, cale envoyée seule.
  await cliquerZone(p, 'cabine', 0); await p.click(`${SVG} [data-q-marque="2"]`);
  await cliquerZone(p, 'cale', 0);
  await signaler(p);
  s = await secQ(p);
  egal(s.signaux, [{ points: ['cale'], rien: 0, marques: [3], apresArret: false }], 'le signal ne porte que la cale (le compteur ne revient pas en arrière)');
  egal((await jalonsPage(p))['securite-cabine'], false, 'la cabine retirée avant l’envoi ne compte pas');
  // Une marque envoyée : grisée et inerte (ni retirée, ni nouvelle marque dessous).
  egal(s.marques.map((m) => m.envoi), [1], 'la marque envoyée porte le numéro du signal');
  const avant = await p.$eval(`${SVG} [data-q-marque="3"] circle`, (c) => c.getAttribute('stroke-dasharray'));
  egal(avant, '4 3', 'la marque envoyée est en tirets');
  await p.click(`${SVG} [data-q-marque="3"]`);
  s = await secQ(p);
  egal([s.marques.length, s.compteur, s.signaux.length], [1, 3, 1], 'un clic sur une marque envoyée ne change rien');
  await p.close();
});

await v('Quai scène : la silhouette seule, ou la fumée seule, désigne la cabine', async () => {
  for (const i of [0, 1]) {
    const p = await pageScene();
    await cliquerZone(p, 'cabine', i);
    await signaler(p);
    const s = await secQ(p);
    egal(s.signaux[0].points, ['cabine'], i ? 'la fumée seule' : 'le pare-brise seul');
    egal((await jalonsPage(p))['securite-cabine'], true, 'le jalon de la cabine');
    await p.close();
  }
});

await v('Quai scène : cabine puis niveleur en deux envois — réparations visibles, réponses de Nadia, jalons justes', async () => {
  const p = await pageScene();
  const fumees = () => p.$$eval(`${SVG} .iso-fumee`, (L) => L.length);
  const vide = () => p.$eval(SVG, (s) => s.innerHTML.includes('fill="#0b0c0d"'));
  egal(await fumees(), 3, 'la fumée avant le signalement');
  await cliquerZone(p, 'cabine', 0);
  await signaler(p);
  egal(await reponse(p), 'Nadia : « Bien vu : je fais couper le moteur, le chauffeur me donne les clés et descend. Tu me dis quand on peut décharger. »', 'la réponse du premier envoi (pas de « rien » : tout est juste)');
  egal(await fumees(), 0, 'plus de fumée une fois la cabine réparée');
  egal(await p.$$eval(`${SVG} [data-g="iso"] ellipse[rx][ry]`, (L) => L.length) > 0, true, 'le décor est toujours dessiné');
  egal(await p.$$eval(`${SVG} [data-q-marque]`, (L) => L.length), 1, 'la marque envoyée reste affichée');
  egal(await p.$eval(`${HOTE} [data-q-secu-chef]`, (n) => n.getAttribute('role')), 'status', 'la réponse est annoncée (role=status), sous la scène');
  // Le niveleur : relevé tant qu'il n'est pas signalé (un vide sombre), posé ensuite.
  await allerVue(p, 'dedans');
  egal(await vide(), true, 'le vide du niveleur relevé');
  await cliquerZone(p, 'niveleur', 0);
  await signaler(p);
  egal(await reponse(p), 'Nadia : « Bien vu : je pose le niveleur. Tu me dis quand on peut décharger. »', 'la réponse du second envoi');
  egal(await vide(), false, 'plus de vide : le niveleur est posé');
  egal(await jalonsPage(p), { 'securite-cabine': true, 'securite-niveleur': true, 'securite-aucun-faux': true }, 'les jalons');
  const s = await secQ(p);
  egal(s.signaux.map((g) => g.points), [['cabine'], ['niveleur']], 'deux signaux');
  egal(s.marques.map((m) => [m.n, m.envoi]), [[1, 1], [2, 2]], 'les marques de chaque envoi');
  await p.close();
});

await v('Quai scène : un défaut déjà réparé re-signalé, ou un point en ordre (même deux à la fois) — la réponse dit « rien » une fois ; un clic sur le mur n’y change rien', async () => {
  const p = await pageScene();
  await cliquerZone(p, 'cabine', 0); await signaler(p);
  // La cabine est réparée : son pare-brise est la seule zone qui reste ; la signaler encore n'est pas un faux signalement.
  egal((await zonesDe(p)).find((z) => z.id === 'cabine').rects.length, 1, 'la zone de la fumée a disparu avec la fumée');
  await cliquerZone(p, 'cabine', 0, true); await signaler(p);
  egal(await reponse(p), 'Nadia : « Là, je ne vois rien qui cloche. Tu me dis quand on peut décharger. »', 're-signaler un défaut réparé');
  egal(await jalonsPage(p), { 'securite-cabine': true, 'securite-niveleur': false, 'securite-aucun-faux': true }, 'pas un faux signalement');
  // Deux faux d'un coup (une cale en ordre, des butoirs en ordre) : « rien » une seule fois. Un clic sur le mur entre les deux
  // ne pose rien (20/10/2026) : le signal ne porte que les deux marques, `rien` vaut 0.
  await cliquerZone(p, 'cale', 0);
  const mur = await p.evaluate(async () => { const K = await import('/core/iso.js'); return K.projection({ unite: 54, origine: [330, 150] }).P(5.5, 0, 1.4); });
  await cliquerViewBox(p, mur[0], mur[1]);
  await cliquerZone(p, 'butoirs', 0);
  await signaler(p);
  const t = await reponse(p);
  egal(t, 'Nadia : « Là, je ne vois rien qui cloche. Tu me dis quand on peut décharger. »', 'un seul « rien »');
  const s = await secQ(p);
  egal(s.signaux[2], { points: ['cale', 'butoirs'], rien: 0, marques: [3, 4], apresArret: false }, 'le signal : la cale et les butoirs touchés, aucune marque à côté (le mur n’a rien posé)');
  egal((await jalonsPage(p))['securite-aucun-faux'], false, 'cette fois c’est un faux signalement');
  await p.close();
});

await v('Quai scène : signaler.reponse — défaut, point en ordre, défaut déjà réparé : la MÊME phrase seule (ni « Bien vu », ni « rien », ni fin) ; rien à envoyer garde vide ; marques, signaux et jalons inchangés ; sans la clé, la composition d’avant', async () => {
  const p = await pageScene(ctxS, { q: { securite: Object.assign(SEC5(), { signaler: { qui: 'Nadia', reponse: REP_SC } }) } });
  const PH = 'Nadia : « ' + REP_SC + ' »';
  await signaler(p);
  egal(await reponse(p), 'Nadia : « Qu’est-ce qui ne va pas ? Clique d’abord sur ce que tu veux me signaler. »', 'rien à envoyer : vide');
  await cliquerZone(p, 'cabine', 0); await signaler(p);
  egal(await reponse(p), PH, 'défaut (celui qui se répare)');
  await cliquerZone(p, 'cale', 0); await signaler(p);
  egal(await reponse(p), PH, 'point en ordre');
  await cliquerZone(p, 'cabine', 0, true); await signaler(p);
  egal(await reponse(p), PH, 'défaut déjà réparé');
  const s = await secQ(p);
  egal(s.signaux.map((g) => g.points), [['cabine'], ['cale'], ['cabine']], 'signaux rangés comme avant');
  egal(s.signaux.map((g) => g.rien), [0, 0, 0], 'aucune marque à côté');
  egal(await jalonsPage(p), { 'securite-cabine': true, 'securite-niveleur': false, 'securite-aucun-faux': false }, 'les jalons se lisent comme avant (la cale en ordre signalée est un faux)');
  await p.close();
  // L'inverse : sans la clé, la composition d'avant (réparation + fin ; rien + fin).
  const q = await pageScene();
  await cliquerZone(q, 'cabine', 0); await signaler(q);
  egal(await reponse(q), 'Nadia : « Bien vu : je fais couper le moteur, le chauffeur me donne les clés et descend. Tu me dis quand on peut décharger. »', 'sans reponse : la réparation + la fin');
  await cliquerZone(q, 'cale', 0); await signaler(q);
  egal(await reponse(q), 'Nadia : « Là, je ne vois rien qui cloche. Tu me dis quand on peut décharger. »', 'sans reponse : rien + fin');
  await q.close();
});

await v('Quai scène : décharger sans signaler, arret: false — aucun arrêt, défauts réparés sans un mot, ② montre niveleur posé', async () => {
  const p = await pageScene();
  await p.click(`${HOTE} [data-q="sc-decharger"]`);
  egal(await p.$eval(`${HOTE} [data-q="sc-decharger"]`, (b) => b.textContent.trim()), 'On décharge, c’est définitif : cliquez pour confirmer', 'le premier clic arme');
  egal((await secQ(p)).fait, false, 'rien n’est figé au premier clic');
  await p.click(`${HOTE} [data-q="sc-decharger"]`);
  const s = await secQ(p);
  egal([s.fait, s.arrete, s.signaux.length, s.chef], [true, false, 0, ''], 'figée, pas d’arrêt, aucun texte');
  egal(await p.$$eval(`${HOTE} [data-q-secu-arret], ${HOTE} [data-q-secu-chef], ${HOTE} [data-q-inspection]`, (L) => L.length), 0, 'plus aucune trace de l’inspection à l’écran');
  egal(await p.$$eval(`${HOTE} [data-iso-bulle]`, (L) => L.length), 1, 'le chauffeur descendu parle');
  egal(await p.$eval(`${HOTE} [data-q-arrivee]`, (n) => n.innerHTML.includes('iso-fumee')), false, 'plus de fumée : la cabine est réparée sans un mot');
  vrai(await p.$(`${HOTE} [data-q-apres-arrivee]:not([hidden]) table.quai-bl`), 'le BL');
  egal(await jalonsPage(p), { 'securite-cabine': false, 'securite-niveleur': false, 'securite-aucun-faux': false }, 'inaction : trois jalons faux');
  egal((await p.$$eval(`${HOTE} .quai-stepper button`, (L) => L.map((b) => b.disabled))), [false, true, true, true], 'les étapes suivantes s’ouvrent avec « Oui, vous pouvez décharger »');
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(`${HOTE} [data-q-scene2]`);
  // ② : niveleur posé (plus de vide sombre), la porte est levée tout de suite, le texte ne dit rien de réparé.
  const ou = await p.$eval(`${HOTE} [data-q-scene2]`, (n) => ({ vide: n.innerHTML.includes('fill="#0b0c0d"'), porte: n.querySelectorAll('[data-iso-porte]').length, tete: n.innerHTML.includes('#4a4f52') }));
  egal(ou.vide, false, '② : niveleur posé');
  egal(ou.tete, true, '② : la lampe est dessinée (elle est déclarée)');
  const texte = await p.$eval(HOTE, (n) => n.textContent);
  vrai(!/couper le moteur|poser? le niveleur|Bien vu/i.test(texte), `un texte de réparation à l’écran : ${texte.match(/.{0,30}(couper le moteur|le niveleur|Bien vu).{0,30}/i)}`);
  egal((await gestes(p)).sort(), ['quai:essai-inspection:decharger', 'scene:essai-inspection:decharger'], 'les gestes publiés : « C’est bon » puis « Oui, vous pouvez décharger »');
  await p.close();
});

await v('Quai scène : arret: true — Nadia arrête l’élève qui oublie un défaut, sans le nommer, et les signaux suivants le disent', async () => {
  const p = await pageScene(ctxS, { q: { arret: true } });
  await cliquerZone(p, 'niveleur', 0); await signaler(p);          // il ne signale que le niveleur : la cabine est oubliée
  await decharger(p);
  let s = await secQ(p);
  egal([s.fait, s.arrete], [false, true], 'arrêté, pas figé');
  const t = await p.$eval(`${HOTE} [data-q-secu-arret]`, (n) => n.textContent);
  egal(t, 'Nadia : « Stop ! Avant d’entrer dans la remorque, tout doit être en sécurité. Regarde encore la scène et signale ce qui ne va pas. »', 'le texte d’arrêt par défaut');
  vrai(!/cabine|chauffeur|moteur|fumée|niveleur|cale|butoir|lampe/i.test(t), 'l’arrêt nomme un objet');
  vrai(await p.$(`${SVG}`), 'l’inspection continue');
  await cliquerZone(p, 'cabine', 0); await signaler(p);
  s = await secQ(p);
  egal(s.signaux.map((g) => [g.points, g.apresArret]), [[['niveleur'], false], [['cabine'], true]], 'le signal d’après l’arrêt le dit');
  egal(await p.$$eval(`${HOTE} [data-q-secu-arret]`, (L) => L.length), 0, 'l’arrêt disparaît au signalement suivant');
  egal(await jalonsPage(p), { 'securite-cabine': false, 'securite-niveleur': true, 'securite-aucun-faux': true }, 'la cabine signalée seulement après l’arrêt ne compte pas');
  await decharger(p);
  egal((await secQ(p)).fait, true, 'tout est signalé : l’inspection se fige');
  await p.close();
  // Un texte d'arrêt déclaré.
  const q = await pageScene(ctxS, { q: { securite: Object.assign(SEC5(), { arret: 'Doucement, regarde mieux.', consigne: 'Cherche.', signaler: { qui: 'le chef de quai' }, commencer: 'On y va' }) } });
  await decharger(q);
  egal(await q.$eval(`${HOTE} [data-q-secu-arret]`, (n) => n.textContent), 'Le chef de quai : « Doucement, regarde mieux. »', 'le texte d’arrêt de la séance');
  egal(await q.$eval(`${HOTE} [data-q="sc-signaler"]`, (n) => n.textContent.trim()), 'Signaler au chef de quai', 'le bouton « au chef de quai »');
  egal(await q.$eval(`${HOTE} [data-q-consigne]`, (n) => n.textContent.trim()), 'Cherche.', 'la consigne de la séance');
  egal((await q.$eval(`${HOTE} [data-q="sc-decharger"]`, (n) => n.textContent.trim())).slice(0, 5), 'On y ', 'le libellé de fin de la séance');
  await q.close();
});

await v('Quai scène : en évaluation, rien n’arrête l’élève même avec arret: true', async () => {
  const p = await pageScene(ctxS, { copie: true, q: { arret: true } });
  await decharger(p);
  const s = await secQ(p);
  egal([s.fait, s.arrete, s.signaux.length], [true, false, 0], 'évaluation : figée sans arrêt');
  await p.close();
});

await v('Quai scène : rien ne trahit une zone — aucun title, tabindex, role, attribut data-* nommant un objet ; une seule croix pour curseur', async () => {
  const p = await pageScene();
  const lire = () => p.$eval(SVG, (s) => {
    const noms = new Set(), trahis = [], curseurs = new Set();
    const tous = [s, ...s.querySelectorAll('*')];
    tous.forEach((n) => {
      curseurs.add(getComputedStyle(n).cursor);
      for (const a of n.attributes) {
        if (a.name.startsWith('data-')) noms.add(a.name);
        if (/cabine|cale|butoir|niveleur|lampe|fum|chauffeur|moteur|essai/i.test(a.name + ' ' + (a.name.startsWith('data-') ? a.value : ''))) trahis.push(`${n.tagName}[${a.name}=${a.value}]`);
      }
    });
    const interdits = [...s.querySelectorAll('title, [title], [tabindex]')].length + (s.hasAttribute('title') || s.hasAttribute('tabindex') ? 1 : 0)
      + [...s.querySelectorAll('[role]')].length;
    return { noms: [...noms].sort(), trahis, curseurs: [...curseurs], interdits, n: tous.length };
  });
  // Dehors, avec une marque non envoyée et une marque envoyée.
  await cliquerZone(p, 'cabine', 0); await signaler(p); await cliquerZone(p, 'cale', 0);
  let r = await lire();
  egal(r.interdits, 0, 'title, tabindex ou role dans la scène de dehors');
  egal(r.trahis, [], 'un nom d’objet dans un attribut de la scène de dehors');
  egal(r.curseurs, ['crosshair'], 'le curseur de la scène de dehors (sur chaque élément)');
  vrai(r.noms.every((n) => ['data-q-inspection', 'data-vue', 'data-g', 'data-q-marques', 'data-q-marque', 'data-iso-bulle', 'data-iso-horloge', 'data-iso-zone', 'data-iso-porte', 'data-iso-avarie'].includes(n)), `attributs data-* inattendus : ${r.noms}`);
  vrai(r.n > 100, 'la scène est bien dessinée');
  await allerVue(p, 'dedans'); await cliquerZone(p, 'niveleur', 0);
  r = await lire();
  egal([r.interdits, r.trahis, r.curseurs], [0, [], ['crosshair']], 'la scène de dedans');
  // Le survol ne change rien : même curseur sur un objet et à côté (lu dans le navigateur, pas dans notre CSS).
  const Z = (await zonesDe(p)).find((z) => z.id === 'lampe').rects[0];
  const bb = await p.locator(SVG).boundingBox();
  await p.mouse.move(bb.x + 5, bb.y + 5);
  egal(await p.$eval(SVG, (s) => getComputedStyle(s).cursor), 'crosshair', 'le curseur du <svg>');
  vrai(Z.w > 0, 'zone lue');
  await p.close();
});

await v('Quai scène : la porte de quai — ouverte une fois, rangée ; dehors ↔ dedans libres ; ② démarre porte déjà levée', async () => {
  const p = await pageScene();
  await p.click(`${HOTE} [data-q="sc-ouvrir"]`);
  let s = await secQ(p);
  egal(s.ouverte, true, 'la porte est rangée ouverte');
  egal(await vueActuelle(p), 'dedans', 'ouvrir bascule sur la vue de dedans');
  egal(await p.$eval(SVG, (n) => n.getAttribute('viewBox')), '290 0 640 480', 'le cadre de « dedans » : celui d’aujourd’hui');
  egal(await p.$$eval(`${HOTE} [data-q="sc-ouvrir"]`, (L) => L.length), 0, 'on n’ouvre qu’une fois');
  egal(await p.$$eval(`${SVG} [data-iso-porte]`, (L) => L.length), 0, 'mouvement réduit : la porte est levée tout de suite (aucune porte baissée)');
  egal(await p.$eval(`${HOTE} [data-q="sc-vue"]`, (b) => b.textContent.trim()), '← Revoir dehors', 'le bouton de retour');
  await p.click(`${HOTE} [data-q="sc-vue"]`);
  egal(await vueActuelle(p), 'dehors', 'revoir dehors');
  egal(await p.$eval(`${HOTE} [data-q="sc-vue"]`, (b) => b.textContent.trim()), 'Voir dedans →', 'le bouton d’aller');
  egal((await secQ(p)).signaux.length + (await secQ(p)).marques.length, 0, 'ouvrir la porte ne pose, n’envoie ni ne fige rien');
  egal(await gestes(p), [], 'ouvrir la porte ne publie aucun geste');
  // Un rechargement : la porte rangée ouverte, sans rejouer (la vue de dedans l'a déjà levée).
  const base = await p.evaluate(() => window.__qs.db);
  await monterScene(p, { db: base });
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  egal(await vueActuelle(p), 'dehors', 'après rechargement on repart dehors');
  await p.click(`${HOTE} [data-q="sc-vue"]`);
  egal(await p.$$eval(`${SVG} [data-iso-porte]`, (L) => L.length), 0, 'après rechargement : porte levée');
  // ② : porte déjà levée dès la première image (pas de seconde levée).
  await decharger(p);
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(`${HOTE} [data-q-scene2]`);
  egal(await p.$$eval(`${HOTE} [data-q-scene2] [data-iso-porte]`, (L) => L.length), 0, '② : la porte est levée');
  await p.close();
  // Avec le mouvement normal : ② démarre porte DÉJÀ levée (dès la première image), sauf si l'élève ne l'a jamais ouverte.
  const m = await pageScene(ctxSM);
  await m.click(`${HOTE} [data-q="sc-ouvrir"]`);
  await m.waitForFunction(() => document.querySelectorAll('#qiScene [data-q-inspection] [data-iso-porte]').length === 0);
  await m.waitForTimeout(250);
  await decharger(m);
  await m.click(`${HOTE} [data-q="decharger"]`);
  await m.waitForSelector(`${HOTE} [data-q-scene2]`);
  egal(await m.$$eval(`${HOTE} [data-q-scene2] [data-iso-porte]`, (L) => L.length), 0, '② (mouvement normal) : pas de seconde levée');
  await m.close();
  const n = await pageScene(ctxSM);
  await decharger(n);
  await n.click(`${HOTE} [data-q="decharger"]`);
  await n.waitForSelector(`${HOTE} [data-q-scene2]`);
  egal(await n.$$eval(`${HOTE} [data-q-scene2] [data-iso-porte]`, (L) => L.length), 1, '② (mouvement normal) : une porte jamais ouverte se lève à l’étape ②');
  await n.close();
});

await v('Quai scène : mouvement normal — la porte se lève en 1,8 s, la scène ne répond pas pendant la levée, la fumée tourne', async () => {
  const p = await pageScene(ctxSM);
  const marques = async () => (await secQ(p)).marques.length;
  const fum = await p.$$eval(`${SVG} .iso-fumee`, (L) => L.map((c) => c.getAnimations().length));
  egal(fum, [1, 1, 1], 'la fumée est animée avec le mouvement normal');
  await p.click(`${HOTE} [data-q="sc-ouvrir"]`);
  await p.waitForFunction(() => document.querySelectorAll('#qiScene [data-q-inspection] [data-iso-porte]').length === 1);
  // Un clic AU CENTRE du niveleur (un vrai objet : depuis le 20/10/2026 un clic dans le vide ne pose plus rien, il ne prouverait rien).
  const Zn = (await zonesDe(p)).find((z) => z.id === 'niveleur').rects[0];
  await cliquerViewBox(p, Zn.x + Zn.w / 2, Zn.y + Zn.h / 2);
  egal(await marques(), 0, 'un clic pendant la levée est ignoré');
  await p.waitForFunction(() => document.querySelectorAll('#qiScene [data-q-inspection] [data-iso-porte]').length === 0, null, { timeout: 4000 });
  await p.waitForTimeout(250);   // la dernière image de la levée
  await cliquerViewBox(p, Zn.x + Zn.w / 2, Zn.y + Zn.h / 2);
  egal(await marques(), 1, 'la levée finie, le clic pose une marque');
  await p.close();
  // Mouvement réduit demandé : la fumée est dessinée et immobile ; et la scène répond tout de suite après « Ouvrir ».
  const r = await pageScene(ctxS);
  egal(await r.$$eval(`${SVG} .iso-fumee`, (L) => L.map((c) => [getComputedStyle(c).animationName, c.getAnimations().length])), [['none', 0], ['none', 0], ['none', 0]], 'fumée immobile mais dessinée');
  await r.click(`${HOTE} [data-q="sc-ouvrir"]`);
  const Zr = (await zonesDe(r)).find((z) => z.id === 'niveleur').rects[0];   // un vrai objet : le vide ne pose plus rien
  await cliquerViewBox(r, Zr.x + Zr.w / 2, Zr.y + Zr.h / 2);
  egal((await secQ(r)).marques.length, 1, 'mouvement réduit : pas de levée à attendre');
  await r.close();
});

await v('Quai scène : les marques — ni vert ni rouge, texte et fond avec un contraste d’au moins 4,5', async () => {
  const p = await pageScene();
  await cliquerZone(p, 'cabine', 0); await signaler(p); await cliquerZone(p, 'cale', 0);
  const m = await p.evaluate(() => [...document.querySelectorAll('#qiScene [data-q-marque]')].map((g) => {
    const c = g.querySelector('circle'), t = g.querySelector('text');
    return { fond: c.getAttribute('fill'), trait: c.getAttribute('stroke'), texte: t.getAttribute('fill'), envoyee: c.hasAttribute('stroke-dasharray'), opacite: c.getAttribute('opacity') };
  }));
  egal(m.length, 2, 'deux marques');
  const rgb = (s) => { const h = /^#([0-9a-f]{6})$/i.exec(s); if (h) return [0, 2, 4].map((i) => parseInt(h[1].slice(i, i + 2), 16)); const r = /rgba?\(([^)]+)\)/.exec(s).slice(1)[0].split(',').map(Number); return r; };
  const lum = ([r, g, b]) => { const f = (u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((u, w) => w - u); return (x + 0.05) / (y + 0.05); };
  const sol = rgb('#e4dfd3');
  for (const x of m) {
    const [r, g, b, a = 1] = rgb(x.fond);
    const fond = [r, g, b].map((u, i) => Math.round(a * u + (1 - a) * sol[i]));
    const op = x.opacite ? Number(x.opacite) : 1;
    const fondEff = fond.map((u, i) => Math.round(op * u + (1 - op) * sol[i]));
    vrai(contraste(rgb(x.texte), fondEff) >= 4.5, `contraste du numéro (${x.texte} sur ${fondEff}) : ${contraste(rgb(x.texte), fondEff).toFixed(2)}`);
    for (const c of [x.trait, x.texte]) {
      const [r2, g2, b2] = rgb(c);
      vrai(!(g2 > r2 + 25 && g2 > b2 + 25) && !(r2 > g2 + 25 && r2 > b2 + 25), `la marque est verte ou rouge : ${c}`);
    }
  }
  egal(m.map((x) => x.envoyee), [true, false], 'la marque envoyée est grisée en tirets, l’autre non');
  await p.close();
});

await v('Quai scène : jusqu’au bilan — la phrase du bilan, « Recommencer » remet l’inspection à zéro', async () => {
  const p = await pageScene();
  await decharger(p);                                   // l'inaction : tout est faux
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.fill(`${HOTE} #qCompte`, '8'); await p.press(`${HOTE} #qCompte`, 'Enter');
  await p.click(`${HOTE} #qDec-accepter`);
  await p.click(`${HOTE} [data-q="valider"]`);
  await p.click(`${HOTE} [data-q="vers4"]`); await p.click(`${HOTE} [data-q="vers4"]`);
  await p.click(`${HOTE} [data-q="ecrire"]`);
  await p.click(`${HOTE} [data-q="signer"]`);
  await p.click(`${HOTE} [data-q="clore"]`);
  await p.waitForSelector(`${HOTE} [data-q-bilan]`);
  const lignes = await p.$$eval(`${HOTE} [data-q-bilan] tr[data-jalon^="securite-"]`, (L) => L.map((r) => [r.dataset.jalon, r.cells[0].textContent.trim(), r.cells[1].textContent.trim(), r.cells[2].textContent.trim(), r.cells[3].textContent.includes('✗')]));
  egal(lignes, [
    ['securite-cabine', 'Danger n° 1 signalé avant de décharger', 'jamais signalé', 'signaler : Chauffeur au volant, moteur allumé', true],
    ['securite-niveleur', 'Danger n° 2 signalé avant de décharger', 'jamais signalé', 'signaler : Niveleur relevé', true],
    ['securite-aucun-faux', 'Aucun faux signalement', 'rien signalé', 'au moins un signalement, et aucun sur un point conforme', true],
  ], 'les trois jalons de sécurité au bilan');
  egal(await p.$eval(`${HOTE} [data-q-bilan-securite]`, (n) => n.textContent.trim()), 'La scène n’était pas sûre : avant d’entrer dans un camion, il doit être immobilisé et le passage vers la remorque doit être sûr.', 'la phrase du bilan');
  // Recommencer (deux clics) : le quai repart de zéro, inspection comprise.
  await p.click(`${HOTE} [data-q="recommencer"]`); await p.click(`${HOTE} [data-q="recommencer"]`);
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  const s = await secQ(p);
  egal(s, { mode: 'scene', marques: [], compteur: 0, signaux: [], ouverte: false, arrete: false, fait: false, chef: '' }, 'l’inspection est à zéro');
  egal((await etatQ(p)).etape, 1, 'étape ①');
  egal(await vueActuelle(p), 'dehors', 'on repart dehors');
  await p.close();
  // Tout juste : pas de phrase au bilan.
  const q = await pageScene();
  await cliquerZone(q, 'cabine', 0); await cliquerZone(q, 'niveleur', 0); await signaler(q);
  await decharger(q);
  await q.click(`${HOTE} [data-q="decharger"]`);
  await q.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  await q.click(`${HOTE} [data-q="vers3"]`);
  await q.fill(`${HOTE} #qCompte`, '8'); await q.press(`${HOTE} #qCompte`, 'Enter');
  await q.click(`${HOTE} #qDec-accepter`); await q.click(`${HOTE} [data-q="valider"]`);
  await q.click(`${HOTE} [data-q="vers4"]`); await q.click(`${HOTE} [data-q="vers4"]`);
  await q.click(`${HOTE} [data-q="ecrire"]`); await q.click(`${HOTE} [data-q="signer"]`); await q.click(`${HOTE} [data-q="clore"]`);
  await q.waitForSelector(`${HOTE} [data-q-bilan]`);
  egal(await q.$$eval(`${HOTE} [data-q-bilan-securite]`, (L) => L.length), 0, 'aucune phrase quand les jalons de sécurité sont justes');
  egal(await q.$$eval(`${HOTE} [data-q-bilan] tr[data-jalon^="securite-"] .quai-ok`, (L) => L.length), 3, 'trois jalons justes');
  await q.close();
});

await v('Quai scène : gestes publiés (signaler, décharger) et déclarés ; en liste ils n’existent pas', async () => {
  const p = await pageScene();
  await cliquerZone(p, 'cabine', 0);
  await signaler(p);
  egal(await gestes(p), ['scene:essai-inspection:signaler'], 'un envoi publie scene:<id>:signaler');
  const sans = await etatQ(p);
  vrai(!JSON.stringify((await p.evaluate(() => window.__qs.db.gestes))).includes('cabine'), 'le geste ne dit rien des marques ni des points touchés');
  await decharger(p);
  egal((await gestes(p)).sort(), ['scene:essai-inspection:decharger', 'scene:essai-inspection:signaler'], 'figer l’inspection publie scene:<id>:decharger');
  vrai(sans.securite.signaux.length === 1, 'un seul signal');
  const liste = await p.evaluate(async () => {
    const Q = await import('/core/types/quai.js'), E = await import('/outils/essai-quai-inspection.js');
    const vueScene = Q.creerQuai(E.quaiEssai({}));
    const S = E.quaiEssai({}).securite;
    return { scene: vueScene.signaux, quaiListe: Q.creerQuai(Object.assign({}, E.quaiEssai({}), { rendu: undefined, securite: { points: [{ id: 'a', lib: 'A', ok: false }] } })).signaux, n: S.points.length };
  }).catch((x) => ({ erreur: String(x) }));
  egal(liste.scene, ['quai:essai-inspection:decharger', 'quai:essai-inspection:valider', 'quai:essai-inspection:cloturer', 'scene:essai-inspection:signaler', 'scene:essai-inspection:decharger'], 'les signaux de la vue en mode scène');
  vrai(!liste.quaiListe.some((g) => /^scene:/.test(g)), 'les signaux de la vue en liste');
  await p.close();
});

await v('Quai scène : une base écrite avant le mode scène est complétée sans rien effacer ; une déclaration fautive empêche la séance de s’ouvrir', async () => {
  const p = await pageScene();
  const base = { quais: { 'essai-inspection': { v: 1, etape: 0, minute: 0, reel: 0, tiersTemps: false, sel: 0, journal: [], palettes: { P1: { vue: 0, vues: [0], sonde: null, compte: null, etiqVue: false, detail: {}, decision: '', motif: 'aucun', res: '', motif2: 'aucun', res2: '', fiche: {}, calcul: {} } },
    fini: false, securite: { marques: [{ n: 7, vue: 'dehors', x: 1, y: 2, point: null, envoi: null }] } } } };
  await monterScene(p, { db: base });
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  const s = await secQ(p);
  egal([s.mode, s.compteur, s.signaux, s.ouverte, s.fait, s.marques.length], ['scene', 7, [], false, false, 1], 'la base complétée (le compteur ne repart pas sous un numéro déjà pris)');
  egal((await etatQ(p)).etape, 1, 'l’étape 0 d’une ancienne base devient ①');
  // Une déclaration fautive : le moteur lève une erreur qui nomme le défaut.
  const mauvais = await p.evaluate(async () => {
    const Q = await import('/core/types/quai.js'), E = await import('/outils/essai-quai-inspection.js');
    const dec = E.quaiEssai({}); dec.rendu = undefined; dec.securite.points[0].ok = true;
    try { Q.creerQuai(dec); return 'pas d’erreur'; } catch (x) { return x.message; }
  });
  vrai(/essai-inspection/.test(mauvais) && /rendu: 'iso'/.test(mauvais) && /ok: true sur un état dangereux/.test(mauvais), `message : ${mauvais}`);
  await p.close();
});

await v('Quai scène : la page d’essai — la partie 2 se lance, se joue, affiche les jalons ; la partie 1 n’en est pas touchée', async () => {
  const p = await pageEssai();
  egal(await p.$$eval('[data-q-inspection]', (L) => L.length), 0, 'la scène ne se monte qu’à la demande (la partie 1 ne voit pas un second <svg> de dehors)');
  await p.click('[data-lancer-scene]');
  await p.waitForSelector('[data-q-inspection]');
  egal(await p.$$eval('[data-jalons-corps] tbody tr', (L) => L.length), 3, 'trois jalons de sécurité affichés');
  await p.locator('[data-q-inspection]').scrollIntoViewIfNeeded();
  const Z = await p.evaluate(async () => {
    const Q = await import('/core/types/quai.js'), S = window.__essaiScene.quai().securite;
    return Q.zonesScene(S, Q.etatsScene(S, null)).find((z) => z.id === 'cabine').rects[0];
  });
  const bb = await p.locator('[data-q-inspection]').boundingBox();
  const [vx, vy, vw, vh] = [70, -30, 800, 520], k = Math.min(bb.width / vw, bb.height / vh);
  await p.mouse.click(bb.x + (bb.width - vw * k) / 2 + (Z.x + Z.w / 2 - vx) * k, bb.y + (bb.height - vh * k) / 2 + (Z.y + Z.h / 2 - vy) * k);
  await p.click('[data-q="sc-signaler"]');
  await p.waitForFunction(() => /juste/.test(document.querySelector('[data-jalons-corps] tbody tr:first-child td:last-child').textContent) && !/pas \(encore\)/.test(document.querySelector('[data-jalons-corps] tbody tr:first-child td:last-child').textContent));
  egal(await p.$eval('[data-jalons-corps] tbody tr:first-child td:nth-child(2)', (n) => n.textContent), 'signalé avant de décharger', 'le jalon de la cabine passe au vert');
  await p.click('[data-recommencer-scene]');
  await p.waitForFunction(() => document.querySelectorAll('[data-q-marque]').length === 0);
  egal(await p.$eval('[data-jalons-corps] tbody tr:first-child td:nth-child(2)', (n) => n.textContent), 'pas signalé', '« Tout remettre à zéro »');
  await p.close();
});

await v('Quai scène : les séances existantes ne changent pas — aucune ne reçoit un refus, leur étape ⓪ en liste garde son état et ses jalons', async () => {
  const r = await pg.evaluate(async () => {
    const Q = await import('/core/types/quai.js');
    const S = await import('/contenus/smoby-ent54.js'), P = await import('/contenus/spartoo-reception.js');
    const sm = S.QUAI_ENT54 || S.QUAI;
    const dec = [['spartoo', P.QUAI], ['smoby', sm]].filter(([, q]) => q);
    const R = { ecarts: dec.map(([n, q]) => [n, Q.verifierQuai(q)]), noms: dec.map(([n]) => n) };
    const smoby = sm ? Q.etatNeuf(sm) : null;
    R.smoby = smoby ? { etape: smoby.etape, cles: Object.keys(smoby.securite).sort(), liste: Q.jalonsQuai({}, sm).L.map((l) => l.id).filter((id) => /^securite/.test(id)) } : null;
    R.spartoo = (() => { const e = Q.etatNeuf(P.QUAI); return { etape: e.etape, securite: e.securite === undefined }; })();
    return R;
  });
  egal(r.ecarts, [['spartoo', []], ['smoby', []]], 'aucun refus sur les séances en iso et en liste');
  vrai(r.smoby, 'le quai de Smoby ENT-5.4 n’a pas pu être lu');
  egal(r.smoby, { etape: 0, cles: ['arrete', 'chef', 'fait', 'rep', 'signaux'], liste: ['securiteSignalee', 'securiteConstat'] }, 'Smoby : l’étape ⓪ en liste, son état et ses deux jalons d’avant');
  egal(r.spartoo, { etape: 1, securite: true }, 'Spartoo : étape ①, aucun état de sécurité');
});

/* ------------------------------------------------------------------ étape 3 : la palette de fûts */
// `forme: 'fut'` : une palette de rétention noire portant 8 fûts debout en quinconce 3-2-3 (brief `docs/briefs/MOTEUR-quai-inspection.md`
// §2.1 c et §2.3). Les valeurs attendues sont écrites à la main ; les quatre palettes d'ENT-6.4 sont celles de la page d'essai.

const PALS = await pg.evaluate(async () => (await import('/outils/essai-quai-inspection.js')).PALETTES_ENT64);
const PF = (o = {}) => Object.assign({ id: 'P1', forme: 'fut', ref: 'AFF-20', nom: 'Affligem Blonde fût 20 L', bl: 8, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
  etiq: { ref: 'AFF-20', nom: 'AFFLIGEM BLONDE FÛT 20 L', poids: 'fût de 20 L', lot: 'L-1' } }, o);
const QFUT = (ps, m = {}) => Object.assign({ id: 'tf', rendu: 'iso', froid: false, motifs: ['avarie', 'manquant', 'produit'],
  camions: [{ transporteur: 'T', fournisseur: 'F', bl: 'BL', arrivee: '07:30', palettes: ps }] }, m);
const jal = (Q, id) => quaiMod.jalonsQuai({}, Q).L.find((l) => l.id === id);
// Les faces extérieures de chaque fût, écrites à la main (rangée du fond 1-2-3, milieu 4-5, avant 6-7-8).
const EXT = { 1: 'NW', 2: 'N', 3: 'NE', 4: 'W', 5: 'E', 6: 'SW', 7: 'S', 8: 'SE' };

await v('Quai fûts : le total est 8, le réel et les avaries se calculent (valeurs écrites à la main), jamais déclarés', async () => {
  const compte = (p) => jal(QFUT([PF(p)]), 'P1-comptage').attendu.match(/^(\d+) \S+ \(BL : (\d+)\)$/).slice(1);
  egal(compte({}), ['8', '8'], 'palette pleine : 8 fûts attendus');
  egal(compte({ manque: [7], bl: 7 }), ['7', '7'], 'une place vide : 7 (P4)');
  egal(compte({ manque: [3, 8] }), ['6', '8'], 'deux places vides : 6');
  egal(compte({ manque: [1, 2, 3, 4, 5, 6, 7, 8] }), ['0', '8'], 'huit places vides : 0');
  const avaries = (av) => jal(QFUT([PF({ attendu: 'reserves', motifAttendu: 'avarie', avarie: av })]), 'P1-reserve').attendu.match(/ — (\d+) /)[1];
  egal(avaries({}), '0', 'aucune fuite');
  egal(avaries({ 2: 'N' }), '1', 'une fuite (P3)');
  egal(avaries({ 2: 'N', 3: 'E', 6: 'W' }), '3', 'trois fuites : autant que de clés');
  const manquants = (p) => jal(QFUT([PF(Object.assign({ attendu: 'reserves', motifAttendu: 'manquant' }, p))]), 'P1-reserve').attendu.match(/manque (\d+) \S+ \(BL (\d+), reçu (\d+)\)/).slice(1);
  egal(manquants({ manque: [3, 8] }), ['2', '8', '6'], 'manquants = BL − réel');
  egal(manquants({ manque: [7], bl: 7 }), ['0', '7', '7'], 'une place vide que le BL annonce : 0 manquant');
  // Les quatre palettes d'ENT-6.4 telles que la page les déclare.
  const QP = QFUT(PALS);
  egal(['P1', 'P2', 'P3', 'P4'].map((id) => jal(QP, `${id}-comptage`).attendu.match(/^(\d+)/)[1]), ['8', '8', '8', '7'], 'les quatre palettes : 8, 8, 8 et 7 fûts');
  egal(jal(QP, 'P3-reserve').attendu.match(/ — (\d+) /)[1], '1', 'P3 : une fuite');
  vrai(/PEL-20/.test(jal(QP, 'P2-reserve').attendu), 'P2 : la réserve nomme la référence lue (Pelforth)');
  vrai(!jal(QP, 'P1-reserve') && !jal(QP, 'P4-reserve'), 'P1 et P4 sont acceptées : pas de ligne de réserve');
  egal(PALS.map((p) => [p.manque, Object.keys(p.avarie).length]), [[[], 0], [[], 0], [[], 1], [[7], 0]], 'la déclaration de la page : P4 une place vide, P3 une fuite');
});

await v('Quai fûts : verifierQuai accepte les faces extérieures et refuse chaque déclaration fautive, avec un message clair', async () => {
  // Depuis le garde-fou de l'unité (fin du chantier D-4), un quai de fûts déclare `unite: 'fûts'` : QFU = QFUT + cette unité.
  const QFU = (ps, m = {}) => QFUT(ps, Object.assign({ unite: 'fûts' }, m));
  egal(quaiMod.verifierQuai(QFU(PALS)), [], 'les quatre palettes d’ENT-6.4');
  egal(quaiMod.verifierQuai(QFUT([{ id: 'P1', ref: 'X', bl: 8, W: 2, D: 2, L: 2, manque: ['0,0,1'], avarie: { '1,0,0': [0, -1] }, etiq: {} }], { aides: { regleCouches: true, detailComptage: true } })), [], 'une palette de cartons n’est pas touchée par les règles des fûts');
  const fautes = [];
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) for (const f of ['N', 'S', 'E', 'W']) {
    const E = quaiMod.verifierQuai(QFU([PF({ avarie: { [n]: f } })]));
    if (EXT[n].includes(f)) { if (E.length) fautes.push(`fût ${n} face ${f} refusée : ${E[0]}`); }
    else if (!(E.length === 1 && /cachée/.test(E[0]))) fautes.push(`fût ${n} face ${f} (intérieure) : ${E.length ? E[0] : 'pas refusée'}`);
  }
  const REFUS_FUT = [
    ['largeur W', (Q) => { Q.camions[0].palettes[0].W = 2; }, /« W »/],
    ['profondeur D', (Q) => { Q.camions[0].palettes[0].D = 2; }, /« D »/],
    ['couches L', (Q) => { Q.camions[0].palettes[0].L = 1; }, /« L »/],
    ['références multiples', (Q) => { Q.camions[0].palettes[0].refs = []; }, /« refs »/],
    ['étiquette avant déchirée', (Q) => { Q.camions[0].palettes[0].etiqAvant = 'dechiree'; }, /« etiqAvant »/],
    ['numéro 9 en manque', (Q) => { Q.camions[0].palettes[0].manque = [9]; }, /« 9 » n’existe pas/],
    ['numéro 0 en manque', (Q) => { Q.camions[0].palettes[0].manque = [0]; }, /« 0 » n’existe pas/],
    ['numéro décimal en manque', (Q) => { Q.camions[0].palettes[0].manque = [1.5]; }, /« 1\.5 »/],
    ['numéro en double', (Q) => { Q.camions[0].palettes[0].manque = [3, 3]; }, /en double/],
    ['manque pas une liste', (Q) => { Q.camions[0].palettes[0].manque = 'abc'; }, /liste des numéros/],
    ['fuite sur le fût 9', (Q) => { Q.camions[0].palettes[0].avarie = { 9: 'N' }; }, /« 9 » n’existe pas/],
    ['fuite sur « x »', (Q) => { Q.camions[0].palettes[0].avarie = { x: 'N' }; }, /« x » n’existe pas/],
    ['face inconnue', (Q) => { Q.camions[0].palettes[0].avarie = { 2: 'Z' }; }, /« Z »/],
    ['face en minuscule', (Q) => { Q.camions[0].palettes[0].avarie = { 2: 'n' }; }, /« n »/],
    ['face intérieure', (Q) => { Q.camions[0].palettes[0].avarie = { 5: 'N' }; }, /cachée par les autres fûts/],
    ['fût absent qui fuit', (Q) => { Q.camions[0].palettes[0].manque = [2]; Q.camions[0].palettes[0].avarie = { 2: 'N' }; }, /absent, il ne peut pas fuir/],
    ['avarie en tableau', (Q) => { Q.camions[0].palettes[0].avarie = []; }, /avarie doit être/],
    ['forme inconnue', (Q) => { Q.camions[0].palettes[0].forme = 'caisse'; }, /forme « caisse » inconnue/],
    ['sans rendu iso', (Q) => { delete Q.rendu; }, /rendu: 'iso'/],
    ['aides.regleCouches', (Q) => { Q.aides = { regleCouches: true }; }, /aides\.regleCouches/],
    ['aides.detailComptage', (Q) => { Q.aides = { detailComptage: true }; }, /aides\.detailComptage/],
    ['sans unité', (Q) => { delete Q.unite; }, /une palette de fûts demande `unite`/],
  ];
  for (const [nom, mute, motif] of REFUS_FUT) {
    const Q = QFU([PF()]); mute(Q);
    const E = quaiMod.verifierQuai(Q);
    if (!E.length) fautes.push(`« ${nom} » n’est pas refusé`);
    else if (!E.some((m) => motif.test(m))) fautes.push(`« ${nom} » : message sans « ${motif} » (${E.join(' | ')})`);
  }
  if (fautes.length) throw new Error(fautes.join(' ; '));
});

await v('Quai fûts : une palette de fûts sans unite est refusée (message clair, creerQuai ne s’ouvre pas) ; avec unite, ou avec des cartons sans unite, c’est accepté', async () => {
  const sans = quaiMod.verifierQuai(QFUT([PF()]));
  vrai(sans.length === 1 && /une palette de fûts demande `unite` \(par exemple `'fûts'`\)/.test(sans[0]), `sans unité : ${sans.join(' | ') || 'pas refusé'}`);
  egal(quaiMod.verifierQuai(QFUT([PF()], { unite: 'fûts' })), [], 'avec unite: \'fûts\'');
  egal(quaiMod.verifierQuai(QFUT([PF()], { unite: { un: 'fût', des: 'fûts' } })), [], 'avec { un, des }');
  egal(quaiMod.verifierQuai(QFUT([{ id: 'P1', ref: 'X', bl: 8, W: 2, D: 2, L: 2, manque: [], avarie: {}, etiq: {} }])), [], 'des cartons sans unite : rien à redire');
  const msg = await pg.evaluate(async (ps) => {
    const Q = await import('/core/types/quai.js'), E = await import('/outils/essai-quai-inspection.js');
    const q = E.quaiEssai({ palettes: ps }); delete q.unite;
    try { Q.creerQuai(q); return 'pas d’erreur'; } catch (x) { return x.message; }
  }, PALS);
  vrai(/essai-inspection/.test(msg) && /demande `unite`/.test(msg), `message : ${msg}`);
});

await v('Quai fûts : un quai déclaré faux ne s’ouvre pas (creerQuai lève une erreur qui nomme le défaut)', async () => {
  const msg = await pg.evaluate(async (ps) => {
    const Q = await import('/core/types/quai.js'), E = await import('/outils/essai-quai-inspection.js');
    const q = E.quaiEssai({ palettes: ps }); q.camions[0].palettes[0].W = 2; q.camions[0].palettes[2].avarie = { 5: 'N' };
    try { Q.creerQuai(q); return 'pas d’erreur'; } catch (x) { return x.message; }
  }, PALS);
  vrai(/essai-inspection/.test(msg) && /« W »/.test(msg) && /cachée par les autres fûts/.test(msg), `message : ${msg}`);
});

await v('Quai fûts : facesExterieuresFut et les huit places — table écrite à la main, quinconce 3-2-3 de fûts de 39,5 cm qui se touchent', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    return { faces: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => K.facesExterieuresFut(n)), hors: [K.facesExterieuresFut(0), K.facesExterieuresFut(9)], places: K.PLACES_FUT, cote: K.COTE_BAC };
  });
  egal(r.faces, [['N', 'W'], ['N'], ['N', 'E'], ['W'], ['E'], ['S', 'W'], ['S'], ['S', 'E']], 'les faces extérieures de chaque fût');
  egal(r.hors, [[], []], 'pas de fût 0 ni 9');
  egal(r.cote, 1.3, 'le bac de 1,30 m');
  const att = [[-.395, -.3421], [0, -.3421], [.395, -.3421], [-.1975, 0], [.1975, 0], [-.395, .3421], [0, .3421], [.395, .3421]];
  const ecart = r.places.map(([x, y], i) => Math.max(Math.abs(x - att[i][0]), Math.abs(y - att[i][1])));
  vrai(ecart.every((e) => e < 0.0006), `les places ne sont pas celles du quinconce 3-2-3 (écarts ${ecart.map((e) => e.toFixed(4))})`);
  const d = (a, b) => Math.hypot(r.places[a][0] - r.places[b][0], r.places[a][1] - r.places[b][1]);
  vrai([d(0, 1), d(1, 2), d(3, 4), d(5, 6), d(6, 7), d(0, 3), d(1, 3), d(1, 4), d(2, 4), d(3, 5), d(3, 6), d(4, 6), d(4, 7)].every((x) => Math.abs(x - 0.395) < 0.0006), 'les fûts voisins se touchent (centres à 39,5 cm)');
});

await v('Quai fûts : paletteFuts — bac noir (jamais de bois), huit fûts debout, place vide non dessinée, coupe au mur, échelle du décor', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 150, origine: [470, 190] });
    const futs = (manque = [], av = {}) => Array.from({ length: 8 }, (_, k) => ({ no: k + 1, ref: 'AFF-20', absent: manque.includes(k + 1), fuite: av[k + 1] || null }));
    const attrs = (f) => `data-f="${f.no}"`;
    const dessin = (m, av, rot, o = {}, ox = 0.2, oy = -0.45) => K.paletteFuts(I, { futs: futs(m, av) }, ox, oy, rot, Object.assign({ attrs }, o));
    const n = (s, re) => (s.match(re) || []).length;
    const nos = (s) => [...s.matchAll(/data-f="(\d)"/g)].map((m) => +m[1]).sort();
    const S = dessin([], {}, 0);
    const bbox = (svgTexte) => {
      const h = document.createElement('div'); h.innerHTML = `<svg viewBox="0 0 900 700" width="900" height="700">${K.DEFS}<g>${svgTexte}</g></svg>`;
      document.body.append(h); const b = h.querySelector('g').getBBox(); h.remove(); return { x: b.x, y: b.y, w: b.width, h: b.height };
    };
    const R = {
      groupes: n(S, /data-f="/g), sans7: nos(dessin([7], {}, 0)), hauts: n(S, /fill="#eef0f1"/g), hautsSans7: n(dessin([7], {}, 0), /fill="#eef0f1"/g),
      bois: ['#c9a273', '#b48a5b', '#9c7549', '#d9b27a', '#c99c5f', '#b48549'].filter((c) => S.includes(c)), noir: ['#3d4245', '#2f3336', '#24282a', '#1e2123'].every((c) => S.includes(c)),
      sansFut: n(K.paletteFuts(I, { futs: [] }, 0.2, -0.45, 0, {}), /fill="#eef0f1"/g),
      reperes: n(dessin([], {}, 0, { lisible: true }), /AFF-20<\/text>/g), sansTexte: n(dessin([], {}, 0, { lisible: false }), /AFF-20<\/text>/g),
      eclaire: n(dessin([], {}, 0, { sel: 3 }), /stroke="#d1a90f" stroke-width="3"/g), pasEclaire: n(S, /stroke="#d1a90f"/g),
    };
    // Une fuite ne se dessine que si sa face se voit : la coulure sur le fût et la flaque dans le bac, de ce côté-là.
    const fuite = (face, no, o = {}) => [0, 1, 2, 3].map((rot) => { const s = dessin([], { [no]: face }, rot, o); return [n(s, /data-iso-avarie/g), n(s, /data-iso-flaque/g)]; });
    R.fuiteN2 = fuite('N', 2); R.fuiteE3 = fuite('E', 3); R.fuiteS6 = fuite('S', 6); R.fuiteW1 = fuite('W', 1);
    R.sansFuite = [0, 1, 2, 3].map((rot) => n(dessin([], {}, rot), /data-iso-(avarie|flaque)/g));
    R.sansDents = fuite('N', 2, { dents: false });
    R.fuiteAbsent = [0, 1, 2, 3].map((rot) => n(dessin([2], { 2: 'N' }, rot), /data-iso-(avarie|flaque)/g));
    const s2 = dessin([], { 2: 'N' }, 2);
    R.flaqueApres = s2.indexOf('data-iso-flaque') > s2.indexOf('data-iso-avarie');
    // La flaque reste dans le bac.
    const bac = bbox(K.paletteFuts(I, { futs: [] }, 0.2, -0.45, 2, {}));
    const flaques = [[2, 'N', 2], [3, 'E', 0], [6, 'S', 0], [1, 'W', 2], [4, 'W', 3], [8, 'E', 1], [5, 'E', 0]].map(([no, face, rot]) => {
      const h = document.createElement('div');
      h.innerHTML = `<svg viewBox="0 0 900 700" width="900" height="700">${K.DEFS}<g>${dessin([], { [no]: face }, rot)}</g></svg>`;
      document.body.append(h);
      const f = h.querySelector('[data-iso-flaque]'), b = f ? f.getBBox() : null; h.remove();
      return { no, face, rot, b: b ? { x: b.x, y: b.y, x2: b.x + b.width, y2: b.y + b.height } : null };
    });
    R.bac = { x: bac.x, y: bac.y, x2: bac.x + bac.w, y2: bac.y + bac.h };
    R.flaques = flaques;
    // Échelle du décor : un bac de 0,95 m est (0,95 / 1,30) fois plus petit, dans la même proportion.
    const grand = bbox(dessin([], {}, 0)), petit = bbox(dessin([], {}, 0, { cote: 0.95 }));
    R.echelle = petit.w / grand.w;
    const rx = (svg) => +svg.match(/<ellipse[^>]*rx="([\d.]+)"[^>]*fill="#eef0f1"/)[1];
    R.rayon = rx(dessin([], {}, 0, { cote: 0.95 })) / rx(dessin([], {}, 0));
    // La coupe au mur : un fût est dessiné dans la tranche où est son centre (un bac de 0,95 m posé en y = −4,2 : ses rangées sont à y = −3,975 / −3,725 / −3,475).
    const decor = K.projection({ unite: 60, origine: [470, 235] });
    const coupe = (oy, o) => nos(K.paletteFuts(decor, { futs: futs() }, 2.5, oy, 0, Object.assign({ attrs, cote: 0.95 }, o)));
    R.auFond = coupe(-4.2, { yMin: -3.6 }); R.sansCoupe = coupe(-4.2, {});
    R.dedans = coupe(-0.5, { yMax: 0 }); R.dehors = coupe(-0.5, { yMin: 0 });
    return R;
  });
  egal(r.groupes, 8, 'huit fûts, chacun cliquable');
  egal(r.sans7, [1, 2, 3, 4, 5, 6, 8], 'la place 7 vide : le fût 7 n’est pas dessiné, les autres le sont');
  egal([r.hauts, r.hautsSans7, r.sansFut], [8, 7, 0], 'huit dessus de fût (debout), sept sans le 7, aucun sans fût');
  egal(r.bois, [], 'aucune teinte de bois ni de carton : le bac est en plastique');
  vrai(r.noir, 'le bac est noir : pieds, bac, caillebotis');
  egal([r.reperes, r.sansTexte], [8, 0], 'la référence est écrite sur la collerette quand le dessin est lisible, et seulement alors');
  egal([r.eclaire, r.pasEclaire], [2, 0], 'le fût éclairé a son liseré doré, les autres non');
  // Une fuite sur la face N du fût 2 se voit palette tournée d'un quart de tour (côté droit) ou d'un demi-tour (arrière), comme le
  // carton enfoncé du kit ; jamais de l'avant ni du côté gauche. Chaque face se voit à DEUX rotations (devant, puis de côté).
  egal(r.fuiteN2, [[0, 0], [1, 1], [1, 1], [0, 0]], 'fuite N du fût 2 : rotations 1 et 2');
  egal(r.fuiteE3, [[1, 1], [1, 1], [0, 0], [0, 0]], 'fuite E du fût 3 : rotations 0 et 1');
  egal(r.fuiteS6, [[1, 1], [0, 0], [0, 0], [1, 1]], 'fuite S du fût 6 : rotations 0 et 3');
  egal(r.fuiteW1, [[0, 0], [0, 0], [1, 1], [1, 1]], 'fuite W du fût 1 : rotations 2 et 3');
  egal(r.sansFuite, [0, 0, 0, 0], 'sans fuite, ni coulure ni flaque');
  egal(r.sansDents, [[0, 0], [0, 0], [0, 0], [0, 0]], 'dents: false ne dessine aucune fuite');
  egal(r.fuiteAbsent, [0, 0, 0, 0], 'un fût absent ne fuit pas');
  vrai(r.flaqueApres, 'la flaque se dessine après le fût qui fuit (elle est devant lui)');
  const dans = (b) => b && b.x >= r.bac.x - 0.5 && b.x2 <= r.bac.x2 + 0.5 && b.y >= r.bac.y - 0.5 && b.y2 <= r.bac.y2 + 0.5;
  const dehors = r.flaques.filter((f) => !dans(f.b));
  egal(dehors, [], 'chaque flaque tient dans le bac');
  vrai(Math.abs(r.echelle - 0.95 / 1.3) < 0.01, `un bac de 0,95 m n’est pas à l’échelle (rapport ${r.echelle.toFixed(3)} au lieu de ${(0.95 / 1.3).toFixed(3)})`);
  vrai(Math.abs(r.rayon - 0.95 / 1.3) < 0.01, `le fût d’un bac de 0,95 m n’est pas à l’échelle (rapport ${r.rayon.toFixed(3)})`);
  egal(r.sansCoupe, [1, 2, 3, 4, 5, 6, 7, 8], 'sans coupe : tous les fûts');
  egal(r.auFond, [6, 7, 8], 'une palette au fond de la remorque est coupée au mur du fond (yMin −3,6) : seule la rangée d’avant reste');
  egal([...r.dedans, ...r.dehors].sort(), [1, 2, 3, 4, 5, 6, 7, 8], 'dedans et dehors se partagent les huit fûts, sans doublon ni oubli');
  egal(r.dedans, [1, 2, 3, 4, 5], 'dedans : les fûts au fond du plan du mur');
  egal(r.dehors, [6, 7, 8], 'dehors : les fûts devant le plan du mur');
});

// Monte la séance d'essai avec des palettes données (et d'autres réglages du quai).
const monterAvec = (p, o) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-quai-inspection.js');
  document.querySelector('#qiScene')?.remove();
  const hote = document.createElement('div'); hote.id = 'qiScene'; document.body.prepend(hote);
  const Q = Object.assign(E.quaiEssai({ palettes: o.palettes }), o.extra || {});
  const db = {};
  window.__qs = { db, Q, enregistres: [] };
  const ctx = {
    meta: { id: 'essai-inspection', code: 'ESSAI', titre: 'Essai de l’inspection', portee: 'eleve', immersif: true, temps: 'guidage', bareme: 20 },
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__qs.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  };
  creerEntreprise(E.universQuai(Q)).rendre(hote, ctx);
  document.querySelector('#qiScene .ent-nav[data-vue="quai"]').click();
}, o);
async function pageAvec(o) {
  const p = await ctxS.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  await monterAvec(p, o);
  await p.waitForSelector(`${HOTE} [data-q-inspection], ${HOTE} [data-q="passer1"]`);
  if (await p.$(`${HOTE} [data-q="passer1"]`)) await p.click(`${HOTE} [data-q="passer1"]`);
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  return p;
}
// De l'inspection (rien signalé : arret: false) à l'étape ② : les palettes déchargées, puis ③.
async function jusquaEtape2(p) {
  await decharger(p);
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
}
const jalonsPalettes = (p) => p.evaluate(async () => {
  const Q = await import('/core/types/quai.js');
  return Object.fromEntries(Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.filter((l) => /^P\d-/.test(l.id)).map((l) => [l.id, l.ok]));
});

await v('Quai fûts : ② montre les quatre palettes dans la zone de réception (cadre agrandi, zone calculée), une seule palette garde la zone d’aujourd’hui', async () => {
  const p = await pageAvec({ palettes: PALS });
  await jusquaEtape2(p);
  const r = await p.$eval(`${HOTE} [data-q-scene2]`, (s) => {
    const zone = s.querySelector('[data-iso-zone]').getBBox();
    const bacs = [...s.querySelectorAll('polygon[fill="#3d4245"]')].map((n) => n.getBBox());
    return { vb: s.getAttribute('viewBox'), hauts: (s.innerHTML.match(/fill="#eef0f1"/g) || []).length, bacs: bacs.length, zone: { x: zone.x, y: zone.y, x2: zone.x + zone.width, y2: zone.y + zone.height },
      hors: bacs.filter((b) => b.x < zone.x - 1 || b.x + b.width > zone.x + zone.width + 1 || b.y + b.height > zone.y + zone.height + 1).length };
  });
  egal(r.vb, '290 0 640 540', 'le cadre grandit pour quatre palettes');
  egal(r.hauts, 31, '8 + 8 + 8 + 7 fûts dessinés (la place vide de P4 n’est pas dessinée)');
  egal(r.bacs, 4, 'quatre bacs de rétention');
  egal(r.hors, 0, 'chaque bac tient dans la zone de réception, calculée pour quatre palettes');
  egal(await p.$$eval(`${HOTE} [data-q-past] i.sur`, (L) => L.length), 4, 'les quatre pastilles sont « sur le quai »');
  // Les places (deux colonnes ; la rangée du fond, la plus près de l'élève, reçoit P1 et P2) : les écarts à l'écran de P1 sont écrits à la main
  // (pas de 1,15 m : 59,8 en X et 34,5 en Y par mètre de x ; 59,8 en X et −34,5 en Y par mètre de y), P1 centrée sur la porte (X = 432).
  const pl = await p.$eval(`${HOTE} [data-q-scene2]`, (s) => {
    const C = Object.fromEntries([...s.querySelectorAll('[data-iso-pal]')].map((g) => { const b = g.getBBox(); return [g.dataset.isoPal, [b.x + b.width / 2, b.y + b.height / 2]]; }));
    const ombre = s.querySelector('ellipse[fill="rgba(0,0,0,.2)"]');
    return { C, chauffeur: ombre ? +ombre.getAttribute('cx') : null, droite: Math.max(...[...s.querySelectorAll('[data-iso-pal]')].map((g) => { const b = g.getBBox(); return b.x + b.width; })) };
  });
  const dif = (a, b) => [pl.C[a][0] - pl.C[b][0], pl.C[a][1] - pl.C[b][1]];
  const proche = (v, w) => Math.abs(v[0] - w[0]) < 3 && Math.abs(v[1] - w[1]) < 3;
  vrai(proche(dif('P2', 'P1'), [59.8, 34.5]), `P2 n’est pas à droite de P1 (écart ${dif('P2', 'P1').map((x) => x.toFixed(1))})`);
  vrai(proche(dif('P3', 'P1'), [59.8, -34.5]), `P3 n’est pas derrière P1 (écart ${dif('P3', 'P1').map((x) => x.toFixed(1))})`);
  vrai(proche(dif('P4', 'P1'), [119.6, 0]), `P4 n’est pas en diagonale de P1 (écart ${dif('P4', 'P1').map((x) => x.toFixed(1))})`);
  vrai(Math.abs(pl.C.P1[0] - 432.3) < 2.5, `P1 n’est pas centrée sur la porte (X = ${pl.C.P1[0].toFixed(1)} au lieu de 432)`);
  vrai(pl.chauffeur > pl.droite, `le chauffeur qui attend est devant les palettes (X = ${pl.chauffeur}), pas à leur droite (${pl.droite.toFixed(0)})`);
  egal(await p.$eval(`${HOTE} [data-q-nb]`, (n) => n.textContent.trim()), '4 / 4', 'le compteur de palettes');
  vrai(await p.$eval(`${HOTE} [data-q-scene2]`, (s) => !!s.querySelector('defs linearGradient#isoMetal')), 'le dégradé du métal des fûts est posé');
  await p.close();
  // Une seule palette de fûts : la zone d'aujourd'hui, le cadre d'aujourd'hui.
  const q = await pageAvec({ palettes: [PALS[0]] });
  await jusquaEtape2(q);
  const un = await q.$eval(`${HOTE} [data-q-scene2]`, (s) => ({ vb: s.getAttribute('viewBox'), zone: s.querySelector('[data-iso-zone]').getAttribute('points'), hauts: (s.innerHTML.match(/fill="#eef0f1"/g) || []).length }));
  const attendu = await q.evaluate(async () => {
    const K = await import('/core/iso.js');
    return K.solQuai(K.projection({ unite: 60, origine: [470, 235] }), 'x').match(/data-iso-zone points="([^"]+)"/)[1];
  });
  egal(un.vb, '290 0 640 480', 'une palette : le cadre d’aujourd’hui');
  egal(un.zone, attendu, 'une palette : la zone de réception d’aujourd’hui, point pour point');
  egal(un.hauts, 8, 'huit fûts');
  await q.close();
});

await v('Quai fûts : ③ — huit fûts cliquables par leur étiquette, la fuite de P3 ne se voit qu’à deux rotations, le trou de P4, le zoom', async () => {
  const p = await pageAvec({ palettes: PALS });
  await jusquaEtape2(p);
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  const PAL3 = `${HOTE} [data-q-palette]`;
  const compte = (sel) => p.$$eval(`${PAL3} ${sel}`, (L) => L.length);
  egal(await p.$eval(PAL3, (s) => s.getAttribute('aria-label')), 'Palette P1 : clique sur un fût pour lire son étiquette', 'l’étiquette lue par un lecteur d’écran');
  const parPalette = [];
  for (const n of [0, 1, 2, 3]) {
    await p.click(`${HOTE} [data-q="sel"][data-n="${n}"]`);
    parPalette.push([await compte('[data-q-carton]'), await compte('.quai-etiq-clic'), (await p.$eval(PAL3, (s) => (s.innerHTML.match(/fill="#eef0f1"/g) || []).length))]);
  }
  egal(parPalette, [[8, 8, 8], [8, 8, 8], [8, 8, 8], [7, 7, 7]], 'P1 à P3 : huit fûts ; P4 : sept (une place vide)');
  egal(await compte('[data-q-carton="7"]'), 0, 'P4 : le fût 7 n’est pas là');
  vrai(await p.$eval(`${HOTE} [data-q-palette] defs linearGradient#isoMetal, ${HOTE} [data-q-palette] linearGradient#isoMetal`, () => true).catch(() => false), 'le dégradé du métal est posé dans la scène ③');
  // P3 : la fuite ne se voit pas de l'avant ; elle apparaît au quart de tour (côté droit), reste à l'arrière, disparaît au quart suivant.
  await p.click(`${HOTE} [data-q="sel"][data-n="2"]`);
  const vues = [];
  for (let k = 0; k < 4; k++) { vues.push(await compte('[data-iso-avarie]')); await p.click(`${HOTE} [data-q="tourner"]:not([data-sens])`); }
  egal(vues, [0, 1, 1, 0], 'la coulure de P3 : avant, côté droit, arrière, côté gauche');
  // Le zoom : un fût cliqué lit son étiquette ; ce qu'on voit de lui dépend de la vue.
  await p.click(`${HOTE} [data-q="tourner"]:not([data-sens])`); await p.click(`${HOTE} [data-q="tourner"]:not([data-sens])`);   // arrière
  await p.click(`${PAL3} [data-q-carton="2"]`);
  egal(await p.$eval(`${HOTE} [data-q-etiquette] .quai-etiq-ref`, (n) => n.textContent.trim()), 'AFF-20', 'l’étiquette du fût cliqué');
  egal(await p.$eval(`${HOTE} [data-q-etiquette] .quai-etiq-l1 span`, (n) => n.textContent.replace(/\s+/g, ' ').trim()), 'Fût 2 / 8', 'le numéro du fût');
  vrai(/Fuite sur cette face/.test(await p.$eval(`${HOTE} [data-q-etat-carton]`, (n) => n.textContent)), 'le fût 2 vu de l’arrière : fuite sur cette face');
  await p.click(`${PAL3} [data-q-carton="1"]`);
  vrai(/intact/.test(await p.$eval(`${HOTE} [data-q-etat-carton]`, (n) => n.textContent)), 'le fût 1 vu de l’arrière : intact');
  egal(await p.$$eval(`${HOTE} [data-q-etiquette] .quai-etiq-ref`, (L) => L.length), 1, 'une seule étiquette à l’écran');
  await p.click(`${PAL3} [data-q-carton="2"]`);
  await p.click(`${HOTE} [data-q="tourner"][data-sens="-1"]`);   // côté droit : la fuite se voit encore
  vrai(/Fuite sur cette face/.test(await p.$eval(`${HOTE} [data-q-etat-carton]`, (n) => n.textContent)), 'le fût 2 vu de côté (droit) : fuite visible');
  await p.click(`${HOTE} [data-q="tourner"][data-sens="-1"]`);   // avant : cachée
  vrai(/intact/.test(await p.$eval(`${HOTE} [data-q-etat-carton]`, (n) => n.textContent)), 'le fût 2 vu de l’avant : intact (il faut faire le tour)');
  // P2 : l'étiquette dit Pelforth alors que le BL annonce de l'Affligem.
  await p.click(`${HOTE} [data-q="sel"][data-n="1"]`);
  await p.click(`${PAL3} [data-q-carton="3"]`);
  egal(await p.$eval(`${HOTE} [data-q-etiquette] .quai-etiq-ref`, (n) => n.textContent.trim()), 'PEL-20', 'P2 : la référence lue sur le fût est PEL-20');
  await p.close();
});

await v('Quai fûts : parcours ②③④ des quatre palettes jusqu’au bilan — comptage 8, 8, 8 et 7 ; réserves de P2 et P3', async () => {
  const p = await pageAvec({ palettes: PALS });
  await jusquaEtape2(p);
  await p.click(`${HOTE} [data-q="vers3"]`);
  const valide = async (n, compte, decision, motif) => {
    await p.click(`${HOTE} [data-q="sel"][data-n="${n}"]`);
    await p.fill(`${HOTE} #qCompte`, String(compte)); await p.press(`${HOTE} #qCompte`, 'Enter');
    await p.click(`${HOTE} #qDec-${decision}`);
    if (motif) await p.click(`${HOTE} #qMot-${motif}`);
    await p.click(`${HOTE} [data-q="valider"]`);
  };
  await valide(0, 8, 'accepter');
  await valide(1, 8, 'reserves', 'produit');
  await valide(2, 8, 'reserves', 'avarie');
  await valide(3, 7, 'accepter');
  egal(await jalonsPalettes(p), { 'P1-comptage': true, 'P1-decision': true, 'P2-comptage': true, 'P2-decision': true, 'P3-comptage': true, 'P3-decision': true, 'P4-comptage': true, 'P4-decision': true,
    'P2-reserve': false, 'P3-reserve': false }, 'comptage et décisions justes avant les réserves');
  await p.click(`${HOTE} [data-q="vers4"]`); await p.click(`${HOTE} [data-q="vers4"]`);
  await p.fill(`${HOTE} #qRes-P2`, 'PEL-20'); await p.fill(`${HOTE} #qRes-P3`, '1');
  // ④ : les quatre palettes sont posées en zone de réception (cadre agrandi, zone calculée).
  const cf = await p.$eval(`${HOTE} [data-q-cf]`, (s) => ({ vb: s.getAttribute('viewBox'), hauts: (s.innerHTML.match(/fill="#eef0f1"/g) || []).length }));
  egal(cf, { vb: '200 60 640 520', hauts: 31 }, '④ : le cadre agrandi, 31 fûts dessinés');
  await p.click(`${HOTE} [data-q="ecrire"]`);
  await p.click(`${HOTE} [data-q="signer"]`);
  await p.click(`${HOTE} [data-q="clore"]`);
  await p.waitForSelector(`${HOTE} [data-q-bilan]`);
  const J = await jalonsPalettes(p);
  egal(Object.values(J).every(Boolean), true, `tous les jalons de palettes sont justes : ${JSON.stringify(J)}`);
  await p.close();
  // Le piège de P4 : compter 8 (palette supposée pleine) est faux ; 7 est juste. Un total écrit au clavier compte, pas un total deviné.
  const q = await pageAvec({ palettes: PALS });
  await jusquaEtape2(q);
  await q.click(`${HOTE} [data-q="vers3"]`);
  await q.click(`${HOTE} [data-q="sel"][data-n="3"]`);
  await q.fill(`${HOTE} #qCompte`, '8'); await q.press(`${HOTE} #qCompte`, 'Enter');
  egal((await jalonsPalettes(q))['P4-comptage'], false, 'P4 comptée 8 : faux');
  await q.fill(`${HOTE} #qCompte`, '7'); await q.press(`${HOTE} #qCompte`, 'Enter');
  egal((await jalonsPalettes(q))['P4-comptage'], true, 'P4 comptée 7 : juste');
  await q.close();
});

// Le déchargement animé, sous horloge simulée : les palettes qui attendent dans la remorque avancent d'un cran quand celle d'avant a fait
// la moitié du chemin ; celles du fond de la remorque sont coupées au mur du fond (une palette de 0,95 m par cran de 1,05 m).
await v('Quai fûts : le déchargement animé — la file d’attente avance d’un cran, les palettes du fond sont coupées au mur', async () => {
  const p = await ctxSM.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  await p.clock.install({ time: 0 });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  await monterAvec(p, { palettes: PALS });
  await p.waitForSelector(`${HOTE} [data-q="passer1"], ${HOTE} [data-q-inspection]`);
  if (await p.$(`${HOTE} [data-q="passer1"]`)) await p.click(`${HOTE} [data-q="passer1"]`);
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  await decharger(p);
  await p.click(`${HOTE} [data-q="decharger"]`);
  const tops = () => p.$eval(`${HOTE} [data-q-scene2]`, (s) => ['P1', 'P2', 'P3', 'P4'].map((id) => [...s.querySelectorAll(`[data-iso-pal="${id}"]`)].reduce((t, g) => t + (g.innerHTML.match(/fill="#eef0f1"/g) || []).length, 0)));
  await p.clock.runFor(2500);   // la porte est levée, P1 vient de partir
  // P1 (y = −2,9) : ses 8 fûts ; P2 (cran 1, y = −3,95) : 5 fûts, les trois du fond passent derrière le mur ; P3 et P4 : rien.
  egal(await tops(), [8, 5, 0, 0], 'au départ : 8, 5, 0 et 0 fûts visibles dans la remorque');
  await p.clock.runFor(4000);   // P1 a fait plus de la moitié du chemin : la file a avancé
  egal(await tops(), [8, 8, 5, 0], 'la file a avancé d’un cran : P2 en tête (8 fûts), P3 au cran 1 (5 fûts)');
  // P2 sort à t = 8,6 s : à 11,76 s, son avant est à y = 0,5 m devant le mur. Elle a glissé de 43 % vers sa colonne (1,15 m) : son centre est
  // à x = 3,49 m, y = 0,97 m, soit X = 470 + (3,49 − 0,97) × 52 = 601 à l'écran (elle serait en X = 635 si elle glissait dès la porte).
  await p.clock.runFor(5262);
  const X = await p.$eval(`${HOTE} [data-q-scene2]`, (s) => { const B = [...s.querySelectorAll('[data-iso-pal="P2"]')].map((g) => g.getBBox()).filter((b) => b.width); return (Math.min(...B.map((b) => b.x)) + Math.max(...B.map((b) => b.x + b.width))) / 2; });
  vrai(Math.abs(X - 601) < 8, `P2 sortant de la porte n’est pas au bon endroit (X = ${X.toFixed(1)} au lieu de 601 : elle doit d’abord traverser la porte, puis glisser de côté)`);
  await p.clock.runFor(30000);
  egal(await tops(), [8, 8, 8, 7], 'à la fin : les quatre palettes sorties, 8, 8, 8 et 7 fûts');
  await p.close();
});

await v('Quai fûts : brouillon de calcul imposé à une palette de fûts (même si la séance déclare la feuille), la feuille reste pour les cartons', async () => {
  const carton = { id: 'P1', ref: 'ESS-CAR', nom: 'Cartons d’essai', bl: 8, W: 2, D: 2, L: 2, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun', etiq: { ref: 'ESS-CAR', nom: 'CARTONS', poids: '1 carton', lot: 'L1' } };
  const fut = Object.assign({}, PALS[0], { id: 'P2' });
  const p = await pageAvec({ palettes: [carton, fut], extra: { calcul: { forme: 'feuille', rappel: true } } });
  await jusquaEtape2(p);
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.waitForSelector(`${HOTE} [data-q-calc]`);
  const forme = () => p.$eval(`${HOTE} [data-q-calc]`, (n) => n.dataset.qCalc);
  const rappel = () => p.$$eval(`${HOTE} [data-q-rappel]`, (L) => L.length);
  await p.click(`${HOTE} [data-q="sel"][data-n="0"]`);
  egal([await forme(), await rappel()], ['feuille', 1], 'la palette de cartons : la feuille et son rappel');
  await p.click(`${HOTE} [data-q="sel"][data-n="1"]`);
  egal([await forme(), await rappel()], ['brouillon', 0], 'la palette de fûts : le brouillon, sans rappel de couches');
  await p.close();
});

await v('Quai fûts : dedans (inspection), les palettes au fond sont coupées au mur du fond de la remorque', async () => {
  const p = await pageAvec({ palettes: PALS });
  await p.click(`${HOTE} [data-q="sc-ouvrir"]`);
  await p.waitForFunction(() => document.querySelector('#qiScene [data-q-inspection]').dataset.vue === 'dedans');
  // P1 (y = −2,9) : ses huit fûts ; P2 (y = −3,95) : cinq fûts (les trois du fond passent derrière le mur) ; P3 et P4 : rien.
  egal(await p.$eval(`${HOTE} [data-q-inspection]`, (s) => (s.innerHTML.match(/fill="#eef0f1"/g) || []).length), 13, 'dedans : 8 + 5 fûts, pas plus');
  await p.close();
});

/* ------------------------------------------------------------------ étape 4 : l'unité déclarable et les libellés des motifs */
// `unite: 'fûts'` (ou `{ un, des }`), `libelles: { avarie: { nom, precision }, … }` et `motifs` (brief `docs/briefs/MOTEUR-quai-inspection.md`
// §2.1 b). Règle de l'étape : SANS ces champs, chaque texte de Picard, Smoby et Spartoo reste celui d'aujourd'hui, caractère pour caractère.
// Toutes les phrases attendues ci-dessous sont écrites à la main (celles de Picard, de Smoby et de Spartoo sont déjà vérifiées par leurs blocs).

const PC = (o = {}) => Object.assign({ id: 'P1', ref: 'REF-1', nom: 'Désignation', W: 2, D: 2, L: 2, bl: 8, manque: [], avarie: {}, temp: -20, attendu: 'accepter', motifAttendu: 'aucun',
  etiq: { ref: 'REF-1', nom: 'DÉSIGNATION', poids: '1 carton', lot: 'L-1' } }, o);
const QC = (ps, m = {}) => Object.assign({ id: 'qc', camions: [{ nom: 'Camion', arrivee: '06:00', fournisseur: 'F', palettes: ps }] }, m);
const AV = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`${i},0,1`, [0, -1]]));   // n cartons enfoncés
const attendu = (Q, id) => jal(Q, id).attendu;
const PALS_C = [
  PC({ id: 'P2', ref: 'CRB-070', W: 3, D: 3, L: 4, bl: 36, avarie: AV(2), attendu: 'reserves', motifAttendu: 'avarie' }),
  PC({ id: 'P3', ref: 'GVA-1000', W: 4, D: 3, L: 4, bl: 48, temp: -14.2, attendu: 'refuser', motifAttendu: 'temperature' }),
  PC({ id: 'P4', ref: 'CAB-400', W: 3, D: 2, L: 4, bl: 24, manque: ['0,0,0', '1,0,0'], attendu: 'reserves', motifAttendu: 'manquant' }),
  PC({ id: 'P5', ref: 'EPH-450', W: 5, D: 3, L: 2, bl: 30, attendu: 'refuser', motifAttendu: 'produit', etiq: { ref: 'EPB-450', nom: 'X', poids: 'x', lot: 'l' } }),
  PC({ id: 'P6', ref: 'PRO-12', W: 4, D: 2, L: 5, bl: 40, manque: ['0,0,0'], avarie: AV(3), attendu: 'reserves', motifAttendu: 'manquant', motif2Attendu: 'avarie' }),
  PC({ id: 'P7', ref: 'REF-7', avarie: AV(1), attendu: 'refuser', motifAttendu: 'avarie' }),
  PC({ id: 'P8', ref: 'REF-8', W: 3, D: 3, L: 3, bl: 27, manque: ['0,0,2'], attendu: 'reserves', motifAttendu: 'manquant' }),
];

await v('Quai unité : sans unite ni libelles, les phrases d’aujourd’hui — réserves, comptage, décisions et motifs (écrites à la main, comme celles de Picard et de Smoby)', async () => {
  const Q = QC(PALS_C);
  egal([
    attendu(Q, 'P2-reserve'), attendu(Q, 'P3-reserve'), attendu(Q, 'P4-reserve'), attendu(Q, 'P5-reserve'), attendu(Q, 'P6-reserve'), attendu(Q, 'P7-reserve'), attendu(Q, 'P8-reserve'),
  ], [
    'P2 CRB-070 : acceptée sous réserve — 2 cartons endommagés (écrasés).',
    'P3 GVA-1000 : palette REFUSÉE — température à cœur −14,2 °C (−18 °C exigé). 48 cartons repris par le chauffeur.',
    'P4 CAB-400 : acceptée sous réserve — manque 2 cartons (BL 24, reçu 22).',
    'P5 EPH-450 : palette REFUSÉE — produit livré EPB-450 au lieu de EPH-450 commandé. 30 cartons repris par le chauffeur.',
    'P6 PRO-12 : acceptée sous réserve — manque 1 carton (BL 40, reçu 39) ; 3 cartons endommagés (écrasés).',
    'P7 REF-7 : palette REFUSÉE — 1 carton endommagé. 8 cartons repris par le chauffeur.',
    'P8 REF-8 : acceptée sous réserve — manque 1 carton (BL 27, reçu 26).',
  ], 'les lignes de réserve attendues');
  egal([attendu(Q, 'P2-comptage'), jal(Q, 'P2-comptage').fait, attendu(Q, 'P3-comptage')], ['36 cartons (BL : 36)', 'pas compté', '48 cartons (BL : 48)'], 'le comptage attendu');
  egal([attendu(Q, 'P2-decision'), attendu(Q, 'P3-decision'), attendu(Q, 'P6-decision'), attendu(Q, 'P7-decision')],
    ['Accepter avec réserves — Cartons endommagés', 'Refuser — Température non conforme', 'Accepter avec réserves — Manquant + Cartons endommagés', 'Refuser — Cartons endommagés'], 'la décision attendue');
  // Le comptage écrit par l'élève (jalon « fait ») : « 36 cartons ».
  const avecCompte = quaiMod.jalonsQuai({ quais: { qc: { palettes: { P2: { compte: 36, decision: 'reserves', motif: 'avarie' } } } } }, Q).L;
  egal(avecCompte.find((l) => l.id === 'P2-comptage').fait, '36 cartons', 'le comptage de l’élève');
  egal(avecCompte.find((l) => l.id === 'P2-decision').fait, 'Accepter avec réserves — Cartons endommagés', 'la décision de l’élève');
  // Les motifs : les mêmes mots qu'avant, par l'ancien chemin (MOTIFS, libMotifs(L)) comme par le nouveau (libellesMotifs).
  egal(quaiMod.MOTIFS, { aucun: 'aucun motif', temperature: 'Température non conforme', avarie: 'Cartons endommagés', manquant: 'Manquant', produit: 'Produit différent de la commande' }, 'MOTIFS exporté tel quel');
  egal(quaiMod.libellesMotifs({}), quaiMod.MOTIFS, 'libellesMotifs sans rien déclarer = MOTIFS');
  egal([quaiMod.libMotifs([]), quaiMod.libMotifs(['avarie']), quaiMod.libMotifs(['manquant', 'avarie']), quaiMod.libMotifs(['avarie'], {}), quaiMod.libMotifs([], QC([]))],
    ['aucun motif', 'Cartons endommagés', 'Manquant + Cartons endommagés', 'Cartons endommagés', 'aucun motif'], 'libMotifs sans second paramètre, ou avec un quai qui ne déclare rien');
  egal(quaiMod.uniteQuai({}), { un: 'carton', des: 'cartons' }, 'l’unité par défaut');
});

await v('Quai unité : avec une unité — le texte suit (singulier, pluriel, précision), les mots des motifs sont ceux de la séance, les réserves de P3 d’ENT-6.4 s’écrivent « 1 fût endommagé (fuite) »', async () => {
  const U = { unite: 'fûts', libelles: { avarie: { nom: 'Fût endommagé', precision: 'fuite' } } };
  const QU = (ps, m = {}) => QFUT(ps, Object.assign({}, U, m));
  const P3 = PF({ id: 'P3', avarie: { 2: 'N' }, attendu: 'reserves', motifAttendu: 'avarie' });
  egal(attendu(QU([P3]), 'P3-reserve'), 'P3 AFF-20 : acceptée sous réserve — 1 fût endommagé (fuite).', 'la réserve attendue de P3 (brief 2.1 b)');
  egal([
    attendu(QU([PF({ id: 'P3', avarie: { 2: 'N', 3: 'N' }, attendu: 'reserves', motifAttendu: 'avarie' })]), 'P3-reserve'),
    attendu(QU([PF({ id: 'P4', manque: [5, 6], attendu: 'reserves', motifAttendu: 'manquant' })]), 'P4-reserve'),
    attendu(QU([PF({ id: 'P4', manque: [5], attendu: 'reserves', motifAttendu: 'manquant' })]), 'P4-reserve'),
    attendu(QU([PF({ id: 'P2', attendu: 'refuser', motifAttendu: 'produit', etiq: { ref: 'PEL-20', nom: 'X', poids: 'x', lot: 'l' } })]), 'P2-reserve'),
    attendu(QU([PF({ id: 'P5', avarie: { 2: 'N' }, attendu: 'refuser', motifAttendu: 'avarie' })]), 'P5-reserve'),
  ], [
    'P3 AFF-20 : acceptée sous réserve — 2 fûts endommagés (fuite).',
    'P4 AFF-20 : acceptée sous réserve — manque 2 fûts (BL 8, reçu 6).',
    'P4 AFF-20 : acceptée sous réserve — manque 1 fût (BL 8, reçu 7).',
    'P2 AFF-20 : palette REFUSÉE — produit livré PEL-20 au lieu de AFF-20 commandé. 8 fûts repris par le chauffeur.',
    'P5 AFF-20 : palette REFUSÉE — 1 fût endommagé. 8 fûts repris par le chauffeur.',
  ], 'pluriel, singulier, refus');
  // Sans précision déclarée : « écrasé(s) » d'aujourd'hui, accordé.
  egal(attendu(QFUT([P3], { unite: 'fûts' }), 'P3-reserve'), 'P3 AFF-20 : acceptée sous réserve — 1 fût endommagé (écrasé).', 'unité seule : la précision d’aujourd’hui');
  // Comptage, jalon « N fûts », décision et motifs.
  const P4 = PF({ id: 'P4', bl: 7, manque: [7] });
  egal(attendu(QU([P4]), 'P4-comptage'), '7 fûts (BL : 7)', 'le comptage attendu de P4');
  egal(quaiMod.jalonsQuai({ quais: { tf: { palettes: { P4: { compte: 7 } } } } }, QU([P4])).L.find((l) => l.id === 'P4-comptage').fait, '7 fûts', 'le comptage de l’élève : « 7 fûts »');
  egal(attendu(QU([P3]), 'P3-decision'), 'Accepter avec réserves — Fût endommagé', 'la décision attendue porte le nom déclaré');
  egal(quaiMod.libellesMotifs(QU([])), { aucun: 'aucun motif', temperature: 'Température non conforme', avarie: 'Fût endommagé', manquant: 'Manquant', produit: 'Produit différent de la commande' }, 'libellesMotifs');
  egal(quaiMod.libellesMotifs({ unite: 'fûts' }).avarie, 'Fûts endommagés', 'unité seule : « Fûts endommagés »');
  egal(quaiMod.libellesMotifs({ libelles: { manquant: { nom: 'Fût en moins' }, produit: { nom: 'Mauvaise bière' } } }), { aucun: 'aucun motif', temperature: 'Température non conforme', avarie: 'Cartons endommagés', manquant: 'Fût en moins', produit: 'Mauvaise bière' }, 'noms de manquant et de produit');
  egal([quaiMod.libMotifs(['avarie', 'manquant'], QU([])), quaiMod.libMotifs(['avarie'])], ['Fût endommagé + Manquant', 'Cartons endommagés'], 'libMotifs(L, Q) suit le quai, libMotifs(L) reste celui d’aujourd’hui');
  // Une unité invariable ou irrégulière : { un, des }.
  const QCOLIS = QFUT([PF({ id: 'P3', avarie: { 2: 'N' }, attendu: 'reserves', motifAttendu: 'avarie' })], { unite: { un: 'colis', des: 'colis' } });
  egal([attendu(QCOLIS, 'P3-reserve'), attendu(QCOLIS, 'P3-comptage'), quaiMod.libellesMotifs(QCOLIS).avarie], ['P3 AFF-20 : acceptée sous réserve — 1 colis endommagé (écrasé).', '8 colis (BL : 8)', 'Colis endommagés'], 'unité { un, des }');
});

await v('Quai unité : verifierQuai accepte les déclarations justes et refuse chaque faute, avec un message clair ; creerQuai ne s’ouvre pas sur une unité fautive', async () => {
  const bon = (nom, m) => { const E = quaiMod.verifierQuai(QFUT([PF()], Object.assign({ unite: 'fûts' }, m))); if (E.length) throw new Error(`« ${nom} » devrait être accepté : ${E.join(' | ')}`); };
  bon('unité en -s', { unite: 'fûts' });
  bon('unité { un, des }', { unite: { un: 'fût', des: 'fûts' } });
  bon('unité irrégulière', { unite: { un: 'cheval', des: 'chevaux' } });
  bon('libellés complets', { libelles: { avarie: { nom: 'Fût endommagé', precision: 'fuite' }, manquant: { nom: 'Fût manquant' }, produit: { nom: 'Autre bière' } } });
  bon('tous les motifs', { motifs: ['avarie', 'manquant', 'produit', 'temperature', 'aucun'] });
  bon('rien déclaré', {});
  const REFUS = [
    ['unité sans « s »', { unite: 'fût' }, /unite : « fût » ne finit pas par « s »/],
    ['unité vide', { unite: '  ' }, /unite : le texte est vide/],
    ['unité d’une lettre', { unite: 's' }, /ne finit pas par/],
    ['unité : nombre', { unite: 3 }, /unite : un texte au pluriel/],
    ['unité : tableau', { unite: ['fûts'] }, /unite : un texte au pluriel/],
    ['unité : objet sans « un »', { unite: { des: 'fûts' } }, /« un » manque/],
    ['unité : objet sans « des »', { unite: { un: 'fût' } }, /« des » manque/],
    ['unité : objet vide', { unite: {} }, /« un » manque/],
    ['libellé : motif inconnu', { libelles: { temperature: { nom: 'Trop chaud' } } }, /libelles\.temperature : ce motif n’a pas de libellé/],
    ['libellé : motif « aucun »', { libelles: { aucun: { nom: 'Rien' } } }, /libelles\.aucun/],
    ['libellé : clé inconnue', { libelles: { avarie: { couleur: 'rouge' } } }, /libelles\.avarie\.couleur : inconnu/],
    ['libellé : précision sur « manquant »', { libelles: { manquant: { precision: 'x' } } }, /libelles\.manquant\.precision : inconnu/],
    ['libellé : nom vide', { libelles: { avarie: { nom: '' } } }, /libelles\.avarie\.nom : le texte est vide/],
    ['libellé : précision vide', { libelles: { avarie: { precision: '' } } }, /libelles\.avarie\.precision : le texte est vide/],
    ['libellé : texte à la place de l’objet', { libelles: { avarie: 'Fût endommagé' } }, /libelles\.avarie : un objet/],
    ['libelles : tableau', { libelles: [] }, /libelles : un objet/],
    ['motif inconnu', { motifs: ['avarie', 'bidon'] }, /motifs : l’id « bidon » n’existe pas/],
    ['motifs : texte', { motifs: 'avarie' }, /motifs : la liste/],
  ];
  const fautes = [];
  for (const [nom, m, motif] of REFUS) {
    const E = quaiMod.verifierQuai(QFUT([PF()], m));
    if (!E.length) fautes.push(`« ${nom} » n’est pas refusé`);
    else if (!E.some((x) => motif.test(x))) fautes.push(`« ${nom} » : message sans ${motif} (${E.join(' | ')})`);
  }
  if (fautes.length) throw new Error(fautes.join(' ; '));
  // Le refus a lieu au chargement : le quai ne s'ouvre pas.
  const msg = await pg.evaluate(async () => {
    const Q = await import('/core/types/quai.js'), E = await import('/outils/essai-quai-inspection.js');
    const q = E.quaiEssai(); q.unite = 'fût'; q.motifs = ['avarie', 'bidon'];
    try { Q.creerQuai(q); return 'pas d’erreur'; } catch (x) { return x.message; }
  });
  vrai(/essai-inspection/.test(msg) && /ne finit pas par « s »/.test(msg) && /« bidon » n’existe pas/.test(msg), `message : ${msg}`);
});

await v('Quai refus : un motif « produit » à libellé libre (la référence livrée est la commandée) → la ligne dit le libellé, jamais « produit livré X au lieu de X commandé »', async () => {
  const QL = (nom, ps) => QFUT(ps, { libelles: { produit: { nom } } });
  const REFUS_P = (o = {}) => PF({ id: 'P1', attendu: 'refuser', motifAttendu: 'produit', bl: 8, ...o });
  // Libellé de la séance, références égales : « ne se stocke pas ici », en minuscule, puis le reste de la phrase d'avant.
  egal(attendu(QL('Ne se stocke pas ici', [REFUS_P()]), 'P1-reserve'),
    'P1 AFF-20 : palette REFUSÉE — ne se stocke pas ici. 8 cartons repris par le chauffeur.', 'refus à motif libre : la ligne reprend le libellé');
  egal(attendu(QL('Article différent', [REFUS_P()]), 'P1-reserve'),
    'P1 AFF-20 : palette REFUSÉE — article différent. 8 cartons repris par le chauffeur.', 'un autre libellé libre, même règle');
});

await v('Quai refus : un motif « produit » avec deux références différentes → la phrase « produit livré X au lieu de Y commandé » est inchangée (libellé libre ou non)', async () => {
  const QL = (nom, ps) => QFUT(ps, { libelles: { produit: { nom } } });
  const REFUS_P = (o = {}) => PF({ id: 'P1', attendu: 'refuser', motifAttendu: 'produit', bl: 8, ...o });
  const AUTRE = { etiq: { ref: 'PEL-20', nom: 'X', poids: 'x', lot: 'l' } };
  egal([attendu(QL('Ne se stocke pas ici', [REFUS_P(AUTRE)]), 'P1-reserve'), attendu(QFUT([REFUS_P(AUTRE)]), 'P1-reserve')], [
    'P1 AFF-20 : palette REFUSÉE — produit livré PEL-20 au lieu de AFF-20 commandé. 8 cartons repris par le chauffeur.',
    'P1 AFF-20 : palette REFUSÉE — produit livré PEL-20 au lieu de AFF-20 commandé. 8 cartons repris par le chauffeur.',
  ], 'refus « produit » avec deux références différentes : phrase inchangée');
});

await v('Quai unité : les corrigés qui importent MOTIFS (ENT-4.1, 4.2, 4.4, 5.4) et libMotifs fonctionnent comme avant', async () => {
  for (const code of ['ENT-4.1', 'ENT-4.2', 'ENT-4.4', 'ENT-5.4']) {
    const { CORRIGE: c } = await import(pathToFileURL(path.join(ROOT, 'contenus', 'corriges', `${code}.js`)).href);
    vrai(c && Array.isArray(c.items) && c.items.length, `le corrigé ${code} ne se charge pas`);
  }
  const { CORRIGE: c54 } = await import(pathToFileURL(path.join(ROOT, 'contenus', 'corriges', 'ENT-5.4.js')).href);
  const tab = c54.items.find((x) => x.texte === 'Le contrôle de chaque palette');
  egal(tab.reponses.filter((l) => /réserves/.test(l[5])).map((l) => l[5]), ['Accepter avec réserves — Cartons endommagés', 'Accepter avec réserves — Manquant'], 'ENT-5.4 : les décisions et motifs du corrigé');
  // ENT-4.4 : le corrigé de l'élève écrit les décisions avec libMotifs(L) (sans second paramètre).
  const { corrigeEleve } = await import(pathToFileURL(path.join(ROOT, 'contenus', 'corriges', 'ENT-4.4.js')).href);
  const decisions = corrigeEleve({}, 'u-test').items[0].reponses.map((l) => l[6]);
  for (const attendu of ['Accepter avec réserves — Manquant + Cartons endommagés', 'Accepter avec réserves — Cartons endommagés', 'Refuser — Température non conforme', 'Refuser — Produit différent de la commande']) {
    vrai(decisions.includes(attendu), `ENT-4.4 : « ${attendu} » absent du corrigé (${decisions.join(' | ')})`);
  }
});

// Un parcours ②③④ jusqu'au bilan, avec les textes lus à l'écran à chaque étape : `unite` décide si le quai parle de fûts ou de cartons.
const instantane = (p) => p.$eval(HOTE, (h) => ({
  texte: h.innerText,
  aria: [...h.querySelectorAll('[aria-label],[title],[alt]')].map((n) => ['aria-label', 'title', 'alt'].map((a) => n.getAttribute(a)).filter(Boolean).join(' | ')).filter(Boolean).join('\n'),
}));
async function parcoursTextes(p, { nb, autres = [] }) {
  const S = {};
  const prendre = async (nom) => { const x = await instantane(p); S[nom] = x.texte + '\n' + x.aria; };
  await prendre('1-inspection');
  await decharger(p);
  await prendre('1-apres-figeage');
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  await prendre('2-dechargement');
  await p.click(`${HOTE} [data-q="vers3"]`);
  await prendre('3-comptage');
  S.bl = await p.$$eval(`${HOTE} table.quai-bl thead th`, (L) => L.map((n) => n.textContent.trim()));
  await p.click(`${HOTE} [data-q="sel"][data-n="0"]`);
  await p.dispatchEvent(`${HOTE} svg[data-q-palette] [data-q-carton="3"]`, 'click');
  S.zoom = await p.$eval(`${HOTE} [data-q-etiquette] .quai-etiq-l1 span`, (n) => n.textContent.replace(/\s+/g, ' ').trim());
  S.etat = await p.$eval(`${HOTE} [data-q-etat-carton]`, (n) => n.textContent.replace(/\s+/g, ' ').trim());
  S.aria3 = await p.$eval(`${HOTE} svg[data-q-palette]`, (n) => n.getAttribute('aria-label'));
  await prendre('3-zoom');
  await p.fill(`${HOTE} #qCompte`, String(nb)); await p.press(`${HOTE} #qCompte`, 'Enter');
  S.compte = await p.$eval(`${HOTE} [data-q-rcompte]`, (n) => n.textContent.trim());
  await p.click(`${HOTE} #qDec-reserves`);
  await prendre('3-decision');
  S.boutonsMotifs = await p.$$eval(`${HOTE} .quai-choix-motif button`, (L) => L.map((b) => [b.id, b.textContent.trim()]));
  await p.click(`${HOTE} #qMot-avarie`);
  await p.click(`${HOTE} [data-q="valider"]`);
  S.resume = await p.$eval(`${HOTE} [data-q-resume]`, (n) => n.textContent.replace(/\s+/g, ' ').trim());
  for (const [n, compte] of autres) {
    await p.click(`${HOTE} [data-q="sel"][data-n="${n}"]`);
    await p.fill(`${HOTE} #qCompte`, String(compte)); await p.press(`${HOTE} #qCompte`, 'Enter');
    await p.click(`${HOTE} #qDec-accepter`);
    await p.click(`${HOTE} [data-q="valider"]`);
  }
  await prendre('3-valide');
  await p.click(`${HOTE} [data-q="vers4"]`); await p.click(`${HOTE} [data-q="vers4"]`);
  await prendre('4-reserves');
  S.champRes = await p.$eval(`${HOTE} .quai-res-lib`, (n) => n.textContent.trim());
  await p.fill(`${HOTE} #qRes-P1`, '1');
  await p.click(`${HOTE} [data-q="ecrire"]`);
  await prendre('4-ecrites');
  S.lignes = await p.evaluate(() => window.__qs.db.quais['essai-inspection'].lignes.map((l) => l.texte));
  S.journal = await p.evaluate(() => window.__qs.db.quais['essai-inspection'].journal.join(' | '));
  S.jalons = await p.evaluate(async () => {
    const Q = await import('/core/types/quai.js');
    return Object.fromEntries(Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.filter((l) => /^P1-/.test(l.id)).map((l) => [l.id, { fait: l.fait, attendu: l.attendu }]));
  });
  await p.click(`${HOTE} [data-q="signer"]`);
  await p.click(`${HOTE} [data-q="clore"]`);
  await p.waitForSelector(`${HOTE} [data-q-bilan]`);
  await prendre('5-bilan');
  return S;
}

await v('Quai unité : un quai sans unite — le parcours ①→bilan garde les mots d’aujourd’hui (« Cartons » au BL, « Nombre de cartons endommagés », « Carton 3 / 8 »…)', async () => {
  const p = await pageAvec({});
  const S = await parcoursTextes(p, { nb: 8 });
  egal(S.bl.slice(0, 4), ['Palette', 'Réf.', 'Désignation', 'Cartons'], 'la colonne du BL');
  egal(S.zoom, 'Carton 3 / 8', 'le zoom d’un carton');
  vrai(/Ce que tu vois de ce carton depuis ici : intact/.test(S.etat), `ce qu’on voit du carton : ${S.etat}`);
  vrai(/✓ P1 validée : Accepter avec réserves — Cartons endommagés/.test(S.resume), `le résumé de la palette validée : ${S.resume}`);
  egal(S.aria3, 'Palette P1 : clique sur un carton pour lire son étiquette', 'l’étiquette lue par un lecteur d’écran');
  egal(S.compte, 'Comptage noté : 8 cartons (BL : 8).', 'le comptage noté');
  egal(S.boutonsMotifs, [['qMot-avarie', 'Cartons endommagés'], ['qMot-manquant', 'Manquant'], ['qMot-produit', 'Produit différent de la commande']], 'les boutons des motifs');
  egal(S.champRes, 'Nombre de cartons endommagés', 'le champ chiffré de la réserve');
  egal(S.jalons['P1-comptage'], { fait: '8 cartons', attendu: '8 cartons (BL : 8)' }, 'le jalon du comptage');
  egal(S.lignes, ['P1 ESS-CAR : acceptée sous réserve — 1 carton endommagé (écrasé).'], 'la ligne écrite sur le BL');
  egal(S.jalons['P1-decision'].fait, 'Accepter avec réserves — Cartons endommagés', 'la décision de l’élève');
  vrai(/P1 : 8 cartons notés/.test(S.journal), `le journal : ${S.journal}`);
  vrai(/Clique sur un carton de la palette/.test(S['3-comptage']), 'la consigne avant le premier clic sur un carton');
  vrai(/Total : cartons comptés sur cette palette/.test(S['3-comptage']), 'le libellé du total');
  vrai(/Cartons endommagés/.test(S['3-comptage']) && /Cartons manquants/.test(S['3-comptage']), 'les cases de la fiche de contrôle');
  vrai(/Pour compter sans tout compter : combien de cartons dans une couche/.test(S['3-comptage']), 'la consigne de comptage (aides.consignes)');
  await p.close();
});

await v('Quai unité : une palette mixte (plusieurs références) avec une unité déclarée — fiche par référence, colonnes du BL et comptage parlent de colis', async () => {
  const MIXTE = await pg.evaluate(async () => (await import('/contenus/spartoo-reception.js')).PALETTE);
  const p = await pageAvec({ palettes: [MIXTE], extra: { unite: { un: 'colis', des: 'colis' }, libelles: {} } });
  await jusquaEtape2(p);
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.waitForSelector(`${HOTE} .quai-fiche-refs`);
  egal(await p.$$eval(`${HOTE} .quai-fiche-refs thead th`, (L) => L.map((n) => n.textContent.trim())), ['Référence', 'RAS', 'Colis endommagés', 'Colis manquants'], 'la fiche par référence');
  egal(await p.$eval(`${HOTE} [data-q-fr="endo"]`, (n) => n.getAttribute('aria-label')), 'Colis endommagés PM-SUE-RG-39', 'l’étiquette lue par un lecteur d’écran');
  egal(await p.$$eval(`${HOTE} table.quai-bl thead th`, (L) => L.map((n) => n.textContent.trim())), ['Palette', 'Réf.', 'Désignation', 'Colis', 'Par colis'], 'le BL');
  vrai(/Colis comptés, référence par référence/.test(await p.$eval(HOTE, (h) => h.innerText)), 'le libellé du comptage par référence');
  vrai(/Clique sur un colis de la palette/.test(await p.$eval(HOTE, (h) => h.innerText)), 'la consigne avant le premier clic');
  await p.dispatchEvent(`${HOTE} svg[data-q-palette] [data-q-carton="3"]`, 'click');
  egal(await p.$eval(`${HOTE} [data-q-etiquette] .quai-etiq-l1 span`, (n) => n.textContent.replace(/\s+/g, ' ').trim()), 'Colis 3 / 12', 'le zoom d’un colis');
  vrai(/Ce que tu vois de ce colis depuis ici : intact/.test(await p.$eval(`${HOTE} [data-q-etat-carton]`, (n) => n.textContent.replace(/\s+/g, ' '))), 'ce qu’on voit du colis');
  await p.close();
});

await v('Quai unité : la zone de calcul, le rappel, les aides de comptage et le détail d’une palette de cartons parlent de l’unité déclarée (« colis »)', async () => {
  const COLIS = { un: 'colis', des: 'colis' };
  const p = await pageAvec({ extra: { unite: COLIS, calcul: { forme: 'feuille', rappel: true }, aides: { consignes: true, regleCouches: true, repere: true } } });
  await jusquaEtape2(p);
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.waitForSelector(`${HOTE} [data-q-calc]`);
  egal(await p.$$eval(`${HOTE} .quai-calc-lib`, (L) => L.map((n) => n.textContent.trim())), ['Colis dans une couche complète', 'Nombre de couches', 'Colis manquants dans la couche du dessus', 'Total (formule)'], 'les lignes de la feuille');
  const T = await p.$eval(HOTE, (h) => h.innerText.replace(/\s+/g, ' '));
  vrai(T.includes('Rappel : total = colis dans une couche × nombre de couches − manquants.'), `le rappel de la formule : ${(T.match(/.{0,30}Rappel.{0,100}/) || [T.slice(0, 200)])[0]}`);
  vrai(T.includes('Pour compter sans tout compter : combien de colis dans une couche ? combien de couches ? Puis regarde bien la couche du dessus : combien de colis y manquent ?'), 'la consigne du comptage');
  vrai(T.includes('Les colis que tu ne vois pas au cœur sont donc bien là. Le colis marqué P1 te sert de repère'), 'la règle des couches et le repère');
  await p.close();
  const q = await pageAvec({ extra: { unite: COLIS, aides: { detailComptage: true } } });
  await jusquaEtape2(q);
  await q.click(`${HOTE} [data-q="vers3"]`);
  await q.waitForSelector(`${HOTE} .quai-detail`);
  egal(await q.$$eval(`${HOTE} .quai-detail label`, (L) => L.map((n) => n.textContent.trim())), ['Colis dans une couche complète', 'Nombre de couches', 'Colis manquants dans la couche du dessus'], 'le détail du comptage');
  await q.close();
});

await v('Quai unité : un quai en fûts — « Nombre de fûts endommagés », réserve « 1 fût endommagé (fuite) », colonne « Fûts » du BL, jalon « 7 fûts », zoom « Fût 3 / 8 » ; aucun mot « carton » à l’écran', async () => {
  const p = await pageAvec({ palettes: [PALS[2], PALS[3]].map((x, i) => Object.assign({}, x, { id: `P${i + 1}`, avarie: i === 0 ? { 2: 'N' } : {} })) });
  const S = await parcoursTextes(p, { nb: 8, autres: [[1, 7]] });
  egal(S.bl.slice(0, 4), ['Palette', 'Réf.', 'Désignation', 'Fûts'], 'la colonne du BL');
  egal(S.zoom, 'Fût 3 / 8', 'le zoom d’un fût');
  vrai(/Ce que tu vois de ce fût depuis ici : intact/.test(S.etat), `ce qu’on voit du fût : ${S.etat}`);
  vrai(/✓ P1 validée : Accepter avec réserves — Fût endommagé/.test(S.resume), `le résumé de la palette validée : ${S.resume}`);
  egal(S.aria3, 'Palette P1 : clique sur un fût pour lire son étiquette', 'l’étiquette lue par un lecteur d’écran');
  egal(S.compte, 'Comptage noté : 8 fûts (BL : 8).', 'le comptage noté');
  egal(S.boutonsMotifs, [['qMot-avarie', 'Fût endommagé'], ['qMot-manquant', 'Manquant'], ['qMot-produit', 'Produit différent de la commande']], 'les boutons des motifs (le nom déclaré)');
  egal(S.champRes, 'Nombre de fûts endommagés', 'le champ chiffré de la réserve');
  egal(S.jalons['P1-comptage'], { fait: '8 fûts', attendu: '8 fûts (BL : 8)' }, 'le jalon du comptage');
  egal(S.lignes, ['P1 AFF-20 : acceptée sous réserve — 1 fût endommagé (fuite).'], 'la ligne écrite sur le BL');
  egal(S.jalons['P1-reserve'].attendu, 'P1 AFF-20 : acceptée sous réserve — 1 fût endommagé (fuite).', 'la réserve attendue (jalon)');
  egal(S.jalons['P1-decision'].fait, 'Accepter avec réserves — Fût endommagé', 'la décision de l’élève');
  vrai(/P1 : 8 fûts notés/.test(S.journal), `le journal : ${S.journal}`);
  vrai(/Clique sur un fût de la palette/.test(S['3-comptage']), 'la consigne avant le premier clic sur un fût');
  vrai(/Total : fûts comptés sur cette palette/.test(S['3-comptage']), 'le libellé du total');
  vrai(/Fûts endommagés/.test(S['3-comptage']) && /Fûts manquants/.test(S['3-comptage']), 'les cases de la fiche de contrôle');
  vrai(/Compte les fûts de la palette, place par place/.test(S['3-comptage']), 'la consigne de comptage d’une palette de fûts (pas de couches)');
  // Le jalon « 7 fûts » : la palette P4 de la scène d'ENT-6.4, comptée 7.
  const j = await p.evaluate(async () => {
    const Q = await import('/core/types/quai.js');
    window.__qs.db.quais['essai-inspection'].palettes.P2.compte = 7;
    const l = Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.find((x) => x.id === 'P2-comptage');
    return [l.fait, l.attendu];
  });
  egal(j, ['7 fûts', '7 fûts (BL : 7)'], 'le jalon du comptage, 7 fûts comptés');
  // Aucun mot « carton » (ni « Carton ») à l'écran, ni dans ce que lit un lecteur d'écran : texte et aria-label de chaque étape.
  const trouves = Object.entries(S).filter(([k, t]) => typeof t === 'string' && /carton/i.test(t)).map(([k, t]) => `${k} : …${t.match(/.{0,40}carton.{0,40}/i)[0].replace(/\s+/g, ' ')}…`);
  egal(trouves, [], 'le mot « carton » à l’écran d’un quai en fûts');
  await p.close();
});

/* ---- étape 5 : le déchargement au chariot frontal (`dechargement.par: 'cariste'`, `rendu: 'iso'`) */

// Le déclarant de `dechargement` d'un quai d'essai : `par` absent, ou 'chauffeur', ou 'cariste'.
const DECH = (par) => ({ dechargement: Object.assign({ ouverture: 0.5, parPalette: 1 }, par ? { par } : {}) });
// Une page à horloge simulée, la séance d'ENT-6.4 (quatre palettes de fûts), le déchargement lancé : le temps ne passe que par `clock.runFor`.
async function pageDecharge(par) {
  const p = await ctxSM.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  await p.clock.install({ time: 0 });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  await monterAvec(p, { palettes: PALS, extra: DECH(par) });
  await p.waitForSelector(`${HOTE} [data-q="passer1"], ${HOTE} [data-q-inspection]`);
  if (await p.$(`${HOTE} [data-q="passer1"]`)) await p.click(`${HOTE} [data-q="passer1"]`);
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  await decharger(p);
  await p.click(`${HOTE} [data-q="decharger"]`);
  return p;
}
const legende = (p) => p.$eval(`${HOTE} [data-q-leg]`, (n) => n.textContent.trim());
// Les places d'arrivée des quatre palettes de fûts, calculées À LA MAIN (palette 0,95 m, pas de 1,15 m, porte à x = 2,6 + 0,4) : [x, y] du coin avant-gauche.
const PLACES_4 = [[2.525, 3.25], [3.675, 3.25], [2.525, 2.1], [3.675, 2.1]];
const GAB_4 = [[0.95, 0.95], [0.95, 0.95], [0.95, 0.95], [0.95, 0.95]];
// Le plan du chariot de ces quatre palettes (dans le navigateur : le moteur est un module du site).
const planDe = (p, gab, places) => p.evaluate(async ([gab, places]) => {
  const Q = await import('/core/types/quai.js');
  const plan = Q.planChariot({ gab, places, xPorte: 3.0, ySlot: -2.9, t0: 1800 });
  const etats = [];
  for (let t = 0; t <= plan.fin; t += 25) etats.push([t, Q.etatChariot(plan, t)]);
  return { plan, etats, aPose: plan.tPose.map((t) => Q.etatChariot(plan, t)) };
}, [gab, places]);

await v('Quai chariot : avec « cariste », un chariot au gilet jaune décharge ; sans (chauffeur, ou rien de déclaré) : aucun chariot, le transpalette rouge', async () => {
  const lire = (p) => p.$eval(`${HOTE} [data-q-scene2]`, (s) => {
    const gs = [...s.querySelectorAll('[data-iso-chariot]')];
    return { chariots: gs.length, gilet: gs.some((g) => g.innerHTML.includes('#f0c419')), transpalette: s.innerHTML.includes('#d93a2b'), aria: s.getAttribute('aria-label') };
  });
  const c = await pageDecharge('cariste');
  await c.clock.runFor(2500);
  const rc = await lire(c);
  vrai(rc.chariots >= 1, 'aucun chariot dessiné alors que le cariste décharge');
  vrai(rc.gilet, 'le cariste n’a pas son gilet jaune');
  vrai(!rc.transpalette, 'le transpalette du chauffeur est encore dessiné');
  vrai(/au chariot élévateur/.test(rc.aria), `l’aria-label ne dit pas « au chariot élévateur » : ${rc.aria}`);
  vrai(/Le cariste sort la palette P4 au chariot \(1 sur 4\)/.test(await legende(c)), `légende : ${await legende(c)}`);
  await c.close();
  for (const par of ['chauffeur', null]) {
    const p = await pageDecharge(par);
    await p.clock.runFor(2500);
    const r = await lire(p);
    egal(r.chariots, 0, `un chariot est dessiné pour par = ${par}`);
    vrai(r.transpalette, `le transpalette du chauffeur manque pour par = ${par}`);
    vrai(/au transpalette/.test(r.aria) && /Le chauffeur sort la palette P1 au transpalette \(1 sur 4\)/.test(await legende(p)), `textes du chauffeur pour par = ${par} : ${r.aria} / ${await legende(p)}`);
    await p.close();
  }
});

await v('Quai chariot : le plan — les palettes sortent dans l’ordre inverse du chargement, le chariot entre par l’ouverture et ne rencontre jamais une palette posée', async () => {
  const p = await pageEssai();
  const K = 0.85, FL = 1.02 * K, BL = 2.15 * K, DEMI = 0.45;   // le chariot de la scène animation à l’échelle du quai, écrit à la main
  const coupe = (a, b) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6;
  const jeux = {
    'quatre palettes de fûts': [GAB_4, PLACES_4],
    'une palette de cartons': [[[0.8, 1.2]], [[2.6, 2.1]]],
    'deux palettes de cartons': [[[0.8, 1.2], [0.8, 1.2]], [[2.6, 2.1], [3.6, 2.1]]],
    'trois palettes de fûts': [GAB_4.slice(0, 3), PLACES_4.slice(0, 3)],
  };
  for (const [nom, [gab, places]] of Object.entries(jeux)) {
    const { plan, etats, aPose } = await planDe(p, gab, places);
    const N = gab.length;
    egal(plan.ordre, gab.map((_, n) => N - 1 - n), `${nom} : ordre de sortie (la dernière chargée sort la première)`);
    vrai(plan.tPose.every((t, i) => t > plan.tLift[i] && (i === 0 || t > plan.tPose[i - 1])), `${nom} : levée puis pose, palette après palette`);
    let enterDans = 0, dedansHorsPorte = 0, collisions = [];
    for (const [t, s] of etats) {
      const rang = plan.tLift.findIndex((tl, i) => t >= tl && t < plan.tPose[i]);
      const n = rang < 0 ? null : plan.ordre[rang], charge = n == null ? null : gab[n];
      let x0 = s.cx - DEMI, x1 = s.cx + DEMI, y0 = s.yc;
      if (charge) { x0 = Math.min(x0, s.cx - charge[0] / 2); x1 = Math.max(x1, s.cx + charge[0] / 2); y0 = Math.min(y0, s.yc + FL - charge[1]); }
      const emprise = { x0, x1, y0, y1: s.yc + BL };
      if (y0 < -0.01) { enterDans++; if (x0 < 2.4 - 1e-6 || x1 > 3.6 + 1e-6) dedansHorsPorte++; }
      const derniere = plan.tPose.reduce((d, tp, u) => (t >= tp ? u : d), -1);
      plan.ordre.forEach((m, u) => {
        // La palette qu'on vient de poser est encore sur les fourches tant que le chariot ne les a pas sorties : on ne compte alors que son corps.
        const sousLesFourches = u === derniere && s.yc < places[m][1] + gab[m][1] - 1e-6;
        const e = sousLesFourches ? { x0: emprise.x0, x1: emprise.x1, y0: s.yc + FL, y1: emprise.y1 } : emprise;
        if (t >= plan.tPose[u] && coupe(e, { x0: places[m][0], y0: places[m][1], x1: places[m][0] + gab[m][0], y1: places[m][1] + gab[m][1] })) collisions.push(`${t} ms contre la place de la palette ${m + 1}`);
      });
    }
    vrai(enterDans > 20, `${nom} : le chariot entre dans la remorque`);
    egal(dedansHorsPorte, 0, `${nom} : dès qu’une partie du chariot (ou de sa charge) est derrière le mur, elle est dans la largeur de l’ouverture (2,4 à 3,6 m)`);
    egal(collisions.slice(0, 3), [], `${nom} : le chariot (et sa charge) traverse une palette déjà posée`);
    // La palette portée est posée exactement à sa place.
    plan.ordre.forEach((n, u) => {
      const s = aPose[u];
      const [gw, gd] = gab[n];
      vrai(Math.abs(s.cx - gw / 2 - places[n][0]) < 0.01 && Math.abs(s.yc + FL - gd - places[n][1]) < 0.01, `${nom} : la palette ${n + 1} est posée à sa place (chariot en ${s.cx.toFixed(2)} ; ${s.yc.toFixed(2)})`);
    });
  }
  await p.close();
});

await v('Quai chariot : à l’écran, le chariot entre par l’ouverture et il est coupé au mur — la part dans la remorque est dans le clip de l’ouverture, la part devant le mur n’y est pas', async () => {
  const c = await pageDecharge('cariste');
  const quand = await c.evaluate(async () => {
    const Q = await import('/core/types/quai.js'), K = Q.CHARIOT_QUAI.K;
    const plan = Q.planChariot({ gab: [[.95, .95], [.95, .95], [.95, .95], [.95, .95]], places: [[2.525, 3.25], [3.675, 3.25], [2.525, 2.1], [3.675, 2.1]], xPorte: 3.0, ySlot: -2.9, t0: 1800 });
    // `dedansSeul` : le chariot entier derrière le mur (bout des fourches + 2,15 m) ; `coupe` : ses deux roues avant (à 1,36 m du bout des fourches) derrière le mur, les deux arrière devant.
    const dedansSeul = [], coupe = [];
    for (let t = 0; t < plan.fin; t += 20) {
      const s = Q.etatChariot(plan, t);
      if (s.yc + 2.15 * K < -0.1) dedansSeul.push(t);
      if (s.yc + 1.36 * K < -0.08 && s.yc + 1.9 * K > 0.08) coupe.push(t);
    }
    return { dedans: dedansSeul[0], coupe: coupe[0] };
  });
  vrai(quand.dedans != null && quand.coupe != null, 'le plan ne passe ni derrière le mur ni à cheval dessus');
  const lire = () => c.$eval(`${HOTE} [data-q-scene2]`, (s) => {
    const clip = s.querySelector('g[clip-path="url(#quaiIsoOuv)"]');
    const d = [...s.querySelectorAll('[data-iso-chariot="dedans"]')], h = [...s.querySelectorAll('[data-iso-chariot="dehors"]')];
    return { dedans: d.length, dehors: h.length, dedansDansClip: d.every((g) => clip && clip.contains(g)), dehorsHorsClip: h.every((g) => !(clip && clip.contains(g))),
      rouesDedans: d.reduce((n, g) => n + g.querySelectorAll('circle[transform^="matrix("]').length, 0), rouesDehors: h.reduce((n, g) => n + g.querySelectorAll('circle[transform^="matrix("]').length, 0) };
  });
  // En entrant, à cheval sur le mur : deux parts, chacune avec ses deux roues, et le total des roues reste celui d'un seul chariot.
  await c.clock.runFor(quand.coupe);
  const B = await lire();
  egal([B.dedans, B.dehors], [1, 1], 'à cheval sur le mur : une part de chaque côté');
  vrai(B.dedansDansClip && B.dehorsHorsClip, 'la part dedans doit être dans le clip de l’ouverture, la part dehors hors du clip');
  egal([B.rouesDedans, B.rouesDehors], [14, 14], 'à cheval sur le mur : deux roues derrière, deux devant (aucune roue dessinée deux fois)');
  // Tout entier dans la remorque : seulement la part « dedans », dans le clip, avec ses quatre roues.
  await c.clock.runFor(quand.dedans - quand.coupe);
  const A = await lire();
  egal([A.dedans, A.dehors], [1, 0], 'dans la remorque : la part dedans seule');
  vrai(A.dedansDansClip, 'la part dedans n’est pas dans le clip de l’ouverture');
  egal(A.rouesDedans, 28, 'dans la remorque : les quatre roues rondes (7 cercles chacune)');
  await c.close();
});

await v('Quai chariot : le chauffeur du camion reste debout près de l’accueil, il ne décharge pas ; les quatre palettes sortent dans l’ordre P4, P3, P2, P1 (légende et journal)', async () => {
  const c = await pageDecharge('cariste');
  const chauffeur = () => c.$$eval(`${HOTE} [data-q-scene2] ellipse[fill="rgba(0,0,0,.2)"]`, (L) => L.map((e) => [+e.getAttribute('cx'), +e.getAttribute('cy')]));
  await c.clock.runFor(2500);
  const t1 = await chauffeur();
  const legs = [await legende(c)];
  for (const dt of [3460, 3850, 4620, 5000]) { await c.clock.runFor(dt); legs.push(await legende(c)); }
  const t2 = await chauffeur();
  egal(t1.length, 1, 'une seule personne dessinée (le chauffeur ; le cariste est dans le chariot)');
  egal(t2, t1, 'le chauffeur n’a pas bougé');
  egal(await c.$eval(`${HOTE} [data-q-scene2]`, (s) => s.innerHTML.includes('#d93a2b')), false, 'aucun transpalette');
  const ids = legs.map((l) => (l.match(/palette (P\d)/) || [])[1]);
  vrai(ids[0] === 'P4', `la première palette sortie n’est pas P4 : ${legs[0]}`);
  vrai(ids.every((id, k) => k === 0 || ids[k - 1] >= id), `les palettes ne sortent pas dans l’ordre P4, P3, P2, P1 : ${ids}`);
  await c.clock.runFor(40000);
  const fin = await c.evaluate(() => ({ journal: window.__qs.db.quais['essai-inspection'].journal.slice(), leg: document.querySelector('#qiScene [data-q-leg]').textContent.trim(), vers3: !document.querySelector('#qiScene [data-q="vers3"]').disabled }));
  const rang = (id) => fin.journal.findIndex((l) => l.includes(`${id} posée sur le quai`));
  vrai([rang('P1'), rang('P2'), rang('P3'), rang('P4')].every((r) => r >= 0), `une palette n’est pas dans le journal : ${fin.journal.join(' | ')}`);
  vrai(rang('P1') < rang('P2') && rang('P2') < rang('P3') && rang('P3') < rang('P4'), `le journal (le plus récent en premier) ne dit pas P4, P3, P2, P1 : ${fin.journal.join(' | ')}`);
  vrai(/Les 4 palettes sont en zone de réception\. Le chauffeur attend ta signature\./.test(fin.leg), `légende de fin : ${fin.leg}`);
  vrai(fin.vers3, 'le déchargement fini, « Compter la palette » doit s’ouvrir');
  await c.close();
});

await v('Quai chariot : mouvement réduit — l’état final tout de suite : quatre palettes en place, le chariot garé devant le mur (quatre roues rondes), le chauffeur debout ; mêmes places qu’avec le chauffeur', async () => {
  const lireFin = async (extra) => {
    const p = await pageAvec({ palettes: PALS, extra });
    await jusquaEtape2(p);
    const r = await p.$eval(`${HOTE} [data-q-scene2]`, (s) => {
      const C = Object.fromEntries([...s.querySelectorAll('[data-iso-pal]')].map((g) => { const b = g.getBBox(); return [g.dataset.isoPal, [+(b.x + b.width / 2).toFixed(1), +(b.y + b.height / 2).toFixed(1)]]; }));
      const ch = [...s.querySelectorAll('[data-iso-chariot]')];
      return { C, chariots: ch.map((g) => g.dataset.isoChariot), roues: ch.reduce((n, g) => n + g.querySelectorAll('circle[transform^="matrix("]').length, 0),
        personnes: s.querySelectorAll('ellipse[fill="rgba(0,0,0,.2)"]').length, leg: s.parentElement.querySelector('[data-q-leg]').textContent.trim() };
    });
    await p.close();
    return r;
  };
  const car = await lireFin(DECH('cariste')), chauf = await lireFin(DECH('chauffeur'));
  egal(Object.keys(car.C).sort(), ['P1', 'P2', 'P3', 'P4'], 'les quatre palettes sont posées');
  for (const id of ['P1', 'P2', 'P3', 'P4']) vrai(Math.abs(car.C[id][0] - chauf.C[id][0]) < 0.6 && Math.abs(car.C[id][1] - chauf.C[id][1]) < 0.6, `${id} : au chariot ${car.C[id]}, au transpalette ${chauf.C[id]} : pas la même place`);
  egal(car.chariots, ['dehors'], 'le chariot est garé devant le mur, entier (une seule part)');
  egal(car.roues, 28, 'quatre roues rondes de sept cercles');
  egal(car.personnes, 1, 'le chauffeur est debout');
  egal(chauf.chariots, [], 'avec le chauffeur : pas de chariot');
  vrai(/Les 4 palettes sont en zone de réception\. Le chauffeur attend ta signature\./.test(car.leg), `légende : ${car.leg}`);
});

/* ---- chantier « quai en deux séances », lot 1 : `arret: 'dechargement'`, `commence: 'controle'`, `document` (brief ENT-8.7 §7.1, 17/10/2026) */
// Un quai à un camion et CINQ palettes (les quatre fûts d'ENT-6.4 et une cinquième, copie de P1), un cariste, sans froid ni inspection. Les valeurs
// attendues sont écrites à la main. Sans ces trois options, rien ne change : la référence de l'étape 0 et les cas des étapes 2 à 5 le prouvent.

const PALS5 = PALS.concat([Object.assign(JSON.parse(JSON.stringify(PALS[0])), { id: 'P5' })]);
const ID_Q = 'essai-inspection';
const GESTE_FIN = `quai:${ID_Q}:dechargement`;
const TEXTE_FIN = 'Les 5 palettes sont en zone de réception. Le contrôle, c’est la prochaine fois.';
const DEUX = (extra = {}) => Object.assign({ securite: null }, DECH('cariste'), extra);
// Monte la séance d'essai sur le quai `extra`, sur une base reprise (`db` : celle d'un élève qui revient, copiée) ; `volet` : un message déclenché par
// `quaiDecharge` + `apresGeste` (la preuve que la séance s'ouvre avec le nouveau geste, et que le message arrive).
const monterDeux = (p, extra, db, volet = false) => p.evaluate(async ([extra, db0, palettes, volet]) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-quai-inspection.js');
  const D = await import('/core/declencheurs.js');
  document.querySelector('#qiScene')?.remove();
  const hote = document.createElement('div'); hote.id = 'qiScene'; document.body.prepend(hote);
  const Q = Object.assign(E.quaiEssai({ palettes }), extra);
  const db = db0 ? JSON.parse(JSON.stringify(db0)) : {};
  window.__qs = { db, Q, enregistres: [] };
  const U = E.universQuai(Q);
  if (volet) {
    U.volet = { id: 'essai-volet', semer: () => ({ mails: [] }), declencheurs: [{ id: 'suite',
      quand: D.tous(D.quaiDecharge(Q.id), D.apresGeste(`quai:${Q.id}:dechargement`)),
      semer: (prenom) => ({ mails: [{ folder: 'in', ts: Date.now(), from: 'Samia', fromMail: 'samia@essai.example', to: prenom, subject: 'La suite', kind: 'text', text: 'Les palettes sont au sol.' }] }) }] };
  }
  const meta = { id: 'essai-inspection', code: 'ESSAI', titre: 'Essai de l’inspection', portee: 'eleve', immersif: true, temps: 'guidage', bareme: 20 };
  const ctx = {
    meta, profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__qs.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  };
  creerEntreprise(U).rendre(hote, ctx);
  document.querySelector('#qiScene .ent-nav[data-vue="quai"]').click();
}, [extra, db, PALS5, volet]);
// `c` : le contexte (mouvement réduit par défaut) ; `horloge` : une horloge simulée (le temps ne passe que par `clock.runFor`).
async function pageDeux(extra, { c = ctxS, horloge = false, db = null, volet = false } = {}) {
  const p = await c.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  if (horloge) await p.clock.install({ time: 0 });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  await monterDeux(p, extra, db, volet);
  await p.waitForSelector(`${HOTE} .quai-stepper`);
  // Avec le mouvement normal, l'arrivée du camion dure 5,2 s : « Passer l'animation ».
  if (await p.locator(`${HOTE} [data-q="passer1"]`).isVisible()) await p.click(`${HOTE} [data-q="passer1"]`);
  return p;
}
const etapesAff = (p) => p.$$eval(`${HOTE} [data-q="etape"]`, (L) => L.map((b) => +b.dataset.n));
const baseDe = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__qs.db)));
const BANDEAU = `${HOTE} [data-q-fin-decharge]`;
const boutonsVus = (p) => p.$$eval(`${HOTE} [data-quai] button`, (L) => L.filter((b) => b.offsetParent !== null).map((b) => b.textContent.trim().replace(/\s+/g, ' ')));
// Les palettes P1 à P5 contrôlées comme dans le cas des quatre fûts : comptage 8, 8, 8, 7, 8 ; réserves de P2 (produit) et de P3 (avarie).
async function controlerCinq(p) {
  const valide = async (n, compte, decision, motif) => {
    await p.click(`${HOTE} [data-q="sel"][data-n="${n}"]`);
    await p.fill(`${HOTE} #qCompte`, String(compte)); await p.press(`${HOTE} #qCompte`, 'Enter');
    await p.click(`${HOTE} #qDec-${decision}`);
    if (motif) await p.click(`${HOTE} #qMot-${motif}`);
    await p.click(`${HOTE} [data-q="valider"]`);
  };
  await valide(0, 8, 'accepter'); await valide(1, 8, 'reserves', 'produit'); await valide(2, 8, 'reserves', 'avarie'); await valide(3, 7, 'accepter'); await valide(4, 8, 'accepter');
  await p.click(`${HOTE} [data-q="vers4"]`); await p.click(`${HOTE} [data-q="vers4"]`);
  await p.fill(`${HOTE} #qRes-P2`, 'PEL-20'); await p.fill(`${HOTE} #qRes-P3`, '1');
}

await v('Quai arrêt : à la dernière palette, le quai se fige — stepper ① ②, bandeau du contenu, aucun bouton Valider / Clore / Recommencer / Compter, le geste « dechargement » part une fois', async () => {
  const p = await pageDeux(DEUX({ arret: { etape: 'dechargement', texte: TEXTE_FIN } }));
  egal(await etapesAff(p), [1, 2], 'avant le déchargement : le stepper ne propose que ① et ②');
  egal(await p.locator(BANDEAU).count(), 0, 'pas de bandeau avant la fin');
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(BANDEAU);
  egal(await p.$eval(BANDEAU, (n) => n.textContent.trim()), TEXTE_FIN, 'le bandeau dit le texte du contenu');
  egal(await etapesAff(p), [1, 2], 'à la fin, ① et ② restent, rien ne vient après');
  egal(await p.$$eval(`${HOTE} [data-q="etape"]`, (L) => L.map((b) => b.textContent.trim())), ['① Le camion arrive', '② Déchargement'], 'les libellés du stepper');
  // Ce qui part : aucun bouton de contrôle ni de clôture. Ce qui reste : le stepper et « Revoir le déchargement ».
  for (const q of ['vers3', 'vers4', 'valider', 'clore', 'recommencer', 'rentrer', 'ecrire', 'signer']) egal(await p.locator(`${HOTE} [data-q="${q}"]`).count(), 0, `le bouton data-q="${q}" existe encore`);
  const B = await boutonsVus(p);
  egal(B.filter((t) => /Valider|Clore|Recommencer|Compter|Contrôler|Rendre/.test(t)), [], `boutons de contrôle visibles : ${B}`);
  egal(B, ['① Le camion arrive', '② Déchargement', '↺ Revoir le déchargement'], 'les seuls boutons visibles');
  // L'image de fin : cinq palettes au sol, le chariot garé, le chauffeur debout, et une légende qui n'attend aucune signature.
  const fin = await p.$eval(`${HOTE} [data-q-scene2]`, (s) => ({ pal: new Set([...s.querySelectorAll('[data-iso-pal]')].map((g) => g.dataset.isoPal)).size, chariots: [...s.querySelectorAll('[data-iso-chariot]')].map((g) => g.dataset.isoChariot),
    chauffeurs: s.querySelectorAll('ellipse[fill="rgba(0,0,0,.2)"]').length, leg: s.parentElement.querySelector('[data-q-leg]').textContent.trim() }));
  egal([fin.pal, fin.chariots, fin.chauffeurs], [5, ['dehors'], 1], 'cinq palettes, le chariot garé, le chauffeur debout');
  vrai(/Les 5 palettes sont en zone de réception\.$/.test(fin.leg), `légende de fin : ${fin.leg}`);
  // L'état : figé, drapeau posé, le déchargement complet (une ligne d'ouverture et cinq poses).
  const b1 = await baseDe(p), e1 = b1.quais[ID_Q];
  egal([e1.fini, e1.dechargeFini, e1.etape, e1.evts, e1.journal.length], [true, true, 2, 6, 6], 'état : fini, drapeau, étape ②, cinq poses comptées');
  egal(Object.keys(b1.gestes[ID_Q]).filter((g) => g === GESTE_FIN), [GESTE_FIN], 'le geste de fin du déchargement est rangé');
  // La consigne du quai ne parle plus de compter ni de signer (cette séance-là s'arrête au déchargement).
  egal(await p.$eval(`${HOTE} .quai-aide`, (n) => n.textContent.trim()), 'Sur une plateforme, c’est un cariste qui décharge, au chariot élévateur.', 'la consigne du quai');
  // Figé : le chrono réel ne court plus, et un clic de plus ne change rien.
  await p.waitForTimeout(2300);
  await p.click(`${HOTE} [data-q="revoir"]`);
  await p.click(`${HOTE} [data-q-scene2]`);
  egal((await baseDe(p)).quais[ID_Q], e1, 'plus rien ne bouge dans l’état (ni le chrono, ni un clic)');
  // Le déclencheur : vrai à la fin, faux avant (base vide, quai sans drapeau), et `tous` garde la liste des quais.
  const D = await p.evaluate(async () => {
    const T = await import('/core/declencheurs.js'), f = T.quaiDecharge('essai-inspection');
    return { fin: f(window.__qs.db, 'essai-inspection'), vide: f({}, 'x'), sansDrapeau: f({ quais: { 'essai-inspection': { fini: true, evts: 6 } } }, 'x'), autre: T.quaiDecharge('autre')(window.__qs.db, 'x'),
      quais: f.quais, tous: T.tous(f, T.apresGeste('a')).quais };
  });
  egal(D, { fin: true, vide: false, sansDrapeau: false, autre: false, quais: ['essai-inspection'], tous: ['essai-inspection'] }, 'quaiDecharge');
  // Recharger la page (la base reprise) : le geste ne repart pas, même après des redessins.
  const copie = await baseDe(p);
  delete copie.gestes[ID_Q][GESTE_FIN];
  await monterDeux(p, DEUX({ arret: { etape: 'dechargement', texte: TEXTE_FIN } }), copie);
  await p.waitForSelector(BANDEAU);
  await p.click(`${HOTE} [data-q="etape"][data-n="1"]`); await p.click(`${HOTE} [data-q="etape"][data-n="2"]`);
  const b2 = await baseDe(p);
  egal(Object.keys(b2.gestes[ID_Q]).filter((g) => g === GESTE_FIN), [], 'rechargé : le geste n’est pas renvoyé (le drapeau est dans l’état)');
  egal(b2.quais[ID_Q].dechargeFini, true, 'le drapeau est toujours posé');
  await p.close();
});

await v('Quai arrêt : avec le mouvement normal — rien avant la dernière palette ; l’animation jusqu’au bout, « Passer l’animation » et la page rechargée en plein déchargement mènent au même état', async () => {
  const extra = DEUX({ arret: 'dechargement' });
  const lire = async (p) => { const b = await baseDe(p), e = b.quais[ID_Q];
    return { fini: e.fini, drapeau: e.dechargeFini, etape: e.etape, evts: e.evts, minute: e.minute, journal: e.journal, geste: Object.keys(b.gestes[ID_Q]).includes(GESTE_FIN) }; };
  // a) l'animation jusqu'au bout
  const a = await pageDeux(extra, { c: ctxSM, horloge: true });
  await a.click(`${HOTE} [data-q="decharger"]`);
  const copieDepart = await baseDe(a);   // l'état rangé au clic : porte ouverte, zéro palette posée (ce que la base garde si la page se recharge)
  await a.clock.runFor(2500);
  egal(await a.locator(BANDEAU).count(), 0, 'au milieu du déchargement : pas de bandeau');
  const milieu = await lire(a);
  egal([milieu.fini, !!milieu.drapeau, milieu.geste], [false, false, false], 'au milieu du déchargement : ni figé, ni geste');
  await a.clock.runFor(60000);
  await a.waitForSelector(BANDEAU);
  egal(await a.$eval(BANDEAU, (n) => n.textContent.trim()), 'Les palettes sont en zone de réception.', 'sans texte déclaré : le texte par défaut');
  const A = await lire(a);
  egal([A.fini, A.drapeau, A.etape, A.evts, A.journal.length, A.geste], [true, true, 2, 6, 6, true], 'fin de l’animation');
  await a.close();
  // b) « Passer l'animation »
  const b = await pageDeux(extra, { c: ctxSM, horloge: true });
  await b.click(`${HOTE} [data-q="decharger"]`);
  await b.clock.runFor(2500);
  await b.click(`${HOTE} [data-q="passer"]`);
  await b.waitForSelector(BANDEAU);
  const B = await lire(b);
  await b.close();
  // c) la page rechargée en plein déchargement (la base du clic, sans l'animation)
  const c = await pageDeux(extra, { c: ctxSM, horloge: true, db: copieDepart });
  await c.waitForSelector(BANDEAU);
  const C = await lire(c);
  await c.close();
  egal(B, A, '« Passer l’animation » : le même état que l’animation jusqu’au bout');
  egal(C, A, 'page rechargée en plein déchargement : le même état');
});

await v('Quai arrêt : mouvement réduit — l’état final tout de suite, le bandeau et le geste', async () => {
  const p = await pageDeux(DEUX({ arret: 'dechargement' }), { c: ctxS });
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(BANDEAU);
  const b = await baseDe(p), e = b.quais[ID_Q];
  egal([e.fini, e.dechargeFini, e.evts, Object.keys(b.gestes[ID_Q]).includes(GESTE_FIN)], [true, true, 6, true], 'mouvement réduit');
  await p.close();
});

await v('Quai arrêt : le message déclenché par quaiDecharge + le geste arrive à la fin (la séance s’ouvre : le geste est connu) ; sans arret, le même geste est inconnu', async () => {
  const p = await pageDeux(DEUX({ arret: 'dechargement' }), { volet: true });
  const avant = await baseDe(p);
  egal((avant.mails || []).filter((m) => m.subject === 'La suite').length, 0, 'le message n’arrive pas avant la fin');
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(BANDEAU);
  const apres = await baseDe(p);
  egal((apres.mails || []).filter((m) => m.subject === 'La suite').length, 1, 'le message arrive une fois, à la fin du déchargement');
  egal(typeof apres.volets['essai-volet#suite'], 'number', 'la marque du déclencheur est rangée');
  // Sans `arret`, le geste n'est pas publié : la séance qui le cite ne s'ouvre pas (les séances existantes gardent la liste d'avant).
  const refus = await p.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-quai-inspection.js'), D = await import('/core/declencheurs.js');
    const Q = E.quaiEssai({}); Q.securite = null;
    const U = E.universQuai(Q);
    U.volet = { id: 'v', semer: () => ({ mails: [] }), declencheurs: [{ id: 's', quand: D.apresGeste(`quai:${Q.id}:dechargement`), semer: () => ({ mails: [] }) }] };
    try { creerEntreprise(U); return 'ouverte'; } catch (x) { return x.message; }
  });
  vrai(/geste inconnu « quai:essai-inspection:dechargement »/.test(refus), `sans arret, le geste devrait être inconnu : ${refus}`);
  const signaux = await p.evaluate(async () => {
    const Q = await import('/core/types/quai.js'), E = await import('/outils/essai-quai-inspection.js');
    const sig = (extra) => Q.creerQuai(Object.assign(E.quaiEssai({}), { securite: null }, extra)).signaux;
    return { sans: sig({}), avec: sig({ arret: 'dechargement' }) };
  });
  egal(signaux.sans, ['quai:essai-inspection:decharger', 'quai:essai-inspection:valider', 'quai:essai-inspection:cloturer'], 'sans arret : la liste des gestes d’avant, inchangée');
  egal(signaux.avec, ['quai:essai-inspection:decharger', 'quai:essai-inspection:valider', 'quai:essai-inspection:cloturer', GESTE_FIN], 'avec arret : un geste de plus');
  await p.close();
});

await v('Quai arrêt : une base qui sort de ses étapes (étape ④ rangée) revient à ② ; un quai sans option garde ses quatre étapes', async () => {
  const p = await pageDeux(DEUX({ arret: 'dechargement' }));
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(BANDEAU);
  const copie = await baseDe(p);
  copie.quais[ID_Q].etape = 4;
  await monterDeux(p, DEUX({ arret: 'dechargement' }), copie);
  await p.waitForSelector(`${HOTE} [data-q-scene2]`);
  egal([await p.locator(`${HOTE} [data-q-cf]`).count(), await p.locator(BANDEAU).count()], [0, 1], 'étape ④ rangée : l’écran de ② s’affiche, pas celui de ④');
  // Sans option : ① ② ③ ④, et « Compter la palette » (aucun bandeau).
  await monterDeux(p, DEUX({}));
  await p.waitForSelector(`${HOTE} [data-q="decharger"]`);
  egal(await etapesAff(p), [1, 2, 3, 4], 'sans option : les quatre étapes');
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  egal(await p.locator(BANDEAU).count(), 0, 'sans option : pas de bandeau de fin');
  vrai(/Le chauffeur attend ta signature\.$/.test(await legende(p)), `sans option : la légende d’aujourd’hui — ${await legende(p)}`);
  egal(await p.$eval(`${HOTE} .quai-aide`, (n) => n.textContent.trim()), 'Sur une plateforme, c’est un cariste qui décharge, au chariot élévateur. Toi, tu ne signes rien tant que tu n’as pas compté.', 'sans option : la consigne d’aujourd’hui');
  const e = (await baseDe(p)).quais[ID_Q];
  egal([e.fini, e.dechargeFini], [false, undefined], 'sans option : rien n’est figé');
  await p.close();
});

await v('Quai commence : la vue s’ouvre à ③ — déchargement déjà fait (journal vide, aucune minute), stepper ③ ④, palettes en zone et chauffeur debout à ④', async () => {
  const p = await pageDeux(DEUX({ commence: 'controle', debut: '06:50' }));
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  egal(await etapesAff(p), [3, 4], 'le stepper ne propose que ③ et ④');
  egal(await p.$$eval(`${HOTE} [data-q="etape"]`, (L) => L.map((b) => b.textContent.trim())), ['③ Compter la palette', '④ Réserves et signature'], 'libellés');
  egal(await p.$eval(`${HOTE} [data-q-heure]`, (n) => n.textContent.trim()), '06:50', 'l’horloge du quai est l’heure de `debut` : aucune minute ajoutée');
  const e = (await baseDe(p)).quais[ID_Q];
  egal([e.etape, e.minute, e.journal, e.decharge, e.ouvertA, e.evts, e.fini, e.signe], [3, 0, [], true, 0, 6, false, false], 'état de départ construit par etatNeuf');
  for (const q of ['decharger', 'revoir', 'passer', 'vers3']) egal(await p.locator(`${HOTE} [data-q="${q}"]`).count(), 0, `aucun bouton data-q="${q}" (le déchargement est déjà fait)`);
  vrai(await p.locator(`${HOTE} .quai-rappel-bl`).count() === 1, 'le BL est en main (« Revoir le bon de livraison »)');
  // ④ : les cinq palettes en zone de réception, le chariot garé, le chauffeur debout et qui attend.
  await p.click(`${HOTE} [data-q="etape"][data-n="4"]`);
  const z = await p.$eval(`${HOTE} [data-q-cf]`, (s) => ({ pal: new Set([...s.querySelectorAll('[data-iso-pal]')].map((g) => g.dataset.isoPal)).size, chariots: [...s.querySelectorAll('[data-iso-chariot]')].map((g) => g.dataset.isoChariot),
    chauffeurs: s.querySelectorAll('ellipse[fill="rgba(0,0,0,.2)"]').length, note: s.closest('.quai-doc').querySelector('[data-q-etatcf]').textContent.trim() }));
  egal([z.pal, z.chariots, z.chauffeurs], [5, ['dehors'], 1], '④ : cinq palettes au sol, le chariot garé, le chauffeur debout');
  vrai(/Le chauffeur attend ta signature\.$/.test(z.note), `④ : ${z.note}`);
  egal((await baseDe(p)).quais[ID_Q].journal, [], 'ouvrir ④ n’écrit rien au journal');
  await p.close();
});

await v('Quai commence : compter, décider, réserves, signer, clore — jalons sans ordre ni sécurité ; « Recommencer » revient à ③', async () => {
  const p = await pageDeux(DEUX({ commence: 'controle' }));
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  await controlerCinq(p);
  await p.click(`${HOTE} [data-q="ecrire"]`);
  await p.click(`${HOTE} [data-q="signer"]`);
  await p.click(`${HOTE} [data-q="clore"]`);
  await p.waitForSelector(`${HOTE} [data-q-bilan]`);
  const J = await p.evaluate(async () => { const Q = await import('/core/types/quai.js'); return Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.map((l) => [l.id, l.ok]); });
  egal(J.map(([id]) => id), ['P1-comptage', 'P1-decision', 'P2-comptage', 'P2-decision', 'P3-comptage', 'P3-decision', 'P4-comptage', 'P4-decision', 'P5-comptage', 'P5-decision',
    'P2-reserve', 'P3-reserve', 'deballage', 'signature', 'rentre'], 'les jalons : seulement ceux de ③ et ④');
  egal(J.filter(([, ok]) => !ok), [], 'tous les jalons sont justes');
  egal(await p.$$eval(`${HOTE} [data-q-bilan] tr[data-jalon]`, (L) => L.length), 15, 'le bilan de la vue liste ces 15 jalons, rien pour ① ②');
  const e = (await baseDe(p)).quais[ID_Q];
  egal([e.fini, e.signe, e.rentre, e.dechargeFini], [true, true, true, undefined], 'clos, signé, palettes en zone ; pas de drapeau de fin de déchargement');
  // « Recommencer la réception » : un quai neuf, qui repart du contrôle.
  await p.click(`${HOTE} [data-q="recommencer"]`); await p.click(`${HOTE} [data-q="recommencer"]`);
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  const r = (await baseDe(p)).quais[ID_Q];
  egal([r.etape, r.journal, r.minute, r.fini, r.evts], [3, [], 0, false, 6], 'recommencé : ③, journal vide');
  await p.close();
});

await v('Quai commence : une base rangée avant (étape ① ou ②) s’ouvre quand même à ③', async () => {
  const p = await pageDeux(DEUX({ commence: 'controle' }));
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  const copie = await baseDe(p);
  copie.quais[ID_Q].etape = 1;
  await monterDeux(p, DEUX({ commence: 'controle' }), copie);
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  egal(await etapesAff(p), [3, 4], 'étape ① rangée : ③ s’affiche');
  await p.close();
});

await v('Quai commence et arrêt : les jalons ne portent que les étapes jouées (écrits à la main) ; un quai sans option garde tous les siens', async () => {
  const Q0 = () => QC([PC({ id: 'P1' }), PC({ id: 'P2', ref: 'REF-2', avarie: AV(1), attendu: 'reserves', motifAttendu: 'avarie' })], { rendu: 'iso', froid: false, securite: SEC5() });
  const ids = (Q) => quaiMod.jalonsQuai({}, Q).L.map((l) => l.id);
  const SECU = ['securite-cabine', 'securite-niveleur', 'securite-aucun-faux'];
  egal(ids(Q0()), SECU.concat(['P1-comptage', 'P1-decision', 'P2-comptage', 'P2-decision', 'P2-reserve', 'deballage', 'signature', 'rentre']), 'sans option : sécurité, palettes, déballage, signature, rentrée');
  egal(ids(Object.assign(Q0(), { arret: 'dechargement' })), SECU, 'arret : la sécurité (étape jouée), ni comptage, ni décision, ni réserve, ni déballage, ni signature, ni rentrée');
  egal(ids(Object.assign(Q0(), { arret: { etape: 'dechargement', texte: 'Fini.' } })), SECU, 'arret en objet : pareil');
  const J = (Q) => quaiMod.jalonsQuai({}, Q);
  egal([J(Object.assign(Q0(), { arret: 'dechargement' })).max, J(Q0()).max], [3, 11], 'le nombre de jalons comptés suit');
  egal(quaiMod.etapesQuai(Object.assign(Q0(), { arret: 'dechargement' })).map((x) => x.id), SECU, 'etapesQuai : une étape du suivi par jalon joué');
  // `arret` avec froid : le ticket de l'enregistreur (étape ①) reste un jalon.
  const froid = Object.assign(QC([PC({ id: 'P1' })], { arret: 'dechargement' }));
  egal(ids(froid), ['ticket'], 'arret avec froid : le ticket (étape ①) reste, rien de ③ ④');
  // `commence` : ni ordre, ni sécurité, ni ticket, même si le contenu les déclare (verifierQuai le refuse, mais les jalons ne s'y fient pas).
  const sansOrdre = { ordre: { premier: 0, juste: 'x', phrases: [{ v: 'x', lib: 'x' }] } };
  const deux = QC([PC({ id: 'P1' })], Object.assign({ securite: SEC5(), rendu: 'iso' }, sansOrdre));
  deux.camions.push({ nom: 'Deuxième', arrivee: '06:10', fournisseur: 'G', palettes: [PC({ id: 'P2' })] });
  egal(ids(deux).filter((id) => id === 'ordre' || /^securite-/.test(id) || /^ticket/.test(id)).length > 0, true, 'contrôle du montage : sans commence, le contenu a bien un ordre, une sécurité et des tickets');
  egal(ids(Object.assign(deux, { commence: 'controle' })).filter((id) => id === 'ordre' || /^securite-/.test(id) || /^ticket/.test(id)), [], 'commence : ni ordre, ni sécurité, ni ticket');
  vrai(ids(Object.assign(Q0(), { commence: 'controle', securite: null })).includes('rentre'), 'commence : le reste (signature, rentrée…) est inchangé');
});

await v('Quai deux séances : verifierQuai refuse les combinaisons et les valeurs inconnues, avec un message clair ; creerQuai lève l’erreur', async () => {
  const bon = (m = {}) => QC([PC({ id: 'P1' })], Object.assign({ rendu: 'iso', froid: false }, m));
  egal(quaiMod.verifierQuai(bon({ arret: 'dechargement' })), [], 'arret: \'dechargement\'');
  egal(quaiMod.verifierQuai(bon({ arret: { etape: 'dechargement', texte: 'Fini.' } })), [], 'arret en objet');
  egal(quaiMod.verifierQuai(bon({ arret: { etape: 'dechargement' } })), [], 'arret en objet sans texte');
  egal(quaiMod.verifierQuai(bon({ commence: 'controle' })), [], 'commence: \'controle\'');
  egal(quaiMod.verifierQuai(bon({ document: 'Bon de livraison — lettre de voiture' })), [], 'document');
  egal(quaiMod.verifierQuai(bon({ arret: 'dechargement', securite: SEC5() })), [], 'arret avec une inspection : permis');
  const REFUS_DS = [
    ['commence avec securite', { commence: 'controle', securite: SEC5() }, /commence.*securite/],
    ['commence avec arret', { commence: 'controle', arret: 'dechargement' }, /arret et commence/],
    ['arret avec mode controle', { arret: 'dechargement', mode: 'controle' }, /arret avec mode: 'controle'/],
    ['commence avec mode controle', { commence: 'controle', mode: 'controle' }, /commence avec mode: 'controle'/],
    ['arret inconnu (texte)', { arret: 'tout' }, /arret : « tout » n’existe pas/],
    ['arret inconnu (objet)', { arret: { etape: 'controle' } }, /arret : cette valeur n’existe pas/],
    ['arret: true', { arret: true }, /arret : cette valeur n’existe pas/],
    ['arret avec une clé inconnue', { arret: { etape: 'dechargement', titre: 'x' } }, /arret\.titre : inconnu/],
    ['arret avec un texte vide', { arret: { etape: 'dechargement', texte: '  ' } }, /arret\.texte : le texte du bandeau de fin est vide/],
    ['commence inconnu', { commence: 'reserves' }, /commence : « reserves » n’existe pas/],
    ['commence: true', { commence: true }, /commence : « true » n’existe pas/],
    ['document vide', { document: '  ' }, /document : le nom du document de transport est vide/],
    ['commence avec froid', { commence: 'controle', froid: undefined }, /commence.*sans froid/],
    ['arret avec deux camions', { arret: 'dechargement', camions: [{ nom: 'A', palettes: [PC({ id: 'P1' })] }, { nom: 'B', palettes: [PC({ id: 'P2' })] }] }, /arret demande un seul camion/],
    ['commence avec deux camions', { commence: 'controle', camions: [{ nom: 'A', palettes: [PC({ id: 'P1' })] }, { nom: 'B', palettes: [PC({ id: 'P2' })] }] }, /commence demande un seul camion/],
  ];
  const fautes = [];
  for (const [nom, mute, motif] of REFUS_DS) {
    const Q = bon(mute);
    if (nom === 'commence avec froid') delete Q.froid;
    const E = quaiMod.verifierQuai(Q);
    if (!E.length) fautes.push(`« ${nom} » n’est pas refusé`);
    else if (!E.some((m) => motif.test(m))) fautes.push(`« ${nom} » : message sans ${motif} (${E.join(' | ')})`);
  }
  if (fautes.length) throw new Error(fautes.join(' ; '));
  // Le moteur lève l'erreur au chargement : la séance ne s'ouvre pas.
  let levee = '';
  try { quaiMod.creerQuai(bon({ commence: 'controle', arret: 'dechargement' })); } catch (x) { levee = x.message; }
  vrai(/arret et commence/.test(levee), `creerQuai devrait lever l’erreur : ${levee}`);
});

await v('Quai document : le titre de ④ (et de ①) porte le nom déclaré ; sans `document`, « Bon de livraison » comme avant — le rappel de ③ dit « le document » seulement quand un nom est déclaré', async () => {
  const lire = async (extra) => {
    const p = await pageDeux(DEUX(Object.assign({ commence: 'controle' }, extra)));
    await p.waitForSelector(`${HOTE} [data-q-palette]`);
    const rappel = await p.$eval(`${HOTE} .quai-rappel-bl summary`, (n) => n.textContent.trim());
    await p.click(`${HOTE} [data-q="etape"][data-n="4"]`);
    const titre = await p.$eval(`${HOTE} .quai-papier .quai-doc-titre`, (n) => n.textContent.trim());
    await p.close();
    return { rappel, titre };
  };
  egal(await lire({}), { rappel: '📄 Revoir le bon de livraison', titre: '📄 Bon de livraison n° BL-ESSAI-01 — exemplaire du destinataire' }, 'sans document : les mots d’aujourd’hui');
  egal(await lire({ document: 'Bon de livraison — lettre de voiture' }), { rappel: '📄 Revoir le document', titre: '📄 Bon de livraison — lettre de voiture n° BL-ESSAI-01 — exemplaire du destinataire' }, 'avec document');
  // ① (arrivée du camion, quai iso) : le même nom.
  const p = await pageDeux(DEUX({ arret: 'dechargement', document: 'Lettre de voiture' }));
  await p.waitForSelector(`${HOTE} [data-q-apres-arrivee] .quai-doc-titre`);
  egal(await p.$eval(`${HOTE} [data-q-apres-arrivee] .quai-doc-titre`, (n) => n.textContent.trim()), '📄 Lettre de voiture n° BL-ESSAI-01 — Brasserie d’essai', '① porte le nom déclaré');
  await p.close();
  const q = await pageDeux(DEUX({ arret: 'dechargement' }));
  await q.waitForSelector(`${HOTE} [data-q-apres-arrivee] .quai-doc-titre`);
  egal(await q.$eval(`${HOTE} [data-q-apres-arrivee] .quai-doc-titre`, (n) => n.textContent.trim()), '📄 Bon de livraison n° BL-ESSAI-01 — Brasserie d’essai', '① sans document : comme avant');
  await q.close();
});

/* ---- Quai : l'article du document (`document.article`) et le chauffeur collègue (`camions[i].tutoiement`, `camions[i].prenomChauffeur`) — demande d'ENT-10.5, 19/10/2026.
   Sans ces trois clés, les textes d'avant (« le bon de livraison », « vous pouvez »). Valeurs attendues écrites à la main. */
const CAM_ART = (opt = {}) => ({ transporteur: 'Transporteur d’essai', fournisseur: 'Brasserie d’essai', bl: 'BL-ESSAI-01', arrivee: '07:30', palettes: PALS5, ...opt });
// Lit l'arrivée (①, quai iso arrêté au déchargement) : la légende, le bouton, la réplique par défaut du chauffeur (étiquette de la scène).
async function lireArrivee(extra, camion) {
  const p = await pageDeux(DEUX(Object.assign({ arret: 'dechargement', camions: [CAM_ART(camion)] }, extra)));
  await p.waitForSelector(`${HOTE} [data-q-apres-arrivee] .quai-doc-titre`);
  const r = {
    leg: (await legende(p)).replace(/^\d\d:\d\d — /, ''),
    bouton: await p.$eval(`${HOTE} [data-q="decharger"]`, (n) => n.textContent.trim().replace(/\s+/g, ' ')),
    parole: await p.$eval(`${HOTE} [data-q-arrivee]`, (n) => n.getAttribute('aria-label')),
  };
  await p.close();
  return r;
}

await v('Quai article : `document.article` (« la », « l’ ») met au féminin la légende d’arrivée et « Voilà ma… » ; sans article, ou en texte seul, les phrases d’aujourd’hui', async () => {
  const doc = (nom, article) => ({ document: Object.assign({ nom, court: 'FR' }, article ? { article } : {}) });
  const la = await lireArrivee(doc('Feuille de ramasse', 'la'));
  egal(la.leg, 'Le chauffeur te remet la feuille de ramasse.', 'article la : légende');
  vrai(la.parole.endsWith('Voilà ma feuille de ramasse. »'), `article la : réplique par défaut « ${la.parole} »`);
  const l = await lireArrivee(doc('Annonce de ramasse', 'l’'));
  egal(l.leg, 'Le chauffeur te remet l’annonce de ramasse.', 'article l’ : légende, sans espace');
  vrai(l.parole.endsWith('Voilà mon annonce de ramasse. »'), `article l’ : « mon » devant une voyelle (« ${l.parole} »)`);
  const defaut = await lireArrivee(doc('Bon de collecte'));
  egal(defaut.leg, 'Le chauffeur te remet le bon de collecte.', 'objet sans article : « le »');
  vrai(defaut.parole.endsWith('Voilà mon bon de collecte. »'), `objet sans article : « ${defaut.parole} »`);
  const explicite = await lireArrivee(doc('Bon de collecte', 'le'));
  egal(explicite, defaut, 'article: \'le\' dit la même chose que pas d’article');
  // Document en texte seul, ou absent : le texte d'aujourd'hui, inchangé.
  const texte = await lireArrivee({ document: 'Lettre de voiture' });
  egal(texte.leg, 'Le chauffeur te remet le bon de livraison.', 'document en texte seul : comme avant');
  const rien = await lireArrivee({});
  egal(rien.leg, 'Le chauffeur te remet le bon de livraison.', 'sans document : comme avant');
  vrai(rien.parole.endsWith('Voilà mon bon de livraison. »'), `sans document : « ${rien.parole} »`);
  // À l'étape ④ : « sur la FR » avec l'article « la » ; « sur le BL » sans.
  const sur = async (extra) => {
    const p = await pageDeux(DEUX(Object.assign({ commence: 'controle', camions: [CAM_ART()] }, extra)));
    await p.waitForSelector(`${HOTE} [data-q-palette]`);
    await p.click(`${HOTE} [data-q="etape"][data-n="4"]`);
    const t = await p.$eval(`${HOTE} .quai-h2`, (n) => n.textContent.trim().replace(/\s+/g, ' '));
    await p.close();
    return t;
  };
  vrai(/Écrire les réserves sur la FR, faire signer le chauffeur/.test(await sur(doc('Feuille de ramasse', 'la'))), 'titre de ④ : « sur la FR »');
  vrai(/Écrire les réserves sur le BL, faire signer le chauffeur/.test(await sur({})), 'titre de ④ sans document : « sur le BL »');
});

await v('Quai article : verifierQuai refuse un article inconnu (« les », vide, nom hérité d’un objet) et une clé inconnue de `document` ; accepte le, la, l’ ; creerQuai lève l’erreur', async () => {
  const bon = (m = {}) => QC([PC({ id: 'P1' })], Object.assign({ rendu: 'iso', froid: false }, m));
  for (const a of ['le', 'la', 'l’']) egal(quaiMod.verifierQuai(bon({ document: { nom: 'Feuille', court: 'FR', article: a } })), [], `article ${a}`);
  for (const a of ['les', '', 'LA', 'constructor', 3, null]) {
    const E = quaiMod.verifierQuai(bon({ document: { nom: 'Feuille', court: 'FR', article: a } }));
    vrai(E.some((m) => /document\.article : .*n’existe pas \(les seules valeurs sont 'le', 'la' et 'l’'\)/.test(m)), `article ${JSON.stringify(a)} devrait être refusé (${E.join(' | ')})`);
  }
  const inconnue = quaiMod.verifierQuai(bon({ document: { nom: 'Feuille', court: 'FR', genre: 'f' } }));
  vrai(inconnue.some((m) => /document\.genre : inconnu \(nom, court, article\)/.test(m)), `clé inconnue (${inconnue.join(' | ')})`);
  let levee = '';
  try { quaiMod.creerQuai(bon({ document: { nom: 'Feuille', court: 'FR', article: 'les' } })); } catch (x) { levee = x.message; }
  vrai(/document\.article/.test(levee), `creerQuai devrait lever l’erreur : ${levee}`);
});

await v('Quai chauffeur collègue : `tutoiement: true` met le bouton et les répliques du chauffeur au « tu », `prenomChauffeur` remplace « Le chauffeur » ; sans les clés, « vous » comme avant', async () => {
  const tu = await lireArrivee({}, { tutoiement: true, prenomChauffeur: 'Loïc' });
  egal(tu.bouton, '« Oui, tu peux décharger »', 'tutoiement : le bouton');
  egal(tu.leg, 'Loïc te remet le bon de livraison.', 'prénom : la légende d’arrivée');
  const seul = await lireArrivee({}, { tutoiement: true });
  egal(seul.bouton, '« Oui, tu peux décharger »', 'tutoiement seul : le bouton');
  egal(seul.leg, 'Le chauffeur te remet le bon de livraison.', 'tutoiement seul : « Le chauffeur » reste');
  const prenomSeul = await lireArrivee({}, { prenomChauffeur: 'Loïc' });
  egal(prenomSeul.bouton, '« Oui, vous pouvez décharger »', 'prénom seul : on vouvoie encore');
  const sans = await lireArrivee({});
  egal(sans.bouton, '« Oui, vous pouvez décharger »', 'sans option : « vous »');
  egal(sans.leg, 'Le chauffeur te remet le bon de livraison.', 'sans option : « Le chauffeur »');
  // À l'étape ④ : la réplique d'attente du chauffeur.
  const quatre = async (camion) => {
    const p = await pageDeux(DEUX({ commence: 'controle', camions: [CAM_ART(camion)] }));
    await p.waitForSelector(`${HOTE} [data-q-palette]`);
    await p.click(`${HOTE} [data-q="etape"][data-n="4"]`);
    const parole = await p.$eval(`${HOTE} [data-q-parole]`, (n) => n.textContent.trim().replace(/\s+/g, ' '));
    await p.close();
    return parole;
  };
  egal(await quatre({ tutoiement: true, prenomChauffeur: 'Loïc' }), 'Loïc : « J’attends tes papiers pour signer. Mes autres clients m’attendent aussi. »', '④ au tu, avec le prénom');
  egal(await quatre({}), 'Le chauffeur : « J’attends vos papiers pour signer. Mes autres clients m’attendent aussi. »', '④ sans option : comme avant');
});

await v('Quai chauffeur collègue : verifierQuai refuse un tutoiement qui n’est pas true et un prénom vide ; accepte les deux ; creerQuai lève l’erreur', async () => {
  const bon = (c = {}) => QC([PC({ id: 'P1' })], { rendu: 'iso', froid: false, camions: [Object.assign({ nom: 'A', palettes: [PC({ id: 'P1' })] }, c)] });
  egal(quaiMod.verifierQuai(bon({ tutoiement: true, prenomChauffeur: 'Loïc' })), [], 'les deux clés justes');
  egal(quaiMod.verifierQuai(bon({})), [], 'aucune clé');
  for (const t of [false, 'oui', 1, null]) {
    const E = quaiMod.verifierQuai(bon({ tutoiement: t }));
    vrai(E.some((m) => /camions\[0\]\.tutoiement : ne prend que la valeur true/.test(m)), `tutoiement ${JSON.stringify(t)} devrait être refusé (${E.join(' | ')})`);
  }
  for (const n of ['', '  ', 3, null]) {
    const E = quaiMod.verifierQuai(bon({ prenomChauffeur: n }));
    vrai(E.some((m) => /camions\[0\]\.prenomChauffeur : le prénom est vide/.test(m)), `prenomChauffeur ${JSON.stringify(n)} devrait être refusé (${E.join(' | ')})`);
  }
  // ENT-8.10 range déjà `chauffeur: 'Thomas'` dans son camion : cette clé-là n'est ni lue ni refusée.
  egal(quaiMod.verifierQuai(bon({ chauffeur: 'Thomas' })), [], 'la clé `chauffeur` d’ENT-8.10 reste libre');
  let levee = '';
  try { quaiMod.creerQuai(bon({ tutoiement: 'oui' })); } catch (x) { levee = x.message; }
  vrai(/camions\[0\]\.tutoiement/.test(levee), `creerQuai devrait lever l’erreur : ${levee}`);
});

await v('Quai chariot : cinq palettes (ENT-8.7) — le chariot ne touche aucune palette posée, les cinq bacs tiennent dans la zone de réception, la légende et les pastilles suivent', async () => {
  // Les places d'arrivée de cinq palettes de fûts (deux colonnes, trois rangs), écrites à la main comme PLACES_4 : y = 2,1 + (2 − rang) × 1,15.
  const gab = [0, 1, 2, 3, 4].map(() => [0.95, 0.95]);
  const places = [[2.525, 4.4], [3.675, 4.4], [2.525, 3.25], [3.675, 3.25], [2.525, 2.1]];
  const pe5 = await pageEssai();
  const K = 0.85, FL = 1.02 * K, BL = 2.15 * K, DEMI = 0.45;
  const coupe = (a, b) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6;
  const { plan, etats, aPose } = await planDe(pe5, gab, places);
  await pe5.close();
  egal(plan.ordre, [4, 3, 2, 1, 0], 'la dernière chargée sort la première');
  let collisions = [], hors = 0;
  for (const [t, s] of etats) {
    const rang = plan.tLift.findIndex((tl, i) => t >= tl && t < plan.tPose[i]);
    const n = rang < 0 ? null : plan.ordre[rang], charge = n == null ? null : gab[n];
    let x0 = s.cx - DEMI, x1 = s.cx + DEMI, y0 = s.yc;
    if (charge) { x0 = Math.min(x0, s.cx - charge[0] / 2); x1 = Math.max(x1, s.cx + charge[0] / 2); y0 = Math.min(y0, s.yc + FL - charge[1]); }
    const emprise = { x0, x1, y0, y1: s.yc + BL };
    if (y0 < -0.01 && (x0 < 2.4 - 1e-6 || x1 > 3.6 + 1e-6)) hors++;
    const derniere = plan.tPose.reduce((d, tp, u) => (t >= tp ? u : d), -1);
    plan.ordre.forEach((m, u) => {
      const sousLesFourches = u === derniere && s.yc < places[m][1] + gab[m][1] - 1e-6;
      const e = sousLesFourches ? { x0: emprise.x0, x1: emprise.x1, y0: s.yc + FL, y1: emprise.y1 } : emprise;
      if (t >= plan.tPose[u] && coupe(e, { x0: places[m][0], y0: places[m][1], x1: places[m][0] + gab[m][0], y1: places[m][1] + gab[m][1] })) collisions.push(`${t} ms contre la place de la palette ${m + 1}`);
    });
  }
  egal(hors, 0, 'dès qu’une partie du chariot est derrière le mur, elle est dans la largeur de l’ouverture');
  egal(collisions.slice(0, 3), [], 'le chariot (et sa charge) traverse une palette déjà posée');
  plan.ordre.forEach((n, u) => {
    const s = aPose[u];
    vrai(Math.abs(s.cx - gab[n][0] / 2 - places[n][0]) < 0.01 && Math.abs(s.yc + FL - gab[n][1] - places[n][1]) < 0.01, `la palette ${n + 1} est posée à sa place (chariot en ${s.cx.toFixed(2)} ; ${s.yc.toFixed(2)})`);
  });
  // À l'écran (② sans option) : le cadre, les cinq bacs dans la zone calculée, cinq pastilles, la légende d'aujourd'hui.
  const p = await pageDeux(DEUX({}));
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  const r = await p.$eval(`${HOTE} [data-q-scene2]`, (s) => {
    const zone = s.querySelector('[data-iso-zone]').getBBox(), bacs = [...s.querySelectorAll('polygon[fill="#3d4245"]')].map((n) => n.getBBox());
    return { vb: s.getAttribute('viewBox'), bacs: bacs.length, hors: bacs.filter((b) => b.x < zone.x - 1 || b.x + b.width > zone.x + zone.width + 1 || b.y + b.height > zone.y + zone.height + 1).length };
  });
  egal(r, { vb: '290 0 640 540', bacs: 5, hors: 0 }, 'cinq bacs de rétention dans la zone de réception, cadre agrandi');
  egal(await p.$$eval(`${HOTE} [data-q-past] i.sur`, (L) => L.length), 5, 'les cinq pastilles sont « sur le quai »');
  vrai(/Les 5 palettes sont en zone de réception\. Le chauffeur attend ta signature\.$/.test(await legende(p)), `légende : ${await legende(p)}`);
  await p.close();
});

/* ---- chantier « dépose dirigée par l'élève » (moteur E-5, lot 2, étape C, 17/10/2026) : `depose` — l'élève clique la case où le cariste pose chaque palette */
// Cadrage : `docs/briefs/MOTEUR-depose-dirigee.md` ; la fiche : `activites/FICHE-SEANCE.md`, « La dépose dirigée par l'élève ». Un quai à quatre palettes de
// fûts (celles d'ENT-6.4, qui sortent dans l'ordre P4, P3, P2, P1), un cariste, la variante A de Tristan. Tout ce qui est attendu ci-dessous est écrit à la main.
// Sans `depose`, rien ne change : la référence de l'étape 0, les cas « quai arrêt » du lot 1 et le dernier cas de cette partie le montrent.

const DEP_A = () => ({ passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'R1' }, { id: 'R2' }, { id: 'R3' }, { id: 'R4' },
  { id: 'quai3-1', sol: 'autre-quai', legende: 'Quai 3', peinte: false, nom: 'Devant le quai 3' }] });
const DEP = (extra = {}) => DEUX(Object.assign({ depose: DEP_A() }, extra));
const GESTE_DEP = `quai:${ID_Q}:depose`;
const SORTIE = ['P4', 'P3', 'P2', 'P1'];
const TEXTE_DEP = 'Les 4 palettes sont posées. Le contrôle, c’est la prochaine fois.';
// Monte la séance sur le quai `extra` (les quatre palettes de fûts), sur une base reprise ; `copie` : une évaluation.
const monterDep = (p, extra, db, copie = false) => p.evaluate(async ([extra, db0, palettes, copie]) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-quai-inspection.js');
  document.querySelector('#qiScene')?.remove();
  const hote = document.createElement('div'); hote.id = 'qiScene'; document.body.prepend(hote);
  const Q = Object.assign(E.quaiEssai({ palettes }), extra);
  const db = db0 ? JSON.parse(JSON.stringify(db0)) : {};
  window.__qs = { db, Q, enregistres: [] };
  const meta = Object.assign({ id: 'essai-inspection', code: 'ESSAI', titre: 'Essai de la dépose', portee: 'eleve', immersif: true, temps: 'guidage', bareme: 20 }, copie ? { copie: true, temps: 'evaluation' } : {});
  const ctx = {
    meta, profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__qs.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  };
  creerEntreprise(E.universQuai(Q, { copie })).rendre(hote, ctx);
  document.querySelector('#qiScene .ent-nav[data-vue="quai"]').click();
}, [extra, db, PALS, copie]);
async function pageDep(extra, { c = ctxS, horloge = false, db = null, copie = false } = {}) {
  const p = await c.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  if (horloge) await p.clock.install({ time: 0 });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  await monterDep(p, extra, db, copie);
  await p.waitForSelector(`${HOTE} .quai-stepper`);
  if (await p.locator(`${HOTE} [data-q="passer1"]`).isVisible()) await p.click(`${HOTE} [data-q="passer1"]`);
  return p;
}
const PHASE = `${HOTE} [data-q-phase]`;
const phaseDe = (p) => p.$eval(PHASE, (n) => n.dataset.qPhase);
const gesteDe = (p) => p.$eval(PHASE, (n) => n.dataset.qGeste || null);
const caseSel = (id) => `${HOTE} [data-q="depose"][data-c="${id}"]`;
const nbCases = (p) => p.locator(`${HOTE} [data-q="depose"]`).count();
const posees = (p) => p.$$eval(`${HOTE} [data-iso-posee]`, (L) => Object.fromEntries(L.map((g) => [g.dataset.isoPosee, g.dataset.isoCase]).sort()));   // clés triées : P1 à P4
// La palette que le cariste tient à la pause, lue dans la légende (« … attend avec la palette P4 (…) »).
const enAttente = async (p) => (/attend avec la palette (P\d)/.exec(await legende(p)) || [])[1] || null;
const eDep = async (p) => (await baseDe(p)).quais[ID_Q];
const departDep = async (p) => { await p.click(`${HOTE} [data-q="decharger"]`); await p.waitForSelector(`${HOTE} [data-q-phase="choix"]`); };
const jalonsDep = (p) => p.evaluate(async () => {
  const Q = await import('/core/types/quai.js');
  return Object.fromEntries(Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.filter((l) => /^depose-/.test(l.id)).map((l) => [l.id, l.ok]));
});
// Un clic sur la case `id`, puis on attend que la palette soit à l'écran (mouvement réduit : tout de suite).
async function poserEn(p, id) {
  const n = Object.keys(await posees(p)).length;
  await p.click(caseSel(id));
  await p.waitForFunction(([s, n]) => document.querySelectorAll(s).length === n + 1, [`${HOTE} [data-iso-posee]`, n]);
}
// Mouvement normal sous horloge simulée : le temps ne passe que par `clock.runFor`, jusqu'à la pause « choix ».
async function jusquaPause(p) { for (let i = 0; i < 80 && (await phaseDe(p)) !== 'choix'; i++) await p.clock.runFor(500); }
const lireAnnonce = async (p) => {
  await p.waitForFunction((s) => document.querySelector(s).textContent.trim() !== '', `${HOTE} [data-q-annonce]`);
  return p.$eval(`${HOTE} [data-q-annonce]`, (n) => n.textContent.trim());
};

await v('Dépose : verifierQuai refuse ce qui n’a pas de sens (chaque garde nommée) et accepte la variante A, avec `arret` ou `commence`', async () => {
  const base = () => QC([PC({ id: 'P1' }), PC({ id: 'P2' }), PC({ id: 'P3' }), PC({ id: 'P4' })], { rendu: 'iso', froid: false, dechargement: { par: 'cariste' }, depose: DEP_A() });
  egal(quaiMod.verifierQuai(base()), [], 'la variante A (quatre palettes, quatre cases justes) est acceptée');
  egal(quaiMod.verifierQuai(Object.assign(base(), { arret: 'dechargement' })), [], 'depose avec arret : permis');
  egal(quaiMod.verifierQuai(Object.assign(base(), { commence: 'controle' })), [], 'depose avec commence : permis');
  const REFUS = [
    ['sans rendu iso', (Q) => { delete Q.rendu; }, /depose demande .rendu: 'iso'/],
    ['dechargement par le chauffeur', (Q) => { Q.dechargement = { par: 'chauffeur' }; }, /depose demande .dechargement: \{ par: 'cariste' \}/],
    ['cinq palettes pour quatre cases justes', (Q) => { Q.camions[0].palettes.push(PC({ id: 'P5' })); }, /5 palettes et 4 cases justes : il faut au moins une case juste par palette/],
    ['neuf cases', (Q) => { Q.depose.cases.push({ id: 'R5' }, { id: 'R6' }, { id: 'R7' }); }, /depose\.cases : 9 cases, 8 au plus/],
    ['clé inconnue (consigne)', (Q) => { Q.depose.consigne = 'Clique.'; }, /depose : clé « consigne » inconnue/],
    ['case autre-quai qui touche le passage', (Q) => { Q.depose.cases[2] = { id: 'R2', sol: 'autre-quai', legende: 'Quai 3' }; }, /depose\.cases\[2\].*ne touche pas le passage/],
    ['case autre-quai sans légende', (Q) => { Q.depose.cases[5] = { id: 'quai3-1', sol: 'autre-quai' }; }, /« quai3-1 »\) : une case « autre-quai » demande sa légende/],
    ['juste: true avec un sol', (Q) => { Q.depose.cases[0].juste = true; }, /« allee-1 »\) : juste: true sur une case « pieton »/],
    ['case fausse sans sol ni réaction', (Q) => { Q.depose.cases[1] = { id: 'R1', juste: false }; }, /« R1 »\) : une case fausse sans sol demande sa réaction/],
    ['peinte: false sans sol', (Q) => { Q.depose.cases[1] = { id: 'R1', peinte: false }; }, /« R1 »\) : peinte: false sur une case sans sol/],
    ['grise inconnu', (Q) => { Q.depose.grise = 'toujours'; }, /depose\.grise : « toujours » inconnu/],
    ['froid absent', (Q) => { delete Q.froid; }, /depose demande un quai sans froid/],
  ];
  const fautes = [];
  for (const [nom, mute, motif] of REFUS) {
    const Q = base(); mute(Q);
    const E = quaiMod.verifierQuai(Q);
    if (!E.length) fautes.push(`« ${nom} » n’est pas refusé`);
    else if (!E.some((m) => motif.test(m))) fautes.push(`« ${nom} » : message sans ${motif} (${E.join(' | ')})`);
  }
  if (fautes.length) throw new Error(fautes.join(' ; '));
  // Le moteur lève l'erreur au chargement : la séance ne s'ouvre pas.
  let levee = '';
  try { const Q = base(); Q.depose.consigne = 'x'; quaiMod.creerQuai(Q); } catch (x) { levee = x.message; }
  vrai(/clé « consigne » inconnue/.test(levee), `creerQuai devrait lever l’erreur : ${levee}`);
});

await v('Dépose : géométrie de la variante A (hors navigateur) — six cases sur une ligne, trois de chaque côté de la porte, aucun heurt ; jalons à vide : quatre, tous faux', async () => {
  const cases = quaiMod.normaliserCases(DEP_A());
  const geo = quaiMod.geometrieDepose(cases, 3);
  egal(geo.cases.map((g) => g.id), ['allee-1', 'R1', 'R2', 'R3', 'R4', 'quai3-1'], 'six cases, de gauche à droite');
  egal(new Set(geo.cases.map((g) => g.y0)).size, 1, 'une seule ligne (même y0)');
  geo.cases.forEach((g, i) => {
    if (i < 3) vrai(g.x1 <= 2.4 + 1e-9, `${g.id} : à gauche de la porte (x1 ${g.x1})`);
    else vrai(g.x0 >= 3.6 - 1e-9, `${g.id} : à droite de la porte (x0 ${g.x0})`);
  });
  vrai(geo.cases.every((g, i) => i === 0 || g.x0 > geo.cases[i - 1].x0), 'les cases vont de gauche à droite');
  geo.cases.forEach((g) => egal(quaiMod.heurtsPose(geo, g), [], `heurts du chariot en posant dans ${g.id}`));
  const J = quaiMod.jalonsDepose({ depose: {} }, cases, ['P1', 'P2', 'P3', 'P4']);
  egal(J.map((l) => [l.id, l.ok]), [['depose-P1', false], ['depose-P2', false], ['depose-P3', false], ['depose-P4', false]], 'jalonsDepose à vide : quatre jalons, tous faux');
  // Par jalonsQuai : présents dès la base vide, faux, et regroupés au bandeau de fin.
  const Q = QC([PC({ id: 'P1' }), PC({ id: 'P2' }), PC({ id: 'P3' }), PC({ id: 'P4' })], { rendu: 'iso', froid: false, dechargement: { par: 'cariste' }, depose: DEP_A() });
  const D = quaiMod.jalonsQuai({}, Q).L.filter((l) => /^depose-/.test(l.id));
  egal(D.map((l) => [l.id, l.ok]), [['depose-P1', false], ['depose-P2', false], ['depose-P3', false], ['depose-P4', false]], 'jalonsQuai({}, Q) : les jalons existent, tous faux');
  vrai(D.every((l) => !/allee|quai3|R[1-4]/.test(l.lib)), `un libellé de jalon dit la bonne case : ${D.map((l) => l.lib)}`);
  egal(quaiMod.etapesQuai(Q).filter((x) => /^depose-/.test(x.id)).map((x) => x.groupe), Array(4).fill('Diriger le déchargement'), 'etapesQuai : le groupe du suivi');
});

await v('Dépose : parcours juste en mouvement réduit — quatre poses (P4, P3, P2, P1), état complet, journal, gestes depose et dechargement rangés une fois, jalons 4 sur 4', async () => {
  const p = await pageDep(DEP({ arret: { etape: 'dechargement', texte: TEXTE_DEP } }));
  egal(await etapesAff(p), [1, 2], 'avant le déchargement : ① et ②');
  await departDep(p);
  egal(await gesteDe(p), null, 'à la pause : pas de geste en cours');
  const choix = { P4: 'R3', P3: 'R1', P2: 'R4', P1: 'R2' };   // un ordre quelconque des quatre cases justes
  let ts1;
  for (const [i, pal] of SORTIE.entries()) {
    egal(await enAttente(p), pal, `pause ${i + 1} : la palette attendue`);
    egal(Object.keys(await posees(p)).length, i, `pause ${i + 1} : palettes déjà posées`);
    await poserEn(p, choix[pal]);
    if (i === 0) {
      const g = (await baseDe(p)).gestes[ID_Q];
      ts1 = g[GESTE_DEP];
      vrai(typeof ts1 === 'number', `le geste depose part à la première palette posée : ${JSON.stringify(g)}`);
      vrai(!(GESTE_FIN in g), 'le geste de fin ne part pas à la première palette');
    }
    if (i === 2) egal(await jalonsDep(p), { 'depose-P1': false, 'depose-P2': false, 'depose-P3': false, 'depose-P4': false }, 'tant que la dernière n’est pas posée : tous faux');
    await p.waitForTimeout(30);   // pour que l'horodatage d'un geste rangé deux fois changerait
  }
  await p.waitForSelector(BANDEAU);
  egal(await p.$eval(BANDEAU, (n) => n.textContent.trim()), TEXTE_DEP, 'le bandeau de fin (arret)');
  egal(await posees(p), { P1: 'R2', P2: 'R4', P3: 'R1', P4: 'R3' }, 'quatre palettes dans les cases cliquées');
  const b = await baseDe(p), e = b.quais[ID_Q];
  egal(e.depose, { P4: { premier: 'R3', essais: ['R3'], pose: 'R3' }, P3: { premier: 'R1', essais: ['R1'], pose: 'R1' }, P2: { premier: 'R4', essais: ['R4'], pose: 'R4' }, P1: { premier: 'R2', essais: ['R2'], pose: 'R2' } }, 'e.depose complet, premier = pose');
  egal(e.journal.length, 5, 'journal : l’ouverture et quatre poses');
  [/P1 posée en R2 \(\+1 min\)/, /P2 posée en R4/, /P3 posée en R1/, /P4 posée en R3/, /porte du quai ouverte/].forEach((re, i) => vrai(re.test(e.journal[i]), `journal[${i}] : ${e.journal[i]}`));
  egal([e.fini, e.dechargeFini, e.evts], [true, true, 5], 'état : figé, drapeau, ouverture + quatre poses comptées');
  vrai(GESTE_DEP in b.gestes[ID_Q] && GESTE_FIN in b.gestes[ID_Q], `gestes rangés : ${Object.keys(b.gestes[ID_Q])}`);
  egal(b.gestes[ID_Q][GESTE_DEP], ts1, 'le geste depose n’est horodaté qu’une fois');
  egal(await jalonsDep(p), { 'depose-P1': true, 'depose-P2': true, 'depose-P3': true, 'depose-P4': true }, 'jalons : quatre sur quatre');
  // Page rechargée avec la même base : rien ne repart, le même horodatage.
  await monterDep(p, DEP({ arret: { etape: 'dechargement', texte: TEXTE_DEP } }), b);
  await p.waitForSelector(BANDEAU);
  const b2 = await baseDe(p);
  egal(b2.gestes[ID_Q][GESTE_DEP], ts1, 'rechargé : le geste depose garde son horodatage');
  egal(b2.quais[ID_Q].depose, e.depose, 'rechargé : le même état');
  egal(await posees(p), { P1: 'R2', P2: 'R4', P3: 'R1', P4: 'R3' }, 'rechargé : les palettes sont dans leurs cases');
  await p.close();
});

await v('Dépose : l’inaction — « Décharger » puis rien — ne donne aucun jalon, aucun geste depose ni dechargement, aucune palette posée', async () => {
  const p = await pageDep(DEP());
  await departDep(p);
  await p.waitForTimeout(250);
  const b = await baseDe(p), e = b.quais[ID_Q];
  egal(e.depose, {}, 'rien n’est rangé');
  egal(Object.values(await jalonsDep(p)).filter(Boolean), [], 'aucun jalon juste');
  egal(Object.keys((b.gestes && b.gestes[ID_Q]) || {}).filter((g) => g === GESTE_DEP || g === GESTE_FIN), [], 'ni le geste depose ni le geste de fin');
  egal(await posees(p), {}, 'aucune palette posée');
  egal([e.fini, e.evts], [false, 1], 'rien n’est fini (seule la porte est ouverte)');
  vrai(await p.isDisabled(`${HOTE} [data-q="vers3"]`), '③ reste fermée tant que rien n’est posé');
  await p.close();
});

await v('Dépose : P3 sur l’allée piétonne (guidage) — Kevin réagit, la case se grise et reste grisée pour P2 et P1, P3 finit posée ; seul le jalon de P3 est faux', async () => {
  const p = await pageDep(DEP());
  await departDep(p);
  await poserEn(p, 'R2');                                   // P4 : juste
  egal(await enAttente(p), 'P3', 'la pause de P3');
  const avant = await eDep(p);
  await p.click(caseSel('allee-1'));
  egal(await phaseDe(p), 'choix', 'toujours en pause après le refus');
  egal(await enAttente(p), 'P3', 'P3 attend toujours');
  const e = await eDep(p);
  egal(e.depose.P3, { premier: 'allee-1', essais: ['allee-1'], pose: null }, 'P3 : premier clic noté, pas posée');
  egal([e.journal, e.evts, e.minute], [avant.journal, avant.evts, avant.minute], 'un refus n’écrit rien au journal et ne fait pas avancer le quai');
  egal(await posees(p), { P4: 'R2' }, 'seule P4 est posée');
  vrai(/allée piétonne/.test(await lireAnnonce(p)), 'la région aria-live dit la réaction de Kevin');
  egal(await p.locator(`${HOTE} [data-q-bulle-cariste]`).count(), 1, 'la bulle de Kevin est à l’écran');
  vrai(/piétonne/.test(await p.$eval(`${HOTE} [data-q-bulle-cariste]`, (n) => n.textContent)), 'la bulle dit la réaction de la case');
  const gr = `${HOTE} .quai-case-grisee[data-case-grisee="allee-1"]`;
  egal(await p.locator(gr).count(), 1, 'allee-1 est grisée');
  egal(await p.$eval(gr, (n) => [n.getAttribute('tabindex'), n.getAttribute('role'), n.getAttribute('aria-hidden')]), [null, null, 'true'], 'grisée : ni tabindex ni rôle, cachée aux lecteurs d’écran');
  egal(await p.locator(caseSel('allee-1')).count(), 0, 'allee-1 n’est plus une case à choisir');
  egal(await nbCases(p), 4, 'restent à choisir : R1, R3, R4 et quai3-1');
  await poserEn(p, 'R1');                                   // P3 : posée ensuite
  egal(await enAttente(p), 'P2', 'la pause de P2');
  egal(await p.locator(`${HOTE} .quai-case-grisee[data-case-grisee="allee-1"]`).count(), 1, 'à la pause de P2, allee-1 est toujours grisée (gardée)');
  egal(await p.locator(caseSel('allee-1')).count(), 0, 'et n’est pas proposée');
  await poserEn(p, 'R3');
  await poserEn(p, 'R4');
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  const f = await eDep(p);
  egal(f.depose.P3, { premier: 'allee-1', essais: ['allee-1', 'R1'], pose: 'R1' }, 'P3 : premier clic faux, posée en R1');
  egal(f.depose.P4, { premier: 'R2', essais: ['R2'], pose: 'R2' }, 'P4 : sans faute');
  egal(await jalonsDep(p), { 'depose-P1': true, 'depose-P2': true, 'depose-P3': false, 'depose-P4': true }, 'seul le jalon de P3 est faux');
  egal(f.journal.length, 5, 'journal : l’ouverture et quatre poses (le refus n’y est pas)');
  await p.close();
});

await v('Dépose : en évaluation (copie) le premier clic pose, même sur l’allée — aucune réaction, aucune case grisée ; le jalon de P4 est faux, les autres justes', async () => {
  const p = await pageDep(DEP(), { copie: true });
  await departDep(p);
  vrai(/gerbage/.test(await p.$eval(`${HOTE} [data-q-bulle-cariste]`, (n) => n.textContent)), 'la consigne de la première pause est dite aussi en évaluation');
  await poserEn(p, 'allee-1');
  const e = await eDep(p);
  egal(e.depose.P4, { premier: 'allee-1', essais: ['allee-1'], pose: 'allee-1' }, 'P4 est posée sur l’allée dès le premier clic');
  egal(await posees(p), { P4: 'allee-1' }, 'la palette est dans l’allée à l’écran');
  egal(await phaseDe(p), 'choix', 'la vue passe au geste suivant : la pause de P3');
  egal(await enAttente(p), 'P3', 'Kevin tient P3');
  egal(await p.locator(`${HOTE} [data-q-bulle-cariste]`).count(), 0, 'aucune bulle de réaction');
  egal(await p.locator(`${HOTE} .quai-case-grisee`).count(), 0, 'aucune case grisée');
  vrai(!/je ne pose pas/.test(await lireAnnonce(p)), 'la région aria-live ne dit aucune réaction');
  await poserEn(p, 'R1'); await poserEn(p, 'R2'); await poserEn(p, 'R3');
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  egal(await jalonsDep(p), { 'depose-P1': true, 'depose-P2': true, 'depose-P3': true, 'depose-P4': false }, 'seul le jalon de P4 est faux');
  egal(await p.locator(`${HOTE} .quai-case-grisee`).count(), 0, 'à la fin non plus, aucune case grisée');
  await p.close();
});

await v('Dépose : le DOM d’une case à choisir ne dit pas le verdict — mêmes attributs, mêmes classes pour une case juste et pour un piège', async () => {
  const p = await pageDep(DEP());
  await departDep(p);
  const lire = () => p.$$eval(`${HOTE} [data-q="depose"]`, (L) => L.map((g) => ({
    id: g.dataset.c,
    attrs: g.getAttributeNames().filter((n) => n !== 'data-c' && n !== 'aria-label').sort().map((n) => `${n}=${g.getAttribute(n)}`),
    enfants: [...g.children].map((c) => `${c.tagName}.${c.getAttribute('class')}|${c.getAttributeNames().filter((n) => n !== 'points').sort().join(',')}`),
    tout: [g, ...g.querySelectorAll('*')].map((n) => n.getAttributeNames().map((a) => `${a} ${n.getAttribute(a)}`).join(' ')).join(' ') })));
  const L = await lire();
  egal(L.map((x) => x.id), ['allee-1', 'R1', 'R2', 'R3', 'R4', 'quai3-1'], 'les six cases sont à choisir');
  const R1 = L.find((x) => x.id === 'R1');
  for (const x of L) {
    egal(x.attrs, R1.attrs, `${x.id} : les attributs (hors data-c et aria-label) sont ceux de R1`);
    egal(x.enfants, R1.enfants, `${x.id} : les éléments dessinés (classes, noms d’attributs) sont ceux de R1`);
    vrai(!/juste|faux|piege|piège/i.test(x.tout), `${x.id} : un attribut dit le verdict : ${x.tout}`);
  }
  vrai(R1.attrs.some((a) => /^class=quai-case$/.test(a)) && R1.attrs.includes('role=button') && R1.attrs.includes('tabindex=0'), `le contrôle du montage : ${R1.attrs}`);
  await p.close();
});

await v('Dépose : au clavier — Tab jusqu’à une case, Entrée sur l’allée refuse et le focus passe à la case suivante, Espace sur une case juste la pose', async () => {
  const p = await pageDep(DEP());
  await departDep(p);
  const foc = () => p.evaluate(() => { const a = document.activeElement; return a && a !== document.body ? (a.dataset && a.dataset.c) || a.tagName : 'body'; });
  let n = 0;
  while (n++ < 80) {
    await p.keyboard.press('Tab');
    if (await p.evaluate(() => !!document.activeElement && document.activeElement.matches('[data-q="depose"]'))) break;
  }
  vrai(n <= 80, 'Tab n’atteint aucune case');
  egal(await foc(), 'allee-1', 'le premier arrêt est la première case (de gauche à droite)');
  await p.keyboard.press('Enter');
  const e = await eDep(p);
  egal(e.depose.P4, { premier: 'allee-1', essais: ['allee-1'], pose: null }, 'Entrée sur l’allée : refus');
  egal(await foc(), 'R1', 'après le refus, le focus est sur la case proposée suivante (pas perdu sur body)');
  egal(Object.keys((await baseDe(p)).gestes[ID_Q] || {}).filter((g) => g === GESTE_DEP), [], 'un refus ne publie pas le geste depose');
  await p.keyboard.press('Space');
  await p.waitForFunction((s) => document.querySelectorAll(s).length === 1, `${HOTE} [data-iso-posee]`);
  egal((await eDep(p)).depose.P4, { premier: 'allee-1', essais: ['allee-1', 'R1'], pose: 'R1' }, 'Espace sur R1 : posée');
  egal(await posees(p), { P4: 'R1' }, 'P4 est dans R1');
  egal(await foc(), 'R2', 'après la pose, le focus est sur la case proposée suivante');
  vrai(GESTE_DEP in (await baseDe(p)).gestes[ID_Q], 'la première pose publie le geste depose');
  // Un refus sur la DERNIÈRE case : le focus revient à la première case proposée (R2 : R1 est prise), il n’est pas perdu ni envoyé hors de la scène.
  n = 0;
  while (n++ < 30 && (await foc()) !== 'quai3-1') await p.keyboard.press('Tab');
  egal(await foc(), 'quai3-1', 'Tab atteint la dernière case');
  await p.keyboard.press('Enter');
  egal((await eDep(p)).depose.P3, { premier: 'quai3-1', essais: ['quai3-1'], pose: null }, 'Entrée sur le quai voisin : refus');
  egal(await foc(), 'R2', 'après un refus sur la dernière case, le focus revient à la première case proposée');
  await p.close();
});

await v('Dépose : avec le mouvement normal — geste puis pause, aucune case pendant un geste, « Passer l’animation » va à la pause suivante seulement ; même base à l’arrivée qu’en mouvement réduit', async () => {
  const CH = [['R1', 'P4'], ['R2', 'P3'], ['R3', 'P2'], ['R4', 'P1']];
  // a) mouvement réduit : la référence
  const r = await pageDep(DEP());
  await departDep(r);
  for (const [c] of CH) await poserEn(r, c);
  await r.waitForFunction((s) => document.querySelector(s).dataset.qPhase === 'fin', PHASE);
  const eR = await eDep(r), gR = Object.keys((await baseDe(r)).gestes[ID_Q]).sort();
  await r.close();
  // b) mouvement normal, horloge simulée
  const a = await pageDep(DEP(), { c: ctxSM, horloge: true });
  await a.click(`${HOTE} [data-q="decharger"]`);
  egal(await phaseDe(a), 'geste', 'juste après « Décharger » : un geste');
  vrai(['porte', 'chercher'].includes(await gesteDe(a)), `le geste en cours : ${await gesteDe(a)}`);
  egal(await nbCases(a), 0, 'pendant un geste : aucune case à choisir');
  vrai(await a.locator(`${HOTE} [data-q="passer"]`).isVisible(), '« Passer l’animation » est là pendant un geste');
  await jusquaPause(a);
  egal(await phaseDe(a), 'choix', 'puis la pause');
  egal(await gesteDe(a), null, 'à la pause : plus de geste');
  egal(await enAttente(a), 'P4', 'Kevin attend avec P4');
  egal(await nbCases(a), 6, 'à la pause : les six cases se proposent');
  vrai(!(await a.locator(`${HOTE} [data-q="passer"]`).isVisible()), '« Passer l’animation » disparaît à la pause');
  egal(await posees(a), {}, 'aucune palette posée avant le premier clic');
  for (const [i, [c, pal]] of CH.entries()) {
    egal(await enAttente(a), pal, `pause ${i + 1}`);
    await a.click(caseSel(c));
    egal(await phaseDe(a), 'geste', `clic juste ${i + 1} : un geste tout de suite`);
    egal(await nbCases(a), 0, `pendant le geste ${i + 1} : aucune case`);
    await a.click(`${HOTE} [data-q="passer"]`);
    if (i < 3) {
      egal(await phaseDe(a), 'choix', `« Passer » ${i + 1} : la pause suivante`);
      egal(await enAttente(a), CH[i + 1][1], `« Passer » ${i + 1} : la palette suivante attend`);
      egal(Object.keys(await posees(a)).length, i + 1, `« Passer » ${i + 1} : une seule palette de plus est posée`);
    } else egal(await phaseDe(a), 'fin', '« Passer » après la dernière : la fin');
  }
  const eA = await eDep(a), gA = Object.keys((await baseDe(a)).gestes[ID_Q]).sort();
  egal(await posees(a), { P1: 'R4', P2: 'R3', P3: 'R2', P4: 'R1' }, 'à la fin : les quatre palettes dans leurs cases');
  await a.close();
  egal(eA.depose, eR.depose, 'e.depose : le même en animation et en mouvement réduit');
  egal(eA.journal, eR.journal, 'e.journal : le même');
  // `reel` est le chrono réel du quai (les secondes de l'horloge de la page, pas celles du quai) : il court en animation, pas en mouvement réduit.
  delete eA.reel; delete eR.reel;
  egal(eA, eR, 'tout l’état du quai (hors le chrono réel) : le même');
  egal(gA, gR, 'les mêmes gestes rangés');
});

await v('Dépose : page rechargée en pause (et en plein geste) — pause « choix » tout de suite, palettes dans les mêmes cases, bonne palette en attente, case grisée gardée, journal et evts inchangés', async () => {
  const extra = DEP();
  const a = await pageDep(extra, { c: ctxSM, horloge: true });
  await a.click(`${HOTE} [data-q="decharger"]`);
  await jusquaPause(a);
  for (const c of ['R2', 'R4']) { await a.click(caseSel(c)); await a.click(`${HOTE} [data-q="passer"]`); }
  await a.click(caseSel('allee-1'));                         // P2 : un refus avant le rechargement
  const avant = await eDep(a), b = await baseDe(a);
  egal(await enAttente(a), 'P2', 'avant : P2 attend');
  // a) la base d'une pause
  await monterDep(a, extra, b);
  await a.waitForSelector(`${HOTE} [data-q-phase="choix"]`);
  egal(await phaseDe(a), 'choix', 'rechargé : la pause tout de suite');
  egal(await posees(a), { P3: 'R4', P4: 'R2' }, 'rechargé : deux palettes, dans les mêmes cases');
  egal(await enAttente(a), 'P2', 'rechargé : P2 attend');
  egal(await a.locator(`${HOTE} .quai-case-grisee[data-case-grisee="allee-1"]`).count(), 1, 'rechargé : allee-1 est toujours grisée');
  egal(await nbCases(a), 3, 'rechargé : R1, R3 et quai3-1 restent à choisir');
  vrai(!(await a.locator(`${HOTE} [data-q="passer"]`).isVisible()), 'rechargé : rien à passer');
  const apres = await eDep(a);
  egal([apres.evts, apres.journal, apres.depose, apres.minute], [avant.evts, avant.journal, avant.depose, avant.minute], 'evts, journal, état et minute inchangés');
  // b) la base prise en plein geste (juste après un clic juste) : la base est déjà écrite, la pause suivante s'affiche
  await a.click(caseSel('R1'));
  egal(await phaseDe(a), 'geste', 'le clic juste lance un geste');
  const enGeste = await baseDe(a);
  await monterDep(a, extra, enGeste);
  await a.waitForSelector(`${HOTE} [data-q-phase="choix"]`);
  egal(await posees(a), { P2: 'R1', P3: 'R4', P4: 'R2' }, 'rechargé en plein geste : la palette cliquée est posée');
  egal(await enAttente(a), 'P1', 'rechargé en plein geste : P1 attend');
  egal((await eDep(a)).journal, enGeste.quais[ID_Q].journal, 'journal inchangé');
  await a.close();
});

await v('Dépose : sous `commence: \'controle\'` — la dépose n’est pas jouée : ④ montre les palettes dans R1 à R4, aucune case à choisir, aucun jalon depose ; le geste depose reste déclaré', async () => {
  const extra = DEP({ commence: 'controle' });
  const p = await pageDep(extra);
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  egal(await etapesAff(p), [3, 4], 'la vue s’ouvre à ③');
  await p.click(`${HOTE} [data-q="etape"][data-n="4"]`);
  await p.waitForSelector(`${HOTE} [data-q-cf]`);
  egal(await posees(p), { P1: 'R1', P2: 'R2', P3: 'R3', P4: 'R4' }, '④ : P1 à P4 dans R1 à R4, dans l’ordre du contenu');
  egal(await nbCases(p), 0, 'aucune case à choisir');
  egal(await p.locator(`${HOTE} [data-q-phase]`).count(), 0, 'aucune phase de dépose');
  const ids = await p.evaluate(async () => { const Q = await import('/core/types/quai.js'); return Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.map((l) => l.id); });
  egal(ids.filter((id) => /^depose-/.test(id)), [], 'aucun jalon depose');
  vrai(ids.includes('P1-comptage'), 'les jalons de ③ y sont (contrôle du montage)');
  const sig = await p.evaluate(async (dep) => {
    const Q = await import('/core/types/quai.js'), E = await import('/outils/essai-quai-inspection.js');
    const base = Object.assign(E.quaiEssai({}), { securite: null, dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste' } });
    return { avec: Q.creerQuai(Object.assign(base, { depose: dep })).signaux, sans: Q.creerQuai(Object.assign(E.quaiEssai({}), { securite: null })).signaux };
  }, DEP_A());
  egal(sig.avec, ['quai:essai-inspection:decharger', 'quai:essai-inspection:valider', 'quai:essai-inspection:cloturer', GESTE_DEP], 'avec depose : un geste de plus');
  egal(sig.sans, ['quai:essai-inspection:decharger', 'quai:essai-inspection:valider', 'quai:essai-inspection:cloturer'], 'sans depose : la liste d’avant');
  await p.close();
});

await v('Dépose : un quai sans `depose` ne change pas — pas de phase, pas de case, aucun état depose ; le déchargement finit tout seul et le geste de fin part (les gestes et les jalons d’avant : cas « quai arrêt » du lot 1)', async () => {
  const p = await pageDep(DEUX({ arret: 'dechargement' }));
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(BANDEAU);
  egal(await p.locator(`${HOTE} [data-q-phase]`).count(), 0, 'aucun repère de phase');
  egal([await nbCases(p), await p.locator(`${HOTE} .quai-case, ${HOTE} .quai-case-grisee`).count(), await p.locator(`${HOTE} [data-iso-posee]`).count()], [0, 0, 0], 'ni case, ni palette posée dans une case');
  const b = await baseDe(p), e = b.quais[ID_Q];
  egal(e.depose, undefined, 'aucun état depose rangé');
  egal([e.fini, e.dechargeFini, e.evts], [true, true, 5], 'le déchargement a fini seul (ouverture + quatre palettes)');
  egal(Object.keys(b.gestes[ID_Q]).filter((g) => g === GESTE_DEP || g === GESTE_FIN), [GESTE_FIN], 'le geste de fin part, pas de geste depose');
  const ids = await p.evaluate(async () => { const Q = await import('/core/types/quai.js'); return Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.map((l) => l.id); });
  egal(ids.filter((id) => /^depose-/.test(id)), [], 'aucun jalon depose');
  await p.close();
});

/* ---- dépose PAR CLIENT (chantier Transports Pelleau, lot D, 19/10/2026) : `client` sur les cases et les palettes, `depose.clients` */
// Cadrage : `docs/briefs/MOTEUR-depose-par-client.md` (§2 à §6), `docs/briefs/COORDINATION-pelleau.md` §2 point 7. Cas AJOUTÉS (aucun cas existant
// touché). Deux clients, six cases : l'allée piétonne, AV1 et AV2 (Biscuiterie Ar Vag), AK1 et AK2 (Agri-Kerlann), devant le quai B. Quatre palettes
// de cartons : P1 et P3 d'Agri-Kerlann, P2 et P4 d'Ar Vag ; elles sortent dans l'ordre P4 (Ar Vag), P3 (Agri), P2 (Ar Vag), P1 (Agri). Tout ce qui
// est attendu est écrit à la main.
const DEP_CLI = () => ({ passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'AV1', client: 'ar-vag' }, { id: 'AV2', client: 'ar-vag' },
  { id: 'AK1', client: 'agri-kerlann' }, { id: 'AK2', client: 'agri-kerlann' },
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false, nom: 'Devant le quai B' }],
  clients: { 'ar-vag': { nom: 'Biscuiterie Ar Vag', court: 'AR VAG' }, 'agri-kerlann': { nom: 'Agri-Kerlann', court: 'AGRI-KERLANN' } } });
const PCL = (id, client) => ({ id, client, ref: `REF-${id}`, nom: `Désignation ${id}`, W: 2, D: 2, L: 2, bl: 8, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
  etiq: { ref: `REF-${id}`, nom: `PRODUIT ${id}`, poids: '1 colis', lot: `L-${id}` } });
const PALS_CLI = () => [PCL('P1', 'agri-kerlann'), PCL('P2', 'ar-vag'), PCL('P3', 'agri-kerlann'), PCL('P4', 'ar-vag')];
const CLI = (extra = {}) => Object.assign({ securite: null, dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yann' }, depose: DEP_CLI() }, extra);
const QCLI = (m) => { const Q = QC(PALS_CLI(), { rendu: 'iso', froid: false, dechargement: { par: 'cariste' }, depose: DEP_CLI() }); if (m) m(Q); return Q; };
const EXPEDITEUR = { P4: 'Biscuiterie Ar Vag', P3: 'Agri-Kerlann', P2: 'Biscuiterie Ar Vag', P1: 'Agri-Kerlann' };
const monterCli = (p, extra, db, copie = false) => p.evaluate(async ([extra, db0, palettes, copie]) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-quai-inspection.js');
  document.querySelector('#qiScene')?.remove();
  const hote = document.createElement('div'); hote.id = 'qiScene'; document.body.prepend(hote);
  const Q = Object.assign(E.quaiEssai({ palettes }), extra);
  delete Q.unite; delete Q.libelles;   // des cartons
  const db = db0 ? JSON.parse(JSON.stringify(db0)) : {};
  window.__qs = { db, Q, enregistres: [] };
  const meta = Object.assign({ id: 'essai-inspection', code: 'ESSAI', titre: 'Essai de la dépose par client', portee: 'eleve', immersif: true, temps: 'guidage', bareme: 20 }, copie ? { copie: true, temps: 'evaluation' } : {});
  const ctx = {
    meta, profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__qs.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  };
  creerEntreprise(E.universQuai(Q, { copie })).rendre(hote, ctx);
  document.querySelector('#qiScene .ent-nav[data-vue="quai"]').click();
}, [extra, db, PALS_CLI(), copie]);
async function pageCli(extra, { db = null, copie = false } = {}) {
  const p = await ctxS.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  await monterCli(p, extra, db, copie);
  await p.waitForSelector(`${HOTE} .quai-stepper`);
  if (await p.locator(`${HOTE} [data-q="passer1"]`).isVisible()) await p.click(`${HOTE} [data-q="passer1"]`);
  return p;
}
const grisees = (p) => p.$$eval(`${HOTE} .quai-case-grisee`, (L) => L.map((g) => g.dataset.caseGrisee));
const casesProp = (p) => p.$$eval(`${HOTE} [data-q="depose"]`, (L) => L.map((g) => g.dataset.c));
const lignesQuai = (p) => p.evaluate(async () => {
  const Q = await import('/core/types/quai.js');
  return Object.fromEntries(Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.filter((l) => /^depose-/.test(l.id)).map((l) => [l.id, { ok: l.ok, fait: l.fait, attendu: l.attendu, bilan: l.bilan }]));
});

await v('Dépose par client : verifierQuai refuse ce qui n’a pas de sens (client avec sol, palette sans client, client inconnu, pas assez de cases pour un client, case ambiguë…) et accepte la déclaration de référence', async () => {
  egal(quaiMod.verifierQuai(QCLI()), [], 'deux clients, deux cases chacun, deux palettes chacun : accepté');
  egal(quaiMod.verifierQuai(QCLI((Q) => { Q.arret = 'dechargement'; })), [], 'avec arret : permis');
  egal(quaiMod.verifierQuai(QCLI((Q) => { Q.commence = 'controle'; })), [], 'avec commence : permis');
  egal(quaiMod.verifierQuai(QCLI((Q) => { Q.depose.grise = 'palette'; Q.depose.reactionClient = 'Pas là : c’est chez {client}.'; })), [], 'grise: \'palette\' écrit et reactionClient : permis');
  const REFUS = [
    ['case avec client et sol', (Q) => { Q.depose.cases[1].sol = 'pieton'; }, /« AV1 »\) : client et sol à la fois/],
    ['case avec client et juste', (Q) => { Q.depose.cases[1].juste = true; }, /« AV1 »\) : client et juste à la fois/],
    ['palette sans client', (Q) => { delete Q.camions[0].palettes[2].client; }, /palettes\[2\] \(« P3 »\) : client manque/],
    ['palette d’un client inconnu', (Q) => { Q.camions[0].palettes[0].client = 'kerveguen'; }, /« P1 »\) : client « kerveguen » inconnu de depose\.clients/],
    ['case d’un client inconnu', (Q) => { Q.depose.cases[4].client = 'kerveguen'; }, /« AK2 »\) : client « kerveguen » inconnu de depose\.clients/],
    ['trois palettes Ar Vag pour deux cases Ar Vag', (Q) => { Q.camions[0].palettes[2].client = 'ar-vag'; }, /3 palettes Biscuiterie Ar Vag et 2 cases Biscuiterie Ar Vag : il faut au moins une case par palette de ce client/],
    ['case ambiguë (ni client ni sol)', (Q) => { Q.depose.cases.push({ id: 'R9' }); }, /« R9 »\) : une case sans client ni sol dans une dépose par client/],
    ['clients absents', (Q) => { delete Q.depose.clients; }, /depose\.clients : une case déclare un client/],
    ['client sans court', (Q) => { delete Q.depose.clients['ar-vag'].court; }, /depose\.clients « ar-vag » : court vide/],
    ['clé inconnue dans un client', (Q) => { Q.depose.clients['ar-vag'].couleur = 'bleu'; }, /depose\.clients « ar-vag » : clé « couleur » inconnue/],
    ['grise: \'garde\' sous une dépose par client', (Q) => { Q.depose.grise = 'garde'; }, /depose\.grise : « garde » sous une dépose par client/],
    ['reactionClient vide', (Q) => { Q.depose.reactionClient = ' '; }, /depose\.reactionClient : vide/],
    ['neuf cases (8 au plus, inchangé)', (Q) => { Q.depose.cases.push({ id: 'AV3', client: 'ar-vag' }, { id: 'AV4', client: 'ar-vag' }, { id: 'AV5', client: 'ar-vag' }); }, /depose\.cases : 9 cases, 8 au plus/],
    ['peinte: false sur une case de client', (Q) => { Q.depose.cases[3].peinte = false; }, /« AK1 »\) : peinte: false sur une case sans sol/],
  ];
  const fautes = [];
  for (const [nom, mute, motif] of REFUS) {
    const Q = QCLI(mute);
    const E = quaiMod.verifierQuai(Q);
    if (!E.length) fautes.push(`« ${nom} » n’est pas refusé`);
    else if (!E.some((m) => motif.test(m))) fautes.push(`« ${nom} » : message sans ${motif} (${E.join(' | ')})`);
  }
  // Sans aucune case `client`, `clients` et `reactionClient` restent des clés inconnues (le quai d'avant).
  const Qv = QC([PC({ id: 'P1' }), PC({ id: 'P2' }), PC({ id: 'P3' }), PC({ id: 'P4' })], { rendu: 'iso', froid: false, dechargement: { par: 'cariste' }, depose: Object.assign(DEP_A(), { clients: DEP_CLI().clients }) });
  if (!quaiMod.verifierQuai(Qv).some((m) => /depose : clé « clients » inconnue.*aucune case ne déclare de client/.test(m))) fautes.push(`clients sans case de client : pas refusé (${quaiMod.verifierQuai(Qv).join(' | ')})`);
  if (fautes.length) throw new Error(fautes.join(' ; '));
  let levee = '';
  try { quaiMod.creerQuai(QCLI((Q) => { delete Q.camions[0].palettes[0].client; })); } catch (x) { levee = x.message; }
  vrai(/« P1 »\) : client manque/.test(levee), `creerQuai devrait lever l’erreur : ${levee}`);
});

await v('Dépose par client : fonctions pures (hors navigateur) — nom au sol « AR VAG 1 », réaction « zone d’Agri-Kerlann », case refusée pour P4 et juste pour P3, jalons et attendu par client, ligne du bilan, titreBilan', async () => {
  const cases = quaiMod.normaliserCases(DEP_CLI());
  egal(cases.filter((c) => c.client).map((c) => [c.id, c.client, c.auSol, c.nom, c.juste]),
    [['AV1', 'ar-vag', 'AR VAG 1', 'Case AR VAG 1', true], ['AV2', 'ar-vag', 'AR VAG 2', 'Case AR VAG 2', true], ['AK1', 'agri-kerlann', 'AGRI-KERLANN 1', 'Case AGRI-KERLANN 1', true], ['AK2', 'agri-kerlann', 'AGRI-KERLANN 2', 'Case AGRI-KERLANN 2', true]], 'les cases de client complétées');
  egal([cases[1].reaction, cases[3].reaction], ['Ça, c’est la zone de Biscuiterie Ar Vag. Regarde l’étiquette.', 'Ça, c’est la zone d’Agri-Kerlann. Regarde l’étiquette.'], 'la réaction par défaut nomme le client de la case cliquée');
  egal(quaiMod.normaliserCases(Object.assign(DEP_CLI(), { reactionClient: 'Non, ici c’est {client}.' }))[3].reaction, 'Non, ici c’est Agri-Kerlann.', 'reactionClient de la séance');
  egal([cases[0].reaction, cases[0].client], ['Là, c’est l’allée piétonne : je ne pose pas ici.', undefined], 'le piège « pieton » est inchangé');
  const O = { grise: 'palette', clientDe: { P1: 'agri-kerlann', P2: 'ar-vag', P3: 'agri-kerlann', P4: 'ar-vag' } };
  let e = quaiMod.choisirCase({ depose: {} }, cases, 'P4', 'AK1', O);
  egal(e.depose.P4, { premier: 'AK1', essais: ['AK1'], pose: null }, 'P4 (Ar Vag) en AK1 : refusée');
  egal([...quaiMod.casesGrisees(e, cases, 'P4', O)], ['AK1'], 'AK1 grisée pour P4');
  egal(quaiMod.issueDernierChoix(e, cases, 'P4').reaction, 'Ça, c’est la zone d’Agri-Kerlann. Regarde l’étiquette.', 'la réaction');
  e = quaiMod.choisirCase(e, cases, 'P4', 'AV2', O);
  egal(e.depose.P4.pose, 'AV2', 'P4 posée en AV2');
  egal([...quaiMod.casesGrisees(e, cases, 'P3', O)], [], 'pour P3, rien n’est grisé');
  egal(quaiMod.casesProposees(e, cases, 'P3', O), ['allee-1', 'AV1', 'AK1', 'AK2', 'quaiB-1'], 'pour P3, AK1 est proposée (AV2 occupée)');
  e = quaiMod.choisirCase(e, cases, 'P3', 'AK1', O);
  egal(e.depose.P3, { premier: 'AK1', essais: ['AK1'], pose: 'AK1' }, 'P3 (Agri-Kerlann) posée en AK1');
  e = quaiMod.choisirCase(e, cases, 'P2', 'AV1', O); e = quaiMod.choisirCase(e, cases, 'P1', 'AK2', O);
  const J = quaiMod.jalonsDepose(e, cases, ['P1', 'P2', 'P3', 'P4'], Object.assign({ clients: DEP_CLI().clients }, O));
  egal(J.map((l) => [l.id, l.ok, l.attendu]), [
    ['depose-P1', true, 'une case de la zone Agri-Kerlann (AK1, AK2)'], ['depose-P2', true, 'une case de la zone Biscuiterie Ar Vag (AV1, AV2)'],
    ['depose-P3', true, 'une case de la zone Agri-Kerlann (AK1, AK2)'], ['depose-P4', false, 'une case de la zone Biscuiterie Ar Vag (AV1, AV2)']], 'jalons : P4 faux (premier clic chez l’autre client), attendu par client');
  vrai(J.every((l) => !/AV|AK|Ar Vag|Kerlann/.test(l.lib)), `un libellé de jalon dit la zone : ${J.map((l) => l.lib)}`);
  // Par jalonsQuai et etapesQuai : la ligne du bilan, le groupe inchangé, le titre de bilan.
  const Q = QCLI();
  const db = { quais: { [Q.id]: Object.assign(quaiMod.etatNeuf(Q), { depose: e.depose }) } };
  const L = quaiMod.jalonsQuai(db, Q).L.filter((l) => /^depose-/.test(l.id));
  egal(L.map((l) => l.bilan), ['P1, Agri-Kerlann : posée en AK2', 'P2, Biscuiterie Ar Vag : posée en AV1', 'P3, Agri-Kerlann : posée en AK1', 'P4, Biscuiterie Ar Vag : d’abord en AK1, posée ensuite en AV2'], 'les lignes du bilan détaillé');
  egal(L.find((l) => l.id === 'depose-P4').fait, 'premier choix : Case AGRI-KERLANN 1 (posée ensuite en AV2)', 'fait de P4');
  const ET = quaiMod.etapesQuai(Q).filter((x) => /^depose-/.test(x.id));
  egal(ET.map((x) => [x.groupe, x.titreBilan(db)]), [['Diriger le déchargement', 'P1, Agri-Kerlann : posée en AK2'], ['Diriger le déchargement', 'P2, Biscuiterie Ar Vag : posée en AV1'],
    ['Diriger le déchargement', 'P3, Agri-Kerlann : posée en AK1'], ['Diriger le déchargement', 'P4, Biscuiterie Ar Vag : d’abord en AK1, posée ensuite en AV2']], 'etapesQuai : groupe inchangé, titre de bilan par palette');
  egal(ET[0].titreBilan({}), 'P1, Agri-Kerlann : pas posée', 'base vide : « pas posée »');
  // Sans client : ni `bilan` sur les lignes, ni `titreBilan` (le quai d'avant).
  const Qv = QC([PC({ id: 'P1' }), PC({ id: 'P2' }), PC({ id: 'P3' }), PC({ id: 'P4' })], { rendu: 'iso', froid: false, dechargement: { par: 'cariste' }, depose: DEP_A() });
  egal([quaiMod.jalonsQuai({}, Qv).L.some((l) => 'bilan' in l), quaiMod.etapesQuai(Qv).some((x) => 'titreBilan' in x)], [false, false], 'sans client : aucun champ nouveau');
});

await v('Dépose par client : la légende de chaque pause cite l’étiquette de la palette (« Expéditeur : … ») et ne nomme jamais une zone ; les cases de client sont peintes « AR VAG 1 »…', async () => {
  const p = await pageCli(CLI({ arret: { etape: 'dechargement', texte: TEXTE_DEP } }));
  await departDep(p);
  const choix = { P4: 'AV1', P3: 'AK1', P2: 'AV2', P1: 'AK2' };
  for (const pal of SORTIE) {
    const leg = await legende(p);
    egal(await enAttente(p), pal, `la palette attendue (${leg})`);
    vrai(leg.includes(`attend avec la palette ${pal} — étiquette : « Expéditeur : ${EXPEDITEUR[pal]} » (`), `la légende de ${pal} cite l’étiquette : ${leg}`);
    vrai(!/zone/i.test(leg), `la légende de ${pal} nomme une zone : ${leg}`);
    const ann = await lireAnnonce(p);
    vrai(!/zone/i.test(ann), `l’annonce de ${pal} nomme une zone : ${ann}`);
    await poserEn(p, choix[pal]);
  }
  await p.waitForSelector(BANDEAU);
  egal(await p.$$eval(`${HOTE} [data-iso-case-peinte] [data-iso-case-client]`, (L) => L.map((g) => g.textContent.replace(/\s+/g, ''))), ['ARVAG1', 'ARVAG2', 'AGRI-KERLANN1', 'AGRI-KERLANN2'], 'le nom au sol de chaque case de client');
  egal(await lignesQuai(p).then((L) => Object.values(L).map((l) => l.ok)), [true, true, true, true], 'tout juste au premier clic : quatre jalons vrais');
  await p.close();
});

await v('Dépose par client : guidage — P4 (Ar Vag) cliquée en AK1 : le cariste réagit, AK1 grisée pour P4 seulement ; P3 (Agri-Kerlann) va en AK1 ; un piège sol reste un piège ; jalons de P4 et P3 faux, les autres vrais', async () => {
  const p = await pageCli(CLI());
  await departDep(p);
  egal(await enAttente(p), 'P4', 'P4 attend');
  vrai(/gerbage/.test(await p.$eval(`${HOTE} [data-q-bulle-cariste]`, (n) => n.textContent)), 'la consigne de la première pause');
  await p.click(caseSel('AK1'));
  egal(await phaseDe(p), 'choix', 'toujours en pause après le refus');
  egal(await enAttente(p), 'P4', 'P4 attend toujours');
  egal((await eDep(p)).depose.P4, { premier: 'AK1', essais: ['AK1'], pose: null }, 'P4 : premier clic noté, pas posée');
  const bulleTxt = await p.$eval(`${HOTE} [data-q-bulle-cariste]`, (n) => [...n.querySelectorAll('text, tspan')].filter((t) => !t.querySelector('tspan')).map((t) => t.textContent.trim()).join(' '));
  egal(bulleTxt, 'Ça, c’est la zone d’Agri-Kerlann. Regarde l’étiquette.', 'la bulle du cariste (ses lignes, mises bout à bout)');
  vrai(/Agri-Kerlann\. Regarde l’étiquette\./.test(await lireAnnonce(p)), 'la région aria-live dit la réaction');
  egal(await grisees(p), ['AK1'], 'AK1 est grisée');
  egal(await casesProp(p), ['allee-1', 'AV1', 'AV2', 'AK2', 'quaiB-1'], 'pour P4, restent à choisir les autres cases');
  await poserEn(p, 'AV1');
  egal(await enAttente(p), 'P3', 'la pause de P3');
  egal(await grisees(p), [], 'pour P3, AK1 n’est plus grisée (grisée pour P4 seulement)');
  egal(await casesProp(p), ['allee-1', 'AV2', 'AK1', 'AK2', 'quaiB-1'], 'pour P3, AK1 est proposée');
  // Un piège sol reste un piège (réaction de l'allée), grisé pour la palette en cours.
  await p.click(caseSel('allee-1'));
  vrai(/allée piétonne/.test(await p.$eval(`${HOTE} [data-q-bulle-cariste]`, (n) => n.textContent)), 'l’allée : la réaction de toujours');
  egal(await grisees(p), ['allee-1'], 'l’allée grisée pour P3');
  await poserEn(p, 'AK1');
  egal(await posees(p), { P3: 'AK1', P4: 'AV1' }, 'P3 posée en AK1, la case refusée à P4');
  egal(await grisees(p), [], 'pour P2, rien n’est grisé (grise: \'palette\' imposé)');
  await poserEn(p, 'AV2'); await poserEn(p, 'AK2');
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  const L = await lignesQuai(p);
  egal(Object.fromEntries(Object.entries(L).map(([k, l]) => [k, l.ok])), { 'depose-P1': true, 'depose-P2': true, 'depose-P3': false, 'depose-P4': false }, 'P4 (zone) et P3 (allée) faux, les autres vrais');
  egal([L['depose-P4'].attendu, L['depose-P4'].fait], ['une case de la zone Biscuiterie Ar Vag (AV1, AV2)', 'premier choix : Case AGRI-KERLANN 1 (posée ensuite en AV1)'], 'attendu et fait de P4');
  egal([L['depose-P1'].attendu, L['depose-P1'].fait], ['une case de la zone Agri-Kerlann (AK1, AK2)', 'premier choix : Case AGRI-KERLANN 2'], 'attendu et fait de P1');
  const e = await eDep(p);
  egal(e.journal.length, 5, 'journal : l’ouverture et quatre poses (les refus n’y sont pas)');
  await p.close();
});

await v('Dépose par client : l’inaction ne donne rien ; une erreur de zone rectifiée rend ce jalon faux et les autres vrais ; tout juste au premier clic, tout vrai', async () => {
  const p = await pageCli(CLI());
  await departDep(p);
  egal(Object.values(await lignesQuai(p)).map((l) => l.ok), [false, false, false, false], 'rien posé : tous faux');
  await p.click(caseSel('AV1'));                            // P4 (Ar Vag) : juste
  await p.waitForFunction((s) => document.querySelectorAll(s).length === 1, `${HOTE} [data-iso-posee]`);
  await p.click(caseSel('AV2'));                            // P3 (Agri-Kerlann) dans la zone Ar Vag : refusée
  egal((await eDep(p)).depose.P3.pose, null, 'P3 refusée en AV2');
  egal(Object.values(await lignesQuai(p)).map((l) => l.ok), [false, false, false, false], 'tant que tout n’est pas posé : tous faux');
  await poserEn(p, 'AK2'); await poserEn(p, 'AV2'); await poserEn(p, 'AK1');
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  egal(Object.fromEntries(Object.entries(await lignesQuai(p)).map(([k, l]) => [k, l.ok])), { 'depose-P1': true, 'depose-P2': true, 'depose-P3': false, 'depose-P4': true }, 'seul le jalon de P3 est faux');
  await p.close();
});

await v('Dépose par client : en évaluation (copie) le premier clic pose, même dans la zone de l’autre client — aucune réaction, aucune case grisée ; jalon faux ; la palette est dessinée là, à ② et à ④', async () => {
  const p = await pageCli(CLI(), { copie: true });
  await departDep(p);
  await poserEn(p, 'AK1');                                  // P4 (Ar Vag) chez Agri-Kerlann
  egal((await eDep(p)).depose.P4, { premier: 'AK1', essais: ['AK1'], pose: 'AK1' }, 'P4 posée en AK1 dès le premier clic');
  egal(await p.locator(`${HOTE} [data-q-bulle-cariste]`).count(), 0, 'aucune bulle de réaction');
  egal(await grisees(p), [], 'aucune case grisée');
  vrai(!/Regarde l’étiquette/.test(await lireAnnonce(p)), 'la région aria-live ne dit aucune réaction');
  await poserEn(p, 'AK2'); await poserEn(p, 'AV1'); await poserEn(p, 'AV2');   // P3 juste, P2 juste, P1 (Agri) en AV2 : faux
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  egal(await posees(p), { P1: 'AV2', P2: 'AV1', P3: 'AK2', P4: 'AK1' }, '② : chaque palette là où l’élève l’a posée');
  egal(Object.fromEntries(Object.entries(await lignesQuai(p)).map(([k, l]) => [k, l.ok])), { 'depose-P1': false, 'depose-P2': true, 'depose-P3': true, 'depose-P4': false }, 'P4 et P1 faux');
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  await p.click(`${HOTE} [data-q="etape"][data-n="4"]`);
  await p.waitForSelector(`${HOTE} [data-q-cf]`);
  egal(await posees(p), { P1: 'AV2', P2: 'AV1', P3: 'AK2', P4: 'AK1' }, '④ : les palettes dans leurs cases réelles');
  await p.close();
});

await v('Dépose par client : sous `commence: \'controle\'`, chaque palette dans la première case libre de son client ; à ③ l’étiquette dit « Expéditeur : … »', async () => {
  const p = await pageCli(CLI({ commence: 'controle' }));
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  await p.click(`${HOTE} [data-q="sel"][data-n="1"]`);     // P2 : Ar Vag
  await p.dispatchEvent(`${HOTE} svg[data-q-palette] [data-q-carton="1"]`, 'click');
  await p.waitForSelector(`${HOTE} [data-q-etiquette]`);
  egal(await p.$eval(`${HOTE} [data-q-etiquette] .quai-etiq-l1 b`, (n) => n.textContent.trim()), 'Expéditeur : Biscuiterie Ar Vag', 'l’étiquette de P2 dit son expéditeur');
  await p.click(`${HOTE} [data-q="sel"][data-n="0"]`);     // P1 : Agri-Kerlann
  await p.dispatchEvent(`${HOTE} svg[data-q-palette] [data-q-carton="2"]`, 'click');
  await p.waitForFunction((s) => /Agri-Kerlann/.test(document.querySelector(s)?.textContent || ''), `${HOTE} [data-q-etiquette] .quai-etiq-l1 b`);
  egal(await p.$eval(`${HOTE} [data-q-etiquette] .quai-etiq-l1 b`, (n) => n.textContent.trim()), 'Expéditeur : Agri-Kerlann', 'l’étiquette de P1 dit son expéditeur');
  await p.click(`${HOTE} [data-q="etape"][data-n="4"]`);
  await p.waitForSelector(`${HOTE} [data-q-cf]`);
  egal(await posees(p), { P1: 'AK1', P2: 'AV1', P3: 'AK2', P4: 'AV2' }, '④ : P1 et P3 chez Agri-Kerlann, P2 et P4 chez Ar Vag, dans l’ordre du contenu');
  egal(await nbCases(p), 0, 'aucune case à choisir');
  await p.close();
});

await v('Dépose par client : page rechargée en pause — palettes dans les mêmes cases, la case refusée à P3 toujours grisée pour P3 et seulement elle, la légende de P3', async () => {
  const extra = CLI();
  const p = await pageCli(extra);
  await departDep(p);
  await p.click(caseSel('AK1'));                            // P4 : refus
  await poserEn(p, 'AV1');                                  // P4 posée
  await p.click(caseSel('AV2'));                            // P3 : refus
  const avant = await eDep(p), b = await baseDe(p);
  await monterCli(p, extra, b);
  await p.waitForSelector(`${HOTE} [data-q-phase="choix"]`);
  egal(await posees(p), { P4: 'AV1' }, 'rechargé : P4 dans AV1');
  egal(await enAttente(p), 'P3', 'rechargé : P3 attend');
  vrai((await legende(p)).includes('« Expéditeur : Agri-Kerlann »'), `rechargé : la légende de P3 (${await legende(p)})`);
  egal(await grisees(p), ['AV2'], 'rechargé : AV2 grisée (refusée à P3), AK1 ne l’est pas (refusée à P4)');
  egal(await casesProp(p), ['allee-1', 'AK1', 'AK2', 'quaiB-1'], 'rechargé : les cases à choisir');
  const apres = await eDep(p);
  egal([apres.evts, apres.journal, apres.depose, apres.minute], [avant.evts, avant.journal, avant.depose, avant.minute], 'evts, journal, état et minute inchangés');
  await p.close();
});

await v('Dépose par client : la page d’essai (partie 4 bis) — le bilan de fin descend à la palette sous le bloc faux (« P4, Biscuiterie Ar Vag : d’abord en AK1, posée ensuite en AV1 »)', async () => {
  const p = await ctxS.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  await p.goto(`${BASE}outils/essai-quai-inspection.html#depose-client`);
  const H = '[data-hote-client]';
  await p.waitForSelector(`${H} .quai-stepper`);
  if (await p.locator(`${H} [data-q="passer1"]`).isVisible()) await p.click(`${H} [data-q="passer1"]`);
  await p.click(`${H} [data-q="decharger"]`);
  await p.waitForSelector(`${H} [data-q-phase="choix"]`);
  egal(await p.locator(`${H} .ent-fin`).count(), 0, 'pas de bilan avant la fin');
  const clic = async (c, pose = true) => {
    const n = await p.locator(`${H} [data-iso-posee]`).count();
    await p.click(`${H} [data-q="depose"][data-c="${c}"]`);
    if (pose) await p.waitForFunction(([s, n]) => document.querySelectorAll(s).length === n + 1, [`${H} [data-iso-posee]`, n]);
  };
  await clic('AK1', false); await clic('AV1'); await clic('AK1'); await clic('AV2'); await clic('AK2');
  await p.waitForSelector(`${H} [data-fin-detail]`);
  const lignes = await p.$$eval(`${H} [data-fin-detail] li`, (L) => L.map((li) => [li.dataset.finCaseEtat, li.querySelector('span:nth-child(2)').textContent.trim()]));
  egal(lignes, [['ok', 'P1, Agri-Kerlann : posée en AK2'], ['ok', 'P2, Biscuiterie Ar Vag : posée en AV2'], ['ok', 'P3, Agri-Kerlann : posée en AK1'], ['ko', 'P4, Biscuiterie Ar Vag : d’abord en AK1, posée ensuite en AV1']], 'une ligne par palette au bilan');
  egal(await p.$$eval(`${H} .ent-fin [data-fin-jalon]`, (L) => L.map((n) => n.dataset.finEtat)), ['ko'], 'le bloc « Diriger le déchargement » : une seule ligne de groupe, fausse');
  await p.close();
});

/* ================================================= note pondérée et `rendCopie: false` du quai (17/10/2026, trouvé en construisant ENT-8.10) */
// Cas ajoutés (aucun cas existant touché). Le quai d'essai d'ENT-6.4, joué en ÉVALUATION (copie) dans un moteur dont `rendreCopie` est
// enregistré (`window.__cq.remis`). `o.rendCopie` : l'option du quai ; `o.poids` : deux jalons pondérés hors quai (12 + 8 = 20) à la place
// de ceux du quai, `db.hors1` posé (le jalon de 12 est juste, celui de 8 ne l'est pas : valeur écrite à la main, 12 / 20).
const monterCopieQuai = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-quai-inspection.js');
  document.querySelector('#qiScene')?.remove();
  const hote = document.createElement('div'); hote.id = 'qiScene'; document.body.prepend(hote);
  const Q = E.quaiEssai({});
  if (o.rendCopie !== undefined) Q.rendCopie = o.rendCopie;
  const U = E.universQuai(Q, { copie: true });
  const db = {};
  if (o.poids) {
    U.etapes = [
      { id: 'hors1', titre: 'Hors quai A', poids: 12, verifier: (d) => ({ status: d.hors1 ? 'ok' : 'attente' }) },
      { id: 'hors2', titre: 'Hors quai B', poids: 8, verifier: (d) => ({ status: d.hors2 ? 'ok' : 'attente' }) },
    ];
    db.hors1 = true;
  }
  const moteur = creerEntreprise(U);
  window.__cq = { db, moteur, remis: null };
  window.__qs = { db, Q, enregistres: [] };
  const meta = { id: 'essai-inspection', code: 'ESSAI', titre: 'Essai de la copie', portee: 'eleve', immersif: true, temps: 'evaluation', copie: true, bareme: 20 };
  moteur.rendre(hote, {
    meta, profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
    rendreCopie: async (res) => { window.__cq.remis = res; return { rendu: Date.now() }; },
  });
  document.querySelector('#qiScene .ent-nav[data-vue="quai"]').click();
}, o);
async function pageCopieQuai(o = {}) {
  const p = await ctxS.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  await monterCopieQuai(p, o);
  await p.waitForSelector(`${HOTE} [data-q-inspection], ${HOTE} [data-q="passer1"]`);
  if (await p.$(`${HOTE} [data-q="passer1"]`)) await p.click(`${HOTE} [data-q="passer1"]`);
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  return p;
}
// Du quai ① au bouton de clôture (l'inaction sur la sécurité : la note du quai n'est pas ce qu'on regarde ici).
async function jusqueClore(p) {
  await decharger(p);
  await p.click(`${HOTE} [data-q="decharger"]`);
  await p.waitForSelector(`${HOTE} [data-q="vers3"]:not([disabled])`);
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.fill(`${HOTE} #qCompte`, '8'); await p.press(`${HOTE} #qCompte`, 'Enter');
  await p.click(`${HOTE} #qDec-accepter`);
  await p.click(`${HOTE} [data-q="valider"]`);
  await p.click(`${HOTE} [data-q="vers4"]`); await p.click(`${HOTE} [data-q="vers4"]`);
  await p.click(`${HOTE} [data-q="ecrire"]`);
  await p.click(`${HOTE} [data-q="signer"]`);
  await p.waitForSelector(`${HOTE} [data-q="clore"]:not([disabled])`);
}

await v('Séance à jalons pondérés avec un quai, en copie : la note reste celle des jalons (12 / 20), pas celle du quai ; le détail du quai reste rangé', async () => {
  const p = await pageCopieQuai({ poids: true });
  const n = await p.evaluate(() => window.__cq.moteur.noter(window.__cq.db));
  egal([n.score, n.max], [12, 20], 'jalon de 12 juste, jalon de 8 faux : 12 / 20');
  vrai(n.detail.quai && typeof n.detail.quai.reception === 'number', 'le détail du quai (réception, jalons, rapidité) reste rangé pour l’enseignant');
  await p.close();
  // Sans poids, la note de la séance est toujours celle du quai (rien ne change).
  const q = await pageCopieQuai();
  const m = await q.evaluate(() => window.__cq.moteur.noter(window.__cq.db));
  egal(m.max, 17, 'sans poids, la note de la séance est celle du quai : 15 de réception + 2 de rapidité (quai sans froid, valeurs par défaut)');
  vrai(m.detail.quai && typeof m.detail.quai.reception === 'number', 'sans poids : le détail du quai est là aussi');
  await q.close();
});

await v('Quai en copie, `rendCopie: false` : « Clore la réception », deux clics, la clôture ne rend PAS la copie ; sans l’option, « Clore la réception et rendre ma copie » rend la copie', async () => {
  const p = await pageCopieQuai({ rendCopie: false });
  await jusqueClore(p);
  const lib = (s) => p.$eval(`${HOTE} [data-q="clore"]`, (n) => n.textContent.trim());
  egal(await lib(), 'Clore la réception', 'libellé avec l’option');
  await p.click(`${HOTE} [data-q="clore"]`);
  egal(await lib(), 'Clore définitivement ? Cliquez pour confirmer', 'premier clic : la confirmation en deux clics reste');
  vrai(!(await p.evaluate(() => window.__qs.db.quais[window.__qs.Q.id].fini)), 'rien de figé au premier clic');
  await p.click(`${HOTE} [data-q="clore"]`);
  await p.waitForSelector(`${HOTE} [data-q-bilan]`);
  egal(await p.evaluate(() => window.__qs.db.quais[window.__qs.Q.id].fini), true, 'le quai est clos');
  await p.waitForTimeout(400);
  egal(await p.evaluate(() => window.__cq.remis), null, 'rendreCopie n’a pas été appelé');
  egal(await p.locator('[data-copie-etat="rendue"]').count(), 0, 'le bandeau ne dit pas « Copie rendue »');
  egal(await p.locator('[data-copie-rendre]').count(), 1, 'la copie se rend encore par le bandeau (un autre écran)');
  await p.close();
  // Sans `rendCopie` : comme avant.
  const q = await pageCopieQuai();
  await jusqueClore(q);
  egal(await q.$eval(`${HOTE} [data-q="clore"]`, (n) => n.textContent.trim()), 'Clore la réception et rendre ma copie', 'libellé sans l’option');
  await q.click(`${HOTE} [data-q="clore"]`);
  egal(await q.$eval(`${HOTE} [data-q="clore"]`, (n) => n.textContent.trim()), 'Rendre définitivement ? Cliquez pour confirmer', 'confirmation sans l’option');
  await q.click(`${HOTE} [data-q="clore"]`);
  await q.waitForFunction(() => window.__cq.remis !== null);
  egal(await q.evaluate(() => window.__cq.remis.max), 17, 'la copie rendue porte la note du quai (sur 17)');
  await q.waitForSelector('[data-copie-etat="rendue"]');
  await q.close();
});

await v('Quai : `rendCopie` ne prend que false — absent ou false acceptés, true et « oui » refusés avec un message en clair', async () => {
  egal(quaiMod.verifierQuai(QBON()), [], 'absent');
  egal(quaiMod.verifierQuai(QBON({ Q: (Q) => { Q.rendCopie = false; } })), [], 'false');
  for (const mal of [true, 'oui']) {
    const E = quaiMod.verifierQuai(QBON({ Q: (Q) => { Q.rendCopie = mal; } }));
    vrai(E.length === 1 && /rendCopie/.test(E[0]) && /false/.test(E[0]), `rendCopie = ${mal} : ${E.join(' | ')}`);
  }
});

/* ------------------------------------------------------------------ lot 4 : le quai reçoit le niveau de l'élève (17/10/2026) */
// Un quai FONCTION de la graine ET du niveau (`quai: (graine, { niveau, copie }) => …`), bâti sur le quai d'essai : au standard, le quai
// d'ENT-6.4 tel quel ; à l'accompagné, les aides de consigne et une consigne de scène qui rappelle de faire le tour ; au confirmé, un défaut
// de plus (la cale absente). La fonction NOTE chaque appel (`window.__qn.appels`) : c'est ainsi qu'on sait ce que le moteur lui passe.
// `o.faute` : la variante du confirmé est fautive (un point en double, refusé par `verifierQuai`). Rend 'ok' ou le message du refus.
const CONSIGNE_ACC = 'Fais le tour du camion, puis clique sur ce qui ne va pas.';
const monterNiveau = (p, o = {}) => p.evaluate(async ({ o, CONSIGNE_ACC }) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-quai-inspection.js');
  document.querySelector('#qiScene')?.remove();
  const hote = document.createElement('div'); hote.id = 'qiScene'; document.body.prepend(hote);
  window.__qn = { appels: [], M: null };
  const quaiDe = (graine, opts) => {
    window.__qn.appels.push([graine, opts]);
    const niveau = (opts && opts.niveau) || 'standard';
    const S = JSON.parse(JSON.stringify(E.SECURITE_ENT64));
    if (niveau === 'accompagne') S.consigne = CONSIGNE_ACC;
    if (niveau === 'confirme') { const c = S.points.find((x) => x.id === 'cale'); c.etat = 'absente'; c.ok = false; c.repare = 'Je fais poser la cale.'; }
    if (niveau === 'confirme' && o.faute) S.points.push({ ...S.points[0] });
    const Q = E.quaiEssai({ securite: S });
    Q.aides = niveau === 'accompagne' ? { consignes: true } : {};
    return Q;
  };
  const U = Object.assign(E.universQuai(E.quaiEssai({}), { copie: !!o.copie }), { quai: quaiDe });
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__qs = { db, Q: E.quaiEssai({}), enregistres: [] };
  const meta = Object.assign({ id: 'essai-niveau', code: 'ESSAI', titre: 'Essai du quai par niveau', portee: 'eleve', immersif: true, temps: 'guidage', bareme: 20 },
    o.copie ? { copie: true, temps: 'evaluation' } : {});
  let M;
  try { M = creerEntreprise(U); } catch (x) { return x.message; }
  window.__qn.M = M;
  M.rendre(hote, {
    meta, profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-niv' }, aisance: o.aisance || 'standard',
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  document.querySelector('#qiScene .ent-nav[data-vue="quai"]').click();
  return 'ok';
}, { o, CONSIGNE_ACC });
async function pageNiveau(o = {}) {
  const p = await ctxS.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  const r = await monterNiveau(p, o);
  if (r !== 'ok') { await p.close(); return { message: r }; }
  await p.waitForSelector(`${HOTE} [data-q-inspection], ${HOTE} [data-q="passer1"]`);
  if (await p.$(`${HOTE} [data-q="passer1"]`)) await p.click(`${HOTE} [data-q="passer1"]`);
  await p.waitForSelector(`${HOTE} [data-q-inspection]`);
  return { p };
}
const appelsNiveau = (p) => p.evaluate(() => window.__qn.appels);
const noteNiveau = (p) => p.evaluate(() => window.__qn.M.noter(window.__qs.db));
const CONSIGNE_STD = 'Clique sur ce qui ne va pas, puis signale-le à Nadia.';

await v('Quai niveau : la fonction reçoit (graine, { niveau, copie }) — les trois variantes au chargement, puis celle de l’élève ; au standard, le quai d’aujourd’hui', async () => {
  const { p } = await pageNiveau({});
  const A = await appelsNiveau(p);
  egal(A.slice(0, 3), [['', { niveau: 'standard', copie: false }], ['', { niveau: 'confirme', copie: false }], ['', { niveau: 'accompagne', copie: false }]],
    'les trois variantes de la graine de référence, au chargement');
  egal(A[A.length - 1], ['u-niv', { niveau: 'standard', copie: false }], 'le quai de l’élève : sa graine, son niveau');
  egal(await p.$eval(`${HOTE} [data-q-consigne]`, (n) => n.textContent.trim()), CONSIGNE_STD, 'la consigne du standard');
  const n = await noteNiveau(p);
  egal(n.detail.quai.niveau, undefined, 'au standard, le détail ne porte pas de niveau');
  egal(n.detail.quai.jeu.filter((l) => /^Danger/.test(l.lib)).length, 2, 'deux dangers au standard (cabine, niveleur)');
  await p.close();
});

await v('Quai niveau : l’accompagné reçoit SON quai (consigne de scène, aides allumées), le confirmé le sien (un défaut de plus) ; le détail de la note dit le niveau', async () => {
  const acc = (await pageNiveau({ aisance: 'accompagne' })).p;
  let A = await appelsNiveau(acc);
  egal(A[A.length - 1], ['u-niv', { niveau: 'accompagne', copie: false }], 'accompagné : ce que reçoit la fonction');
  egal(await acc.$eval(`${HOTE} [data-q-consigne]`, (n) => n.textContent.trim()), CONSIGNE_ACC, 'accompagné : la consigne de la scène');
  let n = await noteNiveau(acc);
  egal([n.detail.quai.niveau, n.detail.quai.jeu.filter((l) => /^Danger/.test(l.lib)).length], ['accompagne', 2], 'accompagné : détail et dangers');
  // Les aides de consigne : visibles à l'étape ② (le standard n'en a pas).
  await acc.evaluate(() => { const s = window.__qs.db.quais['essai-inspection'].securite; s.fait = true; s.signales = []; });
  await acc.close();
  const conf = (await pageNiveau({ aisance: 'confirme' })).p;
  A = await appelsNiveau(conf);
  egal(A[A.length - 1], ['u-niv', { niveau: 'confirme', copie: false }], 'confirmé : ce que reçoit la fonction');
  egal(await conf.$eval(`${HOTE} [data-q-consigne]`, (n) => n.textContent.trim()), CONSIGNE_STD, 'confirmé : la consigne du standard');
  n = await noteNiveau(conf);
  egal([n.detail.quai.niveau, n.detail.quai.jeu.filter((l) => /^Danger/.test(l.lib)).length], ['confirme', 3], 'confirmé : détail et dangers (cale en plus)');
  await conf.close();
});

await v('Quai niveau : les aides du quai suivent le niveau à l’écran — « quai-aide » chez l’accompagné à l’étape ②, aucune chez le standard', async () => {
  for (const aisance of ['accompagne', 'standard']) {
    const { p } = await pageNiveau({ aisance });
    // « C'est bon, on peut décharger » (deux clics, Nadia n'arrête pas), puis « Oui, vous pouvez décharger » : l'étape ②.
    await decharger(p);
    await p.waitForSelector(`${HOTE} [data-q="decharger"]`);
    await p.click(`${HOTE} [data-q="decharger"]`);
    await p.waitForSelector(`${HOTE} [data-q="vers3"]`);
    const n = await p.$$eval(`${HOTE} .quai-aide`, (L) => L.length);
    vrai(aisance === 'accompagne' ? n >= 1 : n === 0, `${aisance} : ${n} aide(s) à l’étape ②`);
    await p.close();
  }
});

await v('Quai niveau : en évaluation (copie), le quai reçoit toujours « standard » et aucune autre variante n’est construite ; l’enseignant aussi', async () => {
  const { p } = await pageNiveau({ aisance: 'confirme', copie: true });
  const A = await appelsNiveau(p);
  egal(A.map((x) => x[1]), [{ niveau: 'standard', copie: true }, { niveau: 'standard', copie: true }], 'en copie : la référence puis l’élève, au standard, `copie: true`');
  egal(A.map((x) => x[0]), ['', 'u-niv'], 'en copie : les graines');
  await p.close();
  const q = (await pageNiveau({ aisance: 'confirme', role: 'prof' })).p;
  const B = await appelsNiveau(q);
  egal(B[B.length - 1][1], { niveau: 'standard', copie: false }, 'l’enseignant : le standard');
  egal(await q.$eval(`${HOTE} [data-q-consigne]`, (n) => n.textContent.trim()), CONSIGNE_STD, 'l’enseignant : la consigne du standard');
  await q.close();
});

await v('Quai niveau : une variante fautive à un niveau est refusée au chargement, avec le niveau dans le message ; la même séance sans la faute s’ouvre', async () => {
  const r = await pageNiveau({ faute: true });
  vrai(!!r.message && /^quai du niveau « confirme » : /.test(r.message) && /en double|deux fois|déjà/.test(r.message), `le refus : ${r.message}`);
  const ok = await pageNiveau({});
  vrai(!!ok.p, 'la séance sans faute ne s’ouvre pas');
  if (ok.p) await ok.p.close();
});

await v('Quai niveau : `etapesQuaiTire(quaiDe, graineDeBase, niveauDe)` juge sur le quai du niveau de la base ; sans `niveauDe`, le standard pour tous', async () => {
  const R = await pg.evaluate(async () => {
    const { etapesQuaiTire, etatNeuf } = await import('/core/types/quai.js');
    const { graineDeBase, niveauEleve } = await import('/core/tirage.js');
    const E = await import('/outils/essai-quai-inspection.js');
    // Standard : P1 attendue « accepter » ; confirmé : P1 abîmée (réserves — avarie). Même nombre de jalons aux deux niveaux.
    const quaiDe = (graine, { niveau } = {}) => {
      const Q = E.quaiEssai({});
      if (niveau === 'confirme') Object.assign(Q.camions[0].palettes[0], { avarie: { '0,0,1': 'N' }, attendu: 'reserves', motifAttendu: 'avarie' });
      return Q;
    };
    const baseDe = (aisance) => {
      const Q = quaiDe('', { niveau: aisance });
      const e = etatNeuf(Q);
      e.palettes = e.palettes || {};
      e.palettes.P1 = Object.assign(e.palettes.P1 || { vue: 0, vues: [0], sonde: null, compte: null, etiqVue: false, detail: {}, motif: 'aucun', res: '', motif2: 'aucun', res2: '', fiche: { temp: '', ref: '', endo: '', manq: '' }, calcul: {} },
        { compte: 8, decision: 'accepter', motif: 'aucun' });
      return { aisance, tirage: { graine: 'x' }, quais: { [Q.id]: e } };
    };
    const avec = etapesQuaiTire(quaiDe, graineDeBase, (db) => niveauEleve(db));
    const sans = etapesQuaiTire(quaiDe, graineDeBase);
    const k = avec.findIndex((x) => /P1 décision/.test(x.titre));
    return { k, titres: avec.map((x) => x.titre), memes: JSON.stringify(avec.map((x) => x.titre)) === JSON.stringify(sans.map((x) => x.titre)),
      avecStd: avec[k].verifier(baseDe('standard')).status, avecConf: avec[k].verifier(baseDe('confirme')).status,
      sansStd: sans[k].verifier(baseDe('standard')).status, sansConf: sans[k].verifier(baseDe('confirme')).status };
  });
  vrai(R.k >= 0, `le jalon « P1 décision » introuvable (${R.titres.join(' · ')})`);
  vrai(R.memes, 'les étapes de référence diffèrent avec et sans niveauDe');
  egal([R.avecStd, R.avecConf], ['ok', 'attente'], 'avec niveauDe : « accepter » est juste au standard, pas au confirmé');
  egal([R.sansStd, R.sansConf], ['ok', 'ok'], 'sans niveauDe : le standard pour tous');
});

/* ------------------------------------------- MOTEUR-chep, lot B : les piles de palettes vides (`forme: 'pile'`) */
// Brief `docs/briefs/MOTEUR-chep-ramasse-et-piles.md` §3. Les valeurs attendues sont ÉCRITES À LA MAIN (jamais recopiées du moteur).
// Le quai de la page d'essai (partie 5, `quaiPiles`) : cinq piles de 15 annoncées — P1 juste ; P2 à 14 ; P3 une LPR (n° 6) ; P4 deux abîmées
// (n° 4 face S, n° 9 face N) ; P5 une Europe (n° 11) et une manquante (14 sur la pile).
const PP = (o = {}) => Object.assign({ id: 'P1', forme: 'pile', ref: 'CHEP-1210', nom: 'Palettes CHEP vides', bl: 15, etiq: { ref: 'BC-1', nom: 'PILE', poids: '15 annoncées' } }, o);
const QPILE = (ps, m = {}) => Object.assign({ id: 'tp', rendu: 'iso', froid: false, unite: { un: 'palette', des: 'palettes', feminin: true },
  motifs: ['manquant', 'avarie', 'produit'], deuxMotifs: true, decisions: ['accepter', 'reserves'],
  libelles: { avarie: { nom: 'Palettes abîmées', precision: 'à réparer', adjectif: 'abîmé' }, manquant: { nom: 'Palettes manquantes' }, produit: { nom: 'Palettes d’un autre pool' } },
  document: { nom: 'Bon de collecte', court: 'BC' },
  camions: [{ transporteur: 'T', fournisseur: 'F', bl: 'BC-27', arrivee: '13:40', palettes: ps }] }, m);
// Ce qui, dans le dessin ou le zoom, nommerait un pool ou un dégât (la règle du quai iso : l'élève le VOIT, rien ne l'écrit).
const NOMME = /chep|lpr|logipal|epal|\beur\b|europe|ab[iî]m|avarie|cass|arrach|pool|intrus|d[ée]g[âa]t|r[ée]par/i;

await v('Quai piles : comptePile écrit à la main sur trois piles (CHEP = sur la pile − autres pools, abîmées comprises ; à créditer = CHEP ; à réparer = abîmées)', async () => {
  egal(quaiMod.comptePile(PP()), { bl: 15, hauteur: 15, manquantes: 0, intrus: 0, parPool: { lpr: 0, logipal: 0, epal: 0 }, abimees: 0, chep: 15, aCrediter: 15, aReparer: 0 }, 'une pile juste');
  egal(quaiMod.comptePile(PP({ hauteur: 14, intrus: { 6: 'lpr', 11: 'epal' }, abimee: { 9: 'S' } })),
    { bl: 15, hauteur: 14, manquantes: 1, intrus: 2, parPool: { lpr: 1, logipal: 0, epal: 1 }, abimees: 1, chep: 12, aCrediter: 12, aReparer: 1 }, '14 sur 15, une LPR, une Europe, une abîmée');
  egal(quaiMod.comptePile(PP({ bl: 18, hauteur: 16, intrus: { 2: 'logipal', 3: 'logipal', 4: 'lpr' }, abimee: { 1: 'N', 16: 'W' } })),
    { bl: 18, hauteur: 16, manquantes: 2, intrus: 3, parPool: { lpr: 1, logipal: 2, epal: 0 }, abimees: 2, chep: 13, aCrediter: 13, aReparer: 2 }, '16 sur 18, trois d’autres pools, deux abîmées');
  // Le moteur s'en sert pour ses jalons : le comptage attendu est la hauteur, le bon de collecte dit 15.
  const Q = QPILE([PP({ id: 'P2', hauteur: 14 })]);
  egal(quaiMod.jalonsQuai({}, Q).L.find((l) => l.id === 'P2-comptage').attendu, '14 palettes (BC : 15)', 'le comptage attendu de P2');
});

await v('Quai piles : la décision attendue se calcule (aucune histoire → accepter ; sinon réserves, un motif par histoire) ; écrite fausse, elle est refusée', async () => {
  const piles = [PP({ id: 'P1' }), PP({ id: 'P2', hauteur: 14 }), PP({ id: 'P3', intrus: { 6: 'lpr' } }), PP({ id: 'P4', abimee: { 4: 'S', 9: 'N' } }), PP({ id: 'P5', hauteur: 14, intrus: { 11: 'epal' } })];
  egal(piles.map((p) => quaiMod.decisionPile(p)), [
    { attendu: 'accepter', motifs: [] }, { attendu: 'reserves', motifs: ['manquant'] }, { attendu: 'reserves', motifs: ['produit'] },
    { attendu: 'reserves', motifs: ['avarie'] }, { attendu: 'reserves', motifs: ['manquant', 'produit'] }], 'les cinq piles de la page d’essai');
  const J = quaiMod.jalonsQuai({}, QPILE(piles)).L, at = (id) => (J.find((l) => l.id === id) || {}).attendu;
  egal([at('P1-decision'), at('P2-decision'), at('P5-decision')], ['Accepter — aucun motif', 'Accepter avec réserves — Palettes manquantes', 'Accepter avec réserves — Palettes manquantes + Palettes d’un autre pool'], 'les décisions attendues au bilan');
  egal([at('P2-reserve'), at('P3-reserve'), at('P4-reserve'), at('P5-reserve')], [
    'P2 CHEP-1210 : acceptée sous réserve — manque 1 palette (BC 15, reçu 14).',
    'P3 CHEP-1210 : acceptée sous réserve — 1 palette d’un autre pool.',
    'P4 CHEP-1210 : acceptée sous réserve — 2 palettes abîmées (à réparer).',
    'P5 CHEP-1210 : acceptée sous réserve — manque 1 palette (BC 15, reçu 14) ; 1 palette d’un autre pool.'], 'les réserves attendues, écrites à la main');
  vrai(!J.find((l) => l.id === 'P1-reserve'), 'P1 est acceptée : pas de ligne de réserve');
  egal(quaiMod.verifierQuai(QPILE(piles)), [], 'les cinq piles sont acceptées au chargement');
  egal(await pg.evaluate(async () => { const Q = await import('/core/types/quai.js'), E = await import('/outils/essai-quai-inspection.js'); return Q.verifierQuai(E.quaiPiles()); }), [], 'le quai de la page d’essai est accepté au chargement');
  const faux = quaiMod.verifierQuai(QPILE([PP({ attendu: 'reserves' })]));
  vrai(faux.some((m) => /attendu « reserves » alors que la pile demande « accepter »/.test(m)), `attendu écrit faux : ${faux.join(' | ') || 'pas refusé'}`);
  const mot = quaiMod.verifierQuai(QPILE([PP({ hauteur: 14, attendu: 'reserves', motifAttendu: 'avarie' })]));
  vrai(mot.some((m) => /motifs écrits \(avarie\) alors que la pile demande manquant/.test(m)), `motif écrit faux : ${mot.join(' | ') || 'pas refusé'}`);
  egal(quaiMod.verifierQuai(QPILE([PP({ hauteur: 14, attendu: 'reserves', motifAttendu: 'manquant' })])), [], 'une décision écrite juste est acceptée');
});

await v('Quai piles : verifierQuai refuse chaque déclaration fautive, avec un message clair', async () => {
  const REFUS = [
    ['n° hors de la pile (16 sur 15)', (Q) => { Q.camions[0].palettes[0].intrus = { 16: 'lpr' }; }, /palette n° « 16 » n’existe pas/],
    ['n° 0', (Q) => { Q.camions[0].palettes[0].abimee = { 0: 'N' }; }, /palette n° « 0 » n’existe pas/],
    ['n° non entier', (Q) => { Q.camions[0].palettes[0].intrus = { 2.5: 'lpr' }; }, /« 2\.5 »/],
    ['n° écrit « 06 »', (Q) => { Q.camions[0].palettes[0].intrus = { '06': 'lpr' }; }, /« 06 »/],
    ['n° au-dessus de la hauteur (15 sur une pile de 14)', (Q) => { Object.assign(Q.camions[0].palettes[0], { hauteur: 14, abimee: { 15: 'S' } }); }, /« 15 » n’existe pas/],
    ['palette intruse et abîmée', (Q) => { Object.assign(Q.camions[0].palettes[0], { intrus: { 6: 'lpr' }, abimee: { 6: 'S' } }); }, /à la fois d’un autre pool et abîmée/],
    ['pool inconnu', (Q) => { Q.camions[0].palettes[0].intrus = { 3: 'europe' }; }, /« europe »/],
    ['« chep » comme intrus', (Q) => { Q.camions[0].palettes[0].intrus = { 3: 'chep' }; }, /« chep »/],
    ['face inconnue', (Q) => { Q.camions[0].palettes[0].abimee = { 3: 'Z' }; }, /« Z »/],
    ['hauteur > bl', (Q) => { Q.camions[0].palettes[0].hauteur = 16; }, /hauteur \(16\) plus grande que bl \(15\)/],
    ['19 palettes', (Q) => { Q.camions[0].palettes[0].bl = 19; }, /19 palettes, 18 au plus/],
    ['hauteur 0', (Q) => { Q.camions[0].palettes[0].hauteur = 0; }, /hauteur doit être/],
    ['refs', (Q) => { Q.camions[0].palettes[0].refs = []; }, /« refs » n’a pas de sens pour une pile/],
    ['etiqAvant', (Q) => { Q.camions[0].palettes[0].etiqAvant = 'dechiree'; }, /« etiqAvant »/],
    ['W', (Q) => { Q.camions[0].palettes[0].W = 2; }, /« W »/],
    ['manque (au lieu de hauteur)', (Q) => { Q.camions[0].palettes[0].manque = [3]; }, /« manque »/],
    ['avarie (au lieu de abimee)', (Q) => { Q.camions[0].palettes[0].avarie = { 3: 'N' }; }, /« avarie »/],
    ['clé inconnue', (Q) => { Q.camions[0].palettes[0].intruse = { 3: 'lpr' }; }, /« intruse » inconnu/],
    ['unité absente', (Q) => { delete Q.unite; }, /une pile de palettes vides demande `unite`/],
    ['decisions absentes', (Q) => { delete Q.decisions; }, /demande decisions: \['accepter', 'reserves'\]/],
    ['« refuser » proposé', (Q) => { Q.decisions = ['accepter', 'reserves', 'refuser']; }, /« refuser » n’existe pas pour une pile/],
    ['trois histoires', (Q) => { Object.assign(Q.camions[0].palettes[0], { hauteur: 14, intrus: { 2: 'lpr' }, abimee: { 3: 'S' } }); }, /trois histoires/],
    ['deux histoires sans deuxMotifs', (Q) => { delete Q.deuxMotifs; Object.assign(Q.camions[0].palettes[0], { hauteur: 14, intrus: { 2: 'lpr' } }); }, /demandent deuxMotifs: true/],
    ['motif absent de motifs', (Q) => { Q.motifs = ['manquant', 'avarie']; Q.camions[0].palettes[0].intrus = { 2: 'lpr' }; }, /le motif « produit », absent de motifs/],
    ['aides de couches', (Q) => { Q.aides = { regleCouches: true }; }, /aides\.regleCouches .* pile/],
    ['sans rendu iso', (Q) => { delete Q.rendu; }, /une pile de palettes vides se dessine sur le quai iso/],
    ['unite.feminin pas un booléen', (Q) => { Q.unite.feminin = 'oui'; }, /unite\.feminin : true/],
    ['libelles.avarie.adjectif vide', (Q) => { Q.libelles.avarie.adjectif = ' '; }, /libelles\.avarie\.adjectif : le texte est vide/],
    ['document.court vide', (Q) => { Q.document = { nom: 'Bon de collecte', court: '' }; }, /document\.court : l’abréviation est vide/],
    ['document : clé inconnue', (Q) => { Q.document = { nom: 'Bon de collecte', court: 'BC', abrege: 'BC' }; }, /document\.abrege : inconnu/],
  ];
  const fautes = [];
  egal(quaiMod.verifierQuai(QPILE([PP()])), [], 'la pile de départ est acceptée');
  for (const [nom, mute, motif] of REFUS) {
    const Q = JSON.parse(JSON.stringify(QPILE([PP()]))); mute(Q);
    const E = quaiMod.verifierQuai(Q);
    if (!E.length) fautes.push(`« ${nom} » n’est pas refusé`);
    else if (!E.some((m) => motif.test(m))) fautes.push(`« ${nom} » : message sans « ${motif} » (${E.join(' | ')})`);
  }
  // `decisions` sur un quai de cartons : permis (une partie des trois, « accepter » compris), contrôlé comme le reste.
  const QC1 = (d, att = 'accepter') => ({ id: 'qc', camions: [{ palettes: [{ id: 'P1', ref: 'X', bl: 8, W: 2, D: 2, L: 2, manque: [], avarie: {}, attendu: att, motifAttendu: 'aucun', etiq: {} }] }], decisions: d });
  egal(quaiMod.verifierQuai(QC1(['accepter', 'refuser'])), [], 'des cartons sans « reserves » : permis');
  [[['accepter', 'garder'], /« garder » n’existe pas/], [['reserves'], /« accepter » doit être proposé/], [['accepter', 'accepter'], /en double/], [[], /la liste des décisions/],
    [['accepter', 'reserves'], /attendu « refuser », absent de decisions/, 'refuser']].forEach(([d, re, att]) => {
    const E = quaiMod.verifierQuai(QC1(d, att));
    if (!E.some((m) => re.test(m))) fautes.push(`decisions ${JSON.stringify(d)} : ${E.join(' | ') || 'pas refusé'}`);
  });
  if (fautes.length) throw new Error(fautes.join(' ; '));
});

await v('Quai piles : le kit — un dégât se voit de DEUX vues consécutives seulement, la pile moins haute quand il en manque, aucun texte, aucun vert', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 100, origine: [400, 400] });
    const pal = (n, o = {}) => Array.from({ length: n }, (_, k) => ({ no: k + 1, pool: (o.pool || {})[k + 1] || 'chep', abime: (o.ab || {})[k + 1] || null }));
    const n = (s, re) => (s.match(re) || []).length;
    const vues = (face, no, o = {}) => [0, 1, 2, 3].map((rot) => n(K.palettePile(I, { palettes: pal(no, { ab: { [no]: face } }) }, 0, 0, rot, Object.assign({ lisible: true }, o)), /data-iso-avarie/g)).join('');
    const R = {};
    ['N', 'S', 'E', 'W'].forEach((f) => { R[`${f}9`] = vues(f, 9); R[`${f}4`] = vues(f, 4); });
    R.sansDents = vues('S', 9, { dents: false }); R.simple = vues('S', 9, { simple: true }); R.sansBalise = vues('S', 9, { balises: false });
    const attrs = (q) => `data-n="${q.no}"`;
    R.groupes15 = n(K.palettePile(I, { palettes: pal(15) }, 0, 0, 0, { attrs }), /data-n="/g);
    R.groupes14 = n(K.palettePile(I, { palettes: pal(14) }, 0, 0, 0, { attrs }), /data-n="/g);
    const bbox = (svg) => { const h = document.createElement('div'); h.innerHTML = `<svg viewBox="0 0 800 800" width="800" height="800"><g>${svg}</g></svg>`; document.body.append(h); const b = h.querySelector('g').getBBox(); h.remove(); return b.height; };
    R.haut15 = bbox(K.palettePile(I, { palettes: pal(15) }, 0, 0, 0, {})); R.haut14 = bbox(K.palettePile(I, { palettes: pal(14) }, 0, 0, 0, {}));
    const tout = K.palettePile(I, { palettes: pal(15, { pool: { 2: 'lpr', 3: 'logipal', 4: 'epal' }, ab: { 6: 'S', 7: 'E' } }) }, 0, 0, 0, { lisible: true, sel: 3 });
    R.textes = n(tout, /<text/g); R.titres = n(tout, /<title|title=/g);
    R.marquage = n(tout, /<path d="M/g); R.sansMarquage = n(K.palettePile(I, { palettes: pal(15) }, 0, 0, 0, { lisible: false }), /<path d="M/g);
    // Le vert ne dit que « juste » : aucune teinte du dessin n'est verte (G plus fort que R et que B).
    R.verts = [...new Set((tout.match(/#[0-9a-f]{6}/gi) || []))].filter((c) => { const [rr, gg, bb] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); return gg > rr + 12 && gg > bb + 12; });
    // Une palette Europe (1 200 × 800) est plus étroite : vue de face, sa face avant est en retrait (dessinée plus haut à l'écran que celle d'une CHEP).
    const ys = (pool) => { const s = K.palettePile(I, { palettes: [{ no: 1, pool, abime: null }] }, 0, 0, 0, {}); return Math.max(...[...s.matchAll(/points="([^"]+)"/g)].flatMap((m) => m[1].split(' ').map((q) => +q.split(',')[1]))); };
    R.epalRetrait = ys('chep') - ys('epal');
    return R;
  });
  // Écrit à la main : une face se voit de devant (rotation où elle est la face S) et de côté (où elle est la face E), comme la fuite d'un fût.
  egal([r.S9, r.E9, r.N9, r.W9], ['1001', '1100', '0110', '0011'], 'planche cassée (n° impair) : S aux rotations 0 et 3, E 0 et 1, N 1 et 2, W 2 et 3');
  egal([r.S4, r.E4, r.N4, r.W4], ['1001', '1100', '0110', '0011'], 'bloc arraché (n° pair) : mêmes rotations');
  egal([r.sansDents, r.simple, r.sansBalise], ['0000', '0000', '0000'], 'dents: false, le décor (simple) et balises: false ne balisent aucun dégât');
  egal([r.groupes15, r.groupes14], [15, 14], 'une palette dessinée par palette sur la pile (rien à la place d’une manquante)');
  vrai(r.haut15 - r.haut14 > 14 && r.haut15 - r.haut14 < 16, `une pile de 14 est moins haute d’une palette (15 cm, 15 px ici) : ${(r.haut15 - r.haut14).toFixed(1)} px`);
  egal([r.textes, r.titres], [0, 0], 'aucun <text> ni titre dans le dessin : le marquage est tracé');
  vrai(r.marquage >= 15 && r.sansMarquage === 0, `le marquage n’existe que lisible (${r.marquage} tracés lisibles, ${r.sansMarquage} sinon)`);
  egal(r.verts, [], 'aucune teinte verte');
  // 10 cm de retrait sur la face avant, à 100 px le mètre : 0,10 × 0,5 × 100 = 5 px plus haut à l'écran (écrit à la main).
  vrai(Math.abs(r.epalRetrait - 5) < 0.2, `la palette Europe ne fait pas son retrait de 10 cm (${r.epalRetrait.toFixed(1)} px au lieu de 5)`);
});

// La partie 5 de la page d'essai (les cinq piles), dans le vrai moteur. `controle` : commence au contrôle (piles déjà au sol).
async function pagePiles({ controle = true, copie = false } = {}) {
  const p = await ctxS.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE + 'outils/essai-quai-inspection.html');
  if (!controle) await p.uncheck('input[name="pile-controle"]');
  if (copie) await p.check('input[name="pile-mode"][value="copie"]');
  await p.click('[data-lancer-piles]');
  await p.waitForSelector(`[data-hote-piles] ${controle ? '[data-q-palette]' : '[data-q="decharger"]'}`);
  return p;
}
const HP = '[data-hote-piles]';
const ongletPile = async (p, id) => { await p.click(`${HP} [data-q="sel"]:has-text("${id}")`); await p.waitForSelector(`${HP} [data-q-palette]`); };
const cliquerPalette = (p, n) => p.$eval(`${HP} [data-q-palette] [data-q-carton="${n}"]`, (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));

await v('Quai piles : à l’étape ③, aucun texte, titre ni attribut ne nomme un pool ou un dégât — dessin et zoom, cinq piles, quatre vues ; le zoom dit « Palette 9 », jamais la hauteur', async () => {
  const p = await pagePiles();
  const fautes = [];
  for (const id of ['P1', 'P2', 'P3', 'P4', 'P5']) {
    await ongletPile(p, id);
    for (let rot = 0; rot < 4; rot++) {
      await cliquerPalette(p, { P3: 6, P4: 9, P5: 11 }[id] || 9);
      const t = await p.evaluate((H) => {
        const zones = [document.querySelector(`${H} [data-q-palette]`), document.querySelector(`${H} .quai-zoom`)];
        const L = [];
        zones.forEach((z) => {
          L.push(z.textContent);
          z.querySelectorAll('*').forEach((el) => [...el.attributes].forEach((a) => {
            if (a.name === 'title' || /^data-|^aria-|^class$|^id$/.test(a.name)) L.push(`${a.name}=${a.value}`);
            if (a.name.startsWith('data-')) L.push(a.name);
          }));
          L.push(String(z.querySelectorAll('title').length ? 'TITLE' : ''));
        });
        return L.join(' | ');
      }, HP);
      const m = t.match(NOMME) || t.match(/TITLE/);
      if (m) fautes.push(`${id}, vue ${rot} : « ${m[0]} » dans ${t.slice(Math.max(0, m.index - 60), m.index + 40)}`);
      await p.click(`${HP} [data-q="tourner"]:not([data-sens])`);
    }
  }
  egal(fautes, [], 'rien ne nomme le pool ni le dégât');
  // Le zoom dit le numéro de la palette sur la hauteur réelle de la pile ; le dessin a une palette cliquable par palette sur la pile.
  await ongletPile(p, 'P2');
  egal(await p.$$eval(`${HP} [data-q-palette] [data-q-carton]`, (L) => L.length), 14, 'P2 : 14 palettes cliquables');
  await cliquerPalette(p, 9);
  egal(await p.$eval(`${HP} [data-q-etiquette] .quai-etiq-l1 span`, (s) => s.textContent.replace(/\s+/g, ' ').trim()), 'Palette 9', 'le zoom de P2 : le numéro, sans la hauteur');
  // La hauteur (14) se lit en cliquant la palette du haut, et nulle part dans le zoom d'une autre palette.
  vrai(!/\b14\b/.test(await p.$eval(`${HP} [data-q-etiquette]`, (z) => z.textContent)), 'le zoom de la palette 9 ne dit pas 14');
  await cliquerPalette(p, 14);
  egal(await p.$eval(`${HP} [data-q-etiquette] .quai-etiq-l1 span`, (s) => s.textContent.replace(/\s+/g, ' ').trim()), 'Palette 14', 'la palette du haut de P2 dit 14');
  vrai(await p.$(`${HP} [data-q-etiquette] svg[data-q-proche]`), 'la palette se voit de près dans le zoom');
  await p.close();
});

await v('Quai piles : le dégât de P4 (n° 9, face arrière) se voit de près aux vues 1 et 2, jamais aux vues 0 et 3', async () => {
  const p = await pagePiles();
  await ongletPile(p, 'P4');
  const vus = [];
  for (let rot = 0; rot < 4; rot++) {
    await cliquerPalette(p, 9);
    // Le bois frais d'une cassure (#ecd7ac) n'est dessiné que pour un dégât visible : c'est ce que voit l'élève.
    vus.push(await p.$eval(`${HP} svg[data-q-proche]`, (s) => (s.innerHTML.match(/#ecd7ac/g) || []).length > 0 ? 1 : 0));
    await p.click(`${HP} [data-q="tourner"]:not([data-sens])`);
  }
  egal(vus.join(''), '0110', 'le dégât de la face N (arrière) : vues du côté droit et de l’arrière');
  await p.close();
});

await v('Quai piles : accords au féminin partout (« palettes manquantes », « abîmées », « comptées », « cette pile ») ; sans feminin, rien ne change', async () => {
  const L = quaiMod.libellesMotifs;
  egal(L({ unite: { un: 'palette', des: 'palettes', feminin: true }, libelles: { avarie: { adjectif: 'abîmé' } } }).avarie, 'Palettes abîmées', 'le motif par défaut, au féminin, avec l’adjectif déclaré');
  egal(L({ unite: { un: 'caisse', des: 'caisses', feminin: true } }).avarie, 'Caisses endommagées', 'au féminin sans adjectif déclaré');
  egal(L({}).avarie, 'Cartons endommagés', 'sans unité : le texte d’aujourd’hui');
  egal(L({ unite: 'fûts' }).avarie, 'Fûts endommagés', 'une unité masculine : inchangée');
  egal(quaiMod.uniteQuai({ unite: { un: 'palette', des: 'palettes', feminin: true } }), { un: 'palette', des: 'palettes', fem: true }, 'l’unité féminine');
  egal(quaiMod.uniteQuai({ unite: { un: 'fût', des: 'fûts' } }), { un: 'fût', des: 'fûts' }, 'sans feminin : l’unité d’avant, sans clé de plus');
  const J = quaiMod.jalonsQuai({}, QPILE([PP({ id: 'P1', abimee: { 3: 'S' } }), PP({ id: 'P2', hauteur: 13 })])).L, at = (id) => J.find((l) => l.id === id).attendu;
  egal(at('P1-reserve'), 'P1 CHEP-1210 : acceptée sous réserve — 1 palette abîmée (à réparer).', '1 palette abîmée');
  egal(at('P2-reserve'), 'P2 CHEP-1210 : acceptée sous réserve — manque 2 palettes (BC 15, reçu 13).', 'manque 2 palettes');
  // À l'écran : les étapes ③ et ④ du quai de la page d'essai ne disent jamais un accord masculin de l'unité.
  const p = await pagePiles();
  const t3 = await p.$eval(HP, (h) => h.innerText);
  vrai(/Palettes abîmées/.test(t3) && /Palettes manquantes/.test(t3) && /Palettes d’un autre pool/.test(t3), 'la fiche de contrôle : abîmées, manquantes, d’un autre pool');
  vrai(/palettes comptées sur cette pile/.test(t3), 'le comptage : « palettes comptées sur cette pile »');
  await p.click(`${HP} #qDec-reserves`); await p.click(`${HP} #qMot-avarie`); await p.click(`${HP} #qMot-manquant`); await p.click(`${HP} [data-q="valider"]`);
  for (const id of ['P2', 'P3', 'P4', 'P5']) { await ongletPile(p, id); await p.click(`${HP} #qDec-accepter`); await p.click(`${HP} [data-q="valider"]`); }
  await p.click(`${HP} [data-q="vers4"]`); if (await p.$(`${HP} .quai-arme`)) await p.click(`${HP} [data-q="vers4"]`);
  const t4 = await p.$eval(HP, (h) => h.innerText);
  vrai(/Nombre de palettes abîmées/.test(t4) && /Nombre de palettes manquantes/.test(t4), 'les champs chiffrés de la réserve, au féminin');
  // (Pas de \b après une lettre accentuée : en JavaScript, « é » n'est pas une lettre pour \b. On regarde la lettre qui suit.)
  const masc = (t3 + t4).match(/palettes? (?:endommagés?|manquants?|comptés?|concernés?|repris|abîmés?)(?![\wàâçéèêëîïôûùüÿœ])|(?<![\wàâçéèêëîïôûùüÿœ])(?:un|ce|cet) palette/gi);
  egal(masc, null, 'aucun accord masculin de l’unité');
  await p.close();
});

await v('Quai piles : pas de « Refuser » ; la réserve « d’un autre pool » se chiffre (1 est juste, « LPR » ne l’est pas) ; le bon de collecte dit « BC »', async () => {
  const p = await pagePiles();
  egal(await p.$$eval(`${HP} [data-q="dec"]`, (L) => L.map((b) => b.dataset.v)), ['accepter', 'reserves'], 'deux décisions seulement');
  const decider = async (id, mot) => { await ongletPile(p, id); await p.click(`${HP} #qDec-reserves`); for (const m of mot) await p.click(`${HP} #qMot-${m}`); await p.click(`${HP} [data-q="valider"]`); };
  await ongletPile(p, 'P1'); await p.click(`${HP} #qDec-accepter`); await p.click(`${HP} [data-q="valider"]`);
  await decider('P2', ['manquant']); await decider('P3', ['produit']); await decider('P4', ['avarie']); await decider('P5', ['manquant', 'produit']);
  await p.click(`${HP} [data-q="vers4"]`); if (await p.$(`${HP} .quai-arme`)) await p.click(`${HP} [data-q="vers4"]`);
  const lib = await p.$eval(`${HP} [data-q-res="P3"]`, (i) => ({ lib: i.closest('label').textContent.replace(/\s+/g, ' ').trim(), mode: i.getAttribute('inputmode') }));
  egal(lib, { lib: 'Nombre de palettes d’un autre pool', mode: 'numeric' }, 'le champ de P3');
  await p.fill(`${HP} [data-q-res="P2"]`, '1'); await p.fill(`${HP} [data-q-res="P3"]`, 'LPR'); await p.fill(`${HP} [data-q-res="P4"]`, '2');
  await p.fill(`${HP} [data-q-res="P5"]`, '1'); await p.fill(`${HP} [data-q-res2="P5"]`, '1');
  await p.click(`${HP} [data-q="ecrire"]`);
  const ok = () => p.evaluate(async () => { const Q = await import('/core/types/quai.js'); return Object.fromEntries(Q.jalonsQuai(window.__piles.db(), window.__piles.Q).L.filter((l) => /-reserve$/.test(l.id)).map((l) => [l.id, l.ok])); });
  egal(await ok(), { 'P2-reserve': true, 'P3-reserve': false, 'P4-reserve': true, 'P5-reserve': true }, '« LPR » n’est pas un nombre : la réserve de P3 est fausse');
  await p.fill(`${HP} [data-q-res="P3"]`, '1'); await p.click(`${HP} [data-q="ecrire"]`);
  egal(await ok(), { 'P2-reserve': true, 'P3-reserve': true, 'P4-reserve': true, 'P5-reserve': true }, 'avec 1 : les quatre réserves sont justes');
  const t = await p.$eval(HP, (h) => h.innerText);
  vrai(/P3 CHEP-1210 : acceptée sous réserve — 1 palette d’un autre pool\./.test(t), 'la ligne écrite sur le bon');
  vrai(/Bon de collecte n° BC-27-0119/.test(t) && /Écrire les réserves sur le BC|Réécrire les réserves/.test(t) && /\(BC 15, reçu 14\)/.test(t), 'le document se nomme « Bon de collecte », abrégé « BC »');
  vrai(!/\bBL\b/.test(t), 'plus aucun « BL » à l’écran');
  await p.close();
});

await v('Quai piles : jouable de bout en bout — ② le cariste sort cinq piles, ③ ④ jusqu’à la signature, tous les jalons justes', async () => {
  const p = await pagePiles({ controle: false });
  await p.click(`${HP} [data-q="decharger"]`);
  await p.waitForSelector(`${HP} [data-q="vers3"]:not([disabled])`);
  // (Une pile qui passe le mur est dessinée en deux morceaux, dedans et dehors : d'où le Set.)
  egal(await p.$$eval(`${HP} [data-q-scene2] [data-iso-pal]`, (L) => [...new Set(L.map((g) => g.getAttribute('data-iso-pal')))].sort()), ['P1', 'P2', 'P3', 'P4', 'P5'], '② : les cinq piles au décor');
  vrai(/Les 5 piles sont en zone de réception/.test(await p.$eval(HP, (h) => h.innerText)), 'la légende parle de piles');
  await p.click(`${HP} [data-q="vers3"]`);
  const JUSTE = { P1: [15, 'accepter', []], P2: [14, 'reserves', ['manquant']], P3: [15, 'reserves', ['produit']], P4: [15, 'reserves', ['avarie']], P5: [14, 'reserves', ['manquant', 'produit']] };
  for (const [id, [n, dec, mot]] of Object.entries(JUSTE)) {
    await ongletPile(p, id);
    await p.fill(`${HP} #qCompte`, String(n)); await p.press(`${HP} #qCompte`, 'Enter');
    await p.click(`${HP} #qDec-${dec}`); for (const m of mot) await p.click(`${HP} #qMot-${m}`);
    await p.click(`${HP} [data-q="valider"]`);
  }
  await p.click(`${HP} [data-q="vers4"]`); if (await p.$(`${HP} .quai-arme`)) await p.click(`${HP} [data-q="vers4"]`);
  for (const [sel, v1] of [['[data-q-res="P2"]', '1'], ['[data-q-res="P3"]', '1'], ['[data-q-res="P4"]', '2'], ['[data-q-res="P5"]', '1'], ['[data-q-res2="P5"]', '1']]) await p.fill(`${HP} ${sel}`, v1);
  await p.click(`${HP} [data-q="ecrire"]`);
  await p.click(`${HP} [data-q="signer"]`);
  const J = await p.evaluate(async () => { const Q = await import('/core/types/quai.js'); return Q.jalonsQuai(window.__piles.db(), window.__piles.Q).L.filter((l) => l.compte).map((l) => [l.id, l.ok]); });
  egal(J.filter(([, ok]) => !ok), [], 'aucun jalon faux');
  egal(J.length, 17, '17 jalons comptés : 5 comptages, 5 décisions, 4 réserves, la mention, la signature, la rentrée');
  await p.close();
});

// Le chauffeur signe : il ne « recharge les palettes refusées » que s'il y en a (18/10/2026, vu sur ENT-9.2 : des piles de vides
// acceptées sous réserve, rien de refusé). Ici le contrôle des cinq palettes n'en refuse aucune (P2 et P3 sous réserve).
await v('Quai : à la signature, le chauffeur ne parle de « palettes refusées » que s’il y en a — sans refus, « C’est signé. J’y vais. »', async () => {
  const p = await pageDeux(DEUX({ commence: 'controle' }));
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  await controlerCinq(p);
  await p.click(`${HOTE} [data-q="ecrire"]`);
  await p.click(`${HOTE} [data-q="signer"]`);
  const parole = await p.$eval(`${HOTE} [data-q-parole]`, (n) => n.textContent.replace(/\s+/g, ' ').trim());
  vrai(/C’est signé\. J’y vais\. Bonne journée !/.test(parole), 'la parole du chauffeur signé : ' + parole);
  vrai(!/refusées/.test(parole), 'sans palette refusée, le chauffeur parle de « palettes refusées » : ' + parole);
  // Ce qui reste : la décision de chaque palette est bien rangée, aucune n'est « refuser ».
  const dec = await p.evaluate(() => Object.values(window.__qs.db.quais).map((q) => Object.values(q.palettes || {}).map((s) => s.decision)));
  vrai(dec.flat().length >= 5 && !dec.flat().includes('refuser'), 'décisions rangées : ' + JSON.stringify(dec));
  await p.close();
});

/* ------------------------------------------- la palette de SACS (`forme: 'sacs'`, Transports Pelleau, 19/10/2026) */
// Décision de Tristan du 19/10/2026 (« dessiner les sacs ») : une palette de cartons (mêmes champs, mêmes comptes) dessinée en sacs par
// `paletteSacs`. Cas AJOUTÉS (aucun cas existant touché). Ce qui vaut son prix : le quai dessine bien des SACS partout où il dessinait la
// palette (② ③ ④, dépose), le motif `produit` lit l'étiquette d'un sac, un sac percé ne se voit que de deux vues, la page ne balise aucun
// dégât, et un quai mêlé de sacs et de cartons se dépose par client. Les sacs se reconnaissent dans le DOM par `data-iso-sac` (la forme,
// jamais un état). Valeurs attendues écrites à la main.

// Le kit : une palette de 5 × 2 × 4 sacs (comme Agri-Kerlann), sa grille au format de `paletteCartons`.
await v('Quai sacs : paletteSacs — un coussin par sac présent (data-iso-sac), sable sans vert ni teinte de carton, sac percé vu de deux rotations, coupe au mur', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 150, origine: [470, 190] });
    const pal = (manque = [], ab = {}) => {
      const cartons = [];
      for (let k = 0; k < 4; k++) for (let j = 0; j < 2; j++) for (let i = 0; i < 5; i++) {
        const c = `${i},${j},${k}`;
        cartons.push({ i, j, k, no: 1 + k * 10 + j * 5 + i, absent: manque.includes(c), abime: ab[c] || null, etiq: { ref: 'AK-31205' } });
      }
      return { nW: 5, nD: 2, nL: 4, cartons };
    };
    const n = (s, re) => (s.match(re) || []).length;
    const S = K.paletteSacs(I, pal(), 0, 0, 0, {});
    const couleurs = [...new Set(S.match(/#[0-9a-f]{6}\b/gi) || [])];
    const vert = couleurs.filter((c) => { const [R, G, B] = [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16)); return G > R + 8 && G > B + 8; });
    const perce = (o) => [0, 1, 2, 3].map((rot) => { const s = K.paletteSacs(I, pal([], { '4,1,2': 'S' }), 0, 0, rot, o); return [n(s, /data-iso-avarie/g), n(s, /#3a2817/g) > 0]; });
    return {
      haut: K.HAUT_SAC, sacs: n(S, /data-iso-sac/g), sacsManque: n(K.paletteSacs(I, pal(['4,0,3', '0,1,3']), 0, 0, 0, {}), /data-iso-sac/g),
      courbes: n(S, / Q\d/g) > 0, carton: ['#d9b27a', '#c99c5f', '#b48549', '#c79b62'].filter((c) => S.includes(c)), bois: S.includes('#c9a273'), vert,
      pasCarton: S !== K.paletteCartons(I, pal(), 0, 0, 0, {}),
      perce: perce({}), perceSansBalise: perce({ balises: false }), sansDents: perce({ dents: false }),
      etiquettes: [n(S, /#fbfbf8/g) > 0, n(K.paletteSacs(I, pal(), 0, 0, 0, { labels: false }), /#fbfbf8/g)],
      eclaire: [n(K.paletteSacs(I, pal(), 0, 0, 0, { sel: 6 }), /#f0e6c8/g) > 0, n(S, /#f0e6c8/g)],
      derriereMur: K.paletteSacs(I, pal(), 0, 1, 0, { yMax: 0 }), clicables: n(K.paletteSacs(I, pal(['0,0,0']), 0, 0, 0, { attrs: (c) => `data-s="${c.no}"` }), /data-s="/g),
    };
  });
  egal(r.haut, 0.2, 'un sac fait 20 cm de haut');
  egal([r.sacs, r.sacsManque], [40, 38], 'un dessus de sac par sac présent : 40, puis 38 avec deux manquants');
  vrai(r.courbes, 'les arêtes des sacs sont bombées (courbes)');
  egal(r.carton, [], 'aucune teinte de carton ni de ruban adhésif');
  vrai(r.bois, 'la palette de bois est celle des cartons');
  egal(r.vert, [], 'aucun vert');
  vrai(r.pasCarton, 'le dessin n’est pas celui de paletteCartons');
  // La face S se voit de l'avant (rotation 0) et, palette tournée de trois quarts de tour, sur le côté droit (rotation 3).
  egal(r.perce, [[1, true], [0, false], [0, false], [1, true]], 'le sac percé (face S) : rotations 0 et 3, balisé');
  egal(r.perceSansBalise, [[0, true], [0, false], [0, false], [0, true]], 'balises: false : la déchirure est dessinée, jamais balisée');
  egal(r.sansDents, [[0, false], [0, false], [0, false], [0, false]], 'dents: false : pas de déchirure');
  egal(r.etiquettes, [true, 0], 'les étiquettes blanches, et aucune avec labels: false');
  egal(r.eclaire, [true, 0], 'le sac éclairé est plus clair, aucun sans sel');
  egal(r.derriereMur, '', 'une palette entièrement derrière le plan du mur : rien n’est dessiné');
  egal(r.clicables, 39, 'chaque sac présent a son groupe cliquable');
});

await v('Quai sacs : verifierQuai — `forme: \'sacs\'` acceptée avec unite et rendu iso ; sans unite, hors iso, dimensions fausses : refusé ; une forme inconnue l’est toujours', async () => {
  const PS = (o = {}) => Object.assign({ id: 'P1', forme: 'sacs', ref: 'AK-31205', nom: 'Terreau', W: 5, D: 2, L: 4, bl: 40, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
    etiq: { ref: 'AK-31205', nom: 'TERREAU', poids: '1 sac', lot: 'L-1' } }, o);
  const QS = (ps, m = {}) => QFUT(ps, Object.assign({ unite: 'sacs' }, m));
  egal(quaiMod.verifierQuai(QS([PS()])), [], 'une palette de sacs');
  egal(quaiMod.verifierQuai(QS([PS(), { id: 'P2', ref: 'X', bl: 8, W: 2, D: 2, L: 2, manque: [], avarie: {}, etiq: {} }], { unite: { un: 'colis', des: 'colis' } })), [], 'sacs et cartons mêlés, unite « colis »');
  egal(quaiMod.verifierQuai(QS([PS({ manque: ['4,0,3'], avarie: { '0,1,0': [0, 1] }, bl: 40, attendu: 'reserves', motifAttendu: 'avarie' })], { aides: { regleCouches: true, detailComptage: true } })), [],
    'manques, sac percé et aides de couches : comme pour des cartons');
  const fautes = [];
  for (const [nom, mute, motif] of [
    ['sans unité', (Q) => { delete Q.unite; }, /une palette de sacs demande `unite`/],
    ['sans rendu iso', (Q) => { delete Q.rendu; }, /palette de sacs se dessine sur le quai iso/],
    ['W à 0', (Q) => { Q.camions[0].palettes[0].W = 0; }, /« W » doit être un nombre entier/],
    ['L décimal', (Q) => { Q.camions[0].palettes[0].L = 2.5; }, /« L » doit être un nombre entier/],
    ['D absent', (Q) => { delete Q.camions[0].palettes[0].D; }, /« D » doit être un nombre entier/],
    ['forme « sac » (au singulier)', (Q) => { Q.camions[0].palettes[0].forme = 'sac'; }, /forme « sac » inconnue \(les valeurs sont 'fut', 'pile' et 'sacs'/],
  ]) {
    const Q = QS([PS()]); mute(Q);
    const E = quaiMod.verifierQuai(Q);
    if (!E.some((m) => motif.test(m))) fautes.push(`« ${nom} » : ${E.join(' | ') || 'pas refusé'}`);
  }
  if (fautes.length) throw new Error(fautes.join(' ; '));
});

// Un quai mêlé : P1 une palette de sacs (terreau commandé, ENGRAIS sur l'étiquette : motif produit), P2 une palette de cartons conforme.
const PSAC = { id: 'P1', forme: 'sacs', ref: 'AK-31205', nom: 'Terreau universel, sacs de 40 L', W: 5, D: 2, L: 2, bl: 20, manque: [], avarie: {}, attendu: 'reserves', motifAttendu: 'produit',
  etiq: { ref: 'AK-40210', nom: 'ENGRAIS GRANULÉ — SACS DE 25 KG', poids: '1 sac de 25 kg', lot: 'AK-26-0512' } };
const PCAR = { id: 'P2', ref: 'AV-20418', nom: 'Biscuits au beurre', W: 2, D: 2, L: 2, bl: 8, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
  etiq: { ref: 'AV-20418', nom: 'BISCUITS AU BEURRE', poids: '1 carton', lot: 'AV-1' } };
const EXTRA_SACS = { unite: { un: 'colis', des: 'colis' }, libelles: { avarie: { nom: 'Colis endommagés' } } };

await v('Quai sacs : ② ③ ④ — les sacs dessinés partout, cliquables, l’étiquette du sac lue au zoom ; le motif produit (référence lue sur l’étiquette) juste jusqu’au bilan', async () => {
  const p = await pageAvec({ palettes: [PSAC, PCAR], extra: EXTRA_SACS });
  await jusquaEtape2(p);
  const sc2 = await p.$eval(`${HOTE} [data-q-scene2]`, (s) => ({ p1: s.querySelectorAll('[data-iso-pal="P1"] [data-iso-sac]').length, tous: s.querySelectorAll('[data-iso-sac]').length }));
  egal(sc2, { p1: 20, tous: 20 }, '② : les 20 sacs de P1, et aucun sac ailleurs (P2 reste en cartons)');
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  const PAL3 = `${HOTE} [data-q-palette]`;
  const compte = (sel) => p.$$eval(`${PAL3} ${sel}`, (L) => L.length);
  egal([await compte('[data-q-carton]'), await compte('[data-iso-sac]')], [20, 20], '③ P1 : vingt sacs, chacun cliquable');
  egal(await p.$eval(PAL3, (s) => s.getAttribute('aria-label')), 'Palette P1 : clique sur un colis pour lire son étiquette', 'l’étiquette lue par un lecteur d’écran');
  // Un sac bas : celui d'au-dessus couvre son dessus, on le clique par sa face avant (ici, le clic est envoyé au sac lui-même).
  await p.locator(`${PAL3} [data-q-carton="13"]`).dispatchEvent('click');
  await p.waitForSelector(`${HOTE} [data-q-etiquette]`);
  egal(await p.$eval(`${HOTE} [data-q-etiquette] .quai-etiq-ref`, (n) => n.textContent.trim()), 'AK-40210', 'l’étiquette du sac dit la référence livrée (engrais)');
  egal(await p.$eval(`${HOTE} [data-q-etiquette] .quai-etiq-l1 span`, (n) => n.textContent.replace(/\s+/g, ' ').trim()), 'Colis 13 / 20', 'le numéro du sac');
  vrai(/ENGRAIS GRANULÉ/.test(await p.$eval(`${HOTE} [data-q-etiquette]`, (n) => n.textContent)), 'la désignation de l’étiquette');
  await p.click(`${HOTE} [data-q="sel"][data-n="1"]`);
  egal([await compte('[data-q-carton]'), await compte('[data-iso-sac]')], [8, 0], '③ P2 : huit cartons, aucun sac');
  const valide = async (n, nb, decision, motif) => {
    await p.click(`${HOTE} [data-q="sel"][data-n="${n}"]`);
    await p.fill(`${HOTE} #qCompte`, String(nb)); await p.press(`${HOTE} #qCompte`, 'Enter');
    await p.click(`${HOTE} #qDec-${decision}`);
    if (motif) await p.click(`${HOTE} #qMot-${motif}`);
    await p.click(`${HOTE} [data-q="valider"]`);
  };
  await valide(0, 20, 'reserves', 'produit');
  await valide(1, 8, 'accepter');
  await p.click(`${HOTE} [data-q="vers4"]`); await p.click(`${HOTE} [data-q="vers4"]`);
  egal(await p.$eval(`${HOTE} [data-q-cf]`, (s) => s.querySelectorAll('[data-iso-sac]').length), 20, '④ : les 20 sacs de P1 en zone de réception');
  await p.fill(`${HOTE} #qRes-P1`, 'AK-40210');
  await p.click(`${HOTE} [data-q="ecrire"]`);
  await p.click(`${HOTE} [data-q="signer"]`);
  await p.click(`${HOTE} [data-q="clore"]`);
  await p.waitForSelector(`${HOTE} [data-q-bilan]`);
  egal(await jalonsPalettes(p), { 'P1-comptage': true, 'P1-decision': true, 'P2-comptage': true, 'P2-decision': true, 'P1-reserve': true }, 'comptage, décision et réserve « produit » justes');
  const ligne = await p.evaluate(async () => { const Q = await import('/core/types/quai.js'); return Q.jalonsQuai(window.__qs.db, window.__qs.Q).L.find((l) => l.id === 'P1-reserve').fait; });
  vrai(/AK-40210/.test(ligne), `la réserve écrite nomme la référence lue sur le sac : ${ligne}`);
  egal(await p.$$eval(`${HOTE} [data-iso-avarie]`, (L) => L.length), 0, 'aucun dégât balisé dans la page');
  await p.close();
});

await v('Quai sacs : ③ — un sac percé se voit devant et à droite (face S), jamais aux deux autres vues ; le zoom dit « percé », sans balise de dégât', async () => {
  const perce = Object.assign({}, PSAC, { etiq: Object.assign({}, PSAC.etiq, { ref: 'AK-31205' }), avarie: { '4,1,1': [0, 1] }, motifAttendu: 'avarie' });
  const p = await pageAvec({ palettes: [perce], extra: EXTRA_SACS });
  await jusquaEtape2(p);
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  const PAL3 = `${HOTE} [data-q-palette]`;
  const vues = [];
  for (let k = 0; k < 4; k++) {
    vues.push([await p.$eval(PAL3, (s) => s.innerHTML.includes('#3a2817')), await p.$$eval(`${HOTE} [data-iso-avarie]`, (L) => L.length)]);
    await p.click(`${HOTE} [data-q="tourner"]:not([data-sens])`);
  }
  egal(vues, [[true, 0], [false, 0], [false, 0], [true, 0]], 'la déchirure (terreau) : avant, côté droit, arrière, côté gauche ; jamais balisée');
  await p.locator(`${PAL3} [data-q-carton="20"]`).dispatchEvent('click');
  vrai(/Ce colis est percé sur cette face/.test(await p.$eval(`${HOTE} [data-q-etat-carton]`, (n) => n.textContent)), 'vu de l’avant : « Ce colis est percé »');
  await p.click(`${HOTE} [data-q="tourner"]:not([data-sens])`);
  vrai(/intact/.test(await p.$eval(`${HOTE} [data-q-etat-carton]`, (n) => n.textContent)), 'tourné d’un quart : intact');
  await p.close();
});

await v('Quai sacs : la dépose par client avec sacs et cartons mêlés (page d’essai, partie 4 bis) — P3 en sacs, posée en AK1 avec ses sacs ; les autres en cartons ; tout juste', async () => {
  const p = await ctxS.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  await p.goto(`${BASE}outils/essai-quai-inspection.html#depose-client`);
  const H = '[data-hote-client]';
  await p.waitForSelector(`${H} .quai-stepper`);
  if (await p.locator(`${H} [data-q="passer1"]`).isVisible()) await p.click(`${H} [data-q="passer1"]`);
  await p.click(`${H} [data-q="decharger"]`);
  await p.waitForSelector(`${H} [data-q-phase="choix"]`);
  const clic = async (c) => {
    const n = await p.locator(`${H} [data-iso-posee]`).count();
    await p.click(`${H} [data-q="depose"][data-c="${c}"]`);
    await p.waitForFunction(([s, n]) => document.querySelectorAll(s).length === n + 1, [`${H} [data-iso-posee]`, n]);
  };
  await clic('AV1');
  await p.waitForSelector(`${H} [data-q-phase="choix"]`);
  vrai(await p.$$eval(`${H} [data-iso-pal="P3"] [data-iso-sac]`, (L) => L.length) > 0, 'pause « choix » : la palette P3 qui attend est dessinée en sacs');
  await clic('AK1'); await clic('AV2'); await clic('AK2');
  const parCase = await p.$$eval(`${H} [data-iso-posee]`, (L) => Object.fromEntries(L.map((g) => [g.dataset.isoCase, g.querySelectorAll('[data-iso-sac]').length])));
  egal(parCase, { AV1: 0, AV2: 0, AK1: 24, AK2: 0 }, 'P3 posée en AK1 avec ses 24 sacs (4 × 2 × 3) ; les trois autres en cartons');
  const J = await p.evaluate(async () => { const Q = await import('/core/types/quai.js'); return Q.jalonsQuai(window.__deposeClient.db(), window.__deposeClient.Q).L.filter((l) => /^depose-/.test(l.id)).map((l) => [l.id, l.ok]); });
  egal(Object.fromEntries(J), { 'depose-P1': true, 'depose-P2': true, 'depose-P3': true, 'depose-P4': true }, 'les quatre jalons de dépose sont justes');
  await p.close();
});

/* ---- la conservation lue sur l'étiquette (`conservation` sur une palette, 19/10/2026, demande d'ENT-10.11) */
const CONS = '4 à 8 °C, jamais au gel';
// Le zoom d'une palette de l'étape ③ : clic sur l'unité n, puis les lignes « Conservation » de l'étiquette affichée.
async function lignesConservation(p, n) {
  await p.locator(`${HOTE} [data-q-palette] [data-q-carton="${n}"]`).dispatchEvent('click');
  await p.waitForSelector(`${HOTE} [data-q-etiquette]`);
  return p.$$eval(`${HOTE} [data-q-etiquette] [data-q-conservation]`, (L) => L.map((x) => x.textContent.trim()));
}
await v('Quai conservation : la ligne « Conservation » de l’étiquette au zoom (sacs, cartons, fûts, pile), absente sans le champ', async () => {
  const p = await pageAvec({ palettes: [Object.assign({}, PSAC, { conservation: CONS }), PCAR, Object.assign({}, PCAR, { id: 'P3', conservation: 'À conserver au sec' })], extra: EXTRA_SACS });
  await jusquaEtape2(p);
  await p.click(`${HOTE} [data-q="vers3"]`);
  await p.waitForSelector(`${HOTE} [data-q-palette]`);
  egal(await lignesConservation(p, 13), ['Conservation : 4 à 8 °C, jamais au gel'], 'P1 (sacs) : la ligne, sur sa propre ligne de l’étiquette');
  const etiq = await p.$eval(`${HOTE} [data-q-etiquette]`, (n) => ({ div: n.querySelector('[data-q-conservation]').tagName, suite: n.querySelector('[data-q-conservation]').nextElementSibling.className, lot: /Lot AK-26-0512/.test(n.textContent) }));
  egal(etiq, { div: 'DIV', suite: 'quai-code', lot: true }, 'la ligne est un bloc à part, avant le code-barres, et le lot est toujours là');
  await p.click(`${HOTE} [data-q="sel"][data-n="1"]`);
  egal(await lignesConservation(p, 1), [], 'P2 (cartons, sans le champ) : pas de ligne');
  vrai(/Cde|Lot AV-1/.test(await p.$eval(`${HOTE} [data-q-etiquette]`, (n) => n.textContent)), 'P2 : l’étiquette est bien affichée (le test ne passe pas par défaut)');
  await p.click(`${HOTE} [data-q="sel"][data-n="2"]`);
  egal(await lignesConservation(p, 1), ['Conservation : À conserver au sec'], 'P3 (cartons, avec le champ) : la ligne');
  await p.close();
  // Fûts : P1 avec le champ, P2 sans.
  const f = await pageAvec({ palettes: [Object.assign({}, PALS[0], { conservation: CONS }), PALS[1]] });
  await jusquaEtape2(f);
  await f.click(`${HOTE} [data-q="vers3"]`);
  await f.waitForSelector(`${HOTE} [data-q-palette]`);
  egal(await lignesConservation(f, 2), ['Conservation : 4 à 8 °C, jamais au gel'], 'fûts : la ligne');
  await f.click(`${HOTE} [data-q="sel"][data-n="1"]`);
  egal(await lignesConservation(f, 2), [], 'fûts sans le champ : pas de ligne');
  await f.close();
  // Pile de palettes vides : P1 avec le champ.
  const pl = await pageAvec({ palettes: [PP({ conservation: CONS })], extra: { unite: { un: 'palette', des: 'palettes', feminin: true }, decisions: ['accepter', 'reserves'], motifs: ['manquant', 'avarie', 'produit'] } });
  await jusquaEtape2(pl);
  await pl.click(`${HOTE} [data-q="vers3"]`);
  await pl.waitForSelector(`${HOTE} [data-q-palette]`);
  egal(await lignesConservation(pl, 3), ['Conservation : 4 à 8 °C, jamais au gel'], 'pile : la ligne');
  await pl.close();
});

await v('Quai conservation : verifierQuai — un texte de 60 signes au plus, sur toute forme ; un nombre, un texte vide ou trop long sont refusés ; sans le champ, rien ne change', async () => {
  const PCx = (o = {}) => Object.assign({}, PCAR, o);
  const QC = (ps, m = {}) => QFUT(ps, m);
  const soixante = 'x'.repeat(60);
  egal(quaiMod.verifierQuai(QC([PCx({ conservation: CONS })])), [], 'cartons avec le champ');
  egal(quaiMod.verifierQuai(QC([PCx({ conservation: soixante })])), [], 'exactement 60 signes : accepté');
  egal(quaiMod.verifierQuai(QC([PCx()])), [], 'sans le champ : accepté');
  egal(quaiMod.verifierQuai(QC([PF({ conservation: CONS })], { unite: 'fûts' })), [], 'fût avec le champ');
  egal(quaiMod.verifierQuai(QC([PSAC, Object.assign({}, PSAC, { id: 'P2', conservation: CONS })], { unite: { un: 'colis', des: 'colis' } })), [], 'sacs avec le champ');
  egal(quaiMod.verifierQuai(QPILE([PP({ conservation: CONS })])), [], 'pile avec le champ');
  const fautes = [];
  for (const [nom, p] of [
    ['cartons, un nombre', PCx({ conservation: 5 })],
    ['cartons, 61 signes', PCx({ conservation: soixante + 'x' })],
    ['cartons, vide', PCx({ conservation: '' })],
    ['cartons, espaces', PCx({ conservation: '   ' })],
    ['cartons, null', PCx({ conservation: null })],
    ['fût, un objet', PF({ conservation: { t: 4 } })],
    ['sacs, trop long', Object.assign({}, PSAC, { conservation: soixante + 'x' })],
  ]) {
    const E = quaiMod.verifierQuai(QC([p], { unite: { un: 'colis', des: 'colis' } }));
    if (!E.some((m) => /« conservation » doit être un texte de 60 signes au plus/.test(m))) fautes.push(`« ${nom} » : ${E.join(' | ') || 'pas refusé'}`);
  }
  const Ep = quaiMod.verifierQuai(QPILE([PP({ conservation: 7 })]));
  if (!Ep.some((m) => /« conservation » doit être/.test(m))) fautes.push(`pile, un nombre : ${Ep.join(' | ') || 'pas refusé'}`);
  if (fautes.length) throw new Error(fautes.join(' ; '));
});

await v('Quai iso : la page d’essai ne demande rien hors du site et ne plante pas', async () => {
  const hors = await pe.evaluate(() => performance.getEntriesByType('resource').map((e) => e.name).filter((n) => !n.startsWith(location.origin)));
  egal(hors, [], 'ressources hors du site');
});

await v('Quai iso : aucune erreur JavaScript', async () => {
  egal(erreurs, [], 'erreurs JavaScript');
});

}
