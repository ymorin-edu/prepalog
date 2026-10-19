// Suite de tests de Prepalog — bloc « pelleau-101 » : Transports Pelleau ENT-10.1, de Plabennec à l’entrepôt neuf (CAP OL, guidage CAP-C1.1).
// `node outils/test.mjs pelleau-101` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides
// communes : `outils/test/pelleau/commun.mjs`. Brief : `docs/briefs/ENT-10.1-pelleau-se-situer.md` §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-se-situer.js` → `rendre`),
// de vrais clics à la SOURIS ; les listes des fiches par `selectOption`. Les GRAINES sont choisies ici (l’identifiant de l’élève) ; les valeurs
// attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le tirage le 19/10/2026), jamais recalculées par le code de la séance :
//
//   p101-juste (standard) : tâches t-chariot (Yann), t-planning (Maëlys), t-decider (Erwan) ; étapes au départ e1989, e2013, e2026, e1930
//     (ordre juste e1930, e1989, e2013, e2026) ; travaux m-concession (véhicules), m-racks (stocker), m-plants (marchandises) ; situations
//     s-engin (« blesse »), s-adresse (« retrouve »).
//   p101-juste (confirmé, même graine : le socle d’un confirmé n’est pas celui d’un standard, les cas bonus consomment le hasard) : tâches
//     t-decider, t-chariot, t-planning + t-ouvrir (Yann) ; étapes e1993, e2026, e1930, e1989 ; travaux m-accidente, m-rungis, m-racks
//     + m-preparer (stocker) ; situations s-engin, s-adresse + s-signaler (« preuve »).
//   p101-faux (standard) : t-planning, t-decider, t-chariot ; étapes e1989, e1945, e2026, e2013 ; travaux m-concession, m-racks, m-plants ;
//     situations s-engin, s-signaler.
//
// Barème (brief §5, poids validés par Tristan le 18/10/2026 à 22 h 03) : Qui est qui ? 3 (1 × 3) · La carte 6 (1 × 6) · L’histoire de Pelleau 3
// (0,75 × 4) · Ce que fait Pelleau 2 (2/3 × 3) · Ce que je change 2 (1 × 2) · Les questions d’Erwan 4 (A 1 · B 1,5 · D 1,5).

import { ouvrirPelleau, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-se-situer';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-se-situer.js', id: ID });
const { pg, Z, R, pause, base, note, present, texte, bandeau, entrants, menu, clic, aller, qFil, lire, carteJuste, jouerCarte,
  ouvrirParMessage, remplirEnvoyer, ordonnerEnvoyer } = P;
const CAPTURES = process.env.CAPTURES_ENT101 || '';
const capture = async (nom) => { if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/${nom}.png` }); };

const OUV_JUSTES = { transporteur: 'deplace', entreposeur: 'garde', ramasse: 'tournee', tuteur: 'suit', ambiant: 'sans-froid', rack: 'rayonnage',
  'img-racks': 'stocke', 'img-semi': 'semi', 'img-chariot': 'chariot' };
const OUV_FAUSSES = { transporteur: 'vend', entreposeur: 'fabrique', ramasse: 'inventaire', tuteur: 'paie', ambiant: 'parking', rack: 'camion',
  'img-racks': 'gare', 'img-semi': 'tracteur', 'img-chariot': 'transpalette' };
const monter = (o = {}) => P.monter({ rep: OUV_JUSTES, ...o });
const Q_JUSTES = { rungis: '6h', 'pourquoi-stocker': 'garder', 'qui-paie-garde': 'pelleau', fierte: 'gestes' };
const Q_FAUSSES = { rungis: 'midi', 'pourquoi-stocker': 'loi', 'qui-paie-garde': 'personne', fierte: 'pas-pense' };

const champ = (pre) => (i) => `${pre}-${i + 1}`;
// Les réponses justes de p101-juste (standard), écrites à la main (voir l’en-tête).
const JUSTE = { qui: ['yann', 'maelys', 'erwan'], ordre: ['e1930', 'e1989', 'e2013', 'e2026'], metiers: ['vehicules', 'stocker', 'marchandises'],
  changer: ['blesse', 'retrouve'] };
// Le parcours entier. `o` : { qui, carte (fautes), ordre (null : rien touché), metiers, changer, q (réponses des questions au fil) }.
async function jouer(o = {}) {
  const Q = { ...Q_JUSTES, ...(o.q || {}) };
  await aller('fiche');
  await remplirEnvoyer(champ('tache'), o.qui || JUSTE.qui, Q);
  await jouerCarte(o.carte || {}, Q);
  await ouvrirParMessage('L’histoire de Pelleau', 'fiche:histoire');
  await ordonnerEnvoyer('ordre', o.ordre === undefined ? JUSTE.ordre : o.ordre, Q);
  await ouvrirParMessage('Ce que fait Pelleau', 'fiche:metiers');
  await remplirEnvoyer(champ('travail'), o.metiers || JUSTE.metiers, Q);
  await ouvrirParMessage('Ce que je change', 'fiche:changer');
  await remplirEnvoyer(champ('situation'), o.changer || JUSTE.changer, Q);
  await qFil(Q);
}
const LIGNES = ['qui-1', 'localiser:entrepot:region', 'histoire-1', 'metiers-1', 'changer-1', 'question:rungis'];
const tout = (etat) => LIGNES.map((l) => [l, etat]);
const sauf = (ligne, etat = 'ko') => LIGNES.map((l) => [l, l === ligne ? etat : 'ok']);
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;

// ─────────────────────────────────────────────────────────── la déclaration et le registre
await v('ENT-10.1 : la séance se charge (CAP, CAP-C1.1, guidage, correction, bilan détaillé, parcours sans précédente) ; poids 16 + part 4 = 20 ; au registre sous l’entreprise n° 10 (logo servi) ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-se-situer.js');
    const S = await import('/contenus/pelleau-ent101.js');
    const Q = await import('/contenus/questions/ENT-10.1.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const socle = S.ETAPES.filter((e) => !e.bonus);
    const charges = await I.chargerActivites();
    const ent = I.ENTREPRISES.find((e) => e.n === 10);
    const logo = await fetch(ent.logo).then((x) => x.status);
    const m = A.meta;
    return { meta: m, poids: socle.reduce((s, e) => s + e.poids, 0), n: socle.length, bonus: S.ETAPES.filter((e) => e.bonus).map((e) => e.id),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids]),
      groupes: [...new Set(socle.map((e) => e.groupe))], auRegistre: charges.some((a) => a.meta.id === ID),
      echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /pelleau/.test(f)),
      ent: [ent.nom, ent.metier, ent.logo], logo,
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }),
      raison: N.raisonCachee(m, { niveau: 'cap' }), autreNiveau: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  egal([r.meta.code, r.meta.niveaux, r.meta.competences, r.meta.competencesCap, r.meta.temps, r.meta.bareme, r.meta.correction, r.meta.bilanDetail,
    r.meta.parcours, r.meta.precedente, r.meta.niveauxPrevus, r.meta.questions, r.meta.pret, r.meta.ouverture, r.meta.corrige],
  ['ENT-10.1', ['cap'], [], ['CAP-C1.1'], 'guidage', 20, true, true, true, undefined, ['confirme', 'accompagne'], 'ENT-10.1', true, 'prof',
    './contenus/corriges/ENT-10.1.js'], 'meta');
  proche(r.poids, 16, 'somme des poids des jalons');
  egal([r.n, r.part, r.notees], [18, 4, [['rungis', 1], ['pourquoi-stocker', 1.5], ['qui-paie-garde', 1.5]]], 'jalons, part, questions notées');
  egal(r.groupes, ['Qui est qui ?', 'La carte', 'L’histoire de Pelleau', 'Ce que fait Pelleau', 'Ce que je change'], 'lignes du bandeau (hors questions)');
  egal(r.bonus, ['localiser:saint-pol:region', 'localiser:saint-pol:departement', 'qui-bonus', 'metiers-bonus', 'changer-bonus'], 'cas bonus');
  egal([r.auRegistre, r.echecs], [true, []], 'au registre, sans échec de chargement');
  egal([r.ent, r.logo], [['Transports Pelleau', 'Transporteur devenu entreposeur — entrepôt neuf de Gouesnou', './contenus/trames/logos/pelleau.png'], 200], 'ligne ENTREPRISES');
  egal([r.cap, r.raison, r.coche, r.autreNiveau], [false, 'pas encore ouverte à ce groupe', true, false], 'visibilité : fermée, puis ouverte par l’enseignant');
});

await v('ENT-10.1 : à l’ouverture, le tirage est rangé (graine élève|séance) ; un seul message d’Erwan, daté du 4 mai 2026 à 8 h, sans jour de la semaine, document joint ; la carte fermée, les fiches suivantes absentes ; rien dans la page ne trahit une réponse', async () => {
  const db = await monter({ uid: 'p101-juste' });
  egal(db.tirages[ID].graine, `p101-juste|${ID}`, 'graine');
  egal(db.tirages[ID].pieces, { taches: ['t-chariot', 't-planning', 't-decider'], etapes: ['e1989', 'e2013', 'e2026', 'e1930'],
    travaux: ['m-concession', 'm-racks', 'm-plants'], situations: ['s-engin', 's-adresse'] }, 'pièces');
  await capture('1-accueil');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces, m.ouvreFiche]), [['Erwan', 'Bienvenue chez Pelleau', ['equipe'], 'qui-est-qui']], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 4, 4, 8], 'date du message');
  vrai(!JOURS.test(E[0].text + E[0].subject), 'un jour de la semaine dans le message');
  const M = await menu();
  vrai(M.includes('fermee:localiser') && !M.some((x) => /fiche:(histoire|metiers|changer)/.test(x)), 'menu au départ : ' + M.join(', '));
  await aller('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="tache-"]`, (L) => L.map((x) => x.closest('.champ').querySelector('label').textContent.trim())),
    ['Ranger une palette en haut du rack au chariot.', 'Organiser l’heure de retour des camions.', 'Décider ce qu’on fait d’une palette abîmée.'], 'lignes de la fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ="tache-1"] option`, (L) => L.map((x) => x.value).filter(Boolean)), ['erwan', 'yann', 'loic', 'maelys'], 'les 4 personnes');
  const html = await pg.evaluate((Z) => document.querySelector(`${Z} [data-fiche]`).outerHTML, Z);
  vrai(!/t-(chariot|planning|decider|tournee)|difficile|facile/.test(html), 'un id ou une difficulté de pièce dans la fiche');
  vrai(!/\b(3|trois|4|quatre) (tâches|lignes|étapes|travaux|situations)\b/i.test(await texte()), 'une consigne compte les pièces');
  await capture('2-fiche-qui-est-qui');
});

await v('ENT-10.1 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau de fin', async () => {
  await monter({ uid: 'p101-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
});

await v('ENT-10.1 : parcours juste (ouverture toute fausse) — 20/20, bandeau 6 lignes ✓, messages d’Erwan dans l’ordre sans jour de la semaine, « Le droit » joint à l’étape 5, A posée au département de Rungis, C rangée non notée, séance finie (ENT-10.2 ouverte)', async () => {
  await monter({ uid: 'p101-juste', rep: OUV_FAUSSES });
  let aAvant = null;
  await aller('fiche');
  await remplirEnvoyer(champ('tache'), JUSTE.qui, Q_JUSTES);
  vrai((await menu()).includes('localiser'), 'la carte reste fermée après « Qui est qui ? »');
  await jouerCarte({}, Q_JUSTES, { avant: async (x) => {
    const q = ((await base()).questions[ID] || {}).rungis;
    if (x.lieu === 'rungis' && x.etape === 'departement') vrai(!q, 'A est arrivée avant le département de Rungis');
    if (x.lieu === 'rungis' && x.etape === 'ville') aAvant = !!(q && q.arrivee);
  } });
  egal(aAvant, true, 'A est arrivée au département de Rungis');
  await pg.evaluate(() => window.scrollTo(0, 0));
  await capture('3-carte-fin');
  vrai(/imaginés pour l’exercice/.test(await pg.textContent(`${R} [data-lc-fin]`)), 'texte de fin : le construit est dit');
  await ouvrirParMessage('L’histoire de Pelleau', 'fiche:histoire');
  await ordonnerEnvoyer('ordre', JUSTE.ordre, Q_JUSTES);
  await ouvrirParMessage('Ce que fait Pelleau', 'fiche:metiers');
  await remplirEnvoyer(champ('travail'), JUSTE.metiers, Q_JUSTES);
  await ouvrirParMessage('Ce que je change', 'fiche:changer');
  await capture('3b-fiche-ce-que-je-change');
  await remplirEnvoyer(champ('situation'), JUSTE.changer, Q_JUSTES);
  await qFil(Q_JUSTES);
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(await bandeau(), tout('ok'), 'bandeau');
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Bienvenue chez Pelleau', 'La carte', 'L’histoire de Pelleau', 'Ce que fait Pelleau', 'Ce que je change', 'À demain'], 'messages');
  egal(E.map((m) => m.pieces || []), [['equipe'], [], ['pelleau'], [], ['droit-depot'], []], 'pièces jointes');
  vrai(!E.some((m) => JOURS.test(`${m.subject} ${m.text}`)), 'un jour de la semaine dans un message');
  vrai(E.every((m) => new Date(m.ts).getDate() === 4 && new Date(m.ts).getMonth() === 4), 'un message hors du 4 mai');
  vrai(/chaussures de sécurité/.test(E.pop().text), 'amorce d’ENT-10.2');
  const b = await base();
  vrai(!!b.points[ID], 'photo de fin (ENT-10.2 ouverte sans l’enseignant)');
  egal([b.questions[ID].fierte.premiere, Object.keys(n.detail).filter((k) => /fierte/.test(k))], ['gestes', []], 'C : rangée, non notée');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
  await pg.evaluate(() => window.scrollTo(0, 0));
  await capture('4-bilan-juste');
});

await v('ENT-10.1 : pire cas — tout faux (fiches, carte au premier essai, questions) → premier bilan, 0/20, 6 lignes ✗, ENT-10.2 ouverte sans l’enseignant ; « Corriger » proposé, `finFige` dit que la carte ne se rejoue pas', async () => {
  await monter({ uid: 'p101-faux' });
  const fautes = Object.fromEntries(['entrepot', 'berceau', 'rungis'].flatMap((l) => [[`${l}:region`, 1], [`${l}:departement`, 1]]));
  // p101-faux : départ e1989, e1945, e2026, e2013 (juste e1945, e1989, e2013, e2026) ; l’ordre envoyé ne place aucune étape.
  await jouer({ qui: ['loic', 'loic', 'loic'], carte: fautes, ordre: ['e2026', 'e2013', 'e1945', 'e1989'], metiers: ['stocker', 'marchandises', 'vehicules'],
    changer: ['stock', 'repare'], q: Q_FAUSSES });
  const n = await note();
  egal(n.score, 0, 'note');
  egal(await bandeau(), tout('ko'), 'bandeau');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  vrai(/ne se rejoue pas/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
  vrai(!!(await base()).points[ID], 'photo de fin : ENT-10.2 s’ouvrirait sans l’enseignant');
  await pg.evaluate(() => window.scrollTo(0, 0));
  await capture('5-bilan-pire-cas');
});

await v('ENT-10.1 : « Qui est qui ? » — une tâche fausse → bloc 1 ✗ seul (19/20) ; « Corriger » rouvre cette fiche, pas la carte ; renvoi juste → accusé d’Erwan, note moyennée 19,5', async () => {
  await monter({ uid: 'p101-juste' });
  await jouer({ qui: ['yann', 'erwan', 'erwan'] });
  egal(await bandeau(), sauf('qui-1'), 'bandeau');
  proche((await note()).score, 19, 'premier bilan');
  const carteAvant = JSON.stringify((await base()).localiser);
  await clic('[data-fin-corriger]');
  await pause();
  const b = await base();
  egal([!!b.fiches['qui-est-qui'].envoye, !!b.fiches.histoire.envoye, !!b.fiches.metiers.envoye, !!b.fiches.changer.envoye], [false, true, true, true], 'fiches rouvertes');
  egal(JSON.stringify(b.localiser), carteAvant, 'la carte a bougé');
  vrai(await present('[data-fiche="qui-est-qui"] [data-fiche-envoyer]'), 'la fiche n’est pas rouverte à l’écran');
  const avant = (await entrants()).length;
  await pg.selectOption(`${Z} [data-fiche-champ="tache-2"]`, 'maelys');
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  egal((await entrants()).slice(avant).map((m) => [m.from, m.subject, m.text]), [['Erwan', 'RE : Qui est qui ?', 'Merci, j’ai ta nouvelle fiche.\n\nErwan']], 'accusé');
  proche((await note()).score, 19.5, 'note moyennée');
  egal(await bandeau(), tout('ok'), 'bandeau après correction');
});

await v('ENT-10.1 : « L’histoire de Pelleau » — envoyée sans toucher → les 4 étapes ✗ (17/20) ; deux étapes inversées → seules ces deux-là ✗ (18,5/20)', async () => {
  await monter({ uid: 'p101-juste' });
  await jouer({ ordre: null });
  const d = (await note()).detail;
  egal((await base()).fiches.histoire.valeurs.ordre, ['e1989', 'e2013', 'e2026', 'e1930'], 'ordre envoyé = ordre de départ');
  egal([1, 2, 3, 4].map((k) => d[`histoire-${k}`]), ['ko', 'ko', 'ko', 'ko'], 'jalons sans rien toucher');
  proche((await note()).score, 17, 'note sans rien toucher');
  await monter({ uid: 'p101-juste' });
  await jouer({ ordre: ['e1989', 'e1930', 'e2013', 'e2026'] });
  const d2 = (await note()).detail;
  egal([1, 2, 3, 4].map((k) => d2[`histoire-${k}`]), ['ko', 'ko', 'ok', 'ok'], 'jalons, 1930 et 1989 inversées');
  proche((await note()).score, 18.5, 'note');
});

await v('ENT-10.1 : bilan détaillé (CAP) — la tâche fausse et l’étape mal placée nommées comme sur la fiche ; « Corriger dans « L’histoire de Pelleau » » ouvre cette fiche ; liste « À corriger »', async () => {
  await monter({ uid: 'p101-juste' });
  await jouer({ qui: ['yann', 'erwan', 'erwan'], ordre: ['e1989', 'e1930', 'e2013', 'e2026'] });
  const L = await pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.children[1].textContent.trim(), l.dataset.finCaseEtat, l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
  egal(L.filter(([, e]) => e === 'ko'), [
    ['Qui est qui ? : « Organiser l’heure de retour des camions. »', 'ko', 'fiche:qui-est-qui'],
    ['L’histoire de Pelleau : « La création à Plabennec : bétail et matériaux de construction »', 'ko', 'fiche:histoire'],
    ['L’histoire de Pelleau : « Les plants de pommes de terre pour Germicopa »', 'ko', 'fiche:histoire'],
  ], 'lignes fausses');
  vrai(!L.some(([t]) => /Yann|Maëlys|Erwan|1930|1989/.test(t)), 'une ligne du bilan donne la réponse');
  await pg.evaluate(() => window.scrollTo(0, 0));
  await capture('6-bilan-detaille');
  await clic('[data-fin-aller="fiche:histoire"]');
  await pause();
  vrai(await present('[data-fiche="histoire"] [data-fiche-envoyer]'), 'la fiche « L’histoire de Pelleau » est ouverte');
  egal(await pg.$$eval(`${Z} [data-acorriger] [data-acorr]`, (L) => L.map((l) => l.dataset.acorr)), ['fiche:qui-est-qui', 'fiche:histoire'], 'liste « À corriger »');
});

await v('ENT-10.1 : carte — une erreur à la région de Rungis → bloc « La carte » ✗ seul (19/20) ; erreurs à la ville seulement → bloc ✓ (20/20)', async () => {
  await monter({ uid: 'p101-juste' });
  await jouer({ carte: { 'rungis:region': 1 } });
  egal(await bandeau(), sauf('localiser:entrepot:region'), 'bandeau (région de Rungis)');
  proche((await note()).score, 19, 'note');
  const d = (await note()).detail;
  egal(['entrepot', 'berceau', 'rungis'].flatMap((l) => ['region', 'departement'].map((e) => d[`localiser:${l}:${e}`])), ['ok', 'ok', 'ok', 'ok', 'ko', 'ok'], 'jalons de la carte');
  await monter({ uid: 'p101-juste' });
  await jouer({ carte: { 'entrepot:ville': 2, 'rungis:ville': 1 } });
  egal([await bandeau(), (await note()).score], [tout('ok'), 20], 'erreurs à la ville seulement');
});

await v('ENT-10.1 : questions — D au premier choix de « Ce que je change » (« Merci, je note », pas de ✓ / ✗ ; « Le droit » à gauche), B corrigée tout de suite ; D fausse → 18,5/20, ligne des questions ✗ seule, retour de D avec le bandeau', async () => {
  await monter({ uid: 'p101-juste' });
  await aller('fiche');
  await remplirEnvoyer(champ('tache'), JUSTE.qui, Q_JUSTES);
  await jouerCarte({}, Q_JUSTES);
  await ouvrirParMessage('L’histoire de Pelleau', 'fiche:histoire');
  await ordonnerEnvoyer('ordre', JUSTE.ordre, Q_JUSTES);
  await ouvrirParMessage('Ce que fait Pelleau', 'fiche:metiers');
  for (const [i, x] of JUSTE.metiers.entries()) await pg.selectOption(`${Z} [data-fiche-champ="travail-${i + 1}"]`, x);
  await clic('[data-fiche-envoyer]');
  await clic('[data-confirme-oui]');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'pourquoi-stocker', 'B à l’envoi de « Ce que fait Pelleau »');
  await clic('[data-q-choix="garder"][data-q="pourquoi-stocker"]');
  await clic('[data-q-repondre="pourquoi-stocker"]');
  await pause();
  vrai(await present('[data-q-verdict]'), 'B : pas de verdict tout de suite');
  await clic('[data-q-reprendre]');
  await pause();
  await ouvrirParMessage('Ce que je change', 'fiche:changer');
  vrai(/Code civil, article 1927/.test(await texte()), '« Le droit » n’est pas à gauche de la fiche');
  vrai(!(await present('[data-q-panneau]')), 'D arrive avant le premier choix');
  await pg.selectOption(`${Z} [data-fiche-champ="situation-1"]`, 'blesse');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'qui-paie-garde', 'D au premier choix');
  await clic('[data-q-choix="client"][data-q="qui-paie-garde"]');
  await clic('[data-q-repondre="qui-paie-garde"]');
  await pause();
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'D : « Merci, je note » sans verdict');
  await clic('[data-q-reprendre]');
  await pause();
  await remplirEnvoyer(champ('situation'), JUSTE.changer, Q_JUSTES);
  const d = (await note()).detail;
  egal([d['question:rungis'], d['question:pourquoi-stocker'], d['question:qui-paie-garde']], ['ok', 'ok', 'ko'], 'questions notées');
  proche((await note()).score, 18.5, 'note');
  egal(await bandeau(), sauf('question:rungis'), 'bandeau');
  vrai(await present('[data-fin-retour="qui-paie-garde"]'), 'le retour de D vient avec le bandeau');
});

await v('ENT-10.1 : tirage stable — mêmes pièces après rechargement et sur un autre poste ; deux voisins n’ont pas le même jeu', async () => {
  const a = await monter({ uid: 'p101-juste' });
  const b = await monter({ uid: 'p101-juste', db: a });
  egal(b.tirages[ID], a.tirages[ID], 'tirage après rechargement');
  const c = await monter({ uid: 'p101-juste' });
  egal(c.tirages[ID].pieces, a.tirages[ID].pieces, 'tirage sur un autre poste');
  const d = await monter({ uid: 'p101-faux' });
  vrai(JSON.stringify(d.tirages[ID].pieces) !== JSON.stringify(a.tirages[ID].pieces), 'même jeu que le voisin');
});

await v('ENT-10.1 : équité sur 300 graines — 3 personnes, 3 métiers, 2026 toujours là avec une étape d’avant 1960, départ sans aucune étape à sa place, mélanges fixes, zéro secours ; confirmé : bonus 1 + 1 + 1 hors de son socle ; les règles ne sont pas décoratives', async () => {
  const r = await pg.evaluate(async (ID) => {
    const D = await import('/contenus/pelleau-ent101-donnees.js');
    const { declarerTirage } = await import('/core/tirage.js');
    const B = D.TIRAGE.decl.banques;
    const piece = (b, id) => B[b].pieces.find((p) => p.id === id);
    const dif = (b, L) => ['facile', 'moyen', 'difficile'].map((d) => L.filter((x) => piece(b, x).difficulte === d).length).join();
    const juste = (L) => L.map((x) => piece('etapes', x)).sort((a, b) => a.an - b.an).map((p) => p.id);
    const fautes = [];
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}|${ID}`, s = D.TIRAGE.tirer(g), c = D.TIRAGE.tirer(g, { confirme: true });
      for (const [nom, t] of [['standard', s], ['confirmé', c]]) {
        const P = t.pieces;
        if (t.secours) fautes.push(`${i} ${nom} secours`);
        if (new Set(P.taches.map((x) => piece('taches', x).qui)).size !== 3 || dif('taches', P.taches) !== '1,1,1') fautes.push(`${i} ${nom} tâches ${P.taches}`);
        if (new Set(P.travaux.map((x) => piece('travaux', x).metier)).size !== 3 || dif('travaux', P.travaux) !== '2,1,0') fautes.push(`${i} ${nom} travaux ${P.travaux}`);
        if (P.etapes.length !== 4 || !P.etapes.includes('e2026') || !P.etapes.some((x) => piece('etapes', x).an < 1960)) fautes.push(`${i} ${nom} étapes ${P.etapes}`);
        if (P.etapes.some((x, k) => x === juste(P.etapes)[k])) fautes.push(`${i} ${nom} départ ${P.etapes}`);
        if (P.situations.length !== 2) fautes.push(`${i} ${nom} situations ${P.situations}`);
      }
      if (s.bonus) fautes.push(`${i} bonus d’un standard`);
      const b = c.bonus || {};
      if ((b.taches || []).length !== 1 || (b.travaux || []).length !== 1 || (b.situations || []).length !== 1) fautes.push(`${i} bonus ${JSON.stringify(b)}`);
      else if (c.pieces.taches.includes(b.taches[0]) || c.pieces.situations.includes(b.situations[0]) || b.travaux[0] !== 'm-preparer') fautes.push(`${i} bonus dans le socle`);
    }
    // La même déclaration sans la règle : sur 300 graines, des départs avec une étape à sa place et des doublons passent.
    const sansRegle = declarerTirage({ banques: B });
    let place = 0, doublon = 0;
    for (let i = 0; i < 300; i++) {
      const P = sansRegle.tirer(`eleve-${i}|${ID}`).pieces;
      if (P.etapes.some((x, k) => x === juste(P.etapes)[k])) place++;
      if (new Set(P.taches.map((x) => piece('taches', x).qui)).size !== 3) doublon++;
    }
    return { fautes, place, doublon };
  }, ID);
  if (r.fautes.length) throw new Error(r.fautes.slice(0, 6).join(' / '));
  vrai(r.place > 0 && r.doublon > 0, `sans la règle, rien ne tombe sur 300 graines (place ${r.place}, doublon ${r.doublon}) : le contrôle ne prouve rien`);
});

await v('ENT-10.1 : confirmé (p101-juste) — 4 lieux, une ligne de plus par fiche, bandeau identique à un standard, mot « bonus » absent ; cas bonus faux → 20/20 (socle inchangé), cas bonus comptés au détail', async () => {
  await monter({ uid: 'p101-juste', aisance: 'confirme' });
  await aller('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="tache-"]`, (L) => L.length), 4, 'lignes de « Qui est qui ? »');
  await remplirEnvoyer(champ('tache'), ['erwan', 'yann', 'maelys', 'erwan'], Q_JUSTES);
  await aller('localiser');
  egal((await pg.textContent(`${R} [data-lc-compteur]`)).trim(), 'Lieu 1 sur 4', 'compteur de la carte');
  await jouerCarte({ 'saint-pol:region': 1, 'saint-pol:departement': 1 }, Q_JUSTES);
  await ouvrirParMessage('L’histoire de Pelleau', 'fiche:histoire');
  await ordonnerEnvoyer('ordre', ['e1930', 'e1989', 'e1993', 'e2026'], Q_JUSTES);
  await ouvrirParMessage('Ce que fait Pelleau', 'fiche:metiers');
  await remplirEnvoyer(champ('travail'), ['vehicules', 'marchandises', 'stocker', 'vehicules'], Q_JUSTES);
  await ouvrirParMessage('Ce que je change', 'fiche:changer');
  egal(await pg.$$eval(`${Z} [data-fiche-champ^="situation-"]`, (L) => L.length), 3, 'lignes de « Ce que je change »');
  await remplirEnvoyer(champ('situation'), ['blesse', 'retrouve', 'repare'], Q_JUSTES);
  await qFil(Q_JUSTES);
  const n = await note();
  egal([n.score, await bandeau()], [20, tout('ok')], 'note et bandeau');
  egal([n.detail.bonus.justes, n.detail.bonus.total, n.detail.bonus.etats], [0, 5, { 'localiser:saint-pol:region': 'ko',
    'localiser:saint-pol:departement': 'ko', 'qui-bonus': 'ko', 'metiers-bonus': 'ko', 'changer-bonus': 'ko' }], 'cas bonus');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-10.1 : accompagné — la carte nomme les départements (le standard non), les fiches sont celles d’un standard (même tirage, aucun cas bonus)', async () => {
  const a = await monter({ uid: 'p101-acc', aisance: 'accompagne' });
  egal([a.aisance, a.tirages[ID].bonus, a.tirages[ID].pieces.taches], ['accompagne', undefined, ['t-decider', 't-tournee', 't-planning']], 'tirage');
  await aller('fiche');
  await remplirEnvoyer(champ('tache'), ['erwan', 'loic', 'maelys'], Q_JUSTES);
  await aller('localiser');
  await carteJuste();
  vrai(/Morbihan/.test(await pg.textContent(`${R} [data-ct-svg]`)), 'l’accompagné ne lit pas les noms des départements');
  await monter({ uid: 'p101-acc', aisance: 'standard' });
  await aller('fiche');
  await remplirEnvoyer(champ('tache'), ['erwan', 'loic', 'maelys'], Q_JUSTES);
  await aller('localiser');
  await carteJuste();
  vrai(!/Morbihan/.test(await pg.textContent(`${R} [data-ct-svg]`)), 'le standard lit les noms des départements');
});

await v('ENT-10.1 : « Avant de commencer » — 3 notions + 1 image tirées et rangées, menu fermé jusqu’aux réponses, rien n’entre dans la note', async () => {
  await monter({ uid: 'p101-ouv', sansOuverture: true });
  egal((await menu()).filter((x) => !x.startsWith('fermee:')), ['ouverture'], 'entrées ouvertes au départ');
  const T = (await base()).questions[ID]['@tirage'];
  const rub = await pg.evaluate(async (ids) => { const Q = (await import('/contenus/questions/ENT-10.1.js')).QUESTIONS; return ids.map((id) => Q.liste.find((q) => q.id === id).rubrique); }, T.ids);
  egal(rub.slice().sort(), ['image', 'preparation', 'preparation', 'preparation'], 'rubriques tirées');
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /ouverture|transporteur|img-/.test(k)), 'une question d’ouverture est notée');
});

await v('ENT-10.1 : socle — aucune adresse hors du site, aucune erreur JavaScript ; le corrigé de l’enseignant se calcule pour un élève (tâches, carte lieu par lieu, ordre de l’histoire, bonus marqués)', async () => {
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.1.js');
    const S = await import('/contenus/pelleau-ent101-donnees.js');
    const g = 'p101-juste|pelleau-se-situer';
    const base = { tirages: { 'pelleau-se-situer': { graine: g, ...S.TIRAGE.tirer(g, { confirme: true }) } } };
    const e = C.corrigeEleve(base, 'p101-juste');
    const vide = C.corrigeEleve({}, 'p101-juste');
    return { n: C.CORRIGE.items.length, items: e.items.map((x) => [x.texte, x.rep, !!x.bonus]), vide: vide.texte };
  });
  vrai(c.n >= 5, 'corrigé commun');
  vrai(c.items.some(([t, r, b]) => /Saint-Pol/.test(t) && /Finistère \(29\)/.test(r) && b), 'Saint-Pol-de-Léon marqué bonus');
  vrai(c.items.some(([t, r]) => /Rungis/.test(t) && /Île-de-France \(11\)/.test(r) && /Val-de-Marne \(94\)/.test(r)), 'Rungis lieu par lieu');
  vrai(c.items.some(([t, r]) => /ordre juste/.test(t) && r === '1930 La création à Plabennec : bétail et matériaux de construction → 1989 Les plants de pommes de terre pour Germicopa → 1993 L’entrée dans le groupe Sofipel → 2026 L’entrepôt neuf et le stockage'), 'ordre juste de l’histoire (confirmé)');
  vrai(c.items.some(([t, r, b]) => /Qui est qui \?, ligne 4/.test(t) && r === 'Yann, magasinier-cariste' && b), 'tâche bonus marquée');
  vrai(/pas encore ouvert/.test(c.vide), 'corrigé d’un élève qui n’a pas ouvert');
  egal([...P.hotes], [], 'requêtes hors du site');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

await P.fermer();
}
