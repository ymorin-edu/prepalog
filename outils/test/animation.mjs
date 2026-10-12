// Suite de tests de Prepalog — bloc « animation » : la vue « animation à questions » (core/types/animation.js)
// et le kit de dessin isométrique (core/iso.js), brief `docs/briefs/MOTEUR-vue-animation.md` §10 (05/10/2026).
//
// `node outils/test.mjs animation` ne lance que ce bloc. Il monte l'environnement d'entreprise à la main,
// dans un contexte de navigateur à lui, sur le contenu d'essai (la maquette d'ENT-6.5 reproduite,
// `contenus/animation-essai.js`), ACCÉLÉRÉ (vitesse 40) pour que chaque partie dure moins d'une seconde.
//
// Ce qui vaut son prix ici, ce sont les tests de la BASE (première réponse gardée, ordre des choix,
// cloisonnement) : un défaut là fausse une note sans que personne ne le voie. Le rendu se juge à l'écran.
// Les rangs attendus sont écrits À LA MAIN : q1 juste = 1 (« Le chariot entre par l'allée… »),
// q2 juste = 2 (« En M03, au fond. »), dans l'ordre DÉCLARÉ.

export default async function bloc({ v, nav, BASE, egal, vrai }) {


const ctxA = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const erreursA = [];
async function nouvellePage(c = ctxA) {
  const p = await c.newPage();
  p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => erreursA.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursA.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE);
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  return p;
}
const pg = await nouvellePage();

// Monte une séance d'essai. `db` : la base de départ (copiée) ; `seance` : l'id de la séance ;
// `id` : l'id de l'animation (cloisonnement) ; `vitesse` ; `role` ; `hors` : hors Simulog (creerAnimation).
const monter = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const { creerAnimation } = await import('/core/types/animation.js');
  const E = await import('/outils/essai-animation.js');
  const { ANIMATION_ESSAI } = await import('/contenus/animation-essai.js');
  document.querySelector('#anTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'anTest'; document.body.prepend(hote);
  const A = Object.assign({}, ANIMATION_ESSAI, { vitesse: o.vitesse || 40 }, o.id ? { id: o.id } : {});
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__a = { db, A, enregistres: [] };
  const ctx = {
    meta: { id: o.seance || 'essai-animation', code: 'ESSAI', titre: 'Essai de l’animation', portee: 'eleve', immersif: true, temps: 'guidage', bareme: 2 },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__a.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
  };
  if (o.hors) { creerAnimation(A).rendre(hote, ctx); return; }
  // `ecrans` : la séance d'ENT-6.5 avec ses écrans de présentation (« Le matériel », puis le mot FIFO avant l'animation) ;
  // `vue` : l'écran du menu à ouvrir (le premier écran d'animation par défaut).
  creerEntreprise(E.univers({ animation: A, ecrans: !!o.ecrans })).rendre(hote, ctx);
  document.querySelector(`#anTest .ent-nav[data-vue${o.vue ? `="animation:${o.vue}"` : '^="animation:"'}]`).click();
}, o);

const Z = '#anTest';
const QOUVERTE = `${Z} [data-anim-q]:not([hidden]) [data-anim-choix]`;
const attendreQuestion = (p, t = 8000) => p.waitForSelector(QOUVERTE, { timeout: t });
const base = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__a.db)));
const etatAnim = async (p, id = 'essai-fifo') => ((await base(p)).animations || {})[id] || null;
// L'ordre AFFICHÉ : le rang déclaré de chaque bouton, de haut en bas (A, B, C, D).
const affiche = (p) => p.$$eval(`${Z} [data-anim-choix]`, (L) => L.map((b) => Number(b.dataset.animChoix)));
// Choisir le choix de rang DÉCLARÉ `i`, puis valider.
async function repondre(p, i) {
  await p.click(`${Z} [data-anim-choix="${i}"]`);
  await p.click(`${Z} [data-anim-valider]`);
}
// Les jalons de la séance, lus sur la base (ce que lit le suivi).
const jalons = (p) => p.evaluate(async () => {
  const { etapesAnimation } = await import('/core/types/animation.js');
  return etapesAnimation(window.__a.A).map((e) => e.verifier(window.__a.db).status);
});

await v('Animation : kit iso — couleurs de lot et textes au sol lisibles (contraste ≥ 4,5)', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const L = (h) => { const n = parseInt(h.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const C = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const lots = Object.entries(K.LOTS_KIT).filter(([, l]) => C(l.c, l.t) < 4.5).map(([k]) => k);
    // Sol, allée, fond de couloir : les trois fonds sur lesquels un texte de sol peut tomber.
    const sols = ['#e4dfd3', '#efeadf', '#f6f2e9'];
    const tons = Object.entries(K.TONS_SOL).filter(([, c]) => sols.some((s) => C(c, s) < 4.5)).map(([k]) => k);
    return { lots, tons, nLots: Object.keys(K.LOTS_KIT).length };
  });
  egal(r.lots, [], 'couleurs de lot illisibles');
  egal(r.tons, [], 'tons de texte au sol illisibles');
  vrai(r.nLots >= 4, 'au moins quatre couleurs de lot');
});

// Roues rondes (ENT-1.1 §7.9, 06/10/2026) : une roue = des cercles projetés par la matrice du flanc. Le chariot
// frontal en a 4, de 7 cercles chacune (5 pour la bande de roulement, le moyeu, l'axe) : 28, écrit à la main.
await v('Kit iso : roues rondes — le chariot frontal n’a plus de roue en boîte', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection();
    const ch = K.dessinerChariotFrontal(I, { x: 0, y: 0, lev: 0, charge: null }, { lots: {} });
    const roue = K.roue(I, 0, 0, .15, .15, .12);
    return { cercles: (ch.match(/<circle r="[^"]+" transform="matrix\(/g) || []).length, polyRoue: (roue.match(/<polygon/g) || []).length,
      cerclesRoue: (roue.match(/<circle/g) || []).length };
  });
  egal(r.cercles, 28, 'cercles des roues du chariot frontal');
  egal(r.cerclesRoue, 7, 'cercles d’une roue');
  egal(r.polyRoue, 0, 'une roue ne contient aucune face plate');
});

// La palette de cartons du quai iso (ENT-1.1) : un carton absent n'est pas dessiné ; un carton enfoncé sur sa
// face ARRIÈRE (N) ne le montre jamais de l'avant : seulement palette tournée (la face arrière passe à droite
// au premier quart de tour, devant au demi-tour).
await v('Kit iso : palette de cartons — l’absent n’est pas dessiné, l’enfoncement n’apparaît que de son côté', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 150, origine: [470, 190] });
    const pal = { nW: 2, nD: 2, nL: 1, cartons: [
      { i: 0, j: 0, k: 0, no: 1, absent: true, etiq: {} }, { i: 1, j: 0, k: 0, no: 2, abime: 'N', etiq: {} },
      { i: 0, j: 1, k: 0, no: 3, etiq: {} }, { i: 1, j: 1, k: 0, no: 4, etiq: {} }] };
    const attrs = (c) => `data-c="${c.no}"`;
    const vue = (rot) => K.paletteCartons(I, pal, 0, 0, rot, { attrs });
    const n = (s, motif) => (s.match(motif) || []).length;
    return { cartons: n(vue(0), /data-c="/g), absent: n(vue(0), /data-c="1"/g),
      enfonce: [0, 1, 2, 3].map((rot) => n(vue(rot), /data-iso-avarie/g)) };
  });
  egal(r.cartons, 3, 'cartons dessinés');
  egal(r.absent, 0, 'le carton absent n’est pas dessiné');
  egal(r.enfonce, [0, 1, 1, 0], 'enfoncement visible selon la vue (avant, côté droit, arrière, côté gauche)');
});

// La charge de la scène (D-5, décision 52) : 8 fûts par défaut, les places vides en moins, et une palette posée sur une
// autre est dessinée plus haut (gerbage du stockage de masse). Un fût = un tracé au dégradé métal.
await v('Kit iso : la charge de la scène porte 8 fûts (7 si déclaré), une palette gerbée se dessine un niveau plus haut', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection();
    const sc = K.compilerScene({ decor: [{ type: 'couloirMasse', id: 'M01', profondeur: 2 }], lots: { S24: { couleur: 'bleu' } } });
    const futs = (s) => (s.match(/url\(#isoMetal\)/g) || []).length;
    const rect = (s) => +/<rect x="[^"]+" y="([^"]+)"/.exec(s)[1];
    const bas = K.dessinerCharge(I, { x: 0, y: 0, z: 0, lot: 'S24' }, sc);
    const haut = K.dessinerCharge(I, { x: 0, y: 0, z: K.HAUT_NIVEAU, lot: 'S24' }, sc);
    return { huit: futs(bas), sept: futs(K.dessinerCharge(I, { x: 0, y: 0, z: 0, futs: 7 }, sc)), zero: futs(K.dessinerCharge(I, { x: 0, y: 0, z: 0, futs: 0 }, sc)),
      ecart: Math.round(rect(bas) - rect(haut)), attendu: Math.round(K.HAUT_NIVEAU * I.unite), FUTS: K.FUTS_PALETTE };
  });
  egal(r.FUTS, 8, 'huit fûts par palette (décision 52)');
  egal([r.huit, r.sept, r.zero], [8, 7, 0], 'fûts dessinés : par défaut, futs: 7, futs: 0');
  egal(r.ecart, r.attendu, 'l’étiquette de la palette du dessus monte d’un niveau');
});

await v('Animation : contenu fautif refusé au chargement (pas, place, objet, juste, type de décor)', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-animation.js');
    const { ANIMATION_ESSAI: A } = await import('/contenus/animation-essai.js');
    const copie = () => JSON.parse(JSON.stringify(A));
    const essai = (f) => { const x = copie(); f(x); try { creerEntreprise(E.univers({ animation: x })); return ''; } catch (e) { return e.message; } };
    return {
      bon: essai(() => {}),
      pas: essai((x) => { x.parties[0].pas.splice(3, 0, { sauter: 1 }); }),
      place: essai((x) => { x.parties[0].pas.find((p) => p.geste).place = 'M09.fond'; }),
      objet: essai((x) => { x.parties[0].pas.splice(0, 1); }),
      juste: essai((x) => { x.parties[1].question.juste = 4; }),
      decor: essai((x) => { x.scene.decor.push({ type: 'camion' }); }),
      occupee: essai((x) => { x.parties[0].pas.find((p) => p.geste === 'poser' && p.objet === 'b').place = 'M01.fond'; }),
      bulle: essai((x) => { x.parties[0].pas.push({ effacer: ['inconnue'] }); }),
    };
  });
  egal(r.bon, '', 'le contenu d’essai se charge');
  vrai(/pas n° 4 : pas inconnu/.test(r.pas), `pas inconnu : ${r.pas}`);
  vrai(/place inconnue « M09\.fond »/.test(r.place), `place : ${r.place}`);
  vrai(/objet « a » pas encore créé/.test(r.objet), `objet : ${r.objet}`);
  vrai(/`juste` = 4 hors des choix/.test(r.juste), `juste : ${r.juste}`);
  vrai(/type inconnu « camion »/.test(r.decor), `décor : ${r.decor}`);
  vrai(/M01\.fond est déjà occupée/.test(r.occupee), `place occupée : ${r.occupee}`);
  vrai(/aucune bulle « inconnue »/.test(r.bulle), `bulle : ${r.bulle}`);
});

await v('Animation : séance neuve — jalons « à faire », jamais faux ; rien répondu = 0 au bilan', async () => {
  await monter(pg, { db: {} });
  egal(await jalons(pg), ['attente', 'attente'], 'jalons d’une séance neuve');
  const e = await pg.evaluate(() => window.__a.enregistres.at(-1));
  egal([e.score, e.max], [0, 2], 'score remonté au suivi');
  // Le menu : l'animation est rangée dans « Mon poste ».
  const groupe = await pg.$eval(`${Z} .ent-nav[data-vue^="animation:"]`, (b) => { let x = b.previousElementSibling; while (x && !x.classList.contains('ent-sep')) x = x.previousElementSibling; return x && x.textContent.trim(); });
  egal(groupe, 'Mon poste', 'groupe du menu');
});

await v('Animation : première réponse gardée — faux puis juste = jalon non franchi', async () => {
  await monter(pg, { db: {} });
  await attendreQuestion(pg);
  await repondre(pg, 0);
  vrai(await pg.$(`${Z} [data-anim-choix="1"].juste`), 'la bonne réponse est marquée après validation');
  vrai(await pg.$(`${Z} [data-anim-choix="0"].faux`), 'la réponse fausse est marquée');
  await pg.click(`${Z} [data-anim-refaire]`);
  await repondre(pg, 1);
  const e = await etatAnim(pg);
  egal(e.reponses.q1.premiere, 0, 'première réponse rangée');
  egal((await jalons(pg))[0], 'ko', 'jalon 1 après faux puis juste');
  vrai((await pg.textContent(`${Z} .anim-premiere`)).includes('reste celle qui compte'), 'l’élève sait que la 1re compte');
});

await v('Animation : première réponse gardée — juste puis faux = jalon franchi ; partie 2, question 2, « À retenir »', async () => {
  await monter(pg, { db: {} });
  vrai(await pg.$(`${Z} .anim-aller.ferme`), 'partie 2 fermée avant la question 1 (pas de saut en avant)');
  vrai(!(await pg.$(`${Z} [data-anim-aller="p1"]`)), 'aucun lien vers la partie 2');
  await attendreQuestion(pg);
  await repondre(pg, 1);
  vrai(await pg.$(`${Z} [data-anim-aller="p1"]`), 'partie 2 ouverte après la question 1');
  await pg.click(`${Z} [data-anim-refaire]`);
  await repondre(pg, 3);
  egal((await etatAnim(pg)).reponses.q1.premiere, 1, 'première réponse rangée');
  // Le geste de la question (questions au fil, lot 3) : rangé à la première réponse, cloisonné par séance.
  egal(Object.keys((await base(pg)).gestes['essai-animation']), ['animation:essai-fifo:q1'], 'geste de la question');
  egal((await jalons(pg))[0], 'ok', 'jalon 1 après juste puis faux');
  await pg.click(`${Z} [data-anim-suite]`);
  await pg.waitForSelector(`${Z} [data-anim-q][hidden]`, { state: 'attached', timeout: 2000 });
  egal(await pg.textContent(`${Z} [data-anim-partie]`), 'Partie 2 sur 2 — la bonne façon', 'partie 2 lancée');
  await attendreQuestion(pg);
  await repondre(pg, 2);
  egal(await jalons(pg), ['ok', 'ok'], 'jalons après les deux questions');
  vrai((await pg.textContent(`${Z} [data-anim-texte]`)).startsWith('À retenir'), '« À retenir » dans la légende');
  const e = await pg.evaluate(() => window.__a.enregistres.at(-1));
  egal([e.score, e.max], [2, 2], 'score remonté au suivi');
  // « Tout revoir » : retour à la partie 1, la base ne bouge pas.
  await pg.click(`${Z} [data-anim-suite]`);
  egal(await pg.textContent(`${Z} [data-anim-partie]`), 'Partie 1 sur 2 — l’erreur', 'tout revoir');
  egal((await etatAnim(pg)).reponses.q1.premiere, 1, 'base inchangée après « Tout revoir »');
});

await v('Animation : ordre des choix rangé et lu dans l’ordre DÉCLARÉ (ordre écrit à la main [2, 0, 3, 1])', async () => {
  await monter(pg, { db: { animations: { 'essai-fifo': { reponses: {}, ordres: { q1: [2, 0, 3, 1] }, partie: 0 } } } });
  await attendreQuestion(pg);
  egal(await affiche(pg), [2, 0, 3, 1], 'ordre affiché');
  // Le juste déclaré (1) est affiché en 4e position, lettre D.
  const d = (await pg.textContent(`${Z} [data-anim-choix]:nth-child(4)`)).trim();
  vrai(d.startsWith('D. Le chariot entre par l’allée'), `4e bouton : ${d}`);
  await pg.click(`${Z} [data-anim-choix]:nth-child(4)`);
  await pg.click(`${Z} [data-anim-valider]`);
  egal((await etatAnim(pg)).reponses.q1.premiere, 1, 'rang déclaré rangé (pas le rang affiché)');
  egal((await jalons(pg))[0], 'ok', 'jalon 1');
});

await v('Animation : ordre tiré par élève, rangé, identique au retour (rechargement)', async () => {
  await monter(pg, { db: {} });
  await attendreQuestion(pg);
  const o1 = await affiche(pg);
  const range = (await etatAnim(pg)).ordres.q1;
  egal(range, o1, 'ordre rangé = ordre affiché');
  const db = await base(pg);
  await monter(pg, { db });
  await attendreQuestion(pg);
  egal(await affiche(pg), o1, 'même ordre au retour');
  // Revenir après avoir répondu : la question montre la première réponse et la correction.
  await repondre(pg, 0);
  await monter(pg, { db: await base(pg) });
  await attendreQuestion(pg);
  vrai(await pg.$(`${Z} [data-anim-choix="0"].faux`) && await pg.$(`${Z} [data-anim-choix="1"].juste`), 'première réponse et correction au retour');
  vrai(await pg.$(`${Z} [data-anim-suite]`), 'la suite est ouverte au retour');
});

await v('Animation : enseignant — navigation libre, bonne réponse marquée, rien écrit', async () => {
  await monter(pg, { db: {}, role: 'prof' });
  vrai(!(await pg.$(`${Z} .anim-aller.ferme`)), 'aucune partie fermée');
  await pg.click(`${Z} [data-anim-aller="q1"]`);
  await attendreQuestion(pg, 2000);
  vrai(await pg.$(`${Z} [data-anim-choix="2"].attendu`), 'bonne réponse de la question 2 marquée dès l’ouverture');
  await repondre(pg, 0);
  egal(((await etatAnim(pg)) || {}).reponses || {}, {}, 'aucune réponse écrite');
  egal(((await etatAnim(pg)) || {}).ordres || {}, {}, 'aucun ordre écrit');
});

await v('Animation : cloisonnement — deux séances, deux animations d’id différent, réponses indépendantes', async () => {
  await monter(pg, { db: {}, seance: 'seance-a' });
  await attendreQuestion(pg);
  await repondre(pg, 0);
  const db = await base(pg);
  await monter(pg, { db, seance: 'seance-b', id: 'autre-fifo' });
  await attendreQuestion(pg);
  vrai(await pg.$(`${Z} [data-anim-valider]`), 'la question de la 2e séance est neuve');
  await repondre(pg, 1);
  const b = await base(pg);
  egal(b.animations['essai-fifo'].reponses.q1.premiere, 0, '1re séance intacte');
  egal(b.animations['autre-fifo'].reponses.q1.premiere, 1, '2e séance');
});

await v('Animation : hors Simulog — une question = un point, remonté au suivi', async () => {
  await monter(pg, { db: {}, hors: true });
  vrai(!(await pg.$(`${Z} .ent-nav`)), 'pas de menu d’entreprise');
  await attendreQuestion(pg);
  await repondre(pg, 1);
  const e = await pg.evaluate(() => window.__a.enregistres.at(-1));
  egal([e.score, e.max], [1, 2], 'score après la question 1');
  const n = await pg.evaluate(async () => { const { creerAnimation } = await import('/core/types/animation.js'); return creerAnimation(window.__a.A).noter(window.__a.db); });
  egal([n.score, n.max], [1, 2], 'noter(db)');
});

await v('Animation : quitter l’écran pendant une partie — plus aucun redessin, aucune erreur', async () => {
  await monter(pg, { db: {}, vitesse: 0.8 });
  await pg.waitForTimeout(2600);
  await pg.evaluate(() => { window.__dyn = document.querySelector('#anTest [data-anim-dyn]'); });
  await pg.click(`${Z} .ent-nav[data-vue="accueil"]`);
  await pg.waitForTimeout(150);
  const avant = await pg.evaluate(() => window.__dyn.innerHTML);
  await pg.waitForTimeout(1500);
  const apres = await pg.evaluate(() => ({ html: window.__dyn.innerHTML, branche: window.__dyn.isConnected }));
  vrai(!apres.branche, 'la scène a quitté la page');
  vrai(avant.length > 0, 'le chariot était en route');
  egal(apres.html === avant, true, 'aucun redessin après la sortie');
  egal(erreursA, [], 'erreurs JS');
});

await v('Animation : 1366 × 768 et 1280 × 720 — aucun défilement', async () => {
  const r = [];
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pg.setViewportSize({ width: w, height: h });
    await monter(pg, { db: {} });
    r.push(await pg.evaluate(() => {
      const top = document.querySelector('#anTest').getBoundingClientRect().top;
      const bas = document.querySelector('#anTest .anim').getBoundingClientRect().bottom;
      return Math.ceil(bas - top) <= window.innerHeight;
    }));
  }
  await pg.setViewportSize({ width: 1366, height: 768 });
  egal(r, [true, true], 'tient dans la fenêtre');
});

await v('Animation : mouvement réduit — la partie 1 atteint sa question, les bulles apparaissent', async () => {
  const ctxR = await nav.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const p = await nouvellePage(ctxR);
  // Les attentes de la partie 1 font 13,5 s ; à la vitesse 4, 3,4 s. Les déplacements sont instantanés,
  // mais les attentes restent (sinon la partie défile en une seconde et l'élève ne lit rien).
  const t0 = Date.now();
  await monter(p, { db: {}, vitesse: 4 });
  await p.waitForSelector(`${Z} [data-anim-bulle]`, { timeout: 4000 });
  await attendreQuestion(p, 9000);
  const duree = Date.now() - t0;
  vrai(duree >= 2800, `partie 1 jouée en ${duree} ms : les attentes ont sauté`);
  egal(await p.$$eval(`${Z} [data-anim-bulle]`, (L) => L.length), 0, 'bulles effacées à la question');
  await ctxR.close();
  egal(erreursA, [], 'erreurs JS');
});

/* ============================================== écrans de présentation (chantier D-5) */
// Textes et ordre écrits à la main d'après le brief ENT-6.5 §4 (étape 0, puis le mot FIFO expliqué).
const ecranVu = (p) => p.$$eval(`${Z} [data-anim-ecran]`, (L) => L.filter((s) => !s.hidden).map((s) => `${Number(s.dataset.animEcran) + 1} ${s.querySelector('h2').textContent}`));
const filmVisible = (p) => p.$eval(`${Z} [data-anim-film]`, (f) => !f.hidden).catch(() => null);

await v('Écrans : « Le matériel » seul — chariot, puis palette de rétention, Précédent / Suivant, aucun jalon, vu rangé à la fin', async () => {
  const p = pg;
  await monter(p, { ecrans: true, vue: 'essai-materiel' });
  egal(await ecranVu(p), ['1 Le chariot frontal'], 'premier écran');
  vrai(/CACES R489 catégorie 3/.test(await p.textContent(`${Z} [data-anim-ecran="0"]`)), 'texte du chariot');
  egal(await p.$eval(`${Z} [data-anim-ecran="0"] img`, (i) => i.getAttribute('src')), './contenus/images/france-boissons/materiel-chariot-frontal.svg', 'dessin du chariot');
  vrai(!(await p.$(`${Z} [data-anim-ecran="0"] [data-anim-ecran-prec]`)), 'pas de « Précédent » au premier écran');
  egal((await etatAnim(p, 'essai-materiel') || {}).ecransVus, undefined, 'rien de rangé au premier écran');
  await p.click(`${Z} [data-anim-ecran="0"] [data-anim-ecran-suiv]`);
  egal(await ecranVu(p), ['2 La palette de rétention'], 'second écran');
  egal(await p.$eval(`${Z} [data-anim-ecran="1"] img`, (i) => i.complete && i.naturalWidth > 0), true, 'le dessin de la palette se charge');
  vrai(!(await p.$(`${Z} [data-anim-ecran="1"] [data-anim-ecran-suiv]`)), 'le dernier écran n’a pas de « Suivant » (aucune animation après)');
  egal((await etatAnim(p, 'essai-materiel')).ecransVus, true, 'vu jusqu’au bout');
  await p.click(`${Z} [data-anim-ecran="1"] [data-anim-ecran-prec]`);
  egal(await ecranVu(p), ['1 Le chariot frontal'], 'retour au premier');
  const etapes = await p.evaluate(async () => {
    const { etapesAnimation } = await import('/core/types/animation.js');
    const C = await import('/contenus/animation-essai.js');
    return etapesAnimation(C.MATERIEL_ESSAI).length;
  });
  egal(etapes, 0, 'aucun jalon (non noté)');
});

await v('Écrans : le mot FIFO avant l’animation — l’animation attend « Voir l’animation », puis on y revient directement ; lien pour revoir le mot', async () => {
  const p = pg;
  await monter(p, { ecrans: true, vue: 'essai-fifo' });
  egal(await ecranVu(p), ['1 FIFO, le mot expliqué'], 'l’écran du mot d’abord');
  egal(await filmVisible(p), false, 'l’animation est cachée');
  await p.waitForTimeout(600);
  egal(await p.$$eval(`${Z} [data-anim-bulle]`, (L) => L.length), 0, 'l’animation ne tourne pas derrière');
  egal(await p.textContent(`${Z} [data-anim-ecran="0"] [data-anim-ecran-suiv]`), 'Voir l’animation ▶', 'bouton du dernier écran');
  await p.click(`${Z} [data-anim-ecran="0"] [data-anim-ecran-suiv]`);
  egal(await filmVisible(p), true, 'l’animation s’affiche');
  await p.waitForSelector(`${Z} [data-anim-bulle]`, { timeout: 4000 });
  const db = await base(p);
  egal(db.animations['essai-fifo'].ecransVus, true, 'vu rangé');
  // Revenir sur l'écran : l'animation repart directement.
  await monter(p, { ecrans: true, vue: 'essai-fifo', db });
  egal(await filmVisible(p), true, 'au retour : l’animation directement');
  egal(await ecranVu(p), [], 'aucun écran de présentation affiché');
  await p.click(`${Z} [data-anim-ecrans-revoir]`);
  egal(await ecranVu(p), ['1 FIFO, le mot expliqué'], '« Revoir le mot FIFO » ramène l’écran');
  egal(await filmVisible(p), false, 'et cache l’animation');
});

await v('Écrans : contenu fautif refusé (4 blocs, image d’un autre site, image sans texte, rien à montrer)', async () => {
  const r = await pg.evaluate(async () => {
    const { compilerAnimation } = await import('/core/types/animation.js');
    const C = await import('/contenus/animation-essai.js');
    const essai = (f) => { const x = JSON.parse(JSON.stringify(C.MATERIEL_ESSAI)); f(x); try { compilerAnimation(x); return ''; } catch (e) { return e.message; } };
    return {
      bon: essai(() => {}),
      blocs: essai((x) => { x.ecrans[0].blocs.push('un de trop'); }),
      dehors: essai((x) => { x.ecrans[0].image.src = '//exemple.invalid/chariot.svg'; }),
      alt: essai((x) => { delete x.ecrans[1].image.alt; }),
      vide: essai((x) => { x.ecrans = []; }),
    };
  });
  egal(r.bon, '', 'le contenu d’essai');
  vrai(/de 1 à 3 `blocs`/.test(r.blocs), r.blocs);
  vrai(/doit venir du site/.test(r.dehors), r.dehors);
  vrai(/besoin de `src` et de `alt`/.test(r.alt), r.alt);
  vrai(/au moins une partie, ou des `ecrans`/.test(r.vide), r.vide);
});

// ------------------------------------------------ l'allée de picking d'ENT-6.7 (D-7 lot 2, `core/iso.js`)
// Ce qui vaut son prix : le CODE DÉTROMPEUR n'est dans le dessin que si la vue de près le demande (brief 6.7 §8 : « le code
// n'est pas dans le DOM de l'allée ») ; le fût cabossé n'est dessiné cabossé que s'il est déclaré ; une pile pose ce qui
// vient dessus à la hauteur de ce qui est dessous (le critère « fût sur casier » du lot 4 lira ces hauteurs) ; un nom de teinte
// ou un nombre impossible est refusé ; aucun vert. Le reste (l'allure) se juge sur `outils/essai-kit-iso.html`.
await v('Kit iso, picking : le code détrompeur n’est dessiné qu’avec l’étiquette de lisse (vue de près)', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 150 });
    const c = { type: 'fut', n: 2, litres: 20, bande: 'cuivre', abimes: 1 };
    const loin = K.traveePicking(I, 0, 0, { cote: 'A', contenu: c });
    const pres = K.traveePicking(I, 0, 0, { cote: 'A', contenu: c, etiquette: { adresse: 'A-T03-N1', designation: 'Affligem Blonde 20 L', lot: 'S18', code: '49' } });
    const refus = (o) => { try { K.traveePicking(I, 0, 0, o); return ''; } catch (e) { return e.message; } };
    return { loin: /data-iso-code|>49</.test(loin), pres: />49<\/text>/.test(pres) && /data-iso-code/.test(pres), lot: /lot S18/.test(pres),
      coteB: refus({ cote: 'B', etiquette: { code: '83' } }) };
  });
  egal(r.loin, false, 'le code dans la travée vue de loin');
  egal(r.pres, true, 'le code dans la vue de près');
  egal(r.lot, true, 'le lot écrit sur l’étiquette');
  vrai(/que côté A/.test(r.coteB), `étiquette côté B : ${r.coteB}`);
});

await v('Kit iso, picking : tiroir — n fûts, les cabossés seulement ceux déclarés ; vide ; trop plein, teinte ou type inconnus refusés', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 100 });
    const n = (s, m) => (s.match(m) || []).length;
    const tr = (c) => K.traveePicking(I, 0, 0, { cote: 'A', contenu: c });
    const refus = (c) => { try { tr(c); return ''; } catch (e) { return e.message; } };
    const a = tr({ type: 'fut', n: 2, abimes: 1 }), b = tr({ type: 'fut', n: 7 }), vide = tr({ type: 'fut', n: 0 }), cas = tr({ type: 'casier', n: 8, capsule: 'bleu' });
    return { futsA: n(a, /data-iso-objet="fut"/g), abimesA: n(a, /data-iso-avarie/g), futsB: n(b, /data-iso-objet="fut"/g), abimesB: n(b, /data-iso-avarie/g),
      vide: n(vide, /data-iso-objet="(fut|casier)"/g), casiers: n(cas, /data-iso-objet="casier"/g),
      trop: refus({ type: 'fut', n: 9 }), teinte: refus({ type: 'fut', n: 1, bande: 'vert' }), type: refus({ type: 'bidon', n: 1 }) };
  });
  egal([r.futsA, r.abimesA], [2, 1], 'A-T03 : 2 fûts dont 1 cabossé');
  egal([r.futsB, r.abimesB], [7, 0], 'A-T04 : 7 fûts, aucun cabossé');
  egal(r.vide, 0, 'emplacement vide : rien dans le tiroir');
  egal(r.casiers, 8, 'A-T01 : 8 casiers');
  vrai(/9 fûts dans un tiroir de 8 places/.test(r.trop), r.trop);
  vrai(/teinte de fût « vert » inconnue/.test(r.teinte), r.teinte);
  vrai(/contenu de tiroir « bidon » inconnu/.test(r.type), r.type);
});

await v('Kit iso, picking : casier plein (12 capsules) ou vide ; palette client — pile à la bonne hauteur, étiquettes et film, 7 piles refusées', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 100 });
    const n = (s, m) => (s.match(m) || []).length;
    const fut = { type: 'fut', litres: 30 }, cas = { type: 'casier', capsule: 'jaune' };
    const pal = K.paletteClient(I, 0, 0, { piles: [[cas, fut], [fut, cas], [], [fut, fut]], film: 3, etiquettes: ['avant', 'arriere', 'dessus'] });
    const z = (type) => [...pal.matchAll(new RegExp(`data-iso-objet="${type}" (?:data-litres="\\d+" )?data-z="([\\d.]+)"`, 'g'))].map((m) => +m[1]).sort();
    const refus = (o) => { try { K.paletteClient(I, 0, 0, o); return ''; } catch (e) { return e.message; } };
    return { plein: n(K.casier(I, 0, 0, 0, { capsule: 'bleu' }), /data-iso-capsule/g), vide: n(K.casier(I, 0, 0, 0, { vide: true }), /data-iso-capsule/g),
      zFuts: z('fut'), zCasiers: z('casier'), film: /data-iso-film="3"/.test(pal),
      etiq: /data-iso-etiquettes="avant arriere dessus"/.test(pal), dessinees: [...pal.matchAll(/data-iso-etiquette="(\w+)"/g)].map((m) => m[1]),
      sept: refus({ piles: [[], [], [], [], [], [], []] }), cote: refus({ etiquettes: ['devant'] }) };
  });
  egal([r.plein, r.vide], [12, 0], 'capsules : casier plein, casier vide');
  // Plancher 0,144 ; casier 0,30 ; fût 30 L 0,46 (valeurs écrites à la main).
  egal(r.zFuts, [0.144, 0.144, 0.444, 0.604], 'hauteur du pied des fûts (sur le plancher, sur un casier, sur un fût)');
  egal(r.zCasiers, [0.144, 0.604], 'hauteur du pied des casiers (sur le plancher, sur un fût)');
  egal(r.film, true, 'film : 3 tours');
  egal(r.etiq, true, 'les côtés étiquetés, tous écrits');
  egal(r.dessinees, ['avant', 'dessus'], 'seules les étiquettes visibles d’ici sont dessinées');
  vrai(/7 piles sur une palette client de 6 cases/.test(r.sept), r.sept);
  vrai(/côté d’étiquette « devant » inconnu/.test(r.cote), r.cote);
});

await v('Kit iso, picking : le préparateur porte casque et terminal sur demande seulement ; aucun vert dans les dessins nouveaux', async () => {
  const r = await pg.evaluate(async () => {
    const K = await import('/core/iso.js');
    const I = K.projection({ unite: 120 });
    const tout = K.traveePicking(I, 0, 0, { cote: 'A', contenu: { type: 'fut', n: 8, abimes: 1, bande: 'or' }, etiquette: { adresse: 'A', code: '1' } })
      + K.traveePicking(I, 0, 2, { cote: 'B', contenu: { type: 'casier', n: 12, capsule: 'jaune' }, voile: .3 })
      + Object.keys(K.TEINTES_FUT).map((b) => K.futDebout(I, 0, 0, 0, { bande: b })).join('')
      + Object.keys(K.TEINTES_CAPSULE).map((c) => K.casier(I, 0, 0, 0, { capsule: c })).join('')
      + K.paletteClient(I, 0, 0, { piles: [[{ type: 'casier' }, { type: 'fut', abime: true }]], film: 5, etiquettes: ['avant', 'droite', 'dessus'], casesVisibles: true })
      + K.personne(I, 0, 0, { casque: true, terminal: true });
    // Une teinte « verte » : teinte entre 75° et 165°, saturée (au-delà de 25 %), pas trop sombre ni trop claire.
    const vert = (r, g, b) => { const M = Math.max(r, g, b) / 255, m = Math.min(r, g, b) / 255, l = (M + m) / 2, d = M - m;
      if (d < 1e-6) return false; const s = d / (1 - Math.abs(2 * l - 1));
      let h = M === r / 255 ? ((g - b) / 255 / d) % 6 : M === g / 255 ? (b - r) / 255 / d + 2 : (r - g) / 255 / d + 4; h = (h * 60 + 360) % 360;
      return h >= 75 && h <= 165 && s > .25 && l > .12 && l < .9; };
    const verts = [];
    for (const m of tout.matchAll(/#([0-9a-f]{6})\b/gi)) { const v = parseInt(m[1], 16); if (vert(v >> 16, (v >> 8) & 255, v & 255)) verts.push(m[0]); }
    for (const m of tout.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)) if (vert(+m[1], +m[2], +m[3])) verts.push(m[0]);
    return { sans: /data-iso-casque|data-iso-terminal/.test(K.personne(I, 0, 0)), avec: /data-iso-casque/.test(tout) && /data-iso-terminal/.test(tout), verts: [...new Set(verts)] };
  });
  egal(r.sans, false, 'personne sans option : ni casque ni terminal');
  egal(r.avec, true, 'personne avec casque et terminal');
  egal(r.verts, [], 'teintes vertes dans les dessins de l’allée');
});

await ctxA.close();
}
