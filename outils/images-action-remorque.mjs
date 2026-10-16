// Génère contenus/images/action/remorque-deux-planchers.svg (dessin original Prepalog, 16/10/2026).
// Usage : node outils/images-action-remorque.mjs
// Semi-remorque vue de côté, flanc en partie « transparent » : deux planchers de palettes superposés.
// Traits à l'encre seulement (currentColor) ; les cartons ont une trame légère à faible opacité.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SORTIE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'contenus', 'images', 'action', 'remorque-deux-planchers.svg');
const o = [];
const add = (s) => o.push(s);

add('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240" role="img" aria-label="Semi-remorque vue de côté, flanc transparent : deux planchers de palettes superposés">');
add('<g stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill="none">');

// sol
add('<path d="M8 205 H632" stroke-width="2.5"/>');

// remorque : caisse, châssis, béquilles
add('<rect x="20" y="34" width="440" height="126" rx="6"/>');
add('<rect x="20" y="160" width="440" height="8" rx="2"/>');
add('<path d="M390 168 V205 M382 205 H398" stroke-width="2.5"/>');

// partie fermée du flanc (à gauche) : nervures ; limite de la partie transparente en pointillés
for (let x = 32; x <= 118; x += 12) add(`<path d="M${x} 42 V152" stroke-width="2" stroke-opacity=".4"/>`);
add('<path d="M130 38 V156" stroke-width="2.5" stroke-dasharray="6 5"/>');

// plancher intermédiaire (de bout en bout) et montants
add('<rect x="24" y="96" width="432" height="5" fill="currentColor" fill-opacity=".25"/>');
add('<path d="M130 101 V106 M452 101 V106" stroke-width="2.5"/>');

// palettes : deux étages de cinq palettes chargées de cartons
const etages = [{ sol: 160 }, { sol: 96 }];
for (const e of etages) {
  for (let i = 0; i < 5; i++) {
    const x = 136 + i * 63;
    const yb = e.sol - 6; // dessus du plateau de palette
    // palette : plateau et trois pieds
    add(`<rect x="${x}" y="${yb}" width="58" height="6" stroke-width="2.5"/>`);
    add(`<path d="M${x + 19} ${yb} V${e.sol} M${x + 39} ${yb} V${e.sol}" stroke-width="2"/>`);
    // cartons : deux rangs de deux
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        add(`<rect x="${x + 1 + c * 28.5}" y="${yb - 24 * (r + 1)}" width="28" height="23.5" stroke-width="2" fill="currentColor" fill-opacity=".14"/>`);
      }
    }
  }
}

// roues de la remorque (essieux à l'arrière)
for (const cx of [60, 108]) add(`<circle cx="${cx}" cy="185" r="20"/><circle cx="${cx}" cy="185" r="7" stroke-width="2.5"/>`);

// tracteur : sellette, cabine, pare-brise, porte, roues
add('<path d="M462 160 H626 V168 H462 Z"/>');
add('<path d="M504 160 V72 Q504 66 510 66 H572 L612 112 H626 V160"/>');
add('<path d="M514 78 H568 L598 110 H514 Z" stroke-width="2.5"/>');
add('<path d="M514 78 V150 M514 128 H530" stroke-width="2.5"/>');
add('<path d="M474 160 V152 H500" stroke-width="2.5"/>');
for (const cx of [510, 590]) add(`<circle cx="${cx}" cy="185" r="20"/><circle cx="${cx}" cy="185" r="7" stroke-width="2.5"/>`);

add('</g>');
add('</svg>');

fs.writeFileSync(SORTIE, o.join('\n') + '\n', 'utf8');
console.log('écrit', SORTIE, fs.statSync(SORTIE).size, 'o');
