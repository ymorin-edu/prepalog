// Suite de tests de STRATELOG, à part de celle de Prepalog et Simulog (décision de Tristan, 25/11/2026).
//
//   node outils/test-stratelog.mjs
//
// 1. Les règles de chaque jeu (`stratelog/**/*.test.mjs`, sans navigateur, moins d'une seconde).
// 2. Les parties jouées à plusieurs onglets (blocs de `BLOCS_STRATELOG` dans outils/test.mjs, quelques secondes),
//    avec le même serveur de test et le même navigateur que la grande suite.
// La grande suite (`node outils/test.mjs`, `test-parallele.mjs`, les huit groupes GitHub) ne joue plus Stratelog.
// Quand lancer quoi : voir « Tests » dans CLAUDE.md.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const chercher = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? chercher(p) : (e.name.endsWith('.test.mjs') ? [p] : []);
});
const unitaires = chercher(path.join(RACINE, 'stratelog'));
const texte = fs.readFileSync(path.join(RACINE, 'outils', 'test.mjs'), 'utf8');
const m = texte.match(/const BLOCS_STRATELOG = (\[[^;]*\]);/);
if (!m) { console.error('BLOCS_STRATELOG introuvable dans outils/test.mjs.'); process.exit(2); }
const blocs = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);

console.log(`=== Stratelog 1/2 : règles des jeux (${unitaires.length} fichiers) ===`);
const a = spawnSync(process.execPath, ['--test', ...unitaires], { cwd: RACINE, stdio: 'inherit' });
console.log(`\n=== Stratelog 2/2 : parties à plusieurs onglets (${blocs.join(', ')}) ===`);
const b = spawnSync(process.execPath, [path.join(RACINE, 'outils', 'test.mjs'), ...blocs], { cwd: RACINE, stdio: 'inherit' });
const ok = a.status === 0 && b.status === 0;
console.log(`\nStratelog : ${ok ? 'tout est vert' : 'ÉCHEC'} (règles ${a.status === 0 ? 'vertes' : 'rouges'}, parties ${b.status === 0 ? 'vertes' : 'rouges'}).`);
process.exit(ok ? 0 : 1);
