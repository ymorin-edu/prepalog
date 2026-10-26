// Suite de tests de Prepalog — bloc « mr-11.7 » : Mondial Relay ENT-11.7, évaluation « la lampe d'Inès » (2de, poste A service client, AGO-1.1 et AGO-1.2,
// copie rendue, un cas tiré par élève parmi quatre). `node outils/test.mjs mr-11.7` ne lance que ce bloc. Brief :
// `docs/briefs/ENT-11.7-mondial-relay-evaluation-client.md` §4 à §6 bis.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/mondial-relay-evaluation-client.js` →
// `rendre`, `noter`), de vrais clics à la SOURIS (appel, boutons), les listes des fiches par `selectOption`. Les GRAINES sont choisies ici (l'identifiant
// de l'élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le tirage le 26/10/2026), jamais recalculées par le code de la séance :
//
//   m117-d : cas A (refusé, sans assurance)        lampe 65 €, livrée le 4 décembre 2026, appel 1 jour après  → recevable, 25 €, dossier accepté.
//   m117-b : cas B (refusé, AVEC assurance)         lampe 90 €, livrée le 21 novembre 2026, 1 jour après       → recevable, 90 € (valeur déclarée), dossier accepté.
//   m117-h : cas C (RETIRÉ puis réclamation)        lampe 45 €, livrée le 17 novembre 2026, 1 jour après       → non recevable, 0 €, dossier refusé.
//   m117-a : cas D (refusé, réclamation au 6e jour) lampe 90 €, livrée le 8 décembre 2026, 6 jours après      → hors délai, 0 €, dossier refusé.
//
// Barème (brief §5, choix de Tristan du 26/10/2026) : écoute 3 (numéro 1, situation 1, aucune promesse 1) · la règle 4 · le montant 3 · le dossier 3 (colis et
// date 1,5, dommage et suite 1,5) · le courriel 2 (décision 0,75, montant 0,75, rappel de la règle 0,5) · le ton 1 · Avant de commencer 4.

import { ouvrirPelleau, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'mondial-relay-evaluation-client';
const DID = 'mr-appel-ines-117';
const FR = 'regle-reclamation-117';
const FD = 'dossier-reclamation-117';
const ACT = '/activites/mondial-relay-evaluation-client.js';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, entrants, clic, aller } = P;
const noter = () => pg.evaluate(async (ACT) => { const A = await import(ACT); return A.noter(window.__f.db); }, ACT);
const detail = async () => (await noter()).detail;
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse)\b/i;
const PENALITE = 'Une réponse fausse retire des points. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien.';
const ATTENTE = 'Réponds à toutes les questions pour continuer : une réponse fausse ne bloque pas.';

// Les réponses d'« Avant de commencer » (toute la banque de huit) : justes et fausses.
const OUV_JUSTES = { 'qui-est-ines': 'cliente', 'poste-relais': 'commerce', 'numero-colis': 'suivi', 'ecrit-client': 'madame', 'vente-conclue': 'offre-acceptation',
  'offre-magasin': 'offre', 'acceptation-depot': 'acceptation', 'cgv-pourquoi': 'memes-regles' };
const OUV_FAUSSES = { 'qui-est-ines': 'collegue', 'poste-relais': 'camion', 'numero-colis': 'payer', 'ecrit-client': 'coucou', 'vente-conclue': 'paiement',
  'offre-magasin': 'acceptation', 'acceptation-depot': 'offre', 'cgv-pourquoi': 'secret' };

// Monte la séance comme le site, avec la copie rendue capturée (`window.__f.copies`).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import(o.activite);
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [k, r] of Object.entries(o.rep || {})) if (!Q[k]) Q[k] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'm117-d' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'MR',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { activite: ACT, id: ID, rep: OUV_JUSTES, ...o });

// Le toast (« Copie rendue », « Fiche envoyée ») peut couvrir un bouton du bas : un clic à la souris le recevrait. On attend qu'il parte.
const sansToast = () => pg.waitForFunction(() => { const t = document.getElementById('toast'); return !t || getComputedStyle(t).display === 'none'; }, null, { timeout: 8000 });
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await clic('[data-confirme-oui]'); await pause(); } };
// Les questions au fil (réflexions non notées) : répond à la première proposition, tant qu'un panneau est ouvert.
async function qFil(vus) {
  for (let i = 0; i < 4; i++) {
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    if (vus) vus.push(q);
    const c = await pg.$eval(`${Z} [data-q="${q}"][data-q-choix]`, (e) => e.dataset.qChoix);
    await clic(`[data-q-choix="${c}"][data-q="${q}"]`);
    await clic(`[data-q-repondre="${q}"]`);
    await pause();
    if (await present('[data-q-reprendre]')) await clic('[data-q-reprendre]');
    await pause();
  }
}

// ① L'appel : `r` = les quatre réponses dites (la première compte).
async function appel(r = ['presente', 'numero', 'reformule', 'verifier'], vus) {
  await allerV('telephone');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  for (const x of r) { await clic(`[data-dlg-choix="${x}"]`); await pause(); }
  // Le dernier clic peut tomber pendant que la réplique de fin s'affiche : on le refait tant que l'appel n'est pas terminé.
  for (let i = 0; i < 4; i++) {
    await sansToast(); await clic('[data-dlg-raccrocher]'); await pause(150);
    if ((await texte()).includes('Appel terminé')) break;
  }
  await qFil(vus);
}
// ② La règle.
async function regle({ conclusion, montant }, vus) {
  await allerV('fiche');
  await pg.selectOption(`${Z} [data-fiche-champ="conclusion"]`, conclusion); await pause(20);
  await pg.fill(`${Z} [data-fiche-saisie="montant"]`, String(montant)); await pause(20);
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil(vus);
}
// ③ Le dossier.
async function dossier({ colis, livraison, dommage, suite }) {
  await allerV(`fiche:${FD}`);
  await pg.fill(`${Z} [data-fiche-saisie="colis"]`, colis); await pause(20);
  await pg.fill(`${Z} [data-fiche-saisie="livraison"]`, livraison); await pause(20);
  await pg.selectOption(`${Z} [data-fiche-champ="dommage"]`, dommage); await pause(20);
  await pg.selectOption(`${Z} [data-fiche-champ="suite"]`, suite); await pause(20);
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
}
// ④ Le courriel : `lignes` = { ligne: texte de la phrase }.
async function courriel(lignes, vus) {
  await allerV('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("Ma lampe cassée : votre réponse par écrit")`);
  await pause();
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) if (t) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); }
  await sansToast(); await pg.click(`${Z} #formPhr button[type="submit"]`);
  await confirmer();
  await qFil(vus);
}
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}

// Les phrases (écrites à la main) et les valeurs attendues de chaque graine (voir l'en-tête).
const DEC = {
  recevable: 'Votre réclamation est recevable : le colis abîmé a été refusé au Point Relais, dans les 72 heures.',
  retire: 'Votre réclamation n’est pas recevable : le colis a été retiré, et non refusé, au Point Relais.',
  delai: 'Votre réclamation n’est pas recevable : elle nous est parvenue plus de 72 heures après la livraison.',
  toujours: 'Nous vous indemnisons dans tous les cas : un colis abîmé donne toujours droit à une indemnité.',
};
const REGLE_72 = 'Pour un colis abîmé, la réclamation doit être faite dans les 72 heures suivant la livraison, et le colis doit être refusé au Point Relais.';
const BASE_25 = 'Nous pouvons vous indemniser de 25 € au plus : les frais d’envoi ne sont pas remboursés.';
const AUCUNE = 'Aucune indemnité ne peut être versée pour ce colis.';
const ENTIER = 'Nous vous remboursons votre lampe et vos frais d’envoi en entier.';
const ASSURE = (n) => `Nous vous indemnisons à hauteur de ${n} €, la valeur déclarée à l’assurance de votre colis.`;
const G = {
  'm117-d': { cas: 'a', prix: 65, jour: '2026-12-04', jourLu: '4 décembre 2026', jours: 1, conclusion: 'recevable', montant: 25, suite: 'acceptee', dec: DEC.recevable, mont: BASE_25 },
  'm117-b': { cas: 'b', prix: 90, jour: '2026-11-21', jourLu: '21 novembre 2026', jours: 1, conclusion: 'recevable', montant: 90, suite: 'acceptee', dec: DEC.recevable, mont: ASSURE(90) },
  'm117-h': { cas: 'c', prix: 45, jour: '2026-11-17', jourLu: '17 novembre 2026', jours: 1, conclusion: 'retire', montant: 0, suite: 'refusee', dec: DEC.retire, mont: AUCUNE },
  'm117-a': { cas: 'd', prix: 90, jour: '2026-12-08', jourLu: '8 décembre 2026', jours: 6, conclusion: 'delai', montant: 0, suite: 'refusee', dec: DEC.delai, mont: AUCUNE },
};
const CR = (g) => ({ salutation: 'Bonjour Madame Garnier,', decision: g.dec, montant: g.mont, regle: REGLE_72, fin: 'Cordialement, Lea, service client Mondial Relay' });
// Le parcours entier. `o` : { appel, regle, dossier, cr }.
async function jouer(uid, o = {}) {
  const g = G[uid];
  await appel(o.appel);
  await regle({ conclusion: g.conclusion, montant: g.montant, ...(o.regle || {}) });
  await dossier({ colis: 'MR 4417 2184', livraison: g.jour, dommage: 'abime', suite: g.suite, ...(o.dossier || {}) });
  await courriel({ ...CR(g), ...(o.cr || {}) });
}
const JALONS = ['ecoute-numero', 'ecoute-situation', 'ecoute-promesse', 'regle', 'montant', 'dossier-colis', 'dossier-motif', 'courriel-decision', 'courriel-montant',
  'courriel-regle', 'ton'];
// Sabotage : un parcours avec UNE modification ; les jalons tombés et la note attendus.
async function sabotage(uid, o, tombes, score, quoi) {
  await monter({ uid });
  await jouer(uid, o);
  const d = await detail();
  egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
  proche((await noter()).score, score, `${quoi} : note`);
}

// ─────────────────────────────────────────────────────────── la déclaration et le registre
await v('ENT-11.7 : la séance se charge (2de, AGO-1.1 et AGO-1.2, évaluation en copie, sans parcours ni correction) ; poids 16 + part 4 = 20, tels que le brief §5 ; trois réflexions non notées au fil ; ouverture sans aide ni mot cliquable ; au registre sous l’entreprise n° 11', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/mondial-relay-evaluation-client.js');
    const S = await import('/contenus/mondial-relay-ent117.js');
    const Q = await import('/contenus/questions/ENT-11.7.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    const charges = await I.chargerActivites();
    const groupes = S.ETAPES.reduce((g, e) => { g[e.groupe] = (g[e.groupe] || 0) + e.poids; return g; }, {});
    return { meta: A.meta, noter: typeof A.noter, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0),
      bonus: S.ETAPES.filter((e) => e.bonus).length, groupes,
      ouv: { part: Q.QUESTIONS.ouverture.part, tirage: Q.QUESTIONS.ouverture.tirage, prep: L.filter((q) => q.rubrique === 'preparation').length,
        droit: L.filter((q) => q.rubrique === 'droit').length, aides: L.filter((q) => q.aide != null).length,
        fil: L.filter((q) => q.type === 'fil').map((q) => [q.id, !!q.reflexion]),
        mots: L.filter((q) => (q.enonce + q.choix.map((c) => c.lib).join(' ')).includes('[[')).length,
        cles: L.filter((q) => q.cle).map((q) => q.id) },
      lexique: Object.keys(S.OPTIONS.lexique).length, auRegistre: charges.some((a) => a.meta.id === ID),
      aSonCode: charges.findIndex((a) => a.meta.id === ID) >= 0 };
  }, ID);
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.parcours, m.correction, m.precedente, m.niveauxPrevus, r.noter],
    ['ENT-11.7', ['2de'], ['AGO-1.1', 'AGO-1.2'], 'evaluation', 20, true, 'ENT-11.7', undefined, undefined, undefined, undefined, 'function'], 'meta');
  egal(r.poids, [['ecoute-numero', 1], ['ecoute-situation', 1], ['ecoute-promesse', 1], ['regle', 4], ['montant', 3], ['dossier-colis', 1.5], ['dossier-motif', 1.5],
    ['courriel-decision', 0.75], ['courriel-montant', 0.75], ['courriel-regle', 0.5], ['ton', 1]], 'jalons et poids (brief §5)');
  proche(r.total, 16, 'somme des poids des jalons');
  egal(r.groupes, { 'L’appel : écouter': 3, 'La règle': 7, 'Le dossier': 3, 'Le courriel': 2, 'Le ton': 1 }, 'poids par bloc (brief §5)');
  vrai(r.groupes['Le ton'] / 20 <= 0.15, 'la forme dépasse 15 % de la note');
  egal(r.bonus, 0, 'jalons bonus');
  egal(r.ouv, { part: 4, tirage: { preparation: 2, droit: 2 }, prep: 4, droit: 4, aides: 0,
    fil: [['numero-d-abord', true], ['combien-lampe', true], ['prochain-envoi', true]], mots: 0, cles: ['qui-est-ines', 'vente-conclue'] }, 'ouverture et questions au fil');
  egal([r.lexique, r.auRegistre], [0, true], 'mots cliquables, registre');
});

await v('ENT-11.7 : fermée aux élèves tant que l’enseignant ne l’a pas cochée (visibilité) ; 2de seulement ; compte dans le tableau des compétences AGO-1.1 et AGO-1.2', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/mondial-relay-evaluation-client.js');
    const N = await import('/core/niveaux.js');
    const m = A.meta;
    return { pret: m.pret, ouverture: m.ouverture, d2: N.activiteVisible(m, { niveau: '2de' }), coche: N.activiteVisible(m, { niveau: '2de', ouverts: { [ID]: true } }),
      raison: N.raisonCachee(m, { niveau: '2de' }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }), corrige: m.corrige, domaines: m.domaines };
  }, ID);
  egal([r.pret, r.ouverture, r.d2, r.raison, r.coche, r.autre, r.corrige], [true, 'prof', false, 'pas encore ouverte à ce groupe', true, false, './contenus/corriges/ENT-11.7.js'],
    'visibilité : fermée, puis ouverte par l’enseignant');
});

// ─────────────────────────────────────────────────────────── l'ouverture (Avant de commencer, notée 4 / 20)
await v('ENT-11.7 : Avant de commencer — 4 questions (2 de préparation + 2 de droit), « Je ne sais pas » en dernier, aucune aide, aucun mot qui juge ; 4 justes → 4 ; 3 justes + « Je ne sais pas » → 3 ; 3 justes + 1 fausse → 3 − 1 ÷ 2 ; tout faux → 0 (plancher) ; rien de remonté avant la remise', async () => {
  const db = await monter({ uid: 'm117-d', sansOuverture: true });
  egal(db.tirages[ID].graine, `m117-d|${ID}`, 'graine du tirage');
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 4, 'nombre de questions');
  egal([ids.filter((x) => ['qui-est-ines', 'poste-relais', 'numero-colis', 'ecrit-client'].includes(x)).length, ids.filter((x) => ['vente-conclue', 'offre-magasin', 'acceptation-depot', 'cgv-pourquoi'].includes(x)).length],
    [2, 2], 'deux de préparation, deux de droit');
  const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${k === 3 ? '@nsp' : OUV_JUSTES[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    { const t = (await pg.$eval(`${Z} [data-ouverture]`, (e) => e.textContent)).replace(PENALITE, '').replace(ATTENTE, ''); vrai(!JUGE.test(t), 'une phrase qui juge à l’ouverture : ' + t.replace(/\s+/g, ' ')); }
    if (k < 3) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter();
  egal([n.detail.ouverture.justes, n.detail.ouverture.nsp, n.detail.ouverture.faux, n.detail.ouverture.sur], [3, 1, 0, 4], 'ouverture comptée');
  proche(n.score, 3, '3 justes + « Je ne sais pas »');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  const pts = async (rep, o = {}) => { await monter({ uid: 'm117-d', rep, ...o }); return (await noter()).score; };
  proche(await pts(OUV_JUSTES), 4, 'quatre justes');
  proche(await pts({ ...OUV_JUSTES, [ids[0]]: OUV_FAUSSES[ids[0]] }), 2.5, `trois justes + une fausse (${ids[0]}, trois choix : − 1 ÷ 2)`);
  proche(await pts(Object.fromEntries(ids.map((x) => [x, OUV_FAUSSES[x]]))), 0, 'tout faux : plancher 0');
  proche(await pts({}, { sansOuverture: true }), 0, 'sans réponse');
});

await v('ENT-11.7 : Avant de commencer — les deux questions clés d’ENT-6.2 reprises (qui est le client, l’article 1113) sont dans la banque avec leurs documents (l’article 1113 y est cité mot pour mot) ; huit questions, trois choix chacune, une seule juste', async () => {
  const r = await pg.evaluate(async () => {
    const Q = await import('/contenus/questions/ENT-11.7.js');
    const S = await import('/contenus/mondial-relay-ent117.js');
    const ouv = Q.QUESTIONS.liste.filter((q) => q.type === 'ouverture');
    const droit = S.DOCUMENTS.find((d) => d.id === 'droit-117').html;
    return { n: ouv.length, choix: [...new Set(ouv.map((q) => q.choix.length))], docs: [...new Set(ouv.map((q) => q.doc))].sort(), cles: ouv.filter((q) => q.cle).map((q) => q.id),
      ids: Q.QUESTIONS.ouverture.questions, droit };
  });
  egal([r.n, r.choix, r.docs], [8, [3], ['droit-117', 'poste-117']], 'banque');
  egal(r.cles, ['qui-est-ines', 'vente-conclue'], 'questions clés reprises');
  vrai(r.droit.includes('Le contrat est formé par la rencontre d’une offre et d’une acceptation par lesquelles les parties manifestent leur volonté de s’engager.')
    && r.droit.includes('Cette volonté peut résulter d’une déclaration ou d’un comportement non équivoque de son auteur.'), 'article 1113 non cité');
});

// ─────────────────────────────────────────────────────────── à l'ouverture
await v('ENT-11.7 : à l’ouverture — un seul message de Claire, daté du jour de l’appel du cas ; seul l’appel est ouvert (la règle, le dossier et le courriel attendent) ; aucune barre « Étape suivante » en évaluation', async () => {
  await monter({ uid: 'm117-d' });
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Claire', 'Une cliente à rappeler', ['poste-117']]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 11, 5, 9], 'date du message : le 5 décembre 2026, jour de l’appel du cas A');
  const M = await P.menu();
  vrai(M.includes('telephone') && !M.includes('fiche') && !M.includes(`fiche:${FD}`), 'menu au départ : ' + M.join(', '));
  vrai(!(await present('[data-suite-seance] [data-suite]')), 'barre « Étape suivante » en évaluation');
});

// ─────────────────────────────────────────────────────────── inaction
await v('ENT-11.7 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau ; un appel raccroché sans rien dire de juste (réponses les plus mauvaises) → seuls les trois points d’écoute et le ton sont jugés ; copie vide rendue → 0', async () => {
  await monter({ uid: 'm117-d', sansOuverture: true });
  let n = await noter();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
  const c = await rendre();
  egal(c.score, 0, 'copie vide rendue');
});

await v('ENT-11.7 : inaction — l’appel seul (quatre bonnes réponses, ouverture toute fausse) vaut 3 points d’écoute, jamais plus : la règle, le montant, le dossier, le courriel et le ton restent « à faire » (0)', async () => {
  await monter({ uid: 'm117-d', rep: OUV_FAUSSES });
  await appel();
  const n = await noter();
  proche(n.score, 3, 'note après l’appel');
  egal(JALONS.filter((k) => n.detail[k] === 'ok'), ['ecoute-numero', 'ecoute-situation', 'ecoute-promesse'], 'jalons justes');
  vrai(['regle', 'montant', 'dossier-colis', 'dossier-motif', 'courriel-decision', 'courriel-montant', 'courriel-regle', 'ton'].every((k) => n.detail[k] !== 'ok' && n.detail[k] !== 'ko'),
    'un jalon jugé sans envoi : ' + JSON.stringify(n.detail));
});

// ─────────────────────────────────────────────────────────── les parcours justes, un par cas
const CAS = [['m117-d', 'A : refusé, sans assurance'], ['m117-b', 'B : refusé, avec assurance'], ['m117-h', 'C : retiré puis réclamation'], ['m117-a', 'D : réclamation au 6e jour']];
for (const [uid, nom] of CAS) {
  await v(`ENT-11.7 : parcours juste, cas ${nom} (${uid}) — 20/20 à la remise, égal à noter(db) ; messages dans l’ordre, du jour de l’appel ; rien ne dit juste ou faux ; aucun bilan, aucun « Corriger » ; pastilles « fait » ; les trois réflexions sont posées`, async () => {
    await monter({ uid });
    const g = G[uid];
    const vus = [];
    await appel(undefined, vus);
    await regle({ conclusion: g.conclusion, montant: g.montant }, vus);
    await dossier({ colis: 'MR 4417 2184', livraison: g.jour, dommage: 'abime', suite: g.suite });
    await courriel(CR(g), vus);
    egal(vus, ['numero-d-abord', 'combien-lampe', 'prochain-envoi'], 'questions au fil posées, dans l’ordre du travail');
    const E = await entrants();
    egal(E.map((m) => [m.from, m.subject]), [['Claire', 'Une cliente à rappeler'], ['Claire', 'Le suivi et les conditions de vente'], ['Claire', 'Le dossier de réclamation'],
      ['Inès Garnier', 'Ma lampe cassée : votre réponse par écrit'], ['Claire', 'Merci']], 'messages');
    egal(E.map((m) => m.pieces || []), [['poste-117'], ['suivi-117', 'cgv-117'], [], [], []], 'pièces jointes');
    const j = new Date(`${g.jour}T12:00:00Z`);
    j.setUTCDate(j.getUTCDate() + g.jours);
    vrai(E.every((m) => { const d = new Date(m.ts); return d.getFullYear() === j.getUTCFullYear() && d.getMonth() === j.getUTCMonth() && d.getDate() === j.getUTCDate(); }),
      'un message hors du jour de l’appel du cas');
    vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge : ' + (E.map((m) => m.text).find((t) => JUGE.test(t)) || ''));
    egal(E[4].text, 'Merci Lea.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\nClaire', 'message de fin');
    const ecran = await texte();
    vrai(!JUGE.test(ecran), 'un mot qui juge à l’écran : ' + (ecran.match(JUGE) || [])[0]);
    vrai(!/Corriger/.test(ecran) && !(await present('[data-fin-jalon]')), '« Corriger » ou bilan à l’écran');
    egal(await pg.$$eval(`${Z} [data-pastille]`, (L) => L.map((x) => x.classList.contains('fait'))), [true, true, true, true], 'pastilles « fait »');
    const n = await noter();
    egal([n.score, n.max], [20, 20], 'noter(db) : ' + JSON.stringify(n.detail));
    egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
    const t = await pg.evaluate(() => window.__f.db.mails.find((m) => m.subject === 'Ma lampe cassée : votre réponse par écrit').phrases.lignes.map((l) => [l.id, l.choix[l.juste]]));
    egal(Object.fromEntries(t), CR(g), `phrases justes du cas ${nom}`);
    const c = await rendre();
    egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
    vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
    vrai(!(await present('[data-copie-rendre]')), 'on peut rendre une deuxième fois');
    egal(await pg.evaluate(() => window.__f.copies.length), 1, 'une seule remise');
  });
}

// ─────────────────────────────────────────────────────────── sabotages : chaque jalon tombe seul (cas A), puis les cas qui changent la réponse attendue
await v('ENT-11.7 : sabotage de l’appel (cas A) — numéro non demandé (« raconter ») → seul « numéro » tombe (19) ; reformulation avec le mauvais fait → « situation » seule (19) ; promesse « refuse » à la fin → « promesse » seule (19) ; « promet » à la fin → « promesse » seule (19) ; « promet » au numéro → « numéro » ET « promesse » (18)', async () => {
  await sabotage('m117-d', { appel: ['presente', 'raconter', 'reformule', 'verifier'] }, ['ecoute-numero'], 19, 'numéro non demandé');
  await sabotage('m117-d', { appel: ['presente', 'numero', 'faux-fait', 'verifier'] }, ['ecoute-situation'], 19, 'mauvais fait');
  await sabotage('m117-d', { appel: ['presente', 'numero', 'faux-perdu', 'verifier'] }, ['ecoute-situation'], 19, 'colis perdu');
  await sabotage('m117-d', { appel: ['presente', 'numero', 'faux-renvoi', 'verifier'] }, ['ecoute-situation'], 19, 'renvoi');
  await sabotage('m117-d', { appel: ['presente', 'numero', 'reformule', 'refuse'] }, ['ecoute-promesse'], 19, 'refus d’emblée');
  await sabotage('m117-d', { appel: ['presente', 'numero', 'reformule', 'promet'] }, ['ecoute-promesse'], 19, 'promesse à la fin');
  await sabotage('m117-d', { appel: ['presente', 'promet', 'reformule', 'verifier'] }, ['ecoute-numero', 'ecoute-promesse'], 18, 'promesse au numéro');
});

await v('ENT-11.7 : sabotage du ton (cas A) — « agressif » ou « familier » à l’accueil → le ton seul tombe (19) ; « familier » au numéro → « numéro » et ton (18) ; « agacé » à la fin → « promesse » et ton (18) ; « Salut Inès, » → le ton seul (19) ; « Cordialement » seul → le ton seul (19) ; la forme pèse 1 point sur 20', async () => {
  await sabotage('m117-d', { appel: ['agressif', 'numero', 'reformule', 'verifier'] }, ['ton'], 19, 'accueil agressif');
  await sabotage('m117-d', { appel: ['familier', 'numero', 'reformule', 'verifier'] }, ['ton'], 19, 'accueil familier');
  await sabotage('m117-d', { appel: ['presente', 'familier', 'reformule', 'verifier'] }, ['ecoute-numero', 'ton'], 18, 'numéro tutoyé');
  await sabotage('m117-d', { appel: ['presente', 'numero', 'reformule', 'agace'] }, ['ecoute-promesse', 'ton'], 18, 'agacé');
  await sabotage('m117-d', { cr: { salutation: 'Salut Inès,' } }, ['ton'], 19, 'salutation familière');
  await sabotage('m117-d', { cr: { salutation: 'Bonjour,' } }, ['ton'], 19, 'salutation « Bonjour, » sans nom');
  await sabotage('m117-d', { cr: { fin: 'Cordialement' } }, ['ton'], 19, 'fin « Cordialement » seul');
});

await v('ENT-11.7 : sabotage de la règle — cas A : « toujours droit » → « règle » ET « montant » tombent (13) ; la bonne conclusion avec le prix de la lampe (65) → « montant » seul (17) ; 500 → « montant » seul ; cas C : « recevable » avec 0 € (un zéro deviné) → les deux tombent (13) ; la bonne conclusion avec 25 → « montant » seul ; cas D : « retiré » → les deux', async () => {
  await sabotage('m117-d', { regle: { conclusion: 'toujours' } }, ['regle', 'montant'], 13, 'A : toujours droit');
  await sabotage('m117-d', { regle: { montant: 65 } }, ['montant'], 17, 'A : prix de la lampe');
  await sabotage('m117-d', { regle: { montant: 500 } }, ['montant'], 17, 'A : 500');
  await sabotage('m117-d', { regle: { conclusion: 'retire', montant: 0 } }, ['regle', 'montant'], 13, 'A : retiré et 0');
  await sabotage('m117-h', { regle: { conclusion: 'recevable', montant: 0 } }, ['regle', 'montant'], 13, 'C : recevable avec 0');
  await sabotage('m117-h', { regle: { montant: 25 } }, ['montant'], 17, 'C : bonne conclusion, 25 €');
  await sabotage('m117-h', { regle: { conclusion: 'delai' } }, ['regle', 'montant'], 13, 'C : conclusion « délai »');
  await sabotage('m117-a', { regle: { conclusion: 'retire' } }, ['regle', 'montant'], 13, 'D : conclusion « retiré »');
  await sabotage('m117-a', { regle: { conclusion: 'recevable', montant: 25 } }, ['regle', 'montant'], 13, 'D : recevable, 25 €');
  await sabotage('m117-b', { regle: { montant: 25 } }, ['montant'], 17, 'B : 25 € alors qu’elle a l’assurance');
  await sabotage('m117-b', { regle: { montant: 500 } }, ['montant'], 17, 'B : 500 € (plafond de l’assurance, pas sa valeur)');
});

await v('ENT-11.7 : sabotage du dossier (cas A) — mauvais numéro de colis → « colis et date » (18,5) ; « MR44172184 » et « 4417 2184 » acceptés ; mauvaise date → idem (18,5) ; mauvais dommage → « dommage et suite » (18,5) ; mauvaise suite → idem (18,5) ; cas C : « acceptée » → idem', async () => {
  await sabotage('m117-d', { dossier: { colis: 'MR 4417 2185' } }, ['dossier-colis'], 18.5, 'mauvais numéro');
  await sabotage('m117-d', { dossier: { colis: 'MR44172184' } }, [], 20, 'numéro collé');
  await sabotage('m117-d', { dossier: { colis: '4417 2184' } }, [], 20, 'numéro sans MR');
  await sabotage('m117-d', { dossier: { livraison: '2026-12-05' } }, ['dossier-colis'], 18.5, 'date du jour de l’appel');
  await sabotage('m117-d', { dossier: { dommage: 'perdu' } }, ['dossier-motif'], 18.5, 'colis perdu');
  await sabotage('m117-d', { dossier: { suite: 'refusee' } }, ['dossier-motif'], 18.5, 'A : refusée');
  await sabotage('m117-h', { dossier: { suite: 'acceptee' } }, ['dossier-motif'], 18.5, 'C : acceptée');
  await sabotage('m117-a', { dossier: { suite: 'acceptee' } }, ['dossier-motif'], 18.5, 'D : acceptée');
});

await v('ENT-11.7 : sabotage du courriel (cas A) — mauvaise décision → 19,25 ; mauvais montant → 19,25 ; mauvais rappel de la règle → 19,5 ; chaque ligne tombe seule ; cas B : le montant de base (25) au lieu de la valeur déclarée → seul le montant ; cas C : « recevable » → seule la décision ; cas D : « retiré » → seule la décision', async () => {
  await sabotage('m117-d', { cr: { decision: DEC.retire } }, ['courriel-decision'], 19.25, 'A : décision « retiré »');
  await sabotage('m117-d', { cr: { montant: ASSURE(65) } }, ['courriel-montant'], 19.25, 'A : montant assuré');
  await sabotage('m117-d', { cr: { montant: ENTIER } }, ['courriel-montant'], 19.25, 'A : tout rembourser');
  await sabotage('m117-d', { cr: { regle: 'Pour un colis abîmé, il suffit de nous écrire quand vous le souhaitez.' } }, ['courriel-regle'], 19.5, 'A : règle fausse');
  await sabotage('m117-b', { cr: { montant: BASE_25 } }, ['courriel-montant'], 19.25, 'B : 25 € au lieu de la valeur déclarée');
  await sabotage('m117-h', { cr: { decision: DEC.recevable } }, ['courriel-decision'], 19.25, 'C : recevable');
  await sabotage('m117-h', { cr: { decision: DEC.toujours } }, ['courriel-decision'], 19.25, 'C : toujours');
  await sabotage('m117-a', { cr: { decision: DEC.retire } }, ['courriel-decision'], 19.25, 'D : retiré');
  await sabotage('m117-a', { cr: { montant: BASE_25 } }, ['courriel-montant'], 19.25, 'D : 25 €');
});

// ─────────────────────────────────────────────────────────── ce que dit l'écran pour chaque cas
await v('ENT-11.7 : le suivi du colis dit le fait de SON cas — cas A et D : refusé ; cas C : retiré ; cas B seul : assurance « oui » et sa valeur déclarée ; les dates de la graine ; aucun montant de niveau d’assurance, aucun « N1 à N5 », aucun jour de la semaine', async () => {
  const lire = async (uid) => { await monter({ uid }); return pg.evaluate(async () => { const S = await import('/contenus/mondial-relay-ent117.js'); const d = S.DOCUMENTS.find((x) => x.id === 'suivi-117');
    const el = document.createElement('div'); el.innerHTML = d.html(window.__f.db); return el.textContent.replace(/\s+/g, ' '); }); };
  const A = await lire('m117-d'), B = await lire('m117-b'), C = await lire('m117-h'), D = await lire('m117-a');
  vrai(A.includes('Refusé par le destinataire au Point Relais') && !A.includes('Retiré'), 'A : ' + A);
  vrai(B.includes('Refusé par le destinataire au Point Relais') && B.includes('oui — valeur déclarée à l’assurance : 90 €'), 'B : ' + B);
  vrai(C.includes('Retiré par le destinataire au Point Relais') && !C.includes('Refusé'), 'C : ' + C);
  vrai(D.includes('Refusé par le destinataire au Point Relais'), 'D : ' + D);
  for (const [t, nom] of [[A, 'A'], [C, 'C'], [D, 'D']]) vrai(/Assurance en option\s*non/.test(t) && !t.includes('valeur déclarée à l’assurance :'), `${nom} : assurance mentionnée : ${t}`);
  vrai(A.includes('Suivi consulté le 5 décembre 2026') && A.includes('4 décembre 2026'), 'A : dates ' + A);
  vrai(B.includes('Suivi consulté le 22 novembre 2026') && B.includes('21 novembre 2026'), 'B : dates ' + B);
  vrai(C.includes('Suivi consulté le 18 novembre 2026') && C.includes('17 novembre 2026'), 'C : dates ' + C);
  vrai(D.includes('Suivi consulté le 14 décembre 2026') && D.includes('8 décembre 2026'), 'D : dates ' + D);
  const tout = await pg.evaluate(async () => { const S = await import('/contenus/mondial-relay-ent117.js'); const D2 = await import('/contenus/mondial-relay-ent117-donnees.js'); const Q = await import('/contenus/questions/ENT-11.7.js');
    return JSON.stringify([S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)), S.ACCUEIL, S.MENTION_117, S.VOLET.semer('Lea', {}), D2.REPLIQUES.map((r) => [typeof r.dit === 'function' ? r.dit({}) : r.dit, r.choix]),
      D2.MONTANTS({ prix: 60 }), D2.DECISIONS, D2.RAPPELS, Q.QUESTIONS]); });
  vrai(!/\bN[1-5]\b|niveau N|\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) \d/i.test(tout), 'un niveau d’assurance ou un jour de la semaine écrit');
  vrai(!/\b(150|200|250|300|400) €/.test(tout), 'un montant d’assurance ressemblant à un niveau');
});

await v('ENT-11.7 : l’appel — quatre répliques, quatre réponses chacune ; la reformulation dit le fait du cas (refusé / retiré, plus l’assurance en B), la fausse dit le contraire ; la lampe est à son prix ; aucune réaction, aucun grisé, pas de « Rappeler » ; une réponse maladroite fait avancer', async () => {
  const lib = async (uid, k) => { await monter({ uid }); await allerV('telephone'); await clic(`[data-dlg-appeler="${DID}"]`); await pause();
    for (const x of ['presente', 'numero']) { await clic(`[data-dlg-choix="${x}"]`); await pause(); }
    const L = await pg.$$eval(`${Z} [data-dlg-choix]`, (L) => L.map((b) => [b.dataset.dlgChoix, b.textContent.replace(/\s+/g, ' ').trim()]));
    return L.find((x) => x[0] === k)[1]; };
  egal(await lib('m117-d', 'reformule'), 'Si je comprends bien, votre lampe est arrivée cassée, l’acheteur a refusé le colis au Point Relais, et vous demandez une indemnisation.', 'A : reformulation');
  egal(await lib('m117-b', 'reformule'), 'Si je comprends bien, votre lampe est arrivée cassée, l’acheteur a refusé le colis au Point Relais et vous aviez pris l’assurance, et vous demandez une indemnisation.', 'B : reformulation');
  egal(await lib('m117-h', 'reformule'), 'Si je comprends bien, votre lampe est arrivée cassée, l’acheteur a retiré le colis, puis l’a ouvert chez lui, et vous demandez une indemnisation.', 'C : reformulation');
  egal(await lib('m117-a', 'reformule'), 'Si je comprends bien, votre lampe est arrivée cassée, l’acheteur a refusé le colis au Point Relais, et vous demandez une indemnisation.', 'D : reformulation');
  egal(await lib('m117-d', 'faux-fait'), 'Si je comprends bien, votre lampe est arrivée cassée, l’acheteur a retiré le colis, puis l’a ouvert chez lui, et vous demandez une indemnisation.', 'A : le fait contraire');
  egal(await lib('m117-h', 'faux-fait'), 'Si je comprends bien, votre lampe est arrivée cassée, l’acheteur a refusé le colis au Point Relais, et vous demandez une indemnisation.', 'C : le fait contraire');
  // Le texte d'Inès : son prix, le refus ou le retrait, l'assurance seulement en B.
  const dits = async (uid) => { await monter({ uid }); await allerV('telephone'); await clic(`[data-dlg-appeler="${DID}"]`); await pause(); await clic('[data-dlg-choix="presente"]'); await pause();
    return pg.textContent(`${Z} [data-dlg-fil]`); };
  const tA = await dits('m117-d'), tB = await dits('m117-b'), tC = await dits('m117-h');
  vrai(/vendue 65 €/.test(tA) && /refusé le colis au Point Relais/.test(tA) && !/assurance/.test(tA), 'A : ' + tA);
  vrai(/vendue 90 €/.test(tB) && /pris l’assurance en option/.test(tB), 'B : ' + tB);
  vrai(/vendue 45 €/.test(tC) && /pris le colis et l’a ouvert chez lui/.test(tC) && !/refusé/.test(tC) && !/assurance/.test(tC), 'C : ' + tC);
  // Évaluation : une réponse maladroite fait avancer, sans réaction, sans grisé ; la première compte.
  await monter({ uid: 'm117-d' });
  await allerV('telephone');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  await clic('[data-dlg-choix="familier"]'); await pause();
  const apres = await pg.textContent(`${Z} [data-dlg-fil]`);
  vrai(/J’ai envoyé une lampe en céramique/.test(apres), 'l’appel n’avance pas : ' + apres);
  vrai(!/Euh|Attendez|Pardon|erreur|faux/i.test(apres.replace(/Salut, c’est pour quoi \?/, '')), 'une réaction d’Inès : ' + apres);
  egal(await pg.$$eval(`${Z} [data-dlg-choix]:disabled, ${Z} [data-dlg-choix].deja`, (L) => L.length), 0, 'des choix grisés');
  for (const x of ['numero', 'reformule', 'verifier']) { await clic(`[data-dlg-choix="${x}"]`); await pause(); }
  vrai(/J’attends votre message, alors/.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'dernière bulle d’Inès');
  await clic('[data-dlg-raccrocher]'); await pause();
  vrai(!/Rappeler/.test(await texte()), '« Rappeler » en évaluation');
  egal((await detail())['ton'], 'attente', 'le ton attend le courriel');
});

// ─────────────────────────────────────────────────────────── les fiches
await v('ENT-11.7 : la fiche « La règle » — deux cases (conclusion et montant), envoi refusé tant qu’il manque une réponse (rien d’envoyé, le travail est gardé) ; une fois envoyée, figée ; aucun verdict à l’écran ; le montant refuse une virgule et un négatif', async () => {
  await monter({ uid: 'm117-d' });
  await appel();
  await allerV('fiche');
  await pg.selectOption(`${Z} [data-fiche-champ="conclusion"]`, 'recevable');
  await sansToast(); await clic('[data-fiche-envoyer]'); await pause(80);
  vrai(!(await present('[data-confirme-oui]')), 'une fiche incomplète part');
  vrai(/Il manque/.test(await texte()), 'pas de « Il manque » : ' + (await texte()).slice(-200));
  egal((await base()).fiches?.[FR]?.envoye, undefined, 'fiche envoyée sans le montant');
  await pg.fill(`${Z} [data-fiche-saisie="montant"]`, '-3'); await pause(30);
  await sansToast(); await clic('[data-fiche-envoyer]'); await pause(80);
  vrai(!(await present('[data-confirme-oui]')) && /À corriger/.test(await texte()), 'un montant négatif accepté');
  await pg.fill(`${Z} [data-fiche-saisie="montant"]`, '25'); await pause(30);
  await sansToast(); await clic('[data-fiche-envoyer]'); await confirmer();
  vrai(!!(await base()).fiches[FR].envoye, 'fiche non envoyée');
  await qFil();
  { const t = await texte(); const m = t.match(JUGE); vrai(!m, 'un mot qui juge : « ' + (m && m[0]) + ' » dans ' + (m && t.slice(Math.max(0, m.index - 60), m.index + 40).replace(/\n/g, '|'))); }
  egal(await pg.$$eval(`${Z} [data-fiche="${FR}"] select:not(:disabled), ${Z} [data-fiche="${FR}"] input:not(:disabled)`, (L) => L.length), 0, 'fiche encore modifiable après envoi');
});

await v('ENT-11.7 : l’ordre du travail — la règle ne s’ouvre qu’après l’appel, le dossier qu’après la règle ; le courriel d’Inès n’arrive qu’après le dossier ; chaque message de Claire arrive une seule fois', async () => {
  await monter({ uid: 'm117-d' });
  let M = await P.menu();
  vrai(!M.includes('fiche') && !M.includes(`fiche:${FD}`), 'fiches ouvertes d’avance : ' + M.join(', '));
  await appel();
  M = await P.menu();
  vrai(M.includes('fiche') && !M.includes(`fiche:${FD}`), 'après l’appel : ' + M.join(', '));
  await regle({ conclusion: 'recevable', montant: 25 });
  M = await P.menu();
  vrai(M.includes(`fiche:${FD}`), 'après la règle : ' + M.join(', '));
  egal((await entrants()).map((m) => m.subject), ['Une cliente à rappeler', 'Le suivi et les conditions de vente', 'Le dossier de réclamation'], 'messages avant le dossier');
  await dossier({ colis: 'MR 4417 2184', livraison: '2026-12-04', dommage: 'abime', suite: 'acceptee' });
  egal((await entrants()).map((m) => m.subject).filter((s) => s === 'Ma lampe cassée : votre réponse par écrit').length, 1, 'courriel d’Inès');
});

// ─────────────────────────────────────────────────────────── les questions au fil (réflexions)
await v('ENT-11.7 : les trois réflexions ne changent pas la note (20 avec ou sans réponse « fausse » d’emblée) et rien ne dit juste ou faux ; la question « combien pour une lampe » porte le prix de l’élève (65 € cas A, 90 € cas B) et propose les deux phrases de l’article 12', async () => {
  await monter({ uid: 'm117-b' });
  await appel(['presente', 'numero', 'reformule', 'verifier']);
  await regle({ conclusion: 'recevable', montant: 90 });
  const q = await pg.evaluate(async () => { const Q = await import('/contenus/questions/ENT-11.7.js'); const q = Q.QUESTIONS.liste.find((x) => x.id === 'combien-lampe');
    return { enonce: q.selon(window.__f.db).enonce, libs: q.choix.map((c) => c.lib) }; });
  egal(q.enonce, 'Inès a vendu sa lampe 90 €. Quelle phrase de l’article 12 s’applique à son colis ?', 'énoncé du cas B');
  vrai(q.libs[0].includes('limitée à 25 € par colis') && q.libs[1].includes('jusqu’à 500 € selon le niveau choisi'), 'phrases de l’article 12 : ' + q.libs.join(' | '));
  await dossier({ colis: 'MR 4417 2184', livraison: '2026-11-21', dommage: 'abime', suite: 'acceptee' });
  await courriel(CR(G['m117-b']));
  proche((await noter()).score, 20, 'les réflexions comptent dans la note');
  const r = (await base()).questions[ID];
  egal(['numero-d-abord', 'combien-lampe', 'prochain-envoi'].map((k) => !!(r[k] && r[k].premiere)), [true, true, true], 'réponses rangées');
});

// ─────────────────────────────────────────────────────────── la remise et le verrou
await v('ENT-11.7 : après la remise, la copie est verrouillée — plus de bouton « Rendre », l’appel se relit sans rien écrire, les fiches ne se modifient plus, la note ne bouge plus', async () => {
  await monter({ uid: 'm117-d' });
  await jouer('m117-d');
  await qFil();
  const c = await rendre();
  const avant = JSON.stringify([(await base()).dialogues, (await base()).fiches, (await base()).mails.filter((m) => m.folder === 'out').length]);
  await allerV('telephone');
  vrai(!(await present(`[data-dlg-appeler="${DID}"]`)) || /Relire/.test(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`)), 'l’appel peut être refait');
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche="${FR}"] select:not(:disabled), ${Z} [data-fiche="${FR}"] input:not(:disabled)`, (L) => L.length), 0, 'fiche modifiable après la remise');
  egal(JSON.stringify([(await base()).dialogues, (await base()).fiches, (await base()).mails.filter((m) => m.folder === 'out').length]), avant, 'la base a bougé après la remise');
  egal((await noter()).score, c.score, 'la note a bougé');
  egal(await pg.evaluate(() => window.__f.copies.length), 1, 'plusieurs remises');
});

await v('ENT-11.7 : rien ne dit juste ou faux avant la remise — parcours entièrement FAUX (cas B, réponses fausses partout) : aucun mot qui juge à l’écran ni dans les messages, aucun bilan ; tous les jalons tombent ; note 0 (ouverture fausse comprise) ; copie rendue = noter(db)', async () => {
  await monter({ uid: 'm117-b', rep: OUV_FAUSSES });
  await jouer('m117-b', { appel: ['agressif', 'promet', 'faux-fait', 'agace'], regle: { conclusion: 'toujours', montant: 500 },
    dossier: { colis: 'MR 1', livraison: '2026-11-01', dommage: 'retard', suite: 'refusee' },
    cr: { salutation: 'Bonjour,', decision: DEC.toujours, montant: ENTIER, regle: 'Pour un colis abîmé, il suffit de nous écrire quand vous le souhaitez.', fin: 'Cordialement' } });
  await qFil();
  const ecran = await texte();
  vrai(!JUGE.test(ecran), 'un mot qui juge à l’écran : ' + (ecran.match(JUGE) || [])[0]);
  vrai(!/Corriger/.test(ecran) && !(await present('[data-fin-jalon]')), 'bilan ou « Corriger »');
  vrai(!(await entrants()).some((m) => JUGE.test(m.text)), 'un message qui juge');
  const n = await noter();
  egal(JALONS.map((k) => n.detail[k]), JALONS.map(() => 'ko'), 'un jalon juste dans un parcours faux : ' + JSON.stringify(n.detail));
  proche(n.score, 0, 'note');
  const c = await rendre();
  egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-11.7 : deux élèves, deux cas — m117-d (A), m117-b (B), m117-h (C), m117-a (D) reçoivent chacun le leur ; le même élève retrouve le même cas (recharger, rouvrir sur sa base) ; le tirage est rangé une fois', async () => {
  const cas = {};
  for (const uid of Object.keys(G)) { const db = await monter({ uid }); cas[uid] = db.tirages[ID].pieces.cas[0]; egal(db.tirages[ID].valeurs.prix, G[uid].prix, `prix de ${uid}`); egal(db.tirages[ID].valeurs.jour, G[uid].jour, `jour de ${uid}`); }
  egal(cas, { 'm117-d': 'cas-a', 'm117-b': 'cas-b', 'm117-h': 'cas-c', 'm117-a': 'cas-d' }, 'cas tirés');
  const a1 = await monter({ uid: 'm117-b' });
  const a2 = await monter({ uid: 'm117-b', db: await base() });
  egal(a2.tirages[ID], a1.tirages[ID], 'recharger change le tirage');
  const autre = await monter({ uid: 'm117-h' });
  vrai(JSON.stringify(autre.tirages[ID].pieces) !== JSON.stringify(a1.tirages[ID].pieces), 'deux élèves ont le même cas');
});

await v('ENT-11.7 : 400 graines — les quatre cas sortent, chacun entre 70 et 130 fois (à parts égales) ; aucun secours ; le prix de la lampe entre 25 € et 500 € ; le jour de livraison est un jour de la liste (mardi à samedi, 17 novembre au 11 décembre) ; 0 à 2 jours (a, b, c) ou 5 à 6 jours (d) ; même chaîne de décisions pour tous (11 jalons, 20 points)', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent117-donnees.js');
    const S = await import('/contenus/mondial-relay-ent117.js');
    const n = {}, mal = [], secours = [];
    for (let i = 0; i < 400; i++) {
      const g = `eq-${i}|${D.ID}`, t = D.TIRAGE.tirer(g);
      if (t.secours) secours.push(g);
      const db = { tirages: { [D.ID]: { graine: g, ...t } } };
      const s = D.situationDe(db);
      n[s.cas] = (n[s.cas] || 0) + 1;
      if (!(s.prix > 25 && s.prix < 500)) mal.push(`${g} prix ${s.prix}`);
      if (!D.JOURS_POSSIBLES.includes(s.jour)) mal.push(`${g} jour ${s.jour}`);
      if (s.cas === 'd' ? !(s.jours >= 5 && s.jours <= 6) : !(s.jours >= 0 && s.jours <= 2)) mal.push(`${g} jours ${s.jours} (cas ${s.cas})`);
      if (s.aujourdhui > '2026-12-18') mal.push(`${g} aujourd’hui ${s.aujourdhui}`);
      if (s.cas === 'b' && s.montant !== s.prix) mal.push(`${g} B montant ${s.montant}`);
      if (s.cas === 'a' && s.montant !== 25) mal.push(`${g} A montant ${s.montant}`);
      if ((s.cas === 'c' || s.cas === 'd') && s.montant !== 0) mal.push(`${g} ${s.cas} montant ${s.montant}`);
    }
    const jours = D.JOURS_POSSIBLES.map((d) => new Date(d + 'T12:00:00Z').getUTCDay());
    return { n, mal, secours, jours: [Math.min(...jours), Math.max(...jours)], nbJours: D.JOURS_POSSIBLES.length, premier: D.JOURS_POSSIBLES[0], dernier: D.JOURS_POSSIBLES.slice(-1)[0],
      etapes: S.ETAPES.length, total: S.ETAPES.reduce((x, e) => x + e.poids, 0) };
  });
  egal(Object.keys(r.n).sort(), ['a', 'b', 'c', 'd'], 'les quatre cas sortent');
  vrai(Object.values(r.n).every((x) => x >= 70 && x <= 130), 'parts inégales : ' + JSON.stringify(r.n));
  egal(r.mal, [], 'valeurs hors bornes');
  egal(r.secours, [], 'tirages de secours');
  egal([r.jours, r.premier, r.dernier], [[2, 6], '2026-11-17', '2026-12-11'], 'jours de livraison (mardi à samedi)');
  egal([r.etapes, r.total], [11, 16], 'même chaîne de décisions pour tous');
});

await v('ENT-11.7 : le contrôle d’équité refuse un jeu hors bornes (prix > 500, retard du cas d trop court, jour inconnu, deux cas) et accepte le jeu témoin ; sans tirage (enseignant) la séance montre un jeu témoin conforme (cas A)', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent117-donnees.js');
    const bon = { pieces: { cas: [{ cas: 'a' }] }, valeurs: { prix: 60, jour: '2026-11-17', retard: 1, tard: 5 } };
    return { bon: D.ecartsJeu(bon), cher: D.ecartsJeu({ ...bon, valeurs: { ...bon.valeurs, prix: 600 } }), court: D.ecartsJeu({ ...bon, valeurs: { ...bon.valeurs, tard: 3 } }),
      jour: D.ecartsJeu({ ...bon, valeurs: { ...bon.valeurs, jour: '2026-12-25' } }), deux: D.ecartsJeu({ ...bon, pieces: { cas: [{}, {}] } }), temoin: D.situationDe({}) };
  });
  egal(r.bon, [], 'jeu témoin');
  vrai(r.cher.length && r.court.length && r.jour.length && r.deux.length, 'le contrôle ne refuse pas : ' + JSON.stringify([r.cher, r.court, r.jour, r.deux]));
  egal([r.temoin.cas, r.temoin.montant, r.temoin.conclusion], ['a', 25, 'recevable'], 'jeu témoin');
});

// ─────────────────────────────────────────────────────────── le corrigé
await v('ENT-11.7 : corrigé par élève — il suit la graine : A (25 €), B (90 €, valeur déclarée), C (0 €, retiré), D (0 €, hors délai) ; le fichier existe et se charge', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-11.7.js');
    const rep = (uid) => Object.fromEntries(C.corrigeEleve({}, uid).items.map((x) => [x.texte, x.rep]));
    return { a: rep('m117-d'), b: rep('m117-b'), c: rep('m117-h'), d: rep('m117-a'), communs: C.CORRIGE.items.length, texte: C.corrigeEleve({}, 'm117-d').texte };
  });
  egal([r.a['Le montant à écrire'], r.b['Le montant à écrire'], r.c['Le montant à écrire'], r.d['Le montant à écrire']], ['25 €', '90 €', '0 €', '0 €'], 'montants');
  vrai(/refusé, dans les 72 h, sans assurance/.test(r.a['Son cas']) && /avec assurance/.test(r.b['Son cas']) && /retiré/.test(r.c['Son cas']) && /5e jour/.test(r.d['Son cas']), 'cas');
  vrai(/valeur déclarée à l’assurance : 90 €/.test(r.b['Le prix de la lampe, les dates']) && /livré au Point Relais le 8 décembre 2026/.test(r.d['Le prix de la lampe, les dates'])
    && /6 jours après/.test(r.d['Le prix de la lampe, les dates']), 'dates et assurance');
  vrai(/réclamation refusée/.test(r.c['Le dossier']) && /réclamation acceptée/.test(r.a['Le dossier']), 'dossier');
  vrai(/pas encore ouvert/.test(r.texte) && r.communs === 5, 'corrigé commun');
  egal(await pg.evaluate(async () => (await fetch('/contenus/corriges/ENT-11.7.js')).status), 200, 'le fichier de corrigé est servi');
});

// ─────────────────────────────────────────────────────────── aucune requête externe, aucune erreur
await v('ENT-11.7 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer();
}
