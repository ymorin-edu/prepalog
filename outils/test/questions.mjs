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

export default async function bloc({ v, nav, page, BASE, ROOT }) {

const egal = (a, b, quoi) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${quoi} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`); };
const vrai = (c, quoi) => { if (!c) throw new Error(quoi); };
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
  const U = S.univers({ copie: !!o.copie });
  U.questions = Q;
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__q = { db, enregistres: [], Q, moteur: null };
  const ctx = {
    meta: { ...S.META, ...(o.copie ? { copie: true, temps: 'evaluation' } : {}) },
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
      tous[f] = essai(() => compilerQuestions(m.QUESTIONS));
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

await v('Questions : aucune erreur de page pendant le bloc', async () => {
  egal(erreursQ, [], 'erreurs');
});

await ctxQ.close();
}
