// Suite de tests de Prepalog — bloc « action-84 » : ENT-8.4 Action, « la semaine avant Noël » (CAP OL, entraînement CAP-C1.2, erreur induite).
// Brief `docs/briefs/ENT-8.4-action-avant-noel.md` §8 ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §6.3.
// `node outils/test.mjs action-84` ne lance que ce bloc. Aides communes (ouvrir la page, lire la base) : `outils/test/france-boissons/commun.mjs`.
//
// Valeurs ÉCRITES À LA MAIN (brief §6.1, grille identique pour toute la classe ; échelle 06:00–13:00, pas 30 min) :
//   la carte de Romain « Jeux de société — 1 h 30 » est posée au quai 3 à 7 h 30 : elle chevauche les produits ménagers (6 h 30 – 8 h), seule
//   paire en conflit ; le seul créneau libre de 1 h 30 finissant avant midi : quai 3 de 10 h 30 à 12 h. Créneaux du planning (rang t de la
//   demi-heure depuis 6 h) : 7 h 30 → 3, 9 h → 6, 10 h → 8, 10 h 30 → 9, 11 h → 10.
//   Lectures : les retours au quai 2 ; le dernier au quai 2 : la papeterie ; au quai 1 à 10 h : la confiserie ; 2 camions du Havre ; le 1er à
//   libérer le quai 4 : le 2e camion du Havre (8 h) ; 12 camions sans celui de Romain.
//   Plan : contrôle 1, vestiaire 2, quai 3, local de charge 4, point de rassemblement 5, litiges 6, bureau 7, retours 8.
// Élève TÉMOIN (tirage posé à la main) : lieux l-retours, l-quai, l-bureau, l-charge ; tâches t-bl (toi), t-ranger (Lucas), t-equipe (Romain) ;
// lecture l-q1-10h ; documents transport puis commande ; commande n° AC-123456, N = 1 200, k = 72, 1 128 livrés. Confirmé : en plus la tâche
// t-changer-rdv (Inès) et la lecture l-total (12).
// Poids : lieux 4 × 0,625 · tâches 0,75 / 0,75 / 1 · lecture 1, camion trouvé 1,5, camion replacé 2 · documents 1 + 1 + 1 + 1 · compte rendu
// 0,75 + 0,75 + 0,5 + 0,5 ; questions Q 1,5, S 1,5, R 1 (part 4).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT84 || '';

const ID = 'action-avant-noel';
const PL = 'action-labastide-quais';
const REP_OUV = { creneau: 'reserve', 'zone-retours': 'magasins', rassemblement: 'rassemblement', planigramme: 'camions', 'rendre-compte': 'dire',
  cariste: 'chariot', consigne: 'repeter', 'img-transpalette': 'transpalette', 'img-chariot': 'chariot', 'img-niveleur': 'passer' };
const VALEURS = { numero: 123456, N: 1200, k: 72 };
const tirage = (o = {}) => ({ graine: `temoin|${ID}`,
  pieces: { lieux: ['l-retours', 'l-quai', 'l-bureau', 'l-charge'], taches: ['t-bl', 't-ranger', 't-equipe'], lectures: ['l-q1-10h'], documents: ['transport', 'commande'] },
  difficultes: { lieux: { 'l-retours': 'difficile', 'l-quai': 'facile', 'l-bureau': 'moyen', 'l-charge': 'moyen' },
    taches: { 't-bl': 'facile', 't-ranger': 'moyen', 't-equipe': 'difficile', 't-changer-rdv': 'moyen' },
    lectures: { 'l-q1-10h': 'facile', 'l-total': 'difficile' }, documents: { transport: 'facile', commande: 'facile' } },
  ...(o.confirme ? { bonus: { taches: ['t-changer-rdv'], lectures: ['l-total'] } } : {}),
  valeurs: { ...VALEURS }, essai: 0, secours: false, at: 1 });
// Les réponses justes du témoin, écrites à la main.
const LIEUX = { 'l-retours': '8', 'l-quai': '3', 'l-bureau': '7', 'l-charge': '4' };
const QUI = { 't-bl': 'moi', 't-ranger': 'lucas', 't-equipe': 'romain', 't-changer-rdv': 'ines' };
const LIRE = { 'l-q1-10h': 'confiserie', trouve: 'societe', 'l-total': '12' };
const DOCS = { transport: 'voiture', commande: 'commande', ouvrir: 'encombre', dabord: 'degager' };
const CR = { salutation: 'Bonjour Romain,', conflit: 'Le camion de jeux de société était au quai 3 en même temps que les produits ménagers.',
  creneau: 'Je l’ai mis au quai 3 de 10 h 30 à 12 h.', fin: 'Je reste à la réception. Lea' };
const BONNES_Q = { 'heure-de-plus': 'convention', 'qui-doit-livrer': 'commande', 'pourquoi-decembre': 'noel' };
const FAUSSES_Q = { 'heure-de-plus': 'romain', 'qui-doit-livrer': 'bl', 'pourquoi-decembre': 'froid' };
const GROUPES = ['Repérer mon poste', 'Qui fait quoi ?', 'Le planigramme', 'Les documents du camion', 'Rendre compte', 'Les questions de Romain'];
const JALONS = ['lieu-1', 'lieu-2', 'lieu-3', 'lieu-4', 'tache-facile', 'tache-moyen', 'tache-difficile', 'lecture', 'trouve', 'v1-replace',
  'doc-1', 'doc-2', 'ouvrir', 'dabord', 'cr-conflit', 'cr-creneau', 'cr-salutation', 'cr-fin'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;

// Monte la séance dans la page. `o.db` : une base de départ ; les réponses d'« Avant de commencer » sont posées (sauf `sansOuverture`).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-avant-noel.js');
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
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac84' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }), suivante: o.suivante || null,
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });
// Le menu ne se redessine qu'au changement d'écran : comme l'élève, on passe par la Messagerie.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
let capturer = false;
// (Avant une capture, les cartes « Nouveau message » sont fermées, comme l'élève le fait : elles poussent l'écran vers le bas.)
const capture = async (nom) => {
  if (!CAPTURES || !capturer) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); }
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};

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
const choisir = async (ficheId, rep, choix) => {
  const ids = await pg.$$eval(`${Z} [data-fiche="${ficheId}"] select[data-fiche-champ]`, (L) => L.map((s) => s.dataset.ficheChamp));
  for (const id of ids) { await pg.selectOption(`${Z} #fi-${id}`, rep[id]); await pause(30); await qrep(choix); }
  return ids;
};

async function reperer(rep = LIEUX) { await allerV('fiche'); const ids = await choisir('reperer', rep); await capture('1-reperer'); await envoyerFiche(); return ids; }
async function qui(rep = QUI) { await allerV('fiche:qui-fait-quoi'); const ids = await choisir('qui-fait-quoi', rep); await capture('2-qui-fait-quoi'); await envoyerFiche(); return ids; }
async function lire(rep = LIRE, choix = BONNES_Q) {
  await allerV('fiche:planigramme'); const ids = await choisir('planigramme', rep, choix); await capture('3-planigramme'); await envoyerFiche(); return ids;
}
// Le planning : la carte de Romain déplacée sur le quai `r` au créneau `t` (null : laissée à sa place).
async function planning(r = 'Q3', t = 9, choix = BONNES_Q) {
  await allerV('planning');
  await capture('4-planning-depart');
  if (r) {
    await pg.click(`${Z} [data-pl-id="societe"][data-pl-vue="b"]`);
    const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
    await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
    await pg.click(sel, { force: true });
    await pause();
    await qrep(choix);
    await capture('5-planning-deplace');
  }
  await pg.click(`${Z} [data-pl="envoyer"]`);
  await pause(60);
  if (await present('[data-pl="quandMeme"]')) await pg.click(`${Z} [data-pl="quandMeme"]`);
  else if (await present('[data-confirme-oui]')) await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  await qrep(choix);
}
async function documents(rep = DOCS, choix = BONNES_Q) {
  await allerV('fiche:documents');
  await choisir('documents', rep, choix);
  for (const id of ['ouvrir', 'dabord']) { await pg.check(`${Z} input[data-fiche-champ="${id}"][value="${rep[id]}"]`); await pause(30); }
  if (CAPTURES && capturer) {
    for (const d of ['bon-commande', 'bon-livraison', 'lettre-voiture', 'note-quai']) { await pg.click(`${Z} [data-fiche-doc="${d}"]`); await pause(); await capture(`6-${d}`); }
  }
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
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); await qrep(choix); }
  await capture('7-reponse-phrases');
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await confirmer();
  await qrep(choix);
}
async function parcoursComplet(o = {}) {
  await reperer(o.lieux);
  await qui(o.qui);
  await lire(o.lire, o.q);
  await planning(o.quai === undefined ? 'Q3' : o.quai, o.t == null ? 9 : o.t, o.q);
  await documents(o.docs, o.q);
  await compteRendu(o.cr, o.q);
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const choixCreneau = async () => pg.$$eval(`${Z} [data-phrase="creneau"] option`, (L) => L.map((o) => o.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));

// ─────────────────────────────────────────────────────────── la grille, calculée par le contenu (valeurs écrites ici à la main)
await v('ENT-8.4 : planigramme — une seule paire en conflit (la carte de Romain contre les produits ménagers), un seul créneau libre (quai 3, 10 h 30), lectures et « quel camion ? » calculés', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent84-donnees.js');
    const L = S.lecturesDe();
    return { justes: Object.fromEntries(Object.entries(L).map(([id, x]) => [id, x.juste])), uniques: Object.values(L).map((x) => x.justes.length),
      conflits: S.conflits(S.GRILLE_ROMAIN), libres: S.placesLibres(), ecarts: S.ecartsGrille(), trouve: S.TROUVE.map((c) => c.v),
      carte: [S.CARTE.depart, S.CARTE.duree, S.CARTE.avant], echelle: S.ECHELLE };
  });
  egal(r.justes, { 'l-retours-quai': 'Q2', 'l-q2-dernier': 'papeterie', 'l-q1-10h': 'confiserie', 'l-havre-combien': '2', 'l-q4-premier': 'havre2', 'l-total': '12' }, 'bonnes réponses');
  egal(r.uniques, [1, 1, 1, 1, 1, 1], 'une seule bonne réponse par lecture');
  egal(r.conflits, [['menagers', 'societe']], 'une seule paire en conflit');
  egal(r.libres, [['Q3', 630]], 'le seul créneau libre de 1 h 30 avant midi');
  egal(r.ecarts, [], 'contrôle de la grille');
  egal(r.trouve, ['decorations', 'societe', 'vaisselle', 'havre'], 'choix de « quel camion ? » (jamais les produits ménagers)');
  egal(r.carte, [{ ligne: 'Q3', de: '07:30' }, 90, '12:00'], 'la carte de Romain');
  egal(r.echelle, { debut: '06:00', fin: '13:00', pas: 30 }, 'échelle');
});

await v('ENT-8.4 : contrôle du contenu — une grille à deux conflits, sans créneau libre ou à lecture ambiguë est refusée ; la vraie passe', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent84-donnees.js');
    const deplace = (id, quai, de, a) => S.CAMIONS.map((c) => (c.id === id ? { ...c, quai, de, a } : c));
    return {
      deux: S.ecartsGrille(deplace('vaisselle', 'Q3', '08:30', '10:00')),
      sansLibre: S.ecartsGrille([...S.CAMIONS, { id: 'x', quai: 'Q3', de: '10:30', a: '12:00', court: 'X', lib: 'x' }]),
      ambigu: S.ecartsGrille(deplace('bougies', 'Q2', '08:30', '10:30').map((c) => (c.id === 'papeterie' ? { ...c, de: '10:30', a: '12:00' } : c))
        .concat([{ id: 'y', quai: 'Q2', de: '10:30', a: '11:00', court: 'Y', lib: 'y' }])),
      vraie: S.ecartsGrille(),
    };
  });
  vrai(r.deux.some((x) => /paire/.test(x)), 'deux conflits non vus : ' + r.deux);
  vrai(r.sansLibre.some((x) => /aucun créneau libre/.test(x)), 'grille sans créneau non vue : ' + r.sansLibre);
  vrai(r.ambigu.some((x) => /l-q2-dernier/.test(x)), 'lecture ambiguë non vue : ' + r.ambigu);
  egal(r.vraie, [], 'la grille de la séance');
});

await v('ENT-8.4 : déclaration (CAP, CAP-C1.2, entraînement, 20 points, parcours après ENT-8.3, livrée fermée aux élèves) ; poids par bloc ; questions Q, S, R', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-avant-noel.js');
    const S = await import('/contenus/action-ent84.js');
    const Q = await import('/contenus/questions/ENT-8.4.js');
    const m = A.meta;
    const socle = S.ETAPES.filter((e) => !e.bonus);
    return {
      m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente,
        m.niveauxPrevus, m.questions, m.pret, m.ouverture, m.corrige],
      ids: socle.map((e) => e.id), poids: socle.map((e) => e.poids), somme: socle.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part,
      parGroupe: Object.entries(socle.reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})),
      sansEcran: socle.filter((e) => !e.ecran).map((e) => e.id),
      qPoids: Q.QUESTIONS.liste.filter((q) => q.type === 'fil').map((q) => [q.id, q.poids, q.apres || 'tout de suite']),
      bonus: S.ETAPES.filter((e) => e.bonus).map((e) => [e.id, e.poids, e.groupe]),
      ouv: [Q.QUESTIONS.ouverture.tirage, Q.QUESTIONS.ouverture.questions.length],
    };
  });
  egal(r.m, ['action-avant-noel', 'ENT-8.4', 'simulog', ['cap'], [], ['CAP-C1.2'], 'entrainement', 20, true, true, true, 'action-autre-site', ['confirme'], 'ENT-8.4',
    true, 'prof', './contenus/corriges/ENT-8.4.js'], 'meta ENT-8.4');
  egal(r.ids, JALONS, 'jalons du socle');
  egal(r.poids, [0.625, 0.625, 0.625, 0.625, 0.75, 0.75, 1, 1, 1.5, 2, 1, 1, 1, 1, 0.75, 0.75, 0.5, 0.5], 'poids jalon par jalon (écrits à la main)');
  proche(r.somme, 16, 'somme des poids des jalons');
  egal(r.part, 4, 'part des questions');
  egal(r.parGroupe, [['Repérer mon poste', 2.5], ['Qui fait quoi ?', 2.5], ['Le planigramme', 4.5], ['Les documents du camion', 4], ['Rendre compte', 2.5]], 'points par ligne du bandeau');
  egal(r.sansEcran, [], 'tous les jalons se rouvrent');
  egal(r.qPoids, [['heure-de-plus', 1.5, 'tout de suite'], ['qui-doit-livrer', 1.5, 'tout de suite'], ['pourquoi-decembre', 1, 'tout de suite']], 'questions au fil');
  egal(r.bonus, [['bonus-tache', undefined, undefined], ['bonus-lecture', undefined, undefined]], 'cas bonus sans poids ni groupe');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 10], 'Avant de commencer : 10 notions, 3 + 1 tirées');
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
// `d` : ce que l'élève a envoyé ; `d.planning` : [quai, rang] de la carte envoyée ; `d.cr` : la réponse par phrases (texte par ligne).
const jalonsSans = (d, o = {}) => pg.evaluate(async ({ T, d }) => {
  const S = await import('/contenus/action-ent84.js');
  const { preparerPhrases } = await import('/core/phrases.js');
  const db = { tirages: { 'action-avant-noel': T }, fiches: {}, mails: [] };
  const env = (id, valeurs) => { db.fiches[id] = { valeurs, envoye: { at: 1 } }; };
  if (d.lieux) env('reperer', d.lieux);
  if (d.qui) env('qui-fait-quoi', d.qui);
  if (d.lire) env('planigramme', d.lire);
  if (d.docs) env('documents', d.docs);
  if (d.planning) db.plannings = { 'action-labastide-quais': { v1: { place: d.planning[0] ? { societe: { r: d.planning[0], s: d.planning[1] } } : {} } } };
  if (d.cr) {
    const m = preparerPhrases({ folder: 'in', subject: 'Rends-moi compte', phrases: S.phrasesCompteRendu('Lea') }, db, 'g');
    db.mails.push(m);
    const choix = Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.indexOf(d.cr[l.id])]));
    db.mails.push({ folder: 'out', ts: 2, id: 2, phrases: { id: 'compte-rendu-romain', choix } });
    if (d.apres) db.plannings['action-labastide-quais'].v1.place = d.apres[0] ? { societe: { r: d.apres[0], s: d.apres[1] } } : {};
  }
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, (e.verifier(db) || { status: 'null' }).status]));
}, { T: tirage(o), d });

await v('ENT-8.4 : jalons sans écran — rien d’envoyé : tout « à faire » ; les fiches et le planning font tomber LEUR jalon ; camion laissé à la place de Romain = faux', async () => {
  const vide = await jalonsSans({});
  egal(JALONS.map((j) => vide[j]), JALONS.map(() => 'attente'), 'rien envoyé');
  egal([vide['bonus-tache'], vide['bonus-lecture']], ['null', 'null'], 'standard : pas de cas bonus');
  const juste = { lieux: LIEUX, qui: QUI, lire: LIRE, docs: DOCS, planning: ['Q3', 9], cr: CR };
  const s = await jalonsSans(juste);
  egal(JALONS.filter((j) => s[j] !== 'ok'), [], 'parcours juste');
  const ko = async (f) => { const d = JSON.parse(JSON.stringify(juste)); f(d); const x = await jalonsSans(d); return JALONS.filter((j) => x[j] !== 'ok'); };
  egal(await ko((d) => { d.lieux['l-quai'] = '2'; }), ['lieu-2'], 'le quai : n° 2');
  egal(await ko((d) => { d.lieux['l-retours'] = '6'; }), ['lieu-1'], 'la zone de retours confondue avec les litiges');
  egal(await ko((d) => { d.qui['t-equipe'] = 'lucas'; }), ['tache-difficile'], 'répartir l’équipe donné à Lucas');
  egal(await ko((d) => { d.lire['l-q1-10h'] = 'decorations'; }), ['lecture'], 'au quai 1 à 10 h : les décorations');
  egal(await ko((d) => { d.lire.trouve = 'vaisselle'; }), ['trouve'], 'mauvais camion trouvé');
  egal(await ko((d) => { d.planning = ['Q3', 3]; d.cr.creneau = 'Je ne l’ai pas déplacé.'; }), ['v1-replace'], 'laissé à la place de Romain : planning faux, compte rendu honnête juste');
  egal(await ko((d) => { d.planning = ['Q1', 6]; d.cr.creneau = 'Je l’ai mis au quai 1 de 9 h à 10 h 30.'; }), ['v1-replace'], 'quai 1 à 9 h : déjà pris');
  egal(await ko((d) => { d.planning = ['Q3', 10]; d.cr.creneau = 'Je l’ai mis au quai 3 de 11 h à 12 h 30.'; }), ['v1-replace'], 'quai 3 à 11 h : finit après midi');
  egal(await ko((d) => { d.docs.commande = 'facture'; }), ['doc-2'], '« la facture » pour la commande');
  egal(await ko((d) => { d.docs.ouvrir = 'pret'; }), ['ouvrir'], '« oui, tout est prêt »');
  egal(await ko((d) => { d.docs.dabord = 'ouvrir'; }), ['dabord'], 'ouvrir quand même');
  egal(await ko((d) => { d.cr.conflit = 'Il n’y avait aucun problème sur le planigramme.'; }), ['cr-conflit'], 'aucun problème');
  egal(await ko((d) => { d.cr.salutation = 'Salut Romain,'; d.cr.fin = 'Cordialement'; }), ['cr-salutation', 'cr-fin'], 'forme');
  // Envoyer le planning sans la carte (retirée) : faux, jamais « à faire ».
  egal((await jalonsSans({ planning: [null] }))['v1-replace'], 'ko', 'planning envoyé sans la carte');
});

await v('ENT-8.4 : rendre compte — la ligne « nouveau créneau » est jugée sur ce que l’élève a POSÉ (quai 2 à 10 h : planning ✗, ligne ✓) ; rien déplacé + « Je ne l’ai pas déplacé. » ✓ ; planning corrigé après le compte rendu : rejugée', async () => {
  const base = { lieux: LIEUX, qui: QUI, lire: LIRE, docs: DOCS };
  const q2 = await jalonsSans({ ...base, planning: ['Q2', 8], cr: { ...CR, creneau: 'Je l’ai mis au quai 2 de 10 h à 11 h 30.' } });
  egal([q2['v1-replace'], q2['cr-creneau']], ['ko', 'ok'], 'quai 2 à 10 h dit tel quel');
  const q2b = await jalonsSans({ ...base, planning: ['Q2', 8], cr: { ...CR } });
  egal(q2b['cr-creneau'], 'ko', 'quai 2 à 10 h posé, mais « quai 3 de 10 h 30 » écrit (ce qu’il n’a pas fait)');
  const rien = await jalonsSans({ ...base, planning: ['Q3', 3], cr: { ...CR, creneau: 'Je ne l’ai pas déplacé.' } });
  egal([rien['v1-replace'], rien['cr-creneau']], ['ko', 'ok'], 'rien déplacé, dit honnêtement');
  const rienFaux = await jalonsSans({ ...base, planning: ['Q3', 3], cr: { ...CR } });
  egal(rienFaux['cr-creneau'], 'ko', 'rien déplacé, mais « quai 3 de 10 h 30 » écrit');
  // Planning corrigé APRÈS le compte rendu (quai 2 → quai 3 à 10 h 30) : la phrase du quai 3 est parmi les choix du mail → la ligne suit la pose.
  const corr = await jalonsSans({ ...base, planning: ['Q2', 8], cr: { ...CR, creneau: 'Je l’ai mis au quai 2 de 10 h à 11 h 30.' }, apres: ['Q3', 9] });
  egal([corr['v1-replace'], corr['cr-creneau']], ['ok', 'ko'], 'planning corrigé : la ligne est rejugée contre la nouvelle pose');
  // Corrigé vers une place absente des choix (quai 4 à 9 h 30, faux) : on juge sur la pose du moment du compte rendu.
  const hors = await jalonsSans({ ...base, planning: ['Q2', 8], cr: { ...CR, creneau: 'Je l’ai mis au quai 2 de 10 h à 11 h 30.' }, apres: ['Q4', 7] });
  egal(hors['cr-creneau'], 'ok', 'nouvelle pose hors des choix : jugé sur la pose du compte rendu');
});

await v('ENT-8.4 : confirmé — cas bonus (une tâche, une lecture) jugés à part, `null` chez un standard', async () => {
  const d = { lieux: LIEUX, qui: QUI, lire: LIRE, docs: DOCS, planning: ['Q3', 9], cr: CR };
  const s = await jalonsSans(d, { confirme: true });
  egal([s['bonus-tache'], s['bonus-lecture']], ['ok', 'ok'], 'bonus justes');
  const f = await jalonsSans({ ...d, qui: { ...QUI, 't-changer-rdv': 'lucas' }, lire: { ...LIRE, 'l-total': '13' } }, { confirme: true });
  egal([f['bonus-tache'], f['bonus-lecture']], ['ko', 'ko'], 'bonus faux');
  egal(JALONS.filter((j) => f[j] !== 'ok'), [], 'le socle reste juste');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-8.4 : tirage — 300 graines (standard et confirmé) : 4 lieux (1 facile, 2 moyens, 1 difficile), trois personnes différentes, une lecture, deux documents, commande cohérente, zéro secours', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent84-donnees.js');
    const out = { pasTrois: 0, secours: 0, commande: 0, lieux: new Set(), lect: new Set(), docs: 0, confirme: [], k: new Set(), N: new Set() };
    for (let i = 0; i < 300; i++) {
      for (const confirme of [false, true]) {
        const t = S.TIRAGE.tirer(`eleve-${i}|action-avant-noel`, { confirme });
        const T = t.pieces.taches.map((id) => S.BANQUE_TACHES.find((p) => p.id === id));
        if (new Set(T.map((p) => p.qui)).size !== 3) out.pasTrois++;
        if (t.secours) out.secours++;
        const V = t.valeurs;
        if (!(V.k > 0 && V.k < V.N && V.N % 24 === 0 && V.k % 24 === 0 && V.N >= 720 && V.N <= 1440 && V.k >= 24 && V.k <= 96)) out.commande++;
        out.lieux.add(t.pieces.lieux.map((id) => S.BANQUE_LIEUX.find((p) => p.id === id).difficulte).sort().join(','));
        t.pieces.lectures.forEach((id) => out.lect.add(id));
        if (t.pieces.documents.length !== 2 || new Set(t.pieces.documents).size !== 2) out.docs++;
        if (confirme && i < 20) out.confirme.push([t.pieces.taches.length + t.bonus.taches.length, t.pieces.lectures.length + t.bonus.lectures.length]);
        out.k.add(V.k); out.N.add(V.N);
      }
    }
    return { ...out, lieux: [...out.lieux], lect: [...out.lect].sort(), k: [...out.k].sort((a, b) => a - b), N: out.N.size };
  });
  egal([r.pasTrois, r.secours, r.commande, r.docs], [0, 0, 0, 0], 'personnes, secours, commande, documents');
  egal(r.lieux, ['difficile,facile,moyen,moyen'], 'mélange des lieux');
  egal(r.lect, ['l-havre-combien', 'l-q1-10h', 'l-q2-dernier', 'l-retours-quai'], 'la lecture du socle : l’une des quatre premières');
  vrai(r.confirme.every(([a, b]) => a === 4 && b === 2), 'confirmé : ' + JSON.stringify(r.confirme));
  egal(r.k, [24, 48, 72, 96], 'valeurs de k');
  vrai(r.N > 15, 'N varie trop peu : ' + r.N);
});

await v('ENT-8.4 : question S — 300 graines : l’énoncé dit N et N − k, le retour dit k : les MÊMES nombres que le bon de commande et le bon de livraison de l’élève', async () => {
  const faux = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent84.js');
    const D = await import('/contenus/action-ent84-donnees.js');
    const Q = await import('/contenus/questions/ENT-8.4.js');
    const q = Q.QUESTIONS.liste.find((x) => x.id === 'qui-doit-livrer');
    const doc = (id) => S.DOCUMENTS.find((d) => d.id === id).html;
    const nb = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const out = [];
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}|action-avant-noel`;
      const db = { tirages: { 'action-avant-noel': { graine: g, ...D.TIRAGE.tirer(g) } } };
      const V = db.tirages['action-avant-noel'].valeurs;
      const x = q.selon(db);
      const okE = x.enonce.includes(`commande dit ${nb(V.N)} cartons, le bon de livraison ${nb(V.N - V.k)}.`) && x.retour.includes(`les ${nb(V.k)} cartons`);
      const okD = doc('bon-commande')(db).includes(`${nb(V.N)} cartons`) && doc('bon-livraison')(db).includes(`${nb(V.N - V.k)} cartons`);
      if (!okE || !okD) out.push([g, x.enonce]);
    }
    const vide = q.selon({}).enonce;
    if (!(vide.includes('1 152 cartons') && doc('bon-commande')({}).includes('1 152 cartons') && doc('bon-livraison')({}).includes('1 080 cartons'))) out.push(['vide', vide]);
    return out;
  });
  egal(faux, [], 'énoncés ou documents différents');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-8.4 : parcours juste à l’écran — carte de Romain posée au départ, déplacée au quai 3 à 10 h 30 ; 20 / 20, bandeau de 6 lignes ✓, R au choix du camion, Q à la pose, S à l’envoi des documents', async () => {
  capturer = true;
  await monter({ uid: 'ac84-juste', sansOuverture: true, db: { tirages: { [ID]: tirage() } } });
  // « Avant de commencer » : 3 notions + 1 image tirées, répondues juste.
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal(ov.length, 4, 'questions d’ouverture tirées');
  egal(ov.filter((id) => /^img-/.test(id)).length, 1, 'une question d’image');
  for (let k = 0; k < 4; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    if (k === 0) await capture('0-avant-de-commencer');
    await pg.click(`${Z} [data-q-choix="${REP_OUV[ov[k]]}"][data-q="${ov[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${ov[k]}"]`); await pause();
  }
  await pg.click(`${Z} [data-ouv-continuer]`); await pause();
  let m = await menu();
  vrai(m.includes('fiche') && !m.includes('fiche:qui-fait-quoi') && !m.includes('fiche:planigramme'), 'menu au départ : ' + m);
  vrai(await present('.ent-nav[data-vue-fermee="planning"]') && !(await present('.ent-nav[data-vue="planning"]')), 'planning grisé au départ');
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction : 0');
  await reperer();
  await qui();
  // R : au choix de la ligne « Quel camion Romain a-t-il mal placé ? ».
  await allerV('fiche:planigramme');
  await pg.selectOption(`${Z} #fi-l-q1-10h`, 'confiserie'); await pause();
  vrai(!(await present('[data-q-panneau]')), 'rien à la lecture');
  await pg.selectOption(`${Z} #fi-trouve`, 'societe'); await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'pourquoi-decembre', 'R au choix du camion');
  await pg.click(`${Z} [data-q-choix="noel"][data-q="pourquoi-decembre"]`); await pg.click(`${Z} [data-q-repondre="pourquoi-decembre"]`); await pause();
  egal(await pg.getAttribute(`${Z} [data-q-verdict]`, 'data-q-verdict'), 'ok', 'R corrigée tout de suite');
  await pg.click(`${Z} [data-q-reprendre]`); await pause();
  await capture('3-planigramme');
  await envoyerFiche();
  // Le planning : la carte est déjà posée à la place de Romain (quai 3, 7 h 30).
  await allerV('planning');
  egal((await base()).plannings[PL].place.societe, { r: 'Q3', s: 3 }, 'carte posée au départ à la place de Romain');
  await capture('4-planning-depart');
  vrai(!(await present('[data-q-panneau]')), 'aucune question avant la pose');
  await pg.click(`${Z} [data-pl-id="societe"][data-pl-vue="b"]`);
  await pg.click(`${Z} [data-pl-grille] [data-pl-case][data-r="Q3"][data-t="9"]`, { force: true }); await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'heure-de-plus', 'Q à la pose');
  vrai(/tous les élèves sont soumis à la durée hebdomadaire légale/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'le texte de la convention dans l’énoncé');
  await qrep();
  await capture('5-planning-deplace');
  await pg.click(`${Z} [data-pl="envoyer"]`); await pause(60);
  if (await present('[data-pl="quandMeme"]')) await pg.click(`${Z} [data-pl="quandMeme"]`); else if (await present('[data-confirme-oui]')) await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  egal((await base()).plannings[PL].v1.place.societe, { r: 'Q3', s: 9 }, 'pose envoyée');
  // S : à l'envoi des documents, avec SES nombres.
  await allerV('fiche:documents');
  await choisir('documents', DOCS);
  for (const id of ['ouvrir', 'dabord']) await pg.check(`${Z} input[data-fiche-champ="${id}"][value="${DOCS[id]}"]`);
  for (const d of ['bon-commande', 'bon-livraison', 'lettre-voiture', 'note-quai']) { await pg.click(`${Z} [data-fiche-doc="${d}"]`); await pause(); await capture(`6-${d}`); }
  await envoyerFiche();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'qui-doit-livrer', 'S à l’envoi');
  vrai(/Le bon de commande dit 1 200 cartons, le bon de livraison 1 128\./.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'S : ses nombres');
  await pg.click(`${Z} [data-q-choix="commande"][data-q="qui-doit-livrer"]`); await pg.click(`${Z} [data-q-repondre="qui-doit-livrer"]`); await pause();
  vrai(/doit les 72 cartons qui manquent/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'retour de S avec k');
  await pg.click(`${Z} [data-q-reprendre]`); await pause();
  await ouvrirMail('Rends-moi compte');
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  egal((await choixCreneau()).sort(), ['Je l’ai mis au quai 1 de 9 h à 10 h 30.', 'Je l’ai mis au quai 2 de 10 h à 11 h 30.', 'Je l’ai mis au quai 3 de 10 h 30 à 12 h.',
    'Je ne l’ai pas déplacé.'], 'choix du créneau (sa pose, deux autres, « pas déplacé »)');
  await compteRendu();
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons');
  egal(['question:heure-de-plus', 'question:qui-doit-livrer', 'question:pourquoi-decembre'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  egal(b.fin, 'ok', 'tout juste');
  await pg.$eval(`${Z} [data-fin-seance]`, (e) => e.scrollIntoView({ block: 'start' })); await capture('8-bilan');
  capturer = false;
  const sujets = (await entrants()).map((x) => x.subject);
  egal(sujets, ['La semaine avant Noël', 'L’équipe d’aujourd’hui', 'Le planigramme de ce matin', 'Le camion de jeux de société', 'Le planning des quais',
    'Le camion du Havre', 'Rends-moi compte', 'Merci'], 'tous les messages, dans l’ordre');
  egal((await entrants()).filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus');
  const ts = (await entrants()).map((x) => x.ts);
  vrai(ts.every((t, i) => !i || t >= ts[i - 1]), 'heures croissantes');
  vrai(new Date(ts[0]).getMonth() === 11 && new Date(ts[0]).getDate() === 17 && new Date(ts[0]).getHours() === 6, 'le 17 décembre à 6 h : ' + new Date(ts[0]));
  // Aucune année dans ce qu'écrit la séance (messages reçus, documents). Les messages ENVOYÉS par l'élève portent la date réelle : limite connue
  // du moteur (FICHE-SEANCE, « Les messages portent la date du scénario »).
  const ecrit = [...(await entrants()).map((x) => x.text), ...(await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent84.js'); return S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html(window.__f.db) : d.html)); }))].join('\n');
  vrai(!/\b20\d\d\b/.test(ecrit), 'une année dans un message ou un document');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.4 : inaction et pire cas — rien fait : 0 ; camion laissé à la place de Romain et tout faux : 0 / 20, premier bilan atteint, « Corriger » proposé, phrase des questions', async () => {
  await monter({ uid: 'ac84-pire', db: { tirages: { [ID]: tirage() } } });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction');
  await parcoursComplet({
    lieux: { 'l-retours': '6', 'l-quai': '1', 'l-bureau': '2', 'l-charge': '5' }, qui: { 't-bl': 'romain', 't-ranger': 'ines', 't-equipe': 'lucas' },
    lire: { 'l-q1-10h': 'aucun', trouve: 'vaisselle' }, quai: null,
    docs: { transport: 'facture', commande: 'livraison', ouvrir: 'pret', dabord: 'ouvrir' },
    cr: { salutation: 'Salut Romain,', conflit: 'Il n’y avait aucun problème sur le planigramme.', creneau: 'Je l’ai mis au quai 3 de 10 h 30 à 12 h.', fin: 'Cordialement' },
    q: FAUSSES_Q,
  });
  const n = await note();
  proche(n.score, 0, 'note');
  egal(JALONS.filter((j) => n.detail[j] !== 'ko'), [], 'tous les jalons faux');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ko']), 'bandeau');
  vrai(b.corriger && b.fige, 'Corriger et la phrase du premier essai : ' + b.texte);
  vrai(/Les questions de Romain se jouent au premier essai/.test(b.texte), 'finFige');
  const db = await base();
  vrai(!!(db.points && db.points[ID]), 'photo de fin rangée (la séance suivante s’ouvrirait)');
});

await v('ENT-8.4 : rendre compte à l’écran — quai 2 à 10 h (faux) dit tel quel : planning ✗, ligne ✓ ; rien déplacé + « Je ne l’ai pas déplacé. » : ligne ✓', async () => {
  await monter({ uid: 'ac84-q2', db: { tirages: { [ID]: tirage() } } });
  await parcoursComplet({ quai: 'Q2', t: 8, cr: { ...CR, creneau: 'Je l’ai mis au quai 2 de 10 h à 11 h 30.' } });
  let n = await note();
  egal([n.detail['v1-replace'], n.detail['cr-creneau']], ['ko', 'ok'], 'quai 2 à 10 h');
  proche(n.score, 18, 'note');
  await monter({ uid: 'ac84-rien', db: { tirages: { [ID]: tirage() } } });
  await reperer(); await qui(); await lire(); await planning(null); await documents();
  await ouvrirMail('Rends-moi compte'); await pg.click(`${Z} [data-repondre]`); await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  egal((await choixCreneau()).sort(), ['Je l’ai mis au quai 1 de 9 h à 10 h 30.', 'Je l’ai mis au quai 2 de 10 h à 11 h 30.', 'Je l’ai mis au quai 3 de 10 h 30 à 12 h.',
    'Je ne l’ai pas déplacé.'], 'choix quand rien n’a bougé');
  await compteRendu({ ...CR, creneau: 'Je ne l’ai pas déplacé.' });
  n = await note();
  egal([n.detail['v1-replace'], n.detail['cr-creneau']], ['ko', 'ok'], 'rien déplacé, dit honnêtement');
});

await v('ENT-8.4 : corriger le planning — « Corriger dans « Planning des quais » » rouvre la pose envoyée ; renvoyé au quai 3 à 10 h 30 : le jalon passe juste, la ligne du compte rendu est rejugée contre la nouvelle pose', async () => {
  await monter({ uid: 'ac84-corr', db: { tirages: { [ID]: tirage() } } });
  await parcoursComplet({ quai: 'Q2', t: 8, cr: { ...CR, creneau: 'Je l’ai mis au quai 2 de 10 h à 11 h 30.' } });
  let b = await fin();
  egal(b.lignes.filter(([, e]) => e === 'ko').map(([g]) => g), ['Le planigramme'], 'bloc faux');
  const detail = () => pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
  egal(await detail(), [['lecture', 'ok', ''], ['trouve', 'ok', ''], ['v1-replace', 'ko', `planning:${PL}`]], 'lignes du détail');
  await pg.click(`${Z} [data-fin-aller="planning:${PL}"]`); await pause();
  vrai(await present('[data-pl-grille]'), 'le planning s’ouvre');
  egal((await base()).plannings[PL].place.societe, { r: 'Q2', s: 8 }, 'la pose envoyée est rouverte');
  await planning('Q3', 9);
  const n = await note();
  egal([n.detail['v1-replace'], n.detail['cr-creneau']], ['ok', 'ko'], 'planning juste ; la phrase « quai 2 » ne dit plus ce qui est posé');
  vrai((await entrants()).some((x) => x.subject === 'Bien reçu'), 'accusé de Romain au renvoi');
});

await v('ENT-8.4 : bilan détaillé — Repérer : le NOM du lieu, jamais son numéro ; « Qui fait quoi ? » : la tâche ; les documents : la question', async () => {
  await monter({ uid: 'ac84-detail', db: { tirages: { [ID]: tirage() } } });
  await parcoursComplet({ lieux: { ...LIEUX, 'l-quai': '2' }, qui: { ...QUI, 't-ranger': 'ines' }, docs: { ...DOCS, transport: 'livraison' } });
  const lignes = await pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.dataset.finCase, l.textContent.replace(/\s+/g, ' ').trim()]));
  const t = Object.fromEntries(lignes);
  const NOMS = ['la zone de retours', 'un quai', 'le bureau du chef d’équipe', 'le local de charge des transpalettes'];
  vrai(['lieu-1', 'lieu-2', 'lieu-3', 'lieu-4'].every((j, k) => t[j] && t[j].includes(`Repérer mon poste : ${NOMS[k]}`)),
    'lieux nommés dans l’ordre de la fiche : ' + JSON.stringify(lignes.slice(0, 4)));
  vrai(lignes.filter(([j]) => /^lieu-/.test(j)).every(([, x]) => !/n°|\b[1-8]\b/.test(x)), 'aucun numéro du plan dans le bilan : ' + JSON.stringify(lignes.slice(0, 4)));
  vrai(/Amener une palette contrôlée jusqu’au stock/.test(t['tache-moyen']), 'tâche nommée : ' + t['tache-moyen']);
  vrai(/Quel document dit qui transporte la marchandise/.test(t['doc-1']), 'question de document nommée : ' + t['doc-1']);
  if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/9-bilan-detail.png`, fullPage: true });
});

await v('ENT-8.4 : confirmé à l’écran — 4 tâches, 2 lectures + « quel camion ? », bandeau identique (6 lignes), aucun « bonus » écrit', async () => {
  await monter({ uid: 'ac84-conf', aisance: 'confirme', db: { tirages: { [ID]: tirage({ confirme: true }) } } });
  await reperer();
  egal((await qui()).length, 4, 'quatre tâches');
  egal((await lire()).length, 3, 'deux lectures et « quel camion ? »');
  await planning(); await documents(); await compteRendu();
  const n = await note();
  proche(n.score, 20, 'note du socle');
  egal(n.detail.bonus && [n.detail.bonus.justes, n.detail.bonus.total], [2, 2], 'bonus justes');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau identique');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.4 : étape suivante — la barre mène de l’écran envoyé au suivant (fiche planigramme → planning → documents → compte rendu) ; le planning grisé tant que la fiche n’est pas partie', async () => {
  const barre = () => pg.$eval(`${Z} [data-suite-seance]`, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
  await monter({ uid: 'ac84-suite', db: { tirages: { [ID]: tirage() } } });
  egal(await barre(), 'Étape suivante : Repérer mon poste Y aller →', 'au départ');
  const m = await menu();
  vrai(m.includes('planning'), 'le planning est au menu');
  vrai(await present('.ent-nav[data-vue-fermee="planning"]'), 'grisé au départ');
  await reperer(); await qui();
  egal(await barre(), 'Étape suivante : Le planigramme : trouver l’erreur Y aller →', 'après « Qui fait quoi ? »');
  await lire();
  egal(await barre(), 'Étape suivante : Le planigramme : replacer le camion Y aller →', 'après la fiche du planigramme');
  await pg.click(`${Z} [data-suite-aller]`); await pause();
  vrai(await present('[data-pl-grille]'), 'la barre ouvre le planning');
  await planning();
  egal(await barre(), 'Étape suivante : Les documents du camion Y aller →', 'après le planning');
  await documents();
  egal(await barre(), 'Étape suivante : Rendre compte à Romain Y aller →', 'après les documents');
  await pg.click(`${Z} [data-suite-aller]`); await pause();
  vrai(await present('[data-repondre]'), 'la barre ouvre le message de Romain');
});

await v('ENT-8.4 : parcours — fermée tant qu’ENT-8.3 n’a pas son premier bilan (photo de fin dans sa base), ouverte ensuite', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-action84', gid = 'g-verrou-action84', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/action-autre-site`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, de('action-avant-noel'), profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'action-autre-site': { v: 1 } } }, ts: 1 }));
    const apres = await verrou(metas, de('action-avant-noel'), profil, gid);
    localStorage.removeItem(k);
    return { avant, apres };
  });
  egal(r.avant, 'Termine d\'abord ENT-8.3.', 'avant le premier bilan d’ENT-8.3');
  egal(r.apres, null, 'après');
});

await v('ENT-8.4 : un écran par étape à 1366 × 768 — le plan grand à gauche de « Repérer », la grille à gauche du planigramme (deux camions au quai 3 sur deux rangs), les quatre documents à gauche de leur fiche ; aucun défilement horizontal', async () => {
  await monter({ uid: 'ac84-ecran', db: { tirages: { [ID]: tirage() }, fiches: { reperer: { valeurs: LIEUX, envoye: { at: 1 } }, 'qui-fait-quoi': { valeurs: QUI, envoye: { at: 1 } },
    planigramme: { valeurs: LIRE, envoye: { at: 1 } } },
    gestes: { [ID]: { 'fiche:reperer:envoyer': 1, 'fiche:qui-fait-quoi:envoyer': 1, 'fiche:planigramme:envoyer': 1, [`planning:${PL}:envoyer`]: 1 } } } });
  const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  // On rouvre « Repérer » en enlevant l'envoi (comme « Corriger ») pour mesurer l'écran.
  await allerV('fiche');
  const plan = await pg.$eval(`${Z} [data-fiche-panneau] svg.lb-plan`, (s) => { const r = s.getBoundingClientRect(); return { l: r.width, h: r.height, x: r.x }; });
  const fiche = await pg.$eval(`${Z} [data-fiche="reperer"]`, (s) => s.getBoundingClientRect().x);
  vrai(plan.l >= 600, 'plan assez grand : ' + JSON.stringify(plan));
  vrai(plan.x < fiche, 'le plan est à gauche de la fiche');
  egal(await pg.$$eval(`${Z} svg.lb-plan .lb-num text`, (L) => L.map((t) => t.textContent).sort()), ['1', '2', '3', '4', '5', '6', '7', '8'], 'huit ronds numérotés');
  vrai(!!(await pg.$(`${Z} svg.lb-plan image[href$="point-rassemblement.svg"]`)), 'pictogramme du point de rassemblement');
  vrai(await large() <= 0, 'repérer : défilement horizontal');
  await allerV('fiche:planigramme');
  const doc = await pg.textContent(`${Z} [data-fiche-panneau]`);
  vrai(/PLANIGRAMME DE RÉCEPTION/.test(doc) && /Jeux de société/.test(doc) && /7 h 30 – 9 h/.test(doc), 'document du planigramme');
  egal(await pg.$$eval(`${Z} [data-fiche-panneau] td.ac-pris`, (L) => L.length), 13, 'treize camions dans le document (douze et celui de Romain)');
  egal(await pg.$eval(`${Z} [data-fiche-panneau] th[rowspan]`, (t) => [t.textContent, t.rowSpan]), ['Quai 3', 2], 'le quai 3 sur deux rangs');
  vrai(await large() <= 0, 'planigramme : défilement horizontal');
  await allerV('planning');
  egal(await pg.$$eval(`${Z} [data-pl-grille] [data-pl-case][data-r][data-t="0"]`, (L) => L.map((x) => x.dataset.r)), ['Q1', 'Q2', 'Q3', 'Q4'], 'quatre quais');
  vrai(await large() <= 0, 'planning : défilement horizontal');
  await allerV('fiche:documents');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((x) => x.dataset.ficheDoc)), ['bon-commande', 'bon-livraison', 'lettre-voiture', 'note-quai'], 'quatre documents en onglets');
  await pg.click(`${Z} [data-fiche-doc="note-quai"]`); await pause();
  vrai(/12 palettes de retours des magasins, pas encore rangées/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'la note de Lucas');
  await pg.click(`${Z} [data-fiche-doc="lettre-voiture"]`); await pause();
  vrai(/Gonfreville-l’Orcher/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)) && /Labastide-Saint-Pierre/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'lettre de voiture');
  vrai(/reconstitution, non contractuel/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'pied des documents');
  vrai(await large() <= 0, 'documents : défilement horizontal');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.4 : corrigé enseignant — par élève : sa commande, ses lieux, ses tâches, sa lecture, ses documents, ses cas bonus marqués', async () => {
  const r = await pg.evaluate(async ({ T }) => {
    const C = await import('/contenus/corriges/ENT-8.4.js');
    const e = C.corrigeEleve({ tirages: { 'action-avant-noel': T } }, 'x');
    const vide = C.corrigeEleve({}, 'eleve-1');
    return { items: e.items.map((i) => [i.texte, i.rep, !!i.bonus]), vide: [vide.texte.length > 0, vide.items.length], n: C.CORRIGE.items.length };
  }, { T: tirage({ confirme: true }) });
  egal(r.items, [
    ['Sa commande (sur ses documents)', 'n° AC-123456 · 1200 cartons commandés · 1128 livrés · il en manque 72 (question S)', false],
    ['Lieu : La zone de retours', 'n° 8', false], ['Lieu : Un quai', 'n° 3', false], ['Lieu : Le bureau du chef d’équipe', 'n° 7', false],
    ['Lieu : Le local de charge des transpalettes', 'n° 4', false],
    ['Tâche : Vérifier le bon de livraison avec le chauffeur.', 'toi, réceptionnaire', false],
    ['Tâche : Amener une palette contrôlée jusqu’au stock.', 'Lucas, cariste', false],
    ['Tâche : Répartir le travail de l’équipe le matin.', 'Romain, chef d’équipe', false],
    ['Tâche : Changer l’heure d’un rendez-vous au planigramme.', 'Inès, agent administratif', true],
    ['Lecture : Quel camion est au quai 1 à 10 h ?', 'le camion de confiserie', false],
    ['Lecture : Combien de camions sont prévus ce matin, sans celui de Romain ?', '12', true],
    ['Document : Quel document dit qui transporte la marchandise ?', 'la lettre de voiture', false],
    ['Document : Quel document dit ce qu’Action a commandé ?', 'le bon de commande', false]], 'corrigé du témoin');
  egal(r.vide, [true, 11],'élève qui n’a pas ouvert la séance : son tirage à venir');
  egal(r.n, 6, 'parties du corrigé commun');
});

await F.fermer();
}
