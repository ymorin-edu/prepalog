// Suite de tests de Prepalog — bloc « inventaire » : l'écran Inventaire (core/types/inventaire.js)
// et le catalogue d'articles simples (catalogueSimple), chantier E du 02/10/2026.
//
// `node outils/test.mjs inventaire` ne lance que ce bloc. Il n'a besoin d'aucun autre : il monte
// l'environnement d'entreprise à la main, dans un contexte de navigateur à lui, sur l'entreprise
// FICTIVE d'essai `outils/essai-inventaire.js` (LogiDémo) — jamais sur les données de Cdiscount,
// qui appartiennent au chantier D. Le format des données est celui de la fiche du projet
// `claude/prepalog-inventaire-format.md`.
//
// Le scénario d'essai a trois écarts, ceux de la maquette validée par Tristan :
//   AGR-24-6   système 14, compté 11 (−3) : retour resté en zone retours → remettre en rayon
//   CAL-SCI    système  8, compté  7 (−1) : casse non saisie            → régulariser, « Casse »
//   CLE-USB-32 système 20, compté 23 (+3) : erreur de comptage          → recompter (redonne 20)
// Taux d'écart attendu : 7 ÷ 191 × 100 = 3,7 %.

export default async function bloc({ v, nav }) {

const ctxInv = await nav.newContext();
const pg = await ctxInv.newPage();
pg.setDefaultTimeout(6000);
const erreursInv = [];
pg.on('pageerror', (e) => erreursInv.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursInv.push('CONSOLE: ' + m.text()); });
await pg.goto('http://127.0.0.1:8099/');
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const ID = 'INV-ESSAI-01';
const RELEVE = { 'RAM-A4-80': 40, 'STY-BL-50': 25, 'AGR-24-6': 11, 'CLA-LEV-75': 30, 'CAL-SCI': 7, 'CLE-USB-32': 23, 'SUR-JAU-4': 36, 'POC-A4-100': 18 };
const SYSTEME = { 'RAM-A4-80': 40, 'STY-BL-50': 25, 'AGR-24-6': 14, 'CLA-LEV-75': 30, 'CAL-SCI': 8, 'CLE-USB-32': 20, 'SUR-JAU-4': 36, 'POC-A4-100': 18 };
const egal = (a, b, quoi) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${quoi} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`); };
const vrai = (c, quoi) => { if (!c) throw new Error(quoi); };

// Monte l'environnement LogiDémo dans une base neuve. `reglages` remplace ceux de l'inventaire ;
// `inventaire: null` monte l'entreprise SANS écran d'inventaire ; `role: 'prof'` en enseignant.
const monter = (opts = {}) => pg.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-inventaire.js');
  document.querySelector('#invTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'invTest'; document.body.appendChild(hote);
  const U = E.univers(o.reglages || {});
  if (o.sansInventaire) delete U.inventaire;
  // Périmètre (04/10/2026) : la séance le lit sur la base — ici `db.perim`, que le test pose.
  if (o.perimetre) { U.inventaire.perimetre = (base) => base.perim || null; U.inventaire.attentePerimetre = 'En attente de votre liste.'; }
  const db = {};
  if (o.perim) db.perim = o.perim;
  creerEntreprise(U).rendre(hote, {
    meta: { id: 'essai-inventaire', code: 'ESSAI', titre: 'LogiDémo — essai', portee: 'eleve', immersif: true },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
  });
  window.__inv = { db, U, E };
}, opts);

const Z = '#invTest .ent-main';
const ouvrir = async (vue) => { await pg.click(`#invTest .ent-nav[data-vue="${vue}"]`); await pg.waitForTimeout(80); };
const texte = async (sel) => ((await pg.textContent(sel || Z)) || '').replace(/\s+/g, ' ').trim();
const etat = () => pg.evaluate((id) => JSON.parse(JSON.stringify((window.__inv.db.inventaires || {})[id] || null)), ID);
const aller = async (n) => { await pg.click(`${Z} [data-inv-aller="${n}"]`); await pg.waitForTimeout(80); };
const msg = () => texte(`${Z} [data-inv-msg]`).catch(() => '');
const console_ = async (cmd) => {
  await ouvrir('console');
  await pg.fill('#champCmd', cmd); await pg.press('#champCmd', 'Enter'); await pg.waitForTimeout(80);
  const blocs = await pg.$$eval(`${Z} .ent-cres`, (els) => els.map((e) => e.textContent));
  return (blocs[blocs.length - 1] || '').replace(/\s+/g, ' ').trim();
};
const saisirReleve = async (valeurs = RELEVE) => {
  for (const [r, q] of Object.entries(valeurs)) await pg.fill(`${Z} [data-inv-saisie="${r}"]`, String(q));
};
const saisirEcarts = async () => {
  for (const r of Object.keys(RELEVE)) await pg.fill(`${Z} [data-inv-ecart="${r}"]`, String(RELEVE[r] - SYSTEME[r]));
};
// Le parcours juste jusqu'à l'étape 3.
const jusquAuTraitement = async (reglages = {}) => {
  await monter({ reglages }); await ouvrir('inventaire');
  await saisirReleve(); await aller(2);
  if ((reglages.ecarts || 'eleve') === 'eleve') await saisirEcarts();
  await aller(3);
};
const decider = async (ref, action, motif) => {
  await pg.selectOption(`${Z} [data-inv-action="${ref}"]`, action); await pg.waitForTimeout(80);
  if (motif) await pg.selectOption(`${Z} [data-inv-motif="${ref}"]`, motif);
};
const bonnesDecisions = async () => {
  await decider('AGR-24-6', 'rayon'); await decider('CAL-SCI', 'regul', 'Casse'); await decider('CLE-USB-32', 'recompter');
};

/* ================================================================ le catalogue simple */

await v('Inventaire : catalogueSimple fabrique un catalogue sans couleur ni taille (sku = référence)', async () => {
  const r = await pg.evaluate(async () => {
    const { catalogueSimple } = await import('/contenus/entreprise-commun.js');
    const C = catalogueSimple([{ ref: 'ab-12', designation: 'Article', cout: 2, prix: 5, emplacement: 'b-01-1', stock: 4 }]);
    let doublon = '';
    try { catalogueSimple([{ ref: 'X' }, { ref: 'x' }]); } catch (e) { doublon = e.message; }
    return { simple: C.simple, cles: Object.keys(C.VM), loc: C.VM['AB-12'].loc, q: C.VM['AB-12'].qty0, couleur: C.VM['AB-12'].color, doublon };
  });
  egal([r.simple, r.cles, r.loc, r.q, r.couleur], [true, ['AB-12'], 'B-01-1', 4, null], 'catalogue');
  vrai(/double/.test(r.doublon), 'une référence en double doit être refusée');
});

await v('Inventaire : Stock d\'un catalogue simple — ni colonne Couleur ni Taille, les articles et leur emplacement', async () => {
  await monter({ sansInventaire: true });
  await ouvrir('stock');
  await pg.fill(`${Z} #codeStock`, 'ABC'); await pg.click(`${Z} [data-deverrouiller]`); await pg.waitForTimeout(80);
  const th = await pg.$$eval(`${Z} #entListe th`, (els) => els.map((e) => e.textContent.trim()));
  egal(th, ['Référence', 'Article', 'Stock', 'Seuil', 'Emplacement', 'Statut'], 'colonnes du Stock');
  const t = await texte(`${Z} #entListe`);
  vrai(t.includes('Agrafeuse 24/6') && t.includes('A-02-1') && t.includes('Calcul+ Calculatrice scientifique'), 'articles et emplacements attendus : ' + t.slice(0, 200));
});

await v('Inventaire : Catalogue et fiche d\'un article simple (emplacement, pas de tailles)', async () => {
  await ouvrir('catalogue');
  const t = await texte();
  vrai(/8 articles\./.test(t), 'le décompte des articles manque : ' + t.slice(0, 120));
  await pg.click(`${Z} [data-produit="CAL-SCI"]`); await pg.waitForTimeout(80);
  const f = await texte();
  vrai(/Référence article\s*CAL-SCI/.test(f) && /Emplacement\s*A-03-1/.test(f) && !/Tailles|Couleur/.test(f), 'fiche : ' + f.slice(0, 300));
});

await v('Inventaire : console sur un catalogue simple (.getstock, .getlocation, .getproduct, .help)', async () => {
  const s = await console_('.getstock agr-24-6');
  vrai(s.includes('Stock') && s.includes('14') && !s.includes('Couleur'), '.getstock : ' + s);
  const l = await console_('.getlocation CAL-SCI');
  vrai(l.includes('A-03-1') && !l.includes('Zone'), '.getlocation : ' + l);
  const p = await console_('.getproduct CLE-USB-32');
  vrai(p.includes('A-03-2') && !p.includes('Tailles'), '.getproduct : ' + p);
  const h = await console_('.help');
  vrai(h.includes('Référence article : RAM-A4-80') && !h.includes('NK-AM270'), '.help : ' + h.slice(0, 160));
});

/* ================================================================ l'écran et le blocage */

await v('Inventaire : l\'entrée de menu n\'existe que si la séance déclare un inventaire', async () => {
  vrai(!(await pg.$('#invTest .ent-nav[data-vue="inventaire"]')), 'sans inventaire, pas d\'entrée « Inventaire »');
  await monter();
  vrai(!!(await pg.$('#invTest .ent-nav[data-vue="inventaire"]')), 'avec inventaire, l\'entrée doit exister');
});

await v('Inventaire : à l\'aveugle, Stock est bloqué dès l\'ouverture de la séance, avant même l\'écran', async () => {
  await ouvrir('stock');
  vrai(!!(await pg.$(`${Z} [data-stock-bloque]`)), 'l\'écran Stock doit être bloqué');
  vrai(!(await pg.$(`${Z} #codeStock`)), 'le code d\'accès ne doit pas permettre de passer');
});

await v('Inventaire : à l\'aveugle, la console refuse .getstock, .lowstock, .movements, .getlot et .setstock', async () => {
  for (const c of ['.getstock CAL-SCI', '.lowstock', '.movements CAL-SCI', '.getlot X', '.setstock CAL-SCI 7']) {
    const r = await console_(c);
    vrai(/Inventaire en cours/.test(r), `${c} devrait être bloquée : ${r}`);
  }
  const ok = await console_('.getlocation CAL-SCI');
  vrai(ok.includes('A-03-1'), 'une commande sans stock reste permise : ' + ok);
});

await v('Inventaire : première ouverture — photo du stock système, stock caché à la saisie', async () => {
  await ouvrir('inventaire');
  const e = await etat();
  egal(e.systeme, SYSTEME, 'photo du stock système');
  egal(e.etape, 1, 'étape');
  const caches = await pg.$$eval(`${Z} .inv-cache`, (els) => els.length);
  egal(caches, 8, 'cellules « caché »');
  const t = await texte();
  vrai(t.includes('Campagne INV-ESSAI-01') && t.includes('1. Saisir le comptage') && !/\b14\b/.test(await texte(`${Z} table`)), 'en-tête ou stock visible : ' + t.slice(0, 200));
});

await v('Inventaire : étape 1 — quantité manquante, puis quantité différente du relevé : refusées', async () => {
  await saisirReleve({ 'RAM-A4-80': 40 });
  await aller(2);
  vrai(/Il manque 7 quantités/.test(await msg()), 'manque : ' + await msg());
  await saisirReleve({ ...RELEVE, 'CLE-USB-32': 20, 'AGR-24-6': 'onze' });
  await aller(2);
  vrai(/Il manque 1 quantité .*A-02-1/.test(await msg()), 'texte non numérique : ' + await msg());
  await saisirReleve({ ...RELEVE, 'CLE-USB-32': 20 });
  await aller(2);
  vrai(/1 quantité ne correspond pas au relevé .*A-03-2/.test(await msg()), 'écart au relevé : ' + await msg());
  egal((await etat()).etape, 1, 'on reste à l\'étape 1');
});

await v('Inventaire : étape 1 juste → étape 2 ; Stock et la console se rouvrent ; pas de retour au comptage', async () => {
  await saisirReleve(); await aller(2);
  egal((await etat()).etape, 2, 'étape');
  vrai(!(await pg.$(`${Z} [data-inv-aller="1"]`)), 'aucun bouton ne ramène au comptage');
  const s = await console_('.getstock AGR-24-6');
  vrai(!/Inventaire en cours/.test(s) && s.includes('14'), '.getstock rouvert : ' + s);
  await ouvrir('stock');
  vrai(!(await pg.$(`${Z} [data-stock-bloque]`)), 'Stock rouvert (verrouillé par code, comme d\'habitude)');
  await ouvrir('inventaire');
});

await v('Inventaire : étape 2 (élève) — écart vide refusé, écart faux refusé, « −3 » avec le vrai signe moins accepté', async () => {
  await aller(3);
  vrai(/Il manque 8 écarts/.test(await msg()), 'vides : ' + await msg());
  await saisirEcarts();
  await pg.fill(`${Z} [data-inv-ecart="CAL-SCI"]`, '1');
  await aller(3);
  vrai(/1 écart est faux/.test(await msg()), 'faux : ' + await msg());
  await pg.fill(`${Z} [data-inv-ecart="CAL-SCI"]`, '−1');
  await pg.fill(`${Z} [data-inv-ecart="AGR-24-6"]`, ' -3 ');
  await aller(3);
  egal((await etat()).etape, 3, 'étape');
});

await v('Inventaire : étape 3 — seules les trois lignes en écart, avec leur écart signé', async () => {
  const lignes = await pg.$$eval(`${Z} [data-inv-ligne]`, (els) => els.map((e) => [e.dataset.invLigne, e.querySelector('[data-inv-ecart-ligne]').textContent]));
  egal(lignes, [['AGR-24-6', '−3'], ['CAL-SCI', '−1'], ['CLE-USB-32', '+3']], 'lignes en écart');
});

await v('Inventaire : « voir les mouvements » montre les mouvements de LA référence, avec le retour R-0042', async () => {
  await pg.click(`${Z} [data-inv-ouvrir="AGR-24-6"]`); await pg.waitForTimeout(80);
  const t = await texte(`${Z} [data-inv-mvts="AGR-24-6"]`);
  vrai(t.includes('Retour client') && t.includes('R-0042') && t.includes('CMD-000311') && !t.includes('CMD-000305'), 'mouvements : ' + t);
  await pg.click(`${Z} [data-inv-ouvrir="AGR-24-6"]`); await pg.waitForTimeout(80);
  vrai(!(await pg.$(`${Z} [data-inv-mvts]`)), 'le panneau se referme');
});

await v('Inventaire : étape 3 — décision manquante refusée, régularisation sans motif refusée', async () => {
  await aller(4);
  vrai(/Décidez de chaque écart/.test(await msg()), 'sans décision : ' + await msg());
  await decider('AGR-24-6', 'rayon'); await decider('CLE-USB-32', 'recompter'); await decider('CAL-SCI', 'regul');
  await aller(4);
  vrai(/sans motif est refusée : CAL-SCI/.test(await msg()), 'sans motif : ' + await msg());
});

await v('Inventaire : recompter (relevé) — le recomptage de la séance remplace le comptage, l\'écart disparaît', async () => {
  const e = await etat();
  egal(e.recomptes, { 'CLE-USB-32': 20 }, 'recomptage');
  const t = await texte(`${Z} [data-inv-ligne="CLE-USB-32"]`);
  const ec = await texte(`${Z} [data-inv-ligne="CLE-USB-32"] [data-inv-ecart-ligne]`);
  vrai(t.includes('recompté : 20') && ec === '0', 'ligne recomptée : ' + t);
});

await v('Inventaire : étape 4 — récapitulatif et ajustement prévu, taux d\'écart exigé puis vérifié', async () => {
  await pg.selectOption(`${Z} [data-inv-motif="CAL-SCI"]`, 'Casse');
  await aller(4);
  egal((await etat()).etape, 4, 'étape');
  const t = await texte();
  vrai(t.includes('Ajustement inventaire · CAL-SCI · −1 · INV-ESSAI-01 · Casse') && !t.includes('· AGR-24-6 ·'), 'prévu : ' + t);
  await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(80);
  vrai(/Calculez le taux/.test(await msg()), 'taux manquant : ' + await msg());
  // L'oubli classique : le rapport sans le « × 100 ».
  await pg.fill(`${Z} [data-inv-taux]`, '0,04');
  await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(80);
  vrai(/taux d'écart est faux/.test(await msg()), 'taux faux (sans × 100) : ' + await msg());
  vrai(!(await etat()).valide, 'pas encore validé');
});

await v('Inventaire : validation — un seul « Ajustement inventaire » (CAL-SCI −1, motif Casse), stock à 7', async () => {
  await pg.fill(`${Z} [data-inv-taux]`, '3,7');
  await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(120);
  const r = await pg.evaluate(() => ({ moves: window.__inv.db.moves.filter((m) => m.type === 'Ajustement inventaire'), stock: window.__inv.db.stock }));
  egal(r.moves.map((m) => [m.sku, m.delta, m.after, m.ref]), [['CAL-SCI', -1, 7, 'INV-ESSAI-01 · Casse']], 'ajustements');
  egal([r.stock['CAL-SCI'], r.stock['AGR-24-6'], r.stock['CLE-USB-32']], [7, 14, 20], 'stocks après');
  vrai(!!(await etat()).valide, 'inventaire validé');
});

await v('Inventaire : bilan détaillé — 3 décisions justes sur 3, explications, taux juste ; plus rien à saisir', async () => {
  const t = await texte();
  vrai(t.includes('3 décisions justes sur 3') && t.includes('zone retours') && /Taux d'écart : juste/.test(t), 'bilan : ' + t.slice(0, 400));
  egal(await pg.$$eval(`${Z} input, ${Z} select, ${Z} [data-inv-valider]`, (els) => els.length), 0, 'champs restants');
  await ouvrir('stock'); await ouvrir('inventaire');
  vrai(!!(await pg.$(`${Z} [data-inv-valide]`)), 'rouvert, l\'écran reste sur le bilan');
});

await v('Inventaire : l\'ajustement apparaît dans Stock › Mouvements', async () => {
  await ouvrir('stock');
  await pg.fill(`${Z} #codeStock`, 'ABC'); await pg.click(`${Z} [data-deverrouiller]`); await pg.waitForTimeout(60);
  await pg.click(`${Z} [data-onglet="stock"][data-val="mouvements"]`); await pg.waitForTimeout(60);
  const t = await texte();
  vrai(t.includes('Ajustement inventaire') && t.includes('INV-ESSAI-01 · Casse'), 'Mouvements : ' + t.slice(0, 300));
});

await v('Inventaire : bilanInventaire (pour les jalons) relit le même état', async () => {
  const b = await pg.evaluate(async (id) => {
    const { bilanInventaire } = await import('/core/types/inventaire.js');
    const { db, U } = window.__inv;
    return bilanInventaire(db, U.inventaire, U.CATALOGUE);
  }, ID);
  egal([b.valide, b.saisieOk, b.ecartsOk, b.tauxOk, b.justes, b.notees, b.tauxAttendu, b.sommeAbs, b.sommeSys], [true, true, true, true, 3, 3, 3.7, 7, 191], 'bilan');
});

await v('Inventaire : le relevé arrive par la messagerie, au format papier, avec la remarque', async () => {
  await ouvrir('mail');
  await pg.click(`${Z} .ent-mitem >> text=Relevé de comptage`); await pg.waitForTimeout(80);
  const lignes = await pg.$$eval(`${Z} .inv-papier tr`, (trs) => trs.map((tr) => [...tr.cells].map((c) => c.textContent.trim()).join(' ')));
  vrai(lignes.includes('A-02-1 AGR-24-6 11') && lignes.includes('A-03-2 CLE-USB-32 23') && lignes.length === 8, 'relevé : ' + lignes.join(' | '));
  vrai((await texte(`${Z} .inv-papier`)).includes('compté vite'), 'la remarque de l\'équipe');
});

/* ================================================================ les réglages */

await v('Inventaire : mauvaises décisions — verdict « à revoir » (régulariser un retour, motif faux)', async () => {
  await jusquAuTraitement();
  await decider('AGR-24-6', 'regul', 'Démarque inconnue'); await decider('CAL-SCI', 'regul', 'Erreur de prélèvement'); await decider('CLE-USB-32', 'recompter');
  await aller(4); await pg.fill(`${Z} [data-inv-taux]`, '3.7');
  await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(120);
  const t = await texte();
  vrai(t.includes('1 décision juste sur 3'), 'verdict : ' + t.slice(0, 300));
  const verdicts = await pg.$$eval(`${Z} [data-inv-verdict]`, (els) => els.map((e) => [e.dataset.invVerdict, e.querySelector('.pastille').textContent]));
  egal(verdicts, [['AGR-24-6', 'à revoir'], ['CAL-SCI', 'à revoir'], ['CLE-USB-32', 'juste']], 'verdicts');
  const m = await pg.evaluate(() => window.__inv.db.moves.filter((x) => x.type === 'Ajustement inventaire').map((x) => [x.sku, x.delta]));
  egal(m, [['AGR-24-6', -3], ['CAL-SCI', -1]], 'ajustements passés');
});

await v('Inventaire : une baisse entame les lots dans l\'ordre d\'entrée (traçabilité)', async () => {
  await jusquAuTraitement();
  // Une réception antérieure : les 8 calculatrices viennent toutes du lot LOT-C1.
  await pg.evaluate(() => { window.__inv.db.moves.push({ ts: 1, sku: 'CAL-SCI', type: 'Réception', delta: 8, after: 8, ref: 'BL', lot: 'LOT-C1', by: 'x' }); });
  await bonnesDecisions(); await aller(4);
  await pg.fill(`${Z} [data-inv-taux]`, '3,7'); await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(120);
  const m = await pg.evaluate(() => window.__inv.db.moves.filter((x) => x.type === 'Ajustement inventaire').map((x) => [x.sku, x.delta, x.lot]));
  egal(m, [['CAL-SCI', -1, 'LOT-C1']], 'lot entamé');
});

await v('Inventaire : correction « verdict » — juste / à revoir, sans explication', async () => {
  await jusquAuTraitement({ correction: 'verdict' });
  await bonnesDecisions(); await aller(4);
  await pg.fill(`${Z} [data-inv-taux]`, '3,7'); await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(120);
  const t = await texte();
  vrai(t.includes('3 décisions justes sur 3') && !t.includes('zone retours') && !t.includes("Ce qu'il fallait voir"), 'verdict seul : ' + t.slice(0, 300));
});

await v('Inventaire : correction « aucune » (évaluation) — écarts et taux faux acceptés sans rien dire, notés au bilan', async () => {
  await monter({ reglages: { correction: 'aucune' } }); await ouvrir('inventaire');
  await saisirReleve(); await aller(2);
  await saisirEcarts(); await pg.fill(`${Z} [data-inv-ecart="CAL-SCI"]`, '1');
  await aller(3);
  egal((await etat()).etape, 3, 'écart faux accepté');
  await bonnesDecisions(); await aller(4);
  await pg.fill(`${Z} [data-inv-taux]`, '12'); await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(120);
  const t = await texte();
  const pastilles = await pg.$$eval(`${Z} .pastille`, (els) => els.length);
  vrai(!!(await pg.$(`${Z} [data-inv-valide]`)) && pastilles === 0 && !/à revoir|sur 3|Taux d'écart :/.test(t), 'aucune correction affichée : ' + t.slice(0, 300));
  const b = await pg.evaluate(async () => {
    const { bilanInventaire } = await import('/core/types/inventaire.js');
    return bilanInventaire(window.__inv.db, window.__inv.U.inventaire, window.__inv.U.CATALOGUE);
  });
  egal([b.ecartsOk, b.tauxOk, b.justes], [false, false, 3], 'bilan pour la note');
});

await v('Inventaire : écarts calculés par l\'écran (guidage) — affichés signés et valorisés, taux calculé', async () => {
  await monter({ reglages: { ecarts: 'ecran' } }); await ouvrir('inventaire');
  await saisirReleve(); await aller(2);
  vrai(!(await pg.$(`${Z} [data-inv-ecart]`)), 'aucun champ d\'écart');
  const e = await pg.$$eval(`${Z} [data-inv-ecart-calcule]`, (els) => Object.fromEntries(els.map((x) => [x.dataset.invEcartCalcule, x.textContent])));
  egal([e['AGR-24-6'], e['CAL-SCI'], e['CLE-USB-32'], e['RAM-A4-80']], ['−3', '−1', '+3', '0'], 'écarts calculés');
  vrai(/[-−]23,40/.test(await texte()), 'valeur de l\'écart d\'AGR (−3 × 7,80 €)');
  await aller(3); await bonnesDecisions(); await aller(4);
  vrai((await texte(`${Z} [data-inv-taux-calcule]`)) === '3,7 %', 'taux calculé');
  await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(120);
  vrai(!!(await pg.$(`${Z} [data-inv-valide]`)), 'validé sans taux à saisir');
});

await v('Inventaire : non aveugle — le stock système est montré à la saisie, Stock n\'est pas bloqué', async () => {
  await monter({ reglages: { aveugle: false } }); await ouvrir('inventaire');
  egal(await pg.$$eval(`${Z} .inv-cache`, (els) => els.length), 0, 'cellules « caché »');
  vrai((await texte(`${Z} table`)).includes('14'), 'le stock d\'AGR (14) est affiché');
  await ouvrir('stock');
  vrai(!(await pg.$(`${Z} [data-stock-bloque]`)), 'Stock non bloqué');
});

await v('Inventaire : l\'enseignant voit le stock pendant un comptage à l\'aveugle', async () => {
  await monter({ role: 'prof' }); await ouvrir('stock');
  vrai(!(await pg.$(`${Z} [data-stock-bloque]`)), 'Stock non bloqué pour l\'enseignant');
  const s = await console_('.getstock CAL-SCI');
  vrai(s.includes('8'), '.getstock enseignant : ' + s);
});

await v('Inventaire : motif facultatif si la séance le décide', async () => {
  await jusquAuTraitement({ motifObligatoire: false });
  await decider('AGR-24-6', 'rayon'); await decider('CAL-SCI', 'regul'); await decider('CLE-USB-32', 'recompter');
  await aller(4);
  egal((await etat()).etape, 4, 'régularisation sans motif acceptée');
  vrai((await texte()).includes('Ajustement inventaire · CAL-SCI · −1 · INV-ESSAI-01'), 'ajustement prévu sans motif');
});

await v('Inventaire : recomptage sans quantité nouvelle — l\'écart demeure et la validation est refusée', async () => {
  const sansRecompte = { lignes: (await pg.evaluate(() => window.__inv.E.INVENTAIRE.lignes)).map((l) => (l.ref === 'CLE-USB-32' ? { ...l, recompte: undefined } : l)) };
  await jusquAuTraitement(sansRecompte);
  await decider('AGR-24-6', 'rayon'); await decider('CAL-SCI', 'regul', 'Casse'); await decider('CLE-USB-32', 'recompter');
  egal((await etat()).recomptes, { 'CLE-USB-32': 23 }, 'le recomptage redonne le comptage');
  await aller(4);
  vrai(/l'écart demeure \(CLE-USB-32\)/.test(await msg()), 'refus : ' + await msg());
});

await v('Inventaire : comptage physique — saisie libre, recomptage saisi par l\'élève, surplus régularisé sans lot', async () => {
  await monter({ reglages: { source: 'physique', ecarts: 'ecran' } }); await ouvrir('inventaire');
  vrai((await texte()).includes('comptées dans les rayons'), 'consigne du comptage physique');
  await saisirReleve({ ...RELEVE, 'RAM-A4-80': 42 });   // ce que l'élève a vraiment compté
  await aller(2);
  egal((await etat()).etape, 2, 'saisie libre acceptée');
  await aller(3);
  await decider('RAM-A4-80', 'regul', 'Erreur de réception');
  await decider('AGR-24-6', 'rayon'); await decider('CAL-SCI', 'regul', 'Casse');
  await decider('CLE-USB-32', 'recompter');
  vrai(!!(await pg.$(`${Z} [data-inv-recompte="CLE-USB-32"]`)), 'champ de recomptage');
  await aller(4);
  vrai(/Saisissez la quantité recomptée : CLE-USB-32/.test(await msg()), 'recomptage exigé : ' + await msg());
  await pg.fill(`${Z} [data-inv-recompte="CLE-USB-32"]`, '20'); await pg.dispatchEvent(`${Z} [data-inv-recompte="CLE-USB-32"]`, 'change'); await pg.waitForTimeout(80);
  await aller(4); await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(120);
  const m = await pg.evaluate(() => window.__inv.db.moves.filter((x) => x.type === 'Ajustement inventaire').map((x) => [x.sku, x.delta, x.lot, x.after]));
  egal(m, [['RAM-A4-80', 2, '', 42], ['CAL-SCI', -1, '', 7]], 'ajustements');
});

await v('Inventaire : un inventaire mal déclaré (référence hors catalogue) le dit, sans planter', async () => {
  await monter({ reglages: { lignes: [{ ref: 'INCONNUE-1', compte: 3 }] } }); await ouvrir('inventaire');
  vrai((await texte()).includes('absente du catalogue (INCONNUE-1)'), 'message attendu');
});

/* ============================================================ le périmètre (04/10/2026)
 * Lot 0 de la refonte Cdiscount (brief ENT-2.3) : l'élève ne compte que SA liste. Valeurs à la
 * main : périmètre RAM-A4-80 (A-01-1, 40), AGR-24-6 (A-02-1, 14), CAL-SCI (A-03-1, 8), donné
 * dans le désordre. Écarts 0, −3, −1 → 4 ÷ 62 × 100 = 6,45 → 6,5 %.
 */
const P3 = ['CAL-SCI', 'RAM-A4-80', 'AGR-24-6'];

await v('Inventaire : périmètre pas encore choisi — l’écran attend, sans créer d’état ni débloquer le stock', async () => {
  await monter({ perimetre: true }); await ouvrir('inventaire');
  vrai((await texte()).includes('En attente de votre liste.'), 'message d’attente : ' + await texte());
  vrai(!(await pg.$(`${Z} [data-inv-saisie]`)), 'aucun champ de saisie');
  egal(await etat(), null, 'état');
  const b = await pg.evaluate(async () => (await import('/core/types/inventaire.js')).bilanInventaire(window.__inv.db, window.__inv.U.inventaire, window.__inv.U.CATALOGUE));
  egal([b.commence, b.saisieOk, b.notees], [false, false, 0], 'bilan sans périmètre');
  await ouvrir('stock');
  vrai((await texte()).includes('comptage'), 'le stock reste bloqué');
});

await v('Inventaire : périmètre de 3 lignes — 3 lignes dans l’ordre des emplacements, photo de ces 3 seulement, 3 saisies suffisent', async () => {
  await monter({ perimetre: true, perim: P3 }); await ouvrir('inventaire');
  const refs = await pg.$$eval(`${Z} [data-inv-saisie]`, (l) => l.map((x) => x.dataset.invSaisie));
  egal(refs, ['RAM-A4-80', 'AGR-24-6', 'CAL-SCI'], 'lignes à saisir');
  egal((await etat()).systeme, { 'RAM-A4-80': 40, 'AGR-24-6': 14, 'CAL-SCI': 8 }, 'photo du système');
  await saisirReleve({ 'RAM-A4-80': 40, 'AGR-24-6': 11, 'CAL-SCI': 7 }); await aller(2);
  egal(await msg(), '', 'message à l’étape 1');
  egal((await etat()).etape, 2, 'étape');
  for (const [r, e] of [['RAM-A4-80', 0], ['AGR-24-6', -3], ['CAL-SCI', -1]]) await pg.fill(`${Z} [data-inv-ecart="${r}"]`, String(e));
  await aller(3);
  egal((await etat()).etape, 3, 'étape après les écarts');
  const b = await pg.evaluate(async () => (await import('/core/types/inventaire.js')).bilanInventaire(window.__inv.db, window.__inv.U.inventaire, window.__inv.U.CATALOGUE));
  egal([b.saisieOk, b.ecartsOk, b.lignes.length, b.notees, b.sommeAbs, b.sommeSys, b.tauxAttendu], [true, true, 3, 2, 4, 62, 6.5], 'bilan sur 3 lignes');
});

await v('Inventaire : périmètre — la validation se fait sur le taux du périmètre, et le relevé de la messagerie reste complet', async () => {
  await decider('AGR-24-6', 'rayon'); await decider('CAL-SCI', 'regul', 'Casse'); await aller(4);
  await pg.fill(`${Z} [data-inv-taux]`, '3,7');
  await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(80);
  vrai(/taux d.écart est faux/.test(await msg()), 'le taux de l’allée entière doit être refusé : ' + await msg());
  await pg.fill(`${Z} [data-inv-taux]`, '6,5');
  await pg.click(`${Z} [data-inv-valider]`); await pg.waitForTimeout(80);
  vrai(!!(await pg.$(`${Z} [data-inv-valide]`)), 'inventaire validé');
  vrai((await texte()).includes('2 décisions justes sur 2'), 'correction sur le périmètre : ' + await texte());
  await ouvrir('mail');
  await pg.click(`${Z} .ent-mitem >> text=Relevé de comptage`); await pg.waitForTimeout(80);
  egal((await pg.$$(`${Z} .inv-papier tr`)).length, 8, 'lignes du relevé');
});

await v('Inventaire : périmètre agrandi après le début — la ligne nouvelle s’ajoute avec sa photo du moment', async () => {
  await monter({ perimetre: true, perim: ['RAM-A4-80'] }); await ouvrir('inventaire');
  egal(Object.keys((await etat()).systeme), ['RAM-A4-80'], 'photo de départ');
  await pg.evaluate(() => { window.__inv.db.perim = ['RAM-A4-80', 'CLE-USB-32']; });
  await ouvrir('stock'); await ouvrir('inventaire');
  egal((await etat()).systeme, { 'RAM-A4-80': 40, 'CLE-USB-32': 20 }, 'photo complétée');
  egal(await pg.$$eval(`${Z} [data-inv-saisie]`, (l) => l.map((x) => x.dataset.invSaisie)), ['RAM-A4-80', 'CLE-USB-32'], 'lignes');
});

await v('Inventaire : aucune erreur de console sur tout le parcours', async () => {
  if (erreursInv.length) throw new Error(erreursInv.slice(0, 3).join(' | '));
});

await ctxInv.close();
}
