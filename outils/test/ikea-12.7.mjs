// Suite de tests de Prepalog — bloc « ikea-12.7 » : IKEA ENT-12.7, « évaluation : la livraison de ta cliente » (2de, poste B transport, OTM-C1.1, OTM-C1.2 et OTM-C3.1, copie rendue,
// un jeu par élève : cliente, imprévu et décalage de la journée). `node outils/test.mjs ikea-12.7` ne lance que ce bloc. Brief : `docs/briefs/ENT-12.7-ikea-evaluation-transport.md` §4 à §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS. Les GRAINES sont choisies ici (l'identifiant de l'élève : c'est
// la graine du jeu) ; les valeurs attendues sont ÉCRITES À LA MAIN (relues le 26/10/2026), jamais recalculées par le code de la séance :
//
//   ik127-d : Mme Lemaire (Paris 15e, 3e étage avec ascenseur, non membre), crue, journée décalée de 0 h       → lampe Point Relais ; bibliothèque et commode « devant chez vous » ; 7 + 60 = 67 € ; l'après-midi.
//   ik127-c : M. Petit (Colombes, plain-pied, membre), écluse fermée, décalée de 1 h                          → les trois articles « dans la pièce » (il ne peut rien porter) ; 547 € → 80 € ; le matin.
//   ik127-a : Mme Rey (Paris 18e, 5e sans ascenseur, non membre), écluse fermée, décalée de 2 h               → lampe Point Relais ; armoire et canapé « dans la pièce » ; 7 + 100 = 107 € ; le matin.
//   ik127-b : M. Garnier (Paris 12e, 2e avec ascenseur, membre, commande de plus de 1 000 €), avarie, décalée de 2 h → lampe Point Relais ; armoire et canapé « dans la pièce » (plafond de 1 000 €) ; 2 + 130 = 132 € ; l'après-midi.
//   La journée : Roux et Haddad ne peuvent pas tenir leur créneau (le bloc est plus long que le créneau) ; les huit autres le peuvent, sur un seul ensemble ; le décalage glisse tous les créneaux de 0, 1 ou 2 h.
//
// Barème : demande (accès et créneau 3, rien de faux promis 1) · mode (1, 1, 2) · prix 2 · créneaux tenus 3 · clients prévenus 2 + la nouvelle date 1 · Avant de commencer 4 = 20.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'ikea-evaluation-transport';
const PL = 'ik-planning-127';
const DID = 'ik-appel-127';
const ACT = '/activites/ikea-evaluation-transport.js';
const P = await ouvrirIkea({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, entrants, clic, allerV, sansToast, confirmer, noter, appel, monter } = P;

const OUV = { reformuler: 'compris', acces: 'escalier', poids: '112', engagement: 'creneau', promesse: 'engagement', fenetre: 'client', annuler: 'delai', essentielle: 'tout-de-suite' };
const OUV_FAUX = { reformuler: 'attendre', acces: 'age', poids: '3', engagement: 'lendemain', promesse: 'rien', fenetre: 'livreur', annuler: 'jamais', essentielle: 'non' };
const R = { 'pourquoi-mode': 'client', 'annuler-demain': 'delai', 'pas-tous': 'inquieter' };
const mont = (o = {}) => monter({ rep: OUV, uid: 'ik127-a', ...o });
const JALONS = ['demande', 'promesse', 'mode-1', 'mode-2', 'mode-3', 'prix', 'creneaux', 'prevenir-qui', 'prevenir-date'];
const detail = async () => (await noter(ACT)).detail;
const JUGE = /\b(bravo|bonne réponse|mauvaise réponse)\b/i;

// Chaque graine : la cliente, le créneau juste, l'appel juste, les modes justes, le prix juste, le décalage de la journée (en quarts d'heure).
const G = {
  'ik127-d': { nom: 'Mme Lemaire', dec: 0, creneau: 'aprem', appel: ['acces', 'aprem', 'ok'], modes: { lampe: ['relais', 'leger'], biblio: ['devant', 'porter'], commode: ['devant', 'porter'] }, prix: 67 },
  'ik127-c': { nom: 'M. Petit', dec: 4, creneau: 'matin', appel: ['acces', 'matin', 'ok'], modes: { miroir: ['piece', 'monter'], etagere: ['piece', 'monter'], lit: ['piece', 'monter'] }, prix: 80 },
  'ik127-a': { nom: 'Mme Rey', dec: 8, creneau: 'matin', appel: ['acces', 'matin', 'ok'], modes: { lampe: ['relais', 'leger'], armoire: ['piece', 'monter'], canape: ['piece', 'monter'] }, prix: 107 },
  'ik127-b': { nom: 'M. Garnier', dec: 8, creneau: 'aprem', appel: ['acces', 'aprem', 'ok'], modes: { lampe: ['relais', 'leger'], armoire: ['piece', 'plafond'], canape: ['piece', 'plafond'] }, prix: 132 },
};

// La journée juste (écrite à la main) : { carte: [ligne, quart d'heure depuis 8 h] } pour un décalage de 0 h ; `plan(dec)` ajoute le décalage aux créneaux.
// (8 h = 0, 9 h 15 = 5, 10 h = 8, 10 h 45 = 11, 14 h = 24, 15 h = 28, 15 h 15 = 29.)
const JUSTE = { martin: ['c1', 0], nguyen: ['c1', 5], lefevre: ['c1', 11], morel: ['c2', 8], perrin: ['c2', 24], garcia: ['c2', 29], diallo: ['c3', 24], costa: ['c3', 28], roux: ['demain', 0], haddad: ['demain', 10] };
const plan = (dec, o = {}) => Object.fromEntries(Object.entries({ ...JUSTE, ...o }).map(([k, [l, t]]) => [k, [l, t + (o[k] ? 0 : dec)]]));

async function poser(id, ligne, t) {
  await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${ligne}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause(40);
}
async function qFil() {
  for (let i = 0; i < 8; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 700 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
}
async function envoyerPlanning() { await sansToast(); await pg.click(`${Z} [data-pl="envoyer"]`); await confirmer(); await pause(150); }
async function journee(uid, o = {}) {
  await allerV('planning');
  await envoyerPlanning(); await qFil();
  await allerV('planning');
  for (const [id, [ligne, t]] of Object.entries(o.plan || plan(G[uid].dec))) await poser(id, ligne, t);
  await envoyerPlanning(); await qFil();
}
async function ficheMode(uid, o = {}) {
  await allerV(`fiche`);
  const sel = async (champ, val) => { await pg.selectOption(`${Z} [data-fiche-champ="${champ}"]`, val); await pause(20); };
  const M = { ...G[uid].modes, ...(o.modes || {}) };
  for (const [a, [mode, raison]] of Object.entries(M)) { await sel(`mode_${a}`, mode); await sel(`raison_${a}`, raison); }
  await pg.fill(`${Z} [data-fiche-saisie="prix"]`, String(o.prix == null ? G[uid].prix : o.prix)); await pause(20);
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer(); await qFil();
}
async function prevenir({ clients = ['roux', 'haddad'], date = 'demain' } = {}) {
  await allerV('fiche:prevenir-127');
  for (const c of clients) { await pg.check(`${Z} [data-fiche-case="clients"][value="${c}"]`); await pause(30); }
  if (date) { await pg.check(`${Z} [data-fiche-champ="date"][value="${date}"]`); await pause(30); }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer(); await qFil();
}
async function jouer(uid, o = {}) {
  await appel(DID, o.appel || G[uid].appel); await qFil();
  await ficheMode(uid, o.mode);
  await journee(uid, o.journee);
  await prevenir(o.prevenir);
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-12.7 : la séance se charge (2de, OTM-C1.1, OTM-C1.2 et OTM-C3.1, évaluation, copie rendue) ; poids 16 + « Avant de commencer » 4 = 20 ; trois réflexions au fil, non notées ; ouverture 2 + 2 tirées parmi 8', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/ikea-evaluation-transport.js');
    const S = await import('/contenus/ikea-ent127.js');
    const Q = await import('/contenus/questions/ENT-12.7.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, noter: typeof A.noter, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0), part: Q.QUESTIONS.ouverture.part,
      fil: L.filter((q) => q.type === 'fil').map((q) => [q.id, !!q.reflexion]), ouv: Q.QUESTIONS.ouverture.tirage, nbOuv: Q.QUESTIONS.ouverture.questions.length,
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'ikea-evaluation-transport') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, r.noter],
    ['ENT-12.7', ['2de'], ['OTM-C1.1', 'OTM-C1.2', 'OTM-C3.1'], 'evaluation', 20, true, 'ENT-12.7', true, 'prof', 'function'], 'meta');
  egal(r.poids, [['demande', 3], ['promesse', 1], ['mode-1', 1], ['mode-2', 1], ['mode-3', 2], ['prix', 2], ['creneaux', 3], ['prevenir-qui', 2], ['prevenir-date', 1]], 'jalons et poids');
  proche(r.total + r.part, 20, 'jalons + ouverture');
  egal([r.part, r.ouv, r.nbOuv], [4, { preparation: 2, droit: 2 }, 8], 'ouverture notée, tirée 2 + 2 parmi 8');
  egal(r.fil, [['pourquoi-mode', true], ['annuler-demain', true], ['pas-tous', true]], 'questions au fil : trois réflexions');
  egal(r.auRegistre, true, 'au registre');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-12.7 : les données — quatre clientes à trois articles, prix justes écrits à la main (67, 80, 107, 132 €) ; pour chacun des trois décalages, huit commandes sur dix peuvent tenir, sur UN seul ensemble, Roux et Haddad étant les deux impossibles ; les créneaux glissent de 0, 1 ou 2 h', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/ikea-ent127-donnees.js');
    const dec = {};
    for (const d of D.DECALAGES) {
      const C = D.commandesDe({ decalage: d });
      const M = D.maxTenues(C);
      dec[d] = { max: M.max, ens: M.ensembles.map((e) => [...e].sort()), martin: [C[3].des, C[3].avant], costa: [C[9].des, C[9].avant], imp: D.IMPOSSIBLES };
    }
    return { prix: D.CLIENTES.map((c) => [c.id, c.articles.length, D.prixJuste(c)]), ecarts: D.ecartsClientes(), dec };
  });
  egal(r.prix, [['lemaire', 3, 67], ['petit', 3, 80], ['rey', 3, 107], ['garnier', 3, 132]], 'prix justes des quatre clientes');
  egal(r.ecarts, [], 'écarts d’équité des clientes');
  const HUIT = ['costa', 'diallo', 'garcia', 'lefevre', 'martin', 'morel', 'nguyen', 'perrin'];
  for (const d of ['0', '4', '8']) { egal([r.dec[d].max, r.dec[d].ens, r.dec[d].imp], [8, [HUIT], ['roux', 'haddad']], `décalage ${d}`); }
  egal([r.dec[0].martin, r.dec[4].martin, r.dec[8].martin], [['08:00', '12:00'], ['09:00', '13:00'], ['10:00', '14:00']], 'créneau de Mme Martin décalé');
  egal([r.dec[0].costa, r.dec[8].costa], [['14:00', '17:00'], ['16:00', '19:00']], 'créneau de Mme Costa décalé');
});

await v('ENT-12.7 : équité du tirage sur 500 graines — jamais de jeu de secours ; chaque cliente, chaque imprévu et chaque décalage sortent souvent ; le jeu ne change pas d’un appel à l’autre', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/ikea-ent127-donnees.js');
    const n = { cliente: {}, imprevu: {}, decalage: {} }; let secours = 0, instables = 0;
    for (let i = 0; i < 500; i++) {
      const j = D.jeuDe(`eq${i}`);
      if (j.secours) secours++;
      ['cliente', 'imprevu', 'decalage'].forEach((k) => { n[k][j[k]] = (n[k][j[k]] || 0) + 1; });
      if (JSON.stringify(D.jeuDe(`eq${i}`)) !== JSON.stringify(j)) instables++;
    }
    return { n, secours, instables };
  });
  egal(r.secours, 0, 'jeux de secours'); egal(r.instables, 0, 'jeux instables');
  egal([Object.keys(r.n.cliente).length, Object.keys(r.n.imprevu).length, Object.keys(r.n.decalage).length], [4, 3, 3], 'valeurs tirées');
  for (const k of Object.keys(r.n)) for (const [val, c] of Object.entries(r.n[k])) vrai(c > 80 && c < 220, `${k} ${val} sort ${c} fois sur 500`);
});

// ─────────────────────────────────────────────────────────── l'ouverture, notée
await v('ENT-12.7 : Avant de commencer est NOTÉ — 4 questions tirées (2 + 2) sans aide ; « Je ne sais pas » en dernier ; 4 justes → 4/20 ; trois justes + « Je ne sais pas » → 3 ; tout faux → plancher 0 ; rien ne remonte au Suivi', async () => {
  const db = await monter({ uid: 'ik127-a', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 4, 'nombre de questions');
  egal([ids.filter((x) => ['reformuler', 'acces', 'poids', 'engagement'].includes(x)).length, ids.filter((x) => ['promesse', 'fenetre', 'annuler', 'essentielle'].includes(x)).length], [2, 2], 'deux de préparation, deux de droit');
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
  const pts = async (rep, o = {}) => { await monter({ uid: 'ik127-a', rep, ...o }); return (await noter(ACT)).score; };
  proche(await pts(OUV), 4, 'quatre justes');
  proche(await pts(OUV_FAUX), 0, 'tout faux : plancher 0');
  proche(await pts({}, { sansOuverture: true }), 0, 'sans réponse');
});

await v('ENT-12.7 : à l’ouverture — un seul message de Claire, daté du jour de l’appel, avec le poste et la commande ; l’appel est ouvert, les fiches et le planning attendent ; inaction → 4/20 et aucun jalon juste ni faux', async () => {
  await mont();
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Claire', 'Un client à appeler', ['poste-127', 'commande-127']]], 'messages à l’ouverture');
  const M = await pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.dataset.vue));
  vrai(M.includes('telephone') && !M.includes('planning'), 'menu au départ : ' + M.join(', '));
  const n = await noter(ACT);
  proche(n.score, 4, 'note : l’ouverture seule');
  vrai(JALONS.every((k) => n.detail[k] !== 'ok' && n.detail[k] !== 'ko'), 'un jalon jugé sans rien faire : ' + JSON.stringify(n.detail));
});

await v('ENT-12.7 : la commande ne dit ni l’accès ni les préférences du client (c’est l’appel qui les apprend) ; les documents suivent la graine (nom de la cliente, article, statut)', async () => {
  const doc = async (uid) => { await mont({ uid }); return pg.evaluate(() => { const S = window.__f; return null; }).then(() => pg.evaluate(async () => (await import('/contenus/ikea-ent127.js')).DOCUMENTS.find((d) => d.id === 'commande-127').html(window.__f.db))); };
  const a = await doc('ik127-a'), c = await doc('ik127-c');
  vrai(/Mme Rey/.test(a) && /Canapé/.test(a) && /non membre/.test(a), 'commande de ik127-a : ' + a.slice(0, 200));
  vrai(/M\. Petit/.test(c) && /Miroir/.test(c) && /membre/.test(c) && !/non membre/.test(c), 'commande de ik127-c');
  vrai(!/étage|ascenseur|escalier|plain-pied|Point Relais/i.test(a.replace(/mode choisi[^<]*/i, '').replace(/ik-st[^<]*/g, '')), 'la commande donne l’accès : ' + a.replace(/<[^>]+>/g, ' ').slice(0, 300));
});

// ─────────────────────────────────────────────────────────── inaction du planning
await v('ENT-12.7 : inaction — le premier envoi du planning seul ne rapporte aucun jalon ; renvoyer le même planning (sans rien reposer) non plus', async () => {
  await mont();
  await appel(DID, G['ik127-a'].appel); await ficheMode('ik127-a');
  await allerV('planning'); await envoyerPlanning(); await qFil();
  let n = await noter(ACT);
  vrai(!['creneaux', 'prevenir-qui', 'prevenir-date'].some((k) => n.detail[k] === 'ok'), 'jalon de journée juste après le premier envoi : ' + JSON.stringify(n.detail));
  await allerV('planning'); await envoyerPlanning(); await qFil();
  n = await noter(ACT);
  vrai(n.detail.creneaux !== 'ok', 'créneaux juste sans rien reposer : ' + JSON.stringify(n.detail));
});

// ─────────────────────────────────────────────────────────── les parcours
for (const uid of Object.keys(G)) {
  await v(`ENT-12.7 : parcours juste (${uid} — ${G[uid].nom}, journée décalée de ${G[uid].dec / 4} h, prix ${G[uid].prix} €) — 20/20 ; les messages se suivent ; rien à l’écran ne dit « juste » ou « faux »`, async () => {
    await mont({ uid });
    await jouer(uid);
    const E = await entrants();
    egal(E.map((m) => [m.from, m.subject]).filter((x) => x[1] !== 'Merci').map((x) => x[1]).length, 5, 'nombre de messages (hors remerciements) : ' + E.map((m) => m.subject).join(' | '));
    vrai(['Un client à appeler', 'Les modes de livraison', 'Le planning du jeudi 11 mars', 'Les clients à prévenir'].every((s) => E.some((m) => m.subject === s)), 'messages attendus : ' + E.map((m) => m.subject).join(' | '));
    vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge');
    const n = await noter(ACT);
    egal([n.score, n.max], [20, 20], 'note : ' + JSON.stringify(n.detail));
  });
}

// ─────────────────────────────────────────────────────────── sabotages
await v('ENT-12.7 : sabotages de l’appel (ik127-a, Mme Rey) — « étage » seul à la première réplique → la demande tombe (17) ; le créneau de l’après-midi alors qu’elle travaille l’après-midi → la demande tombe (17) ; la fenêtre promise à tort → rien de faux promis (19)', async () => {
  const essai = async (appelle, tombes, score, quoi) => {
    await mont({ uid: 'ik127-a' }); await jouer('ik127-a', { appel: appelle });
    const d = await detail();
    egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai(['etage', 'matin', 'ok'], ['demande'], 17, 'accès incomplet');
  await essai(['acces', 'aprem', 'ok'], ['demande'], 17, 'mauvais créneau');
  await essai(['acces', 'matin', 'faux1'], ['promesse'], 19, 'fenêtre promise');
  await essai(['acces', 'jour', 'faux2'], ['demande', 'promesse'], 16, 'créneau non fixé et promesse fausse');
});

await v('ENT-12.7 : sabotages du mode et du prix (ik127-a) — la lampe en « dans la pièce » → son mode seul (19) ; l’armoire en « devant chez vous » → idem (19) ; le canapé (qui vaut double) en « devant chez vous » → 18 ; bon mode, raison « le moins cher » → 19 ; prix sans la lampe → 18', async () => {
  const essai = async (o, tombes, score, quoi) => {
    await mont({ uid: 'ik127-a' }); await jouer('ik127-a', o);
    const d = await detail();
    egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai({ mode: { modes: { lampe: ['piece', 'monter'] } } }, ['mode-1'], 19, 'lampe dans la pièce');
  await essai({ mode: { modes: { armoire: ['devant', 'porter'] } } }, ['mode-2'], 19, 'armoire devant chez vous');
  await essai({ mode: { modes: { canape: ['devant', 'porter'] } } }, ['mode-3'], 18, 'canapé devant chez vous');
  await essai({ mode: { modes: { armoire: ['piece', 'prix'] } } }, ['mode-2'], 19, 'bon mode, mauvaise raison');
  await essai({ mode: { prix: 100 } }, ['prix'], 18, 'prix sans la lampe');
});

await v('ENT-12.7 : sabotages de la journée (ik127-a, décalée de 2 h) — un camion à deux endroits à la fois → les créneaux tombent (17) ; trop de poids sur le camion 3 → 17 ; Mme Costa reportée sans nécessité → ses créneaux tombent ET la liste des clients (15) ; M. Diallo hors créneau, non prévenu → 15, prévenu → 17', async () => {
  const essai = async (journee, prev, tombes, score, quoi) => {
    await mont({ uid: 'ik127-a' }); await jouer('ik127-a', { journee: { plan: plan(8, journee) }, prevenir: prev });
    const d = await detail();
    egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai({ nguyen: ['c1', 4 + 8] }, undefined, ['creneaux'], 17, 'recouvrement');
  await essai({ morel: ['c3', 8 + 8] }, undefined, ['creneaux'], 17, 'surcharge du camion 3');
  await essai({ costa: ['demain', 20] }, undefined, ['creneaux', 'prevenir-qui'], 15, 'Costa reportée sans nécessité');
  await essai({ costa: ['demain', 20] }, { clients: ['roux', 'haddad', 'costa'] }, ['creneaux'], 17, 'Costa reportée, prévenue');
  await essai({ costa: ['c3', 24 + 8], diallo: ['c3', 32 + 8] }, undefined, ['creneaux', 'prevenir-qui'], 15, 'Diallo hors créneau, non prévenu');
  await essai({ costa: ['c3', 24 + 8], diallo: ['c3', 32 + 8] }, { clients: ['roux', 'haddad', 'diallo'] }, ['creneaux'], 17, 'Diallo hors créneau, prévenu');
});

await v('ENT-12.7 : sabotages de la fiche « prévenir » (ik127-a) — tous les clients prévenus → −2 (18) ; aucun coché → −2 et −1 (17) ; date « dans un mois » → −1 (19) ; un planning incomplet ne rapporte pas la liste des clients', async () => {
  const essai = async (prev, tombes, score, quoi) => {
    await mont({ uid: 'ik127-a' }); await jouer('ik127-a', { prevenir: prev });
    const d = await detail();
    egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai({ clients: ['roux', 'haddad', 'martin', 'nguyen', 'lefevre', 'morel', 'garcia', 'perrin', 'diallo', 'costa'] }, ['prevenir-qui'], 18, 'tous prévenus');
  await essai({ clients: [] }, ['prevenir-qui', 'prevenir-date'], 17, 'aucun client');
  await essai({ date: 'mois' }, ['prevenir-date'], 19, 'dans un mois');
  // un planning incomplet (deux commandes sans place) : la liste « non tenus » ne se juge pas
  await mont({ uid: 'ik127-a' });
  await jouer('ik127-a', { journee: { plan: Object.fromEntries(Object.entries(plan(8)).filter(([k]) => !['roux', 'haddad'].includes(k))) } });
  const d = await detail();
  vrai(d['prevenir-qui'] !== 'ok' && d['prevenir-date'] !== 'ok' && d.creneaux !== 'ok', 'planning incomplet jugé juste : ' + JSON.stringify(d));
});

await v('ENT-12.7 : les messages ne jugent pas ; les trois réflexions sont posées et ne rapportent rien (20/20 sur un parcours juste, sans point de plus) ; Claire annonce l’imprévu DU JEU (ik127-c : l’écluse, ik127-d : la Seine)', async () => {
  await mont({ uid: 'ik127-c' }); await jouer('ik127-c');
  let E = await entrants();
  vrai(E.some((m) => m.subject === 'L’écluse est fermée : il faut tout replanifier'), 'imprévu de ik127-c : ' + E.map((m) => m.subject).join(' | '));
  const qs = await pg.evaluate(() => Object.keys((window.__f.db.questions || {})['ikea-evaluation-transport'] || {}).filter((k) => !k.startsWith('@')));
  vrai(['pourquoi-mode', 'annuler-demain', 'pas-tous'].every((k) => qs.includes(k)), 'réflexions posées : ' + qs.join(', '));
  proche((await noter(ACT)).score, 20, 'les réflexions ne rapportent rien');
  await mont({ uid: 'ik127-d' }); await jouer('ik127-d');
  E = await entrants();
  vrai(E.some((m) => m.subject === 'La Seine est en crue : il faut tout replanifier'), 'imprévu de ik127-d');
  vrai(!E.some((m) => JUGE.test(m.text)), 'un message juge');
});

// ─────────────────────────────────────────────────────────── le corrigé
await v('ENT-12.7 : le corrigé donne la réponse des quatre clientes (modes et prix) ; le fichier est servi', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-12.7.js');
    return { items: C.CORRIGE.items.length, texte: C.CORRIGE.items.map((x) => x.rep).join(' | ') };
  });
  egal(r.items, 4, 'étapes du corrigé');
  vrai(/prix 67 €/.test(r.texte) && /prix 80 €/.test(r.texte) && /prix 107 €/.test(r.texte) && /prix 132 €/.test(r.texte), 'prix du corrigé : ' + r.texte.slice(0, 600));
  egal(await pg.evaluate(async () => (await fetch('/contenus/corriges/ENT-12.7.js')).status), 200, 'le fichier de corrigé est servi');
});

await v('ENT-12.7 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
