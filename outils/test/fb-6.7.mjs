// Suite de tests de Prepalog — bloc « fb-6.7 » : ENT-6.7 (France Boissons, la commande de Malo à la voix).
// `node outils/test.mjs fb-6.7` ne lance que ce bloc. Les aides communes (contexte, page, relevé d'erreurs JavaScript, lecture de la base)
// sont dans `outils/test/france-boissons/commun.mjs`. Les gestes de l'allée de picking, du terminal et du montage sont testés en détail
// au bloc `entrepot` (« Picking : … », « Montage : … ») sur le contenu d'essai ; ici, la VRAIE séance (`activites/france-boissons-preparation.js`) :
// sa déclaration, ses poids, ses questions, ses messages, de vrais clics.

import { ouvrirFB } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, bandeau, entrants, horodate, calcPresente, nettoyerCalc, erreursF } = F;

await pg.emulateMedia({ reducedMotion: 'reduce' });

// ── ENT-6.7 (brief `docs/briefs/ENT-6.7-france-boissons-preparation.md`, §8 ; moteur D-7). Valeurs ÉCRITES À LA MAIN (brief §4, §5) :
//   lignes A-T01 eau 3 (code 36) · A-T02 Pelforth 2 (24) · A-T03 Affligem S18 2, dont 1 cabossé → « Abîmé » 1 puis 1 (49) ·
//   B-T03 Affligem S24 1, ajoutée (83) · A-T04 Heineken 30 L 6 (17) ;
//   jalons (somme 16) : ligne-A-T01 1, ligne-A-T02 1, ligne-A-T04 1 · ligne-A-T03 3, ligne-B-T03 2 · montage-casier 2, montage-futs 2,
//   montage-palettes 1 · montage-film 1,5, montage-etiquettes 1,5 ; questions notées (4) : code-emplacement 1, materiel-employeur 1,5,
//   futs-abimes-vendeur 1,5 (au bilan).
const ID67 = 'france-boissons-preparation', P67 = 'fb-ent67-picking';
const REP67 = { 'fifo-lots': 'ancien', 'vocal-dialogue': 'annonce', 'picking-reserve': 'prelever', 'poids-futs': 'juste',
  'terminal-informe': 'avant', 'pause-6h': 'vingt', 'consigne-vides': 'fut', 'ddm-biere': 'ddm', 'portique-role': 'lever', 'ciseaux-hauteur': 'hauteur' };
const PREP67 = ['fifo-lots', 'vocal-dialogue', 'picking-reserve', 'poids-futs'], DROIT67 = ['terminal-informe', 'pause-6h', 'consigne-vides', 'ddm-biere'],
  IMAGE67 = ['portique-role', 'ciseaux-hauteur'];
const monter67 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-preparation.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['france-boissons-preparation'] = db.questions['france-boissons-preparation'] || {});
    for (const [id, v] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: v, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb67' },
    jeu: { etat: () => db, sauver: () => {} }, ...(o.son ? { sonTerminal: true } : {}),
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep: REP67 });

const BONNES67 = { 'code-emplacement': 'endroit', 'materiel-employeur': 'employeur', 'futs-abimes-vendeur': 'vendeur' };
const FAUSSES67 = { 'code-emplacement': 'quantite', 'materiel-employeur': 'salarie', 'futs-abimes-vendeur': 'malo' };
let choix67 = BONNES67;
const vus67 = [];
async function qrep67() {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    vus67.push(id);
    await pg.click(`${Z} [data-q-choix="${choix67[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
const VT67 = `${Z} [data-terminal]`;
const etat67 = () => pg.evaluate((P) => JSON.parse(JSON.stringify(((window.__f.db.entrepots || {})[P]) || null)), P67);
const journal67 = () => pg.evaluate((P) => ((((window.__f.db.entrepots || {})[P] || {}).terminal) || { journal: [] }).journal.length, P67);
async function rep67(x) {
  const avant = await journal67();
  await pg.fill(`${VT67} [data-vt-champ]`, String(x));
  await pg.press(`${VT67} [data-vt-champ]`, 'Enter');
  await pg.waitForFunction(({ P, n }) => window.__f.db.entrepots[P].terminal.journal.length > n, { P: P67, n: avant });
}
async function mot67(id) {
  const avant = await journal67();
  await pg.click(`${VT67} [data-vt-mot="${id}"]`);
  await pg.waitForFunction(({ P, n }) => window.__f.db.entrepots[P].terminal.journal.length > n, { P: P67, n: avant });
}
// Poser la ligne en cours (0, 1 ou « cote »), puis répondre à la question au fil qu'elle a pu déclencher.
async function poser67(d) {
  const avant = await pg.evaluate((P) => window.__f.db.entrepots[P].terminal.i, P67);
  await pg.click(`${Z} [data-pk-poser="${d}"]`);
  await pg.waitForFunction(({ n, P }) => { const T = window.__f.db.entrepots[P].terminal; return T.i > n || !!T.fin; }, { n: avant, P: P67 });
  // La question au fil arrive après la sauvegarde : attendre qu'elle soit là, ou que le terminal reprenne (champ actif ou fini).
  await pg.waitForFunction((Z) => !!document.querySelector(`${Z} [data-q-panneau]`)
    || !!document.querySelector(`${Z} [data-terminal] [data-vt-champ]:not([disabled])`) || !!document.querySelector(`${Z} [data-vt-bilan]`), Z);
  await qrep67();
}
// Une préparation complète à l'écran. `dest` : la destination des 5 lignes dans l'ordre du terminal (eau, Pelforth, Affligem S18,
// Affligem S24, Heineken), sans la ligne S24 si `a3` ne la fait pas venir ; `a3` : les gestes de la ligne A-T03 après son code ;
// `cote` : la palette de chaque objet « à côté », dans l'ordre ; `film`, `etiq` : par palette ; `verifier` (vrai par défaut).
const ABIME = ['MOT:abime', '1', '1'];
async function preparer67({ dest = ['cote', 1, 1, 1, 0], a3 = ABIME, b3 = '1', cote = [1, 1, 1], film = ['4', '4'],
  etiq = [['avant', 'arriere', 'dessus'], ['avant', 'arriere', 'dessus']], verifier = true } = {}) {
  await aller('entrepot');
  await pg.waitForSelector(VT67);
  const d = dest.slice();
  await rep67('36'); await rep67('3'); await poser67(d.shift());
  await rep67('24'); await rep67('2'); await poser67(d.shift());
  await rep67('49');
  for (const g of a3) { if (g.startsWith('MOT:')) await mot67(g.slice(4)); else await rep67(g); }
  if ((await etat67()).terminal.phase !== 'pose') { /* « Emplacement vide » sans rien pris : pas de pose */ } else await poser67(d.shift());
  if (/Côté B, travée 03/.test(await pg.textContent(`${VT67} [data-vt-actu]`))) { await rep67('83'); await rep67(b3); await poser67(d.shift()); }
  await rep67('17'); await rep67('6'); await poser67(d.shift());
  await pg.waitForSelector(`${Z} [data-pk="verifier"]`);
  for (const p of cote) { await pg.click(`${Z} [data-pk-objet="0"]`); await pg.click(`${Z} [data-pk-vers="${p}"]`); await pause(30); }
  for (let k = 0; k < 2; k++) {
    if (film[k]) await pg.selectOption(`${Z} [data-pk-film="${k}"]`, film[k]);
    for (const c of etiq[k]) await pg.check(`${Z} [data-pk-etiq="${k}:${c}"]`);
  }
  if (!verifier) return;
  await pg.click(`${Z} [data-pk="verifier"]`);
  await pg.waitForSelector(`${Z} [data-pk-bilan]`);
  await pause(); await qrep67();
}
const JALONS67 = ['ligne-A-T01', 'ligne-A-T02', 'ligne-A-T04', 'ligne-A-T03', 'ligne-B-T03', 'montage-casier', 'montage-futs', 'montage-palettes',
  'montage-film', 'montage-etiquettes'];
const POIDS67 = { 'ligne-A-T01': 1, 'ligne-A-T02': 1, 'ligne-A-T04': 1, 'ligne-A-T03': 3, 'ligne-B-T03': 2, 'montage-casier': 2, 'montage-futs': 2,
  'montage-palettes': 1, 'montage-film': 1.5, 'montage-etiquettes': 1.5 };
const etats67 = (n) => JALONS67.map((j) => [j, n.detail[j]]);
const sauf67 = (faux) => JALONS67.map((j) => [j, faux.includes(j) ? 'ko' : 'ok']);
const points67 = (faux) => 20 - faux.reduce((s, j) => s + POIDS67[j], 0);
const MONTAGE67 = ['montage-casier', 'montage-futs', 'montage-palettes', 'montage-film', 'montage-etiquettes'];

await v('ENT-6.7 : déclaration — meta (entraînement C2.1, parcours après ENT-6.6), dix jalons aux poids écrits à la main (16) + trois questions notées (4) = 20, quatre groupes, aucun jalon à 0', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/france-boissons-preparation.js');
    const S = await import('/contenus/france-boissons-ent67.js');
    const Qs = await import('/contenus/questions/ENT-6.7.js');
    return { meta: A.meta, etapes: S.ETAPES.map((e) => [e.id, e.poids, e.groupe]), part: Qs.QUESTIONS.part,
      notees: Qs.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids, q.type, q.apres || null]),
      reflexions: Qs.QUESTIONS.liste.filter((q) => q.reflexion).length, montage: S.ENTREPOT.montage };
  });
  const m = r.meta;
  egal([m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.parcours, m.precedente, m.questions, m.corrige, m.portee, m.correction, m.suiteAuBilan],
    ['france-boissons-preparation', 'ENT-6.7', 'simulog', ['2de'], ['C2.1'], ['D4'], 'entrainement', 20, true, 'france-boissons-inventaire', 'ENT-6.7',
      './contenus/corriges/ENT-6.7.js', 'eleve', undefined, true], 'meta');
  vrai(m.jeuId === undefined, 'une base par séance : aucun jeuId partagé');
  const L = 'Les lignes du terminal', Ab = 'Le fût abîmé', M = 'Le montage des palettes', Fe = 'Film et étiquettes';
  egal(r.etapes, [['ligne-A-T01', 1, L], ['ligne-A-T02', 1, L], ['ligne-A-T04', 1, L], ['ligne-A-T03', 3, Ab], ['ligne-B-T03', 2, Ab],
    ['montage-casier', 2, M], ['montage-futs', 2, M], ['montage-palettes', 1, M], ['montage-film', 1.5, Fe], ['montage-etiquettes', 1.5, Fe]], 'jalons, poids et groupes');
  egal(r.etapes.reduce((s, e) => s + e[1], 0), 16, 'somme des jalons');
  vrai(r.etapes.every((e) => e[1] > 0), 'aucun jalon à 0');
  egal(r.part, 4, 'part des questions');
  egal(r.notees, [['code-emplacement', 1, 'fil', null], ['materiel-employeur', 1.5, 'fil', null], ['futs-abimes-vendeur', 1.5, 'fil', 'bilan']], 'questions notées');
  egal(r.reflexions, 0, 'la réflexion est celle de la vue');
  vrai(/gagné/.test(r.montage.reflexion) && r.montage.palettes === 2, 'la réflexion « gagné / perdu » sous le bilan de la vue');
});

await v('ENT-6.7 : livraison — pret: true et ouverture: prof, rang entre ENT-6.6 et ENT-6.8 ; aucune séance en échec au registre', async () => {
  const r = await pg.evaluate(async () => {
    const I = await import('/activites/index.js');
    const L = await I.chargerActivites();
    const A = await import('/activites/france-boissons-preparation.js');
    const S8 = await import('/activites/france-boissons-planning.js');
    const codes = (Array.isArray(L) ? L : []).map((x) => (x.meta || x).code).filter((c) => /^ENT-6\./.test(c || ''));
    return { pret: A.meta.pret, ouverture: A.meta.ouverture, echecs: I.activitesEnEchec().length, codes, apres: S8.meta.precedente };
  });
  egal([r.pret, r.ouverture, r.echecs], [true, 'prof', 0], 'livraison');
  egal(r.apres, 'france-boissons-preparation', 'ENT-6.8 s’ouvre après ENT-6.7 (décision de Tristan du 12/10/2026)');
  if (r.codes.length) { const i = r.codes.indexOf('ENT-6.7'); vrai(i > 0 && r.codes[i - 1] === 'ENT-6.6' && r.codes[i + 1] === 'ENT-6.8', 'rang : ' + r.codes); }
});

await v('ENT-6.7 : données — la commande d’ENT-6.2 reprise (eau 3, Pelforth 2, Affligem 2, Heineken 6), lignes dans l’ordre du parcours, « Abîmé 1 » attendu en A-T03, remplacement B-T03', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent67.js');
    const E = await import('/core/types/entrepot.js');
    return { lignes: S.LIGNES, att: E.bonnesReponses(S.ENTREPOT), codes: Object.fromEntries(Object.entries(S.EMPLACEMENTS).map(([k, e]) => [k, e.code])) };
  });
  egal(r.lignes, [{ emplacement: 'A-T01', prends: 3 }, { emplacement: 'A-T02', prends: 2 },
    { emplacement: 'A-T03', prends: 2, attendu: { mot: 'abime', n: 1 }, remplacement: { emplacement: 'B-T03' } }, { emplacement: 'A-T04', prends: 6 }], 'lignes');
  egal(r.codes, { 'A-T01': '36', 'B-T01': '58', 'A-T02': '24', 'B-T02': '71', 'A-T03': '49', 'B-T03': '83', 'A-T04': '17', 'B-T04': '62' }, 'codes');
  vrai(!!r.att, 'bonnesReponses : ' + JSON.stringify(r.att).slice(0, 200));
});

await v('ENT-6.7 : ouverture — message de Nadia (17 juin 2027, 13 h 55), menu ; aucun bon de préparation ; le code n’est pas dans l’allée (seulement de près)', async () => {
  await monter67({ uid: 'fb67-ouv' });
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue)),
    ['ouverture', 'accueil', 'mail', 'animation:fb-ent67-materiel', 'entrepot'], 'menu (le matériel, l’allée)');
  const M = await entrants();
  egal(M.length, 1, 'un seul message au départ');
  egal(M[0].subject, 'La commande de Malo', 'sujet');
  egal(M[0].text, 'Re-bonjour Lea !\n\nCet après-midi, la commande de Malo pour la tournée de la côte, demain 6 h.\n\n'
    + 'Le [[terminal vocal]] te donne les lignes une par une, dans l’ordre du parcours. Tu montes deux [[palette client|palettes client]] '
    + 'dans la zone de préparation, devant le quai 14.\n\nNadia', 'texte');
  egal(horodate(M[0].ts), [2027, 6, 17, 13, 55], 'date du scénario');
  await aller('animation:fb-ent67-materiel');
  const mat = await texte();
  vrai(/tiroirs coulissants/.test(mat) && /portique à fûts/.test(mat) && /transpalette à ciseaux/.test(mat), 'écran du matériel');
  await aller('entrepot');
  await pg.waitForSelector(VT67);
  const t = await texte();
  vrai(/réapprovisionné depuis la zone de masse/.test(t), 'le réassort du matin');
  vrai(!(await present('[data-iso-code]')), 'aucune étiquette de lisse dans l’allée');
  const html = await pg.$eval(Z, (e) => e.innerHTML);
  vrai(!/\b(36|58|71|49|83|62)\b/.test(t) && !/>(36|58|71|49|83|62)</.test(html), 'un code dans l’allée');
  vrai(!/Prends 6|Heineken 30 L/.test(t), 'aucune ligne à venir (pas de bon de préparation)');
  await pg.click(`${Z} [data-pk-adr="A-T03"]`); await pause();
  egal(await pg.textContent(`${Z} [data-iso-code]`), '49', 'le code se lit de près');
  await pg.click(`${Z} [data-pm="retour"]`); await pause();
});

await v('ENT-6.7 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau', async () => {
  await monter67({ uid: 'fb67-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
});

await v('ENT-6.7 : parcours juste — un code faux (redemandé, trace, rien de perdu), « Abîmé 1 », la ligne S24 ajoutée, les trois questions, à côté puis posé, Vérifier → 20/20 ; bandeau ; Nadia répond ; ce que sait le terminal', async () => {
  choix67 = BONNES67; vus67.length = 0;
  await monter67({ uid: 'fb67-juste' });
  await aller('entrepot');
  await pg.waitForSelector(VT67);
  egal(await pg.textContent(`${VT67} [data-vt-actu]`), 'Côté A, travée 01, niveau 1. Code de contrôle ?', 'première phrase');
  await rep67('63');
  egal(await pg.textContent(`${VT67} [data-vt-actu]`), 'Côté A, travée 01, niveau 1. Code de contrôle ?', 'code faux : redemandé');
  await rep67('36');
  vrai(/Eau minérale, casier de douze bouteilles\. Prends 3\./.test(await pg.textContent(`${VT67} [data-vt-actu]`)), 'la quantité');
  await rep67('3');
  egal(await pg.textContent(`${Z} [data-pk-question]`), 'Où poses-tu les 3 casiers Eau minérale 1 L ?', 'la question de pose');
  await poser67('cote');
  egal(vus67, ['code-emplacement'], 'la question de Nadia arrive à la première ligne posée');
  await rep67('24'); await rep67('2'); await poser67(1);
  egal(vus67, ['code-emplacement', 'materiel-employeur'], 'la question d’Inès à la deuxième');
  await rep67('49');
  await rep67('1');
  vrai(/Tu dois prendre 2\. Si tu ne peux pas, dis/.test(await pg.textContent(VT67)), '« 1 » sans mot : refusé');
  await rep67('3');
  vrai(/Trop\. Prends 2\./.test(await pg.textContent(VT67)), '« 3 » : refusé');
  await mot67('abime');
  egal(await pg.textContent(`${VT67} [data-vt-actu]`), 'Abîmé : combien ?');
  await rep67('1'); await rep67('1'); await poser67(1);
  vrai(/Côté B, travée 03, niveau 1\. Code de contrôle \?/.test(await pg.textContent(`${VT67} [data-vt-actu]`)), 'la ligne S24 arrive');
  await rep67('83'); await rep67('1'); await poser67(1);
  await rep67('17'); await rep67('6'); await poser67(0);
  await pg.waitForSelector(`${Z} [data-vt-bilan]`);
  vrai(/productivité des préparateurs/.test(await pg.textContent(`${Z} [data-vt-bilan]`)), '« Ce que le terminal sait de toi »');
  vrai(await pg.$eval(`${Z} [data-pk="verifier"]`, (b) => b.disabled), 'Vérifier inactif tant qu’un objet est à côté');
  for (let i = 0; i < 3; i++) { await pg.click(`${Z} [data-pk-objet="0"]`); await pg.click(`${Z} [data-pk-vers="1"]`); }
  for (const k of [0, 1]) {
    await pg.selectOption(`${Z} [data-pk-film="${k}"]`, '4');
    for (const c of ['avant', 'arriere', 'dessus']) await pg.check(`${Z} [data-pk-etiq="${k}:${c}"]`);
  }
  egal((await entrants()).length, 1, 'pas de message de fin avant « Vérifier »');
  await pg.click(`${Z} [data-pk="verifier"]`);
  await pg.waitForSelector(`${Z} [data-pk-bilan]`);
  await pause(); await qrep67();
  egal(vus67, ['code-emplacement', 'materiel-employeur', 'futs-abimes-vendeur'], 'la question sur le fût cabossé au premier « Vérifier »');
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(etats67(n), sauf67([]), 'jalons');
  // Sans « Corriger » : le bandeau d'origine, « Séance validée », avec le retour de la question corrigée au bilan.
  egal(await pg.$eval(`${Z} [data-fin]`, (e) => e.dataset.fin), 'ok', 'bandeau « Séance validée »');
  vrai(/D’où « Abîmé » au terminal, avant le départ\./.test(await pg.textContent(`${Z} [data-fin]`)), 'le retour de la question sur le fût cabossé, au bilan');
  egal(await bandeau(), [], 'aucune étape fausse nommée');
  egal((await etat67()).terminal.codesFaux, { 'A-T01': 1 }, 'trace du code faux');
  egal((await entrants()).filter((m) => m.subject === 'RE : la commande de Malo').map((m) => m.text),
    ['Parfait, Lea. Les deux palettes partent demain 6 h avec Lucas.\n\nLe fût cabossé, je le passe en casse : sinon, demain, le stock mentirait.\n\nNadia'], 'Nadia');
  vrai(!!(await base()).points[ID67], 'photo de fin : la séance suivante peut s’ouvrir');
});

await v('ENT-6.7 : le fût cabossé pris sans rien dire → jalons 3 et 4 faux, pas de ligne S24, montage « non jugé » : 3 + 4 = 7/20 ; pas de message de fin', async () => {
  choix67 = BONNES67;
  await monter67({ uid: 'fb67-pris' });
  await preparer67({ a3: ['2'], dest: ['cote', 1, 1, 0] });
  const n = await note();
  egal(etats67(n), sauf67(['ligne-A-T03', 'ligne-B-T03', ...MONTAGE67]), 'jalons');
  egal(n.score, 7, '3 points de lignes + 4 de questions');
  vrai(!(await etat67()).terminal.exceptions || !Object.keys((await etat67()).terminal.exceptions).length, 'aucune exception');
  egal((await entrants()).filter((m) => m.subject === 'RE : la commande de Malo').length, 0, 'pas de message de fin');
  vrai(((await pg.textContent(`${Z} [data-pk-bilan]`)).match(/non jugé/g) || []).length === 5, 'les critères « non jugé »');
});

await v('ENT-6.7 : « Manquant 1 » → la ligne S24 arrive, jalon 3 seul faux, montage non jugé (9/20) ; « Emplacement vide » → S24 de 2, jalons 3 et 4 faux (7/20)', async () => {
  choix67 = BONNES67;
  await monter67({ uid: 'fb67-manq' });
  await preparer67({ a3: ['MOT:manquant', '1', '1'] });
  let n = await note();
  egal(etats67(n), sauf67(['ligne-A-T03', ...MONTAGE67]), 'Manquant : jalons');
  egal(n.score, 9, '1 + 1 + 1 + 2 + 4');
  await monter67({ uid: 'fb67-vide' });
  await preparer67({ a3: ['MOT:vide'], b3: '2', dest: ['cote', 1, 1, 0] });
  n = await note();
  egal(etats67(n), sauf67(['ligne-A-T03', 'ligne-B-T03', ...MONTAGE67]), 'Emplacement vide : jalons');
  egal(n.score, 7);
});

await v('ENT-6.7 : chaque critère du montage coûte son poids — 3 casiers puis 6 Heineken sur la même palette (−2), film 2 tours (−1,5), étiquettes voisines (−1,5), tout sur une palette (−5)', async () => {
  choix67 = BONNES67;
  await monter67({ uid: 'fb67-casiers' });
  await preparer67({ dest: [0, 1, 1, 1, 0], cote: [] });
  let n = await note();
  egal([etats67(n), n.score], [sauf67(['montage-casier']), points67(['montage-casier'])], 'fûts sur les casiers');
  await monter67({ uid: 'fb67-film' });
  await preparer67({ film: ['4', '2'] });
  n = await note();
  egal([etats67(n), n.score], [sauf67(['montage-film']), 18.5], 'film 2 tours');
  await monter67({ uid: 'fb67-etiq' });
  await preparer67({ etiq: [['avant', 'arriere', 'dessus'], ['avant', 'droite', 'dessus']] });
  n = await note();
  egal([etats67(n), n.score], [sauf67(['montage-etiquettes']), 18.5], 'étiquettes voisines');
  await monter67({ uid: 'fb67-une' });
  await preparer67({ dest: [0, 0, 0, 0, 0], cote: [], film: ['4', ''], etiq: [['avant', 'arriere', 'dessus'], []] });
  n = await note();
  egal([etats67(n), n.score], [sauf67(['montage-casier', 'montage-futs', 'montage-palettes']), 15], 'tout sur une palette');
});

await v('ENT-6.7 : on reprend le montage — refaire le film et revérifier rattrape le critère ; les lignes ne se refont pas', async () => {
  choix67 = BONNES67;
  await monter67({ uid: 'fb67-repr' });
  await preparer67({ film: ['4', '2'] });
  egal((await note()).score, 18.5, 'premier bilan');
  await pg.selectOption(`${Z} [data-pk-film="1"]`, '4');
  vrai(!(await present('[data-pk-bilan]')), 'un changement efface la vérification');
  await pg.click(`${Z} [data-pk="verifier"]`);
  await pg.waitForSelector(`${Z} [data-pk-bilan]`);
  await pause();
  egal((await note()).score, 20, 'revérifié : 20');
  vrai(!(await pg.$(`${VT67} [data-vt-champ]:not([disabled])`)), 'le terminal est fini : rien à refaire');
});

await v('ENT-6.7 : questions — les trois fausses = −4 (deux tout de suite, la dernière au bilan) ; jalons inchangés', async () => {
  choix67 = FAUSSES67;
  await monter67({ uid: 'fb67-qfaux' });
  await preparer67();
  const n = await note();
  egal(n.score, 16, '20 − 1 − 1,5 − 1,5');
  egal(etats67(n), sauf67([]), 'les jalons ne bougent pas');
  egal(await pg.$eval(`${Z} [data-fin]`, (e) => e.dataset.fin), 'ko', 'bandeau');
  egal((await bandeau()).map((x) => x[0]), ['question:code-emplacement', 'question:materiel-employeur', 'question:futs-abimes-vendeur'], 'les trois questions nommées');
  vrai(/La séance suivante, ENT-6\.8/.test(await pg.textContent(`${Z} [data-fin]`)) || !/s'ouvrira quand tout sera juste/.test(await pg.textContent(`${Z} [data-fin]`)),
    'aucun élève bloqué : la suite ne dépend pas de « tout juste »');
  egal((await base()).questions[ID67]['futs-abimes-vendeur'].premiere, 'malo', 'réponse rangée');
  choix67 = BONNES67;
});

await v('ENT-6.7 : son coupé par défaut ; le terminal ne montre aucun aplat ni texte vert', async () => {
  await monter67({ uid: 'fb67-son' });
  await aller('entrepot'); await pg.waitForSelector(VT67);
  vrai(!(await present('[data-vt-son]')), 'aucun bouton de son sans le réglage de l’enseignant');
  vrai(/sans son/.test(await pg.textContent(VT67)), '« sans son »');
  await rep67('12');   // un refus en rouge, pour qu'il soit dans ce qu'on regarde
  const verts = await pg.$$eval(`${VT67}, ${VT67} *`, (L) => {
    const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
    const vert = (s) => { const [r, g, b, a = 1] = rgb(s); return a > 0.05 && g > r + 30 && g > b + 30; };
    return L.map((e) => { const c = getComputedStyle(e); return [e.tagName, vert(c.backgroundColor), vert(c.color), vert(c.borderTopColor)]; })
      .filter((x) => x[1] || x[2] || x[3]);
  });
  egal(verts, [], 'du vert dans le terminal');
});

await v('ENT-6.7 : « Avant de commencer » — 5 questions tirées (2 + 2 + 1), non notées, la calculette ; toute la banque sort sur 300 graines ; valeurs tirées jamais celles de la séance ; le dessin servi et crédité', async () => {
  await nettoyerCalc();
  await monter67({ sansOuverture: true, uid: 'fb67-ouv-1' });
  vrai(await present('[data-ouverture="avant-de-commencer"]'), 'la séance ne s’ouvre pas sur « Avant de commencer »');
  vrai(await calcPresente(), 'calculette absente');
  const t1 = (await base()).questions[ID67]['@tirage'].ids;
  egal([t1.filter((i) => PREP67.includes(i)).length, t1.filter((i) => DROIT67.includes(i)).length, t1.filter((i) => IMAGE67.includes(i)).length], [2, 2, 1], 'répartition : ' + t1);
  for (let k = 0; k < t1.length; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await pg.click(`${Z} [data-q-choix="${REP67[t1[k]]}"][data-q="${t1[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${t1[k]}"]`);
    await pause();
  }
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('entrepot'), 'menu ouvert après les réponses');
  egal((await note()).score, 0, 'l’ouverture ne compte pas');
  await nettoyerCalc();
  const r = await pg.evaluate(async () => {
    const { compilerQuestions, tirerOuverture } = await import('/core/types/questions.js');
    const { hasard } = await import('/core/tirage.js');
    const { QUESTIONS } = await import('/contenus/questions/ENT-6.7.js');
    const M = compilerQuestions(QUESTIONS, null, ['mots', 'photos', 'droit']);
    const T = [];
    for (let s = 0; s < 300; s++) T.push(tirerOuverture(M, `graine-${s}`).ids);
    const va = (id) => QUESTIONS.liste.find((q) => q.id === id).variante;
    const V = [];
    for (let s = 0; s < 300; s++) V.push([va('fifo-lots')(hasard(`f${s}`)), va('poids-futs')(hasard(`p${s}`)), va('consigne-vides')(hasard(`c${s}`))]);
    const imgs = QUESTIONS.ouverture.documents.find((d) => d.id === 'photos').images;
    const statuts = [];
    for (const im of imgs) statuts.push((await fetch(im.src)).status);
    const cred = await (await fetch('/contenus/images/france-boissons/CREDITS.md')).text();
    return { T, V, imgs: imgs.map((i) => i.src.split('/').pop()), statuts, cred };
  });
  egal([...new Set(r.T.flat())].sort(), [...PREP67, ...DROIT67, ...IMAGE67].sort(), 'toute la banque sort');
  vrai(r.T.every((ids) => ids.length === 5), '5 questions chaque fois');
  vrai(r.V.every(([f]) => { const [a, b] = f.enonce.match(/S(\d+)/g).map((x) => +x.slice(1)); return a < b && ![a, b].some((x) => x === 18 || x === 24) && f.libs.ancien.startsWith(`S${a}`); }),
    'FIFO : le plus ancien juste, jamais S18 ni S24');
  vrai(r.V.every(([, p]) => { const n = +p.enonce.match(/(\d+) fûts/)[1]; return n !== 6 && p.libs.juste === `${n * 40} kg` && new Set(Object.values(p.libs)).size === 3; }), 'poids : jamais 6 fûts, n × 40 kg');
  vrai(r.V.every(([, , c]) => { const k = +c.enonce.match(/rend (\d+)/)[1]; return k !== 9 && c.libs.fut === `${k * 40} €`; }), 'consigne : jamais 9, k × 40 €');
  egal(r.statuts, [200], 'le dessin est servi par le dépôt');
  vrai(r.imgs.every((f) => r.cred.includes(f)), 'ligne de crédit');
});

await v('ENT-6.7 : « Le droit » cite L4121-1, R4541-3, L3121-16, L1222-4, le Code civil 1603, la DDM et la consigne ; corrigé calculé', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent67.js');
    const C = await import('/contenus/corriges/ENT-6.7.js');
    return { droit: S.DOCUMENTS.find((d) => d.id === 'droit').html, mots: S.DOCUMENTS.find((d) => d.id === 'mots').html, corrige: JSON.stringify(C.CORRIGE) };
  });
  for (const a of ['L4121-1', 'protéger la santé physique et mentale', 'R4541-3', 'éviter le recours à la manutention manuelle', 'L3121-16',
    'vingt minutes consécutives', 'L1222-4', 'porté préalablement à sa connaissance', '1603', 'celle de délivrer et celle de garantir',
    'conserve ses propriétés spécifiques', '40 €']) vrai(r.droit.includes(a), 'le droit : ' + a);
  vrai(!/\b(36|24|49|83|17)\b/.test(r.mots) && !/Prends/.test(r.mots), 'les mots ne donnent ni code ni quantité');
  for (const a of ['["A-T03","49","Affligem Blonde 20 L, lot S18","2","« Abîmé », 1, puis 1 pris"]', '["B-T03","83"', '["A-T04","17","Heineken 30 L","6"',
    '"6 Heineken 30 L"', '"2 Pelforth + 2 Affligem + 3 casiers eau minérale"', 'Total 20, tout en C2.1']) vrai(r.corrige.includes(a), 'corrigé : ' + a);
});

await v('ENT-6.7 : enseignant — la séance s’ouvre (allée, terminal), rien ne remonte au suivi', async () => {
  await monter67({ role: 'prof', uid: 'prof' });
  await aller('entrepot');
  await pg.waitForSelector(VT67);
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontées');
});

await pg.emulateMedia({ reducedMotion: null });

await v('ENT-6.7 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

await F.fermer();
}
