// Suite de tests de Prepalog — bloc « action-818 » : ENT-8.18 Action, « deux magasins, deux palettes » (CAP OL, entraînement CAP-C3.1 à C3.3,
// erreur induite) : préparation guidée à la voix de deux commandes mélangées (chantier E-8, lot 4), un carton abîmé, le conseil de Yanis,
// « Contrôler mes palettes », film et étiquettes du bon magasin, réponse à Yanis. Brief `docs/briefs/ENT-8.18-action-deux-magasins.md` §8.
// `PORT_TESTS=8183 node outils/test.mjs action-818`.
//
// Valeurs ÉCRITES À LA MAIN, relevées une fois le 25/10/2026 :
//   « t818-a » : Châteauneuf-les-Martigues (palette 1, commande 4791) et Nîmes Cap Costières (palette 2, 4802), quai 4 ;
//                L1 LES 4 A2-T01-N1-E2 (81, Nîmes, un carton abîmé devant) · L2 CRO 5 A2-T04-N1-E2 (59, Nîmes) · L3 SER 6 B1-T05-N1-E2 (11, Nîmes) ·
//                L4 BOI 3 B1-T03-N1-E2 (72, Ch.) · L5 CAH 3 B2-T03-N1-E1 (49, Ch.) · L6 CAH 4 B2-T03-N1-E1 (49, Nîmes) · L7 ASS 5 B2-T03-N1-E3 (21, Ch.) ·
//                L8 VER 4 B1-T01-N1-E1 (86, Ch.).
//   « t818-b » : Marseille Saint-Loup (palette 1, 4636) et Nîmes (palette 2, 4639), quai 2 ; L1 CRO 3 A1-T01-N1-E1 (44, S.-L., abîmé) ·
//                L2 NET 5 B1-T06-N1-E3 (54, Nîmes) · L3 PEL 6 B2-T06-N1-E3 (16, S.-L.) · L4 CAH 4 B2-T05-N1-E2 (48, S.-L.) · L5 CAH 3 B2-T05-N1-E2 (48, Nîmes) ·
//                L6 BOI 3 B1-T03-N1-E2 (20, Nîmes) · L7 ASS 3 B2-T03-N1-E3 (32, S.-L.) · L8 VAS 4 B1-T01-N1-E2 (75, Nîmes).
// Poids : lignes 0,25 × 7 + rien d'abîmé 0,25 · abîmé 2 · grouper 2,5 × 2 · calage 0,5 × 4 · poids, hauteur 0,5 × 4 · film 0,5 × 2 · étiquettes
// 1 × 2 · questions 4 (q-pour-qui 0,75, q-colisage 1, q-melange 1 au bilan, q-retour 0,75, q-yanis 0,5).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, note, present, aller, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });

const ID = 'action-deux-magasins';
const EID = 'action-deux-magasins';
const REP_OUV = { 'k-lourds': 'bas', 'k-fragile': 'haut', 'k-abime': 'signale', 'k-colisage': 'liste', 'k-grouper': 'deux', 'k-pour-qui': 'nimes',
  'k-controle': 'avant', 'img-etiquette': 'palette', 'img-fragile': 'fragile' };
const BONNES_Q = { 'q-pour-qui': 'palette', 'q-colisage': 'liste', 'q-melange': 'manque', 'q-retour': 'transport', 'q-yanis': 'expliquer' };
const NOTES = ['ligne-1', 'ligne-2', 'ligne-3', 'ligne-4', 'ligne-5', 'ligne-6', 'ligne-7', 'abime-dit', 'rienAbime', 'grouper-1', 'grouper-2',
  'lourds-1', 'lourds-2', 'fragiles-1', 'fragiles-2', 'poids-1', 'poids-2', 'hauteur-1', 'hauteur-2', 'film-1', 'film-2', 'etiquettes-1', 'etiquettes-2'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus|bien vu|exactement|zéro erreur)\b/i;
const TA = { graine: 't818-a', mag: [['Châteauneuf-les-Martigues', 'Châteauneuf', '4791'], ['Nîmes Cap Costières', 'Nîmes', '4802']], quai: 4, ab: 0,
  L: [['A2-T01-N1-E2', '81', 4, 'Lessive', 'lourd', 1], ['A2-T04-N1-E2', '59', 5, 'Croquettes', 'lourd', 1], ['B1-T05-N1-E2', '11', 6, 'Serviettes', 'normal', 1],
    ['B1-T03-N1-E2', '72', 3, 'Boîtes', 'normal', 0], ['B2-T03-N1-E1', '49', 3, 'Cahiers', 'normal', 0], ['B2-T03-N1-E1', '49', 4, 'Cahiers', 'normal', 1],
    ['B2-T03-N1-E3', '21', 5, 'Assiettes', 'fragile', 0], ['B1-T01-N1-E1', '86', 4, 'Verres', 'fragile', 0]] };
const TB = { graine: 't818-b', mag: [['Marseille Saint-Loup', 'Saint-Loup', '4636'], ['Nîmes Cap Costières', 'Nîmes', '4639']], quai: 2, ab: 0,
  L: [['A1-T01-N1-E1', '44', 3, 'Croquettes', 'lourd', 0], ['B1-T06-N1-E3', '54', 5, 'Nettoyant', 'lourd', 1], ['B2-T06-N1-E3', '16', 6, 'Peluches', 'normal', 0],
    ['B2-T05-N1-E2', '48', 4, 'Cahiers', 'normal', 0], ['B2-T05-N1-E2', '48', 3, 'Cahiers', 'normal', 1], ['B1-T03-N1-E2', '20', 3, 'Boîtes', 'normal', 1],
    ['B2-T03-N1-E3', '32', 3, 'Assiettes', 'fragile', 0], ['B1-T01-N1-E2', '75', 4, 'Vases', 'fragile', 1]] };
const PHR = (o = {}) => Object.assign({ salutation: 'Salut Yanis,', fond: 'Je fais une palette par magasin, sinon on se trompe au quai.', politesse: 'Bon courage !', fin: 'Lea' }, o);

const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-deux-magasins.js');
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
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac818' },
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
async function allerA(a) {
  if (await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => false)) { await pg.click(Q('[data-pe-regles] summary')); await pause(40); }
  while (await present('[data-pvc="retour"]')) await pg.click(Q('[data-pvc="retour"]'));
  const m = /^([AB]\d)-T(\d+)/.exec(a);
  await pg.click(Q(`[data-pe-trav="${m[1]}-T${m[2]}"]`));
  await pg.click(Q(`[data-pe-emp="${a}"]`));
}
async function prendreAb(n) { for (let i = 0; i < n; i++) await pg.locator(Q('[data-pvc-carton][data-pvc-ab]:not(.pvc-sel)')).first().dispatchEvent('click'); }
async function prendre(n) { for (let i = 0; i < n; i++) await pg.locator(Q('[data-pvc-carton]:not(.pvc-sel):not([data-pvc-ab])')).first().dispatchEvent('click'); }
// `o.yanis` : tout sur la palette 1 (Yanis) ; sinon chacun sur SA palette. Toujours : un lourd va sur la palette tout de suite, le reste « À côté »
// et posé à la fin (normaux, puis fragiles). `o.abimeMuet` : l'abîmé pris sans rien dire.
async function preparer(T, o = {}, choix = BONNES_Q) {
  await allerV('entrepot');
  for (const [k, [a, code, q, , cl, pour]] of T.L.entries()) {
    await allerA(a);
    await taper(code); await qrep(choix);
    if (k === T.ab && !o.abimeMuet) {
      await prendreAb(1); await prendre(q - 1);
      await pg.click(Q('[data-vt-mot="abime"]')); await qrep(choix); await taper(1);
      await prendre(1); await taper(q);
    } else if (k === T.ab) { await prendreAb(1); await prendre(q - 1); await taper(q); } else { await prendre(q); await taper(q); }
    await qrep(choix);
    const dest = cl === 'lourd' ? String(o.yanis ? 0 : pour) : 'cote';
    await pg.click(Q(`[data-pvc-poser="${dest}"]`)); await qrep(choix);
  }
  while (await present('[data-pvc="retour"]')) await pg.click(Q('[data-pvc="retour"]'));
  for (const classe of ['normal', 'fragile']) {
    for (;;) {
      const e = await etatPlan();
      const k = (e.cote || []).findIndex((g) => T.L[+g.ligne.slice(1) - 1][4] === classe);
      if (k < 0) break;
      const pour = T.L[+e.cote[k].ligne.slice(1) - 1][5];
      await pg.click(Q(`[data-pvc-objet="${k}"]`)); await pg.click(Q(`[data-pvc-vers="${o.yanis ? 0 : pour}"]`)); await qrep(choix);
    }
  }
}
// Le contrôle : déplacer vers la palette 2 ce qui est à elle (lourds, normaux, fragiles), en partant de la palette 1.
async function controler(T, o = {}, choix = BONNES_Q) {
  await pg.click(Q('[data-pvc="controle"]')); await qrep(choix);
  if (o.corriger) {
    for (const classe of ['lourd', 'normal', 'fragile']) {
      for (;;) {
        const e = await etatPlan();
        const k = (e.palettes[0] || []).findIndex((g) => { const l = T.L[+g.ligne.slice(1) - 1]; return l[5] === 1 && l[4] === classe; });
        if (k < 0) break;
        await pg.click(Q(`[data-pvc-groupe="0:${k}"]`)); await pg.click(Q('[data-pvc-ctl="1"]')); await pause(30);
      }
    }
  }
  await pg.click(Q('[data-pvc="controle"]')); await qrep(choix);
}
async function emballer(o = {}, choix = BONNES_Q) {
  for (const p of [0, 1]) {
    await pg.selectOption(Q(`[data-pvc-film="${p}"]`), String((o.film || [3, 4])[p])); await qrep(choix);
    await pg.selectOption(Q(`[data-pvc-etiqmag="${p}"]`), String((o.mag || [0, 1])[p])); await qrep(choix);
    for (const k of ['avant', 'arriere', 'dessus']) { await pg.check(Q(`[data-pvc-etiq="${p}:${k}"]`)); await qrep(choix); }
  }
}
async function verifier(choix = BONNES_Q) { await pg.click(Q('[data-pvc="verifier"]')); await pause(); await qrep(choix); }
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(Q('[data-dossier="in"]'));
  await pg.click(Q(`.ent-obj:text-is("${sujet}")`));
  await pause();
}
async function repondre(lignes, choix = BONNES_Q) {
  await ouvrirMail('On est en retard'); await pg.click(Q('[data-repondre]'));
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  for (const [l, t] of Object.entries(lignes)) await pg.selectOption(Q(`[data-phrase="${l}"]`), { label: t });
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  await qrep(choix);
}
async function tout(T, o = {}) {
  await preparer(T, o.prep || {});
  if (!o.sansControle) await controler(T, o.ctl || {});
  await emballer(o.emb || {});
  await verifier();
  await repondre(PHR(o.phrases));
}

await v('ENT-8.18 : la séance se déclare — CAP-C3.1 à C3.3, entraînement, précédente ENT-8.17 ; 16 + 4 = 20 ; jalons ; au catalogue', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-deux-magasins.js');
    const S = await import('/contenus/action-ent818.js');
    const QS = await import('/contenus/questions/ENT-8.18.js');
    const C = await import('/activites/catalogue.js');
    return { meta: [A.meta.code, A.meta.temps, A.meta.precedente, A.meta.pret, A.meta.ouverture, A.meta.competencesCap.join()],
      poids: S.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: QS.QUESTIONS.part, q: QS.QUESTIONS.liste.filter((x) => x.type === 'fil').reduce((t, x) => t + x.poids, 0),
      ids: S.ETAPES.map((e) => e.id), cat: !!C.CATALOGUE.find((x) => x.meta.id === 'action-deux-magasins') };
  });
  egal(r.meta, ['ENT-8.18', 'entrainement', 'action-conditionner', true, 'prof', 'CAP-C3.1,CAP-C3.2,CAP-C3.3'], 'meta');
  egal([r.poids, r.part, r.q], [16, 4, 4], 'barème');
  egal(r.ids, NOTES, 'jalons');
  vrai(r.cat, 'au catalogue');
});

await v('ENT-8.18 : les deux témoins (valeurs à la main) ; 300 graines : Nîmes toujours là, un produit commun sur deux lignes consécutives, les deux palettes tiennent', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent818-donnees.js');
    const P = await import('/contenus/action-prepa-donnees.js');
    const res = (g) => { const j = D.jeuDe(g); return [D.magasinsDe(j).map((m) => [m.nom, m.court, m.num]), j.quai, D.abimeDe(j).k,
      j.lignes.map((l) => [l.a, j.codes[l.a], l.q, P.PRODUITS[l.produit].court, D.classeDe(l.produit), l.pour])]; };
    let sansNimes = 0, sansCommun = 0, hors = 0;
    for (let i = 0; i < 300; i++) {
      const j = D.jeuDe(`g${i}`);
      if (!D.magasinsDe(j).some((m) => m.court === 'Nîmes')) sansNimes++;
      if (!j.lignes.some((l, k) => k && j.lignes[k - 1].produit === l.produit && j.lignes[k - 1].pour !== l.pour)) sansCommun++;
      [0, 1].forEach((p) => { const b = P.palette(P.bonOrdre(j.lignes.filter((l) => l.pour === p))); if (!(b.poids <= P.KG_MAX && b.hauteur <= P.H_MAX)) hors++; });
    }
    return { a: res('t818-a'), b: res('t818-b'), sansNimes, sansCommun, hors };
  });
  for (const T of [TA, TB]) egal(r[T === TA ? 'a' : 'b'], [T.mag, T.quai, T.ab, T.L], T.graine);
  egal([r.sansNimes, r.sansCommun, r.hors], [0, 0, 0], 'contrôles');
});

await v('ENT-8.18 : parcours juste à l’écran (témoin a) — 20/20 ; Yanis écrit après la 3e ligne (notification) ; Samia au contrôle ; q-melange au bilan ; messages sans verdict, un vendredi', async () => {
  nouveau();
  await monter({ uid: 'ac818-a', graine: TA.graine });
  await allerV('entrepot');
  egal(await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => null), false, '« Les règles » fermées (entraînement)');
  await preparer(TA);
  vrai(await present('[data-carte-mail]'), 'la notification de Yanis');
  const M0 = await entrants();
  egal(M0.map((x) => x.subject), ['Deux magasins', 'On est en retard'], 'Yanis a écrit');
  await controler(TA);
  egal(VUS, ['q-pour-qui', 'q-colisage', 'q-melange'], 'q-pour-qui, q-colisage, q-melange');
  await emballer();
  await verifier();
  await repondre(PHR());
  egal(Object.keys(BONNES_Q).filter((id) => !VERDICTS[id]), ['q-melange'], 'q-melange corrigée au bilan');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(Object.keys(BONNES_Q).map((id) => n.detail[`question:${id}`]), Object.keys(BONNES_Q).map(() => 'ok'), 'questions');
  proche(n.score, 20, 'note');
  vrai(await fin(), 'le bandeau de fin (sans « Corriger » : celui sans liste)');
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Deux magasins', 'On est en retard', 'Avant de filmer', 'Lundi'], 'les messages');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun verdict');
  egal(new Date(M[0].ts).getDay(), 5, 'un vendredi');
  vrai(M[0].text.includes('Châteauneuf-les-Martigues et Nîmes'), 'Samia nomme les deux magasins');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.18 : suit Yanis (tout sur une palette) puis corrige tout au contrôle (témoin b) → 20/20 (sabotage : « grouper » jugé sur la pose au terminal ferait tomber ce cas)', async () => {
  nouveau();
  await monter({ uid: 'ac818-b', graine: TB.graine });
  await tout(TB, { prep: { yanis: true }, ctl: { corriger: true } });
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  proche(n.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.18 : tout sur une palette sans corriger → grouper 0, la palette 2 vide ne gagne rien ; étiquettes inversées → faux ; abîmé muet ; inaction 0', async () => {
  nouveau();
  await monter({ uid: 'ac818-y', graine: TA.graine });
  await tout(TA, { prep: { yanis: true }, phrases: { fond: 'OK, je mets tout ensemble.' } }, BONNES_Q);
  let n = await note();
  egal(jalonsFaux(n), ['grouper-1', 'grouper-2', 'lourds-1', 'lourds-2', 'fragiles-1', 'fragiles-2', 'poids-1', 'poids-2', 'hauteur-1', 'hauteur-2', 'film-1', 'film-2',
    'etiquettes-1', 'etiquettes-2'], 'jalons faux');
  proche(n.score, 4 + 4, 'note (prélever 2, abîmé 2, questions 4)');
  nouveau();
  await monter({ uid: 'ac818-inv', graine: TA.graine });
  await preparer(TA, { abimeMuet: true }); await controler(TA); await emballer({ mag: [1, 0] }); await verifier();
  n = await note();
  egal(jalonsFaux(n), ['abime-dit', 'rienAbime', 'etiquettes-1', 'etiquettes-2'], 'jalons faux');
  nouveau();
  await monter({ uid: 'ac818-rien', graine: TA.graine });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'rien fait : 0');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.18 : accompagné — règles ouvertes, la travée cernée, la liste de colisage se coche ; confirmé → 20/20', async () => {
  nouveau();
  await monter({ uid: 'ac818-acc', graine: TA.graine, aisance: 'accompagne' });
  await allerV('entrepot');
  egal(await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => null), true, 'règles ouvertes');
  egal(await pg.$eval(Q('[data-pvc-montre]'), (e) => e.dataset.pvcMontre).catch(() => null), 'A2-T01', 'la travée cernée');
  await preparer(TA);
  await pg.click(Q('[data-pvc="controle"]')); await qrep();
  vrai((await pg.locator(Q('.pvc-coche')).count()) >= 6, 'la liste de colisage se coche');
  nouveau();
  await monter({ uid: 'ac818-conf', graine: TB.graine, aisance: 'confirme' });
  await tout(TB);
  const n = await note();
  proche(n.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

}
