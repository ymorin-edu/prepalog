// Suite de tests de Prepalog — bloc « cdiscount » : l'univers Cdiscount et ses séances ENT-2.x.
//
// Créé le 02/10/2026 par le chantier D (voir `claude/prepalog-chantiers-en-cours.md`). Ce bloc
// ne dépend d'aucun autre : il tourne seul (`node outils/test.mjs cdiscount`) comme dans la
// suite entière.
//
// **Les séances sont ouvertes sans passer par l'accueil.** Une séance en cours d'écriture porte
// `pret: false` : `activiteVisible()` la cache à tout le monde, enseignant compris, et aucune
// tuile ne permet de l'ouvrir. Le bloc importe donc le module de la séance dans la page et le
// rend dans un conteneur à lui, avec un contexte minimal (une base en mémoire, un élève fictif).
// C'est le même `rendre(hote, ctx)` que celui de l'application : le moteur est le vrai.
//
// Lire un jalon : on appelle `ETAPES[n].verifier(db)` directement sur la base (alerte n° 20).

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function bloc({ v, page, nav, ROOT }) {
  const imp = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
  const CD = await imp('contenus/cdiscount.js');
  const S21 = await imp('contenus/cdiscount-mouvements.js');

  // Ce que fait le moteur à l'ouverture d'une séance (`creerEntreprise`, semerVolet), refait ici
  // pour juger les données sans navigateur : base de départ, puis volet de la séance.
  const ouvrir = (S, prenom = 'Léa') => {
    const db = S.baseDeDepart(prenom);
    ['moves', 'mails', 'orders', 'receptions', 'customers', 'suppliers'].forEach((k) => { if (!db[k]) db[k] = []; });
    const g = S.VOLET.semer(prenom, db) || {};
    (g.receptions || []).forEach((r) => db.receptions.push(r));
    (g.orders || []).forEach((o) => db.orders.push(o));
    (g.mouvements || []).forEach((m) => {
      db.stock[m.sku] = (db.stock[m.sku] == null ? 0 : db.stock[m.sku]) + m.delta;
      db.moves.push({ ...m, after: db.stock[m.sku] });
    });
    (g.mails || []).forEach((m) => db.mails.push(m));
    return db;
  };
  const statuts = (S, db) => S.ETAPES.map((e) => e.verifier(db, { CATALOGUE: S.CATALOGUE, SUP_BY_ID: CD.SUP_BY_ID }).status);
  const repondre = (db, texte) => db.mails.push({ folder: 'out', ts: Date.now() + db.mails.length,
    toMail: CD.EQUIPE.cheffe.mail, subject: 'RE : x', text: texte });

  // ---------- l'univers
  await v('Cdiscount : catalogue simple cohérent (références et emplacements uniques, prix, seuils)', async () => {
    const { MODELS, VARIANTS, VM } = CD.CATALOGUE;
    if (MODELS.length !== 24) throw new Error(`${MODELS.length} modèles au lieu de 24`);
    const skus = new Set(VARIANTS.map((x) => x.sku));
    if (skus.size !== VARIANTS.length) throw new Error('référence article en double');
    const locs = VARIANTS.map((x) => x.loc);
    if (new Set(locs).size !== locs.length) throw new Error('deux articles au même emplacement');
    if (!CD.CATALOGUE.simple) throw new Error('le catalogue Cdiscount doit être un catalogue simple (sans couleur ni taille)');
    for (const x of VARIANTS) {
      if (!/^[ABC]-\d{2}-[12]$/.test(x.loc)) throw new Error(`emplacement mal formé : ${x.loc}`);
      if (VM[x.sku] !== x) throw new Error(`index cassé : ${x.sku}`);
      if (!CD.SUP_BY_ID[x.model.sup]) throw new Error(`fournisseur inconnu : ${x.sku}`);
      if (x.model.price / 1.2 <= x.model.cost) throw new Error(`vendu à perte : ${x.sku}`);
      if (!(x.model.min < x.model.max)) throw new Error(`seuil ≥ maximum : ${x.sku}`);
    }
    // Les huit articles de la maquette Inventaire validée le 02/10, à leurs emplacements.
    const maquette = { 'CAB-USBC-1M': 'A-01-1', 'CHG-20W': 'A-01-2', 'ECO-BT-01': 'A-02-1', 'SOU-SF-02': 'A-02-2',
      'BAT-10K': 'A-03-1', 'CLE-64G': 'A-03-2', 'AMP-LED-E27': 'A-04-1', 'COQ-UNI-01': 'A-04-2' };
    for (const [ref, loc] of Object.entries(maquette)) {
      if (VM[ref].loc !== loc) throw new Error(`${ref} n'est plus en ${loc} comme sur la maquette`);
    }
  });

  await v('Cdiscount : rien de réel n\'est joignable (téléphones de fiction, adresses .example)', async () => {
    const tels = [...CD.SUPPLIERS.map((s) => s.tel)];
    const mails = [...CD.SUPPLIERS.map((s) => s.email), ...CD.CUSTOMERS.map((c) => c.email),
      ...Object.values(CD.EQUIPE).map((p) => p.mail)];
    const malTel = tels.filter((t) => !/^05 36 49 \d\d \d\d$/.test(t));
    if (malTel.length) throw new Error('téléphone hors plage de fiction : ' + malTel.join(', '));
    const malMail = mails.filter((m) => !/@[a-z.-]+\.example$/.test(m));
    if (malMail.length) throw new Error('adresse hors .example : ' + malMail.join(', '));
  });

  await v('Cdiscount : le logo est dans le dépôt, en PNG, et la charte garde un vert distinct de l\'accent', async () => {
    const f = path.join(ROOT, CD.ENTREPRISE.logo.replace(/^\.\//, ''));
    if (!fs.existsSync(f)) throw new Error('logo absent : ' + CD.ENTREPRISE.logo);
    const b = fs.readFileSync(f);
    if (b.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('le logo n\'est pas un PNG');
    if (b.length < 2000) throw new Error(`logo suspect (${b.length} octets)`);
    if (CD.THEME.accent.toLowerCase() !== '#3732ff') throw new Error('accent hors charte');
    if (CD.CHARTE.conforme.toLowerCase() === CD.THEME.accent.toLowerCase()) throw new Error('vert « conforme » confondu avec l\'accent');
    if (CD.THEME.sombre) throw new Error('Cdiscount est un site clair : pas de palette sombre');
  });

  // ---------- ENT-2.1 « Le stock raconte » — les données
  await v('ENT-2.1 : volume déclaré = volume réel (5 références, 10 documents, 19 mouvements)', async () => {
    const db = ouvrir(S21);
    const refs = new Set(db.moves.map((m) => m.sku));
    const docs = new Set(db.moves.map((m) => m.ref));
    const vol = { references: refs.size, documents: docs.size, mouvements: db.moves.length };
    for (const k of Object.keys(S21.VOLUME)) {
      if (S21.VOLUME[k] !== vol[k]) throw new Error(`${k} : déclaré ${S21.VOLUME[k]}, réel ${vol[k]}`);
    }
    if (S21.CATALOGUE.VARIANTS.length !== 5) throw new Error('la séance montre plus que ses cinq références');
    // Guidage : 4 à 6 références (`claude/prepalog-montee-en-competences.md`).
    if (refs.size < 4 || refs.size > 6) throw new Error(`${refs.size} références pour un guidage`);
    // Le module d'activité importe le moteur, qui suppose un navigateur : on le lit dans la page.
    const meta = await page.evaluate(async () => (await import('/activites/cdiscount-mouvements.js')).meta);
    if (JSON.stringify(meta.volume) !== JSON.stringify(S21.VOLUME)) throw new Error('le meta ne déclare pas le volume de la séance');
  });

  await v('ENT-2.1 : chaque mouvement a son document, et le stock « après » se suit sans trou', async () => {
    const db = ouvrir(S21);
    const recs = new Set(db.receptions.map((r) => r.no));
    const bps = new Set(db.orders.map((o) => 'BP-' + o.no.replace('CMD-', '')));
    const sujets = db.mails.map((m) => m.subject + ' ' + m.text).join('\n');
    for (const m of db.moves) {
      const trouve = recs.has(m.ref) || bps.has(m.ref) || sujets.includes(m.ref);
      if (!trouve) throw new Error(`mouvement sans document : ${m.sku} ${m.type} ${m.ref}`);
      if (!Object.values(S21.TYPES).includes(m.type)) throw new Error(`type de mouvement inattendu : ${m.type}`);
    }
    for (let i = 1; i < db.moves.length; i++) {
      if (db.moves[i].ts < db.moves[i - 1].ts) throw new Error('mouvements dans le désordre');
    }
    if (db.moves.some((m) => m.ts > Date.now())) throw new Error('un mouvement est daté dans le futur');
    if (db.moves.some((m) => m.ts < S21.dateInventaire())) throw new Error('un mouvement est antérieur à l\'inventaire');
    // Rejouer les mouvements depuis l'inventaire doit redonner le stock affiché, ligne à ligne.
    const s = { ...S21.INVENTAIRE };
    for (const m of db.moves) {
      s[m.sku] += m.delta;
      if (m.after !== s[m.sku]) throw new Error(`stock après faux sur ${m.sku} (${m.ref})`);
    }
    for (const k of Object.keys(s)) if (s[k] !== db.stock[k]) throw new Error(`stock final faux : ${k}`);
    // Les réceptions semées sont validées, et entrent ce qu'annonce leur bon.
    for (const r of db.receptions) {
      if (!r.ctrl.validated) throw new Error(`réception ${r.no} non validée`);
      const parColis = {};
      r.colis.forEach((c) => { parColis[c.sku] = (parColis[c.sku] || 0) + c.qty; });
      r.bl.lines.forEach((l) => { if (parColis[l.sku] !== l.qty) throw new Error(`${r.no} : colis et bon de livraison divergent`); });
    }
    // Le « vu en stock » des bons de préparation est le stock juste avant la sortie.
    for (const o of db.orders) for (const l of o.lines) {
      const m = db.moves.find((x) => x.ref === 'BP-' + o.no.replace('CMD-', '') && x.sku === l.sku);
      if (o.prep.rows[l.sku].seen !== m.after + l.qty) throw new Error(`${o.no} : « vu en stock » incohérent`);
    }
  });

  await v('ENT-2.1 : l\'enquête a des pièges (une réception et une commande sans écouteurs, une entrée qui n\'est pas un achat, une sortie qui n\'est pas une vente)', async () => {
    const db = ouvrir(S21);
    const eco = db.moves.filter((m) => m.sku === S21.CIBLE);
    const recEco = new Set(eco.filter((m) => m.type === S21.TYPES.reception).map((m) => m.ref));
    const bpEco = new Set(eco.filter((m) => m.type === S21.TYPES.preparation).map((m) => m.ref));
    if (!db.receptions.some((r) => !recEco.has(r.no))) throw new Error('toutes les réceptions concernent les écouteurs : rien à trier');
    if (!db.orders.some((o) => !bpEco.has('BP-' + o.no.replace('CMD-', '')))) throw new Error('toutes les commandes concernent les écouteurs : rien à trier');
    if (!eco.some((m) => m.type === S21.TYPES.retour && m.delta > 0)) throw new Error('pas de retour client sur la cible');
    if (!eco.some((m) => m.type === S21.TYPES.casse && m.delta < 0)) throw new Error('pas de casse sur la cible');
    // Le stock d'inventaire ne doit pas se lire tel quel : il diffère du stock actuel.
    if (S21.INVENTAIRE[S21.CIBLE] === db.stock[S21.CIBLE]) throw new Error('stock actuel = stock d\'inventaire : rien à recalculer');
  });

  // ---------- ENT-2.1 — les jalons
  const JUSTE = `Stock actuel : 27
Réception : REC-26-0415, 12 écouteurs
Commandes : CMD-731402, CMD-731488, CMD-731530, CMD-731561, CMD-731602
Retour : RET-26-0091
Casse : DEM-26-0027
Stock au dernier inventaire : 27 - 12 - 1 + 9 + 1 = 24`;

  await v('ENT-2.1 : sans réponse, aucun jalon n\'est acquis (l\'inaction ne rapporte rien)', async () => {
    const db = ouvrir(S21);
    const st = statuts(S21, db);
    if (st.some((s) => s !== 'attente')) throw new Error('statuts avant réponse : ' + st.join(', '));
    // Sans la semaine semée (base nue), les jalons n'ont rien à juger.
    const nue = S21.baseDeDepart('Léa'); nue.moves = []; nue.mails = []; nue.orders = [];
    if (statuts(S21, nue).some((s) => s !== 'na')) throw new Error('un jalon juge une base sans mouvements');
  });

  await v('ENT-2.1 : la réponse juste valide les cinq jalons, calcul compris', async () => {
    const db = ouvrir(S21);
    repondre(db, JUSTE);
    const st = statuts(S21, db);
    if (st.some((s) => s !== 'ok')) throw new Error('statuts : ' + st.join(', '));
  });

  await v('ENT-2.1 : chaque erreur typique fait tomber SON jalon, et lui seul', async () => {
    const cas = [
      ['actuel', 'Stock actuel : 27', 'Stock actuel : 24'],                       // le stock d'inventaire lu comme actuel
      ['reception', 'Réception : REC-26-0415, 12 écouteurs', 'Réception : REC-26-0412, 12'], // la mauvaise réception
      ['reception', 'Réception : REC-26-0415, 12 écouteurs', 'Réception : REC-26-0415'],    // sans la quantité
      ['commandes', 'CMD-731602', 'CMD-731602, CMD-731455'],                       // une commande sans écouteurs
      ['commandes', ', CMD-731561', ''],                                          // une commande oubliée
      ['retour-casse', 'Retour : RET-26-0091\nCasse : DEM-26-0027', 'Retour : DEM-26-0027\nCasse : RET-26-0091'], // inversés
      ['inventaire', '= 24', '= 30'],                                             // le retour compté comme une sortie
    ];
    const ids = S21.ETAPES.map((e) => e.id);
    for (const [id, avant, apres] of cas) {
      if (!JUSTE.includes(avant)) throw new Error(`cas mal écrit : ${avant}`);
      const db = ouvrir(S21);
      repondre(db, JUSTE.replace(avant, apres));
      const st = statuts(S21, db);
      const tombes = ids.filter((x, i) => st[i] !== 'ok');
      if (tombes.length !== 1 || tombes[0] !== id) throw new Error(`« ${apres || '(retirée)'} » : tombent ${tombes.join(', ') || 'aucun'}, attendu ${id}`);
    }
  });

  await v('ENT-2.1 : le meilleur essai est retenu, et une correction en bas de message est lue', async () => {
    const db = ouvrir(S21);
    repondre(db, JUSTE.replace('Stock actuel : 27', 'Stock actuel : 24'));
    if (statuts(S21, db)[0] !== 'ko') throw new Error('premier essai faux non détecté');
    repondre(db, JUSTE);
    if (statuts(S21, db)[0] !== 'ok') throw new Error('le second essai juste n\'est pas retenu');
    const db2 = ouvrir(S21);
    repondre(db2, JUSTE.replace('Stock actuel : 27', 'Stock actuel : 24') + '\nStock actuel : 27 (je me suis trompé plus haut)');
    if (statuts(S21, db2)[0] !== 'ok') throw new Error('la correction en bas de message n\'est pas lue');
    // Une réponse envoyée à quelqu'un d'autre que la cheffe d'équipe ne compte pas.
    const db3 = ouvrir(S21);
    db3.mails.push({ folder: 'out', ts: Date.now(), toMail: CD.EQUIPE.quai.mail, text: JUSTE });
    if (statuts(S21, db3).some((s) => s !== 'attente')) throw new Error('une réponse au cariste est comptée');
  });

  // ---------- ENT-2.1 — dans le navigateur, avec le vrai moteur
  await v('ENT-2.1 : inscrite au registre, cachée tant que pret: false', async () => {
    const src = fs.readFileSync(path.join(ROOT, 'activites', 'index.js'), 'utf8');
    if (!src.includes("import('./cdiscount-mouvements.js')")) throw new Error('absente de activites/index.js');
    const meta = await page.evaluate(async () => (await import('/activites/cdiscount-mouvements.js')).meta);
    if (meta.code !== 'ENT-2.1' || meta.temps !== 'guidage' || !meta.competences.includes('C1.6')) throw new Error('meta incomplet');
    if (meta.bareme !== S21.ETAPES.length) throw new Error('barème ≠ nombre de jalons');
    const { activiteVisible } = await imp('core/niveaux.js');
    if (!meta.pret && activiteVisible(meta, { niveau: '1re' })) throw new Error('séance non prête visible des élèves');
  });

  await v('ENT-2.1 : la séance s\'ouvre, se lit et se répond dans le vrai moteur', async () => {
    const res = await page.evaluate(async ({ CHEFFE, JUSTE_ }) => {
      const mod = await import('/activites/cdiscount-mouvements.js');
      const hote = document.createElement('div');
      hote.id = 'essaiCdiscount';
      document.body.appendChild(hote);
      const db = {};
      window.__cdDb = db;
      const ctx = { meta: mod.meta, profil: { prenom: 'Léa', role: 'eleve' }, codeStock: 'STOCK24',
        jeu: { etat: () => db, sauver() {} }, enregistrer(r) { window.__cdScore = r; }, quitter() {} };
      mod.rendre(hote, ctx);
      const attendre = () => new Promise((r) => setTimeout(r, 60));
      const clic = async (sel) => { const e = hote.querySelector(sel); if (!e) throw new Error('introuvable : ' + sel); e.click(); await attendre(); };
      const out = {};
      out.logo = hote.querySelector('.ent-logo')?.getAttribute('src');
      out.logoOk = await new Promise((r) => { const i = new Image(); i.onload = () => r(i.naturalWidth > 100); i.onerror = () => r(false); i.src = out.logo; });
      out.accent = getComputedStyle(document.body).getPropertyValue('--ardoise').trim();
      await clic('[data-vue="mail"]');
      out.mails = hote.querySelectorAll('.ent-mitem').length;
      // La console, sur la cible : huit mouvements d'écouteurs.
      await clic('[data-vue="console"]');
      hote.querySelector('#champCmd').value = '.movements ECO-BT-01';
      hote.querySelector('#formCmd').dispatchEvent(new Event('submit', { cancelable: true }));
      await attendre();
      const tables = hote.querySelectorAll('.ent-cres table');
      out.lignesConsole = tables.length ? tables[tables.length - 1].querySelectorAll('tbody tr').length : 0;
      // Le stock, déverrouillé par le code du groupe, et son onglet Mouvements.
      await clic('[data-vue="stock"]');
      hote.querySelector('#codeStock').value = 'STOCK24';
      await clic('[data-deverrouiller]');
      out.lignesStock = hote.querySelectorAll('#entListe tbody tr').length;
      out.colonne = [...hote.querySelectorAll('#entListe th')].map((t) => t.textContent.trim()).join('|');
      await clic('[data-onglet="stock"][data-val="mouvements"]');
      out.lignesMouv = hote.querySelectorAll('.panneau tbody tr').length;
      // Les deux documents fournisseur et les six commandes sont consultables.
      await clic('[data-vue="receptions"]');
      out.receptions = hote.querySelectorAll('[data-ouvrir-rec]').length;
      await clic('[data-vue="commandes"]');
      out.commandes = hote.querySelectorAll('[data-ouvrir-cmd]').length;
      // Répondre à la cheffe, comme l'élève.
      await clic('[data-vue="mail"]');
      const mission = [...db.mails].find((m) => m.fromMail === CHEFFE && /racontez/.test(m.subject));
      await clic(`[data-mail="${mission.id}"]`);
      await clic('[data-repondre]');
      hote.querySelector('#repT').value = JUSTE_;
      hote.querySelector('#formRep').dispatchEvent(new Event('submit', { cancelable: true }));
      await attendre();
      out.score = window.__cdScore;
      // On rend la page comme on l'a trouvée.
      hote.querySelector('[data-quitter]').click();
      hote.remove();
      return out;
    }, { CHEFFE: CD.EQUIPE.cheffe.mail, JUSTE_: JUSTE }).catch(async (e) => {
      await page.evaluate(() => { document.getElementById('essaiCdiscount')?.remove(); document.body.classList.remove('immersion'); document.body.removeAttribute('style'); });
      throw e;
    });
    if (!res.logoOk) throw new Error('le logo ne se charge pas : ' + res.logo);
    if (res.accent.toLowerCase() !== '#3732ff') throw new Error('accent de la charte non appliqué : ' + res.accent);
    if (res.mails !== 4) throw new Error(`${res.mails} messages au lieu de 4`);
    if (res.lignesConsole !== 8) throw new Error(`.movements ECO-BT-01 : ${res.lignesConsole} lignes au lieu de 8`);
    if (res.lignesStock !== 5) throw new Error(`${res.lignesStock} lignes de stock au lieu de 5`);
    if (/Couleur|Taille/.test(res.colonne)) throw new Error('colonnes Couleur ou Taille affichées pour des articles simples : ' + res.colonne);
    if (res.lignesMouv !== 19) throw new Error(`${res.lignesMouv} mouvements à l'écran au lieu de 19`);
    if (res.receptions !== 2 || res.commandes !== 6) throw new Error(`${res.receptions} réceptions, ${res.commandes} commandes`);
    if (!res.score || res.score.score !== 5 || res.score.max !== 5) throw new Error('score remonté : ' + JSON.stringify(res.score));
    const reste = await page.evaluate(() => document.body.classList.contains('immersion'));
    if (reste) throw new Error('la page n\'a pas été rendue propre');
  });

  // ---------- la page d'essai (pour valider à l'écran une séance encore « pret: false »)
  await v('Cdiscount : la page d\'essai ouvre ENT-2.1 dans le vrai moteur et affiche ses jalons', async () => {
    // Un onglet à part : la page partagée de la suite n'est pas déplacée.
    const ctx = await nav.newContext();
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) errs.push(m.text()); });
    try {
      await p.goto(new URL('/outils/essai-cdiscount.html', page.url()).toString());
      await p.waitForSelector('.ent-shell', { timeout: 6000 });
      const nb = await p.$$eval('#jalons span', (s) => s.length);
      if (nb !== S21.ETAPES.length) throw new Error(`${nb} jalons affichés au lieu de ${S21.ETAPES.length}`);
      const opts = await p.$$eval('select[name="seance"] option', (o) => o.map((x) => x.value));
      const fichiers = fs.readdirSync(path.join(ROOT, 'activites')).filter((f) => /^cdiscount-.*\.js$/.test(f)).map((f) => f.slice(0, -3));
      const oubli = fichiers.filter((f) => !opts.includes(f));
      if (oubli.length) throw new Error('séance Cdiscount absente de la page d\'essai : ' + oubli.join(', '));
      if (errs.length) throw new Error(errs.join(' | '));
    } finally { await ctx.close(); }
  });
}
