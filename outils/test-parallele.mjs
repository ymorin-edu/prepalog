// Suite de tests de Prepalog — tous les blocs EN MÊME TEMPS, six navigateurs à la fois, sur ce poste.
//
//   node outils/test-parallele.mjs        toute la suite en ~3 min au lieu de ~11
//   node outils/test-parallele.mjs 4      avec quatre navigateurs à la fois (poste plus tranquille)
//
// `node outils/test.mjs` joue les blocs l'un après l'autre dans un seul navigateur : c'est ce qui prend
// le temps, pas le calcul. Ce lanceur lance `node outils/test.mjs <bloc>` pour CHAQUE bloc de `BLOCS`
// (lu dans `outils/test.mjs`, donc une entreprise nouvelle est jouée dès qu'elle y a sa ligne), six à la
// fois, les plus longs d'abord ; dès qu'un finit, le suivant part. Chaque bloc a son serveur de test (un
// port par place, 8099 à 8104), son navigateur et son dossier temporaire (voir `outils/test/commun.mjs`).
// On ne descend pas sous le bloc le plus long (Smoby ou Picard, ~2 min 30) : au-delà de six places, on ne
// gagne plus rien. Décision de Tristan du 10/10/2026 (six navigateurs).
//
// Il ne touche ni à `outils/test.mjs` ni aux blocs. GitHub garde ses trois groupes (`--groupe N`).
//
// Comptage : un bloc lancé seul rejoue d'abord ses prérequis (`PREREQUIS` de `outils/test.mjs` : le socle
// avant Spartoo, groupes, Smoby, questions), et chaque navigateur termine par le cas « aucune requête
// externe… ». Ces cas répétés sont déduits du bilan d'ensemble (les prérequis ont leur propre lancer,
// qui les compte), pour retrouver le même nombre de cas que `node outils/test.mjs`. Les échecs sont
// dédoublonnés par leur texte.
//
// Un cas qui ne tombe qu'ici, et pas avec `node outils/test.mjs <bloc>`, est d'abord un cas trop pressé
// (six Chrome côte à côte ralentissent la page) : c'est le cas qu'il faut regarder, pas le lanceur.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const LANCEUR = fileURLToPath(new URL('./test.mjs', import.meta.url));
const PORT_DE_BASE = 8099;
const PLACES_PAR_DEFAUT = 6;
// Les blocs les plus longs partent d'abord (mesures du 06/10/2026 et du 10/10/2026) ; les autres suivent
// dans l'ordre de `BLOCS`. Un bloc absent d'ici n'est pas oublié, il part juste après.
const LONGS_D_ABORD = ['smoby', 'picard', 'entrepot', 'boost', 'cdiscount', 'questions', 'spartoo', 'groupes'];

const arg = process.argv[2];
const PLACES = arg === undefined ? PLACES_PAR_DEFAUT : Number(arg);
if (process.argv.length > 3 || !Number.isInteger(PLACES) || PLACES < 1 || PLACES > 12) {
  console.error('Usage : node outils/test-parallele.mjs [navigateurs à la fois, 1 à 12, 6 par défaut]. Un bloc seul : node outils/test.mjs <bloc>.');
  process.exit(2);
}

// `BLOCS` et `PREREQUIS` sont relus dans le texte du lanceur : l'importer le ferait démarrer la suite.
const texteLanceur = fs.readFileSync(LANCEUR, 'utf8');
const lireTableau = (nom) => {
  const m = texteLanceur.match(new RegExp(`const ${nom} = (\\[[^;]*\\]);`));
  if (!m) { console.error(`${nom} introuvable dans outils/test.mjs.`); process.exit(2); }
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};
const BLOCS = lireTableau('BLOCS');
const mPre = texteLanceur.match(/const PREREQUIS = (\{[^;]*\});/);
if (!mPre) { console.error('PREREQUIS introuvable dans outils/test.mjs.'); process.exit(2); }
const PREREQUIS = Object.fromEntries([...mPre[1].matchAll(/(\w[\w-]*):\s*\[([^\]]*)\]/g)]
  .map((x) => [x[1], [...x[2].matchAll(/'([^']+)'/g)].map((y) => y[1])]));
const ordre = [...LONGS_D_ABORD.filter((b) => BLOCS.includes(b)), ...BLOCS.filter((b) => !LONGS_D_ABORD.includes(b))];

const depart = Date.now();
const secondes = (t0) => Math.round((Date.now() - t0) / 1000);
console.log(`${ordre.length} blocs, ${Math.min(PLACES, ordre.length)} navigateurs à la fois (ports ${PORT_DE_BASE} à ${PORT_DE_BASE + Math.min(PLACES, ordre.length) - 1}).`);

const lancer = (bloc, place) => new Promise((resolve) => {
  const t0 = Date.now();
  const sortie = [];
  const enfant = spawn(process.execPath, [LANCEUR, bloc], {
    env: { ...process.env, PORT_TESTS: String(PORT_DE_BASE + place) },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  enfant.stdout.on('data', (d) => sortie.push(d));
  enfant.stderr.on('data', (d) => sortie.push(d));
  const finir = (code) => {
    const texte = Buffer.concat(sortie).toString('utf8');
    const lignes = texte.split('\n');
    const ok = lignes.filter((l) => l.startsWith('  ✓ ')).length;
    const ko = lignes.filter((l) => l.startsWith('  ✗ ')).map((l) => l.slice(4));
    const etat = code === 0 ? 'vert' : code === 1 ? `ROUGE (${ko.length} échec${ko.length > 1 ? 's' : ''}${ko.length ? '' : ', erreur JS'})` : `arrêté (code ${code})`;
    console.log(`  ${bloc.padEnd(16)} ${String(secondes(t0)).padStart(4)} s  ${etat}`);
    resolve({ bloc, code, texte, ok, ko, duree: secondes(t0) });
  };
  enfant.on('error', (e) => { sortie.push(Buffer.from(`\nLe bloc ${bloc} n'a pas pu démarrer : ${e.message}\n`)); finir(2); });
  enfant.on('close', (code) => finir(code ?? 2));
});

// La file : chaque place prend le bloc suivant dès qu'elle est libre.
const file = [...ordre];
const resultats = [];
await Promise.all(Array.from({ length: Math.min(PLACES, ordre.length) }, async (_, place) => {
  while (file.length) resultats.push(await lancer(file.shift(), place));
}));
resultats.sort((a, b) => ordre.indexOf(a.bloc) - ordre.indexOf(b.bloc));

// La sortie complète des blocs rouges ou arrêtés seulement (celle des verts n'apprendrait rien de plus).
for (const r of resultats.filter((x) => x.code !== 0)) {
  console.log(`\n\n${'='.repeat(30)} ${r.bloc.toUpperCase()} (${r.duree} s, code ${r.code}) ${'='.repeat(30)}\n`);
  console.log(r.texte.trimEnd());
}

// Bilan d'ensemble, cas répétés déduits (voir l'en-tête).
const parBloc = Object.fromEntries(resultats.map((r) => [r.bloc, r]));
let reussis = 0;
let finalsEnTrop = -1; // le cas final (« aucune requête externe… ») tourne une fois par navigateur : on en garde un
const echecs = new Set();
for (const r of resultats) {
  let ok = r.ok;
  let prerequisDeduits = false;
  for (const p of PREREQUIS[r.bloc] || []) {
    // Le prérequis a son propre lancer, qui compte ses cas ET son cas final : les déduire ici retire aussi
    // le cas final de ce navigateur.
    if (parBloc[p] && parBloc[p].code !== 2) { ok -= parBloc[p].ok; parBloc[p].ko.forEach((k) => echecs.add(k)); prerequisDeduits = true; }
  }
  if (r.code !== 2 && !prerequisDeduits) finalsEnTrop++;
  reussis += Math.max(0, ok);
  r.ko.forEach((k) => echecs.add(k));
}
reussis -= Math.max(0, finalsEnTrop);
const arretes = resultats.filter((r) => r.code !== 0 && r.code !== 1);

console.log(`\n\n${'='.repeat(30)} BILAN DE TOUTE LA SUITE ${'='.repeat(30)}`);
console.log('\nDurée par bloc : ' + resultats.map((r) => `${r.bloc} ${r.duree} s`).join(' · '));
if (echecs.size) { console.log('\n=== ÉCHECS ==='); [...echecs].forEach((e) => console.log('  ✗ ' + e)); }
if (arretes.length) console.log(`\nBloc(s) arrêté(s) avant la fin : ${arretes.map((r) => r.bloc).join(', ')} (leur sortie est ci-dessus).`);
console.log(`\n${reussis}/${reussis + echecs.size} tests réussis, en ${secondes(depart)} s.`);

process.exit(arretes.length ? 2 : echecs.size || resultats.some((r) => r.code !== 0) ? 1 : 0);
