// Suite de tests de Prepalog — bloc « action-83 » : Action ENT-8.3, un autre site, un autre prestataire (CAP OL, entraînement CAP-C1.1).
// `node outils/test.mjs action-83` ne lance que ce bloc. Brief : `docs/briefs/ENT-8.3-action-autre-site.md` §8 ; décisions du chef de
// chantier : `docs/briefs/COORDINATION-action.md` §6.2.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/action-autre-site.js` → `rendre`),
// de vrais clics à la SOURIS (centre de `boundingBox()`, après `scrollIntoViewIfNeeded()`) ; les listes des fiches par `selectOption`.
// Les GRAINES sont choisies ici (l’identifiant de l’élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le
// tirage le 16/10/2026), jamais recalculées par le code de la séance :
//
//   a83-juste (standard) : entrepôts, dans l’ordre des lignes : Labastide (GXO), Verrières-en-Anjou (Kuehne+Nagel), Ensuès (Geodis) ;
//     acteurs : Romain (te guide), un fournisseur (fabrique) ; chaîne : case 2 fausse (« Un avion ») → « Un porte-conteneurs le transporte »
//     (clé w), case 3 fausse (« Le port de Marseille ») → « Le port du Havre le reçoit » (clé k) ; situations : s-lourd (moyen, « ecrase »),
//     s-ordre (difficile, « retard »), s-etiquette (facile, « nimes »). Confirmé (même graine) : même socle + s-emplacement (« introuvable »).
//   a83-faux (standard) : Onnaing, Labastide, Belleville ; le lycée, le magasin de Roques ; cases 2 (e-avion) et 1 (e-labastide) ;
//     s-lourd, s-cartons, s-ordre.
//   a83-acc : Onnaing, Labastide, Belleville ; Roques, un fournisseur ; cases 5 (e-nimes) et 1 ; s-lourd, s-ordre, s-cartons.
//
// Barème (brief §5, poids validés par Tristan le 15/10/2026) : La carte de France 4,5 (0,75 × 6) · Qui est qui ? 4 (3 × 0,75 + 2 × 0,875) ·
// La chaîne de Romain 4 (1 × 4) · Ce que je change 3,5 (facile 1, moyenne 1,25, difficile 1,25) · Les questions de Romain 4 (L 1,5 · N 1 · P 1,5).
// Ce qui vaut son prix : le parcours juste, le pire cas (aucun élève bloqué, ENT-8.4 ouverte), l’inaction à 0, un écran par étape (sans
// passer par la Messagerie), la chaîne jugée sans ordre, le tirage équitable (deux exploitants, jamais e-nimes avec s-etiquette), le
// confirmé caché, l’écran de 1366 × 768.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'action-autre-site';
const ctx83 = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctx83.newPage();
pg.setDefaultTimeout(8000);
const erreurs = [];
const hotes = new Set();
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
pg.on('dialog', (d) => d.accept());
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });
await pg.emulateMedia({ reducedMotion: 'reduce' });

const Z = '#fTest';
const CAPTURES = process.env.CAPTURES_ENT83 || '';
const pause = (ms = 80) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
const note = () => pg.evaluate(() => { const L = window.__f.enregistres; return L.length ? L[L.length - 1] : null; });
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
const bandeau = () => pg.$$eval(`${Z} [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finJalon, x.dataset.finEtat]));
const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
const menu = () => pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => (b.dataset.vue ? b.dataset.vue : `fermee:${b.dataset.vueFermee}`)));
const barre = () => pg.$eval(`${Z} [data-suite-seance]`, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };
const capture = async (nom) => { if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/${nom}.png` }); };
const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

// Un clic à la SOURIS au centre de l'élément (après l'avoir fait venir à l'écran).
async function clic(sel) {
  const el = await pg.waitForSelector(`${Z} ${sel}`, { state: 'visible' });
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  vrai(b && b.width > 0 && b.height > 0, `« ${sel} » n’a pas de place à l’écran`);
  await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}
const aller = async (vue) => { await clic(`.ent-nav[data-vue="${vue}"]`); await pause(); };
const suivante = async () => { await clic('[data-suite-aller]'); await pause(); };
// Va à un écran : par le menu s'il y est, sinon par la barre « Étape suivante » (le menu se redessine en retard après la carte).
const allerEcran = async (vue) => { if (await present(`.ent-nav[data-vue="${vue}"]`)) await aller(vue); else { egal((await pg.$eval(`${Z} [data-suite]`, (e) => e.dataset.suite)), vue, 'la barre ne mène pas à ' + vue); await suivante(); } };

// Les réponses de la banque d'ouverture (toutes justes / toutes fausses) : l'écran « Avant de commencer » est passé.
const OUV_JUSTES = { prestataire: 'prestataire', tuteur: 'entreprise', ouverture: 'remplir', 'etiquette-palette': 'magasin', nouveautes: 'nouveaux',
  'code-postal': 'debut', 'client-prestataire': 'client', 'img-quai-numero': 'quai', 'img-rassemblement': 'rassemblement', 'img-palette-filmee': 'tenir' };
const OUV_FAUSSES = { prestataire: 'client', tuteur: 'prof', ouverture: 'attendre', 'etiquette-palette': 'prix', nouveautes: 'rien',
  'code-postal': 'fin', 'client-prestataire': 'salarie', 'img-quai-numero': 'compter', 'img-rassemblement': 'sortie', 'img-palette-filmee': 'peser' };

// Monte la séance comme le site. `o.db` : base de départ (copiée) ; `o.uid` (la graine) ; `o.aisance` ; `o.rep` : réponses d'ouverture
// (défaut : toutes justes) ; `o.sansOuverture` : rien de répondu.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-autre-site.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['action-autre-site'] = db.questions['action-autre-site'] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: o.uid || 'a83-juste' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { rep: OUV_JUSTES, ...o });

// Les questions au fil : répond au panneau ouvert (réponse de `Q_REP`, sinon la juste), puis « Reprendre », tant qu'il y en a une.
const Q_JUSTES = { 'changer-prestataire': 'changer', 'comme-geodis': 'metier', 'deux-planchers': 'plus' };
let Q_REP = Q_JUSTES;
// Les cartes « Nouveau message » restent en haut à droite tant qu'on ne les lit pas, PAR-DESSUS le panneau des questions (limite du
// moteur, dite au compte rendu) : l'élève les ferme (×) pour lire la question ; le test fait de même.
async function fermerCartes() {
  for (let k = 0; k < 5; k++) { const x = await pg.$(`${Z} [data-carte-fermer]`); if (!x) return; await x.click(); await pause(30); }
}
async function qFil() {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await fermerCartes();
    await clic(`[data-q-choix="${Q_REP[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    await clic('[data-q-reprendre]');
    await pause();
  }
}

// ── la carte (vue « Localiser ») : aides reprises du bloc `action-81`.
const R = `${Z} [data-lc]`;
const lire = () => pg.evaluate((R) => document.querySelector(R).__lc.lire(), R);
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
async function cliquerCarte(cle) {
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
const carteJuste = async () => { const l = await lire(); await cliquerCarte(l.bon); await immobile(); };
async function carteFaux() {
  await immobile();
  const l = await lire();
  const cle = await pg.evaluate(({ R, bon }) => [...document.querySelectorAll(`${R} [data-lc-cle]`)].map((e) => e.dataset.lcCle).find((c) => c !== bon), { R, bon: l.bon });
  await cliquerCarte(cle);
  await pg.waitForTimeout(60);
}
const boutonCarte = async (quoi) => { await immobile(); await clic(`[data-lc] [data-lc-bouton="${quoi}"]`); await immobile(); };
// Toute la carte. `fautes` : { 'magasin:departement': 1, … } = le nombre de mauvais clics avant le bon à cette étape.
async function jouerCarte(fautes = {}, { avant } = {}) {
  await aller('localiser');
  for (let k = 0; k < 6; k++) {
    const l = await lire();
    if (l.etape === 'fin') break;
    for (const et of ['region', 'departement', 'ville']) {
      const x = await lire();
      if (avant) await avant(x);
      for (let f = 0; f < (fautes[`${x.lieu}:${et}`] || 0); f++) await carteFaux();
      await carteJuste();
      await qFil();
    }
    const n = await pg.$eval(`${R} [data-lc-bouton]`, (b) => b.dataset.lcBouton);
    await boutonCarte(n);
    await qFil();
    if (n === 'bilan') break;
  }
}
const TOUT_FAUX_CARTE = Object.fromEntries(['entrepot', 'magasin', 'port', 'onnaing'].flatMap((l) => [[`${l}:region`, 1], [`${l}:departement`, 1]]));

// Envoie la fiche ouverte (confirmation dans la page).
async function envoyer() { await clic('[data-fiche-envoyer]'); await clic('[data-confirme-oui]'); await pause(); }
// ── « Qui est qui ? » (vue `fiche`, la première fiche) : `ent` = l'exploitant de chaque ligne, `act` = le rôle de chaque acteur.
async function envoyerQui({ ent, act }) {
  await allerEcran('fiche');
  for (let i = 0; i < ent.length; i++) await pg.selectOption(`${Z} [data-fiche-champ="entrepot-${i + 1}"]`, ent[i]);
  for (let i = 0; i < act.length; i++) await pg.selectOption(`${Z} [data-fiche-champ="acteur-${i + 1}"]`, act[i]);
  await envoyer();
  await qFil();                        // L
}
// ── « La chaîne de Romain » : `l` = [[case, étiquette], [case, étiquette]].
async function envoyerChaine(l) {
  await allerEcran('fiche:chaine');
  for (let i = 0; i < 2; i++) {
    await pg.selectOption(`${Z} [data-fiche-champ="case-${i + 1}"]`, l[i][0]);
    await pg.selectOption(`${Z} [data-fiche-champ="etiquette-${i + 1}"]`, l[i][1]);
  }
  await envoyer();
  await qFil();                        // N
}
// ── « Ce que je change » : `vals` = la clé choisie à chaque ligne. P arrive au choix de la 1re ligne.
async function envoyerChange(vals) {
  await allerEcran('fiche:change');
  for (let i = 0; i < vals.length; i++) { await pg.selectOption(`${Z} [data-fiche-champ="situation-${i + 1}"]`, vals[i]); await pause(30); await qFil(); }
  await envoyer();
  await qFil();
}

// Les réponses justes de a83-juste (écrites à la main, voir l'en-tête).
const JUSTE = { qui: { ent: ['gxo', 'kn', 'geodis'], act: ['guide', 'fabrique'] }, chaine: [['2', 'w'], ['3', 'k']], change: ['ecrase', 'retard', 'nimes'] };
// Le parcours entier. `o` : { carte (fautes), qui, chaine, change, q (réponses des questions au fil) }.
async function jouer(o = {}) {
  Q_REP = { ...Q_JUSTES, ...(o.q || {}) };
  await jouerCarte(o.carte || {});
  await envoyerQui(o.qui || JUSTE.qui);
  await envoyerChaine(o.chaine || JUSTE.chaine);
  await envoyerChange(o.change || JUSTE.change);
  await qFil();
}

const LIGNES = ['localiser:entrepot:region', 'qui-entrepot-labastide', 'chaine-trouvee-1', 'change-facile', 'question:changer-prestataire'];
const tout = (etat) => LIGNES.map((l) => [l, etat]);

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.3 : la séance se charge (CAP, CAP-C1.1, entraînement, correction, parcours après ENT-8.2, niveaux prévus confirmé + accompagné) ; somme des poids 16 + part 4 = 20 ; ENT-8.4 la suit', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-autre-site.js');
    const S = await import('/contenus/action-ent83.js');
    const Q = await import('/contenus/questions/ENT-8.3.js');
    const B = await import('/activites/action-avant-noel.js').then((m) => m.meta).catch((e) => ({ erreur: String(e) }));
    const socle = S.ETAPES.filter((e) => !e.bonus);
    const parGroupe = {};
    socle.forEach((e) => { parGroupe[e.groupe] = (parGroupe[e.groupe] || 0) + e.poids; });
    return { meta: A.meta, n: socle.length, bonus: S.ETAPES.filter((e) => e.bonus).map((e) => e.id),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids]),
      parGroupe, poids: Object.fromEntries(socle.map((e) => [e.id, e.poids])), suite: B.precedente || B.erreur };
  });
  egal([r.meta.code, r.meta.niveaux, r.meta.competences, r.meta.competencesCap, r.meta.temps, r.meta.bareme, r.meta.correction, r.meta.bilanDetail,
    r.meta.parcours, r.meta.precedente, r.meta.niveauxPrevus, r.meta.questions, r.meta.pret, r.meta.ouverture],
  ['ENT-8.3', ['cap'], [], ['CAP-C1.1'], 'entrainement', 20, true, true, true, 'action-prise-de-poste', ['confirme', 'accompagne'], 'ENT-8.3', true, 'prof'], 'meta');
  proche(Object.values(r.poids).reduce((a, b) => a + b, 0), 16, 'somme des poids des jalons');
  // Jalon par jalon (brief §5, écrit à la main) : un poids échangé entre deux cases d'un même bloc se voit ici.
  egal(r.poids, { 'localiser:entrepot:region': 0.75, 'localiser:entrepot:departement': 0.75, 'localiser:magasin:region': 0.75,
    'localiser:magasin:departement': 0.75, 'localiser:port:region': 0.75, 'localiser:port:departement': 0.75,
    'qui-entrepot-labastide': 0.75, 'qui-entrepot-tire-1': 0.75, 'qui-entrepot-tire-2': 0.75, 'qui-acteur-1': 0.875, 'qui-acteur-2': 0.875,
    'chaine-trouvee-1': 1, 'chaine-trouvee-2': 1, 'chaine-corrigee-1': 1, 'chaine-corrigee-2': 1,
    'change-facile': 1, 'change-moyen': 1.25, 'change-difficile': 1.25 }, 'poids jalon par jalon');
  egal([r.n, r.part, r.notees], [18, 4, [['changer-prestataire', 1.5], ['comme-geodis', 1], ['deux-planchers', 1.5]]], 'jalons, part, questions notées');
  egal(r.parGroupe, { 'La carte de France': 4.5, 'Qui est qui ?': 4, 'La chaîne de Romain': 4, 'Ce que je change': 3.5 }, 'poids par bloc');
  egal(r.bonus, ['localiser:onnaing:region', 'localiser:onnaing:departement', 'change-bonus'], 'cas bonus');
  egal(r.suite, ID, 'ENT-8.4 suit ENT-8.3');
});

await v('ENT-8.3 : à l’ouverture, le tirage est rangé ; seul le message de Romain (daté du 7 décembre) ; la carte ouverte, « Qui est qui ? » absente, les deux autres fiches grisées avec leur raison ; la barre mène à la carte ; rien ne compte les pièces', async () => {
  const db = await monter({ uid: 'a83-juste' });
  egal(db.tirages[ID].graine, `a83-juste|${ID}`, 'graine');
  egal(db.tirages[ID].pieces, { entrepots: ['labastide', 'verrieres', 'ensues'], acteurs: ['romain', 'fournisseur'], erreurs: ['e-avion'],
    erreursMd: ['e-marseille'], situations: ['s-lourd', 's-ordre', 's-etiquette'] }, 'pièces');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.ouvreFiche]), [['Romain', 'Bienvenue chez GXO', undefined]], 'messages à l’ouverture');
  vrai(new Date(E[0].ts).getMonth() === 11 && new Date(E[0].ts).getDate() === 7, 'le message n’est pas daté du 7 décembre');
  vrai(!/20\d\d/.test(E[0].text), 'une année dans le message');
  const M = await menu();
  vrai(M.includes('localiser') && !M.some((x) => /^(fermee:)?fiche$/.test(x)) && M.includes('fermee:fiche:chaine') && M.includes('fermee:fiche:change'), 'menu au départ : ' + M.join(', '));
  egal(await barre(), 'Étape suivante : Carte de France Y aller →', 'barre au départ');
  vrai(/GXO de Labastide-Saint-Pierre/.test(await texte()), 'le bandeau ne dit pas GXO Labastide');
  vrai(!/\b(2|deux|3|trois|4|quatre|5|cinq) (entrepôts|acteurs|lieux|situations|lignes)\b/i.test(await texte()), 'une consigne compte les pièces');
});

await v('ENT-8.3 : inaction — rien fait → 0/20, rien de jugé « juste », pas de bandeau de fin', async () => {
  await monter({ uid: 'a83-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
});

await v('ENT-8.3 : un écran par étape — après la carte, la barre mène à « Qui est qui ? » (document à gauche) ; après l’envoi, « La chaîne de Romain » est ouverte sans passer par la Messagerie, la barre y mène, le dessin des 6 cases est visible à gauche sans clic', async () => {
  await monter({ uid: 'a83-juste' });
  Q_REP = Q_JUSTES;
  await capture('0-accueil');
  await suivante();
  vrai(await present('[data-lc]'), 'la barre n’ouvre pas la carte');
  await capture('1-carte');
  await jouerCarte({});
  await pg.evaluate(() => window.scrollTo(0, 0));
  await capture('2-carte-fin');
  vrai(/centre de la commune/.test(await pg.textContent(`${R} [data-lc-fin]`)), 'texte de fin : la place de Roques n’est pas dite');
  egal(await barre(), 'Étape suivante : Qui est qui ? Y aller →', 'après la carte');
  await suivante();
  vrai(await present('[data-fiche="qui"] [data-fiche-envoyer]'), 'la fiche « Qui est qui ? » ne s’ouvre pas');
  vrai(/Le réseau d’Action en France/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'le document n’est pas à gauche');
  await capture('3-qui-est-qui');
  for (let i = 0; i < 3; i++) await pg.selectOption(`${Z} [data-fiche-champ="entrepot-${i + 1}"]`, JUSTE.qui.ent[i]);
  for (let i = 0; i < 2; i++) await pg.selectOption(`${Z} [data-fiche-champ="acteur-${i + 1}"]`, JUSTE.qui.act[i]);
  await envoyer();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'changer-prestataire', 'L à l’envoi de « Qui est qui ? »');
  await qFil();
  vrai((await menu()).includes('fiche:chaine'), 'la fiche de la chaîne n’est pas ouverte au menu');
  const lu = (await entrants()).find((m) => m.subject === 'La chaîne de Romain');
  vrai(lu && !lu.read, 'le message de Romain sur la chaîne n’est pas arrivé, ou il est déjà lu');
  egal(await barre(), 'Étape suivante : La chaîne de Romain Y aller →', 'la barre mène à l’écran, pas à la Messagerie');
  await suivante();
  vrai(await present('[data-fiche="chaine"] [data-fiche-envoyer]'), 'la barre n’ouvre pas la fiche de la chaîne');
  egal(await pg.$$eval(`${Z} [data-fiche-panneau] .ac-ch-case`, (L) => L.map((x) => [...x.children].map((c) => c.textContent.trim()).join(' '))),
    ['1 Une usine en Asie fabrique le produit', '2 Un avion le transporte', '3 Le port de Marseille le reçoit',
      '4 L’entrepôt GXO de Labastide le stocke et le prépare', '5 Le nouveau magasin de Roques le vend', '6 Le client l’achète'], 'les 6 cases de l’élève');
  // Les cases fausses ne portent aucune marque : même classe, même style que les justes.
  const styles = await pg.$$eval(`${Z} [data-fiche-panneau] .ac-ch-case`, (L) => L.map((x) => [x.className, getComputedStyle(x).borderColor, getComputedStyle(x).fontWeight, getComputedStyle(x).backgroundColor].join('|')));
  egal(new Set(styles).size, 1, 'une case se distingue des autres');
  // Le dessin entier tient à l'écran, à gauche de la fiche.
  const b = await pg.evaluate((Z) => { const c = [...document.querySelectorAll(`${Z} [data-fiche-panneau] .ac-ch-case`)].map((x) => x.getBoundingClientRect());
    const f = document.querySelector(`${Z} [data-fiche="chaine"] [data-fiche-champ="case-1"]`).getBoundingClientRect();
    return { gauche: Math.max(...c.map((r) => r.right)) <= f.left, bas: Math.max(...c.map((r) => r.bottom)), large: Math.min(...c.map((r) => r.width)), haut: window.innerHeight }; }, Z);
  vrai(b.gauche, 'le dessin n’est pas à gauche de la fiche');
  vrai(b.bas <= b.haut, `le dessin descend sous l’écran (${b.bas} > ${b.haut})`);
  vrai(b.large >= 140, `cases trop étroites (${b.large} px)`);
  vrai(await large() <= 0, 'défilement horizontal sur la chaîne');
  await capture('4-chaine');
  await envoyerChaine(JUSTE.chaine);
  egal(await barre(), 'Étape suivante : Ce que je change Y aller →', 'après la chaîne');
  await suivante();
  vrai(await present('[data-fiche-panneau] img[src$="remorque-deux-planchers.svg"]'), 'la remorque n’est pas à gauche');
  await capture('5-ce-que-je-change');
  for (let i = 0; i < 3; i++) { await pg.selectOption(`${Z} [data-fiche-champ="situation-${i + 1}"]`, JUSTE.change[i]); await pause(30); await qFil(); }
  await envoyer();
  await qFil();
  egal(await barre(), '', 'pas de barre après le bilan');
  egal((await note()).score, 20, 'note');
  await pg.evaluate(() => window.scrollTo(0, 0));
  await capture('6-bilan');
});

await v('ENT-8.3 : parcours juste (standard), ouverture répondue toute fausse — 20/20, bandeau 5 lignes ✓, messages de Romain dans l’ordre, séance finie (photo de fin)', async () => {
  await monter({ uid: 'a83-juste', rep: OUV_FAUSSES });
  await jouer();
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(await bandeau(), tout('ok'), 'bandeau');
  egal((await entrants()).map((m) => m.subject), ['Bienvenue chez GXO', 'Qui est qui ?', 'La chaîne de Romain', 'Ce que je change', 'Merci'], 'messages');
  vrai(/Jeudi 17, avant Noël/.test((await entrants()).pop().text), 'amorce d’ENT-8.4');
  vrai(!!(await base()).points[ID], 'photo de fin (ENT-8.4 ouverte sans l’enseignant)');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-8.3 : pire cas — tout faux (fiches, carte au premier essai, questions) → premier bilan, 0/20, 5 lignes ✗, « Corriger » proposé, `finFige` ; ENT-8.4 s’ouvre sans l’enseignant', async () => {
  await monter({ uid: 'a83-faux' });
  Q_REP = { 'changer-prestataire': 'geodis', 'comme-geodis': 'meme', 'deux-planchers': 'solide' };
  await jouerCarte(TOUT_FAUX_CARTE);
  await envoyerQui({ ent: ['action', 'action', 'action'], act: ['achete', 'achete'] });
  await envoyerChaine([['4', 'q'], ['6', 'q']]);
  await envoyerChange(['rien', 'rien', 'rien']);
  await qFil();
  Q_REP = Q_JUSTES;
  const n = await note();
  egal(n.score, 0, 'note');
  egal(await bandeau(), tout('ko'), 'bandeau');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  vrai(/ne se rejouent pas/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
  const photo = (await base()).points[ID];
  vrai(!!photo, 'photo de fin absente');
  const r = await pg.evaluate(async (photo) => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const m84 = metas.find((x) => x.id === 'action-avant-noel') || { id: 'action-avant-noel', parcours: true, precedente: 'action-autre-site' };
    const uid = 'u-verrou-83', gid = 'g-verrou-83', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/action-autre-site`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, m84, profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'action-autre-site': photo } }, ts: 1 }));
    const apres = await verrou(metas, m84, profil, gid);
    localStorage.removeItem(k);
    return { avant, apres };
  }, photo);
  egal(r, { avant: 'Termine d\'abord ENT-8.3.', apres: null }, 'ENT-8.4 après un premier bilan tout faux');
});

await v('ENT-8.3 : carte — département du magasin faux au premier essai → bloc « La carte » ✗ seul (19,25/20), l’élève finit ; « Corriger » ne rouvre que les fiches, pas la carte', async () => {
  await monter({ uid: 'a83-juste' });
  await jouer({ carte: { 'magasin:departement': 1 }, chaine: [['2', 'w'], ['3', 'q']] });
  const d = (await note()).detail;
  egal(['entrepot', 'magasin', 'port'].flatMap((l) => ['region', 'departement'].map((e) => d[`localiser:${l}:${e}`])), ['ok', 'ok', 'ok', 'ko', 'ok', 'ok'], 'jalons de la carte');
  proche((await note()).score, 18.25, 'note (carte − 0,75, chaîne − 1)');
  const carteAvant = JSON.stringify((await base()).localiser);
  await clic('[data-fin-corriger]');
  await pause();
  const b = await base();
  egal([!!b.fiches.qui.envoye, !!b.fiches.chaine.envoye, !!b.fiches.change.envoye], [true, false, true], 'seule la chaîne est rouverte');
  egal(JSON.stringify(b.localiser), carteAvant, 'la carte a bougé');
  const avant = (await entrants()).length;
  await pg.selectOption(`${Z} [data-fiche-champ="etiquette-2"]`, 'k');
  await envoyer();
  egal((await entrants()).slice(avant).map((m) => [m.from, m.subject, m.text]), [['Romain', 'RE : La chaîne de Romain', 'Merci, j’ai ta nouvelle fiche.\n\nRomain']], 'accusé');
  egal((await bandeau()).map(([, e]) => e), ['ko', 'ok', 'ok', 'ok', 'ok'], 'la carte reste ✗');
});

await v('ENT-8.3 : « Qui est qui ? » — « Action lui-même » partout → 0 sur la partie 1 (les 3 entrepôts ✗), les rôles justes ; 17,75/20', async () => {
  await monter({ uid: 'a83-juste' });
  await jouer({ qui: { ent: ['action', 'action', 'action'], act: JUSTE.qui.act } });
  const d = (await note()).detail;
  egal([d['qui-entrepot-labastide'], d['qui-entrepot-tire-1'], d['qui-entrepot-tire-2'], d['qui-acteur-1'], d['qui-acteur-2']], ['ko', 'ko', 'ko', 'ok', 'ok'], 'jalons');
  proche((await note()).score, 17.75, 'note');
});

await v('ENT-8.3 : la chaîne à l’écran — les deux erreurs nommées dans l’ordre INVERSE → 4/4 (20/20) ; bonne case, mauvaise étiquette → trouvée ✓, corrigée ✗', async () => {
  await monter({ uid: 'a83-juste' });
  await jouer({ chaine: [['3', 'k'], ['2', 'w']] });
  const d = (await note()).detail;
  egal(['chaine-trouvee-1', 'chaine-trouvee-2', 'chaine-corrigee-1', 'chaine-corrigee-2'].map((k) => d[k]), ['ok', 'ok', 'ok', 'ok'], 'ordre inverse');
  egal((await note()).score, 20, 'note (ordre inverse)');
  await monter({ uid: 'a83-juste' });
  await jouer({ chaine: [['2', 'b'], ['3', 'k']] });
  const e = (await note()).detail;
  egal(['chaine-trouvee-1', 'chaine-trouvee-2', 'chaine-corrigee-1', 'chaine-corrigee-2'].map((k) => e[k]), ['ok', 'ok', 'ko', 'ok'], 'case 2 trouvée, étiquette fausse recopiée');
  proche((await note()).score, 19, 'note');
});

await v('ENT-8.3 : la chaîne, jugement sans ordre (fonction pure, valeurs écrites à la main) — même case deux fois → une erreur trouvée au plus ; case juste nommée → rien ; inverse → tout', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent83-donnees.js');
    const g = 'a83-juste|action-autre-site';
    const db = { tirages: { 'action-autre-site': { graine: g, ...D.TIRAGE.tirer(g) } } };
    const j = (a, b) => D.jugerChaine(db, { 'case-1': a[0], 'etiquette-1': a[1], 'case-2': b[0], 'etiquette-2': b[1] }).map((x) => [x.trouvee, x.corrigee]);
    return {
      inverse: j(['3', 'k'], ['2', 'w']),
      double: j(['2', 'w'], ['2', 'w']),
      doubleFaux: j(['3', 'k'], ['3', 'q']),
      justes: j(['1', 'q'], ['6', 'z']),
      uneJuste: j(['5', 't'], ['3', 'k']),
      etiqueteAilleurs: j(['2', 'k'], ['3', 'w']),
    };
  });
  egal(r.inverse, [[true, true], [true, true]], 'ordre inverse');
  egal(r.double, [[true, true], [false, false]], 'même case deux fois');
  egal(r.doubleFaux, [[false, false], [true, true]], 'même case deux fois, une étiquette fausse');
  egal(r.justes, [[false, false], [false, false]], 'deux cases justes nommées');
  egal(r.uneJuste, [[false, false], [true, true]], 'une case juste et une fausse');
  egal(r.etiqueteAilleurs, [[true, false], [true, false]], 'étiquettes inversées entre les deux cases');
});

await v('ENT-8.3 : « Ce que je change » — « Rien ne change » partout → 0 sur le bloc (16,5/20) ; P arrive au choix de la PREMIÈRE ligne, pas avant', async () => {
  await monter({ uid: 'a83-juste' });
  Q_REP = Q_JUSTES;
  await jouerCarte({});
  await envoyerQui(JUSTE.qui);
  await envoyerChaine(JUSTE.chaine);
  await allerEcran('fiche:change');
  await pg.selectOption(`${Z} [data-fiche-champ="situation-2"]`, 'rien');
  await pause();
  vrai(!(await present('[data-q-panneau]')), 'une question au choix de la 2e ligne');
  await pg.selectOption(`${Z} [data-fiche-champ="situation-1"]`, 'rien');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'deux-planchers', 'P au choix de la 1re ligne');
  await qFil();
  await pg.selectOption(`${Z} [data-fiche-champ="situation-3"]`, 'rien');
  await envoyer();
  await qFil();
  const d = (await note()).detail;
  egal(['change-facile', 'change-moyen', 'change-difficile'].map((k) => d[k]), ['ko', 'ko', 'ko'], 'jalons');
  proche((await note()).score, 16.5, 'note');
  egal(['question:changer-prestataire', 'question:comme-geodis', 'question:deux-planchers'].map((k) => d[k]), ['ok', 'ok', 'ok'], 'questions');
});

await v('ENT-8.3 : bilan détaillé (CAP) — les titres des lignes ne contiennent ni l’exploitant, ni le rôle juste, ni le numéro d’une case ; l’entrepôt faux est nommé, la situation fausse par son rang ; « Corriger dans … » ouvre la fiche', async () => {
  await monter({ uid: 'a83-juste' });
  await jouer({ qui: { ent: ['gxo', 'gxo', 'geodis'], act: ['guide', 'vend'] }, chaine: [['2', 'w'], ['4', 'k']], change: ['ecrase', 'trouve', 'nimes'] });
  const L = await pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.children[1].textContent.trim(), l.dataset.finCaseEtat, l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
  const titres = L.map(([t]) => t).join(' | ');
  vrai(!/GXO|Geodis|Kuehne|Action lui-même/.test(titres), 'un exploitant dans les titres : ' + titres);
  vrai(!/te guide|fabrique les produits|vend les produits|t’envoie en stage|emmène|stocke et prépare|achète au magasin/.test(titres), 'un rôle dans les titres : ' + titres);
  vrai(!/case|\b[1-6]\b(?!.*situation)/.test(titres.replace(/la situation n° \d/g, '')), 'un numéro de case dans les titres : ' + titres);
  const ko = L.filter(([, e]) => e === 'ko');
  egal(ko, [['Qui fait tourner : L’entrepôt de Verrières-en-Anjou', 'ko', 'fiche:qui'], ['Son rôle : Un fournisseur', 'ko', 'fiche:qui'],
    ['La chaîne : l’autre erreur trouvée', 'ko', 'fiche:chaine'], ['La chaîne : l’autre erreur corrigée', 'ko', 'fiche:chaine'],
    ['Ce que je change : la situation n° 2', 'ko', 'fiche:change']], 'lignes fausses');
  await clic('[data-fin-aller="fiche:change"]');
  await pause();
  vrai(await present('[data-fiche="change"] [data-fiche-envoyer]'), 'la fiche « Ce que je change » n’est pas ouverte');
  egal(await pg.$$eval(`${Z} [data-acorriger] [data-acorr]`, (L) => L.map((l) => l.dataset.acorr)), ['fiche:qui', 'fiche:chaine', 'fiche:change'], 'liste « À corriger »');
});

await v('ENT-8.3 : équité sur 300 graines — Labastide toujours là, au moins 2 exploitants, 2 erreurs (une facile + une autre) sur 2 cases différentes, jamais e-nimes avec s-etiquette, zéro secours ; confirmé = même socle + 1 situation moyenne ; les deux règles ne sont pas décoratives', async () => {
  const r = await pg.evaluate(async (ID) => {
    const D = await import('/contenus/action-ent83-donnees.js');
    const { declarerTirage } = await import('/core/tirage.js');
    const EXPL = { labastide: 'gxo', ensues: 'geodis', verrieres: 'kn', belleville: 'kn', onnaing: 'gxo', moissy: 'gxo' };   // écrit à la main
    const CASE = { 'e-avion': 2, 'e-nimes': 5, 'e-ensues': 4, 'e-marseille': 3, 'e-labastide': 1, 'e-fournisseur': 6 };
    const dif = (b, id) => (D.TIRAGE.decl.banques[b].pieces.find((p) => p.id === id) || {}).difficulte;
    const fautes = [];
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}|${ID}`, s = D.TIRAGE.tirer(g), c = D.TIRAGE.tirer(g, { confirme: true });
      if (s.secours || c.secours) fautes.push(`${i} secours`);
      const P = s.pieces;
      if (P.entrepots.length !== 3 || !P.entrepots.includes('labastide') || new Set(P.entrepots).size !== 3) fautes.push(`${i} entrepôts ${P.entrepots}`);
      if (new Set(P.entrepots.map((x) => EXPL[x])).size < 2) fautes.push(`${i} un seul exploitant ${P.entrepots}`);
      if (P.acteurs.map((x) => dif('acteurs', x)).sort().join() !== 'facile,moyen') fautes.push(`${i} acteurs ${P.acteurs}`);
      const err = [...P.erreurs, ...P.erreursMd];
      if (err.length !== 2 || !['e-avion', 'e-nimes'].includes(err[0]) || CASE[err[0]] === CASE[err[1]]) fautes.push(`${i} erreurs ${err}`);
      if (P.situations.map((x) => dif('situations', x)).sort().join() !== 'difficile,facile,moyen') fautes.push(`${i} situations ${P.situations}`);
      const sitsC = [...c.pieces.situations, ...((c.bonus || {}).situations || [])];
      if ((err.includes('e-nimes') && P.situations.includes('s-etiquette')) || ([...c.pieces.erreurs].includes('e-nimes') && sitsC.includes('s-etiquette'))) fautes.push(`${i} e-nimes avec s-etiquette`);
      if (JSON.stringify(c.pieces) !== JSON.stringify(s.pieces)) fautes.push(`${i} socle du confirmé`);
      const B = (c.bonus || {}).situations || [];
      if (B.length !== 1 || dif('situations', B[0]) !== 'moyen' || s.pieces.situations.includes(B[0])) fautes.push(`${i} bonus ${B}`);
      if (s.bonus) fautes.push(`${i} bonus d’un standard`);
    }
    // La même déclaration sans la règle : sur 1 000 graines, des tirages « un seul exploitant » et « e-nimes avec s-etiquette » passent.
    const sansRegle = declarerTirage({ banques: D.TIRAGE.decl.banques });
    let seul = 0, paire = 0;
    for (let i = 0; i < 1000; i++) {
      const P = sansRegle.tirer(`eleve-${i}|${ID}`).pieces;
      if (new Set(P.entrepots.map((x) => EXPL[x])).size < 2) seul++;
      if (P.erreurs.includes('e-nimes') && P.situations.includes('s-etiquette')) paire++;
    }
    return { fautes, seul, paire };
  }, ID);
  if (r.fautes.length) throw new Error(r.fautes.slice(0, 6).join(' / '));
  vrai(r.seul > 0 && r.paire > 0, `sans la règle, rien à écarter (un seul exploitant ${r.seul}, paire ${r.paire}) : le contrôle ne prouve rien`);
});

await v('ENT-8.3 : tirage stable — le même après rechargement et sur un autre poste ; deux voisins n’ont pas le même jeu', async () => {
  const a = await monter({ uid: 'a83-juste' });
  const b = await monter({ uid: 'a83-juste', db: a });
  egal(b.tirages[ID], a.tirages[ID], 'tirage après rechargement');
  const c = await monter({ uid: 'a83-juste' });
  egal(c.tirages[ID].pieces, a.tirages[ID].pieces, 'tirage sur un autre poste');
  const d = await monter({ uid: 'a83-faux' });
  egal(d.tirages[ID].pieces, { entrepots: ['onnaing', 'labastide', 'belleville'], acteurs: ['lycee', 'roques'], erreurs: ['e-avion'],
    erreursMd: ['e-labastide'], situations: ['s-lourd', 's-cartons', 's-ordre'] }, 'tirage du voisin (écrit à la main)');
});

await v('ENT-8.3 : confirmé (a83-juste) — 4 lieux (Onnaing), 4 situations, bandeau identique ligne pour ligne à un standard, mot « bonus » absent ; cas bonus faux → 20/20, comptés au détail', async () => {
  await monter({ uid: 'a83-juste', aisance: 'confirme' });
  await aller('localiser');
  egal((await pg.textContent(`${R} [data-lc-compteur]`)).trim(), 'Lieu 1 sur 4', 'compteur de la carte');
  await jouer({ carte: { 'onnaing:region': 1, 'onnaing:departement': 1 }, change: [...JUSTE.change, 'rien'] });
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="situation-"]`, (L) => L.length), 4, 'lignes de « Ce que je change »');
  const n = await note();
  egal([n.score, await bandeau()], [20, tout('ok')], 'note et bandeau');
  egal([n.detail.bonus.justes, n.detail.bonus.total, n.detail.bonus.etats],
    [0, 3, { 'localiser:onnaing:region': 'ko', 'localiser:onnaing:departement': 'ko', 'change-bonus': 'ko' }], 'cas bonus');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-8.3 : accompagné (a83-acc) — même tirage qu’un standard sans cas bonus ; la carte nomme les départements', async () => {
  const a = await monter({ uid: 'a83-acc', aisance: 'accompagne' });
  egal([a.aisance, a.tirages[ID].pieces, a.tirages[ID].bonus], ['accompagne', { entrepots: ['onnaing', 'labastide', 'belleville'], acteurs: ['roques', 'fournisseur'],
    erreurs: ['e-nimes'], erreursMd: ['e-labastide'], situations: ['s-lourd', 's-ordre', 's-cartons'] }, undefined], 'tirage (écrit à la main)');
  await aller('localiser');
  await carteJuste();
  vrai(/Haute-Garonne|Lot/.test(await pg.textContent(`${R} [data-ct-svg]`)), 'l’accompagné ne lit pas les noms des départements');
});

await v('ENT-8.3 : parcours — fermée tant qu’ENT-8.2 n’a pas son premier bilan (photo de fin dans sa base), ouverte ensuite', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-action-83', gid = 'g-verrou-action-83', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/action-prise-de-poste`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, de('action-autre-site'), profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'action-prise-de-poste': { v: 1 } } }, ts: 1 }));
    const apres = await verrou(metas, de('action-autre-site'), profil, gid);
    localStorage.removeItem(k);
    return { avant, apres };
  });
  egal(r, { avant: 'Termine d\'abord ENT-8.2.', apres: null }, 'verrou');
});

await v('ENT-8.3 : « Avant de commencer » — 3 notions + 1 image tirées et rangées, menu fermé jusqu’aux réponses ; images du dépôt ; rien n’entre dans la note', async () => {
  await monter({ uid: 'a83-ouv', sansOuverture: true });
  egal((await menu()).filter((x) => !x.startsWith('fermee:')), ['ouverture'], 'entrées ouvertes au départ');
  const T = (await base()).questions[ID]['@tirage'];
  const rub = await pg.evaluate(async (ids) => { const Q = (await import('/contenus/questions/ENT-8.3.js')).QUESTIONS; return ids.map((id) => Q.liste.find((q) => q.id === id).rubrique); }, T.ids);
  egal(rub.slice().sort(), ['image', 'preparation', 'preparation', 'preparation'], 'rubriques tirées');
  await capture('00-avant-de-commencer');
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /ouverture|code-postal|img-|prestataire'|tuteur/.test(k)), 'une question d’ouverture est notée');
  // Les trois visuels nouveaux se chargent depuis le dépôt (aucun 404) : le pictogramme, la photo des quais, la remorque.
  const tailles = await pg.evaluate(async () => Promise.all(['point-rassemblement.svg', 'porte-quai-numero.jpg', 'remorque-deux-planchers.svg']
    .map((f) => fetch(`/contenus/images/action/${f}`).then((r) => r.status))));
  egal(tailles, [200, 200, 200], 'images nouvelles');
});

await v('ENT-8.3 : écrans à 1366 × 768 — carte, trois fiches et leur document sans défilement horizontal ; en thème sombre, le document de la remorque reste sur papier clair', async () => {
  await monter({ uid: 'a83-ecran', db: { localiser: { [ID]: { 'action-carte-83': { fini: true, lieux: {} } } },
    fiches: { qui: { valeurs: {}, envoye: { at: 1 }, envois: 1 }, chaine: { valeurs: {}, envoye: { at: 1 }, envois: 1 } } } });
  for (const vue of ['localiser', 'fiche', 'fiche:chaine', 'fiche:change']) {
    await aller(vue);
    vrai(await large() <= 0, `${vue} : défilement horizontal`);
  }
  await pg.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await pg.evaluate(() => document.documentElement.setAttribute('data-theme', 'sombre'));
  await aller('fiche:change');
  const fond = await pg.$eval(`${Z} [data-fiche-panneau] .ac-trait`, (e) => getComputedStyle(e).backgroundColor);
  const m = /rgba?\((\d+), (\d+), (\d+)/.exec(fond);
  vrai(m && +m[1] > 230 && +m[2] > 230 && +m[3] > 220, 'fond du dessin en thème sombre : ' + fond);
  await capture('7-remorque-sombre');
  await pg.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  await pg.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
});

await v('ENT-8.3 : socle — aucune adresse hors du site, aucune erreur JavaScript ; le corrigé de l’enseignant se calcule pour un élève (carte lieu par lieu, ses entrepôts, ses deux cases, bonus marqués)', async () => {
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-8.3.js');
    const S = await import('/contenus/action-ent83-donnees.js');
    const g = 'a83-juste|action-autre-site';
    const base = { tirages: { 'action-autre-site': { graine: g, ...S.TIRAGE.tirer(g, { confirme: true }) } } };
    const e = C.corrigeEleve(base, 'a83-juste');
    const vide = C.corrigeEleve({}, 'eleve-1');
    return { n: C.CORRIGE.items.length, items: e.items.map((x) => [x.texte, x.rep, !!x.bonus]), vide: vide.texte.length > 0 };
  });
  vrai(c.n >= 5 && c.vide, 'corrigé commun / élève qui n’a pas ouvert');
  vrai(c.items.some(([t, r, b]) => /Onnaing/.test(t) && /Nord \(59\)/.test(r) && b), 'Onnaing marqué bonus');
  vrai(c.items.some(([t, r]) => /Roques/.test(t) && /Haute-Garonne \(31\)/.test(r) && /Occitanie \(76\)/.test(r)), 'Roques lieu par lieu');
  vrai(c.items.some(([t, r]) => /case n° 2/.test(t) && /porte-conteneurs/.test(r)) && c.items.some(([t, r]) => /case n° 3/.test(t) && /Havre/.test(r)), 'les deux cases de l’élève');
  vrai(c.items.some(([t, r]) => /Verrières/.test(t) && r === 'Kuehne+Nagel'), 'un entrepôt de l’élève');
  vrai(c.items.some(([t, , b]) => /ligne 4/.test(t) && b), 'situation bonus marquée');
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await ctx83.close();
}
