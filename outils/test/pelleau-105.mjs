// Suite de tests de Prepalog — bloc « pelleau-105 » : Transports Pelleau ENT-10.5, le camion de ramasse rentre (CAP OL, guidage CAP-C1.3).
// `node outils/test.mjs pelleau-105` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides communes :
// `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`, et `aidesQuai` pour l'inspection et la dépose). Brief : `docs/briefs/ENT-10.5-pelleau-camion-de-ramasse.md` §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-camion-de-ramasse.js` → `rendre`),
// de vrais clics à la SOURIS ; les listes des fiches et des phrases par `selectOption`. Mouvement réduit : le camion arrive et Yann pose d'emblée.
//
// Valeurs ÉCRITES À LA MAIN (pièces fixes du guidage, jamais recalculées par le code de la séance) :
//   Camion : P1, P2 Agri-Kerlann (40 sacs chacune) ; P3, P4 Biscuiterie Ar Vag (40 cartons chacune) ; sortie P4, P3, P2, P1.
//   Annonces : Ar Vag 2 palettes, Agri-Kerlann 3. Préparer : 4 palettes, 2 clients (confirmé : 2 palettes Ar Vag). Rapprocher : Ar Vag 2 reçues,
//   conforme ; Agri-Kerlann 2 reçues, il en manque. Dépose : AV1, AV2 (Ar Vag), AK1, AK2 (Agri-Kerlann) ; pièges allee-1, quaiB-1.
//   Dialogue juste : feuille, local, etiquette. Inspection : la lampe (éteinte) ; la cale est en ordre.
//   Poids : préparer 1 + 1 · accueil 1 × 3 · lampe 2, aucun faux 1 · dépose 1 × 4 · rapprocher 0,75 × 4 · écart 0,5, salutation 0,25, fin 0,25 ;
//   questions A 1, B 1,5, C 1,5 (part 4 ; D non notée).

import { ouvrirPelleau, aidesQuai, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-camion-de-ramasse';
const QID = 'pelleau-quai-105';
const DID = 'pelleau-loic-105';
const FP = 'preparer-105', FR = 'rapprocher-105';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-camion-de-ramasse.js', id: ID });
const { pg, Z, pause, base, note, present, texte, entrants, menu, clic, aller, qFil } = P;
const QA = aidesQuai(P, { donnees: '/contenus/pelleau-ent105-donnees.js', quai: 'QUAI', id: QID });
const CAPTURES = process.env.CAPTURES_ENT105 || '';
const capture = async (nom) => {
  if (!CAPTURES) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); }
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};

const OUV = { annonce: 'message', 'feuille-ramasse': 'charge', 'etiquette-palette': 'qui-quoi', 'zone-reception': 'poser', cale: 'immobiliser',
  gerber: 'empiler', 'img-porteur-quai': 'cale', 'img-sol': 'emplacements' };
const monter = (o = {}) => P.monter({ rep: OUV, ...o });
const Q_JUSTES = { 'pourquoi-trier': 'stock', 'rendre-meme': 'meme', 'signature-ramasse': 'reconnaitre', 'quand-ecart': 'client' };
const Q_FAUSSES = { 'pourquoi-trier': 'joli', 'rendre-meme': 'rien', 'signature-ramasse': 'payer', 'quand-ecart': 'nsp' };
const PREP = { palettes: '4', clients: '2' };
const DIAL = { feuille: 'feuille', regles: 'local', etiquette: 'etiquette' };
const DIAL_FAUX = { feuille: 'decharge', regles: 'volant', etiquette: 'meme' };
const SORTIE = ['P4', 'P3', 'P2', 'P1'];
const DEP = { P4: 'AV1', P3: 'AV2', P2: 'AK1', P1: 'AK2' };
const RAPP = { 'recues-ar-vag': '2', 'resultat-ar-vag': 'conforme', 'recues-agri-kerlann': '2', 'resultat-agri-kerlann': 'manque' };
const CR = { salutation: 'Salut Maëlys,', ecart: 'Agri-Kerlann : 1 palette de moins que l’annonce, pas prête à la ramasse.', fin: 'Je reste à la réception si besoin. Lea' };
const GROUPES = ['Préparer la réception', 'Accueillir Loïc', 'Avant de décharger', 'Trier par client', 'Rapprocher', 'Rendre compte', 'Les questions'];
const JALONS = ['preparer-palettes', 'preparer-clients', 'accueil-feuille', 'accueil-regles', 'accueil-etiquette', 'securite-lampe', 'securite-aucun-faux',
  'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4', 'rapprocher-recues-ar-vag', 'rapprocher-resultat-ar-vag', 'rapprocher-recues-agri-kerlann',
  'rapprocher-resultat-agri-kerlann', 'cr-ecart', 'cr-salutation', 'cr-fin'];
const POIDS = [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0.75, 0.75, 0.75, 0.75, 0.5, 0.25, 0.25];
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;

// Le menu ne se redessine qu'au changement d'écran : comme l'élève, on passe par la Messagerie.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await clic('[data-confirme-oui]'); await pause(); } };
const panneau = () => pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
// Les cartes des messages arrivés (en haut à droite) : fermées, comme le ferait l'élève (déployées, elles couvrent le haut du panneau des questions).
const fermerCartes = async () => { for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); } };
// Répond aux questions au fil ouvertes ; `vus` reçoit leurs ids, dans l'ordre.
async function qrep(R = Q_JUSTES, vus = null) {
  for (let i = 0; i < 5; i++) {
    const q = await panneau();
    if (!q) return;
    await fermerCartes();
    if (vus) vus.push(q);
    await qFil({ [q]: R[q] });
  }
}
// ① Préparer la réception.
async function preparer(vals = PREP, Q = Q_JUSTES, vus = null) {
  await allerV('fiche');
  for (const [c, x] of Object.entries(vals)) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); await qrep(Q, vus); }
  await clic('[data-fiche-envoyer]'); await confirmer(); await qrep(Q, vus);
}
// ② Accueillir Loïc : `rep` donne la première réponse de chaque réplique ; une maladroite est suivie de la juste.
const dire = async (val) => { await clic(`[data-dlg-choix="${val}"]`); await pause(); };
async function accueil(rep = DIAL, Q = Q_JUSTES, vus = null) {
  await allerV('telephone');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  for (const r of ['feuille', 'regles', 'etiquette']) { await dire(rep[r]); if (rep[r] !== DIAL[r]) await dire(DIAL[r]); }
  await clic('[data-dlg-raccrocher]'); await pause();
  await qrep(Q, vus);
}
// ③ Le quai A : l'inspection (`envois` : les objets marqués à chaque « Signaler »), « C'est bon », puis la dépose (`depose` : pour chaque palette,
// la liste des cases cliquées ; la dernière doit poser).
async function quai(o = {}) {
  const Q = o.q || Q_JUSTES;
  await allerV('quai');
  await pg.waitForSelector(QA.SVG);
  for (const ids of (o.envois || [['lampe']])) { for (const id of ids) await QA.marquer(id); await QA.signaler(); await qrep(Q, o.vus); }
  if (o.avant) await o.avant();
  await QA.cestBon(); await qrep(Q, o.vus);
  if (o.apresBon) await o.apresBon();
  await QA.decharger();
  for (const pal of SORTIE) {
    const L = (o.depose && o.depose[pal]) || [DEP[pal]];
    for (const c of L) {
      if (o.pendant) await o.pendant(pal, c);
      const n = await QA.posees();
      await QA.deposer(c);
      if (c !== L[L.length - 1]) vrai((await QA.posees()) === n, `${pal} : la case ${c} n’aurait pas dû poser la palette`);
      await qrep(Q, o.vus);
    }
  }
  await pause(); await qrep(Q, o.vus);
}
// ④ Rapprocher (la fiche arrive avec le message d'Erwan).
async function rapprocher(vals = RAPP, Q = Q_JUSTES, vus = null) {
  await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`);
  for (const [c, x] of Object.entries(vals)) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); await qrep(Q, vus); }
  await clic('[data-fiche-envoyer]'); await confirmer(); await qrep(Q, vus);
}
// ⑤ Rendre compte à Maëlys (phrases à choisir).
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("${sujet}")`);
  await pause();
}
async function compteRendu(lignes = CR, Q = Q_JUSTES, vus = null) {
  await ouvrirMail('Alors, la ramasse ?');
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); }
  await pg.click(`${Z} #formPhr button[type="submit"]`); await confirmer();
  await qrep(Q, vus);
}
async function parcours(o = {}) {
  const Q = o.q || Q_JUSTES;
  await preparer(o.prep, Q, o.vus);
  await accueil(o.dial, Q, o.vus);
  await quai({ ...o, q: Q });
  await rapprocher(o.rapp, Q, o.vus);
  await compteRendu(o.cr, Q, o.vus);
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const detail = () => pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim()]));

// ─────────────────────────────────────────────────────────── la déclaration et le registre
await v('ENT-10.5 : la séance se charge (CAP, CAP-C1.3, guidage, correction, bilan détaillé, parcours après ENT-10.4) ; poids 16 + part 4 = 20 par jalon écrit à la main ; au registre sous l’entreprise n° 10 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-camion-de-ramasse.js');
    const S = await import('/contenus/pelleau-ent105.js');
    const Q = await import('/contenus/questions/ENT-10.5.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const socle = S.ETAPES.filter((e) => !e.bonus);
    const charges = await I.chargerActivites();
    const m = A.meta;
    return { meta: m, ids: socle.map((e) => e.id), poids: socle.map((e) => e.poids), somme: socle.reduce((t, e) => t + e.poids, 0),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type === 'fil').map((q) => [q.id, q.de, q.poids, !!q.reflexion, q.apres || 'tout de suite', q.quand.gestes || null]),
      groupes: [...new Set(socle.map((e) => e.groupe))], sansEcran: socle.filter((e) => !e.ecran).map((e) => e.id),
      bonus: S.ETAPES.filter((e) => e.bonus).map((e) => [e.id, e.poids, e.groupe]),
      auRegistre: charges.some((a) => a.meta.id === ID), echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /pelleau/.test(f)),
      entreprise: (I.ENTREPRISES.find((e) => e.n === 10) || {}).nom,
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente, m.niveauxPrevus,
    m.questions, m.pret, m.ouverture, m.corrige, m.rubrique],
  ['ENT-10.5', ['cap'], [], ['CAP-C1.3'], 'guidage', 20, true, true, true, 'pelleau-evaluation-prise-de-poste', ['confirme'], 'ENT-10.5', true, 'prof',
    './contenus/corriges/ENT-10.5.js', 'simulog'], 'meta');
  egal(r.ids, JALONS, 'jalons du socle');
  egal(r.poids, POIDS, 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des jalons et de la part des questions');
  egal(r.groupes, GROUPES.slice(0, 6), 'lignes du bandeau (hors questions)');
  egal(r.sansEcran, ['accueil-feuille', 'accueil-regles', 'accueil-etiquette', 'securite-lampe', 'securite-aucun-faux', 'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4'],
    'ni le dialogue ni le quai ne se rouvrent');
  egal(r.notees, [['pourquoi-trier', 'yann', 1, false, 'tout de suite', ['quai:pelleau-quai-105:depose']],
    ['rendre-meme', 'erwan', 1.5, false, 'tout de suite', ['fiche:rapprocher-105:recues-ar-vag']],
    ['signature-ramasse', 'erwan', 1.5, false, 'bilan', ['dialogue:pelleau-loic-105:fin']],
    ['quand-ecart', 'maelys', undefined, true, 'tout de suite', null]], 'questions au fil');
  egal(r.bonus, [['bonus-palettes-ar-vag', undefined, undefined]], 'cas bonus sans poids ni groupe');
  egal([r.auRegistre, r.echecs, r.entreprise], [true, [], 'Transports Pelleau'], 'au registre, sans échec');
  egal([r.cap, r.coche, r.autre], [false, true, false], 'fermée, puis ouverte par l’enseignant ; jamais hors CAP');
});

// ─────────────────────────────────────────────────────────── le contenu (hors écran)
await v('ENT-10.5 : contenu — le quai passe verifierQuai (dépose par client, inspection, arrêt, document « Feuille de ramasse ») ; feuille de ramasse, annonces et palettes du camion se correspondent ; tout chiffre attendu suit les données ; aucun jour de la semaine, pied imposé sur chaque document', async () => {
  const r = await pg.evaluate(async () => {
    const Q = await import('/core/types/quai.js');
    const D = await import('/contenus/pelleau-ent105-donnees.js');
    const C = await import('/contenus/pelleau-ent105.js');
    const U = await import('/contenus/pelleau.js');
    const q = D.QUAI();
    const lire = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d; };
    const feuille = lire(C.DOC_FEUILLE.html);
    const lignes = [...feuille.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim()));
    const annonces = C.DOCS_ANNONCES.map((d) => lire(d.html).textContent.replace(/\s+/g, ' '));
    const docs = C.DOCUMENTS.map((d) => [d.id, lire(d.html).textContent.replace(/\s+/g, ' ')]);
    // Les chiffres suivent les données : une palette Ar Vag de plus dans le camion (copie de travail), puis remise.
    const avant = [D.texteArret(), D.ligneRecu(), D.resultat('ar-vag'), D.choixEcart()[0].texte, D.LIGNES_PREPARER.map((l) => l.juste())];
    D.PALETTES.push({ ...D.PALETTES[3], id: 'P5' });
    const plus = [D.texteArret(), D.ligneRecu(), D.resultat('ar-vag'), D.LIGNES_PREPARER.map((l) => l.juste())];
    D.PALETTES.pop();
    D.ANNONCES['agri-kerlann'].palettes = 4;
    const ecart4 = [D.observation('agri-kerlann'), D.phraseEcart('agri-kerlann')];
    D.ANNONCES['agri-kerlann'].palettes = 3;
    return { ecarts: Q.verifierQuai(q), clientsQuai: q.depose.clients, palettes: q.camions[0].palettes.map((p) => [p.id, p.client, p.bl, p.W * p.D * p.L]),
      lignes, annonces, docs, avant, plus, ecart4, arret: q.arret.texte, pied: U.PIED, apres: D.texteArret() };
  });
  egal(r.ecarts, [], 'verifierQuai');
  egal(r.clientsQuai, { 'ar-vag': { nom: 'Biscuiterie Ar Vag', court: 'AR VAG' }, 'agri-kerlann': { nom: 'Agri-Kerlann', court: 'AGRI' } }, 'clients du quai, de l’univers (nom au sol court)');
  egal(r.palettes, [['P1', 'agri-kerlann', 40, 40], ['P2', 'agri-kerlann', 40, 40], ['P3', 'ar-vag', 40, 40], ['P4', 'ar-vag', 40, 40]], 'palettes du camion');
  egal(r.lignes, [['Biscuiterie Ar Vag', '2', '80 cartons', '', 'signé'], ['Agri-Kerlann', '2', '80 sacs', '3e palette pas prête', 'signé']], 'feuille de ramasse');
  vrai(/Nous vous confions ce jour 2 palettes de biscuits au beurre/.test(r.annonces[0]) && /\(80 cartons\)/.test(r.annonces[0]), 'annonce Ar Vag : ' + r.annonces[0]);
  vrai(/Nous vous confions ce jour 3 palettes de terreau universel/.test(r.annonces[1]) && /\(120 sacs\)/.test(r.annonces[1]), 'annonce Agri-Kerlann : ' + r.annonces[1]);
  egal(r.avant, ['Les 4 palettes sont triées par client. Le contrôle des colis, ce sera la semaine prochaine.',
    '4 palettes : 2 Ar Vag, 2 Agri-Kerlann, triées en zone de réception.', 'conforme',
    'Agri-Kerlann : 1 palette de moins que l’annonce, pas prête à la ramasse.', ['4', '2']], 'valeurs calculées');
  egal(r.plus, ['Les 5 palettes sont triées par client. Le contrôle des colis, ce sera la semaine prochaine.',
    '5 palettes : 3 Ar Vag, 2 Agri-Kerlann, triées en zone de réception.', 'trop', ['5', '2']], 'une palette de plus : tout suit');
  egal(r.ecart4, ['2 palettes pas prêtes', 'Agri-Kerlann : 2 palettes de moins que l’annonce, pas prêtes à la ramasse.'], 'une annonce de 4 : tout suit');
  egal([r.arret, r.apres], ['Les 4 palettes sont triées par client. Le contrôle des colis, ce sera la semaine prochaine.', 'Les 4 palettes sont triées par client. Le contrôle des colis, ce sera la semaine prochaine.'], 'texte de l’arrêt');
  egal(r.docs.filter(([, t]) => JOURS.test(t)).map(([id]) => id), [], 'un jour de la semaine dans un document');
  egal(r.docs.filter(([id, t]) => id !== 'droit-depot' && !t.includes(r.pied.split('.')[0])).map(([id]) => id), [], 'pied « Document pédagogique » manquant');
});

// ─────────────────────────────────────────────────────────── l'ouverture
await v('ENT-10.5 : à l’ouverture — un seul message de Maëlys, daté du 12 mai 2026 à 7 h, sans jour de la semaine, feuille + annonces + règles jointes ; « Au quai » et le quai fermés ; la fiche « Préparer » a ses 2 lignes, sans rien qui trahisse la réponse', async () => {
  await monter({ uid: 'p105-ouv' });
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces, m.ouvreFiche]),
    [['Maëlys', 'La ramasse de Loïc', ['feuille-ramasse-105', 'annonce-ar-vag-105', 'annonce-agri-kerlann-105', 'regles-quai-105'], FP]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 4, 12, 7], 'date du message');
  vrai(!JOURS.test(E[0].text + E[0].subject), 'un jour de la semaine dans le message');
  const M = await menu();
  vrai(M.includes('fermee:telephone') && M.includes('fermee:quai') && !M.includes(`fiche:${FR}`), 'menu au départ : ' + M.join(', '));
  await capture('1-accueil');
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => [x.dataset.ficheChamp, x.closest('.champ').querySelector('label').textContent.trim()])),
    [['palettes', 'Combien de palettes arrivent ?'], ['clients', 'Pour combien de clients ?']], 'lignes de la fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((x) => x.dataset.ficheDoc)), ['feuille-ramasse-105', 'annonce-ar-vag-105', 'annonce-agri-kerlann-105', 'regles-quai-105'], 'documents à gauche');
  vrai(!/\btotal\b/i.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'la feuille de ramasse donne un total');
});

await v('ENT-10.5 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau de fin', async () => {
  await monter({ uid: 'p105-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
// `d.prep`, `d.rapp` : fiches envoyées ; `d.dial` : premières réponses de l'appel fini ; `d.sec` : l'inspection figée ; `d.depose` : { palette: premier
// choix } (posées ensuite dans une case juste) ; `d.cr` : { ligne: rang choisi } de la réponse par phrases.
const jalonsSans = (d) => pg.evaluate(async ({ d, QID, DID, FP, FR }) => {
  const S = await import('/contenus/pelleau-ent105.js');
  const db = { fiches: {}, quais: {}, mails: [] };
  if (d.aisance) db.aisance = d.aisance;
  if (d.prep) db.fiches[FP] = { valeurs: d.prep, envoye: { at: 1 } };
  if (d.rapp) db.fiches[FR] = { valeurs: d.rapp, envoye: { at: 1 } };
  if (d.dial) db.dialogues = { 'pelleau-camion-de-ramasse': { [DID]: { appels: [{ debut: 1, fin: 2, pas: Object.entries(d.dial).map(([r, v], i) => ({ r, v, at: i })), reprises: 0 }] } } };
  if (d.sec || d.depose) {
    const q = db.quais[QID] = { depose: {} };
    if (d.sec) q.securite = { mode: 'scene', marques: [], compteur: 0, ouverte: true, arrete: false, chef: '', signaux: d.sec.signaux || [], fait: d.sec.fait !== false };
    if (d.depose) {
      const juste = { P1: 'AK2', P2: 'AK1', P3: 'AV2', P4: 'AV1' };
      for (const [p, c] of Object.entries(d.depose)) q.depose[p] = { premier: c, essais: c === juste[p] ? [c] : [c, juste[p]], pose: juste[p] };
      q.dechargeFini = d.finDecharge !== false;
    }
  }
  if (d.cr) {
    const P = S.phrasesCompteRendu('Lea');
    db.mails.push({ id: 1, folder: 'in', ts: 1, phrases: { id: P.id, lignes: P.lignes.map((l) => (l.texte ? l : { ...l, ordre: l.choix.map((_, i) => i) })) } });
    db.mails.push({ id: 2, folder: 'out', ts: 2, phrases: { id: P.id, choix: d.cr } });
  }
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, (e.verifier(db) || { status: 'null' }).status]));
}, { d, QID, DID, FP, FR });
const SEC_JUSTE = { signaux: [{ points: ['lampe'], rien: 0, marques: [1], apresArret: false }] };
const JUSTE = { prep: PREP, dial: DIAL, sec: SEC_JUSTE, depose: { P4: 'AV1', P3: 'AV2', P2: 'AK1', P1: 'AK2' }, rapp: RAPP, cr: { salutation: 0, ecart: 0, fin: 0 } };

await v('ENT-10.5 : jalons sans écran — rien : tout « à faire » ; juste : tout ✓ ; chaque faute ne fait tomber que SON jalon ; « aucun faux » faux quand rien n’est signalé ; une palette Ar Vag posée chez Agri-Kerlann = SA palette fausse', async () => {
  const vide = await jalonsSans({});
  egal(JALONS.map((j) => vide[j]), JALONS.map(() => 'attente'), 'rien fait');
  egal(vide['bonus-palettes-ar-vag'], 'null', 'standard : pas de cas bonus');
  const s = await jalonsSans(JUSTE);
  egal(JALONS.filter((j) => s[j] !== 'ok'), [], 'parcours juste');
  const ko = async (f) => { const d = JSON.parse(JSON.stringify(JUSTE)); f(d); const x = await jalonsSans(d); return JALONS.filter((j) => x[j] !== 'ok'); };
  egal(await ko((d) => { d.prep.palettes = '5'; }), ['preparer-palettes'], '5 palettes (le total des annonces)');
  egal(await ko((d) => { d.prep.clients = '3'; }), ['preparer-clients'], '3 clients');
  egal(await ko((d) => { d.dial.regles = 'volant'; }), ['accueil-regles'], 'Loïc laissé au volant');
  egal(await ko((d) => { d.dial.feuille = 'magasin'; d.dial.etiquette = 'croire'; }), ['accueil-feuille', 'accueil-etiquette'], 'deux répliques');
  egal(await ko((d) => { d.sec.signaux = []; }), ['securite-lampe', 'securite-aucun-faux'], 'rien signalé, inspection figée');
  egal(await ko((d) => { d.sec.signaux = [{ points: ['lampe', 'cale'], rien: 0, apresArret: false }]; }), ['securite-aucun-faux'], 'la cale (en ordre) signalée aussi');
  egal(await ko((d) => { d.sec.signaux = [{ points: ['lampe'], rien: 0, apresArret: true }]; }), ['securite-lampe'], 'signalée après l’arrêt de Yann');
  egal(await ko((d) => { d.depose.P4 = 'AK1'; }), ['depose-P4'], 'P4 (Ar Vag) dans la zone d’Agri-Kerlann au premier choix');
  egal(await ko((d) => { d.depose.P1 = 'AV1'; d.depose.P3 = 'allee-1'; }), ['depose-P1', 'depose-P3'], 'P1 chez Ar Vag, P3 sur l’allée');
  egal(await ko((d) => { d.rapp['resultat-agri-kerlann'] = 'conforme'; }), ['rapprocher-resultat-agri-kerlann'], 'Agri-Kerlann « conforme »');
  egal(await ko((d) => { d.rapp['recues-agri-kerlann'] = '3'; }), ['rapprocher-recues-agri-kerlann'], 'Agri-Kerlann : 3 reçues (l’annonce)');
  egal(await ko((d) => { d.cr.ecart = 2; }), ['cr-ecart'], 'écart « tout est conforme »');
  egal(await ko((d) => { d.cr.salutation = 1; d.cr.fin = 1; }), ['cr-salutation', 'cr-fin'], 'la forme');
  const enCours = await jalonsSans({ ...JUSTE, sec: { ...SEC_JUSTE, fait: false }, finDecharge: false });
  egal([enCours['securite-lampe'], enCours['securite-aucun-faux'], enCours['depose-P1']], ['attente', 'attente', 'attente'], 'inspection non figée, déchargement pas fini');
  const c = await jalonsSans({ ...JUSTE, aisance: 'confirme', prep: { ...PREP, 'palettes-ar-vag': '2' } });
  egal([c['bonus-palettes-ar-vag'], (await jalonsSans({ ...JUSTE, aisance: 'confirme', prep: { ...PREP, 'palettes-ar-vag': '3' } }))['bonus-palettes-ar-vag']], ['ok', 'ko'], 'bonus du confirmé');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-10.5 : parcours juste à l’écran — 20/20, bandeau 7 lignes ✓ ; C au raccrochage (« Merci, je note »), A à la première palette posée, B au premier choix de « Rapprocher », D à l’envoi ; la légende cite l’étiquette, jamais la zone ; messages dans l’ordre, sans jour de la semaine', async () => {
  await monter({ uid: 'p105-juste', sansOuverture: true });
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal([ov.length, ov.filter((id) => /^img-/.test(id)).length], [4, 1], 'questions d’ouverture tirées : 3 + 1 image');
  for (let k = 0; k < 4; k++) {
    await clic(`[data-ouv-aller="${k}"]`); await pause();
    if (k === 0) await capture('0-avant-de-commencer');
    await clic(`[data-q-choix="${OUV[ov[k]]}"][data-q="${ov[k]}"]`);
    await clic(`[data-q-repondre="${ov[k]}"]`); await pause();
  }
  await clic('[data-ouv-continuer]'); await pause();
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'ouverture faite, rien d’autre : 0');
  const vus = [];
  await preparer(PREP, Q_JUSTES, vus);
  await accueil(DIAL, Q_JUSTES, vus);
  egal(vus, ['signature-ramasse'], 'C au raccrochage');
  const legendes = [];
  let legArrivee = '';
  await quai({ vus, apresBon: async () => { legArrivee = await QA.legende(); await capture('2-quai-feuille-de-ramasse'); }, pendant: async (pal) => {
    const l = await QA.legende();
    if (!legendes.some((x) => x[0] === pal)) legendes.push([pal, l]);
    if (pal === 'P3' && !legendes.capt) { legendes.capt = true; await pg.$eval(`${Z} [data-q-leg]`, (x) => x.scrollIntoView({ block: 'end' })); await capture('3-quai-choix-etiquette'); }
  } });
  console.log('   (légende à ① après « C’est bon » : ' + legArrivee + ')');
  egal(legendes.map(([p]) => p), SORTIE, 'une pause par palette');
  vrai(/Yann attend avec la palette P4 — étiquette : « Expéditeur : Biscuiterie Ar Vag » \(1 sur 4\)\. Où la pose-t-il \?/.test(legendes[0][1]), 'légende de P4 : ' + legendes[0][1]);
  vrai(/« Expéditeur : Agri-Kerlann » \(3 sur 4\)/.test(legendes[2][1]), 'légende de P2 : ' + legendes[2][1]);
  vrai(legendes.every(([, l]) => !/zone/i.test(l)), 'la légende parle de zone');
  egal(vus, ['signature-ramasse', 'pourquoi-trier'], 'A à la première palette posée');
  vrai(/Les 4 palettes sont triées par client\./.test(await texte()), 'bandeau de fin du quai');
  await rapprocher(RAPP, Q_JUSTES, vus);
  egal(vus, ['signature-ramasse', 'pourquoi-trier', 'rendre-meme'], 'B au premier choix de « Rapprocher »');
  await compteRendu(CR, Q_JUSTES, vus);
  egal(vus, ['signature-ramasse', 'pourquoi-trier', 'rendre-meme', 'quand-ecart'], 'D à l’envoi des phrases');
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons');
  egal(['question:pourquoi-trier', 'question:rendre-meme', 'question:signature-ramasse'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  egal(b.fin, 'ok', 'tout juste');
  await pg.$eval(`${Z} [data-fin-seance]`, (x) => x.scrollIntoView({ block: 'start' })); await capture('5-bilan');
  const E = await entrants();
  egal(E.map((x) => [x.from, x.subject]), [['Maëlys', 'La ramasse de Loïc'], ['Erwan', 'Loïc arrive'], ['Erwan', 'Yann est prêt'], ['Erwan', 'Les palettes sont triées'],
    ['Maëlys', 'Alors, la ramasse ?'], ['Maëlys', 'RE : Alors, la ramasse ?']], 'les messages, dans l’ordre');
  vrai(/Merci, je préviens Agri-Kerlann\./.test(E[5].text), 'Maëlys reprend l’écart écrit : ' + E[5].text);
  egal(E.filter((x) => JOURS.test(x.text + x.subject)).map((x) => x.subject), [], 'un jour de la semaine dans un message');
  egal(E.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'un message dit juste / faux / erreur / bonus');
  const ts = E.map((x) => x.ts);
  vrai(ts.every((t, i) => !i || t >= ts[i - 1]), 'heures croissantes');
  vrai(!!((await base()).points && (await base()).points[ID]), 'photo de fin rangée (ENT-10.6 s’ouvrirait)');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

await v('ENT-10.5 : pire cas — tout faux (5 palettes, maladroit à chaque réplique, « C’est bon » sans signaler puis la cale à tort, chaque palette d’abord dans une mauvaise case, rapprochement et phrases faux) → premier bilan, 7 lignes ✗, « Corriger » proposé, `finFige` ; Yann arrête sans nommer la lampe', async () => {
  await monter({ uid: 'p105-pire' });
  let arret = '';
  await parcours({ q: Q_FAUSSES, prep: { palettes: '5', clients: '3' }, dial: DIAL_FAUX,
    envois: [['cale']],
    avant: async () => { await QA.cestBon(); arret = await pg.textContent(`${Z} [data-q-secu-arret]`).catch(() => ''); await QA.marquer('lampe'); await QA.signaler(); await qrep(Q_FAUSSES); },
    depose: { P4: ['AK1', 'AV1'], P3: ['AK2', 'AV2'], P2: ['allee-1', 'AK1'], P1: ['quaiB-1', 'AK2'] },
    rapp: { 'recues-ar-vag': '3', 'resultat-ar-vag': 'trop', 'recues-agri-kerlann': '3', 'resultat-agri-kerlann': 'conforme' },
    cr: { salutation: 'Yo !', ecart: 'Tout est conforme aux annonces.', fin: 'Bisous' } });
  vrai(arret.length > 0 && !/lampe/i.test(arret), 'Yann arrête sans nommer la lampe : ' + arret);
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ko'), [], 'tous les jalons faux');
  egal(['question:pourquoi-trier', 'question:rendre-meme', 'question:signature-ramasse'].map((j) => n.detail[j]), ['ko', 'ko', 'ko'], 'questions fausses');
  proche(n.score, 0, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ko']), 'bandeau');
  vrai(b.corriger && b.fige, 'Corriger et la phrase du premier essai : ' + b.texte);
  vrai(/Le camion est déchargé : le quai ne se rejoue pas\./.test(b.texte), 'finFige');
  vrai(/Merci, je note : tout est conforme\./.test((await entrants()).slice(-1)[0].text), 'Maëlys reprend « tout est conforme » sans corriger');
});

await v('ENT-10.5 : dépose par client — P4 (Ar Vag) cliquée en AK1 : Yann réagit (« la zone d’Agri-Kerlann »), AK1 n’est plus proposée pour P4 mais l’est pour P2 qui s’y pose ; seule P4 ✗, une ligne par palette au bilan détaillé', async () => {
  await monter({ uid: 'p105-dep' });
  await preparer(); await accueil();
  let reaction = '', apresRefus = [], pourP2 = [];
  await quai({ depose: { P4: ['AK1', 'AV1'], P3: ['AV2'], P2: ['AK1'], P1: ['AK2'] }, pendant: async (pal, c) => {
    if (pal === 'P4' && c === 'AV1') { reaction = await QA.annonce(); apresRefus = await QA.proposees(); }
    if (pal === 'P2') pourP2 = await QA.proposees();
  } });
  vrai(/Yann : « Ça, c’est la zone d’Agri-Kerlann\. Regarde l’étiquette\. »/.test(reaction), 'Yann réagit : ' + reaction);
  vrai(!apresRefus.includes('AK1') && apresRefus.includes('AK2') && apresRefus.includes('AV1'), 'AK1 grisée pour P4 seulement : ' + apresRefus);
  vrai(pourP2.includes('AK1'), 'AK1 proposée pour P2 : ' + pourP2);
  const e = (await base()).quais[QID].depose;
  egal([e.P4.premier, e.P4.essais, e.P4.pose, e.P2.pose], ['AK1', ['AK1', 'AV1'], 'AV1', 'AK1'], 'état de la dépose');
  await rapprocher(); await compteRendu();
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['depose-P4'], 'seule P4 fausse');
  proche(n.score, 19, 'note');
  const b = await fin();
  egal(b.lignes.filter(([, x]) => x === 'ko').map(([g]) => g), ['Trier par client'], 'une seule ligne fausse');
  const d = await detail();
  egal(d.filter(([id]) => /^depose-/.test(id)).map(([id, x, t]) => [id, x, /Trier par client : P\d, (Biscuiterie Ar Vag|Agri-Kerlann) : /.test(t)]),
    [['depose-P1', 'ok', true], ['depose-P2', 'ok', true], ['depose-P3', 'ok', true], ['depose-P4', 'ko', true]], 'une ligne par palette : ' + JSON.stringify(d.filter(([id]) => /^depose-/.test(id))));
  vrai(/P4, Biscuiterie Ar Vag : d’abord en AK1, posée ensuite en AV1/.test(d.find(([id]) => id === 'depose-P4')[2]), 'la ligne de P4');
});

await v('ENT-10.5 : inspection — « C’est bon » sans rien signaler : Yann arrête (sans nommer) ; la lampe signalée ensuite et la cale à tort : les deux jalons ✗ ; la réponse de Yann est composée point par point', async () => {
  await monter({ uid: 'p105-insp' });
  await preparer(); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  vrai(/Avant que Yann entre dans le camion, regarde le quai et le camion\./.test(await texte()), 'la consigne au-dessus de la scène');
  await QA.cestBon();
  vrai(await present('[data-q-secu-arret]'), 'Yann arrête');
  const a = await pg.textContent(`${Z} [data-q-secu-arret]`);
  vrai(/Regarde encore le quai/.test(a) && !/lampe|lumi|éclair/i.test(a), 'l’arrêt ne nomme pas le défaut : ' + a);
  await QA.marquer('lampe'); await QA.marquer('cale'); await QA.signaler(); await qrep();
  const c = await QA.chef();
  vrai(/Bien vu : j’allume la lampe de quai\./.test(c) && /Là, je ne vois rien qui cloche\./.test(c), 'la réponse de Yann : ' + c);
  await QA.cestBon(); await QA.decharger();
  for (const p of SORTIE) { await QA.deposer(DEP[p]); await qrep(); }
  const n = await note();
  egal(['securite-lampe', 'securite-aucun-faux'].map((j) => n.detail[j]), ['ko', 'ko'], 'signalée après l’arrêt, et la cale à tort');
});

await v('ENT-10.5 : l’arrivée de Loïc — « Loïc te remet la feuille de ramasse » (article féminin, prénom) et « Oui, tu peux décharger » (collègue tutoyé) ; ni « le feuille », ni « vous pouvez » à l’écran', async () => {
  await monter({ uid: 'p105-arrivee' });
  await preparer(); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  await QA.marquer('lampe'); await QA.signaler(); await qrep();
  await QA.cestBon(); await qrep();
  egal(await QA.legende(), '07:30 — Loïc te remet la feuille de ramasse.', 'la légende d’arrivée');
  egal((await pg.textContent(`${Z} [data-q="decharger"]`)).trim().replace(/\s+/g, ' '), '« Oui, tu peux décharger »', 'le bouton');
  const t = await texte();
  vrai(!/le feuille de ramasse/i.test(t), 'aucun « le feuille de ramasse »');
  vrai(!/vous pouvez/i.test(t), 'aucun « vous pouvez »');
  vrai(!/Le chauffeur/.test(await pg.$eval(`${Z} [data-q-leg]`, (n) => n.textContent)), 'la légende nomme Loïc, pas « le chauffeur »');
  if (CAPTURES) await pg.$eval(`${Z} [data-q="decharger"]`, (x) => x.scrollIntoView({ block: 'end' }));
  await capture('4-arrivee-loic');
});

await v('ENT-10.5 : dialogue — « Oui, reste au volant » : Loïc réagit, la réplique revient, l’entretien finit ; seul ce jalon ✗ ; « Corriger » ne rouvre pas le dialogue (« Relire » seulement)', async () => {
  await monter({ uid: 'p105-dial' });
  await preparer();
  await allerV('telephone');
  vrai(/Erwan : « Loïc recule au quai A\. Va l’accueillir\. »/.test(await pg.textContent(`${Z} .dlg-repos`).catch(() => '')), 'la consigne d’Erwan en haut');
  egal(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`), 'Aller le voir', 'face à face');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  await dire('feuille'); await dire('volant');
  vrai(/Erwan ne serait pas d’accord/.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'Loïc réagit');
  egal(await pg.$$eval(`${Z} [data-dlg-choix]:not([disabled])`, (L) => L.map((x) => x.dataset.dlgChoix).sort()), ['aider', 'local'], 'la réplique revient, la maladroite grisée');
  await dire('local'); await dire('etiquette');
  await clic('[data-dlg-raccrocher]'); await pause(); await qrep();
  await quai(); await rapprocher(); await compteRendu();
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['accueil-regles'], 'seul « ce qu’il fait pendant le déchargement » est faux');
  const b = await fin();
  vrai(!b.corriger, 'rien à rouvrir : le dialogue ne se rejoue pas');
  await allerV('telephone');
  vrai(!/Revenir le voir/.test(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`).catch(() => '')), 'pas de « Revenir le voir »');
});

await v('ENT-10.5 : corriger « Rapprocher » — Agri-Kerlann « conforme » : seule cette case ✗ (19,25) ; « Corriger » rouvre la fiche (pas le quai), accusé d’Erwan au renvoi juste, note moyennée', async () => {
  await monter({ uid: 'p105-rapp' });
  await parcours({ rapp: { ...RAPP, 'resultat-agri-kerlann': 'conforme' } });
  let n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['rapprocher-resultat-agri-kerlann'], 'seule cette case');
  proche(n.score, 19.25, 'note');
  const lig = (await detail()).find(([id]) => id === 'rapprocher-resultat-agri-kerlann');
  vrai(lig && lig[1] === 'ko' && /Rapprocher : Agri-Kerlann, résultat/.test(lig[2]), 'ligne du bilan détaillé : ' + JSON.stringify(lig));
  await clic('[data-fin-corriger]'); await pause();
  vrai(await present(`[data-fiche="${FR}"]`), '« Corriger » ouvre « Rapprocher »');
  await pg.selectOption(`${Z} [data-fiche-champ="resultat-agri-kerlann"]`, 'manque'); await pause();
  await clic('[data-fiche-envoyer]'); await confirmer();
  n = await note();
  egal(n.detail['rapprocher-resultat-agri-kerlann'], 'ok', 'renvoyée juste');
  vrai(n.score > 19.25 && n.score < 20, 'note moyennée : ' + n.score);
  vrai((await entrants()).some((x) => x.from === 'Erwan' && x.subject === 'Bien reçu'), 'accusé d’Erwan');
  vrai(!!(await base()).quais[QID].dechargeFini, 'le quai reste fini');
});

await v('ENT-10.5 : corriger « Préparer » et les phrases — « 5 palettes » (le total des annonces) et « Tout est conforme » : deux lignes ✗ ; Maëlys reprend ce que l’élève a écrit ; renvoyés justes : ✓', async () => {
  await monter({ uid: 'p105-prep' });
  await parcours({ prep: { palettes: '5', clients: '2' }, cr: { ...CR, ecart: 'Tout est conforme aux annonces.' } });
  let n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['preparer-palettes', 'cr-ecart'], 'deux jalons faux');
  proche(n.score, 18.5, 'note');
  vrai(/Merci, je note : tout est conforme\./.test((await entrants()).slice(-1)[0].text), 'Maëlys reprend sans corriger');
  egal((await fin()).lignes.filter(([, x]) => x === 'ko').map(([g]) => g), ['Préparer la réception', 'Rendre compte'], 'lignes fausses');
  await clic('[data-fin-corriger]'); await pause();
  if (!(await present(`[data-fiche="${FP}"]`))) await allerV('fiche');
  await pg.selectOption(`${Z} [data-fiche-champ="palettes"]`, '4'); await pause();
  await clic('[data-fiche-envoyer]'); await confirmer();
  await ouvrirMail('Alors, la ramasse ?');
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(CR)) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); }
  await pg.click(`${Z} #formPhr button[type="submit"]`); await confirmer();
  n = await note();
  egal([n.detail['preparer-palettes'], n.detail['cr-ecart']], ['ok', 'ok'], 'renvoyés justes');
  vrai(/Merci, je préviens Agri-Kerlann\./.test((await entrants()).slice(-1)[0].text), 'la nouvelle réponse de Maëlys');
});

await v('ENT-10.5 : confirmé — une ligne de plus à « Préparer » ; juste ou fausse, la note du socle reste 20 et le bandeau identique ; le mot « bonus » n’apparaît pas', async () => {
  await monter({ uid: 'p105-conf', aisance: 'confirme' });
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => x.dataset.ficheChamp)), ['palettes', 'clients', 'palettes-ar-vag'], 'trois lignes');
  await parcours({ prep: { ...PREP, 'palettes-ar-vag': '3' } });
  const n = await note();
  proche(n.score, 20, 'note du socle');
  egal(n.detail.bonus && [n.detail.bonus.justes, n.detail.bonus.total], [0, 1], 'le cas bonus faux, compté à part');
  egal((await fin()).lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau identique');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
  await monter({ uid: 'p105-std' });
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => x.dataset.ficheChamp)), ['palettes', 'clients'], 'le standard : deux lignes');
});

await v('ENT-10.5 : « Avant de commencer » — 3 notions + 1 image tirées et rangées, menu fermé jusqu’aux réponses, rien n’entre dans la note ; étape suivante : de « Préparer » à « Au quai », puis au quai', async () => {
  await monter({ uid: 'p105-ouv2', sansOuverture: true });
  const db = await base();
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 4, '4 notions tirées');
  vrai(ids.every((i) => Object.keys(OUV).includes(i)), 'ids de la banque : ' + ids);
  vrai(await present('[data-ouv-aller="0"]'), 'écran « Avant de commencer »');
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /^question:(annonce|feuille|etiquette|zone|cale|gerber|img)/.test(k)), 'une notion d’ouverture dans la note');
  await monter({ uid: 'p105-suite' });
  const barre = () => pg.$eval(`${Z} [data-suite-seance]`, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
  egal(await barre(), 'Étape suivante : Préparer la réception Y aller →', 'au départ');
  await preparer();
  egal(await barre(), 'Étape suivante : Au quai : accueillir Loïc Y aller →', 'après « Préparer »');
  await accueil();
  egal(await barre(), 'Étape suivante : Le quai A : inspecter, puis trier Y aller →', 'après l’accueil');
  await clic('[data-suite-aller]'); await pause();
  vrai(await present('[data-q-inspection]'), 'la barre ouvre le quai');
});

await v('ENT-10.5 : socle — aucune adresse hors du site, aucune erreur JavaScript ; écrans à 1366 × 768 sans défilement horizontal ; le corrigé de l’enseignant se calcule (pièces fixes, ligne du confirmé marquée)', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.5.js');
    const e = C.corrigeEleve({ aisance: 'confirme' }, 'x');
    return { n: C.CORRIGE.items.length, items: e.items.map((i) => [i.texte, i.rep, !!i.bonus]) };
  });
  egal(r.n, 8, 'parties du corrigé commun');
  egal(r.items, [['Combien de palettes arrivent ?', '4', false], ['Pour combien de clients ?', '2', false], ['Combien de palettes Ar Vag ?', '2', true],
    ['Palette P1 (Agri-Kerlann)', 'AK1 ou AK2', false], ['Palette P2 (Agri-Kerlann)', 'AK1 ou AK2', false],
    ['Palette P3 (Biscuiterie Ar Vag)', 'AV1 ou AV2', false], ['Palette P4 (Biscuiterie Ar Vag)', 'AV1 ou AV2', false],
    ['Rapprocher : Biscuiterie Ar Vag', '2 reçues, conforme', false], ['Rapprocher : Agri-Kerlann', '2 reçues, il en manque', false]], 'corrigé d’un confirmé');
  await monter({ uid: 'p105-ecran' });
  const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await allerV('fiche');
  vrai(await large() <= 0, 'fiche : défilement horizontal');
  await preparer(); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  await QA.marquer('lampe'); await QA.signaler(); await QA.cestBon(); await QA.decharger();
  egal(await QA.proposees(), ['allee-1', 'AV1', 'AV2', 'AK1', 'AK2', 'quaiB-1'], 'six cases proposées, de gauche à droite');
  egal(await pg.getAttribute(`${Z} [data-q="depose"][data-c="AK1"]`, 'aria-label'), 'Case AGRI 1', 'nom lu au clavier : le lieu, jamais le verdict');
  vrai(await large() <= 0, 'quai : défilement horizontal');
  egal([...P.hotes], [], 'adresses hors du site');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

await P.fermer();
}
