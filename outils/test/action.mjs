// Suite de tests de Prepalog — bloc « action » : les séances Action (ENT-8.x, CAP OL). ENT-8.2 « ma prise de poste à la réception » d'abord
// (brief `docs/briefs/ENT-8.2-action-prise-de-poste.md` §8) ; les cas d'ENT-8.1 s'ajouteront ici (chantier ENT-8.1).
// `node outils/test.mjs action` ne lance que ce bloc. Aides communes (ouvrir la page, lire la base) : `outils/test/france-boissons/commun.mjs`.
//
// Valeurs ÉCRITES À LA MAIN (brief §6.1, sur la grille du planigramme, identique pour toute la classe) :
//   le camion du Havre est attendu à 7 h (07:00), au quai 2 ; le premier camion : le fournisseur de bougies (6 h) ; le quai libre de 9 h à
//   10 h : le quai 2 ; deux camions au quai 3 ; le dernier à libérer son quai : le fournisseur de jouets (10 h 30). Places justes de la carte
//   « Linge de maison — 1 h » (9 h – 11 h) : quai 2 de 9 h à 10 h, quais 3 et 4 de 10 h à 11 h (et le quai 2 à toute heure entre).
// Élèves TÉMOINS (tirage posé à la main) : tâches t-bl (toi), t-ranger (Kevin), t-equipe (Samia) ; lectures l-havre-heure (07:00) et
// l-q3-combien (2) ; commande n° AC-123456, N = 1 200 cartons commandés, k = 72 manquants, 1 128 livrés (12 palettes). Confirmé : en plus
// la tâche t-rdv (Julie) et la lecture l-dernier (jouets).
// Poids (validés par Tristan le 15/10/2026 à 19 h 18) : visite 4 × 0,75 · tâches 3 × 1 · lectures 2 × 1 · planning 2 × 1 · documents 3 × 1 ·
// avant d'ouvrir 1 · compte rendu 1 + 0,5 + 0,5 ; questions F 1, H 1,5, I 1,5 (part 4).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, bandeau, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT82 || '';

const ID = 'action-prise-de-poste';
const REP_OUV = { tutrice: 'suit', planigramme: 'camions', creneau: 'reserve', 'quai-sert': 'charger', 'zone-litiges': 'cote', epi: 'protection',
  'rendre-compte': 'dire', 'img-transpalette': 'transpalette', 'img-gilet': 'vu', 'img-niveleur': 'passer' };
const VALEURS = { numero: 123456, N: 1200, k: 72 };
const tirage = (o = {}) => ({ graine: `temoin|${ID}`, pieces: { taches: ['t-bl', 't-ranger', 't-equipe'], lectures: ['l-havre-heure', 'l-q3-combien'] },
  difficultes: { taches: { 't-bl': 'facile', 't-ranger': 'moyen', 't-equipe': 'difficile', 't-rdv': 'moyen' },
    lectures: { 'l-havre-heure': 'facile', 'l-q3-combien': 'moyen', 'l-dernier': 'difficile' } },
  ...(o.confirme ? { bonus: { taches: ['t-rdv'], lectures: ['l-dernier'] } } : {}),
  valeurs: { ...VALEURS }, essai: 0, secours: false, at: 1 });
// Les réponses justes du témoin, écrites à la main.
const QUI = { 't-bl': 'moi', 't-ranger': 'kevin', 't-equipe': 'samia', 't-rdv': 'julie' };
const LIRE = { 'l-havre-heure': '07:00', 'l-q3-combien': '2', 'l-dernier': 'jouets' };
const DOCS = { commande: 'commande', livraison: 'livraison', transport: 'voiture' };
const AVANT = ['epi', 'transpalette', 'quai', 'bl'];
const CR = { salutation: 'Bonjour Samia,', quai: 'Quai 2 est prêt pour le camion du Havre.', heure: 'Le camion est attendu à 7 h.',
  manque: 'Il manque un transpalette chargé : Kevin a mis celui du quai 2 en charge.', fin: 'Je t’attends au quai. Lea' };
const BONNES_Q = { 'consignes-securite': 'geodis', 'retard-havre': 'samia', 'qui-doit': 'fournisseur', 'pourquoi-rendre-compte': 'organiser' };
const FAUSSES_Q = { 'consignes-securite': 'lycee', 'retard-havre': 'chauffeur', 'qui-doit': 'chauffeur', 'pourquoi-rendre-compte': 'pas-pense' };
const GROUPES = ['Repérer mon poste', 'Qui fait quoi ?', 'Le planigramme', 'Les documents du camion', 'Rendre compte', 'Les questions de Samia'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;

// Monte la séance dans la page. `o.db` : une base de départ ; les réponses d'« Avant de commencer » sont posées (sauf `sansOuverture`).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-prise-de-poste.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.rep) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac82' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }), suivante: o.suivante || null,
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });
// Le menu ne se redessine qu'au changement d'écran (fin de la visite, envoi du planning) : comme l'élève, on passe par la Messagerie.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
// Captures (variable d'environnement CAPTURES_ENT82 = un dossier) : prises pendant le parcours juste seulement.
let capturer = false;
const capture = async (nom) => { if (CAPTURES && capturer) await pg.screenshot({ path: `${CAPTURES}/${nom}.png` }); };

// Répond au panneau ouvert (puis reprend), tant qu'il y en a un.
async function qrep(choix = BONNES_Q) {
  for (let i = 0; i < 6; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pause();
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); } };
const envoyerFiche = async () => { await pg.click(`${Z} [data-fiche-envoyer]`); await confirmer(); };
const menu = async () => { await aller('mail'); return pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.dataset.vue || b.dataset.vueFermee)); };

// ① la visite : le tour (6 arrêts dans l'ordre), puis les 4 photos ; `fautes` : photo → numéro faux cliqué d'abord.
const ORDRE_PHOTOS = { quai: 2, bureau: 6, vestiaire: 1, reception: 3 };
async function visite({ fautes = {} } = {}) {
  await allerV('entrepot');
  const P = `${Z} .pv`;
  await pg.click(`${P} [data-pv="suivant"]`);
  for (const n of [1, 2, 3, 4, 5, 6]) {
    if (await pg.$(`${P} [data-pv="retour"]`)) await pg.click(`${P} [data-pv="retour"]`);
    await pg.click(`${P} g[data-pv-etape="${n}"]`);
  }
  if (await pg.$(`${P} [data-pv="retour"]`)) await pg.click(`${P} [data-pv="retour"]`);
  if (CAPTURES) await capture('1-visite-plan');
  await pg.click(`${P} [data-pv="suivant"]`);
  for (const [ph, n] of Object.entries(ORDRE_PHOTOS)) {
    if (fautes[ph]) await pg.click(`${P} [data-pv-num="${fautes[ph]}"]`);
    await pg.click(`${P} [data-pv-num="${n}"]`);
  }
  await pg.click(`${P} [data-pv="suivant"]`);
  await pause();
  egal(await pg.$eval(P, (e) => e.dataset.pvEtape), 'fin', 'dernière étape de la visite');
  // Comme l'élève : il lit le message de Samia (la carte en haut à droite) ; le menu se redessine en changeant d'écran.
  await allerV('mail');
}
// ② « Qui fait quoi ? » : `rep` = tâche → personne (les tâches affichées sont lues à l'écran).
async function qui(rep = QUI) {
  await allerV('fiche');
  const ids = await pg.$$eval(`${Z} [data-fiche="qui-fait-quoi"] select[data-fiche-champ]`, (L) => L.map((s) => s.dataset.ficheChamp));
  for (const id of ids) { await pg.selectOption(`${Z} #fi-${id}`, rep[id]); await pause(30); }
  await envoyerFiche();
  return ids;
}
async function lire(rep = LIRE) {
  await allerV('fiche:planigramme');
  const ids = await pg.$$eval(`${Z} [data-fiche="planigramme"] select[data-fiche-champ]`, (L) => L.map((s) => s.dataset.ficheChamp));
  for (const id of ids) { await pg.selectOption(`${Z} #fi-${id}`, rep[id]); await pause(30); }
  if (CAPTURES) await capture('2-fiche-planigramme');
  await envoyerFiche();
  return ids;
}
// Le planning : la carte posée sur le quai `r` au créneau `t` (t = 0 à 06:00, pas de 15 min : 9 h → 12, 10 h → 16, 11 h → 20).
async function planning(r = 'Q2', t = 12, choix = BONNES_Q) {
  await allerV('planning');
  await pg.click(`${Z} [data-pl-id="linge"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause();
  await qrep(choix);
  if (CAPTURES) await capture('3-planning-carte-posee');
  await pg.click(`${Z} [data-pl="envoyer"]`);
  await pause(60);
  if (await present('[data-pl="quandMeme"]')) await pg.click(`${Z} [data-pl="quandMeme"]`);
  else if (await present('[data-confirme-oui]')) await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
async function documents(rep = DOCS, choix = BONNES_Q) {
  await allerV('fiche:documents');
  for (const id of ['commande', 'livraison', 'transport']) { await pg.selectOption(`${Z} #fi-${id}`, rep[id]); await pause(30); await qrep(choix); }
  if (CAPTURES) {
    for (const d of ['bon-commande', 'bon-livraison', 'lettre-voiture']) { await pg.click(`${Z} [data-fiche-doc="${d}"]`); await pause(); await capture(`4-${d}`); }
  }
  await envoyerFiche();
}
async function avant(cases = AVANT, choix = BONNES_Q) {
  await allerV('fiche:avant-ouvrir');
  for (const c of cases) { await pg.check(`${Z} input[data-fiche-case="avant"][value="${c}"]`); await pause(20); }
  await envoyerFiche();
  await qrep(choix);
}
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("${sujet}")`);
  await pause();
}
async function compteRendu(lignes = CR, choix = BONNES_Q) {
  await ouvrirMail('Rends-moi compte');
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) {
    await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30);
    await qrep(choix);
    if (await present('[data-repondre]') && !(await present('#formPhr:not([hidden])'))) await pg.click(`${Z} [data-repondre]`);
  }
  if (CAPTURES) await capture('5-reponse-phrases');
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await confirmer();
  await qrep(choix);
}
async function parcoursComplet(o = {}) {
  await visite({ fautes: o.fautesVisite });
  await qui(o.qui);
  await lire(o.lire);
  await planning(o.quai || 'Q2', o.t == null ? 12 : o.t, o.q);
  await documents(o.docs, o.q);
  await avant(o.avant, o.q);
  await compteRendu(o.cr, o.q);
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'),
    retours: [...b.querySelectorAll('[data-fin-retour]')].map((x) => x.dataset.finRetour), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});

// ─────────────────────────────────────────────────────────── les données, calculées par le contenu (valeurs écrites ici à la main)
await v('ENT-8.2 : planigramme — les lectures CALCULÉES sur la grille donnent les valeurs écrites à la main ; une seule bonne réponse par lecture ; places justes de la carte', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent82.js');
    const L = S.lecturesDe();
    const libJuste = (id) => L[id].choix.find((c) => c.v === L[id].juste).lib;
    return { justes: Object.fromEntries(Object.entries(L).map(([id, x]) => [id, x.juste])), libs: Object.keys(L).map(libJuste),
      uniques: Object.values(L).map((x) => x.justes.length), choix: Object.fromEntries(Object.entries(L).map(([id, x]) => [id, x.choix.map((c) => c.v)])),
      ecarts: S.ecartsGrille(), places: S.placesJustes().map(([q, m]) => `${q}@${m / 60}`), quai: S.QUAI_HAVRE, heure: S.HEURE_HAVRE };
  });
  egal(r.justes, { 'l-havre-heure': '07:00', 'l-havre-quai': 'Q2', 'l-premier': 'bougies', 'l-libre-9h': 'Q2', 'l-q3-combien': '2', 'l-dernier': 'jouets' }, 'bonnes réponses');
  egal(r.libs, ['7 h', 'Quai 2', 'le fournisseur de bougies', 'Quai 2', '2', 'le fournisseur de jouets'], 'libellés des bonnes réponses');
  egal(r.uniques, [1, 1, 1, 1, 1, 1], 'une seule bonne réponse par lecture');
  egal(r.choix['l-havre-heure'], ['06:00', '06:30', '07:00', '08:30'], 'choix de l’heure (les 3 arrivées les plus proches)');
  egal(r.choix['l-premier'], ['havre', 'bougies', 'papeterie', 'menagers'], 'choix du premier camion (ordre alphabétique des libellés : « le camion… » avant « le fournisseur… »)');
  egal(r.ecarts, [], 'contrôle de la grille');
  egal(r.places, ['Q2@9', 'Q2@9.25', 'Q2@9.5', 'Q2@9.75', 'Q2@10', 'Q3@10', 'Q4@10'], 'places justes de la carte');
  egal([r.quai, r.heure], ['quai 2', '7 h'], 'ce que le compte rendu doit dire');
});

await v('ENT-8.2 : contrôle du contenu — une grille où une lecture devient ambiguë (un camion déplacé) est refusée ; la vraie passe', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent82.js');
    const deplace = (id, de, a) => S.CAMIONS.map((c) => (c.id === id ? { ...c, de, a } : c));
    return {
      premier: S.ecartsGrille(deplace('menagers', '06:00', '07:30')),     // deux camions arrivent les premiers à 6 h
      dernier: S.ecartsGrille(deplace('palettes', '09:00', '10:30')),     // deux camions libèrent leur quai à 10 h 30
      libre: S.ecartsGrille(deplace('palettes', '10:00', '11:00')),       // deux quais libres de 9 h à 10 h
      aucunePlace: S.ecartsGrille([...S.CAMIONS, { id: 'x', quai: 'Q2', de: '09:00', a: '11:00', titre: 'X', court: 'X', lib: 'x' },
        { id: 'y', quai: 'Q3', de: '10:00', a: '11:00', titre: 'Y', court: 'Y', lib: 'y' }, { id: 'z', quai: 'Q4', de: '10:00', a: '11:00', titre: 'Z', court: 'Z', lib: 'z' }]),
      vraie: S.ecartsGrille(),
    };
  });
  vrai(r.premier.some((x) => /l-premier/.test(x)), 'premier camion ambigu non vu : ' + r.premier);
  vrai(r.dernier.some((x) => /l-dernier/.test(x)), 'dernier camion ambigu non vu : ' + r.dernier);
  vrai(r.libre.some((x) => /l-libre-9h/.test(x)), 'quai libre ambigu non vu : ' + r.libre);
  vrai(r.aucunePlace.some((x) => /aucune place/.test(x)), 'carte sans place non vue : ' + r.aucunePlace);
  egal(r.vraie, [], 'la grille de la séance');
});

await v('ENT-8.2 : déclaration (CAP, CAP-C1.2, guidage, 20 points, parcours après ENT-8.1, livrée fermée aux élèves) ; entreprise n° 8 ; ENT-8.1 première du parcours', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-prise-de-poste.js');
    const B = await import('/activites/action-se-situer.js');
    const I = await import('/activites/index.js');
    const S = await import('/contenus/action-ent82.js');
    const Q = await import('/contenus/questions/ENT-8.2.js');
    const m = A.meta, b = B.meta;
    const metas = (await I.chargerActivites()).map((x) => x.meta);
    const socle = S.ETAPES.filter((e) => !e.bonus);
    return {
      m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.precedente, m.niveauxPrevus,
        m.questions, m.pret, m.ouverture, m.corrige],
      b: [b.id, b.code, b.niveaux, b.competences, b.competencesCap, b.temps, b.bareme, b.parcours, !!b.precedente],
      entreprise: I.ENTREPRISES.find((e) => e.n === 8), registre: metas.filter((x) => /^ENT-8\./.test(x.code)).map((x) => x.code),
      somme: socle.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part,
      parGroupe: Object.entries(socle.reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})),
      sansGroupe: socle.filter((e) => !e.groupe).map((e) => e.id),
      ecrans: socle.filter((e) => e.ecran).map((e) => e.ecran),
      qPoids: Q.QUESTIONS.liste.filter((q) => q.type === 'fil').map((q) => [q.id, q.reflexion ? 'reflexion' : q.poids, q.apres || 'tout de suite']),
      bonus: S.ETAPES.filter((e) => e.bonus).map((e) => [e.id, e.poids, e.groupe]),
    };
  });
  egal(r.m, ['action-prise-de-poste', 'ENT-8.2', 'simulog', ['cap'], [], ['CAP-C1.2'], 'guidage', 20, true, true, 'action-se-situer', ['confirme'], 'ENT-8.2',
    true, 'prof', './contenus/corriges/ENT-8.2.js'], 'meta ENT-8.2');
  egal(r.b, ['action-se-situer', 'ENT-8.1', ['cap'], [], ['CAP-C1.1'], 'guidage', 20, true, false], 'meta d’ENT-8.1 (la précédente : première du parcours)');
  egal(r.entreprise && [r.entreprise.nom, r.entreprise.logo], ['Action', './contenus/trames/logos/action.svg'], 'entreprise n° 8');
  egal(r.registre, ['ENT-8.1', 'ENT-8.2', 'ENT-8.3', 'ENT-8.4', 'ENT-8.5', 'ENT-8.6', 'ENT-8.7', 'ENT-8.8', 'ENT-8.9', 'ENT-8.10', 'ENT-8.11', 'ENT-8.12', 'ENT-8.13', 'ENT-8.14'], 'au registre');   // ENT-8.3 à 8.6 ajoutées le 16/10/2026 ; 8.7 à 8.10 le 17/10 (ENT-8.10 après ENT-8.9 : tri segment par segment) ; 8.11 et 8.12 le 22/10 ; 8.13 le 22/10 ; 8.14 le 22/10
  proche(r.somme, 16, 'somme des poids des jalons');
  egal(r.part, 4, 'part des questions');
  egal(r.parGroupe, [['Repérer mon poste', 3], ['Qui fait quoi ?', 3], ['Le planigramme', 4], ['Les documents du camion', 4], ['Rendre compte', 2]], 'points par ligne du bandeau');
  egal(r.sansGroupe, [], 'jalons sans groupe');
  egal(r.ecrans.length, 14, 'jalons qui se rouvrent (tout sauf la visite)');
  egal(r.qPoids, [['consignes-securite', 1, 'tout de suite'], ['retard-havre', 1.5, 'bilan'], ['qui-doit', 1.5, 'tout de suite'],
    ['pourquoi-rendre-compte', 'reflexion', 'bilan']], 'questions au fil (F, H, I, K)');
  egal(r.bonus, [['bonus-tache', undefined, undefined], ['bonus-lecture', undefined, undefined]], 'cas bonus sans poids ni groupe');
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
// `d` : ce que l'élève a envoyé. Rien = rien d'envoyé.
const JALONS = ['reperer-quai', 'reperer-bureau', 'reperer-vestiaire', 'reperer-reception', 'tache-1', 'tache-2', 'tache-3', 'lecture-1', 'lecture-2',
  'v1-quai-libre', 'v1-creneau', 'doc-commande', 'doc-livraison', 'doc-transport', 'avant-ouvrir', 'cr-contenu', 'cr-salutation', 'cr-fin'];
const jalonsSans = (d, o = {}) => pg.evaluate(async ({ T, d }) => {
  const S = await import('/contenus/action-ent82.js');
  const db = { tirages: { 'action-prise-de-poste': T }, fiches: {}, mails: [] };
  const env = (id, valeurs) => { db.fiches[id] = { valeurs, envoye: { at: 1 } }; };
  if (d.qui) env('qui-fait-quoi', d.qui);
  if (d.lire) env('planigramme', d.lire);
  if (d.docs) env('documents', d.docs);
  if (d.avant) env('avant-ouvrir', { avant: d.avant });
  if (d.planning) db.plannings = { 'action-quais': { v1: { place: { linge: { r: d.planning[0], s: d.planning[1] } } } } };
  if (d.visite) db.entrepots = { 'action-reception': { courante: 3, atteinte: 3, x: { reperer: d.visite } } };
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, (e.verifier(db) || { status: 'null' }).status]));
}, { T: tirage(o), d });

await v('ENT-8.2 : jalons sans écran — rien d’envoyé, tout « à faire » (inaction 0) ; les fiches, le planning et leurs pièges font tomber LEUR jalon', async () => {
  const vide = await jalonsSans({});
  egal(JALONS.map((j) => vide[j]), JALONS.map(() => 'attente'), 'rien envoyé');
  egal([vide['bonus-tache'], vide['bonus-lecture']], ['null', 'null'], 'standard : pas de cas bonus');
  const juste = { qui: QUI, lire: LIRE, docs: DOCS, avant: AVANT, planning: ['Q2', 12] };
  const s = await jalonsSans(juste);
  const fiches = JALONS.slice(4, 15);
  egal(fiches.filter((j) => s[j] !== 'ok'), [], 'parcours juste');
  const ko = async (f) => { const d = JSON.parse(JSON.stringify(juste)); f(d); const x = await jalonsSans(d); return fiches.filter((j) => x[j] !== 'ok'); };
  egal(await ko((d) => { d.qui['t-equipe'] = 'kevin'; }), ['tache-3'], 'répartir l’équipe donné à Kevin');
  egal(await ko((d) => { d.qui['t-bl'] = 'julie'; }), ['tache-1'], 'le bon de livraison donné à Julie');
  egal(await ko((d) => { d.lire['l-havre-heure'] = '08:30'; }), ['lecture-1'], 'heure du Havre : 8 h 30');
  egal(await ko((d) => { d.lire['l-q3-combien'] = '1'; }), ['lecture-2'], 'un camion au quai 3');
  egal(await ko((d) => { d.planning = ['Q1', 12]; }), ['v1-quai-libre'], 'Quai 1 à 9 h (déjà pris)');
  egal(await ko((d) => { d.planning = ['Q3', 20]; }), ['v1-creneau'], 'Quai 3 à 11 h (hors fenêtre)');
  egal(await ko((d) => { d.planning = ['Q4', 16]; }), [], 'Quai 4 à 10 h (une autre place juste)');
  egal(await ko((d) => { d.docs.commande = 'facture'; }), ['doc-commande'], '« la facture » pour la commande');
  egal(await ko((d) => { d.docs.transport = 'livraison'; }), ['doc-transport'], 'le bon de livraison pour le transport');
  egal(await ko((d) => { d.avant = ['epi', 'transpalette', 'quai', 'bl', 'cle', 'carte-grise', 'conges']; }), ['avant-ouvrir'], 'tout coché');
  egal(await ko((d) => { d.avant = ['epi', 'transpalette', 'quai']; }), ['avant-ouvrir'], 'le BL oublié');
  egal(await ko((d) => { d.avant = []; }), ['avant-ouvrir'], 'rien coché');
  // La visite au premier essai : la 1re photo juste du premier coup, la 2e après une erreur.
  const vis = await jalonsSans({}, {});
  egal(vis['reperer-quai'], 'attente', 'visite pas commencée');
  // Envoyer le planning vide : faux (0), jamais « à faire ».
  const pv = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent82.js');
    const db = { plannings: { 'action-quais': { v1: { place: {} } } } };
    return S.ETAPES.filter((e) => /^v1-/.test(e.id)).map((e) => e.verifier(db).status);
  });
  egal(pv, ['ko', 'ko'], 'planning envoyé sans la carte');
});

await v('ENT-8.2 : confirmé — cas bonus (une tâche, une lecture) jugés à part, `null` chez un standard', async () => {
  const d = { qui: QUI, lire: LIRE, docs: DOCS, avant: AVANT, planning: ['Q2', 12] };
  const s = await jalonsSans(d, { confirme: true });
  egal([s['bonus-tache'], s['bonus-lecture']], ['ok', 'ok'], 'bonus justes');
  const f = await jalonsSans({ ...d, qui: { ...QUI, 't-rdv': 'kevin' }, lire: { ...LIRE, 'l-dernier': 'papeterie' } }, { confirme: true });
  egal([f['bonus-tache'], f['bonus-lecture']], ['ko', 'ko'], 'bonus faux');
  egal(JALONS.slice(4, 15).filter((j) => f[j] !== 'ok'), [], 'le socle reste juste');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-8.2 : tirage — 300 graines (standard et confirmé) : trois personnes différentes, commande cohérente, zéro secours ; confirmé : 4 tâches, 3 lectures', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent82.js');
    const out = { pasTrois: 0, secours: 0, commande: 0, confirme: [], diff: new Set(), N: new Set(), k: new Set() };
    for (let i = 0; i < 300; i++) {
      for (const confirme of [false, true]) {
        const t = S.TIRAGE.tirer(`eleve-${i}|action-prise-de-poste`, { confirme });
        const T = t.pieces.taches.map((id) => S.BANQUE_TACHES.find((p) => p.id === id));
        if (new Set(T.map((p) => p.qui)).size !== 3) out.pasTrois++;
        if (t.secours) out.secours++;
        const V = t.valeurs;
        if (!(V.k > 0 && V.k < V.N && V.N % 24 === 0 && V.k % 24 === 0 && V.N >= 720 && V.N <= 1440 && V.k >= 24 && V.k <= 96)) out.commande++;
        if (confirme && i < 20) out.confirme.push([t.pieces.taches.length + t.bonus.taches.length, t.pieces.lectures.length + t.bonus.lectures.length]);
        out.diff.add(T.map((p) => p.difficulte).join(','));
        out.N.add(V.N); out.k.add(V.k);
      }
    }
    return { ...out, diff: [...out.diff], N: out.N.size, k: [...out.k].sort((a, b) => a - b) };
  });
  egal([r.pasTrois, r.secours, r.commande], [0, 0, 0], 'personnes, secours, commande');
  vrai(r.confirme.every(([a, b]) => a === 4 && b === 3), 'confirmé : ' + JSON.stringify(r.confirme));
  vrai(r.diff.every((d) => d.split(',').sort().join() === 'difficile,facile,moyen'), 'une tâche de chaque difficulté : ' + r.diff);
  vrai(r.N > 15, 'N varie trop peu : ' + r.N);
  egal(r.k, [24, 48, 72, 96], 'valeurs de k');
});

await v('ENT-8.2 : la garde « trois personnes différentes » est utile — sans elle, des graines donnent deux tâches à la même personne', async () => {
  const n = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent82.js');
    const { declarerTirage } = await import('/core/tirage.js');
    const T = declarerTirage({ banques: S.TIRAGE.decl.banques, valeurs: S.TIRAGE.decl.valeurs });
    let pas = 0;
    for (let i = 0; i < 300; i++) {
      const t = T.tirer(`eleve-${i}|action-prise-de-poste`);
      if (new Set(t.pieces.taches.map((id) => S.BANQUE_TACHES.find((p) => p.id === id).qui)).size !== 3) pas++;
    }
    return pas;
  });
  vrai(n > 30, 'sans la garde, trop peu de tirages fautifs : ' + n);
});

await v('ENT-8.2 : question I — 300 graines : l’énoncé dit N, N − k et k, les MÊMES nombres que le bon de commande et le bon de livraison de l’élève', async () => {
  const faux = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent82.js');
    const Q = await import('/contenus/questions/ENT-8.2.js');
    const I = Q.QUESTIONS.liste.find((q) => q.id === 'qui-doit');
    const doc = (id) => S.DOCUMENTS.find((d) => d.id === id).html;
    const nb = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const out = [];
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}|action-prise-de-poste`;
      const db = { tirages: { 'action-prise-de-poste': { graine: g, ...S.TIRAGE.tirer(g) } } };
      const V = db.tirages['action-prise-de-poste'].valeurs;
      const e = I.selon(db).enonce;
      const bc = doc('bon-commande')(db), bl = doc('bon-livraison')(db);
      const okE = e.includes(`commandé ${nb(V.N)} cartons`) && e.includes(`que ${nb(V.N - V.k)}.`) && e.includes(`les ${nb(V.k)} cartons`);
      const okD = bc.includes(`${nb(V.N)} cartons`) && bl.includes(`${nb(V.N - V.k)} cartons`) && bl.includes(`AC-${V.numero}`) && bc.includes(`AC-${V.numero}`);
      if (!okE || !okD) out.push([g, e]);
    }
    // Sur base vide (la commande témoin), l'énoncé et les documents disent aussi la même chose.
    const vide = I.selon({}).enonce;
    if (!(vide.includes('commandé 960 cartons') && doc('bon-commande')({}).includes('960 cartons') && doc('bon-livraison')({}).includes('912 cartons'))) out.push(['vide', vide]);
    return out;
  });
  egal(faux, [], 'énoncés ou documents différents');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-8.2 : parcours juste à l’écran (« Avant de commencer » répondu FAUX : rien ne compte) — 20 / 20, bandeau de 6 lignes ✓, menu progressif, messages neutres', async () => {
  capturer = true;
  await monter({ uid: 'ac82-juste', sansOuverture: true, db: { tirages: { [ID]: tirage() } } });
  // « Avant de commencer » : 3 notions + 1 image tirées, toutes répondues faux.
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal(ov.length, 4, 'questions d’ouverture tirées');
  egal(ov.filter((id) => /^img-/.test(id)).length, 1, 'une question d’image');
  const OUV = await pg.evaluate(async () => (await import('/contenus/questions/ENT-8.2.js')).QUESTIONS.liste.filter((q) => q.type === 'ouverture')
    .map((q) => [q.id, q.choix.find((c) => c.v !== q.juste).v]));
  const fausse = Object.fromEntries(OUV);
  for (let k = 0; k < 4; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await pg.click(`${Z} [data-q-choix="${fausse[ov[k]]}"][data-q="${ov[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${ov[k]}"]`); await pause();
  }
  await pg.click(`${Z} [data-ouv-continuer]`); await pause();
  let m = await menu();
  vrai(m.includes('entrepot') && !m.includes('fiche') && !m.includes('planning'), 'menu au départ : ' + m);
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction : 0');
  await visite();
  m = await menu(); vrai(m.includes('fiche') && !m.includes('fiche:planigramme'), 'après la visite : Qui fait quoi : ' + m);
  egal((await entrants()).map((x) => x.subject), ['Ta prise de poste', 'L’équipe de la réception'], 'messages après la visite');
  await qui();
  m = await menu(); vrai(m.includes('fiche:planigramme') && !m.includes('planning'), 'après Qui fait quoi : ' + m);
  await lire();
  m = await menu(); vrai(m.includes('planning') && !m.includes('fiche:documents'), 'après le planigramme : planning : ' + m);
  await planning('Q2', 12);
  m = await menu(); vrai(m.includes('fiche:documents') && !m.includes('fiche:avant-ouvrir'), 'après le planning : documents : ' + m);
  await documents();
  m = await menu(); vrai(m.includes('fiche:avant-ouvrir'), 'après les documents : avant d’ouvrir : ' + m);
  await avant();
  const E = await entrants();
  const kevin = E.find((x) => x.subject === 'Le transpalette');
  vrai(kevin && /du quai 2 était déchargé/.test(kevin.text), 'Kevin : ' + (kevin && kevin.text));
  await compteRendu();
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons');
  egal(['question:consignes-securite', 'question:retard-havre', 'question:qui-doit'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  egal(b.fin, 'ok', 'tout juste');
  egal(b.retours.sort(), ['pourquoi-rendre-compte', 'retard-havre'], 'H et K corrigées au bilan');
  await pg.$eval(`${Z} [data-fin-seance]`, (e) => e.scrollIntoView({ block: 'start' })); await capture('6-bandeau-fin');
  capturer = false;
  const sujets = (await entrants()).map((x) => x.subject);
  egal(sujets, ['Ta prise de poste', 'L’équipe de la réception', 'Le planigramme de ce matin', 'Demande de créneau — linge de maison', 'Le camion de linge de maison',
    'Le planning des quais', 'Les documents du camion du Havre', 'Le transpalette', 'Rends-moi compte', 'Le camion arrive'], 'tous les messages, dans l’ordre');
  egal((await entrants()).filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus');
  const ts = (await entrants()).map((x) => x.ts);
  vrai(ts.every((t, i) => !i || t >= ts[i - 1]), 'heures croissantes');
  vrai(new Date(ts[0]).getMonth() === 10 && new Date(ts[0]).getDate() === 9 && new Date(ts[0]).getHours() === 6, 'le 9 novembre à 6 h : ' + new Date(ts[0]));
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.2 : questions au fil — F corrigée tout de suite (retour de Samia), I affiche SES nombres, H et K « Merci, je note »', async () => {
  await monter({ uid: 'ac82-q', db: { tirages: { [ID]: tirage() } } });
  await visite(); await qui(); await lire();
  // H : à la pose, « Merci, je note ».
  await allerV('planning');
  await pg.click(`${Z} [data-pl-id="linge"][data-pl-vue="b"]`);
  await pg.click(`${Z} [data-pl-grille] [data-pl-case][data-r="Q2"][data-t="12"]`, { force: true }); await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'retard-havre', 'H à la pose de la carte');
  await pg.click(`${Z} [data-q-choix="samia"][data-q="retard-havre"]`); await pg.click(`${Z} [data-q-repondre="retard-havre"]`); await pause();
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'H : « Merci, je note », sans verdict');
  await pg.click(`${Z} [data-q-reprendre]`); await pause();
  await pg.click(`${Z} [data-pl="envoyer"]`); await pause(60);
  if (await present('[data-pl="quandMeme"]')) await pg.click(`${Z} [data-pl="quandMeme"]`); else if (await present('[data-confirme-oui]')) await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  // I : au choix de la 1re ligne, avec SES nombres (1 200, 1 128, 72).
  await allerV('fiche:documents');
  await pg.selectOption(`${Z} #fi-commande`, 'commande'); await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'qui-doit', 'I au choix de la 1re ligne');
  const enonce = await pg.textContent(`${Z} [data-q-panneau]`);
  vrai(/Action a commandé 1 200 cartons au fournisseur\. Le camion n’en apporte que 1 128\. Qui doit les 72 cartons \?/.test(enonce), 'énoncé de I : ' + enonce);
  await pg.click(`${Z} [data-q-choix="geodis"][data-q="qui-doit"]`); await pg.click(`${Z} [data-q-repondre="qui-doit"]`); await pause();
  egal(await pg.getAttribute(`${Z} [data-q-verdict]`, 'data-q-verdict'), 'ko', 'I fausse, corrigée tout de suite');
  vrai(/C’est le fournisseur/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'retour de I');
  await pg.click(`${Z} [data-q-reprendre]`); await pause();
  // Les documents de l'élève disent les mêmes nombres.
  await pg.click(`${Z} [data-fiche-doc="bon-commande"]`); await pause();
  vrai(/1 200 cartons/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)) && /AC-123456/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'bon de commande');
  await pg.click(`${Z} [data-fiche-doc="bon-livraison"]`); await pause();
  vrai(/1 128 cartons/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'bon de livraison');
  await pg.click(`${Z} [data-fiche-doc="lettre-voiture"]`); await pause();
  vrai(/12 palettes/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)) && /Gonfreville/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'lettre de voiture');
  for (const id of ['livraison', 'transport']) { await pg.selectOption(`${Z} #fi-${id}`, DOCS[id]); await pause(30); }
  await envoyerFiche();
  // F : à l'envoi d'« Avant d'ouvrir », corrigée tout de suite.
  await allerV('fiche:avant-ouvrir');
  for (const c of AVANT) await pg.check(`${Z} input[data-fiche-case="avant"][value="${c}"]`);
  await envoyerFiche();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'consignes-securite', 'F à l’envoi');
  await pg.click(`${Z} [data-q-choix="geodis"][data-q="consignes-securite"]`); await pg.click(`${Z} [data-q-repondre="consignes-securite"]`); await pause();
  egal(await pg.getAttribute(`${Z} [data-q-verdict]`, 'data-q-verdict'), 'ok', 'F juste, corrigée tout de suite');
  vrai(/un stagiaire est un travailleur comme les autres/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'retour de F');
  await pg.click(`${Z} [data-q-reprendre]`); await pause();
  // K : au premier choix de la ligne « fin », « Merci, je note ».
  await ouvrirMail('Rends-moi compte');
  await pg.click(`${Z} [data-repondre]`);
  await pg.selectOption(`${Z} [data-phrase="fin"]`, { label: 'Bisous' }); await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'pourquoi-rendre-compte', 'K au choix de la fin');
  await pg.click(`${Z} [data-q-choix="organiser"][data-q="pourquoi-rendre-compte"]`); await pg.click(`${Z} [data-q-repondre="pourquoi-rendre-compte"]`); await pause();
  vrai(await present('[data-q-merci]'), 'K : « Merci, je note »');
  // Le document « Le droit » est joint au message de Samia de l'étape 4, avec les textes de loi.
  const droit = await pg.evaluate(async () => (await import('/contenus/action-ent82.js')).DOC_DROIT.html);
  vrai(/les travailleurs sont les salariés, y compris temporaires, et les stagiaires/.test(droit) && /celle de délivrer et celle de garantir/.test(droit)
    && /La délivrance est le transport de la chose vendue/.test(droit) && /information des travailleurs sur les risques pour la santé et la sécurité/.test(droit), 'textes du document « Le droit »');
  const s4 = (await entrants()).find((x) => x.subject === 'Les documents du camion du Havre');
  egal(s4.pieces, ['bon-commande', 'bon-livraison', 'lettre-voiture', 'droit'], 'pièces jointes de l’étape 4');
});

await v('ENT-8.2 : pire cas — tout faux : premier bilan, la séance est finie sans l’enseignant (photo de fin rangée), 0 / 20, « Corriger » proposé, la visite ne se rejoue pas', async () => {
  await monter({ uid: 'ac82-pire', db: { tirages: { [ID]: tirage() } } });
  await parcoursComplet({
    fautesVisite: { quai: 1, bureau: 5, vestiaire: 4, reception: 2 },
    qui: { 't-bl': 'samia', 't-ranger': 'julie', 't-equipe': 'kevin' }, lire: { 'l-havre-heure': '08:30', 'l-q3-combien': '4' },
    quai: 'Q1', t: 0, docs: { commande: 'facture', livraison: 'facture', transport: 'facture' }, avant: ['cle', 'conges'],
    cr: { salutation: 'Salut ma grande,', quai: 'Quai 4 est prêt pour le camion du Havre.', heure: 'Le camion est attendu à 9 h.', manque: 'Il ne manque rien.', fin: 'À plus.' },
    q: FAUSSES_Q,
  });
  const n = await note();
  proche(n.score, 0, 'note');
  egal(JALONS.filter((j) => n.detail[j] !== 'ko'), [], 'tous les jalons faux');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ko']), 'bandeau');
  vrai(b.corriger && b.fige, 'Corriger et la phrase du premier essai : ' + b.texte);
  vrai(/La visite et les questions de Samia se jouent au premier essai/.test(b.texte), 'finFige');
  const db = await base();
  vrai(!!(db.points && db.points[ID]), 'photo de fin rangée (la séance suivante s’ouvrirait)');
});

await v('ENT-8.2 : corriger — une photo mal associée (bloc 1 ✗, la visite ne se rouvre pas) ; « refuser une palette » à Kevin (bloc 2 ✗, la fiche se rouvre) ; salutation fausse seule (bloc 5 ✗, le contenu reste juste)', async () => {
  await monter({ uid: 'ac82-corr', db: { tirages: { [ID]: tirage() } } });
  const qui2 = { ...QUI };
  await parcoursComplet({ fautesVisite: { bureau: 5 }, qui: qui2, cr: { ...CR, salutation: 'Madame la directrice,' } });
  // Le témoin a « t-equipe » (Samia) ; on rejoue ce piège avec un 2e élève plus bas. Ici : salutation et visite.
  let n = await note();
  egal(['reperer-quai', 'reperer-bureau', 'reperer-vestiaire', 'reperer-reception'].map((j) => n.detail[j]), ['ok', 'ko', 'ok', 'ok'], 'visite : la photo du bureau après une erreur');
  egal([n.detail['cr-contenu'], n.detail['cr-salutation'], n.detail['cr-fin']], ['ok', 'ko', 'ok'], 'compte rendu : salutation seule fausse');
  proche(n.score, 20 - 0.75 - 0.5, 'note');
  let b = await fin();
  egal(b.lignes.filter(([, e]) => e === 'ko').map(([g]) => g), ['Repérer mon poste', 'Rendre compte'], 'lignes fausses');
  vrai(b.fige, 'phrase du premier essai');
  await pg.click(`${Z} [data-fin-corriger]`); await pause();
  // La réponse se renvoie ; la visite reste figée.
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  await pg.selectOption(`${Z} [data-phrase="salutation"]`, { label: 'Bonjour Samia,' });
  await pg.click(`${Z} #formPhr button[type="submit"]`); await confirmer();
  n = await note();
  egal([n.detail['cr-salutation'], n.detail['reperer-bureau']], ['ok', 'ko'], 'après correction : salutation juste, visite toujours fausse');
  b = await fin();
  egal(b.lignes.filter(([, e]) => e === 'ko').map(([g]) => g), ['Repérer mon poste'], 'reste la visite');
  vrai(!b.corriger, 'plus rien à rouvrir');
  vrai((await entrants()).some((x) => x.subject === 'Bien reçu'), 'accusé de Samia au renvoi');
  // La visite ne se rejoue pas : l'état du premier essai est gardé.
  const x = (await base()).entrepots['action-reception'];
  vrai(!!x && x.courante >= 3, 'visite toujours à sa fin');
});

await v('ENT-8.2 : corriger « Qui fait quoi ? » — « Décider de refuser une palette abîmée » donné à Kevin : bloc 2 ✗, « Corriger » rouvre la fiche, accusé de Samia, puis ✓', async () => {
  const T = tirage();
  T.pieces.taches = ['t-bl', 't-ranger', 't-refuser'];
  await monter({ uid: 'ac82-refus', db: { tirages: { [ID]: T } } });
  await parcoursComplet({ qui: { 't-bl': 'moi', 't-ranger': 'kevin', 't-refuser': 'kevin' } });
  let n = await note();
  egal(n.detail['tache-3'], 'ko', 'refuser une palette : Kevin');
  proche(n.score, 19, 'note');
  let b = await fin();
  egal(b.lignes.filter(([, e]) => e === 'ko').map(([g]) => g), ['Qui fait quoi ?'], 'ligne fausse');
  await pg.click(`${Z} [data-fin-corriger]`); await pause();
  egal(await pg.$eval(`${Z} #fi-t-refuser`, (s) => s.value), 'kevin', 'fiche rouverte avec le choix de l’élève');
  vrai(!(await pg.$eval(`${Z} #fi-t-refuser`, (s) => s.disabled)), 'liste modifiable');
  await pg.selectOption(`${Z} #fi-t-refuser`, 'samia');
  await envoyerFiche();
  n = await note();
  egal(n.detail['tache-3'], 'ok', 'après correction');
  vrai((await entrants()).filter((x) => x.subject === 'Bien reçu').length === 1, 'accusé de Samia');
  vrai(n.score < 20 && n.score > 19, 'note moyennée (premier bilan et correction) : ' + n.score);
});

await v('ENT-8.2 : bilan détaillé (CAP) — sous chaque bloc faux, une ligne par case et « Corriger dans … » ; le bouton ouvre CET écran ; la liste « À corriger » reste en haut et se coche au renvoi ; le bilan revient tout juste', async () => {
  await monter({ uid: 'ac82-detail', db: { tirages: { [ID]: tirage() } } });
  await parcoursComplet({ qui: { ...QUI, 't-ranger': 'julie' }, lire: { ...LIRE, 'l-havre-heure': '08:30' }, quai: 'Q1', t: 12 });
  let b = await fin();
  egal(b.lignes.filter(([, e]) => e === 'ko').map(([g]) => g), ['Qui fait quoi ?', 'Le planigramme'], 'blocs faux');
  const detail = () => pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
  egal(await detail(), [['tache-1', 'ok', ''], ['tache-2', 'ko', 'fiche:qui-fait-quoi'], ['tache-3', 'ok', ''],
    ['lecture-1', 'ko', 'fiche:planigramme'], ['lecture-2', 'ok', ''], ['v1-quai-libre', 'ko', 'planning:action-quais'], ['v1-creneau', 'ok', '']], 'lignes du détail');
  if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/7-bilan-detail.png`, fullPage: true });
  const txt = await pg.$eval(`${Z} [data-fin-seance]`, (e) => e.textContent.replace(/\s+/g, ' '));
  vrai(/Corriger dans « Lire le planigramme »/.test(txt) && /Corriger dans « Planning des quais »/.test(txt) && /Corriger dans « Qui fait quoi \? »/.test(txt), 'noms des écrans : ' + txt);
  vrai(!/07:00|7 h|kevin|Kevin|Quai 2/.test(txt.replace(/Quai 2 est prêt[^.]*\./, '')), 'aucune bonne réponse dans le bilan');
  await pg.click(`${Z} [data-fin-aller="planning:action-quais"]`); await pause();
  vrai(await present('[data-pl-grille]'), 'le planning s’ouvre (et non la première fiche)');
  const liste = () => pg.$$eval(`${Z} [data-acorriger] [data-acorr]`, (L) => L.map((l) => [l.dataset.acorr, l.dataset.acorrFait]));
  egal(await liste(), [['fiche:qui-fait-quoi', 'false'], ['fiche:planigramme', 'false'], ['planning:action-quais', 'false']], 'liste « À corriger »');
  await planning('Q2', 12);
  egal(await liste(), [['fiche:qui-fait-quoi', 'false'], ['fiche:planigramme', 'false'], ['planning:action-quais', 'true']], 'planning renvoyé : coché');
  if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/8-a-corriger.png` });
  vrai(/Il te reste 2 écrans à corriger/.test(await pg.$eval(`${Z} [data-acorriger]`, (e) => e.textContent)), 'reste 2');
  await pg.click(`${Z} [data-acorr-aller="fiche:planigramme"]`); await pause();
  await pg.selectOption(`${Z} #fi-l-havre-heure`, '07:00'); await envoyerFiche();
  await pg.click(`${Z} [data-acorr-aller="fiche:qui-fait-quoi"]`); await pause();
  await pg.selectOption(`${Z} #fi-t-ranger`, 'kevin'); await envoyerFiche();
  b = await fin();
  egal(b && b.fin, 'ok', 'bilan revenu, tout juste');
  vrai(!(await present('[data-acorriger]')), 'la liste « À corriger » est partie');
  // Sans le drapeau (une séance qui ne le déclare pas) : ni détail ni liste.
  await pg.evaluate(async () => { const A = await import('/activites/action-prise-de-poste.js'); A.meta.bilanDetail = false; });
  await monter({ uid: 'ac82-detail-sans', db: { tirages: { [ID]: tirage() } } });
  await parcoursComplet({ qui: { ...QUI, 't-ranger': 'julie' } });
  b = await fin();
  egal(b.lignes.filter(([, e]) => e === 'ko').map(([g]) => g), ['Qui fait quoi ?'], 'sans le drapeau : le bloc faux');
  egal(await detail(), [], 'sans le drapeau : aucune ligne de détail');
  await pg.click(`${Z} [data-fin-corriger]`); await pause();
  vrai(!(await present('[data-acorriger]')), 'sans le drapeau : pas de liste');
  await pg.evaluate(async () => { const A = await import('/activites/action-prise-de-poste.js'); A.meta.bilanDetail = true; });
});

await v('ENT-8.2 : étape suivante (CAP) — la barre nomme l’écran à faire et y mène, se tait sur cet écran ; le menu « Mon poste » suit l’ordre de la séance (la visite en premier)', async () => {
  const barre = () => pg.$eval(`${Z} [data-suite-seance]`, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
  await monter({ uid: 'ac82-suite', db: { tirages: { [ID]: tirage() } } });
  egal(await barre(), 'Étape suivante : Visite de la réception Y aller →', 'au départ');
  await pg.click(`${Z} [data-suite-aller]`); await pause();
  vrai(await present('.pv'), 'la visite s’ouvre');
  egal(await barre(), '', 'pas de barre sur l’écran de l’étape');
  await visite();
  egal(await barre(), 'Étape suivante : Qui fait quoi ? Y aller →', 'après la visite');
  await pg.click(`${Z} [data-suite-aller]`); await pause();
  vrai(await present('[data-fiche="qui-fait-quoi"]'), 'la fiche « Qui fait quoi ? » s’ouvre');
  const poste = await pg.$$eval(`${Z} .ent-side .ent-nav`, (L) => L.map((b) => b.dataset.vue || b.dataset.vueFermee));
  egal(poste.slice(poste.indexOf('entrepot')), ['entrepot', 'fiche'], 'menu : la visite puis « Qui fait quoi ? »');
  await qui();
  egal(await barre(), 'Étape suivante : Lire le planigramme Y aller →', 'après « Qui fait quoi ? »');
});

await v('ENT-8.2 : planning à l’écran — Quai 1 à 9 h (déjà pris) : jalon du quai faux, la fenêtre juste ; Quai 3 à 11 h : la fenêtre fausse', async () => {
  for (const [r, t, attendu] of [['Q1', 12, ['ko', 'ok']], ['Q3', 20, ['ok', 'ko']], ['Q2', 12, ['ok', 'ok']]]) {
    await monter({ uid: `ac82-pl-${r}`, db: { tirages: { [ID]: tirage() }, fiches: { 'qui-fait-quoi': { valeurs: QUI, envoye: { at: 1 } }, planigramme: { valeurs: LIRE, envoye: { at: 1 } } },
      gestes: { [ID]: { 'fiche:qui-fait-quoi:envoyer': 1, 'fiche:planigramme:envoyer': 1 } } } });
    await planning(r, t);
    const s = await pg.evaluate(async () => {
      const S = await import('/contenus/action-ent82.js');
      return S.ETAPES.filter((e) => /^v1-/.test(e.id)).map((e) => e.verifier(window.__f.db).status);
    });
    egal(s, attendu, `${r} au créneau ${t}`);
  }
});

await v('ENT-8.2 : confirmé à l’écran — 4 tâches, 3 lectures, bandeau identique (6 lignes), aucun « bonus » écrit ; cas bonus faux : la note du socle ne bouge pas', async () => {
  await monter({ uid: 'ac82-conf', aisance: 'confirme', db: { tirages: { [ID]: tirage({ confirme: true }) } } });
  await visite();
  const ids = await qui({ ...QUI, 't-rdv': 'kevin' });
  egal(ids.length, 4, 'quatre tâches');
  const lus = await lire({ ...LIRE, 'l-dernier': 'papeterie' });
  egal(lus.length, 3, 'trois lectures');
  await planning(); await documents(); await avant(); await compteRendu();
  const n = await note();
  proche(n.score, 20, 'note du socle');
  egal(n.detail.bonus && [n.detail.bonus.justes, n.detail.bonus.total, n.detail.bonus.etats], [0, 2, { 'bonus-tache': 'ko', 'bonus-lecture': 'ko' }], 'bonus faux');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau identique');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.2 : tirage stable — le même après rechargement (même base), et le même d’une ouverture à l’autre pour la même graine ; zéro secours', async () => {
  await monter({ uid: 'ac82-stable' });
  const a = (await base()).tirages[ID];
  await monter({ uid: 'ac82-stable', db: await base() });
  const b = (await base()).tirages[ID];
  egal([b.pieces, b.valeurs, b.at], [a.pieces, a.valeurs, a.at], 'rechargé');
  await monter({ uid: 'ac82-stable' });
  const c = (await base()).tirages[ID];
  egal([c.pieces, c.valeurs, c.secours], [a.pieces, a.valeurs, false], 'nouvelle base, même graine');
  vrai(new Set(c.pieces.taches.map((id) => ({ 't-decharger': 'kevin', 't-saisir': 'julie', 't-bl': 'moi', 't-compter': 'moi', 't-rdv': 'julie', 't-ranger': 'kevin',
    't-refuser': 'samia', 't-equipe': 'samia' })[id])).size === 3, 'trois personnes');
});

await v('ENT-8.2 : parcours — fermée tant qu’ENT-8.1 n’a pas son premier bilan (photo de fin dans sa base), ouverte ensuite', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-action', gid = 'g-verrou-action', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/action-se-situer`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, de('action-prise-de-poste'), profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'action-se-situer': { v: 1 } } }, ts: 1 }));
    const apres = await verrou(metas, de('action-prise-de-poste'), profil, gid);
    localStorage.removeItem(k);
    return { avant, apres, premiere: await verrou(metas, de('action-se-situer'), profil, gid) };
  });
  egal(r.avant, 'Termine d\'abord ENT-8.1.', 'avant le premier bilan d’ENT-8.1');
  egal(r.apres, null, 'après');
  egal(r.premiere, null, 'ENT-8.1 n’a pas de précédente');
});

await v('ENT-8.2 : écrans — visite (plan, 6 arrêts), fiche du planigramme et son document, planning (quatre quais, six créneaux pris) tiennent à 1366 × 768 sans défilement horizontal', async () => {
  await monter({ uid: 'ac82-ecran', db: { tirages: { [ID]: tirage() }, fiches: { 'qui-fait-quoi': { valeurs: QUI, envoye: { at: 1 } } },
    gestes: { [ID]: { 'entrepot:action-reception:visite:fin': 1, 'fiche:qui-fait-quoi:envoyer': 1, 'fiche:planigramme:envoyer': 1 } } } });
  const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await allerV('entrepot');
  await pg.click(`${Z} .pv [data-pv="suivant"]`); await pause();
  egal(await pg.$$eval(`${Z} .pv svg [data-pe-zone]`, (L) => L.map((x) => x.dataset.peZone)), ['vestiaire', 'controle'], 'zones nommées du plan');
  vrai(await large() <= 0, 'visite : défilement horizontal');
  await allerV('fiche:planigramme');
  const doc = await pg.textContent(`${Z} [data-fiche-panneau]`);
  vrai(/PLANIGRAMME DE RÉCEPTION/.test(doc) && /Camion du Havre/.test(doc) && /7 h – 8 h 30/.test(doc), 'document du planigramme : ' + doc.slice(0, 200));
  egal(await pg.$$eval(`${Z} [data-fiche-panneau] td.ac-pris`, (L) => L.length), 6, 'six camions dans le document');
  vrai(await large() <= 0, 'fiche : défilement horizontal');
  await allerV('planning');
  egal(await pg.$$eval(`${Z} [data-pl-grille] [data-pl-case][data-r][data-t="0"]`, (L) => L.map((x) => x.dataset.r)), ['Q1', 'Q2', 'Q3', 'Q4'], 'quatre quais');
  vrai(await large() <= 0, 'planning : défilement horizontal');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.2 : corrigé enseignant — par élève : sa commande, ses tâches et ses lectures avec la réponse calculée, ses cas bonus marqués', async () => {
  const r = await pg.evaluate(async ({ T }) => {
    const C = await import('/contenus/corriges/ENT-8.2.js');
    const e = C.corrigeEleve({ tirages: { 'action-prise-de-poste': T } }, 'x');
    const vide = C.corrigeEleve({}, 'eleve-1');
    return { items: e.items.map((i) => [i.texte, i.rep, !!i.bonus]), vide: [vide.texte.length > 0, vide.items.length], n: C.CORRIGE.items.length };
  }, { T: tirage({ confirme: true }) });
  egal(r.items[0], ['Sa commande (sur ses documents)', 'n° AC-123456 · 1200 cartons commandés · 1128 livrés · il en manque 72 (question I)', false], 'commande');
  egal(r.items.slice(1), [
    ['Tâche : Vérifier le bon de livraison avec le chauffeur.', 'toi, réceptionnaire', false],
    ['Tâche : Amener une palette contrôlée jusqu’au stock.', 'Kevin, cariste', false],
    ['Tâche : Répartir le travail de l’équipe le matin.', 'Samia, cheffe d’équipe', false],
    ['Tâche : Noter au planigramme le rendez-vous d’un fournisseur.', 'Julie, agent administratif', true],
    ['Lecture : À quelle heure le camion du Havre est-il attendu ?', '7 h', false],
    ['Lecture : Combien de camions sont prévus au quai 3 ce matin ?', '2', false],
    ['Lecture : Quel camion libère son quai le dernier ?', 'le fournisseur de jouets', true]], 'tâches et lectures');
  egal(r.vide, [true, 6], 'élève qui n’a pas ouvert la séance : son tirage à venir');
  egal(r.n, 6, 'parties du corrigé commun');
});

await F.fermer();
}
