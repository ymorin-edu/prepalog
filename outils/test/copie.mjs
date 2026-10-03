// Suite de tests de Prepalog — bloc « copie » : la COPIE RENDUE des évaluations (02/10/2026,
// chantier A). `node outils/test.mjs copie` ne lance que ce bloc ; il n'a besoin d'aucun autre.
//
// Décisions de Tristan (02/10/2026) que ces cas gardent :
//   - pendant l'épreuve, rien ne remonte au suivi (pas de « meilleur score » à améliorer) ;
//   - « jauges muettes seulement » : les limites, sans « dépassée », « raté » ni « respectée » ;
//     le report s'enregistre sans juste / faux ni refus ; pas de « Vérifier mes formules » ;
//   - « Rendre ma copie » en deux clics, une seule remise, note calculée à la remise ;
//   - après : « Copie rendue », lecture seule, AUCUNE note affichée ;
//   - l'enseignant ramasse une copie non rendue (notée dans l'état laissé) et peut la rouvrir.
//
// L'environnement est monté à la main sur la journée d'ENT-3.2 (Boost, carte réelle, créneau),
// avec deux jalons d'essai : l'un toujours réussi, l'autre réussi si sept arrêts sont chargés.
// La tournée chargée ici (huit clients, 230 kg, créneau raté) viole TOUTES les contraintes :
// c'est elle qui prouve que l'écran ne dit plus rien.

export default async function bloc({ v, nav }) {

const ctxCp = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctxCp.newPage();
pg.setDefaultTimeout(6000);
const erreursCp = [];
pg.on('pageerror', (e) => erreursCp.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursCp.push('CONSOLE: ' + m.text()); });
await pg.goto('http://127.0.0.1:8099/');
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const TOUS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];

// `o.copieU` / `o.copieMeta` : où la copie est déclarée (les deux, normalement).
// `o.travail` : le résultat déjà enregistré (copie déjà rendue, par exemple).
// `o.ordre` : la tournée chargée.
const monter = (o = {}) => pg.evaluate(async (o) => {
  document.getElementById('cp-hote')?.remove();
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const B = await import('/contenus/boost.js');
  // La journée d'essai du 02/10 (14 h 10, VELO) : son créneau est ÉPINGLÉ à 14 h 45, comme ses chiffres,
  // pour que ces cas gardent le MOTEUR sans dépendre de la journée d'ENT-3.2 (recalée au chantier D, lot 2).
  const CARTE = ((x) => ({ ...x, clients: x.clients.map((c) => (c.id === 'c6' ? { ...c, creneau: { avant: 885, libelle: 'livraison avant 14 h 45' } } : c)) }))((await import('/contenus/boost-ent32-carte.js')).CARTE);
  const ETAPES = [
    { id: 'toujours', titre: 'Toujours', verifier: () => ({ status: 'ok' }) },
    { id: 'sept', titre: 'Sept arrêts', verifier: (db) => ({ status: (db.transport['essai-cp'].tournee.ordre || []).length === 7 ? 'ok' : 'ko' }) },
  ];
  const moteur = creerEntreprise({
    ENTREPRISE: B.ENTREPRISE, VOCAB: B.VOCAB, CATALOGUE: B.CATALOGUE, SUPPLIERS: B.SUPPLIERS,
    SUP_BY_ID: B.SUP_BY_ID, CUSTOMERS: B.CUSTOMERS, CM: B.CM, baseDeDepart: B.baseDeDepart, THEME: B.THEME,
    etapes: ETAPES, exercice: 'Essai', transportSection: 'Tournées', transportId: 'essai-cp',
    copie: o.copieU !== false,
    plan: { libelle: 'Plan de Nîmes', titre: 'Situer les nouveaux clients', carte: CARTE },
    tournee: {
      libelle: 'Tournée', titre: 'Tournée — évaluation',
      mesures: [{ id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: B.VELO.chargeUtile }],
      horaire: { depart: 14 * 60 + 10, limite: B.VELO.train, vitesse: B.VELO.vitesse, service: B.VELO.service, libelleLimite: 'départ du train' },
      departAQuai: true, extremitesACliquer: true,
      // Ce que demanderait un entraînement : la copie doit l'éteindre.
      exigeConforme: true, jaugesRepere: false,
      report: [{ id: 'rkm', libelle: 'Distance', unite: 'km', tolerance: 0.05, valeur: (b) => b.km }],
      grille: {
        titre: 'Feuille de calcul', colonnes: ['A', 'B'],
        lignes: (b) => [{ A: 'Arrêt', B: 'Poids (kg)', entete: true },
          ...b.retenus.map((p) => ({ A: p.nom, B: p.kg })),
          { A: 'Poids total (kg)', B: { saisie: true, formule: true, attendu: b.cumuls.charge } }],
      },
      contraintesDansGrille: true,
    },
  });
  const ordre = o.ordre || ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
  const tous = CARTE.clients.map((c) => c.id);
  const db = { transport: { 'essai-cp': {
    plan: { places: Object.fromEntries(CARTE.clients.filter((c) => c.nouveau).map((c) => [c.id, 1])), essais: {}, valide: 1 },
    tournee: { ordre, quai: tous.filter((x) => !ordre.includes(x)), depart: 1, arrivee: 1, report: {}, juge: {}, valide: null },
  } } };
  const S = window.__cp = { db, moteur, travail: o.travail || null, enregistrer: [], rendre: [], sauver: 0, lire: 0, refus: !!o.refus };
  const hote = document.createElement('div'); hote.id = 'cp-hote'; document.body.appendChild(hote);
  moteur.rendre(hote, {
    meta: { id: 'essai-cp', code: 'ESSAI', titre: 'Boost — évaluation', portee: 'eleve', immersif: true,
      jeuId: 'essai-cp', reinitialisable: true, ...(o.copieMeta === false ? {} : { copie: true }) },
    profil: { prenom: 'Lea', nom: 'Dupont', role: o.prof ? 'prof' : 'eleve' },
    jeu: { etat: () => db, sauver: () => { S.sauver++; } },
    enregistrer: (r) => { S.enregistrer.push(r); },
    lireScore: async () => { S.lire++; return S.travail; },
    rendreCopie: async (r) => {
      S.rendre.push(r);
      // `refus` : le serveur a déjà une copie (ramassée par l'enseignant pendant l'épreuve).
      if (S.refus) { S.travail = { score: 0, max: 2, rendu: Date.parse('2026-10-02T09:58:00'), ramasse: true }; throw new Error('copie déjà rendue'); }
      if (S.travail && S.travail.rendu) throw new Error('copie déjà rendue');
      S.travail = { ...r, meilleur: r.score, rendu: Date.parse('2026-10-02T10:42:00'), ramasse: false };
      return S.travail;
    },
    quitter: () => {}, codeStock: '',
  });
}, o);
const S = () => pg.evaluate(() => {
  const s = window.__cp;
  return JSON.parse(JSON.stringify({ enregistrer: s.enregistrer, rendre: s.rendre, sauver: s.sauver, lire: s.lire, travail: s.travail,
    tournee: s.db.transport['essai-cp'].tournee }));
});
const vue = async (id) => { await pg.$eval(`#cp-hote .ent-nav[data-vue="${id}"]`, (b) => b.click()); };
const texte = (sel = '#cp-hote') => pg.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' '));
// La lecture du résultat enregistré est asynchrone : le bouton « Rendre » n'apparaît qu'après.
const pret = () => pg.waitForFunction(() => window.__cp && window.__cp.lire > 0
  && !!document.querySelector('#cp-hote [data-copie-rendre], #cp-hote [data-copie-etat]'));

await v('copie : pendant l’épreuve, les jauges donnent les limites et RIEN d’autre (ni dépassée, ni raté, ni respectée)', async () => {
  await monter();
  await pret();
  await vue('tournee');
  await pg.waitForSelector('#cp-hote [data-creneau="c6"]');
  const j = await pg.$$eval('#cp-hote .tour-jauge', (els) => els.map((e) => ({ txt: e.textContent.replace(/\s+/g, ' '), trop: e.classList.contains('trop'), muette: e.classList.contains('tour-jauge-repere') })));
  const tout = j.map((x) => x.txt).join(' | ');
  if (j.length < 3) throw new Error('jauges : ' + tout);
  if (j.some((x) => x.trop)) throw new Error('une jauge est rouge : ' + tout);
  if (!j.every((x) => x.muette)) throw new Error('une jauge parle (jaugesRepere: false devait être forcé) : ' + tout);
  if (/dépassée|raté|manqué|respectée|tenu\b|230|15 h 0|retard/i.test(tout)) throw new Error('verdict ou total affiché : ' + tout);
  if (!/max 180/.test(tout) || !/16 h 10/.test(tout) || !/14 h 45/.test(tout)) throw new Error('limites absentes : ' + tout);
  if (await pg.$$eval('#cp-hote .ent-main .pastille.crit, #cp-hote .ent-main .pastille.ok', (x) => x.length)) throw new Error('pastille de verdict');
  if (await pg.$('#cp-hote .avis-contrainte')) throw new Error('avertissement « la tournée ne tient pas » affiché');
});

await v('copie : le report s’enregistre sans correction ni refus, la feuille n’a pas de « Vérifier »', async () => {
  if (await pg.$('#cp-hote [data-gr-verifier]')) throw new Error('bouton « Vérifier mes formules » présent');
  const bt = await texte('#cp-hote [data-tour-valider]');
  if (!/Enregistrer mes résultats/.test(bt)) throw new Error('bouton : ' + bt);
  await pg.fill('#cp-hote [data-report="rkm"]', '99');
  await pg.$eval('#cp-hote [data-tour-valider]', (b) => b.click());
  await pg.waitForSelector('#cp-hote [data-tour-enregistre]');
  const t = await texte('#cp-hote .tour-report');
  if (/juste|à revoir|ne tient pas|créneau raté|dépassée/i.test(t)) throw new Error('verdict au report : ' + t);
  if (await pg.$('#cp-hote .tour-report .avis-err, #cp-hote .tour-report .champ.faux, #cp-hote .tour-report .champ.juste')) throw new Error('marque juste/faux ou refus');
  const s = await S();
  if (s.tournee.report.rkm !== '99' || !s.tournee.enregistre) throw new Error('report non enregistré : ' + JSON.stringify(s.tournee));
  if (Object.keys(s.tournee.juge || {}).length || s.tournee.bloque || s.tournee.valide) throw new Error('corrigé quand même : ' + JSON.stringify(s.tournee));
  // La feuille calcule toujours : c'est le tableur, pas la correction.
  await pg.fill('#cp-hote [data-gr="B10"]', '=SOMME(B2:B9)');
  await pg.waitForFunction(() => /230/.test(document.querySelector('#cp-hote [data-gr-res="B10"]').textContent));
  if (await pg.$('#cp-hote .gr-verdict')) throw new Error('verdict de formule');
});

await v('copie : pendant le travail, RIEN ne remonte au suivi (même avec des jalons réussis)', async () => {
  const s = await S();
  if (s.enregistrer.length) throw new Error('enregistré pendant l’épreuve : ' + JSON.stringify(s.enregistrer));
  if (!s.sauver) throw new Error('le travail n’est pas sauvé dans la base');
  if (s.rendre.length) throw new Error('rendu sans le demander');
});

await v('copie : « Rendre ma copie » arme au 1er clic, « Annuler » désarme, rien n’est rendu', async () => {
  await pg.$eval('#cp-hote [data-copie-rendre]', (b) => b.click());
  let t = await texte('#cp-hote [data-copie-rendre]');
  if (!/Rendre définitivement \? Cliquez pour confirmer/.test(t)) throw new Error('pas armé : ' + t);
  await pg.$eval('#cp-hote [data-copie-annuler]', (b) => b.click());
  t = await texte('#cp-hote [data-copie-rendre]');
  if (!/^\s*Rendre ma copie\s*$/.test(t)) throw new Error('pas désarmé : ' + t);
  if ((await S()).rendre.length) throw new Error('rendu à l’armement');
});

await v('copie : au 2e clic, la copie est rendue UNE fois, notée par les jalons, sans note affichée', async () => {
  await pg.$eval('#cp-hote [data-copie-rendre]', (b) => b.click());
  await pg.$eval('#cp-hote [data-copie-rendre]', (b) => b.click());
  await pg.waitForSelector('#cp-hote [data-copie-etat="rendue"]');
  const s = await S();
  if (s.rendre.length !== 1) throw new Error('remises : ' + s.rendre.length);
  const r = s.rendre[0];
  if (r.score !== 1 || r.max !== 2 || r.detail.toujours !== 'ok' || r.detail.sept !== 'ko') throw new Error('note : ' + JSON.stringify(r));
  const t = await texte();
  if (!/Copie rendue à 10 h 42/.test(t)) throw new Error('bandeau : ' + t.slice(0, 300));
  if (/1\s*\/\s*2|\/\s*20|note\s*:\s*\d/i.test(t)) throw new Error('une note est affichée');
  if (await pg.$('#cp-hote [data-copie-rendre]')) throw new Error('le bouton « Rendre » est encore là');
  if (await pg.$('#cp-hote [data-raz]')) throw new Error('« Réinitialiser » reste offert après la remise');
  if (!/Votre enseignant vous donnera la note/.test(await texte('#cp-hote [data-copie-avis]'))) throw new Error('avis de lecture seule absent');
});

await v('copie : après la remise, tout est en lecture seule — clics, saisie, carte — et rien n’est sauvé', async () => {
  const avant = await S();
  // Une case de report, un point de la carte, un arrêt du récapitulatif, le bouton de la feuille.
  if (!(await pg.$eval('#cp-hote [data-report="rkm"]', (e) => e.disabled))) throw new Error('case de report modifiable');
  await pg.$eval('#cp-hote [data-clic-point="c5"]', (e) => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await pg.$eval('#cp-hote [data-quai="c1"]', (e) => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await pg.$eval('#cp-hote [data-tour-raz]', (e) => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  // Une saisie forcée par le DOM (le champ est désactivé, on simule un contournement).
  await pg.$eval('#cp-hote [data-report="rkm"]', (e) => { e.disabled = false; e.value = '1'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  const apres = await S();
  if (JSON.stringify(apres.tournee.ordre) !== JSON.stringify(avant.tournee.ordre)) throw new Error('ordre modifié : ' + apres.tournee.ordre);
  if (apres.tournee.report.rkm !== '99') throw new Error('report modifié : ' + apres.tournee.report.rkm);
  if (apres.sauver !== avant.sauver) throw new Error('la base a été sauvée après la remise');
  // On consulte : le menu marche, et l'avis suit sur chaque écran.
  await vue('plan');
  await pg.waitForSelector('#cp-hote [data-copie-avis]');
  await pg.$eval('#cp-hote [data-ct-zoom]', (b) => b.click());
  const zoom = await pg.$eval('#cp-hote [data-ct-svg]', (s) => s.classList.contains('ct-zoom'));
  if (!zoom) throw new Error('le zoom de la carte ne marche plus (il doit rester libre)');
  await vue('accueil');
  await pg.waitForSelector('#cp-hote [data-copie-avis]');
  if ((await S()).enregistrer.length) throw new Error('remonté au suivi');
});

await v('copie : une copie déjà rendue s’ouvre en lecture seule, sans bouton « Rendre »', async () => {
  await monter({ travail: { score: 2, max: 2, rendu: Date.parse('2026-10-02T09:15:00'), ramasse: true } });
  await pret();
  const t = await texte();
  if (!/Copie ramassée à 09 h 15/.test(t)) throw new Error('bandeau : ' + t.slice(0, 300));
  if (await pg.$('#cp-hote [data-copie-rendre]')) throw new Error('« Rendre » offert sur une copie rendue');
  await vue('tournee');
  await pg.waitForSelector('#cp-hote [data-copie-avis]');
  await pg.$eval('#cp-hote [data-clic-point="c5"]', (e) => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  if ((await S()).tournee.ordre.length !== 8) throw new Error('modifiable');
});

await v('copie : remise refusée par le serveur (déjà ramassée) → on affiche ce qui fait foi', async () => {
  await monter({ refus: true });
  await pret();
  await pg.$eval('#cp-hote [data-copie-rendre]', (b) => b.click());
  await pg.$eval('#cp-hote [data-copie-rendre]', (b) => b.click());
  await pg.waitForSelector('#cp-hote [data-copie-etat="rendue"]');
  if (!/Copie ramassée à 09 h 58/.test(await texte())) throw new Error('état : ' + (await texte()).slice(0, 200));
});

await v('copie : côté enseignant, l’environnement reste libre et sans bouton « Rendre »', async () => {
  await monter({ prof: true });
  await pg.waitForSelector('#cp-hote .ent-copie');
  if (await pg.$('#cp-hote [data-copie-rendre]')) throw new Error('« Rendre » offert à l’enseignant');
  await vue('tournee');
  await pg.waitForSelector('#cp-hote [data-clic-point="c1"]');
  await pg.$eval('#cp-hote [data-clic-point="c1"]', (e) => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  if ((await S()).tournee.ordre.includes('c1')) throw new Error('l’enseignant ne peut pas manipuler');
});

await v('copie : déclarée d’un seul côté (meta OU moteur) → refus explicite, pas une évaluation à moitié', async () => {
  for (const o of [{ copieU: false }, { copieMeta: false }]) {
    await monter(o);
    const t = await texte();
    if (!/Évaluation mal déclarée/.test(t)) throw new Error(JSON.stringify(o) + ' : ' + t.slice(0, 120));
  }
});

await v('copie : sans `copie`, rien ne change (le suivi reçoit le score à chaque geste, la tournée corrige)', async () => {
  await monter({ copieU: false, copieMeta: false });
  await vue('tournee');
  await pg.waitForSelector('#cp-hote [data-tour-valider]');
  if (await pg.$('#cp-hote [data-copie-rendre]')) throw new Error('bouton « Rendre » hors évaluation');
  if (!/Valider mes résultats/.test(await texte('#cp-hote [data-tour-valider]'))) throw new Error('bouton de report changé');
  if (!(await pg.$('#cp-hote [data-gr-verifier]'))) throw new Error('« Vérifier mes formules » disparu');
  if (!(await S()).enregistrer.length) throw new Error('le suivi ne reçoit plus rien');
  await pg.$eval('#cp-hote [data-tour-valider]', (b) => b.click());
  await pg.waitForSelector('#cp-hote .tour-report .avis-err');
  if (!/ne tient pas encore/.test(await texte('#cp-hote .tour-report'))) throw new Error('exigeConforme ne refuse plus');
});

/* ---------------------------------------------------------- le backend et l'enseignant */
// Le backend de démonstration (celui du site chargé dans la page) : la note figée, la
// remise unique, le ramassage et la réouverture de core/copie.js.
await v('copie : backend — une copie rendue est figée (ecrireScore n’y touche plus) et ne se rend qu’une fois', async () => {
  const r = await pg.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const g = 'g-copie', u = 'u-copie', a = 'act-copie';
    await B.poserNote(g, u, a, null);
    const t1 = await B.rendreCopie(g, u, a, { score: 3, max: 6, detail: { x: 'ok' } });
    await B.ecrireScore(g, u, a, { score: 6, max: 6 });
    const apres = await B.lireScore(g, u, a);
    let refus = null;
    try { await B.rendreCopie(g, u, a, { score: 6, max: 6 }); } catch (e) { refus = e.message; }
    const suivi = (await B.suivi(g)).filter((t) => t.uid === u && t.aid === a).length;
    await B.poserNote(g, u, a, null);                 // rouvrir
    const rouvert = await B.lireScore(g, u, a);
    const t2 = await B.rendreCopie(g, u, a, { score: 5, max: 6 });
    return { t1, apres, refus, suivi, rouvert, t2 };
  });
  if (!r.t1.rendu || r.t1.meilleur !== 3 || r.t1.tentatives !== 1 || r.t1.ramasse) throw new Error('remise : ' + JSON.stringify(r.t1));
  if (r.apres.meilleur !== 3 || r.apres.score !== 3) throw new Error('ecrireScore a remplacé la copie : ' + JSON.stringify(r.apres));
  if (!/déjà rendue/.test(r.refus || '')) throw new Error('2e remise acceptée');
  if (r.suivi !== 1) throw new Error('absente du suivi');
  if (r.rouvert !== null) throw new Error('rouvrir n’a pas effacé');
  if (r.t2.meilleur !== 5) throw new Error('remise après réouverture : ' + JSON.stringify(r.t2));
});

await v('copie : ramasser note la base de l’élève avec les jalons de l’activité, au nom de l’élève, puis la fige', async () => {
  const r = await pg.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const { ramasser, rouvrir, libelleRendu } = await import('/core/copie.js');
    const g = 'g-ram', a = 'essai-cp';
    const module = { meta: { id: a, jeuId: 'jeu-ram', copie: true, code: 'ESSAI' }, noter: window.__cp.moteur.noter };
    const base = (n) => ({ transport: { 'essai-cp': { tournee: { ordre: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'].slice(0, n) } } } });
    await B.ecrireJeuPrive('u-sept', 'jeu-ram', base(7));
    await B.ecrireJeuPrive('u-trois', 'jeu-ram', base(3));
    for (const u of ['u-sept', 'u-trois', 'u-absent']) await B.poserNote(g, u, a, null);
    const sept = await ramasser(B, { gid: g, eleve: { uid: 'u-sept', nom: 'Martin', prenom: 'Zoé' }, module });
    const trois = await ramasser(B, { gid: g, eleve: { uid: 'u-trois', nom: 'Petit', prenom: 'Noé' }, module });
    const absent = await ramasser(B, { gid: g, eleve: { uid: 'u-absent', nom: 'Blanc', prenom: 'Inès' }, module });
    const encore = await ramasser(B, { gid: g, eleve: { uid: 'u-sept', nom: 'Martin', prenom: 'Zoé' }, module });
    const sansNoter = await ramasser(B, { gid: g, eleve: { uid: 'u-trois' }, module: { meta: module.meta } });
    const lu = await B.lireScore(g, 'u-sept', a);
    await rouvrir(B, { gid: g, uid: 'u-sept', aid: a });
    const rouvert = await B.lireScore(g, 'u-sept', a);
    return { sept, trois, absent, encore, sansNoter, lu, libelle: libelleRendu(lu), rouvert };
  });
  if (!r.sept.ok || r.sept.travail.score !== 2 || r.sept.travail.max !== 2 || !r.sept.travail.ramasse) throw new Error('7 arrêts : ' + JSON.stringify(r.sept));
  if (r.sept.travail.nom !== 'Martin' || r.sept.travail.prenom !== 'Zoé') throw new Error('pas au nom de l’élève : ' + JSON.stringify(r.sept.travail));
  if (!r.trois.ok || r.trois.travail.score !== 1) throw new Error('3 arrêts : ' + JSON.stringify(r.trois));
  if (r.absent.ok || r.absent.raison !== 'vide') throw new Error('absent : ' + JSON.stringify(r.absent));
  if (r.encore.ok || r.encore.raison !== 'rendue') throw new Error('ramassée deux fois : ' + JSON.stringify(r.encore));
  if (r.sansNoter.ok || r.sansNoter.raison !== 'module') throw new Error('module sans noter : ' + JSON.stringify(r.sansNoter));
  if (!/^ramassée à \d\d h \d\d$/.test(r.libelle)) throw new Error('libellé : ' + r.libelle);
  if (r.rouvert !== null) throw new Error('rouvrir');
});

await v('copie : la règle Firestore fige un résultat rendu pour l’élève (texte de firestore.rules)', async () => {
  // L'émulateur n'est pas lancé par cette suite (voir outils/test-regles.mjs) : on garde au
  // moins le texte de la règle, pour qu'une réécriture ne la perde pas en silence.
  const fs = await import('node:fs');
  const t = fs.readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8');
  const bloc = t.slice(t.indexOf('match /travaux/'), t.indexOf('match /prives/'));
  if (!/uid == moi\(\) && membreDuGroupe\(gid\)\s*&& \(resource == null \|\| !\('rendu' in resource\.data\)\)/.test(bloc)) throw new Error('règle absente : ' + bloc);
});

await v('copie : aucune erreur JavaScript', async () => {
  if (erreursCp.length) throw new Error(erreursCp.slice(0, 3).join(' / '));
});

await ctxCp.close();
}
