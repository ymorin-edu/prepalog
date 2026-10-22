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

export default async function bloc({ v, nav, BASE }) {

const ctxCp = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctxCp.newPage();
pg.setDefaultTimeout(6000);
const erreursCp = [];
pg.on('pageerror', (e) => erreursCp.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursCp.push('CONSOLE: ' + m.text()); });
await pg.goto(BASE);
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
  // Écriture (création/mise à jour) puis suppression : les deux refusent un résultat qui porte `rendu`.
  if (!/uid == moi\(\) && membreDuGroupe\(gid\)[\s\S]*?resource == null\s*\|\|\s*\(!\('rendu' in resource\.data\)/.test(bloc)) throw new Error('règle d’écriture absente : ' + bloc);
  const suppr = bloc.slice(bloc.indexOf('allow delete'));
  if (!/resource == null\s*\|\|\s*\(!\('rendu' in resource\.data\)/.test(suppr)) throw new Error('règle de suppression absente : ' + suppr);
});

/* ---------------------------------------------------------- le détail d'une copie, lu dans le Suivi */
// Chantier du 19/10/2026 (suite d'ENT-9.4 : « le détail de la note se lit dans le Suivi »). Deux faces : le moteur range, avec la copie,
// chaque jalon (titre, points sur poids) ; le Suivi de l'enseignant le lit au survol de la note. Rien ne change hors copie pondérée.
await v('copie : le moteur range le détail jalon par jalon (titre, points obtenus sur le poids) pour une copie pondérée — et pour elle seule', async () => {
  const r = await pg.evaluate(async () => {
    const B = await import('/contenus/boost.js');
    const ETAPES = [
      { id: 'a', titre: 'Premier jalon', poids: 10, verifier: () => ({ status: 'ok' }) },
      { id: 'b', titre: 'Deuxième jalon', poids: 6, fraction: () => 0.25, verifier: () => ({ status: 'ok' }) },
      { id: 'c', titre: 'Jalon raté', poids: 4, verifier: () => ({ status: 'ko' }) },
    ];
    const fab = (o) => creerEntreprise({
      ENTREPRISE: B.ENTREPRISE, VOCAB: B.VOCAB, CATALOGUE: B.CATALOGUE, SUPPLIERS: B.SUPPLIERS, SUP_BY_ID: B.SUP_BY_ID, CUSTOMERS: B.CUSTOMERS,
      CM: B.CM, baseDeDepart: B.baseDeDepart, THEME: B.THEME, exercice: 'Essai', ...o });
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const lire = (m) => { const n = m.noter({}); return { score: n.score, max: n.max, jalons: n.detail.jalons || null, a: n.detail.a, c: n.detail.c }; };
    return {
      copie: lire(fab({ etapes: ETAPES, copie: true })),
      travail: lire(fab({ etapes: ETAPES })),
      sansPoids: lire(fab({ etapes: ETAPES.map(({ poids, ...e }) => e), copie: true })),
    };
  });
  if (r.copie.score !== 11.5 || r.copie.max !== 20) throw new Error('note de la copie : ' + JSON.stringify(r.copie));
  if (JSON.stringify(r.copie.jalons) !== JSON.stringify([
    { id: 'a', titre: 'Premier jalon', poids: 10, points: 10 },
    { id: 'b', titre: 'Deuxième jalon', poids: 6, points: 1.5 },
    { id: 'c', titre: 'Jalon raté', poids: 4, points: 0 }])) throw new Error('jalons rangés : ' + JSON.stringify(r.copie.jalons));
  if (r.copie.a !== 'ok' || r.copie.c !== 'ko') throw new Error('l’état de chaque jalon doit rester rangé : ' + JSON.stringify(r.copie));
  if (r.travail.jalons !== null || r.travail.score !== 11.5) throw new Error('hors copie, le détail ne change pas : ' + JSON.stringify(r.travail));
  if (r.sansPoids.jalons !== null) throw new Error('une copie sans poids n’a pas de détail pondéré : ' + JSON.stringify(r.sansPoids));
});

await v('copie : Suivi — au survol de la note d’une copie rendue, chaque jalon (titre, points sur poids) et la part des questions ; sans détail rangé, rien de plus', async () => {
  const ctx = await nav.newContext({ viewport: { width: 1366, height: 768 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(6000);
  try {
    await p.goto(BASE); await p.waitForSelector('#btnProf', { timeout: 8000 });
    await p.click('#btnProf'); await p.waitForSelector('#btnProfEspace'); await p.click('#btnProfEspace');
    await p.waitForSelector('#gNom');
    await p.fill('#gNom', 'Détail copie'); await p.selectOption('#gNiveau', '1re'); await p.click('#btnCreerG'); await p.waitForTimeout(300);
    // Une évaluation pondérée de la liste (copie: true, bareme 20) : on lui rend trois copies écrites à la main.
    const aid = await p.evaluate(async () => {
      const I = await import('/activites/index.js');
      const mods = await Promise.all(I.ACTIVITES.map((f) => f().then((x) => x).catch(() => null)));
      return mods.filter((m) => m && m.meta && m.meta.copie && m.meta.bareme === 20 && typeof m.noter === 'function').map((m) => m.meta.id)[0];
    });
    if (!aid) throw new Error('aucune évaluation pondérée au registre');
    const jalons = [{ id: 'j1', titre: 'Les documents', poids: 1, points: 1 }, { id: 'j2', titre: 'Le solde', poids: 2, points: 0 },
      { id: 'j3', titre: 'Chaque pile', poids: 0.375, points: 0.375 }, { id: 'j4', titre: 'Le crédit', poids: 1.5, points: 0.5 }];
    const copies = [
      { score: 5.875, max: 20, detail: { j1: 'ok', j2: 'ko', j3: 'ok', j4: 'ok', jalons, ouverture: { points: 4, part: 4, justes: 4, nsp: 0, faux: 0, sur: 4, tirees: [] } } },
      { score: 7, max: 20, detail: { j1: 'ok', j2: 'ko', titres: { j1: 'Les documents', j2: 'Le solde' } } },
      { score: 7, max: 20, detail: { x: 'ok' } },
      // La part des questions est un jalon de la liste : sa ligne porte la ventilation, la phrase « Les questions » n'est pas redite.
      { score: 4, max: 20, detail: { ouverture: { points: 4, part: 4, justes: 3, nsp: 1, faux: 0, sur: 4 }, jalons: [{ id: 'ouverture', titre: 'Les questions', poids: 4, points: 4 }] } },
    ];
    await p.evaluate(async ({ L, aid }) => {
      const { B } = await import('/core/backend.js');
      const g = Object.entries(JSON.parse(localStorage.getItem('prepalog:groupes') || '{}')).find(([, x]) => x.nom === 'Détail copie')[0];
      await B.creerEleves(g, L.map((c, i) => ({ nom: 'Eleve' + i, prenom: 'Zoé', matricule: '950' + i, code: 'zy9' + i })));
      const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
      for (const [i, c] of L.entries()) await B.rendreCopie(g, Object.keys(u).find((k) => u[k].matricule === '950' + i), aid, { ...c, nom: 'Eleve' + i, prenom: 'Zoé' });
    }, { L: copies, aid });
    await p.click('[data-ong="suivi"]'); await p.waitForSelector('#contenuProf td.copie-cell');
    const cases = await p.$$eval('#contenuProf td.copie-cell', (L) => L.map((x) => ({ titre: x.title, detail: x.hasAttribute('data-copie-detail') })));
    if (cases.length !== 4) throw new Error('copies rendues dans le Suivi : ' + cases.length);
    const [a, b, c, d] = cases;
    if (!a.detail || a.titre.split('\n').slice(1).join('\n') !== 'Détail de la note :\n✓ Les documents : 1 sur 1\n✗ Le solde : 0 sur 2\n✓ Chaque pile : 0,375 sur 0,375\n'
      + '◑ Le crédit : 0,5 sur 1,5\nLes questions : 4 / 4 (4 justes, 0 « Je ne sais pas », 0 fausse)') throw new Error('infobulle : ' + JSON.stringify(a.titre));
    if (!/^5.875 sur 20 — copie rendue à /.test(a.titre) || !/^7 sur 20 — copie rendue à /.test(b.titre)) throw new Error('la note elle-même change : ' + a.titre.split('\n')[0] + ' / ' + b.titre.split('\n')[0]);
    // Une copie rendue avant ce chantier : les titres et l'état de chaque jalon, sans poids ni points.
    if (!b.detail || b.titre.split('\n').slice(1).join('\n') !== 'Détail de la note :\n✓ Les documents\n✗ Le solde') throw new Error('repli : ' + JSON.stringify(b.titre));
    // Aucun détail rangé : l'infobulle d'avant, mot pour mot (note, heure de remise).
    if (c.detail || /Détail|✓|✗/.test(c.titre) || c.titre.split('\n').length !== 1) throw new Error('détail inventé : ' + JSON.stringify(c.titre));
    if (!d.detail || d.titre.split('\n').slice(1).join('\n') !== 'Détail de la note :\n✓ Les questions : 4 sur 4 (3 justes, 1 « Je ne sais pas », 0 fausse)') throw new Error('ouverture en jalon : ' + JSON.stringify(d.titre));
    // Lecture seule : rien à cliquer, rien à saisir dans la note ; le seul geste reste « rouvrir ».
    const gestes = await p.$$eval('#contenuProf td.copie-cell', (L) => L.map((x) => x.querySelectorAll('input, select, textarea').length + ':' + x.querySelectorAll('button').length));
    if (gestes.join(' ') !== '0:1 0:1 0:1 0:1') throw new Error('gestes de la case : ' + gestes);
  } finally { await ctx.close(); }
});

await v('copie : aucune erreur JavaScript', async () => {
  if (erreursCp.length) throw new Error(erreursCp.slice(0, 3).join(' / '));
});

/* ---------------------------------------------------------- l'espace enseignant lit le catalogue (chantier 23, lot 3) */
// Le Suivi, les Compétences, la Conduite de séance, les Corrigés et les Niveaux ne lisent que les `meta` : ils passent
// par `catalogue()` et ne téléchargent le code d'aucune séance. Seuls Ramasser / Tout ramasser / Vérifier ont besoin
// du module (il sait noter) : il se charge AU CLIC, et lui seul. « Vérifier » est grisé d'après les `exports` du catalogue.
//
// Piège de ces cas : un module déjà importé ne fait plus de requête. Chaque cas ouvre donc son propre contexte (cache
// vide), et la première chose qu'il vérifie est que l'accueil lui-même n'a rien téléchargé : sinon il ne jugerait rien.
const FICHIER_SEANCE = /\/activites\/(?!index\.js$|catalogue\.js$)[^/]+\.js$/;
const FICHIER_CONTENU = /\/contenus\/.+\.js$/;
const COPIE_AID = 'picard-ent44';

// Contexte neuf, enseignant connecté, un groupe de `n` élèves, journal de toutes les requêtes de la page.
const espaceCatalogue = async (nom, n, avant) => {
  const ctx = await nav.newContext({ viewport: { width: 1366, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(6000);
  const reqs = [];
  const erreurs = [];
  p.on('request', (r) => reqs.push(new URL(r.url()).pathname));
  p.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  if (avant) await avant(ctx);
  await p.goto(BASE); await p.waitForSelector('#btnProf', { timeout: 8000 });
  await p.click('#btnProf'); await p.waitForSelector('#btnProfEspace'); await p.click('#btnProfEspace');
  await p.waitForSelector('#gNom');
  await p.fill('#gNom', nom); await p.selectOption('#gNiveau', '1re'); await p.click('#btnCreerG'); await p.waitForTimeout(300);
  const ids = await p.evaluate(async ({ nom, n }) => {
    const { B } = await import('/core/backend.js');
    const g = Object.entries(JSON.parse(localStorage.getItem('prepalog:groupes') || '{}')).find(([, x]) => x.nom === nom)[0];
    await B.creerEleves(g, Array.from({ length: n }, (_, i) => ({ nom: 'Cat' + i, prenom: 'Zoé', matricule: '960' + i, code: 'ct9' + i })));
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    return { gid: g, uids: Array.from({ length: n }, (_, i) => Object.keys(u).find((k) => u[k].matricule === '960' + i)) };
  }, { nom, n });
  return { ctx, p, reqs, erreurs, ...ids };
};
const seancesTelechargees = (reqs, depuis = 0) => reqs.slice(depuis).filter((u) => FICHIER_SEANCE.test(u));
const ongletPret = (p) => p.waitForFunction(() => {
  const t = (document.getElementById('contenuProf')?.textContent || '').trim();
  return t.length > 0 && !/^Chargement/.test(t);
});

await v('espace enseignant : Suivi, Compétences, Conduite de séance, Corrigés, Niveaux — aucun fichier de séance téléchargé', async () => {
  const e = await espaceCatalogue('Catalogue onglets', 2);
  const { p, reqs } = e;
  try {
    // Condition de validité : l'accueil et la création du groupe n'ont rien chargé (sinon le cache du navigateur cache tout).
    const dejaLa = seancesTelechargees(reqs);
    if (dejaLa.length) throw new Error(`l'accueil enseignant a déjà téléchargé ${dejaLa.length} séance(s) (${dejaLa.slice(0, 2).join(', ')}…) : ce cas ne peut rien juger`);
    const depuis = reqs.length;
    // Chaque onglet est ouvert, rendu, et contient ce que le catalogue seul permet d'afficher.
    await p.click('[data-ong="suivi"]'); await ongletPret(p);
    await p.waitForSelector(`#contenuProf [data-copie-verifier="${COPIE_AID}"]`);
    const colonnes = await p.$$eval('#contenuProf thead th', (L) => L.map((x) => x.textContent).join(' '));
    if (!/ENT-4\.4/.test(colonnes)) throw new Error('Suivi : colonne ENT-4.4 absente : ' + colonnes.slice(0, 200));
    await p.click('[data-ong="competences"]'); await ongletPret(p);
    if (!/Compétences?|compétence/.test(await p.textContent('#contenuProf'))) throw new Error('Compétences : onglet vide');
    await p.click('[data-ong="seance"]'); await p.waitForSelector(`#contenuProf [data-ouvre="${COPIE_AID}"]`);
    await p.click('[data-ong="niveaux"]'); await ongletPret(p);
    await p.click('[data-ong="corriges"]'); await p.waitForSelector('#contenuProf [data-corrige]');
    const avantCorrige = reqs.slice(depuis);
    const fautifs = avantCorrige.filter((u) => FICHIER_SEANCE.test(u) || FICHIER_CONTENU.test(u));
    if (fautifs.length) throw new Error(`${fautifs.length} fichier(s) de séance ou de contenu téléchargé(s) par les onglets : ${fautifs.slice(0, 4).join(', ')}`);
    // Ouvrir un corrigé charge le corrigé (contenus/corriges/…), jamais le fichier d'une séance.
    await p.click('#contenuProf [data-corrige]'); await p.waitForTimeout(400);
    const apres = seancesTelechargees(reqs, depuis);
    if (apres.length) throw new Error('un corrigé ouvert a téléchargé une séance : ' + apres.join(', '));
    if (e.erreurs.length) throw new Error(e.erreurs.slice(0, 2).join(' / '));
  } finally { await e.ctx.close(); }
});

await v('espace enseignant : ramasser une copie charge la séance au clic (elle seule) et note comme avant ; « Tout ramasser » de même', async () => {
  const e = await espaceCatalogue('Catalogue ramasser', 2);
  const { p, reqs } = e;
  const toast = () => p.evaluate(() => document.getElementById('toast')?.textContent || '');
  try {
    if (seancesTelechargees(reqs).length) throw new Error('l\'accueil enseignant a déjà téléchargé des séances : ce cas ne peut rien juger');
    // Deux élèves ont ouvert la séance (une base presque vide : tous les jalons « en attente », 0 sur 20) ; aucune copie rendue.
    await p.evaluate(async ({ uids, aid }) => {
      const { B } = await import('/core/backend.js');
      for (const u of uids) await B.ecrireJeuPrive(u, aid, { v: 1 });
    }, { uids: e.uids, aid: COPIE_AID });
    await p.click('[data-ong="suivi"]'); await ongletPret(p);
    const bouton = `[data-copie-ramasser][data-uid="${e.uids[0]}"][data-aid="${COPIE_AID}"]`;
    await p.waitForSelector(bouton);
    // Avant le clic : le tableau est dessiné, aucun fichier de séance n'est venu.
    const avant = seancesTelechargees(reqs);
    if (avant.length) throw new Error('fichier de séance téléchargé avant tout clic : ' + avant.join(', '));
    await p.click(bouton);
    // Le geste aboutit (la copie apparaît) ou dit pourquoi pas (« Rien à ramasser… ») : dans les deux cas on lit le bilan.
    await p.waitForFunction((uid) => document.querySelector(`td.copie-cell [data-copie-rouvrir][data-uid="${uid}"]`) || /Rien à ramasser|impossible/.test(document.getElementById('toast')?.textContent || ''), e.uids[0]);
    if (!/Copie de Zoé ramassée/.test(await toast())) throw new Error('bilan : ' + await toast());
    const charges = seancesTelechargees(reqs);
    if (charges.length !== 1 || !charges[0].endsWith(`/activites/${COPIE_AID}.js`)) throw new Error('après le clic, seul ' + COPIE_AID + '.js devait venir : ' + JSON.stringify(charges));
    const t = await p.evaluate(async ({ gid, uid, aid }) => (await import('/core/backend.js')).B.lireScore(gid, uid, aid), { gid: e.gid, uid: e.uids[0], aid: COPIE_AID });
    // 0 sur 20 et chaque jalon « en attente » : ce que donne le `noter` de la séance sur cette base, au nom de l'élève.
    if (!t || t.score !== 0 || t.max !== 20 || t.ramasse !== true || !t.rendu) throw new Error('note : ' + JSON.stringify(t));
    if (t.nom !== 'Cat0' || t.prenom !== 'Zoé') throw new Error('pas au nom de l\'élève : ' + JSON.stringify(t));
    if (!t.detail || t.detail.j1 !== 'attente' || t.detail.j20 !== 'attente') throw new Error('ce n\'est pas le noter de la séance : ' + JSON.stringify(t.detail).slice(0, 160));
    const mention = await p.$eval(`td.copie-cell [data-copie-rouvrir][data-uid="${e.uids[0]}"]`, (b) => b.closest('td').querySelector('[data-copie-mention]').textContent.trim());
    if (mention !== 'ramassée') throw new Error('mention : ' + mention);
    // « Tout ramasser » : le second élève est ramassé, le premier est déjà rendu.
    await p.click(`[data-copie-tout="${COPIE_AID}"]`);
    await p.waitForFunction((uid) => document.querySelector(`td.copie-cell [data-copie-rouvrir][data-uid="${uid}"]`), e.uids[1]);
    if (!/ENT-4\.4 : 1 copie\(s\) ramassée\(s\), 1 déjà rendue\(s\), 0 élève\(s\) sans travail/.test(await toast())) throw new Error('bilan global : ' + await toast());
    if (e.erreurs.length) throw new Error(e.erreurs.slice(0, 2).join(' / '));
  } finally { await e.ctx.close(); }
});

await v('espace enseignant : « Vérifier » est grisé pour une séance dont les exports du catalogue n\'ont pas `noter`, actif sinon', async () => {
  const { formaterCatalogue } = await import('../catalogue.mjs');
  const { CATALOGUE } = await import('../../activites/catalogue.js');
  const copies = CATALOGUE.filter((x) => x.meta.copie && x.meta.bareme);
  if (copies.length < 2) throw new Error('il faut au moins deux évaluations en copie au catalogue');
  const lire = async (entrees) => {
    const e = await espaceCatalogue('Catalogue vérifier', 1, entrees ? (ctx) => ctx.route('**/activites/catalogue.js', (r) => r.fulfill({
      status: 200, contentType: 'text/javascript', body: formaterCatalogue(entrees) })) : null);
    try {
      await e.p.click('[data-ong="suivi"]'); await ongletPret(e.p);
      await e.p.waitForSelector('#contenuProf [data-copie-verifier]');
      const etat = await e.p.$$eval('#contenuProf [data-copie-verifier]', (L) => Object.fromEntries(L.map((b) => [b.dataset.copieVerifier, b.disabled])));
      const titre = await e.p.$eval(`#contenuProf [data-copie-verifier="${COPIE_AID}"]`, (b) => b.title);
      if (e.erreurs.length) throw new Error(e.erreurs.slice(0, 2).join(' / '));
      return { etat, titre };
    } finally { await e.ctx.close(); }
  };
  // Catalogue tel quel : toutes les évaluations en copie savent noter, tous les boutons sont actifs.
  const normal = await lire(null);
  const ids = copies.map((x) => x.meta.id);
  const grises = Object.keys(normal.etat).filter((id) => normal.etat[id]);
  if (Object.keys(normal.etat).length !== ids.length || grises.length) throw new Error(`catalogue réel : ${Object.keys(normal.etat).length} boutons pour ${ids.length} évaluations, grisés : ${grises.join(', ') || 'aucun'}`);
  // Catalogue servi sans `noter` pour UNE évaluation (son vrai module sait pourtant noter) : seul son bouton se grise.
  const sans = await lire(CATALOGUE.map((x) => (x.meta.id === COPIE_AID ? { ...x, exports: x.exports.filter((n) => n !== 'noter') } : x)));
  if (sans.etat[COPIE_AID] !== true) throw new Error('bouton actif alors que le catalogue ne déclare pas `noter` : ' + JSON.stringify(sans.etat));
  if (!/ne sait pas se recalculer/.test(sans.titre)) throw new Error('infobulle : ' + sans.titre);
  const autres = ids.filter((id) => id !== COPIE_AID && sans.etat[id] !== false);
  if (autres.length) throw new Error('boutons grisés à tort : ' + autres.join(', '));
});

await v('espace enseignant : séance qui ne se charge pas au clic sur « ramasser » → message à l\'enseignant, bouton rendu, aucune erreur de page', async () => {
  const e = await espaceCatalogue('Catalogue séance cassée', 1, (ctx) => ctx.route(`**/activites/${COPIE_AID}.js`, (r) => r.abort()));
  const { p } = e;
  try {
    await p.evaluate(async ({ uid, aid }) => { await (await import('/core/backend.js')).B.ecrireJeuPrive(uid, aid, { v: 1 }); }, { uid: e.uids[0], aid: COPIE_AID });
    await p.click('[data-ong="suivi"]'); await ongletPret(p);
    const bouton = `[data-copie-ramasser][data-uid="${e.uids[0]}"][data-aid="${COPIE_AID}"]`;
    await p.waitForSelector(bouton);
    await p.click(bouton);
    await p.waitForFunction(() => /ne s'ouvre pas pour l'instant/.test(document.getElementById('toast')?.textContent || ''));
    if (await p.$('td.copie-cell')) throw new Error('une copie est apparue alors que la séance ne se charge pas');
    if (await p.$eval(bouton, (b) => b.disabled)) throw new Error('le bouton « ramasser » est resté bloqué');
    if (e.erreurs.length) throw new Error(e.erreurs.slice(0, 2).join(' / '));
  } finally { await e.ctx.close(); }
});

await ctxCp.close();
}
