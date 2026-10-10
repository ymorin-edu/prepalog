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
// Pour régénérer la référence (seulement si le dessin de Spartoo doit vraiment changer, avec l'accord de
// Tristan) : QUAI_ISO_REGENERER=1 node outils/test.mjs quai-iso

import fs from 'node:fs';
import path from 'node:path';

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

await v('Quai iso : la page d’essai ne demande rien hors du site et ne plante pas', async () => {
  const hors = await pe.evaluate(() => performance.getEntriesByType('resource').map((e) => e.name).filter((n) => !n.startsWith(location.origin)));
  egal(hors, [], 'ressources hors du site');
});

await v('Quai iso : aucune erreur JavaScript', async () => {
  egal(erreurs, [], 'erreurs JavaScript');
});

}
