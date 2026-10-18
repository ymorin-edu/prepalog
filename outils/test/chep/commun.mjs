// Suite de tests de Prepalog — les aides COMMUNES des blocs CHEP (`chep-91` … `chep-94`).
// Créé le 18/10/2026 avec ENT-9.1, sur le modèle de `outils/test/france-boissons/commun.mjs` (sous-dossier exprès : le lanceur
// refuse tout `.mjs` posé directement dans `outils/test/` qui ne serait pas dans `BLOCS`, mais il ne regarde pas les dossiers).
//
// Ces aides ferment sur la page (`pg`) : elles sont fabriquées par `ouvrirCHEP`, qui ouvre un contexte et une page à CHAQUE bloc.
// `monter(o)` monte une séance d'entreprise dans la page avec une base en mémoire (montage de test, sans accueil ni connexion) :
// `o.activite` (chemin du fichier d'activité), `o.id` (id de la séance, pour les réponses d'ouverture), `o.db` (base de départ),
// `o.uid`, `o.aisance`, `o.rep` (réponses d'« Avant de commencer » posées d'avance ; `o.sansOuverture` : rien de répondu).

export const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };
export const horodate = (ts) => { const d = new Date(ts); return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]; };

export async function ouvrirCHEP({ nav, BASE }) {
  const ctxF = await nav.newContext({ viewport: { width: 1366, height: 900 } });
  const erreursF = [];
  const pg = await ctxF.newPage();
  pg.setDefaultTimeout(6000);
  pg.on('pageerror', (e) => erreursF.push('PAGEERROR: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursF.push('CONSOLE: ' + m.text()); });
  pg.on('dialog', (d) => d.accept());
  await pg.goto(BASE);
  await pg.waitForSelector('#btnProf', { timeout: 8000 });
  const Z = '#fTest';
  const pause = (ms = 80) => pg.waitForTimeout(ms);
  const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
  const note = () => pg.evaluate(() => { const L = window.__f.enregistres; return L.length ? L[L.length - 1] : null; });
  const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
  const aller = async (vue) => { await pg.evaluate(({ Z, vue }) => document.querySelector(`${Z} .ent-nav[data-vue="${vue}"]`).click(), { Z, vue }); await pause(); };
  const menu = () => pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.dataset.vue || `fermee:${b.dataset.vueFermee}`));
  const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
  const bandeau = () => pg.$$eval(`${Z} [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finJalon, x.dataset.finEtat]));
  const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
  const clic = async (sel) => { await pg.click(`${Z} ${sel}`); await pause(); };
  // Monte la séance dans la page (voir l'en-tête).
  const monter = (o = {}) => pg.evaluate(async (o) => {
    const A = await import(o.activite);
    document.querySelector('#fTest')?.remove();
    const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
    const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
    if (o.rep) {
      const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
      for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
    }
    window.__f = { db, enregistres: [] };
    A.rendre(hote, {
      meta: A.meta, aisance: o.aisance || 'standard',
      profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ch' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'CH',
      lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
    });
    return JSON.parse(JSON.stringify(db));
  }, o);
  return { ctxF, pg, erreursF, Z, pause, base, note, present, aller, menu, texte, bandeau, entrants, clic, monter, horodate, proche,
    fermer: () => ctxF.close() };
}
