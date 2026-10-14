// Suite de tests de Prepalog — bloc « courriel » : l'écran Nouveau courriel (option `courriel`, `core/types/courriel.js`, branché dans
// `core/types/entreprise-messagerie.js`) et la fiche ENREGISTRÉE (`fiche.envoi.enregistrer`, `core/types/fiche.js`), brief
// `docs/briefs/MOTEUR-courriel-planning.md`, lot 2, 14/10/2026.
//
// `node outils/test.mjs courriel` lance ce bloc. Il monte la séance d'essai (`contenus/courriel-essai.js`) dans un contexte de navigateur
// à lui, avec de vrais clics. Les VARIANTES de la déclaration (fautes, question au fil, déclencheur, nom de fichier calculé, séance sans
// l'option) sont fabriquées ici, dans la page, à partir de la vraie déclaration.
//
// Valeurs attendues écrites à la main : le fichier de la fiche s'appelle OT-ESSAI-001.pdf et sa pièce `fiche:ordre` ; le numéro saisi
// dans la fiche est « PRPU 418270 6 » (port : Anvers) ; avec l'ordre joint, le transporteur répond « ordre bien reçu : conteneur PRPU 418270 6 »
// et joint l'avis ; sans lui, « sans l’ordre de transport » ; le quai et la responsable ne répondent jamais ; carnet dans l'ordre
// Routiers du Nord, Barge Contargo, Quai de réception, Claire Vasseur ; deux jalons de 10 points.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCE = 'essai-courriel';
const CONTENEUR = 'PRPU 418270 6';
const ORDRE_CARNET = ['routiers', 'contargo', 'quai', 'claire'];
const MOTS = /\b(juste|justes|faux|fausse|correct|correcte|erreur)\b/i;

const erreursC = [];
let nbDialogues = 0;
async function nouvellePage(ctx) {
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(6000);
  pg.on('pageerror', (e) => erreursC.push('PAGEERROR: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursC.push('CONSOLE: ' + m.text()); });
  pg.on('dialog', (d) => { nbDialogues++; d.accept(); });
  await pg.goto(BASE);
  await pg.waitForSelector('#btnProf', { timeout: 8000 });
  return pg;
}
const ctxC = await nav.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
const pg = await nouvellePage(ctxC);

// Monte la séance d'essai. `faute` : une déclaration fautive (rend le message) ; `questions` : une question au fil au geste
// `courriel:envoyer:contargo` ; `declencheur` : un message de Claire qui arrive au geste `courriel:envoyer:quai` ; `nomFonction` : le nom du
// fichier calculé sur la base ; `sansCourriel` : la même séance SANS l'option (et avec une fiche d'envoi ordinaire) ; `copie` ; `role`.
const monter = (o = {}) => pg.evaluate(async ({ o, SEANCE }) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const S = await import('/contenus/courriel-essai.js');
  const { apresGeste } = await import('/core/declencheurs.js');
  const U = S.univers({ copie: !!o.copie });
  const F = () => JSON.parse(JSON.stringify(S.FICHE));
  if (o.nomFonction) { U.fiche = F(); U.fiche.envoi.nomPiece = (db) => `OT-${(db.fiches && db.fiches.ordre && db.fiches.ordre.valeurs.conteneur) || 'X'}.pdf`.replace(/ /g, ''); }
  if (o.sansCourriel) { delete U.courriel; U.fiche = F(); U.fiche.envoi = { bouton: 'Envoyer la fiche', a: 'Contargo' }; }
  if (o.questions) {
    U.questions = { id: SEANCE, personnes: {}, etapes: [], liste: [{ id: 'apres-envoi', type: 'fil', de: 'claire', reflexion: true,
      quand: apresGeste('courriel:envoyer:contargo'), enonce: 'Pourquoi joindre l’ordre ?',
      choix: [{ v: 'preuve', lib: 'Pour que le transporteur l’ait sous les yeux' }, { v: 'rien', lib: 'Par habitude' }], retour: 'Sans l’ordre, rien ne part.' }] };
  }
  if (o.declencheur) {
    U.volet = { id: SEANCE, semer: () => ({}), declencheurs: [{ id: 'merci', quand: apresGeste('courriel:envoyer:quai'),
      semer: () => ({ mails: [{ folder: 'in', ts: Date.now(), from: 'Claire Vasseur', fromMail: 'claire.vasseur@entrepot-essai.example', to: 'Lea',
        subject: 'Bien reçu', kind: 'text', text: 'Merci pour ton message au quai.', read: false }] }) }] };
  }
  if (o.faute) {
    const f = {
      carnetVide: () => { U.courriel = { carnet: [] }; },
      idDouble: () => { U.courriel.carnet[1].id = 'routiers'; },
      sansNom: () => { delete U.courriel.carnet[2].nom; },
      sansMail: () => { delete U.courriel.carnet[0].mail; },
      idAvecDeuxPoints: () => { U.courriel.carnet[0].id = 'a:b'; },
      pieceInconnue: () => { U.courriel.pieces = ['cdc', 'nulle']; },
      reponseTexte: () => { U.courriel.reponse = 'oui'; },
      cleInconnue: () => { U.courriel.reponces = 1; },
      option: () => { U.courrier = U.courriel; delete U.courriel; },
      sansNomPiece: () => { U.fiche = F(); delete U.fiche.envoi.nomPiece; },
      nomPieceSeul: () => { U.fiche = F(); U.fiche.envoi.enregistrer = false; },
      nomPieceVide: () => { U.fiche = F(); U.fiche.envoi.nomPiece = () => ''; },
      geste: () => { U.questions = { id: SEANCE, personnes: {}, etapes: [], liste: [{ id: 'q', type: 'fil', de: 'claire', reflexion: true,
        quand: apresGeste('courriel:envoyer:nul'), enonce: 'E ?', choix: [{ v: 'a', lib: 'A' }, { v: 'b', lib: 'B' }], retour: 'R.' }] }; },
      gesteSansOption: () => { delete U.courriel; U.questions = { id: SEANCE, personnes: {}, etapes: [], liste: [{ id: 'q', type: 'fil', de: 'claire', reflexion: true,
        quand: apresGeste('courriel:envoyer'), enonce: 'E ?', choix: [{ v: 'a', lib: 'A' }, { v: 'b', lib: 'B' }], retour: 'R.' }] }; },
    };
    f[o.faute]();
    try { creerEntreprise(U); return 'accepté'; } catch (e) { return e.message; }
  }
  document.querySelector('#dTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'dTest'; document.body.prepend(hote);
  const db = o.garder ? JSON.parse(JSON.stringify(window.__d.db)) : {};
  window.__d = { db, enregistres: [], moteur: null };
  const ctx = {
    meta: { ...S.META, ...(o.copie ? { copie: true, temps: 'evaluation' } : {}) },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => { window.__d.sauvegardes = (window.__d.sauvegardes || 0) + 1; } },
    enregistrer: (x) => { window.__d.enregistres.push(JSON.parse(JSON.stringify(x))); }, quitter: () => {}, codeStock: 'ESSAI',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  };
  const M = creerEntreprise(U);
  window.__d.moteur = M;
  M.rendre(hote, ctx);
  return 'ok';
}, { o, SEANCE });

const Z = '#dTest';
const pause = (ms = 60) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__d.db)));
const note = () => pg.evaluate(() => window.__d.moteur.noter(window.__d.db));
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const texte = (sel) => pg.textContent(`${Z} ${sel}`);
const aller = async (vue) => { await pg.evaluate(({ Z, vue }) => document.querySelector(`${Z} .ent-nav[data-vue="${vue}"]`).click(), { Z, vue }); await pause(); };
const sortis = async () => ((await base()).mails || []).filter((m) => m.folder === 'out');
const recus = async () => ((await base()).mails || []).filter((m) => m.folder === 'in');
// Ouvre l'écran Nouveau courriel (la messagerie, puis le bouton).
async function nouveau() {
  await aller('mail');
  if (!(await present('[data-courriel]'))) { await pg.click(`${Z} [data-nouveau]`); await pause(); }
}
const joindre = async (id) => { await pg.click(`${Z} [data-c-joindre]`); await pg.click(`${Z} [data-c-joint="${id}"]`); await pause(); };
const noms = () => pg.$$eval(`${Z} [data-c-piece] span:nth-of-type(1)`, (L) => L.map((x) => x.textContent));
const menuNoms = async () => {
  await pg.click(`${Z} [data-c-joindre]`);
  const L = await pg.$$eval(`${Z} [data-c-joint]`, (B) => B.map((b) => ({ id: b.dataset.cJoint, nom: b.textContent.trim() })));
  await pg.click(`${Z} [data-c-joindre]`);
  return L;
};
// Écrit un courriel complet, sans l'envoyer.
async function ecrire({ a, objet = 'Ordre de transport', corps = 'Bonjour, voici ma demande.', pj = [] }) {
  if (a) await pg.selectOption(`${Z} #cA`, a);
  await pg.fill(`${Z} #cObj`, objet);
  await pg.fill(`${Z} #cMsg`, corps);
  for (const id of pj) await joindre(id);
}
const envoyer = async () => { await pg.click(`${Z} [data-c-envoyer]`); await pause(); };
// Remplit l'ordre de transport et l'enregistre (confirmation comprise).
async function enregistrerOrdre(conteneur = CONTENEUR, port = 'anvers') {
  await aller('fiche');
  await pg.fill(`${Z} #fi-conteneur`, conteneur);
  await pg.selectOption(`${Z} #fi-port`, port);
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
// La liste des messages (on quitte l'écran Nouveau courriel s'il est ouvert).
async function versListe() {
  await aller('mail');
  if (await present('[data-courriel]')) { await pg.click(`${Z} [data-annuler]`); await pause(); }
}
async function ouvrirMessage(dossier, sujet) {
  await versListe();
  await pg.click(`${Z} [data-dossier="${dossier}"]`); await pause();
  const id = await pg.evaluate(({ Z, sujet }) => {
    const b = [...document.querySelectorAll(`${Z} [data-mail]`)].find((x) => x.textContent.includes(sujet));
    return b ? b.dataset.mail : null;
  }, { Z, sujet });
  vrai(id, `message « ${sujet} » introuvable dans ${dossier}`);
  await pg.click(`${Z} [data-mail="${id}"]`); await pause();
}

await v('Courriel : déclaration refusée avec un message qui nomme la faute', async () => {
  const attendus = {
    carnetVide: /courriel : « carnet » est la liste des destinataires, au moins un/,
    idDouble: /deux contacts portent le même « id » « routiers »/,
    sansNom: /le contact n° 3 \(« quai »\) n’a pas de « nom »/,
    sansMail: /le contact n° 1 \(« routiers »\) n’a pas de « mail »/,
    idAvecDeuxPoints: /l’id « a:b » ne contient ni espace ni « : »/,
    pieceInconnue: /la pièce « nulle » n’est pas un document de la séance/,
    reponseTexte: /« reponse » est une fonction/,
    cleInconnue: /« reponces » n’existe pas/,
    option: /l'option « courrier » n'existe pas\..*courriel/,
    sansNomPiece: /fiche « ordre » : envoi\.enregistrer exige envoi\.nomPiece/,
    nomPieceSeul: /fiche « ordre » : envoi\.nomPiece n'a de sens qu'avec envoi\.enregistrer: true/,
    nomPieceVide: /fiche « ordre » : envoi\.enregistrer exige envoi\.nomPiece/,
    geste: /question « q » : geste inconnu « courriel:envoyer:nul »/,
    gesteSansOption: /question « q » : geste inconnu « courriel:envoyer »/,
  };
  for (const [faute, re] of Object.entries(attendus)) {
    const m = await monter({ faute });
    vrai(re.test(m), `${faute} : ${m}`);
  }
});

await v('Courriel : la déclaration juste est acceptée', async () => {
  egal(await monter(), 'ok', 'la déclaration juste est refusée');
  egal(await monter({ nomFonction: true }), 'ok', 'un nom de fichier calculé est refusé');
});

await v('Courriel : l’écran Nouveau courriel — carnet dans l’ordre, objet vide, message vide, aucune liste de fournisseurs', async () => {
  await monter();
  await aller('mail');
  vrai(/Nouveau courriel/.test(await texte('[data-nouveau]')), 'le bouton ne dit pas « Nouveau courriel »');
  await pg.click(`${Z} [data-nouveau]`);
  await pause();
  vrai(await present('[data-courriel]'), 'l’écran Nouveau courriel manque');
  vrai(!(await present('#mTo')) && !(await present('[data-envoyer-fou]')), 'l’ancien écran « fournisseurs » est resté');
  const O = await pg.$$eval(`${Z} #cA option`, (L) => L.map((o) => [o.value, o.textContent]));
  egal(O[0], ['', 'Choisis un destinataire…'], 'première option');
  egal(O.slice(1).map((x) => x[0]), ORDRE_CARNET, 'carnet dans l’ordre');
  egal(O[2][1], 'Barge Contargo — transporteur · réservations', 'nom et rôle du contact');
  egal(await pg.inputValue(`${Z} #cObj`), '', 'l’objet n’est pas vide au départ');
  egal(await pg.inputValue(`${Z} #cMsg`), '', 'le message n’est pas vide au départ');
  vrai(/Joindre un fichier/.test(await texte('[data-c-joindre]')), 'pas de bouton « Joindre un fichier »');
  vrai(/Envoyer/.test(await texte('[data-c-envoyer]')) && await pg.$eval(`${Z} [data-c-envoyer]`, (b) => b.classList.contains('btn') && b.classList.contains('btn-p')),
    'le bouton Envoyer n’est pas un btn btn-p');
  egal(await pg.$$eval(`${Z} [data-c-piece]`, (L) => L.length), 0, 'une pièce est déjà jointe');
});

await v('Courriel : envoi refusé sans destinataire — la raison sous le bouton, le travail est gardé, rien ne part', async () => {
  await monter();
  await nouveau();
  await pg.fill(`${Z} #cObj`, 'Mon objet');
  await pg.fill(`${Z} #cMsg`, 'Mon texte');
  await envoyer();
  vrai(/Choisis un destinataire\./.test(await texte('[data-c-retour]')), 'la raison manque sous le bouton');
  vrai(await pg.$eval(`${Z} [data-c-retour]`, (r) => r.classList.contains('refus')), 'le refus n’est pas marqué');
  egal([await pg.inputValue(`${Z} #cObj`), await pg.inputValue(`${Z} #cMsg`)], ['Mon objet', 'Mon texte'], 'le travail n’est pas gardé');
  egal((await sortis()).length, 0, 'un courriel est parti');
  egal(((await base()).courriels || {})[SEANCE].envoyes, [], 'un envoi est rangé');
});

await v('Courriel : objet vide ou message vide — confirmation DANS la page (jamais window.confirm), « Non » garde tout, « Oui » envoie', async () => {
  await monter();
  await nouveau();
  nbDialogues = 0;
  await ecrire({ a: 'quai', objet: '', corps: 'Bonjour.' });
  await envoyer();
  vrai(await present('[data-c-confirme]'), 'pas de confirmation dans la page');
  vrai(/Envoyer sans objet \?/.test(await texte('[data-c-confirme]')), 'question : ' + await texte('[data-c-confirme]'));
  egal((await sortis()).length, 0, 'parti avant la confirmation');
  await pg.click(`${Z} [data-c-non]`);
  await pause();
  vrai(!(await present('[data-c-confirme]')), 'la confirmation reste après « Non »');
  vrai(await pg.evaluate(() => document.activeElement.id === 'cObj'), 'le focus ne va pas à l’objet');
  egal([await pg.inputValue(`${Z} #cMsg`), await pg.inputValue(`${Z} #cA`)], ['Bonjour.', 'quai'], 'le travail est perdu après « Non »');
  // Message vide
  await pg.fill(`${Z} #cObj`, 'Objet');
  await pg.fill(`${Z} #cMsg`, '   ');
  await envoyer();
  vrai(/Envoyer sans message \?/.test(await texte('[data-c-confirme]')), 'question message vide');
  await pg.click(`${Z} [data-c-non]`);
  await pause();
  vrai(await pg.evaluate(() => document.activeElement.id === 'cMsg'), 'le focus ne va pas au message');
  // Les deux vides
  await pg.fill(`${Z} #cObj`, '');
  await envoyer();
  vrai(/Envoyer sans objet et sans message \?/.test(await texte('[data-c-confirme]')), 'question des deux vides');
  await pg.click(`${Z} [data-c-oui]`);
  await pause();
  const S = await sortis();
  egal(S.length, 1, 'le courriel n’est pas parti après « Oui »');
  egal([S[0].subject, S[0].to], ['', 'Quai de réception'], 'courriel rangé');
  egal(nbDialogues, 0, 'un window.confirm est apparu');
  // Dans Envoyés, un objet vide s'affiche « (sans objet) ».
  await versListe(); await pg.click(`${Z} [data-dossier="out"]`); await pause();
  vrai(/\(sans objet\)/.test(await texte('.ent-mlist')), 'pas de « (sans objet) » dans Envoyés');
});

await v('Courriel : Entrée n’envoie rien (ni dans l’objet, ni dans le message : il y a un retour à la ligne)', async () => {
  await monter();
  await nouveau();
  await ecrire({ a: 'contargo', objet: 'Objet', corps: 'ligne 1' });
  await pg.focus(`${Z} #cObj`);
  await pg.keyboard.press('Enter');
  await pg.focus(`${Z} #cMsg`);
  await pg.keyboard.press('End');
  await pg.keyboard.press('Enter');
  await pg.keyboard.type('ligne 2');
  await pause();
  egal(await pg.inputValue(`${Z} #cMsg`), 'ligne 1\nligne 2', 'Entrée ne saute pas de ligne dans le message');
  egal((await sortis()).length, 0, 'Entrée a envoyé un courriel');
  vrai(!(await present('[data-c-confirme]')), 'Entrée a ouvert une confirmation');
  vrai(await present('[data-courriel]'), 'Entrée a fait quitter l’écran');
});

await v('Courriel : la fiche enregistrée — textes « enregistr… », pièce absente avant, présente après', async () => {
  await monter();
  await aller('fiche');
  egal(await texte('[data-fiche-envoyer]'), 'Enregistrer l’ordre de transport', 'le bouton de la fiche');
  // Il manque quelque chose : le refus ne change pas.
  await pg.click(`${Z} [data-fiche-envoyer]`);
  vrai(/Il manque : le numéro du conteneur, le port\./.test(await texte('[data-fiche-manque]')), 'refus : ' + await texte('[data-fiche-manque]'));
  await nouveau();
  egal(await menuNoms(), [{ id: 'cdc', nom: 'Cahier des charges' }, { id: 'avis', nom: 'Avis de mise à disposition' }], 'fichiers avant l’enregistrement');
  await aller('fiche');
  await pg.fill(`${Z} #fi-conteneur`, CONTENEUR);
  await pg.selectOption(`${Z} #fi-port`, 'anvers');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  const q = await texte('[data-confirme]');
  vrai(/Tu enregistres l’ordre de transport \? Tu ne pourras plus le modifier\./.test(q), 'confirmation : ' + JSON.stringify(q));
  vrai(!/envoi/i.test(q), 'la confirmation parle d’envoi : ' + q);
  egal(await texte('[data-confirme-oui]'), 'Oui, enregistrer', 'bouton de confirmation');
  vrai(!(await present('[data-fiche-envoyee]')), 'enregistrée avant la confirmation');
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  const b = await texte('[data-fiche-envoyee]');
  vrai(/^Enregistré le \d\d\/\d\d à \d\d:\d\d\. Envoie-le maintenant par courriel\./.test(b.trim().replace(/\s+/g, ' ')), 'bandeau : ' + b);
  vrai(!/envoyée/i.test(b), 'le bandeau dit « envoyée » : ' + b);
  const e = (await base()).fiches.ordre;
  vrai(e.envoye && e.envoye.at, 'la fiche n’est pas figée');
  egal(await pg.$eval(`${Z} .ent-fiche-form fieldset`, (f) => f.disabled), true, 'la fiche enregistrée est encore modifiable');
  await nouveau();
  egal(await menuNoms(), [{ id: 'cdc', nom: 'Cahier des charges' }, { id: 'avis', nom: 'Avis de mise à disposition' }, { id: 'fiche:ordre', nom: 'OT-ESSAI-001.pdf' }],
    'fichiers après l’enregistrement');
  // Le geste et le jalon-condition restent ceux de l'envoi.
  vrai(!!(await base()).gestes[SEANCE]['fiche:ordre:envoyer'], 'le geste fiche:ordre:envoyer n’est pas rangé');
});

await v('Courriel : une fiche NON enregistrée (séance sans l’option) garde ses textes d’envoi, et « Nouveau message » reste l’ancien écran', async () => {
  await monter({ sansCourriel: true });
  await aller('fiche');
  egal(await texte('[data-fiche-envoyer]'), 'Envoyer la fiche', 'bouton');
  await pg.fill(`${Z} #fi-conteneur`, CONTENEUR);
  await pg.selectOption(`${Z} #fi-port`, 'anvers');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  egal((await texte('[data-confirme] p')).trim(), 'Tu envoies ta fiche à Contargo ? Tu ne pourras plus la modifier.', 'confirmation');
  egal(await texte('[data-confirme-oui]'), 'Oui, envoyer', 'bouton de confirmation');
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  vrai(/^Fiche envoyée à Contargo le /.test((await texte('[data-fiche-envoyee]')).trim()), 'bandeau : ' + await texte('[data-fiche-envoyee]'));
  await aller('mail');
  egal((await texte('[data-nouveau]')).trim(), 'Nouveau message', 'le bouton a changé');
  await pg.click(`${Z} [data-nouveau]`);
  await pause();
  vrai(await present('#mTo') && await present('[data-envoyer-fou]') && await present('#mObj'), 'l’ancien écran « fournisseurs » manque');
  egal(await pg.inputValue(`${Z} #mObj`), 'Commande de réapprovisionnement', 'objet prérempli de l’ancien écran');
  vrai(!(await present('[data-courriel]')) && !(await present('#cA')), 'le nouvel écran apparaît sans l’option');
});

await v('Courriel : envoi AVEC l’ordre — la réponse cite le numéro saisi dans la fiche et joint l’avis ; l’envoi est rangé, les pièces visibles dans Envoyés', async () => {
  await monter();
  await enregistrerOrdre();
  await nouveau();
  await ecrire({ a: 'contargo', objet: 'Ordre de transport', corps: 'Bonjour, voici l’ordre.', pj: ['cdc', 'fiche:ordre'] });
  egal(await noms(), ['Cahier des charges', 'OT-ESSAI-001.pdf'], 'étiquettes des pièces jointes');
  await envoyer();
  vrai(/Courriel envoyé à Barge Contargo\. Tu le retrouves dans « Envoyés »\./.test(await texte('[data-c-retour]')), 'confirmation d’envoi : ' + await texte('[data-c-retour]'));
  egal([await pg.inputValue(`${Z} #cObj`), await pg.inputValue(`${Z} #cMsg`), await pg.inputValue(`${Z} #cA`)], ['', '', ''], 'le formulaire n’est pas vidé');
  egal(await noms(), [], 'les pièces ne sont pas vidées');
  const S = await sortis(), R = await recus();
  egal(S.length, 1, 'courriels envoyés');
  egal([S[0].to, S[0].toMail, S[0].subject, S[0].text, S[0].pieces], ['Barge Contargo', 'reservations@barge-contargo.example', 'Ordre de transport', 'Bonjour, voici l’ordre.', ['cdc', 'fiche:ordre']], 'courriel rangé');
  egal(R.length, 1, 'réponses reçues');
  egal([R[0].from, R[0].fromMail, R[0].subject, R[0].read, R[0].pieces], ['Barge Contargo', 'reservations@barge-contargo.example', 'RE : Ordre de transport', false, ['avis']], 'réponse');
  egal(R[0].text, `Bonjour Lea, ordre bien reçu : conteneur ${CONTENEUR}. Enlèvement confirmé.`, 'texte de la réponse');
  vrai(R[0].ts > S[0].ts, 'la réponse n’est pas datée après l’envoi');
  const nav1 = (await texte('.ent-nav[data-vue="mail"]')).trim();
  vrai(/Messagerie\s*1$/.test(nav1), 'le compteur de non lus n’a pas bougé : ' + nav1);
  // Envoyés : les pièces jointes.
  await aller('mail'); await pg.click(`${Z} [data-annuler]`); await pause();
  await pg.click(`${Z} [data-dossier="out"]`); await pause();
  await pg.click(`${Z} [data-mail="${S[0].id}"]`); await pause();
  const pj = await pg.$$eval(`${Z} .ent-pj-liste .ent-pj`, (L) => L.map((b) => [b.dataset.pj, b.textContent.replace(/\s+/g, ' ').trim()]));
  egal(pj, [['cdc', 'Cahier des charges'], ['fiche:ordre', 'OT-ESSAI-001.pdf']], 'pièces jointes dans Envoyés');
  // La réponse porte l'avis.
  await ouvrirMessage('in', 'RE : Ordre de transport');
  egal(await pg.$$eval(`${Z} .ent-pj-liste .ent-pj`, (L) => L.map((b) => b.dataset.pj)), ['avis'], 'pièce de la réponse');
  vrai(new RegExp(`conteneur ${CONTENEUR}`).test(await texte('.ent-lecteur')), 'la réponse affichée ne cite pas le numéro');
});

await v('Courriel : envoi SANS l’ordre — la réponse le réclame ; quai et responsable ne répondent pas', async () => {
  await monter();
  await enregistrerOrdre();
  await nouveau();
  await ecrire({ a: 'routiers', objet: 'Demande', corps: 'Bonjour.' });
  await envoyer();
  let R = await recus();
  egal(R.length, 1, 'réponse sans l’ordre');
  vrai(/sans l’ordre de transport/.test(R[0].text) && !/PRPU/.test(R[0].text), 'texte : ' + R[0].text);
  egal([R[0].from, R[0].pieces], ['Routiers du Nord', []], 'expéditeur');
  // Le quai et la responsable : aucune réponse, mais l'envoi est rangé.
  await ecrire({ a: 'quai', objet: 'Info', corps: 'Le conteneur arrive.', pj: ['fiche:ordre'] });
  await envoyer();
  await ecrire({ a: 'claire', objet: 'Info', corps: 'Fait.' });
  await envoyer();
  egal((await recus()).length, 1, 'le quai ou la responsable ont répondu');
  egal((await sortis()).length, 3, 'envois');
});

await v('Courriel : ouvrir la pièce de la fiche dans un courriel = la fiche FIGÉE sur une feuille, lecture seule, ni compte de document ni bouton', async () => {
  await monter();
  await enregistrerOrdre();
  await nouveau();
  await ecrire({ a: 'contargo', pj: ['fiche:ordre'] });
  await envoyer();
  await ouvrirMessage('out', 'Ordre de transport');
  await pg.click(`${Z} [data-pj="fiche:ordre"]`);
  await pause();
  vrai(await present('[data-visio="fiche:ordre"]'), 'la visionneuse ne s’ouvre pas');
  vrai(/OT-ESSAI-001\.pdf/.test(await texte('.ent-visio-titre')), 'titre de la pièce');
  vrai(await present('.ent-visio .ent-doc [data-fiche-piece="ordre"]'), 'la fiche n’est pas sur une feuille de papier');
  const m = await pg.evaluate((Z) => {
    const f = document.querySelector(`${Z} [data-fiche-piece="ordre"]`);
    return { texte: f.textContent.replace(/\s+/g, ' '), champ: f.querySelector('#fi-conteneur').value, port: f.querySelector('#fi-port').selectedOptions[0].textContent,
      fige: f.querySelector('fieldset').disabled, boutons: f.querySelectorAll('[data-fiche-envoyer], button[type="submit"]').length,
      papier: !!f.closest('.ent-doc') };
  }, Z);
  egal([m.champ, m.port, m.fige, m.boutons, m.papier], [CONTENEUR, 'Anvers', true, 0, true], 'fiche figée');
  vrai(/Enregistré le \d\d\/\d\d à \d\d:\d\d\./.test(m.texte), 'pas de date d’enregistrement : ' + m.texte);
  const ind = (await base()).indicateurs;
  vrai(!ind || !ind[SEANCE] || !ind[SEANCE].docs || !ind[SEANCE].docs['fiche:ordre'], 'la fiche jointe est comptée comme un document du repérage');
  // Retour au message : la pièce se rouvre par « Retour ».
  await pg.click(`${Z} [data-pj-retour]`);
  await pause();
  vrai(await present('.ent-pj-liste [data-pj="fiche:ordre"]'), 'le retour ne ramène pas aux pièces');
  vrai(/ouvert/.test(await texte('[data-pj="fiche:ordre"]')), '« ouvert » n’est pas marqué');
  // Précédent / suivant entre les pièces du même mail ne casse pas.
  await pg.click(`${Z} [data-pj="fiche:ordre"]`);
  vrai(await pg.$eval(`${Z} .ent-visio-nav button:nth-child(2)`, (b) => b.disabled), 'suivant devrait être grisé sur une seule pièce');
});

await v('Courriel : une pièce d’un document déclaré s’ouvre comme avant (compte au repérage) et le nom du fichier peut être calculé sur la base', async () => {
  await monter({ nomFonction: true });
  await nouveau();
  await ecrire({ a: 'routiers', pj: ['avis'] });
  await envoyer();
  await ouvrirMessage('out', 'Ordre de transport');
  await pg.click(`${Z} [data-pj="avis"]`);
  await pause();
  vrai(/Avis de mise à disposition/.test(await texte('.ent-visio')), 'document non ouvert');
  const ind = (await base()).indicateurs;
  egal(ind[SEANCE].docs.avis, 1, 'ouverture du document non comptée');
  await enregistrerOrdre('AB 1');
  await nouveau();
  egal((await menuNoms()).map((x) => x.nom), ['Cahier des charges', 'Avis de mise à disposition', 'OT-AB1.pdf'], 'nom calculé sur la base');
  await ecrire({ a: 'routiers', pj: ['fiche:ordre'] });
  await envoyer();
  await ouvrirMessage('out', 'Ordre de transport');
  const noms2 = await pg.$$eval(`${Z} .ent-pj-liste .ent-pj`, (L) => L.map((b) => b.textContent.replace(/\s+/g, ' ').trim()));
  vrai(noms2.some((x) => x.startsWith('OT-AB1.pdf')), 'le nom calculé manque dans Envoyés : ' + noms2);
});

await v('Courriel : brouillon gardé entre deux écrans (À, objet, message, pièces) — rangé par séance, vidé à l’envoi', async () => {
  await monter();
  await enregistrerOrdre();
  await nouveau();
  await ecrire({ a: 'claire', objet: 'Mon brouillon', corps: 'Texte à finir', pj: ['avis', 'fiche:ordre'] });
  await pg.press(`${Z} #cMsg`, 'Tab');
  const B = (await base()).courriels[SEANCE].brouillon;
  egal([B.a, B.objet, B.corps, B.pieces], ['claire', 'Mon brouillon', 'Texte à finir', ['avis', 'fiche:ordre']], 'brouillon rangé dans la base de l’élève');
  await aller('accueil');
  await aller('stock');
  await aller('mail');
  vrai(await present('[data-courriel]'), 'l’écran Nouveau courriel n’est pas retrouvé');
  egal([await pg.inputValue(`${Z} #cA`), await pg.inputValue(`${Z} #cObj`), await pg.inputValue(`${Z} #cMsg`)], ['claire', 'Mon brouillon', 'Texte à finir'], 'champs');
  egal(await noms(), ['Avis de mise à disposition', 'OT-ESSAI-001.pdf'], 'pièces du brouillon');
  // Revenir par la liste : le bouton « Retour » puis « Nouveau courriel » retrouve aussi le brouillon.
  await pg.click(`${Z} [data-annuler]`); await pause();
  await pg.click(`${Z} [data-nouveau]`); await pause();
  egal(await pg.inputValue(`${Z} #cObj`), 'Mon brouillon', 'brouillon perdu par « Retour »');
  // Retirer une pièce par sa croix.
  await pg.click(`${Z} [data-c-retire="avis"]`);
  egal(await noms(), ['OT-ESSAI-001.pdf'], 'la croix ne retire pas la pièce');
  egal((await base()).courriels[SEANCE].brouillon.pieces, ['fiche:ordre'], 'retrait non rangé');
  // Rechargement : même brouillon.
  await monter({ garder: true });
  await nouveau();
  egal([await pg.inputValue(`${Z} #cA`), await pg.inputValue(`${Z} #cObj`)], ['claire', 'Mon brouillon'], 'brouillon perdu au rechargement');
  await envoyer();
  const D = (await base()).courriels[SEANCE];
  egal([D.brouillon.a, D.brouillon.objet, D.brouillon.corps, D.brouillon.pieces, D.envoyes.length], ['', '', '', [], 1], 'brouillon non vidé à l’envoi');
  // Cloisonné : un autre id de séance n'a rien.
  egal(Object.keys((await base()).courriels), [SEANCE], 'rangé hors de la séance');
});

await v('Courriel : `courrielsEnvoyes(db, séance)` rend les champs, dans l’ordre d’envoi', async () => {
  await monter();
  await enregistrerOrdre();
  await nouveau();
  await ecrire({ a: 'contargo', objet: 'Premier', corps: 'Un', pj: ['cdc'] });
  await envoyer();
  await ecrire({ a: 'quai', objet: 'Second', corps: 'Deux\nlignes', pj: ['fiche:ordre', 'avis'] });
  await envoyer();
  const L = await pg.evaluate(async (SEANCE) => {
    const { courrielsEnvoyes } = await import('/core/types/courriel.js');
    return { seance: courrielsEnvoyes(window.__d.db, SEANCE), toutes: courrielsEnvoyes(window.__d.db), autre: courrielsEnvoyes(window.__d.db, 'autre'), vide: courrielsEnvoyes({}, SEANCE), nul: courrielsEnvoyes(null) };
  }, SEANCE);
  egal(L.seance.map((c) => [c.a, c.objet, c.corps, c.pieces]), [['contargo', 'Premier', 'Un', ['cdc']], ['quai', 'Second', 'Deux\nlignes', ['fiche:ordre', 'avis']]], 'lecture');
  vrai(L.seance.every((c) => typeof c.at === 'number') && L.seance[0].at <= L.seance[1].at, 'dates');
  egal(L.toutes, L.seance, 'sans séance : toutes');
  egal([L.autre, L.vide, L.nul], [[], [], []], 'séance inconnue ou base vide');
  // Les jalons de la séance d'essai lisent cela : ordre joint à Contargo = ko ici (cdc seul à Contargo), objet écrit = ok.
  const n = await note();
  egal([n.detail['ordre-joint'], n.detail['objet-ecrit'], n.score], ['ko', 'ok', 10], 'jalons');
});

await v('Courriel : les gestes `courriel:envoyer` et `courriel:envoyer:<id>` sont rangés une fois et font arriver une question au fil', async () => {
  await monter({ questions: true });
  await nouveau();
  await ecrire({ a: 'quai', objet: 'Info', corps: 'Bonjour.' });
  await envoyer();
  let G = (await base()).gestes[SEANCE];
  egal(Object.keys(G).sort(), ['courriel:envoyer', 'courriel:envoyer:quai'], 'gestes après un envoi au quai');
  vrai(!(await present('[data-q-panneau]')), 'la question arrive pour le mauvais contact');
  await ecrire({ a: 'contargo', objet: 'Info', corps: 'Bonjour.' });
  await envoyer();
  G = (await base()).gestes[SEANCE];
  egal(Object.keys(G).sort(), ['courriel:envoyer', 'courriel:envoyer:contargo', 'courriel:envoyer:quai'], 'gestes après deux envois');
  vrai(await present('[data-q-panneau]'), 'la question au fil n’arrive pas');
  vrai(/Pourquoi joindre l’ordre/.test(await texte('[data-q-panneau]')), 'pas la bonne question');
});

await v('Courriel : un déclencheur `apresGeste(\'courriel:envoyer:quai\')` fait arriver le message prévu, une seule fois', async () => {
  await monter({ declencheur: true });
  await nouveau();
  await ecrire({ a: 'contargo', objet: 'Info', corps: 'Bonjour.' });
  await envoyer();
  vrai(!(await recus()).some((m) => m.subject === 'Bien reçu'), 'le message arrive pour le mauvais contact');
  await ecrire({ a: 'quai', objet: 'Info', corps: 'Bonjour.' });
  await envoyer();
  const R = (await recus()).filter((m) => m.subject === 'Bien reçu');
  egal(R.length, 1, 'le message déclenché n’est pas arrivé');
  await ecrire({ a: 'quai', objet: 'Encore', corps: 'Bonjour.' });
  await envoyer();
  egal((await recus()).filter((m) => m.subject === 'Bien reçu').length, 1, 'le message est arrivé deux fois');
});

await v('Courriel : l’enseignant essaie sans rien ranger chez l’élève (ni courriel, ni geste, ni brouillon dans la base)', async () => {
  await monter({ role: 'prof' });
  await nouveau();
  await ecrire({ a: 'contargo', pj: ['cdc'] });
  await envoyer();
  vrai(/Courriel envoyé à Barge Contargo/.test(await texte('[data-c-retour]')), 'l’enseignant ne voit pas son envoi');
  const b = await base();
  egal([b.courriels, b.gestes], [undefined, undefined], 'l’essai de l’enseignant est rangé dans la base');
});

await v('Courriel : copie rendue — plus rien ne s’envoie, ne se range ni ne se joint', async () => {
  await monter({ copie: true });
  await enregistrerOrdre();
  await nouveau();
  await ecrire({ a: 'contargo', objet: 'Ordre', corps: 'Voici.', pj: ['fiche:ordre'] });
  await envoyer();
  await pg.waitForSelector(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForSelector(`${Z} [data-copie-avis]`);
  // Pas d'état de courriel rangé (ouvrir l'écran d'une copie rendue ne doit pas en créer, pas même un brouillon vide).
  await pg.evaluate(() => { delete window.__d.db.courriels; });
  const avant = JSON.stringify(await base());
  await aller('accueil');
  await aller('mail');
  if (!(await present('[data-courriel]'))) { await pg.click(`${Z} [data-nouveau]`); await pause(); }
  vrai(await present('[data-courriel]'), 'l’écran ne s’ouvre pas après la remise');
  egal(await pg.$$eval(`${Z} [data-c-envoyer], ${Z} [data-c-joindre], ${Z} #cA, ${Z} #cObj, ${Z} #cMsg`, (L) => L.filter((x) => !x.disabled).length), 0, 'un champ de travail reste libre');
  // Même en forçant le clic et la frappe, rien ne part.
  await pg.evaluate((Z) => { document.querySelector(`${Z} [data-c-envoyer]`).click(); const m = document.querySelector(`${Z} #cMsg`); m.value = 'x'; m.dispatchEvent(new Event('input', { bubbles: true })); }, Z);
  await pause();
  egal((await sortis()).length, 1, 'un courriel est parti après la remise');
  egal(JSON.stringify(await base()), avant, 'la base a changé après la remise');
});

await v('Courriel : aucun texte du moteur ne dit « juste », « faux », « correct » ou « erreur » (écran, refus, confirmations, bandeau, résumés)', async () => {
  await monter();
  const textes = [];
  const lire = async () => textes.push(await pg.evaluate((Z) => {
    const z = document.querySelector(`${Z} [data-courriel]`);
    const c = z.cloneNode(true);
    // Ce que la séance déclare (carnet, noms de fichiers) n'est pas du texte du moteur.
    c.querySelectorAll('option, [data-c-piece], [data-c-joint]').forEach((x) => x.remove());
    return c.textContent.replace(/\s+/g, ' ');
  }, Z));
  await aller('fiche');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  textes.push(await texte('[data-fiche-manque]'));
  await enregistrerOrdre();
  textes.push(await texte('[data-fiche-envoyee]'));
  await nouveau();
  await lire();
  await envoyer(); textes.push(await texte('[data-c-retour]'));
  await pg.fill(`${Z} #cA`.replace('#cA', '#cObj'), '');
  await pg.selectOption(`${Z} #cA`, 'quai');
  await envoyer(); textes.push(await texte('[data-c-retour]'));
  await pg.click(`${Z} [data-c-non]`);
  await ecrire({ a: 'contargo', objet: 'O', corps: 'M', pj: ['fiche:ordre'] });
  await envoyer(); textes.push(await texte('[data-c-retour]'));
  await lire();
  await ouvrirMessage('in', 'RE : O');
  await pg.click(`${Z} [data-dossier="out"]`); await pause();
  textes.push(await texte('.ent-mlist'));
  const fautes = textes.filter((t) => MOTS.test(t));
  egal(fautes, [], 'mots interdits');
  vrai(textes.length >= 6, 'trop peu de textes relus');
});

await v('Courriel : ergonomie à 1366 × 768 et 1280 × 720 — l’écran Nouveau courriel (pièces jointes comprises) tient sans défilement de page', async () => {
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pg.setViewportSize({ width: w, height: h });
    await monter();
    await enregistrerOrdre();
    await nouveau();
    await ecrire({ a: 'contargo', objet: 'Ordre de transport', corps: 'Bonjour,\nvoici l’ordre.\nMerci.', pj: ['cdc', 'avis', 'fiche:ordre'] });
    await pg.click(`${Z} [data-c-joindre]`);
    const m = await pg.evaluate((Z) => {
      // Positions dans la PAGE (la page a pu défiler : `aller` fait glisser l'hôte en haut de la fenêtre).
      const d = document.scrollingElement, y = d.scrollTop;
      const r = document.querySelector(`${Z} [data-courriel]`).getBoundingClientRect();
      const e = document.querySelector(`${Z} .ent-courriel-envoi`).getBoundingClientRect();
      return { bas: r.bottom + y, envoi: e.bottom + y, hote: document.querySelector(Z).getBoundingClientRect().bottom + y, page: d.scrollHeight - innerHeight, h: innerHeight, largeur: d.scrollWidth - innerWidth };
    }, Z);
    vrai(m.hote <= m.h, `${w}×${h} : l’environnement dépasse la fenêtre (${m.hote} > ${m.h})`);
    vrai(m.bas <= m.h && m.envoi <= m.h, `${w}×${h} : l’écran dépasse la fenêtre (${m.bas} > ${m.h})`);
    vrai(m.largeur <= 0, `${w}×${h} : défilement horizontal (${m.largeur})`);
    // La confirmation d'un objet vide tient aussi.
    await pg.click(`${Z} [data-c-joindre]`);
    await pg.fill(`${Z} #cObj`, '');
    await envoyer();
    const c = await pg.evaluate((Z) => document.querySelector(`${Z} [data-c-confirme]`).getBoundingClientRect().bottom + document.scrollingElement.scrollTop, Z);
    vrai(c <= h, `${w}×${h} : la confirmation dépasse la fenêtre (${c})`);
  }
  await pg.setViewportSize({ width: 1366, height: 768 });
});

await v('Courriel : au clavier — Tab atteint À, Objet, Message, Joindre, Envoyer ; le menu des fichiers s’ouvre au clavier et Échap le ferme', async () => {
  await monter();
  await enregistrerOrdre();
  await nouveau();
  await pg.focus(`${Z} #cA`);
  const suite = [];
  const ou = () => pg.evaluate(() => (document.activeElement.id || (document.activeElement.dataset.cJoindre !== undefined ? 'joindre' : '?')));
  for (let i = 0; i < 3; i++) { await pg.keyboard.press('Tab'); suite.push(await ou()); }
  egal(suite, ['cObj', 'cMsg', 'joindre'], 'ordre de tabulation');
  await pg.keyboard.press('Enter');
  vrai(await pg.evaluate(() => document.activeElement.dataset.cJoint !== undefined), 'le focus ne va pas au premier fichier');
  await pg.keyboard.press('Enter');
  await pause();
  egal(await noms(), ['Cahier des charges'], 'Entrée ne joint pas le fichier');
  vrai(await pg.evaluate(() => document.activeElement.dataset.cJoindre !== undefined), 'le focus ne revient pas sur « Joindre »');
  await pg.keyboard.press('Enter');
  await pg.keyboard.press('Escape');
  vrai(await pg.$eval(`${Z} [data-c-menu]`, (m) => m.hidden), 'Échap ne ferme pas le menu');
});

await v('Courriel : aucune erreur de page pendant le bloc', async () => {
  egal(erreursC, [], 'erreurs');
});

await ctxC.close();
}
