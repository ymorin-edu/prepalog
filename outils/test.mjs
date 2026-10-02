// Suite de tests de Prepalog — le LANCEUR.
//
//   node outils/test.mjs              toute la suite, dans l'ordre (comme avant le découpage)
//   node outils/test.mjs boost        un seul bloc (plus rapide quand on travaille sur une entreprise)
//   node outils/test.mjs boost carte  plusieurs blocs, toujours remis dans l'ordre de la suite
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

const BLOCS = ['socle', 'spartoo', 'groupes', 'dependances', 'transport', 'boost', 'quiz', 'carte'];
const PREREQUIS = { spartoo: ['socle'], groupes: ['socle'] };

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

const demandes = process.argv.slice(2);
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

for (const nom of aLancer) {
  const { default: bloc } = await import(`./test/${nom}.mjs`);
  await bloc({
    v: C.v, page: C.page, nav: C.nav, ok: C.ok, ko: C.ko, erreurs: C.erreurs, ROOT: C.ROOT,
    baseXlsx: C.baseXlsx, hotesExternes: C.hotesExternes, introuvables: C.introuvables, SANS_CONFIG: C.SANS_CONFIG,
  });
}

console.log('\n=== RÉUSSIS ===');
ok.forEach((o) => console.log('  ✓ ' + o));
if (ko.length) { console.log('\n=== ÉCHECS ==='); ko.forEach((k) => console.log('  ✗ ' + k)); }
if (erreurs.length) { console.log('\n=== ERREURS JS ==='); [...new Set(erreurs)].slice(0, 12).forEach((e) => console.log('  ! ' + e)); }
console.log(`\n${ok.length}/${ok.length + ko.length} tests réussis.`);

await nav.close();
srv.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
