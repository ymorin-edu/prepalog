// Suite de tests de Prepalog — bloc « stratelog » : Avant l'Hiver (STR-1), une partie de classe jouée à plusieurs postes.
// `node outils/test.mjs stratelog` ne lance que ce bloc. Le moteur de règles a ses propres tests : `node --test stratelog/`.
//
// Une classe de démonstration (4 élèves, 1 enseignant) est posée dans le navigateur ; chaque élève a SON onglet, et
// l'enseignant le sien (le mode démonstration relaie les écritures d'un onglet à l'autre, comme le temps réel). Ce que
// ces cas gardent : le Seigneur forme les villes, les élèves choisissent le blason, le tour s'ouvre avec les présents,
// chacun prend un lot de rôles et ne remplit que SES cases, le dépôt de l'Argentier ferme le registre de la ville,
// « forcer le rendu », clore, résoudre, la chronique arrive chez l'élève, et le retour arrière défait le dernier geste.

import { forcerCatalogue } from './commun.mjs';

export default async function bloc({ v, nav, BASE }) {

const AID = 'stratelog-avant-l-hiver';
const GID = 'strat-2';
const ctxS = await nav.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
// La séance est encore en brouillon (`pret: false`) : ce navigateur de test la voit prête, ouverte au groupe.
await ctxS.route(`**/activites/${AID}.js*`, async (route) => {
  const r = await route.fetch();
  await route.fulfill({ response: r, body: (await r.text()).replace(/pret:\s*false,/, "pret: true, ouverture: 'prof',") });
});
await forcerCatalogue(ctxS, (entrees) => { const e = entrees.find((x) => x.meta.id === AID); e.meta.pret = true; e.meta.ouverture = 'prof'; });

const prof = await ctxS.newPage();
prof.setDefaultTimeout(6000);
const erreursS = [];
const surveiller = (p, qui) => {
  p.on('pageerror', (e) => erreursS.push(`${qui} PAGEERROR: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erreursS.push(`${qui} CONSOLE: ${m.text()}`); });
};
surveiller(prof, 'prof');
await prof.goto(BASE);
await prof.waitForSelector('#btnProf', { timeout: 8000 });

// La classe : un enseignant, quatre élèves de 2de.
const ELEVES = [['st01', 'Alice', 'Martin'], ['st02', 'Bilal', 'Durand'], ['st03', 'Chloé', 'Petit'], ['st04', 'Diego', 'Roux']];
await prof.evaluate(({ ELEVES, GID, AID }) => {
  const j = (k) => JSON.parse(localStorage.getItem(k) || 'null');
  const u = j('prepalog:users') || {}; const g = j('prepalog:groupes') || {};
  u.sprof = { role: 'prof', email: 'strat@prepalog.local', nom: 'Seigneur', prenom: 'Prof', groupes: [GID] };
  ELEVES.forEach(([m, p, n]) => { u[`s${m}`] = { role: 'eleve', matricule: m, code: '1234', prenom: p, nom: n, groupes: [GID] }; });
  g[GID] = { nom: 'STRAT 2', annee: '2026', niveau: '2de', profs: ['sprof'], code: 'STRA', ouverts: { [AID]: true }, equipes: {} };
  localStorage.setItem('prepalog:users', JSON.stringify(u));
  localStorage.setItem('prepalog:groupes', JSON.stringify(g));
  Object.keys(localStorage).filter((k) => k.startsWith(`prepalog:jeux/${GID}/`)).forEach((k) => localStorage.removeItem(k));
}, { ELEVES, GID, AID });

const ouvrirJeu = async (p) => {
  await p.click('[data-rub="stratelog"]');
  if (await p.$(`[data-act="${AID}"]`)) await p.click(`[data-act="${AID}"]`);
  await p.waitForSelector('.strat main');
};
await prof.fill('#mail', 'strat@prepalog.local');
await prof.click('#btnProf');
await prof.waitForSelector('#btnProfEspace');
await ouvrirJeu(prof);

const eleves = {};
const connecter = async (m) => {
  const p = await ctxS.newPage();
  p.setDefaultTimeout(6000);
  surveiller(p, m);
  await p.goto(BASE);
  // Les onglets d'un même navigateur partagent la session de démonstration : le nouvel onglet s'ouvre sur le compte
  // du dernier connecté. On s'en déconnecte (les autres onglets gardent le leur, en mémoire).
  await p.waitForSelector('#mat, #btnDeco', { timeout: 8000 });
  if (await p.$('#btnDeco')) await p.click('#btnDeco');
  await p.waitForSelector('#mat');
  await p.fill('#mat', m); await p.fill('#code', '1234');
  await p.click('#btnEleve');
  await p.waitForSelector('text=Bonjour');
  await ouvrirJeu(p);
  eleves[m] = p;
  return p;
};
const etat = (p = prof) => p.evaluate((k) => { const t = JSON.parse(localStorage.getItem(k) || '{}'); return t.etat ? JSON.parse(t.etat.json) : null; }, `prepalog:jeux/${GID}/${AID}/seigneur`);
const texte = (p) => p.textContent('.strat main');
const sansErreur = () => { if (erreursS.length) throw new Error(erreursS.splice(0).join(' | ')); };

await v('stratelog : la pastille Stratelog mène à Avant l’Hiver, le Seigneur prépare la partie (villes, noms, rôles)', async () => {
  await prof.waitForSelector('#hasard');
  const t = await texte(prof);
  if (!/4 élèves dans le groupe/.test(t)) throw new Error(`effectif lu : ${t.slice(0, 200)}`);
  const E = await etat();
  if (!E || E.phase !== 'preparation') throw new Error('état neuf absent');
  sansErreur();
});

let villes = null;
await v('stratelog : tirer les villes au hasard répartit les 4 élèves en 3 villes de 1 à 2, puis « les villes sont prêtes »', async () => {
  await prof.click('#hasard');
  await prof.waitForSelector('#pretes:not([disabled])');
  const E = await etat();
  const parVille = E.villes.map((x) => Object.values(E.membres).filter((id) => id === x.id).length).sort();
  if (JSON.stringify(parVille) !== '[1,1,2]') throw new Error(`répartition ${JSON.stringify(parVille)}`);
  await prof.click('#pretes');
  await prof.waitForSelector('text=Avant d’ouvrir le tour');
  villes = (await etat()).membres;
  sansErreur();
});

await v('stratelog : chaque élève arrive dans sa ville et choisit le blason ; le choix est reporté chez le Seigneur', async () => {
  for (const [m] of ELEVES) await connecter(m);
  const E = await etat();
  const premiers = new Set();
  for (const [m] of ELEVES) await eleves[m].waitForSelector('text=Votre ville');
  for (const [m] of ELEVES) {
    const p = eleves[m]; const id = E.membres[`s${m}`];
    if (premiers.has(id)) continue;
    premiers.add(id);
    await p.click('[data-fig="3"]');
    await p.click('[data-teinte="azur"]');
    await p.click('#validerville');
  }
  await prof.waitForFunction(() => !document.querySelector('.strat main').textContent.includes('il manque'));
  const E2 = await etat();
  if (!E2.villes.every((x) => x.blason && x.blason.fig === 3 && x.blason.teinte === 'azur')) throw new Error(JSON.stringify(E2.villes));
  // Les élèves voient leur ville, nommée et blasonnée.
  await eleves.st01.waitForSelector('.strat .plateau');
  sansErreur();
});

const villeDe = (m) => villes[`s${m}`];
const duo = () => ELEVES.map(([m]) => m).filter((m) => ELEVES.filter(([x]) => villeDe(x) === villeDe(m)).length === 2);
const seuls = () => ELEVES.map(([m]) => m).filter((m) => !duo().includes(m));

await v('stratelog : à l’ouverture du tour, la ville de deux élèves a deux lots de rôles ; le registre s’ouvre quand ils sont pris', async () => {
  await prof.click('#ouvrir');
  const [a, b] = duo();
  await eleves[a].waitForSelector('text=Qui fait quoi ce tour-ci');
  const lots = await eleves[a].$$eval('.lot .roles', (l) => l.map((x) => x.textContent));
  if (JSON.stringify(lots) !== JSON.stringify(['Marchand + Intendant des greniers', 'Maître d\'œuvre + Argentier'])) throw new Error(JSON.stringify(lots));
  await eleves[a].click('[data-prendre="0"]');
  await eleves[b].waitForSelector('text=Pris par Alice M.', { timeout: 3000 }).catch(() => {});
  await eleves[b].click('[data-prendre="1"]');
  await eleves[a].waitForSelector('.onglets');
  await eleves[b].waitForSelector('.onglets');
  // Chacun arrive sur l'onglet de son premier rôle, et ne remplit que ses cases.
  const selA = await eleves[a].$eval('.onglets [aria-selected="true"]', (x) => x.dataset.onglet);
  if (selA !== 'M') throw new Error(`onglet de ${a} : ${selA}`);
  await eleves[b].click('[data-onglet="I"]');
  await eleves[b].waitForSelector('#besoin');
  if (!(await eleves[b].$('#besoin[disabled]'))) throw new Error('le Maître d’œuvre peut remplir une case de l’Intendant');
  await eleves[a].click('[data-onglet="I"]');
  await eleves[a].waitForSelector('#besoin:not([disabled])');
  sansErreur();
});

await v('stratelog : une case remplie par l’Intendant arrive chez son camarade ; l’Argentier dépose, le registre est fermé', async () => {
  const [a, b] = duo();
  await eleves[a].click('[data-onglet="I"]');
  await eleves[a].fill('#besoin', '30');
  await eleves[a].press('#besoin', 'Tab');
  await eleves[b].waitForFunction(() => document.querySelector('#besoin') && document.querySelector('#besoin').value === '30');
  // Le Maître d'œuvre + Argentier dépose depuis l'onglet Registre.
  await eleves[b].click('[data-onglet="R"]');
  await eleves[b].click('#deposer');
  await eleves[a].waitForSelector('text=Registre déposé');
  await prof.waitForSelector('text=registre déposé ✓');
  sansErreur();
});

await v('stratelog : forcer le rendu ramasse les deux autres villes, clore tire la carte, résoudre écrit la chronique chez l’élève', async () => {
  for (const m of seuls()) await eleves[m].waitForSelector('text=Qui fait quoi ce tour-ci');
  await prof.click('#forcer');
  await prof.waitForSelector('#clore:not([disabled])');
  await prof.click('#clore');
  await prof.waitForSelector('#resoudre');
  await prof.click('#resoudre');
  await prof.waitForSelector('#suivant');
  const [a] = duo();
  await eleves[a].waitForFunction(() => /Chronique|chronique/.test(document.querySelector('.strat main').textContent));
  const E = await etat();
  if (E.phase !== 'resolu' || !E.journal) throw new Error(`phase ${E.phase}`);
  sansErreur();
});

await v('stratelog : le retour arrière défait le dernier geste (la saison revient « registres clos »)', async () => {
  const lib = await prof.textContent('#annuler');
  if (!/saison résolue/.test(lib)) throw new Error(`bouton : ${lib}`);
  await prof.click('#annuler');
  await prof.waitForSelector('#resoudre');
  const E = await etat();
  if (E.phase !== 'carte') throw new Error(`phase ${E.phase}`);
  await prof.click('#resoudre');
  await prof.waitForSelector('#suivant');
  sansErreur();
});

await v('stratelog : la saison suivante remet les villes à zéro après le tour d’essai ; le tableau projeté suit', async () => {
  await prof.click('#suivant');
  await prof.waitForSelector('#ouvrir');
  const E = await etat();
  if (E.phase !== 'avant-tour' || E.partie.tour !== 1) throw new Error(`phase ${E.phase}, tour ${E.partie.tour}`);
  await prof.click('[data-vue="tableau"]');
  await prof.waitForSelector('.pj-villes');
  const n = await prof.$$eval('.pj-ville', (l) => l.length);
  if (n !== 3) throw new Error(`${n} villes au tableau`);
  await prof.click('[data-vue="seigneur"]');
  sansErreur();
});

await ctxS.close();
}
