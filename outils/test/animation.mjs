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

export default async function bloc({ v, nav, BASE }) {

const egal = (a, b, quoi) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${quoi} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`); };
const vrai = (c, quoi) => { if (!c) throw new Error(quoi); };

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
  creerEntreprise(E.univers({ animation: A })).rendre(hote, ctx);
  document.querySelector('#anTest .ent-nav[data-vue^="animation:"]').click();
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

await ctxA.close();
}
