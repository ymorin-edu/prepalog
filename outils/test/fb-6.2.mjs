// Suite de tests de Prepalog — bloc « fb-6.2 » : ENT-6.2 (France Boissons, la commande de La Cabane à Malo).
// `node outils/test.mjs fb-6.2` ne lance que ce bloc. Découpé de l'ancien bloc `france-boissons` le 12/10/2026 : un bloc par
// séance (l'ensemble durait 8 min 20 et bornait toute la suite). Les cas sont ceux d'avant, déplacés tels quels ; les aides
// communes (contexte, page, relevé d'erreurs JavaScript, lecture de la base) sont dans `outils/test/france-boissons/commun.mjs`.

import { ouvrirFB } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, bandeau, entrants, horodate, calcPresente, nettoyerCalc, erreursF, proche } = F;

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

await F.fermer();
}
