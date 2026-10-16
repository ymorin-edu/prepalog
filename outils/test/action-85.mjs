// Suite de tests de Prepalog — bloc « action-85 » : Action ENT-8.5, évaluation « se situer dans un nouveau site » (CAP OL, évaluation
// CAP-C1.1, copie rendue). `node outils/test.mjs action-85` ne lance que ce bloc. Brief : `docs/briefs/ENT-8.5-action-evaluation-se-situer.md`
// §8 ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §7.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/action-evaluation-se-situer.js` →
// `rendre`, `noter`), de vrais clics à la SOURIS ; les listes des fiches par `selectOption`. Les GRAINES sont choisies ici (l’identifiant de
// l’élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le tirage le 16/10/2026), jamais recalculées par le
// code de la séance :
//
//   a85-a → site ONNAING (GXO, magasin de La Sentinelle, Karim) : carte entrepôt Hauts-de-France (32) / Nord (59), magasin 32 / 59, port
//     Normandie (28) / Seine-Maritime (76) ; « Qui est qui ? », dans l’ordre des lignes : le client (achète), Action (possède), le
//     transporteur (emmène), le magasin de La Sentinelle (vend) ; chaîne au départ q w r z t k ; situations : s-retard (moyen, « tard »),
//     s-scan (difficile, « stock »), s-film (facile, « casse ») ; ouverture tirée : k-img-rack, k-chaine, k-tuteur, k-port.
//   a85-b → site BELLEVILLE (Kuehne+Nagel, magasin de Villefranche-sur-Saône, Sandrine) : carte entrepôt Auvergne-Rhône-Alpes (84) / Rhône
//     (69), magasin 84 / 69, port 28 / 76 ; lignes : ton lycée (forme), un fournisseur (fabrique), Action (possède), Kuehne+Nagel (stocke) ;
//     chaîne au départ q t r k z w ; situations : s-emplacement (moyen, « introuvable »), s-reserve (difficile, « abime »), s-cartons (facile,
//     « manque ») ; ouverture tirée : k-regions, k-img-planchers, k-chaine, k-ouverture.
//
// Barème (brief §5) : carte 4,5 (0,75 × 6) · Qui est qui ? 4 (1 × 4) · chaîne 3,5 (début 1,25, fin 1,25, place 1) · Ce que je change 4
// (facile 1, moyenne 1,5, difficile 1,5) · Avant de commencer 4 (`part`). Ce qui vaut son prix : les deux témoins justes à 20 (un par site)
// et la remise (note du Suivi = `noter`), le parcours de l’un joué par l’autre, l’équité du tirage (sites, moitiés de chaîne jamais justes
// au départ, paires exclues), le même site qu’en ENT-8.6, l’inaction à 0, rien qui dise juste ou faux, le niveau standard pour tous.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'action-evaluation-se-situer';
const ID86 = 'action-evaluation-prise-de-poste';
const ctx85 = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctx85.newPage();
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
const CAPTURES = process.env.CAPTURES_ENT85 || '';
const pause = (ms = 80) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
const noter = () => pg.evaluate(async () => { const A = await import('/activites/action-evaluation-se-situer.js'); return A.noter(window.__f.db); });
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
const menu = () => pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => (b.dataset.vue ? b.dataset.vue : `fermee:${b.dataset.vueFermee}`)));
const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };
const capture = async (nom) => { if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/${nom}.png` }); };
const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
// Les mots qui jugent : jamais à l'écran d'une évaluation (« Bien vu », « Bravo », « juste », « faux », « erreur », « correct »).
// La phrase du moteur sur le barème (« Une réponse fausse retire des points… ») et les textes des choix de la banque ne jugent rien.
const PENALITE = 'Une réponse fausse retire des points. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien.';
const ATTENTE = 'Réponds à toutes les questions pour continuer : une réponse fausse ne bloque pas.';
const CONTENU = /son stock est faux/g;
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse)\b/i;

async function clic(sel) {
  const el = await pg.waitForSelector(`${Z} ${sel}`, { state: 'visible' });
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  vrai(b && b.width > 0 && b.height > 0, `« ${sel} » n’a pas de place à l’écran`);
  await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}
const aller = async (vue) => { await clic(`.ent-nav[data-vue="${vue}"]`); await pause(); };

// Les réponses justes de l'ouverture (toute la banque) ; « @nsp » = « Je ne sais pas » (clé du moteur).
const OUV_JUSTES = { 'k-vend': 'petitprix', 'k-entrepot': 'stocker', 'k-chaine': 'chaine', 'k-regions': 'departements', 'k-memes': 'memes',
  'k-ouverture': 'remplir', 'k-port': 'bateaux', 'k-tuteur': 'entreprise', 'k-img-semi': 'transporter', 'k-img-palette': 'tenir',
  'k-img-rack': 'racks', 'k-img-planchers': 'plus' };

// Monte la séance comme le site. `o.db` : base de départ (copiée) ; `o.uid` ; `o.aisance` ; `o.rep` : réponses d'ouverture rangées
// d'avance (défaut : toutes justes) ; `o.sansOuverture` : rien de répondu.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-evaluation-se-situer.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['action-evaluation-se-situer'] = db.questions['action-evaluation-se-situer'] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'a85-a' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { rep: OUV_JUSTES, ...o });

// ── la carte (vue « Localiser », en évaluation) : aides reprises du bloc `action-83`.
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
const panneau = () => pg.$eval(`${R} [data-lc-panneau]`, (p) => { const c = p.cloneNode(true); c.querySelectorAll('.lc-lieu, [data-lc-indice]').forEach((x) => x.remove()); return c.textContent; });
// Toute la carte. `fautes` : { 'entrepot:region': 1 } = mauvais clics avant le bon ; `premiers` : { 'entrepot:region': '32' } = la clé
// cliquée d'abord (la réponse d'un autre site) ; `vus` : les textes du panneau, relevés à chaque étape.
async function jouerCarte({ fautes = {}, premiers = {}, vus = null } = {}) {
  await aller('localiser');
  for (let k = 0; k < 4; k++) {
    const l = await lire();
    if (l.etape === 'fin') break;
    for (const et of ['region', 'departement', 'ville']) {
      const x = await lire();
      const p = premiers[`${x.lieu}:${et}`];
      if (p) { await cliquerCarte(p); await pg.waitForTimeout(60); if (vus) vus.push(await panneau()); }
      for (let f = 0; f < (fautes[`${x.lieu}:${et}`] || 0); f++) { await carteFaux(); if (vus) vus.push(await panneau()); }
      if ((await lire()).etape === et && (await lire()).lieu === x.lieu) await carteJuste();
      if (vus) vus.push(await panneau());
    }
    const n = await pg.$eval(`${R} [data-lc-bouton]`, (b) => b.dataset.lcBouton);
    await boutonCarte(n);
    if (vus) vus.push(await panneau().catch(() => ''));
    if (n === 'bilan') break;
  }
}
// La réponse « carte » d'un site, pour la jouer chez l'autre : la région puis le département de l'entrepôt, puis du magasin.
// (Au département, la vue ne montre que ceux de la bonne région : le Nord n’y est pas cliquable, on joue alors un autre département.)
const CARTE_ONNAING = { premiers: { 'entrepot:region': '32', 'magasin:region': '32' }, fautes: { 'entrepot:departement': 1, 'magasin:departement': 1 } };

// Le chemin de l'élève vers une fiche qui vient d'arriver : la carte « Nouveau message » (ou la Messagerie), puis le bouton du message.
async function ouvrirParMessage(sujet, vue) {
  const id = await pg.evaluate((s) => (window.__f.db.mails.find((m) => m.folder === 'in' && m.subject === s) || {}).id, sujet);
  vrai(id != null, `le message « ${sujet} » n’est pas arrivé`);
  if (await present(`[data-carte-lire="${id}"]`)) await clic(`[data-carte-lire="${id}"]`);
  else { await aller('mail'); await clic(`[data-mail="${id}"]`); }
  await pause();
  await clic(`[data-vue2="${vue}"]`);
  await pause();
}
async function envoyer() { await clic('[data-fiche-envoyer]'); await clic('[data-confirme-oui]'); await pause(); }
// « Qui est qui ? » : `vals` = le rôle choisi à chaque ligne (null : laissée vide).
async function envoyerQui(vals) {
  await ouvrirParMessage('Qui est qui ?', 'fiche');
  for (let i = 0; i < vals.length; i++) if (vals[i]) await pg.selectOption(`${Z} [data-fiche-champ="acteur-${i + 1}"]`, vals[i]);
  await envoyer();
}
// « La chaîne » : `ordre` = l'ordre voulu (null : ne rien toucher), `place` = la clé choisie (null : vide).
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
      }
    }
  }
  if (place) await pg.selectOption(`${Z} [data-fiche-champ="place"]`, place);
  await envoyer();
}
async function envoyerChange(vals) {
  await ouvrirParMessage('Ce que je change', 'fiche:change');
  for (let i = 0; i < vals.length; i++) if (vals[i]) await pg.selectOption(`${Z} [data-fiche-champ="situation-${i + 1}"]`, vals[i]);
  await envoyer();
}
const ORDRE = ['q', 'w', 'k', 'r', 't', 'z'];
// Les réponses justes des deux témoins (écrites à la main, voir l'en-tête).
const JUSTE = {
  'a85-a': { qui: ['achete', 'possede', 'emmene', 'vend'], change: ['tard', 'stock', 'casse'] },
  'a85-b': { qui: ['forme', 'fabrique', 'possede', 'stocke'], change: ['introuvable', 'abime', 'manque'] },
};
async function jouer(uid, o = {}) {
  await jouerCarte(o.carte || {});
  await envoyerQui(o.qui || JUSTE[uid].qui);
  await envoyerChaine(o.ordre === undefined ? ORDRE : o.ordre, o.place === undefined ? 'r' : o.place);
  await envoyerChange(o.change || JUSTE[uid].change);
}
const detail = async () => (await noter()).detail;
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.5 : la séance se charge (CAP, CAP-C1.1, évaluation en copie, sans parcours) ; poids jalon par jalon 16 + ouverture 4 = 20 ; aucun jalon bonus ; banque d’ouverture 8 + 3 actives (k-img-palette mise de côté), sans aide ni mot cliquable', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-evaluation-se-situer.js');
    const S = await import('/contenus/action-ent85.js');
    const Q = await import('/contenus/questions/ENT-8.5.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, poids: Object.fromEntries(S.ETAPES.map((e) => [e.id, e.poids])), bonus: S.ETAPES.filter((e) => e.bonus).length,
      groupes: S.ETAPES.reduce((g, e) => { g[e.groupe] = (g[e.groupe] || 0) + e.poids; return g; }, {}),
      ouv: { part: Q.QUESTIONS.ouverture.part, tirage: Q.QUESTIONS.ouverture.tirage,
        prep: L.filter((q) => q.rubrique === 'preparation' && q.actif !== false).length, image: L.filter((q) => q.rubrique === 'image' && q.actif !== false).length,
        inactives: L.filter((q) => q.actif === false).map((q) => q.id), aides: L.filter((q) => q.aide != null).length, fil: L.filter((q) => q.type !== 'ouverture').length,
        mots: L.filter((q) => (q.enonce + q.choix.map((c) => c.lib).join(' ')).includes('[[')).length },
      lexique: Object.keys(S.OPTIONS.lexique).length };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, m.parcours, m.precedente, m.correction],
    ['ENT-8.5', ['cap'], [], ['CAP-C1.1'], 'evaluation', 20, true, 'ENT-8.5', true, 'prof', undefined, undefined, undefined], 'meta');
  egal(r.poids, { 'localiser:entrepot:region': 0.75, 'localiser:entrepot:departement': 0.75, 'localiser:magasin:region': 0.75,
    'localiser:magasin:departement': 0.75, 'localiser:port:region': 0.75, 'localiser:port:departement': 0.75,
    'qui-action': 1, 'qui-facile': 1, 'qui-moyen': 1, 'qui-difficile': 1,
    'chaine-debut': 1.25, 'chaine-fin': 1.25, 'chaine-place': 1,
    'change-facile': 1, 'change-moyen': 1.5, 'change-difficile': 1.5 }, 'poids jalon par jalon (brief §5)');
  egal(r.groupes, { 'La carte de France': 4.5, 'Qui est qui ?': 4, 'La chaîne': 3.5, 'Ce que je change': 4 }, 'poids par bloc');
  egal(r.bonus, 0, 'jalons bonus');
  egal(r.ouv, { part: 4, tirage: { preparation: 3, image: 1 }, prep: 8, image: 3, inactives: ['k-img-palette'], aides: 0, fil: 0, mots: 0 }, 'ouverture');
  egal(r.lexique, 0, 'mots cliquables');
});

await v('ENT-8.5 : la carte des DEUX sites passe le contrôle de la vue (points dans leur département, 3 autres villes à plus de 8 km, indices) ; mêmes ids de lieux ; aucun lieu bonus ; le port d’ENT-8.1', async () => {
  const r = await pg.evaluate(async () => {
    const { controlerLocaliser } = await import('/core/types/localiser.js');
    const S = await import('/contenus/action-ent85.js');
    const E = await import('/contenus/action-eval-sites.js');
    const out = {};
    for (const site of E.IDS_SITES) {
      const L = { ...S.LOCALISER, lieux: E.SITES[site].lieux };
      let faute = null;
      try { controlerLocaliser(L); } catch (e) { faute = e.message; }
      out[site] = { faute, lieux: L.lieux.map((l) => [l.id, l.region, l.dep, l.ville, !!l.bonus]) };
    }
    return out;
  });
  egal(r.onnaing, { faute: null, lieux: [['entrepot', '32', '59', 'Onnaing', false], ['magasin', '32', '59', 'La Sentinelle', false],
    ['port', '28', '76', 'Gonfreville-l’Orcher', false]] }, 'Onnaing');
  egal(r.belleville, { faute: null, lieux: [['entrepot', '84', '69', 'Belleville-en-Beaujolais', false], ['magasin', '84', '69', 'Villefranche-sur-Saône', false],
    ['port', '28', '76', 'Gonfreville-l’Orcher', false]] }, 'Belleville');
});

// ─────────────────────────────────────────────────────────── le site tiré : équité, même site qu’en ENT-8.6
await v('ENT-8.5 : le site — 200 graines : chaque site entre 40 et 60 % ; même site qu’en ENT-8.6 pour 50 élèves (graines de séance différentes) ; base vide : Onnaing ; les deux témoins', async () => {
  const r = await pg.evaluate(async ({ ID, ID86 }) => {
    const E = await import('/contenus/action-eval-sites.js');
    let onnaing = 0;
    for (let i = 0; i < 200; i++) if (E.siteDe(`eleve-${i}`) === 'onnaing') onnaing++;
    const diff = [];
    for (let i = 0; i < 50; i++) {
      const uid = `cap-${i}`;
      const b85 = { tirages: { [ID]: { graine: `${uid}|${ID}` } } }, b86 = { tirages: { [ID86]: { graine: `${uid}|${ID86}` } } };
      if (E.siteDeBase(b85, ID).id !== E.siteDeBase(b86, ID86).id || E.siteDeBase(b85, ID).id !== E.siteDe(uid)) diff.push(uid);
    }
    const sites = new Set(Array.from({ length: 50 }, (_, i) => E.siteDe(`cap-${i}`)));
    return { onnaing, diff, deux: sites.size, vide: E.siteDeBase({}, ID).id, a: E.siteDe('a85-a'), b: E.siteDe('a85-b') };
  }, { ID, ID86 });
  vrai(r.onnaing >= 80 && r.onnaing <= 120, `répartition : ${r.onnaing} Onnaing sur 200`);
  egal(r.diff, [], 'élèves dont le site change entre ENT-8.5 et ENT-8.6');
  egal(r.deux, 2, 'les 50 élèves n’ont pas tous le même site');
  egal([r.vide, r.a, r.b], ['onnaing', 'onnaing', 'belleville'], 'base vide, témoins');
});

// ─────────────────────────────────────────────────────────── l’ouverture
await v('ENT-8.5 : à l’ouverture — tirage rangé (graine de l’élève + séance), menu fermé jusqu’aux réponses ; 4 questions (3 + 1), « Je ne sais pas » en dernier, aucune aide, la phrase sur les points retirés ; le document à gauche dit le site de l’élève, sans rôle', async () => {
  const db = await monter({ uid: 'a85-a', sansOuverture: true });
  egal(db.tirages[ID].graine, `a85-a|${ID}`, 'graine du tirage');
  egal(db.tirages[ID].pieces, { acteurs: ['client', 'action', 'transporteur', 'magasin'], situations: ['s-retard', 's-scan', 's-film'] }, 'pièces');
  egal(db.tirages[ID].valeurs.chaine, ['q', 'w', 'r', 'z', 't', 'k'], 'ordre de départ');
  egal(db.questions[ID]['@tirage'].ids, ['k-img-rack', 'k-chaine', 'k-tuteur', 'k-port'], 'questions tirées');
  egal((await menu()).filter((x) => !x.startsWith('fermee:')), ['ouverture'], 'entrées ouvertes au départ');
  await capture('0-ouverture');
  const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  vrai(await present('[data-ouv-penalite]'), 'la phrase sur les points retirés');
  await clic('[data-ouv-doc="stage"]').catch(() => {});
  const doc = await pg.evaluate(async () => { const S = await import('/contenus/action-ent85.js'); return S.OPTIONS.documents[0].html(window.__f.db); });
  vrai(/GXO/.test(doc) && /Onnaing/.test(doc) && /Karim/.test(doc), 'le document ne dit pas le site de l’élève');
  vrai(!/stocke|prépare|possède|prestataire|travaille pour Action/i.test(doc), 'le document souffle un rôle de « Qui est qui ? »');
  // Répondre à l'écran : la dernière question, « Je ne sais pas » ; pas de correction, « Réponse enregistrée ».
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${k === 3 ? '@nsp' : OUV_JUSTES[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    { const t = (await pg.$eval(`${Z} [data-ouverture]`, (e) => e.textContent)).replace(PENALITE, '').replace(ATTENTE, ''); vrai(!JUGE.test(t), 'une phrase qui juge à l’ouverture : ' + t.replace(/\s+/g, ' ')); }
    if (k < 3) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  vrai((await menu()).includes('localiser'), 'la carte s’ouvre après les réponses');
  const n = await noter();
  egal([n.detail.ouverture.justes, n.detail.ouverture.nsp, n.detail.ouverture.faux, n.detail.ouverture.sur], [3, 1, 0, 4], 'ouverture comptée');
  proche(n.score, 3, 'note : 3 justes + « Je ne sais pas »');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
});

await v('ENT-8.5 : Avant de commencer noté — 4 justes = 4 ; 3 justes + « Je ne sais pas » = 3 ; 3 justes + 1 fausse = 3 − 1 ÷ 2 ; tout faux = 0 (plancher) ; sans réponse = 0', async () => {
  const pts = async (rep, o = {}) => { await monter({ uid: 'a85-a', rep: { ...OUV_JUSTES, ...rep }, ...o }); const n = await noter(); return n.score; };
  proche(await pts({}), 4, 'quatre justes');
  proche(await pts({ 'k-port': '@nsp' }), 3, 'trois justes + « Je ne sais pas »');
  proche(await pts({ 'k-port': 'essence' }), 2.5, 'trois justes + une fausse (− 1 ÷ 2 pièges)');
  proche(await pts({ 'k-img-rack': 'quais', 'k-chaine': 'rayon', 'k-tuteur': 'prof', 'k-port': 'vendre' }), 0, 'tout faux');
  proche(await pts({}, { sansOuverture: true }), 0, 'sans réponse');
});


// ─────────────────────────────────────────────────────────── les deux témoins
for (const [uid, site, sujet, tuteur, ville] of [['a85-a', 'Onnaing', 'Bienvenue chez GXO', 'Karim', 'La Sentinelle'],
  ['a85-b', 'Belleville-en-Beaujolais', 'Bienvenue chez Kuehne+Nagel', 'Sandrine', 'Villefranche-sur-Saône']]) {
  await v(`ENT-8.5 : témoin ${uid} (${site}) — parcours juste à l’écran : 20/20 à la remise, égal à noter(db) ; rien remonté avant ; messages neutres de ${tuteur} (11 janvier) ; aucun mot qui juge, aucun « Corriger », aucun bilan ; pastilles « fait »`, async () => {
    await monter({ uid });
    const E0 = await entrants();
    egal(E0.map((m) => [m.from, m.subject]), [[tuteur, sujet]], 'message d’accueil');
    vrai(new Date(E0[0].ts).getMonth() === 0 && new Date(E0[0].ts).getDate() === 11, 'le message n’est pas daté du 11 janvier');
    vrai(E0[0].text.includes(`à ${site}`) && !/20\d\d/.test(E0[0].text), 'accueil : ' + E0[0].text);
    vrai(!(await present('[data-suite-seance] [data-suite]')), 'barre « Étape suivante » en évaluation');
    const vus = [];
    await capture(`1-carte-${uid}`);
    await jouerCarte({ vus });
    egal(await pg.$eval(`${R}`, (e) => e.dataset.lcNiveau), 'standard', 'niveau de la carte');
    vrai((await pg.textContent(`${R} [data-lc-fin]`)).includes(`du Havre à ${site}`), 'texte de fin du site');
    await capture(`2-carte-fin-${uid}`);
    // La fiche « Qui est qui ? » n'est pas au menu avant la fin de la carte : elle arrive par le message du tuteur.
    await envoyerQui(JUSTE[uid].qui);
    vrai((await pg.textContent(`${Z} [data-fiche="qui"]`)).includes(uid === 'a85-a' ? `Le magasin Action de ${ville}` : 'Kuehne+Nagel'), 'les lignes ne disent pas le site');
    await capture(`3-qui-${uid}`);
    await envoyerChaine(ORDRE, 'r');
    vrai((await pg.textContent(`${Z} [data-fiche="chaine"]`)).includes(uid === 'a85-a' ? 'L’entrepôt GXO d’Onnaing' : 'L’entrepôt Kuehne+Nagel de Belleville-en-Beaujolais')
      || (await pg.textContent(`${Z} [data-fiche="chaine"]`)).includes(site), 'la chaîne ne dit pas le site');
    await capture(`4-chaine-${uid}`);
    await envoyerChange(JUSTE[uid].change);
    await capture(`5-change-${uid}`);
    const E = await entrants();
    egal(E.map((m) => m.subject), [sujet, 'Qui est qui ?', 'La chaîne', 'Ce que je change', 'Merci'], 'messages');
    egal(E.map((m) => m.from), Array(5).fill(tuteur), 'expéditeur');
    egal(E[4].text, `Merci Lea. Demain, 6 h, à la réception.\n\n${tuteur}`, 'message de fin');
    vrai(E[3].text.includes(`magasin de ${ville}`), 'le message « Ce que je change » ne nomme pas le magasin');
    vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge : ' + E.map((m) => m.text).find((t) => JUGE.test(t)));
    for (const t of vus) vrai(!JUGE.test(t), `la carte juge : « ${(t.match(JUGE) || [])[0]} » dans ${t.replace(/\s+/g, ' ')}`);
    const ecran = (await texte()).replace(CONTENU, '');
    vrai(!JUGE.test(ecran), 'un mot qui juge à l’écran : ' + (ecran.match(JUGE) || [])[0]);
    vrai(!/Corriger/.test(ecran) && !(await present('[data-fin-jalon]')), '« Corriger » ou bilan à l’écran');
    egal(await pg.$$eval(`${Z} [data-pastille]`, (L) => L.map((x) => x.classList.contains('fait'))), [true, true, true, true], 'pastilles « fait »');
    const n = await noter();
    egal([n.score, n.max], [20, 20], 'noter(db)');
    egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
    const c = await rendre();
    egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
    vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
    egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée par `enregistrer` (la remise passe par `rendreCopie`)');
  });
}

await v('ENT-8.5 : le parcours de l’un joué par l’autre — a85-b répond la carte et les rôles d’a85-a (Onnaing) : carte de l’entrepôt et du magasin ✗, 4 rôles ✗ → 13/20', async () => {
  await monter({ uid: 'a85-b' });
  await jouer('a85-b', { carte: CARTE_ONNAING, qui: JUSTE['a85-a'].qui });
  const d = await detail();
  egal(['entrepot', 'magasin', 'port'].flatMap((l) => ['region', 'departement'].map((e) => d[`localiser:${l}:${e}`])), ['ko', 'ko', 'ko', 'ko', 'ok', 'ok'], 'carte');
  egal(['qui-action', 'qui-facile', 'qui-moyen', 'qui-difficile'].map((k) => d[k]), ['ko', 'ko', 'ko', 'ko'], 'rôles');
  proche((await noter()).score, 13, 'note (20 − 3 − 4)');
});

// ─────────────────────────────────────────────────────────── l’inaction, la carte, la chaîne, les rôles, les situations
await v('ENT-8.5 : inaction — rien fait (ouverture sans réponse, aucune fiche) → 0/20, aucun jalon juste ; remise d’une copie vide → 0', async () => {
  await monter({ uid: 'a85-rien', sansOuverture: true });
  const n = await noter();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  const c = await rendre();
  egal(c.score, 0, 'copie vide rendue');
});

await v('ENT-8.5 : la carte — une erreur de région au premier essai (entrepôt) → 0,75 perdu, l’élève finit la carte ; aide après deux erreurs (zone entourée), sans mot qui juge', async () => {
  await monter({ uid: 'a85-a' });
  const vus = [];
  await jouerCarte({ fautes: { 'entrepot:region': 1, 'magasin:departement': 2 }, vus });
  egal((await lire()).etape, 'fin', 'la carte n’est pas finie');
  vrai(vus.some((t) => /Regarde/.test(t)), 'l’aide après deux erreurs : ' + vus.join(' | '));
  for (const t of vus) vrai(!JUGE.test(t), `la carte juge : ${t}`);
  const d = await detail();
  egal(['entrepot', 'magasin', 'port'].flatMap((l) => ['region', 'departement'].map((e) => d[`localiser:${l}:${e}`])), ['ko', 'ok', 'ok', 'ko', 'ok', 'ok'], 'jalons de la carte');
  await envoyerQui(JUSTE['a85-a'].qui); await envoyerChaine(ORDRE, 'r'); await envoyerChange(JUSTE['a85-a'].change);
  proche((await noter()).score, 18.5, 'note (− 0,75 × 2)');
});

await v('ENT-8.5 : un élève accompagné ou confirmé joue la carte au niveau standard (3 lieux, aucun bonus) ; aucun cas bonus tiré', async () => {
  for (const aisance of ['accompagne', 'confirme']) {
    await monter({ uid: 'a85-a', aisance });
    await aller('localiser');
    egal(await pg.$eval(`${R}`, (e) => e.dataset.lcNiveau), 'standard', `${aisance} : niveau de la carte`);
    const db = await base();
    egal(Object.values(db.tirages[ID].bonus || {}).flat(), [], `${aisance} : cas bonus tirés`);
  }
  await jouerCarte({});
  egal(Object.keys((await base()).localiser[ID]['action-carte-85'].lieux).sort(), ['entrepot', 'magasin', 'port'], 'lieux joués (confirmé)');
});

await v('ENT-8.5 : la chaîne — une inversion entre 5 et 6 → 1,25 perdu seulement ; départ laissé tel quel → 0 sur l’ordre (la place seule) ; non envoyée → 0', async () => {
  await monter({ uid: 'a85-a' });
  await jouer('a85-a', { ordre: ['q', 'w', 'k', 'r', 'z', 't'] });
  let d = await detail();
  egal([d['chaine-debut'], d['chaine-fin'], d['chaine-place']], ['ok', 'ko', 'ok'], 'inversion 5-6');
  proche((await noter()).score, 18.75, 'note');
  await monter({ uid: 'a85-a' });
  await jouer('a85-a', { ordre: null });
  d = await detail();
  egal((await base()).fiches.chaine.valeurs.ordre, ['q', 'w', 'r', 'z', 't', 'k'], 'ordre envoyé = départ');
  egal([d['chaine-debut'], d['chaine-fin'], d['chaine-place']], ['ko', 'ko', 'ok'], 'départ tel quel');
  proche((await noter()).score, 17.5, 'note (− 2,5)');
  await monter({ uid: 'a85-a' });
  await jouerCarte({});
  await envoyerQui(JUSTE['a85-a'].qui);
  d = await detail();
  egal([d['chaine-debut'], d['chaine-fin'], d['chaine-place']], ['attente', 'attente', 'attente'], 'chaîne non envoyée');
  proche((await noter()).score, 12.5, 'note (ouverture 4 + carte 4,5 + rôles 4)');
});

await v('ENT-8.5 : « Qui est qui ? » — un même rôle partout → 1/4 au plus ; une fiche envoyée incomplète part, ses lignes vides sont fausses ; « Ce que je change » : « Rien ne change » partout → 0', async () => {
  for (const role of ['possede', 'stocke', 'vend', 'achete', 'guide']) {
    await monter({ uid: 'a85-a' });
    await jouer('a85-a', { qui: [role, role, role, role] });
    const d = await detail();
    const ok = ['qui-action', 'qui-facile', 'qui-moyen', 'qui-difficile'].filter((k) => d[k] === 'ok').length;
    vrai(ok <= 1, `« ${role} » partout : ${ok} lignes justes`);
  }
  await monter({ uid: 'a85-a' });
  await jouer('a85-a', { qui: ['achete', null, null, 'vend'], change: ['rien', 'rien', 'rien'] });
  const d = await detail();
  egal(['qui-moyen', 'qui-action', 'qui-difficile', 'qui-facile'].map((k) => d[k]), ['ok', 'ko', 'ko', 'ok'], 'lignes vides fausses (client, Action, transporteur, magasin)');
  egal(['change-facile', 'change-moyen', 'change-difficile'].map((k) => d[k]), ['ko', 'ko', 'ko'], '« Rien ne change » partout');
  proche((await noter()).score, 20 - 2 - 4, 'note');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-8.5 : équité sur 300 graines — Action toujours là, mélanges 1 + 1 + 1 (acteurs, situations), jamais une moitié de chaîne juste au départ, jamais les paires exclues, zéro secours, aucun bonus même confirmé ; la règle des moitiés n’est pas décorative', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent85-donnees.js');
    const { declarerTirage } = await import('/core/tirage.js');
    const ecarts = [];
    let secours = 0;
    for (let i = 0; i < 300; i++) {
      const g = `eq-${i}|${D.ID}`;
      const t = D.TIRAGE.tirer(g, { confirme: true });
      if (t.secours) secours++;
      const act = t.pieces.acteurs.map((id) => D.ACTEURS.find((p) => p.id === id));
      const sit = t.pieces.situations.map((id) => D.SITUATIONS.find((p) => p.id === id));
      if (!act.some((p) => p.id === 'action') || act.length !== 4) ecarts.push(`${g} : acteurs ${t.pieces.acteurs}`);
      if (['facile', 'moyen', 'difficile'].some((d) => act.filter((p) => p.difficulte === d).length !== 1 || sit.filter((p) => p.difficulte === d).length !== 1)) ecarts.push(`${g} : mélange`);
      if (D.debutJuste(t.valeurs.chaine) || D.finJuste(t.valeurs.chaine)) ecarts.push(`${g} : chaîne ${t.valeurs.chaine}`);
      D.PAIRES_EXCLUES.forEach(([a, b]) => { if (t.pieces.situations.includes(a) && t.pieces.situations.includes(b)) ecarts.push(`${g} : ${a} + ${b}`); });
      if (t.bonus && Object.values(t.bonus).some((x) => x.length)) ecarts.push(`${g} : bonus`);
    }
    // La même déclaration SANS la règle des moitiés : des départs à moitié justes passent (sinon le contrôle ne prouve rien).
    const sans = declarerTirage({ banques: D.TIRAGE.decl.banques, valeurs: D.TIRAGE.decl.valeurs, verifier: () => [] });
    let moities = 0;
    for (let i = 0; i < 300; i++) { const t = sans.tirer(`eq-${i}|x`); if (D.debutJuste(t.valeurs.chaine) || D.finJuste(t.valeurs.chaine)) moities++; }
    return { ecarts, secours, moities };
  });
  egal(r.ecarts, [], 'écarts d’équité');
  egal(r.secours, 0, 'jeux de secours');
  vrai(r.moities > 0, 'sans la règle, aucun départ à moitié juste : le contrôle ne prouve rien');
});

await v('ENT-8.5 : tirage stable — mêmes acteurs, situations, ordre et questions après rechargement et sur un autre poste ; deux voisins n’ont pas le même jeu', async () => {
  const a = await monter({ uid: 'a85-a' });
  const b = await monter({ uid: 'a85-a', db: a });
  egal(b.tirages[ID], a.tirages[ID], 'rechargement');
  const c = await monter({ uid: 'a85-a' });
  egal([c.tirages[ID].pieces, c.tirages[ID].valeurs, c.questions[ID]['@tirage'].ids], [a.tirages[ID].pieces, a.tirages[ID].valeurs, a.questions[ID]['@tirage'].ids], 'autre poste');
  const d = await monter({ uid: 'a85-b' });
  vrai(JSON.stringify(d.tirages[ID].pieces) !== JSON.stringify(a.tirages[ID].pieces), 'deux voisins, même jeu');
});

// ─────────────────────────────────────────────────────────── l’écran, le corrigé, le socle
await v('ENT-8.5 : écrans à 1366 × 768 — carte et trois fiches sans défilement horizontal ; enseignant : la carte au niveau standard', async () => {
  await monter({ uid: 'a85-b', db: { localiser: { [ID]: { 'action-carte-85': { fini: true, lieux: {} } } },
    fiches: { qui: { valeurs: {}, envoye: { at: 1 }, envois: 1 }, chaine: { valeurs: {}, envoye: { at: 1 }, envois: 1 } } } });
  for (const vue of ['localiser', 'fiche', 'fiche:chaine', 'fiche:change']) {
    await aller(vue);
    vrai(await large() <= 0, `${vue} : défilement horizontal`);
  }
  await monter({ uid: 'prof-1', role: 'prof' });
  await aller('localiser');
  egal(await pg.$eval(`${R}`, (e) => e.dataset.lcNiveau), 'standard', 'niveau de l’enseignant');
});

await v('ENT-8.5 : le corrigé de l’enseignant se calcule pour un élève (son site, sa carte lieu par lieu, ses lignes, sa chaîne, ses situations) et pour un élève qui n’a pas ouvert ; aucune adresse hors du site, aucune erreur JavaScript', async () => {
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-8.5.js');
    const D = await import('/contenus/action-ent85-donnees.js');
    const g = 'a85-b|action-evaluation-se-situer';
    const e = C.corrigeEleve({ tirages: { [D.ID]: { graine: g, ...D.TIRAGE.tirer(g) } } }, 'a85-b');
    const vide = C.corrigeEleve({}, 'a85-a');
    return { n: C.CORRIGE.items.length, items: e.items.map((x) => [x.texte, x.rep]), vide: [vide.texte, vide.items[0].rep] };
  });
  vrai(c.n >= 5, 'corrigé commun');
  vrai(c.items.some(([t, r]) => /Site tiré/.test(t) && /Belleville-en-Beaujolais \(Kuehne\+Nagel\)/.test(r) && /Sandrine/.test(r)), 'le site de l’élève');
  vrai(c.items.some(([t, r]) => /Villefranche/.test(t) && /Rhône \(69\)/.test(r) && /Auvergne-Rhône-Alpes \(84\)/.test(r)), 'la carte lieu par lieu');
  vrai(c.items.some(([t, r]) => /ligne 4 : Kuehne\+Nagel/.test(t) && r === 'stocke et prépare les commandes pour Action'), 'une ligne de « Qui est qui ? »');
  vrai(c.items.some(([t, r]) => /La chaîne/.test(t) && /Kuehne\+Nagel de Belleville-en-Beaujolais/.test(r)), 'la chaîne du site');
  vrai(c.items.some(([t, r]) => /Tu ranges une palette de jouets/.test(t) && /préparer Villefranche-sur-Saône/.test(r)), 'une situation du site');
  vrai(/n’a pas encore ouvert/.test(c.vide[0]) && /Onnaing/.test(c.vide[1]), 'élève qui n’a pas ouvert : ' + c.vide.join(' / '));
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await ctx85.close();
}
