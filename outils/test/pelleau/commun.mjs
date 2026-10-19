// Suite de tests de Prepalog — les aides COMMUNES des blocs Transports Pelleau (`pelleau-101` … `pelleau-112`).
// Créé le 19/10/2026 avec ENT-10.1, sur le modèle de `outils/test/chep/commun.mjs` et des aides d'`outils/test/action-81.mjs` (sous-dossier
// exprès : le lanceur refuse tout `.mjs` posé directement dans `outils/test/` qui ne serait pas dans `BLOCS`, mais il ne regarde pas les dossiers).
//
// `ouvrirPelleau({ nav, BASE, vrai, activite, id })` ouvre un contexte et une page 1366 × 768 (de vrais clics à la SOURIS, au centre de
// `boundingBox()` après `scrollIntoViewIfNeeded()`), et rend les aides qui ferment sur cette page :
//   `monter(o)` monte la séance dans la page avec une base en mémoire (montage de test, sans accueil ni connexion) : `o.db` (base de départ,
//   copiée), `o.uid` (la graine), `o.aisance`, `o.role`, `o.rep` (réponses d'« Avant de commencer » posées d'avance), `o.sansOuverture`.
//   `qFil(R)` répond aux questions au fil ouvertes (réponse `R[id]`), `jouerCarte(fautes)` joue la carte « Localiser », etc.

export const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };

export async function ouvrirPelleau({ nav, BASE, vrai, activite, id }) {
  const ctxP = await nav.newContext({ viewport: { width: 1366, height: 768 } });
  const pg = await ctxP.newPage();
  pg.setDefaultTimeout(8000);
  const erreurs = [];
  const hotes = new Set();
  pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
  pg.on('dialog', (d) => d.accept());
  await pg.goto(BASE);
  await pg.waitForSelector('#btnProf', { timeout: 8000 });
  await pg.emulateMedia({ reducedMotion: 'reduce' });

  const Z = '#fTest';
  const pause = (ms = 80) => pg.waitForTimeout(ms);
  const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
  const note = () => pg.evaluate(() => { const L = window.__f.enregistres; return L.length ? L[L.length - 1] : null; });
  const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
  const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
  const bandeau = () => pg.$$eval(`${Z} [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finJalon, x.dataset.finEtat]));
  const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
  const menu = () => pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => (b.dataset.vue ? b.dataset.vue : `fermee:${b.dataset.vueFermee}`)));

  // Un clic à la SOURIS au centre de l'élément (après l'avoir fait venir à l'écran).
  async function clic(sel) {
    const el = await pg.waitForSelector(`${Z} ${sel}`, { state: 'visible' });
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    vrai(b && b.width > 0 && b.height > 0, `« ${sel} » n’a pas de place à l’écran`);
    await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  }
  const aller = async (vue) => { await clic(`.ent-nav[data-vue="${vue}"]`); await pause(); };

  const monter = (o = {}) => pg.evaluate(async (o) => {
    const A = await import(o.activite);
    document.querySelector('#fTest')?.remove();
    const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
    const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
    if (!o.sansOuverture) {
      const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
      for (const [k, r] of Object.entries(o.rep || {})) if (!Q[k]) Q[k] = { arrivee: 1, premiere: r, duree: 1 };
    }
    window.__f = { db, enregistres: [] };
    A.rendre(hote, {
      meta: A.meta, aisance: o.aisance || 'standard',
      profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'pelleau' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'PE',
      lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
    });
    return JSON.parse(JSON.stringify(db));
  }, { activite, id, ...o });

  // Les questions au fil : répond au panneau ouvert (réponse de `R`), puis « Reprendre », tant qu'il y en a une.
  async function qFil(R) {
    for (let i = 0; i < 5; i++) {
      const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
      if (!q) return;
      vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
      await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`);
      await clic(`[data-q-repondre="${q}"]`);
      await pause();
      await clic('[data-q-reprendre]');
      await pause();
    }
  }

  // ── la carte (vue « Localiser ») : aides reprises du bloc `action-81` (souris sur un point que `elementFromPoint` confirme).
  const R = `${Z} [data-lc]`;
  const lire = () => pg.evaluate((R) => document.querySelector(R).__lc.lire(), R);
  const immobile = () => pg.evaluate((R) => new Promise((ok) => {
    let y = null, n = 0;
    const f = () => {
      const r = document.querySelector(R), s = r && r.querySelector('[data-ct-svg]');
      const cle = (r && r.__lc && r.__lc.lire().anime ? 'anime' : '') + '|' + (s ? s.getAttribute('viewBox') : '');
      if (cle === y && !cle.startsWith('anime')) n++; else { n = 0; y = cle; }
      if (n >= 5) ok(); else requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }), R);
  async function cliquerCarte(cle) {
    await immobile();
    const el = await pg.$(`${R} [data-lc-cle="${cle}"]`);
    vrai(el, `aucun élément cliquable « ${cle} »`);
    await el.scrollIntoViewIfNeeded();
    const pt = await pg.evaluate(({ R, cle }) => {
      const el = document.querySelector(`${R} [data-lc-cle="${cle}"]`);
      const b = el.getBoundingClientRect();
      for (let n = 2; n <= 24; n *= 2) {
        for (let i = 1; i < n; i++) for (let j = 1; j < n; j++) {
          const x = b.left + (b.width * i) / n, y = b.top + (b.height * j) / n;
          const t = document.elementFromPoint(x, y);
          if (t && t.closest('[data-lc-cle]') === el) return { x, y };
        }
      }
      return null;
    }, { R, cle });
    vrai(pt, `aucun point de « ${cle} » n'est cliquable à l'écran`);
    await pg.mouse.click(pt.x, pt.y);
  }
  const carteJuste = async () => { const l = await lire(); await cliquerCarte(l.bon); await immobile(); };
  async function carteFaux() {
    await immobile();
    const l = await lire();
    const cle = await pg.evaluate(({ R, bon }) => [...document.querySelectorAll(`${R} [data-lc-cle]`)].map((e) => e.dataset.lcCle).find((c) => c !== bon), { R, bon: l.bon });
    await cliquerCarte(cle);
    await pg.waitForTimeout(60);
  }
  const boutonCarte = async (quoi) => { await immobile(); await clic(`[data-lc] [data-lc-bouton="${quoi}"]`); await immobile(); };
  // Toute la carte. `fautes` : { 'rungis:region': 1, … } = le nombre de mauvais clics avant le bon à cette étape. Après chaque étape, la
  // question au fil éventuelle est répondue (`Q`). `avant(x)` : appelé avant chaque étape (captures, contrôles).
  async function jouerCarte(fautes = {}, Q = {}, { avant } = {}) {
    await aller('localiser');
    for (let k = 0; k < 6; k++) {
      const l = await lire();
      if (l.etape === 'fin') break;
      for (const et of ['region', 'departement', 'ville']) {
        const x = await lire();
        if (avant) await avant(x);
        for (let f = 0; f < (fautes[`${x.lieu}:${et}`] || 0); f++) await carteFaux();
        await carteJuste();
        await qFil(Q);
      }
      const n = await pg.$eval(`${R} [data-lc-bouton]`, (b) => b.dataset.lcBouton);
      await boutonCarte(n);
      await qFil(Q);
      if (n === 'bilan') break;
    }
  }

  // Le chemin de l'élève vers une fiche qui vient d'arriver : la carte « Nouveau message » (ou la Messagerie), puis le bouton du message.
  async function ouvrirParMessage(sujet, vue) {
    const mid = await pg.evaluate((s) => (window.__f.db.mails.find((m) => m.folder === 'in' && m.subject === s) || {}).id, sujet);
    vrai(mid != null, `le message « ${sujet} » n’est pas arrivé`);
    if (await present(`[data-carte-lire="${mid}"]`)) await clic(`[data-carte-lire="${mid}"]`);
    else { await aller('mail'); await clic(`[data-mail="${mid}"]`); }
    await pause();
    await clic(`[data-vue2="${vue}"]`);
    await pause();
  }
  // Remplit des listes (`champ(i)` ← `vals[i]`), répond aux questions au fil qui arrivent en route, puis envoie (et confirme).
  async function remplirEnvoyer(champ, vals, Q = {}) {
    for (let i = 0; i < vals.length; i++) {
      await pg.selectOption(`${Z} [data-fiche-champ="${champ(i)}"]`, vals[i]);
      await pause(40);
      await qFil(Q);
    }
    await clic('[data-fiche-envoyer]');
    await clic('[data-confirme-oui]');
    await pause();
    await qFil(Q);
  }
  // Une fiche « ordre » : amène chaque valeur de `ordre` à son rang par les flèches ↑ (null : ne rien toucher), puis envoie.
  async function ordonnerEnvoyer(bloc, ordre, Q = {}) {
    if (ordre) {
      for (let k = 0; k < ordre.length; k++) {
        for (let s = 0; s < 8; s++) {
          const cur = await pg.$$eval(`${Z} [data-fiche-ordre="${bloc}"] li`, (L) => L.map((x) => x.dataset.v));
          const j = cur.indexOf(ordre[k]);
          if (j <= k) break;
          await clic(`[data-fiche-ordre="${bloc}"] li[data-v="${ordre[k]}"] [data-ordre-sens="-1"]`);
          await pause(30);
          await qFil(Q);
        }
      }
    }
    await clic('[data-fiche-envoyer]');
    await clic('[data-confirme-oui]');
    await pause();
    await qFil(Q);
  }

  return { ctxP, pg, erreurs, hotes, Z, R, pause, base, note, present, texte, bandeau, entrants, menu, clic, aller, monter, qFil, lire, immobile,
    cliquerCarte, carteJuste, carteFaux, boutonCarte, jouerCarte, ouvrirParMessage, remplirEnvoyer, ordonnerEnvoyer,
    fermer: () => ctxP.close() };
}
