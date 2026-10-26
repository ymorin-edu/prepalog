// Suite de tests de Prepalog — bloc « ikea-12.6 » : IKEA ENT-12.6, « l'armoire de Mme Benali » (2de, poste C logistique, découverte de C2.2 et C2.1, guidage).
// `node outils/test.mjs ikea-12.6` ne lance que ce bloc. Brief : `docs/briefs/ENT-12.6-ikea-larmoire-de-mme-benali.md` §4 à §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS (flèches de l'ordre, envois), les listes par `selectOption`.
// Les GRAINES sont choisies ici (l'identifiant de l'élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le tirage le 26/10/2026, recalculées d'après les règles :
// à deux au-delà de 25 kg OU de 2 m ; volume = longueur × largeur × hauteur ; la caisse contient 18 m³) :
//
//   ik126 : le second client est M. Fabre (commande FR-2703-4523) : lit TORA 38 kg, 2,05 m (à deux : long et lourd) · bureau LIVA 19 kg, 1,20 m (seul) · lampadaire ORIA 6 kg, 1,75 m (seul, FRAGILE).
//     Les cinq colis de Mme Benali sont à deux : armoire 40, 38 et 34 kg (2,01 m, 1,95 m, 1,00 m), canapé 42 et 31 kg (2,20 m, 1,00 m).
//     Positions (m depuis le quai) : lit 16 · canapé 20 et 20 · armoire 38, 38 et 40 · bureau 34 · lampadaire 52.
//     Volume des huit colis : 0,2653 + 0,2488 + 0,165 + 0,693 + 0,27 + 0,1845 + 0,108 + 0,1575 = 2,0921 → 2,09 m³. Déjà chargé : 15,31 m³ ; place libre avant chargement 2,69 m³ : elles TIENNENT (marge 0,6).
//     Un ordre juste et le plus court : lit, canapé 1, canapé 2, armoire 1, 2, 3, bureau, lampadaire = 16 + 4 + 0 + 18 + 0 + 2 + 6 + 18 + 52 = 116 m. Seuil du jalon : 116 + 24 = 140 m.
//     Départ de la fiche : lampadaire, armoire 2, armoire 3, lit, canapé 2, canapé 1, armoire 1, bureau (152 m : plus long que le seuil).
//   ik126c : même second client, mais déjà chargé 17,11 m³ : elles NE TIENNENT PAS (marge −1,2).
//
// Barème : les bons colis 4 · l'ordre de prélèvement 4 · seul ou à deux 4 · parcours 2 · caisse mobile 2 · questions notées 4 (1,5 + 1,5 + 1) = 20.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'ikea-armoire-preparation';
const ACT = '/activites/ikea-armoire-preparation.js';
const P = await ouvrirIkea({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, entrants, menu, clic, sansToast, confirmer, noter, aller } = P;

const fermerCartes = async () => { await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80); };
// Plusieurs questions peuvent se suivre : on ferme les cartes « Nouveau message », on répond, on reprend.
let R;
async function qFil() {
  for (let i = 0; i < 8; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 600 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await fermerCartes();
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
}
const OUV = { bon: 'quoi', ordre: 'lourds', volume: 'juste', dos: 'jambes', charge: 'medecin', consigne: 'respecte' };
const OUV_FAUX = { bon: 'prix', ordre: 'petits', volume: 'double', dos: 'coup', charge: 'rien', consigne: 'choisit' };
const RJ = { 'lourd-dabord': 'bas', 'pourquoi-deux': 'dos', 'ton-parcours': 'sens', 'soixante-kg': 'medecin' };
const RF = { 'lourd-dabord': 'vite', 'pourquoi-deux': 'drole', 'ton-parcours': 'retours', 'soixante-kg': 'jamais' };
R = RJ;
const mont = (o = {}) => P.monter({ rep: OUV, uid: 'ik126', ...o });
const JALONS = ['bon-colis', 'ordre', 'deux', 'parcours', 'caisse'];
const detail = async () => (await noter(ACT)).detail;

// Les huit colis de ik126 (écrits à la main) et les réponses justes.
const HUIT = ['arm1', 'arm2', 'arm3', 'can1', 'can2', 'f1', 'f2', 'f3'];
const ORDRE_COURT = ['f1', 'can1', 'can2', 'arm1', 'arm2', 'arm3', 'f2', 'f3'];        // 116 m, valide
const ORDRE_JUSTE_LONG = ['arm3', 'arm2', 'arm1', 'can2', 'can1', 'f1', 'f2', 'f3'];    // 152 m, valide : au-dessus du seuil de 140 m
const ORDRE_COURT_FAUX = ['f1', 'can1', 'can2', 'arm1', 'arm2', 'arm3', 'f3', 'f2'];    // 104 m, mais le fragile avant le normal : invalide
const ORDRE_LIMITE = ['f2', 'f1', 'can1', 'can2', 'arm1', 'arm2', 'arm3', 'f3'];       // 140 m pile (sous le seuil, ≤), mais un normal avant les lourds : invalide
const DEUX = { arm1: 'deux', arm2: 'deux', arm3: 'deux', can1: 'deux', can2: 'deux', f1: 'deux', f2: 'seul', f3: 'seul' };

async function envoyerBon(colis = HUIT) {
  await fermerCartes();
  await aller('fiche');
  for (const c of colis) { await pg.check(`${Z} [data-fiche-case="colis"][value="${c}"]`); await pause(30); }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
async function ordonner(ordre) {
  await fermerCartes();
  await aller('fiche:ordre-126');
  if (ordre) {
    for (let k = 0; k < ordre.length; k++) {
      for (let s = 0; s < 9; s++) {
        const cur = await pg.$$eval(`${Z} [data-fiche-ordre="ordre"] li`, (L) => L.map((x) => x.dataset.v));
        const j = cur.indexOf(ordre[k]);
        if (j <= k) break;
        await fermerCartes();
        await clic(`[data-fiche-ordre="ordre"] li[data-v="${ordre[k]}"] [data-ordre-sens="-1"]`);
        await pause(30);
        await qFil();
      }
    }
  }
  await fermerCartes();
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
async function envoyerDeux(d = DEUX) {
  await fermerCartes();
  await aller('fiche:deux-126');
  for (const [c, x] of Object.entries(d)) { await pg.selectOption(`${Z} [data-fiche-champ="p-${c}"]`, x); await pause(30); await qFil(); }
  await fermerCartes();
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
async function envoyerCaisse({ volume = '2,09', tient = 'oui' } = {}) {
  await fermerCartes();
  await aller('fiche:caisse-126');
  if (volume != null) { await pg.fill(`${Z} [data-fiche-saisie="volume"]`, volume); await pause(30); }
  if (tient) { await pg.check(`${Z} [data-fiche-champ="tient"][value="${tient}"]`); await pause(30); }
  await fermerCartes();
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
async function jouer(o = {}) {
  await envoyerBon(o.bon || HUIT);
  await ordonner(o.ordre === undefined ? ORDRE_COURT : o.ordre);
  await envoyerDeux(o.deux || DEUX);
  await envoyerCaisse(o.caisse || {});
}

// ─────────────────────────────────────────────────────────── la déclaration et les données
await v('ENT-12.6 : la séance se charge (2de, C2.2 et C2.1, guidage) ; poids 4 + 4 + 4 + 2 + 2 = 16 et part 4 = 20 ; 3 questions notées, 1 réflexion ; inscrite au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/ikea-armoire-preparation.js');
    const S = await import('/contenus/ikea-ent126.js');
    const Q = await import('/contenus/questions/ENT-12.6.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0), part: Q.QUESTIONS.part,
      notees: L.filter((q) => q.type === 'fil' && !q.reflexion).map((q) => [q.id, q.poids]), reflexions: L.filter((q) => q.reflexion).map((q) => q.id),
      ouv: Q.QUESTIONS.ouverture.tirage, auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'ikea-armoire-preparation') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture], ['ENT-12.6', ['2de'], ['C2.2', 'C2.1'], 'guidage', 20, undefined, 'ENT-12.6', true, 'prof'], 'meta');
  egal(r.poids, [['bon-colis', 4], ['ordre', 4], ['deux', 4], ['parcours', 2], ['caisse', 2]], 'jalons et poids');
  proche(r.total + r.part, 20, 'jalons + part des questions');
  egal(r.notees, [['lourd-dabord', 1.5], ['pourquoi-deux', 1.5], ['ton-parcours', 1]], 'questions notées');
  egal(r.reflexions, ['soixante-kg'], 'réflexion non notée');
  egal(r.ouv, { preparation: 2, droit: 1 }, 'ouverture tirée');
  egal(r.auRegistre, true, 'au registre');
});

await v('ENT-12.6 : les règles — 25 kg et 2 m pile se portent seuls, 26 kg ou 2,01 m à deux ; l’ordre juste exige lourds, normaux, fragiles ; le plus court de ik126 fait 116 m ; le départ de ik126 est invalide et plus long que le seuil', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/ikea-ent126-donnees.js');
    const c = (kg, L, classe = 'normal') => ({ kg, L, classe });
    const t = D.TIRAGE.tirer('ik126|' + D.ID), J = D.jeuDeVal(t.valeurs);
    return {
      bornes: [D.aDeux(c(25, 2)), D.aDeux(c(26, 1)), D.aDeux(c(10, 2.01)), D.aDeux(c(40, 2.2))],
      rangs: [D.rang(c(30, 1)), D.rang(c(10, 1)), D.rang(c(10, 1, 'fragile')), D.rang(c(10, 3, 'fragile'))],
      client: J.client.id, depart: t.valeurs.depart, marge: J.marge, total: J.total, deja: J.deja,
      court: D.meilleurParcours(J.colis), longDepart: D.longueurParcours(t.valeurs.depart, J.colis), departValide: D.ordreValide(t.valeurs.depart, J.colis),
      limite: D.longueurParcours(['f2', 'f1', 'can1', 'can2', 'arm1', 'arm2', 'arm3', 'f3'], J.colis),
    };
  });
  egal(r.bornes, [false, true, true, true], 'bornes de la règle');
  egal(r.rangs, [0, 1, 2, 0], 'rangs (lourd ou long avant fragile)');
  egal([r.client, r.marge, r.total, r.deja], ['fabre', 0.6, 2.09, 15.31], 'tirage de ik126');
  egal(r.depart, ['f3', 'arm2', 'arm3', 'f1', 'can2', 'can1', 'arm1', 'f2'], 'départ de ik126');
  egal([r.court.m, r.court.ordre], [116, ['f1', 'can1', 'can2', 'arm1', 'arm2', 'arm3', 'f2', 'f3']], 'le plus court des ordres justes');
  egal([r.longDepart, r.departValide, r.limite], [152, false, 140], 'départ : longueur et validité ; ordre limite');
});

await v('ENT-12.6 : le tirage — 500 graines : jamais de secours, les quatre clients tirés, les deux commandes tiennent pour 40 à 60 % des élèves, le départ jamais juste ni sous le seuil', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/ikea-ent126-donnees.js');
    let secours = 0, tient = 0, mauvais = 0; const clients = {};
    for (let i = 0; i < 500; i++) {
      const t = D.TIRAGE.tirer(`g${i}|${D.ID}`), J = D.jeuDeVal(t.valeurs);
      if (t.secours) secours++;
      if (J.marge >= 0) tient++;
      clients[J.client.id] = (clients[J.client.id] || 0) + 1;
      if (D.ordreValide(t.valeurs.depart, J.colis) || D.longueurParcours(t.valeurs.depart, J.colis) <= D.meilleurParcours(J.colis).m + D.MARGE_PARCOURS) mauvais++;
      if (Math.abs(D.arr2(18 - J.deja - J.total) - J.marge) > 0.011) mauvais++;
    }
    return { secours, tient, clients, mauvais };
  });
  egal(r.secours, 0, 'tirages de secours');
  egal(r.mauvais, 0, 'départs conformes');
  vrai(r.tient >= 200 && r.tient <= 300, `les commandes tiennent pour ${r.tient} élèves sur 500`);
  egal(Object.keys(r.clients).sort(), ['fabre', 'lambert', 'moreau', 'roche'], 'les quatre clients');
  vrai(Object.values(r.clients).every((n) => n >= 30), 'un client trop rare : ' + JSON.stringify(r.clients));
});

// ─────────────────────────────────────────────────────────── l'ouverture, le départ
await v('ENT-12.6 : à l’ouverture — le tirage est rangé (graine élève|séance), un seul message de Moussa (deux documents joints, un mardi de mars), seul le bon est ouvert', async () => {
  const db = await mont();
  egal(db.tirages[ID].graine, `ik126|${ID}`, 'graine');
  egal([db.tirages[ID].valeurs.client2, db.tirages[ID].valeurs.marge], [2, 0.6], 'client et marge de ik126');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Moussa', 'Deux commandes à préparer', ['poste-126', 'regles-126']]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate()], [2027, 2, 9], 'daté du mardi 9 mars 2027');
  const M = await menu();
  vrai(M.includes('fiche') && !M.includes('fiche:ordre-126') && !M.includes('fiche:deux-126') && !M.includes('fiche:caisse-126'), 'menu au départ : ' + M.join(', '));
  await aller('fiche');
  const cases = await pg.$$eval(`${Z} [data-fiche-case="colis"]`, (L) => L.map((x) => x.value));
  egal(cases.slice().sort(), [...HUIT, 'leu1', 'leu2'].sort(), 'dix colis proposés (huit + deux d’une autre commande)');
  vrai(!/\b(lourd|à deux)\b/i.test(await pg.textContent(`${Z} .ent-fiche`)), 'la fiche du bon dit « lourd » ou « à deux »');
});

await v('ENT-12.6 : Avant de commencer — 3 questions tirées (2 de préparation, 1 de droit), corrigées, jamais notées', async () => {
  const db = await P.monter({ uid: 'ik126', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 3, 'nombre');
  egal([ids.filter((x) => ['bon', 'ordre', 'volume', 'dos'].includes(x)).length, ids.filter((x) => ['charge', 'consigne'].includes(x)).length], [2, 1], 'deux de préparation, une de droit');
  for (let k = 0; k < 3; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${OUV_FAUX[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    if (k < 2) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note après l’ouverture seule');
});

await v('ENT-12.6 : inaction — rien fait → 0/20 ; le bon envoyé sans rien cocher, l’ordre envoyé sans y toucher, tout « seul », la caisse sans réponse → rien de juste, sauf ce que « seul » donne', async () => {
  await mont({ sansOuverture: true });
  let n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note à l’ouverture');
  vrai(!Object.values(n.detail).includes('ok'), 'jalon juste à l’ouverture : ' + JSON.stringify(n.detail));
  await mont();
  await envoyerBon([]);
  await ordonner(null);
  n = await noter(ACT);
  egal(['bon-colis', 'ordre', 'parcours'].map((k) => n.detail[k]), ['ko', 'ko', 'ko'], 'bon vide et ordre jamais touché : tout faux (l’ordre de départ est faux et plus long que le seuil)');
  // La seule chose juste : la question « ton-parcours » (poids 1), où l'élève lit son propre parcours trop long ; aucun jalon d'action.
  proche(n.score, 1, 'note (la lecture juste de son parcours trop long)');
  egal(Object.keys(n.detail).filter((k) => n.detail[k] === 'ok'), ['question:ton-parcours'], 'seul jalon juste');
});

// ─────────────────────────────────────────────────────────── le parcours juste
await v('ENT-12.6 : parcours juste — bon exact, ordre le plus court, huit portages justes, volume et réponse justes → 20/20 ; messages de Moussa dans l’ordre ; aucun message ne dit « juste » ou « faux »', async () => {
  await mont({ rep: OUV_FAUX });
  await jouer();
  const n = await noter(ACT);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  egal(JALONS.map((k) => n.detail[k]), ['ok', 'ok', 'ok', 'ok', 'ok'], 'jalons');
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Deux commandes à préparer', 'Dans quel ordre on les prend ?', 'Seul ou à deux ?', 'Ça tient dans la caisse ?', 'Merci pour cet après-midi'], 'messages');
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse)\b/i.test(m.text)), 'un message juge');
  vrai(!!(await base()).points[ID], 'photo de fin rangée');
  const b = await base();
  egal(b.questions[ID]['soixante-kg'].premiere, 'medecin', 'réflexion rangée');
  vrai(!Object.keys(n.detail).some((k) => /soixante-kg/.test(k)), 'une réflexion est notée');
});

await v('ENT-12.6 : pire cas — tout faux (aucun bon colis, ordre jamais touché, tout « seul » sauf les seuls, mauvais volume) → 0/20 ; « Corriger » proposé', async () => {
  await mont();
  R = RF;
  await jouer({ bon: ['leu1', 'leu2'], ordre: null, deux: { arm1: 'seul', arm2: 'seul', arm3: 'seul', can1: 'seul', can2: 'seul', f1: 'seul', f2: 'deux', f3: 'deux' }, caisse: { volume: '9', tient: 'non' } });
  R = RJ;
  const n = await noter(ACT);
  proche(n.score, 0, 'note : ' + JSON.stringify(n.detail));
  egal(JALONS.map((k) => n.detail[k]), ['ko', 'ko', 'ko', 'ko', 'ko'], 'jalons');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
});

// ─────────────────────────────────────────────────────────── le bon
await v('ENT-12.6 : le bon — un colis oublié → 16 ; un colis d’une autre commande coché en plus → 16 ; les deux leurres seuls → 16 et rien de juste', async () => {
  const essai = async (bon) => { await mont(); await jouer({ bon }); const n = await noter(ACT); return [n.detail['bon-colis'], n.score]; };
  egal(await essai(HUIT), ['ok', 20], 'les huit exacts');
  egal(await essai(HUIT.filter((c) => c !== 'arm3')), ['ko', 16], 'un colis oublié');
  egal(await essai([...HUIT, 'leu1']), ['ko', 16], 'un leurre en plus');
  egal(await essai(['leu1', 'leu2']), ['ko', 16], 'les leurres seuls');
});

// ─────────────────────────────────────────────────────────── l'ordre et le parcours
await v('ENT-12.6 : ordre et parcours — le plus court : 20 ; un ordre juste mais long (152 m) : ordre ok, parcours ko → 18 ; un ordre court mais faux (104 m, fragile avant le normal) : ordre ko, parcours ok → 16 ; le seuil pile (140 m) passe ; jamais touché : 14', async () => {
  const essai = async (ordre) => { await mont(); await jouer({ ordre }); const n = await noter(ACT); return [n.detail.ordre, n.detail.parcours, n.score]; };
  egal(await essai(ORDRE_COURT), ['ok', 'ok', 20], 'le plus court');
  egal(await essai(ORDRE_JUSTE_LONG), ['ok', 'ko', 18], 'juste mais long (152 m)');
  egal(await essai(ORDRE_COURT_FAUX), ['ko', 'ok', 16], 'court mais faux (104 m)');
  egal(await essai(ORDRE_LIMITE), ['ko', 'ok', 16], 'le seuil pile (140 m), ordre faux');
  egal(await essai(null), ['ko', 'ko', 14], 'ordre jamais touché');
});

// ─────────────────────────────────────────────────────────── seul ou à deux
await v('ENT-12.6 : seul ou à deux — les huit justes : 20 ; un colis lourd pris seul : 16 ; un colis léger pris à deux : 16 (tout mettre « à deux » ne rapporte rien) ; la fiche demande les huit lignes', async () => {
  const essai = async (d) => { await mont(); await jouer({ deux: d }); const n = await noter(ACT); return [n.detail.deux, n.score]; };
  egal(await essai(DEUX), ['ok', 20], 'huit justes');
  egal(await essai({ ...DEUX, arm1: 'seul' }), ['ko', 16], 'le colis de 40 kg et 2,01 m pris seul');
  egal(await essai({ ...DEUX, f2: 'deux' }), ['ko', 16], 'le bureau de 19 kg pris à deux');
  egal(await essai(Object.fromEntries(Object.keys(DEUX).map((c) => [c, 'deux']))), ['ko', 16], 'tout à deux');
  await mont();
  await envoyerBon(); await ordonner(ORDRE_COURT);
  await fermerCartes(); await aller('fiche:deux-126');
  await pg.selectOption(`${Z} [data-fiche-champ="p-arm1"]`, 'deux'); await pause(30); await qFil();
  await sansToast(); await clic('[data-fiche-envoyer]'); await pause(120);
  vrai(!(await present('[data-confirme-oui]')), 'une fiche incomplète ne se confirme pas');
  egal((await base()).fiches['deux-126'].envoye, undefined, 'la fiche n’est pas envoyée');
});

// ─────────────────────────────────────────────────────────── la caisse
await v('ENT-12.6 : la caisse — 2,09 m³ et « oui » (elles tiennent) : 20 ; 2,15 m³ (à 0,1 près) : juste ; 2,2 m³ : faux ; « non » : faux ; pour ik126c (déjà 17,11 m³), c’est « non » qui est juste ; un texte n’est pas accepté', async () => {
  const essai = async (c, uid = 'ik126') => { await mont({ uid }); await jouer({ caisse: c }); const n = await noter(ACT); return [n.detail.caisse, n.score]; };
  egal(await essai({ volume: '2,09', tient: 'oui' }), ['ok', 20], 'juste');
  egal(await essai({ volume: '2,15', tient: 'oui' }), ['ok', 20], 'à 0,06 près');
  egal(await essai({ volume: '2,2', tient: 'oui' }), ['ko', 18], 'à 0,11 : trop loin');
  egal(await essai({ volume: '2,09', tient: 'non' }), ['ko', 18], 'bon volume, mauvaise réponse');
  egal(await essai({ volume: '2,09', tient: 'non' }, 'ik126c'), ['ok', 20], 'ik126c : elles ne tiennent pas');
  egal(await essai({ volume: '2,09', tient: 'oui' }, 'ik126c'), ['ko', 18], 'ik126c : « oui » est faux');
  await mont();
  await envoyerBon(); await ordonner(ORDRE_COURT); await envoyerDeux();
  await fermerCartes(); await aller('fiche:caisse-126');
  vrai(/15,31 m³/.test(await texte()), 'le volume déjà chargé n’est pas montré');
  await pg.fill(`${Z} [data-fiche-saisie="volume"]`, 'beaucoup'); await pg.check(`${Z} [data-fiche-champ="tient"][value="oui"]`); await pause(30);
  await sansToast(); await clic('[data-fiche-envoyer]'); await pause(150);
  vrai(!(await present('[data-confirme-oui]')), 'un texte comme volume ne se confirme pas');
  egal((await base()).fiches['caisse-126'].envoye, undefined, 'la fiche n’est pas envoyée');
});

// ─────────────────────────────────────────────────────────── les questions au fil
await v('ENT-12.6 : questions au fil — « lourd-dabord » au premier colis déplacé, « pourquoi-deux » au premier portage choisi, « ton-parcours » à l’envoi de l’ordre (texte calculé : 116 m pour le plus court, le parcours de l’élève), « soixante-kg » après la caisse', async () => {
  await mont();
  R = RJ;
  await envoyerBon();
  await fermerCartes(); await aller('fiche:ordre-126');
  vrai(!(await present('[data-q-panneau]')), 'une question avant tout geste');
  await clic('[data-fiche-ordre="ordre"] li[data-v="f1"] [data-ordre-sens="-1"]');
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'lourd-dabord', 'question au premier déplacement');
  await qFil();
  await ordonner(ORDRE_JUSTE_LONG);
  const b = await base();
  const tp = b.questions[ID]['ton-parcours'];
  vrai(tp && tp.texte && /152 m/.test(tp.texte.enonce) && /116 m/.test(tp.texte.enonce), 'le texte de « ton-parcours » n’est pas calculé sur le parcours : ' + JSON.stringify(tp && tp.texte));
  await fermerCartes(); await aller('fiche:deux-126');
  await pg.selectOption(`${Z} [data-fiche-champ="p-arm1"]`, 'deux');
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'pourquoi-deux', 'question au premier portage');
  await qFil();
  await envoyerDeux();
  await envoyerCaisse();
  const c = await base();
  egal(c.questions[ID]['soixante-kg'].premiere, 'medecin', 'la réflexion est rangée après la caisse');
});

await v('ENT-12.6 : questions au fil — une fausse ôte son poids (18,5 ; 18,5 ; 19) ; toutes fausses ôtent 4 (16) ; la réflexion ne compte pas', async () => {
  const joue = async (RR) => { await mont(); R = { ...RJ, ...RR }; await jouer(); R = RJ; return (await noter(ACT)).score; };
  proche(await joue({ 'lourd-dabord': 'vite' }), 18.5, 'lourd-dabord faux');
  proche(await joue({ 'pourquoi-deux': 'drole' }), 18.5, 'pourquoi-deux faux');
  proche(await joue({ 'ton-parcours': 'retours' }), 19, 'ton-parcours faux');
  proche(await joue(RF), 16, 'toutes fausses (la réflexion ne compte pas)');
});

// ─────────────────────────────────────────────────────────── le corrigé et la fin
await v('ENT-12.6 : le fichier de corrigé est servi ; celui d’un élève dit son second client, son départ, le plus court (116 m) et si les commandes tiennent', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-12.6.js');
    const e = C.corrigeEleve({}, 'ik126');
    return { n: C.CORRIGE.items.length, status: (await fetch('/contenus/corriges/ENT-12.6.js')).status, eleve: e.items.map((i) => i.rep).join(' | ') };
  });
  egal(r.status, 200, 'servi'); egal(r.n, 5, 'étapes');
  vrai(/M\. Fabre/.test(r.eleve) && /116 m/.test(r.eleve) && /seuil du jalon : 140 m/.test(r.eleve) && /elles tiennent/.test(r.eleve), 'corrigé de l’élève : ' + r.eleve.slice(0, 300));
});

await v('ENT-12.6 : le mot « bonus » n’apparaît pas à l’écran, aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
