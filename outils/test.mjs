// Suite de tests de Prepalog — le LANCEUR.
//
//   node outils/test.mjs              toute la suite, dans l'ordre (comme avant le découpage)
//   node outils/test.mjs boost        un seul bloc (plus rapide quand on travaille sur une entreprise)
//   node outils/test.mjs boost carte  plusieurs blocs, toujours remis dans l'ordre de la suite
//   node outils/test.mjs --groupe 2   un des trois groupes de `GROUPES` (c'est ce que lance GitHub)
//
// Sur GitHub, la suite entière frôlait la limite de 15 min : elle y tourne en trois groupes, en
// même temps, sur trois machines (lot 1 de MOTEUR-tests-rapides, 06/10/2026). Le port du serveur
// de test se règle par `PORT_TESTS` (8099 par défaut).
//
// Jusqu'au 02/10/2026, toute la suite tenait dans ce fichier (5 743 lignes). Plusieurs
// conversations travaillent en même temps sur le dépôt et s'écrasaient dans ce fichier unique :
// il est découpé en un fichier par bloc dans `outils/test/` (chantier C, voir
// `claude/prepalog-chantiers-en-cours.md`). Chaque conversation n'écrit plus que dans le bloc de
// son entreprise ou de sa vue.
//
// Ce qui ne change pas : la commande, le bilan affiché, le code de retour (1 si un cas échoue ou
// si une erreur JavaScript est relevée), et l'ORDRE des cas. Un seul navigateur, une seule page
// partagée (`outils/test/commun.mjs`) : certains blocs s'appuient sur ce qu'a fait le bloc
// précédent dans cette page — Spartoo et « groupes » sur l'élève et les groupes créés par le
// socle. Lancés seuls, ils sont donc précédés de leur prérequis (`PREREQUIS`).
//
// Ajouter un bloc : créer `outils/test/<nom>.mjs` sur le modèle des autres
// (`export default async function bloc({ v, page, nav, … })`), puis l'inscrire dans `BLOCS`.

const BLOCS = ['socle', 'spartoo', 'groupes', 'dependances', 'transport', 'boost', 'quiz', 'carte', 'inventaire',
  'cdiscount', 'picard', 'tableur-export', 'planning', 'entrepot', 'smoby', 'animation',
  'copie',
  'visibilite',
  'amenagements',
  'demi-groupes',
  'temps',
  'questions'];
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

// Les trois groupes que GitHub lance en même temps (`--groupe N`). Répartis pour durer à peu près
// autant (mesures du 06/10/2026, voir docs/briefs/MOTEUR-tests-rapides.md). Un bloc et ses
// prérequis restent dans le même groupe : sinon le prérequis tournerait deux fois.
const GROUPES = {
  1: ['quiz', 'carte', 'picard', 'demi-groupes', 'temps'],
  2: ['socle', 'spartoo', 'groupes', 'tableur-export', 'smoby', 'animation', 'visibilite', 'questions'],
  3: ['dependances', 'transport', 'boost', 'inventaire', 'cdiscount', 'planning', 'entrepot', 'copie', 'amenagements'],
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
const { ok, ko, erreurs, nav, srv } = C;

// Durée de chaque bloc, affichée avant le bilan : c'est elle qui sert à répartir les GROUPES.
const durees = [];
for (const nom of aLancer) {
  const t0 = Date.now();
  const { default: bloc } = await import(`./test/${nom}.mjs`);
  await bloc({
    v: C.v, page: C.page, nav: C.nav, ok: C.ok, ko: C.ko, erreurs: C.erreurs, ROOT: C.ROOT, BASE: C.BASE,
    baseXlsx: C.baseXlsx, hotesExternes: C.hotesExternes, introuvables: C.introuvables, SANS_CONFIG: C.SANS_CONFIG,
  });
  durees.push(`${nom} ${Math.round((Date.now() - t0) / 1000)} s`);
}

console.log('\nDurée par bloc : ' + durees.join(' · '));
console.log('\n=== RÉUSSIS ===');
ok.forEach((o) => console.log('  ✓ ' + o));
if (ko.length) { console.log('\n=== ÉCHECS ==='); ko.forEach((k) => console.log('  ✗ ' + k)); }
if (erreurs.length) { console.log('\n=== ERREURS JS ==='); [...new Set(erreurs)].slice(0, 12).forEach((e) => console.log('  ! ' + e)); }
console.log(`\n${ok.length}/${ok.length + ko.length} tests réussis.`);

await nav.close();
srv.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
