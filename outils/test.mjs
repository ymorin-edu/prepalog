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

// ---------- 6 ter. chaque rubrique affiche ses activités par numéro de module
// TAB-5 s'était retrouvé affiché avant TAB-1, TAB-2 et TAB-3, parce que l'ordre venait de
// la liste `ACTIVITES` et non des numéros. Un seul oubli, visible à trois endroits : la
// pastille Tableur, les colonnes du suivi de classe et la conduite de séance. Ce test lit
// l'ordre que le noyau calcule, rubrique par rubrique, donc il garde les trois d'un coup.
//
// Il passe par le module chargé dans la page plutôt que par les tuiles : une rubrique à
// une seule activité s'ouvre directement dessus, sans tuile à lire, et c'est l'ordre
// calculé qu'on veut vérifier, pas la façon dont il est dessiné.
await v('rubriques : les activités sont rangées par numéro de module', async () => {
  const par = await page.evaluate(async () => {
    const m = await import('/activites/index.js');
    const mods = await m.chargerActivites();
    return m.RUBRIQUES.map((r) => ({
      label: r.label,
      codes: m.activitesDeRubrique(r, mods).map((a) => a.meta.code),
    }));
  });
  if (!par.length) throw new Error('aucune rubrique lue, test invalide');

  // Un numéro peut avoir plusieurs niveaux (`ENT-1.2`). On compare segment par segment,
  // jamais comme un décimal : sinon `ENT-1.10` passerait avant `ENT-1.9`. Ce test est écrit
  // à part du noyau exprès — il vérifie le résultat, il ne réutilise pas son comparateur.
  const segments = (c) => ((/^[A-Z]+-(\d+(?:\.\d+)*)$/.exec(c) || [, ''])[1] || '')
    .split('.').filter(Boolean).map(Number);
  const famille = (c) => (/^([A-Z]+)-/.exec(c) || [, c])[1];
  const avant = (a, b) => {               // a doit-il venir strictement avant b ?
    const x = segments(a); const y = segments(b);
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      const u = x[i] === undefined ? -1 : x[i];
      const w = y[i] === undefined ? -1 : y[i];
      if (u !== w) return u < w;
    }
    return false;                          // numéros égaux : pas strictement avant
  };

  let vues = 0;
  par.forEach(({ label, codes }) => {
    if (codes.length < 2) return;                 // une seule tuile : rien à ordonner
    vues++;
    for (let i = 1; i < codes.length; i++) {
      // Dans une même famille, le numéro doit croître. Une rubrique qui mélangerait deux
      // familles (ça n'arrive pas aujourd'hui) n'est pas en faute : on ne compare que ce
      // qui est comparable.
      if (famille(codes[i]) !== famille(codes[i - 1])) continue;
      if (!avant(codes[i - 1], codes[i])) {
        throw new Error(`rubrique ${label} : ${codes.join(' ')} — ${codes[i]} après ${codes[i - 1]}`);
      }
    }
  });
  if (vues < 3) throw new Error(`${vues} rubrique(s) à plusieurs tuiles seulement, test trop faible`);

  // Le comparateur du test doit lui-même tenir le piège des numéros de version : si `avant`
  // se trompait sur 1.10 / 1.9, la boucle ci-dessus laisserait passer le désordre qu'elle
  // est censée attraper. Deux lignes pour garder le garde-fou.
  if (!avant('ENT-1.9', 'ENT-1.10')) throw new Error('comparateur du test : 1.10 avant 1.9');
  if (!avant('ENT-1.2', 'ENT-2.1')) throw new Error('comparateur du test : 2.1 avant 1.2');

  // Repères explicites : Tableur, la rubrique qui portait le défaut, et Logisim, dont les
  // numéros sont à deux niveaux — une séance par tuile, une entreprise par premier chiffre.
  const repere = (label, attendu) => {
    const r = par.find((x) => x.label === label);
    if (!r) throw new Error(`rubrique ${label} introuvable`);
    if (r.codes.join(' ') !== attendu) throw new Error(`rubrique ${label} : ${r.codes.join(' ')}`);
  };
  repere('Tableur', 'TAB-1 TAB-2 TAB-3 TAB-4 TAB-5');
  repere('Logisim', 'ENT-1.1 ENT-1.2 ENT-1.3');
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

  // Depuis le 01/10/2026 le suivi affiche une NOTE SUR 20, pas le score brut : le quiz
  // est noté sur 6 questions, et la colonne doit quand même annoncer « /20 ». Voir
  // `core/notes.js` pour le raisonnement.
  const colonne = await page.textContent('th[title*="flux"]');
  if (!/\/\s*20/.test(colonne)) {
    throw new Error('la colonne n\'annonce pas un barème sur 20 : ' + colonne.trim());
  }
  const cellule = (await page.$$eval('#contenuProf tbody tr', (lignes) => {
    const l = lignes.find((x) => /DUPONT/.test(x.textContent));
    return l ? [...l.querySelectorAll('td')].map((d) => ({ txt: d.textContent.replace(/\s+/g, ' ').trim(), titre: d.getAttribute('title') || '' })) : [];
  })).find((c) => /\/20/.test(c.txt));
  if (!cellule) throw new Error('aucune note sur 20 dans la ligne de l\'élève');
  if (!/^\d+(,\d)?\/20/.test(cellule.txt)) {
    throw new Error('la note n\'est pas au format attendu : ' + cellule.txt);
  }
  // Le score brut reste accessible : l'enseignant doit pouvoir savoir combien de questions
  // ont été réussies, pas seulement la note.
  if (!/\bsur\b/.test(cellule.titre)) {
    throw new Error('le détail brut n\'est pas en infobulle : ' + cellule.titre);
  }
});

// ---------- 11 bis. la note sur 20 : la règle, à l'unité
//
// Le calcul est écrit ICI à part de celui du noyau, exprès : un test qui réutiliserait la
// fonction qu'il vérifie ne vérifierait rien. Même précaution que pour le comparateur
// d'ordre des modules.
await v('note sur 20 : la conversion et ses cas de bord', async () => {
  const { noteSur20, noteConvertie, formaterNote, BAREME_AFFICHE } =
    await import(pathToFileURL(path.join(ROOT, 'core/notes.js')).href);

  if (BAREME_AFFICHE !== 20) throw new Error('le barème affiché n\'est plus 20');

  // Comparateur indépendant : proportion × 20, arrondie au demi-point.
  const attendu = (s, m) => Math.round((s / m) * 40) / 2;
  const cas = [[13, 13], [9, 13], [0, 13], [3, 3], [10, 10], [1, 6], [5, 6], [7, 10], [1, 3]];
  cas.forEach(([s, m]) => {
    const got = noteSur20(s, m);
    if (got !== attendu(s, m)) {
      throw new Error(`noteSur20(${s}, ${m}) = ${got}, attendu ${attendu(s, m)}`);
    }
  });

  // Ce qui a motivé la règle : des dénominateurs différents, la même réussite complète.
  if (noteSur20(3, 3) !== 20 || noteSur20(10, 10) !== 20 || noteSur20(13, 13) !== 20) {
    throw new Error('un sans-faute ne donne pas 20/20 selon le nombre d\'exercices');
  }
  // Et l'arrondi tombe bien sur un demi-point, jamais sur trois décimales.
  if (noteSur20(1, 3) !== 6.5) throw new Error('1/3 devrait donner 6,5 — ' + noteSur20(1, 3));
  if (noteSur20(5, 6) !== 16.5) throw new Error('5/6 devrait donner 16,5 — ' + noteSur20(5, 6));

  // Cas de bord : rien d'affichable plutôt qu'un NaN ou un faux zéro.
  [[1, 0], [1, undefined], [undefined, 10], [null, 10], [1, -3], ['4', 10]].forEach(([s, m]) => {
    if (noteSur20(s, m) !== null) throw new Error(`noteSur20(${s}, ${m}) devrait rendre null`);
  });
  if (formaterNote(null) !== '—') throw new Error('une note absente devrait s\'écrire «\u00a0—\u00a0»');
  if (formaterNote(13.5) !== '13,5') throw new Error('la note s\'écrit avec une virgule');

  // Les deux notations qui ne se convertissent pas, et pourquoi.
  if (!noteConvertie({ id: 'a' })) throw new Error('un module autocorrigé doit être converti');
  if (noteConvertie({ id: 'a', notation: 'prof' })) {
    throw new Error('une note saisie à la main ne doit pas être convertie');
  }
  if (noteConvertie({ id: 'a', notation: 'avancement' })) {
    throw new Error('des jalons ne doivent pas être convertis en note');
  }
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
  // Le logo du bandeau est fixe (tracé blanc sur l'aplat vert) ; c'est le favicon
  // qui suit le thème depuis le 01/10/2026.
  const src = await page.getAttribute('.entete .logo', 'src');
  if (!/logo-bandeau/.test(src)) throw new Error('le bandeau ne porte pas logo-bandeau.png');
  const fav = await page.getAttribute('#favicon', 'href');
  if (attr === 'sombre' && !/logo-sombre/.test(fav)) throw new Error('favicon clair en mode sombre');
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

// ---------- 15. niveaux : le mécanisme, vérifié à l'unité
//
// Depuis le 01/10/2026, aucune activité ne déclare de `niveaux` : tout est ouvert à tous
// les niveaux, et c'est « Conduite de séance » qui ferme ce qu'on ne veut pas ouvrir. Le
// filtrage par niveau reste donc dans le noyau, prêt à resservir, mais plus aucun contenu
// ne l'exerce — un parcours de bout en bout ne peut plus le vérifier.
//
// D'où ce test à l'unité, sur des métas fabriquées : il ne dépend d'aucun contenu, et il
// gardera le mécanisme en état le jour où des règles de niveaux reviendront. C'est le même
// raisonnement que pour le comparateur d'ordre : un garde-fou adossé à un seul cas de
// contenu disparaît avec ce contenu.
await v('niveaux : filtrage, forçage et fermeture, à l\'unité', async () => {
  const { activiteVisible, horsNiveau, concerneNiveau } =
    await import(pathToFileURL(path.join(ROOT, 'core/niveaux.js')).href);

  const tle = { id: 'g', niveau: 'tle', ouverts: {} };
  const sansNiveau = { id: 'g', niveau: '', ouverts: {} };
  const ouverte = { id: 'a', pret: true };                       // aucun `niveaux` : tous
  const restreinte = { id: 'a', pret: true, niveaux: ['2de', '1re'] };
  const pasPrete = { id: 'a', pret: false };

  const att = (cond, quoi) => { if (!cond) throw new Error(quoi); };

  // Par défaut — c'est désormais le cas de toutes les activités du dépôt — tout passe.
  att(activiteVisible(ouverte, tle), 'une activité sans `niveaux` devrait être visible');
  att(!horsNiveau(ouverte, tle), 'une activité sans `niveaux` n\'est pas hors niveau');

  // Le filtrage lui-même.
  att(!activiteVisible(restreinte, tle), 'une activité 2de/1re ne devrait pas être visible en Tle');
  att(horsNiveau(restreinte, tle), 'le hors-niveau n\'est pas signalé');
  att(activiteVisible(restreinte, { id: 'g', niveau: '1re', ouverts: {} }),
    'une activité 2de/1re devrait être visible en 1re');

  // L'enseignant garde le dernier mot, dans les deux sens.
  att(activiteVisible(restreinte, { ...tle, ouverts: { a: true } }),
    'le forçage ne rend pas visible une activité hors niveau');
  att(!activiteVisible(ouverte, { ...tle, ouverts: { a: false } }),
    'la fermeture ne masque pas une activité du bon niveau');

  // Deux garde-fous de bord : une activité pas prête ne sort jamais, et un groupe sans
  // niveau n'exclut rien — sinon un groupe mal renseigné viderait l'accueil.
  att(!activiteVisible(pasPrete, tle), 'une activité non prête ne doit pas être visible');
  att(activiteVisible(restreinte, sansNiveau), 'un groupe sans niveau ne doit rien exclure');

  // Le filtrage par exercice, qui sert aux séries de tableur.
  att(concerneNiveau(undefined, 'cap'), 'un exercice sans `niveaux` vaut pour tous');
  att(concerneNiveau([], 'cap'), 'un `niveaux` vide vaut pour tous');
  att(!concerneNiveau(['tle'], 'cap'), 'un exercice Tle ne concerne pas un CAP');
  att(concerneNiveau(['tle'], null), 'sans niveau de groupe connu, tout est concerné');
});

// ---------- 15 bis. l'enseignant ferme une activité, l'élève ne la voit plus
//
// C'est le geste qui remplace le filtrage automatique dans l'usage réel : tout est ouvert,
// l'enseignant ferme ce qui n'est pas au programme du jour. Le parcours crée aussi le
// groupe « TLE LOG » et Théo, réutilisés par les tests de suppression et de rattachement.
await v('conduite de séance : fermer une activité la retire chez l\'élève', async () => {
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

  // Rien n'est restreint : l'élève de Terminale voit la rubrique Logistique.
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2701'); await page.fill('#code', 'ccc3');
  await page.press('#code', 'Enter');
  await page.waitForSelector('text=Bonjour Théo', { timeout: 6000 });
  if (!(await page.$('[data-rub="logistique"]'))) {
    throw new Error('la rubrique Logistique devrait être ouverte à tous les niveaux');
  }
  if (!(await page.$('[data-rub="magasin"]'))) throw new Error('magasin absent');

  // L'enseignant ferme la chaîne logistique pour ce groupe.
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="groupes"]');
  const aActiver = await page.$('[data-actif="tle-log"]');
  if (aActiver) { await aActiver.click(); await page.waitForTimeout(300); }
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('[data-ouvre="chaine-logistique"]');
  if (!(await page.isChecked('[data-ouvre="chaine-logistique"]'))) {
    throw new Error('la chaîne devrait être cochée d\'office, plus rien n\'étant restreint');
  }
  await page.uncheck('[data-ouvre="chaine-logistique"]');
  await page.waitForTimeout(500);

  // L'élève ne la voit plus. C'est une seule activité dans sa rubrique : la pastille part.
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat');
  await page.fill('#mat', '2701'); await page.fill('#code', 'ccc3');
  await page.press('#code', 'Enter');
  await page.waitForSelector('text=Bonjour Théo', { timeout: 6000 });
  if (await page.$('[data-rub="logistique"]')) {
    throw new Error('la rubrique fermée est encore visible par l\'élève');
  }

  // L'enseignant la rouvre, et elle revient.
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="groupes"]');
  const r = await page.$('[data-actif="tle-log"]');
  if (r) { await r.click(); await page.waitForTimeout(300); }
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('[data-ouvre="chaine-logistique"]');
  await page.check('[data-ouvre="chaine-logistique"]');
  await page.waitForTimeout(500);

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
  // L'affichage suit les codes : c'est le numéro de module qui décide du rang, pas la
  // place de la ligne dans `ACTIVITES` (voir `ordonner` dans activites/index.js).
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

// ---------- 23. série TAB-2 : la série entière est proposée, et le modèle se télécharge
await v('série tableur : la série entière et le modèle', async () => {
  // Plus aucun exercice n'est restreint par niveau : Léa, en 1re, voit les dix.
  await page.click('#btnRetour');
  await page.waitForSelector('#btnAccueil', { timeout: 6000 });
  await page.click('#btnAccueil');
  await page.waitForSelector('[data-rub="tableur"]', { timeout: 6000 });
  await page.click('[data-rub="tableur"]');
  await page.waitForSelector('[data-act="excel-stock"]', { timeout: 6000 });
  await page.click('[data-act="excel-stock"]');
  await page.waitForSelector('[data-exo="exs1"]', { timeout: 6000 });
  const vus = await page.$$eval('[data-exo]', (e) => e.map((x) => x.dataset.exo));
  if (vus.length !== 10) throw new Error(`${vus.length} exercices au lieu de 10`);
  if (!vus.includes('exs10')) throw new Error('exs10 absent : un exercice est encore filtré');
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
  // Le total exclut les 2 étapes non corrigeables, et la phrase annonce aussi la note
  // sur 20 — c'est sur ce dénominateur-là que l'élève est noté, pas sur 11.
  if (!/sur 11\b/.test(entete)) throw new Error('le total devrait exclure les 2 étapes non notées : ' + entete.slice(0, 160));
  if (!/soit .*\/ 20/.test(entete)) throw new Error('la note sur 20 n\'est pas annoncée à l\'élève : ' + entete.slice(0, 160));
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

// ---------- 24 ter. aucun classeur du dépôt ne contient le corrigé
// Les modèles viennent de la Suite, où un onglet « Correction » masqué portait les
// réponses — masqué seulement, donc à un clic droit de l'élève. Ce test est le garde-fou
// du retrait : il lit les fichiers du dépôt, donc il tient même si personne n'y pense.
//
// Il balaie **tout** `contenus/`, pas un seul dossier. Il ne visait que TAB-1 jusqu'au
// 01/10/2026 ; ce jour-là on a découvert que les dix classeurs de TAB-2, migrés avant
// que la règle soit écrite, portaient encore leur onglet. Un test qui ne regarde qu'un
// dossier ne garde que ce dossier : celui-ci couvre d'office toute série ajoutée ensuite.
// Le script `outils/modeles-sans-corrige.py` répare ce que ce test signale.
await v('classeurs du dépôt : aucun onglet Correction', async () => {
  if (!baseXlsx) throw new Error('module xlsx introuvable');
  const XLSX1 = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX1.set_fs(fs);
  const racine = path.join(ROOT, 'contenus');
  const classeurs = [];
  (function parcourir(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) parcourir(p);
      else if (e.name.endsWith('.xlsx')) classeurs.push(p);
    });
  })(racine);
  // Repère de non-régression : 13 (tab1) + 10 (tab2) + 10 (tab3) + 13 (tab4) + 1 (tab5).
  // Un balayage qui ne trouverait plus rien passerait sinon en silence — c'est exactement
  // la panne qu'un garde-fou ne doit pas avoir.
  if (classeurs.length < 47) throw new Error(`${classeurs.length} classeurs trouvés, moins que les 47 attendus`);
  const fautifs = [];
  classeurs.forEach((p) => {
    const nom = path.relative(racine, p).split(path.sep).join('/');
    const cl = XLSX1.read(fs.readFileSync(p));
    if (cl.SheetNames.some((n) => /correction|corrig/i.test(n))) fautifs.push(nom);
    // Les classeurs d'une série vivent dans un sous-dossier et portent tous un onglet
    // « Exercice » ; un classeur isolé à la racine (tab5) a le sien, nommé autrement.
    if (path.dirname(p) !== racine && !cl.SheetNames.includes('Exercice')) {
      fautifs.push(nom + ' (sans onglet Exercice)');
    }
  });
  if (fautifs.length) throw new Error('classeur(s) avec corrigé : ' + fautifs.join(', '));
});

// ---------- 24 quater. TAB-3, les dix cas de calculs commerciaux
// Le cas 3 (établir un devis) est celui qu'on dépose : c'est le seul où une erreur de
// ligne se propage jusqu'aux totaux (remise de ligne → net → total HT → remise globale →
// TTC). Si les contrôles générés tombaient à côté des cellules de réponse, ou si le
// modèle portait déjà une valeur, ce cas le dirait avant les autres.
await v('TAB-3 : les dix cas de calculs commerciaux', async () => {
  await page.click('#btnListe');          // on sort de l'étape 7 de TAB-1
  await page.click('#btnRetour');          // retour à la rubrique Tableur
  await page.waitForSelector('[data-act="calculs-commerciaux"]', { timeout: 6000 });
  await page.click('[data-act="calculs-commerciaux"]');
  await page.waitForSelector('[data-exo="exc01"]', { timeout: 6000 });

  const vus = await page.$$eval('[data-exo]', (e) => e.map((x) => x.dataset.exo));
  if (vus.length !== 10) throw new Error(`${vus.length} cas au lieu de 10`);
  const entete = (await page.textContent('#hoteActivite')).replace(/\s+/g, ' ');
  // Les dix se corrigent automatiquement : aucun ne doit sortir du total, contrairement
  // à TAB-1 où deux étapes se vérifient en classe.
  if (/ne comptent pas dans ce total/.test(entete)) {
    throw new Error('un cas de TAB-3 est hors notation, alors que les dix sont corrigeables');
  }

  await page.click('[data-exo="exc03"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
  if (!baseXlsx) throw new Error('module xlsx introuvable pour fabriquer le classeur — npm i -g xlsx@0.18.5');
  const XLSX3 = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX3.set_fs(fs);
  const { EXERCICES: EX3 } = await import(pathToFileURL(path.join(ROOT, 'contenus/tab3-calculs-commerciaux.js')).href);
  const exc03 = EX3.find((e) => e.id === 'exc03');
  const cl3 = XLSX3.read(fs.readFileSync(path.join(ROOT, 'contenus/tab3/', exc03.fichier)));
  const f3 = cl3.Sheets['Exercice'];
  if (!f3) throw new Error("le classeur du cas 3 n'a pas d'onglet « Exercice »");
  exc03.controles.forEach((c) => {
    if (f3[c.cellule]) throw new Error(`le modèle contient déjà une réponse en ${c.cellule}`);
    f3[c.cellule] = { t: 'n', v: c.attendu };
  });
  const rempli3 = path.join(os.tmpdir(), 'prepalog-exc03-rempli.xlsx');
  XLSX3.writeFile(cl3, rempli3);
  await page.setInputFiles('#fichier', rempli3);
  const attendus = exc03.controles.length;
  await page.waitForFunction(
    (n) => new RegExp(`${n} contrôles réussis sur ${n}`).test(document.body.textContent),
    attendus, { timeout: 15000 },
  );
  fs.unlinkSync(rempli3);
});

// ---------- 24 quinquies. TAB-4, la journée en entrepôt : le contenu et les positions
//
// Module neuf, pas une reprise de la Suite : il n'existe aucun corrigé d'origine à
// confronter, comme on l'a fait pour TAB-1 à TAB-3. Ce qui prend sa place : le générateur
// vérifie à chaque passage que les cellules visées sont vides et tombent sur des cases à
// remplir, et ce test porte des REPÈRES DE POSITION ÉCRITS À LA MAIN, qui ne descendent pas
// de la géométrie du JSON. Si les deux outils se mettaient un jour à viser des cellules
// différentes, c'est ici qu'on le verrait.
await v('TAB-4 : les treize étapes de la journée', async () => {
  const { EXERCICES: EX4 } =
    await import(pathToFileURL(path.join(ROOT, 'contenus/tab4-journee-entrepot.js')).href);

  if (EX4.length !== 13) throw new Error(`${EX4.length} étapes au lieu de 13`);
  const total = EX4.reduce((n, e) => n + e.controles.length, 0);
  if (total !== 93) throw new Error(`${total} contrôles au lieu de 93`);
  if (EX4.some((e) => !e.controles.length)) {
    throw new Error('une étape de TAB-4 est sans contrôle, donc hors notation');
  }

  // Quatre blocs de journée, et pas treize groupes d'une étape : le `groupe` sert à
  // regrouper les tuiles, donc il ne peut pas être l'heure, qui est unique à chaque étape.
  const blocs = [...new Set(EX4.map((e) => e.groupe))];
  if (blocs.length !== 4) throw new Error(`${blocs.length} blocs au lieu de 4 : ${blocs.join(' | ')}`);

  // Les repères, écrits à la main.
  const ex = (id) => EX4.find((e) => e.id === id) || (() => { throw new Error('étape absente : ' + id); })();
  const cellules = (id) => ex(id).controles.map((c) => c.cellule).join(' ');
  const repere = (id, attendu) => {
    if (cellules(id) !== attendu) {
      throw new Error(`${id} vise ${cellules(id)} au lieu de ${attendu}`);
    }
  };
  repere('cap01', 'E12 E13 E14 E15 E16 E17 E18');
  repere('cap13', 'C22 C23 C24 C25 C26 C27');
  repere('cap04', 'C30 C31 C32 C33 C34');
  repere('cap12', 'E12 F12 G12 H12 E13 F13 G13 H13');

  // Quelques valeurs attendues, recalculées ici à la main, sans passer par le générateur.
  const att = (id, cel, v, tol) => {
    const c = ex(id).controles.find((x) => x.cellule === cel);
    if (!c) throw new Error(`${id} : pas de contrôle en ${cel}`);
    const ok = typeof v === 'number' ? Math.abs(c.attendu - v) < (tol || 1e-9) : c.attendu === v;
    if (!ok) throw new Error(`${id} ${cel} : attendu ${v}, le générateur dit ${c.attendu}`);
  };
  att('cap02', 'E13', -2);                 // 8 reçus pour 10 commandés
  att('cap03', 'D12', true);               // 24 = 24
  att('cap03', 'D13', false);              // 8 ≠ 10
  att('cap04', 'C34', 217);                // 27 + 59 + 81 + 50
  att('cap05', 'F12', 52);                 // 40 + 24 − 12
  att('cap06', 'C22', 3195.25, 0.001);     // la valeur totale du stock
  att('cap07', 'C27', 15.67, 0.001);       // 156,7 / 10
  att('cap11', 'C21', 114.17, 0.001);      // le poids de l'envoi, en kilos
  att('cap12', 'H12', 0.912, 1e-9);        // 1,20 × 0,80 × 0,95
  att('cap13', 'C27', -10);                // 302 entrées − 312 sorties

  // Le piège volontaire de l'exercice 10 : un stock ÉGAL au mini n'est pas en alerte,
  // parce que le test est « strictement plus petit ». Deux lignes le rencontrent.
  att('cap10', 'E14', 'Stock suffisant');  // 15 en stock pour un mini de 15
  att('cap10', 'E18', 'Stock suffisant');  // 3 en stock pour un mini de 3
  att('cap10', 'E12', 'À commander');      // 52 pour un mini de 60

  // Les deux libellés que l'élève recopie. Ils sont écrits ici en clair : si quelqu'un
  // change « Stock suffisant » dans les données sans toucher aux consignes des classeurs,
  // ce test le dit avant les élèves.
  const textes = new Set(EX4.flatMap((e) => e.controles.map((c) => c.attendu))
    .filter((v) => typeof v === 'string'));
  ['À commander', 'Stock suffisant'].forEach((t) => {
    if (!textes.has(t)) throw new Error(`le libellé « ${t} » n'est attendu nulle part`);
  });
  if (textes.size !== 2) throw new Error('libellés inattendus : ' + [...textes].join(' | '));
});

// ---------- 24 sexies. TAB-4 : trois classeurs déposés, trois sans-faute
//
// Trois étapes choisies pour les trois sortes de valeur attendue, parce que le lecteur de
// classeurs ne les compare pas de la même façon : cap03 rend des booléens, cap09 du texte
// (comparaison indulgente sur la casse et les accents), cap13 des nombres posés dans le
// bloc d'indicateurs, sous le tableau — la position la plus fragile des treize.
await v('TAB-4 : trois classeurs déposés, trois sans-faute', async () => {
  await page.click('#btnListe');
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="journee-entrepot"]', { timeout: 6000 });
  await page.click('[data-act="journee-entrepot"]');
  await page.waitForSelector('[data-exo="cap01"]', { timeout: 6000 });

  const vus = await page.$$eval('[data-exo]', (e) => e.map((x) => x.dataset.exo));
  if (vus.length !== 13) throw new Error(`${vus.length} étapes affichées au lieu de 13`);
  const entete = (await page.textContent('#hoteActivite')).replace(/\s+/g, ' ');
  if (/ne comptent pas dans ce total/.test(entete)) {
    throw new Error('une étape de TAB-4 est hors notation, alors que les treize sont corrigeables');
  }
  if (!/sur 13/.test(entete)) throw new Error('le total n\'est pas sur 13 : ' + entete.slice(0, 120));

  if (!baseXlsx) throw new Error('module xlsx introuvable pour fabriquer le classeur — npm i -g xlsx@0.18.5');
  const XLSX4 = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  XLSX4.set_fs(fs);
  const { EXERCICES: EX4 } =
    await import(pathToFileURL(path.join(ROOT, 'contenus/tab4-journee-entrepot.js')).href);

  for (const id of ['cap03', 'cap09', 'cap13']) {
    const etape = EX4.find((e) => e.id === id);
    await page.click(`[data-exo="${id}"]`);
    await page.waitForSelector('#depot', { timeout: 6000 });

    const cl = XLSX4.read(fs.readFileSync(path.join(ROOT, 'contenus/tab4/', etape.fichier)));
    const f = cl.Sheets['Exercice'];
    if (!f) throw new Error(`${id} : le classeur n'a pas d'onglet « Exercice »`);
    etape.controles.forEach((c) => {
      // Les classeurs de TAB-4 sont fabriqués, donc les cases devraient être vides par
      // construction. On le revérifie : une construction juste aujourd'hui peut casser.
      if (f[c.cellule]) throw new Error(`${id} : le modèle contient déjà une réponse en ${c.cellule}`);
      const t = typeof c.attendu === 'boolean' ? 'b' : typeof c.attendu === 'string' ? 's' : 'n';
      f[c.cellule] = { t, v: c.attendu };
    });
    const rempli = path.join(os.tmpdir(), `prepalog-${id}-rempli.xlsx`);
    XLSX4.writeFile(cl, rempli);
    await page.setInputFiles('#fichier', rempli);
    const n = etape.controles.length;
    await page.waitForFunction(
      (k) => new RegExp(`${k} contrôles réussis sur ${k}`).test(document.body.textContent),
      n, { timeout: 15000 },
    );
    fs.unlinkSync(rempli);
    await page.click('#btnListe');
    await page.waitForSelector('[data-exo="cap01"]', { timeout: 6000 });
  }

  // On laisse la page sur une étape ouverte, pas sur la liste : le test suivant commence
  // par « revenir à la liste », et il ne trouverait pas le bouton.
  await page.click('[data-exo="cap01"]');
  await page.waitForSelector('#depot', { timeout: 6000 });
});

// ---------- 25. l'enseignant voit la même série que l'élève
await v('série tableur : l\'enseignant voit la même série que l\'élève', async () => {
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
  // Plus aucun exercice n'est restreint : aucune étiquette de niveau ne doit subsister,
  // sinon c'est qu'un `niveaux` traîne encore dans le contenu.
  const etiq = await page.$$eval('[data-exo] .code', (e) => e.map((x) => x.textContent).join(' '));
  if (/2de|1re|Tle|CAP/.test(etiq)) {
    throw new Error('une étiquette de niveau subsiste : ' + etiq.slice(0, 120));
  }
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

// ---------- 26 bis. la trame de la séance se télécharge depuis le bandeau
// Règle révisée le 01/10/2026 : la trame reste le support des consignes, mais le fichier
// est à portée de clic. Un lien de trame qui tombe dans le vide se découvrirait en séance,
// au pire moment — on vérifie donc que les fichiers partent vraiment, pas seulement que
// les liens sont là.
await v('Spartoo : la trame se télécharge depuis le bandeau', async () => {
  // Le bandeau doit aussi nommer la séance en cours : c'est ce que l'enseignant lit
  // en passant dans les rangs. On ne fige pas le libellé, seulement sa présence.
  const seance = (await page.textContent('.ent-bandeau .ent-seance') || '').trim();
  if (seance.length < 3) throw new Error('la séance en cours n\'est pas nommée dans le bandeau');
  const liens = await page.$$eval('.ent-bandeau a[download]', (a) => a.map((x) => x.getAttribute('href')));
  if (liens.length !== 2) throw new Error(`${liens.length} lien(s) de trame au lieu de 2 (PDF et Word)`);
  if (!liens.some((h) => /\.pdf$/.test(h)) || !liens.some((h) => /\.docx$/.test(h))) {
    throw new Error('les deux formats ne sont pas proposés : ' + liens.join(', '));
  }
  for (const h of liens) {
    const rep = await page.request.get(new URL(h, page.url()).toString());
    if (!rep.ok()) throw new Error(`trame introuvable (${rep.status()}) : ${h}`);
    const octets = (await rep.body()).length;
    if (octets < 5000) throw new Error(`trame suspecte (${octets} octets) : ${h}`);
  }
});

// ---------- 26 ter. toute trame déclarée existe dans le dépôt
// Relecture statique, sans navigateur : elle couvre les trois séances d'un coup, y compris
// celles qu'aucun test ne parcourt, et toute séance ajoutée plus tard.
await v('toute trame déclarée existe dans le dépôt', async () => {
  const manquants = [];
  const parcourir = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { if (!['.git', 'node_modules', 'vendor'].includes(e.name)) parcourir(f); continue; }
      if (!/\.js$/.test(e.name)) continue;
      const src = fs.readFileSync(f, 'utf8');
      // Les chemins déclarés sont relatifs à la racine du site : './contenus/trames/…'.
      for (const m of src.matchAll(/(?:pdf|docx):\s*'(\.\/contenus\/trames\/[^']+)'/g)) {
        const cible = path.join(ROOT, m[1].replace(/^\.\//, ''));
        if (!fs.existsSync(cible)) manquants.push(`${path.relative(ROOT, f)} → ${m[1]}`);
      }
    }
  };
  parcourir(path.join(ROOT, 'activites'));
  if (manquants.length) throw new Error('trame déclarée mais absente : ' + manquants.join(', '));
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
  await page.waitForSelector('text=ENT-1.1', { timeout: 6000 });
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
  await page.waitForSelector('text=ENT-1.2', { timeout: 6000 });
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
  await page.waitForSelector('text=ENT-1.3', { timeout: 6000 });
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


// ---------- 44 à 56. les deux vues de transport du noyau — plan et tournée
//
// Écrites le 02/10/2026 pour ENT-3.1 (la tournée du vélo-cargo de Boost), mais aucun
// contenu ne les déclare encore : c'est le lot 1, le noyau seul. On les éprouve donc sur un
// scénario d'ESSAI, monté à la main dans un onglet dédié, et on passe par `creerEntreprise`
// plutôt que par les deux modules directement — c'est le branchement autant que le calcul
// qu'on veut garder : entrée de menu, état rangé dans la base de l'élève, jalon remonté.
//
// Le scénario d'essai est choisi pour que les deux contraintes basculent au même endroit :
// les quatre points pèsent 230 kg pour 180 kg utiles ET font rentrer à 13 h 51 pour un
// train à 13 h 46 ; en laisser un à quai ramène à 180 kg pile et à 13 h 45. C'est la règle
// du projet — vérifier dans les deux sens, pas seulement voir du vert.
const ctxTr = await nav.newContext();
const pageTr = await ctxTr.newPage();
pageTr.setDefaultTimeout(8000);
const erreursTr = [];
pageTr.on('pageerror', (e) => erreursTr.push('PAGEERROR: ' + e.message));
pageTr.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursTr.push('CONSOLE: ' + m.text()); });
await pageTr.goto('http://127.0.0.1:8099/');
await pageTr.waitForSelector('#btnProf', { timeout: 8000 });

// Le montage. Tout le scénario vit ici, dans la page : les cases de report portent des
// fonctions, qui ne traversent pas la frontière entre Node et le navigateur.
await pageTr.evaluate(async () => {
  const m = await import('/core/types/entreprise.js');

  const PLAN = {
    libelle: 'Plan d\'essai', titre: 'Plan d\'essai',
    consigne: 'Situez les quatre points, puis écrivez leur case.',
    largeur: 400, hauteur: 200,
    fond: '<rect x="0" y="0" width="400" height="200" fill="none"/>',
    grille: { colonnes: 'ABCD', lignes: 2 },
    echelle: { pixels: 100, facteurRoute: 1, libelle: '1 km' },
    depart: { nom: 'Depot Essai', lettre: 'D', x: 50, y: 50 },
    arrivee: { nom: 'Gare Essai', x: 350, y: 150 },
    points: [
      { id: 'p1', nom: 'Client Un', zone: 'Quartier Un', adresse: '1 rue Une', x: 150, y: 50, kg: 60, colis: 2 },
      { id: 'p2', nom: 'Client Deux', zone: 'Quartier Deux', adresse: '2 rue Deux', x: 250, y: 50, kg: 60, colis: 3 },
      { id: 'p3', nom: 'Client Trois', zone: 'Quartier Trois', adresse: '3 rue Trois', x: 150, y: 150, kg: 60, colis: 4 },
      { id: 'p4', nom: 'Client Quatre', zone: 'Quartier Quatre', adresse: '4 rue Quatre', x: 250, y: 150, kg: 50, colis: 1 },
    ],
    enLigne: { libelle: 'Ouvrir un plan en ligne', url: 'https://plan.invalid/essai' },
    reperage: { consigne: 'Une case par point.', champ: 'Case', secours: 'Je n\'ai pas acces a Internet' },
  };

  const TOURNEE = {
    libelle: 'Tournee d\'essai', titre: 'Tournee d\'essai',
    mesures: [
      { id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: 180 },
      { id: 'colis', libelle: 'Colis', unite: 'colis', champ: 'colis' },
    ],
    horaire: { depart: 13 * 60, limite: 13 * 60 + 46, vitesse: 12, service: 6, libelleLimite: 'depart du train' },
    report: [
      { id: 'rcharge', libelle: 'Charge emportee', unite: 'kg', valeur: (b) => b.cumuls.charge },
      { id: 'rarrets', libelle: 'Nombre d\'arrets', valeur: (b) => b.retenus.length },
      { id: 'rkm', libelle: 'Distance', unite: 'km', tolerance: 0.1, valeur: (b) => b.km },
      { id: 'rretour', libelle: 'Minute de retour', valeur: (b) => Math.round(b.arrivee) },
    ],
  };

  const base = () => ({
    v: 1, seq: 1, stock: {}, mails: [], orders: [], receptions: [], moves: [],
    customers: [], suppliers: [], _depart: [],
  });
  const CAT = { MODELS: [], MM: {}, VARIANTS: [], VM: {} };
  const commun = {
    ENTREPRISE: { nom: 'Essai Transport', sousTitre: 'scenario d\'essai' },
    VOCAB: { unit: 'piece', unitPl: 'pieces', sizeLabel: 'Taille' },
    CATALOGUE: CAT, SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {},
    baseDeDepart: base, THEME: {},
  };

  // `db` est passable de l'extérieur : c'est ce qui permet de monter DEUX séances sur une
  // même base, comme les trois séances de Spartoo le font en production.
  const monter = (hoteId, extra, etapes, metaId, db) => {
    const hote = document.createElement('div');
    hote.id = hoteId;
    document.body.appendChild(hote);
    db = db || {};
    const suivi = [];
    const act = m.creerEntreprise(Object.assign({}, commun, { etapes: etapes || [] }, extra));
    act.rendre(hote, {
      meta: { id: metaId || 'ess1', portee: 'eleve', code: 'ESS-1', titre: 'Essai Transport — transport' },
      profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: (r) => suivi.push(r),
      quitter: () => {}, codeStock: 'ABC',
    });
    return { db, suivi };
  };

  // Un jalon qui lit l'état de la vue plan : c'est le chemin que suivra le contenu.
  const etapes = [{
    id: 'rep', titre: 'Reperage fait',
    verifier: (db) => ({
      status: db.transport && db.transport.ess1 && db.transport.ess1.plan
        && db.transport.ess1.plan.valide ? 'ok' : 'attente',
    }),
  }];

  const avec = monter('essaiTr', { plan: PLAN, tournee: TOURNEE }, etapes, 'ess1');
  const sans = monter('essaiSans', {}, [], 'ess0');
  // Une deuxième séance SUR LA MÊME BASE, comme deux séances d'une même entreprise.
  const jumelle = monter('essaiJumelle', { plan: PLAN, tournee: TOURNEE }, [], 'ess2', avec.db);
  // Une séance pour la porte de sortie : deux essais, puis « continuer quand même ».
  const planSortie = Object.assign({}, PLAN, {
    reperage: Object.assign({}, PLAN.reperage, { essaisAvantIssue: 2, issue: 'Je ne trouve pas' }),
  });
  const sortie = monter('essaiSortie', { plan: planSortie, tournee: TOURNEE }, [], 'ess4');
  // Une séance qui tolère une case fausse, et qui ne bloque pas du tout la suite : l'élève
  // avance avec son erreur, qui reste visible.
  const planTol = Object.assign({}, PLAN, {
    reperage: Object.assign({}, PLAN.reperage, { toleres: 1, blocant: false }),
  });
  const tolere = monter('essaiTolere', { plan: planTol, tournee: TOURNEE }, [], 'ess5');
  // Et une séance où le transport n'est qu'une contrainte de charge : pas de plan du tout.
  const sansPlan = monter('essaiSansPlan', {
    tournee: {
      libelle: 'Chargement', titre: 'Chargement',
      points: PLAN.points,
      mesures: [{ id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: 180 }],
      report: [{ id: 'rcharge', libelle: 'Charge emportee', unite: 'kg', valeur: (b) => b.cumuls.charge }],
    },
  }, [], 'ess3');
  window.__tr = { avec, sans, jumelle, sansPlan, sortie, tolere, PLAN };
});

const casesJustes = { p1: 'B1', p2: 'C1', p3: 'B2', p4: 'C2' };
const ouvrir = async (vue) => {
  await pageTr.click(`#essaiTr .ent-nav[data-vue="${vue}"]`);
  await pageTr.waitForTimeout(80);
};
const texteTr = () => pageTr.textContent('#essaiTr .ent-main');

await v('transport : les deux vues ajoutent leur entrée de menu, et seulement si elles sont déclarées', async () => {
  const n = await pageTr.$$eval('#essaiTr .ent-nav[data-vue="plan"], #essaiTr .ent-nav[data-vue="tournee"]', (e) => e.length);
  if (n !== 2) throw new Error(`${n} entrée(s) de transport au lieu de 2`);
  const sep = await pageTr.$$eval('#essaiTr .ent-sep', (e) => e.map((x) => x.textContent));
  if (!sep.includes('Transport')) throw new Error('séparateur « Transport » absent : ' + sep.join(', '));
  // Et l'entreprise qui ne déclare rien garde exactement ses écrans d'avant.
  const m2 = await pageTr.$$eval('#essaiSans .ent-nav[data-vue="plan"], #essaiSans .ent-nav[data-vue="tournee"]', (e) => e.length);
  if (m2 !== 0) throw new Error('une entreprise sans transport affiche quand même ces vues');
  const sep2 = await pageTr.$$eval('#essaiSans .ent-sep', (e) => e.map((x) => x.textContent));
  if (sep2.includes('Transport')) throw new Error('séparateur « Transport » affiché sans transport');
});

await v('vue plan : quadrillage, repères, légende et échelle sont dessinés', async () => {
  await ouvrir('plan');
  const pts = await pageTr.$$eval('#essaiTr .plan-pt', (e) => e.length);
  if (pts !== 4) throw new Error(`${pts} point(s) dessiné(s) au lieu de 4`);
  const svg = await pageTr.textContent('#essaiTr .plan-svg');
  for (const c of ['A', 'B', 'C', 'D', '1', '2', '1 km']) {
    if (!svg.includes(c)) throw new Error(`repère « ${c} » absent du plan`);
  }
  const dep = await pageTr.$$eval('#essaiTr .plan-depart', (e) => e.length);
  const arr = await pageTr.$$eval('#essaiTr .plan-arrivee', (e) => e.length);
  if (dep !== 1 || arr !== 1) throw new Error('départ ou arrivée non dessiné');
  const leg = await pageTr.$$eval('#essaiTr .plan-legende span', (e) => e.length);
  if (leg < 4) throw new Error(`${leg} entrée(s) de légende`);
});

await v('vue plan : au temps 1 le plan est muet, et les quartiers sont cachés', async () => {
  const svg = await pageTr.textContent('#essaiTr .plan-svg');
  if (/Client Un|Client Deux/.test(svg)) throw new Error('les noms des points sont déjà sur le plan');
  const zones = await pageTr.$$eval('#essaiTr .plan-zone', (e) => e.map((x) => x.textContent.trim()));
  if (zones.some((z) => /Quartier/.test(z))) throw new Error('les quartiers sont donnés avant le filet de sécurité');
  if (zones.length !== 4) throw new Error(`${zones.length} ligne(s) de repérage au lieu de 4`);
});

await v('vue plan : une case fausse est vue, et le temps 2 reste fermé', async () => {
  // Sabotage volontaire : p3 est en B2, on écrit A1. Le reste est juste.
  for (const [id, c] of Object.entries(casesJustes)) {
    await pageTr.fill(`#essaiTr .plan-case[data-case="${id}"]`, id === 'p3' ? 'A1' : c);
  }
  await pageTr.click('#essaiTr [data-plan-valider]');
  await pageTr.waitForTimeout(100);
  const t = await texteTr();
  if (!/à revoir/.test(t)) throw new Error('la case fausse n\'est pas signalée');
  const ko = await pageTr.$$eval('#essaiTr .plan-table tr.plan-ko', (e) => e.length);
  if (ko !== 1) throw new Error(`${ko} ligne(s) marquée(s) fausse(s) au lieu d'une`);
  const svg = await pageTr.textContent('#essaiTr .plan-svg');
  if (/Client Un/.test(svg)) throw new Error('le temps 2 s\'est ouvert malgré une erreur');
  if (!/Valider le repérage/.test(t)) throw new Error('le bouton de validation a disparu');
});

await v('vue plan : le filet de sécurité donne le quartier, pas la case', async () => {
  await pageTr.click('#essaiTr [data-plan-secours]');
  await pageTr.waitForTimeout(100);
  const zones = await pageTr.$$eval('#essaiTr .plan-zone', (e) => e.map((x) => x.textContent.trim()));
  if (zones.filter((z) => /Quartier/.test(z)).length !== 4) throw new Error('les quartiers ne sont pas révélés');
  const cases = await pageTr.$$eval('#essaiTr .plan-case', (e) => e.map((x) => x.value));
  if (cases.join('|') !== 'B1|C1|A1|C2') throw new Error('les cases saisies ont bougé : ' + cases.join('|'));
  const t = await texteTr();
  if (!/reste à lire sur le plan/.test(t)) throw new Error('le filet de sécurité ne dit pas ce qu\'il ne donne pas');
});

await v('vue tournée : fermée tant que le repérage n\'est pas validé', async () => {
  await ouvrir('tournee');
  const t = await texteTr();
  if (!/Commencez par/.test(t)) throw new Error('la tournée s\'ouvre avant le repérage');
  const items = await pageTr.$$eval('#essaiTr .tour-item', (e) => e.length);
  if (items !== 0) throw new Error('les arrêts sont déjà manipulables');
});

await v('vue plan : les quatre cases justes ouvrent le temps 2', async () => {
  await ouvrir('plan');
  await pageTr.fill('#essaiTr .plan-case[data-case="p3"]', 'b 2');   // minuscule et espace : acceptés
  await pageTr.click('#essaiTr [data-plan-valider]');
  await pageTr.waitForTimeout(120);
  const t = await texteTr();
  if (!/Repérage validé/.test(t)) throw new Error('le repérage n\'est pas validé');
  const svg = await pageTr.textContent('#essaiTr .plan-svg');
  for (const n of ['Client Un', 'Client Deux', 'Client Trois', 'Client Quatre']) {
    if (!svg.includes(n)) throw new Error(`le nom « ${n} » n'apparaît pas au temps 2`);
  }
});

await v('transport : l\'état vit dans la base de l\'élève et le jalon remonte au suivi', async () => {
  const r = await pageTr.evaluate(() => ({
    valide: !!(window.__tr.avec.db.transport && window.__tr.avec.db.transport.ess1
      && window.__tr.avec.db.transport.ess1.plan && window.__tr.avec.db.transport.ess1.plan.valide),
    cases: window.__tr.avec.db.transport.ess1.plan.cases,
    dernier: window.__tr.avec.suivi[window.__tr.avec.suivi.length - 1],
  }));
  if (!r.valide) throw new Error('le repérage validé n\'est pas écrit dans la base de l\'élève');
  if (r.cases.p3 !== 'b 2') throw new Error('la saisie n\'est pas conservée : ' + JSON.stringify(r.cases));
  if (!r.dernier || r.dernier.score !== 1 || r.dernier.max !== 1) {
    throw new Error('jalon non remonté : ' + JSON.stringify(r.dernier));
  }
});

await v('transport : deux séances d\'une même entreprise ne se marchent pas sur l\'état', async () => {
  // La vraie raison d'être de ce test : les séances d'une entreprise partagent UNE base. Si
  // l'état du transport n'était pas rangé par séance, le repérage validé ci-dessus aurait
  // ouvert d'office le temps 2 de la séance jumelle — et l'élève aurait sauté l'exercice.
  // Il faut ouvrir sa vue : l'état d'une séance n'est créé qu'à l'ouverture, pas au montage.
  await pageTr.click('#essaiJumelle .ent-nav[data-vue="plan"]');
  await pageTr.waitForTimeout(120);
  const cles = await pageTr.evaluate(() => Object.keys(window.__tr.avec.db.transport).sort());
  if (cles.join(',') !== 'ess1,ess2') throw new Error('clés de transport : ' + cles.join(','));
  const svg = await pageTr.textContent('#essaiJumelle .plan-svg');
  if (/Client Un/.test(svg)) throw new Error('la séance jumelle est déjà au temps 2');
  const t = await pageTr.textContent('#essaiJumelle .ent-main');
  if (!/Valider le repérage/.test(t)) throw new Error('la séance jumelle n\'a pas son propre repérage');
  // Et la base de la séance jumelle est bien la même : c'est un partage, pas deux bases.
  const memeBase = await pageTr.evaluate(() => window.__tr.jumelle.db === window.__tr.avec.db);
  if (!memeBase) throw new Error('test invalide : les deux séances n\'ont pas la même base');
});

await v('vue tournée : utilisable sans plan, pour une simple contrainte de charge', async () => {
  // Beaucoup de scénarios n'auront pas de carte : le transport y sera une contrainte de
  // plus, pas le sujet. La vue doit alors fonctionner sans plan, sans distance et sans
  // horaire — et sans se verrouiller, puisqu'il n'y a pas de repérage à faire.
  await pageTr.click('#essaiSansPlan .ent-nav[data-vue="tournee"]');
  await pageTr.waitForTimeout(100);
  const z = '#essaiSansPlan .ent-main';
  const svg = await pageTr.$$eval(`${z} .plan-svg`, (e) => e.length);
  if (svg !== 0) throw new Error('un plan est dessiné alors qu\'aucun n\'est déclaré');
  const items = await pageTr.$$eval(`${z} #tourListe .tour-item`, (e) => e.length);
  if (items !== 4) throw new Error(`${items} arrêt(s) au lieu de 4`);
  let t = await pageTr.textContent(z);
  if (/Commencez par/.test(t)) throw new Error('la vue se verrouille alors qu\'il n\'y a pas de repérage');
  if (!/Charge dépassée de 50 kg/.test(t)) throw new Error('le plafond de charge ne joue pas sans plan');
  if (/Retour prévu/.test(t)) throw new Error('un horaire est affiché sans plan, donc sans distance');
  if (/tracé du plan/.test(t)) throw new Error('la consigne parle d\'un tracé inexistant');
  // Et elle reste pilotable : laisser un arrêt à quai ramène sous le plafond.
  await pageTr.click(`${z} [data-quai="p4"]`);
  await pageTr.waitForTimeout(100);
  t = await pageTr.textContent(z);
  if (!/180 \/ 180 kg/.test(t) || /dépassée/.test(t)) throw new Error('la charge ne se recalcule pas sans plan');
});

await v('vue tournée : les quatre arrêts dépassent la charge ET font manquer l\'horaire', async () => {
  await ouvrir('tournee');
  const items = await pageTr.$$eval('#essaiTr #tourListe .tour-item', (e) => e.length);
  if (items !== 4) throw new Error(`${items} arrêt(s) au lieu de 4`);
  const t = await texteTr();
  if (!/Charge dépassée de 50 kg/.test(t)) throw new Error('dépassement de charge non signalé : ' + t.slice(0, 400));
  if (!/depart du train manqué/.test(t)) throw new Error('horaire manqué non signalé');
  if (!/13 h 51/.test(t)) throw new Error('heure de retour inattendue');
  const trop = await pageTr.$$eval('#essaiTr .tour-jauge.trop', (e) => e.length);
  if (trop !== 2) throw new Error(`${trop} jauge(s) en alerte au lieu de 2`);
});

await v('vue tournée : laisser un arrêt à quai ramène sous le plafond et dans l\'horaire', async () => {
  await pageTr.click('#essaiTr [data-quai="p4"]');
  await pageTr.waitForTimeout(120);
  const t = await texteTr();
  if (!/180 \/ 180 kg/.test(t)) throw new Error('la charge n\'est pas recalculée : ' + t.slice(0, 300));
  if (/dépassée|manqué/.test(t)) throw new Error('une alerte subsiste alors que tout passe');
  if (!/13 h 45/.test(t)) throw new Error('heure de retour inattendue après le retrait');
  const trop = await pageTr.$$eval('#essaiTr .tour-jauge.trop', (e) => e.length);
  if (trop !== 0) throw new Error('une jauge reste en alerte');
  const quai = await pageTr.$$eval('#essaiTr .tour-liste-quai .tour-item', (e) => e.length);
  if (quai !== 1) throw new Error('l\'arrêt n\'est pas à quai');
});

await v('vue tournée : les flèches réordonnent, et le tracé du plan suit', async () => {
  const avant = await pageTr.getAttribute('#essaiTr .plan-trace', 'points');
  await pageTr.click('#essaiTr [data-bas="0"]');
  await pageTr.waitForTimeout(120);
  const noms = await pageTr.$$eval('#essaiTr #tourListe .tour-item strong', (e) => e.map((x) => x.textContent));
  if (noms[0] !== 'Client Deux' || noms[1] !== 'Client Un') throw new Error('ordre inchangé : ' + noms.join(', '));
  const apres = await pageTr.getAttribute('#essaiTr .plan-trace', 'points');
  if (apres === avant) throw new Error('le tracé ne suit pas l\'ordre');
  if (!apres.startsWith('50,50 250,50')) throw new Error('tracé inattendu : ' + apres);
  // On remet l'ordre d'origine pour la suite.
  await pageTr.click('#essaiTr [data-haut="1"]');
  await pageTr.waitForTimeout(120);
});

await v('vue tournée : le glisser-déposer réordonne aussi', async () => {
  const src = pageTr.locator('#essaiTr #tourListe .tour-item').nth(2);
  const cible = pageTr.locator('#essaiTr #tourListe .tour-item').nth(0);
  await src.dragTo(cible);
  await pageTr.waitForTimeout(150);
  const noms = await pageTr.$$eval('#essaiTr #tourListe .tour-item strong', (e) => e.map((x) => x.textContent));
  if (noms[0] !== 'Client Trois') throw new Error('le glisser-déposer n\'a rien déplacé : ' + noms.join(', '));
  // Retour à l'ordre p1, p2, p3 par les flèches, pour que les valeurs attendues soient connues.
  await pageTr.click('#essaiTr [data-bas="0"]');
  await pageTr.waitForTimeout(100);
  await pageTr.click('#essaiTr [data-bas="1"]');
  await pageTr.waitForTimeout(100);
  const n2 = await pageTr.$$eval('#essaiTr #tourListe .tour-item strong', (e) => e.map((x) => x.textContent));
  if (n2.join('|') !== 'Client Un|Client Deux|Client Trois') throw new Error('ordre non rétabli : ' + n2.join('|'));
});

await v('vue tournée : une valeur reportée fausse est vue, les quatre justes sont acceptées', async () => {
  const saisir = async (vals) => {
    for (const [id, val] of Object.entries(vals)) {
      await pageTr.fill(`#essaiTr [data-report="${id}"]`, val);
    }
    await pageTr.click('#essaiTr [data-tour-valider]');
    await pageTr.waitForTimeout(140);
  };
  // Sabotage : la charge est à 180, on écrit 170. Les trois autres sont justes.
  await saisir({ rcharge: '170', rarrets: '3', rkm: '5,4', rretour: '825' });
  let t = await texteTr();
  if (!/1 résultat\(s\)\s+à revoir/.test(t)) throw new Error('la valeur fausse n\'est pas vue : ' + t.slice(-400));
  let ko = await pageTr.$$eval('#essaiTr .tour-saisie input.faux', (e) => e.length);
  if (ko !== 1) throw new Error(`${ko} case(s) marquée(s) fausse(s) au lieu d'une`);

  await saisir({ rcharge: '180' });
  t = await texteTr();
  if (!/Tous les résultats sont justes/.test(t)) throw new Error('les quatre justes ne sont pas acceptés : ' + t.slice(-400));
  const okc = await pageTr.$$eval('#essaiTr .tour-saisie input.juste', (e) => e.length);
  if (okc !== 4) throw new Error(`${okc} case(s) juste(s) au lieu de 4`);
  const valide = await pageTr.evaluate(() => !!window.__tr.avec.db.transport.ess1.tournee.valide);
  if (!valide) throw new Error('la tournée validée n\'est pas écrite dans la base');
});

await v('vue tournée : réordonner après coup efface la correction', async () => {
  await pageTr.click('#essaiTr [data-bas="0"]');
  await pageTr.waitForTimeout(120);
  const t = await texteTr();
  if (/sont justes|à revoir/.test(t)) throw new Error('la correction survit à un changement d\'ordre');
  const marques = await pageTr.$$eval('#essaiTr .tour-saisie input.juste, #essaiTr .tour-saisie input.faux', (e) => e.length);
  if (marques !== 0) throw new Error('des cases restent marquées');
});

await v('vue plan : la porte de sortie n\'apparaît qu\'après deux essais infructueux', async () => {
  // Règle de Tristan du 02/10 au soir : l'élève ne doit jamais être complètement bloqué, mais
  // il doit pouvoir se tromper. La porte de sortie ne s'ouvre donc pas tout de suite.
  const z = '#essaiSortie .ent-main';
  await pageTr.click('#essaiSortie .ent-nav[data-vue="plan"]');
  await pageTr.waitForTimeout(100);
  if (await pageTr.$$eval(`${z} [data-plan-issue]`, (e) => e.length)) {
    throw new Error('la porte de sortie est offerte avant le premier essai');
  }
  // Premier essai, tout faux : toujours pas de porte.
  for (const id of ['p1', 'p2', 'p3', 'p4']) await pageTr.fill(`${z} .plan-case[data-case="${id}"]`, 'A1');
  await pageTr.click(`${z} [data-plan-valider]`);
  await pageTr.waitForTimeout(120);
  if (await pageTr.$$eval(`${z} [data-plan-issue]`, (e) => e.length)) {
    throw new Error('la porte de sortie est offerte dès le premier essai');
  }
  // Deuxième essai : elle apparaît.
  await pageTr.click(`${z} [data-plan-valider]`);
  await pageTr.waitForTimeout(120);
  if (!(await pageTr.$$eval(`${z} [data-plan-issue]`, (e) => e.length))) {
    throw new Error('la porte de sortie ne s\'ouvre pas après deux essais');
  }
  const essais = await pageTr.evaluate(() => window.__tr.sortie.db.transport.ess4.plan.essais);
  if (essais !== 2) throw new Error('essais comptés : ' + essais);
});

await v('vue plan : continuer quand même débloque la suite sans valider le repérage', async () => {
  const z = '#essaiSortie .ent-main';
  await pageTr.click(`${z} [data-plan-issue]`);
  await pageTr.waitForTimeout(140);
  const t = await pageTr.textContent(z);
  if (!/Repérage non validé/.test(t)) throw new Error('le repérage est annoncé validé : ' + t.slice(0, 300));
  if (!/votre enseignant le voit/.test(t)) throw new Error('l\'élève n\'est pas averti de ce qui est enregistré');
  // Les noms apparaissent : il peut travailler la suite.
  const svg = await pageTr.textContent(`${z} .plan-svg`);
  if (!/Client Un/.test(svg)) throw new Error('le temps 2 ne s\'ouvre pas');
  // Et la tournée n'est plus verrouillée.
  await pageTr.click('#essaiSortie .ent-nav[data-vue="tournee"]');
  await pageTr.waitForTimeout(120);
  const t2 = await pageTr.textContent(z);
  if (/Commencez par/.test(t2)) throw new Error('la tournée reste verrouillée après la porte de sortie');
  if (!(await pageTr.$$eval(`${z} #tourListe .tour-item`, (e) => e.length))) {
    throw new Error('les arrêts ne sont pas manipulables');
  }
  // Le suivi doit pouvoir distinguer « a trouvé » de « a renoncé ».
  const etat = await pageTr.evaluate(() => {
    const p = window.__tr.sortie.db.transport.ess4.plan;
    return { valide: !!p.valide, force: !!p.force };
  });
  if (etat.valide) throw new Error('la porte de sortie a marqué le repérage comme réussi');
  if (!etat.force) throw new Error('le recours à la porte de sortie n\'est pas enregistré');
});

await v('vue plan : une séance peut ne pas bloquer la suite du tout', async () => {
  // `blocant: false` : le repérage se fait et se corrige, mais il n'enferme personne. C'est le
  // réglage pour une séance où la carte n'est pas le cœur du travail.
  const z = '#essaiTolere .ent-main';
  await pageTr.click('#essaiTolere .ent-nav[data-vue="tournee"]');
  await pageTr.waitForTimeout(120);
  const t = await pageTr.textContent(z);
  if (/Commencez par/.test(t)) throw new Error('la tournée est verrouillée malgré blocant: false');
  if (!(await pageTr.$$eval(`${z} #tourListe .tour-item`, (e) => e.length))) {
    throw new Error('les arrêts ne sont pas manipulables');
  }
  // Et le repérage n'est pour autant pas réputé fait.
  const valide = await pageTr.evaluate(() => {
    const p = window.__tr.tolere.db.transport.ess5;
    return !!(p && p.plan && p.plan.valide);
  });
  if (valide) throw new Error('le repérage est marqué validé sans avoir été fait');
});

await v('vue plan : une séance peut tolérer une case fausse', async () => {
  const z = '#essaiTolere .ent-main';
  await pageTr.click('#essaiTolere .ent-nav[data-vue="plan"]');
  await pageTr.waitForTimeout(100);
  // Trois justes, une fausse : avec toleres: 1, ça passe — et l'erreur reste affichée.
  const justes = { p1: 'B1', p2: 'C1', p3: 'B2', p4: 'C2' };
  for (const [id, c] of Object.entries(justes)) {
    await pageTr.fill(`${z} .plan-case[data-case="${id}"]`, id === 'p4' ? 'A1' : c);
  }
  await pageTr.click(`${z} [data-plan-valider]`);
  await pageTr.waitForTimeout(140);
  const t = await pageTr.textContent(z);
  if (!/vous pouvez continuer/.test(t)) throw new Error('la tolérance ne joue pas : ' + t.slice(0, 300));
  if (!/Repérage validé/.test(t)) throw new Error('le repérage n\'est pas validé malgré la tolérance');
  const ko = await pageTr.$$eval(`${z} .plan-table tr.plan-ko`, (e) => e.length);
  if (ko !== 1) throw new Error(`${ko} erreur(s) encore signalée(s) au lieu d'une`);
  const valide = await pageTr.evaluate(() => !!window.__tr.tolere.db.transport.ess5.plan.valide);
  if (!valide) throw new Error('la validation n\'est pas enregistrée');
});

await v('transport : aucune erreur de console pendant tout le parcours', async () => {
  if (erreursTr.length) throw new Error([...new Set(erreursTr)].slice(0, 3).join(' | '));
});


console.log('\n=== RÉUSSIS ===');
ok.forEach((o) => console.log('  ✓ ' + o));
if (ko.length) { console.log('\n=== ÉCHECS ==='); ko.forEach((k) => console.log('  ✗ ' + k)); }
if (erreurs.length) { console.log('\n=== ERREURS JS ==='); [...new Set(erreurs)].slice(0, 12).forEach((e) => console.log('  ! ' + e)); }
console.log(`\n${ok.length}/${ok.length + ko.length} tests réussis.`);

await nav.close();
srv.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
