import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = new URL('..', import.meta.url).pathname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); return res.end('404');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(8099, r));

const nav = await chromium.launch();
const ctx = await nav.newContext();
const page = await ctx.newPage();
page.setDefaultTimeout(5000);
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('CONSOLE: ' + m.text()); });
// Aucune requête externe ne doit être nécessaire en mode démo.
// Aucune route à intercepter : le site ne sort plus du dépôt. Toute requête externe
// observée pendant la suite est une régression, et le dernier test la signale.

// SheetJS est servi par le dépôt lui-même (vendor/), plus par un CDN : rien à intercepter.
// Le module npm reste utile aux tests, mais seulement pour FABRIQUER un classeur rempli.
let baseXlsx = null;
for (const base of [process.env.NODE_PATH, `${process.env.HOME}/.npm-global/lib/node_modules`,
  '/home/claude/.npm-global/lib/node_modules', path.join(ROOT, 'node_modules'),
  '/usr/lib/node_modules', '/usr/local/lib/node_modules']) {
  if (!base) continue;
  if (base && fs.existsSync(path.join(base, 'xlsx', 'xlsx.mjs'))) { baseXlsx = path.join(base, 'xlsx'); break; }
}

// Toute requête sortante est notée : le dépôt ne doit dépendre d'aucun hébergeur extérieur.
const hotesExternes = new Set();
page.on('request', (r) => {
  try {
    const h = new URL(r.url()).hostname;
    if (h && !['127.0.0.1', 'localhost'].includes(h)) hotesExternes.add(h);
  } catch (e) {}
});

const ok = [];
const ko = [];
const v = async (nom, fn) => {
  try { await fn(); ok.push(nom); } catch (e) { ko.push(`${nom} → ${e.message.split('\n')[0]}`); }
};

await page.goto('http://127.0.0.1:8099/');
await page.waitForSelector('#btnProf', { timeout: 8000 });

// ---------- 1. connexion enseignant
await v('connexion enseignant', async () => {
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
});

// ---------- 2. création d'un groupe
await v('création de groupe', async () => {
  await page.click('#btnProfEspace');
  await page.waitForSelector('#gNom');
  await page.fill('#gNom', '1 LOG A');
  await page.click('#btnCreerG');
  await page.waitForSelector('text=1 LOG A', { timeout: 6000 });
});

// ---------- 3. création de comptes en lot
await v('création de comptes en lot', async () => {
  await page.click('[data-ong="comptes"]');
  await page.waitForSelector('#lot');
  await page.fill('#lot', 'DUPONT ; Léa ; 2601 ; aaa1\nMARTIN ; Noé ; 2602 ; bbb2');
  await page.click('#btnLot');
  await page.waitForSelector('text=2 comptes créés', { timeout: 6000 });
});

// ---------- 4. semer la base partagée
await v('semis de la base partagée', async () => {
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('[data-semer="magasin"]');
  page.once('dialog', (d) => d.accept());
  await page.click('[data-semer="magasin"]');
  await page.waitForTimeout(600);
});

// ---------- 5. l'enseignant voit la base semée
await v('lecture de la base partagée (enseignant)', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('[data-rub="magasin"]');
  await page.click('[data-rub="magasin"]');
  await page.waitForSelector('text=REF-0101', { timeout: 6000 });
});

// ---------- 6. déconnexion puis connexion élève
await v('connexion élève', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat', { timeout: 6000 });
  await page.fill('#mat', '2601');
  await page.fill('#code', 'aaa1');
  await page.click('#btnEleve');
  await page.waitForSelector('text=Bonjour Léa', { timeout: 6000 });
});

// ---------- 6 bis. l'accueil affiche bien les pastilles de rubrique
await v('accueil en pastilles de rubrique', async () => {
  const n = await page.$$eval('.rubrique[data-rub]', (e) => e.length);
  if (n < 2) throw new Error(`${n} pastille(s) seulement`);
  const t = (await page.$$eval('.rubriques', (e) => e.map((x) => x.textContent).join(' ')));
  if (!/Magasin/.test(t) || !/Quiz/.test(t)) throw new Error('rubrique manquante');
  const bandes = await page.$$eval('.rubriques-sep', (e) => e.length);
  if (bandes < 1) throw new Error('bandes non séparées');
  if (!/activité/.test(await page.textContent('body'))) throw new Error('compteur absent');
});

// ---------- 7. l'élève voit la base commune de la classe
await v('base commune visible par l\'élève', async () => {
  await page.click('[data-rub="magasin"]');
  await page.waitForSelector('text=REF-0102', { timeout: 6000 });
});

// ---------- 8. l'élève ajoute une ligne partagée
await v('ajout d\'une ligne dans la base partagée', async () => {
  await page.click('[data-onglet="emplacements"]');
  await page.waitForSelector('#ch_code');
  await page.fill('#ch_code', 'C-09-4');
  await page.click('#btnAjouter');
  await page.waitForSelector('text=C-09-4', { timeout: 6000 });
});

// ---------- 9. QCM autocorrigé
await v('QCM autocorrigé et enregistrement du score', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('[data-rub="quiz"]');
  await page.click('[data-rub="quiz"]');
  await page.waitForSelector('[data-act="quiz-flux"]', { timeout: 6000 });
  await page.click('[data-act="quiz-flux"]');
  await page.waitForSelector('#btnValider', { timeout: 6000 });
  // On coche la première proposition de chaque question, au hasard.
  const qs = await page.$$('.question');
  for (const q of qs) {
    const c = await q.$('input');
    if (c) await c.check();
  }
  await page.click('#btnValider');
  await page.waitForSelector('#bilan .avis', { timeout: 6000 });
});

// ---------- 10. le corrigé n'est pas en clair dans la page
await v('corrigé non lisible en clair', async () => {
  const src = await page.content();
  if (src.includes('Une commande réelle du client') === false) throw new Error('énoncé absent, test invalide');
  const mod = await page.evaluate(async () => {
    const m = await import('/activites/quiz-flux.js');
    return JSON.stringify(m);
  });
  if (/justes["']?\s*:\s*\[\s*["']Une commande/.test(mod)) throw new Error('réponse en clair dans le module');
});

// ---------- 11. le suivi de classe remonte le score
await v('suivi de classe côté enseignant', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=QUI-5', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  if (!/DUPONT/.test(t)) throw new Error('élève absent du suivi');
  if (!/\/\s*6/.test(t)) throw new Error('score absent du suivi');
});

// ---------- 13. bascule clair / sombre
await v('bascule du thème et persistance', async () => {
  const fondDe = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const avant = await fondDe();
  await page.click('#btnTheme');
  await page.waitForTimeout(250);
  const apres = await fondDe();
  if (avant === apres) throw new Error('le fond n\'a pas changé');
  const attr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (!['clair', 'sombre'].includes(attr)) throw new Error('data-theme non posé');
  // le logo suit le thème
  const src = await page.getAttribute('.entete .logo', 'src');
  if (attr === 'sombre' && !/logo-sombre/.test(src)) throw new Error('logo clair en mode sombre');
  // et le choix survit au rechargement
  await page.reload();
  await page.waitForTimeout(600);
  const apresRechargement = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (apresRechargement !== attr) throw new Error('thème non conservé au rechargement');
});

// ---------- 14. écran de connexion : préambule, hiérarchie, touche Entrée
await v('écran de connexion', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  const pre = await page.textContent('.preambule');
  if (!/pédagogique/i.test(pre) || !/intelligence artificielle/i.test(pre)) {
    throw new Error('préambule absent ou incomplet');
  }
  // la partie élève doit être nettement plus large que la partie enseignant
  const le = await page.$eval('.panneau-eleve', (e) => e.getBoundingClientRect().width);
  const lp = await page.$eval('.panneau-prof', (e) => e.getBoundingClientRect().width);
  if (le <= lp * 1.4) throw new Error(`partie élève trop étroite (${Math.round(le)} vs ${Math.round(lp)})`);
  // champs de saisie plus grands que les champs ordinaires
  const t = await page.$eval('#mat', (e) => parseFloat(getComputedStyle(e).fontSize));
  if (t < 18) throw new Error(`champ trop petit (${t}px)`);
  // validation au clavier
  await page.fill('#mat', '2601');
  await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('text=Bonjour Léa', { timeout: 6000 });
});

// ---------- 15. niveaux : filtrage automatique et forçage par l'enseignant
await v('filtrage par niveau et forçage', async () => {
  // Le quiz QUI-5 est déclaré 2de + 1re ; on crée un groupe de Terminale.
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.waitForSelector('#gNom');
  await page.fill('#gNom', 'TLE LOG');
  await page.selectOption('#gNiveau', 'tle');
  await page.click('#btnCreerG');
  await page.waitForTimeout(500);

  await page.click('[data-ong="comptes"]');
  await page.waitForSelector('#lot');
  await page.fill('#lot', 'ROUX ; Théo ; 2701 ; ccc3');
  await page.click('#btnLot');
  await page.waitForSelector('text=1 compte créé', { timeout: 6000 });

  // Côté élève de Terminale : le quiz de 2de/1re ne doit pas apparaître.
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2701'); await page.fill('#code', 'ccc3');
  await page.press('#code', 'Enter');
  await page.waitForSelector('text=Bonjour Théo', { timeout: 6000 });
  if (await page.$('[data-rub="logistique"]')) throw new Error('rubrique hors niveau visible par l\'élève');
  if (!(await page.$('[data-rub="magasin"]'))) throw new Error('magasin tous niveaux absent');

  // L'enseignant force l'ouverture du quiz pour ce groupe.
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  // On s'assure de travailler sur le groupe de Terminale.
  await page.waitForSelector('[data-ong="groupes"]');
  const aActiver = await page.$('[data-actif="tle-log"]');
  if (aActiver) { await aActiver.click(); await page.waitForTimeout(300); }
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('[data-ouvre="chaine-logistique"]');
  const coche = await page.isChecked('[data-ouvre="chaine-logistique"]');
  if (coche) throw new Error('la chaîne devrait être décochée pour un groupe Tle');
  await page.check('[data-ouvre="chaine-logistique"]');
  await page.waitForTimeout(500);
  if (!/hors niveau/.test(await page.textContent('#contenuProf'))) {
    throw new Error('le forçage hors niveau n\'est pas signalé');
  }

  // L'élève de Terminale le voit maintenant.
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2701'); await page.fill('#code', 'ccc3');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logistique"]', { timeout: 6000 });
});

// ---------- 16. remise en ordre
await v('remise en ordre : résolution complète', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logistique"]', { timeout: 6000 });
  await page.click('[data-rub="logistique"]');          // une seule activité → ouverture directe
  await page.waitForSelector('[data-scen="baskets"]', { timeout: 6000 });
  await page.click('[data-scen="baskets"]');
  await page.waitForSelector('#btnValider');
  // Tri à bulles à l'aide des flèches : on remonte chaque étape jusqu'à sa place.
  for (let tour = 0; tour < 10; tour++) {
    const textes = await page.$$eval('.ordre-texte', (e) => e.map((x) => x.textContent.trim().split('\n')[0]));
    const attendu = 'Le fournisseur fabrique les baskets';
    if (textes[0] === attendu) break;
    const i = textes.findIndex((t) => t === attendu);
    if (i <= 0) break;
    await page.click(`[data-haut="${i}"]`);
    await page.waitForTimeout(80);
  }
  const premier = await page.$eval('.ordre-texte', (e) => e.textContent.trim());
  if (!/fournisseur fabrique/.test(premier)) throw new Error('les flèches ne réordonnent pas');
  await page.click('#btnValider');
  await page.waitForSelector('#bilanOrdre .avis', { timeout: 6000 });
  const bilan = await page.textContent('#bilanOrdre');
  if (!/sur 8/.test(bilan)) throw new Error('bilan inattendu : ' + bilan.slice(0, 80));
});

// ---------- 17. association par clic
await v('association : rangement et correction', async () => {
  await page.click('#btnListe');
  await page.click('#btnRetour');
  await page.waitForSelector('[data-rub="quiz"]');
  await page.click('[data-rub="quiz"]');
  await page.waitForSelector('[data-act="zones-entrepot"]', { timeout: 6000 });
  await page.click('[data-act="zones-entrepot"]');
  await page.waitForSelector('.bac[data-cat="reception"]', { timeout: 6000 });
  // On range les douze étiquettes au clic, toutes dans la même zone : le total doit
  // valoir 3 sur 12 (les trois étiquettes de la réception).
  for (let i = 0; i < 12; i++) {
    const e = await page.$('#reserve [data-etiq]');
    if (!e) break;
    await e.click();
    await page.click('.bac[data-cat="reception"] h3');
    await page.waitForTimeout(40);
  }
  await page.click('#btnValider');
  await page.waitForSelector('#bilanAssoc .avis', { timeout: 6000 });
  const b = await page.textContent('#bilanAssoc');
  if (!/3 étiquettes bien rangées sur 12/.test(b)) throw new Error('bilan inattendu : ' + b.slice(0, 90));
});

// ---------- 18. saisie numérique et tolérance
await v('saisie numérique : virgule et tolérance', async () => {
  // Le retour d'une activité ramène dans sa rubrique, pas à l'accueil.
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="calculs-stock"]', { timeout: 6000 });
  await page.click('[data-act="calculs-stock"]');
  await page.waitForSelector('#btnValiderNum', { timeout: 6000 });
  await page.fill('[data-q="c1"]', '250');
  await page.fill('[data-q="c3"]', '30,2');        // virgule française, dans la tolérance de 0,5
  await page.fill('[data-q="c7"]', '4 250');       // espace des milliers
  await page.fill('[data-q="c2"]', '7');           // faux
  await page.click('#btnValiderNum');
  await page.waitForSelector('#bilanNum .avis', { timeout: 6000 });
  const b = await page.textContent('#bilanNum');
  if (!/3 bonnes réponses sur 8/.test(b)) throw new Error('bilan inattendu : ' + b.slice(0, 90));
  const r = await page.textContent('[data-retour="c2"]');
  if (!/12/.test(r)) throw new Error('la réponse attendue n\'est pas affichée');
});

// ---------- 19. dépôt de classeur : le modèle est téléchargeable
await v('dépôt de classeur : modèle disponible', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('#btnAccueil');
  await page.click('#btnAccueil');
  await page.waitForSelector('[data-rub="tableur"]', { timeout: 6000 });
  await page.click('[data-rub="tableur"]');
  await page.waitForSelector('[data-act="inventaire-tableur"]', { timeout: 6000 });
  await page.click('[data-act="inventaire-tableur"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
  const href = await page.getAttribute('a[download]', 'href');
  const rep = await page.request.get(new URL(href, page.url()).toString());
  if (!rep.ok()) throw new Error('modèle introuvable (' + rep.status() + ')');
  const octets = (await rep.body()).length;
  if (octets < 3000) throw new Error('modèle trop petit : ' + octets + ' octets');
});

// ---------- 20. scénario : lien externe visible par l'élève
await v('scénario : la rubrique et le lien externe', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('#btnAccueil', { timeout: 6000 });
  await page.click('#btnAccueil');
  await page.waitForSelector('[data-rub="scenario"]', { timeout: 6000 });
  await page.click('[data-rub="scenario"]');
  await page.waitForSelector('[data-act="yves-rocher"]', { timeout: 6000 });
  const ordre = await page.$$eval('[data-act]', (e) => e.map((x) => x.dataset.act));
  const attendu = ['yves-rocher', 'foot-locker', 'bouygues-telecom', 'brasseries-gatinais', 'reception-plateforme'];
  if (ordre.join() !== attendu.join()) throw new Error('ordre des scénarios : ' + ordre.join(', '));
  // Les codes suivent l'ordre d'affichage.
  const codes = await page.$$eval('[data-act] .code', (e) => e.map((x) => x.textContent.trim().split(' ')[0]));
  if (codes.join() !== 'SCE-1,SCE-2,SCE-3,SCE-4,SCE-5') throw new Error('codes : ' + codes.join(', '));
  await page.click('[data-act="brasseries-gatinais"]');
  await page.waitForSelector('.lien-ouvrir', { timeout: 6000 });
  const href = await page.getAttribute('.lien-ouvrir', 'href');
  if (!/padlet\.com/.test(href)) throw new Error('lien Padlet absent : ' + href);
  if (await page.getAttribute('.lien-ouvrir', 'target') !== '_blank') throw new Error('le lien ne s\'ouvre pas dans un nouvel onglet');
  if (await page.$('.note-badge')) throw new Error('une note s\'affiche alors qu\'aucune n\'est saisie');
  const t = await page.textContent('#hoteActivite');
  if (!/apparaîtra ici une fois saisie/.test(t)) throw new Error('la mention d\'attente de note manque');
  // Les consignes vivent sur le Padlet : rien ne doit être recopié ici.
  if (/Rendu attendu|Calculer le poids/.test(t)) throw new Error('consigne recopiée côté site');
});

// ---------- 21. l'enseignant saisit la note dans le suivi de classe
await v('saisie de la note dans le suivi de classe', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  // Léa est dans « 1 LOG A » : c'est ce groupe qu'il faut activer.
  await page.waitForSelector('[data-ong="groupes"]');
  const a = await page.$('[data-actif="1-log-a"]');
  if (a) { await a.click(); await page.waitForTimeout(300); }
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('.note-saisie[data-aid="brasseries-gatinais"]', { timeout: 6000 });
  const champ = await page.$$('.note-saisie[data-aid="brasseries-gatinais"]');
  if (champ.length < 2) throw new Error('champs de saisie manquants');
  await champ[0].fill('14.5');
  await champ[0].dispatchEvent('change');
  await page.waitForTimeout(400);
  // Refus d'une note hors barème.
  await champ[1].fill('25');
  await champ[1].dispatchEvent('change');
  await page.waitForTimeout(300);
  if ((await champ[1].inputValue()) === '25') throw new Error('une note de 25/20 a été acceptée');
  // La note saisie survit au rechargement de l'écran.
  await page.click('[data-ong="groupes"]');
  await page.waitForSelector('#gNom');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('.note-saisie[data-aid="brasseries-gatinais"]');
  const v0 = await page.inputValue('.note-saisie[data-aid="brasseries-gatinais"]');
  if (Number(v0) !== 14.5) throw new Error('note non conservée : ' + v0);
});

// ---------- 22. l'élève retrouve sa note sur le scénario
await v('l\'élève voit la note de son scénario', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="scenario"]', { timeout: 6000 });
  await page.click('[data-rub="scenario"]');
  await page.click('[data-act="brasseries-gatinais"]');
  await page.waitForSelector('.note-badge', { timeout: 6000 });
  const b = await page.textContent('.note-badge');
  if (!/14,5\s*\/\s*20/.test(b)) throw new Error('badge inattendu : ' + b);
});

// ---------- 23. série TAB-2 : filtrage par niveau et dépôt d'un classeur
await v('série tableur : niveau par exercice et correction', async () => {
  // Léa est en 1re : exs10 (Terminale seulement) ne doit pas lui être proposé.
  await page.click('#btnRetour');
  await page.waitForSelector('#btnAccueil', { timeout: 6000 });
  await page.click('#btnAccueil');
  await page.waitForSelector('[data-rub="tableur"]', { timeout: 6000 });
  await page.click('[data-rub="tableur"]');
  await page.waitForSelector('[data-act="excel-stock"]', { timeout: 6000 });
  await page.click('[data-act="excel-stock"]');
  await page.waitForSelector('[data-exo="exs1"]', { timeout: 6000 });
  const vus = await page.$$eval('[data-exo]', (e) => e.map((x) => x.dataset.exo));
  if (vus.length !== 9) throw new Error(`${vus.length} exercices au lieu de 9 pour une 1re`);
  if (vus.includes('exs10')) throw new Error('exs10 (Tle) proposé à une 1re');
  if (!/RECHERCHEV/.test(await page.textContent('#hoteActivite'))) throw new Error('groupes de notions absents');

  await page.click('[data-exo="exs1"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
  const lien = await page.getAttribute('a[download]', 'href');
  const rep = await page.request.get(new URL(lien, page.url()).toString());
  if (!rep.ok()) throw new Error('classeur modèle introuvable (' + rep.status() + ')');
});

// ---------- 24. la correction d'un classeur déposé
await v('série tableur : correction d\'un classeur déposé', async () => {
  // On dépose le modèle non complété : les dix cellules de réponse sont vides.
  await page.setInputFiles('#fichier', ROOT + 'contenus/tab2/exs1-recherchev-prix.xlsx');
  await page.waitForSelector('#resultatTableur table', { timeout: 15000 });
  const bilan = await page.textContent('#resultatTableur');
  if (!/0 contrôle.* sur 10/.test(bilan.replace(/\s+/g, ' '))) {
    throw new Error('bilan inattendu : ' + bilan.replace(/\s+/g, ' ').slice(0, 100));
  }
  const lignes = await page.$$eval('#resultatTableur tbody tr', (e) => e.length);
  if (lignes !== 10) throw new Error(`${lignes} lignes de contrôle au lieu de 10`);
  if (!/Cellule vide/.test(bilan)) throw new Error('les cellules vides ne sont pas signalées');

  // Puis le même classeur, correctement rempli : les contrôles générés doivent tomber
  // exactement sur les cellules de réponse du modèle. C'est ce qui valide la migration.
  if (!baseXlsx) throw new Error('module xlsx introuvable pour fabriquer le classeur — npm i -g xlsx@0.18.5');
  const XLSX = await import(path.join(baseXlsx, 'xlsx.mjs'));
  XLSX.set_fs(fs);
  const { EXERCICES } = await import(ROOT + 'contenus/tab2-stocks.js');
  const exs1 = EXERCICES.find((e) => e.id === 'exs1');
  const cl = XLSX.read(fs.readFileSync(ROOT + 'contenus/tab2/' + exs1.fichier));
  const f = cl.Sheets['Exercice'];
  exs1.controles.forEach((c) => { f[c.cellule] = { t: 'n', v: c.attendu }; });
  const rempli = path.join(os.tmpdir(), 'prepalog-exs1-rempli.xlsx');
  XLSX.writeFile(cl, rempli);
  await page.setInputFiles('#fichier', rempli);
  await page.waitForFunction(() => /10 contrôles réussis/.test(document.body.textContent), null, { timeout: 15000 });
  fs.unlinkSync(rempli);
});

// ---------- 25. l'enseignant voit toute la série, étiquetée
await v('série tableur : l\'enseignant voit tous les niveaux', async () => {
  await page.click('#btnListe');
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('[data-rub="tableur"]', { timeout: 6000 });
  await page.click('[data-rub="tableur"]');
  await page.click('[data-act="excel-stock"]');
  await page.waitForSelector('[data-exo="exs10"]', { timeout: 6000 });
  const n = await page.$$eval('[data-exo]', (e) => e.length);
  if (n !== 10) throw new Error(`${n} exercices au lieu de 10 côté enseignant`);
  const code = await page.textContent('[data-exo="exs10"] .code');
  if (!/Tle/.test(code)) throw new Error('niveau de l\'exercice non affiché : ' + code);
});

// ---------- 26. Spartoo : l'environnement s'ouvre et la base de l'élève est semée
await v('Spartoo : ouverture de l\'environnement', async () => {
  // On revient de l'activité précédente vers l'espace enseignant, sur le bon groupe.
  await page.click('#btnListe').catch(() => {});
  await page.click('#btnRetour');
  await page.waitForSelector('#btnAccueil').catch(() => {});
  await page.click('#btnAccueil').catch(() => {});
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="groupes"]');
  const aActiver = await page.$('[data-actif="1-log-a"]');
  if (aActiver) { await aActiver.click(); await page.waitForTimeout(300); }
  // L'enseignant pose ensuite le code qui déverrouille la vue d'ensemble du stock.
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('#codeStock');
  await page.fill('#codeStock', 'STOCK24');
  await page.click('#btnCodeStock');
  await page.waitForTimeout(400);
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logisim"]', { timeout: 6000 });
  // La rubrique Logisim porte désormais une tuile par SÉANCE de l'entreprise : réception,
  // préparation. On ouvre ici la préparation ; la réception est testée plus bas.
  await page.click('[data-rub="logisim"]');
  await page.waitForSelector('[data-act="spartoo"]', { timeout: 6000 });
  await page.click('[data-act="spartoo"]');
  await page.waitForSelector('.ent-shell', { timeout: 6000 });
  if ((await page.$$eval('.ent-nav', (e) => e.length)) < 8) throw new Error('navigation incomplète');
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('.ent-mitem');
  if ((await page.$$eval('.ent-mitem', (e) => e.length)) !== 3) throw new Error('les 3 messages de départ manquent');
});

const ouvrirMail = async (motif) => {
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('[data-dossier="in"]');
  await page.click('[data-dossier="in"]');
  await page.waitForSelector('.ent-mitem');
  for (const m of await page.$$('.ent-mitem')) {
    if (new RegExp(motif, 'i').test(await m.textContent())) { await m.click(); return; }
  }
  throw new Error('mail introuvable : ' + motif);
};

// ---------- 27. la console interroge la base
await v('Spartoo : la console répond', async () => {
  await page.click('[data-vue="console"]');
  await page.waitForSelector('#champCmd');
  await page.fill('#champCmd', '.getstock AD-STS-BL-44');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Stan Smith/.test(t)) throw new Error('article non trouvé');
  if (!/Stock\s*3\b/.test(t)) throw new Error('stock attendu 3 : ' + (t.match(/Stock\s*\d+/) || ['?'])[0]);
  await page.fill('#champCmd', '.nimportequoi');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  if (!/Commande inconnue/.test(await page.textContent('.ent-cout'))) throw new Error('commande inconnue non signalée');
});

// ---------- 28. le stock d'ensemble est verrouillé, le code l'ouvre
await v('Spartoo : le stock est verrouillé par un code', async () => {
  await page.click('[data-vue="stock"]');
  await page.waitForSelector('#codeStock');
  await page.fill('#codeStock', 'FAUX');
  await page.click('[data-deverrouiller]');
  await page.waitForTimeout(250);
  if (!/Code incorrect/.test(await page.textContent('.ent-main'))) throw new Error('un code faux a été accepté');
  await page.fill('#codeStock', 'stock24');          // la casse ne doit pas compter
  await page.click('[data-deverrouiller]');
  await page.waitForSelector('#sQ', { timeout: 6000 });
});

// ---------- 29. l'exercice de bout en bout : les trois jalons
await v('Spartoo : exercice complet, trois jalons au vert', async () => {
  // Étape 4 — répondre à Léa avec le stock réel.
  await ouvrirMail('Stan Smith');
  await page.waitForSelector('[data-repondre]');
  await page.click('[data-repondre]');
  await page.fill('#repT', 'Bonjour Madame,\n\nIl nous reste 3 paires en pointure 44.\n\nCordialement');
  await page.click('#formRep button[type=submit]');
  await page.waitForTimeout(500);

  // Étape 5 — traiter la commande. Valeurs attendues : une ligne complète, une partielle,
  // une en rupture. C'est ce qui rend l'exercice intéressant.
  await ouvrirMail('Nouvelle commande');
  await page.click('[data-enreg-cmd]');
  await page.waitForSelector('[data-prep="seen"]');
  const attendu = {
    'NK-AM270-NR-42': { seen: 8, loc: 'B-01-1', qty: 1, status: 'ok' },
    'AD-STS-BL-41': { seen: 1, loc: 'B-04-1', qty: 1, status: 'warn' },
    'PM-SUE-NR-40': { seen: 0, loc: 'B-06-1', qty: 0, status: 'crit' },
  };
  for (const [sku, a] of Object.entries(attendu)) {
    await page.fill(`[data-prep="seen"][data-sku="${sku}"]`, String(a.seen));
    await page.fill(`[data-prep="loc"][data-sku="${sku}"]`, a.loc);
    await page.fill(`[data-prep="qty"][data-sku="${sku}"]`, String(a.qty));
    await page.selectOption(`[data-prep="status"][data-sku="${sku}"]`, a.status);
  }
  await page.waitForSelector('[data-bon]:not([disabled])', { timeout: 6000 });
  await page.click('[data-bon]');
  await page.waitForSelector('[data-valider]');
  await page.click('[data-valider]');
  await page.waitForTimeout(500);
  const t = await page.textContent('.ent-main');
  if (!/Préparation validée/.test(t)) throw new Error('préparation non validée');
  if (!/reliquat/i.test(t)) throw new Error('le reliquat n\'est pas signalé');

  // Le stock a réellement bougé, et le mouvement est tracé.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getstock NK-AM270-NR-42');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  if (!/Stock\s*7\b/.test(await page.textContent('.ent-cout'))) throw new Error('le stock n\'est pas descendu à 7');
  await page.fill('#champCmd', '.movements');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  if (!/Sortie : préparation/.test(await page.textContent('.ent-cout'))) throw new Error('mouvement non journalisé');

  // Étape 6 — réapprovisionner Puma : quantités exactes et minimum de commande atteint.
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('[data-nouveau]');
  await page.click('[data-nouveau]');
  await page.waitForSelector('#mTo');
  await page.selectOption('#mTo', 'F003');
  await page.fill('#mTxt', 'Bonjour,\n\nPM-SUE-NR-40 : 12 paires\nPM-SUE-NR-36 : 12 paires\n\nCordialement');
  await page.click('[data-envoyer-fou]');
  await page.waitForTimeout(600);
});

// ---------- 30. le suivi de classe voit l'avancement
await v('Spartoo : avancement remonté au suivi de classe', async () => {
  // L'environnement est immersif : pas de bandeau Prepalog, on en sort par son propre bouton.
  await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco', { timeout: 6000 });
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=ENT-1', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  if (!/3\/3/.test(t)) throw new Error('avancement attendu 3/3, lu : ' + (t.match(/\d\/3/g) || ['aucun']).join(' '));
});

// ---------- 31. la réception : même base, volet propre à la séance
await v('Spartoo réception : la séance s\'ajoute à la base de l\'élève', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logisim"]', { timeout: 6000 });
  await page.click('[data-rub="logisim"]');
  await page.waitForSelector('[data-act="spartoo-reception"]', { timeout: 6000 });
  await page.click('[data-act="spartoo-reception"]');
  await page.waitForSelector('.ent-shell', { timeout: 6000 });
  // La base est celle de la préparation (meta.jeuId) : les 3 messages de départ sont
  // toujours là, et les 2 messages de la séance de réception s'y ajoutent.
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('.ent-mitem');
  // 3 messages de départ + la réponse de Puma au réapprovisionnement de la séance
  // précédente + les 2 messages de la séance de réception.
  const n = await page.$$eval('.ent-mitem', (e) => e.length);
  if (n !== 6) throw new Error(`${n} messages au lieu de 6 : la base n'est pas partagée, ou le volet n'est pas semé`);
  // Et le travail de la séance précédente est toujours là : le stock a bien été diminué.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getstock NK-AM270-NR-42');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  if (!/Stock\s*7\b/.test(await page.textContent('.ent-cout'))) throw new Error('la préparation de la séance précédente a été perdue');
});

// ---------- 32. la réception de bout en bout : contrôle, écart, entrée en stock
await v('Spartoo réception : trois jalons au vert', async () => {
  // Le bon de livraison est dans la messagerie ; la réception s'ouvre depuis le message.
  await ouvrirMail('Bon de livraison');
  await page.waitForSelector('[data-ouvrir-rec]');
  if (!/LOT-PM-2609/.test(await page.textContent('.ent-lecteur'))) throw new Error('le numéro de lot n\'est pas sur le bon de livraison');
  await page.click('[data-ouvrir-rec]');
  await page.waitForSelector('#recLot');

  // Ce que l'élève doit trouver : 12 conformes, 6 au lieu de 8, 6 dans un carton abîmé.
  await page.fill('#recLot', 'LOT-PM-2609');
  const attendu = {
    'PM-SUE-RG-39': { annonce: 12, compte: 12, etat: 'ok', decision: 'accepte' },
    'PM-SUE-MA-41': { annonce: 8, compte: 6, etat: 'ok', decision: 'reserve' },
    'PM-RSX-BL-42': { annonce: 6, compte: 6, etat: 'abime', decision: 'reserve' },
  };
  for (const [sku, a] of Object.entries(attendu)) {
    await page.fill(`[data-rec="annonce"][data-sku="${sku}"]`, String(a.annonce));
    await page.fill(`[data-rec="compte"][data-sku="${sku}"]`, String(a.compte));
    await page.selectOption(`[data-rec="etat"][data-sku="${sku}"]`, a.etat);
    await page.selectOption(`[data-rec="decision"][data-sku="${sku}"]`, a.decision);
  }
  await page.waitForSelector('[data-valider-rec]:not([disabled])', { timeout: 6000 });
  await page.click('[data-valider-rec]');
  await page.waitForTimeout(500);
  if (!/Réception validée/.test(await page.textContent('.ent-main'))) throw new Error('réception non validée');

  // Le lot est entré en stock, et il se remonte d'un bout à l'autre.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Entrées\s*24\b/.test(t)) throw new Error('24 paires attendues au lot, lu : ' + (t.match(/Entrées\s*\d+/) || ['?'])[0]);
  if (!/Puma/.test(t)) throw new Error('le fournisseur du lot n\'est pas retrouvé');

  // Les réserves partent chez le fournisseur.
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('[data-nouveau]');
  await page.click('[data-nouveau]');
  await page.waitForSelector('#mTo');
  await page.selectOption('#mTo', 'F003');
  await page.fill('#mObj', 'Réserves sur le lot LOT-PM-2609');
  await page.fill('#mTxt', 'Bonjour,\n\nRéserves sur la livraison BL-77421, lot LOT-PM-2609 :\n- PM-SUE-MA-41 : il manque 2 paires sur les 8 annoncées\n- PM-RSX-BL-42 : carton endommagé à la livraison\n\nCordialement');
  await page.click('[data-envoyer-fou]');
  await page.waitForTimeout(600);
});

// ---------- 33. l'avancement de la réception remonte, à côté de celui de la préparation
await v('Spartoo réception : avancement remonté au suivi', async () => {
  await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco', { timeout: 6000 });
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=ENT-2', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  // Deux séances, deux avancements distincts : c'est tout l'intérêt d'une activité par séance.
  const av = (t.match(/3\/3/g) || []).length;
  if (av < 2) throw new Error('deux avancements 3/3 attendus (réception et préparation), lu : ' + av);
});

// ---------- 34. la traçabilité : l'aval est semé, le lot se remonte dans les deux sens
// La date d'entrée du lot est lue dans la remontée, jamais écrite d'avance : c'est celle de
// la base de l'élève, donc celle du jour où il a réceptionné.
const dateDuLot = (texte) => (texte.match(/Entré le\s*(\d{2}\/\d{2}\/\d{4})/) || [])[1] || '';
await v('Spartoo traçabilité : l\'aval est semé et le lot se remonte', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2601'); await page.fill('#code', 'aaa1');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logisim"]', { timeout: 6000 });
  await page.click('[data-rub="logisim"]');
  await page.waitForSelector('[data-act="spartoo-tracabilite"]', { timeout: 6000 });
  await page.click('[data-act="spartoo-tracabilite"]');
  await page.waitForSelector('.ent-shell', { timeout: 6000 });

  // Même base que les deux séances précédentes : 6 messages, plus les 2 de la traçabilité.
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('.ent-mitem');
  // 6 messages à l'issue de la réception, plus la réponse de Puma aux réserves, plus les
  // 2 messages de la traçabilité.
  const n = await page.$$eval('.ent-mitem', (e) => e.length);
  if (n !== 9) throw new Error(`${n} messages au lieu de 9 : la base n'est pas partagée, ou le volet n'est pas semé`);

  // La commande de la séance 2 ne touchait aucune référence du lot : sans les trois
  // commandes semées ici, il n'y aurait personne à retrouver.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Entrées\s*24\b/.test(t)) throw new Error('24 paires attendues au lot, lu : ' + (t.match(/Entrées\s*\d+/) || ['?'])[0]);
  if (!/Sorties\s*6\b/.test(t)) throw new Error('6 paires sorties attendues, lu : ' + (t.match(/Sorties\s*\d+/) || ['?'])[0]);
  if (!/Reste en stock\s*18\b/.test(t)) throw new Error('18 paires attendues en reste, lu : ' + (t.match(/Reste en stock\s*\d+/) || ['?'])[0]);
  for (const no of ['CMD-048301', 'CMD-048307', 'CMD-048312']) {
    if (!t.includes(no)) throw new Error('commande absente de la remontée du lot : ' + no);
  }
  if (!/Simon|Bernard|Fournier/.test(t)) throw new Error('les clients livrés ne remontent pas');
  // La date d'entrée du lot est celle de la base de l'élève, pas une date écrite d'avance :
  // c'est elle qu'il devra recopier dans son compte rendu.
  if (!dateDuLot(t)) throw new Error('la date d\'entrée du lot ne s\'affiche pas');
});

// ---------- 35. le blocage qualité ne sort que du lot, et ne souffle pas la réponse
await v('Blocage qualité : le lot seul est touché, sans réponse soufflée', async () => {
  await page.click('[data-vue="blocage"]');
  await page.waitForSelector('#blLot');
  // Le stock total de la référence est bien plus élevé que ce qu'il reste du lot : c'est
  // exactement le piège que .removestock (premier entré, premier sorti) ne saurait éviter.
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getstock PM-SUE-RG-39');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  const avant = Number((await page.textContent('.ent-cout')).match(/Stock\s*(\d+)/g).pop().match(/\d+/)[0]);
  if (avant !== 26) throw new Error('stock de départ attendu 26 (17 + 12 reçues − 3 vendues), lu : ' + avant);

  // Une quantité trop grande est refusée, et le message ne dit pas combien il en reste.
  await page.click('[data-vue="blocage"]');
  await page.waitForSelector('#blLot');
  await page.fill('#blLot', 'LOT-PM-2609');
  await page.fill('#blRef', 'PM-SUE-RG-39');
  await page.fill('#blQte', '99');
  await page.fill('#blMotif', 'blocage qualité, défaut fabricant');
  await page.click('#formBloc button[type=submit]');
  await page.waitForTimeout(300);
  const err = await page.textContent('.ent-main');
  if (!/ne contient pas autant/.test(err)) throw new Error('une quantité supérieure au lot a été acceptée');
  if (/\b9\b/.test(err.split('Blocages enregistrés')[0].replace(/LOT-PM-2609|PM-SUE-RG-39|99/g, ''))) {
    throw new Error('le message d\'erreur souffle la quantité restante');
  }

  // Le bon compte : 9 paires de ce lot, et pas une de plus.
  await page.fill('#blQte', '9');
  await page.click('#formBloc button[type=submit]');
  await page.waitForTimeout(400);
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getstock PM-SUE-RG-39');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(300);
  const apres = Number((await page.textContent('.ent-cout')).match(/Stock\s*(\d+)/g).pop().match(/\d+/)[0]);
  if (apres !== 17) throw new Error('stock attendu 17 après blocage des 9 paires du lot, lu : ' + apres);
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  if (!/Reste en stock\s*9\b/.test(await page.textContent('.ent-cout'))) throw new Error('le reste du lot n\'est pas tombé à 9');
});

// ---------- 36. la traçabilité de bout en bout : les trois jalons
await v('Spartoo traçabilité : trois jalons au vert', async () => {
  // Les deux références qui restent : 5 et 4 paires du lot.
  await page.click('[data-vue="blocage"]');
  await page.waitForSelector('#blLot');
  for (const [ref, q] of [['PM-SUE-MA-41', '5'], ['PM-RSX-BL-42', '4']]) {
    await page.fill('#blLot', 'LOT-PM-2609');
    await page.fill('#blRef', ref);
    await page.fill('#blQte', q);
    await page.fill('#blMotif', 'blocage qualité, défaut fabricant');
    await page.click('#formBloc button[type=submit]');
    await page.waitForTimeout(350);
  }
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Reste en stock\s*0\b/.test(t)) throw new Error('le lot n\'est pas entièrement bloqué');
  if (!/Blocage qualité/.test(t)) throw new Error('le mouvement de blocage n\'apparaît pas dans la remontée du lot');
  const dateEntreeLot = dateDuLot(t);
  if (!dateEntreeLot) throw new Error('la date d\'entrée du lot est introuvable');

  // Le compte rendu à M. Morin, en répondant à son message.
  await ouvrirMail('traçabilité et blocage');
  await page.waitForSelector('[data-repondre]');
  await page.click('[data-repondre]');
  await page.fill('#repT', `Bonjour,\n\nLot LOT-PM-2609, entré en stock le ${dateEntreeLot}, fournisseur Puma.\n\n`
    + 'Commandes déjà livrées avec des paires de ce lot :\n'
    + '- CMD-048301\n- CMD-048307\n- CMD-048312\n\n'
    + 'Stock restant bloqué : 9 PM-SUE-RG-39, 5 PM-SUE-MA-41, 4 PM-RSX-BL-42.\n\nCordialement');
  await page.click('#formRep button[type=submit]');
  await page.waitForTimeout(600);
});

// ---------- 37. trois avancements côte à côte dans le suivi
await v('Spartoo traçabilité : avancement remonté au suivi', async () => {
  await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco', { timeout: 6000 });
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=ENT-3', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  // Trois séances, trois avancements distincts, sur une seule et même base.
  const av = (t.match(/3\/3/g) || []).length;
  if (av < 3) throw new Error('trois avancements 3/3 attendus, lu : ' + av);
});

// ---------- 38. la traçabilité sans les séances précédentes : l'amont est posé
await v('Spartoo traçabilité : jouable sans les deux séances précédentes', async () => {
  // Noé n'a fait ni la réception ni la préparation : sans amorçage, il n'aurait ni lot ni
  // sortie à remonter. La séance lui pose la réception d'un collègue.
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2602'); await page.fill('#code', 'bbb2');
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="logisim"]', { timeout: 6000 });
  await page.click('[data-rub="logisim"]');
  await page.waitForSelector('[data-act="spartoo-tracabilite"]', { timeout: 6000 });
  await page.click('[data-act="spartoo-tracabilite"]');
  await page.waitForSelector('.ent-shell', { timeout: 6000 });
  await page.click('[data-vue="console"]');
  await page.fill('#champCmd', '.getlot LOT-PM-2609');
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(400);
  const t = await page.textContent('.ent-cout');
  if (!/Entrées\s*24\b/.test(t)) throw new Error('le lot n\'a pas été posé : ' + (t.match(/Entrées\s*\d+/) || ['rien'])[0]);
  if (!/Sorties\s*6\b/.test(t)) throw new Error('les sorties du lot manquent');
  if (!/CMD-048301/.test(t)) throw new Error('les commandes livrées ne remontent pas');
  // Et la réception posée porte son propre numéro : celle de la séance 1 reste disponible.
  if (!/REC-04118/.test(t)) throw new Error('la réception du collègue n\'est pas celle attendue');
  await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco', { timeout: 6000 });
});

// ---------- 39. les polices sont bien celles du dépôt
await v('polices servies par le dépôt', async () => {
  // Le navigateur a chargé les fichiers, et le texte est bien rendu en Inter.
  await page.evaluate(() => document.fonts.ready);
  const chargees = await page.evaluate(() => Array.from(document.fonts)
    .filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`));
  if (!chargees.some((f) => /Inter/.test(f))) throw new Error('Inter non chargée : ' + chargees.join(', '));
  const rendu = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  if (!/Inter/.test(rendu)) throw new Error('police du corps inattendue : ' + rendu);
});

// ---------- 40. aucune dépendance extérieure, polices comprises
await v('aucun hébergeur extérieur', async () => {
  // Les filtrages académiques bloquent régulièrement cdnjs et Google Fonts. SheetJS est
  // dans vendor/, les polices dans styles/polices/ : le site ne sort plus du dépôt.
  if (hotesExternes.size) throw new Error('dépendance extérieure : ' + [...hotesExternes].join(', '));
});

console.log('\n=== RÉUSSIS ===');
ok.forEach((o) => console.log('  ✓ ' + o));
if (ko.length) { console.log('\n=== ÉCHECS ==='); ko.forEach((k) => console.log('  ✗ ' + k)); }
if (erreurs.length) { console.log('\n=== ERREURS JS ==='); [...new Set(erreurs)].slice(0, 12).forEach((e) => console.log('  ! ' + e)); }
console.log(`\n${ok.length}/${ok.length + ko.length} tests réussis.`);

await nav.close();
srv.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
