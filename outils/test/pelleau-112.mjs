// Suite de tests de Prepalog — bloc « pelleau-112 » : Transports Pelleau ENT-10.12, évaluation « contrôler la réception » (CAP OL, évaluation CAP-C1.4, copie rendue).
// `node outils/test.mjs pelleau-112` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides communes :
// `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`). Brief : `docs/briefs/ENT-10.12-pelleau-evaluation-controle.md` §8. Modèles : `pelleau-108` (évaluation en copie, remise,
// quai qui ne rend pas la copie) et `pelleau-111` (le quai de contrôle, la palette de Kervéguen).
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-evaluation-controle.js` → `rendre`, `noter`), de vrais clics à
// la SOURIS (Playwright vérifie que rien ne recouvre la cible) ; les listes des phrases par `selectOption`. Mouvement réduit.
//
// Valeurs ÉCRITES À LA MAIN (relevé du tirage le 20/10/2026), jamais recalculées par le code de la séance. Quatre élèves TÉMOINS (la graine = l'identifiant) :
//   « temoin-1 » (colis caché)  : P1 Agri-Kerlann PIÈGE, couche du dessus à 5 sacs sur 10, FR 35 = réel 35 · P2 Ar Vag, 2 cartons ÉCRASÉS devant (facile) · P3 Ar Vag conforme ·
//                                  P4 Agri-Kerlann, 1 sac abîmé DERRIÈRE (il faut faire le tour).
//   « temoin-3 » (le froid)     : P1 Agri-Kerlann, 2 sacs PERCÉS devant (facile) · P2 FERME DE KERVÉGUEN (32 sacs, « Conservation : entre 4 et 8 °C — craint le gel ») à REFUSER ·
//                                  P3 Ar Vag conforme · P4 Ar Vag PIÈGE, couche du dessus à 4 cartons sur 8, FR 36 = réel 36.
//   « temoin-5 » (le froid)     : P1 Ar Vag PIÈGE (FR 36 = réel 36) · P2 Ar Vag conforme · P3 Agri-Kerlann, 2 sacs PERCÉS devant (facile) · P4 Kervéguen à REFUSER.
//   « temoin-8 » (manquants)    : P1 Agri-Kerlann PIÈGE (FR 35 = réel 35) · P2 Ar Vag conforme · P3 Agri-Kerlann, 2 sacs PERCÉS devant (facile) · P4 Ar Vag, 2 cartons MANQUANTS
//                                  au dessus (FR 40, réel 38).
// Poids : palettes sans problème 1,5 × 2 · palettes à problème 2,5 × 2 · réserves 1,5 × 2 · pas de déballage 0,5 · signature 0,5 · compte rendu : contenu 3, forme 1 · ouverture 4.
// Total 20. Ce qui vaut son prix : les parcours justes jusqu'à la remise (= `noter`), l'inaction à 0, le quai qui NE rend PAS la copie, rien qui dise juste ou faux, rien qui dise le
// froid avant l'étiquette, l'équité du tirage, une faute qui ne fait tomber que SON jalon.

import { ouvrirPelleau, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-evaluation-controle';
const QID = 'pelleau-quai-112';
const PHR = 'pelleau-compte-rendu-112';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-evaluation-controle.js', id: ID });
const { pg, Z, pause, base, present, texte, entrants, aller, clic, erreurs, hotes } = P;
const Q = (s) => `${Z} ${s}`;
const CAPTURES = process.env.CAPTURES_ENT112 || '';
let capturer = false;
const capture = async (nom, cible = null) => {
  if (!CAPTURES || !capturer) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(Q('[data-carte-fermer]')); await pause(40); }
  if (cible) await pg.$eval(Q(cible), (e) => e.scrollIntoView({ block: 'center' }));
  else await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.evaluate(() => { const t = document.getElementById('toast'); if (t) t.style.display = 'none'; });   // la bulle « Copie rendue » d'un cas précédent
  await pause(60);
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};

const OUV = { reserve: 'remarque', avarie: 'abimee', manquant: 'absent', couches: 'juste', depot: 'rendre', 'zone-litiges': 'cote', ambiant: 'sans-froid',
  'img-sac': 'perce', 'img-carton-ecrase': 'ecrase' };
const OUV_FAUSSES = { reserve: 'secours', avarie: 'retard', manquant: 'trop', couches: 'somme', depot: 'revendre', 'zone-litiges': 'vides', ambiant: 'parking',
  'img-sac': 'neuf', 'img-carton-ecrase': 'vide' };
// Monte la séance comme le site (base en mémoire) ; `copies` reçoit les remises. `o.uid` = la graine ; `o.rep` : réponses d'« Avant de commencer » posées d'avance
// (défaut : justes) ; `o.sansOuverture`.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import(o.activite);
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Qs = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [k, r] of Object.entries(o.rep)) if (!Qs[k]) Qs[k] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'temoin-1' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'PE',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { activite: '/activites/pelleau-evaluation-controle.js', id: ID, rep: OUV, ...o });
const noter = () => pg.evaluate(async () => { const A = await import('/activites/pelleau-evaluation-controle.js'); return A.noter(window.__f.db); });
const note0 = noter;
const copies = () => pg.evaluate(() => window.__f.copies.length);
const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

const JALONS = ['palette-facile', 'palette-moyen', 'palette-piege', 'palette-conforme', 'reserve-facile', 'reserve-moyen', 'deballage', 'signature', 'cr-contenu', 'cr-forme'];
const POIDS = [2.5, 2.5, 1.5, 1.5, 1.5, 1.5, 0.5, 0.5, 3, 1];
const GROUPES = ['Contrôler les palettes', 'Réserves et signature', 'Rendre compte'];
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
// Ce qui dirait « juste » ou « faux » à l'écran (le bilan n'existe pas en copie).
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse|bonus)\b/i;
// Ce qui dirait « froid » avant l'étiquette (sans « ambiant » : « Pelleau en bref » et la question `ambiant` disent que l'entrepôt n'a pas de froid, un fait du site).
const FROID = /froid|frais|\bgel\b|gèle|geler|réfrigér|conserv|température|4 à 8|4 et 8|plants?\b|pommes de terre/i;
const KG = 'KG-10633';
const SALUT = 'Bonjour Erwan,', FIN = 'Je reste au quai. Lea';
const KERV = 'Je n’ai pas stocké la palette de Kervéguen : des plants à garder entre 4 et 8 °C.';
const CONTROLE_2_2 = 'J’ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 2 Agri-Kerlann.';
// Les quatre témoins. `pal` : [comptage, décision, motif] de chaque palette ; `res` : ce qui s'écrit dans la case de chaque réserve ; `tour` : la palette dont il faut faire le tour ;
// `ids` : le rôle de chaque palette ; `cr` : la phrase juste de chaque ligne du compte rendu.
const W = {
  cache: { graine: 'temoin-1', tour: 'P4', ids: { facile: 'P2', moyen: 'P4', piege: 'P1', conforme: 'P3' },
    pal: { P1: [35, 'accepter'], P2: [40, 'reserves', 'avarie'], P3: [40, 'accepter'], P4: [40, 'reserves', 'avarie'] }, res: { P2: '2', P4: '1' },
    controle: CONTROLE_2_2,
    cr: { salutation: SALUT, reserves: 'Réserves signées par Loïc : P2, 2 cartons abîmés ; P4, 1 sac abîmé.',
      litiges: 'J’ai mis les 2 cartons abîmés de P2 et le sac abîmé de P4 en zone litiges.', fin: FIN } },
  froid: { graine: 'temoin-3', tour: null, ids: { facile: 'P1', moyen: 'P2', piege: 'P4', conforme: 'P3' },
    pal: { P1: [40, 'reserves', 'avarie'], P2: [32, 'refuser', 'produit'], P3: [40, 'accepter'], P4: [36, 'accepter'] }, res: { P1: '2', P2: KG },
    controle: 'J’ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 1 Agri-Kerlann, 1 Kervéguen.',
    cr: { salutation: SALUT, reserves: 'Réserves signées par Loïc : P1, 2 sacs abîmés.', litiges: 'J’ai mis les 2 sacs abîmés de P1 en zone litiges.',
      kerveguen: KERV, fin: FIN } },
  froid2: { graine: 'temoin-5', tour: null, ids: { facile: 'P3', moyen: 'P4', piege: 'P1', conforme: 'P2' },
    pal: { P1: [36, 'accepter'], P2: [40, 'accepter'], P3: [40, 'reserves', 'avarie'], P4: [32, 'refuser', 'produit'] }, res: { P3: '2', P4: KG },
    controle: 'J’ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 1 Agri-Kerlann, 1 Kervéguen.',
    cr: { salutation: SALUT, reserves: 'Réserves signées par Loïc : P3, 2 sacs abîmés.', litiges: 'J’ai mis les 2 sacs abîmés de P3 en zone litiges.',
      kerveguen: KERV, fin: FIN } },
  manquant: { graine: 'temoin-8', tour: null, ids: { facile: 'P3', moyen: 'P4', piege: 'P1', conforme: 'P2' },
    pal: { P1: [35, 'accepter'], P2: [40, 'accepter'], P3: [40, 'reserves', 'avarie'], P4: [38, 'reserves', 'manquant'] }, res: { P3: '2', P4: '2' },
    controle: CONTROLE_2_2,
    cr: { salutation: SALUT, reserves: 'Réserves signées par Loïc : P3, 2 sacs abîmés ; P4, 2 cartons manquants.', litiges: 'J’ai mis les 2 sacs abîmés de P3 en zone litiges.', fin: FIN } },
};

// Le menu ne se redessine qu'au changement d'écran : comme l'élève, on passe par la Messagerie.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pg.waitForSelector(Q('[data-confirme-oui]'), { timeout: 1500 }).catch(() => {}); if (await present('[data-confirme-oui]')) { await pg.click(Q('[data-confirme-oui]')); await pause(); } };
const etatsEtapes = () => pg.evaluate(async () => {
  const S = await import('/contenus/pelleau-ent112.js');
  return S.ETAPES.map((e) => [e.id, e.verifier(window.__f.db).status]);
});
// Les jalons KO d'une note (ids).
const ko = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');

let libelleClore = '';
// Une palette : sélectionnée, (tournée), comptée, décidée, validée.
async function palette(n, [compte, decision, motif], tour = false) {
  await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30);
  if (tour) { await pg.click(Q('[data-q="tourner"]')); await pg.click(Q('[data-q="tourner"]')); await pause(30); }
  await pg.fill(Q('#qCompte'), String(compte)); await pg.press(Q('#qCompte'), 'Enter');
  await pg.click(Q(`#qDec-${decision}`));
  if (motif) await pg.click(Q(`#qMot-${motif}`));
  await pg.click(Q('[data-q="valider"]'));
  await pause(30);
}
// Le quai : chaque palette, puis les réserves, la mention (o.deballage), la signature et la clôture (deux clics : elle ne rend PAS la copie).
async function quai(K, o = {}) {
  const pal = Object.assign({}, K.pal, o.pal || {}), res = Object.assign({}, K.res, o.res || {});
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  const ids = ['P1', 'P2', 'P3', 'P4'];
  for (let n = 0; n < 4; n++) await palette(n, pal[ids[n]], o.tour === undefined ? K.tour === ids[n] : o.tour === ids[n]);
  await pg.click(Q('[data-q="vers4"]')); await pg.click(Q('[data-q="vers4"]')); await pause();
  for (const [id, val] of Object.entries(res)) if (await present(`#qRes-${id}`)) await pg.fill(Q(`#qRes-${id}`), val);
  // Une case de réserve présente que le cas ne remplit pas (palette mal décidée) est remplie d'une valeur quelconque : elle ne bloque pas l'écriture.
  for (const el of await pg.$$(Q('[id^="qRes-"]'))) if (!(await el.inputValue())) await el.fill('0');
  if (o.deballage) await pg.check(Q('[data-q-deballage]'));
  await pg.click(Q('[data-q="ecrire"]')); await pause();
  await pg.click(Q('[data-q="signer"]')); await pause();
  libelleClore = (await pg.textContent(Q('[data-q="clore"]'))).trim();
  await pg.click(Q('[data-q="clore"]')); await pg.click(Q('[data-q="clore"]')); await pause();
}
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(Q('[data-dossier="in"]'));
  await pg.click(Q(`.ent-obj:text-is("${sujet}")`));
  await pause();
}
const choixDe = (ligne) => pg.$$eval(Q(`[data-phrase="${ligne}"] option`), (L) => L.map((x) => x.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));
// Le compte rendu (phrases à choisir) : `lignes` = { ligne: texte choisi }.
async function compteRendu(lignes) {
  await ouvrirMail('Ton compte rendu');
  await pg.click(Q('[data-repondre]'));
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(Q(`[data-phrase="${l}"]`), { label: t }); await pause(30); }
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  await pg.waitForFunction(() => (window.__f.db.mails || []).some((m) => m.folder === 'out' && m.phrases), null, { timeout: 4000 });
}
async function parcours(K, o = {}) {
  await quai(K, o);
  await compteRendu(o.cr || K.cr);
}
async function rendre() {
  await pg.click(Q('[data-copie-rendre]'));
  await pg.click(Q('[data-copie-rendre]'));
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}

// ─────────────────────────────────────────────────────────── la déclaration, le registre et les jeux figés
await v('ENT-10.12 : la séance se charge (CAP, CAP-C1.4, évaluation, copie, sans parcours ni correction ni niveau) ; poids 16 + ouverture 4 = 20 jalon par jalon écrit à la main ; AUCUNE question au fil ; au registre sous l’entreprise n° 10 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée ; le quai ne rend pas la copie, aucune aide', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-evaluation-controle.js');
    const S = await import('/contenus/pelleau-ent112.js');
    const Qs = await import('/contenus/questions/ENT-10.12.js');
    const D = await import('/contenus/pelleau-ent112-donnees.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const charges = await I.chargerActivites();
    const m = A.meta, E = S.ETAPES;
    const q = D.quaiDe('x');
    return { meta: m, noter: typeof A.noter, ids: E.map((e) => e.id), poids: E.map((e) => e.poids), somme: E.reduce((t, e) => t + (e.poids || 0), 0), part: Qs.QUESTIONS.part,
      partOuv: Qs.QUESTIONS.ouverture.part, types: [...new Set(Qs.QUESTIONS.liste.map((x) => x.type))], nbQ: Qs.QUESTIONS.liste.length,
      groupes: [...new Set(E.map((e) => e.groupe))], ecrans: E.filter((e) => e.ecran).map((e) => e.id), bonus: E.filter((e) => e.bonus).length,
      parGroupe: Object.entries(E.reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})),
      ouv: [Qs.QUESTIONS.ouverture.tirage, Qs.QUESTIONS.ouverture.questions.length, Qs.QUESTIONS.ouverture.questions.filter((x) => x.startsWith('img-')).length],
      aides: JSON.stringify(Qs.QUESTIONS.liste).includes('"aide"') || JSON.stringify(Qs.QUESTIONS.liste).includes('[['),
      quai: [q.rendCopie, q.aides, q.arret, q.commence, q.securite, q.froid, q.recommencer],
      auRegistre: charges.some((a) => a.meta.id === ID), echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /pelleau/.test(f)),
      entreprise: (I.ENTREPRISES.find((e) => e.n === 10) || {}).nom,
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  const m = r.meta;
  egal([m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.copie, m.questions, m.corrige],
    ['pelleau-evaluation-controle', 'ENT-10.12', 'simulog', ['cap'], [], ['CAP-C1.4'], 'evaluation', 20, true, 'ENT-10.12', './contenus/corriges/ENT-10.12.js'], 'meta');
  egal([m.pret, m.ouverture], [true, 'prof'], 'livrée fermée aux élèves : pret true, ouverture « prof »');
  egal([m.parcours, m.correction, m.niveauxPrevus, m.precedente], [undefined, undefined, undefined, undefined], 'ni parcours, ni correction, ni niveau (comme ENT-8.6, 8.10 et 10.8)');
  egal(r.noter, 'function', 'export noter');
  egal(r.ids, JALONS, 'jalons');
  egal(r.poids, POIDS, 'poids jalon par jalon (écrits à la main)');
  proche(r.somme, 16, 'somme des poids des jalons');
  proche(r.somme + r.part, 20, 'somme des jalons et de la part de l’ouverture');
  egal(r.parGroupe, [['Contrôler les palettes', 8], ['Réserves et signature', 4], ['Rendre compte', 4]], 'points par ligne du bandeau (brief §5 : 8 + 4 + 4, plus l’ouverture 4)');
  egal(r.groupes, GROUPES, 'lignes du bandeau');
  egal(r.ecrans, ['cr-contenu', 'cr-forme'], 'seul le compte rendu se rouvre (il n’y a pas de « Corriger » en copie)');
  egal([r.part, r.partOuv, r.types, r.nbQ, r.bonus], [4, 4, ['ouverture'], 9, 0], 'ouverture notée 4, uniquement des questions d’ouverture, aucun bonus');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 9, 2], 'Avant de commencer : 9 notions (7 + 2 images), 3 + 1 tirées');
  egal(r.aides, false, 'aucune aide ni mot cliquable dans les questions');
  egal(r.quai, [false, {}, undefined, 'controle', undefined, false, false], 'le quai : rendCopie false, aides éteintes, ni arrêt ni inspection, commence au contrôle, pas de froid');
  egal([r.auRegistre, r.echecs, r.entreprise], [true, [], 'Transports Pelleau'], 'au registre, sans échec');
  egal([r.cap, r.coche, r.autre], [false, true, false], 'fermée, puis ouverte par l’enseignant ; jamais hors CAP');
});

await v('ENT-10.12 : les quatre jeux témoins sont ceux écrits à la main (la formule du tirage ne change pas sous les élèves) — palettes, client, rôle, feuille et réel, décision attendue, étiquette ; verifierQuai accepte chaque quai', async () => {
  const r = await pg.evaluate(async (graines) => {
    const D = await import('/contenus/pelleau-ent112-donnees.js');
    const Qm = await import('/core/types/quai.js');
    return graines.map((g) => {
      const q = D.quaiDe(g), j = D.jeuDe(g);
      return { pal: q.camions[0].palettes.map((p) => [p.id, p.client, p.forme || 'cartons', j.palettes.find((x) => x.id === p.id).role, p.bl, p.W * p.D * p.L - p.manque.length,
        Object.keys(p.avarie).length, p.attendu, p.motifAttendu, p.conservation || null, p.etiq.poids]), verif: Qm.verifierQuai(q) };
    });
  }, ['temoin-1', 'temoin-3', 'temoin-5', 'temoin-8']);
  egal(r[0].pal, [['P1', 'agri-kerlann', 'sacs', 'piege', 35, 35, 0, 'accepter', 'aucun', null, '1 sac'], ['P2', 'ar-vag', 'cartons', 'facile', 40, 40, 2, 'reserves', 'avarie', null, '1 carton'],
    ['P3', 'ar-vag', 'cartons', 'conforme', 40, 40, 0, 'accepter', 'aucun', null, '1 carton'], ['P4', 'agri-kerlann', 'sacs', 'moyen', 40, 40, 1, 'reserves', 'avarie', null, '1 sac']], 'temoin-1');
  egal(r[1].pal, [['P1', 'agri-kerlann', 'sacs', 'facile', 40, 40, 2, 'reserves', 'avarie', null, '1 sac'], ['P2', 'kerveguen', 'sacs', 'moyen', 32, 32, 0, 'refuser', 'produit', 'entre 4 et 8 °C — craint le gel', '1 sac'],
    ['P3', 'ar-vag', 'cartons', 'conforme', 40, 40, 0, 'accepter', 'aucun', null, '1 carton'], ['P4', 'ar-vag', 'cartons', 'piege', 36, 36, 0, 'accepter', 'aucun', null, '1 carton']], 'temoin-3 (le froid en P2)');
  egal(r[2].pal, [['P1', 'ar-vag', 'cartons', 'piege', 36, 36, 0, 'accepter', 'aucun', null, '1 carton'], ['P2', 'ar-vag', 'cartons', 'conforme', 40, 40, 0, 'accepter', 'aucun', null, '1 carton'],
    ['P3', 'agri-kerlann', 'sacs', 'facile', 40, 40, 2, 'reserves', 'avarie', null, '1 sac'], ['P4', 'kerveguen', 'sacs', 'moyen', 32, 32, 0, 'refuser', 'produit', 'entre 4 et 8 °C — craint le gel', '1 sac']], 'temoin-5 (le froid en P4)');
  egal(r[3].pal, [['P1', 'agri-kerlann', 'sacs', 'piege', 35, 35, 0, 'accepter', 'aucun', null, '1 sac'], ['P2', 'ar-vag', 'cartons', 'conforme', 40, 40, 0, 'accepter', 'aucun', null, '1 carton'],
    ['P3', 'agri-kerlann', 'sacs', 'facile', 40, 40, 2, 'reserves', 'avarie', null, '1 sac'], ['P4', 'ar-vag', 'cartons', 'moyen', 40, 38, 0, 'reserves', 'manquant', null, '1 carton']], 'temoin-8 (manquants)');
  egal(r.map((x) => x.verif), [[], [], [], []], 'verifierQuai');
});

await v('ENT-10.12 : tirage sur 300 graines — EXACTEMENT 2 palettes à problème (une facile, une moyenne), 1 piège, 1 conforme, de deux clients différents (Kervéguen compte pour un client) ; le froid sur un tiers des copies et à tous les rangs ; cartons écrasés chez Ar Vag, sacs percés chez Agri-Kerlann ; zéro jeu de secours ; verifierQuai sur chaque quai', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent112-donnees.js');
    const Qm = await import('/core/types/quai.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const c = { secours: 0, froid: 0, rang: [0, 0, 0, 0], moyen: { cache: 0, manquant: 0, froid: 0 }, faute: [], quai: [], vus: new Set(), clientsPb: new Set(), pieges: 0, phrase: [] };
    const MOT = { 'ar-vag': ['carton', 'cartons'], 'agri-kerlann': ['sac', 'sacs'] };
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, t = tirerJeu(D.TIRAGE, `${g}|pelleau-evaluation-controle`), J = t.jeu;
      if (t.secours) c.secours++;
      const roles = J.palettes.map((p) => p.role).sort().join();
      const fa = J.palettes.filter((p) => p.role === 'facile'), mo = J.palettes.filter((p) => p.role === 'moyen');
      const pi = J.palettes.filter((p) => p.role === 'piege'), co = J.palettes.filter((p) => p.role === 'conforme');
      if (roles !== 'conforme,facile,moyen,piege' || fa.length !== 1 || mo.length !== 1 || pi.length !== 1 || co.length !== 1) c.faute.push([g, 'rôles ' + roles]);
      if (fa[0].client === mo[0].client) c.faute.push([g, 'deux palettes à problème du même client']);
      c.clientsPb.add(`${fa[0].client}+${mo[0].client}`);
      const avecAnomalie = J.palettes.filter((p) => p.anomalie !== 'conforme' && p.anomalie !== 'couche-normale');
      if (avecAnomalie.length !== 2) c.faute.push([g, 'pas 2 palettes à problème']);
      if (fa[0].anomalie !== (fa[0].client === 'ar-vag' ? 'ecrase-face' : 'perce-face')) c.faute.push([g, 'facile ' + fa[0].anomalie + ' chez ' + fa[0].client]);
      c.moyen[mo[0].anomalie]++;
      c.vus.add(`${mo[0].anomalie}@${mo[0].client}`);
      const kv = J.palettes.filter((p) => p.client === 'kerveguen');
      if (kv.length > 1 || (mo[0].anomalie === 'froid') !== (kv.length === 1) || (kv.length === 1 && (kv[0].role !== 'moyen' || kv[0].bl !== 32))) c.faute.push([g, 'Kervéguen mal placée']);
      if (kv.length === 1) { c.froid++; c.rang[+kv[0].id.slice(1) - 1]++; }
      if (D.verifier(J).length) c.faute.push([g, D.verifier(J)]);
      const q = D.quaiDe(g), e = Qm.verifierQuai(q);
      if (e.length) c.quai.push([g, e]);
      // La phrase juste des réserves, recomposée ici sans le code de la séance (les palettes à réserve, hors Kervéguen, par ordre de palette).
      const L = J.palettes.filter((p) => (p.role === 'facile' || p.role === 'moyen') && p.client !== 'kerveguen');
      const dit = L.map((p) => { const n = p.anomalie === 'cache' ? 1 : 2, [un, des] = MOT[p.client];
        return `${p.id}, ${n} ${n > 1 ? des : un} ${p.anomalie === 'manquant' ? (n > 1 ? 'manquants' : 'manquant') : (n > 1 ? 'abîmés' : 'abîmé')}`; }).join(' ; ');
      const C = D.choixReserves(J);
      if (C[0] !== `Réserves signées par Loïc : ${dit}.` || new Set(C).size !== 4 || !C.includes('Tout est conforme, aucune réserve.')) c.phrase.push([g, C[0], dit]);
    }
    return { ...c, vus: [...c.vus].sort(), clientsPb: [...c.clientsPb].sort() };
  });
  egal([r.secours, r.faute, r.quai, r.phrase], [0, [], [], []], 'secours, équité, verifierQuai, phrase juste des réserves');
  vrai(r.froid >= 70 && r.froid <= 130, `le froid sur environ un tiers des copies : ${r.froid} sur 300`);
  vrai(r.rang.every((n) => n >= 12), `la palette de Kervéguen couvre P1 à P4 : ${r.rang}`);
  vrai(['cache', 'manquant', 'froid'].every((k) => r.moyen[k] >= 70 && r.moyen[k] <= 130), `les trois moyennes équilibrées : ${JSON.stringify(r.moyen)}`);
  egal(r.vus, ['cache@agri-kerlann', 'cache@ar-vag', 'froid@kerveguen', 'manquant@agri-kerlann', 'manquant@ar-vag'], 'chaque anomalie moyenne tombe, chez chaque client possible');
  egal(r.clientsPb, ['agri-kerlann+ar-vag', 'agri-kerlann+kerveguen', 'ar-vag+agri-kerlann', 'ar-vag+kerveguen'], 'les couples de clients (facile + moyenne) qui tombent');
});

await v('ENT-10.12 : tirage stable par graine et différent d’un élève à l’autre — le même jeu et le même quai à chaque appel (les mêmes objets), au moins 20 jeux distincts sur 60 élèves, la présence ET le rang de la palette de Kervéguen et la palette à anomalie varient, deux élèves voisins ne se ressemblent pas tous', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent112-donnees.js');
    const stable = ['temoin-1', 'zoé', 'eleve-17'].every((g) => D.jeuDe(g) === D.jeuDe(g) && D.quaiDe(g) === D.quaiDe(g) && JSON.stringify(D.jeuDe(g)) === JSON.stringify(D.jeuDe(g)));
    const jeux = new Set(), voisins = [], froids = new Set(), rangs = new Set(), anomalies = new Set();
    for (let i = 0; i < 60; i++) {
      const J = D.jeuDe(`el-${i}`);
      jeux.add(JSON.stringify(J)); voisins.push(JSON.stringify(J) === JSON.stringify(D.jeuDe(`el-${i + 1}`)));
      const kv = D.kerveguenDe(J);
      froids.add(!!kv); if (kv) rangs.add(kv.id);
      anomalies.add(J.palettes.find((p) => p.role === 'facile').id + ':' + J.palettes.find((p) => p.role === 'moyen').anomalie);
    }
    return { stable, distincts: jeux.size, voisinsPareils: voisins.filter(Boolean).length, froids: [...froids].sort(), rangs: [...rangs].sort(), anomalies: anomalies.size, vide: D.jeuDe('') === D.jeuDe(undefined) };
  });
  vrai(r.stable, 'un jeu change d’un appel à l’autre');
  vrai(r.distincts >= 20, 'trop peu de jeux distincts : ' + r.distincts);
  vrai(r.voisinsPareils <= 6, 'élèves voisins trop souvent identiques : ' + r.voisinsPareils);
  egal(r.froids, [false, true], 'des copies avec et sans la palette de Kervéguen');
  vrai(r.rangs.length >= 3, 'le rang de la palette de Kervéguen varie : ' + r.rangs);
  vrai(r.anomalies >= 6, 'la palette à anomalie varie : ' + r.anomalies);
  vrai(r.vide, 'la base vide (enseignant) n’a pas un jeu qui change');
});

// ─────────────────────────────────────────────────────────── le contenu : phrases, textes, « que, jamais de combien »
await v('ENT-10.12 : le compte rendu est CALCULÉ sur le tirage — pour chaque témoin, la ligne « contrôlé », les réserves, la zone litiges et (copies avec Kervéguen seulement) la palette non stockée sont celles écrites à la main ; les lignes ne sont pas les mêmes pour tout le monde mais la forme l’est ; aucun jour de la semaine', async () => {
  const r = await pg.evaluate(async (graines) => {
    const D = await import('/contenus/pelleau-ent112-donnees.js');
    const S = await import('/contenus/pelleau-ent112.js');
    return graines.map((g) => { const J = D.jeuDe(g), P = D.phrasesCompteRendu('Lea', J);
      return { lignes: P.lignes.map((l) => l.id), controle: P.lignes.find((l) => l.id === 'controle').texte,
        juste: Object.fromEntries(P.lignes.filter((l) => l.choix).map((l) => [l.id, l.choix[l.juste]])), n: P.lignes.filter((l) => l.choix).map((l) => l.choix.length),
        contenu: D.lignesContenu(J), mails: JSON.stringify(S.VOLET.declencheurs.find((d) => d.id === 'compte-rendu').semer('Lea', { tirage: { graine: g }, volets: {} }).mails.map((m) => ({ ...m, phrases: undefined }))) }; });
  }, [W.cache.graine, W.froid.graine, W.froid2.graine, W.manquant.graine]);
  [W.cache, W.froid, W.froid2, W.manquant].forEach((K, i) => {
    egal(r[i].juste, K.cr, `phrases justes de ${K.graine}`);
    egal(r[i].controle, K.controle, `ligne imposée de ${K.graine}`);
    egal(r[i].lignes, ['salutation', 'controle', 'reserves', 'litiges', ...(K.cr.kerveguen ? ['kerveguen'] : []), 'fin'], `lignes de ${K.graine}`);
    egal(r[i].contenu, ['reserves', 'litiges', ...(K.cr.kerveguen ? ['kerveguen'] : [])], `lignes du « contenu » de ${K.graine}`);
    vrai(!JOURS.test(r[i].mails), 'un jour de la semaine dans le message du compte rendu');
  });
  egal(r[0].n, [3, 4, 3, 3], 'nombre de choix par ligne (salutation, réserves, litiges, fin) : le même pour tous');
  egal(r[1].n, [3, 4, 3, 4, 3], 'avec Kervéguen : une ligne de plus, à quatre choix');
});

await v('ENT-10.12 : « que, jamais de combien » et jamais « froid » avant l’étiquette — sur 300 graines, ni la consigne d’Erwan, ni le message d’arrivée, ni le compte rendu demandé, ni les documents, ni l’accueil, ni le menu des motifs, ni le texte du quai ne parlent de froid, de gel, de température ni de plants ; le texte du quai ne change pas avec le tirage (la zone de Kervéguen est toujours là) ; « Conservation » n’est que sur l’étiquette du sac de Kervéguen', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent112-donnees.js');
    const S = await import('/contenus/pelleau-ent112.js');
    const Qs = await import('/contenus/questions/ENT-10.12.js');
    const mails = (f) => f.mails.map((m) => `${m.subject} ${m.text}`).join(' ');
    // Les documents, sans « Pelleau en bref » (il dit que l'entrepôt est ambiant et raconte les plants de Germicopa depuis 1989 : l'histoire réelle de l'entreprise).
    const docs = S.DOCUMENTS.filter((d) => d.id !== 'pelleau-112').map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)).join('\n');
    const ouv = JSON.stringify(Qs.QUESTIONS.liste.filter((x) => x.id !== 'ambiant'));
    const fixes = [docs, mails(S.VOLET.semer('Lea', {})), mails(S.VOLET.declencheurs.find((x) => x.id === 'compte-rendu').semer('Lea', {})), JSON.stringify(S.ACCUEIL),
      D.consigneErwan(), D.LIBELLE_PRODUIT, ouv, S.OPTIONS.exercice].join('\n');
    const textes = (q) => JSON.stringify([q.titre, q.avertissement, q.camions[0].parole, q.libelles, q.motifs, q.unite, q.depose.clients, q.depose.cases.map((c) => c.id), q.lieu, q.zone]);
    const ref = textes(D.quaiDe('')), varient = [], cons = [], fuitesFr = [];
    for (let i = 0; i < 300; i++) {
      const q = D.quaiDe(`g-${i}`);
      if (textes(q) !== ref) varient.push(i);
      const avec = q.camions[0].palettes.filter((p) => p.conservation !== undefined).map((p) => p.client);
      if (avec.length > 1 || (avec.length === 1 && avec[0] !== 'kerveguen') || JSON.stringify(q.camions[0].palettes.filter((p) => p.client !== 'kerveguen')).includes('onservation')) cons.push(i);
      if (/froid|gel|4 et 8/i.test(JSON.stringify(q.camions[0].palettes.filter((p) => p.client !== 'kerveguen').map((p) => p.etiq)))) fuitesFr.push(i);
    }
    return { dedans: fixes, varient: varient.slice(0, 5), cons: cons.slice(0, 5), fuitesFr, ref };
  });
  const trouve = r.dedans.match(FROID);
  vrai(!trouve, `un mot du froid avant l’étiquette : « ${trouve && r.dedans.slice(Math.max(0, trouve.index - 60), trouve.index + 60)} »`);
  egal(r.varient, [], 'graines dont le texte du quai diffère du jeu de référence');
  egal(r.cons, [], 'graines où « Conservation » n’est pas sur la seule étiquette de Kervéguen');
  egal(r.fuitesFr, [], 'graines où l’étiquette d’une autre palette parle de froid');
  vrai(/Kervéguen|KERV/i.test(r.ref), 'la zone de Kervéguen est toujours déclarée (vide ou non) : ' + r.ref.slice(0, 200));
});

// ─────────────────────────────────────────────────────────── Avant de commencer, inaction
await v('ENT-10.12 : « Avant de commencer » — 4 questions tirées (3 de préparation + 1 image), « Je ne sais pas » en dernier, AUCUNE aide ni mot cliquable ni mot qui juge, aucune question sur la conservation ni le thermomètre ; barème : 4 justes = 4, 3 + « Je ne sais pas » = 3, 3 + 1 fausse = 2,5, tout faux = 0 ; rien au Suivi', async () => {
  capturer = true;
  const db = await monter({ uid: W.cache.graine, sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal([ids.length, ids.filter((x) => /^img-/.test(x)).length], [4, 1], 'questions tirées');
  vrai(ids.every((i) => Object.keys(OUV).includes(i)), 'ids de la banque : ' + ids);
  vrai(!ids.some((i) => /conservation|thermometre|froid/.test(i)), 'une question qui dirait la décision de la palette de Kervéguen : ' + ids);
  await capture('0-avant-de-commencer');
  const choix = await pg.$$eval(Q('[data-q-choix]'), (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  vrai(!/\[\[|\]\]/.test(await texte()), 'des crochets de mot cliquable à l’écran');
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(Q('[data-q-repondre]'), (b) => b.dataset.qRepondre);
    await pg.click(Q(`[data-q-choix="${k === 3 ? '@nsp' : OUV[id]}"][data-q="${id}"]`));
    await pg.click(Q(`[data-q-repondre="${id}"]`)); await pause();
    const t = await pg.$eval(Q('[data-ouverture]'), (e) => e.textContent.replace(/\s+/g, ' '));
    vrai(!/\b(bravo|bien vu|bonne réponse|mauvaise réponse|c’est juste|c’est faux)\b/i.test(t), 'une phrase qui juge à l’ouverture : ' + t.slice(0, 300));
    if (k < 3) await pg.click(Q('[data-cle="suivante"]'));
  }
  await pg.click(Q('[data-ouv-continuer]')); await pause();
  await capture('1-accueil');
  capturer = false;
  proche((await noter()).score, 3, '3 justes + « Je ne sais pas »');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  const pts = async (rep) => { await monter({ uid: W.cache.graine, rep: { ...OUV, ...rep } }); return (await noter()).score; };
  const prep = ids.find((x) => !/^img-/.test(x));
  proche(await pts({}), 4, 'quatre justes');
  proche(await pts({ [prep]: '@nsp' }), 3, 'trois justes + « Je ne sais pas »');
  proche(await pts({ [prep]: OUV_FAUSSES[prep] }), 2.5, `trois justes + une fausse (${prep}, − 1 ÷ 2)`);
  proche(await pts(OUV_FAUSSES), 0, 'tout faux (plancher 0)');
});

await v('ENT-10.12 : inaction — rien fait (ouverture sans réponse, aucun écran) → 0/20, aucun jalon juste, même « pas de déballage » et « signature » (les quatre témoins) ; ouverture juste seule → 4/20 et aucun jalon ; copie vide rendue → 0 ; à l’ouverture un seul message d’Erwan ; le quai ouvert sans rien faire ne juge rien', async () => {
  for (const k of ['cache', 'froid', 'froid2', 'manquant']) {
    await monter({ uid: W[k].graine, sansOuverture: true });
    const n = await noter();
    egal([n.score, n.max], [0, 20], 'note ' + k);
    egal(JALONS.filter((j) => n.detail[j] === 'ok'), [], `jalons justes sans rien faire (${k})`);
  }
  await monter({ uid: W.froid.graine });
  const n = await noter();
  egal([n.score, n.max], [4, 20], 'ouverture juste seule : 4 sur 20, aucun jalon');
  egal(JALONS.filter((j) => n.detail[j] === 'ok'), [], 'jalons justes sans rien faire, ouverture répondue');
  egal((await etatsEtapes()).filter(([, s]) => s === 'ok'), [], 'aucun jalon vrai : rien n’est jugé avant la signature ni l’envoi');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Erwan', 'Les palettes de la ramasse', ['droit-depot']]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 4, 26, 8], 'date du message : 26 mai 2026, 8 h');
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  egal((await etatsEtapes()).filter(([, s]) => s === 'ok'), [], 'le quai ouvert, rien de plus');
  egal((await noter()).score, 4, 'le quai ouvert sans rien décider : toujours 4');
  egal((await rendre()).score, 4, 'copie vide rendue : l’ouverture seule compte');
  await monter({ uid: W.froid.graine, sansOuverture: true });
  egal((await rendre()).score, 0, 'copie vraiment vide rendue → 0');
});

// ─────────────────────────────────────────────────────────── les parcours justes à l'écran, jusqu'à la remise
async function parcoursJuste(cle, captures) {
  const K = W[cle];
  capturer = !!captures;
  await monter({ uid: K.graine });
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  vrai(/Je suis au bureau : tu contrôles seul/.test(await pg.textContent(Q('.quai-avert'))), 'la consigne d’Erwan en tête du quai');
  await capture('2-quai-controle', 'svg[data-q-palette]');
  if (captures) {
    // La palette de Kervéguen : son étiquette, lue au zoom.
    const n = ['P1', 'P2', 'P3', 'P4'].indexOf(K.ids.moyen);
    await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30);
    await pg.dispatchEvent(Q('svg[data-q-palette] [data-q-carton="5"]'), 'click');
    await pg.waitForSelector(Q('[data-q-etiquette]'));
    await capture('3-etiquette-au-zoom', '[data-q-etiquette]');
  }
  await parcours(K);
  const E = await entrants();
  egal(E.map((x) => [x.from, x.subject]), [['Erwan', 'Les palettes de la ramasse'], ['Erwan', 'Ton compte rendu'], ['Erwan', 'Merci']], 'les messages, dans l’ordre');
  egal(E.filter((x) => JOURS.test(x.text + x.subject)).map((x) => x.subject), [], 'un jour de la semaine dans un message');
  egal(E.filter((x) => JUGE.test(x.text)).map((x) => x.subject), [], 'un message dit juste / faux / erreur');
  vrai(/Rendre ma copie/.test(E[2].text) && E[2].text.replace(/\s+/g, ' ') === `Merci Lea. Quand tu as fini, clique sur « Rendre ma copie », en haut de l’écran. Erwan`, 'Erwan remercie sans reprendre ce que l’élève a écrit : ' + E[2].text);
  vrai(E.every((x, i) => !i || x.ts >= E[i - 1].ts), 'heures croissantes');
  egal(libelleClore, 'Clore la réception', 'le bouton de clôture ne dit pas « rendre ma copie »');
  egal(await copies(), 0, `le quai ne rend PAS la copie (${cle})`);
  vrai(!(await present('[data-copie-etat="rendue"]')), 'copie rendue au bandeau après le quai');
  const ecran = await texte();
  vrai(!(await present('[data-fin-jalon]')) && !(await present('[data-fin-seance] [data-fin]')) && !/Corriger/.test(ecran), 'bilan ou « Corriger » à l’écran avant la remise');
  egal(await pg.$$eval(Q('[data-pastille]'), (L) => L.map((x) => x.classList.contains('fait'))), [true, true], 'pastilles « fait »');
  const n = await noter();
  egal(ko(n), [], `jalons (${cle})`);
  egal([n.score, n.max], [20, 20], 'noter(db) : ' + JSON.stringify(n.detail).slice(0, 400));
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  if (captures) await capture('4-avant-remise');
  const c = await rendre();
  egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
  vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
  if (captures) await capture('5-copie-rendue');
  capturer = false;
  egal(await copies(), 1, 'une seule remise');
  egal(erreurs, [], 'erreurs JavaScript');
}
await v('ENT-10.12 : parcours juste à l’écran, colis caché (temoin-1 : écrasés devant en P2, un sac abîmé DERRIÈRE en P4, piège en P1) — 20/20 à la remise, égal à noter(db) ; le quai ne rend pas la copie ; rien ne dit juste ou faux ; messages dans l’ordre, sans jour de la semaine', async () => {
  await parcoursJuste('cache', false);
});
await v('ENT-10.12 : parcours juste à l’écran, LE FROID (temoin-3 : Kervéguen en P2 refusée, sacs percés en P1, piège en P4) — 20/20 à la remise, égal à noter(db) ; la ligne « palette non stockée » est dans le compte rendu', async () => {
  await parcoursJuste('froid', true);
  const lignes = await pg.evaluate(() => window.__f.db.mails.find((m) => m.folder === 'in' && m.phrases).phrases.lignes.map((l) => l.id));
  egal(lignes, ['salutation', 'controle', 'reserves', 'litiges', 'kerveguen', 'fin'], 'lignes du compte rendu');
});
await v('ENT-10.12 : parcours juste à l’écran, LE FROID dans un autre rang (temoin-5 : Kervéguen en P4) — 20/20', async () => {
  await parcoursJuste('froid2', false);
});
await v('ENT-10.12 : parcours juste à l’écran, deux colis MANQUANTS (temoin-8 : P4, FR 40 pour 38 réels) — 20/20 ; sans palette de Kervéguen, aucune ligne sur elle dans le compte rendu', async () => {
  await parcoursJuste('manquant', false);
  const lignes = await pg.evaluate(() => window.__f.db.mails.find((m) => m.folder === 'in' && m.phrases).phrases.lignes.map((l) => l.id));
  egal(lignes, ['salutation', 'controle', 'reserves', 'litiges', 'fin'], 'lignes du compte rendu');
});

// ─────────────────────────────────────────────────────────── la copie : rien ne dit juste ou faux, rien n'arrête, le quai ne rend pas la copie
await v('ENT-10.12 : en copie, rien ne réagit — « Refuser » une palette qui n’a rien, « Accepter » celle de Kervéguen, un comptage faux : aucune réaction du quai, aucun verdict, aucun arrêt, le mot « juste » ou « faux » n’apparaît nulle part à l’écran ; la clôture du quai ne rend pas la copie et aucun bilan ne s’affiche', async () => {
  const K = W.froid;
  await monter({ uid: K.graine });
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  const surveille = async (quoi) => {
    const t = await texte();
    vrai(!JUGE.test(t.replace(/Réponse enregistrée\./g, '')), `${quoi} : un mot qui juge à l’écran : « ${(t.match(JUGE) || [])[0]} »`);
    vrai(!(await present('[data-q-verdict]')) && !(await present('[data-q-secu-arret]')) && !(await present('[data-fin-jalon]')), `${quoi} : verdict, arrêt ou bilan à l’écran`);
  };
  // Une palette sans problème REFUSÉE (motif « produit »), la palette de Kervéguen ACCEPTÉE, un comptage faux : tout passe, sans une réaction.
  await palette(2, [41, 'refuser', 'produit']); await surveille('P3 refusée');
  await palette(1, [32, 'accepter']); await surveille('Kervéguen acceptée');
  await palette(0, [3, 'reserves', 'avarie']); await surveille('comptage faux');
  await palette(3, [36, 'accepter']); await surveille('P4');
  const l = await pg.$$eval(Q('[data-q-palette] , [data-q-bloc="decider"]'), (L) => L.length);
  vrai(l > 0, 'le quai reste ouvert');
  await pg.click(Q('[data-q="vers4"]')); await pg.click(Q('[data-q="vers4"]')); await pause();
  for (const el of await pg.$$(Q('[id^="qRes-"]'))) await el.fill('1');
  await pg.click(Q('[data-q="ecrire"]')); await pause(); await surveille('réserves écrites');
  await pg.click(Q('[data-q="signer"]')); await pause(); await surveille('signature');
  vrai(/REFUSÉE/.test(await pg.textContent(Q('[data-quai]'))), 'la ligne du refus est écrite sur la feuille (le mot REFUSÉE)');
  await pg.click(Q('[data-q="clore"]')); await pg.click(Q('[data-q="clore"]')); await pause();
  egal(await copies(), 0, 'la clôture du quai ne rend pas la copie');
  vrai(!/et copie rendue/.test(await texte()), 'le quai ne dit pas « copie rendue »');
  await surveille('quai clos');
  egal((await base()).quais[QID].fini, true, 'le quai est clos');
  const n = await noter();
  egal(n.detail['palette-moyen'], 'ko', 'Kervéguen acceptée : fausse');
  egal(n.detail['palette-conforme'], 'ko', 'la palette sans problème refusée : fausse');
  egal(n.detail['palette-facile'], 'ko', 'le comptage faux : faux');
});

// ─────────────────────────────────────────────────────────── les fautes : chacune ne fait tomber que SON jalon
await v('ENT-10.12 : accepter la palette froide est FAUX (temoin-3, tout le reste juste) — palette de Kervéguen ✗ (2,5) et sa réserve ✗ (1,5) : 16 / 20', async () => {
  const K = W.froid;
  await monter({ uid: K.graine });
  await parcours(K, { pal: { P2: [32, 'accepter'] }, res: { P2: KG } });
  const n = await note0();
  egal(ko(n), ['palette-moyen', 'reserve-moyen'], 'accepter sans réserve : jalons faux');
  proche(n.score, 16, 'accepter : le reste est juste (20 − 2,5 − 1,5)');
});
await v('ENT-10.12 : accepter avec réserves (motif « Ne se stocke pas ici ») n’est pas un refus ; refuser pour « Colis abîmé » non plus ; refuser avec une référence fausse : la décision reste ✓, la réserve ✗ (1,5)', async () => {
  const K = W.froid;
  await monter({ uid: K.graine });
  await parcours(K, { pal: { P2: [32, 'reserves', 'produit'] }, res: { P2: KG } });
  egal(ko(await note0()), ['palette-moyen', 'reserve-moyen'], 'accepter avec réserves, motif produit');
  await monter({ uid: K.graine });
  await parcours(K, { pal: { P2: [32, 'refuser', 'avarie'] }, res: { P2: '2' } });
  const n2 = await note0();
  egal(ko(n2), ['palette-moyen', 'reserve-moyen'], 'refuser pour « Colis abîmé »');
  proche(n2.score, 16, 'refuser pour « Colis abîmé » : 20 − 2,5 − 1,5');
  await monter({ uid: K.graine });
  await parcours(K, { res: { P2: 'KG-00000' } });
  const n3 = await note0();
  egal(ko(n3), ['reserve-moyen'], 'référence fausse sur la ligne du refus');
  proche(n3.score, 20 - 1.5, 'référence fausse : 18,5');
});
await v('ENT-10.12 : erreurs ciblées (temoin-1) — le piège compté « plein » : seul palette-piege ✗ (−1,5) ; le sac abîmé DERRIÈRE accepté sans faire le tour : palette-moyen ✗ et reserve-moyen ✗ (−4) ; la palette à problème acceptée sans réserve : palette-facile ✗ et reserve-facile ✗ (−4)', async () => {
  const K = W.cache;
  await monter({ uid: K.graine });
  await parcours(K, { pal: { P1: [40, 'accepter'] } });
  const n = await note0();
  egal(ko(n), ['palette-piege'], 'le piège compté plein');
  proche(n.score, 18.5, 'note');
  await monter({ uid: K.graine });
  await parcours(K, { pal: { P4: [40, 'accepter'] }, res: { P2: '2' }, tour: null });
  const n2 = await note0();
  egal(ko(n2), ['palette-moyen', 'reserve-moyen'], 'le sac abîmé derrière accepté');
  proche(n2.score, 16, 'note');
  await monter({ uid: K.graine });
  await parcours(K, { pal: { P2: [40, 'accepter'] }, res: { P4: '1' } });
  const n3 = await note0();
  egal(ko(n3), ['palette-facile', 'reserve-facile'], 'la palette à problème acceptée');
  proche(n3.score, 16, 'note');
});
await v('ENT-10.12 : « sous réserve de déballage » ajoutée : seul le jalon du déballage ✗ (−0,5) ; compte rendu « Tout est conforme » : le contenu ✗ (−3), la forme reste ; salutation ou fin fautive : la forme ✗ (−1), le contenu reste', async () => {
  const K = W.cache;
  await monter({ uid: K.graine });
  await parcours(K, { deballage: true });
  vrai((await base()).quais[QID].mentionEcrite === true, 'la mention est écrite');
  const n = await note0();
  egal(ko(n), ['deballage'], 'déballage');
  proche(n.score, 19.5, 'note');
  await monter({ uid: K.graine });
  await parcours(K, { cr: { ...K.cr, reserves: 'Tout est conforme, aucune réserve.' } });
  const n2 = await note0();
  egal(ko(n2), ['cr-contenu'], 'compte rendu « tout est conforme »');
  proche(n2.score, 17, 'note');
  await monter({ uid: K.graine });
  await parcours(K, { cr: { ...K.cr, litiges: 'J’ai rangé les colis abîmés en stock avec les autres.' } });
  egal(ko(await note0()), ['cr-contenu'], 'la zone litiges fausse');
  await monter({ uid: K.graine });
  await parcours(K, { cr: { ...K.cr, salutation: 'Salut Erwan,' } });
  const n3 = await note0();
  egal(ko(n3), ['cr-forme'], 'salutation fautive');
  proche(n3.score, 19, 'note');
  await monter({ uid: K.graine });
  await parcours(K, { cr: { ...K.cr, fin: 'Cordialement' } });
  egal(ko(await note0()), ['cr-forme'], 'fin fautive');
  const F = W.froid;
  await monter({ uid: F.graine });
  await parcours(F, { cr: { ...F.cr, kerveguen: 'J’ai rangé la palette de Kervéguen au rack du fond, le plus frais.' } });
  egal(ko(await note0()), ['cr-contenu'], 'la ligne sur Kervéguen fausse fait tomber le contenu');
});
await v('ENT-10.12 : pire cas — tout faux (ouverture fausse, chaque palette mal décidée, comptages faux, mention de déballage, phrases fausses) → il ne reste que la signature : 0,5 / 20 ; rien ne dit juste ou faux à la remise', async () => {
  const K = W.froid;
  await monter({ uid: K.graine, rep: OUV_FAUSSES });
  await parcours(K, { pal: { P1: [12, 'accepter'], P2: [32, 'accepter'], P3: [10, 'refuser', 'produit'], P4: [40, 'reserves', 'manquant'] }, res: { P4: '9' }, deballage: true,
    cr: { salutation: 'Monsieur le directeur,', reserves: 'Tout est conforme, aucune réserve.', litiges: 'J’ai rendu les colis abîmés à Loïc.',
      kerveguen: 'La palette de Kervéguen est en ordre : je l’ai stockée.', fin: 'À plus.' } });
  const n = await note0();
  egal(JALONS.filter((j) => n.detail[j] === 'ok'), ['signature'], 'seule la signature est juste');
  proche(n.score, 0.5, 'note');
  const c = await rendre();
  egal([c.score, c.max], [0.5, 20], 'la remise');
  vrai(!JUGE.test((await texte()).replace(/Réponse enregistrée\./g, '')), 'un mot qui juge à la remise');
});

// ─────────────────────────────────────────────────────────── le corrigé, le socle
await v('ENT-10.12 : corrigé enseignant — par élève (temoin-3 avec Kervéguen, temoin-1 sans) : ses palettes (anomalie, feuille, réel, décision, réserve ; Kervéguen à REFUSER), ses phrases justes ; un élève qui n’a pas ouvert la séance reçoit déjà le bon', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.12.js');
    const e = C.corrigeEleve({ tirage: { graine: 'temoin-3' } }, 'x');
    const f = C.corrigeEleve({ tirage: { graine: 'temoin-1' } }, 'x');
    const vide = C.corrigeEleve({}, 'temoin-3');
    return { froid: e.items.map((i) => [i.texte, i.rep]), cache: f.items.map((i) => i.texte), memes: JSON.stringify(vide.items) === JSON.stringify(e.items), texte: vide.texte.length > 0, ouvert: e.texte, n: C.CORRIGE.items.length };
  });
  egal(r.froid, [
    ['P1 — Agri-Kerlann — Terreau universel, sacs de 40 L (à problème, facile)', '2 sacs percés sur la face avant · FR 40 · réel 40 · accepter avec réserves (Colis abîmé) · réserve : 2 colis abîmé(s)'],
    ['P2 — Ferme de Kervéguen — Plants de pommes de terre, sacs de 25 kg (à problème)',
      'PLANTS DE POMMES DE TERRE : l’étiquette dit « Conservation : entre 4 et 8 °C — craint le gel », l’entrepôt est ambiant · FR 32 · réel 32 · REFUSER (Ne se stocke pas ici) · réserve : palette REFUSÉE, produit livré = la référence de l’étiquette'],
    ['P3 — Biscuiterie Ar Vag — Biscuits au beurre, cartons de 12 paquets (sans problème)', 'conforme, pleine · FR 40 · réel 40 · accepter · aucune réserve'],
    ['P4 — Biscuiterie Ar Vag — Biscuits au beurre, cartons de 12 paquets (sans problème, piège)',
      'PIÈGE : couche du dessus à moitié vide, mais la feuille de ramasse dit le même nombre · FR 36 · réel 36 · accepter · aucune réserve'],
    ['Compte rendu : la ligne « contrôlé »', 'J’ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 1 Agri-Kerlann, 1 Kervéguen.'],
    ['Compte rendu : la ligne des réserves', 'Réserves signées par Loïc : P1, 2 sacs abîmés.'],
    ['Compte rendu : la zone litiges', 'J’ai mis les 2 sacs abîmés de P1 en zone litiges.'],
    ['Compte rendu : la palette de Kervéguen', KERV],
    ['Compte rendu : salutation et fin', 'Bonjour Erwan, … Je reste au quai. (prénom)']], 'corrigé du témoin avec Kervéguen');
  egal(r.cache.filter((t) => /Kervéguen/.test(t)), [], 'le corrigé d’une copie sans Kervéguen ne parle pas de la palette de Kervéguen');
  vrai(r.memes && r.texte && r.ouvert === '', 'élève qui n’a pas ouvert la séance : son jeu, déjà le bon');
  egal(r.n, 5, 'parties du corrigé commun');
});

await v('ENT-10.12 : socle — aucune adresse hors du site, aucune erreur JavaScript, aucun jour de la semaine ni année dans les documents ; écrans à 1366 × 768 sans défilement horizontal (accueil, quai, compte rendu)', async () => {
  const doc = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent112.js'); return S.DOCUMENTS.filter((d) => d.id !== 'pelleau-112').map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)).join('\n'); });
  vrai(!JOURS.test(doc), 'un jour de la semaine dans un document');
  vrai(!/\b20\d\d\b/.test(doc.replace(/consulté le \d\d\/\d\d\/20\d\d/g, '')), 'une année dans un document');
  await monter({ uid: W.froid.graine });
  vrai(await large() <= 0, 'accueil : défilement horizontal');
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  vrai(await large() <= 0, 'quai : défilement horizontal');
  await parcours(W.froid);
  await ouvrirMail('Ton compte rendu');
  vrai(await large() <= 0, 'compte rendu : défilement horizontal');
  egal([...hotes], [], 'adresses hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await P.fermer();
}
