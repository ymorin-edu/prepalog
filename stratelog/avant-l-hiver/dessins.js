// Stratelog, Avant l'Hiver : les dessins faits en code (paysans, logos des réserves, marchandises, charrettes) et le plateau
// de la ville (12 × 8 cases de 100 unités). Repris tels quels de la page d'essai validée par Tristan (24/11/2026) ; les
// bâtiments et le décor du plateau sont des <symbol> posés une fois dans la page (symboles.js, `<use href="#d-champ">`).

import * as R from './regles.js';

// ------------------------------------------------------------ paysans (gravure : contour d'encre épais, aplats chauds)
// Un personnage par poste, dans une boîte de 40 × 56, pieds en bas. Chacun porte l'outil de son poste.
const PK = '#1c1a17';
const PEAU = '#e8c49a';
const corps = (tunique, ceinture = '#5a3318') => `
  <path d="M15 44 L14 53 M25 44 L26 53" stroke="${PK}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M12 54 h5 M23 54 h5" stroke="#3a2614" stroke-width="3" stroke-linecap="round"/>
  <path d="M11 22 Q20 18 29 22 L31 45 Q20 48 9 45 Z" fill="${tunique}" stroke="${PK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M10.5 33 Q20 35 29.5 33" stroke="${ceinture}" stroke-width="2.4" fill="none"/>
  <path d="M13 28 l2 14 M25 28 l-1 14" stroke="${PK}" stroke-width=".8" opacity=".45"/>`;
const tete = (coiffe) => `<circle cx="20" cy="14" r="6.2" fill="${PEAU}" stroke="${PK}" stroke-width="2"/>
  <circle cx="18" cy="13.5" r=".9" fill="${PK}"/><circle cx="22.4" cy="13.5" r=".9" fill="${PK}"/>${coiffe}`;
const bras = (x1, y1, x2, y2, couleur) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${PK}" stroke-width="5.4" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${couleur}" stroke-width="3.2" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="2.2" fill="${PEAU}" stroke="${PK}" stroke-width="1.4"/>`;
export const PAYSANS = {
  // Moissonneur : chapeau de paille, faux
  champ: () => `<path d="M33 6 L30 50" stroke="#7e4c26" stroke-width="2.4" stroke-linecap="round"/><path d="M33 6 Q22 2 12 9 Q22 6 31.5 10 Z" fill="#c9cfd3" stroke="${PK}" stroke-width="1.6" stroke-linejoin="round"/>
    ${corps('#6f8f3a')}${bras(12, 24, 9, 36, '#6f8f3a')}${bras(28, 24, 31, 30, '#6f8f3a')}
    ${tete(`<ellipse cx="20" cy="9.5" rx="11" ry="3" fill="#e9be4c" stroke="${PK}" stroke-width="1.6"/><path d="M15 9 Q20 2 25 9 Z" fill="#e9be4c" stroke="${PK}" stroke-width="1.6"/><path d="M12 10 h16" stroke="#a87a1e" stroke-width=".8"/>`)}`,
  // Porteur du quai : bonnet, caisse portée à deux mains
  dech: () => `${corps('#5f7a8b')}
    ${tete(`<path d="M13.5 12 Q14 5 20 5 Q27 5 26.5 12 Q20 9 13.5 12 Z" fill="#9c3a3c" stroke="${PK}" stroke-width="1.6"/>`)}
    <path d="M12 24 L10.5 31 M28 24 L29.5 31" stroke="${PK}" stroke-width="5.4" stroke-linecap="round"/><path d="M12 24 L10.5 31 M28 24 L29.5 31" stroke="#5f7a8b" stroke-width="3.2" stroke-linecap="round"/>
    <rect x="9" y="27" width="22" height="13" rx="1" fill="#b07a44" stroke="${PK}" stroke-width="1.8"/>
    <path d="M9.5 31.5h21M9.5 35.8h21" stroke="#6e4423" stroke-width="1"/><path d="M9 27l22 13M31 27L9 40" stroke="#6e4423" stroke-width=".7" opacity=".55"/>
    <circle cx="10" cy="31" r="2.2" fill="${PEAU}" stroke="${PK}" stroke-width="1.4"/><circle cx="30" cy="31" r="2.2" fill="${PEAU}" stroke="${PK}" stroke-width="1.4"/>`,
  // Bûcheron : capuche rouge, hache levée
  bucheron: () => `<g transform="translate(6 9.5) scale(.84)"><path d="M31.5 7 Q30.2 30 32.5 53" stroke="${PK}" stroke-width="4.4" stroke-linecap="round" fill="none"/><path d="M31.5 7 Q30.2 30 32.5 53" stroke="#a8743f" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M31.4 12 Q30.8 30 32.3 50" stroke="#c9945a" stroke-width=".7" fill="none"/>
    <path d="M29.2 5.2 L33.8 5.2 L34.4 6.6 Q37.6 6.4 39.6 3 Q42.6 9.4 41 17.2 Q38.8 13.6 34.6 13.4 L33.8 14.6 L29.2 14.6 Z" fill="#9b988f" stroke="${PK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M39.8 4.6 Q41.8 9.6 40.6 15.4" stroke="#ecebe6" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M29.6 7.4h3.8M29.6 12.4h3.8" stroke="${PK}" stroke-width=".7" opacity=".6"/></g>
    ${corps('#8a5a2b', '#2c1a0d')}${bras(12, 24, 10, 36, '#8a5a2b')}${bras(28, 24, 31.5, 31, '#8a5a2b')}
    ${tete(`<path d="M12.5 15 Q12 5 20 5 Q28 5 27.5 15 Q26 9 20 9 Q14 9 12.5 15 Z" fill="#b8321f" stroke="${PK}" stroke-width="1.6"/><path d="M12.6 15 L11 22 L15 20 Z" fill="#b8321f" stroke="${PK}" stroke-width="1.4"/>`)}`,
  // Carrier : calotte, pic
  carriere: () => `<path d="M8 6 L30 30" stroke="#7e4c26" stroke-width="2.4" stroke-linecap="round"/><path d="M3 12 Q6 3 15 2 Q9 6 8 6 Q7 8 3 12 Z" fill="#8b8a83" stroke="${PK}" stroke-width="1.5" stroke-linejoin="round"/>
    ${corps('#c58a4f')}${bras(12, 24, 11, 12, '#c58a4f')}${bras(28, 24, 29, 31, '#c58a4f')}
    ${tete(`<path d="M13.5 11 Q14 5.5 20 5.5 Q26 5.5 26.5 11 Z" fill="#6f6a60" stroke="${PK}" stroke-width="1.6"/>`)}
    <path d="M30 50 l4 -4 l5 3 l-2 5 z" fill="#c9bfae" stroke="${PK}" stroke-width="1.4"/>`,
  // Drapière : coiffe blanche, robe pourpre, pièce de drap
  atelier: () => `<path d="M11 22 Q20 18 29 22 L33 53 Q20 56 7 53 Z" fill="#6d3c6a" stroke="${PK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M10.5 31 Q20 33 29.5 31" stroke="#e2a52a" stroke-width="2" fill="none"/>
    ${bras(12, 24, 13, 33, '#6d3c6a')}${bras(28, 24, 27, 33, '#6d3c6a')}
    <rect x="9" y="31" width="22" height="8" rx="4" fill="#3f4f9a" stroke="${PK}" stroke-width="1.6"/><path d="M15 31v8M21 31v8" stroke="#eee6e1" stroke-width="1"/>
    ${tete(`<path d="M12.5 16 Q12 5 20 5 Q28 5 27.5 16 L26 21 Q26 10 20 10 Q14 10 14 21 Z" fill="#f4ece0" stroke="${PK}" stroke-width="1.6"/>`)}`,
  // Guetteur : chapeau de fer, tabard, lance
  guet: () => `<path d="M33 1 L33 54" stroke="#5a3318" stroke-width="2.4" stroke-linecap="round"/><path d="M33 -3 L36 4 L33 3 L30 4 Z" fill="#c9cfd3" stroke="${PK}" stroke-width="1.4" stroke-linejoin="round"/>
    ${corps('#3f4f9a', '#2c1a0d')}<path d="M16 22 h8 v20 l-4 3 l-4 -3 z" fill="#b8321f" stroke="${PK}" stroke-width="1.4"/><path d="M20 26 v10 M16.5 30 h7" stroke="#f0c04a" stroke-width="1.6"/>
    ${bras(12, 24, 10, 36, '#3f4f9a')}${bras(28, 24, 32, 30, '#3f4f9a')}
    ${tete(`<ellipse cx="20" cy="10" rx="10.5" ry="2.6" fill="#8b8a83" stroke="${PK}" stroke-width="1.6"/><path d="M14 10 Q14 3.5 20 3.5 Q26 3.5 26 10 Z" fill="#a9a9a2" stroke="${PK}" stroke-width="1.6"/>`)}`,
};
export const paysan = (poste) => (PAYSANS[poste] || PAYSANS.dech)();
// Un paysan placé (x, y = coin haut gauche), à l'échelle k.
export const paysanEn = (poste, x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${paysan(poste)}</g>`;
export const petitPaysan = (poste, t = 30) => `<svg class="paysan" viewBox="-2 -4 44 62" width="${t}" height="${t * 62 / 44}" aria-hidden="true">${paysan(poste)}</svg>`;

// ------------------------------------------------------------ plateau (12 × 8 cases de 100 unités)
export const ENC = '#1c1a17';
// Emplacements par sorte de bâtiment, dans l'ordre où ils se remplissent. La place ne compte pas en épisode 1
// (décision du 05/10) : le plateau range les constructions, la vue retient quand même la case.
export const PLACES = {
  champ: [[1, 4], [3, 4], [6, 4], [8, 4], [1, 6], [3, 6], [6, 6], [8, 6]],
  bucheron: [[0, 1], [0, 2], [0, 3], [0, 0]],
  carriere: [[11, 0], [11, 1], [11, 2]],
  long: [[2, 2], [2, 3], [7, 0], [7, 1], [7, 3]],
  eglise: [[7, 2]],
  petit: [[4, 2], [4, 3], [9, 0], [9, 1], [9, 2], [9, 3], [5, 0], [6, 0], [6, 3]],
};
export const FAMILLE = { champ: 'champ', bucheron: 'bucheron', carriere: 'carriere', grenier: 'long', halle: 'long', quartier: 'long',
  choeur: 'eglise', nef: 'eglise', atelier: 'petit', guet: 'petit', chancellerie: 'petit' };
export const TAILLE = { champ: [2, 2], grenier: [2, 1], halle: [2, 1], quartier: [2, 1], choeur: [2, 1], nef: [2, 1] };
export const QUAI = [10, 3];
export const POSTE_DE = { champ: 'champ', bucheron: 'bucheron', carriere: 'carriere', atelier: 'atelier', guet: 'guet' };

// Le plan de la ville : chaque construction et sa case, choisie par le Maître d'œuvre (décision de Tristan, 21/11 :
// les élèves prennent l'habitude de placer, pour les jeux suivants). La place ne change rien aux règles de l'épisode 1.
export function planDepart() { return [{ k: 'champ', x: 1, y: 4, fait: true }, { k: 'champ', x: 3, y: 4, fait: true }, { k: 'champ', x: 6, y: 4, fait: true }, { k: 'bucheron', x: 0, y: 1, fait: true }]; }
export function constructions(plan, projets = [], places = []) {
  const items = plan.map((p) => ({ k: p.k, place: [p.x, p.y], etat: p.fait ? 'fait' : 'chantier' }));
  projets.forEach((k, i) => items.push({ k, place: places[i], etat: 'projet' }));
  // L'église : un seul emplacement ; la nef, une fois lancée, prend le dessin de l'église entière.
  const nef = items.find((x) => x.k === 'nef');
  if (nef) { const ch = items.find((x) => x.k === 'choeur'); if (ch) items.splice(items.indexOf(ch), 1); }
  return items;
}
export const occupees = (plan, places) => new Set([...plan.map((p) => `${p.x},${p.y}`), ...places.filter(Boolean).map(([x, y]) => `${x},${y}`)]);
export function casesLibres(k, plan, places) {
  const pris = occupees(plan, places);
  return PLACES[FAMILLE[k]].filter(([x, y]) => !pris.has(`${x},${y}`));
}

export const pion = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-7 14 C-7 4 7 4 7 14 Z" fill="#f4ece0" stroke="${ENC}" stroke-width="2"/><circle cy="-1" r="5.5" fill="#f4ece0" stroke="${ENC}" stroke-width="2"/></g>`;
export const pions = (n, x, y, poste = 'dech', k = 0.9, pas = 34) => Array.from({ length: n }, (_, i) => paysanEn(poste, x + i * pas, y, k)).join('');

export function plateau(v, { plan, saison = 'Été', projets = [], places = [], equipes = null, cliquable = false, placer = null } = {}) {
  const items = constructions(plan, projets, places);
  // Répartition des équipes sur les bâtiments, pour les montrer (le moteur ne compte que par poste).
  const reste = equipes ? { ...equipes } : {};
  let s = `<svg viewBox="0 0 1200 800" role="img" aria-label="Plateau de la ville"><use href="#d-decor"/>`;
  s += `<g><use href="#d-bourg" x="200" y="0" width="300" height="200"/><text x="350" y="214" text-anchor="middle" font-family="Alegreya SC, Georgia, serif" font-size="16" fill="${ENC}" stroke="#f3e2b8" stroke-width="4" paint-order="stroke">le Bourg</text></g>`;
  items.forEach((it, i) => {
    if (!it.place) return;
    const [cx, cy] = it.place; const [w, h] = TAILLE[it.k] || [1, 1];
    const x = cx * 100; const y = cy * 100; const W = w * 100; const H = h * 100;
    const op = it.etat === 'fait' ? 1 : it.etat === 'chantier' ? 0.6 : 0.42;
    const poste = POSTE_DE[it.k];
    let n = 0;
    if (equipes && poste && it.etat === 'fait') { const cap = it.k === 'champ' ? R.equipesParChamp(saison) : 1; n = Math.min(cap, reste[poste] || 0); reste[poste] -= n; }
    s += `<g ${cliquable ? `data-case="${it.k}" tabindex="0" role="button" aria-label="${R.BATIMENTS[it.k].nom}${n ? `, ${n} équipe${n > 1 ? 's' : ''}` : ''}${it.etat !== 'fait' ? ', en chantier' : ''}"` : ''}>
      <use href="#d-${it.k}" x="${x + 3}" y="${y + 3}" width="${W - 6}" height="${H - 6}" opacity="${op}"/>
      <rect class="cadre" x="${x + 2}" y="${y + 2}" width="${W - 4}" height="${H - 4}" rx="8" fill="none" stroke="${ENC}" stroke-width="2" opacity=".0"/>`;
    if (it.etat !== 'fait') {
      s += `<path d="M${x + 12} ${y + H - 12} L${x + W - 12} ${y + 12} M${x + 12} ${y + 12} L${x + W - 12} ${y + H - 12}" stroke="#8e2b23" stroke-width="3" ${it.etat === 'projet' ? 'stroke-dasharray="10 8"' : ''} opacity=".7"/>
        <text x="${x + W / 2}" y="${y + H / 2 + 6}" text-anchor="middle" font-family="Alegreya SC, Georgia, serif" font-size="18" font-weight="700" fill="#8e2b23" stroke="#f3e2b8" stroke-width="5" paint-order="stroke">${it.etat === 'projet' ? 'projet' : 'chantier'}</text>`;
    }
    if (n) { const k = W >= 200 ? 1.25 : 1.05; s += pions(n, x + (W >= 200 ? 14 : 4), y + H - 56 * k - 2, poste, k, W >= 200 ? 50 : 30); }
    s += '</g>';
  });
  // Quai : une jetée au bout de la route, les charrettes qui attendent, les équipes qui déchargent.
  const [qx, qy] = QUAI.map((c) => c * 100);
  s += `<g ${cliquable ? 'data-case="quai" tabindex="0" role="button" aria-label="Le quai"' : ''}>
    <rect x="${qx + 4}" y="${qy + 30}" width="92" height="64" rx="4" fill="#b07040" stroke="${ENC}" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M${qx + 4} ${qy + 40 + k * 10} H${qx + 96}" stroke="${ENC}" stroke-width="1" opacity=".5"/>`).join('')}
    <text x="${qx + 50}" y="${qy + 22}" text-anchor="middle" font-family="Alegreya SC, Georgia, serif" font-size="18" fill="${ENC}" stroke="#f3e2b8" stroke-width="4" paint-order="stroke">le Quai</text>
    <rect class="cadre" x="${qx + 2}" y="${qy + 2}" width="96" height="96" rx="8" fill="none" stroke="${ENC}" stroke-width="2" opacity="0"/>`;
  v.quai.slice(0, 6).forEach((c, i) => { s += `<g transform="translate(${qx + 8 + (i % 3) * 29} ${qy + 36 + Math.floor(i / 3) * 24}) scale(1.1)">${charretteSvg(c.m)}</g>`; });
  if (v.quai.length > 6) s += `<text x="${qx + 92}" y="${qy + 90}" text-anchor="end" font-size="16" font-weight="700">+${v.quai.length - 6}</text>`;
  if (equipes && equipes.dech) s += pions(Math.min(equipes.dech, 4), qx - 6, qy + 34, 'dech', 0.95, 26);
  s += `</g>`;
  if (placer) {
    casesLibres(placer, plan, places).forEach(([cx, cy]) => {
      const [w, h] = TAILLE[placer] || [1, 1]; const x = cx * 100; const y = cy * 100;
      s += `<g data-place="${cx},${cy}" tabindex="0" role="button" aria-label="Construire ici" style="cursor:pointer">
        <rect x="${x + 6}" y="${y + 6}" width="${w * 100 - 12}" height="${h * 100 - 12}" rx="8" fill="rgba(246,201,91,.45)" stroke="#8e2b23" stroke-width="4" stroke-dasharray="12 8"/>
        <text x="${x + w * 50}" y="${y + h * 50 + 7}" text-anchor="middle" font-family="Alegreya SC, Georgia, serif" font-size="20" font-weight="700" fill="#8e2b23" stroke="#f3e2b8" stroke-width="5" paint-order="stroke">ici ?</text></g>`;
    });
  }
  const sansPlace = items.filter((it) => !it.place);
  s += `</svg>`;
  return `<div class="plateau">${s}</div>${sansPlace.length ? `<p class="note">Sans place dessinée : ${sansPlace.map((x) => R.BATIMENTS[x.k].nom).join(', ')}.</p>` : ''}`;
}

export const TEINTE_M = { grain: '#e3c77a', bois: '#8a5a2b', pierre: '#b9b2a2', drap: '#6d3c6a' };
export function charretteSvg(m) {
  return `<path d="M17 8.5l6.5-2.6" stroke="${ENC}" stroke-width="1.6" stroke-linecap="round"/><path d="M3 5.5c1-3 3.5-4 6.5-4s6 1 7 4z" fill="${TEINTE_M[m] || '#ccc'}" stroke="${ENC}" stroke-width=".8"/><path d="M1 5h17l-1.5 6H2.5z" fill="#a8692f" stroke="${ENC}" stroke-width="1" stroke-linejoin="round"/><path d="M2 8h15" stroke="#6e4423" stroke-width=".6"/><circle cx="8.5" cy="12.5" r="4" fill="#efe0c2" stroke="${ENC}" stroke-width="1"/><circle cx="8.5" cy="12.5" r="3.3" fill="none" stroke="#7a4e26" stroke-width="0.6"/><path d="M8.5 12.5L11.8 12.5M8.5 12.5L10.1 15.3M8.5 12.5L6.9 15.3M8.5 12.5L5.2 12.5M8.5 12.5L6.9 9.7M8.5 12.5L10.1 9.7" stroke="#7a4e26" stroke-width="0.7"/><circle cx="8.5" cy="12.5" r="0.9" fill="#7a4e26" stroke="${ENC}" stroke-width="0.5"/>`;
}
export const petiteCharrette = (c) => `<span class="charrette"><svg viewBox="0 0 24 17">${charretteSvg(c.m)}</svg>${c.q}</span>`;

// ------------------------------------------------------------ logos (gravure, sur pastille parchemin pour les deux thèmes)
export const IK = '#1c1a17';
export const LOGOS = {
  deniers: `<ellipse cx="16" cy="24" rx="10" ry="4" fill="#c98a1c" stroke="${IK}" stroke-width="1.6"/><ellipse cx="16" cy="20" rx="10" ry="4" fill="#e2a52a" stroke="${IK}" stroke-width="1.6"/><ellipse cx="16" cy="15" rx="10" ry="4" fill="#f0c04a" stroke="${IK}" stroke-width="1.6"/><path d="M12 15h8M16 13v4" stroke="${IK}" stroke-width="1.2"/>`,
  grain: `<path d="M16 29V13M16 29l-6-12M16 29l6-12" stroke="${IK}" stroke-width="1.6" fill="none"/><g fill="#e9be4c" stroke="${IK}" stroke-width="1.2"><ellipse cx="16" cy="8" rx="2.6" ry="5"/><ellipse cx="9" cy="13" rx="2.4" ry="4.6" transform="rotate(-28 9 13)"/><ellipse cx="23" cy="13" rx="2.4" ry="4.6" transform="rotate(28 23 13)"/></g><path d="M11 24h10" stroke="#8e2b23" stroke-width="2.4"/>`,
  halle: `<rect x="4" y="15" width="13" height="12" fill="#b07040" stroke="${IK}" stroke-width="1.6"/><path d="M4 21h13M10.5 15v12" stroke="${IK}" stroke-width="1"/><rect x="15" y="9" width="13" height="8" rx="4" fill="#6d3c6a" stroke="${IK}" stroke-width="1.6"/><path d="M19 9v8M23 9v8" stroke="#f3e2b8" stroke-width="1"/><circle cx="23" cy="23" r="5" fill="#d9b98a" stroke="${IK}" stroke-width="1.6"/><circle cx="23" cy="23" r="2.2" fill="none" stroke="${IK}" stroke-width="1"/><rect x="5" y="5" width="8" height="7" fill="#c9bfae" stroke="${IK}" stroke-width="1.4"/>`,
  bois: `<circle cx="9" cy="23" r="6" fill="#6e4423" stroke="${IK}" stroke-width="1.4"/><circle cx="9" cy="23" r="4.3" fill="#e2c08a"/><circle cx="9" cy="23" r="2.3" fill="none" stroke="#a4743e" stroke-width=".9"/><circle cx="23" cy="23" r="6" fill="#6e4423" stroke="${IK}" stroke-width="1.4"/><circle cx="23" cy="23" r="4.3" fill="#e2c08a"/><circle cx="23" cy="23" r="2.3" fill="none" stroke="#a4743e" stroke-width=".9"/><circle cx="16" cy="11" r="6" fill="#6e4423" stroke="${IK}" stroke-width="1.4"/><circle cx="16" cy="11" r="4.3" fill="#e2c08a"/><circle cx="16" cy="11" r="2.3" fill="none" stroke="#a4743e" stroke-width=".9"/>`,
  pierre: `<path d="M3 20h12v8H3zM17 20h12v8H17zM10 9h12v8H10z" fill="#cfc6b4" stroke="${IK}" stroke-width="1.5"/><path d="M3 20l2-2h12M17 20l2-2h12v8l-2 2M10 9l2-2h12v8l-2 2" fill="none" stroke="${IK}" stroke-width="1.3"/><path d="M6 22v4M10 22v4M20 22v4M24 22v4M13 11v4M17 11v4" stroke="${IK}" stroke-width=".6" opacity=".6"/>`,
  drap: `<rect x="5" y="9" width="22" height="14" rx="7" fill="#6d3c6a" stroke="${IK}" stroke-width="1.6"/><path d="M11 9v14M17 9v14" stroke="#f3e2b8" stroke-width="1.1"/><path d="M22 23c2 3 5 4 6 4" stroke="${IK}" stroke-width="1.6" fill="none"/>`,
  habitants: `<path d="M1.5 30c0-6 2.5-9.5 7-9.5s7 3.5 7 9.5z" fill="#5e7d3a" stroke="${IK}" stroke-width="1.3"/><path d="M6 22.5l2.5 3 2.5-3" fill="none" stroke="#f4ece0" stroke-width="1.1"/><path d="M3.6 16.5c0-4 2-6.6 4.9-6.6s4.9 2.6 4.9 6.6c0 2-1 3.6-1.8 4.2H5.4c-.8-.6-1.8-2.2-1.8-4.2z" fill="#f4ece0" stroke="${IK}" stroke-width="1.2"/><ellipse cx="8.5" cy="16.4" rx="2.7" ry="3.1" fill="#efcfa0" stroke="${IK}" stroke-width=".9"/><path d="M16.5 30c0-6 2.5-9.5 7-9.5s7 3.5 7 9.5z" fill="#3f5a8c" stroke="${IK}" stroke-width="1.3"/><path d="M20 24h7" stroke="#7a4e26" stroke-width="1.4"/><ellipse cx="23.5" cy="16.6" rx="3" ry="3.4" fill="#efcfa0" stroke="${IK}" stroke-width=".9"/><ellipse cx="23.5" cy="13.9" rx="5.6" ry="1.4" fill="#e3c06a" stroke="${IK}" stroke-width="1"/><path d="M20.8 13.3c.2-2.3 1.3-3.6 2.7-3.6s2.5 1.3 2.7 3.6" fill="#e3c06a" stroke="${IK}" stroke-width="1"/><path d="M8 31.5c0-6.5 3.3-10 8-10s8 3.5 8 10z" fill="#8a5a2b" stroke="${IK}" stroke-width="1.4"/><path d="M12.5 23.5l3.5 3.5 3.5-3.5" fill="#9c2f24" stroke="${IK}" stroke-width="1.1"/><path d="M10.6 17.5c0-5 2.3-8.2 5.4-8.2s5.4 3.2 5.4 8.2c0 3.2-1.5 5.6-2.4 6.3h-5.9c-.9-.7-2.4-3.1-2.4-6.3z" fill="#9c2f24" stroke="${IK}" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="16" cy="18" rx="3.1" ry="3.5" fill="#efcfa0" stroke="${IK}" stroke-width=".9"/><path d="M14.7 17.6h.01M17.3 17.6h.01" stroke="${IK}" stroke-width="1.1" stroke-linecap="round"/>`,
  reputation: `<path d="M16 4l3.3 7 7.7.8-5.8 5.2 1.7 7.6L16 20.8 9.1 24.6l1.7-7.6L5 11.8l7.7-.8z" fill="#f0c04a" stroke="${IK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 28c4-2 16-2 20 0" stroke="#5c8a2e" stroke-width="2.4" fill="none"/>`,
  charrette: `<path d="M20 15l11-4" stroke="${IK}" stroke-width="3.2" stroke-linecap="round"/><path d="M20 15l11-4" stroke="#b07a44" stroke-width="1.6" stroke-linecap="round"/><path d="M2 9h21l-2 9H4z" fill="#a8692f" stroke="${IK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 12.5h19M3.6 15.3h18" stroke="#6e4423" stroke-width=".9"/><path d="M8 9v9M14 9v9M19 9v9" stroke="#6e4423" stroke-width=".7"/><circle cx="12" cy="22" r="7" fill="#efe0c2" stroke="${IK}" stroke-width="1.5"/><circle cx="12" cy="22" r="5.7" fill="none" stroke="#7a4e26" stroke-width="0.9"/><path d="M12 22L17.7 22.0M12 22L16.1 26.1M12 22L12.0 27.7M12 22L7.9 26.1M12 22L6.3 22.0M12 22L7.9 17.9M12 22L12.0 16.3M12 22L16.1 17.9" stroke="#7a4e26" stroke-width="1.0"/><circle cx="12" cy="22" r="1.5" fill="#7a4e26" stroke="${IK}" stroke-width="0.8"/>`,
  registre: `<path d="M16 8c-3-2-7-3-12-2v19c5-1 9 0 12 2 3-2 7-3 12-2V6c-5-1-9 0-12 2z" fill="#f4ece0" stroke="${IK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 8v19" stroke="${IK}" stroke-width="1.2"/><path d="M7 11h6M7 15h6M7 19h5M19 11h6M19 15h6M19 19h4" stroke="#8e2b23" stroke-width="1"/>`,
  sablier: `<path d="M8 4h16M8 28h16M10 4c0 8 12 8 12 12s-12 4-12 12M22 4c0 8-12 8-12 12s12 4 12 12" stroke="${IK}" stroke-width="1.6" fill="none"/><path d="M12 26c1-4 7-4 8 0z" fill="#e9be4c"/>`,
  marteau: `<path d="M17 13 L8 29" stroke="#7e4c26" stroke-width="3.4" stroke-linecap="round"/><path d="M8 29" stroke="${IK}"/><rect x="10" y="4" width="16" height="9" rx="1.5" transform="rotate(30 18 8.5)" fill="#8b8a83" stroke="${IK}" stroke-width="1.6"/><path d="M17 13 L8 29" stroke="${IK}" stroke-width="1" opacity=".5"/>`,
  cle: `<circle cx="10" cy="11" r="6" fill="none" stroke="#c98a1c" stroke-width="3.4"/><circle cx="10" cy="11" r="6" fill="none" stroke="${IK}" stroke-width="1"/><path d="M14 15 L27 28 M22 23 l3 -3 M25 26 l3 -3" stroke="#c98a1c" stroke-width="3.2" stroke-linecap="round"/>`,
  calculette: `<rect x="7" y="3" width="18" height="26" rx="2.5" fill="#d9b98a" stroke="${IK}" stroke-width="1.6"/><rect x="10" y="6" width="12" height="6" fill="#f4ece0" stroke="${IK}" stroke-width="1.2"/><g fill="${IK}"><circle cx="12" cy="17" r="1.4"/><circle cx="16" cy="17" r="1.4"/><circle cx="20" cy="17" r="1.4"/><circle cx="12" cy="21.5" r="1.4"/><circle cx="16" cy="21.5" r="1.4"/><circle cx="20" cy="21.5" r="1.4"/><circle cx="12" cy="26" r="1.4"/><circle cx="16" cy="26" r="1.4"/><circle cx="20" cy="26" r="1.4"/></g>`,
};
export const logo = (n, t = 26, lib = '') => `<span class="logo" style="width:${t}px;height:${t}px"${lib ? ` role="img" aria-label="${lib}"` : ' aria-hidden="true"'}><svg viewBox="0 0 32 32">${LOGOS[n]}</svg></span>`;

// ------------------------------------------------------------ grands dessins des marchandises (gravure, 64 × 64)
export const GRANDS = (() => {
  const k = IK, f = (n) => n.toFixed(1);
  // grain : une gerbe nouée, épis à grains et barbes
  let epis = '', tiges = '';
  const angles = [-36, -18, 0, 18, 36, -27, 27];
  angles.forEach((a, i) => {
    const r = a * Math.PI / 180, L = i > 4 ? 19 : 23;
    const bx = 32 + Math.sin(r) * 4, by = 36;
    const tx = 32 + Math.sin(r) * L * 1.05, ty = 36 - Math.cos(r) * L;
    tiges += `<path d="M${f(bx)} ${by}L${f(tx)} ${f(ty)}" stroke="${k}" stroke-width="2"/><path d="M${f(bx)} ${by}L${f(tx)} ${f(ty)}" stroke="#d7ab48" stroke-width="1"/>`;
    const ux = Math.sin(r), uy = -Math.cos(r);
    for (let j = 0; j < 4; j++) {
      const d = j * 2.6, cx = tx + ux * d, cy = ty + uy * d;
      [-1, 1].forEach((sg) => {
        const ox = cx + sg * uy * 1.3, oy = cy - sg * ux * 1.3;
        epis += `<ellipse cx="${f(ox)}" cy="${f(oy)}" rx="1.4" ry="2.2" transform="rotate(${f(a + sg * 18)} ${f(ox)} ${f(oy)})"/>`;
      });
    }
    const hx = tx + ux * 10, hy = ty + uy * 10;
    tiges += `<path d="M${f(hx)} ${f(hy)}l${f(ux * 5 - uy * 1.5)} ${f(uy * 5 + ux * 1.5)}M${f(hx)} ${f(hy)}l${f(ux * 5 + uy * 1.5)} ${f(uy * 5 - ux * 1.5)}" stroke="${k}" stroke-width=".6"/>`;
  });
  let pieds = '';
  for (let i = -6; i <= 6; i++) pieds += `<path d="M${32 + i * .5} 40L${32 + i * 1.5} 58" stroke="${i % 2 ? '#b98a2e' : '#d7ab48'}" stroke-width="1.8"/>`;
  const grain = `<ellipse cx="32" cy="59" rx="14" ry="2.5" fill="${k}" opacity=".18"/>${pieds}<path d="M23 58h18" stroke="${k}" stroke-width="1"/>${tiges}<g fill="#e7b844" stroke="${k}" stroke-width=".7">${epis}</g><path d="M26 39.5q6 3 12 0v4q-6 3-12 0z" fill="#9c2f24" stroke="${k}" stroke-width="1.1"/><path d="M30 41.5l-3 5M34 41.5l3 5" stroke="#9c2f24" stroke-width="1.6"/>`;

  // bois : pile de rondins vus de bout, cernes et écorce
  const rondin = (x, y, r) => {
    let c = `<circle cx="${x}" cy="${y}" r="${r}" fill="#6e4423" stroke="${k}" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="${r - 2}" fill="#e2c08a" stroke="${k}" stroke-width=".7"/>`;
    for (let q = r - 4.5; q > 1; q -= 2.4) c += `<circle cx="${x + .5}" cy="${y - .4}" r="${f(q)}" fill="none" stroke="#a4743e" stroke-width=".7"/>`;
    c += `<circle cx="${x + .5}" cy="${y - .4}" r="1" fill="#7a4e26"/><path d="M${x + .5} ${y - .4}l${f(r * .55)} ${f(-r * .3)}" stroke="#7a4e26" stroke-width=".7"/>`;
    return c;
  };
  const bois = `<ellipse cx="32" cy="58" rx="27" ry="3" fill="${k}" opacity=".18"/>`
    + `<path d="M8 56l48 0" stroke="${k}" stroke-width="1"/>`
    + [[13, 47, 9], [32, 47, 9.5], [51, 47, 9], [22.5, 31, 9], [41.5, 31, 9], [32, 15.5, 8.5]].map((p) => rondin(...p)).join('')
;

  // pierre : blocs taillés, trois faces ombrées, traces de ciseau
  const bloc = (x, y, w, h, d) => {
    const top = `M${x} ${y}l${d} ${-d * .6}h${w}l${-d} ${d * .6}z`;
    const face = `M${x} ${y}h${w}v${h}h${-w}z`;
    const cote = `M${x + w} ${y}l${d} ${-d * .6}v${h}l${-d} ${d * .6}z`;
    let traits = '';
    for (let i = 3; i < w; i += 3) traits += `<path d="M${x + i} ${y + 2}l-1 ${h - 4}" stroke="${k}" stroke-width=".45" opacity=".55"/>`;
    for (let i = 2; i < h; i += 2.2) traits += `<path d="M${x + w + 1} ${y + i - .3}l${d - 2} ${-(d - 2) * .6}" stroke="${k}" stroke-width=".5" opacity=".7"/>`;
    return `<path d="${face}" fill="#cfc6b4" stroke="${k}" stroke-width="1.3"/><path d="${cote}" fill="#9d9584" stroke="${k}" stroke-width="1.3"/><path d="${top}" fill="#e8e1d1" stroke="${k}" stroke-width="1.3"/>${traits}`;
  };
  const pierre = `<ellipse cx="33" cy="58" rx="27" ry="3" fill="${k}" opacity=".18"/>`
    + bloc(5, 42, 24, 14, 7) + bloc(31, 42, 24, 14, 7) + bloc(17, 26, 26, 14, 7)
    + `<path d="M7 57l3-2 2 2" fill="#9d9584" stroke="${k}" stroke-width=".8"/><circle cx="58" cy="57" r="1.4" fill="#b9b2a2" stroke="${k}" stroke-width=".6"/><circle cx="54.5" cy="58" r="1" fill="#b9b2a2" stroke="${k}" stroke-width=".6"/>`
;

  // drap : pièce roulée, un pan déroulé qui retombe en plis, lisière brodée
  const drap = `<ellipse cx="32" cy="58.5" rx="26" ry="3" fill="${k}" opacity=".18"/>`
    + `<path d="M14 24h34c4 8 6 20 3 33H17c-4-12-6-23-3-33z" fill="#5c3159" stroke="${k}" stroke-width="1.4"/>`
    + `<path d="M22 26c-1 10 0 21 2 30M31 26c1 10 1 21 0 30M40 26c2 10 3 21 1 30" stroke="#3b1d39" stroke-width="1.6" fill="none"/>`
    + `<path d="M24 26c0 10 1 21 3 30M33 26c1 10 2 21 1 30" stroke="#8c5a88" stroke-width="1" fill="none"/>`
    + `<path d="M17 52h34" stroke="#d9a73c" stroke-width="2.2"/><path d="M17 52h34" stroke="${k}" stroke-width="2.2" stroke-dasharray="1 3" opacity=".5"/>`
    + `<path d="M17 57l1 3M21 57l1 3M25 57l0 3M29 57l0 3M33 57l0 3M37 57l0 3M41 57l-.5 3M45 57l-.5 3M49 57l-1 3" stroke="#d9a73c" stroke-width="1"/>`
    + `<rect x="10" y="10" width="44" height="16" rx="8" fill="#6d3c6a" stroke="${k}" stroke-width="1.5"/>`
    + `<path d="M16 10.5v15M48 10.5v15" stroke="#d9a73c" stroke-width="2"/><path d="M14 14h36M14 21h36" stroke="#8c5a88" stroke-width=".8"/>`
    + `<ellipse cx="10" cy="18" rx="4" ry="8" fill="#7d4a7a" stroke="${k}" stroke-width="1.3"/><path d="M10 18m-2.6 0a2.6 5.4 0 1 0 5.2 0a1.8 3.8 0 1 0 -3.6 0a1 2.2 0 1 0 2 0" fill="none" stroke="${k}" stroke-width=".8"/>`;
  const charrette = `<ellipse cx="30" cy="59" rx="26" ry="3" fill="${IK}" opacity=".18"/><path d="M40 31l21-8" stroke="${IK}" stroke-width="5" stroke-linecap="round"/><path d="M40 31l21-8" stroke="#b07a44" stroke-width="2.6" stroke-linecap="round"/><path d="M42 36l20-6" stroke="${IK}" stroke-width="5" stroke-linecap="round"/><path d="M42 36l20-6" stroke="#b07a44" stroke-width="2.6" stroke-linecap="round"/><path d="M10 22c-1-6 3-9 7-9s8 3 7 9z" fill="#d9c08a" stroke="${IK}" stroke-width="1.3"/><path d="M15 13.5l2-3 2 3" fill="none" stroke="${IK}" stroke-width="1.1"/><path d="M22 22c-1-7 3-10 8-10s9 3 8 10z" fill="#e3cc95" stroke="${IK}" stroke-width="1.3"/><path d="M28 12.5l2-3 2 3" fill="none" stroke="${IK}" stroke-width="1.1"/><rect x="34" y="16" width="12" height="7" rx="3.5" fill="#8a5a2b" stroke="${IK}" stroke-width="1.2"/><ellipse cx="45" cy="19.5" rx="2" ry="3.3" fill="#e2c08a" stroke="${IK}" stroke-width="1"/><path d="M3 21h44l-3 18H6z" fill="#a8692f" stroke="${IK}" stroke-width="2" stroke-linejoin="round"/><path d="M4 27h42M5 33h40" stroke="#6e4423" stroke-width="1.2"/><path d="M12 21v18M22 21v18M32 21v18M41 21v18" stroke="#6e4423" stroke-width="1"/><path d="M3 21h44" stroke="#c98a4c" stroke-width="1.2"/><path d="M7 25c3 .5 6 .5 9 0M25 30c4 .5 7 .5 10 0" stroke="#c98a4c" stroke-width=".6" fill="none"/><circle cx="24" cy="45" r="13" fill="#efe0c2" stroke="${IK}" stroke-width="2.2"/><circle cx="24" cy="45" r="10.7" fill="none" stroke="#7a4e26" stroke-width="1.3"/><path d="M24 45L34.7 45.0M24 45L32.6 51.3M24 45L27.3 55.1M24 45L20.7 55.1M24 45L15.4 51.3M24 45L13.3 45.0M24 45L15.4 38.7M24 45L20.7 34.9M24 45L27.3 34.9M24 45L32.6 38.7" stroke="#7a4e26" stroke-width="1.5"/><circle cx="24" cy="45" r="2.9" fill="#7a4e26" stroke="${IK}" stroke-width="1.1"/>`;
  return { grain, bois, pierre, drap, charrette };
})();
export const bien = (m, t) => GRANDS[m] && t >= 48
  ? `<svg viewBox="0 0 64 64" width="${t}" height="${t}" aria-hidden="true">${GRANDS[m]}</svg>`
  : `<svg viewBox="0 0 32 32" width="${t}" height="${t}" aria-hidden="true">${LOGOS[m]}</svg>`;
