// Suite de tests de Prepalog — les aides COMMUNES des blocs France Boissons (`fb-6.1` … `fb-6.6`).
// Créé le 12/10/2026, au découpage de l'ancien bloc `france-boissons` (8 min 20 d'un seul tenant) en un bloc par séance.
//
// Ce fichier est dans un sous-dossier exprès : le lanceur (`outils/test.mjs`) refuse tout `.mjs` posé directement dans
// `outils/test/` qui ne serait pas dans `BLOCS`, mais il ne regarde pas les dossiers.
//
// Ces aides ferment sur la page (`pg`) : elles sont donc fabriquées par `ouvrirFB`, qui ouvre un contexte et une page
// à CHAQUE bloc (les six blocs ne se partagent rien, pas même la page). Seules y vivent les aides qu'au moins deux séances
// utilisent ; ce qui ne sert qu'à une séance (`monter63`, `qrep65`…) reste dans le fichier de cette séance.

// Écart de note toléré : les notes sont des demi-points ou des quarts de point.
export const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };

// L'heure d'un message, en heure locale (ce que la Messagerie affiche) : [année, mois, jour, heure, minute].
export const horodate = (ts) => { const d = new Date(ts); return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]; };

// Ouvre le contexte (1366×900), la page de la séance et le relevé d'erreurs JavaScript. `erreursF` est le tableau lui-même
// (pas une copie) : le cas de la section D-1 bis d'ENT-6.1 y retire les erreurs attendues par `splice`.
// Rend les aides et `fermer()`, à appeler à la fin du bloc.
export async function ouvrirFB({ nav, BASE }) {
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
  const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
  const bandeau = () => pg.$$eval(`${Z} [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finJalon, x.dataset.finEtat]));
  const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
  const calcPresente = () => pg.evaluate(() => !!document.getElementById('calculetteFlottante'));
  const nettoyerCalc = () => pg.evaluate(() => document.getElementById('calculetteFlottante')?.remove());

  return {
    ctxF, pg, erreursF, Z, pause, base, note, present, aller, texte, bandeau, entrants, horodate, proche, calcPresente, nettoyerCalc,
    fermer: () => ctxF.close(),
  };
}
