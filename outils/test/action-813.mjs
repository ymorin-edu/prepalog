// Suite de tests de Prepalog — bloc « action-813 » : ENT-8.13 Action, « la palette d'à côté » (CAP OL, entraînement CAP-C1.5 avec erreur induite),
// palettier à adresse donnée à deux phases (chantier E-7, lots 0 à 3 et 5). Brief `docs/briefs/ENT-8.13-action-palette-a-cote.md` §8 ; décisions du chef
// de chantier : `docs/briefs/COORDINATION-palettier.md` §3 et §4. `PORT_TESTS=8133 node outils/test.mjs action-813` ne lance que ce bloc. Aides
// communes (ouvrir la page, lire la base) : `outils/test/france-boissons/commun.mjs`. Le plan se joue au clic (comme les blocs `palettier` et `action-811`).
//
// Valeurs ÉCRITES À LA MAIN. Deux élèves TÉMOINS (graine posée à la main dans `db.tirage`), relevés une fois le 22/10/2026 et recopiés ici :
//   « temoin-a » : P1 Serviettes de bain A1-T01-N1-E2 · P3 Boîtes de rangement 10 L A1-T04-N1-E1 (prise : à évacuer), adresse libre A2-T01-N1-E3,
//                  restée en réception → posée la nuit en A1-T04-N1-E2 · P9 (Kevin) Peluches B1-T02-N1-E1 (prise : à évacuer), posée par Kevin en
//                  B1-T02-N1-E3.
//   « temoin-b » : P1 Serviettes de bain A2-T01-N1-E3 · P3 Boîtes de rangement 10 L A1-T02-N1-E3, adresse libre A1-T04-N1-E2, « à côté » libre
//                  A1-T02-N1-E1, nuit A1-T02-N1-E2 · P9 Nettoyant multi-usages 1 L B1-T02-N1-E2, posée en B1-T02-N1-E3.
// Poids des jalons : adresseLibre-P3 2, scan-P3 1 · retrouvee 3, trouveeVite 1 · transfert-place 2, transfert-scan 3 · compte rendu 1 × 3 · ton 1 ;
// P1, pasPoseHaut, charge : 0 (jugés, sans ligne) ; questions (part 4) : q-rupture 0,75, q-ou-chercher 0,5, q-systeme 0,75, q-terminal 0,75,
// q-a-qui 0,5, q-collegue 0,75.

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT813 || '';

const ID = 'action-palette-a-cote';
const EID = 'action-palette-a-cote';
const P = `${Z} .pal`;
const REP_OUV = { 'k-adresse-libre': 'libre', 'k-transfert': 'adresse', 'k-rupture': 'manque', 'k-rendre-compte': 'dire', 'k-allee': 'danger',
  'k-scan-rappel': 'prevue', 'k-preparateur': 'prepare', 'img-allee-encombree': 'allee', 'img-emplacement-vide': 'vide' };
const BONNES_Q = { 'q-rupture': 'ventes', 'q-ou-chercher': 'autour', 'q-systeme': 'scan', 'q-terminal': 'transfert', 'q-a-qui': 'cheffe', 'q-collegue': 'non' };
const FAUSSES_Q = { 'q-rupture': 'ferme', 'q-ou-chercher': 'quai', 'q-systeme': 'panne', 'q-terminal': 'rien', 'q-a-qui': 'personne', 'q-collegue': 'presse' };
const GROUPES = ['Ranger en fin de poste', 'Retrouver la palette', 'La remettre en ordre au terminal', 'Rendre compte à Samia', 'Le ton du message',
  'Les questions de Samia'];
const NOTES = ['adresseLibre-P3', 'scan-P3', 'retrouvee', 'trouveeVite', 'transfert-place', 'transfert-scan', 'cr-passe', 'cr-ou', 'cr-fait', 'cr-forme'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus|bien vu)\b/i;
const TA = { graine: 'temoin-a', P1: 'A1-T01-N1-E2', P3: 'A1-T04-N1-E1', libre: 'A2-T01-N1-E3', allee: 'A1-T04-N1-E2', P9: 'B1-T02-N1-E1', posee: 'B1-T02-N1-E3',
  noms: { P1: 'Serviettes de bain', P3: 'Boîtes de rangement 10 L', P9: 'Peluches' } };
const TB = { graine: 'temoin-b', P1: 'A2-T01-N1-E3', P3: 'A1-T02-N1-E3', libre: 'A1-T04-N1-E2', allee: 'A1-T02-N1-E2', P9: 'B1-T02-N1-E2', posee: 'B1-T02-N1-E3',
  acote: 'A1-T02-N1-E1', noms: { P1: 'Serviettes de bain', P3: 'Boîtes de rangement 10 L', P9: 'Nettoyant multi-usages 1 L' } };
const PASSE = { kevin: 'Une palette a été posée hier soir à côté de son adresse, sans scan.', posee: 'Hier soir, j’ai posé P3 à côté de son adresse sans la scanner.',
  reception: 'Hier soir, j’ai laissé P3 en réception : elle a été posée cette nuit à côté de son adresse, sans scan.' };
const FAUTE = 'C’est la faute de Kevin.';
const transferee = (a) => `Je l’ai transférée en ${a} et scannée : le système est à jour.`;
// Les phrases justes d'un chemin (où elle était, où elle est allée), écrites à la main.
const PHR = (passe, reelle, vers, prenom = 'Lea') => ({ salutation: 'Bonjour Samia,', passe, ou: `Elle était en ${reelle}.`, fait: transferee(vers), fin: prenom });

// Monte la séance dans la page. `o.graine` : la graine posée (l'élève témoin) ; les réponses d'« Avant de commencer » sont posées (sauf `sansOuverture`).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-palette-a-cote.js');
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
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac813' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }), suivante: null,
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const Q = (s) => `${Z} ${s}`;
let capturer = false;
const capture = async (nom) => {
  if (!CAPTURES || !capturer) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(Q('[data-carte-fermer]')); await pause(40); }
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};
// Les questions : pour chacune, un verdict s'est-il affiché tout de suite (sinon : corrigée au bilan) ? L'ordre d'arrivée est noté.
const VERDICTS = {};
let VUS = [];
const panneau = () => pg.$eval(Q('[data-q-panneau]'), (e) => e.dataset.qPanneau).catch(() => null);
async function qrep(choix = BONNES_Q) {
  await pause(60);
  for (let i = 0; i < 6; i++) {
    const id = await panneau();
    if (!id) return;
    VUS.push(id);
    await pg.click(Q(`[data-q-choix="${choix[id]}"][data-q="${id}"]`));
    await pg.click(Q(`[data-q-repondre="${id}"]`));
    await pause();
    VERDICTS[id] = !!(await pg.$(Q('[data-q-verdict]')));
    await pg.click(Q('[data-q-reprendre]'));
    await pause();
  }
}
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(Q('[data-confirme-oui]')); await pause(); } };

// ① le soir, au plan
const replier = async () => { if (await pg.$eval(`${P} [data-pe-regles]`, (d) => d.open).catch(() => false)) { await pg.click(`${P} [data-pe-regles] summary`); await pause(40); } };
const bouton = async (k) => { await replier(); await pg.click(`${P} [data-pal="${k}"]`); await pause(40); };
const prendre = async (id) => { await pg.click(`${P} .pe-bandeau [data-pe-pal="${id}"]`); await pause(40); };
async function ouvrir(a, choix = BONNES_Q) {
  await replier();
  if (await present('.pal [data-pal="retour"]')) await bouton('retour');
  await pg.click(`${P} [data-pe-trav="${a.slice(0, 6)}"]`); await pause(30);
  await pg.click(`${P} [data-pe-emp="${a}"]`); await pause(40);
  await qrep(choix);
}
const compris = async () => { if (await present('.pal [data-pal-modal]')) { await pg.click(`${P} [data-pal-modal-ok]`); await pause(40); } };
async function ranger(id, a, choix = BONNES_Q) { await prendre(id); await ouvrir(a, choix); await bouton('poser'); await qrep(choix); }
// Scanner le soir : l'étiquette de la palette (sous sa carte), puis celle de l'emplacement (vue de près).
async function scanner(id, a, choix = BONNES_Q) {
  await replier();
  await pg.click(`${P} .pe-bandeau [data-pal-scan-pal="${id}"]`); await pause(40);
  if (!(await present(`.pal [data-pal-scan-emp="${a}"]`))) await ouvrir(a, choix);
  await pg.click(`${P} [data-pal-scan-emp="${a}"]`); await pause(40);
  await qrep(choix);
}
// P3 : le bon geste — l'ouvrir à son adresse donnée (prise : Kevin écrit), demander une adresse libre, la poser là, la scanner.
async function p3Juste(T, choix = BONNES_Q) {
  await prendre('P3'); await ouvrir(T.P3, choix);
  await bouton('libre'); await compris();
  await ouvrir(T.libre, choix); await bouton('poser'); await qrep(choix);
  await scanner('P3', T.libre, choix);
}
// P3 posée « à côté », sans rien demander ni scanner.
async function p3ACote(T, a, choix = BONNES_Q) { await prendre('P3'); await ouvrir(T.P3, choix); await prendre('P3'); await ranger('P3', a, choix); }
async function valider(choix = BONNES_Q) {
  await allerV('entrepot');
  if (await present('.pal [data-pal="retour"]')) await bouton('retour');
  await bouton('valider'); await bouton('validerOui'); await pause();
  await qrep(choix);
}
// ② le lendemain
async function passer(choix = BONNES_Q) {
  await allerV('entrepot');
  if (await present('.pal [data-pal="retour"]')) await bouton('retour');
  await bouton('phase'); await bouton('phaseOui'); await pause();
  await qrep(choix);
}
// Transférer la palette cherchée : l'ouvrir là où elle est, scanner son étiquette, ouvrir la cible, scanner l'étiquette de l'emplacement.
async function transferer(id, de, vers, choix = BONNES_Q) {
  await ouvrir(de, choix);
  await pg.click(`${P} [data-pal-lscan-pal="${id}"]`); await pause(40); await qrep(choix);
  await ouvrir(vers, choix);
  await pg.click(`${P} [data-pal-lscan-emp]`); await pause(40);
  if (CAPTURES && capturer) await pg.screenshot({ path: `${CAPTURES}/5-transfert.png` });   // la fenêtre du système couvre tout : pas de carte à fermer
  await compris(); await qrep(choix);
}
async function validerL(choix = BONNES_Q) {
  await allerV('entrepot');
  if (await present('.pal [data-pal="retour"]')) await bouton('retour');
  await bouton('lvalider'); await bouton('lvaliderOui'); await pause();
  await qrep(choix);
}
// ③ le compte rendu à Samia
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(Q('[data-dossier="in"]'));
  await pg.click(Q(`.ent-obj:text-is("${sujet}")`));
  await pause();
}
const choixDe = (ligne) => pg.$$eval(Q(`[data-phrase="${ligne}"] option`), (L) => L.map((x) => x.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));
async function repondreSamia(lignes, choix = BONNES_Q, deja = false) {
  if (!deja) { await ouvrirMail('C’est réglé ?'); await pg.click(Q('[data-repondre]')); }
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(Q(`[data-phrase="${l}"]`), { label: t }); await qrep(choix); }
  await capture('6-phrases');
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  await qrep(choix);
}
const etatPlan = () => pg.evaluate((EID) => JSON.parse(JSON.stringify((window.__f.db.entrepots || {})[EID] || null)), EID);
const cherchee = () => pg.evaluate(async () => { const E = await import('/core/types/entrepot.js'); const S = await import('/contenus/action-ent813-donnees.js');
  return E.paletteCherchee(window.__f.db, S.entrepotDe); });
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const cases = () => pg.$$eval(Q('[data-fin-case]'), (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim(),
  l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
const jalonsFaux = (n) => NOTES.filter((j) => n.detail[j] !== 'ok');
const nouveau = () => { VUS = []; Object.keys(VERDICTS).forEach((k) => delete VERDICTS[k]); };
const mailsDe = async (qui) => (await entrants()).filter((m) => m.from === qui);
// Le soir et le lendemain d'un chemin, joués à l'écran (`chemin` : 'A' bon geste, 'B' posée à côté sans scan, 'C' laissée en réception).
async function soir(T, chemin, choix = BONNES_Q) {
  await allerV('entrepot');
  await ranger('P1', T.P1, choix); await scanner('P1', T.P1, choix);
  if (chemin === 'A') await p3Juste(T, choix);
  if (chemin === 'B') await p3ACote(T, T.acote, choix);
  if (chemin === 'C') { await prendre('P3'); await ouvrir(T.P3, choix); await prendre('P3'); }
  await valider(choix);
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.13 : déclaration (CAP, C1.5, entraînement, 20 points, parcours après ENT-8.12) ; poids par bloc (somme 20 avec la part 4) ; P1 et les gardes sans poids ; questions rebranchées ; plan palettier à deux phases', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-palette-a-cote.js');
    const S = await import('/contenus/action-ent813.js');
    const Qs = await import('/contenus/questions/ENT-8.13.js');
    const D = await import('/contenus/action-ent813-donnees.js');
    const m = A.meta, E = S.ETAPES;
    const poidsDe = (e) => (e.compte === false ? 0 : e.poids);
    const decl = (n) => { const x = D.entrepotDe('temoin-a', { niveau: n }); return [x.id, x.mode, x.aideCharge, x.verdict, JSON.stringify(x.terminal), x.cariste.niveaux,
      x.palettes.map((p) => p.id + (p.adresseLibre ? '+' : '')).join(' '), x.personnage.texte, x.personnage.date, !!x.regles, !!x.regles.ouvertes,
      JSON.stringify(x.phases), x.lendemain.trouveEn, x.lendemain.eleve, x.lendemain.kevin.palette.id]; };
    return {
      m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente,
        m.niveauxPrevus, m.questions, m.corrige, m.pret, m.ouverture],
      ids: E.map((e) => e.id), poids: E.map(poidsDe), somme: E.reduce((t, e) => t + poidsDe(e), 0), part: Qs.QUESTIONS.part,
      parGroupe: Object.entries(E.filter((e) => e.compte !== false).reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})).map(([g, p]) => [g, Math.round(p * 100) / 100]),
      garde: E.filter((e) => e.compte === false).map((e) => [e.id, e.poids, e.groupe]),
      ecrans: [...new Set(E.filter((e) => e.ecran).map((e) => e.ecran))], bonus: E.filter((e) => e.bonus).length,
      qFil: Qs.QUESTIONS.liste.filter((x) => x.type === 'fil').map((x) => [x.id, x.de, x.poids, x.apres || 'tout de suite', (x.quand.gestes || [])]),
      ouv: [Qs.QUESTIONS.ouverture.tirage, Qs.QUESTIONS.ouverture.questions.length,
        Qs.QUESTIONS.liste.filter((x) => x.type === 'ouverture').map((x) => x.rubrique).sort().join()],
      decl: { standard: decl('standard'), accompagne: decl('accompagne'), confirme: decl('confirme') },
      fin: S.OPTIONS.finFige, fermetures: S.OPTIONS.fermetures || null,
    };
  });
  egal(r.m, ['action-palette-a-cote', 'ENT-8.13', 'simulog', ['cap'], [], ['CAP-C1.5'], 'entrainement', 20, true, true, true, 'action-inventaire-tournant',
    ['confirme', 'accompagne'], 'ENT-8.13', './contenus/corriges/ENT-8.13.js', true, 'prof'], 'meta ENT-8.13 (livrée fermée : l’enseignant l’ouvre)');
  egal(r.ids, ['place-P1', 'scan-P1', 'adresseLibre-P3', 'scan-P3', 'pasPoseHaut', 'charge', 'retrouvee', 'trouveeVite', 'transfert-place', 'transfert-scan',
    'cr-passe', 'cr-ou', 'cr-fait', 'cr-forme'], 'jalons du socle');
  egal(r.poids, [0, 0, 2, 1, 0, 0, 3, 1, 2, 3, 1, 1, 1, 1], 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des poids des jalons et des questions');
  egal(r.parGroupe, [['Ranger en fin de poste', 3], ['Retrouver la palette', 4], ['La remettre en ordre au terminal', 5], ['Rendre compte à Samia', 3],
    ['Le ton du message', 1]], 'points par ligne du bandeau (brief §5 : 3 / 4 / 5 / 3 / 1, + 4 de questions)');
  egal(r.garde, [['place-P1', 0, undefined], ['scan-P1', 0, undefined], ['pasPoseHaut', 0, undefined], ['charge', 0, undefined]],
    'P1 et les deux gardes : poids 0, sans ligne au bandeau');
  egal([r.ecrans, r.bonus], [['phrases:samia'], 0], '« Corriger » rouvre le message à Samia seulement ; aucun bonus');
  const G = (n) => `entrepot:action-palette-a-cote:${n}`;
  egal(r.qFil, [['q-rupture', 'samia', 0.75, 'tout de suite', [G('ouvrir:lendemain')]], ['q-ou-chercher', 'samia', 0.5, 'bilan', [G('trouvee')]],
    ['q-systeme', 'samia', 0.75, 'tout de suite', [G('transfert:scan')]], ['q-terminal', 'samia', 0.75, 'tout de suite', [G('valider:lendemain')]],
    ['q-a-qui', 'samia', 0.5, 'bilan', []], ['q-collegue', 'samia', 0.75, 'tout de suite', []]], 'questions au fil et gestes rebranchés (q-terminal hors de la fenêtre du transfert)');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 9, 'image,image,preparation,preparation,preparation,preparation,preparation,preparation,preparation'],
    'Avant de commencer : 9 notions (7 + 2), 3 + 1 tirées');
  const ph = JSON.stringify([{ id: 'soir' }, { id: 'lendemain', bouton: 'Le lendemain, 6 h', date: 'le lendemain, 6 h', consigne: 'Trouve la palette. Puis remets-la en ordre au terminal.' }]);
  egal(r.decl.standard, ['action-palette-a-cote', 'palettier', 'plaque', 'critere', '{"nom":"Terminal"}', [2, 3, 4], 'P1 P3+', 'Range les palettes.', 'jeudi, 20 h 30',
    true, false, ph, 4, 'P3', 'P9'], 'plan standard : plaque seule, critère, règles repliées, deux phases, trouveEn 4');
  egal([r.decl.accompagne[3], r.decl.accompagne[12]], ['adresse', 4], 'accompagné : adresse attendue au verdict, trouveEn 4');
  egal([r.decl.confirme[3], r.decl.confirme[12], r.decl.confirme[6]], ['critere', 3, 'P1 P3+'], 'confirmé : la même enquête, trouveEn 3 (pas de seconde palette)');
  egal([r.fin, r.fermetures], ['Ton rangement et ton transfert sont validés : ils ne se refont pas.', null], 'finFige ; le plan ouvert dès l’accueil');
});

// ─────────────────────────────────────────────────────────── le tirage et l'équité
await v('ENT-8.13 : tirage — 200 graines : zéro secours ; P3 et P9 prises le soir (à évacuer), libres le lendemain ; l’adresse libre et deux voisines libres toujours là ; alleeVers et la place de Kevin libres, dans la travée ; la déclaration se charge pour chacune ; chaque produit sort ≥ 10 fois', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent813-donnees.js');
    const D811 = await import('/contenus/action-ent811-donnees.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const trav = (a) => a.slice(0, 6), emp = (a) => Number(a.slice(-1));
    const vois = (a) => { const c = a.slice(0, 2), t = Number(a.slice(4, 6)); return [t - 1, t, t + 1].filter((x) => x >= 1 && x <= 4)
      .flatMap((x) => [1, 2, 3].map((e) => `${c}-T0${x}-N1-E${e}`)).filter((x) => x !== a); };
    const o = { secours: 0, nonConforme: 0, pasEvac: 0, libreKo: 0, voisins: 0, allee: 0, posee: 0, charge: 0, memeAllee: 0, p1: 0, produits: {}, a3: new Set(), a9: new Set() };
    for (let i = 0; i < 200; i++) {
      const g = `eleve-${i}`;
      const t = tirerJeu(D.TIRAGE, `${g}|action-palette-a-cote`), j = t.jeu, A = j.adresse;
      if (t.secours) o.secours++;
      if (D.verifier(j).length) o.nonConforme++;
      const S = D.stockDe(j);
      if (S[A.P3].produit !== 'EVA' || S[A.P9].produit !== 'EVA' || D811.STOCK[A.P3] || D811.STOCK[A.P9]) o.pasEvac++;
      if (S[j.libre] || j.libre.slice(-4, -3) !== '1' || vois(A.P3).includes(j.libre) || j.libre[0] !== A.P3[0]) o.libreKo++;
      if (vois(A.P3).filter((a) => !S[a]).length < 2) o.voisins++;
      if (S[j.allee] || trav(j.allee) !== trav(A.P3) || emp(j.allee) === emp(A.P3)) o.allee++;
      if (S[j.posee] || trav(j.posee) !== trav(A.P9) || emp(j.posee) === emp(A.P9)) o.posee++;
      if (A.P3[0] === A.P9[0]) o.memeAllee++;
      if (S[A.P1] || [trav(A.P3), trav(A.P9), trav(j.libre)].includes(trav(A.P1))) o.p1++;
      try { creerEntrepot(D.entrepotDe(g)); creerEntrepot(D.entrepotDe(g, { niveau: 'confirme' })); } catch (e) { o.charge++; o.err = e.message; }
      Object.values(j.produit).forEach((k) => { o.produits[k] = (o.produits[k] || 0) + 1; });
      o.a3.add(A.P3); o.a9.add(A.P9);
    }
    return { ...o, a3: o.a3.size, a9: o.a9.size };
  });
  egal([r.secours, r.nonConforme, r.pasEvac, r.libreKo, r.voisins, r.allee, r.posee, r.memeAllee, r.p1, r.charge], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'secours, non conformes, P3/P9 pas « à évacuer », adresse libre, voisines libres, alleeVers, place de Kevin, même allée, P1, déclaration refusée ' + (r.err || ''));
  egal(Object.keys(r.produits).sort(), ['BOI', 'BOU', 'CAH', 'CRO', 'LES', 'NET', 'PEL', 'SER'], 'les huit produits sortent');
  vrai(Object.values(r.produits).every((x) => x >= 10), 'chaque produit au moins 10 fois : ' + JSON.stringify(r.produits));
  vrai(r.a3 >= 5 && r.a9 >= 5, `des adresses variées : ${r.a3} pour P3, ${r.a9} pour P9`);
});

await v('ENT-8.13 : contrôle d’équité — `verifier` refuse un produit en double, P3 et P9 dans la même allée, alleeVers hors de la travée, une adresse libre à côté de P3 ; témoins et référence passent ; les témoins sont ceux recopiés', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent813-donnees.js');
    const j = () => JSON.parse(JSON.stringify(D.jeuDe('temoin-a')));
    const double = j(); double.produit.P9 = double.produit.P3;
    const allee = j(); allee.adresse.P9 = 'A2-T03-N1-E1';
    const hors = j(); hors.allee = 'A1-T03-N1-E1';
    const acote = j(); acote.libre = 'A1-T03-N1-E3';
    const a = D.jeuDe('temoin-a'), b = D.jeuDe('temoin-b');
    return { double: D.verifier(double), allee: D.verifier(allee), hors: D.verifier(hors), acote: D.verifier(acote),
      bons: [D.verifier(a), D.verifier(b), D.verifier(D.jeuDe(''))], a, b };
  });
  vrai(r.double.some((x) => /même produit/.test(x)), 'produit en double : ' + r.double);
  vrai(r.allee.some((x) => /même allée/.test(x)), 'même allée : ' + r.allee);
  vrai(r.hors.some((x) => /alleeVers/.test(x)), 'alleeVers hors de la travée : ' + r.hors);
  vrai(r.acote.some((x) => /adresse libre/.test(x)), 'adresse libre à côté : ' + r.acote);
  egal(r.bons, [[], [], []], 'témoins et référence conformes');
  egal(r.a, { produit: { P1: 'SER', P3: 'BOI', P9: 'PEL' }, adresse: { P1: TA.P1, P3: TA.P3, P9: TA.P9 }, libre: TA.libre, allee: TA.allee, posee: TA.posee }, 'témoin a');
  egal(r.b, { produit: { P1: 'SER', P3: 'BOI', P9: 'NET' }, adresse: { P1: TB.P1, P3: TB.P3, P9: TB.P9 }, libre: TB.libre, allee: TB.allee, posee: TB.posee }, 'témoin b');
});

// ─────────────────────────────────────────────────────────── jalons et phrases sur bases fabriquées
// L'état du soir validé d'un chemin (témoin a) : 'A' bon geste, 'B' P3 posée en A1-T03-N1-E1 sans scan, 'C' laissée en réception ; `L` : l'état du lendemain.
const soirFab = (chemin, L = null) => {
  const posees = { P1: TA.P1 }, scan = { P1: TA.P1 }, libres = {};
  if (chemin === 'A') { posees.P3 = TA.libre; scan.P3 = TA.libre; libres.P3 = TA.libre; }
  if (chemin === 'B') posees.P3 = 'A1-T03-N1-E1';
  return { enMain: null, posees, confiees: {}, signalees: {}, nouvelles: {}, tentativesHaut: 0, valide: true, at: 1, premierGeste: 1, scan, scansRefuses: 0,
    scanAttente: null, libres, monteesValidation: [], phase: L ? 'lendemain' : 'soir', ...(L ? { lendemain: L } : {}) };
};
const LNEUF = { ouvertures: 0, trouvee: false, trouveeA: null, scanAttente: null, place: null, confiee: null, montee: false, libre: null, transfert: null, refus: 0, valide: false, at: null };
const juger = (etat, o = {}) => pg.evaluate(async ({ etat, g, aisance }) => {
  const S = await import('/contenus/action-ent813.js');
  const db = { tirage: { graine: g }, aisance, entrepots: { 'action-palette-a-cote': etat } };
  return Object.fromEntries(S.ETAPES.filter((e) => !/^cr-/.test(e.id)).map((e) => { const s = e.verifier(db); return [e.id, s ? s.status : null]; }));
}, { etat, g: o.graine || TA.graine, aisance: o.aisance || 'standard' });
const fauxDe = (J) => Object.entries(J).filter(([, s]) => s === 'ko').map(([k]) => k);

await v('ENT-8.13 : jalons (bases fabriquées) — le soir du bon geste ✓ ; B et C : adresseLibre-P3 et scan-P3 ✗ (C : les gardes aussi, sans poids) ; trouvée en 6 → trouveeVite ✗ ; confié à Kevin et pas monté → transfert-place ✗, transfert-scan ✓ (remplace le cas « autre adresse libre », impossible) ; rien fait → à faire', async () => {
  const fini = (L) => Object.assign({}, LNEUF, L, { valide: true });
  const transA = { trouvee: true, trouveeA: 2, place: TA.P9, transfert: { id: 'P9', de: TA.posee, vers: TA.P9, at: 1 } };
  egal(fauxDe(await juger(soirFab('A', fini(transA)))), [], 'A : tout juste');
  egal(fauxDe(await juger(soirFab('B', fini({ ...transA, place: TA.P3, transfert: { id: 'P3', de: 'A1-T03-N1-E1', vers: TA.P3, at: 1 } })))),
    ['adresseLibre-P3', 'scan-P3'], 'B : le soir seul');
  egal(fauxDe(await juger(soirFab('C', fini({ ...transA, place: TA.P3, transfert: { id: 'P3', de: TA.allee, vers: TA.P3, at: 1 } })))),
    ['adresseLibre-P3', 'scan-P3', 'pasPoseHaut', 'charge'], 'C : le soir, et les deux gardes (poids 0)');
  egal(fauxDe(await juger(soirFab('A', fini({ ...transA, trouveeA: 6 })))), ['trouveeVite'], 'trouvée à la 6e ouverture');
  egal(fauxDe(await juger(soirFab('A', fini({ ...transA, trouveeA: 4 })))), [], 'standard : 4 ouvertures, vite');
  egal(fauxDe(await juger(soirFab('A', fini({ ...transA, trouveeA: 4 })), { aisance: 'confirme' })), ['trouveeVite'], 'confirmé : 4 ouvertures, pas assez vite (3 au plus)');
  egal(fauxDe(await juger(soirFab('A', fini({ ...transA, place: null, confiee: 'B1-T02-N2-E1', montee: false })))), ['transfert-place'],
    'confiée à Kevin, pas montée : transfert-place ✗, transfert-scan ✓');
  egal(fauxDe(await juger(soirFab('A', fini({ trouvee: true, trouveeA: 2 })))), ['transfert-place', 'transfert-scan'], 'trouvée, pas transférée');
  const rien = await juger({ enMain: null, posees: {}, confiees: {}, signalees: {}, nouvelles: {}, tentativesHaut: 0, valide: false, at: null, premierGeste: null });
  vrai(Object.values(rien).every((s) => s === 'attente'), 'rien validé : tout à faire ' + JSON.stringify(rien));
  const soirSeul = await juger(soirFab('A'));
  egal(['retrouvee', 'trouveeVite', 'transfert-place', 'transfert-scan'].map((k) => soirSeul[k]), ['attente', 'attente', 'attente', 'attente'], 'le soir validé : le lendemain à faire');
});

await v('ENT-8.13 : les phrases du compte rendu suivent le chemin — la palette cherchée (A : P9 ; B, C : P3) et ce que l’élève en a fait ; « pas trouvée » et « laissée là » justes pour qui l’a fait ; jamais l’adresse réelle proposée à qui n’a pas trouvé', async () => {
  const r = await pg.evaluate(async ({ soirs, LNEUF, TA }) => {
    const S = await import('/contenus/action-ent813.js');
    const db = (etat) => ({ tirage: { graine: TA.graine }, entrepots: { 'action-palette-a-cote': etat } });
    const avec = (chemin, L) => Object.assign({}, soirs[chemin], { phase: 'lendemain', lendemain: Object.assign({}, LNEUF, L) });
    const lignes = (e) => { const D = S.cheminDe(db(e)); return [D, (({ passe, ou, fait }) => ({ passe: passe[0], ou: ou[0], fait: fait[0], ouTout: ou, faitTout: fait }))(
      { passe: S.phrasesSamia('Lea').lignes[1].choix(db(e)), ou: S.phrasesSamia('Lea').lignes[2].choix(db(e)), fait: S.phrasesSamia('Lea').lignes[3].choix(db(e)) })]; };
    return {
      A: lignes(avec('A', { trouvee: true, trouveeA: 2, place: TA.P9, transfert: { id: 'P9', de: TA.posee, vers: TA.P9, at: 1 } })),
      B: lignes(avec('B', { trouvee: true, trouveeA: 3, place: TA.P3, transfert: { id: 'P3', de: 'A1-T03-N1-E1', vers: TA.P3, at: 1 } })),
      C: lignes(avec('C', { trouvee: true, trouveeA: 2 })),
      rien: lignes(avec('C', { ouvertures: 5 })),
      vide: S.cheminDe({}),
    };
  }, { soirs: { A: soirFab('A'), B: soirFab('B'), C: soirFab('C') }, LNEUF, TA });
  egal(r.A[0], { chemin: 'kevin', id: 'P9', nom: 'Peluches', systeme: TA.P9, reelle: TA.posee, trouvee: true, vers: TA.P9 }, 'A : on cherche P9');
  egal([r.A[1].passe, r.A[1].ou, r.A[1].fait], [PASSE.kevin, `Elle était en ${TA.posee}.`, transferee(TA.P9)], 'A : les phrases justes');
  egal(r.B[0].chemin + ' ' + r.B[0].id + ' ' + r.B[0].reelle, 'posee P3 A1-T03-N1-E1', 'B : on cherche P3, là où il l’a posée');
  egal([r.B[1].passe, r.B[1].ou, r.B[1].fait], [PASSE.posee, 'Elle était en A1-T03-N1-E1.', transferee(TA.P3)], 'B : les phrases justes');
  egal([r.C[0].chemin, r.C[0].reelle, r.C[1].passe, r.C[1].fait], ['reception', TA.allee, PASSE.reception, 'Je l’ai laissée là.'], 'C, trouvée sans transfert : « laissée là » juste');
  egal([r.rien[1].ou, r.rien[1].fait], ['Je ne l’ai pas trouvée.', 'Je n’ai rien pu transférer.'], 'pas trouvée : juste pour lui');
  vrai(!r.rien[1].ouTout.some((t) => t.includes(TA.allee)), 'à qui n’a pas trouvé, jamais l’adresse réelle : ' + r.rien[1].ouTout.join(' | '));
  egal(r.rien[1].ouTout.length, 3, 'trois choix');
  egal(r.vide, null, 'base vide : pas de chemin (le message se sème quand même au chargement)');
});

// ─────────────────────────────────────────────────────────── les chemins à l'écran
await v('ENT-8.13 : chemin A à l’écran (témoin a, standard) — Kevin n’écrit qu’au premier « Occupé » de P3 ; adresse libre, rangée, scannée ; Samia sans verdict ; Yanis nomme l’adresse de P9 ; P9 retrouvée, transférée ; phrases ; 20 / 20 ; questions aux bons gestes ; jeudi soir puis vendredi, sans date', async () => {
  capturer = true; nouveau();
  await monter({ uid: 'ac813-a', graine: TA.graine, sansOuverture: true });
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal([ov.length, ov.filter((id) => /^img-/.test(id)).length], [4, 1], '3 notions et 1 image tirées');
  for (let k = 0; k < 4; k++) {
    await pg.click(Q(`[data-ouv-aller="${k}"]`)); await pause();
    if (k === 0) await capture('0-avant-de-commencer');
    await pg.click(Q(`[data-q-choix="${REP_OUV[ov[k]]}"][data-q="${ov[k]}"]`));
    await pg.click(Q(`[data-q-repondre="${ov[k]}"]`)); await pause();
  }
  await pg.click(Q('[data-ouv-continuer]')); await pause();
  await capture('1-accueil');
  const M0 = await entrants();
  egal(M0.map((m) => m.text), ['Bonsoir Lea ! Dernière demi-heure : deux palettes à ranger, et tu pourras partir. Kevin est là pour la réserve.\n\nSamia'], 'l’accueil de Samia');
  await allerV('entrepot');
  egal(await pg.$$eval(`${P} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P3'], 'deux palettes');
  egal(await pg.$eval(`${P} [data-pe-regles]`, (d) => d.open), false, 'entraînement : « Les règles » repliées');
  await ranger('P1', TA.P1); await scanner('P1', TA.P1);
  egal(await mailsDe('Kevin'), [], 'Kevin n’a rien écrit');
  await prendre('P3'); await ouvrir(TA.P3);
  egal(await pg.textContent(`${P} [data-pal-occ]`).then((t) => t.trim()), 'Occupé : À évacuer cette nuit', 'de près : la palette à évacuer');
  egal((await mailsDe('Kevin')).map((m) => m.text), ['Elle est prise ? Mets-la à côté, on verra demain. Il est tard.\n\nKevin'], 'Kevin pousse au premier « Occupé »');
  await capture('2a-soir-de-pres');
  if (CAPTURES) { await ouvrirMail('Elle est prise ?'); await capture('2b-soir-kevin'); await allerV('entrepot'); }
  await ouvrir(TA.P1); await ouvrir(TA.P3);
  egal((await mailsDe('Kevin')).length, 1, 'Kevin n’écrit qu’une fois (P3 rouverte)');
  await bouton('libre'); await compris();
  await ouvrir(TA.libre); await bouton('poser'); await scanner('P3', TA.libre);
  await valider();
  egal(VUS, [], 'aucune question le soir');
  egal((await mailsDe('Samia')).map((m) => m.text).slice(-1), ['Bonne soirée ! À demain 6 h.\n\nSamia'], 'Samia : bonsoir');
  egal(await pg.$$eval(`${P} [data-pal-verdict]`, (L) => L.length), 0, 'aucun verdict le soir');
  egal(await mailsDe('Yanis'), [], 'Yanis n’a rien écrit le soir');
  await passer();
  egal(await cherchee(), { id: 'P9', nom: 'Peluches', adresseSysteme: TA.P9, adresseReelle: TA.posee }, 'bon geste le soir : on cherche la palette de Kevin');
  egal((await mailsDe('Yanis')).map((m) => m.text), [`Bonjour ! Le terminal m’envoie en ${TA.P9}, niveau 1. C’est vide. Je ne peux pas préparer le magasin de Marseille. Tu peux regarder ?\n\nYanis`],
    'Yanis : l’adresse de P9, vide');
  vrai(!!(await entrants()).find((m) => m.subject === 'Ce matin' && m.pieces && m.pieces.includes('droit')), 'Samia : la consigne du matin, « Le droit » joint');
  await capture('3a-matin-plan');
  if (CAPTURES) { await ouvrirMail('C’est vide'); await capture('3b-matin-yanis'); await allerV('entrepot'); }
  await ouvrir(TA.P9);
  egal(VUS, ['q-rupture'], 'q-rupture à la première ouverture du matin');
  await ouvrir(TA.posee);
  egal(VUS.slice(-1), ['q-ou-chercher'], 'q-ou-chercher quand la palette est trouvée');
  await capture('4-trouvee');
  egal(((await etatPlan()).lendemain || {}).trouveeA, 2, 'trouvée à la 2e ouverture');
  egal(await mailsDe('Samia').then((L) => L.filter((m) => m.subject === 'C’est réglé ?').length), 0, 'Samia attend le transfert');
  await transferer('P9', TA.posee, TA.P9);
  egal(VUS.slice(-1), ['q-systeme'], 'q-systeme au scan de la palette ; rien avec la fenêtre du transfert');
  const C = (await entrants()).find((m) => m.subject === 'C’est réglé ?');
  vrai(!!C && C.text.startsWith('C’est réglé ? Raconte-moi, en trois phrases.'), 'Samia demande le compte rendu au transfert');
  await validerL();
  egal(VUS.slice(-1), ['q-terminal'], 'q-terminal à « Valider mon transfert »');
  await ouvrirMail('C’est réglé ?'); await pg.click(Q('[data-repondre]'));
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('passe')).sort(), [PASSE.kevin, FAUTE, 'Je ne sais pas.', PASSE.posee].sort(), 'ce qui s’est passé : les choix du chemin A');
  egal((await choixDe('ou')).sort(), [`Elle était en ${TA.posee}.`, `Elle était en ${TA.P9}.`, 'Elle était en B1-T02-N1-E2.', 'Je ne l’ai pas trouvée.'].sort(), 'où elle était');
  await repondreSamia(PHR(PASSE.kevin, TA.posee, TA.P9), BONNES_Q, true);
  egal(VUS.slice(-2), ['q-a-qui', 'q-collegue'], 'q-a-qui puis q-collegue à l’envoi du compte rendu');
  egal(VUS.slice().sort(), Object.keys(BONNES_Q).sort(), 'les six questions, une fois chacune');
  egal(Object.keys(BONNES_Q).filter((id) => !VERDICTS[id]), ['q-ou-chercher', 'q-a-qui'], 'q-ou-chercher et q-a-qui corrigées au bilan, les autres tout de suite');
  vrai(!!(await entrants()).find((m) => m.subject === 'Merci' && m.text.startsWith('Merci. Une palette posée sans scan, c’est une palette perdue pour le système.')), 'Samia : la fin');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(Object.keys(BONNES_Q).map((id) => n.detail[`question:${id}`]), Object.keys(BONNES_Q).map(() => 'ok'), 'questions notées');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  await pg.$eval(Q('[data-fin-seance]'), (e) => e.scrollIntoView({ block: 'start' })); await capture('7-bilan');
  capturer = false;
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Dernière demi-heure', 'Elle est prise ?', 'Bonne soirée', 'C’est vide', 'Ce matin', 'C’est réglé ?', 'Merci'], 'les messages, dans l’ordre');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus / bien vu');
  vrai(M.every((x, i) => !i || x.ts >= M[i - 1].ts), 'heures croissantes');
  egal([new Date(M[0].ts).getDay(), new Date(M[3].ts).getDay()], [4, 5], 'un jeudi soir, puis le lendemain (vendredi)');
  vrai(M[3].ts <= Date.now() + 3600e3, 'jamais une date à venir');
  const ecrit = [...M.map((x) => x.text), ...(await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent813.js'); return S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html || '')); }))].join('\n');
  vrai(!/\b20\d\d\b/.test(ecrit.replace(/consulté le \d\d\/\d\d\/20\d\d/g, '')), 'une année dans un message ou un document');
  vrai(!/\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/i.test(ecrit), 'un mois dans un message ou un document');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.13 : chemin B à l’écran (témoin b) — P3 posée à côté sans scan : Yanis nomme l’adresse donnée de P3 ; P3 retrouvée là où l’élève l’a posée, transférée ; 17 / 20 (le soir seul coûte 3)', async () => {
  nouveau();
  await monter({ uid: 'ac813-b', graine: TB.graine });
  await soir(TB, 'B');
  await passer();
  egal(await cherchee(), { id: 'P3', nom: TB.noms.P3, adresseSysteme: TB.P3, adresseReelle: TB.acote }, 'on cherche SA palette');
  egal((await mailsDe('Yanis'))[0].text.split('\n')[0], `Bonjour ! Le terminal m’envoie en ${TB.P3}, niveau 1. C’est vide. Je ne peux pas préparer le magasin de Marseille. Tu peux regarder ?`,
    'Yanis : l’adresse donnée de P3');
  await ouvrir(TB.P3); await ouvrir(TB.acote);
  await transferer('P3', TB.acote, TB.P3);
  await validerL();
  await repondreSamia(PHR(PASSE.posee, TB.acote, TB.P3));
  const n = await note();
  egal(jalonsFaux(n), ['adresseLibre-P3', 'scan-P3'], 'le soir seul est faux');
  egal([n.detail['place-P1'], n.detail['scan-P1']], ['ok', 'ok'], 'P1 jugée (sans poids)');
  proche(n.score, 17, 'note');
  const b = await fin();
  egal(b.lignes.filter(([, e]) => e !== 'ok').map(([g]) => g), ['Ranger en fin de poste'], 'bandeau : le soir seul');
  vrai(!!b.fige && !b.corriger, 'rien à corriger (le palettier est figé) : ' + b.texte.slice(0, 160));
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.13 : chemin C à l’écran (témoin a) — P3 laissée en réception : Kevin la pose la nuit en alleeVers ; on cherche P3 ; transférée ; 17 / 20 (les gardes fausses ne coûtent rien)', async () => {
  nouveau();
  await monter({ uid: 'ac813-c', graine: TA.graine });
  await soir(TA, 'C');
  await passer();
  egal(await cherchee(), { id: 'P3', nom: TA.noms.P3, adresseSysteme: TA.P3, adresseReelle: TA.allee }, 'P3 posée la nuit dans sa travée');
  await ouvrir(TA.P3); await ouvrir(TA.allee);
  egal(await pg.textContent(`${P} [data-pal-occ]`).then((t) => t.replace(/\s+/g, ' ').trim()), `Occupé : palette P3 · ${TA.noms.P3}`, 'de près : P3');
  await transferer('P3', TA.allee, TA.P3);
  await validerL();
  await repondreSamia(PHR(PASSE.reception, TA.allee, TA.P3));
  const n = await note();
  egal(jalonsFaux(n), ['adresseLibre-P3', 'scan-P3'], 'le soir seul est faux');
  egal([n.detail.pasPoseHaut, n.detail.charge], ['ko', 'ko'], 'les gardes sont fausses (palette laissée en réception)…');
  proche(n.score, 17, '… sans rien coûter : note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.13 : « C’est la faute de Kevin. » → le ton ✗, « ce qui s’est passé » ✓ (une erreur ne se paie qu’une fois) : 19 / 20 ; « Corriger » rouvre le message seulement', async () => {
  nouveau();
  await monter({ uid: 'ac813-faute', graine: TA.graine });
  await soir(TA, 'A');
  await passer();
  await ouvrir(TA.P9); await ouvrir(TA.posee);
  await transferer('P9', TA.posee, TA.P9);
  await validerL();
  await repondreSamia({ ...PHR(PASSE.kevin, TA.posee, TA.P9), passe: FAUTE });
  const n = await note();
  egal(jalonsFaux(n), ['cr-forme'], 'le ton seul est faux');
  proche(n.score, 19, 'note');
  const C = await cases();
  egal(C.filter((c) => c[1] === 'ko').map((c) => c[3]), ['phrases:samia'], 'la case fausse se corrige dans le message');
  const b = await fin();
  vrai(b && b.corriger, 'bouton « Corriger »');
  await pg.click(Q('[data-fin-corriger]')); await pause();
  egal([(await etatPlan()).valide, (await etatPlan()).lendemain.valide], [true, true], 'le palettier reste validé');
  await allerV('entrepot');
  egal(await present('.pal [data-pal="lvalider"]'), false, 'plus de « Valider mon transfert »');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.13 : jamais trouvée → « Je ne l’ai pas trouvée. » et « Je n’ai rien pu transférer. » justes (Samia écrit à « Valider mon transfert ») ; le lendemain coûte 9 ; inaction → 0 / 20', async () => {
  nouveau();
  await monter({ uid: 'ac813-rien', graine: TA.graine });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'rien fait : 0');
  await soir(TA, 'A');
  await passer();
  await ouvrir(TA.P9);
  await validerL();
  const C = (await entrants()).find((m) => m.subject === 'C’est réglé ?');
  vrai(!!C, 'Samia écrit à « Valider mon transfert » (aucun transfert)');
  await ouvrirMail('C’est réglé ?'); await pg.click(Q('[data-repondre]'));
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  vrai(!(await choixDe('ou')).some((t) => t.includes(TA.posee)), 'l’adresse réelle n’est jamais proposée');
  await repondreSamia({ salutation: 'Bonjour Samia,', passe: PASSE.kevin, ou: 'Je ne l’ai pas trouvée.', fait: 'Je n’ai rien pu transférer.', fin: 'Lea' }, BONNES_Q, true);
  const n = await note();
  egal(jalonsFaux(n), ['retrouvee', 'trouveeVite', 'transfert-place', 'transfert-scan'], 'le lendemain seul est faux');
  egal(['cr-ou', 'cr-fait'].map((k) => n.detail[k]), ['ok', 'ok'], '« pas trouvée » juste pour lui');
  proche(n.score, 11, 'note : 20 − 9');
  // L'inaction : rien validé le soir, rien envoyé.
  nouveau();
  await monter({ uid: 'ac813-inaction', graine: TA.graine });
  await allerV('entrepot');
  await valider(FAUSSES_Q);
  const n1 = await note();
  egal([n1.detail['adresseLibre-P3'], n1.detail['scan-P3'], n1.detail.retrouvee], ['ko', 'ko', 'attente'], 'le soir validé sans rien : faux ; le lendemain à faire');
  proche(n1.score, 0, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.13 : confirmé — la même enquête, une seule palette ; trouvée à la 4e ouverture → trouveeVite ✗ (3 au plus) ; accompagné — Yanis dit « pas loin » et le produit ; après « Valider mon transfert », l’adresse attendue', async () => {
  nouveau();
  await monter({ uid: 'ac813-conf', graine: TA.graine, aisance: 'confirme' });
  await allerV('entrepot');
  egal(await pg.$$eval(`${P} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P3'], 'deux palettes, comme le standard');
  await soir(TA, 'A');
  await passer();
  egal((await mailsDe('Yanis'))[0].text.includes('pas loin'), false, 'confirmé : Yanis sans aide');
  await ouvrir(TA.P9); await ouvrir('B1-T02-N1-E2'); await ouvrir(TA.P9); await ouvrir(TA.posee);
  egal(((await etatPlan()).lendemain || {}).trouveeA, 4, 'trouvée à la 4e ouverture');
  await transferer('P9', TA.posee, TA.P9);
  await validerL();
  await repondreSamia(PHR(PASSE.kevin, TA.posee, TA.P9));
  const n = await note();
  egal(jalonsFaux(n), ['trouveeVite'], 'confirmé : trop lent');
  proche(n.score, 19, 'note');
  const cs = await cases();
  vrai(cs.some((c) => c[0] === 'trouveeVite' && /Retrouvée en 3 ouvertures au plus/.test(c[2])), 'le bilan dit 3 ouvertures : ' + JSON.stringify(cs.find((c) => c[0] === 'trouveeVite')));
  // Accompagné : le texte de Yanis, puis le verdict avec l'adresse attendue.
  nouveau();
  await monter({ uid: 'ac813-acc', graine: TB.graine, aisance: 'accompagne' });
  await soir(TB, 'B');
  await passer();
  egal((await mailsDe('Yanis'))[0].text, `Bonjour ! Le terminal m’envoie en ${TB.P3}, niveau 1. C’est vide. Je ne peux pas préparer le magasin de Marseille. Tu peux regarder ? `
    + `Elle doit être pas loin. C’est une palette de ${TB.noms.P3}.\n\nYanis`, 'accompagné : « pas loin » et le produit cherché');
  await ouvrir(TB.acote);
  await validerL();
  vrai(/adresse attendue/.test(await pg.textContent(`${P} [data-pal-verdict]`)), 'accompagné : l’adresse attendue au verdict : ' + await pg.textContent(`${P} [data-pal-verdict]`));
  egal(erreursF, [], 'erreurs JavaScript');
});

await F.fermer();
}
