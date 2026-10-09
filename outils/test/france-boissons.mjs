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
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-organigramme.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb-juste' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, o);

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

// La fiche « Qui fait quoi ? ». `r = { cases: { a: 'karim', … }, chef, liens: { id: true (hiérarchique) | false } }`.
async function envoyerFiche(r) {
  await aller('fiche:qui-fait-quoi');
  for (const [l, qui] of Object.entries(r.cases)) await pg.selectOption(`${Z} [data-fiche-champ="case-${l}"]`, qui);
  await pg.selectOption(`${Z} [data-fiche-champ="chefLucas"]`, r.chef);
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
async function pointDEtape(v) {
  await aller('etape:avant-courrier');
  await pg.click(`${Z} [data-q-choix="${v}"][data-q="qui-decide-conges"]`);
  await pg.click(`${Z} [data-q-repondre="qui-decide-conges"]`);
  await pause();
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
  if (await present('[data-q-panneau="pourquoi-pas-helene"] [data-q-repondre]')) {
    await pg.click(`${Z} [data-q-choix="niveau"][data-q="pourquoi-pas-helene"]`);
    await pg.click(`${Z} [data-q-repondre="pourquoi-pas-helene"]`);
    await pause();
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
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
      html: essai({ documents: [{ ...S.DOC_ORGANIGRAMME_ELEVE, html: () => 42 }, FB.DOC_ANNUAIRE] }),
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
  await pg.evaluate(async () => {
    const { composerSeance } = await import('/core/types/seance-entreprise.js');
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const FB = await import('/contenus/france-boissons.js');
    const S = await import('/contenus/france-boissons-ent61.js');
    const A = await import('/activites/france-boissons-organigramme.js');
    // Ne plante qu'avec un tirage (jamais sur la base vide du contrôle au chargement).
    const piege = (rendu) => (db) => { if (db.tirages) throw new Error('boum au dessin'); return rendu; };
    const opts = { ...S.OPTIONS, fiches: [S.FICHE_VU, { ...S.FICHE_QUI, blocs: piege([]) }],
      documents: [{ ...S.DOC_ORGANIGRAMME_ELEVE, html: piege('<p>vide</p>') }, FB.DOC_ANNUAIRE] };
    const M = creerEntreprise(composerSeance(FB, S, { ...A.meta }, opts).options);
    document.querySelector('#fTest')?.remove();
    const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
    const db = {};
    window.__f = { db, enregistres: [] };
    M.rendre(hote, { meta: A.meta, aisance: 'standard', profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'fb-piege' },
      jeu: { etat: () => db, sauver: () => {} }, enregistrer: (x) => window.__f.enregistres.push(x), quitter: () => {}, codeStock: 'FB',
      lireScore: async () => null });
  });
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

await v('ENT-6.1 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

await ctxF.close();
}
