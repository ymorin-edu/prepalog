// Suite de tests de Prepalog — bloc « transport » : les deux vues de transport du noyau (plan, tournée), la carte cliquable et l'évaluateur de formules.
//
// Découpé de `outils/test.mjs` le 02/10/2026 (chantier C, voir `claude/prepalog-chantiers-en-cours.md`).
// Le lanceur reste `node outils/test.mjs` ; `node outils/test.mjs transport` ne lance que ce bloc.
// Le corps n'est volontairement PAS réindenté : c'est le code d'origine, ligne pour ligne, et
// réindenter aurait aussi décalé le contenu des chaînes sur plusieurs lignes.
// Ce que le bloc reçoit du lanceur (`commun.mjs`) : le navigateur, la page partagée, `v()`, etc.

import fs from 'node:fs';
import path from 'node:path';

export default async function bloc({ v, nav, ko, ROOT }) {

// ---------- 44 à 56. les deux vues de transport du noyau — plan et tournée
//
// Écrites le 02/10/2026 pour ENT-3.1 (la tournée du vélo-cargo de Boost), mais aucun
// contenu ne les déclare encore : c'est le lot 1, le noyau seul. On les éprouve donc sur un
// scénario d'ESSAI, monté à la main dans un onglet dédié, et on passe par `creerEntreprise`
// plutôt que par les deux modules directement — c'est le branchement autant que le calcul
// qu'on veut garder : entrée de menu, état rangé dans la base de l'élève, jalon remonté.
//
// Le scénario d'essai est choisi pour que les deux contraintes basculent au même endroit :
// les quatre points pèsent 230 kg pour 180 kg utiles ET font rentrer à 13 h 51 pour un
// train à 13 h 46 ; en laisser un à quai ramène à 180 kg pile et à 13 h 45. C'est la règle
// du projet — vérifier dans les deux sens, pas seulement voir du vert.
const ctxTr = await nav.newContext();
const pageTr = await ctxTr.newPage();
pageTr.setDefaultTimeout(8000);
const erreursTr = [];
pageTr.on('pageerror', (e) => erreursTr.push('PAGEERROR: ' + e.message));
pageTr.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursTr.push('CONSOLE: ' + m.text()); });
await pageTr.goto('http://127.0.0.1:8099/');
await pageTr.waitForSelector('#btnProf', { timeout: 8000 });

// Le montage. Tout le scénario vit ici, dans la page : les cases de report portent des
// fonctions, qui ne traversent pas la frontière entre Node et le navigateur.
await pageTr.evaluate(async () => {
  const m = await import('/core/types/entreprise.js');

  const PLAN = {
    libelle: 'Plan d\'essai', titre: 'Plan d\'essai',
    consigne: 'Situez les quatre points, puis écrivez leur case.',
    largeur: 400, hauteur: 200,
    fond: '<rect x="0" y="0" width="400" height="200" fill="none"/>',
    grille: { colonnes: 'ABCD', lignes: 2 },
    echelle: { pixels: 100, facteurRoute: 1, libelle: '1 km' },
    depart: { nom: 'Depot Essai', lettre: 'D', x: 50, y: 50 },
    arrivee: { nom: 'Gare Essai', x: 350, y: 150 },
    points: [
      { id: 'p1', nom: 'Client Un', zone: 'Quartier Un', adresse: '1 rue Une', x: 150, y: 50, kg: 60, colis: 2 },
      { id: 'p2', nom: 'Client Deux', zone: 'Quartier Deux', adresse: '2 rue Deux', x: 250, y: 50, kg: 60, colis: 3 },
      { id: 'p3', nom: 'Client Trois', zone: 'Quartier Trois', adresse: '3 rue Trois', x: 150, y: 150, kg: 60, colis: 4 },
      { id: 'p4', nom: 'Client Quatre', zone: 'Quartier Quatre', adresse: '4 rue Quatre', x: 250, y: 150, kg: 50, colis: 1 },
    ],
    enLigne: { libelle: 'Ouvrir un plan en ligne', url: 'https://plan.invalid/essai' },
    reperage: { consigne: 'Une case par point.', champ: 'Case', secours: 'Je n\'ai pas acces a Internet' },
  };

  const TOURNEE = {
    libelle: 'Tournee d\'essai', titre: 'Tournee d\'essai',
    mesures: [
      { id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: 180 },
      { id: 'colis', libelle: 'Colis', unite: 'colis', champ: 'colis' },
    ],
    horaire: { depart: 13 * 60, limite: 13 * 60 + 46, vitesse: 12, service: 6, libelleLimite: 'depart du train' },
    report: [
      { id: 'rcharge', libelle: 'Charge emportee', unite: 'kg', valeur: (b) => b.cumuls.charge },
      { id: 'rarrets', libelle: 'Nombre d\'arrets', valeur: (b) => b.retenus.length },
      { id: 'rkm', libelle: 'Distance', unite: 'km', tolerance: 0.1, valeur: (b) => b.km },
      { id: 'rretour', libelle: 'Minute de retour', valeur: (b) => Math.round(b.arrivee) },
    ],
  };

  const base = () => ({
    v: 1, seq: 1, stock: {}, mails: [], orders: [], receptions: [], moves: [],
    customers: [], suppliers: [], _depart: [],
  });
  const CAT = { MODELS: [], MM: {}, VARIANTS: [], VM: {} };
  const commun = {
    ENTREPRISE: { nom: 'Essai Transport', sousTitre: 'scenario d\'essai' },
    VOCAB: { unit: 'piece', unitPl: 'pieces', sizeLabel: 'Taille' },
    CATALOGUE: CAT, SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {},
    baseDeDepart: base, THEME: {},
  };

  // `db` est passable de l'extérieur : c'est ce qui permet de monter DEUX séances sur une
  // même base, comme les trois séances de Spartoo le font en production.
  const monter = (hoteId, extra, etapes, metaId, db, role) => {
    const hote = document.createElement('div');
    hote.id = hoteId;
    document.body.appendChild(hote);
    db = db || {};
    const suivi = [];
    const act = m.creerEntreprise(Object.assign({}, commun, { etapes: etapes || [] }, extra));
    act.rendre(hote, {
      meta: { id: metaId || 'ess1', portee: 'eleve', code: 'ESS-1', titre: 'Essai Transport — transport' },
      profil: { prenom: 'Lea', nom: 'Dupont', role: role || 'eleve' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: (r) => suivi.push(r),
      quitter: () => {}, codeStock: 'ABC',
    });
    return { db, suivi };
  };

  // Un jalon qui lit l'état de la vue plan : c'est le chemin que suivra le contenu.
  const etapes = [{
    id: 'rep', titre: 'Reperage fait',
    verifier: (db) => ({
      status: db.transport && db.transport.ess1 && db.transport.ess1.plan
        && db.transport.ess1.plan.valide ? 'ok' : 'attente',
    }),
  }];

  const avec = monter('essaiTr', { plan: PLAN, tournee: TOURNEE }, etapes, 'ess1');
  const sans = monter('essaiSans', {}, [], 'ess0');
  // Une deuxième séance SUR LA MÊME BASE, comme deux séances d'une même entreprise.
  const jumelle = monter('essaiJumelle', { plan: PLAN, tournee: TOURNEE }, [], 'ess2', avec.db);
  // Une séance pour la porte de sortie : deux essais, puis « continuer quand même ».
  const planSortie = Object.assign({}, PLAN, {
    reperage: Object.assign({}, PLAN.reperage, { essaisAvantIssue: 2, issue: 'Je ne trouve pas' }),
  });
  const sortie = monter('essaiSortie', { plan: planSortie, tournee: TOURNEE }, [], 'ess4');
  // Une séance qui tolère une case fausse, et qui ne bloque pas du tout la suite : l'élève
  // avance avec son erreur, qui reste visible.
  const planTol = Object.assign({}, PLAN, {
    reperage: Object.assign({}, PLAN.reperage, { toleres: 1, blocant: false }),
  });
  const tolere = monter('essaiTolere', { plan: planTol, tournee: TOURNEE }, [], 'ess5');
  // Et une séance où le transport n'est qu'une contrainte de charge : pas de plan du tout.
  const sansPlan = monter('essaiSansPlan', {
    tournee: {
      libelle: 'Chargement', titre: 'Chargement',
      points: PLAN.points,
      mesures: [{ id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: 180 }],
      report: [{ id: 'rcharge', libelle: 'Charge emportee', unite: 'kg', valeur: (b) => b.cumuls.charge }],
    },
  }, [], 'ess3');
  // La même séance, ouverte par l'enseignant : il essaie la tournée sans refaire le repérage.
  const prof = monter('essaiProf', { plan: PLAN, tournee: TOURNEE }, etapes, 'ess1', null, 'prof');
  window.__tr = { avec, sans, jumelle, sansPlan, sortie, tolere, prof, PLAN };
});

const casesJustes = { p1: 'B1', p2: 'C1', p3: 'B2', p4: 'C2' };
const ouvrir = async (vue) => {
  await pageTr.click(`#essaiTr .ent-nav[data-vue="${vue}"]`);
  await pageTr.waitForTimeout(80);
};
const texteTr = () => pageTr.textContent('#essaiTr .ent-main');

await v('transport : les deux vues ajoutent leur entrée de menu, et seulement si elles sont déclarées', async () => {
  const n = await pageTr.$$eval('#essaiTr .ent-nav[data-vue="plan"], #essaiTr .ent-nav[data-vue="tournee"]', (e) => e.length);
  if (n !== 2) throw new Error(`${n} entrée(s) de transport au lieu de 2`);
  const sep = await pageTr.$$eval('#essaiTr .ent-sep', (e) => e.map((x) => x.textContent));
  if (!sep.includes('Transport')) throw new Error('séparateur « Transport » absent : ' + sep.join(', '));
  // Et l'entreprise qui ne déclare rien garde exactement ses écrans d'avant.
  const m2 = await pageTr.$$eval('#essaiSans .ent-nav[data-vue="plan"], #essaiSans .ent-nav[data-vue="tournee"]', (e) => e.length);
  if (m2 !== 0) throw new Error('une entreprise sans transport affiche quand même ces vues');
  const sep2 = await pageTr.$$eval('#essaiSans .ent-sep', (e) => e.map((x) => x.textContent));
  if (sep2.includes('Transport')) throw new Error('séparateur « Transport » affiché sans transport');
});

await v('vue plan : quadrillage, repères, légende et échelle sont dessinés', async () => {
  await ouvrir('plan');
  const pts = await pageTr.$$eval('#essaiTr .plan-pt', (e) => e.length);
  if (pts !== 4) throw new Error(`${pts} point(s) dessiné(s) au lieu de 4`);
  const svg = await pageTr.textContent('#essaiTr .plan-svg');
  for (const c of ['A', 'B', 'C', 'D', '1', '2', '1 km']) {
    if (!svg.includes(c)) throw new Error(`repère « ${c} » absent du plan`);
  }
  const dep = await pageTr.$$eval('#essaiTr .plan-depart', (e) => e.length);
  const arr = await pageTr.$$eval('#essaiTr .plan-arrivee', (e) => e.length);
  if (dep !== 1 || arr !== 1) throw new Error('départ ou arrivée non dessiné');
  const leg = await pageTr.$$eval('#essaiTr .plan-legende span', (e) => e.length);
  if (leg < 4) throw new Error(`${leg} entrée(s) de légende`);
});

await v('vue plan : au temps 1 le plan est muet, et les quartiers sont cachés', async () => {
  const svg = await pageTr.textContent('#essaiTr .plan-svg');
  if (/Client Un|Client Deux/.test(svg)) throw new Error('les noms des points sont déjà sur le plan');
  const zones = await pageTr.$$eval('#essaiTr .plan-zone', (e) => e.map((x) => x.textContent.trim()));
  if (zones.some((z) => /Quartier/.test(z))) throw new Error('les quartiers sont donnés avant le filet de sécurité');
  if (zones.length !== 4) throw new Error(`${zones.length} ligne(s) de repérage au lieu de 4`);
});

await v('vue plan : une case fausse est vue, et le temps 2 reste fermé', async () => {
  // Sabotage volontaire : p3 est en B2, on écrit A1. Le reste est juste.
  for (const [id, c] of Object.entries(casesJustes)) {
    await pageTr.fill(`#essaiTr .plan-case[data-case="${id}"]`, id === 'p3' ? 'A1' : c);
  }
  await pageTr.click('#essaiTr [data-plan-valider]');
  await pageTr.waitForTimeout(100);
  const t = await texteTr();
  if (!/à revoir/.test(t)) throw new Error('la case fausse n\'est pas signalée');
  const ko = await pageTr.$$eval('#essaiTr .plan-table tr.plan-ko', (e) => e.length);
  if (ko !== 1) throw new Error(`${ko} ligne(s) marquée(s) fausse(s) au lieu d'une`);
  const svg = await pageTr.textContent('#essaiTr .plan-svg');
  if (/Client Un/.test(svg)) throw new Error('le temps 2 s\'est ouvert malgré une erreur');
  if (!/Valider le repérage/.test(t)) throw new Error('le bouton de validation a disparu');
});

await v('bandeau : trames et mode hors connexion tiennent ensemble, dans l’ordre', async () => {
  // ENT-3.1 n'a pas encore de trame élève, mais elle en aura une comme les trois Spartoo, et le
  // bandeau portera alors QUATRE actions. Ce cas monte une séance qui déclare les deux trames ET
  // un plan, pour garder dès maintenant qu'elles cohabitent et dans quel ordre : remise à zéro,
  // les deux trames (elles vont par paire), puis le réglage de poste, puis Quitter.
  const ordre = await pageTr.evaluate(async () => {
    const m = await import('/core/types/entreprise.js');
    const P = window.__tr.PLAN;
    const hote = document.createElement('div');
    hote.id = 'essaiBandeau';
    document.body.appendChild(hote);
    const CAT = { MODELS: [], MM: {}, VARIANTS: [], VM: {} };
    const act = m.creerEntreprise({
      ENTREPRISE: { nom: 'Essai Bandeau', sousTitre: 'essai' },
      VOCAB: { unit: 'piece', unitPl: 'pieces', sizeLabel: 'Taille' },
      CATALOGUE: CAT, SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {},
      baseDeDepart: () => ({ v: 1, seq: 1, stock: {}, mails: [], orders: [], receptions: [],
        moves: [], customers: [], suppliers: [], _depart: [] }),
      THEME: {}, etapes: [], plan: P,
      trame: { pdf: './x.pdf', docx: './x.docx' },
    });
    act.rendre(hote, {
      meta: { id: 'essBandeau', portee: 'eleve', code: 'ESS-1', titre: 'Essai bandeau', reinitialisable: true },
      profil: { prenom: 'Lea', role: 'eleve' },
      jeu: { etat: () => ({}), sauver: () => {} },
      enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    });
    const b = hote.querySelector('.ent-bandeau');
    return {
      actions: [...b.querySelectorAll('.ent-act, .ent-sortie')].map((e) => e.textContent.trim()),
      // Le libellé du mode hors connexion vient du CONTENU (`reperage.secours`), pas du noyau :
      // un scénario sans carte en ligne peut l'appeler autrement.
      libelleDeclare: P.reperage.secours,
      // Le bandeau se replie sur deux lignes au lieu de déborder (`flex-wrap`), donc ce qu'on
      // garde, c'est qu'il ne déborde PAS en largeur — sinon des boutons sortiraient de l'écran.
      deborde: b.scrollWidth > b.clientWidth + 1,
    };
  });
  const attendu = ['Réinitialiser', 'Trame PDF', 'Trame Word', ordre.libelleDeclare, 'Quitter'];
  if (ordre.actions.join(' · ') !== attendu.join(' · ')) {
    throw new Error('bandeau : ' + ordre.actions.join(' · '));
  }
  if (ordre.deborde) throw new Error('le bandeau déborde en largeur : des boutons sortent de l’écran');
});

// Remise à zéro de la base : réservée aux séances X.1 (décision du 02/10/2026). Une séance X.2 ou
// X.3 reprend le travail de la précédente : un élève absent commence la séance manquée à son
// étape 1, sans sauter d'étape, et ne repart jamais de zéro. Le noyau ne dessine le bouton que si `meta.reinitialisable` est vrai ;
// ce cas garde que seules les activités dont le code finit par « .1 » le déclarent.
await v('remise à zéro de la base : seulement en séance X.1', async () => {
  const problemes = [];
  let n = 0;
  for (const e of fs.readdirSync(path.join(ROOT, 'activites'))) {
    if (!/\.js$/.test(e) || e === 'index.js') continue;
    const src = fs.readFileSync(path.join(ROOT, 'activites', e), 'utf8');
    const code = /code:\s*'(ENT-[\d.]+)'/.exec(src)?.[1];
    if (!code) continue;
    n++;
    const dit = /reinitialisable:\s*true/.test(src);
    if (dit !== /\.1$/.test(code)) problemes.push(`${e} (${code}) : reinitialisable ${dit ? 'vrai' : 'absent'}`);
  }
  if (n < 4) throw new Error(`seulement ${n} séances ENT lues`);
  if (problemes.length) throw new Error(problemes.join(' ; '));
});

await v('vue plan : le mode hors connexion est dans le bandeau, pas dans la vue', async () => {
  // Déplacé le 03/10/2026. Sous la carte, à portée de souris et au milieu du travail, ce bouton
  // se lisait comme une aide à l'exercice : « la majorité des élèves va juste cliquer dessus
  // pour avoir les réponses » (Tristan). Dans le bandeau, à côté de « Réinitialiser », il se lit
  // comme un réglage de poste. Ce cas garde les DEUX moitiés du déménagement.
  if (await pageTr.$$eval('#essaiTr .ent-main [data-plan-secours]', (e) => e.length)) {
    throw new Error('le mode hors connexion est redescendu dans la vue plan');
  }
  const bandeau = await pageTr.$$eval('#essaiTr .ent-bandeau [data-hors-connexion]', (e) => e.length);
  if (bandeau !== 1) throw new Error(bandeau + ' bouton(s) « hors connexion » dans le bandeau');
  await pageTr.click('#essaiTr [data-hors-connexion]');
  await pageTr.waitForTimeout(140);
  // Une fois activé, il ne se reclique pas : le recours est horodaté une fois pour toutes.
  if (!(await pageTr.$eval('#essaiTr [data-hors-connexion]', (e) => e.disabled))) {
    throw new Error('le mode hors connexion reste cliquable après coup');
  }
  const zones = await pageTr.$$eval('#essaiTr .plan-zone', (e) => e.map((x) => x.textContent.trim()));
  if (zones.filter((z) => /Quartier/.test(z)).length !== 4) throw new Error('les quartiers ne sont pas révélés');
  const cases = await pageTr.$$eval('#essaiTr .plan-case', (e) => e.map((x) => x.value));
  if (cases.join('|') !== 'B1|C1|A1|C2') throw new Error('les cases saisies ont bougé : ' + cases.join('|'));
  const t = await texteTr();
  if (!/reste à lire sur le plan/.test(t)) throw new Error('le mode hors connexion ne dit pas ce qu\'il ne donne pas');
});

await v('vue tournée : fermée tant que le repérage n\'est pas validé', async () => {
  await ouvrir('tournee');
  const t = await texteTr();
  if (!/Commencez par/.test(t)) throw new Error('la tournée s\'ouvre avant le repérage');
  const items = await pageTr.$$eval('#essaiTr .tour-item', (e) => e.length);
  if (items !== 0) throw new Error('les arrêts sont déjà manipulables');
});

await v('vue tournée : l\'enseignant l\'ouvre sans repérage, sans rien écrire dans le plan', async () => {
  await pageTr.click('#essaiProf .ent-nav[data-vue="tournee"]');
  await pageTr.waitForTimeout(80);
  const t = await pageTr.textContent('#essaiProf .ent-main');
  if (/Commencez par/.test(t)) throw new Error('la tournée reste verrouillée pour l\'enseignant');
  const items = await pageTr.$$eval('#essaiProf .tour-item', (e) => e.length);
  if (!items) throw new Error('aucun arrêt manipulable côté enseignant');
  const valide = await pageTr.evaluate(() => {
    const p = window.__tr.prof.db.transport && window.__tr.prof.db.transport.ess1 && window.__tr.prof.db.transport.ess1.plan;
    return !!(p && p.valide);
  });
  if (valide) throw new Error('le repérage a été marqué validé dans la base de l\'enseignant');
});

await v('vue plan : les quatre cases justes ouvrent le temps 2', async () => {
  await ouvrir('plan');
  await pageTr.fill('#essaiTr .plan-case[data-case="p3"]', 'b 2');   // minuscule et espace : acceptés
  await pageTr.click('#essaiTr [data-plan-valider]');
  await pageTr.waitForTimeout(120);
  const t = await texteTr();
  if (!/Repérage validé/.test(t)) throw new Error('le repérage n\'est pas validé');
  const svg = await pageTr.textContent('#essaiTr .plan-svg');
  for (const n of ['Client Un', 'Client Deux', 'Client Trois', 'Client Quatre']) {
    if (!svg.includes(n)) throw new Error(`le nom « ${n} » n'apparaît pas au temps 2`);
  }
});

await v('transport : l\'état vit dans la base de l\'élève et le jalon remonte au suivi', async () => {
  const r = await pageTr.evaluate(() => ({
    valide: !!(window.__tr.avec.db.transport && window.__tr.avec.db.transport.ess1
      && window.__tr.avec.db.transport.ess1.plan && window.__tr.avec.db.transport.ess1.plan.valide),
    cases: window.__tr.avec.db.transport.ess1.plan.cases,
    dernier: window.__tr.avec.suivi[window.__tr.avec.suivi.length - 1],
  }));
  if (!r.valide) throw new Error('le repérage validé n\'est pas écrit dans la base de l\'élève');
  if (r.cases.p3 !== 'b 2') throw new Error('la saisie n\'est pas conservée : ' + JSON.stringify(r.cases));
  if (!r.dernier || r.dernier.score !== 1 || r.dernier.max !== 1) {
    throw new Error('jalon non remonté : ' + JSON.stringify(r.dernier));
  }
});

await v('transport : deux séances d\'une même entreprise ne se marchent pas sur l\'état', async () => {
  // La vraie raison d'être de ce test : les séances d'une entreprise partagent UNE base. Si
  // l'état du transport n'était pas rangé par séance, le repérage validé ci-dessus aurait
  // ouvert d'office le temps 2 de la séance jumelle — et l'élève aurait sauté l'exercice.
  // Il faut ouvrir sa vue : l'état d'une séance n'est créé qu'à l'ouverture, pas au montage.
  await pageTr.click('#essaiJumelle .ent-nav[data-vue="plan"]');
  await pageTr.waitForTimeout(120);
  const cles = await pageTr.evaluate(() => Object.keys(window.__tr.avec.db.transport).sort());
  if (cles.join(',') !== 'ess1,ess2') throw new Error('clés de transport : ' + cles.join(','));
  const svg = await pageTr.textContent('#essaiJumelle .plan-svg');
  if (/Client Un/.test(svg)) throw new Error('la séance jumelle est déjà au temps 2');
  const t = await pageTr.textContent('#essaiJumelle .ent-main');
  if (!/Valider le repérage/.test(t)) throw new Error('la séance jumelle n\'a pas son propre repérage');
  // Et la base de la séance jumelle est bien la même : c'est un partage, pas deux bases.
  const memeBase = await pageTr.evaluate(() => window.__tr.jumelle.db === window.__tr.avec.db);
  if (!memeBase) throw new Error('test invalide : les deux séances n\'ont pas la même base');
});

await v('vue tournée : utilisable sans plan, pour une simple contrainte de charge', async () => {
  // Beaucoup de scénarios n'auront pas de carte : le transport y sera une contrainte de
  // plus, pas le sujet. La vue doit alors fonctionner sans plan, sans distance et sans
  // horaire — et sans se verrouiller, puisqu'il n'y a pas de repérage à faire.
  await pageTr.click('#essaiSansPlan .ent-nav[data-vue="tournee"]');
  await pageTr.waitForTimeout(100);
  const z = '#essaiSansPlan .ent-main';
  const svg = await pageTr.$$eval(`${z} .plan-svg`, (e) => e.length);
  if (svg !== 0) throw new Error('un plan est dessiné alors qu\'aucun n\'est déclaré');
  const items = await pageTr.$$eval(`${z} #tourListe .tour-item`, (e) => e.length);
  if (items !== 4) throw new Error(`${items} arrêt(s) au lieu de 4`);
  let t = await pageTr.textContent(z);
  if (/Commencez par/.test(t)) throw new Error('la vue se verrouille alors qu\'il n\'y a pas de repérage');
  if (!/Charge dépassée de 50 kg/.test(t)) throw new Error('le plafond de charge ne joue pas sans plan');
  if (/Retour prévu/.test(t)) throw new Error('un horaire est affiché sans plan, donc sans distance');
  if (/tracé du plan/.test(t)) throw new Error('la consigne parle d\'un tracé inexistant');
  // Et elle reste pilotable : laisser un arrêt à quai ramène sous le plafond.
  await pageTr.click(`${z} [data-quai="p4"]`);
  await pageTr.waitForTimeout(100);
  t = await pageTr.textContent(z);
  if (!/180 \/ 180 kg/.test(t) || /dépassée/.test(t)) throw new Error('la charge ne se recalcule pas sans plan');
});

await v('vue tournée : les quatre arrêts dépassent la charge ET font manquer l\'horaire', async () => {
  await ouvrir('tournee');
  const items = await pageTr.$$eval('#essaiTr #tourListe .tour-item', (e) => e.length);
  if (items !== 4) throw new Error(`${items} arrêt(s) au lieu de 4`);
  const t = await texteTr();
  if (!/Charge dépassée de 50 kg/.test(t)) throw new Error('dépassement de charge non signalé : ' + t.slice(0, 400));
  if (!/depart du train manqué/.test(t)) throw new Error('horaire manqué non signalé');
  if (!/13 h 51/.test(t)) throw new Error('heure de retour inattendue');
  const trop = await pageTr.$$eval('#essaiTr .tour-jauge.trop', (e) => e.length);
  if (trop !== 2) throw new Error(`${trop} jauge(s) en alerte au lieu de 2`);
});

await v('vue tournée : laisser un arrêt à quai ramène sous le plafond et dans l\'horaire', async () => {
  await pageTr.click('#essaiTr [data-quai="p4"]');
  await pageTr.waitForTimeout(120);
  const t = await texteTr();
  if (!/180 \/ 180 kg/.test(t)) throw new Error('la charge n\'est pas recalculée : ' + t.slice(0, 300));
  if (/dépassée|manqué/.test(t)) throw new Error('une alerte subsiste alors que tout passe');
  if (!/13 h 45/.test(t)) throw new Error('heure de retour inattendue après le retrait');
  const trop = await pageTr.$$eval('#essaiTr .tour-jauge.trop', (e) => e.length);
  if (trop !== 0) throw new Error('une jauge reste en alerte');
  const quai = await pageTr.$$eval('#essaiTr .tour-liste-quai .tour-item', (e) => e.length);
  if (quai !== 1) throw new Error('l\'arrêt n\'est pas à quai');
});

await v('vue tournée : les flèches réordonnent, et le tracé du plan suit', async () => {
  const avant = await pageTr.getAttribute('#essaiTr .plan-trace', 'points');
  await pageTr.click('#essaiTr [data-bas="0"]');
  await pageTr.waitForTimeout(120);
  const noms = await pageTr.$$eval('#essaiTr #tourListe .tour-item strong', (e) => e.map((x) => x.textContent));
  if (noms[0] !== 'Client Deux' || noms[1] !== 'Client Un') throw new Error('ordre inchangé : ' + noms.join(', '));
  const apres = await pageTr.getAttribute('#essaiTr .plan-trace', 'points');
  if (apres === avant) throw new Error('le tracé ne suit pas l\'ordre');
  if (!apres.startsWith('50,50 250,50')) throw new Error('tracé inattendu : ' + apres);
  // On remet l'ordre d'origine pour la suite.
  await pageTr.click('#essaiTr [data-haut="1"]');
  await pageTr.waitForTimeout(120);
});

await v('vue tournée : le glisser-déposer réordonne aussi', async () => {
  const src = pageTr.locator('#essaiTr #tourListe .tour-item').nth(2);
  const cible = pageTr.locator('#essaiTr #tourListe .tour-item').nth(0);
  await src.dragTo(cible);
  await pageTr.waitForTimeout(150);
  const noms = await pageTr.$$eval('#essaiTr #tourListe .tour-item strong', (e) => e.map((x) => x.textContent));
  if (noms[0] !== 'Client Trois') throw new Error('le glisser-déposer n\'a rien déplacé : ' + noms.join(', '));
  // Retour à l'ordre p1, p2, p3 par les flèches, pour que les valeurs attendues soient connues.
  await pageTr.click('#essaiTr [data-bas="0"]');
  await pageTr.waitForTimeout(100);
  await pageTr.click('#essaiTr [data-bas="1"]');
  await pageTr.waitForTimeout(100);
  const n2 = await pageTr.$$eval('#essaiTr #tourListe .tour-item strong', (e) => e.map((x) => x.textContent));
  if (n2.join('|') !== 'Client Un|Client Deux|Client Trois') throw new Error('ordre non rétabli : ' + n2.join('|'));
});

await v('vue tournée : une valeur reportée fausse est vue, les quatre justes sont acceptées', async () => {
  const saisir = async (vals) => {
    for (const [id, val] of Object.entries(vals)) {
      await pageTr.fill(`#essaiTr [data-report="${id}"]`, val);
    }
    await pageTr.click('#essaiTr [data-tour-valider]');
    await pageTr.waitForTimeout(140);
  };
  // Sabotage : la charge est à 180, on écrit 170. Les trois autres sont justes.
  await saisir({ rcharge: '170', rarrets: '3', rkm: '5,4', rretour: '825' });
  let t = await texteTr();
  if (!/1 résultat\(s\)\s+à revoir/.test(t)) throw new Error('la valeur fausse n\'est pas vue : ' + t.slice(-400));
  let ko = await pageTr.$$eval('#essaiTr .tour-saisie input.faux', (e) => e.length);
  if (ko !== 1) throw new Error(`${ko} case(s) marquée(s) fausse(s) au lieu d'une`);

  await saisir({ rcharge: '180' });
  t = await texteTr();
  if (!/Tous les résultats sont justes/.test(t)) throw new Error('les quatre justes ne sont pas acceptés : ' + t.slice(-400));
  const okc = await pageTr.$$eval('#essaiTr .tour-saisie input.juste', (e) => e.length);
  if (okc !== 4) throw new Error(`${okc} case(s) juste(s) au lieu de 4`);
  const valide = await pageTr.evaluate(() => !!window.__tr.avec.db.transport.ess1.tournee.valide);
  if (!valide) throw new Error('la tournée validée n\'est pas écrite dans la base');
});

await v('vue tournée : réordonner après coup efface la correction', async () => {
  await pageTr.click('#essaiTr [data-bas="0"]');
  await pageTr.waitForTimeout(120);
  const t = await texteTr();
  if (/sont justes|à revoir/.test(t)) throw new Error('la correction survit à un changement d\'ordre');
  const marques = await pageTr.$$eval('#essaiTr .tour-saisie input.juste, #essaiTr .tour-saisie input.faux', (e) => e.length);
  if (marques !== 0) throw new Error('des cases restent marquées');
});

/* ===================================================================================== */
/* La carte cliquable et les deux encres — écrites le 04/10/2026.                        */
/*                                                                                       */
/* Deux chantiers en un. Tristan, le 03/10 au soir : *« tout est laborieux, on pourrait   */
/* repartir sur une carte cliquable beaucoup plus intuitive ? »*, et, une heure plus tôt, */
/* *« le numéro en rond bleu qui indique la position sur la carte, il indique aussi la    */
/* position dans la liste, ça porte à confusion »*. Le second est absorbé par le premier :  */
/* dès qu'on construit la tournée sur la carte, distinguer le client de son rang n'est    */
/* plus cosmétique, c'est la condition pour savoir sur quoi on clique.                    */
/* ===================================================================================== */

// L'ordre et le quai posés à la main, puis un aller-retour de vue pour redessiner. C'est le
// même procédé que pour ENT-3.1 : on fixe l'état, et on mesure ce que la vue en fait.
const poserTr = async (ordre, quai) => {
  await pageTr.evaluate((o) => {
    const t = window.__tr.avec.db.transport.ess1.tournee;
    t.ordre = o.ordre; t.quai = o.quai; t.juge = {}; t.bloque = null;
  }, { ordre, quai });
  await ouvrir('plan');
  await ouvrir('tournee');
};
// Ce que la carte porte vraiment, point par point : le chiffre du rond, celui de la pastille,
// et l'état creux. C'est la seule lecture qui vaille — le reste est dans l'état, pas à l'écran.
const lireCarte = () => pageTr.$$eval('#essaiTr .plan-svg .plan-pt', (gs) => gs.map((g) => ({
  id: g.dataset.point,
  rond: g.querySelector('text').textContent.trim(),
  ordre: g.querySelector('.plan-pt-ordre text')
    ? g.querySelector('.plan-pt-ordre text').textContent.trim() : null,
  quai: g.classList.contains('plan-pt-quai'),
})));

await v('carte cliquable : un clic ajoute l’arrêt À LA FIN de la tournée', async () => {
  // La règle la plus simple à expliquer à une classe : on clique, ça se met au bout. Pas de
  // discussion sur l'endroit où l'arrêt se glisse — les flèches servent à ça ensuite.
  await poserTr(['p1', 'p2'], ['p3', 'p4']);
  let e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee);
  if (e.ordre.join(',') !== 'p1,p2') throw new Error('état de départ : ' + e.ordre.join(','));

  await pageTr.click('#essaiTr [data-clic-point="p4"]');
  await pageTr.waitForTimeout(120);
  e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee);
  if (e.ordre.join(',') !== 'p1,p2,p4') throw new Error('p4 n’est pas ajouté à la fin : ' + e.ordre.join(','));
  if (e.quai.join(',') !== 'p3') throw new Error('le quai n’a pas lâché p4 : ' + e.quai.join(','));

  // Et le second clic se met APRÈS le premier, pas ailleurs.
  await pageTr.click('#essaiTr [data-clic-point="p3"]');
  await pageTr.waitForTimeout(120);
  e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee);
  if (e.ordre.join(',') !== 'p1,p2,p4,p3') throw new Error('ordre après deux clics : ' + e.ordre.join(','));
  if (e.quai.length) throw new Error('le quai n’est pas vide : ' + e.quai.join(','));
  // Le tracé du plan suit : départ (50,50) → p1 (150,50) → p2 (250,50) → p4 (250,150) → p3…
  const trace = await pageTr.getAttribute('#essaiTr .plan-trace', 'points');
  if (!trace.startsWith('50,50 150,50 250,50 250,150 150,150')) throw new Error('tracé : ' + trace);
});

await v('carte cliquable : un clic sur un arrêt chargé le retire, et les suivants se renumérotent', async () => {
  await poserTr(['p1', 'p2', 'p4', 'p3'], []);
  await pageTr.click('#essaiTr [data-clic-point="p2"]');
  await pageTr.waitForTimeout(120);
  const e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee);
  if (e.ordre.join(',') !== 'p1,p4,p3') throw new Error('p2 n’est pas retiré : ' + e.ordre.join(','));
  if (e.quai.join(',') !== 'p2') throw new Error('p2 n’est pas au quai : ' + e.quai.join(','));
  // La renumérotation est le point sensible : p4 était 3ᵉ, il devient 2ᵉ.
  const c = await lireCarte();
  const par = Object.fromEntries(c.map((x) => [x.id, x]));
  if (par.p1.ordre !== '1' || par.p4.ordre !== '2' || par.p3.ordre !== '3') {
    throw new Error('ordre mal renuméroté : ' + JSON.stringify(c));
  }
  if (par.p2.ordre !== null) throw new Error('un arrêt retiré garde sa pastille d’ordre');
});

await v('carte cliquable : deux encres, deux sens — le rond dit le client, la pastille dit le rang', async () => {
  // Le défaut d'origine, reproduit exactement : trois arrêts chargés dont le QUATRIÈME client
  // en troisième position, et le troisième client resté à quai. Avant la correction, le rond
  // de p4 affichait « 3 » (son rang) et celui de p3 affichait « 3 » (son numéro) : deux « 3 »
  // sur la même carte, pour deux choses différentes.
  await poserTr(['p1', 'p2', 'p4'], ['p3']);
  const c = await lireCarte();
  const par = Object.fromEntries(c.map((x) => [x.id, x]));

  // Le rond : le numéro du client, le même partout, et il ne bouge jamais.
  if (c.map((x) => x.rond).join(',') !== '1,2,3,4') {
    throw new Error('les ronds ne portent pas les numéros des clients : ' + JSON.stringify(c));
  }
  // Deux ronds ne peuvent pas porter le même chiffre : c'est la confusion d'origine.
  const ronds = c.map((x) => x.rond);
  if (new Set(ronds).size !== ronds.length) throw new Error('deux ronds portent le même numéro : ' + ronds.join(','));

  // La pastille : le rang, et seulement pour ce qui est chargé.
  if (par.p4.ordre !== '3') throw new Error('p4 devrait être le 3ᵉ arrêt : ' + par.p4.ordre);
  if (par.p4.rond !== '4') throw new Error('le rond de p4 devrait rester le client 4 : ' + par.p4.rond);
  if (par.p3.ordre !== null) throw new Error('un arrêt à quai porte une pastille d’ordre');
  if (!par.p3.quai) throw new Error('l’arrêt resté à quai n’est pas dessiné en creux');
  if (par.p1.quai || par.p2.quai || par.p4.quai) throw new Error('un arrêt chargé est dessiné en creux');

  // Et la légende dit laquelle est laquelle, sinon deux numérotations sur un plan sont pires
  // qu'une seule fausse.
  const leg = await pageTr.$$eval('#essaiTr .plan-legende span', (e) => e.map((x) => x.textContent.trim()).join(' | '));
  if (!/numéro du client/.test(leg)) throw new Error('la légende ne nomme pas le rond : ' + leg);
  if (!/ordre de passage/.test(leg)) throw new Error('la légende ne nomme pas la pastille : ' + leg);
  if (!/resté à quai/.test(leg)) throw new Error('la légende ne nomme pas le rond creux : ' + leg);

  // La liste porte les deux aussi : la pastille de rang à gauche, le numéro du client devant
  // le nom — « 4 · Client Quatre ».
  const lignes = await pageTr.$$eval('#essaiTr #tourListe .tour-item', (ls) => ls.map((l) => ({
    rang: l.querySelector('.tour-rang').textContent.trim(),
    num: l.querySelector('.tour-num').textContent.trim(),
    nom: l.querySelector('strong').textContent.trim(),
  })));
  if (lignes.length !== 3) throw new Error(lignes.length + ' ligne(s) au récapitulatif');
  if (lignes[2].rang !== '3' || lignes[2].num !== '4 ·' || lignes[2].nom !== 'Client Quatre') {
    throw new Error('la 3ᵉ ligne ne porte pas les deux numéros : ' + JSON.stringify(lignes[2]));
  }
});

await v('carte cliquable : la cible de clic est plus grande que le rond, et les noms ne la volent pas', async () => {
  // Au vidéoprojecteur comme à la souris, viser un disque de douze pixels est pénible. Et une
  // étiquette qui attrape le clic est la première source de clics perdus : l'élève vise
  // « Client Un », il touche le texte, rien ne se passe, il recommence.
  const g = await pageTr.evaluate(() => {
    const pt = document.querySelector('#essaiTr .plan-svg .plan-pt');
    const cible = pt.querySelector('.plan-pt-cible');
    const etiq = [...document.querySelectorAll('#essaiTr .plan-svg .plan-pt text')]
      .filter((t) => /Client/.test(t.textContent));
    return {
      rRond: +pt.querySelector('circle').getAttribute('r'),
      rCible: +cible.getAttribute('r'),
      dernier: pt.lastElementChild === cible || pt.children[pt.children.length - 1] === cible,
      role: cible.getAttribute('role'),
      tab: cible.getAttribute('tabindex'),
      aria: cible.getAttribute('aria-label'),
      etiqNeutres: etiq.length > 0 && etiq.every((t) => getComputedStyle(t).pointerEvents === 'none'),
      pastillesNeutres: [...document.querySelectorAll('#essaiTr .plan-pt-ordre')]
        .every((o) => getComputedStyle(o).pointerEvents === 'none'),
    };
  });
  if (g.rCible <= g.rRond) throw new Error(`cible r=${g.rCible} pour un rond r=${g.rRond}`);
  if (g.rCible < 18) throw new Error('cible de clic trop petite : r=' + g.rCible);
  if (!g.dernier) throw new Error('la cible n’est pas posée en dernier : elle passerait sous le reste');
  if (g.role !== 'button' || g.tab !== '0') throw new Error('la cible n’est pas un bouton atteignable : ' + g.role + '/' + g.tab);
  if (!/Client Un/.test(g.aria || '')) throw new Error('la cible ne dit pas ce qu’elle fait : ' + g.aria);
  if (!g.etiqNeutres) throw new Error('les noms des points attrapent le clic');
  if (!g.pastillesNeutres) throw new Error('la pastille d’ordre attrape le clic');
});

await v('carte cliquable : Entrée ajoute et retire, et le focus revient sur le point cliqué', async () => {
  // Chaque point est un bouton : au clavier, Entrée doit faire ce que fait la souris. Le piège
  // est le redessin — il détruit l'élément qui avait le focus, et sans report l'élève est
  // renvoyé en haut de page : son premier Entrée marchait, le second ne faisait plus rien.
  // Trouvé en pilotant l'écran, pas par une relecture.
  await poserTr(['p1', 'p2'], ['p3', 'p4']);
  await pageTr.focus('#essaiTr [data-clic-point="p3"]');
  await pageTr.keyboard.press('Enter');
  await pageTr.waitForTimeout(140);
  let e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee.ordre.join(','));
  if (e !== 'p1,p2,p3') throw new Error('Entrée n’ajoute pas : ' + e);
  const garde = await pageTr.evaluate(() => {
    const a = document.activeElement;
    return a ? a.getAttribute('data-clic-point') : null;
  });
  if (garde !== 'p3') throw new Error('le focus est perdu après le redessin : ' + garde);
  // Le second Entrée, celui qui ne faisait rien.
  await pageTr.keyboard.press('Enter');
  await pageTr.waitForTimeout(140);
  e = await pageTr.evaluate(() => window.__tr.avec.db.transport.ess1.tournee.ordre.join(','));
  if (e !== 'p1,p2') throw new Error('le second Entrée ne retire pas : ' + e);
});

/* ===================================================================================== */
/* L'évaluateur de formules — écrit le 04/10/2026.                                       */
/*                                                                                       */
/* Tristan : *« il doit disposer d'un petit espace tableur intégré où il doit saisir la   */
/* formule pour trouver le temps »*. C'est le morceau du projet où une erreur se voit le  */
/* moins : une formule qui rend un nombre faux ne lève rien, elle ment. Les valeurs       */
/* attendues sont donc ÉCRITES À LA MAIN ici — c'est la règle du projet pour un test, et  */
/* c'est l'inverse de celle d'un générateur.                                              */
/* ===================================================================================== */

await v('formules : les quatre opérations, les priorités, et la virgule française', async () => {
  const r = await pageTr.evaluate(async () => {
    const F = await import('/core/formules.js');
    const v = (c) => F.evaluerGrille(c);
    return {
      nb: [F.nombreFr('12,5'), F.nombreFr('12.5'), F.nombreFr('1 234,5'), F.nombreFr('abc'), F.nombreFr('')],
      calc: ['=2+3*4', '=(2+3)*4', '=2^3^2', '=-3+10', '=10/4', '=12,5+0,5']
        .map((f) => v({ A1: f }).valeurs.A1),
    };
  });
  // La virgule décimale est la frappe d'un élève sur un poste français. Le point est accepté
  // aussi : personne ne doit être puni pour avoir tapé 12.5.
  if (r.nb.join('|') !== '12.5|12.5|1234.5||') throw new Error('lecture des nombres : ' + JSON.stringify(r.nb));
  // 2^3^2 vaut 512 et non 64 : la puissance est associative à DROITE, comme dans Excel.
  if (r.calc.join('|') !== '14|20|512|7|2.5|13') throw new Error('calculs : ' + JSON.stringify(r.calc));
});

await v('formules : SOMME, MOYENNE, MIN, MAX, ARRONDI et les plages', async () => {
  const r = await pageTr.evaluate(async () => {
    const F = await import('/core/formules.js');
    const poids = { B2: '31', B3: '24', B4: '42', B5: '19', B6: '36', B7: '27' };
    return {
      // Les six commandes d'ENT-3.1, et leur somme : 31+24+42+19+36+27.
      somme: F.evaluerGrille(Object.assign({ B8: '=SOMME(B2:B7)' }, poids)).valeurs.B8,
      plage: F.cellulesDePlage('B2', 'B7').join(','),
      envers: F.cellulesDePlage('B7', 'B2').join(','),
      autres: F.evaluerGrille({
        B2: '4', B3: '6',
        A1: '=SOMME(B2:B3;10)', A2: '=MOYENNE(2;4;9)', A3: '=MAX(1;7;3)',
        A4: '=MIN(1;7;3)', A5: '=ARRONDI(12,345;2)', A6: '=ARRONDI(12,5)',
      }).valeurs,
      // Une cellule vide vaut zéro dans une addition, mais ne compte pas dans une moyenne —
      // sinon une plage un peu large fausserait le résultat sans que personne le voie.
      vide: F.evaluerGrille({ B2: '4', B3: '', B4: '6', A1: '=B2+B3', A2: '=MOYENNE(B2:B4)' }).valeurs,
    };
  });
  if (r.somme !== 179) throw new Error('SOMME(B2:B7) = ' + r.somme + ' au lieu de 179');
  if (r.plage !== 'B2,B3,B4,B5,B6,B7') throw new Error('plage : ' + r.plage);
  if (r.envers !== 'B2,B3,B4,B5,B6,B7') throw new Error('plage à l’envers non remise à l’endroit : ' + r.envers);
  const a = r.autres;
  if (a.A1 !== 20 || a.A2 !== 5 || a.A3 !== 7 || a.A4 !== 1 || a.A5 !== 12.35 || a.A6 !== 13) {
    throw new Error('fonctions : ' + JSON.stringify(a));
  }
  if (r.vide.A1 !== 4 || r.vide.A2 !== 5) throw new Error('cellules vides : ' + JSON.stringify(r.vide));
});

await v('formules : une formule fausse rend une erreur lisible, jamais un nombre faux', async () => {
  // C'est le vrai danger de ce fichier. Un analyseur trop permissif qui lirait « =2+ » comme 2
  // donnerait un résultat plausible à un élève qui s'est trompé, et personne ne le verrait.
  const r = await pageTr.evaluate(async () => {
    const F = await import('/core/formules.js');
    const code = (f) => { const x = F.evaluerGrille({ A1: f }); return x.erreurs.A1 || ('valeur ' + x.valeurs.A1); };
    return {
      nom: [code('=SOMM(1;2)'), code('=SI(1;2;3)')],
      div: [code('=10/0'), F.evaluerGrille({ B2: '0', A1: '=5/B2' }).erreurs.A1],
      malEcrites: ['=2+', '=(2+3', '=2 3', '=*5', '=SOMME(1;2', '=B2:B7+1', '=SOMME 1'].map(code),
      // Une formule qui se mord la queue doit dire pourquoi, pas faire déborder la pile du
      // navigateur — ce qui emporterait la page entière et l'heure de cours avec.
      circ: [F.evaluerGrille({ A1: '=A2', A2: '=A1' }).erreurs.A1, code('=A1+1')],
      // Un libellé texte dans une cellule n'est pas une erreur : une grille en est pleine.
      libelle: F.evaluerGrille({ A1: 'Poids total', B1: '=SOMME(B2:B3)', B2: '1', B3: '2' }),
    };
  });
  if (r.nom.join('|') !== '#NOM?|#NOM?') throw new Error('fonction inconnue : ' + JSON.stringify(r.nom));
  if (r.div.join('|') !== '#DIV/0!|#DIV/0!') throw new Error('division par zéro : ' + JSON.stringify(r.div));
  const acceptees = r.malEcrites.filter((x) => x.startsWith('valeur'));
  if (acceptees.length) throw new Error('formule(s) mal écrite(s) acceptée(s) : ' + JSON.stringify(r.malEcrites));
  if (!r.circ.every((x) => /^#/.test(String(x)))) throw new Error('référence circulaire : ' + JSON.stringify(r.circ));
  if (r.libelle.erreurs.A1) throw new Error('un libellé texte est compté comme une erreur');
  if (r.libelle.valeurs.B1 !== 3) throw new Error('somme à côté d’un libellé : ' + r.libelle.valeurs.B1);
});

await v('carte cliquable : rien de tout cela n’existe sans plan ni sans ordre de passage', async () => {
  // Règle du noyau : une vue ne gagne une capacité que si le contenu la déclare. Une séance
  // où le transport n'est qu'une contrainte de charge n'a pas de carte, donc pas de clic ; et
  // l'écran de repérage, lui, a une carte mais aucun ordre de passage — il doit rester
  // exactement celui d'avant, sans pastille, sans rond creux et sans cible de clic.
  const sansCarte = await pageTr.$$eval('#essaiSansPlan [data-clic-point]', (e) => e.length);
  if (sansCarte) throw new Error('une séance sans plan a des cibles de clic');

  await ouvrir('plan');
  const r = await pageTr.evaluate(() => ({
    cibles: document.querySelectorAll('#essaiTr .plan-svg .plan-pt-cible').length,
    pastilles: document.querySelectorAll('#essaiTr .plan-svg .plan-pt-ordre').length,
    creux: document.querySelectorAll('#essaiTr .plan-svg .plan-pt-quai').length,
    ronds: [...document.querySelectorAll('#essaiTr .plan-svg .plan-pt')]
      .map((g) => g.querySelector('text').textContent.trim()).join(','),
    leg: [...document.querySelectorAll('#essaiTr .plan-legende span')].map((x) => x.textContent).join(' | '),
  }));
  if (r.cibles || r.pastilles || r.creux) throw new Error('l’écran de repérage a gagné la carte cliquable : ' + JSON.stringify(r));
  if (r.ronds !== '1,2,3,4') throw new Error('les numéros de clients du repérage ont bougé : ' + r.ronds);
  if (/ordre de passage/.test(r.leg)) throw new Error('la légende parle d’un ordre de passage inexistant');
  await ouvrir('tournee');

  // Et une séance qui ne déclare PAS `extremitesACliquer` garde ses deux bouts comme avant :
  // dessinés pleins, comptés dans le trajet, et sans rien à cliquer. Règle du noyau — une vue
  // ne gagne une capacité que si le contenu la demande.
  const bouts = await pageTr.evaluate(() => ({
    cibles: document.querySelectorAll('#essaiTr [data-clic-extremite]').length,
    boutons: document.querySelectorAll('#essaiTr [data-bout]').length,
    creux: document.querySelectorAll('#essaiTr .plan-bout-vide').length,
    trace: document.querySelector('#essaiTr .plan-trace').getAttribute('points'),
  }));
  if (bouts.cibles || bouts.boutons) throw new Error('une séance sans extrémités à cliquer en a gagné');
  if (bouts.creux) throw new Error('un bout est dessiné en creux sans que la séance le demande');
  // Le dépôt d'essai est en (50,50) et la gare en (350,150) : le tracé doit toujours les
  // porter, sans que personne ait eu à les poser.
  if (!bouts.trace.startsWith('50,50')) throw new Error('le tracé ne part plus du dépôt : ' + bouts.trace);
  if (!bouts.trace.endsWith('350,150')) throw new Error('le tracé ne finit plus à la gare : ' + bouts.trace);
});

await v('vue plan : la porte de sortie n\'apparaît qu\'après deux essais infructueux', async () => {
  // Règle de Tristan du 02/10 au soir : l'élève ne doit jamais être complètement bloqué, mais
  // il doit pouvoir se tromper. La porte de sortie ne s'ouvre donc pas tout de suite.
  const z = '#essaiSortie .ent-main';
  await pageTr.click('#essaiSortie .ent-nav[data-vue="plan"]');
  await pageTr.waitForTimeout(100);
  if (await pageTr.$$eval(`${z} [data-plan-issue]`, (e) => e.length)) {
    throw new Error('la porte de sortie est offerte avant le premier essai');
  }
  // Premier essai, tout faux : toujours pas de porte.
  for (const id of ['p1', 'p2', 'p3', 'p4']) await pageTr.fill(`${z} .plan-case[data-case="${id}"]`, 'A1');
  await pageTr.click(`${z} [data-plan-valider]`);
  await pageTr.waitForTimeout(120);
  if (await pageTr.$$eval(`${z} [data-plan-issue]`, (e) => e.length)) {
    throw new Error('la porte de sortie est offerte dès le premier essai');
  }
  // Deuxième essai : elle apparaît.
  await pageTr.click(`${z} [data-plan-valider]`);
  await pageTr.waitForTimeout(120);
  if (!(await pageTr.$$eval(`${z} [data-plan-issue]`, (e) => e.length))) {
    throw new Error('la porte de sortie ne s\'ouvre pas après deux essais');
  }
  const essais = await pageTr.evaluate(() => window.__tr.sortie.db.transport.ess4.plan.essais);
  if (essais !== 2) throw new Error('essais comptés : ' + essais);
});

await v('vue plan : continuer quand même débloque la suite sans valider le repérage', async () => {
  const z = '#essaiSortie .ent-main';
  await pageTr.click(`${z} [data-plan-issue]`);
  await pageTr.waitForTimeout(140);
  const t = await pageTr.textContent(z);
  if (!/Repérage non validé/.test(t)) throw new Error('le repérage est annoncé validé : ' + t.slice(0, 300));
  if (!/votre enseignant le voit/.test(t)) throw new Error('l\'élève n\'est pas averti de ce qui est enregistré');
  // Les noms apparaissent : il peut travailler la suite.
  const svg = await pageTr.textContent(`${z} .plan-svg`);
  if (!/Client Un/.test(svg)) throw new Error('le temps 2 ne s\'ouvre pas');
  // Et la tournée n'est plus verrouillée.
  await pageTr.click('#essaiSortie .ent-nav[data-vue="tournee"]');
  await pageTr.waitForTimeout(120);
  const t2 = await pageTr.textContent(z);
  if (/Commencez par/.test(t2)) throw new Error('la tournée reste verrouillée après la porte de sortie');
  if (!(await pageTr.$$eval(`${z} #tourListe .tour-item`, (e) => e.length))) {
    throw new Error('les arrêts ne sont pas manipulables');
  }
  // Le suivi doit pouvoir distinguer « a trouvé » de « a renoncé ».
  const etat = await pageTr.evaluate(() => {
    const p = window.__tr.sortie.db.transport.ess4.plan;
    return { valide: !!p.valide, force: !!p.force };
  });
  if (etat.valide) throw new Error('la porte de sortie a marqué le repérage comme réussi');
  if (!etat.force) throw new Error('le recours à la porte de sortie n\'est pas enregistré');
});

await v('vue plan : une séance peut ne pas bloquer la suite du tout', async () => {
  // `blocant: false` : le repérage se fait et se corrige, mais il n'enferme personne. C'est le
  // réglage pour une séance où la carte n'est pas le cœur du travail.
  const z = '#essaiTolere .ent-main';
  await pageTr.click('#essaiTolere .ent-nav[data-vue="tournee"]');
  await pageTr.waitForTimeout(120);
  const t = await pageTr.textContent(z);
  if (/Commencez par/.test(t)) throw new Error('la tournée est verrouillée malgré blocant: false');
  if (!(await pageTr.$$eval(`${z} #tourListe .tour-item`, (e) => e.length))) {
    throw new Error('les arrêts ne sont pas manipulables');
  }
  // Et le repérage n'est pour autant pas réputé fait.
  const valide = await pageTr.evaluate(() => {
    const p = window.__tr.tolere.db.transport.ess5;
    return !!(p && p.plan && p.plan.valide);
  });
  if (valide) throw new Error('le repérage est marqué validé sans avoir été fait');
});

await v('vue plan : une séance peut tolérer une case fausse', async () => {
  const z = '#essaiTolere .ent-main';
  await pageTr.click('#essaiTolere .ent-nav[data-vue="plan"]');
  await pageTr.waitForTimeout(100);
  // Trois justes, une fausse : avec toleres: 1, ça passe — et l'erreur reste affichée.
  const justes = { p1: 'B1', p2: 'C1', p3: 'B2', p4: 'C2' };
  for (const [id, c] of Object.entries(justes)) {
    await pageTr.fill(`${z} .plan-case[data-case="${id}"]`, id === 'p4' ? 'A1' : c);
  }
  await pageTr.click(`${z} [data-plan-valider]`);
  await pageTr.waitForTimeout(140);
  const t = await pageTr.textContent(z);
  if (!/vous pouvez continuer/.test(t)) throw new Error('la tolérance ne joue pas : ' + t.slice(0, 300));
  if (!/Repérage validé/.test(t)) throw new Error('le repérage n\'est pas validé malgré la tolérance');
  const ko = await pageTr.$$eval(`${z} .plan-table tr.plan-ko`, (e) => e.length);
  if (ko !== 1) throw new Error(`${ko} erreur(s) encore signalée(s) au lieu d'une`);
  const valide = await pageTr.evaluate(() => !!window.__tr.tolere.db.transport.ess5.plan.valide);
  if (!valide) throw new Error('la validation n\'est pas enregistrée');
});

await v('transport : aucune erreur de console pendant tout le parcours', async () => {
  if (erreursTr.length) throw new Error([...new Set(erreursTr)].slice(0, 3).join(' | '));
});

}
