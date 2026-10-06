// Test de bout en bout des trois séances Spartoo, DANS L'ORDRE : ENT-1.1 → ENT-1.2 → ENT-1.3.
//
// Un élève de démonstration déroule chaque séance en faisant les gestes que la TRAME demande
// (où cliquer, quelle commande taper, quoi saisir), puis on compare ce que l'ÉCRAN affiche aux
// réponses des corrigés `contenus/corriges/ENT-*.js`. Deux sources de vérité qui se contredisent
// = un écart signalé : soit le corrigé est faux, soit le logiciel l'est, et il faut trancher.
//
// Ce que ce test ajoute à `outils/test.mjs` : celui-ci joue 1.2 AVANT 1.1 (la préparation est
// testée d'abord, la réception ensuite) ; l'ordre réel d'un élève n'était donc jamais déroulé,
// et les chiffres du corrigé de 1.2 / 1.3 (qui supposent 1.1 faite) n'étaient jamais confrontés
// à un écran. Les réponses que l'élève SAISIT (tableau de réception, commande, blocage, messages)
// sont reprises du corrigé : si le corrigé était faux, le jalon du suivi le dirait.
//
// Lancer : node outils/test-seances.mjs        (mode démonstration, aucun réseau, ~30 s)
// Ajouter à la suite complète : non — fichier séparé, volontairement, pour ne pas toucher test.mjs.
// Sur GitHub, il tourne à chaque push comme 4e coche, « Tests séances » (depuis le 06/10/2026).

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const PORT = Number(process.env.PORT_SEANCES || 8098);

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  // Mode démonstration par construction : la configuration réelle est refusée.
  if (p === '/prepalog-config.json') { res.writeHead(404); return res.end('404'); }
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(PORT, r));
const URL_SITE = `http://127.0.0.1:${PORT}/`;

const nav = await chromium.launch();
const page = await (await nav.newContext()).newPage();
page.setDefaultTimeout(5000);
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
page.on('dialog', (d) => d.accept());
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if (/Failed to load resource.*\b404\b/.test(m.text())) return;
  erreurs.push('CONSOLE: ' + m.text());
});

const ok = [];
const ko = [];
const v = async (nom, fn) => {
  try { await fn(); ok.push(nom); } catch (e) { ko.push(`${nom} → ${e.message.split('\n')[0]}`); }
};

/* ------------------------------------------------------------------ corrigés */
const CORR = {};
for (const code of ['ENT-1.1', 'ENT-1.2', 'ENT-1.3']) {
  CORR[code] = (await import(pathToFileURL(path.join(ROOT, 'contenus', 'corriges', `${code}.js`)).href)).CORRIGE;
}
// Une réponse du corrigé, retrouvée par le début de la question (comme le générateur).
const rep = (code, debut) => {
  const it = CORR[code].items.find((i) => i.texte.startsWith(debut));
  if (!it) throw new Error(`question introuvable dans ${code} : « ${debut} »`);
  return it;
};
// Tableau de réponses d'une étape (n-ième tableau de l'étape).
const tableau = (code, etape, n = 0) => {
  const t = CORR[code].items.filter((i) => i.etape === etape && i.genre === 'tableau')[n];
  if (!t) throw new Error(`tableau ${n} de l'étape ${etape} introuvable dans ${code}`);
  return t;
};
const brouillon = (code, etape) => CORR[code].items.find((i) => i.etape === etape && i.genre === 'brouillon');

// Normalisation : sans accents, sans casse, sans espace ni ponctuation. « 4 569 », « 4569 » et
// « 4 569 paires » se comparent par inclusion.
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Les écarts : une ligne par divergence entre un écran et un corrigé.
const ecarts = [];
let seanceCourante = '';
function comparer(libelle, ecran, corrige) {
  const e = String(ecran ?? '').trim();
  if (!e || !norm(corrige).includes(norm(e))) {
    ecarts.push(`${seanceCourante} · ${libelle} — ÉCRAN « ${e || '(vide)'} » / CORRIGÉ « ${String(corrige).slice(0, 110)} »`);
  }
}
// L'inverse : l'écran (plus long, avec adresse, code client…) doit CONTENIR la valeur du corrigé.
function contient(libelle, ecran, attendu) {
  if (!norm(attendu) || !norm(ecran).includes(norm(attendu))) {
    ecarts.push(`${seanceCourante} · ${libelle} — ÉCRAN « ${String(ecran ?? '').slice(0, 80)} » / CORRIGÉ « ${attendu} »`);
  }
}
const attendre = (libelle, cond) => { if (!cond) ecarts.push(`${seanceCourante} · ${libelle}`); };

/* ------------------------------------------------------------------- gestes */
const lire = async (sel) => ((await page.textContent(sel)) || '').replace(/\s+/g, ' ').trim();

async function changerEleve(mat, code) {
  if (await page.$('[data-quitter]')) await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco');
  await page.click('#btnDeco');
  await connecterEleve(mat, code);
}
async function connecterEleve(mat = '2601', code = 'aaa1') {
  await page.waitForSelector('#mat');
  await page.fill('#mat', mat); await page.fill('#code', code);
  await page.press('#code', 'Enter');
  await page.waitForSelector('[data-rub="simulog"]');
}
// Le titre de l'activité tel que la TRAME le cite à l'élève (« ouvre l'activité … »).
const TUILE_TRAME = { 'spartoo-reception': 'Spartoo — réception', spartoo: 'Spartoo — préparation', 'spartoo-tracabilite': 'Spartoo — traçabilité' };
async function ouvrirSeance(aid) {
  if (await page.$('[data-quitter]')) { await page.click('[data-quitter]'); }
  await page.waitForSelector('[data-rub="simulog"], [data-act]');
  // Simulog est rangé par entreprise (02/10/2026) : pastille, puis logo Spartoo, puis la séance.
  if (await page.$('[data-rub="simulog"]')) { await page.click('[data-rub="simulog"]'); await page.click('[data-ent="1"]'); }
  await page.waitForSelector(`[data-act="${aid}"]`);
  attendre(`la tuile ${aid} n'a pas le titre « ${TUILE_TRAME[aid]} » cité par la trame`, (await lire(`[data-act="${aid}"]`)).includes(TUILE_TRAME[aid]));
  await page.click(`[data-act="${aid}"]`);
  await page.waitForSelector('.ent-shell');
}
// La séance est-elle fermée à l'élève connecté ? On regarde la tuile ET on tente de l'ouvrir.
async function tuileFermee(aid) {
  if (await page.$('[data-quitter]')) await page.click('[data-quitter]');
  await page.waitForSelector('[data-rub="simulog"], [data-act]');
  // Simulog est rangé par entreprise (02/10/2026) : pastille, puis logo Spartoo, puis la séance.
  if (await page.$('[data-rub="simulog"]')) { await page.click('[data-rub="simulog"]'); await page.click('[data-ent="1"]'); }
  await page.waitForSelector(`[data-act="${aid}"]`);
  const classe = (await page.getAttribute(`[data-act="${aid}"]`, 'class')) || '';
  const texte = await lire(`[data-act="${aid}"]`);
  await page.click(`[data-act="${aid}"]`);
  await page.waitForTimeout(500);
  const ouverte = !!(await page.$('.ent-shell'));
  if (ouverte) await page.click('[data-quitter]');
  return { grisee: /verrouillee/.test(classe), texte, ouverte };
}
// Passer par l'espace enseignant (Suivi), faire quelque chose, et revenir à l'écran de connexion.
async function chezLeProf(fn) {
  if (await page.$('[data-quitter]')) await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco'); await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf'); await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="suivi"]');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('#btnRaz');
  const r = await fn();
  await page.click('#btnRetour'); await page.click('#btnDeco');
  return r;
}
async function choisirEleve(nom) {
  const val = await page.$$eval('#razEleve option', (o, n) => o.find((x) => new RegExp(n, 'i').test(x.textContent)).value, nom);
  await page.selectOption('#razEleve', val);
}
async function profDebloque(nom, aid, mat, code) {
  await chezLeProf(async () => {
    await choisirEleve(nom);
    await page.selectOption('#debSeance', aid);
    await page.click('#btnDebloquer'); await page.waitForTimeout(300);
  });
  await connecterEleve(mat, code);
}
async function vue(nom) { await page.click(`[data-vue="${nom}"]`); await page.waitForTimeout(80); }
async function accueil() {
  await vue('accueil');
  const t = await lire('.ent-main');
  const n = (re) => { const m = t.match(re); return m ? m[1] : ''; };
  return { texte: t, nonLus: n(/(\d+)\s*messages? non lus?/), stock: n(/([\d\s  ]+?)\s*paires en stock/).replace(/[\s  ]/g, ''), rupture: n(/(\d+)\s*références? en rupture/) };
}
// Taper une commande de la console et rendre le texte de SA réponse.
async function cmd(c) {
  await vue('console');
  await page.fill('#champCmd', c);
  await page.press('#champCmd', 'Enter');
  await page.waitForTimeout(120);
  const blocs = await page.$$eval('.ent-cres', (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  return blocs[blocs.length - 1] || '';
}
async function ouvrirMail(motif, dossier = 'in') {
  await vue('mail');
  await page.click(`[data-dossier="${dossier}"]`);
  await page.waitForSelector('.ent-mitem');
  for (const m of await page.$$('.ent-mitem')) {
    if (new RegExp(motif, 'i').test(await m.textContent())) { await m.click(); await page.waitForSelector('.ent-lecteur'); return lire('.ent-lecteur'); }
  }
  throw new Error('mail introuvable : ' + motif);
}
async function listeMails(dossier = 'in') {
  await vue('mail');
  await page.click(`[data-dossier="${dossier}"]`);
  await page.waitForTimeout(80);
  return page.$$eval('.ent-mitem', (e) => e.map((x) => ({ nonlu: x.classList.contains('nonlu'), t: x.textContent.replace(/\s+/g, ' ').trim() })));
}
async function ecrireAuFournisseur(supId, objet, corps) {
  await vue('mail');
  await page.click('[data-nouveau]');
  await page.waitForSelector('#mTo');
  await page.selectOption('#mTo', supId);
  await page.fill('#mObj', objet);
  await page.fill('#mTxt', corps);
  await page.click('[data-envoyer-fou]');
  await page.waitForTimeout(300);
}
async function repondre(motif, corps) {
  await ouvrirMail(motif);
  await page.click('[data-repondre]');
  await page.fill('#repT', corps);
  await page.click('#formRep button[type="submit"]');
  await page.waitForTimeout(300);
}
// Les scores que le suivi de classe afficherait, lus tels que le backend de démonstration les range.
async function scores() {
  return page.evaluate(() => {
    // Seulement les scores de l'élève connecté : la classe de démonstration en a plusieurs.
    const o = {};
    let uid = null;
    try { uid = JSON.parse(localStorage.getItem('prepalog:session')); } catch (e) { uid = localStorage.getItem('prepalog:session'); }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith('prepalog:travaux/')) {
        const [, , u, aid] = k.replace('prepalog:', '').split('/');
        if (u === uid) o[aid] = JSON.parse(localStorage.getItem(k));
      }
    }
    return o;
  });
}
const prenomEleve = 'Léa';
const sansBalises = (texte, date) => texte.replace(/\[prénom\]/g, prenomEleve).replace(/\[jj\/mm\/aaaa[^\]]*\]/g, date || '01/01/2026');

/* ===================================================================== amorçage */
await page.goto(URL_SITE);
await page.waitForSelector('#btnProf');
await v('amorçage : l\'enseignant crée un groupe et un élève', async () => {
  await page.click('#btnProf'); await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace'); await page.waitForSelector('#gNom');
  await page.fill('#gNom', '1 LOG A'); await page.click('#btnCreerG'); await page.waitForSelector('text=1 LOG A');
  await page.click('[data-ong="comptes"]'); await page.waitForSelector('#lot');
  await page.fill('#lot', 'DUPONT ; Léa ; 2601 ; aaa1\nMARTIN ; Noé ; 2602 ; bbb2\nPETIT ; Zoé ; 2603 ; ccc3');
  await page.click('#btnLot');
  await page.waitForSelector('text=3 comptes');
  await page.click('#btnRetour'); await page.click('#btnDeco');
  await connecterEleve();
});

await v('parcours : au départ, seule ENT-1.1 est ouverte à Léa', async () => {
  const f11 = await tuileFermee('spartoo-reception'), f12 = await tuileFermee('spartoo'), f13 = await tuileFermee('spartoo-tracabilite');
  attendre(`1.1 ouverte (${JSON.stringify(f11)})`, !f11.grisee && f11.ouverte);
  attendre(`1.2 fermée (${JSON.stringify(f12)})`, f12.grisee && !f12.ouverte);
  attendre(`1.3 fermée (${JSON.stringify(f13)})`, f13.grisee && !f13.ouverte);
});

/* ================================================================ ENT-1.1 ====== */
seanceCourante = 'ENT-1.1';
const C11 = 'ENT-1.1';
let dateEntree = '';

await v('ENT-1.1 · étape 3 : le message de M. Morin dit la procédure du corrigé', async () => {
  await ouvrirSeance('spartoo-reception');
  const t = await ouvrirMail('Procédure de réception');
  attendre('étape 3 : la règle « écart de quantité OU carton endommagé » n\'est pas dans le message', /écart de quantité OU un carton endommagé/.test(t));
  attendre('étape 3 : le corrigé ne cite pas les deux cas', /écart de quantité/.test(rep(C11, 'Dans quels deux cas').rep) && /carton (est )?endommagé/.test(rep(C11, 'Dans quels deux cas').rep));
  attendre('étape 3 : « inutilisable » absent du message', /inutilisable/.test(t) && /inutilisable/.test(rep(C11, 'Dans quel cas seulement').rep));
  attendre('étape 3 : « Sans lot, pas de traçabilité » absent du message', /pas de traçabilité/.test(t) && /traçabilité/.test(rep(C11, 'À quoi sert le numéro de lot').rep));
});

await v('ENT-1.1 · étape 4 : le bon de livraison donne ce que relève le corrigé', async () => {
  const t = await ouvrirMail('Bon de livraison');
  const tab = tableau(C11, 4, 0);   // Information | Ce que tu relèves
  const val = (i) => tab.reponses[i][1];
  comparer('n° du bon de livraison', (t.match(/Bon de livraison (BL-\d+)/) || [])[1], val(0));
  const dateExp = (t.match(/Date d'expédition\s*(\d{2}\/\d{2}\/\d{4})/) || [])[1];
  attendre('étape 4 : la date d\'expédition n\'est pas lisible sur le bon', !!dateExp);
  comparer('transporteur', (t.match(/Transporteur\s*(.+?)\s*Réf\./) || [])[1], val(2));
  comparer('numéro de lot', (t.match(/Numéro de lot\s*(LOT-[A-Z0-9-]+)/) || [])[1], val(3));
  comparer('total de paires annoncées', (t.match(/(\d+) paires annoncées/) || [])[1], val(4));
  const lignes = tableau(C11, 4, 1);
  const bl = await page.$$eval('.ent-lecteur table tbody tr', (rows) => rows.map((r) => [...r.cells].map((c) => c.textContent.replace(/\s+/g, ' ').trim())));
  for (const [sku, , q] of lignes.reponses) {
    const l = bl.find((x) => x[0] === sku);
    attendre(`étape 4 : ${sku} absent du bon de livraison à l'écran`, !!l);
    if (l) comparer(`quantité annoncée ${sku}`, l[l.length - 1], q);
  }
});

await v('ENT-1.1 · étape 5 : le comptage des colis donne le tableau du corrigé', async () => {
  await vue('receptions');
  await page.click('[data-ouvrir-rec]');
  await page.waitForSelector('#recLot');
  const colis = await page.$$eval('.ent-main table tbody tr', (rows) => rows.map((r) => [...r.cells].map((c) => c.textContent.replace(/\s+/g, ' ').trim())));
  const parRef = {};
  colis.filter((c) => /^\d+$/.test(c[0]) && /^[A-Z]{2}-/.test(c[1])).forEach((c) => {
    const e = parRef[c[1]] || (parRef[c[1]] = { qte: 0, n: [], abime: false });
    e.qte += parseInt(c[3], 10); e.n.push(c[0]); e.abime = e.abime || /endommag/i.test(c[4]);
  });
  const tab = tableau(C11, 5, 0);
  for (const [sku, colisTxt, compte, annonce, ecart] of tab.reponses) {
    const e = parRef[sku];
    attendre(`étape 5 : ${sku} absent des colis à l'écran`, !!e);
    if (!e) continue;
    comparer(`quantité comptée ${sku}`, e.qte, compte);
    comparer(`numéros de colis ${sku}`, e.n.join(' et '), colisTxt.replace(/colis/g, '').replace(/ +/g, ' '));
    if (e.abime) comparer(`carton endommagé ${sku}`, 'endommagé', ecart);
  }
  comparer('référence en carton endommagé', Object.keys(parRef).find((k) => parRef[k].abime), rep(C11, 'Quelle référence est arrivée dans un carton endommagé').rep);
  const ecartRef = Object.keys(parRef).find((k) => {
    const a = tableau(C11, 4, 1).reponses.find((r) => r[0] === k);
    return a && parseInt(a[2], 10) !== parRef[k].qte;
  });
  comparer('référence avec écart', ecartRef, rep(C11, 'Sur quelle référence y a-t-il un écart').rep);
});

await v('ENT-1.1 · étape 6 : saisir le bon de réception tel que le corrigé le donne', async () => {
  const tab = tableau(C11, 6, 0);   // Référence | Annoncé | Compté | État | Décision
  const lot = (tab.note.match(/LOT-[A-Z0-9-]+/) || [''])[0];
  await page.fill('#recLot', lot);
  for (const [sku, annonce, compte, etat, decision] of tab.reponses) {
    await page.fill(`[data-rec="annonce"][data-sku="${sku}"]`, annonce);
    await page.fill(`[data-rec="compte"][data-sku="${sku}"]`, compte);
    for (const [champ, texte] of [['etat', etat], ['decision', decision]]) {
      const options = await page.$$eval(`[data-rec="${champ}"][data-sku="${sku}"] option`, (o) => o.map((x) => ({ value: x.value, text: x.textContent })));
      const cible = options.find((o) => o.value && norm(o.text) === norm(texte));
      attendre(`étape 6 : le libellé « ${texte} » du corrigé n'existe pas dans la liste « ${champ} » (${options.map((o) => o.text).join(' / ')})`, !!cible);
      if (cible) await page.selectOption(`[data-rec="${champ}"][data-sku="${sku}"]`, cible.value);
    }
  }
  await page.waitForSelector('[data-valider-rec]:not([disabled])');
});

await v('ENT-1.1 · étape 7 : valider, puis vérifier dans la console (.movements, .getlot)', async () => {
  await page.click('[data-valider-rec]');
  await page.waitForTimeout(400);
  attendre('étape 7 : « Réception validée » absent', /Réception validée/.test(await lire('.ent-main')));
  const mouv = await cmd('.movements');
  comparer('type de mouvement de .movements', (mouv.match(/Entrée : réception/) || [])[0], rep(C11, 'Quel type de mouvement apparaît').rep);
  await cmd('.getstock PM-SUE-RG-39');
  const lot = await cmd('.getlot LOT-PM-2609');
  comparer('total entré avec le lot', (lot.match(/Entrées\s*(\d+)/) || [])[1], rep(C11, 'Combien de paires, au total').rep);
  attendre('étape 7 : .getlot ne nomme pas Puma', /Puma/.test(lot));
  comparer('fournisseur de .getlot', (lot.match(/F\d{3}/) || [])[0], rep(C11, 'Quel fournisseur .getlot').rep);
  attendre('étape 7 : le message « tout le lot est encore en stock » n\'est pas à l\'écran', /Aucune sortie : tout le lot est encore en stock/.test(lot));
  attendre('étape 7 : le corrigé ne cite pas ce message', /Aucune sortie : tout le lot est encore en stock/.test(rep(C11, 'Pourquoi la ligne « Sorties »').note));
  dateEntree = (lot.match(/Entré le\s*(\d{2}\/\d{2}\/\d{4})/) || [])[1] || '';
});

await v('ENT-1.1 · étape 8 : envoyer les réserves à Puma (message modèle du corrigé)', async () => {
  const b = brouillon(C11, 8);
  const modele = sansBalises(b.modele);
  await ecrireAuFournisseur('F003', 'Réserves sur le lot LOT-PM-2609', modele);
  const recus = await listeMails('in');
  const reponse = recus.find((m) => /RE : Réserves/.test(m.t));
  attendre('étape 8 : Puma ne répond pas du tout au message de réserves', !!reponse);
  if (reponse) {
    const t = await ouvrirMail('RE : Réserves');
    // La réponse automatique du fournisseur a été écrite pour une COMMANDE (minimum de commande).
    // Sur un message de réserves, elle ne doit pas parler de commande.
    attendre('étape 8 : la réponse de Puma à des RÉSERVES parle de commande / de minimum de commande : ' + t.replace(/^.*Bonjour,/, 'Bonjour,').slice(0, 140),
      !/minimum de commande|commande bien reçue|demande, pour un total/i.test(t));
    attendre('étape 8 : la réponse de Puma ne nomme ni les réserves ni le lot', /réserves/.test(t) && /LOT-PM-2609/.test(t));
  }
  const s = (await scores())['spartoo-reception'];
  attendre(`étape 8 : le suivi n'affiche pas 3/3 pour ENT-1.1 (lu : ${s ? s.score + '/' + s.max : 'rien'})`, s && s.score === 3 && s.max === 3);
});

/* ================================================================ ENT-1.2 ====== */
seanceCourante = 'ENT-1.2';
const C12 = 'ENT-1.2';
let stockApres11 = null;

await v('ENT-1.2 · étape 1 : les trois chiffres de l\'accueil, APRÈS la séance 1.1', async () => {
  await ouvrirSeance('spartoo');
  const a = await accueil();
  stockApres11 = a;
  comparer('messages non lus', a.nonLus, rep(C12, 'Combien de messages non lus').rep);
  comparer('paires en stock au total', a.stock, rep(C12, 'Combien de paires y a-t-il en stock').rep);
  comparer('références en rupture', a.rupture, rep(C12, 'Combien de références sont en rupture').rep);
});

await v('ENT-1.2 · étape 2 : fournisseurs et clients (deux écrans)', async () => {
  // La trame dit « la rubrique Clients / Fournisseurs, qui contient deux onglets ».
  // Le logiciel a deux écrans (« Clients », « Fournisseurs »), pas une rubrique à deux onglets :
  // la trame ne doit pas parler d'onglets (elle le faisait jusqu'au 02/10/2026).
  const nav = await page.$$eval('.ent-nav', (e) => e.map((x) => x.textContent.replace(/\d+$/, '').trim()));
  attendre('étape 2 : le menu n\'a pas les deux écrans Clients et Fournisseurs', nav.includes('Clients') && nav.includes('Fournisseurs'));
  const srcTrame = fs.readFileSync(path.join(ROOT, 'outils', 'trame-spartoo.py'), 'utf8');
  attendre('étape 2 : la trame parle encore d\'« onglets » ou d\'une rubrique « Clients / Fournisseurs » (l\'écran a deux menus séparés)',
    !/l.onglet (Clients|Fournisseurs)|Clients \/ Fournisseurs/.test(srcTrame));
  await vue('fournisseurs');
  const note = await lire('.ent-tete .note');
  comparer('nombre de fournisseurs', (note.match(/(\d+) fournisseurs/) || [])[1], rep(C12, 'Combien de fournisseurs').rep);
  const lignes = await page.$$eval('#entListe tbody tr', (r) => r.map((x) => [...x.cells].map((c) => c.textContent.replace(/\s+/g, ' ').trim())));
  const delais = rep(C12, 'Choisis un de ces fournisseurs').rep;
  const mini = rep(C12, 'Quel est son minimum de commande').rep;
  for (const l of lignes.slice(0, 10)) {   // code, marque, société, contact, tél, mail, adr, délai, franco, mini
    comparer(`délai ${l[1]}`, `${l[1]} ${parseInt(l[7], 10)} j`, delais);
    comparer(`minimum de commande ${l[1]}`, `${l[1]} ${parseInt(l[9], 10)}`, mini);
  }
  const t3 = tableau(C12, 2, 0);
  for (const [code, marque] of t3.reponses) {
    attendre(`étape 2 : ${code} ${marque} n'est pas dans la liste des fournisseurs`, lignes.some((l) => l[0] === code && norm(l[1]) === norm(marque)));
  }
  await vue('clients');
  const noteC = await lire('.ent-tete .note');
  comparer('nombre de clients', (noteC.match(/(\d+) clients/) || [])[1], rep(C12, 'Les clients de Spartoo').note);
  const cl = await page.$$eval('#entListe tbody tr', (r) => r.map((x) => [...x.cells].map((c) => c.textContent.replace(/\s+/g, ' ').trim())));
  for (const [code, nom, ville] of tableau(C12, 2, 1).reponses) {
    const l = cl.find((x) => x[0] === code);
    attendre(`étape 2 : client ${code} introuvable`, !!l);
    if (l) { comparer(`nom du client ${code}`, l[1], nom); contient(`ville du client ${code}`, l[4], ville); }
  }
});

await v('ENT-1.2 · étape 3 : console, .help et .getprice / .getsupplier', async () => {
  const aide = await cmd('.help');
  const t = tableau(C12, 3, 0);
  for (const [c] of t.reponses) attendre(`étape 3 : « ${c} » n'est pas dans .help`, norm(aide).includes(norm(c.split(' ')[0])));
  const note = tableau(C12, 3, 0).note;
  for (const c of (note.match(/\.[a-z]+/g) || []).filter((x) => x !== '.help')) attendre(`étape 3 : le corrigé accepte ${c} qui n'est pas dans .help`, norm(aide).includes(norm(c)));
  const prix = await cmd('.getprice PM-SUE');
  comparer('prix de vente TTC', (prix.match(/Prix TTC\s*([\d,]+)/) || [])[1], rep(C12, 'Avec .getprice PM-SUE, quel est le prix de vente TTC').rep);
  comparer('prix d\'achat HT', (prix.match(/Prix d'achat HT\s*([\d,]+)/) || [])[1], rep(C12, 'Avec .getprice PM-SUE, quel est le prix d\'achat HT').rep);
  const f = await cmd('.getsupplier Puma');
  comparer('délai Puma', (f.match(/Délai\s*(\d+) jours/) || [])[1] + ' jours', rep(C12, 'Avec .getsupplier Puma').rep);
});

await v('ENT-1.2 · étape 4 : répondre à Léa Dubois (chiffre du corrigé)', async () => {
  const mail = await ouvrirMail('Question sur les Stan Smith');
  comparer('objet du message de Léa Dubois', 'Question sur les Stan Smith blanches', rep(C12, 'Quel est l\'objet du message').rep);
  attendre('étape 4 : la pointure 44 n\'est pas dans le message', /44/.test(mail));
  const s = await cmd('.getstock AD-STS-BL-44');
  comparer('stock AD-STS-BL-44', (s.match(/Stock\s*(\d+)/) || [])[1], rep(C12, 'Combien de paires sont disponibles').rep);
  await repondre('Question sur les Stan Smith', sansBalises(brouillon(C12, 4).modele));
});

await v('ENT-1.2 · étape 5 : la commande CMD-048213, remplie comme le corrigé', async () => {
  await ouvrirMail('Nouvelle commande web');
  await page.click('[data-enreg-cmd]');
  await page.waitForSelector('[data-prep="seen"]');
  const tab = tableau(C12, 5, 0);   // Référence | Stock trouvé | Emplacement | À préparer | Statut
  const lignesEcran = await page.$$eval('[data-prep="seen"]', (e) => e.map((x) => x.dataset.sku));
  comparer('nombre de lignes de la commande', lignesEcran.length, rep(C12, 'Combien de références (lignes)').rep);
  const opt = await page.$$eval('[data-prep="status"] option', (o) => [...new Set(o.map((x) => x.value + '=' + x.textContent))]);
  for (const [sku, seen, loc, qty, statut] of tab.reponses) {
    attendre(`étape 5 : ${sku} n'est pas une ligne de la commande à l'écran`, lignesEcran.includes(sku));
    const st = await cmd('.getstock ' + sku);
    comparer(`stock trouvé ${sku}`, (st.match(/Stock\s*(\d+)/) || [])[1], seen);
    const lc = await cmd('.getlocation ' + sku);
    comparer(`emplacement ${sku}`, (lc.match(/[A-Z]-\d{2}-\d/) || [])[0], loc);
  }
  await vue('commandes');
  const ligneCmd = '[data-ouvrir-cmd], tr[data-cmd], [data-commande]';
  if (await page.$(ligneCmd)) await page.click(ligneCmd);
  if (!(await page.$('[data-prep="seen"]'))) {
    await ouvrirMail('Nouvelle commande web');
    await page.click('[data-ouvrir-cmd]');
    await page.waitForSelector('[data-prep="seen"]');
  }
  for (const [sku, seen, loc, qty, statut] of tab.reponses) {
    await page.fill(`[data-prep="seen"][data-sku="${sku}"]`, seen);
    await page.fill(`[data-prep="loc"][data-sku="${sku}"]`, loc);
    await page.fill(`[data-prep="qty"][data-sku="${sku}"]`, qty);
    const options = await page.$$eval(`[data-prep="status"][data-sku="${sku}"] option`, (o) => o.map((x) => ({ value: x.value, text: x.textContent })));
    const cible = options.find((o) => o.value && norm(o.text) === norm(statut));
    attendre(`étape 5 : le statut « ${statut} » du corrigé n'existe pas (${options.map((o) => o.text).join(' / ')})`, !!cible);
    if (cible) await page.selectOption(`[data-prep="status"][data-sku="${sku}"]`, cible.value);
  }
  await page.click('[data-bon]');
  await page.waitForSelector('[data-valider]:not([disabled])');
  await page.click('[data-valider]');
  await page.waitForTimeout(400);
  const apres = await cmd('.getstock NK-AM270-NR-42');
  comparer('stock de NK-AM270-NR-42 après validation', (apres.match(/Stock\s*(\d+)/) || [])[1], rep(C12, 'Que se passe-t-il exactement').rep);
  const apres2 = await cmd('.getstock AD-STS-BL-41');
  comparer('stock de AD-STS-BL-41 après validation', (apres2.match(/Stock\s*(\d+)/) || [])[1], rep(C12, 'Que se passe-t-il exactement').rep);
  const mv = await cmd('.movements');
  comparer('type du mouvement de préparation', (mv.match(/Sortie : préparation/) || [])[0], rep(C12, 'Que se passe-t-il exactement').note);
  comparer('bon de préparation', (mv.match(/BP-\d{6}/) || [])[0], rep(C12, 'Que se passe-t-il exactement').note);
});

await v('ENT-1.2 · étape 6 : réapprovisionner Puma, comme le corrigé', async () => {
  const tab = tableau(C12, 6, 0);   // Référence | Stock actuel | Seuil | Stock maximum | Quantité
  const lignes = [];
  for (const l of tab.reponses) {
    const sku = (l[0].match(/[A-Z]{2}-[A-Z0-9]+-[A-Z]{2}-\d{1,2}/) || [])[0];
    const s = await cmd('.getstock ' + sku);
    comparer(`stock actuel ${sku}`, (s.match(/Stock\s*(\d+)/) || [])[1], l[1]);
    comparer(`seuil ${sku}`, (s.match(/Seuil\s*(\d+)/) || [])[1], l[2]);
    comparer(`stock maximum ${sku}`, (s.match(/Stock maximum\s*(\d+)/) || [])[1], l[3]);
    lignes.push(`${sku} : ${parseInt(l[4], 10)} paires`);
  }
  comparer('seuil de PM-SUE', (await cmd('.getstock PM-SUE-NR-40')).match(/Seuil\s*(\d+)/)[1], rep(C12, 'Qu\'est-ce que le « seuil »').rep);
  await ecrireAuFournisseur('F003', 'Commande de réapprovisionnement', 'Bonjour,\n\n' + lignes.join('\n') + '\n\nCordialement');
  const t = await ouvrirMail('RE : Commande de réapprovisionnement');
  attendre('étape 6 : le fournisseur ne confirme pas le minimum de commande avec les quantités du corrigé : ' + t.slice(0, 220), /minimum de commande \(20 paires\) est respecté/.test(t));
  const s = (await scores())['spartoo'];
  attendre(`étape 6 : le suivi n'affiche pas 3/3 pour ENT-1.2 (lu : ${s ? s.score + '/' + s.max : 'rien'})`, s && s.score === s.max);
});

/* ================================================================ ENT-1.3 ====== */
seanceCourante = 'ENT-1.3';
const C13 = 'ENT-1.3';

await v('ENT-1.3 · étape 2 : l\'alerte de Puma et la consigne de M. Morin', async () => {
  await ouvrirSeance('spartoo-tracabilite');
  const mails = await listeMails('in');
  const nouveaux = mails.filter((m) => m.nonlu && /URGENT|Lot LOT-PM-2609 : traçabilité/.test(m.t));
  attendre(`étape 2 : la trame dit « deux messages t'attendent » : ${nouveaux.length} message(s) neuf(s) non lu(s) (${mails.filter((m) => m.nonlu).length} non lus en tout)`, nouveaux.length === 2);
  const t = await ouvrirMail('URGENT');
  const tab = tableau(C13, 2, 0);
  // Les lignes du tableau se lisent par leur intitulé, pas par leur rang : la reprise des trames du
  // 04/10/2026 les a remises dans un autre ordre, et le test comparait l'expéditeur à la nature du défaut.
  const ligne = (re) => {
    const l = tab.reponses.find((r) => re.test(r[0]));
    if (!l) throw new Error(`étape 2 : aucune ligne ${re} dans le tableau du corrigé (${tab.reponses.map((r) => r[0]).join(' / ')})`);
    return l[1];
  };
  comparer('lot concerné', (t.match(/LOT-[A-Z0-9-]+/) || [])[0], ligne(/lot/i));
  attendre('étape 2 : l\'expéditeur de l\'alerte n\'est pas celui du corrigé', /Marc Oberlé/.test(t) && /Oberlé/.test(ligne(/envoyé|expéditeur/i)));
  attendre('étape 2 : la nature du défaut ne correspond pas', /collage/i.test(t) && /collage/i.test(ligne(/nature/i)));
  attendre('étape 2 : « pas visible à l\'œil nu » absent', /visible à l.œil nu/.test(t) && /Non/.test(rep(C13, 'Le défaut est-il visible').rep));
});

let reception = '';
await v('ENT-1.3 · étape 3 : .getlot, l\'amont du lot', async () => {
  const lot = await cmd('.getlot LOT-PM-2609');
  const tab = tableau(C13, 3, 0);   // Information | Ce que tu relèves
  const val = (nom) => (tab.reponses.find((r) => norm(r[0]).startsWith(norm(nom))) || [, ''])[1];
  comparer('fournisseur', (lot.match(/Fournisseur\s*([A-Za-z]+(?: \(F\d+\))?)/) || [])[1], val('Fournisseur'));
  attendre('étape 3 : la date d\'entrée n\'est pas au format jj/mm/aaaa à l\'écran', /Entré le\s*\d{2}\/\d{2}\/\d{4}/.test(lot));
  dateEntree = (lot.match(/Entré le\s*(\d{2}\/\d{2}\/\d{4})/) || [])[1] || dateEntree;
  reception = (lot.match(/REC-\d+/) || [])[0];
  comparer('numéro de lot', (lot.match(/LOT-[A-Z]{2}-\d{4}/) || [])[0], val('Numéro de lot'));
  comparer('numéro de réception', reception, val('Numéro de réception'));
  comparer('nombre total entré', (lot.match(/Entrées\s*(\d+)/) || [])[1], val('Nombre total'));
  comparer('sorties (étape 4)', (lot.match(/Sorties\s*(\d+)/) || [])[1], tab.note);
  comparer('reste en stock (étape 4)', (lot.match(/Reste en stock\s*(\d+)/) || [])[1], tab.note);
  // La fiche d'identité attendue par la trame : numéro de lot — fournisseur — date — réception — total.
  const lignesTrame = [['numéro de lot', /lot/i], ['fournisseur', /fournisseur/i], ['date d\'entrée en stock', /entré|date/i], ['numéro de réception', /réception/i], ['nombre total de paires entrées', /entrées|total/i]];
  for (const [l, re] of lignesTrame) {
    attendre(`étape 3 : la trame demande « ${l} » mais le tableau du corrigé n'a pas de ligne pour cela (lignes : ${tab.reponses.map((r) => r[0]).join(' / ')})`,
      tab.reponses.some((r) => re.test(r[0])));
  }
  const enPlus = tab.reponses.filter((r) => !lignesTrame.some(([, re]) => re.test(r[0])));
  attendre(`étape 3 : le corrigé donne des lignes que la trame ne demande pas : ${enPlus.map((r) => r[0]).join(' / ')}`, enPlus.length === 0);
  const entrees = tableau(C13, 3, 1);
  for (const [sku, , q] of entrees.reponses) {
    const m = lot.match(new RegExp(sku + '[^\\d]*?(\\d+)'));
    attendre(`étape 3 : ${sku} absent du tableau « Entrées »`, lot.includes(sku));
    void q; void m;
  }
});

await v('ENT-1.3 · étape 4 : les sorties (aval) du lot', async () => {
  await vue('console');
  const lignes = await page.$$eval('.ent-cres:last-child tr, .ent-cres tr', (r) => r.map((x) => [...x.cells].map((c) => c.textContent.replace(/\s+/g, ' ').trim()))).catch(() => []);
  const sorties = lignes.filter((l) => l.some((c) => /^BP-\d+/.test(c)) && l.some((c) => /^CMD-\d+/.test(c)));
  const tab = tableau(C13, 4, 0);   // Réf | Qté | BP | CMD | Client
  attendre(`étape 4 : ${sorties.length} ligne(s) de sorties à l'écran, ${tab.reponses.length} dans le corrigé`, sorties.length === tab.reponses.length);
  for (const [sku, q, bp, cmdNo, client] of tab.reponses) {
    const l = sorties.find((x) => x.includes(bp) && x.includes(sku)) || sorties.find((x) => x.includes(bp));
    attendre(`étape 4 : ligne ${sku} / ${bp} introuvable dans les sorties`, !!l);
    if (l) { comparer(`commande de ${bp}`, l.find((c) => /^CMD-/.test(c)), cmdNo); contient(`client de ${bp}`, l[l.length - 1], client.replace(/ \(C\d+\)/, '')); }
  }
  const clients = new Set(sorties.map((l) => l[l.length - 1]));
  comparer('nombre de clients différents', clients.size, rep(C13, 'Combien de clients différents').rep);
});

await v('ENT-1.3 · étape 5 : stock par référence et reste du lot', async () => {
  const tab = tableau(C13, 5, 0);   // Réf | Entré | Déjà sorti | Reste à bloquer
  const stocks = rep(C13, 'Avec .getstock suivi d\'une de ces références').rep;
  for (const [sku, , , reste] of tab.reponses) {
    const s = await cmd('.getstock ' + sku);
    comparer(`stock total ${sku}`, `${sku} : ${(s.match(/Stock\s*(\d+)/) || [])[1]}`, stocks);
    void reste;
  }
  const lot = await cmd('.getlot LOT-PM-2609');
  comparer('total à bloquer = reste en stock', (lot.match(/Reste en stock\s*(\d+)/) || [])[1], tab.note);
});

await v('ENT-1.3 · étape 6 : bloquer le stock restant, comme le corrigé', async () => {
  const tab = tableau(C13, 5, 0);
  await vue('blocage');
  for (const [sku, , , reste] of tab.reponses) {
    await page.fill('#blLot', 'LOT-PM-2609');
    await page.fill('#blRef', sku);
    await page.fill('#blQte', reste);
    await page.fill('#blMotif', 'blocage qualité, défaut fabricant');
    await page.click('#formBloc button[type="submit"]');
    await page.waitForTimeout(250);
    attendre(`étape 6 : le blocage de ${reste} × ${sku} est refusé : ${(await lire('.avis-err').catch(() => '')).slice(0, 120)}`, !(await page.$('.avis-err')));
  }
  const lot = await cmd('.getlot LOT-PM-2609');
  // La question « Que vaut maintenant le Reste en stock du lot ? » a quitté le corrigé le 04/10/2026 :
  // la valeur attendue est écrite ici à la main (tout le reste du lot est bloqué : il ne reste rien).
  attendre(`étape 6 : après le blocage, le lot n'est pas vide (lu « Reste en stock ${(lot.match(/Reste en stock\s*(\d+)/) || [])[1]} »)`,
    (lot.match(/Reste en stock\s*(\d+)/) || [])[1] === '0');
  comparer('type de mouvement de blocage', (lot.match(/Blocage qualité/) || [])[0], rep(C13, 'Quel type de mouvement apparaît').rep);
});

await v('ENT-1.3 · étape 7 : le compte rendu à M. Morin (modèle du corrigé)', async () => {
  await repondre('traçabilité et blocage', sansBalises(brouillon(C13, 7).modele, dateEntree));
  const s = (await scores())['spartoo-tracabilite'];
  attendre(`étape 7 : le suivi n'affiche pas 3/3 pour ENT-1.3 (lu : ${s ? s.score + '/' + s.max : 'rien'})`, s && s.score === s.max);
});

/* ============================================== parcours HORS ORDRE (point 4) ====== */
// Rien dans le logiciel n'oblige à faire 1.1 avant 1.2 ou 1.3 : ces parcours disent ce qui se
// passe quand même, séance par séance.
const etatBase = async () => {
  const a = await accueil();
  return a;
};

// --- Noé ouvre la traçabilité (1.3) sans rien avoir fait avant.
seanceCourante = 'hors ordre · 1.3 seule';
let noe13 = {};
await v('hors ordre · ENT-1.3 ouverte sans 1.1 ni 1.2 : jouable, 3/3 avec les valeurs du corrigé', async () => {
  await changerEleve('2602', 'bbb2');
  // Le parcours est strict : sans 1.1 ni 1.2 validées, 1.2 et 1.3 sont fermées et ne s'ouvrent pas.
  const f12 = await tuileFermee('spartoo'), f13 = await tuileFermee('spartoo-tracabilite');
  attendre(`le verrou : 1.2 fermée à un élève qui n'a pas validé 1.1 (${JSON.stringify(f12)})`, f12.grisee && !f12.ouverte && /ENT-1\.1/.test(f12.texte));
  attendre(`le verrou : 1.3 fermée à un élève qui n'a pas validé 1.2 (${JSON.stringify(f13)})`, f13.grisee && !f13.ouverte && /ENT-1\.2/.test(f13.texte));
  // L'enseignant le débloque à la main ; il repart de la base de départ.
  await profDebloque('MARTIN', 'spartoo-tracabilite', '2602', 'bbb2');
  const f13b = await tuileFermee('spartoo-tracabilite');
  attendre(`le déblocage manuel ouvre 1.3 (${JSON.stringify(f13b)})`, f13b.ouverte);
  await ouvrirSeance('spartoo-tracabilite');
  noe13.accueil = await accueil();
  noe13.mails = (await listeMails('in')).map((m) => m.t.replace(/\d{2}\/\d{2}\/\d{4}.*/, '').trim() + ' / ' + m.t.replace(/.*\d{4}\s*/, '').slice(0, 40));
  const lot = await cmd('.getlot LOT-PM-2609');
  noe13.reception = (lot.match(/REC-\d+/) || [])[0];
  noe13.entrees = (lot.match(/Entrées\s*(\d+)/) || [])[1];
  noe13.sorties = (lot.match(/Sorties\s*(\d+)/) || [])[1];
  noe13.reste = (lot.match(/Reste en stock\s*(\d+)/) || [])[1];
  noe13.date = (lot.match(/Entré le\s*(\d{2}\/\d{2}\/\d{4})/) || [])[1];
  contient('1.3 seule : numéro de réception', noe13.reception, 'REC-04118');
  attendre(`1.3 seule : le corrigé annonce 24 / 6 / 18 (lu ${noe13.entrees} / ${noe13.sorties} / ${noe13.reste})`, noe13.entrees === '24' && noe13.sorties === '6' && noe13.reste === '18');
  await vue('blocage');
  for (const [sku, , , reste] of tableau(C13, 5, 0).reponses) {
    await page.fill('#blLot', 'LOT-PM-2609'); await page.fill('#blRef', sku); await page.fill('#blQte', reste);
    await page.fill('#blMotif', 'blocage qualité, défaut fabricant');
    await page.click('#formBloc button[type="submit"]'); await page.waitForTimeout(200);
  }
  await repondre('traçabilité et blocage', sansBalises(brouillon(C13, 7).modele, noe13.date));
  const sc = (await scores())['spartoo-tracabilite'];
  attendre(`1.3 seule : le suivi n'affiche pas 3/3 (lu : ${sc ? sc.score + '/' + sc.max : 'rien'})`, sc && sc.score === sc.max);
  noe13.stockTotal = (await accueil()).stock;
});

// --- Noé ouvre ENSUITE la préparation (1.2), puis la réception (1.1) : la réception d'un
// collègue est déjà dans sa base, et la sienne arrive par-dessus.
seanceCourante = 'hors ordre · 1.3 puis 1.2 puis 1.1';
let noeSuite = {};
await v('hors ordre · après 1.3 : 1.2 puis 1.1 restent ouvrables et ne se contredisent pas', async () => {
  await profDebloque('MARTIN', 'spartoo', '2602', 'bbb2');
  await ouvrirSeance('spartoo');
  noeSuite.acc12 = await accueil();
  await ouvrirSeance('spartoo-reception');
  noeSuite.acc11 = await accueil();
  await vue('receptions');
  noeSuite.receptions = await page.$$eval('.ent-main tbody tr', (r) => r.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  // Il fait la réception 1.1 comme le corrigé : le lot entre une seconde fois.
  await page.click('[data-ouvrir-rec="REC-04127"]');
  await page.waitForSelector('#recLot');
  const tab = tableau(C11, 6, 0);
  await page.fill('#recLot', 'LOT-PM-2609');
  for (const [sku, annonce, compte, etat, decision] of tab.reponses) {
    await page.fill(`[data-rec="annonce"][data-sku="${sku}"]`, annonce);
    await page.fill(`[data-rec="compte"][data-sku="${sku}"]`, compte);
    for (const [champ, texte] of [['etat', etat], ['decision', decision]]) {
      const o = await page.$$eval(`[data-rec="${champ}"][data-sku="${sku}"] option`, (x) => x.map((y) => ({ value: y.value, text: y.textContent })));
      await page.selectOption(`[data-rec="${champ}"][data-sku="${sku}"]`, o.find((y) => y.value && norm(y.text) === norm(texte)).value);
    }
  }
  await page.click('[data-valider-rec]'); await page.waitForTimeout(300);
  const lot = await cmd('.getlot LOT-PM-2609');
  noeSuite.lotApres = { entrees: (lot.match(/Entrées\s*(\d+)/) || [])[1], reste: (lot.match(/Reste en stock\s*(\d+)/) || [])[1], recs: [...new Set(lot.match(/REC-\d+/g) || [])] };
  const sc13 = (await scores())['spartoo-tracabilite'];
  noeSuite.score13 = sc13 ? `${sc13.score}/${sc13.max} (meilleur ${sc13.meilleur})` : 'rien';
  noeSuite.score13Reel = await page.evaluate(async () => {
    const k = Object.keys(localStorage).find((x) => /^prepalog:prive\/.+\/spartoo$/.test(x));
    const db = JSON.parse(localStorage.getItem(k)).data;
    const m = await import('/contenus/spartoo-tracabilite.js'); const sp = await import('/contenus/spartoo.js');
    return m.ETAPES.map((e) => e.id + ':' + e.verifier(db, sp).status).join(' ');
  });
});

// --- Zoé ouvre la préparation (1.2) en premier.
seanceCourante = 'hors ordre · 1.2 seule';
let zoe12 = {};
await v('hors ordre · ENT-1.2 ouverte sans 1.1 : jouable, chiffres de base neuve', async () => {
  await changerEleve('2603', 'ccc3');
  const fz = await tuileFermee('spartoo');
  attendre(`le verrou : 1.2 fermée à Zoé (${JSON.stringify(fz)})`, fz.grisee && !fz.ouverte);
  await profDebloque('PETIT', 'spartoo', '2603', 'ccc3');
  await ouvrirSeance('spartoo');
  zoe12.accueil = await accueil();
  zoe12.mails = (await listeMails('in')).length;
  contient('1.2 seule : paires en stock', '4569', '4 569');
  attendre(`1.2 seule : le corrigé annonce 4 569 (lu ${zoe12.accueil.stock})`, zoe12.accueil.stock === '4569');
});

if (process.env.DEBUG_JALONS) {
  const d = await page.evaluate(async () => {
    const k = Object.keys(localStorage).find((x) => /^prepalog:prive\/.+\/spartoo$/.test(x));
    const db = JSON.parse(localStorage.getItem(k)).data;
    const out = {}; const sp = await import('/contenus/spartoo.js');
    for (const [nom, f] of [['reception', '/contenus/spartoo-reception.js'], ['preparation', '/contenus/spartoo.js'], ['tracabilite', '/contenus/spartoo-tracabilite.js']]) {
      const m = await import(f);
      out[nom] = m.ETAPES.map((e) => { const r = e.verifier(db, sp); return { id: e.id, status: r.status, detail: r.detail }; });
    }
    return out;
  });
  console.log(JSON.stringify(d, null, 1));
}
/* ============================== remise à zéro par l'élève, en séance 1.1 (point 3) ====== */
seanceCourante = 'remise à zéro (élève)';
let raz = {};
await v('remise à zéro : ce que l\'élève retrouve, et ce que devient le suivi', async () => {
  await changerEleve('2601', 'aaa1');                       // Léa : 1.1, 1.2 et 1.3 faites
  raz.avant = Object.fromEntries(Object.entries(await scores()).filter(([k]) => /spartoo/.test(k)).map(([k, x]) => [k, `${x.score}/${x.max} meilleur ${x.meilleur} tent. ${x.tentatives}`]));
  await ouvrirSeance('spartoo-reception');
  await page.click('[data-raz]');
  await page.waitForTimeout(500);
  raz.accueilApres = (await accueil());
  await vue('receptions');
  raz.receptionsApres = await lire('.ent-main');
  raz.mailsApres = (await listeMails('in')).length;
  raz.apresRaz = Object.fromEntries(Object.entries(await scores()).filter(([k]) => /spartoo/.test(k)).map(([k, x]) => [k, `${x.score}/${x.max} meilleur ${x.meilleur} tent. ${x.tentatives}`]));
  // Il quitte et rouvre la séance : le contenu de la séance revient-il ?
  await ouvrirSeance('spartoo-reception');
  await vue('receptions');
  raz.receptionsRouvert = await lire('.ent-main');
  await ouvrirSeance('spartoo');
  raz.acc12 = (await accueil()).texte.slice(0, 160);
  await ouvrirSeance('spartoo-tracabilite');
  raz.mails13 = (await listeMails('in')).length;
  raz.lot13 = (await cmd('.getlot LOT-PM-2609')).slice(0, 200);
  raz.apresOuvertures = Object.fromEntries(Object.entries(await scores()).filter(([k]) => /spartoo/.test(k)).map(([k, x]) => [k, `${x.score}/${x.max} meilleur ${x.meilleur} tent. ${x.tentatives}`]));
});

await v('remise à zéro (élève) : la séance est immédiatement jouable (réception, messages, stock de départ)', async () => {
  attendre('après la remise à zéro, la livraison REC-04127 est à contrôler', /REC-04127/.test(raz.receptionsApres) && /À contrôler/.test(raz.receptionsApres));
  attendre(`après la remise à zéro, les 3 messages de la réception (bienvenue, procédure, bon de livraison) sont là (lu ${raz.mailsApres})`, raz.mailsApres === 3);
  attendre(`après la remise à zéro, 4 569 paires (lu ${raz.accueilApres.stock})`, raz.accueilApres.stock === '4569');
  attendre('la réception rouverte contient toujours la livraison', /REC-04127/.test(raz.receptionsRouvert));
});

/* ====================== porte de sortie de l'enseignant (point 2) ====================== */
seanceCourante = 'porte de sortie enseignant';
const scoresDe = async () => Object.fromEntries(Object.entries(await scores()).filter(([k]) => /spartoo/.test(k)).map(([k, x]) => [k, `${x.score}/${x.max}`]));
await v('porte de sortie : l\'enseignant remet Léa au début de ENT-1.2 ; 1.1 est conservé, 1.2 et 1.3 effacés du suivi', async () => {
  // Léa a refait 1.1 en entier plus haut ; on rejoue 1.2 et 1.3 « vues » : on part de ce que le suivi contient.
  const avant = await scoresDe();
  attendre(`avant la porte, le suivi de Léa contient 1.1, 1.2 et 1.3 (lu ${JSON.stringify(avant)})`, ['spartoo', 'spartoo-reception', 'spartoo-tracabilite'].every((k) => avant[k]));
  if (await page.$('[data-quitter]')) await page.click('[data-quitter]');
  await page.waitForSelector('#btnDeco'); await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf'); await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.waitForSelector('[data-ong="suivi"]');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('#btnRaz');
  const eleveVal = await page.$$eval('#razEleve option', (o) => o.find((x) => /DUPONT/i.test(x.textContent)).value);
  await page.selectOption('#razEleve', eleveVal);
  await page.selectOption('#razSeance', 'spartoo');
  await page.click('#btnRaz');
  await page.waitForTimeout(500);
  // Ce que le suivi montre maintenant : la ligne de Léa, colonne par colonne.
  const ligne = await page.$$eval('tbody tr', (r) => r.map((x) => x.textContent.replace(/\s+/g, ' ').trim()).find((t) => /DUPONT/i.test(t)));
  attendre(`le suivi de Léa après la porte : 1.1 gardé, 1.2 et 1.3 vides (lu « ${ligne} »)`, /3\/3/.test(ligne) && (ligne.match(/—/g) || []).length >= 2);
  await page.click('#btnRetour'); await page.click('#btnDeco');
  await connecterEleve('2601', 'aaa1');
});
await v('porte de sortie : à la réouverture, Léa retrouve la photo de fin de 1.1, une seule fois', async () => {
  await ouvrirSeance('spartoo');
  const acc = await accueil();
  attendre(`la base est celle de la fin de 1.1 : 4 593 paires (lu ${acc.stock})`, acc.stock === '4593');
  attendre(`les 3 messages neufs de 1.2 sont non lus, plus au plus la réponse de Puma (lu ${acc.nonLus})`, acc.nonLus === '3' || acc.nonLus === '4');
  // ENT-1.2 n'a plus l'écran Réceptions (05/10/2026 : chaque séance n'affiche que ses écrans). La
  // réception faite en 1.1 se lit dans la console : le lot qu'elle a fait entrer est en stock, entier.
  const lot = await cmd('.getlot LOT-PM-2609');
  attendre(`la réception REC-04127 faite en 1.1 est là, ses 24 paires en stock (lu « ${lot.slice(0, 160)} »)`,
    /REC-04127/.test(lot) && /Entrées\s*24\b/.test(lot));
  // Elle fait un geste, quitte, rouvre : le drapeau ne doit pas revenir effacer son travail.
  await ouvrirMail('Bienvenue chez Spartoo');
  const avant = (await accueil()).nonLus;
  await ouvrirSeance('spartoo');
  const apres = (await accueil()).nonLus;
  attendre(`le drapeau n'est pas rejoué : le message lu reste lu (${avant} puis ${apres} non lus)`, avant === apres);
});
await v('porte de sortie : 1.3 est de nouveau fermée à Léa (sa photo de 1.2 a été retirée)', async () => {
  const f13 = await tuileFermee('spartoo-tracabilite');
  attendre(`1.3 fermée après la remise au début de 1.2 (${JSON.stringify(f13)})`, f13.grisee && !f13.ouverte);
  const f11 = await tuileFermee('spartoo-reception');
  attendre('1.1 reste ouverte', !f11.grisee && f11.ouverte);
});
await v('porte de sortie : la commande de 1.2 est de nouveau à traiter', async () => {
  await ouvrirSeance('spartoo');
  const mails = await listeMails('in');
  attendre('la commande web CMD-048213 est dans les messages de 1.2', mails.some((m) => /CMD-048213/.test(m.t)));
});

if (process.env.DEBUG_HORS_ORDRE) console.log(JSON.stringify({ noe13, noeSuite, zoe12 }, null, 1));
/* ================================================================ bilan ======= */
await v('aucune erreur de page pendant les trois séances', async () => {
  if (erreurs.length) throw new Error(erreurs.slice(0, 3).join(' ; '));
});
await v('aucun écart entre les écrans et les corrigés', async () => {
  if (ecarts.length) throw new Error(`${ecarts.length} écart(s) :\n  - ${ecarts.join('\n  - ')}`);
});

console.log(`\n${ok.length} cas passent, ${ko.length} échouent.`);
ok.forEach((n) => console.log('  ✓ ' + n));
ko.forEach((n) => console.log('  ✗ ' + n));
if (ecarts.length) { console.log('\nÉcarts écran / corrigé :'); ecarts.forEach((e) => console.log('  - ' + e)); }
await nav.close(); srv.close();
process.exit(ko.length ? 1 : 0);
