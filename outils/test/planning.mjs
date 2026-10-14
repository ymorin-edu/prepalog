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

export default async function bloc({ v, nav, BASE, egal, vrai }) {

// Envoi définitif : la confirmation dans la page (06/10/2026, Smoby C2 / ENT-1.1 §7.11) n'apparaît que s'il ne
// manque rien ; on y répond « Oui ». Un envoi refusé (« Il manque… ») n'en montre pas : on continue.
const cliquerEtConfirmer = async (p, sel) => {
  await p.click(sel);
  const b = await p.waitForSelector('[data-confirme-oui]', { timeout: 1500 }).catch(() => null);
  if (b) await b.click();
};


const ctxP = await nav.newContext({ viewport: { width: 1366, height: 1000 } });
const erreursP = [];
async function nouvellePage() {
  const p = await ctxP.newPage();
  p.setDefaultTimeout(6000);
  p.on('pageerror', (e) => erreursP.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursP.push('CONSOLE: ' + m.text()); });
  await p.goto(BASE);
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
  // Un message qui arrive au GESTE « poser une carte » (questions au fil, lot 3) : `o.geste` = le nom du geste.
  if (o.geste) {
    const { apresGeste } = await import('/core/declencheurs.js');
    const v = U.volet || { id: 'essai-geste', semer: () => ({}) };
    U.volet = { ...v, declencheurs: [...(v.declencheurs || []), { id: 'au-geste', quand: apresGeste(o.geste),
      semer: (prenom) => ({ mails: [{ folder: 'in', ts: Date.now(), from: 'Chef de quai', fromMail: 'chef@essai.example', to: prenom,
        subject: 'Message du geste', kind: 'text', text: 'Arrivé au geste.' }] }) }] };
  }
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
  // Guidage avec des problèmes : « Envoyer quand même » (c'est déjà une confirmation). Sinon, la confirmation dans
  // la page (06/10/2026, Smoby C2) DOIT apparaître : son absence fait tomber le test.
  if (await present(p, '[data-pl="quandMeme"]')) { await p.click(`${Z} [data-pl="quandMeme"]`); return; }
  const c = await p.waitForSelector(`${Z} [data-confirme]`, { timeout: 3000 }).catch(() => null);
  if (!c || !/Tu envoies ton planning/.test(await c.textContent())) throw new Error('pas de confirmation avant l’envoi du planning');
  await p.click(`${Z} [data-confirme-oui]`);
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
  await cliquerEtConfirmer(pg, `${Z} [data-pl="envoyer"]`);
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
  // Guidage : la reprise est quadrillée (pas hachurée comme une pause, Tristan 06/10/2026), légendée, et dite
  // dans les informations.
  vrai(await present(pg, '[data-pl-grille] [data-pl-case][data-r="nadia"][data-t="19"].pl-repos'), 'repos de Nadia pas quadrillé');
  vrai(!(await present(pg, '[data-pl-grille] [data-pl-case][data-r="nadia"][data-t="19"].pl-hors')), 'repos de Nadia hachuré comme une pause');
  vrai(!(await present(pg, '[data-pl-grille] [data-pl-case][data-r="nadia"][data-t="20"].pl-repos')), 'Nadia quadrillée après 10:00');
  vrai((await texte(pg, `${Z} [data-pl-legende-couleurs]`)).includes('quadrillé : repos obligatoire'), 'repos absent de la légende');
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
  await cliquerEtConfirmer(pg, `${Z} [data-pl="envoyer"]`);
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

await v('Planning : le geste « poser une carte » fait arriver un message (apresGeste), une fois ; rien chez l’enseignant ; un geste inconnu refuse la séance', async () => {
  const sujets = () => pg.evaluate(() => window.__p.db.mails.filter((m) => m.subject === 'Message du geste').length);
  await monter(pg, { cas: 'quai', geste: 'planning:essai-quais:poser' });
  egal(await sujets(), 0, 'message avant le geste');
  await poser(pg, 'A', 'Q1', 0, 'lea');
  egal(await sujets(), 1, 'message au premier geste');
  egal(typeof (await pg.evaluate(() => window.__p.db.gestes['essai-planning']['planning:essai-quais:poser'])), 'number', 'geste rangé');
  await poser(pg, 'B', 'Q2', 2, 'mathis');
  egal(await sujets(), 1, 'message au second geste');
  await envoyer(pg);
  egal(typeof (await pg.evaluate(() => window.__p.db.gestes['essai-planning']['planning:essai-quais:envoyer'])), 'number', 'geste « envoyer » rangé');
  // Enseignant : ni geste rangé, ni message.
  await monter(pg, { cas: 'quai', geste: 'planning:essai-quais:poser', role: 'prof' });
  await poser(pg, 'A', 'Q1', 0, 'lea');
  egal([await sujets(), await pg.evaluate(() => window.__p.db.gestes || null)], [0, null], 'enseignant');
  // Un nom de geste qu'aucune vue de la séance ne connaît : la séance ne se charge pas.
  const m = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const { apresGeste } = await import('/core/declencheurs.js');
    const E = await import('/outils/essai-planning.js');
    const C = await import('/contenus/planning-essai.js');
    const U = E.univers({ cas: 'quai', planning: C.CAS.quai });
    U.volet = { id: 'x', semer: () => ({}), declencheurs: [{ id: 'faute', quand: apresGeste('planning:essai-quais:posser'), semer: () => ({}) }] };
    try { creerEntreprise(U); return 'chargée'; } catch (e) { return e.message; }
  });
  vrai(/message « faute » : geste inconnu « planning:essai-quais:posser »/.test(m) && /planning:essai-quais:poser/.test(m), 'geste inconnu : ' + m);
  egal(erreursP, [], 'erreurs JS');
});

/* =========================================================== chantier D-3 (ENT-6.3, 10/10/2026) */
// Le cas « personnel » de la maquette, retouché dans la page : `retraits` (la ligne de Chloé et son congé disparaissent à
// l'aléa, comme Kevin en ENT-6.3) et `sansVerifier` (`aides.verifier: false`). Valeurs écrites à la main.
const monterVariante = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-planning.js');
  const C = await import('/contenus/planning-essai.js');
  document.querySelector('#plTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'plTest'; document.body.appendChild(hote);
  const P0 = C.CAS[o.cas || 'perso'];
  // `variante` (D-8) : le source d'une fonction (C, o) => déclaration, construite dans la page (les fonctions ne passent pas).
  const P = o.variante ? new Function(`return ${o.variante}`)()(C, o)
    : { ...P0, alea: { ...P0.alea, ...(o.retraits ? { retraits: o.retraits } : {}) },
      aides: { ...P0.aides, ...(o.sansVerifier ? { verifier: false } : {}) } };
  const temps = o.temps || 'guidage';
  const U = E.univers({ cas: o.cas || 'perso', temps, planning: P });
  const db = {};
  const moteur = creerEntreprise(U);
  window.__p = { db, moteur, remis: null };
  moteur.rendre(hote, {
    meta: { id: 'essai-planning', code: 'ESSAI', titre: 'Essai du planning', portee: 'eleve', immersif: true, temps },
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  });
  document.querySelector('#plTest .ent-nav[data-vue="planning"]').click();
}, o);
const RETRAITS = { lignes: ['chloe'], cartes: ['cp-chloe'] };

await v('Planning (D-3) : `alea.retraits` — la ligne et sa carte disparaissent après l’aléa (bac, grille, compteurs) ; la carte posée avant est ignorée, son absence ne rend pas le planning incomplet', async () => {
  await monterVariante(pg, { retraits: RETRAITS });
  egal((await pg.$$(`${Z} [data-pl-bac] [data-pl-id]`)).length, 5, 'cartes avant l’aléa');
  vrai(await present(pg, '[data-pl-case][data-r="chloe"]'), 'ligne de Chloé absente avant l’aléa');
  await poserTout(pg, PERSO1);
  await envoyer(pg);
  // Après l'aléa : plus de carte ni de ligne de Chloé ; la carte de l'arrêt d'Inès et la ligne de Noa arrivent comme avant.
  egal(await pg.$$eval(`${Z} [data-pl-bac] [data-pl-id]`, (L) => L.map((x) => x.dataset.plId)), ['form-mathis', 'visite-ines', 'cp-karim', 'cp-lea', 'am-ines'], 'cartes après l’aléa');
  vrai(!(await present(pg, '[data-pl-case][data-r="chloe"]')) && !(await present(pg, '[data-pl-id="cp-chloe"]')), 'ligne ou carte de Chloé encore là');
  vrai(await present(pg, '[data-pl-case][data-r="noa"]'), 'ligne de Noa absente');
  egal((await etat(pg, 'perso')).place['cp-chloe'], { r: 'chloe', s: 5 }, 'le planning de l’élève garde la carte posée');
  await poser(pg, 'am-ines', 'ines', 5);
  const P = await problemes(pg);
  vrai(!P.some((x) => /pas encore posées|Chlo/.test(x)), `la carte retirée compte encore : ${P}`);
  // Lun 14 : Karim, Léa, Mathis, Yanis présents (Inès en arrêt, Chloé partie, Noa pas encore là) = 4 présents.
  egal(await pg.$eval(`${Z} [data-pl-compte="presents"][data-t="5"]`, (e) => e.textContent), '4', 'présents lun 14');
  await envoyer(pg);
  egal((await pastilles(pg))[5], true, 'jalon « toutes les absences posées » après l’aléa');
  // Sans l'aléa reçu par cette carte (elle n'a jamais été posée) : le planning d'après l'aléa est complet quand même.
  const r = await pg.evaluate(async (R) => {
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const C = await import('/contenus/planning-essai.js');
    const P = { ...C.PERSO, alea: { ...C.PERSO.alea, retraits: R } };
    const pl = { 'form-mathis': { r: 'mathis', s: 1 }, 'visite-ines': { r: 'ines', s: 3 }, 'cp-karim': { r: 'karim', s: 0 }, 'cp-lea': { r: 'lea', s: 7 } };
    const v2 = { ...pl, 'am-ines': { r: 'ines', s: 5 } };
    const tous = (P2, place) => jalonsPlanning({ plannings: { 'essai-personnel': { v1: { place: { ...pl, 'cp-chloe': { r: 'chloe', s: 5 } } }, v2: { place } } } }, P2).L
      .find((l) => l.id === 'v2-tous').ok;
    return { sans: tous(P, v2), fantome: tous(P, { ...v2, 'cp-chloe': { r: 'chloe', s: 0 } }), sansRetrait: tous(C.PERSO, v2) };
  }, RETRAITS);
  egal(r, { sans: true, fantome: true, sansRetrait: false }, 'lecture des versions (sans la carte, avec la carte fantôme, sans retrait déclaré)');
  egal(erreursP, [], 'erreurs JS');
});

await v('Planning (D-3) : `alea.retraits` mal déclaré (id inconnu, carte gardée sur une ligne retirée) → la séance ne se charge pas, la raison en clair', async () => {
  const m = await pg.evaluate(async () => {
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const C = await import('/contenus/planning-essai.js');
    const essai = (R) => { try { jalonsPlanning({}, { ...C.PERSO, alea: { ...C.PERSO.alea, retraits: R } }); return ''; } catch (e) { return e.message; } };
    return [essai({ lignes: ['kevin'] }), essai({ cartes: ['cp-kevin'] }), essai({ lignes: ['chloe'] }), essai({ lignes: ['chloe'], cartes: ['cp-chloe'] })];
  });
  vrai(/retire la ligne « kevin », qui n'existe pas/.test(m[0]), m[0]);
  vrai(/retire la carte « cp-kevin », qui n'existe pas/.test(m[1]), m[1]);
  vrai(/la carte « cp-chloe » va sur la ligne « chloe », retirée/.test(m[2]), m[2]);
  egal(m[3], '', 'déclaration juste refusée');
});

await v('Planning (D-3) : `aides.verifier: false` en entraînement — ni « Vérifier mon planning » ni son invite, une seule action d’envoi avec la confirmation dans la page ; sans l’option, le bouton reste', async () => {
  await monterVariante(pg, { temps: 'entrainement' });
  vrai(await present(pg, '[data-pl="verifier"]'), 'sans l’option, le bouton « Vérifier » a disparu');
  await monterVariante(pg, { temps: 'entrainement', sansVerifier: true });
  vrai(!(await present(pg, '[data-pl="verifier"]')), 'bouton « Vérifier » présent');
  const t = await texte(pg, `${Z} .pl-droite`);
  vrai(!/Vérifier/.test(t), 'le mot « Vérifier » reste à l’écran');
  vrai(await present(pg, '[data-pl-invite]') && /envoie ton planning/.test(t), 'invite d’envoi absente');
  egal((await pg.$$(`${Z} .pl-aide`)).length, 1, 'aide « règles » seule');
  await poserTout(pg, PERSO1);
  vrai(!(await present(pg, '[data-pl-problemes]')), 'des problèmes s’affichent sans vérification');
  await envoyer(pg);   // exige la confirmation « Tu envoies ton planning ? »
  egal((await etat(pg, 'perso')).phase, 2, 'envoi');
  egal((await etat(pg, 'perso')).verifs || 0, 0, 'vérifications comptées');
  egal(erreursP, [], 'erreurs JS');
});

/* =========================================================== chantier D-8 (ENT-6.8, 12/10/2026) */
// Le cas « chauffeurs » avec une ligne « Transporteur (fictif) » qui porte son camion (`porteAffectation`) et, avec
// `o.service`, une durée de service plus longue que la conduite pour E1 (5 h de service, 4 h de conduite).
const VARIANTE_D8 = ((C, o) => {
  const CH = C.CHAUF;
  const TR = { id: 'tr', nom: 'Transporteur (fictif)', permis: 'CE', note: 'avec son camion', dispo: '07:00', porteAffectation: o.porte !== false };
  return { ...CH,
    lignes: { ...CH.lignes, liste: CH.lignes.liste.concat([TR]) },
    affectation: { ...CH.affectation, porte: 'son camion' },
    cartes: { ...CH.cartes, duree: (c) => c.service || c.conduite,
      liste: CH.cartes.liste.map((c) => (o.service && c.id === 'E1' ? { ...c, service: 300 } : c)) } };
}).toString();

await v('Planning (D-8) : `conduite` d’une carte — 4 h 30 et 9 h jugés sur la conduite, pas sur la durée du service ; sans `conduite`, la durée (sabotage dans les deux sens), limite à 4 h 30 juste', async () => {
  const r = await pg.evaluate(async () => {
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const C = await import('/contenus/planning-essai.js');
    const B = C.CHAUF;
    // Deux tournées de 5 h de service sur Julie, une pause entre : 4 h de conduite chacune (8 h dans la journée).
    const tournee = (id, service, conduite) => ({ id, titre: id, type: 'porteur', famille: 'porteur', service, des: '06:00', avant: '19:00',
      ...(conduite == null ? {} : { conduite }) });
    const P8 = (liste) => ({ ...B, id: 'essai-d8', alea: undefined, cartes: { ...B.cartes, duree: (c) => c.service, liste },
      jalons: [{ id: 'pause', lib: 'pause', regles: ['pause'] }, { id: 'jour', lib: 'jour', regles: ['jour'] },
        { id: 'autres', lib: 'autres', regles: ['chauffeurUnique', 'permis', 'camionUnique', 'typeCamion', 'atelier', 'fenetre', 'repos'] }] });
    const deux = { A: { r: 'julie', s: 4, k: 'p3' }, 'pause-1': { r: 'julie', s: 24 }, B: { r: 'julie', s: 27, k: 'p3' } };
    const j = (P, place) => jalonsPlanning({ plannings: { 'essai-d8': { v1: { place } } } }, P).L.map((l) => l.ok);
    const une = { A: { r: 'julie', s: 4, k: 'p3' } };
    return {
      conduite: j(P8([tournee('A', 300, 240), tournee('B', 300, 240)]), deux),
      sansConduite: j(P8([tournee('A', 300), tournee('B', 300)]), deux),
      juste: j(P8([tournee('A', 510, 270)]), une),      // la côte d'ENT-6.8 : 8 h 30 de service, juste 4 h 30 de conduite
      auDela: j(P8([tournee('A', 510, 285)]), une),
    };
  });
  egal(r, { conduite: [true, true, true], sansConduite: [false, false, true], juste: [true, true, true], auDela: [false, true, true] }, 'jalons');
});

await v('Planning (D-8) : compteur de conduite (guidage) — il compte la conduite de la carte, pas son service', async () => {
  await monterVariante(pg, { cas: 'chauf', variante: VARIANTE_D8, service: true });
  await poser(pg, 'E1', 'julie', 4, 's1');
  const julie = await pg.$$eval(`${Z} [data-pl-grille] .pl-res`, (L) => L.map((x) => x.textContent.replace(/\s+/g, ' ')).find((t) => /Julie/.test(t)));
  vrai(/conduite 4 h 00 \/ 9 h/.test(julie), `compteur : ${julie}`);
  egal(await pg.$eval(`${Z} [data-pl-id="E1"][data-pl-vue="g"]`, (e) => e.style.gridColumn.replace(/\s/g, '')), '6/span20', 'le bloc garde la durée du service (5 h)');
  egal(erreursP, [], 'erreurs JS');
});

await v('Planning (D-8) : ligne qui porte son camion — pas de bulle, « son camion » sur la carte et le bloc, rien dans « Utilisation des camions », compte comme affectée ; déplacée ailleurs, la bulle revient', async () => {
  await monterVariante(pg, { cas: 'chauf', variante: VARIANTE_D8 });
  await poser(pg, 'E3', 'tr', 8);
  vrai(!(await present(pg, '.pl-bulle')), 'une bulle s’ouvre sur la ligne du transporteur');
  const bloc = await texte(pg, `${Z} [data-pl-id="E3"][data-pl-vue="g"]`);
  vrai(/son camion/.test(bloc) && !/camion \?/.test(bloc), `bloc : ${bloc}`);
  const carte = await texte(pg, `${Z} [data-pl-id="E3"][data-pl-vue="b"]`);
  vrai(/Transporteur \(fictif\), 07:00–09:30 · son camion/.test(carte), `carte : ${carte}`);
  vrai(!(await present(pg, '[data-pl-id="E3"][data-pl-vue="b"] [data-pl-act="bulle"]')), 'lien « Choisir le camion » sur la carte');
  vrai(!(await present(pg, '[data-pl-lect="E3"]')), 'E3 dans « Utilisation des camions »');
  vrai(!(await problemes(pg)).some((x) => /sans camion.*E3/.test(x)), 'E3 compté sans camion');
  // Un clic sur le bloc le prend (comme une pause) : pas de bulle.
  await pg.click(`${Z} [data-pl-id="E3"][data-pl-vue="g"]`);
  vrai(!(await present(pg, '.pl-bulle')), 'le clic sur le bloc ouvre une bulle');
  await pg.keyboard.press('Escape');
  // E5 posé chez Marc avec le Porteur n° 3, puis déplacé chez le transporteur : l'affectation tombe ; ramené chez Marc : la bulle revient.
  await poser(pg, 'E5', 'marc', 29, 'p3');
  vrai(await present(pg, '[data-pl-lect="E5"]'), 'E5 absent de « Utilisation des camions » chez Marc');
  await poser(pg, 'E5', 'tr', 29);
  egal((await etat(pg, 'chauf')).place.E5, { r: 'tr', s: 29 }, 'l’affectation d’avant reste');
  vrai(!(await present(pg, '[data-pl-lect="E5"]')) && !(await present(pg, '.pl-bulle')), 'E5 encore affecté ou bulle ouverte');
  await poser(pg, 'E5', 'marc', 29);
  vrai(await present(pg, '.pl-bulle'), 'la bulle ne revient pas hors de la ligne du transporteur');
  egal(erreursP, [], 'erreurs JS');
});

await v('Planning (D-8) : jalons — sur la ligne du transporteur, une affectation fantôme ne compte pas et la carte est affectée ; sans `porteAffectation`, la même place fait tomber « camions », ou tout (carte sans camion)', async () => {
  const r = await pg.evaluate(async (src) => {
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const C = await import('/contenus/planning-essai.js');
    const mk = new Function(`return ${src}`)();
    // La solution du 1er envoi, E3 chez le transporteur (07:00) : avec le Semi n° 1 resté d'avant (déjà pris par E1, mauvais type), puis sans rien.
    const base = { E1: { r: 'sofiane', s: 8, k: 's1' }, E2: { r: 'julie', s: 12, k: 's2' }, 'pause-1': { r: 'julie', s: 26 }, 'pause-2': { r: 'sofiane', s: 24 },
      E4: { r: 'sofiane', s: 27, k: 's1' }, E5: { r: 'julie', s: 29, k: 'p3' } };
    const fantome = { ...base, E3: { r: 'tr', s: 8, k: 's1' } }, nu = { ...base, E3: { r: 'tr', s: 8 } };
    const j = (P, place) => jalonsPlanning({ plannings: { [P.id]: { v1: { place } } } }, P).L.filter((l) => l.version === '1er envoi').map((l) => l.ok);
    return { fantome: j(mk(C, {}), fantome), nu: j(mk(C, {}), nu), sansPorteFantome: j(mk(C, { porte: false }), fantome), sansPorteNu: j(mk(C, { porte: false }), nu) };
  }, VARIANTE_D8);
  egal(r, { fantome: [true, true, true, true, true], nu: [true, true, true, true, true],
    sansPorteFantome: [true, true, false, true, true], sansPorteNu: [false, false, false, false, false] }, 'jalons (tous, chauffeurs, camions, fenêtre, conduite)');
});


/* ====================================================== lot 3 (ENT-7.2) : créneaux déjà pris, `quand` */
// Un planning de quai minimal : 3 quais, échelle 07:00 → 13:00 par 30 min (t = 0 pour 07:00), une carte « Conteneur » de
// 1 h 30 (3 créneaux) qui arrive à 09:00. Pris : Quai 5 07:30–10:30 · Quai 6 08:00–09:30 et 11:00–12:30 · Quai 7 09:00–12:00.
// Bonne réponse : Quai 6 à 09:30 (t = 5). Construit dans la page (les fonctions ne passent pas).
// `o.quand` : 'db' (lit db.ouvert) ou 'plante' ; `o.mal` : une faute de déclaration à essayer.
const VARIANTE_PRIS = ((C, o) => {
  const pris = (L) => (o.sansPris ? undefined : L);
  const P = {
    id: 'essai-pris', libelle: 'Planning du quai', titre: 'Quais de réception — lundi 1er février', date: 'Lundi 1er février',
    infos: () => ['Pose ton conteneur sur un créneau libre.'],
    echelle: o.jours ? { type: 'jours', jours: ['lun 1', 'mar 2'], semaine: 5 } : { type: 'heures', debut: '07:00', fin: '13:00', pas: 30 },
    lignes: { titre: 'Planning du quai', liste: [
      { id: 'Q5', nom: 'Quai 5', occupe: pris([{ de: '07:30', a: '10:30', titre: 'Conteneur TGHU 120 — autre séance' }]) },
      { id: 'Q6', nom: 'Quai 6', occupe: pris([{ de: '08:00', a: '09:30', titre: 'Conteneur MSKU 441' }, { de: '11:00', a: '12:30', titre: 'Conteneur CMAU 902' }]) },
      { id: 'Q7', nom: 'Quai 7', occupe: pris([{ de: '09:00', a: '12:00', titre: 'Conteneur HLXU 330' }]) },
    ] },
    cartes: { titre: 'Conteneur à placer', liste: [{ id: 'C1', titre: 'Conteneur PRPU — déchargement 1 h 30', court: 'C1', famille: 'cont', des: '09:00', avant: '13:00' }],
      duree: () => 90, nonPosees: () => 'Le conteneur n’est pas encore posé.' },
    familles: { cont: { couleur: '#f0be00', nom: 'jaune', legende: 'conteneur' } },
    regles: [
      { id: 'un', type: 'unAlaFois', sur: 'ligne' },
      { id: 'fen', type: 'fenetre' },
      { id: 'att', type: 'attenteMax', minutes: 60 },
    ],
    jalons: [{ id: 'cren', lib: 'Créneau valide', regles: ['un', 'fen', 'att'] }],
    note: { sur: 20 },
  };
  if (o.quand === 'db') P.quand = (db) => !!db.ouvert;
  if (o.quand === 'plante') P.quand = () => { throw new Error('quand cassé'); };
  if (o.quand === 'faux-type') P.quand = 'oui';
  const L = P.lignes.liste;
  if (o.mal === 'de-apres-a') L[1].occupe[0] = { de: '09:30', a: '08:00', titre: 'x' };
  if (o.mal === 'egal') L[1].occupe[0] = { de: '08:00', a: '08:00', titre: 'x' };
  if (o.mal === 'hors-echelle') L[1].occupe[1] = { de: '12:00', a: '13:30', titre: 'x' };
  if (o.mal === 'avant-echelle') L[1].occupe[0] = { de: '06:30', a: '08:00', titre: 'x' };
  if (o.mal === 'heure') L[1].occupe[0] = { de: '8h', a: '09:30', titre: 'x' };
  if (o.mal === 'sans-titre') L[1].occupe[0] = { de: '08:00', a: '09:30' };
  if (o.mal === 'pas-liste') L[1].occupe = { de: '08:00', a: '09:30', titre: 'x' };
  if (o.mal === 'sans-regle') P.regles = P.regles.filter((R) => R.type !== 'unAlaFois'), P.jalons = [{ id: 'cren', lib: 'c', regles: ['fen'] }];
  if (o.mal === 'aleaAjout') P.alea = { de: 'x', texte: 'y', ajoutLignes: [{ id: 'Q8', nom: 'Quai 8', occupe: [{ de: '10:00', a: '09:00', titre: 'x' }] }] };
  return P;
}).toString();
const monterPris = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-planning.js');
  const C = await import('/contenus/planning-essai.js');
  document.querySelector('#plTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'plTest'; document.body.appendChild(hote);
  const P = new Function(`return ${o.variante}`)()(C, o);
  const U = E.univers({ cas: 'quai', temps: o.temps || 'guidage', planning: P });
  const db = o.ouvert ? { ouvert: true } : {};
  window.__p = { db, moteur: creerEntreprise(U), remis: null };
  window.__p.moteur.rendre(hote, {
    meta: { id: 'essai-pris', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: o.temps || 'guidage', copie: o.temps === 'evaluation' },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
    rendreCopie: async (res) => { window.__p.remis = res; return { rendu: Date.now() }; },
  });
  const nav = document.querySelector('#plTest .ent-nav[data-vue="planning"]');
  if (nav && !o.sansClic) nav.click();
}, { ...o, variante: VARIANTE_PRIS });
// Monter une déclaration fautive : rend le message de l'erreur (ou null si la séance se charge).
const monterFaute = (p, mal) => p.evaluate(async ({ variante, mal }) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-planning.js');
  const C = await import('/contenus/planning-essai.js');
  try {
    const P = new Function(`return ${variante}`)()(C, { mal, jours: mal === 'jours', quand: mal === 'faux-type' ? 'faux-type' : undefined });
    creerEntreprise(E.univers({ cas: 'quai', planning: P }));
    return null;
  } catch (x) { return x.message; }
}, { variante: VARIANTE_PRIS, mal });
const navPlanning = (p) => p.$('#plTest .ent-nav[data-vue="planning"]');
const NOMPL = 'essai-pris';
const placePris = (p) => p.evaluate((id) => JSON.parse(JSON.stringify((window.__p.db.plannings || {})[id] || null)), NOMPL);
const MSG_Q6 = 'Quai 6 est déjà pris à ce moment-là.';

await v('Planning (lot 3) : `occupe` — les créneaux déjà pris sont dessinés (titre lisible, libellé pour le lecteur d’écran, légende), au bon endroit', async () => {
  await monterPris(pg);
  const blocs = await pg.$$eval(`${Z} [data-pl-pris]`, (L) => L.map((b) => ({ r: b.dataset.plPris, texte: b.textContent.trim(), col: b.style.gridColumn.replace(/\s/g, ''), aria: b.getAttribute('aria-label'), role: b.getAttribute('role') })));
  egal(blocs.map((b) => [b.r, b.texte, b.col]), [
    ['Q5', 'Conteneur TGHU 120 — autre séance', '3/span6'], ['Q6', 'Conteneur MSKU 441', '4/span3'], ['Q6', 'Conteneur CMAU 902', '10/span3'], ['Q7', 'Conteneur HLXU 330', '6/span6'],
  ], 'blocs pris (ligne, titre, colonne : 07:30 = colonne 3)');
  vrai(blocs.every((b) => b.role === 'img' && /déjà pris/.test(b.aria) && b.aria.includes(b.texte)), `libellés pour le lecteur d’écran : ${JSON.stringify(blocs.map((b) => b.aria))}`);
  vrai(blocs[1].aria.startsWith('Quai 6, déjà pris, 08:00–09:30'), `libellé : ${blocs[1].aria}`);
  vrai(/déjà pris/.test(await texte(pg, `${Z} [data-pl-legende-couleurs]`)), 'légende du gris pointillé absente');
  egal(await pg.$eval(`${Z} [data-pl-pris]`, (b) => getComputedStyle(b).borderTopStyle), 'dotted', 'bordure pointillée (distincte des cartes et des hachures)');
  egal(Object.keys((await placePris(pg)).place), [], 'rien posé dans la base à l’ouverture');
  egal(await problemes(pg), ['Le conteneur n’est pas encore posé.'], 'problèmes à l’ouverture');
  egal(erreursP, [], 'erreurs JS');
});

await v('Planning (lot 3) : `occupe` — une carte posée sur un créneau pris est un problème qui dit QUE (guidage) ; juste après, aucun ; chaque bloc et chaque ligne comptent', async () => {
  await monterPris(pg);
  await poser(pg, 'C1', 'Q6', 4);          // 09:00–10:30 : recouvre 08:00–09:30
  egal(await problemes(pg), [MSG_Q6], 'carte sur Quai 6 à 09:00');
  vrai(!/\d\s*(min|h)\b/.test((await problemes(pg))[0]), 'le message donne une durée (de combien)');
  vrai(await present(pg, '[data-pl-id="C1"][data-pl-vue="g"].pl-bloc-faux'), 'bloc fautif pas marqué');
  await poser(pg, 'C1', 'Q6', 5);          // 09:30–11:00 : juste après le 1er pris, juste avant le 2e
  egal(await problemes(pg), [], 'carte posée juste après le bloc pris (et finissant à l’ouverture du suivant)');
  await poser(pg, 'C1', 'Q6', 6);          // 10:00–11:30 : recouvre 11:00–12:30
  egal(await problemes(pg), [MSG_Q6], 'carte qui mord sur le 2e bloc pris');
  await poser(pg, 'C1', 'Q5', 6);          // 10:00–11:30 : recouvre la fin de Quai 5 (07:30–10:30)
  egal(await problemes(pg), ['Quai 5 est déjà pris à ce moment-là.'], 'Quai 5');
  await poser(pg, 'C1', 'Q7', 4);          // 09:00–10:30 sur Quai 7 (pris 09:00–12:00)
  egal(await problemes(pg), ['Quai 7 est déjà pris à ce moment-là.'], 'Quai 7');
  await poser(pg, 'C1', 'Q5', 8);          // 11:00–12:30 : Quai 5 est libre après 10:30 (attente de 2 h : autre règle)
  vrai(!(await problemes(pg)).some((x) => /pris/.test(x)), `Quai 5 libre après 10:30 signalé pris : ${await problemes(pg)}`);
});

await v('Planning (lot 3) : `occupe` — l’envoi juge le créneau (jalon faux sur un pris, juste sur le bon) ; rien de la déclaration ne se range dans la base de l’élève', async () => {
  await monterPris(pg);
  await poser(pg, 'C1', 'Q6', 4);
  await envoyer(pg);
  egal(await pastilles(pg), [false], 'jalon avec la carte sur un créneau pris');
  const e = await placePris(pg);
  egal(e.v1.place.C1, { r: 'Q6', s: 4 }, 'version envoyée');
  vrai(!/occupe|MSKU|CMAU|TGHU|HLXU|déjà pris/.test(JSON.stringify(await pg.evaluate(() => window.__p.db))), 'la base de l’élève contient la déclaration des blocs pris');
  await monterPris(pg);
  await poser(pg, 'C1', 'Q6', 5);
  await envoyer(pg);
  egal(await pastilles(pg), [true], 'jalon avec la carte juste après le bloc pris');
  vrai(!/occupe|MSKU|CMAU|TGHU|HLXU|déjà pris/.test(JSON.stringify(await pg.evaluate(() => window.__p.db))), 'la base de l’élève contient la déclaration des blocs pris (2)');
});

await v('Planning (lot 3) : `occupe` — évaluation : rien n’est signalé, la note se lit sur la version envoyée (0 sur un pris, 20 sur le bon)', async () => {
  await monterPris(pg, { temps: 'evaluation' });
  vrai(await present(pg, '[data-pl-pris]'), 'blocs pris absents en évaluation');
  await poser(pg, 'C1', 'Q6', 4);
  vrai(!(await present(pg, '[data-pl-problemes] li')), 'des problèmes sont montrés en évaluation');
  await envoyer(pg);
  egal(await pg.evaluate(() => window.__p.moteur.noter(window.__p.db).score), 0, 'note avec la carte sur un pris');
  await monterPris(pg, { temps: 'evaluation' });
  await poser(pg, 'C1', 'Q6', 5);
  await envoyer(pg);
  egal(await pg.evaluate(() => window.__p.moteur.noter(window.__p.db).score), 20, 'note avec la bonne réponse');
});

await v('Planning (lot 3) : `occupe` — un bloc pris n’est ni déplaçable ni cliquable comme une carte ; le clic et le dépôt passent à la case dessous', async () => {
  await monterPris(pg);
  const t = await pg.$eval(`${Z} [data-pl-pris="Q6"][data-k="0"]`, (b) => ({ drag: b.getAttribute('draggable'), id: b.dataset.plId, tab: b.getAttribute('tabindex'), tag: b.tagName,
    pe: getComputedStyle(b).pointerEvents }));
  egal(t, { drag: null, id: undefined, tab: null, tag: 'DIV', pe: 'none' }, 'bloc pris : ni draggable, ni data-pl-id, ni focus, ni clic');
  const centre = async (sel) => { await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' })); const b = await (await pg.$(sel)).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  // Cliquer le bloc sans rien en main : aucun effet (pas de carte prise, rien posé, rien enregistré).
  let [x, y] = await centre(`${Z} [data-pl-pris="Q7"]`);
  await pg.mouse.click(x, y);
  egal(Object.keys((await placePris(pg)).place), [], 'un clic sur le bloc pris a posé quelque chose');
  vrai(!(await present(pg, '.pl-sel')), 'un clic sur le bloc pris a pris quelque chose en main');
  // Une carte en main, un clic sur le bloc : elle se pose sur la case dessous (Quai 7), et le problème est signalé.
  await pg.click(`${Z} [data-pl-id="C1"][data-pl-vue="b"]`);
  [x, y] = await centre(`${Z} [data-pl-pris="Q7"]`);
  await pg.mouse.click(x, y);
  const p = (await placePris(pg)).place.C1;
  egal(p.r, 'Q7', 'ligne où la carte est tombée');
  vrai(p.s >= 4 && p.s <= 9, `créneau sous le bloc : ${p.s}`);
  vrai((await problemes(pg)).includes('Quai 7 est déjà pris à ce moment-là.'), `problème signalé : ${await problemes(pg)}`);
  // Le bloc pris ne bouge pas, et la carte (bloc fautif) est bien au-dessus de lui.
  egal(await pg.$$eval(`${Z} [data-pl-pris]`, (L) => L.length), 4, 'les blocs pris sont toujours 4');
});

await v('Planning (lot 3) : `quand` — le Planning n’est pas au menu tant que c’est faux, y est après, et l’enseignant le voit toujours', async () => {
  await monterPris(pg, { quand: 'db' });
  vrai(!(await navPlanning(pg)), 'Planning au menu alors que quand est faux');
  vrai(!(await present(pg, '[data-planning]')), 'écran Planning rendu');
  vrai(!!(await pg.$('#plTest .ent-nav[data-vue="stock"]')), 'le reste du menu manque');
  await monterPris(pg, { quand: 'db', ouvert: true });
  vrai(!!(await navPlanning(pg)), 'Planning absent du menu alors que quand est vrai');
  vrai(await present(pg, '[data-planning]'), 'écran Planning absent alors que quand est vrai');
  await monterPris(pg, { quand: 'db', role: 'prof', sansClic: true });
  vrai(!!(await navPlanning(pg)), 'l’enseignant ne voit pas le Planning alors que quand est faux');
  await monterPris(pg, { role: 'eleve', sansClic: true });
  vrai(!!(await navPlanning(pg)), 'sans `quand`, le Planning disparaît du menu');
});

await v('Planning (lot 3) : `quand` — redevenu faux pendant qu’on est sur l’écran : pas de plantage, l’écran se vide ; une condition qui plante = fermé, signalé', async () => {
  const avantErreurs = erreursP.length;
  await monterPris(pg, { quand: 'db', ouvert: true });
  vrai(await present(pg, '[data-planning]'), 'écran Planning absent');
  await pg.evaluate(() => { window.__p.db.ouvert = false; });
  await pg.click(`${Z} [data-pl="agrandir"]`);                      // un geste qui redessine l'écran
  vrai(!(await present(pg, '[data-planning]')), 'le Planning reste affiché alors que quand est faux');
  egal(erreursP.slice(avantErreurs), [], 'erreurs JS après le passage à faux');
  await monterPris(pg, { quand: 'plante', sansClic: true });
  vrai(!(await navPlanning(pg)), 'une condition qui plante laisse le Planning ouvert');
  vrai(erreursP.slice(avantErreurs).some((x) => /condition « quand » du Planning plante.*quand cassé/.test(x)), `plantage non signalé : ${erreursP}`);
  erreursP.splice(avantErreurs);                                   // signalé exprès : il ne compte pas comme une erreur de la suite
  await monterPris(pg, { quand: 'plante', role: 'prof', sansClic: true });
  vrai(!!(await navPlanning(pg)), 'l’enseignant ne voit pas le Planning quand `quand` plante');
});

await v('Planning (lot 3) : déclaration mal formée refusée avec un message qui nomme le planning, la ligne et le bloc', async () => {
  egal(await monterFaute(pg, null), null, 'la déclaration saine se charge');
  const cas = {
    'de-apres-a': /essai-pris.*Q6.*occupe\[0\].*09:30.*avant.*08:00/,
    egal: /Q6.*occupe\[0\].*doit être avant/,
    'hors-echelle': /Q6.*occupe\[1\].*13:30.*sort de l'échelle.*07:00–13:00/,
    'avant-echelle': /Q6.*occupe\[0\].*06:30.*sort de l'échelle/,
    heure: /Q6.*occupe\[0\].*HH:MM.*8h/,
    'sans-titre': /Q6.*occupe\[0\].*titre/,
    'pas-liste': /Q6.*`occupe` est une liste/,
    'sans-regle': /unAlaFois/,
    aleaAjout: /Q8.*occupe\[0\].*doit être avant/,
    jours: /Q5.*échelle « jours »/,
    'faux-type': /`quand` est une fonction/,
  };
  for (const [mal, re] of Object.entries(cas)) {
    const m = await monterFaute(pg, mal);
    vrai(m && re.test(m), `${mal} : ${m}`);
  }
});

await v('Planning (lot 3) : sans `occupe` ni `quand`, rien ne change — aucun bloc pris, pas de légende en plus, mêmes problèmes', async () => {
  await monterPris(pg, { sansPris: true });
  vrai(!(await present(pg, '[data-pl-pris]')), 'bloc pris sans `occupe`');
  vrai(!/déjà pris/.test(await texte(pg, `${Z} [data-pl-legende-couleurs]`)), 'légende du pris sans `occupe`');
  await poser(pg, 'C1', 'Q6', 4);
  egal(await problemes(pg), [], 'sans `occupe`, la même place ne pose aucun problème');
});

await ctxP.close();
}
