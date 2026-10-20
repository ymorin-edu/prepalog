// Suite de tests de Prepalog — bloc « inspection » : la vue « Inspection du poste » (core/types/inspection.js), branchée dans le
// moteur d'entreprise au lot G-5 du chantier Transports Pelleau (19/10/2026). Brief docs/briefs/MOTEUR-inspection-poste.md,
// décisions docs/briefs/COORDINATION-pelleau.md §2. `node outils/test.mjs inspection` ne lance que ce bloc.
//
// Montée dans le vrai moteur d'entreprise, sur la séance d'essai de `outils/essai-inspection-poste.js` (`universInspection`,
// déclaration d'exemple du brief §3 : transpalette n° 1 en ordre, n° 2 fourche tordue et avertisseur muet, extincteur absent NON
// réparable, plan de circulation affiché). Les variantes (refus, copie, tirage, avertisseur qui sonne) sont faites ici, à la main.
// Les clics passent par la SOURIS, au milieu d'une zone de clic que `elementFromPoint` confirme dans la scène.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-poste-102';
const SEANCE = 'essai-inspection';
const ctxI = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctxI.newPage();
pg.setDefaultTimeout(9000);
const erreurs = [];
const hotes = new Set();
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// o : { modif (variante fautive de la déclaration), sans (aucune inspection : alerte 13), copie, seance, db (reprise), uid,
// arret (false : pas d'arrêt), sonne (l'essai porte sur le n° 1, en ordre, qui sonne), fermeture (inspectionFinie sur la messagerie),
// question (apresGeste), tire (une inspection fonction de la graine), role }.
// Rend le message d'erreur si la séance est refusée (creerEntreprise lève, ou l'hôte affiche un avis), sinon null.
const monter = (o = {}) => pg.evaluate(async (o) => {
  document.getElementById('insp-hote')?.remove();
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const { etapesInspection } = await import('/core/types/inspection.js');
  const { inspectionFinie, apresGeste } = await import('/core/declencheurs.js');
  const E = await import('/outils/essai-inspection-poste.js');
  const seance = o.seance || 'essai-inspection';
  const D = JSON.parse(JSON.stringify(E.INSPECTION_EXEMPLE));
  const pt = (id) => D.points.find((p) => p.id === id);
  // Les variantes FAUTIVES (contrôles au chargement) : chacune casse une seule règle.
  if (o.modif === 'etat-inconnu') pt('tp2-fourche').etat = 'cassee';
  if (o.modif === 'deux-points') D.points.push({ id: 'tp2-roue', objet: 'transpalette', n: 2, etat: 'roueAbimee', ok: false, lib: 'Roue abîmée' });
  if (o.modif === 'ok-incoherent') pt('plan').etat = 'absent';
  if (o.modif === 'essai-non-declare') { D.points = D.points.filter((p) => p.id !== 'tp1'); D.essai = [D.essai, { objet: 'transpalette', n: 1, resultat: 'sonne' }]; }
  if (o.modif === 'aucun-faux') pt('plan').id = 'aucun-faux';
  if (o.modif === 'objet-inconnu') pt('plan').objet = 'lampe';
  if (o.modif === 'reparable-ok') pt('tp1').reparable = false;
  if (o.modif === 'reponse-vide') D.signaler = Object.assign({}, D.signaler, { reponse: '  ' });
  if (o.reponse) D.signaler = Object.assign({}, D.signaler, { reponse: o.reponse });   // 20/10/2026 : la réponse unique du collègue
  if (o.arret === false) D.arret = false;
  if (o.sonne) D.essai = [D.essai, { objet: 'transpalette', n: 1, resultat: 'sonne' }];
  let decl = D;
  if (o.tire) {
    // Une inspection TIRÉE : le défaut du n° 2 dépend de la graine (mêmes ids, même structure pour toutes).
    decl = (graine) => { const X = JSON.parse(JSON.stringify(D)); X.points.find((p) => p.id === 'tp2-fourche').etat = graine === 'u-bob' ? 'roueAbimee' : 'fourcheTordue';
      X.points.find((p) => p.id === 'tp2-fourche').lib = graine === 'u-bob' ? 'Roue abîmée sur le n° 2' : 'Fourche tordue sur le n° 2'; return X; };
  }
  let U;
  try {
    U = E.universInspection(decl, { copie: !!o.copie, seance });
    if (o.sans) { delete U.inspection; U.etapes = []; }
    if (o.fermeture) U.fermetures = { mail: { ouvertSi: inspectionFinie(o.fermeture), message: 'Après ta prise de poste.' } };
    if (o.question) {
      U.questions = { id: seance, personnes: { Erwan: { nom: 'Erwan Essai', role: 'chef d’équipe' } },
        liste: [{ id: 'pourquoi', type: 'fil', de: 'Erwan', quand: apresGeste(o.question), reflexion: true,
          enonce: 'Pourquoi signaler avant de prendre ton poste ?', choix: [{ v: 'a', lib: 'Pour travailler en sécurité' }, { v: 'b', lib: 'Pour rien' }],
          retour: 'Un engin abîmé blesse.' }] };
    }
  } catch (e) { return e.message; }
  const hote = document.createElement('div'); hote.id = 'insp-hote'; document.body.prepend(hote);
  let M;
  try { M = creerEntreprise(U); } catch (e) { return e.message; }
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__in = { db, moteur: M, D, decl, seance, remontees: [], copies: [], sauvegardes: 0 };
  M.rendre(hote, {
    meta: { id: seance, code: 'ESSAI', titre: 'Inspection — essai', portee: 'eleve', immersif: true, ...(o.copie ? { copie: true } : {}) },
    profil: { prenom: 'Lea', nom: 'Dupont', role: o.role || 'eleve', uid: o.uid || 'u-lea' },
    jeu: { etat: () => db, sauver: () => { window.__in.sauvegardes++; } }, enregistrer: (r) => { window.__in.remontees.push(JSON.parse(JSON.stringify(r))); },
    quitter: () => {}, codeStock: '',
    lireScore: async () => null,
    rendreCopie: async (res) => { window.__in.copies.push(JSON.parse(JSON.stringify(res))); return { rendu: Date.now() }; },
  });
  const avis = hote.querySelector('.avis-err');
  if (avis) return avis.textContent;
  hote.querySelector('.ent-nav[data-vue="inspection"]')?.click();
  return null;
}, o);

const R = '#insp-hote [data-i-inspection]';
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__in.db)));
const etat = async (seance = SEANCE) => ((((await base()).inspections || {})[seance]) || {})[ID] || null;
const jalons = () => pg.evaluate(() => window.__in.moteur.noter(window.__in.db).detail);
const statuts = async () => { const d = await jalons(); return Object.fromEntries(['securite-tp2-fourche', 'securite-extincteur', 'essai-2', 'securite-aucun-faux'].map((k) => [k, d[k]])); };
const texte = (sel) => pg.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);
const bouton = async (i, extra = '') => { await pg.click(`${R} button[data-i="${i}"]${extra}`); };
const vue = (v) => bouton('vue', `[data-v="${v}"]`);
const nbMarques = () => pg.$$eval(`${R} [data-i-marque]`, (L) => L.length);
// Le milieu d'une zone de clic du point `id` (vue affichée), en coordonnées d'écran ; `elementFromPoint` doit tomber dans la scène.
async function cliquerPoint(id) {
  await pg.$eval(`${R} [data-i-scene]`, (s) => s.scrollIntoView({ block: 'nearest' }));
  const p = await pg.evaluate(({ R, id }) => {
    const racine = document.querySelector(R), svg = racine.querySelector('[data-i-scene]');
    const z = racine.__insp.zones().find((q) => q.id === id && q.vue === svg.dataset.vue);
    if (!z) return { rate: `pas de zone dans la vue ${svg.dataset.vue}` };
    const M = svg.getScreenCTM(), q = svg.createSVGPoint();
    // Le milieu de chaque rectangle de la zone, le plus grand d'abord, puis d'autres points de ce rectangle (une marque envoyée,
    // inerte, masque ce qu'elle recouvre) : le premier qui tombe dans la scène, hors d'une marque.
    const fr = [[.5, .5], [.3, .3], [.7, .7], [.3, .7], [.7, .3], [.5, .25], [.5, .75]];
    for (const r of z.rects.slice().sort((a, b) => b.w * b.h - a.w * a.h)) for (const [fx, fy] of fr) {
      q.x = r.x + r.w * fx; q.y = r.y + r.h * fy;
      const e = q.matrixTransform(M);
      const t = document.elementFromPoint(e.x, e.y);
      if (t && svg.contains(t) && !t.closest('[data-i-marque]')) return { x: e.x, y: e.y };
    }
    return { rate: `rects ${JSON.stringify(z.rects)} ; svg ${JSON.stringify(svg.getBoundingClientRect())}` };
  }, { R, id });
  vrai(!p.rate, `aucun point cliquable pour « ${id} » : ${p.rate}`);
  await pg.mouse.click(p.x, p.y);
}
// Un point de la scène (dans le cadre) qui ne touche AUCUNE zone, en coordonnées d'écran.
async function cliquerVide() {
  const p = await pg.evaluate((R) => {
    const racine = document.querySelector(R), svg = racine.querySelector('[data-i-scene]');
    const Z = racine.__insp.zones().filter((q) => q.vue === svg.dataset.vue).flatMap((q) => q.rects);
    const [vx, vy, vw, vh] = svg.getAttribute('viewBox').split(' ').map(Number);
    const M = svg.getScreenCTM(), q = svg.createSVGPoint();
    for (let i = 1; i < 20; i++) for (let j = 1; j < 20; j++) {
      const x = vx + (vw * i) / 20, y = vy + (vh * j) / 20;
      if (Z.some((r) => x >= r.x - 2 && x <= r.x + r.w + 2 && y >= r.y - 2 && y <= r.y + r.h + 2)) continue;
      q.x = x; q.y = y;
      const e = q.matrixTransform(M);
      const t = document.elementFromPoint(e.x, e.y);
      if (t && svg.contains(t) && e.y < window.innerHeight - 4) return { x: e.x, y: e.y };
    }
    return null;
  }, R);
  vrai(p, 'aucun point vide dans la scène');
  await pg.mouse.click(p.x, p.y);
}
const valider = async () => { await bouton('valider'); await bouton('valider'); };
// Le parcours juste : le n° 2 marqué et signalé, l'avertisseur essayé, l'extincteur marqué et signalé, puis le poste pris.
async function parcoursJuste() {
  await cliquerPoint('tp2-fourche');
  await bouton('essai', '[data-n="2"]');
  await bouton('signaler');
  await vue('quai');
  await cliquerPoint('extincteur');
  await bouton('signaler');
  await valider();
}

await v('Inspection : la vue s’ouvre au menu « Mon poste », sans erreur ; deux vues, bouton d’avertisseur, aucun objet nommé dans le dessin (ni title, ni tabindex, ni data-*)', async () => {
  egal(await monter(), null, 'séance refusée');
  await pg.waitForSelector(`${R} [data-i-scene]`);
  egal(await texte('#insp-hote .ent-nav[data-vue="inspection"]'), 'Mon poste', 'entrée de menu');
  egal(await pg.$$eval(`${R} button[data-i="vue"]`, (L) => L.map((b) => b.textContent)), ['Le local de charge', 'Le quai'], 'bascule des deux vues');
  egal(await pg.$$eval(`${R} button[data-i="essai"]`, (L) => L.map((b) => b.textContent)), ['Essayer l’avertisseur du n° 2'], 'un bouton par essai déclaré');
  egal(await texte(`${R} button[data-i="signaler"]`), 'Signaler à Erwan', 'bouton Signaler');
  egal(await texte(`${R} button[data-i="valider"]`), 'C’est bon, je prends mon poste →', 'bouton de prise de poste');
  const nomme = await pg.$$eval(`${R} [data-i-scene] *`, (L) => L.filter((e) => e.tagName.toLowerCase() === 'title' || e.hasAttribute('tabindex') || e.hasAttribute('role')
    || [...e.attributes].some((a) => a.name.startsWith('data-') && !['data-g', 'data-i-marque', 'data-i-marques'].includes(a.name))).map((e) => e.outerHTML.slice(0, 80)));
  egal(nomme, [], 'le dessin ne nomme aucun objet');
  vrai(!/transpalette|extincteur|plan de circulation|fourche/i.test(await pg.getAttribute(`${R} [data-i-scene]`, 'aria-label')), 'aria-label sans objet');
  egal(await etat(), { marques: [], compteur: 0, signaux: [], essais: [], arrete: false, fait: false, chef: '' }, 'état neuf rangé sous la séance');
  egal(erreurs, [], 'erreurs de page');
  egal([...hotes], [], 'requêtes hors du site');
});

await v('Inspection : alerte 13 — sans « inspection » déclarée, ni entrée de menu, ni écran, ni état rangé ; l’option est dans la table OPTIONS', async () => {
  egal(await monter({ sans: true }), null, 'séance sans inspection refusée');
  egal(await pg.$$eval('#insp-hote .ent-nav[data-vue="inspection"]', (L) => L.length), 0, 'entrée de menu');
  egal(await pg.$$eval('#insp-hote [data-i-inspection]', (L) => L.length), 0, 'écran');
  egal((await base()).inspections, undefined, 'db.inspections');
  const o = await pg.evaluate(async () => (await import('/core/types/entreprise-options.js')).OPTIONS.inspection.type);
  egal(o, 'object|function', 'ligne de la table OPTIONS');
  // Avec l'inspection : l'entrée est bien là (le cas se lit dans les deux sens).
  egal(await monter(), null, 'séance refusée');
  egal(await pg.$$eval('#insp-hote .ent-nav[data-vue="inspection"]', (L) => L.length), 1, 'entrée de menu avec inspection');
});

await v('Inspection : contrôles au chargement — état inconnu, deux points sur le même engin, ok incohérent, essai sur un engin non déclaré, id « aucun-faux », objet inconnu, reparable sur un point en ordre ; inspectionFinie ou geste inconnus', async () => {
  const cas = {
    'etat-inconnu': /« tp2-fourche ».*état « cassee » inconnu pour transpalette/,
    'deux-points': /« tp2-roue ».*deux points sur le même objet \(transpalette n° 2\)/,
    'ok-incoherent': /« plan ».*ok: true sur un état dangereux \(affichage « absent »\)/,
    'essai-non-declare': /essai\[1\] : le transpalette n° 1 n’est déclaré par aucun point/,
    'aucun-faux': /l’id « aucun-faux » est réservé/,
    'objet-inconnu': /objet « lampe » inconnu/,
    'reparable-ok': /« tp1 ».*reparable: false n’a pas de sens sur un point en ordre/,
  };
  for (const [modif, re] of Object.entries(cas)) {
    const m = await monter({ modif });
    vrai(m && re.test(m), `${modif} : message attendu ${re}, reçu : ${m}`);
  }
  vrai(/l’inspection « autre » n’existe pas/.test(await monter({ fermeture: 'autre' }) || ''), 'inspectionFinie sur une inspection inconnue');
  egal(await monter({ fermeture: ID }), null, 'inspectionFinie sur la bonne inspection');
  vrai(/geste inconnu « inspection:pelleau-poste-102:essais »/.test(await monter({ question: `inspection:${ID}:essais` }) || ''), 'geste inconnu');
  egal(await monter({ question: `inspection:${ID}:essai` }), null, 'geste connu');
});

await v('Inspection : un clic dans le vide ne pose rien (ni marque, ni compteur, rien de rangé) ; phrase grise « Clique un objet du poste. »', async () => {
  await monter();
  await cliquerVide();
  egal(await nbMarques(), 0, 'marque posée dans le vide');
  egal(await texte(`${R} [data-i-nb]`), 'Clique un objet du poste.', 'phrase');
  vrai(await pg.$eval(`${R} [data-i-nb]`, (e) => e.classList.contains('insp-hors') && getComputedStyle(e).color !== getComputedStyle(document.querySelector('#insp-hote [data-i-consigne]')).color), 'phrase grise');
  const st = await etat();
  egal([st.marques.length, st.compteur, st.signaux.length], [0, 0, 0], 'état');
  // Puis un clic sur un objet pose bien la marque n° 1 (le compteur n'a pas bougé pour le vide).
  await cliquerPoint('tp1');
  egal(await nbMarques(), 1, 'marque sur un objet');
  egal((await etat()).marques.map((m) => [m.n, m.point]), [[1, 'tp1']], 'marque rangée');
  egal(await texte(`${R} [data-i-nb]`), '1 marque à envoyer', 'compteur');
});

await v('Inspection : une marque se retire d’un clic tant qu’elle n’est pas envoyée ; envoyée, elle est inerte (grisée)', async () => {
  await monter();
  await cliquerPoint('tp2-fourche');
  await pg.click(`${R} [data-i-marque="1"]`);
  egal(await nbMarques(), 0, 'marque retirée');
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  await pg.click(`${R} [data-i-marque="2"]`);
  egal(await nbMarques(), 1, 'marque envoyée retirée');
  egal(await pg.getAttribute(`${R} [data-i-marque="2"] circle`, 'stroke-dasharray'), '4 3', 'marque envoyée grisée en tirets');
});

await v('Inspection : parcours juste — défauts marqués et signalés, avertisseur essayé, deux clics → les quatre jalons ✓, gestes signaler, essai, fini', async () => {
  await monter();
  egal(Object.values(await statuts()), ['attente', 'attente', 'attente', 'attente'], 'jalons avant tout geste');
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  egal(await texte(`${R} [data-i-chef]`), 'Erwan : « Bien vu. Je le mets de côté : prends le n° 1. Tu me dis quand tu prends ton poste. »', 'réponse d’Erwan');
  const etats = await pg.evaluate(async () => { const I = await import('/core/types/inspection.js'); return I.etatsInspection(window.__in.D, window.__in.db.inspections['essai-inspection']['pelleau-poste-102']); });
  egal(etats['transpalette-2'], 'ok', 'le n° 2 réparé sous les yeux');
  await bouton('essai', '[data-n="2"]');
  await vue('quai');
  await cliquerPoint('extincteur');
  await bouton('signaler');
  await valider();
  egal(await statuts(), { 'securite-tp2-fourche': 'ok', 'securite-extincteur': 'ok', 'essai-2': 'ok', 'securite-aucun-faux': 'ok' }, 'jalons');
  egal(Object.keys((await base()).gestes[SEANCE]).sort(), [`inspection:${ID}:essai`, `inspection:${ID}:fini`, `inspection:${ID}:signaler`], 'gestes');
  egal(await texte(`${R} [data-i-fige]`), 'Tu as pris ton poste : l’inspection est figée.', 'figé');
  egal(await pg.$$eval(`${R} [data-i-bilan]`, (L) => L.length), 0, 'pas de phrase de bilan quand tout est juste');
  egal(erreurs, [], 'erreurs de page');
});

await v('Inspection : inaction — aucun jalon vrai : « attente » avant la prise de poste, puis les quatre ✗ (arret: false) ; phrase de bilan', async () => {
  await monter({ arret: false });
  await valider();
  egal(await statuts(), { 'securite-tp2-fourche': 'ko', 'securite-extincteur': 'ko', 'essai-2': 'ko', 'securite-aucun-faux': 'ko' }, 'jalons après inaction');
  const L = await pg.evaluate(async () => { const I = await import('/core/types/inspection.js'); return I.lignesInspection(window.__in.decl, window.__in.db, window.__in.seance).map((l) => [l.id, l.ok, l.fait]); });
  egal(L, [['securite-tp2-fourche', false, 'jamais signalé'], ['securite-extincteur', false, 'jamais signalé'], ['essai-2', false, 'pas essayé'], ['securite-aucun-faux', false, 'rien signalé']], 'lignes');
  // Les jalons d'une base VIDE ne sont jamais vrais non plus (lus sans état).
  const vide = await pg.evaluate(async () => { const I = await import('/core/types/inspection.js'); return I.jalonsInspection(window.__in.D, null).filter((l) => l.ok).length; });
  egal(vide, 0, 'jalon vrai sur une base vide');
  egal(await texte(`${R} [data-i-bilan]`), 'Avant de prendre ton poste, tu regardes ton engin et ton poste, et tu signales tout ce qui ne va pas.', 'phrase de bilan');
});

await v('Inspection : un objet en ordre signalé → « aucun faux signalement » ✗ (les autres jalons restent ✓) ; Erwan répond « rien qui cloche »', async () => {
  await monter();
  await cliquerPoint('tp1');
  await bouton('signaler');
  egal(await texte(`${R} [data-i-chef]`), 'Erwan : « Là, je ne vois rien qui cloche. Tu me dis quand tu prends ton poste. »', 'réponse');
  await parcoursJuste();
  egal(await statuts(), { 'securite-tp2-fourche': 'ok', 'securite-extincteur': 'ok', 'essai-2': 'ok', 'securite-aucun-faux': 'ko' }, 'jalons');
  const l = await pg.evaluate(async () => { const I = await import('/core/types/inspection.js'); return I.lignesInspection(window.__in.decl, window.__in.db, window.__in.seance).find((x) => x.id === 'securite-aucun-faux').fait; });
  egal(l, 'signalé à tort : Transpalette n° 1 en ordre', 'ligne du bilan');
});

await v('Inspection : extincteur « reparable: false » — signalé, il reste absent ; re-signalé, « Oui, je sais » (pas un faux) ; jalon ✓', async () => {
  await monter();
  await vue('quai');
  await cliquerPoint('extincteur');
  await bouton('signaler');
  vrai((await texte(`${R} [data-i-chef]`)).includes('Il arrive demain'), 'réponse d’Erwan');
  const et = () => pg.evaluate(async () => { const I = await import('/core/types/inspection.js'); return I.etatsInspection(window.__in.D, window.__in.db.inspections['essai-inspection']['pelleau-poste-102']).extincteur; });
  egal(await et(), 'absent', 'l’extincteur n’apparaît pas d’un coup');
  await cliquerPoint('extincteur');
  await bouton('signaler');
  egal(await texte(`${R} [data-i-chef]`), 'Erwan : « Oui, je sais : c’est noté. Tu me dis quand tu prends ton poste. »', 're-signalement');
  egal(await et(), 'absent', 'toujours absent');
  await vue('charge');
  await cliquerPoint('tp2-fourche');
  await bouton('essai', '[data-n="2"]');
  await bouton('signaler');
  await valider();
  egal(await statuts(), { 'securite-tp2-fourche': 'ok', 'securite-extincteur': 'ok', 'essai-2': 'ok', 'securite-aucun-faux': 'ok' }, 'jalons');
});

await v('Inspection : avertisseur — « rien ne sonne » (muet), « le klaxon sonne » (en ordre), aucun son ; le jalon essai-<n> existe même quand il sonne, faux s’il n’est pas essayé ; geste publié une fois', async () => {
  await monter({ sonne: true, arret: false });
  egal(await pg.$$eval(`${R} button[data-i="essai"]`, (L) => L.map((b) => b.textContent)), ['Essayer l’avertisseur du n° 2', 'Essayer l’avertisseur du n° 1'], 'boutons');
  await bouton('essai', '[data-n="2"]');
  egal(await texte(`${R} [data-i-essai]`), 'Tu appuies : rien ne sonne.', 'muet');
  await bouton('essai', '[data-n="2"]');
  egal((await etat()).essais, [2], 'premier essai rangé une fois');
  egal(await pg.$$eval('audio, video', (L) => L.length), 0, 'aucun son');
  await valider();
  const d = await jalons();
  egal([d['essai-2'], d['essai-1']], ['ok', 'ko'], 'n° 2 essayé, n° 1 (qui sonne) pas essayé');
  egal(Object.keys((await base()).gestes[SEANCE]).filter((g) => g.endsWith(':essai')), [`inspection:${ID}:essai`], 'geste essai');
  await monter({ sonne: true });
  await bouton('essai', '[data-n="1"]');
  egal(await texte(`${R} [data-i-essai]`), 'Tu appuies : le klaxon sonne.', 'sonne');
  // Après la prise de poste, l'essai ne se fait plus (le jalon dit « avant de prendre le poste »).
  await monter({ arret: false });
  await valider();
  vrai(await pg.$eval(`${R} button[data-i="essai"]`, (b) => b.disabled), 'essai encore possible après la prise de poste');
});

const REP = 'Reçu. Je regarde ça tout à l’heure.';
await v('Inspection : signaler.reponse (20/10/2026) — défaut, point en ordre, défaut déjà réparé, défaut non réparable re-signalé : la MÊME phrase seule, sans « Bien vu », sans fin ; « rien à envoyer » garde vide ; marques, signaux et jalons inchangés', async () => {
  vrai(/phrase non vide/.test(await monter({ modif: 'reponse-vide' }) || ''), 'une réponse vide est refusée au chargement');
  egal(await monter({ reponse: REP }), null, 'séance montée');
  const chef = () => texte(`${R} [data-i-chef]`);
  const PH = 'Erwan : « ' + REP + ' »';
  await bouton('signaler');
  vrai((await chef()).includes('Qu’est-ce qui ne va pas'), 'rien à envoyer : vide, pas la réponse unique');
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  egal(await chef(), PH, 'défaut (celui qui se répare)');
  await cliquerPoint('tp1');
  await bouton('signaler');
  egal(await chef(), PH, 'point en ordre');
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  egal(await chef(), PH, 'défaut déjà réparé');
  await vue('quai');
  await cliquerPoint('extincteur');
  await bouton('signaler');
  egal(await chef(), PH, 'défaut non réparable (l’ancienne réponse parlait de demain)');
  await cliquerPoint('extincteur');
  await bouton('signaler');
  egal(await chef(), PH, 'défaut non réparable re-signalé (plus de « je sais »)');
  const st = await etat();
  egal(st.signaux.map((g) => g.points), [['tp2-fourche'], ['tp1'], ['tp2-fourche'], ['extincteur'], ['extincteur']], 'signaux rangés comme avant');
  egal(st.marques.every((m) => m.envoi != null), true, 'marques envoyées');
  const et = await pg.evaluate(async () => { const I = await import('/core/types/inspection.js'); return I.etatsInspection(window.__in.D, window.__in.db.inspections['essai-inspection']['pelleau-poste-102']); });
  egal(et.extincteur, 'absent', 'l’extincteur n’est toujours pas réparé');
});

await v('Inspection : signaler.reponse — le parcours juste reste juste (quatre jalons ✓) avec la réponse unique ; SANS la clé, la composition d’avant est inchangée (réparation + rien + fin)', async () => {
  await monter({ reponse: REP });
  await parcoursJuste();
  egal(await statuts(), { 'securite-tp2-fourche': 'ok', 'securite-extincteur': 'ok', 'essai-2': 'ok', 'securite-aucun-faux': 'ok' }, 'jalons avec la réponse unique');
  // L'inverse : sans la clé, les trois compositions d'avant.
  await monter();
  const chef = () => texte(`${R} [data-i-chef]`);
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  egal(await chef(), 'Erwan : « Bien vu. Je le mets de côté : prends le n° 1. Tu me dis quand tu prends ton poste. »', 'défaut : sa réparation + fin');
  await cliquerPoint('tp1');
  await bouton('signaler');
  egal(await chef(), 'Erwan : « Là, je ne vois rien qui cloche. Tu me dis quand tu prends ton poste. »', 'point en ordre : rien + fin');
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  egal(await chef(), 'Erwan : « Là, je ne vois rien qui cloche. Tu me dis quand tu prends ton poste. »', 'défaut déjà réparé : rien + fin');
});

await v('Inspection : guidage — un défaut oublié arrête l’élève sans nommer le point ; signalé après l’arrêt, son jalon reste ✗', async () => {
  await monter();
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  await valider();
  const a = await texte(`${R} [data-i-arret]`);
  egal(a, 'Erwan : « Stop ! Avant de prendre ton poste, tout doit être en ordre. Regarde encore et signale ce qui ne va pas. »', 'arrêt');
  vrai(!/extincteur|quai B|plan|fourche/i.test(a), 'l’arrêt nomme le point : ' + a);
  egal([(await etat()).arrete, (await etat()).fait], [true, false], 'arrêté, pas figé');
  egal((await jalons())['securite-extincteur'], 'attente', 'jalon avant la prise de poste');
  await vue('quai');
  await cliquerPoint('extincteur');
  await bouton('signaler');
  egal(await pg.$$eval(`${R} [data-i-arret]`, (L) => L.length), 0, 'l’arrêt s’efface au signalement suivant');
  await valider();
  const d = await jalons();
  egal([d['securite-tp2-fourche'], d['securite-extincteur']], ['ok', 'ko'], 'jalons');
  const f = await pg.evaluate(async () => { const I = await import('/core/types/inspection.js'); return I.lignesInspection(window.__in.decl, window.__in.db, window.__in.seance).find((x) => x.id === 'securite-extincteur').fait; });
  egal(f, 'signalé seulement après l’arrêt de Erwan', 'ligne');
  egal(Object.keys((await base()).gestes[SEANCE]).includes(`inspection:${ID}:fini`), true, 'geste fini au figeage');
});

await v('Inspection : figeage en deux clics — le premier arme (« c’est définitif »), « Annuler » désarme, le second fige ; geste fini publié une fois, plus rien ne bouge', async () => {
  await monter({ arret: false });
  await bouton('valider');
  egal(await texte(`${R} button[data-i="valider"]`), 'Tu prends ton poste, c’est définitif : clique pour confirmer', 'armé');
  egal((await etat()).fait, false, 'figé au premier clic');
  await bouton('desarmer');
  egal(await texte(`${R} button[data-i="valider"]`), 'C’est bon, je prends mon poste →', 'désarmé');
  await bouton('valider');
  // Une marque posée entre-temps désarme aussi.
  await cliquerPoint('tp1');
  egal(await texte(`${R} button[data-i="valider"]`), 'C’est bon, je prends mon poste →', 'une marque désarme');
  egal((await base()).gestes?.[SEANCE]?.[`inspection:${ID}:fini`], undefined, 'geste avant le figeage');
  await valider();
  egal((await etat()).fait, true, 'figé');
  vrai((await base()).gestes[SEANCE][`inspection:${ID}:fini`] > 0, 'geste fini');
  egal((await etat()).marques.length, 0, 'marques non envoyées abandonnées');
  egal(await pg.$$eval(`${R} button[data-i="signaler"], ${R} button[data-i="valider"], ${R} button[data-i="vue"]`, (L) => L.every((b) => b.disabled)), true, 'boutons figés');
  await cliquerVide();
  egal((await etat()).compteur, 1, 'rien ne bouge après le figeage');
});

await v('Inspection : déclencheur inspectionFinie — la Messagerie, fermée tant que le poste n’est pas pris, s’ouvre au figeage (pas à l’arrêt)', async () => {
  egal(await monter({ fermeture: ID }), null, 'séance refusée');
  vrai(await pg.isVisible('#insp-hote .ent-nav-ferme[data-vue-fermee="mail"]'), 'Messagerie fermée au départ');
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  await valider();
  vrai(await pg.isVisible('#insp-hote .ent-nav-ferme[data-vue-fermee="mail"]'), 'l’arrêt ouvre la Messagerie');
  await vue('quai');
  await cliquerPoint('extincteur');
  await bouton('signaler');
  await valider();
  await pg.waitForSelector('#insp-hote .ent-nav[data-vue="mail"]:not([disabled])');
  egal(await pg.$$eval('#insp-hote .ent-nav-ferme[data-vue-fermee="mail"]', (L) => L.length), 0, 'Messagerie encore fermée');
  const f = await pg.evaluate(async () => { const { inspectionFinie, tous } = await import('/core/declencheurs.js'); const c = inspectionFinie('pelleau-poste-102');
    return [c(window.__in.db, 'essai-inspection'), c(window.__in.db, 'autre-seance'), tous(c).inspections]; });
  egal(f, [true, false, ['pelleau-poste-102']], 'inspectionFinie cloisonné par séance, gardé par tous()');
});

await v('Inspection : copie (évaluation) — la marque se pose au premier clic, « C’est noté. », rien ne se répare, aucun arrêt ; les jalons comptent', async () => {
  egal(await monter({ copie: true }), null, 'copie refusée');
  vrai(await pg.$(`${R}[data-i-copie]`), 'vue en copie');
  await cliquerPoint('tp2-fourche');
  egal(await nbMarques(), 1, 'marque au premier clic');
  await bouton('signaler');
  egal(await texte(`${R} [data-i-chef]`), 'Erwan : « C’est noté. »', 'réponse en copie');
  const etats = await pg.evaluate(async () => { const I = await import('/core/types/inspection.js'); return I.etatsInspection(window.__in.D, window.__in.db.inspections['essai-inspection']['pelleau-poste-102'], { copie: true }); });
  egal(etats['transpalette-2'], 'fourcheTordue', 'rien ne se répare');
  await valider();
  egal(await pg.$$eval(`${R} [data-i-arret]`, (L) => L.length), 0, 'aucun arrêt');
  egal([(await etat()).fait, (await etat()).arrete], [true, false], 'figé sans arrêt malgré l’extincteur oublié');
  const d = await jalons();
  egal([d['securite-tp2-fourche'], d['securite-extincteur'], d['essai-2'], d['securite-aucun-faux']], ['ok', 'ko', 'ko', 'ok'], 'jalons en copie');
  egal(await pg.$$eval(`${R} [data-i-bilan]`, (L) => L.length), 0, 'aucune phrase de bilan en copie');
  egal(await pg.evaluate(() => window.__in.remontees.length), 0, 'rien au Suivi avant la remise');
});

await v('Inspection : état cloisonné par séance — deux séances, même id d’inspection, états séparés', async () => {
  await monter({ seance: 'seance-a' });
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  const db = await base();
  egal(await monter({ seance: 'seance-b', db }), null, 'seconde séance refusée');
  egal(await nbMarques(), 0, 'marques de la séance A visibles dans B');
  egal(await texte(`${R} [data-i-chef]`), '', 'réponse de A visible dans B');
  const d = await base();
  egal(Object.keys(d.inspections).sort(), ['seance-a', 'seance-b'], 'deux cases');
  egal([d.inspections['seance-a'][ID].signaux.length, d.inspections['seance-b'][ID].signaux.length], [1, 0], 'signaux séparés');
});

await v('Inspection : rechargement — marques, réponse d’Erwan, essais et figeage se retrouvent', async () => {
  await monter();
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  await cliquerPoint('tp1');
  await bouton('essai', '[data-n="2"]');
  const db = await base();
  egal(await monter({ db }), null, 'reprise refusée');
  egal(await nbMarques(), 2, 'marques');
  egal(await texte(`${R} [data-i-nb]`), '1 marque à envoyer', 'compteur');
  vrai((await texte(`${R} [data-i-chef]`)).includes('prends le n° 1'), 'réponse d’Erwan');
  egal((await etat()).essais, [2], 'essai');
  await vue('quai'); await cliquerPoint('extincteur'); await bouton('signaler'); await valider();
  egal(await monter({ db: await base() }), null, 'reprise refusée');
  egal(await texte(`${R} [data-i-fige]`), 'Tu as pris ton poste : l’inspection est figée.', 'figé après rechargement');
});

await v('Inspection : tirée par graine — même élève, même jeu ; un autre élève, son jeu ; les jalons lisent le jeu de la base', async () => {
  egal(await monter({ tire: true, uid: 'u-bob', arret: false }), null, 'tirée refusée');
  const lib = () => pg.evaluate(async () => { const I = await import('/core/types/inspection.js'); return I.lignesInspection(window.__in.decl, window.__in.db, window.__in.seance)[0].attendu; });
  egal(await lib(), 'signaler : Roue abîmée sur le n° 2', 'jeu de bob');
  await cliquerPoint('tp2-fourche');
  await bouton('signaler');
  await valider();
  egal((await jalons())['securite-tp2-fourche'], 'ok', 'jalon du jeu de bob');
  egal((await jalons()).graine, 'u-bob', 'graine dans le détail');
  egal(await monter({ tire: true, uid: 'u-bob', db: await base() }), null, 'reprise refusée');
  egal(await lib(), 'signaler : Roue abîmée sur le n° 2', 'même jeu à la reprise');
  egal(await monter({ tire: true, uid: 'u-lea' }), null, 'tirée refusée');
  egal(await lib(), 'signaler : Fourche tordue sur le n° 2', 'jeu de lea');
});

await v('Inspection : 1366 × 768 et 1280 × 720 — la scène et le panneau tiennent sous le bandeau, sans défilement du panneau ; aucune requête hors du site', async () => {
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pg.setViewportSize({ width: w, height: h });
    await monter();
    await pg.waitForTimeout(80);
    const m = await pg.evaluate((R) => {
      const r = document.querySelector(R), sc = r.querySelector('.insp-scene').getBoundingClientRect(), pa = r.querySelector('.insp-panneau');
      const top = r.getBoundingClientRect().top;
      return { bas: Math.max(sc.bottom, pa.getBoundingClientRect().bottom) - top, dispo: window.innerHeight - top, deborde: pa.scrollHeight > pa.clientHeight + 1, larg: sc.width };
    }, R);
    vrai(m.bas <= m.dispo, `${w} × ${h} : la vue dépasse l’écran (${m.bas} > ${m.dispo})`);
    vrai(!m.deborde, `${w} × ${h} : le panneau défile`);
    vrai(m.larg > 500, `${w} × ${h} : scène trop étroite (${m.larg})`);
  }
  await pg.setViewportSize({ width: 1366, height: 768 });
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs de page');
});

await ctxI.close();
}
