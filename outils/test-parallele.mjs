// Suite de tests de Prepalog — tous les blocs EN MÊME TEMPS, huit navigateurs à la fois, sur ce poste.
//
//   node outils/test-parallele.mjs            toute la suite, huit navigateurs à la fois
//   node outils/test-parallele.mjs 4          avec quatre navigateurs à la fois (poste plus tranquille)
//   node outils/test-parallele.mjs --ordre    affiche l'ordre de départ des blocs et s'arrête, sans rien lancer
//
// `node outils/test.mjs` joue les blocs l'un après l'autre dans un seul navigateur : c'est ce qui prend
// le temps, pas le calcul. Ce lanceur lance `node outils/test.mjs <bloc>` pour CHAQUE bloc de `BLOCS`
// (lu dans `outils/test.mjs`, donc une entreprise nouvelle est jouée dès qu'elle y a sa ligne), huit à la
// fois, les plus longs d'abord ; dès qu'un finit, le suivant part. Chaque bloc a son serveur de test (un
// port par place, 8099 à 8106), son navigateur et son dossier temporaire (voir `outils/test/commun.mjs`).
//
// Durée : mesurée le 22/10/2026 à 23 min 30 pour 73 blocs, avec six places et l'ancien ordre de départ
// (5 514 s de travail cumulé). Avec huit places, le plancher théorique est 5 514 s ÷ 8, soit ~11 min 30 ;
// on ne descend de toute façon pas sous le bloc le plus long, Smoby (~4 min 45, rejeu du socle compris).
// Décisions de Tristan : six navigateurs le 10/10/2026, huit le 22/10/2026 (poste à 16 cœurs).
//
// L'ordre de départ se lit dans les durées mesurées : à la fin de chaque lancer, le lanceur écrit les
// durées des blocs qui ont fini dans `outils/.durees-blocs.json` (non versionné), et au départ suivant il
// les trie de la plus longue à la plus courte. Sans ce fichier (premier lancer, fichier effacé ou illisible),
// il prend `DUREES_REPLI` ci-dessous (mesures du 22/10/2026) ; un bloc que ni l'un ni l'autre ne connaît part
// juste après les autres, dans l'ordre de `BLOCS`.
//
// Il ne touche ni à `outils/test.mjs` ni aux blocs. GitHub garde ses huit groupes (`--groupe N`).
//
// Comptage : un bloc lancé seul rejoue d'abord ses prérequis (`PREREQUIS` de `outils/test.mjs` : le socle
// avant Spartoo, groupes, Smoby, questions), et chaque navigateur termine par le cas « aucune requête
// externe… ». Ces cas répétés sont déduits du bilan d'ensemble (les prérequis ont leur propre lancer,
// qui les compte), pour retrouver le même nombre de cas que `node outils/test.mjs`. Les échecs sont
// dédoublonnés par leur texte.
//
// Un cas qui ne tombe qu'ici, et pas avec `node outils/test.mjs <bloc>`, est d'abord un cas trop pressé
// (huit Chrome côte à côte ralentissent la page) : c'est le cas qu'il faut regarder, pas le lanceur.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const LANCEUR = fileURLToPath(new URL('./test.mjs', import.meta.url));
const PORT_DE_BASE = 8099;
const PLACES_PAR_DEFAUT = 8;
const FICHIER_DUREES = fileURLToPath(new URL('./.durees-blocs.json', import.meta.url));
// Durées mesurées le 22/10/2026 (secondes, un lancer complet à six places), pour trier les blocs quand
// `outils/.durees-blocs.json` n'existe pas encore. Les durées de smoby, spartoo, groupes et questions
// comprennent le rejeu du socle (lancés seuls, ils le rejouent). Le palettier est à 144 s depuis son allègement.
const DUREES_REPLI = {
  smoby: 284, picard: 193, 'fb-6.2': 99, 'fb-6.4': 110, 'fb-6.5': 110, 'fb-6.3': 79, 'fb-6.1': 76,
  entrepot: 141, boost: 64, cdiscount: 24, questions: 85, spartoo: 52, groupes: 54, socle: 39,
  dependances: 10, transport: 10, quiz: 17, carte: 24, 'carte-region': 8, inventaire: 25,
  'tableur-export': 8, planning: 33, animation: 26, copie: 3, visibilite: 6, amenagements: 9,
  'demi-groupes': 20, temps: 10, 'tirage-niveaux': 31, 'fb-6.6': 39, 'fb-6.7': 31, 'fb-6.8': 44,
  'fb-6.9': 19, 'fb-6.10': 27, 'quai-iso': 167, decathlon: 122, 'decathlon-74': 10, dialogue: 31,
  localiser: 205, inspection: 5, courriel: 18, action: 56, 'action-81': 164, 'action-83': 169,
  'action-84': 38, 'action-85': 212, 'action-86': 33, 'action-87': 48, 'action-88': 36, 'action-89': 96,
  'action-810': 42, 'action-811': 60, 'action-812': 87, 'action-813': 56, 'action-814': 153,
  'chep-91': 36, 'chep-92': 106, 'chep-93': 33, 'chep-94': 51,
  'pelleau-101': 179, 'pelleau-102': 61, 'pelleau-103': 70, 'pelleau-104': 169, 'pelleau-105': 57,
  'pelleau-106': 59, 'pelleau-107': 84, 'pelleau-108': 61, 'pelleau-109': 27, 'pelleau-110': 38,
  'pelleau-111': 165, 'pelleau-112': 52, palettier: 144, ramasse: 8,
};

const args = process.argv.slice(2);
const SEULEMENT_ORDRE = args.includes('--ordre');
const restant = args.filter((a) => a !== '--ordre');
const PLACES = restant.length === 0 ? PLACES_PAR_DEFAUT : Number(restant[0]);
if (restant.length > 1 || !Number.isInteger(PLACES) || PLACES < 1 || PLACES > 12) {
  console.error('Usage : node outils/test-parallele.mjs [navigateurs à la fois, 1 à 12, 8 par défaut] [--ordre : afficher l\'ordre de départ sans rien lancer]. Un bloc seul : node outils/test.mjs <bloc>.');
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

// Ordre de départ : durées du dernier lancer si le fichier est lisible, sinon durées de repli. Un fichier
// absent ou abîmé ne doit jamais empêcher la suite de partir.
let dureesMesurees = {};
let origineOrdre = 'durées de repli du 22/10/2026';
try {
  if (fs.existsSync(FICHIER_DUREES)) {
    const lu = JSON.parse(fs.readFileSync(FICHIER_DUREES, 'utf8'));
    if (!lu || typeof lu !== 'object' || Array.isArray(lu)) throw new Error('contenu inattendu');
    dureesMesurees = Object.fromEntries(Object.entries(lu).filter(([, d]) => Number.isFinite(d)));
    origineOrdre = 'durées du dernier lancer (outils/.durees-blocs.json)';
  }
} catch (e) {
  console.log(`outils/.durees-blocs.json illisible (${e.message}) : durées de repli utilisées.`);
}
const dureePrevue = (b) => dureesMesurees[b] ?? DUREES_REPLI[b];
const connus = BLOCS.filter((b) => dureePrevue(b) !== undefined).sort((a, b) => dureePrevue(b) - dureePrevue(a)); // tri stable : à égalité, l'ordre de BLOCS
const ordre = [...connus, ...BLOCS.filter((b) => dureePrevue(b) === undefined)];

const depart = Date.now();
const secondes = (t0) => Math.round((Date.now() - t0) / 1000);
console.log(`${ordre.length} blocs, ${Math.min(PLACES, ordre.length)} navigateurs à la fois (ports ${PORT_DE_BASE} à ${PORT_DE_BASE + Math.min(PLACES, ordre.length) - 1}).`);
console.log(`ordre : ${origineOrdre}`);
if (SEULEMENT_ORDRE) {
  console.log(ordre.map((b, i) => `${String(i + 1).padStart(3)}. ${b.padEnd(16)} ${dureePrevue(b) === undefined ? '(inconnu, après les autres)' : dureePrevue(b) + ' s'}`).join('\n'));
  process.exit(0);
}

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

// Les durées des blocs qui ont fini (verts ou rouges, pas les arrêtés) servent à l'ordre du prochain lancer.
// Une écriture ratée n'empêche pas le bilan.
try {
  fs.writeFileSync(FICHIER_DUREES, JSON.stringify(Object.fromEntries(resultats.filter((r) => r.code === 0 || r.code === 1).map((r) => [r.bloc, r.duree])), null, 1) + '\n');
} catch (e) {
  console.log(`Durées non enregistrées (${e.message}) : l'ordre de départ restera celui d'avant.`);
}

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
