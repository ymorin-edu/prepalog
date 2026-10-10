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

await v('Quai scène : point touché — le premier point déclaré de la vue ; mur et autre vue = à côté ; zones qui suivent l’état dessiné', async () => {
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
  egal(jalonsDe({ signaux: [SIG(['cabine'], { rien: 1 })] })['securite-aucun-faux'], false, 'une marque à côté');
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

await v('Quai scène : clic au centre de chaque zone, à la souris, dans les deux vues → le bon point ; le mur et l’autre vue → à côté', async () => {
  const p = await pageScene();
  const fautes = [];
  for (const [id, i, vue] of [['cabine', 0, 'dehors'], ['cabine', 1, 'dehors'], ['cale', 0, 'dehors'], ['butoirs', 0, 'dehors'], ['niveleur', 0, 'dedans'], ['lampe', 0, 'dedans']]) {
    const m = await cliquerZone(p, id, i);
    if (!m || m.point !== id) fautes.push(`${id}/${i} : point touché ${m && m.point}`);
    else if (m.vue !== vue) fautes.push(`${id} : la marque est sur la vue ${m.vue}`);
  }
  // Le mur de la façade (entre les portes 2 et 3, hors de toute zone) : à côté.
  await allerVue(p, 'dehors');
  const mur = await p.evaluate(async () => { const K = await import('/core/iso.js'); return K.projection({ unite: 54, origine: [330, 150] }).P(5.5, 0, 1.4); });
  await cliquerViewBox(p, mur[0], mur[1]);
  let M = (await secQ(p)).marques;
  if (M[M.length - 1].point !== null) fautes.push(`le mur touche « ${M[M.length - 1].point} »`);
  // Le niveleur ne se touche que dedans : ses coordonnées de « dedans » cliquées dehors tombent à côté.
  const Zn = (await zonesDe(p)).find((z) => z.id === 'niveleur').rects[0];
  await cliquerViewBox(p, Zn.x + Zn.w / 2, Zn.y + Zn.h / 2);
  M = (await secQ(p)).marques;
  if (M[M.length - 1].vue !== 'dehors' || M[M.length - 1].point !== null) fautes.push(`le niveleur cliqué dehors : ${JSON.stringify(M[M.length - 1])}`);
  // Les marques gardent leur vue, leurs coordonnées arrondies au dixième, un numéro jamais réutilisé.
  M = (await secQ(p)).marques;
  egal(M.map((m) => m.n), [1, 2, 3, 4, 5, 6, 7, 8], 'numéros dans l’ordre des clics, toutes vues confondues');
  vrai(M.every((m) => m.envoi === null && Math.abs(m.x * 10 - Math.round(m.x * 10)) < 1e-6 && Math.abs(m.y * 10 - Math.round(m.y * 10)) < 1e-6), 'les marques ne sont pas envoyées / arrondies');
  if (fautes.length) throw new Error(fautes.join(' ; '));
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

await v('Quai scène : un défaut déjà réparé re-signalé, ou un point en ordre, ou une marque à côté — la réponse dit « rien » une fois', async () => {
  const p = await pageScene();
  await cliquerZone(p, 'cabine', 0); await signaler(p);
  // La cabine est réparée : son pare-brise est la seule zone qui reste ; la signaler encore n'est pas un faux signalement.
  egal((await zonesDe(p)).find((z) => z.id === 'cabine').rects.length, 1, 'la zone de la fumée a disparu avec la fumée');
  await cliquerZone(p, 'cabine', 0, true); await signaler(p);
  egal(await reponse(p), 'Nadia : « Là, je ne vois rien qui cloche. Tu me dis quand on peut décharger. »', 're-signaler un défaut réparé');
  egal(await jalonsPage(p), { 'securite-cabine': true, 'securite-niveleur': false, 'securite-aucun-faux': true }, 'pas un faux signalement');
  // Deux faux d'un coup (une cale en ordre, une marque à côté) : « rien » une seule fois.
  await cliquerZone(p, 'cale', 0);
  const mur = await p.evaluate(async () => { const K = await import('/core/iso.js'); return K.projection({ unite: 54, origine: [330, 150] }).P(5.5, 0, 1.4); });
  await cliquerViewBox(p, mur[0], mur[1]);
  await signaler(p);
  const t = await reponse(p);
  egal(t, 'Nadia : « Là, je ne vois rien qui cloche. Tu me dis quand on peut décharger. »', 'un seul « rien »');
  const s = await secQ(p);
  egal(s.signaux[2], { points: ['cale'], rien: 1, marques: [3, 4], apresArret: false }, 'le signal : la cale touchée, une marque à côté');
  egal((await jalonsPage(p))['securite-aucun-faux'], false, 'cette fois c’est un faux signalement');
  await p.close();
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
  const bb = await p.locator(SVG).boundingBox();
  await p.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height * 0.9);
  egal(await marques(), 0, 'un clic pendant la levée est ignoré');
  await p.waitForFunction(() => document.querySelectorAll('#qiScene [data-q-inspection] [data-iso-porte]').length === 0, null, { timeout: 4000 });
  await p.waitForTimeout(250);   // la dernière image de la levée
  await p.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height * 0.9);
  egal(await marques(), 1, 'la levée finie, le clic pose une marque');
  await p.close();
  // Mouvement réduit demandé : la fumée est dessinée et immobile ; et la scène répond tout de suite après « Ouvrir ».
  const r = await pageScene(ctxS);
  egal(await r.$$eval(`${SVG} .iso-fumee`, (L) => L.map((c) => [getComputedStyle(c).animationName, c.getAnimations().length])), [['none', 0], ['none', 0], ['none', 0]], 'fumée immobile mais dessinée');
  await r.click(`${HOTE} [data-q="sc-ouvrir"]`);
  const bb2 = await r.locator(SVG).boundingBox();
  await r.mouse.click(bb2.x + bb2.width * 0.5, bb2.y + bb2.height * 0.9);
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
    ['securite-aucun-faux', 'Aucun faux signalement', 'rien signalé', 'au moins un signalement, et aucun sur un point conforme ni à côté', true],
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

await v('Quai iso : la page d’essai ne demande rien hors du site et ne plante pas', async () => {
  const hors = await pe.evaluate(() => performance.getEntriesByType('resource').map((e) => e.name).filter((n) => !n.startsWith(location.origin)));
  egal(hors, [], 'ressources hors du site');
});

await v('Quai iso : aucune erreur JavaScript', async () => {
  egal(erreurs, [], 'erreurs JavaScript');
});

}
