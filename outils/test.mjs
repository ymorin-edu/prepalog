// Suite de tests de Prepalog — le LANCEUR.
//
//   node outils/test.mjs              toute la suite, dans l'ordre (comme avant le découpage)
//   node outils/test.mjs boost        un seul bloc (plus rapide quand on travaille sur une entreprise)
//   node outils/test.mjs boost carte  plusieurs blocs, toujours remis dans l'ordre de la suite
//   node outils/test.mjs --groupe 2   un des huit groupes de `GROUPES` (c'est ce que lance GitHub)
//
// Sur GitHub, la suite entière ne tient pas dans un seul passage : elle y tourne en huit groupes, en
// même temps, sur huit machines (trois depuis le lot 1 de MOTEUR-tests-rapides, 06/10/2026 ; quatre
// depuis le 12/10/2026 ; huit depuis le 22/10/2026 : 73 blocs, 2 317 cas, ≈ 81 min de travail, et trois
// groupes sur quatre coupés à 15 min sans qu'aucun cas n'échoue). Durée visée : ≈ 10 min par groupe.
// Le port du serveur de test se règle par `PORT_TESTS` (8099 par défaut).
//
// Jusqu'au 02/10/2026, toute la suite tenait dans ce fichier (5 743 lignes). Plusieurs
// conversations travaillent en même temps sur le dépôt et s'écrasaient dans ce fichier unique :
// il est découpé en un fichier par bloc dans `outils/test/` (chantier C, voir
// `claude/prepalog-chantiers-en-cours.md`). Chaque conversation n'écrit plus que dans le bloc de
// son entreprise ou de sa vue.
//
// Ce qui ne change pas : la commande, le bilan affiché, le code de retour (1 si un cas échoue ou
// si une erreur JavaScript est relevée), et l'ORDRE des cas (s'ajoute seulement, après
// la boucle des blocs, un dernier cas « aucune requête externe » sur tous les onglets). Un seul navigateur,
// une seule page partagée (`outils/test/commun.mjs`) : certains blocs s'appuient sur ce qu'a fait le bloc
// précédent dans cette page — Spartoo et « groupes » sur l'élève et les groupes créés par le
// socle. Lancés seuls, ils sont donc précédés de leur prérequis (`PREREQUIS`).
//
// Ajouter un bloc : créer `outils/test/<nom>.mjs` sur le modèle des autres
// (`export default async function bloc({ v, page, nav, … })`), puis l'inscrire dans `BLOCS`.

const BLOCS = ['socle', 'spartoo', 'groupes', 'dependances', 'transport', 'boost', 'quiz', 'carte', 'carte-region', 'inventaire',
  'cdiscount', 'picard', 'tableur-export', 'planning', 'entrepot', 'smoby', 'animation',
  'copie',
  'visibilite',
  'amenagements',
  'demi-groupes',
  'temps',
  'questions',
  'tirage-niveaux',
  'fb-6.1', 'fb-6.2', 'fb-6.3', 'fb-6.4', 'fb-6.5', 'fb-6.6', 'fb-6.7', 'fb-6.8', 'fb-6.9', 'fb-6.10',
  'quai-iso',
  'decathlon',
  'decathlon-74',
  'dialogue',
  'localiser',
  'inspection',
  'courriel',
  'action',
  'action-81',
  'action-83',
  'action-84',
  'action-85',
  'action-86',
  'action-87',
  'action-88',
  'action-89',
  'action-810',
  'action-811',
  'action-812',
  'action-813',
  'action-814',
  'action-815',
  'action-816',
  'action-817',
  'action-818',
  'action-819',
  'preparation-vocale',
  'chep-91',
  'chep-92',
  'chep-93',
  'chep-94',
  'pelleau-101',
  'pelleau-102',
  'pelleau-103',
  'pelleau-104',
  'pelleau-105',
  'pelleau-106',
  'pelleau-107',
  'pelleau-108',
  'pelleau-109',
  'pelleau-110',
  'pelleau-111',
  'pelleau-112',
  'mr-11.4',
  'palettier',
  'ramasse'];
const PREREQUIS = { spartoo: ['socle'], groupes: ['socle'], smoby: ['socle'], questions: ['socle'] };

// Un fichier de bloc posé dans `outils/test/` mais oublié dans `BLOCS` ne tournerait jamais,
// sans que rien ne le dise : la suite resterait verte avec des cas en moins. On refuse de partir.
{
  const fs = await import('node:fs');
  const ici = new URL('./test/', import.meta.url);
  const oublies = fs.readdirSync(ici).filter((f) => f.endsWith('.mjs') && f !== 'commun.mjs')
    .map((f) => f.slice(0, -4)).filter((b) => !BLOCS.includes(b));
  if (oublies.length) {
    console.error(`outils/test/ contient un bloc absent de BLOCS (outils/test.mjs) : ${oublies.join(', ')}.`);
    process.exit(2);
  }
}

// Les huit groupes que GitHub lance en même temps (`--groupe N`). Répartis pour durer à peu près
// autant, ≈ 10 min chacun (mesures du 06/10/2026, voir docs/briefs/MOTEUR-tests-rapides.md ; refaits le
// 12/10/2026 pour les blocs `fb-6.x`, puis le 22/10/2026 : durées mesurées bloc par bloc dans un seul
// navigateur, ≈ 81 min de travail au total, 73 blocs). La répartition est faite « le plus long d'abord dans le
// groupe le moins chargé » ; le paquet `socle` + `spartoo` + `groupes` + `smoby` + `questions` (≈ 6 min,
// ils partagent la page du socle) est traité comme un seul bloc et se trouve dans le groupe 1.
// Un bloc et ses prérequis restent dans le même groupe : sinon le prérequis tournerait deux fois.
// Une séance nouvelle (France Boissons `fb-6.11`…, ou toute autre) va dans le groupe le plus léger.
const GROUPES = {
  1: ['socle', 'spartoo', 'groupes', 'smoby', 'temps', 'questions', 'fb-6.1', 'fb-6.10', 'action', 'action-84',
    'action-88', 'ramasse'],
  2: ['copie', 'demi-groupes', 'fb-6.7', 'fb-6.9', 'quai-iso', 'action-812', 'action-813', 'pelleau-102',
    'pelleau-111'],
  3: ['dependances', 'carte-region', 'picard', 'entrepot', 'animation', 'fb-6.3', 'action-86', 'action-87',
    'pelleau-103', 'action-819'],
  4: ['transport', 'boost', 'cdiscount', 'tableur-export', 'action-81', 'action-83', 'chep-93', 'pelleau-107',
    'pelleau-112', 'action-817'],
  5: ['visibilite', 'fb-6.4', 'fb-6.5', 'fb-6.6', 'decathlon-74', 'action-85', 'chep-91', 'pelleau-105',
    'pelleau-109', 'action-818'],
  6: ['quiz', 'inventaire', 'tirage-niveaux', 'decathlon', 'localiser', 'action-89', 'action-811', 'chep-94', 'preparation-vocale',
    'mr-11.4'],
  7: ['carte', 'fb-6.2', 'fb-6.8', 'courriel', 'pelleau-101', 'pelleau-108', 'pelleau-110', 'palettier', 'action-816'],
  8: ['planning', 'amenagements', 'dialogue', 'inspection', 'action-810', 'action-814', 'chep-92',
    'pelleau-104', 'pelleau-106', 'action-815'],
};
// Même garde que pour les blocs oubliés : un bloc rangé dans aucun groupe (ou dans deux) ne
// tournerait pas sur GitHub (ou deux fois), sans que rien ne le dise.
{
  const ranges = Object.values(GROUPES).flat();
  const sansGroupe = BLOCS.filter((b) => !ranges.includes(b));
  const enDouble = [...new Set(ranges.filter((b, i) => ranges.indexOf(b) !== i))];
  const inconnusG = ranges.filter((b) => !BLOCS.includes(b));
  const prerequisAilleurs = Object.values(GROUPES).flatMap((g) => g.flatMap((b) => (PREREQUIS[b] || [])
    .filter((p) => !g.includes(p)).map((p) => `${b} (prérequis ${p})`)));
  const fautes = [
    sansGroupe.length && `dans aucun groupe : ${sansGroupe.join(', ')}`,
    enDouble.length && `dans deux groupes : ${enDouble.join(', ')}`,
    inconnusG.length && `absents de BLOCS : ${inconnusG.join(', ')}`,
    prerequisAilleurs.length && `séparés de leur prérequis : ${prerequisAilleurs.join(', ')}`,
  ].filter(Boolean);
  if (fautes.length) {
    console.error(`GROUPES (outils/test.mjs) mal rempli — blocs ${fautes.join(' ; ')}.`);
    process.exit(2);
  }
}

let demandes = process.argv.slice(2);
const iGroupe = demandes.indexOf('--groupe');
if (iGroupe >= 0) {
  const n = demandes[iGroupe + 1];
  if (!GROUPES[n] || demandes.length !== 2) {
    console.error(`Usage : node outils/test.mjs --groupe N (N parmi ${Object.keys(GROUPES).join(', ')}), sans autre bloc.`);
    process.exit(2);
  }
  console.log(`Groupe ${n}.`);
  demandes = GROUPES[n];
}
const inconnus = demandes.filter((b) => !BLOCS.includes(b));
if (inconnus.length) {
  console.error(`Bloc inconnu : ${inconnus.join(', ')}. Blocs : ${BLOCS.join(', ')}.`);
  process.exit(2);
}
const voulus = new Set(demandes.length ? demandes.flatMap((b) => [...(PREREQUIS[b] || []), b]) : BLOCS);
const aLancer = BLOCS.filter((b) => voulus.has(b));
if (demandes.length) console.log(`Blocs lancés : ${aLancer.join(', ')}.`);

// Le commun démarre le serveur de test, le navigateur et la page partagée, dès son import.
const C = await import('./test/commun.mjs');
const { ok, ko, erreurs, erreursParCas, nav, srv } = C;

// Durée de chaque bloc, affichée avant le bilan : c'est elle qui sert à répartir les GROUPES.
const durees = [];
for (const nom of aLancer) {
  const t0 = Date.now();
  const { default: bloc } = await import(`./test/${nom}.mjs`);
  C.setBloc(nom);
  await bloc({
    v: C.v, page: C.page, nav: C.nav, ok: C.ok, ko: C.ko, erreurs: C.erreurs, ROOT: C.ROOT, BASE: C.BASE,
    baseXlsx: C.baseXlsx, hotesExternes: C.hotesExternes, introuvables: C.introuvables, SANS_CONFIG: C.SANS_CONFIG,
    egal: C.egal, vrai: C.vrai,
  });
  C.setBloc('');
  durees.push(`${nom} ${Math.round((Date.now() - t0) / 1000)} s`);
}

// Vérification finale, quel que soit le groupe ou le bloc lancé : `hotesExternes` et `introuvables`
// sont alimentés par TOUS les onglets de TOUS les contextes (voir `commun.mjs`). Les cas de
// `dependances` et de `quiz` qui les lisent plus tôt ne voient que ce qui s'est passé avant eux.
await C.v('aucune requête externe, et aucun fichier introuvable hors prepalog-config.json, dans toute la suite', async () => {
  if (C.hotesExternes.size) throw new Error('requête externe : ' + [...C.hotesExternes].join(', '));
  const autres = [...C.introuvables].filter((p) => p !== C.SANS_CONFIG);
  if (autres.length) throw new Error('fichier introuvable : ' + autres.join(', '));
});

console.log('\nDurée par bloc : ' + durees.join(' · '));
console.log('\n=== RÉUSSIS ===');
ok.forEach((o) => console.log('  ✓ ' + o));
if (ko.length) { console.log('\n=== ÉCHECS ==='); ko.forEach((k) => console.log('  ✗ ' + k)); }
// Chaque erreur JavaScript dit pendant quel cas elle est survenue (lot A, 09/10/2026). Celles de la page
// partagée font tomber la suite ; celles des pages ouvertes par les blocs sont jugées par leurs cas
// « aucune erreur », on les montre à part, et seulement quand la suite est rouge (en vert, ce sont les
// refus provoqués exprès par les cas « séance refusée », « jalon qui plante »…), pour savoir d'où elles
// viennent sans relancer.
const pendant = (x) => (x.cas ? ` [${x.bloc} · ${x.cas}]` : x.bloc ? ` [${x.bloc}, hors cas]` : '');
const uniques = (liste) => [...new Map(liste.map((x) => [x.msg + pendant(x), x])).values()];
if (erreurs.length) { console.log('\n=== ERREURS JS ==='); uniques(erreursParCas.filter((x) => x.partagee)).slice(0, 12).forEach((x) => console.log('  ! ' + x.msg + pendant(x))); }
const desBlocs = uniques(erreursParCas.filter((x) => !x.partagee));
if (desBlocs.length && (ko.length || erreurs.length)) { console.log('\n=== ERREURS JS SUR LES PAGES DES BLOCS (jugées par leurs cas « aucune erreur ») ==='); desBlocs.slice(0, 12).forEach((x) => console.log('  ! ' + x.msg + pendant(x))); }
if (ko.length && C.dossierCaptures()) console.log(`\nCaptures d'écran des cas tombés : ${C.dossierCaptures()}`);
console.log(`\n${ok.length}/${ok.length + ko.length} tests réussis.`);

await nav.close();
srv.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
