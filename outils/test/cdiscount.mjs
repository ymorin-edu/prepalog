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

export default async function bloc({ v, page, nav, ROOT, baseXlsx }) {
  const imp = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

  // Attentes sur l'ÉCRAN plutôt que sur une durée (chantier 13, 09/10/2026). Le plafond de 4 s n'échoue pas ici :
  // l'assertion qui suit lit l'écran et donne le vrai message, pas un « timeout » muet.
  const navOn = (p, hote, vue) => p.waitForSelector(`${hote} .ent-nav.on[data-vue="${vue}"]`, { timeout: 4000 }).catch(() => {});
  const etapeInv = (p, Z, n) => p.waitForFunction(([s, k]) => { const li = document.querySelector(s + ' .inv-etapes li.cours'); return !!li && li.textContent.trim().startsWith(k + '.'); },
    [Z, String(n)], { timeout: 4000 }).catch(() => {});
  const texteVu = (p, sel, re) => p.waitForFunction(([s, r]) => new RegExp(r).test((document.querySelector(s) || {}).textContent || ''),
    [sel, re.source], { timeout: 4000 }).catch(() => {});
  const CD = await imp('contenus/cdiscount.js');
  const S21 = await imp('contenus/cdiscount-mouvements.js');
  const S22 = await imp('contenus/cdiscount-inventaire.js');
  const INVM = await imp('core/types/inventaire.js');
  const DECL = await imp('core/declencheurs.js');

  // Ce que fait le moteur à l'ouverture d'une séance (`creerEntreprise`, semerVolet), refait ici
  // pour juger les données sans navigateur : base de départ, puis volet de la séance.
  // `aisance` : le niveau que le moteur fige dans la base avant de semer le volet (C1, 03/10/2026).
  const db2vol = (db) => [new Set(db.moves.map((m) => m.sku)).size, new Set(db.moves.map((m) => m.ref)).size, db.moves.length].join('|');
  const ouvrir = (S, prenom = 'Léa', aisance) => {
    const db = S.baseDeDepart(prenom);
    if (aisance) db.aisance = aisance;
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
  await v('ENT-2.1 : volume déclaré = volume réel (5 références, 12 documents, 20 mouvements)', async () => {
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
    // Le « Stock trouvé » des bons : le stock RÉEL juste avant la sortie (recadrage du 03/10/2026).
    // Hors écouteurs, réel = système ; pour les écouteurs, valeurs écrites à la main : il décroche du
    // système d'une unité à partir de CMD-731530 (la casse saisie −1 au lieu de −2).
    for (const o of db.orders.filter((x) => !x.annulee)) for (const l of o.lines.filter((x) => x.sku !== S21.CIBLE)) {
      const m = db.moves.find((x) => x.ref === 'BP-' + o.no.replace('CMD-', '') && x.sku === l.sku);
      if (o.prep.rows[l.sku].seen !== m.after + l.qty) throw new Error(`${o.no} : « Stock trouvé » incohérent sur ${l.sku}`);
    }
    const trouve = (no) => db.orders.find((o) => o.no === no).prep.rows[S21.CIBLE].seen;
    const systeme = (no) => { const m = db.moves.find((x) => x.ref === 'BP-' + no.replace('CMD-', '') && x.sku === S21.CIBLE); return m.after - m.delta; };
    const attendu = { 'CMD-731402': [4, 4], 'CMD-731488': [12, 12], 'CMD-731530': [10, 11], 'CMD-731561': [7, 8], 'CMD-731578': [4, 5], 'CMD-731590': [2, 3] };
    for (const [no, [t, s]] of Object.entries(attendu)) {
      if (trouve(no) !== t || systeme(no) !== s) throw new Error(`${no} : trouvé ${trouve(no)} / système ${systeme(no)}, attendu ${t} / ${s}`);
    }
    // La commande de la cliente : annulée, aucun mouvement, bon figé « Rupture » à 0.
    const a = db.orders.find((o) => o.no === 'CMD-731602');
    if (!a || !a.annulee || a.annulee.motif !== 'Rupture : emplacement A-02-1 vide à la préparation') throw new Error('CMD-731602 : ' + JSON.stringify(a && a.annulee));
    if (a.lines.length !== 1 || a.lines[0].sku !== S21.CIBLE || a.lines[0].qty !== 1) throw new Error('CMD-731602 : lignes ' + JSON.stringify(a.lines));
    if (db.moves.some((m) => m.ref === 'BP-731602')) throw new Error('la commande annulée a fait bouger le stock');
    const r = a.prep.rows[S21.CIBLE];
    if (r.seen !== 0 || r.status !== 'crit' || r.qty !== 0) throw new Error('bon de CMD-731602 : ' + JSON.stringify(r));
    if (a.annulee.at > Date.now() || a.date > a.annulee.at) throw new Error('CMD-731602 mal datée');
  });

  await v('ENT-2.1 : confirmé = trois documents de plus sur les écouteurs, mêmes stocks, même casse (valeurs à la main)', async () => {
    const st = ouvrir(S21), cf = ouvrir(S21, 'Léa', 'confirme');
    const eco = (db) => db.moves.filter((m) => m.sku === S21.CIBLE);
    if (db2vol(st) !== '5|12|20') throw new Error('standard : ' + db2vol(st));
    if (db2vol(cf) !== '5|15|23') throw new Error('confirmé : ' + db2vol(cf));
    for (const db of [st, cf]) {
      if (db.stock[S21.CIBLE] !== 1) throw new Error('stock actuel ≠ 1');
      if (db.stock[S21.CIBLE] - eco(db).reduce((n, m) => n + m.delta, 0) !== 4) throw new Error('stock d\'inventaire ≠ 4');
      if (eco(db).some((m) => m.after < 0)) throw new Error('stock d\'écouteurs sous zéro');
      if (db.orders.find((o) => o.no === 'CMD-731602').prep.rows[S21.CIBLE].seen !== 0) throw new Error('stock trouvé de la cliente ≠ 0');
    }
    const refs = (db) => [...new Set(eco(db).map((m) => m.ref))].sort().join(' ');
    const plus = refs(cf).split(' ').filter((r) => !refs(st).split(' ').includes(r));
    if (plus.join(' ') !== 'BP-731420 BP-731515 REC-26-0409') throw new Error('documents en plus : ' + plus.join(' '));
    const tr = (no) => cf.orders.find((o) => o.no === no).prep.rows[S21.CIBLE].seen;
    if (tr('CMD-731420') !== 10 || tr('CMD-731402') !== 7 || tr('CMD-731515') !== 14 || tr('CMD-731530') !== 10) throw new Error('stock trouvé confirmé');
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
    // Une commande d'écouteurs qui n'a fait bouger aucun stock (l'annulée), et une casse dont le
    // constat ne dit pas ce qui a été saisi.
    if (!db.orders.some((o) => o.annulee && o.lines.some((l) => l.sku === S21.CIBLE) && !bpEco.has('BP-' + o.no.replace('CMD-', '')))) throw new Error('pas de commande annulée sur la cible');
    const saisie = -eco.filter((m) => m.ref === S21.CASSE.no).reduce((n, m) => n + m.delta, 0);
    if (saisie !== 1 || S21.CASSE.constatee !== 2) throw new Error(`casse : saisie ${saisie}, constat ${S21.CASSE.constatee}`);
  });

  // ---------- ENT-2.1 — les jalons
  const JUSTE = `Stock actuel : 1
Réception : REC-26-0415, 10 écouteurs
Commandes : CMD-731402, CMD-731488, CMD-731530, CMD-731561, CMD-731578, CMD-731590
Retour : RET-26-0091
Casse : DEM-26-0027
Stock au dernier inventaire : 1 - 11 + 14 = 4
Ce qui cloche : DEM-26-0027, constat 2, saisi 1, écart 1`;
  const JUSTE_CONFIRME = `Stock actuel : 1
Réception : REC-26-0409 : 6 ; REC-26-0415 : 10
Commandes : CMD-731420, CMD-731402, CMD-731488, CMD-731515, CMD-731530, CMD-731561, CMD-731578, CMD-731590
Retour : RET-26-0091
Casse : DEM-26-0027
Stock au dernier inventaire : 1 - 17 + 20 = 4
Ce qui cloche : DEM-26-0027 : 2 - 1 = 1`;

  await v('ENT-2.1 : sans réponse, aucun jalon n\'est acquis (l\'inaction ne rapporte rien)', async () => {
    const db = ouvrir(S21);
    const st = statuts(S21, db);
    if (st.some((s) => s !== 'attente')) throw new Error('statuts avant réponse : ' + st.join(', '));
    // Sans la semaine semée (base nue), les jalons n'ont rien à juger.
    const nue = S21.baseDeDepart('Léa'); nue.moves = []; nue.mails = []; nue.orders = [];
    if (statuts(S21, nue).some((s) => s !== 'na')) throw new Error('un jalon juge une base sans mouvements');
  });

  await v('ENT-2.1 : la réponse juste valide les six jalons, pour chaque niveau', async () => {
    if (S21.ETAPES.length !== 6) throw new Error(`${S21.ETAPES.length} jalons au lieu de 6`);
    const db = ouvrir(S21);
    repondre(db, JUSTE);
    const st = statuts(S21, db);
    if (st.some((s) => s !== 'ok')) throw new Error('standard : ' + st.join(', '));
    const cf = ouvrir(S21, 'Léa', 'confirme');
    repondre(cf, JUSTE_CONFIRME);
    const sc = statuts(S21, cf);
    if (sc.some((s) => s !== 'ok')) throw new Error('confirmé : ' + sc.join(', '));
    // La quantité d'une réception peut aussi s'écrire en total (16).
    const cf2 = ouvrir(S21, 'Léa', 'confirme');
    repondre(cf2, JUSTE_CONFIRME.replace('REC-26-0409 : 6 ; REC-26-0415 : 10', 'REC-26-0409 et REC-26-0415, 16 en tout'));
    if (statuts(S21, cf2)[1] !== 'ok') throw new Error('confirmé : total des réceptions refusé');
    // Le confirmé ne passe pas avec la réponse du standard : il a plus de documents à trouver.
    const cf3 = ouvrir(S21, 'Léa', 'confirme');
    repondre(cf3, JUSTE);
    const s3 = statuts(S21, cf3);
    if (s3[1] !== 'ko' || s3[2] !== 'ko') throw new Error('confirmé, réponse standard : ' + s3.join(', '));
  });

  await v('ENT-2.1 : confirmé, une seule réception citée fait tomber le jalon des réceptions, et lui seul', async () => {
    const db = ouvrir(S21, 'Léa', 'confirme');
    repondre(db, JUSTE_CONFIRME.replace('REC-26-0409 : 6 ; REC-26-0415 : 10', 'REC-26-0415 : 10'));
    const st = statuts(S21, db);
    const ids = S21.ETAPES.map((e) => e.id);
    const tombes = ids.filter((x, i) => st[i] !== 'ok');
    if (tombes.join() !== 'reception') throw new Error('tombent : ' + tombes.join(', '));
    // Une seule réception, mais avec le bon total (16) : la réception oubliée suffit à faire tomber.
    const db2 = ouvrir(S21, 'Léa', 'confirme');
    repondre(db2, JUSTE_CONFIRME.replace('REC-26-0409 : 6 ; REC-26-0415 : 10', 'REC-26-0415, 16 écouteurs'));
    if (statuts(S21, db2)[1] !== 'ko') throw new Error('une réception sur deux, total juste : acceptée');
  });

  await v('ENT-2.1 : chaque erreur typique fait tomber SON jalon, et lui seul', async () => {
    const cas = [
      ['actuel', 'Stock actuel : 1', 'Stock actuel : 4'],                         // le stock d'inventaire lu comme actuel
      ['reception', 'Réception : REC-26-0415, 10 écouteurs', 'Réception : REC-26-0412, 10'], // la mauvaise réception
      ['reception', 'Réception : REC-26-0415, 10 écouteurs', 'Réception : REC-26-0415'],    // sans la quantité
      ['commandes', 'CMD-731590', 'CMD-731590, CMD-731455'],                       // une commande sans écouteurs
      ['commandes', 'CMD-731590', 'CMD-731590, CMD-731602'],                       // la commande annulée (piège 1)
      ['commandes', ', CMD-731561', ''],                                          // une commande oubliée
      ['retour-casse', 'Retour : RET-26-0091\nCasse : DEM-26-0027', 'Retour : DEM-26-0027\nCasse : RET-26-0091'], // inversés
      ['inventaire', '= 4', '= 6'],                                               // le retour compté comme une sortie
      ['erreur', 'Ce qui cloche : DEM-26-0027, constat 2, saisi 1, écart 1', 'Ce qui cloche : RET-26-0091, écart 1'], // la fausse piste (piège 2)
      ['erreur', 'Ce qui cloche : DEM-26-0027, constat 2, saisi 1, écart 1', 'Ce qui cloche : DEM-26-0027 et RET-26-0091, écart 1'], // accuse aussi le retour
      ['erreur', 'Ce qui cloche : DEM-26-0027, constat 2, saisi 1, écart 1', 'Ce qui cloche : DEM-26-0027'],          // sans comparer (pas d'écart)
      ['erreur', 'Ce qui cloche : DEM-26-0027, constat 2, saisi 1, écart 1', 'Ce qui cloche : DEM-26-0027, écart 2'], // écart faux
      ['erreur', 'Ce qui cloche : DEM-26-0027, constat 2, saisi 1, écart 1', 'Ce qui cloche : CMD-731602 annulée, écart 1'], // la conséquence, pas la cause
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
    // Le détail lu par l'enseignant dit pourquoi la commande annulée est fautive.
    const db = ouvrir(S21);
    repondre(db, JUSTE.replace('CMD-731590', 'CMD-731590, CMD-731602'));
    const d = S21.ETAPES.find((e) => e.id === 'commandes').verifier(db).detail;
    if (!/CMD-731602, commande annulée : elle n'a fait bouger aucun stock/.test(d)) throw new Error('détail : ' + d);
    // Une commande citée dans « Ce qui cloche » ne se paie qu'au jalon 6, pas au jalon 3.
    const db2 = ouvrir(S21);
    repondre(db2, JUSTE + ' (la commande CMD-731602 a été annulée à cause de ça)');
    const st2 = statuts(S21, db2);
    if (st2[2] !== 'ok' || st2[5] !== 'ko') throw new Error('commande citée dans « Ce qui cloche » : ' + st2.join(', '));
  });

  await v('ENT-2.1 : le meilleur essai est retenu, et une correction en bas de message est lue', async () => {
    const db = ouvrir(S21);
    repondre(db, JUSTE.replace('Stock actuel : 1', 'Stock actuel : 4'));
    if (statuts(S21, db)[0] !== 'ko') throw new Error('premier essai faux non détecté');
    repondre(db, JUSTE);
    if (statuts(S21, db)[0] !== 'ok') throw new Error('le second essai juste n\'est pas retenu');
    const db2 = ouvrir(S21);
    repondre(db2, JUSTE.replace('Stock actuel : 1', 'Stock actuel : 4') + '\nStock actuel : 1 (je me suis trompé plus haut)');
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
    // ENT-2.1 et ENT-2.4 lisent les mêmes `ligne()` et `nombres()` : déplacées, pas copiées.
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
    // Le constat dit 2, et « saisi sur le terminal » (le mouvement, lui, dit −1).
    if (!/Quantité : 2\n/.test(g[1].text) || !/Saisi sur le terminal/.test(g[1].text)) throw new Error('constat : ' + g[1].text);
    // Les jalons ne bougent pas : « actuel » ko sur 5, les autres ko faute de lignes remplies.
    const st = statuts(S21, db);
    if (st.some((x) => x !== 'ko')) throw new Error('statuts après « Stock actuel : 5 » : ' + st.join(', '));
    const db2 = ouvrir(S21);
    repondre(db2, 'Stock actuel : 1');
    if (statuts(S21, db2)[0] !== 'ok') throw new Error('« Stock actuel : 1 » ne valide pas le jalon actuel');
    // Un élève qui avait les deux mails (séance ouverte avant le 03/10/2026) ne les reçoit pas en double.
    db2.mails.push(...g);
    if (d.semer('Léa', db2).mails.length) throw new Error('doublon pour une base qui a déjà les deux mails');
  });

  await v('ENT-2.1 : le mot de clôture de Nadia arrive sur « Ce qui cloche » rempli, juste ou faux, et ne dit rien du résultat', async () => {
    const d = (S21.VOLET.declencheurs || []).find((x) => x.id === 'cloture');
    if (!d) throw new Error('déclencheur « cloture » absent');
    const db = ouvrir(S21);
    if (d.quand(db)) throw new Error('vrai dès l\'ouverture');
    repondre(db, S21.LIGNES_REPONSE.map((l) => l + ' ').join('\n'));
    if (d.quand(db)) throw new Error('l\'amorce vide déclenche');
    repondre(db, 'Stock actuel : 1');
    if (d.quand(db)) throw new Error('le premier compte rendu déclenche la clôture');
    const faux = ouvrir(S21);
    repondre(faux, 'Ce qui cloche : RET-26-0091');
    if (!d.quand(faux)) throw new Error('une réponse fausse, sans nombre, ne déclenche pas');
    const juste = ouvrir(S21);
    repondre(juste, JUSTE);
    if (!d.quand(juste)) throw new Error('la réponse juste ne déclenche pas');
    const gF = d.semer('Léa', faux).mails, gJ = d.semer('Léa', juste).mails;
    if (gF.length !== 1 || gF[0].text !== gJ[0].text) throw new Error('le mot de clôture dépend de la réponse');
    if (!/la prochaine fois, on regarde toute l'allée/.test(gJ[0].text)) throw new Error('texte : ' + gJ[0].text);
    if (/bravo|exact|juste|bonne réponse|erreur est|c'est bien/i.test(gJ[0].text.replace(/Une erreur sur un article/, ''))) throw new Error('le mot de clôture juge la réponse : ' + gJ[0].text);
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
      out.statut602 = hote.querySelector('[data-ouvrir-cmd="CMD-731602"]')?.closest('tr').querySelector('.pastille')?.textContent.trim();
      // Répondre à la cheffe, comme l'élève.
      await clic('[data-vue="mail"]');
      const mission = [...db.mails].find((m) => m.fromMail === CHEFFE && /racontez/.test(m.subject));
      await clic(`[data-mail="${mission.id}"]`);
      out.mission = hote.textContent;
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
    if (res.lignesConsole !== 9) throw new Error(`.movements ECO-BT-01 : ${res.lignesConsole} lignes au lieu de 9`);
    if (res.lignesStock !== 5) throw new Error(`${res.lignesStock} lignes de stock au lieu de 5`);
    if (/Couleur|Taille/.test(res.colonne)) throw new Error('colonnes Couleur ou Taille affichées pour des articles simples : ' + res.colonne);
    if (res.lignesMouv !== 20) throw new Error(`${res.lignesMouv} mouvements à l'écran au lieu de 20`);
    if (res.receptions !== 2 || res.commandes !== 9) throw new Error(`${res.receptions} réceptions, ${res.commandes} commandes`);
    if (res.statut602 !== 'Annulée') throw new Error('CMD-731602 affichée : ' + res.statut602);
    if (!/Mme Moreau/.test(res.mission) || !/Black Friday/.test(res.mission) || !/ce n'est pas sérieux/i.test(res.mission)) throw new Error('mission sans la cliente : ' + res.mission.slice(0, 300));
    if (!res.score || res.score.score !== 6 || res.score.max !== 6) throw new Error('score remonté : ' + JSON.stringify(res.score));
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
  await v('ENT-2.1 : « Répondre » à Nadia s\'ouvre avec les sept intitulés, les autres mails restent vides, et l\'amorce seule ne valide rien', async () => {
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
  // rendu à Nadia, même faux, fait arriver le retour et la casse, une seule fois. RÉÉCRIT le 08/10/2026
  // (MOTEUR-questions-au-fil, lot 1) : la bulle ne dit plus que l'envoi, l'arrivée va dans deux cartes.
  await v('ENT-2.1 : cliquer partout ne fait rien arriver ; « Stock actuel : 5 » fait arriver le retour et la casse, une fois, sans doublon au remontage ni pour une base ancienne', async () => {
    const res = await page.evaluate(async ({ CHEFFE }) => {
      const mod = await import('/activites/cdiscount-mouvements.js');
      const attendre = () => new Promise((r) => setTimeout(r, 60));
      const bulle = () => document.getElementById('toast')?.textContent || '';
      const cartes = (hote) => [...hote.querySelectorAll('[data-carte-mail]')].map((c) => (c.classList.contains('ent-carte-reduite') ? 'réduite' : 'pleine'));
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
      out.cartes = cartes(e.hote);
      out.pastille = e.hote.querySelector('.ent-nav[data-vue="mail"] .ent-n')?.textContent || '';
      out.apresEnvoi = compte(db);
      out.marques = Object.keys(db.volets || {});
      await e.envoyer('Stock actuel : 1');
      out.bulle2 = bulle();
      out.apresSecond = compte(db);
      e.demonter();
      // Remontage (reconnexion) : rien de plus.
      e = monter(db);
      out.apresRemontage = compte(db);
      out.cartesRemontage = cartes(e.hote);
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
      out.cartesAncienne = cartes(e.hote);
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
    if (res.bulle !== 'Réponse envoyée.') throw new Error('bulle à l\'envoi : ' + JSON.stringify(res.bulle));
    if (dit(res.cartes) !== dit(['pleine', 'pleine'])) throw new Error('cartes à l\'envoi : ' + dit(res.cartes));
    // Remontage : les deux messages non lus reviennent, en cartes réduites.
    if (dit(res.cartesRemontage) !== dit(['réduite', 'réduite'])) throw new Error('cartes au remontage : ' + dit(res.cartesRemontage));
    if (res.pastille !== '2') throw new Error('pastille de la messagerie : ' + JSON.stringify(res.pastille));
    if (!res.marques.includes('mouvements-1#documents')) throw new Error('marque absente : ' + res.marques.join(', '));
    if (dit(res.apresSecond) !== dit(res.apresEnvoi)) throw new Error('le second envoi a reposé des mails : ' + dit(res.apresSecond));
    if (res.bulle2 !== 'Réponse envoyée.') throw new Error('bulle au second envoi : ' + JSON.stringify(res.bulle2));
    if (dit(res.apresRemontage) !== dit(res.apresEnvoi)) throw new Error('doublon au remontage : ' + dit(res.apresRemontage));
    if (res.ancienne.retour !== 1 || res.ancienne.casse !== 1 || res.ancienne.recus !== 4) throw new Error('base ancienne : ' + dit(res.ancienne));
    if (res.bulleAncienne !== 'Réponse envoyée.') throw new Error('base ancienne, bulle : ' + JSON.stringify(res.bulleAncienne));
    if (res.cartesAncienne.length) throw new Error('base ancienne, cartes pour des messages déjà lus : ' + dit(res.cartesAncienne));
  });

  // La carte qui reste (MOTEUR-questions-au-fil, lot 1, 08/10/2026), sur une page à horloge simulée : toujours là
  // après 10 s (réduite à une ligne), jamais le focus ; ouverte par la carte, elle part et l'autre reste ; fermée (×),
  // elle part sans que le message soit lu, et revient au remontage ; un message lu ne revient pas.
  await v('ENT-2.1 : les deux messages arrivent en cartes qui restent, se réduisent, partent à la lecture ou au ×', async () => {
    const ctxC = await nav.newContext();
    const pc = await ctxC.newPage();
    try {
      await pc.goto(new URL('/', page.url()).toString());
      await pc.waitForSelector('#btnProf', { timeout: 8000 });
      await pc.clock.install();
      await pc.evaluate(async ({ CHEFFE }) => {
        const mod = await import('/activites/cdiscount-mouvements.js');
        const db = {};
        const monter = () => {
          document.getElementById('essaiCartes')?.remove();
          const hote = document.createElement('div');
          hote.id = 'essaiCartes';
          document.body.appendChild(hote);
          mod.rendre(hote, { meta: mod.meta, profil: { prenom: 'Léa', role: 'eleve' }, codeStock: 'STOCK24',
            jeu: { etat: () => db, sauver() {} }, enregistrer() {}, quitter() {} });
          return hote;
        };
        const hote = monter();
        hote.querySelector('[data-vue="mail"]').click();
        const mission = db.mails.find((m) => m.fromMail === CHEFFE && /racontez/.test(m.subject));
        hote.querySelector(`[data-mail="${mission.id}"]`).click();
        hote.querySelector('[data-repondre]').click();
        hote.querySelector('#repT').value = 'Stock actuel : 5';
        hote.querySelector('#formRep').dispatchEvent(new Event('submit', { cancelable: true }));
        // Un autre écran : la carte est sur tous les écrans.
        hote.querySelector('.ent-nav[data-vue="stock"]').click();
        window.__c = { db, monter };
      }, { CHEFFE: CD.EQUIPE.cheffe.mail });
      const lire = () => pc.evaluate(() => ({
        cartes: [...document.querySelectorAll('#essaiCartes [data-carte-mail]')].map((c) => ({
          id: Number(c.dataset.carteMail), reduite: c.classList.contains('ent-carte-reduite'),
          texte: c.textContent.replace(/\s+/g, ' ').trim() })),
        focusDansPile: !!document.activeElement?.closest('[data-cartes]'),
        role: document.querySelector('#essaiCartes [data-cartes]')?.getAttribute('role'),
        vue: document.querySelector('#essaiCartes .ent-nav.on')?.dataset.vue,
        sujet: document.querySelector('#essaiCartes .ent-main')?.textContent || '',
        lus: window.__c.db.mails.filter((m) => m.declenche).map((m) => [m.id, m.read, m.subject]),
      }));
      const dit = (x) => JSON.stringify(x);
      let r = await lire();
      if (r.cartes.length !== 2 || r.cartes.some((c) => c.reduite)) throw new Error('à l\'arrivée : ' + dit(r));
      if (!r.cartes.every((c) => /^✉ Nouveau message — /.test(c.texte) && /Lire le message/.test(c.texte))) throw new Error('texte des cartes : ' + dit(r.cartes));
      if (!r.cartes.some((c) => /Retour client RET-/.test(c.texte)) || !r.cartes.some((c) => /Constat de casse DEM-/.test(c.texte))) throw new Error('objets : ' + dit(r.cartes));
      if (r.role !== 'status') throw new Error('pile sans role="status" : ' + r.role);
      if (r.focusDansPile) throw new Error('une carte a pris le focus');
      // 10 s plus tard (la bulle serait partie depuis longtemps) : toujours là, réduites à une ligne.
      await pc.clock.runFor(10000);
      r = await lire();
      if (r.cartes.length !== 2 || r.cartes.some((c) => !c.reduite)) throw new Error('après 10 s : ' + dit(r.cartes));
      if (r.cartes.some((c) => /Nouveau message|Lire le message/.test(c.texte))) throw new Error('carte réduite trop longue : ' + dit(r.cartes));
      if (r.focusDansPile) throw new Error('une carte a pris le focus en se réduisant');
      // Ouvrir la première par sa carte : le message s'ouvre, il est lu, sa carte part, l'autre reste.
      const [a, b] = r.cartes;
      const sujetA = r.lus.find(([id]) => id === a.id)[2];
      await pc.click(`#essaiCartes [data-carte-lire="${a.id}"]`);
      r = await lire();
      if (r.vue !== 'mail') throw new Error('la carte n\'ouvre pas la messagerie : ' + r.vue);
      if (!r.sujet.includes(sujetA)) throw new Error('le message ouvert n\'est pas « ' + sujetA + ' »');
      if (dit(r.cartes.map((c) => c.id)) !== dit([b.id])) throw new Error('après lecture : ' + dit(r.cartes));
      if (!r.lus.find(([id]) => id === a.id)[1]) throw new Error('le message ouvert par la carte n\'est pas lu');
      // Fermer l'autre (×) : elle part, le message reste non lu.
      await pc.click(`#essaiCartes [data-carte-fermer="${b.id}"]`);
      r = await lire();
      if (r.cartes.length) throw new Error('la carte fermée reste : ' + dit(r.cartes));
      if (r.lus.find(([id]) => id === b.id)[1]) throw new Error('fermer la carte a marqué le message lu');
      // Remontage : le non-lu revient, réduit ; le lu ne revient pas.
      await pc.evaluate(() => window.__c.monter());
      r = await lire();
      if (dit(r.cartes.map((c) => [c.id, c.reduite])) !== dit([[b.id, true]])) throw new Error('au remontage : ' + dit(r.cartes));
    } finally {
      await ctxC.close();
    }
  });

  /* ================================================================================
   * ENT-2.3 « Inventaire tournant » (entraînement) — ajouté le 02/10/2026, chantier D ;
   * RÉÉCRIT le 04/10/2026 (brief `ENT-2.3-inventaire-recadre.md`, C4) : l'élève redonne sa liste à
   * Nadia, l'écran ne montre que son périmètre, une référence à écart oubliée revient par un aléa,
   * « Absent » donne la liste d'un collègue, le confirmé recompte aussi A-05 / A-06.
   *
   * Les valeurs attendues sont écrites À LA MAIN ici (stock, écarts, taux, « stock trouvé ») : un
   * test qui les recalculerait avec le code de la séance ne verrait pas une erreur de données.
   * ============================================================================== */

  const SYSTEME_23 = { 'CAB-USBC-1M': 64, 'CHG-20W': 44, 'ECO-BT-01': 22, 'SOU-SF-02': 29, 'BAT-10K': 10, 'CLE-64G': 37,
    'AMP-LED-E27': 37, 'COQ-UNI-01': 27, 'CAS-FIL-01': 12, 'SUP-VOIT': 22, 'CLA-SF-01': 9, 'HUB-USB-4': 16 };
  const COMPTE_23 = { ...SYSTEME_23, 'CAB-USBC-1M': 67, 'CHG-20W': 41, 'BAT-10K': 8, 'COQ-UNI-01': 25 };
  const ECARTS_23 = Object.fromEntries(Object.keys(SYSTEME_23).map((r) => [r, COMPTE_23[r] - SYSTEME_23[r]]));
  const ORDRE_23 = Object.keys(SYSTEME_23);
  const LISTE_4 = ['CAB-USBC-1M', 'CHG-20W', 'BAT-10K', 'COQ-UNI-01'];
  const A05_A06 = ['CAS-FIL-01', 'SUP-VOIT', 'CLA-SF-01', 'HUB-USB-4'];
  const ID_23 = S22.ID_INVENTAIRE;

  // Ce que fait le moteur à chaque sauvegarde : les déclencheurs du volet, une seule fois chacun.
  const declencher = (S, db, prenom = 'Léa') => {
    if (!db.volets) db.volets = {};
    for (const d of S.VOLET.declencheurs || []) {
      const cle = `${S.VOLET.id}#${d.id}`;
      if (db.volets[cle] || !d.quand(db)) continue;
      ((d.semer(prenom, db) || {}).mails || []).forEach((m) => db.mails.push({ ...m, declenche: d.id }));
      db.volets[cle] = Date.now();
    }
    return db;
  };
  // Ouvrir la séance, répondre à Nadia, laisser arriver ce qui doit arriver.
  const avecListe = (texte, aisance) => declencher(S22, (() => { const db = ouvrir(S22, 'Léa', aisance); if (texte != null) repondre(db, texte); return db; })());
  const perim = (db) => S22.INVENTAIRE.perimetre(db);

  // L'état de l'écran Inventaire d'un élève, posé à la main (alerte n° 20 : on appelle
  // `verifier(db)` directement), SUR SON PÉRIMÈTRE. `decisions` : { ref: [action, motif] }.
  const etat23 = (db, { saisie = COMPTE_23, ecarts = ECARTS_23, decisions = {}, recomptes = {}, taux = '6,9', valide = true } = {}) => {
    const refs = perim(db) || [];
    const e = INVM.etatNeuf(S22.INVENTAIRE, (r) => db.stock[r], S22.INVENTAIRE.lignes.filter((l) => refs.includes(l.ref)));
    refs.forEach((r) => { e.saisie[r] = String(saisie[r]); e.ecarts[r] = String(ecarts[r]); });
    Object.entries(decisions).forEach(([r, [action, motif]]) => { e.decisions[r] = { action, motif: motif || '' }; });
    Object.entries(recomptes).forEach(([r, q]) => { e.recomptes[r] = q; });
    e.taux = taux; e.valide = valide ? Date.now() : null; e.etape = valide ? 4 : 1;
    db.inventaires = { [ID_23]: e };
    return db;
  };
  const BONNES_23 = { 'CAB-USBC-1M': ['recompter'], 'CHG-20W': ['rayon'], 'BAT-10K': ['rayon'], 'COQ-UNI-01': ['regul', 'Démarque inconnue'] };
  const LISTE_JUSTE = 'À recompter : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01';
  const justeInv = (surcharge = {}, texte = LISTE_JUSTE, aisance) => etat23(avecListe(texte, aisance), { recomptes: { 'CAB-USBC-1M': 64 }, decisions: BONNES_23, ...surcharge });
  const idsInv = S22.ETAPES.map((x) => x.id);
  const tombesInv = (db) => { const st = statuts(S22, db); return idsInv.filter((x, i) => st[i] !== 'ok'); };
  const sujetsIn = (db) => db.mails.filter((m) => m.folder === 'in').map((m) => m.subject);

  // ---------- ENT-2.3 — les données
  await v('ENT-2.3 : volume déclaré = volume réel (12 références, 21 documents, 36 mouvements), plus fort qu\'ENT-2.1', async () => {
    const db = ouvrir(S22);
    const refs = new Set(db.moves.map((m) => m.sku));
    const docs = new Set(db.moves.map((m) => m.ref));
    const vol = { references: refs.size, documents: docs.size, mouvements: db.moves.length };
    if (JSON.stringify(vol) !== JSON.stringify({ references: 12, documents: 21, mouvements: 36 })) throw new Error('volume réel : ' + JSON.stringify(vol));
    for (const k of Object.keys(S22.VOLUME)) if (S22.VOLUME[k] !== vol[k]) throw new Error(`${k} : déclaré ${S22.VOLUME[k]}, réel ${vol[k]}`);
    if (S22.CATALOGUE.VARIANTS.length !== 12) throw new Error('la séance doit montrer toute l\'allée A (12 références)');
    if (!(refs.size > S21.VOLUME.references && db.moves.length > S21.VOLUME.mouvements)) throw new Error('le volume ne dépasse pas celui d\'ENT-2.1');
    const meta = await page.evaluate(async () => (await import('/activites/cdiscount-inventaire.js')).meta);
    if (JSON.stringify(meta.volume) !== JSON.stringify(S22.VOLUME)) throw new Error('le meta ne déclare pas le volume de la séance');
  });

  await v('ENT-2.3 : chaque mouvement a son document, le stock « après » se suit sans trou et retombe sur le stock du système', async () => {
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
    if (JSON.stringify(s) !== JSON.stringify(SYSTEME_23)) throw new Error('stock du système : ' + JSON.stringify(s));
    for (const k of Object.keys(s)) if (s[k] !== db.stock[k]) throw new Error(`stock final faux : ${k}`);
    for (const v2 of S22.CATALOGUE.VARIANTS) { if (s[v2.sku] < 0 || s[v2.sku] > v2.model.max) throw new Error(`${v2.sku} hors des bornes du catalogue`); }
    for (const r of db.receptions) {
      const parColis = {}; r.colis.forEach((c) => { parColis[c.sku] = (parColis[c.sku] || 0) + c.qty; });
      r.bl.lines.forEach((l) => { if (parColis[l.sku] !== l.qty) throw new Error(`${r.no} : colis et bon de livraison divergent`); });
    }
  });

  // Le « Stock trouvé » des bons de préparation = le stock RÉEL au rayon (décision 3 de la série).
  // Valeurs écrites à la main, bon par bon, sur les quatre références à écart ; partout ailleurs, il
  // retombe sur le stock du système juste avant la sortie.
  await v('ENT-2.3 : « Stock trouvé » des bons = stock réel — CHG et CAB décrochés de 3 après REC-26-0431, BAT de 2 après REI-26-0012, COQ de 2 (démarque)', async () => {
    const db = ouvrir(S22);
    const vu = (cmd, sku) => db.orders.find((o) => o.no === cmd).prep.rows[sku].seen;
    const attendu = [
      ['CMD-732101', 'CAB-USBC-1M', 73], ['CMD-732181', 'CAB-USBC-1M', 72], ['CMD-732226', 'CAB-USBC-1M', 70],
      ['CMD-732118', 'CHG-20W', 45], ['CMD-732167', 'CHG-20W', 44], ['CMD-732210', 'CHG-20W', 42],
      ['CMD-732153', 'BAT-10K', 12], ['CMD-732195', 'BAT-10K', 10], ['CMD-732239', 'BAT-10K', 9],
      ['CMD-732126', 'COQ-UNI-01', 28], ['CMD-732181', 'COQ-UNI-01', 27],
    ];
    for (const [cmd, sku, n] of attendu) if (vu(cmd, sku) !== n) throw new Error(`${cmd} ${sku} : stock trouvé ${vu(cmd, sku)} au lieu de ${n}`);
    // Ailleurs, aucun constat : le stock trouvé est celui du système avant la sortie.
    let constats = 0;
    for (const o of db.orders) for (const l of o.lines) {
      const m = db.moves.find((x) => x.ref === 'BP-' + o.no.replace('CMD-', '') && x.sku === l.sku);
      if (o.prep.rows[l.sku].seen !== m.after + l.qty) { constats++; if (!LISTE_4.includes(l.sku)) throw new Error(`${o.no} : constat inattendu sur ${l.sku}`); }
    }
    if (constats !== 10) throw new Error(`${constats} constats au lieu de 10`);
    // La même source pour ENT-2.2 : `periode()` donne les mêmes lignes.
    const P = S22.periode();
    if (P.preparations.filter((p) => p.trouve !== p.logiciel).length !== 10) throw new Error('periode() ne donne pas les mêmes constats');
    if (JSON.stringify(S22.REFS_A_ECART) !== JSON.stringify(LISTE_4)) throw new Error('REFS_A_ECART : ' + S22.REFS_A_ECART.join(', '));
  });

  await v('ENT-2.3 : CMD-732153 porte le statut « Annulée », sa sortie et sa réintégration sont dans les mouvements', async () => {
    const db = ouvrir(S22);
    const o = db.orders.find((x) => x.no === 'CMD-732153');
    if (!o.annulee || o.annulee.motif !== 'Annulée par le client pendant la préparation' || !o.annulee.at) throw new Error('annulation : ' + JSON.stringify(o.annulee));
    if (db.orders.filter((x) => x.annulee).length !== 1) throw new Error('une seule commande annulée');
    const bat = db.moves.filter((m) => m.sku === 'BAT-10K');
    if (!bat.some((m) => m.type === S22.TYPES.reintegration && m.delta === 2 && m.ref === 'REI-26-0012')) throw new Error('réintégration des batteries absente');
    if (!bat.some((m) => m.type === S22.TYPES.preparation && m.delta === -2 && m.ref === 'BP-732153')) throw new Error('sortie des batteries absente');
  });

  await v('ENT-2.3 : écarts, décisions attendues, relevé de toute l\'allée dans l\'ordre des emplacements (valeurs écrites à la main)', async () => {
    const db = ouvrir(S22);
    const L = Object.fromEntries(S22.INVENTAIRE.lignes.map((l) => [l.ref, l]));
    if (JSON.stringify(S22.INVENTAIRE.lignes.map((l) => l.ref)) !== JSON.stringify(ORDRE_23)) throw new Error('ordre du relevé ≠ ordre des emplacements');
    ORDRE_23.forEach((r, i) => {
      if (L[r].compte !== COMPTE_23[r]) throw new Error(`${r} : relevé ${L[r].compte} au lieu de ${COMPTE_23[r]}`);
      if (db.stock[r] !== SYSTEME_23[r]) throw new Error(`${r} : système ${db.stock[r]}`);
      if (i > 0 && S22.CATALOGUE.VM[r].loc <= S22.CATALOGUE.VM[ORDRE_23[i - 1]].loc) throw new Error('relevé pas dans l\'ordre des emplacements');
    });
    if (Object.entries(ECARTS_23).filter(([, e]) => e).map(([r]) => r).join() !== LISTE_4.join()) throw new Error('écarts hors des quatre références');
    const attendus = Object.fromEntries(S22.INVENTAIRE.lignes.filter((l) => l.attendu).map((l) => [l.ref, [l.attendu, l.motif || '']]));
    if (JSON.stringify(attendus) !== JSON.stringify({ 'CAB-USBC-1M': ['recompter', ''], 'CHG-20W': ['rayon', ''], 'BAT-10K': ['rayon', ''], 'COQ-UNI-01': ['regul', 'Démarque inconnue'] })) throw new Error('décisions attendues : ' + JSON.stringify(attendus));
    const I = S22.INVENTAIRE;
    if (I.correction !== 'detaillee' || I.ecarts !== 'eleve' || I.aveugle !== true || I.source !== 'releve' || I.motifObligatoire === false) throw new Error('réglages de l\'inventaire');
    for (const l of I.lignes.filter((x) => x.attendu)) if (!l.explication || l.explication.length < 60) throw new Error(`correction détaillée sans explication : ${l.ref}`);
  });

  await v('ENT-2.3 : le piège est l\'article au mauvais emplacement — indices dans la messagerie dès l\'ouverture, sans la décision', async () => {
    const db = ouvrir(S22);
    if (ECARTS_23['CAB-USBC-1M'] + ECARTS_23['CHG-20W'] !== 0) throw new Error('la paire ne s\'annule pas');
    const ordinaires = [S22.TYPES.reception, S22.TYPES.preparation, S22.TYPES.reintegration];
    for (const r of ['CAB-USBC-1M', 'CHG-20W', 'BAT-10K', 'COQ-UNI-01']) {
      const bad = db.moves.filter((m) => m.sku === r && !ordinaires.includes(m.type));
      if (bad.length) throw new Error(`${r} : un mouvement explique déjà l'écart (${bad[0].type})`);
    }
    const kevin = db.mails.find((m) => /Palette Kabeo/.test(m.subject));
    if (!kevin || !/REC-26-0431/.test(kevin.text) || !/A-01/.test(kevin.text)) throw new Error('indice du cariste (palette Kabeo) absent ou incomplet');
    const ines = db.mails.find((m) => /Annulation de CMD-732153/.test(m.subject));
    if (!ines || !/REI-26-0012/.test(ines.text) || !/A-03/.test(ines.text)) throw new Error('indice de la préparatrice (annulation) absent ou incomplet');
    for (const m of [kevin, ines]) if (/régulari|remettre en rayon|recompt/i.test(m.text)) throw new Error('un indice donne la décision : ' + m.subject);
    if (!db.mails.some((m) => /RET-26-0107/.test(m.subject)) || !db.mails.some((m) => /DEM-26-0031/.test(m.subject))) throw new Error('retour et casse attendus à l\'ouverture');
    // La ligne témoin : aucun message n'explique les coques ; le relevé (arrivé avec la liste) écarte la piste.
    const lu = avecListe(LISTE_JUSTE);
    // (L'accusé de Nadia et sa demande citent des listes : ils n'expliquent rien.)
    if (lu.mails.some((m) => m.folder === 'in' && !/liste/.test(m.subject) && /COQ-UNI-01|coque/i.test(m.subject + ' ' + m.text))) throw new Error('un message explique l\'écart des coques');
    if (!lu.mails.some((m) => /A-04-2 : recompté deux fois, bacs voisins vérifiés/.test(m.remarque || ''))) throw new Error('la remarque du relevé n\'écarte pas la piste du mauvais rangement');
  });

  // ---------- ENT-2.3 — la liste de l'élève
  await v('ENT-2.3 : à l\'ouverture, Nadia redemande la liste (amorce « À recompter : ») ; ni relevé ni mission, écran en attente', async () => {
    const db = declencher(S22, ouvrir(S22));
    const nadia = db.mails.find((m) => /votre liste/.test(m.subject));
    if (!nadia || nadia.amorce !== 'À recompter : ' || !/rappelez-moi les références de l'allée A que vous avez retenues/.test(nadia.text)) throw new Error('demande de Nadia : ' + JSON.stringify(nadia && { s: nadia.subject, a: nadia.amorce }));
    const s = sujetsIn(db);
    if (s.some((x) => /Relevé de comptage|c’est pour vous|Rayon à vérifier/.test(x))) throw new Error('arrivé avant la liste : ' + s.join(' | '));
    if (perim(db) !== null) throw new Error('périmètre avant la liste : ' + perim(db));
    if (statuts(S22, db).some((x) => x !== 'attente')) throw new Error('jalons avant la liste : ' + statuts(S22, db).join(', '));
  });

  await v('ENT-2.3 : liste exacte — accusé neutre, relevé, mission ; 4 lignes à saisir, aucun aléa, taux 10 ÷ 145 = 6,9 %', async () => {
    const db = avecListe(LISTE_JUSTE);
    if (JSON.stringify(perim(db)) !== JSON.stringify(LISTE_4)) throw new Error('périmètre : ' + perim(db));
    const s = sujetsIn(db);
    for (const x of ['Votre liste à recompter', 'Relevé de comptage — allée A', 'Inventaire de l’allée A : c’est pour vous']) if (!s.includes(x)) throw new Error('manque : ' + x);
    if (s.some((x) => /Rayon à vérifier/.test(x))) throw new Error('aléa sans oubli');
    const accuse = db.mails.find((m) => m.subject === 'Votre liste à recompter');
    if (!/C'est noté : vous recomptez CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01\./.test(accuse.text)) throw new Error('accusé : ' + accuse.text);
    if (/juste|bonne|exact|bravo|oubli/i.test(accuse.text)) throw new Error('l\'accusé juge la liste');
    if (/A-05 et A-06/.test(accuse.text)) throw new Error('phrase du confirmé envoyée à un standard');
    const mission = db.mails.find((m) => /c’est pour vous/.test(m.subject));
    if (/huit emplacements/.test(mission.text) || !/les références de votre liste/.test(mission.text)) throw new Error('mission non réécrite');
    const b = INVM.bilanInventaire(justeInv(), S22.INVENTAIRE, S22.CATALOGUE);
    if (b.lignes.length !== 4 || b.sommeAbs !== 10 || b.sommeSys !== 145 || b.tauxAttendu !== 6.9) throw new Error(`bilan : ${b.lignes.length} lignes, ${b.sommeAbs} ÷ ${b.sommeSys} = ${b.tauxAttendu}`);
    if (statuts(S22, justeInv()).some((x) => x !== 'ok')) throw new Error('5/5 attendu : ' + statuts(S22, justeInv()).join(', '));
  });

  await v('ENT-2.3 : liste sans CAB — l\'aléa CAB arrive (Yanis Cazenave, après le relevé), CAB entre dans le périmètre, 5/5 possible', async () => {
    const texte = 'À recompter : CHG-20W, BAT-10K, COQ-UNI-01';
    const db = avecListe(texte);
    if (JSON.stringify(perim(db)) !== JSON.stringify(LISTE_4)) throw new Error('périmètre : ' + perim(db));
    const aleas = db.mails.filter((m) => /^Rayon à vérifier/.test(m.subject));
    if (aleas.length !== 1 || aleas[0].subject !== 'Rayon à vérifier : CAB-USBC-1M' || !/Yanis Cazenave/.test(aleas[0].from)) throw new Error('aléas : ' + aleas.map((m) => m.subject).join(' | '));
    if (!/Le bac A-01-1 des câbles déborde/.test(aleas[0].text)) throw new Error('texte de l\'aléa : ' + aleas[0].text);
    const releve = db.mails.find((m) => m.kind === 'releve');
    if (!(aleas[0].ts > releve.ts)) throw new Error('l\'aléa doit suivre le relevé dans l\'horodatage');
    const accuse = db.mails.find((m) => m.subject === 'Votre liste à recompter');
    if (/CAB/.test(accuse.text)) throw new Error('l\'accusé cite une référence oubliée');
    if (statuts(S22, justeInv({}, texte)).some((x) => x !== 'ok')) throw new Error('5/5 attendu');
  });

  await v('ENT-2.3 : liste avec un intrus (ECO-BT-01) — 5 lignes, écart 0 pour ECO, taux 10 ÷ 167 = 6,0 %', async () => {
    const texte = LISTE_JUSTE + ', ECO-BT-01';
    const db = avecListe(texte);
    if (JSON.stringify(perim(db)) !== JSON.stringify(['CAB-USBC-1M', 'CHG-20W', 'ECO-BT-01', 'BAT-10K', 'COQ-UNI-01'])) throw new Error('périmètre : ' + perim(db));
    const j = justeInv({ taux: '6' }, texte);
    const b = INVM.bilanInventaire(j, S22.INVENTAIRE, S22.CATALOGUE);
    if (b.lignes.length !== 5 || b.sommeSys !== 167 || b.tauxAttendu !== 6 || b.lignes.find((l) => l.ref === 'ECO-BT-01').ecartPremier !== 0) throw new Error(`bilan : ${b.sommeAbs} ÷ ${b.sommeSys} = ${b.tauxAttendu}`);
    if (statuts(S22, j).some((x) => x !== 'ok')) throw new Error('5/5 attendu : ' + statuts(S22, j).join(', '));
    if (!tombesInv(justeInv({ taux: '6,9' }, texte)).includes('taux')) throw new Error('le taux de la liste exacte ne doit pas passer avec un intrus');
  });

  await v('ENT-2.3 : « Absent » — la liste de Mathis Darrigade, 4 lignes ; le mot « absent » n\'est écrit dans aucun message', async () => {
    const db = avecListe('À recompter : absent');
    if (JSON.stringify(perim(db)) !== JSON.stringify(LISTE_4)) throw new Error('périmètre : ' + perim(db));
    const accuse = db.mails.find((m) => m.subject === 'Votre liste à recompter');
    if (!/Pas de souci\. Voici la liste préparée par Mathis Darrigade, de l'équipe stock : À recompter : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01\. Le relevé arrive\./.test(accuse.text)) throw new Error('accusé : ' + accuse.text);
    if (db.mails.some((m) => /^Rayon à vérifier/.test(m.subject))) throw new Error('aléa avec la liste du collègue');
    for (const d of [ouvrir(S22), db, avecListe('chg'), avecListe('À recompter : CHG-20W', 'confirme')]) {
      const fuite = d.mails.filter((m) => m.folder === 'in' && /absent/i.test(DECL.nrm(m.subject + ' ' + m.text + ' ' + (m.remarque || ''))));
      if (fuite.length) throw new Error('« absent » écrit dans : ' + fuite[0].subject);
    }
    // « ABSENT », « Absente » ou sans l'intitulé : reconnu ; un mot avec une référence : la référence prime.
    if (JSON.stringify(perim(avecListe('ABSENTE'))) !== JSON.stringify(LISTE_4)) throw new Error('« ABSENTE » non reconnu');
    if (S22.listeEleve(avecListe('À recompter : CHG-20W (j\'étais absent)')).absent) throw new Error('une référence doit primer sur « absent »');
  });

  await v('ENT-2.3 : fautes ignorées — « chg20w, Cab-Usbc-1m ; bat 10k » donne 3 références, dans l\'ordre des emplacements', async () => {
    const r = S22.extraireRefs('À recompter : chg20w, Cab-Usbc-1m ; bat 10k');
    if (JSON.stringify(r) !== JSON.stringify(['CAB-USBC-1M', 'CHG-20W', 'BAT-10K'])) throw new Error('extraites : ' + r.join(', '));
    // Sans la ligne « À recompter », tout le message est lu ; un mot inconnu est ignoré sans rien dire.
    if (S22.extraireRefs('Bonjour Nadia,\nje garde COQ-UNI-01 et XYZ-99\nMerci').join() !== 'COQ-UNI-01') throw new Error('message sans intitulé');
    if (S22.extraireRefs('À recompter : rien de spécial').length) throw new Error('une référence inventée');
  });

  await v('ENT-2.3 : rien de reconnu → un seul rappel, pas de relevé ; une seconde réponse reconnue débloque', async () => {
    const db = avecListe('À recompter : je ne sais pas');
    repondre(db, 'toujours rien'); declencher(S22, db);
    const rappels = db.mails.filter((m) => /je n’ai rien reconnu/.test(m.subject));
    if (rappels.length !== 1 || !/Je n'ai reconnu aucune référence de l'allée A dans votre message\. Renvoyez-moi la liste, références écrites comme sur l'écran Stock\./.test(rappels[0].text)) throw new Error(`${rappels.length} rappel(s)`);
    if (db.mails.some((m) => m.kind === 'releve')) throw new Error('relevé sans liste');
    repondre(db, 'À recompter : CHG-20W, COQ-UNI-01'); declencher(S22, db);
    if (!db.mails.some((m) => m.kind === 'releve')) throw new Error('la réponse reconnue ne débloque pas');
    if (JSON.stringify(perim(db)) !== JSON.stringify(LISTE_4)) throw new Error('périmètre : ' + perim(db));
    if (db.mails.filter((m) => /^Rayon à vérifier/.test(m.subject)).length !== 2) throw new Error('deux aléas attendus (CAB, BAT)');
  });

  await v('ENT-2.3 : deux réponses reconnues — la première fixe la liste, rien n\'arrive en double', async () => {
    const db = avecListe('À recompter : CHG-20W');
    const avant = db.mails.length;
    repondre(db, LISTE_JUSTE + ', ECO-BT-01'); declencher(S22, db);
    if (db.mails.length !== avant + 1) throw new Error('quelque chose est arrivé à la seconde réponse');
    if (JSON.stringify(perim(db)) !== JSON.stringify(LISTE_4)) throw new Error('la seconde réponse a changé la liste : ' + perim(db));
    if (db.mails.filter((m) => m.kind === 'releve').length !== 1) throw new Error('relevé en double');
  });

  await v('ENT-2.3 : confirmé — Nadia ajoute A-05 et A-06, 8 lignes, taux 10 ÷ 204 = 4,9 % ; un standard ne reçoit jamais la phrase', async () => {
    const db = avecListe(LISTE_JUSTE, 'confirme');
    if (JSON.stringify(perim(db)) !== JSON.stringify([...LISTE_4, ...A05_A06])) throw new Error('périmètre : ' + perim(db));
    const accuse = db.mails.find((m) => m.subject === 'Votre liste à recompter');
    if (!/Tant que l'équipe passe, recomptez aussi A-05 et A-06 : leur comptage tournant tombe cette semaine\./.test(accuse.text)) throw new Error('accusé du confirmé : ' + accuse.text);
    const j = justeInv({ taux: '4,9' }, LISTE_JUSTE, 'confirme');
    const b = INVM.bilanInventaire(j, S22.INVENTAIRE, S22.CATALOGUE);
    if (b.lignes.length !== 8 || b.sommeSys !== 204 || b.tauxAttendu !== 4.9) throw new Error(`bilan : ${b.lignes.length} lignes, ${b.sommeSys}, ${b.tauxAttendu}`);
    if (statuts(S22, j).some((x) => x !== 'ok')) throw new Error('5/5 attendu : ' + statuts(S22, j).join(', '));
    // Le confirmé « Absent » reçoit aussi la phrase ; un standard, jamais (liste, absent, rappel).
    if (!/A-05 et A-06/.test(avecListe('absent', 'confirme').mails.find((m) => m.subject === 'Votre liste à recompter').text)) throw new Error('confirmé absent sans la phrase');
    for (const t of [LISTE_JUSTE, 'absent', 'À recompter : CHG-20W', 'rien']) {
      if (avecListe(t).mails.some((m) => /A-05 et A-06/.test(m.text || ''))) throw new Error('phrase du confirmé envoyée à un standard : ' + t);
    }
    if (ouvrir(S22, 'Léa', 'confirme').mails.length !== ouvrir(S22).mails.length) throw new Error('l\'ouverture trahit le niveau');
  });

  // ---------- ENT-2.3 — les jalons
  await v('ENT-2.3 : sans travail, aucun jalon n\'est acquis (l\'inaction ne rapporte rien) ; base nue = « pas encore là »', async () => {
    const st = statuts(S22, avecListe(LISTE_JUSTE));
    if (st.some((s) => s !== 'attente')) throw new Error('statuts avant travail : ' + st.join(', '));
    const nue = S22.baseDeDepart('Léa'); nue.moves = []; nue.mails = []; nue.orders = [];
    if (statuts(S22, nue).some((s) => s !== 'na')) throw new Error('un jalon juge une base sans mouvements');
    const sans = etat23(avecListe(LISTE_JUSTE), { decisions: {} });
    const t = tombesInv(sans);
    if (!t.includes('rangements') || !t.includes('temoin')) throw new Error('décisions absentes mais jalons acquis : ' + t.join(', '));
  });

  await v('ENT-2.3 : tant que l\'inventaire n\'est pas validé, les décisions ne sont pas jugées (« attente »)', async () => {
    const db = justeInv({ valide: false });
    const st = Object.fromEntries(idsInv.map((x, i) => [x, statuts(S22, db)[i]]));
    if (st.rangements !== 'attente' || st.temoin !== 'attente' || st.taux !== 'attente') throw new Error('décisions jugées avant validation : ' + JSON.stringify(st));
    if (st.comptage !== 'ok' || st.ecarts !== 'ok') throw new Error('comptage et écarts justes non reconnus : ' + JSON.stringify(st));
  });

  await v('ENT-2.3 : chaque erreur typique fait tomber SON jalon, et lui seul', async () => {
    const cas = [
      ['rangements', 'régulariser les chargeurs manquants', { decisions: { ...BONNES_23, 'CHG-20W': ['regul', 'Démarque inconnue'] } }],
      ['rangements', 'régulariser le surplus de câbles', { decisions: { ...BONNES_23, 'CAB-USBC-1M': ['regul', 'Erreur de réception'] }, recomptes: {} }],
      ['rangements', 'régulariser les batteries', { decisions: { ...BONNES_23, 'BAT-10K': ['regul', 'Casse'] } }],
      ['rangements', 'ne rien décider pour les batteries', { decisions: { 'CAB-USBC-1M': ['recompter'], 'CHG-20W': ['rayon'], 'COQ-UNI-01': ['regul', 'Démarque inconnue'] } }],
      ['temoin', 'remettre les coques en rayon', { decisions: { ...BONNES_23, 'COQ-UNI-01': ['rayon'] } }],
      ['temoin', 'régulariser les coques avec un autre motif', { decisions: { ...BONNES_23, 'COQ-UNI-01': ['regul', 'Casse'] } }],
      ['temoin', 'recompter les coques', { decisions: { ...BONNES_23, 'COQ-UNI-01': ['recompter'] } }],
      ['taux', 'taux faux (écarts relevés avec leur signe)', { taux: '0' }],
      ['taux', 'taux de toute l\'allée au lieu du périmètre', { taux: '3,7' }],
    ];
    for (const [id, quoi, surcharge] of cas) {
      const t = tombesInv(justeInv(surcharge));
      if (t.length !== 1 || t[0] !== id) throw new Error(`« ${quoi} » : tombent ${t.join(', ') || 'aucun'}, attendu ${id}`);
    }
    if (!tombesInv(justeInv({ ecarts: { ...ECARTS_23, 'CHG-20W': 3 } })).includes('ecarts')) throw new Error('écart mal calculé non vu');
    if (!tombesInv(justeInv({ saisie: { ...COMPTE_23, 'CAB-USBC-1M': 64 } })).includes('comptage')) throw new Error('relevé mal reporté non vu');
  });

  await v('ENT-2.3 : le taux se lit à ± 0,1 point sur le périmètre (6,9 juste, 6,85 juste, 7,1 faux)', async () => {
    for (const [taux, ok] of [['6,9', true], ['6.9', true], ['6,85', true], ['7', true], ['7,1', false], ['10', false], ['', false]]) {
      const t = tombesInv(justeInv({ taux }));
      if (ok !== !t.includes('taux')) throw new Error(`taux « ${taux} » : ${ok ? 'doit passer' : 'doit tomber'} (tombent : ${t.join(', ') || 'aucun'})`);
    }
  });

  // ---------- Renumérotation (03/10/2026, brief `CDISCOUNT-renumerotation.md`)
  // Deux séances au même `code` se rangeraient au même rang, sans que rien ne casse à l'écran.
  // `doublons()` est éprouvée à la main sur une liste qui en contient un : le cas ne passe pas
  // parce qu'elle ne sait rien voir.
  await v('Cdiscount renuméroté : ENT-2.1, 2.2, 2.3, 2.4 dans l\'ordre, fermées aux élèves, aucun code en double au registre', async () => {
    const doublons = (codes) => codes.filter((c, i) => codes.indexOf(c) !== i);
    if (doublons(['ENT-2.1', 'ENT-2.3', 'ENT-2.3']).join() !== 'ENT-2.3') throw new Error('doublons() ne voit pas un doublon');
    const metas = await page.evaluate(async () => (await (await import('/activites/index.js')).chargerActivites())
      .map((a) => ({ id: a.meta.id, code: a.meta.code, pret: !!a.meta.pret, ouverture: a.meta.ouverture || null })));
    const d = doublons(metas.map((m) => m.code));
    if (d.length) throw new Error('code en double : ' + d.join(', '));
    const cd = metas.filter((m) => /^cdiscount-/.test(m.id));
    const attendu = { 'cdiscount-mouvements': 'ENT-2.1', 'cdiscount-chiffres': 'ENT-2.2', 'cdiscount-inventaire': 'ENT-2.3', 'cdiscount-regularise': 'ENT-2.4', 'cdiscount-compte-a-rebours': 'ENT-2.5', 'cdiscount-priorites': 'ENT-2.6' };
    for (const [id, code] of Object.entries(attendu)) {
      const m = cd.find((x) => x.id === id);
      if (!m || m.code !== code) throw new Error(`${id} : ${m && m.code} au lieu de ${code}`);
      if (!m.pret || m.ouverture !== 'prof') throw new Error(`${code} n'est pas fermée aux élèves`);
    }
  });

  // ---------- ENT-2.3 — dans le navigateur, avec le vrai moteur et le vrai écran Inventaire
  await v('ENT-2.3 : inscrite au registre, parmi les séances C1.6, livrée fermée aux élèves', async () => {
    const src = fs.readFileSync(path.join(ROOT, 'activites', 'index.js'), 'utf8');
    if (!src.includes("import('./cdiscount-inventaire.js')")) throw new Error('absente de activites/index.js');
    const meta = await page.evaluate(async () => (await import('/activites/cdiscount-inventaire.js')).meta);
    if (meta.code !== 'ENT-2.3' || meta.temps !== 'entrainement' || !meta.competences.includes('C1.6')) throw new Error('meta incomplet');
    if (meta.bareme !== S22.ETAPES.length) throw new Error('barème ≠ nombre de jalons');
    if (!meta.pret || meta.ouverture !== 'prof') throw new Error('livrée : pret: true, ouverture: \'prof\'');
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

  const monter22 = async (role = 'eleve', aisance) => {
    await pg.evaluate(async ([r, a]) => {
      const mod = await import('/activites/cdiscount-inventaire.js');
      document.querySelector('#hote22')?.remove();
      const hote = document.createElement('div'); hote.id = 'hote22'; document.body.appendChild(hote);
      const db = a ? { aisance: a, aisancePour: mod.meta.id } : {};
      window.__inv22 = { db, scores: [] };
      mod.rendre(hote, { meta: mod.meta, profil: { prenom: 'Léa', nom: 'Test', role: r }, codeStock: 'STOCK24',
        jeu: { etat: () => db, sauver() {} }, enregistrer(x) { window.__inv22.scores.push(x); }, quitter() {} });
    }, [role, aisance || null]);
  };
  const Z22 = '#hote22 .ent-main';
  const ouvrir22 = async (vue) => { await pg.click(`#hote22 .ent-nav[data-vue="${vue}"]`); await navOn(pg, '#hote22', vue); };
  const texte22 = async (sel) => ((await pg.textContent(sel || Z22)) || '').replace(/\s+/g, ' ').trim();
  const aller22 = async (n) => { await pg.click(`${Z22} [data-inv-aller="${n}"]`); await etapeInv(pg, Z22, n); };
  const decider22 = async (ref, action, motif) => {
    await pg.selectOption(`${Z22} [data-inv-action="${ref}"]`, action); await pg.waitForTimeout(80);
    if (motif) await pg.selectOption(`${Z22} [data-inv-motif="${ref}"]`, motif);
  };
  const dbPage = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__inv22.db)));
  // Répondre à Nadia par la vraie messagerie : le champ s'ouvre sur l'amorce, on écrit après.
  const repondre22 = async (suite) => {
    await ouvrir22('mail');
    await pg.click(`${Z22} .ent-mitem >> text=Inventaire de l’allée A : votre liste`); await pg.waitForSelector(`${Z22} [data-repondre]`);
    await pg.click(`${Z22} [data-repondre]`);
    const amorce = await pg.inputValue(`${Z22} #repT`);
    await pg.fill(`${Z22} #repT`, amorce + suite);
    await pg.click(`${Z22} #formRep button[type="submit"]`); await pg.waitForTimeout(120);
    await ouvrir22('mail');
    if (await pg.$(`${Z22} [data-dossier="in"]`)) { await pg.click(`${Z22} [data-dossier="in"]`); await pg.waitForTimeout(80); }
    return amorce;
  };
  const jusquAuTraitement22 = async (refs = LISTE_4) => {
    await ouvrir22('inventaire');
    for (const r of refs) await pg.fill(`${Z22} [data-inv-saisie="${r}"]`, String(COMPTE_23[r]));
    await aller22(2);
    for (const r of refs) await pg.fill(`${Z22} [data-inv-ecart="${r}"]`, String(ECARTS_23[r]).replace('-', '−'));
    await aller22(3);
  };
  const valider22 = async (taux = '6,9') => {
    await aller22(4);
    await pg.fill(`${Z22} [data-inv-taux]`, taux);
    await pg.click(`${Z22} [data-inv-valider]`);
    // Validé (bilan) ou refusé (message) : dans les deux cas l'écran a répondu.
    await pg.waitForFunction((s) => { const z = document.querySelector(s); return !!z && (/Inventaire INV-\S+ valid/.test(z.textContent) || !!z.querySelector('[data-inv-msg]')); },
      Z22, { timeout: 4000 }).catch(() => {});
  };

  await v('ENT-2.3 : la séance s\'ouvre dans le vrai moteur — six messages, l\'écran attend la liste, stock caché à l\'aveugle', async () => {
    await monter22();
    const accueil = await texte22();
    if (/en stock|références en rupture/.test(accueil)) throw new Error('le stock du système est lisible à l\'accueil : ' + accueil.slice(0, 200));
    const accent = await pg.evaluate(() => getComputedStyle(document.body).getPropertyValue('--ardoise').trim());
    if (accent.toLowerCase() !== '#3732ff') throw new Error('accent de la charte non appliqué : ' + accent);
    await ouvrir22('inventaire');
    if (!/En attente de votre liste : répondez à Nadia Ferrand \(Messagerie\)\./.test(await texte22())) throw new Error('écran : ' + (await texte22()).slice(0, 200));
    if ((await dbPage()).inventaires) throw new Error('un état d\'inventaire créé avant la liste');
    await ouvrir22('mail');
    const nb = await pg.$$eval('#hote22 .ent-mitem', (e) => e.length);
    if (nb !== 6) throw new Error(`${nb} messages au lieu de 6`);
    await ouvrir22('stock');
    if (!(await pg.$(`${Z22} [data-stock-bloque]`))) throw new Error('Stock doit être bloqué');
    await ouvrir22('console');
    await pg.fill('#champCmd', '.getstock COQ-UNI-01'); await pg.press('#champCmd', 'Enter');
    await pg.waitForFunction((s) => { const b = [...document.querySelectorAll(s + ' .ent-cres')]; return b.length > 0 && /Inventaire en cours/.test(b[b.length - 1].textContent); },
      Z22, { timeout: 4000 }).catch(() => {});
    const blocs = await pg.$$eval(`${Z22} .ent-cres`, (e) => e.map((x) => x.textContent));
    if (!/Inventaire en cours/.test(blocs[blocs.length - 1] || '')) throw new Error('.getstock devrait être refusée : ' + blocs[blocs.length - 1]);
    await ouvrir22('catalogue');
    const cat = await texte22();
    for (const n of ['64', '44', '37']) if (new RegExp(`(Stock|stock)\\D{0,12}\\b${n}\\b`).test(cat)) throw new Error('le Catalogue montre un stock du système : ' + n);
  });

  await v('Fournisseur (réponse automatique) : une référence Cdiscount est reconnue, plus seulement le format Spartoo', async () => {
    await monter22();
    await ouvrir22('mail');
    await pg.click('#hote22 [data-nouveau]');
    await pg.selectOption('#hote22 #mTo', 'F01');
    await pg.fill('#hote22 #mTxt', 'Bonjour,\n\ncab-usbc-1m : 20\n\nCordialement');
    const avantF = await pg.evaluate(() => window.__inv22.db.mails.filter((m) => m.folder === 'in').length);
    await pg.click('#hote22 [data-envoyer-fou]');
    await pg.waitForFunction((n) => window.__inv22.db.mails.filter((m) => m.folder === 'in').length > n, avantF, { timeout: 4000 }).catch(() => {});
    const rep = (await dbPage()).mails.filter((m) => m.folder === 'in').pop();
    if (!/Commande bien reçue, pour un total de 20/.test(rep.text || '')) throw new Error('réponse du fournisseur : ' + String(rep.text).slice(0, 160));
  });

  await v('ENT-2.3 : CMD-732153 s\'affiche « Annulée » dans Commandes', async () => {
    await monter22();
    await ouvrir22('commandes');
    const t = await texte22();
    if (!/CMD-732153[^]*?Annulée/.test(t)) throw new Error('commandes : ' + t.slice(0, 400));
  });

  await v('ENT-2.3 : parcours juste de bout en bout — la liste par la messagerie, 4 lignes, une seule régularisation, score 5/5', async () => {
    await monter22();
    const amorce = await repondre22('CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01');
    if (amorce !== 'À recompter : ') throw new Error('amorce : ' + JSON.stringify(amorce));
    const sujets = await pg.$$eval('#hote22 .ent-mitem', (e) => e.map((x) => x.textContent));
    if (!sujets.some((s) => /Relevé de comptage/.test(s))) throw new Error('relevé non arrivé : ' + sujets.join(' | '));
    // Le relevé papier couvre toute l'allée : douze lignes.
    await pg.click(`${Z22} .ent-mitem >> text=Relevé de comptage`); await pg.waitForSelector('#hote22 .inv-papier tbody tr');
    const lignes = await pg.$$eval('#hote22 .inv-papier tbody tr', (e) => e.map((x) => [...x.querySelectorAll('td')].map((t) => t.textContent.trim())));
    if (JSON.stringify(lignes.map((l) => [l[1], Number(l[2])])) !== JSON.stringify(ORDRE_23.map((r) => [r, COMPTE_23[r]]))) throw new Error('relevé affiché : ' + JSON.stringify(lignes));
    await ouvrir22('inventaire');
    const saisies = await pg.$$eval(`${Z22} [data-inv-saisie]`, (e) => e.map((x) => x.dataset.invSaisie));
    if (JSON.stringify(saisies) !== JSON.stringify(LISTE_4)) throw new Error('lignes à saisir : ' + saisies.join(', '));
    await jusquAuTraitement22();
    await pg.click(`${Z22} [data-inv-ouvrir="BAT-10K"]`); await pg.waitForSelector(`${Z22} [data-inv-mvts="BAT-10K"]`);
    const mv = await pg.$$eval(`${Z22} [data-inv-mvts="BAT-10K"] tbody tr`, (e) => e.length);
    if (mv !== 4) throw new Error(`${mv} mouvements de BAT-10K à l'écran au lieu de 4`);
    await decider22('CAB-USBC-1M', 'recompter');
    await decider22('CHG-20W', 'rayon');
    await decider22('BAT-10K', 'rayon');
    await decider22('COQ-UNI-01', 'regul', 'Démarque inconnue');
    await valider22('6,9');
    const bilan = await texte22();
    if (!/Inventaire INV-2026-52 validé/.test(bilan) || !/4 décisions justes sur 4/.test(bilan)) throw new Error('bilan : ' + bilan.slice(0, 300));
    if (!/Ce qu'il fallait voir/.test(bilan) || !/les trois mêmes cartons/.test(bilan)) throw new Error('correction détaillée absente');
    const db = await dbPage();
    const aj = db.moves.filter((m) => m.type === 'Ajustement inventaire');
    if (aj.length !== 1 || aj[0].sku !== 'COQ-UNI-01' || aj[0].delta !== -2 || !/INV-2026-52 · Démarque inconnue/.test(aj[0].ref)) throw new Error('ajustements : ' + JSON.stringify(aj));
    if (JSON.stringify(db.stock) !== JSON.stringify({ ...SYSTEME_23, 'COQ-UNI-01': 25 })) throw new Error('stock final : ' + JSON.stringify(db.stock));
    if (statuts(S22, db).some((s) => s !== 'ok')) throw new Error('jalons : ' + statuts(S22, db).join(', '));
    const dernier = await pg.evaluate(() => window.__inv22.scores[window.__inv22.scores.length - 1]);
    if (!dernier || dernier.score !== 5 || dernier.max !== 5) throw new Error('score remonté : ' + JSON.stringify(dernier));
  });

  await v('ENT-2.3 : liste sans CAB par la messagerie — l\'aléa arrive, la paire se résout, 5/5', async () => {
    await monter22();
    await repondre22('CHG-20W, BAT-10K, COQ-UNI-01');
    const sujets = await pg.$$eval('#hote22 .ent-mitem', (e) => e.map((x) => x.textContent));
    if (!sujets.some((s) => /Rayon à vérifier : CAB-USBC-1M/.test(s))) throw new Error('aléa absent : ' + sujets.join(' | '));
    await jusquAuTraitement22();
    await decider22('CAB-USBC-1M', 'recompter');
    await decider22('CHG-20W', 'rayon');
    await decider22('BAT-10K', 'rayon');
    await decider22('COQ-UNI-01', 'regul', 'Démarque inconnue');
    await valider22('6,9');
    const dernier = await pg.evaluate(() => window.__inv22.scores[window.__inv22.scores.length - 1]);
    if (!dernier || dernier.score !== 5) throw new Error('score : ' + JSON.stringify(dernier));
  });

  await v('ENT-2.3 : le réflexe « tout écart négatif se régularise » coûte cher — les chargeurs disparaissent, la correction dit pourquoi', async () => {
    await monter22();
    await repondre22('CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01');
    await jusquAuTraitement22();
    await decider22('CAB-USBC-1M', 'recompter');
    await decider22('CHG-20W', 'regul', 'Démarque inconnue');
    await decider22('BAT-10K', 'rayon');
    await decider22('COQ-UNI-01', 'regul', 'Démarque inconnue');
    await valider22('6,9');
    const bilan = await texte22();
    if (!/3 décisions justes sur 4/.test(bilan) || !/les trois mêmes cartons/.test(bilan)) throw new Error('bilan : ' + bilan.slice(0, 300));
    const db = await dbPage();
    if (db.stock['CHG-20W'] !== 41) throw new Error('les chargeurs devraient être régularisés à 41 : ' + db.stock['CHG-20W']);
    const t = tombesInv(db);
    if (t.length !== 1 || t[0] !== 'rangements') throw new Error('jalons tombés : ' + t.join(', '));
  });

  await v('ENT-2.3 : confirmé à l\'écran — 8 lignes à saisir (A-05 / A-06 en plus), aucune étiquette de niveau', async () => {
    await monter22('eleve', 'confirme');
    await repondre22('CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01');
    await ouvrir22('inventaire');
    const saisies = await pg.$$eval(`${Z22} [data-inv-saisie]`, (e) => e.map((x) => x.dataset.invSaisie));
    if (JSON.stringify(saisies) !== JSON.stringify([...LISTE_4, ...A05_A06])) throw new Error('lignes : ' + saisies.join(', '));
    if (/confirm|standard|niveau/i.test(await pg.textContent('#hote22'))) throw new Error('le niveau se lit à l\'écran');
  });

  await v('ENT-2.3 : l\'enseignant voit le stock malgré le comptage à l\'aveugle', async () => {
    await monter22('prof');
    await ouvrir22('stock');
    if (await pg.$(`${Z22} [data-stock-bloque]`)) throw new Error('Stock bloqué pour l\'enseignant');
  });

  await v("ENT-2.3 : le bandeau propose la trame (PDF et Word), plus d'étiquette « Tout à l'écran »", async () => {
    await monter22();
    const sans = await pg.$$eval('#hote22 .ent-bandeau .ent-sans-trame', (e) => e.length);
    if (sans) throw new Error("étiquette « Tout à l'écran » encore affichée");
    const liens = await pg.$$eval('#hote22 .ent-bandeau a[download]', (e) => e.map((a) => a.getAttribute('href')));
    if (liens.join('|') !== './contenus/trames/ENT-2.3-cdiscount-inventaire-trame-eleve.pdf|./contenus/trames/ENT-2.3-cdiscount-inventaire-trame-eleve.docx') throw new Error('liens : ' + liens.join('|'));
  });

  await v('ENT-2.3 : aucune erreur de console ni d\'exception pendant ces parcours', async () => {
    await pg.evaluate(() => { document.querySelector('#hote22')?.remove(); document.body.classList.remove('immersion'); });
    await ctx22.close();
    if (erreurs22.length) throw new Error(erreurs22.slice(0, 3).join(' | '));
  });

  /* ================================================================================
   * ENT-2.4 « Régularisé à l'aveugle » (erreur induite) — ajouté le 03/10/2026, chantier D.
   *
   * Décisions de Tristan : le vrai problème est une LIVRAISON INCOMPLÈTE (Gardéo livre 8 mixeurs
   * pour 12 annoncés, la réception valide les 12) ; l'élève répond par un message à lignes à
   * intitulé ; séance d'entraînement hors évaluation, `pret: false`. Les valeurs attendues sont
   * écrites À LA MAIN ici : un test qui les recalculerait avec le code de la séance ne verrait pas
   * une erreur de données.
   * ============================================================================== */

  const S23 = await imp('contenus/cdiscount-regularise.js');
  const STOCK_23 = { 'BOU-17L': 16, 'GRP-2F': 11, 'MIX-PLG': 9, 'MUL-4P': 37, 'PIL-AA-8': 75, 'VEI-LED': 9 };
  // Les six jalons de l'ENQUÊTE. Depuis le 04/10/2026 (C7), deux jalons tableur les précèdent : ils ont leurs cas plus bas.
  const ENQ23 = S23.ETAPES.slice(3);
  const statuts6 = (db) => statuts({ ETAPES: ENQ23, CATALOGUE: S23.CATALOGUE }, db);
  const ids23 = ENQ23.map((x) => x.id);
  const tombes23 = (db) => { const st = statuts6(db); return ids23.filter((x, i) => st[i] !== 'ok'); };

  const JUSTE_23 = `Ajustement à revoir : MIX-PLG, -4
Ajustement justifié : GRP-2F, constat de casse DEM-26-0036
Réception concernée : REC-26-0447
Annoncé sur le bon de livraison : 12
Réellement reçu : 8
Valeur du manque : 4 × 12,60 = 50,40 €
Motif exact : Erreur de réception
Suite à donner : Réclamation auprès de Gardéo, livraison incomplète`;

  await v('ENT-2.4 : volume déclaré = volume réel (6 références, 11 documents, 22 mouvements), plus fort qu\'ENT-2.1', async () => {
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

  await v('ENT-2.4 : mouvements datés dans l\'ordre, stock « après » sans trou, stock final écrit à la main', async () => {
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

  await v('ENT-2.4 : le piège — un seul écart BL / colis, sur les mixeurs de REC-26-0447, et deux ajustements dont un seul est orphelin', async () => {
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

  await v('ENT-2.4 : l\'erreur est induite (« c\'est de la démarque »), l\'indice existe, le délai de réclamation est donné', async () => {
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
    // Six messages : bienvenue, indice, magasinier, casse, vendeur (transféré), mission.
    if (db.mails.length !== 6) throw new Error(`${db.mails.length} messages au lieu de 6`);
  });

  await v('ENT-2.4 : sans réponse, aucun jalon n\'est acquis ; base nue ou sans écart BL / colis = « pas encore là »', async () => {
    const db = ouvrir(S23);
    const st = statuts6(db);
    if (st.length !== 6 || st.some((s) => s !== 'attente')) throw new Error('statuts avant réponse : ' + st.join(', '));
    const nue = S23.baseDeDepart('Léa'); nue.moves = []; nue.mails = []; nue.orders = [];
    if (statuts6(nue).some((s) => s !== 'na')) throw new Error('un jalon juge une base sans mouvements');
    // Si les colis font le compte, il n'y a plus de litige : les jalons se taisent au lieu de mentir.
    const sain = ouvrir(S23);
    sain.receptions.find((r) => r.no === 'REC-26-0447').colis.push({ no: 99, sku: 'MIX-PLG', qty: 4, etat: 'ok' });
    repondre(sain, JUSTE_23);
    if (statuts6(sain).some((s) => s !== 'na')) throw new Error('jalons sur une base sans litige : ' + statuts6(sain).join(', '));
  });

  await v('ENT-2.4 : la réponse juste valide les six jalons, calcul compris', async () => {
    const db = ouvrir(S23);
    repondre(db, JUSTE_23);
    const st = statuts6(db);
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

  await v('ENT-2.4 : chaque erreur typique fait tomber SON jalon, et lui seul', async () => {
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

  await v('ENT-2.4 : le meilleur essai est retenu, une réponse à un autre destinataire ne compte pas, une ligne absente tombe seule', async () => {
    const db = ouvrir(S23);
    repondre(db, JUSTE_23.replace('Réception concernée : REC-26-0447', 'Réception concernée : REC-26-0441'));
    if (tombes23(db).join() !== 'reception') throw new Error('premier essai faux non détecté : ' + tombes23(db).join());
    repondre(db, JUSTE_23);
    if (tombes23(db).length) throw new Error('le second essai juste n\'est pas retenu');
    const db2 = ouvrir(S23);
    db2.mails.push({ folder: 'out', ts: Date.now(), toMail: CD.EQUIPE.quai.mail, text: JUSTE_23 });
    if (statuts6(db2).some((s) => s !== 'attente')) throw new Error('une réponse au cariste est comptée');
    const db3 = ouvrir(S23);
    repondre(db3, JUSTE_23.split('\n').filter((l) => !l.startsWith('Motif exact')).join('\n'));
    if (tombes23(db3).join() !== 'motif') throw new Error('ligne « Motif exact » absente : ' + tombes23(db3).join());
  });

  await v('ENT-2.4 : inscrite au registre, cachée tant que pret: false, parmi les séances C1.6, temps « erreur induite »', async () => {
    const src = fs.readFileSync(path.join(ROOT, 'activites', 'index.js'), 'utf8');
    if (!src.includes("import('./cdiscount-regularise.js')")) throw new Error('absente de activites/index.js');
    const meta = await page.evaluate(async () => (await import('/activites/cdiscount-regularise.js')).meta);
    if (meta.code !== 'ENT-2.4' || meta.temps !== 'erreur' || !meta.competences.includes('C1.6')) throw new Error('meta incomplet');
    if (meta.bareme !== S23.ETAPES.length) throw new Error('barème ≠ nombre de jalons');
    if (meta.reinitialisable) throw new Error('la remise à zéro est réservée aux séances X.1');
    const { activiteVisible } = await imp('core/niveaux.js');
    if (!meta.pret && activiteVisible(meta, { niveau: '1re' })) throw new Error('séance non prête visible des élèves');
    const regs = await page.evaluate(async () => (await (await import('/activites/index.js')).chargerActivites()).map((a) => a.meta.code));
    if (!regs.includes('ENT-2.4')) throw new Error('ENT-2.4 absente du registre chargé');
  });

  await v('ENT-2.4 : la séance s\'ouvre, se lit et se répond dans le vrai moteur — le litige est visible à l\'écran', async () => {
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
      // Aucun bon de livraison n'arrive par message chez Cdiscount : l'encadré ne renvoie pas à la messagerie.
      out.avisRec = (hote.querySelector('.panneau .avis') || {}).textContent || '';
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
    if (res.mails !== 6) throw new Error(`${res.mails} messages au lieu de 6`);
    if (res.lignesConsole !== 6 || !res.consoleAjust) throw new Error(`.movements MIX-PLG : ${res.lignesConsole} lignes (6 attendues), ajustement lisible : ${res.consoleAjust}`);
    if (res.lignesStock !== 6) throw new Error(`${res.lignesStock} lignes de stock au lieu de 6`);
    if (/Couleur|Taille/.test(res.colonne)) throw new Error('colonnes Couleur ou Taille affichées : ' + res.colonne);
    if (res.lignesMouv !== 22) throw new Error(`${res.lignesMouv} mouvements à l'écran au lieu de 22`);
    if (res.receptions !== 2 || res.commandes !== 8) throw new Error(`${res.receptions} réceptions, ${res.commandes} commandes`);
    if (res.colisMixeurs !== 8) throw new Error('les colis de mixeurs à l\'écran ne font pas 8 : ' + res.colisMixeurs);
    if (/messagerie/.test(res.avisRec) || !/bon de livraison/.test(res.avisRec)) throw new Error('encadré de la réception : ' + res.avisRec);
    // Les six jalons de l'enquête ; les trois du tableur (export compris) attendent un dépôt.
    if (!res.score || res.score.score !== 6 || res.score.max !== 9) throw new Error('score remonté : ' + JSON.stringify(res.score));
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

  await v('Cdiscount : la page d\'essai ouvre aussi ENT-2.3, avec ses cinq jalons à « attente »', async () => {
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

  await v('Cdiscount : la page d\'essai ouvre aussi ENT-2.4, avec ses six jalons à « attente »', async () => {
    const ctx = await nav.newContext();
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) errs.push(m.text()); });
    try {
      await p.goto(new URL('/outils/essai-cdiscount.html', page.url()).toString());
      await p.waitForSelector('.ent-shell', { timeout: 6000 });
      await p.selectOption('select[name="seance"]', 'cdiscount-regularise');
      // ENT-2.4 n'a pas d'entrée de menu propre (pas d'écran Inventaire) : on attend que les six jalons de la séance remplacent ceux d'ENT-2.1.
      await p.waitForFunction((n) => document.querySelectorAll('#jalons span').length === n, S23.ETAPES.length, { timeout: 6000 });
      const jalons = await p.$$eval('#jalons span', (s) => s.map((x) => x.textContent.trim()));
      if (jalons.length !== S23.ETAPES.length) throw new Error(`${jalons.length} jalons affichés au lieu de ${S23.ETAPES.length}`);
      if (jalons.some((j) => !j.startsWith('⏳'))) throw new Error('jalons avant travail : ' + jalons.join(' | '));
      if (errs.length) throw new Error(errs.join(' | '));
    } finally { await ctx.close(); }
  });

  /* ================================================================================
   * ENT-2.2 « Ce que disent les chiffres » (guidage du geste tableur) — ajouté le 04/10/2026, C6.
   * Valeurs écrites À LA MAIN : nombre de lignes de l'export par niveau, les 8 constats (bon,
   * référence, écart), la synthèse. Le classeur « de l'élève » est fabriqué ici à partir de SON
   * export, avec les formules qu'il doit écrire (SI, NB.SI), ou avec ses erreurs.
   * ============================================================================== */
  const S2 = await imp('contenus/cdiscount-chiffres.js');
  const GT = await imp('core/types/export-tableur.js');
  if (!baseXlsx) throw new Error('module xlsx introuvable — npm install --no-save --no-package-lock xlsx@0.18.5');
  const XL = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  const CONSTATS_22 = [['BP-732101', 'CAB-USBC-1M', 3], ['BP-732118', 'CHG-20W', -3], ['BP-732126', 'COQ-UNI-01', -2],
    ['BP-732167', 'CHG-20W', -3], ['BP-732181', 'CAB-USBC-1M', 3], ['BP-732181', 'COQ-UNI-01', -2],
    ['BP-732195', 'BAT-10K', -2], ['BP-732210', 'CHG-20W', -3]];
  const SYNTHESE_22 = { 'CAB-USBC-1M': 2, 'CHG-20W': 3, 'ECO-BT-01': 0, 'SOU-SF-02': 0, 'BAT-10K': 1, 'CLE-64G': 0, 'AMP-LED-E27': 0, 'COQ-UNI-01': 2 };
  const ouvrirC = (aisance) => declencher(S2, ouvrir(S2, 'Léa', aisance));
  const exportC = (db) => GT.construireExport(S2.TABLEUR.exports[0], db, {});
  const G_lignes = (ex) => JSON.stringify(ex.feuilles[0].lignes);
  // Le classeur de l'élève. `o` : ses erreurs (tape : écarts tapés ; sansSi : une autre fonction que
  // SI dans la colonne L ; syn : valeurs de synthèse écrites à la place des bonnes).
  const classeurC = (db, o = {}) => {
    const ex = exportC(db);
    const F = ex.feuilles[0];
    const c = Object.fromEntries(F.colonnes.map((x, i) => [x, i]));
    const n = F.colonnes.length, K = XL.utils.encode_col(n), L = XL.utils.encode_col(n + 1);
    const T = XL.utils.encode_col(c['Stock trouvé']), Lg = XL.utils.encode_col(c['Stock logiciel']), D = XL.utils.encode_col(c['Référence']);
    const ws = XL.utils.aoa_to_sheet([[...F.colonnes, 'Écart', 'Réf. en écart'], ...F.lignes]);
    F.lignes.forEach((l, k) => {
      const r = k + 2, ec = l[c['Stock trouvé']] - l[c['Stock logiciel']];
      ws[K + r] = o.tape ? { t: 'n', v: ec } : { t: 'n', v: ec, f: `${T}${r}-${Lg}${r}` };
      ws[L + r] = { t: 's', v: ec !== 0 ? l[c['Référence']] : '', f: o.sansSi ? `CHOOSE(1+COUNTIF(${K}${r},"<>0"),"",${D}${r})` : `IF(${K}${r}<>0,${D}${r},"")` };
    });
    ws['!ref'] = `A1:${L}${F.lignes.length + 1}`;
    const syn = ex.feuilles[1].lignes.map(([ref]) => [ref, o.syn && o.syn[ref] != null ? o.syn[ref]
      : F.lignes.filter((l) => l[c['Référence']] === ref && l[c['Stock trouvé']] !== l[c['Stock logiciel']]).length]);
    const ws2 = XL.utils.aoa_to_sheet([['Référence', 'Nb constats'], ...syn]);
    syn.forEach((x, k) => { ws2['B' + (k + 2)] = { t: 'n', v: x[1], f: `COUNTIF(Préparations!${L}:${L},A${k + 2})` }; });
    const wb = XL.utils.book_new();
    XL.utils.book_append_sheet(wb, ws, 'Préparations');
    XL.utils.book_append_sheet(wb, ws2, 'Synthèse');
    return XL.write(wb, { bookType: 'xlsx', type: 'buffer' });
  };
  // Déposer « à la main » (sans écran) : contrôle, puis rangement comme le fait l'écran.
  const deposerC = (db, o) => {
    const wb = XL.read(classeurC(db, o), { type: 'buffer', cellFormula: true });
    const res = GT.controlerDepot(wb, S2.controles(db), exportC(db).propres);
    GT.enregistrerDepot(db, S2.ID_DEPOT, res, { retour: 'guidage', fichier: 'x.xlsx' });
    return res;
  };
  const exporterC = (db) => { const e = S2.TABLEUR.exports[0]; GT.enregistrerExport(db, e, GT.criteresJustes(e, db), 30); return db; };
  const stC = (db) => Object.fromEntries(S2.ETAPES.map((e) => [e.id, e.verifier(db).status]));

  await v('ENT-2.2 : export standard — 30 lignes (A-01 à A-04), les 8 constats et la synthèse écrits à la main', async () => {
    const db = ouvrirC();
    const F = exportC(db).feuilles[0];
    if (F.lignes.length !== 30) throw new Error(`${F.lignes.length} lignes au lieu de 30`);
    if (F.colonnes.join('|') !== 'Date|N° bon|Commande|Référence|Désignation|Emplacement|Qté préparée|Stock logiciel|Stock trouvé|Préparateur') throw new Error('colonnes');
    const c = Object.fromEntries(F.colonnes.map((x, i) => [x, i]));
    const vus = F.lignes.filter((l) => l[c['Stock trouvé']] !== l[c['Stock logiciel']])
      .map((l) => [l[c['N° bon']], l[c['Référence']], l[c['Stock trouvé']] - l[c['Stock logiciel']]]);
    if (JSON.stringify(vus) !== JSON.stringify(CONSTATS_22)) throw new Error('constats : ' + JSON.stringify(vus));
    if (JSON.stringify(S2.constats(db)) !== JSON.stringify(SYNTHESE_22)) throw new Error('synthèse : ' + JSON.stringify(S2.constats(db)));
    if (S2.refsEnEcart(db).join() !== 'CAB-USBC-1M,CHG-20W,BAT-10K,COQ-UNI-01') throw new Error('bonne liste');
    if (F.lignes.some((l) => !l[c['Préparateur']] || /Équipe/.test(l[c['Préparateur']]))) throw new Error('préparateur manquant');
    if (exportC(db).feuilles[1].lignes.map((l) => l[0]).join() !== 'CAB-USBC-1M,CHG-20W,ECO-BT-01,SOU-SF-02,BAT-10K,CLE-64G,AMP-LED-E27,COQ-UNI-01') throw new Error('amorce de la synthèse');
    const vol = { references: new Set(db.moves.map((m) => m.sku)).size, documents: new Set(db.moves.map((m) => m.ref)).size, mouvements: db.moves.length };
    if (JSON.stringify(vol) !== JSON.stringify(S2.VOLUME)) throw new Error('volume : ' + JSON.stringify(vol));
    if (db.moves.some((m) => m.ts >= new Date().setHours(0, 0, 0, 0))) throw new Error('un mouvement est daté d\'aujourd\'hui ou du futur');
    let s = { ...S2.STOCK_DEBUT_MOIS };
    for (const m of db.moves) { s[m.sku] += m.delta; if (m.after !== s[m.sku] || s[m.sku] < 0) throw new Error(`stock après faux : ${m.sku} ${m.ref}`); }
  });

  await v('ENT-2.2 : confirmé — 45 lignes, toute l\'allée (12 références), mêmes constats, même bonne liste', async () => {
    const db = ouvrirC('confirme');
    const F = exportC(db).feuilles[0];
    if (F.lignes.length !== 45) throw new Error(`${F.lignes.length} lignes au lieu de 45`);
    if (exportC(db).feuilles[1].lignes.length !== 12) throw new Error('synthèse du confirmé : 12 lignes');
    if (JSON.stringify(S2.constats(db)) !== JSON.stringify({ ...SYNTHESE_22, 'CAS-FIL-01': 0, 'SUP-VOIT': 0, 'CLA-SF-01': 0, 'HUB-USB-4': 0 })) throw new Error('synthèse : ' + JSON.stringify(S2.constats(db)));
    if (S2.refsEnEcart(db).join() !== 'CAB-USBC-1M,CHG-20W,BAT-10K,COQ-UNI-01') throw new Error('bonne liste');
    if (JSON.stringify(ouvrirC('confirme').mails.map((m) => m.text)) !== JSON.stringify(ouvrirC().mails.map((m) => m.text))) throw new Error('la mission trahit le niveau');
  });

  await v('ENT-2.2 : même allée qu\'ENT-2.3, deux jours avant — commandes et constats de la fenêtre identiques, une seule source', async () => {
    const d2 = ouvrirC(), d3 = ouvrir(S22);
    const L2 = CD.lignesPreparation(d2, S2.CATALOGUE), L3 = CD.lignesPreparation(d3, S22.CATALOGUE);
    const communs = L2.filter((p) => L3.some((q) => q.bon === p.bon && q.sku === p.sku));
    if (communs.length !== 26) throw new Error(`${communs.length} lignes communes au lieu de 26`);
    for (const p of communs) {
      const q = L3.find((x) => x.bon === p.bon && x.sku === p.sku);
      if (p.logiciel !== q.logiciel || p.trouve !== q.trouve || p.preparateur !== q.preparateur || p.qty !== q.qty) throw new Error(`${p.bon} ${p.sku} diffère d'ENT-2.3`);
      // Les deux séances s'ouvrent « aujourd'hui » : ce qui date de J-9 en ENT-2.3 date de J-7 ici.
      if (Math.abs((p.ts - q.ts) - 2 * 864e5) > 3600e3 * 2) throw new Error(`${p.bon} : décalage ≠ 2 jours`);
    }
    for (const b of ['BP-732226', 'BP-732233', 'BP-732239']) if (L2.some((p) => p.bon === b)) throw new Error(b + ' est déjà là');
    const o = d2.orders.find((x) => x.no === 'CMD-732153');
    if (!o || !o.annulee) throw new Error('CMD-732153 doit être annulée ici aussi');
  });

  await v('ENT-2.2 : sans travail, rien n\'est acquis ; le classeur juste et la bonne liste donnent 5/5', async () => {
    const db = ouvrirC();
    if (Object.values(stC(db)).some((x) => x !== 'attente')) throw new Error('avant travail : ' + JSON.stringify(stC(db)));
    exporterC(db);
    const res = deposerC(db);
    if (res.some((r) => !r.ok)) throw new Error('classeur juste refusé : ' + res.map((r) => `${r.id} ${r.justes}/${r.total} ${r.remarques[0] || ''}`).join(' ; '));
    if (res.map((r) => `${r.justes}/${r.total}`).join(' ') !== '30/30 30/30 8/8') throw new Error('totaux : ' + res.map((r) => `${r.justes}/${r.total}`).join(' '));
    repondre(db, 'À recompter : CHG-20W, CAB-USBC-1M, BAT-10K, COQ-UNI-01'); declencher(S2, db);
    if (Object.values(stC(db)).some((x) => x !== 'ok')) throw new Error('5/5 attendu : ' + JSON.stringify(stC(db)));
    const accuse = db.mails.filter((m) => m.subject === 'Vos références à recompter');
    if (accuse.length !== 1 || !/Merci, c'est noté\. Je demande à l'équipe inventaire de passer dans l'allée A : vous ferez le recomptage\./.test(accuse[0].text)) throw new Error('accusé de Nadia');
  });

  await v('ENT-2.2 : la liste — sans BAT : ko ; avec ECO en plus : ko ; amorce vide : attente, et Nadia ne répond pas', async () => {
    const base = () => { const db = exporterC(ouvrirC()); deposerC(db); return db; };
    let db = base(); repondre(db, 'À recompter : CHG-20W, CAB-USBC-1M, COQ-UNI-01'); declencher(S2, db);
    if (stC(db).liste !== 'ko') throw new Error('sans BAT : ' + stC(db).liste);
    db = base(); repondre(db, 'À recompter : CHG-20W, CAB-USBC-1M, BAT-10K, COQ-UNI-01, ECO-BT-01'); declencher(S2, db);
    if (stC(db).liste !== 'ko') throw new Error('avec ECO : ' + stC(db).liste);
    db = base(); repondre(db, 'À recompter : '); declencher(S2, db);
    if (stC(db).liste !== 'attente' || db.mails.some((m) => m.subject === 'Vos références à recompter')) throw new Error('amorce vide');
    db = base(); repondre(db, 'À recompter : CHG-20W'); repondre(db, 'À recompter : chg-20w, cab usbc 1m, bat10k, COQ-UNI-01'); declencher(S2, db);
    if (stC(db).liste !== 'ok') throw new Error('seconde liste juste : ' + stC(db).liste);
  });

  await v('ENT-2.2 : une erreur ne se paie qu\'une fois — synthèse déposée fausse (BAT à 0) + liste sans BAT : synthèse ko, liste ok', async () => {
    const db = exporterC(ouvrirC());
    deposerC(db, { syn: { 'BAT-10K': 0 } });
    repondre(db, 'À recompter : CAB-USBC-1M, CHG-20W, COQ-UNI-01'); declencher(S2, db);
    const st = stC(db);
    if (st.synthese !== 'ko' || st.liste !== 'ok') throw new Error(JSON.stringify(st));
    const db2 = exporterC(ouvrirC());
    deposerC(db2, { syn: { 'BAT-10K': 0 } });
    repondre(db2, 'À recompter : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01'); declencher(S2, db2);
    if (stC(db2).liste !== 'ko') throw new Error('liste vraie contre une synthèse fausse : ' + stC(db2).liste);
  });

  await v('ENT-2.2 : un écart tapé sans formule ne valide pas le jalon 2 ; une autre fonction que SI ne valide pas le 3', async () => {
    const db = exporterC(ouvrirC());
    deposerC(db, { tape: true });
    if (stC(db).ecart !== 'ko' || stC(db).si !== 'ok') throw new Error('tapé : ' + JSON.stringify(stC(db)));
    const db2 = exporterC(ouvrirC());
    deposerC(db2, { sansSi: true });
    if (stC(db2).si !== 'ko' || stC(db2).ecart !== 'ok') throw new Error('sans SI : ' + JSON.stringify(stC(db2)));
    deposerC(db2);
    if (stC(db2).si !== 'ok') throw new Error('redépôt juste non retenu');
  });

  await v('ENT-2.2 : à l\'écran — Extractions, critères déjà réglés (niveau 1) : Exporter (30 lignes), déposer dans Fichiers (retour détaillé), écrire à Nadia, 5/5', async () => {
    const ctx2 = await nav.newContext({ acceptDownloads: true });
    const p = await ctx2.newPage();
    p.setDefaultTimeout(6000);
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) errs.push(m.text()); });
    try {
      await p.goto(new URL('/', page.url()).toString());
      await p.waitForSelector('#btnProf', { timeout: 8000 });
      await p.evaluate(async () => {
        const mod = await import('/activites/cdiscount-chiffres.js');
        const hote = document.createElement('div'); hote.id = 'hote2'; document.body.appendChild(hote);
        const db = {};
        window.__c22 = { db, scores: [] };
        mod.rendre(hote, { meta: mod.meta, profil: { prenom: 'Léa', nom: 'Test', role: 'eleve' }, codeStock: 'STOCK24',
          jeu: { etat: () => db, sauver() {} }, enregistrer(x) { window.__c22.scores.push(x); }, quitter() {} });
      });
      const Z = '#hote2 .ent-main';
      const aller = async (vue) => { await p.click(`#hote2 .ent-nav[data-vue="${vue}"]`); await navOn(p, '#hote2', vue); };
      if (await p.$(`#hote2 .ent-nav[data-vue="commandes"]`) && (await aller('commandes'), await p.$(`${Z} [data-exporter]`))) throw new Error('un bouton Exporter reste sur Commandes');
      await aller('extractions');
      // Niveau 1 : les critères de la demande sont déjà réglés.
      if (await p.inputValue(`${Z} [data-filtre="allee"]`) !== 'A' || await p.inputValue(`${Z} [data-filtre="periode"]`) !== '30j') throw new Error('critères non préréglés');
      if (!/30 lignes/.test(await p.textContent(`${Z} [data-ext-compte]`))) throw new Error('compte à l\'écran : ' + await p.textContent(`${Z} [data-ext-compte]`));
      const [dl] = await Promise.all([p.waitForEvent('download'), p.click(`${Z} [data-exporter="preparations"]`)]);
      if (dl.suggestedFilename() !== 'cdiscount-lignes-de-preparation.xlsx') throw new Error('nom : ' + dl.suggestedFilename());
      const wb = XL.read(fs.readFileSync(await dl.path()), { type: 'buffer' });
      const n = XL.utils.sheet_to_json(wb.Sheets['Préparations']).length;
      if (n !== 30) throw new Error(`${n} lignes exportées`);
      const db = await p.evaluate(() => JSON.parse(JSON.stringify(window.__c22.db)));
      await aller('fichiers');
      await p.setInputFiles('#fichierTableur', { name: 'analyse.xlsx', mimeType: 'application/octet-stream', buffer: classeurC(db, { tape: true }) });
      await texteVu(p, Z, /38 résultats justes sur 68/);
      const t = (await p.textContent(Z)).replace(/\s+/g, ' ');
      if (!/38 résultats justes sur 68/.test(t) || !/la cellule contient un nombre tapé, pas une formule/.test(t)) throw new Error('retour guidé : ' + t.slice(0, 400));
      await p.setInputFiles('#fichierTableur', { name: 'analyse.xlsx', mimeType: 'application/octet-stream', buffer: classeurC(db) });
      await texteVu(p, Z, /68 résultats justes sur 68/);
      if (!/68 résultats justes sur 68/.test((await p.textContent(Z)).replace(/\s+/g, ' '))) throw new Error('redépôt juste');
      if (!await p.$(`${Z} [data-depot-export="ok"]`)) throw new Error('retour sur l\'export absent');
      await p.click('#hote2 [data-aide-tableur]');
      const aide = await p.textContent('#hote2 [data-aide-tableur-texte]');
      if (!/SI\(test ; si vrai ; si faux\)/.test(aide)) throw new Error('rappel du bandeau');
      // Retour de Tristan (04/10) : les guillemets, la cellule A1, le format texte.
      if (!/entre guillemets : =NB\.SI\(G:G;"Casse"\)/.test(aide) || !/=NB\.SI\(G:G;A1\)/.test(aide) || !/format texte/.test(aide)) throw new Error('rappel des guillemets : ' + aide);
      await aller('mail');
      await p.click(`${Z} .ent-mitem >> text=Allée A : ce que disent les chiffres`);
      await p.click(`${Z} [data-repondre]`);
      if (await p.inputValue(`${Z} #repT`) !== 'À recompter : ') throw new Error('amorce');
      await p.fill(`${Z} #repT`, 'À recompter : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01');
      await p.click(`${Z} #formRep button[type="submit"]`); await p.waitForTimeout(150);
      const fin = await p.evaluate(() => JSON.parse(JSON.stringify(window.__c22.db)));
      if (Object.values(stC(fin)).some((x) => x !== 'ok')) throw new Error('jalons : ' + JSON.stringify(stC(fin)));
      const dernier = await p.evaluate(() => window.__c22.scores[window.__c22.scores.length - 1]);
      if (!dernier || dernier.score !== 5 || dernier.max !== 5) throw new Error('score : ' + JSON.stringify(dernier));
      if (/confirm|standard|niveau/i.test(await p.textContent('#hote2'))) throw new Error('le niveau se lit à l\'écran');
      if (errs.length) throw new Error(errs.join(' | '));
    } finally { await ctx2.close(); }
  });

  /* ================================================================================
   * ENT-2.4 recadrée (04/10/2026, C7) : l'export des ajustements du mois, SI et NB.SI, le vendeur.
   * Valeurs À LA MAIN : 20 lignes (30 en confirmé), une seule sans document (AJ-26-0217, les
   * mixeurs), comptes par motif 7 / 5 / 3 / 5 (10 / 8 / 5 / 7 en confirmé).
   * ============================================================================== */
  const exportA = (db) => GT.construireExport(S23.TABLEUR.exports[0], db, {});
  const classeurA = (db, o = {}) => {
    const ex = exportA(db);
    const F = ex.feuilles[0];
    const c = Object.fromEntries(F.colonnes.map((x, i) => [x, i]));
    const n = F.colonnes.length, J = XL.utils.encode_col(n), H = XL.utils.encode_col(c.Document), G = XL.utils.encode_col(c.Motif);
    const ws = XL.utils.aoa_to_sheet([[...F.colonnes, 'À vérifier'], ...F.lignes.map((l) => l.map((x) => (x === null ? '' : x)))]);
    F.lignes.forEach((l, k) => {
      const r = k + 2, v = l[c.Document] ? '' : 'À VÉRIFIER';
      ws[J + r] = o.tape ? (v ? { t: 's', v } : undefined) : { t: 's', v, f: `IF(${H}${r}="","À VÉRIFIER","")` };
      if (!ws[J + r]) delete ws[J + r];
    });
    ws['!ref'] = `A1:${J}${F.lignes.length + 1}`;
    const motifs = Object.entries(o.syn || S23.parMotif(db));
    const ws2 = XL.utils.aoa_to_sheet([['Motif', 'Nombre'], ...motifs]);
    motifs.forEach((m, k) => { ws2['B' + (k + 2)] = { t: 'n', v: m[1], f: `COUNTIF(Mouvements!${G}:${G},A${k + 2})` }; });
    const wb = XL.utils.book_new();
    XL.utils.book_append_sheet(wb, ws, 'Mouvements');
    XL.utils.book_append_sheet(wb, ws2, 'Synthèse');
    return XL.write(wb, { bookType: 'xlsx', type: 'buffer' });
  };
  const deposerA = (db, o) => {
    const res = GT.controlerDepot(XL.read(classeurA(db, o), { type: 'buffer', cellFormula: true }), S23.controles(db), exportA(db).propres);
    GT.enregistrerDepot(db, S23.ID_DEPOT, res, { retour: 'entrainement', fichier: 'x.xlsx' });
    return res;
  };
  const stA = (db) => Object.fromEntries(S23.ETAPES.map((e) => [e.id, e.verifier(db).status]));

  await v('ENT-2.4 : export des ajustements du mois — 20 lignes, une seule sans document (AJ-26-0217, les mixeurs), 7 / 5 / 3 / 5 par motif', async () => {
    const db = ouvrir(S23);
    const F = exportA(db).feuilles[0];
    if (F.colonnes.join('|') !== 'Date|Type|N° mouvement|Référence|Désignation|Allée|Quantité|Motif|Document|Saisi par') throw new Error('colonnes');
    if (F.lignes.length !== 20) throw new Error(`${F.lignes.length} lignes au lieu de 20`);
    if (F.lignes.some((l) => l[1] !== 'Ajustement inventaire')) throw new Error('la demande ne contient que des ajustements');
    const sans = F.lignes.filter((l) => !l[8]);
    if (sans.length !== 1 || sans[0][2] !== 'AJ-26-0217' || sans[0][3] !== 'MIX-PLG' || sans[0][6] !== -4 || sans[0][7] !== 'Démarque inconnue') throw new Error('sans document : ' + JSON.stringify(sans));
    const grp = F.lignes.find((l) => l[3] === 'GRP-2F' && l[2] === 'AJ-26-0219');
    if (!grp || grp[8] !== 'DEM-26-0036' || grp[7] !== 'Casse') throw new Error('grille-pain : ' + JSON.stringify(grp));
    if (JSON.stringify(S23.parMotif(db)) !== JSON.stringify({ Casse: 7, 'Erreur de prélèvement': 5, 'Erreur de réception': 3, 'Démarque inconnue': 5 })) throw new Error('par motif : ' + JSON.stringify(S23.parMotif(db)));
    if (new Set(F.lignes.map((l) => l[5])).size !== 3) throw new Error('tout l\'entrepôt : allées ' + [...new Set(F.lignes.map((l) => l[5]))].join());
    // Rien de l'historique ne contredit la base : aucune ligne de l'allée B après le dernier inventaire, hors celles de Samir.
    const depuis = S23.dateInventaire(db.moves[db.moves.length - 1].ts);
    const bApres = F.lignes.filter((l) => l[5] === 'B' && l[0] >= depuis && !['AJ-26-0217', 'AJ-26-0219'].includes(l[2]));
    if (bApres.length) throw new Error('ajustement de l\'allée B absent des mouvements : ' + bApres.map((l) => l[2]).join());
    for (let i = 1; i < F.lignes.length; i++) if (F.lignes[i][0] < F.lignes[i - 1][0]) throw new Error('lignes dans le désordre');
  });

  await v('ENT-2.4 : confirmé — 30 ajustements, toujours une seule ligne sans document, 10 / 8 / 5 / 7 par motif', async () => {
    const db = ouvrir(S23, 'Léa', 'confirme');
    const F = exportA(db).feuilles[0];
    if (F.lignes.length !== 30) throw new Error(`${F.lignes.length} lignes au lieu de 30`);
    if (F.lignes.filter((l) => !l[8]).map((l) => l[2]).join() !== 'AJ-26-0217') throw new Error('sans document');
    if (JSON.stringify(S23.parMotif(db)) !== JSON.stringify({ Casse: 10, 'Erreur de prélèvement': 8, 'Erreur de réception': 5, 'Démarque inconnue': 7 })) throw new Error('par motif : ' + JSON.stringify(S23.parMotif(db)));
    if (JSON.stringify(ouvrir(S23, 'Léa', 'confirme').mails.map((m) => m.text)) !== JSON.stringify(ouvrir(S23).mails.map((m) => m.text))) throw new Error('les messages trahissent le niveau');
  });

  await v('ENT-2.4 : le classeur juste valide les deux jalons tableur ; « À VÉRIFIER » tapé sans formule ne valide pas ; synthèse fausse : ko ; l\'enquête n\'en dépend pas', async () => {
    const db = ouvrir(S23);
    if (stA(db).averifier !== 'attente' || stA(db).parmotif !== 'attente') throw new Error('sans dépôt : ' + JSON.stringify(stA(db)));
    const res = deposerA(db);
    if (res.map((r) => `${r.justes}/${r.total}`).join(' ') !== '20/20 4/4') throw new Error('totaux : ' + res.map((r) => `${r.justes}/${r.total} ${r.remarques[0] || ''}`).join(' ; '));
    if (stA(db).averifier !== 'ok' || stA(db).parmotif !== 'ok') throw new Error(JSON.stringify(stA(db)));
    const tape = ouvrir(S23); deposerA(tape, { tape: true });
    if (stA(tape).averifier !== 'ko') throw new Error('tapé : ' + stA(tape).averifier);
    const faux = ouvrir(S23); deposerA(faux, { syn: { Casse: 7, 'Erreur de prélèvement': 5, 'Erreur de réception': 3, 'Démarque inconnue': 4 } });
    if (stA(faux).parmotif !== 'ko') throw new Error('synthèse fausse : ' + stA(faux).parmotif);
    // Sans tableur, l'enquête juste donne quand même ses six jalons.
    const enq = ouvrir(S23); repondre(enq, JUSTE_23);
    const st = stA(enq);
    if (['ajustements', 'reception', 'quantites', 'valeur', 'motif', 'suite'].some((k) => st[k] !== 'ok') || st.averifier !== 'attente') throw new Error(JSON.stringify(st));
  });

  await v('ENT-2.4 : le vendeur de la place de marché (fictif, annoncé) pointe la même réception ; RECHERCHEV n\'existe nulle part dans la séance', async () => {
    const db = ouvrir(S23);
    const m = db.mails.find((x) => x.subject === 'TR : Stock affiché — Bassin Cuisine');
    if (!m || !/Julien Mounet, Bassin Cuisine \(vendeur de la place de marché\)/.test(m.text)) throw new Error('message du vendeur');
    if (!/livré 12 pour mon compte/.test(m.text) || !/n'en affiche plus que 8/.test(m.text) || !/Où sont passés mes 4 mixeurs \?/.test(m.text)) throw new Error('texte du vendeur');
    if (!/fictifs, inventés pour l'exercice/.test(m.text)) throw new Error('le vendeur n\'est pas annoncé fictif');
    const rec = new Date(db.receptions.find((r) => r.no === 'REC-26-0447').ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    if (!m.text.includes(`le ${rec}`)) throw new Error('date de la réception absente du message : ' + rec);
    if (!/^.*\.example>/m.test(m.text)) throw new Error('adresse du vendeur hors .example');
    const mission = db.mails.find((x) => /Ajustements de la semaine/.test(x.subject));
    // Niveau 2 : la mission donne les critères en clair.
    if (!/Commencez par le tableur : dans Extractions, liste « Mouvements de stock », exportez les ajustements du mois avec ces critères : Type de mouvement « Ajustement inventaire », Allée « Toutes », Période « 30 derniers jours »\./.test(mission.text)) throw new Error('mission sans le tableur');
    for (const f of ['activites/cdiscount-regularise.js', 'contenus/cdiscount-regularise.js']) {
      if (/VLOOKUP|RECHERCHEV/i.test(fs.readFileSync(path.join(ROOT, f), 'utf8'))) throw new Error('RECHERCHEV dans ' + f);
    }
    if (S23.controles(db).some((c) => (c.fonctions || []).some((x) => /VLOOKUP/.test(x)))) throw new Error('RECHERCHEV exigée');
  });

  await v('ENT-2.4 : à l\'écran — Extractions (niveau 2) : critères du logiciel au départ, export faux puis juste, dépôt : « n résultats justes sur m » et ce qui cloche dans l\'export', async () => {
    const ctx2 = await nav.newContext({ acceptDownloads: true });
    const p = await ctx2.newPage();
    p.setDefaultTimeout(6000);
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) errs.push(m.text()); });
    try {
      await p.goto(new URL('/', page.url()).toString());
      await p.waitForSelector('#btnProf', { timeout: 8000 });
      await p.evaluate(async () => {
        const mod = await import('/activites/cdiscount-regularise.js');
        const hote = document.createElement('div'); hote.id = 'hote4'; document.body.appendChild(hote);
        const db = {};
        window.__c24 = { db };
        mod.rendre(hote, { meta: mod.meta, profil: { prenom: 'Léa', nom: 'Test', role: 'eleve' }, codeStock: 'STOCK24',
          jeu: { etat: () => db, sauver() {} }, enregistrer() {}, quitter() {} });
      });
      const Z = '#hote4 .ent-main';
      const aller = async (vue) => { await p.click(`#hote4 .ent-nav[data-vue="${vue}"]`); await navOn(p, '#hote4', vue); };
      await aller('extractions');
      const compte = async () => Number((await p.textContent(`${Z} [data-ext-compte]`)).match(/\d+/)[0]);
      // Niveau 2 : les critères du logiciel (tous les types, 7 derniers jours), pas ceux de la demande.
      if (await p.inputValue(`${Z} [data-filtre="type"]`) !== '*' || await p.inputValue(`${Z} [data-filtre="periode"]`) !== '7j') throw new Error('critères de départ');
      // Un export faux (tous les types, 7 jours), déposé : le retour dit ce qui cloche dans l'export.
      await Promise.all([p.waitForEvent('download'), p.click(`${Z} [data-exporter="ajustements"]`)]);
      let db = await p.evaluate(() => JSON.parse(JSON.stringify(window.__c24.db)));
      await aller('fichiers');
      const exF = GT.construireExport(S23.TABLEUR.exports[0], db, { criteres: db.tableur.criteres ? db.tableur.criteres.ajustements : GT.criteresDepart(S23.TABLEUR.exports[0], db) });
      if (!exF.propres.length) throw new Error('export faux vide');
      await p.setInputFiles('#fichierTableur', { name: 'faux.xlsx', mimeType: 'application/octet-stream', buffer: classeurA(db, {}) });
      await texteVu(p, `${Z} [data-depot-export]`, /en trop/);
      const tf = (await p.textContent(`${Z} [data-depot-export]`)).replace(/\s+/g, ' ');
      if (!/lignes? en trop : leur « Type de mouvement » ne correspond pas à la demande/.test(tf) || !/Il manque \d+ lignes demandées : vérifiez « Période »\./.test(tf)) throw new Error('retour export niveau 2 : ' + tf);
      if (/choisissez/.test(tf)) throw new Error('le niveau 2 donne le critère à choisir');
      // Les bons critères : le tableau se filtre, le compte suit, les critères restent dans la base.
      await aller('extractions');
      await p.selectOption(`${Z} [data-filtre="type"]`, 'Ajustement inventaire'); await p.waitForTimeout(60);
      await p.selectOption(`${Z} [data-filtre="periode"]`, '30j'); await p.waitForTimeout(60);
      if (await compte() !== 20) throw new Error('compte : ' + await compte());
      if (await p.evaluate(() => window.__c24.db.tableur.criteres.ajustements.periode) !== '30j') throw new Error('critères non rangés dans la base');
      const [dl] = await Promise.all([p.waitForEvent('download'), p.click(`${Z} [data-exporter="ajustements"]`)]);
      if (dl.suggestedFilename() !== 'cdiscount-mouvements-de-stock.xlsx') throw new Error('nom : ' + dl.suggestedFilename());
      const wb = XL.read(fs.readFileSync(await dl.path()), { type: 'buffer' });
      if (XL.utils.sheet_to_json(wb.Sheets.Mouvements).length !== 20) throw new Error('lignes exportées');
      if (wb.SheetNames.join() !== 'Mouvements,Synthèse') throw new Error('feuilles : ' + wb.SheetNames.join());
      db = await p.evaluate(() => JSON.parse(JSON.stringify(window.__c24.db)));
      await aller('fichiers');
      await p.setInputFiles('#fichierTableur', { name: 'ajustements.xlsx', mimeType: 'application/octet-stream', buffer: classeurA(db, { tape: true }) });
      await p.waitForSelector(`${Z} [data-depot-export="ok"]`, { timeout: 4000 }).catch(() => {});
      if (!await p.$(`${Z} [data-depot-export="ok"]`)) throw new Error('export juste non reconnu');
      const t = (await p.textContent(Z)).replace(/\s+/g, ' ');
      // « À VÉRIFIER » tapé, sans formule : la colonne est fausse partout (0 / 20), la synthèse juste (4 / 4).
      if (!/4 résultats justes sur 24\./.test(t)) throw new Error('retour : ' + (await p.textContent('[data-depot-retour]')));
      if (/AJ-26-0217|nombre tapé|valeur tapée|À vérifier »/.test(t)) throw new Error('détail montré en entraînement : ' + t.slice(0, 400));
      if (errs.length) throw new Error(errs.join(' | '));
    } finally { await ctx2.close(); }
  });

  /* ================================================================================
   * ENT-2.6 « Cinq recomptages, pas un de plus » (bonus) — ajouté le 04/10/2026, C9.
   * Valeurs À LA MAIN : lignes brutes et nettoyées, les 8 références à écart, leurs constats depuis
   * le dernier inventaire et leur valeur, le top 5 par valeur et par fréquence, BAT-10K hors des
   * cinq avec la date et dedans sans. Le classeur de l'élève est fabriqué ici : il NETTOIE l'export
   * (vides, doublons, dates en texte), puis écrit Écart, SI(ET), NB.SI.ENS, RECHERCHEV.
   * ============================================================================== */
  const S6 = await imp('contenus/cdiscount-priorites.js');
  const ouvrir6 = (aisance) => {
    const db = ouvrir(S6, 'Léa', aisance);
    return db;
  };
  const GRAINE6 = GT.graineExport('eleve-test', 'cdiscount-priorites', 'preparations');
  const export6 = (db, graine = GRAINE6) => GT.construireExport(S6.TABLEUR.exports[0], db, { graine });
  const CONSTATS_26 = { 'CAB-USBC-1M': 7, 'CHG-20W': 4, 'ECO-BT-01': 2, 'SOU-SF-02': 0, 'BAT-10K': 0, 'CLE-64G': 0, 'AMP-LED-E27': 0,
    'COQ-UNI-01': 0, 'CAS-FIL-01': 0, 'SUP-VOIT': 5, 'CLA-SF-01': 3, 'HUB-USB-4': 0, 'MUL-4P': 0, 'PIL-AA-8': 8, 'VEI-LED': 0,
    'BOU-17L': 2, 'GRP-2F': 0, 'MIX-PLG': 2 };
  const VALEURS_26 = { 'CAB-USBC-1M': 4.9, 'CHG-20W': -29.7, 'ECO-BT-01': -59.7, 'SUP-VOIT': -9.6, 'CLA-SF-01': -28.4, 'PIL-AA-8': -6.2,
    'BOU-17L': -27.8, 'MIX-PLG': 25.2 };
  const TOP_VALEUR = ['ECO-BT-01', 'CHG-20W', 'CLA-SF-01', 'BOU-17L', 'MIX-PLG'];
  const TOP_FREQUENCE = ['PIL-AA-8', 'CAB-USBC-1M', 'SUP-VOIT', 'CHG-20W', 'CLA-SF-01'];
  // Le classeur de l'élève. `o.sale` : il ne nettoie pas ; `o.nbsi` : NB.SI au lieu de NB.SI.ENS ;
  // `o.sansDate` : il oublie le critère de date.
  const classeur6 = (db, o = {}) => {
    const ex = export6(db);
    const F = ex.feuilles[0];
    const c = Object.fromEntries(F.colonnes.map((x, i) => [x, i]));
    const versDate = (v) => { if (typeof v !== 'string') return v; const [j, m, a] = v.split('/').map(Number); return new Date(a, m - 1, j, 12).getTime(); };
    let L = F.lignes;
    if (!o.sale) {
      const vu = new Set();
      L = L.filter((l) => l.some((x) => x !== null)).filter((l) => { const k = l.join('|'); if (vu.has(k)) return false; vu.add(k); return true; })
        .map((l) => l.map((x, i) => (i === c.Date ? versDate(x) : x)));
    }
    const tInv = new Date(new Date(db.moves.find((m) => m.type === 'Ajustement inventaire').ts).setHours(0, 0, 0, 0));
    const dateOk = (l) => typeof l[c.Date] === 'number' && l[c.Date] >= tInv.getTime();
    const n = F.colonnes.length, K = XL.utils.encode_col(n), Lc = XL.utils.encode_col(n + 1), M = XL.utils.encode_col(n + 2);
    const aoa = [[...F.colonnes, 'Écart', 'Réf. en écart', 'Écart retenu'], ...L.map((l) => l.map((x, i) => (x === null ? null : i === c.Date && typeof x === 'number' ? new Date(x) : x)))];
    const ws = XL.utils.aoa_to_sheet(aoa, { cellDates: true });
    const enEcart = [];
    L.forEach((l, k) => {
      if (l.every((x) => x === null)) return;
      const r = k + 2, ec = l[c['Stock trouvé']] - l[c['Stock logiciel']];
      const retenu = ec !== 0 && (o.sansDate || dateOk(l));
      ws[K + r] = { t: 'n', v: ec, f: `I${r}-H${r}` };
      ws[Lc + r] = { t: 's', v: retenu ? l[c['Référence']] : '', f: `IF(AND(${K}${r}<>0,A${r}>=DATE(${tInv.getFullYear()},${tInv.getMonth() + 1},${tInv.getDate()})),D${r},"")` };
      ws[M + r] = { t: 'n', v: ec, f: `${K}${r}` };
      if (retenu) enEcart.push([l[c['Référence']], ec]);
    });
    ws['!ref'] = `A1:${M}${L.length + 1}`;
    const refs = ex.feuilles[2].lignes.map((l) => l[0]);
    const cout = Object.fromEntries(ex.feuilles[1].lignes.map((l) => [l[0], l[2]]));
    const syn = refs.map((r) => {
      const nb = enEcart.filter(([x]) => x === r).length;
      const e = (enEcart.find(([x]) => x === r) || [r, 0])[1];
      return [r, nb, e, cout[r], Math.round(e * cout[r] * 100) / 100];
    });
    const ws2 = XL.utils.aoa_to_sheet([['Référence', 'Constats', 'Écart', 'Coût', 'Valeur de l’écart'], ...syn]);
    syn.forEach((x, k) => {
      const r = k + 2;
      ws2['B' + r] = { t: 'n', v: x[1], f: o.nbsi ? `COUNTIF(Préparations!${Lc}:${Lc},A${r})` : `COUNTIFS(Préparations!D:D,A${r},Préparations!${K}:${K},"<>0",Préparations!A:A,">="&DATE(2026,1,1))` };
      ws2['C' + r] = { t: 'n', v: x[2], f: `IFERROR(VLOOKUP(A${r},Préparations!${Lc}:${M},2,FALSE),0)` };
      ws2['D' + r] = { t: 'n', v: x[3], f: `VLOOKUP(A${r},Tarifs!A:C,3,FALSE)` };
      ws2['E' + r] = { t: 'n', v: x[4], f: `C${r}*D${r}` };
    });
    const wb = XL.utils.book_new();
    XL.utils.book_append_sheet(wb, ws, 'Préparations');
    XL.utils.book_append_sheet(wb, XL.utils.aoa_to_sheet([['Référence', 'Désignation', 'Coût unitaire'], ...ex.feuilles[1].lignes]), 'Tarifs');
    XL.utils.book_append_sheet(wb, ws2, 'Synthèse');
    return XL.write(wb, { bookType: 'xlsx', type: 'buffer' });
  };
  const deposer6 = (db, o) => {
    { const e = S6.TABLEUR.exports[0]; GT.enregistrerExport(db, e, GT.criteresJustes(e, db), 0); }
    const res = GT.controlerDepot(XL.read(classeur6(db, o), { type: 'buffer', cellFormula: true }), S6.controles(db), export6(db).propres);
    GT.enregistrerDepot(db, S6.ID_DEPOT, res, { retour: 'entrainement', fichier: 'x.xlsx' });
    return res;
  };
  const st6 = (db) => Object.fromEntries(S6.ETAPES.map((e) => [e.id, e.verifier(db).status]));

  await v('ENT-2.6 : 151 lignes propres, 158 brutes (4 vides, 3 doublons, 5 dates en texte, dont 1 doublon et 3 dates sur des constats d\'après l\'inventaire)', async () => {
    const db = ouvrir6();
    const ex = export6(db);
    if (ex.propres.length !== 151) throw new Error(`${ex.propres.length} lignes propres`);
    const L = ex.feuilles[0].lignes;
    if (L.length !== 158) throw new Error(`${L.length} lignes brutes`);
    if (L.filter((l) => l.every((x) => x === null)).length !== 4) throw new Error('vides');
    const tInv = new Date(db.moves.find((m) => m.type === 'Ajustement inventaire').ts).setHours(0, 0, 0, 0);
    const textes = L.filter((l) => typeof l[0] === 'string');
    if (textes.length !== 5) throw new Error('dates en texte : ' + textes.length);
    const surConstat = (l) => l[8] !== l[7] && (typeof l[0] === 'number' ? l[0] >= tInv : true);
    if (textes.filter((l) => l[8] !== l[7]).length < 3) throw new Error('dates en texte sur des constats : ' + textes.filter((l) => l[8] !== l[7]).length);
    const cles = L.filter((l) => l[1]).map((l) => l.join('|'));
    const dbl = L.filter((l) => l[1] && cles.filter((k) => k === l.join('|')).length > 1);
    if (cles.length - new Set(cles).size !== 3 || !dbl.some(surConstat)) throw new Error('doublons');
    // Même élève, même fichier ; un autre élève, d'autres positions.
    if (JSON.stringify(export6(db).feuilles) !== JSON.stringify(ex.feuilles)) throw new Error('salissures non déterministes');
    if (JSON.stringify(export6(db, 'autre').feuilles[0].lignes) === JSON.stringify(L)) throw new Error('deux élèves, même fichier');
    if (ex.feuilles.map((f) => f.nom).join() !== 'Préparations,Tarifs,Synthèse' || ex.feuilles[2].lignes.length !== 18) throw new Error('feuilles');
    if (ex.feuilles[1].lignes.find((l) => l[0] === 'BAT-10K')[2] !== 24.9) throw new Error('tarif de BAT-10K');
  });

  await v('ENT-2.6 : constats depuis l\'inventaire, valeurs, top 5 par valeur ≠ top 5 par fréquence ; BAT-10K hors des cinq avec la date, dedans sans', async () => {
    const db = ouvrir6();
    if (JSON.stringify(S6.constats(db)) !== JSON.stringify(CONSTATS_26)) throw new Error('constats : ' + JSON.stringify(S6.constats(db)));
    const v = S6.valeurs(db);
    for (const [r, x] of Object.entries(VALEURS_26)) if (v[r] !== x) throw new Error(`${r} : ${v[r]} au lieu de ${x}`);
    if (Object.entries(v).filter(([, x]) => x !== 0).length !== 8) throw new Error('huit références à écart');
    if (S6.top5Valeur(db).join() !== TOP_VALEUR.join()) throw new Error('top valeur : ' + S6.top5Valeur(db));
    if (S6.top5Frequence(db).join() !== TOP_FREQUENCE.join()) throw new Error('top fréquence : ' + S6.top5Frequence(db));
    if (TOP_VALEUR.filter((r) => !TOP_FREQUENCE.includes(r)).length < 2) throw new Error('piège de la fréquence');
    if (S6.constats(db, { depuisInventaire: false })['BAT-10K'] !== 5) throw new Error('BAT avant l\'inventaire');
    if (!S6.top5Valeur(db, { depuisInventaire: false }).includes('BAT-10K')) throw new Error('piège de la date : BAT-10K devrait entrer sans le critère');
  });

  await v('ENT-2.6 : confirmé — 223 lignes, salissures 6 / 5 / 8, mêmes pièges', async () => {
    const db = ouvrir6('confirme');
    const ex = export6(db);
    if (ex.propres.length !== 223 || ex.feuilles[0].lignes.length !== 234) throw new Error(`${ex.propres.length} / ${ex.feuilles[0].lignes.length}`);
    if (ex.feuilles[0].lignes.filter((l) => typeof l[0] === 'string').length !== 8) throw new Error('dates en texte');
    if (JSON.stringify(S6.constats(db)) !== JSON.stringify({ ...CONSTATS_26, 'CAB-USBC-1M': 9, 'CHG-20W': 7, 'ECO-BT-01': 4, 'SUP-VOIT': 7, 'CLA-SF-01': 6, 'PIL-AA-8': 9, 'BOU-17L': 4, 'MIX-PLG': 3 })) throw new Error('constats : ' + JSON.stringify(S6.constats(db)));
    if (S6.top5Valeur(db).join() !== TOP_VALEUR.join()) throw new Error('top valeur');
    if (TOP_VALEUR.filter((r) => !S6.top5Frequence(db).includes(r)).length < 2) throw new Error('piège de la fréquence');
    if (!S6.top5Valeur(db, { depuisInventaire: false }).includes('BAT-10K') || S6.constats(db)['BAT-10K'] !== 0) throw new Error('piège de la date');
  });

  await v('ENT-2.6 : le classeur juste et les cinq bonnes références → 4/4 ; sans travail, rien', async () => {
    const db = ouvrir6();
    if (Object.values(st6(db)).some((x) => x !== 'attente')) throw new Error('avant travail : ' + JSON.stringify(st6(db)));
    const res = deposer6(db);
    if (res.some((r) => !r.ok)) throw new Error(res.map((r) => `${r.id} ${r.justes}/${r.total} ${r.remarques[0] || ''}`).join(' ; '));
    repondre(db, 'À recompter : ECO-BT-01, CHG-20W, CLA-SF-01, BOU-17L, MIX-PLG'); declencher(S6, db);
    if (Object.values(st6(db)).some((x) => x !== 'ok')) throw new Error(JSON.stringify(st6(db)));
    if (!db.mails.some((m) => m.subject === 'Les cinq recomptages' && /Merci\. Je lance les cinq recomptages\./.test(m.text))) throw new Error('accusé de Nadia');
  });

  await v('ENT-2.6 : erreurs — synthèse sur l\'export non nettoyé : jalons 1 et 2 ko ; NB.SI au lieu de NB.SI.ENS : 2 ko ; top 5 par fréquence : 4 ko ; date oubliée : BAT-10K et ko', async () => {
    const sale = ouvrir6(); deposer6(sale, { sale: true });
    if (st6(sale).nettoye !== 'ko' || st6(sale).constats !== 'ko') throw new Error('sale : ' + JSON.stringify(st6(sale)));
    const nbsi = ouvrir6(); deposer6(nbsi, { nbsi: true });
    if (st6(nbsi).constats !== 'ko' || st6(nbsi).nettoye !== 'ok') throw new Error('NB.SI : ' + JSON.stringify(st6(nbsi)));
    const freq = ouvrir6(); deposer6(freq); repondre(freq, 'À recompter : ' + TOP_FREQUENCE.join(', ')); declencher(S6, freq);
    if (st6(freq).cinq !== 'ko') throw new Error('top fréquence accepté');
    const quatre = ouvrir6(); repondre(quatre, 'À recompter : ECO-BT-01, CHG-20W, CLA-SF-01, BOU-17L'); declencher(S6, quatre);
    if (st6(quatre).cinq !== 'ko') throw new Error('quatre références acceptées');
    // L'élève qui oublie la date : ses constats et ses valeurs sont faux, sa liste suit ses chiffres
    // (une erreur ne se paie qu'une fois) — mais ses chiffres mettent BAT-10K dans les cinq.
    const sd = ouvrir6(); deposer6(sd, { sansDate: true });
    if (st6(sd).constats !== 'ko' || st6(sd).valeur !== 'ko') throw new Error('sans date : ' + JSON.stringify(st6(sd)));
    if (!S6.cinqBonnes(['ECO-BT-01', 'BAT-10K', 'CHG-20W', 'CLA-SF-01', 'BOU-17L'], S6.valeursDeReference(sd))) throw new Error('liste cohérente avec ses chiffres');
  });

  await v('ENT-2.6 : à l\'écran — Exporter (158 lignes brutes, trois feuilles), dépôt : « n résultats justes sur m »', async () => {
    const ctx2 = await nav.newContext({ acceptDownloads: true });
    const p = await ctx2.newPage();
    p.setDefaultTimeout(6000);
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) errs.push(m.text()); });
    try {
      await p.goto(new URL('/', page.url()).toString());
      await p.waitForSelector('#btnProf', { timeout: 8000 });
      await p.evaluate(async () => {
        const mod = await import('/activites/cdiscount-priorites.js');
        const hote = document.createElement('div'); hote.id = 'hote6'; document.body.appendChild(hote);
        const db = {};
        window.__c26 = { db, scores: [] };
        mod.rendre(hote, { meta: mod.meta, profil: { prenom: 'Léa', nom: 'Test', role: 'eleve', uid: 'eleve-test' }, codeStock: 'STOCK24',
          jeu: { etat: () => db, sauver() {} }, enregistrer(x) { window.__c26.scores.push(x); }, quitter() {} });
      });
      const Z = '#hote6 .ent-main';
      const aller = async (vue) => { await p.click(`#hote6 .ent-nav[data-vue="${vue}"]`); await navOn(p, '#hote6', vue); };
      await aller('extractions');
      // Niveau 3 : la demande métier seule — à l'élève de régler la période (le mois).
      await p.selectOption(`${Z} [data-filtre="periode"]`, '30j'); await p.waitForTimeout(80);
      const [dl] = await Promise.all([p.waitForEvent('download'), p.click(`${Z} [data-exporter="preparations"]`)]);
      if (dl.suggestedFilename() !== 'cdiscount-lignes-de-preparation.xlsx') throw new Error('nom : ' + dl.suggestedFilename());
      const wb = XL.read(fs.readFileSync(await dl.path()), { type: 'buffer' });
      if (wb.SheetNames.join() !== 'Préparations,Tarifs,Synthèse') throw new Error('feuilles');
      const brut = XL.utils.sheet_to_json(wb.Sheets['Préparations'], { header: 1, blankrows: true }).length - 1;
      if (brut !== 158) throw new Error(`${brut} lignes brutes`);
      // Le fichier téléchargé est celui que fabrique le test pour le même élève (même graine).
      const db = await p.evaluate(() => JSON.parse(JSON.stringify(window.__c26.db)));
      await aller('fichiers');
      await p.setInputFiles('#fichierTableur', { name: 'bonus.xlsx', mimeType: 'application/octet-stream', buffer: classeur6(db) });
      await texteVu(p, Z, /37 résultats justes sur 37/);
      const t = (await p.textContent(Z)).replace(/\s+/g, ' ');
      if (!/37 résultats justes sur 37\./.test(t)) throw new Error('retour : ' + (await p.textContent('[data-depot-retour]')));
      if (!await p.$(`${Z} [data-depot-export="ok"]`)) throw new Error('export juste non reconnu');
      if (errs.length) throw new Error(errs.join(' | '));
    } finally { await ctx2.close(); }
  });

  /* ================================================================================
   * ENT-2.5 « Le compte à rebours » (ÉVALUATION, un jeu tiré par élève) — ajouté le 04/10/2026, C8.
   * Le tirage : quelques centaines de graines, toutes conformes à la structure commune, zéro secours.
   * Le parcours : sur la graine « eleve-test », valeurs écrites À LA MAIN pour CETTE graine.
   * ============================================================================== */
  const S5 = await imp('contenus/cdiscount-compte-a-rebours.js');
  const TI = await imp('core/tirage.js');
  const COR5 = await imp('contenus/corriges/ENT-2.5.js');
  // Ouvrir la séance comme le moteur : base, graine (posée AVANT le volet), volet.
  const ouvrir25 = (graine, aisance) => {
    const db = S5.baseDeDepart('Léa');
    if (aisance) db.aisance = aisance;
    db.tirage = { graine, pose: Date.now() };
    ['moves', 'mails', 'orders', 'receptions', 'customers', 'suppliers'].forEach((k) => { if (!db[k]) db[k] = []; });
    const g = S5.VOLET.semer('Léa', db);
    g.receptions.forEach((r) => db.receptions.push(r));
    g.orders.forEach((o) => db.orders.push(o));
    g.mouvements.forEach((m) => { db.stock[m.sku] += m.delta; db.moves.push({ ...m, after: db.stock[m.sku] }); });
    g.mails.forEach((m) => db.mails.push(m));
    db.volets = { [S5.VOLET.id]: Date.now() };
    return db;
  };
  const st5 = (db) => Object.fromEntries(S5.ETAPES.map((e) => [e.id, e.verifier(db).status]));
  // Note pondérée sur 20 (règle du 10/10/2026, poids validés par Tristan) : table écrite À LA MAIN, indépendante du contenu.
  const POIDS5 = { export: 1, ecart: 1, si: 1, synthese: 1.5, liste: 3, comptage: 2, ecarts: 1, rayon: 2, regul: 2.5, recompter: 2.5, taux: 1, compteRendu: 1.5 };
  const note5 = (db) => S5.ETAPES.filter((e) => e.verifier(db).status === 'ok').reduce((s, e) => s + POIDS5[e.id], 0);
  // Le jeu de « eleve-test », écrit à la main.
  const J5 = { rayon: 'LAM-FRO', regul: 'COR-SAU', recompter: 'ELA-FIT-3' };
  const SYS5 = { 'GOU-ISO-75': 23, 'COR-SAU': 53, 'TAP-YOG': 6, 'BAL-FOOT': 9, 'LAM-FRO': 49, 'ELA-FIT-3': 57 };
  const REL5 = { ...SYS5, 'COR-SAU': 52, 'LAM-FRO': 46, 'ELA-FIT-3': 53 };
  const LISTE5 = ['COR-SAU', 'LAM-FRO', 'ELA-FIT-3'];
  // Le classeur de l'élève (export propre, synthèse à écrire : en-têtes seuls dans l'export).
  const classeur5 = (db, o = {}) => {
    const ex = GT.construireExport(S5.TABLEUR.exports[0], db, {});
    const F = ex.feuilles[0];
    const c = Object.fromEntries(F.colonnes.map((x, i) => [x, i]));
    const n = F.colonnes.length, K = XL.utils.encode_col(n), L = XL.utils.encode_col(n + 1);
    const ws = XL.utils.aoa_to_sheet([[...F.colonnes, 'Écart', 'Réf. en écart'], ...F.lignes]);
    F.lignes.forEach((l, k) => {
      const r = k + 2, ec = l[c['Stock trouvé']] - l[c['Stock logiciel']];
      ws[K + r] = { t: 'n', v: ec, f: `I${r}-H${r}` };
      ws[L + r] = { t: 's', v: ec !== 0 ? l[c['Référence']] : '', f: `IF(${K}${r}<>0,D${r},"")` };
    });
    ws['!ref'] = `A1:${L}${F.lignes.length + 1}`;
    const syn = S5.MODELES.map((ref) => [ref, o.syn && o.syn[ref] != null ? o.syn[ref] : F.lignes.filter((l) => l[c['Référence']] === ref && l[c['Stock trouvé']] !== l[c['Stock logiciel']]).length]);
    const ws2 = XL.utils.aoa_to_sheet([['Référence', 'Nb constats'], ...syn]);
    syn.forEach((x, k) => { ws2['B' + (k + 2)] = { t: 'n', v: x[1], f: `COUNTIF(Préparations!${L}:${L},A${k + 2})` }; });
    const wb = XL.utils.book_new();
    XL.utils.book_append_sheet(wb, ws, 'Préparations');
    XL.utils.book_append_sheet(wb, ws2, 'Synthèse');
    return XL.write(wb, { bookType: 'xlsx', type: 'buffer' });
  };
  const deposer5 = (db, o) => {
    const res = GT.controlerDepot(XL.read(classeur5(db, o), { type: 'buffer', cellFormula: true }), S5.controles(db), GT.construireExport(S5.TABLEUR.exports[0], db, {}).propres);
    GT.enregistrerDepot(db, S5.ID_DEPOT, res, { retour: 'evaluation', fichier: 'x.xlsx' });
    return res;
  };
  // L'inventaire, posé à la main sur le périmètre (alerte n° 20) ; `regul` : ce que l'élève régularise.
  const inventaire5 = (db, { decisions, taux = '5', regul = [[J5.regul, -1]] } = {}) => {
    const INV = S5.inventaireDeBase(db);
    const refs = INV.perimetre(db) || [];
    const e = INVM.etatNeuf(INV, (r) => db.stock[r], INV.lignes.filter((l) => refs.includes(l.ref)));
    refs.forEach((r) => { e.saisie[r] = String(REL5[r]); e.ecarts[r] = String(REL5[r] - SYS5[r]); });
    const D = decisions || { [J5.rayon]: ['rayon'], [J5.regul]: ['regul', 'Démarque inconnue'], [J5.recompter]: ['recompter'] };
    Object.entries(D).forEach(([r, [action, motif]]) => { e.decisions[r] = { action, motif: motif || '' }; });
    if ((D[J5.recompter] || [])[0] === 'recompter') e.recomptes[J5.recompter] = SYS5[J5.recompter];
    e.taux = taux; e.valide = Date.now(); e.etape = 4;
    e.ajustements = regul.map(([ref, delta]) => ({ ref, delta, motif: 'Démarque inconnue', origine: 'x' }));
    db.inventaires = { [S5.ID_INVENTAIRE]: e };
    return db;
  };
  const exporter5 = (db) => { const e = S5.TABLEUR.exports[0]; GT.enregistrerExport(db, e, GT.criteresJustes(e, db), 38, 1); return db; };
  const parcours5 = (o = {}) => {
    const db = exporter5(ouvrir25('eleve-test'));
    deposer5(db, o.syn ? { syn: o.syn } : {});
    repondre(db, o.liste || 'À recompter : COR-SAU, LAM-FRO, ELA-FIT-3'); declencher(S5, db);
    inventaire5(db, o.inv || {});
    repondre(db, o.cr || 'Régularisé : COR-SAU\nValeur régularisée : 1 × 3,20 = 3,20 €'); declencher(S5, db);
    return db;
  };

  await v('ENT-2.5 : tirage — 300 élèves, 300 jeux conformes du premier coup ou presque, zéro secours, structure commune toujours tenue', async () => {
    const sig = new Set();
    let secours = 0;
    for (let i = 0; i < 300; i++) {
      const r = TI.tirerJeu(S5.DECL_TIRAGE, 'eleve-' + i);
      if (r.secours) secours++;
      const j = r.jeu;
      const pb = S5.verifier(j);
      if (pb.length) throw new Error(`eleve-${i} : ${pb.join(' ; ')}`);
      const refs = S5.SORTES.map((s) => j.sorte[s]);
      if (new Set(refs).size !== 3 || j.sans.length !== 3) throw new Error('structure');
      const A = S5.attendus(j);
      if (refs.some((r) => A.constats[r] < 2) || j.sans.some((r) => A.constats[r] !== 0)) throw new Error('constats');
      if (A.taux < 2 || A.taux > 8 || A.lignes < 36 || A.lignes > 44) throw new Error(`taux ${A.taux}, ${A.lignes} lignes`);
      sig.add(JSON.stringify([j.sorte, j.ecart, j.depart]));
    }
    if (secours) throw new Error(`${secours} jeux de secours`);
    if (sig.size < 290) throw new Error(`${sig.size} jeux différents seulement`);
    if (JSON.stringify(S5.jeuDe('eleve-7')) !== JSON.stringify(TI.tirerJeu(S5.DECL_TIRAGE, 'eleve-7').jeu)) throw new Error('même élève, autre jeu');
    if (S5.verifier(S5.DECL_TIRAGE.secours).length) throw new Error('le jeu de secours n\'est pas conforme');
    // Le vérificateur refuse un jeu dont deux écarts sont de la même sorte.
    const faux = JSON.parse(JSON.stringify(S5.jeuDe('eleve-3'))); faux.sorte.recompter = faux.sorte.rayon;
    if (!S5.verifier(faux).length) throw new Error('jeu à deux sortes identiques accepté');
  });

  await v('ENT-2.5 : le niveau n\'entre pas dans le tirage — même graine, standard ou confirmé : même allée, mêmes messages', async () => {
    const a = ouvrir25('eleve-test'), b = ouvrir25('eleve-test', 'confirme');
    const f = (db) => JSON.stringify([db.moves.map((m) => [m.sku, m.delta, m.ref]), db.mails.map((m) => m.subject + m.text), db.stock]);
    if (f(a) !== f(b)) throw new Error('le niveau change le jeu');
    if (f(a) === f(ouvrir25('eleve-autre'))) throw new Error('deux élèves, même allée');
  });

  await v('ENT-2.5 : le jeu de « eleve-test » (à la main) — sortes, stocks, relevé, constats, export propre de 38 lignes, indices dans la messagerie', async () => {
    const db = ouvrir25('eleve-test');
    const j = S5.jeuDeBase(db);
    if (JSON.stringify(j.sorte) !== JSON.stringify(J5)) throw new Error('sortes : ' + JSON.stringify(j.sorte));
    if (JSON.stringify(db.stock) !== JSON.stringify(SYS5)) throw new Error('stock : ' + JSON.stringify(db.stock));
    const I = Object.fromEntries(S5.inventaireDeBase(db).lignes.map((l) => [l.ref, l.compte]));
    if (JSON.stringify(I) !== JSON.stringify(REL5)) throw new Error('relevé : ' + JSON.stringify(I));
    if (JSON.stringify(S5.constats(db)) !== JSON.stringify({ 'GOU-ISO-75': 0, 'COR-SAU': 3, 'TAP-YOG': 0, 'BAL-FOOT': 0, 'LAM-FRO': 4, 'ELA-FIT-3': 3 })) throw new Error('constats : ' + JSON.stringify(S5.constats(db)));
    const ex = GT.construireExport(S5.TABLEUR.exports[0], db, {});
    if (ex.propres.length !== 38 || ex.feuilles[0].lignes.length !== 38) throw new Error('export : ' + ex.propres.length);
    if (ex.feuilles[1].colonnes.join() !== 'Référence,Nb constats' || ex.feuilles[1].lignes.length) throw new Error('synthèse : en-têtes seuls');
    const s = db.mails.map((m) => m.subject + ' ' + m.text).join('\n');
    if (!/Annulation de CMD-734216/.test(s) || !/j'ai réintégré 3 lampe frontale led \(LAM-FRO\)/.test(s)) throw new Error('message de Lucie');
    if (!/Réception REC-26-0568 : le surplus de bandes élastiques de fitness, lot de 3 \(ELA-FIT-3\)/.test(s) || /monté en réserve, juste au-dessus\.[^\n]*\d+ /.test(s)) throw new Error('message du cariste');
    if (/COR-SAU/.test(s.replace(/Relevé[^]*/, ''))) throw new Error('un message parle de la référence à régulariser');
    if (db.orders.find((o) => o.no === 'CMD-734216').annulee === undefined) throw new Error('commande annulée');
    if (/absent/i.test(s)) throw new Error('« absent » écrit');
  });

  await v('ENT-2.5 : parcours juste → 20/20 ; une décision fausse (la remise en rayon) → 18/20 ; sans travail, rien', async () => {
    if (Object.values(st5(ouvrir25('eleve-test'))).some((x) => x !== 'attente')) throw new Error('avant travail : ' + JSON.stringify(st5(ouvrir25('eleve-test'))));
    const db = parcours5();
    if (note5(db) !== 20) throw new Error('parcours juste : ' + JSON.stringify(st5(db)));
    const r = S5.corrige(S5.jeuDeBase(db));
    if (r.taux !== 5 || r.valeur !== 3.2 || r.regularise !== 'COR-SAU' || r.liste.join() !== LISTE5.join()) throw new Error('corrigé : ' + JSON.stringify(r));
    const faux = parcours5({ inv: { decisions: { [J5.rayon]: ['regul', 'Démarque inconnue'], [J5.regul]: ['regul', 'Démarque inconnue'], [J5.recompter]: ['recompter'] },
      regul: [[J5.rayon, -3], [J5.regul, -1]] }, cr: 'Régularisé : LAM-FRO, COR-SAU\nValeur régularisée : 3 × 6,30 + 1 × 3,20 = 22,10 €' });
    const st = st5(faux);
    if (note5(faux) !== 18 || st.rayon !== 'ko') throw new Error('une décision fausse : ' + JSON.stringify(st));
  });

  await v('ENT-2.5 : poids (12 jalons, total 20) — table du contenu = table écrite à la main ; le coût d’une erreur suit son poids', async () => {
    const lus = Object.fromEntries(S5.ETAPES.map((e) => [e.id, e.poids]));
    if (JSON.stringify(lus) !== JSON.stringify(POIDS5)) throw new Error('poids du contenu : ' + JSON.stringify(lus));
    if (Object.values(POIDS5).reduce((a, b) => a + b, 0) !== 20) throw new Error('somme ≠ 20');
    // Liste avec un oubli : seul le jalon de la liste (3 points) tombe → 17. Le compte rendu fautif (valeur fausse) : 1,5 point → 18,5.
    const liste = parcours5({ liste: 'À recompter : COR-SAU, LAM-FRO' });
    if (note5(liste) !== 17) throw new Error('liste avec oubli : ' + note5(liste) + ' ' + JSON.stringify(st5(liste)));
    const cr = parcours5({ cr: 'Régularisé : COR-SAU\nValeur régularisée : 32 €' });
    if (note5(cr) !== 18.5 || st5(cr).compteRendu !== 'ko') throw new Error('compte rendu faux : ' + note5(cr) + ' ' + JSON.stringify(st5(cr)));
  });

  await v('ENT-2.5 : liste avec un oubli → jalon 4 ko, l\'aléa arrive, l\'inventaire reste jouable ; le taux se lit sur le périmètre', async () => {
    const db = parcours5({ liste: 'À recompter : COR-SAU, LAM-FRO' });
    const st = st5(db);
    if (st.liste !== 'ko') throw new Error('liste : ' + st.liste);
    if (!db.mails.some((m) => m.subject === 'Rayon à vérifier : ELA-FIT-3')) throw new Error('aléa absent');
    if (['comptage', 'ecarts', 'rayon', 'regul', 'recompter', 'taux', 'compteRendu'].some((k) => st[k] !== 'ok')) throw new Error(JSON.stringify(st));
    // Une erreur ne se paie qu'une fois : synthèse déposée fausse, liste qui la suit.
    const syn = parcours5({ syn: { 'ELA-FIT-3': 0 }, liste: 'À recompter : COR-SAU, LAM-FRO' });
    if (st5(syn).synthese !== 'ko' || st5(syn).liste !== 'ok') throw new Error('synthèse fausse : ' + JSON.stringify(st5(syn)));
    if (!Object.entries(st5(parcours5({ inv: { taux: '3,7' } }))).filter(([, x]) => x !== 'ok').map(([k]) => k).includes('taux')) throw new Error('taux faux accepté');
  });

  await v('ENT-2.5 : le compte rendu se juge sur ce que l\'élève a RÉELLEMENT régularisé (erreur payée une fois, au jalon 8)', async () => {
    // Il régularise la lampe (à tort) et pas la corde : jalons rayon et regul faux, compte rendu juste s'il dit ce qu'il a fait.
    const inv = { decisions: { [J5.rayon]: ['regul', 'Démarque inconnue'], [J5.regul]: ['rayon'], [J5.recompter]: ['recompter'] }, regul: [[J5.rayon, -3]] };
    const db = parcours5({ inv, cr: 'Régularisé : LAM-FRO\nValeur régularisée : 3 × 6,30 = 18,90 €' });
    const st = st5(db);
    if (st.compteRendu !== 'ok' || st.rayon !== 'ko' || st.regul !== 'ko') throw new Error(JSON.stringify(st));
    const db2 = parcours5({ inv, cr: 'Régularisé : COR-SAU\nValeur régularisée : 3,20 €' });
    if (st5(db2).compteRendu !== 'ko') throw new Error('compte rendu de la référence attendue, pas de la sienne');
    if (st5(parcours5({ cr: 'Régularisé : COR-SAU\nValeur régularisée : 32 €' })).compteRendu !== 'ko') throw new Error('valeur fausse');
  });

  await v('ENT-2.5 : corrigé par élève — son allée, l\'attendu, ses jalons, sa note ; avant ouverture, l\'allée qu\'il recevra', async () => {
    const c = COR5.corrigeEleve(parcours5(), 'eleve-test');
    const t = JSON.stringify(c);
    if (!/Liste juste : COR-SAU, LAM-FRO, ELA-FIT-3/.test(t) || !/Valeur régularisée : 3,20 €/.test(t) || !/20 \/ 20 \(12 jalons sur 12\)/.test(t)) throw new Error(t.slice(0, 400));
    const avant = COR5.corrigeEleve({}, 'eleve-test');
    if (!/pas encore ouvert/.test(avant.texte) || avant.items.length !== 1) throw new Error('avant ouverture');
    if (!/COR-SAU/.test(JSON.stringify(avant.items))) throw new Error('le jeu de l\'élève (graine = identifiant)');
  });

  await v('Cdiscount, export filtré : dans les quatre séances à tableur, les bons critères redonnent l\'export d\'avant, aucune ligne à écarter ne passe la demande, et le niveau d\'indication est celui décidé', async () => {
    const cas = [['ENT-2.2', S2, (a) => ouvrirC(a), 1], ['ENT-2.4', S23, (a) => ouvrir(S23, 'Léa', a), 2],
      ['ENT-2.6', S6, (a) => ouvrir6(a), 3], ['ENT-2.5', S5, (a) => ouvrir25('eleve-test', a), 4]];
    for (const [code, S, ouvre, niv] of cas) {
      const e = S.TABLEUR.exports[0];
      if (e.indications !== niv) throw new Error(`${code} : niveau ${e.indications}, attendu ${niv}`);
      if (e.ecran || e.libelle) throw new Error(`${code} : reste de l'ancien bouton (ecran / libelle)`);
      for (const a of [undefined, 'confirme']) {
        const db = ouvre(a);
        const sans = G_lignes(GT.construireExport(e, db, {}));
        if (sans !== G_lignes(GT.construireExport(e, db, { criteres: GT.criteresJustes(e, db) }))) throw new Error(`${code} ${a || ''} : les bons critères changent le fichier`);
        const autres = e.autres(db);
        if (autres.length < 10) throw new Error(`${code} : ${autres.length} lignes à écarter seulement`);
        const tout = GT.comparerExport(e, db, Object.fromEntries(e.filtres.map((f) => [f.id, f.periode ? 'tout' : '*'])));
        if (tout.nEnTrop !== autres.length) throw new Error(`${code} ${a || ''} : ${autres.length - tout.nEnTrop} ligne(s) à écarter passent la demande`);
        const dep = GT.comparerExport(e, db, GT.criteresDepart(e, db));
        if (niv === 1 ? !dep.juste : dep.juste) throw new Error(`${code} : critères de départ ${JSON.stringify(GT.criteresDepart(e, db))}`);
      }
    }
  });

  await v('ENT-2.5 : à l\'écran — copie, un seul dépôt « Fichier reçu. », aucune correction de l\'inventaire, remise = ramassage', async () => {
    const ctx2 = await nav.newContext({ acceptDownloads: true });
    const p = await ctx2.newPage();
    p.setDefaultTimeout(6000);
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) errs.push(m.text()); });
    try {
      await p.goto(new URL('/', page.url()).toString());
      await p.waitForSelector('#btnProf', { timeout: 8000 });
      await p.evaluate(async () => {
        const A = await import('/activites/cdiscount-compte-a-rebours.js');
        const hote = document.createElement('div'); hote.id = 'hote5'; document.body.appendChild(hote);
        const db = {};
        window.__c25 = { db, A, remis: null };
        A.rendre(hote, { meta: A.meta, profil: { prenom: 'Léa', nom: 'Test', role: 'eleve', uid: 'eleve-test' }, codeStock: 'STOCK24',
          jeu: { etat: () => db, sauver() {} }, enregistrer() {}, quitter() {},
          lireScore: async () => null, rendreCopie: async (res) => { window.__c25.remis = res; return { rendu: Date.now() }; } });
      });
      const Z = '#hote5 .ent-main';
      const aller = async (vue) => { await p.click(`#hote5 .ent-nav[data-vue="${vue}"]`); await navOn(p, '#hote5', vue); };
      if (await p.evaluate(() => window.__c25.db.tirage.graine) !== 'eleve-test') throw new Error('graine non posée');
      await aller('extractions');
      // Niveau 4 : critères du logiciel au départ ; l'élève règle l'allée C et le mois.
      await p.selectOption(`${Z} [data-filtre="allee"]`, 'C'); await p.waitForTimeout(60);
      await p.selectOption(`${Z} [data-filtre="periode"]`, '30j'); await p.waitForTimeout(60);
      const [dl] = await Promise.all([p.waitForEvent('download'), p.click(`${Z} [data-exporter="preparations"]`)]);
      if (dl.suggestedFilename() !== 'cdiscount-lignes-de-preparation.xlsx') throw new Error('nom');
      const db0 = await p.evaluate(() => JSON.parse(JSON.stringify(window.__c25.db)));
      await aller('fichiers');
      await p.setInputFiles('#fichierTableur', { name: 'eval.xlsx', mimeType: 'application/octet-stream', buffer: classeur5(db0) });
      await texteVu(p, Z, /Fichier reçu\./);
      const t = (await p.textContent(Z)).replace(/\s+/g, ' ');
      if (!/Fichier reçu\./.test(t) || /résultats? justes?/.test(t)) throw new Error('retour : ' + t.slice(0, 300));
      if (await p.$(`${Z} [data-depot-export]`)) throw new Error('évaluation : un retour sur l\'export');
      if (await p.$('#fichierTableur')) throw new Error('second dépôt possible');
      // La liste, par la messagerie.
      await aller('mail');
      await p.click(`${Z} .ent-mitem >> text=Allée C : le compte à rebours`);
      await p.click(`${Z} [data-repondre]`);
      await p.fill(`${Z} #repT`, 'À recompter : COR-SAU, LAM-FRO, ELA-FIT-3');
      await p.click(`${Z} #formRep button[type="submit"]`); await p.waitForTimeout(150);
      // L'inventaire : 3 lignes, écarts et taux faux acceptés sans rien dire (correction « aucune »).
      await aller('inventaire');
      const saisies = await p.$$eval(`${Z} [data-inv-saisie]`, (e) => e.map((x) => x.dataset.invSaisie));
      if (saisies.join() !== 'COR-SAU,LAM-FRO,ELA-FIT-3') throw new Error('périmètre : ' + saisies.join());
      for (const r of saisies) await p.fill(`${Z} [data-inv-saisie="${r}"]`, String(REL5[r]));
      await p.click(`${Z} [data-inv-aller="2"]`); await etapeInv(p, Z, 2);
      for (const r of saisies) await p.fill(`${Z} [data-inv-ecart="${r}"]`, String(REL5[r] - SYS5[r]));
      await p.click(`${Z} [data-inv-aller="3"]`); await etapeInv(p, Z, 3);
      await p.selectOption(`${Z} [data-inv-action="LAM-FRO"]`, 'rayon'); await p.waitForTimeout(60);
      await p.selectOption(`${Z} [data-inv-action="COR-SAU"]`, 'regul'); await p.waitForTimeout(60);
      await p.selectOption(`${Z} [data-inv-motif="COR-SAU"]`, 'Démarque inconnue');
      await p.selectOption(`${Z} [data-inv-action="ELA-FIT-3"]`, 'recompter'); await p.waitForTimeout(60);
      await p.click(`${Z} [data-inv-aller="4"]`); await etapeInv(p, Z, 4);
      await p.fill(`${Z} [data-inv-taux]`, '5');
      await p.click(`${Z} [data-inv-valider]`); await texteVu(p, Z, /Inventaire INV-2026-58 valid/);
      const bilan = (await p.textContent(Z)).replace(/\s+/g, ' ');
      if (!/Inventaire INV-2026-58 valid/.test(bilan)) throw new Error('inventaire non validé : ' + bilan.slice(0, 300));
      if (/d.cisions? justes?|\bjuste\b|. revoir|Ce qu.il fallait voir/.test(bilan)) throw new Error('une correction s’affiche : ' + bilan.slice(0, 300));
      // Le compte rendu, puis la copie.
      await aller('mail');
      if (await p.$(`${Z} [data-dossier="in"]`)) { await p.click(`${Z} [data-dossier="in"]`); await p.waitForTimeout(80); }
      await p.click(`${Z} .ent-mitem >> text=Votre liste à recompter`);
      await p.click(`${Z} [data-repondre]`);
      await p.fill(`${Z} #repT`, 'Régularisé : COR-SAU\nValeur régularisée : 3,20 €');
      await p.click(`${Z} #formRep button[type="submit"]`); await p.waitForTimeout(150);
      await p.click('#hote5 [data-copie-rendre]'); await p.waitForTimeout(60);
      await p.click('#hote5 [data-copie-rendre]');
      await p.waitForFunction(() => !!window.__c25.remis);
      const r = await p.evaluate(() => window.__c25.remis);
      if (r.score !== 20 || r.max !== 20) throw new Error('copie : ' + JSON.stringify(r));
      const ramasse = await p.evaluate(() => window.__c25.A.noter(JSON.parse(JSON.stringify(window.__c25.db))));
      if (ramasse.score !== r.score || ramasse.max !== r.max) throw new Error('ramassage ≠ remise');
      if (errs.length) throw new Error(errs.join(' | '));
    } finally { await ctx2.close(); }
  });

  // 05/10/2026 : le mail d'accueil annonçait partout « Stock, Réceptions et Commandes, la Console »,
  // faux depuis le menu par séance (ENT-2.2 et 2.6 n'ont ni Réceptions ni Console). Écrans attendus
  // écrits à la main, relevés sur le `menu` de chaque séance (activites/cdiscount-*.js).
  await v('Cdiscount : le mail d\'accueil de chaque séance n\'annonce que les écrans de cette séance', async () => {
    const MOTS = { stock: /^- Stock :/m, commandes: /^- Commandes :/m, receptions: /^- Réceptions :/m,
      console: /^- la Console/m, inventaire: /^- Inventaire :/m, extractions: /^- Extractions/m };
    const cas = [
      ['ENT-2.1', () => ouvrir(S21), ['stock', 'commandes', 'receptions', 'console']],
      ['ENT-2.2', () => ouvrirC(), ['stock', 'commandes', 'extractions']],
      ['ENT-2.3', () => ouvrir(S22), ['stock', 'commandes', 'console', 'inventaire']],
      ['ENT-2.4', () => ouvrir(S23), ['stock', 'commandes', 'receptions', 'console', 'extractions']],
      ['ENT-2.5', () => ouvrir25('eleve-test'), ['stock', 'commandes', 'console', 'inventaire', 'extractions']],
      ['ENT-2.6', () => ouvrir6(), ['commandes', 'extractions']]];
    const errs = [];
    cas.forEach(([code, ouvre, attendus]) => {
      const bienvenue = ouvre().mails.filter((x) => /^Bienvenue/.test(x.subject));
      if (bienvenue.length !== 1) { errs.push(`${code} : ${bienvenue.length} mail(s) d'accueil`); return; }
      const t = bienvenue[0].text;
      for (const [e, re] of Object.entries(MOTS)) {
        if (re.test(t) !== attendus.includes(e)) errs.push(`${code} : « ${e} » ${attendus.includes(e) ? 'manque' : 'annoncé à tort'}`);
      }
      if (/trois écrans/.test(t)) errs.push(`${code} : reste « trois écrans »`);
      if (!/\.\n\nBon courage/.test(t)) errs.push(`${code} : la liste ne finit pas par un point`);
    });
    if (errs.length) throw new Error(errs.join(' | '));
  });

  // Chantier 14 (09/10/2026) : le redessin COMPLET de l'environnement (menu compris) ne rendait pas le focus : un
  // élève qui choisit une entrée du menu au clavier se retrouvait sans focus. Il le garde maintenant ; à la souris,
  // rien n'est replacé.
  await v('ENT-2.1 : le menu redessiné entièrement rend le focus clavier à l’entrée choisie ; à la souris, aucun focus rendu', async () => {
    const ctxF = await nav.newContext();
    const pf = await ctxF.newPage();
    try {
      await pf.goto(new URL('/', page.url()).toString());
      await pf.waitForSelector('#btnProf', { timeout: 8000 });
      await pf.evaluate(async () => {
        const mod = await import('/activites/cdiscount-mouvements.js');
        const db = {};
        const hote = document.createElement('div');
        hote.id = 'essaiFocus';
        document.body.appendChild(hote);
        mod.rendre(hote, { meta: mod.meta, profil: { prenom: 'Léa', role: 'eleve' }, codeStock: 'STOCK24',
          jeu: { etat: () => db, sauver() {} }, enregistrer() {}, quitter() {} });
      });
      const actif = () => pf.evaluate(() => { const a = document.activeElement; return [a && a.tagName, a && a.dataset && a.dataset.vue, a && a.classList.contains('on')]; });
      await pf.focus('#essaiFocus .ent-nav[data-vue="stock"]');
      await pf.keyboard.press('Enter');          // `aller('stock')` : tout l'environnement est redessiné
      await pf.waitForSelector('#essaiFocus .ent-nav.on[data-vue="stock"]');
      const apresClavier = await actif();
      if (JSON.stringify(apresClavier) !== JSON.stringify(['BUTTON', 'stock', true])) throw new Error('au clavier, le focus devait rester sur « Stock » : ' + JSON.stringify(apresClavier));
      await pf.click('#essaiFocus .ent-nav[data-vue="catalogue"]');
      await pf.waitForSelector('#essaiFocus .ent-nav.on[data-vue="catalogue"]');
      const apresSouris = await actif();
      if (apresSouris[0] !== 'BODY') throw new Error('à la souris, aucun focus ne devait être replacé : ' + JSON.stringify(apresSouris));
    } finally { await ctxF.close(); }
  });

}
