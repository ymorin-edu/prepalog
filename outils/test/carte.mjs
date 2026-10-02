// Suite de tests de Prepalog — bloc « carte » : la vue « carte réelle » (Nîmes), la tournée par les rues et le créneau d'ENT-3.2.
//
// Découpé de `outils/test.mjs` le 02/10/2026 (chantier C, voir `claude/prepalog-chantiers-en-cours.md`).
// Le lanceur reste `node outils/test.mjs` ; `node outils/test.mjs carte` ne lance que ce bloc.
// Le corps n'est volontairement PAS réindenté : c'est le code d'origine, ligne pour ligne, et
// réindenter aurait aussi décalé le contenu des chaînes sur plusieurs lignes.
// Ce que le bloc reçoit du lanceur (`commun.mjs`) : le navigateur, la page partagée, `v()`, etc.

import fs from 'node:fs';
import path from 'node:path';

export default async function bloc({ v, nav, ok, ROOT }) {

/* ===================================================================================== */
/* La vue « carte réelle » (core/types/carte.js) — ENT-3.2 et suivantes, étape 1          */
/*                                                                                        */
/* Montée dans le vrai moteur d'entreprise, décor Boost, avec la carte générée            */
/* (`contenus/boost-carte.js`) et ses sept clients d'essai. Ce que ces cas gardent :       */
/*   - les données : chaque nouveau client est sur sa rue, dans sa case, dans l'index ;    */
/*   - la règle du 02/10 : un nom de rue ne compte que s'il se lit ENTIER à l'écran ;      */
/*   - le point aimanté : bonne rue = posé au numéro BAN ; autre rue = refusé, nommé,      */
/*     compté ; maisons ou vue d'ensemble = refusé, pas compté ;                           */
/*   - la fin du repérage ouvre la suite, et le travail survit à un redessin ;            */
/*   - ENT-3.1 n'est pas touchée : elle garde le plan schématique.                        */
/* ===================================================================================== */

const ctxCt = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pageCt = await ctxCt.newPage();
pageCt.setDefaultTimeout(8000);
if (process.env.LENT) { const cdp = await ctxCt.newCDPSession(pageCt); await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.LENT) }); }
const erreursCt = [];
const hotesCt = new Set();
pageCt.on('pageerror', (e) => erreursCt.push('PAGEERROR: ' + e.message));
pageCt.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursCt.push('CONSOLE: ' + m.text()); });
pageCt.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotesCt.add(h); } catch (e) {} });
await pageCt.goto('http://127.0.0.1:8099/');
await pageCt.waitForSelector('#btnProf', { timeout: 8000 });

// `css` : une feuille ajoutée AVANT le montage — c'est ainsi qu'on simule une police de poste
// plus large que celle de la mesure, puisque le garde-fou ne mesure qu'à l'ouverture.
const monterCt = (css) => pageCt.evaluate(async (css) => {
  document.getElementById('ct-hote')?.remove();
  document.getElementById('ct-css')?.remove();
  if (css) { const s = document.createElement('style'); s.id = 'ct-css'; s.textContent = css; document.head.appendChild(s); }
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const B = await import('/contenus/boost.js');
  const { CARTE } = await import('/contenus/boost-carte.js');
  const moteur = creerEntreprise({
    ENTREPRISE: B.ENTREPRISE, VOCAB: B.VOCAB, CATALOGUE: B.CATALOGUE, SUPPLIERS: B.SUPPLIERS,
    SUP_BY_ID: B.SUP_BY_ID, CUSTOMERS: B.CUSTOMERS, CM: B.CM, baseDeDepart: B.baseDeDepart, THEME: B.THEME,
    etapes: [], exercice: 'Essai', transportSection: 'Tournées', transportId: 'essai-carte',
    plan: { libelle: 'Plan de Nîmes', titre: 'Situer les nouveaux clients', carte: CARTE },
    tournee: {
      libelle: 'Tournée', titre: 'Tournée sur la carte réelle',
      mesures: [{ id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: B.VELO.chargeUtile }],
      horaire: { depart: B.VELO.depart, limite: B.VELO.train, vitesse: B.VELO.vitesse, service: B.VELO.service },
      departAQuai: true, extremitesACliquer: true,
    },
  });
  const hote = document.createElement('div'); hote.id = 'ct-hote'; document.body.appendChild(hote);
  const db = (window.__ct && window.__ct.garder) ? window.__ct.db : {};
  let sauvegardes = 0;
  moteur.rendre(hote, {
    meta: { id: 'essai-carte', code: 'ESSAI', titre: 'Boost — essai', portee: 'eleve', immersif: true, jeuId: 'essai-carte' },
    profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => { sauvegardes++; } }, enregistrer: () => {}, quitter: () => {}, codeStock: '',
  });
  window.__ct = { db, CARTE, sauvegardes: () => sauvegardes };
  hote.querySelector('.ent-nav[data-vue="plan"]').click();
}, css || '');
const etatCt = () => pageCt.evaluate(() => JSON.parse(JSON.stringify(
  (window.__ct.db.transport && window.__ct.db.transport['essai-carte'] && window.__ct.db.transport['essai-carte'].plan) || {})));
const bulleCt = () => pageCt.textContent('[data-ct-bulle]');
// Fixé le 02/10 (chantier A) : les délais fixes (650 ms pour un zoom, 60 ms pour la bulle)
// suffisaient ici mais pas sur le poste de Tristan — six cas tombaient sous Windows, et tombent
// pareil ici avec le processeur ralenti ×8 (`LENT=8 node outils/test.mjs carte`). On attend
// maintenant que la page soit IMMOBILE (défilement fini ET zoom fini : la `viewBox` ne bouge
// plus), et que la bulle ait répondu, au lieu de compter des millisecondes.
const zoomCt = async (k) => { await pageCt.click(`[data-ct-zoom="${k}"]`); await immobileCt(); };
// Un point de la carte (mètres) → un clic à l'écran, au pixel près.
//
// Deux précautions, trouvées par un test qui passait une fois sur deux : le moteur fait défiler
// la page en DOUX (`scrollIntoView`) à chaque changement de vue, donc on attend que le
// défilement soit fini avant de lire la position ; et on vide la bulle avant de cliquer, pour
// qu'un message resté du clic d'avant ne fasse pas passer un clic perdu pour une réponse.
// Immobile = ni la page ni la carte ne bougent pendant 5 images de suite : `scrollY` (le défilement
// doux) et la `viewBox` du SVG (le zoom animé). Un délai fixe ne vaut que pour un poste rapide.
const immobileCt = () => pageCt.evaluate(() => new Promise((ok) => {
  let y = null, n = 0;
  const f = () => {
    const s = document.querySelector('[data-ct-svg]');
    const cle = window.scrollY + '|' + (s ? s.getAttribute('viewBox') : '');
    if (cle === y) n++; else { n = 0; y = cle; }
    if (n >= 5) ok(); else requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}));
const scrollFiniCt = immobileCt;
// Un point de la tournée (client ou bout de chaîne), cliqué une fois la page immobile.
const pointCt = async (sel) => { await scrollFiniCt(); await pageCt.click(sel, { force: true }); };
const cliquerCt = async (pt) => {
  await scrollFiniCt();
  await pageCt.evaluate(() => { document.querySelector('[data-ct-bulle]').textContent = ''; });
  // Le point doit être DANS la fenêtre : un clic de souris hors de l'écran ne touche rien (la
  // bulle reste vide). Si le défilement doux s'est arrêté ailleurs, on amène le point au milieu,
  // sans animation, et on recalcule.
  const ecranDe = () => pageCt.evaluate(({ x, y }) => {
    const svg = document.querySelector('[data-ct-svg]');
    const p = svg.createSVGPoint(); p.x = x; p.y = y;
    const e = p.matrixTransform(svg.getScreenCTM());
    return { x: e.x, y: e.y, h: innerHeight };
  }, pt);
  let ecran = await ecranDe();
  if (ecran.y < 20 || ecran.y > ecran.h - 20) {
    await pageCt.evaluate((dy) => window.scrollBy({ top: dy, behavior: 'instant' }), ecran.y - ecran.h / 2);
    await immobileCt();
    ecran = await ecranDe();
  }
  await pageCt.mouse.click(ecran.x, ecran.y);
  // Chaque clic sur la carte, client armé, répond dans la bulle : on attend la réponse (sans
  // échouer ici si elle ne vient pas — c'est au cas de juger le texte, ou son absence).
  await pageCt.waitForFunction(() => document.querySelector('[data-ct-bulle]').textContent !== '', null, { timeout: 4000 }).catch(() => {});
};
// Un point SÛR d'une rue : le milieu de son plus long segment visible dans le zoom, dont on
// vérifie avec la fonction de la vue que c'est bien CETTE rue qu'il désigne (pas un carrefour).
const pointDeRue = (nom, k) => pageCt.evaluate(async ({ nom, k }) => {
  const { segments, rueSous } = await import('/core/types/carte.js');
  const C = window.__ct.CARTE;
  const RUES = Object.entries(C.rues).map(([n, d]) => ({ n, s: segments(d) }));
  const [x0, y0, w, h] = C.quartiers[k].vb;
  const segs = segments(C.rues[nom]).map(([a, b]) => ({ x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, L: Math.hypot(b[0] - a[0], b[1] - a[1]) }))
    .filter((p) => p.x > x0 + w * 0.08 && p.x < x0 + w * 0.92 && p.y > y0 + h * 0.12 && p.y < y0 + h * 0.92)
    .sort((a, b) => b.L - a.L);
  const bon = segs.find((p) => { const r = rueSous(RUES, p, 30); return r && r.n === nom; });
  return bon ? { x: bon.x, y: bon.y } : null;
}, { nom, k });

// Deux jeux de données, construits par le même script : la page d'essai (`boost-carte.js`) et la
// journée d'ENT-3.2 (`boost-ent32-carte.js`). Les mêmes règles tiennent pour les deux.
for (const module of ['/contenus/boost-carte.js', '/contenus/boost-ent32-carte.js']) await v(`carte : les données (${module.split('/').pop()}) — chaque nouveau client est sur sa rue, dans sa case et dans l’index`, async () => {
  await monterCt();
  const r = await pageCt.evaluate(async (module) => {
    const { segments, caseCarte, creerCarte } = await import('/core/types/carte.js');
    const { CARTE: C } = await import(module); const pb = [];
    try { creerCarte({ carte: C }); } catch (e) { pb.push('refusé par la vue : ' + e.message); }
    const dist = (p, [a, b]) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
      const t = L ? Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / L)) : 0;
      return Math.hypot(p.x - a[0] - t * dx, p.y - a[1] - t * dy); };
    const nouveaux = C.clients.filter((c) => c.nouveau);
    if (nouveaux.length < 2 || C.clients.length - nouveaux.length < 2) pb.push('il faut des nouveaux ET des habituels');
    for (const c of C.clients) {
      if (caseCarte(C, c) !== c.case) pb.push(`${c.nom} : case ${caseCarte(C, c)} ≠ ${c.case}`);
      if (!c.nouveau) continue;
      // Sa rue est LA PLUS PROCHE de son point BAN, pas seulement « à moins de 45 m » : à un angle,
      // la rue d'à côté peut passer à 30 m, et c'est elle que l'élève verrait sous le point.
      const d = Math.min(...segments(C.rues[c.rue] || '').map((s) => dist(c, s)));
      const proche = Object.entries(C.rues).map(([n, dd]) => [n, Math.min(...segments(dd).map((s) => dist(c, s)))])
        .sort((x, y) => x[1] - y[1])[0];
      if (!(d < 45)) pb.push(`${c.nom} à ${Math.round(d)} m de la ${c.rue}`);
      if (proche[0] !== c.rue) pb.push(`${c.nom} : la rue la plus proche est ${proche[0]} (${Math.round(proche[1])} m), pas la ${c.rue}`);
      const e = C.index.find((x) => x.n === c.rue);
      if (!e) pb.push(`${c.rue} absente de l’index`);
      else if (!e.q.includes(c.quartier) || !e.c.includes(c.case)) pb.push(`index faux pour ${c.rue} : ${e.q} ${e.c}`);
    }
    if (C.index.length < 100) pb.push('index trop court : ' + C.index.length);
    return pb;
  }, module);
  if (r.length) throw new Error(r.join(' | '));
});

await v('carte : à l’ouverture, les habituels sont posés, les nouveaux attendent, sans mode hors connexion', async () => {
  const r = await pageCt.evaluate(() => ({
    pins: document.querySelectorAll('[data-pins] .ct-mk-client').length,
    fiches: document.querySelectorAll('[data-ct-client]').length,
    index: document.querySelectorAll('[data-ct-index] li').length,
    horsCo: !!document.querySelector('[data-hors-connexion]'),
    menu: document.querySelector('.ent-nav[data-vue="plan"]')?.textContent.trim(),
  }));
  if (r.pins !== 4) throw new Error(`${r.pins} points au départ au lieu des 4 habituels`);
  if (r.fiches !== 3) throw new Error(`${r.fiches} fiches à situer au lieu de 3`);
  if (r.index < 100) throw new Error('index affiché : ' + r.index);
  if (r.horsCo) throw new Error('le mode hors connexion est proposé alors que la carte n’a pas besoin du réseau');
  if (r.menu !== 'Plan de Nîmes') throw new Error('entrée de menu : ' + r.menu);
});

await v('carte : l’index cherche sans accents et ouvre le quartier de la rue', async () => {
  await pageCt.fill('[data-ct-cherche]', 'madeleine');
  const l = await pageCt.$$eval('[data-ct-index] li', (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  if (!l.some((t) => /Rue de la Madeleine/.test(t) && /Écusson · D2/.test(t))) throw new Error('index : ' + l.join(' | '));
  await pageCt.fill('[data-ct-cherche]', 'ecusson');
  // « ecusson » ne doit trouver que des NOMS de rues, pas le nom du quartier écrit à côté.
  const l2 = await pageCt.$$eval('[data-ct-index] li', (e) => e.length);
  await pageCt.fill('[data-ct-cherche]', 'l’aspic');
  if (!/Aspic/.test(await pageCt.textContent('[data-ct-index]'))) throw new Error('l’apostrophe typographique ne trouve pas la rue de l’Aspic');
  await pageCt.fill('[data-ct-cherche]', 'madeleine');
  await pageCt.click('[data-ct-index] li[data-ct-rue="Rue de la Madeleine"]');
  await immobileCt();
  const vue = await pageCt.evaluate(() => ({ zoom: document.querySelector('[data-ct-svg]').classList.contains('ct-zoom'),
    etiq: document.querySelector('.ct-etiq.vue')?.dataset.etiq }));
  if (!vue.zoom || vue.etiq !== 'ecusson') throw new Error('le clic dans l’index n’ouvre pas l’Écusson : ' + JSON.stringify(vue));
  if (l2 > 3) throw new Error(`« ecusson » trouve ${l2} rues : la recherche lit autre chose que le nom`);
});

// La règle du 02/10 (le « ous » de la rue Rousselier) : un nom n'est posé que s'il se lit
// entier. Mesuré sur le RENDU, nom par nom, dans chaque zoom, avec la police du poste puis
// une police nettement plus large que celle de la mesure. La marge du build (15 %) absorbe
// une police un peu plus large à elle seule ; il faut donc dépasser cette marge pour que le
// garde-fou `ajusterEtiquettes` soit réellement mis à l'épreuve — et vérifier qu'il a agi.
for (const [essai, css] of [['police normale', ''], ['police bien plus large, garde-fou en action', '.ct-etiq text{letter-spacing:.16em}']]) {
  await v(`carte : tous les noms de rues se lisent entiers dans chaque zoom (${essai})`, async () => {
    await monterCt(css);
    const quartiers = await pageCt.evaluate(() => Object.keys(window.__ct.CARTE.quartiers));
    const pb = []; let reduits = 0;
    for (const k of quartiers) {
      await zoomCt(k);
      const r = await pageCt.evaluate((k) => {
        const g = document.querySelector(`.ct-etiq[data-etiq="${k}"]`);
        const L = [...g.querySelectorAll('text')].map((t) => {
          const p = document.querySelector(t.firstChild.getAttribute('href'));
          return { n: t.textContent, texte: t.getComputedTextLength(), chemin: p.getTotalLength(),
            rendus: t.getNumberOfChars() };
        });
        const clients = window.__ct.CARTE.clients.filter((c) => c.nouveau && c.quartier === k).map((c) => c.rue);
        const fs = window.__ct.CARTE.quartiers[k].fs;
        const tailles = [...g.querySelectorAll('text')].filter((t) => t.style.fontSize).map((t) => ({ n: t.textContent, r: parseFloat(t.style.fontSize) / fs }));
        return { L, clients, reduits: tailles.length, tailles };
      }, k);
      if (r.L.length < 15) pb.push(`${k} : ${r.L.length} noms seulement`);
      r.L.filter((e) => e.texte > e.chemin + 0.5).forEach((e) => pb.push(`${k} : « ${e.n} » coupé (${Math.round(e.texte)} > ${Math.round(e.chemin)})`));
      r.clients.filter((n) => !r.L.some((e) => e.n === n)).forEach((n) => pb.push(`${k} : la ${n} n’a pas de nom`));
      reduits += r.reduits;
      // Réduire n'est pas une échappatoire : avec la police de mesure, AUCUN nom ne doit avoir
      // besoin du garde-fou (sinon le build a mal calculé sa place), et même avec une police
      // bien plus large, un nom réduit doit rester lisible — au moins 75 % de sa taille.
      if (!css && r.reduits) pb.push(`${k} : ${r.reduits} nom(s) réduits avec la police de mesure (${r.tailles[0].n})`);
      r.tailles.filter((t) => t.r < 0.75).forEach((t) => pb.push(`${k} : « ${t.n} » réduit à ${Math.round(t.r * 100)} %`));
    }
    if (css && !reduits) pb.push('aucun nom réduit : le cas ne met pas le garde-fou à l’épreuve');
    if (pb.length) throw new Error(pb.slice(0, 4).join(' | '));
  });
}

// En vue d'ensemble, client armé : un clic DANS un quartier l'ouvre (c'est le geste attendu),
// un clic ailleurs — ici sur l'avenue de la Boulangerie Roux, hors des quartiers dessinés — est
// refusé avec un message. Ni l'un ni l'autre ne pose de point ni ne compte d'essai.
await v('carte : en vue d’ensemble, un clic ne pose rien et ne compte pas (il ouvre le quartier)', async () => {
  await monterCt();
  await pageCt.click('[data-ct-arme="c1"]');
  const hors = await pageCt.evaluate(() => window.__ct.CARTE.clients.find((c) => c.id === 'c5'));
  await cliquerCt(hors);
  if (!/Ouvrez d’abord le bon quartier : les noms de rues/.test(await bulleCt())) throw new Error('bulle : ' + await bulleCt());
  const dedans = await pageCt.evaluate(() => window.__ct.CARTE.clients.find((c) => c.id === 'c1'));
  await cliquerCt(dedans);
  await immobileCt();
  const vue = await pageCt.evaluate(() => document.querySelector('.ct-etiq.vue')?.dataset.etiq);
  if (vue !== 'ecusson') throw new Error('le clic dans l’Écusson ne l’ouvre pas : ' + vue);
  const e = await etatCt();
  if (Object.keys(e.places || {}).length || Object.keys(e.essais || {}).length) throw new Error('état touché : ' + JSON.stringify(e));
  await pageCt.click('[data-ct-ensemble]'); await immobileCt();
});

await v('carte : un clic sur une autre rue est refusé, nommé, et compté comme essai', async () => {
  await zoomCt('ecusson');
  const pt = await pointDeRue('Rue Nationale', 'ecusson');
  if (!pt) throw new Error('aucun point sûr sur la rue Nationale');
  await cliquerCt(pt);
  const b = await bulleCt();
  if (!/Ici c’est : Rue Nationale\. Cherchez la rue de la Madeleine\./.test(b)) throw new Error('bulle : ' + b);
  const e = await etatCt();
  if ((e.essais || {}).c1 !== 1 || (e.places || {}).c1) throw new Error('état : ' + JSON.stringify(e));
  if (!/1 clic sur une autre rue/.test(await pageCt.textContent('[data-ct-client="c1"]'))) throw new Error('l’essai n’est pas affiché');
  if (await pageCt.$$eval('[data-pins] .ct-mk-client', (x) => x.length) !== 4) throw new Error('un point a été posé');
});

await v('carte : un clic sur les maisons demande une rue, sans compter d’essai', async () => {
  const pt = await pageCt.evaluate(async () => {
    const { segments, rueSous } = await import('/core/types/carte.js');
    const C = window.__ct.CARTE;
    const RUES = Object.entries(C.rues).map(([n, d]) => ({ n, s: segments(d) }));
    const [x0, y0, w, h] = C.quartiers.ecusson.vb;
    for (let i = 0.3; i < 0.8; i += 0.02) for (let j = 0.3; j < 0.8; j += 0.02) {
      const p = { x: x0 + w * i, y: y0 + h * j };
      if (!rueSous(RUES, p, 30)) return p;
    }
    return null;
  });
  if (!pt) throw new Error('aucun îlot sans rue trouvé');
  await cliquerCt(pt);
  if (!/Cliquez sur une rue/.test(await bulleCt())) throw new Error('bulle : ' + await bulleCt());
  if ((await etatCt()).essais.c1 !== 1) throw new Error('le clic sur les maisons a compté un essai');
});

await v('carte : un clic sur la bonne rue pose le point au numéro (BAN), pas là où l’on a cliqué', async () => {
  const pt = await pointDeRue('Rue de la Madeleine', 'ecusson');
  await cliquerCt(pt);
  const r = await pageCt.evaluate(() => {
    const c = window.__ct.CARTE.clients.find((x) => x.id === 'c1');
    const g = [...document.querySelectorAll('[data-pins] .ct-mk-client')].find((m) => /^1\./.test(m.querySelector('title').textContent));
    return { c: { x: c.x, y: c.y }, g: g && { x: +g.dataset.x, y: +g.dataset.y }, n: document.querySelectorAll('[data-pins] .ct-mk-client').length };
  });
  if (!r.g || r.n !== 5) throw new Error('point non posé : ' + JSON.stringify(r));
  if (Math.hypot(r.g.x - r.c.x, r.g.y - r.c.y) > 0.01) throw new Error('posé ailleurs qu’au numéro : ' + JSON.stringify(r));
  if (Math.hypot(pt.x - r.c.x, pt.y - r.c.y) < 5) throw new Error('le test a cliqué sur le numéro lui-même : il ne prouve pas l’aimant');
  const e = await etatCt();
  if (!e.places.c1 || e.essais.c1 !== 1 || e.valide) throw new Error('état : ' + JSON.stringify(e));
  if (!/1 clic sur une autre rue/.test(await pageCt.textContent('[data-ct-client="c1"]'))) throw new Error('le suivi de l’essai a disparu');
  if (!(await pageCt.evaluate(() => window.__ct.sauvegardes()))) throw new Error('rien n’a été sauvé');
});

await v('carte : la tournée reste fermée tant qu’un nouveau client manque, puis s’ouvre', async () => {
  const ouvre = () => pageCt.evaluate(async () => {
    const { creerCarte } = await import('/core/types/carte.js');
    const v = creerCarte({ carte: window.__ct.CARTE });
    const e = window.__ct.db.transport['essai-carte'].plan;
    return { ouvre: v.ouvreSuite(e), bilan: v.bilan(e) };
  });
  if ((await ouvre()).ouvre) throw new Error('la suite s’ouvre avec un seul client situé');
  await pageCt.click('[data-ct-arme="c2"]');
  await cliquerCt(await pointDeRue("Rue de l'Aspic", 'ecusson'));
  await zoomCt('fontaine');
  await pageCt.click('[data-ct-arme="c3"]');
  await cliquerCt(await pointDeRue('Rue Rousselier', 'fontaine'));
  const r = await ouvre();
  if (!r.ouvre) throw new Error('la suite reste fermée : ' + JSON.stringify(r.bilan));
  if (r.bilan.places !== 3 || r.bilan.essais !== 1 || r.bilan.premierCoup !== 2) throw new Error('bilan : ' + JSON.stringify(r.bilan));
  if (!(await etatCt()).valide) throw new Error('`valide` non horodaté');
  if (!/Les 7 clients sont sur la carte/.test(await pageCt.textContent('[data-ct-bilan]'))) throw new Error('bilan affiché : ' + await pageCt.textContent('[data-ct-bilan]'));
  // Le retour à l'ensemble part 1,4 s après le dernier point : on l'attend (5 s au plus), puis
  // la fin de son animation, pour que le cas suivant ne clique pas pendant le dézoom.
  await pageCt.waitForFunction(() => !document.querySelector('[data-ct-svg]').classList.contains('ct-zoom'), null, { timeout: 5000 }).catch(() => {});
  if (await pageCt.evaluate(() => document.querySelector('[data-ct-svg]').classList.contains('ct-zoom'))) throw new Error('pas de retour à la vue d’ensemble');
  await immobileCt();
});

await v('carte : le travail survit à un redessin de la page et à un remontage sur la même base', async () => {
  await pageCt.click('.ent-nav[data-vue="accueil"]');
  await pageCt.click('.ent-nav[data-vue="plan"]');
  if (await pageCt.$$eval('[data-pins] .ct-mk-client', (x) => x.length) !== 7) throw new Error('points perdus au redessin');
  await pageCt.evaluate(() => { window.__ct.garder = true; });
  await monterCt();
  const r = await pageCt.evaluate(() => ({ n: document.querySelectorAll('[data-pins] .ct-mk-client').length,
    t: document.querySelector('[data-ct-client="c1"]').textContent.replace(/\s+/g, ' ') }));
  await pageCt.evaluate(() => { window.__ct.garder = false; });
  if (r.n !== 7 || !/Situé/.test(r.t) || !/1 clic sur une autre rue/.test(r.t)) throw new Error('après remontage : ' + JSON.stringify(r));
});

await v('carte : un contenu dont un nouveau client n’a pas de rue nommée est refusé à la construction', async () => {
  const r = await pageCt.evaluate(async () => {
    const { creerCarte } = await import('/core/types/carte.js');
    const C = window.__ct.CARTE;
    const essais = [
      C.clients.map((c) => (c.id === 'c1' ? Object.assign({}, c, { rue: 'Rue Imaginaire' }) : c)),
      C.clients.map((c) => (c.id === 'c4' ? Object.assign({}, c, { nouveau: true, rue: 'Rue Pierre Semard', quartier: 'ecusson' }) : c)),
    ];
    return essais.map((clients) => { try { creerCarte({ carte: C, clients }); return 'accepté'; } catch (e) { return e.message; } });
  });
  if (!/n'est pas sur la carte/.test(r[0])) throw new Error('rue inexistante : ' + r[0]);
  if (!/n'a pas son nom dans le zoom/.test(r[1])) throw new Error('rue sans nom : ' + r[1]);
});

await v('carte : ENT-3.1 garde son plan schématique (aucune carte réelle déclarée)', async () => {
  const r = await pageCt.evaluate(async () => { const S = await import('/contenus/boost-tournee.js'); return { carte: !!S.PLAN.carte, cases: !!(S.PLAN.reperage && S.PLAN.reperage.champ) }; });
  if (r.carte || !r.cases) throw new Error(JSON.stringify(r));
});

await v('carte : le calage d’ENT-3.2 tient (un seul client à quai, train minoritaire, créneau qui change l’ordre)', async () => {
  const { execFileSync } = await import('node:child_process');
  try { execFileSync(process.execPath, [path.join(ROOT, 'outils', 'carte', 'calibrer.mjs')], { stdio: 'pipe' }); }
  catch (e) { throw new Error(String(e.stderr || e.message).trim().split('\n').slice(-2).join(' ')); }
});

/* ---- la tournée sur la carte réelle (étape 2) : km par les rues, tracé le long des rues ---- */

await v('carte : chaque itinéraire part de son point, arrive au suivant, et n’est pas plus court qu’à vol d’oiseau', async () => {
  const pb = await pageCt.evaluate(async () => {
    const { segments } = await import('/core/types/carte.js');
    const C = window.__ct.CARTE; const pb = [];
    const pts = Object.fromEntries([...C.clients.map((c) => [c.id, c]), ['depart', C.depart], ['arrivee', C.arrivee]]);
    const ids = Object.keys(pts);
    for (const a of ids) for (const b of ids) {
      if (a === b) continue;
      const t = C.trajets[`${a}|${b}`];
      if (!t) { pb.push(`${a}→${b} manquant`); continue; }
      const sg = segments(t.d);
      const L = sg.reduce((s, [p, q]) => s + Math.hypot(q[0] - p[0], q[1] - p[1]), 0);
      const [d0] = sg[0], d1 = sg[sg.length - 1][1];
      const vol = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
      if (Math.hypot(d0[0] - pts[a].x, d0[1] - pts[a].y) > 2) pb.push(`${a}→${b} ne part pas de ${a}`);
      if (Math.hypot(d1[0] - pts[b].x, d1[1] - pts[b].y) > 2) pb.push(`${a}→${b} n’arrive pas à ${b}`);
      if (t.m < vol - 1) pb.push(`${a}→${b} : ${t.m} m < ${Math.round(vol)} m à vol d’oiseau`);
      if (Math.abs(L - t.m) > Math.max(15, t.m * 0.03)) pb.push(`${a}→${b} : tracé de ${Math.round(L)} m pour ${t.m} m annoncés`);
    }
    return pb;
  });
  if (pb.length) throw new Error(pb.slice(0, 4).join(' | '));
});

await v('carte : la tournée compte les km PAR LES RUES, dans le sens du trajet', async () => {
  await monterCt();
  await pageCt.evaluate(() => { const t = window.__ct.db.transport['essai-carte'].plan; Object.assign(t, { places: { c1: 1, c2: 1, c3: 1 }, valide: 1 }); });
  await pageCt.click('.ent-nav[data-vue="tournee"]');
  await pageCt.waitForSelector('[data-clic-point="c5"]');
  for (const sel of ['[data-clic-extremite="depart"]', '[data-clic-point="c5"]', '[data-clic-point="c3"]', '[data-clic-point="c1"]', '[data-clic-extremite="arrivee"]']) {
    await pointCt(sel);
  }
  const r = await pageCt.evaluate(async () => {
    const { creerTournee } = await import('/core/types/tournee.js');
    const B = await import('/contenus/boost.js');
    const C = window.__ct.CARTE;
    const t = window.__ct.db.transport['essai-carte'].tournee;
    const vue = creerTournee({ plan: { carte: C }, mesures: [], horaire: { depart: 780, limite: 970, vitesse: 12, service: 6 }, extremitesACliquer: true });
    const b = vue.bilan(Object.assign({ ordre: [], quai: [], report: {}, juge: {} }, t));
    const pts = Object.fromEntries([...C.clients.map((c) => [c.id, c]), ['depart', C.depart], ['arrivee', C.arrivee]]);
    const ch = ['depart', ...t.ordre, 'arrivee'];
    let rues = 0, envers = 0, vol = 0;
    for (let i = 1; i < ch.length; i++) {
      rues += C.trajets[`${ch[i - 1]}|${ch[i]}`].m; envers += C.trajets[`${ch[i]}|${ch[i - 1]}`].m;
      vol += Math.hypot(pts[ch[i]].x - pts[ch[i - 1]].x, pts[ch[i]].y - pts[ch[i - 1]].y);
    }
    return { ordre: t.ordre, km: b.km, rues: rues / 1000, envers: envers / 1000, vol: vol / 1000 };
  });
  if (r.ordre.join() !== 'c5,c3,c1') throw new Error('ordre construit au clic : ' + r.ordre.join());
  if (Math.abs(r.km - r.rues) > 1e-9) throw new Error(`${r.km} km comptés, ${r.rues} km par les rues`);
  if (Math.abs(r.rues - r.envers) < 0.001) throw new Error('le parcours choisi ne distingue pas les sens : le test ne prouve rien');
  if (r.km < r.vol * 1.05) throw new Error(`${r.km} km : c’est presque le vol d’oiseau (${r.vol})`);
});

await v('carte : le tracé suit les rues, dans l’ordre choisi, et suit les changements', async () => {
  const lire = () => pageCt.evaluate(() => {
    const C = window.__ct.CARTE; const t = window.__ct.db.transport['essai-carte'].tournee;
    const ch = [...(t.depart ? ['depart'] : []), ...t.ordre, ...(t.arrivee ? ['arrivee'] : [])];
    const attendu = ch.slice(1).map((b, i) => C.trajets[`${ch[i]}|${b}`].d).join('');
    return { d: document.querySelector('[data-ct-trace]').getAttribute('d'), attendu, n: ch.length };
  });
  let r = await lire();
  if (!r.d || r.d !== r.attendu) throw new Error('tracé différent des itinéraires de la table');
  if ((r.d.match(/M/g) || []).length !== r.n - 1) throw new Error('un morceau par trajet attendu');
  if ((r.d.match(/l/g) || []).length < 40) throw new Error('le tracé a trop peu de sommets pour suivre des rues');
  await pointCt('[data-clic-point="c3"]');      // retiré de la tournée
  r = await lire();
  if (r.d !== r.attendu || r.n !== 4) throw new Error('le tracé ne suit pas le retrait d’un arrêt');
  await pointCt('[data-clic-extremite="depart"]');
  await pointCt('[data-clic-extremite="arrivee"]');
  await pointCt('[data-clic-point="c5"]');
  await pointCt('[data-clic-point="c1"]');
  r = await lire();
  if (r.d !== '') throw new Error('il reste un tracé alors que rien n’est posé : ' + r.d.slice(0, 40));
});

await v('carte : la tournée garde le zoom d’un clic à l’autre, et le clic marche zoomé', async () => {
  // Une tournée vide, posée à la main : ce cas ne dépend pas de ce qu'ont laissé les précédents.
  await pageCt.evaluate(() => {
    const t = window.__ct.db.transport['essai-carte'].tournee;
    Object.assign(t, { ordre: [], quai: window.__ct.CARTE.clients.map((c) => c.id), depart: null, arrivee: null });
  });
  await pageCt.click('.ent-nav[data-vue="accueil"]'); await pageCt.click('.ent-nav[data-vue="tournee"]');
  await pageCt.click('[data-ct-zoom="ecusson"]'); await immobileCt();
  await pointCt('[data-clic-point="c1"]');
  await pointCt('[data-clic-point="c2"]');
  const r = await pageCt.evaluate(() => ({ zoom: document.querySelector('[data-ct-svg]').classList.contains('ct-zoom'),
    vue: document.querySelector('.ct-etiq.vue')?.dataset.etiq, ordre: window.__ct.db.transport['essai-carte'].tournee.ordre.join(),
    rangs: [...document.querySelectorAll('[data-rang]')].map((g) => g.dataset.point + ':' + g.dataset.rang).join() }));
  if (!r.zoom || r.vue !== 'ecusson') throw new Error('zoom perdu au redessin : ' + JSON.stringify(r));
  if (r.ordre !== 'c1,c2' || r.rangs !== 'c1:1,c2:2') throw new Error(JSON.stringify(r));
});

await v('tournée : « Recommencer la tournée » arme d’abord, puis remet tout à quai, bouts compris', async () => {
  // Le bouton vit dans la colonne collante des contraintes : on le déclenche par le DOM, ce cas
  // juge le comportement, pas la mise en page.
  const razCt = () => pageCt.$eval('[data-tour-raz]', (b) => b.click());
  const etatT = () => pageCt.evaluate(() => JSON.parse(JSON.stringify(window.__ct.db.transport['essai-carte'].tournee)));
  // Le cas précédent a laissé la carte zoomée sur l'Écusson : on revient à l'ensemble, sinon les
  // points des autres quartiers sont hors de l'écran.
  await pageCt.click('[data-ct-ensemble]'); await immobileCt();
  for (const sel of ['[data-clic-extremite="depart"]', '[data-clic-point="c5"]', '[data-clic-point="c3"]', '[data-clic-extremite="arrivee"]']) await pointCt(sel);
  const avant = await etatT();
  if (avant.ordre.length < 3 || !avant.depart || !avant.arrivee) throw new Error('tournée de départ mal construite : ' + JSON.stringify(avant));
  await razCt();
  if (!/confirmer/i.test(await pageCt.textContent('[data-tour-raz]'))) throw new Error('le premier clic n’arme pas le bouton');
  if ((await etatT()).ordre.join() !== avant.ordre.join()) throw new Error('le premier clic a déjà effacé la tournée');
  await pageCt.$eval('[data-tour-raz-non]', (b) => b.click());
  if (/confirmer/i.test(await pageCt.textContent('[data-tour-raz]'))) throw new Error('« Annuler » ne désarme pas');
  await razCt(); await razCt();
  const apres = await etatT();
  const tous = await pageCt.evaluate(() => window.__ct.CARTE.clients.map((c) => c.id).sort().join());
  if (apres.ordre.length || apres.depart || apres.arrivee) throw new Error('il reste quelque chose : ' + JSON.stringify(apres));
  if ([...apres.quai].sort().join() !== tous) throw new Error('tout n’est pas à quai : ' + apres.quai.join());
  if (await pageCt.getAttribute('[data-ct-trace]', 'd')) throw new Error('le tracé est resté');
  if (!(await pageCt.$eval('[data-tour-raz]', (b) => b.disabled))) throw new Error('le bouton reste actif sur une tournée vide');
});

/* ---- le créneau de livraison (ENT-3.2) : heure d'arrivée par client, créneau raté ---- */
/* La journée d'ENT-3.2 (`boost-ent32-carte.js`) : la Pâtisserie Arnaud (c6) n'accepte      */
/* qu'avant 14 h 45. Deux tournées de référence, tirées de la fiche du 02/10 :              */
/*   - celle de Tristan à l'essai, c7 c1 c2 c6 c8 c3 c4 : gare à 16 h 05 (train pris),     */
/*     pâtisserie à 15 h 07 — créneau raté de 22 min ;                                     */
/*   - la meilleure qui tient tout, c6 c7 c8 c3 c4 c1 c2.                                  */
const ORDRE_RATE = ['c7', 'c1', 'c2', 'c6', 'c8', 'c3', 'c4'];
const ORDRE_BON = ['c6', 'c7', 'c8', 'c3', 'c4', 'c1', 'c2'];

// Le bilan de la VRAIE vue, sur la journée d'ENT-3.2, pour un ordre donné (bouts posés).
const bilanCr = (ordre, extra) => pageCt.evaluate(async ({ ordre, extra }) => {
  const { creerTournee, hhmm } = await import('/core/types/tournee.js');
  const B = await import('/contenus/boost.js');
  const { CARTE: C } = await import('/contenus/boost-ent32-carte.js');
  const vue = creerTournee(Object.assign({ plan: { carte: C },
    mesures: [{ id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: B.VELO.chargeUtile }],
    horaire: { depart: 14 * 60 + 10, limite: B.VELO.train, vitesse: B.VELO.vitesse, service: B.VELO.service },
    extremitesACliquer: true }, extra || {}));
  const tous = C.clients.map((c) => c.id);
  const b = vue.bilan({ ordre, quai: tous.filter((x) => !ordre.includes(x)), depart: 1, arrivee: 1, report: {}, juge: {} });
  return { arrivees: b.arrivees, creneaux: b.creneaux, rates: b.creneauxRates, rate: b.creneauRate,
    enRetard: b.enRetard, gare: b.arrivee == null ? null : hhmm(b.arrivee), c6: b.arrivees.c6 == null ? null : hhmm(b.arrivees.c6) };
}, { ordre, extra });

await v('créneau : l’heure d’arrivée chez chaque client = trajets par les rues + service des arrêts PRÉCÉDENTS', async () => {
  // L'attendu est recalculé ici, à la main, depuis la table des itinéraires — pas lu dans la vue.
  const attendu = await pageCt.evaluate(async (ordre) => {
    const { CARTE: C } = await import('/contenus/boost-ent32-carte.js');
    const B = await import('/contenus/boost.js');
    const ch = ['depart', ...ordre]; let m = 0; const a = {};
    for (let i = 1; i < ch.length; i++) {
      m += C.trajets[`${ch[i - 1]}|${ch[i]}`].m;
      a[ch[i]] = 14 * 60 + 10 + m / 1000 / B.VELO.vitesse * 60 + (i - 1) * B.VELO.service;
    }
    return a;
  }, ORDRE_RATE);
  const r = await bilanCr(ORDRE_RATE);
  for (const id of ORDRE_RATE) {
    if (r.arrivees[id] == null || Math.abs(r.arrivees[id] - attendu[id]) > 1e-9) {
      throw new Error(`${id} : arrivée ${r.arrivees[id]} pour ${attendu[id]} attendues`);
    }
  }
  if (r.c6 !== '15 h 07') throw new Error('pâtisserie à ' + r.c6 + ' (15 h 07 attendu, fiche du 02/10)');
  if (r.gare !== '16 h 05' || r.enRetard) throw new Error(`gare à ${r.gare}, train ${r.enRetard ? 'manqué' : 'pris'} (16 h 05, pris, attendu)`);
  if (!r.rate || r.rates.join() !== 'c6') throw new Error('créneau non vu comme raté : ' + JSON.stringify(r.creneaux));
  const c = r.creneaux.find((x) => x.id === 'c6');
  if (!c || c.avant !== 885 || !c.charge || !/14 h 45/.test(c.libelle)) throw new Error('créneau mal lu dans les données : ' + JSON.stringify(c));
  const bon = await bilanCr(ORDRE_BON);
  if (bon.rate || bon.enRetard) throw new Error('la meilleure tournée est refusée : ' + JSON.stringify(bon.creneaux));
});

await v('créneau : à quai, un client n’est pas « en retard » ; sans horaire, aucun créneau n’est jugé', async () => {
  // La pâtisserie à quai : elle n'est pas livrée aujourd'hui, ce n'est pas un retard.
  const quai = await bilanCr(['c7', 'c1', 'c2', 'c8', 'c3', 'c4']);
  const c = quai.creneaux.find((x) => x.id === 'c6');
  if (!c || c.charge || c.rate || quai.rate || c.arrivee != null) throw new Error('client à quai jugé : ' + JSON.stringify(c));
  const sansHoraire = await bilanCr(ORDRE_RATE, { horaire: null });
  if (sansHoraire.rate || Object.keys(sansHoraire.arrivees).length) throw new Error('un créneau est jugé sans horaire : ' + JSON.stringify(sansHoraire.creneaux));
});

await v('créneau : le moteur et le calage comptent les mêmes ordres (train, puis train ET créneau)', async () => {
  // `calibrer.mjs` a calé la journée avec SA formule. La vue doit tomber sur les mêmes nombres :
  // sinon un ordre « juste » pour le calage serait refusé à l'élève, ou l'inverse.
  const { execFileSync } = await import('node:child_process');
  const sortie = execFileSync(process.execPath, [path.join(ROOT, 'outils', 'carte', 'calibrer.mjs')], { encoding: 'utf8' });
  const m = sortie.match(/(\d+) ordres de passage : (\d+) attrapent le train .*?, (\d+) tiennent aussi le créneau/);
  if (!m) throw new Error('sortie du calage illisible : ' + sortie.slice(0, 200));
  const r = await pageCt.evaluate(async () => {
    const { creerTournee } = await import('/core/types/tournee.js');
    const B = await import('/contenus/boost.js');
    const { CARTE: C } = await import('/contenus/boost-ent32-carte.js');
    const vue = creerTournee({ plan: { carte: C }, mesures: [],
      horaire: { depart: 14 * 60 + 10, limite: B.VELO.train, vitesse: B.VELO.vitesse, service: B.VELO.service },
      extremitesACliquer: true });
    const S = C.clients.filter((c) => c.id !== 'c5').map((c) => c.id);
    function* perms(a) { if (a.length < 2) { yield a; return; } for (let i = 0; i < a.length; i++) for (const p of perms([...a.slice(0, i), ...a.slice(i + 1)])) yield [a[i], ...p]; }
    let n = 0, train = 0, tout = 0;
    for (const p of perms(S)) {
      n++;
      const b = vue.bilan({ ordre: p, quai: ['c5'], depart: 1, arrivee: 1, report: {}, juge: {} });
      if (!b.enRetard) { train++; if (!b.creneauRate) tout++; }
    }
    return { n, train, tout };
  });
  if (`${r.n} ${r.train} ${r.tout}` !== `${m[1]} ${m[2]} ${m[3]}`) {
    throw new Error(`moteur : ${r.n} ordres, ${r.train} au train, ${r.tout} tiennent tout ; calage : ${m[1]}, ${m[2]}, ${m[3]}`);
  }
});

// La vue montée sur la journée d'ENT-3.2, repérage déjà fait, tournée posée par l'état.
const monterCr = (opts, ordre) => pageCt.evaluate(async ({ opts, ordre }) => {
  document.getElementById('cr-hote')?.remove();
  document.getElementById('ct-hote')?.remove();
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const B = await import('/contenus/boost.js');
  const { CARTE } = await import('/contenus/boost-ent32-carte.js');
  const moteur = creerEntreprise({
    ENTREPRISE: B.ENTREPRISE, VOCAB: B.VOCAB, CATALOGUE: B.CATALOGUE, SUPPLIERS: B.SUPPLIERS,
    SUP_BY_ID: B.SUP_BY_ID, CUSTOMERS: B.CUSTOMERS, CM: B.CM, baseDeDepart: B.baseDeDepart, THEME: B.THEME,
    etapes: [], exercice: 'Essai', transportSection: 'Tournées', transportId: 'essai-cr',
    plan: { libelle: 'Plan de Nîmes', titre: 'Situer les nouveaux clients', carte: CARTE },
    tournee: Object.assign({
      libelle: 'Tournée', titre: 'Tournée ENT-3.2',
      mesures: [{ id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: B.VELO.chargeUtile }],
      horaire: { depart: 14 * 60 + 10, limite: B.VELO.train, vitesse: B.VELO.vitesse, service: B.VELO.service, libelleLimite: 'départ du train' },
      departAQuai: true, extremitesACliquer: true, exigeConforme: true,
      report: [{ id: 'rkm', libelle: 'Distance', unite: 'km', tolerance: 0.05, valeur: (b) => b.km }],
    }, opts),
  });
  const tous = CARTE.clients.map((c) => c.id);
  const db = { transport: { 'essai-cr': {
    plan: { places: Object.fromEntries(CARTE.clients.filter((c) => c.nouveau).map((c) => [c.id, 1])), essais: {}, valide: 1 },
    tournee: { ordre, quai: tous.filter((x) => !ordre.includes(x)), depart: 1, arrivee: 1, report: {}, juge: {}, valide: null },
  } } };
  const hote = document.createElement('div'); hote.id = 'cr-hote'; document.body.appendChild(hote);
  moteur.rendre(hote, {
    meta: { id: 'essai-cr', code: 'ESSAI', titre: 'Boost — créneau', portee: 'eleve', immersif: true, jeuId: 'essai-cr' },
    profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: '',
  });
  window.__cr = { db };
  hote.querySelector('.ent-nav[data-vue="tournee"]').click();
}, { opts: opts || {}, ordre });
const texteCr = () => pageCt.textContent('#cr-hote .ent-main');
const jaugeCr = () => pageCt.$eval('#cr-hote [data-creneau="c6"]', (e) => ({ txt: e.textContent.replace(/\s+/g, ' '), trop: e.classList.contains('trop') }));
const validerCr = async (km) => {
  if (km != null) await pageCt.fill('#cr-hote [data-report="rkm"]', km);
  await pageCt.$eval('#cr-hote [data-tour-valider]', (b) => b.click());
  await pageCt.waitForTimeout(120);
};

await v('créneau : la jauge parlante donne l’arrivée et le retard, et le report est refusé tant que le créneau est raté', async () => {
  await monterCr({}, ORDRE_RATE);
  await pageCt.waitForSelector('#cr-hote [data-creneau="c6"]');
  let j = await jaugeCr();
  if (!j.trop || !/Créneau raté de 22 min/.test(j.txt) || !/15 h 07/.test(j.txt)) throw new Error('jauge : ' + j.txt);
  if (!/livraison avant 14 h 45/.test(await pageCt.textContent('#cr-hote #tourListe'))) throw new Error('le créneau ne se lit pas sur la ligne du client');
  await validerCr();
  let t = await texteCr();
  if (!/ne tient pas encore/.test(t) || !/créneau raté chez Pâtisserie Arnaud \(22 min de retard\)/.test(t)) throw new Error('report non refusé : ' + t.slice(-400));
  if (/train manqué/.test(t)) throw new Error('le train est donné pour manqué alors qu’il est pris');
  const juge = await pageCt.evaluate(() => window.__cr.db.transport['essai-cr'].tournee.juge);
  if (Object.keys(juge).length) throw new Error('les cases ont été jugées malgré le refus');
  // La bonne tournée : la jauge passe au vert et le report est accepté.
  await monterCr({}, ORDRE_BON);
  await pageCt.waitForSelector('#cr-hote [data-creneau="c6"]');
  j = await jaugeCr();
  if (j.trop || !/créneau tenu/.test(j.txt)) throw new Error('jauge de la bonne tournée : ' + j.txt);
  const km = await pageCt.evaluate(async (o) => {
    const { CARTE: C } = await import('/contenus/boost-ent32-carte.js');
    const ch = ['depart', ...o, 'arrivee']; let m = 0;
    for (let i = 1; i < ch.length; i++) m += C.trajets[`${ch[i - 1]}|${ch[i]}`].m;
    return (m / 1000).toFixed(2).replace('.', ',');
  }, ORDRE_BON);
  await validerCr(km);
  t = await texteCr();
  if (/ne tient pas encore/.test(t) || !/Tous les résultats sont justes/.test(t)) throw new Error('la bonne tournée est refusée : ' + t.slice(-400));
});

await v('créneau : jauges muettes — « créneau raté », sans l’heure d’arrivée ni le retard, au refus comme à l’écran', async () => {
  await monterCr({ jaugesRepere: true }, ORDRE_RATE);
  await pageCt.waitForSelector('#cr-hote [data-creneau="c6"]');
  const j = await jaugeCr();
  if (!j.trop || !/Créneau raté/.test(j.txt)) throw new Error('la jauge muette ne dit pas que le créneau est raté : ' + j.txt);
  if (/raté de|\d+ min|15 h 07/.test(j.txt)) throw new Error('la jauge muette donne le retard ou l’arrivée : ' + j.txt);
  if (!/14 h 45/.test(j.txt)) throw new Error('la limite du créneau n’est plus donnée : ' + j.txt);
  await validerCr();
  const t = await texteCr();
  if (!/ne tient pas encore/.test(t) || !/créneau raté chez Pâtisserie Arnaud/.test(t)) throw new Error('report non refusé : ' + t.slice(-400));
  if (/de retard|15 h 07|raté de/.test(t)) throw new Error('la page muette donne le retard ou l’arrivée : ' + t.slice(-400));
  await pageCt.evaluate(() => document.getElementById('cr-hote')?.remove());
});

await v('carte : aucune erreur, aucune requête hors du site', async () => {
  if (erreursCt.length) throw new Error([...new Set(erreursCt)].slice(0, 3).join(' | '));
  if (hotesCt.size) throw new Error('requête extérieure : ' + [...hotesCt].join(', '));
});
await ctxCt.close();

}
