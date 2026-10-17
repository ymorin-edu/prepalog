// Suite de tests de Prepalog — bloc « dialogue » : l'écran Téléphone (vue « Dialogue à choix », `core/types/dialogue.js`,
// branchée dans `core/types/entreprise.js`), brief `docs/briefs/MOTEUR-vue-dialogue.md`, lot 2, 14/10/2026.
//
// `node outils/test.mjs dialogue` lance ce bloc. Il monte la séance d'essai (`contenus/dialogue-essai.js`) dans un contexte de
// navigateur à lui, avec de vrais clics. Les VARIANTES de la déclaration (fautes, question au fil, condition d'entrée) sont
// fabriquées ici, dans la page, à partir de la vraie déclaration.
//
// Le contexte demande `reducedMotion: 'reduce'` : la réponse de l'interlocuteur arrive tout de suite (sans le « … » de 0,7 s,
// qui n'est qu'un effet d'affichage). Le double-clic, lui, se joue avec le délai, dans un contexte à part.
//
// Valeurs attendues écrites à la main : numéro de livraison LIV-2041-07 (piège LIV-2401-07) ; réponses justes accueil =
// 'presente', refs = 'juste', jour = 'mardi', vehicule = 'porteur', confirme = 'oui', cloture = 'merci' ; deux jalons de 10 points.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCE = 'essai-dialogue';
const JUSTES = { accueil: 'presente', refs: 'juste', jour: 'mardi', vehicule: 'porteur', confirme: 'oui', cloture: 'merci' };
const ORDRE = ['accueil', 'refs', 'jour', 'vehicule', 'confirme', 'cloture'];

const erreursD = [];
async function nouvellePage(ctx) {
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(6000);
  pg.on('pageerror', (e) => erreursD.push('PAGEERROR: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursD.push('CONSOLE: ' + m.text()); });
  pg.on('dialog', (d) => d.accept());
  await pg.goto(BASE);
  await pg.waitForSelector('#btnProf', { timeout: 8000 });
  return pg;
}
const ctxD = await nav.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
const pg = await nouvellePage(ctxD);

// Monte la séance d'essai. `db` : base de départ (copiée) ; `garder` : la base de la montée précédente (un rechargement) ;
// `role` ; `uid` ; `correction` ; `questions` : une question au fil au geste `dialogue:quai:refs` ; `quand` : le Téléphone
// n'apparaît qu'après le geste `quand` (une fonction rangée sous ce nom) ; `faute` : une déclaration fautive (rend le message).
const monter = (o = {}) => pg.evaluate(async ({ o, SEANCE }) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const S = await import('/contenus/dialogue-essai.js');
  const { apresGeste, dialogueFini } = await import('/core/declencheurs.js');
  const copieT = () => ({ ...S.TELEPHONE, leurres: S.TELEPHONE.leurres.map((l) => ({ ...l })),
    dialogues: S.TELEPHONE.dialogues.map((d) => ({ ...d, repliques: d.repliques.map((r) => ({ ...r, choix: r.choix.map((c) => ({ ...c })) })) })) });
  const T = copieT();
  const r = (id) => T.dialogues[0].repliques.find((x) => x.id === id);
  // L'EMBRANCHEMENT (lot 3) : à « jour », « Je ne sais pas » part vers la réplique « rappel-jour » (sans réaction : elle parle) ;
  // la bonne réponse de « jour » saute par-dessus (`vers: 'vehicule'`).
  if (o.branche || o.faute === 'boucle' || o.faute === 'versInconnu') {
    const R = T.dialogues[0].repliques;
    r('jour').choix.find((c) => c.juste).vers = 'vehicule';
    r('jour').choix.push({ v: 'sais-pas', lib: 'Je ne sais pas, je dois demander.', vers: 'rappel-jour' });
    R.splice(R.findIndex((x) => x.id === 'vehicule'), 0, { id: 'rappel-jour', dit: 'Regarde ton bon de livraison, c’est écrit dessus. Alors, quel jour ?',
      choix: [{ v: 'mardi', juste: true, lib: 'Mardi, vers 9 h. Excuse-moi.' },
        { v: 'toujours', lib: 'Je ne trouve toujours pas.', reaction: 'Prends ton temps, je patiente.' }] });
  }
  // LE FACE À FACE (lot 3 du chantier « quai en deux séances », 17/10/2026) : même dialogue, `face: true`, sans leurres, un autre
  // libellé de menu et un autre contact (« poste 214 » et « Appelle… » sont des mots de téléphone DÉCLARÉS par la séance d'essai :
  // une séance en face à face ne les écrit pas). `sansSituation` : l'écran dit alors sa phrase par défaut.
  if (o.face) {
    T.face = true; delete T.leurres; T.libelle = 'Au quai';
    T.dialogues[0].contact = { nom: 'Marc — chauffeur', detail: 'camion du Havre' };
    if (o.sansSituation) delete T.situation; else T.situation = 'Accueille le chauffeur sur le quai.';
  }
  // L'ÉVALUATION : une phrase neutre après le piège (elle ne dit rien de la réponse).
  if (o.copie) r('refs').choix.find((c) => c.v === 'inverse').neutre = 'D’accord, je note.';
  const U = S.univers({ telephone: T, copie: !!o.copie });
  if (o.faute) {
    const F = {
      deuxJustes: () => { r('jour').choix[1].juste = true; delete r('jour').choix[1].reaction; },
      aucunJuste: () => { r('jour').choix[0].juste = false; r('jour').choix[0].reaction = 'Hein ?'; },
      vDouble: () => { r('accueil').choix[2].v = 'salut'; },
      sansReaction: () => { delete r('vehicule').choix[1].reaction; },
      deInconnu: () => { T.dialogues[0].de = 'mehdi'; },
      selonPlante: () => { r('refs').selon = (db) => ({ libs: { juste: db.livraison.toUpperCase() } }); },
      selonCle: () => { r('refs').selon = () => ({ libs: { faux: 'x' } }); },
      option: () => { U.telephon = U.telephone; delete U.telephone; },
      jalonAbsent: () => { U.etapes = U.etapes.map((e) => ({ ...e, ecran: 'dialogue:quia' })); },
      fermeture: () => { U.fermetures = { stock: { ouvertSi: dialogueFini('quia'), message: 'x' } }; },
      // La boucle n'est atteinte que par une maladresse : seul le contrôle « toute branche finit » la voit.
      boucle: () => { r('rappel-jour').choix[0].vers = 'rappel-jour'; },
      versInconnu: () => { r('jour').choix.find((c) => c.v === 'sais-pas').vers = 'nulle-part'; },
      faceLeurres: () => { T.face = true; },                    // les leurres de l'essai restent déclarés
      faceType: () => { T.face = 'oui'; delete T.leurres; },
      geste: () => { U.questions = { id: SEANCE, personnes: {}, etapes: [], liste: [{ id: 'q', type: 'fil', de: 'nadia', reflexion: true,
        quand: apresGeste('dialogue:quai:refz'), enonce: 'E ?', choix: [{ v: 'a', lib: 'A' }, { v: 'b', lib: 'B' }], retour: 'R.' }] }; },
    };
    F[o.faute]();
    try { creerEntreprise(U); return 'accepté'; } catch (e) { return e.message; }
  }
  if (o.questions) {
    U.questions = { id: SEANCE, personnes: {}, etapes: [], liste: [{ id: 'au-numero', type: 'fil', de: 'nadia', reflexion: true,
      quand: apresGeste('dialogue:quai:refs'), enonce: 'Pourquoi Nadia veut-elle le numéro ?',
      choix: [{ v: 'trouver', lib: 'Pour retrouver la livraison' }, { v: 'politesse', lib: 'Par habitude' }], retour: 'Le numéro, c’est la livraison.' }] };
  }
  if (o.quand) U.telephone.quand = (db) => !!(db.mails || []).some((m) => m.folder === 'out');
  document.querySelector('#dTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'dTest'; document.body.prepend(hote);
  const db = o.garder ? JSON.parse(JSON.stringify(window.__d.db)) : (o.db ? JSON.parse(JSON.stringify(o.db)) : {});
  window.__d = { db, enregistres: [], moteur: null };
  const ctx = {
    meta: { ...S.META, ...(o.correction ? { correction: true } : {}), ...(o.copie ? { copie: true, temps: 'evaluation' } : {}) },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (x) => { window.__d.enregistres.push(JSON.parse(JSON.stringify(x))); }, quitter: () => {}, codeStock: 'ESSAI',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  };
  const M = creerEntreprise(U);
  window.__d.moteur = M;
  M.rendre(hote, ctx);
  return 'ok';
}, { o, SEANCE });

const Z = '#dTest';
const pause = (ms = 60) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__d.db)));
const etatD = async () => ((((await base()).dialogues || {})[SEANCE]) || {});
const appelsQuai = async () => ((await etatD()).quai || {}).appels || [];
const note = () => pg.evaluate(() => window.__d.moteur.noter(window.__d.db));
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const aller = async (vue) => { await pg.evaluate(({ Z, vue }) => document.querySelector(`${Z} .ent-nav[data-vue="${vue}"]`).click(), { Z, vue }); await pause(); };
const appeler = async (id = 'quai') => { await pg.click(`${Z} [data-dlg-appeler="${id}"]`); await pause(); };
const dire = async (v) => { await pg.click(`${Z} [data-dlg-choix="${v}"]`); await pause(); };
const raccrocher = async () => { await pg.click(`${Z} [data-dlg-raccrocher]`); await pause(); };
const choixAffiches = () => pg.$$eval(`${Z} [data-dlg-choix]`, (L) => L.map((b) => b.dataset.dlgChoix));
const choixLibres = () => pg.$$eval(`${Z} [data-dlg-choix]:not([disabled])`, (L) => L.map((b) => b.dataset.dlgChoix));
const fil = () => pg.textContent(`${Z} [data-dlg-fil]`);
// Un appel juste de bout en bout, sauf les réponses données dans `sauf` (réplique → liste de clés dites AVANT la juste).
async function appelComplet(sauf = {}) {
  await appeler();
  for (const r of ORDRE) {
    for (const v of sauf[r] || []) await dire(v);
    await dire(JUSTES[r]);
  }
  await raccrocher();
}

await v('Téléphone : déclaration refusée avec un message qui nomme la faute (dialogue, réplique)', async () => {
  const attendus = {
    deuxJustes: /« quai ».*« jour ».*exactement un choix `juste: true` \(2 trouvés\)/,
    aucunJuste: /« quai ».*« jour ».*exactement un choix `juste: true` \(0 trouvé\)/,
    vDouble: /« accueil ».*« salut » en double/,
    sansReaction: /« vehicule ».*« gros » n’est pas juste et n’a pas de `reaction`/,
    deInconnu: /« quai ».*« mehdi » n’est pas une personne de la séance/,
    selonPlante: /« refs ».*`selon` plante sur une base vide/,
    selonCle: /« refs ».*`selon` rend la clé « faux »/,
    option: /l'option « telephon » n'existe pas\..*telephone/,
    jalonAbsent: /le jalon « appel-quai » : le dialogue « quia » n’existe pas/,
    fermeture: /la fermeture de l’écran « stock » : le dialogue « quia » n’existe pas/,
    geste: /question « q » : geste inconnu « dialogue:quai:refz »/,
  };
  for (const [faute, re] of Object.entries(attendus)) {
    const m = await monter({ faute });
    vrai(re.test(m), `${faute} : ${m}`);
  }
  egal(await monter(), 'ok', 'la déclaration juste est refusée');
});

await v('Téléphone : parcours juste — 0 reprise, gestes rangés une fois, le Stock (fermé par `dialogueFini`) ne s’ouvre qu’au raccrochage, note 20', async () => {
  await monter();
  vrai(await present('.ent-nav-ferme[data-vue-fermee="stock"]'), 'le Stock n’est pas fermé avant l’appel');
  await aller('telephone');
  vrai(/Appelle le quai de réception/.test(await pg.textContent(`${Z} #entMain`)), 'la phrase de situation manque');
  egal(Object.keys(((await base()).gestes || {})[SEANCE] || {}), [], 'ouvrir l’écran n’est pas un geste');
  await appeler();
  for (const r of ORDRE) await dire(JUSTES[r]);
  vrai(await present('[data-dlg-raccrocher]'), 'pas de bouton « Raccrocher » à la fin');
  vrai(/Bonne journée, Lea !/.test(await fil()), 'la dernière bulle (fin, {prenom}) manque');
  egal((await note()).detail['appel-quai'], 'attente', 'jalon jugé avant le raccrochage');
  vrai(await present('.ent-nav-ferme[data-vue-fermee="stock"]'), 'le Stock s’ouvre avant le raccrochage');
  await raccrocher();
  const A = await appelsQuai();
  egal([A.length, A[0].reprises, !!A[0].fin], [1, 0, true], 'appel rangé');
  egal(A[0].pas.map((p) => `${p.r}:${p.v}`), ORDRE.map((r) => `${r}:${JUSTES[r]}`), 'ce que l’élève a dit');
  egal(Object.keys((await base()).gestes[SEANCE]).sort(),
    ['dialogue:quai:appeler', ...ORDRE.map((r) => `dialogue:quai:${r}`), 'dialogue:quai:fin'].sort(), 'gestes');
  vrai(!(await present('.ent-nav-ferme[data-vue-fermee="stock"]')) && await present('.ent-nav[data-vue="stock"]'), 'le Stock reste fermé après le raccrochage');
  const n = await note();
  egal([n.score, n.detail['appel-quai'], n.detail['numero-quai']], [20, 'ok', 'ok'], 'note');
  egal(n.detail.dialogues, { quai: [{ reprises: 0, pas: ORDRE.map((r) => `${r}:${JUSTES[r]}`).join(' ') }] }, 'journal court de l’enseignant');
  vrai(/Appel terminé/.test(await pg.textContent(`${Z} .dlg-contacts`)), 'le contact ne dit pas « Appel terminé »');
  vrai(!(await present('[data-dlg-appeler="quai"]')), 'on peut rappeler sans correction');
});

await v('Téléphone : une maladresse — réaction du personnage, MÊME réplique reposée, choix grisé qui ne se clique plus, 1 reprise ; `accepte` : réaction ET suite', async () => {
  await monter();
  await aller('telephone');
  await appeler();
  await dire('salut');
  vrai(/C’est qui, et c’est pour quoi exactement \?/.test(await fil()), 'la réaction manque');
  egal((await choixAffiches()).sort(), ['place', 'presente', 'salut'], 'la réplique n’est pas reposée');
  egal((await choixLibres()).sort(), ['place', 'presente'], 'le choix maladroit n’est pas grisé');
  vrai(await pg.$eval(`${Z} [data-dlg-choix="salut"]`, (b) => b.classList.contains('dit') && /déjà dit/.test(b.textContent)), 'pas de « déjà dit »');
  await pg.evaluate((Z) => document.querySelector(`${Z} [data-dlg-choix="salut"]`).dispatchEvent(new MouseEvent('click', { bubbles: true })), Z);
  await pause();
  egal((await appelsQuai())[0].pas.length, 1, 'le choix grisé a été redit');
  egal((await appelsQuai())[0].reprises, 1, 'reprises');
  await dire('presente');
  for (const r of ['refs', 'jour', 'vehicule']) await dire(JUSTES[r]);
  await dire('ouais');
  vrai(/… Bon\. Je note\./.test(await fil()), 'la réaction de l’accepte manque');
  egal((await choixAffiches()).sort(), ['merci', 'rien'], 'l’accepte ne passe pas à la suite');
  egal((await appelsQuai())[0].reprises, 2, 'l’accepte ne compte pas une reprise');
});

await v('Téléphone : jamais bloqué — trois maladresses de suite à une réplique à 4 choix, la juste reste seule et fait avancer', async () => {
  await monter();
  await aller('telephone');
  await appeler();
  await dire('presente');
  for (const x of ['inverse', 'produit', 'bientot']) await dire(x);
  egal(await choixLibres(), ['juste'], 'choix encore cliquables');
  await dire('juste');
  egal((await choixAffiches()).sort(), ['mardi', 'semaine'], 'la juste ne fait pas avancer');
  egal((await appelsQuai())[0].reprises, 3, 'reprises');
});

await v('Téléphone : textes figés à l’arrivée (`selon`) et `{prenom}` remplacé', async () => {
  await monter();
  await aller('telephone');
  await appeler();
  vrai(/c’est Lea, du service transport/.test(await pg.textContent(`${Z} [data-dlg-choix="presente"]`)), '{prenom} dans une réponse');
  await dire('presente');
  vrai(/D’accord, Lea\./.test(await fil()), '{prenom} dans une bulle');
  egal(await pg.textContent(`${Z} [data-dlg-choix="juste"] .dlg-choix-txt`), 'Oui : livraison LIV-2041-07.', 'texte calculé');
  egal(await pg.textContent(`${Z} [data-dlg-choix="inverse"] .dlg-choix-txt`), 'Oui : livraison LIV-2401-07.', 'texte du piège');
  await pg.evaluate(() => { window.__d.db.livraison = 'LIV-9999-99'; });
  await aller('accueil');
  await aller('telephone');
  egal(await pg.textContent(`${Z} [data-dlg-choix="juste"] .dlg-choix-txt`), 'Oui : livraison LIV-2041-07.', 'le texte a bougé avec la base');
  await dire('juste');
  vrai(/livraison LIV-2041-07/.test(await fil()), 'la bulle dite n’a pas le texte figé');
});

await v('Téléphone : quitter au milieu, recharger — même réplique, mêmes textes, même ordre, mêmes grisés ; « en cours » au menu', async () => {
  await monter();
  await aller('telephone');
  await appeler();
  await dire('presente');
  await dire('produit');
  const avant = { ordre: await choixAffiches(), libres: await choixLibres(), fil: await fil() };
  await aller('accueil');
  vrai(/en cours/.test(await pg.textContent(`${Z} .ent-nav[data-vue="telephone"]`)), 'pas de marque « en cours » au menu');
  await monter({ garder: true });
  vrai(/en cours/.test(await pg.textContent(`${Z} .ent-nav[data-vue="telephone"]`)), 'la marque se perd au rechargement');
  await aller('telephone');
  egal({ ordre: await choixAffiches(), libres: await choixLibres(), fil: await fil() }, avant, 'l’appel retrouvé');
  // L'ordre est celui de la graine de l'élève, de l'appel n° 1 (écrit à la main : graine = uid).
  const tire = await pg.evaluate(async () => {
    const { hasard } = await import('/core/tirage.js');
    return hasard('u-test|quai|refs|1').melanger(['juste', 'inverse', 'produit', 'bientot']);
  });
  egal((await appelsQuai())[0].ordres.refs, tire, 'ordre tiré');
  egal(await choixAffiches(), tire, 'ordre affiché');
  await dire('juste');
  for (const r of ORDRE.slice(2)) await dire(JUSTES[r]);
  await raccrocher();
  await aller('accueil');
  vrai(!/en cours/.test(await pg.textContent(`${Z} .ent-nav[data-vue="telephone"]`)), 'la marque reste après le raccrochage');
});

await v('Téléphone : deux élèves ont des ordres différents (50 graines) ; l’ordre d’un même élève ne dépend que de sa graine', async () => {
  const r = await pg.evaluate(async () => {
    const { creerTelephone } = await import('/core/types/dialogue.js');
    const S = await import('/contenus/dialogue-essai.js');
    const ordres = [];
    for (let i = 0; i < 50; i++) {
      const T = creerTelephone(S.TELEPHONE, { personnes: S.EQUIPE });
      const z = document.createElement('div'), etat = {};
      const api = { graine: `eleve-${i}`, db: {}, prenom: 'X', sauver() {}, signal() {}, delai: 0 };
      z.innerHTML = T.html(etat, api); T.brancher(z, etat, api);
      z.querySelector('[data-dlg-appeler="quai"]').click();
      ordres.push(JSON.stringify(etat.quai.appels[0].ordres.accueil));
    }
    return new Set(ordres).size;
  });
  vrai(r > 1, `un seul ordre sur 50 élèves (${r})`);
});

await v('Téléphone : une question au fil au geste `dialogue:quai:refs` n’ouvre son panneau qu’après « Raccrocher »', async () => {
  await monter({ questions: true });
  await aller('telephone');
  await appeler();
  await dire('presente');
  await dire('juste');
  vrai(!!((await base()).gestes[SEANCE]['dialogue:quai:refs']), 'le geste n’est pas rangé');
  vrai(!(await present('[data-q-panneau]')), 'le panneau s’ouvre pendant l’appel');
  for (const r of ORDRE.slice(2)) await dire(JUSTES[r]);
  vrai(!(await present('[data-q-panneau]')), 'le panneau s’ouvre avant le raccrochage');
  await raccrocher();
  vrai(await present('[data-q-panneau]'), 'le panneau ne s’ouvre pas au raccrochage');
  vrai(/Pourquoi Nadia veut-elle le numéro/.test(await pg.textContent(`${Z} [data-q-panneau]`)), 'pas la bonne question');
});

await v('Téléphone : correction — jalon ✗, « Corriger » rouvre le contact avec « Rappeler » ; le premier appel reste rangé, le jalon lit le dernier, la note est moyennée', async () => {
  await monter({ correction: true });
  await aller('telephone');
  await appelComplet({ refs: ['inverse'] });
  let n = await note();
  egal([n.score, n.detail['appel-quai'], n.detail['numero-quai']], [10, 'ok', 'ko'], 'premier bilan');
  vrai(await present('[data-fin-corriger]'), 'pas de « Corriger » au bandeau');
  vrai(!(await present('[data-dlg-appeler="quai"]')) && await present('[data-dlg-journal="quai"]'), '« Rappeler » avant « Corriger »');
  await aller('accueil');
  await pg.click(`${Z} [data-fin-corriger]`);
  await pause();
  vrai(await present('.ent-nav.on[data-vue="telephone"]'), '« Corriger » n’ouvre pas le Téléphone');
  egal((await pg.textContent(`${Z} [data-dlg-appeler="quai"]`)).trim(), '📞 Rappeler', 'le bouton « Rappeler »');
  // Rechargé : « Rappeler » est toujours offert.
  await monter({ garder: true, correction: true });
  await aller('telephone');
  vrai(await present('[data-dlg-appeler="quai"]'), '« Rappeler » perdu au rechargement');
  await appelComplet();
  const A = await appelsQuai();
  egal(A.length, 2, 'appels rangés');
  egal(A[0].pas.map((p) => p.v).slice(0, 3), ['presente', 'inverse', 'juste'], 'le premier appel n’est plus là tel quel');
  egal(A[1].reprises, 0, 'reprises du rappel');
  // Le rappel a son ordre (graine, dialogue, réplique, numéro d'appel 2).
  const tire = await pg.evaluate(async () => {
    const { hasard } = await import('/core/tirage.js');
    return hasard('u-test|quai|refs|2').melanger(['juste', 'inverse', 'produit', 'bientot']);
  });
  egal(A[1].ordres.refs, tire, 'ordre du rappel');
  n = await note();
  egal([n.detail['appel-quai'], n.detail['numero-quai']], ['ok', 'ok'], 'le jalon ne lit pas le dernier appel');
  const dernier = await pg.evaluate(() => window.__d.enregistres[window.__d.enregistres.length - 1]);
  egal(dernier.score, 15, 'note moyennée (10 au premier bilan, 20 après)');
  egal((await base()).indicateurs[SEANCE].corrections, 1, 'corrections comptées');
  vrai(!(await present('[data-dlg-appeler="quai"]')), '« Rappeler » encore offert après le rappel');
});

await v('Téléphone : contact sans dialogue — messagerie vocale, appel rangé, geste ; pas d’appel pendant un autre', async () => {
  await monter();
  await aller('telephone');
  egal(await pg.$$eval(`${Z} .dlg-contact b`, (L) => L.map((b) => b.textContent)), ['Quai de réception', 'Thomas Leroy'], 'contacts dans l’ordre alphabétique');
  await appeler('thomas');
  vrai(/messagerie de Thomas Leroy/.test(await pg.textContent(`${Z} .dlg-droite`)), 'pas de messagerie vocale');
  await pg.click(`${Z} [data-dlg-raccrocher-leurre]`);
  await pause();
  const E = await etatD();
  egal(E['@leurres'].map((x) => x.id), ['thomas'], 'appel rangé');
  vrai(!!(await base()).gestes[SEANCE]['dialogue:thomas:appeler'], 'geste');
  await appeler();
  vrai(!(await present('[data-dlg-appeler="thomas"]')), 'un autre appel est possible pendant l’appel');
});

await v('Téléphone : condition d’entrée (`quand`) — l’entrée n’apparaît qu’une fois vraie ; l’enseignant la voit toujours', async () => {
  await monter({ quand: true });
  vrai(!(await present('.ent-nav[data-vue="telephone"]')), 'l’entrée est là avant la condition');
  await pg.evaluate(() => { window.__d.db.mails.push({ id: 999, folder: 'out', ts: Date.now(), toMail: 'x@y.example', text: '.' }); });
  await aller('accueil');
  vrai(await present('.ent-nav[data-vue="telephone"]'), 'l’entrée n’apparaît pas');
  await monter({ quand: true, role: 'prof' });
  vrai(await present('.ent-nav[data-vue="telephone"]'), 'l’enseignant ne voit pas l’entrée');
});

await v('Téléphone : l’enseignant joue l’appel sans rien écrire ; la réponse attendue est marquée pour lui', async () => {
  await monter({ role: 'prof' });
  await aller('telephone');
  await appeler();
  vrai(/réponse attendue/.test(await pg.textContent(`${Z} [data-dlg-choix="presente"]`)), 'la juste n’est pas marquée');
  egal(await pg.$$eval(`${Z} .dlg-attendue`, (L) => L.length), 1, 'une seule réponse marquée');
  await dire('salut');
  await dire('presente');
  const b = await base();
  vrai(!b.dialogues && !b.gestes, `l’appel de l’enseignant est écrit : ${JSON.stringify({ d: b.dialogues, g: b.gestes })}`);
});

await v('Téléphone : neutralité — aucun « juste / faux / correct / erreur » du moteur pendant l’appel, aucun aplat vert ni texte rouge dans la zone d’appel', async () => {
  await monter();
  await aller('telephone');
  await appeler();
  await dire('salut');
  await dire('presente');
  await dire('inverse');
  const r = await pg.evaluate((Z) => {
    const zone = document.querySelector(`${Z} .dlg`);
    const racine = getComputedStyle(document.documentElement);
    const teinte = (nom) => { const d = document.createElement('i'); d.style.color = racine.getPropertyValue(nom).trim(); document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    const vert = teinte('--vert'), rouge = teinte('--rouge');
    const fautes = [];
    zone.querySelectorAll('*').forEach((el) => {
      const s = getComputedStyle(el);
      if (s.backgroundColor === vert) fautes.push('aplat vert : ' + el.className);
      if (s.color === rouge && el.textContent.trim()) fautes.push('texte rouge : ' + el.className);
    });
    // Le texte du moteur : tout sauf ce que déclare la séance (bulles et réponses).
    const copie = zone.cloneNode(true);
    copie.querySelectorAll('.dlg-bulle, .dlg-choix-txt').forEach((x) => x.remove());
    return { fautes, mots: (copie.textContent.match(/\b(juste|faux|fausse|correct|correcte|erreur)\b/gi) || []) };
  }, Z);
  egal(r.fautes, [], 'couleurs');
  egal(r.mots, [], 'mots du moteur');
});

await v('Téléphone : ergonomie à 1366 × 768 et 1280 × 720 — appel de 6 répliques avec réactions, aucun défilement de page, le fil montre la dernière bulle', async () => {
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pg.setViewportSize({ width: w, height: h });
    await monter();
    await aller('telephone');
    await appeler();
    for (const r of ORDRE) {
      const maladroits = (await choixLibres()).filter((x) => x !== JUSTES[r]);
      for (const x of maladroits.slice(0, 1)) await dire(x);
      if ((await choixAffiches()).includes(JUSTES[r])) await dire(JUSTES[r]);
    }
    const m = await pg.evaluate((Z) => {
      const f = document.querySelector(`${Z} [data-dlg-fil]`);
      const d = document.scrollingElement;
      const bas = document.querySelector(`${Z} .dlg`).getBoundingClientRect().bottom;
      return { page: d.scrollHeight - innerHeight, filDefile: f.scrollHeight > f.clientHeight, finVisible: f.scrollHeight - f.scrollTop - f.clientHeight, bas, h: innerHeight };
    }, Z);
    vrai(m.filDefile, `${w}×${h} : le fil ne défile pas (essai trop court)`);
    vrai(m.finVisible <= 2, `${w}×${h} : le fil ne montre pas la dernière bulle (${m.finVisible})`);
    vrai(m.bas <= m.h, `${w}×${h} : l’écran dépasse la fenêtre (${m.bas} > ${m.h})`);
  }
  await pg.setViewportSize({ width: 1366, height: 768 });
});

await v('Téléphone : au clavier — Tab atteint les réponses, Entrée dit la réplique, le focus revient sur une réponse après le redessin', async () => {
  await monter();
  await aller('telephone');
  await pg.focus(`${Z} [data-dlg-appeler="quai"]`);
  await pg.keyboard.press('Enter');
  await pause();
  vrai(await pg.evaluate(() => !!document.activeElement.closest('[data-dlg-choix]')), 'le focus n’est pas sur une réponse après « Appeler »');
  const premier = await pg.evaluate(() => document.activeElement.dataset.dlgChoix);
  await pg.keyboard.press('Tab');
  const second = await pg.evaluate(() => document.activeElement.dataset.dlgChoix);
  vrai(second && second !== premier, 'Tab ne parcourt pas les réponses');
  // Aller sur la juste au clavier (Tab, puis Maj+Tab si elle est avant), puis Espace.
  const surJuste = async () => (await pg.evaluate(() => document.activeElement.dataset.dlgChoix)) === 'presente';
  for (let i = 0; i < 3 && !(await surJuste()); i++) await pg.keyboard.press('Tab');
  for (let i = 0; i < 4 && !(await surJuste()); i++) await pg.keyboard.press('Shift+Tab');
  vrai(await surJuste(), 'la juste ne s’atteint pas au clavier');
  await pg.keyboard.press('Space');
  await pause();
  egal((await appelsQuai())[0].pas.map((p) => p.v), ['presente'], 'Espace ne dit pas la réplique');
  vrai(await pg.evaluate(() => !!document.activeElement.closest('[data-dlg-choix]')), 'le focus ne revient pas sur une réponse');
});

await v('Téléphone : « Réinitialiser » garde les appels (comme les questions au fil)', async () => {
  await monter();
  await aller('telephone');
  await appelComplet({ accueil: ['salut'] });
  await pg.click(`${Z} [data-raz]`);
  await pause();
  const A = await appelsQuai();
  egal([A.length, A[0].reprises], [1, 1], 'appels après la remise à zéro');
});

await v('Téléphone : double-clic rapide (avec le « … » de l’interlocuteur) — une seule réplique dite', async () => {
  const ctx2 = await nav.newContext({ viewport: { width: 1366, height: 768 } });
  const p2 = await nouvellePage(ctx2);
  await p2.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const S = await import('/contenus/dialogue-essai.js');
    const hote = document.createElement('div'); hote.id = 'dTest'; document.body.prepend(hote);
    const db = {};
    window.__d = { db };
    creerEntreprise(S.univers()).rendre(hote, { meta: S.META, profil: { prenom: 'Lea', role: 'eleve', uid: 'u-test' },
      jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, lireScore: async () => null });
  });
  await p2.click('#dTest .ent-nav[data-vue="telephone"]');
  await p2.click('#dTest [data-dlg-appeler="quai"]');
  await p2.dblclick('#dTest [data-dlg-choix="salut"]');
  vrai(await p2.$('#dTest .dlg-bulle.points'), 'pas de « … » pendant que l’interlocuteur répond');
  await p2.waitForTimeout(900);
  const pas = await p2.evaluate(() => window.__d.db.dialogues['essai-dialogue'].quai.appels[0].pas.length);
  egal(pas, 1, 'répliques dites');
  vrai(/C’est qui/.test(await p2.textContent('#dTest [data-dlg-fil]')), 'la réaction n’arrive pas après le délai');
  await ctx2.close();
});

await v('Téléphone : le journal court de l’enseignant (Repérage) — appels terminés seulement, reprises, contacts sans dialogue', async () => {
  const html = await pg.evaluate(async () => {
    // Le suivi lit le détail de la note ; on lui passe un détail fabriqué (journal court tel que le range le moteur).
    const { journalCourt } = await import('/core/types/dialogue.js');
    const J = journalCourt({ quai: { appels: [{ debut: 1, fin: 2, reprises: 2, pas: [{ r: 'accueil', v: 'salut' }, { r: 'accueil', v: 'presente' }] },
      { debut: 3 }] }, '@leurres': [{ id: 'thomas', at: 0 }] });
    return JSON.stringify(J);
  });
  egal(JSON.parse(html), { quai: [{ reprises: 2, pas: 'accueil:salut accueil:presente' }], '@leurres': ['thomas'] }, 'journal court (un appel en cours n’y est pas)');
});

await v('Téléphone (lot 3) : contrôle des embranchements — `vers` inconnu, boucle sans issue atteinte par une maladresse ; une maladresse sans réaction est permise en évaluation', async () => {
  const boucle = await monter({ faute: 'boucle' });
  vrai(/depuis la réplique « rappel-jour », les bonnes réponses tournent en rond/.test(boucle), boucle);
  const vers = await monter({ faute: 'versInconnu' });
  vrai(/« jour » : `vers` = « nulle-part » n’est pas une réplique/.test(vers), vers);
  egal(await monter({ faute: 'sansReaction', copie: true }), 'accepté', 'évaluation : une maladresse sans réaction est refusée');
});

await v('Téléphone (lot 3) : embranchement — « Je ne sais pas » mène à une autre réplique (1 reprise), puis l’appel reprend son cours', async () => {
  await monter({ branche: true });
  await aller('telephone');
  await appeler();
  await dire('presente');
  await dire('juste');
  await dire('sais-pas');
  vrai(/Regarde ton bon de livraison/.test(await fil()), 'la réplique de la branche ne vient pas');
  egal((await choixAffiches()).sort(), ['mardi', 'toujours'], 'pas à la réplique de la branche');
  await dire('toujours');
  vrai(/Prends ton temps/.test(await fil()), 'la réaction dans la branche manque');
  await dire('mardi');
  egal((await choixAffiches()).sort(), ['gros', 'porteur'], 'la branche ne rejoint pas l’appel');
  for (const r of ORDRE.slice(3)) await dire(JUSTES[r]);
  await raccrocher();
  const A = (await appelsQuai())[0];
  egal(A.pas.map((p) => `${p.r}:${p.v}`).slice(2, 5), ['jour:sais-pas', 'rappel-jour:toujours', 'rappel-jour:mardi'], 'ce que l’élève a dit');
  egal(A.reprises, 2, 'reprises');
  // Le chemin juste saute la branche.
  await monter({ branche: true });
  await aller('telephone');
  await appelComplet();
  vrai(!(await appelsQuai())[0].pas.some((p) => p.r === 'rappel-jour'), 'la bonne réponse passe par la branche');
});

await v('Téléphone (lot 3) : évaluation — aucune réaction, aucun grisé, la première réponse compte et l’appel enchaîne (phrase neutre déclarée) ; pas de « Rappeler », rien au suivi pendant le travail', async () => {
  await monter({ copie: true });
  await aller('telephone');
  await appeler();
  await dire('salut');
  const f1 = await fil();
  vrai(!/C’est qui/.test(f1), 'une réaction s’affiche en évaluation');
  egal((await choixAffiches()).sort(), ['bientot', 'inverse', 'juste', 'produit'], 'l’appel n’enchaîne pas');
  egal(await pg.$$eval(`${Z} [data-dlg-choix][disabled], ${Z} .dlg-choix.dit`, (L) => L.length), 0, 'un choix grisé');
  await dire('inverse');
  vrai(/D’accord, je note\.\s*Nadia\s*Je la vois\. Elle arrive quand \?/.test(await fil()), 'la phrase neutre puis la réplique suivante');
  vrai(!/Je ne le trouve pas/.test(await fil()), 'la réaction du piège s’affiche');
  for (const r of ORDRE.slice(2)) await dire(JUSTES[r]);
  await raccrocher();
  const A = (await appelsQuai())[0];
  egal(A.pas.map((p) => p.v), ['salut', 'inverse', 'mardi', 'porteur', 'oui', 'merci'], 'premières réponses rangées');
  egal(A.reprises, 2, 'reprises');
  vrai(!(await present('[data-dlg-appeler="quai"]')), 'on peut rappeler en évaluation');
  egal(await pg.textContent(`${Z} [data-fin-seance]`), '', 'un bandeau de fin en évaluation');
  egal(await pg.evaluate(() => window.__d.enregistres.length), 0, 'une note remonte pendant le travail');
  const n = await note();
  egal([n.score, n.detail['appel-quai'], n.detail['numero-quai']], [10, 'ok', 'ko'], 'note de la copie');
});

await v('Téléphone (lot 3) : copie rendue — rien ne s’écrit plus, l’appel se relit (« Relire l’appel » passe le verrou)', async () => {
  await monter({ copie: true });
  await aller('telephone');
  // En évaluation, une maladresse fait avancer : « place » est LA réponse à l'accueil.
  await appeler();
  await dire('place');
  for (const r of ORDRE.slice(1)) await dire(JUSTES[r]);
  await raccrocher();
  await appeler('thomas');
  await pg.click(`${Z} [data-dlg-raccrocher-leurre]`);
  await pause();
  await pg.waitForSelector(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForSelector(`${Z} [data-copie-avis]`);
  const avant = JSON.stringify(await base());
  await aller('telephone');
  egal(await pg.$$eval(`${Z} [data-dlg-appeler], ${Z} [data-dlg-choix], ${Z} [data-dlg-raccrocher]`, (L) => L.length), 0, 'un bouton de travail reste');
  vrai(await pg.$eval(`${Z} [data-dlg-journal="quai"]`, (b) => !b.disabled), '« Relire l’appel » est désactivé');
  await pg.click(`${Z} [data-dlg-journal="quai"]`);
  await pause();
  vrai(/Bonne journée, Lea !/.test(await fil()), 'le journal ne se relit pas');
  vrai(/De la place pour quoi/.test(await fil()) === false, 'une réaction s’affiche au journal d’une évaluation');
  egal(JSON.stringify(await base()), avant, 'la base a changé après la remise');
});

/* ================================================================ LE FACE À FACE (`face: true`, 17/10/2026, ENT-8.7) */
// Les mots du moteur qui diraient « téléphone » : on les cherche dans tout ce que la vue écrit SAUF ce que déclare la séance
// (bulles, textes des réponses), attributs `aria-label` / `title` compris.
const MOTS_TEL = /appel|appeler|raccroch|num[ée]ro|📞|t[ée]l[ée]phon|communication|contact/i;
// (la regexp passe par une chaîne : `pg.evaluate` ne transporte pas un objet RegExp)
const MOTS = MOTS_TEL.source;
const motsDeTelOk = () => pg.evaluate(({ Z, MOTS }) => {
  const copie = document.querySelector(`${Z} .dlg`).cloneNode(true);
  copie.querySelectorAll('.dlg-bulle, .dlg-choix-txt').forEach((x) => x.remove());
  const attrs = [...copie.querySelectorAll('[aria-label],[title]')].map((x) => `${x.getAttribute('aria-label') || ''} ${x.getAttribute('title') || ''}`).join(' ');
  return `${copie.textContent} ${attrs}`.match(new RegExp(MOTS, 'gi')) || [];
}, { Z, MOTS });
const texte = (sel) => pg.$eval(`${Z} ${sel}`, (e) => e.textContent.trim().replace(/\s+/g, ' '));

await v('Face à face : les mots de l’écran sont « Aller le voir », « Terminer », « En face à face », « Terminé à … », « Personnes » ; aucun mot de téléphone (ni 📞) nulle part, à aucun moment', async () => {
  await monter({ face: true, sansSituation: true });
  egal(await pg.$eval(`${Z} .ent-nav[data-vue="telephone"]`, (b) => b.firstElementChild.textContent), 'Au quai', 'libellé du menu');
  await aller('telephone');
  egal(await texte('.dlg-h'), 'Personnes', 'titre de la liste');
  egal(await texte('.dlg-repos'), 'Choisis qui aller voir.', 'situation par défaut');
  egal(await texte('[data-dlg-appeler="quai"]'), 'Aller le voir', 'bouton avant l’entretien');
  egal(await motsDeTelOk(), [], 'mot de téléphone avant l’entretien');
  await appeler();
  egal(await texte('.dlg-contact .dlg-etat'), 'En face à face', 'état dans la liste');
  egal(await texte('.dlg-statut'), 'En face à face', 'statut en haut de l’entretien');
  egal(await pg.getAttribute(`${Z} .dlg-appel`, 'aria-label'), 'Entretien : Marc — chauffeur', 'aria-label');
  egal(await motsDeTelOk(), [], 'mot de téléphone pendant l’entretien');
  for (const r of ORDRE) await dire(JUSTES[r]);
  egal(await texte('[data-dlg-raccrocher]'), 'Terminer', 'bouton de fin');
  egal(await motsDeTelOk(), [], 'mot de téléphone au bouton de fin');
  await raccrocher();
  vrai(/^Terminé à \d\d:\d\d$/.test(await texte('.dlg-statut')), `statut de fin : ${await texte('.dlg-statut')}`);
  egal(await texte('.dlg-contact .dlg-etat'), 'Terminé', 'état dans la liste après l’entretien');
  egal(await texte('[data-dlg-journal="quai"]'), 'Relire', 'bouton pour relire');
  egal(await pg.getAttribute(`${Z} .dlg-appel`, 'aria-label'), 'Entretien : Marc — chauffeur', 'aria-label après l’entretien');
  egal(await motsDeTelOk(), [], 'mot de téléphone après l’entretien');
  // La phrase de la séance, quand elle en déclare une, passe avant la phrase par défaut.
  await monter({ face: true });
  await aller('telephone');
  egal(await texte('.dlg-repos'), 'Accueille le chauffeur sur le quai.', 'situation déclarée');
});

await v('Face à face : tout le reste marche pareil — réaction, réplique reposée, `premiereReponse`, `dialogueFini`, gestes, note, « Corriger » → « Revenir le voir » ouvre un nouvel entretien', async () => {
  // Le même parcours (une erreur à « refs », puis tout juste), avec et sans `face` : mêmes pas, mêmes reprises, mêmes gestes, même note.
  const jouer = async (o) => {
    await monter({ ...o, correction: true });
    await aller('telephone');
    await appeler();
    await dire('presente');
    await dire('inverse');
    const f1 = await fil();
    const reposee = (await choixAffiches()).sort();
    await dire('juste');
    for (const r of ORDRE.slice(2)) await dire(JUSTES[r]);
    const fermeAvant = await present('.ent-nav-ferme[data-vue-fermee="stock"]');
    await raccrocher();
    const A = (await appelsQuai())[0], n = await note();
    return {
      reaction: /Je ne le trouve pas/.test(f1), reposee, fermeAvant, fermeApres: await present('.ent-nav-ferme[data-vue-fermee="stock"]'),
      pas: A.pas.map((p) => `${p.r}:${p.v}`), reprises: A.reprises, fin: !!A.fin, ordres: A.ordres,
      gestes: Object.keys((await base()).gestes[SEANCE]).sort(), score: n.score, detail: [n.detail['appel-quai'], n.detail['numero-quai']],
      journal: n.detail.dialogues,
      premiere: await pg.evaluate(async ({ A }) => { const { premiereReponse } = await import('/core/types/dialogue.js'); return premiereReponse(A, 'refs'); }, { A }),
      bonjour: /Bonne journée, Lea !/.test(await fil()),
    };
  };
  const face = await jouer({ face: true });
  const tel = await jouer({});
  egal(face, tel, 'le parcours en face à face ne joue pas comme le téléphone');
  // …et ce parcours est bien celui qu'on croit (valeurs écrites à la main).
  egal([face.reaction, face.reposee, face.fermeAvant, face.fermeApres], [true, ['bientot', 'inverse', 'juste', 'produit'], true, false], 'réaction, réplique reposée, Stock');
  egal([face.pas.length, face.reprises, face.fin, face.premiere, face.bonjour], [7, 1, true, 'inverse', true], 'appel rangé');
  egal([face.score, face.detail], [10, ['ok', 'ko']], 'note');
  egal(face.gestes, ['dialogue:quai:accueil', 'dialogue:quai:appeler', 'dialogue:quai:cloture', 'dialogue:quai:confirme', 'dialogue:quai:fin', 'dialogue:quai:jour',
    'dialogue:quai:refs', 'dialogue:quai:vehicule'], 'gestes');
  // « Corriger » → « Revenir le voir » → un nouvel entretien (le premier reste rangé).
  await monter({ face: true, correction: true });
  await aller('telephone');
  await appelComplet({ refs: ['inverse'] });
  await aller('accueil');
  await pg.click(`${Z} [data-fin-corriger]`);
  await pause();
  vrai(await present('.ent-nav.on[data-vue="telephone"]'), '« Corriger » n’ouvre pas l’écran');
  egal(await texte('[data-dlg-appeler="quai"]'), 'Revenir le voir', 'le bouton du rappel');
  egal(await motsDeTelOk(), [], 'mot de téléphone au rappel');
  await pg.click(`${Z} [data-dlg-appeler="quai"]`);
  await pause();
  egal((await appelsQuai()).length, 2, 'le rappel n’ouvre pas un nouvel entretien');
  egal(await texte('.dlg-statut'), 'En face à face', 'le nouvel entretien n’est pas en cours');
  for (const r of ORDRE) await dire(JUSTES[r]);
  await raccrocher();
  egal([(await note()).detail['numero-quai'], (await appelsQuai())[1].reprises], ['ok', 0], 'le jalon ne lit pas le nouvel entretien');
});

await v('Face à face : sans `face`, les mots du téléphone sont toujours là (menu, titre, boutons, états, statuts, aria-label) — ce qui RESTE', async () => {
  await monter({ correction: true });
  egal(await pg.$eval(`${Z} .ent-nav[data-vue="telephone"]`, (b) => b.firstElementChild.textContent), 'Téléphone', 'libellé du menu');
  await aller('telephone');
  egal(await texte('.dlg-h'), 'Contacts', 'titre de la liste');
  egal(await texte('[data-dlg-appeler="quai"]'), '📞 Appeler', 'bouton avant l’appel');
  await appeler();
  egal(await texte('.dlg-contact .dlg-etat'), 'Appel en cours', 'état dans la liste');
  egal(await texte('.dlg-statut'), 'En communication', 'statut en haut de l’appel');
  egal(await pg.getAttribute(`${Z} .dlg-appel`, 'aria-label'), 'Appel : Quai de réception', 'aria-label');
  for (const r of ORDRE) await dire(JUSTES[r]);
  egal(await texte('[data-dlg-raccrocher]'), 'Raccrocher', 'bouton de fin');
  await raccrocher();
  vrai(/^Appel terminé à \d\d:\d\d$/.test(await texte('.dlg-statut')), `statut de fin : ${await texte('.dlg-statut')}`);
  egal(await texte('.dlg-contact .dlg-etat'), 'Appel terminé', 'état dans la liste après l’appel');
  egal(await texte('[data-dlg-journal="quai"]'), 'Relire l’appel', 'bouton pour relire');
  // Le rappel (correction après un premier bilan faux).
  await monter({ correction: true });
  await aller('telephone');
  await appelComplet({ refs: ['inverse'] });
  await aller('accueil');
  await pg.click(`${Z} [data-fin-corriger]`);
  await pause();
  egal(await texte('[data-dlg-appeler="quai"]'), '📞 Rappeler', 'le bouton du rappel');
  // Le contact sans dialogue garde sa messagerie vocale et son « Raccrocher ».
  await monter();
  await aller('telephone');
  await appeler('thomas');
  vrai(/Messagerie vocale/.test(await texte('.dlg-statut')) && /Raccrocher/.test(await texte('[data-dlg-raccrocher-leurre]')), 'la messagerie vocale a changé');
});

await v('Face à face : la table des textes, en direct — phrase par défaut, liste vide, « Reprendre », « Revenir le voir » / « 📞 Rappeler », avec et sans `face`', async () => {
  const R = await pg.evaluate(async () => {
    const { creerTelephone } = await import('/core/types/dialogue.js');
    const S = await import('/contenus/dialogue-essai.js');
    const D0 = S.TELEPHONE.dialogues[0];
    const autre = (id, nom, plus = {}) => ({ ...D0, id, contact: { nom }, ...plus });
    const api = (o = {}) => ({ estProf: false, db: {}, seance: 'x', graine: 'g', prenom: 'Lea', sauver() {}, signal() {}, delai: 0, ...o });
    const lire = (face, { etat = {}, dialogues, ouvrir, apiO } = {}) => {
      const T = creerTelephone({ dialogues: dialogues || [autre('quai', 'Quai'), autre('autre', 'Zoé')], ...(face ? { face: true } : {}) }, { personnes: S.EQUIPE });
      if (ouvrir) T.ouvrir(ouvrir);
      const z = document.createElement('div');
      z.innerHTML = T.html(etat, api(apiO));
      return { face: T.face, titre: z.querySelector('.dlg-h').textContent, repos: (z.querySelector('.dlg-repos') || {}).textContent || null,
        vide: (z.querySelector('.dlg-gauche > p.note') || {}).textContent || null,
        boutons: [...z.querySelectorAll('[data-dlg-appeler], [data-dlg-journal]')].map((b) => `${b.dataset.dlgAppeler || b.dataset.dlgJournal}=${b.textContent.trim()}`) };
    };
    const enCours = { quai: { appels: [{ debut: 1, ordres: {}, textes: {}, pas: [], reprises: 0 }] } };
    const fini = { quai: { appels: [{ debut: 1, fin: 2, ordres: {}, textes: {}, pas: [], reprises: 0 }] } };
    const rien = [autre('quai', 'Quai', { quand: () => false }), autre('autre', 'Zoé', { quand: () => false })];
    return [false, true].map((face) => ({
      repos: lire(face), vide: lire(face, { dialogues: rien }),
      reprendre: lire(face, { etat: enCours, ouvrir: 'autre' }).boutons,
      rappeler: lire(face, { etat: fini, apiO: { rappel: () => true } }).boutons,
      relire: lire(face, { etat: fini }).boutons,
    }));
  });
  const [tel, face] = R;
  egal([tel.repos.face, face.repos.face], [false, true], 'la vue ne dit pas son mode');
  egal([tel.repos.titre, tel.repos.repos, tel.vide.vide, tel.repos.boutons], ['Contacts', 'Choisis un numéro à appeler.', 'Aucun numéro à appeler pour l’instant.', ['quai=📞 Appeler', 'autre=📞 Appeler']], 'téléphone');
  egal([face.repos.titre, face.repos.repos, face.vide.vide, face.repos.boutons], ['Personnes', 'Choisis qui aller voir.', 'Personne à voir pour l’instant.', ['quai=Aller le voir', 'autre=Aller le voir']], 'face à face');
  egal([tel.reprendre, tel.rappeler, tel.relire], [['quai=Reprendre l’appel'], ['quai=📞 Rappeler', 'autre=📞 Appeler'], ['quai=Relire l’appel', 'autre=📞 Appeler']], 'téléphone : reprendre, rappeler, relire');
  egal([face.reprendre, face.rappeler, face.relire], [['quai=Reprendre'], ['quai=Revenir le voir', 'autre=Aller le voir'], ['quai=Relire', 'autre=Aller le voir']], 'face à face : reprendre, rappeler, relire');
});

await v('Face à face : `face` avec des leurres (messagerie vocale) est refusé à la compilation, avec un message lisible ; `face` n’est pas un booléen aussi', async () => {
  const R = await pg.evaluate(async () => {
    const { creerTelephone } = await import('/core/types/dialogue.js');
    const S = await import('/contenus/dialogue-essai.js');
    const essayer = (T) => { try { creerTelephone(T, { personnes: S.EQUIPE }); return 'accepté'; } catch (e) { return e.message; } };
    return {
      leurres: essayer({ ...S.TELEPHONE, face: true }),
      vides: essayer({ ...S.TELEPHONE, leurres: [], face: true }),
      sansFace: essayer({ ...S.TELEPHONE }),
      faceFaux: essayer({ ...S.TELEPHONE, face: false }),
      texte: essayer({ ...S.TELEPHONE, face: 'oui', leurres: [] }),
    };
  });
  vrai(/^telephone : face à face : pas de leurres \(messagerie vocale\)$/.test(R.leurres), `face + leurres : ${R.leurres}`);
  egal([R.vides, R.sansFace, R.faceFaux], ['accepté', 'accepté', 'accepté'], 'face + liste vide, leurres sans face, face: false');
  vrai(/`face` vaut true ou false/.test(R.texte), `face: 'oui' : ${R.texte}`);
  // Par la séance (le moteur remonte le même message à l'ouverture).
  vrai(/face à face : pas de leurres \(messagerie vocale\)/.test(await monter({ faute: 'faceLeurres' })), 'le moteur n’a pas refusé');
  vrai(/`face` vaut true ou false/.test(await monter({ faute: 'faceType' })), 'le moteur n’a pas refusé un `face` qui n’est pas un booléen');
  egal(await monter({ face: true }), 'ok', 'la déclaration en face à face est refusée');
});

await v('Téléphone : aucune erreur de page pendant le bloc', async () => {
  egal(erreursD, [], 'erreurs');
});

await ctxD.close();
}
