// Suite de tests de Prepalog — bloc « lidl » : Lidl ENT-21.1 à 21.6, la plateforme et direction régionale de Meaux (2de GATL).
// `node outils/test.mjs lidl` ne lance que ce bloc. Cadrage : `docs/briefs/lidl/CADRAGE-lidl-2de.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur les documents le 27/10/2026 ; le code les calcule, le test les écrit) :
// Quais : secs 1-2, fruits et légumes 3, frais 4-5, surgelés 6. Limites : frais +4 °C au plus, surgelés -18 °C au plus, fruits et légumes de +6 à +12 °C.
// ENT-21.2 : un créneau d'une heure par quai, dans l'ordre des demandes → C1 6 h, C2 6 h, C3 7 h (un seul quai de surgelés), C4 6 h, C5 7 h (deux quais
//   de frais pris), C6 7 h ; 26 palettes × 2 + 15 = 67 min.
// Grille : A < 30 km 38 €, B de 30 à 60 km 46 €, C > 60 km 55 € la palette ; froid +15 % ; hayon 25 € ; attente 40 € par heure entamée après 30 min.
// ENT-21.3 : 12 × 46 = 552 ; 82,80 ; 25 + 40 = 65 ; 699,80 € ; notre camion 84 × 1,10 + 4 × 31 = 216,40 € ; × 1,2 = 259,68 €.
// ENT-21.5 : jeu 0 (« a ») 10 × 55 = 550 ; 82,50 ; 65 ; 697,50 ; 146 × 1,10 + 5 × 31 = 315,60 ; 378,72. Jeu 1 (« g ») 14 × 46 = 644 ; 96,60 ; 80 (2 h entamées) ;
//   820,60 ; 76 × 1,10 + 93 = 176,60 ; 211,92. Jeu 2 (« b ») 8 × 38 = 304 ; 45,60 ; 25 ; 374,60 ; 24 × 1,10 + 62 = 88,40 ; 106,08.
// ENT-21.4 : 40 × 9,60 + 28 × 12,50 + 20 × 8,40 = 902 € HT ; TVA 5,5 % 49,61 ; 951,61 TTC ; livré le 14/10 → décade au 20/10 → 19/11/2026.
// ENT-21.6 : jeu 0 (« a ») 1 502 ; 82,61 ; 1 584,61 ; 02/11 → 10/12. Jeu 1 (« g ») 1 914 ; 105,27 ; 2 019,27 ; 25/11 → 30/12. Jeu 2 (« b ») 1 535,90 ; 84,47 ;
//   1 620,37 ; 17/11 → 20/12.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCES = [
  ['lidl-bienvenue', '1'], ['lidl-planning', '2'], ['lidl-transport', '3'], ['lidl-facture', '4'], ['lidl-evaluation-transport', '5'], ['lidl-evaluation-facture', '6'],
].map(([id, n]) => ({ id, n, act: `/activites/${id}.js`, pre: `21${n}` }));
const S_ = Object.fromEntries(SEANCES.map((s) => [s.n, s]));
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S_['1'].act, id: S_['1'].id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, jouerCarte, ouvrirParMessage } = P;

const OUV = { magasins: '61', froid: 'froid', direction: 'direction', produits: 'alimentaire', surgele: 'moins18', donnees: 'personnelles' };
// Les réponses au fil, séance par séance (les réflexions : le premier choix, non noté).
const RF = {
  1: { chaine: 'froid', rdv: 'pret', 'droit-reserve': 'reserve', metier: 'froid' },
  2: { ordre: 'dernier', attente: 'retard', 'droit-temps': 'non', planning: 'calcul' },
  3: { distance: 'couts', 'cout-froid': 'groupe', 'droit-eco': 'plein', choisir: 'prix' },
  4: { reception: 'bon', tva: 'etat', 'droit-delai': 'producteurs', fraude: 'oui' },
  5: { apres: 'zone' },
  6: { apres: 'rapprochement' },
};
let R = RF[1];
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
let S = S_['1'];
const mont = (s, o = {}) => { S = s; R = { ...RF[s.n], ...(o.fil || {}) }; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'li-' + s.id, ...o }); };
const detail = async () => (await noter(S.act)).detail;
const ko = (d) => Object.keys(d).filter((k) => d[k] === 'ko');

// Une fiche : `liste` = { bloc: valeur } (menu), `choix` = { bloc: valeur } (radio), `cases` = { bloc: [valeurs] }, `nb` = { bloc: texte },
// `ordre` = { bloc: [valeurs dans l'ordre voulu] } (flèches ↑ à la souris).
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
// Le parcours : `pas` = [{ sujet, fiche }] dans l'ordre de la séance (le premier s'ouvre par le menu), `compte` = { ligne: rang du choix } (0 = la phrase juste).
async function jouer(pas, { carte = null, compte = {} } = {}) {
  for (let i = 0; i < pas.length; i++) {
    const p = pas[i];
    // Après un envoi, l'accusé de réception arrive une demi-seconde après le message suivant et redessine sa carte : l'attendre.
    if (i === 0) await allerV('fiche'); else { await pause(700); await ouvrirParMessage(p.sujet, `fiche:f${S.pre}-${p.id}`); }
    await remplir(p.fiche);
    if (i === 0 && carte) { await jouerCarte(carte, R); await qFil(); }
  }
  const L = await pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, OBJET);
  if (L) {
    const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
    for (const [k, i] of Object.entries(compte)) t[k] = L[k][i];
    await phrases(OBJET, t);
    await qFil();
  }
}
const num = (pfx, L) => Object.fromEntries(L.map((x, i) => [`${pfx}-${i + 1}`, x]));
const par = (pfx, ids, L) => Object.fromEntries(ids.map((id, i) => [`${pfx}-${id}`, L[i]]));
const C4 = ['C1', 'C2', 'C3', 'C4'];
const C6 = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
const M3 = ['M1', 'M2', 'M3'];

const P1 = ({ zones = ['frais', 'fl', 'surgele', 'sec', 'frais', 'fl'], quais = ['4', '1', '6', '3'], controles = ['temperature', 'nombre', 'etat', 'dlc'], releves = ['accepter', 'prevenir', 'accepter'] } = {}) => [
  { id: 'zones', fiche: { liste: num('zone', zones) } },
  { id: 'quais', sujet: 'Les camions du matin', fiche: { liste: par('quai', C4, quais) } },
  { id: 'controles', sujet: 'Le camion arrive', fiche: { cases: { controles } } },
  { id: 'releves', sujet: 'Les températures', fiche: { choix: par('releve', ['R1', 'R2', 'R3'], releves) } },
];
const P2 = ({ heures = ['6', '6', '7', '6', '7', '7'], minutes = '67', retard = 'attendre' } = {}) => [
  { id: 'zones', fiche: { liste: par('zone', C6, ['surgele', 'frais', 'surgele', 'frais', 'frais', 'sec']) } },
  { id: 'creneaux', sujet: 'Les créneaux', fiche: { liste: par('heure', C6, heures) } },
  { id: 'duree', sujet: 'Le camion d’eau', fiche: { nb: { minutes }, choix: { tient: 'non' } } },
  { id: 'retard', sujet: 'Un retard', fiche: { choix: { retard } } },
];
const PT = (J) => [
  { id: 'zones', fiche: { choix: par('km', M3, J.zones) } },
  { id: 'cotation', sujet: 'Une livraison à chiffrer', fiche: { nb: J.cot } },
  { id: 'revient', sujet: 'Notre camion', fiche: { nb: J.rev } },
];
const PF = (J) => [
  { id: 'rapprochement', fiche: { choix: num('ligne', J.lignes) } },
  { id: 'montants', sujet: 'Le montant à payer', fiche: { nb: J.mont } },
  { id: 'echeance', sujet: 'La date de paiement', fiche: { liste: { echeance: J.ech } } },
  { id: 'fiche', sujet: 'Deux messages', fiche: { cases: { champs: J.champs }, choix: { rib: J.rib || 'appeler' } } },
];
const J3 = { zones: ['A', 'B', 'C'], cot: { transport: '552', froid: '82,80', annexes: '65', total: '699,80' }, rev: { revient: '216,40', prix: '259,68' } };
const J5 = [
  { uid: 'a', zones: ['A', 'B', 'C'], cot: { transport: '550', froid: '82,50', annexes: '65', total: '697,50' }, rev: { revient: '315,60', prix: '378,72' } },
  { uid: 'g', zones: ['A', 'C', 'B'], cot: { transport: '644', froid: '96,60', annexes: '80', total: '820,60' }, rev: { revient: '176,60', prix: '211,92' } },
  { uid: 'b', zones: ['B', 'A', 'C'], cot: { transport: '304', froid: '45,60', annexes: '25', total: '374,60' }, rev: { revient: '88,40', prix: '106,08' } },
];
const J4 = { lignes: ['conforme', 'quantite', 'prix'], mont: { ht: '902', tva: '49,61', ttc: '951,61' }, ech: '2026-11-19', champs: ['adresse', 'telephone'] };
const J6 = [
  { uid: 'a', lignes: ['conforme', 'prix', 'quantite'], mont: { ht: '1502', tva: '82,61', ttc: '1584,61' }, ech: '2026-12-10', champs: ['adresse'] },
  { uid: 'g', lignes: ['quantite', 'conforme', 'prix'], mont: { ht: '1914', tva: '105,27', ttc: '2019,27' }, ech: '2026-12-30', champs: ['telephone', 'contact'] },
  { uid: 'b', lignes: ['prix', 'conforme', 'quantite'], mont: { ht: '1535,90', tva: '84,47', ttc: '1620,37' }, ech: '2026-12-20', champs: ['adresse', 'telephone'] },
];

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-21.x : les six séances se chargent (2de : C1.3, OTM-C1.4, AGO-2.2 et AGO-1.3 ; chaque évaluation après un temps de travail) ; jalons + questions = 20 ; parcours chaîné hors évaluations ; entreprise n° 21 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/lidl-ent${s.pre}.js`);
      const Q = await import(`/contenus/questions/ENT-21.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret,
        A.meta.ouverture, A.meta.precedente, A.meta.parcours, A.meta.reinitialisable], total: C.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: Q.QUESTIONS.part || 0,
        ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 21) };
  }, SEANCES);
  egal(r.out.map((x) => x.m), [
    ['ENT-21.1', ['2de'], ['C1.3'], 'guidage', 20, undefined, 'ENT-21.1', true, 'prof', undefined, true, true],
    ['ENT-21.2', ['2de'], ['C1.3'], 'entrainement', 20, undefined, 'ENT-21.2', true, 'prof', 'lidl-bienvenue', true, undefined],
    ['ENT-21.3', ['2de'], ['OTM-C1.4'], 'guidage', 20, undefined, 'ENT-21.3', true, 'prof', 'lidl-planning', true, undefined],
    ['ENT-21.4', ['2de'], ['AGO-2.2', 'AGO-1.3'], 'guidage', 20, undefined, 'ENT-21.4', true, 'prof', 'lidl-transport', true, undefined],
    ['ENT-21.5', ['2de'], ['OTM-C1.4'], 'evaluation', 20, true, 'ENT-21.5', true, 'prof', undefined, undefined, undefined],
    ['ENT-21.6', ['2de'], ['AGO-2.2', 'AGO-1.3'], 'evaluation', 20, true, 'ENT-21.6', true, 'prof', undefined, undefined, undefined],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), Array(6).fill(20), 'jalons + questions');
  egal(r.out.map((x) => x.noter === 'function'), [false, false, false, false, true, true], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), Array(6).fill(true), 'au registre');
  egal([r.e.nom, r.e.logo], ['Lidl', './contenus/trames/logos/lidl.svg'], 'entreprise n° 21');
});

await v('ENT-21.x : les données — zones, planning des rendez-vous, durée, relevés, cotations, coûts de revient, factures, TVA, décades et échéances (valeurs à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/lidl-donnees.js');
    const F = [M.F214, ...M.TOUS_JEUX216];
    return {
      zones: M.P211.map((p) => M.PRODUITS[p].zone), camions: M.D212.map(M.zoneCamion), planning: M.planning(M.D212), duree: M.duree(26),
      releves: M.R211.map(M.releveJuste),
      cot: [M.L213, ...M.TOUS_JEUX215.map((J) => J.livraison)].map((L) => [M.cotation(L).total, M.revient(L), M.prixVente(L)]),
      fact: F.map((x) => [x.lignes.map(M.etatLigne), M.htCorrige(x), M.tvaDe(x), M.ttcDe(x), M.echeance(x), M.champsAJour(x)]),
      decades: ['2026-03-04', '2026-03-10', '2026-03-11', '2026-03-31', '2026-02-25'].map(M.finDecade), attente: [20, 30, 31, 90, 91].map(M.heuresAttente),
      km: [29, 30, 60, 61].map(M.zoneKm),
    };
  });
  egal(r.zones, ['frais', 'fl', 'surgele', 'sec', 'frais', 'fl'], 'zones ENT-21.1');
  egal(r.camions, ['surgele', 'frais', 'surgele', 'frais', 'frais', 'sec'], 'zones ENT-21.2');
  egal(r.planning, { C1: '6', C2: '6', C3: '7', C4: '6', C5: '7', C6: '7' }, 'planning');
  egal(r.duree, 67, 'durée');
  egal(r.releves, ['accepter', 'prevenir', 'accepter'], 'relevés');
  egal(r.cot, [[699.8, 216.4, 259.68], [697.5, 315.6, 378.72], [820.6, 176.6, 211.92], [374.6, 88.4, 106.08]], 'cotations');
  egal(r.fact, [
    [['conforme', 'quantite', 'prix'], 902, 49.61, 951.61, '2026-11-19', ['adresse', 'telephone']],
    [['conforme', 'prix', 'quantite'], 1502, 82.61, 1584.61, '2026-12-10', ['adresse']],
    [['quantite', 'conforme', 'prix'], 1914, 105.27, 2019.27, '2026-12-30', ['telephone', 'contact']],
    [['prix', 'conforme', 'quantite'], 1535.9, 84.47, 1620.37, '2026-12-20', ['adresse', 'telephone']]], 'factures');
  egal(r.decades, ['2026-03-10', '2026-03-10', '2026-03-20', '2026-03-31', '2026-02-28'], 'fins de décade');
  egal(r.attente, [0, 0, 1, 1, 2], 'heures d’attente entamées');
  egal(r.km, ['A', 'B', 'B', 'C'], 'zones de distance');
});

await v('ENT-21.x : les documents et les messages — mentions, phrases toutes différentes, les zones ne citent pas les produits, la facture ne dit pas l’écart ; les corrigés se chargent ; les graines tirent les trois jeux', async () => {
  const r = await pg.evaluate(async (L) => {
    const txt = (h) => { const e = document.createElement('div'); e.innerHTML = h; return e.textContent.replace(/\s+/g, ' '); };
    const doubles = [], sans = [], corr = [];
    for (const s of L) {
      const C = await import(`/contenus/lidl-ent${s.pre}.js`);
      for (const db of [{}, { tirage: { graine: 'a' } }, { tirage: { graine: 'b' } }]) {
        const d = C.VOLET.declencheurs.find((x) => x.id === 'compte');
        if (d) for (const l of d.semer('Léa', db).mails[0].phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`${s.n} ${l.id}`);
        for (const D of C.OPTIONS.documents) { const t = txt(typeof D.html === 'function' ? D.html(db) : D.html); if (!/Document pédagogique/.test(t)) sans.push(`${s.n} ${D.id}`); }
      }
      const K = await import(`/contenus/corriges/ENT-21.${s.n}.js`);
      corr.push([K.CORRIGE.code, K.CORRIGE.items.length > 0, K.corrigeEleve({ tirage: { graine: 'b' } }, 'b').items.length > 0]);
    }
    const C1 = await import('/contenus/lidl-ent211.js');
    const zones = txt(C1.OPTIONS.documents.find((d) => d.id === 'zones').html);
    const C4 = await import('/contenus/lidl-ent214.js');
    const fac = txt(C4.OPTIONS.documents.find((d) => d.id === 'facture').html({}));
    const M = await import('/contenus/lidl-donnees.js');
    const v5 = new Set(), v6 = new Set();
    for (let i = 0; i < 300; i++) { const db = { tirage: { graine: `eleve-${i}` } }; v5.add(M.jeu215(db).livraison.palettes); v6.add(M.jeu216(db).no); }
    return { doubles, sans, corr, zones, fac, v5: [...v5].sort((a, b) => a - b), v6: [...v6].sort() };
  }, SEANCES);
  egal(r.doubles, [], 'phrases en double');
  egal(r.sans, [], 'documents sans mention');
  egal(r.corr.map((x) => x[0]), SEANCES.map((s) => `ENT-21.${s.n}`), 'corrigés'); vrai(r.corr.every((x) => x[1] && x[2]), 'corrigé vide : ' + JSON.stringify(r.corr));
  vrai(!/Yaourts|Pommes|Glaces|Pâtes|Jambon|Salades/.test(r.zones), 'les zones citent un produit de la fiche : ' + r.zones);
  vrai(/FA-2026-1187/.test(r.fac) && !/écart|conforme|902/i.test(r.fac), 'la facture trahit l’écart ou le montant juste : ' + r.fac);
  egal(r.v5, [8, 10, 14], 'ENT-21.5 : 300 graines tirent les trois jeux');
  egal(r.v6, ['FA-30451', 'FA-5530', 'FA-8812'], 'ENT-21.6 : 300 graines tirent les trois jeux');
});

// ─────────────────────────────────────────────────────────── ENT-21.1 et 21.2 (C1.3)
await v('ENT-21.1 : inaction → 0/20 ; un message de Fatou ; parcours juste → 20/20 (le quai 5 accepté pour la laiterie) ; aucun message ne juge', async () => {
  await mont(S_['1'], { sansOuverture: true });
  const n0 = await noter(S.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  await mont(S_['1']);
  egal((await entrants()).length, 1, 'un seul message');
  await jouer(P1({ quais: ['5', '2', '6', '3'] }));
  const n = await noter(S.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  vrai(!(await entrants()).some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct|faux)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-21.1 : sabotages — les glaces en zone frais (−0,5), les surgelés au quai 1 (−1,25), le prix coché (−3), la laiterie à +7 °C déchargée (−1), compte rendu « déchargé » (−2)', async () => {
  await mont(S_['1']);
  await jouer(P1({ zones: ['frais', 'fl', 'frais', 'sec', 'frais', 'fl'], quais: ['4', '1', '1', '3'], controles: ['temperature', 'nombre', 'etat', 'dlc', 'prix'],
    releves: ['accepter', 'accepter', 'accepter'] }), { compte: { laiterie: 1 } });
  egal(ko(await detail()), ['zone-3', 'quai-3', 'controles', 'releve-2', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 12.25, 'note');
});

await v('ENT-21.2 : parcours juste → 20/20 ; sabotages — les heures demandées recopiées (−1,5), 52 minutes sans le contrôle (−2), les surgelés sur un quai sec (−1,5)', async () => {
  await mont(S_['2']);
  await jouer(P2());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['2']);
  await jouer(P2({ heures: ['6', '6', '6', '6', '6', '7'], minutes: '52', retard: 'sec' }));
  egal(ko(await detail()), ['heure-3', 'heure-5', 'minutes', 'retard'], 'jalons tombés');
  proche((await noter(S.act)).score, 15, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-21.3 et 21.4 (guidages OTM et AGOrA)
await v('ENT-21.3 : parcours juste → 20/20 ; sabotages — l’attente oubliée (annexes et total, −3), le coût de revient sur l’aller seul (−2)', async () => {
  await mont(S_['3']);
  await jouer(PT(J3));
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['3']);
  await jouer(PT({ ...J3, cot: { ...J3.cot, annexes: '25', total: '659,80' }, rev: { revient: '170,20', prix: '259,68' } }));
  egal(ko(await detail()), ['annexes', 'total', 'revient'], 'jalons tombés');
  proche((await noter(S.act)).score, 15, 'note');
});

await v('ENT-21.4 : parcours juste → 20/20 ; sabotages — la facture payée telle quelle (−4,5), 30 jours après la livraison (−2), le RIB changé (−1,5), compte rendu « RIB changé » (−3,5)', async () => {
  await mont(S_['4']);
  await jouer(PF(J4));
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['4']);
  await jouer(PF({ ...J4, mont: { ht: '937', tva: '51,54', ttc: '988,54' }, ech: '2026-11-13', rib: 'changer' }), { compte: { rib: 1 } });
  egal(ko(await detail()), ['ht', 'tva', 'ttc', 'echeance', 'rib', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 8.5, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-21.5 et 21.6 (copies rendues)
await v('ENT-21.5 : « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste → 20/20 dans chacun des trois jeux', async () => {
  for (const J of J5) {
    await mont(S_['5'], { uid: J.uid });
    let n = await noter(S.act);
    proche(n.score, 3, `jeu ${J.uid} : ouverture seule ` + JSON.stringify(n.detail));
    vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
    await jouer(PT(J));
    n = await noter(S.act);
    proche(n.score, 20, `jeu ${J.uid} : ` + JSON.stringify(n.detail));
  }
});

await v('ENT-21.5 : jeu « g » — sabotages : le supplément froid à 15 € (−1,5), le prix de vente sans la marge (−2,5)', async () => {
  const J = J5[1];
  await mont(S_['5'], { uid: J.uid });
  await jouer(PT({ ...J, cot: { ...J.cot, froid: '15' }, rev: { ...J.rev, prix: '176,60' } }));
  egal(ko(await detail()), ['froid', 'prix'], 'jalons tombés');
  proche((await noter(S.act)).score, 16, 'note');
});

await v('ENT-21.6 : « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste → 20/20 dans chacun des trois jeux', async () => {
  for (const J of J6) {
    await mont(S_['6'], { uid: J.uid });
    let n = await noter(S.act);
    proche(n.score, 3, `jeu ${J.uid} : ouverture seule ` + JSON.stringify(n.detail));
    vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
    await jouer(PF(J));
    n = await noter(S.act);
    proche(n.score, 20, `jeu ${J.uid} : ` + JSON.stringify(n.detail));
  }
});

await v('ENT-21.6 : jeu « g » — sabotages : le RIB coché sur la fiche (−2), 30 jours après la livraison (−2,5)', async () => {
  const J = J6[1];
  await mont(S_['6'], { uid: J.uid });
  await jouer(PF({ ...J, champs: [...J.champs, 'rib'], ech: '2026-12-25' }));
  egal(ko(await detail()), ['echeance', 'champs'], 'jalons tombés');
  proche((await noter(S.act)).score, 15.5, 'note');
});

}
