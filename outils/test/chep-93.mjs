// Suite de tests de Prepalog — bloc `chep-93` : ENT-9.3 CHEP, « le relevé contesté » (brief `docs/briefs/ENT-9.3-chep-releve-conteste.md` §8).
// Créé le 18/10/2026. Aides communes : `outils/test/chep/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (le code les calcule, le test les écrit) :
// - témoin ① (A3, quantité déclarée fausse, vers Halles d'Artois) : S_rel 280, k 3, d 12, r 26 (x 14), e 4 → S_corrige 280 + 3 − 14 = 269,
//   S_parc 269 + 4 = 273 ; bordereaux justes 19 et 21, émission 160 → solde au 15/01 = 280 − 160 + 19 + 12 + 21 + 75 = 247 ; tri : 72 CHEP
//   dont 6 à réparer, 3 LPR ; Frais du Nord 125 ;
// - témoin ② (A2, transfert absent, vers Frais du Nord) : S_rel 260, k 4, T2 24, e 5 → S_corrige 260 + 4 − 24 = 240, S_parc 245 ; bordereaux
//   justes 22 et 18, émission 140 → solde au 15/01 = 260 − 140 + 22 + 18 + 75 = 235 ; tri : 71 CHEP dont 7 à réparer, 4 LPR ; Frais du Nord 118.
// L'ordre des deux témoins : Bordereau 1 = b1 (Hainaut Primeurs), Bordereau 2 = sa pièce, Bordereau 3 = b2 (MarchéLys).
// Poids (Cowork, 17/10/2026) : repérer 7 (2, 2, 1, 2), mettre à jour 6 (2, 2, 2), ramasse 1, répondre 3 (1, 1, 1), questions 3.

import { ouvrirCHEP } from './chep/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {
const F = await ouvrirCHEP({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, menu, bandeau, entrants, clic, erreursF, proche } = F;
await pg.emulateMedia({ reducedMotion: 'reduce' });

const ID = 'chep-releve-conteste';
const ACT = '/activites/chep-releve-conteste.js';
const REP_OUV = { p1: 'emetteur', p2: 'reste', p3: 'haut', p4: 'paie', d1: 'ternois', d2: 'accord', d3: 'ternois', d4: 'suivre' };
const ORDRE = 1;   // ORDRE_TEMOIN des données (vérifié par le cas « données »)
const V1 = { sRel: 280, k: 3, e: 4, rep: 6, t2: 23, d: 12, x: 14, b1: 19, b2: 21, em: 160, f: 125, ordre: ORDRE };
const V2 = { sRel: 260, k: 4, e: 5, rep: 7, t2: 24, d: 10, x: 15, b1: 22, b2: 18, em: 140, f: 118, ordre: ORDRE };
const tirage = (piece, valeurs, o = {}) => ({ graine: `temoin-${piece}|${ID}`, pieces: { client: [piece] },
  difficultes: { client: { [piece]: 'moyen', ...(o.bonus ? { [o.bonus]: 'moyen' } : {}) } },
  ...(o.bonus ? { bonus: { client: [o.bonus] } } : {}), valeurs: { ...valeurs, ...(o.valeurs || {}) }, essai: 0, secours: false, at: 1 });
const T1 = (o) => tirage('a3-halles-artois', V1, o);
const T2 = (o) => tirage('a2-frais-nord', V2, o);
const monter = (o = {}) => F.monter({ activite: ACT, id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });

const BONNES = { 'compter-retour': 'compter', 'qui-declare': 'ternois', 'ecart-restant': 'verifier', confiance: 'confiance' };
const posees = {};
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un ; garde l'énoncé de chaque question posée. La question libre reçoit une phrase.
async function qrep(choix = BONNES) {
  for (let i = 0; i < 6; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    posees[id] = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.innerText);
    if (await present(`[data-q-libre="${id}"]`)) await pg.fill(`${Z} [data-q-libre="${id}"]`, 'Parce qu’un compte doit être juste dans les deux sens.');
    else await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
const saisir = async (sel, t) => { await pg.fill(`${Z} ${sel}`, String(t)); await pg.dispatchEvent(`${Z} ${sel}`, 'change'); await pause(30); await qrep(); };
const choisir = async (sel, val) => { await pg.selectOption(`${Z} ${sel}`, val); await pause(30); await qrep(); };
const cocher = async (nom, val) => { await pg.check(`${Z} input[name="fi-${nom}"][value="${val}"]`); await pause(30); await qrep(); };
async function envoyer() {
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause(60);
  if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); }
  await qrep();
}
// L'enquête, par rôle : { retour: ['credit', 'ajouter', 3, 'chep'], … }, puis l'inventaire et Frais du Nord. `envoi: false` : sans envoyer.
async function enqueter(D, { inventaire = 'europe', frais = 'tournee', envoi = true } = {}) {
  await aller('fiche');
  for (const [role, [type, corr, qte, qui]] of Object.entries(D)) {
    if (type != null) await choisir(`#fi-type-${role}`, type);
    if (corr != null) await choisir(`#fi-corr-${role}`, corr);
    if (qte != null) await saisir(`#fi-qte-${role}`, qte);
    if (qui != null) await choisir(`#fi-qui-${role}`, qui);
  }
  if (inventaire) await cocher('inventaire', inventaire);
  if (frais) await cocher('frais', frais);
  if (envoi) await envoyer();
}
// Le relevé corrigé : les cases { B3: '3', C3: '0', …, D5: '=…', D7: '=…' }.
async function corriger(cases, { envoi = true } = {}) {
  await aller('fiche:corrige');
  for (const [ref, t] of Object.entries(cases)) await saisir(`[data-gr="${ref}"]`, t);
  if (envoi) await envoyer();
}
// La réponse à Hélène : les libellés choisis par ligne.
async function repondre(lignes) {
  await aller('mail');
  const m = (await base()).mails.find((x) => x.folder === 'in' && x.phrases && x.phrases.id === 'reponse-helene-2');
  vrai(!!m, 'le message d’Hélène à répondre est arrivé');
  await clic(`[data-mail="${m.id}"]`);
  await clic('[data-repondre]');
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t }); await pause(); await qrep(); }
  await clic('#formPhr button[type="submit"]');
  if (await present('[data-confirme-oui]')) await clic('[data-confirme-oui]');
  await qrep();
}
const AUCUNE = ['juste', 'aucune', 0, 'personne'];
const ENQ1 = { retour: ['credit', 'ajouter', 3, 'chep'], b1: AUCUNE, a3: ['quantite', 'retirer', 14, 'ternois'], b2: AUCUNE };
const ENQ2 = { retour: ['credit', 'ajouter', 4, 'chep'], b1: AUCUNE, a2: ['absent', 'retirer', 24, 'ternois'], b2: AUCUNE };
// Le relevé corrigé juste des témoins : ligne 3 le retour (+), ligne 4 sa pièce (−), D5 le solde corrigé, D6 l'inventaire, D7 l'écart.
const CORR = (k, q) => ({ B3: k, C3: 0, B4: 0, C4: q, D5: '=D2+SOMME(B3:B4)-SOMME(C3:C4)', D7: '=D6-D5' });
const CORR1 = CORR(3, 14), CORR2 = CORR(4, 24);
const CHEP_JUSTE = (k) => `En reprenant votre retour du 19/01, nous avons vu que nous vous avions crédité 75 palettes au lieu de ${75 - k} : nous corrigeons, et votre solde augmente de ${k}.`;
const NOUS_RETIRONS = (k) => `Nous retirons ${k} palettes de votre compte : elles ont été mal comptées.`;
const DEMANDE_A3 = 'Il vous reste à corriger sur le portail la quantité du transfert du 20/01 : 26 palettes, et non 12.';
const DEMANDE_A2 = 'Il vous reste à déclarer sur le portail le transfert du 21/01 vers Frais du Nord (24 palettes).';
const INVENTAIRE = (e) => `L’écart restant vient de ${e} palettes Europe comptées dans votre inventaire : elles ne sont pas sur votre compte CHEP.`;
const REP1 = { chep: CHEP_JUSTE(3), demande: DEMANDE_A3, inventaire: INVENTAIRE(4) };
const REP2 = { chep: CHEP_JUSTE(4), demande: DEMANDE_A2, inventaire: INVENTAIRE(5) };
const JALONS = ['retour', 'client', 'justes', 'inventaire', 'qui', 'colonnes', 'solde', 'frais', 'rep-chep', 'rep-demande', 'rep-inventaire'];
const QUESTIONS_NOTEES = ['question:compter-retour', 'question:qui-declare', 'question:ecart-restant'];
const jalons = (n) => Object.fromEntries(JALONS.map((j) => [j, n.detail[j]]));
const tout = (etat) => Object.fromEntries(JALONS.map((j) => [j, etat]));

// ─────────────────────────────────────────────────────────── le registre et le meta
await v('ENT-9.3 : au registre — entreprise n° 9 CHEP, meta (1re, C2.5, entraînement, barème 20, parcours après ENT-9.2, correction, confirmé prévu, questions), 11 jalons pondérés = 17 + 3 de questions', async () => {
  const r = await pg.evaluate(async () => {
    const I = await import('/activites/index.js');
    const A = await import('/activites/chep-releve-conteste.js');
    const S = await import('/contenus/chep-ent93.js');
    const Q = await import('/contenus/questions/ENT-9.3.js');
    const m = A.meta;
    return { e: I.ENTREPRISES.find((x) => x.n === 9),
      meta: [m.code, m.niveaux, m.competences, m.temps, m.bareme, m.parcours, m.precedente, m.correction, m.niveauxPrevus, m.questions, m.rubrique, m.immersif, m.portee, m.corrige, m.ouverture, m.pret, m.reinitialisable],
      poids: S.ETAPES.filter((x) => !x.bonus).map((x) => [x.id, x.poids, x.ecran, x.groupe]), bonus: S.ETAPES.filter((x) => x.bonus).map((x) => x.id),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type === 'fil' && !q.reflexion && q.actif !== false).map((q) => [q.id, q.poids]),
      options: Object.keys(S.OPTIONS).sort() };
  });
  egal(r.e.nom, 'CHEP', 'entreprise 9');
  egal(r.meta, ['ENT-9.3', ['1re'], ['C2.5'], 'entrainement', 20, true, 'chep-ramasse-retours', true, ['confirme'], 'ENT-9.3', 'simulog', true, 'eleve', './contenus/corriges/ENT-9.3.js', 'prof', true, undefined], 'meta');
  egal(r.poids.map(([id, p]) => `${id}:${p}`).join(' '), 'retour:2 client:2 justes:1 inventaire:2 qui:2 colonnes:2 solde:2 frais:1 rep-chep:1 rep-demande:1 rep-inventaire:1', 'poids');
  egal(r.poids.reduce((s, [, p]) => s + p, 0) + r.part, 20, 'somme = 20');
  vrai(r.poids.every(([, , ec]) => /^(fiche:(enquete|corrige)|phrases:reponse-helene-2)$/.test(ec)), 'chaque jalon a un écran nommé : ' + r.poids.map((x) => x[2]).join(' '));
  egal([...new Set(r.poids.map((x) => x[3]))].length, 4, 'quatre groupes');
  egal([r.bonus, r.notees], [['bonus-type', 'bonus-qte', 'bonus-qui'], [['compter-retour', 1], ['qui-declare', 1], ['ecart-restant', 1]]], 'bonus et questions notées');
  vrai(!r.options.includes('suite') && !r.options.includes('reinitialisable'), 'ni barre « Étape suivante » ni réinitialisation : ' + r.options.join(', '));
});

// ─────────────────────────────────────────────────────────── les données (valeurs écrites à la main)
await v('ENT-9.3 : données — les deux témoins (269 / 273 et 240 / 245), le solde au 15/01 à rebours (247, 235), les documents (tri, visa en italique, inventaire), équité', async () => {
  const r = await pg.evaluate(async ({ V1, V2 }) => {
    const D = await import('/contenus/chep-ent93-donnees.js');
    const S = await import('/contenus/chep-ent93.js');
    const Fi = await import('/core/types/fiche.js');
    const j = (client, valeurs) => { const J = D.jeuDe({ client, valeurs });
      return { cadres: J.cadres.map((c) => `${c.role}:${c.attendu.type}:${c.attendu.corr}:${c.attendu.qte}:${c.attendu.qui}`), soldes: [J.sRel, J.sCorrige, J.sParc, J.sAvant, J.ecart],
        mvts: J.mouvements.map((m) => `${m.genre}:${m.entree || -m.sortie}`), ecarts: D.ecartsEquite(J) }; };
    const db = (piece, valeurs) => ({ tirages: { [D.ID]: { graine: 'x', pieces: { client: [piece] }, valeurs } } });
    const html = (id, b) => { const d = S.DOCUMENTS.find((x) => x.id === id); return typeof d.html === 'function' ? d.html(b) : d.html; };
    const b1 = db('a3-halles-artois', V1), b2 = db('a2-frais-nord', V2);
    const lus = ['6 091', '12', '2,5', ' 7 ', 'x', ''].map((s) => [D.lireNombre(s), Fi.lireNombre(s)]);
    return { ordre: D.ORDRE_TEMOIN, t1: j('a3-halles-artois', V1), t2: j('a2-frais-nord', V2),
      releve1: html('releve', b1), releve2: html('releve', b2), tri1: html('rapport-tri', b1), retour: html('bon-retour', b1), inv1: html('inventaire', b1),
      bl2: html('bl-2', b1), bl2b: html('bl-2', b2), lus };
  }, { V1, V2 });
  egal(r.ordre, ORDRE, 'ordre du témoin');
  egal(r.t1.cadres, ['retour:credit:ajouter:3:chep', 'b1:juste:aucune:0:personne', 'a3:quantite:retirer:14:ternois', 'b2:juste:aucune:0:personne'], 'témoin ① : cadres');
  egal([r.t1.soldes, r.t1.ecarts], [[280, 269, 273, 247, 4], []], 'témoin ① : soldes');
  egal(r.t1.mvts, ['emission:160', 'transfert:-19', 'retour:-75', 'transfert:-12', 'transfert:-21'], 'témoin ① : notre relevé (A3 déclaré 12)');
  egal(r.t2.cadres, ['retour:credit:ajouter:4:chep', 'b1:juste:aucune:0:personne', 'a2:absent:retirer:24:ternois', 'b2:juste:aucune:0:personne'], 'témoin ② : cadres');
  egal([r.t2.soldes, r.t2.ecarts], [[260, 240, 245, 235, 5], []], 'témoin ② : soldes');
  egal(r.t2.mvts, ['emission:140', 'transfert:-22', 'retour:-75', 'transfert:-18'], 'témoin ② : notre relevé (A2 absent)');
  vrai(/247 palettes CHEP/.test(r.releve1) && /280 palettes CHEP/.test(r.releve1) && /Halles d’Artois/.test(r.releve1), 'relevé ① : 15/01 et 22/01');
  vrai(/235 palettes CHEP/.test(r.releve2) && !/Frais du Nord/.test(r.releve2), 'relevé ② : le transfert vers Frais du Nord est absent');
  vrai(/<td class="ch-n">72<\/td><td>dont 6 à réparer/.test(r.tri1) && /LPR écartées<\/th><td class="ch-n">3</.test(r.tri1) && /Situation construite/.test(r.tri1), 'rapport de tri ① : 72 CHEP dont 6 à réparer, 3 LPR, situation construite');
  vrai(/class="ch93-main" data-visa>5 piles × 15 = 75 — OK, G\.V\.</.test(r.retour) && !/<img/.test(r.retour), 'bon de retour : le visa de Grégory, du texte (jamais une image)');
  vrai(/273 palettes/.test(r.inv1), 'inventaire ① : 273');
  vrai(/BL-ET-27-0338/.test(r.bl2) && /26 palettes <b>CHEP<\/b>/.test(r.bl2), 'bordereau 2 du témoin ① : 26 palettes CHEP vers Halles d’Artois');
  vrai(/BL-ET-27-0341/.test(r.bl2b) && /24 palettes <b>CHEP<\/b>/.test(r.bl2b), 'bordereau 2 du témoin ② : 24 palettes CHEP vers Frais du Nord');
  egal(r.lus.map(([a, b]) => Object.is(a, b) || (Number.isNaN(a) && Number.isNaN(b))), [true, true, true, true, true, true], 'lireNombre lit comme la fiche');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran, pour chaque témoin
for (const [nom, T, ENQ, CORR_, REP, sRel, sParc, piece] of [['①', T1, ENQ1, CORR1, REP1, 280, 273, 'a3'], ['②', T2, ENQ2, CORR2, REP2, 260, 245, 'a2']]) {
  await v(`ENT-9.3 : parcours juste du témoin ${nom} — deux messages à l’ouverture, relevé corrigé ouvert après l’enquête, questions sur SA pièce et SON écart, 20 / 20, trois pastilles, Hélène et Sandrine neutres`, async () => {
    await monter({ uid: `ch93-${piece}`, db: { tirages: { [ID]: T() } } });
    const E0 = await entrants();
    egal(E0.map((m) => [m.from, m.subject, (m.pieces || []).join(','), m.ouvreFiche || null]),
      [['Hélène Caron', 'Votre relevé du 22/01', 'inventaire,bl-1,bl-2,bl-3', null], ['Sandrine Delattre', 'Hélène conteste son relevé', 'releve,bon-retour,rapport-tri,conditions', 'enquete']], 'messages à l’ouverture');
    vrai(new RegExp(`indique ${sRel} palettes CHEP.*en compte ${sParc}`, 's').test(E0[0].text), 'Hélène cite S_rel et S_parc : ' + E0[0].text);
    vrai(!(await menu()).includes('fiche:corrige'), 'le relevé corrigé est fermé avant l’enquête : ' + (await menu()).join(', '));
    await aller('fiche');
    egal(await pg.$$eval(`${Z} .ent-cadre-t`, (L) => L.map((h) => h.textContent)),
      ['Bon de retour RET-27-00512 (mar. 19/01)', 'Bordereau 1 — BL-ET-27-0335', `Bordereau 2 — ${piece === 'a3' ? 'BL-ET-27-0338' : 'BL-ET-27-0341'}`, 'Bordereau 3 — BL-ET-27-0344', 'Son inventaire', 'La demande de Frais du Nord'], 'six cadres');
    egal(await pg.$$eval(`${Z} .ent-encadre, .ent-suite`, (L) => L.length), 0, 'ni encadré ni barre « Étape suivante »');
    await enqueter(ENQ);
    vrai((await menu()).includes('fiche:corrige'), 'le relevé corrigé s’ouvre après l’enquête');
    const sandrine = (await entrants()).find((m) => m.subject === 'Son solde');
    vrai(sandrine && sandrine.ouvreFiche === 'corrige' && /Refais son solde avec tes corrections/.test(sandrine.text), 'Sandrine passe au solde, neutre');
    await aller('fiche:corrige');
    egal(await pg.$$eval(`${Z} [data-gr]`, (L) => L.map((x) => x.dataset.gr)), ['B3', 'C3', 'B4', 'C4', 'D5', 'D7'], 'deux lignes de correction, le solde en D5, l’écart en D7');
    await corriger(CORR_);
    await repondre(REP);
    const n = await note();
    egal(jalons(n), tout('ok'), 'jalons');
    egal(QUESTIONS_NOTEES.map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
    proche(n.score, 20, 'note');
    const q = (await base()).questions[ID];
    vrai(new RegExp(piece === 'a3' ? 'corrige elle-même son transfert du 20/01 vers Halles d’Artois' : 'déclare elle-même son transfert du 21/01 vers Frais du Nord').test(q['qui-declare'].texte.enonce), 'question n° 2 sur SA pièce : ' + q['qui-declare'].texte.enonce);
    vrai(new RegExp(`Il te reste ${sParc - (sRel + (piece === 'a3' ? 3 - 14 : 4 - 24))} palettes d’écart`).test(q['ecart-restant'].texte.enonce), 'question n° 3 sur SON écart : ' + q['ecart-restant'].texte.enonce);
    await aller('accueil');
    egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 3, 'trois pastilles faites');
    const E = await entrants();
    const textes = E.filter((m) => /Hélène|Sandrine/.test(m.from)).map((m) => m.text).join(' | ');
    egal(/juste|faux|erreur|bravo|exact|bien joué/i.test(textes), false, 'messages neutres : ' + textes);
    egal(E.map((m) => m.subject).slice(2), ['Son solde', 'Alors ?', 'Merci'], 'les messages dans l’ordre');
    vrai(/Merci pour votre franchise\. Je fais le nécessaire\./.test(E[E.length - 1].text), 'la fin d’Hélène');
    const lignes = E.find((m) => m.phrases).phrases.lignes;
    egal(lignes.filter((l) => l.texte != null).map((l) => l.texte), ['Bonjour Madame Caron,', 'Je reste à votre disposition. Bien cordialement, Lea — CHEP France, Templemars'], 'lignes imposées');
    egal(erreursF, [], 'aucune erreur JS');
  });
}

await v('ENT-9.3 : la réponse d’un voisin — le témoin ② qui recopie l’enquête du témoin ① (case par case) n’a pas 20 (retour et document client faux) ; son relevé corrigé, cohérent avec SON enquête, reste juste', async () => {
  await monter({ uid: 'ch93-copie', db: { tirages: { [ID]: T2() } } });
  await enqueter({ retour: ENQ1.retour, b1: AUCUNE, a2: ENQ1.a3, b2: AUCUNE });
  await corriger(CORR1);
  await repondre(REP2);
  const n = await note();
  egal(jalons(n), { ...tout('ok'), retour: 'ko', client: 'ko' }, 'jalons');
  vrai(n.score < 20, `note ${n.score}`);
});

// ─────────────────────────────────────────────────────────── inaction, fiche incomplète
await v('ENT-9.3 : inaction 0 — enquête vide refusée (« Il manque »), travail gardé ; « aucune » et 0 sont des réponses ; relevé corrigé incomplet refusé', async () => {
  await monter({ uid: 'ch93-vide', db: { tirages: { [ID]: T1() } } });
  const n0 = await note();
  egal(n0 ? n0.score : 0, 0, 'inaction : note');
  await aller('fiche');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  const m = await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent);
  vrai(/Il manque/.test(m) && /ce que dit le relevé du bon de retour/.test(m) && /qui corrige le bordereau 3/.test(m) && /ce que tu proposes pour Frais du Nord/.test(m), 'enquête vide refusée : ' + m);
  await enqueter({ ...ENQ1, b2: [null, null, null, null] }, { envoi: false });
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  const m2 = await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent);
  vrai(/du bordereau 3/.test(m2) && !/bon de retour/.test(m2), 'enquête à moitié refusée : ' + m2);
  const db = await base();
  egal([db.fiches.enquete.envoye, db.fiches.enquete.valeurs['qte-a3']], [undefined, '14'], 'pas envoyée, travail gardé');
  await enqueter({ b2: AUCUNE }, { inventaire: null, frais: null });
  vrai(!!(await base()).fiches.enquete.envoye, '« aucune » et 0 sont des réponses : l’enquête part');
  await corriger({ B3: 3 }, { envoi: false });
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  const m3 = await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent);
  vrai(/des cases du relevé corrigé \(5\)/.test(m3), 'relevé corrigé incomplet refusé (5 cases vides) : ' + m3);
  const n = await note();
  egal(['colonnes', 'solde', 'rep-chep'].map((j) => n.detail[j]), ['attente', 'attente', 'attente'], 'relevé corrigé et réponse en attente');
});

// ─────────────────────────────────────────────────────────── les pièges (témoin ①)
await v('ENT-9.3 : pièges — le retour « enregistré et juste » (1 ✗), « CHEP » partout (5 ✗), « palettes perdues » (4 et 11 ✗), un camion complet (8 ✗), « votre retour était juste » (9 ✗) ; chaque piège ne fait tomber que son jalon', async () => {
  await monter({ uid: 'ch93-pieges', db: { tirages: { [ID]: T1() } } });
  await enqueter({ retour: ['juste', 'aucune', 0, 'chep'], b1: ['juste', 'aucune', 0, 'chep'], a3: ['quantite', 'retirer', 14, 'chep'], b2: ['juste', 'aucune', 0, 'chep'] },
    { inventaire: 'perdues', frais: 'complet' });
  // Son relevé corrigé n'a qu'une ligne (A3) : cohérent avec SON enquête.
  await corriger({ B3: 0, C3: 14, D4: '=D2+B3-C3', D6: '=D5-D4' });
  await repondre({ chep: 'Votre retour du 19/01 était juste.', demande: DEMANDE_A3, inventaire: 'L’écart restant, ce sont des palettes perdues : nous les retirons.' });
  const n = await note();
  egal(jalons(n), { ...tout('ok'), retour: 'ko', qui: 'ko', inventaire: 'ko', frais: 'ko', 'rep-chep': 'ko', 'rep-inventaire': 'ko' }, 'jalons');
  proche(n.score, 20 - 2 - 2 - 2 - 1 - 1 - 1, 'note');
  egal(await bandeau().then((B) => B.filter(([, e]) => e === 'ko').map(([j]) => j)), ['retour', 'qui', 'frais', 'rep-chep'], 'bandeau par groupe : ①, ②, ③ et ④ faux (nommés par leur premier jalon)');
});

await v('ENT-9.3 : « une erreur ne se paie qu’une fois » — k RETIRÉ au lieu d’ajouté (1 ✗), relevé corrigé cohérent avec SON enquête (6 et 7 ✓) ; « nous retirons » dans la réponse (9 ✗)', async () => {
  await monter({ uid: 'ch93-une-fois', db: { tirages: { [ID]: T1() } } });
  await enqueter({ ...ENQ1, retour: ['credit', 'retirer', 3, 'chep'] });
  await aller('fiche:corrige');
  vrai(/RET-27-00512 : retirer 3/.test(await pg.textContent(`${Z} .ent-fiche`)), 'la ligne reprend SA correction, sans corriger');
  // 280 − 3 − 14 = 263 ; écart 273 − 263 = 10.
  await corriger({ B3: 0, C3: 3, B4: 0, C4: 14, D5: '=D2+SOMME(B3:B4)-SOMME(C3:C4)', D7: '=D6-D5' });
  await repondre({ ...REP1, chep: NOUS_RETIRONS(3) });
  const n = await note();
  egal(jalons(n), { ...tout('ok'), retour: 'ko', 'rep-chep': 'ko' }, 'jalons');
  vrai(/Il te reste 10 palettes d’écart/.test((await base()).questions[ID]['ecart-restant'].texte.enonce), 'question n° 3 sur SON écart (10)');
  // Le solde tapé à la main, ou S_rel oublié : 7 ✗.
  await monter({ uid: 'ch93-main', db: { tirages: { [ID]: T1() } } });
  await enqueter(ENQ1);
  await corriger({ ...CORR1, D5: '=SOMME(B3:B4)-SOMME(C3:C4)' });
  const n2 = await note();
  egal(['colonnes', 'solde'].map((j) => n2.detail[j]), ['ok', 'ko'], 'S_rel oublié : 7 faux');
  await monter({ uid: 'ch93-inverse', db: { tirages: { [ID]: T1() } } });
  await enqueter(ENQ1);
  await corriger({ ...CORR1, B3: 0, C3: 3 });
  const n3 = await note();
  egal(['colonnes', 'solde'].map((j) => n3.detail[j]), ['ko', 'ok'], 'ajout dans la colonne des retraits : 6 faux, 7 cohérent avec ses cases');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-9.3 : tirage — 200 élèves : A2 / A3 entre 40 et 60 %, zéro secours, zéro écart d’équité (S_rel > S_parc, aucune égalité), ordres variés ; confirmé → l’autre pièce en plus, en dernier', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/chep-ent93-donnees.js');
    const out = { a2: 0, secours: 0, ecarts: [], ordres: new Set(), sRel: new Set(), plus: 0 };
    for (let i = 0; i < 200; i++) {
      const g = `el-${i}|${D.ID}`;
      const t = D.TIRAGE.tirer(g);
      if (t.secours) out.secours++;
      const J = D.jeuEleve({ tirages: { [D.ID]: { graine: g, ...t } } });
      if (J.role === 'a2') out.a2++;
      const e = D.ecartsEquite(J);
      if (e.length) out.ecarts.push(`${i}: ${e.join(' ; ')}`);
      if (!(J.sRel > J.sParc)) out.ecarts.push(`${i}: S_rel ${J.sRel} ≤ S_parc ${J.sParc}`);
      const V = J.valeurs, q = [V.k, V.e, V.t2, V.d, V.x, V.d + V.x, V.b1, V.b2, 75, V.em];
      if (new Set(q).size !== q.length) out.ecarts.push(`${i}: égalité ${q.join(',')}`);
      if (J.cadres.length !== 4) out.ecarts.push(`${i}: ${J.cadres.length} cadres`);
      out.ordres.add(J.bordereaux.map((b) => b.role).join());
      out.sRel.add(J.sRel);
    }
    const tc = D.TIRAGE.tirer(`el-conf|${D.ID}`, { confirme: true });
    const Jc = D.jeuEleve({ tirages: { [D.ID]: { graine: 'c', ...tc } } });
    return { ...out, ordres: out.ordres.size, sRel: out.sRel.size,
      conf: [Jc.cadres.length, Jc.bordereaux[3].role !== Jc.role && ['a2', 'a3'].includes(Jc.bordereaux[3].role), Jc.sCorrige === Jc.sRel + Jc.valeurs.k - Jc.valeurs.t2 - Jc.valeurs.x, tc.secours, D.ecartsEquite(Jc)] };
  });
  const pct = r.a2 / 2;
  vrai(pct >= 40 && pct <= 60, `A2 ${pct} %`);
  egal([r.secours, r.ecarts], [0, []], 'secours, écarts');
  vrai(r.ordres >= 10 && r.sRel >= 8, `ordres ${r.ordres}, S_rel ${r.sRel}`);
  egal(r.conf, [5, true, true, false, []], 'confirmé : les deux pièces, la seconde en bordereau 4 ; solde corrigé des deux');
});

await v('ENT-9.3 : confirmé à l’écran — sept cadres, la seconde pièce jugée en bonus (ce qu’elle est, sa correction, qui) ; standard → bonus `null`', async () => {
  await monter({ uid: 'ch93-conf', aisance: 'confirme', db: { tirages: { [ID]: T1({ bonus: 'a2-frais-nord' }) } } });
  await aller('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((b) => b.textContent.trim())),
    ['Notre relevé', 'Bon de retour', 'Rapport de tri', 'Bordereau 1', 'Bordereau 2', 'Bordereau 3', 'Bordereau 4', 'Son inventaire', 'Conditions de location'], 'neuf onglets');
  egal(await pg.$$eval(`${Z} select[id^="fi-type-"]`, (L) => L.map((s) => s.id)), ['fi-type-retour', 'fi-type-b1', 'fi-type-a3', 'fi-type-b2', 'fi-type-a2'], 'cinq cadres de documents dans son ordre');
  egal(await pg.$$eval(`${Z} .ent-cadre`, (L) => L.length), 7, 'sept cadres');
  await enqueter({ ...ENQ1, a2: ['absent', 'retirer', 20, 'ternois'] });
  const n = await note();
  const et = n.detail.bonus && n.detail.bonus.etats;
  egal([et && et['bonus-type'], et && et['bonus-qte'], et && et['bonus-qui'], n.detail.client], ['ok', 'ko', 'ok', 'ok'], 'bonus jugés (detail.bonus.etats), le socle inchangé');
  const std = await pg.evaluate(async () => { const S = await import('/contenus/chep-ent93.js'); const db = JSON.parse(JSON.stringify(window.__f.db)); delete db.aisance;
    delete db.tirages['chep-releve-conteste'].bonus; return S.ETAPES.filter((e) => e.bonus).map((e) => e.verifier(db)); });
  egal(std, [null, null, null], 'standard : bonus null');
  // La réponse d'un confirmé : les deux actions ensemble (aucun piège n'est une action qu'il doit faire).
  await corriger({ B3: 3, C3: 0, B4: 0, C4: 14, B5: 0, C5: 20, D6: '=D2+SOMME(B3:B5)-SOMME(C3:C5)', D8: '=D7-D6' });
  const m = (await entrants()).find((x) => x.phrases);
  egal(m.phrases.lignes.find((l) => l.id === 'demande').choix[0],
    'Il vous reste à déclarer sur le portail le transfert du 21/01 vers Frais du Nord (23 palettes) ; et à corriger sur le portail la quantité du transfert du 20/01 : 26 palettes, et non 12.', 'demande du confirmé');
});

await v('ENT-9.3 : accompagné — une ligne d’aide sous chaque cadre (« Compare la quantité du bordereau et celle du relevé ») ; le standard ne les a pas', async () => {
  await monter({ uid: 'ch93-acc', aisance: 'accompagne', db: { tirages: { [ID]: T1() } } });
  await aller('fiche');
  const aides = await pg.$$eval(`${Z} .ent-cadre > p.note`, (L) => L.map((p) => p.textContent));
  egal(aides.length, 6, 'six aides (accompagné) : ' + aides.join(' | '));
  egal(aides.filter((t) => t === 'Compare la quantité du bordereau et celle du relevé.').length, 3, 'une par bordereau');
  await monter({ uid: 'ch93-std', db: { tirages: { [ID]: T1() } } });
  await aller('fiche');
  egal(await pg.$$eval(`${Z} .ent-cadre > p.note`, (L) => L.length), 0, 'aucune aide (standard)');
});

// ─────────────────────────────────────────────────────────── « Avant de commencer »
await v('ENT-9.3 : « Avant de commencer » — 4 questions tirées (2 préparation, 2 droit), menu fermé jusqu’aux réponses, rien n’entre dans la note ; la variante de d1 varie', async () => {
  await monter({ uid: 'ch93-ouv', sansOuverture: true, db: { tirages: { [ID]: T1() } } });
  egal((await menu()).filter((x) => !x.startsWith('fermee:')), ['ouverture'], 'entrées ouvertes au départ');
  const T = (await base()).questions[ID]['@tirage'];
  const rub = await pg.evaluate(async (ids) => { const Q = (await import('/contenus/questions/ENT-9.3.js')).QUESTIONS; return ids.map((id) => Q.liste.find((q) => q.id === id).rubrique); }, T.ids);
  egal(rub.slice().sort(), ['droit', 'droit', 'preparation', 'preparation'], 'rubriques tirées');
  const r = await pg.evaluate(async () => {
    const { QUESTIONS } = await import('/contenus/questions/ENT-9.3.js');
    const { hasard } = await import('/core/tirage.js');
    const d1 = QUESTIONS.liste.find((q) => q.id === 'd1');
    const n = new Set();
    for (let i = 0; i < 50; i++) { const x = d1.variante(hasard(`e-${i}`)); const [, a, b] = /déclaré (\d+) palettes au lieu de (\d+)/.exec(x.enonce); n.add(a + '/' + b);
      if (!x.retour.includes(`${b} palettes et non ${a}`) || Number(b) <= Number(a)) return { faute: x.retour }; }
    return { n: n.size, banque: ['preparation', 'droit'].map((rb) => QUESTIONS.liste.filter((q) => q.rubrique === rb).length) };
  });
  vrai(r.n >= 10 && !r.faute, 'variante de d1 : ' + JSON.stringify(r));
  egal(r.banque, [4, 4], 'banque ≥ double par rubrique (2 + 2 tirées)');
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /question:(p|d)\d/.test(k)), 'une question d’ouverture est notée');
});

// ─────────────────────────────────────────────────────────── ergonomie
for (const [w, h] of [[1366, 768], [1280, 720]]) {
  await v(`ENT-9.3 : ergonomie ${w} × ${h} — sept cadres (confirmé) et un relevé corrigé de cinq lignes : aucune fiche ne fait défiler la page, le bouton d’envoi se voit ; le visa de Grégory est en italique`, async () => {
    await pg.setViewportSize({ width: w, height: h });
    try {
      // Le pire cas du relevé corrigé : un confirmé qui corrige ses cinq documents (cinq lignes, puis solde, inventaire, écart).
      const valeurs = { inventaire: 'europe', frais: 'tournee' };
      for (const role of ['retour', 'b1', 'b2', 'a2', 'a3']) Object.assign(valeurs, { [`type-${role}`]: 'quantite', [`corr-${role}`]: 'retirer', [`qte-${role}`]: '10', [`qui-${role}`]: 'ternois' });
      const db = { tirages: { [ID]: T1({ bonus: 'a2-frais-nord' }) }, fiches: { enquete: { valeurs, envoye: { at: 1 }, envois: 1 } } };
      await monter({ uid: 'ch93-ecran', aisance: 'confirme', db });
      const mesures = [];
      for (const vue of ['fiche', 'fiche:corrige']) {
        await aller(vue);
        await pg.$$eval('[data-carte-fermer]', (L) => L.forEach((b) => b.click()));
        await pause(200);
        await pg.evaluate(() => window.dispatchEvent(new Event('resize')));
        await pause(100);
        mesures.push(await pg.evaluate(() => { window.scrollTo(0, 0); const p = document.querySelector('#fTest .ent-page');
          const cartes = document.querySelector('#fTest .ent-cartes-ancre').getBoundingClientRect().height;
          const b = document.querySelector('#fTest [data-fiche-envoyee], #fTest [data-fiche-envoyer]');
          return { h: p.scrollHeight - cartes, bas: b.getBoundingClientRect().bottom - cartes }; }));
      }
      egal(await pg.$$eval(`${Z} [data-gr]`, (L) => L.length), 12, 'cinq lignes de correction, le solde et l’écart');
      const dit = mesures.map((m, i) => `écran ${i + 1} : ${Math.round(m.h)} px, bouton à ${Math.round(m.bas)}`).join(' ; ');
      vrai(mesures.every((m) => m.h <= h + 1 && m.bas <= h), `${dit} (pour ${h})`);
      await aller('fiche');
      await pg.click(`${Z} [data-fiche-doc="bon-retour"]`); await pause();
      egal(await pg.$eval(`${Z} [data-visa]`, (e) => getComputedStyle(e).fontStyle), 'italic', 'visa en italique');
    } finally { await pg.setViewportSize({ width: 1366, height: 900 }); }
  });
}

// ─────────────────────────────────────────────────────────── socle
await v('ENT-9.3 : socle — aucune erreur JavaScript ; le corrigé de l’enseignant se calcule pour un élève (sa pièce, ses soldes, bonus marqué) ; chaque document porte sa mention', async () => {
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-9.3.js');
    const D = await import('/contenus/chep-ent93-donnees.js');
    const S = await import('/contenus/chep-ent93.js');
    const g = 'ch93-conf|chep-releve-conteste';
    const base = { tirages: { 'chep-releve-conteste': { graine: g, ...D.TIRAGE.tirer(g, { confirme: true }) } } };
    const e = C.corrigeEleve(base, 'ch93-conf');
    const vide = C.corrigeEleve({}, 'nouveau');
    const html = S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html(base) : d.html));
    const J = D.jeuEleve(base);
    return { n: C.CORRIGE.items.length, items: e.items.map((x) => [x.texte, x.rep || '', !!x.bonus, (x.reponses || []).length]), vide: vide.texte, sC: J.sCorrige,
      pieds: html.filter((h) => /Document reconstitué|Extrait reconstitué|Document pédagogique|Textes réels/.test(h)).length, total: html.length };
  });
  vrai(c.n >= 4, 'corrigé commun');
  vrai(c.items.some(([t, , , n]) => /Ses documents/.test(t) && n === 4), 'ses quatre documents du socle');
  vrai(c.items.some(([t, , b, n]) => /second document/.test(t) && b && n === 1), 'bonus marqué');
  vrai(c.items.some(([t, r]) => /relevé corrigé attendu/.test(t) && r.includes(`= ${c.sC} palettes CHEP`)), 'son solde corrigé');
  vrai(/pas encore ouvert/.test(c.vide), 'élève sans base');
  egal(c.pieds, c.total, 'chaque document porte sa mention');
  egal(erreursF, [], 'aucune erreur JS');
});

await F.fermer();
}
