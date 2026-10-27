// Suite de tests de Prepalog — bloc « ligne » : la vue « Bord de ligne » (core/types/ligne.js), branchée dans le moteur d'entreprise
// le 27/10/2026 (brief docs/briefs/MOTEUR-vue-bord-de-ligne.md, page d'essai du 26/10). `node outils/test.mjs ligne` ne lance que ce bloc.
//
// Montée dans le vrai moteur d'entreprise, sur la séance d'essai de `outils/essai-ligne.js` (la matinée de la page d'essai : quatre postes,
// deux robots, le camion de planches de bord en retard). Les minutes passent par `__ligne.avancer(n)` (aucune attente réelle). Les valeurs
// attendues sont écrites à la main (calcul en commentaire), jamais recalculées par la vue.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCE = 'essai-ligne';
const ctxL = await nav.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
const pg = await ctxL.newPage();
pg.setDefaultTimeout(9000);
const erreurs = [];
const hotes = new Set();
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// o : { temps, camion, minutes, modif (variante fautive), copie, rendue (copie déjà rendue), db (reprise), uid, role, tire, question, tiersTemps }.
// Rend le message d'erreur si la séance est refusée, sinon null.
const monter = (o = {}) => pg.evaluate(async (o) => {
  document.getElementById('lg-hote')?.remove();
  const SEANCE = 'essai-ligne';
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const { apresGeste } = await import('/core/declencheurs.js');
  const E = await import('/outils/essai-ligne.js');
  const temps = o.copie ? 'evaluation' : (o.temps || 'guidage');
  const D = E.ligneEssai({ temps, camion: !!o.camion, minutes: o.minutes || 90 });
  const p = (id) => D.postes.find((x) => x.id === id);
  if (o.modif === 'trop-lourd') p('roue').kg = 1200;
  if (o.modif === 'sans-besoin') p('siege').besoin = { 3008: 0, 5008: 0 };
  if (o.modif === 'depart') p('retro').depart = [40, 30];
  if (o.modif === 'modele') D.sequence.push('2008');
  if (o.modif === 'camion-avance') D.camion.arrivee = '06:25';
  if (o.modif === 'evaluation-hors-copie') D.temps = 'evaluation';
  let decl = D;
  // Une matinée TIRÉE : bob a deux contenants de rétroviseurs de moins au transstockeur.
  if (o.tire) decl = (g) => { const X = JSON.parse(JSON.stringify(D)); if (g === 'u-bob') X.postes[1].stock = 8; return X; };
  let U;
  try {
    U = E.universLigne(decl, { copie: !!o.copie, seance: SEANCE });
    if (o.question) {
      U.questions = { id: SEANCE, personnes: { Karim: { nom: 'Karim Essai', role: 'chef d’équipe' } },
        liste: [{ id: 'pourquoi', type: 'fil', de: 'Karim', quand: apresGeste(o.question), reflexion: true,
          enonce: 'Pourquoi grouper les cartes ?', choix: [{ v: 'a', lib: 'Pour garder un robot libre' }, { v: 'b', lib: 'Pour rien' }],
          retour: 'Deux robots seulement.' }] };
    }
  } catch (e) { return e.message; }
  const hote = document.createElement('div'); hote.id = 'lg-hote'; document.body.prepend(hote);
  let M;
  try { M = creerEntreprise(U); } catch (e) { return e.message; }
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__lg = { db, moteur: M, copies: [], L: await import('/core/types/ligne.js') };
  M.rendre(hote, {
    meta: { id: SEANCE, code: 'ESSAI', titre: 'Bord de ligne — essai', portee: 'eleve', immersif: true, ...(o.copie ? { copie: true } : {}) },
    profil: { prenom: 'Lea', nom: 'Dupont', role: o.role || 'eleve', uid: o.uid || 'u-lea', tiersTemps: !!o.tiersTemps },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {},
    quitter: () => {}, codeStock: '', lireScore: async () => (o.rendue ? { rendu: Date.now() } : null),
    rendreCopie: async (res) => { window.__lg.copies.push(JSON.parse(JSON.stringify(res))); return { rendu: Date.now() }; },
  });
  const avis = hote.querySelector('.avis-err');
  if (avis) return avis.textContent;
  hote.querySelector('.ent-nav[data-vue="ligne"]')?.click();
  return null;
}, o);

const R = '#lg-hote [data-l-ligne]';
const etat = () => pg.evaluate(() => JSON.parse(JSON.stringify(((window.__lg.db.lignes || {})['essai-ligne'] || {})['essai-ligne'] || null)));
const detail = () => pg.evaluate(() => window.__lg.moteur.noter(window.__lg.db).detail);
const MESURES = ['voitures', 'arret', 'groupes', 'complet'];
const statuts = async (L = MESURES) => { const d = await detail(); return L.map((m) => d[`ligne-${m}`]).join(' '); };
const note = () => pg.evaluate(() => window.__lg.moteur.noter(window.__lg.db).score);
const texte = (sel) => pg.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);
const clic = (sel) => pg.click(`${R} ${sel}`);
const avancer = (n) => pg.evaluate(([R, n]) => document.querySelector(R).__ligne.avancer(n), [R, n]);
const lire = () => pg.evaluate((R) => document.querySelector(R).__ligne.lire(), R);
// Un joueur qui GROUPE les cartes et envoie tout de suite (la plus urgente d'abord), minute par minute jusqu'à `jusque` (minutes depuis
// 6 h), ou une carte par robot (`seul`), ou rien (`rien`). Il joue sur l'état rangé, avec les fonctions de la vue, puis fait passer la
// minute par la vue (`avancer`). Il s'arrête au message du camion.
const jouer = (jusque, { seul = false, rien = false } = {}) => pg.evaluate(([R, jusque, seul, rien]) => {
  const L = window.__lg.L, el = document.querySelector(R), D = el.__ligne.declaration;
  const st = window.__lg.db.lignes['essai-ligne'][D.id];
  const kg = (c) => D.postes.find((p) => p.id === c.p).kg;
  for (let i = 0; i < 300 && st.t < jusque && !st.fait && !(st.evt >= 1 && st.evt <= 3); i++) {
    for (let j = 0; j < 4 && !rien; j++) {
      const C = st.cartes.filter((c) => st.stock[c.p] > 0).sort((a, b) => L.couverture(D, st, a.p) - L.couverture(D, st, b.p));
      if (!C.length) break;
      const ks = [C[0].k];
      if (!seul) { const c2 = C.slice(1).find((c) => kg(C[0]) + kg(c) <= D.robots.kgMax && (c.p !== C[0].p || st.stock[c.p] >= 2)); if (c2) ks.push(c2.k); }
      if (!L.envoyerRobot(D, st, ks).ok) break;
    }
    el.__ligne.avancer(1);
  }
  return { t: st.t, n: st.n, arret: st.arret, envois: st.envois, demiVides: st.demiVides };
}, [R, jusque, seul, rien]);

await v('Ligne : l’écran s’ouvre au menu, quatre postes et leurs deux contenants, la ligne ne tourne pas avant « Démarrer la matinée »', async () => {
  egal(await monter(), null, 'séance refusée');
  await pg.waitForSelector(`${R} [data-l-scene]`);
  egal(await texte('#lg-hote .ent-nav[data-vue="ligne"]'), 'Bord de ligne', 'entrée de menu');
  egal(await texte(`${R} [data-l-horloge]`), '06:00', 'heure de début');
  egal(await texte(`${R} [data-l-compteur]`), '0 / 90 voitures', 'compteur');
  // En guidage, la couverture est affichée : roues 12 + 28 = 40 pièces, 4 par voiture → 10 voitures.
  egal(await texte(`${R} [data-l-couv="roue"]`), 'tient 10 voitures', 'couverture des roues');
  // Sièges du 3e rang : 3 + 6 = 9, un par 5008 ; les 5008 sont les voitures n° 3, 7, 10, puis 13, 17, 20, 23, 27, 30, 33… (motif de 10)
  // → la 10e 5008 est la 33e voiture, qui manquerait : 9 sièges tiennent 32 voitures.
  egal(await texte(`${R} [data-l-couv="siege"]`), 'tient 32 voitures', 'couverture des sièges (seules les 5008 en prennent)');
  egal(await avancer(5), { t: 0, n: 0, arret: 0 }, 'la ligne attend le départ');
  vrai(/Démarrer la matinée \(06:00\)/.test(await texte(`${R} [data-l-depart]`)), 'bouton de départ');
  const e = await etat();
  egal([e.t, e.n, e.parti, e.pos.roue, e.stock.pdb, e.cartes.length], [0, 0, false, [12, 28], 12, 0], 'état neuf rangé sous la séance');
  egal(erreurs, [], 'erreurs de page');
});

await v('Ligne : déclarations fautives refusées (contenant trop lourd, poste sans besoin, départ trop plein, modèle inconnu, camion pas en retard, évaluation hors copie)', async () => {
  for (const [m, re] of [['trop-lourd', /ne tient pas dans un robot/], ['sans-besoin', /ne sert à aucun modèle/], ['depart', /entre 1 et 30 pièces/],
    ['modele', /modèle inconnu « 2008 »/], ['camion-avance', /pas en retard/], ['evaluation-hors-copie', /demande une séance `copie`/]]) {
    const r = await monter({ modif: m, camion: m === 'camion-avance' });
    vrai(re.test(r || ''), `${m} : ${r}`);
  }
});

await v('Ligne : guidage — la première carte tombe à 06:03 et le collègue arrête la ligne ; un robot à deux cartes trop lourdes est refusé ; le robot livre en 5 minutes', async () => {
  await monter();
  await clic('[data-l="demarrer"]');
  // Roues : 12 pièces en cours, 4 par voiture → le contenant en cours est vide après la 3e voiture (minute 3).
  egal(await avancer(10), { t: 3, n: 3, arret: 0 }, 'la ligne s’arrête à la première carte');
  egal((await lire()).coach, 'carte', 'explication de la première carte');
  vrai(/Une carte kanban vient de tomber/.test(await texte(`${R} [data-l-coach]`)), 'texte du collègue');
  egal(await pg.$$eval(`${R} [data-l="carte"]`, (L) => L.length), 1, 'une carte dans la boîte');
  await clic('[data-l="coach-ok"]');
  await clic('[data-l="carte"]');
  vrai(/1 contenant, 560 kg sur 1.?000/.test(await texte(`${R} [data-l-charge]`)), `chargement affiché : ${await texte(`${R} [data-l-charge]`)}`);
  await clic('[data-l="envoyer"]');
  vrai(/R1 part : livraison au bord de ligne à 06:08/.test(await texte(`${R} [data-l-retour]`)), 'R1 part (3 + 5 = 8)');
  // Planches de bord : 6 en cours, une par voiture → carte à la minute 6 ; puis deux cartes attendent (roues à 10 ? non : la palette
  // d'avance de 28 roues tient 7 voitures, jusqu'à la minute 10). On fait passer jusqu'à la livraison.
  let e = await etat();
  egal(e.robots[0].liv.a, 8, 'arrivée rangée');
  for (let i = 0; i < 6; i++) { await avancer(10); if ((await lire()).coach) await clic('[data-l="coach-ok"]'); }
  e = await etat();
  egal(e.pos.roue.length >= 1 && e.robots[0].liv === null, true, 'R1 a livré');
  // Deux cartes trop lourdes : roues (560 kg) et planches de bord (520 kg) = 1 080 kg.
  await pg.evaluate(() => { const st = window.__lg.db.lignes['essai-ligne']['essai-ligne']; st.cartes = [{ k: 90, p: 'roue', t: st.t }, { k: 91, p: 'pdb', t: st.t }]; });
  await clic('[data-l="pause"]'); await clic('[data-l="pause"]');
  await clic('[data-l="carte"][data-k="90"]'); await clic('[data-l="carte"][data-k="91"]');
  vrai(await pg.$eval(`${R} [data-l="envoyer"]`, (b) => b.disabled), 'envoi impossible au-delà de 1 000 kg');
  vrai(/1080 kg sur 1000|1 080 kg sur 1 000/.test((await texte(`${R} [data-l-charge]`)).replace(/\s/g, ' ')), 'charge trop lourde affichée');
  egal(await pg.evaluate(() => { const L = window.__lg.L, el = document.querySelector('#lg-hote [data-l-ligne]'); const st = window.__lg.db.lignes['essai-ligne']['essai-ligne'];
    const n = st.envois; const r = L.envoyerRobot(el.__ligne.declaration, st, [90, 91]); return [r.motif, st.envois === n]; }), ['lourd', true], 'refus sans rien changer');
});

await v('Ligne : sans aucun geste, la ligne s’arrête à 06:10 (plus de roues) et chaque minute compte ; aucun jalon ne se gagne', async () => {
  await monter({ temps: 'entrainement' });
  await clic('[data-l="demarrer"]');
  // Roues : 40 pièces au départ, 4 par voiture → 10 voitures, puis plus rien.
  egal(await avancer(12), { t: 12, n: 10, arret: 2 }, 'arrêt depuis 06:10');
  vrai(/✗ Ligne arrêtée depuis 2 min : plus de roues complètes au bord de ligne\. 1.?200 personnes attendent\./.test(await texte(`${R} [data-l-arret]`)), `message d’arrêt : ${await texte(`${R} [data-l-arret]`)}`);
  egal(await pg.$eval(`${R} [data-l-arret]`, (e) => getComputedStyle(e).backgroundColor), 'rgba(0, 0, 0, 0)', 'arrêt sans aplat');
  await avancer(100);
  egal(await statuts(), 'ko ko ko ko', 'tout à 0 sans un robot envoyé');
  egal(await note(), 0, 'note');
  vrai(/Le bilan de ta matinée/.test(await texte(`${R} [data-l-bilan]`)), 'bilan en entraînement');
  vrai(/10 sur 90/.test(await texte(`${R} [data-l-ligne="voitures"]`)), 'voitures montées au bilan');
  // 80 minutes × 1 200 personnes = 96 000 minutes = 1 600 heures.
  vrai(/96.?000 minutes, soit 1.?600 heures/.test(await texte(`${R} [data-l-ligne="perdu"]`)), `temps perdu en heures : ${await texte(`${R} [data-l-ligne="perdu"]`)}`);
});

await v('Ligne : un joueur qui groupe les cartes n’arrête jamais la ligne (tout juste) ; un joueur qui envoie une carte par robot part à moitié vide', async () => {
  await monter({ temps: 'entrainement' });
  await clic('[data-l="demarrer"]');
  const r = await jouer(90);
  egal([r.n, r.arret, r.demiVides], [90, 0, 0], 'matinée parfaite');
  egal(await statuts(), 'ok ok ok ok', 'jalons');
  await monter({ temps: 'entrainement' });
  await clic('[data-l="demarrer"]');
  const s = await jouer(90, { seul: true });
  vrai(s.demiVides > 10, `robots à moitié vides : ${s.demiVides}`);
  egal((await statuts())[0], 'o', 'voitures : une part');
  const groupes = await pg.evaluate(() => { const L = window.__lg.L; const D = document.querySelector('#lg-hote [data-l-ligne]').__ligne.declaration;
    return L.jalonLigne(D, 'essai-ligne', { mesure: 'groupes' }).fraction(window.__lg.db); });
  vrai(groupes < 0.3, `part des robots pleins : ${groupes}`);
});

await v('Ligne : le camion en retard — à 06:20 la ligne attend la réponse ; l’heure d’arrêt et les voitures perdues se calculent sur le bord de ligne ; le convoi avance l’arrivée', async () => {
  await monter({ temps: 'entrainement', camion: true });
  await clic('[data-l="demarrer"]');
  const r = await jouer(30, { rien: true });
  egal([r.t, r.n], [20, 10], 'arrêt au message de 06:20');
  egal(await avancer(5), { t: 20, n: 10, arret: 10 }, 'la ligne attend la réponse');
  vrai(/aura du retard/.test(await texte(`${R} [data-l-evt]`)), 'message ouvert');
  // À 06:20, 10 voitures montées : planches de bord 16 − 10 = 6 au bord de ligne + 3 racks de 10 au transstockeur = 36 → 06:20 + 36 = 06:56.
  egal(await pg.$$eval(`${R} [data-l="rep"][data-q="heure"]`, (L) => L.map((b) => b.textContent.trim())), ['vers 06:46', 'vers 06:56', 'vers 07:06', 'vers 07:15'], 'choix de l’heure');
  await clic('[data-l="rep"][data-q="heure"][data-v="56"]');
  // Le camion à 07:15 : 07:15 − 06:56 = 19 voitures perdues.
  egal(await pg.$$eval(`${R} [data-l="rep"][data-q="perdues"]`, (L) => L.map((b) => b.textContent.trim())), ['9 voitures', '19 voitures', '24 voitures', '45 voitures'], 'choix des voitures perdues');
  await clic('[data-l="rep"][data-q="perdues"][data-v="24"]');
  await clic('[data-l="rep"][data-q="decision"][data-v="secours"]');
  const e = await etat();
  egal([e.camion.arrivee, e.camion.statut, e.rep.heure, e.rep.perdues, e.rep.decision], [38, 'secours', 56, 24, 'secours'], 'réponses rangées, convoi à 06:38');
  vrai(/convoi de secours, arrivée 06:38/.test(await texte(`${R} [data-l-stockz]`)), 'le convoi à l’écran');
  await avancer(100);
  const d = await detail();
  egal(['heure', 'perdues', 'decision'].map((m) => d[`ligne-${m}`]).join(' '), 'ok ko ok', 'jalons du camion');
  vrai(/✗/.test(await texte(`${R} [data-l-ligne="perdues"]`)) && /19/.test(await texte(`${R} [data-l-ligne="perdues"]`)), 'le bilan donne le juste');
});

await v('Ligne : guidage du camion — la réponse est corrigée tout de suite, avec le calcul ; « Continuer » passe à la question suivante', async () => {
  await monter({ temps: 'guidage', camion: true });
  await clic('[data-l="demarrer"]');
  await pg.evaluate(() => { const st = window.__lg.db.lignes['essai-ligne']['essai-ligne']; st.coach = { carte: true, deux: true, bas: true, arret: true }; });
  await jouer(30, { rien: true });
  await clic('[data-l="rep"][data-q="heure"][data-v="46"]');
  vrai(/✗ Pas tout à fait\. Il reste 36 planches de bord en tout/.test(await texte(`${R} [data-l-evt-retour]`)), 'retour faux avec le calcul');
  egal(await pg.$eval(`${R} [data-l-evt-retour] .lg-ko`, (e) => getComputedStyle(e).backgroundColor), 'rgba(0, 0, 0, 0)', 'faux sans aplat');
  egal(await avancer(3), { t: 20, n: 10, arret: 10 }, 'la ligne attend « Continuer »');
  await clic('[data-l="evt-suite"]');
  vrai(/Combien de voitures perdues/.test(await texte(`${R} [data-l-evt]`)), 'question suivante');
});

await v('Ligne : premier résultat gardé — « Recommencer la matinée » repart de zéro, la note ne bouge pas ; pause : rien ne part, l’heure ne tourne pas', async () => {
  await monter({ temps: 'entrainement' });
  await clic('[data-l="demarrer"]');
  await jouer(90, { seul: true });
  const avant = await note();
  await clic('[data-l="rejouer"]');
  egal(await texte(`${R} [data-l-horloge]`), '06:00', 'la matinée repart');
  await clic('[data-l="demarrer"]');
  await jouer(90);
  egal(await note(), avant, 'le premier résultat reste la note');
  vrai(/Seule ta première matinée compte/.test(await texte(`${R} [data-l-bilan]`)), 'le bilan le dit');
  await monter({ temps: 'entrainement' });
  await clic('[data-l="demarrer"]');
  await avancer(3);
  await clic('[data-l="pause"]');
  egal(await avancer(5), { t: 3, n: 3, arret: 0 }, 'l’heure ne tourne pas en pause');
  vrai(await pg.$eval(`${R} [data-l="carte"]`, (b) => b.disabled), 'carte inerte en pause');
  vrai(await pg.$eval(`${R} [data-l="envoyer"]`, (b) => b.disabled), 'envoi impossible en pause');
  await clic('[data-l="pause"]');
  await clic('[data-l="carte"]');
  await clic('[data-l="envoyer"]');
  egal((await etat()).envois, 1, 'après la pause, le robot part');
});

await v('Ligne : évaluation (copie) — aucune couverture, aucun bilan pour l’élève, jamais rejouée ; copie rendue = écran figé', async () => {
  egal(await monter({ copie: true }), null, 'évaluation refusée');
  egal(await pg.$$eval(`${R} [data-l-couv]`, (L) => L.length), 0, 'couverture cachée');
  vrai(/aucune aide ne s’affiche/.test(await texte(`${R} .lg-consigne`)), 'consigne de l’évaluation');
  await clic('[data-l="demarrer"]');
  await jouer(90);
  vrai(/Ta matinée est enregistrée/.test(await texte(`${R} [data-l-bilan]`)), 'pas de bilan');
  egal(await pg.$$eval(`${R} [data-l="rejouer"]`, (L) => L.length), 0, 'pas de « Recommencer »');
  egal(await statuts(), 'ok ok ok ok', 'jalons lus au Suivi');
  // Une matinée en cours, copie rendue : l'écran se consulte, rien ne bouge.
  egal(await monter({ copie: true }), null, 'évaluation refusée');
  await clic('[data-l="demarrer"]');
  await avancer(3);
  const db = await pg.evaluate(() => JSON.parse(JSON.stringify(window.__lg.db)));
  await monter({ copie: true, rendue: true, db });
  await pg.waitForSelector('#lg-hote [data-copie-etat="rendue"]');
  const t = (await etat()).t;
  egal(t, 3, 'la matinée rendue');
  egal((await avancer(5)).t, t, 'copie rendue : la ligne ne tourne plus');
});

await v('Ligne : question au fil — après la fin de la matinée, la question arrive ; tiers-temps : la minute passe à 1,6 s (1,2 × 4/3)', async () => {
  await monter({ temps: 'entrainement', question: 'ligne:essai-ligne:fini' });
  await clic('[data-l="demarrer"]');
  await avancer(3);
  await clic('[data-l="carte"]');
  await clic('[data-l="envoyer"]');
  await jouer(90);
  await pg.waitForFunction(() => /Pourquoi grouper les cartes/.test(document.getElementById('lg-hote').textContent), null, { timeout: 4000 });
  const g = await pg.evaluate(() => Object.keys(window.__lg.db.gestes['essai-ligne']).filter((x) => /^ligne:/.test(x)).sort());
  egal(g, ['ligne:essai-ligne:envoi', 'ligne:essai-ligne:fini'], 'gestes rangés');
  await monter({ temps: 'entrainement', tiersTemps: true });
  vrai(/Une minute de ligne dure 1,6 s/.test(await texte(`${R} .lg-consigne`)), 'consigne au tiers-temps');
});

await v('Ligne : matinée tirée — deux élèves, deux transstockeurs ; le même élève retrouve sa matinée à la reprise', async () => {
  egal(await monter({ tire: true, uid: 'u-bob', temps: 'entrainement' }), null, 'tirée refusée');
  egal((await etat()).stock.retro, 8, 'stock de bob');
  await clic('[data-l="demarrer"]');
  await avancer(4);
  egal(await monter({ tire: true, uid: 'u-bob', temps: 'entrainement', db: await pg.evaluate(() => JSON.parse(JSON.stringify(window.__lg.db))) }), null, 'reprise refusée');
  egal(await texte(`${R} [data-l-horloge]`), '06:04', 'bob reprend à 06:04');
  egal(await monter({ tire: true, uid: 'u-lea', temps: 'entrainement' }), null, 'lea refusée');
  egal((await etat()).stock.retro, 10, 'stock de lea');
});

await v('Ligne : 1366 × 768 — l’atelier et la boîte kanban tiennent à l’écran ; aucune requête hors du site', async () => {
  await monter({ temps: 'entrainement', camion: true });
  await clic('[data-l="demarrer"]');
  const m = await pg.evaluate((R) => ({ scene: document.querySelector(`${R} [data-l-scene]`).getBoundingClientRect().bottom,
    envoyer: document.querySelector(`${R} [data-l="envoyer"]`).getBoundingClientRect().bottom, haut: window.innerHeight,
    large: document.documentElement.scrollWidth <= window.innerWidth }), R);
  vrai(m.envoyer <= m.haut, `le bouton d’envoi sort de l’écran (${Math.round(m.envoyer)} > ${m.haut})`);
  vrai(m.large, 'pas de défilement horizontal');
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs de page');
});

await ctxL.close();
}
