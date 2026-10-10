// Suite de tests de Prepalog — bloc « questions » : les questions au fil et les points d'étape
// (core/types/questions.js, branchés dans core/types/entreprise.js), brief `docs/briefs/MOTEUR-questions-au-fil.md`,
// lot 2 (§4.10 et §4.8 bis), 08/10/2026.
//
// `node outils/test.mjs questions` lance ce bloc (précédé du socle, pour le Repérage de l'enseignant). Il monte la
// séance d'essai (`contenus/questions-essai.js`, questions `contenus/questions/ESSAI.js`) dans un contexte de
// navigateur à lui, avec de vrais clics. Les VARIANTES du fichier de questions (reformulé, question ajoutée, retirée,
// mise de côté, jamais déclenchée) sont fabriquées ici, dans la page, à partir du vrai fichier.
//
// Ce qui vaut son prix : la base (première réponse rangée en CLÉ, jamais réécrite, gardée par « Réinitialiser »), le
// gel (on regarde, on ne touche pas), le rattrapage (aucun élève bloqué), le contrôle au chargement. Valeurs attendues
// écrites à la main : `ou-verifier` juste = 'stock' ; `qui-utilise-le-bon` = 'prepa' ; `ce-que-malo-attend` =
// 'remplacement' ; part 4 sur 20, partagée en trois (4/3 chacune) ; jalons de la séance 8 + 4 + 4.

import fs from 'node:fs';
import path from 'node:path';

export default async function bloc({ v, nav, page, BASE, ROOT, egal, vrai }) {

// Le moteur arrondit la note au millième.
const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };

const ctxQ = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const erreursQ = [];
const pg = await ctxQ.newPage();
pg.setDefaultTimeout(6000);
pg.on('pageerror', (e) => erreursQ.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursQ.push('CONSOLE: ' + m.text()); });
pg.on('dialog', (d) => d.accept());
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// Monte la séance d'essai. `db` : base de départ (copiée) ; `role` ; `copie` ; `variante` du fichier de questions.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const S = await import('/contenus/questions-essai.js');
  const { QUESTIONS } = await import('/contenus/questions/ESSAI.js');
  document.querySelector('#qTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'qTest'; document.body.prepend(hote);
  // Les variantes : le vrai fichier, retouché comme le ferait Tristan.
  const Q = { ...QUESTIONS, liste: QUESTIONS.liste.map((q) => ({ ...q, choix: q.choix && q.choix.map((c) => ({ ...c })) })),
    etapes: QUESTIONS.etapes.map((e) => ({ ...e, questions: e.questions.slice() })) };
  const q = (id) => Q.liste.find((x) => x.id === id);
  if (o.variante === 'reformule') {
    Q.liste.forEach((x) => { if (x.choix) { x.choix.reverse(); x.choix.forEach((c) => { c.lib = `${c.lib} (reformulé)`; }); x.enonce += ' (reformulé)'; } });
  } else if (o.variante === 'ajoute') {
    Q.liste.push({ id: 'nouvelle', type: 'fil', de: 'Karim', quand: q('ou-verifier').quand, enonce: 'Une question ajoutée ?',
      choix: [{ v: 'a', lib: 'A' }, { v: 'b', lib: 'B' }, { v: 'c', lib: 'C' }], juste: 'a', groupe: 'Question ajoutée', retour: 'Retour.' });
  } else if (o.variante === 'retire') {
    Q.liste = Q.liste.filter((x) => x.id !== 'ce-que-malo-attend');
    Q.etapes[0].questions = ['qui-utilise-le-bon'];
  } else if (o.variante === 'inactif') {
    q('ou-verifier').actif = false;
  } else if (o.variante === 'jamais') {
    q('ou-verifier').quand = () => false;
  } else if (o.variante === 'quantite') {
    const { apresGeste } = await import('/core/declencheurs.js');
    q('ou-verifier').quand = apresGeste('fiche:bon:quantite');
  }
  // Le transfert d'un message (chantier D-1) : `qTransfert` ajoute une question de réflexion au premier transfert ;
  // `transfert` fait de l'essai une séance `correction` où le transfert est noté (2 points pris au remplacement) ;
  // `transfertFaux` déclare un destinataire inconnu ou oublie la clé (le moteur le signale, pas de bouton).
  if (o.qTransfert) {
    const { apresGeste } = await import('/core/declencheurs.js');
    Q.liste.push({ id: 'au-transfert', type: 'fil', de: 'Karim', quand: apresGeste('messagerie:transfert'), reflexion: true,
      enonce: 'Pourquoi ne pas tout envoyer au responsable ?', choix: [{ v: 'deborde', lib: 'Il serait débordé' },
        { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }], retour: 'Chacun traite ce qui le concerne.' });
  }
  const U = S.univers({ copie: !!o.copie });
  U.questions = Q;
  // L'écran « Avant de commencer » (10/10/2026) : trois questions d'ouverture sur deux documents et un visuel (une photo du
  // dépôt, avec son crédit), une aide à mot cliquable. Réponses justes écrites à la main dans le bloc : ouv-a = 'x',
  // ouv-b = 'y', ouv-c = 'z'.
  if (o.ouverture || o.evaluation) {
    U.documents = [{ id: 'doc-a', titre: 'Document A', court: 'Doc A', html: '<p>Contenu du document A</p>' },
      { id: 'doc-b', titre: 'Document B', court: 'Doc B', html: '<p>Contenu du document B</p>' }];
    U.lexique = { 'mot-test': 'Définition du mot de test.' };
    const choix = () => [{ v: 'x', lib: 'Choix X' }, { v: 'y', lib: 'Choix Y' }, { v: 'z', lib: 'Choix Z' }];
    Q.liste.push(
      { id: 'ouv-a', type: 'ouverture', de: 'Ines', doc: 'doc-a', enonce: 'Question ouverte A ?', aide: 'Regarde le [[mot-test]] dans le document.',
        choix: choix(), juste: 'x', retour: 'Retour de A.', melanger: false },
      { id: 'ouv-b', type: 'ouverture', de: 'Ines', doc: 'photos', enonce: 'Question ouverte B ?', aide: 'Regarde la photo.',
        choix: choix(), juste: 'y', retour: 'Retour de B.', melanger: false },
      { id: 'ouv-c', type: 'ouverture', de: 'Ines', doc: 'doc-b', enonce: 'Question ouverte C ?',
        choix: choix(), juste: 'z', retour: 'Retour de C.', melanger: false });
    Q.ouverture = { id: 'avant', de: 'Ines', titre: 'Avant de commencer', continuer: 'voir l’accueil',
      situation: 'Bonjour ! Lis les documents à gauche et réponds à mes questions.',
      documents: ['doc-a', 'doc-b', { id: 'photos', court: 'Photos', titre: 'La photo', type: 'images', images: [
        { src: './contenus/images/france-boissons/futs-mur.jpg', alt: 'Des fûts alignés', legende: 'Des fûts.', credit: 'Photo : Marco Zuppone, Unsplash' }] }],
      questions: ['ouv-a', 'ouv-b', 'ouv-c'] };
    // ÉVALUATION (lot 2) : l'écran est noté sur 4 points (`part`), sans aide ; les questions au fil de l'essai sont retirées
    // pour que la somme des poids reste 20 (socle 16 + 4).
    if (o.evaluation) {
      Q.liste = Q.liste.filter((x) => x.type === 'ouverture');
      Q.liste.forEach((x) => { delete x.aide; });
      Q.etapes = [];
      Q.ouverture.part = 4;
    }
  }
  if (o.transfert) {
    U.etapes = U.etapes.map((e) => (e.id === 'remplacement' ? { ...e, poids: 6, ecran: 'fiche:bon' } : e.id === 'quantite' ? { ...e, ecran: 'fiche:bon' } : e))
      .concat(S.ETAPE_TRANSFERT);
  }
  if (o.transfertFaux) {
    const semer = U.volet.semer;
    U.volet = { ...U.volet, semer: (p, d) => {
      const g = semer(p, d);
      g.mails.push({ folder: 'in', ts: Date.now(), from: 'X', to: p, cle: 'faux', subject: 'Faux', kind: 'text', text: '.', transfert: { a: ['ines', 'inconnu'] } });
      g.mails.push({ folder: 'in', ts: Date.now(), from: 'Y', to: p, subject: 'Sans clé', kind: 'text', text: '.', transfert: { a: ['ines'] } });
      return g;
    } };
  }
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__q = { db, enregistres: [], Q, moteur: null };
  const ctx = {
    meta: { ...S.META, ...(o.copie ? { copie: true, temps: 'evaluation' } : {}), ...(o.transfert ? { correction: true } : {}) },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__q.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ESSAI',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  };
  const M = creerEntreprise(U);
  window.__q.moteur = M;
  M.rendre(hote, ctx);
}, o);

const Z = '#qTest';
const pause = (ms = 80) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__q.db)));
const reps = async () => (((await base()).questions || {})['essai-questions']) || {};
const note = () => pg.evaluate(() => window.__q.moteur.noter(window.__q.db));
const aller = async (vue) => { await pg.evaluate(({ Z, vue }) => document.querySelector(`${Z} .ent-nav[data-vue="${vue}"]`).click(), { Z, vue }); await pause(); };
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const panneau = () => present('[data-q-panneau]');
async function choisirRemplacement(val) {
  await aller('fiche');
  await pg.selectOption(`${Z} [data-fiche-champ="remplacement"]`, val);
  await pause();
}
async function repondreQ(id, val) {
  await pg.click(`${Z} [data-q-choix="${val}"][data-q="${id}"]`);
  await pg.click(`${Z} [data-q-repondre="${id}"]`);
  await pause();
}
async function reprendre() { await pg.click(`${Z} [data-q-reprendre]`); await pause(); }
async function envoyerBon(qte = '8') {
  await aller('fiche');
  await pg.fill(`${Z} [data-fiche-saisie="quantite"]`, qte);
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
async function ouvrirMalo() {
  await aller('mail');
  const id = await pg.evaluate(() => window.__q.db.mails.find((m) => m.cle === 'malo').id);
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pause();
}
async function repondreMalo(texte) {
  await ouvrirMalo();
  await pg.click(`${Z} [data-repondre]`);
  await pg.fill(`${Z} #repT`, texte);
  await pg.click(`${Z} #formRep button[type="submit"]`);
  await pause();
}
// Le parcours jusqu'au point d'étape : remplacement faux, question de Karim fausse, bon faux envoyé.
async function jusquAuPointDEtape() {
  await monter();
  await choisirRemplacement('LIM-1L');
  await repondreQ('ou-verifier', 'mail');
  await reprendre();
  await envoyerBon('8');
  await aller('etape:avant-malo');
}

await v('Questions : rien n’arrive à l’ouverture ni en cliquant tous les menus et tous les messages', async () => {
  await monter();
  const vues = await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((b) => b.dataset.vue));
  for (const vue of vues) await aller(vue);
  await aller('mail');
  for (const id of await pg.evaluate(() => window.__q.db.mails.map((m) => m.id))) await pg.click(`${Z} [data-mail="${id}"]`);
  egal(await reps(), {}, 'réponses rangées');
  vrai(!(await panneau()), 'un panneau s’est ouvert');
  vrai(!(await present('.ent-nav[data-vue^="etape:"]')), 'un point d’étape est au menu');
  vrai(!(await present('[data-qf-ferme]')), 'la réponse à Malo est fermée avant le point d’étape');
});

await v('Questions au fil : le geste (choix FAUX) ouvre le panneau, une fois ; l’écran est gelé ; le stock et les messages s’ouvrent, le panneau suit ; la réponse dégèle', async () => {
  await monter();
  await choisirRemplacement('LIM-1L');
  vrai(await panneau(), 'le panneau ne s’est pas ouvert au choix du remplacement');
  egal(Object.keys(await reps()), ['ou-verifier'], 'questions arrivées');
  vrai(/Karim te pose une question/.test(await pg.textContent(`${Z} [data-qf-bandeau]`)), 'bandeau du gel');
  // Gelé : les champs et l'envoi sont désactivés, et un envoi forcé (clic en script) ne part pas.
  vrai(await pg.$eval(`${Z} [data-fiche-envoyer]`, (b) => b.disabled), 'l’envoi n’est pas désactivé');
  vrai(await pg.$eval(`${Z} [data-fiche-saisie="quantite"]`, (b) => b.disabled), 'la quantité n’est pas désactivée');
  await pg.evaluate((Z) => document.querySelector(`${Z} [data-fiche-envoyer]`).dispatchEvent(new MouseEvent('click', { bubbles: true })), Z);
  await pause();
  vrai(!(await present('[data-confirme-oui]')) && !(await base()).fiches.bon.envoye, 'un envoi est passé pendant le gel');
  // On regarde : Stock, Messagerie ; le panneau suit.
  await aller('stock');
  vrai(await panneau(), 'le panneau ne suit pas sur le Stock');
  vrai(/JUS-POM/.test(await pg.textContent(`${Z} #entMain`)), 'le stock ne s’affiche pas');
  await aller('mail');
  vrai(await panneau(), 'le panneau ne suit pas sur la Messagerie');
  vrai(await pg.$eval(`${Z} [data-nouveau]`, (b) => b.disabled), '« Nouveau message » n’est pas gelé');
  // Répondre (faux) : posée avant l'envoi, elle est corrigée au bilan → « Merci, je note », pas de ✓ / ✗.
  await repondreQ('ou-verifier', 'mail');
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'un ✓ / ✗ avant le bilan');
  await reprendre();
  vrai(!(await panneau()), 'le panneau reste après « Reprendre mon travail »');
  await aller('fiche');
  vrai(!(await pg.$eval(`${Z} [data-fiche-envoyer]`, (b) => b.disabled)), 'l’envoi reste gelé après la réponse');
  const r = (await reps())['ou-verifier'];
  egal([r.premiere, typeof r.arrivee, typeof r.duree], ['mail', 'number', 'number'], 'réponse rangée');
  // Une seule fois : un autre choix de remplacement ne la refait pas venir.
  await choisirRemplacement('JUS-POM');
  vrai(!(await panneau()), 'la question est revenue');
});

await v('Point d’étape : après l’envoi (faux), carte et menu ; « Répondre » à Malo fermé ; deux réponses fausses → ✗ ✗, « Continuer » ouvre la réponse à Malo', async () => {
  await jusquAuPointDEtape();
  await aller('accueil');   // le bandeau « … t'attend » se voit ailleurs que sur l'écran du point d'étape
  vrai(await present('[data-cartes] [data-carte-etape="avant-malo"]'), 'pas de carte « Point d’étape »');
  vrai(await present('.ent-nav[data-vue="etape:avant-malo"]'), 'pas d’entrée de menu');
  vrai(await present('[data-qf-attend="avant-malo"]'), 'pas de bandeau « … t’attend »');
  await ouvrirMalo();
  vrai(await present('[data-qf-ferme]') && !(await present('[data-repondre]')), '« Répondre » à Malo n’est pas fermé');
  await pg.click(`${Z} [data-qf-ferme] [data-q-aller-etape]`);
  await pause();
  vrai(await present('[data-q-etape="avant-malo"]'), '« Y aller » n’ouvre pas le point d’étape');
  egal(await pg.$$eval(`${Z} .qf-num`, (L) => L.map((x) => x.textContent.trim())), ['Question 1 sur 2', 'Question 2 sur 2'], 'numéros');
  vrai(await pg.$eval(`${Z} [data-q-continuer]`, (b) => b.disabled), '« Continuer » actif sans réponse');
  await repondreQ('qui-utilise-le-bon', 'chauffeur');
  vrai(await pg.$eval(`${Z} [data-q-continuer]`, (b) => b.disabled), '« Continuer » actif avec une réponse sur deux');
  await repondreQ('ce-que-malo-attend', 'excuses');
  egal(await pg.$$eval(`${Z} [data-q-verdict]`, (L) => L.map((x) => x.dataset.qVerdict)), ['ko', 'ko'], 'verdicts');
  // Pas de seconde réponse : les choix sont désactivés, un clic forcé ne change rien.
  vrai(await pg.$eval(`${Z} [data-q-choix="prepa"]`, (b) => b.disabled), 'on peut encore choisir');
  await pg.evaluate((Z) => {
    const b = document.querySelector(`${Z} [data-q-choix="prepa"]`); b.disabled = false; b.click();
    // Un bouton « Répondre » remis à la main (l'écran n'en montre plus) : c'est la garde du moteur qu'on éprouve.
    const r = document.createElement('button');
    r.dataset.qRepondre = 'qui-utilise-le-bon';
    b.closest('[data-question]').append(r);
    r.click();
  }, Z);
  await pause();
  egal((await reps())['qui-utilise-le-bon'].premiere, 'chauffeur', 'première réponse réécrite');
  vrai(!(await present('[data-cartes] [data-carte-etape]')), 'la carte du point d’étape reste après les réponses');
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
  vrai(await present('[data-repondre]') && /Ma commande de jus d’orange/.test(await pg.textContent(`${Z} .ent-lecteur h3`)), '« Continuer » n’ouvre pas la réponse à Malo');
  // Les jalons des questions : faux tous les trois.
  const d = (await note()).detail;
  egal([d['question:ou-verifier'], d['question:qui-utilise-le-bon'], d['question:ce-que-malo-attend']], ['ko', 'ko', 'ko'], 'jalons');
});

await v('Questions : « Réinitialiser » efface le travail, pas les réponses ; une question déjà arrivée ne revient pas', async () => {
  await jusquAuPointDEtape();
  await repondreQ('qui-utilise-le-bon', 'chauffeur');
  const avant = await reps();
  await pg.click(`${Z} [data-raz]`);
  await pause(150);
  egal(await reps(), avant, 'réponses après « Réinitialiser »');
  vrai(!(await base()).fiches || !(await base()).fiches.bon || !(await base()).fiches.bon.envoye, 'le travail n’est pas effacé');
  await choisirRemplacement('LIM-1L');
  vrai(!(await panneau()), 'la question de Karim revient après « Réinitialiser »');
});

await v('Questions : la note — part de 4 partagée en trois, la première réponse seule compte, 20 au maximum', async () => {
  await jusquAuPointDEtape();
  await repondreQ('qui-utilise-le-bon', 'prepa');
  await repondreQ('ce-que-malo-attend', 'excuses');
  const n = await note();
  egal(n.max, 20, 'note sur');
  // Remplacement faux (0/8), quantité fausse (0/4), Malo pas encore (0/4) ; une question juste sur trois : 4/3.
  proche(n.score, 4 / 3, 'note');
});

await v('Souplesse : reformuler les choix et en changer l’ordre ne change rien aux réponses rangées', async () => {
  await jusquAuPointDEtape();
  await repondreQ('qui-utilise-le-bon', 'prepa');
  await repondreQ('ce-que-malo-attend', 'excuses');
  const db = await base();
  const avant = (await note()).detail;
  await monter({ db, variante: 'reformule' });
  const apres = (await note()).detail;
  egal(['ou-verifier', 'qui-utilise-le-bon', 'ce-que-malo-attend'].map((id) => apres[`question:${id}`]),
    ['ou-verifier', 'qui-utilise-le-bon', 'ce-que-malo-attend'].map((id) => avant[`question:${id}`]), 'jalons après reformulation');
  egal(['ok', 'ko'], [apres['question:qui-utilise-le-bon'], apres['question:ce-que-malo-attend']], 'jalons attendus');
  // À l'écran : le choix pris est toujours celui de l'élève (clé), même déplacé et reformulé.
  await aller('etape:avant-malo');
  egal(await pg.$$eval(`${Z} [data-question="qui-utilise-le-bon"] .qf-pris`, (L) => L.map((b) => b.dataset.qChoix)), ['prepa'], 'choix pris affiché');
});

await v('Souplesse : ajouter une question (somme toujours 20, l’élève en cours la reçoit), en retirer une (la note se refait sur les autres), en mettre une de côté (elle n’arrive plus)', async () => {
  // Élève en cours : remplacement choisi, question de Karim répondue, bon pas encore envoyé.
  await monter();
  await choisirRemplacement('LIM-1L');
  await repondreQ('ou-verifier', 'stock');
  await reprendre();
  const enCours = await base();
  await monter({ db: enCours, variante: 'ajoute' });
  egal((await note()).max, 20, 'note sur, avec la question ajoutée');
  vrai(await present('[data-q-panneau="nouvelle"]'), 'l’élève en cours ne reçoit pas la question ajoutée');
  await repondreQ('nouvelle', 'a');
  proche((await note()).score, 2, 'deux questions justes sur quatre (4 × 2/4)');
  // Retirer : plus de jalon pour elle, la part se répartit sur les deux qui restent (2 chacune).
  await jusquAuPointDEtape();
  await repondreQ('qui-utilise-le-bon', 'prepa');
  await repondreQ('ce-que-malo-attend', 'remplacement');
  await monter({ db: await base(), variante: 'retire' });
  const n = await note();
  egal([n.max, n.detail['question:ce-que-malo-attend']], [20, undefined], 'question retirée');
  proche(n.score, 2, 'note sur les deux questions restantes');
  // Mettre de côté : le geste ne la fait plus venir.
  await monter({ variante: 'inactif' });
  await choisirRemplacement('LIM-1L');
  vrai(!(await panneau()), 'une question mise de côté est arrivée');
  egal((await note()).max, 20, 'note sur, une question de côté');
});

await v('Pire cas : tout faux, et le geste de la question au fil jamais fait → elle arrive au bilan (rattrapage), la séance s’achève, la suite s’ouvre', async () => {
  await monter({ variante: 'jamais' });
  await choisirRemplacement('LIM-1L');
  vrai(!(await panneau()), 'la question est arrivée sans son geste');
  await envoyerBon('8');
  await aller('etape:avant-malo');
  await repondreQ('qui-utilise-le-bon', 'chauffeur');
  await repondreQ('ce-que-malo-attend', 'excuses');
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
  await pg.click(`${Z} [data-repondre]`);
  await pg.fill(`${Z} #repT`, 'Bonjour, ce sera de la limonade.');
  await pg.click(`${Z} #formRep button[type="submit"]`);
  await pause();
  // La question de réflexion (après la réponse à Malo) d'abord, puis, rattrapée, celle de Karim.
  vrai(await present('[data-q-panneau="vides"]'), 'la question de réflexion n’est pas arrivée');
  vrai(!(await present('[data-fin-seance] [data-fin]')), 'bilan avant la question rattrapée');
  await repondreQ('vides', 'trier');
  vrai(await present('.qf-retour') && !(await present('[data-q-verdict]')), 'réflexion : retour sans ✓ / ✗');
  await reprendre();
  vrai(await present('[data-q-panneau="ou-verifier"]'), 'la question jamais déclenchée n’est pas rattrapée au bilan');
  await repondreQ('ou-verifier', 'mail');
  await reprendre();
  vrai(await present('[data-fin-seance] [data-fin]'), 'pas de bandeau de fin');
  vrai(!!((await base()).points || {})['essai-questions'], 'la photo de fin (séance suivante) n’est pas rangée');
  // Corrigée au bilan : son explication vient avec le bandeau de fin.
  vrai(await present('[data-fin-retour="ou-verifier"]'), 'l’explication de Karim manque au bilan');
});

await v('Contrôle au chargement : `juste` inconnu, clé en double, question non citée, `de` inconnu → message qui nomme la question ; tous les fichiers de questions se chargent', async () => {
  const fichiers = fs.readdirSync(path.join(ROOT, 'contenus', 'questions')).filter((f) => f.endsWith('.js'));
  vrai(fichiers.length >= 1, 'aucun fichier de questions');
  const r = await pg.evaluate(async (fichiers) => {
    const { compilerQuestions } = await import('/core/types/questions.js');
    const { QUESTIONS } = await import('/contenus/questions/ESSAI.js');
    const essai = (f) => { try { f(); return 'ok'; } catch (e) { return e.message; } };
    const copie = () => ({ ...QUESTIONS, liste: QUESTIONS.liste.map((q) => ({ ...q, choix: q.choix && q.choix.map((c) => ({ ...c })) })) });
    const a = copie(); a.liste[0].juste = 'nulle-part';
    const b = copie(); b.liste[1].choix[1].v = b.liste[1].choix[0].v;
    const c = copie(); c.etapes = [{ ...c.etapes[0], questions: ['qui-utilise-le-bon'] }];
    const d = copie(); d.liste[3].de = 'Personne';
    const tous = {};
    for (const f of fichiers) {
      const m = await import(`/contenus/questions/${f}`);
      // Les documents de l'écran d'ouverture sont ceux de la séance (hors de ce fichier) : on cite ceux que le fichier nomme.
      tous[f] = essai(() => compilerQuestions(m.QUESTIONS, null, ((m.QUESTIONS.ouverture || {}).documents || []).filter((d) => typeof d === 'string')));
    }
    return { a: essai(() => compilerQuestions(a)), b: essai(() => compilerQuestions(b)), c: essai(() => compilerQuestions(c)),
      d: essai(() => compilerQuestions(d)), tous };
  }, fichiers);
  vrai(/« ou-verifier ».*`juste` = « nulle-part »/.test(r.a), 'juste inconnu : ' + r.a);
  vrai(/« qui-utilise-le-bon ».*en double/.test(r.b), 'clé en double : ' + r.b);
  vrai(/« ce-que-malo-attend » n’est citée par aucun point d’étape/.test(r.c), 'question non citée : ' + r.c);
  vrai(/« vides ».*Personne/.test(r.d), 'personne inconnue : ' + r.d);
  egal(Object.values(r.tous).filter((x) => x !== 'ok'), [], 'fichiers de questions');
  // Dans le moteur : la séance ne s'ouvre pas (creerEntreprise lève l'erreur).
  const m = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const S = await import('/contenus/questions-essai.js');
    const U = S.univers();
    U.questions = { ...U.questions, liste: U.questions.liste.map((q, i) => (i === 0 ? { ...q, juste: 'x' } : q)) };
    try { creerEntreprise(U); return 'ouverte'; } catch (e) { return e.message; }
  });
  vrai(/ou-verifier/.test(m), 'le moteur ouvre une séance mal déclarée : ' + m);
});

await v('Enseignant : bonne réponse marquée, jamais gelé, rien d’écrit ; il voit les points d’étape et les questions au fil', async () => {
  await monter({ role: 'prof' });
  await choisirRemplacement('LIM-1L');
  vrai(!(await panneau()), 'un panneau chez l’enseignant');
  vrai(!(await pg.$eval(`${Z} [data-fiche-envoyer]`, (b) => b.disabled)), 'l’enseignant est gelé');
  await aller('etape:avant-malo');
  egal(await pg.$$eval(`${Z} .qf-bonne`, (L) => L.map((b) => b.dataset.qChoix)), ['prepa', 'remplacement'], 'bonnes réponses marquées');
  vrai(await pg.$eval(`${Z} [data-q-choix="prepa"]`, (b) => b.disabled), 'l’enseignant peut répondre');
  await aller('questions-fil');
  egal(await pg.$$eval(`${Z} .qf-bonne`, (L) => L.map((b) => b.dataset.qChoix)), ['stock'], 'questions au fil (enseignant)');
  egal((await base()).questions, undefined, 'base de l’enseignant');
});

await v('Évaluation : « Merci, je note » pour toutes les questions, aucune correction avant la remise', async () => {
  await monter({ copie: true });
  await choisirRemplacement('LIM-1L');
  await repondreQ('ou-verifier', 'stock');
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'question au fil corrigée en évaluation');
  await reprendre();
  await envoyerBon('10');
  await aller('etape:avant-malo');
  await repondreQ('qui-utilise-le-bon', 'prepa');
  vrai(!(await present('[data-q-verdict]')), 'point d’étape corrigé en évaluation');
  egal(await pg.$$eval(`${Z} [data-q-merci]`, (L) => L.map((x) => x.textContent.trim())), ['« Merci, je note. »'], 'texte');
});

await v('Sorties de page : onglet quitté pendant une question → compté avec la réponse, une ligne pour l’élève ; 1 s hors de la fenêtre ou après la réponse → rien ; la note ne change pas', async () => {
  const cacher = (h) => pg.evaluate((h) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event(h ? 'blur' : 'focus'));
  }, h);
  await monter();
  await choisirRemplacement('LIM-1L');
  // Fenêtre quittée 1 s (un clic dans la barre d'adresse) : rien.
  await pg.evaluate(() => window.dispatchEvent(new Event('blur')));
  await pause(1000);
  await pg.evaluate(() => window.dispatchEvent(new Event('focus')));
  await pause();
  vrai(!(await present('[data-q-sortie]')), 'une sortie de 1 s est comptée');
  // Onglet caché puis montré : une sortie, une ligne pour l'élève.
  await cacher(true); await pause(300); await cacher(false); await pause();
  await pg.evaluate(() => { delete document.visibilityState; });
  vrai(/ton enseignant le verra/.test(await pg.textContent(`${Z} [data-q-sortie]`)), 'pas de ligne pour l’élève');
  await repondreQ('ou-verifier', 'stock');
  const r = (await reps())['ou-verifier'];
  egal([r.sorties, typeof r.horsPage], [1, 'number'], 'sortie rangée avec la réponse');
  // Après la réponse : rien de plus.
  await cacher(true); await pause(300); await cacher(false); await pause();
  await pg.evaluate(() => { delete document.visibilityState; });
  egal((await reps())['ou-verifier'].sorties, 1, 'une sortie après la réponse est comptée');
  // Remontée avec la note (ce que lit l'enseignant), et la note est la même qu'une réponse sans sortie.
  const avec = await note();
  egal(avec.detail.indicateurs['essai-questions'].questions['ou-verifier'].sorties, 1, 'sortie remontée avec la note');
  await monter();
  await choisirRemplacement('LIM-1L');
  await repondreQ('ou-verifier', 'stock');
  vrai(!(await present('[data-q-sortie]')), 'ligne de sortie chez un autre élève');
  egal((await note()).score, avec.score, 'la sortie change la note');
});

await v('Repérage (enseignant) : « a quitté la page pendant 2 questions (3 fois, 1 min 40) », un tiret sans sortie', async () => {
  const ouvrirSuivi = async () => {
    await page.reload();
    await page.waitForSelector('#btnProfEspace, #btnProf, #btnDeco', { timeout: 8000 });
    if (!(await page.$('#btnProfEspace'))) {
      if (!(await page.$('#btnProf'))) { await page.click('#btnDeco'); await page.waitForSelector('#btnProf', { timeout: 8000 }); }
      await page.click('#btnProf');
    }
    await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
    await page.click('#btnProfEspace');
    await page.click('[data-ong="suivi"]');
    await page.waitForSelector('#btnCsvSuivi', { timeout: 6000 });
  };
  await ouvrirSuivi();
  const nomGroupe = (await page.textContent('#btnCsvSuivi >> xpath=ancestor::div[1]//strong')).replace(/^Suivi de /, '').trim();
  const ids = await page.evaluate(async (nomGroupe) => {
    const k = Object.keys(localStorage).find((x) => /groupes$/.test(x));
    const gs = JSON.parse(localStorage.getItem(k));
    const gid = Object.keys(gs).find((id) => gs[id].nom === nomGroupe);
    const { B } = await import('/core/backend.js');
    await B.creerEleves(gid, [{ nom: 'SORTIES', prenom: 'Test', matricule: 'sorties-test', code: 'x' },
      { nom: 'SANSSORTIE', prenom: 'Test', matricule: 'sanssortie-test', code: 'x' }]);
    const L = await B.elevesDuGroupe(gid);
    const el = L.find((x) => x.nom === 'SORTIES'), el2 = L.find((x) => x.nom === 'SANSSORTIE');
    const { chargerActivites } = await import('/activites/index.js');
    // Une séance d'entreprise (code ENT-…) : c'est sa case du suivi qui porte l'infobulle des sorties.
    const m = (await chargerActivites()).map((x) => x.meta).find((x) => x.portee === 'eleve' && x.immersif && x.bareme && !x.copie && /^ENT-/.test(x.code));
    const questions = { a: { premiere: 'x', sorties: 2, horsPage: 70 }, b: { premiere: 'y', sorties: 1, horsPage: 30 }, c: { premiere: 'z' },
      '@etapes': { e: 1 } };
    await B.ecrireScore(gid, el.uid, m.id, { score: 2, max: 5, detail: { indicateurs: { [m.id]: { temps: 600, premier: { a: 'ok' }, questions } } } });
    await B.ecrireScore(gid, el2.uid, m.id, { score: 2, max: 5, detail: { indicateurs: { [m.id]: { temps: 600, premier: { a: 'ok' },
      questions: { a: { premiere: 'x' } } } } } });
    return { gid, uid: el.uid, uid2: el2.uid, aid: m.id };
  }, nomGroupe);
  try {
    await ouvrirSuivi();
    await page.waitForSelector(`#reperage [data-reperage="${ids.aid}"]`, { timeout: 6000 });
    const ligne = (uid) => page.$eval(`#reperage [data-reperage="${ids.aid}"] tr[data-rep-eleve="${uid}"] [data-rep="sorties"]`,
      (td) => [td.textContent.trim(), td.title]);
    egal(await ligne(ids.uid), ['2 questions (3 fois, 1 min 40)', 'Questions concernées : a, b'], 'élève sorti');
    egal(await ligne(ids.uid2), ['—', ''], 'élève sans sortie');
    const bulle = await page.$eval(`td[title*="a quitté la page"]`, (td) => td.title).catch(() => '');
    vrai(/a quitté la page pendant 2 questions \(3 fois, 1 min 40\)/.test(bulle), 'infobulle du suivi : ' + bulle);
  } finally {
    await page.evaluate(async ({ gid, uid, uid2, aid }) => {
      const { B } = await import('/core/backend.js');
      for (const u of [uid, uid2]) { await B.poserNote(gid, u, aid, null); await B.supprimerEleve(u); }
    }, ids);
  }
});

// Lot 3 (signaux de geste) : la question de Karim arrive au GESTE de la fiche, rangé dans `db.gestes[<séance>]`.
await v('Gestes : choisir dans la fiche range le geste (une fois, par séance) ; une saisie le dit à la sortie de la case, jamais pendant la frappe ; un geste d’une autre séance ne compte pas', async () => {
  await monter();
  await choisirRemplacement('LIM-1L');
  const g = (await base()).gestes;
  egal(Object.keys(g), ['essai-questions'], 'gestes cloisonnés par séance');
  egal(typeof g['essai-questions']['fiche:bon:remplacement'], 'number', 'geste rangé');
  // Le même geste rangé pour une AUTRE séance : rien n'arrive.
  await monter({ db: { gestes: { 'autre-seance': { 'fiche:bon:remplacement': 1 } } } });
  vrai(!(await panneau()), 'un geste d’une autre séance fait arriver la question');
  // Rangé pour CETTE séance (base reprise d'un autre poste) : la question arrive à l'ouverture.
  await monter({ db: { gestes: { 'essai-questions': { 'fiche:bon:remplacement': 1 } } } });
  vrai(await panneau(), 'le geste rangé ne fait pas arriver la question à l’ouverture');
  // Une saisie : pendant la frappe, rien ; à la sortie de la case, le geste.
  await monter({ variante: 'quantite' });
  await aller('fiche');
  await pg.type(`${Z} [data-fiche-saisie="quantite"]`, '12');
  vrai(!(await panneau()), 'la question est arrivée pendant la frappe');
  await pg.press(`${Z} [data-fiche-saisie="quantite"]`, 'Tab');
  await pause();
  vrai(await panneau(), 'la question n’arrive pas à la sortie de la case');
  // Enseignant : aucun geste rangé.
  await monter({ role: 'prof' });
  await choisirRemplacement('LIM-1L');
  egal((await base()).gestes, undefined, 'gestes de l’enseignant');
});

await v('Gestes : chaque vue publie ses gestes (fiche, planning, quai, plan d’entrepôt, animation)', async () => {
  const r = await pg.evaluate(async () => {
    const { creerFiche } = await import('/core/types/fiche.js');
    const { creerPlanning } = await import('/core/types/planning.js');
    const { creerLecteur } = await import('/core/types/animation.js');
    const { FICHE_BON } = await import('/contenus/questions-essai.js');
    const C = await import('/contenus/planning-essai.js');
    const { ANIMATION_ESSAI } = await import('/contenus/animation-essai.js');
    return { fiche: creerFiche(FICHE_BON).signaux, planning: creerPlanning(C.CAS.quai).signaux,
      animation: creerLecteur(ANIMATION_ESSAI).signaux };
  });
  egal(r.fiche, ['fiche:bon:envoyer', 'fiche:bon:remplacement', 'fiche:bon:quantite'], 'fiche');
  egal(r.planning, ['planning:essai-quais:poser', 'planning:essai-quais:envoyer'], 'planning');
  vrai(r.animation.length > 0 && r.animation.every((x) => x.startsWith('animation:essai-fifo:')), 'animation : ' + r.animation);
  // Le quai et le plan d'entrepôt : la liste est écrite dans leur fichier (lue ici, sans les monter).
  const src = (f) => fs.readFileSync(path.join(ROOT, 'core', 'types', f), 'utf8');
  vrai(src('quai.js').includes('signaux: [`quai:${Q.id}:decharger`, `quai:${Q.id}:valider`, `quai:${Q.id}:cloturer`]'), 'quai');
  vrai(src('entrepot.js').includes('signaux: [`entrepot:${P.id}:poser`, `entrepot:${P.id}:verifier`]'), 'plan d’entrepôt');
});

// Lot 4 : les réponses de la classe, dans la Conduite de séance (sans les noms).
await v('Conduite de séance : par question, le nombre d’élèves par réponse (la première) et les réponses écrites, sans les noms', async () => {
  const ouvrirSeance = async () => {
    await page.reload();
    await page.waitForSelector('#btnProfEspace, #btnProf, #btnDeco', { timeout: 8000 });
    if (!(await page.$('#btnProfEspace'))) {
      if (!(await page.$('#btnProf'))) { await page.click('#btnDeco'); await page.waitForSelector('#btnProf', { timeout: 8000 }); }
      await page.click('#btnProf');
    }
    await page.waitForSelector('#btnProfEspace', { timeout: 8000 });
    await page.click('#btnProfEspace');
    await page.click('[data-ong="seance"]');
  };
  await ouvrirSeance();
  const nomGroupe = await page.evaluate(() => {
    const t = document.querySelector('#codeStock')?.closest('section')?.querySelector('label')?.textContent || '';
    return t.replace(/^Code du groupe /, '').trim();
  });
  const ids = await page.evaluate(async (nomGroupe) => {
    const k = Object.keys(localStorage).find((x) => /groupes$/.test(x));
    const gs = JSON.parse(localStorage.getItem(k));
    const gid = Object.keys(gs).find((id) => gs[id].nom === nomGroupe);
    const { B } = await import('/core/backend.js');
    await B.creerEleves(gid, ['UN', 'DEUX', 'TROIS'].map((n) => ({ nom: `CLASSE${n}`, prenom: 'Test', matricule: `classe-${n}`, code: 'x' })));
    const L = (await B.elevesDuGroupe(gid)).filter((x) => /^CLASSE/.test(x.nom));
    const { chargerActivites } = await import('/activites/index.js');
    const m = (await chargerActivites()).map((x) => x.meta).find((x) => x.portee === 'eleve' && x.immersif && x.bareme && !x.copie && /^ENT-/.test(x.code));
    const Q = [{ choix: { premiere: 'stock' }, libre: { libre: 'Les compter d’abord.' } },
      { choix: { premiere: 'mail' }, libre: { libre: 'Les trier.' } }, { choix: { premiere: 'stock' } }];
    for (let i = 0; i < 3; i++) {
      await B.ecrireScore(gid, L[i].uid, m.id, { score: 1, max: 5, detail: { indicateurs: { [m.id]: { questions: Q[i] } } } });
    }
    return { gid, uids: L.map((x) => x.uid), aid: m.id };
  }, nomGroupe);
  try {
    await ouvrirSeance();
    const S = `#reponsesClasse [data-reponses-seance="${ids.aid}"]`;
    await page.waitForSelector(S, { timeout: 6000 });
    const choix = await page.$$eval(`${S} [data-reponses-question="choix"] [data-reponses-choix]`,
      (L) => L.map((li) => [li.dataset.reponsesChoix, li.querySelector('.reponses-n').textContent.trim()]));
    egal(choix, [['stock', '2'], ['mail', '1']], 'nombre par réponse');
    const compte = (await page.textContent(`${S} [data-reponses-question="choix"]`)).replace(/\s+/g, ' ');
    vrai(/3 réponses sur 3 élèves/.test(compte), 'compte des réponses : ' + compte);
    const t = await page.textContent('#reponsesClasse');
    vrai(t.includes('Les compter d’abord.') && t.includes('Les trier.'), 'réponses écrites');
    vrai(!/CLASSE/.test(t), 'un nom d’élève apparaît');
  } finally {
    await page.evaluate(async ({ gid, uids, aid }) => {
      const { B } = await import('/core/backend.js');
      for (const u of uids) { await B.poserNote(gid, u, aid, null); await B.supprimerEleve(u); }
    }, ids);
  }
});

// ── LE TRANSFERT D'UN MESSAGE (chantier D-1, 09/10/2026, `core/types/transfert.js`) ─────────────────────────────
// Le message de la brasserie (clé 'brasserie-quai'), destinataires dans l'ordre déclaré : ines, karim, nadia, thomas ;
// attendu (variante notée) : nadia. Valeurs écrites à la main.
const transferts = async () => (((await base()).transferts || {})['essai-questions']) || {};
async function ouvrirBrasserie() {
  await aller('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  const id = await pg.evaluate(() => window.__q.db.mails.find((m) => m.cle === 'brasserie-quai').id);
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pause();
}
async function transferer(qui, { confirmer = true } = {}) {
  await ouvrirBrasserie();
  await pg.click(`${Z} [data-transfert-ouvrir]`);
  await pause();
  await pg.click(`${Z} [data-transferer="${qui}"]`);
  if (confirmer) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); }
}
const accuses = () => pg.evaluate(() => window.__q.db.mails.filter((m) => m.subject === 'TR : Livraison de mercredi').map((m) => m.from));
const noteSuivi = () => pg.evaluate(() => { const L = window.__q.enregistres; return L.length ? L[L.length - 1].score : null; });

await v('Transfert : « Transférer à… », la liste (ordre déclaré, nom et fonction, sans aplat), la confirmation dans la page, « Transféré à Karim » ; rangé une fois, le bouton ne revient pas ; l’accusé arrive (apresTransfert, destinataire faux), le geste est rangé', async () => {
  await monter({ qTransfert: true });
  await ouvrirBrasserie();
  vrai(!(await present('[data-transfert-liste]')), 'la liste est ouverte d’avance');
  egal(await pg.textContent(`${Z} [data-transfert-marque="brasserie-quai"]`), '↪ À transférer', 'marque dans la liste');
  await pg.click(`${Z} [data-transfert-ouvrir]`);
  await pause();
  egal(await pg.$$eval(`${Z} [data-transferer]`, (L) => L.map((b) => b.dataset.transferer)), ['ines', 'karim', 'nadia', 'thomas'], 'ordre des destinataires');
  egal(await pg.$$eval(`${Z} [data-transferer]`, (L) => L.map((b) => b.textContent.replace(/\s+/g, ' ').trim())),
    ['Inès Moreau · assistante commerciale', 'Karim Benali · chef d’équipe préparation', 'Nadia Ferrand · cheffe de quai', 'Thomas Leroy · responsable de l’entrepôt'], 'nom et fonction');
  vrai(await pg.$$eval(`${Z} [data-transferer], [data-transfert-ouvrir]`, (L) => L.every((b) => !b.classList.contains('btn-p'))), 'un bouton en aplat');
  // « Non » : rien n'est rangé.
  await pg.click(`${Z} [data-transferer="karim"]`);
  egal(await pg.textContent(`${Z} [data-confirme] p`), 'Transférer le message de Brasserie d’essai à Karim ?', 'texte de la confirmation');
  await pg.click(`${Z} [data-confirme-non]`);
  await pause();
  egal(await transferts(), {}, 'rangé après « Non »');
  // « Oui » : rangé, une fois ; destinataire FAUX (Karim), l'accusé arrive quand même.
  await pg.click(`${Z} [data-transferer="karim"]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  // La question du premier transfert arrive par le GESTE (ici, rien d'autre ne la ferait venir : le bon n'est pas envoyé).
  vrai(await present('[data-q="au-transfert"]'), 'pas de question au premier transfert');
  await repondreQ('au-transfert', 'pas-pense');
  await reprendre();
  const t = (await transferts())['brasserie-quai'];
  egal([t.a, t.premier, t.n, typeof t.at], ['karim', 'karim', 1, 'number'], 'transfert rangé');
  vrai(/^Transféré à Karim, \d{1,2} h \d{2}$/.test((await pg.textContent(`${Z} [data-transfert-fait="brasserie-quai"]`)).trim()), 'mention « Transféré à Karim, … »');
  vrai(!(await present('[data-transfert-ouvrir]')), 'le bouton revient après le transfert');
  egal(await pg.textContent(`${Z} [data-transfert-marque="brasserie-quai"]`), '↪ Transféré', 'marque après le transfert');
  egal(await accuses(), ['Karim Benali'], 'accusé (apresTransfert)');
  vrai(typeof ((await base()).gestes || {})['essai-questions']['messagerie:transfert'] === 'number', 'geste messagerie:transfert');
  // L'heure, au format « 8 h 42 » (rangée à la main : 9 octobre 2026, 8 h 42, heure locale).
  await pg.evaluate(() => { window.__q.db.transferts['essai-questions']['brasserie-quai'].at = new Date(2026, 9, 9, 8, 42).getTime(); });
  await aller('accueil');
  await ouvrirBrasserie();
  egal((await pg.textContent(`${Z} [data-transfert-fait="brasserie-quai"]`)).trim(), 'Transféré à Karim, 8 h 42', 'mention');
  // La condition seule : vraie au transfert de CE message, ou de n'importe lequel sans clé ; fausse pour une autre séance.
  egal(await pg.evaluate(async () => {
    const { apresTransfert } = await import('/core/declencheurs.js');
    const db = window.__q.db;
    return [apresTransfert('brasserie-quai')(db, 'essai-questions'), apresTransfert()(db, 'essai-questions'),
      apresTransfert('autre')(db, 'essai-questions'), apresTransfert('brasserie-quai')(db, 'autre-seance'), apresTransfert()({}, 'essai-questions')];
  }), [true, true, false, false, false], 'apresTransfert');
});

await v('Transfert : « Corriger » rouvre le message mal transféré (le premier reste rangé), accusé du volet ; note = moyenne du premier bilan (18) et du nouvel état (20) ; la question au premier transfert arrive une fois', async () => {
  await monter({ transfert: true, qTransfert: true });
  await choisirRemplacement('JUS-POM');
  await repondreQ('ou-verifier', 'stock');
  await reprendre();
  await envoyerBon('10');
  await aller('etape:avant-malo');
  await repondreQ('qui-utilise-le-bon', 'prepa');
  await repondreQ('ce-que-malo-attend', 'remplacement');
  await repondreMalo('Bonjour Malo, nous vous livrons du jus de pomme à la place.');
  await repondreQ('vides', 'compter');
  await reprendre();
  vrai(!(await present('[data-fin]')), 'bandeau de fin avant le transfert');
  await transferer('karim');
  // La question au fil du premier transfert (réflexion) : arrivée, l'écran gelé.
  vrai(await present('[data-q="au-transfert"]'), 'pas de question au premier transfert');
  await repondreQ('au-transfert', 'deborde');
  await reprendre();
  const arrivee = (await reps())['au-transfert'].arrivee;
  const geste = (await base()).gestes['essai-questions']['messagerie:transfert'];
  // Premier bilan : tout juste sauf le transfert (2 points) → 18.
  egal((await note()).detail['transfert-brasserie'], 'ko', 'jalon du transfert');
  proche(await noteSuivi(), 18, 'note au premier bilan');
  vrai(await present('[data-fin-corriger]'), 'pas de « Corriger »');
  vrai(!(await present('[data-transfert-ouvrir]')), 'le bouton revient avant « Corriger »');
  await pg.click(`${Z} [data-fin-corriger]`);
  await pause();
  vrai(await present('[data-transfert-ouvrir]'), '« Corriger » ne rouvre pas le transfert');
  egal(await pg.textContent(`${Z} .ent-lecteur h3`), 'Livraison de mercredi', '« Corriger » n’ouvre pas le message à transférer');
  egal((await transferts())['brasserie-quai'].rouvert, true, 'rouvert');
  // Le nouveau transfert : juste. Le premier reste rangé ; l'accusé vient du volet (Nadia) ; la question ne revient pas.
  await transferer('nadia');
  const t = (await transferts())['brasserie-quai'];
  egal([t.a, t.premier, t.n, t.rouvert], ['nadia', 'karim', 2, undefined], 'transferts');
  egal(await accuses(), ['Karim Benali', 'Nadia Ferrand'], 'accusés');
  egal(await pg.evaluate(() => window.__q.db.mails.filter((m) => m.declenche === 'correction:brasserie-quai').length), 1, 'accusé du volet');
  vrai(!(await panneau()), 'la question du premier transfert revient');
  egal((await reps())['au-transfert'].arrivee, arrivee, 'question réécrite');
  egal((await base()).gestes['essai-questions']['messagerie:transfert'], geste, 'geste réécrit');
  vrai(!(await present('[data-transfert-ouvrir]')), 'le bouton reste après le nouveau transfert');
  const r = (await base()).indicateurs['essai-questions'];
  egal([r.bilan1['transfert-brasserie'], r.bilan2['transfert-brasserie'], r.corrections], ['ko', 'ok', 1], 'premier bilan et correction');
  proche(await noteSuivi(), 19, 'note après la correction (moyenne de 18 et 20)');
});

await v('Transfert : un message bien transféré ne se rouvre pas (« Corriger » rouvre la fiche fausse seule)', async () => {
  await monter({ transfert: true });
  await choisirRemplacement('JUS-POM');
  await repondreQ('ou-verifier', 'stock');
  await reprendre();
  await envoyerBon('8');
  await aller('etape:avant-malo');
  await repondreQ('qui-utilise-le-bon', 'prepa');
  await repondreQ('ce-que-malo-attend', 'remplacement');
  await repondreMalo('Du jus de pomme.');
  await repondreQ('vides', 'compter');
  await reprendre();
  await transferer('nadia');
  egal((await note()).detail['transfert-brasserie'], 'ok', 'jalon du transfert');
  await pg.click(`${Z} [data-fin-corriger]`);
  await pause();
  vrai(await present('[data-fiche-envoyer]'), 'la fiche fausse n’est pas rouverte');
  egal((await transferts())['brasserie-quai'], { a: 'nadia', at: (await transferts())['brasserie-quai'].at, premier: 'nadia', n: 1 }, 'transfert juste touché');
  await ouvrirBrasserie();
  vrai(!(await present('[data-transfert-ouvrir]')), 'le message juste est rouvert');
});

await v('Transfert : gelé pendant une question au fil (bouton grisé, clic forcé sans effet, message lisible), rendu à la réponse', async () => {
  await monter();
  await choisirRemplacement('LIM-1L');
  vrai(await panneau(), 'pas de question');
  await ouvrirBrasserie();
  vrai(/quai doit-il se présenter/.test(await pg.textContent(`${Z} .ent-lecteur`)), 'le message ne se lit pas pendant le gel');
  vrai(await pg.$eval(`${Z} [data-transfert-ouvrir]`, (b) => b.disabled), 'le bouton n’est pas grisé');
  await pg.evaluate((Z) => { const b = document.querySelector(`${Z} [data-transfert-ouvrir]`); b.disabled = false; b.click(); }, Z);
  await pause();
  vrai(!(await present('[data-transfert-liste]')), 'la liste s’ouvre pendant le gel');
  egal(await transferts(), {}, 'rangé pendant le gel');
  await repondreQ('ou-verifier', 'mail');
  await reprendre();
  await ouvrirBrasserie();
  vrai(!(await pg.$eval(`${Z} [data-transfert-ouvrir]`, (b) => b.disabled)), 'le bouton reste grisé après la réponse');
  await transferer('thomas');
  egal((await transferts())['brasserie-quai'].a, 'thomas', 'transfert après le gel');
});

await v('Transfert : l’enseignant voit le bouton, la liste, la confirmation et la mention ; rien n’est écrit, aucun accusé', async () => {
  await monter({ role: 'prof', transfert: true });
  await transferer('ines');
  vrai(/^Transféré à Inès, \d{1,2} h \d{2}$/.test((await pg.textContent(`${Z} [data-transfert-fait="brasserie-quai"]`)).trim()), 'mention chez l’enseignant');
  vrai(await present('[data-transfert-ouvrir]'), 'l’enseignant ne peut plus essayer');
  const b = await base();
  egal([b.transferts, b.gestes], [undefined, undefined], 'base de l’enseignant');
  vrai(!(await pg.$$eval(`${Z} .ent-mitem`, (L) => L.some((x) => /TR : Livraison/.test(x.textContent)))), 'un accusé chez l’enseignant');
});

await v('Transfert : un destinataire inconnu ou une clé oubliée → signalé (console), le message arrive sans bouton', async () => {
  const n0 = erreursQ.length;
  await monter({ transfertFaux: true });
  const L = erreursQ.splice(n0);
  vrai(L.some((x) => /destinataire inconnu « inconnu »/.test(x)), `destinataire inconnu non signalé : ${L.join(' | ')}`);
  vrai(L.some((x) => /« Sans clé » porte « transfert » sans « cle »/.test(x)), `clé oubliée non signalée : ${L.join(' | ')}`);
  await aller('mail');
  for (const sujet of ['Faux', 'Sans clé']) {
    const id = await pg.evaluate((s) => window.__q.db.mails.find((m) => m.subject === s).id, sujet);
    await pg.click(`${Z} [data-mail="${id}"]`);
    await pause();
    vrai(!(await present('[data-transfert-ouvrir]')), `bouton sous « ${sujet} »`);
  }
});

// ─────────────────────────────────────────────────────────────── l'écran « Avant de commencer » (10/10/2026)
// Valeurs attendues écrites à la main : ouv-a juste = 'x', ouv-b = 'y', ouv-c = 'z' (séance d'essai, `monter({ ouverture: true })`).
const donneesMenu = () => pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue));
const nbFermes = () => pg.$$eval(`${Z} .ent-nav-ferme`, (L) => L.length);
async function repondreO(id, val) {
  await pg.click(`${Z} [data-q-choix="${val}"][data-q="${id}"]`);
  await pg.click(`${Z} [data-q-repondre="${id}"]`);
  await pause();
}
const questionVisible = () => pg.$$eval(`${Z} [data-ouverture] [data-question]`, (L) => L.map((x) => x.dataset.question));

await v('Avant de commencer : écran imposé à l’arrivée, une seule question visible, pastilles, le reste du menu fermé (cadenas)', async () => {
  await monter({ ouverture: true });
  vrai(await present('[data-ouverture="avant"]'), 'l’écran d’ouverture n’est pas là');
  egal(await questionVisible(), ['ouv-a'], 'questions visibles');
  egal(await donneesMenu(), ['ouverture'], 'entrées ouvertes du menu');
  vrai((await nbFermes()) >= 3, 'le reste du menu n’est pas fermé : ' + (await nbFermes()));
  egal(await pg.$$eval(`${Z} .qo-pas`, (L) => L.length), 3, 'pastilles');
  vrai(/0 sur 3 répondues/.test(await pg.textContent(`${Z} [data-ouv-compte]`)), 'compte des réponses');
  vrai(/Bonjour ! Lis les documents/.test(await pg.textContent(`${Z} .qf-situation`)), 'situation de la tutrice');
  egal(await pg.$$eval(`${Z} .qo-onglet`, (L) => L.map((x) => x.textContent)), ['Doc A', 'Doc B', 'Photos'], 'onglets');
  vrai(/Contenu du document A/.test(await pg.textContent(`${Z} .qo-feuille`)), 'le bloc de gauche suit la question 1');
});

await v('Avant de commencer : réponse fausse → ✗ et retour, sans bloquer ; navigation (pastilles, Précédente, Suivante) ; le menu s’ouvre aux dernières réponses ; « Continuer » mène à l’accueil', async () => {
  await monter({ ouverture: true });
  await repondreO('ouv-a', 'z');
  vrai((await pg.getAttribute(`${Z} [data-q-verdict]`, 'data-q-verdict')) === 'ko', 'pas de ✗');
  vrai(/Retour de A\./.test(await pg.textContent(`${Z} .qf-retour`)), 'retour de la tutrice');
  egal((await reps())['ouv-a'].premiere, 'z', 'première réponse rangée');
  vrai(/^1 sur 3 répondues/.test((await pg.textContent(`${Z} [data-ouv-compte]`)).trim()), 'compte après une réponse');
  vrai((await nbFermes()) >= 3, 'le menu doit rester fermé');
  vrai(await pg.$eval(`${Z} [data-q-choix="x"][data-q="ouv-a"]`, (b) => b.disabled), 'les choix restent actifs après la réponse');
  await pg.click(`${Z} [data-ouv-aller="1"]`); await pause();
  egal(await questionVisible(), ['ouv-b'], 'après Suivante');
  vrai(await present('.qo-feuille img[src$="futs-mur.jpg"]'), 'la photo n’est pas affichée');
  vrai(/Photo : Marco Zuppone, Unsplash/.test(await pg.textContent(`${Z} .qo-feuille`)), 'le crédit manque sous l’image');
  await repondreO('ouv-b', 'y');
  vrai((await pg.getAttribute(`${Z} [data-q-verdict]`, 'data-q-verdict')) === 'ok', 'pas de ✓');
  await pg.click(`${Z} [data-ouv-aller="0"]`); await pause();
  egal(await questionVisible(), ['ouv-a'], 'Précédente');
  vrai(/Pas tout à fait/.test(await pg.textContent(`${Z} [data-q-verdict]`)), 'la réponse déjà donnée se relit');
  await pg.click(`${Z} .qo-pas >> nth=2`); await pause();
  egal(await questionVisible(), ['ouv-c'], 'pastille 3');
  vrai(!(await present('[data-ouv-continuer]')), '« Continuer » avant la dernière réponse');
  await repondreO('ouv-c', 'z');
  egal(await donneesMenu(), ['ouverture', 'accueil', 'mail', 'fiche', 'stock'], 'menu ouvert après les trois réponses');
  vrai(await present('[data-ouv-continuer]'), 'pas de « Continuer »');
  await pg.click(`${Z} [data-ouv-continuer]`); await pause();
  vrai(await present('.ent-nav.on[data-vue="accueil"]'), '« Continuer » ne mène pas à l’accueil');
  await aller('ouverture');
  vrai(await present('[data-ouverture]'), 'l’écran reste dans le menu (relire ses réponses)');
});

await v('Avant de commencer : rien dans la note, rien à l’écran qui le dise, réponses rangées comme les autres (base, durée)', async () => {
  await monter({ ouverture: true });
  const avant = await note();
  await repondreO('ouv-a', 'x');
  await pg.click(`${Z} [data-ouv-aller="1"]`); await pause();
  await repondreO('ouv-b', 'z');
  await pg.click(`${Z} [data-ouv-aller="2"]`); await pause();
  await repondreO('ouv-c', 'z');
  const apres = await note();
  egal([apres.score, apres.max], [avant.score, avant.max], 'la note a bougé');
  egal(Object.keys(apres.detail).filter((k) => /ouv/.test(k)), [], 'une question d’ouverture est jugée dans la note');
  egal(Object.keys(apres.detail), Object.keys(avant.detail), 'les jalons de la séance ont changé');
  egal(await pg.$$eval(`${Z} [data-fin-jalon]`, (L) => L.map((x) => x.dataset.finJalon).filter((x) => /ouv/.test(x))), [], 'ligne au bandeau de fin');
  for (const k of [0, 1, 2]) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    const t = await pg.innerText(Z);
    vrai(!/ne compte|comptent|dans (la|ta|votre) note|Pour réfléchir|notée/i.test(t), `un texte parle de la note (question ${k + 1})`);
  }
  const R = await reps();
  egal([R['ouv-a'].premiere, R['ouv-b'].premiere, R['ouv-c'].premiere], ['x', 'z', 'z'], 'premières réponses (clés)');
  vrai(typeof R['ouv-a'].duree === 'number' && typeof R['ouv-a'].arrivee === 'number', 'durée et heure d’arrivée rangées');
  vrai(typeof R['@ouverture'] === 'number', 'heure d’ouverture de l’écran');
});

await v('Avant de commencer : élève dont la séance a déjà commencé → jamais bloqué (accueil, pas de cadenas) ; l’écran reste dans le menu', async () => {
  await monter({ ouverture: true, db: { fiches: { bon: { envoye: true, valeurs: { remplacement: 'JUS-POM', quantite: '10' } } } } });
  vrai(await present('.ent-nav.on[data-vue="accueil"]'), 'doit s’ouvrir sur l’accueil');
  egal(await nbFermes(), 0, 'cadenas');
  vrai((await donneesMenu()).includes('ouverture') && (await donneesMenu()).includes('mail'), 'menu : ' + (await donneesMenu()));
  await aller('ouverture');
  vrai(await present('[data-ouverture]'), 'l’écran est consultable');
});

await v('Avant de commencer : l’enseignant ne subit rien (écran libre, bonne réponse marquée, retour visible) et n’écrit rien', async () => {
  await monter({ ouverture: true, role: 'prof' });
  vrai(await present('.ent-nav.on[data-vue="accueil"]'), 'l’enseignant arrive sur l’accueil');
  egal(await nbFermes(), 0, 'cadenas chez l’enseignant');
  await aller('ouverture');
  vrai(await present('.qf-c.qf-bonne'), 'bonne réponse non marquée');
  vrai(/Retour de A\./.test(await pg.textContent(`${Z} [data-ouverture]`)), 'retour non visible');
  vrai(!(await present('[data-q-repondre]')), 'bouton Répondre chez l’enseignant');
  await pg.click(`${Z} [data-ouv-aller="1"]`); await pause();
  egal(await questionVisible(), ['ouv-b'], 'navigation de l’enseignant');
  egal((await base()).questions, undefined, 'rien n’est écrit par l’enseignant');
});

await v('Avant de commencer : l’aide (mot cliquable, « Voir le document » ramène le bloc de gauche, reste ouverte après la réponse)', async () => {
  await monter({ ouverture: true });
  vrai(!(await pg.$eval(`${Z} [data-ouv-aide]`, (d) => d.open)), 'l’aide devrait être repliée');
  await pg.click(`${Z} [data-ouv-aide] summary`);
  vrai(await present('[data-ouv-aide] .lex-mot'), 'le mot cliquable de l’aide');
  await pg.click(`${Z} [data-ouv-doc="doc-b"]`); await pause();
  vrai(/document B/.test(await pg.textContent(`${Z} .qo-feuille`)), 'onglet B');
  vrai(await pg.$eval(`${Z} [data-ouv-aide]`, (d) => d.open), 'l’aide s’est refermée en changeant d’onglet');
  await pg.click(`${Z} [data-ouv-voir="doc-a"]`); await pause();
  vrai(/document A/.test(await pg.textContent(`${Z} .qo-feuille`)), '« Voir le document » ne ramène pas à A');
  await repondreO('ouv-a', 'x');
  vrai(await pg.$eval(`${Z} [data-ouv-aide]`, (d) => d.open), 'l’aide s’est refermée à la réponse');
});

await v('Avant de commencer : tient sans défiler à 1366 × 768, aide ouverte et retour affiché (question à photo comprise)', async () => {
  await monter({ ouverture: true });
  for (const k of [0, 1, 2]) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    if (await present('[data-ouv-aide]')) await pg.evaluate((Z) => { document.querySelector(`${Z} [data-ouv-aide]`).open = true; }, Z);
    await repondreO(['ouv-a', 'ouv-b', 'ouv-c'][k], 'z');
    const bas = await pg.evaluate((Z) => document.querySelector(`${Z} .qo-cols`).getBoundingClientRect().bottom, Z);
    vrai(bas <= 768, `question ${k + 1} : le bas de l’écran est à ${Math.round(bas)} px (> 768)`);
  }
});

await v('Avant de commencer : contrôle au chargement — document inconnu, question non citée, ouverture sans question, question d’ouverture notée, image d’un autre domaine, document hors écran, réflexion → message qui nomme la faute', async () => {
  const r = await pg.evaluate(async () => {
    const { compilerQuestions } = await import('/core/types/questions.js');
    const { QUESTIONS } = await import('/contenus/questions/ESSAI.js');
    const essai = (f) => { try { f(); return 'ok'; } catch (e) { return e.message; } };
    const ch = () => [{ v: 'x', lib: 'X' }, { v: 'y', lib: 'Y' }];
    const base = () => ({ ...QUESTIONS, liste: QUESTIONS.liste.map((q) => ({ ...q })),
      ouverture: { id: 'avant', de: 'Ines', documents: ['doc-a', { id: 'photos', court: 'Photos', type: 'images', images: [{ src: './x.jpg', alt: 'a', credit: 'c' }] }],
        questions: ['ouv-a'] } });
    const ajout = (Q, ...L) => { Q.liste.push(...L); return Q; };
    const oa = (plus = {}) => ({ id: 'ouv-a', type: 'ouverture', de: 'Ines', doc: 'doc-a', enonce: 'Q ?', choix: ch(), juste: 'x', retour: 'R', ...plus });
    const docs = ['doc-a'];
    const dans = (Q) => essai(() => compilerQuestions(Q, null, docs));
    const ok = ajout(base(), oa());
    const a = ajout(base(), oa()); a.ouverture.documents = ['zzz', a.ouverture.documents[1]];
    const b = ajout(base(), oa(), oa({ id: 'ouv-b' }));
    const c = ajout(base(), oa()); c.ouverture.questions = [];
    const d = ajout(base(), oa({ groupe: 'Une ligne au bilan' }));
    const e = ajout(base(), oa()); e.ouverture.documents[1].images[0].src = 'https://exemple.org/x.jpg';
    const f = ajout(base(), oa({ doc: 'doc-zz' }));
    const g = ajout(base(), oa({ reflexion: true, juste: undefined }));
    const h = ajout(base(), oa({ aide: '' }));
    const i = base(); delete i.ouverture; i.liste.push(oa());
    return { ok: dans(ok), a: dans(a), b: dans(b), c: dans(c), d: dans(d), e: dans(e), f: dans(f), g: dans(g), h: dans(h), i: dans(i),
      notees: compilerQuestions(ok, null, docs).notees.map((q) => q.id) };
  });
  egal(r.ok, 'ok', 'une ouverture juste doit se charger');
  vrai(/document « zzz » n’existe pas/.test(r.a), 'document inconnu : ' + r.a);
  vrai(/« ouv-b » n’est citée/.test(r.b), 'question non citée : ' + r.b);
  vrai(/ne cite aucune question/.test(r.c), 'ouverture sans question : ' + r.c);
  vrai(/« ouv-a ».*ne compte pas dans la note/.test(r.d), 'question d’ouverture notée : ' + r.d);
  vrai(/autre domaine/.test(r.e), 'image d’un autre domaine : ' + r.e);
  vrai(/« ouv-a ».*« doc-zz » n’est pas un document de l’écran/.test(r.f), 'document hors écran : ' + r.f);
  vrai(/« ouv-a ».*bonne réponse/.test(r.g), 'réflexion : ' + r.g);
  vrai(/« ouv-a ».*`aide` est un texte/.test(r.h), 'aide vide : ' + r.h);
  vrai(/« ouv-a » n’a pas d’écran d’ouverture/.test(r.i), 'question sans écran : ' + r.i);
  egal(r.notees.filter((id) => /^ouv-/.test(id)), [], 'les questions d’ouverture ne sont jamais notées');
});

// ─────────────────────────────────────────────────────────────── « Avant de commencer » en évaluation (lot 2, 10/10/2026)
// Valeurs attendues écrites à la main (3 questions à 3 choix : 1 juste, 2 fausses ; part = 4 points) : juste = +1,
// « Je ne sais pas » = 0, fausse = −1/2, plancher 0 ; points = max(0, somme) / 3 × 4. Bonnes réponses : ouv-a 'x', ouv-b 'y', ouv-c 'z'.
async function jouerEval(rep3) {
  await monter({ evaluation: true, copie: true });
  const ids = ['ouv-a', 'ouv-b', 'ouv-c'];
  for (let k = 0; k < 3; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await repondreO(ids[k], rep3[k]);
  }
  return note();
}

await v('Avant de commencer (évaluation) : aucune aide, aucun mot cliquable, « Je ne sais pas » toujours en dernier, l’élève est prévenu, pas de correction', async () => {
  await monter({ evaluation: true, copie: true });
  for (const k of [0, 1, 2]) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((x) => x.dataset.qChoix));
    egal(choix.length, 4, `question ${k + 1} : nombre de choix`);
    egal(choix[3], '@nsp', `question ${k + 1} : « Je ne sais pas » doit être en dernier`);
    vrai(!(await present('[data-ouv-aide]')) && !(await present('[data-ouv-voir]')) && !(await present('.lex-mot')), `question ${k + 1} : aide ou mot cliquable`);
  }
  vrai(/Une réponse fausse retire des points\. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien\./.test(await pg.textContent(`${Z} [data-ouv-penalite]`)), 'la phrase de prévention manque');
  await pg.click(`${Z} [data-ouv-aller="0"]`); await pause();
  await repondreO('ouv-a', 'z');
  egal(await present('[data-q-verdict]'), false, 'un verdict est montré avant le bilan');
  const t = await pg.innerText(`${Z} [data-ouverture]`);
  vrai(/Réponse enregistrée\./.test(t), 'pas de « Réponse enregistrée. »');
  vrai(!/Retour de A|C’est ça|Pas tout à fait/.test(t), 'le retour ou le verdict fuit : ' + t);
});

await v('Avant de commencer (évaluation) : barème — juste +1, « Je ne sais pas » 0, fausse −1/2, jamais sous 0', async () => {
  const cas = [
    ['tout juste', ['x', 'y', 'z'], 4, [3, 0, 0]],
    ['« Je ne sais pas » partout', ['@nsp', '@nsp', '@nsp'], 0, [0, 3, 0]],
    ['tout faux (plancher)', ['y', 'x', 'x'], 0, [0, 0, 3]],
    ['une fausse, une juste, un « Je ne sais pas »', ['y', 'y', '@nsp'], (1 - 0.5) / 3 * 4, [1, 1, 1]],
    ['deux justes, une fausse', ['x', 'y', 'x'], (2 - 0.5) / 3 * 4, [2, 0, 1]],
  ];
  for (const [nom, rep3, attendu, [j, n, fx]] of cas) {
    const r = await jouerEval(rep3);
    proche(r.score, attendu, `${nom} : points`);
    proche(r.detail.ouverture.points, attendu, `${nom} : points du détail`);
    egal(r.max, 20, `${nom} : barème`);
    egal([r.detail.ouverture.justes, r.detail.ouverture.nsp, r.detail.ouverture.faux], [j, n, fx], `${nom} : détail pour l’enseignant`);
    egal([r.detail.ouverture.part, r.detail.ouverture.sur], [4, 3], `${nom} : part et nombre de questions`);
  }
});

await v('Avant de commencer (évaluation) : sans réponse rien n’est compté ; l’enseignant voit la bonne réponse et ne peut pas répondre', async () => {
  await monter({ evaluation: true, copie: true });
  const r = await note();
  egal(r.score, 0, 'score sans réponse');
  egal(r.detail.ouverture.points, 0, 'points sans réponse');
  await monter({ evaluation: true, copie: true, role: 'prof' });
  await aller('ouverture');
  vrai(await present('.qf-bonne'), 'la bonne réponse n’est pas marquée pour l’enseignant');
  egal(await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.every((x) => x.disabled)), true, 'l’enseignant peut cocher');
});

await v('Avant de commencer (évaluation) : contrôle au chargement — aide ou mot cliquable en évaluation, évaluation sans part, séance de travail avec part', async () => {
  const r = await pg.evaluate(async () => {
    const { compilerQuestions } = await import('/core/types/questions.js');
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const S = await import('/contenus/questions-essai.js');
    const { QUESTIONS } = await import('/contenus/questions/ESSAI.js');
    const essai = (f) => { try { f(); return 'ok'; } catch (e) { return e.message; } };
    const ch = () => [{ v: 'x', lib: 'X' }, { v: 'y', lib: 'Y' }];
    const mk = (part, plus = {}) => ({ ...QUESTIONS, etapes: [], liste: [{ id: 'ouv-a', type: 'ouverture', de: 'Ines', doc: 'doc-a', enonce: 'Q ?', choix: ch(), juste: 'x', retour: 'R', ...plus }],
      ouverture: { id: 'avant', de: 'Ines', documents: ['doc-a'], questions: ['ouv-a'], ...(part == null ? {} : { part }) } });
    const dans = (Q) => essai(() => compilerQuestions(Q, null, ['doc-a']));
    const monte = (copie, part) => essai(() => { const U = S.univers({ copie }); U.documents = [{ id: 'doc-a', titre: 'A', court: 'A', html: '<p>A</p>' }]; U.questions = mk(part); creerEntreprise(U); });
    return { ok: dans(mk(4)), aide: dans(mk(4, { aide: 'Regarde.' })), mot: dans(mk(4, { enonce: 'Le [[mot]] ?' })), zero: dans(mk(0)),
      reserve: dans(mk(4, { choix: [{ v: 'x', lib: 'X' }, { v: '@nsp', lib: 'Y' }] })),
      evalSansPart: monte(true, null), travailAvecPart: monte(false, 4) };
  });
  egal(r.ok, 'ok', 'une évaluation juste doit se charger');
  vrai(/« ouv-a ».*aucune `aide`/.test(r.aide), 'aide en évaluation : ' + r.aide);
  vrai(/« ouv-a ».*aucun mot cliquable/.test(r.mot), 'mot cliquable en évaluation : ' + r.mot);
  vrai(/`part`.*positif/.test(r.zero), 'part nulle : ' + r.zero);
  vrai(/« ouv-a ».*réservée/.test(r.reserve), 'clé réservée : ' + r.reserve);
  vrai(/évaluation doit déclarer sa `part`/.test(r.evalSansPart), 'évaluation sans part : ' + r.evalSansPart);
  vrai(/séance de travail ne déclare pas de `part`/.test(r.travailAvecPart), 'séance de travail avec part : ' + r.travailAvecPart);
});

await v('Questions : aucune erreur de page pendant le bloc', async () => {
  egal(erreursQ, [], 'erreurs');
});

await ctxQ.close();
}
