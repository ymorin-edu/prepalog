// Suite de tests de Prepalog — bloc « ikea-12.2 » : IKEA ENT-12.2, « la demande de Mme Benali » (2de, poste B service livraison, OTM-C1.1 et OTM-C1.2, guidage).
// `node outils/test.mjs ikea-12.2` ne lance que ce bloc. Brief : `docs/briefs/ENT-12.2-ikea-demande-de-mme-benali.md` §4 à §6 bis.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/ikea-demande-cliente.js`), de vrais clics à la
// SOURIS, les listes de la fiche par `selectOption`. Les GRAINES sont choisies ici (l'identifiant de l'élève) ; les valeurs attendues pour ces graines sont
// ÉCRITES À LA MAIN (relues dans le tirage le 26/10/2026 puis recalculées sur la grille de prix de la page « Livraison »), jamais recalculées par le code :
//
//   ik122-b : non membre ; armoire 199 € (colis 35, 38, 40 kg) + canapé 549 € = 748 € → « dans la pièce » 100 € + Point Relais 7 €  = 107 €.
//   ik122-a : membre     ; armoire 249 € (colis 42, 38, 39 kg) + canapé 449 € = 698 € → « dans la pièce » 80 € + Point Relais 2 €    = 82 €.
//   ik122-c : membre     ; armoire 249 € + canapé 249 € = 498 € (tranche jusqu'à 500 €) → 60 € + 2 €                                 = 62 €.
//   ik122-d : non membre ; armoire 299 € + canapé 249 € = 548 € (juste au-dessus de 500 €) → 100 € + 7 €                              = 107 €.
//
// Barème (brief §5) : écoute 7 (accès 3, créneau et reprise 2, rien de faux promis 2) · mode 6 (2 par article) · prix 2 · message 1 · ton 1 · questions 3.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'ikea-demande-cliente';
const DID = 'ik-appel-benali';
const FICHE = 'mode-livraison-122';
const ACT = '/activites/ikea-demande-cliente.js';
const P = await ouvrirIkea({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, entrants, clic, allerV, sansToast, confirmer, noter, phrases, appel, monter } = P;
// Plusieurs questions peuvent se suivre sans « Reprendre » entre elles : on répond tant qu'un panneau est ouvert, on reprend s'il y a le bouton.
const qFil = async (R) => {
  for (let i = 0; i < 8; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 700 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
};
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bonne réponse|mauvaise réponse)\b/i;

// « Avant de commencer » : non noté, trois questions tirées parmi six ; on les répond d'avance.
const OUV = { reformuler: 'compris', acces: 'escalier', poids: '112', creneau: 'plage', promesse: 'engagement', fenetre: 'cliente' };
const R = { 'pourquoi-etage': 'livreurs', 'pourquoi-pas-relais': 'poids', chaise: 'nature', 'economie-membre': 'juste', 'absente-72h': '72h' };   // réponses justes au fil
const mont = (o = {}) => monter({ rep: OUV, ...o });
const detail = async () => (await noter(ACT)).detail;

// L'appel juste : une clé par réplique (accueil, acces, creneau, reprise, devant, relais).
const APPEL = ['presente', 'acces', 'matin', 'canape', 'piece', 'accord'];
const G = {
  'ik122-b': { total: 107, prix: 'Le prix de la livraison sera de 107 €.' },
  'ik122-a': { total: 82, prix: 'Le prix de la livraison sera de 82 €.' },
  'ik122-c': { total: 62, prix: 'Le prix de la livraison sera de 62 €.' },
  'ik122-d': { total: 107, prix: 'Le prix de la livraison sera de 107 €.' },
};
const MSG = (g) => ({
  salutation: 'Bonjour Madame Benali,',
  creneau: 'Votre livraison aura lieu le mardi 16 mars 2027, de 8 h à 12 h.',
  mode: 'Vos meubles seront livrés dans la pièce de votre choix, et la lampe vous attendra au Point Relais.',
  prix: g.prix,
  reprise: 'Votre ancien canapé sera repris à la livraison, s’il est démonté. La chaise ne peut pas être reprise.',
  rappel: 'Si vous ne pouvez pas être présente, prévenez-nous au plus tard 72 heures avant la livraison.',
  fin: 'Cordialement, Lea, service livraison IKEA Gennevilliers',
});
async function fiche({ lampe = ['relais', 'leger'], armoire = ['piece', 'monter'], canape = ['piece', 'monter'], prix }, uid) {
  await allerV('fiche');
  const sel = async (champ, val) => { await pg.selectOption(`${Z} [data-fiche-champ="${champ}"]`, val); await pause(20); };
  await sel('mode_lampe', lampe[0]); await sel('raison_lampe', lampe[1]);
  await sel('mode_armoire', armoire[0]);
  await qFil(R);
  await sel('raison_armoire', armoire[1]); await sel('mode_canape', canape[0]); await sel('raison_canape', canape[1]);
  await pg.fill(`${Z} [data-fiche-saisie="prix"]`, String(prix == null ? G[uid].total : prix)); await pause(20);
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil(R);
}
async function jouer(uid, o = {}) {
  await appel(DID, o.appel || APPEL);
  await qFil(R);
  await fiche(o.fiche || {}, uid);
  await phrases('Ma livraison : votre confirmation par écrit', { ...MSG(G[uid]), ...(o.msg || {}) });
  await qFil(R);
}
const JALONS = ['ecoute-acces', 'ecoute-creneau', 'ecoute-promesse', 'mode-lampe', 'mode-armoire', 'mode-canape', 'prix', 'message', 'ton'];
async function sabotage(uid, o, tombes, score, quoi) {
  await mont({ uid });
  await jouer(uid, o);
  const d = await detail();
  egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
  proche((await noter(ACT)).score, score, `${quoi} : note`);
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-12.2 : la séance se charge (2de, OTM-C1.1 et OTM-C1.2, guidage, parcours) ; poids 17 + part 3 = 20 comme le brief §5 ; la forme pèse 1 point ; 4 questions notées + 1 réflexion au fil ; au registre sous l’entreprise n° 12', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/ikea-demande-cliente.js');
    const S = await import('/contenus/ikea-ent122.js');
    const Q = await import('/contenus/questions/ENT-12.2.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    const groupes = S.ETAPES.reduce((g, e) => { g[e.groupe] = (g[e.groupe] || 0) + e.poids; return g; }, {});
    return { meta: A.meta, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0), groupes, part: Q.QUESTIONS.part,
      fil: L.filter((q) => q.type === 'fil').map((q) => [q.id, !!q.reflexion]), ouv: Q.QUESTIONS.ouverture.tirage, ent: I.ENTREPRISES ? I.ENTREPRISES.filter((e) => e.n === 12).length : null,
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === ID) };
  }, ID);
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.parcours, m.questions, m.pret, m.ouverture],
    ['ENT-12.2', ['2de'], ['OTM-C1.1', 'OTM-C1.2'], 'guidage', 20, undefined, true, 'ENT-12.2', true, 'prof'], 'meta');
  egal(r.poids, [['ecoute-acces', 3], ['ecoute-creneau', 2], ['ecoute-promesse', 2], ['mode-lampe', 2], ['mode-armoire', 2], ['mode-canape', 2], ['prix', 2], ['message', 1], ['ton', 1]], 'jalons et poids (brief §5)');
  proche(r.total + r.part, 20, 'jalons + part des questions');
  egal(r.groupes, { 'L’appel : écouter la cliente': 7, 'Le mode de livraison': 8, 'Le message': 1, 'Le ton': 1 }, 'poids par bloc');
  egal(r.fil, [['pourquoi-etage', false], ['pourquoi-pas-relais', false], ['chaise', false], ['economie-membre', false], ['absente-72h', true]], 'questions au fil');
  egal(r.ouv, { preparation: 2, droit: 1 }, 'ouverture tirée');
  egal(r.auRegistre, true, 'au registre');
});

await v('ENT-12.2 : les documents ne donnent pas l’accès — la commande ne dit ni étage, ni ascenseur, ni escalier (c’est l’appel qui les apprend) ; les prix sont ceux de la page « Livraison » du 26/10/2026 ; la lampe est à son prix', async () => {
  await mont({ uid: 'ik122-b' });
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/ikea-ent122.js');
    const h = (id) => { const d = S.DOCUMENTS.find((x) => x.id === id); const e = document.createElement('div'); e.innerHTML = typeof d.html === 'function' ? d.html(window.__f.db) : d.html; return e.textContent.replace(/\s+/g, ' '); };
    return { commande: h('commande-122'), tarifs: h('tarifs-122'), cgv: h('cgv-122') };
  });
  vrai(!/étage|ascenseur|escalier/i.test(r.commande), 'la commande donne l’accès : ' + r.commande);
  vrai(r.commande.includes('199') && r.commande.includes('549') && r.commande.includes('35 kg, 38 kg, 40 kg') && r.commande.includes('non membre'), 'commande de ik122-b : ' + r.commande);
  for (const t of ['7 €2 €', '14 €9 €', '60 €40 €', '80 €60 €', '100 €80 €', '150 €130 €', '220 €200 €', '320 €300 €']) vrai(r.tarifs.replace(/ /g, '').includes(t.replace(/ /g, '')), `tarif « ${t} » absent`);
  vrai(r.cgv.includes('IKEA s’engage à vous livrer à la date et au créneau horaire que vous aurez choisi') && r.cgv.includes('de même nature'), 'extraits des conditions de vente');
});

// ─────────────────────────────────────────────────────────── l'ouverture
await v('ENT-12.2 : Avant de commencer — 3 questions tirées (2 de préparation, 1 de droit), corrigées à l’écran, jamais notées ; rien ne remonte au Suivi', async () => {
  const db = await monter({ uid: 'ik122-b', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 3, 'nombre de questions');
  egal([ids.filter((x) => ['reformuler', 'acces', 'poids', 'creneau'].includes(x)).length, ids.filter((x) => ['promesse', 'fenetre'].includes(x)).length], [2, 1], 'deux de préparation, une de droit');
  for (let k = 0; k < 3; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${OUV[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    if (k < 2) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note après l’ouverture seule (non notée)');
  egal(await pg.evaluate(() => window.__f.enregistres.filter((x) => x.score > 0).length), 0, 'remontée au Suivi');
});

await v('ENT-12.2 : à l’ouverture — un seul message de Claire, daté du jour de l’appel (9 mars 2027, 9 h), avec le poste et la commande ; l’appel est ouvert, la fiche attend', async () => {
  await mont({ uid: 'ik122-b' });
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Claire', 'Une cliente à appeler', ['poste-122', 'commande-122']]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2027, 2, 9, 9], 'date du scénario');
  const M = await P.menu();
  vrai(M.includes('telephone') && !M.includes('fiche'), 'menu au départ : ' + M.join(', '));
});

// ─────────────────────────────────────────────────────────── inaction
await v('ENT-12.2 : inaction — rien fait → 0/20, aucun jalon juste ; l’appel seul → 7 points (accès, créneau et reprise, rien de faux promis), jamais plus : le mode, le prix, le message et le ton restent « à faire »', async () => {
  await mont({ uid: 'ik122-b', sansOuverture: true });
  let n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  await mont({ uid: 'ik122-b' });
  await appel(DID, APPEL);
  n = await noter(ACT);
  proche(n.score, 7, 'note après l’appel');
  egal(JALONS.filter((k) => n.detail[k] === 'ok'), ['ecoute-acces', 'ecoute-creneau', 'ecoute-promesse'], 'jalons justes');
  vrai(['mode-lampe', 'mode-armoire', 'mode-canape', 'prix', 'message', 'ton'].every((k) => n.detail[k] !== 'ok' && n.detail[k] !== 'ko'), 'un jalon jugé sans envoi : ' + JSON.stringify(n.detail));
});

// ─────────────────────────────────────────────────────────── les parcours justes
for (const uid of ['ik122-b', 'ik122-a', 'ik122-c', 'ik122-d']) {
  await v(`ENT-12.2 : parcours juste (${uid}, prix attendu ${G[uid].total} €) — 20/20 ; les quatre questions notées donnent leur part (3) ; les messages se suivent ; rien à l’écran ne dit « juste » ou « faux » avant la fin`, async () => {
    await mont({ uid });
    await jouer(uid);
    const E = await entrants();
    egal(E.map((m) => [m.from, m.subject]), [['Claire', 'Une cliente à appeler'], ['Claire', 'Les modes de livraison'], ['Leïla Benali', 'Ma livraison : votre confirmation par écrit'], ['Claire', 'Merci']], 'messages');
    vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge');
    const n = await noter(ACT);
    egal([n.score, n.max], [20, 20], 'note : ' + JSON.stringify(n.detail));
    const t = await pg.evaluate(() => window.__f.db.mails.find((m) => m.subject === 'Ma livraison : votre confirmation par écrit').phrases.lignes.map((l) => [l.id, l.choix[l.juste]]));
    egal(Object.fromEntries(t), MSG(G[uid]), 'phrases justes');
  });
}

// ─────────────────────────────────────────────────────────── sabotages
await v('ENT-12.2 : sabotage de l’appel (ik122-b) — « étage » seul à la deuxième réplique → l’accès tombe (17) ; créneau de l’après-midi → créneau et reprise (18) ; « tout » à la reprise → créneau et reprise ET promesse (16) ; « monte » à « devant chez vous » → promesse seule (18) ; la bonne réponse donnée après la maladresse ne la rattrape pas (la première compte)', async () => {
  await sabotage('ik122-b', { appel: ['presente', ['etage', 'acces'], 'matin', 'canape', 'piece', 'accord'] }, ['ecoute-acces'], 17, 'accès incomplet');
  await sabotage('ik122-b', { appel: ['presente', 'acces', ['aprem', 'matin'], 'canape', 'piece', 'accord'] }, ['ecoute-creneau'], 18, 'créneau de l’après-midi');
  await sabotage('ik122-b', { appel: ['presente', 'acces', 'matin', ['tout', 'canape'], 'piece', 'accord'] }, ['ecoute-creneau', 'ecoute-promesse'], 16, 'reprise promise à tort');
  await sabotage('ik122-b', { appel: ['presente', 'acces', 'matin', 'canape', ['monte', 'piece'], 'accord'] }, ['ecoute-promesse'], 18, 'montée promise à tort');
  await sabotage('ik122-b', { appel: ['familier', 'acces', 'matin', 'canape', 'piece', 'accord'].map((x, i) => (i === 0 ? ['familier', 'presente'] : x)) }, ['ton'], 19, 'accueil familier');
});

await v('ENT-12.2 : sabotage de la fiche (ik122-b) — armoire en « devant chez vous » → son mode seul (18) ; bon mode mais mauvaise raison → idem (18) ; lampe en colis à domicile → la lampe seule (18) ; canapé en Point Relais → le canapé seul (18) ; prix de l’autre statut (membre : 82 au lieu de 107) → le prix seul (18) ; prix de la commande entière en « devant » → idem ; prix vide refusé à l’envoi', async () => {
  await sabotage('ik122-b', { fiche: { armoire: ['devant', 'monter'] } }, ['mode-armoire'], 18, 'armoire devant chez vous');
  await sabotage('ik122-b', { fiche: { armoire: ['piece', 'lourd'] } }, ['mode-armoire'], 18, 'bonne mode, mauvaise raison');
  await sabotage('ik122-b', { fiche: { lampe: ['colis', 'leger'] } }, ['mode-lampe'], 18, 'lampe en colis');
  await sabotage('ik122-b', { fiche: { canape: ['relais', 'monter'] } }, ['mode-canape'], 18, 'canapé au Point Relais');
  await sabotage('ik122-b', { fiche: { prix: 82 } }, ['prix'], 18, 'tarif membre');
  await sabotage('ik122-b', { fiche: { prix: 87 } }, ['prix'], 18, 'devant chez vous + Point Relais');
  await sabotage('ik122-d', { fiche: { prix: 108 } }, ['prix'], 18, 'prix à un euro près');
  await mont({ uid: 'ik122-b' });
  await appel(DID, APPEL); await qFil(R);
  await allerV('fiche');
  await sansToast(); await clic('[data-fiche-envoyer]'); await pause(120);
  vrai(/manque/i.test(await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent)), 'la fiche vide est envoyée');
  vrai(!(await base()).fiches?.[FICHE]?.envoye, 'fiche vide envoyée');
});

await v('ENT-12.2 : sabotage du message (ik122-b) — mauvais prix (celui de l’autre statut) → le message seul (19) ; reprise de la chaise promise → idem ; rappel « la veille » → idem ; « Salut Leïla, » → le ton seul (19) ; « Bisous » → le ton seul (19)', async () => {
  await sabotage('ik122-b', { msg: { prix: 'Le prix de la livraison sera de 127 €.' } }, ['message'], 19, 'mauvais prix écrit');
  await sabotage('ik122-b', { msg: { reprise: 'Votre ancien canapé et votre chaise seront repris à la livraison.' } }, ['message'], 19, 'chaise reprise');
  await sabotage('ik122-b', { msg: { rappel: 'Si vous ne pouvez pas être présente, prévenez-nous la veille de la livraison.' } }, ['message'], 19, 'rappel la veille');
  await sabotage('ik122-b', { msg: { creneau: 'Votre livraison aura lieu le jeudi 18 mars 2027, de 14 h à 18 h.' } }, ['message'], 19, 'mauvais créneau écrit');
  await sabotage('ik122-b', { msg: { salutation: 'Salut Leïla,' } }, ['ton'], 19, 'salutation familière');
  await sabotage('ik122-b', { msg: { fin: 'Bisous' } }, ['ton'], 19, 'fin « Bisous »');
});

await v('ENT-12.2 : questions au fil — les quatre notées valent 3 points : une seule fausse (chaise : « oui, tout ») ôte 0,75 (19,25) ; toutes fausses ôtent 3 (17) ; la réflexion « absente » est posée et ne compte pas', async () => {
  const fausses = { 'pourquoi-etage': 'rien', 'pourquoi-pas-relais': 'cher', chaise: 'tout', 'economie-membre': 'relais', 'absente-72h': 'jour' };
  const joue = async (RR) => {
    await mont({ uid: 'ik122-b' });
    const vus = [];
    const qf = async () => { for (let i = 0; i < 4; i++) { const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null); if (!q || vus.includes(q)) return;
      vus.push(q); await clic(`[data-q-choix="${RR[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); } } };
    await appel(DID, APPEL); await qf();
    await allerV('fiche');
    for (const [c, x] of [['mode_lampe', 'relais'], ['raison_lampe', 'leger'], ['mode_armoire', 'piece']]) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(20); }
    await qf();
    for (const [c, x] of [['raison_armoire', 'monter'], ['mode_canape', 'piece'], ['raison_canape', 'monter']]) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(20); }
    await pg.fill(`${Z} [data-fiche-saisie="prix"]`, '107'); await sansToast(); await clic('[data-fiche-envoyer]'); await confirmer(); await qf();
    await phrases('Ma livraison : votre confirmation par écrit', MSG(G['ik122-b'])); await qf();
    return vus;
  };
  const vus = await joue({ ...R, chaise: 'tout' });
  egal(vus, ['pourquoi-etage', 'chaise', 'pourquoi-pas-relais', 'economie-membre', 'absente-72h'], 'ordre des questions posées');
  proche((await noter(ACT)).score, 19.25, 'une fausse');
  await joue(fausses);
  proche((await noter(ACT)).score, 17, 'toutes fausses');
});

// ─────────────────────────────────────────────────────────── le corrigé
await v('ENT-12.2 : corrigé par élève — il suit la graine (ik122-b : 107 €, non membre ; ik122-a : 82 €, membre) ; le fichier est servi', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-12.2.js');
    const rep = (uid) => Object.fromEntries(C.corrigeEleve({}, uid).items.map((x) => [x.texte, x.rep]));
    return { b: rep('ik122-b'), a: rep('ik122-a'), communs: C.CORRIGE.items.length };
  });
  egal([r.b['Le prix total à écrire'], r.a['Le prix total à écrire']], ['107 €', '82 €'], 'prix totaux');
  vrai(/non membre/.test(r.b['Sa commande']) && /cliente membre/.test(r.a['Sa commande']) && r.communs === 4, 'commande et corrigé commun');
  egal(await pg.evaluate(async () => (await fetch('/contenus/corriges/ENT-12.2.js')).status), 200, 'le fichier de corrigé est servi');
});

await v('ENT-12.2 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
