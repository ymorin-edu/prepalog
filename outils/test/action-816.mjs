// Suite de tests de Prepalog — bloc « action-816 » : ENT-8.16 Action, « déstocker et signaler » (CAP OL, guidage CAP-C3.2) : préparation guidée à
// la voix avec un carton abîmé et un emplacement vide (chantier E-8, lot 3), fiche « Le stock après ma préparation » jugée sur ce que l'élève a dit,
// compte rendu (forme seule). Brief `docs/briefs/ENT-8.16-action-destocker.md` §8. `PORT_TESTS=8163 node outils/test.mjs action-816`.
//
// Valeurs ÉCRITES À LA MAIN, relevées une fois le 25/10/2026 :
//   « t816-a » : mission 4406, Marseille Grand Littoral, quai 6 ; L1 NET 6 A1-T02-N1-E1 (27 ; un carton abîmé devant) · L2 LES 6 A2-T05-N1-E2 (48) ·
//                L3 CRO 6 B2-T04-N1-E1 (86 ; VIDE) · L4 BOI 4 B1-T03-N1-E2 (21) · L5 BOU 3 B2-T03-N1-E2 (20) · L6 SER 4 B2-T02-N1-E3 (68) · L7 CAH 5 B2-T01-N1-E3 (80).
//   « t816-b » : mission 4820, Marseille Saint-Loup, quai 3 ; L1 CRO 6 A1-T01-N1-E1 (56 ; abîmé) · L2 LES 6 B1-T06-N1-E2 (51) · L3 NET 5 B1-T06-N1-E3 (45) ·
//                L4 BOU 3 B2-T06-N1-E2 (85) · L5 PEL 5 B2-T06-N1-E3 (53) · L6 SER 5 B1-T02-N1-E1 (43 ; VIDE) · L7 CAH 4 B2-T01-N1-E3 (34).
// Poids : lignes normales 5 · abîmé 3 · vide 1,5 + 1,5 · rien d'abîmé 1 · fiche 3 · forme 1 · questions 4 (q-abime 1 au bilan, q-vide 0,75,
// q-reappro 0,75, q-tomber 1,5).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, note, present, aller, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });

const ID = 'action-destocker';
const EID = 'action-destocker';
const REP_OUV = { 'k-anomalie': 'probleme', 'k-signaler': 'signale', 'k-reserve': 'reserve', 'k-code': 'lisse', 'k-cariste': 'kevin', 'k-actualiser': 'maj',
  'img-abime': 'abime', 'img-vide': 'vide' };
const BONNES_Q = { 'q-abime': 'vendre', 'q-vide': 'kevin', 'q-reappro': 'reappro', 'q-tomber': 'non' };
const GROUPES = ['Prélever', 'Le carton abîmé', 'L’emplacement vide', 'Rien d’abîmé sur la palette', 'Ce que sait le système', 'Rendre compte à Samia',
  'Les questions de Samia'];
const NOTES = ['ligne-1', 'ligne-2', 'ligne-3', 'ligne-4', 'ligne-5', 'abime-dit', 'vide-dit', 'vide-reprise', 'rienAbime', 'stock-abime', 'stock-vide',
  'stock-suivant', 'cr-forme'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus|bien vu|exactement)\b/i;
const TA = { graine: 't816-a', num: '4406', magasin: 'Marseille Grand Littoral', quai: 6, ab: 0, vide: 2,
  L: [['A1-T02-N1-E1', '27', 6], ['A2-T05-N1-E2', '48', 6], ['B2-T04-N1-E1', '86', 6], ['B1-T03-N1-E2', '21', 4], ['B2-T03-N1-E2', '20', 3], ['B2-T02-N1-E3', '68', 4], ['B2-T01-N1-E3', '80', 5]] };
const TB = { graine: 't816-b', num: '4820', magasin: 'Marseille Saint-Loup', quai: 3, ab: 0, vide: 5,
  L: [['A1-T01-N1-E1', '56', 6], ['B1-T06-N1-E2', '51', 6], ['B1-T06-N1-E3', '45', 5], ['B2-T06-N1-E2', '85', 3], ['B2-T06-N1-E3', '53', 5], ['B1-T02-N1-E1', '43', 5], ['B2-T01-N1-E3', '34', 4]] };
const PHR = (T, o = {}) => Object.assign({ salutation: 'Bonjour Samia,', politesse: 'Bonne journée !', fin: 'Lea' }, o);

const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-destocker.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.graine) db.tirage = { graine: o.graine, pose: 1 };
  if (o.rep) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac816' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }), suivante: null,
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const Q = (s) => `${Z} ${s}`;
const VERDICTS = {};
let VUS = [];
const nouveau = () => { VUS = []; Object.keys(VERDICTS).forEach((k) => delete VERDICTS[k]); };
const panneau = () => pg.$eval(Q('[data-q-panneau]'), (e) => e.dataset.qPanneau).catch(() => null);
async function qrep(choix = BONNES_Q) {
  await pause(60);
  for (let i = 0; i < 6; i++) {
    const id = await panneau();
    if (!id) return;
    VUS.push(id);
    await pg.click(Q(`[data-q-choix="${choix[id] || 'x'}"][data-q="${id}"]`)).catch(async () => pg.click(Q(`[data-q="${id}"][data-q-choix]:not([data-q-choix="${BONNES_Q[id]}"])`)));
    await pg.click(Q(`[data-q-repondre="${id}"]`));
    await pause();
    VERDICTS[id] = !!(await pg.$(Q('[data-q-verdict]')));
    await pg.click(Q('[data-q-reprendre]'));
    await pause();
  }
}
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(Q('[data-confirme-oui]')); await pause(); } };
const jalonsFaux = (n) => NOTES.filter((j) => n.detail[j] !== 'ok');
const etatPlan = () => pg.evaluate((EID) => JSON.parse(JSON.stringify((window.__f.db.entrepots || {})[EID] || null)), EID);
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});

const taper = async (x) => { await pg.fill(Q('[data-terminal] input'), String(x)); await pg.keyboard.press('Enter'); await pause(30); };
const phrase = () => pg.evaluate((Z) => document.querySelector(`${Z} [data-terminal]`).textContent.replace(/\s+/g, ' '), Z);
async function allerA(a) {
  if (await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => false)) { await pg.click(Q('[data-pe-regles] summary')); await pause(40); }
  while (await present('[data-pvc="retour"]')) await pg.click(Q('[data-pvc="retour"]'));
  const m = /^([AB]\d)-T(\d+)/.exec(a);
  await pg.click(Q(`[data-pe-trav="${m[1]}-T${m[2]}"]`));
  await pg.click(Q(`[data-pe-emp="${a}"]`));
}
async function prendreAb(n) { for (let i = 0; i < n; i++) await pg.locator(Q('[data-pvc-carton][data-pvc-ab]:not(.pvc-sel)')).first().dispatchEvent('click'); }
async function prendre(n) { for (let i = 0; i < n; i++) await pg.locator(Q('[data-pvc-carton]:not(.pvc-sel):not([data-pvc-ab])')).first().dispatchEvent('click'); }
async function preparer(T, o = {}, choix = BONNES_Q) {
  await allerV('entrepot');
  for (const [k, [a, code, q]] of T.L.entries()) {
    await allerA(a);
    await taper(code); await qrep(choix);
    if (k === T.ab) {
      if (o.abimeMuet) { await prendreAb(1); await prendre(q - 1); await taper(q); }
      else {
        await prendreAb(1); await prendre(q - 1);
        await pg.click(Q('[data-vt-mot="abime"]')); await qrep(choix); await taper(1);
        await prendre(1); await taper(q);
      }
    } else if (k === T.vide) {
      if (o.videManquant) { await pg.click(Q('[data-vt-mot="manquant"]')); await qrep(choix); await taper(q); } else await pg.click(Q('[data-vt-mot="vide"]'));
      await pause(); await qrep(choix);
      await allerA(a);
      await taper(code); await prendre(q); await taper(q);
    } else { await prendre(q); await taper(q); }
    await qrep(choix);
    await pg.click(Q('[data-pvc-poser="0"]')); await qrep(choix);
  }
  while (await present('[data-pvc="retour"]')) await pg.click(Q('[data-pvc="retour"]'));
}
async function verifier(choix = BONNES_Q) { await pg.click(Q('[data-pvc="verifier"]')); await pause(); await qrep(choix); }
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(Q('[data-dossier="in"]'));
  await pg.click(Q(`.ent-obj:text-is("${sujet}")`));
  await pause();
}
const choixDe = (ligne) => pg.$$eval(Q(`[data-phrase="${ligne}"] option`), (L) => L.map((x) => x.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));
async function repondre(lignes, choix = BONNES_Q, deja = false) {
  if (!deja) { await ouvrirMail('Rien de spécial ?'); await pg.click(Q('[data-repondre]')); }
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  for (const [l, t] of Object.entries(lignes)) await pg.selectOption(Q(`[data-phrase="${l}"]`), { label: t });
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  await qrep(choix);
}
async function stock(rep, choix = BONNES_Q) {
  await allerV('fiche');
  for (const [id, val] of Object.entries(rep)) { await pg.selectOption(Q(`[data-fiche-champ="${id}"]`), val); await pause(20); }
  await pg.click(Q('[data-fiche-envoyer]'));
  await confirmer();
  await qrep(choix);
}
const STOCK_JUSTE = { abime: 'oui', vide: 'vide', suivant: 'vide' };
async function tout(T, o = {}) {
  await preparer(T, o.prep || {});
  await verifier();
  await stock(o.stock || STOCK_JUSTE);
  await repondre(PHR(T, o.phrases));
}
await v('ENT-8.16 : la séance se déclare — CAP-C3.2, guidage, précédente ENT-8.15 ; 16 + 4 = 20 ; jalons communs ; au catalogue', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-destocker.js');
    const S = await import('/contenus/action-ent816.js');
    const QS = await import('/contenus/questions/ENT-8.16.js');
    const C = await import('/activites/catalogue.js');
    return { meta: [A.meta.code, A.meta.temps, A.meta.precedente, A.meta.pret, A.meta.ouverture, A.meta.competencesCap.join()],
      poids: S.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: QS.QUESTIONS.part, q: QS.QUESTIONS.liste.filter((x) => x.type === 'fil').reduce((t, x) => t + x.poids, 0),
      ids: S.ETAPES.map((e) => e.id), cat: !!C.CATALOGUE.find((x) => x.meta.id === 'action-destocker') };
  });
  egal(r.meta, ['ENT-8.16', 'guidage', 'action-preparer', true, 'prof', 'CAP-C3.2'], 'meta');
  egal([r.poids, r.part, r.q], [16, 4, 4], 'barème');
  egal(r.ids, NOTES, 'jalons');
  vrai(r.cat, 'au catalogue');
});

await v('ENT-8.16 : les deux témoins (valeurs à la main) — mission, lignes, codes, la ligne abîmée et la ligne vide ; 300 graines : l’abîmé et le vide jamais voisins', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent816-donnees.js');
    const res = (g) => { const j = D.jeuDe(g), M = D.missionDe(j), A = D.anomaliesDe(j); return [M.num, M.magasin, M.quai, A.abime.k, A.vide.k, j.lignes.map((l) => [l.a, j.codes[l.a], l.q])]; };
    let voisins = 0;
    for (let i = 0; i < 300; i++) { const A = D.anomaliesDe(D.jeuDe(`g${i}`)); if (Math.abs(A.abime.k - A.vide.k) <= 1) voisins++; }
    return { a: res('t816-a'), b: res('t816-b'), voisins };
  });
  for (const T of [TA, TB]) egal(r[T === TA ? 'a' : 'b'], [T.num, T.magasin, T.quai, T.ab, T.vide, T.L], T.graine);
  egal(r.voisins, 0, 'jamais voisins');
});

await v('ENT-8.16 : parcours juste à l’écran (témoin a) — 20/20 ; Kevin descend la réserve ; l’écran « Stock » dit oui / oui / oui ; q-abime au bilan ; messages sans verdict, un mardi', async () => {
  nouveau();
  await monter({ uid: 'ac816-a', graine: TA.graine });
  await allerV('entrepot');
  egal(await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => null), true, '« Les mots du terminal » ouverts');
  await preparer(TA);
  egal(VUS, ['q-abime', 'q-vide', 'q-reappro'], 'q-abime, q-vide, q-reappro dans l’ordre');
  const e = await etatPlan();
  egal([e.terminal.fin > 0, e.reserves.map((x) => x.a), (e.ecartes || []).map((x) => x.a)], [true, [TA.L[TA.vide][0]], [TA.L[TA.ab][0]]], 'réserve descendue, abîmé mis de côté');
  await verifier();
  const S = await pg.evaluate(async () => { const M = await import('/contenus/action-ent816.js'); return M.DOCUMENTS.find((d) => d.id === 'stock').html(window.__f.db); });
  vrai((S.match(/>oui</g) || []).length === 3, 'l’écran « Stock » : trois oui');
  await stock(STOCK_JUSTE);
  egal(VUS.slice(-1), ['q-tomber'], 'q-tomber à la fiche envoyée');
  await ouvrirMail('Rien de spécial ?'); await pg.click(Q('[data-repondre]'));
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('abime'))[0] !== undefined, true, 'phrases');
  await repondre(PHR(TA, { abime: `Un carton était abîmé en ${TA.L[0][0]} : je l’ai signalé et laissé au picking.`, vide: `L’emplacement ${TA.L[2][0]} était vide : Kevin a descendu la réserve.` }), BONNES_Q, true);
  egal(Object.keys(BONNES_Q).filter((id) => !VERDICTS[id]), ['q-abime'], 'q-abime corrigée au bilan');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(Object.keys(BONNES_Q).map((id) => n.detail[`question:${id}`]), Object.keys(BONNES_Q).map(() => 'ok'), 'questions');
  proche(n.score, 20, 'note');
  egal((await fin()).lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Une commande plus longue', 'Ce que sait le système', 'Rien de spécial ?', 'Jeudi'], 'les messages');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun verdict');
  egal(new Date(M[0].ts).getDay(), 2, 'un mardi');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.16 : parcours juste (témoin b, le vide en ligne 6) → 20/20', async () => {
  nouveau();
  await monter({ uid: 'ac816-b', graine: TB.graine });
  await tout(TB, { phrases: { abime: `Un carton était abîmé en ${TB.L[0][0]} : je l’ai signalé et laissé au picking.`, vide: `L’emplacement ${TB.L[5][0]} était vide : Kevin a descendu la réserve.` } });
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  proche(n.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.16 : le carton abîmé pris sans rien dire — « abîmé signalé » et « rien d’abîmé » faux, le carton dessiné sur la palette ; la fiche est jugée sur CE geste : « Non, je ne l’ai pas dit » est juste (sabotage : juger contre la réponse idéale ferait tomber ce cas)', async () => {
  nouveau();
  await monter({ uid: 'ac816-muet', graine: TA.graine });
  await preparer(TA, { abimeMuet: true });
  egal(await pg.locator(Q('.pvc-pal [data-pvc-abime]')).count(), 1, 'le carton abîmé dessiné sur la palette');
  await verifier();
  await stock({ abime: 'non', vide: 'vide', suivant: 'vide' });
  await repondre(PHR(TA, { abime: 'Je n’ai vu aucun carton abîmé.', vide: `L’emplacement ${TA.L[2][0]} était vide : Kevin a descendu la réserve.` }));
  const n = await note();
  egal(jalonsFaux(n), ['abime-dit', 'rienAbime'], 'jalons faux');
  proche(n.score, 16, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.16 : « Manquant » au lieu d’« Emplacement vide » — jamais bloquant (Kevin descend aussi la réserve) ; « vide dit » et « reprise » faux ; la fiche juste est « il manquait des cartons » ; inaction → 0/20', async () => {
  nouveau();
  await monter({ uid: 'ac816-manq', graine: TB.graine });
  await preparer(TB, { videManquant: true });
  const e = await etatPlan();
  egal(e.terminal.fin > 0, true, 'le terminal est fini');
  await verifier();
  await stock({ abime: 'oui', vide: 'manque', suivant: 'vide' });
  await repondre(PHR(TB, { abime: `Un carton était abîmé en ${TB.L[0][0]} : je l’ai signalé et laissé au picking.`, vide: `En ${TB.L[5][0]}, j’ai dit « Manquant » : Kevin a descendu la réserve.` }));
  const n = await note();
  egal(jalonsFaux(n), ['vide-dit', 'vide-reprise'], 'jalons faux');
  proche(n.score, 17, 'note');
  nouveau();
  await monter({ uid: 'ac816-rien', graine: TA.graine });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'rien fait : 0');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.16 : accompagné — une aide par mot, la travée cernée ; confirmé — les mots repliés, 20/20', async () => {
  nouveau();
  await monter({ uid: 'ac816-acc', graine: TA.graine, aisance: 'accompagne' });
  await allerV('entrepot');
  egal(await pg.$eval(Q('[data-pvc-montre]'), (e) => e.dataset.pvcMontre).catch(() => null), 'A1-T02', 'la travée de la ligne 1 cernée');
  vrai((await pg.textContent(Q('[data-pe-regles]'))).includes('quand un carton est abîmé'), 'une aide par mot');
  nouveau();
  await monter({ uid: 'ac816-conf', graine: TA.graine, aisance: 'confirme' });
  await allerV('entrepot');
  egal(await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => null), false, 'repliés au confirmé');
  await tout(TA, { phrases: { abime: `Un carton était abîmé en ${TA.L[0][0]} : je l’ai signalé et laissé au picking.`, vide: `L’emplacement ${TA.L[2][0]} était vide : Kevin a descendu la réserve.` } });
  const n = await note();
  proche(n.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

}
