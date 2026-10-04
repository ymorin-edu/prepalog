// Suite de tests de Prepalog — bloc « planning » : la vue « Planning » (core/types/planning.js),
// brief `docs/briefs/MOTEUR-vue-planning.md` §10 (04/10/2026).
//
// `node outils/test.mjs planning` ne lance que ce bloc. Il n'a besoin d'aucun autre : il monte
// l'environnement d'entreprise à la main, dans un contexte de navigateur à lui, sur les trois cas de
// la maquette v8 (`contenus/planning-essai.js`, univers d'essai `outils/essai-planning.js`).
//
// Les solutions et les valeurs attendues sont écrites À LA MAIN ici (jamais relues dans le contenu).
// Elles viennent de la recherche exhaustive de Cowork (04/10), recontrôlée contre le moteur :
//   Quai, 1er envoi : A Quai 1 06:00 Léa · B Quai 2 06:30 Mathis · C Quai 1 07:30 Léa · D Quai 2 08:00 Karim ·
//     E Quai 1 09:00 Léa · F Quai 1 10:00 Léa. Après l'aléa (D arrive à 09:00) : D Quai 1 09:00 Léa,
//     E Quai 2 09:00 Karim, F Quai 1 10:15 Léa. Le 1er envoi ne tient plus (fenêtre et attente).
//   Personnel, 1er envoi : Mathis mar 8, Inès jeu 10, Chloé lun 14, Karim lun 7 (décalé), Léa mer 16.
//     Après l'aléa : Chloé jeu 17 (décalé), arrêt d'Inès lun 14. 8 solutions avant, aucune ne survit, 5 après.
//   Chauffeurs, 1er envoi : E1 Sofiane 07:00 Semi 1 · E3 Marc 07:00 Porteur 3 · E2 Julie 08:00 Semi 2 ·
//     pause Julie 11:30 · pause Sofiane 11:00 · E4 Sofiane 11:45 Semi 1 · E5 Julie 12:15 Porteur 3.
//     Après l'aléa (Semi 2 à l'atelier jusqu'à 12:00) : E1 Julie 06:00 Semi 1 · E3 Marc 07:00 Porteur 3 ·
//     pause Julie 10:00 · E2 Sofiane 10:00 Semi 1 · E4 Julie 12:00 Semi 2 · pause Sofiane 13:30 · E5 Sofiane
//     14:15 Porteur 3. Le 1er envoi ne tient plus (camions).
// Créneaux : quai = quarts d'heure depuis 06:00 (07:30 → 6) ; chauffeurs = depuis 05:00 (07:00 → 8) ;
// personnel = jours (lun 7 → 0 … ven 18 → 9).

export default async function bloc({ v, nav }) {

const egal = (a, b, quoi) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${quoi} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`); };
const vrai = (c, quoi) => { if (!c) throw new Error(quoi); };

const ctxP = await nav.newContext({ viewport: { width: 1366, height: 1000 } });
const erreursP = [];
async function nouvellePage() {
  const p = await ctxP.newPage();
  p.setDefaultTimeout(6000);
  p.on('pageerror', (e) => erreursP.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursP.push('CONSOLE: ' + m.text()); });
  await p.goto('http://127.0.0.1:8099/');
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  return p;
}
const pg = await nouvellePage();

// Monte l'environnement sur un cas d'essai. `garder` : la base est rangée dans le stockage du navigateur
// à chaque sauvegarde (recharger = la retrouver). `sans` : le cas privé d'une règle (sabotage du moteur).
const monter = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-planning.js');
  const C = await import('/contenus/planning-essai.js');
  document.querySelector('#plTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'plTest'; document.body.appendChild(hote);
  const temps = o.temps || 'guidage';
  const U = E.univers({ cas: o.cas, temps, planning: C.CAS[o.cas] });
  const CLE = 'essai-planning-base';
  const db = o.garder ? JSON.parse(localStorage.getItem(CLE) || '{}') : {};
  const moteur = creerEntreprise(U);
  window.__p = { db, moteur, remis: null };
  moteur.rendre(hote, {
    meta: { id: o.seance || 'essai-planning', code: 'ESSAI', titre: 'Essai du planning', portee: 'eleve', immersif: true, temps, copie: temps === 'evaluation' },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => { if (o.garder) localStorage.setItem(CLE, JSON.stringify(db)); } },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
    rendreCopie: async (res) => { window.__p.remis = res; return { rendu: Date.now() }; },
  });
  document.querySelector('#plTest .ent-nav[data-vue="planning"]').click();
}, o);

const Z = '#plTest .ent-main';
const ID = { quai: 'essai-quais', perso: 'essai-personnel', chauf: 'essai-chauffeurs' };
const etat = (p, cas) => p.evaluate((id) => JSON.parse(JSON.stringify(((window.__p.db.plannings) || {})[id] || null)), ID[cas]);
const texte = async (p, sel) => ((await p.textContent(sel)) || '').replace(/\s+/g, ' ').trim();
const problemes = (p) => p.$$eval(`${Z} [data-pl-problemes] li`, (L) => L.map((x) => x.textContent.trim()));
const present = async (p, sel) => !!(await p.$(`${Z} ${sel}`));
const pastilles = (p) => p.$$eval(`${Z} .pl-pastille`, (L) => L.map((x) => x.dataset.ok === 'true'));

// Poser une carte par clic-clic (carte, puis case), puis choisir la seconde ressource dans la bulle.
// La case est cliquée de force (un bloc peut la couvrir : c'est lui qui reçoit le clic et pose la carte
// en main) : on la centre d'abord, sinon le bandeau collant de l'environnement peut la recouvrir.
async function clicCase(p, r, t) {
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
  await p.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await p.click(sel, { force: true });
}
async function poser(p, id, r, t, k) {
  await p.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
  await clicCase(p, r, t);
  if (!k) return;
  if (await present(p, '.pl-bulle')) { await p.click(`${Z} .pl-bulle [data-pl-choix="${k}"]`); return; }
  // Carte déjà affectée (déplacée) : on change son affectation seulement si elle diffère.
  const actuel = await p.evaluate((id2) => {
    for (const e of Object.values(window.__p.db.plannings || {})) if (e.place[id2]) return e.place[id2].k || null;
    return null;
  }, id);
  if (actuel === k) return;
  await p.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"] [data-pl-act="bulle"]`);
  await p.click(`${Z} .pl-bulle [data-pl-choix="${k}"]`);
}
async function envoyer(p) {
  await p.click(`${Z} [data-pl="envoyer"]`);
  if (await present(p, '[data-pl="quandMeme"]')) await p.click(`${Z} [data-pl="quandMeme"]`);
}

const QUAI1 = [['A', 'Q1', 0, 'lea'], ['B', 'Q2', 2, 'mathis'], ['C', 'Q1', 6, 'lea'], ['D', 'Q2', 8, 'karim'], ['E', 'Q1', 12, 'lea'], ['F', 'Q1', 16, 'lea']];
const QUAI2 = [['F', 'Q1', 17, 'lea'], ['E', 'Q2', 12, 'karim'], ['D', 'Q1', 12, 'lea']];
const PERSO1 = [['form-mathis', 'mathis', 1], ['visite-ines', 'ines', 3], ['cp-chloe', 'chloe', 5], ['cp-karim', 'karim', 0], ['cp-lea', 'lea', 7]];
const PERSO2 = [['cp-chloe', 'chloe', 8], ['am-ines', 'ines', 5]];
const CHAUF1 = [['E1', 'sofiane', 8, 's1'], ['E3', 'marc', 8, 'p3'], ['E2', 'julie', 12, 's2'], ['pause-1', 'julie', 26], ['pause-2', 'sofiane', 24],
  ['E4', 'sofiane', 27, 's1'], ['E5', 'julie', 29, 'p3']];
// Après l'aléa : on retire tout, puis on repose (l'ordre évite les cases occupées).
const CHAUF2 = [['E1', 'julie', 4, 's1'], ['E3', 'marc', 8, 'p3'], ['pause-1', 'julie', 20], ['E2', 'sofiane', 20, 's1'], ['E4', 'julie', 28, 's2'],
  ['pause-2', 'sofiane', 34], ['E5', 'sofiane', 37, 'p3']];
const poserTout = async (p, L) => { for (const [id, r, t, k] of L) await poser(p, id, r, t, k); };

/* =========================================================== montage */
await v('Planning : la vue s’ouvre par son entrée de menu, sans erreur, dans les trois cas', async () => {
  for (const [cas, lib, nb] of [['quai', 'Planning des quais', 6], ['perso', 'Planning des absences', 5], ['chauf', 'Planning des chauffeurs', 9]]) {
    await monter(pg, { cas });
    egal(await texte(pg, '#plTest .ent-nav[data-vue="planning"]'), lib, `entrée de menu (${cas})`);
    egal((await pg.$$(`${Z} [data-pl-bac] [data-pl-id]`)).length, nb, `cartes (${cas})`);
  }
  egal(erreursP, [], 'erreurs JS');
});

await v('Planning : sans `planning` déclaré, aucune entrée de menu en plus', async () => {
  await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-planning.js');
    const U = E.univers({ cas: 'quai' }); delete U.planning; delete U.volet;
    document.querySelector('#plTest')?.remove();
    const hote = document.createElement('div'); hote.id = 'plTest'; document.body.appendChild(hote);
    creerEntreprise(U).rendre(hote, { meta: { id: 'x', portee: 'eleve' }, profil: { prenom: 'A', role: 'eleve' },
      jeu: { etat: () => ({}), sauver: () => {} }, enregistrer: () => {}, quitter: () => {} });
  });
  vrai(!(await pg.$('#plTest .ent-nav[data-vue="planning"]')), 'entrée Planning présente');
  vrai(!!(await pg.$('#plTest .ent-nav[data-vue="stock"]')), 'le reste du menu manque');
});

/* =========================================================== parcours justes */
await v('Planning quai : parcours juste par clic-clic et bulle → 10 / 10, l’aléa arrive par la messagerie', async () => {
  await monter(pg, { cas: 'quai' });
  await poserTout(pg, QUAI1);
  egal(await problemes(pg), [], 'problèmes signalés sur la solution');
  vrai(await present(pg, '.pl-ok'), '« Aucun problème » absent');
  await envoyer(pg);
  const e = await etat(pg, 'quai');
  egal(e.phase, 2, 'phase après le 1er envoi');
  egal(e.v1.place.D, { r: 'Q2', s: 8, k: 'karim' }, 'version 1 figée');
  egal(e.place.D, { r: 'Q2', s: 8, k: 'karim' }, 'planning de l’élève conservé tel quel');
  vrai((await texte(pg, `${Z} [data-pl-message]`)).includes('col de la Savine'), 'message de l’aléa absent du panneau');
  const mails = await pg.evaluate(() => window.__p.db.mails.filter((m) => m.declenche === 'alea').length);
  egal(mails, 1, 'mail de l’aléa');
  vrai((await texte(pg, `${Z} [data-pl-id="D"][data-pl-vue="b"]`)).includes('Arrivée 09:00 (nouvelle heure)'), 'carte D pas mise à jour');
  vrai((await texte(pg, `${Z} .pl-droite`)).includes('Planning à reprendre'), 'titre « Planning à reprendre » absent');
  // Le 1er envoi ne tient plus : en direct (guidage), les problèmes de D apparaissent.
  const P = await problemes(pg);
  vrai(P.some((x) => x === "Camion D : le chargement commence avant l'arrivée du camion."), `fenêtre de D non signalée : ${P}`);
  await poserTout(pg, QUAI2);
  egal(await problemes(pg), [], 'problèmes après la reprise');
  vrai((await texte(pg, `${Z} [data-pl="envoyer"]`)) === 'Envoyer le planning corrigé', 'libellé du 2e envoi');
  await envoyer(pg);
  egal(await pastilles(pg), Array(10).fill(true), 'bilan');
  vrai((await texte(pg, `${Z} .pl h3`)).includes('Bilan — 10 / 10 jalons'), 'titre du bilan');
});

await v('Planning personnel : parcours juste (ligne imposée, « décalé »), nouvelle carte et nouvelle ligne à l’aléa → 10 / 10', async () => {
  await monter(pg, { cas: 'perso' });
  // Lâchée sur une autre ligne, la carte va sur celle de la personne.
  for (const [id, , t] of PERSO1) await poser(pg, id, 'karim', t);
  const e = await etat(pg, 'perso');
  egal(Object.fromEntries(Object.entries(e.place).map(([k, x]) => [k, [x.r, x.s]])),
    { 'form-mathis': ['mathis', 1], 'visite-ines': ['ines', 3], 'cp-chloe': ['chloe', 5], 'cp-karim': ['karim', 0], 'cp-lea': ['lea', 7] }, 'lignes imposées');
  vrai((await texte(pg, `${Z} [data-pl-id="cp-karim"][data-pl-vue="b"] .pl-etat`)).startsWith('Posé : lun 7 (décalé)'), 'congé de Karim pas « décalé »');
  vrai(!(await texte(pg, `${Z} [data-pl-id="cp-lea"][data-pl-vue="b"] .pl-etat`)).includes('décalé'), 'congé de Léa dit « décalé »');
  egal(await problemes(pg), [], 'problèmes sur la solution');
  await envoyer(pg);
  vrai(await present(pg, '[data-pl-id="am-ines"][data-pl-vue="b"]'), 'nouvelle carte absente');
  vrai((await texte(pg, `${Z} [data-pl-id="am-ines"][data-pl-vue="b"]`)).includes('(nouveau)'), 'nouvelle carte pas signalée');
  vrai(await present(pg, '[data-pl-case][data-r="noa"][data-t="6"]'), 'ligne de Noa absente');
  vrai((await texte(pg, `${Z} [data-pl-case][data-r="noa"][data-t="5"]`)) === 'pas là', 'Noa présente avant son arrivée');
  for (const [id, r, t] of PERSO2) await poser(pg, id, r, t);
  egal(await problemes(pg), [], 'problèmes après la reprise');
  await envoyer(pg);
  egal(await pastilles(pg), Array(10).fill(true), 'bilan');
});

await v('Planning chauffeurs : parcours juste (cartes Pause, camions) → 10 / 10 ; le Semi n° 2 à l’atelier fait tomber le 1er envoi', async () => {
  await monter(pg, { cas: 'chauf' });
  await poserTout(pg, CHAUF1);
  egal(await problemes(pg), [], 'problèmes sur la solution');
  await envoyer(pg);
  const P = await problemes(pg);
  egal(P, ["E2 : le Semi n° 2 est à l'atelier jusqu'à 12:00."], 'après l’aléa');
  vrai((await texte(pg, `${Z} .pl-gauche`)).includes("à l'atelier jusqu'à 12:00"), 'atelier pas dit dans les informations');
  vrai(await present(pg, '[data-pl-lecture] .pl-case.pl-hors'), 'hachures de l’atelier absentes');
  for (const id of ['E1', 'E2', 'E3', 'E4', 'E5', 'pause-1', 'pause-2']) {
    await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"] [data-pl-act="retirer"]`);
  }
  await poserTout(pg, CHAUF2);
  egal(await problemes(pg), [], 'problèmes après la reprise');
  await envoyer(pg);
  egal(await pastilles(pg), Array(10).fill(true), 'bilan');
});

await v('Planning : jalons recontrôlés — 1er envoi juste gardé tel quel après l’aléa = 8, 5, 9 / 10 ; inaction = 0', async () => {
  const r = await pg.evaluate(async () => {
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const C = await import('/contenus/planning-essai.js');
    const n = (P, v1, v2) => jalonsPlanning({ plannings: { [P.id]: { v1: { place: v1 }, v2: { place: v2 } } } }, P).ok;
    const quai1 = { A: { r: 'Q1', s: 0, k: 'lea' }, B: { r: 'Q2', s: 2, k: 'mathis' }, C: { r: 'Q1', s: 6, k: 'lea' }, D: { r: 'Q2', s: 8, k: 'karim' }, E: { r: 'Q1', s: 12, k: 'lea' }, F: { r: 'Q1', s: 16, k: 'lea' } };
    const perso1 = { 'form-mathis': { r: 'mathis', s: 1 }, 'visite-ines': { r: 'ines', s: 3 }, 'cp-chloe': { r: 'chloe', s: 5 }, 'cp-karim': { r: 'karim', s: 0 }, 'cp-lea': { r: 'lea', s: 7 } };
    const ch1 = { E1: { r: 'sofiane', s: 8, k: 's1' }, E3: { r: 'marc', s: 8, k: 'p3' }, E2: { r: 'julie', s: 12, k: 's2' }, 'pause-1': { r: 'julie', s: 26 }, 'pause-2': { r: 'sofiane', s: 24 }, E4: { r: 'sofiane', s: 27, k: 's1' }, E5: { r: 'julie', s: 29, k: 'p3' } };
    return [n(C.QUAI, quai1, quai1), n(C.PERSO, perso1, perso1), n(C.CHAUF, ch1, ch1), n(C.QUAI, {}, {}), n(C.PERSO, {}, {}), n(C.CHAUF, {}, {})];
  });
  egal(r, [8, 5, 9, 0, 0, 0], 'jalons');
});

await v('Planning personnel : recherche exhaustive — 8 solutions avant l’aléa, aucune ne survit, 5 après', async () => {
  const r = await pg.evaluate(async () => {
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const { PERSO } = await import('/contenus/planning-essai.js');
    // Positions possibles d'une absence de L jours, sans passer le week-end (deux semaines de 5 jours).
    const pos = (L) => { const o = []; for (let s = 0; s + L <= 10; s++) if (Math.floor(s / 5) === Math.floor((s + L - 1) / 5)) o.push(s); return o; };
    const A = [['form-mathis', 'mathis', 2], ['visite-ines', 'ines', 1], ['cp-chloe', 'chloe', 2], ['cp-karim', 'karim', 1], ['cp-lea', 'lea', 3]];
    const sols = (cartes, ver) => {
      const out = [];
      const rec = (i, place) => {
        if (i === cartes.length) {
          if (jalonsPlanning({ plannings: { [PERSO.id]: { [ver]: { place } } } }, PERSO).L.filter((l) => l.id.startsWith(ver)).every((l) => l.ok)) out.push(place);
          return;
        }
        const [id, r, L] = cartes[i];
        for (const s of pos(L)) rec(i + 1, Object.assign({}, place, { [id]: { r, s } }));
      };
      rec(0, {});
      return out;
    };
    const avant = sols(A, 'v1');
    const apres = sols(A.concat([['am-ines', 'ines', 3]]), 'v2');
    const survivent = avant.filter((pl) => jalonsPlanning({ plannings: { [PERSO.id]: { v2: { place: Object.assign({}, pl, { 'am-ines': { r: 'ines', s: 5 } }) } } } }, PERSO)
      .L.filter((l) => l.id.startsWith('v2')).every((l) => l.ok)).length;
    return [avant.length, survivent, apres.length];
  });
  egal(r, [8, 0, 5], 'avant / survivent / après');
});

/* =========================================================== inaction */
await v('Planning : envoyer deux fois sans rien poser → 0 / 10 dans les trois cas (l’aléa arrive quand même)', async () => {
  for (const cas of ['quai', 'perso', 'chauf']) {
    await monter(pg, { cas });
    await envoyer(pg);
    egal((await etat(pg, cas)).phase, 2, `aléa après un 1er envoi vide (${cas})`);
    await envoyer(pg);
    egal(await pastilles(pg), Array(10).fill(false), `bilan (${cas})`);
  }
});

/* =========================================================== pièges de la maquette */
await v('Planning quai (guidage) : A avec Karim, C avec Mathis, semi sur le quai 3 — signalés en direct, blocs fautifs sans aplat', async () => {
  await monter(pg, { cas: 'quai' });
  await poser(pg, 'A', 'Q1', 0, 'karim');
  egal(await problemes(pg), ['Camions sans quai : B, C, D, E, F.', "Karim ne travaille pas à l'heure du chargement du camion A."], 'A avec Karim');
  const st = await pg.$eval(`${Z} [data-pl-id="A"][data-pl-vue="g"]`, (b) => { const s = getComputedStyle(b); return [b.classList.contains('pl-bloc-faux'), s.borderTopStyle]; });
  egal(st, [true, 'dashed'], 'bloc fautif');
  vrai(await present(pg, '[data-pl-lect="A"].pl-bloc-faux'), 'journée des caristes : bloc A pas fautif');
  vrai(await present(pg, '[data-pl-id="A"][data-pl-vue="b"] .pl-faux-t'), 'carte A : Karim pas en rouge');
  await poser(pg, 'C', 'Q2', 4, 'mathis');
  vrai((await problemes(pg)).includes("Mathis n'a pas le CACES : il ne peut pas charger la semi-remorque C."), 'C avec Mathis');
  await poser(pg, 'D', 'Q3', 8, 'karim');
  vrai((await problemes(pg)).includes("Quai 3 : le camion D est une semi-remorque, ce quai n'a pas de niveleur."), 'semi sur le quai 3');
  // Guidage : envoyer avec des problèmes demande une confirmation.
  await pg.click(`${Z} [data-pl="envoyer"]`);
  vrai((await texte(pg, `${Z} .pl-confirme`)).includes('Il reste des problèmes.'), 'pas de confirmation');
  egal((await etat(pg, 'quai')).v1, null, 'envoyé sans confirmation');
});

await v('Planning personnel (guidage) : Karim et Léa le mer 16 — « pas assez de monde », compteur Présents en rouge', async () => {
  await monter(pg, { cas: 'perso' });
  await poser(pg, 'cp-karim', 'karim', 7);
  await poser(pg, 'cp-lea', 'lea', 7);
  vrai((await problemes(pg)).includes('mer 16 : pas assez de monde présent.'), 'mer 16 non signalé');
  vrai(await present(pg, '[data-pl-compte="presents"][data-t="7"].pl-compte-faux'), 'compteur Présents du mer 16 pas en rouge');
  egal(await texte(pg, `${Z} [data-pl-compte="presents"][data-t="7"]`), '4', 'présents le mer 16');
  egal(await texte(pg, `${Z} [data-pl-compte="besoin"][data-t="7"]`), '5', 'besoin le mer 16');
  egal(await texte(pg, `${Z} [data-pl-compte="filtre"][data-t="0"]`), '2', 'caristes CACES le lun 7 (Yanis pas arrivé)');
  // Une absence ne passe pas le week-end : lâchée sur le ven 11, celle de Léa (3 jours) revient au mer 9.
  await poser(pg, 'cp-lea', 'lea', 4);
  egal((await etat(pg, 'perso')).place['cp-lea'].s, 2, 'absence de Léa calée dans sa semaine');
});

await v('Planning chauffeurs (guidage) : permis C sur une semi, mauvais type de camion, double emploi, repos de Nadia, 4 h 30, 9 h', async () => {
  await monter(pg, { cas: 'chauf' });
  await poser(pg, 'E1', 'marc', 8, 'p3');
  let P = await problemes(pg);
  vrai(P.includes('Marc a le permis C : il ne peut pas conduire la semi-remorque de E1.'), `permis : ${P}`);
  vrai(P.includes('E1 demande un semi : le Porteur n° 3 ne convient pas.'), `type : ${P}`);
  await poser(pg, 'E3', 'marc', 12, 'p3');
  P = await problemes(pg);
  vrai(P.includes('Marc a deux choses en même temps (E1 et E3).'), `chauffeur : ${P}`);
  vrai(P.includes('Le Porteur n° 3 fait E1 et E3 en même temps.'), `camion : ${P}`);
  await poser(pg, 'E2', 'nadia', 12, 's2');
  vrai((await problemes(pg)).includes("Nadia n'a pas eu ses 11 h de repos depuis hier soir."), 'repos de Nadia');
  // Guidage : la reprise est hachurée et dite dans les informations.
  vrai(await present(pg, '[data-pl-grille] [data-pl-case][data-r="nadia"][data-t="19"].pl-hors'), 'repos de Nadia pas hachuré');
  vrai(!(await present(pg, '[data-pl-grille] [data-pl-case][data-r="nadia"][data-t="20"].pl-hors')), 'Nadia hachurée après 10:00');
  vrai((await texte(pg, `${Z} .pl-gauche`)).includes('départ possible dès 10:00'), 'reprise pas dite');
  await monter(pg, { cas: 'chauf' });
  await poser(pg, 'E1', 'sofiane', 8, 's1');
  await poser(pg, 'E4', 'sofiane', 24, 's2');
  vrai((await problemes(pg)).includes('Sofiane conduit plus de 4 h 30 sans pause.'), '4 h 30');
  vrai((await texte(pg, `${Z} [data-pl-grille] .pl-res`)).includes('conduite 7 h 00 / 9 h'), 'compteur de conduite');
  await monter(pg, { cas: 'chauf' });
  await poserTout(pg, [['E1', 'julie', 4, 's1'], ['pause-1', 'julie', 20], ['E2', 'julie', 23, 's2'], ['pause-2', 'julie', 37], ['E5', 'julie', 40, 'p3']]);
  vrai((await problemes(pg)).includes('Julie conduit plus de 9 h dans la journée.'), '9 h');
});

/* =========================================================== sabotages, dans les deux sens */
// Chaque jalon tombe quand on casse sa règle ; la même règle retirée du contenu, il ne tombe plus
// (un test qui ne verrait pas la règle manquante serait mal écrit). Les messages produits sont gardés
// pour le test « que, pas de combien ».
const SABOTAGES = [
  // [cas, phase, base, modifs, jalon qui doit tomber, règle cassée]
  ['quai', 1, 'Q', { B: { r: 'Q1', s: 2, k: 'mathis' } }, 'quais', 'quaiUnique'],
  ['quai', 1, 'Q', { A: { r: 'Q3', s: 0, k: 'lea' } }, 'quais', 'niveleur'],
  ['quai', 1, 'Q', { B: { r: 'Q2', s: 2, k: 'lea' } }, 'caristes', 'cariste'],
  ['quai', 1, 'Q', { A: { r: 'Q1', s: 0, k: 'karim' } }, 'caristes', 'horaires'],
  ['quai', 1, 'Q', { C: { r: 'Q1', s: 6, k: 'mathis' } }, 'caristes', 'caces'],
  ['quai', 1, 'Q', { E: { r: 'Q3', s: 10, k: 'mathis' } }, 'fenetre', 'fenetre'],
  ['quai', 1, 'Q', { F: { r: 'Q1', s: 19, k: 'lea' } }, 'attente', 'attente'],
  ['perso', 2, 'P2', { 'visite-ines': { r: 'ines', s: 5 } }, 'tous', 'chevauche'],
  ['perso', 1, 'P', { 'form-mathis': { r: 'mathis', s: 2 } }, 'imposees', 'imposee'],
  ['perso', 1, 'P', { 'cp-karim': { r: 'karim', s: 7 } }, 'effectif', 'effectif'],
  ['perso', 1, 'P', { 'cp-lea': { r: 'lea', s: 0 } }, 'caces', 'caces'],
  ['perso', 2, 'P2', { 'cp-lea': { r: 'lea', s: 6 } }, 'conges', 'sansNecessite'],
  ['chauf', 1, 'C', { E3: { r: 'sofiane', s: 12, k: 'p3' } }, 'chauffeurs', 'chauffeurUnique'],
  ['chauf', 1, 'C', { E4: { r: 'marc', s: 27, k: 's1' } }, 'chauffeurs', 'permis'],
  ['chauf', 1, 'C', { E2: { r: 'julie', s: 12, k: 's1' } }, 'camions', 'camionUnique'],
  ['chauf', 1, 'C', { E5: { r: 'julie', s: 29, k: 's2' } }, 'camions', 'typeCamion'],
  ['chauf', 2, 'C2', { E4: { r: 'julie', s: 24, k: 's2' } }, 'camions', 'atelier'],
  ['chauf', 1, 'C', { E5: { r: 'julie', s: 41, k: 'p3' } }, 'fenetre', 'fenetre'],
  ['chauf', 1, 'C', { E3: { r: 'nadia', s: 8, k: 'p3' } }, 'conduite', 'repos'],
  ['chauf', 1, 'C', { 'pause-2': null }, 'conduite', 'pause'],
  ['chauf', 1, 'C', { E2: { r: 'sofiane', s: 27, k: 's2' }, E5: { r: 'sofiane', s: 44, k: 'p3' }, 'pause-3': { r: 'sofiane', s: 41 }, E4: { r: 'nadia', s: 27, k: 's1' } }, 'conduite', 'jour'],
];
let messagesSabotages = [];
await v('Planning : sabotages — chaque jalon tombe quand sa règle est cassée, et ne tombe plus si la règle est retirée', async () => {
  const r = await pg.evaluate(async (S) => {
    const { jalonsPlanning, creerPlanning } = await import('/core/types/planning.js');
    const C = await import('/contenus/planning-essai.js');
    const BASES = {
      Q: { A: { r: 'Q1', s: 0, k: 'lea' }, B: { r: 'Q2', s: 2, k: 'mathis' }, C: { r: 'Q1', s: 6, k: 'lea' }, D: { r: 'Q2', s: 8, k: 'karim' }, E: { r: 'Q1', s: 12, k: 'lea' }, F: { r: 'Q1', s: 16, k: 'lea' } },
      P: { 'form-mathis': { r: 'mathis', s: 1 }, 'visite-ines': { r: 'ines', s: 3 }, 'cp-chloe': { r: 'chloe', s: 5 }, 'cp-karim': { r: 'karim', s: 0 }, 'cp-lea': { r: 'lea', s: 7 } },
      P2: { 'form-mathis': { r: 'mathis', s: 1 }, 'visite-ines': { r: 'ines', s: 3 }, 'cp-chloe': { r: 'chloe', s: 8 }, 'cp-karim': { r: 'karim', s: 0 }, 'cp-lea': { r: 'lea', s: 7 }, 'am-ines': { r: 'ines', s: 5 } },
      C: { E1: { r: 'sofiane', s: 8, k: 's1' }, E3: { r: 'marc', s: 8, k: 'p3' }, E2: { r: 'julie', s: 12, k: 's2' }, 'pause-1': { r: 'julie', s: 26 }, 'pause-2': { r: 'sofiane', s: 24 }, E4: { r: 'sofiane', s: 27, k: 's1' }, E5: { r: 'julie', s: 29, k: 'p3' } },
      C2: { E1: { r: 'julie', s: 4, k: 's1' }, E3: { r: 'marc', s: 8, k: 'p3' }, 'pause-1': { r: 'julie', s: 20 }, E2: { r: 'sofiane', s: 20, k: 's1' }, E4: { r: 'julie', s: 28, k: 's2' }, 'pause-2': { r: 'sofiane', s: 34 }, E5: { r: 'sofiane', s: 37, k: 'p3' } },
    };
    const sans = (P, id) => Object.assign({}, P, { regles: P.regles.filter((x) => x.id !== id), jalons: P.jalons.map((j) => Object.assign({}, j, { regles: j.regles.filter((x) => x !== id) })) });
    const out = [], messages = [];
    for (const [cas, phase, base, modifs, jalon, regle] of S) {
      const P = C.CAS[cas];
      const place = Object.assign({}, BASES[base]);
      Object.entries(modifs).forEach(([k, x]) => { if (x) place[k] = x; else delete place[k]; });
      const ver = phase === 1 ? 'v1' : 'v2';
      const lire = (Pd) => jalonsPlanning({ plannings: { [Pd.id]: { [ver]: { place } } } }, Pd).L.find((l) => l.id === `${ver}-${jalon}`).ok;
      const base0 = jalonsPlanning({ plannings: { [P.id]: { [ver]: { place: BASES[base] } } } }, P).L.find((l) => l.id === `${ver}-${jalon}`).ok;
      out.push([`${cas}/${regle}`, base0, lire(P), lire(sans(P, regle))]);
      messages.push(...creerPlanning(P).lire({ phase, place }).problemes);
    }
    return { out, messages };
  }, SABOTAGES);
  const faux = r.out.filter(([, avant, casse, sansRegle]) => !(avant === true && casse === false && sansRegle === true));
  messagesSabotages = r.messages;
  egal(faux, [], 'sabotages (règle, base juste, règle cassée → faux, règle retirée → vrai)');
});

await v('Planning : « que, pas de combien » — aucun message ne dit combien il manque ni de combien on dépasse', async () => {
  vrai(messagesSabotages.length > 25, `trop peu de messages relus (${messagesSabotages.length})`);
  // On retire ce qui a le droit de porter un chiffre : noms (E1, Quai 1, Semi n° 2), heures, jours, et
  // les règles telles que l'élève les lit (4 h 30, 9 h, 11 h, 30 min). Il ne doit rester aucun chiffre.
  const reste = messagesSabotages.map((m) => m
    .replace(/\bE\d\b/g, '').replace(/(Quai|n°) \d/g, '').replace(/\b\d\d:\d\d\b/g, '')
    .replace(/\b(lun|mar|mer|jeu|ven) \d+\b/g, '').replace(/plus de (4 h 30|9 h|30 min)/g, '').replace(/ses 11 h de repos/g, ''))
    .filter((m) => /\d/.test(m));
  egal(reste, [], 'messages qui portent encore un chiffre');
});

await v('Planning : le type `disponible` sur la ligne (arrivée d’un intérimaire) est vu, et une déclaration fautive s’arrête en clair', async () => {
  const r = await pg.evaluate(async () => {
    const { creerPlanning } = await import('/core/types/planning.js');
    const P = { id: 't-arrivee', echelle: { type: 'jours', jours: ['lun', 'mar', 'mer'] },
      lignes: { liste: [{ id: 'noa', nom: 'Noa', arrivee: 'mar' }] }, cartes: { liste: [{ id: 'cp', titre: 'Congé', jours: 1, ligne: 'noa' }] },
      regles: [{ id: 'arr', type: 'disponible', sur: 'ligne' }], jalons: [] };
    const V = creerPlanning(P);
    const a = V.lire({ phase: 1, place: { cp: { r: 'noa', s: 0 } } }).problemes;
    const b = V.lire({ phase: 1, place: { cp: { r: 'noa', s: 1 } } }).problemes;
    let err1 = '', err2 = '';
    try { creerPlanning({ id: 'x', regles: [{ id: 'r', type: 'nimporte' }] }); } catch (e) { err1 = e.message; }
    try { creerPlanning({ id: 'y', regles: [], jalons: [{ id: 'j', regles: ['absente'] }] }); } catch (e) { err2 = e.message; }
    return { a, b, err1, err2 };
  });
  egal(r.a, ["cp : Noa n'est pas disponible à ce moment-là."], 'avant l’arrivée');
  egal(r.b, [], 'après l’arrivée');
  vrai(r.err1.includes('type de règle inconnu « nimporte »'), r.err1);
  vrai(r.err2.includes('cite la règle « absente »'), r.err2);
});

/* =========================================================== temps pédagogiques */
await v('Planning entraînement : rien avant « Vérifier », liste effacée au geste suivant, aide « règles » seule, durée sans détail', async () => {
  await monter(pg, { cas: 'quai', temps: 'entrainement' });
  await poser(pg, 'A', 'Q1', 0, 'karim');
  vrai(!(await present(pg, '[data-pl-problemes]')), 'problèmes affichés avant Vérifier');
  vrai(!(await present(pg, '.pl-bloc-faux')), 'bloc fautif en entraînement');
  vrai((await texte(pg, `${Z} .pl-droite`)).includes('Cliquez sur « Vérifier mon planning »'), 'invite absente');
  egal((await pg.$$(`${Z} .pl-aide`)).length, 1, 'aides');
  vrai(!(await present(pg, '[data-pl-info]')), 'bande ambrée en entraînement');
  const carte = await texte(pg, `${Z} [data-pl-id="A"][data-pl-vue="b"]`);
  vrai(carte.includes('Chargement : 1 h 30') && !carte.includes('10 min +'), `durée : ${carte}`);
  await pg.click(`${Z} [data-pl="verifier"]`);
  vrai((await problemes(pg)).includes("Karim ne travaille pas à l'heure du chargement du camion A."), 'Vérifier ne signale pas');
  egal((await etat(pg, 'quai')).verifs, 1, 'clics sur Vérifier rangés');
  await poser(pg, 'B', 'Q2', 2, 'mathis');
  vrai(!(await present(pg, '[data-pl-problemes]')), 'liste pas effacée au geste suivant');
  // Entraînement : envoi direct, sans confirmation.
  await pg.click(`${Z} [data-pl="envoyer"]`);
  egal((await etat(pg, 'quai')).phase, 2, 'envoi direct');
});

await v('Planning évaluation : rien n’est signalé, le 2e envoi rend la copie — 10 / 10 → 20, 7 / 10 → 14, non rendue 5 / 10 → 10', async () => {
  await monter(pg, { cas: 'quai', temps: 'evaluation' });
  vrai((await texte(pg, `${Z} .pl-droite`)).includes('Évaluation : le site ne signale rien. Relisez les règles vous-même.'), 'avis d’évaluation');
  vrai(!(await present(pg, '[data-pl="verifier"]')), 'bouton Vérifier en évaluation');
  egal((await pg.$$(`${Z} .pl-aide`)).length, 1, 'aides');
  await poser(pg, 'A', 'Q1', 0, 'karim');
  vrai(!(await present(pg, '.pl-bloc-faux')) && !(await present(pg, '[data-pl-problemes]')), 'signalement en évaluation');
  await poserTout(pg, QUAI1);
  await envoyer(pg);
  // Ramassage d'une copie non rendue : la version 1 seule compte, la version 2 est fausse.
  egal(await pg.evaluate(() => window.__p.moteur.noter(window.__p.db).score), 10, 'copie non rendue');
  egal(await texte(pg, `${Z} [data-pl="envoyer"]`), 'Envoyer le planning corrigé et rendre ma copie', 'libellé');
  await poserTout(pg, QUAI2);
  await envoyer(pg);
  await pg.waitForFunction(() => window.__p.remis);
  const res = await pg.evaluate(() => window.__p.remis);
  egal([res.score, res.max], [20, 20], 'note du parcours juste');
  egal(res.detail.planning.jalons.length, 10, 'détail jalon par jalon');
  egal(res.detail.planning.envois.length, 2, 'heures des envois rangées');
  vrai((await texte(pg, `${Z} [data-pl-rendu]`)).includes('Le résultat sera donné par votre enseignant'), 'copie rendue');
  vrai(!(await present(pg, '.pl-pastille')), 'bilan montré à l’élève');
  // 7 / 10 : 1er envoi juste ; après l'aléa, C passe sur le quai 3 et D n'est pas reprise.
  await monter(pg, { cas: 'quai', temps: 'evaluation' });
  await poserTout(pg, QUAI1);
  await envoyer(pg);
  await poser(pg, 'C', 'Q3', 6, 'lea');
  await envoyer(pg);
  await pg.waitForFunction(() => window.__p.remis);
  egal(await pg.evaluate(() => window.__p.remis.score), 14, 'note 7 / 10');
});

/* =========================================================== aléa, réinitialiser, état */
await v('Planning : l’aléa n’arrive qu’une fois (rechargement), la version envoyée survit à « Réinitialiser »', async () => {
  await pg.evaluate(() => localStorage.removeItem('essai-planning-base'));
  await monter(pg, { cas: 'quai', garder: true });
  await poser(pg, 'A', 'Q1', 0, 'lea');
  await monter(pg, { cas: 'quai', garder: true });
  egal((await etat(pg, 'quai')).place.A, { r: 'Q1', s: 0, k: 'lea' }, 'état après rechargement');
  vrai(await present(pg, '[data-pl-id="A"][data-pl-vue="g"]'), 'bloc A pas redessiné');
  await envoyer(pg);
  await monter(pg, { cas: 'quai', garder: true });
  egal((await etat(pg, 'quai')).phase, 2, 'phase après rechargement');
  egal(await pg.evaluate(() => window.__p.db.mails.filter((m) => m.declenche === 'alea').length), 1, 'aléa rejoué');
  vrai(await present(pg, '[data-pl-message]'), 'message de l’aléa');
  await pg.click(`${Z} [data-pl="raz"]`);
  await pg.click(`${Z} [data-pl="razOui"]`);
  const e = await etat(pg, 'quai');
  egal(e.place, {}, 'planning en cours vidé');
  egal(e.v1.place.A, { r: 'Q1', s: 0, k: 'lea' }, 'la version envoyée reste');
  egal(e.phase, 2, 'la phase reste');
});

await v('Planning : deux séances, deux plannings dans la même base, qui ne se mélangent pas', async () => {
  await pg.evaluate(() => localStorage.removeItem('essai-planning-base'));
  await monter(pg, { cas: 'quai', garder: true, seance: 's-quai' });
  await poser(pg, 'A', 'Q1', 0, 'lea');
  await monter(pg, { cas: 'perso', garder: true, seance: 's-perso' });
  await poser(pg, 'cp-karim', 'karim', 0);
  const P = await pg.evaluate(() => JSON.parse(JSON.stringify(window.__p.db.plannings)));
  egal(Object.keys(P).sort(), ['essai-personnel', 'essai-quais'], 'clés');
  egal(P['essai-quais'].place, { A: { r: 'Q1', s: 0, k: 'lea' } }, 'planning des quais');
  egal(P['essai-personnel'].place, { 'cp-karim': { r: 'karim', s: 0 } }, 'planning du personnel');
  await pg.evaluate(() => localStorage.removeItem('essai-planning-base'));
});

/* =========================================================== bulle, clavier, souris */
await v('Planning : la bulle s’ouvre à la pose, se rouvre au clic, « Déplacer » garde le cariste, « Retirer » le retire', async () => {
  await monter(pg, { cas: 'quai' });
  await pg.click(`${Z} [data-pl-id="A"][data-pl-vue="b"]`);
  await clicCase(pg, 'Q1', 0);
  egal(await texte(pg, `${Z} .pl-bulle .pl-q`), 'Qui charge le camion A ? (semi-remorque, 06:00–07:30)', 'question de la bulle');
  egal((await pg.$$(`${Z} .pl-bulle [data-pl-choix]`)).length, 3, 'tous les caristes proposés');
  vrai((await texte(pg, `${Z} [data-pl-id="A"][data-pl-vue="g"]`)).includes('cariste ?'), '« cariste ? » absent du bloc');
  await pg.click(`${Z} .pl-bulle [data-pl-choix="lea"]`);
  vrai(!(await present(pg, '.pl-bulle')), 'bulle pas refermée');
  await pg.click(`${Z} [data-pl-id="A"][data-pl-vue="g"]`);
  egal(await pg.$eval(`${Z} .pl-bulle [data-pl-choix="lea"]`, (b) => [b.getAttribute('aria-pressed'), b.textContent.trim()]), ['true', '✓ Léa'], 'choix marqué');
  // Charte : le choix fait se voit par la forme (bordure épaisse, coche), jamais par un aplat vert.
  const fonds = await pg.$eval(`${Z} .pl-bulle [data-pl-choix="lea"]`, (b) => [getComputedStyle(b).backgroundColor, getComputedStyle(b.closest('.pl-bulle')).backgroundColor, getComputedStyle(b).borderTopWidth]);
  egal([fonds[0] === fonds[1], fonds[2]], [true, '3px'], 'bouton choisi');
  await pg.click(`${Z} .pl-bulle [data-pl-act="deplacer"]`);
  await clicCase(pg, 'Q2', 2);
  egal((await etat(pg, 'quai')).place.A, { r: 'Q2', s: 2, k: 'lea' }, 'déplacé avec son cariste');
  await pg.click(`${Z} [data-pl-id="A"][data-pl-vue="g"]`);
  await pg.click(`${Z} .pl-bulle [data-pl-act="retirer"]`);
  egal((await etat(pg, 'quai')).place.A, undefined, 'retiré');
  await pg.click(`${Z} [data-pl-id="A"][data-pl-vue="b"]`);
  await clicCase(pg, 'Q1', 0);
  egal((await etat(pg, 'quai')).place.A, { r: 'Q1', s: 0 }, 'reposé sans son ancien cariste');
  vrai(await present(pg, '.pl-bulle'), 'bulle pas rouverte à la pose');
});

await v('Planning (clavier) : quai complet sans souris (Entrée, flèches, Échap, bulle), focus gardé, puis Échap rend le focus au bloc', async () => {
  await monter(pg, { cas: 'quai' });
  const k = (t) => pg.keyboard.press(t);
  // [carte, lignes à descendre après la pose, créneaux à droite, rang du cariste dans la bulle]
  const PLAN = [['A', 0, 0, 0], ['B', 1, 0, 2], ['C', 0, 2, 0], ['D', 1, 0, 1], ['E', 0, 0, 0], ['F', 0, 0, 0]];
  for (const [id, bas, droite, rang] of PLAN) {
    await pg.focus(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
    await k('Enter'); await k('ArrowDown');
    for (let i = 0; i < bas; i++) await k('ArrowDown');
    for (let i = 0; i < droite; i++) await k('ArrowRight');
    await k('Escape');
    egal(await pg.evaluate(() => document.activeElement && [document.activeElement.dataset.plId, document.activeElement.dataset.plVue]), [id, 'g'], `focus sur le bloc ${id}`);
    await k('Enter');
    for (let i = 0; i < rang; i++) await k('Tab');
    await k('Enter');
  }
  const e = await etat(pg, 'quai');
  egal(Object.fromEntries(Object.entries(e.place).map(([c, x]) => [c, [x.r, x.s, x.k]])),
    { A: ['Q1', 0, 'lea'], B: ['Q2', 2, 'mathis'], C: ['Q1', 6, 'lea'], D: ['Q2', 8, 'karim'], E: ['Q1', 12, 'lea'], F: ['Q1', 16, 'lea'] }, 'planning au clavier');
  egal(await problemes(pg), [], 'problèmes');
  // Suppr retire ; Échap dans la bulle la ferme et rend le focus au bloc.
  await pg.focus(`${Z} [data-pl-id="F"][data-pl-vue="g"]`);
  await k('Enter');
  vrai(await present(pg, '.pl-bulle'), 'bulle pas ouverte par Entrée');
  await k('Escape');
  vrai(!(await present(pg, '.pl-bulle')), 'Échap ne ferme pas la bulle');
  egal(await pg.evaluate(() => document.activeElement.dataset.plId), 'F', 'focus rendu au bloc');
  await k(' '); await k('Delete');
  egal((await etat(pg, 'quai')).place.F, undefined, 'Suppr ne retire pas');
});

await v('Planning (souris, glisser-déposer) : carte sur une case, bloc pris par son milieu sans sauter, bloc ramené dans les cartes = retiré', async () => {
  await monter(pg, { cas: 'quai' });
  const glisser = async (src, dst, dx = null) => {
    const a = await pg.$(`${Z} ${src}`); await a.scrollIntoViewIfNeeded();
    const b = await pg.$(`${Z} ${dst}`);
    const A = await a.boundingBox(); const B = await b.boundingBox();
    await pg.mouse.move(A.x + (dx == null ? A.width / 2 : dx), A.y + A.height / 2);
    await pg.mouse.down();
    await pg.mouse.move(B.x + B.width / 2, B.y + B.height / 2, { steps: 8 });
    await pg.mouse.up();
    await pg.waitForTimeout(60);
  };
  await glisser('[data-pl-id="B"][data-pl-vue="b"]', '[data-pl-grille] [data-pl-case][data-r="Q2"][data-t="2"]');
  egal((await etat(pg, 'quai')).place.B, { r: 'Q2', s: 2 }, 'carte glissée sur 06:30');
  vrai(await present(pg, '.pl-bulle'), 'bulle pas ouverte après le glisser');
  // Le bloc B couvre 06:30–07:15 (3 cases) : pris dans sa 3e case, lâché sur 08:00 → il commence à 07:30.
  const w = await pg.$eval(`${Z} [data-pl-grille] [data-pl-case]`, (c) => c.getBoundingClientRect().width);
  await glisser('[data-pl-id="B"][data-pl-vue="g"]', '[data-pl-grille] [data-pl-case][data-r="Q2"][data-t="8"]', w * 2.5);
  egal((await etat(pg, 'quai')).place.B.s, 6, 'le bloc a gardé l’endroit où on l’a saisi');
  await glisser('[data-pl-id="B"][data-pl-vue="g"]', '[data-pl-bac]');
  egal((await etat(pg, 'quai')).place.B, undefined, 'bloc ramené dans les cartes : retiré');
});

/* =========================================================== agrandir, couleurs (04/10/2026) */
await v('Planning : « Agrandir » replie le menu et les consignes, la journée du quai tient sans défiler ; retenu au rechargement ; les autres écrans gardent leur menu', async () => {
  await pg.evaluate(() => localStorage.removeItem('essai-planning-base'));
  await monter(pg, { cas: 'quai', garder: true });
  const zone = () => pg.$eval(`${Z} .pl-zone`, (z) => [z.clientWidth, z.scrollWidth]);
  const [avant] = await zone();
  await pg.click(`${Z} [data-pl="agrandir"]`);
  vrai(await pg.$eval('#plTest .ent-shell', (s) => s.classList.contains('pl-agrandi')), 'coque pas agrandie');
  egal(await pg.$eval('#plTest .ent-side', (s) => getComputedStyle(s).display), 'none', 'menu de l’environnement');
  vrai(!(await present(pg, '.pl-gauche')), 'consignes encore là');
  const [apres, total] = await zone();
  vrai(apres > avant + 200, `la grille n'a pas gagné de place (${avant} → ${apres})`);
  vrai(total <= apres, `la journée du quai défile encore (${total} > ${apres})`);
  egal(await texte(pg, `${Z} [data-pl="agrandir"]`), '⤡ Réduire le planning', 'libellé');
  await pg.click(`${Z} [data-pl="consignes"]`);
  vrai(await present(pg, '.pl-gauche'), 'consignes pas rouvertes');
  egal(await pg.$eval('#plTest .ent-side', (s) => getComputedStyle(s).display), 'none', 'menu revenu avec les consignes');
  egal((await etat(pg, 'quai')).agrandi, true, 'choix rangé');
  // Après l'envoi, consignes repliées : le message de l'aléa reste en tête de la colonne de droite.
  await pg.click(`${Z} [data-pl="consignes"]`);
  await envoyer(pg);
  vrai(await present(pg, '.pl-droite [data-pl-message]'), 'message de l’aléa caché');
  await monter(pg, { cas: 'quai', garder: true });
  vrai(await pg.$eval('#plTest .ent-shell', (s) => s.classList.contains('pl-agrandi')), 'pas retenu au rechargement');
  // Un autre écran (ici par le menu, cliqué en script : il est replié) retrouve son menu.
  await pg.evaluate(() => document.querySelector('#plTest .ent-nav[data-vue="mail"]').click());
  vrai(!(await pg.$eval('#plTest .ent-shell', (s) => s.classList.contains('pl-agrandi'))), 'menu encore replié sur la messagerie');
  await pg.evaluate(() => document.querySelector('#plTest .ent-nav[data-vue="planning"]').click());
  await pg.click(`${Z} [data-pl="agrandir"]`);
  egal(await pg.$eval('#plTest .ent-side', (s) => getComputedStyle(s).display) !== 'none', true, '« Réduire » ne rend pas le menu');
  await pg.evaluate(() => localStorage.removeItem('essai-planning-base'));
});

await v('Planning : couleurs libres — posées sur les cartes et les blocs, refusées si illisibles, trop proches, vertes, bleues ou rouges', async () => {
  await monter(pg, { cas: 'quai' });
  await poser(pg, 'A', 'Q1', 0, 'lea');
  const fonds = await pg.evaluate(() => {
    const c = document.querySelector('#plTest [data-pl-id="A"][data-pl-vue="b"]'), b = document.querySelector('#plTest [data-pl-id="B"][data-pl-vue="b"]');
    const bl = document.querySelector('#plTest [data-pl-id="A"][data-pl-vue="g"]');
    return [getComputedStyle(b).backgroundColor, getComputedStyle(bl).backgroundColor, getComputedStyle(bl).borderLeftColor, c.style.getPropertyValue('--pl-c')];
  });
  // Thème clair : la couleur déclarée (jaune #f0be00, violet #8b5cf6) à 30 % sur le panneau.
  egal(fonds, ['rgba(139, 92, 246, 0.3)', 'rgba(240, 190, 0, 0.3)', 'rgb(240, 190, 0)', '240,190,0'], 'couleurs posées');
  vrai((await texte(pg, `${Z} [data-pl-legende-couleurs]`)).includes('jaune : semi-remorque · violet : porteur'), 'légende des couleurs');
  const r = await pg.evaluate(async () => {
    const { verifierCouleurs, creerPlanning } = await import('/core/types/planning.js');
    const C = await import('/contenus/planning-essai.js');
    const un = (c) => verifierCouleurs({ x: { couleur: c } });
    let refus = '';
    try { creerPlanning(Object.assign({}, C.QUAI, { familles: { semi: { couleur: '#1c7ed6' }, porteur: { couleur: '#8b5cf6' } } })); } catch (e) { refus = e.message; }
    return {
      bons: ['#f0be00', '#8b5cf6', '#f08c00', '#e64980', '#c8a46e', '#868e96'].map((c) => un(c).length),
      vert: un('#12b886').join(' '), bleu: un('#1c7ed6').join(' '), rouge: un('#e03131').join(' '), noir: un('#111111').join(' '),
      pasCouleur: un('jaune').join(' '),
      proches: verifierCouleurs({ a: { couleur: '#f0be00' }, b: { couleur: '#c9a227' } }).join(' '),
      raccourcis: verifierCouleurs({ a: { teinte: 'a' }, b: { teinte: 'b' } }).length,
      refus,
    };
  });
  egal(r.bons, [0, 0, 0, 0, 0, 0], 'couleurs lisibles acceptées');
  vrai(r.vert.includes('verte'), `vert : ${r.vert}`);
  vrai(r.bleu.includes('bleue'), `bleu : ${r.bleu}`);
  vrai(r.rouge.includes('rouge, couleur réservée'), `rouge : ${r.rouge}`);
  vrai(r.noir.includes('illisible en thème clair'), `noir : ${r.noir}`);
  vrai(r.pasCouleur.includes("n'est pas une couleur"), `« jaune » : ${r.pasCouleur}`);
  vrai(r.proches.includes('trop proches'), `proches : ${r.proches}`);
  egal(r.raccourcis, 0, 'raccourcis jaune / violet');
  vrai(r.refus.includes('planning essai-quais') && r.refus.includes('bleue'), `séance avec une couleur refusée : ${r.refus}`);
});

await v('Planning : 56 colonnes (chauffeurs) — la grille défile dans sa zone, jamais la page', async () => {
  await monter(pg, { cas: 'chauf' });
  const r = await pg.evaluate(() => {
    const z = document.querySelector('#plTest .pl-zone');
    return { page: document.documentElement.scrollWidth <= window.innerWidth, zone: z.scrollWidth > z.clientWidth };
  });
  egal(r, { page: true, zone: true }, 'défilements');
  egal(erreursP, [], 'erreurs JS');
});

await ctxP.close();
}
