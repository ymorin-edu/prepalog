import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

// `.pathname` d'une URL de fichier n'est PAS un chemin : sous Windows il rend
// « /C:/Users/… », avec une barre oblique de tête. `path.join` en faisait
// « \C:\Users\… », donc `fs.existsSync` était faux pour TOUS les fichiers : le serveur de
// test répondait 404 à tout, la page restait blanche, et la suite mourait sur le premier
// sélecteur attendu — une erreur qui ne désigne en rien sa cause. `fileURLToPath` rend le
// chemin natif de la plateforme, et c'est aussi ce qui permet de retrouver `node_modules`
// une quarantaine de lignes plus bas. Constaté le 01/10/2026, au premier lancement de la
// suite sous Windows : elle n'avait jamais tourné que sous Linux.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

// `prepalog-config.json` est versionné depuis le 30/09/2026 : sur le disque, il existe.
// Le servir ferait démarrer l'application en mode réel, où la suite entière n'a plus de
// sens — elle ne teste que le mode démonstration, et 39 tests sur 46 tombaient. Le serveur
// de test le refuse donc systématiquement : la suite est mode-démo par construction, quel
// que soit le contenu du dépôt, et c'est ce 404 délibéré que le test « un seul 404 »
// attend. Les tests du chemin Firebase, eux, se donnent leur propre configuration d'essai.
const SANS_CONFIG = '/prepalog-config.json';

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  if (p === SANS_CONFIG) { res.writeHead(404); return res.end('404'); }
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
// Un 404 est attendu, et un seul : prepalog-config.json, refusé par le serveur de test
// ci-dessus, c'est lui qui déclenche le mode démonstration. Chromium le journalise en
// erreur de console à chaque
// chargement ; le compter ferait échouer la suite en permanence, et masquerait les vraies.
// On l'écarte donc du relevé, mais on note toutes les URL introuvables : un test dédié
// vérifie qu'il n'y en a pas d'autre, si bien que rien n'est perdu.
const introuvables = new Set();
page.on('response', (r) => { if (r.status() === 404) introuvables.add(new URL(r.url()).pathname); });
page.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if (/Failed to load resource.*\b404\b/.test(m.text())) return;
  erreurs.push('CONSOLE: ' + m.text());
});
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
  // `import()` attend une URL, pas un chemin : sous Windows un chemin absolu commence par
  // « C: », que le chargeur ESM prend pour un protocole inconnu. `pathToFileURL` est la
  // conversion inverse de `fileURLToPath` en tête de fichier — même piège, deux sens.
  const XLSX = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX.set_fs(fs);
  const { EXERCICES } = await import(pathToFileURL(path.join(ROOT, 'contenus/tab2-stocks.js')).href);
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

// ---------- 24 bis. TAB-1 : les treize étapes, dont deux sans correction automatique
// La migration du module C-1 de la Suite. Deux choses à prouver : les contrôles générés
// tombent bien sur les cellules de réponse des classeurs repris (sinon toute la série est
// fausse sans qu'on le voie), et les deux étapes non corrigeables ne pénalisent pas
// l'élève — elles sont proposées, mais hors du total.
await v('TAB-1 : les treize étapes, et deux qui ne comptent pas', async () => {
  await page.click('#btnListe');
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="excel-pas-a-pas"]', { timeout: 6000 });
  await page.click('[data-act="excel-pas-a-pas"]');
  await page.waitForSelector('[data-exo="et01"]', { timeout: 6000 });

  const vus = await page.$$eval('[data-exo]', (e) => e.map((x) => x.dataset.exo));
  if (vus.length !== 13) throw new Error(`${vus.length} étapes au lieu de 13`);
  const entete = (await page.textContent('#hoteActivite')).replace(/\s+/g, ' ');
  if (!/sur 11\./.test(entete)) throw new Error('le total devrait exclure les 2 étapes non notées : ' + entete.slice(0, 160));
  if (!/ne comptent pas dans ce total/.test(entete)) throw new Error('les étapes hors total ne sont pas annoncées');

  // L'étape 9 (mise en forme conditionnelle) n'a rien à déposer.
  await page.click('[data-exo="et09"]');
  await page.waitForSelector('a[download]', { timeout: 6000 });
  if (await page.$('#depot')) throw new Error('une étape sans contrôle propose quand même un dépôt');
  if (!/vérifie en classe/.test(await page.textContent('#hoteActivite'))) {
    throw new Error("l'étape sans correction n'explique pas comment elle est vérifiée");
  }
  await page.click('#btnListe');

  // L'étape 7 attend des VRAI / FAUX : c'est le seul endroit de la série où la réponse
  // est un booléen, et le classeur peut porter l'un ou l'autre selon le tableur.
  await page.waitForSelector('[data-exo="et07"]', { timeout: 6000 });
  await page.click('[data-exo="et07"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
  if (!baseXlsx) throw new Error('module xlsx introuvable pour fabriquer le classeur — npm i -g xlsx@0.18.5');
  const XLSX1 = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX1.set_fs(fs);
  const { EXERCICES: EX1 } = await import(pathToFileURL(path.join(ROOT, 'contenus/tab1-excel.js')).href);
  const et07 = EX1.find((e) => e.id === 'et07');
  const cl1 = XLSX1.read(fs.readFileSync(path.join(ROOT, 'contenus/tab1/', et07.fichier)));
  const f1 = cl1.Sheets['Exercice'];
  if (!f1) throw new Error("le classeur de l'étape 7 n'a pas d'onglet « Exercice »");
  // Les cellules visées doivent être VIDES dans le modèle : si le corrigé y était déjà,
  // l'exercice n'en serait pas un. C'est ce qui a motivé le retrait de l'onglet Correction.
  et07.controles.forEach((c) => {
    if (f1[c.cellule]) throw new Error(`le modèle contient déjà une réponse en ${c.cellule}`);
    f1[c.cellule] = { t: 'b', v: c.attendu };
  });
  const rempli1 = path.join(os.tmpdir(), 'prepalog-et07-rempli.xlsx');
  XLSX1.writeFile(cl1, rempli1);
  await page.setInputFiles('#fichier', rempli1);
  await page.waitForFunction(() => /5 contrôles réussis/.test(document.body.textContent), null, { timeout: 15000 });
  fs.unlinkSync(rempli1);
});

// ---------- 24 ter. aucun classeur de TAB-1 ne contient le corrigé
// Les modèles viennent de la Suite, où un onglet « Correction » masqué portait les
// réponses — masqué seulement, donc à un clic droit de l'élève. Ce test est le garde-fou
// du retrait : il lit les fichiers du dépôt, donc il tient même si personne n'y pense.
await v('TAB-1 : les classeurs ne portent plus l\'onglet Correction', async () => {
  if (!baseXlsx) throw new Error('module xlsx introuvable');
  const XLSX1 = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX1.set_fs(fs);
  const dossier = path.join(ROOT, 'contenus', 'tab1');
  const fichiers = fs.readdirSync(dossier).filter((f) => f.endsWith('.xlsx'));
  if (fichiers.length !== 13) throw new Error(`${fichiers.length} classeurs au lieu de 13`);
  const fautifs = [];
  fichiers.forEach((f) => {
    const cl = XLSX1.read(fs.readFileSync(path.join(dossier, f)));
    if (cl.SheetNames.some((n) => /correction|corrig/i.test(n))) fautifs.push(f);
    if (!cl.SheetNames.includes('Exercice')) fautifs.push(f + ' (sans onglet Exercice)');
  });
  if (fautifs.length) throw new Error('classeur(s) avec corrigé : ' + fautifs.join(', '));
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

// ---------- 25 bis. contrôle de liste : l'ordre des lignes est indifférent
// Pour les exercices du genre « relevez les références sous le minimum », l'ordre des
// lignes n'a aucun sens : le contrôle cellule par cellule compterait faux un travail juste.
// On exerce le moteur directement, sur un classeur fabriqué à la main — pas besoin
// d'ouvrir un fichier, et les quatre cas qui comptent tiennent dans un seul test : bon
// ordre, ordre inversé, un oubli, un intrus.
await v('tableur : contrôle de liste à ordre libre', async () => {
  const r = await page.evaluate(async () => {
    const { controler, decouperPlage } = await import('/core/types/tableur.js');
    // Un classeur SheetJS, réduit à ce que le moteur en lit : des cellules { v }.
    const feuille = (paires) => {
      const f = {};
      Object.entries(paires).forEach(([k, v]) => { f[k] = { v }; });
      return { SheetNames: ['Exercice'], Sheets: { Exercice: f } };
    };
    const ctrl = {
      plage: 'A2:B4', libelle: 'Références sous le minimum', tolerance: 0.01,
      lignes: [['REF-104', 12], ['REF-110', 3], ['REF-101', 7]],
    };
    const passe = (paires) => controler(feuille(paires), [ctrl], 'Exercice')[0];
    return {
      plage: decouperPlage('A2:B4'),
      // 1. l'ordre du corrigé
      ordre: passe({ A2: 'REF-104', B2: 12, A3: 'REF-110', B3: 3, A4: 'REF-101', B4: 7 }),
      // 2. le même travail, dans un autre ordre, avec accents et casse libres
      melange: passe({ A2: 'ref-101', B2: 7, A3: 'REF-104', B3: 12.004, A4: 'REF-110', B4: 3 }),
      // 3. une ligne oubliée
      oubli: passe({ A2: 'REF-104', B2: 12, A3: 'REF-110', B3: 3 }),
      // 4. une ligne écrite hors de la plage : elle ne compte pas
      horsPlage: passe({
        A2: 'REF-104', B2: 12, A3: 'REF-110', B3: 3,
        A4: 'REF-101', B4: 7, A5: 'REF-999', B5: 1,
      }),
      // 5. une ligne en trop, dans la plage
      intrus: controler(feuille({
        A2: 'REF-104', B2: 12, A3: 'REF-110', B3: 3,
        A4: 'REF-101', B4: 7, A5: 'REF-999', B5: 1,
      }), [{ ...ctrl, plage: 'A2:B5' }], 'Exercice')[0],
      // 6. un trou au milieu de la liste : ce n'est pas une faute
      trou: controler(feuille({
        A2: 'REF-104', B2: 12, A4: 'REF-110', B4: 3, A5: 'REF-101', B5: 7,
      }), [{ ...ctrl, plage: 'A2:B5' }], 'Exercice')[0],
      // 7. rien de saisi
      vide: passe({}),
    };
  });

  if (!r.plage || r.plage.colonnes.join('') !== 'AB' || r.plage.lignes.join(',') !== '2,3,4') {
    throw new Error('découpage de plage faux : ' + JSON.stringify(r.plage));
  }
  if (!r.ordre.ok) throw new Error('la liste dans l\'ordre du corrigé est refusée : ' + r.ordre.remarque);
  if (!r.melange.ok) throw new Error('l\'ordre libre est refusé : ' + r.melange.remarque);
  if (r.oubli.ok) throw new Error('une liste incomplète est acceptée');
  if (!/manquante/.test(r.oubli.remarque) || !/REF-101/.test(r.oubli.remarque)) {
    throw new Error('la ligne oubliée n\'est pas nommée : ' + r.oubli.remarque);
  }
  // Une ligne écrite hors de la plage ne compte pas : A5 est en dehors de A2:B4.
  if (!r.horsPlage.ok) throw new Error('une ligne hors plage fait échouer le contrôle : ' + r.horsPlage.remarque);
  if (r.intrus.ok) throw new Error('une ligne en trop dans la plage est acceptée');
  if (!/en trop/.test(r.intrus.remarque) || !/REF-999/.test(r.intrus.remarque)) {
    throw new Error('la ligne en trop n\'est pas nommée : ' + r.intrus.remarque);
  }
  if (!r.trou.ok) throw new Error('une ligne vide au milieu de la liste est comptée comme une faute : ' + r.trou.remarque);
  if (r.vide.ok) throw new Error('une plage vide est acceptée');
  if (!/Aucune ligne/.test(r.vide.remarque)) throw new Error('plage vide mal signalée : ' + r.vide.remarque);
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

// ---------- 38 bis. suppression d'un groupe : qui part, qui reste
// Régression du 01/10/2026, trouvée en production et pas par la suite. `supprimerGroupe`
// se contentait de détacher les élèves. Or `elevesDuGroupe` interroge `users` par
// appartenance à un groupe et l'application n'a pas de vue « tous les élèves » : un élève
// détaché de son dernier groupe ne remontait plus dans aucun écran, profil, code et
// identifiant compris, et devenait impossible à supprimer autrement que dans la console.
// Ce test tient les deux moitiés de la règle à la fois — sans la seconde, « purger tout »
// passerait aussi, et ce serait un autre dégât.
await v('suppression de groupe : les élèves sans autre groupe partent avec lui', async () => {
  const r = await page.evaluate(async () => {
    const { creerBackendDemo } = await import('/core/backend-demo.js');
    const B = creerBackendDemo();
    // Pas de connexionProf ici : `courant` est au niveau du module, donc partagé avec
    // l'application de la page, et s'y connecter rejouerait tout son rendu.
    const profUid = 'zz-prof-test';
    const g1 = await B.creerGroupe({ nom: 'ZZ TEST A', annee: '', niveau: '', profUid });
    const g2 = await B.creerGroupe({ nom: 'ZZ TEST B', annee: '', niveau: '', profUid });
    await B.creerEleves(g1.id, [
      { nom: 'SOLO', prenom: 'Sam', matricule: 'zz01', code: 'x1' },
      { nom: 'DOUBLE', prenom: 'Dia', matricule: 'zz02', code: 'x2' },
    ]);
    // Rattacher Dia au second groupe : l'interface ne sait pas le faire, le champ si.
    const dia = (await B.elevesDuGroupe(g1.id)).find((e) => e.matricule === 'zz02');
    const u = JSON.parse(localStorage.getItem('prepalog:users'));
    u[dia.uid].groupes = [g1.id, g2.id];
    localStorage.setItem('prepalog:users', JSON.stringify(u));

    const res = await B.supprimerGroupe(g1.id);

    const apres = Object.values(JSON.parse(localStorage.getItem('prepalog:users')))
      .filter((x) => x.role === 'eleve');
    const sortie = {
      res,
      restants: apres.map((x) => x.matricule),
      orphelins: apres.filter((x) => !(x.groupes || []).length).length,
    };
    await B.supprimerGroupe(g2.id);   // ménage
    return sortie;
  });
  if (r.res.supprimes !== 1) throw new Error(`supprimes = ${r.res.supprimes}, 1 attendu`);
  if (r.res.detaches !== 1) throw new Error(`detaches = ${r.res.detaches}, 1 attendu`);
  if (r.restants.includes('zz01')) throw new Error('l\'élève qui n\'avait que ce groupe a survécu');
  if (!r.restants.includes('zz02')) throw new Error('l\'élève du second groupe a été supprimé à tort');
  if (r.orphelins) throw new Error(`${r.orphelins} élève(s) sans aucun groupe après suppression`);
});

// ---------- 38 ter. la confirmation dit ce qu'elle emporte, et l'emporte vraiment
// Une suppression irréversible ne se juge pas sur son code mais sur la phrase que
// l'enseignant lit avant de cliquer : c'est la seule protection qu'il ait.
await v('suppression de groupe : la confirmation nomme les élèves qui partent', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf', { timeout: 6000 });
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  const ong = await page.$('[data-ong="groupes"]');
  if (ong) await ong.click();
  await page.waitForSelector('[data-suppr]', { timeout: 6000 });

  let texte = '';
  page.once('dialog', (d) => { texte = d.message(); d.accept(); });
  await page.click('[data-suppr]');
  await page.waitForTimeout(900);

  if (!/qu'à ce groupe/.test(texte)) throw new Error('la confirmation ne prévient pas que des élèves partent : ' + texte);
  if (!/DUPONT/.test(texte) || !/MARTIN/.test(texte)) throw new Error('la confirmation ne nomme pas les élèves : ' + texte);

  // Léa et Noé n'avaient que « 1 LOG A » : ils partent avec lui. Théo est dans « TLE LOG »,
  // créé au test 12 : il doit rester intact, et c'est la moitié de la règle qu'on oublie
  // facilement — un « on purge tout » passerait le premier contrôle et pas celui-ci.
  const etat = await page.evaluate(() => Object.values(
    JSON.parse(localStorage.getItem('prepalog:users') || '{}'))
    .filter((x) => x.role === 'eleve')
    .map((x) => ({ matricule: x.matricule, groupes: (x.groupes || []).length })));
  const mat = etat.map((x) => x.matricule);
  if (mat.includes('2601') || mat.includes('2602')) throw new Error('un élève du groupe supprimé a survécu : ' + mat.join(', '));
  if (!mat.includes('2701')) throw new Error('l\'élève d\'un autre groupe a été supprimé à tort');
  const orphelins = etat.filter((x) => !x.groupes).length;
  if (orphelins) throw new Error(`${orphelins} élève(s) sans aucun groupe après la suppression`);
});

// ---------- 38 quater. la vue « élèves sans groupe » voit l'orphelin et le rattache
// L'autre moitié du cul-de-sac du 01/10/2026 : la suppression de groupe ne fabrique plus
// d'orphelins, mais ceux d'avant — et ceux que crée une manipulation dans la console
// Firebase — restaient introuvables, toutes les listes de l'application partant d'un
// groupe. On fabrique donc exactement cet état-là : un profil d'élève au champ `groupes`
// vide, comme en laisserait la console, puis on vérifie qu'il remonte et qu'il se répare.
await v('élèves sans groupe : l\'orphelin est visible et se rattache', async () => {
  await page.evaluate(() => {
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    u['zz-orphelin'] = {
      role: 'eleve', nom: 'PERDU', prenom: 'Paul',
      matricule: 'zz99', code: 'x9', groupes: [],
    };
    localStorage.setItem('prepalog:users', JSON.stringify(u));
  });

  // Rouvrir l'espace enseignant : la liste est relue à son ouverture.
  await page.click('#btnRetour');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="orphelins"]', { timeout: 6000 });

  // L'onglet porte le compte, et l'onglet « Groupes » prévient : sans cela, personne
  // n'irait regarder — c'est tout l'intérêt de la vue.
  const libelle = await page.textContent('[data-ong="orphelins"]');
  if (!/\(1\)/.test(libelle)) throw new Error('l\'onglet ne compte pas l\'orphelin : ' + libelle);
  if (!/aucun groupe/.test(await page.textContent('#contenuProf'))) {
    throw new Error('l\'onglet Groupes ne signale pas l\'élève sans groupe');
  }

  await page.click('[data-ong="orphelins"]');
  await page.waitForSelector('[data-ratt="zz-orphelin"]', { timeout: 6000 });
  const table = await page.textContent('#contenuProf');
  if (!/PERDU/.test(table) || !/zz99/.test(table)) throw new Error('l\'orphelin n\'est pas listé');
  if (!/x9/.test(table)) throw new Error('le code de l\'orphelin n\'est pas affiché');

  await page.selectOption('[data-grp="zz-orphelin"]', 'tle-log');
  await page.click('[data-ratt="zz-orphelin"]');
  await page.waitForTimeout(700);

  const etat = await page.evaluate(() => {
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    return {
      groupes: u['zz-orphelin'] ? u['zz-orphelin'].groupes : null,
      restants: Object.values(u).filter((x) => x.role === 'eleve' && !(x.groupes || []).length).length,
    };
  });
  if (!etat.groupes || !etat.groupes.includes('tle-log')) {
    throw new Error('le rattachement n\'a pas pris : ' + JSON.stringify(etat.groupes));
  }
  if (etat.restants) throw new Error(`${etat.restants} élève(s) encore sans groupe`);
  if (/PERDU/.test(await page.textContent('#contenuProf'))) {
    throw new Error('l\'élève rattaché figure encore dans la liste des sans-groupe');
  }
  const apres = await page.textContent('[data-ong="orphelins"]');
  if (/\(/.test(apres)) throw new Error('l\'onglet compte encore un orphelin : ' + apres);

  // Ménage : l'élève ajouté ne doit pas fausser les tests suivants.
  await page.evaluate(() => {
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    delete u['zz-orphelin'];
    localStorage.setItem('prepalog:users', JSON.stringify(u));
  });
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

// ---------- 40 bis. le seul fichier introuvable est celui qui déclenche le mode démo
await v('un seul 404, celui du fichier de configuration', async () => {
  const autres = [...introuvables].filter((p) => p !== SANS_CONFIG);
  if (autres.length) throw new Error('fichier introuvable : ' + autres.join(', '));
});

// ---------- 41. relecture statique : plus aucune adresse d'hébergeur dans le code
// Les quarante tests ci-dessus tournent en mode démonstration. Un fichier qui n'est
// importé qu'en mode réel leur échappe entièrement — c'est ainsi que l'appel du SDK
// Firebase à gstatic.com a survécu à la campagne d'internalisation. Ce test-ci ne lance
// pas le navigateur : il lit les fichiers, donc il couvre aussi le code jamais exécuté.
await v('aucune adresse d\'hébergeur dans le code du dépôt', async () => {
  // On ne cherche que des adresses en position d'URL (`//hôte`), pour ne pas se
  // déclencher sur le nom d'un hébergeur cité dans un commentaire — celui-ci compris.
  const HEBERGEURS = /\/\/(?:[a-z0-9-]+\.)*(gstatic\.com|cdnjs\.cloudflare\.com|unpkg\.com|jsdelivr\.net|googleapis\.com)\//;
  const fautifs = [];
  const parcourir = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (['.git', 'node_modules', 'vendor'].includes(e.name)) continue;
        parcourir(f);
      } else if (/\.(js|mjs|css|html)$/.test(e.name)) {
        fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
          if (HEBERGEURS.test(l)) fautifs.push(`${path.relative(ROOT, f)}:${i + 1}`);
        });
      }
    }
  };
  parcourir(ROOT);
  if (fautifs.length) throw new Error('adresse d\'hébergeur : ' + fautifs.join(', '));
});

// ---------- 42. le SDK Firebase est bien celui de vendor/
// `vendor/` est exclu du test précédent : les bundles du SDK portent l'URL gstatic dans
// deux noms de journal, et surtout les trois modules dépendants doivent importer
// `./firebase-app.js` en relatif, sans quoi les quatre ne partagent pas la même instance.
await v('SDK Firebase : les quatre bundles sont dans vendor/, sans import absolu', async () => {
  const dir = path.join(ROOT, 'vendor', 'firebase');
  for (const f of ['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js', 'firebase-database.js']) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) throw new Error(`${f} absent de vendor/firebase/`);
    const src = fs.readFileSync(p, 'utf8');
    const absolus = src.match(/from\s*["'](?:https?:)?\/\/[^"']+["']/g);
    if (absolus) throw new Error(`${f} importe encore ${absolus[0]}`);
    if (/sourceMappingURL/.test(src)) throw new Error(`${f} réclame encore sa source map`);
  }
  if (!fs.existsSync(path.join(dir, 'firebase.LICENSE'))) throw new Error('licence Apache-2.0 absente');
  const lisez = fs.readFileSync(path.join(ROOT, 'vendor', 'LISEZMOI.md'), 'utf8');
  if (!/firebase-app\.js/.test(lisez)) throw new Error('le SDK n\'est pas inscrit dans vendor/LISEZMOI.md');
});

// ---------- 43. core/backend-firebase.js est enfin exécuté
// Jusqu'ici, pas une ligne de ce fichier n'avait tourné : la suite est en mode
// démonstration, qui charge backend-demo.js. On l'importe donc à la main, sur un onglet
// dédié dont toute requête sortante est coupée net, pour prouver deux choses : le SDK se
// charge depuis le dépôt, et le module s'initialise jusqu'au bout sans toucher au réseau.
// Contexte neuf : le contexte principal garde une session ouverte en localStorage, et on
// veut ici une page vierge, sans état de démonstration.
const ctxFb = await nav.newContext();
const pageFb = await ctxFb.newPage();
pageFb.setDefaultTimeout(8000);
const requetesFb = [];
const bloquees = [];
pageFb.on('request', (r) => requetesFb.push(r.url()));
await pageFb.route('**/*', async (route) => {
  const h = new URL(route.request().url()).hostname;
  if (['127.0.0.1', 'localhost'].includes(h)) return route.continue();
  bloquees.push(route.request().url());
  return route.abort();
});
await pageFb.goto('http://127.0.0.1:8099/');
await pageFb.waitForSelector('#btnProf', { timeout: 8000 });

await v('backend Firebase : le SDK se charge depuis le dépôt', async () => {
  const res = await pageFb.evaluate(async () => {
    const m = await import('/core/backend-firebase.js');
    const mods = await m.chargerSdk();
    return {
      chemins: m.MODULES_SDK,
      symboles: [
        typeof mods[0].initializeApp, typeof mods[1].getAuth,
        typeof mods[2].getFirestore, typeof mods[3].getDatabase,
        typeof mods[2].collectionGroup, typeof mods[3].runTransaction,
      ],
    };
  });
  const manquants = res.symboles.filter((t) => t !== 'function');
  if (manquants.length) throw new Error('symbole absent du SDK : ' + res.symboles.join(', '));
  if (res.chemins.some((c) => /^https?:|^\/\//.test(c))) throw new Error('chemin absolu : ' + res.chemins.join(', '));
  const vendus = requetesFb.filter((u) => /\/vendor\/firebase\/firebase-(app|auth|firestore|database)\.js$/.test(u));
  if (vendus.length !== 4) throw new Error(`${vendus.length} bundle(s) servis par le dépôt au lieu de 4`);
});

await v('backend Firebase : le module s\'initialise sans réseau', async () => {
  const res = await pageFb.evaluate(async () => {
    // Configuration d'essai : aucune de ces valeurs n'existe, et c'est voulu — on veut
    // voir le module se construire, pas joindre un vrai projet. La Realtime Database est
    // mise hors ligne par init(), Firestore ne se connecte qu'à la première lecture.
    const cfg = await import('/core/config.js');
    Object.assign(cfg.CONFIG, {
      firebase: {
        apiKey: 'essai-hors-ligne', authDomain: 'essai.invalid',
        projectId: 'prepalog-essai', appId: '1:0:web:0',
        databaseURL: 'https://prepalog-essai.firebaseio.com',
      },
      superAdmins: [],
    });
    const m = await import('/core/backend-firebase.js');
    const b = await m.creerBackendFirebase();
    const attendus = ['init', 'onAuth', 'connexionProf', 'connexionEleve', 'deconnexion',
      'profilCourant', 'groupesDuProf', 'creerGroupe', 'elevesDuGroupe', 'creerEleves',
      'elevesSansGroupe', 'rattacherEleve',
      'lireScore', 'ecrireScore', 'poserNote', 'suivi', 'lireJeuPrive', 'ecrireJeuPrive',
      'ecouterJeu', 'lireTable', 'ajouterLigne', 'majLigne', 'supprimerLigne',
      'incrementer', 'viderTable', 'ecouterMeta', 'majMeta', 'fermerJeux'];
    const absents = attendus.filter((k) => typeof b[k] !== 'function');
    // init() attend le premier état d'authentification. Sans compte enregistré, il tombe
    // sur null sans requête. Si le SDK avait besoin du réseau, on le verrait ici.
    const profil = await Promise.race([
      b.init(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('init() ne rend pas la main')), 6000)),
    ]);
    b.fermerJeux();
    return { mode: b.mode, absents, profil };
  });
  if (res.mode !== 'firebase') throw new Error('mode inattendu : ' + res.mode);
  if (res.absents.length) throw new Error('méthode absente du contrat : ' + res.absents.join(', '));
  if (res.profil !== null) throw new Error('profil inattendu au démarrage : ' + JSON.stringify(res.profil));
});

await v('backend Firebase : aucune requête hors du dépôt', async () => {
  // Le vrai enjeu : le mode réel doit démarrer même si l'académie filtre gstatic.com.
  if (bloquees.length) throw new Error('requête sortante : ' + [...new Set(bloquees)].join(', '));
  const dehors = [...new Set(requetesFb.map((u) => new URL(u).hostname))]
    .filter((h) => !['127.0.0.1', 'localhost'].includes(h));
  if (dehors.length) throw new Error('hôte extérieur : ' + dehors.join(', '));
});

console.log('\n=== RÉUSSIS ===');
ok.forEach((o) => console.log('  ✓ ' + o));
if (ko.length) { console.log('\n=== ÉCHECS ==='); ko.forEach((k) => console.log('  ✗ ' + k)); }
if (erreurs.length) { console.log('\n=== ERREURS JS ==='); [...new Set(erreurs)].slice(0, 12).forEach((e) => console.log('  ! ' + e)); }
console.log(`\n${ok.length}/${ok.length + ko.length} tests réussis.`);

await nav.close();
srv.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
