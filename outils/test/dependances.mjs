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

// ---------- 44. la fabrique de séance d'entreprise (chantier 8, 08/10/2026)
// `core/types/seance-entreprise.js` déduit de l'`id`/du `code` ce que les 24 séances d'entreprise
// recopiaient. Ces cas gardent trois choses : (a) ce qu'elle compose (appelée avec de FAUSSES
// données par `composerSeance`, qui ne crée pas de moteur) ; (b) ses refus, en français et avec
// l'`id` de la séance ; (c) les séances réelles, relues depuis le registre, sans liste de codes.
// Les valeurs attendues sont écrites à la main : la formule de la fabrique n'est pas recopiée
// d'après elle-même.
const fabrique = (corps) => page.evaluate(async (src) => {
  const { composerSeance } = await import('/core/types/seance-entreprise.js');
  const univers = { ENTREPRISE: { n: 'U' }, VOCAB: { n: 'U' }, CATALOGUE: { n: 'U' }, SUPPLIERS: ['U'], SUP_BY_ID: { U: 1 },
    CUSTOMERS: ['U'], CM: { n: 'U' }, baseDeDepart: () => 'U', THEME: { n: 'U' } };
  const etapes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  return await new Function('composerSeance', 'univers', 'etapes', `return (async () => { ${src} })()`)(composerSeance, univers, etapes);
}, corps);

await v('fabrique de séance : le meta se complète (rubrique, immersif, portée, tables, barème, corrigé) et la séance l\'emporte', async () => {
  const r = await fabrique(`
    const a = composerSeance(univers, { ETAPES: etapes }, { id: 'x-a', code: 'ENT-9.1', titre: 'T' });
    const b = composerSeance(univers, { ETAPES: etapes }, { id: 'x-b', code: 'ENT-9.2', bareme: 20, rubrique: 'autre', corrige: './contenus/corriges/ailleurs.js', portee: 'groupe' });
    const c = composerSeance(univers, { ETAPES: etapes }, { id: 'x-c', code: 'ENT-9.3', corrige: false });
    return { a: a.meta, b: b.meta, c: c.meta, cCle: 'corrige' in c.meta };`);
  const att = { rubrique: 'simulog', immersif: true, portee: 'eleve', bareme: 3, corrige: './contenus/corriges/ENT-9.1.js' };
  for (const [k, x] of Object.entries(att)) if (r.a[k] !== x) throw new Error(`meta.${k} = ${JSON.stringify(r.a[k])} au lieu de ${JSON.stringify(x)}`);
  if (JSON.stringify(r.a.tables) !== '{}') throw new Error('tables : ' + JSON.stringify(r.a.tables));
  if (r.a.id !== 'x-a' || r.a.titre !== 'T') throw new Error('ce que la séance écrit a disparu : ' + JSON.stringify(r.a));
  if (r.b.bareme !== 20 || r.b.rubrique !== 'autre' || r.b.portee !== 'groupe' || r.b.corrige !== './contenus/corriges/ailleurs.js') {
    throw new Error('une valeur écrite dans le meta ne l\'emporte pas : ' + JSON.stringify(r.b));
  }
  if (r.cCle) throw new Error('« corrige: false » doit retirer la clé : ' + JSON.stringify(r.c));
});

await v('fabrique de séance : les options se composent univers < contenu de la séance < options, trame déduite du code et du nom', async () => {
  const r = await fabrique(`
    const S = { ETAPES: etapes, ACCUEIL: { t: 'acc' }, VOLET: { t: 'vol' }, CATALOGUE: { n: 'SEANCE' }, THEME: { n: 'SEANCE' } };
    const x = composerSeance(univers, S, { id: 'x-a', code: 'ENT-9.4', trame: 'mon-nom', copie: true },
      { THEME: { n: 'OPTIONS' }, menu: ['stock'], quai: { q: 1 } });
    const y = composerSeance(univers, { ETAPES: etapes }, { id: 'x-b', code: 'ENT-9.5' });
    const z = composerSeance(univers, { ETAPES: etapes }, { id: 'x-c', code: 'ENT-9.6', trame: 'nom' }, { trame: { pdf: './p.pdf' } });
    return { x: x.options, xMeta: x.meta, y: y.options, z: z.options };`);
  const o = r.x;
  if (o.ENTREPRISE.n !== 'U' || o.VOCAB.n !== 'U' || o.CM.n !== 'U') throw new Error('l\'univers n\'arrive pas');
  if (o.CATALOGUE.n !== 'SEANCE') throw new Error('le contenu de la séance ne remplace pas l\'univers : ' + JSON.stringify(o.CATALOGUE));
  if (o.THEME.n !== 'OPTIONS') throw new Error('les options ne remplacent pas le contenu de la séance : ' + JSON.stringify(o.THEME));
  if (o.etapes.length !== 3 || o.accueil.t !== 'acc' || o.volet.t !== 'vol') throw new Error('etapes/accueil/volet mal lus du contenu');
  if (JSON.stringify(o.menu) !== '["stock"]' || o.quai.q !== 1) throw new Error('les options ne partent pas telles quelles');
  if (o.copie !== true) throw new Error('copie du meta absente des options du moteur');
  if (o.trame.pdf !== './contenus/trames/ENT-9.4-mon-nom-trame-eleve.pdf' || o.trame.docx !== './contenus/trames/ENT-9.4-mon-nom-trame-eleve.docx') {
    throw new Error('trame : ' + JSON.stringify(o.trame));
  }
  if ('trame' in r.xMeta) throw new Error('« trame » (le nom) ne doit pas rester dans le meta : le bandeau la lit dans le moteur');
  const y = r.y;
  if ('trame' in y || 'copie' in y || 'menu' in y || 'accueil' in y || 'volet' in y) {
    throw new Error('clé ajoutée sans raison : ' + Object.keys(y).join(', '));
  }
  if (JSON.stringify(r.z.trame) !== '{"pdf":"./p.pdf"}') throw new Error('trame des options non prioritaire : ' + JSON.stringify(r.z.trame));
});

await v('fabrique de séance : refuse en français, avec l\'id de la séance (pas d\'ETAPES, pas d\'id, pas de code, clé d\'univers absente, trame mal formée)', async () => {
  const r = await fabrique(`
    const essai = (f) => { try { f(); return 'PAS DE REFUS'; } catch (e) { return e.message; } };
    const sansTheme = { ...univers }; delete sansTheme.THEME;
    return {
      sansEtapes: essai(() => composerSeance(univers, {}, { id: 'x-sans-etapes', code: 'ENT-9.1' })),
      etapesPasListe: essai(() => composerSeance(univers, { ETAPES: 3 }, { id: 'x-pas-liste', code: 'ENT-9.1' })),
      sansId: essai(() => composerSeance(univers, { ETAPES: etapes }, { code: 'ENT-9.7' })),
      sansCode: essai(() => composerSeance(univers, { ETAPES: etapes }, { id: 'x-sans-code' })),
      sansCle: essai(() => composerSeance(sansTheme, { ETAPES: etapes }, { id: 'x-sans-theme', code: 'ENT-9.1' })),
      cleDansOptions: essai(() => composerSeance(sansTheme, { ETAPES: etapes }, { id: 'x-ok', code: 'ENT-9.1' }, { THEME: {} })),
      trameObjet: essai(() => composerSeance(univers, { ETAPES: etapes }, { id: 'x-trame', code: 'ENT-9.1', trame: { pdf: 'a' } })),
    };`);
  const doit = (cle, ...mots) => {
    for (const m of mots) if (!r[cle].includes(m)) throw new Error(`${cle} : « ${r[cle]} » ne contient pas « ${m} »`);
  };
  doit('sansEtapes', 'x-sans-etapes', 'ETAPES');
  doit('etapesPasListe', 'x-pas-liste', 'ETAPES');
  doit('sansId', 'id', 'ENT-9.7');
  doit('sansCode', 'x-sans-code', 'code');
  doit('sansCle', 'x-sans-theme', 'THEME');
  doit('trameObjet', 'x-trame', 'trame');
  if (r.cleDansOptions !== 'PAS DE REFUS') throw new Error('une clé d\'univers donnée par les options doit suffire : ' + r.cleDansOptions);
  for (const [k, m] of Object.entries(r)) if (m !== 'PAS DE REFUS' && !/^Séance /.test(m)) throw new Error(`${k} : message sans le préfixe « Séance » : ${m}`);
});

await v('séances d\'entreprise : un meta complet et cohérent avec le code, calculé depuis le registre', async () => {
  const metas = await page.evaluate(async () => (await (await import('/activites/index.js')).chargerActivites()).map((a) => a.meta));
  const ent = metas.filter((m) => /^ENT-\d+\.\d+$/.test(m.code));
  // Plancher, pas liste : si le registre se vide ou se met à ignorer des séances, le cas ne doit pas passer à vide.
  if (ent.length < 24) throw new Error(`seulement ${ent.length} séances d'entreprise dans le registre`);
  const problemes = [];
  let avecCorrige = 0;
  for (const m of ent) {
    if (m.rubrique !== 'simulog') problemes.push(`${m.id} : rubrique ${m.rubrique}`);
    if (m.immersif !== true) problemes.push(`${m.id} : pas immersive`);
    if (m.portee !== 'eleve') problemes.push(`${m.id} : portée ${m.portee}`);
    if (!(m.bareme > 0)) problemes.push(`${m.id} : barème ${m.bareme}`);
    if ('trame' in m) problemes.push(`${m.id} : « trame » dans le meta (le bandeau la lit dans le moteur)`);
    if (m.corrige !== undefined) {
      avecCorrige++;
      if (m.corrige !== `./contenus/corriges/${m.code}.js`) problemes.push(`${m.id} : corrigé ${m.corrige}`);
      else if (!fs.existsSync(path.join(ROOT, m.corrige.replace(/^\.\//, '')))) problemes.push(`${m.id} : corrigé absent du dépôt`);
    }
  }
  if (avecCorrige < ent.length - 2) throw new Error(`${avecCorrige} corrigés déclarés sur ${ent.length} séances (au plus deux séances sans corrigé)`);
  if (problemes.length) throw new Error(problemes.join(' ; '));
});

await v('séances d\'entreprise : toute trame (écrite ou déduite par la fabrique) commence par le code de la séance et existe dans le dépôt', async () => {
  const problemes = [];
  let nTrames = 0;
  for (const e of fs.readdirSync(path.join(ROOT, 'activites'))) {
    if (!/\.js$/.test(e) || e === 'index.js') continue;
    const src = fs.readFileSync(path.join(ROOT, 'activites', e), 'utf8');
    const code = /code:\s*'(ENT-\d+\.\d+)'/.exec(src)?.[1];
    if (!code) continue;
    const chemins = [...src.matchAll(/(?:pdf|docx):\s*'(\.\/contenus\/trames\/[^']+)'/g)].map((m) => m[1]);
    // Forme de la fabrique : `trame: 'nom'` dans le meta passé à seanceEntreprise.
    if (/seanceEntreprise\(/.test(src)) {
      const nom = /^[ \t]*[^\/\n]*\btrame:\s*'([^']+)'/m.exec(src)?.[1];
      if (nom) chemins.push(`./contenus/trames/${code}-${nom}-trame-eleve.pdf`, `./contenus/trames/${code}-${nom}-trame-eleve.docx`);
    }
    for (const c of chemins) {
      nTrames++;
      if (!c.startsWith(`./contenus/trames/${code}-`)) problemes.push(`${e} : ${c} ne commence pas par le code ${code}`);
      if (!fs.existsSync(path.join(ROOT, c.replace(/^\.\//, '')))) problemes.push(`${e} : ${c} absent du dépôt`);
    }
  }
  if (nTrames < 30) throw new Error(`seulement ${nTrames} chemins de trame relus (le cas ne doit pas passer à vide)`);
  if (problemes.length) throw new Error(problemes.join(' ; '));
});

// ---------- 45. la table unique des options de `creerEntreprise` (chantier 9, lot 9a, 08/10/2026)
// `OPTIONS` (en tête de `core/types/entreprise.js`) liste toutes les clés que le moteur lit. Une clé inconnue, ou
// d'un type que le moteur ne sait pas lire, fait refuser la séance ; deux vues de même famille ne partagent pas un `id`.
// Les cas appellent `creerEntreprise` avec un univers FICTIF minimal (jamais une vraie entreprise) : seuls les refus
// comptent ici, le moteur ne dessine rien.
const moteurEssai = (corps) => page.evaluate(async (src) => {
  const E = await import('/core/types/entreprise.js');
  const F = await import('/core/types/seance-entreprise.js');
  const univers = { ENTREPRISE: { nom: 'E', sousTitre: 's' }, VOCAB: { unit: 'p', unitPl: 'ps', sizeLabel: 'T' },
    CATALOGUE: { MODELS: [], MM: {}, VARIANTS: [], VM: {} }, SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {},
    baseDeDepart: () => ({}), THEME: {}, etapes: [] };
  const fiche = (id) => ({ id, libelle: 'Fiche ' + id, titre: 'T', blocs: [{ type: 'choix', id: 'c', lib: 'C', manque: 'c', choix: ['A', 'B'] }],
    envoi: { bouton: 'Envoyer', a: 'X' } });
  const essai = (extra) => { try { E.creerEntreprise({ ...univers, ...extra }); return 'CHARGÉE'; } catch (e) { return e.message; } };
  return await new Function('E', 'F', 'univers', 'fiche', 'essai', `return (async () => { ${src} })()`)(E, F, univers, fiche, essai);
}, corps);

await v('creerEntreprise : une option inconnue refuse la séance, en français, en nommant la clé et en listant les clés connues', async () => {
  const r = await moteurEssai(`return { ok: essai({}), faute: essai({ quay: {} }), casse: essai({ Menu: [] }), heritee: essai({ constructor: 1 }),
    cles: Object.keys(E.OPTIONS) };`);
  if (r.ok !== 'CHARGÉE') throw new Error('l\'univers fictif nu doit se charger : ' + r.ok);
  if (!r.faute.includes('« quay »') || !/n'existe pas/.test(r.faute)) throw new Error('le refus ne nomme pas la clé : ' + r.faute);
  if (!r.faute.includes('quai') || !r.faute.includes('finFige') || !r.faute.includes('baseDeDepart')) throw new Error('le refus ne liste pas les clés connues : ' + r.faute);
  if (!r.casse.includes('« Menu »') || !r.casse.includes('« menu » ?')) throw new Error('la bonne orthographe n\'est pas proposée : ' + r.casse);
  if (!r.heritee.includes('« constructor »')) throw new Error('un nom hérité de Object ne doit pas passer pour une option : ' + r.heritee);
  if (r.cles.length < 40) throw new Error(`la table ne compte que ${r.cles.length} options`);
});

await v('creerEntreprise : une option du mauvais type refuse la séance ; null et undefined valent « absent »', async () => {
  const r = await moteurEssai(`return { menu: essai({ menu: 'stock' }), etapes: essai({ etapes: {} }), nul: essai({ quai: null }),
    absents: essai({ menu: undefined, quai: null, fiche: null, copie: undefined }) };`);
  if (!r.menu.includes('« menu »') || !r.menu.includes('array')) throw new Error('menu en texte accepté ou mal expliqué : ' + r.menu);
  if (!r.etapes.includes('« etapes »')) throw new Error('etapes en objet accepté : ' + r.etapes);
  if (r.nul !== 'CHARGÉE' || r.absents !== 'CHARGÉE') throw new Error('null/undefined doivent valoir « absent » : ' + r.nul + ' / ' + r.absents);
});

await v('creerEntreprise : la table OPTIONS est exactement l\'ensemble des clés que le code du moteur lit (U.xxx et déstructuration), dans les deux sens', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'core', 'types', 'entreprise.js'), 'utf8');
  const lues = new Set([...src.matchAll(/\bU\.([A-Za-z_]\w*)/g)].map((m) => m[1]));
  const destructure = /const \{([\s\S]*?)\} = U;/.exec(src);
  if (!destructure) throw new Error('la déstructuration « const { … } = U; » n\'est plus là : adapter ce cas');
  destructure[1].split(',').map((x) => /^\s*(\w+)/.exec(x)?.[1]).filter(Boolean).forEach((k) => lues.add(k));
  const table = new Set(await page.evaluate(async () => Object.keys((await import('/core/types/entreprise.js')).OPTIONS)));
  const manque = [...lues].filter((k) => !table.has(k));
  const morte = [...table].filter((k) => !lues.has(k));
  if (lues.size < 40) throw new Error(`seulement ${lues.size} clés relevées dans le code (le cas ne doit pas passer à vide)`);
  if (manque.length) throw new Error('lue par le moteur, absente de OPTIONS : ' + manque.join(', '));
  if (morte.length) throw new Error('dans OPTIONS, lue nulle part dans le moteur : ' + morte.join(', '));
});

await v('seanceEntreprise : le refus d\'une option inconnue nomme la séance', async () => {
  const r = await moteurEssai(`
    const contenu = { ETAPES: [{ id: 'a' }] };
    const essaiF = (opts) => { try { F.seanceEntreprise(univers, contenu, { id: 'x-essai', code: 'ENT-9.1' }, opts); return 'CHARGÉE'; } catch (e) { return e.message; } };
    return { faute: essaiF({ finFigé: 'x' }), bon: essaiF({ finFige: 'x' }) };`);
  if (!r.faute.includes('x-essai') || !r.faute.includes('« finFigé »')) throw new Error('le refus ne nomme pas la séance et la clé : ' + r.faute);
  if (r.bon !== 'CHARGÉE') throw new Error('une option connue doit passer par la fabrique : ' + r.bon);
});

await v('creerEntreprise : deux fiches de même id, une fiche sans id : la séance ne se charge pas ; deux ids différents passent', async () => {
  const r = await moteurEssai(`return {
    deux: essai({ fiches: [fiche('a'), fiche('b')] }),
    doublon: essai({ fiches: [fiche('a'), fiche('a')] }),
    unEtMultiples: essai({ fiche: fiche('a'), fiches: [fiche('a')] }),
    sansId: essai({ fiches: [fiche('')] }),
  };`);
  if (r.deux !== 'CHARGÉE') throw new Error('deux fiches d\'id différents doivent passer : ' + r.deux);
  if (!r.doublon.includes('même « id » « a »')) throw new Error('doublon accepté ou mal expliqué : ' + r.doublon);
  if (!r.unEtMultiples.includes('même « id »')) throw new Error('`fiche` et `fiches` de même id acceptés : ' + r.unEtMultiples);
  if (!r.sansId.includes('sans « id »')) throw new Error('une fiche sans id est acceptée : ' + r.sansId);
});

await v('séances d\'entreprise : les 24 séances du registre se chargent sans refus des options', async () => {
  const r = await page.evaluate(async () => {
    try { return { metas: (await (await import('/activites/index.js')).chargerActivites()).map((a) => a.meta.code) }; } catch (e) { return { refus: e.message }; }
  });
  if (r.refus) throw new Error('une séance est refusée au chargement : ' + r.refus);
  const ent = r.metas.filter((c) => /^ENT-\d+\.\d+$/.test(c));
  if (ent.length < 24) throw new Error(`seulement ${ent.length} séances d'entreprise chargées`);
});

}
