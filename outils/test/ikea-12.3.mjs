// Suite de tests de Prepalog — bloc « ikea-12.3 » : IKEA ENT-12.3, « la Seine est en crue » (2de, poste B transport, OTM-C3.1 et OTM-C1.2, entraînement).
// `node outils/test.mjs ikea-12.3` ne lance que ce bloc. Brief : `docs/briefs/ENT-12.3-ikea-seine-en-crue.md` §4 à §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS (cartes et cases de la grille). Le planning est le même pour tous.
// Les valeurs attendues sont ÉCRITES À LA MAIN (relues le 26/10/2026 sur les dix commandes de la séance) :
//
//   Mme Roux (Paris 20e, 8 h–10 h, bloc de 2 h 15) et M. Haddad (Paris 19e, 9 h–11 h, bloc de 2 h 15) NE PEUVENT PAS tenir leur créneau (le bloc est plus long que le créneau) : on les reporte à demain.
//   Les huit autres le peuvent : Mme Martin 8 h–12 h (1 h 15, 520 kg) · M. Nguyen 9 h–12 h (1 h 30, 610 kg) · Mme Lefèvre 8 h–12 h (1 h, 240 kg) · M. Morel 10 h–13 h (1 h 30, 700 kg) ·
//   M. Perrin 14 h–16 h (1 h 15, 300 kg) · Mme Garcia 13 h–17 h (1 h 30, 450 kg) · M. Diallo 14 h–16 h (1 h, 380 kg) · Mme Costa 14 h–17 h (1 h 30, 520 kg). Camions : 1 600, 1 600 et 1 000 kg.
//   Une solution juste : Camion 1 = Martin 8 h, Nguyen 9 h 15, Lefèvre 10 h 45 (1 370 kg) · Camion 2 = Morel 10 h, Perrin 14 h, Garcia 15 h 15 (1 450 kg) · Camion 3 = Diallo 14 h, Costa 15 h (900 kg).
//   Les kilomètres des dix commandes : 28 + 26 + 22 + 24 + 30 + 12 + 20 + 26 + 24 + 22 = 234 km (sans Roux et Haddad : 180 km).
//
// Barème : poser sans recouvrement 3 · charge 2 · créneaux 5 · prévenir (qui 3, la date 1) · réponse à Mme Roux 2 · questions notées 4 = 20.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'ikea-seine-en-crue';
const PL = 'ik-planning-123';
const FICHE = 'prevenir-123';
const ACT = '/activites/ikea-seine-en-crue.js';
const P = await ouvrirIkea({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, aller } = P;
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

const OUV = { engagement: 'creneau', prevenir: 'prevenir', secours: 'camion', duree: 'juste', annuler: 'delai', essentielle: 'tout-de-suite' };
const R = { 'peniche-pourquoi': 'ponts', 'creneau-hors': 'creneau', 'km-en-plus': 'juste', 'roux-annuler': 'delai', 'camions-secours': 'secours' };
const mont = (o = {}) => monter({ rep: OUV, uid: 'ik123', ...o });
const JALONS = ['v2-poses', 'v2-charge', 'v2-creneaux', 'prevenir-qui', 'prevenir-date', 'annulation'];
const detail = async () => (await noter(ACT)).detail;
const OBJET_ROUX = 'Ma livraison reportée : j’annule';

// Le planning juste (écrit à la main) : { carte: [ligne, créneau] }, le créneau étant le numéro du quart d'heure depuis 8 h (8 h = 0, 9 h 15 = 5, 10 h = 8, 10 h 45 = 11, 14 h = 24, 15 h = 28, 15 h 15 = 29).
const JUSTE = { martin: ['c1', 0], nguyen: ['c1', 5], lefevre: ['c1', 11], morel: ['c2', 8], perrin: ['c2', 24], garcia: ['c2', 29], diallo: ['c3', 24], costa: ['c3', 28], roux: ['demain', 0], haddad: ['demain', 10] };

async function poser(id, ligne, t) {
  await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${ligne}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause(40);
}
async function envoyerPlanning() {
  await sansToast(); await pg.click(`${Z} [data-pl="envoyer"]`);
  await confirmer();
  await pause(150);
}
// Le premier envoi (jour normal), puis la reprise avec `plan` ({ carte: [ligne, créneau] }) ; `sansEnvoi` : on s'arrête avant le second envoi.
async function planning(plan = JUSTE, { sansEnvoi = false } = {}) {
  await allerV('planning');
  await envoyerPlanning();
  await qFil(R);
  await allerV('planning');
  for (const [id, [ligne, t]] of Object.entries(plan)) await poser(id, ligne, t);
  if (!sansEnvoi) { await envoyerPlanning(); await qFil(R); }
}
async function prevenir({ clients = ['roux', 'haddad'], date = 'demain' } = {}) {
  await allerV('fiche');
  for (const c of clients) { await pg.check(`${Z} [data-fiche-case="clients"][value="${c}"]`); await pause(30); }
  if (date) { await pg.check(`${Z} [data-fiche-champ="date"][value="${date}"]`); await pause(30); }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil(R);
}
const REGLE_JUSTE = 'Vous pouvez mettre fin à votre commande si nous ne livrons pas dans le délai supplémentaire que vous nous accordez par écrit : la loi demande d’abord de nous laisser ce délai.';
const MSG_ROUX = { salutation: 'Bonjour Madame Roux,', regle: REGLE_JUSTE, date: 'Nous vous proposons de vous livrer demain, vendredi 12 mars, le matin.', fin: 'Cordialement, Lea, service livraison IKEA Gennevilliers' };
async function roux(o = {}) { await phrases(OBJET_ROUX, { ...MSG_ROUX, ...o }); await qFil(R); }
async function jouer(o = {}) {
  await planning(o.plan);
  await prevenir(o.prevenir);
  await roux(o.roux);
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-12.3 : la séance se charge (2de, OTM-C3.1 et OTM-C1.2, entraînement) ; poids 10 + 4 + 2 + part 4 = 20 comme le brief §5 ; trois jalons de planning jugés après l’aléa seulement ; 4 questions notées + 1 réflexion', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/ikea-seine-en-crue.js');
    const S = await import('/contenus/ikea-ent123.js');
    const Q = await import('/contenus/questions/ENT-12.3.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0), part: Q.QUESTIONS.part,
      fil: L.filter((q) => q.type === 'fil').map((q) => [q.id, !!q.reflexion]), ouv: Q.QUESTIONS.ouverture.tirage, auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'ikea-seine-en-crue') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture], ['ENT-12.3', ['2de'], ['OTM-C3.1', 'OTM-C1.2'], 'entrainement', 20, undefined, 'ENT-12.3', true, 'prof'], 'meta');
  egal(r.poids, [['v2-poses', 3], ['v2-charge', 2], ['v2-creneaux', 5], ['prevenir-qui', 3], ['prevenir-date', 1], ['annulation', 2]], 'jalons et poids');
  proche(r.total + r.part, 20, 'jalons + part des questions');
  egal(r.fil, [['peniche-pourquoi', false], ['creneau-hors', false], ['km-en-plus', false], ['roux-annuler', false], ['camions-secours', true]], 'questions au fil');
  egal(r.ouv, { preparation: 2, droit: 1 }, 'ouverture tirée');
  egal(r.auRegistre, true, 'au registre');
});

await v('ENT-12.3 : les données — seules deux commandes (Roux, Haddad) ne peuvent pas tenir ; le calcul exhaustif trouve huit commandes tenables, et un seul ensemble ; dix commandes, 234 km', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/ikea-ent123-donnees.js');
    const M = D.maxTenues();
    return { n: D.COMMANDES.length, max: M.max, ens: M.ensembles.map((e) => [...e].sort()), km: D.KM_TOTAL, sans: D.KM_SANS_REPORTEES, imp: D.IMPOSSIBLES };
  });
  egal(r.n, 10, 'commandes');
  egal(r.max, 8, 'commandes tenables');
  egal(r.ens, [['costa', 'diallo', 'garcia', 'lefevre', 'martin', 'morel', 'nguyen', 'perrin']], 'le seul ensemble de huit');
  egal([r.km, r.sans, r.imp], [234, 180, ['roux', 'haddad']], 'kilomètres et impossibles');
});

// ─────────────────────────────────────────────────────────── l'ouverture, le premier jour
await v('ENT-12.3 : Avant de commencer — 3 questions tirées (2 de préparation, 1 de droit), corrigées, jamais notées', async () => {
  const db = await monter({ uid: 'ik123', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 3, 'nombre');
  egal([ids.filter((x) => ['engagement', 'prevenir', 'secours', 'duree'].includes(x)).length, ids.filter((x) => ['annuler', 'essentielle'].includes(x)).length], [2, 1], 'deux de préparation, une de droit');
  for (let k = 0; k < 3; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${OUV[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    if (k < 2) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note après l’ouverture seule');
});

await v('ENT-12.3 : la question `duree` a des valeurs tirées, toujours justes à la main : 9 h + 45 min + 30 min = 10 h 15 (graine ik123 ?) — le calcul est jugé sur l’énoncé affiché', async () => {
  const r = await pg.evaluate(async () => {
    const Q = await import('/contenus/questions/ENT-12.3.js');
    const { hasard } = await import('/core/tirage.js');
    const q = Q.QUESTIONS.liste.find((x) => x.id === 'duree');
    const vus = new Set(); const faux = [];
    for (let i = 0; i < 60; i++) {
      const o = q.variante(hasard(`d${i}`));
      const m = o.enonce.match(/part à (\d+) h, roule (\d+) min, livre en (\d+) min/);
      const fin = Number(m[1]) * 60 + Number(m[2]) + Number(m[3]);
      const t = `${Math.floor(fin / 60)} h ${String(fin % 60).padStart(2, '0')}`;
      if (o.libs.juste !== t) faux.push(`${o.enonce} → ${o.libs.juste}`);
      if (new Set(Object.values(o.libs)).size !== 3) faux.push(`réponses identiques : ${JSON.stringify(o.libs)}`);
      vus.add(o.enonce);
    }
    return { faux: faux.slice(0, 3), distincts: vus.size };
  });
  egal(r.faux, [], 'énoncés dont la bonne réponse est fausse');
  vrai(r.distincts > 5, `seulement ${r.distincts} énoncés`);
});

await v('ENT-12.3 : le jour normal — un message de Claude, dix commandes posées sur la péniche (rien à poser), la grille montre la péniche et les trois camions ; envoyer fait arriver l’aléa, la péniche disparaît et « Reporté à demain » apparaît', async () => {
  await mont();
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Claire', 'Le planning du jeudi 11 mars', ['poste-123', 'commandes-123', 'camions-123']]], 'messages à l’ouverture');
  await allerV('planning');
  const noms = () => pg.$$eval(`${Z} [data-pl-grille] .pl-res`, (L) => L.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  const avant = await noms();
  vrai(avant.length === 4 && /Péniche/.test(avant[0]) && /Camion 3/.test(avant[3]), 'lignes avant : ' + avant.join(' | '));
  egal((await pg.$$(`${Z} [data-pl-bac] [data-pl-id]:not(.pl-posee)`)).length, 0, 'cartes à poser avant l’aléa');
  await envoyerPlanning();
  await qFil(R);
  const E2 = await entrants();
  vrai(E2.some((m) => m.subject === 'La Seine est en crue : il faut tout replanifier'), 'message de la crue');
  await allerV('planning');
  const apres = await noms();
  vrai(apres.length === 4 && !apres.some((x) => /Péniche/.test(x)) && apres.some((x) => /Reporté à demain/.test(x)), 'lignes après : ' + apres.join(' | '));
  egal((await pg.$$(`${Z} [data-pl-bac] [data-pl-id]`)).length, 10, 'dix commandes à reposer');
});

// ─────────────────────────────────────────────────────────── inaction
await v('ENT-12.3 : inaction — rien fait → 0 ; premier envoi seul → aucun jalon jugé juste ; second envoi sans rien changer → aucun jalon juste', async () => {
  await mont({ sansOuverture: true });
  let n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note à l’ouverture');
  await mont();
  await allerV('planning'); await envoyerPlanning(); await qFil(R);
  n = await noter(ACT);
  vrai(!JALONS.some((k) => n.detail[k] === 'ok'), 'jalon juste après le premier envoi : ' + JSON.stringify(n.detail));
  await allerV('planning'); await envoyerPlanning(); await qFil(R);   // second envoi sans rien changer
  n = await noter(ACT);
  vrai(!JALONS.some((k) => n.detail[k] === 'ok'), 'jalon juste sans rien reposer : ' + JSON.stringify(n.detail));
});

// ─────────────────────────────────────────────────────────── le parcours juste
await v('ENT-12.3 : parcours juste — planning écrit à la main (Roux et Haddad reportés), Roux et Haddad prévenus pour demain, réponse juste à Mme Roux → 20/20 ; aucun message ne dit « juste » ou « faux »', async () => {
  await mont();
  await jouer();
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Le planning du jeudi 11 mars', 'La Seine est en crue : il faut tout replanifier', 'Les clients à prévenir', 'Merci', OBJET_ROUX, 'Merci'].sort().length ? E.map((m) => m.subject) : [], 'messages');
  vrai(['La Seine est en crue : il faut tout replanifier', 'Les clients à prévenir', OBJET_ROUX].every((s) => E.some((m) => m.subject === s)), 'messages attendus : ' + E.map((m) => m.subject).join(' | '));
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse)\b/i.test(m.text)), 'un message juge');
  const n = await noter(ACT);
  egal([n.score, n.max], [20, 20], 'note : ' + JSON.stringify(n.detail));
});

// ─────────────────────────────────────────────────────────── sabotages
await v('ENT-12.3 : sabotages du planning — un camion à deux endroits à la fois → 10 (poser, charge et créneaux tombent) ; trop de poids sur le camion 3 → 18 ; M. Diallo à 16 h (hors créneau), non prévenu → 12, prévenu → 15 ; Mme Costa reportée sans nécessité → 15', async () => {
  const essai = async (plan, o, tombes, score, quoi) => {
    await mont(); await jouer({ plan, ...o });
    const d = await detail();
    egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai({ ...JUSTE, nguyen: ['c1', 4] }, {}, ['v2-poses', 'v2-charge', 'v2-creneaux'], 10, 'recouvrement');
  await essai({ ...JUSTE, morel: ['c3', 8] }, {}, ['v2-charge'], 18, 'surcharge du camion 3 (1 600 kg pour 1 000)');
  await essai({ ...JUSTE, costa: ['c3', 24], diallo: ['c3', 32] }, {}, ['v2-creneaux', 'prevenir-qui', 'prevenir-date'].filter((k) => k !== 'prevenir-date'), 12, 'Diallo hors créneau, non prévenu');
  await essai({ ...JUSTE, costa: ['c3', 24], diallo: ['c3', 32] }, { prevenir: { clients: ['roux', 'haddad', 'diallo'] } }, ['v2-creneaux'], 15, 'Diallo hors créneau, prévenu');
  await essai({ ...JUSTE, costa: ['demain', 20] }, { prevenir: { clients: ['roux', 'haddad', 'costa'] } }, ['v2-creneaux'], 15, 'Costa reportée sans nécessité');
});

await v('ENT-12.3 : sabotages de la fiche et du message — tous les clients prévenus → −3 (17) ; aucun coché → −3 et −1 (« la date » exige au moins un client) ; date « dans un mois » → −1 (19) ; « annuler tout de suite » à Mme Roux → −2 (18)', async () => {
  const essai = async (o, tombes, score, quoi) => {
    await mont(); await jouer(o);
    const d = await detail();
    egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai({ prevenir: { clients: ['roux', 'haddad', 'martin', 'nguyen', 'lefevre', 'morel', 'garcia', 'perrin', 'diallo', 'costa'] } }, ['prevenir-qui'], 17, 'tous prévenus');
  await essai({ prevenir: { clients: [], date: 'demain' } }, ['prevenir-qui', 'prevenir-date'], 16, 'personne prévenu');
  await essai({ prevenir: { date: 'mois' } }, ['prevenir-date'], 19, 'date dans un mois');
  await essai({ roux: { regle: 'Vous pouvez annuler tout de suite, sans condition.' } }, ['annulation'], 18, 'annuler tout de suite');
  await essai({ roux: { date: 'Nous vous livrerons dans un mois.' } }, ['annulation'], 18, 'date dans un mois à Mme Roux');
});

await v('ENT-12.3 : questions au fil — les quatre notées valent 4 points : une fausse ôte 1 (19) ; toutes fausses ôtent 4 (16) ; la réflexion est posée et ne compte pas ; la réponse à Mme Roux ne donne pas le jalon avant l’envoi', async () => {
  const joue = async (RR) => {
    const sauve = { ...R }; Object.assign(R, RR);
    try { await mont(); await jouer(); } finally { Object.assign(R, sauve); }
    return (await noter(ACT)).score;
  };
  proche(await joue({ 'km-en-plus': 'moitie' }), 19, 'une fausse');
  proche(await joue({ 'peniche-pourquoi': 'poids', 'creneau-hors': 'rien', 'km-en-plus': 'dix', 'roux-annuler': 'jamais', 'camions-secours': 'decor' }), 16, 'toutes fausses (la réflexion ne compte pas)');
});

// ─────────────────────────────────────────────────────────── le corrigé
await v('ENT-12.3 : le fichier de corrigé est servi et dit les deux commandes qui ne tiennent pas', async () => {
  const r = await pg.evaluate(async () => { const C = await import('/contenus/corriges/ENT-12.3.js'); return { rep: C.CORRIGE.items[0].rep, n: C.CORRIGE.items.length, status: (await fetch('/contenus/corriges/ENT-12.3.js')).status }; });
  egal(r.status, 200, 'servi'); egal(r.n, 4, 'étapes');
  vrai(/Mme Roux et M\. Haddad ne le peuvent pas/.test(r.rep) && /8 commandes sur dix/.test(r.rep), 'corrigé : ' + r.rep.slice(0, 200));
});

await v('ENT-12.3 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
