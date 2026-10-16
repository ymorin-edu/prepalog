// Suite de tests de Prepalog — bloc « action-86 » : Action ENT-8.6, évaluation « ma prise de poste dans un nouveau site » (CAP OL, évaluation
// CAP-C1.2, copie rendue). `node outils/test.mjs action-86` ne lance que ce bloc. Brief : `docs/briefs/ENT-8.6-action-evaluation-prise-de-poste.md`
// §8 ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §7.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/action-evaluation-prise-de-poste.js`
// → `rendre`, `noter`), de vrais clics ; les listes des fiches par `selectOption`. Les GRAINES sont choisies ici (l’identifiant de l’élève,
// les mêmes qu’au bloc `action-85` : même site) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le tirage le
// 16/10/2026), jamais recalculées par le code de la séance :
//
//   a85-a → ONNAING (GXO, Karim ; Léo, cariste ; Manon, agent) : lieux l-quai n° 1, l-charge n° 7, l-controle n° 8, l-retours n° 3 (plan
//     [8,4,1,7,6,5,2,3]) ; tâches t-refuser → chef, t-rdv → agent, t-bl → moi ; lectures l-havre-heure (6 h 30), l-dernier (produits
//     ménagers) ; documents commande, transport ; N = 984, k = 72 ; note du quai « bl ».
//   a85-b → BELLEVILLE (Kuehne+Nagel, Sandrine ; Hugo ; Chloé) : lieux l-quai n° 8, l-retours n° 3, l-charge n° 7, l-controle n° 5 ; tâches
//     t-rdv → agent, t-equipe → chef, t-decharger → cariste ; mêmes lectures ; documents livraison, transport ; N = 936, k = 96 ; note « bl ».
//
// Barème (brief §5) : repérer 2,5 · qui fait quoi 2,5 · planigramme 4 (lectures 1 + 1, camion posé 2) · documents 4 (0,75 + 0,75, manque 1,
// ouvrir 1, d’abord 0,5) · rendre compte 3 (créneau 1, quai 0,5, manque 0,5, salutation 0,5, fin 0,5) · Avant de commencer 4. Ce qui vaut
// son prix : les deux témoins à 20 et la remise (= `noter`), le planning qui NE rend PAS la copie, le compte rendu jugé sur ce que l’élève a
// fait (une erreur ne se paie qu’une fois), la permutation du plan, la note du quai tirée, l’inaction à 0, rien qui dise juste ou faux.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'action-evaluation-prise-de-poste';
const ID85 = 'action-evaluation-se-situer';
const PL = 'action-eval-quais';
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
const CAPTURES = process.env.CAPTURES_ENT86 || '';
const pause = (ms = 80) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
const noter = () => pg.evaluate(async () => { const A = await import('/activites/action-evaluation-prise-de-poste.js'); return A.noter(window.__f.db); });
const detail = async () => (await noter()).detail;
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
const menu = () => pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => (b.dataset.vue ? b.dataset.vue : `fermee:${b.dataset.vueFermee}`)));
const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };
const capture = async (nom) => { if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/${nom}.png` }); };
const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const PENALITE = 'Une réponse fausse retire des points. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien.';
const ATTENTE = 'Réponds à toutes les questions pour continuer : une réponse fausse ne bloque pas.';
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse)\b/i;

async function clic(sel) {
  const el = await pg.waitForSelector(`${Z} ${sel}`, { state: 'visible' });
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  vrai(b && b.width > 0 && b.height > 0, `« ${sel} » n’a pas de place à l’écran`);
  await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}
const aller = async (vue) => { await clic(`.ent-nav[data-vue="${vue}"]`); await pause(); };

// Les réponses justes de l'ouverture (toute la banque).
const OUV_JUSTES = { 'k-planigramme': 'camions', 'k-creneau': 'reserve', 'k-zone-litiges': 'cote', 'k-zone-retours': 'magasins',
  'k-rassemblement': 'rassemblement', 'k-epi': 'protection', 'k-rendre-compte': 'dire', 'k-consignes': 'entreprise', 'k-convention': 'convention',
  'k-img-transpalette': 'transpalette', 'k-img-chariot': 'chariot', 'k-img-niveleur': 'passer', 'k-img-gilet': 'vu' };

// Monte la séance comme le site. `o.uid` ; `o.db` : base de départ ; `o.rep` : réponses d'ouverture rangées d'avance (défaut : toutes
// justes) ; `o.sansOuverture` ; `o.quai` : la note du quai IMPOSÉE (le tirage de l'élève est fait, puis sa note remplacée).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-evaluation-prise-de-poste.js');
  const D = await import('/contenus/action-ent86-donnees.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  const uid = o.uid || 'a85-a';
  if (o.quai) {
    const g = `${uid}|${D.ID}`;
    db.tirages = { ...(db.tirages || {}), [D.ID]: { graine: g, ...D.TIRAGE.tirer(g), at: 1 } };
    db.tirages[D.ID].pieces.quai = [o.quai];
  }
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})[D.ID] = db.questions[D.ID] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { rep: OUV_JUSTES, ...o });

// Le chemin de l'élève vers un écran qui vient d'arriver : la carte « Nouveau message » (ou la Messagerie), puis le bouton du message.
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
// Remplir une fiche : `rep` = { champ: valeur } (null : laissée vide) ; les « choix » (boutons radio) par `check`.
async function remplir(rep) {
  for (const [id, val] of Object.entries(rep)) {
    if (val == null) continue;
    if (await present(`select[data-fiche-champ="${id}"]`)) await pg.selectOption(`${Z} select[data-fiche-champ="${id}"]`, val);
    else await pg.check(`${Z} input[data-fiche-champ="${id}"][value="${val}"]`);
    await pause(20);
  }
}
async function reperer(rep) { await ouvrirParMessage('Ce matin, tu tiens la réception', 'fiche'); await remplir(rep); await capture('1-reperer'); await envoyer(); }
async function qui(rep) { await ouvrirParMessage('Qui fait quoi ?', 'fiche:qui-fait-quoi'); await remplir(rep); await capture('2-qui'); await envoyer(); }
async function lire(rep) { await ouvrirParMessage('Le planigramme', 'fiche:planigramme'); await remplir(rep); await capture('3-planigramme'); await envoyer(); }
// Le planning : la carte posée sur le quai `r` au créneau `t` (t = demi-heures depuis 6 h : 9 h → 6) ; `r` null : rien de posé.
async function planning(r, t) {
  if (!(await present('.ent-nav[data-vue="planning"]'))) await aller('mail');
  await aller('planning');
  if (r) {
    await pg.click(`${Z} [data-pl-id="linge"][data-pl-vue="b"]`);
    const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
    await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
    await pg.click(sel, { force: true });
    await pause();
  }
  await capture('4-planning');
  await clic('[data-pl="envoyer"]');
  await clic('[data-confirme-oui]');
  await pause();
}
async function documents(rep) { await ouvrirParMessage('Le camion du Havre', 'fiche:documents'); await remplir(rep); await capture('5-documents'); await envoyer(); }
async function compteRendu(lignes) {
  await aller('mail');
  const id = await pg.evaluate(() => (window.__f.db.mails.find((m) => m.folder === 'in' && m.subject === 'Rends-moi compte') || {}).id);
  vrai(id != null, 'le message « Rends-moi compte » n’est pas arrivé');
  await clic(`[data-mail="${id}"]`);
  await clic('[data-repondre]');
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) if (t) await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t });
  await capture('6-compte-rendu');
  await clic('#formPhr button[type="submit"]');
  await pause(60);
  if (await present('[data-confirme-oui]')) await clic('[data-confirme-oui]');
  await pause();
}
const choixPhrase = (l) => pg.$$eval(`${Z} [data-phrase="${l}"] option`, (L) => L.map((o) => o.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));

// Les réponses justes des deux témoins (écrites à la main, voir l'en-tête).
const JUSTE = {
  'a85-a': {
    reperer: { 'l-quai': '1', 'l-charge': '7', 'l-controle': '8', 'l-retours': '3' },
    qui: { 't-refuser': 'chef', 't-rdv': 'agent', 't-bl': 'moi' },
    lire: { 'l-havre-heure': '06:30', 'l-dernier': 'menagers' },
    docs: { commande: 'commande', transport: 'voiture', manque: '72', ouvrir: 'bl', dabord: 'bl' },
    cr: { salutation: 'Bonjour Karim,', creneau: 'J’ai mis le camion de linge de maison au quai 3 à 9 h.',
      quai: 'Le chauffeur n’avait pas le bon de livraison : je le lui ai demandé.', manque: 'Il manque 72 cartons de jouets sur le bon de livraison.',
      fin: 'Je reste à la réception. Lea' },
  },
  'a85-b': {
    reperer: { 'l-quai': '8', 'l-retours': '3', 'l-charge': '7', 'l-controle': '5' },
    qui: { 't-rdv': 'agent', 't-equipe': 'chef', 't-decharger': 'cariste' },
    lire: { 'l-havre-heure': '06:30', 'l-dernier': 'menagers' },
    docs: { livraison: 'livraison', transport: 'voiture', manque: '96', ouvrir: 'bl', dabord: 'bl' },
    cr: { salutation: 'Bonjour Sandrine,', creneau: 'J’ai mis le camion de linge de maison au quai 3 à 9 h.',
      quai: 'Le chauffeur n’avait pas le bon de livraison : je le lui ai demandé.', manque: 'Il manque 96 cartons de jouets sur le bon de livraison.',
      fin: 'Je reste à la réception. Lea' },
  },
};
// Tout le parcours ; `o` remplace une partie des réponses ; `o.pose` = [quai, créneau] (null : rien posé).
async function jouer(uid, o = {}) {
  const J = JUSTE[uid];
  await reperer({ ...J.reperer, ...(o.reperer || {}) });
  await qui({ ...J.qui, ...(o.qui || {}) });
  await lire({ ...J.lire, ...(o.lire || {}) });
  const [r, t] = o.pose === undefined ? ['Q3', 6] : (o.pose || [null, null]);
  await planning(r, t);
  await documents({ ...J.docs, ...(o.docs || {}) });
  await compteRendu({ ...J.cr, ...(o.cr || {}) });
}
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}
// Une base où les trois premières fiches sont envoyées (le planning est ouvert) : pour les cas qui commencent au planning.
const FICHES_ENVOYEES = { fiches: { reperer: { valeurs: {}, envoye: { at: 1 }, envois: 1 }, 'qui-fait-quoi': { valeurs: {}, envoye: { at: 1 }, envois: 1 },
  planigramme: { valeurs: {}, envoye: { at: 1 }, envois: 1 } } };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.6 : la séance se charge (CAP, CAP-C1.2, évaluation en copie, sans parcours) ; poids jalon par jalon 16 + ouverture 4 = 20 ; banque d’ouverture 9 + 4, sans aide ni mot cliquable ; planning `rendCopie: false`', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-evaluation-prise-de-poste.js');
    const S = await import('/contenus/action-ent86.js');
    const Q = await import('/contenus/questions/ENT-8.6.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, poids: Object.fromEntries(S.ETAPES.map((e) => [e.id, e.poids])), bonus: S.ETAPES.filter((e) => e.bonus).length,
      groupes: S.ETAPES.reduce((g, e) => { g[e.groupe] = (g[e.groupe] || 0) + e.poids; return g; }, {}),
      ouv: { part: Q.QUESTIONS.ouverture.part, tirage: Q.QUESTIONS.ouverture.tirage,
        prep: L.filter((q) => q.rubrique === 'preparation').length, image: L.filter((q) => q.rubrique === 'image').length,
        aides: L.filter((q) => q.aide != null).length, fil: L.filter((q) => q.type !== 'ouverture').length,
        mots: L.filter((q) => (q.enonce + q.choix.map((c) => c.lib).join(' ')).includes('[[')).length,
        droit: L.filter((q) => q.doc === 'droit').map((q) => q.id) },
      lexique: Object.keys(S.OPTIONS.lexique).length, rendCopie: S.PLANNING.rendCopie };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.copie, m.questions, m.ouverture, m.parcours, m.precedente, m.correction],
    ['ENT-8.6', ['cap'], [], ['CAP-C1.2'], 'evaluation', 20, true, 'ENT-8.6', 'prof', undefined, undefined, undefined], 'meta');
  egal(r.poids, { 'lieu-1': 0.625, 'lieu-2': 0.625, 'lieu-3': 0.625, 'lieu-4': 0.625, 'tache-facile': 0.75, 'tache-moyen': 0.75, 'tache-difficile': 1,
    'lecture-facile': 1, 'lecture-moyen': 1, 'v1-pose': 2, 'doc-1': 0.75, 'doc-2': 0.75, manque: 1, ouvrir: 1, dabord: 0.5,
    'cr-creneau': 1, 'cr-quai': 0.5, 'cr-manque': 0.5, 'cr-salutation': 0.5, 'cr-fin': 0.5 }, 'poids jalon par jalon (brief §5)');
  egal(r.groupes, { 'Repérer mon poste': 2.5, 'Qui fait quoi ?': 2.5, 'Le planigramme': 4, 'Les documents du camion': 4, 'Rendre compte': 3 }, 'poids par bloc');
  egal(r.bonus, 0, 'jalons bonus');
  egal(r.ouv, { part: 4, tirage: { preparation: 3, image: 1 }, prep: 9, image: 4, aides: 0, fil: 0, mots: 0, droit: ['k-consignes', 'k-convention'] }, 'ouverture');
  egal([r.lexique, r.rendCopie], [0, false], 'mots cliquables, rendCopie');
});

// ─────────────────────────────────────────────────────────── la grille (valeurs écrites à la main, brief §6.1 et §6.4)
await v('ENT-8.6 : planigramme — 9 places justes sur 4 quais (quai 1 9 h 30 ; quai 2 10 h 30, 11 h ; quai 3 9 h, 9 h 30, 10 h ; quai 4 10 h, 10 h 30, 11 h) ; une réponse par lecture ; le contrôle refuse une grille fausse', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent86-donnees.js');
    const plein = [...D.CAMIONS, { id: 'x2', quai: 'Q2', de: '10:30', a: '12:00', lib: 'x2' }, { id: 'x3', quai: 'Q3', de: '09:00', a: '11:00', lib: 'x3' }, { id: 'x4', quai: 'Q4', de: '10:00', a: '12:00', lib: 'x4' }];
    const conflit = [...D.CAMIONS, { id: 'double', quai: 'Q1', de: '07:00', a: '08:30', lib: 'double' }];
    return { libres: D.placesLibres(), justes: Object.fromEntries(Object.entries(D.LECTURES).map(([k, x]) => [k, x.juste])),
      ecarts: D.ecartsGrille(), plein: D.ecartsGrille(plein), conflit: D.ecartsGrille(conflit) };
  });
  egal(r.libres, [['Q1', 570], ['Q2', 630], ['Q2', 660], ['Q3', 540], ['Q3', 570], ['Q3', 600], ['Q4', 600], ['Q4', 630], ['Q4', 660]], 'places justes');
  egal(r.justes, { 'l-havre-heure': '06:30', 'l-havre-quai': 'Q2', 'l-retours': 'Q3', 'l-q1-combien': '3', 'l-libre-7h': 'Q4', 'l-dernier': 'menagers' }, 'lectures');
  egal(r.ecarts, [], 'la grille de la séance');
  vrai(r.plein.some((e) => /moins de 3 quais|place\(s\) juste/.test(e)), 'grille presque pleine acceptée : ' + r.plein.join(' ; '));
  vrai(r.conflit.some((e) => /en même temps/.test(e)), 'grille en conflit acceptée : ' + r.conflit.join(' ; '));
});

// ─────────────────────────────────────────────────────────── le site : le même qu’en ENT-8.5
await v('ENT-8.6 : le site — même site qu’en ENT-8.5 pour 50 élèves (graines de séance différentes) ; les deux témoins (a85-a Onnaing, a85-b Belleville) ; collègues du site', async () => {
  const r = await pg.evaluate(async ({ ID, ID85 }) => {
    const E = await import('/contenus/action-eval-sites.js');
    const D = await import('/contenus/action-ent86-donnees.js');
    const diff = [];
    for (let i = 0; i < 50; i++) {
      const uid = `cap-${i}`;
      const b85 = { tirages: { [ID85]: { graine: `${uid}|${ID85}` } } }, b86 = { tirages: { [ID]: { graine: `${uid}|${ID}` } } };
      if (E.siteDeBase(b85, ID85).id !== D.siteEleve(b86).id) diff.push(uid);
    }
    const sites = new Set(Array.from({ length: 50 }, (_, i) => D.siteEleve({ tirages: { [ID]: { graine: `cap-${i}|${ID}` } } }).id));
    const eq = (uid) => { const S = D.siteEleve({ tirages: { [ID]: { graine: `${uid}|${ID}` } } }); const Q = D.equipeDe(S); return [S.id, Q.tuteur, Q.cariste, Q.agent, Q.mailAgent]; };
    return { diff, deux: sites.size, a: eq('a85-a'), b: eq('a85-b') };
  }, { ID, ID85 });
  egal(r.diff, [], 'élèves dont le site change entre ENT-8.5 et ENT-8.6');
  egal(r.deux, 2, 'les 50 élèves n’ont pas tous le même site');
  egal(r.a, ['onnaing', 'Karim', 'Léo', 'Manon', 'manon@gxo-onnaing.example'], 'a85-a');
  egal(r.b, ['belleville', 'Sandrine', 'Hugo', 'Chloé', 'chloe@kn-belleville.example'], 'a85-b');
});

// ─────────────────────────────────────────────────────────── l’ouverture
await v('ENT-8.6 : à l’ouverture — 4 questions (3 + 1), « Je ne sais pas » en dernier, aucune aide, aucun mot qui juge ; « Le droit » à gauche (L4111-5, convention art. 8 et 10, sans Code civil)', async () => {
  const db = await monter({ uid: 'a85-a', sansOuverture: true });
  egal(db.tirages[ID].graine, `a85-a|${ID}`, 'graine du tirage');
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 4, 'nombre de questions');
  egal((await menu()).filter((x) => !x.startsWith('fermee:')), ['ouverture'], 'entrées ouvertes au départ');
  const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  vrai(await present('[data-ouv-doc="droit"]'), 'l’onglet « Le droit » absent');
  await clic('[data-ouv-doc="droit"]');
  const droit = await pg.$eval(`${Z} .qo-feuille`, (e) => e.textContent);
  vrai(/L4111-5/.test(droit) && /L4141-1/.test(droit) && /article 8/.test(droit) && /8 heures par jour et 35 heures par semaine/.test(droit), 'le droit : ' + droit.slice(0, 200));
  vrai(!/Code civil|1603/.test(droit), 'le Code civil d’ENT-8.2 est resté');
  await capture('0-ouverture');
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${k === 3 ? '@nsp' : OUV_JUSTES[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    { const t = (await pg.$eval(`${Z} [data-ouverture]`, (e) => e.textContent)).replace(PENALITE, '').replace(ATTENTE, '').replace(droit, '').replace('être bien vu des caristes', ''); vrai(!JUGE.test(t), 'une phrase qui juge à l’ouverture : ' + t.replace(/\s+/g, ' ')); }
    if (k < 3) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter();
  egal([n.detail.ouverture.justes, n.detail.ouverture.nsp, n.detail.ouverture.faux, n.detail.ouverture.sur], [3, 1, 0, 4], 'ouverture comptée');
  proche(n.score, 3, 'note : 3 justes + « Je ne sais pas »');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
});

await v('ENT-8.6 : Avant de commencer noté — 4 justes = 4 ; 3 justes + « Je ne sais pas » = 3 ; 3 justes + 1 fausse (k-consignes, 3 pièges) = 3 − 1 ÷ 3 ; tout faux = 0 ; sans réponse = 0', async () => {
  const pts = async (rep, o = {}) => { await monter({ uid: 'a85-a', rep: { ...OUV_JUSTES, ...rep }, ...o }); return (await noter()).score; };
  const ids = (await base()).questions[ID]['@tirage'].ids;
  proche(await pts({}), 4, 'quatre justes');
  const prep = ids.find((x) => x !== 'k-consignes' && !/img/.test(x));
  proche(await pts({ [prep]: '@nsp' }), 3, 'trois justes + « Je ne sais pas »');
  // La fausse : une question à 3 choix (2 pièges, − 0,5) ou k-consignes (3 pièges).
  const faux = { 'k-planigramme': 'salaires', 'k-creneau': 'pause', 'k-zone-litiges': 'epi', 'k-zone-retours': 'epi', 'k-rassemblement': 'poste', 'k-epi': 'engins',
    'k-rendre-compte': 'colis', 'k-consignes': 'lycee', 'k-convention': 'tuteur', 'k-img-transpalette': 'chariot', 'k-img-chariot': 'camion',
    'k-img-niveleur': 'peser', 'k-img-gilet': 'chaud' };
  proche(await pts({ [prep]: faux[prep] }), 2.5, `trois justes + une fausse (${prep}, − 1 ÷ 2)`);
  proche(await pts({ 'k-consignes': 'lycee' }, { rep: { ...OUV_JUSTES, 'k-consignes': 'lycee' } }), ids.includes('k-consignes') ? 3 - 1 / 3 : 4, 'k-consignes fausse (− 1 ÷ 3) si tirée');
  proche(await pts(Object.fromEntries(ids.map((x) => [x, faux[x]]))), 0, 'tout faux');
  proche(await pts({}, { sansOuverture: true }), 0, 'sans réponse');
});

// ─────────────────────────────────────────────────────────── les deux témoins
for (const [uid, site, tuteur, agent] of [['a85-a', 'Onnaing', 'Karim', 'Manon'], ['a85-b', 'Belleville-en-Beaujolais', 'Sandrine', 'Chloé']]) {
  await v(`ENT-8.6 : témoin ${uid} (${site}) — parcours juste à l’écran : 20/20 à la remise, égal à noter(db) ; le planning envoyé NE rend PAS la copie ; messages de ${tuteur} et ${agent} (12 janvier) ; aucun mot qui juge, aucun « Corriger », aucun bilan ; pastilles « fait »`, async () => {
    await monter({ uid });
    const E0 = await entrants();
    egal(E0.map((m) => [m.from, m.subject]), [[tuteur, 'Ce matin, tu tiens la réception']], 'message d’accueil');
    vrai(new Date(E0[0].ts).getMonth() === 0 && new Date(E0[0].ts).getDate() === 12, 'le message n’est pas daté du 12 janvier');
    vrai(!/20\d\d/.test(E0[0].text), 'une année dans l’accueil');
    vrai(!(await present('[data-suite-seance] [data-suite]')), 'barre « Étape suivante » en évaluation');
    const J = JUSTE[uid];
    await reperer(J.reperer);
    vrai((await texte()).includes(`Plan de la réception de ${site}`), 'le plan ne nomme pas le site');
    await qui(J.qui);
    await lire(J.lire);
    vrai(!(await present('[data-pl-rendu]')), 'avant');
    await planning('Q3', 6);
    egal(await pg.evaluate(() => window.__f.copies.length), 0, 'la copie est rendue à l’envoi du planning');
    vrai(await present('[data-pl-envoye]'), 'écran « Planning envoyé »');
    vrai(!(await present('[data-copie-etat="rendue"]')), 'copie rendue au bandeau');
    await documents(J.docs);
    await compteRendu(J.cr);
    const E = await entrants();
    egal(E.map((m) => m.subject), ['Ce matin, tu tiens la réception', 'Qui fait quoi ?', 'Le planigramme', 'Un créneau à placer', 'Le camion du Havre', 'Rends-moi compte', 'Merci'], 'messages');
    egal(E.map((m) => m.from), [tuteur, tuteur, tuteur, agent, tuteur, tuteur, tuteur], 'expéditeurs');
    egal(E[6].text, `Merci Lea, je regarde à mon retour.\n\n${tuteur}`, 'message de fin');
    egal(E[3].text, `Un fournisseur de linge de maison demande un créneau d’une heure, entre 9 h et midi. Place-le, s’il te plaît.\n\n${agent}`, 'message de l’agent');
    vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge : ' + E.map((m) => m.text).find((t) => JUGE.test(t)));
    const ecran = await texte();
    vrai(!JUGE.test(ecran), 'un mot qui juge à l’écran : ' + (ecran.match(JUGE) || [])[0]);
    vrai(!/Corriger/.test(ecran) && !(await present('[data-fin-jalon]')), '« Corriger » ou bilan à l’écran');
    egal(await pg.$$eval(`${Z} [data-pastille]`, (L) => L.map((x) => x.classList.contains('fait'))), [true, true, true, true, true, true], 'pastilles « fait »');
    const n = await noter();
    egal([n.score, n.max], [20, 20], 'noter(db) : ' + JSON.stringify(n.detail));
    egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
    const c = await rendre();
    egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
    vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
  });
}

// ─────────────────────────────────────────────────────────── inaction, plan, planning, documents, compte rendu
await v('ENT-8.6 : inaction — rien fait (ouverture sans réponse, aucune fiche) → 0/20, aucun jalon juste ; remise d’une copie vide → 0', async () => {
  await monter({ uid: 'a86-rien', sansOuverture: true });
  const n = await noter();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  const c = await rendre();
  egal(c.score, 0, 'copie vide rendue');
});

await v('ENT-8.6 : Repérer mon poste — jugé contre la PERMUTATION de l’élève : les numéros d’ENT-8.4 (appris par cœur) → 0 ; les numéros du plan affiché changent d’un élève à l’autre ; 300 graines → permutations variées', async () => {
  await monter({ uid: 'a85-a' });
  // Les numéros de ces lieux sur le plan d’ENT-8.4 : quai 3, local de charge 4, contrôle 1, retours 8.
  await reperer({ 'l-quai': '3', 'l-charge': '4', 'l-controle': '1', 'l-retours': '8' });
  const d = await detail();
  egal(['lieu-1', 'lieu-2', 'lieu-3', 'lieu-4'].map((k) => d[k]), ['ko', 'ko', 'ko', 'ko'], 'numéros d’ENT-8.4');
  const nums = async () => pg.$$eval(`${Z} .lb-plan .lb-num text`, (L) => L.map((t) => t.textContent));
  const a = await nums();
  egal(a, ['1', '3', '8', '2', '5', '7', '4', '6'], 'numéros affichés chez a85-a (ronds dans l’ordre du dessin : 3, 8, 1, 7, 6, 4, 2, 5 d’ENT-8.4)');
  await monter({ uid: 'a85-b' });
  await ouvrirParMessage('Ce matin, tu tiens la réception', 'fiche');
  const b = await nums();
  vrai(JSON.stringify(a) !== JSON.stringify(b) && [...b].sort().join('') === '12345678', `a85-b : ${b}`);
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent86-donnees.js');
    const P = new Set();
    for (let i = 0; i < 300; i++) P.add(D.TIRAGE.tirer(`eq-${i}|${D.ID}`).valeurs.plan.join(''));
    return P.size;
  });
  vrai(r >= 290, `permutations distinctes sur 300 : ${r}`);
});

await v('ENT-8.6 : le planning — quai 3 à 9 h ✓ ; quai 2 à 9 h ✗ (pris) ; quai 3 à 11 h ✗ (pris) ; quai 4 à 11 h 30 ✗ (finit après midi) ; non posé ✗ ; jamais de copie rendue à l’envoi, rien de signalé', async () => {
  for (const [r, t, attendu] of [['Q3', 6, 'ok'], ['Q2', 6, 'ko'], ['Q3', 10, 'ko'], ['Q4', 11, 'ko'], [null, null, 'ko']]) {
    await monter({ uid: 'a85-a', db: FICHES_ENVOYEES });
    if (r) {
      await aller('mail'); await aller('planning');
      await pg.click(`${Z} [data-pl-id="linge"][data-pl-vue="b"]`);
      const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
      await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
      await pg.click(sel, { force: true });
      await pause();
      vrai(!(await present('[data-pl-problemes] li')) && !(await present('.pl-bloc-faux')), 'un problème signalé en évaluation');
      await clic('[data-pl="envoyer"]'); await clic('[data-confirme-oui]'); await pause();
    } else await planning(null, null);
    egal((await detail())['v1-pose'], attendu, `pose ${r} ${t}`);
    egal(await pg.evaluate(() => window.__f.copies.length), 0, `copie rendue à l’envoi (${r} ${t})`);
    vrai(await present('[data-pl-envoye]'), 'écran « Planning envoyé »');
  }
  egal(await large(), 0, 'planning : défilement horizontal');
});

await v('ENT-8.6 : les documents — note « pret » + « Oui, tout est prêt » + « J’ouvre le camion » → ✓ ✓ ; note « encombre » + « Oui » → ✗ ; combien manquent : k ✓, N − k ✗', async () => {
  const docs = async (quai, rep) => {
    await monter({ uid: 'a85-a', quai, db: { ...FICHES_ENVOYEES, plannings: { [PL]: { phase: 'fini', place: {}, v1: { place: {}, at: 1 } } } } });
    await documents({ commande: 'commande', transport: 'voiture', ...rep });
    const d = await detail();
    return [d.ouvrir, d.dabord, d.manque];
  };
  egal(await docs('pret', { ouvrir: 'pret', dabord: 'ouvrir', manque: '72' }), ['ok', 'ok', 'ok'], 'note « pret »');
  vrai((await pg.textContent(`${Z} [data-fiche="documents"]`)).includes('J’ouvre le camion avec Léo.'), 'le cariste du site dans « Que fais-tu d’abord ? »');
  egal(await docs('encombre', { ouvrir: 'pret', dabord: 'ouvrir', manque: '912' }), ['ko', 'ko', 'ko'], 'note « encombre », « oui », N − k');
  egal(await docs('encombre', { ouvrir: 'encombre', dabord: 'degager', manque: '72' }), ['ok', 'ok', 'ok'], 'note « encombre » lue');
  egal(await docs('transpalette', { ouvrir: 'transpalette', dabord: 'charge', manque: '72' }), ['ok', 'ok', 'ok'], 'note « transpalette » lue');
});

await v('ENT-8.6 : rendre compte — une erreur ne se paie qu’une fois : posé au quai 2 à 9 h (faux) et dit → créneau ✓, planning ✗ ; « oui, tout est prêt » sur la note « encombre » et dit → quai ✓, fiche ✗ ; la phrase d’une autre note que sa réponse → ✗ ; non posé + « Je ne l’ai pas placé. » → ✓', async () => {
  await monter({ uid: 'a85-a', quai: 'encombre' });
  await jouer('a85-a', { pose: ['Q2', 6], docs: { ouvrir: 'pret', dabord: 'ouvrir' },
    cr: { creneau: 'J’ai mis le camion de linge de maison au quai 2 à 9 h.', quai: 'Tout est prêt, on ouvre le camion.' } });
  let d = await detail();
  egal([d['v1-pose'], d['cr-creneau'], d.ouvrir, d.dabord, d['cr-quai'], d['cr-manque']], ['ko', 'ok', 'ko', 'ko', 'ok', 'ok'], 'une erreur payée une fois');
  proche((await noter()).score, 20 - 2 - 1 - 0.5, 'note');
  await monter({ uid: 'a85-a', quai: 'encombre' });
  await jouer('a85-a', { docs: { ouvrir: 'pret', dabord: 'ouvrir' }, cr: { quai: 'Le quai est encombré : je le fais dégager avant d’ouvrir.' } });
  d = await detail();
  egal([d.ouvrir, d['cr-quai']], ['ko', 'ko'], 'phrase de la note, pas de sa réponse');
  // « je n’ai pas mes EPI » (sans phrase) : on juge contre la note tirée.
  await monter({ uid: 'a85-a', quai: 'encombre' });
  await jouer('a85-a', { docs: { ouvrir: 'epi', dabord: 'degager' }, cr: { quai: 'Le quai est encombré : je le fais dégager avant d’ouvrir.' } });
  egal((await detail())['cr-quai'], 'ok', 'réponse sans phrase : la note');
  // Non posé : « Je ne l’ai pas placé. » ; la ligne propose trois places de la grille.
  await monter({ uid: 'a85-a' });
  await jouer('a85-a', { pose: null, cr: { creneau: 'Je ne l’ai pas placé.' } });
  d = await detail();
  egal([d['v1-pose'], d['cr-creneau']], ['ko', 'ok'], 'non posé, dit');
  const decl = (await base()).mails.find((m) => m.folder === 'in' && m.subject === 'Rends-moi compte').phrases.lignes.find((l) => l.id === 'creneau');
  egal(decl.choix, ['J’ai mis le camion de linge de maison au quai 3 à 9 h.', 'J’ai mis le camion de linge de maison au quai 1 à 9 h 30.',
    'J’ai mis le camion de linge de maison au quai 4 à 10 h.', 'Je ne l’ai pas placé.'], 'choix du créneau (non posé)');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-8.6 : équité sur 300 graines — mélanges (lieux 1 + 2 + 1, tâches 1 + 1 + 1 à trois personnes, lectures 1 + 1, 2 documents), note du quai entre 15 et 35 % chacune sur 200, zéro secours ; la règle « trois personnes » n’est pas décorative', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent86-donnees.js');
    const { declarerTirage } = await import('/core/tirage.js');
    const ecarts = [];
    let secours = 0;
    const notes = {};
    for (let i = 0; i < 300; i++) {
      const g = `eq-${i}|${D.ID}`;
      const t = D.TIRAGE.tirer(g, { confirme: true });
      if (t.secours) secours++;
      const P = (n, B) => t.pieces[n].map((id) => B.find((p) => p.id === id));
      const L = P('lieux', D.BANQUE_LIEUX), T = P('taches', D.BANQUE_TACHES), R = P('lectures', D.BANQUE_LECTURES);
      const c = (X, d) => X.filter((p) => p.difficulte === d).length;
      if (c(L, 'facile') !== 1 || c(L, 'moyen') !== 2 || c(L, 'difficile') !== 1) ecarts.push(`${g} : lieux`);
      if (['facile', 'moyen', 'difficile'].some((d) => c(T, d) !== 1) || new Set(T.map(D.quiDe)).size !== 3) ecarts.push(`${g} : tâches`);
      if (c(R, 'facile') !== 1 || c(R, 'moyen') !== 1) ecarts.push(`${g} : lectures`);
      if (t.pieces.documents.length !== 2) ecarts.push(`${g} : documents`);
      if (!D.estPermutation(t.valeurs.plan)) ecarts.push(`${g} : plan`);
      if (t.bonus && Object.values(t.bonus).some((x) => x.length)) ecarts.push(`${g} : bonus`);
      if (i < 200) notes[t.pieces.quai[0]] = (notes[t.pieces.quai[0]] || 0) + 1;
    }
    const sans = declarerTirage({ banques: D.TIRAGE.decl.banques, valeurs: D.TIRAGE.decl.valeurs, verifier: () => [] });
    let memes = 0;
    for (let i = 0; i < 300; i++) { const t = sans.tirer(`eq-${i}|x`); if (new Set(t.pieces.taches.map((id) => D.quiDe(D.BANQUE_TACHES.find((p) => p.id === id)))).size < 3) memes++; }
    return { ecarts, secours, notes, memes };
  });
  egal(r.ecarts, [], 'écarts d’équité');
  egal(r.secours, 0, 'jeux de secours');
  vrai(Object.keys(r.notes).length === 4 && Object.values(r.notes).every((n) => n >= 30 && n <= 70), 'notes du quai : ' + JSON.stringify(r.notes));
  vrai(r.memes > 0, 'sans la règle, jamais deux tâches à la même personne : le contrôle ne prouve rien');
});

// ─────────────────────────────────────────────────────────── l’écran, le corrigé
await v('ENT-8.6 : écrans à 1366 × 768 — les quatre fiches et le planning sans défilement horizontal', async () => {
  await monter({ uid: 'a85-b', db: { ...FICHES_ENVOYEES, plannings: { [PL]: { phase: 'fini', place: {}, v1: { place: {}, at: 1 } } } } });
  for (const vue of ['fiche', 'fiche:qui-fait-quoi', 'fiche:planigramme', 'planning', 'fiche:documents']) {
    await aller('mail');
    await aller(vue);
    vrai(await large() <= 0, `${vue} : défilement horizontal`);
  }
});

await v('ENT-8.6 : le corrigé de l’enseignant se calcule pour un élève (son site, ses numéros, ses lignes, sa note du quai) et pour un élève qui n’a pas ouvert ; aucune adresse hors du site, aucune erreur JavaScript', async () => {
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-8.6.js');
    const D = await import('/contenus/action-ent86-donnees.js');
    const g = 'a85-b|action-evaluation-prise-de-poste';
    const e = C.corrigeEleve({ tirages: { [D.ID]: { graine: g, ...D.TIRAGE.tirer(g) } } }, 'a85-b');
    const vide = C.corrigeEleve({}, 'a85-a');
    return { n: C.CORRIGE.items.length, items: e.items.map((x) => [x.texte, x.rep]), vide: [vide.texte, vide.items[0].rep] };
  });
  vrai(c.n >= 5, 'corrigé commun');
  vrai(c.items.some(([t, r]) => /Site tiré/.test(t) && /Belleville-en-Beaujolais \(Kuehne\+Nagel\)/.test(r) && /Hugo/.test(r)), 'le site de l’élève');
  vrai(c.items.some(([t, r]) => /Repérer : Un quai/.test(t) && r === 'n° 8'), 'un numéro du plan');
  vrai(c.items.some(([t, r]) => /Qui fait quoi \? : Répartir/.test(t) && /Sandrine/.test(r)), 'une tâche');
  vrai(c.items.some(([t, r]) => /il manque 96 cartons/.test(r)), 'la commande');
  vrai(c.items.some(([t, r]) => /Note du quai/.test(t) && /bon de livraison/.test(r)), 'la note du quai');
  vrai(/n’a pas encore ouvert/.test(c.vide[0]) && /Onnaing/.test(c.vide[1]), 'élève qui n’a pas ouvert : ' + c.vide.join(' / '));
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await ctx.close();
}
