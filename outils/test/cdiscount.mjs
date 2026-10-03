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
  const S22 = await imp('contenus/cdiscount-inventaire.js');
  const INVM = await imp('core/types/inventaire.js');
  const DECL = await imp('core/declencheurs.js');

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
    // Le retour et la casse arrivent en cours de séance (option B, 03/10/2026) : on compte aussi
    // les messages du déclencheur.
    const tard = S21.VOLET.declencheurs.flatMap((d) => d.semer('Léa', db).mails || []);
    const sujets = [...db.mails, ...tard].map((m) => m.subject + ' ' + m.text).join('\n');
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

  // ---------- Messages déclenchés (option B, 03/10/2026) : les fabriques de `core/declencheurs.js`
  await v('Déclencheurs : apresMail part à l\'envoi (juste ou faux), pas sur un brouillon, un mail reçu ou une ligne sans nombre ; apresJalon sur « ok » seul ; tous', async () => {
    const A = 'nadia.ferrand@cdiscount.example';
    const q = DECL.apresMail({ a: A, ligne: 'Stock actuel :', nombre: true });
    const base = (mails) => ({ mails });
    const cas = [
      ['envoyé, nombre faux', [{ folder: 'out', toMail: A, text: 'Stock actuel : 5' }], true],
      ['envoyé, adresse en majuscules', [{ folder: 'out', toMail: 'Nadia.Ferrand@Cdiscount.example', text: 'stock ACTUEL : 27' }], true],
      ['autre adresse', [{ folder: 'out', toMail: 'quai@cdiscount.example', text: 'Stock actuel : 27' }], false],
      ['mail reçu', [{ folder: 'in', fromMail: A, toMail: A, text: 'Stock actuel : 27' }], false],
      ['brouillon', [{ folder: 'brouillon', toMail: A, text: 'Stock actuel : 27' }], false],
      ['amorce vide', [{ folder: 'out', toMail: A, text: 'Stock actuel : \nRéception : \nStock au dernier inventaire : ' }], false],
      ['seulement une référence', [{ folder: 'out', toMail: A, text: 'Stock actuel : ECO-BT-01' }], false],
      ['ligne absente', [{ folder: 'out', toMail: A, text: 'Bonjour, voici 27' }], false],
      ['aucun mail', [], false],
    ];
    for (const [nom, mails, attendu] of cas) if (q(base(mails)) !== attendu) throw new Error(`apresMail, ${nom} : ${!attendu}`);
    // Sans `ligne` : n'importe quel envoi à l'adresse ; sans `nombre` : la ligne suffit.
    if (!DECL.apresMail({ a: A })(base([{ folder: 'out', toMail: A, text: '' }]))) throw new Error('apresMail sans ligne');
    if (!DECL.apresMail({ a: A, ligne: 'Stock actuel :' })(base([{ folder: 'out', toMail: A, text: 'Stock actuel : ' }]))) throw new Error('apresMail sans nombre');
    const ETAPES = [{ id: 'x', verifier: (db) => ({ status: db.st }) }, { id: 'u', verifier: (db, U) => ({ status: U && U.ok ? 'ok' : 'ko' }) }];
    for (const st of ['ko', 'attente', 'na']) if (DECL.apresJalon(ETAPES, 'x')({ st })) throw new Error('apresJalon vrai sur ' + st);
    if (!DECL.apresJalon(ETAPES, 'x')({ st: 'ok' })) throw new Error('apresJalon faux sur ok');
    if (DECL.apresJalon(ETAPES, 'absent')({ st: 'ok' })) throw new Error('apresJalon vrai sur une étape inconnue');
    if (!DECL.apresJalon(ETAPES, 'u', { ok: true })({})) throw new Error('apresJalon ne transmet pas l\'univers');
    const vrai = () => true, faux = () => false;
    if (!DECL.tous(vrai, vrai)({}) || DECL.tous(vrai, faux)({})) throw new Error('tous');
    // ENT-2.1 et ENT-2.3 lisent les mêmes `ligne()` et `nombres()` : déplacées, pas copiées.
    if (S21.ligne !== DECL.ligne || S21.nombres !== DECL.nombres) throw new Error('ligne/nombres recopiées au lieu d\'être réimportées');
  });

  await v('ENT-2.1 : le déclencheur part sur un compte rendu à Nadia, juste ou faux, jamais sur l\'amorce vide ni à l\'ouverture', async () => {
    const d = (S21.VOLET.declencheurs || []).find((x) => x.id === 'documents');
    if (!d) throw new Error('déclencheur « documents » absent');
    const db = ouvrir(S21);
    const sujets = db.mails.map((m) => m.subject);
    if (sujets.length !== 2 || sujets.some((x) => /^Retour client|^Constat de casse/.test(x))) throw new Error('mails à l\'ouverture : ' + sujets.join(' | '));
    if (d.quand(db)) throw new Error('le déclencheur est vrai dès l\'ouverture');
    repondre(db, S21.LIGNES_REPONSE.map((l) => l + ' ').join('\n'));
    if (d.quand(db)) throw new Error('l\'amorce vide déclenche');
    repondre(db, 'Stock actuel : 5');
    if (!d.quand(db)) throw new Error('un compte rendu faux (5) ne déclenche pas');
    const g = d.semer('Léa', db).mails;
    if (g.length !== 2 || !/^Retour client RET-26-0091/.test(g[0].subject) || !/^Constat de casse DEM-26-0027/.test(g[1].subject)) throw new Error('mails déclenchés : ' + g.map((m) => m.subject).join(' | '));
    if (g.some((m) => m.ts < Date.now() - 5000)) throw new Error('les mails déclenchés ne portent pas l\'heure d\'arrivée');
    // Les jalons ne bougent pas : « actuel » ko sur 5, les autres ko faute de lignes remplies.
    const st = statuts(S21, db);
    if (st.some((x) => x !== 'ko')) throw new Error('statuts après « Stock actuel : 5 » : ' + st.join(', '));
    const db2 = ouvrir(S21);
    repondre(db2, 'Stock actuel : 27');
    if (statuts(S21, db2)[0] !== 'ok') throw new Error('« Stock actuel : 27 » ne valide pas le jalon actuel');
    // Un élève qui avait les deux mails (séance ouverte avant le 03/10/2026) ne les reçoit pas en double.
    db2.mails.push(...g);
    if (d.semer('Léa', db2).mails.length) throw new Error('doublon pour une base qui a déjà les deux mails');
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
    // Option B (03/10/2026) : Bienvenue et consigne à l'ouverture ; le retour et la casse arrivent plus tard.
    if (res.mails !== 2) throw new Error(`${res.mails} messages au lieu de 2`);
    if (res.lignesConsole !== 8) throw new Error(`.movements ECO-BT-01 : ${res.lignesConsole} lignes au lieu de 8`);
    if (res.lignesStock !== 5) throw new Error(`${res.lignesStock} lignes de stock au lieu de 5`);
    if (/Couleur|Taille/.test(res.colonne)) throw new Error('colonnes Couleur ou Taille affichées pour des articles simples : ' + res.colonne);
    if (res.lignesMouv !== 19) throw new Error(`${res.lignesMouv} mouvements à l'écran au lieu de 19`);
    if (res.receptions !== 2 || res.commandes !== 6) throw new Error(`${res.receptions} réceptions, ${res.commandes} commandes`);
    if (!res.score || res.score.score !== 5 || res.score.max !== 5) throw new Error('score remonté : ' + JSON.stringify(res.score));
    const reste = await page.evaluate(() => document.body.classList.contains('immersion'));
    if (reste) throw new Error('la page n\'a pas été rendue propre');
  });

  // Statut « Annulée » des commandes (brief MOTEUR-statut-annulee, 03/10/2026). Le moteur est
  // éprouvé sur la base d'ENT-2.1 : six commandes semées préparées, que l'on transforme ici pour
  // couvrir les cinq statuts. A : annulée sans bon ; B : annulée ET préparée (la priorité) ;
  // C : sans bon (À préparer) ; D : bon commencé (En cours) ; E : préparée ; F : reliquat.
  await v('Moteur : une commande annulée s\'affiche « Annulée » partout, ne se prépare pas et ne compte plus à préparer', async () => {
    const res = await page.evaluate(async () => {
      const mod = await import('/activites/cdiscount-mouvements.js');
      const hote = document.createElement('div');
      hote.id = 'essaiCdiscount';
      document.body.appendChild(hote);
      const db = {};
      const ctx = { meta: mod.meta, profil: { prenom: 'Léa', role: 'eleve' }, codeStock: 'STOCK24',
        jeu: { etat: () => db, sauver() {} }, enregistrer() {}, quitter() {} };
      const attendre = () => new Promise((r) => setTimeout(r, 60));
      const clic = async (sel) => { const e = hote.querySelector(sel); if (!e) throw new Error('introuvable : ' + sel); e.click(); await attendre(); };
      mod.rendre(hote, ctx);
      hote.querySelector('[data-quitter]').click();
      const [A, B, C, D, E, F] = db.orders;
      const at = new Date(2026, 10, 3, 14, 5).getTime();
      delete A.prep;
      A.annulee = { motif: 'Rupture : emplacement vide à la préparation', at };
      B.annulee = { motif: 'Client injoignable', at };
      delete C.prep;
      D.prep.validated = false; delete D.prep.complete;
      F.prep.complete = false;
      mod.rendre(hote, ctx);
      const out = { nos: { A: A.no, B: B.no, C: C.no, D: D.no, E: E.no, F: F.no } };
      out.compteur = hote.querySelector('[data-vue="commandes"] .ent-n')?.textContent.trim() || '0';
      await clic('[data-vue="commandes"]');
      out.liste = {};
      hote.querySelectorAll('[data-ouvrir-cmd]').forEach((b) => {
        const p = b.closest('tr').querySelector('.pastille');
        out.liste[b.dataset.ouvrirCmd] = [p.textContent.trim(), p.className.replace('pastille', '').trim()];
      });
      const fiche = async (no) => {
        await clic('[data-vue="commandes"]');
        await clic(`[data-ouvrir-cmd="${no}"]`);
        return { titre: hote.querySelector('.ent-tete .pastille')?.textContent.trim(),
          avis: hote.querySelector('[data-annulee]')?.textContent.trim() || null,
          saisies: hote.querySelectorAll('[data-prep]').length,
          boutons: hote.querySelectorAll('[data-bon], [data-valider], [data-copier]').length,
          bon: !!hote.querySelector('#bon') };
      };
      out.A = await fiche(A.no);
      out.Aprep = 'prep' in A;
      out.B = await fiche(B.no);
      out.C = await fiche(C.no);
      // La console dit la même chose que l'écran.
      await clic('[data-vue="console"]');
      hote.querySelector('#champCmd').value = '.getorder ' + A.no;
      hote.querySelector('#formCmd').dispatchEvent(new Event('submit', { cancelable: true }));
      await attendre();
      const blocs = hote.querySelectorAll('.ent-cres');
      out.console = blocs.length ? blocs[blocs.length - 1].textContent : '';
      hote.querySelector('[data-quitter]').click();
      hote.remove();
      return out;
    }).catch(async (e) => {
      await page.evaluate(() => { document.getElementById('essaiCdiscount')?.remove(); document.body.classList.remove('immersion'); document.body.removeAttribute('style'); });
      throw e;
    });
    const { nos, liste } = res;
    const attendu = { A: ['Annulée', 'crit'], B: ['Annulée', 'crit'], C: ['À préparer', 'warn'], D: ['En cours', 'info'],
      E: ['Préparée', 'ok'], F: ['Préparée (reliquat)', 'info'] };
    for (const [k, st] of Object.entries(attendu)) {
      if (JSON.stringify(liste[nos[k]]) !== JSON.stringify(st)) throw new Error(`commande ${k} : ${JSON.stringify(liste[nos[k]])} au lieu de ${JSON.stringify(st)}`);
    }
    // À préparer : C et D seulement — A (annulée, sans bon) ne compte plus.
    if (res.compteur !== '2') throw new Error(`${res.compteur} commandes à préparer au lieu de 2`);
    if (res.A.titre !== 'Annulée' || res.A.avis !== 'Annulée le 03/11 à 14:05 — Rupture : emplacement vide à la préparation')
      throw new Error('fiche A : ' + JSON.stringify(res.A));
    if (res.A.saisies || res.A.boutons || res.Aprep) throw new Error('commande annulée préparable : ' + JSON.stringify(res.A) + ' prep créé : ' + res.Aprep);
    if (res.B.titre !== 'Annulée' || !/Client injoignable/.test(res.B.avis || '')) throw new Error('fiche B : ' + JSON.stringify(res.B));
    if (res.B.saisies || res.B.boutons || !res.B.bon) throw new Error('bon figé de B : ' + JSON.stringify(res.B));
    // Le témoin : une commande sans `annulee` reste préparable comme avant.
    if (res.C.titre !== 'À préparer' || res.C.avis || !res.C.saisies || !res.C.boutons)
      throw new Error('fiche C : ' + JSON.stringify(res.C));
    if (!/Annulée/.test(res.console)) throw new Error('.getorder : ' + res.console.slice(0, 200));
  });

  // Ajouté le 03/10/2026 (réponse amorcée) : le champ « Répondre » du message de Nadia s'ouvre avec
  // les six intitulés ; les autres messages gardent un champ vide ; envoyer l'amorce telle quelle
  // ne rapporte aucun jalon.
  await v('ENT-2.1 : « Répondre » à Nadia s\'ouvre avec les six intitulés, les autres mails restent vides, et l\'amorce seule ne valide rien', async () => {
    const res = await page.evaluate(async ({ CHEFFE }) => {
      const mod = await import('/activites/cdiscount-mouvements.js');
      const hote = document.createElement('div');
      hote.id = 'essaiCdiscount';
      document.body.appendChild(hote);
      const db = {};
      const ctx = { meta: mod.meta, profil: { prenom: 'Léa', role: 'eleve' }, codeStock: 'STOCK24',
        jeu: { etat: () => db, sauver() {} }, enregistrer() {}, quitter() {} };
      mod.rendre(hote, ctx);
      const attendre = () => new Promise((r) => setTimeout(r, 60));
      const clic = async (sel) => { const e = hote.querySelector(sel); if (!e) throw new Error('introuvable : ' + sel); e.click(); await attendre(); };
      const out = {};
      await clic('[data-vue="mail"]');
      const autre = db.mails.find((m) => /^Bienvenue/.test(m.subject));
      await clic(`[data-mail="${autre.id}"]`);
      await clic('[data-repondre]');
      out.autre = hote.querySelector('#repT').value;
      await clic('[data-mail-retour]');
      const mission = db.mails.find((m) => m.fromMail === CHEFFE && /racontez/.test(m.subject));
      await clic(`[data-mail="${mission.id}"]`);
      await clic('[data-repondre]');
      const t = hote.querySelector('#repT');
      out.amorce = t.value;
      out.curseur = t.selectionStart;
      out.focus = document.activeElement === t;
      hote.querySelector('#formRep').dispatchEvent(new Event('submit', { cancelable: true }));
      await attendre();
      out.envoye = db.mails.filter((m) => m.folder === 'out').map((m) => m.text);
      hote.querySelector('[data-quitter]').click();
      hote.remove();
      return out;
    }, { CHEFFE: CD.EQUIPE.cheffe.mail }).catch(async (e) => {
      await page.evaluate(() => { document.getElementById('essaiCdiscount')?.remove(); document.body.classList.remove('immersion'); document.body.removeAttribute('style'); });
      throw e;
    });
    const lignes = res.amorce.split('\n');
    if (lignes.length !== S21.LIGNES_REPONSE.length || lignes.some((l, i) => l.trim() !== S21.LIGNES_REPONSE[i])) {
      throw new Error('amorce : ' + JSON.stringify(res.amorce));
    }
    if (!res.focus || res.curseur !== lignes[0].length) throw new Error(`curseur ${res.curseur}, focus ${res.focus}`);
    if (res.autre !== '') throw new Error('le champ d\'un autre message n\'est pas vide : ' + JSON.stringify(res.autre));
    if (res.envoye.length !== 1) throw new Error(`${res.envoye.length} réponses envoyées au lieu de 1`);
    const db = ouvrir(S21);
    repondre(db, res.envoye[0]);
    const st = statuts(S21, db);
    if (st.some((s) => s === 'ok')) throw new Error('l\'amorce seule valide un jalon : ' + st.join(', '));
  });

  // Option B (03/10/2026) : dans le vrai moteur, rien n'arrive en cliquant partout ; le premier compte
  // rendu à Nadia, même faux, fait arriver le retour et la casse, une seule fois, avec une bulle qui
  // dit les deux (envoi + nouveau message).
  await v('ENT-2.1 : cliquer partout ne fait rien arriver ; « Stock actuel : 5 » fait arriver le retour et la casse, une fois, sans doublon au remontage ni pour une base ancienne', async () => {
    const res = await page.evaluate(async ({ CHEFFE }) => {
      const mod = await import('/activites/cdiscount-mouvements.js');
      const attendre = () => new Promise((r) => setTimeout(r, 60));
      const bulle = () => document.getElementById('toast')?.textContent || '';
      const monter = (db) => {
        const hote = document.createElement('div');
        hote.id = 'essaiCdiscount';
        document.body.appendChild(hote);
        const ctx = { meta: mod.meta, profil: { prenom: 'Léa', role: 'eleve' }, codeStock: 'STOCK24',
          jeu: { etat: () => db, sauver() {} }, enregistrer() {}, quitter() {} };
        mod.rendre(hote, ctx);
        const clic = async (sel) => { const e = hote.querySelector(sel); if (!e) throw new Error('introuvable : ' + sel); e.click(); await attendre(); };
        const demonter = () => { hote.querySelector('[data-quitter]').click(); hote.remove(); };
        const envoyer = async (texte) => {
          await clic('[data-vue="mail"]');
          await clic('[data-dossier="in"]');
          const mission = db.mails.find((m) => m.fromMail === CHEFFE && /racontez/.test(m.subject));
          await clic(`[data-mail="${mission.id}"]`);
          await clic('[data-repondre]');
          if (texte !== null) hote.querySelector('#repT').value = texte;
          hote.querySelector('#formRep').dispatchEvent(new Event('submit', { cancelable: true }));
          await attendre();
        };
        return { hote, clic, demonter, envoyer };
      };
      const compte = (db) => ({ recus: db.mails.filter((m) => m.folder === 'in').length,
        retour: db.mails.filter((m) => /^Retour client RET-/.test(m.subject)).length,
        casse: db.mails.filter((m) => /^Constat de casse DEM-/.test(m.subject)).length });
      const out = {};
      const db = {};
      let e = monter(db);
      out.ouverture = compte(db);
      // Cliquer partout : tous les menus, chaque mail, Stock et Mouvements, la console.
      for (const b of [...new Set([...e.hote.querySelectorAll('.ent-nav[data-vue]')].map((x) => x.dataset.vue))]) await e.clic(`.ent-nav[data-vue="${b}"]`);
      await e.clic('[data-vue="mail"]');
      for (const m of db.mails.filter((x) => x.folder === 'in')) await e.clic(`[data-mail="${m.id}"]`);
      await e.clic('[data-vue="stock"]');
      e.hote.querySelector('#codeStock').value = 'STOCK24';
      await e.clic('[data-deverrouiller]');
      await e.clic('[data-onglet="stock"][data-val="mouvements"]');
      await e.clic('[data-vue="console"]');
      for (const cmd of ['.help', '.movements ECO-BT-01', '.getstock ECO-BT-01']) {
        e.hote.querySelector('#champCmd').value = cmd;
        e.hote.querySelector('#formCmd').dispatchEvent(new Event('submit', { cancelable: true }));
        await attendre();
      }
      out.apresClics = compte(db);
      // L'amorce envoyée telle quelle (six intitulés, aucun nombre).
      await e.envoyer(null);
      out.apresAmorce = compte(db);
      // Le premier compte rendu, FAUX.
      await e.envoyer('Stock actuel : 5');
      out.bulle = bulle();
      out.pastille = e.hote.querySelector('.ent-nav[data-vue="mail"] .ent-n')?.textContent || '';
      out.apresEnvoi = compte(db);
      out.marques = Object.keys(db.volets || {});
      await e.envoyer('Stock actuel : 27');
      out.bulle2 = bulle();
      out.apresSecond = compte(db);
      e.demonter();
      // Remontage (reconnexion) : rien de plus.
      e = monter(db);
      out.apresRemontage = compte(db);
      e.demonter();
      // Base d'un élève qui a commencé avant le 03/10/2026 : il a déjà les deux mails, sans la marque.
      const ancienne = {};
      e = monter(ancienne);
      e.demonter();
      const recu = (t) => ({ folder: 'in', ts: Date.now() - 3600e3, from: 'x', fromMail: 'x@cdiscount.example', subject: t, kind: 'text', text: 'x', read: true, id: ancienne.seq++ });
      ancienne.mails.push(recu('Retour client RET-26-0091 remis en stock'), recu('Constat de casse DEM-26-0027'));
      e = monter(ancienne);
      await e.envoyer('Stock actuel : 5');
      out.ancienne = compte(ancienne);
      out.bulleAncienne = bulle();
      e.demonter();
      return out;
    }, { CHEFFE: CD.EQUIPE.cheffe.mail }).catch(async (e) => {
      await page.evaluate(() => { document.getElementById('essaiCdiscount')?.remove(); document.body.classList.remove('immersion'); document.body.removeAttribute('style'); });
      throw e;
    });
    const dit = (c) => JSON.stringify(c);
    // Valeurs écrites à la main : 2 mails reçus à l'ouverture (Bienvenue, consigne), 4 après l'envoi.
    if (res.ouverture.recus !== 2 || res.ouverture.retour || res.ouverture.casse) throw new Error('ouverture : ' + dit(res.ouverture));
    if (dit(res.apresClics) !== dit(res.ouverture)) throw new Error('un clic a fait arriver un message : ' + dit(res.apresClics));
    if (dit(res.apresAmorce) !== dit(res.ouverture)) throw new Error('l\'amorce vide a fait arriver un message : ' + dit(res.apresAmorce));
    if (res.apresEnvoi.recus !== 4 || res.apresEnvoi.retour !== 1 || res.apresEnvoi.casse !== 1) throw new Error('après « Stock actuel : 5 » : ' + dit(res.apresEnvoi));
    if (!/^Réponse envoyée\. Nouveau message : /.test(res.bulle)) throw new Error('bulle à l\'envoi : ' + JSON.stringify(res.bulle));
    if (res.pastille !== '2') throw new Error('pastille de la messagerie : ' + JSON.stringify(res.pastille));
    if (!res.marques.includes('mouvements-1#documents')) throw new Error('marque absente : ' + res.marques.join(', '));
    if (dit(res.apresSecond) !== dit(res.apresEnvoi)) throw new Error('le second envoi a reposé des mails : ' + dit(res.apresSecond));
    if (res.bulle2 !== 'Réponse envoyée.') throw new Error('bulle au second envoi : ' + JSON.stringify(res.bulle2));
    if (dit(res.apresRemontage) !== dit(res.apresEnvoi)) throw new Error('doublon au remontage : ' + dit(res.apresRemontage));
    if (res.ancienne.retour !== 1 || res.ancienne.casse !== 1 || res.ancienne.recus !== 4) throw new Error('base ancienne : ' + dit(res.ancienne));
    if (res.bulleAncienne !== 'Réponse envoyée.') throw new Error('base ancienne, bulle : ' + JSON.stringify(res.bulleAncienne));
  });

  /* ================================================================================
   * ENT-2.2 « Inventaire tournant » (entraînement) — ajouté le 02/10/2026, chantier D.
   *
   * Réglages décidés par Tristan : 8 références et 27 mouvements (ENT-2.1 : 5 et 19), correction
   * DÉTAILLÉE, piège unique = l'article au mauvais emplacement. Les valeurs attendues sont
   * écrites À LA MAIN ici (stock, écarts, taux) : un test qui les recalculerait avec le code de
   * la séance ne verrait pas une erreur de données.
   * ============================================================================== */

  const SYSTEME_22 = { 'CAB-USBC-1M': 64, 'CHG-20W': 44, 'ECO-BT-01': 22, 'SOU-SF-02': 29, 'BAT-10K': 10, 'CLE-64G': 37, 'AMP-LED-E27': 37, 'COQ-UNI-01': 27 };
  const COMPTE_22 = { 'CAB-USBC-1M': 67, 'CHG-20W': 41, 'ECO-BT-01': 22, 'SOU-SF-02': 29, 'BAT-10K': 8, 'CLE-64G': 37, 'AMP-LED-E27': 37, 'COQ-UNI-01': 25 };
  const ECARTS_22 = { 'CAB-USBC-1M': 3, 'CHG-20W': -3, 'ECO-BT-01': 0, 'SOU-SF-02': 0, 'BAT-10K': -2, 'CLE-64G': 0, 'AMP-LED-E27': 0, 'COQ-UNI-01': -2 };
  const ORDRE_22 = Object.keys(SYSTEME_22);
  const ID_22 = S22.ID_INVENTAIRE;

  // L'état de l'écran Inventaire d'un élève, posé à la main (alerte n° 20 : on appelle
  // `verifier(db)` directement). `decisions` : { ref: [action, motif] }.
  const etat22 = (db, { saisie = COMPTE_22, ecarts = ECARTS_22, decisions = {}, recomptes = {}, taux = '3,7', valide = true } = {}) => {
    const e = INVM.etatNeuf(S22.INVENTAIRE, (r) => db.stock[r]);
    ORDRE_22.forEach((r) => { e.saisie[r] = String(saisie[r]); e.ecarts[r] = String(ecarts[r]); });
    Object.entries(decisions).forEach(([r, [action, motif]]) => { e.decisions[r] = { action, motif: motif || '' }; });
    Object.entries(recomptes).forEach(([r, q]) => { e.recomptes[r] = q; });
    e.taux = taux; e.valide = valide ? Date.now() : null; e.etape = valide ? 4 : 1;
    db.inventaires = { [ID_22]: e };
    return db;
  };
  const BONNES_22 = { 'CAB-USBC-1M': ['recompter'], 'CHG-20W': ['rayon'], 'BAT-10K': ['rayon'], 'COQ-UNI-01': ['regul', 'Démarque inconnue'] };
  const justeDb = (surcharge = {}) => etat22(ouvrir(S22), { recomptes: { 'CAB-USBC-1M': 64 }, decisions: BONNES_22, ...surcharge });
  const ids22 = S22.ETAPES.map((x) => x.id);
  const tombes22 = (db) => { const st = statuts(S22, db); return ids22.filter((x, i) => st[i] !== 'ok'); };

  // ---------- ENT-2.2 — les données
  await v('ENT-2.2 : volume déclaré = volume réel (8 références, 16 documents, 27 mouvements), plus fort qu\'ENT-2.1', async () => {
    const db = ouvrir(S22);
    const refs = new Set(db.moves.map((m) => m.sku));
    const docs = new Set(db.moves.map((m) => m.ref));
    const vol = { references: refs.size, documents: docs.size, mouvements: db.moves.length };
    if (JSON.stringify(vol) !== JSON.stringify({ references: 8, documents: 16, mouvements: 27 })) throw new Error('volume réel : ' + JSON.stringify(vol));
    for (const k of Object.keys(S22.VOLUME)) if (S22.VOLUME[k] !== vol[k]) throw new Error(`${k} : déclaré ${S22.VOLUME[k]}, réel ${vol[k]}`);
    if (S22.CATALOGUE.VARIANTS.length !== 8) throw new Error('la séance montre plus ou moins que ses huit références');
    // Décision de Tristan : un peu plus qu'ENT-2.1 (5 références, 19 mouvements).
    if (!(refs.size > S21.VOLUME.references && db.moves.length > S21.VOLUME.mouvements)) throw new Error('le volume ne dépasse pas celui d\'ENT-2.1');
    const meta = await page.evaluate(async () => (await import('/activites/cdiscount-inventaire.js')).meta);
    if (JSON.stringify(meta.volume) !== JSON.stringify(S22.VOLUME)) throw new Error('le meta ne déclare pas le volume de la séance');
  });

  await v('ENT-2.2 : chaque mouvement a son document, le stock « après » se suit sans trou et retombe sur le stock du système', async () => {
    const db = ouvrir(S22);
    const recs = new Set(db.receptions.map((r) => r.no));
    const bps = new Set(db.orders.map((o) => 'BP-' + o.no.replace('CMD-', '')));
    const sujets = db.mails.map((m) => m.subject + ' ' + m.text).join('\n');
    for (const m of db.moves) {
      if (!(recs.has(m.ref) || bps.has(m.ref) || sujets.includes(m.ref))) throw new Error(`mouvement sans document : ${m.sku} ${m.type} ${m.ref}`);
      if (!Object.values(S22.TYPES).includes(m.type)) throw new Error(`type de mouvement inattendu : ${m.type}`);
    }
    for (let i = 1; i < db.moves.length; i++) if (db.moves[i].ts < db.moves[i - 1].ts) throw new Error('mouvements dans le désordre');
    if (db.moves.some((m) => m.ts > Date.now())) throw new Error('un mouvement est daté dans le futur');
    if (db.moves.some((m) => m.ts < S22.INVENTAIRE.depuis)) throw new Error('un mouvement est antérieur au dernier inventaire : « voir les mouvements » ne le montrerait pas');
    const s = { ...S22.INVENTAIRE_PRECEDENT };
    for (const m of db.moves) { s[m.sku] += m.delta; if (m.after !== s[m.sku]) throw new Error(`stock après faux sur ${m.sku} (${m.ref})`); }
    if (JSON.stringify(s) !== JSON.stringify(SYSTEME_22)) throw new Error('stock du système : ' + JSON.stringify(s));
    for (const k of Object.keys(s)) if (s[k] !== db.stock[k]) throw new Error(`stock final faux : ${k}`);
    for (const v2 of S22.CATALOGUE.VARIANTS) { if (s[v2.sku] < 0 || s[v2.sku] > v2.model.max) throw new Error(`${v2.sku} hors des bornes du catalogue`); }
    for (const r of db.receptions) {
      const parColis = {}; r.colis.forEach((c) => { parColis[c.sku] = (parColis[c.sku] || 0) + c.qty; });
      r.bl.lines.forEach((l) => { if (parColis[l.sku] !== l.qty) throw new Error(`${r.no} : colis et bon de livraison divergent`); });
    }
    for (const o of db.orders) for (const l of o.lines) {
      const m = db.moves.find((x) => x.ref === 'BP-' + o.no.replace('CMD-', '') && x.sku === l.sku);
      if (o.prep.rows[l.sku].seen !== m.after + l.qty) throw new Error(`${o.no} : « vu en stock » incohérent`);
    }
  });

  await v('ENT-2.2 : écarts, taux et décisions attendus (valeurs écrites à la main)', async () => {
    const db = ouvrir(S22);
    const L = Object.fromEntries(S22.INVENTAIRE.lignes.map((l) => [l.ref, l]));
    if (JSON.stringify(S22.INVENTAIRE.lignes.map((l) => l.ref)) !== JSON.stringify(ORDRE_22)) throw new Error('ordre du relevé ≠ ordre des emplacements');
    ORDRE_22.forEach((r, i) => {
      if (L[r].compte !== COMPTE_22[r]) throw new Error(`${r} : relevé ${L[r].compte} au lieu de ${COMPTE_22[r]}`);
      if (db.stock[r] !== SYSTEME_22[r]) throw new Error(`${r} : système ${db.stock[r]}`);
      if (COMPTE_22[r] - SYSTEME_22[r] !== ECARTS_22[r]) throw new Error('test mal écrit : ' + r);
      if (i > 0 && S22.CATALOGUE.VM[r].loc <= S22.CATALOGUE.VM[ORDRE_22[i - 1]].loc) throw new Error('relevé pas dans l\'ordre des emplacements');
    });
    const attendus = Object.fromEntries(S22.INVENTAIRE.lignes.filter((l) => l.attendu).map((l) => [l.ref, [l.attendu, l.motif || '']]));
    if (JSON.stringify(attendus) !== JSON.stringify({ 'CAB-USBC-1M': ['recompter', ''], 'CHG-20W': ['rayon', ''], 'BAT-10K': ['rayon', ''], 'COQ-UNI-01': ['regul', 'Démarque inconnue'] })) throw new Error('décisions attendues : ' + JSON.stringify(attendus));
    // Le bilan, lu comme le fait l'écran, donne les mêmes écarts et le taux de 3,7 % (10 ÷ 270).
    const b = INVM.bilanInventaire(justeDb(), S22.INVENTAIRE, S22.CATALOGUE);
    if (b.sommeAbs !== 10 || b.sommeSys !== 270 || b.tauxAttendu !== 3.7) throw new Error(`taux : ${b.sommeAbs} ÷ ${b.sommeSys} = ${b.tauxAttendu}`);
    if (JSON.stringify(b.lignes.map((l) => l.ecartPremier)) !== JSON.stringify(ORDRE_22.map((r) => ECARTS_22[r]))) throw new Error('écarts du bilan');
    // Réglages décidés par Tristan : correction détaillée, écarts par l'élève, comptage à l'aveugle.
    const I = S22.INVENTAIRE;
    if (I.correction !== 'detaillee' || I.ecarts !== 'eleve' || I.aveugle !== true || I.source !== 'releve' || I.motifObligatoire === false) throw new Error('réglages de l\'inventaire');
    for (const l of I.lignes.filter((x) => x.attendu)) if (!l.explication || l.explication.length < 60) throw new Error(`correction détaillée sans explication : ${l.ref}`);
  });

  await v('ENT-2.2 : le piège est l\'article au mauvais emplacement — la paire +3 / −3 s\'annule, le stock du système est juste', async () => {
    const db = ouvrir(S22);
    // 1. La paire : mêmes trois cartons. Le surplus des câbles est le manque des chargeurs.
    if (ECARTS_22['CAB-USBC-1M'] + ECARTS_22['CHG-20W'] !== 0) throw new Error('la paire ne s\'annule pas');
    // 2. Aucun mouvement n'explique ces écarts : tous les mouvements de CAB, CHG et BAT ont un document
    //    de type ordinaire (réception, préparation, annulation), jamais un ajustement ni une casse.
    const ordinaires = [S22.TYPES.reception, S22.TYPES.preparation, S22.TYPES.reintegration];
    for (const r of ['CAB-USBC-1M', 'CHG-20W', 'BAT-10K']) {
      const bad = db.moves.filter((m) => m.sku === r && !ordinaires.includes(m.type));
      if (bad.length) throw new Error(`${r} : un mouvement explique déjà l'écart (${bad[0].type})`);
    }
    // 3. L'indice est dans la messagerie, et il ne donne pas la décision : il nomme le doute, le
    //    document et la zone (A-01) pour les chargeurs ; la commande annulée et son document pour les batteries.
    const kevin = db.mails.find((m) => /Palette Kabeo/.test(m.subject));
    if (!kevin || !/REC-26-0431/.test(kevin.text) || !/A-01/.test(kevin.text)) throw new Error('indice du cariste (palette Kabeo) absent ou incomplet');
    const ines = db.mails.find((m) => /Annulation de CMD-732153/.test(m.subject));
    if (!ines || !/REI-26-0012/.test(ines.text) || !/A-03/.test(ines.text)) throw new Error('indice de la préparatrice (annulation) absent ou incomplet');
    for (const m of [kevin, ines]) if (/régulari|remettre en rayon|recompt/i.test(m.text)) throw new Error('un indice donne la décision : ' + m.subject);
    // 4. Le rangement raté de la batterie est bien dans les mouvements : sortie puis réintégration.
    const bat = db.moves.filter((m) => m.sku === 'BAT-10K');
    if (!bat.some((m) => m.type === S22.TYPES.reintegration && m.delta === 2 && m.ref === 'REI-26-0012')) throw new Error('réintégration des batteries absente');
    if (!bat.some((m) => m.type === S22.TYPES.preparation && m.delta === -2 && m.ref === 'BP-732153')) throw new Error('sortie des batteries absente');
    // 5. Rien d'autre n'est semé : pas de casse ni de retour NON déclarés, pas d'erreur de saisie.
    //    Tout retour et toute casse du lot ont leur document ; les motifs d'ajustement attendus sont
    //    ceux de la ligne témoin seulement.
    for (const m of db.moves.filter((x) => x.type === S22.TYPES.casse || x.type === S22.TYPES.retour)) {
      if (!db.mails.some((x) => (x.subject + x.text).includes(m.ref))) throw new Error(`${m.ref} : retour ou casse sans document dans la messagerie`);
    }
    const motifs = S22.INVENTAIRE.lignes.filter((l) => l.motif).map((l) => l.motif);
    if (JSON.stringify(motifs) !== JSON.stringify(['Démarque inconnue'])) throw new Error('motifs attendus : ' + motifs.join(', '));
  });

  await v('ENT-2.2 : la ligne témoin (coques) n\'a aucune cause à trouver — c\'est la seule où régulariser est juste', async () => {
    const db = ouvrir(S22);
    const mails = db.mails.map((m) => m.subject + ' ' + m.text + ' ' + (m.remarque || '')).join('\n');
    // Aucun message ne parle des coques autrement que pour écarter la piste (relevé : « bacs voisins vérifiés »).
    const parlent = db.mails.filter((m) => /COQ-UNI-01|coque/i.test(m.subject + ' ' + m.text));
    if (parlent.length) throw new Error('un message explique l\'écart des coques : ' + parlent[0].subject);
    if (!/A-04-2 : recompté deux fois, bacs voisins vérifiés/.test(mails)) throw new Error('la remarque du relevé n\'écarte pas la piste du mauvais rangement');
    const mvCoq = db.moves.filter((m) => m.sku === 'COQ-UNI-01');
    if (mvCoq.some((m) => m.type !== S22.TYPES.preparation)) throw new Error('un mouvement atypique explique les coques');
    // Sans cette ligne, « remettre en rayon » serait juste partout : au moins une régularisation attendue.
    const regul = S22.INVENTAIRE.lignes.filter((l) => l.attendu === 'regul');
    if (regul.length !== 1 || regul[0].ref !== 'COQ-UNI-01') throw new Error('une seule régularisation attendue : les coques');
    const rayon = S22.INVENTAIRE.lignes.filter((l) => l.attendu === 'rayon');
    if (rayon.length < 2) throw new Error('le mauvais rangement doit se présenter au moins deux fois');
  });

  // ---------- ENT-2.2 — les jalons
  await v('ENT-2.2 : sans travail, aucun jalon n\'est acquis (l\'inaction ne rapporte rien) ; base nue = « pas encore là »', async () => {
    const db = ouvrir(S22);
    const st = statuts(S22, db);
    if (st.some((s) => s !== 'attente')) throw new Error('statuts avant travail : ' + st.join(', '));
    const nue = S22.baseDeDepart('Léa'); nue.moves = []; nue.mails = []; nue.orders = [];
    if (statuts(S22, nue).some((s) => s !== 'na')) throw new Error('un jalon juge une base sans mouvements');
    // Un inventaire VALIDÉ sans aucune décision ne rapporte pas les deux jalons de décisions.
    const sans = etat22(ouvrir(S22), { decisions: {} });
    const t = tombes22(sans);
    if (!t.includes('rangements') || !t.includes('temoin')) throw new Error('décisions absentes mais jalons acquis : ' + t.join(', '));
  });

  await v('ENT-2.2 : le parcours juste valide les cinq jalons', async () => {
    const db = justeDb();
    const st = statuts(S22, db);
    if (st.some((s) => s !== 'ok')) throw new Error('statuts : ' + st.join(', '));
  });

  await v('ENT-2.2 : tant que l\'inventaire n\'est pas validé, les décisions ne sont pas jugées (« attente »)', async () => {
    const db = justeDb({ valide: false });
    const st = Object.fromEntries(ids22.map((x, i) => [x, statuts(S22, db)[i]]));
    if (st.rangements !== 'attente' || st.temoin !== 'attente' || st.taux !== 'attente') throw new Error('décisions jugées avant validation : ' + JSON.stringify(st));
    if (st.comptage !== 'ok' || st.ecarts !== 'ok') throw new Error('comptage et écarts justes non reconnus : ' + JSON.stringify(st));
  });

  await v('ENT-2.2 : chaque erreur typique fait tomber SON jalon, et lui seul', async () => {
    const cas = [
      // Les trois façons de ne pas voir le mauvais rangement : régulariser à tort.
      ['rangements', 'régulariser les chargeurs manquants', { decisions: { ...BONNES_22, 'CHG-20W': ['regul', 'Démarque inconnue'] } }],
      ['rangements', 'régulariser le surplus de câbles', { decisions: { ...BONNES_22, 'CAB-USBC-1M': ['regul', 'Erreur de réception'] }, recomptes: {} }],
      ['rangements', 'régulariser les batteries', { decisions: { ...BONNES_22, 'BAT-10K': ['regul', 'Casse'] } }],
      ['rangements', 'ne rien décider pour les batteries', { decisions: { 'CAB-USBC-1M': ['recompter'], 'CHG-20W': ['rayon'], 'COQ-UNI-01': ['regul', 'Démarque inconnue'] } }],
      // Le piège inverse : « tout est un mauvais rangement ».
      ['temoin', 'remettre les coques en rayon', { decisions: { ...BONNES_22, 'COQ-UNI-01': ['rayon'] } }],
      ['temoin', 'régulariser les coques avec un autre motif', { decisions: { ...BONNES_22, 'COQ-UNI-01': ['regul', 'Casse'] } }],
      ['temoin', 'recompter les coques', { decisions: { ...BONNES_22, 'COQ-UNI-01': ['recompter'] } }],
      // Le calcul.
      ['taux', 'taux faux (écarts relevés avec leur signe)', { taux: '0' }],
      ['taux', 'taux en quantité faux (somme des écarts / somme des stocks avec une erreur)', { taux: '3,3' }],
    ];
    for (const [id, quoi, surcharge] of cas) {
      const db = justeDb(surcharge);
      const t = tombes22(db);
      if (t.length !== 1 || t[0] !== id) throw new Error(`« ${quoi} » : tombent ${t.join(', ') || 'aucun'}, attendu ${id}`);
    }
    // Des écarts mal calculés : le jalon « écarts » ne passe pas.
    const mal = justeDb({ ecarts: { ...ECARTS_22, 'CHG-20W': 3 } });
    if (!tombes22(mal).includes('ecarts')) throw new Error('écart mal calculé non vu');
    // Un comptage qui ne reprend pas le relevé : le jalon « comptage » ne passe pas.
    const faux = justeDb({ saisie: { ...COMPTE_22, 'CAB-USBC-1M': 64 } });
    if (!tombes22(faux).includes('comptage')) throw new Error('relevé mal reporté non vu');
  });

  await v('ENT-2.2 : le taux se lit à ± 0,1 point (3,7 juste, 3,66 juste, 4 faux)', async () => {
    for (const [taux, ok] of [['3,7', true], ['3.7', true], ['3,66', true], ['3,8', true], ['4', false], ['10', false], ['', false]]) {
      const t = tombes22(justeDb({ taux }));
      if (ok !== !t.includes('taux')) throw new Error(`taux « ${taux} » : ${ok ? 'doit passer' : 'doit tomber'} (tombent : ${t.join(', ') || 'aucun'})`);
    }
  });

  // ---------- ENT-2.2 — dans le navigateur, avec le vrai moteur et le vrai écran Inventaire
  await v('ENT-2.2 : inscrite au registre, cachée tant que pret: false, parmi les séances C1.6', async () => {
    const src = fs.readFileSync(path.join(ROOT, 'activites', 'index.js'), 'utf8');
    if (!src.includes("import('./cdiscount-inventaire.js')")) throw new Error('absente de activites/index.js');
    const meta = await page.evaluate(async () => (await import('/activites/cdiscount-inventaire.js')).meta);
    if (meta.code !== 'ENT-2.2' || meta.temps !== 'entrainement' || !meta.competences.includes('C1.6')) throw new Error('meta incomplet');
    if (meta.bareme !== S22.ETAPES.length) throw new Error('barème ≠ nombre de jalons');
    const { activiteVisible } = await imp('core/niveaux.js');
    if (!meta.pret && activiteVisible(meta, { niveau: '1re' })) throw new Error('séance non prête visible des élèves');
    const regs = await page.evaluate(async () => {
      const m = await import('/activites/index.js');
      return (await m.chargerActivites()).map((a) => a.meta.code);
    });
    if (!regs.includes('ENT-2.2')) throw new Error('ENT-2.2 absente du registre chargé');
  });

  // Un onglet à part pour l'élève : on rejoue le parcours avec de vrais clics.
  const ctx22 = await nav.newContext();
  const pg = await ctx22.newPage();
  pg.setDefaultTimeout(6000);
  const erreurs22 = [];
  pg.on('pageerror', (e) => erreurs22.push('PAGEERROR: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs22.push('CONSOLE: ' + m.text()); });
  await pg.goto(new URL('/', page.url()).toString());
  await pg.waitForSelector('#btnProf', { timeout: 8000 });

  const monter22 = async (role = 'eleve') => {
    await pg.evaluate(async (r) => {
      const mod = await import('/activites/cdiscount-inventaire.js');
      document.querySelector('#hote22')?.remove();
      const hote = document.createElement('div'); hote.id = 'hote22'; document.body.appendChild(hote);
      const db = {};
      window.__inv22 = { db, scores: [] };
      mod.rendre(hote, { meta: mod.meta, profil: { prenom: 'Léa', nom: 'Test', role: r }, codeStock: 'STOCK24',
        jeu: { etat: () => db, sauver() {} }, enregistrer(x) { window.__inv22.scores.push(x); }, quitter() {} });
    }, role);
  };
  const Z22 = '#hote22 .ent-main';
  const ouvrir22 = async (vue) => { await pg.click(`#hote22 .ent-nav[data-vue="${vue}"]`); await pg.waitForTimeout(80); };
  const texte22 = async (sel) => ((await pg.textContent(sel || Z22)) || '').replace(/\s+/g, ' ').trim();
  const aller22 = async (n) => { await pg.click(`${Z22} [data-inv-aller="${n}"]`); await pg.waitForTimeout(80); };
  const decider22 = async (ref, action, motif) => {
    await pg.selectOption(`${Z22} [data-inv-action="${ref}"]`, action); await pg.waitForTimeout(80);
    if (motif) await pg.selectOption(`${Z22} [data-inv-motif="${ref}"]`, motif);
  };
  const dbPage = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__inv22.db)));
  const jusquAuTraitement22 = async () => {
    await ouvrir22('inventaire');
    for (const r of ORDRE_22) await pg.fill(`${Z22} [data-inv-saisie="${r}"]`, String(COMPTE_22[r]));
    await aller22(2);
    for (const r of ORDRE_22) await pg.fill(`${Z22} [data-inv-ecart="${r}"]`, String(ECARTS_22[r]).replace('-', '−'));
    await aller22(3);
  };
  const valider22 = async (taux = '3,7') => {
    await aller22(4);
    await pg.fill(`${Z22} [data-inv-taux]`, taux);
    await pg.click(`${Z22} [data-inv-valider]`); await pg.waitForTimeout(120);
  };

  await v('ENT-2.2 : la séance s\'ouvre dans le vrai moteur — huit messages, relevé « papier », stock caché à l\'aveugle', async () => {
    await monter22();
    const accueil = await texte22();
    // L'accueil d'un environnement affiche d'ordinaire le stock total : ici il trahirait le comptage.
    if (/en stock|références en rupture/.test(accueil) || /\b270\b/.test(accueil)) throw new Error('le stock du système est lisible à l\'accueil : ' + accueil.slice(0, 200));
    if (!(await pg.$('#hote22 .ent-nav[data-vue="inventaire"]'))) throw new Error('pas d\'entrée Inventaire');
    const accent = await pg.evaluate(() => getComputedStyle(document.body).getPropertyValue('--ardoise').trim());
    if (accent.toLowerCase() !== '#3732ff') throw new Error('accent de la charte non appliqué : ' + accent);
    await ouvrir22('mail');
    const nb = await pg.$$eval('#hote22 .ent-mitem', (e) => e.length);
    if (nb !== 7) throw new Error(`${nb} messages au lieu de 7`);
    // Le relevé papier : huit lignes (emplacement, référence, quantité) et la remarque de l'équipe.
    const sujets = await pg.$$eval('#hote22 .ent-mitem', (e) => e.map((x) => x.textContent));
    const idx = sujets.findIndex((s) => /Relevé de comptage/.test(s));
    await pg.click(`#hote22 .ent-mitem >> nth=${idx}`); await pg.waitForTimeout(80);
    const lignes = await pg.$$eval('#hote22 .inv-papier tbody tr', (e) => e.map((x) => [...x.querySelectorAll('td')].map((t) => t.textContent.trim())));
    if (JSON.stringify(lignes.map((l) => [l[1], Number(l[2])])) !== JSON.stringify(ORDRE_22.map((r) => [r, COMPTE_22[r]]))) throw new Error('relevé affiché : ' + JSON.stringify(lignes));
    if (!/bacs voisins vérifiés/.test(await texte22('#hote22 .inv-papier'))) throw new Error('remarque du relevé absente');
    // À l'aveugle : Stock bloqué, console fermée sur le stock — pour l'élève.
    await ouvrir22('stock');
    if (!(await pg.$(`${Z22} [data-stock-bloque]`))) throw new Error('Stock doit être bloqué');
    await ouvrir22('console');
    await pg.fill('#champCmd', '.getstock COQ-UNI-01'); await pg.press('#champCmd', 'Enter'); await pg.waitForTimeout(80);
    const blocs = await pg.$$eval(`${Z22} .ent-cres`, (e) => e.map((x) => x.textContent));
    if (!/Inventaire en cours/.test(blocs[blocs.length - 1] || '')) throw new Error('.getstock devrait être refusée : ' + blocs[blocs.length - 1]);
    // Pas de fuite par le Catalogue : le stock du système n'y figure pas avant la validation du comptage.
    await ouvrir22('catalogue');
    const cat = await texte22();
    for (const n of ['64', '44', '37']) if (new RegExp(`(Stock|stock)\\D{0,12}\\b${n}\\b`).test(cat)) throw new Error('le Catalogue montre un stock du système : ' + n);
  });

  await v('ENT-2.2 : parcours juste de bout en bout — 4 décisions justes, une seule régularisation, correction détaillée, score 5/5', async () => {
    await monter22();
    await jusquAuTraitement22();
    // Les quatre écarts, pas un de plus.
    const lignes = await pg.$$eval(`${Z22} [data-inv-ligne]`, (e) => e.map((x) => x.dataset.invLigne));
    if (JSON.stringify(lignes) !== JSON.stringify(['CAB-USBC-1M', 'CHG-20W', 'BAT-10K', 'COQ-UNI-01'])) throw new Error('lignes à traiter : ' + lignes.join(', '));
    // Les mouvements de la ligne sont consultables, et ne commencent qu'après le dernier inventaire.
    await pg.click(`${Z22} [data-inv-ouvrir="BAT-10K"]`); await pg.waitForTimeout(80);
    const mv = await pg.$$eval(`${Z22} [data-inv-mvts="BAT-10K"] tbody tr`, (e) => e.length);
    if (mv !== 4) throw new Error(`${mv} mouvements de BAT-10K à l'écran au lieu de 4`);
    await decider22('CAB-USBC-1M', 'recompter');
    await decider22('CHG-20W', 'rayon');
    await decider22('BAT-10K', 'rayon');
    await decider22('COQ-UNI-01', 'regul', 'Démarque inconnue');
    await valider22('3,7');
    const bilan = await texte22();
    if (!/Inventaire INV-2026-52 validé/.test(bilan)) throw new Error('inventaire non validé : ' + bilan.slice(0, 200));
    if (!/4 décisions justes sur 4/.test(bilan)) throw new Error('bilan : ' + bilan.slice(0, 300));
    // Correction DÉTAILLÉE : la colonne « Ce qu'il fallait voir » et l'explication du mauvais rangement.
    if (!/Ce qu'il fallait voir/.test(bilan) || !/les trois mêmes cartons/.test(bilan)) throw new Error('correction détaillée absente');
    const db = await dbPage();
    // Un seul ajustement : les coques, −2, avec le motif.
    const aj = db.moves.filter((m) => m.type === 'Ajustement inventaire');
    if (aj.length !== 1 || aj[0].sku !== 'COQ-UNI-01' || aj[0].delta !== -2 || !/INV-2026-52 · Démarque inconnue/.test(aj[0].ref)) throw new Error('ajustements : ' + JSON.stringify(aj));
    const attendu = { ...SYSTEME_22, 'COQ-UNI-01': 25 };
    if (JSON.stringify(db.stock) !== JSON.stringify(attendu)) throw new Error('stock final : ' + JSON.stringify(db.stock));
    // Les jalons, lus par la même fonction que l'écran.
    const st = statuts(S22, db);
    if (st.some((s) => s !== 'ok')) throw new Error('jalons : ' + st.join(', '));
    const dernier = await pg.evaluate(() => window.__inv22.scores[window.__inv22.scores.length - 1]);
    if (!dernier || dernier.score !== 5 || dernier.max !== 5) throw new Error('score remonté : ' + JSON.stringify(dernier));
    // Après validation, Stock s'ouvre (le code est celui du groupe) et affiche le stock régularisé.
    await ouvrir22('stock');
    await pg.fill(`${Z22} #codeStock`, 'STOCK24'); await pg.click(`${Z22} [data-deverrouiller]`); await pg.waitForTimeout(80);
    const lig = await texte22(`${Z22} #entListe`);
    if (!/COQ-UNI-01.*?universelle\s*25\b/.test(lig)) throw new Error('Stock ne montre pas 25 coques : ' + lig.slice(0, 300));
  });

  await v('ENT-2.2 : le réflexe « tout écart négatif se régularise » coûte cher — les chargeurs disparaissent du stock, et la correction dit pourquoi', async () => {
    await monter22();
    await jusquAuTraitement22();
    await decider22('CAB-USBC-1M', 'recompter');
    await decider22('CHG-20W', 'regul', 'Démarque inconnue');   // le piège
    await decider22('BAT-10K', 'rayon');
    await decider22('COQ-UNI-01', 'regul', 'Démarque inconnue');
    await valider22('3,7');
    const bilan = await texte22();
    if (!/3 décisions justes sur 4/.test(bilan)) throw new Error('bilan : ' + bilan.slice(0, 300));
    if (!/à revoir/.test(bilan) || !/les trois mêmes cartons/.test(bilan)) throw new Error('la correction n\'explique pas le mauvais rangement');
    const db = await dbPage();
    if (db.stock['CHG-20W'] !== 41) throw new Error('les chargeurs devraient être régularisés à 41 : ' + db.stock['CHG-20W']);
    const t = tombes22(db);
    if (t.length !== 1 || t[0] !== 'rangements') throw new Error('jalons tombés : ' + t.join(', '));
    const dernier = await pg.evaluate(() => window.__inv22.scores[window.__inv22.scores.length - 1]);
    if (!dernier || dernier.score !== 4) throw new Error('score : ' + JSON.stringify(dernier));
  });

  await v('ENT-2.2 : à l\'étape 3, régulariser sans motif est refusé, et le recomptage des câbles fait disparaître l\'écart', async () => {
    await monter22();
    await jusquAuTraitement22();
    await decider22('CAB-USBC-1M', 'recompter');
    await decider22('CHG-20W', 'rayon');
    await decider22('BAT-10K', 'rayon');
    await decider22('COQ-UNI-01', 'regul');                 // pas de motif
    await aller22(4);
    const msg = await texte22(`${Z22} [data-inv-msg]`);
    if (!/sans motif est refusée/.test(msg)) throw new Error('refus attendu : ' + msg);
    const ecart = await texte22(`${Z22} [data-inv-ligne="CAB-USBC-1M"] [data-inv-ecart-ligne]`);
    if (!/0/.test(ecart.replace(/\s/g, '')) || /\+3/.test(ecart)) throw new Error('l\'écart des câbles devrait avoir disparu au recomptage : ' + ecart);
  });

  await v('ENT-2.2 : l\'enseignant voit le stock malgré le comptage à l\'aveugle', async () => {
    await monter22('prof');
    await ouvrir22('stock');
    if (await pg.$(`${Z22} [data-stock-bloque]`)) throw new Error('Stock bloqué pour l\'enseignant');
  });

  await v('ENT-2.2 : le bandeau dit « Tout à l\'écran » à la place des liens de trame (aucune trame, aucun lien mort)', async () => {
    await monter22();
    const b = await pg.$$eval('#hote22 .ent-bandeau .ent-sans-trame', (e) => e.map((x) => x.textContent.trim()));
    if (b.length !== 1 || !/Tout à l.écran/.test(b[0])) throw new Error('étiquette du bandeau : ' + JSON.stringify(b));
    const liens = await pg.$$eval('#hote22 .ent-bandeau a[download]', (e) => e.length);
    if (liens) throw new Error(liens + ' lien(s) de trame alors qu\'il n\'y a pas de trame');
  });

  await v('ENT-2.2 : aucune erreur de console ni d\'exception pendant ces parcours', async () => {
    await pg.evaluate(() => { document.querySelector('#hote22')?.remove(); document.body.classList.remove('immersion'); });
    await ctx22.close();
    if (erreurs22.length) throw new Error(erreurs22.slice(0, 3).join(' | '));
  });

  /* ================================================================================
   * ENT-2.3 « Régularisé à l'aveugle » (erreur induite) — ajouté le 03/10/2026, chantier D.
   *
   * Décisions de Tristan : le vrai problème est une LIVRAISON INCOMPLÈTE (Gardéo livre 8 mixeurs
   * pour 12 annoncés, la réception valide les 12) ; l'élève répond par un message à lignes à
   * intitulé ; séance d'entraînement hors évaluation, `pret: false`. Les valeurs attendues sont
   * écrites À LA MAIN ici : un test qui les recalculerait avec le code de la séance ne verrait pas
   * une erreur de données.
   * ============================================================================== */

  const S23 = await imp('contenus/cdiscount-regularise.js');
  const STOCK_23 = { 'BOU-17L': 16, 'GRP-2F': 11, 'MIX-PLG': 9, 'MUL-4P': 37, 'PIL-AA-8': 75, 'VEI-LED': 9 };
  const ids23 = S23.ETAPES.map((x) => x.id);
  const tombes23 = (db) => { const st = statuts(S23, db); return ids23.filter((x, i) => st[i] !== 'ok'); };

  const JUSTE_23 = `Ajustement à revoir : MIX-PLG, -4
Ajustement justifié : GRP-2F, constat de casse DEM-26-0036
Réception concernée : REC-26-0447
Annoncé sur le bon de livraison : 12
Réellement reçu : 8
Valeur du manque : 4 × 12,60 = 50,40 €
Motif exact : Erreur de réception
Suite à donner : Réclamation auprès de Gardéo, livraison incomplète`;

  await v('ENT-2.3 : volume déclaré = volume réel (6 références, 11 documents, 22 mouvements), plus fort qu\'ENT-2.1', async () => {
    const db = ouvrir(S23);
    const refs = new Set(db.moves.map((m) => m.sku));
    // Documents : les réceptions, les commandes, et le constat de casse (un message).
    const constats = db.mails.filter((m) => /^Constat de casse DEM-/.test(m.subject)).length;
    const vol = { references: refs.size, documents: db.receptions.length + db.orders.length + constats, mouvements: db.moves.length };
    if (JSON.stringify(vol) !== JSON.stringify({ references: 6, documents: 11, mouvements: 22 })) throw new Error('volume réel : ' + JSON.stringify(vol));
    for (const k of Object.keys(S23.VOLUME)) if (S23.VOLUME[k] !== vol[k]) throw new Error(`${k} : déclaré ${S23.VOLUME[k]}, réel ${vol[k]}`);
    if (S23.CATALOGUE.VARIANTS.length !== 6) throw new Error('la séance montre plus ou moins que ses six références');
    if (!(refs.size > S21.VOLUME.references && db.moves.length > S21.VOLUME.mouvements)) throw new Error('le volume ne dépasse pas celui d\'ENT-2.1');
    const meta = await page.evaluate(async () => (await import('/activites/cdiscount-regularise.js')).meta);
    if (JSON.stringify(meta.volume) !== JSON.stringify(S23.VOLUME)) throw new Error('le meta ne déclare pas le volume de la séance');
  });

  await v('ENT-2.3 : mouvements datés dans l\'ordre, stock « après » sans trou, stock final écrit à la main', async () => {
    const db = ouvrir(S23);
    for (let i = 1; i < db.moves.length; i++) if (db.moves[i].ts < db.moves[i - 1].ts) throw new Error('mouvements dans le désordre');
    if (db.moves.some((m) => m.ts > Date.now())) throw new Error('un mouvement est daté dans le futur');
    if (db.moves.some((m) => m.ts < S23.dateInventaire())) throw new Error('un mouvement est antérieur à l\'inventaire');
    const s = { ...S23.INVENTAIRE_PRECEDENT };
    for (const m of db.moves) { s[m.sku] += m.delta; if (m.after !== s[m.sku]) throw new Error(`stock après faux sur ${m.sku} (${m.ref})`); if (s[m.sku] < 0) throw new Error(`stock négatif sur ${m.sku}`); }
    for (const [k, n] of Object.entries(STOCK_23)) if (db.stock[k] !== n) throw new Error(`stock final de ${k} : ${db.stock[k]} au lieu de ${n}`);
    // Chaque mouvement a son document : réception, bon de préparation, ou campagne d'inventaire.
    const recs = new Set(db.receptions.map((r) => r.no)), bps = new Set(db.orders.map((o) => 'BP-' + o.no.replace('CMD-', '')));
    for (const m of db.moves) {
      const ok = recs.has(m.ref) || bps.has(m.ref) || m.ref.startsWith(S23.ID_CAMPAGNE + ' · ');
      if (!ok) throw new Error(`mouvement sans document : ${m.sku} ${m.type} ${m.ref}`);
      if (!Object.values(S23.TYPES).includes(m.type)) throw new Error(`type de mouvement inattendu : ${m.type}`);
    }
    // Le type d'un ajustement est celui que le moteur écrit lui-même (écran Inventaire, console).
    if (S23.TYPES.ajustement !== 'Ajustement inventaire') throw new Error('type d\'ajustement différent de celui du moteur');
    // Le « vu en stock » des bons de préparation est le stock juste avant la sortie.
    for (const o of db.orders) for (const l of o.lines) {
      const m = db.moves.find((x) => x.ref === 'BP-' + o.no.replace('CMD-', '') && x.sku === l.sku);
      if (o.prep.rows[l.sku].seen !== m.after + l.qty) throw new Error(`${o.no} : « vu en stock » incohérent`);
    }
  });

  await v('ENT-2.3 : le piège — un seul écart BL / colis, sur les mixeurs de REC-26-0447, et deux ajustements dont un seul est orphelin', async () => {
    const db = ouvrir(S23);
    const m = S23.manques(db);
    if (m.length !== 1) throw new Error(`${m.length} écarts BL / colis au lieu d'un : ` + JSON.stringify(m));
    if (JSON.stringify(m[0]) !== JSON.stringify({ rec: 'REC-26-0447', sku: 'MIX-PLG', annonce: 12, recu: 8, manque: 4 })) throw new Error('écart : ' + JSON.stringify(m[0]));
    // La réception a pourtant été validée à la quantité du BL : c'est l'erreur du réceptionnaire.
    const r = db.receptions.find((x) => x.no === 'REC-26-0447');
    if (!r.ctrl.validated || r.ctrl.rows['MIX-PLG'].compte !== 12) throw new Error('la réception doit être validée à 12');
    const entree = db.moves.find((x) => x.ref === 'REC-26-0447' && x.sku === 'MIX-PLG');
    if (!entree || entree.delta !== 12) throw new Error('le stock doit être entré à la quantité du BL (12)');
    // L'autre réception est irréprochable.
    const autre = db.receptions.find((x) => x.no === 'REC-26-0441');
    for (const l of autre.bl.lines) { const q = autre.colis.filter((c) => c.sku === l.sku).reduce((n, c) => n + c.qty, 0); if (q !== l.qty) throw new Error('REC-26-0441 devrait être conforme'); }
    // Deux ajustements : MIX −4 « Démarque inconnue » et GRP −1 « Casse ».
    const aj = db.moves.filter((x) => x.type === 'Ajustement inventaire');
    if (aj.length !== 2) throw new Error(`${aj.length} ajustements au lieu de 2`);
    const orph = aj.find((x) => x.sku === 'MIX-PLG'), just = aj.find((x) => x.sku === 'GRP-2F');
    if (!orph || orph.delta !== -4 || !/Démarque inconnue/.test(orph.ref)) throw new Error('ajustement orphelin mal formé : ' + JSON.stringify(orph));
    if (!just || just.delta !== -1 || !/Casse/.test(just.ref)) throw new Error('ajustement justifié mal formé : ' + JSON.stringify(just));
    // Le justifié a son constat de casse ; l'orphelin n'en a aucun (seul l'indice du cariste y mène).
    if (!db.mails.some((x) => /Constat de casse DEM-26-0036/.test(x.subject))) throw new Error('constat de casse DEM-26-0036 absent');
    if (db.mails.some((x) => /DEM-/.test(x.subject + x.text) && /mixeur/i.test(x.subject + x.text))) throw new Error('un constat de casse justifie les mixeurs : plus d\'ajustement orphelin');
    // Le stock du système avant l'ajustement orphelin est celui que cite le magasinier (13 → 9).
    if (orph.after !== 9 || orph.after - orph.delta !== 13) throw new Error(`stock avant/après l'ajustement : ${orph.after - orph.delta} → ${orph.after}`);
  });

  await v('ENT-2.3 : l\'erreur est induite (« c\'est de la démarque »), l\'indice existe, le délai de réclamation est donné', async () => {
    const db = ouvrir(S23);
    const samir = db.mails.find((x) => x.fromMail === S23.SAMIR.mail);
    if (!samir || !/C'est de la démarque/.test(samir.text) || !/Pas besoin d'aller plus loin/.test(samir.text)) throw new Error('le message du magasinier ne pousse pas à la conclusion rapide');
    if (!/\b9\b/.test(samir.text) || !/\b13\b/.test(samir.text)) throw new Error('le message cite un autre stock que le vrai (13 → 9)');
    const kevin = db.mails.find((x) => /un trou dans la couche de mixeurs/.test(x.subject));
    if (!kevin || !kevin.text.includes('REC-26-0447')) throw new Error('indice du cariste absent');
    if (kevin.ts < db.receptions.find((r) => r.no === 'REC-26-0447').ts) throw new Error('l\'indice du cariste est antérieur à la réception');
    const mission = db.mails.find((x) => x.fromMail === CD.EQUIPE.cheffe.mail && /Ajustements de la semaine/.test(x.subject));
    for (const l of S23.LIGNES_REPONSE) if (!mission.text.includes(l)) throw new Error('ligne à recopier absente du message : ' + l);
    if (!new RegExp(`dans les ${S23.DELAI_RECLAMATION} jours qui suivent la livraison`).test(mission.text)) throw new Error('délai de réclamation absent');
    // Il reste du temps : la réception date de moins que le délai (sinon la réclamation est perdue d'avance).
    const jours = (Date.now() - db.receptions.find((r) => r.no === 'REC-26-0447').ts) / 864e5;
    if (!(jours < S23.DELAI_RECLAMATION)) throw new Error('le délai de réclamation est déjà dépassé');
    // Cinq messages : bienvenue, indice, magasinier, casse, mission.
    if (db.mails.length !== 5) throw new Error(`${db.mails.length} messages au lieu de 5`);
  });

  await v('ENT-2.3 : sans réponse, aucun jalon n\'est acquis ; base nue ou sans écart BL / colis = « pas encore là »', async () => {
    const db = ouvrir(S23);
    const st = statuts(S23, db);
    if (st.length !== 6 || st.some((s) => s !== 'attente')) throw new Error('statuts avant réponse : ' + st.join(', '));
    const nue = S23.baseDeDepart('Léa'); nue.moves = []; nue.mails = []; nue.orders = [];
    if (statuts(S23, nue).some((s) => s !== 'na')) throw new Error('un jalon juge une base sans mouvements');
    // Si les colis font le compte, il n'y a plus de litige : les jalons se taisent au lieu de mentir.
    const sain = ouvrir(S23);
    sain.receptions.find((r) => r.no === 'REC-26-0447').colis.push({ no: 99, sku: 'MIX-PLG', qty: 4, etat: 'ok' });
    repondre(sain, JUSTE_23);
    if (statuts(S23, sain).some((s) => s !== 'na')) throw new Error('jalons sur une base sans litige : ' + statuts(S23, sain).join(', '));
  });

  await v('ENT-2.3 : la réponse juste valide les six jalons, calcul compris', async () => {
    const db = ouvrir(S23);
    repondre(db, JUSTE_23);
    const st = statuts(S23, db);
    if (st.some((s) => s !== 'ok')) throw new Error('statuts : ' + st.join(', '));
    // La réponse attendue calculée depuis la base est, elle aussi, juste.
    const db2 = ouvrir(S23);
    repondre(db2, S23.reponseAttendue(db2));
    if (tombes23(db2).length) throw new Error('reponseAttendue() ne valide pas : ' + tombes23(db2).join(', '));
    // Écritures tolérées : « 50.4 », « 50,4 € », motif « livraison incomplète », « litige ».
    const db3 = ouvrir(S23);
    repondre(db3, JUSTE_23.replace('4 × 12,60 = 50,40 €', '50.4').replace('Erreur de réception', 'une livraison incomplète').replace('Réclamation auprès de Gardéo, livraison incomplète', 'ouvrir un litige avec le fournisseur'));
    if (tombes23(db3).length) throw new Error('écritures tolérées refusées : ' + tombes23(db3).join(', '));
  });

  await v('ENT-2.3 : chaque erreur typique fait tomber SON jalon, et lui seul', async () => {
    const cas = [
      ['ajustements', 'Ajustement à revoir : MIX-PLG, -4', 'Ajustement à revoir : GRP-2F, -1'],                 // le casse justifié accusé à la place
      ['ajustements', 'Ajustement à revoir : MIX-PLG, -4', 'Ajustement à revoir : MIX-PLG et GRP-2F'],          // « tout ajustement est suspect »
      ['ajustements', 'GRP-2F, constat de casse DEM-26-0036', 'GRP-2F'],                                         // justifié deviné, sans le constat
      ['ajustements', 'GRP-2F, constat de casse DEM-26-0036', 'MIX-PLG, constat de casse DEM-26-0036'],         // inversé
      ['reception', 'Réception concernée : REC-26-0447', 'Réception concernée : REC-26-0441'],                  // la mauvaise réception
      ['reception', 'Réception concernée : REC-26-0447', 'Réception concernée : REC-26-0447 et REC-26-0441'],   // les deux
      ['quantites', 'Annoncé sur le bon de livraison : 12\nRéellement reçu : 8', 'Annoncé sur le bon de livraison : 8\nRéellement reçu : 12'], // inversées
      ['quantites', 'Réellement reçu : 8', 'Réellement reçu : 12'],                                              // les colis non additionnés
      ['valeur', '4 × 12,60 = 50,40 €', '4 × 27,99 = 111,96 €'],                                                // le prix de vente au lieu du prix d'achat
      ['valeur', '4 × 12,60 = 50,40 €', '4 × 12,60 = 50,40 €\nValeur du manque : 4 €'],                          // la dernière ligne qui porte l'intitulé fait foi
      ['motif', 'Motif exact : Erreur de réception', 'Motif exact : Démarque inconnue'],                         // l'erreur du magasinier reprise
      ['suite', 'Suite à donner : Réclamation auprès de Gardéo, livraison incomplète', "Suite à donner : rien, c'est de la démarque"],
    ];
    for (const [id, avant, apres] of cas) {
      if (!JUSTE_23.includes(avant.split('\n')[0]) && !JUSTE_23.includes(avant)) throw new Error(`cas mal écrit : ${avant}`);
      const db = ouvrir(S23);
      repondre(db, JUSTE_23.replace(avant, apres));
      const tombes = tombes23(db);
      if (tombes.length !== 1 || tombes[0] !== id) throw new Error(`« ${apres} » : tombent ${tombes.join(', ') || 'aucun'}, attendu ${id}`);
    }
  });

  await v('ENT-2.3 : le meilleur essai est retenu, une réponse à un autre destinataire ne compte pas, une ligne absente tombe seule', async () => {
    const db = ouvrir(S23);
    repondre(db, JUSTE_23.replace('Réception concernée : REC-26-0447', 'Réception concernée : REC-26-0441'));
    if (tombes23(db).join() !== 'reception') throw new Error('premier essai faux non détecté : ' + tombes23(db).join());
    repondre(db, JUSTE_23);
    if (tombes23(db).length) throw new Error('le second essai juste n\'est pas retenu');
    const db2 = ouvrir(S23);
    db2.mails.push({ folder: 'out', ts: Date.now(), toMail: CD.EQUIPE.quai.mail, text: JUSTE_23 });
    if (statuts(S23, db2).some((s) => s !== 'attente')) throw new Error('une réponse au cariste est comptée');
    const db3 = ouvrir(S23);
    repondre(db3, JUSTE_23.split('\n').filter((l) => !l.startsWith('Motif exact')).join('\n'));
    if (tombes23(db3).join() !== 'motif') throw new Error('ligne « Motif exact » absente : ' + tombes23(db3).join());
  });

  await v('ENT-2.3 : inscrite au registre, cachée tant que pret: false, parmi les séances C1.6, temps « erreur induite »', async () => {
    const src = fs.readFileSync(path.join(ROOT, 'activites', 'index.js'), 'utf8');
    if (!src.includes("import('./cdiscount-regularise.js')")) throw new Error('absente de activites/index.js');
    const meta = await page.evaluate(async () => (await import('/activites/cdiscount-regularise.js')).meta);
    if (meta.code !== 'ENT-2.3' || meta.temps !== 'erreur' || !meta.competences.includes('C1.6')) throw new Error('meta incomplet');
    if (meta.bareme !== S23.ETAPES.length) throw new Error('barème ≠ nombre de jalons');
    if (meta.reinitialisable) throw new Error('la remise à zéro est réservée aux séances X.1');
    const { activiteVisible } = await imp('core/niveaux.js');
    if (!meta.pret && activiteVisible(meta, { niveau: '1re' })) throw new Error('séance non prête visible des élèves');
    const regs = await page.evaluate(async () => (await (await import('/activites/index.js')).chargerActivites()).map((a) => a.meta.code));
    if (!regs.includes('ENT-2.3')) throw new Error('ENT-2.3 absente du registre chargé');
  });

  await v('ENT-2.3 : la séance s\'ouvre, se lit et se répond dans le vrai moteur — le litige est visible à l\'écran', async () => {
    const res = await page.evaluate(async ({ CHEFFE, JUSTE_ }) => {
      const mod = await import('/activites/cdiscount-regularise.js');
      const hote = document.createElement('div');
      hote.id = 'essaiCdiscount23';
      document.body.appendChild(hote);
      const db = {};
      const ctx = { meta: mod.meta, profil: { prenom: 'Léa', role: 'eleve' }, codeStock: 'STOCK24',
        jeu: { etat: () => db, sauver() {} }, enregistrer(r) { window.__cdScore23 = r; }, quitter() {} };
      mod.rendre(hote, ctx);
      const attendre = () => new Promise((r) => setTimeout(r, 60));
      const clic = async (sel) => { const e = hote.querySelector(sel); if (!e) throw new Error('introuvable : ' + sel); e.click(); await attendre(); };
      const out = {};
      out.accent = getComputedStyle(document.body).getPropertyValue('--ardoise').trim();
      await clic('[data-vue="mail"]');
      out.mails = hote.querySelectorAll('.ent-mitem').length;
      // La console, sur l'article en cause : six mouvements, dont l'ajustement.
      await clic('[data-vue="console"]');
      hote.querySelector('#champCmd').value = '.movements MIX-PLG';
      hote.querySelector('#formCmd').dispatchEvent(new Event('submit', { cancelable: true }));
      await attendre();
      const tables = hote.querySelectorAll('.ent-cres table');
      const derniere = tables.length ? tables[tables.length - 1] : null;
      out.lignesConsole = derniere ? derniere.querySelectorAll('tbody tr').length : 0;
      out.consoleAjust = derniere ? /Ajustement inventaire/.test(derniere.textContent) && /Démarque inconnue/.test(derniere.textContent) : false;
      // Le stock, déverrouillé : six références, sans colonne couleur ni taille ; vingt-deux mouvements.
      await clic('[data-vue="stock"]');
      hote.querySelector('#codeStock').value = 'STOCK24';
      await clic('[data-deverrouiller]');
      out.lignesStock = hote.querySelectorAll('#entListe tbody tr').length;
      out.colonne = [...hote.querySelectorAll('#entListe th')].map((t) => t.textContent.trim()).join('|');
      await clic('[data-onglet="stock"][data-val="mouvements"]');
      out.lignesMouv = hote.querySelectorAll('.panneau tbody tr').length;
      // Les deux réceptions et les huit commandes ; la réception en litige montre 8 mixeurs de colis.
      await clic('[data-vue="receptions"]');
      out.receptions = hote.querySelectorAll('[data-ouvrir-rec]').length;
      await clic('[data-ouvrir-rec="REC-26-0447"]');
      const lignes = [...hote.querySelectorAll('.panneau tbody tr')].map((tr) => [...tr.querySelectorAll('td')].map((t) => t.textContent.trim()));
      // Les lignes de colis : [n°, référence, désignation, contenu, état] ; le contrôle, lui, est ailleurs.
      out.colisMixeurs = lignes.filter((l) => l[1] === 'MIX-PLG' && /^\d+$/.test(l[0])).reduce((n, l) => n + Number(l[3] || 0), 0);
      out.controleMixeurs = (lignes.find((l) => l[0] === 'MIX-PLG' && l.includes('Accepté')) || []).join('/');
      await clic('[data-vue="commandes"]');
      out.commandes = hote.querySelectorAll('[data-ouvrir-cmd]').length;
      // Répondre à la cheffe, comme l'élève.
      await clic('[data-vue="mail"]');
      const mission = [...db.mails].find((m) => m.fromMail === CHEFFE && /Ajustements de la semaine/.test(m.subject));
      await clic(`[data-mail="${mission.id}"]`);
      await clic('[data-repondre]');
      hote.querySelector('#repT').value = JUSTE_;
      hote.querySelector('#formRep').dispatchEvent(new Event('submit', { cancelable: true }));
      await attendre();
      out.score = window.__cdScore23;
      hote.querySelector('[data-quitter]').click();
      hote.remove();
      return out;
    }, { CHEFFE: CD.EQUIPE.cheffe.mail, JUSTE_: JUSTE_23 }).catch(async (e) => {
      await page.evaluate(() => { document.getElementById('essaiCdiscount23')?.remove(); document.body.classList.remove('immersion'); document.body.removeAttribute('style'); });
      throw e;
    });
    if (res.accent.toLowerCase() !== '#3732ff') throw new Error('accent de la charte non appliqué : ' + res.accent);
    if (res.mails !== 5) throw new Error(`${res.mails} messages au lieu de 5`);
    if (res.lignesConsole !== 6 || !res.consoleAjust) throw new Error(`.movements MIX-PLG : ${res.lignesConsole} lignes (6 attendues), ajustement lisible : ${res.consoleAjust}`);
    if (res.lignesStock !== 6) throw new Error(`${res.lignesStock} lignes de stock au lieu de 6`);
    if (/Couleur|Taille/.test(res.colonne)) throw new Error('colonnes Couleur ou Taille affichées : ' + res.colonne);
    if (res.lignesMouv !== 22) throw new Error(`${res.lignesMouv} mouvements à l'écran au lieu de 22`);
    if (res.receptions !== 2 || res.commandes !== 8) throw new Error(`${res.receptions} réceptions, ${res.commandes} commandes`);
    if (res.colisMixeurs !== 8) throw new Error('les colis de mixeurs à l\'écran ne font pas 8 : ' + res.colisMixeurs);
    if (!res.score || res.score.score !== 6 || res.score.max !== 6) throw new Error('score remonté : ' + JSON.stringify(res.score));
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

  await v('Cdiscount : la page d\'essai ouvre aussi ENT-2.2, avec ses cinq jalons à « attente »', async () => {
    const ctx = await nav.newContext();
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) errs.push(m.text()); });
    try {
      await p.goto(new URL('/outils/essai-cdiscount.html', page.url()).toString());
      await p.waitForSelector('.ent-shell', { timeout: 6000 });
      await p.selectOption('select[name="seance"]', 'cdiscount-inventaire');
      await p.waitForSelector('.ent-nav[data-vue="inventaire"]', { timeout: 6000 });
      const jalons = await p.$$eval('#jalons span', (s) => s.map((x) => x.textContent.trim()));
      if (jalons.length !== S22.ETAPES.length) throw new Error(`${jalons.length} jalons affichés au lieu de ${S22.ETAPES.length}`);
      if (jalons.some((j) => !j.startsWith('⏳'))) throw new Error('jalons avant travail : ' + jalons.join(' | '));
      if (errs.length) throw new Error(errs.join(' | '));
    } finally { await ctx.close(); }
  });

  await v('Cdiscount : la page d\'essai ouvre aussi ENT-2.3, avec ses six jalons à « attente »', async () => {
    const ctx = await nav.newContext();
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) errs.push(m.text()); });
    try {
      await p.goto(new URL('/outils/essai-cdiscount.html', page.url()).toString());
      await p.waitForSelector('.ent-shell', { timeout: 6000 });
      await p.selectOption('select[name="seance"]', 'cdiscount-regularise');
      // ENT-2.3 n'a pas d'entrée de menu propre (pas d'écran Inventaire) : on attend que les six jalons de la séance remplacent ceux d'ENT-2.1.
      await p.waitForFunction((n) => document.querySelectorAll('#jalons span').length === n, S23.ETAPES.length, { timeout: 6000 });
      const jalons = await p.$$eval('#jalons span', (s) => s.map((x) => x.textContent.trim()));
      if (jalons.length !== S23.ETAPES.length) throw new Error(`${jalons.length} jalons affichés au lieu de ${S23.ETAPES.length}`);
      if (jalons.some((j) => !j.startsWith('⏳'))) throw new Error('jalons avant travail : ' + jalons.join(' | '));
      if (errs.length) throw new Error(errs.join(' | '));
    } finally { await ctx.close(); }
  });
}
