// Suite de tests de Prepalog — bloc « vitrine » : ENT-25.1, « Et si tu choisissais la Logistique ? » (2de GATL, semaine des filières).
// `node outils/test.mjs vitrine` ne lance que ce bloc. Brief : `docs/briefs/ENT-25.1-vitrine-logistique.md`.
// Version du 14/11/2026 (demande de Tristan : « laisser que Spartoo ») : une réception chez Spartoo — la carte, le quai, la mise en stock, la saisie.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS. Les valeurs attendues
// sont ÉCRITES À LA MAIN (14/11/2026) :
//   ⓪ carte : Toolog à Saint-Quentin-Fallavier, région et département au premier coup.                               1 · 1
//   ① quai : 11 cartons comptés (12 annoncés), accepter avec réserves (carton endommagé, carton manquant), 1 et 1 sur le BL, signer.   3 · 3 · 3
//   ② mise en stock : P1 (sport, rotation A) → A1-T01-N2-E2.                                                          3
//   ③ saisie : REC-04140, lot LOT-PM-2611, 72 paires annoncées, 66 comptées, endommagé, accepté sous réserve.        1 · 3 · 2     = 20.

import { ouvrirPelleau, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'vitrine-logistique';
const ACT = '/activites/vitrine-logistique.js';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, bandeau, entrants, menu, aller } = P;
const mont = (o = {}) => P.monter({ uid: 'vitrine', ...o });
const noter = () => pg.evaluate(() => { const L = window.__f.enregistres; return L.length ? L[L.length - 1] : { score: 0, max: 20, detail: {} }; });
const fermerCartes = async () => { await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80); };
const allerV = async (vue) => { await fermerCartes(); await aller(vue); };

const RANGE_JUSTE = [['P1', 'A1-T01-N2-E2']];
const QUAI_JUSTE = { compte: 11, decision: 'reserves', motifs: ['avarie', 'manquant'], res: ['1', '1'] };
const SAISIE_JUSTE = { lot: 'LOT-PM-2611', annonce: 72, compte: 66, etat: 'abime', decision: 'reserve' };
const SUJETS = ['Bienvenue chez Spartoo !', 'Le camion de Puma arrive', 'On range la palette', 'On saisit l’entrée en stock', 'Bravo, la réception est finie'];

// Le quai : le camion, le BL, le déchargement, la palette (on en fait le tour), le compte, la décision, les réserves, la signature, la clôture.
async function jouerQuai(o = {}) {
  const q = { ...QUAI_JUSTE, ...o };
  await allerV('quai');
  await pg.click(`${Z} [data-q="passer1"]`);
  await pg.click(`${Z} [data-q="decharger"]`);
  if (await pg.isVisible(`${Z} [data-q="passer"]`)) await pg.click(`${Z} [data-q="passer"]`);   // « Passer l'animation » (absent en mouvement réduit)
  await pg.waitForSelector(`${Z} [data-q="vers3"]:not([disabled])`); await pg.click(`${Z} [data-q="vers3"]`);
  await pg.waitForSelector(`${Z} #qCompte`);
  await pg.click(`${Z} [data-q="tourner"]:not([data-sens])`); await pg.click(`${Z} [data-q="tourner"]:not([data-sens])`);
  await pg.fill(`${Z} #qCompte`, String(q.compte)); await pg.press(`${Z} #qCompte`, 'Enter');
  await pg.click(`${Z} #qDec-${q.decision}`);
  for (const m of q.motifs) await pg.click(`${Z} #qMot-${m}`);
  await pg.click(`${Z} [data-q="valider"]`);
  await pg.click(`${Z} [data-q="vers4"]`); await pg.click(`${Z} [data-q="vers4"]`); await pause();
  const champs = ['#qRes-P1', '#qRes2-P1'];
  for (let i = 0; i < q.res.length; i++) if (await present(champs[i])) await pg.fill(`${Z} ${champs[i]}`, q.res[i]);
  await pg.click(`${Z} [data-q="ecrire"]`); await pause();
  await pg.click(`${Z} [data-q="signer"]`); await pause();
  await pg.waitForSelector(`${Z} [data-q="clore"]:not([disabled])`); await pg.click(`${Z} [data-q="clore"]`); await pause();
}
// L'écran Réceptions : ouvrir REC-04140, écrire le lot et la ligne (en paires), valider (deux clics : la confirmation dans la page).
async function jouerSaisie(o = {}) {
  const a = { ...SAISIE_JUSTE, ...o }, sku = 'PM-RSX-BL-42';
  await allerV('receptions');
  await pg.click(`${Z} [data-ouvrir-rec="REC-04140"]`);
  await pg.waitForSelector(`${Z} #recLot`);
  await pg.fill(`${Z} #recLot`, a.lot);
  await pg.fill(`${Z} [data-rec="annonce"][data-sku="${sku}"]`, String(a.annonce));
  await pg.fill(`${Z} [data-rec="compte"][data-sku="${sku}"]`, String(a.compte));
  await pg.selectOption(`${Z} [data-rec="etat"][data-sku="${sku}"]`, a.etat);
  await pg.selectOption(`${Z} [data-rec="decision"][data-sku="${sku}"]`, a.decision);
  await pg.waitForSelector(`${Z} [data-valider-rec]:not([disabled])`);
  await pg.click(`${Z} [data-valider-rec]`);
  await pg.waitForSelector(`${Z} [data-confirme]`);
  await pg.click(`${Z} [data-confirme-oui]`); await pause();
}
async function jouerRangement(L = RANGE_JUSTE) {
  await allerV('entrepot');
  for (const [id, a] of L) {
    await pg.click(`${Z} .pe-bandeau [data-pe-pal="${id}"]`);
    if (await present('[data-pe="retour"]')) await pg.click(`${Z} [data-pe="retour"]`);
    await pg.click(`${Z} [data-pe-trav="${a.slice(0, 6)}"]`);
    await pg.click(`${Z} [data-pe-emp="${a}"]`);
    await pg.click(`${Z} [data-pe="retour"]`);
    await pause(60);
  }
}
async function jouer(o = {}) {
  await P.jouerCarte(o.carte || {});
  await jouerQuai(o.quai);
  await jouerRangement(o.rangement);
  await jouerSaisie(o.saisie);
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-25.1 : la séance se charge (2de, aucune compétence, guidage, bilan sans correction, cachée aux élèves) ; 10 jalons, poids = 20 ; inscrite au registre, entreprise n° 25', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/vitrine-logistique.js');
    const S = await import('/contenus/vitrine-logistique.js');
    const I = await import('/activites/index.js');
    const parGroupe = {};
    S.ETAPES.forEach((e) => { if (e.compte !== false) parGroupe[e.groupe] = (parGroupe[e.groupe] || 0) + e.poids; });
    return { meta: A.meta, n: S.ETAPES.length, total: S.ETAPES.reduce((s, e) => s + (e.compte === false ? 0 : e.poids), 0), parGroupe: Object.values(parGroupe),
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'vitrine-logistique'), entreprise: (I.ENTREPRISES.find((e) => e.n === 25) || {}).nom,
      logos: await Promise.all(['spartoo.jpg', 'prepalog.png'].map((f) => fetch('/contenus/trames/logos/' + f).then((x) => x.status))) };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.bilanListe, m.parcours, m.pret, m.ouverture, m.rubrique],
    ['ENT-25.1', ['2de'], [], 'guidage', 20, undefined, true, true, true, 'prof', 'simulog'], 'meta');
  egal(r.n, 10, 'nombre de jalons');
  proche(r.total, 20, 'somme des poids');
  egal(r.parGroupe, [2, 9, 3, 6], 'points par étape (carte, quai, mise en stock, saisie)');
  egal([r.auRegistre, r.entreprise], [true, 'Le Bac Pro Logistique'], 'registre');
  egal(r.logos, [200, 200], 'les logos sont servis par le site');
});

// ─────────────────────────────────────────────────────────── l'ouverture et l'inaction
await v('ENT-25.1 : à l’ouverture — un seul message de Sarah, la carte ouverte, le quai, le plan et Réceptions fermés ; rien fait → 0/20, rien de « juste »', async () => {
  await mont();
  egal((await entrants()).map((m) => m.subject), [SUJETS[0]], 'messages');
  const mn = await menu();
  vrai(mn.includes('localiser'), 'carte au menu : ' + mn);
  for (const x of ['quai', 'entrepot', 'receptions']) vrai(mn.includes(`fermee:${x}`), `« ${x} » fermé : ${mn}`);
  vrai(!mn.some((x) => /tri|ligne|telephone|fiche/.test(x)), 'un écran de l’ancienne visite est resté au menu : ' + mn);
  egal((await base()).receptions.map((r) => r.no), ['REC-04140'], 'la réception attend la saisie');
  const n = await noter();
  egal(n.score, 0, 'note');
  vrai(!Object.values(n.detail || {}).includes('ok'), 'un jalon juste sans rien faire');
});

// ─────────────────────────────────────────────────────────── le parcours
await v('ENT-25.1 : parcours juste — carte, quai, plan, Réceptions s’ouvrent l’un après l’autre ; 66 paires en stock avec le lot ; 20/20, bandeau ✓, messages de Sarah dans l’ordre', async () => {
  await mont();
  await P.jouerCarte();
  vrai((await menu()).includes('quai'), 'le quai s’ouvre après la carte');
  vrai((await menu()).includes('fermee:entrepot'), 'le plan reste fermé avant la signature');
  await jouerQuai();
  vrai((await menu()).includes('entrepot'), 'le plan s’ouvre après la signature du BL');
  vrai((await menu()).includes('fermee:receptions'), 'Réceptions reste fermé avant le rangement');
  await jouerRangement();
  vrai((await menu()).includes('receptions'), 'Réceptions s’ouvre après le rangement');
  await jouerSaisie();
  const b = await base();
  egal(b.stock['PM-RSX-BL-42'], 66, 'stock après la saisie (11 cartons × 6 paires)');
  egal(b.moves.filter((x) => x.ref === 'REC-04140').map((x) => [x.delta, x.lot]), [[66, 'LOT-PM-2611']], 'mouvement d’entrée avec le lot');
  const n = await noter();
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  const B = await bandeau();
  vrai(B.length >= 4 && B.every(([, e]) => e === 'ok'), 'bandeau : ' + JSON.stringify(B));
  egal((await entrants()).map((m) => m.subject), SUJETS, 'messages');
});

await v('ENT-25.1 : une erreur par étape — chaque jalon tombe seul (région, 12 cartons comptés, palette côté ville, 72 paires comptées)', async () => {
  await mont();
  await jouer({
    carte: { 'toolog:region': 1 },
    quai: { compte: 12 },
    rangement: [['P1', 'A2-T01-N3-E1']],
    saisie: { compte: 72 },
  });
  const n = await noter();
  const faux = Object.entries(n.detail).filter(([, e]) => e === 'ko').map(([k]) => k).sort();
  egal(faux, ['localiser:toolog:region', 'palette-P1', 'quai-comptage', 'saisie-quantites'], 'jalons faux');
  proche(n.score, 20 - 1 - 3 - 3 - 3, 'note');
});

// ─────────────────────────────────────────────────────────── le corrigé, les documents, le réseau
await v('ENT-25.1 : le corrigé est servi, le document dit le réel et le construit, aucun hôte externe, aucune erreur', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-25.1.js');
    const S = await import('/contenus/vitrine-logistique.js');
    return { status: (await fetch('/contenus/corriges/ENT-25.1.js')).status, n: C.CORRIGE.items.length,
      pieds: S.DOCUMENTS.map((d) => /Document pédagogique/.test(d.html) && /Réels/.test(d.html) && /Construits/.test(d.html)) };
  });
  egal([r.status, r.n], [200, 4], 'corrigé');
  egal(r.pieds, [true], 'mention en pied du document');
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
