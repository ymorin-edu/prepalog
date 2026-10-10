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

await v('Quai iso : aucune erreur JavaScript', async () => {
  egal(erreurs, [], 'erreurs JavaScript');
});

}
