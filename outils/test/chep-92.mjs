// Suite de tests de Prepalog — bloc `chep-92` : ENT-9.2 CHEP, « un retour à contrôler, une ramasse à organiser » (brief
// `docs/briefs/ENT-9.2-chep-ramasse-et-retours.md` §8). Créé le 18/10/2026. Aides communes : `outils/test/chep/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (le code les calcule, le test les écrit) :
// - l'élève TÉMOIN (graine `@temoin…`) : P1 juste 15 ; P2 à 14 ; P3 15 dont une LPR (n° 6) ; P4 15 dont deux abîmées (n° 4 face N, n° 11 face S) ;
//   P5 à 14 dont une Europe (n° 9) → annoncées 75, reçues 73, d'un autre pool 2, À CRÉDITER 71, en réparation 2, manquantes 2 ;
// - un second témoin (m = 2, i = 2 aux n° 5 et 8) → reçues 72, autres 3, à créditer 69, réparation 2, manquantes 3 ;
// - capacité 26 × 15 = 390 ; les quatre plates-formes du TÉMOIN (les médianes) 140 + 120 + 95 + 70 = 425 ; elles sont TIRÉES par élève depuis le
//   18/10/2026 (Douai 135 à 145, Prouvy 115 à 125, Roubaix 90 à 100, Dourges 65 à 75, par pas de 5, brief §6.3) ;
// - deux élèves RÉELS (graines `eleve-vides-69` et `eleve-vides-189`, trouvées une fois pour toutes puis écrites ici) : le premier a les
//   maxima 145 + 125 + 100 + 75 = 445, la pièce `dr-prouvy`, ses piles et son crédit (69 à créditer, 3 hors pool, 2 en réparation) ; le second
//   les minima 135 + 115 + 90 + 65 = 405 et la pièce `dr-dourges` ;
// - pour chaque pièce de `dernier`, un ordre juste et un ordre faux (calculés à la main sur la carte, puis relus par la vue) :
//   Douai reporté : juste Roubaix → Prouvy → Dourges ; faux Prouvy → Roubaix → Dourges (Roubaix fermé à 9 h) ;
//   Prouvy reporté : juste Roubaix → Douai → Dourges ; faux Douai → Dourges → Roubaix (le plus court) ;
//   Roubaix reporté : juste Prouvy → Douai → Dourges ; tous les ordres tiennent : le « faux » reporte Douai à la place ;
//   Dourges reporté : juste Roubaix → Prouvy → Douai ; faux Douai → Prouvy → Roubaix (le plus court).
// Poids (Cowork, 17/10/2026) : contrôler 8 (compte 0,4 × 5, autres pools 2, abîmées 2, décisions 2), créditer 3 (2, 1), organiser 6 (capacité 1,
// Frais du Nord 1, site reporté 1,5, tient 1, horaires 1,5), questions 3.

import { ouvrirCHEP } from './chep/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {
const F = await ouvrirCHEP({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, menu, entrants, clic, erreursF, proche } = F;
await pg.emulateMedia({ reducedMotion: 'reduce' });

const ID = 'chep-ramasse-retours';
const ACT = '/activites/chep-ramasse-retours.js';
const REP_OUV = { p1: 'bon', p2: 'ecart', p3: 'reparer', p4: 'enlevement', i1: 'cote', i2: 'reparer', d1: 'non', d2: 'opale' };
const monter = (o = {}) => F.monter({ activite: ACT, id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o,
  db: { ...(o.db || {}), tirage: { graine: o.graine || '@temoin' } } });

const BONNES = { 'autre-pool': 'loueur', 'contrat-type': 'non', 'camions-pleins': 'trajets', 'appel-du-site': 'expliquer', reparer: 'resservir' };
const posees = [];
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un ; garde l'énoncé de chaque question posée.
async function qrep(choix = BONNES) {
  for (let i = 0; i < 6; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    posees.push([id, await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.innerText)]);
    if (await present(`[data-q-libre="${id}"]`)) await pg.fill(`${Z} [data-q-libre="${id}"]`, 'Un autre site serait passé vendredi.');
    else await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}

// ─────────────────────────────────────────────────────────── jouer le quai : { P1: [compte, décision, [[motif, valeur], …]], … }
const JUSTE = { P1: [15, 'accepter', []], P2: [14, 'reserves', [['manquant', 1]]], P3: [15, 'reserves', [['produit', 1]]],
  P4: [15, 'reserves', [['avarie', 2]]], P5: [14, 'reserves', [['manquant', 1], ['produit', 1]]] };
async function quai(plan = JUSTE, { clore = true } = {}) {
  await aller('quai');
  await pg.click(`${Z} [data-q="decharger"]`); await pause(200);
  if (await present('[data-q="passer"]:not([hidden])')) { await pg.click(`${Z} [data-q="passer"]`); await pause(); }
  await pg.waitForSelector(`${Z} [data-q="vers3"]:not([disabled])`);
  await pg.click(`${Z} [data-q="vers3"]`); await pause();
  for (const [id, [n, dec, mot]] of Object.entries(plan)) {
    await pg.click(`${Z} [data-q="sel"]:has-text("${id}")`); await pause(60);
    await pg.fill(`${Z} #qCompte`, String(n)); await pg.press(`${Z} #qCompte`, 'Enter'); await pause(40);
    await pg.click(`${Z} #qDec-${dec}`); for (const [m] of mot) await pg.click(`${Z} #qMot-${m}`);
    await pg.click(`${Z} [data-q="valider"]`); await pause(60);
    await qrep();
  }
  await pg.click(`${Z} [data-q="vers4"]`); await pause(60);
  if (await present('.quai-arme')) { await pg.click(`${Z} [data-q="vers4"]`); await pause(60); }
  for (const [id, [, , mot]] of Object.entries(plan)) for (const [k, [, val]] of mot.entries()) await pg.fill(`${Z} [data-q-res${k ? '2' : ''}="${id}"]`, String(val));
  await pg.click(`${Z} [data-q="ecrire"]`); await pause();
  await pg.click(`${Z} [data-q="signer"]`); await pause();
  if (clore) { await pg.click(`${Z} [data-q="clore"]`); await pause(); await qrep(); }
}
const envoyer = async () => {
  await pg.click(`${Z} [data-fiche-envoyer]`); await pause(60);
  if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); }
  await qrep();
};
const saisir = async (id, val) => { await pg.fill(`${Z} #fi-${id}`, String(val)); await pg.dispatchEvent(`${Z} #fi-${id}`, 'change'); await pause(30); await qrep(); };
const CREDIT = { annoncees: 75, aCrediter: 71, horsPool: 2, reparation: 2, sort: 'cote' };
async function crediter(c = CREDIT) {
  await aller('accueil'); await aller('fiche');
  for (const k of ['annoncees', 'aCrediter', 'horsPool', 'reparation']) await saisir(k, c[k]);
  await pg.check(`${Z} input[name="fi-sort"][value="${c.sort}"]`); await pause(30);
  await envoyer();
}
const BESOIN = { capacite: 390, frais: 'complet', total: 425, toutTient: 'non' };
async function besoin(b = BESOIN) {
  await aller('fiche:besoin');
  await saisir('capacite', b.capacite);
  await pg.selectOption(`${Z} #fi-frais`, b.frais); await pause(30); await qrep();
  await saisir('total', b.total);
  await pg.check(`${Z} input[name="fi-toutTient"][value="${b.toutTient}"]`); await pause(30);
  await envoyer();
}
// La tournée : les sites cliqués dans l'ordre (les autres restent reportés), puis « Envoyer la tournée à Yannick » (deux clics).
async function tournee(ordre, { envoi = true } = {}) {
  await aller('accueil'); await aller('tournee');
  for (const id of ordre) { await pg.click(`${Z} [data-reprendre="${id}"]`); await pause(50); }
  if (!envoi) return;
  await pg.click(`${Z} [data-tour-terminer]`); await pause(50);
  await pg.click(`${Z} [data-tour-terminer]`); await pause();
  await qrep();
}
const JUSTES = { 'dr-douai': ['roubaix', 'prouvy', 'dourges'], 'dr-prouvy': ['roubaix', 'douai', 'dourges'], 'dr-roubaix': ['prouvy', 'douai', 'dourges'], 'dr-dourges': ['roubaix', 'prouvy', 'douai'] };
const FAUX = { 'dr-douai': ['prouvy', 'roubaix', 'dourges'], 'dr-prouvy': ['douai', 'dourges', 'roubaix'], 'dr-roubaix': ['roubaix', 'prouvy', 'dourges'], 'dr-dourges': ['douai', 'prouvy', 'roubaix'] };
const JALONS = ['compte-P1', 'compte-P2', 'compte-P3', 'compte-P4', 'compte-P5', 'autre-pool', 'abimees', 'decisions', 'a-crediter', 'hors-pool',
  'capacite', 'frais', 'reporte', 'tient', 'horaires'];
const QUESTIONS_NOTEES = ['question:autre-pool', 'question:contrat-type', 'question:camions-pleins'];
const jalons = (n) => Object.fromEntries(JALONS.map((j) => [j, n.detail[j]]));
const tout = (etat) => Object.fromEntries(JALONS.map((j) => [j, etat]));
const kos = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');
async function parcours({ plan = JUSTE, credit = CREDIT, bes = BESOIN, ordre }) {
  await quai(plan); await crediter(credit); await besoin(bes); await tournee(ordre);
}

// ─────────────────────────────────────────────────────────── le registre et le meta
await v('ENT-9.2 : au registre — meta (1re, C2.5, guidage, barème 20, parcours après 9.1, correction, confirmé prévu, questions), 15 jalons pondérés = 17 + 3 de questions', async () => {
  const r = await pg.evaluate(async () => {
    const I = await import('/activites/index.js');
    const A = await import('/activites/chep-ramasse-retours.js');
    const S = await import('/contenus/chep-ent92.js');
    const Q = await import('/contenus/questions/ENT-9.2.js');
    const m = A.meta;
    const charges = await Promise.all(I.ACTIVITES.map((f) => f().then((x) => x.meta && x.meta.id).catch(() => null)));
    return { inscrite: charges.includes('chep-ramasse-retours'), e: I.ENTREPRISES.find((x) => x.n === 9).nom,
      meta: [m.code, m.niveaux, m.competences, m.temps, m.bareme, m.parcours, m.precedente, m.correction, m.niveauxPrevus, m.questions, m.rubrique, m.immersif, m.portee, m.corrige, m.ouverture],
      poids: S.ETAPES.filter((x) => !x.bonus).map((x) => [x.id, x.poids, x.ecran || null]), bonus: S.ETAPES.filter((x) => x.bonus).map((x) => x.id),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type === 'fil' && !q.reflexion && q.actif !== false).map((q) => [q.id, q.poids]),
      reserve: Q.QUESTIONS.liste.filter((q) => q.actif === false).map((q) => q.id), reflexions: Q.QUESTIONS.liste.filter((q) => q.reflexion).map((q) => q.id) };
  });
  vrai(r.inscrite, 'la séance n’est pas au registre');
  egal(r.e, 'CHEP', 'entreprise 9');
  egal(r.meta, ['ENT-9.2', ['1re'], ['C2.5'], 'guidage', 20, true, 'chep-compte-palettes', true, ['confirme'], 'ENT-9.2', 'simulog', true, 'eleve', './contenus/corriges/ENT-9.2.js', 'prof'], 'meta');
  egal(r.poids.map(([id, p]) => `${id}:${p}`).join(' '), 'compte-P1:0.4 compte-P2:0.4 compte-P3:0.4 compte-P4:0.4 compte-P5:0.4 autre-pool:2 abimees:2 decisions:2 '
    + 'a-crediter:2 hors-pool:1 capacite:1 frais:1 reporte:1.5 tient:1 horaires:1.5', 'poids');
  proche(r.poids.reduce((s, [, p]) => s + p, 0) + r.part, 20, 'somme');
  egal(r.poids.filter(([, , e]) => e).map(([id, , e]) => `${id}:${e}`), ['a-crediter:fiche:credit', 'hors-pool:fiche:credit', 'capacite:fiche:besoin', 'frais:fiche:besoin'], 'écrans de correction');
  egal([r.bonus, r.notees, r.reserve, r.reflexions], [['bonus-pile6'], [['autre-pool', 1], ['contrat-type', 1], ['camions-pleins', 1]], ['reparer'], ['appel-du-site', 'pour-reflechir']], 'bonus, questions');
});

// ─────────────────────────────────────────────────────────── les données (valeurs écrites à la main)
await v('ENT-9.2 : données — le témoin (75 annoncées, 73 reçues, 2 d’un autre pool, 71 à créditer, 2 en réparation, 2 manquantes), un second témoin (69 à créditer), la capacité 390, les décisions calculées, les vides des quatre plates-formes (médianes du témoin, bornes)', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/chep-ent92-donnees.js');
    const Q = await import('/core/types/quai.js');
    const T = D.pilesDe(D.TEMOIN);
    const T2 = D.pilesDe({ ...D.TEMOIN, m: 2, i: 2, placesI: [5, 8] });
    return { c1: D.comptesDe(T), c2: D.comptesDe(T2), cap: D.CAPACITE, dec: T.map((p) => `${p.id}:${Q.decisionPile(p).attendu}:${Q.decisionPile(p).motifs.join('+')}`),
      haut: T.map((p) => Q.comptePile(p).hauteur), conf: D.pilesDe(D.TEMOIN, { confirme: true }).map((p) => p.id), sites: D.IDS_TOURNEE.map((id) => D.TEMOIN.vides[id]), medianes: D.MEDIANES, bornes: D.BORNES_VIDES,
      sitesSansVides: D.IDS_TOURNEE.map((id) => 'vides' in D.SITES[id]), pointsSansVides: D.POINTS.map((p) => 'vides' in p),
      ecarts: D.verifier(D.TEMOIN),
      // `verifier` contrôle les bornes et le pas de 5 des vides : un jeu hors bornes est refusé, les extrêmes permis passent.
      refus: [{ douai: 150 }, { douai: 142 }, { roubaix: 85 }, { dourges: 80 }, { prouvy: 110 }].map((o) => D.verifier({ ...D.TEMOIN, vides: { ...D.TEMOIN.vides, ...o } }).length > 0),
      sansVides: D.verifier({ ...D.TEMOIN, vides: undefined }).length > 0,
      extremes: [D.verifier({ ...D.TEMOIN, vides: { douai: 145, prouvy: 125, roubaix: 100, dourges: 75 } }), D.verifier({ ...D.TEMOIN, vides: { douai: 135, prouvy: 115, roubaix: 90, dourges: 65 } })] };
  });
  egal(r.c1, { annoncees: 75, recues: 73, autres: 2, aCrediter: 71, reparation: 2, manquantes: 2 }, 'témoin 1');
  egal(r.c2, { annoncees: 75, recues: 72, autres: 3, aCrediter: 69, reparation: 2, manquantes: 3 }, 'témoin 2');
  egal(r.cap, 390, 'capacité');
  egal(r.haut, [15, 14, 15, 15, 14], 'hauteurs');
  egal(r.dec, ['P1:accepter:', 'P2:reserves:manquant', 'P3:reserves:produit', 'P4:reserves:avarie', 'P5:reserves:manquant+produit'], 'décisions');
  egal(r.conf, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'], 'confirmé : une 6e pile après les cinq');
  egal(r.sites, [140, 120, 95, 70], 'les quatre plates-formes du témoin');
  egal(r.medianes, { douai: 140, prouvy: 120, roubaix: 95, dourges: 70 }, 'les médianes');
  egal(r.bornes, { douai: [135, 145], prouvy: [115, 125], roubaix: [90, 100], dourges: [65, 75] }, 'les bornes du brief §6.3');
  egal([r.sitesSansVides, r.pointsSansVides], [[false, false, false, false], [false, false, false, false]], 'ni les sites ni les points du plan ne portent de quantité fixe');
  egal(r.ecarts, [], 'le témoin est équitable');
  egal(r.refus, [true, true, true, true, true], 'verifier refuse un vide hors de ses bornes ou pas par pas de 5');
  egal([r.sansVides, r.extremes], [true, [[], []]], 'verifier refuse un jeu sans vides ; les maxima et les minima permis sont équitables');
});

await v('ENT-9.2 : la ramasse (vides médians du témoin) — pour chaque pièce, l’ordre juste écrit à la main tient (camion, horaires) et l’ordre faux rate ; l’ordre au plus court rate dans deux pièces sur quatre ; les avis donnent le bon « dernier »', async () => {
  const r = await pg.evaluate(async ({ JUSTES, FAUX }) => {
    const D = await import('/contenus/chep-ent92-donnees.js');
    const V = D.TEMOIN.vides;
    const lire = (o) => { const b = D.bilanOrdre(o, V); return { tard: b.creneaux.filter((c) => c.charge && c.trop === 'tard').map((c) => c.id), trop: b.depassements, rep: b.reportes, pic: b.pics.vides }; };
    const out = {};
    for (const P of D.BANQUE_DERNIER) {
      const o = D.ordresDe({ ...D.TEMOIN, dernier: P.id });
      const dernier = Object.entries(P.signale).sort((a, b) => (a[1] < b[1] ? 1 : -1))[0][0];
      out[P.id] = { juste: lire(JUSTES[P.id]), faux: lire(FAUX[P.id]), court: o.court.ordre.join('>'), courtTient: o.court.tient, justes: o.justes.length, dernier, total: o.total };
    }
    return { out, ids: D.BANQUE_DERNIER.map((p) => p.id), tous: D.bilanOrdre(['douai', 'prouvy', 'roubaix', 'dourges'], V).depassements, banque: D.equiteBanque(V) };
  }, { JUSTES, FAUX });
  egal(r.ids, ['dr-douai', 'dr-prouvy', 'dr-roubaix', 'dr-dourges'], 'banque figée : quatre pièces, ids jamais changés');
  egal(r.tous, ['vides'], 'les quatre sites ne tiennent pas dans un camion');
  const O = r.out;
  egal(Object.fromEntries(Object.entries(O).map(([k, x]) => [k, x.dernier])), { 'dr-douai': 'douai', 'dr-prouvy': 'prouvy', 'dr-roubaix': 'roubaix', 'dr-dourges': 'dourges' }, 'le dernier à signaler');
  egal(Object.fromEntries(Object.entries(O).map(([k, x]) => [k, x.total])), { 'dr-douai': 285, 'dr-prouvy': 305, 'dr-roubaix': 330, 'dr-dourges': 355 }, 'totaux sans le site reporté');
  for (const k of Object.keys(O)) egal([O[k].juste.tard, O[k].juste.trop, O[k].juste.rep], [[], [], [k.slice(3)]], `${k} : l’ordre juste`);
  egal([O['dr-douai'].faux.tard, O['dr-prouvy'].faux.tard, O['dr-dourges'].faux.tard], [['roubaix'], ['roubaix'], ['roubaix']], 'les ordres faux ratent MarchéLys');
  egal([O['dr-roubaix'].faux.tard, O['dr-roubaix'].faux.rep], [[], ['douai']], 'Roubaix reporté : tout ordre tient, le faux reporte Douai');
  egal(Object.fromEntries(Object.entries(O).map(([k, x]) => [k, x.courtTient])), { 'dr-douai': true, 'dr-prouvy': false, 'dr-roubaix': true, 'dr-dourges': false }, 'l’ordre au plus court');
  egal([O['dr-prouvy'].court, O['dr-dourges'].court], ['douai>dourges>roubaix', 'douai>prouvy>roubaix'], 'les plus courts qui ratent');
  egal(Object.fromEntries(Object.entries(O).map(([k, x]) => [k, x.justes])), { 'dr-douai': 2, 'dr-prouvy': 2, 'dr-roubaix': 6, 'dr-dourges': 2 }, 'ordres qui tiennent');
  egal(r.banque, [], 'équité de la banque');
});

// ─────────────────────────────────────────────────────────── le parcours juste de chaque pièce = 20 / 20
for (const piece of ['dr-dourges', 'dr-douai', 'dr-prouvy', 'dr-roubaix']) {
  await v(`ENT-9.2 : parcours juste, pièce ${piece} — 20 / 20, quatre pastilles, Grégory et Yannick reprennent SES nombres et SON ordre`, async () => {
    await monter({ uid: `ch92-${piece}`, graine: `@temoin-${piece}` });
    const E0 = await entrants();
    egal(E0.map((m) => [m.from, m.subject]), [['Grégory Vandamme', 'Le retour d’Opale Frais']], 'message à l’ouverture');
    const M0 = await menu();
    vrai(!M0.includes('fiche') && !M0.includes('fiche:besoin') && !M0.includes('tournee') && M0.includes('quai'), 'menu au départ : ' + M0.join(', '));
    await parcours({ ordre: JUSTES[piece] });
    const n = await note();
    egal(jalons(n), tout('ok'), 'jalons');
    egal(QUESTIONS_NOTEES.map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
    proche(n.score, 20, 'note');
    await aller('accueil');
    egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 4, 'quatre pastilles faites');
    const E = await entrants();
    egal(E.map((m) => m.subject), ['Le retour d’Opale Frais', 'Le crédit d’Opale Frais', 'Le crédit d’Opale Frais', 'La collecte de demain', 'Frais du Nord', 'La tournée de mercredi'], 'messages dans l’ordre');
    vrai(/Je note : 71 à créditer, 2 en réparation/.test(E[2].text), 'Grégory reprend : ' + E[2].text);
    vrai(/OK pour Frais du Nord : je réserve son camion/.test(E[4].text), 'Yannick : ' + E[4].text);
    const noms = { roubaix: 'MarchéLys', prouvy: 'Hainaut Primeurs', douai: 'Halles d’Artois', dourges: 'Primeurs du Delta' };
    vrai(E[5].text.includes(`${JUSTES[piece].map((x) => noms[x]).join(' → ')}. ${noms[piece.slice(3)]} passe vendredi.`), 'Yannick reprend son ordre : ' + E[5].text);
    const ts = E.map((m) => m.ts);
    vrai(ts.every((t, i) => !i || t >= ts[i - 1]), 'heures croissantes');
    vrai(new Date(ts[0]).toISOString().startsWith('2027-01-19'), 'date du scénario : ' + new Date(ts[0]).toISOString());
    egal(/juste|faux|erreur|bravo|exact|bien joué/i.test(E.map((m) => m.text).join(' | ')), false, 'messages neutres');
    egal(erreursF, [], 'aucune erreur JS');
  });
}

await v('ENT-9.2 : la réponse d’un voisin — la tournée juste de « Primeurs du Delta reporté » jouée par l’élève dont Douai a signalé le plus tard n’a pas 20 (site reporté faux)', async () => {
  await monter({ uid: 'ch92-voisin', graine: '@temoin-dr-douai' });
  await parcours({ ordre: JUSTES['dr-dourges'] });
  const n = await note();
  egal(kos(n), ['reporte'], 'jalons faux');
  vrai(n.score < 20, `note ${n.score}`);
});

// ─────────────────────────────────────────────────────────── inaction
await v('ENT-9.2 : inaction 0 — rien d’« ok » avant les gestes ; ni crédit, ni ramasse, ni tournée au menu ; « Envoyer la tournée » refusé à vide', async () => {
  await monter({ uid: 'ch92-vide' });
  const n0 = await note();
  egal(n0 ? n0.score : 0, 0, 'note');
  if (n0) egal(JALONS.filter((j) => n0.detail[j] === 'ok'), [], 'aucun jalon juste');
  const M = await menu();
  vrai(!M.includes('fiche') && !M.includes('tournee'), 'menu : ' + M.join(', '));
  // La tournée vue par l'enseignant : quatre sites reportés, l'envoi est refusé (« 1 au plus »).
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/chep-ent92-donnees.js');
    const S = await import('/contenus/chep-ent92.js');
    const db = { transport: { 'chep-ramasse-retours': { tournee: { ordre: [], quai: ['douai', 'prouvy', 'roubaix', 'dourges'], termine: null } } } };
    return S.ETAPES.filter((e) => !e.bonus).map((e) => e.verifier(db).status);
  });
  egal([...new Set(r)], ['attente'], 'tournée non envoyée : à faire');
});

// ─────────────────────────────────────────────────────────── les pièges, un par un, et « une erreur ne se paie qu'une fois »
await v('ENT-9.2 : pièges A — P2 comptée 15 et acceptée (1 ✗ seul ; le crédit d’après SON contrôle, 72, est juste), capacité 375 (7 ✗ ; Yannick reprend 375 sans corriger), Frais du Nord « dans la tournée » (8 ✗), l’ordre au plus court (11 ✗)', async () => {
  posees.length = 0;
  await monter({ uid: 'ch92-pieges-a', graine: '@temoin-dr-dourges' });
  await parcours({ plan: { ...JUSTE, P2: [15, 'accepter', []] }, credit: { ...CREDIT, aCrediter: 72 }, bes: { ...BESOIN, capacite: 375, frais: 'tournee' },
    ordre: FAUX['dr-dourges'] });
  const n = await note();
  egal(kos(n), ['compte-P2', 'capacite', 'frais', 'horaires'], 'jalons faux');
  const q = posees.find(([id]) => id === 'camions-pleins');
  vrai(q && /375 palettes vides à 25 kg, c’est environ 9,38 t/.test(q[1]) && !/390/.test(q[1]), 'la question reprend SA capacité : ' + (q && q[1]));
  const E = await entrants();
  vrai(/Je note : dans la tournée pour Frais du Nord/.test(E.find((m) => m.subject === 'Frais du Nord').text), 'Yannick reprend son choix');
  vrai(/Halles d’Artois → Hainaut Primeurs → MarchéLys/.test(E.find((m) => m.subject === 'La tournée de mercredi').text), 'Yannick reprend son ordre');
  egal(erreursF, [], 'aucune erreur JS');
});

await v('ENT-9.2 : pièges B — l’intrus de P5 non vu (2 ✗), le dégât de l’arrière de P4 non vu (3 ✗), aucun site reporté (9 ✗ et 10 ✗) ; le crédit cohérent avec SON contrôle reste juste (72 à créditer, 1 hors pool, 1 en réparation)', async () => {
  await monter({ uid: 'ch92-pieges-b', graine: '@temoin-dr-dourges' });
  const plan = { ...JUSTE, P4: [15, 'reserves', [['avarie', 1]]], P5: [14, 'reserves', [['manquant', 1]]] };
  await parcours({ plan, credit: { annoncees: 75, aCrediter: 72, horsPool: 1, reparation: 1, sort: 'cote' }, ordre: ['roubaix', 'prouvy', 'douai', 'dourges'] });
  const n = await note();
  egal(kos(n), ['autre-pool', 'abimees', 'reporte', 'tient'], 'jalons faux');
  const c = await pg.evaluate(async () => (await import('/contenus/chep-ent92-donnees.js')).creditDeSonControle(window.__f.db));
  egal(c, { aCrediter: 72, horsPool: 1, reparation: 1 }, 'crédit d’après son contrôle');
});

await v('ENT-9.2 : pièges C — la pile juste mise sous réserve avec « autre pool » (4 ✗ et 2 ✗), 75 crédités (5 ✗ ; Grégory reprend 75 sans corriger), les autres pools « dans le stock CHEP » (6 ✗) ; et l’intrus non vu PUIS 71 crédités (le réel) : 5 ✗', async () => {
  await monter({ uid: 'ch92-pieges-c', graine: '@temoin-dr-dourges' });
  await quai({ ...JUSTE, P1: [15, 'reserves', [['produit', 1]]] });
  await crediter({ ...CREDIT, aCrediter: 75, sort: 'stock' });
  const n = await note();
  egal(['decisions', 'autre-pool', 'a-crediter', 'hors-pool', 'compte-P1', 'abimees'].map((j) => n.detail[j]), ['ko', 'ko', 'ko', 'ko', 'ok', 'ok'], 'jalons');
  vrai(/Je note : 75 à créditer, 2 en réparation/.test((await entrants()).filter((m) => m.subject === 'Le crédit d’Opale Frais').pop().text), 'Grégory reprend 75');
  // L'intrus de P3 non vu (P3 acceptée), puis 71 crédités : 71 est le réel, pas son contrôle (72) → faux.
  await monter({ uid: 'ch92-pieges-c2', graine: '@temoin-dr-dourges' });
  await quai({ ...JUSTE, P3: [15, 'accepter', []] });
  await crediter({ ...CREDIT, aCrediter: 71, horsPool: 1 });
  const n2 = await note();
  egal(['autre-pool', 'decisions', 'a-crediter', 'hors-pool'].map((j) => n2.detail[j]), ['ko', 'ok', 'ko', 'ok'], 'intrus non vu, crédit sur le réel');
});

await v('ENT-9.2 : « Corriger » — le crédit à 75 → bilan, « Corriger » rouvre la fiche du crédit (jamais le quai ni la tournée) ; 71 renvoyé → accusé de Grégory, note moyennée', async () => {
  await monter({ uid: 'ch92-corr', graine: '@temoin-dr-dourges' });
  await parcours({ credit: { ...CREDIT, aCrediter: 75 }, ordre: JUSTES['dr-dourges'] });
  proche((await note()).score, 18, 'premier bilan : 20 − 2');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  await clic('[data-fin-corriger]');
  const b = await base();
  egal([!!b.fiches.credit.envoye, !!b.fiches.besoin.envoye, !!b.quais['chep-retours'].fini, !!b.transport[ID].tournee.termine], [false, true, true, true], 'seule la fiche du crédit est rouverte');
  const avant = (await entrants()).length;
  await saisir('aCrediter', 71);
  await envoyer();
  const E = (await entrants()).slice(avant);
  egal(E.map((m) => [m.from, m.subject]), [['Grégory Vandamme', 'Bien reçu']], 'accusé');
  const n = await note();
  egal(jalons(n), tout('ok'), 'tout juste après correction');
  proche(n.score, 19, 'note moyennée');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-9.2 : tirage — 300 élèves : zéro secours, zéro écart, chaque pièce de « dernier » entre 15 et 35 %, histoires et quantités variées, intrus jamais en haut ni en bas, un dégât de l’arrière, crédit de 66 à 72 ; les vides des quatre plates-formes prennent leurs trois valeurs, dans leurs bornes, par pas de 5', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/chep-ent92-donnees.js');
    const Q = await import('/core/types/quai.js');
    const out = { dernier: {}, secours: 0, ecarts: [], ordres: new Set(), credit: new Set(), V: new Set(), bc: new Set(), bords: 0, arriere: 0, i: new Set(), a: new Set(),
      vides: { douai: new Set(), prouvy: new Set(), roubaix: new Set(), dourges: new Set() }, combis: new Set(), hors: [] };
    const BORNES = { douai: [135, 145], prouvy: [115, 125], roubaix: [90, 100], dourges: [65, 75] };
    for (let k = 0; k < 300; k++) {
      const t = D.tirageDe(`el-${k}`);
      if (t.secours) out.secours++;
      const J = t.jeu;
      const e = D.verifier(J); if (e.length) out.ecarts.push(`${k}: ${e.join(' ; ')}`);
      out.dernier[J.dernier] = (out.dernier[J.dernier] || 0) + 1;
      for (const id of Object.keys(BORNES)) {
        out.vides[id].add(J.vides[id]);
        if (!(J.vides[id] >= BORNES[id][0] && J.vides[id] <= BORNES[id][1] && J.vides[id] % 5 === 0)) out.hors.push(`${k} ${id} ${J.vides[id]}`);
      }
      out.combis.add(Object.keys(BORNES).map((id) => J.vides[id]).join());
      out.ordres.add(J.ordre.join()); out.V.add(J.V); out.bc.add(J.bc); out.i.add(J.i); out.a.add(J.a);
      const P = D.pilesDe(J);
      out.credit.add(D.comptesDe(P).aCrediter);
      P.forEach((p) => { const h = Q.comptePile(p).hauteur; Object.keys(p.intrus || {}).forEach((n) => { if (+n === 1 || +n === h) out.bords++; }); });
      if (Object.values(J.abimees).some((f) => f === 'N' || f === 'W')) out.arriere++;
    }
    const tri = (E) => [...E].sort((x, y) => x - y);
    return { ...out, ordres: out.ordres.size, credit: [...out.credit].sort(), V: [...out.V].sort(), bc: out.bc.size, i: [...out.i].sort(), a: [...out.a].sort(),
      vides: Object.fromEntries(Object.entries(out.vides).map(([id, E]) => [id, tri(E)])), combis: out.combis.size };
  });
  egal([r.secours, r.ecarts, r.bords, r.arriere], [0, [], 0, 300], 'secours, écarts, intrus au bord, dégât de l’arrière');
  for (const id of ['dr-douai', 'dr-prouvy', 'dr-roubaix', 'dr-dourges']) { const p = (r.dernier[id] || 0) / 3; vrai(p >= 15 && p <= 35, `${id} : ${p} %`); }
  egal(r.hors, [], 'un vide hors de ses bornes ou pas par pas de 5');
  egal(r.vides, { douai: [135, 140, 145], prouvy: [115, 120, 125], roubaix: [90, 95, 100], dourges: [65, 70, 75] }, 'chaque plate-forme prend ses trois valeurs (minimum, médiane, maximum)');
  vrai(r.combis >= 20, `combinaisons de quantités différentes : ${r.combis}`);
  vrai(r.ordres >= 40, `ordres des histoires : ${r.ordres}`);
  vrai(r.credit.every((c) => c >= 66 && c <= 72) && r.credit.length >= 3, 'crédits : ' + r.credit.join(', '));
  egal([r.V, r.i, r.a], [[390, 395, 400], [1, 2], [1, 2, 3]], 'V, intrus, abîmées');
  vrai(r.bc >= 100, `numéros de bon : ${r.bc}`);
});


// ─────────────────────────────────────────────────────────── les vides tirés par élève (18/10/2026)
// Deux élèves RÉELS (pas `@temoin`), graines et quantités écrites à la main (trouvées une fois pour toutes, voir l'en-tête) :
//   A `eleve-vides-69`  : Douai 145, Prouvy 125, Roubaix 100, Dourges 75 = 445 ; pièce `dr-prouvy` (Hainaut Primeurs a signalé le plus tard) ;
//   B `eleve-vides-189` : Douai 135, Prouvy 115, Roubaix 90, Dourges 65 = 405 ; pièce `dr-dourges`.
const ELEVE_A = { graine: 'eleve-vides-69', vides: { douai: 145, prouvy: 125, roubaix: 100, dourges: 75 }, total: 445 };
const ELEVE_B = { graine: 'eleve-vides-189', vides: { douai: 135, prouvy: 115, roubaix: 90, dourges: 65 }, total: 405 };
const NOMS_SITES = { douai: 'Halles d’Artois', prouvy: 'Hainaut Primeurs', roubaix: 'MarchéLys', dourges: 'Primeurs du Delta' };
const DEJA = { fiches: { credit: { valeurs: {}, envoye: { at: 1 }, envois: 1 }, besoin: { valeurs: {}, envoye: { at: 1 }, envois: 1 } } };
const sansEspaces = (t) => t.replace(/[\s\u00a0\u202f]+/g, ' ');

await v('ENT-9.2 : vides tirés par élève — deux élèves réels ont chacun SES quantités : la liste des arrêts, la jauge, les avis, le corrigé ; les marqueurs de la carte sont les mêmes ; aucun avis d’erreur de la vue', async () => {
  const lu = {};
  for (const E of [ELEVE_A, ELEVE_B]) {
    await monter({ uid: `ch92-${E.graine}`, graine: E.graine, db: DEJA });
    await aller('accueil'); await aller('tournee');
    // À l'ouverture, tout est « à quai » : la liste du quai porte déjà les quantités de l'élève.
    const quai = sansEspaces(await pg.$eval(`${Z} .tour-quai`, (e) => e.textContent));
    for (const id of ['douai', 'prouvy', 'roubaix', 'dourges']) await pg.click(`${Z} [data-reprendre="${id}"]`).then(() => pause(50));
    lu[E.graine] = await pg.evaluate(({ Z }) => {
      const z = document.querySelector(Z);
      return { quai: null, liste: Object.fromEntries([...z.querySelectorAll('#tourListe .tour-item')].map((li) => [li.querySelector('strong').textContent.trim(), li.querySelector('.note').textContent.replace(/[\s\u00a0\u202f]+/g, ' ')])),
        tete: z.querySelector('[data-tour-profil="vides"] .tour-j-tete').textContent.replace(/[\s\u00a0\u202f]+/g, ' '),
        jauge: z.querySelector('[data-tour-profil="vides"]').textContent.replace(/[\s\u00a0\u202f]+/g, ' '),
        plan: z.querySelector('.plan-boite').innerHTML, erreur: !!z.querySelector('[data-tournee-erreur]') };
    }, { Z });
    lu[E.graine].quai = quai;
    // Les avis (documents) et le corrigé de CET élève.
    const doc = await pg.evaluate(async (uid) => {
      const S = await import('/contenus/chep-ent92.js');
      const C = await import('/contenus/corriges/ENT-9.2.js');
      const db = window.__f.db;
      const avis = Object.fromEntries(['douai', 'prouvy', 'roubaix', 'dourges', 'lesquin'].map((id) => [id, S.DOCUMENTS.find((d) => d.id === `avis-${id}`).html(db).replace(/[\s\u00a0\u202f]+/g, ' ')]));
      const ramasse = C.corrigeEleve(db, uid).items.find((x) => x.texte === 'Sa ramasse').rep;
      const commun = C.CORRIGE.items.find((x) => x.etape === 3);
      return { avis, ramasse, commun: commun.rep + ' ' + commun.note };
    }, `ch92-${E.graine}`);
    lu[E.graine].doc = doc;
    egal(await present('[data-tournee-erreur]'), false, `${E.graine} : avis d'erreur de la vue Tournée`);
  }
  for (const E of [ELEVE_A, ELEVE_B]) {
    const L = lu[E.graine];
    for (const id of Object.keys(E.vides)) {
      const n = E.vides[id];
      vrai(L.liste[NOMS_SITES[id]] && L.liste[NOMS_SITES[id]].includes(`${n} palettes à reprendre`), `${E.graine} : la ligne de ${NOMS_SITES[id]} ne dit pas ${n} : ` + JSON.stringify(L.liste));
      vrai(L.quai.includes(`${n} palettes`), `${E.graine} : la liste du quai ne dit pas ${n} palettes : ` + L.quai.slice(0, 300));
      vrai(L.doc.avis[id].includes(`${n} palettes CHEP prêtes à l’enlèvement`), `${E.graine} : l'avis de ${NOMS_SITES[id]} ne dit pas ${n} : ` + L.doc.avis[id].slice(0, 400));
    }
    // La jauge : son pic est la somme de SES quatre quantités, lue en tête de jauge ; elle ne dit pas de combien c'est trop.
    vrai(L.tete.includes(`${E.total} / 390`), `${E.graine} : la tête de la jauge ne dit pas ${E.total} / 390 : ` + L.tete);
    vrai(/Le camion ne peut pas tout prendre/.test(L.jauge) && !/dépassée de|de trop|\b(55|15)\b palettes/.test(L.jauge), `${E.graine} : la jauge : ` + L.jauge);
    egal(L.erreur, false, `${E.graine} : avis d'erreur`);
    // Le corrigé : SES quatre quantités et leur total.
    const dit = ['douai', 'prouvy', 'roubaix', 'dourges'].map((id) => `${NOMS_SITES[id]} ${E.vides[id]}`).join(', ');
    vrai(L.doc.ramasse.includes(`Ses vides : ${dit} : ${E.total}, plus que 390.`), `${E.graine} : « Sa ramasse » : ` + L.doc.ramasse);
  }
  // Les deux élèves ne voient pas les mêmes quantités, mais la même carte (mêmes sites, mêmes marqueurs).
  vrai(lu[ELEVE_A.graine].plan.length > 500 && lu[ELEVE_A.graine].plan === lu[ELEVE_B.graine].plan, 'les marqueurs du plan changent d’un élève à l’autre');
  vrai(JSON.stringify(lu[ELEVE_A.graine].liste) !== JSON.stringify(lu[ELEVE_B.graine].liste), 'les deux élèves ont la même liste');
  // Le corrigé commun ne fige plus 425 : il donne les bornes (405 à 445) et dit que les quantités sont tirées.
  const commun = lu[ELEVE_A.graine].doc.commun;
  vrai(/entre 405 et 445 palettes selon l’élève/.test(commun) && /plus que 390/.test(commun) && !/\b425\b/.test(commun) && /tirées par élève/.test(commun), 'corrigé commun : ' + commun);
  // Le retour que dit le corrigé suit les quantités de l'élève (d'une fraction de minute, mais ça passe la minute pour ces deux-là) : relevé
  // sur deux autres élèves aux quantités extrêmes (graines `eleve-vides-20` : maxima, pièce Douai ; `eleve-vides-422` : minima, pièce Roubaix).
  // Avec les médianes, le premier dirait 9 h 57 et le second 10 h 27. Le dernier arrêt attend l'ouverture de son quai (9 h pour Dourges) : seul son service
  // compte, 20 min + 0,05 min par palette (75 palettes : 23,75 min), puis le retour.
  const retours = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-9.2.js');
    return ['eleve-vides-20', 'eleve-vides-422'].map((g) => C.corrigeEleve({ tirage: { graine: g } }, 'x').items.find((x) => x.texte === 'Sa ramasse').rep);
  });
  vrai(retours[0].includes('Primeurs du Delta (135 km, retour vers 9 h 58)') && retours[0].includes('Primeurs du Delta 75 : 445'), 'corrigé de eleve-vides-20 : ' + retours[0]);
  vrai(retours[1].includes('Primeurs du Delta (112 km, retour vers 10 h 26)') && retours[1].includes('Primeurs du Delta 65 : 405'), 'corrigé de eleve-vides-422 : ' + retours[1]);
  egal(erreursF, [], 'aucune erreur JS');
});

await v('ENT-9.2 : vides tirés par élève, parcours juste de l’élève A (145 + 125 + 100 + 75 ; Hainaut Primeurs reporté) — 20 / 20, son pic 320 et sa tournée jugés sur SES quantités, Yannick reprend son ordre', async () => {
  // Les piles de A, lues une fois dans `D.pilesDe` puis écrites ici : P1 15 juste ; P2 à 14 (1 manquante, 1 d'un autre pool) ; P3 15 dont 2 abîmées ;
  // P4 à 13 (2 manquantes) ; P5 15 dont 2 d'un autre pool → annoncées 75, reçues 72, 3 d'un autre pool, 69 à créditer, 2 en réparation.
  const PLAN_A = { P1: [15, 'accepter', []], P2: [14, 'reserves', [['manquant', 1], ['produit', 1]]], P3: [15, 'reserves', [['avarie', 2]]],
    P4: [13, 'reserves', [['manquant', 2]]], P5: [15, 'reserves', [['produit', 2]]] };
  const CREDIT_A = { annoncees: 75, aCrediter: 69, horsPool: 3, reparation: 2, sort: 'cote' };
  const BESOIN_A = { capacite: 390, frais: 'complet', total: ELEVE_A.total, toutTient: 'non' };
  await monter({ uid: 'ch92-reel-a', graine: ELEVE_A.graine });
  await parcours({ plan: PLAN_A, credit: CREDIT_A, bes: BESOIN_A, ordre: ['roubaix', 'douai', 'dourges'] });
  const n = await note();
  egal(jalons(n), tout('ok'), 'jalons');
  egal(QUESTIONS_NOTEES.map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  proche(n.score, 20, 'note');
  // La tournée envoyée est jugée sur SES quantités : 100, puis 100 + 145, puis 100 + 145 + 75 (avec les médianes, 305).
  const T = await pg.evaluate(async () => { const D = await import('/contenus/chep-ent92-donnees.js'); const t = D.tourneeEnvoyee(window.__f.db); return { pic: t.b.pics.vides, profil: t.b.profils.vides, reportes: t.b.reportes, retenus: t.b.retenus.map((p) => p.id) }; });
  egal([T.pic, T.profil, T.reportes, T.retenus], [320, [0, 100, 245, 320], ['prouvy'], ['roubaix', 'douai', 'dourges']], 'la tournée envoyée, sur ses quantités');
  const E = await entrants();
  vrai(E[E.length - 1].text.includes('MarchéLys → Halles d’Artois → Primeurs du Delta. Hainaut Primeurs passe vendredi.'), 'Yannick reprend son ordre : ' + E[E.length - 1].text);
  egal(await present('[data-tournee-erreur]'), false, 'avis d’erreur de la vue Tournée');
  egal(erreursF, [], 'aucune erreur JS');
});

// ─────────────────────────────────────────────────────────── confirmé, accompagné
await v('ENT-9.2 : confirmé — une 6e pile (deux dégâts de l’arrière) après les cinq, le socle inchangé, le bonus jugé et caché ; standard → bonus null', async () => {
  const s = await pg.evaluate(async () => {
    const D = await import('/contenus/chep-ent92-donnees.js');
    const J = D.jeuDe('un-eleve');
    return { std: JSON.stringify(D.pilesDe(J)), conf: JSON.stringify(D.pilesDe(J, { confirme: true }).slice(0, 5)), p6: D.pilesDe(J, { confirme: true })[5] };
  });
  egal(s.conf, s.std, 'le socle du confirmé est celui du standard');
  vrai(Object.values(s.p6.abimee).every((f) => f === 'N' || f === 'W') && Object.keys(s.p6.abimee).length === 2, '6e pile : ' + JSON.stringify(s.p6.abimee));
  await monter({ uid: 'ch92-conf', aisance: 'confirme' });
  await aller('quai');
  await quai({ ...JUSTE, P6: [15, 'reserves', [['avarie', 2]]] });
  const n = await note();
  egal([n.detail.bonus && n.detail.bonus.etats['bonus-pile6'], n.detail.decisions, n.detail['compte-P5']], ['ok', 'ok', 'ok'], 'bonus jugé');
  vrai(!/bonus|6e pile|en plus/i.test(await pg.$eval(Z, (e) => e.innerText)), 'rien ne dit « bonus » à l’élève');
  const std = await pg.evaluate(async () => { const S = await import('/contenus/chep-ent92.js'); const db = JSON.parse(JSON.stringify(window.__f.db)); delete db.aisance;
    return S.ETAPES.find((e) => e.bonus).verifier(db); });
  egal(std, null, 'standard : bonus null');
});

await v('ENT-9.2 : accompagné — la consigne de Grégory rappelle de cliquer chaque palette et de faire le tour ; le standard ne l’a pas', async () => {
  await monter({ uid: 'ch92-acc', aisance: 'accompagne' });
  await aller('quai');
  vrai(/Fais le tour de chaque pile avant de décider/.test(await pg.$eval(Z, (e) => e.innerText)), 'rappel absent (accompagné)');
  await monter({ uid: 'ch92-std' });
  await aller('quai');
  vrai(!/Fais le tour de chaque pile avant de décider/.test(await pg.$eval(Z, (e) => e.innerText)), 'rappel présent (standard)');
});

// ─────────────────────────────────────────────────────────── « que, jamais de combien »
await v('ENT-9.2 : que, jamais de combien — au quai, aucun texte ne dit la hauteur ni le pool ; la jauge dit « Le camion ne peut pas tout prendre » sans dire de combien ; le bon de collecte reprend les réserves de l’élève', async () => {
  await monter({ uid: 'ch92-combien', graine: '@temoin-dr-dourges' });
  await aller('quai');
  await pg.click(`${Z} [data-q="decharger"]`); await pause(200);
  if (await present('[data-q="passer"]:not([hidden])')) { await pg.click(`${Z} [data-q="passer"]`); await pause(); }
  await pg.click(`${Z} [data-q="vers3"]`); await pause();
  await pg.click(`${Z} [data-q="sel"]:has-text("P5")`); await pause();
  const t = await pg.$eval(Z, (e) => e.innerText);
  const fautes = [/\b14\b/.exec(t.replace(/\d{1,2}:\d\d/g, '')), /LPR|EPAL|Europe|Logipal/.exec(t)].filter(Boolean).map((m) => m.input.slice(Math.max(0, m.index - 60), m.index + 40));
  egal(fautes, [], 'le quai nomme la hauteur ou le pool');
  await pg.$eval(`${Z} [data-q-palette] [data-q-carton="9"]`, (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))); await pause();
  const zoom = await pg.$eval(`${Z} [data-q-proche]`, (e) => e.getAttribute('aria-label'));
  egal(zoom, 'Palette 9 de P5, vue de près', 'le zoom');
  // La tournée : tout prendre → « ne peut pas tout prendre », sans « de 35 ».
  await monter({ uid: 'ch92-jauge', graine: '@temoin-dr-dourges', db: { fiches: { credit: { valeurs: {}, envoye: { at: 1 }, envois: 1 }, besoin: { valeurs: {}, envoye: { at: 1 }, envois: 1 } } } });
  await tournee(['douai', 'prouvy', 'roubaix', 'dourges'], { envoi: false });
  const j = await pg.$eval(`${Z} [data-tour-profil="vides"]`, (e) => ({ texte: e.textContent, marches: e.querySelectorAll('.tour-j-marche').length }));
  vrai(/Le camion ne peut pas tout prendre/.test(j.texte) && !/dépassée de|\b35\b/.test(j.texte), 'jauge : ' + j.texte);
  egal(j.marches, 5, 'le profil en marches (départ + quatre arrêts)');
  // Le bon de collecte : les réserves de l'élève, telles qu'écrites.
  await monter({ uid: 'ch92-bon', graine: '@temoin-dr-dourges' });
  await quai(JUSTE);
  const bon = await pg.evaluate(async () => { const S = await import('/contenus/chep-ent92.js'); return S.DOCUMENTS.find((d) => d.id === 'bon-collecte').html(window.__f.db); });
  vrai(/data-bc-reserves="eleve"/.test(bon) && /P5 CHEP-1210 : acceptée sous réserve — manque 1 palette \(BC 15, reçu 14\) ; 1 palette d’un autre pool\./.test(bon), 'le bon reprend ses réserves');
  vrai(/BC-27-0119/.test(bon) && /75 palettes CHEP/.test(bon), 'numéro et total annoncé');
});

// ─────────────────────────────────────────────────────────── « Avant de commencer »
await v('ENT-9.2 : « Avant de commencer » — 4 questions tirées (2 préparation, 1 image, 1 droit), menu fermé jusqu’aux réponses, rien dans la note ; les dessins viennent du kit (SVG, aucune image, aucun texte qui nomme le pool)', async () => {
  await monter({ uid: 'ch92-ouv', sansOuverture: true });
  egal((await menu()).filter((x) => !x.startsWith('fermee:')), ['ouverture'], 'entrées ouvertes au départ');
  const T = (await base()).questions[ID]['@tirage'];
  const r = await pg.evaluate(async (ids) => {
    const Q = (await import('/contenus/questions/ENT-9.2.js')).QUESTIONS;
    const S = await import('/contenus/chep-ent92.js');
    const d = ['dessin-lpr', 'dessin-abimee'].map((id) => S.DOCUMENTS.find((x) => x.id === id).html);
    return { rub: ids.map((id) => Q.liste.find((q) => q.id === id).rubrique), banque: ['preparation', 'image', 'droit'].map((r) => Q.liste.filter((q) => q.rubrique === r).length),
      svg: d.map((h) => [/<svg/.test(h), /<img|<text|title=/.test(h), (h.match(/<path d="M/g) || []).length]) };
  }, T.ids);
  egal(r.rub.slice().sort(), ['droit', 'image', 'preparation', 'preparation'], 'rubriques tirées');
  egal(r.banque, [4, 2, 2], 'banque ≥ double par rubrique');
  vrai(r.svg.every(([s, interdit, marques]) => s && !interdit && marques >= 3), 'dessins du kit : ' + JSON.stringify(r.svg));
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /question:(p|i|d)\d/.test(k)), 'une question d’ouverture est notée');
});

// ─────────────────────────────────────────────────────────── ergonomie
for (const [w, h] of [[1366, 768], [1280, 720]]) {
  await v(`ENT-9.2 : ergonomie ${w} × ${h} — les deux fiches sans défilement de page (hors la barre « Étape suivante »), bouton d’envoi visible ; quai ③ ④ et tournée sans défilement horizontal`, async () => {
    await pg.setViewportSize({ width: w, height: h });
    try {
      const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      await monter({ uid: 'ch92-ecran', graine: '@temoin-dr-dourges' });
      await aller('quai');
      await pg.click(`${Z} [data-q="decharger"]`); await pause(200);
      if (await present('[data-q="passer"]:not([hidden])')) { await pg.click(`${Z} [data-q="passer"]`); await pause(); }
      await pg.click(`${Z} [data-q="vers3"]`); await pause();
      vrai(await large() <= 0, '③ : défilement horizontal');
      const pile = await pg.$eval(`${Z} [data-q-palette]`, (e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right }; });
      vrai(pile.l >= 0 && pile.r <= w, '③ : la pile sort de l’écran ' + JSON.stringify(pile));
      await monter({ uid: 'ch92-ecran2', graine: '@temoin-dr-dourges' });
      await quai(JUSTE, { clore: false });
      vrai(await large() <= 0, '④ : défilement horizontal');
      await pg.click(`${Z} [data-q="clore"]`); await pause(); await qrep();
      const mesures = [];
      for (const vue of ['fiche', 'fiche:besoin']) {
        await aller('accueil');
        if (vue === 'fiche:besoin') { await crediter(); await aller('accueil'); }
        await aller(vue);
        await pg.$$eval('[data-carte-fermer]', (L) => L.forEach((b) => b.click()));
        await pause(200);
        mesures.push(await pg.evaluate(() => { window.scrollTo(0, 0); const p = document.querySelector('#fTest .ent-page');
          const cartes = document.querySelector('#fTest .ent-cartes-ancre').getBoundingClientRect().height;
          const s = document.querySelector('#fTest .ent-suite'); const barre = s ? s.getBoundingClientRect().height + 12 : 0;
          const b = document.querySelector('#fTest [data-fiche-envoyee], #fTest [data-fiche-envoyer]');
          return { h: p.scrollHeight - cartes - barre, bas: b.getBoundingClientRect().bottom - cartes, barre }; }));
        vrai(await large() <= 0, `${vue} : défilement horizontal`);
      }
      await besoin();
      await aller('accueil'); await aller('tournee');
      vrai(await large() <= 0, 'tournée : défilement horizontal');
      const dit = mesures.map((m, i) => `fiche ${i + 1} : ${Math.round(m.h)} px sans la barre de ${Math.round(m.barre)}, bouton à ${Math.round(m.bas)}`).join(' ; ');
      vrai(mesures.every((m) => m.h <= h + 1 && m.bas <= h), `${dit} (pour ${h})`);
    } finally { await pg.setViewportSize({ width: 1366, height: 900 }); }
  });
}

// ─────────────────────────────────────────────────────────── socle
await v('ENT-9.2 : socle — aucune erreur JavaScript ; le corrigé se calcule pour un élève (ses piles, son crédit, sa pièce, un ordre juste) ; chaque document porte sa mention ; aucun « BL » au quai', async () => {
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-9.2.js');
    const S = await import('/contenus/chep-ent92.js');
    const e = C.corrigeEleve({ tirage: { graine: '@temoin-dr-prouvy' } }, 'x');
    const vide = C.corrigeEleve({}, 'nouveau');
    const conf = C.corrigeEleve({ tirage: { graine: '@temoin' }, aisance: 'confirme' }, 'x');
    const db = { tirage: { graine: '@temoin' } };
    const html = S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html(db) : d.html));
    return { n: C.CORRIGE.items.length, items: e.items.map((x) => [x.texte, x.rep || '', (x.reponses || []).length]), vide: vide.texte, bonus: conf.items.some((x) => x.bonus),
      pieds: html.filter((h) => /class="ch-pied"/.test(h)).length, total: html.length };
  });
  vrai(c.n >= 4, 'corrigé commun');
  vrai(c.items.some(([t, , n]) => /Ses piles/.test(t) && n === 5), 'ses cinq piles');
  vrai(c.items.some(([t, r]) => /crédit attendu/.test(t) && /à créditer 71/.test(r)), 'son crédit');
  vrai(c.items.some(([t, r]) => /Sa ramasse/.test(t) && /Hainaut Primeurs/.test(r) && /MarchéLys → Halles d’Artois → Primeurs du Delta/.test(r)), 'sa pièce et un ordre juste : ' + JSON.stringify(c.items.find(([t]) => /Sa ramasse/.test(t))));
  vrai(/pas encore ouvert/.test(c.vide) && c.bonus, 'élève sans base, bonus du confirmé');
  egal(c.pieds, c.total, 'chaque document porte sa mention');
  egal(erreursF, [], 'aucune erreur JS');
});

// Correctifs moteur du 18/10/2026 (remarques de la livraison d'ENT-9.2) : après « Clore », le menu montre « Crédit du retour » SANS changer
// d'écran (la liste du menu suit chaque sauvegarde, `majMenu`) ; le chauffeur, qui n'a rien refusé, ne parle pas de « palettes refusées » ;
// la tournée au plus court (Douai → Prouvy → Roubaix) arrive à Roubaix quai fermé : la pastille et le refus disent « quai fermé à l’arrivée »,
// jamais « de N min ».
await v('ENT-9.2 moteur : « Crédit du retour » apparaît au menu dès « Clore », sans navigation ; chauffeur sans « refusées » ; quai fermé sans « de combien »', async () => {
  await monter();
  await quai(JUSTE, { clore: false });
  egal(await pg.$$eval(`${Z} .ent-nav`, (L) => L.filter((b) => /Crédit du retour/.test(b.textContent)).length), 0, 'avant « Clore », le crédit n’est pas au menu');
  const parole = await pg.$eval(`${Z} [data-q-parole]`, (n) => n.textContent.replace(/\s+/g, ' ').trim());
  vrai(/C’est signé\. J’y vais\./.test(parole) && !/refusées/.test(parole), 'le chauffeur : ' + parole);
  await pg.click(`${Z} [data-q="clore"]`); await pause(); await qrep();
  // Pas de `aller(...)` : la liste du menu doit déjà porter la fiche, et le bouton doit marcher.
  egal(await pg.$$eval(`${Z} .ent-nav`, (L) => L.filter((b) => /Crédit du retour/.test(b.textContent)).length), 1, 'après « Clore », le crédit est au menu sans changer d’écran');
  vrai(await present('[data-q-bilan]'), 'on est resté sur le quai');
  await pg.click(`${Z} .ent-nav:has-text("Crédit du retour")`); await pause();
  vrai(await present('[data-fiche-envoyer]'), 'le bouton du menu redessiné ouvre bien la fiche');
  // La tournée : crédit et besoin envoyés (aides du bloc), puis l'ordre au plus court — Roubaix (ferme à 9 h) est atteint trop tard.
  await crediter(); await besoin();
  await aller('tournee');
  for (const id of ['douai', 'prouvy', 'roubaix']) { await pg.click(`${Z} [data-reprendre="${id}"]`); await pause(60); }
  const j = await pg.$eval(`${Z} [data-creneau="roubaix"]`, (e) => ({ texte: e.textContent.replace(/\s+/g, ' '), pastille: (e.querySelector('.pastille.crit') || {}).textContent || '' }));
  egal(j.pastille.trim(), 'Quai fermé à l’arrivée', 'la pastille de Roubaix');
  vrai(!/raté de|min de retard/.test(j.texte), 'la jauge dit de combien : ' + j.texte);
  egal(erreursF, [], 'aucune erreur JS');
});

await F.fermer();
}
