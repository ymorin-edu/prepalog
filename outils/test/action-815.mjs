// Suite de tests de Prepalog — bloc « action-815 » : ENT-8.15 Action, « prendre en charge une préparation » (CAP OL, guidage CAP-C3.1) :
// inspection du poste, fiche « Ma mission », préparation guidée à la voix (chantier E-8), compte rendu par phrases. Brief
// `docs/briefs/ENT-8.15-action-preparer.md` §8. `PORT_TESTS=8153 node outils/test.mjs action-815` ne lance que ce bloc. Aides communes :
// `outils/test/france-boissons/commun.mjs` (`ouvrirFB`) et `outils/test/pelleau/commun.mjs` (`aidesInspection`). Tout se joue au clic.
//
// Valeurs ÉCRITES À LA MAIN. Deux élèves TÉMOINS (graine posée dans `db.tirage`), relevés une fois le 25/10/2026 et recopiés ici :
//   « t815-a » : plan de circulation absent, avertisseur du n° 1 muet ; mission 4408, Marseille La Valentine, 20 cartons, quai 4, 8 h 00 ;
//                NET 3 A2-T05-N1-E3 (87) · CRO 4 B2-T04-N1-E1 (70) · LES 5 B1-T02-N1-E3 (75) · SER 4 B2-T02-N1-E2 (59) · CAH 4 B2-T01-N1-E3 (99).
//   « t815-c » : extincteur absent, fourche tordue ; mission 4752, Marseille Grand Littoral, 22 cartons, quai 5, 8 h 15 ;
//                NET 5 A2-T03-N1-E1 (25) · PEL 6 B2-T06-N1-E3 (43) · CAH 3 B1-T04-N1-E1 (27) · BOI 5 B1-T03-N1-E2 (20) · BOU 3 B2-T03-N1-E2 (55).
// Poids : poste 5 (2 + 2 + aucun faux 1 ; l'essai de l'avertisseur 0) · mission 4 · lignes 5 · compte rendu 2 · questions 4 (q-caces 0,75,
// q-epi 0,5, q-code 0,75, q-circuit 1 au bilan, q-nuit 1).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';
import { aidesInspection } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, note, present, aller, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const I = aidesInspection({ pg, Z, pause, vrai });

const ID = 'action-preparer';
const EID = 'action-preparer';
const REP_OUV = { 'k-preparer': 'prendre', 'k-ligne': 'produit', 'k-picking': 'sol', 'k-quai': 'quai', 'k-terminal': 'ligne', 'k-mission': 'mission',
  'img-transpalette': 'transpalette', 'img-terminal': 'terminal' };
const BONNES_Q = { 'q-caces': 'autorisation', 'q-epi': 'pied', 'q-code': 'prouver', 'q-circuit': 'court', 'q-nuit': 'loi' };
const GROUPES = ['Prendre mon poste', 'Lire ma mission', 'Suivre le circuit', 'Rendre compte à Samia', 'Les questions de Samia'];
const NOTES = ['securite-site-defaut', 'securite-tp1-defaut', 'securite-aucun-faux', 'mission-magasin', 'mission-cartons', 'mission-quai', 'mission-heure',
  'ligne-1', 'ligne-2', 'ligne-3', 'ligne-4', 'ligne-5', 'cr-forme', 'cr-message'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus|bien vu)\b/i;
const TA = { graine: 't815-a', site: 'affichage', engin: 'avertisseur', num: '4408', magasin: 'Marseille La Valentine', cartons: 20, quai: 4, depart: '8 h 00',
  L: [['A2-T05-N1-E3', '87', 3], ['B2-T04-N1-E1', '70', 4], ['B1-T02-N1-E3', '75', 5], ['B2-T02-N1-E2', '59', 4], ['B2-T01-N1-E3', '99', 4]] };
const TC = { graine: 't815-c', site: 'extincteur', engin: 'fourcheTordue', num: '4752', magasin: 'Marseille Grand Littoral', cartons: 22, quai: 5, depart: '8 h 15',
  L: [['A2-T03-N1-E1', '25', 5], ['B2-T06-N1-E3', '43', 6], ['B1-T04-N1-E1', '27', 3], ['B1-T03-N1-E2', '20', 5], ['B2-T03-N1-E2', '55', 3]] };
const prete = (T) => `La commande de ${T.magasin} est prête, quai ${T.quai}.`;
const PHR = (T, o = {}) => Object.assign({ salutation: 'Bonjour Samia,', prete: prete(T), politesse: 'Bonne journée !', fin: 'Lea' }, o);

const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-preparer.js');
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
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac815' },
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

// ① le poste : `signaux` = les groupes de points marqués puis signalés ; `essai` : appuyer sur l'avertisseur du n° 1.
async function poste({ essai = true, signaux = [['site-defaut', 'tp1-defaut']], choix = BONNES_Q } = {}) {
  await allerV('inspection');
  if (essai) { await I.essai(1); await pause(); }
  for (const g of signaux) { for (const id of g) await I.cliquerPoint(id); await I.signaler(); await pause(); }
  await I.valider(); await pause();
  await qrep(choix);
}
// ② la fiche : `rep` = { ligne: valeur } (défaut : toutes justes).
async function mission(rep = {}, choix = BONNES_Q) {
  await allerV('fiche');
  for (const id of ['magasin', 'cartons', 'quai', 'heure']) { await pg.selectOption(Q(`[data-fiche-champ="${id}"]`), rep[id] || 'juste'); await pause(20); }
  await pg.click(Q('[data-fiche-envoyer]'));
  await confirmer();
  await qrep(choix);
}
// ③ la préparation au terminal : `o.codeFaux` (un code faux d'abord sur la ligne 1), `o.mauvaise` (le rang d'une ligne posée avec un carton de moins).
const taper = async (x) => { await pg.fill(Q('[data-terminal] input'), String(x)); await pg.keyboard.press('Enter'); await pause(30); };
const phrase = () => pg.evaluate((Z) => document.querySelector(`${Z} [data-terminal]`).textContent.replace(/\s+/g, ' '), Z);
async function allerA(a) {
  while (await present('[data-pvc="retour"]')) await pg.click(Q('[data-pvc="retour"]'));
  const m = /^([AB]\d)-T(\d+)/.exec(a);
  await pg.click(Q(`[data-pe-trav="${m[1]}-T${m[2]}"]`));
  await pg.click(Q(`[data-pe-emp="${a}"]`));
}
async function prendre(n) { for (let i = 0; i < n; i++) await pg.locator(Q('[data-pvc-carton]:not(.pvc-sel):not([data-pvc-ab])')).first().dispatchEvent('click'); }
async function preparer(T, o = {}, choix = BONNES_Q) {
  await allerV('entrepot');
  for (const [k, [a, code, q]] of T.L.entries()) {
    await allerA(a);
    if (k === 0 && o.codeFaux) await taper(code === '11' ? '12' : '11');
    await taper(code); await qrep(choix);
    await prendre(q);
    await taper(q);
    if (o.mauvaise === k + 1) {
      // un carton de moins sélectionné que dit au terminal : la pose le refuse-t-elle ? Sinon la ligne est fausse
      await pg.locator(Q('[data-pvc-carton].pvc-sel')).first().dispatchEvent('click');
    }
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
  if (!deja) { await ouvrirMail('Ta commande ?'); await pg.click(Q('[data-repondre]')); }
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  for (const [l, t] of Object.entries(lignes)) await pg.selectOption(Q(`[data-phrase="${l}"]`), { label: t });
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  await qrep(choix);
}
async function tout(T, o = {}) {
  await poste(o.poste);
  await mission(o.fiche);
  await preparer(T, o.prep || {});
  await verifier();
  await repondre(PHR(T, o.phrases));
}

await v('ENT-8.15 : la séance se déclare — CAP-C3.1, guidage, précédente ENT-8.13, prête et ouverte par le prof ; 16 points de jalons + 4 de questions = 20 ; mêmes ids pour toutes les graines ; part 4 ; les huit inspections possibles acceptées', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-preparer.js');
    const S = await import('/contenus/action-ent815.js');
    const QS = await import('/contenus/questions/ENT-8.15.js');
    const C = await import('/activites/catalogue.js');
    return { meta: [A.meta.code, A.meta.temps, A.meta.precedente, A.meta.pret, A.meta.ouverture, A.meta.competencesCap.join()],
      poids: S.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: QS.QUESTIONS.part,
      q: QS.QUESTIONS.liste.filter((x) => x.type === 'fil').reduce((t, x) => t + x.poids, 0),
      ids: S.ETAPES.map((e) => e.id), cat: !!C.CATALOGUE.find((x) => x.meta.id === 'action-preparer'),
      refus: await (async () => { const E = await import('/core/types/entrepot.js'); const P = await import('/contenus/action-prepa-donnees.js');
        try { E.jalonsEntrepot({}, P.preparation({ id: 'x815', lignes: 5, terminal: { finir: false }, jalons: [{ type: 'lignes' }, { type: 'film' }] })('a', {})); return ''; }
        catch (x) { return x.message; } })() };
  });
  egal(r.meta, ['ENT-8.15', 'guidage', 'action-palette-a-cote', true, 'prof', 'CAP-C3.1'], 'meta');
  egal([r.poids, r.part, r.q], [16, 4, 4], 'barème');
  egal(r.ids, ['securite-site-defaut', 'securite-tp1-defaut', 'essai-1', 'securite-aucun-faux', ...NOTES.slice(3)], 'jalons');
  vrai(r.cat, 'au catalogue');
  vrai(r.refus.includes('terminal.finir: false'), `finir: false avec un jalon film : refusé (${r.refus})`);
});

await v('ENT-8.15 : les deux témoins (valeurs à la main) — défauts, mission, lignes et codes ; la fiche propose la mission de L’ÉLÈVE ; l’écran du terminal la dessine', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent815-donnees.js');
    const S = await import('/contenus/action-ent815.js');
    const res = (g) => { const j = D.jeuDe(g), M = D.missionDe(j);
      return [D.defautSiteDe(g), D.defautEnginDe(g), M.num, M.magasin, M.cartons, M.quai, M.depart, j.lignes.map((l) => [l.a, j.codes[l.a], l.q])]; };
    const doc = S.DOCUMENTS.find((d) => d.id === 'terminal-accueil').html({ tirage: { graine: 't815-c' } });
    return { a: res('t815-a'), c: res('t815-c'), doc: doc.includes('Mission 4752') && doc.includes('Marseille Grand Littoral') && doc.includes('22 cartons') && doc.includes('Quai 5') && doc.includes('8 h 15') };
  });
  for (const T of [TA, TC]) egal(r[T === TA ? 'a' : 'c'], [T.site, T.engin, T.num, T.magasin, T.cartons, T.quai, T.depart, T.L], T.graine);
  vrai(r.doc, 'l’écran du terminal dessine la mission du témoin c');
});

await v('ENT-8.15 : parcours juste à l’écran (témoin a, avertisseur muet) — 20/20, les questions dans l’ordre, q-circuit corrigée au bilan, Samia écrit à « Vérifier », les messages sans verdict, un lundi', async () => {
  nouveau();
  await monter({ uid: 'ac815-a', graine: TA.graine });
  await poste();
  egal(VUS, ['q-caces'], 'q-caces au poste pris');
  const P1 = (await entrants()).map((m) => m.subject);
  vrai(P1.includes('Ta mission'), 'Samia envoie la mission au poste pris');
  await mission();
  egal(VUS.slice(-1), ['q-epi'], 'q-epi à la fiche envoyée');
  await allerV('entrepot');
  const cerne = await pg.$(Q('[data-pvc-montre]'));
  egal(cerne, null, 'standard : aucune travée cernée');
  await preparer(TA, { codeFaux: true });
  egal(VUS.slice(2), ['q-code', 'q-circuit'], 'q-code au premier code juste, q-circuit à la 3e ligne');
  const e = await etatPlan();
  egal([e.terminal.fin > 0, e.terminal.codesFaux], [true, { L1: 1 }], 'terminal fini, un code faux compté');
  egal(await present('[data-pvc-film="0"]'), false, 'ni film ni étiquettes');
  vrai((await pg.textContent(Q('[data-pvc-sans-finir]'))).includes('Yanis filme et étiquette ta palette.'), 'Yanis filme');
  vrai((await phrase()).includes('Commande terminée. Va au quai 4.'), 'le terminal envoie au quai de la mission');
  egal((await entrants()).some((m) => m.subject === 'Ta commande ?'), false, 'Samia attend « Vérifier »');
  await verifier();
  egal(await pg.$$eval(Q('[data-pvc-jalon]'), (L) => L.map((x) => [x.dataset.pvcJalon, x.dataset.ok])), [1, 2, 3, 4, 5].map((k) => [`ligne-${k}`, 'true']), 'le verdict par ligne');
  const C = (await entrants()).find((m) => m.subject === 'Ta commande ?');
  vrai(!!C && C.text.startsWith('Alors, Lea, ta commande ?'), 'Samia demande la commande');
  await ouvrirMail('Ta commande ?'); await pg.click(Q('[data-repondre]'));
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('prete')).sort(), [prete(TA), 'La commande de Marseille La Valentine est prête, quai 5.', 'La commande de Marseille Centre Bourse est prête, quai 4.',
    'Je n’ai pas fini, je ne sais pas où elle est.'].sort(), 'la phrase de la commande : SA mission et les pièges');
  await repondre(PHR(TA), BONNES_Q, true);
  egal(VUS.slice(-1), ['q-nuit'], 'q-nuit au message envoyé');
  egal(Object.keys(BONNES_Q).filter((id) => !VERDICTS[id]), ['q-circuit'], 'q-circuit corrigée au bilan, les autres tout de suite');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(Object.keys(BONNES_Q).map((id) => n.detail[`question:${id}`]), Object.keys(BONNES_Q).map(() => 'ok'), 'questions');
  proche(n.score, 20, 'note');
  egal((await fin()).lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Aujourd’hui : la préparation', 'Ta mission', 'Ton transpalette', 'Ta commande ?', 'Demain'], 'les messages');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun verdict dans un message');
  egal(new Date(M[0].ts).getDay(), 1, 'un lundi');
  vrai(M.every((x, i) => !i || x.ts >= M[i - 1].ts), 'heures croissantes');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.15 : parcours juste (témoin c, fourche tordue) → 20/20 ; la juste de la fiche et du message est celle de SA mission (sabotage : juger contre une mission fixe ferait tomber ce cas)', async () => {
  nouveau();
  await monter({ uid: 'ac815-c', graine: TC.graine });
  await tout(TC);
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  proche(n.score, 20, 'note');
  const juste = await pg.evaluate(async () => { const S = await import('/contenus/action-ent815.js');
    return S.FICHE.blocs(window.__f.db).map((b) => b.choix.find((c) => c.v === 'juste').lib); });
  egal(juste, [TC.magasin, `${TC.cartons} cartons`, `Quai ${TC.quai}`, TC.depart], 'la juste de la fiche : SA mission');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.15 : un défaut jamais signalé arrête l’élève (sans le nommer) ; signalé après l’arrêt, il ne compte pas (règle de la vue) ; le transpalette n° 2 signalé à tort → « aucun faux » ✗ ; une mauvaise ligne de fiche ; le message d’un autre quai → cr-message ✗', async () => {
  nouveau();
  await monter({ uid: 'ac815-arret', graine: TC.graine });
  await allerV('inspection');
  await I.cliquerPoint('site-defaut'); await I.signaler(); await pause();
  await I.valider(); await pause();
  vrai(await present('[data-i-arret]'), 'arrêté : un défaut oublié');
  const arret = await I.texteDe('[data-i-arret]');
  vrai(!/fourche|transpalette n° 1/i.test(arret), `l’arrêt ne nomme pas le défaut : ${arret}`);
  await I.cliquerPoint('tp1-defaut'); await I.cliquerPoint('tp2'); await I.signaler(); await pause();
  await I.valider(); await pause();
  await qrep();
  await mission({ quai: 'autre1' });
  await preparer(TC);
  await verifier();
  await repondre(PHR(TC, { prete: `La commande de ${TC.magasin} est prête, quai 6.` }));
  const n = await note();
  egal(jalonsFaux(n), ['securite-tp1-defaut', 'securite-aucun-faux', 'mission-quai', 'cr-message'], 'jalons faux');
  proche(n.score, 15, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.15 : inaction → 0/20 ; une ligne posée avec un carton de moins que dit → cette ligne seule fausse', async () => {
  nouveau();
  await monter({ uid: 'ac815-rien', graine: TA.graine });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'rien fait : 0');
  nouveau();
  await monter({ uid: 'ac815-mauvaise', graine: TA.graine });
  await poste();
  await mission();
  await preparer(TA, { mauvaise: 2 });
  const e = await etatPlan();
  if (e.terminal.fin) {
    await verifier();
    await repondre(PHR(TA));
    const n = await note();
    egal(jalonsFaux(n), ['ligne-2'], 'la ligne 2 seule fausse');
    proche(n.score, 19, 'note');
  } else vrai(false, 'le terminal n’est pas fini après la ligne mal posée');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.15 : accompagné — « Les règles » ouvertes et la travée de la ligne en cours cernée ; confirmé — la même commande, la note du socle inchangée', async () => {
  nouveau();
  await monter({ uid: 'ac815-acc', graine: TA.graine, aisance: 'accompagne' });
  await poste(); await mission();
  await allerV('entrepot');
  egal(await pg.$eval(Q('[data-pvc-montre]'), (e) => e.dataset.pvcMontre).catch(() => null), 'A2-T05', 'la travée de la ligne 1 cernée');
  egal(await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => null), true, 'les règles ouvertes');
  nouveau();
  await monter({ uid: 'ac815-conf', graine: TA.graine, aisance: 'confirme' });
  await tout(TA);
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  proche(n.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

}
