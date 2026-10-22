// Suite de tests de Prepalog — bloc « action-81 » : Action ENT-8.1, d’où viennent les produits du magasin de Nîmes ? (CAP OL, guidage
// CAP-C1.1). `node outils/test.mjs action-81` ne lance que ce bloc (un bloc par séance, comme France Boissons et `decathlon-74` ; le bloc
// `action` est celui d’ENT-8.2). Brief : `docs/briefs/ENT-8.1-action-se-situer.md` §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/action-se-situer.js` → `rendre`),
// de vrais clics à la SOURIS (centre de `boundingBox()`, après `scrollIntoViewIfNeeded()`) ; les listes des fiches par `selectOption`.
// Les GRAINES sont choisies ici (l’identifiant de l’élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le
// tirage le 15/10/2026), jamais recalculées par le code de la séance :
//
//   a81-juste (standard) : acteurs, dans l’ordre des lignes : Geodis (stocke), Action (possède), ton lycée (forme), le transporteur (amène) ;
//     situations : s-retard (moyen, « tard »), s-scan (difficile, « stock »), s-chute (facile, « casse ») ; chaîne au départ :
//     client, ensues, havre, bateau, magasin, usine. Confirmé (même graine) : même socle + s-emplacement (« introuvable »), 4e ligne.
//   a81-faux (standard) : le client (achète), le transporteur (amène), Geodis (stocke), Action (possède) ; s-etiquette (« ailleurs »),
//     s-abime (« invendable »), s-emplacement (« introuvable ») ; chaîne : bateau, havre, magasin, client, ensues, usine.
//   a81-acc : Action, Geodis, le client, le transporteur ; s-retard, s-abime, s-etiquette.
//
// Barème (brief §5, poids validés par Tristan le 15/10/2026, option B) : Qui est qui ? 4 (1 × 4) · La carte de France 4,5 (0,75 × 6) ·
// La chaîne 4 (2,5 + 1,5) · Ce que je change 3,5 (facile 1, moyenne 1,25, difficile 1,25) · Les questions de Samia 4 (A 1,5 · D 1,5 · E 1).
// Ce qui vaut son prix : le parcours juste, le pire cas (aucun élève bloqué), l’inaction à 0, un faux par bloc qui ne fait tomber que son
// bloc, « Corriger » qui ne rouvre que la fiche fausse (jamais la carte), le tirage rangé et équitable, le confirmé caché.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'action-se-situer';
const VUE = 'action-carte';
const ctx81 = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctx81.newPage();
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
const CAPTURES = process.env.CAPTURES_ENT81 || '';
const pause = (ms = 80) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
const note = () => pg.evaluate(() => { const L = window.__f.enregistres; return L.length ? L[L.length - 1] : null; });
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
const bandeau = () => pg.$$eval(`${Z} [data-fin-jalon]`, (L) => L.map((x) => [x.dataset.finJalon, x.dataset.finEtat]));
const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
const menu = () => pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => (b.dataset.vue ? b.dataset.vue : `fermee:${b.dataset.vueFermee}`)));
const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };
const capture = async (nom) => { if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/${nom}.png` }); };

// Un clic à la SOURIS au centre de l'élément (après l'avoir fait venir à l'écran).
async function clic(sel) {
  const el = await pg.waitForSelector(`${Z} ${sel}`, { state: 'visible' });
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  vrai(b && b.width > 0 && b.height > 0, `« ${sel} » n’a pas de place à l’écran`);
  await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}
const aller = async (vue) => { await clic(`.ent-nav[data-vue="${vue}"]`); await pause(); };

// Les réponses (n’importe quelle clé compte comme « répondu ») de la banque d’ouverture : l’écran « Avant de commencer » est passé.
const OUV_JUSTES = { 'action-vend': 'maison', 'action-memes': 'memes', 'entrepot-sert': 'stocker', 'port-sert': 'bateaux', chaine: 'chemin',
  regions: 'departements', 'code-postal': 'debut', 'img-semi': 'semi', 'img-palette': 'filmee', 'img-rack': 'racks' };
const OUV_FAUSSES = { 'action-vend': 'voitures', 'action-memes': 'paris', 'entrepot-sert': 'vendre', 'port-sert': 'essence', chaine: 'caisses',
  regions: 'pays', 'code-postal': 'fin', 'img-semi': 'tracteur', 'img-palette': 'roll', 'img-rack': 'quais' };

// Monte la séance comme le site. `o.db` : base de départ (copiée) ; `o.uid` (la graine) ; `o.aisance` ; `o.role` ; `o.rep` : réponses
// d'ouverture (défaut : toutes justes) ; `o.sansOuverture` : rien de répondu.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-se-situer.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['action-se-situer'] = db.questions['action-se-situer'] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'a81-juste' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { rep: OUV_JUSTES, ...o });

// Les questions au fil : répond au panneau ouvert (réponse de `R`, sinon la juste), puis « Reprendre », tant qu'il y en a une.
const Q_JUSTES = { 'pourquoi-marseille': 'km', 'voyage-bateau': 'conteneurs', 'qui-remarque': 'magasin' };
let Q_REP = Q_JUSTES;
// Le toast (« Fiche envoyée. ») peut couvrir un bouton du bas : un clic à la souris le recevrait. Attendre qu'il parte
// (la carte, plus rapide en mouvement réduit, ne laisse plus ce temps).
const sansToast = () => pg.waitForFunction(() => { const t = document.getElementById('toast'); return !t || t.style.display === 'none'; });
async function qFil() {
  for (let i = 0; i < 4; i++) {
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

// ── « Qui est qui ? » : `vals` = la clé de rôle de chaque ligne, dans l'ordre des lignes.
async function envoyerQui(vals) {
  await aller('fiche');
  for (let i = 0; i < vals.length; i++) await pg.selectOption(`${Z} [data-fiche-champ="acteur-${i + 1}"]`, vals[i]);
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
}
// ── le point d'étape (question A)
async function pointDEtape(rep, continuer = true) {
  await aller('etape:avant-carte');
  await clic(`[data-q-choix="${rep}"][data-q="lien-action-geodis"]`);
  await clic('[data-q-repondre="lien-action-geodis"]');
  await pause();
  if (!continuer) return;
  await clic('[data-q-continuer="avant-carte"]');      // « Continuer » : vers ce que le point d'étape gardait fermé, la carte
  await pause();
}

// ── la carte (vue « Localiser ») : aides reprises du bloc `localiser` (souris sur un point que `elementFromPoint` confirme).
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
// Toute la carte. `fautes` : { 'port:region': 1, … } = le nombre de mauvais clics avant le bon à cette étape. Après chaque étape, la
// question au fil éventuelle (C, après le département de l'entrepôt) est répondue.
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
const TOUT_FAUX_CARTE = Object.fromEntries(['magasin', 'entrepot', 'port', 'labastide'].flatMap((l) => [[`${l}:region`, 1], [`${l}:departement`, 1]]));

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
// ── « La chaîne » : `ordre` = l'ordre voulu (null : ne rien toucher), `place` = la clé choisie.
async function envoyerChaine(ordre, place) {
  await ouvrirParMessage('La chaîne', 'fiche:chaine');
  if (ordre) {
    for (let k = 0; k < ordre.length; k++) {
      for (let s = 0; s < 8; s++) {
        const cur = await pg.$$eval(`${Z} [data-fiche-ordre="ordre"] li`, (L) => L.map((x) => x.dataset.v));
        const j = cur.indexOf(ordre[k]);
        if (j <= k) break;
        await clic(`[data-fiche-ordre="ordre"] li[data-v="${ordre[k]}"] [data-ordre-sens="-1"]`);
        await pause(30);
        await qFil();                  // au premier déplacement : la question D (« dans quoi voyagent-ils ? »)
      }
    }
  }
  await pg.selectOption(`${Z} [data-fiche-champ="place"]`, place);
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
}
// ── « Ce que je change » : `vals` = la clé choisie à chaque ligne.
async function envoyerChange(vals) {
  await ouvrirParMessage('Ce que je change', 'fiche:change');
  for (let i = 0; i < vals.length; i++) await pg.selectOption(`${Z} [data-fiche-champ="situation-${i + 1}"]`, vals[i]);
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  await qFil();                        // la question E, puis D si elle n'est jamais venue (rattrapage)
}

const ORDRE_JUSTE = ['usine', 'bateau', 'havre', 'ensues', 'magasin', 'client'];
// Les réponses justes de a81-juste (écrites à la main, voir l'en-tête).
const JUSTE = { qui: ['stocke', 'possede', 'forme', 'amene'], change: ['tard', 'stock', 'casse'] };
// Le parcours entier. `o` : { qui, etape, carte (fautes), ordre, place, change, q (réponses des questions au fil) }.
async function jouer(o = {}) {
  Q_REP = { ...Q_JUSTES, ...(o.q || {}) };
  await envoyerQui(o.qui || JUSTE.qui);
  await pointDEtape(o.etape || 'contrat');
  await jouerCarte(o.carte || {});
  await envoyerChaine(o.ordre === undefined ? ORDRE_JUSTE : o.ordre, o.place || 'ensues');
  await envoyerChange(o.change || JUSTE.change);
  await qFil();
}

const LIGNES = ['qui-geodis', 'localiser:magasin:region', 'chaine-ordre', 'change-facile', 'question:lien-action-geodis'];
const tout = (etat) => LIGNES.map((l) => [l, etat]);

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.1 : la séance se charge (CAP, CAP-C1.1, guidage, correction, parcours sans précédente, niveaux prévus confirmé + accompagné) ; somme des poids 16 + part 4 = 20 ; ENT-8.2 la suit', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-se-situer.js');
    const S = await import('/contenus/action-ent81.js');
    const Q = await import('/contenus/questions/ENT-8.1.js');
    const B = await import('/activites/action-prise-de-poste.js').then((m) => m.meta).catch((e) => ({ erreur: String(e) }));
    const socle = S.ETAPES.filter((e) => !e.bonus);
    return { meta: A.meta, poids: socle.reduce((s, e) => s + e.poids, 0), n: socle.length, bonus: S.ETAPES.filter((e) => e.bonus).map((e) => e.id),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids]),
      groupes: [...new Set(socle.map((e) => e.groupe))], suite: B.precedente || B.erreur };
  });
  egal([r.meta.code, r.meta.niveaux, r.meta.competences, r.meta.competencesCap, r.meta.temps, r.meta.bareme, r.meta.correction, r.meta.parcours,
    r.meta.precedente, r.meta.niveauxPrevus, r.meta.questions, r.meta.pret, r.meta.ouverture],
  ['ENT-8.1', ['cap'], [], ['CAP-C1.1'], 'guidage', 20, true, true, undefined, ['confirme', 'accompagne'], 'ENT-8.1', true, 'prof'], 'meta');
  proche(r.poids, 16, 'somme des poids des jalons');
  egal([r.n, r.part, r.notees], [15, 4, [['lien-action-geodis', 1.5], ['voyage-bateau', 1.5], ['qui-remarque', 1]]], 'jalons, part, questions notées');
  egal(r.groupes, ['Qui est qui ?', 'La carte de France', 'La chaîne', 'Ce que je change'], 'lignes du bandeau (hors questions)');
  egal(r.bonus, ['localiser:labastide:region', 'localiser:labastide:departement', 'change-bonus'], 'cas bonus');
  egal(r.suite, ID, 'ENT-8.2 suit ENT-8.1');
});

await v('ENT-8.1 : à l’ouverture, le tirage est rangé (graine élève|séance) ; seul le message de Samia (document joint) ; la carte et les fiches suivantes fermées ; rien ne compte les pièces', async () => {
  const db = await monter({ uid: 'a81-juste' });
  egal(db.tirages[ID].graine, `a81-juste|${ID}`, 'graine');
  egal(db.tirages[ID].pieces, { acteurs: ['geodis', 'action', 'lycee', 'transporteur'], situations: ['s-retard', 's-scan', 's-chute'] }, 'pièces');
  egal(db.tirages[ID].valeurs.chaine, ['client', 'ensues', 'havre', 'bateau', 'magasin', 'usine'], 'ordre de départ de la chaîne');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces, m.ouvreFiche]), [['Samia', 'Bienvenue chez Geodis', ['action'], 'qui']], 'messages à l’ouverture');
  vrai(new Date(E[0].ts).getMonth() === 10 && new Date(E[0].ts).getDate() === 8, 'le message n’est pas daté du 8 novembre');
  const M = await menu();
  vrai(M.includes('fermee:localiser') && !M.includes('fiche:chaine') && !M.includes('fiche:change'), 'menu au départ : ' + M.join(', '));
  await aller('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="acteur-"]`, (L) => L.map((x) => x.closest('.champ').querySelector('label').textContent.trim())),
    ['Geodis', 'Action', 'Ton lycée', 'Le transporteur'], 'lignes de la fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ="acteur-1"] option`, (L) => L.map((x) => x.value).filter(Boolean)),
    ['stocke', 'amene', 'possede', 'forme', 'vend', 'achete', 'fabrique'], 'les 7 rôles, dans l’ordre de l’élève');
  // Rien dans la page ne trahit l'acteur d'une ligne (ni id d'acteur dans un attribut).
  const html = await pg.evaluate((Z) => document.querySelector(`${Z} [data-fiche]`).outerHTML, Z);
  vrai(!/acteur-(geodis|action|lycee|transporteur)|data-v="(geodis|lycee)"/.test(html), 'un id d’acteur dans la fiche');
  // (« Lis ces six lignes » est le document, le même pour tous : il ne compte pas les pièces tirées.)
  vrai(!/\b(3|trois|4|quatre|5|cinq|6|six) (acteurs|lieux|situations|lignes|étiquettes)\b/i.test((await texte()).replace(/ces six lignes/g, '')), 'une consigne compte les pièces');
  await capture('1-qui-est-qui');
  // Le document joint, ouvert depuis le message de Samia (le chemin de l'élève).
  if (CAPTURES) {
    await aller('mail');
    await clic(`[data-mail="${E[0].id}"]`);
    await clic('[data-pj="action"]');
    await pause(300);
    await capture('0-document-action-geodis');
  }
});

await v('ENT-8.1 : inaction — rien fait → 0/20, rien de jugé « juste », pas de bandeau de fin', async () => {
  await monter({ uid: 'a81-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
});

await v('ENT-8.1 : parcours juste (standard), ouverture répondue toute fausse — 20/20, bandeau 5 lignes ✓, messages de Samia dans l’ordre, C posée une fois au département de l’entrepôt (non notée), séance finie (ENT-8.2 ouverte)', async () => {
  await monter({ uid: 'a81-juste', rep: OUV_FAUSSES });
  await envoyerQui(JUSTE.qui);
  // Le point d'étape garde la carte fermée jusqu'à la réponse.
  vrai((await menu()).includes('fermee:localiser'), 'la carte est ouverte avant la réponse au point d’étape');
  await pointDEtape('contrat');
  vrai((await menu()).includes('localiser'), 'la carte reste fermée après la réponse');
  let cAvant = null;
  await jouerCarte({}, { avant: async (x) => {
    const q = ((await base()).questions[ID] || {})['pourquoi-marseille'];
    if (x.lieu === 'entrepot' && x.etape === 'ville') cAvant = !!(q && q.arrivee);
    if (x.lieu === 'entrepot' && x.etape === 'departement') vrai(!q, 'C est arrivée avant le département de l’entrepôt');
    if (x.lieu === 'entrepot' && x.etape === 'departement' && CAPTURES) await capture('2-carte-departement');
  } });
  egal(cAvant, true, 'C est arrivée au département de l’entrepôt');
  await pg.evaluate(() => window.scrollTo(0, 0));
  await capture('3-carte-fin');
  vrai(/imaginé pour l’exercice/.test(await pg.textContent(`${R} [data-lc-fin]`)), 'texte de fin : le trajet est dit construit');
  await envoyerChaine(ORDRE_JUSTE, 'ensues');
  await envoyerChange(JUSTE.change);
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(await bandeau(), tout('ok'), 'bandeau');
  egal((await entrants()).map((m) => m.subject), ['Bienvenue chez Geodis', 'La carte de France', 'La chaîne', 'Ce que je change', 'Merci pour ce premier jour'], 'messages');
  vrai(/camion du Havre/.test((await entrants()).pop().text), 'amorce d’ENT-8.2');
  const b = await base();
  vrai(!!b.points[ID], 'photo de fin (ENT-8.2 ouverte sans l’enseignant)');
  egal([b.questions[ID]['pourquoi-marseille'].premiere, Object.keys(n.detail).filter((k) => /pourquoi-marseille/.test(k))], ['km', []], 'C : rangée, non notée');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
  await pg.evaluate(() => window.scrollTo(0, 0));
  await capture('6-bandeau-fin');
});

await v('ENT-8.1 : pire cas — tout faux (fiches, carte au premier essai, questions) → premier bilan, 0/20, 5 lignes ✗, ENT-8.2 ouverte sans l’enseignant ; la carte s’ouvre après une réponse fausse ; « Corriger » proposé, `finFige` dit que la carte ne se rejoue pas', async () => {
  await monter({ uid: 'a81-faux' });
  await envoyerQui(['vend', 'vend', 'vend', 'vend']);
  await pointDEtape('aucun');
  vrai(await present('[data-lc]'), '« Continuer » n’ouvre pas la carte après une réponse fausse');
  vrai((await menu()).includes('localiser'), 'la carte reste fermée au menu après une réponse fausse');
  Q_REP = { 'pourquoi-marseille': 'pas-pense', 'voyage-bateau': 'camions', 'qui-remarque': 'geodis' };
  await jouerCarte(TOUT_FAUX_CARTE);
  await envoyerChaine(['client', 'usine', 'bateau', 'havre', 'ensues', 'magasin'], 'client');
  await envoyerChange(['rien', 'rien', 'rien']);
  await qFil();
  const n = await note();
  egal(n.score, 0, 'note');
  egal(await bandeau(), tout('ko'), 'bandeau');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  vrai(/ne se rejouent pas/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
  vrai(!!(await base()).points[ID], 'photo de fin : ENT-8.2 s’ouvrirait sans l’enseignant');
  Q_REP = Q_JUSTES;
});

await v('ENT-8.1 : « Qui est qui ? » — Action répondu « vend les produits aux clients » → bloc 1 ✗ seul (19/20) ; « Corriger » rouvre la fiche, pas la carte ; renvoi juste → accusé de Samia, note moyennée 19,5', async () => {
  await monter({ uid: 'a81-juste' });
  await jouer({ qui: ['stocke', 'vend', 'forme', 'amene'] });
  egal(await bandeau(), LIGNES.map((l) => [l, l === 'qui-geodis' ? 'ko' : 'ok']), 'bandeau');
  proche((await note()).score, 19, 'premier bilan');
  const carteAvant = JSON.stringify((await base()).localiser);
  await clic('[data-fin-corriger]');
  await pause();
  const b = await base();
  egal([!!b.fiches.qui.envoye, !!b.fiches.chaine.envoye, !!b.fiches.change.envoye], [false, true, true], 'fiches rouvertes');
  egal(JSON.stringify(b.localiser), carteAvant, 'la carte a bougé');
  vrai(await present('[data-fiche="qui"] [data-fiche-envoyer]'), 'la fiche n’est pas rouverte à l’écran');
  vrai((await menu()).includes('localiser'), 'la carte se referme pendant la correction');
  const avant = (await entrants()).length;
  await pg.selectOption(`${Z} [data-fiche-champ="acteur-2"]`, 'possede');
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  egal((await entrants()).slice(avant).map((m) => [m.from, m.subject, m.text]), [['Samia', 'RE : Qui est qui ?', 'Merci, j’ai ta nouvelle fiche.\n\nSamia']], 'accusé');
  proche((await note()).score, 19.5, 'note moyennée');
  egal(await bandeau(), tout('ok'), 'bandeau après correction');
});

await v('ENT-8.1 : bilan détaillé (CAP) — l’acteur faux nommé comme sur la fiche (jamais son rôle), la situation fausse par son rang sur la fiche (ordre tiré) ; « Corriger dans « Ce que je change » » ouvre cette fiche', async () => {
  await monter({ uid: 'a81-juste' });
  await jouer({ qui: ['stocke', 'vend', 'forme', 'amene'], change: ['tard', 'stock', 'rien'] });
  const L = await pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.children[1].textContent.trim(), l.dataset.finCaseEtat, l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
  const noms = await pg.evaluate(async () => { const D = await import('/contenus/action-ent81-donnees.js'); return D.acteursDe(window.__f.db).map((p) => p.nom); });
  const ko = L.filter(([, e]) => e === 'ko');
  egal(ko, [[`Qui est qui ? : ${noms[1]}`, 'ko', 'fiche:qui'], ['Ce que je change : la situation n° 3', 'ko', 'fiche:change']], 'lignes fausses');
  egal(L.filter(([t]) => /^Qui est qui/.test(t)).map(([t]) => t).sort(), noms.map((n) => `Qui est qui ? : ${n}`).sort(), 'les 4 acteurs, par leur nom');
  vrai(!L.some(([t]) => /(n° \d\)$)/.test(t) && /^Qui est qui/.test(t)), 'pas de « n° » ajouté aux acteurs');
  await clic('[data-fin-aller="fiche:change"]');
  await pause();
  vrai(await present('[data-fiche="change"] [data-fiche-envoyer]'), 'la fiche « Ce que je change » est ouverte');
  egal(await pg.$$eval(`${Z} [data-acorriger] [data-acorr]`, (L) => L.map((l) => l.dataset.acorr)), ['fiche:qui', 'fiche:change'], 'liste « À corriger »');
});

await v('ENT-8.1 : étape suivante (CAP) — « Qui est qui ? », puis le point d’étape qui garde la carte, puis la carte ; chaque « Y aller » ouvre l’écran nommé', async () => {
  const barre = () => pg.$eval(`${Z} [data-suite-seance]`, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
  await monter({ uid: 'a81-juste' });
  egal(await barre(), 'Étape suivante : Qui est qui ? Y aller →', 'au départ');
  await envoyerQui(JUSTE.qui);
  egal(await barre(), 'Étape suivante : Point d’étape avec Samia Y aller →', 'la carte est gardée par le point d’étape');
  await clic('[data-suite-aller]'); await pause();
  vrai(await present('[data-q="lien-action-geodis"]'), 'le point d’étape s’ouvre');
  await clic('[data-q-choix="contrat"][data-q="lien-action-geodis"]');
  await clic('[data-q-repondre="lien-action-geodis"]'); await pause();
  egal(await barre(), 'Étape suivante : Carte de France Y aller →', 'après le point d’étape');
  await clic('[data-suite-aller]'); await pause();
  vrai(await present('[data-lc]'), 'la carte s’ouvre');
  egal(await barre(), '', 'pas de barre sur la carte');
});

await v('ENT-8.1 : carte — une erreur à la région du port → bloc « La carte » ✗ seul (19,25/20) ; erreurs à la ville seulement → bloc ✓ (20/20)', async () => {
  await monter({ uid: 'a81-juste' });
  await jouer({ carte: { 'port:region': 1 } });
  egal(await bandeau(), LIGNES.map((l) => [l, l === 'localiser:magasin:region' ? 'ko' : 'ok']), 'bandeau (région du port)');
  proche((await note()).score, 19.25, 'note');
  const d = (await note()).detail;
  egal(['magasin', 'entrepot', 'port'].flatMap((l) => ['region', 'departement'].map((e) => d[`localiser:${l}:${e}`])), ['ok', 'ok', 'ok', 'ok', 'ko', 'ok'], 'jalons de la carte');
  await monter({ uid: 'a81-juste' });
  await jouer({ carte: { 'magasin:ville': 2, 'entrepot:ville': 1, 'port:ville': 3 } });
  egal([await bandeau(), (await note()).score], [tout('ok'), 20], 'erreurs à la ville seulement');
  vrai(((await base()).indicateurs[ID].localiser || {}).port, 'les erreurs à la ville ne sont pas au repérage');
});

await v('ENT-8.1 : « La chaîne » — envoyée sans toucher l’ordre → ordre ✗ (17,5/20) ; la question D arrive quand même (rattrapage), « Merci, je note », corrigée au bilan', async () => {
  await monter({ uid: 'a81-juste' });
  await jouer({ ordre: null });
  const d = (await note()).detail;
  egal([d['chaine-ordre'], d['chaine-place']], ['ko', 'ok'], 'jalons de la chaîne');
  egal((await base()).fiches.chaine.valeurs.ordre, ['client', 'ensues', 'havre', 'bateau', 'magasin', 'usine'], 'ordre envoyé = ordre de départ');
  proche((await note()).score, 17.5, 'note');
  egal((await base()).questions[ID]['voyage-bateau'].premiere, 'conteneurs', 'D répondue (rattrapage)');
  vrai(await present('[data-fin-retour="voyage-bateau"]'), 'le retour de D vient avec le bandeau');
});

await v('ENT-8.1 : questions — D au premier déplacement d’une étiquette (« Merci, je note », pas de ✓ / ✗), E affiche la 1re situation de l’élève', async () => {
  await monter({ uid: 'a81-juste' });
  Q_REP = Q_JUSTES;
  await envoyerQui(JUSTE.qui);
  await pointDEtape('contrat');
  await jouerCarte({});
  await ouvrirParMessage('La chaîne', 'fiche:chaine');
  await capture('4-la-chaine');
  await clic('[data-fiche-ordre="ordre"] li[data-v="usine"] [data-ordre-sens="-1"]');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'voyage-bateau', 'D au premier déplacement');
  await clic('[data-q-choix="camions"][data-q="voyage-bateau"]');
  await clic('[data-q-repondre="voyage-bateau"]');
  await pause();
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'D : « Merci, je note » sans verdict');
  await clic('[data-q-reprendre]');
  await pause();
  await envoyerChaine(ORDRE_JUSTE, 'ensues');
  await ouvrirParMessage('Ce que je change', 'fiche:change');
  await capture('5-ce-que-je-change');
  for (const [i, x] of JUSTE.change.entries()) await pg.selectOption(`${Z} [data-fiche-champ="situation-${i + 1}"]`, x);
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'qui-remarque', 'E à l’envoi');
  vrai((await pg.textContent(`${Z} [data-q-panneau]`)).includes('« Tu finis ta préparation avec une heure de retard. »'), 'E ne montre pas la situation de l’élève');
  await qFil();
  const d = (await note()).detail;
  egal([d['question:voyage-bateau'], d['question:qui-remarque'], d['question:lien-action-geodis']], ['ko', 'ok', 'ok'], 'questions notées');
  proche((await note()).score, 18.5, 'note');
});

await v('ENT-8.1 : tirage stable — mêmes acteurs, situations et ordre après rechargement et sur un autre poste ; deux voisins n’ont pas le même jeu', async () => {
  const a = await monter({ uid: 'a81-juste' });
  const b = await monter({ uid: 'a81-juste', db: a });
  egal(b.tirages[ID], a.tirages[ID], 'tirage après rechargement');
  const c = await monter({ uid: 'a81-juste' });
  egal([c.tirages[ID].pieces, c.tirages[ID].valeurs], [a.tirages[ID].pieces, a.tirages[ID].valeurs], 'tirage sur un autre poste');
  const d = await monter({ uid: 'a81-faux' });
  vrai(JSON.stringify(d.tirages[ID].pieces) !== JSON.stringify(a.tirages[ID].pieces), 'même jeu que le voisin');
});

await v('ENT-8.1 : équité sur 300 graines — Geodis toujours là, mélanges 1 + 1 + 1 (acteurs et situations), ordre de départ jamais juste, zéro secours ; confirmé = même socle + 1 situation moyenne ; la règle de l’ordre n’est pas décorative', async () => {
  const r = await pg.evaluate(async (ID) => {
    const D = await import('/contenus/action-ent81-donnees.js');
    const { declarerTirage } = await import('/core/tirage.js');
    const juste = (o) => JSON.stringify(o) === JSON.stringify(D.ORDRE_JUSTE);
    const dif = (b, id) => (D.TIRAGE.decl.banques[b].pieces.find((p) => p.id === id) || {}).difficulte || 'fixe';
    const compte = (b, L) => ['fixe', 'facile', 'moyen', 'difficile'].map((d) => L.filter((x) => dif(b, x) === d).length).join();
    const fautes = [];
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}|${ID}`, s = D.TIRAGE.tirer(g), c = D.TIRAGE.tirer(g, { confirme: true });
      if (s.secours || c.secours) fautes.push(`${i} secours`);
      if (compte('acteurs', s.pieces.acteurs) !== '1,1,1,1' || !s.pieces.acteurs.includes('geodis')) fautes.push(`${i} acteurs ${s.pieces.acteurs}`);
      if (compte('situations', s.pieces.situations) !== '0,1,1,1') fautes.push(`${i} situations ${s.pieces.situations}`);
      if (juste(s.valeurs.chaine) || s.valeurs.chaine.slice().sort().join() !== D.ORDRE_JUSTE.slice().sort().join()) fautes.push(`${i} chaîne ${s.valeurs.chaine}`);
      if (JSON.stringify(c.pieces) !== JSON.stringify(s.pieces) || JSON.stringify(c.valeurs) !== JSON.stringify(s.valeurs)) fautes.push(`${i} socle du confirmé`);
      const B = (c.bonus || {}).situations || [];
      if (B.length !== 1 || dif('situations', B[0]) !== 'moyen' || s.pieces.situations.includes(B[0])) fautes.push(`${i} bonus ${B}`);
      if (s.bonus) fautes.push(`${i} bonus d’un standard`);
    }
    // La même déclaration sans la règle : sur 3 000 graines, des ordres de départ justes passent (le contrôle ne prouve rien sinon).
    const sansRegle = declarerTirage({ banques: D.TIRAGE.decl.banques, valeurs: D.TIRAGE.decl.valeurs });
    let justes = 0;
    for (let i = 0; i < 3000; i++) if (juste(sansRegle.tirer(`eleve-${i}|${ID}`).valeurs.chaine)) justes++;
    return { fautes, justes };
  }, ID);
  if (r.fautes.length) throw new Error(r.fautes.slice(0, 6).join(' / '));
  vrai(r.justes > 0, 'sans la règle, aucun ordre de départ juste sur 3 000 graines : le contrôle ne prouve rien');
});

await v('ENT-8.1 : confirmé (a81-juste) — 4 lieux, 4 situations, bandeau identique ligne pour ligne à un standard, mot « bonus » absent ; cas bonus faux → 20/20 (note du socle inchangée), cas bonus comptés au détail', async () => {
  await monter({ uid: 'a81-juste', aisance: 'confirme' });
  await envoyerQui(JUSTE.qui);
  await pointDEtape('contrat');
  await aller('localiser');
  egal((await pg.textContent(`${R} [data-lc-compteur]`)).trim(), 'Lieu 1 sur 4', 'compteur de la carte');
  Q_REP = Q_JUSTES;
  await jouerCarte({ 'labastide:region': 1, 'labastide:departement': 1 });
  await envoyerChaine(ORDRE_JUSTE, 'ensues');
  await ouvrirParMessage('Ce que je change', 'fiche:change');
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="situation-"]`, (L) => L.length), 4, 'lignes de « Ce que je change »');
  await envoyerChange([...JUSTE.change, 'rien']);
  const n = await note();
  egal([n.score, await bandeau()], [20, tout('ok')], 'note et bandeau');
  egal([n.detail.bonus.justes, n.detail.bonus.total, n.detail.bonus.etats],
    [0, 3, { 'localiser:labastide:region': 'ko', 'localiser:labastide:departement': 'ko', 'change-bonus': 'ko' }], 'cas bonus');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-8.1 : accompagné (a81-acc) — la carte nomme les départements, les fiches sont celles d’un standard (même tirage, aucun cas bonus)', async () => {
  const a = await monter({ uid: 'a81-acc', aisance: 'accompagne' });
  const s = await pg.evaluate(async (ID) => (await import('/contenus/action-ent81-donnees.js')).TIRAGE.tirer(`a81-acc|${ID}`), ID);
  egal([a.aisance, a.tirages[ID].pieces, a.tirages[ID].valeurs, a.tirages[ID].bonus], ['accompagne', s.pieces, s.valeurs, undefined], 'tirage');
  egal(a.tirages[ID].pieces.acteurs, ['action', 'geodis', 'client', 'transporteur'], 'acteurs (écrits à la main)');
  await envoyerQui(['possede', 'stocke', 'achete', 'amene']);
  await pointDEtape('contrat');
  await aller('localiser');
  await carteJuste();
  vrai(/Hérault/.test(await pg.textContent(`${R} [data-ct-svg]`)), 'l’accompagné ne lit pas les noms des départements');
  await monter({ uid: 'a81-acc', aisance: 'standard' });
  await envoyerQui(['possede', 'stocke', 'achete', 'amene']);
  await pointDEtape('contrat');
  await aller('localiser');
  await carteJuste();
  vrai(!/Hérault/.test(await pg.textContent(`${R} [data-ct-svg]`)), 'le standard lit les noms des départements');
});

await v('ENT-8.1 : « Avant de commencer » — 3 notions + 1 image tirées et rangées, menu fermé jusqu’aux réponses ; code postal jamais 30, 13, 76, 82 sur 300 graines ; rien n’entre dans la note', async () => {
  await monter({ uid: 'a81-ouv', sansOuverture: true });
  egal((await menu()).filter((x) => !x.startsWith('fermee:')), ['ouverture'], 'entrées ouvertes au départ');
  const T = (await base()).questions[ID]['@tirage'];
  const rub = await pg.evaluate(async (ids) => { const Q = (await import('/contenus/questions/ENT-8.1.js')).QUESTIONS; return ids.map((id) => Q.liste.find((q) => q.id === id).rubrique); }, T.ids);
  egal(rub.slice().sort(), ['image', 'preparation', 'preparation', 'preparation'], 'rubriques tirées');
  const r = await pg.evaluate(async () => {
    const { varianteCodePostal, VILLES_CP } = await import('/contenus/questions/ENT-8.1.js');
    const { hasard } = await import('/core/tirage.js');
    const fautes = [], villes = new Set();
    for (let i = 0; i < 300; i++) {
      const x = varianteCodePostal(hasard(`eleve-${i}|cp`));
      const L = Object.values(x.libs);
      if (L.some((l) => /\ble (30|13|76|82)\b/.test(l)) || new Set(L).size !== 3 || /undefined/.test(L.join() + x.enonce + x.retour)) fautes.push(`${i} ${L.join(' / ')}`);
      if (!x.libs.debut.startsWith(`le ${/(\d{5})/.exec(x.enonce)[1].slice(0, 2)} `)) fautes.push(`${i} juste ${x.libs.debut}`);
      villes.add(x.enonce);
    }
    return { fautes, villes: villes.size, n: VILLES_CP.length };
  });
  egal([r.fautes, r.villes], [[], r.n], 'code postal');
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /ouverture|code-postal|img-/.test(k)), 'une question d’ouverture est notée');
});

await v('ENT-8.1 : socle — aucune adresse hors du site, aucune erreur JavaScript ; le corrigé de l’enseignant se calcule pour un élève (acteurs, carte lieu par lieu, situations, bonus marqués)', async () => {
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-8.1.js');
    const S = await import('/contenus/action-ent81-donnees.js');
    const g = 'a81-conf|action-se-situer';
    const base = { tirages: { 'action-se-situer': { graine: g, ...S.TIRAGE.tirer(g, { confirme: true }) } } };
    const e = C.corrigeEleve(base, 'a81-conf');
    return { n: C.CORRIGE.items.length, items: e.items.map((x) => [x.texte, x.rep, !!x.bonus]) };
  });
  vrai(c.n >= 4, 'corrigé commun');
  vrai(c.items.some(([t, r, b]) => /Labastide/.test(t) && /Tarn-et-Garonne \(82\)/.test(r) && b), 'Labastide marquée bonus');
  vrai(c.items.some(([t, r]) => /Hub d’import/.test(t) && /Normandie \(28\)/.test(r) && /Seine-Maritime \(76\)/.test(r) && /Gonfreville/.test(r)), 'le port lieu par lieu');
  vrai(c.items.some(([t, , b]) => /ligne 4/.test(t) && b), 'situation bonus marquée');
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await ctx81.close();
}
