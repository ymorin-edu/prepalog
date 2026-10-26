// Suite de tests de Prepalog — bloc « tri » : la vue « Tri des colis » (core/types/tri.js), branchée dans le moteur d'entreprise
// le 26/10/2026 (brief docs/briefs/MOTEUR-vue-tri.md, page d'essai v4 validée par Tristan). `node outils/test.mjs tri` ne lance que ce bloc.
//
// Montée dans le vrai moteur d'entreprise, sur la séance d'essai de `outils/essai-tri-colis.js` (`universTri`, la série de la page
// d'essai : 12 colis, 3 pièges, 4 à écarter, le carton enfoncé qui part). Les variantes (refus, copie, tirage, question au fil) sont
// faites ici, à la main. Le minuteur s'avance par `__tri.avancer(s)` (aucune attente réelle) ; les clics passent par la souris.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCE = 'essai-tri';
const ctxT = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctxT.newPage();
pg.setDefaultTimeout(9000);
const erreurs = [];
const hotes = new Set();
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// o : { temps, deux, modif (variante fautive), sans (aucun tri : alerte 13), copie, db (reprise), uid, role, tire, question, tiersTemps }.
// Rend le message d'erreur si la séance est refusée, sinon null.
const monter = (o = {}) => pg.evaluate(async (o) => {
  document.getElementById('tri-hote')?.remove();
  const SEANCE = 'essai-tri';
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const { apresGeste } = await import('/core/declencheurs.js');
  const E = await import('/outils/essai-tri-colis.js');
  const temps = o.copie ? 'evaluation' : (o.temps || 'guidage');
  const D = E.triEssai({ temps, deux: !!o.deux });
  const c = (n) => D.series[0].colis.find((x) => x.n === n);
  if (o.modif === 'commune-double') D.sorties[1].communes.push(['Troyes', '10000']);
  if (o.modif === 'deux-anomalies') c('MR 4417 2115').etat = 'ouvert';
  if (o.modif === 'anomalie-fausse') c('MR 4417 2115').kg = 29.5;
  if (o.modif === 'piege-anomalie') c('MR 4417 2177').piege = 'Brienne est en T5.';
  if (o.modif === 'commune-inconnue') c('MR 4417 2093').commune = 'Reims';
  if (o.modif === 'evaluation-hors-copie') D.series[0].temps = 'evaluation';
  if (o.modif === 'sans-secondes') delete D.series[0].secondes;
  let decl = D;
  // Un tri TIRÉ : la série dépend de la graine (bob reçoit les colis à l'envers).
  if (o.tire) decl = (g) => { const X = JSON.parse(JSON.stringify(D)); if (g === 'u-bob') X.series[0].colis.reverse(); return X; };
  let U;
  try {
    U = E.universTri(decl, { copie: !!o.copie, seance: SEANCE });
    if (o.sans) { delete U.tri; U.etapes = []; }
    if (o.question) {
      U.questions = { id: SEANCE, personnes: { Romain: { nom: 'Romain Essai', role: 'chef d’équipe' } },
        liste: [{ id: 'pourquoi', type: 'fil', de: 'Romain', quand: apresGeste(o.question), reflexion: true,
          enonce: 'Pourquoi ce colis ne part-il pas ?', choix: [{ v: 'a', lib: 'Trop lourd pour le commerçant' }, { v: 'b', lib: 'Pour rien' }],
          retour: 'Le commerçant le porte seul.' }] };
    }
  } catch (e) { return e.message; }
  const hote = document.createElement('div'); hote.id = 'tri-hote'; document.body.prepend(hote);
  let M;
  try { M = creerEntreprise(U); } catch (e) { return e.message; }
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__tr = { db, moteur: M, copies: [] };
  M.rendre(hote, {
    meta: { id: SEANCE, code: 'ESSAI', titre: 'Tri — essai', portee: 'eleve', immersif: true, ...(o.copie ? { copie: true } : {}) },
    profil: { prenom: 'Lea', nom: 'Dupont', role: o.role || 'eleve', uid: o.uid || 'u-lea', tiersTemps: !!o.tiersTemps },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {},
    quitter: () => {}, codeStock: '', lireScore: async () => null,
    rendreCopie: async (res) => { window.__tr.copies.push(JSON.parse(JSON.stringify(res))); return { rendu: Date.now() }; },
  });
  const avis = hote.querySelector('.avis-err');
  if (avis) return avis.textContent;
  hote.querySelector('.ent-nav[data-vue="tri"]')?.click();
  return null;
}, o);

const R = '#tri-hote [data-t-tri]';
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__tr.db)));
const etat = async () => ((((await base()).tris || {})[SEANCE]) || {})['essai-tri'] || null;
const detail = () => pg.evaluate(() => window.__tr.moteur.noter(window.__tr.db).detail);
const statuts = async () => { const d = await detail(); return ['communes', 'pieges', 'ecarts', 'fauxEcarts', 'complet'].map((m) => d[`tri-${m}`]).join(' '); };
const note = () => pg.evaluate(() => window.__tr.moteur.noter(window.__tr.db).score);
const texte = (sel) => pg.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);
const clic = (sel) => pg.click(`${R} ${sel}`);
// Le bon tri de la page d'essai, colis par colis (écrit à la main, jamais recalculé par la vue).
const BON = ['T1', 'T3', 'ecart:poids', 'T2', 'T5', 'ecart:carton', 'T4', 'T2', 'ecart:taille', 'T3', 'T2', 'ecart:etiquette'];
const MOTIF = { poids: 'Trop lourd', taille: 'Trop grand', carton: 'Carton ouvert', etiquette: 'Étiquette illisible' };
// Envoie le colis du moment : 'T3' ou 'ecart:poids'.
async function trier(choix) {
  const [s, m] = choix.split(':');
  await clic(`button[data-t="sortie"][data-s="${s}"]`);
  if (m) await pg.click(`${R} button[data-t="motif"]:has-text("${MOTIF[m]}")`);
  await clic('button[data-t="envoyer"]');
}
const jouer = async (liste) => { for (const x of liste) await trier(x); };

await v('Tri : la vue s’ouvre au menu, plan de tri et règles affichés, balance lisible, le carton s’ouvre de près avec son étiquette et ses trois cotes', async () => {
  egal(await monter(), null, 'séance refusée');
  await pg.waitForSelector(`${R} [data-t-scene]`);
  egal(await texte('#tri-hote .ent-nav[data-vue="tri"]'), 'Ligne de tri', 'entrée de menu');
  egal(await pg.$$eval(`${R} .tri-plan tbody tr`, (L) => L.length), 5, 'lignes du plan de tri');
  egal(await pg.$$eval(`${R} button[data-t="sortie"]`, (L) => L.map((b) => b.dataset.s)), ['T1', 'T2', 'T3', 'T4', 'T5', 'ecart'], 'sorties');
  vrai(/plus de 30 kg/.test(await texte(`${R} .tri-regles`)) && /plus de 150 cm/.test(await texte(`${R} .tri-regles`)), 'règles affichées');
  egal(await texte(`${R} [data-t-balance]`), '2,4', 'balance du premier colis');
  egal(await texte(`${R} [data-t-compteur]`), 'Colis 1 / 12', 'compteur');
  vrai(/Clique le carton/.test(await texte(`${R} [data-t-fiche]`)), 'fiche fermée');
  vrai(await pg.$eval(`${R} button[data-t="envoyer"]`, (b) => b.disabled), 'envoi possible sans choix');
  await clic('[data-t-colis]');
  vrai(/10000 TROYES/.test(await texte(`${R} [data-t-etiquette]`)), 'étiquette lisible de près');
  egal(await pg.$$eval(`${R} [data-t-carton] text`, (L) => L.map((t) => t.textContent)), ['40 cm', '30 cm', '20 cm'], 'trois cotes');
  await clic('button[data-t="fermer"]');
  vrai(/Clique le carton/.test(await texte(`${R} [data-t-fiche]`)), 'fiche refermée');
  egal(await etat(), { series: { s1: { file: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], pos: 0, res: {}, tours: [], fait: false, vu: false, premier: null } } }, 'état neuf rangé sous la séance');
  egal(erreurs, [], 'erreurs de page');
});

await v('Tri : guidage — choisir puis valider ; retour tout de suite, juste en vert texte, faux en rouge texte avec ce qu’il faut regarder, jamais l’écart chiffré', async () => {
  await monter();
  await clic('button[data-t="sortie"][data-s="T1"]');
  egal(await texte(`${R} button[data-t="envoyer"]`), 'Envoyer le colis en T1', 'libellé du bouton');
  await clic('button[data-t="envoyer"]');
  vrai(/✓ Juste\. Troyes part bien en T1/.test(await texte(`${R} [data-t-retour]`)), 'retour juste');
  egal(await pg.$eval(`${R} [data-t-retour] .tri-ok`, (e) => getComputedStyle(e).backgroundColor), 'rgba(0, 0, 0, 0)', 'juste sans aplat');
  egal(await texte(`${R} [data-t-balance]`), '1,1', 'le colis suivant arrive');
  await trier('T2');                       // Saint-Julien, piège : T3
  const r = await texte(`${R} [data-t-retour]`);
  vrai(/✗ Saint-Julien-les-Villas n’est pas en T2/.test(r) && /Saint-André-les-Vergers/.test(r), `retour du piège : ${r}`);
  await clic('button[data-t="sortie"][data-s="ecart"]');
  vrai(await pg.$eval(`${R} button[data-t="envoyer"]`, (b) => b.disabled), 'écart sans motif');
  await pg.click(`${R} button[data-t="motif"]:has-text("Trop grand")`);
  egal(await texte(`${R} button[data-t="envoyer"]`), 'Mettre le colis à l’écart', 'libellé de l’écart');
  await clic('button[data-t="envoyer"]');   // Romilly 31,6 kg : poids
  const r2 = await texte(`${R} [data-t-retour]`);
  vrai(/mais pas pour cette raison\. Regarde la balance/.test(r2), `mauvais motif : ${r2}`);
  vrai(!/\d+,\d kg|1,6/.test(r2), 'le retour ne chiffre pas le dépassement');
  await trier('ecart:poids');               // Sainte-Savine en règle : faux écart
  vrai(/Ce colis pouvait partir\. Il est en règle : Sainte-Savine, c’est T2/.test(await texte(`${R} [data-t-retour]`)), 'faux écart');
  egal(erreurs, [], 'erreurs de page');
});

await v('Tri : la série juste donne tous les jalons (part 1), le bilan 12 sur 12 ; les gestes des colis et de la série sont rangés', async () => {
  await monter();
  egal(await statuts(), 'attente attente attente attente attente', 'à faire avant de trier');
  await jouer(BON);
  egal(await statuts(), 'ok ok ok ok ok', 'jalons');
  egal(await note(), 5, 'cinq jalons sans poids, chacun en entier');
  vrai(/12 colis sur 12 bien triés/.test(await texte(`${R} [data-t-bilan]`)), 'bilan');
  egal(await pg.$$eval(`${R} [data-t-bilan] td.tri-ko`, (L) => L.length), 0, 'aucune ligne fausse');
  const g = Object.keys((await base()).gestes[SEANCE]).sort();
  egal(g, ['tri:essai-tri:enfonce', 'tri:essai-tri:lourd', 'tri:essai-tri:s1:fini'], 'gestes');
  vrai(/Fin de la nuit/.test(await texte(`${R} [data-t-bilan]`)), 'phrase de fin');
});

await v('Tri : chaque faute fait tomber SON jalon (colis mal trié, piège, écart au mauvais motif, faux écart du carton enfoncé), et la part suit le nombre', async () => {
  await monter();
  const L = BON.slice();
  L[0] = 'T2';                 // un colis en règle mal trié : communes 4/5
  L[4] = 'T3';                 // Bar-sur-Aube en T3 : pièges 2/3
  L[8] = 'ecart:poids';        // Brienne écarté pour le poids : écarts 3/4
  L[9] = 'ecart:carton';       // le carton enfoncé écarté : faux écart (et communes 3/5)
  await jouer(L);
  const d = await detail();
  egal([d['tri-communes'], d['tri-pieges'], d['tri-ecarts'], d['tri-fauxEcarts'], d['tri-complet']].join(' '), 'ok ok ok ko ok', 'statuts');
  const f = await pg.evaluate(() => { const M = window.__tr.moteur; return M.noter(window.__tr.db).score; });
  egal(Math.round(f * 1000) / 1000, Math.round((3 / 5 + 2 / 3 + 3 / 4 + 0 + 1) * 1000) / 1000, 'parts');
  egal(await pg.$$eval(`${R} [data-t-bilan] td.tri-ko`, (L) => L.length), 4, 'quatre lignes fausses au bilan');
  vrai(/à l’écart \(Carton ouvert\)/.test(await texte(`${R} [data-t-ligne="9"]`)) && /T3/.test(await texte(`${R} [data-t-ligne="9"]`)), 'ligne du carton enfoncé');
});

await v('Tri : clavier — 1 à 5 et 0 choisissent, Entrée valide ; le focus reste au clavier après le redessin', async () => {
  await monter();
  await pg.focus(`${R} button[data-t="sortie"][data-s="T1"]`);
  await pg.keyboard.press('Tab');
  await pg.keyboard.press('1');
  egal(await pg.$eval(`${R} button[data-t="sortie"][data-s="T1"]`, (b) => b.getAttribute('aria-pressed')), 'true', 'touche 1');
  await pg.keyboard.press('0');
  egal(await pg.$eval(`${R} button[data-t="sortie"][data-s="ecart"]`, (b) => b.getAttribute('aria-pressed')), 'true', 'touche 0');
  await pg.keyboard.press('1');
  egal(await pg.evaluate(() => document.activeElement && document.activeElement.dataset.s), 'T2', 'focus gardé sur la sortie T2 après le redessin');
  await pg.evaluate(() => document.activeElement.blur());
  await pg.keyboard.press('Enter');
  egal(await texte(`${R} [data-t-balance]`), '1,1', 'Entrée a envoyé le colis');
  egal((await etat()).series.s1.res['0'], { s: 'T1', motif: null }, 'colis rangé');
});

await v('Tri : entraînement — pas de minuteur au premier colis ; ensuite un colis laissé passer revient à la fin, raté deux fois il est non trié ; aucun retour juste/faux pendant la série', async () => {
  await monter({ temps: 'entrainement' });
  vrai(await pg.$eval(`${R} [data-t-minuteur]`, (e) => e.hidden), 'minuteur au premier colis');
  vrai(/à partir du deuxième colis, chacun reste 20 secondes/.test(await texte(`${R} .tri-consigne`)), 'consigne');
  await pg.evaluate((R) => document.querySelector(R).__tri.avancer(60), R);
  await pg.waitForTimeout(450);
  egal(await texte(`${R} [data-t-balance]`), '2,4', 'le premier colis attend');
  await trier('T2');
  vrai(!/✓|✗/.test(await texte(`${R} [data-t-retour]`)), 'aucun verdict pendant la série');
  vrai(!(await pg.$eval(`${R} [data-t-minuteur]`, (e) => e.hidden)), 'minuteur au deuxième colis');
  await pg.evaluate((R) => document.querySelector(R).__tri.avancer(25), R);
  await pg.waitForFunction((R) => /fait le tour de la boucle/.test(document.querySelector(`${R} [data-t-retour]`).textContent), R);
  { const t = await texte(`${R} [data-t-compteur]`); vrai(/1 sur la boucle/.test(t), `compteur de la boucle : ${t}`); }
  egal(await texte(`${R} [data-t-balance]`), '31,6', 'colis suivant');
  await jouer(BON.slice(2));
  egal(await texte(`${R} [data-t-balance]`), '1,1', 'le colis laissé passer revient en fin de série');
  await pg.evaluate((R) => document.querySelector(R).__tri.avancer(25), R);
  await pg.waitForSelector(`${R} [data-t-bilan]`);
  egal((await etat()).series.s1.res['1'], { s: null, motif: null }, 'non trié au second passage');
  vrai(/non trié/.test(await texte(`${R} [data-t-ligne="1"]`)), 'bilan à la fin');
  egal(await statuts(), 'ok ok ok ko ok', 'Troyes mal trié (4/5), piège non trié (2/3), colis laissé sur le tapis');
});

await v('Tri : aucun jalon ne se gagne sans trier — une série laissée passer donne 0 partout, fauxEcarts compris', async () => {
  await monter({ temps: 'entrainement' });
  await trier('T1');
  for (let i = 0; i < 40; i++) {
    if (await pg.$(`${R} [data-t-bilan]`)) break;
    await pg.evaluate((R) => document.querySelector(R).__tri.avancer(25), R);
    await pg.waitForTimeout(260);
  }
  vrai(!!(await pg.$(`${R} [data-t-bilan]`)), 'la série se finit');
  egal(await statuts(), 'ok ko ko ko ok', 'un seul colis trié');
  egal(Math.round((await note()) * 1000) / 1000, Math.round((1 / 5 + 1) * 1000) / 1000, 'un cinquième des communes, et la série finie');
  // Sens inverse : rien du tout = 0 partout, `complet` compris.
  await monter({ temps: 'entrainement' });
  await pg.evaluate(() => { const S = window.__tr.db.tris['essai-tri']['essai-tri'].series.s1; S.fait = true; S.file.forEach((k) => { S.res[k] = { s: null, motif: null }; }); S.premier = S.res; });
  egal(await statuts(), 'ko ko ko ko ko', 'aucun tri');
  egal(await note(), 0, 'note');
});

await v('Tri : tiers-temps — le temps par colis passe à 27 s (× 4/3) ; question au fil — la vue est gelée et le minuteur s’arrête', async () => {
  await monter({ temps: 'entrainement', tiersTemps: true });
  vrai(/chacun reste 27 secondes/.test(await texte(`${R} .tri-consigne`)), 'consigne au tiers-temps');
  await monter({ temps: 'entrainement', question: 'tri:essai-tri:lourd' });
  await jouer(['T1', 'T3', 'ecart:poids']);
  await pg.waitForFunction(() => /Pourquoi ce colis ne part-il pas/.test(document.getElementById('tri-hote').textContent), null, { timeout: 4000 });
  const reste = await pg.evaluate((R) => document.querySelector(R).__tri.lire().reste, R);
  await pg.waitForTimeout(700);
  egal(await pg.evaluate((R) => document.querySelector(R).__tri.lire().reste, R), reste, 'minuteur arrêté pendant la question');
  await pg.click(`${R} button[data-t="sortie"][data-s="T2"]`, { force: true }).catch(() => {});
  egal(await pg.evaluate((R) => document.querySelector(R).__tri.lire().choix.s, R), null, 'choix ignoré pendant la question');
});

await v('Tri : guidage rejoué — le premier résultat compte, la nouvelle série repart de zéro', async () => {
  await monter();
  const L = BON.slice(); L[0] = 'T2';
  await jouer(L);
  egal(await statuts(), 'ok ok ok ok ok', 'premier passage');
  const avant = await note();
  await clic('button[data-t="rejouer"]');
  egal(await texte(`${R} [data-t-compteur]`), 'Colis 1 / 12', 'la série repart');
  await jouer(BON);
  egal(await note(), avant, 'le premier passage reste la note');
  vrai(/Seul ton premier passage compte/.test(await texte(`${R} [data-t-bilan]`)), 'le bilan le dit');
});

await v('Tri : deux séries — la série 2 s’ouvre après « Passer à la série suivante », chaque jalon lit les deux ; le geste de fin de chaque série est rangé', async () => {
  await monter({ deux: true });
  await jouer(BON);
  vrai(/Série 1 \(1 sur 2\)/.test(await texte(`${R} .tri-tete`)), 'titre de la série 1');
  egal((await detail())['tri-complet'], 'attente', 'à faire tant que la série 2 n’est pas finie');
  await clic('button[data-t="suite"]');
  vrai(/Série 2 \(2 sur 2\)/.test(await texte(`${R} .tri-tete`)), 'titre de la série 2');
  egal(await pg.$$eval(`${R} button[data-t="rejouer"]`, (L) => L.length), 0, 'pas de rejouer en entraînement');
  await jouer(BON.slice(0, 4));
  egal(await statuts(), 'ok ok ok ok ok', 'jalons des deux séries');
  egal(Object.keys((await base()).gestes[SEANCE]).filter((g) => /fini$/.test(g)).sort(), ['tri:essai-tri:s1:fini', 'tri:essai-tri:s2:fini'], 'gestes de fin');
});

await v('Tri : évaluation (copie) — aucun retour, aucun bilan pour l’élève ; la note se calcule ; après la remise la vue se consulte sans se modifier', async () => {
  await monter({ copie: true });
  vrai(/Trie la série seul/.test(await texte(`${R} .tri-consigne`)), 'consigne d’évaluation');
  await trier('T1');
  egal(await texte(`${R} [data-t-retour]`), 'Colis MR 4417 2093 envoyé en T1.', 'aucun verdict');
  await jouer(BON.slice(1));
  vrai(/Ton tri est enregistré/.test(await texte(`${R} [data-t-bilan]`)), 'fin de série');
  egal(await pg.$$eval(`${R} .tri-tab`, (L) => L.length), 0, 'aucun tableau de bilan pour l’élève');
  egal(await statuts(), 'ok ok ok ok ok', 'jalons');
  const n = await pg.evaluate(() => window.__tr.moteur.noter(window.__tr.db));
  egal(n.detail['tri-communes'], 'ok', 'noter(db)');
  // Le refus dans l'autre sens : une évaluation n'accepte pas de série de guidage.
  const e = await pg.evaluate(async () => {
    const { creerTri } = await import('/core/types/tri.js'); const E = await import('/outils/essai-tri-colis.js');
    try { creerTri(E.triEssai({ temps: 'guidage' }), { copie: true }); return null; } catch (x) { return x.message; }
  });
  vrai(/une évaluation \(copie\) n’a que des séries « evaluation »/.test(e || ''), `refus : ${e}`);
});

await v('Tri : déclarations fautives refusées (commune dans deux sorties, deux anomalies, anomalie écrite qui contredit les mesures, piège sur un colis à écarter, commune inconnue, évaluation hors copie, minuteur sans secondes)', async () => {
  const cas = {
    'commune-double': /la commune « Troyes » est dans deux sorties/,
    'deux-anomalies': /plusieurs anomalies \(poids, carton\)/,
    'anomalie-fausse': /l’anomalie écrite \(« poids »\) contredit ses mesures \(aucune\)/,
    'piege-anomalie': /un piège ne se pose que sur un colis en règle/,
    'commune-inconnue': /la commune « Reims » n’est dans aucune sortie/,
    'evaluation-hors-copie': /une série « evaluation » demande une séance copie/,
  };
  for (const [m, re] of Object.entries(cas)) {
    const e = await monter({ modif: m });
    vrai(re.test(e || ''), `${m} : ${e}`);
  }
  const e = await monter({ temps: 'entrainement', modif: 'sans-secondes' });
  vrai(/il faut `secondes`/.test(e || ''), `sans secondes : ${e}`);
  // Le calcul du bon tri, dans les deux sens : 30,0 kg pile part, 30,1 kg va à l'écart ; 151 cm de somme va à l'écart, 150 part.
  const b = await pg.evaluate(async () => {
    const { bonTri } = await import('/core/types/tri.js'); const E = await import('/outils/essai-tri-colis.js');
    const D = E.triEssai(), c = (kg, dim, etat) => ({ n: 'X', commune: 'Troyes', relais: 'r', rue: 'r', kg, dim, etat });
    return [bonTri(D, c(30, [40, 30, 20])), bonTri(D, c(30.1, [40, 30, 20])), bonTri(D, c(2, [60, 50, 40])), bonTri(D, c(2, [60, 50, 41])),
      bonTri(D, c(2, [120, 15, 10])), bonTri(D, c(2, [121, 10, 10])), bonTri(D, c(2, [40, 30, 20], 'enfonce'))].map((x) => `${x.s}${x.motif ? ':' + x.motif : ''}`);
  });
  egal(b, ['T1', 'ecart:poids', 'T1', 'ecart:taille', 'T1', 'ecart:taille', 'T1'], 'limites');
});

await v('Tri : alerte 13 — sans « tri » déclaré, ni entrée de menu, ni état rangé ; l’option est dans la table OPTIONS', async () => {
  egal(await monter({ sans: true }), null, 'séance sans tri refusée');
  egal(await pg.$$eval('#tri-hote .ent-nav[data-vue="tri"]', (L) => L.length), 0, 'entrée de menu');
  egal((await base()).tris, undefined, 'db.tris');
  egal(await pg.evaluate(async () => (await import('/core/types/entreprise-options.js')).OPTIONS.tri.type), 'object|function', 'table OPTIONS');
  egal(await monter(), null, 'avec le tri');
  egal(await pg.$$eval('#tri-hote .ent-nav[data-vue="tri"]', (L) => L.length), 1, 'entrée de menu avec le tri');
});

await v('Tri : tri tiré — deux élèves, deux séries ; le même élève retrouve la sienne à la reprise', async () => {
  egal(await monter({ tire: true, uid: 'u-bob' }), null, 'tirée refusée');
  egal(await texte(`${R} [data-t-balance]`), '9,9', 'premier colis de bob');
  await trier('ecart:etiquette');
  egal(await monter({ tire: true, uid: 'u-bob', db: await base() }), null, 'reprise refusée');
  egal(await texte(`${R} [data-t-balance]`), '0,6', 'bob reprend au deuxième colis de sa série');
  egal(await statuts(), 'attente attente attente attente attente', 'à faire');
  egal(await monter({ tire: true, uid: 'u-lea' }), null, 'lea refusée');
  egal(await texte(`${R} [data-t-balance]`), '2,4', 'premier colis de lea');
});

await v('Tri : 1366 × 768 et 1280 × 720 — tout tient dans un seul bloc, sans défilement de la page, fiche ouverte comprise ; aucune requête hors du site', async () => {
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pg.setViewportSize({ width: w, height: h });
    await monter();
    await clic('[data-t-colis]');
    await clic('button[data-t="sortie"][data-s="ecart"]');
    await pg.waitForTimeout(80);
    const m = await pg.evaluate((R) => ({ bas: document.querySelector(`${R} [data-t-retour]`).getBoundingClientRect().bottom,
      droite: document.querySelector(`${R} .tri-droite`).getBoundingClientRect().bottom, haut: window.innerHeight }), R);
    vrai(m.bas <= m.haut && m.droite <= m.haut, `${w} × ${h} : la vue dépasse l’écran (${Math.round(m.bas)}, ${Math.round(m.droite)} > ${m.haut})`);
  }
  await pg.setViewportSize({ width: 1366, height: 768 });
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs de page');
});

await ctxT.close();
}
