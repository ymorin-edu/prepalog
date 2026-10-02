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

// ---------- 4 bis. les corrigés complets des trames sont dans l'espace enseignant
// Onglet « Corrigés » : un fichier par séance, déclaré par `meta.corrige`. La bonne réponse
// y est marquée par « ✓ » — une information portée par un signe, pas par la couleur seule.
await v('espace enseignant : onglet Corrigés', async () => {
  await page.click('[data-ong="corriges"]');
  await page.waitForSelector('text=un contrat de vente', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  if (!/✓ B\. un contrat de vente/.test(t)) throw new Error('bonne réponse non marquée');
  if (!/Pistes \(pas de réponse unique\)/.test(t)) throw new Error('pistes des questions de réflexion absentes');
  if (!/2006/.test(t) || !/Grenoble/.test(t)) throw new Error('réponses des questions de faits absentes');
  const nTab = await page.$$eval('#contenuProf table', (e) => e.length);
  if (nTab < 10) throw new Error(`${nTab} tableaux de réponses seulement`);
  for (const code of ['ENT-1.1', 'ENT-1.2', 'ENT-1.3', 'ENT-3.1']) {
    if (!t.includes(code)) throw new Error('corrigé absent : ' + code);
  }
  if (/n'a pas pu être chargé/.test(t)) throw new Error('un fichier de corrigé ne se charge pas');
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
  // Deux entreprises, et le rang se lit sur le premier chiffre : les trois séances Spartoo
  // (ENT-1.x), puis Boost (ENT-3.x). TechPro prendra ENT-2.x et viendra s'insérer entre les
  // deux sans qu'on touche à cette liste autrement qu'en l'allongeant.
  repere('Logisim', 'ENT-1.1 ENT-1.2 ENT-1.3 ENT-3.1');
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

// ---------- 11 ter. notes par compétence (chantier du 02/10/2026)
//
// Trois blocs : la règle de calcul à l'unité (valeurs écrites à la main, pas recalculées par
// la fonction vérifiée), le tableau des déclarations validé par Tristan (figé ici : une
// compétence qui change doit se voir), puis l'écran et l'export, pilotés comme un prof.

await v('compétences : moyenne pondérée, coefficients et cas de bord, à l\'unité', async () => {
  const C = await import(pathToFileURL(path.join(ROOT, 'core/competences.js')).href);
  // Coefficients : défauts 1 / 1 / 1 / 3, valeurs du groupe prioritaires, valeur abîmée = défaut.
  const d = C.coefsDuGroupe({});
  if (d.guidage !== 1 || d.entrainement !== 1 || d.erreur !== 1 || d.evaluation !== 3) {
    throw new Error('coefficients par défaut : ' + JSON.stringify(d));
  }
  const g = C.coefsDuGroupe({ coefs: { evaluation: 2, guidage: -1, entrainement: 'x', erreur: 0 } });
  if (g.evaluation !== 2 || g.guidage !== 1 || g.entrainement !== 1 || g.erreur !== 0) {
    throw new Error('coefficients du groupe : ' + JSON.stringify(g));
  }
  const s1 = { id: 's1', bareme: 2, temps: 'guidage', competences: ['C1.6'] };
  const s2 = { id: 's2', bareme: 10, temps: 'evaluation', competences: ['C1.6', 'C1.1'] };
  const s3 = { id: 's3', bareme: 3, notation: 'avancement', temps: 'guidage', competences: ['C1.6'] };
  const s4 = { id: 's4', bareme: 6, temps: 'entrainement', competences: ['C1.6'] };
  // 1/2 = 10 ; 8/10 = 16 ; 3 jalons sur 3 = 20 ; s4 pas faite (ne compte pas pour zéro).
  const travaux = { s1: { meilleur: 1, max: 2 }, s2: { meilleur: 8, max: 10 }, s3: { meilleur: 3, max: 3 } };
  const r = C.moyenneCompetence([s1, s2, s3, s4], travaux, d);
  // (10×1 + 16×3 + 20×1) / 5 = 78 / 5 = 15,6
  if (r.moyenne !== 15.6) throw new Error('moyenne ' + r.moyenne + ' au lieu de 15,6');
  if (r.nbNotes !== 3) throw new Error('séances notées ' + r.nbNotes + ' au lieu de 3');
  if (r.detail[3].note !== null) throw new Error('une séance pas faite a une note');
  // Évaluation au coefficient 1 : (10 + 16 + 20) / 3 = 15,33
  const r1 = C.moyenneCompetence([s1, s2, s3, s4], travaux, { ...d, evaluation: 1 });
  if (r1.moyenne !== 15.33) throw new Error('moyenne au coef 1 : ' + r1.moyenne + ' au lieu de 15,33');
  // Rien de fait, ou tout au coefficient 0 : pas de moyenne, pas de faux zéro.
  if (C.moyenneCompetence([s1, s4], {}, d).moyenne !== null) throw new Error('moyenne sans aucune note');
  const zero = { guidage: 0, entrainement: 0, erreur: 0, evaluation: 0 };
  if (C.moyenneCompetence([s1, s2], travaux, zero).moyenne !== null) throw new Error('moyenne à poids nul');
  // Une séance à deux compétences compte pour les deux ; l'ordre est celui du référentiel.
  const pc = C.seancesParCompetence([s1, s2, s3, s4, { id: 'x', bareme: 4, competences: [], temps: 'guidage' },
    { id: 'y', bareme: 4, competences: ['C1.6'] /* pas de temps : hors tableau */ }]);
  if (pc.map((c) => c.code).join(',') !== 'C1.1,C1.6') throw new Error('ordre des compétences : ' + pc.map((c) => c.code));
  if (pc[0].seances.map((m) => m.id).join() !== 's2') throw new Error('C1.1 : ' + pc[0].seances.map((m) => m.id));
  if (pc[1].seances.map((m) => m.id).join() !== 's1,s2,s3,s4') throw new Error('C1.6 : ' + pc[1].seances.map((m) => m.id));
  if (pc[1].libelle !== 'Gérer le suivi des stocks') throw new Error('libellé C1.6 : ' + pc[1].libelle);
});

await v('compétences : chaque séance déclare ce que Tristan a validé le 02/10', async () => {
  // Écrit à la main. Changer une ligne ici, c'est changer une note de bulletin : le dire.
  const ATTENDU = {
    'DEC-1': ['C1.1', 'guidage'], 'QUI-5': ['C1.1', 'entrainement'], 'QUI-6': ['C1.1', 'entrainement'],
    'QUI-7': ['C1.6', 'entrainement'], 'TAB-2': ['C1.6', 'entrainement'],
    'TAB-4': ['C1.4,C1.6', 'entrainement'], 'TAB-5': ['C1.6', 'entrainement'],
    'ENT-1.1': ['C1.4', 'guidage'], 'ENT-1.2': ['C2.2', 'guidage'], 'ENT-1.3': ['C3.2', 'guidage'],
    'ENT-3.1': ['C2.4', 'guidage'],
    'SCE-1': ['C1.6', 'guidage'], 'SCE-2': ['C1.6', 'evaluation'], 'SCE-3': ['C1.6', 'evaluation'],
    'SCE-4': ['C1.5', 'guidage'], 'SCE-5': ['C1.3,C1.4', 'guidage'],
  };
  const HORS = ['TAB-1', 'TAB-3', 'QUI-8', 'QUI-9', 'QUI-10'];
  const metas = await page.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { COMPETENCES, TEMPS } = await import('/core/competences.js');
    return (await chargerActivites()).map(({ meta: m }) => ({
      code: m.code, bareme: m.bareme, comp: (m.competences || []).join(','), temps: m.temps,
      inconnues: (m.competences || []).filter((c) => !COMPETENCES[c]),
      tempsOk: m.temps === undefined || !!TEMPS[m.temps],
    }));
  });
  const faux = [];
  for (const [code, [comp, temps]] of Object.entries(ATTENDU)) {
    const m = metas.find((x) => x.code === code);
    if (!m) { faux.push(code + ' introuvable'); continue; }
    if (m.comp !== comp || m.temps !== temps) faux.push(`${code} : ${m.comp} ${m.temps} (attendu ${comp} ${temps})`);
    if (!m.bareme) faux.push(code + ' sans barème');
  }
  HORS.forEach((code) => { const m = metas.find((x) => x.code === code); if (m && m.comp) faux.push(code + ' devrait être hors tableau'); });
  metas.forEach((m) => {
    if (m.inconnues.length) faux.push(`${m.code} : code inconnu ${m.inconnues}`);
    if (!m.tempsOk) faux.push(`${m.code} : temps inconnu ${m.temps}`);
    // Une séance qui déclare une compétence sans temps disparaîtrait du tableau sans bruit.
    if (m.comp && !m.temps) faux.push(`${m.code} : compétence sans temps`);
  });
  if (faux.length) throw new Error(faux.join(' | '));
});

await v('compétences : l\'écran, les coefficients du groupe et l\'export CSV', async () => {
  // Deux notes saisies à la main sur C1.6 : SCE-1 (guidage) 8 et SCE-2 (évaluation) 16.
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('.note-saisie', { timeout: 6000 });
  const saisir = async (code, val) => {
    const sel = `.note-saisie[aria-label^="${code} — DUPONT"]`;
    await page.evaluate(() => { const t = document.getElementById('toast'); if (t) t.textContent = ''; });
    await page.fill(sel, val);
    await page.press(sel, 'Tab');
    await page.waitForFunction((s) => document.querySelector(s)?.classList.contains('enregistre')
      || /enregistrée|effacée/.test(document.getElementById('toast')?.textContent || ''), sel, { timeout: 4000 });
    await page.waitForTimeout(150);
  };
  await saisir('SCE-1', '8');
  await saisir('SCE-2', '16');

  const lire = async () => page.$$eval('#tabComp tbody tr', (lignes) => {
    const l = lignes.find((x) => /DUPONT/.test(x.textContent));
    const o = {};
    l.querySelectorAll('td[data-comp]').forEach((d) => {
      o[d.dataset.comp] = d.textContent.replace(/\s+/g, ' ').trim();
      o[d.dataset.comp + ':titre'] = d.getAttribute('title');
    });
    return o;
  });
  const ouvrir = async () => {
    await page.click('[data-ong="competences"]');
    await page.waitForSelector('#tabComp', { timeout: 6000 });
  };
  await ouvrir();
  const entetes = await page.$$eval('#tabComp thead th', (t) => t.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  if (!entetes.some((t) => /^C1\.6/.test(t))) throw new Error('pas de colonne C1.6 : ' + entetes.join(' | '));
  // (8×1 + 16×3) / 4 = 14 ; deux séances faites sur les sept de C1.6.
  let c = await lire();
  if (!/^14\/20 \(2\/7\)$/.test(c['C1.6'] || '')) throw new Error('C1.6 : ' + c['C1.6'] + ' au lieu de 14/20 (2/7)');
  const titre = c['C1.6:titre'] || '';
  if (!/SCE-2 \(évaluation, coef 3\) : 16 \/ 20/.test(titre) || !/QUI-7 .*pas faite/.test(titre)) {
    throw new Error('détail en infobulle : ' + titre);
  }
  // Le prof passe l'évaluation au coefficient 1 : (8 + 16) / 2 = 12, et le réglage tient.
  await page.fill('.coef-saisie[data-temps="evaluation"]', '1');
  await page.click('#btnCoefs');
  await page.waitForFunction(() => /^12/.test(([...document.querySelectorAll('#tabComp tbody tr')].find((x) => /DUPONT/.test(x.textContent))?.querySelector('td[data-comp="C1.6"]')?.textContent.trim() || '')), null, { timeout: 4000 });
  // Rechargement complet : le coefficient doit venir de la base, pas de la mémoire de l'écran.
  await page.reload();
  await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
  await page.click('#btnProfEspace');
  await ouvrir();
  if ((await page.inputValue('.coef-saisie[data-temps="evaluation"]')) !== '1') throw new Error('coefficient non conservé');
  c = await lire();
  if (!/^12\/20/.test(c['C1.6'])) throw new Error('après coef 1 : ' + c['C1.6']);
  // Un coefficient refusé ne s'enregistre pas.
  await page.fill('.coef-saisie[data-temps="guidage"]', '-2');
  await page.click('#btnCoefs');
  await page.waitForTimeout(300);
  if (!/entre 0 et 10/.test(await page.textContent('#toast'))) throw new Error('coefficient négatif accepté');
  // Retour aux défauts.
  await page.click('#btnCoefsDefaut');
  await page.waitForFunction(() => /^14/.test(([...document.querySelectorAll('#tabComp tbody tr')].find((x) => /DUPONT/.test(x.textContent))?.querySelector('td[data-comp="C1.6"]')?.textContent.trim() || '')), null, { timeout: 4000 });
  if ((await page.inputValue('.coef-saisie[data-temps="evaluation"]')) !== '3') throw new Error('défaut non rétabli');

  // L'export : une ligne par élève et par compétence.
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btnCsvComp')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8').replace(/^﻿/, '');
  const lignes = csv.split('\r\n');
  if (!/^Nom;Prénom;Compétence;Libellé;Séances .*;Séances faites;Moyenne pondérée \/20$/.test(lignes[0])) {
    throw new Error('en-tête : ' + lignes[0]);
  }
  const l16 = lignes.find((l) => /^DUPONT;Léa;C1\.6;/.test(l));
  if (!l16) throw new Error('pas de ligne DUPONT C1.6');
  if (!/;2 sur 7;14$/.test(l16)) throw new Error('ligne C1.6 : ' + l16);
  if (!/SCE-1 \(guidage, coef 1\) : 8 \/ 20/.test(l16)) throw new Error('détail SCE-1 absent : ' + l16);
  const nbComp = (await page.$$('#tabComp thead th')).length - 1;
  const nbEl = (await page.$$('#tabComp tbody tr')).length;
  if (lignes.length - 1 !== nbComp * nbEl) throw new Error(`${lignes.length - 1} lignes au lieu de ${nbComp}×${nbEl}`);

  // Le suivi par séance n'a pas bougé : les notes saisies restent sur leur barème.
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('.note-saisie');
  if ((await page.inputValue('.note-saisie[aria-label^="SCE-1 — DUPONT"]')) !== '8') throw new Error('SCE-1 changé dans le suivi');
  // On remet le groupe comme on l'a trouvé.
  await saisir('SCE-1', '');
  await saisir('SCE-2', '');
});

await v('suivi : mettre 0 à un élève présent qui n\'a rien fait, l\'effacer, le voir remplacé', async () => {
  const BTN = '.btn-zero[aria-label="Mettre 0 — QUI-7 — DUPONT Léa"]';
  const EFF = '.btn-zero-eff[aria-label="Effacer le 0 — QUI-7 — DUPONT Léa"]';
  const celluleQui7 = () => page.$eval(`th[title^="Calculs de stock"]`, (th) => {
    const i = [...th.parentNode.children].indexOf(th);
    const l = [...document.querySelectorAll('#contenuProf tbody tr')].find((x) => /DUPONT/.test(x.textContent));
    return l.children[i].textContent.replace(/\s+/g, ' ').trim();
  });
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector(BTN, { timeout: 6000 });
  if ((await celluleQui7()) !== '—') throw new Error('case vide attendue : ' + await celluleQui7());
  await page.click(BTN);
  await page.waitForSelector(EFF, { timeout: 4000 });
  if (!/^0\/20 posé ×$/.test(await celluleQui7())) throw new Error('après 0 : ' + await celluleQui7());
  // Le 0 compte dans la moyenne par compétence (une séance pas faite, elle, ne compte pas).
  await page.click('[data-ong="competences"]');
  await page.waitForSelector('#tabComp');
  const c16 = await page.$$eval('#tabComp tbody tr', (lignes) => lignes.find((x) => /DUPONT/.test(x.textContent))
    .querySelector('td[data-comp="C1.6"]')?.textContent.replace(/\s+/g, ' ').trim());
  if (c16 !== '0/20 (1/7)') throw new Error('C1.6 avec le 0 : ' + c16);
  // La croix efface le 0 : retour au tiret.
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector(EFF);
  await page.click(EFF);
  await page.waitForSelector(BTN, { timeout: 4000 });
  // Rattrapage : l'élève fait la séance après coup, sa vraie note remplace le 0.
  await page.click(BTN);
  await page.waitForSelector(EFF);
  const ids = await page.evaluate(async () => {
    const k = Object.keys(localStorage).find((x) => /travaux\/[^/]+\/[^/]+\/calculs-stock$/.test(x));
    const [, gid, uid] = k.match(/travaux\/([^/]+)\/([^/]+)\/calculs-stock$/);
    const { B } = await import('/core/backend.js');
    await B.ecrireScore(gid, uid, 'calculs-stock', { score: 6, max: 8 });
    return { gid, uid };
  });
  await page.click('[data-ong="competences"]');
  await page.waitForSelector('#tabComp');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('#contenuProf tbody tr');
  if (!/^15\/20/.test(await celluleQui7()) || /posé/.test(await celluleQui7())) {
    throw new Error('après rattrapage : ' + await celluleQui7());
  }
  // On remet le groupe comme on l'a trouvé.
  await page.evaluate(async ({ gid, uid }) => {
    const { B } = await import('/core/backend.js');
    await B.poserNote(gid, uid, 'calculs-stock', null);
  }, ids);
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
  // Parcours strict (02/10/2026) : ENT-1.2 et ENT-1.3 ne s'ouvrent qu'après validation de la séance
  // précédente. Ces cas-ci testent le CONTENU des séances, pas l'ordre (c'est `test-seances.mjs`) :
  // on pose donc, comme le ferait le bouton « Débloquer » de l'enseignant, les deux drapeaux.
  await page.evaluate(() => {
    let uid = localStorage.getItem('prepalog:session');
    try { uid = JSON.parse(uid); } catch (e) { /* déjà une chaîne */ }
    ['spartoo', 'spartoo-tracabilite'].forEach((aid) => {
      localStorage.setItem(`prepalog:travaux/1-log-a/${uid}/_debloque-${aid}`,
        JSON.stringify({ uid, aid: '_debloque-' + aid, gid: '1-log-a', score: 0, max: 0, meilleur: 0, tentatives: 0 }));
    });
  });
  // La rubrique Logisim porte désormais une tuile par SÉANCE de l'entreprise : réception,
  // préparation. On ouvre ici la préparation ; la réception est testée plus bas.
  await page.click('[data-rub="logisim"]');
  await page.waitForSelector('[data-act="spartoo"]', { timeout: 6000 });
  await page.click('[data-act="spartoo"]');
  await page.waitForSelector('.ent-shell', { timeout: 6000 });
  if ((await page.$$eval('.ent-nav', (e) => e.length)) < 8) throw new Error('navigation incomplète');
  await page.click('[data-vue="mail"]');
  await page.waitForSelector('.ent-mitem');
  if ((await page.$$eval('.ent-mitem', (e) => e.length)) !== 2) throw new Error('les 2 messages de la préparation manquent (la bienvenue arrive en ENT-1.1)');
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

// ---------- 26 quater. tout corrigé déclaré existe et reste cohérent
// Statique, comme le test des trames. Un QCM de trame doit avoir trois choix et une bonne
// réponse valide : le générateur Python l'assure, ce test garde le fichier produit.
await v('tout corrigé de trame déclaré existe, couvre toute la trame et est cohérent', async () => {
  const problemes = [];
  let total = 0, qcm = 0;
  for (const e of fs.readdirSync(path.join(ROOT, 'activites'))) {
    if (!/\.js$/.test(e)) continue;
    const src = fs.readFileSync(path.join(ROOT, 'activites', e), 'utf8');
    for (const m of src.matchAll(/corrige:\s*'(\.\/contenus\/corriges\/[^']+)'/g)) {
      const cible = path.join(ROOT, m[1].replace(/^\.\//, ''));
      if (!fs.existsSync(cible)) { problemes.push(`${e} → ${m[1]} absent`); continue; }
      const { CORRIGE } = await import(pathToFileURL(cible).href);
      if (!CORRIGE?.items?.length) problemes.push(`${m[1]} vide`);
      for (const it of CORRIGE.items) {
        total++;
        const nom = `${m[1]} : « ${String(it.texte).slice(0, 40)} »`;
        if (!it.texte || !it.genre) { problemes.push(`${nom} sans texte ni genre`); continue; }
        if (it.genre === 'qcm') {
          qcm++;
          if (it.choix?.length !== 3 || !(it.bonne >= 0 && it.bonne < 3)) problemes.push(`${nom} QCM invalide`);
        } else if (it.genre === 'tableau') {
          if (!it.entetes?.length || !it.reponses?.length || it.reponses.some((l) => l.length !== it.entetes.length)) problemes.push(`${nom} tableau invalide`);
        } else if (it.genre === 'brouillon') {
          if (!it.modele && !it.criteres) problemes.push(`${nom} sans modèle`);
        } else if (!it.rep && !(it.pistes?.length)) {
          problemes.push(`${nom} sans réponse`);
        }
      }
    }
  }
  if (problemes.length) throw new Error(problemes.join(' ; '));
  if (qcm < 14) throw new Error(`seulement ${qcm} QCM corrigés (14 attendus : ils ne doivent pas diminuer)`);
  if (total < 140) throw new Error(`seulement ${total} questions corrigées (au moins 140 attendues : toute la trame doit être couverte)`);
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
  // Séance fermée à qui n'a pas validé la 1.2 : l'enseignant la débloque (voir test-seances.mjs).
  await page.evaluate(() => {
    let uid = localStorage.getItem('prepalog:session');
    try { uid = JSON.parse(uid); } catch (e) { /* déjà une chaîne */ }
    localStorage.setItem(`prepalog:travaux/1-log-a/${uid}/_debloque-spartoo-tracabilite`,
      JSON.stringify({ uid, aid: '_debloque-spartoo-tracabilite', gid: '1-log-a', score: 0, max: 0, meilleur: 0, tentatives: 0 }));
  });
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

await v('bandeau : trames et mode hors connexion tiennent ensemble, dans l’ordre', async () => {
  // ENT-3.1 n'a pas encore de trame élève, mais elle en aura une comme les trois Spartoo, et le
  // bandeau portera alors QUATRE actions. Ce cas monte une séance qui déclare les deux trames ET
  // un plan, pour garder dès maintenant qu'elles cohabitent et dans quel ordre : remise à zéro,
  // les deux trames (elles vont par paire), puis le réglage de poste, puis Quitter.
  const ordre = await pageTr.evaluate(async () => {
    const m = await import('/core/types/entreprise.js');
    const P = window.__tr.PLAN;
    const hote = document.createElement('div');
    hote.id = 'essaiBandeau';
    document.body.appendChild(hote);
    const CAT = { MODELS: [], MM: {}, VARIANTS: [], VM: {} };
    const act = m.creerEntreprise({
      ENTREPRISE: { nom: 'Essai Bandeau', sousTitre: 'essai' },
      VOCAB: { unit: 'piece', unitPl: 'pieces', sizeLabel: 'Taille' },
      CATALOGUE: CAT, SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {},
      baseDeDepart: () => ({ v: 1, seq: 1, stock: {}, mails: [], orders: [], receptions: [],
        moves: [], customers: [], suppliers: [], _depart: [] }),
      THEME: {}, etapes: [], plan: P,
      trame: { pdf: './x.pdf', docx: './x.docx' },
    });
    act.rendre(hote, {
      meta: { id: 'essBandeau', portee: 'eleve', code: 'ESS-1', titre: 'Essai bandeau', reinitialisable: true },
      profil: { prenom: 'Lea', role: 'eleve' },
      jeu: { etat: () => ({}), sauver: () => {} },
      enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    });
    const b = hote.querySelector('.ent-bandeau');
    return {
      actions: [...b.querySelectorAll('.ent-act, .ent-sortie')].map((e) => e.textContent.trim()),
      // Le libellé du mode hors connexion vient du CONTENU (`reperage.secours`), pas du noyau :
      // un scénario sans carte en ligne peut l'appeler autrement.
      libelleDeclare: P.reperage.secours,
      // Le bandeau se replie sur deux lignes au lieu de déborder (`flex-wrap`), donc ce qu'on
      // garde, c'est qu'il ne déborde PAS en largeur — sinon des boutons sortiraient de l'écran.
      deborde: b.scrollWidth > b.clientWidth + 1,
    };
  });
  const attendu = ['Réinitialiser', 'Trame PDF', 'Trame Word', ordre.libelleDeclare, 'Quitter'];
  if (ordre.actions.join(' · ') !== attendu.join(' · ')) {
    throw new Error('bandeau : ' + ordre.actions.join(' · '));
  }
  if (ordre.deborde) throw new Error('le bandeau déborde en largeur : des boutons sortent de l’écran');
});

// Remise à zéro de la base : réservée aux séances X.1 (décision du 02/10/2026). Une séance X.2 ou
// X.3 reprend le travail de la précédente : un élève absent commence la séance manquée à son
// étape 1, sans sauter d'étape, et ne repart jamais de zéro. Le noyau ne dessine le bouton que si `meta.reinitialisable` est vrai ;
// ce cas garde que seules les activités dont le code finit par « .1 » le déclarent.
await v('remise à zéro de la base : seulement en séance X.1', async () => {
  const problemes = [];
  let n = 0;
  for (const e of fs.readdirSync(path.join(ROOT, 'activites'))) {
    if (!/\.js$/.test(e) || e === 'index.js') continue;
    const src = fs.readFileSync(path.join(ROOT, 'activites', e), 'utf8');
    const code = /code:\s*'(ENT-[\d.]+)'/.exec(src)?.[1];
    if (!code) continue;
    n++;
    const dit = /reinitialisable:\s*true/.test(src);
    if (dit !== /\.1$/.test(code)) problemes.push(`${e} (${code}) : reinitialisable ${dit ? 'vrai' : 'absent'}`);
  }
  if (n < 4) throw new Error(`seulement ${n} séances ENT lues`);
  if (problemes.length) throw new Error(problemes.join(' ; '));
});

await v('vue plan : le mode hors connexion est dans le bandeau, pas dans la vue', async () => {
  // Déplacé le 03/10/2026. Sous la carte, à portée de souris et au milieu du travail, ce bouton
  // se lisait comme une aide à l'exercice : « la majorité des élèves va juste cliquer dessus
  // pour avoir les réponses » (Tristan). Dans le bandeau, à côté de « Réinitialiser », il se lit
  // comme un réglage de poste. Ce cas garde les DEUX moitiés du déménagement.
  if (await pageTr.$$eval('#essaiTr .ent-main [data-plan-secours]', (e) => e.length)) {
    throw new Error('le mode hors connexion est redescendu dans la vue plan');
  }
  const bandeau = await pageTr.$$eval('#essaiTr .ent-bandeau [data-hors-connexion]', (e) => e.length);
  if (bandeau !== 1) throw new Error(bandeau + ' bouton(s) « hors connexion » dans le bandeau');
  await pageTr.click('#essaiTr [data-hors-connexion]');
  await pageTr.waitForTimeout(140);
  // Une fois activé, il ne se reclique pas : le recours est horodaté une fois pour toutes.
  if (!(await pageTr.$eval('#essaiTr [data-hors-connexion]', (e) => e.disabled))) {
    throw new Error('le mode hors connexion reste cliquable après coup');
  }
  const zones = await pageTr.$$eval('#essaiTr .plan-zone', (e) => e.map((x) => x.textContent.trim()));
  if (zones.filter((z) => /Quartier/.test(z)).length !== 4) throw new Error('les quartiers ne sont pas révélés');
  const cases = await pageTr.$$eval('#essaiTr .plan-case', (e) => e.map((x) => x.value));
  if (cases.join('|') !== 'B1|C1|A1|C2') throw new Error('les cases saisies ont bougé : ' + cases.join('|'));
  const t = await texteTr();
  if (!/reste à lire sur le plan/.test(t)) throw new Error('le mode hors connexion ne dit pas ce qu\'il ne donne pas');
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

/* ===================================================================================== */
/* La carte cliquable et les deux encres — écrites le 04/10/2026.                        */
/*                                                                                       */
/* Deux chantiers en un. Tristan, le 03/10 au soir : *« tout est laborieux, on pourrait   */
/* repartir sur une carte cliquable beaucoup plus intuitive ? »*, et, une heure plus tôt, */
/* *« le numéro en rond bleu qui indique la position sur la carte, il indique aussi la    */
/* position dans la liste, ça porte à confusion »*. Le second est absorbé par le premier :  */
/* dès qu'on construit la tournée sur la carte, distinguer le client de son rang n'est    */
/* plus cosmétique, c'est la condition pour savoir sur quoi on clique.                    */
/* ===================================================================================== */

// L'ordre et le quai posés à la main, puis un aller-retour de vue pour redessiner. C'est le
// même procédé que pour ENT-3.1 : on fixe l'état, et on mesure ce que la vue en fait.
const poserTr = async (ordre, quai) => {
  await pageTr.evaluate((o) => {
    const t = window.__tr.avec.db.transport.ess1.tournee;
    t.ordre = o.ordre; t.quai = o.quai; t.juge = {}; t.bloque = null;
  }, { ordre, quai });
  await ouvrir('plan');
  await ouvrir('tournee');
};
// Ce que la carte porte vraiment, point par point : le chiffre du rond, celui de la pastille,
// et l'état creux. C'est la seule lecture qui vaille — le reste est dans l'état, pas à l'écran.
const lireCarte = () => pageTr.$$eval('#essaiTr .plan-svg .plan-pt', (gs) => gs.map((g) => ({
  id: g.dataset.point,
  rond: g.querySelector('text').textContent.trim(),
  ordre: g.querySelector('.plan-pt-ordre text')
    ? g.querySelector('.plan-pt-ordre text').textContent.trim() : null,
  quai: g.classList.contains('plan-pt-quai'),
})));

await v('carte cliquable : un clic ajoute l’arrêt À LA FIN de la tournée', async () => {
  // La règle la plus simple à expliquer à une classe : on clique, ça se met au bout. Pas de
  // discussion sur l'endroit où l'arrêt se glisse — les flèches servent à ça ensuite.
  await poserTr(['p1', 'p2'], ['p3', 'p4']);
  let e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee);
  if (e.ordre.join(',') !== 'p1,p2') throw new Error('état de départ : ' + e.ordre.join(','));

  await pageTr.click('#essaiTr [data-clic-point="p4"]');
  await pageTr.waitForTimeout(120);
  e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee);
  if (e.ordre.join(',') !== 'p1,p2,p4') throw new Error('p4 n’est pas ajouté à la fin : ' + e.ordre.join(','));
  if (e.quai.join(',') !== 'p3') throw new Error('le quai n’a pas lâché p4 : ' + e.quai.join(','));

  // Et le second clic se met APRÈS le premier, pas ailleurs.
  await pageTr.click('#essaiTr [data-clic-point="p3"]');
  await pageTr.waitForTimeout(120);
  e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee);
  if (e.ordre.join(',') !== 'p1,p2,p4,p3') throw new Error('ordre après deux clics : ' + e.ordre.join(','));
  if (e.quai.length) throw new Error('le quai n’est pas vide : ' + e.quai.join(','));
  // Le tracé du plan suit : départ (50,50) → p1 (150,50) → p2 (250,50) → p4 (250,150) → p3…
  const trace = await pageTr.getAttribute('#essaiTr .plan-trace', 'points');
  if (!trace.startsWith('50,50 150,50 250,50 250,150 150,150')) throw new Error('tracé : ' + trace);
});

await v('carte cliquable : un clic sur un arrêt chargé le retire, et les suivants se renumérotent', async () => {
  await poserTr(['p1', 'p2', 'p4', 'p3'], []);
  await pageTr.click('#essaiTr [data-clic-point="p2"]');
  await pageTr.waitForTimeout(120);
  const e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee);
  if (e.ordre.join(',') !== 'p1,p4,p3') throw new Error('p2 n’est pas retiré : ' + e.ordre.join(','));
  if (e.quai.join(',') !== 'p2') throw new Error('p2 n’est pas au quai : ' + e.quai.join(','));
  // La renumérotation est le point sensible : p4 était 3ᵉ, il devient 2ᵉ.
  const c = await lireCarte();
  const par = Object.fromEntries(c.map((x) => [x.id, x]));
  if (par.p1.ordre !== '1' || par.p4.ordre !== '2' || par.p3.ordre !== '3') {
    throw new Error('ordre mal renuméroté : ' + JSON.stringify(c));
  }
  if (par.p2.ordre !== null) throw new Error('un arrêt retiré garde sa pastille d’ordre');
});

await v('carte cliquable : deux encres, deux sens — le rond dit le client, la pastille dit le rang', async () => {
  // Le défaut d'origine, reproduit exactement : trois arrêts chargés dont le QUATRIÈME client
  // en troisième position, et le troisième client resté à quai. Avant la correction, le rond
  // de p4 affichait « 3 » (son rang) et celui de p3 affichait « 3 » (son numéro) : deux « 3 »
  // sur la même carte, pour deux choses différentes.
  await poserTr(['p1', 'p2', 'p4'], ['p3']);
  const c = await lireCarte();
  const par = Object.fromEntries(c.map((x) => [x.id, x]));

  // Le rond : le numéro du client, le même partout, et il ne bouge jamais.
  if (c.map((x) => x.rond).join(',') !== '1,2,3,4') {
    throw new Error('les ronds ne portent pas les numéros des clients : ' + JSON.stringify(c));
  }
  // Deux ronds ne peuvent pas porter le même chiffre : c'est la confusion d'origine.
  const ronds = c.map((x) => x.rond);
  if (new Set(ronds).size !== ronds.length) throw new Error('deux ronds portent le même numéro : ' + ronds.join(','));

  // La pastille : le rang, et seulement pour ce qui est chargé.
  if (par.p4.ordre !== '3') throw new Error('p4 devrait être le 3ᵉ arrêt : ' + par.p4.ordre);
  if (par.p4.rond !== '4') throw new Error('le rond de p4 devrait rester le client 4 : ' + par.p4.rond);
  if (par.p3.ordre !== null) throw new Error('un arrêt à quai porte une pastille d’ordre');
  if (!par.p3.quai) throw new Error('l’arrêt resté à quai n’est pas dessiné en creux');
  if (par.p1.quai || par.p2.quai || par.p4.quai) throw new Error('un arrêt chargé est dessiné en creux');

  // Et la légende dit laquelle est laquelle, sinon deux numérotations sur un plan sont pires
  // qu'une seule fausse.
  const leg = await pageTr.$$eval('#essaiTr .plan-legende span', (e) => e.map((x) => x.textContent.trim()).join(' | '));
  if (!/numéro du client/.test(leg)) throw new Error('la légende ne nomme pas le rond : ' + leg);
  if (!/ordre de passage/.test(leg)) throw new Error('la légende ne nomme pas la pastille : ' + leg);
  if (!/resté à quai/.test(leg)) throw new Error('la légende ne nomme pas le rond creux : ' + leg);

  // La liste porte les deux aussi : la pastille de rang à gauche, le numéro du client devant
  // le nom — « 4 · Client Quatre ».
  const lignes = await pageTr.$$eval('#essaiTr #tourListe .tour-item', (ls) => ls.map((l) => ({
    rang: l.querySelector('.tour-rang').textContent.trim(),
    num: l.querySelector('.tour-num').textContent.trim(),
    nom: l.querySelector('strong').textContent.trim(),
  })));
  if (lignes.length !== 3) throw new Error(lignes.length + ' ligne(s) au récapitulatif');
  if (lignes[2].rang !== '3' || lignes[2].num !== '4 ·' || lignes[2].nom !== 'Client Quatre') {
    throw new Error('la 3ᵉ ligne ne porte pas les deux numéros : ' + JSON.stringify(lignes[2]));
  }
});

await v('carte cliquable : la cible de clic est plus grande que le rond, et les noms ne la volent pas', async () => {
  // Au vidéoprojecteur comme à la souris, viser un disque de douze pixels est pénible. Et une
  // étiquette qui attrape le clic est la première source de clics perdus : l'élève vise
  // « Client Un », il touche le texte, rien ne se passe, il recommence.
  const g = await pageTr.evaluate(() => {
    const pt = document.querySelector('#essaiTr .plan-svg .plan-pt');
    const cible = pt.querySelector('.plan-pt-cible');
    const etiq = [...document.querySelectorAll('#essaiTr .plan-svg .plan-pt text')]
      .filter((t) => /Client/.test(t.textContent));
    return {
      rRond: +pt.querySelector('circle').getAttribute('r'),
      rCible: +cible.getAttribute('r'),
      dernier: pt.lastElementChild === cible || pt.children[pt.children.length - 1] === cible,
      role: cible.getAttribute('role'),
      tab: cible.getAttribute('tabindex'),
      aria: cible.getAttribute('aria-label'),
      etiqNeutres: etiq.length > 0 && etiq.every((t) => getComputedStyle(t).pointerEvents === 'none'),
      pastillesNeutres: [...document.querySelectorAll('#essaiTr .plan-pt-ordre')]
        .every((o) => getComputedStyle(o).pointerEvents === 'none'),
    };
  });
  if (g.rCible <= g.rRond) throw new Error(`cible r=${g.rCible} pour un rond r=${g.rRond}`);
  if (g.rCible < 18) throw new Error('cible de clic trop petite : r=' + g.rCible);
  if (!g.dernier) throw new Error('la cible n’est pas posée en dernier : elle passerait sous le reste');
  if (g.role !== 'button' || g.tab !== '0') throw new Error('la cible n’est pas un bouton atteignable : ' + g.role + '/' + g.tab);
  if (!/Client Un/.test(g.aria || '')) throw new Error('la cible ne dit pas ce qu’elle fait : ' + g.aria);
  if (!g.etiqNeutres) throw new Error('les noms des points attrapent le clic');
  if (!g.pastillesNeutres) throw new Error('la pastille d’ordre attrape le clic');
});

await v('carte cliquable : Entrée ajoute et retire, et le focus revient sur le point cliqué', async () => {
  // Chaque point est un bouton : au clavier, Entrée doit faire ce que fait la souris. Le piège
  // est le redessin — il détruit l'élément qui avait le focus, et sans report l'élève est
  // renvoyé en haut de page : son premier Entrée marchait, le second ne faisait plus rien.
  // Trouvé en pilotant l'écran, pas par une relecture.
  await poserTr(['p1', 'p2'], ['p3', 'p4']);
  await pageTr.focus('#essaiTr [data-clic-point="p3"]');
  await pageTr.keyboard.press('Enter');
  await pageTr.waitForTimeout(140);
  let e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee.ordre.join(','));
  if (e !== 'p1,p2,p3') throw new Error('Entrée n’ajoute pas : ' + e);
  const garde = await pageTr.evaluate(() => {
    const a = document.activeElement;
    return a ? a.getAttribute('data-clic-point') : null;
  });
  if (garde !== 'p3') throw new Error('le focus est perdu après le redessin : ' + garde);
  // Le second Entrée, celui qui ne faisait rien.
  await pageTr.keyboard.press('Enter');
  await pageTr.waitForTimeout(140);
  e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee.ordre.join(','));
  if (e !== 'p1,p2') throw new Error('le second Entrée ne retire pas : ' + e);
});

/* ===================================================================================== */
/* L'évaluateur de formules — écrit le 04/10/2026.                                       */
/*                                                                                       */
/* Tristan : *« il doit disposer d'un petit espace tableur intégré où il doit saisir la   */
/* formule pour trouver le temps »*. C'est le morceau du projet où une erreur se voit le  */
/* moins : une formule qui rend un nombre faux ne lève rien, elle ment. Les valeurs       */
/* attendues sont donc ÉCRITES À LA MAIN ici — c'est la règle du projet pour un test, et  */
/* c'est l'inverse de celle d'un générateur.                                              */
/* ===================================================================================== */

await v('formules : les quatre opérations, les priorités, et la virgule française', async () => {
  const r = await pageTr.evaluate(async () => {
    const F = await import('/core/formules.js');
    const v = (c) => F.evaluerGrille(c);
    return {
      nb: [F.nombreFr('12,5'), F.nombreFr('12.5'), F.nombreFr('1 234,5'), F.nombreFr('abc'), F.nombreFr('')],
      calc: ['=2+3*4', '=(2+3)*4', '=2^3^2', '=-3+10', '=10/4', '=12,5+0,5']
        .map((f) => v({ A1: f }).valeurs.A1),
    };
  });
  // La virgule décimale est la frappe d'un élève sur un poste français. Le point est accepté
  // aussi : personne ne doit être puni pour avoir tapé 12.5.
  if (r.nb.join('|') !== '12.5|12.5|1234.5||') throw new Error('lecture des nombres : ' + JSON.stringify(r.nb));
  // 2^3^2 vaut 512 et non 64 : la puissance est associative à DROITE, comme dans Excel.
  if (r.calc.join('|') !== '14|20|512|7|2.5|13') throw new Error('calculs : ' + JSON.stringify(r.calc));
});

await v('formules : SOMME, MOYENNE, MIN, MAX, ARRONDI et les plages', async () => {
  const r = await pageTr.evaluate(async () => {
    const F = await import('/core/formules.js');
    const poids = { B2: '31', B3: '24', B4: '42', B5: '19', B6: '36', B7: '27' };
    return {
      // Les six commandes d'ENT-3.1, et leur somme : 31+24+42+19+36+27.
      somme: F.evaluerGrille(Object.assign({ B8: '=SOMME(B2:B7)' }, poids)).valeurs.B8,
      plage: F.cellulesDePlage('B2', 'B7').join(','),
      envers: F.cellulesDePlage('B7', 'B2').join(','),
      autres: F.evaluerGrille({
        B2: '4', B3: '6',
        A1: '=SOMME(B2:B3;10)', A2: '=MOYENNE(2;4;9)', A3: '=MAX(1;7;3)',
        A4: '=MIN(1;7;3)', A5: '=ARRONDI(12,345;2)', A6: '=ARRONDI(12,5)',
      }).valeurs,
      // Une cellule vide vaut zéro dans une addition, mais ne compte pas dans une moyenne —
      // sinon une plage un peu large fausserait le résultat sans que personne le voie.
      vide: F.evaluerGrille({ B2: '4', B3: '', B4: '6', A1: '=B2+B3', A2: '=MOYENNE(B2:B4)' }).valeurs,
    };
  });
  if (r.somme !== 179) throw new Error('SOMME(B2:B7) = ' + r.somme + ' au lieu de 179');
  if (r.plage !== 'B2,B3,B4,B5,B6,B7') throw new Error('plage : ' + r.plage);
  if (r.envers !== 'B2,B3,B4,B5,B6,B7') throw new Error('plage à l’envers non remise à l’endroit : ' + r.envers);
  const a = r.autres;
  if (a.A1 !== 20 || a.A2 !== 5 || a.A3 !== 7 || a.A4 !== 1 || a.A5 !== 12.35 || a.A6 !== 13) {
    throw new Error('fonctions : ' + JSON.stringify(a));
  }
  if (r.vide.A1 !== 4 || r.vide.A2 !== 5) throw new Error('cellules vides : ' + JSON.stringify(r.vide));
});

await v('formules : une formule fausse rend une erreur lisible, jamais un nombre faux', async () => {
  // C'est le vrai danger de ce fichier. Un analyseur trop permissif qui lirait « =2+ » comme 2
  // donnerait un résultat plausible à un élève qui s'est trompé, et personne ne le verrait.
  const r = await pageTr.evaluate(async () => {
    const F = await import('/core/formules.js');
    const code = (f) => { const x = F.evaluerGrille({ A1: f }); return x.erreurs.A1 || ('valeur ' + x.valeurs.A1); };
    return {
      nom: [code('=SOMM(1;2)'), code('=SI(1;2;3)')],
      div: [code('=10/0'), F.evaluerGrille({ B2: '0', A1: '=5/B2' }).erreurs.A1],
      malEcrites: ['=2+', '=(2+3', '=2 3', '=*5', '=SOMME(1;2', '=B2:B7+1', '=SOMME 1'].map(code),
      // Une formule qui se mord la queue doit dire pourquoi, pas faire déborder la pile du
      // navigateur — ce qui emporterait la page entière et l'heure de cours avec.
      circ: [F.evaluerGrille({ A1: '=A2', A2: '=A1' }).erreurs.A1, code('=A1+1')],
      // Un libellé texte dans une cellule n'est pas une erreur : une grille en est pleine.
      libelle: F.evaluerGrille({ A1: 'Poids total', B1: '=SOMME(B2:B3)', B2: '1', B3: '2' }),
    };
  });
  if (r.nom.join('|') !== '#NOM?|#NOM?') throw new Error('fonction inconnue : ' + JSON.stringify(r.nom));
  if (r.div.join('|') !== '#DIV/0!|#DIV/0!') throw new Error('division par zéro : ' + JSON.stringify(r.div));
  const acceptees = r.malEcrites.filter((x) => x.startsWith('valeur'));
  if (acceptees.length) throw new Error('formule(s) mal écrite(s) acceptée(s) : ' + JSON.stringify(r.malEcrites));
  if (!r.circ.every((x) => /^#/.test(String(x)))) throw new Error('référence circulaire : ' + JSON.stringify(r.circ));
  if (r.libelle.erreurs.A1) throw new Error('un libellé texte est compté comme une erreur');
  if (r.libelle.valeurs.B1 !== 3) throw new Error('somme à côté d’un libellé : ' + r.libelle.valeurs.B1);
});

await v('carte cliquable : rien de tout cela n’existe sans plan ni sans ordre de passage', async () => {
  // Règle du noyau : une vue ne gagne une capacité que si le contenu la déclare. Une séance
  // où le transport n'est qu'une contrainte de charge n'a pas de carte, donc pas de clic ; et
  // l'écran de repérage, lui, a une carte mais aucun ordre de passage — il doit rester
  // exactement celui d'avant, sans pastille, sans rond creux et sans cible de clic.
  const sansCarte = await pageTr.$$eval('#essaiSansPlan [data-clic-point]', (e) => e.length);
  if (sansCarte) throw new Error('une séance sans plan a des cibles de clic');

  await ouvrir('plan');
  const r = await pageTr.evaluate(() => ({
    cibles: document.querySelectorAll('#essaiTr .plan-svg .plan-pt-cible').length,
    pastilles: document.querySelectorAll('#essaiTr .plan-svg .plan-pt-ordre').length,
    creux: document.querySelectorAll('#essaiTr .plan-svg .plan-pt-quai').length,
    ronds: [...document.querySelectorAll('#essaiTr .plan-svg .plan-pt')]
      .map((g) => g.querySelector('text').textContent.trim()).join(','),
    leg: [...document.querySelectorAll('#essaiTr .plan-legende span')].map((x) => x.textContent).join(' | '),
  }));
  if (r.cibles || r.pastilles || r.creux) throw new Error('l’écran de repérage a gagné la carte cliquable : ' + JSON.stringify(r));
  if (r.ronds !== '1,2,3,4') throw new Error('les numéros de clients du repérage ont bougé : ' + r.ronds);
  if (/ordre de passage/.test(r.leg)) throw new Error('la légende parle d’un ordre de passage inexistant');
  await ouvrir('tournee');

  // Et une séance qui ne déclare PAS `extremitesACliquer` garde ses deux bouts comme avant :
  // dessinés pleins, comptés dans le trajet, et sans rien à cliquer. Règle du noyau — une vue
  // ne gagne une capacité que si le contenu la demande.
  const bouts = await pageTr.evaluate(() => ({
    cibles: document.querySelectorAll('#essaiTr [data-clic-extremite]').length,
    boutons: document.querySelectorAll('#essaiTr [data-bout]').length,
    creux: document.querySelectorAll('#essaiTr .plan-bout-vide').length,
    trace: document.querySelector('#essaiTr .plan-trace').getAttribute('points'),
  }));
  if (bouts.cibles || bouts.boutons) throw new Error('une séance sans extrémités à cliquer en a gagné');
  if (bouts.creux) throw new Error('un bout est dessiné en creux sans que la séance le demande');
  // Le dépôt d'essai est en (50,50) et la gare en (350,150) : le tracé doit toujours les
  // porter, sans que personne ait eu à les poser.
  if (!bouts.trace.startsWith('50,50')) throw new Error('le tracé ne part plus du dépôt : ' + bouts.trace);
  if (!bouts.trace.endsWith('350,150')) throw new Error('le tracé ne finit plus à la gare : ' + bouts.trace);
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


/* ===================================================================================== */
/* ENT-3.1 — Boost, la tournée du vélo-cargo (lot 2 : le CONTENU)                         */
/*                                                                                        */
/* Les dix-sept cas précédents gardent les deux vues du noyau sur un scénario d'essai.    */
/* Ceux-ci gardent le CONTENU de la séance : les sept adresses, les cases recalculées, le  */
/* calibrage (une seule combinaison de clients possible), le parcours complet d'un élève   */
/* qui réussit, et les cinq jalons — y compris ce qu'ils disent AVANT que l'élève ait      */
/* commencé, parce qu'un jalon qui annonce « à corriger » à l'ouverture ferait croire à    */
/* une faute là où il n'y a rien.                                                         */
/*                                                                                        */
/* On passe par l'activité réelle (`activites/boost-tournee.js`), pas par un montage à la  */
/* main : c'est la déclaration de la séance autant que ses chiffres qu'on veut garder.    */
/* ===================================================================================== */

const ctxBo = await nav.newContext();
const pageBo = await ctxBo.newPage();
pageBo.setDefaultTimeout(8000);
const erreursBo = [];
pageBo.on('pageerror', (e) => erreursBo.push('PAGEERROR: ' + e.message));
pageBo.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursBo.push('CONSOLE: ' + m.text()); });
await pageBo.goto('http://127.0.0.1:8099/');
await pageBo.waitForSelector('#btnProf', { timeout: 8000 });

await pageBo.evaluate(async () => {
  const act = await import('/activites/boost-tournee.js');
  const hote = document.createElement('div');
  hote.id = 'boost31';
  document.body.appendChild(hote);
  const db = {};
  const suivi = [];
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => suivi.push(r),
    quitter: () => {}, codeStock: 'ABC',
  });
  window.__bo = { act, db, suivi, hote };
});

const zBo = '#boost31 .ent-main';
const ouvrirBo = async (vue) => {
  await pageBo.click(`#boost31 .ent-nav[data-vue="${vue}"]`);
  await pageBo.waitForTimeout(140);
};
// L'état de la séance, lu dans la base de l'élève. La clé est `transportId`, pas l'identifiant
// de l'activité : c'est elle que les jalons du contenu interrogent.
const etatBo = (vue) => pageBo.evaluate((v) => {
  const t = window.__bo.db.transport && window.__bo.db.transport['boost-ent31'];
  return t ? JSON.parse(JSON.stringify(t[v] || {})) : null;
}, vue);
const dernierSuivi = () => pageBo.evaluate(() => {
  const s = window.__bo.suivi;
  return s.length ? JSON.parse(JSON.stringify(s[s.length - 1])) : null;
});
// Les modèles HTML coupent leurs phrases sur plusieurs lignes : « manqué\n de 9 min ». Une
// assertion écrite d'un trait ne les retrouve pas. Trois fois le piège sur ce projet, d'où ce
// lecteur qui écrase les blancs.
const texteBo = async (sel) => (await pageBo.textContent(sel || zBo)).replace(/\s+/g, ' ').trim();
// Les jalons, interrogés DIRECTEMENT sur le contenu. Le moteur, lui, ne les remonte au suivi
// qu'au moment où il sauve : un test qui pose un état dans la base puis lit `ctx.enregistrer`
// relirait l'état précédent et se tromperait de verdict.
// Le bilan calculé par le NOYAU pour l'état courant, sans passer par l'écran.
//
// Nécessaire depuis le 04/10 : les jauges ne disent plus le poids total ni l'heure de retour,
// c'est tout l'objet de la feuille de calcul. Les chiffres de calibrage — 179 kg, 16 h 19,
// 15 h 10 — ne sont donc plus à l'écran, et les vérifier à la source est de toute façon plus
// juste : on mesure le modèle, pas sa mise en page.
const bilanBo = () => pageBo.evaluate(async () => {
  const S = await import('/contenus/boost-tournee.js');
  const { creerTournee } = await import('/core/types/tournee.js');
  const vue = creerTournee(Object.assign({ plan: S.PLAN }, S.TOURNEE));
  const t = window.__bo.db.transport['boost-ent31'].tournee;
  const b = vue.bilan(Object.assign({ ordre: [], quai: [], report: {}, juge: {} }, t));
  const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')} h ${String(Math.round(m % 60)).padStart(2, '0')}`;
  return {
    km: Math.round(b.km * 10) / 10, minutes: Math.round(b.minutes),
    arrivee: b.arrivee == null ? null : hhmm(b.arrivee),
    charge: b.cumuls.charge, colis: b.cumuls.colis,
    arrets: b.retenus.length, enRetard: b.enRetard,
  };
});

const jalonsBo = () => pageBo.evaluate(async () => {
  const S = await import('/contenus/boost-tournee.js');
  const o = {};
  S.ETAPES.forEach((e) => { o[e.id] = e.verifier(window.__bo.db).status; });
  return o;
});

// Les sept cases attendues, ÉCRITES ICI à la main. Le contenu, lui, ne les écrit pas : le
// noyau les recalcule depuis la position du point. Les deux doivent tomber d'accord, et c'est
// tout l'intérêt de les poser en dur dans le test — un point déplacé par erreur se voit.
const CASES31 = { c1: 'D2', c2: 'C2', c3: 'C4', c4: 'B3', c5: 'F3', c6: 'E1', c7: 'D4' };
// Les sept quartiers attendus, ÉCRITS ICI à la main (menus déroulants du repérage, 05/10).
const QUARTIERS31 = { c1: 'Écusson', c2: 'Jardins de la Fontaine', c3: 'Ville Active',
  c4: 'Saint-Césaire', c5: 'Courbessac', c6: 'Grézan', c7: 'Costières' };
// Choisit les bons quartiers dans les menus d'une zone, sauf pour les points de `sauf`.
const choisirQuartiersBo = async (z, sauf = []) => {
  for (const [id, q] of Object.entries(QUARTIERS31)) {
    if (sauf.includes(id)) continue;
    await pageBo.selectOption(`${z} .plan-quartier[data-quartier="${id}"]`, q);
  }
};
// Remplit la feuille de calcul d'une tournée à six arrêts et la fait vérifier : les six
// formules attendues d'un élève (voir le cas « les formules justes sont acceptées »).
const remplirFeuilleBo = async () => {
  const formules = { B8: '=SOMME(B2:B7)', B13: '=B11/B12', B14: '=B13*60', B17: '=B15*B16',
    B18: '13:00', B19: '=B18+B14+B17' };
  for (const [ref, f] of Object.entries(formules)) {
    await pageBo.fill(`${zBo} [data-gr="${ref}"]`, f);
    await pageBo.waitForTimeout(40);
  }
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
};
// Le meilleur ordre de passage, et ce qu'il donne. Valeurs obtenues par énumération des
// 720 ordres (voir `claude/prepalog-boost-c24-c26.md`), pas estimées.
const ORDRE31 = ['c4', 'c2', 'c1', 'c6', 'c5', 'c7'];

await v('ENT-3.1 : la séance déclare un barème de jalons et PAS de notation', async () => {
  const d = await pageBo.evaluate(async () => {
    const act = await import('/activites/boost-tournee.js');
    const notes = await import('/core/notes.js');
    return {
      code: act.meta.code, id: act.meta.id, jeuId: act.meta.jeuId,
      bareme: act.meta.bareme, notation: act.meta.notation,
      immersif: !!act.meta.immersif, portee: act.meta.portee,
      convertie: notes.noteConvertie(act.meta),
      sur20: notes.noteSur20(act.meta.bareme, act.meta.bareme),
    };
  });
  if (d.code !== 'ENT-3.1') throw new Error('code ' + d.code);
  if (d.jeuId !== 'boost') throw new Error('jeuId ' + d.jeuId);
  if (d.portee !== 'eleve' || !d.immersif) throw new Error('portée ou immersion');
  if (d.notation !== undefined) throw new Error('la séance déclare notation: ' + d.notation);
  if (d.bareme !== 6) throw new Error('barème ' + d.bareme + ' au lieu de 6 jalons');
  // C'est l'omission de `notation` qui donne la note sur 20 — vérifié par le moteur lui-même,
  // pas supposé.
  if (!d.convertie) throw new Error('la séance ne serait pas ramenée sur 20');
  if (d.sur20 !== 20) throw new Error('6 jalons sur 6 ne donnent pas 20/20 : ' + d.sur20);
});

await v('ENT-3.1 : sept clients, adresses réelles sans numéro de rue, quartiers cachés', async () => {
  await ouvrirBo('plan');
  const adr = await pageBo.$$eval(`${zBo} .plan-table tbody tr td:nth-child(2)`, (e) => e.map((x) => x.textContent.trim()));
  if (adr.length !== 7) throw new Error(adr.length + ' lignes au lieu de 7');
  // Pas de numéro de rue : la rue est réelle, le commerce est inventé. Un numéro désignerait
  // un vrai bâtiment.
  adr.forEach((a) => {
    if (/^\s*\d/.test(a)) throw new Error('numéro de rue dans « ' + a + ' »');
    if (!/30\d{3} Nîmes$/.test(a)) throw new Error('adresse mal formée : ' + a);
  });
  if (!adr.some((a) => /Mascard/.test(a)) || !adr.some((a) => /Bouvine/.test(a))) {
    throw new Error('les deux rues vérifiées en source officielle ont disparu');
  }
  // Temps 1 : le plan est muet et les quartiers ne sont pas donnés.
  // Depuis le 05/10 le quartier est un MENU : au temps 1 aucun n'est choisi.
  const zones = await pageBo.$$eval(`${zBo} .plan-quartier`, (e) => e.map((x) => x.value));
  if (zones.length !== 7 || zones.some((z) => z !== '')) throw new Error('quartiers choisis au temps 1 : ' + zones.join('|'));
  const svg = await pageBo.textContent(`${zBo} .plan-svg`);
  if (/Comptoir des Halles/.test(svg)) throw new Error('les noms des clients sont sur le plan muet');
  // Le décor nomme les quartiers, mais aucun ne porte le nom d'un client : lire le décor ne
  // donne pas la réponse.
  if (!/Écusson/.test(svg) || !/Costières/.test(svg)) throw new Error('le décor a perdu ses quartiers');
  if (/Route d'Avignon/.test(svg)) throw new Error('le décor dit encore « Route d’Avignon » au lieu de Grézan');
});

await v('ENT-3.1 : aucun point du plan ne se pose sur une ligne du quadrillage', async () => {
  // Tristan, 05/10 : *« le point 3 est en plein sur le quadrillage »*. La Pointe Sud est à
  // x = 200, exactement entre les colonnes B et C : la bonne case est C4 par arrondi, B4 pour
  // l'œil, et l'élève qui lit B4 est jugé faux sans s'être trompé. Une case ne se juge que si
  // le rond du point (rayon 12) tient ENTIÈREMENT dans une cellule.
  //
  // Défaut connu et pas encore corrigé : déplacer un point change les kilomètres, donc le
  // calibrage entier (22,1 km, 15 h 27…). La liste ci-dessous est FIGÉE : elle ne doit jamais
  // s'allonger, et un nouveau point ou un nouveau plan doit passer sans exception.
  const FIGES = ['c1', 'c3', 'c5', 'c6'];
  const r = await pageBo.evaluate(async () => {
    const S = await import('/contenus/boost-tournee.js');
    const P = S.PLAN;
    const L = P.largeur, H = P.hauteur;
    const nc = String(P.grille.colonnes).length, nl = P.grille.lignes;
    const proche = (v, pas, n) => {
      let d = Infinity;
      for (let i = 1; i < n; i++) d = Math.min(d, Math.abs(v - i * pas));
      return d;
    };
    return P.points.map((p) => ({
      id: String(p.id),
      d: Math.min(proche(p.x, L / nc, nc), proche(p.y, H / nl, nl)),
    }));
  });
  const trop = r.filter((x) => x.d < 12).map((x) => x.id);
  const nouveaux = trop.filter((id) => !FIGES.includes(id));
  if (nouveaux.length) throw new Error('point(s) à cheval sur le quadrillage : ' + nouveaux.join(', '));
  // Et la liste figée ne ment pas : si un point est corrigé, on le retire d'ici.
  const guéris = FIGES.filter((id) => !trop.includes(id));
  if (guéris.length) throw new Error('point(s) désormais bien placés, à retirer de la liste figée : ' + guéris.join(', '));
  // Le pire cas, exactement SUR une ligne, est interdit sans exception possible… sauf celui
  // que Tristan a trouvé et qui attend sa décision.
  const surLigne = r.filter((x) => x.d === 0).map((x) => x.id);
  if (surLigne.join(',') !== 'c3') throw new Error('points exactement sur une ligne : ' + surLigne.join(','));
});

await v('ENT-3.1 : l’entrepôt est au sud-ouest, et le décor ne double pas le noyau', async () => {
  const g = await pageBo.evaluate(() => {
    const svg = document.querySelector('#boost31 .plan-svg');
    const d = svg.querySelector('.plan-depart rect');
    return {
      x: +d.getAttribute('x') + 13, y: +d.getAttribute('y') + 13,
      departs: svg.querySelectorAll('.plan-depart').length,
      arrivees: svg.querySelectorAll('.plan-arrivee').length,
      traces: svg.querySelectorAll('.plan-trace').length,
      points: svg.querySelectorAll('.plan-pt').length,
      echelles: (svg.innerHTML.match(/1 km/g) || []).length,
    };
  });
  // Sud-ouest : moitié gauche du plan (600 de large), moitié basse (420 de haut). La maquette
  // le plaçait au nord-est, à l'opposé de son adresse réelle.
  if (!(g.x < 300 && g.y > 210)) throw new Error(`entrepôt en (${g.x},${g.y}) : pas au sud-ouest`);
  // Le quadrillage, les repères, le tracé, les points et l'échelle sont dessinés par le NOYAU.
  // Si le décor du contenu les redessinait, on les verrait en double.
  if (g.departs !== 1 || g.arrivees !== 1 || g.traces !== 1) throw new Error('repères en double dans le SVG');
  if (g.points !== 7) throw new Error(g.points + ' points dessinés');
  if (g.echelles !== 1) throw new Error(g.echelles + ' échelles « 1 km » : le décor en redessine une');
});

await v('ENT-3.1 : le plan porte trois repères nîmois, la voie ferrée et le nord', async () => {
  // Le premier décor aurait pu être celui de n'importe quelle ville moyenne. Un élève reconnaît
  // sa ville par ses monuments, ses axes structurants et son orientation — ce cas garde les
  // trois, et garde surtout que le décor ne reprend pas la couleur des points clients.
  const d = await pageBo.evaluate(() => {
    const svg = document.querySelector('#boost31 .plan-svg');
    const rail = svg.querySelector('.plan-rail');
    const [a, b] = (rail ? rail.dataset.rail : '0,0 0,0').split(' ')
      .map((p) => p.split(',').map(Number));
    // Distance de la gare à la droite du rail : la voie ferrée n'a de sens que si elle passe
    // par la gare. Produit vectoriel sur la longueur, pas d'à-peu-près à l'œil.
    const G = { x: 318, y: 255 };
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const ecart = Math.abs((G.x - a[0]) * dy - (G.y - a[1]) * dx) / Math.hypot(dx, dy);
    return {
      reperes: svg.querySelectorAll('.plan-reperes > g').length,
      nord: svg.querySelectorAll('.plan-nord').length,
      rails: svg.querySelectorAll('.plan-rail').length,
      ecart,
      texte: svg.textContent,
      // `--ardoise-fond`, c'est le bleu des clients. Le noyau le pose sur les sept points, et
      // sur eux seuls : si le décor le reprend pour ses quartiers, les pastilles disparaissent
      // dans le fond. C'était le défaut de la première version.
      bleus: (svg.innerHTML.match(/var\(--ardoise-fond\)/g) || []).length,
    };
  });
  if (d.reperes !== 3) throw new Error(d.reperes + ' repère(s) dessiné(s) au lieu de 3');
  ['Arènes', 'Maison Carrée', 'Tour Magne'].forEach((m) => {
    if (!d.texte.includes(m)) throw new Error('le repère « ' + m + ' » n’est pas nommé');
  });
  if (d.nord !== 1) throw new Error('pas de flèche du nord : l’élève ne peut pas raccrocher le plan en ligne');
  if (d.rails !== 1) throw new Error(d.rails + ' voie(s) ferrée(s)');
  if (!(d.ecart < 6)) throw new Error('la voie ferrée passe à ' + d.ecart.toFixed(1) + ' px de la gare');
  if (!/voie ferrée/.test(d.texte)) throw new Error('la voie ferrée n’est pas nommée');
  if (d.bleus !== 7) throw new Error(d.bleus + ' usages du bleu des clients au lieu de 7 : le décor leur fait concurrence');
});

await v('ENT-3.1 : le calibrage tient — une seule combinaison de clients possible', async () => {
  // La règle du projet est d'ÉNUMÉRER, pas d'estimer. 128 combinaisons et 720 ordres, calculés
  // ici à partir du contenu réel : si un poids ou une position change, ce test tombe.
  const r = await pageBo.evaluate(async () => {
    const B = await import('/contenus/boost.js');
    const { distanceKm } = await import('/core/types/plan.js');
    const P = B.DESTINATAIRES, V = B.VELO, PLAN = B.PLAN_NIMES;
    const combis = [];
    let sousEnsembles = 0;
    for (let m = 0; m < (1 << P.length); m++) {
      sousEnsembles++;
      const c = P.filter((_, i) => m & (1 << i));
      if (c.reduce((t, x) => t + x.kg, 0) <= V.chargeUtile) combis.push(c);
    }
    const maxn = Math.max(...combis.map((c) => c.length));
    const grandes = combis.filter((c) => c.length === maxn);
    // Les ordres de passage de la meilleure combinaison.
    const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) =>
      perms(a.slice(0, i).concat(a.slice(i + 1))).map((p) => [x].concat([p]).flat())));
    const c = grandes[0];
    let ok = 0, tot = 0, best = Infinity, bestOrdre = null;
    perms(c).forEach((p) => {
      const suite = [PLAN.depart].concat(p, [PLAN.arrivee]);
      let km = 0;
      for (let i = 1; i < suite.length; i++) km += distanceKm(PLAN, suite[i - 1], suite[i]);
      const arr = V.depart + km / V.vitesse * 60 + p.length * V.service;
      tot++;
      if (arr <= V.train) ok++;
      if (arr < best) { best = arr; bestOrdre = p.map((x) => x.id); }
    });
    return {
      total: P.reduce((t, x) => t + x.kg, 0), utile: V.chargeUtile,
      sousEnsembles, combis: combis.length, maxn, nGrandes: grandes.length,
      quai: P.filter((x) => !c.includes(x)).map((x) => x.id),
      poids: c.reduce((t, x) => t + x.kg, 0),
      ok, tot, best: Math.round(best), bestOrdre,
    };
  });
  // 128 sous-ensembles de sept clients, dont 115 tiennent dans les 180 kg. On énumère les
  // 128 — c'est la règle du projet : énumérer, pas estimer.
  if (r.sousEnsembles !== 128) throw new Error(r.sousEnsembles + ' sous-ensembles au lieu de 128');
  if (r.combis !== 115) throw new Error(r.combis + ' combinaisons tenables au lieu de 115');
  if (r.total !== 237) throw new Error('masse totale ' + r.total + ' kg au lieu de 237');
  if (r.maxn !== 6) throw new Error('on pourrait livrer ' + r.maxn + ' clients, pas 6');
  if (r.nGrandes !== 1) throw new Error(r.nGrandes + ' combinaisons de 6 clients : la réponse n’est plus unique');
  if (r.quai.join(',') !== 'c3') throw new Error('à quai : ' + r.quai.join(',') + ' au lieu de c3 (La Pointe Sud)');
  if (r.poids !== 179) throw new Error(r.poids + ' kg chargés au lieu de 179');
  if (r.tot !== 720) throw new Error(r.tot + ' ordres énumérés au lieu de 720');
  // La contrainte de temps doit mordre : si presque tous les ordres passaient, l'exercice
  // n'aurait plus d'intérêt ; si aucun ne passait, il serait infaisable.
  if (!(r.ok > 40 && r.ok < 300)) throw new Error(r.ok + '/720 ordres à l’heure : calibrage à revoir');
  if (r.best !== 15 * 60 + 27) throw new Error('meilleure arrivée à ' + r.best + ' min au lieu de 15 h 27');
  if (r.bestOrdre.join(',') !== 'c4,c2,c1,c6,c5,c7') throw new Error('meilleur ordre : ' + r.bestOrdre.join(','));
});

await v('ENT-3.1 : les jalons ne reprochent rien avant que l’élève ait commencé', async () => {
  const s = await dernierSuivi();
  if (!s) throw new Error('aucun avancement remonté au suivi');
  if (s.max !== 6) throw new Error('max ' + s.max + ' au lieu de 6');
  if (s.score !== 0) throw new Error('score ' + s.score + ' avant tout travail');
  // Aucun jalon ne doit être « ko » : rien n'est fait, donc rien n'est faux. La charge est
  // pourtant à 237 kg pour 180 utiles — c'est l'état de départ, pas une erreur de l'élève.
  const ko = Object.keys(s.detail).filter((k) => s.detail[k] === 'ko');
  if (ko.length) throw new Error('jalon(s) à tort en « ko » : ' + ko.join(', '));
});

await v('ENT-3.1 : le mail du responsable porte la fiche des sept commandes', async () => {
  await ouvrirBo('mail');
  const t = await pageBo.textContent(zBo);
  if (!/Tournée vélo-cargo du jour/.test(t)) throw new Error('le mail de la séance n’est pas semé');
  const corps = await pageBo.evaluate(() => {
    const m = window.__bo.db.mails.find((x) => /vélo-cargo du jour/.test(x.subject));
    return m ? m.text : '';
  });
  ['Comptoir des Halles', 'Pointe Sud', 'Caveau Pélissier', '180 kg', '16 h 10']
    .forEach((x) => { if (!corps.includes(x)) throw new Error('le mail ne dit pas « ' + x + ' »'); });
  // La gare, c'est Nîmes-Centre : la gare TGV est à Manduel, inatteignable en vélo-cargo.
  if (!/Nîmes-Centre/.test(corps)) throw new Error('le mail ne nomme pas la gare de Nîmes-Centre');
  if (/Nîmes TGV|Pont-du-Gard/.test(corps)) throw new Error('le mail envoie le vélo-cargo à la gare TGV');
  // Semé une seule fois, même si l'élève revient : la base est partagée par les séances ENT-3.x.
  const n = await pageBo.evaluate(() => window.__bo.db.mails.filter((x) => /vélo-cargo du jour/.test(x.subject)).length);
  if (n !== 1) throw new Error(n + ' exemplaires du mail');
});

await v('ENT-3.1 : l’écran Clients donne l’adresse mais jamais le quartier', async () => {
  await ouvrirBo('clients');
  await pageBo.waitForTimeout(140);
  const t = await pageBo.textContent(zBo);
  if (!/Comptoir des Halles/.test(t)) throw new Error('les sept commerces ne sont pas référencés');
  if (!/Mascard/.test(t)) throw new Error('l’adresse n’est pas donnée');
  // L'écran ne doit pas servir le champ `zone` : c'est précisément ce que l'élève va chercher.
  // Cinq quartiers sur sept n'apparaissent ni dans un nom de rue ni dans une enseigne, et
  // aucun ne doit donc se lire ici. C'est ce test qui a attrapé « Épicerie Fontaine » et
  // « Caveau des Costières », deux commerces inventés qui donnaient la réponse dans leur nom.
  ['Écusson', 'Ville Active', 'Saint-Césaire', 'Costières']
    .forEach((q) => { if (new RegExp(q).test(t)) throw new Error('le quartier « ' + q + ' » est donné dans l’écran Clients'); });
  // Les trois autres SONT dans le nom de la rue — quai de la Fontaine, route de Courbessac,
  // rue de Grézan — et il n'y a rien à y faire : ces rues sont réelles et cohérentes avec la
  // position de leur point, les renommer serait mentir. Pour ces trois clients, le quartier
  // vient avec l'adresse ; la CASE du quadrillage reste à lire sur le plan, et c'est elle
  // qu'on corrige. Le test garde qu'on n'en ajoute pas un quatrième par mégarde — c'est lui
  // qui a attrapé « Caveau des Costières », dont l'enseigne donnait la réponse.
  const donnes = ['Fontaine', 'Courbessac', 'Grézan'].filter((q) => new RegExp(q).test(t));
  if (donnes.length !== 3) throw new Error('quartiers lisibles dans les adresses : ' + donnes.join(', '));
});

await v('ENT-3.1 : la tournée est fermée tant que le repérage n’est pas fait', async () => {
  await ouvrirBo('tournee');
  const t = await pageBo.textContent(zBo);
  if (!/Plan de Nîmes/.test(t)) throw new Error('la tournée s’ouvre sans repérage : ' + t.slice(0, 200));
  if (await pageBo.$$eval(`${zBo} #tourListe`, (e) => e.length)) throw new Error('les arrêts sont déjà manipulables');
});

await v('ENT-3.1 : le quartier se choisit dans un menu de douze, et seul le champ fautif est signalé', async () => {
  // Tristan, 05/10 : un menu déroulant par ligne, douze quartiers de Nîmes dont sept servent.
  await ouvrirBo('plan');
  const m = await pageBo.$$eval(`${zBo} .plan-quartier`, (sels) => sels.map((s) => ({
    n: s.options.length, vide: s.options[0].value === '', id: s.dataset.quartier,
    noms: Array.from(s.options).slice(1).map((o) => o.value),
  })));
  if (m.length !== 7) throw new Error(m.length + ' menus au lieu de 7 (un par ligne)');
  m.forEach((x) => { if (x.n !== 13 || !x.vide) throw new Error('menu ' + x.id + ' : ' + x.n + ' options'); });
  const noms = m[0].noms;
  if (new Set(noms).size !== 12) throw new Error('les noms ne sont pas douze et distincts : ' + noms.join('|'));
  // Les sept utilisés y sont, plus cinq qu'aucun client n'habite — sans eux, le dernier client
  // se trouverait par élimination.
  Object.values(QUARTIERS31).forEach((q) => { if (!noms.includes(q)) throw new Error('quartier absent du menu : ' + q); });
  if (noms.filter((n) => !Object.values(QUARTIERS31).includes(n)).length !== 5) throw new Error('il faut cinq quartiers en trop : ' + noms.join('|'));
  // Alphabétique : la liste ne suit ni la fiche ni le plan, donc ne souffle rien.
  const tries = [...noms].sort((a, b) => a.localeCompare(b, 'fr'));
  if (tries.join('|') !== noms.join('|')) throw new Error('menu pas dans l’ordre alphabétique : ' + noms.join('|'));
  // Les menus sont les mêmes sur toutes les lignes.
  if (m.some((x) => x.noms.join('|') !== noms.join('|'))) throw new Error('les menus ne se ressemblent pas');

  // Les sept cases JUSTES, mais deux quartiers FAUX : un point n'est juste que si les deux le
  // sont, donc deux points faux dépassent la tolérance (un) et le repérage n'est pas validé.
  for (const [id, c] of Object.entries(CASES31)) {
    await pageBo.fill(`${zBo} .plan-case[data-case="${id}"]`, c);
  }
  await choisirQuartiersBo(zBo, ['c1', 'c2']);
  await pageBo.selectOption(`${zBo} .plan-quartier[data-quartier="c1"]`, 'Gambetta');
  await pageBo.selectOption(`${zBo} .plan-quartier[data-quartier="c2"]`, 'Pissevin');
  await pageBo.click(`${zBo} [data-plan-valider]`);
  await pageBo.waitForTimeout(160);
  const e = await etatBo('plan');
  if (e.valide) throw new Error('le repérage est validé avec deux quartiers faux');
  const classes = await pageBo.evaluate((z) => {
    const o = {};
    ['c1', 'c2', 'c3'].forEach((id) => {
      o[id] = {
        q: document.querySelector(`${z} .plan-quartier[data-quartier="${id}"]`).classList.contains('plan-ko'),
        c: document.querySelector(`${z} .plan-case[data-case="${id}"]`).classList.contains('plan-ko'),
        qOk: document.querySelector(`${z} .plan-quartier[data-quartier="${id}"]`).classList.contains('plan-ok'),
      };
    });
    return o;
  }, zBo);
  // Seul le menu fautif est rouge : la case, elle, est juste.
  if (!classes.c1.q || classes.c1.c) throw new Error('c1 mal signalé : ' + JSON.stringify(classes.c1));
  if (!classes.c2.q || classes.c2.c) throw new Error('c2 mal signalé : ' + JSON.stringify(classes.c2));
  if (classes.c3.q || classes.c3.c || !classes.c3.qOk) throw new Error('c3 signalé à tort : ' + JSON.stringify(classes.c3));
  const t = await texteBo();
  if (!/2 point\(s\) encore mal situé/.test(t)) throw new Error('le bilan ne compte pas les deux points : ' + t.slice(-300));
});

await v('ENT-3.1 : les sept cases justes ouvrent la tournée et valident le jalon', async () => {
  await ouvrirBo('plan');
  for (const [id, c] of Object.entries(CASES31)) {
    await pageBo.fill(`${zBo} .plan-case[data-case="${id}"]`, c);
  }
  await choisirQuartiersBo(zBo);
  await pageBo.click(`${zBo} [data-plan-valider]`);
  await pageBo.waitForTimeout(160);
  const t = await pageBo.textContent(zBo);
  if (!/Les 7 points sont bien situés/.test(t)) throw new Error('les cases du test ne tombent pas d’accord avec le noyau : ' + t.slice(0, 400));
  const e = await etatBo('plan');
  if (!e.valide) throw new Error('le repérage n’est pas enregistré');
  if (e.force) throw new Error('la porte de sortie a été prise alors que tout est juste');
  const svg = await pageBo.textContent(`${zBo} .plan-svg`);
  if (!/Comptoir des Halles/.test(svg)) throw new Error('les noms n’apparaissent pas au temps 2');
  const s = await dernierSuivi();
  if (s.detail.reperage !== 'ok') throw new Error('jalon repérage : ' + s.detail.reperage);
  if (s.score !== 1) throw new Error('score ' + s.score + ' au lieu de 1 après le repérage');
});

await v('ENT-3.1 : à l’ouverture de la tournée, rien n’est encore reproché', async () => {
  // Le moment le plus traître de la séance. L'élève vient de valider son repérage, il ouvre la
  // tournée, et les sept commandes y sont toutes chargées : 237 kg pour 180 utiles, et un
  // retour bien après le train. Rien de tout cela n'est une faute — c'est l'énoncé. Un jalon
  // qui afficherait « à corriger » ici ferait croire à l'enseignant que l'élève s'est trompé
  // avant même d'avoir touché à quoi que ce soit.
  await ouvrirBo('tournee');
  const t = await texteBo();
  // Le vélo-cargo part VIDE : la jauge est à 0 sur 180 et les sept commandes sont à quai.
  // Trouver tout déjà chargé n'était pas intuitif, et c'était l'inverse du geste réel.
  // La jauge ne dit plus le total — elle dit la LIMITE. C'est la condition pour que la feuille
  // de calcul serve à quelque chose (04/10). Le vélo-cargo part quand même vide, et ça se lit
  // au quai et au récapitulatif, pas à la jauge.
  if (!/max 180 kg/.test(t)) throw new Error('la jauge n’annonce pas la limite : ' + t.slice(0, 300));
  if (/0 \/ 180 kg|179 \/ 180/.test(t)) throw new Error('la jauge donne encore un total : ' + t.slice(0, 300));
  const b0 = await bilanBo();
  if (b0.charge !== 0 || b0.arrets !== 0) throw new Error('le vélo-cargo ne part pas vide : ' + JSON.stringify(b0));
  if (!/Commandes restées à quai \(7\)/.test(t)) throw new Error('les sept commandes ne sont pas à quai : ' + t.slice(0, 400));
  if (!/Rien n'est chargé/.test(t.replace(/’/g, "'"))) throw new Error('pas d’état vide expliqué : ' + t.slice(0, 300));
  if (await pageBo.$$eval(`${zBo} #tourListe .tour-item`, (e) => e.length)) {
    throw new Error('des arrêts sont déjà chargés');
  }
  const j = await jalonsBo();
  const ko = Object.keys(j).filter((k) => j[k] === 'ko');
  if (ko.length) throw new Error('jalon(s) à tort en « ko » à l’ouverture : ' + ko.join(', ') + ' — ' + JSON.stringify(j));
  if (j.charge !== 'attente') throw new Error('jalon charge à l’ouverture : ' + j.charge);
  if (j.horaire !== 'attente') throw new Error('jalon horaire à l’ouverture : ' + j.horaire);
  if (j.choix !== 'attente') throw new Error('jalon choix à l’ouverture : ' + j.choix);
  if (j.reperage !== 'ok') throw new Error('jalon repérage : ' + j.reperage);
  // Le sixième jalon note la feuille de calcul : tant qu'elle n'a pas été touchée, il n'a rien
  // à dire.
  if (j.formules !== 'na') throw new Error('jalon formules à l’ouverture : ' + j.formules);
  // Et le piège inverse : un élève qui tape un chiffre dans une case SANS rien avoir chargé a
  // bien « commencé », mais son vélo-cargo vide respecte évidemment le plafond. Ça ne vaut pas
  // un point — sinon on en gagne un en ne faisant rien.
  await pageBo.fill(`${zBo} [data-report="total"]`, '237');
  await pageBo.waitForTimeout(80);
  const j2 = await jalonsBo();
  if (j2.charge === 'ok') throw new Error('le vélo-cargo vide fait gagner le jalon « charge »');
  if (j2.horaire === 'ok') throw new Error('le vélo-cargo vide fait gagner le jalon « horaire »');
});

await v('ENT-3.1 : la bonne commande à quai, le bon ordre, le train attrapé, 5 jalons sur 6 puis 6 sur 6', async () => {
  await ouvrirBo('tournee');
  // On charge les six, et on laisse La Pointe Sud à quai : 58 kg, la seule commande qui libère
  // assez de charge à elle seule.
  for (const id of ['c1', 'c2', 'c4', 'c5', 'c6', 'c7']) {
    await pageBo.click(`${zBo} [data-reprendre="${id}"]`);
    await pageBo.waitForTimeout(60);
  }
  // On vise la jauge de CHARGE, pas « une jauge en rouge » : à cet instant l'ordre est encore
  // celui de la fiche, donc la jauge d'horaire est légitimement en rouge. Confondre les deux
  // ferait passer ce test pour un échec du calibrage.
  const chargeTrop = await pageBo.$$eval(`${zBo} .tour-jauge`, (els) => els
    .filter((e) => /Charge du vélo-cargo/.test(e.textContent))
    .map((e) => ({ trop: e.classList.contains('trop'), txt: e.textContent.replace(/\s+/g, ' ').trim() })));
  if (chargeTrop.length !== 1) throw new Error(chargeTrop.length + ' jauge(s) de charge');
  if (chargeTrop[0].trop) throw new Error('la charge dépasse encore : ' + chargeTrop[0].txt);
  // La jauge ne donne plus le chiffre : on le vérifie à la source, et on vérifie EN PLUS
  // qu'elle ne le laisse pas filer — ni en clair, ni par une soustraction (« dépassée de 57 »).
  if (/179/.test(chargeTrop[0].txt)) throw new Error('la jauge donne le poids total : ' + chargeTrop[0].txt);
  if (/dépassée de/.test(chargeTrop[0].txt)) throw new Error('la jauge donne le total par soustraction : ' + chargeTrop[0].txt);
  const bCharge = await bilanBo();
  if (bCharge.charge !== 179) throw new Error('charge calculée : ' + bCharge.charge + ' kg au lieu de 179');
  // L'ordre optimal. Le glisser-déposer et les flèches sont déjà éprouvés par les dix-sept
  // cas du noyau ; ici c'est le CHIFFRE qu'on vérifie, donc on pose l'ordre et on redessine.
  await pageBo.evaluate((ordre) => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ordre;
    // Les deux bouts sont posés ici comme l'élève les poserait d'un clic : depuis le 04/10 ils
    // ne sont plus du décor, et une chaîne incomplète raccourcit légitimement le trajet.
    t.depart = Date.now(); t.arrivee = Date.now();
  }, ORDRE31);
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
  const t = await texteBo();
  const bOpt = await bilanBo();
  if (bOpt.arrivee !== '15 h 27') throw new Error('retour calculé à ' + bOpt.arrivee + ' au lieu de 15 h 27');
  if (/15 h 27/.test(t)) throw new Error('l’écran donne l’heure de retour avant le calcul : ' + t.slice(0, 600));
  if (/manqué/.test(t)) throw new Error('le train est annoncé manqué avec le meilleur ordre');
  // Les deux cases de report. Les valeurs sont écrites ici, pas lues sur l'écran.
  const attendu = { total: '237', trop: '57' };
  for (const [id, val] of Object.entries(attendu)) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(180);
  const faux = await pageBo.$$eval(`${zBo} .tour-saisie input.faux`, (e) => e.length);
  if (faux) throw new Error(faux + ' case(s) de report jugée(s) fausse(s) alors qu’elles sont justes');
  const s = await dernierSuivi();
  // Cinq jalons sur six : la feuille de calcul n'a pas été touchée, et c'est elle que note le
  // sixième. Ne rien y avoir fait ne coûte qu'un jalon, et ne fait rien tomber d'autre.
  if (s.score !== 5 || s.max !== 6) throw new Error('suivi : ' + s.score + '/' + s.max + ' — ' + JSON.stringify(s.detail));
  const pas = Object.keys(s.detail).filter((k) => s.detail[k] !== 'ok');
  if (pas.join(',') !== 'formules') throw new Error('jalon(s) pas au vert : ' + pas.join(', '));
  // Les formules justes, vérifiées : le sixième tombe, et la séance vaut 20/20.
  await remplirFeuilleBo();
  const s6 = await dernierSuivi();
  if (s6.score !== 6 || s6.max !== 6) throw new Error('suivi après la feuille : ' + s6.score + '/' + s6.max + ' — ' + JSON.stringify(s6.detail));
});

await v('ENT-3.1 : un mauvais ordre fait manquer le train, et seul ce jalon tombe', async () => {
  // L'ordre de départ, celui de la fiche : 32,6 km et un retour à 16 h 19, neuf minutes après
  // le train. La charge, elle, reste bonne — les deux contraintes se jugent séparément.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ['c1', 'c2', 'c4', 'c5', 'c6', 'c7'];
    t.quai = ['c3'];
    t.depart = Date.now(); t.arrivee = Date.now();
    t.juge = {}; t.bloque = null;
    // Comme `invalider()` quand l'élève change sa tournée : le verdict de la feuille s'efface.
    if (t.grille) { t.grille.juge = {}; t.grille.valide = null; }
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
  const t = await texteBo();
  // Le calibrage, à la source : 32,6 km et un retour à 16 h 19, neuf minutes après le train.
  const bTrain = await bilanBo();
  if (bTrain.arrivee !== '16 h 19') throw new Error('retour calculé à ' + bTrain.arrivee + ' au lieu de 16 h 19');
  if (bTrain.km !== 32.6) throw new Error('distance calculée : ' + bTrain.km + ' km au lieu de 32,6');
  // À l'écran, l'élève apprend QUE le train est manqué — c'est indispensable, sinon la
  // contrainte disparaît de la séance — mais pas DE COMBIEN : neuf minutes de retard sur une
  // limite connue redonneraient l'heure de retour, donc le temps total qu'il doit calculer.
  if (!/manqué/.test(t)) throw new Error('le retard n’est pas annoncé du tout : ' + t.slice(0, 600));
  // On lit les JAUGES et pas la page entière : la feuille de calcul, remplie par un cas
  // précédent, affiche légitimement le résultat de la formule de l'élève (16 h 19). Ce qui ne
  // doit pas la donner, c'est le tableau de bord.
  const jaugesTxt = (await pageBo.$$eval(`${zBo} .tour-jauge`, (els) => els.map((e) => e.textContent)))
    .join(' ').replace(/\s+/g, ' ');
  if (/16 h 19|manqué de 9 min/.test(jaugesTxt)) throw new Error('les jauges donnent l’heure de retour : ' + jaugesTxt);
  const j = await jalonsBo();
  if (j.horaire !== 'ko') throw new Error('jalon horaire : ' + j.horaire);
  if (j.charge !== 'ok') throw new Error('jalon charge tombé avec l’horaire : ' + j.charge);
  if (j.choix !== 'ok') throw new Error('jalon choix tombé avec l’horaire : ' + j.choix);
  if (j.reperage !== 'ok') throw new Error('jalon repérage tombé avec l’horaire');
  // Réordonner efface la correction des cases : le jalon « report » repasse en « na ».
  if (j.report !== 'na') throw new Error('jalon report après un changement d’ordre : ' + j.report);
  const vus = Object.keys(j).filter((k) => j[k] === 'ok').length;
  if (vus !== 3) throw new Error(vus + ' jalons au vert au lieu de 3 — ' + JSON.stringify(j));
});

await v('ENT-3.1 : une tournée qui ne tient pas refuse le report des résultats', async () => {
  // Le défaut relevé par Tristan le 03/10 : *« il suffit de garder les 6 premières et on tombe
  // juste, aucun travail de tournée à faire »*. La cause est structurelle — chaque case se
  // corrige contre le bilan DE L'ÉLÈVE, donc aucune ne peut juger son ordre — et dans ENT-3.1
  // les quatre valeurs attendues sont identiques quel que soit l'ordre : 237, 57, 179, 36.
  // Un élève obtenait 4/4 en manquant le train de neuf minutes.
  //
  // On arrive ici avec l'ordre de la fiche, celui qui rentre à 16 h 19. Les quatre valeurs
  // saisies sont les BONNES : c'est bien la tournée, et elle seule, qui doit faire refuser.
  const attendu = { total: '237', trop: '57' };
  for (const [id, val] of Object.entries(attendu)) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(180);
  const t = await texteBo();
  if (!/ne tient pas encore/.test(t)) throw new Error('le report est accepté malgré le train manqué : ' + t.slice(-500));
  // Le refus dit ce qui ne va pas, sans dire de combien — même raison que la jauge : « manqué
  // de 9 min » sur un train à 16 h 10 rend l'heure de retour par une addition.
  if (!/train manqué/.test(t)) throw new Error('le refus ne dit pas ce qui ne va pas : ' + t.slice(-400));
  if (/manqué de \d/.test(t)) throw new Error('le refus donne l’heure de retour par soustraction : ' + t.slice(-400));
  // Aucune case n'est déclarée juste : l'écran ne doit pas afficher quatre « juste » sous une
  // jauge rouge.
  const justes = await pageBo.$$eval(`${zBo} .tour-saisie input.juste`, (e) => e.length);
  if (justes) throw new Error(justes + ' case(s) déclarée(s) justes alors que la tournée ne tient pas');
  const j = await jalonsBo();
  if (j.report === 'ok') throw new Error('le jalon report est validé malgré le train manqué');
  // Et le refus s'efface dès que l'élève touche à son ordre : on ne le laisse pas devant un
  // message rouge qui ne correspond plus à rien.
  await pageBo.click(`${zBo} [data-bas="0"]`);
  await pageBo.waitForTimeout(140);
  if (/ne tient pas encore/.test(await texteBo())) throw new Error('le refus survit à un changement d’ordre');
});

await v('ENT-3.1 : la tournée se construit entièrement à la carte, et les six jalons tombent', async () => {
  // Le cas qui dit si le chantier sert à quelque chose. Les autres cas d'ENT-3.1 posent
  // l'ordre à la main dans la base parce que c'est le CHIFFRE qu'ils vérifient ; celui-ci fait
  // l'inverse : il ne touche pas à la base, il clique les six clients sur la carte dans
  // l'ordre de passage, exactement comme un élève, et regarde si la séance tombe juste.
  //
  // Six clics, et c'est tout. Avant la carte cliquable, il fallait six clics de chargement
  // PUIS une dizaine de clics de flèches pour arriver au même état.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = []; t.quai = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
    // Les deux bouts repartent à zéro eux aussi : ce cas doit TOUT construire au clic, y
    // compris le départ et l'arrivée. Les laisser posés par un cas précédent inverserait le
    // sens des deux clics, qui les retireraient au lieu de les placer.
    t.depart = null; t.arrivee = null;
    t.report = {}; t.juge = {}; t.bloque = null; t.valide = null;
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
  if (await pageBo.$$eval(`${zBo} #tourListe .tour-item`, (e) => e.length)) {
    throw new Error('la tournée ne repart pas à vide');
  }
  // Les deux bouts se cliquent comme les clients — c'est le chantier du 04/10 : l'élève doit
  // poser l'entrepôt et la gare, pas les trouver déjà là. Le départ d'abord, comme on raconte
  // une tournée.
  await pageBo.click(`${zBo} [data-clic-extremite="depart"]`);
  await pageBo.waitForTimeout(70);
  for (const id of ORDRE31) {
    await pageBo.click(`${zBo} [data-clic-point="${id}"]`);
    await pageBo.waitForTimeout(70);
  }
  await pageBo.click(`${zBo} [data-clic-extremite="arrivee"]`);
  await pageBo.waitForTimeout(70);
  const t = await pageBo.evaluate(() => window.__bo.db.transport['boost-ent31'].tournee);
  if (!t.depart || !t.arrivee) throw new Error('les deux bouts ne sont pas posés : ' + JSON.stringify({ d: t.depart, a: t.arrivee }));
  // L'ordre attendu, ÉCRIT ICI à la main plutôt que relu depuis `ORDRE31` : les deux doivent
  // tomber d'accord, sinon la constante et la carte pourraient se tromper ensemble.
  if (t.ordre.join(',') !== 'c4,c2,c1,c6,c5,c7') throw new Error('ordre construit à la carte : ' + t.ordre.join(','));
  if (t.quai.join(',') !== 'c3') throw new Error('La Pointe Sud devrait rester seule à quai : ' + t.quai.join(','));

  // Les chiffres de la séance, écrits ici à la main : 179 kg des six commandes retenues
  // (31 + 24 + 42 + 19 + 36 + 27), 21 colis, et le train attrapé.
  const txt = await texteBo();
  const bCarte = await bilanBo();
  if (bCarte.charge !== 179) throw new Error('charge : ' + bCarte.charge + ' kg au lieu de 179');
  if (bCarte.colis !== 21) throw new Error('colis : ' + bCarte.colis + ' au lieu de 21');
  if (bCarte.arrivee !== '15 h 27') throw new Error('retour : ' + bCarte.arrivee + ' au lieu de 15 h 27');
  if (/dépassée|manqué/.test(txt)) throw new Error('une contrainte est violée alors que l’ordre est le bon');

  // La carte, elle, porte bien les deux encres : sept ronds numérotés de 1 à 7 qui ne bougent
  // pas, six pastilles d'ordre, et La Pointe Sud en creux.
  const c = await pageBo.$$eval(`${zBo} .plan-svg .plan-pt`, (gs) => gs.map((g) => ({
    id: g.dataset.point,
    rond: g.querySelector('text').textContent.trim(),
    ordre: g.querySelector('.plan-pt-ordre text') ? g.querySelector('.plan-pt-ordre text').textContent.trim() : null,
    quai: g.classList.contains('plan-pt-quai'),
  })));
  if (c.map((x) => x.rond).join(',') !== '1,2,3,4,5,6,7') throw new Error('ronds : ' + JSON.stringify(c));
  if (c.filter((x) => x.ordre).length !== 6) throw new Error('pastilles d’ordre : ' + JSON.stringify(c));
  const pointe = c.find((x) => x.id === 'c3');
  if (!pointe.quai || pointe.ordre !== null) throw new Error('La Pointe Sud n’est pas dessinée à quai : ' + JSON.stringify(pointe));
  // Maison Lauze est le PREMIER arrêt et le client n° 4 : le cas même qui affichait deux « 3 »
  // sur la carte avant la correction (La Pointe Sud, client 3, et le 3ᵉ arrêt).
  const lauze = c.find((x) => x.id === 'c4');
  if (lauze.rond !== '4' || lauze.ordre !== '1') throw new Error('Maison Lauze : ' + JSON.stringify(lauze));

  // La feuille se remplit, les deux résultats se reportent et se valident : les six jalons
  // tombent. 237 kg les sept commandes, 57 kg de trop (179 kg chargés et 36 min d'arrêts se
  // calculent maintenant dans la feuille).
  await remplirFeuilleBo();
  for (const [id, val] of Object.entries({ total: '237', trop: '57' })) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(200);
  const j = await jalonsBo();
  const pas = Object.keys(j).filter((k) => j[k] !== 'ok');
  if (pas.length) throw new Error('jalon(s) non validé(s) : ' + pas.join(', ') + ' — ' + JSON.stringify(j));
});

await v('ENT-3.1 : la feuille de calcul est engendrée depuis la tournée de l’élève', async () => {
  // Ce qui fait d'une feuille de calcul un écran de logiciel et pas un exercice posé à côté :
  // ses données sont CELLES que l'élève vient de construire en cliquant, dans SON ordre. S'il
  // charge six arrêts, les poids occupent B2 à B7 et le total tombe en B8 ; s'il en charge
  // cinq, tout remonte d'une ligne. La plage se lit sur la grille qu'on a sous les yeux.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ['c4', 'c2', 'c1', 'c6', 'c5', 'c7']; t.quai = ['c3'];
    t.depart = Date.now(); t.arrivee = Date.now();
    t.juge = {}; t.bloque = null; t.valide = null;
    t.grille = { cases: {}, juge: {}, valide: null };
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');

  const g = await pageBo.$$eval(`${zBo} .gr-table tr`, (trs) => trs.slice(1).map((tr, i) => ({
    ligne: i + 1,
    a: tr.children[1] ? tr.children[1].textContent.trim() : '',
    b: tr.children[2] ? tr.children[2].textContent.trim() : '',
    saisie: !!tr.querySelector('[data-gr]'),
  })));
  // Les six arrêts dans l'ordre de l'élève, lignes 2 à 7, puis le total à remplir en ligne 8.
  const noms = g.slice(1, 7).map((x) => x.a).join('|');
  if (noms !== 'Maison Lauze|Épicerie Verdier|Le Comptoir des Halles|Atelier Mazet|Studio Garance|Caveau Pélissier') {
    throw new Error('les lignes ne suivent pas la tournée de l’élève : ' + noms);
  }
  const poids = g.slice(1, 7).map((x) => x.b).join('|');
  if (poids !== '42|24|31|36|19|27') throw new Error('poids ligne par ligne : ' + poids);
  const refs = await pageBo.$$eval(`${zBo} [data-gr]`, (e) => e.map((x) => x.dataset.gr).join(','));
  if (refs !== 'B8,B13,B14,B17,B18,B19') throw new Error('cellules à remplir : ' + refs);
  if (!g[7].saisie) throw new Error('la ligne 8 n’est pas la cellule du poids total');

  // Et la feuille donne les DONNÉES du calcul — distance, vitesse, nombre d'arrêts, temps par
  // arrêt — sans jamais donner les résultats : ce sont les six cellules à remplir (le poids,
  // les trois étapes du temps, l'heure de départ et l'heure d'arrivée).
  const donnees = g.map((x) => `${x.a}=${x.b}`).join(' ; ');
  if (!/Distance du parcours \(km\)=22,1/.test(donnees)) throw new Error('distance : ' + donnees);
  if (!/Vitesse en ville \(km\/h\)=12/.test(donnees)) throw new Error('vitesse : ' + donnees);
  if (!/Nombre d’arrêts=6/.test(donnees)) throw new Error('nombre d’arrêts : ' + donnees);
  if (!/Temps par arrêt \(min\)=6/.test(donnees)) throw new Error('temps par arrêt : ' + donnees);
});

await v('ENT-3.1 : les formules justes sont acceptées, et le résultat s’affiche en direct', async () => {
  // Les formules qu'on attend d'un élève, et leurs résultats écrits ici à la main : 179 kg,
  // 1,84 h de route (22,1 km ÷ 12 km/h), 110,5 min (× 60), 36 min d'arrêts (6 × 6), un départ
  // à 13 h 00, et l'arrivée à la gare : 780 + 110,5 + 36 = 926,5 min, soit 15 h 27.
  const formules = { B8: '=SOMME(B2:B7)', B13: '=B11/B12', B14: '=B13*60', B17: '=B15*B16',
    B18: '13:00', B19: '=B18+B14+B17' };
  for (const [ref, f] of Object.entries(formules)) {
    await pageBo.fill(`${zBo} [data-gr="${ref}"]`, f);
    await pageBo.waitForTimeout(40);
  }
  // Le résultat s'affiche à côté de la formule, en direct, SANS avoir à valider : c'est ce qui
  // permet à l'élève de voir ce que son calcul produit pendant qu'il l'écrit.
  const res = await pageBo.$$eval(`${zBo} [data-gr-res]`, (e) => e.map((x) => x.textContent.trim()).join('|'));
  if (res !== '179|1,84|110,5|36|13 h 00|15 h 27') throw new Error('résultats affichés : ' + res);

  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  const t = await texteBo();
  if (!/Toutes les formules sont justes/.test(t)) throw new Error('les formules ne sont pas acceptées : ' + t.slice(-400));
  const justes = await pageBo.$$eval(`${zBo} .gr-saisie input.juste`, (e) => e.length);
  if (justes !== 6) throw new Error(justes + ' cellule(s) juste(s) au lieu de 6');
  // L'état vit dans la base de l'élève, cloisonné dans celui de la tournée : il retrouvera ses
  // formules la semaine suivante.
  const enBase = await pageBo.evaluate(() => window.__bo.db.transport['boost-ent31'].tournee.grille.cases);
  if (enBase.B8 !== '=SOMME(B2:B7)') throw new Error('les formules ne sont pas enregistrées : ' + JSON.stringify(enBase));
});

await v('ENT-3.1 : un nombre tapé à la main est refusé, même quand il est juste', async () => {
  // Le cœur du chantier. Un élève qui calcule de tête et tape « 179 » a trouvé le bon nombre
  // sans faire le travail demandé — et c'est le travail demandé qui est la compétence. Le
  // message doit le lui dire autrement que « faux », parce qu'il n'a pas faux.
  await pageBo.fill(`${zBo} [data-gr="B8"]`, '179');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  let t = await texteBo();
  if (/Toutes les formules sont justes/.test(t)) throw new Error('un nombre tapé à la main est accepté');
  if (!/écrivez une formule/.test(t)) throw new Error('le refus ne dit pas ce qui manque : ' + t.slice(-400));
  if (!/tapé à la main/.test(t)) throw new Error('le bilan ne distingue pas le nombre tapé du résultat faux : ' + t.slice(-400));
  // Le jalon « formules » le dit aussi : une formule fausse n'est pas du travail manquant.
  if ((await jalonsBo()).formules !== 'ko') throw new Error('jalon formules avec un nombre tapé : ' + (await jalonsBo()).formules);

  // Une formule juste mais qui ne tombe pas sur la bonne valeur, c'est « à revoir », pas la
  // même chose : les deux verdicts ne doivent pas se confondre.
  await pageBo.fill(`${zBo} [data-gr="B8"]`, '=SOMME(B2:B6)');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  t = await texteBo();
  if (/écrivez une formule/.test(t)) throw new Error('une formule juste est prise pour un nombre tapé');
  if (!/à revoir/.test(t)) throw new Error('une plage trop courte est acceptée : ' + t.slice(-400));

  // Et une formule mal écrite est signalée comme telle, pas comme un résultat faux.
  await pageBo.fill(`${zBo} [data-gr="B8"]`, '=SOMM(B2:B7)');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  t = await texteBo();
  if (!/formule mal écrite/.test(t)) throw new Error('une fonction inconnue n’est pas signalée : ' + t.slice(-400));

  await pageBo.fill(`${zBo} [data-gr="B8"]`, '=SOMME(B2:B7)');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  if ((await jalonsBo()).formules !== 'ok') throw new Error('jalon formules avec toutes les formules justes : ' + (await jalonsBo()).formules);
});

await v('feuille de calcul : désigner une cellule à la souris écrit sa référence', async () => {
  // Tristan, le 04/10 : *« il ne reproduit pas le clic ou le clic glissé pour sélectionner les
  // cellules »*. C'est le geste d'Excel, et c'est comme ça qu'on apprend ce qu'est une plage :
  // on la montre, on ne l'épelle pas. Trois gestes, plus deux règles qui disent QUAND ils
  // s'arment — ces deux-là sont sorties en pilotant l'écran à la souris, pas d'une relecture.
  const champ = `${zBo} [data-gr="B8"]`;
  const val = () => pageBo.inputValue(champ);
  // Le message flottant du test précédent reste 2,6 s en bas de l'écran, pile là où tombent les
  // cellules de la feuille : un clic de souris brut atterrissait DESSUS et ne faisait rien. On
  // le retire plutôt que d'attendre — et c'est aussi ce qui rend ce cas rapide.
  await pageBo.evaluate(() => { const t = document.getElementById('toast'); if (t) t.remove(); });
  const centre = async (ref) => {
    const el = pageBo.locator(`${zBo} .gr-table [data-ref="${ref}"]`);
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const cliquer = async (ref, maj) => {
    const p = await centre(ref);
    if (maj) await pageBo.keyboard.down('Shift');
    await pageBo.mouse.move(p.x, p.y);
    await pageBo.mouse.down();
    await pageBo.mouse.up();
    if (maj) await pageBo.keyboard.up('Shift');
    await pageBo.waitForTimeout(90);
  };
  const ouvrirFormule = async (texte) => {
    await pageBo.fill(champ, texte);
    await pageBo.click(champ);
    await pageBo.keyboard.press('End');
    await pageBo.waitForTimeout(60);
  };

  // ── Le clic simple insère la référence de la cellule désignée.
  await ouvrirFormule('=');
  await cliquer('B4');
  if (await val() !== '=B4') throw new Error('clic simple : ' + await val());

  // ── Le clic glissé suit la souris et écrit UNE plage, pas six références empilées.
  await ouvrirFormule('=SOMME(');
  const d = await centre('B2');
  await pageBo.mouse.move(d.x, d.y);
  await pageBo.mouse.down();
  for (const r of ['B3', 'B4', 'B5', 'B6', 'B7']) {
    const p = await centre(r);
    await pageBo.mouse.move(p.x, p.y);
    await pageBo.waitForTimeout(25);
  }
  await pageBo.mouse.up();
  await pageBo.waitForTimeout(100);
  if (await val() !== '=SOMME(B2:B7') throw new Error('clic glissé : ' + await val());
  // Et la plage obtenue est la bonne : refermée, elle vaut les 179 kg des six commandes.
  await pageBo.keyboard.type(')');
  await pageBo.waitForTimeout(140);
  const res = await pageBo.textContent(`${zBo} [data-gr-res="B8"]`);
  if (res.trim() !== '179') throw new Error('la plage désignée ne vaut pas 179 : ' + res);

  // ── Maj-clic étend la dernière référence posée, sans en empiler une seconde.
  await ouvrirFormule('=SOMME(');
  await cliquer('B2');
  await cliquer('B5', true);
  if (await val() !== '=SOMME(B2:B5') throw new Error('Maj-clic : ' + await val());

  // ── Un glissement de bas en haut s'écrit quand même à l'endroit : « B2:B7 », jamais
  // « B7:B2 ». C'est ce que l'élève doit lire et réécrire ensuite tout seul.
  await ouvrirFormule('=SOMME(');
  await cliquer('B7');
  await cliquer('B3', true);
  if (await val() !== '=SOMME(B3:B7') throw new Error('plage à l’envers non remise à l’endroit : ' + await val());

  // ── La référence s'insère AU CURSEUR, pas à la fin : l'élève qui reprend le début de sa
  // formule ne doit pas voir sa cellule atterrir tout au bout.
  await pageBo.fill(champ, '=+100');
  await pageBo.click(champ);
  await pageBo.evaluate((sel) => {
    const e = document.querySelector(sel);
    e.setSelectionRange(1, 1);
    e.dispatchEvent(new Event('select'));
  }, champ);
  await cliquer('B3');
  if (await val() !== '=B3+100') throw new Error('insertion ailleurs qu’au curseur : ' + await val());

  await pageBo.fill(champ, '=SOMME(B2:B7)');
  await pageBo.waitForTimeout(80);
});

await v('feuille de calcul : le pointage se tait quand la formule n’attend pas de référence', async () => {
  // Les deux pièges d'une cellule cliquable, trouvés en pilotant la souris. Sans ces deux
  // règles, l'élève récolte des références dont il n'a rien demandé et ne comprend pas d'où
  // elles sortent — ce qui est pire que l'absence du geste.
  const champ = `${zBo} [data-gr="B8"]`;
  await pageBo.evaluate(() => { const t = document.getElementById('toast'); if (t) t.remove(); });
  const centre = async (ref) => {
    const el = pageBo.locator(`${zBo} .gr-table [data-ref="${ref}"]`);
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };

  // 1. Hors formule, une cellule cliquée reste une cellule cliquée.
  await pageBo.fill(champ, '179');
  await pageBo.click(champ);
  const p4 = await centre('B4');
  await pageBo.mouse.click(p4.x, p4.y);
  await pageBo.waitForTimeout(100);
  if (await pageBo.inputValue(champ) !== '179') {
    throw new Error('un clic insère une référence hors formule : ' + await pageBo.inputValue(champ));
  }

  // 2. Sur une formule TERMINÉE, le clic ne vient pas la polluer : l'élève qui a fini et qui
  //    clique la cellule suivante veut y aller, pas y faire référence.
  await pageBo.fill(champ, '=SOMME(B2:B7)');
  await pageBo.click(champ);
  await pageBo.keyboard.press('End');
  await pageBo.mouse.click(p4.x, p4.y);
  await pageBo.waitForTimeout(100);
  if (await pageBo.inputValue(champ) !== '=SOMME(B2:B7)') {
    throw new Error('une formule finie est polluée par un clic : ' + await pageBo.inputValue(champ));
  }

  // 3. Cliquer DANS son propre champ pour y poser le curseur n'insère pas sa propre référence.
  await pageBo.fill(champ, '=SOMME(');
  await pageBo.click(champ);
  await pageBo.waitForTimeout(100);
  if (await pageBo.inputValue(champ) !== '=SOMME(') {
    throw new Error('le champ s’auto-référence quand on y clique : ' + await pageBo.inputValue(champ));
  }

  await pageBo.fill(champ, '=SOMME(B2:B7)');
  await pageBo.waitForTimeout(80);
});

await v('ENT-3.1 : l’élève pose lui-même le départ et l’arrivée, et ils comptent dans le trajet', async () => {
  // Tristan, le 04/10 : *« l'élève ne sélectionne ni le départ (entrepôt Boost) ni l'arrivée
  // (la gare) »*. Ils étaient dessinés et comptés, mais jamais touchés : on pouvait finir la
  // séance sans voir que la tournée part de Carémeau et finit à la gare, alors que ces deux
  // trajets font une bonne part des kilomètres à calculer.
  const poser = async (ordre, depart, arrivee) => {
    await pageBo.evaluate((o) => {
      const t = window.__bo.db.transport['boost-ent31'].tournee;
      t.ordre = o.ordre; t.quai = ['c3'];
      t.depart = o.depart ? Date.now() : null;
      t.arrivee = o.arrivee ? Date.now() : null;
      t.juge = {}; t.bloque = null; t.valide = null;
    }, { ordre, depart, arrivee });
    await ouvrirBo('plan');
    await ouvrirBo('tournee');
    return bilanBo();
  };

  // Les trois longueurs, écrites ici à la main. 22,1 km la chaîne complète ; sans la gare il
  // manque le retour, sans l'entrepôt il manque l'aller. Les deux bouts pèsent 3,8 km à eux
  // seuls — c'est précisément ce que l'élève ne voyait pas.
  const complet = await poser(ORDRE31, true, true);
  if (complet.km !== 22.1) throw new Error('chaîne complète : ' + complet.km + ' km au lieu de 22,1');
  if (!complet.arrivee) throw new Error('pas d’heure de retour sur une chaîne complète');

  const sansGare = await poser(ORDRE31, true, false);
  if (sansGare.km >= complet.km) throw new Error('retirer la gare ne raccourcit pas le trajet : ' + sansGare.km);

  const sansRien = await poser(ORDRE31, false, false);
  if (sansRien.km >= sansGare.km) throw new Error('retirer l’entrepôt ne raccourcit pas le trajet : ' + sansRien.km);

  // Et la carte le montre : un bout pas encore posé est dessiné en creux, comme un arrêt resté
  // à quai — même signe pour le même sens.
  const dessin = await pageBo.evaluate(() => ({
    departVide: !!document.querySelector('#boost31 .plan-depart.plan-bout-vide'),
    arriveeVide: !!document.querySelector('#boost31 .plan-arrivee.plan-bout-vide'),
    pastilles: [...document.querySelectorAll('#boost31 .plan-depart .plan-pt-ordre, #boost31 .plan-arrivee .plan-pt-ordre')].length,
  }));
  if (!dessin.departVide || !dessin.arriveeVide) throw new Error('un bout non posé est dessiné comme posé : ' + JSON.stringify(dessin));
  if (dessin.pastilles) throw new Error('un bout non posé porte une pastille de tournée');

  // Posés, ils prennent leur pastille menthe « D » et « A » : la chaîne se lit D → 1 … → A.
  await poser(ORDRE31, true, true);
  const lettres = await pageBo.evaluate(() => [...document.querySelectorAll(
    '#boost31 .plan-depart .plan-pt-ordre text, #boost31 .plan-arrivee .plan-pt-ordre text')]
    .map((t) => t.textContent.trim()).join(','));
  if (lettres !== 'D,A') throw new Error('pastilles des deux bouts : ' + lettres);
});

await v('ENT-3.1 : oublier la gare ne doit pas devenir une façon d’attraper le train', async () => {
  // Le trou que ce chantier aurait pu ouvrir, et la raison pour laquelle le report doit refuser
  // une chaîne incomplète. C'est la troisième fois que le même piège se présente sur cette
  // séance : « il suffit de garder les 6 premières », puis les cases identiques quel que soit
  // l'ordre, et maintenant le retour qu'on n'a pas placé.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    // L'ordre de la fiche : complet il rentre à 16 h 19, NEUF MINUTES APRÈS le train.
    t.ordre = ['c1', 'c2', 'c4', 'c5', 'c6', 'c7']; t.quai = ['c3'];
    t.depart = Date.now(); t.arrivee = null;        // la gare n'est pas placée
    t.juge = {}; t.bloque = null; t.valide = null;
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');

  // Sans le retour vers la gare, le modèle dit que le train est attrapé : c'est bien une
  // tricherie praticable, et c'est pour ça qu'elle doit être refusée ailleurs.
  const b = await bilanBo();
  if (b.enRetard) throw new Error('test invalide : la chaîne incomplète est déjà en retard, il n’y a rien à refuser');

  for (const [id, val] of Object.entries({ total: '237', trop: '57' })) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(200);
  const t = await texteBo();
  if (!/ne tient pas encore/.test(t)) throw new Error('le report est accepté avec une chaîne incomplète : ' + t.slice(-400));
  if (!/arrivée n’est pas placée/.test(t)) throw new Error('le refus ne dit pas ce qui manque : ' + t.slice(-400));
  const justes = await pageBo.$$eval(`${zBo} .tour-saisie input.juste`, (e) => e.length);
  if (justes) throw new Error(justes + ' case(s) déclarée(s) justes avec une chaîne incomplète');
  const j = await jalonsBo();
  if (j.report === 'ok') throw new Error('le jalon report est validé avec une chaîne incomplète');
});

await v('ENT-3.1 : vert = l’ordre, bleu = le client — sur la carte ET dans la liste', async () => {
  // Relevé par Tristan le 04/10, capture à l'appui : *« le jeu de couleur est inversé, le vert
  // doit signifier l'ordre de la tournée, le bleu l'emplacement physique de la boutique »*. La
  // carte disait vert = ordre, la liste disait l'inverse — et les deux écrans se contredisaient
  // sur la seule chose que ce chantier devait rendre univoque.
  //
  // Ce cas tient les DEUX écrans ensemble. Un test qui n'en regarderait qu'un laisserait
  // repartir l'incohérence au premier coup de pinceau.
  const c = await pageBo.evaluate(() => {
    const rgb = (s) => String(s || '').replace(/\s/g, '');
    const lu = (el, prop) => (el ? rgb(getComputedStyle(el)[prop]) : 'absent');
    const page = document.querySelector('#boost31 .ent-page');
    const vari = (v) => rgb(getComputedStyle(page).getPropertyValue(v));
    return {
      vert: vari('--vert'), bleu: vari('--ardoise-fond'),
      carteClient: lu(document.querySelector('#boost31 .plan-pt circle'), 'fill'),
      carteOrdre: lu(document.querySelector('#boost31 .plan-pt-ordre circle'), 'fill'),
      // Dans le RÉCAPITULATIF, pas dans les lignes de départ/arrivée qui le précèdent : leurs
      // étiquettes ne portent ni l'une ni l'autre des deux encres, et les lire ici ferait
      // passer ce cas pour vert quoi qu'il arrive.
      listeOrdre: lu(document.querySelector('#boost31 #tourListe .tour-rang'), 'backgroundColor'),
      listeClient: lu(document.querySelector('#boost31 #tourListe .tour-num'), 'color'),
    };
  });
  // Les deux couleurs de la charte de Boost, écrites ici à la main.
  if (c.vert !== '#25c998' && c.vert !== 'rgb(37,201,152)') throw new Error('--vert : ' + c.vert);
  if (c.bleu !== '#345cfd' && c.bleu !== 'rgb(52,92,253)') throw new Error('--ardoise-fond : ' + c.bleu);
  const VERT = 'rgb(37,201,152)';
  const BLEU = 'rgb(52,92,253)';
  if (c.carteOrdre !== VERT) throw new Error('carte, pastille d’ordre : ' + c.carteOrdre + ' au lieu du vert');
  if (c.carteClient !== BLEU) throw new Error('carte, rond du client : ' + c.carteClient + ' au lieu du bleu');
  if (c.listeOrdre !== VERT) throw new Error('liste, pastille d’ordre : ' + c.listeOrdre + ' au lieu du vert');
  if (c.listeClient !== BLEU) throw new Error('liste, numéro du client : ' + c.listeClient + ' au lieu du bleu');
});

await v('formules : une heure se tape « 13:00 » ou « 13h00 » et vaut des minutes', async () => {
  // Demandé par Tristan le 05/10 : l'élève entre l'heure de départ, puis y AJOUTE le temps de
  // route en minutes. Une heure vaut donc des minutes depuis minuit (13 h 00 = 780). Les valeurs
  // sont écrites ici à la main.
  const r = await pageBo.evaluate(async () => {
    const F = await import('/core/formules.js');
    return {
      a: F.heureFr('13:00'), b: F.heureFr('13h05'), c: F.heureFr('13 h 05'), d: F.heureFr('13h'),
      nu: F.heureFr('13'), tard: F.heureFr('25:00'), min: F.heureFr('12:75'), texte: F.heureFr('Arrêt'),
      somme: F.evaluerGrille({ B1: '13:00', B2: '110,5', B3: '36', B4: '=B1+B2+B3' }).valeurs.B4,
      fmt: F.formaterHeure(926.5), fmt2: F.formaterHeure(970), fmt3: F.formaterHeure(785),
      aff: F.afficher('B4', F.evaluerGrille({ B4: '=13*60+5' }), 1, 'heure'),
    };
  });
  const attendu = { a: 780, b: 785, c: 785, d: 780, nu: null, tard: null, min: null, texte: null,
    somme: 926.5, fmt: '15 h 27', fmt2: '16 h 10', fmt3: '13 h 05', aff: '13 h 05' };
  for (const [k, val] of Object.entries(attendu)) {
    if (r[k] !== val) throw new Error(`${k} : ${r[k]} au lieu de ${val}`);
  }
});

// ── Les états posés à la main pour les cas de la feuille de calcul : six arrêts qui tiennent,
// ou les sept qui ne tiennent pas. Les adresses suivent le nombre d'arrêts (voir plus haut).
const poserGrille = async (ordre, quai, cases) => {
  await pageBo.evaluate((o) => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = o.ordre; t.quai = o.quai;
    t.depart = Date.now(); t.arrivee = Date.now();
    t.report = {}; t.juge = {}; t.bloque = null; t.valide = null;
    t.grille = { cases: o.cases || {}, juge: {}, valide: null };
  }, { ordre, quai, cases });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
};
const SIX = ['c4', 'c2', 'c1', 'c6', 'c5', 'c7'];
const FORM6 = { B8: '=SOMME(B2:B7)', B13: '=B11/B12', B14: '=B13*60', B17: '=B15*B16',
  B18: '13:00', B19: '=B18+B14+B17' };
const SEPT = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
const FORM7 = { B9: '=SOMME(B2:B8)', B14: '=B12/B13', B15: '=B14*60', B18: '=B16*B17',
  B19: '13:00', B20: '=B19+B15+B18' };

await v('ENT-3.1 : les étapes et les résultats ont chacun leur surbrillance, et les contraintes sont dans la feuille', async () => {
  // Tristan, le 05/10 : *« une surbrillance différente pour distinguer les étapes et les
  // résultats (poids total chargé) et heure d'arrivée »*. On mesure les couleurs RENDUES, pas
  // les noms de classes : une classe sans règle CSS passerait un test de classes.
  await poserGrille(SIX, ['c3']);
  const fond = await pageBo.$$eval(`${zBo} .gr-table tbody tr`, (trs) => trs.map((tr) => ({
    a: tr.children[1] ? tr.children[1].textContent.replace(/\s+/g, ' ').trim() : '',
    bg: tr.children[2] ? getComputedStyle(tr.children[2]).backgroundColor : '',
  })));
  const de = (re) => {
    const l = fond.find((x) => re.test(x.a));
    if (!l) throw new Error('ligne introuvable : ' + re + ' dans ' + fond.map((x) => x.a).join(' | '));
    return l.bg;
  };
  const e1 = de(/^Étape 1/), e2 = de(/^Étape 2/), e3 = de(/^Étape 3/);
  const poids = de(/^Poids total chargé/), arrivee = de(/^Heure d’arrivée/);
  const depart = de(/^Heure de départ/), fixe = de(/^Distance du parcours/);
  if (e1 !== e2 || e2 !== e3) throw new Error('les trois étapes n’ont pas la même surbrillance : ' + [e1, e2, e3]);
  if (poids !== arrivee) throw new Error('les deux résultats n’ont pas la même surbrillance : ' + [poids, arrivee]);
  if (e1 === poids) throw new Error('une étape et un résultat ont la même surbrillance : ' + e1);
  if (e1 === depart || poids === depart) throw new Error('l’heure de départ se confond avec une étape ou un résultat');
  if (e1 === fixe || poids === fixe) throw new Error('une donnée fixe se confond avec une étape ou un résultat');

  // Les explications sont SOUS les libellés, là où l'élève cherche : la formule distance ÷
  // vitesse avec ses unités, puis la conversion en minutes.
  const t = await pageBo.$eval(`${zBo} .gr-table`, (e) => e.textContent.replace(/\s+/g, ' '));
  if (!/Distance \(km\) ÷ vitesse \(km\/h\) = temps \(h\)/.test(t)) throw new Error('l’étape 1 n’est pas expliquée : ' + t);
  if (!/1 heure = 60 minutes/.test(t)) throw new Error('la conversion en minutes n’est pas expliquée : ' + t);
  if (!/Heure de départ \+ temps de route \(min\) \+ temps aux arrêts \(min\)/.test(t)) throw new Error('l’heure d’arrivée n’est pas expliquée');
  // Les deux contraintes figurent aussi dans la feuille, pour la comparaison.
  if (!/Charge utile maximale \(kg\)\s*180/.test(t)) throw new Error('la charge maximale n’est pas dans la feuille : ' + t);
  if (!/Départ du train \(contrainte\)\s*16 h 10/.test(t)) throw new Error('le train n’est pas dans la feuille : ' + t);
  // La légende dit ce que les couleurs veulent dire.
  const leg = await pageBo.$eval(`${zBo} .gr-legende`, (e) => e.textContent.replace(/\s+/g, ' '));
  if (!/Étape du calcul/.test(leg) || !/Résultat à comparer/.test(leg)) throw new Error('légende : ' + leg);

  // Les contraintes sont DANS le bloc de la feuille, à sa droite — et plus au-dessus.
  const place = await pageBo.evaluate((z) => {
    const racine = document.querySelector(z);
    const droite = racine.querySelector('.gr-bloc .gr-droite');
    const gauche = racine.querySelector('.gr-bloc .gr-gauche .gr-table');
    const haut = racine.querySelector('.tour-grille .tour-jauge');
    if (!droite || !gauche) return { ok: false };
    const a = gauche.getBoundingClientRect(), b = droite.getBoundingClientRect();
    return { ok: true, aDroite: b.left >= a.right - 1, jauges: droite.querySelectorAll('.tour-jauge').length, haut: !!haut };
  }, zBo);
  if (!place.ok) throw new Error('les contraintes ne sont pas dans le bloc de la feuille');
  if (!place.aDroite) throw new Error('les contraintes ne sont pas à droite de la feuille');
  if (place.jauges < 3) throw new Error(place.jauges + ' jauge(s) à droite de la feuille');
  if (place.haut) throw new Error('des jauges restent au-dessus de la feuille');
});

await v('ENT-3.1 : des formules justes avec une tournée qui ne tient pas — le calcul est vert, la contrainte est rouge', async () => {
  // Le cas qui a motivé la demande : un élève charge les sept commandes (237 kg pour 180), écrit
  // des formules PARFAITES, et doit voir d'un coup d'œil que son calcul est bon et que c'est sa
  // tournée qui ne passe pas. Les adresses suivent : sept arrêts, donc le total tombe en B9.
  await poserGrille(SEPT, [], FORM7);
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(220);
  const t = await texteBo();
  if (!/Toutes les formules sont justes/.test(t)) throw new Error('les formules sept arrêts ne sont pas acceptées : ' + t.slice(-500));
  const justes = await pageBo.$$eval(`${zBo} .gr-saisie input.juste`, (e) => e.length);
  if (justes !== 6) throw new Error(justes + ' cellule(s) en vert au lieu de 6');
  // À droite, la charge est en rouge — et la carte de la charge ne dit PAS de combien.
  const droite = await pageBo.$$eval(`${zBo} .gr-droite .tour-jauge`, (els) => els.map((e) => ({
    trop: e.classList.contains('trop'), txt: e.textContent.replace(/\s+/g, ' ').trim() })));
  const charge = droite.find((x) => /Charge du vélo-cargo/.test(x.txt));
  if (!charge || !charge.trop) throw new Error('la charge dépassée n’est pas en rouge : ' + JSON.stringify(droite));
  if (!/dépassée/.test(charge.txt)) throw new Error('la carte ne dit pas que la limite est franchie : ' + charge.txt);
  const fuite = droite.map((x) => x.txt).join(' ');
  if (/\b(237|57)\b/.test(fuite)) throw new Error('la colonne de droite laisse filer un total : ' + fuite);
  if (/dépassée de/.test(fuite)) throw new Error('la colonne de droite donne l’écart : ' + fuite);
  // Et le message qui relie les deux : le calcul est bon, c'est la tournée qui est à revoir.
  const av = await pageBo.$$eval(`${zBo} .avis-contrainte`, (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  if (av.length !== 1 || !/Vos formules sont justes, mais la tournée ne respecte pas/.test(av[0])) {
    throw new Error('message manquant : ' + JSON.stringify(av));
  }
  // Le vert et le rouge ne se mélangent pas : une cellule juste n'est jamais rouge.
  const mele = await pageBo.$$eval(`${zBo} .gr-saisie input.juste.faux`, (e) => e.length);
  if (mele) throw new Error('une cellule est à la fois juste et fausse');

  // Retirer un arrêt change les données sous les formules : le verdict périmé disparaît, avec
  // son message. Sans ça, « juste » restait affiché sur un total devenu faux.
  await pageBo.click(`${zBo} [data-quai="c3"]`);
  await pageBo.waitForTimeout(220);
  const reste = await pageBo.evaluate((z) => ({
    justes: document.querySelectorAll(`${z} .gr-saisie input.juste`).length,
    avis: document.querySelectorAll(`${z} .avis-contrainte`).length,
    base: Object.keys(window.__bo.db.transport['boost-ent31'].tournee.grille.juge || {}).length,
  }), zBo);
  if (reste.justes || reste.avis || reste.base) throw new Error('le verdict de la feuille survit à un changement de tournée : ' + JSON.stringify(reste));
});

await v('ENT-3.1 : une tournée qui tient et des formules justes — la contrainte est verte, sans message d’alerte', async () => {
  await poserGrille(SIX, ['c3'], FORM6);
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(220);
  const t = await texteBo();
  if (!/Toutes les formules sont justes/.test(t)) throw new Error('formules six arrêts : ' + t.slice(-400));
  const trop = await pageBo.$$eval(`${zBo} .gr-droite .tour-jauge.trop`, (e) => e.length);
  if (trop) throw new Error(trop + ' contrainte(s) en rouge alors que la tournée tient');
  const ok = await pageBo.$$eval(`${zBo} .gr-droite .pastille.ok`, (e) => e.map((x) => x.textContent.trim()).join('|'));
  if (ok !== 'limite respectée|horaire tenu') throw new Error('pastilles vertes : ' + ok);
  if (await pageBo.$$eval(`${zBo} .avis-contrainte`, (e) => e.length)) throw new Error('un message d’alerte alors que tout tient');
});

await v('ENT-3.1 : l’heure de départ se tape « 13h00 » ou « 13:00 », et « 13 » est refusé', async () => {
  await poserGrille(SIX, ['c3'], Object.assign({}, FORM6, { B18: '13' }));
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  let faux = await pageBo.$$eval(`${zBo} .gr-saisie input.faux`, (e) => e.map((x) => x.dataset.gr).join(','));
  // « 13 » ne dit pas si c'est 13 minutes ou 13 heures : la cellule est à revoir, et c'est la
  // SEULE — l'heure d'arrivée, calculée depuis un 13, est fausse elle aussi, ce qui est normal.
  if (!/B18/.test(faux)) throw new Error('« 13 » est accepté comme heure de départ : ' + faux);
  await pageBo.fill(`${zBo} [data-gr="B18"]`, '13h00');
  await pageBo.waitForTimeout(60);
  const res = await pageBo.textContent(`${zBo} [data-gr-res="B19"]`);
  if (res.trim() !== '15 h 27') throw new Error('« 13h00 » ne donne pas 15 h 27 : ' + res);
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  faux = await pageBo.$$eval(`${zBo} .gr-saisie input.faux`, (e) => e.length);
  if (faux) throw new Error(faux + ' cellule(s) fausses avec « 13h00 »');
  // Un départ tapé à 14:00 donne une arrivée plus tard : la formule reste JUSTE comme formule,
  // mais l'heure de départ n'est pas celle de la consigne.
  await pageBo.fill(`${zBo} [data-gr="B18"]`, '14:00');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  faux = await pageBo.$$eval(`${zBo} .gr-saisie input.faux`, (e) => e.map((x) => x.dataset.gr).join(','));
  if (!/B18/.test(faux)) throw new Error('un départ à 14:00 est accepté : ' + faux);
});

await v('ENT-3.1 : les jauges ne donnent plus les totaux, et les rendent après validation', async () => {
  // La décision qui décide de tout : si la jauge affiche « 179 / 180 kg », l'élève le recopie
  // et la feuille de calcul ne sert à rien — exactement le défaut relevé par Tristan le 03/10
  // sur les cases de report, d'un cran plus haut.
  // On repart de la tournée qui tient, chaîne complète : les cas précédents ont laissé des
  // états volontairement bancals, et ce cas-ci parle des CHIFFRES, pas de l'organisation.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ['c4', 'c2', 'c1', 'c6', 'c5', 'c7']; t.quai = ['c3'];
    t.depart = Date.now(); t.arrivee = Date.now();
    t.report = {}; t.juge = {}; t.bloque = null; t.valide = null;
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');

  const lire = async () => (await pageBo.$$eval(`${zBo} .tour-jauges`, (e) => e[0].textContent.replace(/\s+/g, ' ')))[0] === undefined
    ? '' : (await pageBo.$$eval(`${zBo} .tour-jauges`, (e) => e[0].textContent.replace(/\s+/g, ' ').trim()));

  let j = await lire();
  if (!/max 180 kg/.test(j)) throw new Error('la jauge de charge n’annonce pas sa limite : ' + j);
  if (/179/.test(j)) throw new Error('la jauge donne le poids total : ' + j);
  if (/15 h 27|147 min/.test(j)) throw new Error('la jauge donne l’heure de retour ou le temps total : ' + j);
  // Ce qu'elle CONTINUE de donner : la limite. Les données du calcul (distance, vitesse, temps
  // par arrêt) sont passées dans la feuille de calcul, à gauche, et ne sont plus répétées ici.
  if (!/16 h 10/.test(j)) throw new Error('le train n’est plus annoncé : ' + j);
  const feuille = await pageBo.$eval(`${zBo} .gr-table`, (e) => e.textContent.replace(/\s+/g, ' '));
  if (!/Distance du parcours \(km\)\s*22,1/.test(feuille)) throw new Error('la distance n’est plus donnée : ' + feuille);
  if (!/Temps par arrêt \(min\)\s*6/.test(feuille)) throw new Error('le temps par arrêt n’est plus donné : ' + feuille);
  // Une mesure SANS plafond n'est pas un repère de limite : elle garde son total, sinon on
  // enverrait l'élève calculer un nombre que personne ne lui demande.
  if (!/21 colis/.test(j)) throw new Error('les colis, sans plafond, ont été rendus muets : ' + j);

  // Le travail fait, le chiffre revient : c'est le retour, et il n'a plus rien à donner.
  for (const [id, val] of Object.entries({ total: '237', trop: '57' })) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(220);
  j = await lire();
  if (!/179 \/ 180 kg/.test(j)) throw new Error('la jauge ne rend pas le total après validation : ' + j);
  if (!/15 h 27/.test(j)) throw new Error('l’heure de retour n’est pas rendue après validation : ' + j);

  // Et elle se retait dès que l'élève touche à sa tournée : une validation ancienne ne doit
  // pas dévoiler les totaux d'une tournée qui a changé.
  await pageBo.click(`${zBo} [data-bas="0"]`);
  await pageBo.waitForTimeout(200);
  j = await lire();
  if (/179 \/ 180 kg|15 h 2/.test(j)) throw new Error('les jauges restent dévoilées après un changement d’ordre : ' + j);
  if (!/max 180 kg/.test(j)) throw new Error('les jauges ne redeviennent pas des repères : ' + j);
  // Et l'horodatage de la validation part avec elle. L'écran est déjà protégé par la règle de
  // dévoilement, qui exige une correction EN COURS ; mais laisser un `valide` derrière soi
  // ferait écrire au suivi qu'une tournée a été validée à une heure où ce n'était plus vrai.
  const reste = await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    return { valide: t.valide, juges: Object.keys(t.juge || {}).length };
  });
  if (reste.valide) throw new Error('la validation survit à un changement d’ordre : ' + reste.valide);
  if (reste.juges) throw new Error('la correction survit à un changement d’ordre');
});

await v('ENT-3.1 : laisser deux commandes à quai reste une sortie de secours praticable', async () => {
  // Décision du calibrage : l'élève en difficulté peut laisser DEUX clients à quai et tenir
  // l'horaire largement. Le jalon « choix » le dit faux, mais il n'est pas bloqué.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ['c4', 'c2', 'c1', 'c6', 'c7'];
    t.quai = ['c3', 'c5'];
    t.depart = Date.now(); t.arrivee = Date.now();
    t.juge = {}; t.bloque = null;
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
  const t = await texteBo();
  if (/manqué/.test(t)) throw new Error('deux clients à quai et le train est encore manqué : ' + t.slice(0, 400));
  const bDeux = await bilanBo();
  if (bDeux.arrivee !== '15 h 10') throw new Error('retour calculé à ' + bDeux.arrivee + ' au lieu de 15 h 10');
  if (/15 h 10/.test(t)) throw new Error('l’écran donne l’heure de retour : ' + t.slice(0, 400));
  const j = await jalonsBo();
  if (j.horaire !== 'ok' || j.charge !== 'ok') throw new Error('horaire ou charge en faute : ' + JSON.stringify(j));
  if (j.choix !== 'ko') throw new Error('deux clients à quai sont comptés comme le bon choix');
});

await v('ENT-3.1 : le mode hors connexion donne le quartier, et le suivi garde la trace', async () => {
  // Nouvelle base : on refait le parcours depuis zéro pour éprouver le mode hors connexion et la
  // porte de sortie sans défaire le travail déjà vérifié.
  await pageBo.evaluate(async () => {
    const act = await import('/activites/boost-tournee.js');
    const hote = document.createElement('div');
    hote.id = 'boost31b';
    document.body.appendChild(hote);
    const db = {}; const suivi = [];
    act.rendre(hote, {
      meta: Object.assign({}, act.meta, { id: 'boost-tournee-b' }),
      profil: { prenom: 'Theo', nom: 'Martin', role: 'eleve' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: (r) => suivi.push(r),
      quitter: () => {}, codeStock: 'ABC',
    });
    window.__bo2 = { db, suivi };
  });
  const z2 = '#boost31b .ent-main';
  await pageBo.click('#boost31b .ent-nav[data-vue="plan"]');
  await pageBo.waitForTimeout(140);
  // Il n'est PAS proposé dans la vue, et il n'y est pas non plus annoncé : un élève bloqué
  // demande à son enseignant, qui sait si les postes de la salle laissent passer les plans
  // en ligne. C'est tout l'objet du déplacement du 03/10.
  if (await pageBo.$$eval(`${z2} [data-plan-secours]`, (e) => e.length)) {
    throw new Error('le mode hors connexion est proposé dans la vue plan');
  }
  const vu = await pageBo.textContent(z2);
  if (/hors connexion/i.test(vu)) throw new Error('la vue annonce le mode hors connexion : ' + vu.slice(0, 200));
  await pageBo.click('#boost31b [data-hors-connexion]');
  await pageBo.waitForTimeout(140);
  // Les menus sont remplis ET verrouillés : le filet donne le quartier, pas la case.
  const zones = await pageBo.$$eval(`${z2} .plan-quartier`, (e) => e.map((x) => x.value + (x.disabled ? '' : '!')));
  if (zones.join('|') !== ['Écusson', 'Jardins de la Fontaine', 'Ville Active', 'Saint-Césaire', 'Courbessac', 'Grézan', 'Costières'].join('|')) {
    throw new Error('les quartiers ne sont pas révélés (ou pas verrouillés) : ' + zones.join('|'));
  }
  // Mais PAS les cases : le filet débloque, il ne donne pas la réponse.
  const cases = await pageBo.$$eval(`${z2} .plan-case`, (e) => e.map((x) => x.value));
  if (cases.some((c) => c !== '')) throw new Error('le filet de sécurité a rempli des cases : ' + cases.join('|'));
  const s = await pageBo.evaluate(() => {
    const s = window.__bo2.suivi; return s.length ? JSON.parse(JSON.stringify(s[s.length - 1])) : null;
  });
  // Le recours au mode hors connexion est horodaté, donc visible dans le suivi, sans compter
  // pour une faute.
  if (s.detail.reperage !== 'attente') throw new Error('jalon repérage : ' + s.detail.reperage);
  const trace = await pageBo.evaluate(() => !!window.__bo2.db.transport['boost-ent31'].plan.secours);
  if (!trace) throw new Error('le recours au mode hors connexion n’est pas enregistré dans la base');
});

await v('ENT-3.1 : la porte de sortie débloque sans valider, et le jalon ne ment pas', async () => {
  const z2 = '#boost31b .ent-main';
  // Trois validations infructueuses : la porte n'apparaît qu'ensuite (essaisAvantIssue: 3).
  for (let essai = 1; essai <= 3; essai++) {
    for (const id of Object.keys(CASES31)) await pageBo.fill(`${z2} .plan-case[data-case="${id}"]`, 'A1');
    const avant = await pageBo.$$eval(`${z2} [data-plan-issue]`, (e) => e.length);
    if (essai < 3 && avant) throw new Error('la porte de sortie est offerte dès l’essai ' + essai);
    await pageBo.click(`${z2} [data-plan-valider]`);
    await pageBo.waitForTimeout(140);
  }
  if (!(await pageBo.$$eval(`${z2} [data-plan-issue]`, (e) => e.length))) {
    throw new Error('la porte de sortie n’apparaît pas après trois essais');
  }
  await pageBo.click(`${z2} [data-plan-issue]`);
  await pageBo.waitForTimeout(160);
  const e = await pageBo.evaluate(() => JSON.parse(JSON.stringify(window.__bo2.db.transport['boost-ent31'].plan)));
  if (e.valide) throw new Error('la porte de sortie a validé le repérage');
  if (!e.force) throw new Error('le recours à la porte de sortie n’est pas enregistré');
  // La suite s'ouvre quand même : personne ne reste coincé sur une case.
  await pageBo.click('#boost31b .ent-nav[data-vue="tournee"]');
  await pageBo.waitForTimeout(160);
  // La tournée s'ouvre — vide, puisque le vélo-cargo part à quai. C'est la liste des commandes
  // à charger qui prouve que l'écran est bien là.
  if (!(await pageBo.$$eval(`${z2} .tour-liste-quai .tour-item`, (e2) => e2.length))) {
    throw new Error('la tournée reste fermée après la porte de sortie');
  }
  const s = await pageBo.evaluate(() => {
    const s2 = window.__bo2.suivi; return JSON.parse(JSON.stringify(s2[s2.length - 1]));
  });
  if (s.detail.reperage !== 'ko') throw new Error('jalon repérage après la porte de sortie : ' + s.detail.reperage);
});

await v('ENT-3.1 : une case tolérée laisse avancer, mais ne donne pas le point', async () => {
  // `toleres: 1` : six cases justes sur sept suffisent pour continuer. Le jalon, lui, exige
  // les sept — c'est la distinction entre « ne pas bloquer un élève » et « valider un acquis ».
  await pageBo.evaluate(async () => {
    const act = await import('/activites/boost-tournee.js');
    const hote = document.createElement('div');
    hote.id = 'boost31c';
    document.body.appendChild(hote);
    const db = {}; const suivi = [];
    act.rendre(hote, {
      meta: Object.assign({}, act.meta, { id: 'boost-tournee-c' }),
      profil: { prenom: 'Ines', nom: 'Roux', role: 'eleve' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: (r) => suivi.push(r),
      quitter: () => {}, codeStock: 'ABC',
    });
    window.__bo3 = { db, suivi };
  });
  const z3 = '#boost31c .ent-main';
  await pageBo.click('#boost31c .ent-nav[data-vue="plan"]');
  await pageBo.waitForTimeout(140);
  for (const [id, c] of Object.entries(CASES31)) {
    await pageBo.fill(`${z3} .plan-case[data-case="${id}"]`, id === 'c5' ? 'A1' : c);
  }
  await choisirQuartiersBo(z3);
  await pageBo.click(`${z3} [data-plan-valider]`);
  await pageBo.waitForTimeout(160);
  const t = await pageBo.textContent(z3);
  if (!/vous pouvez continuer/.test(t)) throw new Error('la tolérance ne joue pas : ' + t.slice(0, 300));
  if (!/Repérage validé/.test(t)) throw new Error('le repérage n’est pas validé malgré la tolérance');
  const s = await pageBo.evaluate(() => {
    const s2 = window.__bo3.suivi; return JSON.parse(JSON.stringify(s2[s2.length - 1]));
  });
  if (s.detail.reperage !== 'ko') throw new Error('six cases sur sept donnent le point : ' + s.detail.reperage);
});

await v('ENT-3.1 : la charte de Boost habille les deux vues sans une ligne de CSS en plus', async () => {
  const c = await pageBo.evaluate(() => {
    const page = document.querySelector('#boost31 .ent-page');
    const lu = (v) => getComputedStyle(page).getPropertyValue(v).trim().toLowerCase();
    const svg = document.querySelector('#boost31 .plan-svg');
    const hex = (el, attr) => (el ? getComputedStyle(el).fill || el.getAttribute(attr) : '');
    return {
      vert: lu('--vert'), terre: lu('--terre'), fond: lu('--ardoise-fond'), marque: lu('--ent-marque'),
      depart: hex(svg.querySelector('.plan-depart rect'), 'fill'),
      arrivee: hex(svg.querySelector('.plan-arrivee path'), 'fill'),
      point: hex(svg.querySelector('.plan-pt circle'), 'fill'),
    };
  });
  // Les trois valeurs relevées sur le site et le logo de Boost, dans leurs rôles.
  if (c.vert !== '#25c998') throw new Error('--vert (menthe du logo) : ' + c.vert);
  if (c.terre !== '#f0bd3c') throw new Error('--terre (jaune de la charte) : ' + c.terre);
  if (c.fond !== '#345cfd') throw new Error('--ardoise-fond (bleu électrique) : ' + c.fond);
  if (c.marque !== '#25c998') throw new Error('--ent-marque : ' + c.marque);
  // Et les vues les prennent : l'entrepôt en menthe, la gare en jaune, les clients en bleu.
  const rgb = (s) => s.replace(/\s/g, '');
  if (rgb(c.depart) !== 'rgb(37,201,152)') throw new Error('entrepôt : ' + c.depart);
  if (rgb(c.arrivee) !== 'rgb(240,189,60)') throw new Error('gare : ' + c.arrivee);
  if (rgb(c.point) !== 'rgb(52,92,253)') throw new Error('point client : ' + c.point);
});

await v('ENT-3.1 : le logo réel de Boost est servi par le dépôt', async () => {
  const r = await pageBo.evaluate(async () => {
    const img = document.querySelector('#boost31 .ent-logo');
    if (!img) return { absent: true };
    const rep = await fetch(img.src);
    const buf = await rep.arrayBuffer();
    const h = await crypto.subtle.digest('SHA-256', buf);
    return {
      src: img.getAttribute('src'), ok: rep.ok, octets: buf.byteLength,
      sha: [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join(''),
    };
  });
  if (r.absent) throw new Error('le bandeau n’affiche pas le logo');
  if (!r.ok) throw new Error('le logo ne se charge pas : ' + r.src);
  // L'empreinte du fichier d'origine, recalculée sur le fichier SERVI. Une image recopiée à la
  // main se serait corrompue sans que la taille le dise — c'est arrivé une fois sur ce projet.
  if (r.octets !== 9861) throw new Error(r.octets + ' octets au lieu de 9 861');
  if (r.sha !== 'b1e5c4ec368a158251bdb989fc56d34f439bf488e3297ad368782339d0aa2388') {
    throw new Error('empreinte du logo : ' + r.sha);
  }
  if (!/^\.\/contenus\/trames\/logos\/boost\.png$/.test(r.src)) throw new Error('chemin du logo : ' + r.src);
});

await v('ENT-3.1 : aucune carte en ligne n’est intégrée, seulement un lien', async () => {
  await ouvrirBo('plan');
  const a = await pageBo.evaluate(() => {
    const z = document.querySelector('#boost31 .ent-main');
    const lien = z.querySelector('.plan-barre a');
    return {
      iframes: z.querySelectorAll('iframe, embed, object').length,
      href: lien ? lien.getAttribute('href') : null,
      cible: lien ? lien.getAttribute('target') : null,
      rel: lien ? lien.getAttribute('rel') : null,
      images: [...z.querySelectorAll('img')].map((i) => i.getAttribute('src')),
    };
  });
  if (a.iframes) throw new Error(a.iframes + ' cadre(s) intégré(s) : aucune carte en ligne ne doit être embarquée');
  if (!a.href) throw new Error('pas de lien vers un plan en ligne');
  if (!/^https:\/\//.test(a.href)) throw new Error('lien non sécurisé : ' + a.href);
  if (a.cible !== '_blank' || !/noopener/.test(a.rel || '')) throw new Error('le lien ne s’ouvre pas proprement dans un autre onglet');
  if (a.images.some((s) => /^https?:/.test(s))) throw new Error('image chargée depuis l’extérieur : ' + a.images.join(', '));
});

await v('ENT-3.1 : aucune erreur de console sur tout le parcours', async () => {
  if (erreursBo.length) throw new Error([...new Set(erreursBo)].slice(0, 3).join(' | '));
});




/* ============================================================
/* ===== BLOC QUIZ — début (core/types/entrainement.js) ===== */
/* ============================================================
   QUI-8 — entraînement « Conversions d'unités »
   ============================================================
   Ce qui est gardé ici, et pourquoi :
     — le contrat du module (20 questions, barème 20, portée élève) ;
     — l'écran de rappel AVANT le jeu, et plus d'aide ensuite : une aide posée dans
       l'écran de travail est prise par réflexe (alerte n° 23) ;
     — une question à la fois, correction immédiate, choix verrouillés après la réponse ;
     — le clavier : répondre par 1 à 4, avancer par Entrée, et le focus qui suit le
       bouton au lieu de remonter en haut de page (alerte n° 30) ;
     — les valeurs régénérées : deux tentatives ne posent pas les mêmes nombres ;
     — le classement, son tri, et le fait qu'un seul résultat par élève y figure ;
     — ce que le classement montre d'un élève : prénom et initiale, jamais le nom entier ;
     — `poserLigne`, qui remplace une ligne au lieu d'en ajouter une ;
     — la calculette, et sa disparition quand on quitte l'activité ;
     — et qu'un enseignant qui essaie le quiz ne s'enregistre ni note ni rang.
   ============================================================ */

// Ce bloc se donne SON groupe et SON élève, au lieu de réutiliser ceux du début de la
// suite : entre-temps, d'autres tests créent, déplacent et suppriment des groupes, et un
// élève emporté par une suppression de groupe faisait tomber tout ce qui suit avec un
// « sélecteur introuvable » qui ne désigne rien.
const GROUPE_QZ = '1 LOG QZ';
const MAT_QZ = '2901';
const CODE_QZ = 'zzz9';

async function deconnecter() {
  await page.goto('http://127.0.0.1:8099/');
  await page.waitForSelector('#mat, #btnDeco', { timeout: 8000 });
  if (await page.$('#btnDeco')) {
    await page.click('#btnDeco');
    await page.waitForSelector('#mat', { timeout: 8000 });
  }
}

async function connecterEleveQz() {
  await deconnecter();
  await page.fill('#mat', MAT_QZ);
  await page.fill('#code', CODE_QZ);
  await page.click('#btnEleve');
  await page.waitForSelector('[data-rub="quiz"]', { timeout: 8000 });
}

// Joue le quiz jusqu'au bilan, en répondant toujours le premier choix. Le nombre de
// questions restantes dépend de ce que le test précédent a déjà joué : on s'arrête sur
// l'apparition du bilan, pas sur un compteur.
async function jouerJusquAuBilan(max = 25) {
  for (let i = 0; i < max; i++) {
    if (await page.$('.qz-note')) return;
    const b = await page.$('.qz-opt:not([disabled])');
    if (!b) break;
    await b.click();
    await page.waitForSelector('#qzSuivant', { timeout: 6000 });
    await page.click('#qzSuivant');
  }
  await page.waitForSelector('.qz-note', { timeout: 6000 });
}

async function ouvrirQuizQz() {
  await page.click('[data-rub="quiz"]');
  await page.waitForSelector('[data-act="entr-conversions"]', { timeout: 6000 });
  await page.click('[data-act="entr-conversions"]');
  await page.waitForSelector('#qzCommencer', { timeout: 6000 });
}

await v('QUI-8 : un groupe et un élève dédiés pour ce bloc', async () => {
  await deconnecter();
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
  await page.click('#btnProfEspace');
  await page.waitForSelector('#gNom', { timeout: 6000 });
  await page.fill('#gNom', GROUPE_QZ);
  await page.click('#btnCreerG');
  await page.waitForSelector(`text=${GROUPE_QZ}`, { timeout: 6000 });
  await page.click('[data-ong="comptes"]');
  await page.waitForSelector('#lot', { timeout: 6000 });
  await page.fill('#lot', `MORIN ; Zoé ; ${MAT_QZ} ; ${CODE_QZ}`);
  await page.click('#btnLot');
  await page.waitForSelector('text=MORIN', { timeout: 6000 });
});

await v('QUI-8 : le module déclare 20 questions, un barème de 20 et la portée élève', async () => {
  const m = await page.evaluate(async () => {
    const a = await import('/activites/entr-conversions.js');
    const c = await import('/contenus/entr-conversions.js');
    return { meta: a.meta, nbGen: c.GENERATEURS.length, nbRappel: c.RAPPEL.length };
  });
  if (m.nbGen !== 20) throw new Error(m.nbGen + ' générateurs au lieu de 20');
  if (m.meta.bareme !== 20) throw new Error('barème ' + m.meta.bareme);
  if (m.meta.portee !== 'eleve') throw new Error('portée ' + m.meta.portee);
  if (m.meta.rubrique !== 'quiz') throw new Error('rubrique ' + m.meta.rubrique);
  if (m.meta.code !== 'QUI-8') throw new Error('code ' + m.meta.code);
  if (m.meta.notation) throw new Error('notation déclarée : ' + m.meta.notation);
  if (m.nbRappel < 3) throw new Error('rappel trop court');
});

await v('QUI-8 : les 20 générateurs donnent des questions à quatre choix distincts', async () => {
  const r = await page.evaluate(async () => {
    const c = await import('/contenus/entr-conversions.js');
    const pbs = [];
    c.GENERATEURS.forEach((g, i) => {
      for (let n = 0; n < 60; n++) {
        const q = g();
        if (q.choix.length !== 4) pbs.push(`G${i + 1} : ${q.choix.length} choix`);
        if (new Set(q.choix).size !== 4) pbs.push(`G${i + 1} : doublon`);
        if (q.juste < 0 || q.juste > 3) pbs.push(`G${i + 1} : index ${q.juste}`);
        if (!q.explication) pbs.push(`G${i + 1} : pas d'explication`);
        if (/Aucune de ces réponses/.test(q.choix.join('|'))) pbs.push(`G${i + 1} : repli « Aucune de ces réponses »`);
      }
    });
    return [...new Set(pbs)];
  });
  if (r.length) throw new Error(r.slice(0, 3).join(' | '));
});

// Le garde-fou des doublons n'est plus atteint par aucun générateur de ce quiz — c'est
// justement pour ça qu'il est éprouvé ici directement. Sans lui, une question pourrait
// offrir deux fois la même valeur, dont la bonne : deux réponses justes cochables, et un
// élève sanctionné pour avoir choisi la seconde.
await v('questions : un distracteur qui tombe sur la bonne réponse est écarté', async () => {
  const r = await page.evaluate(async () => {
    const { question } = await import('/core/questions.js');
    const q = question('Combien ?', '2,5 h', ['3,5 h', '2,5 h', '2,5 h'], 'parce que');
    return { choix: q.choix, juste: q.choix[q.juste], distincts: new Set(q.choix).size };
  });
  if (r.distincts !== 4) throw new Error('choix obtenus : ' + r.choix.join(' / '));
  if (r.juste !== '2,5 h') throw new Error('la bonne réponse a bougé : ' + r.juste);
  if (!r.choix.some((c) => /Aucune de ces réponses/.test(c))) {
    throw new Error('le doublon a été écarté sans être remplacé : ' + r.choix.join(' / '));
  }
});

// Le quiz s'ouvre sur le rappel. C'est le seul endroit où l'aide est donnée : une fois la
// première question posée, elle ne doit plus être à portée de clic.
await v('QUI-8 : le quiz s’ouvre sur le rappel, et l’aide disparaît dès la première question', async () => {
  // La suite arrive ici avec une session ouverte, celle du test précédent : le mode
  // démonstration la restaure au rechargement. On se déconnecte d'abord si besoin.
  await connecterEleveQz();
  await ouvrirQuizQz();

  const nRappel = await page.$$eval('.qz-rappel li', (e) => e.length);
  if (nRappel < 3) throw new Error(nRappel + ' ligne(s) de rappel');
  if (await page.$('.qz-opt')) throw new Error('une question est déjà affichée avant « Commencer »');

  await page.click('#qzCommencer');
  await page.waitForSelector('.qz-opt', { timeout: 6000 });
  if (await page.$('.qz-rappel')) throw new Error('le rappel reste affiché pendant le jeu');
  const n = await page.$$eval('.qz-enonce', (e) => e.length);
  if (n !== 1) throw new Error(n + ' énoncé(s) affiché(s) : on en attend un seul');
  const c = await page.$$eval('.qz-opt', (e) => e.length);
  if (c !== 4) throw new Error(c + ' choix');
  if (!/Question 1 \/ 20/.test(await page.textContent('.qz-tete'))) throw new Error('compteur de question absent');
});

await v('QUI-8 : répondre corrige tout de suite, explique, et verrouille les choix', async () => {
  await page.click('.qz-opt');
  await page.waitForSelector('#qzSuivant', { timeout: 6000 });
  const a = await page.evaluate(() => ({
    retour: document.querySelector('#qzRetour').textContent.trim(),
    classe: document.querySelector('#qzRetour').className,
    verrouilles: [...document.querySelectorAll('.qz-opt')].every((b) => b.disabled),
    justes: document.querySelectorAll('.qz-opt.juste').length,
    marques: document.querySelectorAll('.qz-opt.juste, .qz-opt.faux').length,
    tete: document.querySelector('.qz-tete').textContent,
  }));
  if (!a.verrouilles) throw new Error('les choix restent cliquables après la réponse');
  if (a.justes !== 1) throw new Error(a.justes + ' bonne(s) réponse(s) signalée(s)');
  if (a.marques < 1 || a.marques > 2) throw new Error(a.marques + ' choix marqués');
  if (!/^[✓✗]/.test(a.retour)) throw new Error('pas de verdict : ' + a.retour);
  if (a.retour.length < 20) throw new Error("l'explication n'est pas affichée : " + a.retour);
  if (!/(juste|faux)/.test(a.classe)) throw new Error('retour sans habillage : ' + a.classe);
  if (!/Score : \d+ \/ 1/.test(a.tete)) throw new Error('score non mis à jour : ' + a.tete);
});

// Le clavier. Un élève qui enchaîne vingt questions à la souris perd un temps considérable ;
// et surtout, le second Entrée ne faisait rien quand l'écran se redessinait entièrement.
await v('QUI-8 : au clavier, 1 à 4 répondent, Entrée avance, et le focus suit le bouton', async () => {
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => /Question 2 \/ 20/.test(document.querySelector('.qz-tete')?.textContent || ''), null, { timeout: 6000 });
  await page.keyboard.press('2');
  await page.waitForSelector('#qzSuivant', { timeout: 6000 });
  const focus = await page.evaluate(() => document.activeElement?.id || '');
  if (focus !== 'qzSuivant') throw new Error('focus sur « ' + (focus || 'rien') + " » au lieu du bouton suivant");
  // Deux Entrée d'affilée doivent faire avancer deux fois : c'est exactement ce qui ne
  // marchait plus quand le focus était perdu au redessin.
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => /Question 3 \/ 20/.test(document.querySelector('.qz-tete')?.textContent || ''), null, { timeout: 6000 });
  await page.keyboard.press('1');
  await page.waitForSelector('#qzSuivant', { timeout: 6000 });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => /Question 4 \/ 20/.test(document.querySelector('.qz-tete')?.textContent || ''), null, { timeout: 6000 });
  // Une touche hors 1-4 ne répond pas.
  await page.keyboard.press('7');
  if (await page.$('#qzSuivant')) throw new Error('la touche 7 a répondu à une question à quatre choix');
});

await v('QUI-8 : la calculette calcule, affiche la virgule française, et ne divise pas par zéro', async () => {
  await page.waitForSelector('#calcBascule', { timeout: 6000 });
  await page.click('#calcBascule');
  await page.waitForSelector('#calcPanneau.ouvert', { timeout: 4000 });
  const taper = async (suite) => {
    for (const t of suite) {
      if (t === '=') await page.click('[data-calc="egal"]');
      else if (t === ',') await page.click('[data-calc="virgule"]');
      else if ('+-×÷'.includes(t)) await page.click(`[data-calc="op"][data-op="${t}"]`);
      else await page.click(`[data-calc="chiffre"][data-d="${t}"]`);
    }
    return (await page.textContent('#calcEcran')).trim();
  };
  await page.click('[data-calc="effacer"]');
  if (await taper('12×7='.split('')) !== '84') throw new Error('12 × 7 : ' + await page.textContent('#calcEcran'));
  await page.click('[data-calc="effacer"]');
  if (await taper('5÷2='.split('')) !== '2,5') throw new Error('5 ÷ 2 ne donne pas 2,5 : ' + await page.textContent('#calcEcran'));
  await page.click('[data-calc="effacer"]');
  const r = await taper('8÷0='.split(''));
  if (/Infinity|NaN/.test(r)) throw new Error('division par zéro affichée brute : ' + r);
  // Ouverte, la calculette flotte au-dessus de la question : la page doit se réserver de
  // la place en bas, sinon les deux choix de droite passent dessous et deviennent
  // illisibles — constaté à l'écran, pas par un test.
  const recouvre = await page.evaluate(() => {
    const p = document.querySelector('#calcPanneau').getBoundingClientRect();
    const croise = (r) => !(r.right <= p.left || r.left >= p.right || r.bottom <= p.top || r.top >= p.bottom);
    return [...document.querySelectorAll('.qz-opt')].filter((b) => croise(b.getBoundingClientRect()))
      .map((b) => b.textContent.trim());
  });
  if (recouvre.length) throw new Error('la calculette recouvre ' + recouvre.length + ' choix : ' + recouvre.join(' / '));
  await page.click('[data-calc="effacer"]');
  await page.click('#calcFermer');
  if (await page.$('#calcPanneau.ouvert')) throw new Error('la calculette ne se referme pas');
  // Et la place cédée est bien rendue à la fermeture : sinon le quiz resterait étriqué
  // pour le reste de la séance.
  const mesurer = () => page.evaluate(() => document.querySelector('.qz-choix').getBoundingClientRect().width
    + (parseInt(getComputedStyle(document.body).paddingBottom, 10) || 0));
  const ferme = await mesurer();
  await page.click('#calcBascule');
  await page.waitForSelector('#calcPanneau.ouvert', { timeout: 4000 });
  const ouvert = await mesurer();
  if (ouvert === ferme) throw new Error('la page ne cède aucune place à la calculette ouverte');
  await page.click('#calcFermer');
  await page.waitForTimeout(100);
  if (await mesurer() !== ferme) throw new Error('la place cédée n’est pas rendue à la fermeture');
});

// Vingt questions jouées pour de bon : c'est le seul test qui vérifie le chronomètre, le
// bilan et la remontée au suivi de classe.
await v('QUI-8 : les vingt questions se jouent, le bilan donne le score et le temps', async () => {
  await jouerJusquAuBilan();
  const t = await page.textContent('.qz-bilan');
  const m = /(\d+) \/ 20/.exec(t);
  if (!m) throw new Error('pas de score au bilan : ' + t.replace(/\s+/g, ' ').slice(0, 120));
  if (!/en \d+:\d\d/.test(t)) throw new Error('pas de temps au bilan');
  if (!(await page.$('#qzRecommencer'))) throw new Error('pas de bouton pour recommencer');
});

await v('QUI-8 : les nombres changent d’une tentative à l’autre', async () => {
  const lire = async () => {
    await page.waitForSelector('.qz-enonce', { timeout: 6000 });
    const e = [];
    for (let i = 0; i < 6; i++) {
      e.push((await page.textContent('.qz-enonce')).trim());
      await page.click('.qz-opt');
      await page.waitForSelector('#qzSuivant', { timeout: 6000 });
      await page.click('#qzSuivant');
    }
    return e;
  };
  await page.click('#qzRecommencer');
  const a = await lire();
  await jouerJusquAuBilan();
  await page.click('#qzRecommencer');
  const b = await lire();
  // Les six premières questions portent sur les mêmes notions dans le même ordre : ce
  // qui doit changer, ce sont les NOMBRES. On exige au moins la moitié des énoncés
  // différents — avec sept à dix tirages par générateur, deux séries identiques sont
  // possibles mais invraisemblables.
  const differents = a.filter((x, i) => x !== b[i]).length;
  if (differents < 3) throw new Error(`${differents} énoncé(s) différents sur 6 : les valeurs ne sont pas régénérées`);
  if (!(await page.$('.qz-opt'))) throw new Error('le quiz ne redémarre pas');
});

await v('QUI-8 : au classement, le résultat est anonyme par défaut', async () => {
  await jouerJusquAuBilan();
  await page.waitForSelector('#qzVoirClassement2', { timeout: 6000 });
  await page.click('#qzVoirClassement2');
  await page.waitForSelector('.qz-table, .vide', { timeout: 6000 });
  const t = await page.textContent('.panneau');
  if (/Zoé/.test(t) || /MORIN/.test(t)) throw new Error('un nom apparaît au classement sans que l’élève l’ait demandé');
  if (!/Anonyme \(moi\)/.test(t.replace(/\s+/g, ' '))) throw new Error('l’élève ne se reconnaît pas dans le classement');
  if (!(await page.$('.qz-table tr.qz-moi'))) throw new Error('la ligne de l’élève n’est pas mise en avant');
  const n = await page.$$eval('.qz-table tbody tr', (l) => l.length);
  if (n !== 1) throw new Error(n + ' ligne(s) alors que le même élève a joué trois fois');
  await page.click('[data-o="tous"]');
  await page.waitForSelector('.qz-table', { timeout: 4000 });
  if (!/1 LOG QZ/.test(await page.textContent('.panneau'))) throw new Error('le nom du groupe n’est pas affiché');
  if (!(await page.$('#qzMontrer'))) throw new Error('rien ne permet à l’élève de s’attribuer son score');
});

// Le nom n'est pas masqué : il n'est pas écrit. C'est la différence entre « on ne
// l'affiche pas » et « il n'y est pas », et c'est la seule promesse tenable sur une base
// que toutes les classes lisent.
await v('QUI-8 : tant que l’élève reste anonyme, son nom n’est pas dans la base', async () => {
  const ligne = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const l = await B.lireTable('classements', 'entr-conversions');
    return l[0] || null;
  });
  if (!ligne) throw new Error('aucune ligne de classement enregistrée');
  const texte = JSON.stringify(ligne);
  if (/Zoé|MORIN|Morin/.test(texte)) throw new Error('la ligne enregistrée porte un nom : ' + texte);
  if (typeof ligne.score !== 'number' || !ligne.groupe) throw new Error('ligne incomplète : ' + texte);
});

await v('QUI-8 : l’élève peut s’attribuer son score, et revenir en arrière', async () => {
  await page.click('#qzMontrer');
  await page.waitForSelector('#qzAnonyme', { timeout: 6000 });
  let t = await page.textContent('.panneau');
  if (!/Zoé M\./.test(t)) throw new Error('le prénom n’apparaît pas après l’avoir demandé');
  if (/MORIN/.test(t)) throw new Error('le nom de famille entier est affiché : seule l’initiale doit l’être');

  // Le choix tient d'une tentative à l'autre : sinon l'élève devrait le refaire à chaque
  // partie, et finirait par ne plus le faire du tout.
  await page.click('#qzRejouer');
  await page.waitForSelector('#qzCommencer', { timeout: 6000 });
  await page.click('#qzCommencer');
  await jouerJusquAuBilan();
  await page.click('#qzVoirClassement2');
  await page.waitForSelector('.qz-table', { timeout: 6000 });
  if (!/Zoé M\./.test(await page.textContent('.panneau'))) throw new Error('le choix de s’afficher n’a pas survécu à une nouvelle tentative');

  // Et revenir à l'anonymat efface le nom de la base, au lieu de cesser de l'afficher.
  await page.click('#qzAnonyme');
  await page.waitForSelector('#qzMontrer', { timeout: 6000 });
  t = await page.textContent('.panneau');
  if (/Zoé/.test(t)) throw new Error('le prénom reste affiché après le retour à l’anonymat');
  const texte = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    return JSON.stringify(await B.lireTable('classements', 'entr-conversions'));
  });
  if (/Zoé|MORIN/.test(texte)) throw new Error('le nom est seulement caché, pas effacé : ' + texte);
  if (!/"score"/.test(texte)) throw new Error('le résultat a disparu avec le nom : ' + texte);
});

await v('QUI-8 : le classement trie par score, puis par temps à égalité', async () => {
  const r = await page.evaluate(async () => {
    const m = await import('/core/types/entrainement.js');
    const rangs = m.classer([
      { id: 'a', score: 12, temps: 60 },
      { id: 'b', score: 18, temps: 300 },
      { id: 'c', score: 18, temps: 120 },
      { id: 'd', score: 18 },
      { id: 'e', score: null, temps: 10 },
    ]).map((l) => l.id);
    return {
      rangs,
      mieuxScore: m.meilleurQue({ score: 15, temps: 400 }, { score: 14, temps: 10 }),
      mieuxTemps: m.meilleurQue({ score: 14, temps: 80 }, { score: 14, temps: 90 }),
      pasMieux: m.meilleurQue({ score: 14, temps: 95 }, { score: 14, temps: 90 }),
      premier: m.meilleurQue({ score: 0, temps: 5 }, null),
      mm: [m.minSec(0), m.minSec(65), m.minSec(600), m.minSec(null)],
    };
  });
  if (r.rangs.join(',') !== 'c,b,d,a') throw new Error('ordre obtenu : ' + r.rangs.join(','));
  if (!r.mieuxScore) throw new Error('un meilleur score plus lent devrait gagner');
  if (!r.mieuxTemps) throw new Error('à score égal, le plus rapide devrait gagner');
  if (r.pasMieux) throw new Error('un temps plus lent à score égal ne doit pas remplacer');
  if (!r.premier) throw new Error('un premier résultat doit toujours s’enregistrer');
  if (r.mm.join('|') !== '0:00|1:05|10:00|—') throw new Error('temps mal formatés : ' + r.mm.join('|'));
});

await v('poserLigne : une clé choisie, et une ligne remplacée au lieu d’ajoutée', async () => {
  const r = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const c = 'communs/essai-poser';
    await B.viderTable(c, 'scores');
    await B.poserLigne(c, 'scores', 'u1', { score: 5, max: 20, temps: 100, nom: 'A.' });
    await B.poserLigne(c, 'scores', 'u1', { score: 9, max: 20, temps: 90, nom: 'A.' });
    await B.poserLigne(c, 'scores', 'u2', { score: 7, max: 20, temps: 50, nom: 'B.' });
    const l = await B.lireTable(c, 'scores');
    await B.viderTable(c, 'scores');
    return l.map((x) => `${x.id}:${x.score}`).sort();
  });
  if (r.join(',') !== 'u1:9,u2:7') throw new Error('contenu obtenu : ' + r.join(','));
});

// Le moteur lui-même, joué sans faute, hors du site : c'est le seul test qui vérifie
// qu'un parcours parfait remonte bien 3 sur 3 avec un temps.
await v('entraînement : un parcours sans faute remonte le score complet et le temps', async () => {
  const r = await page.evaluate(async () => {
    const { creerEntrainement } = await import('/core/types/entrainement.js');
    const QS = [
      { enonce: 'Q1', choix: ['bon1', 'f1', 'f2', 'f3'], juste: 0, explication: 'parce que' },
      { enonce: 'Q2', choix: ['g1', 'bon2', 'g2', 'g3'], juste: 1, explication: 'parce que' },
      { enonce: 'Q3', choix: ['h1', 'h2', 'bon3', 'h3'], juste: 2, explication: 'parce que' },
    ];
    const BONS = { Q1: 'bon1', Q2: 'bon2', Q3: 'bon3' };
    let enregistre = null;
    const hote = document.createElement('div');
    document.body.appendChild(hote);
    const moteur = creerEntrainement({ rappel: ['a', 'b', 'c'], questions: QS, calculette: false, classement: false });
    moteur.rendre(hote, {
      profil: { uid: 'x', role: 'eleve', prenom: 'Test', nom: 'Essai' },
      groupe: 'g', groupeNom: 'G', meta: { id: 'essai-moteur' },
      async lireScore() { return null; },
      async enregistrer(res) { enregistre = res; },
    });
    const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
    await attendre(30);
    hote.querySelector('#qzCommencer').click();
    const ordre = [];
    for (let i = 0; i < 3; i++) {
      await attendre(20);
      const enonce = hote.querySelector('.qz-enonce').textContent.trim();
      ordre.push(enonce);
      const cible = [...hote.querySelectorAll('.qz-opt')].find((b) => b.textContent.includes(BONS[enonce]));
      cible.click();
      await attendre(20);
      hote.querySelector('#qzSuivant').click();
    }
    await attendre(80);
    const bilan = hote.querySelector('.qz-bilan')?.textContent || '';
    hote.remove();
    return { enregistre, bilan: bilan.replace(/\s+/g, ' ').trim(), ordre };
  });
  if (!r.enregistre) throw new Error('rien n’a été remonté au suivi');
  if (r.enregistre.score !== 3 || r.enregistre.max !== 3) throw new Error('score remonté : ' + JSON.stringify(r.enregistre));
  if (typeof r.enregistre.detail?.temps !== 'number') throw new Error('pas de temps dans le détail');
  if (!/3 \/ 3/.test(r.bilan)) throw new Error('bilan : ' + r.bilan.slice(0, 120));
});

// Les quiz figés (géographie, français, CACES) viendront après celui-ci. Le mélange est
// ce qui les empêche d'être appris par cœur : sans lui, un élève retient « c'était la
// troisième réponse » sans avoir rien compris. Le témoin, lui, porte des générateurs,
// donc rien dans le site n'exerce encore ce chemin — d'où ce test.
await v('entraînement : des questions figées sont mélangées, énoncés ET réponses', async () => {
  const r = await page.evaluate(async () => {
    const { melangerQuestionsFixes } = await import('/core/questions.js');
    const QS = [1, 2, 3, 4, 5, 6].map((n) => ({
      enonce: 'Q' + n, choix: ['bon' + n, 'a' + n, 'b' + n, 'c' + n], juste: 0, explication: 'x',
    }));
    const premiers = new Set();
    const places = new Set();
    let incoherences = 0;
    for (let i = 0; i < 60; i++) {
      const m = melangerQuestionsFixes(QS);
      if (m.length !== QS.length) incoherences++;
      premiers.add(m[0].enonce);
      places.add(m[0].choix.indexOf('bon' + m[0].enonce.slice(1)));
      // La bonne réponse doit suivre son déplacement : `juste` pointe toujours dessus.
      m.forEach((q) => {
        if (q.choix[q.juste] !== 'bon' + q.enonce.slice(1)) incoherences++;
      });
    }
    return { premiers: premiers.size, places: places.size, incoherences };
  });
  if (r.incoherences) throw new Error(r.incoherences + ' question(s) dont la bonne réponse a été perdue au mélange');
  if (r.premiers < 3) throw new Error("l'ordre des questions ne change pas (" + r.premiers + ' premières questions différentes sur 60 tirages)');
  if (r.places < 3) throw new Error("la place de la bonne réponse ne change pas (" + r.places + ' positions sur 60 tirages)');
});

await v('QUI-8 : la calculette quitte l’écran avec l’activité', async () => {
  await connecterEleveQz();
  await ouvrirQuizQz();
  if (!(await page.$('#calcBascule'))) throw new Error('la calculette ne s’affiche pas dans le quiz');
  // Le retour ramène à la rubrique Quiz, pas aux pastilles : la rubrique ouverte est
  // conservée. On attend donc la tuile du module, pas la pastille.
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="entr-conversions"]', { timeout: 6000 });
  await page.waitForTimeout(200);
  if (await page.$('#calcBascule')) throw new Error('la calculette flotte encore après avoir quitté le quiz');
});

await v('QUI-8 : le suivi de classe affiche la note sur 20 du quiz', async () => {
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf', { timeout: 6000 });
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=QUI-8', { timeout: 6000 });
  const cellule = (await page.$$eval('#contenuProf tbody tr', (lignes) => {
    const l = lignes.find((x) => /MORIN/.test(x.textContent));
    return l ? [...l.querySelectorAll('td')].map((d) => ({ txt: d.textContent.replace(/\s+/g, ' ').trim(), titre: d.getAttribute('title') || '' })) : [];
  })).filter((c) => /\/20/.test(c.txt));
  if (!cellule.length) throw new Error('aucune note sur 20 dans la ligne de l’élève');
  const colonne = await page.textContent('th[title*="Conversions"]');
  if (!/\/\s*20/.test(colonne)) throw new Error('la colonne n’annonce pas un barème sur 20 : ' + colonne.trim());
});

// Un enseignant essaie un module sans fausser les données de la classe. C'est déjà la
// règle pour les séries tableur ; elle doit tenir ici aussi, note ET classement.
await v('QUI-8 : un enseignant qui joue ne s’enregistre ni note ni rang', async () => {
  const avant = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    return (await B.lireTable('classements', 'entr-conversions')).length;
  });
  await page.click('#btnRetour');
  await page.waitForSelector('[data-rub="quiz"]', { timeout: 6000 });
  await page.click('[data-rub="quiz"]');
  await page.click('[data-act="entr-conversions"]');
  await page.waitForSelector('#qzCommencer', { timeout: 6000 });
  if (!/enseignant/.test(await page.textContent('.panneau'))) throw new Error('rien ne prévient l’enseignant que son score n’est pas enregistré');
  await page.click('#qzCommencer');
  await jouerJusquAuBilan();
  const apres = await page.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    return (await B.lireTable('classements', 'entr-conversions')).length;
  });
  if (apres !== avant) throw new Error(`le classement est passé de ${avant} à ${apres} ligne(s)`);
});

await v('QUI-8 : rien n’est allé chercher quoi que ce soit à l’extérieur', async () => {
  if (hotesExternes.size) throw new Error('dépendance extérieure : ' + [...hotesExternes].join(', '));
});

/* ===== BLOC QUIZ — fin ===== */


/* ===== BLOC QUIZ CALCUL — début (QUI-9 Proportionnalité, QUI-10 Arrondis et pourcentages) ===== */
/* Les deux quiz tournent sur le même moteur que QUI-8 ; ce bloc ne reteste donc pas le moteur,
   seulement ce qui leur est propre : leur contrat, leurs 20 générateurs (énumérés avec bien
   plus de tirages que QUI-8, car c'est ce qui a trouvé les défauts de la Suite), et le fait
   qu'on peut les ouvrir et les jouer jusqu'au bilan. Il réutilise le groupe et l'élève du
   bloc précédent (GROUPE_QZ / MAT_QZ). */

const QUIZ_CALCUL = [
  { id: 'entr-proportionnalite', code: 'QUI-9' },
  { id: 'entr-arrondis', code: 'QUI-10' },
];

for (const { id, code } of QUIZ_CALCUL) {
  await v(`${code} : contrat du module et 20 générateurs sans « Aucune de ces réponses » (1 500 tirages chacun)`, async () => {
    const r = await page.evaluate(async (id) => {
      const a = await import(`/activites/${id}.js`);
      const c = await import(`/contenus/${id}.js`);
      const pbs = [];
      c.GENERATEURS.forEach((g, i) => {
        for (let n = 0; n < 1500; n++) {
          const q = g();
          const bonne = q.choix[q.juste];
          if (q.choix.length !== 4) pbs.push(`G${i + 1} : ${q.choix.length} choix`);
          if (new Set(q.choix).size !== 4) pbs.push(`G${i + 1} : doublon`);
          if (bonne === undefined) pbs.push(`G${i + 1} : index ${q.juste}`);
          if (!q.explication) pbs.push(`G${i + 1} : pas d'explication`);
          if (/Aucune de ces réponses/.test(q.choix.join('|'))) pbs.push(`G${i + 1} : repli « Aucune de ces réponses » (« ${q.enonce} »)`);
          if (/NaN|undefined|Infinity/.test(q.enonce + q.choix.join('') + q.explication)) pbs.push(`G${i + 1} : NaN`);
        }
      });
      return { meta: a.meta, nbGen: c.GENERATEURS.length, nbRappel: c.RAPPEL.length, pbs: [...new Set(pbs)] };
    }, id);
    if (r.nbGen !== 20) throw new Error(r.nbGen + ' générateurs au lieu de 20');
    if (r.meta.bareme !== 20) throw new Error('barème ' + r.meta.bareme);
    if (r.meta.portee !== 'eleve') throw new Error('portée ' + r.meta.portee);
    if (r.meta.rubrique !== 'quiz') throw new Error('rubrique ' + r.meta.rubrique);
    if (r.meta.code !== code) throw new Error('code ' + r.meta.code);
    if (r.nbRappel < 3) throw new Error('rappel trop court');
    if (r.pbs.length) throw new Error(r.pbs.slice(0, 3).join(' | '));
  });
}

// Défaut de la Suite : en flottants, 2,425 × 100 tombe à 242,4999… et l'arrondi au centième
// donnait 2,42 — la BONNE réponse affichée était fausse. Le calcul est maintenant en entiers ;
// ce test relit chaque énoncé « Arrondir X … près » et recalcule la réponse sur le texte, sans
// aucun flottant.
await v('QUI-10 : toute réponse d’arrondi est juste (recalculée sur le texte, en entiers)', async () => {
  const r = await page.evaluate(async () => {
    const c = await import('/contenus/entr-arrondis.js');
    const faux = []; let verifs = 0;
    c.GENERATEURS.forEach((g) => {
      for (let n = 0; n < 3000; n++) {
        const q = g();
        const m = q.enonce.match(/Arrondir ([\d\s  ,]+) (?:à l'unité|au (dixième|centième)) près/);
        if (!m) continue;
        const x = m[1].replace(/[\s  ]/g, '');
        const dec = m[2] === 'dixième' ? 1 : m[2] === 'centième' ? 2 : 0;
        const [ip, fp = ''] = x.split(',');
        const chiffres = ip + fp.padEnd(dec + 1, '0');
        const garde = chiffres.slice(0, ip.length + dec);
        const suivant = Number(chiffres[ip.length + dec]);
        const s = (BigInt(garde) + (suivant >= 5 ? 1n : 0n)).toString().padStart(dec + 1, '0');
        const attendu = dec ? s.slice(0, -dec) + ',' + s.slice(-dec) : s;
        verifs++;
        if (q.choix[q.juste].replace(/[\s  ]/g, '') !== attendu) faux.push(`${q.enonce} → ${q.choix[q.juste]} (attendu ${attendu})`);
      }
    });
    return { faux: [...new Set(faux)], verifs };
  });
  if (r.verifs < 1000) throw new Error('seulement ' + r.verifs + ' arrondis relus : le test ne voit plus les énoncés');
  if (r.faux.length) throw new Error(r.faux.slice(0, 2).join(' | '));
});

for (const { id, code } of QUIZ_CALCUL) {
  await v(`${code} : la tuile s’ouvre sur le rappel et le quiz se joue jusqu’au bilan sur 20`, async () => {
    await connecterEleveQz();
    await page.click('[data-rub="quiz"]');
    await page.waitForSelector(`[data-act="${id}"]`, { timeout: 6000 });
    await page.click(`[data-act="${id}"]`);
    await page.waitForSelector('#qzCommencer', { timeout: 6000 });
    if ((await page.$$eval('.qz-rappel li', (e) => e.length)) < 3) throw new Error('rappel absent');
    await page.click('#qzCommencer');
    await page.waitForSelector('.qz-opt', { timeout: 6000 });
    if (!/Question 1 \/ 20/.test(await page.textContent('.qz-tete'))) throw new Error('compteur de question absent');
    await jouerJusquAuBilan();
    if (!/\/ 20/.test(await page.textContent('.qz-note'))) throw new Error('bilan non noté sur 20');
  });
}

await v('QUI-9 et QUI-10 : rien n’est allé chercher quoi que ce soit à l’extérieur', async () => {
  if (hotesExternes.size) throw new Error('dépendance extérieure : ' + [...hotesExternes].join(', '));
});

/* ===== BLOC QUIZ CALCUL — fin ===== */


/* ===================================================================================== */
/* La vue « carte réelle » (core/types/carte.js) — ENT-3.2 et suivantes, étape 1          */
/*                                                                                        */
/* Montée dans le vrai moteur d'entreprise, décor Boost, avec la carte générée            */
/* (`contenus/boost-carte.js`) et ses sept clients d'essai. Ce que ces cas gardent :       */
/*   - les données : chaque nouveau client est sur sa rue, dans sa case, dans l'index ;    */
/*   - la règle du 02/10 : un nom de rue ne compte que s'il se lit ENTIER à l'écran ;      */
/*   - le point aimanté : bonne rue = posé au numéro BAN ; autre rue = refusé, nommé,      */
/*     compté ; maisons ou vue d'ensemble = refusé, pas compté ;                           */
/*   - la fin du repérage ouvre la suite, et le travail survit à un redessin ;            */
/*   - ENT-3.1 n'est pas touchée : elle garde le plan schématique.                        */
/* ===================================================================================== */

const ctxCt = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pageCt = await ctxCt.newPage();
pageCt.setDefaultTimeout(8000);
const erreursCt = [];
const hotesCt = new Set();
pageCt.on('pageerror', (e) => erreursCt.push('PAGEERROR: ' + e.message));
pageCt.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursCt.push('CONSOLE: ' + m.text()); });
pageCt.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotesCt.add(h); } catch (e) {} });
await pageCt.goto('http://127.0.0.1:8099/');
await pageCt.waitForSelector('#btnProf', { timeout: 8000 });

// `css` : une feuille ajoutée AVANT le montage — c'est ainsi qu'on simule une police de poste
// plus large que celle de la mesure, puisque le garde-fou ne mesure qu'à l'ouverture.
const monterCt = (css) => pageCt.evaluate(async (css) => {
  document.getElementById('ct-hote')?.remove();
  document.getElementById('ct-css')?.remove();
  if (css) { const s = document.createElement('style'); s.id = 'ct-css'; s.textContent = css; document.head.appendChild(s); }
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const B = await import('/contenus/boost.js');
  const { CARTE } = await import('/contenus/boost-carte.js');
  const moteur = creerEntreprise({
    ENTREPRISE: B.ENTREPRISE, VOCAB: B.VOCAB, CATALOGUE: B.CATALOGUE, SUPPLIERS: B.SUPPLIERS,
    SUP_BY_ID: B.SUP_BY_ID, CUSTOMERS: B.CUSTOMERS, CM: B.CM, baseDeDepart: B.baseDeDepart, THEME: B.THEME,
    etapes: [], exercice: 'Essai', transportSection: 'Tournées', transportId: 'essai-carte',
    plan: { libelle: 'Plan de Nîmes', titre: 'Situer les nouveaux clients', carte: CARTE },
    tournee: {
      libelle: 'Tournée', titre: 'Tournée sur la carte réelle',
      mesures: [{ id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: B.VELO.chargeUtile }],
      horaire: { depart: B.VELO.depart, limite: B.VELO.train, vitesse: B.VELO.vitesse, service: B.VELO.service },
      departAQuai: true, extremitesACliquer: true,
    },
  });
  const hote = document.createElement('div'); hote.id = 'ct-hote'; document.body.appendChild(hote);
  const db = (window.__ct && window.__ct.garder) ? window.__ct.db : {};
  let sauvegardes = 0;
  moteur.rendre(hote, {
    meta: { id: 'essai-carte', code: 'ESSAI', titre: 'Boost — essai', portee: 'eleve', immersif: true, jeuId: 'essai-carte' },
    profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => { sauvegardes++; } }, enregistrer: () => {}, quitter: () => {}, codeStock: '',
  });
  window.__ct = { db, CARTE, sauvegardes: () => sauvegardes };
  hote.querySelector('.ent-nav[data-vue="plan"]').click();
}, css || '');
const etatCt = () => pageCt.evaluate(() => JSON.parse(JSON.stringify(
  (window.__ct.db.transport && window.__ct.db.transport['essai-carte'] && window.__ct.db.transport['essai-carte'].plan) || {})));
const bulleCt = () => pageCt.textContent('[data-ct-bulle]');
const zoomCt = async (k) => { await pageCt.click(`[data-ct-zoom="${k}"]`); await pageCt.waitForTimeout(650); };
// Un point de la carte (mètres) → un clic à l'écran, au pixel près.
//
// Deux précautions, trouvées par un test qui passait une fois sur deux : le moteur fait défiler
// la page en DOUX (`scrollIntoView`) à chaque changement de vue, donc on attend que le
// défilement soit fini avant de lire la position ; et on vide la bulle avant de cliquer, pour
// qu'un message resté du clic d'avant ne fasse pas passer un clic perdu pour une réponse.
const scrollFiniCt = () => pageCt.evaluate(() => new Promise((ok) => {
  let y = -1, n = 0;
  const f = () => { if (window.scrollY === y) n++; else { n = 0; y = window.scrollY; } if (n >= 5) ok(); else requestAnimationFrame(f); };
  requestAnimationFrame(f);
}));
// Un point de la tournée (client ou bout de chaîne), cliqué une fois la page immobile.
const pointCt = async (sel) => { await scrollFiniCt(); await pageCt.click(sel, { force: true }); };
const cliquerCt = async (pt) => {
  await scrollFiniCt();
  await pageCt.evaluate(() => { document.querySelector('[data-ct-bulle]').textContent = ''; });
  const ecran = await pageCt.evaluate(({ x, y }) => {
    const svg = document.querySelector('[data-ct-svg]');
    const p = svg.createSVGPoint(); p.x = x; p.y = y;
    const e = p.matrixTransform(svg.getScreenCTM());
    return { x: e.x, y: e.y };
  }, pt);
  await pageCt.mouse.click(ecran.x, ecran.y);
  await pageCt.waitForTimeout(60);
};
// Un point SÛR d'une rue : le milieu de son plus long segment visible dans le zoom, dont on
// vérifie avec la fonction de la vue que c'est bien CETTE rue qu'il désigne (pas un carrefour).
const pointDeRue = (nom, k) => pageCt.evaluate(async ({ nom, k }) => {
  const { segments, rueSous } = await import('/core/types/carte.js');
  const C = window.__ct.CARTE;
  const RUES = Object.entries(C.rues).map(([n, d]) => ({ n, s: segments(d) }));
  const [x0, y0, w, h] = C.quartiers[k].vb;
  const segs = segments(C.rues[nom]).map(([a, b]) => ({ x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, L: Math.hypot(b[0] - a[0], b[1] - a[1]) }))
    .filter((p) => p.x > x0 + w * 0.08 && p.x < x0 + w * 0.92 && p.y > y0 + h * 0.12 && p.y < y0 + h * 0.92)
    .sort((a, b) => b.L - a.L);
  const bon = segs.find((p) => { const r = rueSous(RUES, p, 30); return r && r.n === nom; });
  return bon ? { x: bon.x, y: bon.y } : null;
}, { nom, k });

// Deux jeux de données, construits par le même script : la page d'essai (`boost-carte.js`) et la
// journée d'ENT-3.2 (`boost-ent32-carte.js`). Les mêmes règles tiennent pour les deux.
for (const module of ['/contenus/boost-carte.js', '/contenus/boost-ent32-carte.js']) await v(`carte : les données (${module.split('/').pop()}) — chaque nouveau client est sur sa rue, dans sa case et dans l’index`, async () => {
  await monterCt();
  const r = await pageCt.evaluate(async (module) => {
    const { segments, caseCarte, creerCarte } = await import('/core/types/carte.js');
    const { CARTE: C } = await import(module); const pb = [];
    try { creerCarte({ carte: C }); } catch (e) { pb.push('refusé par la vue : ' + e.message); }
    const dist = (p, [a, b]) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
      const t = L ? Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / L)) : 0;
      return Math.hypot(p.x - a[0] - t * dx, p.y - a[1] - t * dy); };
    const nouveaux = C.clients.filter((c) => c.nouveau);
    if (nouveaux.length < 2 || C.clients.length - nouveaux.length < 2) pb.push('il faut des nouveaux ET des habituels');
    for (const c of C.clients) {
      if (caseCarte(C, c) !== c.case) pb.push(`${c.nom} : case ${caseCarte(C, c)} ≠ ${c.case}`);
      if (!c.nouveau) continue;
      // Sa rue est LA PLUS PROCHE de son point BAN, pas seulement « à moins de 45 m » : à un angle,
      // la rue d'à côté peut passer à 30 m, et c'est elle que l'élève verrait sous le point.
      const d = Math.min(...segments(C.rues[c.rue] || '').map((s) => dist(c, s)));
      const proche = Object.entries(C.rues).map(([n, dd]) => [n, Math.min(...segments(dd).map((s) => dist(c, s)))])
        .sort((x, y) => x[1] - y[1])[0];
      if (!(d < 45)) pb.push(`${c.nom} à ${Math.round(d)} m de la ${c.rue}`);
      if (proche[0] !== c.rue) pb.push(`${c.nom} : la rue la plus proche est ${proche[0]} (${Math.round(proche[1])} m), pas la ${c.rue}`);
      const e = C.index.find((x) => x.n === c.rue);
      if (!e) pb.push(`${c.rue} absente de l’index`);
      else if (!e.q.includes(c.quartier) || !e.c.includes(c.case)) pb.push(`index faux pour ${c.rue} : ${e.q} ${e.c}`);
    }
    if (C.index.length < 100) pb.push('index trop court : ' + C.index.length);
    return pb;
  }, module);
  if (r.length) throw new Error(r.join(' | '));
});

await v('carte : à l’ouverture, les habituels sont posés, les nouveaux attendent, sans mode hors connexion', async () => {
  const r = await pageCt.evaluate(() => ({
    pins: document.querySelectorAll('[data-pins] .ct-mk-client').length,
    fiches: document.querySelectorAll('[data-ct-client]').length,
    index: document.querySelectorAll('[data-ct-index] li').length,
    horsCo: !!document.querySelector('[data-hors-connexion]'),
    menu: document.querySelector('.ent-nav[data-vue="plan"]')?.textContent.trim(),
  }));
  if (r.pins !== 4) throw new Error(`${r.pins} points au départ au lieu des 4 habituels`);
  if (r.fiches !== 3) throw new Error(`${r.fiches} fiches à situer au lieu de 3`);
  if (r.index < 100) throw new Error('index affiché : ' + r.index);
  if (r.horsCo) throw new Error('le mode hors connexion est proposé alors que la carte n’a pas besoin du réseau');
  if (r.menu !== 'Plan de Nîmes') throw new Error('entrée de menu : ' + r.menu);
});

await v('carte : l’index cherche sans accents et ouvre le quartier de la rue', async () => {
  await pageCt.fill('[data-ct-cherche]', 'madeleine');
  const l = await pageCt.$$eval('[data-ct-index] li', (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  if (!l.some((t) => /Rue de la Madeleine/.test(t) && /Écusson · D2/.test(t))) throw new Error('index : ' + l.join(' | '));
  await pageCt.fill('[data-ct-cherche]', 'ecusson');
  // « ecusson » ne doit trouver que des NOMS de rues, pas le nom du quartier écrit à côté.
  const l2 = await pageCt.$$eval('[data-ct-index] li', (e) => e.length);
  await pageCt.fill('[data-ct-cherche]', 'l’aspic');
  if (!/Aspic/.test(await pageCt.textContent('[data-ct-index]'))) throw new Error('l’apostrophe typographique ne trouve pas la rue de l’Aspic');
  await pageCt.fill('[data-ct-cherche]', 'madeleine');
  await pageCt.click('[data-ct-index] li[data-ct-rue="Rue de la Madeleine"]');
  await pageCt.waitForTimeout(650);
  const vue = await pageCt.evaluate(() => ({ zoom: document.querySelector('[data-ct-svg]').classList.contains('ct-zoom'),
    etiq: document.querySelector('.ct-etiq.vue')?.dataset.etiq }));
  if (!vue.zoom || vue.etiq !== 'ecusson') throw new Error('le clic dans l’index n’ouvre pas l’Écusson : ' + JSON.stringify(vue));
  if (l2 > 3) throw new Error(`« ecusson » trouve ${l2} rues : la recherche lit autre chose que le nom`);
});

// La règle du 02/10 (le « ous » de la rue Rousselier) : un nom n'est posé que s'il se lit
// entier. Mesuré sur le RENDU, nom par nom, dans chaque zoom, avec la police du poste puis
// une police nettement plus large que celle de la mesure. La marge du build (15 %) absorbe
// une police un peu plus large à elle seule ; il faut donc dépasser cette marge pour que le
// garde-fou `ajusterEtiquettes` soit réellement mis à l'épreuve — et vérifier qu'il a agi.
for (const [essai, css] of [['police normale', ''], ['police bien plus large, garde-fou en action', '.ct-etiq text{letter-spacing:.16em}']]) {
  await v(`carte : tous les noms de rues se lisent entiers dans chaque zoom (${essai})`, async () => {
    await monterCt(css);
    const quartiers = await pageCt.evaluate(() => Object.keys(window.__ct.CARTE.quartiers));
    const pb = []; let reduits = 0;
    for (const k of quartiers) {
      await zoomCt(k);
      const r = await pageCt.evaluate((k) => {
        const g = document.querySelector(`.ct-etiq[data-etiq="${k}"]`);
        const L = [...g.querySelectorAll('text')].map((t) => {
          const p = document.querySelector(t.firstChild.getAttribute('href'));
          return { n: t.textContent, texte: t.getComputedTextLength(), chemin: p.getTotalLength(),
            rendus: t.getNumberOfChars() };
        });
        const clients = window.__ct.CARTE.clients.filter((c) => c.nouveau && c.quartier === k).map((c) => c.rue);
        const fs = window.__ct.CARTE.quartiers[k].fs;
        const tailles = [...g.querySelectorAll('text')].filter((t) => t.style.fontSize).map((t) => ({ n: t.textContent, r: parseFloat(t.style.fontSize) / fs }));
        return { L, clients, reduits: tailles.length, tailles };
      }, k);
      if (r.L.length < 15) pb.push(`${k} : ${r.L.length} noms seulement`);
      r.L.filter((e) => e.texte > e.chemin + 0.5).forEach((e) => pb.push(`${k} : « ${e.n} » coupé (${Math.round(e.texte)} > ${Math.round(e.chemin)})`));
      r.clients.filter((n) => !r.L.some((e) => e.n === n)).forEach((n) => pb.push(`${k} : la ${n} n’a pas de nom`));
      reduits += r.reduits;
      // Réduire n'est pas une échappatoire : avec la police de mesure, AUCUN nom ne doit avoir
      // besoin du garde-fou (sinon le build a mal calculé sa place), et même avec une police
      // bien plus large, un nom réduit doit rester lisible — au moins 75 % de sa taille.
      if (!css && r.reduits) pb.push(`${k} : ${r.reduits} nom(s) réduits avec la police de mesure (${r.tailles[0].n})`);
      r.tailles.filter((t) => t.r < 0.75).forEach((t) => pb.push(`${k} : « ${t.n} » réduit à ${Math.round(t.r * 100)} %`));
    }
    if (css && !reduits) pb.push('aucun nom réduit : le cas ne met pas le garde-fou à l’épreuve');
    if (pb.length) throw new Error(pb.slice(0, 4).join(' | '));
  });
}

// En vue d'ensemble, client armé : un clic DANS un quartier l'ouvre (c'est le geste attendu),
// un clic ailleurs — ici sur l'avenue de la Boulangerie Roux, hors des quartiers dessinés — est
// refusé avec un message. Ni l'un ni l'autre ne pose de point ni ne compte d'essai.
await v('carte : en vue d’ensemble, un clic ne pose rien et ne compte pas (il ouvre le quartier)', async () => {
  await monterCt();
  await pageCt.click('[data-ct-arme="c1"]');
  const hors = await pageCt.evaluate(() => window.__ct.CARTE.clients.find((c) => c.id === 'c5'));
  await cliquerCt(hors);
  if (!/Ouvrez d’abord le bon quartier : les noms de rues/.test(await bulleCt())) throw new Error('bulle : ' + await bulleCt());
  const dedans = await pageCt.evaluate(() => window.__ct.CARTE.clients.find((c) => c.id === 'c1'));
  await cliquerCt(dedans);
  await pageCt.waitForTimeout(650);
  const vue = await pageCt.evaluate(() => document.querySelector('.ct-etiq.vue')?.dataset.etiq);
  if (vue !== 'ecusson') throw new Error('le clic dans l’Écusson ne l’ouvre pas : ' + vue);
  const e = await etatCt();
  if (Object.keys(e.places || {}).length || Object.keys(e.essais || {}).length) throw new Error('état touché : ' + JSON.stringify(e));
  await pageCt.click('[data-ct-ensemble]'); await pageCt.waitForTimeout(650);
});

await v('carte : un clic sur une autre rue est refusé, nommé, et compté comme essai', async () => {
  await zoomCt('ecusson');
  const pt = await pointDeRue('Rue Nationale', 'ecusson');
  if (!pt) throw new Error('aucun point sûr sur la rue Nationale');
  await cliquerCt(pt);
  const b = await bulleCt();
  if (!/Ici c’est : Rue Nationale\. Cherchez la rue de la Madeleine\./.test(b)) throw new Error('bulle : ' + b);
  const e = await etatCt();
  if ((e.essais || {}).c1 !== 1 || (e.places || {}).c1) throw new Error('état : ' + JSON.stringify(e));
  if (!/1 clic sur une autre rue/.test(await pageCt.textContent('[data-ct-client="c1"]'))) throw new Error('l’essai n’est pas affiché');
  if (await pageCt.$$eval('[data-pins] .ct-mk-client', (x) => x.length) !== 4) throw new Error('un point a été posé');
});

await v('carte : un clic sur les maisons demande une rue, sans compter d’essai', async () => {
  const pt = await pageCt.evaluate(async () => {
    const { segments, rueSous } = await import('/core/types/carte.js');
    const C = window.__ct.CARTE;
    const RUES = Object.entries(C.rues).map(([n, d]) => ({ n, s: segments(d) }));
    const [x0, y0, w, h] = C.quartiers.ecusson.vb;
    for (let i = 0.3; i < 0.8; i += 0.02) for (let j = 0.3; j < 0.8; j += 0.02) {
      const p = { x: x0 + w * i, y: y0 + h * j };
      if (!rueSous(RUES, p, 30)) return p;
    }
    return null;
  });
  if (!pt) throw new Error('aucun îlot sans rue trouvé');
  await cliquerCt(pt);
  if (!/Cliquez sur une rue/.test(await bulleCt())) throw new Error('bulle : ' + await bulleCt());
  if ((await etatCt()).essais.c1 !== 1) throw new Error('le clic sur les maisons a compté un essai');
});

await v('carte : un clic sur la bonne rue pose le point au numéro (BAN), pas là où l’on a cliqué', async () => {
  const pt = await pointDeRue('Rue de la Madeleine', 'ecusson');
  await cliquerCt(pt);
  const r = await pageCt.evaluate(() => {
    const c = window.__ct.CARTE.clients.find((x) => x.id === 'c1');
    const g = [...document.querySelectorAll('[data-pins] .ct-mk-client')].find((m) => /^1\./.test(m.querySelector('title').textContent));
    return { c: { x: c.x, y: c.y }, g: g && { x: +g.dataset.x, y: +g.dataset.y }, n: document.querySelectorAll('[data-pins] .ct-mk-client').length };
  });
  if (!r.g || r.n !== 5) throw new Error('point non posé : ' + JSON.stringify(r));
  if (Math.hypot(r.g.x - r.c.x, r.g.y - r.c.y) > 0.01) throw new Error('posé ailleurs qu’au numéro : ' + JSON.stringify(r));
  if (Math.hypot(pt.x - r.c.x, pt.y - r.c.y) < 5) throw new Error('le test a cliqué sur le numéro lui-même : il ne prouve pas l’aimant');
  const e = await etatCt();
  if (!e.places.c1 || e.essais.c1 !== 1 || e.valide) throw new Error('état : ' + JSON.stringify(e));
  if (!/1 clic sur une autre rue/.test(await pageCt.textContent('[data-ct-client="c1"]'))) throw new Error('le suivi de l’essai a disparu');
  if (!(await pageCt.evaluate(() => window.__ct.sauvegardes()))) throw new Error('rien n’a été sauvé');
});

await v('carte : la tournée reste fermée tant qu’un nouveau client manque, puis s’ouvre', async () => {
  const ouvre = () => pageCt.evaluate(async () => {
    const { creerCarte } = await import('/core/types/carte.js');
    const v = creerCarte({ carte: window.__ct.CARTE });
    const e = window.__ct.db.transport['essai-carte'].plan;
    return { ouvre: v.ouvreSuite(e), bilan: v.bilan(e) };
  });
  if ((await ouvre()).ouvre) throw new Error('la suite s’ouvre avec un seul client situé');
  await pageCt.click('[data-ct-arme="c2"]');
  await cliquerCt(await pointDeRue("Rue de l'Aspic", 'ecusson'));
  await zoomCt('fontaine');
  await pageCt.click('[data-ct-arme="c3"]');
  await cliquerCt(await pointDeRue('Rue Rousselier', 'fontaine'));
  const r = await ouvre();
  if (!r.ouvre) throw new Error('la suite reste fermée : ' + JSON.stringify(r.bilan));
  if (r.bilan.places !== 3 || r.bilan.essais !== 1 || r.bilan.premierCoup !== 2) throw new Error('bilan : ' + JSON.stringify(r.bilan));
  if (!(await etatCt()).valide) throw new Error('`valide` non horodaté');
  if (!/Les 7 clients sont sur la carte/.test(await pageCt.textContent('[data-ct-bilan]'))) throw new Error('bilan affiché : ' + await pageCt.textContent('[data-ct-bilan]'));
  await pageCt.waitForTimeout(1500);
  if (await pageCt.evaluate(() => document.querySelector('[data-ct-svg]').classList.contains('ct-zoom'))) throw new Error('pas de retour à la vue d’ensemble');
});

await v('carte : le travail survit à un redessin de la page et à un remontage sur la même base', async () => {
  await pageCt.click('.ent-nav[data-vue="accueil"]');
  await pageCt.click('.ent-nav[data-vue="plan"]');
  if (await pageCt.$$eval('[data-pins] .ct-mk-client', (x) => x.length) !== 7) throw new Error('points perdus au redessin');
  await pageCt.evaluate(() => { window.__ct.garder = true; });
  await monterCt();
  const r = await pageCt.evaluate(() => ({ n: document.querySelectorAll('[data-pins] .ct-mk-client').length,
    t: document.querySelector('[data-ct-client="c1"]').textContent.replace(/\s+/g, ' ') }));
  await pageCt.evaluate(() => { window.__ct.garder = false; });
  if (r.n !== 7 || !/Situé/.test(r.t) || !/1 clic sur une autre rue/.test(r.t)) throw new Error('après remontage : ' + JSON.stringify(r));
});

await v('carte : un contenu dont un nouveau client n’a pas de rue nommée est refusé à la construction', async () => {
  const r = await pageCt.evaluate(async () => {
    const { creerCarte } = await import('/core/types/carte.js');
    const C = window.__ct.CARTE;
    const essais = [
      C.clients.map((c) => (c.id === 'c1' ? Object.assign({}, c, { rue: 'Rue Imaginaire' }) : c)),
      C.clients.map((c) => (c.id === 'c4' ? Object.assign({}, c, { nouveau: true, rue: 'Rue Pierre Semard', quartier: 'ecusson' }) : c)),
    ];
    return essais.map((clients) => { try { creerCarte({ carte: C, clients }); return 'accepté'; } catch (e) { return e.message; } });
  });
  if (!/n'est pas sur la carte/.test(r[0])) throw new Error('rue inexistante : ' + r[0]);
  if (!/n'a pas son nom dans le zoom/.test(r[1])) throw new Error('rue sans nom : ' + r[1]);
});

await v('carte : ENT-3.1 garde son plan schématique (aucune carte réelle déclarée)', async () => {
  const r = await pageCt.evaluate(async () => { const S = await import('/contenus/boost-tournee.js'); return { carte: !!S.PLAN.carte, cases: !!(S.PLAN.reperage && S.PLAN.reperage.champ) }; });
  if (r.carte || !r.cases) throw new Error(JSON.stringify(r));
});

await v('carte : le calage d’ENT-3.2 tient (un seul client à quai, train minoritaire, créneau qui change l’ordre)', async () => {
  const { execFileSync } = await import('node:child_process');
  try { execFileSync(process.execPath, [path.join(ROOT, 'outils', 'carte', 'calibrer.mjs')], { stdio: 'pipe' }); }
  catch (e) { throw new Error(String(e.stderr || e.message).trim().split('\n').slice(-2).join(' ')); }
});

/* ---- la tournée sur la carte réelle (étape 2) : km par les rues, tracé le long des rues ---- */

await v('carte : chaque itinéraire part de son point, arrive au suivant, et n’est pas plus court qu’à vol d’oiseau', async () => {
  const pb = await pageCt.evaluate(async () => {
    const { segments } = await import('/core/types/carte.js');
    const C = window.__ct.CARTE; const pb = [];
    const pts = Object.fromEntries([...C.clients.map((c) => [c.id, c]), ['depart', C.depart], ['arrivee', C.arrivee]]);
    const ids = Object.keys(pts);
    for (const a of ids) for (const b of ids) {
      if (a === b) continue;
      const t = C.trajets[`${a}|${b}`];
      if (!t) { pb.push(`${a}→${b} manquant`); continue; }
      const sg = segments(t.d);
      const L = sg.reduce((s, [p, q]) => s + Math.hypot(q[0] - p[0], q[1] - p[1]), 0);
      const [d0] = sg[0], d1 = sg[sg.length - 1][1];
      const vol = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
      if (Math.hypot(d0[0] - pts[a].x, d0[1] - pts[a].y) > 2) pb.push(`${a}→${b} ne part pas de ${a}`);
      if (Math.hypot(d1[0] - pts[b].x, d1[1] - pts[b].y) > 2) pb.push(`${a}→${b} n’arrive pas à ${b}`);
      if (t.m < vol - 1) pb.push(`${a}→${b} : ${t.m} m < ${Math.round(vol)} m à vol d’oiseau`);
      if (Math.abs(L - t.m) > Math.max(15, t.m * 0.03)) pb.push(`${a}→${b} : tracé de ${Math.round(L)} m pour ${t.m} m annoncés`);
    }
    return pb;
  });
  if (pb.length) throw new Error(pb.slice(0, 4).join(' | '));
});

await v('carte : la tournée compte les km PAR LES RUES, dans le sens du trajet', async () => {
  await monterCt();
  await pageCt.evaluate(() => { const t = window.__ct.db.transport['essai-carte'].plan; Object.assign(t, { places: { c1: 1, c2: 1, c3: 1 }, valide: 1 }); });
  await pageCt.click('.ent-nav[data-vue="tournee"]');
  await pageCt.waitForSelector('[data-clic-point="c5"]');
  for (const sel of ['[data-clic-extremite="depart"]', '[data-clic-point="c5"]', '[data-clic-point="c3"]', '[data-clic-point="c1"]', '[data-clic-extremite="arrivee"]']) {
    await pointCt(sel);
  }
  const r = await pageCt.evaluate(async () => {
    const { creerTournee } = await import('/core/types/tournee.js');
    const B = await import('/contenus/boost.js');
    const C = window.__ct.CARTE;
    const t = window.__ct.db.transport['essai-carte'].tournee;
    const vue = creerTournee({ plan: { carte: C }, mesures: [], horaire: { depart: 780, limite: 970, vitesse: 12, service: 6 }, extremitesACliquer: true });
    const b = vue.bilan(Object.assign({ ordre: [], quai: [], report: {}, juge: {} }, t));
    const pts = Object.fromEntries([...C.clients.map((c) => [c.id, c]), ['depart', C.depart], ['arrivee', C.arrivee]]);
    const ch = ['depart', ...t.ordre, 'arrivee'];
    let rues = 0, envers = 0, vol = 0;
    for (let i = 1; i < ch.length; i++) {
      rues += C.trajets[`${ch[i - 1]}|${ch[i]}`].m; envers += C.trajets[`${ch[i]}|${ch[i - 1]}`].m;
      vol += Math.hypot(pts[ch[i]].x - pts[ch[i - 1]].x, pts[ch[i]].y - pts[ch[i - 1]].y);
    }
    return { ordre: t.ordre, km: b.km, rues: rues / 1000, envers: envers / 1000, vol: vol / 1000 };
  });
  if (r.ordre.join() !== 'c5,c3,c1') throw new Error('ordre construit au clic : ' + r.ordre.join());
  if (Math.abs(r.km - r.rues) > 1e-9) throw new Error(`${r.km} km comptés, ${r.rues} km par les rues`);
  if (Math.abs(r.rues - r.envers) < 0.001) throw new Error('le parcours choisi ne distingue pas les sens : le test ne prouve rien');
  if (r.km < r.vol * 1.05) throw new Error(`${r.km} km : c’est presque le vol d’oiseau (${r.vol})`);
});

await v('carte : le tracé suit les rues, dans l’ordre choisi, et suit les changements', async () => {
  const lire = () => pageCt.evaluate(() => {
    const C = window.__ct.CARTE; const t = window.__ct.db.transport['essai-carte'].tournee;
    const ch = [...(t.depart ? ['depart'] : []), ...t.ordre, ...(t.arrivee ? ['arrivee'] : [])];
    const attendu = ch.slice(1).map((b, i) => C.trajets[`${ch[i]}|${b}`].d).join('');
    return { d: document.querySelector('[data-ct-trace]').getAttribute('d'), attendu, n: ch.length };
  });
  let r = await lire();
  if (!r.d || r.d !== r.attendu) throw new Error('tracé différent des itinéraires de la table');
  if ((r.d.match(/M/g) || []).length !== r.n - 1) throw new Error('un morceau par trajet attendu');
  if ((r.d.match(/l/g) || []).length < 40) throw new Error('le tracé a trop peu de sommets pour suivre des rues');
  await pointCt('[data-clic-point="c3"]');      // retiré de la tournée
  r = await lire();
  if (r.d !== r.attendu || r.n !== 4) throw new Error('le tracé ne suit pas le retrait d’un arrêt');
  await pointCt('[data-clic-extremite="depart"]');
  await pointCt('[data-clic-extremite="arrivee"]');
  await pointCt('[data-clic-point="c5"]');
  await pointCt('[data-clic-point="c1"]');
  r = await lire();
  if (r.d !== '') throw new Error('il reste un tracé alors que rien n’est posé : ' + r.d.slice(0, 40));
});

await v('carte : la tournée garde le zoom d’un clic à l’autre, et le clic marche zoomé', async () => {
  // Une tournée vide, posée à la main : ce cas ne dépend pas de ce qu'ont laissé les précédents.
  await pageCt.evaluate(() => {
    const t = window.__ct.db.transport['essai-carte'].tournee;
    Object.assign(t, { ordre: [], quai: window.__ct.CARTE.clients.map((c) => c.id), depart: null, arrivee: null });
  });
  await pageCt.click('.ent-nav[data-vue="accueil"]'); await pageCt.click('.ent-nav[data-vue="tournee"]');
  await pageCt.click('[data-ct-zoom="ecusson"]'); await pageCt.waitForTimeout(650);
  await pointCt('[data-clic-point="c1"]');
  await pointCt('[data-clic-point="c2"]');
  const r = await pageCt.evaluate(() => ({ zoom: document.querySelector('[data-ct-svg]').classList.contains('ct-zoom'),
    vue: document.querySelector('.ct-etiq.vue')?.dataset.etiq, ordre: window.__ct.db.transport['essai-carte'].tournee.ordre.join(),
    rangs: [...document.querySelectorAll('[data-rang]')].map((g) => g.dataset.point + ':' + g.dataset.rang).join() }));
  if (!r.zoom || r.vue !== 'ecusson') throw new Error('zoom perdu au redessin : ' + JSON.stringify(r));
  if (r.ordre !== 'c1,c2' || r.rangs !== 'c1:1,c2:2') throw new Error(JSON.stringify(r));
});

await v('tournée : « Recommencer la tournée » arme d’abord, puis remet tout à quai, bouts compris', async () => {
  // Le bouton vit dans la colonne collante des contraintes : on le déclenche par le DOM, ce cas
  // juge le comportement, pas la mise en page.
  const razCt = () => pageCt.$eval('[data-tour-raz]', (b) => b.click());
  const etatT = () => pageCt.evaluate(() => JSON.parse(JSON.stringify(window.__ct.db.transport['essai-carte'].tournee)));
  // Le cas précédent a laissé la carte zoomée sur l'Écusson : on revient à l'ensemble, sinon les
  // points des autres quartiers sont hors de l'écran.
  await pageCt.click('[data-ct-ensemble]'); await pageCt.waitForTimeout(650);
  for (const sel of ['[data-clic-extremite="depart"]', '[data-clic-point="c5"]', '[data-clic-point="c3"]', '[data-clic-extremite="arrivee"]']) await pointCt(sel);
  const avant = await etatT();
  if (avant.ordre.length < 3 || !avant.depart || !avant.arrivee) throw new Error('tournée de départ mal construite : ' + JSON.stringify(avant));
  await razCt();
  if (!/confirmer/i.test(await pageCt.textContent('[data-tour-raz]'))) throw new Error('le premier clic n’arme pas le bouton');
  if ((await etatT()).ordre.join() !== avant.ordre.join()) throw new Error('le premier clic a déjà effacé la tournée');
  await pageCt.$eval('[data-tour-raz-non]', (b) => b.click());
  if (/confirmer/i.test(await pageCt.textContent('[data-tour-raz]'))) throw new Error('« Annuler » ne désarme pas');
  await razCt(); await razCt();
  const apres = await etatT();
  const tous = await pageCt.evaluate(() => window.__ct.CARTE.clients.map((c) => c.id).sort().join());
  if (apres.ordre.length || apres.depart || apres.arrivee) throw new Error('il reste quelque chose : ' + JSON.stringify(apres));
  if ([...apres.quai].sort().join() !== tous) throw new Error('tout n’est pas à quai : ' + apres.quai.join());
  if (await pageCt.getAttribute('[data-ct-trace]', 'd')) throw new Error('le tracé est resté');
  if (!(await pageCt.$eval('[data-tour-raz]', (b) => b.disabled))) throw new Error('le bouton reste actif sur une tournée vide');
});

/* ---- le créneau de livraison (ENT-3.2) : heure d'arrivée par client, créneau raté ---- */
/* La journée d'ENT-3.2 (`boost-ent32-carte.js`) : la Pâtisserie Arnaud (c6) n'accepte      */
/* qu'avant 14 h 45. Deux tournées de référence, tirées de la fiche du 02/10 :              */
/*   - celle de Tristan à l'essai, c7 c1 c2 c6 c8 c3 c4 : gare à 16 h 05 (train pris),     */
/*     pâtisserie à 15 h 07 — créneau raté de 22 min ;                                     */
/*   - la meilleure qui tient tout, c6 c7 c8 c3 c4 c1 c2.                                  */
const ORDRE_RATE = ['c7', 'c1', 'c2', 'c6', 'c8', 'c3', 'c4'];
const ORDRE_BON = ['c6', 'c7', 'c8', 'c3', 'c4', 'c1', 'c2'];

// Le bilan de la VRAIE vue, sur la journée d'ENT-3.2, pour un ordre donné (bouts posés).
const bilanCr = (ordre, extra) => pageCt.evaluate(async ({ ordre, extra }) => {
  const { creerTournee, hhmm } = await import('/core/types/tournee.js');
  const B = await import('/contenus/boost.js');
  const { CARTE: C } = await import('/contenus/boost-ent32-carte.js');
  const vue = creerTournee(Object.assign({ plan: { carte: C },
    mesures: [{ id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: B.VELO.chargeUtile }],
    horaire: { depart: 14 * 60 + 10, limite: B.VELO.train, vitesse: B.VELO.vitesse, service: B.VELO.service },
    extremitesACliquer: true }, extra || {}));
  const tous = C.clients.map((c) => c.id);
  const b = vue.bilan({ ordre, quai: tous.filter((x) => !ordre.includes(x)), depart: 1, arrivee: 1, report: {}, juge: {} });
  return { arrivees: b.arrivees, creneaux: b.creneaux, rates: b.creneauxRates, rate: b.creneauRate,
    enRetard: b.enRetard, gare: b.arrivee == null ? null : hhmm(b.arrivee), c6: b.arrivees.c6 == null ? null : hhmm(b.arrivees.c6) };
}, { ordre, extra });

await v('créneau : l’heure d’arrivée chez chaque client = trajets par les rues + service des arrêts PRÉCÉDENTS', async () => {
  // L'attendu est recalculé ici, à la main, depuis la table des itinéraires — pas lu dans la vue.
  const attendu = await pageCt.evaluate(async (ordre) => {
    const { CARTE: C } = await import('/contenus/boost-ent32-carte.js');
    const B = await import('/contenus/boost.js');
    const ch = ['depart', ...ordre]; let m = 0; const a = {};
    for (let i = 1; i < ch.length; i++) {
      m += C.trajets[`${ch[i - 1]}|${ch[i]}`].m;
      a[ch[i]] = 14 * 60 + 10 + m / 1000 / B.VELO.vitesse * 60 + (i - 1) * B.VELO.service;
    }
    return a;
  }, ORDRE_RATE);
  const r = await bilanCr(ORDRE_RATE);
  for (const id of ORDRE_RATE) {
    if (r.arrivees[id] == null || Math.abs(r.arrivees[id] - attendu[id]) > 1e-9) {
      throw new Error(`${id} : arrivée ${r.arrivees[id]} pour ${attendu[id]} attendues`);
    }
  }
  if (r.c6 !== '15 h 07') throw new Error('pâtisserie à ' + r.c6 + ' (15 h 07 attendu, fiche du 02/10)');
  if (r.gare !== '16 h 05' || r.enRetard) throw new Error(`gare à ${r.gare}, train ${r.enRetard ? 'manqué' : 'pris'} (16 h 05, pris, attendu)`);
  if (!r.rate || r.rates.join() !== 'c6') throw new Error('créneau non vu comme raté : ' + JSON.stringify(r.creneaux));
  const c = r.creneaux.find((x) => x.id === 'c6');
  if (!c || c.avant !== 885 || !c.charge || !/14 h 45/.test(c.libelle)) throw new Error('créneau mal lu dans les données : ' + JSON.stringify(c));
  const bon = await bilanCr(ORDRE_BON);
  if (bon.rate || bon.enRetard) throw new Error('la meilleure tournée est refusée : ' + JSON.stringify(bon.creneaux));
});

await v('créneau : à quai, un client n’est pas « en retard » ; sans horaire, aucun créneau n’est jugé', async () => {
  // La pâtisserie à quai : elle n'est pas livrée aujourd'hui, ce n'est pas un retard.
  const quai = await bilanCr(['c7', 'c1', 'c2', 'c8', 'c3', 'c4']);
  const c = quai.creneaux.find((x) => x.id === 'c6');
  if (!c || c.charge || c.rate || quai.rate || c.arrivee != null) throw new Error('client à quai jugé : ' + JSON.stringify(c));
  const sansHoraire = await bilanCr(ORDRE_RATE, { horaire: null });
  if (sansHoraire.rate || Object.keys(sansHoraire.arrivees).length) throw new Error('un créneau est jugé sans horaire : ' + JSON.stringify(sansHoraire.creneaux));
});

await v('créneau : le moteur et le calage comptent les mêmes ordres (train, puis train ET créneau)', async () => {
  // `calibrer.mjs` a calé la journée avec SA formule. La vue doit tomber sur les mêmes nombres :
  // sinon un ordre « juste » pour le calage serait refusé à l'élève, ou l'inverse.
  const { execFileSync } = await import('node:child_process');
  const sortie = execFileSync(process.execPath, [path.join(ROOT, 'outils', 'carte', 'calibrer.mjs')], { encoding: 'utf8' });
  const m = sortie.match(/(\d+) ordres de passage : (\d+) attrapent le train .*?, (\d+) tiennent aussi le créneau/);
  if (!m) throw new Error('sortie du calage illisible : ' + sortie.slice(0, 200));
  const r = await pageCt.evaluate(async () => {
    const { creerTournee } = await import('/core/types/tournee.js');
    const B = await import('/contenus/boost.js');
    const { CARTE: C } = await import('/contenus/boost-ent32-carte.js');
    const vue = creerTournee({ plan: { carte: C }, mesures: [],
      horaire: { depart: 14 * 60 + 10, limite: B.VELO.train, vitesse: B.VELO.vitesse, service: B.VELO.service },
      extremitesACliquer: true });
    const S = C.clients.filter((c) => c.id !== 'c5').map((c) => c.id);
    function* perms(a) { if (a.length < 2) { yield a; return; } for (let i = 0; i < a.length; i++) for (const p of perms([...a.slice(0, i), ...a.slice(i + 1)])) yield [a[i], ...p]; }
    let n = 0, train = 0, tout = 0;
    for (const p of perms(S)) {
      n++;
      const b = vue.bilan({ ordre: p, quai: ['c5'], depart: 1, arrivee: 1, report: {}, juge: {} });
      if (!b.enRetard) { train++; if (!b.creneauRate) tout++; }
    }
    return { n, train, tout };
  });
  if (`${r.n} ${r.train} ${r.tout}` !== `${m[1]} ${m[2]} ${m[3]}`) {
    throw new Error(`moteur : ${r.n} ordres, ${r.train} au train, ${r.tout} tiennent tout ; calage : ${m[1]}, ${m[2]}, ${m[3]}`);
  }
});

// La vue montée sur la journée d'ENT-3.2, repérage déjà fait, tournée posée par l'état.
const monterCr = (opts, ordre) => pageCt.evaluate(async ({ opts, ordre }) => {
  document.getElementById('cr-hote')?.remove();
  document.getElementById('ct-hote')?.remove();
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const B = await import('/contenus/boost.js');
  const { CARTE } = await import('/contenus/boost-ent32-carte.js');
  const moteur = creerEntreprise({
    ENTREPRISE: B.ENTREPRISE, VOCAB: B.VOCAB, CATALOGUE: B.CATALOGUE, SUPPLIERS: B.SUPPLIERS,
    SUP_BY_ID: B.SUP_BY_ID, CUSTOMERS: B.CUSTOMERS, CM: B.CM, baseDeDepart: B.baseDeDepart, THEME: B.THEME,
    etapes: [], exercice: 'Essai', transportSection: 'Tournées', transportId: 'essai-cr',
    plan: { libelle: 'Plan de Nîmes', titre: 'Situer les nouveaux clients', carte: CARTE },
    tournee: Object.assign({
      libelle: 'Tournée', titre: 'Tournée ENT-3.2',
      mesures: [{ id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: B.VELO.chargeUtile }],
      horaire: { depart: 14 * 60 + 10, limite: B.VELO.train, vitesse: B.VELO.vitesse, service: B.VELO.service, libelleLimite: 'départ du train' },
      departAQuai: true, extremitesACliquer: true, exigeConforme: true,
      report: [{ id: 'rkm', libelle: 'Distance', unite: 'km', tolerance: 0.05, valeur: (b) => b.km }],
    }, opts),
  });
  const tous = CARTE.clients.map((c) => c.id);
  const db = { transport: { 'essai-cr': {
    plan: { places: Object.fromEntries(CARTE.clients.filter((c) => c.nouveau).map((c) => [c.id, 1])), essais: {}, valide: 1 },
    tournee: { ordre, quai: tous.filter((x) => !ordre.includes(x)), depart: 1, arrivee: 1, report: {}, juge: {}, valide: null },
  } } };
  const hote = document.createElement('div'); hote.id = 'cr-hote'; document.body.appendChild(hote);
  moteur.rendre(hote, {
    meta: { id: 'essai-cr', code: 'ESSAI', titre: 'Boost — créneau', portee: 'eleve', immersif: true, jeuId: 'essai-cr' },
    profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: '',
  });
  window.__cr = { db };
  hote.querySelector('.ent-nav[data-vue="tournee"]').click();
}, { opts: opts || {}, ordre });
const texteCr = () => pageCt.textContent('#cr-hote .ent-main');
const jaugeCr = () => pageCt.$eval('#cr-hote [data-creneau="c6"]', (e) => ({ txt: e.textContent.replace(/\s+/g, ' '), trop: e.classList.contains('trop') }));
const validerCr = async (km) => {
  if (km != null) await pageCt.fill('#cr-hote [data-report="rkm"]', km);
  await pageCt.$eval('#cr-hote [data-tour-valider]', (b) => b.click());
  await pageCt.waitForTimeout(120);
};

await v('créneau : la jauge parlante donne l’arrivée et le retard, et le report est refusé tant que le créneau est raté', async () => {
  await monterCr({}, ORDRE_RATE);
  await pageCt.waitForSelector('#cr-hote [data-creneau="c6"]');
  let j = await jaugeCr();
  if (!j.trop || !/Créneau raté de 22 min/.test(j.txt) || !/15 h 07/.test(j.txt)) throw new Error('jauge : ' + j.txt);
  if (!/livraison avant 14 h 45/.test(await pageCt.textContent('#cr-hote #tourListe'))) throw new Error('le créneau ne se lit pas sur la ligne du client');
  await validerCr();
  let t = await texteCr();
  if (!/ne tient pas encore/.test(t) || !/créneau raté chez Pâtisserie Arnaud \(22 min de retard\)/.test(t)) throw new Error('report non refusé : ' + t.slice(-400));
  if (/train manqué/.test(t)) throw new Error('le train est donné pour manqué alors qu’il est pris');
  const juge = await pageCt.evaluate(() => window.__cr.db.transport['essai-cr'].tournee.juge);
  if (Object.keys(juge).length) throw new Error('les cases ont été jugées malgré le refus');
  // La bonne tournée : la jauge passe au vert et le report est accepté.
  await monterCr({}, ORDRE_BON);
  await pageCt.waitForSelector('#cr-hote [data-creneau="c6"]');
  j = await jaugeCr();
  if (j.trop || !/créneau tenu/.test(j.txt)) throw new Error('jauge de la bonne tournée : ' + j.txt);
  const km = await pageCt.evaluate(async (o) => {
    const { CARTE: C } = await import('/contenus/boost-ent32-carte.js');
    const ch = ['depart', ...o, 'arrivee']; let m = 0;
    for (let i = 1; i < ch.length; i++) m += C.trajets[`${ch[i - 1]}|${ch[i]}`].m;
    return (m / 1000).toFixed(2).replace('.', ',');
  }, ORDRE_BON);
  await validerCr(km);
  t = await texteCr();
  if (/ne tient pas encore/.test(t) || !/Tous les résultats sont justes/.test(t)) throw new Error('la bonne tournée est refusée : ' + t.slice(-400));
});

await v('créneau : jauges muettes — « créneau raté », sans l’heure d’arrivée ni le retard, au refus comme à l’écran', async () => {
  await monterCr({ jaugesRepere: true }, ORDRE_RATE);
  await pageCt.waitForSelector('#cr-hote [data-creneau="c6"]');
  const j = await jaugeCr();
  if (!j.trop || !/Créneau raté/.test(j.txt)) throw new Error('la jauge muette ne dit pas que le créneau est raté : ' + j.txt);
  if (/raté de|\d+ min|15 h 07/.test(j.txt)) throw new Error('la jauge muette donne le retard ou l’arrivée : ' + j.txt);
  if (!/14 h 45/.test(j.txt)) throw new Error('la limite du créneau n’est plus donnée : ' + j.txt);
  await validerCr();
  const t = await texteCr();
  if (!/ne tient pas encore/.test(t) || !/créneau raté chez Pâtisserie Arnaud/.test(t)) throw new Error('report non refusé : ' + t.slice(-400));
  if (/de retard|15 h 07|raté de/.test(t)) throw new Error('la page muette donne le retard ou l’arrivée : ' + t.slice(-400));
  await pageCt.evaluate(() => document.getElementById('cr-hote')?.remove());
});

await v('carte : aucune erreur, aucune requête hors du site', async () => {
  if (erreursCt.length) throw new Error([...new Set(erreursCt)].slice(0, 3).join(' | '));
  if (hotesCt.size) throw new Error('requête extérieure : ' + [...hotesCt].join(', '));
});
await ctxCt.close();

console.log('\n=== RÉUSSIS ===');
ok.forEach((o) => console.log('  ✓ ' + o));
if (ko.length) { console.log('\n=== ÉCHECS ==='); ko.forEach((k) => console.log('  ✗ ' + k)); }
if (erreurs.length) { console.log('\n=== ERREURS JS ==='); [...new Set(erreurs)].slice(0, 12).forEach((e) => console.log('  ! ' + e)); }
console.log(`\n${ok.length}/${ok.length + ko.length} tests réussis.`);

await nav.close();
srv.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
