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
const LIGNES62 = ['heineken30', 'jour', 'eau-vides', 'msg-rupture', 'msg-livraison', 'msg-ton'];   // 1er jalon de chaque ligne du bandeau
const etats62 = (n) => JALONS62.map((j) => [j, n.detail[j]]);
const sauf = (faux, etat = 'ko') => JALONS62.map((j) => [j, faux.includes(j) ? etat : 'ok']);

// Remplit le bon (les clés absentes restent vides) et clique « Envoyer » ; `confirmer: false` = s'arrête avant la confirmation.
async function remplirBon(r, { confirmer = true } = {}) {
  await aller('fiche');
  for (const k of ['heineken30', 'affligem20', 'remplacementQte', 'eau', 'videsFuts', 'videsCasiers']) {
    if (r[k] != null) await pg.fill(`${Z} [data-fiche-saisie="${k}"]`, r[k]);
  }
  if (r.remplacement) await pg.selectOption(`${Z} [data-fiche-champ="remplacement"]`, r.remplacement);
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
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  for (const [l, t] of Object.entries(m)) await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t });
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
    ['Commande pour la Fête de la musique', ['fiche-client', 'stock', 'conditions']]], 'messages à l’ouverture');
  vrai(/^Salut !/.test(E[1].text) && /mets-moi une autre blonde en 20 L/.test(E[1].text), 'le message de Malo (tutoiement)');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue).filter((x) => x !== 'accueil')), ['mail', 'fiche'], 'menu');
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

await v('ENT-6.2 : inaction — rien fait → 0/8, aucun jalon juste, pas de bandeau de fin', async () => {
  await monter62({ uid: 'fb62-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 8], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
});

await v('ENT-6.2 : parcours juste — 8/8, Inès demande la réponse après le bon, Malo répond « Ok pour la Pelforth, à vendredi ! », bandeau 6 lignes ✓, séance finie (photo)', async () => {
  await monter62();
  await remplirBon(BON_JUSTE);
  vrai((await entrants()).some((m) => m.subject === 'Bon de commande reçu' && /Réponds maintenant à Malo/.test(m.text)), 'second message d’Inès');
  egal((await note()).score, 5, 'note après le bon seul');
  vrai(!(await sujets()).includes('RE : Commande pour la Fête de la musique'), 'Malo répond avant la réponse de l’élève');
  await repondreMalo(MSG_JUSTE);
  const n = await note();
  egal([n.score, n.max], [8, 8], 'note');
  egal(etats62(n), sauf([]), 'jalons');
  egal(await bandeau(), LIGNES62.map((l) => [l, 'ok']), 'bandeau');
  const R = (await entrants()).filter((m) => m.subject === 'RE : Commande pour la Fête de la musique');
  egal(R.map((m) => [m.from, m.text]), [['Malo (La Cabane à Malo)', 'Ok pour la Pelforth, à vendredi !\n\nMalo']], 'réponse de Malo');
  const out = (await base()).mails.filter((m) => m.folder === 'out');
  egal(out.map((m) => [m.toMail, m.text.split('\n')]), [['contact@cabane-a-malo.example', Object.values(MSG_JUSTE)]], 'message envoyé');
  vrai(!!(await base()).points[ID62], 'photo de fin (séance suivante ouverte)');
});

// Chaque piège du brief (§8) ne fait tomber que son jalon.
const PIEGES_BON = [
  ['Affligem 4', { affligem20: '4' }, ['affligem']],
  ['remplacement « aucun » (0)', { remplacement: 'aucun', remplacementQte: '0' }, ['remplacement']],
  ['Edelweiss × 2', { remplacement: 'edelweiss20' }, ['remplacement']],
  ['Heineken 20 L × 2', { remplacement: 'heineken20' }, ['remplacement']],
  ['Pelforth × 4', { remplacementQte: '4' }, ['remplacement']],
  ['samedi', { jour: '2027-06-19' }, ['jour']],
  ['vides inversés', { videsFuts: '5', videsCasiers: '9' }, ['eau-vides']],
  ['eau 4 casiers', { eau: '4' }, ['eau-vides']],
];
for (const [nom, r, faux] of PIEGES_BON) {
  await v(`ENT-6.2 : piège « ${nom} » → seul le jalon ${faux.join(', ')} est faux (7/8)`, async () => {
    await monter62({ uid: 'fb62-piege' });
    await remplirBon({ ...BON_JUSTE, ...r });
    await repondreMalo(MSG_JUSTE);
    const n = await note();
    egal(etats62(n), sauf(faux), 'jalons');
    egal(n.score, 8 - faux.length, 'note');
  });
}
await v('ENT-6.2 : « Salut Malo ! » → seul le jalon du ton est faux ; « Bisous » et « C’est bon, j’ai noté ta commande. » aussi ; la ligne « vides » fausse ne coûte rien', async () => {
  for (const [ligne, t, faux] of [['salutation', 'Salut Malo !', ['msg-ton']], ['fin', 'Bisous', ['msg-ton']],
    ['commande', 'C’est bon, j’ai noté ta commande.', ['msg-ton']], ['vides', 'Gardez vos vides jusqu’à la prochaine fois.', []],
    ['rupture', 'Il ne nous reste que 2 fûts d’Affligem : je vous propose 2 fûts d’Edelweiss à la place.', ['msg-rupture']],
    ['livraison', 'Vous serez livré samedi 19 juin, comme vous le souhaitez.', ['msg-livraison']]]) {
    await monter62({ uid: 'fb62-ton' });
    await remplirBon(BON_JUSTE);
    await repondreMalo({ ...MSG_JUSTE, [ligne]: t });
    egal(etats62(await note()), sauf(faux), `jalons (${ligne} : ${t})`);
  }
});

await v('ENT-6.2 : réponse à Malo jamais envoyée → jalons 6 à 8 jamais justes (5/8), pas de réponse de Malo, pas de bandeau', async () => {
  await monter62({ uid: 'fb62-muet' });
  await remplirBon(BON_JUSTE);
  const n = await note();
  egal(n.score, 5, 'note');
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
  egal((await note()).score, 8, 'note');
});

await v('ENT-6.2 : « Corriger » après le piège Affligem → rouvre le bon (pas la réponse), renvoi juste → accusé d’Inès, note = moyenne 7,5/8', async () => {
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
  proche((await note()).score, 7.5, 'note moyennée');
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

await v('ENT-6.2 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

await ctxF.close();
}
