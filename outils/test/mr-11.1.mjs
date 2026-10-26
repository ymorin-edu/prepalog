// Suite de tests de Prepalog — bloc « mr-11.1 » : Mondial Relay ENT-11.1, le voyage d’un colis (2de, découverte de C1.1).
// `node outils/test.mjs mr-11.1` ne lance que ce bloc. Brief : `docs/briefs/ENT-11.1-mondial-relay-voyage-colis.md` (§5, §8).
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/mondial-relay-voyage-colis.js` →
// `rendre`), de vrais clics à la SOURIS (centre de `boundingBox()`, après `scrollIntoViewIfNeeded()`) ; les listes des fiches par `selectOption`.
// Les GRAINES sont choisies ici (l’identifiant de l’élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le tirage
// le 26/10/2026 et recalculées à la main d’après les règles : locker 25 kg, 64 cm, 142 cm ; Point Relais 30 kg, 120 cm, 150 cm), jamais recalculées
// par le code de la séance :
//
//   mr-juste (standard) : lignes de la fiche des colis, dans l’ordre : un meuble en kit (118 × 30 × 3 : somme 151 → refusé), le colis d’Inès
//     (70 cm de long → Point Relais), un tapis roulé (110 × 20 × 20 : somme 150 pile → Point Relais), un écran (70 cm → Point Relais), un fauteuil
//     (220 cm de somme → refusé), un pull (locker), des skis (160 cm → refusé). Voyage au départ : ramassage, hub, retrait, dépôt, tournée, relais,
//     navette (8 inversions).
//   mr-faux (standard) : Inès (Point Relais), meuble (refusé), fauteuil (refusé), skis (refusé), écran (Point Relais), livres (locker), miroir
//     (160 cm de somme → refusé).
//   mr-conf (confirmé) : 7 lignes de socle (pull, tapis, caisse d’outils, Inès, écran, fauteuil, croquettes 26 kg) puis 2 colis bonus : des plats
//     surgelés (refusé d’office) et le meuble en kit (refusé).
//
// Barème (brief §5, poids validés par Tristan le 26/10/2026) : situer le hub 4 (région 2, département 2) · le voyage 6 (ordre exact 3 + ordre à une
// inversion près 3) · les règles du colis 6 (Inès 0,75 + six colis tirés 0,875) · les questions de Romain 4 (colis au hub 1,5 · colis non retiré 1,5 ·
// colis de 27 kg 1). Ce qui vaut son prix : le parcours juste, le pire cas, l’inaction à 0, l’ordre (juste, une inversion, deux, jamais touché), le
// classement juste et faux, le tirage équitable, le confirmé caché.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'mondial-relay-voyage-colis';
const VUE = 'mondial-relay-carte';
const ctx = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctx.newPage();
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
const pause = (ms = 80) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
const note = () => pg.evaluate(() => { const L = window.__f.enregistres; return L.length ? L[L.length - 1] : null; });
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
const bandeau = () => pg.$$eval(`${Z} [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finJalon, x.dataset.finEtat]));
const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
const menu = () => pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => (b.dataset.vue ? b.dataset.vue : `fermee:${b.dataset.vueFermee}`)));
const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };

// Un clic à la SOURIS au centre de l'élément (après l'avoir fait venir à l'écran).
async function clic(sel) {
  const el = await pg.waitForSelector(`${Z} ${sel}`, { state: 'visible' });
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  vrai(b && b.width > 0 && b.height > 0, `« ${sel} » n’a pas de place à l’écran`);
  await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}
const aller = async (vue) => { await clic(`.ent-nav[data-vue="${vue}"]`); await pause(); };

// L’écran « Avant de commencer » : les 5 réponses (n’importe quelle clé compte comme « répondu »).
const OUV_JUSTES = { 'mr1-a': 'commerce', 'mr1-b': 'trier', 'mr1-c': 'octobre', 'mr1-d': 'ines', 'mr1-e': 'transport' };
const OUV_FAUSSES = { 'mr1-a': 'poste', 'mr1-b': 'fabriquer', 'mr1-c': 'ete', 'mr1-d': 'relais', 'mr1-e': 'bail' };

// Monte la séance comme le site. `o.db` : base de départ (copiée) ; `o.uid` (la graine) ; `o.aisance` ; `o.role` ; `o.rep` : réponses
// d'ouverture (défaut : toutes justes) ; `o.sansOuverture` : rien de répondu.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/mondial-relay-voyage-colis.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['mondial-relay-voyage-colis'] = db.questions['mondial-relay-voyage-colis'] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'mr-juste' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'MR',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { rep: OUV_JUSTES, ...o });

// Les questions au fil : répond au panneau ouvert (réponse de `Q_REP`), puis « Reprendre », tant qu'il y en a une.
const Q_JUSTES = { 'axes-routiers': 'vite', 'hub-temps': 'heures', 'retrait-sept-jours': 'retour', 'locker-27-kg': 'relais', 'petits-villages': 'clients' };
const Q_FAUSSES = { 'axes-routiers': 'pas-pense', 'hub-temps': 'mois', 'retrait-sept-jours': 'jete', 'locker-27-kg': 'oui', 'petits-villages': 'pas-pense' };
let Q_REP = Q_JUSTES;
// Le toast (« Fiche envoyée. ») peut couvrir un bouton du bas : attendre qu'il parte.
const sansToast = () => pg.waitForFunction(() => { const t = document.getElementById('toast'); return !t || t.style.display === 'none'; });
async function qFil() {
  for (let i = 0; i < 5; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await sansToast();
    await clic(`[data-q-choix="${Q_REP[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    await clic('[data-q-reprendre]');
    await pause();
  }
}

// ── la carte (vue « Localiser »)
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
// Toute la carte (un seul lieu : le hub). `fautes` : { 'hub:region': 1 } = le nombre de mauvais clics avant le bon à cette étape.
async function jouerCarte(fautes = {}, { avant } = {}) {
  await aller('localiser');
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
}

// Le chemin de l'élève vers une fiche qui vient d'arriver : la carte « Nouveau message » (ou la Messagerie), puis le bouton du message.
async function ouvrirParMessage(sujet, vue) {
  const id = await pg.evaluate((s) => (window.__f.db.mails.find((m) => m.folder === 'in' && m.subject === s) || {}).id, sujet);
  vrai(id != null, `le message « ${sujet} » n’est pas arrivé`);
  if (await present(`[data-carte-lire="${id}"]`)) await clic(`[data-carte-lire="${id}"]`);
  else { await aller('mail'); await clic(`[data-mail="${id}"]`); }
  await pause();
  await sansToast();
  await clic(`[data-vue2="${vue}"]`);
  await pause();
}

// ── « Le voyage du colis » : `ordre` = l'ordre voulu (null : ne rien toucher). Au premier déplacement, la question « hub-temps ».
const ORDRE_JUSTE = ['depot', 'ramassage', 'hub', 'navette', 'tournee', 'relais', 'retrait'];
const ORDRE_UNE_INVERSION = ['depot', 'ramassage', 'hub', 'tournee', 'navette', 'relais', 'retrait'];
const ORDRE_DEUX_INVERSIONS = ['depot', 'ramassage', 'hub', 'navette', 'retrait', 'tournee', 'relais'];
async function envoyerVoyage(ordre) {
  await ouvrirParMessage('Le voyage d’un colis', 'fiche');
  if (ordre) {
    for (let k = 0; k < ordre.length; k++) {
      for (let s = 0; s < 8; s++) {
        const cur = await pg.$$eval(`${Z} [data-fiche-ordre="voyage"] li`, (L) => L.map((x) => x.dataset.v));
        const j = cur.indexOf(ordre[k]);
        if (j <= k) break;
        await clic(`[data-fiche-ordre="voyage"] li[data-v="${ordre[k]}"] [data-ordre-sens="-1"]`);
        await pause(30);
        await qFil();
      }
    }
  }
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  await qFil();
}
// ── « Peut-il voyager ? » : `vals` = la clé choisie à chaque ligne, dans l'ordre des lignes.
async function envoyerColis(vals) {
  await ouvrirParMessage('Peut-il voyager ?', 'fiche:colis');
  for (let i = 0; i < vals.length; i++) {
    await pg.selectOption(`${Z} [data-fiche-champ="colis-${i + 1}"]`, vals[i]);
    await qFil();                       // au premier colis classé : la question des 27 kg
  }
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  await qFil();
}

// Les réponses justes de mr-juste (écrites à la main, voir l'en-tête).
const COLIS_JUSTES = ['refuse', 'relais', 'relais', 'relais', 'refuse', 'locker', 'refuse'];
const COLIS_FAUX = { refuse: 'locker', relais: 'refuse', locker: 'relais' };
// Le parcours entier. `o` : { carte (fautes), ordre, colis, q (réponses des questions au fil) }.
async function jouer(o = {}) {
  Q_REP = { ...Q_JUSTES, ...(o.q || {}) };
  await jouerCarte(o.carte || {});
  await envoyerVoyage(o.ordre === undefined ? ORDRE_JUSTE : o.ordre);
  await envoyerColis(o.colis || COLIS_JUSTES);
  await qFil();
}

const LIGNES = ['localiser:hub:region', 'voyage-ordre', 'colis-fixe', 'question:hub-temps'];
const tout = (etat) => LIGNES.map((l) => [l, etat]);

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-11.1 : la séance se charge (2de, C1.1, guidage, parcours sans précédente, correction, niveaux prévus confirmé) ; somme des poids 16 + part 4 = 20 ; inscrite dans la table des entreprises (n° 11)', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/mondial-relay-voyage-colis.js');
    const S = await import('/contenus/mondial-relay-ent111.js');
    const Q = await import('/contenus/questions/ENT-11.1.js');
    const I = await import('/activites/index.js');
    const socle = S.ETAPES.filter((e) => !e.bonus);
    return { meta: A.meta, poids: socle.reduce((s, e) => s + e.poids, 0), n: socle.length, bonus: S.ETAPES.filter((e) => e.bonus).map((e) => e.id),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids]),
      reflexions: Q.QUESTIONS.liste.filter((q) => q.reflexion).map((q) => q.id),
      groupes: [...new Set(socle.map((e) => e.groupe))], entreprise: (I.ENTREPRISES.find((e) => e.n === 11) || {}).nom };
  });
  egal([r.meta.code, r.meta.niveaux, r.meta.competences, r.meta.temps, r.meta.bareme, r.meta.correction, r.meta.parcours,
    r.meta.precedente, r.meta.niveauxPrevus, r.meta.questions, r.meta.pret, r.meta.ouverture],
  ['ENT-11.1', ['2de'], ['C1.1'], 'guidage', 20, true, true, undefined, ['confirme'], 'ENT-11.1', true, 'prof'], 'meta');
  proche(r.poids, 16, 'somme des poids des jalons');
  egal([r.n, r.part, r.notees], [11, 4, [['hub-temps', 1.5], ['retrait-sept-jours', 1.5], ['locker-27-kg', 1]]], 'jalons, part, questions notées');
  egal(r.reflexions, ['axes-routiers', 'petits-villages'], 'questions de réflexion (non notées)');
  egal(r.groupes, ['Situer le hub', 'Le voyage du colis', 'Les règles du colis'], 'lignes du bandeau (hors questions)');
  egal(r.bonus, ['colis-bonus-1', 'colis-bonus-2'], 'cas bonus');
  egal(r.entreprise, 'Mondial Relay', 'entreprise n° 11');
});

await v('ENT-11.1 : à l’ouverture, le tirage est rangé (graine élève|séance) ; seul le message de Romain (document joint) ; la carte ouverte, le voyage et les colis fermés ; la consigne ne compte pas les colis', async () => {
  const db = await monter({ uid: 'mr-juste' });
  egal(db.tirages[ID].graine, `mr-juste|${ID}`, 'graine');
  egal(db.tirages[ID].pieces.colis, ['c-meuble', 'c-ines', 'c-tapis', 'c-ecran', 'c-fauteuil', 'c-pull', 'c-skis'], 'colis tirés, dans l’ordre de la fiche');
  egal(db.tirages[ID].valeurs.voyage, ['ramassage', 'hub', 'retrait', 'depot', 'tournee', 'relais', 'navette'], 'ordre de départ du voyage');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Romain', 'Bienvenue au hub', ['mr']]], 'messages à l’ouverture');
  vrai(new Date(E[0].ts).getMonth() === 11, 'le message n’est pas daté de décembre');
  vrai(!/\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i.test(E[0].text + E[0].subject), 'un jour de la semaine dans le message');
  const M = await menu();
  vrai(M.includes('localiser') && !M.includes('fiche') && !M.includes('fiche:colis'), 'menu au départ : ' + M.join(', '));
  vrai(M.some((m) => m.startsWith('fermee:')), 'le voyage et les colis sont fermés : ' + M.join(', '));
  vrai(!/\b(6|six|7|sept|13|treize) colis\b/i.test(await texte()), 'une consigne compte les colis');
});

await v('ENT-11.1 : inaction — rien fait → 0/20, rien de jugé « juste », pas de bandeau de fin', async () => {
  await monter({ uid: 'mr-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
});

await v('ENT-11.1 : parcours juste (standard), ouverture répondue toute fausse — 20/20, bandeau 4 lignes ✓, messages de Romain dans l’ordre, deux réflexions rangées et non notées, séance finie', async () => {
  await monter({ uid: 'mr-juste', rep: OUV_FAUSSES });
  let axes = null;
  await jouerCarte({}, { avant: async (x) => {
    const q = ((await base()).questions[ID] || {})['axes-routiers'];
    if (x.etape === 'departement') axes = !!(q && q.arrivee);
    if (x.etape === 'region') vrai(!q, 'la réflexion est arrivée avant la région');
  } });
  egal(axes, true, 'la réflexion « axes routiers » arrive à la fin de la région');
  Q_REP = Q_JUSTES;
  await envoyerVoyage(ORDRE_JUSTE);
  await envoyerColis(COLIS_JUSTES);
  await qFil();
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(await bandeau(), tout('ok'), 'bandeau');
  egal((await entrants()).map((m) => m.subject), ['Bienvenue au hub', 'Le voyage d’un colis', 'Peut-il voyager ?', 'Merci pour cette soirée'], 'messages');
  const tousLesMessages = (await entrants()).map((m) => m.text).join(' ');
  vrai(!/\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i.test(tousLesMessages), 'un jour de la semaine dans un message');
  const b = await base();
  vrai(!!b.points[ID], 'photo de fin rangée (la séance suivante s’ouvrira sans l’enseignant)');
  egal([b.questions[ID]['axes-routiers'].premiere, b.questions[ID]['petits-villages'].premiere], ['vite', 'clients'], 'réflexions rangées');
  vrai(!Object.keys(n.detail).some((k) => /axes-routiers|petits-villages/.test(k)), 'une réflexion est notée');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-11.1 : pire cas — tout faux (carte au premier essai, voyage jamais touché, colis tous faux, questions fausses) → 0/20, 4 lignes ✗, « Corriger » proposé, la carte ne se rejoue pas', async () => {
  await monter({ uid: 'mr-juste' });
  await jouer({ carte: { 'hub:region': 1, 'hub:departement': 1 }, ordre: null, colis: COLIS_JUSTES.map((c) => COLIS_FAUX[c]), q: Q_FAUSSES });
  const n = await note();
  egal(n.score, 0, 'note');
  egal(await bandeau(), tout('ko'), 'bandeau');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  vrai(/ne se rejouent pas/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
  vrai(!!(await base()).points[ID], 'photo de fin : aucun élève bloqué');
  Q_REP = Q_JUSTES;
});

// ─────────────────────────────────────────────────────────── la carte
await v('ENT-11.1 : carte juste = jalons ok (4 points) ; une erreur à la région → 18/20 ; erreurs à la ville seulement → rien perdu', async () => {
  await monter({ uid: 'mr-juste' });
  await jouerCarte();
  let d = (await note()).detail;
  egal([d['localiser:hub:region'], d['localiser:hub:departement']], ['ok', 'ok'], 'jalons de la carte (juste)');
  proche((await note()).score, 4, 'note après la carte seule');
  await monter({ uid: 'mr-juste' });
  await jouer({ carte: { 'hub:region': 1 } });
  d = (await note()).detail;
  egal([d['localiser:hub:region'], d['localiser:hub:departement']], ['ko', 'ok'], 'jalons (région fausse)');
  proche((await note()).score, 18, 'note');
  await monter({ uid: 'mr-juste' });
  await jouerCarte({ 'hub:ville': 2 });
  vrai(/Grand Est/.test(await pg.textContent(`${R} [data-lc-fin]`)), 'texte de fin de la carte');
  vrai(/approchée/.test(await pg.textContent(`${R} [data-lc-fin]`)), 'la position approchée est dite');
  await monter({ uid: 'mr-juste' });
  await jouer({ carte: { 'hub:ville': 2 } });
  egal([await bandeau(), (await note()).score], [tout('ok'), 20], 'erreurs à la ville seulement');
});

// ─────────────────────────────────────────────────────────── le voyage
await v('ENT-11.1 : voyage — ordre juste = 6 points ; une inversion (deux étapes voisines) = 3 points (17/20) ; deux inversions = 0 (14/20) ; jamais touché = 0, et l’ordre envoyé est l’ordre de départ', async () => {
  const essai = async (ordre) => { await monter({ uid: 'mr-juste' }); await jouer({ ordre }); return { d: (await note()).detail, s: (await note()).score }; };
  let r = await essai(ORDRE_JUSTE);
  egal([r.d['voyage-ordre'], r.d['voyage-presque']], ['ok', 'ok'], 'ordre juste');
  proche(r.s, 20, 'note (ordre juste)');
  r = await essai(ORDRE_UNE_INVERSION);
  egal([r.d['voyage-ordre'], r.d['voyage-presque']], ['ko', 'ok'], 'une inversion');
  proche(r.s, 17, 'note (une inversion = moitié des 6 points)');
  r = await essai(ORDRE_DEUX_INVERSIONS);
  egal([r.d['voyage-ordre'], r.d['voyage-presque']], ['ko', 'ko'], 'deux inversions');
  proche(r.s, 14, 'note (deux inversions)');
  r = await essai(null);
  egal([r.d['voyage-ordre'], r.d['voyage-presque']], ['ko', 'ko'], 'ordre jamais touché');
  proche(r.s, 14, 'note (ordre jamais touché : rien ne récompense l’inaction)');
  egal((await base()).fiches.voyage.valeurs.voyage, ['ramassage', 'hub', 'retrait', 'depot', 'tournee', 'relais', 'navette'], 'ordre envoyé = ordre de départ');
});

await v('ENT-11.1 : voyage — la question « hub-temps » arrive au premier déplacement (✓ / ✗ tout de suite) ; « retrait-sept-jours » à l’envoi (« Merci, je note », corrigée au bilan)', async () => {
  await monter({ uid: 'mr-juste' });
  Q_REP = Q_JUSTES;
  await jouerCarte();
  await ouvrirParMessage('Le voyage d’un colis', 'fiche');
  vrai(!(await present('[data-q-panneau]')), 'une question avant tout geste');
  await clic('[data-fiche-ordre="voyage"] li[data-v="retrait"] [data-ordre-sens="-1"]');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'hub-temps', 'question au premier déplacement');
  await clic('[data-q-choix="mois"][data-q="hub-temps"]');
  await clic('[data-q-repondre="hub-temps"]');
  await pause();
  vrai(await present('[data-q-verdict]'), 'hub-temps : ✓ / ✗ tout de suite');
  await clic('[data-q-reprendre]');
  await pause();
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'retrait-sept-jours', 'question à l’envoi');
  vrai(/7 jours/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'le texte calcule 5 + 2 = 7 jours');
  await clic('[data-q-choix="retour"][data-q="retrait-sept-jours"]');
  await clic('[data-q-repondre="retrait-sept-jours"]');
  await pause();
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'retrait-sept-jours : « Merci, je note » sans verdict');
  await clic('[data-q-reprendre]');
  await pause();
  const d = (await note()).detail;
  egal([d['question:hub-temps'], d['question:retrait-sept-jours']], ['ko', 'ok'], 'questions jugées (la seconde se corrige au bilan)');
});

// ─────────────────────────────────────────────────────────── les colis
await v('ENT-11.1 : colis — la fiche donne les règles (valeurs de REGLES_COLIS) ; classement juste = 6 points ; Inès seule fausse → 19,25 ; un colis tiré faux → 19,125 ; tous faux → 14', async () => {
  const essai = async (vals) => { await monter({ uid: 'mr-juste' }); await jouer({ colis: vals }); return (await note()); };
  let n = await essai(COLIS_JUSTES);
  proche(n.score, 20, 'classement juste');
  await monter({ uid: 'mr-juste' });
  Q_REP = Q_JUSTES;
  await jouerCarte();
  await envoyerVoyage(ORDRE_JUSTE);
  await ouvrirParMessage('Peut-il voyager ?', 'fiche:colis');
  const t = await texte();
  for (const x of ['25 kg', '64 cm', '142 cm', '30 kg', '120 cm', '150 cm', 'produit dangereux']) vrai(t.includes(x), `la règle « ${x} » n’est pas sur la fiche`);
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="colis-"]`, (L) => L.length), 7, 'sept lignes (Inès + 6 colis)');
  const fauxA = (i) => COLIS_JUSTES.map((c, k) => (k === i ? COLIS_FAUX[c] : c));
  n = await essai(fauxA(1));
  proche(n.score, 19.25, 'Inès seule fausse');
  egal(n.detail['colis-fixe'], 'ko', 'jalon d’Inès');
  n = await essai(fauxA(0));
  proche(n.score, 19.125, 'un colis tiré faux');
  egal(n.detail['colis-fixe'], 'ok', 'Inès reste juste');
  n = await essai(COLIS_JUSTES.map((c) => COLIS_FAUX[c]));
  proche(n.score, 14, 'tous les colis faux');
});

await v('ENT-11.1 : colis — la question des 27 kg arrive au premier colis classé (✓ / ✗ tout de suite) ; sa bonne réponse suit la règle (trop lourd pour le locker, accepté au Point Relais)', async () => {
  await monter({ uid: 'mr-juste' });
  Q_REP = Q_JUSTES;
  await jouerCarte();
  await envoyerVoyage(ORDRE_JUSTE);
  await ouvrirParMessage('Peut-il voyager ?', 'fiche:colis');
  vrai(!(await present('[data-q-panneau]')), 'une question avant tout geste');
  await pg.selectOption(`${Z} [data-fiche-champ="colis-3"]`, 'relais');
  await pause();
  vrai(!(await present('[data-q-panneau]')), 'la question est arrivée sur le 3e colis : elle suit le 1er');
  await pg.selectOption(`${Z} [data-fiche-champ="colis-1"]`, 'refuse');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'locker-27-kg', 'question au premier colis classé');
  const p = await pg.textContent(`${Z} [data-q-panneau]`);
  vrai(/27 kg/.test(p) && /50 × 30 × 30/.test(p), 'le texte calcule 25 + 2 = 27 kg');
  await clic('[data-q-choix="relais"][data-q="locker-27-kg"]');
  await clic('[data-q-repondre="locker-27-kg"]');
  await pause();
  vrai(await present('[data-q-verdict]'), '✓ / ✗ tout de suite');
  await clic('[data-q-reprendre]');
  await pause();
  egal((await note()).detail['question:locker-27-kg'], 'ok', 'question notée juste');
});

await v('ENT-11.1 : « Corriger » — un colis faux : seule la fiche des colis se rouvre (pas la carte, pas le voyage) ; renvoi juste → accusé de Romain, note moyennée 19,5', async () => {
  await monter({ uid: 'mr-juste' });
  await jouer({ colis: COLIS_JUSTES.map((c, k) => (k === 1 || k === 2 ? COLIS_FAUX[c] : c)) });
  proche((await note()).score, 18.375, 'premier bilan (Inès et le tapis faux : 0,75 + 0,875 perdus)');
  const carteAvant = JSON.stringify((await base()).localiser);
  await clic('[data-fin-corriger]');
  await pause();
  const b = await base();
  egal([!!b.fiches.voyage.envoye, !!b.fiches.colis.envoye], [true, false], 'fiches rouvertes');
  egal(JSON.stringify(b.localiser), carteAvant, 'la carte a bougé');
  vrai(await present('[data-fiche="colis"] [data-fiche-envoyer]'), 'la fiche des colis est rouverte à l’écran');
  const avant = (await entrants()).length;
  await pg.selectOption(`${Z} [data-fiche-champ="colis-2"]`, 'relais');
  await pg.selectOption(`${Z} [data-fiche-champ="colis-3"]`, 'relais');
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  egal((await entrants()).slice(avant).map((m) => [m.from, m.subject, m.text]), [['Romain', 'RE : Peut-il voyager ?', 'Merci, j’ai ta nouvelle fiche.\n\nRomain']], 'accusé');
  proche((await note()).score, (18.375 + 20) / 2, 'note moyennée');
});

// ─────────────────────────────────────────────────────────── tirage et niveaux
await v('ENT-11.1 : tirage — 500 graines, jamais le secours ; chaque socle compte un locker et un refusé ; l’ordre de départ est à 2 inversions ou plus ; classes attendues écrites à la main pour 4 colis', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent111-donnees.js');
    let secours = 0, mini = 99, sansLocker = 0, sansRefus = 0, faux = 0;
    for (let i = 0; i < 500; i++) {
      const g = `eq${i}|${D.ID}`, t = D.TIRAGE.tirer(g);
      if (t.secours) secours++;
      const db = { tirages: { [D.ID]: { graine: g, ...t } } };
      mini = Math.min(mini, D.inversions(D.ordreDepart(db)));
      const cl = D.colisDe(db).map((c) => D.classer(c));
      if (!cl.includes('locker')) sansLocker++;
      if (!cl.includes('refuse')) sansRefus++;
      if (cl.length !== 7 || new Set(D.colisDe(db).map((c) => c.id)).size !== 7) faux++;
    }
    const C = (id) => D.COLIS.find((c) => c.id === id);
    return { secours, mini, sansLocker, sansRefus, faux, banque: D.COLIS.length,
      classes: ['c-meuble', 'c-tapis', 'c-croquettes', 'c-surgeles'].map((id) => D.classer(C(id))) };
  });
  egal([r.secours, r.sansLocker, r.sansRefus, r.faux, r.banque], [0, 0, 0, 0, 13], 'équité du tirage');
  vrai(r.mini >= 2, `ordre de départ trop proche de l’ordre juste (${r.mini} inversion)`);
  // Écrit à la main : meuble 118+30+3 = 151 > 150 ; tapis 110+20+20 = 150 pile ; croquettes 26 kg > 25 ; plats surgelés = interdit.
  egal(r.classes, ['refuse', 'relais', 'relais', 'refuse'], 'classes de quatre colis');
});

await v('ENT-11.1 : confirmé — deux colis bonus de plus (9 lignes), cachés ; chaque cas juste ajoute 0,5 (région fausse + 2 bonus justes = 18 + 1 = 19) ; un cas faux ne retire rien ; le mot « bonus » n’apparaît pas', async () => {
  const vals = ['locker', 'relais', 'locker', 'relais', 'relais', 'refuse', 'relais', 'refuse', 'refuse'];
  await monter({ uid: 'mr-conf', aisance: 'confirme' });
  Q_REP = Q_JUSTES;
  await jouerCarte({ 'hub:region': 1 });
  await envoyerVoyage(ORDRE_JUSTE);
  await ouvrirParMessage('Peut-il voyager ?', 'fiche:colis');
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="colis-"]`, (L) => L.length), 9, 'neuf lignes chez un confirmé');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
  for (let i = 0; i < vals.length; i++) { await pg.selectOption(`${Z} [data-fiche-champ="colis-${i + 1}"]`, vals[i]); await qFil(); }
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  await qFil();
  proche((await note()).score, 19, 'socle 18 + 2 bonus justes');
  await monter({ uid: 'mr-conf', aisance: 'confirme' });
  await jouer({ colis: ['locker', 'relais', 'locker', 'relais', 'relais', 'refuse', 'relais', 'locker', 'locker'] });
  proche((await note()).score, 20, 'deux bonus faux : rien retiré');
  await monter({ uid: 'mr-juste', aisance: 'standard' });
  await jouer();
  egal(Object.keys((await note()).detail).filter((k) => /bonus/.test(k)), [], 'standard : aucun colis bonus dans le détail');
});

// ─────────────────────────────────────────────────────────── l’enseignant, le corrigé, le socle
await v('ENT-11.1 : l’enseignant ouvre la séance sans rien écrire ; le corrigé se calcule pour un élève (voyage, 7 colis avec leur classe) ; aucune adresse hors du site, aucune erreur JavaScript', async () => {
  await monter({ uid: 'mr-prof', role: 'prof', sansOuverture: true });
  vrai(await present('.ent-nav'), 'la séance s’ouvre pour l’enseignant');
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-11.1.js');
    const D = await import('/contenus/mondial-relay-ent111-donnees.js');
    const g = 'mr-juste|' + D.ID;
    const base = { tirages: { [D.ID]: { graine: g, ...D.TIRAGE.tirer(g) } } };
    const e = C.corrigeEleve(base, 'mr-juste');
    return { n: C.CORRIGE.items.length, items: e.items.map((x) => [x.texte, x.rep, !!x.bonus]) };
  });
  vrai(c.n >= 4, 'corrigé commun');
  vrai(c.items.some(([t, r]) => /meuble en kit/.test(t) && r === 'Refusé'), 'le meuble de 151 cm de somme est refusé');
  vrai(c.items.some(([t, r]) => /tapis roulé/.test(t) && r === 'Point Relais'), 'le tapis de 150 cm de somme passe au Point Relais');
  vrai(c.items.some(([t, r]) => /pull/.test(t) && r === 'Locker'), 'le pull va en locker');
  egal(c.items.length, 9, 'deux lignes de voyage + sept colis');
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await ctx.close();
}
