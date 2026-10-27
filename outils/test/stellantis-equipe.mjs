// Suite de tests de Prepalog — bloc « stellantis-equipe » : Stellantis Sochaux, le temps 2 de C3.4 (ENT-13.10 à 13.12, Terminale), en fiches.
// `node outils/test.mjs stellantis-equipe` ne lance que ce bloc. Données : `contenus/stellantis-equipe.js`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur les documents le 27/10/2026 ; le code les calcule, le test les écrit) :
// Postes : bord de ligne = CACES 3 + formé au bord de ligne ; quai = CACES 3 ; racks = CACES 5 ; kits = tout le monde. Un seul poste par personne.
// ENT-13.10 : Julien (3 et 5, formé) au bord de ligne, Amel (3) au quai, Sébastien (5) aux racks, Théo (aucun) aux kits.
// ENT-13.11 : Amel (3, formée en avril) au bord de ligne, Sébastien (3 et 5) au quai, Inès (5) aux racks, Théo aux kits.
//   360 voitures, 45 % de 5008 → 162 ; 198 × 0,8 + 162 × 1,4 = 158,4 + 226,8 = 385,2 min → 2 personnes (360 min chacune) : un renfort.
// ENT-13.12 : graine « b » → Yanis ligne, Clara quai, Hugo racks, Léo kits ; 40 % → 144 ; 216 × 0,8 + 144 × 1,4 = 374,4 → 2 ; imprévu : aménager.
//   « y » → Romain ligne, Nolan quai, Sarah racks, Emma kits ; 25 % → 90 ; 270 × 0,8 + 90 × 1,4 = 342 → 1 ; imprévu : prévenir Karim et l'agence.
//   « a » → Inès ligne, Lucie quai, Malik racks, Tom kits ; 50 % → 180 ; 144 + 252 = 396 → 2 ; imprévu : appliquer la règle.
// 30 % de 5008 (ENT-13.10, non demandé) : 252 × 0,8 + 108 × 1,4 = 352,8 → 1.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCES = [
  ['stellantis-equipe-matin', '10'], ['stellantis-equipe-pointe', '11'], ['stellantis-evaluation-equipe', '12'],
].map(([id, n]) => ({ id, n, act: `/activites/${id}.js`, pre: `13${n}` }));
const S_ = Object.fromEntries(SEANCES.map((s) => [s.n, s]));
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S_['10'].act, id: S_['10'].id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, ouvrirParMessage } = P;

const OUV = { caces3: 'frontal', caces5: '5', premier: 'ligne', robots: 'seuls', autorisation: 'deux', renforcee: 'formation' };
const RF = {
  10: { 'pourquoi-ligne': 'arret', 'qui-forme': 'usine', 'consigne-ecrite': 'relire', ressenti: 'facile' },
  11: { prevenir: 'avant', pointe: 'pieces', 'droit-amenagement': 'obligation', ressenti: 'postes' },
  12: { ressenti: 'postes' },
};
let R = RF[10];
const qFil = async () => {
  for (let i = 0; i < 8; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 600 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
};
let S = S_['10'];
const mont = (s, o = {}) => { S = s; R = { ...RF[s.n], ...(o.fil || {}) }; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'st-' + s.id, ...o }); };
const detail = async () => (await noter(S.act)).detail;
const ko = (d) => Object.keys(d).filter((k) => d[k] === 'ko');

async function remplir({ liste = {}, choix = {}, cases = {}, nb = {}, ordre = {} }) {
  for (const [b, x] of Object.entries(liste)) { await pg.selectOption(`${Z} select[data-fiche-champ="${b}"]`, x); await pause(120); await qFil(); }
  for (const [b, x] of Object.entries(choix)) { await pg.check(`${Z} [data-fiche-champ="${b}"][value="${x}"]`); await pause(120); await qFil(); }
  for (const [b, L] of Object.entries(cases)) for (const x of L) { await pg.check(`${Z} [data-fiche-case="${b}"][value="${x}"]`); await pause(120); await qFil(); }
  for (const [b, x] of Object.entries(nb)) { await pg.fill(`${Z} [data-fiche-saisie="${b}"]`, String(x)); await pg.keyboard.press('Tab'); await pause(120); await qFil(); }
  for (const [b, O] of Object.entries(ordre)) {
    for (let k = 0; k < O.length; k++) for (let s = 0; s < 8; s++) {
      const cur = await pg.$$eval(`${Z} [data-fiche-ordre="${b}"] li`, (L) => L.map((x) => x.dataset.v));
      if (cur.indexOf(O[k]) <= k) break;
      await clic(`[data-fiche-ordre="${b}"] li[data-v="${O[k]}"] [data-ordre-sens="-1"]`); await pause(30);
    }
  }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
async function jouer(pas, { compte = {} } = {}) {
  for (let i = 0; i < pas.length; i++) {
    const p = pas[i];
    if (i === 0) await allerV('fiche'); else { await pause(700); await ouvrirParMessage(p.sujet, `fiche:f${S.pre}-${p.id}`); }
    await remplir(p.fiche);
  }
  const L = await pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, OBJET);
  vrai(L, 'pas de compte rendu');
  const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
  for (const [k, i] of Object.entries(compte)) t[k] = L[k][i];
  await phrases(OBJET, t);
  await qFil();
}
const postes = ([ligne, quai, racks, kits]) => ({ 'poste-ligne': ligne, 'poste-quai': quai, 'poste-racks': racks, 'poste-kits': kits });

const P10 = ({ aff = ['julien', 'amel', 'sebastien', 'theo'], accueil = ['securite', 'equipe', 'montrer', 'faire', 'point'],
  consigne = ['postes', 'tuteur', 'securite', 'releve'], droits = ['formation', 'chariot', 'epi'] } = {}) => [
  { id: 'affectation', fiche: { liste: postes(aff) } },
  { id: 'accueil', sujet: 'Théo arrive à 6 h', fiche: { ordre: accueil ? { accueil } : {} } },
  { id: 'consigne', sujet: 'La consigne affichée', fiche: { cases: { consigne } } },
  { id: 'droits', sujet: 'Une question de Théo', fiche: { cases: { droits } } },
];
const P11 = ({ aff = ['amel', 'sebastien', 'ines', 'theo'], kits = { cinq: '162', minutes: '385,2', personnes: '2' }, renfort = 'karim',
  amenagement = ['garder', 'chariot'], secret = 'amenage' } = {}) => [
  { id: 'affectation', fiche: { liste: postes(aff) } },
  { id: 'charge', sujet: 'Une pointe de 5008', fiche: { nb: kits } },
  { id: 'renfort', sujet: 'Et maintenant ?', fiche: { choix: { renfort } } },
  { id: 'amel', sujet: 'Le retour d’Amel', fiche: { cases: { amenagement } } },
  { id: 'secret', sujet: 'Sébastien pose une question', fiche: { choix: { secret } } },
];
const P12 = (J) => [
  { id: 'affectation', fiche: { liste: postes(J.aff) } },
  { id: 'charge', sujet: 'La charge des kits', fiche: { nb: J.kits } },
  { id: 'alea', sujet: 'Un imprévu', fiche: { choix: { alea: J.alea } } },
];
const J12 = [
  { uid: 'b', aff: ['yanis', 'clara', 'hugo', 'leo'], kits: { cinq: '144', minutes: '374,4', personnes: '2' }, alea: 'amenager' },
  { uid: 'y', aff: ['romain', 'nolan', 'sarah', 'emma'], kits: { cinq: '90', minutes: '342', personnes: '1' }, alea: 'karim' },
  { uid: 'a', aff: ['ines2', 'lucie', 'malik', 'tom'], kits: { cinq: '180', minutes: '396', personnes: '2' }, alea: 'regle' },
];

// ─────────────────────────────────────────────────────────── la déclaration et les données
await v('ENT-13.10 à 13.12 : les trois séances se chargent (Terminale, C3.4, guidage, entraînement, évaluation) ; jalons + questions = 20 ; 13.11 suit 13.10 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/stellantis-ent${s.pre}.js`);
      const Q = await import(`/contenus/questions/ENT-13.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret,
        A.meta.ouverture, A.meta.precedente, A.meta.parcours, A.meta.reinitialisable], total: C.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: Q.QUESTIONS.part || 0,
        ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) });
    }
    return out;
  }, SEANCES);
  egal(r.map((x) => x.m), [
    ['ENT-13.10', ['tle'], ['C3.4'], 'guidage', 20, undefined, 'ENT-13.10', true, 'prof', undefined, true, undefined],
    ['ENT-13.11', ['tle'], ['C3.4'], 'entrainement', 20, undefined, 'ENT-13.11', true, 'prof', 'stellantis-equipe-matin', true, undefined],
    ['ENT-13.12', ['tle'], ['C3.4'], 'evaluation', 20, true, 'ENT-13.12', true, 'prof', undefined, undefined, undefined],
  ], 'meta');
  egal(r.map((x) => x.total + x.part + x.ouvPart), [20, 20, 20], 'jalons + questions');
  egal(r.map((x) => x.noter === 'function'), [false, false, true], 'noter seulement en évaluation');
  egal(r.map((x) => x.reg), [true, true, true], 'au registre');
});

await v('ENT-13.10 à 13.12 : les données — une seule affectation possible par équipe, la charge des kits, les trois jeux tirés, les imprévus (valeurs à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/stellantis-equipe.js');
    const E = [M.E1310, M.E1311, ...M.TOUS_JEUX1312.map((j) => j.equipe)];
    const A = (x) => { const a = M.affectation(x); return [a.ligne, a.quai, a.racks, a.kits]; };
    const jeux = new Set(); for (let i = 0; i < 300; i++) jeux.add(M.jeu1312({ tirage: { graine: `eleve-${i}` } }).equipe[0].id);
    return { aff: E.map(A), n: E.map(M.nbAffectations), charge: [30, 45, 40, 25, 50].map((p) => { const c = M.charge(p); return [c.n5, c.minutes, c.personnes]; }),
      graines: ['b', 'y', 'a'].map((g) => M.jeu1312({ tirage: { graine: g } }).equipe[0].id), jeux: [...jeux].sort(),
      rangs: Object.values(M.ALEAS).map((x) => x.choix.findIndex((c) => c.v === x.juste)),
      ordre: M.blocsAffectation(M.E1310)[0].choix.map((c) => c.v) };
  });
  egal(r.aff, [['julien', 'amel', 'sebastien', 'theo'], ['amel', 'sebastien', 'ines', 'theo'], ['yanis', 'clara', 'hugo', 'leo'], ['romain', 'nolan', 'sarah', 'emma'],
    ['ines2', 'lucie', 'malik', 'tom']], 'affectations');
  egal(r.n, [1, 1, 1, 1, 1], 'une seule solution par équipe');
  egal(r.charge, [[108, 352.8, 1], [162, 385.2, 2], [144, 374.4, 2], [90, 342, 1], [180, 396, 2]], 'charge des kits');
  egal(r.graines, ['yanis', 'romain', 'ines2'], 'graines du test');
  egal(r.jeux, ['ines2', 'romain', 'yanis'], '300 graines tirent les trois jeux');
  egal(r.rangs, [1, 2, 0], 'la réponse juste de l’imprévu change de rang');
  egal(r.ordre, ['amel', 'julien', 'sebastien', 'theo'], 'les menus rangés par nom, pas dans l’ordre des postes');
});

await v('ENT-13.10 à 13.12 : les documents et les messages — mentions, phrases toutes différentes, le secret (l’avis ne dit pas la maladie) ; les corrigés se chargent', async () => {
  const r = await pg.evaluate(async (L) => {
    const txt = (h) => { const e = document.createElement('div'); e.innerHTML = h; return e.textContent.replace(/\s+/g, ' '); };
    const doubles = [], sans = [], corr = [];
    for (const s of L) {
      const C = await import(`/contenus/stellantis-ent${s.pre}.js`);
      for (const db of [{}, { tirage: { graine: 'a' } }, { tirage: { graine: 'b' } }, { tirage: { graine: 'y' } }]) {
        const d = C.VOLET.declencheurs.find((x) => x.id === 'compte');
        if (d) for (const l of d.semer('Léa', db).mails[0].phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`${s.n} ${l.id}`);
        for (const D of C.OPTIONS.documents) { const t = txt(typeof D.html === 'function' ? D.html(db) : D.html); if (!/Document pédagogique/.test(t)) sans.push(`${s.n} ${D.id}`); }
      }
      const K = await import(`/contenus/corriges/ENT-13.${s.n}.js`);
      corr.push([K.CORRIGE.code, K.CORRIGE.items.length > 0, K.corrigeEleve({ tirage: { graine: 'b' } }, 'b').items.length > 0]);
    }
    const C11 = await import('/contenus/stellantis-ent1311.js');
    return { doubles, sans, corr, avis: txt(C11.OPTIONS.documents.find((d) => d.id === 'avis').html) };
  }, SEANCES);
  egal(r.doubles, [], 'phrases en double');
  egal(r.sans, [], 'documents sans mention');
  egal(r.corr.map((x) => x[0]), ['ENT-13.10', 'ENT-13.11', 'ENT-13.12'], 'corrigés'); vrai(r.corr.every((x) => x[1] && x[2]), 'corrigé vide : ' + JSON.stringify(r.corr));
  vrai(/Restriction/.test(r.avis) && !/handicapée|reconnue|maladie d’Amel|diagnostic d’Amel/i.test(r.avis), 'l’avis trahit le secret médical : ' + r.avis);
});

// ─────────────────────────────────────────────────────────── ENT-13.10 et 13.11
await v('ENT-13.10 : inaction → 0/20 ; un message de Karim ; parcours juste → 20/20 ; aucun message ne juge', async () => {
  await mont(S_['10'], { sansOuverture: true });
  const n0 = await noter(S.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  await mont(S_['10']);
  egal((await entrants()).length, 1, 'un seul message');
  await jouer(P10());
  const n = await noter(S.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  vrai(!(await entrants()).some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct|faux)\b/i.test(m.text)), 'un message juge');
});
await v('ENT-13.10 : sabotages — Amel et Julien échangés (−2), l’accueil envoyé sans rien ranger (−2,5), la vie de Karim dans la consigne (−3,5), « Julien lui montre le chariot » (−2), compte rendu faux (−4)', async () => {
  await mont(S_['10']);
  await jouer(P10({ aff: ['amel', 'julien', 'sebastien', 'theo'], accueil: null, consigne: ['postes', 'tuteur', 'securite', 'releve', 'vie'],
    droits: ['formation', 'chariot', 'epi', 'montrer'] }), { compte: { postes: 1 } });
  egal(ko(await detail()), ['poste-ligne', 'poste-quai', 'accueil-1', 'accueil-2', 'accueil-3', 'accueil-4', 'accueil-5', 'consigne', 'droits', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 6, 'note');
});
await v('ENT-13.11 : parcours juste → 20/20 ; sabotages — Inès et Sébastien échangés (−2), les kits comptés en 3008 (−2,5), « Théo ira plus vite » (−1,5), Amel porte (−2), l’avis lu à Sébastien (−1,5), compte rendu « seul » (−3,5)', async () => {
  await mont(S_['11']);
  await jouer(P11());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['11']);
  await jouer(P11({ aff: ['amel', 'ines', 'sebastien', 'theo'], kits: { cinq: '162', minutes: '288', personnes: '1' }, renfort: 'vite',
    amenagement: ['garder', 'chariot', 'porter'], secret: 'avis' }), { compte: { renfort: 1 } });
  egal(ko(await detail()), ['poste-quai', 'poste-racks', 'minutes', 'personnes', 'renfort', 'amenagement', 'secret', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 7, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-13.12 (copie rendue)
await v('ENT-13.12 : « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste → 20/20 dans chacun des trois jeux', async () => {
  for (const J of J12) {
    await mont(S_['12'], { uid: J.uid });
    let n = await noter(S.act);
    proche(n.score, 3, `jeu ${J.uid} : ouverture seule ` + JSON.stringify(n.detail));
    vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
    await jouer(P12(J));
    n = await noter(S.act);
    proche(n.score, 20, `jeu ${J.uid} : ` + JSON.stringify(n.detail));
  }
});
await v('ENT-13.12 : jeu « y » — sabotages : Emma au quai et Nolan aux kits (−3), deux personnes aux kits (−1,5), Nolan mis aux kits pour l’imprévu (−3,5)', async () => {
  const J = J12[1];
  await mont(S_['12'], { uid: J.uid });
  await jouer(P12({ ...J, aff: ['romain', 'emma', 'sarah', 'nolan'], kits: { ...J.kits, personnes: '2' }, alea: 'nolan' }));
  egal(ko(await detail()), ['poste-quai', 'poste-kits', 'personnes', 'alea'], 'jalons tombés');
  proche((await noter(S.act)).score, 12, 'note');
});
}
