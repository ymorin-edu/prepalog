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

// ---------- chantier 16 (09/10/2026) : deux portées seulement, « eleve » et « groupe »
// `equipe` et `commun` ont été retirées (aucune séance, aucun écran, aucune règle ne s'en servait). Deux gardes : le registre
// ne déclare que les deux portées vivantes (toutes les activités, pas seulement celles d'entreprise), et le moteur refuse
// les deux autres à l'ouverture d'une base.
await v('portées : toute activité déclare « eleve » ou « groupe », et le moteur refuse « equipe » et « commun » (calculé depuis le registre)', async () => {
  const r = await page.evaluate(async () => {
    const metas = (await (await import('/activites/index.js')).chargerActivites()).map((a) => a.meta);
    const S = await import('/core/store.js');
    const refus = {};
    for (const p of ['equipe', 'commun']) {
      try { await S.ouvrirJeu({ aid: 'x', portee: p, uid: 'u', gid: 'g' }); refus[p] = 'PAS DE REFUS'; } catch (e) { refus[p] = e.message; }
    }
    return { portees: metas.map((m) => [m.id, m.portee]), liste: S.PORTEES, refus };
  });
  if (r.portees.length < 30) throw new Error(`seulement ${r.portees.length} activités dans le registre : cas à vide`);
  const hors = r.portees.filter(([, p]) => p !== 'eleve' && p !== 'groupe').map(([id, p]) => `${id} : ${p}`);
  if (hors.length) throw new Error('portée inconnue : ' + hors.join(', '));
  if (!r.portees.some(([, p]) => p === 'groupe') || !r.portees.some(([, p]) => p === 'eleve')) throw new Error('une des deux portées n’est plus déclarée nulle part');
  if (JSON.stringify(r.liste) !== JSON.stringify(['eleve', 'groupe'])) throw new Error('PORTEES : ' + JSON.stringify(r.liste));
  for (const p of ['equipe', 'commun']) if (!/Portée inconnue/.test(r.refus[p])) throw new Error(`« ${p} » acceptée : ${r.refus[p]}`);
});

// ---------- chantier 10 (09/10/2026) : un seul drapeau « séance d'entreprise Simulog »
// Trois critères disaient la même chose (rubrique `simulog`, code `ENT-`, `immersif`) sans que rien ne les lie. Le drapeau est
// désormais `estSimulog(meta)` (activites/index.js) : la rubrique. Ces deux cas garantissent que les trois ne divergent pas
// demain, et que le noyau ne retrouve pas ses propres filtres.
await v('Simulog : rubrique « simulog », code ENT- et immersif vont ensemble, et estSimulog les suit (calculé depuis le registre)', async () => {
  const r = await page.evaluate(async () => {
    const I = await import('/activites/index.js');
    const metas = (await I.chargerActivites()).map((a) => a.meta);
    return { lignes: metas.map((m) => ({ id: m.id, code: m.code, rubrique: m.rubrique, immersif: m.immersif, parcours: m.parcours, drapeau: I.estSimulog(m) })),
      vide: [I.estSimulog(undefined), I.estSimulog(null), I.estSimulog({})] };
  });
  const sim = r.lignes.filter((m) => m.rubrique === 'simulog');
  // Plancher, pas liste : le cas ne doit pas passer à vide si le registre se met à ignorer des séances.
  if (sim.length < 24) throw new Error(`seulement ${sim.length} séances de rubrique simulog dans le registre`);
  const problemes = [];
  for (const m of r.lignes) {
    const estEnt = /^ENT-/.test(String(m.code || ''));
    const estRub = m.rubrique === 'simulog';
    if (estRub && !estEnt) problemes.push(`${m.id} : rubrique simulog mais code ${m.code}`);
    if (estEnt && !estRub) problemes.push(`${m.id} : code ${m.code} mais rubrique ${m.rubrique}`);
    if (estRub && m.immersif !== true) problemes.push(`${m.id} : rubrique simulog mais pas immersive`);
    if (m.parcours && !estRub) problemes.push(`${m.id} : déclare un parcours sans être de rubrique simulog (core/parcours.js ne le verrait plus)`);
    if (m.drapeau !== estRub) problemes.push(`${m.id} : estSimulog dit ${m.drapeau} pour la rubrique ${m.rubrique}`);
  }
  if (r.vide.some((x) => x !== false)) problemes.push('estSimulog doit rendre faux pour undefined, null et un meta sans rubrique : ' + r.vide);
  if (problemes.length) throw new Error(problemes.join(' ; '));
});

await v('Simulog : le noyau (core/ et core/types/) ne filtre plus sur le code ENT- ni sur immersif, il demande estSimulog', async () => {
  // Relecture statique. Sont exclus : les commentaires, et UNE seule ligne autorisée, `immersif` comme OPTION D'AFFICHAGE
  // plein écran (core/app.js : « if (m.meta.immersif) { » ouvre la page sans le cadre de l'accueil). La définition d'estSimulog
  // est dans activites/index.js, hors du périmètre relu.
  const AFFICHAGE = /^\s*if \(m\.meta\.immersif\) \{\s*$/;
  const FILTRE = /\/\^ENT|\^ENT-|startsWith\(\s*['"`]ENT|\.immersif\b|\[\s*['"]immersif['"]\s*\]/;
  const fautifs = [];
  let fichiers = 0, autorisees = 0;
  for (const dossier of ['core', path.join('core', 'types')]) {
    for (const e of fs.readdirSync(path.join(ROOT, dossier))) {
      if (!/\.js$/.test(e)) continue;
      fichiers++;
      fs.readFileSync(path.join(ROOT, dossier, e), 'utf8').split('\n').forEach((l, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(l)) return;
        const code = l.replace(/\s\/\/\s.*$/, '');
        if (!FILTRE.test(code)) return;
        if (e === 'app.js' && AFFICHAGE.test(code)) { autorisees++; return; }
        fautifs.push(`${dossier}/${e}:${i + 1} : ${l.trim().slice(0, 90)}`);
      });
    }
  }
  if (fichiers < 30) throw new Error(`seulement ${fichiers} fichiers relus (le cas ne doit pas passer à vide)`);
  if (autorisees !== 1) throw new Error(`l'option d'affichage « if (m.meta.immersif) { » est attendue une fois dans core/app.js, trouvée ${autorisees} fois (exception périmée ?)`);
  if (fautifs.length) throw new Error('filtre « séance d\'entreprise » hors estSimulog : ' + fautifs.join(' ; '));
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

await v('fabrique de séance : « correction: true » est refusé sans aucun jalon à « ecran » (rien à corriger), accepté avec un', async () => {
  const r = await fabrique(`
    const essai = (f) => { try { f(); return 'PAS DE REFUS'; } catch (e) { return e.message; } };
    const avec = [{ id: 'a', ecran: 'fiche:f' }, { id: 'b' }];
    return {
      sans: essai(() => composerSeance(univers, { ETAPES: etapes }, { id: 'x-continue', code: 'ENT-9.1', correction: true })),
      avec: essai(() => composerSeance(univers, { ETAPES: avec }, { id: 'x-envoi', code: 'ENT-9.2', correction: true })),
      pasDeDrapeau: essai(() => composerSeance(univers, { ETAPES: etapes }, { id: 'x-libre', code: 'ENT-9.3' })),
      faux: essai(() => composerSeance(univers, { ETAPES: etapes }, { id: 'x-faux', code: 'ENT-9.4', correction: false })),
    };`);
  if (!r.sans.includes('x-continue') || !r.sans.includes('correction')) throw new Error('correction sans « ecran » acceptée ou mal expliquée : ' + r.sans);
  for (const k of ['avec', 'pasDeDrapeau', 'faux']) if (r[k] !== 'PAS DE REFUS') throw new Error(`${k} refusée à tort : ${r[k]}`);
});

await v('séances d\'entreprise : les 24 séances du registre se chargent sans refus des options', async () => {
  const r = await page.evaluate(async () => {
    try { return { metas: (await (await import('/activites/index.js')).chargerActivites()).map((a) => a.meta.code) }; } catch (e) { return { refus: e.message }; }
  });
  if (r.refus) throw new Error('une séance est refusée au chargement : ' + r.refus);
  // Chantier 9a bis : une séance refusée est ÉCARTÉE sans bruit (l'accueil s'affiche quand même). Le filet ne doit pas
  // rendre la suite aveugle : la liste des échecs doit être vide, et le registre entier doit être là.
  const f = await page.evaluate(async () => {
    const I = await import('/activites/index.js');
    return { echecs: I.activitesEnEchec(), charges: (await I.chargerActivites()).length, attendus: I.ACTIVITES.length };
  });
  if (f.echecs.length) throw new Error('séance(s) écartée(s) au chargement : ' + f.echecs.map((e) => `${e.fichier} — ${e.erreur}`).join(' ; '));
  if (f.charges !== f.attendus) throw new Error(`${f.charges} séances chargées sur ${f.attendus} dans le registre`);
  const ent = r.metas.filter((c) => /^ENT-\d+\.\d+$/.test(c));
  if (ent.length < 24) throw new Error(`seulement ${ent.length} séances d'entreprise chargées`);
});

// ---------- 46. le moteur n'importe plus rien de `contenus/` : couleurs et livraisons viennent de l'univers (chantier 9, lot 9b, 08/10/2026)
// Avant, `core/types/entreprise.js` importait `COLORS`, `SHIP` et `pad` de `contenus/entreprise-commun.js` : un reliquat de Spartoo
// (chaussures en neuf couleurs, trois modes de livraison à prix fixes) dans le moteur de TOUTES les entreprises. Désormais le contenu
// les fournit (options `couleurs` et `livraisons`) et le premier cas ci-dessous empêche le reliquat de revenir.
await v('core/ n\'importe plus aucun fichier de contenus/ (relecture de tous les fichiers de core/ et core/types/)', async () => {
  const fautifs = [];
  let lus = 0;
  for (const dossier of ['core', path.join('core', 'types')]) {
    for (const e of fs.readdirSync(path.join(ROOT, dossier))) {
      if (!/\.js$/.test(e)) continue;
      lus++;
      fs.readFileSync(path.join(ROOT, dossier, e), 'utf8').split('\n').forEach((l, i) => {
        if (/^\s*\/\//.test(l)) return;   // un commentaire qui cite un import (l'en-tête de la fabrique) n'en est pas un
        // `import … from '…/contenus/…'` (y compris la fin d'un import sur plusieurs lignes) et `import '…/contenus/…'`.
        if (/\bfrom\s*['"][^'"]*\/contenus\//.test(l) || /^\s*import\s*['"][^'"]*\/contenus\//.test(l)) fautifs.push(`${dossier}/${e}:${i + 1}`);
      });
    }
  }
  if (lus < 30) throw new Error(`seulement ${lus} fichiers relus dans core/ (le cas ne doit pas passer à vide)`);
  if (fautifs.length) throw new Error('import d\'un fichier de contenus/ dans le moteur : ' + fautifs.join(', '));
});

await v('couleurs et livraisons : options connues (type objet), clés d\'univers facultatives que la fabrique prend univers < séance < options', async () => {
  const r = await moteurEssai(`
    const sans = F.composerSeance(univers, { ETAPES: [{ id: 'a' }] }, { id: 'x-sans', code: 'ENT-9.1' });
    const u = { ...univers, couleurs: { U: ['Univers', '#111'] }, livraisons: { U: ['Univers', 1] } };
    const avecU = F.composerSeance(u, { ETAPES: [{ id: 'a' }] }, { id: 'x-u', code: 'ENT-9.2' });
    const avecS = F.composerSeance(u, { ETAPES: [{ id: 'a' }], livraisons: { S: ['Séance', 2] } }, { id: 'x-s', code: 'ENT-9.3' });
    const avecO = F.composerSeance(u, { ETAPES: [{ id: 'a' }], livraisons: { S: ['Séance', 2] } }, { id: 'x-o', code: 'ENT-9.4' },
      { livraisons: { O: ['Options', 3] } });
    return { sansCles: Object.keys(sans.options).filter((k) => k === 'couleurs' || k === 'livraisons'),
      u: [avecU.options.couleurs, avecU.options.livraisons], s: avecS.options.livraisons, o: avecO.options.livraisons,
      uSeul: avecS.options.couleurs,
      chargee: essai({ couleurs: { U: ['Univers', '#111'] }, livraisons: { U: ['Univers', 1] } }),
      couleursTableau: essai({ couleurs: [] }), livraisonsTexte: essai({ livraisons: 'COL' }),
      cles: Object.keys(E.OPTIONS) };`);
  if (r.sansCles.length) throw new Error('un univers sans couleurs ni livraisons ne doit rien ajouter aux options : ' + r.sansCles.join(', '));
  if (JSON.stringify(r.u) !== '[{"U":["Univers","#111"]},{"U":["Univers",1]}]') throw new Error('l\'univers ne fournit pas les tables : ' + JSON.stringify(r.u));
  if (JSON.stringify(r.s) !== '{"S":["Séance",2]}') throw new Error('le contenu de la séance ne remplace pas l\'univers : ' + JSON.stringify(r.s));
  if (JSON.stringify(r.uSeul) !== '{"U":["Univers","#111"]}') throw new Error('les couleurs de l\'univers se perdent quand la séance ne parle que des livraisons');
  if (JSON.stringify(r.o) !== '{"O":["Options",3]}') throw new Error('les options ne l\'emportent pas : ' + JSON.stringify(r.o));
  if (r.chargee !== 'CHARGÉE') throw new Error('les deux options doivent être acceptées : ' + r.chargee);
  if (!r.couleursTableau.includes('« couleurs »') || !r.livraisonsTexte.includes('« livraisons »')) {
    throw new Error('un mauvais type doit être refusé : ' + r.couleursTableau + ' / ' + r.livraisonsTexte);
  }
  if (!r.cles.includes('couleurs') || !r.cles.includes('livraisons')) throw new Error('OPTIONS ne contient pas les deux nouvelles clés');
});

// Un moteur monté sur de FAUSSES données (un seul article, un seul client, une commande dont le code de livraison est `ZZZ`),
// dans son propre contexte pour ne pas toucher à la page des autres cas.
const ctxL = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const pgL = await ctxL.newPage();
const erreursL = [];
pgL.on('pageerror', (e) => erreursL.push('PAGEERROR: ' + e.message));
pgL.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursL.push('CONSOLE: ' + m.text()); });
await pgL.goto(BASE);
await pgL.waitForSelector('#btnProf');
const texteL = () => pgL.$eval('#hoteL', (e) => e.innerText.replace(/\s+/g, ' '));
const montrerCommande = (extra) => pgL.evaluate(async (extra) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const { catalogueSimple } = await import('/contenus/entreprise-commun.js');
  const client = { id: 'C1', prenom: 'Ada', nom: 'Lovelace', adr: '1 rue du Test', cp: '75001', ville: 'Paris', email: 'a@l.example', tel: '01' };
  document.querySelector('#hoteL')?.remove();
  const hote = document.createElement('div'); hote.id = 'hoteL'; document.body.prepend(hote);
  const db = {};
  const U = { ENTREPRISE: { nom: 'Essai', sousTitre: 's' }, VOCAB: { unit: 'pièce', unitPl: 'pièces', sizeLabel: '', sizeShort: '', mailDomain: 'e.example' },
    CATALOGUE: catalogueSimple([{ ref: 'ART1', designation: 'Article un', marque: 'M', categorie: 'C', prix: 10, cout: 5, emplacement: 'A-01-1', stock: 5 }]),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [client], CM: { C1: client }, THEME: {}, etapes: [], sansTrame: 'x',
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: {}, moves: [], mails: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [],
      orders: [{ no: 'CMD-000001', date: Date.now(), customerId: 'C1', ship: 'ZZZ', lines: [{ sku: 'ART1', qty: 2 }] }] }),
    ...extra };
  const ctx = { meta: { id: 'essai-livraison', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, bareme: 1 },
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-essai' }, jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null };
  creerEntreprise(U).rendre(hote, ctx);
}, extra);
const parcourirCommande = async () => {
  await pgL.click('[data-vue="commandes"]');
  const liste = await texteL();
  await pgL.click('[data-ouvrir-cmd]');
  const fiche = await texteL();
  await pgL.click('[data-vue="console"]');
  await pgL.fill('#champCmd', '.getorder CMD-000001'); await pgL.press('#champCmd', 'Enter');
  return { liste, fiche, console: await texteL() };
};

await v('commande dont le code de livraison est inconnu : elle s\'affiche avec le code en libellé et un port de 0, sans erreur (avec ou sans table)', async () => {
  const avant = erreursL.length;
  for (const [nom, extra] of [['sans table', {}], ['table qui ne connaît pas le code', { livraisons: { COL: ['Colissimo', 4.9] } }]]) {
    await montrerCommande(extra);
    const r = await parcourirCommande();
    if (!r.liste.includes('CMD-000001') || !r.liste.includes('20,00 €')) throw new Error(`${nom} : liste des commandes sans la commande ou sans son total (port 0) : ${r.liste.slice(-200)}`);
    if (!/Livraison ZZZ/.test(r.fiche) || !r.fiche.includes('20,00 € TTC')) throw new Error(`${nom} : fiche de commande sans « Livraison ZZZ » ou sans le total de 20,00 € : ${r.fiche.slice(-400)}`);
    if (!/Livraison\s*ZZZ/.test(r.console) || !r.console.includes('20,00 €')) throw new Error(`${nom} : .getorder sans le code de livraison ou sans le total : ${r.console.slice(-300)}`);
  }
  if (erreursL.length > avant) throw new Error('erreur de page : ' + erreursL.slice(avant).join(' ; '));
});

await v('commande dont le code de livraison est dans la table de l\'univers : libellé et port de la table, dans la liste, la fiche et la console', async () => {
  const avant = erreursL.length;
  await montrerCommande({ livraisons: { ZZZ: ['Camion maison', 5] } });
  const r = await parcourirCommande();
  if (!r.liste.includes('25,00 €')) throw new Error('le port de la table (5 €) n\'est pas dans le total de la liste : ' + r.liste.slice(-200));
  if (!/Livraison Camion maison/.test(r.fiche) || !r.fiche.includes('25,00 € TTC')) throw new Error('la fiche ne montre pas le libellé ou le total de la table : ' + r.fiche.slice(-300));
  if (!/Livraison\s*Camion maison/.test(r.console)) throw new Error('.getorder ne montre pas le libellé de la table : ' + r.console.slice(-300));
  if (erreursL.length > avant) throw new Error('erreur de page : ' + erreursL.slice(avant).join(' ; '));
});
await ctxL.close();

// Les vraies séances : ce que le moteur affichait avant (noms et teintes des couleurs, libellé et port des trois modes de livraison)
// vient maintenant de `contenus/spartoo.js` et de `contenus/cdiscount.js`. Valeurs écrites à la main (le port de Colissimo Domicile
// est de 4,90 €, la commande CMD-048213 de Spartoo vaut 149,99 + 2 × 109,99 + 89,99 = 459,96 € avant port).
const ctxR = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const pgR = await ctxR.newPage();
const erreursR = [];
pgR.on('pageerror', (e) => erreursR.push('PAGEERROR: ' + e.message));
await pgR.goto(BASE);
await pgR.waitForSelector('#btnProf');
const monterReelle = (aid) => pgR.evaluate(async (aid) => {
  const mod = await import('/activites/' + aid + '.js');
  document.querySelector('#hoteR')?.remove();
  const hote = document.createElement('div'); hote.id = 'hoteR'; document.body.prepend(hote);
  const db = {};
  mod.rendre(hote, { meta: mod.meta, profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-reel' }, jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null });
}, aid);
const texteR = () => pgR.$eval('#hoteR', (e) => e.innerText.replace(/\s+/g, ' '));

await v('Spartoo ENT-1.2 : le mail de commande donne le mode de livraison et le port, le catalogue les pastilles de couleur', async () => {
  const mods = await pgR.evaluate(async () => {
    const S = await import('/contenus/spartoo.js'), C = await import('/contenus/cdiscount.js');
    return { couleur: S.couleurs && S.couleurs.NR, nbCouleurs: Object.keys(S.couleurs || {}).length, spartoo: S.livraisons, cdiscount: C.livraisons, couleursCdiscount: C.couleurs };
  });
  if (JSON.stringify(mods.couleur) !== '["Noir","#1f2124"]' || mods.nbCouleurs !== 9) throw new Error('contenus/spartoo.js n\'exporte pas les neuf couleurs : ' + JSON.stringify(mods.couleur) + ' / ' + mods.nbCouleurs);
  const attendu = '{"COL":["Colissimo Domicile",4.9],"CHR":["Chronopost Express",9.9],"REL":["Point Relais",3.9]}';
  if (JSON.stringify(mods.spartoo) !== attendu) throw new Error('livraisons de contenus/spartoo.js : ' + JSON.stringify(mods.spartoo));
  if (JSON.stringify(mods.cdiscount) !== attendu) throw new Error('livraisons de contenus/cdiscount.js : ' + JSON.stringify(mods.cdiscount));
  if (mods.couleursCdiscount !== undefined) throw new Error('Cdiscount n\'a pas de couleurs : rien à exporter');
  await monterReelle('spartoo');
  await pgR.click('[data-vue="mail"]');
  await pgR.locator('.ent-mitem').first().click();
  const mail = await texteR();
  if (!mail.includes('Livraison : Colissimo Domicile') || !mail.includes('Port 4,90 €') || !mail.includes('Total TTC 464,86 €')) {
    throw new Error('le mail de commande ne montre pas le mode de livraison, le port ou le total : ' + mail.slice(-420));
  }
  await pgR.click('button:has-text("Enregistrer la commande")');
  if (!/Livraison Colissimo Domicile/.test(await texteR())) throw new Error('la fiche de commande ne montre pas le mode de livraison');
  await pgR.click('[data-vue="catalogue"]');
  const pastilles = await pgR.$$eval('#hoteR [data-produit]:first-child .teinte', (e) => e.map((x) => `${x.title}|${x.style.background}`));
  // Premier modèle du catalogue : Nike Air Max 270 en Noir, Blanc, Gris (`MODELS_RAW_P42`).
  if (pastilles.length !== 3 || !pastilles[0].startsWith('Noir|') || !pastilles[1].startsWith('Blanc|') || !pastilles[2].startsWith('Gris|')) {
    throw new Error('pastilles du premier modèle : ' + JSON.stringify(pastilles));
  }
  await pgR.locator('#hoteR [data-produit]').first().click();
  if (!/Noir/.test(await texteR())) throw new Error('la fiche produit ne nomme pas la couleur');
});

await v('Spartoo ENT-1.3 et Cdiscount : les trois modes de livraison (Colissimo, Point Relais, Chronopost) s\'affichent sur les fiches de commande', async () => {
  const vus = new Set();
  for (const aid of ['spartoo-tracabilite', 'cdiscount-chiffres']) {
    await monterReelle(aid);
    await pgR.click('[data-vue="commandes"]');
    const n = await pgR.locator('[data-ouvrir-cmd]').count();
    if (n < 3) throw new Error(`${aid} : ${n} commandes seulement dans la liste`);
    for (let i = 0; i < Math.min(n, 12); i++) {
      await pgR.click('[data-vue="commandes"]');
      await pgR.locator('[data-ouvrir-cmd]').nth(i).click();
      const m = /Livraison (Colissimo Domicile|Chronopost Express|Point Relais)/.exec(await texteR());
      if (!m) throw new Error(`${aid} : la commande n° ${i + 1} ne montre pas un mode de livraison connu`);
      vus.add(m[1]);
    }
  }
  if (vus.size !== 3) throw new Error('modes de livraison vus : ' + [...vus].join(', '));
  if (erreursR.length) throw new Error('erreur de page : ' + erreursR.join(' ; '));
});
await ctxR.close();

// ---------- 45. une séance qui refuse de se charger n'empêche pas le site de s'afficher (chantier 9a bis, 08/10/2026)
// Avant, `Promise.all` dans `chargerActivites()` : UN fichier fautif et plus aucun accueil pour personne. On casse ici une
// séance SANS toucher au dépôt (le serveur de test sert son fichier réécrit : `menu:` devient `menuu:`, une option que
// `creerEntreprise` refuse depuis le lot 9a). Contexte à part, avec sa propre base de démonstration.
const CASSEE = 'cdiscount-chiffres';
const ctxC = await nav.newContext({ viewport: { width: 1280, height: 900 } });
await ctxC.route(`**/activites/${CASSEE}.js*`, async (route) => {
  const r = await route.fetch();
  await route.fulfill({ response: r, body: (await r.text()).replace(/\n(\s*)menu:/, '\n$1menuu:') });
});
const pgC = await ctxC.newPage();
pgC.setDefaultTimeout(6000);
const horsAttendu = [];   // toute erreur de page autre que le message de la séance écartée
const attendu = [];       // le message de la console propre à la séance écartée
pgC.on('pageerror', (e) => horsAttendu.push('PAGEERROR: ' + e.message));
pgC.on('console', (m) => {
  if (m.type() !== 'error' || /Failed to load resource.*\b404\b/.test(m.text())) return;
  if (m.text().startsWith(`Séance écartée (${CASSEE}.js)`)) { attendu.push(m.text()); return; }
  horsAttendu.push('CONSOLE: ' + m.text());
});
pgC.on('dialog', (d) => d.accept());
await pgC.goto(BASE);
await pgC.waitForSelector('#btnProf');
const graine = await pgC.evaluate(async (AID) => {
  const { creerBackendDemo } = await import('/core/backend-demo.js');
  const B = creerBackendDemo();
  const prof = (await B.connexionProf()).uid;
  const g = await B.creerGroupe({ nom: 'Essai écartée', annee: '', niveau: '1re', profUid: prof });
  await B.creerEleves(g.id, [{ nom: 'ECART', prenom: 'Eva', matricule: 'ze01', code: 'c1' }]);
  const uid = (await B.elevesDuGroupe(g.id))[0].uid;
  await B.ecrireScore(g.id, uid, AID, { score: 2, max: 3 });
  await B.poserLigne('classements', AID, uid, { gid: g.id, groupe: 'ZZ', score: 2, max: 3, temps: 3, ts: 1 });
  await B.deconnexion();
  return { gid: g.id, uid };
}, CASSEE);
const dehors = async () => {
  await pgC.reload();
  await pgC.waitForSelector('#btnProf, #btnDeco');
  if (await pgC.$('#btnDeco')) { await pgC.click('#btnDeco'); await pgC.waitForSelector('#btnProf'); }
};

await v('séance refusée : l\'élève a son accueil, sans la séance, sans carte ni message', async () => {
  await dehors();
  await pgC.fill('#mat', 'ze01');
  await pgC.fill('#code', 'c1');
  await pgC.click('#btnEleve');
  await pgC.waitForSelector('text=Bonjour Eva');
  const r = await pgC.evaluate(async () => {
    const I = await import('/activites/index.js');
    const mods = await I.chargerActivites();
    return { ids: mods.map((m) => m.meta.id), attendus: I.ACTIVITES.length, echecs: I.activitesEnEchec(),
      pastilles: document.querySelectorAll('.rubrique').length, texte: document.body.innerText,
      avis: document.querySelectorAll('[data-seance-ecartee]').length };
  });
  if (r.ids.includes(CASSEE)) throw new Error('la séance cassée est restée au registre');
  if (r.ids.length !== r.attendus - 1) throw new Error(`${r.ids.length} séances chargées au lieu de ${r.attendus - 1}`);
  if (r.echecs.length !== 1 || r.echecs[0].fichier !== `${CASSEE}.js`) throw new Error('échec mal retenu : ' + JSON.stringify(r.echecs));
  if (!r.echecs[0].erreur.includes('menuu')) throw new Error('le message du moteur n\'est pas retenu tel quel : ' + r.echecs[0].erreur);
  if (r.pastilles < 3) throw new Error('l\'accueil n\'a pas ses rubriques : ' + r.pastilles);
  if (r.avis || /n'a pas pu se charger|cdiscount-chiffres/i.test(r.texte)) throw new Error('l\'élève voit l\'échec : ' + r.texte.slice(0, 200));
  if (attendu.length !== 1) throw new Error(`${attendu.length} message(s) « Séance écartée » dans la console au lieu d'un`);
  if (horsAttendu.length) throw new Error('erreur inattendue dans la page : ' + horsAttendu.join(' | '));
});

await v('séance refusée : l\'enseignant lit en haut de l\'accueil le fichier et le message du moteur', async () => {
  await dehors();
  await pgC.click('#btnProf');
  await pgC.waitForSelector('#btnProfEspace');
  const lignes = await pgC.$$eval('[data-seance-ecartee]', (els) => els.map((e) => ({ f: e.dataset.seanceEcartee, t: e.textContent.trim(),
    cl: e.className, avantRubriques: !!(e.compareDocumentPosition(document.querySelector('.rubrique')) & Node.DOCUMENT_POSITION_FOLLOWING) })));
  const erreur = await pgC.evaluate(async () => (await import('/activites/index.js')).activitesEnEchec()[0].erreur);
  if (lignes.length !== 1) throw new Error(`${lignes.length} avis au lieu d'un : ` + JSON.stringify(lignes));
  const [l] = lignes;
  if (l.f !== `${CASSEE}.js`) throw new Error('fichier : ' + l.f);
  if (!l.t.startsWith('Une séance n\'a pas pu se charger et n\'est pas proposée aux élèves : ' + CASSEE + '.js — ')) throw new Error('début du message : ' + l.t);
  if (!l.t.endsWith(erreur)) throw new Error('le message du moteur n\'est pas repris tel quel : ' + l.t);
  if (!erreur.includes('menuu')) throw new Error('le message du moteur ne nomme pas l\'option fautive : ' + erreur);
  if (!l.avantRubriques) throw new Error('l\'avis n\'est pas au-dessus des rubriques');
  if (!/avis-err/.test(l.cl)) throw new Error('classe : ' + l.cl);
});

await v('séance refusée : suivi, compétences et conduite de séance s\'ouvrent malgré un score enregistré sur elle, sans sa tuile', async () => {
  // Le score de la séance cassée existe (semé plus haut) : l'espace enseignant ne doit ni planter ni afficher d'erreur.
  const avant = horsAttendu.length;
  await pgC.click('#btnProfEspace');
  for (const ong of ['suivi', 'competences', 'seance']) {
    await pgC.click(`[data-ong="${ong}"]`);
    await pgC.waitForTimeout(600);
    const r = await pgC.evaluate((AID) => {
      const z = document.querySelector('#contenuProf');
      return { chargement: /Chargement du suivi|Chargement des compétences/.test(z.innerText), taille: z.innerText.length,
        tuile: !!z.querySelector(`[data-ouvre="${AID}"]`) || z.innerText.includes('ENT-2.2') };
    }, CASSEE);
    if (r.chargement || r.taille < 50) throw new Error(`l'onglet ${ong} ne s'est pas affiché`);
    if (r.tuile) throw new Error(`l'onglet ${ong} propose encore la séance écartée`);
  }
  if (horsAttendu.length !== avant) throw new Error('erreur dans la page : ' + horsAttendu.slice(avant).join(' | '));
});

await v('séance refusée : supprimer un élève efface aussi son classement dans la séance écartée', async () => {
  const dans = () => pgC.evaluate((AID) => Object.keys(JSON.parse(localStorage.getItem('prepalog:classements/' + AID) || '{}')), CASSEE);
  if (!(await dans()).includes(graine.uid)) throw new Error('le classement semé n\'est pas là avant la suppression');
  await pgC.click('[data-ong="comptes"]');
  await pgC.waitForSelector(`[data-suppre="${graine.uid}"]`);
  await pgC.click(`[data-suppre="${graine.uid}"]`);
  await pgC.waitForFunction((uid) => !document.querySelector(`[data-suppre="${uid}"]`), graine.uid);
  if ((await dans()).includes(graine.uid)) throw new Error('le classement de l\'élève supprimé reste dans la séance écartée (ligne invisible)');
});
await ctxC.close();

// ---------- chantier 13 (09/10/2026) : les trois blocs de variables de la charte déclarent les mêmes noms
// `styles/base.css` déclare la charte TROIS fois (thème clair, thème sombre choisi, thème sombre du système) et la
// consigne du projet est de toujours les modifier ensemble. Une variable oubliée dans un bloc n'est pas une erreur du
// navigateur : elle retombe sur la valeur d'un autre thème, et l'écran devient illisible dans UN thème seulement. Le cas
// compare les ENSEMBLES de noms (les valeurs diffèrent, c'est le but) et nomme la variable et le bloc fautifs.
await v('charte : les trois blocs de variables de base.css (clair, sombre, sombre du système) déclarent les mêmes noms', async () => {
  const css = fs.readFileSync(path.join(ROOT, 'styles', 'base.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  // Le corps d'un bloc : de l'accolade qui suit le sélecteur à son accolade fermante (accolades imbriquées comptées).
  const corps = (selecteur) => {
    const d = css.indexOf(selecteur);
    if (d < 0) throw new Error(`bloc introuvable dans base.css : ${selecteur}`);
    const ouvre = css.indexOf('{', d + selecteur.length);
    let prof = 0;
    for (let i = ouvre; i < css.length; i++) {
      if (css[i] === '{') prof++;
      else if (css[i] === '}' && --prof === 0) return css.slice(ouvre + 1, i);
    }
    throw new Error(`bloc non refermé : ${selecteur}`);
  };
  const noms = (texte) => new Set([...texte.matchAll(/(?:^|[;{\s])(--[A-Za-z0-9_-]+)\s*:/g)].map((m) => m[1]));
  const blocs = {
    'clair (:root, :root[data-theme="clair"])': noms(corps(':root, :root[data-theme="clair"]')),
    'sombre (:root[data-theme="sombre"])': noms(corps(':root[data-theme="sombre"]')),
    'système sombre (@media prefers-color-scheme: dark)': noms(corps(':root:not([data-theme="clair"])')),
  };
  // Le bloc du système est le premier `:root:not(...)` : on vérifie qu'il est bien dans l'@media de la charte.
  const dMedia = css.indexOf('@media (prefers-color-scheme: dark){');
  const dBloc = css.indexOf(':root:not([data-theme="clair"]){');
  if (dMedia < 0 || dBloc < dMedia || css.slice(dMedia + '@media (prefers-color-scheme: dark){'.length, dBloc).trim()) {
    throw new Error('le bloc « système sombre » n’est plus le premier contenu d’un @media (prefers-color-scheme: dark)');
  }
  const toutes = new Set(Object.values(blocs).flatMap((e) => [...e]));
  if (toutes.size < 20) throw new Error(`seulement ${toutes.size} variables lues dans base.css : l'analyse ne lit plus la charte`);
  // Deux variables ne dépendent pas du thème (le rayon des angles et la police à chasse fixe) : elles sont
  // déclarées dans le seul bloc clair, dont le sélecteur `:root` s'applique aussi en sombre. Liste écrite ici
  // exprès : une variable de COULEUR oubliée dans un bloc sombre ne s'y cache pas. Si l'une d'elles gagne une
  // valeur par thème, elle doit rejoindre les trois blocs et sortir de cette liste.
  const COMMUNES = ['--r', '--mono'];
  const clair = blocs[Object.keys(blocs)[0]];
  const manques = [];
  for (const nom of COMMUNES) {
    if (!clair.has(nom)) manques.push(`${nom} est dans la liste des variables communes mais le bloc clair ne la déclare plus`);
    for (const [bloc, ens] of Object.entries(blocs).slice(1)) if (ens.has(nom)) manques.push(`${nom} est déclarée par thème dans le bloc ${bloc} : la sortir de la liste des variables communes et la mettre dans les trois blocs`);
  }
  for (const nom of [...toutes].sort()) {
    if (COMMUNES.includes(nom)) continue;
    for (const [bloc, ens] of Object.entries(blocs)) if (!ens.has(nom)) manques.push(`${nom} manque au bloc ${bloc}`);
  }
  if (manques.length) throw new Error(manques.join(' ; '));
});


// ---------- 42. un seul mélange, non biaisé (chantier 14, 09/10/2026)
// `sort(() => Math.random() - 0.5)` est biaisé sur quatre éléments (mesuré le 09/10/2026, 20 000 tirages) :
// dans Node, A en tête 36 % et B 14 % ; dans Chromium, A 32 %, B 32 %, D 15 %. Le Fisher-Yates de
// `core/tirage.js` donne ~25 % partout. Fourchette écrite à la main : 20 000 tirages, écart-type 0,3 point, donc
// 22–28 % (dix écarts-types) ne tombe jamais par hasard, et le biais ancien en sort dans les deux moteurs
// (avec 2 000 tirages et 20–30 %, le sabotage ne tombait que deux fois sur trois).
await v('mélange : chaque élément arrive en tête entre 22 % et 28 % des fois (20 000 tirages de 4), la liste de départ reste intacte', async () => {
  const r = await page.evaluate(async () => {
    const { melangerListe } = await import('/core/tirage.js');
    const dep = ['A', 'B', 'C', 'D'];
    const tete = { A: 0, B: 0, C: 0, D: 0 };
    for (let i = 0; i < 20000; i++) tete[melangerListe(dep)[0]]++;
    return { tete, dep };
  });
  const hors = Object.entries(r.tete).filter(([, n]) => n < 4400 || n > 5600).map(([k, n]) => `${k} ${n / 200} %`);
  if (hors.length) throw new Error('mélange biaisé : ' + hors.join(', ') + ' en tête sur 20000 tirages');
  if (r.dep.join('') !== 'ABCD') throw new Error('la liste de départ a été modifiée : ' + r.dep.join(''));
});

await v('mélange : plus aucune vue ne mélange par `sort(() => Math.random() - 0.5)`', async () => {
  const dossier = path.join(ROOT, 'core');
  const fautifs = [];
  const lire = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((f) => {
    const c = path.join(d, f.name);
    if (f.isDirectory()) lire(c);
    else if (f.name.endsWith('.js') && /Math\.random\(\)\s*-\s*0\.5/.test(fs.readFileSync(c, 'utf8'))) fautifs.push(path.relative(ROOT, c));
  });
  lire(dossier);
  if (fautifs.length) throw new Error('mélange biaisé dans : ' + fautifs.join(', ') + ' (utiliser melangerListe de core/tirage.js)');
});

// ---------- chantier 15 (09/10/2026) : une vue générique ne porte pas les couleurs d'une entreprise
// `core/types/carte.js` écrivait la menthe, le jaune et le bleu de Boost dans sa légende. Elle les lit maintenant sur la
// charte (`var(--vert)`, `var(--terre)`, `var(--ardoise-fond)`), comme `plan.js`. Sentinelles : les trois valeurs retirées, puis
// toute couleur écrite en dur (hexadécimal ou `rgb(`) : une quatrième réapparaîtrait par le même chemin.
await v('carte : aucune couleur de Boost (ni aucune couleur en dur) dans core/types/carte.js, la légende lit la charte', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'core', 'types', 'carte.js'), 'utf8');
  const trouvees = src.match(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/g) || [];
  if (trouvees.length) throw new Error('couleur écrite en dur dans carte.js : ' + [...new Set(trouvees)].join(', '));
  for (const h of ['#25c998', '#f0bd3c', '#345cfd']) if (src.toLowerCase().includes(h)) throw new Error('couleur de Boost dans carte.js : ' + h);
  for (const v2 of ['var(--vert)', 'var(--terre)', 'var(--ardoise-fond)']) {
    if (!src.includes(v2)) throw new Error('la légende de la carte ne lit plus ' + v2 + ' sur la charte');
  }
});

// Le thème « papier » (Picard, Smoby) n'est plus recopié en JavaScript : `styleTheme` ne pose que l'accent, et la classe
// `theme-papier` relit les blocs clairs du CSS. Le cas nomme les deux moitiés : la copie ne revient pas dans le JS, et la classe
// reste bien déclarée dans CHACUN des quatre blocs clairs (base, quai, planning, plan d'entrepôt).
await v('papier : styleTheme ne recopie plus le thème clair, la classe theme-papier est déclarée dans les quatre blocs clairs', async () => {
  const r = await page.evaluate(async () => {
    const m = await import('/core/types/entreprise-theme.js');
    return { style: m.styleTheme({ accent: '#0011ac', papier: true }), classe: m.classeTheme({ papier: true }),
      sombre: m.classeTheme({ papier: true, sombre: { fond: '#000' } }), sans: m.classeTheme({ accent: '#0011ac' }) };
  });
  if (/--fond|--panneau|--pe-|--pl-|--quai-/.test(r.style)) throw new Error('le thème clair est recopié dans styleTheme : ' + r.style.slice(0, 120));
  if (!r.style.includes('--ardoise:#0011ac')) throw new Error('l’accent de l’entreprise a disparu de styleTheme : ' + r.style);
  if (r.classe !== 'theme-papier' || r.sombre !== '' || r.sans !== '') throw new Error('classeTheme : ' + JSON.stringify(r));
  for (const f of ['base', 'quai', 'planning', 'entrepot']) {
    const css = fs.readFileSync(path.join(ROOT, 'styles', f + '.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    if (!/:root[^{}]*\.theme-papier\s*\{/.test(css)) throw new Error(`styles/${f}.css : le bloc clair ne porte plus la classe .theme-papier`);
  }
});

// ---------- chantier 15 : base.css ne porte que la charte et le site ; une feuille par vue
// Le quiz, la carte, le plan, la grille et l'inventaire ont leur feuille (styles/quiz.css, carte.css, plan.css, grille.css,
// inventaire.css), chargée après base.css comme quai, planning, entrepot, animation et questions. Les sentinelles sont les
// préfixes de classes propres à chaque vue : `ct-` (carte), `qz-` et `calc-` (quiz, calculette), `inv-` (inventaire), `plan-`
// et `gr-`. Il en reste deux, tolérées par leur nom : la règle `.avis-ok`, partagée entre grille, tournée et plan.
await v('base.css : plus aucune classe propre au quiz, à la carte, au plan, à la grille ni à l’inventaire ; chaque feuille de styles/ est chargée une fois par index.html', async () => {
  const lire = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const base = lire('styles/base.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const classes = (pref) => [...new Set([...base.matchAll(new RegExp(String.raw`\.(${pref}-[\w-]+)`, 'g'))].map((m) => m[1]))];
  const intrus = [...classes('ct'), ...classes('qz'), ...classes('calc'), ...classes('inv')];
  const toleres = new Set(['plan-reperage', 'gr-bloc']);
  for (const c of [...classes('plan'), ...classes('gr')]) if (!toleres.has(c)) intrus.push(c);
  if (intrus.length) throw new Error('base.css porte encore du CSS de vue : .' + intrus.join(', .') + ' (à mettre dans la feuille de la vue)');
  // Chaque feuille de vue porte bien sa propre classe racine.
  const attendu = { carte: '.ct-cadre-carte', quiz: '.qz-', plan: '.plan-svg', grille: '.gr-table', inventaire: '.inv-papier' };
  for (const [f, sel] of Object.entries(attendu)) {
    if (!lire(`styles/${f}.css`).includes(sel)) throw new Error(`styles/${f}.css ne contient plus ${sel}`);
  }
  // index.html charge chaque feuille du dossier exactement une fois, et les feuilles de vue APRÈS base.css.
  const html = lire('index.html');
  const liens = [...html.matchAll(/<link rel="stylesheet" href="\.\/styles\/([\w-]+\.css)">/g)].map((m) => m[1]);
  const presentes = fs.readdirSync(path.join(ROOT, 'styles')).filter((f) => f.endsWith('.css'));
  for (const f of presentes) {
    const n = liens.filter((l) => l === f).length;
    if (n !== 1) throw new Error(`index.html charge styles/${f} ${n} fois (une seule attendue)`);
  }
  for (const l of liens) if (!presentes.includes(l)) throw new Error(`index.html charge styles/${l}, qui n'existe pas`);
  const rangBase = liens.indexOf('base.css');
  for (const f of Object.keys(attendu)) if (liens.indexOf(f + '.css') < rangBase) throw new Error(`styles/${f}.css est chargée avant base.css`);
});

// ---------- chantier 17. contenus/ : aucune image, classeur ni fichier de données sans référence
// Un logo, une photo, un classeur ou un fichier de données que plus rien ne cite est un orphelin : il pèse dans le dépôt
// et fait croire qu'il sert. Le test lit tout le texte du dépôt (code, HTML, CSS, générateurs, docs) et cherche le NOM de
// chaque fichier. Hors champ, exprès : `A-SUPPRIMER-*` (déjà écarté, on ne le supprime jamais soi-même) ; les trames et
// intentions (docx, pdf), dont la déclaration est une décision de Tristan ; les corrigés `contenus/corriges/`, dont le
// chemin se déduit du `code` de la séance (`./contenus/corriges/${code}.js`), donc sans nom écrit nulle part.
await v('contenus/ : chaque image, classeur et fichier de données est cité au moins une fois dans le dépôt', async () => {
  const SAUTES = ['.git', 'node_modules', 'vendor', '.claude', 'paquets'];
  const TEXTE = /\.(js|mjs|css|html|md|py|json|txt|svg|bat)$/;
  const CONTENU = /\.(jpe?g|png|gif|webp|svg|xlsx|js)$/;
  const lus = [];
  const candidats = [];
  const parcourir = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      const rel = path.relative(ROOT, f).split(path.sep).join('/');
      if (e.isDirectory()) { if (!SAUTES.includes(e.name)) parcourir(f); continue; }
      if (rel.startsWith('contenus/') && !rel.startsWith('contenus/corriges/') && CONTENU.test(e.name)
        && !e.name.startsWith('A-SUPPRIMER-')) candidats.push({ rel, nom: e.name });
      if (TEXTE.test(e.name)) lus.push({ rel, texte: fs.readFileSync(f, 'utf8') });
    }
  };
  parcourir(ROOT);
  if (candidats.length < 100) throw new Error(`seulement ${candidats.length} fichiers examinés dans contenus/ : le parcours est cassé`);
  const orphelins = candidats.filter((c) => !lus.some((t) => t.rel !== c.rel && t.texte.includes(c.nom))).map((c) => c.rel);
  if (orphelins.length) throw new Error('fichier de contenus/ cité nulle part (le renommer A-SUPPRIMER-… ou le déclarer) : ' + orphelins.join(', '));
});

}
