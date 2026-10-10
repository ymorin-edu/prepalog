// Suite de tests de Prepalog — bloc « france-boissons » : les séances France Boissons (ENT-6.x, scénario S2 de la 2de).
// `node outils/test.mjs france-boissons` ne lance que ce bloc.
//
// ENT-6.1 (brief `docs/briefs/ENT-6.1-france-boissons-organigramme.md`, §8) : la séance est montée dans une page à elle,
// avec la fabrique et le moteur réels (`activites/france-boissons-organigramme.js` → `rendre`), de vrais clics. Les
// GRAINES sont choisies ici (l'identifiant de l'élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN
// (relues dans le tirage le 09/10/2026), jamais recalculées par le code de la séance :
//
//   fb-juste (standard) : cases A = Karim, B = Nadia, C = Lucas ; situations, dans l'ordre : thomas-heures (H),
//     helene-recrutement (H), karim-tournee (H), lucas-attestation (F), ines-formulaire (F) ; courrier : Malo → Inès,
//     rack → Thomas, partir-tot → Nadia, medecine → Inès.
//   fb-quai (standard) : cases A = Karim, B = Nadia, C = Lucas ; situations : helene-objectif (H), karim-tournee (H),
//     karim-preparateur (F), lucas-attestation (F), nadia-quai (F) ; courrier : Malo → Inès, amandine-planning → Karim,
//     chauffeur-quai → Nadia, partir-tot → Nadia.
//   fb-conf (CONFIRMÉ) : cases A = Thomas, B = Karim, C = Nadia (bonus), D = Lucas ; situations : thomas-heures (H),
//     helene-objectif (H), karim-preparateur (F), karim-horaire (F), karim-tournee (H), puis en bonus nadia-quai (F),
//     thomas-securite (F) ; courrier : Malo → Inès, partir-tot → Nadia, garage → Karim (bonus), rack → Thomas,
//     candidature → Inès (bonus), attestation → Inès.
//
// Barème (brief §5) : organigramme 5 (Karim 2, deux cases 1,5), chef de Lucas 2, liens 5 (1 chacun), courrier 6 (1,5
// chacun), point d'étape 2. Bandeau : 5 lignes. Ce qui vaut son prix : le parcours juste et le pire cas (aucun élève
// bloqué), l'inaction à 0, un faux par bloc qui ne fait tomber que son bloc, « Corriger » qui ne rouvre que le faux, le
// tirage rangé et équitable, le confirmé caché.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'france-boissons-organigramme';
const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };

const ctxF = await nav.newContext({ viewport: { width: 1366, height: 900 } });
const erreursF = [];
const pg = await ctxF.newPage();
pg.setDefaultTimeout(6000);
pg.on('pageerror', (e) => erreursF.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursF.push('CONSOLE: ' + m.text()); });
pg.on('dialog', (d) => d.accept());
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// Monte la séance comme le site : `rendre(hote, ctx)` de l'activité. `o.db` : base de départ (copiée) ; `o.uid` (la graine) ;
// `o.aisance` ; `o.role`. Rend la base. Les scores remontés sont rangés dans `window.__f.enregistres`.
// Les réponses (écrites à la main) de la banque d’ouverture d’ENT-6.1 : toutes les clés sont des clés de choix.
const REP61 = { 'fb-plateforme': 'distribue', 'organigramme-sert': 'qui', 'trait-plein': 'chef', 'rendre-compte': 'cheffe',
  'ri-obligatoire': 'oui50', 'cse-obligatoire': 'oui11', 'malo-chef': 'non', 'zero-accident': 'employeur' };

const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-organigramme.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  // L'écran « Avant de commencer » (10/10/2026, étape A) ouvre la séance et ferme le reste du menu : les cas qui travaillent sur
  // la séance partent d'un élève qui y a déjà répondu (une réponse par question de la banque, REP61 : n'importe quelle clé compte
  // comme répondu). `sansOuverture: true` : on part de zéro.
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['france-boissons-organigramme'] = db.questions['france-boissons-organigramme'] || {});
    for (const [id, v] of Object.entries(o.rep61)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: v, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb-juste' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep61: REP61 });

const Z = '#fTest';
const pause = (ms = 80) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
const note = () => pg.evaluate(() => { const L = window.__f.enregistres; return L.length ? L[L.length - 1] : null; });
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const aller = async (vue) => { await pg.evaluate(({ Z, vue }) => document.querySelector(`${Z} .ent-nav[data-vue="${vue}"]`).click(), { Z, vue }); await pause(); };
const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
const bandeau = () => pg.$$eval(`${Z} [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finJalon, x.dataset.finEtat]));
const LIGNES = ['case-karim', 'chef-lucas', 'lien-1', 'courrier-malo', 'question:qui-decide-conges'];
const tout = (etat) => LIGNES.map((l) => [l, etat]);
const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
const cles = async () => (await entrants()).filter((m) => m.cle).map((m) => m.cle);
// L'heure d'un message, en heure locale (ce que la Messagerie affiche) : [année, mois, jour, heure, minute].
const horodate = (ts) => { const d = new Date(ts); return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]; };

// La fiche « Qui fait quoi ? ». `r = { cases: { a: 'karim', … }, chef, liens: { id: true (hiérarchique) | false } }`.
async function envoyerFiche(r) {
  await aller('fiche:qui-fait-quoi');
  for (const [l, qui] of Object.entries(r.cases)) await pg.selectOption(`${Z} [data-fiche-champ="case-${l}"]`, qui);
  await pg.selectOption(`${Z} [data-fiche-champ="chefLucas"]`, r.chef);
  await pause();
  await qFil61();                 // le choix du chef de Lucas ouvre la question de Karim (réflexion) : on la répond, on reprend
  for (const [id, h] of Object.entries(r.liens)) await pg.click(`${Z} [data-ouinon="liens|${id}|hierarchique|${h ? 1 : 0}"]`);
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
async function envoyerVu() {
  await aller('fiche');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
// Le point d'étape d'Inès : deux questions. `v` = la réponse à la première ; la seconde (« qui peut sanctionner Lucas ») est
// juste (`employeur`) quand la première l'est (`karim`), fausse sinon.
async function pointDEtape(v) {
  await aller('etape:avant-courrier');
  for (const [id, c] of [['qui-decide-conges', v], ['qui-sanctionne', v === 'karim' ? 'employeur' : 'malo']]) {
    await pg.click(`${Z} [data-q-choix="${c}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
  }
  await pause();
}
// Les questions au fil d'ENT-6.1 (bonnes réponses écrites à la main) : répond au panneau ouvert, puis reprend, tant qu'il y en a une.
// `faux` : la question de la commande de Malo (`qui-traite-malo`) reçoit une réponse fausse.
const BONNES61 = { 'appui-chef': 'fiche', 'pourquoi-pas-helene': 'niveau', 'qui-traite-malo': 'ines' };
async function qFil61(faux = false) {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${faux && id === 'qui-traite-malo' ? 'helene' : BONNES61[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pause();
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
async function ouvrirMessage(cle) {
  await aller('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  const id = await pg.evaluate((cle) => window.__f.db.mails.find((m) => m.folder === 'in' && m.cle === cle).id, cle);
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pause();
}
// Transfère le message de clé `cle` à `qui` ; si la question de Karim arrive (premier transfert), y répond et reprend.
async function transferer(cle, qui) {
  await ouvrirMessage(cle);
  await pg.click(`${Z} [data-transfert-ouvrir]`);
  await pause();
  await pg.click(`${Z} [data-transferer="${qui}"]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  // Au premier transfert (Malo, toujours le premier) : la question de Karim, puis celle d'Inès sur la commande de Malo (fausse
  // seulement quand le message part chez Hélène : le « pire cas »).
  await qFil61(cle === 'msg-malo' && qui === 'helene');
}

// Les réponses justes de fb-juste (écrites à la main, voir l'en-tête).
const JUSTE = {
  cases: { a: 'karim', b: 'nadia', c: 'lucas' }, chef: 'karim',
  liens: { 'lien-thomas-heures': true, 'lien-helene-recrutement': true, 'lien-karim-tournee': true, 'lien-lucas-attestation': false, 'lien-ines-formulaire': false },
};
const COURRIER_JUSTE = [['msg-malo', 'ines'], ['msg-rack', 'thomas'], ['msg-partir-tot', 'nadia'], ['msg-medecine', 'ines']];

await v('ENT-6.1 : à l’ouverture, le tirage est rangé (graine élève|séance) ; l’organigramme a SES cases vides lettrées dans l’ordre de lecture, sans nom ; la fiche suit ; aucun courrier', async () => {
  const db = await monter({ uid: 'fb-juste' });
  egal(db.tirages[ID].graine, `fb-juste|${ID}`, 'graine');
  egal(db.tirages[ID].pieces.cases, ['case-karim', 'case-lucas', 'case-nadia'], 'cases rangées (ordre « fixe » : celui de la banque)');
  await aller('fiche:qui-fait-quoi');
  egal(await pg.$$eval(`${Z} [data-og-case]`, (L) => L.map((x) => [x.dataset.ogCase, x.textContent.replace(/\s+/g, '')])),
    [['A', 'CaseA'], ['B', 'CaseB'], ['C', 'CaseC']], 'cases vides (ordre de lecture : Karim, Nadia, Lucas)');
  egal(await pg.$$eval(`${Z} [data-og-poste]`, (L) => L.map((x) => x.dataset.ogPoste)), ['helene', 'ines', 'thomas'], 'postes nommés');
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="case-"]`, (L) => L.map((x) => x.dataset.ficheChamp)), ['case-a', 'case-b', 'case-c'], 'listes de la fiche');
  egal(await pg.$$eval(`${Z} [data-ouinon$="|hierarchique|1"]`, (L) => L.map((x) => x.dataset.ouinon.split('|')[1])),
    Object.keys(JUSTE.liens), 'situations, dans l’ordre de l’élève');
  // Rien dans la page ne trahit le poste d'une case vide (ni nom dans la case, ni id de poste dans les listes).
  const html = await pg.evaluate((Z) => document.querySelector(`${Z} [data-og-case="A"]`).outerHTML + [...document.querySelectorAll(`${Z} [data-fiche-champ^="case-"]`)].map((x) => x.outerHTML.replace(/<option[\s\S]*$/, '')).join(''), Z);
  vrai(!/karim|nadia|lucas/i.test(html), 'une case vide trahit son poste : ' + html.slice(0, 200));
  // Seul le message d'Inès, avec l'organigramme et l'annuaire ; aucun message à transférer.
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Bienvenue à Buchelay'], 'messages à l’ouverture');
  egal(E[0].pieces, ['organigramme', 'annuaire'], 'pièces jointes');
  egal(await cles(), [], 'courrier avant le point d’étape');
  // La consigne ne compte ni les cases, ni les lignes, ni les messages.
  vrai(!/\b(3|trois|4|quatre|5|cinq) (cases|messages|situations|lignes)\b/i.test(await texte()), 'une consigne compte les pièces');
});

await v('ENT-6.1 : inaction — rien fait → 0/20, rien de jugé « juste », pas de bandeau de fin', async () => {
  await monter({ uid: 'fb-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
});

await v('ENT-6.1 : parcours juste (standard) — fiche vidéo envoyée vide sans effet, 20/20, bandeau 5 lignes ✓, accusés neutres du destinataire choisi, séance finie (photo rangée)', async () => {
  await monter({ uid: 'fb-juste' });
  await envoyerVu();
  vrai((await entrants()).some((m) => m.subject === 'RE : Ce que j’ai vu' && /30 tournées/.test(m.text)), 'réponse d’Inès à la fiche vidéo');
  egal((await note()).score, 0, 'note après la fiche vidéo vide');
  await envoyerFiche(JUSTE);
  egal(await cles(), [], 'un message du courrier arrive avant le point d’étape');
  await pointDEtape('karim');
  egal(await cles(), ['msg-malo'], 'le premier message est celui de Malo');
  for (const [cle, qui] of COURRIER_JUSTE) await transferer(cle, qui);
  egal(await cles(), COURRIER_JUSTE.map((x) => x[0]), 'ordre d’arrivée du courrier');
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(await bandeau(), tout('ok'), 'bandeau');
  const E = await entrants();
  egal(E.filter((m) => /^TR : /.test(m.subject)).map((m) => [m.from, m.text]),
    [['Inès', 'Bien reçu, merci.\n\nInès'], ['Thomas', 'Bien reçu, merci.\n\nThomas'], ['Nadia', 'Bien reçu, merci.\n\nNadia'], ['Inès', 'Bien reçu, merci.\n\nInès']], 'accusés');
  vrai(E.some((m) => m.subject === 'Merci pour ce matin' && /La Cabane à Malo/.test(m.text)), 'message de fin d’Inès');
  vrai(!!(await base()).points[ID], 'photo de fin (séance suivante ouverte)');
  // La question de Karim : arrivée au premier transfert, une fois, jamais notée.
  const q = (await base()).questions[ID]['pourquoi-pas-helene'];
  egal(q.premiere, 'niveau', 'réponse rangée');
  vrai(!Object.keys(n.detail).some((k) => /pourquoi-pas-helene/.test(k)), 'la question de réflexion est notée');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-6.1 : pire cas — tout faux, question comprise, fiche vidéo jamais envoyée → premier bilan, séance finie sans l’enseignant, 0/20, 5 lignes ✗ ; le courrier arrive quand même après une réponse fausse, « Continuer » ouvre Malo', async () => {
  await monter({ uid: 'fb-juste' });
  await envoyerFiche({ cases: { a: 'helene', b: 'thomas', c: 'ines' }, chef: 'nadia',
    liens: { 'lien-thomas-heures': false, 'lien-helene-recrutement': false, 'lien-karim-tournee': false, 'lien-lucas-attestation': true, 'lien-ines-formulaire': true } });
  egal(await cles(), [], 'courrier avant le point d’étape');
  await pointDEtape('ines');
  egal(await cles(), ['msg-malo'], 'courrier après une réponse fausse');
  await pg.click(`${Z} [data-q-continuer="avant-courrier"]`);
  await pause();
  egal((await pg.textContent(`${Z} .ent-lecteur h3`)).trim(), 'Commande de vendredi', '« Continuer » ouvre le message de Malo');
  for (const cle of COURRIER_JUSTE.map((x) => x[0])) await transferer(cle, 'helene');
  const n = await note();
  egal(n.score, 0, 'note');
  egal(await bandeau(), tout('ko'), 'bandeau');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  vrai(!!(await base()).points[ID], 'photo de fin : la séance suivante s’ouvrirait sans l’enseignant');
});

await v('ENT-6.1 : « Nadia / quai » marqué hiérarchique (fb-quai) → bloc « Hiérarchique ou fonctionnel » ✗, les autres ✓, 19/20', async () => {
  await monter({ uid: 'fb-quai' });
  await envoyerFiche({ cases: { a: 'karim', b: 'nadia', c: 'lucas' }, chef: 'karim',
    liens: { 'lien-helene-objectif': true, 'lien-karim-tournee': true, 'lien-karim-preparateur': false, 'lien-lucas-attestation': false, 'lien-nadia-quai': true } });
  await pointDEtape('karim');
  for (const [cle, qui] of [['msg-malo', 'ines'], ['msg-amandine-planning', 'karim'], ['msg-chauffeur-quai', 'nadia'], ['msg-partir-tot', 'nadia']]) await transferer(cle, qui);
  egal(await bandeau(), LIGNES.map((l) => [l, l === 'lien-1' ? 'ko' : 'ok']), 'bandeau');
  proche((await note()).score, 19, 'note');
});

await v('ENT-6.1 : case de Karim répondue « Thomas » → bloc « L’organigramme » ✗ seul, 18/20 ; « Corriger » rouvre la fiche (pas un message)', async () => {
  await monter({ uid: 'fb-juste' });
  await envoyerFiche({ ...JUSTE, cases: { a: 'thomas', b: 'nadia', c: 'lucas' } });
  await pointDEtape('karim');
  for (const [cle, qui] of COURRIER_JUSTE) await transferer(cle, qui);
  egal(await bandeau(), LIGNES.map((l) => [l, l === 'case-karim' ? 'ko' : 'ok']), 'bandeau');
  proche((await note()).score, 18, 'note');
  await pg.click(`${Z} [data-fin-corriger]`);
  await pause();
  vrai(await present('[data-fiche="qui-fait-quoi"] [data-fiche-envoyer]'), 'la fiche n’est pas rouverte');
  egal(Object.values((await base()).transferts[ID]).filter((t) => t.rouvert).length, 0, 'un message rouvert');
});

await v('ENT-6.1 : Malo → Karim → bloc « Le courrier » ✗ ; « Corriger » ne rouvre que lui ; renvoi juste → accusé d’Inès, note = moyenne du premier bilan (18,5) et du nouvel état (20)', async () => {
  await monter({ uid: 'fb-juste' });
  await envoyerFiche(JUSTE);
  await pointDEtape('karim');
  for (const [cle, qui] of [['msg-malo', 'karim'], ...COURRIER_JUSTE.slice(1)]) await transferer(cle, qui);
  egal(await bandeau(), LIGNES.map((l) => [l, l === 'courrier-malo' ? 'ko' : 'ok']), 'bandeau');
  proche((await note()).score, 18.5, 'premier bilan');
  await pg.click(`${Z} [data-fin-corriger]`);
  await pause();
  const T = (await base()).transferts[ID];
  egal(Object.keys(T).filter((k) => T[k].rouvert), ['msg-malo'], 'messages rouverts');
  egal((await pg.textContent(`${Z} .ent-lecteur h3`)).trim(), 'Commande de vendredi', '« Corriger » ouvre le message de Malo');
  egal((await base()).fiches['qui-fait-quoi'].envoye ? 'envoyee' : 'rouverte', 'envoyee', 'la fiche juste est rouverte');
  const avant = (await entrants()).length;
  await transferer('msg-malo', 'ines');
  const t = (await base()).transferts[ID]['msg-malo'];
  egal([t.premier, t.a, t.n], ['karim', 'ines', 2], 'transferts de Malo');
  const nouveaux = (await entrants()).slice(avant);
  egal(nouveaux.map((m) => [m.from, m.text]), [['Inès', 'Bien reçu, merci.\n\nInès']], 'accusé du transfert corrigé');
  proche((await note()).score, 19.25, 'note moyennée');
  egal(await bandeau(), tout('ok'), 'bandeau après correction');
});

await v('ENT-6.1 : tirage stable — mêmes cases, situations et messages après rechargement et sur un autre poste (base neuve, même élève)', async () => {
  const a = await monter({ uid: 'fb-juste' });
  const b = await monter({ uid: 'fb-juste', db: a });
  egal(b.tirages[ID], a.tirages[ID], 'tirage après rechargement');
  const c = await monter({ uid: 'fb-juste' });
  egal([c.tirages[ID].pieces, c.tirages[ID].graine], [a.tirages[ID].pieces, a.tirages[ID].graine], 'tirage sur un autre poste');
  egal(a.tirages[ID].pieces.courrier.slice().sort(), ['msg-malo', 'msg-medecine', 'msg-partir-tot', 'msg-rack'], 'courrier de fb-juste');
  // Deux voisins n'ont pas les mêmes cases vides ni les mêmes messages.
  const d = await monter({ uid: 'fb-quai' });
  vrai(JSON.stringify(d.tirages[ID].pieces.courrier) !== JSON.stringify(a.tirages[ID].pieces.courrier), 'mêmes messages que le voisin');
});

await v('ENT-6.1 : niveau changé par l’enseignant après la première ouverture, puis « Réinitialiser » → nouveau tirage (confirmé) et les écrans le suivent sans rouvrir la séance', async () => {
  const a = await monter({ uid: 'fb-niveau', aisance: 'standard' });
  egal(a.aisance, 'standard', 'niveau figé à la première ouverture');
  // L'enseignant passe l'élève en confirmé : la séance commencée garde son niveau…
  await monter({ uid: 'fb-niveau', aisance: 'confirme', db: a });
  await aller('fiche:qui-fait-quoi');
  egal(await pg.$$eval(`${Z} [data-og-case]`, (L) => L.length), 3, 'cases vides avant « Réinitialiser »');
  // … jusqu'à « Réinitialiser », qui relit le niveau et refait le tirage, dans la même page.
  await pg.click(`${Z} [data-raz]`);
  await pause();
  const b = await base();
  egal([b.aisance, (b.tirages[ID].bonus || {}).cases && b.tirages[ID].bonus.cases.length], ['confirme', 1], 'niveau et tirage après « Réinitialiser »');
  await aller('fiche:qui-fait-quoi');
  egal(await pg.$$eval(`${Z} [data-og-case]`, (L) => L.length), 4, 'cases vides de l’organigramme');
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="case-"]`, (L) => L.length), 4, 'listes de la fiche');
  egal(await pg.$$eval(`${Z} [data-ouinon$="|hierarchique|1"]`, (L) => L.length), 7, 'situations');
});

await v('ENT-6.1 : équité sur 300 graines — Karim, Karim-tournée et Malo toujours là (Malo arrive en premier), mélanges 1+1 / 1+2+1 / 1+1+1, ≥ 2 H et ≥ 2 F, ≥ 3 destinataires, zéro secours ; confirmé = même socle + 1 / 2 / 2 bonus ; la règle n’est pas décorative', async () => {
  const r = await pg.evaluate(async (ID) => {
    const S = await import('/contenus/france-boissons-ent61.js');
    const { declarerTirage } = await import('/core/tirage.js');
    const juger = (T) => {
      const fautes = [];
      const dif = (b, id) => (T.decl.banques[b].pieces.find((p) => p.id === id) || {}).difficulte || 'fixe';
      const compte = (b, L) => ['fixe', 'facile', 'moyen', 'difficile'].map((d) => L.filter((x) => dif(b, x) === d).length).join();
      for (let i = 0; i < 300; i++) {
        const g = `eleve-${i}|${ID}`;
        const s = T.tirer(g), c = T.tirer(g, { confirme: true });
        if (s.secours || c.secours) fautes.push(`${i} secours`);
        const att = (b, id) => T.decl.banques[b].pieces.find((p) => p.id === id);
        // Le socle d'un standard ET celui d'un confirmé (avec plusieurs banques, le tirage d'un confirmé n'a pas le même
        // socle que celui d'un standard de même graine : les cas bonus d'une banque passent avant le socle de la suivante).
        [['s', s], ['c', c]].forEach(([k, t]) => {
          const db = { tirages: { [ID]: t } };
          if (compte('cases', t.pieces.cases) !== '1,1,0,1' || t.pieces.cases[0] !== 'case-karim') fautes.push(`${i}${k} cases ${t.pieces.cases}`);
          if (compte('liens', t.pieces.liens) !== '1,1,2,1') fautes.push(`${i}${k} liens ${t.pieces.liens}`);
          if (compte('courrier', t.pieces.courrier) !== '1,1,1,1') fautes.push(`${i}${k} courrier ${t.pieces.courrier}`);
          if (S.courrierDe(db)[0].id !== 'msg-malo') fautes.push(`${i}${k} Malo pas en premier`);
          const h = t.pieces.liens.filter((x) => att('liens', x).attendu === 'hierarchique').length;
          if (h < 2 || t.pieces.liens.length - h < 2) fautes.push(`${i}${k} liens ${h} H`);
          if (new Set(t.pieces.courrier.map((x) => att('courrier', x).a)).size < 3) fautes.push(`${i}${k} destinataires`);
        });
        if ([c.bonus.cases.length, c.bonus.liens.length, c.bonus.courrier.length].join() !== '1,2,2') fautes.push(`${i} bonus`);
        const ensemble = (b) => [...c.pieces[b], ...c.bonus[b]];
        if (['cases', 'liens', 'courrier'].some((b) => new Set(ensemble(b)).size !== ensemble(b).length)) fautes.push(`${i} bonus en double`);
        if (s.bonus) fautes.push(`${i} bonus d’un standard`);
        const dbc = { tirages: { [ID]: c } };
        const L = S.courrierDe(dbc);
        if (L.length !== 6 || L[0].id !== 'msg-malo' || L[5].id !== S.courrierSocleDe(dbc)[3].id) fautes.push(`${i} ordre du courrier confirmé`);
      }
      return fautes;
    };
    // La même déclaration sans la règle d'équité : le contrôle doit la prendre en faute (sinon il ne prouve rien).
    const sansRegle = declarerTirage({ banques: S.TIRAGE.decl.banques });
    return { vrai: juger(S.TIRAGE), sansRegle: juger(sansRegle).length };
  }, ID);
  if (r.vrai.length) throw new Error(r.vrai.slice(0, 6).join(' / '));
  vrai(r.sansRegle > 30, `sans la règle d’équité, le contrôle ne trouve que ${r.sansRegle} faute(s) : il est trop faible`);
});

await v('ENT-6.1 : confirmé (fb-conf) — 4 cases, 7 situations, 6 messages ; bandeau identique à un standard ; « bonus » absent ; cas bonus faux → 20/20 (le socle, pas moins)', async () => {
  await monter({ uid: 'fb-conf', aisance: 'confirme' });
  await aller('fiche:qui-fait-quoi');
  egal(await pg.$$eval(`${Z} [data-og-case]`, (L) => L.map((x) => x.dataset.ogCase)), ['A', 'B', 'C', 'D'], 'cases vides');
  egal(await pg.$$eval(`${Z} [data-ouinon$="|hierarchique|1"]`, (L) => L.length), 7, 'situations');
  // Socle juste, cas bonus faux (case C = Nadia, les deux dernières situations, les messages arrivés en 3e et 5e).
  await envoyerFiche({ cases: { a: 'thomas', b: 'karim', c: 'helene', d: 'lucas' }, chef: 'karim',
    liens: { 'lien-thomas-heures': true, 'lien-helene-objectif': true, 'lien-karim-preparateur': false, 'lien-karim-horaire': false,
      'lien-karim-tournee': true, 'lien-nadia-quai': true, 'lien-thomas-securite': true } });
  await pointDEtape('karim');
  const C = [['msg-malo', 'ines'], ['msg-partir-tot', 'nadia'], ['msg-garage', 'helene'], ['msg-rack', 'thomas'], ['msg-candidature', 'karim'], ['msg-attestation', 'ines']];
  for (const [cle, qui] of C) {
    vrai(!(await present('[data-fin]')), `bandeau de fin avant ${cle}`);
    await transferer(cle, qui);
  }
  egal(await cles(), C.map((x) => x[0]), 'courrier du confirmé, dans l’ordre d’arrivée');
  const n = await note();
  egal(n.score, 20, 'note');
  egal([n.detail.bonus.justes, n.detail.bonus.total], [0, 5], 'cas bonus');
  egal(await bandeau(), tout('ok'), 'bandeau (les mêmes lignes qu’un standard)');
  vrai(!(await present('[data-fin-corriger]')), '« Corriger » proposé pour un cas bonus');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-6.1 : Corrigés — pour un élève, ses cases (lettre → personne), ses situations, son courrier ; cas bonus marqués ; élève qui n’a pas ouvert : son tirage standard', async () => {
  const db = await monter({ uid: 'fb-conf', aisance: 'confirme' });
  const r = await pg.evaluate(async (db) => {
    const C = await import('/contenus/corriges/ENT-6.1.js');
    const a = C.corrigeEleve(db, 'fb-conf');
    const b = C.corrigeEleve({}, 'fb-juste');
    return { a: a.items.map((it) => [it.texte, !!it.bonus, it.reponses.map((l) => l.slice(0, 2).join(' = '))]), b: b.texte, bCases: b.items[0].reponses,
      fixe: C.CORRIGE.items.length };
  }, db);
  egal(r.a[0], ['Ses cases vides', false, ['Case A = Thomas', 'Case B = Karim', 'Case D = Lucas']], 'cases du socle');
  egal(r.a[1], ['Case en plus', true, ['Case C = Nadia']], 'case bonus');
  egal(r.a.filter((x) => x[1]).length, 3, 'blocs bonus');
  egal(r.a.find((x) => x[0] === 'Son courrier')[2], ['La Cabane à Malo = Commande de vendredi', 'Préparateur de commandes = Vendredi',
    'Préparateur de commandes = Allée B', 'Cariste de la plateforme = Attestation d’employeur'], 'courrier (ordre du socle)');
  vrai(/pas encore ouvert/.test(r.b), 'élève qui n’a pas ouvert : ' + r.b);
  egal(r.bCases.map((l) => l.slice(0, 2).join(' = ')), ['Case A = Karim', 'Case B = Nadia', 'Case C = Lucas'], 'tirage calculé de fb-juste');
  vrai(r.fixe >= 8, 'corrigé fixe');
});

await v('ENT-6.1 : enseignant — la séance s’ouvre (organigramme, fiche, point d’étape et question visibles), rien ne remonte au suivi', async () => {
  await monter({ uid: 'fb-prof', role: 'prof' });
  await aller('fiche:qui-fait-quoi');
  egal(await pg.$$eval(`${Z} [data-og-case]`, (L) => L.length), 3, 'cases vides');
  vrai(await present('.ent-nav[data-vue="etape:avant-courrier"]'), 'point d’étape au menu de l’enseignant');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'scores remontés');
});

// ── Fiche, documents et `ecran` « fonction de la base » (chantier D-1 bis, brief ENT-6.1 §7.3) ─────────────────
// Variantes de la VRAIE séance (univers et contenu d'ENT-6.1), fabriquées ici dans la page : une fonction qui plante.
await v('Fonction de la base : au chargement, une fonction qui plante (ou rend autre chose) sur une base vide refuse la séance, avec un message qui nomme la fiche, le document ou le jalon', async () => {
  const r = await pg.evaluate(async () => {
    const { composerSeance } = await import('/core/types/seance-entreprise.js');
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const FB = await import('/contenus/france-boissons.js');
    const S = await import('/contenus/france-boissons-ent61.js');
    const A = await import('/activites/france-boissons-organigramme.js');
    const essai = (opts, seance = S) => {
      try { creerEntreprise(composerSeance(FB, seance, { ...A.meta }, { ...S.OPTIONS, ...opts }).options); return 'chargée'; } catch (e) { return e.message; }
    };
    const boum = () => { throw new Error('boum'); };
    return {
      telle: essai({}),
      blocs: essai({ fiches: [S.FICHE_VU, { ...S.FICHE_QUI, blocs: boum }] }),
      blocsType: essai({ fiches: [S.FICHE_VU, { ...S.FICHE_QUI, blocs: () => 'texte' }] }),
      docs: essai({ fiches: [S.FICHE_VU, { ...S.FICHE_QUI, documents: boum }] }),
      html: essai({ documents: [{ ...S.DOC_ORGANIGRAMME_ELEVE, html: () => 42 }, FB.DOC_ANNUAIRE, S.DOC_DROIT] }),
      ecran: essai({}, { ...S, ETAPES: S.ETAPES.map((e) => (e.id === 'courrier-malo' ? { ...e, ecran: () => 7 } : e)) }),
    };
  });
  egal(r.telle, 'chargée', 'la séance telle quelle');
  vrai(/fiche « qui-fait-quoi » : « blocs\(db\) » ne marche pas sur une base vide : boum/.test(r.blocs), 'blocs qui plante : ' + r.blocs);
  vrai(/fiche « qui-fait-quoi » : « blocs\(db\) ».*rend string au lieu d’un tableau/.test(r.blocsType), 'blocs d’un mauvais type : ' + r.blocsType);
  vrai(/fiche « qui-fait-quoi » : « documents\(db\) ».*boum/.test(r.docs), 'documents qui plante : ' + r.docs);
  vrai(/document « organigramme » : « html\(db\) ».*rend number au lieu d’un texte/.test(r.html), 'html d’un mauvais type : ' + r.html);
  vrai(/jalon « courrier-malo » : « ecran\(db\) » rend number/.test(r.ecran), 'ecran d’un mauvais type : ' + r.ecran);
});

await v('Fonction de la base : au dessin, une fonction qui plante (base de l’élève) est signalée et laisse un avis d’erreur, sans casser l’écran ni laisser partir la fiche', async () => {
  const avant = erreursF.length;
  await pg.evaluate(async (REP61) => {
    const { composerSeance } = await import('/core/types/seance-entreprise.js');
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const FB = await import('/contenus/france-boissons.js');
    const S = await import('/contenus/france-boissons-ent61.js');
    const A = await import('/activites/france-boissons-organigramme.js');
    // Ne plante qu'avec un tirage (jamais sur la base vide du contrôle au chargement).
    const piege = (rendu) => (db) => { if (db.tirages) throw new Error('boum au dessin'); return rendu; };
    const opts = { ...S.OPTIONS, fiches: [S.FICHE_VU, { ...S.FICHE_QUI, blocs: piege(S.FICHE_QUI.blocs({})) }],
      documents: [{ ...S.DOC_ORGANIGRAMME_ELEVE, html: piege('<p>vide</p>') }, FB.DOC_ANNUAIRE, S.DOC_DROIT] };
    const M = creerEntreprise(composerSeance(FB, S, { ...A.meta }, opts).options);
    document.querySelector('#fTest')?.remove();
    const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
    const db = { questions: { 'france-boissons-organigramme': Object.fromEntries(Object.entries(REP61).map(([id, v]) => [id, { arrivee: 1, premiere: v, duree: 1 }])) } };
    window.__f = { db, enregistres: [] };
    M.rendre(hote, { meta: A.meta, aisance: 'standard', profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'fb-piege' },
      jeu: { etat: () => db, sauver: () => {} }, enregistrer: (x) => window.__f.enregistres.push(x), quitter: () => {}, codeStock: 'FB',
      lireScore: async () => null });
  }, REP61);
  await aller('fiche:qui-fait-quoi');
  vrai(await present('[data-fiche-erreur]'), 'avis d’erreur de la fiche');
  vrai(await present('[data-doc-erreur]'), 'avis d’erreur du document');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  vrai(!(await present('[data-confirme-oui]')), 'la fiche qui ne se dessine pas part quand même');
  egal(((await base()).fiches || {})['qui-fait-quoi'] && (await base()).fiches['qui-fait-quoi'].envoye, undefined, 'fiche envoyée');
  const nouvelles = erreursF.slice(avant);
  vrai(nouvelles.some((x) => /la fiche « qui-fait-quoi » ne se dessine pas : boum au dessin/.test(x)), 'fiche non signalée : ' + nouvelles.join(' | '));
  vrai(nouvelles.some((x) => /le document « organigramme » ne se dessine pas : boum au dessin/.test(x)), 'document non signalé : ' + nouvelles.join(' | '));
  vrai(nouvelles.every((x) => /ne se dessine pas : boum au dessin/.test(x)), 'autre erreur : ' + nouvelles.join(' | '));
  erreursF.splice(avant);   // attendues : elles ne comptent pas dans « aucune erreur JavaScript »
});

// Les messages portent la date du scénario (lundi 14 juin 2027), jamais la date du jour (décision de Tristan, 10/10/2026).
await v('ENT-6.1 : les messages portent la date du scénario — Inès le 14/06/2027 à 8 h 05 (affiché tel quel), sa réponse à la fiche vidéo le même jour, au moins 2 min après', async () => {
  await monter({ uid: 'fb-date' });
  const E = await entrants();
  egal(E.map((m) => [m.subject, horodate(m.ts)]), [['Bienvenue à Buchelay', [2027, 6, 14, 8, 5]]], 'accueil');
  await aller('mail');
  egal(await pg.$$eval(`${Z} .ent-mitem .ent-de`, (L) => L.map((x) => x.innerText.replace(/\s+/g, ' ').trim())), ['Inès 14/06/2027'], 'liste de la boîte');
  await envoyerVu();
  const R = (await entrants()).find((m) => m.subject === 'RE : Ce que j’ai vu');
  egal(horodate(R.ts).slice(0, 3), [2027, 6, 14], 'jour de la réponse : ' + horodate(R.ts));
  vrai(R.ts >= E[0].ts + 2 * 60000 && R.ts < E[0].ts + 60 * 60000, 'réponse après l’accueil (2 min à 1 h) : ' + horodate(R.ts));
});

// ── Étape A (10/10/2026) : « Avant de commencer » d'ENT-6.1 et les trois questions au fil ─────────────────────────────────
// Réponses (écrites à la main, une clé par question de la banque ; la banque compte 4 questions de préparation et 4 de droit,
// l'élève en reçoit 2 + 2) : juste = fb-plateforme 'distribue', organigramme-sert 'qui', trait-plein 'chef', rendre-compte 'cheffe',
// ri-obligatoire 'oui50' (n de 55 à 150, jamais 80), cse-obligatoire 'oui11' (n de 12 à 45), malo-chef 'non', zero-accident 'employeur'.
// Questions au fil : n° 2 `qui-sanctionne` 'employeur' (1,5), n° 3 `appui-chef` (réflexion), n° 5 `qui-traite-malo` 'ines' (1,5), n° 1 2 points.
const PREP61 = ['fb-plateforme', 'organigramme-sert', 'trait-plein', 'rendre-compte'];
const DROIT61 = ['ri-obligatoire', 'cse-obligatoire', 'malo-chef', 'zero-accident'];
const FAUX61 = { 'fb-plateforme': 'brasse', 'organigramme-sert': 'horaires', 'trait-plein': 'bureau', 'rendre-compte': 'comptes',
  'ri-obligatoire': 'non200', 'cse-obligatoire': 'non50', 'malo-chef': 'oui-paie', 'zero-accident': 'salarie' };
const tirage61 = async () => (await base()).questions[ID]['@tirage'];
// Répond aux questions tirées de l'élève, dans l'ordre de l'écran, avec les réponses `rep`.
async function repondreOuverture61(rep = REP61) {
  const ids = (await tirage61()).ids;
  for (let k = 0; k < ids.length; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await pg.click(`${Z} [data-q-choix="${rep[ids[k]]}"][data-q="${ids[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${ids[k]}"]`);
    await pause();
  }
}
const calcPresente = () => pg.evaluate(() => !!document.getElementById('calculetteFlottante'));
const nettoyerCalc = () => pg.evaluate(() => document.getElementById('calculetteFlottante')?.remove());

await v('ENT-6.1 : « Avant de commencer » — la séance s’ouvre sur 4 questions tirées (2 de préparation + 2 de droit), l’organigramme de l’élève, l’annuaire et le droit à gauche, la calculette ; menu fermé puis ouvert ; rien dans la note', async () => {
  await nettoyerCalc();
  await monter({ sansOuverture: true, uid: 'fb-juste' });
  vrai(await present('[data-ouverture="avant-de-commencer"]'), 'la séance ne s’ouvre pas sur « Avant de commencer »');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue)), ['ouverture'], 'entrées ouvertes au départ');
  const ids = (await tirage61()).ids;
  egal(ids.length, 4, 'questions tirées');
  egal(ids.filter((i) => PREP61.includes(i)).length, 2, 'préparation');
  egal(ids.filter((i) => DROIT61.includes(i)).length, 2, 'droit');
  egal(await pg.$$eval(`${Z} .qo-pas`, (L) => L.length), 4, 'pastilles');
  egal(await pg.$$eval(`${Z} .qo-onglet`, (L) => L.map((x) => x.textContent)), ['Organigramme', 'Annuaire (fiches de chacun)', 'Le droit'], 'onglets');
  vrai(await calcPresente(), 'la calculette est absente de l’écran');
  // L'organigramme montré est celui de l'élève : ses trois cases vides, lettrées, sans nom.
  await pg.click(`${Z} [data-ouv-doc="organigramme"]`); await pause();
  egal(await pg.$$eval(`${Z} .qo-feuille [data-og-case]`, (L) => L.map((x) => x.dataset.ogCase)), ['A', 'B', 'C'], 'cases vides de l’élève');
  // Le droit : les cinq textes, avec leur source.
  await pg.click(`${Z} [data-ouv-doc="droit"]`); await pause();
  const droit = await pg.textContent(`${Z} .qo-feuille`);
  for (const t of ['L1311-2', 'L2311-2', '94-13.187', 'L4121-1', 'L1331-1']) vrai(droit.includes(t), `« Le droit » ne cite pas ${t}`);
  vrai(/Texte de loi \(réel\) — source : Légifrance/.test(droit), 'source de Légifrance');
  await repondreOuverture61();
  const menu = await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue));
  vrai(['ouverture', 'accueil', 'mail', 'fiche:qui-fait-quoi'].every((m) => menu.includes(m)), 'menu après les quatre réponses : ' + menu);
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note : les questions d’ouverture ne comptent pas');
  egal(await bandeau(), [], 'bandeau de fin avant le travail');
  vrai(await calcPresente(), 'calculette perdue après les réponses');
  await aller('accueil');
  vrai(!(await calcPresente()), 'la calculette flotte encore sur l’accueil');
  await nettoyerCalc();
});

await v('ENT-6.1 : de l’écran « Avant de commencer » au bilan — 20/20 quelles que soient les réponses d’ouverture (justes ou fausses)', async () => {
  for (const [uid, rep] of [['fb-juste', REP61], ['fb-quai', FAUX61]]) {
    await monter({ sansOuverture: true, uid });
    await repondreOuverture61(rep);
    await envoyerFiche(uid === 'fb-juste' ? JUSTE : { cases: { a: 'karim', b: 'nadia', c: 'lucas' }, chef: 'karim',
      liens: { 'lien-helene-objectif': true, 'lien-karim-tournee': true, 'lien-karim-preparateur': false, 'lien-lucas-attestation': false, 'lien-nadia-quai': false } });
    await pointDEtape('karim');
    for (const [cle, qui] of uid === 'fb-juste' ? COURRIER_JUSTE : [['msg-malo', 'ines'], ['msg-amandine-planning', 'karim'], ['msg-chauffeur-quai', 'nadia'], ['msg-partir-tot', 'nadia']]) await transferer(cle, qui);
    const n = await note();
    egal([n.score, n.max], [20, 20], `note de ${uid}`);
    egal(await bandeau(), tout('ok'), `bandeau de ${uid}`);
  }
  await nettoyerCalc();
});

await v('ENT-6.1 : le tirage de l’ouverture — deux élèves n’ont pas les mêmes questions, toute la banque sort, toujours 2 + 2 ; ri-obligatoire (n de 55 à 150, jamais 80) et cse-obligatoire (n de 12 à 45) justes pour 50 graines', async () => {
  const r = await pg.evaluate(async () => {
    const { compilerQuestions, tirerOuverture } = await import('/core/types/questions.js');
    const { QUESTIONS } = await import('/contenus/questions/ENT-6.1.js');
    const M = compilerQuestions(QUESTIONS, null, ['organigramme', 'annuaire', 'droit']);
    const T = [];
    for (let s = 0; s < 300; s++) { const t = tirerOuverture(M, `graine-${s}`); T.push({ ids: t.ids, q: t.q }); }
    return T;
  });
  for (const t of r) {
    egal([t.ids.filter((i) => PREP61.includes(i)).length, t.ids.filter((i) => DROIT61.includes(i)).length], [2, 2], 'répartition 2 + 2 : ' + t.ids);
  }
  egal([...new Set(r.flatMap((t) => t.ids))].sort(), [...PREP61, ...DROIT61].sort(), 'toute la banque sort au moins une fois sur 300 graines');
  vrai(new Set(r.map((t) => t.ids.slice().sort().join())).size > 5, 'les élèves reçoivent presque tous les mêmes questions');
  vrai(r[0].ids.slice().sort().join() !== r.find((t) => t.ids.slice().sort().join() !== r[0].ids.slice().sort().join()).ids.slice().sort().join(), 'pas de différence trouvée');
  // Valeurs tirées : la bonne réponse (clé commune) est juste pour chaque graine, les pièges faux.
  const RI = r.filter((t) => t.q['ri-obligatoire']), CSE = r.filter((t) => t.q['cse-obligatoire']);
  vrai(RI.length >= 50 && CSE.length >= 50, `moins de 50 tirages à valeurs : ${RI.length} / ${CSE.length}`);
  for (const t of RI) {
    const n = Number(/emploie (\d+) salariés/.exec(t.q['ri-obligatoire'].enonce)[1]);
    vrai(n >= 55 && n <= 150 && n !== 80, `ri-obligatoire : n = ${n} hors plage`);
    vrai(n >= 50, 'ri-obligatoire : « oui à partir de 50 » juste pour ' + n);   // le seuil est 50 (L1311-2) : oui
    vrai(n < 200, 'ri-obligatoire : « seulement à partir de 200 » faux pour ' + n);
    egal(new Set(Object.values(t.q['ri-obligatoire'].libs)).size, 3, 'choix distincts');
  }
  for (const t of CSE) {
    const n = Number(/emploie (\d+) salariés/.exec(t.q['cse-obligatoire'].enonce)[1]);
    vrai(n >= 12 && n <= 45, `cse-obligatoire : n = ${n} hors plage`);
    vrai(n >= 11, 'cse-obligatoire : « oui à partir de 11 » juste pour ' + n);   // seuil 11 (L2311-2) : oui
    vrai(n < 50, 'cse-obligatoire : « seulement à partir de 50 » faux pour ' + n);
    egal(new Set(Object.values(t.q['cse-obligatoire'].libs)).size, 3, 'choix distincts');
  }
  vrai(new Set(RI.map((t) => t.q['ri-obligatoire'].enonce)).size > 10, 'les valeurs de ri-obligatoire ne varient pas assez');
  // À l'écran : l'élève qui a reçu la question la voit avec SON nombre, et la bonne clé est la bonne.
  let vu = 0;
  for (const uid of ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8']) {
    await monter({ sansOuverture: true, uid });
    const rec = await tirage61();
    for (const id of ['ri-obligatoire', 'cse-obligatoire']) {
      const k = rec.ids.indexOf(id);
      if (k < 0) continue;
      await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
      const n = /emploie (\d+) salariés/.exec(await pg.textContent(`${Z} .qf-enonce`))[1];
      vrai(rec.q[id].enonce.includes(`emploie ${n} salariés`), 'l’énoncé affiché n’est pas celui du tirage rangé');
      await pg.click(`${Z} [data-q-choix="${REP61[id]}"][data-q="${id}"]`);
      await pg.click(`${Z} [data-q-repondre="${id}"]`); await pause();
      egal(await pg.getAttribute(`${Z} [data-q-verdict]`, 'data-q-verdict'), 'ok', `${id} avec n = ${n} : la bonne réponse n’est pas jugée juste`);
      vu += 1;
    }
  }
  vrai(vu >= 4, 'trop peu de questions à valeurs vues à l’écran : ' + vu);
  await nettoyerCalc();
});

await v('ENT-6.1 : barème — les jalons du socle valent 15 (aucun à 0), les trois questions notées 5 (2 + 1,5 + 1,5)', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent61.js');
    const Q = await import('/contenus/questions/ENT-6.1.js');
    return { poids: S.ETAPES.filter((e) => !e.bonus).map((e) => [e.id, e.poids]), part: Q.QUESTIONS.part,
      q: Q.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids]) };
  });
  egal(r.poids, [['case-karim', 2], ['case-2', 1], ['case-3', 1], ['chef-lucas', 1.5], ['lien-1', 1], ['lien-2', 1], ['lien-3', 1], ['lien-4', 1],
    ['lien-5', 1], ['courrier-malo', 1.5], ['courrier-2', 1], ['courrier-3', 1], ['courrier-4', 1]], 'poids des jalons du socle');
  egal(r.part, 5, 'part des questions');
  egal(r.q, [['qui-decide-conges', 2], ['qui-sanctionne', 1.5], ['qui-traite-malo', 1.5]], 'questions notées et leurs poids');
  egal(r.poids.reduce((t, x) => t + x[1], 0) + r.part, 20, 'total');
});

await v('ENT-6.1 : question n° 2 d’Inès (qui peut sanctionner Lucas) — avec la n° 1 au point d’étape, le courrier attend les deux réponses ; fausse → ✗ et retour tout de suite, 18,5/20', async () => {
  await monter({ uid: 'fb-juste' });
  await envoyerFiche(JUSTE);
  await aller('etape:avant-courrier');
  egal(await pg.$$eval(`${Z} [data-q-etape] [data-question]`, (L) => L.map((x) => x.dataset.question)), ['qui-decide-conges', 'qui-sanctionne'], 'questions du point d’étape');
  await pg.click(`${Z} [data-q-choix="karim"][data-q="qui-decide-conges"]`);
  await pg.click(`${Z} [data-q-repondre="qui-decide-conges"]`);
  await pause();
  egal(await cles(), [], 'le courrier arrive avant la seconde réponse');
  vrai(await pg.$eval(`${Z} [data-q-continuer]`, (b) => b.disabled), '« Continuer » ouvert avec une seule réponse');
  await pg.click(`${Z} [data-q-choix="malo"][data-q="qui-sanctionne"]`);
  await pg.click(`${Z} [data-q-repondre="qui-sanctionne"]`);
  await pause();
  egal(await pg.getAttribute(`${Z} [data-question="qui-sanctionne"] [data-q-verdict]`, 'data-q-verdict'), 'ko', 'verdict de la réponse fausse');
  vrai(/l’entreprise qui décide|employeur/.test(await pg.textContent(`${Z} [data-question="qui-sanctionne"] .qf-retour`)), 'retour d’Inès');
  egal(await cles(), ['msg-malo'], 'le courrier n’arrive pas après les deux réponses');
  for (const [cle, qui] of COURRIER_JUSTE) await transferer(cle, qui);
  proche((await note()).score, 18.5, 'note');
  egal(await bandeau(), LIGNES.map((l) => [l, l === 'question:qui-decide-conges' ? 'ko' : 'ok']), 'bandeau : seule la ligne des questions d’Inès est fausse');
});

await v('ENT-6.1 : question n° 3 de Karim (sur quoi t’es-tu appuyé pour le chef de Lucas) — arrive au choix du chef, pas avant ; réflexion jamais notée ; « Merci, je note » sans retour ; le retour de Karim vient avec le bandeau de fin', async () => {
  await monter({ uid: 'fb-juste' });
  await aller('fiche:qui-fait-quoi');
  await pg.selectOption(`${Z} [data-fiche-champ="case-a"]`, 'karim');
  await pause();
  vrai(!(await present('[data-q-panneau]')), 'la question arrive avant le choix du chef');
  await pg.selectOption(`${Z} [data-fiche-champ="chefLucas"]`, 'karim');
  await pause();
  vrai(await present('[data-q-panneau="appui-chef"]'), 'la question n’arrive pas au choix du chef');
  vrai(/Karim te pose une question/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'Karim ne pose pas la question');
  await pg.click(`${Z} [data-q-choix="haut"][data-q="appui-chef"]`);
  await pg.click(`${Z} [data-q-repondre="appui-chef"]`);
  await pause();
  vrai(await present('[data-q-merci]'), 'pas de « Merci, je note »');
  vrai(!(await present('[data-q-verdict]')) && !(await present('[data-q-panneau] .qf-retour:not([data-q-merci])')) && !/Ce qu’en pense|Les deux premiers appuis/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'le retour de Karim est déjà là');
  await pg.click(`${Z} [data-q-reprendre]`);
  await pause();
  egal((await base()).questions[ID]['appui-chef'].premiere, 'haut', 'réponse rangée');
  await envoyerFiche(JUSTE);          // le chef est déjà choisi : la question ne revient pas
  vrai(!(await present('[data-q-panneau]')), 'la question est revenue');
  await pointDEtape('karim');
  for (const [cle, qui] of COURRIER_JUSTE) await transferer(cle, qui);
  const n = await note();
  egal(n.score, 20, 'une réflexion ne compte pas (même répondue « le plus haut placé »)');
  vrai(!Object.keys(n.detail).some((k) => /appui-chef/.test(k)), 'la réflexion est notée');
  vrai(await present('[data-fin-retour="appui-chef"]'), 'le retour de Karim manque au bilan');
  vrai(/Karim/.test(await pg.textContent(`${Z} [data-fin-retour="appui-chef"]`)), 'retour sans Karim');
});

await v('ENT-6.1 : question n° 5 d’Inès (qui va traiter la commande de Malo) — au transfert de CE message, après celle de Karim ; corrigée au bilan seulement ; fausse → 18,5/20', async () => {
  await monter({ uid: 'fb-juste' });
  await envoyerFiche(JUSTE);
  await pointDEtape('karim');
  await ouvrirMessage('msg-malo');
  await pg.click(`${Z} [data-transfert-ouvrir]`);
  await pg.click(`${Z} [data-transferer="ines"]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  const G = (await base()).gestes[ID];
  vrai(typeof G['messagerie:transfert:msg-malo'] === 'number' && typeof G['messagerie:transfert'] === 'number', 'les deux gestes de transfert');
  vrai(await present('[data-q-panneau="pourquoi-pas-helene"]'), 'la question générique de Karim vient d’abord');
  await pg.click(`${Z} [data-q-choix="niveau"][data-q="pourquoi-pas-helene"]`);
  await pg.click(`${Z} [data-q-repondre="pourquoi-pas-helene"]`);
  await pg.click(`${Z} [data-q-reprendre]`);
  await pause();
  vrai(await present('[data-q-panneau="qui-traite-malo"]'), 'la question d’Inès n’arrive pas après celle de Karim');
  await pg.click(`${Z} [data-q-choix="karim"][data-q="qui-traite-malo"]`);   // fausse
  await pg.click(`${Z} [data-q-repondre="qui-traite-malo"]`);
  await pause();
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'corrigée tout de suite au lieu d’attendre le bilan');
  await pg.click(`${Z} [data-q-reprendre]`);
  await pause();
  for (const [cle, qui] of COURRIER_JUSTE.slice(1)) await transferer(cle, qui);
  proche((await note()).score, 18.5, 'note');
  egal(await bandeau(), LIGNES.map((l) => [l, l === 'question:qui-decide-conges' ? 'ko' : 'ok']), 'bandeau');
  vrai(await present('[data-fin-retour="qui-traite-malo"]'), 'le retour d’Inès manque au bilan');
});

await v('ENT-6.1 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

// ── ENT-6.2 : la commande de La Cabane à Malo (brief `docs/briefs/ENT-6.2-france-boissons-commande.md`, §8) ──────────────
// Même montage (la vraie séance, `activites/france-boissons-commande.js`), de vrais clics. Les valeurs attendues sont ÉCRITES
// À LA MAIN ci-dessous (brief §4 et §5), jamais relues dans `contenus/france-boissons-ent62.js` :
//   bon : Heineken 30 L = 6, Affligem = 2, remplacement Pelforth Blonde 20 L × 2 (total 10 = le minimum), eau = 3 casiers,
//   livraison le vendredi 18 juin 2027, vides 9 fûts et 5 casiers ; message : une phrase juste par ligne (au vous).
// Jalons : heineken30, affligem, remplacement, jour, eau-vides (le bon), msg-rupture, msg-livraison, msg-ton (la réponse).
// Ce qui vaut son prix : le parcours juste, l'inaction à 0, chaque piège du brief qui ne fait tomber que son jalon, la réponse
// non envoyée, « Corriger », la case nombre refusée à l'envoi, et le sabotage jalon par jalon (chaque jalon lit bien sa case).

const ID62 = 'france-boissons-commande';
const monter62 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-commande.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  // L'écran « Avant de commencer » (10/10/2026) ouvre la séance et ferme le reste du menu : les cas qui travaillent sur la
  // commande partent d'un élève qui y a déjà répondu (réponses écrites à la main). `sansOuverture: true` : on part de zéro.
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['france-boissons-commande'] = db.questions['france-boissons-commande'] || {});
    const REP = { 'qui-est-malo': 'client', 'les-vides': 'consignes', 'ou-regarder': 'stock-cond', 'vente-conclue': 'acceptation', 'consigne-rendue': '92' };
    for (const [id, v] of Object.entries(REP)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: v, duree: 1 };
    // Étape A (banque de 10 questions tirées) : les cinq nouvelles aussi, pour que tout tirage soit déjà répondu.
    const PLUS = { 'format-fut': 'litres', 'bon-sert': 'livrer', 'tireuse': 'fut', 'offre-ines': 'offre', 'cgv-communiquer': 'communiquer' };
    for (const [id, v] of Object.entries(PLUS)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: v, duree: 1 };
  } else if (!o.tirageReel) {
    // « Avant de commencer » d'origine (5 questions fixes, ordre d'avant la banque) : le tirage rangé est celui de ces cinq,
    // pour que le cas qui joue l'écran de bout en bout reste le même. `tirageReel: true` : le vrai tirage de l'élève.
    const Q = ((db.questions = db.questions || {})['france-boissons-commande'] = db.questions['france-boissons-commande'] || {});
    if (!Q['@tirage']) Q['@tirage'] = { graine: 'ancien', ids: ['qui-est-malo', 'les-vides', 'ou-regarder', 'vente-conclue', 'consigne-rendue'], q: {}, at: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb62' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, o);

const BON_JUSTE = { heineken30: '6', affligem20: '2', remplacement: 'pelforth20', remplacementQte: '2', eau: '3',
  jour: '2027-06-18', videsFuts: '9', videsCasiers: '5' };
const MSG_JUSTE = {
  salutation: 'Bonjour Malo,',
  commande: 'Votre commande pour la Fête de la musique est bien enregistrée.',
  rupture: 'Il ne nous reste que 2 fûts d’Affligem : je vous propose 2 fûts de Pelforth Blonde 20 L à la place.',
  livraison: 'Vous serez livré vendredi 18 juin, par notre tournée de la côte.',
  vides: 'Le chauffeur reprendra vos 9 fûts et 5 casiers vides.',
  fin: 'Cordialement, Lea, administration des ventes France Boissons',
};
const JALONS62 = ['heineken30', 'affligem', 'remplacement', 'jour', 'eau-vides', 'msg-rupture', 'msg-livraison', 'msg-ton'];
const LIGNES62 = ['heineken30', 'jour', 'eau-vides', 'msg-rupture', 'msg-livraison', 'msg-ton', 'question:jour-engage', 'question:qui-utilise-le-bon'];   // 1er jalon de chaque ligne du bandeau
const etats62 = (n) => JALONS62.map((j) => [j, n.detail[j]]);
// Poids écrits à la main (validés par Tristan le 10/10/2026, revus à 11 h 20 avec les questions au fil, total 20) : fûts 1 + 2 + 3, jour 2, eau et vides 2, rupture 3, livraison 2, ton 2, plus 3 pour les deux questions notées (1,5 chacune).
const POIDS62 = { heineken30: 1, affligem: 2, remplacement: 3, jour: 2, 'eau-vides': 2, 'msg-rupture': 3, 'msg-livraison': 2, 'msg-ton': 2 };
const sauf = (faux, etat = 'ko') => JALONS62.map((j) => [j, faux.includes(j) ? etat : 'ok']);

// Les questions au fil d'ENT-6.2 (écrites à la main : bonnes réponses). Un panneau ouvert est répondu puis refermé.
const BONNES62 = { 'pourquoi-ce-remplacement': 'blonde', 'jour-engage': 'acceptation', 'qui-utilise-le-bon': 'prepa-chauffeur', 'vides-faux': 'chauffeur' };
async function qrep(choix = BONNES62) {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
// Remplit le bon (les clés absentes restent vides) et clique « Envoyer » ; `confirmer: false` = s'arrête avant la confirmation.
async function remplirBon(r, { confirmer = true } = {}) {
  await aller('fiche');
  for (const k of ['heineken30', 'affligem20', 'remplacementQte', 'eau', 'videsFuts', 'videsCasiers']) {
    if (r[k] != null) await pg.fill(`${Z} [data-fiche-saisie="${k}"]`, r[k]);
  }
  if (r.remplacement) { await pg.selectOption(`${Z} [data-fiche-champ="remplacement"]`, r.remplacement); await pause(); await qrep(); }
  if (r.jour) await pg.check(`${Z} [data-fiche-champ="jour"][value="${r.jour}"]`);
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  if (confirmer) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); }
}
async function ouvrirMalo() {
  await aller('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  const id = await pg.evaluate(() => window.__f.db.mails.find((m) => m.folder === 'in' && m.subject === 'Commande pour la Fête de la musique').id);
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pause();
}
// Répond à Malo par phrases : `m` = { ligne: texte de la phrase choisie }.
async function repondreMalo(m) {
  await ouvrirMalo();
  if (!(await present('[data-repondre]')) && await present('[data-qf-ferme]')) {   // le point d'étape d'Inès garde « Répondre » fermé
    await aller('etape:avant-reponse');
    await pg.click(`${Z} [data-q-choix="${BONNES62['qui-utilise-le-bon']}"][data-q="qui-utilise-le-bon"]`);
    await pg.click(`${Z} [data-q-repondre="qui-utilise-le-bon"]`);
    await pause();
    await pg.click(`${Z} [data-q-continuer]`);
    await pause();
    await ouvrirMalo();
  }
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  for (const [l, t] of Object.entries(m)) { await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t }); await pause(); await qrep(); }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
const sujets = async () => (await entrants()).map((m) => m.subject);

await v('ENT-6.2 : valeurs attendues calculées = celles du brief (écrites à la main) ; un seul remplacement possible ; la copie de lireNombre lit comme l’original', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent62.js');
    const F = await import('/core/types/fiche.js');
    const essais = ['6', ' 6 ', '6 091', '2,5', '2.0', '-3', '0', '', null, undefined, 'six', '1e3', '6\u00a0091', '12,', ',5', '--2', '4 fûts'];
    return { A: S.ATTENDU, jours: S.JOURS_PROPOSES, remp: S.CHOIX_REMPLACEMENT.map((c) => c.v),
      ecarts: essais.filter((x) => !Object.is(S.lireNombre(x), F.lireNombre(x))).map(String) };
  });
  egal([r.A.futs.heineken30, r.A.futs.affligem20, r.A.totalSansRemplacement], [6, 2, 8], 'fûts livrables');
  egal([r.A.remplacement, r.A.candidats], [{ article: 'pelforth20', q: 2 }, ['pelforth20']], 'remplacement');
  egal([r.A.eau, r.A.jour, r.A.vides], [3, '2027-06-18', { futs: 9, casiers: 5 }], 'eau, jour, vides');
  egal(r.jours, ['2027-06-18', '2027-06-19', '2027-06-21'], 'jours proposés');
  egal(r.remp, ['aucun', 'pelforth20', 'edelweiss20', 'heineken20'], 'choix de remplacement');
  egal(r.ecarts, [], 'lireNombre : la copie ne lit pas comme l’original');
});

await v('ENT-6.2 : ouverture — messages d’Inès et de Malo, pièces jointes ; menu = Accueil, Messagerie, Bon de commande ; les documents se lisent (pied de reconstitution), mots cliquables', async () => {
  await monter62();
  const E = await entrants();
  egal(E.map((m) => [m.subject, m.pieces]), [['Bienvenue à l’administration des ventes', ['organigramme', 'annuaire']],
    ['Commande pour la Fête de la musique', ['fiche-client', 'stock', 'conditions', 'droit']]], 'messages à l’ouverture');
  vrai(/^Salut !/.test(E[1].text) && /mets-moi une autre blonde en 20 L/.test(E[1].text), 'le message de Malo (tutoiement)');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue).filter((x) => x !== 'accueil')), ['ouverture', 'mail', 'fiche'], 'menu');
  await ouvrirMalo();
  const docs = [];
  for (const id of ['fiche-client', 'stock', 'conditions']) {
    await pg.click(`${Z} [data-pj="${id}"]`);
    await pause();
    docs.push(await pg.evaluate((Z) => document.querySelector(`${Z} .ent-doc`).innerText, Z));
  }
  vrai(/C-14-2047/.test(docs[0]) && /Tournée de la côte : le vendredi/i.test(docs[0]) && /9 fûts, 5 casiers/.test(docs[0]), 'fiche client : ' + docs[0].slice(0, 300));
  vrai(/FUT-AFF-20\s+Affligem Blonde\s+fût 20 L\s+2/.test(docs[1]) && /FUT-HEI-20\s+Heineken\s+fût 20 L\s+0/.test(docs[1]) && /Référence\s+Article\s+Format\s+Disponible/i.test(docs[1]) && /Edelweiss \(bière blanche\)/.test(docs[1]), 'stock : ' + docs[1].slice(0, 400));
  vrai(/10 fûts par livraison/.test(docs[2]) && /40 € par fût/.test(docs[2]) && /4 € par casier/.test(docs[2]) && /avant 12 h la veille/.test(docs[2]), 'conditions : ' + docs[2].slice(0, 400));
  vrai(docs.every((d) => /Document pédagogique — reconstitution, non contractuel/.test(d)), 'mention de reconstitution');
  // Le bon : les documents à gauche (le message de Malo en premier), l'encadré, des mots cliquables.
  await aller('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((x) => x.dataset.ficheDoc)), ['commande-malo', 'fiche-client', 'stock', 'conditions'], 'documents à gauche');
  vrai(/Prendre une commande/.test(await texte()), 'encadré « Prendre une commande »');
  const mots = await pg.$$eval(`${Z} [data-lex]`, (L) => [...new Set(L.map((x) => x.dataset.lex))]);
  vrai(mots.length >= 3, 'mots cliquables sur le bon : ' + mots);
});

await v('ENT-6.2 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau de fin', async () => {
  await monter62({ uid: 'fb62-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
});

await v('ENT-6.2 : « Avant de commencer » — ouvre la séance (5 questions, documents et photos à gauche), menu fermé puis ouvert ; ni la note ni le bandeau n’en savent rien, même avec une réponse fausse', async () => {
  const hors = [];
  const surRequete = (r) => { try { if (new URL(r.url()).origin !== new URL(BASE).origin && !/^(data|blob):/.test(r.url())) hors.push(r.url()); } catch (e) { /* ignoré */ } };
  pg.on('request', surRequete);
  await monter62({ sansOuverture: true, uid: 'fb62-ouv' });
  vrai(await present('[data-ouverture="avant-de-commencer"]'), 'la séance ne s’ouvre pas sur « Avant de commencer »');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue)), ['ouverture'], 'entrées ouvertes au départ');
  egal(await pg.$$eval(`${Z} .qo-pas`, (L) => L.length), 5, 'questions');
  egal(await pg.$$eval(`${Z} .qo-onglet`, (L) => L.map((x) => x.textContent)),
    ['Message de Malo', 'Fiche client', 'Stock', 'Conditions de vente', 'Photos', 'La tireuse', 'Le droit'], 'onglets');   // étape A : 7e onglet, la photo de la tireuse
  vrai(/Bonjour ! Malo, le gérant de La Cabane à Malo/.test(await pg.textContent(`${Z} .qf-situation`)), 'situation d’Inès');
  // Question 1 : la fiche client à gauche ; réponse juste ; les questions suivantes montrent leur document.
  vrai(/C-14-2047/.test(await pg.textContent(`${Z} .qo-feuille`)), 'question 1 : la fiche client');
  const repondre = async (id, v) => { await pg.click(`${Z} [data-q-choix="${v}"][data-q="${id}"]`); await pg.click(`${Z} [data-q-repondre="${id}"]`); await pause(); };
  await repondre('qui-est-malo', 'client');
  await pg.click(`${Z} [data-ouv-aller="1"]`); await pause();
  vrai((await pg.$$eval(`${Z} .qo-feuille img`, (L) => L.map((i) => i.getAttribute('src')))).join() === './contenus/images/france-boissons/futs-mur.jpg,./contenus/images/france-boissons/casier-vides.jpg', 'question 2 : les deux photos');
  vrai(await pg.$$eval(`${Z} .qo-feuille img`, (L) => L.every((i) => i.complete && i.naturalWidth > 0)), 'une photo ne se charge pas');
  const credits = await pg.textContent(`${Z} .qo-feuille`);
  vrai(/Photo : Marco Zuppone, Unsplash/.test(credits) && /Photo : Jennifer Chen, Unsplash/.test(credits), 'crédits sous les photos');
  await repondre('les-vides', 'consignes');
  await pg.click(`${Z} [data-ouv-aller="2"]`); await pause();
  vrai(/FUT-AFF-20/.test(await pg.textContent(`${Z} .qo-feuille`)), 'question 3 : le stock');
  await repondre('ou-regarder', 'stock-cond');
  await pg.click(`${Z} [data-ouv-aller="3"]`); await pause();
  vrai(/article 1113/i.test(await pg.textContent(`${Z} .qo-feuille`)) && /Légifrance/.test(await pg.textContent(`${Z} .qo-feuille`)), 'question 4 : le texte de droit et sa source');
  await repondre('vente-conclue', 'envoi');   // fausse
  vrai((await pg.getAttribute(`${Z} [data-q-verdict]`, 'data-q-verdict')) === 'ko', 'une réponse fausse doit montrer ✗');
  vrai(!(await present('[data-ouv-continuer]')), '« Continuer » avant la dernière réponse');
  await pg.click(`${Z} [data-ouv-aller="4"]`); await pause();
  vrai(/40 € par fût/.test(await pg.textContent(`${Z} .qo-feuille`)), 'question 5 : les conditions de vente');
  await repondre('consigne-rendue', '92');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue)), ['ouverture', 'accueil', 'mail', 'fiche'], 'menu après les cinq réponses');
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note : les questions d’ouverture ne comptent pas');
  egal(await bandeau(), [], 'bandeau de fin avant le travail');
  for (const k of [0, 1, 2, 3, 4]) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    vrai(!/ne compte|comptent|dans (la|ta|votre) note|Pour réfléchir|notée/i.test(await pg.innerText(`${Z} .qo-bloc`)), `un texte parle de la note (question ${k + 1})`);
  }
  const R = (await base()).questions['france-boissons-commande'];
  egal(['qui-est-malo', 'les-vides', 'ou-regarder', 'vente-conclue', 'consigne-rendue'].map((id) => R[id].premiere),
    ['client', 'consignes', 'stock-cond', 'envoi', '92'], 'premières réponses rangées (clés)');
  pg.off('request', surRequete);
  egal(hors, [], 'requêtes hors du domaine du site');
});

await v('ENT-6.2 : parcours juste — 20/20, Inès demande la réponse après le bon, Malo répond « Ok pour la Pelforth, à vendredi ! », bandeau 6 lignes ✓, séance finie (photo)', async () => {
  await monter62();
  await remplirBon(BON_JUSTE);
  vrai((await entrants()).some((m) => m.subject === 'Bon de commande reçu' && /Réponds maintenant à Malo/.test(m.text)), 'second message d’Inès');
  egal((await note()).score, 10, 'note après le bon seul (fûts 6 + jour 2 + eau et vides 2)');
  vrai(!(await sujets()).includes('RE : Commande pour la Fête de la musique'), 'Malo répond avant la réponse de l’élève');
  await repondreMalo(MSG_JUSTE);
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(etats62(n), sauf([]), 'jalons');
  egal(await bandeau(), LIGNES62.map((l) => [l, 'ok']), 'bandeau');
  const R = (await entrants()).filter((m) => m.subject === 'RE : Commande pour la Fête de la musique');
  egal(R.map((m) => [m.from, m.text]), [['Malo (La Cabane à Malo)', 'Ok pour la Pelforth, à vendredi !\n\nMalo']], 'réponse de Malo');
  const out = (await base()).mails.filter((m) => m.folder === 'out');
  egal(out.map((m) => [m.toMail, m.text.split('\n')]), [['contact@cabane-a-malo.example', Object.values(MSG_JUSTE)]], 'message envoyé');
  vrai(!!(await base()).points[ID62], 'photo de fin (séance suivante ouverte)');
});

// Malo REPREND ce que l'élève lui a écrit (lignes « rupture » et « livraison »), sans corriger : une variante par phrase, le
// jalon correspondant reste faux (c'est le bilan qui corrige). Le vendredi juste : le parcours juste ci-dessus.
const REPRISES_MALO = [
  ['samedi', { livraison: 'Vous serez livré samedi 19 juin, comme vous le souhaitez.' }, 'Ok pour la Pelforth, à samedi !', ['msg-livraison']],
  ['lundi', { livraison: 'Vous serez livré lundi 21 juin.' }, 'Ok pour la Pelforth, à lundi !', ['msg-livraison']],
  ['Edelweiss', { rupture: 'Il ne nous reste que 2 fûts d’Affligem : je vous propose 2 fûts d’Edelweiss à la place.' }, 'Ok pour l’Edelweiss, à vendredi !', ['msg-rupture']],
  ['ligne retirée', { rupture: 'L’Affligem est en rupture, je retire la ligne.' }, 'Dommage pour l’Affligem, à vendredi !', ['msg-rupture']],
  ['4 Affligem promis, samedi', { rupture: 'Je vous livre bien 4 fûts d’Affligem.', livraison: 'Vous serez livré samedi 19 juin, comme vous le souhaitez.' },
    'Ok, à samedi !', ['msg-rupture', 'msg-livraison']],
];
for (const [nom, lignes, attendu, faux] of REPRISES_MALO) {
  await v(`ENT-6.2 : réponse « ${nom} » → Malo répond « ${attendu} » (il reprend, ne corrige pas) ; le jalon ${faux.join(', ')} reste faux`, async () => {
    await monter62({ uid: 'fb62-reprise' });
    await remplirBon(BON_JUSTE);
    await repondreMalo({ ...MSG_JUSTE, ...lignes });
    const R = (await entrants()).filter((m) => m.subject === 'RE : Commande pour la Fête de la musique');
    egal(R.map((m) => m.text), [`${attendu}\n\nMalo`], 'réponse de Malo');
    egal(etats62(await note()), sauf(faux), 'jalons');
  });
}

await v('ENT-6.2 : les messages portent la date du scénario — Malo le 15/06/2027 à 9 h 32, Inès à 9 h 35 en tête de la boîte ; les réponses d’Inès puis de Malo le même jour, dans l’ordre, après ; jamais la date du jour', async () => {
  await monter62({ uid: 'fb62-date' });
  const E = await entrants();
  egal(E.map((m) => [m.from, horodate(m.ts)]), [['Inès', [2027, 6, 15, 9, 35]], ['Malo (La Cabane à Malo)', [2027, 6, 15, 9, 32]]], 'semis');
  await aller('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  egal(await pg.$$eval(`${Z} .ent-mitem .ent-de`, (L) => L.map((x) => x.innerText.replace(/\s+/g, ' ').trim())),
    ['Inès 15/06/2027', 'Malo (La Cabane à Malo) 15/06/2027'], 'liste de la boîte (Inès en tête)');
  await remplirBon(BON_JUSTE);
  await repondreMalo(MSG_JUSTE);
  const R = (await entrants()).slice(2);
  egal(R.map((m) => m.subject), ['Bon de commande reçu', 'RE : Commande pour la Fête de la musique'], 'réponses');
  const h = R.map((m) => horodate(m.ts));
  vrai(h.every((x) => x[0] === 2027 && x[1] === 6 && x[2] === 15), 'jour du scénario : ' + JSON.stringify(h));
  vrai(R[0].ts >= E[0].ts + 2 * 60000 && R[1].ts >= R[0].ts + 60000 && R[1].ts < E[0].ts + 60 * 60000, 'ordre et écarts (Inès ≥ 2 min après 9 h 35, Malo ≥ 1 min après Inès) : ' + JSON.stringify(h));
  await pg.click(`${Z} [data-dossier="in"]`);
  egal(await pg.$$eval(`${Z} .ent-mitem .ent-obj`, (L) => L.map((x) => x.innerText.trim()).slice(0, 2)),
    ['RE : Commande pour la Fête de la musique', 'Bon de commande reçu'], 'les réponses en tête de la boîte');
});

// Chaque piège du brief (§8) ne fait tomber que son jalon.
const PIEGES_BON = [
  ['Heineken 30 L × 5', { heineken30: '5' }, ['heineken30'], 19],
  ['Affligem 4', { affligem20: '4' }, ['affligem'], 18],
  ['remplacement « aucun » (0)', { remplacement: 'aucun', remplacementQte: '0' }, ['remplacement'], 17],
  ['Edelweiss × 2', { remplacement: 'edelweiss20' }, ['remplacement'], 17],
  ['Heineken 20 L × 2', { remplacement: 'heineken20' }, ['remplacement'], 17],
  ['Pelforth × 4', { remplacementQte: '4' }, ['remplacement'], 17],
  ['samedi', { jour: '2027-06-19' }, ['jour'], 18],
  ['vides inversés', { videsFuts: '5', videsCasiers: '9' }, ['eau-vides'], 18],
  ['eau 4 casiers', { eau: '4' }, ['eau-vides'], 18],
];
for (const [nom, r, faux, points] of PIEGES_BON) {
  await v(`ENT-6.2 : piège « ${nom} » → seul le jalon ${faux.join(', ')} est faux (${points}/20)`, async () => {
    await monter62({ uid: 'fb62-piege' });
    await remplirBon({ ...BON_JUSTE, ...r });
    await repondreMalo(MSG_JUSTE);
    const n = await note();
    egal(etats62(n), sauf(faux), 'jalons');
    egal(n.score, points, 'note');
  });
}
await v('ENT-6.2 : « Salut Malo ! » → seul le jalon du ton est faux ; « Bisous » et « C’est bon, j’ai noté ta commande. » aussi ; la ligne « vides » fausse ne coûte rien', async () => {
  for (const [ligne, t, faux, points] of [['salutation', 'Salut Malo !', ['msg-ton'], 18], ['fin', 'Bisous', ['msg-ton'], 18],
    ['commande', 'C’est bon, j’ai noté ta commande.', ['msg-ton'], 18], ['vides', 'Gardez vos vides jusqu’à la prochaine fois.', [], 20],
    ['rupture', 'Il ne nous reste que 2 fûts d’Affligem : je vous propose 2 fûts d’Edelweiss à la place.', ['msg-rupture'], 17],
    ['livraison', 'Vous serez livré samedi 19 juin, comme vous le souhaitez.', ['msg-livraison'], 18]]) {
    await monter62({ uid: 'fb62-ton' });
    await remplirBon(BON_JUSTE);
    await repondreMalo({ ...MSG_JUSTE, [ligne]: t });
    const n = await note();
    egal(etats62(n), sauf(faux), `jalons (${ligne} : ${t})`);
    egal(n.score, points, `note (${ligne} : ${t})`);
  }
});

await v('ENT-6.2 : réponse à Malo jamais envoyée → jalons 6 à 8 jamais justes (10/20), pas de réponse de Malo, pas de bandeau', async () => {
  await monter62({ uid: 'fb62-muet' });
  await remplirBon(BON_JUSTE);
  const n = await note();
  egal(n.score, 10, 'note');
  vrai(['msg-rupture', 'msg-livraison', 'msg-ton'].every((j) => n.detail[j] !== 'ok'), 'un jalon du message juste sans envoi : ' + JSON.stringify(n.detail));
  vrai(!(await sujets()).includes('RE : Commande pour la Fête de la musique'), 'réponse de Malo');
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
});

await v('ENT-6.2 : réponse envoyée avant le bon → Malo n’écrit qu’après le bon ; Inès remercie au lieu de redemander', async () => {
  await monter62({ uid: 'fb62-ordre' });
  await repondreMalo(MSG_JUSTE);
  vrai(!(await sujets()).includes('RE : Commande pour la Fête de la musique'), 'Malo répond avant le bon (il dirait la solution)');
  await remplirBon(BON_JUSTE);
  const E = await entrants();
  egal(E.filter((m) => m.subject === 'Bon de commande reçu').map((m) => m.text), ['Bon de commande reçu, merci Lea.\n\nInès'], 'message d’Inès');
  egal(E.filter((m) => m.subject === 'RE : Commande pour la Fête de la musique').length, 1, 'réponse de Malo');
  egal((await note()).score, 18.5, 'note : le point d’étape d’Inès attend encore sa réponse (1,5 point)');
  await aller('etape:avant-reponse');
  await pg.click(`${Z} [data-q-choix="prepa-chauffeur"][data-q="qui-utilise-le-bon"]`);
  await pg.click(`${Z} [data-q-repondre="qui-utilise-le-bon"]`);
  await pause();
  egal((await note()).score, 20, 'note');
});

await v('ENT-6.2 : « Corriger » après le piège Affligem → rouvre le bon (pas la réponse), renvoi juste → accusé d’Inès, note = moyenne (18 + 20) / 2 = 19/20', async () => {
  await monter62({ uid: 'fb62-corr' });
  await remplirBon({ ...BON_JUSTE, affligem20: '4' });
  await repondreMalo(MSG_JUSTE);
  egal(await bandeau(), LIGNES62.map((l) => [l, l === 'heineken30' ? 'ko' : 'ok']), 'bandeau (bloc « les fûts » ✗)');
  await pg.click(`${Z} [data-fin-corriger]`);
  await pause();
  vrai(await present('[data-fiche="bon-de-commande"] [data-fiche-envoyer]'), 'le bon n’est pas rouvert');
  egal(await pg.inputValue(`${Z} [data-fiche-saisie="affligem20"]`), '4', 'la saisie de l’élève est gardée');
  const avant = (await entrants()).length;
  await pg.fill(`${Z} [data-fiche-saisie="affligem20"]`, '2');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  egal((await entrants()).slice(avant).map((m) => [m.from, m.text]), [['Inès', 'Merci Lea, j’ai bien reçu ton bon de commande corrigé.\n\nInès']], 'accusé');
  proche((await note()).score, 19, 'note moyennée');
});

await v('ENT-6.2 : case nombre — vide « manque », négatif et non entier refusés à l’envoi avec la raison ; rien n’est envoyé, la saisie reste', async () => {
  await monter62({ uid: 'fb62-nombre' });
  await remplirBon({ ...BON_JUSTE, heineken30: null, affligem20: '-2', eau: '2,5' }, { confirmer: false });
  const msg = await pg.textContent(`${Z} [data-fiche-manque]`);
  vrai(/Il manque : la ligne « Heineken fût 30 L »/.test(msg), 'case vide : ' + msg);
  vrai(/À corriger : .*FUT-AFF-20 — Affligem Blonde fût 20 L : un nombre positif ou nul est attendu/.test(msg), 'négatif : ' + msg);
  vrai(/CAS-EAU-12 — Eau plate 1 L \(casier de 12\) : un nombre entier est attendu/.test(msg), 'non entier : ' + msg);
  vrai(!(await present('[data-confirme-oui]')), 'confirmation proposée');
  vrai(!((await base()).fiches[`bon-de-commande`] || {}).envoye, 'bon envoyé');
  egal(await pg.inputValue(`${Z} [data-fiche-saisie="affligem20"]`), '-2', 'saisie gardée');
});

await v('ENT-6.2 : sabotage jalon par jalon — sur la base d’un parcours juste, changer ce qu’un jalon lit ne fait tomber que lui', async () => {
  await monter62({ uid: 'fb62-sabo' });
  await remplirBon(BON_JUSTE);
  await repondreMalo(MSG_JUSTE);
  const db = await base();
  const r = await pg.evaluate(async (db) => {
    const S = await import('/contenus/france-boissons-ent62.js');
    const juger = (d) => S.ETAPES.map((e) => [e.id, e.verifier(d).status]);
    const bon = (k, x) => { const d = structuredClone(db); d.fiches['bon-de-commande'].valeurs[k] = x; return juger(d); };
    // Une ligne du message : le DERNIER envoi porte un autre choix (rang dans l'ordre déclaré : 1 = le premier piège).
    const msg = (l) => { const d = structuredClone(db); const o = d.mails.filter((m) => m.folder === 'out').pop(); o.phrases.choix[l] = 1; return juger(d); };
    return { juste: juger(db),
      heineken30: bon('heineken30', '5'), affligem: bon('affligem20', '3'), remplacement: bon('remplacement', 'aucun'),
      qte: bon('remplacementQte', '3'), jour: bon('jour', '2027-06-21'), eau: bon('eau', '0'), vf: bon('videsFuts', '8'), vc: bon('videsCasiers', '4'),
      rupture: msg('rupture'), livraison: msg('livraison'), salutation: msg('salutation'), commande: msg('commande'), fin: msg('fin'), vides: msg('vides') };
  }, db);
  egal(r.juste, sauf([]), 'base juste');
  for (const [cas, faux] of [['heineken30', 'heineken30'], ['affligem', 'affligem'], ['remplacement', 'remplacement'], ['qte', 'remplacement'],
    ['jour', 'jour'], ['eau', 'eau-vides'], ['vf', 'eau-vides'], ['vc', 'eau-vides'], ['rupture', 'msg-rupture'], ['livraison', 'msg-livraison'],
    ['salutation', 'msg-ton'], ['commande', 'msg-ton'], ['fin', 'msg-ton']]) egal(r[cas], sauf([faux]), `sabotage « ${cas} »`);
  egal(r.vides, sauf([]), 'la ligne « vides » du message n’est pas notée');
});

// Les questions au fil d'ENT-6.2 (brief §4 bis) : un cas par question, valeurs écrites à la main.
const repQ = async (id, val) => { await pg.click(`${Z} [data-q-choix="${val}"][data-q="${id}"]`); await pg.click(`${Z} [data-q-repondre="${id}"]`); await pause(); };
await v(`ENT-6.2 : question de Karim au choix du remplacement — le bon se fige jusqu'à la réponse, réflexion non notée (retour sans ✓ / ✗), une seule fois`, async () => {
  await monter62({ uid: 'fb62-karim' });
  await aller('fiche');
  await pg.fill(`${Z} [data-fiche-saisie="heineken30"]`, '6');
  vrai(!(await present('[data-q-panneau]')), 'question avant le geste');
  await pg.selectOption(`${Z} [data-fiche-champ="remplacement"]`, 'edelweiss20');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'pourquoi-ce-remplacement', 'question posée');
  vrai(/Karim te pose une question/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'posée par Karim');
  await repQ('pourquoi-ce-remplacement', 'hasard');
  vrai(!(await present('[data-q-verdict]')) && await present('.qf-retour'), 'réflexion : retour sans ✓ / ✗');
  await pg.click(`${Z} [data-q-reprendre]`);
  await pause();
  await pg.selectOption(`${Z} [data-fiche-champ="remplacement"]`, 'pelforth20');
  await pause();
  vrai(!(await present('[data-q-panneau]')), 'la question revient');
  egal((await note()).score, 0, 'une réflexion ne rapporte rien');
});
await v(`ENT-6.2 : point d'étape d'Inès — arrive après l'envoi du bon, garde « Répondre » fermé ; faux = 1,5 point de moins`, async () => {
  await monter62({ uid: 'fb62-etape' });
  await remplirBon(BON_JUSTE);
  await ouvrirMalo();
  vrai(!(await present('[data-repondre]')) && await present('[data-qf-ferme]'), '« Répondre » fermé');
  await aller('etape:avant-reponse');
  await repQ('qui-utilise-le-bon', 'personne');
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
  await ouvrirMalo();
  vrai(await present('[data-repondre]'), '« Répondre » rouvert après la réponse (fausse)');
  egal((await note()).score, 10, 'jalons du bon seuls (6 + 2 + 2), question fausse');
  await repondreMalo(MSG_JUSTE);
  egal((await note()).score, 18.5, 'tout juste sauf le point d’étape');
});
await v(`ENT-6.2 : question d'Inès au choix de la phrase « livraison » — correction au bilan seulement ; fausse = 18,5 ; question de Lucas au choix de « vides » non notée`, async () => {
  await monter62({ uid: 'fb62-jour' });
  await remplirBon(BON_JUSTE);
  await ouvrirMalo();
  await aller('etape:avant-reponse');
  await repQ('qui-utilise-le-bon', 'prepa-chauffeur');
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
  await ouvrirMalo();
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  await pg.selectOption(`${Z} select[data-phrase="salutation"]`, { label: MSG_JUSTE.salutation });
  await pause();
  vrai(!(await present('[data-q-panneau]')), 'question avant les lignes concernées');
  await pg.selectOption(`${Z} select[data-phrase="livraison"]`, { label: MSG_JUSTE.livraison });
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'jour-engage', 'question d’Inès');
  await repQ('jour-engage', 'malo');
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'pas de ✓ / ✗ avant le bilan');
  await pg.click(`${Z} [data-q-reprendre]`);
  await pause();
  await pg.selectOption(`${Z} select[data-phrase="vides"]`, { label: MSG_JUSTE.vides });
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'vides-faux', 'question de Lucas');
  await repQ('vides-faux', 'malo');
  await pg.click(`${Z} [data-q-reprendre]`);
  await pause();
  for (const l of ['commande', 'rupture', 'fin']) { await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: MSG_JUSTE[l] }); await pause(); }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  egal((await note()).score, 18.5, 'jour-engage faux : 1,5 point de moins, la réflexion de Lucas ne compte pas');
  egal(await bandeau(), LIGNES62.map((l) => [l, l === 'question:jour-engage' ? 'ko' : 'ok']), 'bandeau : la question d’Inès ✗ au bilan');
});

await v('ENT-6.2 : Corrigés — bon de commande et message attendus, calculés', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-6.2.js');
    return C.CORRIGE.items.map((it) => [it.texte, it.rep || it.reponses.map((l) => l.slice(0, 2).join(' = '))]);
  });
  egal(r[0], ['Le bon de commande attendu', ['FUT-HEI-30 — Heineken fût 30 L = 6 fûts', 'FUT-AFF-20 — Affligem Blonde fût 20 L = 2 fûts', 'Remplacement = FUT-PEL-20 — Pelforth Blonde fût 20 L × 2',
    'CAS-EAU-12 — Eau plate 1 L (casier de 12) = 3 casiers', 'Jour de livraison = vendredi 18 juin', 'Vides à reprendre = 9 fûts, 5 casiers']], 'bon attendu');
  egal(r[2][1], 'Bonjour Malo, Votre commande pour la Fête de la musique est bien enregistrée. Il ne nous reste que 2 fûts d’Affligem : '
    + 'je vous propose 2 fûts de Pelforth Blonde 20 L à la place. Vous serez livré vendredi 18 juin, par notre tournée de la côte. '
    + 'Le chauffeur reprendra vos 9 fûts et 5 casiers vides. Cordialement, {prénom}, administration des ventes France Boissons', 'message attendu');
});

await v('ENT-6.2 : références article — uniques, au format du catalogue, lues sur le stock, le bon (cases et liste), le corrigé ; mot « référence » cliquable', async () => {
  const r = await pg.evaluate(async () => {
    const U = await import('/contenus/france-boissons.js');
    return { refs: U.STOCK_BUCHELAY.map((a) => [a.id, a.ref]), lexique: U.LEXIQUE['référence'] || null };
  });
  const FORMAT = /^[A-Z]{3}-[A-Z]{3}-\d{2}$/;
  egal(r.refs.length, 6, 'six articles');
  vrai(r.refs.every(([, ref]) => typeof ref === 'string' && FORMAT.test(ref)), 'format des références : ' + JSON.stringify(r.refs));
  egal(new Set(r.refs.map(([, ref]) => ref)).size, r.refs.length, 'références uniques');
  egal(r.refs, [['heineken30', 'FUT-HEI-30'], ['affligem20', 'FUT-AFF-20'], ['pelforth20', 'FUT-PEL-20'], ['edelweiss20', 'FUT-EDE-20'], ['heineken20', 'FUT-HEI-20'], ['eau', 'CAS-EAU-12']], 'références choisies');
  vrai(!!r.lexique && /Code unique/.test(r.lexique), 'entrée « référence » du lexique');
  await monter62();
  await ouvrirMalo();
  await pg.click(`${Z} [data-pj="stock"]`);
  await pause();
  // (le premier titre est un mot cliquable : sa définition est dans le même élément, d'où le « startsWith »)
  const th = await pg.$$eval(`${Z} .ent-doc th`, (L) => L.map((x) => x.textContent));
  egal([th.length, th[0].startsWith('Référence'), th.slice(1)], [4, true, ['Article', 'Format', 'Disponible']], 'colonnes du stock (référence en premier)');
  egal(await pg.$$eval(`${Z} .ent-doc [data-stock] td:first-child`, (L) => L.map((x) => x.innerText)),
    ['FUT-HEI-30', 'FUT-AFF-20', 'FUT-PEL-20', 'FUT-EDE-20', 'FUT-HEI-20', 'CAS-EAU-12'], 'références du stock');
  vrai(!!(await pg.$(`${Z} .ent-doc th [data-lex="référence"]`)), 'mot « référence » cliquable dans le stock');
  await aller('fiche');
  const txt = await texte();
  for (const t of ['FUT-HEI-30 — Heineken fût 30 L', 'FUT-AFF-20 — Affligem Blonde fût 20 L', 'CAS-EAU-12 — Eau plate 1 L (casier de 12)']) vrai(txt.includes(t), 'libellé du bon : ' + t);
  egal(await pg.$$eval(`${Z} [data-fiche-champ="remplacement"] option`, (L) => L.map((x) => x.textContent)),
    ['Choisir…', 'Aucun', 'FUT-PEL-20 — Pelforth Blonde fût 20 L', 'FUT-EDE-20 — Edelweiss fût 20 L', 'FUT-HEI-20 — Heineken fût 20 L'], 'liste de remplacement');
  const malo = (await entrants())[1].text;
  vrai(!/[A-Z]{3}-[A-Z]{3}-\d{2}/.test(malo), 'le mail de Malo ne cite pas de référence');
});

await v('ENT-6.2 : enseignant — la séance s’ouvre (bon de commande, documents), rien ne remonte au suivi', async () => {
  await monter62({ uid: 'fb62-prof', role: 'prof' });
  await aller('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.length), 4, 'documents du bon');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'scores remontés');
});

// ── Étape A (10/10/2026) : la banque d'« Avant de commencer » d'ENT-6.2 (10 questions, 5 tirées par élève) ────────────────
// Réponses justes (écrites à la main) : qui-est-malo 'client', format-fut 'litres', bon-sert 'livrer', ou-regarder 'stock-cond' (préparation) ;
// les-vides 'consignes', tireuse 'fut' (image) ; vente-conclue 'acceptation', consigne-rendue '92', offre-ines 'offre', cgv-communiquer
// 'communiquer' (droit). Tirage : 2 + 2 + 1. Consigne rendue : 40 € par fût et 4 € par casier (arrêté du 6/02/2026), f de 1 à 6 fûts,
// c de 1 à 8 casiers, jamais 9 fûts et 5 casiers (les vides de Malo).
const PREP62 = ['qui-est-malo', 'format-fut', 'bon-sert', 'ou-regarder'], IMG62 = ['les-vides', 'tireuse'];
const DROIT62 = ['vente-conclue', 'consigne-rendue', 'offre-ines', 'cgv-communiquer'];
const REP62 = { 'qui-est-malo': 'client', 'format-fut': 'litres', 'bon-sert': 'livrer', 'ou-regarder': 'stock-cond', 'les-vides': 'consignes', tireuse: 'fut',
  'vente-conclue': 'acceptation', 'consigne-rendue': '92', 'offre-ines': 'offre', 'cgv-communiquer': 'communiquer' };
const tirage62 = async () => (await base()).questions[ID62]['@tirage'];
async function repondreOuverture62(rep = REP62) {
  const ids = (await tirage62()).ids;
  for (let k = 0; k < ids.length; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await pg.click(`${Z} [data-q-choix="${rep[ids[k]]}"][data-q="${ids[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${ids[k]}"]`);
    await pause();
  }
}

await v('ENT-6.2 : « Avant de commencer » (banque) — 5 questions tirées par élève (2 préparation + 2 droit + 1 image), la calculette ; deux élèves n’ont pas tous les mêmes ; réponses justes → menu ouvert, rien dans la note ; puis parcours juste 20/20', async () => {
  await nettoyerCalc();
  await monter62({ sansOuverture: true, tirageReel: true, uid: 'fb62-banque' });
  vrai(await present('[data-ouverture="avant-de-commencer"]'), 'la séance ne s’ouvre pas sur « Avant de commencer »');
  const ids = (await tirage62()).ids;
  egal([ids.filter((i) => PREP62.includes(i)).length, ids.filter((i) => IMG62.includes(i)).length, ids.filter((i) => DROIT62.includes(i)).length], [2, 1, 2], 'répartition 2 + 2 + 1 : ' + ids);
  egal(await pg.$$eval(`${Z} .qo-pas`, (L) => L.length), 5, 'questions');
  vrai(await calcPresente(), 'la calculette est absente de l’écran');
  await repondreOuverture62();
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('fiche'), 'menu fermé après les cinq réponses justes');
  egal([(await note()).score, (await note()).max], [0, 20], 'note : l’ouverture ne compte pas');
  await aller('accueil');
  vrai(!(await calcPresente()), 'la calculette flotte encore sur l’accueil');
  await remplirBon(BON_JUSTE);
  await repondreMalo(MSG_JUSTE);
  egal((await note()).score, 20, 'note du parcours juste');
  // Deux élèves : pas les mêmes questions (au moins une différente), et la photo de la tireuse se charge chez celui qui l'a reçue.
  const R = [];
  let photo = 0;
  for (const uid of ['b1', 'b2', 'b3', 'b4', 'b5', 'b6']) {
    await monter62({ sansOuverture: true, tirageReel: true, uid });
    const t = await tirage62();
    R.push(t.ids.slice().sort().join());
    const k = t.ids.indexOf('tireuse');
    if (k >= 0) {
      await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
      vrai(await pg.$$eval(`${Z} .qo-feuille img`, (L) => L.length === 1 && L.every((i) => i.complete && i.naturalWidth > 0)), 'la photo de la tireuse ne se charge pas');
      vrai(/Photo : Travis Fish, Unsplash/.test(await pg.textContent(`${Z} .qo-feuille`)), 'crédit de la photo');
      photo += 1;
    }
  }
  vrai(new Set(R).size > 1, 'six élèves ont exactement les mêmes questions');
  vrai(photo >= 1, 'personne n’a reçu la question de la tireuse sur six élèves');
  await nettoyerCalc();
});

await v('ENT-6.2 : le tirage de l’ouverture — toute la banque sort sur 300 graines, toujours 2 + 2 + 1 ; consigne-rendue (f de 1 à 6 fûts, c de 1 à 8 casiers, jamais 9 et 5) juste pour 50 graines', async () => {
  const r = await pg.evaluate(async () => {
    const { compilerQuestions, tirerOuverture } = await import('/core/types/questions.js');
    const { QUESTIONS } = await import('/contenus/questions/ENT-6.2.js');
    const M = compilerQuestions(QUESTIONS, null, ['commande-malo', 'fiche-client', 'stock', 'conditions', 'droit']);
    const T = [];
    for (let s = 0; s < 300; s++) { const t = tirerOuverture(M, `graine-${s}`); T.push({ ids: t.ids, q: t.q }); }
    return T;
  });
  for (const t of r) {
    egal([t.ids.filter((i) => PREP62.includes(i)).length, t.ids.filter((i) => IMG62.includes(i)).length, t.ids.filter((i) => DROIT62.includes(i)).length], [2, 1, 2], 'répartition : ' + t.ids);
  }
  egal([...new Set(r.flatMap((t) => t.ids))].sort(), [...PREP62, ...IMG62, ...DROIT62].sort(), 'toute la banque sort');
  const C = r.filter((t) => t.q['consigne-rendue']).slice(0, 50);
  vrai(C.length === 50, 'moins de 50 tirages à valeurs : ' + C.length);
  for (const t of C) {
    const m = /rend au chauffeur (\d+) fûts? vides? et (\d+) casiers? vides?/.exec(t.q['consigne-rendue'].enonce);
    vrai(!!m, 'énoncé illisible : ' + t.q['consigne-rendue'].enonce);
    const f = Number(m[1]), c = Number(m[2]);
    vrai(f >= 1 && f <= 6 && c >= 1 && c <= 8 && !(f === 9 && c === 5), `valeurs hors plage : ${f} fûts, ${c} casiers`);
    const L = t.q['consigne-rendue'].libs;
    egal(L['92'], `${f * 40 + c * 4} € (${f} × 40 € + ${c} × 4 €)`, 'bonne réponse (clé 92)');
    vrai(L['80'].startsWith(`${f * 40} € :`), 'piège « fûts seuls » : ' + L['80']);
    vrai(L['0'].startsWith('0 € :'), 'piège « 0 € »');
    vrai(new Set(Object.values(L)).size === 3, 'choix identiques');
    vrai(t.q['consigne-rendue'].retour.includes(`soit ${f * 40 + c * 4} €`), 'retour : ' + t.q['consigne-rendue'].retour);
  }
  vrai(new Set(C.map((t) => t.q['consigne-rendue'].enonce)).size > 10, 'les valeurs ne varient pas assez');
});

await v('ENT-6.2 : « Le droit » — l’article 1113 et l’article L441-1 (source Légifrance) ; les questions d’ouverture citent un texte qui y est', async () => {
  await monter62({ sansOuverture: true, tirageReel: true, uid: 'fb62-droit' });
  await pg.click(`${Z} [data-ouv-doc="droit"]`); await pause();
  const t = await pg.textContent(`${Z} .qo-feuille`);
  vrai(/article 1113/.test(t) && /L441-1/.test(t) && /tout acheteur qui en fait la demande pour une activité professionnelle/.test(t), 'textes de loi : ' + t.slice(0, 200));
  vrai(/Texte de loi \(réel\) — source : Légifrance/.test(t), 'source');
  await nettoyerCalc();
});

await v('ENT-6.2 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

// ── ENT-6.3 : les congés d'été (brief `docs/briefs/ENT-6.3-france-boissons-conges.md`, rapport du lot 0) ─────────────────────────
// Même montage (la vraie séance, `activites/france-boissons-conges.js`), de vrais clics. Valeurs ÉCRITES À LA MAIN (calage du lot 0,
// `docs/briefs/france-boissons/calage-6.3.mjs`, relancé le 10/10/2026) :
//   colonnes S1 (5 juillet) à S9 (30 août) = rangs 0 à 8 ; 1er envoi juste : Amandine 2, Sébastien 4, Lucas 0 (décalé), Fatou 5,
//   Yoann 6, Kevin 7, Julien 4 ; après l'imprévu (Kevin parti, saisonnier S2-S8) : Lucas 7 (S8-S9), le reste inchangé.
//   Calage : 1er envoi 331 776 façons, 16 206 valides, minimum 1 congé décalé, 1 solution ; après l'imprévu 36 864, 1 818, 1, 1.
// Jalons : v1-/v2- effectif, cote, julien, priorite, minimum (planning) ; annonce-intitule, -contrat, -dates, -rattache ; mention-permis,
// -age, -manutention, -sexe, -nationalite, -lieu, -famille, -horaires ; msg-decision, -raison, -proposition, -salutation, -fin ;
// question:pourquoi-cdd, question:age-candidat (1,5 chacune). Poids validés par Tristan (10/10/2026), écrits à la main ci-dessous.

const ID63 = 'france-boissons-conges';
const REP63 = { 'qui-decide-conges-2': 'karim', 'besoin-semaine': 'travail', 'demande-ancienne': 'premier', 'annonce-sert': 'candidatures',
  'conges-acquis': '25', 'plafond-30': '30', 'bloc-24-jours': 'non24', 'essai-cdd': 'jours' };
const PREP63 = ['qui-decide-conges-2', 'besoin-semaine', 'demande-ancienne', 'annonce-sert'];
const DROIT63 = ['conges-acquis', 'plafond-30', 'bloc-24-jours', 'essai-cdd'];
const monter63 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-conges.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['france-boissons-conges'] = db.questions['france-boissons-conges'] || {});
    for (const [id, v] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: v, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb63' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep: REP63 });

const PLAN1 = { 'conge-amandine': 2, 'conge-sebastien': 4, 'conge-lucas': 0, 'conge-fatou': 5, 'conge-yoann': 6, 'conge-kevin': 7, 'conge-julien': 4 };
const qui63 = (id) => id.replace('conge-', '');
const BONNES63 = { 'que-regardes-tu': 'besoin', 'depart-kevin': 'demission', 'pourquoi-raison': 'comprendre', 'pourquoi-cdd': 'saison', 'age-candidat': 'non' };
const FAUSSES63 = { 'que-regardes-tu': 'rien', 'depart-kevin': 'sanction', 'pourquoi-raison': 'inutile', 'pourquoi-cdd': 'cout', 'age-candidat': 'physique' };
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un.
async function qrep63(choix = BONNES63) {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
// Pose une carte (clic sur la carte, puis sur la case de sa ligne), puis répond à la question au fil si elle arrive.
async function poser63(id, t, choix) {
  await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${qui63(id)}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause();
  await qrep63(choix);
}
async function envoyerPlanning63() {
  await pg.click(`${Z} [data-pl="envoyer"]`);
  const c = await pg.waitForSelector(`${Z} [data-confirme]`, { timeout: 3000 }).catch(() => null);
  if (!c) throw new Error('pas de confirmation avant l’envoi du planning');
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
// Le point d'étape d'Inès après le 1er envoi (réflexion), puis « Continuer ».
async function etape63(v = 'demission') {
  await aller('etape:avant-reprise');
  await pg.click(`${Z} [data-q-choix="${v}"][data-q="depart-kevin"]`);
  await pg.click(`${Z} [data-q-repondre="depart-kevin"]`);
  await pause();
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
}
// Les deux plannings : `p1` (1er envoi) ; `p2` : les cartes à déplacer après l'imprévu (rien = renvoyé tel quel).
const PLAN2 = { 'conge-amandine': 2, 'conge-sebastien': 4, 'conge-lucas': 7, 'conge-fatou': 5, 'conge-yoann': 6, 'conge-julien': 4 };
async function plannings63(p1 = PLAN1, p2 = PLAN2, choix = BONNES63) {
  await aller('planning');
  for (const [id, t] of Object.entries(p1)) await poser63(id, t, choix);
  await envoyerPlanning63();
  await etape63(choix['depart-kevin']);
  await aller('planning');
  for (const [id, t] of Object.entries(p2)) await poser63(id, t, choix);
  await envoyerPlanning63();
}
const MSG63 = {
  salutation: 'Bonjour Lucas,',
  decision: 'Ton congé du 12 au 23 juillet ne peut pas être accordé.',
  raison: 'Avec le départ de Kevin, il faut six chauffeurs chaque semaine de juillet, et Amandine avait demandé la semaine du 19 juillet avant toi.',
  proposition: 'Karim te propose du 23 août au 3 septembre.',
  fin: 'Je reste à ta disposition. Cordialement, Lea, pour Inès',
};
async function ouvrir63(subject) {
  await aller('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  const id = await pg.evaluate((s) => window.__f.db.mails.filter((m) => m.folder === 'in' && m.subject === s).pop().id, subject);
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pause();
}
// Répond par phrases au message `subject` : `m` = { ligne: texte choisi }.
async function phrases63(subject, m, choix = BONNES63) {
  await ouvrir63(subject);
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  for (const [l, t] of Object.entries(m)) { await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t }); await pause(); await qrep63(choix); }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
const ANN63 = { intitule: 'vl', contrat: 'cdd', dates: 'juste', rattache: 'karim',
  mentions: { permis: true, age: false, manutention: true, sexe: false, nationalite: false, lieu: true, famille: false, horaires: true } };
async function annonce63(a = ANN63, choix = BONNES63) {
  await aller('fiche');
  for (const k of ['intitule', 'dates', 'rattache']) await pg.selectOption(`${Z} [data-fiche-champ="${k}"]`, a[k]);
  await pg.check(`${Z} [data-fiche-champ="contrat"][value="${a.contrat}"]`);
  for (const [id, oui] of Object.entries(a.mentions)) await pg.click(`${Z} [data-ouinon="mentions|${id}|ecrire|${oui ? 1 : 0}"]`);
  await pause();
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  if (choix) await qrep63(choix);
}
const JALONS63 = ['v1-effectif', 'v1-cote', 'v1-julien', 'v1-priorite', 'v1-minimum', 'v2-effectif', 'v2-cote', 'v2-julien', 'v2-priorite', 'v2-minimum',
  'annonce-intitule', 'annonce-contrat', 'annonce-dates', 'annonce-rattache', 'mention-permis', 'mention-age', 'mention-manutention', 'mention-sexe',
  'mention-nationalite', 'mention-lieu', 'mention-famille', 'mention-horaires', 'msg-decision', 'msg-raison', 'msg-proposition', 'msg-salutation', 'msg-fin'];
const POIDS63 = { 'v1-effectif': 1, 'v1-cote': 0.5, 'v1-julien': 0.5, 'v1-priorite': 1.5, 'v1-minimum': 1, 'v2-effectif': 1.5, 'v2-cote': 0.5, 'v2-julien': 0.5,
  'v2-priorite': 1.5, 'v2-minimum': 1.5, 'annonce-intitule': 0.5, 'annonce-contrat': 0.5, 'annonce-dates': 0.25, 'annonce-rattache': 0.25,
  'mention-permis': 0.25, 'mention-age': 0.5, 'mention-manutention': 0.25, 'mention-sexe': 0.5, 'mention-nationalite': 0.5, 'mention-lieu': 0.25,
  'mention-famille': 0.5, 'mention-horaires': 0.25, 'msg-decision': 0.5, 'msg-raison': 0.5, 'msg-proposition': 0.5, 'msg-salutation': 0.5, 'msg-fin': 0.5 };
const LIGNES63 = ['v1-effectif', 'v2-effectif', 'annonce-intitule', 'mention-permis', 'msg-decision', 'msg-salutation', 'question:pourquoi-cdd', 'question:age-candidat'];
const etats63 = (n) => JALONS63.map((j) => [j, n.detail[j]]);
const sauf63 = (faux, etat = 'ko') => JALONS63.map((j) => [j, faux.includes(j) ? etat : 'ok']);
const points63 = (faux) => 20 - faux.reduce((s, j) => s + (POIDS63[j] || 1.5), 0);
// Le parcours entier, avec des écarts : `p1`, `p2` (plannings), `msg` (lignes changées), `ann` (annonce changée), `choix` (questions).
async function parcours63(o = {}) {
  await monter63({ uid: o.uid || 'fb63' });
  await plannings63(o.p1, o.p2, o.choix || BONNES63);
  await phrases63('Mon congé d’été', { ...MSG63, ...(o.msg || {}) }, o.choix || BONNES63);
  await annonce63({ ...ANN63, ...(o.ann || {}), mentions: { ...ANN63.mentions, ...((o.ann || {}).mentions || {}) } }, o.choix || BONNES63);
  return note();
}

await v('ENT-6.3 : calage — 331 776 façons au 1er envoi, 16 206 valides, minimum 1 congé décalé, une seule solution (Lucas S1-S2) ; après l’imprévu 36 864, 1 818, 1, une seule (Lucas S8-S9) ; jugées par le vrai moteur', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent63.js');
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const place = (pl) => Object.fromEntries(Object.entries(pl).map(([id, s]) => [id, { r: id.replace('conge-', ''), s }]));
    const juge = (v1, v2) => Object.fromEntries(jalonsPlanning({ plannings: { 'fb-conges': { v1: { place: place(v1) }, ...(v2 ? { v2: { place: place(v2) } } : {}) } } }, S.PLANNING).L
      .map((l) => [l.id, l.ok]));
    return { c1: S.calage(S.donneesBrutes(1)), c2: S.calage(S.donneesBrutes(2)), sol: S.SOLUTIONS,
      juste: juge(S.SOLUTIONS.v1[0], S.SOLUTIONS.v2[0]),
      amandine: [0, 3, 8].map((s) => juge({ ...S.SOLUTIONS.v1[0], 'conge-lucas': 1, 'conge-amandine': s })),
      naif: juge(Object.fromEntries(S.DEMANDES.map((c) => [c.id, c.date]))) };
  });
  egal(r.c1, { facons: 331776, valides: 16206, minimum: 1, justes: 1 }, 'calage du 1er envoi');
  egal(r.c2, { facons: 36864, valides: 1818, minimum: 1, justes: 1 }, 'calage après l’imprévu');
  egal(r.sol.v1, [{ 'conge-amandine': 2, 'conge-sebastien': 4, 'conge-lucas': 0, 'conge-fatou': 5, 'conge-yoann': 6, 'conge-kevin': 7, 'conge-julien': 4 }], 'solution du 1er envoi');
  egal(r.sol.v2, [{ 'conge-amandine': 2, 'conge-sebastien': 4, 'conge-lucas': 7, 'conge-fatou': 5, 'conge-yoann': 6, 'conge-julien': 4 }], 'solution après l’imprévu');
  egal(Object.values(r.juste), Array(10).fill(true), 'la solution juste, jugée par le moteur');
  // Amandine décalée (S1, S4 ou S9) à la place de Lucas : seule la priorité tombe.
  for (const j of r.amandine) egal([j['v1-effectif'], j['v1-cote'], j['v1-julien'], j['v1-priorite'], j['v1-minimum']], [true, true, true, false, true], 'Amandine décalée');
  // Tout à la date demandée : l'effectif manque ; priorité et minimum (reliés à l'effectif) ne sont pas gratuits.
  egal([r.naif['v1-effectif'], r.naif['v1-priorite'], r.naif['v1-minimum']], [false, false, false], 'tout à sa date');
});

await v('ENT-6.3 : ouverture — message d’Inès et ses pièces ; menu = Accueil, Messagerie, Planning des congés, Annonce (fermée) ; Kevin et la 9e semaine sur la grille, pas de « Vérifier »', async () => {
  await monter63({ uid: 'fb63-ouv' });
  const E = await entrants();
  egal(E.map((m) => [m.subject, m.pieces]), [['Les congés d’été des chauffeurs', ['cartes', 'regle', 'organigramme', 'annuaire']]], 'messages');
  egal(horodate(E[0].ts), [2027, 6, 15, 14, 5], 'heure du scénario');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue).filter((x) => x !== 'accueil')), ['ouverture', 'mail', 'planning'], 'menu ouvert');
  vrai(await present('[data-vue-fermee="fiche"]'), 'l’annonce n’est pas fermée avant la réponse à Lucas');
  await aller('planning');
  egal(await pg.$$eval(`${Z} [data-pl-grille] .pl-tete`, (L) => L.map((x) => x.textContent.trim())),
    ['S1 · 5 juil.', 'S2 · 12 juil.', 'S3 · 19 juil.', 'S4 · 26 juil.', 'S5 · 2 août', 'S6 · 9 août', 'S7 · 16 août', 'S8 · 23 août', 'S9 · 30 août'], 'semaines');
  egal(await pg.$$eval(`${Z} [data-pl-compte="besoin"]`, (L) => L.map((x) => x.textContent)), ['6', '6', '6', '6', '5', '5', '5', '5', '0'], 'besoin');
  egal((await pg.$$(`${Z} [data-pl-bac] [data-pl-id]`)).length, 7, 'cartes');
  vrai(!(await present('[data-pl="verifier"]')), 'bouton « Vérifier »');
  vrai(/Kevin/.test(await pg.textContent(`${Z} [data-pl-grille]`)), 'ligne de Kevin');
});

await v('ENT-6.3 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau', async () => {
  await monter63({ uid: 'fb63-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
});

await v('ENT-6.3 : parcours juste — 20/20 ; Kevin retiré et saisonnier à l’imprévu ; Lucas répond déçu en reprenant le message ; Karim transmet l’annonce à Hélène ; bandeau 8 lignes ✓ ; séance finie (photo)', async () => {
  await monter63({ uid: 'fb63-juste' });
  await aller('planning');
  for (const [id, t] of Object.entries(PLAN1)) await poser63(id, t);
  await envoyerPlanning63();
  vrai((await entrants()).some((m) => m.subject === 'Kevin nous quitte : planning à reprendre' && /lundi 12 juillet/.test(m.text)), 'message de l’imprévu');
  await etape63();
  await aller('planning');
  vrai(!(await present('[data-pl-id="conge-kevin"]')) && !(await present('[data-pl-case][data-r="kevin"]')), 'Kevin encore là après l’imprévu');
  egal(await pg.$$eval(`${Z} [data-pl-case][data-r="saisonnier"]`, (L) => L.map((x) => x.textContent.trim())), ['pas là', '', '', '', '', '', '', '', 'pas là'], 'saisonnier S2 à S8');
  await poser63('conge-lucas', 7);
  await envoyerPlanning63();
  vrai(await present('[data-vue-fermee="fiche"]'), 'l’annonce s’ouvre avant la réponse à Lucas');
  await phrases63('Mon congé d’été', MSG63);
  const L = (await entrants()).filter((m) => m.subject === 'RE : Mon congé d’été');
  egal(L.map((m) => m.text), ['Pas accordé… Dommage, j’avais déjà prévenu ma famille. Du 23 août au 3 septembre, c’est tard, mais je prends.\n\nLucas'], 'réponse de Lucas');
  // La réponse de l'élève à Lucas : non notée, n'importe laquelle.
  await phrases63('RE : Mon congé d’été', { comprendre: 'Ce n’est pas mon problème.', suite: 'Inès va tout arranger.', 'au-revoir': 'Bisous' });
  await annonce63();
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(etats63(n), sauf63([]), 'jalons');
  egal(await bandeau(), LIGNES63.map((l) => [l, 'ok']), 'bandeau');
  egal((await entrants()).filter((m) => m.subject === 'RE : L’annonce du chauffeur saisonnier').map((m) => m.text), ['Merci, je la transmets à Hélène pour validation.\n\nKarim'], 'réponse de Karim');
  vrai(!!(await base()).points[ID63], 'photo de fin');
});

await v('ENT-6.3 : planning du 1er envoi renvoyé tel quel après l’imprévu → les cinq jalons d’après l’imprévu faux (effectif compris), ceux du 1er envoi justes', async () => {
  const n = await parcours63({ uid: 'fb63-tel-quel', p2: {} });
  const V2 = JALONS63.filter((j) => j.startsWith('v2-'));
  egal(etats63(n), sauf63(V2), 'jalons');
  egal(n.score, points63(V2), 'note');
});

await v('ENT-6.3 : Amandine décalée en S1 au lieu de Lucas → seule la priorité du 1er envoi est fausse', async () => {
  const n = await parcours63({ uid: 'fb63-amandine', p1: { ...PLAN1, 'conge-lucas': 1, 'conge-amandine': 0 } });
  egal(etats63(n), sauf63(['v1-priorite']), 'jalons');
  egal(n.score, 18.5, 'note');
});

await v('ENT-6.3 : six congés décalés « chacun bloqué par les autres » (effectif tenu) → « le moins de congés décalés » faux au 1er envoi', async () => {
  const P6 = { 'conge-julien': 4, 'conge-amandine': 0, 'conge-sebastien': 1, 'conge-lucas': 3, 'conge-fatou': 6, 'conge-yoann': 5, 'conge-kevin': 5 };
  const n = await parcours63({ uid: 'fb63-six', p1: P6 });
  egal(etats63(n), sauf63(['v1-minimum']), 'jalons');
  egal(n.score, 19, 'note');
});

const PIEGES63 = [
  ['« Moins de 30 ans » à écrire', { ann: { mentions: { age: true } } }, ['mention-age']],
  ['CDI', { ann: { contrat: 'cdi' } }, ['annonce-contrat']],
  ['dates sans fin, rattaché à Inès', { ann: { dates: 'sans-fin', rattache: 'ines' } }, ['annonce-dates', 'annonce-rattache']],
  ['« Ton congé est annulé »', { msg: { decision: 'Ton congé du 12 au 23 juillet est annulé.' } }, ['msg-decision']],
  ['« Salut Lucas ! » et « Bisous »', { msg: { salutation: 'Salut Lucas !', fin: 'Bisous' } }, ['msg-salutation', 'msg-fin']],
];
for (const [nom, o, faux] of PIEGES63) {
  await v(`ENT-6.3 : piège ${nom} → seul${faux.length > 1 ? 's' : ''} ${faux.join(', ')} faux (${points63(faux)}/20)`, async () => {
    const n = await parcours63({ uid: 'fb63-piege', ...o });
    egal(etats63(n), sauf63(faux), 'jalons');
    egal(n.score, points63(faux), 'note');
  });
}

await v('ENT-6.3 : Lucas reprend ce qu’on lui a écrit, sans corriger (« Accepté ? », « du 5 au 16 juillet »)', async () => {
  await monter63({ uid: 'fb63-lucas' });
  await plannings63();
  await phrases63('Mon congé d’été', { ...MSG63, decision: 'Ton congé du 12 au 23 juillet est accepté.', proposition: 'Karim te propose du 5 au 16 juillet.' });
  egal((await entrants()).filter((m) => m.subject === 'RE : Mon congé d’été').map((m) => m.text),
    ['Accepté ? Super, merci ! Du 5 au 16 juillet, je vais voir si je peux changer mes réservations.\n\nLucas'], 'réponse de Lucas');
  vrai(!(await present('[data-vue-fermee="fiche"]')), 'l’annonce reste fermée après la réponse à Lucas');
});

await v('ENT-6.3 : le point d’étape d’Inès garde le planning de la reprise fermé jusqu’à la réponse (réflexion, jamais notée) ; « Continuer » rouvre', async () => {
  await monter63({ uid: 'fb63-etape' });
  await aller('planning');
  for (const [id, t] of Object.entries(PLAN1)) await poser63(id, t);
  await envoyerPlanning63();
  vrai(await present('[data-vue-fermee="planning"]'), 'le planning n’est pas fermé par le point d’étape');
  await etape63('sanction');
  vrai(!(await present('[data-vue-fermee="planning"]')), 'le planning reste fermé après la réponse');
  await aller('planning');
  vrai(await present('[data-planning="fb-conges"][data-pl-phase="2"]'), 'le planning de la reprise ne s’ouvre pas');
  vrai(!Object.keys((await note()).detail).includes('question:depart-kevin'), 'la question du départ de Kevin est notée');
});

await v('ENT-6.3 : à l’envoi de l’annonce, Karim pose ses deux questions l’une après l’autre (CDD saisonnier, puis l’âge) ; corrigées au bilan ; fausses → 17/20', async () => {
  await monter63({ uid: 'fb63-karim' });
  await plannings63();
  await phrases63('Mon congé d’été', MSG63);
  await annonce63(ANN63, null);   // aucune réponse automatique : on répond à la main
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'pourquoi-cdd', 'première question');
  await pg.click(`${Z} [data-q-choix="cout"][data-q="pourquoi-cdd"]`);
  await pg.click(`${Z} [data-q-repondre="pourquoi-cdd"]`);
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'corrigée tout de suite');
  await pg.click(`${Z} [data-q-reprendre]`);
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'age-candidat', 'seconde question');
  await qrep63(FAUSSES63);
  egal((await note()).score, 17, 'les deux questions fausses : 3 points de moins');
  egal(await bandeau(), LIGNES63.map((l) => [l, l.startsWith('question:') ? 'ko' : 'ok']), 'bandeau');
});

await v('ENT-6.3 : pire cas — plannings envoyés vides, tout faux (questions comprises) → premier bilan sans l’enseignant, 0/20, 8 lignes ✗, photo rangée', async () => {
  await monter63({ uid: 'fb63-pire' });
  await aller('planning');
  await envoyerPlanning63();
  await etape63('sanction');
  await aller('planning');
  await envoyerPlanning63();
  await phrases63('Mon congé d’été', { salutation: 'Salut Lucas !', decision: 'Ton congé du 12 au 23 juillet est accepté.', raison: 'Karim ne veut pas que tu partes du 12 au 23 juillet.',
    proposition: 'Tu n’auras pas de congé cet été.', fin: 'Bisous' }, FAUSSES63);
  await annonce63({ intitule: 'pl', contrat: 'stage', dates: 'tot', rattache: 'nadia',
    mentions: { permis: false, age: true, manutention: false, sexe: true, nationalite: true, lieu: false, famille: true, horaires: false } }, FAUSSES63);
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  egal(etats63(n), sauf63(JALONS63), 'jalons');
  egal(await bandeau(), LIGNES63.map((l) => [l, 'ko']), 'bandeau');
  vrai(await present('[data-fin]'), 'pas de bandeau de fin');
  vrai(!!(await base()).points[ID63], 'pas de photo : la séance suivante ne s’ouvrirait pas');
});

await v('ENT-6.3 : « Avant de commencer » — 4 questions tirées (2 + 2), la calculette ; deux élèves n’ont pas toutes les mêmes ; menu ouvert après les réponses', async () => {
  await nettoyerCalc();
  await monter63({ sansOuverture: true, uid: 'fb63-ouv-1' });
  vrai(await present('[data-ouverture="avant-de-commencer"]'), 'la séance ne s’ouvre pas sur « Avant de commencer »');
  vrai(await calcPresente(), 'calculette absente');
  const t1 = (await base()).questions[ID63]['@tirage'].ids;
  egal([t1.filter((i) => PREP63.includes(i)).length, t1.filter((i) => DROIT63.includes(i)).length, t1.length], [2, 2, 4], 'répartition : ' + t1);
  for (let k = 0; k < t1.length; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await pg.click(`${Z} [data-q-choix="${REP63[t1[k]]}"][data-q="${t1[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${t1[k]}"]`);
    await pause();
  }
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('planning'), 'menu fermé après les réponses');
  egal((await note()).score, 0, 'l’ouverture ne compte pas');
  const R = new Set();
  for (const uid of ['fb63-a', 'fb63-b', 'fb63-c', 'fb63-d']) { await monter63({ sansOuverture: true, uid }); R.add((await base()).questions[ID63]['@tirage'].ids.slice().sort().join()); }
  vrai(R.size > 1, 'quatre élèves ont exactement les mêmes questions');
  await nettoyerCalc();
});

await v('ENT-6.3 : banque d’ouverture — toute la banque sort sur 300 graines ; valeurs tirées justes pour 50 graines (demande-ancienne, conges-acquis, plafond-30, essai-cdd)', async () => {
  const r = await pg.evaluate(async () => {
    const { compilerQuestions, tirerOuverture } = await import('/core/types/questions.js');
    const { QUESTIONS } = await import('/contenus/questions/ENT-6.3.js');
    const M = compilerQuestions(QUESTIONS, null, ['cartes', 'regle', 'annuaire', 'fiche-de-poste', 'droit']);
    const T = [];
    for (let s = 0; s < 300; s++) { const t = tirerOuverture(M, `graine-${s}`); T.push({ ids: t.ids, q: t.q }); }
    return T;
  });
  egal([...new Set(r.flatMap((t) => t.ids))].sort(), [...PREP63, ...DROIT63].sort(), 'toute la banque sort');
  const MOIS = { février: 1, mars: 2, avril: 3, mai: 4 };
  const de = (id) => r.filter((t) => t.q[id]).slice(0, 50).map((t) => t.q[id]);
  const n = (x) => String(x).replace('.', ',');
  for (const [id, verifier] of [
    ['demande-ancienne', (q) => {
      const m = /(\S+) a demandé le (1er|\d+) (\S+), (\S+) le (1er|\d+) (\S+)\./.exec(q.enonce);
      vrai(!!m, 'énoncé : ' + q.enonce);
      const d = (j, mo) => MOIS[mo] * 100 + (j === '1er' ? 1 : Number(j));
      vrai(MOIS[m[3]] >= 2 && MOIS[m[6]] >= 2, 'mois hors de mars à mai : ' + q.enonce);
      const [premier, second] = d(m[2], m[3]) < d(m[5], m[6]) ? [m[1], m[4]] : [m[4], m[1]];
      egal([q.libs.premier, q.libs.second], [premier, second], 'qui garde sa date');
      vrai(!['Lucas', 'Amandine', 'Julien', 'Sébastien', 'Fatou', 'Yoann', 'Kevin'].includes(premier) && !['Lucas', 'Amandine', 'Julien', 'Sébastien', 'Fatou', 'Yoann', 'Kevin'].includes(second), 'prénom de l’équipe');
    }],
    ['conges-acquis', (q) => {
      const m = Number(/depuis (\d+) mois/.exec(q.enonce)[1]);
      vrai(m >= 2 && m <= 10 && m % 2 === 0, 'mois : ' + m);
      egal([q.libs['25'], q.libs['2'], q.libs['1']], [`${n(m * 2.5)} jours ouvrables`, `${m * 2} jours ouvrables`, `${m} jours ouvrables`], 'choix');
    }],
    ['plafond-30', (q) => {
      const m = Number(/travaillé (\d+) mois/.exec(q.enonce)[1]);
      vrai(m >= 13 && m <= 16, 'mois : ' + m);
      egal([q.libs['30'], q.libs.calcul], ['30 jours ouvrables', `${n(m * 2.5)} jours ouvrables`], 'choix');
    }],
    ['essai-cdd', (q) => {
      const w = Number(/CDD de (\d+) semaines/.exec(q.enonce)[1]);
      vrai([3, 4, 5, 8, 9, 10, 12].includes(w), 'semaines : ' + w);
      egal(q.libs.jours, `${w} jours`, 'bonne réponse');
    }],
  ]) {
    const L = de(id);
    egal(L.length, 50, `tirages de ${id}`);
    L.forEach(verifier);
    vrai(new Set(L.map((q) => q.enonce)).size > 3, `${id} : les valeurs ne varient pas`);
  }
});

await v('ENT-6.3 : barème — jalons du socle 17 (aucun à 0), questions notées 3 ; « Le droit » cite L3141-3, L3141-17, L1242-10, L1242-2 et L1132-1 (source Légifrance) ; corrigé calculé', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent63.js');
    const C = await import('/contenus/corriges/ENT-6.3.js');
    const droit = S.DOCUMENTS.find((d) => d.id === 'droit').html;
    return { poids: Object.fromEntries(S.ETAPES.map((e) => [e.id, e.poids])), droit, corrige: JSON.stringify(C.CORRIGE) };
  });
  egal(r.poids, POIDS63, 'poids');
  for (const a of ['L3141-3', 'L3141-17', 'L1242-10', 'L1242-2', 'L1132-1', 'Texte de loi (réel) — source : Légifrance']) vrai(r.droit.includes(a), 'le droit : ' + a);
  vrai(/deux jours et demi ouvrables par mois/.test(r.droit) && /vingt-quatre jours ouvrables/.test(r.droit) && /un jour par semaine/.test(r.droit), 'textes');
  vrai(r.corrige.includes('du 23 août au 3 septembre') && r.corrige.includes('du 5 au 16 juillet') && r.corrige.includes('CDD saisonnier'), 'corrigé');
});

await v('ENT-6.3 : enseignant — la séance s’ouvre (planning, annonce), rien ne remonte au suivi', async () => {
  await monter63({ role: 'prof', uid: 'prof' });
  await aller('planning');
  vrai(await present('[data-planning="fb-conges"]'), 'planning');
  await aller('fiche');
  vrai(await present('[data-fiche-envoyer]') || /Annonce/.test(await texte()), 'annonce');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontées');
});

await v('ENT-6.3 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

await ctxF.close();
}
