// Suite de tests de Prepalog — bloc « dependances » : les dépendances : polices du dépôt, aucun hébergeur extérieur, un seul 404, SDK Firebase de vendor/ et chemin Firebase exécuté.
//
// Découpé de `outils/test.mjs` le 02/10/2026 (chantier C, voir `claude/prepalog-chantiers-en-cours.md`).
// Le lanceur reste `node outils/test.mjs` ; `node outils/test.mjs dependances` ne lance que ce bloc.
// Le corps n'est volontairement PAS réindenté : c'est le code d'origine, ligne pour ligne, et
// réindenter aurait aussi décalé le contenu des chaînes sur plusieurs lignes.
// Ce que le bloc reçoit du lanceur (`commun.mjs`) : le navigateur, la page partagée, `v()`, etc.

import fs from 'node:fs';
import path from 'node:path';

export default async function bloc({ v, page, nav, ROOT, hotesExternes, introuvables, SANS_CONFIG, BASE }) {

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
await pageFb.goto(BASE);
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

}
