// Suite de tests de Prepalog — bloc « localiser » : la vue « Localiser » (core/types/localiser.js), situer les lieux d'une
// entreprise sur la carte de France (région → département → ville). Brief docs/briefs/MOTEUR-vue-localiser.md, lots 2 et 3
// (15/10/2026). `node outils/test.mjs localiser` ne lance que ce bloc.
//
// Montée dans le vrai moteur d'entreprise, décor Boost, sur le contenu d'essai `contenus/localiser-essai.js` : le jeu ACTION
// (lieux éloignés : trajet fléché à la fin ; lieu bonus du confirmé) et le jeu PROCHE (France Boissons : encart zoomé).
// Les clics passent par la SOURIS, sur un point de la zone que `elementFromPoint` confirme (zones concaves, voisines).
//
// Ce que la suite NE refait pas : le build des contours (`outils/carte/construire-france.py` : Python, shapely et les sources
// IGN, absents de GitHub). Sa reproductibilité (trois SHA-256 identiques) est notée au compte rendu du brief.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCE = 'essai-localiser';
const ctxL = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctxL.newPage();
pg.setDefaultTimeout(9000);
const erreurs = [];
const hotes = new Set();
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// o : { jeu: 'action' | 'proche', aisance, role, db (reprise), question (geste qui l'appelle), meta (en plus), modif (nom d'une
// variante fautive du contenu, pour les contrôles), fermeture (localiserFini sur une carte), copie }.
// Rend le message d'erreur si la séance est refusée (creerEntreprise lève, ou l'hôte affiche un avis), sinon null.
const monter = (o = {}) => pg.evaluate(async (o) => {
  document.getElementById('lc-hote')?.remove();
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const { etapesLocaliser } = await import('/core/types/localiser.js');
  const { apresGeste, localiserFini } = await import('/core/declencheurs.js');
  const B = await import('/contenus/boost.js');
  const E = await import('/contenus/localiser-essai.js');
  const L = JSON.parse(JSON.stringify(o.jeu === 'proche' ? { ...E.LOCALISER_PROCHE, contours: null } : { ...E.LOCALISER_ACTION, contours: null }));
  L.contours = E.LOCALISER_ACTION.contours;
  const lieu = (id) => L.lieux.find((x) => x.id === id);
  // Les variantes FAUTIVES (contrôles au chargement) : chacune casse une seule règle.
  if (o.modif === 'dep-hors-region') lieu('magasin').region = '93';
  if (o.modif === 'point-hors-dep') lieu('magasin').lonlat = [3.877, 43.611];          // Montpellier, dans l'Hérault
  if (o.modif === 'deux-autres') lieu('entrepot').autres.pop();
  if (o.modif === 'trop-proches') lieu('buchelay').autres[0] = { ville: 'Mantes-la-Jolie', lonlat: [1.717, 48.990] };
  if (o.modif === 'flux-inconnu') L.flux = ['port', 'entrepot', 'nimes'];
  if (o.modif === 'flux-bonus') L.flux = ['port', 'labastide'];
  if (o.modif === 'type-inconnu') lieu('port').type = 'quai';
  if (o.modif === 'texte-vide') lieu('entrepot').role = ' ';
  if (o.modif === 'id-double') lieu('magasin').id = 'essai-carte';
  if (o.modif === 'outre-mer') { lieu('port').dep = '974'; }
  if (o.modif === 'sans-contours') L.contours = null;
  const poids = [3, 3, 3, 3, 4, 4];
  const etapes = etapesLocaliser(L, 'essai-localiser').map((j) => (j.bonus ? j : Object.assign(j, { poids: poids.shift(), groupe: 'La carte' })));
  const U = {
    ENTREPRISE: B.ENTREPRISE, VOCAB: B.VOCAB, CATALOGUE: B.CATALOGUE, SUPPLIERS: B.SUPPLIERS,
    SUP_BY_ID: B.SUP_BY_ID, CUSTOMERS: B.CUSTOMERS, CM: B.CM, baseDeDepart: B.baseDeDepart, THEME: B.THEME,
    etapes, exercice: 'Essai de la carte', localiser: L,
  };
  if (o.copie) U.copie = true;
  if (o.menu) U.menu = o.menu;
  if (o.question) {
    U.questions = { id: 'essai-localiser', personnes: { Samia: { nom: 'Samia Essai', role: 'cheffe d’équipe' } },
      liste: [{ id: 'pourquoi-ici', type: 'fil', de: 'Samia', quand: apresGeste(o.question), reflexion: true,
        enonce: 'Pourquoi un entrepôt à cet endroit ?', choix: [{ v: 'a', lib: 'Près des magasins' }, { v: 'b', lib: 'Au hasard' }],
        retour: 'Près des magasins qu’il livre.' }] };
  }
  if (o.fermeture) U.fermetures = { mail: { ouvertSi: localiserFini(o.fermeture), message: 'Après la carte.' } };
  const hote = document.createElement('div'); hote.id = 'lc-hote'; document.body.prepend(hote);
  let M;
  try { M = creerEntreprise(U); } catch (e) { return e.message; }
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__lc = { db, moteur: M, remontees: [] };
  M.rendre(hote, {
    meta: { id: 'essai-localiser', code: 'ESSAI', titre: 'Carte — essai', portee: 'eleve', immersif: true, niveauxPrevus: ['confirme'], ...(o.meta || {}) },
    profil: { prenom: 'Lea', nom: 'Dupont', role: o.role || 'eleve', uid: 'u-lea' }, aisance: o.aisance,
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: (r) => { window.__lc.remontees.push(JSON.parse(JSON.stringify(r))); },
    quitter: () => {}, codeStock: '',
  });
  const avis = hote.querySelector('.avis-err');
  if (avis) return avis.textContent;
  hote.querySelector('.ent-nav[data-vue="localiser"]').click();
  return null;
}, o);

const R = '#lc-hote [data-lc]';
const lire = () => pg.evaluate((R) => document.querySelector(R).__lc.lire(), R);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__lc.db)));
const etat = async () => ((((await base()).localiser || {})[SEANCE]) || {})['essai-carte'] || {};
const jalons = () => pg.evaluate(() => window.__lc.moteur.noter(window.__lc.db).detail);
// Immobile = l'animation finie et la viewBox stable pendant 5 images.
const immobile = () => pg.evaluate((R) => new Promise((ok) => {
  let y = null, n = 0;
  const f = () => {
    const r = document.querySelector(R), s = r && r.querySelector('[data-ct-svg]');
    const cle = (r && r.__lc && r.__lc.lire().anime ? 'anime' : '') + '|' + (s ? s.getAttribute('viewBox') : '');
    if (cle === y && !cle.startsWith('anime')) n++; else { n = 0; y = cle; }
    if (n >= 5) ok(); else requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}), R);
// Un point de l'élément `cle` qui est, à l'écran, bien sous lui (zones concaves, voisines) ; puis la souris y clique.
async function cliquer(cle) {
  await immobile();
  const el = await pg.$(`${R} [data-lc-cle="${cle}"]`);
  vrai(el, `aucun élément cliquable « ${cle} »`);
  await el.scrollIntoViewIfNeeded();
  const pt = await pg.evaluate(({ R, cle }) => {
    const el = document.querySelector(`${R} [data-lc-cle="${cle}"]`);
    const b = el.getBoundingClientRect();
    for (let n = 2; n <= 24; n *= 2) {
      for (let i = 1; i < n; i++) for (let j = 1; j < n; j++) {
        const x = b.left + (b.width * i) / n, y = b.top + (b.height * j) / n;
        const t = document.elementFromPoint(x, y);
        if (t && t.closest('[data-lc-cle]') === el) return { x, y };
      }
    }
    return null;
  }, { R, cle });
  vrai(pt, `aucun point de « ${cle} » n'est cliquable à l'écran`);
  await pg.mouse.click(pt.x, pt.y);
}
const juste = async () => { const l = await lire(); await cliquer(l.bon); await immobile(); };
// Une mauvaise réponse de l'étape en cours (une autre zone, un autre point).
async function faux() {
  await immobile();
  const l = await lire();
  const cle = await pg.evaluate(({ R, bon }) => [...document.querySelectorAll(`${R} [data-lc-cle]`)].map((e) => e.dataset.lcCle).find((c) => c !== bon), { R, bon: l.bon });
  await cliquer(cle);
  await pg.waitForTimeout(60);
}
const bouton = async (quoi) => { await immobile(); await pg.click(`${R} [data-lc-bouton="${quoi}"]`); await immobile(); };
// Un lieu entier, juste du premier coup, jusqu'au bouton « Lieu suivant » (ou « Voir le bilan »).
async function lieuJuste() { await juste(); await juste(); await juste(); }
async function toutJuste(n = 3) {
  for (let i = 0; i < n; i++) { await lieuJuste(); await bouton(i < n - 1 ? 'suivant' : 'bilan'); }
}
const message = () => pg.textContent(`${R} [data-lc-message]`);

await v('Localiser : le module des contours se charge sans réseau (13 régions, 96 départements) ; la vue s’ouvre au menu, sans erreur ; mention IGN / OSM', async () => {
  const c = await pg.evaluate(async () => {
    const { FRANCE } = await import('/contenus/france-contours.js');
    return { regions: FRANCE.regions.length, deps: FRANCE.deps.length, codes: new Set(FRANCE.deps.map((d) => d.code)).size,
      dansRegion: FRANCE.deps.every((d) => FRANCE.regions.some((r) => r.code === d.region)), attrib: FRANCE.attrib };
  });
  egal([c.regions, c.deps, c.codes, c.dansRegion], [13, 96, 96, true], 'contours');
  egal(await monter(), null, 'séance refusée');
  await pg.waitForSelector(`${R} [data-ct-svg]`);
  await immobile();
  vrai(await pg.isVisible('#lc-hote .ent-nav[data-vue="localiser"]'), 'entrée de menu absente');
  egal(await pg.textContent(`${R} [data-lc-credit]`), 'Contours : IGN Admin Express (Licence Ouverte). Positions : © contributeurs OpenStreetMap.', 'mention');
  egal(await pg.$$eval(`${R} [data-lc-cle]`, (L) => L.length), 13, 'treize régions cliquables');
  egal(await pg.textContent(`${R} [data-lc-compteur]`), 'Lieu 1 sur 3', 'compteur');
  egal(erreurs, [], 'erreurs de page');
  egal([...hotes], [], 'requêtes hors du site');
});

await v('Localiser : contrôles au chargement — la séance ne s’ouvre pas, le message nomme le lieu (département hors région, point hors département, 2 autres, points trop proches, flux inconnu…)', async () => {
  const cas = {
    'dep-hors-region': [/lieu « magasin ».*Gard \(30\) n’est pas dans la région « 93 »/],
    'point-hors-dep': [/lieu « magasin ».*« Nîmes » est hors du département Gard \(30\)/],
    'deux-autres': [/lieu « entrepot ».*exactement 3 « autres »/],
    'trop-proches': [/lieu « buchelay ».*« Buchelay » et « Mantes-la-Jolie » sont à [\d,]+ km/, 'proche'],
    'flux-inconnu': [/« flux » cite le lieu « nimes »/],
    'flux-bonus': [/« flux » cite le lieu bonus « labastide »/],
    'type-inconnu': [/lieu « port ».*type « quai » inconnu/],
    'texte-vide': [/lieu « entrepot ».*le texte « role » est vide/],
    'id-double': [/l’id « essai-carte » est déjà pris/],
    'outre-mer': [/lieu « port ».*« 974 » n’est pas dans les contours/],
    'sans-contours': [/« contours » est exigé/],
  };
  for (const [modif, [re, jeu]] of Object.entries(cas)) {
    const m = await monter({ modif, jeu });
    vrai(m && re.test(m), `${modif} : message attendu ${re}, reçu : ${m}`);
  }
  vrai(/ne se joue pas en évaluation/.test(await monter({ copie: true })), 'une évaluation (copie) doit être refusée');
  vrai(/lieu bonus du confirmé : le meta doit déclarer « niveauxPrevus/.test(await monter({ meta: { niveauxPrevus: [] } })), 'un lieu bonus sans niveauxPrevus doit être refusé');
  egal(await monter({ jeu: 'proche', meta: { niveauxPrevus: [] } }), null, 'sans lieu bonus, niveauxPrevus n’est pas exigé');
  vrai(/la carte « autre » n’existe pas/.test(await monter({ fermeture: 'autre' })), 'localiserFini sur une carte inconnue');
  egal(await monter({ fermeture: 'essai-carte' }), null, 'localiserFini sur la bonne carte');
  vrai(/geste inconnu « localiser:nimes:region »/.test(await monter({ question: 'localiser:nimes:region' })), 'un geste inconnu doit refuser la séance');
});

await v('Localiser : parcours juste (standard) — 3 lieux, 6 jalons ✓, bilan « 6 sur 6 », fin dessinée (trajet fléché), gestes publiés une fois, geste de fin', async () => {
  await monter();
  await immobile();
  const st = (await jalons());
  egal(Object.values(st).filter((x) => typeof x === 'string'), ['attente', 'attente', 'attente', 'attente', 'attente', 'attente'], 'jalons avant tout geste');
  await toutJuste(3);
  const d = await jalons();
  egal(['port', 'entrepot', 'magasin'].flatMap((l) => ['region', 'departement'].map((e) => d[`localiser:${l}:${e}`])), ['ok', 'ok', 'ok', 'ok', 'ok', 'ok'], 'jalons');
  egal(await pg.textContent(`${R} [data-lc-premier-coup]`), 'Du premier coup : 6 sur 6.', 'bilan');
  egal(await pg.$$eval(`${R} [data-lc-bilan] thead th`, (L) => L.map((x) => x.textContent)), ['Région', 'Département'], 'colonnes du bilan (pas de ville)');
  egal(await pg.$$eval(`${R} [data-lc-traits] .lc-fleche`, (L) => L.length), 2, 'deux flèches du trajet');
  egal((await lire()).encart, 'trajet', 'lieux éloignés : trajet sur la France entière');
  const G = (await base()).gestes[SEANCE];
  egal(Object.keys(G).sort(), ['localiser:entrepot:departement', 'localiser:entrepot:region', 'localiser:entrepot:ville', 'localiser:essai-carte:fin',
    'localiser:magasin:departement', 'localiser:magasin:region', 'localiser:magasin:ville', 'localiser:port:departement', 'localiser:port:region', 'localiser:port:ville'], 'gestes');
  vrai((await etat()).fini > 0, 'fini non rangé');
  const r = await pg.evaluate(() => window.__lc.remontees.at(-1));
  egal([r.score, r.max], [20, 20], 'note');
  egal(erreurs, [], 'erreurs de page');
});

const NOMS_REGIONS = await pg.evaluate(async () => (await import('/contenus/france-contours.js')).FRANCE.regions.map((r) => r.nom));

await v('Localiser : une erreur à la région du 1er lieu → jalon région ✗ (les autres ✓), trait rouge ≈ 0,7 s ; deux erreurs → la bonne zone entourée en pointillés terre, message sans nom de zone', async () => {
  await monter();
  await faux();
  egal(await message(), 'Ce n’est pas la bonne région. Essaie encore.', 'message de la 1re erreur');
  egal(await pg.$$eval(`${R} [data-lc-zones] .faux`, (L) => L.length), 1, 'la zone cliquée prend le trait rouge');
  vrai(!(await pg.$(`${R} [data-lc-zones] .aide`)), 'aide dès la 1re erreur');
  egal((await jalons())['localiser:port:region'], 'attente', 'jalon avant de trouver');
  await pg.waitForTimeout(800);
  egal(await pg.$$eval(`${R} [data-lc-zones] .faux`, (L) => L.length), 0, 'le trait rouge reste au-delà de 0,7 s');
  await faux();
  const m = await message();
  egal(m, 'Ce n’est pas la bonne région. Regarde la zone entourée.', 'message de la 2e erreur');
  egal(await pg.$$eval(`${R} [data-lc-zones] .aide`, (L) => L.map((e) => e.dataset.lcCle)), ['28'], 'zone entourée (la Normandie)');
  const st = await pg.$eval(`${R} [data-lc-zones] .aide`, (e) => ({ d: getComputedStyle(e).strokeDasharray, c: getComputedStyle(e).stroke,
    t: (() => { const x = document.createElement('i'); x.style.color = 'var(--terre)'; e.closest('[data-lc]').append(x); const c = getComputedStyle(x).color; x.remove(); return c; })() }));
  vrai(st.d && st.d !== 'none', 'la zone entourée n’est pas en pointillés');
  egal(st.c, st.t, 'pointillés terre');
  for (const n of NOMS_REGIONS) vrai(!m.includes(n), 'nom de région dans le message : ' + n);
  await juste(); await juste(); await juste();
  await bouton('suivant'); await lieuJuste(); await bouton('suivant'); await lieuJuste(); await bouton('bilan');
  const d = await jalons();
  egal(['port', 'entrepot', 'magasin'].flatMap((l) => ['region', 'departement'].map((e) => d[`localiser:${l}:${e}`])), ['ko', 'ok', 'ok', 'ok', 'ok', 'ok'], 'jalons');
  egal(await pg.textContent(`${R} [data-lc-premier-coup]`), 'Du premier coup : 5 sur 6.', 'bilan');
  vrai(await pg.$eval(`${R} [data-lc-bilan-case="port:region"]`, (e) => e.classList.contains('lc-ko') && e.textContent.startsWith('✗')), 'case ✗ du bilan');
  const x = (await etat()).lieux.port.region;
  egal([x.premier, x.essais, !!x.at], [false, 3, true], 'état de l’étape (premier essai faux, trois clics)');
  egal((await base()).indicateurs[SEANCE].localiser, { port: { region: 2 } }, 'repérage des erreurs');
});

await v('Localiser : la ville n’est pas notée — trois erreurs à la ville ne changent aucun jalon, l’aide apparaît quand même, la ville est absente du bilan et des jalons', async () => {
  await monter();
  await juste(); await juste();
  egal((await lire()).etape, 'ville', 'étape');
  const statuts = async () => Object.fromEntries(Object.entries(await jalons()).filter(([k]) => k.startsWith('localiser:')));
  const avant = await statuts();
  await faux(); await faux(); await faux();
  egal(await message(), 'Ce n’est pas la bonne ville. Regarde le point entouré.', 'message');
  const bon = (await lire()).bon;
  egal(await pg.$$eval(`${R} .lc-choix.aide`, (L) => L.map((e) => e.dataset.lcCle)), [bon], 'le bon point entouré');
  egal(await statuts(), avant, 'les jalons ont changé après des erreurs à la ville');
  await juste();
  await bouton('suivant'); await lieuJuste(); await bouton('suivant'); await lieuJuste(); await bouton('bilan');
  const d = await jalons();
  egal(Object.keys(d).filter((k) => k.startsWith('localiser:')).sort(), ['localiser:entrepot:departement', 'localiser:entrepot:region',
    'localiser:magasin:departement', 'localiser:magasin:region', 'localiser:port:departement', 'localiser:port:region'], 'jalons (aucun pour la ville)');
  vrai(Object.values(d).filter((x) => typeof x === 'string').every((x) => x === 'ok'), 'tous les jalons ✓');
  egal(await pg.textContent(`${R} [data-lc-premier-coup]`), 'Du premier coup : 6 sur 6.', 'bilan');
  egal((await base()).indicateurs[SEANCE].localiser, { port: { ville: 3 } }, 'repérage : les erreurs de ville comptées');
});

await v('Localiser : inaction — rien fait, tous les jalons « à faire », aucun geste, pas de bilan', async () => {
  await monter();
  await immobile();
  const d = await jalons();
  egal(Object.entries(d).filter(([k]) => k.startsWith('localiser:')).map(([, x]) => x), ['attente', 'attente', 'attente', 'attente', 'attente', 'attente'], 'jalons');
  vrai(!(await base()).gestes, 'un geste sans rien faire');
  vrai(!(await pg.$(`${R} [data-lc-bilan]`)), 'bilan sans rien faire');
});

await v('Localiser : reprise — rechargement au 2e lieu, étape département → même lieu, même étape, 1er lieu posé ; un premier essai faux reste faux', async () => {
  await monter();
  await lieuJuste(); await bouton('suivant');
  await faux(); await juste();
  egal([(await lire()).lieu, (await lire()).etape], ['entrepot', 'departement'], 'avant le rechargement');
  const db = await base();
  await monter({ db });
  await immobile();
  egal([(await lire()).lieu, (await lire()).etape], ['entrepot', 'departement'], 'après le rechargement');
  egal(await pg.textContent(`${R} [data-lc-compteur]`), 'Lieu 2 sur 3', 'compteur');
  vrai(await pg.$(`${R} [data-lc-place="port"]`), 'le 1er lieu n’est plus posé');
  egal((await lire()).vue, 'r:93', 'la carte n’est pas zoomée sur la région');
  await juste(); await juste();
  await bouton('suivant'); await lieuJuste(); await bouton('bilan');
  const d = await jalons();
  egal([d['localiser:entrepot:region'], d['localiser:entrepot:departement']], ['ko', 'ok'], 'le premier essai faux est resté faux');
});

await v('Localiser : niveaux — accompagné (noms et numéros, noms sur les points), standard (numéros, indice, repères), confirmé (aucun nom, pas d’indice, « sur 4 », bonus jugé sans le mot « bonus »)', async () => {
  // Accompagné
  await monter({ aisance: 'accompagne' });
  await juste();
  vrai((await pg.$$eval(`${R} [data-lc-etiq] text`, (L) => L.map((t) => t.textContent))).includes('Seine-Maritime (76)'), 'accompagné : nom et numéro des départements');
  egal(await pg.getAttribute(`${R} [data-lc-cle="76"]`, 'aria-label'), 'Seine-Maritime (76)', 'accompagné : nom lu');
  await juste();
  egal((await pg.$$eval(`${R} [data-lc-etiq] text`, (L) => L.map((t) => t.textContent))).sort(), ['Dieppe', 'Fécamp', 'Gonfreville-l’Orcher', 'Rouen'], 'accompagné : noms sur les 4 points');
  vrai(!(await pg.$(`${R} .lc-repere`)) && !(await pg.$(`${R} [data-lc-indice]`)), 'accompagné : ni repère ni indice');
  vrai((await pg.textContent(`${R} [data-lc-ville]`)).includes('Seine-Maritime (76)'), 'accompagné : département dans la fiche');
  // Standard
  await monter();
  await juste();
  egal((await pg.$$eval(`${R} [data-lc-etiq] text`, (L) => L.map((t) => t.textContent))).sort(), ['14', '27', '50', '61', '76'], 'standard : numéros seuls');
  egal(await pg.getAttribute(`${R} [data-lc-cle="76"]`, 'aria-label'), 'Département 76', 'standard : numéro lu, pas le nom');
  await juste();
  vrai(/^Indice : Juste à l’est du Havre/.test(await pg.textContent(`${R} [data-lc-indice]`)), 'standard : indice');
  egal(await pg.$$eval(`${R} .lc-repere`, (L) => L.length), 1, 'standard : repère');
  egal(await pg.$$eval(`${R} [data-lc-etiq] text`, (L) => L.map((t) => t.textContent)), ['Le Havre'], 'standard : aucun nom sur les points (le repère seul)');
  egal(await pg.$$eval(`${R} .lc-choix`, (L) => L.map((e) => e.getAttribute('aria-label')).sort()), ['Point 1', 'Point 2', 'Point 3', 'Point 4'], 'standard : points lus sans nom');
  // Standard : le lieu bonus est absent, ses jalons rendent null
  const nuls = await pg.evaluate(async () => {
    const { etapesLocaliser } = await import('/core/types/localiser.js');
    const E = await import('/contenus/localiser-essai.js');
    return etapesLocaliser(E.LOCALISER_ACTION, 'essai-localiser').filter((j) => j.bonus).map((j) => j.verifier(window.__lc.db));
  });
  egal(nuls, [null, null], 'standard : jalons bonus');
  egal(await pg.textContent(`${R} [data-lc-compteur]`), 'Lieu 1 sur 3', 'standard : compteur');
  // Confirmé
  await monter({ aisance: 'confirme' });
  await immobile();
  egal(await pg.$$eval(`${R} [data-lc-etiq] text`, (L) => L.length), 0, 'confirmé : aucun nom de région');
  egal(await pg.getAttribute(`${R} [data-lc-cle="28"]`, 'aria-label'), 'Région 4', 'confirmé : région lue sans nom');
  egal(await pg.textContent(`${R} [data-lc-ville]`), 'Gonfreville-l’Orcher', 'confirmé : la ville seule dans la fiche');
  egal(await pg.textContent(`${R} [data-lc-compteur]`), 'Lieu 1 sur 4', 'confirmé : compteur avec le lieu bonus');
  await juste();
  egal(await pg.$$eval(`${R} [data-lc-etiq] text`, (L) => L.length), 0, 'confirmé : aucun numéro de département');
  await juste();
  vrai(!(await pg.$(`${R} [data-lc-indice]`)), 'confirmé : pas d’indice');
  egal(await pg.$$eval(`${R} .lc-repere`, (L) => L.length), 1, 'confirmé : repère');
  await juste();
  for (let i = 1; i < 4; i++) { await bouton('suivant'); await lieuJuste(); }
  await bouton('bilan');
  egal(await pg.textContent(`${R} [data-lc-premier-coup]`), 'Du premier coup : 8 sur 8.', 'confirmé : bilan sur 4 lieux');
  const d = await jalons();
  egal(d.bonus && [d.bonus.justes, d.bonus.total], [2, 2], 'confirmé : jalons bonus jugés');
  vrai(!/bonus/i.test(await pg.textContent('#lc-hote')), 'le mot « bonus » apparaît côté élève');
  vrai(!/bonus/i.test(await pg.evaluate(() => [...document.querySelectorAll('#lc-hote [aria-label]')].map((e) => e.getAttribute('aria-label')).join(' '))), '« bonus » dans un texte lu');
  // Le réseau : Labastide, posée comme lieu, n'est pas dessinée deux fois.
  egal(await pg.$$eval(`${R} .lc-reseau`, (L) => L.length), 4, 'confirmé : réseau sans Labastide');
});

await v('Localiser : gestes et questions au fil — chaque geste publié une fois, à la fin de son étape ; une question sur localiser:entrepot:departement arrive après le zoom ; la carte est gelée (souris et clavier) jusqu’à la réponse', async () => {
  await monter({ question: 'localiser:entrepot:departement' });
  await lieuJuste(); await bouton('suivant');
  await juste();
  let G = (await base()).gestes[SEANCE];
  vrai(G['localiser:entrepot:region'] && !G['localiser:entrepot:departement'], 'gestes après la région du 2e lieu');
  const t1 = G['localiser:port:region'];
  // Le bon département : le geste (et la question) attendent la fin de l'animation.
  await cliquer((await lire()).bon);
  await pg.waitForTimeout(150);
  vrai(!(await base()).gestes[SEANCE]['localiser:entrepot:departement'], 'geste publié avant la fin du zoom');
  vrai(!(await pg.$('#lc-hote [data-q-panneau]')), 'question arrivée avant le zoom');
  await immobile();
  await pg.waitForSelector('#lc-hote [data-q-panneau]');
  egal((await lire()).etape, 'ville', 'la question arrive à l’étape ville, carte zoomée');
  // Gelée : un clic de souris sur un point, puis Entrée au clavier, ne font rien.
  const bon = (await lire()).bon;
  const b = await (await pg.$(`${R} [data-lc-cle="${bon}"]`)).boundingBox();
  await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await pg.evaluate(({ R, bon }) => document.querySelector(`${R} [data-lc-cle="${bon}"]`).focus(), { R, bon });
  await pg.keyboard.press('Enter');
  await pg.waitForTimeout(700);
  vrai(!(((await etat()).lieux.entrepot || {}).ville), 'la carte n’est pas gelée pendant la question');
  egal((await lire()).etape, 'ville', 'étape pendant le gel');
  await pg.click('#lc-hote [data-q-choix="a"][data-q="pourquoi-ici"]');
  await pg.click('#lc-hote [data-q-repondre="pourquoi-ici"]');
  await pg.click('#lc-hote [data-q-reprendre]');
  await juste();
  G = (await base()).gestes[SEANCE];
  vrai(G['localiser:entrepot:ville'], 'le jeu ne reprend pas après la réponse');
  egal(G['localiser:port:region'], t1, 'un geste republié');
  egal(erreurs, [], 'erreurs de page');
});

await v('Localiser : couleurs — un seul aplat vert (la zone trouvée), aucun aplat rouge ; magasin bleu, entrepôt terre, port encre ; la légende reprend les mêmes', async () => {
  await monter();
  const fonds = () => pg.evaluate((R) => {
    const r = document.querySelector(R);
    const val = (v) => { const x = document.createElement('i'); x.style.color = `var(${v})`; r.append(x); const c = getComputedStyle(x).color; x.remove(); return c; };
    const V = [val('--vert-pale'), val('--vert'), val('--vert-fond')];
    return [...r.querySelectorAll('svg *')].filter((e) => V.includes(getComputedStyle(e).fill)).map((e) => e.dataset.lcCle || e.tagName);
  }, R);
  await faux();
  await pg.waitForTimeout(200);
  egal(await fonds(), [], 'aplat vert après un clic faux (la zone fausse a son trait rouge)');
  await immobile();
  const bon = (await lire()).bon;
  await cliquer(bon);
  await pg.waitForTimeout(260);          // la zone passe en « juste » (transition de 0,15 s), avant le zoom (0,5 s)
  const c = await pg.evaluate((R) => {
    const r = document.querySelector(R);
    const val = (v) => { const x = document.createElement('i'); x.style.color = `var(${v})`; r.append(x); const c = getComputedStyle(x).color; x.remove(); return c; };
    const V = { vert: val('--vert-pale'), vertPlein: val('--vert'), vertFond: val('--vert-fond'), rouge: val('--rouge') };
    const fonds = [...r.querySelectorAll('svg *')].map((e) => [e, getComputedStyle(e).fill]);
    return { V, verts: fonds.filter(([, f]) => [V.vert, V.vertPlein, V.vertFond].includes(f)).map(([e]) => e.dataset.lcCle || e.tagName),
      rouges: fonds.filter(([, f]) => f === V.rouge).length,
      panneau: [...r.querySelectorAll('[data-lc-panneau] *')].filter((e) => [V.vertPlein, V.vertFond, V.rouge].includes(getComputedStyle(e).backgroundColor)).length };
  }, R);
  egal(c.verts, [bon], 'aplats verts');
  egal(c.rouges, 0, 'aplats rouges');
  egal(c.panneau, 0, 'aplat vert ou rouge dans le panneau');
  await immobile();
  await juste(); await juste();
  await bouton('suivant'); await lieuJuste(); await bouton('suivant'); await lieuJuste(); await bouton('bilan');
  const p = await pg.evaluate((R) => {
    const r = document.querySelector(R);
    const val = (v) => { const x = document.createElement('i'); x.style.color = `var(${v})`; r.append(x); const c = getComputedStyle(x).color; x.remove(); return c; };
    const f = (id) => getComputedStyle(r.querySelector(`[data-lc-place="${id}"]`)).fill;
    const leg = Object.fromEntries([...r.querySelectorAll('[data-lc-legende] li')].filter((li) => li.querySelector('.lc-rond:not(.lc-creux)'))
      .map((li) => [li.textContent.trim(), getComputedStyle(li.querySelector('.lc-rond')).backgroundColor]));
    return { magasin: f('magasin'), entrepot: f('entrepot'), port: f('port'), bleu: val('--lc-bleu'), terre: val('--terre'), encre: val('--encre'), leg };
  }, R);
  egal([p.magasin, p.entrepot, p.port], [p.bleu, p.terre, p.encre], 'couleurs des lieux posés');
  egal(p.leg, { magasin: p.bleu, entrepôt: p.terre, port: p.encre }, 'légende');
  vrai(p.bleu !== p.terre && p.bleu !== p.encre, 'le bleu du client se confond');
});

await v('Localiser : clavier — Tab atteint les zones de l’étape, Entrée et Espace choisissent, le focus reste sur la carte au changement d’étape', async () => {
  await monter();
  await immobile();
  await pg.focus('#lc-hote .ent-nav[data-vue="localiser"]');
  let n = 0;
  while (n++ < 80 && !(await pg.evaluate(() => !!(document.activeElement && document.activeElement.dataset && document.activeElement.dataset.lcCle)))) await pg.keyboard.press('Tab');
  vrai(n < 80, 'Tab n’atteint aucune zone');
  // Jusqu'à la Normandie (28), puis Entrée.
  n = 0;
  while (n++ < 20 && (await pg.evaluate(() => document.activeElement.dataset.lcCle)) !== '28') await pg.keyboard.press('Tab');
  await pg.keyboard.press('Enter');
  await pg.waitForTimeout(100);
  await immobile();
  egal((await lire()).etape, 'departement', 'Entrée n’a pas choisi la région');
  const f = await pg.evaluate(() => ({ cle: document.activeElement.dataset.lcCle, carte: !!document.activeElement.closest('[data-lc-zones]') }));
  vrai(f.carte && ['14', '27', '50', '61', '76'].includes(f.cle), 'le focus n’est pas sur un département : ' + JSON.stringify(f));
  n = 0;
  while (n++ < 10 && (await pg.evaluate(() => document.activeElement.dataset.lcCle)) !== '76') await pg.keyboard.press('Tab');
  await pg.keyboard.press(' ');
  await pg.waitForTimeout(100);
  await immobile();
  egal((await lire()).etape, 'ville', 'Espace n’a pas choisi le département');
  vrai(/^p[1-4]$/.test(await pg.evaluate(() => document.activeElement.dataset.lcCle || '')), 'le focus n’est pas sur un des 4 points');
  egal((await jalons())['localiser:port:region'], 'ok', 'jalon au clavier');
});

for (const [w, h] of [[1366, 768], [1280, 720]]) {
  await v(`Localiser : écran ${w} × ${h} — ni la page ni le panneau ne défilent, la carte et la légende sont à l’écran ; un lieu à la souris`, async () => {
    await pg.setViewportSize({ width: w, height: h });
    await monter({ menu: [] });
    // La page de l'application reste sous la séance d'essai : on ne garde que la séance, comme dans le site.
    await pg.evaluate(() => { document.querySelectorAll('body > *').forEach((e) => { if (e.id !== 'lc-hote') e.style.display = 'none'; }); });
    await immobile();
    const m = await pg.evaluate((R) => {
      const r = document.querySelector(R), b = (s) => r.querySelector(s).getBoundingClientRect();
      const p = r.querySelector('[data-lc-panneau]');
      return { page: document.scrollingElement.scrollHeight - innerHeight, large: document.scrollingElement.scrollWidth - innerWidth,
        carte: b('[data-ct-cadre]').bottom, legende: b('[data-lc-legende]').bottom, credit: b('[data-lc-credit]').bottom,
        panneau: p.scrollHeight - p.clientHeight, haut: b('[data-ct-cadre]').height };
    }, R);
    vrai(m.page <= 0 && m.large <= 0, `la page défile : ${JSON.stringify(m)}`);
    vrai(m.credit <= h && m.legende <= h && m.carte <= h, `la carte ou la légende sort de l’écran : ${JSON.stringify(m)}`);
    vrai(m.panneau <= 0, `le panneau défile : ${JSON.stringify(m)}`);
    vrai(m.haut > 380, `la carte est trop petite : ${JSON.stringify(m)}`);
    await lieuJuste();
    egal((await lire()).etape, 'vu', 'un lieu à la souris');
    await pg.setViewportSize({ width: 1366, height: 768 });
    await pg.evaluate(() => { document.querySelectorAll('body > *').forEach((e) => { e.style.display = ''; }); });
  });
}

await v('Localiser : enseignant — clique librement sans rien écrire, choisit le lieu et le niveau', async () => {
  await monter({ role: 'prof' });
  await immobile();
  const avant = JSON.stringify(await base());
  vrai(await pg.$(`${R} [data-lc-prof]`), 'barre de l’enseignant absente');
  await faux(); await juste(); await juste(); await juste();
  egal((await lire()).etape, 'vu', 'l’enseignant ne joue pas');
  egal(JSON.stringify(await base()), avant, 'la base a changé');
  await pg.selectOption(`${R} [data-lc-prof-lieu]`, 'magasin');
  await immobile();
  egal([(await lire()).lieu, (await lire()).etape], ['magasin', 'region'], 'aller à un lieu');
  await pg.selectOption(`${R} [data-lc-prof-niveau]`, 'confirme');
  await immobile();
  egal(await pg.textContent(`${R} [data-lc-compteur]`), 'Lieu 1 sur 4', 'niveau confirmé (lieu bonus)');
  egal(JSON.stringify(await base()), avant, 'la base a changé');
});

await v('Localiser (lot 3) : la fin — lieux proches → encart zoomé (règle du quart), lieux éloignés → trajet fléché ; réseau en ronds creux, légende, texte de fin ; localiserFini', async () => {
  await monter({ jeu: 'proche' });
  await toutJuste(3);
  egal((await lire()).encart, 'encart', 'France Boissons : encart');
  vrai(await pg.isVisible(`${R} [data-lc-encart]`), 'encart caché');
  egal(await pg.$$eval(`${R} [data-lc-encart] .lc-place`, (L) => L.length), 3, 'les trois lieux dans l’encart');
  egal(await pg.$$eval(`${R} [data-lc-encart] text`, (L) => L.map((t) => t.textContent).sort()), ['Buchelay', 'Deauville', 'Houlgate'], 'noms dans l’encart');
  vrai(await pg.$(`${R} .lc-cadre-encart`), 'cadre de l’encart sur la carte');
  egal(await pg.$$eval(`${R} [data-lc-traits] .lc-fleche`, (L) => L.length), 0, 'pas de trajet sur la France entière');
  egal(await pg.$$eval(`${R} .lc-reseau`, (L) => L.length), 0, 'pas de réseau déclaré');
  vrai((await pg.textContent(`${R} [data-lc-fin]`)).includes('La tournée des boissons'), 'texte de fin');
  vrai((await pg.textContent(`${R} [data-lc-legende]`)).includes('trajet de la marchandise'), 'légende du trajet');
  egal(await pg.evaluate(async () => (await import('/core/declencheurs.js')).localiserFini('essai-proche')(window.__lc.db, 'essai-localiser')), true, 'localiserFini');
  // Éloignés (Action, standard) : trajet fléché, noms, cinq autres entrepôts en ronds creux.
  await monter();
  egal(await pg.evaluate(async () => (await import('/core/declencheurs.js')).localiserFini('essai-carte')(window.__lc.db, 'essai-localiser')), false, 'localiserFini avant la fin');
  await toutJuste(3);
  vrai(await pg.isHidden(`${R} [data-lc-encart]`), 'encart sur des lieux éloignés');
  egal(await pg.$$eval(`${R} [data-lc-traits] .lc-fleche`, (L) => L.filter((f) => f.style.display !== 'none').length), 2, 'deux flèches');
  egal(await pg.$$eval(`${R} [data-lc-etiq] text`, (L) => L.map((t) => t.textContent).sort()), ['Ensuès-la-Redonne', 'Gonfreville-l’Orcher', 'Nîmes'], 'noms');
  egal(await pg.$$eval(`${R} .lc-reseau`, (L) => L.length), 5, 'autres entrepôts');
  vrai((await pg.textContent(`${R} [data-lc-legende]`)).includes('autres entrepôts Action'), 'légende du réseau');
  vrai((await pg.textContent(`${R} [data-lc-fin]`)).includes('imaginé pour l’exercice'), 'texte de fin (construit dit)');
  egal(await pg.evaluate(async () => (await import('/core/declencheurs.js')).localiserFini('essai-carte')(window.__lc.db, 'essai-localiser')), true, 'localiserFini après la fin');
  egal(erreurs, [], 'erreurs de page');
  egal([...hotes], [], 'requêtes hors du site');
});

await ctxL.close();
}
