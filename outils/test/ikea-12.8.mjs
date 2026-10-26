// Suite de tests de Prepalog — bloc « ikea-12.8 » : IKEA ENT-12.8, « évaluation : la facture de mars » (2de, poste A assistant(e) de gestion, AGO-2.1, copie rendue,
// trois erreurs tirées parmi six). `node outils/test.mjs ikea-12.8` ne lance que ce bloc. Brief : `docs/briefs/ENT-12.8-ikea-evaluation-gestion.md` §4 à §6 bis.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS. Les GRAINES sont choisies ici (l'identifiant de
// l'élève) ; les valeurs attendues sont ÉCRITES À LA MAIN (relues le 26/10/2026 sur le tirage, puis recoupées avec le tarif : 28 € devant chez vous, 46 € dans la pièce, 6 € par
// étage sans ascenseur, 5 € par colis au-delà de 3, 30 % du prix pour une livraison manquée ; TVA 20 %), jamais recalculées par le code de la séance :
//
//   ik128-a : colis en trop (ligne 8) + supplément d'étage indu (ligne 9) + total faux      → HT juste 534,80 € ; TVA 106,96 € ; TTC 641,76 € ; écart 47 € HT (5 + 18 + 24 de total).
//   ik128-b : livraison non faite (ligne 6) + colis en trop (ligne 8) + total faux          → HT juste 528,80 € ; TVA 105,76 € ; TTC 634,56 € ; écart 72,20 € HT (49,20 + 5 + 18).
//   ik128-d : mauvais tarif (ligne 5) + livraison non faite (ligne 10) + doublon (12 ou 7)  → HT juste 506,80 € ; TVA 101,36 € ; TTC 608,16 € ; écart 95,20 € HT (18 + 49,20 + 28) ; total exact.
// (Le tirage d'une graine est celui de « identifiant|id de la séance » : c'est ce que relit `TIRAGE.tirer`.)
//
// Barème (brief §5, adapté le 26/10/2026) : une erreur de chaque niveau 3 + 3 + 3 · aucune ligne juste contestée 2 · bon montant 3 · réclamation 2 · Avant de commencer 4 = 20.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'ikea-evaluation-gestion';
const FICHE = 'controle-facture-128';
const OBJET = 'Facture F-2027-0378 — livraisons de mars 2027';
const ACT = '/activites/ikea-evaluation-gestion.js';
const P = await ouvrirIkea({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, qFil } = P;

const OUV = { facture: 'doc', preuve: 'bon', 'ht-ttc': '360', doublon: 'doublon', 'avoir-quoi': 'avoir', du: 'rendre', 'ligne-fausse': 'du', 'preuve-litige': 'bon' };
const OUV_FAUX = { facture: 'commande', preuve: 'tarif', 'ht-ttc': '320', doublon: 'deux', 'avoir-quoi': 'rien', du: 'garder', 'ligne-fausse': 'tout', 'preuve-litige': 'souvenir' };
const R = { 'preuve-ligne': 'bon', 'deux-fois': 'rendre' };
const mont = (o = {}) => monter({ rep: OUV, uid: 'ik128-a', ...o });
const JALONS = ['erreur-facile', 'erreur-moyenne', 'erreur-difficile', 'aucune-juste', 'calcul', 'reclamation'];
const detail = async () => (await noter(ACT)).detail;
const SEED = {
  'ik128-a': { cases: { tarif: [8, 9] }, total: 'faux', nb: { ht: '534,80', tva: '106,96', ttc: '641,76', ecart: '47' }, lignes: /lignes 8 et 9/, avoir: /47 € HT, soit 56,4 € TTC/ },
  'ik128-b': { cases: { tarif: [8], nonfaite: [6] }, total: 'faux', nb: { ht: '528,80', tva: '105,76', ttc: '634,56', ecart: '72,20' }, lignes: /lignes 6 et 8/, avoir: /72,2 € HT, soit 86,64 € TTC/ },
  'ik128-d': { cases: { tarif: [5], nonfaite: [10], doublon: [12] }, total: 'juste', nb: { ht: '506,80', tva: '101,36', ttc: '608,16', ecart: '95,20' }, lignes: /lignes 5, 10 et 12/, avoir: /95,2 € HT, soit 114,24 € TTC/ },
};

async function fiche({ cases, total, nb }) {
  await allerV('fiche');
  for (const [motif, lignes] of Object.entries(cases)) {
    for (const n of lignes) { await pg.check(`${Z} [data-fiche-case="${motif}"][value="${n}"]`); await pause(250); await qFil(R); }
  }
  if (total) { await pg.check(`${Z} [data-fiche-champ="total"][value="${total}"]`); await pause(200); await qFil(R); }
  for (const [k, val] of Object.entries(nb)) { if (val != null) { await pg.fill(`${Z} [data-fiche-saisie="${k}"]`, val); await pause(20); } }
  await pg.keyboard.press('Tab'); await pause(300); await qFil(R);
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil(R);
}
const justes = () => pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.map((c) => c)])) : null; }, OBJET);
async function reclamer(surcharge = {}) {
  const L = await justes();
  const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
  await phrases(OBJET, { ...t, ...surcharge });
  await qFil(R);
}
async function jouer(uid, o = {}) {
  await fiche({ ...SEED[uid], ...(o.fiche || {}) });
  if (!o.sansReclamation) await reclamer(o.reclamation);
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-12.8 : la séance se charge (2de, AGO-2.1, évaluation, copie rendue) ; poids 16 + « Avant de commencer » 4 = 20 comme le brief §5 ; deux réflexions au fil, non notées ; ouverture 2 + 2 tirées', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/ikea-evaluation-gestion.js');
    const S = await import('/contenus/ikea-ent128.js');
    const Q = await import('/contenus/questions/ENT-12.8.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, noter: typeof A.noter, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0), part: Q.QUESTIONS.ouverture.part,
      fil: L.filter((q) => q.type === 'fil').map((q) => [q.id, !!q.reflexion]), ouv: Q.QUESTIONS.ouverture.tirage, nbOuv: Q.QUESTIONS.ouverture.questions.length,
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'ikea-evaluation-gestion') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, r.noter],
    ['ENT-12.8', ['2de'], ['AGO-2.1'], 'evaluation', 20, true, 'ENT-12.8', true, 'prof', 'function'], 'meta');
  egal(r.poids, [['erreur-facile', 3], ['erreur-moyenne', 3], ['erreur-difficile', 3], ['aucune-juste', 2], ['calcul', 3], ['reclamation', 2]], 'jalons et poids');
  proche(r.total + r.part, 20, 'jalons + ouverture');
  egal([r.part, r.ouv, r.nbOuv], [4, { preparation: 2, droit: 2 }, 8], 'ouverture notée, tirée 2 + 2 parmi 8');
  egal(r.fil, [['preuve-ligne', true], ['deux-fois', true]], 'questions au fil : deux réflexions');
  egal(r.auRegistre, true, 'au registre');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-12.8 : équité du tirage sur 500 graines — toujours trois erreurs, une de chaque niveau ; jamais de jeu de secours ; douze lignes ; le doublon donne onze bons et la ligne recopiée ne porte aucune erreur ; chaque erreur sort ; les pièges (livraison manquée, réserve) restent justes', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/ikea-ent128-donnees.js');
    const { ERREURS, prixDu } = await import('/contenus/ikea-facture.js');
    const sorties = {}; const ecarts = []; let secours = 0; const gen = new Set();
    for (let i = 0; i < 500; i++) {
      const g = `eq${i}`;
      const rec = D.TIRAGE.tirer(g);
      if (rec.secours) secours++;
      const db = { tirages: { [D.ID]: { graine: g, ...rec } } };
      const E = D.erreursDe(db);
      const niv = E.map((t) => ERREURS[t].niveau).sort().join(',');
      if (E.length !== 3 || niv !== 'difficile,facile,moyen') ecarts.push(`${g} : ${E} ${niv}`);
      E.forEach((t) => { sorties[t] = (sorties[t] || 0) + 1; });
      const F = D.dossier(db);
      if (F.lignes.length !== 12) ecarts.push(`${g} : ${F.lignes.length} lignes`);
      if (F.bons.length !== (E.includes('doublon') ? 11 : 12)) ecarts.push(`${g} : ${F.bons.length} bons`);
      if (Object.keys(F.fautes).sort().join() !== [...E].sort().join()) ecarts.push(`${g} : fautes ${Object.keys(F.fautes)} pour ${E}`);
      if (E.includes('doublon')) {
        const f = F.fautes.doublon, a = F.lignes[f.accepte[0] - 1];
        if (F.bons[f.accepte[0] - 1].role || F.lignes[f.lignes[0] - 1].bl !== a.bl) ecarts.push(`${g} : doublon sur une ligne à rôle ou mal recopié`);
      }
      const somme = Math.round(F.bons.reduce((s, b) => s + prixDu(b), 0) * 100) / 100;
      if (Math.abs(somme - F.justes.ht) > 0.005) ecarts.push(`${g} : HT ${somme} ≠ ${F.justes.ht}`);
      if (F.ecartHT <= 0) ecarts.push(`${g} : écart ${F.ecartHT}`);
      const nonfaite = E.includes('nonfaite');
      const manquee = F.bons.filter((b) => b.issue === 'absent').length;
      if (manquee !== 1) ecarts.push(`${g} : ${manquee} livraisons manquées sur les bons`);
      if (!nonfaite && F.lignes.some((l) => l.issue === 'absent') !== true) ecarts.push(`${g} : la livraison manquée correcte a disparu`);
      gen.add(F.lignes.map((l) => `${l.bl}${l.client}${l.ht}`).join());
    }
    return { sorties, ecarts: ecarts.slice(0, 5), secours, distincts: gen.size };
  });
  egal(r.ecarts, [], 'écarts au tirage');
  egal(r.secours, 0, 'jeux de secours');
  egal(Object.keys(r.sorties).sort(), ['calcul', 'doublon', 'nonfaite', 'qte', 'supp', 'tarif'], 'les six erreurs sortent');
  for (const [t, n] of Object.entries(r.sorties)) vrai(n > 100 && n < 400, `l’erreur « ${t} » sort ${n} fois sur 500`);
  vrai(r.distincts > 400, `seulement ${r.distincts} factures différentes sur 500`);
});

// ─────────────────────────────────────────────────────────── l'ouverture, notée
await v('ENT-12.8 : Avant de commencer est NOTÉ — 4 questions tirées (2 + 2) sans aide ; « Je ne sais pas » en dernier ; 4 justes → 4/20 ; trois justes + « Je ne sais pas » → 3 ; tout faux → plancher 0 ; rien ne remonte au Suivi', async () => {
  const db = await monter({ uid: 'ik128-a', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 4, 'nombre de questions');
  egal([ids.filter((x) => ['facture', 'preuve', 'ht-ttc', 'doublon'].includes(x)).length, ids.filter((x) => ['avoir-quoi', 'du', 'ligne-fausse', 'preuve-litige'].includes(x)).length], [2, 2], 'deux de préparation, deux de droit');
  const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${k === 3 ? '@nsp' : OUV[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    if (k < 3) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter(ACT);
  egal([n.detail.ouverture.justes, n.detail.ouverture.nsp, n.detail.ouverture.faux, n.detail.ouverture.sur], [3, 1, 0, 4], 'ouverture comptée');
  proche(n.score, 3, '3 justes + « Je ne sais pas »');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  const pts = async (rep, o = {}) => { await monter({ uid: 'ik128-a', rep, ...o }); return (await noter(ACT)).score; };
  proche(await pts(OUV), 4, 'quatre justes');
  proche(await pts(OUV_FAUX), 0, 'tout faux : plancher 0');
  proche(await pts({}, { sansOuverture: true }), 0, 'sans réponse');
});

await v('ENT-12.8 : à l’ouverture — un seul message de Hugo avec les quatre pièces ; inaction (« Avant de commencer » faite, rien d’autre) → 4/20 et aucun jalon juste', async () => {
  await mont();
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Hugo', 'La facture de mars à contrôler', ['poste-128', 'facture-128', 'bons-128', 'tarif-128']]], 'messages à l’ouverture');
  const n = await noter(ACT);
  proche(n.score, 4, 'note : l’ouverture seule');
  vrai(!JALONS.some((k) => n.detail[k] === 'ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
});

// ─────────────────────────────────────────────────────────── les parcours
for (const uid of Object.keys(SEED)) {
  await v(`ENT-12.8 : parcours juste (${uid}) — 20/20 ; les trois lignes à contester, les quatre montants écrits à la main, la phrase des lignes et celle de l’avoir`, async () => {
    await mont({ uid });
    await jouer(uid);
    const L = await justes();
    vrai(SEED[uid].lignes.test(L.lignes[0]), 'phrase des lignes : ' + L.lignes[0]);
    vrai(SEED[uid].avoir.test(L.avoir[0]), 'phrase de l’avoir : ' + L.avoir[0]);
    const n = await noter(ACT);
    egal([n.score, n.max], [20, 20], 'note : ' + JSON.stringify(n.detail));
    egal((await entrants()).map((m) => m.from), ['Hugo', 'Service facturation — prestataire de livraison', 'Hugo'], 'messages');
  });
}

await v('ENT-12.8 : le doublon se coche sur l’une OU l’autre des deux lignes identiques (12 ou la ligne recopiée) → 20/20 (ik128-d, ligne 12 ou ligne 7)', async () => {
  await mont({ uid: 'ik128-d' });
  await jouer('ik128-d', { fiche: { cases: { tarif: [5], nonfaite: [10], doublon: [7] } } });
  proche((await noter(ACT)).score, 20, 'doublon sur la première des deux lignes');
});

// ─────────────────────────────────────────────────────────── sabotages
await v('ENT-12.8 : sabotages de la fiche (ik128-d) — une erreur manquée ôte 3 points (17) ; le doublon sous « mauvais tarif » → 17 ; une ligne juste contestée → 18 ; « total faux » alors qu’il est exact → 18', async () => {
  const essai = async (o, tombes, score, quoi) => {
    await mont({ uid: 'ik128-d' }); await jouer('ik128-d', o);
    const d = await detail();
    egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai({ fiche: { cases: { tarif: [5], doublon: [12] } } }, ['erreur-difficile'], 17, 'livraison non faite oubliée');
  await essai({ fiche: { cases: { nonfaite: [10], doublon: [12] } } }, ['erreur-moyenne'], 17, 'mauvais tarif oublié');
  await essai({ fiche: { cases: { tarif: [5], nonfaite: [10] } } }, ['erreur-facile'], 17, 'doublon oublié');
  await essai({ fiche: { cases: { tarif: [5, 12], nonfaite: [10] } } }, ['erreur-facile'], 17, 'doublon sous « mauvais tarif »');
  await essai({ fiche: { cases: { tarif: [5, 3], nonfaite: [10], doublon: [12] } } }, ['aucune-juste'], 18, 'ligne 3 (juste) contestée');
  await essai({ fiche: { total: 'faux' } }, ['aucune-juste'], 18, '« total faux » à tort');
});

await v('ENT-12.8 : sabotages du calcul et de la réclamation (ik128-a) — total « exact » alors qu’il est faux → l’erreur facile tombe (17) ; TTC faux → 17 ; avoir faux → 18 ; cocher les douze lignes sous « mauvais tarif » ne rapporte aucune erreur ; fiche vide → aucun jalon', async () => {
  await mont({ uid: 'ik128-a' }); await jouer('ik128-a', { fiche: { total: 'juste' } });
  egal((await detail())['erreur-facile'], 'ko', 'total jugé exact'); proche((await noter(ACT)).score, 17, 'total jugé exact');
  await mont({ uid: 'ik128-a' }); await jouer('ik128-a', { fiche: { nb: { ...SEED['ik128-a'].nb, ttc: '551,80' } } });
  egal((await detail()).calcul, 'ko', 'TTC faux'); proche((await noter(ACT)).score, 17, 'TTC faux');
  await mont({ uid: 'ik128-a' }); await fiche(SEED['ik128-a']);
  const L = await justes();
  await reclamer({ avoir: L.avoir[3] });
  egal((await detail()).reclamation, 'ko', 'avoir refusé'); proche((await noter(ACT)).score, 18, 'avoir faux');
  await mont({ uid: 'ik128-a' });
  await jouer('ik128-a', { fiche: { cases: { tarif: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } } });
  const d = await detail();
  egal(['erreur-moyenne', 'erreur-difficile', 'aucune-juste'].map((k) => d[k]), ['ko', 'ko', 'ko'], 'tout cocher sous un motif');
  await mont({ uid: 'ik128-a' }); await fiche({ cases: {}, nb: {} });
  const e = await detail();
  vrai(!JALONS.some((k) => e[k] === 'ok'), 'un jalon juste sur une fiche vide : ' + JSON.stringify(e));
  proche((await noter(ACT)).score, 4, 'fiche vide : seule l’ouverture rapporte');
});

await v('ENT-12.8 : le message du prestataire n’arrive qu’après la fiche ; aucune phrase ou question ne dit « juste » ou « faux » ; les deux réflexions sont posées et ne rapportent rien', async () => {
  await mont({ uid: 'ik128-b' });
  let E = await entrants();
  vrai(!E.some((m) => m.subject === OBJET), 'message du prestataire avant la fiche');
  await fiche({ ...SEED['ik128-b'], cases: { tarif: [2], nonfaite: [11] } });
  E = await entrants();
  vrai(E.some((m) => m.subject === OBJET), 'message du prestataire après la fiche');
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse)\b/i.test(m.text)), 'un message juge');
  const qs = await pg.evaluate(() => Object.keys((window.__f.db.questions || {})['ikea-evaluation-gestion'] || {}).filter((k) => !k.startsWith('@')));
  vrai(qs.includes('preuve-ligne') && qs.includes('deux-fois'), 'réflexions posées : ' + qs.join(', '));
});

// ─────────────────────────────────────────────────────────── le corrigé
await v('ENT-12.8 : corrigé par élève — il suit la graine (ik128-a : colis en trop ligne 8, supplément ligne 9, total faux) ; le fichier est servi', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-12.8.js');
    const rep = (uid) => C.corrigeEleve({}, uid).items.map((x) => `${x.texte} : ${x.rep}`).join(' | ');
    return { a: rep('ik128-a'), c: rep('ik128-d'), communs: C.CORRIGE.items.length };
  });
  vrai(/ligne 8/.test(r.a) && /ligne 9/.test(r.a) && /534,8 €/.test(r.a) && /47 €/.test(r.a), 'corrigé de ik128-a : ' + r.a);
  vrai(/ligne 12/.test(r.c) && /506,8 €/.test(r.c), 'corrigé de ik128-d : ' + r.c);
  egal(r.communs, 5, 'étapes du corrigé commun');
  egal(await pg.evaluate(async () => (await fetch('/contenus/corriges/ENT-12.8.js')).status), 200, 'le fichier de corrigé est servi');
});

await v('ENT-12.8 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
