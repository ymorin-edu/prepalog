// Le KIT DE DESSIN ISOMÉTRIQUE (05/10/2026, brief `docs/briefs/MOTEUR-vue-animation.md`, lot 1).
//
// Du SVG en 2D dessiné en perspective isométrique (30°) : aucune bibliothèque, aucune caméra, rien dans
// `vendor/` (la décision « pas de 3D » du 02/10 écartait WebGL, pas ceci). Le dessin vient de la maquette
// d'ENT-6.5 (`docs/briefs/france-boissons/animation-6.5-couloir-2temps.html`, validée « parfait » par
// Tristan) : mêmes constantes, mêmes teintes, pour que la vue la rejoue à l'identique.
//
// « KIT QUI GRANDIT » (décision de Tristan, 05/10) : une séance DÉCRIT sa scène en données (décor, charges,
// places) ; elle ne dessine jamais. Un objet qui manque (camion, transpalette, rack…) s'ajoute ICI, par la
// demande au moteur du brief de la séance qui en a besoin. Jamais de code de dessin dans `contenus/`.
//
// Deux usages prévus : la vue « animation à questions » (core/types/animation.js) et, plus tard, le mode
// « stockage de masse » du Plan d'entrepôt (ENT-6.5 §7.1). D'où un kit sans état : des fonctions qui
// rendent du texte SVG à partir d'une projection et d'une scène compilée.
//
// LA SCÈNE IMAGE. Sol, métal, palettes noires, chariot orange gardent leurs teintes en clair comme en
// sombre (une photo) ; la signalétique au sol (panneaux verts, flèche verte ENTRÉE, rouge SORTIE) est de
// la signalisation dessinée, pas un verdict de l'interface (exception notée dans docs/decisions.md).
//
// UNITÉ : une place de palette (1 × 1 au sol). x vers la droite-bas, y vers la gauche-bas (vers l'élève),
// z vers le haut. Les couloirs de stockage de masse partent du mur (y petit = fond) vers l'allée.

import { ech } from './texte.js';

/* ================================================================ projection */
const C30 = 0.866, S30 = 0.5, K1 = 1.2247, K2 = 0.7071;

// `unite` : pixels par place de palette ; `origine` : où tombe le point (0, 0, 0).
export function projection({ unite = 82, origine = [560, 150] } = {}) {
  const [OX, OY] = origine;
  const P = (x, y, z) => [OX + (x - y) * C30 * unite, OY + (x + y) * S30 * unite - z * unite];
  const pts = (a) => a.map((p) => P(...p).map((v) => v.toFixed(1)).join(',')).join(' ');
  const face = (a, fill, stroke = 'rgba(0,0,0,.25)') => `<polygon points="${pts(a)}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
  // Une boîte : ses trois faces visibles (avant-gauche, droite, dessus), couleurs [dessus, gauche, droite].
  const boite = (x, y, z, w, d, h, c) => face([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], c[1])
    + face([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], c[2])
    + face([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], c[0]);
  return { unite, P, pts, face, boite };
}

// À poser une fois dans le <svg> (le dégradé du métal des fûts).
export const DEFS = '<defs><linearGradient id="isoMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f979c"/><stop offset=".35" stop-color="#e6e9eb"/><stop offset=".7" stop-color="#b3bac0"/><stop offset="1" stop-color="#7f878c"/></linearGradient></defs>';

/* ===================================================== teintes nommées du kit */
// Couleurs de LOT : une petite palette choisie par nom dans le contenu (pas de code couleur libre).
// `t` = le texte de l'étiquette ; contraste ≥ 4,5 vérifié par la suite de tests (bloc animation).
export const LOTS_KIT = {
  jaune: { c: '#e5b800', t: '#1a1915' },
  bleu: { c: '#2f5f9e', t: '#ffffff' },
  gris: { c: '#d5d8da', t: '#1a1915' },
  ambre: { c: '#8a4f0f', t: '#ffffff' },
  violet: { c: '#5b3f8c', t: '#ffffff' },
};
// Le texte posé au sol près d'une charge (« posée en 1re ») : neutre, bonne façon, problème.
// Le vert d'un TEXTE au sol est plus sombre que celui de la flèche (#107c41 ne fait que 4,0 sur le sol) :
// contraste ≥ 4,5 sur le sol, l'allée et un couloir (vérifié par le bloc de tests animation).
export const VERT_TEXTE_SOL = '#0b6634';
export const TONS_SOL = { neutre: '#1a1915', ok: VERT_TEXTE_SOL, alerte: '#9d2727' };

/* ================================================================== la scène */
// Les types connus. Un type inconnu empêche la séance de se charger (message clair) : on ne découvre
// pas en classe qu'un objet ne se dessine pas.
export const TYPES_DECOR = ['sol', 'mur', 'allee', 'couloirMasse', 'reperesProfondeur', 'texteSol', 'zone', 'quai'];
export const TYPES_CHARGE = ['retention'];
export const TYPES_ACTEUR = ['chariotFrontal'];
// Les gestes de chaque acteur (d'autres arriveront avec d'autres acteurs).
export const GESTES = { chariotFrontal: ['poser', 'reprendre'] };

// Le nom des places d'un couloir, du fond vers l'allée : toujours `1` à `n`, et des noms parlants.
export function nomsPlaces(n) {
  if (n === 3) return ['fond', 'milieu', 'devant'];
  if (n === 2) return ['fond', 'devant'];
  if (n === 1) return ['devant'];
  return Array.from({ length: n }, (_, k) => (k === 0 ? 'fond' : k === n - 1 ? 'devant' : null));
}

// Compile la scène déclarée : couloirs, places nommées (« M01.fond », « M01.1 »…), lots, acteurs.
// `ou` préfixe les messages d'erreur (« animation fb-fifo »).
export function compilerScene(S, ou = 'scène') {
  const err = (m) => { throw new Error(`${ou} : ${m}`); };
  if (!S || !Array.isArray(S.decor)) err('`scene.decor` manque (une liste d\'objets de décor)');
  const couloirs = [], places = {};
  let mur = null;
  S.decor.forEach((d, i) => {
    if (!d || !TYPES_DECOR.includes(d.type)) err(`décor n° ${i + 1} : type inconnu « ${d && d.type} » (types du kit : ${TYPES_DECOR.join(', ')})`);
    if (d.type === 'mur') mur = d;
    if (d.type === 'couloirMasse') {
      if (!d.id) err(`décor n° ${i + 1} : un couloir de masse a besoin d'un \`id\``);
      if (couloirs.some((c) => c.id === d.id)) err(`couloir « ${d.id} » déclaré deux fois`);
      const n = d.profondeur | 0;
      if (n < 1) err(`couloir « ${d.id} » : \`profondeur\` (nombre de places) manque`);
      const c = { id: d.id, x: +d.x || 0, y: +d.y || 0, n };
      couloirs.push(c);
      const noms = nomsPlaces(n);
      for (let k = 0; k < n; k++) {
        const pl = { couloir: c, rang: k, x: c.x, y: c.y + k };
        places[`${d.id}.${k + 1}`] = pl;
        if (noms[k]) places[`${d.id}.${noms[k]}`] = pl;
      }
    }
  });
  S.decor.forEach((d) => {
    if (d.type === 'reperesProfondeur' && !couloirs.some((c) => c.id === d.couloir)) err(`repères de profondeur : couloir inconnu « ${d.couloir} »`);
  });
  const lots = {};
  Object.entries(S.lots || {}).forEach(([id, l]) => {
    const t = LOTS_KIT[l && l.couleur];
    if (!t) err(`lot ${id} : couleur inconnue « ${l && l.couleur} » (couleurs du kit : ${Object.keys(LOTS_KIT).join(', ')})`);
    lots[id] = t;
  });
  const acteurs = {};
  Object.entries(S.acteurs || {}).forEach(([id, a]) => {
    if (!a || !TYPES_ACTEUR.includes(a.type)) err(`acteur « ${id} » : type inconnu « ${a && a.type} » (acteurs du kit : ${TYPES_ACTEUR.join(', ')})`);
    acteurs[id] = { id, type: a.type };
  });
  const xMax = couloirs.length ? Math.max(...couloirs.map((c) => c.x)) : 0;
  return {
    decor: S.decor, couloirs, places, lots, acteurs, mur,
    // Où le chariot attend, hors du cadre, dans l'axe d'un couloir.
    dehors: (c) => c.y + c.n + 3.6,
    // Une étiquette au sol va à droite de la charge, sauf dans le couloir le plus à droite (au-dessus).
    aDroite: (x) => x < xMax - 0.01,
    couloirEn: (x) => couloirs.find((c) => Math.abs(c.x - x) < 0.01) || null,
  };
}

/* =================================================================== le décor */
// Les deux tons d'une zone au sol : réception (jaune, comme les quais), litiges (ambre). Teintes fixes : la scène est une image.
const ZONES_SOL = { reception: { fond: 'rgba(229,184,0,.13)', trait: '#c9a200' }, litiges: { fond: 'rgba(138,79,15,.09)', trait: '#8a4f0f' } };
export function dessinerDecor(I, sc) {
  const { P, pts, face, boite } = I;
  const yMur = sc.mur ? sc.mur.y : null;
  let s = '';
  for (const d of sc.decor) {
    if (d.type === 'sol') {
      const [x0, y0] = d.de, [x1, y1] = d.a;
      s += face([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], '#e4dfd3', '#c9c3b6');
    } else if (d.type === 'mur') {
      const ep = d.epaisseur || 0.25;
      s += boite(d.de, d.y - ep, 0, d.a - d.de, ep, d.hauteur || 1.1, ['#b9b3a6', '#c9c3b6', '#a9a397']);
    } else if (d.type === 'allee') {
      const [x0, y0] = d.de, [x1, y1] = d.a;
      s += face([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], '#efeadf', 'none');
    } else if (d.type === 'couloirMasse') {
      const c = sc.couloirs.find((k) => k.id === d.id), x = c.x, y = c.y, n = c.n;
      // `panneauCode` : voir plus bas. `reserve: true` : un couloir réservé (les fûts vides rendus par les clients), au sol teinté (stockage de masse, D-5).
      s += face([[x - .05, y - .05, 0], [x + 1.05, y - .05, 0], [x + 1.05, y + n + .05, 0], [x - .05, y + n + .05, 0]], d.reserve ? '#e9e3ec' : '#f6f2e9', '#b9b3a6');
      for (let k = 0; k < n; k++) s += `<polygon points="${pts([[x + .08, y + k + .08, 0], [x + .92, y + k + .08, 0], [x + .92, y + k + .92, 0], [x + .08, y + k + .92, 0]])}" fill="none" stroke="#c9c3b6" stroke-dasharray="5 4"/>`;
      // Le panneau du couloir, sur le mur du fond (ou juste derrière la première place s'il n'y a pas de mur).
      if (d.panneau) {
        const ym = yMur != null ? yMur : y - 0.5;
        // `panneauZ` : [bas, haut] du panneau (stockage de masse, D-5 : au-dessus des piles, sur un mur plus haut).
        const [z0, z1] = d.panneauZ || [.45, .85];
        s += face([[x + .15, ym, z0], [x + .85, ym, z0], [x + .85, ym, z1], [x + .15, ym, z1]], '#1f5f3a', '#0f3d24');
        const [lx, ly] = P(x + .5, ym, (z0 + z1) / 2);
        const fs = d.panneauTaille || 17;   // `panneauTaille` : la taille du texte (une scène dessinée plus petite)
        if (d.panneauCode == null) s += `<text x="${lx}" y="${ly + fs * .35}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="#fff" transform="rotate(30 ${lx} ${ly})">${ech(d.panneau)}</text>`;
        else {
          // `panneauCode` (comptage, chantier D-6) : le nom du couloir en haut, et dessous, sur une plaque claire, le code de
          // contrôle que l'élève lit pour prouver au terminal qu'il est devant le bon couloir.
          const [hx, hy] = P(x + .5, ym, z0 + (z1 - z0) * .72), [bx, by] = P(x + .5, ym, z0 + (z1 - z0) * .27);
          // `skewY(30)` : le texte et la plaque sont posés À PLAT sur le mur (les verticales restent verticales).
          s += `<text transform="translate(${hx} ${hy}) skewY(30)" y="${fs * .35}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="#fff">${ech(d.panneau)}</text>`;
          s += `<g transform="translate(${bx} ${by}) skewY(30)"><rect x="${-fs * 1.05}" y="${-fs * .62}" width="${fs * 2.1}" height="${fs * 1.24}" rx="3" fill="#f4f1ea" stroke="#0f3d24"/>`
            + `<text y="${fs * .36}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="#1a1915" data-pm-code>${ech(d.panneauCode)}</text></g>`;
        }
      }
      // Flèche verte = entrée (côté gauche du couloir), flèche rouge = sortie (côté droit).
      if (d.fleches) {
        const b = y + n;
        s += face([[x + .22, b + .95, 0], [x + .38, b + .95, 0], [x + .38, b + .45, 0], [x + .48, b + .45, 0], [x + .3, b + .15, 0], [x + .12, b + .45, 0], [x + .22, b + .45, 0]], '#107c41', 'none');
        s += face([[x + .62, b + .15, 0], [x + .78, b + .15, 0], [x + .78, b + .65, 0], [x + .88, b + .65, 0], [x + .7, b + .95, 0], [x + .52, b + .65, 0], [x + .62, b + .65, 0]], '#9d2727', 'none');
        // `mots: false` : la flèche seule (le stockage de masse n'écrit ENTRÉE / SORTIE que sous le premier couloir).
        if (d.mots === false) continue;
        const [gx, gy] = P(x + .3, b + 1.15, 0);
        s += `<text x="${gx}" y="${gy + 6}" text-anchor="middle" font-size="12" font-weight="800" fill="${VERT_TEXTE_SOL}">ENTRÉE</text>`;
        const [rx, ry] = P(x + .85, b + 1.25, 0);
        s += `<text x="${rx + 4}" y="${ry + 10}" text-anchor="middle" font-size="12" font-weight="800" fill="#9d2727">SORTIE</text>`;
      }
    } else if (d.type === 'reperesProfondeur') {
      // « fond / milieu / devant » écrits au sol, à droite d'un couloir.
      const c = sc.couloirs.find((k) => k.id === d.couloir);
      nomsPlaces(c.n).forEach((t, k) => {
        if (!t) return;
        const [px, py] = P(c.x + 1.12, c.y + k + .5, 0);
        s += `<text x="${px + 6}" y="${py + 5}" font-size="13" font-weight="700" fill="#555047">${ech(t)}</text>`;
      });
    } else if (d.type === 'zone') {
      // Une zone au sol (stockage de masse, D-5) : `ton` 'reception' (bordure jaune) ou 'litiges' (bordure ambre),
      // son titre et une ligne de plus écrits au sol, le long du bord du fond. Aucun rouge : le rouge dirait « faux ».
      const [x0, y0] = d.de, [x1, y1] = d.a, T = ZONES_SOL[d.ton] || ZONES_SOL.reception;
      s += `<polygon points="${pts([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]])}" fill="${T.fond}" stroke="${T.trait}" stroke-width="2.5" stroke-dasharray="8 5"/>`;
      // Le texte va le long du bord AVANT (côté allée) : ce qui est posé dans la zone ne le cache pas.
      const [tx, ty] = P(x0 + .12, y1 - .22, 0);
      if (d.titre || d.ligne) s += `<text x="${tx}" y="${ty}" font-size="13" font-weight="800" fill="#1a1915" transform="rotate(30 ${tx} ${ty})">${ech(d.titre || '')}${d.ligne ? `<tspan font-size="11.5" font-weight="600" fill="#3d3a33">${d.titre ? ' — ' : ''}${ech(d.ligne)}</tspan>` : ''}</text>`;
    } else if (d.type === 'quai') {
      // Une porte de quai au bord du bâtiment (stockage de masse, D-5) : une plaque jaune au sol et son nom.
      const [x0, y0] = d.de, w = d.largeur || 1.6;
      s += face([[x0, y0, 0], [x0 + w, y0, 0], [x0 + w, y0 + .45, 0], [x0, y0 + .45, 0]], '#e5b800', '#8a6d00');
      const [qx, qy] = P(x0 + w / 2, y0 + .23, 0);
      s += `<text x="${qx}" y="${qy + 4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1a1915" transform="rotate(30 ${qx} ${qy + 4})">${ech(d.texte || '')}</text>`;
    } else if (d.type === 'texteSol') {
      const [ax, ay] = P(d.en[0], d.en[1], 0);
      if (d.style === 'allee') {
        const rot = d.rotation != null ? d.rotation : 30;
        s += `<text x="${ax}" y="${ay + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#555047" letter-spacing="2" transform="rotate(${rot} ${ax} ${ay + 6})">${ech(d.texte)}</text>`;
      } else {
        s += `<text x="${ax + 6}" y="${ay + 5}" font-size="13" font-weight="700" fill="#555047"${d.rotation ? ` transform="rotate(${d.rotation} ${ax} ${ay})"` : ''}>${ech(d.texte)}</text>`;
      }
    }
  }
  return s;
}

// Le cadre du décor, calculé sans navigateur (secours quand `getBBox` n'est pas disponible) : les
// coins du sol, du mur et des couloirs projetés, plus une marge pour les textes.
export function bornesDecor(I, sc) {
  const L = [];
  for (const d of sc.decor) {
    if (d.type === 'sol' || d.type === 'allee' || d.type === 'zone') { const [x0, y0] = d.de, [x1, y1] = d.a; L.push([x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]); }
    if (d.type === 'mur') L.push([d.de, d.y - .25, d.hauteur || 1.1], [d.a, d.y, 0], [d.de, d.y, 0], [d.a, d.y - .25, d.hauteur || 1.1]);
  }
  sc.couloirs.forEach((c) => L.push([c.x, c.y, 0], [c.x + 1, c.y + c.n + 1.3, 0]));
  if (!L.length) L.push([0, 0, 0], [1, 1, 0]);
  const xy = L.map((p) => I.P(...p));
  const xs = xy.map((p) => p[0]), ys = xy.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) + 20 };
}

/* ============================================ palette de rétention et ses fûts */
const ZB = 0.2, KH = 0.46, KR = 0.2;

// `r` et `h` : le rayon et la hauteur du fût (par défaut ceux du kit ; la palette de fûts du quai les met à l'échelle).
function fut(I, cx, cy, z, r = KR, h = KH) {
  const { P, unite } = I;
  const [bx, by] = P(cx, cy, z), [tx, ty] = P(cx, cy, z + h), rx = r * unite * K1, ry = r * unite * K2;
  let g = `<path d="M${bx - rx},${by} L${tx - rx},${ty} L${tx + rx},${ty} L${bx + rx},${by} A${rx},${ry} 0 0 1 ${bx - rx},${by} Z" fill="url(#isoMetal)" stroke="#6f777c" stroke-width=".8"/>`;
  [0.22, 0.78].forEach((f) => { const yy = by + (ty - by) * f; g += `<path d="M${bx - rx},${yy} A${rx},${ry} 0 0 0 ${bx + rx},${yy}" fill="none" stroke="#7d858a" stroke-width="1.8"/>`; });
  return g + `<ellipse cx="${tx}" cy="${ty}" rx="${rx}" ry="${ry}" fill="#eef0f1" stroke="#7d858a"/><ellipse cx="${tx}" cy="${ty}" rx="${rx * .32}" ry="${ry * .32}" fill="#4a4f52"/>`;
}

// LA CHARGE DE LA SCÈNE (chantier D-5, 11/10/2026 : décision 52 de Tristan, qui remplace la 37) : la palette de rétention
// noire portant 8 fûts debout en quinconce 3-2-3, la même que celle du quai (`paletteFuts`, plus bas), réduite à une place
// de la scène (bac de 0,94 au milieu d'une place de 1). `futs` de 0 à 8 : les places vides sont les DERNIÈRES (l'avant
// droit d'abord), là où le manque se voit. Le bac a un côté de 0,94 : tout ce qui suit est à cette échelle.
const COTE_SCENE = 0.94;
export const FUTS_PALETTE = 8;
// Le dessus des fûts (pour viser une bulle au-dessus d'une charge) et la hauteur d'une palette GERBÉE : la suivante se
// pose sur les fûts de celle du dessous (stockage de masse), donc un niveau = la hauteur d'une palette chargée.
export const HAUT_RETENTION = (0.2 + 0.46 / 1.30) * COTE_SCENE;
export const HAUT_NIVEAU = HAUT_RETENTION + 0.02;

// Une charge posée ou portée. `p` : { x, y, z, charge: 'retention', futs (0-8, 8 par défaut), lot, etiq, etiqTon, alerte,
// fuite (le premier fût fuit vers l'avant : la zone litiges du stockage de masse) }.
// `sc` : la scène compilée (couleurs des lots, côté de l'étiquette). `o.sel` : la palette est cerclée d'un liseré.
export function dessinerCharge(I, p, sc, o = {}) {
  const { P } = I;
  const n = p.futs == null ? FUTS_PALETTE : p.futs;
  const pal = { futs: Array.from({ length: FUTS_PALETTE }, (_, k) => ({ no: k + 1, absent: k >= n, fuite: p.fuite && k === 0 ? 'S' : null })) };
  const m = (1 - COTE_SCENE) / 2;
  let g = paletteFuts(I, pal, p.x + m, p.y + m, 0, { cote: COTE_SCENE, z: p.z, dents: !!p.fuite });
  const [cx, cy] = P(p.x + .5, p.y + .5, p.z + HAUT_RETENTION + .12);
  if (!o.sansEtiquette) g += etiquetteCharge(I, p, sc, o);
  if (p.etiq) {
    const coul = TONS_SOL[p.etiqTon] || TONS_SOL.neutre;
    if (sc.aDroite(p.x)) { const [ex, ey] = P(p.x + 1.08, p.y + .62, 0); g += `<text x="${ex}" y="${ey}" font-size="13" font-weight="700" fill="${coul}">${ech(p.etiq)}</text>`; }
    else g += `<text x="${cx}" y="${cy - 30}" text-anchor="middle" font-size="13" font-weight="700" fill="${coul}">${ech(p.etiq)}</text>`;
  }
  if (p.alerte) g += `<circle cx="${cx + 44}" cy="${cy - 12}" r="15" fill="#9d2727"/><text x="${cx + 44}" y="${cy - 6}" text-anchor="middle" font-size="18" font-weight="800" fill="#fff">!</text>`;
  return g;
}

export const largeurEtiquette = (t) => Math.max(68, Math.round(String(t).length * 8.6 + 14));
// Le cadre à l'écran de l'étiquette d'une charge (le stockage de masse écarte celles qui se recouvrent) : { x, y, w, h }.
export function cadreEtiquette(I, p, t) {
  const [cx, cy] = I.P(p.x + .5, p.y + .5, p.z + HAUT_RETENTION + .12), w = largeurEtiquette(t);
  return { x: cx - w / 2, y: cy - 22, w, h: 22 };
}
// L'étiquette de lot d'une charge, seule : « lot S24 », ou le texte de `p.texte` (« VIDES », « P1 · S24 » : le stockage de
// masse) ; elle s'élargit avec lui. Le stockage de masse la pose APRÈS ce qu'il dessine sur une pile (`o.sansEtiquette` sur la
// charge), pour qu'aucune boîte de place ne la cache.
// `o.dy` : l'étiquette est remontée de dy pixels (une autre était à sa place) ; un trait la relie à sa charge.
export function etiquetteCharge(I, p, sc, o = {}) {
  const L = p.lot ? sc.lots[p.lot] : null;
  if (!L) return '';
  const [cx, cy0] = I.P(p.x + .5, p.y + .5, p.z + HAUT_RETENTION + .12), dy = o.dy || 0, cy = cy0 - dy;
  const t = p.texte != null ? String(p.texte) : `lot ${p.lot}`, w = largeurEtiquette(t);
  return (dy ? `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy0 - 2}" stroke="#3d3a33" stroke-width="1.5"/>` : '') + `<rect x="${cx - w / 2}" y="${cy - 22}" width="${w}" height="22" rx="5" fill="${L.c}" stroke="${o.sel ? '#107c41' : 'rgba(0,0,0,.35)'}" stroke-width="${o.sel ? 3 : 1}"/><text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="14" font-weight="800" fill="${L.t}">${ech(t)}</text>`;
}

/* ============================== chariot élévateur frontal (fourches vers le fond) */
// `c` : { x, y (bout des fourches), lev (hauteur des fourches), charge (une charge portée ou null) }.
// Le cariste est une silhouette SANS VISAGE (règle du projet).
// Options ajoutées pour le quai iso (chantier D-4, étape 5 ; sans elles, le dessin est celui de la scène animation, au caractère près) :
//   `c.chargeSvg` : un dessin déjà fait (la palette du quai, sur ses fourches), posé à la place de `charge` ;
//   `c.coupe` : { yMin, yMax }, dans le repère du chariot : les boîtes sont coupées à cette tranche (le mur du quai) et un objet rond
//     (roue, cariste) n'est dessiné que si son centre y est ;
//   `c.gilet` : le cariste porte le gilet jaune du kit (comme `personne`), la tête de peau et de cheveux, vue de dos, sans visage.
// Les éléments dessinés en pixels (tête, buste du cariste) suivent `I.unite` : à l'échelle de la scène animation (82), ils valent ce qu'ils valaient.
export function dessinerChariotFrontal(I, c, sc) {
  const { P } = I;
  const coupe = c.coupe || null;
  const boite = coupe ? (bx, by, bz, bw, bd, bh, bc) => boiteY(I, bx, by, bz, bw, bd, bh, bc, coupe.yMin, coupe.yMax) : I.boite;
  const ici = (yy) => !coupe || (yy >= coupe.yMin && yy < coupe.yMax);
  const kp = I.unite / 82, kg = c.gilet ? kp * 1.3 : kp;   // le cariste au gilet est un peu agrandi : à l'échelle du quai, le jaune doit se voir
  const x = c.x, y = c.y, l = c.lev;
  let g = '';
  // fourches (au fond, dessinées d'abord)
  g += boite(x + .2, y, l, .12, 1.02, .05, ['#4a4f52', '#33373a', '#2a2e30']) + boite(x + .68, y, l, .12, 1.02, .05, ['#4a4f52', '#33373a', '#2a2e30']);
  if (c.chargeSvg) g += c.chargeSvg;
  else if (c.charge) g += dessinerCharge(I, Object.assign({}, c.charge, { x, y, z: l + .05 }), sc);
  // mât
  g += boite(x + .1, y + 1.02, 0, .1, .1, 2.1, ['#5a5f62', '#45494c', '#3a3e41']) + boite(x + .8, y + 1.02, 0, .1, .1, 2.1, ['#5a5f62', '#45494c', '#3a3e41']);
  g += boite(x + .1, y + 1.02, 2.0, .8, .1, .1, ['#5a5f62', '#45494c', '#3a3e41']);
  g += boite(x + .18, y + 1.0, l, .64, .06, .32, ['#4a4f52', '#3a3e41', '#33373a']); // tablier
  // roues côté gauche (cachées en partie par la caisse) : rondes (06/10/2026, ENT-1.1 §7.9)
  if (ici(y + 1.36)) g += roue(I, x + .04, y + 1.36, .15, .15, .12);
  if (ici(y + 1.9)) g += roue(I, x + .04, y + 1.9, .15, .15, .12);
  // caisse et contrepoids
  g += boite(x + .1, y + 1.12, .12, .8, .75, .55, ['#e58a2a', '#d97a1c', '#b5631a']);
  g += boite(x + .1, y + 1.85, .12, .8, .3, .75, ['#c86d18', '#b5631a', '#9a5415']);
  // siège + cariste (silhouette sans visage)
  g += boite(x + .32, y + 1.5, .67, .36, .3, .12, ['#2a2d2f', '#1d1f20', '#151718']);
  if (ici(y + 1.55)) {
    const [hx, hy] = P(x + .5, y + 1.55, 1.25);
    if (c.gilet) {
      // vu de dos : gilet jaune à bandes, bras sur le volant, nuque et cheveux (aucun trait du visage)
      g += `<path d="M${hx - 14 * kg},${hy + 34 * kg} Q${hx},${hy + 4 * kg} ${hx + 14 * kg},${hy + 34 * kg} Z" fill="#f0c419"/>`
        + `<rect x="${hx - 11.5 * kg}" y="${hy + 17 * kg}" width="${23 * kg}" height="${3 * kg}" fill="#e6e8e8"/>`
        + `<rect x="${hx - 13 * kg}" y="${hy + 25 * kg}" width="${26 * kg}" height="${3 * kg}" fill="#e6e8e8"/>`
        + `<circle cx="${hx}" cy="${hy}" r="${10 * kg}" fill="#c99a76"/>`
        + `<path d="M${hx - 10 * kg},${hy} A${10 * kg},${10 * kg} 0 0 1 ${hx + 10 * kg},${hy} Q${hx},${hy + 7 * kg} ${hx - 10 * kg},${hy} Z" fill="#3a2a1f"/>`;
    } else g += `<path d="M${hx - 14 * kp},${hy + 34 * kp} Q${hx},${hy + 4 * kp} ${hx + 14 * kp},${hy + 34 * kp} Z" fill="#33393d"/><circle cx="${hx}" cy="${hy}" r="${10 * kp}" fill="#33393d"/>`;
  }
  // roues côté droit (devant)
  if (ici(y + 1.36)) g += roue(I, x + .86, y + 1.36, .15, .15, .12);
  if (ici(y + 1.9)) g += roue(I, x + .86, y + 1.9, .15, .15, .12);
  // protège-conducteur
  [[.14, 1.2], [.82, 1.2], [.14, 1.95], [.82, 1.95]].forEach(([a, b]) => { g += boite(x + a, y + b, .67, .05, .05, 1.0, ['#3a3e41', '#2a2e30', '#222527']); });
  g += boite(x + .12, y + 1.18, 1.67, .78, .84, .05, ['#3a3e41', '#2a2e30', '#222527']);
  return g;
}

/* ===================================================== les objets mobiles */
// Les charges visibles du fond vers l'avant (et de gauche à droite), puis les acteurs.
export function dessinerObjets(I, sc, charges, acteurs) {
  const portees = new Set(acteurs.map((a) => a.charge).filter(Boolean));
  const ps = charges.filter((p) => p.visible && !portees.has(p)).sort((a, b) => (a.x + a.y) - (b.x + b.y) || (a.z || 0) - (b.z || 0));
  let s = ps.map((p) => dessinerCharge(I, p, sc)).join('');
  for (const a of acteurs) if (a.visible && a.type === 'chariotFrontal') s += dessinerChariotFrontal(I, a, sc);
  return s;
}

/* ============================================================ les roues */
// Une roue d'axe x (06/10/2026, ENT-1.1 §7.9 : « les roues, rondes ») : un cercle dans le plan du flanc,
// centre (y, z), rayon r, largeur l, projeté par la matrice du flanc (y → (−cos 30, sin 30), z → (0, −1)) :
// une ellipse, jamais une boîte. Des cercles intermédiaires donnent l'épaisseur de la bande de roulement,
// le moyeu est sur la face extérieure (x + l). Tout véhicule du kit s'en sert.
export function roue(I, x, y, z, r, l) {
  const u = I.unite;
  const M = (xx) => { const [ex, ey] = I.P(xx, y, z); return `matrix(${(-C30 * u).toFixed(3)},${(S30 * u).toFixed(3)},0,${(-u).toFixed(3)},${ex.toFixed(1)},${ey.toFixed(1)})`; };
  let g = '';
  for (let k = 0; k <= 4; k++) g += `<circle r="${r}" transform="${M(x + l * k / 4)}" fill="#141617" stroke="#0b0c0d" stroke-width="${(0.6 / u).toFixed(4)}"/>`;
  g += `<circle r="${(r * .55).toFixed(3)}" transform="${M(x + l)}" fill="#8d9397" stroke="#5c6266" stroke-width="${(1 / u).toFixed(4)}"/>`;
  g += `<circle r="${(r * .18).toFixed(3)}" transform="${M(x + l + 0.001)}" fill="#3a3e41"/>`;
  return g;
}

/* ================================================ le quai de réception (2D iso) */
// Les objets du quai d'ENT-1.1 (06/10/2026, brief `docs/briefs/ENT-1.1-spartoo-quai.md` §7.8), repris de la
// maquette validée par Tristan (`docs/briefs/spartoo/maquette-quai-spartoo-iso.html`) : façade et portes de
// quai, camion porteur, porte sectionnelle, niveleur, intérieur de remorque, transpalette manuel, personne
// debout, bulle de parole, palette EUR chargée de cartons qu'on fait tourner. Unité : le MÈTRE (une palette
// EUR = 1,2 × 0,8). La vue quai (`rendu: 'iso'`) les assemble ; un contenu ne dessine jamais.
//
// RÈGLE DE PROFONDEUR (Tristan, 06/10 : « on voit à travers le mur ») : ce qui est dans la remorque ne se
// voit que par l'ouverture (clip) ; un objet qui passe la porte est coupé au plan du mur (`boiteY`) ; le
// niveleur se dessine avec le sol, avant tout ce qui roule ou marche dessus.

// Une boîte coupée à un intervalle de y (la palette qui passe la porte).
export function boiteY(I, x, y, z, w, d, h, c, yMin = -99, yMax = 99) {
  const y0 = Math.max(y, yMin), y1 = Math.min(y + d, yMax);
  return y1 <= y0 + 1e-6 ? '' : I.boite(x, y0, z, w, y1 - y0, h, c);
}

// Une personne debout (1,75 m), vue de trois quarts, SANS TRAITS DU VISAGE (règle du projet) mais avec un
// corps humain (Tristan, 06/10) : chaussures, deux jambes, pantalon de travail, gilet haute visibilité à
// bandes, bras et mains, cou, cheveux. `o.main` : point écran [x, y] que tient la main droite (le timon) ;
// `o.pas` : phase de marche (0-1) ; `o.dos` : vue de dos.
export function personne(I, x, y, o = {}) {
  const [fx, fy] = I.P(x, y, 0), k = I.unite * 1.75 / 100;
  const X = (v) => (fx + v * k).toFixed(1), Y = (v) => (fy - v * k).toFixed(1), n = (v) => (v * k).toFixed(2);
  const peau = '#c99a76', peauOmbre = '#b3876a', pant = '#2e3b4c', pantOmbre = '#253140', gil = '#f0c419', gilOmbre = '#d6ad10', band = '#e6e8e8', t = '#30363b';
  const ec = (o.pas == null ? 0 : Math.sin(o.pas * Math.PI * 2)) * 4;
  let g = `<ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="${n(13)}" ry="${n(5)}" fill="rgba(0,0,0,.2)"/>`;
  g += `<path d="M${X(-6.5 - ec)},${Y(1)} L${X(-7)},${Y(47)} L${X(-0.5)},${Y(47)} L${X(-1.5 - ec)},${Y(1)} Z" fill="${pantOmbre}"/>`;
  g += `<path d="M${X(1.5 + ec)},${Y(1)} L${X(0.5)},${Y(47)} L${X(7)},${Y(47)} L${X(6.5 + ec)},${Y(1)} Z" fill="${pant}"/>`;
  g += `<path d="M${X(-8.5 - ec)},${Y(0)} q0,${n(-4)} ${n(3)},${n(-4)} h${n(4)} v${n(4)} Z" fill="${t}"/>`;
  g += `<path d="M${X(0.5 + ec)},${Y(0)} q0,${n(-4)} ${n(3)},${n(-4)} h${n(4.5)} q${n(2)},0 ${n(2)},${n(4)} Z" fill="${t}"/>`;
  g += `<path d="M${X(-9)},${Y(78)} q${n(-3)},${n(12)} ${n(-2.5)},${n(30)}" stroke="${gilOmbre}" stroke-width="${n(5.5)}" stroke-linecap="round" fill="none"/>`;
  g += `<circle cx="${X(-11)}" cy="${Y(46)}" r="${n(2.6)}" fill="${peauOmbre}"/>`;
  g += `<path d="M${X(-9.5)},${Y(48)} L${X(-10.5)},${Y(79)} Q${X(-9)},${Y(84)} ${X(-3)},${Y(85)} L${X(3)},${Y(85)} Q${X(9)},${Y(84)} ${X(10.5)},${Y(79)} L${X(9.5)},${Y(48)} Z" fill="${gil}"/>`;
  g += `<path d="M${X(1)},${Y(48)} L${X(1)},${Y(85)} L${X(3)},${Y(85)} Q${X(9)},${Y(84)} ${X(10.5)},${Y(79)} L${X(9.5)},${Y(48)} Z" fill="${gilOmbre}" opacity=".55"/>`;
  [57, 66].forEach((v) => { g += `<rect x="${X(-10.2)}" y="${Y(v + 2.6)}" width="${n(20.4)}" height="${n(2.6)}" fill="${band}"/>`; });
  if (!o.dos) g += `<path d="M${X(-3)},${Y(85)} L${X(0)},${Y(77)} L${X(3)},${Y(85)} Z" fill="#3b4652"/>`;
  if (o.main) {
    const [mx, my] = o.main;
    g += `<path d="M${X(9)},${Y(79)} L${mx.toFixed(1)},${my.toFixed(1)}" stroke="${gil}" stroke-width="${n(5.5)}" stroke-linecap="round"/>`;
    g += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${n(2.8)}" fill="${peau}"/>`;
  } else {
    g += `<path d="M${X(9)},${Y(78)} q${n(3)},${n(12)} ${n(2.5)},${n(30)}" stroke="${gil}" stroke-width="${n(5.5)}" stroke-linecap="round" fill="none"/>`;
    g += `<circle cx="${X(11.5)}" cy="${Y(46)}" r="${n(2.6)}" fill="${peau}"/>`;
  }
  g += `<rect x="${X(-2.2)}" y="${Y(89)}" width="${n(4.4)}" height="${n(5)}" fill="${peauOmbre}"/>`;
  g += `<ellipse cx="${X(0)}" cy="${Y(93.5)}" rx="${n(5.3)}" ry="${n(6.4)}" fill="${peau}"/>`;
  g += o.dos ? `<ellipse cx="${X(0)}" cy="${Y(94.5)}" rx="${n(5.5)}" ry="${n(6)}" fill="#3a2a1f"/>`
    : `<path d="M${X(-5.4)},${Y(94)} Q${X(-5.8)},${Y(101)} ${X(0)},${Y(100.6)} Q${X(5.8)},${Y(101)} ${X(5.4)},${Y(94)} Q${X(3)},${Y(97.5)} ${X(-5.4)},${Y(94)} Z" fill="#3a2a1f"/>`;
  // Le préparateur guidé à la voix (D-7 lot 2, ENT-6.7) : `o.casque` (serre-tête, deux écouteurs, micro vers la bouche) et
  // `o.terminal` (le boîtier à la ceinture). Sans ces options, le dessin est celui d'avant, au caractère près.
  if (o.casque) {
    g += `<g data-iso-casque><path d="M${X(-5.9)},${Y(93)} Q${X(-6.4)},${Y(103.5)} ${X(0)},${Y(103)} Q${X(6.4)},${Y(103.5)} ${X(5.9)},${Y(93)}" fill="none" stroke="#23272b" stroke-width="${n(1.5)}"/>`;
    [-5.9, 5.9].forEach((v) => { g += `<ellipse cx="${X(v)}" cy="${Y(92.5)}" rx="${n(1.7)}" ry="${n(2.6)}" fill="#23272b"/>`; });
    if (!o.dos) g += `<path d="M${X(5.9)},${Y(91)} Q${X(5)},${Y(88)} ${X(1.8)},${Y(88.6)}" fill="none" stroke="#23272b" stroke-width="${n(0.9)}"/><circle cx="${X(1.6)}" cy="${Y(88.6)}" r="${n(1)}" fill="#23272b"/>`;
    g += '</g>';
  }
  if (o.terminal) g += `<g data-iso-terminal><rect x="${X(5.5)}" y="${Y(56)}" width="${n(5)}" height="${n(7.5)}" rx="${n(1)}" fill="#23272b"/><rect x="${X(6.3)}" y="${Y(54.8)}" width="${n(3.4)}" height="${n(2.4)}" fill="#59636a"/></g>`;
  return g;
}
// Le point au-dessus de la tête d'une personne posée en (x, y) : là où pointe sa bulle.
export const HAUT_PERSONNE = 1.85;

// La largeur d'un texte de 14 px. Le navigateur la mesure ; hors navigateur (corrigés chargés par la suite
// de tests), une estimation suffit : la bulle n'y est jamais affichée.
let mesureur = null;
function largeurTexte(t) {
  if (mesureur === null) {
    try {
      const c = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
      if (c) c.font = '14px Inter, system-ui, "Segoe UI", Arial, sans-serif';
      mesureur = c || false;
    } catch (x) { mesureur = false; }
  }
  return mesureur ? mesureur.measureText(t).width : String(t).length * 7.4;
}
// Une bulle de parole (Tristan, 06/10) : largeur mesurée sur le texte, marges égales, coins arrondis, pointe
// vers la tête. (x, y) = la pointe ; la boîte s'ouvre vers la droite.
export function bulle(x, y, lignes) {
  const pad = 14, lh = 20, r = 12, q = 12;
  const W = Math.ceil(Math.max(...lignes.map(largeurTexte))) + pad * 2, H = lignes.length * lh + pad * 2 - 6;
  const bx = x - 34, by = y - 14 - H;
  const d = `M${bx + r},${by} H${bx + W - r} A${r},${r} 0 0 1 ${bx + W},${by + r} V${by + H - r} A${r},${r} 0 0 1 ${bx + W - r},${by + H} H${x + q} L${x},${y} L${x - q * 0.2},${by + H} H${bx + r} A${r},${r} 0 0 1 ${bx},${by + H - r} V${by + r} A${r},${r} 0 0 1 ${bx + r},${by} Z`;
  return `<g data-iso-bulle><path d="${d}" fill="rgba(0,0,0,.18)" transform="translate(2,3)"/><path d="${d}" fill="#fff" stroke="#2c2c2c" stroke-width="1.5"/>`
    + lignes.map((l, k) => `<text x="${bx + pad}" y="${by + pad + 11 + k * lh}" font-size="14" font-family="Inter, system-ui, 'Segoe UI', Arial, sans-serif" fill="#1a1a1a">${ech(l)}</text>`).join('') + '</g>';
}

// L'horloge murale du quai (afficheur à chiffres verts), posée sur un mur en (x, y, z).
export function horlogeQuai(I, x, y, z, t) {
  const [cx, cy] = I.P(x, y, z);
  return `<g data-iso-horloge><rect x="${(cx - 34).toFixed(1)}" y="${(cy - 15).toFixed(1)}" width="68" height="26" rx="4" fill="#111" stroke="#444"/><text x="${cx.toFixed(1)}" y="${(cy + 4).toFixed(1)}" text-anchor="middle" font-size="15" font-family="ui-monospace,Consolas,monospace" fill="#7CFC9A">${ech(t)}</text></g>`;
}

// La façade de l'entrepôt vue de la cour : trois portes de quai numérotées (`portes`, la 2e est celle du
// camion), leurs butoirs, la bande béton du quai, le marquage au sol et la porte « Accueil chauffeurs ».
// Les butoirs de la paire droite : [décalage en x depuis le bord gauche de la porte, y, z, largeur, profondeur,
// hauteur], le haut (sur le mur) puis le bas (sur la bande béton). `FINS` = le dessin d'avant ; `EPAIS` = la même
// paire renforcée, utilisée seulement quand la séance règle les butoirs de cette porte.
const BUTOIRS_FINS = [[.99, 0, .75, .16, .12, .2], [.99, .35, .3, .16, .12, .3]];
const BUTOIRS_EPAIS = [[.99, 0, .7, .3, .16, .3], [.99, .35, .25, .3, .16, .6]];
// Options (D-4, ajoutées en dernier, défaut = le dessin d'avant) : `butoirs: { porte, etat }` règle les butoirs d'UNE
// porte (0, 1 ou 2) : 'absents' les retire tous les quatre ; 'enPlace' les dessine ; `essai` : voir `objetEssai`
// (le groupe entoure la paire DROITE, la seule qui dépasse du camion à quai : c'est elle que `boitesButoirs` donne).
export function facadeQuai(I, portes = ['6', '7', '8'], o = {}) {
  const { face, boite, pts, P } = I;
  const X = [1.0, 3.6, 6.2], noir = ['#111', '#1a1a1a', '#0c0c0c'];
  const bu = o.butoirs || null;
  const sans = (n) => !!bu && bu.porte === n && bu.etat === 'absents';
  const etatBu = bu && bu.etat === 'absents' ? 'absents' : 'enPlace';
  // La paire droite : plus épaisse (et débordant du côté de la caisse du camion) quand l'option règle cette porte,
  // pour qu'on la repère camion à quai ; entourée du groupe d'essai.
  const epais = (n) => !!bu && bu.porte === n && bu.etat !== 'absents';
  const droit = (n, dx, bas) => {
    const [a, y, z, w, d, h] = epais(n) ? BUTOIRS_EPAIS[bas ? 1 : 0] : BUTOIRS_FINS[bas ? 1 : 0];
    const s = boite(dx + a, y, z, w, d, h, noir);
    return bu && bu.porte === n ? objetEssai(o, 'butoirs', etatBu, s) : s;
  };
  let g = face([[-1.5, -0.4, 0], [10, -0.4, 0], [10, 8.5, 0], [-1.5, 8.5, 0]], '#bdb8ae', 'none');
  X.forEach((dx) => { g += face([[dx - .05, 0, 0], [dx, 0, 0], [dx, 5, 0], [dx - .05, 5, 0]], '#e7c628', 'none') + face([[dx + 1.2, 0, 0], [dx + 1.25, 0, 0], [dx + 1.25, 5, 0], [dx + 1.2, 5, 0]], '#e7c628', 'none'); });
  g += boite(-1, -0.5, 0, 10.5, 0.5, 2.75, ['#8d969b', '#aab2b7', '#949ca1']);
  for (let x = -0.8; x < 9.5; x += 0.35) g += `<polyline points="${pts([[x, 0, 0], [x, 0, 2.75]])}" stroke="rgba(0,0,0,.08)"/>`;
  X.forEach((dx, n) => {
    g += face([[dx - .12, 0.001, 0], [dx + 1.32, 0.001, 0], [dx + 1.32, 0.001, 2.2], [dx - .12, 0.001, 2.2]], '#2a2d30', 'none');
    g += face([[dx, 0.002, 0.95], [dx + 1.2, 0.002, 0.95], [dx + 1.2, 0.002, 2.08], [dx, 0.002, 2.08]], '#c4cacd', '#8d969b');
    for (let z = 1.12; z < 2.08; z += 0.2) g += `<polyline points="${pts([[dx, 0.003, z], [dx + 1.2, 0.003, z]])}" stroke="#98a1a6"/>`;
    if (!sans(n)) g += boite(dx + .05, 0, 0.75, .16, .12, .2, noir) + droit(n, dx, false);
    else g += objetEssai(o, 'butoirs', 'absents', '');
    g += face([[dx + .35, 0.004, 2.32], [dx + .85, 0.004, 2.32], [dx + .85, 0.004, 2.62], [dx + .35, 0.004, 2.62]], '#1f5f3a', '#0f3d24');
    const [lx, ly] = P(dx + .6, 0.004, 2.47);
    g += `<text x="${lx.toFixed(1)}" y="${(ly + 6).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" transform="rotate(30 ${lx.toFixed(1)} ${ly.toFixed(1)})">${ech(portes[n] || '')}</text>`;
  });
  g += boite(-1, 0, 0, 10.5, 0.35, 0.75, ['#a7a39b', '#b9b5ad', '#9a968e']);
  X.forEach((dx, n) => {
    if (!sans(n)) g += boite(dx + .05, 0.35, 0.3, .16, .12, .3, noir) + droit(n, dx, true);
    else g += objetEssai(o, 'butoirs', 'absents', '');
  });
  // `o.escalier` (10/10/2026) : la porte est posée sur la bande béton (z = 0,75) et on y monte par trois marches, la plus haute contre le quai.
  // Sans l'option : le dessin d'avant (porte au ras du sol).
  const ZP = o.escalier ? 0.75 : 0;
  if (o.escalier) [[0.35, 0.6], [0.6, 0.4], [0.85, 0.2]].forEach(([y, h]) => { g += boite(8.2, y, 0, 0.9, 0.25, h, ['#a7a39b', '#b9b5ad', '#9a968e']); });
  g += face([[8.3, 0.001, ZP], [8.95, 0.001, ZP], [8.95, 0.001, ZP + 1.5], [8.3, 0.001, ZP + 1.5]], '#3b4a55', 'none');
  const [ax, ay] = P(8.62, 0.002, ZP + 1.75);
  g += `<text x="${ax.toFixed(1)}" y="${ay.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#1d1d1b" transform="rotate(30 ${ax.toFixed(1)} ${ay.toFixed(1)})">Accueil chauffeurs</text>`;
  return g;
}
// Où se gare un camion à la porte n (0, 1, 2) de `facadeQuai` : son x.
export const X_PORTE_FACADE = [1.1, 3.7, 6.3];
// Les boîtes monde de la paire droite des butoirs de la porte n, en 'enPlace' (donc la paire renforcée : c'est
// le dessin que `facadeQuai` fait quand on lui règle les butoirs de cette porte).
export function boitesButoirs(porte) {
  const dx = [1.0, 3.6, 6.2][porte];
  return BUTOIRS_EPAIS.map(([a, y, z, w, d, h]) => [dx + a, y, z, dx + a + w, y + d, z + h]);
}

/* ------------------------------------------------ boîtes monde et zones à l'écran (chantier D-4) */
// Chaque objet de sécurité du quai (cabine, fumée, cale, butoirs, niveleur, lampe) expose ses BOÎTES MONDE
// `[x0, y0, z0, x1, y1, z1]` (mètres), calculées par les mêmes constantes que son dessin. `boiteEcran` les projette :
// c'est la ZONE où l'élève peut cliquer (étape 2 du chantier), et la page d'essai la dessine pour vérifier qu'un
// objet est bien là où sa zone le dit. Fonction pure : elle ne lit que la projection et les boîtes.

// Le rectangle écran { x, y, w, h } (unités du viewBox, arrondies au dixième) qui contient les huit coins de
// chaque boîte (une boîte seule `[x0, …, z1]` ou une liste de boîtes), agrandi de `marge` de chaque côté.
export function boiteEcran(I, boites, marge = 12) {
  const L = boites && typeof boites[0] === 'number' ? [boites] : (boites || []);
  if (!L.length) return null;
  const xs = [], ys = [];
  for (const [x0, y0, z0, x1, y1, z1] of L) {
    for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) { const [px, py] = I.P(x, y, z); xs.push(px); ys.push(py); }
  }
  const a = Math.min(...xs) - marge, b = Math.min(...ys) - marge, c = Math.max(...xs) + marge, d = Math.max(...ys) + marge;
  const r = (n) => Math.round(n * 10) / 10;
  return { x: r(a), y: r(b), w: r(c - a), h: r(d - b) };
}
// Option de MISE AU POINT `o.essai` : entoure chaque objet d'un <g data-essai-objet="…" data-etat="…">. Seules la
// page d'essai et les tests la passent (le quai, jamais) : aucun contenu élève ne nomme un objet dans le DOM.
const objetEssai = (o, nom, etat, s) => (o && o.essai ? `<g data-essai-objet="${nom}" data-etat="${etat}">${s}</g>` : s);

// Les vitres de la cabine du camion porteur (le pare-brise et la vitre latérale droite) : le dessin et les boîtes
// du chauffeur lisent les mêmes nombres. L'objet « cabine » de l'inspection est le pare-brise (et le chauffeur).
const CAB = { x0: .03, x1: .97, y0: 2.6, y1: 3.54, z0: .36, z1: 1.56 };
const PARE_BRISE = { x0: .1, x1: .9, y: 3.52, z0: 1.02, z1: 1.46 };
const VITRE_LAT = { x: .97, y0: 2.68, y1: 3.25, z0: 1.05, z1: 1.45 };
// La cale de roue (devant la roue arrière côté élève) et le pot d'échappement (arrière droit de la cabine).
// `y0` = la pointe de la cale, qui touche la bande de roulement de la roue arrière (pneu en y 1,06, rayon .19) ; `y1` = le dos
// vertical, à l'extérieur : la pente monte de la roue vers l'extérieur et passe SOUS le pneu (une vraie cale).
const CALE = { x0: .76, x1: 1.02, y0: 1.11, long: .44, haut: .22, bras: .3 };
const POT = { x: 1.0, y: 2.68, z1: 1.9 };

// Une ellipse posée dans un plan (vitre) : `plan(u, z)` donne le point monde, on la rend en polygone.
function ellipsePlan(I, plan, cu, cz, ru, rz, a0 = 0, a1 = Math.PI * 2, n = 22) {
  const L = [];
  for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; L.push(plan(cu + ru * Math.cos(a), cz + rz * Math.sin(a))); }
  return I.pts(L);
}
// Le chauffeur au volant : tête et épaules DERRIÈRE le pare-brise (collées dans le plan de la vitre), SANS TRAITS DU
// VISAGE (règle du projet), gilet jaune comme `personne`. Il est à gauche du camion (côté conducteur), donc au tiers
// gauche du pare-brise ; la vitre latérale reste sombre (deux silhouettes feraient deux chauffeurs).
function chauffeurCabine(I, x, yr) {
  const peau = '#c99a76', cheveux = '#3a2a1f', gil = '#f0c419', bande = '#e6e8e8';
  const pb = (u, z) => [x + u, yr + PARE_BRISE.y - .01, z];
  let g = '';
  g += `<polygon points="${I.pts([pb(.12, 1.02), pb(.68, 1.02), pb(.66, 1.1), pb(.58, 1.18), pb(.22, 1.18), pb(.14, 1.1)])}" fill="${gil}"/>`;
  g += `<polygon points="${I.pts([pb(.12, 1.055), pb(.675, 1.055), pb(.672, 1.09), pb(.124, 1.09)])}" fill="${bande}"/>`;
  g += `<polygon points="${I.pts([pb(.37, 1.18), pb(.47, 1.18), pb(.46, 1.23), pb(.38, 1.23)])}" fill="#b3876a"/>`;
  g += `<polygon points="${ellipsePlan(I, pb, .42, 1.305, .095, .115)}" fill="${peau}"/>`;
  g += `<polygon points="${ellipsePlan(I, pb, .42, 1.32, .102, .115, 0, Math.PI, 14)}" fill="${cheveux}"/>`;
  g += `<polygon points="${ellipsePlan(I, pb, .42, 1.075, .2, .05)}" fill="none" stroke="#1b1d1f" stroke-width="3"/>`;
  return g;
}
// La fumée d'échappement : un pot vertical (acier sombre) et trois bouffées grises translucides de classe
// `iso-fumee` (animées par `styles/quai.css`, immobiles et toujours dessinées en mouvement réduit). Les bouffées
// sont posées à des hauteurs étagées : à l'arrêt elles forment déjà une colonne.
function potEchappement(I, x, yr) {
  return I.boite(x + POT.x - .03, yr + POT.y - .03, .42, .06, .06, POT.z1 - .42, ['#7d858a', '#4a4f52', '#33373a']);
}
function fumeeEchappement(I, x, yr) {
  const [px, py] = I.P(x + POT.x, yr + POT.y, POT.z1 + .02), u = I.unite;
  let g = '';
  [0, 1, 2].forEach((k) => {
    const cx = px + u * (.05 + .07 * k), cy = py - u * (.2 + .3 * k), r = u * (.15 + .06 * k);
    g += `<circle class="iso-fumee" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="rgba(74,78,82,${(.82 - .17 * k).toFixed(2)})" style="--iso-dx:${(u * .14).toFixed(1)}px;--iso-dy:${(-u * .32).toFixed(1)}px;animation-delay:${(-k * .9).toFixed(1)}s"/>`;
  });
  return g;
}
// La cale de roue rouge à bras (D-4, étape 1 bis) : comme une vraie cale, la PENTE est tournée vers le pneu et passe sous
// lui (la pointe, à ras du sol, touche la bande de roulement), le DOS vertical est à l'extérieur, et le bras (poignée)
// part de ce dos vers l'élève. Quelques nervures sur la pente la rendent lisible. Rouge = signalisation (exception du
// kit), jamais un verdict.
function caleDeRoue(I, x, yr) {
  const { face, pts } = I;
  const x0 = x + CALE.x0, x1 = x + CALE.x1, y0 = yr + CALE.y0, y1 = y0 + CALE.long, h = CALE.haut;
  let g = face([[x0, y0, 0], [x1, y0, 0], [x1, y1, h], [x0, y1, h]], '#d93a2b', 'rgba(0,0,0,.35)');
  for (const f of [.3, .55, .8]) g += `<polyline points="${pts([[x0, y0 + CALE.long * f, h * f], [x1, y0 + CALE.long * f, h * f]])}" fill="none" stroke="rgba(90,12,6,.45)" stroke-width="1.5"/>`;
  g += face([[x1, y0, 0], [x1, y1, 0], [x1, y1, h]], '#a8291d', 'rgba(0,0,0,.35)');
  g += face([[x0, y1, 0], [x1, y1, 0], [x1, y1, h], [x0, y1, h]], '#bd3326', 'rgba(0,0,0,.35)');
  const xb = (x0 + x1) / 2;
  g += `<polyline points="${pts([[xb, y1, .16], [xb, y1 + .14, .24], [xb, y1 + CALE.bras, .3]])}" fill="none" stroke="#a8291d" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += `<polyline points="${pts([[xb - .06, y1 + CALE.bras, .3], [xb + .06, y1 + CALE.bras, .3]])}" fill="none" stroke="#7d1d14" stroke-width="5" stroke-linecap="round"/>`;
  return g;
}
// Les boîtes monde du camion (x, yr = comme `camionPorteur`) : `cabine` (le pare-brise, où l'on voit le chauffeur),
// `fumee` (la colonne au-dessus du pot, jusqu'au bout de la dérive animée), `cale` (l'emplacement devant la roue
// arrière, cale posée ou non : une cale absente laisse la zone là où elle devrait être).
export function boitesCamion(x, yr, o = {}) {
  return {
    cabine: [[x + PARE_BRISE.x0, yr + PARE_BRISE.y - .02, PARE_BRISE.z0, x + PARE_BRISE.x1, yr + PARE_BRISE.y, PARE_BRISE.z1]],
    // y plus petit = plus à droite à l'écran : la dérive des bouffées part vers la droite, sans descendre sur la cale.
    fumee: [[x + POT.x - .1, yr + POT.y - .5, POT.z1 + .1, x + POT.x + .3, yr + POT.y + .1, POT.z1 + 1.6]],
    cale: [[x + CALE.x0 - .03, yr + CALE.y0 - .02, 0, x + CALE.x1 + .03, yr + CALE.y0 + CALE.long + CALE.bras + .04, .36]],
  };
}

// Un camion porteur (caisse blanche, cabine bleue) en marche arrière vers la façade : (x, yr) = coin de
// l'arrière de la caisse. Roues rondes.
// Options (D-4, 10/10/2026 ; TOUJOURS ajoutées en dernier, le défaut est le dessin d'avant) :
//   `cabine` : 'vide' (défaut) | 'conduite' (le chauffeur au volant, sans visage) ;
//   `fumee`  : vrai = pot d'échappement et fumée ;
//   `cale`   : 'posee' (cale rouge à bras devant la roue arrière) | 'absente' | absent (rien n'est dessiné) ;
//   `essai`  : voir `objetEssai`.
export function camionPorteur(I, x, yr, o = {}) {
  const { boite, face, P } = I;
  let g = '';
  const [ox, oy] = P(x + .5, yr + 1.8, 0);
  g += `<ellipse cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" rx="${(I.unite * 1.9).toFixed(1)}" ry="${(I.unite * .75).toFixed(1)}" fill="rgba(0,0,0,.15)"/>`;
  [0.56, 1.06, 3.06].forEach((dy) => { g += roue(I, x + .04, yr + dy, .2, .19, .14) + roue(I, x + .82, yr + dy, .2, .19, .14); });
  g += boite(x + .1, yr, .33, .8, 3.5, .13, ['#3b3f42', '#2f3336', '#26292b']);
  g += boite(x, yr, .46, 1, 2.55, 1.5, ['#f4f4f1', '#e4e5e1', '#d3d5d0']);
  g += face([[x + 1, yr, .5], [x + 1, yr + 2.55, .5], [x + 1, yr + 2.55, .6], [x + 1, yr, .6]], '#2f5f8e', 'none');
  g += boite(x + .03, yr + 2.6, .36, .94, .92, 1.2, ['#3d6e9e', '#2f5f8e', '#284f78']);
  const cabine = o.cabine === 'conduite' ? 'conduite' : 'vide';
  const pareBrise = face([[x + PARE_BRISE.x0, yr + PARE_BRISE.y, PARE_BRISE.z0], [x + PARE_BRISE.x1, yr + PARE_BRISE.y, PARE_BRISE.z0], [x + PARE_BRISE.x1, yr + PARE_BRISE.y, PARE_BRISE.z1], [x + PARE_BRISE.x0, yr + PARE_BRISE.y, PARE_BRISE.z1]], '#1d2a35', 'none');
  const vitreLat = face([[x + VITRE_LAT.x, yr + VITRE_LAT.y0, VITRE_LAT.z0], [x + VITRE_LAT.x, yr + VITRE_LAT.y1, VITRE_LAT.z0], [x + VITRE_LAT.x, yr + VITRE_LAT.y1, VITRE_LAT.z1], [x + VITRE_LAT.x, yr + VITRE_LAT.y0, VITRE_LAT.z1]], '#1d2a35', 'none');
  g += objetEssai(o, 'cabine', cabine, pareBrise + (cabine === 'conduite' ? chauffeurCabine(I, x, yr) : '')) + vitreLat;
  g += face([[x + .15, yr + 3.53, .5], [x + .3, yr + 3.53, .5], [x + .3, yr + 3.53, .6], [x + .15, yr + 3.53, .6]], '#ffe8a3', 'none')
    + face([[x + .7, yr + 3.53, .5], [x + .85, yr + 3.53, .5], [x + .85, yr + 3.53, .6], [x + .7, yr + 3.53, .6]], '#ffe8a3', 'none');
  if (o.fumee) g += potEchappement(I, x, yr) + objetEssai(o, 'fumee', 'fumee', fumeeEchappement(I, x, yr));
  if (o.cale === 'posee') g += objetEssai(o, 'cale', 'posee', caleDeRoue(I, x, yr));
  else if (o.cale === 'absente') g += objetEssai(o, 'cale', 'absente', '');
  return g;
}

// L'ouverture de la porte de quai vue de l'intérieur : x de 2,4 à 3,6, y = 0 (plan du mur), 2,05 m de haut.
export const OUVERTURE_QUAI = { x0: 2.4, x1: 3.6, h: 2.05 };
// Le polygone de l'ouverture (pour un clipPath).
export const ouvertureQuai = (I) => I.pts([[2.4, 0, 0], [3.6, 0, 0], [3.6, 0, 2.05], [2.4, 0, 2.05]]);
// Le sol du quai côté entrepôt, avec la zone de réception marquée (pointillés jaunes, `nomZone` écrit au sol)
// et la bande jaune et noire du seuil.
// `o.zone` (D-4, étape 3, ajouté en dernier) : [x0, x1, y0, y1], la zone de réception d'un quai qui reçoit plusieurs
// palettes ; absent : la zone d'aujourd'hui (une palette), dessinée à l'identique.
// `o.sol` et `o.nomAuSol` (chantier E-5, lot 2, la dépose dirigée ; ajoutés en dernier, absents = le dessin d'avant, octet pour octet) :
// `o.sol` = [x0, x1, y1], un sol plus large que celui d'aujourd'hui (de −1,2 à 7,5 m, 6 m de profondeur) ; `o.nomAuSol` = [x, y], le nom
// de la zone écrit À PLAT au sol à partir de ce point (en mètres), au lieu d'en biais à droite de la zone.
export function solQuai(I, nomZone = 'Zone de réception', o = {}) {
  const { face, pts, P } = I;
  const [zx0, zx1, zy0, zy1] = o.zone || [2.35, 3.85, 1.9, 3.6];
  const [sx0, sx1, sy1] = o.sol || [-1.2, 7.5, 6];
  let g = face([[sx0, 0, 0], [sx1, 0, 0], [sx1, sy1, 0], [sx0, sy1, 0]], '#e4dfd3', '#c9c3b6');
  g += `<polygon data-iso-zone points="${pts([[zx0, zy0, 0], [zx1, zy0, 0], [zx1, zy1, 0], [zx0, zy1, 0]])}" fill="rgba(231,198,40,.12)" stroke="#d1a90f" stroke-width="3" stroke-dasharray="10 6"/>`;
  if (o.nomAuSol) {
    const [ox, oy] = P(0, 0, 0), [ax, ay] = P(1, 0, 0), [bx, by] = P(0, 1, 0), f = (v) => v.toFixed(3);
    g += `<g transform="matrix(${f(ax - ox)},${f(ay - oy)},${f(bx - ox)},${f(by - oy)},${ox.toFixed(1)},${oy.toFixed(1)})"><text data-iso-nom-zone x="${o.nomAuSol[0]}" y="${o.nomAuSol[1]}" font-size="0.3" font-weight="800" fill="#555047" font-family="Inter, system-ui, 'Segoe UI', Arial, sans-serif">${ech(String(nomZone).toUpperCase())}</text></g>`;
  } else {
    const [tx, ty] = o.zone ? P(zx1 + 0.15, (zy0 + zy1) / 2, 0) : P(4.0, 2.75, 0);
    g += `<text x="${(tx + 4).toFixed(1)}" y="${(ty + 4).toFixed(1)}" font-size="13" font-weight="800" fill="#555047" transform="rotate(-30 ${tx.toFixed(1)} ${ty.toFixed(1)})">${ech(String(nomZone).toUpperCase())}</text>`;
  }
  for (let k = 0; k < 8; k++) { const x = 2.4 + k * 0.15; g += face([[x, 0, 0], [x + 0.15, 0, 0], [x + 0.15, 0.18, 0], [x, 0.18, 0]], k % 2 ? '#1b1b1b' : '#e7c628', 'none'); }
  return g;
}
// Le niveleur de quai (plaque entre le quai et la remorque) : dessiné AVEC LE SOL, avant tout ce qui passe
// dessus. `part` : 'dedans' (dans la remorque, à clipper) ou 'dehors' (la partie devant le mur).
// `etat` (D-4, ajouté en dernier) : 'pose' (défaut : la plaque à plat, le dessin d'avant) | 'releve' (la plaque est
// dressée contre le seuil, sa lèvre en l'air, et il reste entre le quai et la remorque un VIDE sombre : un
// camion qui partirait ou un chariot qui passerait y tomberait). La partie 'dedans' (clippée à l'ouverture)
// dessine alors le vide, la partie 'dehors' la plaque dressée. `o.essai` : voir `objetEssai`.
export function niveleur(I, part = 'dedans', etat = 'pose', o = {}) {
  if (etat === 'releve') return objetEssai(o, 'niveleur', 'releve', part === 'dehors' ? plaqueRelevee(I) : videNiveleur(I));
  return objetEssai(o, 'niveleur', 'pose', niveleurPose(I, part));
}
// Les boîtes monde du niveleur : à plat, la plaque du quai à la remorque ; relevé, le vide et la plaque dressée.
export function boitesNiveleur(etat = 'pose') {
  return etat === 'releve' ? [[2.45, -0.3, -0.22, 3.55, 0.2, 0], [PLAQUE.x0, PLAQUE.yl, 0, PLAQUE.x1, PLAQUE.yb, PLAQUE.zl + 0.02]] : [[2.45, -0.6, 0, 3.55, 0.2, 0.03]];
}
// La plaque dressée : charnière côté quai (yb), sommet (yh, zh), lèvre en l'air (yl, zl).
const PLAQUE = { x0: 2.58, x1: 3.42, yb: 0.13, yh: 0, zh: 0.48, yl: -0.18, zl: 0.6 };
// Le vide laissé par le niveleur relevé : un trou sombre entre le plancher du quai et celui de la remorque.
function videNiveleur(I) {
  const { face } = I;
  return face([[2.45, -0.3, 0.004], [3.55, -0.3, 0.004], [3.55, 0.2, 0.004], [2.45, 0.2, 0.004]], '#0b0c0d', 'none')
    + face([[2.45, -0.3, 0.004], [3.55, -0.3, 0.004], [3.55, -0.3, -0.22], [2.45, -0.3, -0.22]], '#202427', 'none')
    + face([[2.45, -0.3, 0.004], [2.45, 0.2, 0.004], [2.45, 0.2, -0.22], [2.45, -0.3, -0.22]], '#15181a', 'none');
}
// La plaque dressée contre le seuil (charnière côté quai, y = 0,2), sa lèvre jaune et noire en l'air.
function plaqueRelevee(I) {
  const { face, pts } = I;
  const { x0, x1, yb, yh, zh, yl, zl } = PLAQUE;
  // la part du vide qui est de ce côté du mur (le reste est dessiné « dedans », dans l'ouverture)
  let g = face([[2.45, 0, 0.004], [3.55, 0, 0.004], [3.55, 0.2, 0.004], [2.45, 0.2, 0.004]], '#0b0c0d', 'none')
    + face([[2.45, 0, 0.004], [2.45, 0.2, 0.004], [2.45, 0.2, -0.22], [2.45, 0, -0.22]], '#15181a', 'none');
  g += face([[x1, yb, 0], [x1, yb, 0.05], [x1, yh, zh + 0.05], [x1, yh, zh]], '#6d7276', 'none');
  g += face([[x0, yb, 0.004], [x1, yb, 0.004], [x1, yh, zh], [x0, yh, zh]], '#8b9094', '#6d7276');
  for (let k = 1; k < 6; k++) { const t = k / 6; g += `<polyline points="${pts([[x0 + 0.05, yb + (yh - yb) * t, zh * t], [x1 - 0.05, yb + (yh - yb) * t, zh * t]])}" stroke="#7a7f83" stroke-width="1"/>`; }
  g += face([[x0, yh, zh], [x1, yh, zh], [x1, yl, zl], [x0, yl, zl]], '#a3a8ab', '#6d7276');
  for (let k = 0; k < 7; k++) {
    const a = x0 + k * (x1 - x0) / 7, b = a + (x1 - x0) / 7;
    g += face([[a, yh - 0.12, zh + 0.12 * (zl - zh) / (yh - yl)], [b, yh - 0.12, zh + 0.12 * (zl - zh) / (yh - yl)], [b, yl, zl], [a, yl, zl]], k % 2 ? '#1b1b1b' : '#e7c628', 'none');
  }
  return g;
}
function niveleurPose(I, part) {
  const { face, pts } = I;
  if (part === 'dehors') return face([[2.45, 0, 0.004], [3.55, 0, 0.004], [3.55, 0.2, 0.004], [2.45, 0.2, 0.004]], '#8b9094', '#6d7276');
  let g = face([[2.45, -0.6, 0.004], [3.55, -0.6, 0.004], [3.55, 0.2, 0.004], [2.45, 0.2, 0.004]], '#8b9094', '#6d7276');
  for (let k = 0; k < 7; k++) { const x = 2.45 + k * 1.1 / 7; g += face([[x, -0.6, 0.005], [x + 1.1 / 7, -0.6, 0.005], [x + 1.1 / 7, -0.5, 0.005], [x, -0.5, 0.005]], k % 2 ? '#1b1b1b' : '#e7c628', 'none'); }
  for (let y = -0.35; y < 0.2; y += 0.12) g += `<polyline points="${pts([[2.5, y, 0.005], [3.5, y, 0.005]])}" stroke="#7a7f83" stroke-width="1"/>`;
  return g;
}
// La lampe de quai, sur le mur à droite de l'ouverture, au-dessus de l'ouverture à la hauteur de l'enseigne (mètres) :
// socle `[x, y, z, largeur, profondeur, hauteur]`, bras (points), tête, et le point d'où part la lumière (le centre de
// la lentille, sur la face de la tête tournée vers l'élève : c'est elle qui s'allume ou reste noire).
const LAMPE = { base: [4.28, 0, 2.42, 0.14, 0.05, 0.2], bras: [[4.35, 0.05, 2.52], [4.35, 0.28, 2.6], [4.17, 0.32, 2.54]], tete: [4.0, 0.2, 2.4, 0.34, 0.26, 0.22], foyer: [4.17, 0.46, 2.51] };
// La lampe de quai (D-4) : une tête articulée sur un bras, fixée au mur à droite de l'ouverture, braquée vers
// l'intérieur de la remorque. `etat` : 'allumee' (défaut) | 'eteinte'. Rend `{ cone, tete }` : `cone` (le
// faisceau et sa flaque de lumière, vides si éteinte) se dessine DANS le clip de l'ouverture, avant les palettes ;
// `tete` (le bras, la tête, sa lentille) après `murQuai`. ALLUMÉE : lentille blanc chaud, halo en deux anneaux et
// rayons autour de la tête, faisceau franc mais pâle et translucide ; ÉTEINTE : lentille noire, rien autour. Jaune
// et blanc chauds seulement (de la lumière : ni vert ni rouge, jamais un verdict).
// `o.essai` : voir `objetEssai` (il entoure la tête et sa lentille, pas le halo ni le faisceau).
export function lampeQuai(I, etat = 'allumee', o = {}) {
  const { face, boite, pts, P } = I;
  const allumee = etat !== 'eteinte';
  const gris = ['#7d858a', '#5c6266', '#4a4f52'], noir = ['#4a4f52', '#33373a', '#2a2e30'];
  let cone = '';
  if (allumee) {
    // Par l'ouverture on ne voit que le début de la remorque (y de 0 à -1,2 environ) : c'est là que la lumière se lit.
    cone = face([LAMPE.foyer, [2.45, -1.3, 0], [3.55, -1.3, 0]], 'rgba(255,247,200,.38)', 'none')
      + face([[2.45, -0.1, 0.006], [3.55, -0.1, 0.006], [3.55, -1.3, 0.006], [2.45, -1.3, 0.006]], 'rgba(255,247,200,.42)', 'none')
      + face([[2.62, -0.3, 0.008], [3.38, -0.3, 0.008], [3.38, -1.1, 0.008], [2.62, -1.1, 0.008]], 'rgba(255,252,225,.34)', 'none')
      + face([[2.41, -0.1, 0.1], [2.41, -1.3, 0.1], [2.41, -1.3, 1.9], [2.41, -0.1, 1.9]], 'rgba(255,247,200,.3)', 'none');
    cone = `<g pointer-events="none">${cone}</g>`;   // de la lumière : jamais ce qu'un clic atteint
  }
  const [lx, ly, lz] = LAMPE.foyer, [tx, ty, tz, tw, td, th] = LAMPE.tete;
  let halo = '';
  if (allumee) {
    const [hx, hy] = P(lx, ly, lz), u = I.unite;
    halo += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(u * .56).toFixed(1)}" fill="rgba(255,214,90,.16)"/>`;
    halo += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(u * .4).toFixed(1)}" fill="rgba(255,214,90,.3)"/>`;
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4, c = Math.cos(a), sn = Math.sin(a);
      halo += `<line x1="${(hx + c * u * .46).toFixed(1)}" y1="${(hy + sn * u * .46).toFixed(1)}" x2="${(hx + c * u * .66).toFixed(1)}" y2="${(hy + sn * u * .66).toFixed(1)}" stroke="rgba(245,176,20,.95)" stroke-width="3" stroke-linecap="round"/>`;
    }
    halo = `<g pointer-events="none">${halo}</g>`;
  }
  let t = boite(...LAMPE.base, gris);
  t += `<polyline points="${pts(LAMPE.bras)}" fill="none" stroke="#3a3f43" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  t += boite(...LAMPE.tete, noir);
  // La lentille : un rectangle presque aussi grand que la face avant de la tête (y = ty + td).
  const yf = ty + td + .002, m = .035;
  t += face([[tx + m, yf, tz + m], [tx + tw - m, yf, tz + m], [tx + tw - m, yf, tz + th - m], [tx + m, yf, tz + th - m]], allumee ? '#fff6c2' : '#15181a', allumee ? '#f5b014' : 'rgba(255,255,255,.18)');
  return { cone, tete: halo + objetEssai(o, 'lampe', allumee ? 'allumee' : 'eteinte', t) };
}
// La zone de la lampe : le socle, le bras et la tête (le faisceau et le halo n'en font pas partie : ils ne se cliquent pas).
export function boitesLampe() {
  const bte = ([x, y, z, w, d, h]) => [x, y, z, x + w, y + d, z + h];
  const xs = LAMPE.bras.map((p) => p[0]), ys = LAMPE.bras.map((p) => p[1]), zs = LAMPE.bras.map((p) => p[2]);
  return [bte(LAMPE.base), [Math.min(...xs) - .03, Math.min(...ys), Math.min(...zs) - .02, Math.max(...xs) + .03, Math.max(...ys) + .03, Math.max(...zs) + .02], bte(LAMPE.tete)];
}
// L'intérieur de la remorque, derrière le mur : à ne montrer que par l'ouverture (clip).
export function remorqueInterieur(I) {
  const { face } = I;
  return face([[2.4, -3.6, 2.05], [3.6, -3.6, 2.05], [3.6, -3.6, 0], [2.4, -3.6, 0]], '#24282b', 'none')
    + face([[2.4, -3.6, 0], [3.6, -3.6, 0], [3.6, -0.3, 0], [2.4, -0.3, 0]], '#5d6266', 'none')
    + face([[2.4, -3.6, 0], [2.4, -0.3, 0], [2.4, -0.3, 2.05], [2.4, -3.6, 2.05]], '#3a3f43', 'none')
    + face([[2.4, -3.6, 2.05], [3.6, -3.6, 2.05], [3.6, -0.3, 2.05], [2.4, -0.3, 2.05]], '#1c1f21', 'none');
}
// Le mur du quai vu de l'intérieur, et sa porte sectionnelle levée de `ouv` (0 fermée, 1 ouverte) ; le
// panneau vert du quai (`nom`, « QUAI 7 ») au-dessus.
export function murQuai(I, ouv, nom = '') {
  const { face, boite, pts, P } = I;
  const m = ['#b9b3a6', '#c9c3b6', '#a9a397'];
  let g = boite(-1.2, -0.3, 0, 3.6, 0.3, 2.7, m) + boite(3.6, -0.3, 0, 3.9, 0.3, 2.7, m) + boite(2.4, -0.3, 2.05, 1.2, 0.3, 0.65, m);
  const zb = Math.min(2.05, Math.max(0, ouv) * 2.05);
  if (zb < 2.04) {
    g += `<g data-iso-porte>${face([[2.4, 0.001, zb], [3.6, 0.001, zb], [3.6, 0.001, 2.05], [2.4, 0.001, 2.05]], '#d4d8da', '#8d969b')}`;
    for (let z = zb + 0.2; z < 2.05; z += 0.25) g += `<polyline points="${pts([[2.4, 0.002, z], [3.6, 0.002, z]])}" stroke="#a3abb0"/>`;
    g += '</g>';
  }
  if (nom) {
    g += face([[2.7, 0.003, 2.25], [3.3, 0.003, 2.25], [3.3, 0.003, 2.55], [2.7, 0.003, 2.55]], '#1f5f3a', '#0f3d24');
    const [lx, ly] = P(3.0, 0.004, 2.4);
    g += `<text x="${lx.toFixed(1)}" y="${(ly + 6).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" transform="rotate(30 ${lx.toFixed(1)} ${ly.toFixed(1)})">${ech(String(nom).toUpperCase())}</text>`;
  }
  return g;
}
// Un transpalette manuel (rouge) : (x, y) = l'avant de la palette qu'il porte, timon vers l'élève.
// Renvoie aussi le point écran de la poignée, que la main du chauffeur tient.
export function transpaletteManuel(I, x, y) {
  const [ax, ay] = I.P(x + .4, y + .12, 0.2), [bx, by] = I.P(x + .4, y + .62, 0.95);
  let g = I.boite(x + .33, y, 0.02, .14, .16, .16, ['#d93a2b', '#c23224', '#a8291d']);
  g += roue(I, x + .3, y + .09, .055, .055, .06) + roue(I, x + .44, y + .09, .055, .055, .06);
  g += `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="#a8291d" stroke-width="5" stroke-linecap="round"/>`;
  g += `<rect x="${(bx - 9).toFixed(1)}" y="${(by - 5).toFixed(1)}" width="18" height="9" rx="4" fill="none" stroke="#1d1d1d" stroke-width="3"/>`;
  return { svg: g, poignee: [bx, by] };
}

/* ======================================= palette EUR chargée de cartons, qu'on fait tourner */
// Dimensions d'une palette EUR et de ses cartons (mètres).
export const PAL_EUR = { W: 1.2, D: 0.8, plancher: 0.144 };
const KRAFT = ['#d9b27a', '#c99c5f', '#b48549'];
// Rotation de r quarts de tour de (u, v) ; et la face d'un carton (S = avant de la palette, y +) qu'on voit
// sous la rotation r : 'front' (face avant-gauche à l'écran), 'droite', ou null (cachée).
const rot = (r, u, v) => { for (let k = 0; k < r; k++) [u, v] = [-v, u]; return [u, v]; };
const DIRS = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] };
export function faceVisible(r, nom) {
  const [a, b] = rot(r, ...DIRS[nom]);
  if (Math.abs(a) < 1e-9 && b === 1) return 'front';
  if (a === 1 && Math.abs(b) < 1e-9) return 'droite';
  return null;
}
// Les faces extérieures d'un carton (i, j) d'une palette de nW × nD cartons.
export const facesExterieures = (c, nW, nD) => ['S', 'N', 'E', 'W'].filter((f) => (f === 'S' && c.j === nD - 1) || (f === 'N' && c.j === 0) || (f === 'E' && c.i === nW - 1) || (f === 'W' && c.i === 0));
export const dimsPalette = (r) => (r % 2 ? [PAL_EUR.D, PAL_EUR.W] : [PAL_EUR.W, PAL_EUR.D]);

// Un rectangle posé sur une face visible d'un carton : fractions horizontales u, hauteurs z dans le carton.
function surFaceCarton(b, v, u0, u1, z0, z1) {
  if (v === 'front') { const y = b.y + b.d; return [[b.x + b.w * u0, y, b.z + z0], [b.x + b.w * u1, y, b.z + z0], [b.x + b.w * u1, y, b.z + z1], [b.x + b.w * u0, y, b.z + z1]]; }
  const x = b.x + b.w;
  return [[x, b.y + b.d * (1 - u0), b.z + z0], [x, b.y + b.d * (1 - u1), b.z + z0], [x, b.y + b.d * (1 - u1), b.z + z1], [x, b.y + b.d * (1 - u0), b.z + z1]];
}
function etiquetteCarton(I, b, v, lisible) {
  const p = surFaceCarton(b, v, 0.18, 0.72, 0.07, 0.29);
  let s = I.face(p, '#fbfbf8', 'rgba(0,0,0,.35)');
  if (!lisible) return s;
  // Le texte posé sur la face (matrice de la face).
  const [ox, oy] = I.P(...p[3]), sc = I.unite / 240, m = v === 'front' ? [C30, S30] : [C30, -S30];
  const e = b.c.etiq || {};
  s += `<g transform="matrix(${(m[0] * sc).toFixed(4)},${(m[1] * sc).toFixed(4)},0,${sc.toFixed(4)},${ox.toFixed(1)},${oy.toFixed(1)})" font-family="Arial, sans-serif" fill="#111">
    <text x="4" y="11" font-size="8.5" font-weight="700">${ech(e.haut || '')}</text><text x="62" y="11" font-size="7">${ech(e.no || '')}</text>
    <text x="4" y="24" font-size="9.5" font-weight="800">${ech(e.ref || '')}</text>
    <text x="4" y="34" font-size="7">${ech(e.bas || '')}</text>
    ${[0, 3, 5, 8, 10, 13, 16, 18, 21, 24, 26, 29, 32, 34, 37, 40, 43, 45, 48, 51].map((xx) => `<rect x="${4 + xx}" y="38" width="${xx % 3 ? 1 : 2}" height="9"/>`).join('')}</g>`;
  return s;
}
function enfoncement(I, b, v) {
  const c = surFaceCarton(b, v, 0.55, 0.95, 0.04, 0.3);
  const mil = [(c[0][0] + c[2][0]) / 2, (c[0][1] + c[2][1]) / 2, (c[0][2] + c[2][2]) / 2];
  return `<g data-iso-avarie>${I.face([c[0], [(c[0][0] + c[1][0]) / 2, (c[0][1] + c[1][1]) / 2, c[0][2] + 0.06], c[1], c[2], [(c[2][0] + c[3][0]) / 2, (c[2][1] + c[3][1]) / 2, c[2][2] - 0.05], c[3]], '#8a6534', '#5b4020')}`
    + `<polyline points="${I.pts([c[0], mil, c[2]])}" fill="none" stroke="#4a3418" stroke-width="2"/>`
    + `<polyline points="${I.pts([c[1], mil, c[3]])}" fill="none" stroke="#4a3418" stroke-width="1.5"/></g>`;
}
// La palette : `pal` = { nW, nD, nL (cartons en largeur, en profondeur, couches), cartons: [{ i, j, k, absent,
// abime ('S' | 'N' | 'E' | 'W' : la face enfoncée), etiq: { haut, no, ref, bas } }] } ; (ox, oy) = coin monde
// min ; r = rotation (quarts de tour). Options : `yMin` / `yMax` (coupe au plan du mur), `labels` (false : pas
// d'étiquettes), `lisible` (texte des étiquettes), `dents` (false : pas d'enfoncement), `sel` (le carton
// éclairé), `attrs(c)` (attributs du groupe d'un carton : il devient cliquable).
export function paletteCartons(I, pal, ox, oy, r, o = {}) {
  const [W, D] = dimsPalette(r), yMin = o.yMin ?? -99, yMax = o.yMax ?? 99;
  const CW = PAL_EUR.W / pal.nW, CD = PAL_EUR.D / pal.nD, CH = o.hauteurCarton || 0.35, PH = PAL_EUR.plancher;
  const loc2monde = (lx, ly) => { const [a, b] = rot(r, lx - PAL_EUR.W / 2, ly - PAL_EUR.D / 2); return [ox + W / 2 + a, oy + D / 2 + b]; };
  const pc = ['#c9a273', '#b48a5b', '#9c7549'];
  let g = '';
  (r % 2 === 0 ? [0, 0.56, 1.1] : [0, 0.35, 0.7]).forEach((dx) => { g += boiteY(I, ox + dx, oy, 0, 0.1, D, 0.1, pc, yMin, yMax); });
  g += boiteY(I, ox, oy, 0.1, W, D, PH - 0.1, pc, yMin, yMax);
  const L = pal.cartons.filter((c) => !c.absent).map((c) => {
    const [x0, y0] = loc2monde(c.i * CW, c.j * CD), [x1, y1] = loc2monde((c.i + 1) * CW, (c.j + 1) * CD);
    return { c, x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), d: Math.abs(y1 - y0), z: PH + c.k * CH };
  }).sort((a, b) => (a.z - b.z) || ((a.x + a.y) - (b.x + b.y)));
  for (const b of L) {
    const sel = o.sel != null && o.sel === b.c.no;
    let s = boiteY(I, b.x, b.y, b.z, b.w, b.d, CH - 0.004, sel ? ['#f0cf98', '#e2bb7c', '#cfa565'] : KRAFT, yMin, yMax);
    if (s && b.y + b.d > yMin - 1e-6) {
      if (b.y + b.d <= yMax + 1e-6 && b.y >= yMin - 1e-6) {
        const lg = b.w > b.d;
        s += I.face(lg ? [[b.x, b.y + b.d / 2 - 0.03, b.z + CH], [b.x + b.w, b.y + b.d / 2 - 0.03, b.z + CH], [b.x + b.w, b.y + b.d / 2 + 0.03, b.z + CH], [b.x, b.y + b.d / 2 + 0.03, b.z + CH]]
          : [[b.x + b.w / 2 - 0.03, b.y, b.z + CH], [b.x + b.w / 2 + 0.03, b.y, b.z + CH], [b.x + b.w / 2 + 0.03, b.y + b.d, b.z + CH], [b.x + b.w / 2 - 0.03, b.y + b.d, b.z + CH]], '#c79b62', 'none');
      }
      facesExterieures(b.c, pal.nW, pal.nD).forEach((nf) => {
        const v = faceVisible(r, nf);
        if (!v || (v === 'front' && b.y + b.d > yMax + 1e-6)) return;
        if (b.c.abime === nf && o.dents !== false) s += enfoncement(I, b, v);
        if ((nf === 'S' || nf === 'N') && o.labels !== false) s += etiquetteCarton(I, b, v, o.lisible);
      });
    }
    g += o.attrs && s ? `<g ${o.attrs(b.c)}>${s}</g>` : s;
  }
  return g;
}

/* ============================ palette de rétention chargée de fûts (chantier D-4, étape 3) */
// Une palette de rétention NOIRE en plastique (pieds, bac, caillebotis : jamais de bois) portant 8 fûts DEBOUT, en une
// seule couche, en quinconce 3-2-3 (brief `docs/briefs/MOTEUR-quai-inspection.md` §2.3 ; modèle dessiné validé :
// `docs/briefs/france-boissons/materiel-palette-retention.svg`). Unités : le MÈTRE, comme le reste du quai.
export const COTE_BAC = 1.30;                    // côté du bac de rétention (m) ; un bac plus petit réduit tout dans la même proportion
const R_FUT = 0.1975, H_FUT = 0.46;              // un fût de 39,5 cm de diamètre, à l'échelle d'un bac de 1,30 m
const DY_FUT = 2 * R_FUT * 0.866;                // l'écart entre deux rangées d'un quinconce (fûts qui se touchent)
// Les 8 places, numérotées du fond (rangée 1-2-3) à l'avant (6-7-8), de gauche à droite : [x, y] depuis le centre du bac
// (y négatif = le fond, y positif = l'avant, la face S), à l'échelle d'un bac de 1,30 m.
export const PLACES_FUT = [[-2 * R_FUT, -DY_FUT], [0, -DY_FUT], [2 * R_FUT, -DY_FUT], [-R_FUT, 0], [R_FUT, 0], [-2 * R_FUT, DY_FUT], [0, DY_FUT], [2 * R_FUT, DY_FUT]];
// Les faces EXTÉRIEURES de chaque fût (celles qu'aucun autre fût ne cache) : une fuite ne se déclare que sur l'une d'elles.
const FACES_FUT = ['NW', 'N', 'NE', 'W', 'E', 'SW', 'S', 'SE'];
export const facesExterieuresFut = (no) => (FACES_FUT[no - 1] || '').split('');

// Le bac de rétention de côté `c`, coin min en (x, y) : le `retention` du kit (pieds, bac, nervures du caillebotis) agrandi,
// coupé aux plans `yMin` / `yMax` comme les cartons, et le caillebotis (ses trous) sur le dessus.
function bacRetention(I, x, y, c, yMin, yMax, z = 0) {
  const { pts, P, unite } = I;
  let g = '';
  [[.06, .06], [.78, .06], [.06, .78], [.78, .78]].forEach(([a, b]) => { g += boiteY(I, x + a * c, y + b * c, z, .16 * c, .16 * c, .05 * c, ['#2a2d2f', '#1e2123', '#16191a'], yMin, yMax); });
  g += boiteY(I, x + .03 * c, y + .03 * c, z + .05 * c, .94 * c, .94 * c, (ZB - .05) * c, ['#3d4245', '#2f3336', '#24282a'], yMin, yMax);
  for (let k = 1; k < 6; k++) {
    const t = (.03 + k * .94 / 6) * c;
    if (y + .97 * c <= yMax + 1e-6 && y + .97 * c >= yMin - 1e-6) g += `<polyline points="${pts([[x + t, y + .97 * c, z + .06 * c], [x + t, y + .97 * c, z + (ZB - .02) * c]])}" stroke="#1b1e20" stroke-width="2"/>`;
    if (y + t <= yMax + 1e-6 && y + t >= yMin - 1e-6) g += `<polyline points="${pts([[x + .97 * c, y + t, z + .06 * c], [x + .97 * c, y + t, z + (ZB - .02) * c]])}" stroke="#1b1e20" stroke-width="2"/>`;
  }
  // Le caillebotis : une grille de petits trous sombres sur le dessus (ils passent sous les fûts).
  const rx = .018 * c * unite * K1, ry = .018 * c * unite * K2;
  for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) {
    const px = x + (.14 + a * .144) * c, py = y + (.14 + b * .144) * c;
    if (py > yMax + 1e-6 || py < yMin - 1e-6) continue;
    const [ex, ey] = P(px, py, z + ZB * c);
    g += `<ellipse cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#16191a"/>`;
  }
  return g;
}

// Un fût debout de la palette : le fût du kit à l'échelle, sa collerette étiquetée (la référence, lisible en grand), un
// liseré doré s'il est « éclairé » (`o.sel`) et, si `fuite` (une face de la palette qu'on voit), la coulure sombre le
// long de sa paroi.
function futDePalette(I, cx, cy, z, rr, hh, f, o, fuite) {
  const { P, unite } = I;
  const [bx, by] = P(cx, cy, z), [tx, ty] = P(cx, cy, z + hh), rx = rr * unite * K1, ry = rr * unite * K2;
  let g = fut(I, cx, cy, z, rr, hh);
  if (o.sel) {
    g += `<path d="M${bx - rx},${by} L${tx - rx},${ty} M${tx + rx},${ty} L${bx + rx},${by} A${rx},${ry} 0 0 1 ${bx - rx},${by}" fill="none" stroke="#d1a90f" stroke-width="3"/>`;
    g += `<ellipse cx="${tx}" cy="${ty}" rx="${rx}" ry="${ry}" fill="none" stroke="#d1a90f" stroke-width="3"/>`;
  }
  // La collerette : une étiquette blanche entre les deux cercles du fût, sur la face tournée vers nous.
  const bas = by + (ty - by) * .30, haut = by + (ty - by) * .70, a0 = Math.PI * .27, a1 = Math.PI * .73;
  const arc = (yy, u0, u1) => Array.from({ length: 7 }, (_, k) => { const a = u0 + (u1 - u0) * k / 6; return `${(bx + rx * Math.cos(a)).toFixed(1)},${(yy + ry * Math.sin(a)).toFixed(1)}`; });
  g += `<polygon points="${arc(bas, a0, a1).concat(arc(haut, a1, a0)).join(' ')}" fill="#fbfbf8" stroke="rgba(0,0,0,.35)" stroke-width="1"/>`;
  if (o.lisible) {
    const fs = Math.max(6, rx * .27);
    g += `<text x="${bx.toFixed(1)}" y="${((bas + haut) / 2 + ry + fs * .35).toFixed(1)}" text-anchor="middle" font-size="${fs.toFixed(1)}" font-weight="800" font-family="Arial, sans-serif" fill="#111">${ech(f.ref || '')}</text>`;
  }
  if (fuite) {
    // Une coulure sombre sur la face qui fuit (là où la paroi est tournée vers nous), du haut de la paroi jusqu'au pied.
    const [ux, uy] = fuite, [hx, hy] = P(cx + ux * rr * .97, cy + uy * rr * .97, z + hh * .82), [pxx, pyy] = P(cx + ux * rr * .97, cy + uy * rr * .97, z + hh * .04);
    const w = Math.max(3, rx * .2), dx = rx * .07;
    const d = `M${hx.toFixed(1)},${hy.toFixed(1)} C${(hx + dx).toFixed(1)},${(hy + (pyy - hy) * .35).toFixed(1)} ${(hx - dx).toFixed(1)},${(hy + (pyy - hy) * .65).toFixed(1)} ${pxx.toFixed(1)},${pyy.toFixed(1)}`;
    g += `<g data-iso-avarie><path d="${d}" fill="none" stroke="#5a3a08" stroke-width="${w.toFixed(1)}" stroke-linecap="round"/>`
      + `<path d="${d}" fill="none" stroke="#a8761a" stroke-width="${(w * .4).toFixed(1)}" stroke-linecap="round"/>`
      + `<circle cx="${pxx.toFixed(1)}" cy="${pyy.toFixed(1)}" r="${(w * .9).toFixed(1)}" fill="#5a3a08"/></g>`;
  }
  return g;
}

// La palette de fûts : `pal` = { futs: [{ no (1 à 8), ref, absent, fuite ('S' | 'N' | 'E' | 'W' : la face qui fuit, ou rien) }] } ;
// (ox, oy) = coin monde min du bac ; r = rotation (quarts de tour ; le bac est carré). Options : `cote` (le côté du bac, 1,30 m
// par défaut : le quai la dessine à 0,95 à l'échelle du décor aux étapes ② et ④), `yMin` / `yMax` (coupe au plan du mur : un fût
// est dessiné dans la tranche où est son centre), `lisible` (la référence écrite sur la collerette), `dents` (false : pas de
// fuite), `sel` (le fût éclairé), `attrs(f)` (attributs du groupe d'un fût : il devient cliquable). Une place vide n'est pas
// dessinée. UNE FUITE n'est dessinée que si sa face se voit à cette rotation (`faceVisible`, comme l'enfoncement d'un carton) :
// la coulure sur le fût et la flaque dans le bac, de ce côté-là.
export function paletteFuts(I, pal, ox, oy, r, o = {}) {
  const c = o.cote || COTE_BAC, e = c / COTE_BAC, yMin = o.yMin ?? -99, yMax = o.yMax ?? 99;
  const z0 = o.z || 0, rr = R_FUT * e, hh = H_FUT * e, zb = z0 + ZB * c, mx = ox + c / 2, my = oy + c / 2;
  let g = bacRetention(I, ox, oy, c, yMin, yMax, z0);
  const L = [];
  (pal.futs || []).forEach((f) => {
    if (f.absent) return;
    const [a, b] = rot(r, PLACES_FUT[f.no - 1][0] * e, PLACES_FUT[f.no - 1][1] * e), cx = mx + a, cy = my + b;
    if (cy < yMin - 1e-6 || cy > yMax + 1e-6) return;
    const v = f.fuite && o.dents !== false ? faceVisible(r, f.fuite) : null;
    L.push({ f, cx, cy, k: cx + cy, fuite: v ? rot(r, ...DIRS[f.fuite]) : null, a, b });
    // La flaque, dans le bac, du côté de la fuite : ni plus loin que la paroi du bac, ni dessinée si la face ne se voit pas.
    if (v) {
      const [ux, uy] = rot(r, ...DIRS[f.fuite]), pos = a * ux + b * uy, da = .05 * e;
      const d = Math.max(rr * .7, Math.min(rr + .02 * e, .635 * e - pos - da)), qx = cx + ux * d, qy = cy + uy * d;
      const ax = uy !== 0 ? .12 * e : da, ay = uy !== 0 ? da : .12 * e;     // le grand axe de la flaque longe la paroi
      const pl = Array.from({ length: 14 }, (_, k) => { const t = k / 14 * Math.PI * 2; return [qx + ax * Math.cos(t), qy + ay * Math.sin(t), zb + .002]; });
      L.push({ flaque: `<polygon data-iso-flaque points="${I.pts(pl)}" fill="#d9b84a" stroke="#8a6a10" stroke-width="1" opacity=".92"/>`, k: qx + qy + .0001 });
    }
  });
  L.sort((p, q) => p.k - q.k).forEach((it) => {
    if (it.flaque) { g += it.flaque; return; }
    const s = futDePalette(I, it.cx, it.cy, zb, rr, hh, it.f, { sel: o.sel != null && o.sel === it.f.no, lisible: o.lisible }, it.fuite);
    g += o.attrs ? `<g ${o.attrs(it.f)}>${s}</g>` : s;
  });
  return g;
}

/* ============================== l'allée de picking : fûts, casiers, travée à tiroir, palette client (D-7 lot 2) */
// Les objets d'ENT-6.7 (brief `docs/briefs/ENT-6.7-france-boissons-preparation.md` §7.2 et §7.3), repris de la maquette
// validée (`docs/briefs/france-boissons/maquette-6.7-preparation-vocale.html`) ; le CASIER est celui que Tristan a validé le
// 06/10 pour ENT-6.10 (`maquette-6.10-retour-vides.html` : plastique anthracite ajouré, poignées, pied sombre, rebord clair),
// plein (bouteilles capsulées) ou vide (goulots ouverts). Unité : le MÈTRE, comme le quai. Rien ici n'est cliquable par
// soi-même : la vue (lot 3 : l'allée ; lot 4 : le montage) pose ses attributs par `attrs`. Aucun vert (le vert ne dit que
// « juste ») ; les teintes se choisissent PAR NOM, comme les lots (un nom inconnu est refusé : on ne découvre pas en classe
// qu'un objet ne se dessine pas). Page d'essai : `outils/essai-kit-iso.html`.

// La bande de marque d'un fût et la capsule d'une bouteille.
export const TEINTES_FUT = { or: '#b8862b', bleu: '#2f5f9e', rouge: '#a8322a', cuivre: '#9a5b2e', gris: '#6f777c' };
export const TEINTES_CAPSULE = { bleu: '#2f6fc0', jaune: '#d8b52a', rouge: '#b3302a', gris: '#9aa1a6' };
// Un fût de picking : 39,5 cm de diamètre (6 par palette client : 3 × 39,5 cm sur 1,20 m), plus ou moins haut selon le volume.
export const HAUT_FUT = { 20: 0.38, 30: 0.46 };
export const RAYON_FUT = R_FUT;
// Un casier de 12 bouteilles d'un litre (4 × 3).
export const CASIER = { w: 0.40, d: 0.30, h: 0.30 };

const teinte = (table, nom, quoi) => {
  if (nom == null) return null;
  if (!table[nom]) throw new Error(`kit iso : ${quoi} « ${nom} » inconnue (connues : ${Object.keys(table).join(', ')})`);
  return table[nom];
};
const f1 = (v) => v.toFixed(1);

// La hauteur d'un objet posé ({ type: 'fut', litres } ou { type: 'casier' }) : ce qui se pose dessus part de là.
export function hauteurObjet(ob) {
  if (ob.type === 'casier') return CASIER.h;
  if (ob.type === 'fut') {
    const h = HAUT_FUT[ob.litres || 30];
    if (!h) throw new Error(`kit iso : fût de ${ob.litres} L inconnu (connus : ${Object.keys(HAUT_FUT).join(', ')} L)`);
    return h;
  }
  throw new Error(`kit iso : objet « ${ob.type} » inconnu (fut, casier)`);
}

// Un fût debout, centre du pied en (cx, cy, z). `o` : { litres (20 | 30, 30 par défaut), bande (teinte de marque, ou rien),
// abime (cabossé : un enfoncement sombre sur la face avant, un reflet, un pli ; marqué `data-iso-avarie`), r (rayon) }.
export function futDebout(I, cx, cy, z, o = {}) {
  const { P, unite } = I;
  const r = o.r || R_FUT, h = hauteurObjet({ type: 'fut', litres: o.litres }), coul = teinte(TEINTES_FUT, o.bande, 'teinte de fût');
  const [bx, by] = P(cx, cy, z), [, ty] = P(cx, cy, z + h), rx = r * unite * K1, ry = r * unite * K2;
  let g = fut(I, cx, cy, z, r, h);
  if (coul) {
    // La bande de marque, sur la face tournée vers nous, entre les deux cercles.
    const bas = by + (ty - by) * .36, haut = by + (ty - by) * .62, a0 = Math.PI * .12, a1 = Math.PI * .88;
    const arc = (yy, u0, u1) => Array.from({ length: 9 }, (_, k) => { const a = u0 + (u1 - u0) * k / 8; return `${f1(bx + rx * Math.cos(a))},${f1(yy + ry * Math.sin(a))}`; });
    g += `<polygon points="${arc(bas, a0, a1).concat(arc(haut, a1, a0)).join(' ')}" fill="${coul}" stroke="rgba(0,0,0,.3)" stroke-width=".8"/>`;
  }
  if (o.abime) {
    const yy = by + (ty - by) * .5, c0 = bx + rx * .05, w = rx * .75, hh = (by - ty) * .42, ep = (v) => Math.max(v, unite / 60).toFixed(1);
    g += `<g data-iso-avarie><path d="M${f1(c0 - w)},${f1(yy - hh * .2)} C${f1(c0 - w * .4)},${f1(yy - hh)} ${f1(c0 + w * .5)},${f1(yy - hh * .8)} ${f1(c0 + w)},${f1(yy - hh * .1)} C${f1(c0 + w * .6)},${f1(yy + hh * .9)} ${f1(c0 - w * .5)},${f1(yy + hh)} ${f1(c0 - w)},${f1(yy - hh * .2)} Z" fill="#3e464b" opacity=".85"/>`
      + `<path d="M${f1(c0 - w * .7)},${f1(yy + hh * .35)} C${f1(c0 - w * .2)},${f1(yy + hh * .75)} ${f1(c0 + w * .4)},${f1(yy + hh * .6)} ${f1(c0 + w * .75)},${f1(yy + hh * .15)}" fill="none" stroke="#f4f6f7" stroke-width="${ep(1.2)}" opacity=".9"/>`
      + `<path d="M${f1(c0 - w * .5)},${f1(yy - hh * .35)} l${f1(w * .35)},${f1(hh * .5)} l${f1(w * .3)},${f1(-hh * .3)} l${f1(w * .35)},${f1(hh * .35)}" fill="none" stroke="#1f2427" stroke-width="${ep(1)}"/></g>`;
  }
  return `<g data-iso-objet="fut" data-litres="${o.litres || 30}" data-z="${z.toFixed(3)}"${o.abime ? ' data-abime' : ''}>${g}</g>`;
}

// Un casier de 12 bouteilles, coin min en (x, y, z), 0,40 m selon x et 0,30 m selon y. `o` : { vide (goulots ouverts : les
// vides d'ENT-6.10), capsule (teinte des bouchons d'un casier plein ; gris par défaut) }.
export function casier(I, x, y, z, o = {}) {
  const { P, pts, face, unite } = I, { w, d, h } = CASIER;
  const cap = o.vide ? null : (teinte(TEINTES_CAPSULE, o.capsule, 'teinte de capsule') || TEINTES_CAPSULE.gris);
  const coque = '#4a5157', sombre = '#2c3236', bord = '#c3cbd0';
  let g = face([[x, y, z + .02], [x + w, y, z + .02], [x + w, y + d, z + .02], [x, y + d, z + .02]], sombre, 'none');
  g += face([[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]], '#3a4247', 'rgba(0,0,0,.4)');
  g += face([[x, y, z], [x, y + d, z], [x, y + d, z + h], [x, y, z + h]], '#30373b', 'rgba(0,0,0,.4)');
  // Les bouteilles 4 × 3, de l'arrière vers l'avant : corps en verre clair, goulot qui dépasse, capsule ou goulot ouvert.
  const bt = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) bt.push([x + w * (i + .5) / 4, y + d * (j + .5) / 3]);
  const r1 = Math.min(w / 4, d / 3) * .36, r2 = r1 * .45;
  const cyl = (bx, by, z0, z1, r, f, st) => {
    const [ax, ay] = P(bx, by, z0), [tx, ty] = P(bx, by, z1), rx = r * unite * K1, ry = r * unite * K2;
    return `<path d="M${f1(ax - rx)},${f1(ay)} L${f1(tx - rx)},${f1(ty)} L${f1(tx + rx)},${f1(ty)} L${f1(ax + rx)},${f1(ay)} A${f1(rx)},${f1(ry)} 0 0 1 ${f1(ax - rx)},${f1(ay)} Z" fill="${f}" stroke="${st}" stroke-width=".8"/>`
      + `<ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${f}" stroke="${st}" stroke-width=".8"/>`;
  };
  bt.sort((p, q) => (p[0] + p[1]) - (q[0] + q[1])).forEach(([bx, by]) => {
    g += cyl(bx, by, z, z + h * .7, r1, '#cfe3ea', '#7f9aa6') + cyl(bx, by, z + h * .7, z + h * 1.12, r2, '#d9ebf1', '#7f9aa6');
    const [tx, ty] = P(bx, by, z + h * 1.12);
    g += cap ? `<ellipse data-iso-capsule cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(r2 * unite * K1 * 1.05)}" ry="${f1(r2 * unite * K2 * 1.05)}" fill="${cap}" stroke="rgba(0,0,0,.4)" stroke-width=".6"/>`
      : `<ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(r2 * unite * K1 * .6)}" ry="${f1(r2 * unite * K2 * .6)}" fill="#1f2426"/>`;
  });
  // Les parois avant (avant-gauche y + d, avant-droite x + w), ajourées, avec la poignée, le pied sombre et le rebord clair.
  const paroi = (A, B, coul) => {
    const L = (t, zz) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, zz];
    let p = face([L(0, z), L(1, z), L(1, z + h), L(0, z + h)], coul, 'rgba(0,0,0,.45)');
    [[.08, .3], [.38, .62], [.7, .92]].forEach(([t0, t1]) => { p += face([L(t0, z + h * .12), L(t1, z + h * .12), L(t1, z + h * .5), L(t0, z + h * .5)], 'rgba(207,227,234,.9)', 'rgba(0,0,0,.35)'); });
    p += face([L(0, z), L(1, z), L(1, z + h * .07), L(0, z + h * .07)], '#1a1d20', 'none');
    p += face([L(.3, z + h * .66), L(.7, z + h * .66), L(.7, z + h * .84), L(.3, z + h * .84)], '#1a1d20', 'none');
    return p + `<polyline points="${pts([L(0, z + h * .97), L(1, z + h * .97)])}" fill="none" stroke="${bord}" stroke-width="${Math.max(3, unite / 35).toFixed(1)}"/>`;
  };
  g += paroi([x, y + d], [x + w, y + d], coque) + paroi([x + w, y + d], [x + w, y], '#59636a');
  g += `<polyline points="${pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h], [x, y, z + h]])}" fill="none" stroke="${bord}" stroke-width="${Math.max(1.5, unite / 60).toFixed(1)}"/>`;
  return `<g data-iso-objet="casier" data-z="${z.toFixed(3)}"${o.vide ? ' data-vide' : ''}>${g}</g>`;
}

// LA TRAVÉE DE PICKING : deux poteaux bleus de chaque côté, des lisses orange ; au niveau 1, un TIROIR COULISSANT (plateau
// sur rails, poignée côté allée) qui porte la marchandise ; aux niveaux 2 et 3, des plateaux grillagés SANS fûts (la réserve
// est au sol, en zone de masse : décision de Tristan du 06/10). Coin min en (x, y) ; L selon x (le long de l'allée), D selon y.
// `o` : {
//   cote: 'A' (l'allée est devant, y + D : on voit la face du tiroir) | 'B' (l'allée est derrière, côté y : la marchandise
//     est rangée de ce côté-là) ;
//   contenu: { type: 'fut' | 'casier', n (0 = emplacement vide), litres, bande, capsule, abimes (combien de fûts cabossés :
//     les plus en avant, côté allée) } ;
//   sortie : de combien (m) le tiroir est tiré vers l'allée (0 par défaut ; tiré, il passe devant l'étiquette de lisse) ;
//   voile : opacité de toute la travée (le côté B de la vue d'ensemble, en transparence) ; voileHaut : celle des niveaux 2-3
//     et des poteaux avant seulement (la vue de près : le tiroir se voit à travers) ;
//   etiquette : { adresse, designation, lot, code } — l'étiquette de la lisse basse, avec le CODE DÉTROMPEUR en gros. Elle
//     n'est dessinée que si on la demande (la vue de près) : la vue d'ensemble ne la passe jamais, et le code n'est alors
//     nulle part dans le dessin. Côté A seulement (la face avant d'un côté B ne se voit pas) ;
//   attrs : attributs posés sur le groupe de la travée.
// }
export const TRAVEE = { L: 1.8, D: 1.0, N2: 1.05, N3: 1.95, H: 2.6 };
export const PLACES_TIROIR = { fut: 8, casier: 12 };
const POTEAU_RACK = ['#4f7fc0', '#2f5f9e', '#244b80'], LIS = ['#f39a4a', '#e07b22', '#b85f12'], TIROIR = ['#d7dcdf', '#aab2b7', '#8f989e'];
// Les places de la marchandise d'un tiroir, de la plus en avant (côté allée) à la plus au fond : [x, y, z] du pied (fût)
// ou du coin min (casier), dans le repère de la travée.
function placesTiroir(type, cote) {
  const D = TRAVEE.D, avant = cote === 'B' ? 0 : 1, P = [];
  if (type === 'fut') {
    for (const j of [avant, 1 - avant]) for (let i = 3; i >= 0; i--) P.push([.3 + i * .4, j ? D - .3 : .3, 0]);
  } else {
    for (let n = 0; n < 2; n++) for (const j of [avant, 1 - avant]) for (let i = 2; i >= 0; i--) P.push([.15 + i * .52, j ? D - .1 - CASIER.d : .1, n * CASIER.h]);
  }
  return P;
}

export function traveePicking(I, x, y, o = {}) {
  const { L, D, N2, N3, H } = TRAVEE, cote = o.cote || 'A', c = o.contenu || null;
  if (cote !== 'A' && cote !== 'B') throw new Error(`kit iso : travée côté « ${cote} » inconnu (A, B)`);
  if (o.etiquette && cote !== 'A') throw new Error('kit iso : l’étiquette de lisse ne se dessine que côté A (vue de face)');
  if (c && !PLACES_TIROIR[c.type]) throw new Error(`kit iso : contenu de tiroir « ${c.type} » inconnu (fut, casier)`);
  if (c && (c.n || 0) > PLACES_TIROIR[c.type]) throw new Error(`kit iso : ${c.n} ${c.type === 'fut' ? 'fûts' : 'casiers'} dans un tiroir de ${PLACES_TIROIR[c.type]} places`);
  const sortie = (o.sortie || 0) * (cote === 'B' ? -1 : 1);
  const poteau = (px, py) => I.boite(px, py, 0, .07, .07, H, POTEAU_RACK);
  const lisse = (z, py) => I.boite(x, py, z, L, .06, .09, LIS);
  const plateau = (z) => I.face([[x + .05, y + .05, z + .09], [x + L - .05, y + .05, z + .09], [x + L - .05, y + D - .05, z + .09], [x + .05, y + D - .05, z + .09]], 'rgba(160,168,174,.55)', '#7f878c')
    + [.25, .5, .75].map((t) => `<polyline points="${I.pts([[x + .05 + (L - .1) * t, y + .05, z + .09], [x + .05 + (L - .1) * t, y + D - .05, z + .09]])}" fill="none" stroke="#7f878c" stroke-width="1"/>`).join('');
  // Le fond : sol de la travée, poteaux arrière.
  let g = I.face([[x, y, 0], [x + L, y, 0], [x + L, y + D, 0], [x, y + D, 0]], 'rgba(255,255,255,.35)', '#c9c3b6');
  g += poteau(x, y) + poteau(x + L - .07, y);
  // Le tiroir : rails, plateau, puis la marchandise (de bas en haut, de l'arrière vers l'avant), puis sa face et sa poignée.
  const yt = y + sortie;
  g += I.boite(x + .06, y + .1, .02, .04, D - .2, .04, TIROIR) + I.boite(x + L - .1, y + .1, .02, .04, D - .2, .04, TIROIR);
  let t = I.boite(x + .1, yt + .04, .06, L - .2, D - .08, .04, TIROIR);
  if (c) {
    const n = c.n || 0, ab = Math.min(c.abimes || 0, n);
    placesTiroir(c.type, cote).slice(0, n).map((p, k) => ({ p, k }))
      .sort((a, b) => (a.p[2] - b.p[2]) || ((a.p[0] + a.p[1]) - (b.p[0] + b.p[1])))
      .forEach(({ p, k }) => {
        t += c.type === 'fut' ? futDebout(I, x + p[0], yt + p[1], .1, { litres: c.litres, bande: c.bande, abime: k < ab })
          : casier(I, x + p[0], yt + p[1], .1 + p[2], { capsule: c.capsule, vide: c.vide });
      });
  }
  const yf = cote === 'B' ? yt + .04 : yt + D - .04;
  t += I.face([[x + .1, yf, .06], [x + L - .1, yf, .06], [x + L - .1, yf, .14], [x + .1, yf, .14]], TIROIR[1], 'rgba(0,0,0,.3)');
  t += `<polyline points="${I.pts([[x + L * .4, yf, .12], [x + L * .6, yf, .12]])}" fill="none" stroke="#3d4245" stroke-width="${Math.max(2, I.unite / 40).toFixed(1)}" stroke-linecap="round"/>`;
  // Le devant : lisse basse, niveaux 2 et 3 (plateaux vides), lisses avant et arrière, poteaux avant. Un tiroir TIRÉ côté A est
  // devant les poteaux : il se dessine après eux.
  let h = I.boite(x, y + D - .06, 0, L, .06, .05, LIS);
  h += lisse(N2, y) + plateau(N2) + lisse(N3, y) + plateau(N3);
  h += lisse(N2, y + D - .06) + lisse(N3, y + D - .06);
  h += poteau(x, y + D - .07) + poteau(x + L - .07, y + D - .07);
  if (o.voileHaut != null) h = `<g opacity="${o.voileHaut}">${h}</g>`;
  g += sortie > 0 ? h + t : t + h;
  if (o.etiquette) g += etiquetteLisse(I, x + L * .3, y + D + .02, o.etiquette);
  const attrs = o.attrs ? ` ${o.attrs}` : '';
  return `<g data-iso-objet="travee"${o.voile != null ? ` opacity="${o.voile}"` : ''}${attrs}>${g}</g>`;
}

// L'étiquette d'emplacement, posée devant la lisse basse, au tiers gauche de la travée (là où les fûts, rangés depuis la
// droite, ne la cachent pas et où elle ne cache pas un fût cabossé) ; centre en (cx, cy, 0) : l'adresse, la désignation et le lot,
// et le code détrompeur en gros (fond sombre, chiffres jaunes). Mesurée en pixels d'une vue à 150 pixels par mètre.
function etiquetteLisse(I, cx, cy, e) {
  const [lx, ly] = I.P(cx, cy, .04), k = I.unite / 150, X = (v) => f1(lx + v * k), Y = (v) => f1(ly + v * k), n = (v) => f1(v * k);
  const bas = [e.designation, e.lot ? `lot ${e.lot}` : ''].filter(Boolean).join(' · ');
  return `<g data-iso-etiquette-lisse><rect x="${X(-110)}" y="${Y(-4)}" width="${n(240)}" height="${n(46)}" rx="${n(5)}" fill="#fff8d0" stroke="#8a6d00" stroke-width="${n(2)}"/>`
    + `<text x="${X(-100)}" y="${Y(15)}" font-size="${n(14)}" font-weight="800" fill="#1a1915">${ech(e.adresse || '')}</text>`
    + `<text x="${X(-100)}" y="${Y(33)}" font-size="${n(11.5)}" fill="#555047">${ech(bas)}</text>`
    + `<rect x="${X(76)}" y="${Y(2)}" width="${n(46)}" height="${n(34)}" rx="${n(4)}" fill="#1a1915"/>`
    + `<text data-iso-code x="${X(99)}" y="${Y(27)}" text-anchor="middle" font-size="${n(22)}" font-weight="800" fill="#ffe08a">${ech(e.code || '')}</text></g>`;
}

// Le volume d'une travée (ses trois faces visibles, en points d'écran) : ce que la vue éclaire au survol et fait cliquer.
export function volumeTravee(I, x, y) {
  const { L, D, H } = TRAVEE;
  return [[[x, y + D, 0], [x + L, y + D, 0], [x + L, y + D, H], [x, y + D, H]], [[x + L, y, 0], [x + L, y + D, 0], [x + L, y + D, H], [x + L, y, H]],
    [[x, y, H], [x + L, y, H], [x + L, y + D, H], [x, y + D, H]]].map((f) => I.pts(f));
}

// LA PALETTE CLIENT : une palette en bois 1,20 × 0,80 (construit : la source ne dit pas la matière), coin min en (x, y, z),
// et ses 6 CASES (3 × 2, une par fût de 39,5 cm), numérotées 0 à 5 du fond-gauche à l'avant-droite (case c : colonne c % 3,
// rangée Math.floor(c / 3), la rangée 1 étant l'avant). `o` : {
//   piles : 6 listes au plus, chacune les objets d'une case de bas en haut ({ type: 'fut', litres, bande, abime } ou
//     { type: 'casier', capsule, vide }) : ce qu'on pose sur une pile part de son sommet (un fût sur un casier se voit) ;
//   film : le nombre de tours de film étirable (0 : pas de film ; le voile s'épaissit avec les tours, un trait par tour) ;
//   etiquettes : les côtés étiquetés parmi 'avant', 'arriere', 'gauche', 'droite', 'dessus'. Seuls avant, droite et dessus
//     se voient d'ici : tous sont écrits dans `data-iso-etiquettes`, pour que la vue les dise ;
//   attrsCase(c) : les attributs du groupe d'une case (la vue la rend cliquable) ; casesVisibles : le contour des cases.
// }
export const CASES_PALETTE = 6;
export const COTES_ETIQUETTE = ['avant', 'arriere', 'gauche', 'droite', 'dessus'];
export const hauteurPile = (pile) => (pile || []).reduce((s, ob) => s + hauteurObjet(ob), 0);

export function paletteClient(I, x, y, o = {}) {
  const { W, D, plancher: PH } = PAL_EUR, z0 = o.z || 0, piles = o.piles || [];
  if (piles.length > CASES_PALETTE) throw new Error(`kit iso : ${piles.length} piles sur une palette client de ${CASES_PALETTE} cases`);
  const et = o.etiquettes || [];
  et.forEach((c) => { if (!COTES_ETIQUETTE.includes(c)) throw new Error(`kit iso : côté d’étiquette « ${c} » inconnu (${COTES_ETIQUETTE.join(', ')})`); });
  const bois = ['#d6ae78', '#b88a55', '#9c7243'];
  let g = '';
  [0, .55, 1.1].forEach((dx) => { g += I.boite(x + dx, y, z0, .1, D, .1, bois); });
  g += I.boite(x, y, z0 + .1, W, D, PH - .1, bois);
  [.4, .8].forEach((t) => { g += `<polyline points="${I.pts([[x + W * t, y, z0 + PH], [x + W * t, y + D, z0 + PH]])}" fill="none" stroke="#9c7243" stroke-width="1"/>`; });
  const zp = z0 + PH;
  const cases = Array.from({ length: CASES_PALETTE }, (_, c) => ({ c, cx: x + .2 + (c % 3) * .4, cy: y + .2 + Math.floor(c / 3) * .4, pile: piles[c] || [] }));
  cases.slice().sort((a, b) => (a.cx + a.cy) - (b.cx + b.cy)).forEach((k) => {
    let s = '';
    if (o.casesVisibles || o.attrsCase) {
      const q = [[k.cx - .19, k.cy - .19, zp + .002], [k.cx + .19, k.cy - .19, zp + .002], [k.cx + .19, k.cy + .19, zp + .002], [k.cx - .19, k.cy + .19, zp + .002]];
      s += `<polygon data-iso-case="${k.c}" points="${I.pts(q)}" fill="rgba(255,255,255,.08)" stroke="rgba(60,40,20,.45)" stroke-width="1" stroke-dasharray="4 3"/>`;
    }
    let z = zp;
    k.pile.forEach((ob) => {
      s += ob.type === 'casier' ? casier(I, k.cx - CASIER.w / 2, k.cy - CASIER.d / 2, z, ob) : futDebout(I, k.cx, k.cy, z, ob);
      z += hauteurObjet(ob);
    });
    g += o.attrsCase ? `<g ${o.attrsCase(k.c)}>${s}</g>` : s;
  });
  const hMax = zp + Math.max(.3, ...cases.map((k) => hauteurPile(k.pile)));
  const tours = Math.max(0, Math.round(o.film || 0));
  if (tours) {
    const voile = `rgba(190,220,240,${Math.min(.12 * tours, .6).toFixed(2)})`;
    let f = I.face([[x, y + D, zp], [x + W, y + D, zp], [x + W, y + D, hMax], [x, y + D, hMax]], voile, 'rgba(120,160,190,.6)')
      + I.face([[x + W, y, zp], [x + W, y + D, zp], [x + W, y + D, hMax], [x + W, y, hMax]], voile, 'rgba(120,160,190,.6)');
    for (let t = 1; t <= tours; t++) {
      const zz = zp + (hMax - zp) * t / (tours + 1);
      f += `<polyline points="${I.pts([[x, y + D, zz], [x + W, y + D, zz], [x + W, y, zz]])}" fill="none" stroke="rgba(110,150,180,.75)" stroke-width="1.2"/>`;
    }
    g += `<g data-iso-film="${tours}">${f}</g>`;
  }
  // Les étiquettes d'expédition qu'on voit : une feuille blanche à deux lignes, à plat sur sa face (q : haut-gauche,
  // haut-droit, bas-droit, bas-gauche).
  const feuille = (q) => I.face(q, '#fbfbf8', '#1a1915') + [.35, .62].map((t) => {
    const a = entre(q[0], q[3], t), b = entre(q[1], q[2], t);
    return `<polyline points="${I.pts([entre(a, b, .15), entre(a, b, .85)])}" fill="none" stroke="#1a1915" stroke-width="1"/>`;
  }).join('');
  const zb = zp + .08, zh = Math.min(zp + .3, hMax - .02), e = .003;
  if (et.includes('avant')) g += `<g data-iso-etiquette="avant">${feuille([[x + .45, y + D + e, zh], [x + .75, y + D + e, zh], [x + .75, y + D + e, zb], [x + .45, y + D + e, zb]])}</g>`;
  if (et.includes('droite')) g += `<g data-iso-etiquette="droite">${feuille([[x + W + e, y + .55, zh], [x + W + e, y + .25, zh], [x + W + e, y + .25, zb], [x + W + e, y + .55, zb]])}</g>`;
  if (et.includes('dessus')) g += `<g data-iso-etiquette="dessus">${feuille([[x + .45, y + .25, hMax + e], [x + .75, y + .25, hMax + e], [x + .75, y + .55, hMax + e], [x + .45, y + .55, hMax + e]])}</g>`;
  return `<g data-iso-objet="paletteClient" data-iso-etiquettes="${et.join(' ')}">${g}</g>`;
}
const entre = (a, b, t) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t);

/* ================================== la boucle des vides : route, porteur à rideaux, bâtiments (chantier D-10, lot 2) */
// Les objets de l'animation « la boucle des vides » d'ENT-6.10 (brief `docs/briefs/ENT-6.10-france-boissons-retour.md` §4.4a, §7.3 et §11 :
// « camion, route, bâtiments » soignés, au niveau du dessin du quai). Une CARTE SCHÉMATIQUE : l'unité est celle de la carte (un camion
// fait 3,4 de long), pas le mètre ni la place de palette. Aucune couleur de repère dans le décor (ni vert : l'ordre d'une tournée et
// « juste » ; ni bleu franc : le client) : sol sable, bas-côtés kaki, mer gris-bleu. Pas de marque, pas de visage. Page d'essai :
// `outils/essai-boucle-vides.html`.

// Un fût debout à bouchon GRIS : un VIDE qui revient (ENT-6.10). Mêmes options que `futDebout`, plus `vide`.
export function futVide(I, cx, cy, z, o = {}) {
  const { P, unite } = I;
  const r = o.r || R_FUT, h = hauteurObjet({ type: 'fut', litres: o.litres });
  const [tx, ty] = P(cx, cy, z + h), rx = r * unite * K1, ry = r * unite * K2;
  let g = fut(I, cx, cy, z, r, h);
  // Le bouchon gris (plus large que le raccord du fût plein) et un petit reflet.
  g += `<ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(rx * .46)}" ry="${f1(ry * .46)}" fill="#8d9599" stroke="#5c6266" stroke-width=".8"/>`
    + `<ellipse cx="${f1(tx - rx * .1)}" cy="${f1(ty - ry * .12)}" rx="${f1(rx * .18)}" ry="${f1(ry * .14)}" fill="#c3c9cc"/>`;
  return `<g data-iso-objet="fut" data-vide data-litres="${o.litres || 30}" data-z="${z.toFixed(3)}">${g}</g>`;
}

// Une roue d'axe y (camion qui roule selon x) : le cercle est dans le plan du flanc y = constante.
function roueY(I, x, y, z, r, l) {
  const u = I.unite;
  const M = (yy) => { const [ex, ey] = I.P(x, yy, z); return `matrix(${(C30 * u).toFixed(3)},${(S30 * u).toFixed(3)},0,${(-u).toFixed(3)},${ex.toFixed(1)},${ey.toFixed(1)})`; };
  let g = '';
  for (let k = 0; k <= 4; k++) g += `<circle r="${r}" transform="${M(y + l * k / 4)}" fill="#141617" stroke="#0b0c0d" stroke-width="${(0.6 / u).toFixed(4)}"/>`;
  g += `<circle r="${(r * .55).toFixed(3)}" transform="${M(y + l)}" fill="#8d9397" stroke="#5c6266" stroke-width="${(1 / u).toFixed(4)}"/>`;
  return g + `<circle r="${(r * .18).toFixed(3)}" transform="${M(y + l + 0.001)}" fill="#3a3e41"/>`;
}

// LE PORTEUR À RIDEAUX de la tournée, qui ROULE (la vue quai a le sien, en marche arrière vers la façade). (x, y) = le milieu du
// camion au sol ; `dir` = le sens de marche : 'E' (+x), 'O' (−x), 'S' (+y, vers l'élève), 'N' (−y). Repère local : `a` le long du
// camion (0 = l'arrière, LONG = l'avant), `b` en travers (−LARG/2 … +LARG/2), z vers le haut.
// Options : `charge` : 'pleins' (fûts à bandes de marque et casiers d'eau capsulés), 'vides' (fûts à bouchon gris, casiers ouverts),
// rien (caisse vide) ; `rideau` : 'entrouvert' (défaut : l'arrière du flanc visible est ouvert, on voit le chargement) | 'ferme'.
export const PORTEUR = { LONG: 3.4, LARG: 1, CAISSE: 2.4, CAB: .86, Z0: .42, HC: 1.42, HCAB: 1.18 };
const SENS = ['E', 'O', 'S', 'N'];
export function porteurRideaux(I, x, y, dir = 'E', o = {}) {
  if (!SENS.includes(dir)) throw new Error(`kit iso : sens du porteur « ${dir} » inconnu (${SENS.join(', ')})`);
  const { LONG, LARG, CAISSE, CAB, Z0, HC, HCAB } = PORTEUR, B = LARG / 2;
  // Local → monde.
  const W = (a, b, z) => {
    const s = a - LONG / 2;
    return dir === 'E' ? [x + s, y + b, z] : dir === 'O' ? [x - s, y - b, z] : dir === 'S' ? [x - b, y + s, z] : [x + b, y - s, z];
  };
  // Le flanc visible (b), et le bout visible : l'avant si le camion vient vers l'élève ou va à droite, sinon l'arrière.
  const bVis = dir === 'E' || dir === 'N' ? B : -B, avantVu = dir === 'E' || dir === 'S';
  const F = (L, fill, st = 'rgba(0,0,0,.28)') => I.face(L.map((p) => W(...p)), fill, st);
  // Une boîte locale : les trois faces visibles (flanc visible, bout visible, dessus), couleurs { flanc, bout, dessus }.
  const boite = (a0, a1, b0, b1, z0, z1, c) => {
    const bv = bVis > 0 ? b1 : b0, av = avantVu ? a1 : a0;
    return F([[a0, bv, z0], [a1, bv, z0], [a1, bv, z1], [a0, bv, z1]], c.flanc)
      + F([[av, b0, z0], [av, b1, z0], [av, b1, z1], [av, b0, z1]], c.bout)
      + F([[a0, b0, z1], [a1, b0, z1], [a1, b1, z1], [a0, b1, z1]], c.dessus);
  };
  let g = '';
  // L'ombre au sol.
  const [ox, oy] = I.P(...W(LONG / 2, 0, 0));
  g += `<ellipse cx="${f1(ox)}" cy="${f1(oy)}" rx="${f1(I.unite * 1.95)}" ry="${f1(I.unite * .78)}" fill="rgba(0,0,0,.16)"/>`;
  // Les roues (deux essieux arrière, un avant), du côté caché d'abord : la caisse les recouvre.
  // Le flanc visible est toujours du côté +y (camion selon x) ou +x (camion selon y) : le moyeu y est dessiné.
  const roues = (bb) => [.42, .9, LONG - .55].map((a) => {
    const [wx, wy] = W(a, bb, 0);
    return dir === 'E' || dir === 'O' ? roueY(I, wx, wy - .07, .2, .19, .14) : roue(I, wx - .07, wy, .2, .19, .14);
  }).join('');
  g += roues(-bVis * .92);
  // Le châssis.
  g += boite(.1, LONG - .1, -B * .8, B * .8, .3, Z0, { flanc: '#2f3336', bout: '#26292b', dessus: '#3b3f42' });
  let caisse = '';
  // La CAISSE : le plancher et le fond d'abord (on les voit par le rideau entrouvert), puis le chargement, puis les rideaux.
  const a0 = .05, a1 = .05 + CAISSE, ouvert = o.rideau !== 'ferme';
  const aOuv = a0 + CAISSE * .52;   // le rideau est tiré de l'arrière jusqu'ici
  caisse += F([[a0, -B, Z0], [a1, -B, Z0], [a1, B, Z0], [a0, B, Z0]], '#5a5048');
  caisse += F([[a0, -bVis, Z0], [a1, -bVis, Z0], [a1, -bVis, Z0 + HC], [a0, -bVis, Z0 + HC]], '#d9dbd7');
  if (ouvert && o.charge) {
    // Deux rangées de fûts (et des casiers devant), de la plus éloignée du flanc visible à la plus proche.
    const rang = (bb) => {
      let s = '';
      for (let k = 0; k < 4; k++) {
        const a = a0 + .2 + k * .3;
        if (a > aOuv - .12) break;
        const [cx, cy, cz] = W(a, bb, Z0);
        s += o.charge === 'vides' ? futVide(I, cx, cy, cz, { litres: 30, r: .13 }) : futDebout(I, cx, cy, cz, { litres: 30, r: .13, bande: k % 2 ? 'or' : 'rouge' });
      }
      return s;
    };
    caisse += rang(-bVis * .45) + rang(bVis * .05);
    const [kx, ky, kz] = W(a0 + .12, bVis * .3, Z0);
    caisse += casier(I, Math.min(kx, kx), Math.min(ky, ky), kz, o.charge === 'vides' ? { vide: true } : { capsule: 'bleu' });
  }
  // Le toit, la face avant de la caisse (côté cabine), la face arrière (portes), puis le flanc visible : rideau tiré à l'arrière
  // (l'ouverture), rideau fermé à l'avant, avec ses plis.
  const toile = '#c9cdd0', toileOmbre = '#b4b9bc', bout = avantVu ? '#d3d6d3' : '#e2e4e0';
  caisse += F([[avantVu ? a1 : a0, -B, Z0], [avantVu ? a1 : a0, B, Z0], [avantVu ? a1 : a0, B, Z0 + HC], [avantVu ? a1 : a0, -B, Z0 + HC]], bout);
  if (!avantVu) {
    // Les portes arrière : deux battants, leurs barres de fermeture.
    [-.25, .25].forEach((bb) => { caisse += `<polyline points="${I.pts([W(a0 - .005, bb, Z0 + .1), W(a0 - .005, bb, Z0 + HC - .1)].map((p) => p))}" fill="none" stroke="#8d9397" stroke-width="2"/>`; });
    caisse += `<polyline points="${I.pts([W(a0 - .005, 0, Z0 + .05), W(a0 - .005, 0, Z0 + HC - .05)])}" fill="none" stroke="#6f777c" stroke-width="1.5"/>`;
    caisse += F([[a0 - .006, -B * .9, Z0 + .18], [a0 - .006, -B * .7, Z0 + .18], [a0 - .006, -B * .7, Z0 + .26], [a0 - .006, -B * .9, Z0 + .26]], '#c0392b', 'none')
      + F([[a0 - .006, B * .7, Z0 + .18], [a0 - .006, B * .9, Z0 + .18], [a0 - .006, B * .9, Z0 + .26], [a0 - .006, B * .7, Z0 + .26]], '#c0392b', 'none');
  }
  caisse += F([[a0, -B, Z0 + HC], [a1, -B, Z0 + HC], [a1, B, Z0 + HC], [a0, B, Z0 + HC]], '#e9ebe8');
  const debutRideau = ouvert ? aOuv : a0;
  caisse += F([[debutRideau, bVis, Z0], [a1, bVis, Z0], [a1, bVis, Z0 + HC], [debutRideau, bVis, Z0 + HC]], toile);
  for (let a = debutRideau + .14; a < a1 - .05; a += .17) {
    caisse += `<polyline points="${I.pts([W(a, bVis, Z0 + .04), W(a, bVis, Z0 + HC - .06)])}" fill="none" stroke="${toileOmbre}" stroke-width="1.6"/>`;
  }
  if (ouvert) {
    // Le rideau ramassé en paquet contre l'arrière, et les montants.
    caisse += F([[a0, bVis, Z0], [a0 + .12, bVis, Z0], [a0 + .12, bVis, Z0 + HC], [a0, bVis, Z0 + HC]], toileOmbre);
    caisse += `<polyline points="${I.pts([W(aOuv, bVis, Z0), W(aOuv, bVis, Z0 + HC)])}" fill="none" stroke="#8d9397" stroke-width="2.4"/>`;
  }
  // Les rails haut et bas, la sangle de tension.
  caisse += `<polyline points="${I.pts([W(a0, bVis, Z0 + HC), W(a1, bVis, Z0 + HC)])}" fill="none" stroke="#7d858a" stroke-width="3"/>`
    + `<polyline points="${I.pts([W(a0, bVis, Z0 + .02), W(a1, bVis, Z0 + .02)])}" fill="none" stroke="#55595c" stroke-width="3"/>`;
  // La CABINE : blanche, calandre sombre, pare-brise et vitre latérale ; phares ; pare-chocs.
  const c0 = a1 + .07, c1 = c0 + CAB;
  let cab = '';
  cab += boite(c0, c1, -B * .97, B * .97, .36, .36 + HCAB, { flanc: '#e7e8e4', bout: '#d6d8d3', dessus: '#f2f3f0' });
  cab += F([[c0 + .06, bVis * .985, .86], [c1 - .28, bVis * .985, .86], [c1 - .06, bVis * .985, 1.12], [c1 - .06, bVis * .985, 1.42], [c0 + .06, bVis * .985, 1.42]], '#26323b', 'none');
  cab += F([[c0 + .02, bVis * .985, .5], [c1 - .02, bVis * .985, .5], [c1 - .02, bVis * .985, .56], [c0 + .02, bVis * .985, .56]], '#6f777c', 'none');
  cab += `<polyline points="${I.pts([W(c0 + .04, bVis * .99, .4), W(c0 + .04, bVis * .99, 1.46), W(c1 - .06, bVis * .99, 1.46), W(c1 - .06, bVis * .99, .62)])}" fill="none" stroke="#a9adaa" stroke-width="1.4"/>`
    + F([[c0 + .14, bVis * .99, .78], [c0 + .26, bVis * .99, .78], [c0 + .26, bVis * .99, .82], [c0 + .14, bVis * .99, .82]], '#55595c', 'none');
  const bm = bVis * 1.16;
  cab += `<polyline points="${I.pts([W(c1 - .08, bVis * .99, 1.35), W(c1 - .08, bm, 1.35)])}" fill="none" stroke="#2f3336" stroke-width="2"/>`
    + F([[c1 - .12, bm, 1.05], [c1 - .04, bm, 1.05], [c1 - .04, bm, 1.38], [c1 - .12, bm, 1.38]], '#2f3336', 'none');
  if (avantVu) {
    const av = c1 + .004;
    cab += F([[av, -B * .85, .95], [av, B * .85, .95], [av, B * .85, 1.46], [av, -B * .85, 1.46]], '#26323b', 'none')
      + F([[av, -B * .6, .48], [av, B * .6, .48], [av, B * .6, .8], [av, -B * .6, .8]], '#3a4044', 'none');
    [-B * .78, B * .62].forEach((bb) => { cab += F([[av, bb, .5], [av, bb + .16, .5], [av, bb + .16, .6], [av, bb, .6]], '#ffe8a3', 'none'); });
    cab += F([[av, -B, .32], [av, B, .32], [av, B, .42], [av, -B, .42]], '#3b3f42', 'none');
  }
  g += avantVu ? caisse + cab : cab + caisse;
  // Les roues du côté visible, par-dessus la caisse.
  g += roues(bVis * .92);
  return `<g data-iso-objet="porteur" data-sens="${dir}"${o.charge ? ` data-charge="${o.charge}"` : ''}>${g}</g>`;
}

// LA ROUTE : une suite de segments droits selon x ou y (`points` = [[x, y], …], fermée si `boucle`), enrobé gris, bas-côtés kaki,
// ligne médiane blanche en tirets. `largeur` = la chaussée.
export function route(I, points, o = {}) {
  const L = o.boucle ? [...points, points[0]] : points, lg = o.largeur || 1.5, bc = lg / 2 + .35;
  const bande = (p, q, demi, coul) => {
    const dx = Math.sign(q[0] - p[0]), dy = Math.sign(q[1] - p[1]);
    const x0 = Math.min(p[0], q[0]) - (dy ? demi : demi), x1 = Math.max(p[0], q[0]) + (dy ? demi : demi);
    const y0 = Math.min(p[1], q[1]) - demi, y1 = Math.max(p[1], q[1]) + demi;
    return I.face(dx ? [[x0, p[1] - demi, 0], [x1, p[1] - demi, 0], [x1, p[1] + demi, 0], [x0, p[1] + demi, 0]]
      : [[p[0] - demi, y0, 0], [p[0] + demi, y0, 0], [p[0] + demi, y1, 0], [p[0] - demi, y1, 0]], coul, 'none');
  };
  let g = '';
  for (let k = 0; k < L.length - 1; k++) g += bande(L[k], L[k + 1], bc, '#bdb68f');
  for (let k = 0; k < L.length - 1; k++) g += bande(L[k], L[k + 1], lg / 2, '#6c6f70');
  for (let k = 0; k < L.length - 1; k++) {
    const p = L[k], q = L[k + 1], n = Math.hypot(q[0] - p[0], q[1] - p[1]);
    for (let t = .3; t < n - .3; t += .9) {
      const u = t / n, v = Math.min(1, (t + .45) / n);
      g += `<polyline points="${I.pts([[p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, .002], [p[0] + (q[0] - p[0]) * v, p[1] + (q[1] - p[1]) * v, .002]])}" fill="none" stroke="#f4f4f1" stroke-width="${Math.max(1.5, I.unite / 22).toFixed(1)}"/>`;
    }
  }
  return `<g data-iso-objet="route">${g}</g>`;
}

// Un nom de lieu, à l'écran (pas dans le plan) : pastille claire, texte sombre, au-dessus du point (x, y, z).
// La taille suit l'échelle de la carte (`I.unite`) : sur une carte réduite, le nom reste lisible.
export function nomLieu(I, x, y, z, texte) {
  const fs = Math.max(13, I.unite * .5), k = fs / 15;
  const [px, py] = I.P(x, y, z), w = Math.ceil(largeurTexte(texte) * 1.08 * k) + 20 * k, h = 26 * k;
  return `<g data-iso-lieu><rect x="${f1(px - w / 2)}" y="${f1(py - h - 4 * k)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(6 * k)}" fill="#fdfbf7" stroke="#55504a" stroke-width="${f1(1.4 * k)}"/>`
    + `<text x="${f1(px)}" y="${f1(py - 4 * k - h * .3)}" text-anchor="middle" font-size="${f1(fs)}" font-weight="700" font-family="Inter, system-ui, 'Segoe UI', Arial, sans-serif" fill="#1a1915">${ech(texte)}</text></g>`;
}

// LES BÂTIMENTS. (x, y) = le coin du bâtiment au sol le plus éloigné de l'élève (x et y les plus petits) ; la façade utile (portes,
// comptoir) est sur le côté y le plus grand, tourné vers l'élève. `nom` (facultatif) : la pastille au-dessus.
export const BATIMENTS = ['plateforme', 'bar', 'brasserie', 'lavage'];
export function batiment(I, type, x, y, o = {}) {
  if (!BATIMENTS.includes(type)) throw new Error(`kit iso : bâtiment « ${type} » inconnu (${BATIMENTS.join(', ')})`);
  const { face, boite, pts } = I;
  let g = '', haut = 2;
  if (type === 'plateforme') {
    // Un grand entrepôt bardé, toit plat, une rangée de portes de quai à butoirs jaunes et noirs, une bande de bureau vitrée.
    const W = 7, D = 3.6, H = 2.1; haut = H;
    g += face([[x - .3, y - .3, 0], [x + W + .3, y - .3, 0], [x + W + .3, y + D + .55, 0], [x - .3, y + D + .55, 0]], '#cfc8b6', 'none');
    g += boite(x, y, 0, W, D, H, ['#b9bec1', '#dfe2e0', '#c9cdcb']);
    for (let k = 0; k < 6; k++) {
      const x0 = x + .5 + k * 1.05;
      g += face([[x0, y + D + .005, .25], [x0 + .7, y + D + .005, .25], [x0 + .7, y + D + .005, 1.25], [x0, y + D + .005, 1.25]], '#7f878c', 'rgba(0,0,0,.35)');
      for (let z = .4; z < 1.2; z += .16) g += `<polyline points="${pts([[x0, y + D + .006, z], [x0 + .7, y + D + .006, z]])}" fill="none" stroke="#6a7176" stroke-width="1"/>`;
      g += face([[x0 - .06, y + D + .006, .1], [x0 - .01, y + D + .006, .1], [x0 - .01, y + D + .006, .36], [x0 - .06, y + D + .006, .36]], '#e5b800', 'none')
        + face([[x0 + .71, y + D + .006, .1], [x0 + .76, y + D + .006, .1], [x0 + .76, y + D + .006, .36], [x0 + .71, y + D + .006, .36]], '#e5b800', 'none');
    }
    g += face([[x + W + .005, y + .3, 1.2], [x + W + .005, y + D - .3, 1.2], [x + W + .005, y + D - .3, 1.75], [x + W + .005, y + .3, 1.75]], '#3d4a55', 'none');
    for (let yy = y + .6; yy < y + D - .3; yy += .5) g += `<polyline points="${pts([[x + W + .006, yy, 1.2], [x + W + .006, yy, 1.75]])}" fill="none" stroke="#9aa3aa" stroke-width="1.2"/>`;
    g += `<polyline points="${pts([[x, y + D, H], [x + W, y + D, H], [x + W, y, H]])}" fill="none" stroke="#8d9397" stroke-width="2.5"/>`;
  } else if (type === 'bar') {
    // Le bar de plage : le sable, la mer derrière (gris-bleu, des vagues), une cabane en planches, un auvent rayé, un parasol, deux tables.
    const W = 2.6, D = 1.8; haut = 1.9;
    g += face([[x - 1.6, y - 2.2, 0], [x + W + 2, y - 2.2, 0], [x + W + 2, y - .5, 0], [x - 1.6, y - .5, 0]], '#a9bcc0', 'none');
    for (let k = 0; k < 5; k++) {
      const yy = y - 2 + k * .32;
      g += `<polyline points="${pts([[x - 1.4, yy, .002], [x - .6, yy + .08, .002], [x + .4, yy, .002], [x + 1.4, yy + .08, .002], [x + 2.4, yy, .002], [x + W + 1.8, yy + .08, .002]])}" fill="none" stroke="#e8eef0" stroke-width="1.4"/>`;
    }
    g += face([[x - 1.6, y - .5, 0], [x + W + 2, y - .5, 0], [x + W + 2, y + D + 1.8, 0], [x - 1.6, y + D + 1.8, 0]], '#e6d3a3', 'none');
    g += boite(x, y, 0, W, D, 1.35, ['#8a6a48', '#b0875c', '#9a7550']);
    for (let z = .15; z < 1.35; z += .17) g += `<polyline points="${pts([[x, y + D + .004, z], [x + W, y + D + .004, z], [x + W + .004, y + D, z], [x + W + .004, y, z]])}" fill="none" stroke="#7e5f3f" stroke-width="1"/>`;
    // Le comptoir ouvert, puis le toit à une pente.
    g += face([[x + .4, y + D + .006, .55], [x + W - .4, y + D + .006, .55], [x + W - .4, y + D + .006, 1.15], [x + .4, y + D + .006, 1.15]], '#3a2f26', 'none');
    g += boite(x + .3, y + D, .5, W - .6, .25, .06, ['#d9c2a0', '#c4a77f', '#b39770']);
    g += face([[x - .1, y - .1, 1.6], [x + W + .1, y - .1, 1.6], [x + W + .1, y + D + .05, 1.35], [x - .1, y + D + .05, 1.35]], '#a3794f', 'rgba(0,0,0,.3)')
      + face([[x + W + .1, y - .1, 1.6], [x + W + .1, y + D + .05, 1.35], [x + W + .1, y + D + .05, 1.3], [x + W + .1, y - .1, 1.55]], '#7e5f3f', 'none');
    // L'auvent rayé ocre et blanc au-dessus du comptoir.
    for (let k = 0; k < 8; k++) {
      const x0 = x + .2 + k * (W - .4) / 8, x1 = x0 + (W - .4) / 8;
      g += face([[x0, y + D, 1.3], [x1, y + D, 1.3], [x1, y + D + .55, .98], [x0, y + D + .55, .98]], k % 2 ? '#f1ede4' : '#c98a2e', 'rgba(0,0,0,.2)');
    }
    // Le parasol et deux tables rondes.
    const para = (px, py) => {
      let s = `<polyline points="${pts([[px, py, 0], [px, py, 1.35]])}" fill="none" stroke="#6a5a48" stroke-width="2.5"/>`;
      const n = 10, R = .7;
      for (let k = 0; k < n; k++) {
        const a0 = k * 2 * Math.PI / n, a1 = (k + 1) * 2 * Math.PI / n;
        s += face([[px, py, 1.55], [px + R * Math.cos(a0), py + R * Math.sin(a0), 1.2], [px + R * Math.cos(a1), py + R * Math.sin(a1), 1.2]], k % 2 ? '#f1ede4' : '#c98a2e', 'rgba(0,0,0,.15)');
      }
      return s;
    };
    const table = (tx, ty) => `<polyline points="${pts([[tx, ty, 0], [tx, ty, .45]])}" fill="none" stroke="#55504a" stroke-width="2"/>`
      + `<ellipse cx="${f1(I.P(tx, ty, .45)[0])}" cy="${f1(I.P(tx, ty, .45)[1])}" rx="${f1(.28 * I.unite * K1)}" ry="${f1(.28 * I.unite * K2)}" fill="#f1ede4" stroke="#8a7f70"/>`;
    g += table(x + W + .8, y + D + .2) + para(x + W + .8, y + D + .2) + table(x + .5, y + D + 1.1);
  } else if (type === 'brasserie') {
    // La brasserie : un bâtiment de brique à toit en sheds, une cheminée, trois cuves inox à côté.
    const W = 4.6, D = 3, H = 1.9; haut = 2.9;
    g += face([[x - .3, y - .3, 0], [x + W + 2.2, y - .3, 0], [x + W + 2.2, y + D + 1, 0], [x - .3, y + D + 1, 0]], '#cfc8b6', 'none');
    g += boite(x + 3.7, y + .1, 0, .45, .45, 2.9, ['#7a3f2c', '#9a4f35', '#86452f']);
    g += boite(x, y, 0, W, D, H, ['#8f4a32', '#b0603f', '#9a5236']);
    for (let z = .2; z < H; z += .2) g += `<polyline points="${pts([[x, y + D + .004, z], [x + W, y + D + .004, z], [x + W + .004, y + D, z], [x + W + .004, y, z]])}" fill="none" stroke="#8a4a32" stroke-width=".8" opacity=".7"/>`;
    for (let k = 0; k < 4; k++) {
      const x0 = x + .35 + k * 1.05;
      g += face([[x0, y + D + .006, .8], [x0 + .55, y + D + .006, .8], [x0 + .55, y + D + .006, 1.55], [x0, y + D + .006, 1.55]], '#3d4a55', 'rgba(0,0,0,.3)');
    }
    // Les sheds : trois pans en dents de scie.
    for (let k = 0; k < 3; k++) {
      const y0 = y + k * D / 3, y1 = y0 + D / 3;
      g += face([[x, y0, H], [x + W, y0, H], [x + W, y1, H + .45], [x, y1, H + .45]], '#6f777c', 'rgba(0,0,0,.25)')
        + face([[x, y1, H], [x + W, y1, H], [x + W, y1, H + .45], [x, y1, H + .45]], '#a9c0c8', 'rgba(0,0,0,.25)')
        + face([[x + W, y0, H], [x + W, y1, H], [x + W, y1, H + .45]], '#9a5236', 'none');
    }
    // Les cuves (cylindres inox, toit conique).
    [[W + .7, .5], [W + 1.6, .5], [W + .7, 1.6]].forEach(([dx, dy]) => {
      const cx = x + dx, cy = y + dy, r = .42, h = 2.2;
      g += fut(I, cx, cy, 0, r, h);
      const [tx, ty] = I.P(cx, cy, h), [sx, sy] = I.P(cx, cy, h + .35), rx = r * I.unite * K1, ry = r * I.unite * K2;
      g += `<path d="M${f1(tx - rx)},${f1(ty)} L${f1(sx)},${f1(sy)} L${f1(tx + rx)},${f1(ty)} A${f1(rx)},${f1(ry)} 0 0 1 ${f1(tx - rx)},${f1(ty)} Z" fill="#c9ced1" stroke="#7d858a" stroke-width=".8"/>`;
    });
  } else {
    // Le petit bâtiment de lavage (légendé par la scène) : bardage gris, une porte, une buée de vapeur.
    const W = 1.8, D = 1.4, H = 1.2; haut = H;
    g += boite(x, y, 0, W, D, H, ['#9aa3aa', '#c9cfd3', '#b3bbc0']);
    g += face([[x + .5, y + D + .005, 0], [x + 1.2, y + D + .005, 0], [x + 1.2, y + D + .005, .85], [x + .5, y + D + .005, .85]], '#5d666c', 'none');
    const [vx, vy] = I.P(x + .9, y + .7, H + .1), u = I.unite;
    [0, 1, 2].forEach((k) => { g += `<circle cx="${f1(vx + u * .12 * k)}" cy="${f1(vy - u * (.15 + .22 * k))}" r="${f1(u * (.16 + .05 * k))}" fill="rgba(236,240,242,${(.85 - .2 * k).toFixed(2)})"/>`; });
  }
  if (o.nom) {
    const cx = { plateforme: 3.5, bar: 1.3, brasserie: 2.3, lavage: .9 }[type], cy = { plateforme: 1.8, bar: .9, brasserie: 1.5, lavage: .7 }[type];
    g += nomLieu(I, x + cx, y + cy, haut + .6, o.nom);
  }
  return `<g data-iso-objet="batiment" data-type="${type}">${g}</g>`;
}

// LA SCÈNE « TRAJET » de l'animation à questions (chantier D-10, lot 2 ; ENT-6.10 : la boucle des vides). Une carte schématique au lieu
// d'un entrepôt : des lieux (bâtiments), une route, des arrêts sur la route, un camion qui roule de l'un à l'autre.
//   scene: { trajet: {
//     sol: [x0, y0, x1, y1],                                         // le terrain (facultatif)
//     route: [[3, 4.6], [3, 12.6], [22.5, 12.6], [22.5, 8.2]],          // segments selon x ou y
//     lieux: [{ id: 'buchelay', type: 'plateforme', x: 9, y: 7.6, nom: 'Plateforme de Buchelay' }, …],   // type : BATIMENTS
//     arrets: { buchelay: [12.5, 12.6], malo: [22.5, 8.4] },        // des points SUR la route
//   }, acteurs: { camion: { type: 'porteur' } } }
// Le camion est toujours dessiné par-dessus le décor : la route doit passer DEVANT les bâtiments (côté élève), ce que le contrôle
// ne vérifie pas (c'est à la page d'essai de le montrer).
export function compilerTrajet(S, ou = 'scène') {
  const err = (m) => { throw new Error(`${ou} : ${m}`); };
  const T = S && S.trajet;
  if (!T) err('`scene.trajet` manque');
  const R = T.route;
  if (!Array.isArray(R) || R.length < 2) err('`trajet.route` : au moins deux points');
  const segs = [];
  let long = 0;
  for (let k = 0; k < R.length - 1; k++) {
    const p = R[k], q = R[k + 1];
    if (p[0] !== q[0] && p[1] !== q[1]) err(`route : le segment n° ${k + 1} n'est ni selon x ni selon y`);
    const n = Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]);
    if (!n) err(`route : le segment n° ${k + 1} est nul`);
    segs.push({ p, q, s0: long, n });
    long += n;
  }
  // L'abscisse d'un point sur la route (ou une erreur s'il n'y est pas).
  const abscisse = (pt, quoi) => {
    for (const g of segs) {
      const dx = Math.sign(g.q[0] - g.p[0]), dy = Math.sign(g.q[1] - g.p[1]);
      const surX = dx && pt[1] === g.p[1] && (pt[0] - g.p[0]) * dx >= 0 && (g.q[0] - pt[0]) * dx >= 0;
      const surY = dy && pt[0] === g.p[0] && (pt[1] - g.p[1]) * dy >= 0 && (g.q[1] - pt[1]) * dy >= 0;
      if (surX || surY) return g.s0 + Math.abs(pt[0] - g.p[0]) + Math.abs(pt[1] - g.p[1]);
    }
    return err(`${quoi} [${pt}] n'est pas sur la route`);
  };
  const lieux = (T.lieux || []).map((l, i) => {
    if (!l || !l.id) err(`lieu n° ${i + 1} : il manque l'\`id\``);
    if (!BATIMENTS.includes(l.type)) err(`lieu « ${l.id} » : type inconnu « ${l.type} » (${BATIMENTS.join(', ')})`);
    return { id: l.id, type: l.type, x: +l.x || 0, y: +l.y || 0, nom: l.nom || '' };
  });
  const arrets = {}, places = {};
  Object.entries(T.arrets || {}).forEach(([id, pt]) => {
    arrets[id] = { x: pt[0], y: pt[1], s: abscisse(pt, `arrêt « ${id} »`) };
    places[id] = { x: pt[0] - .5, y: pt[1] - .5 };
  });
  if (!Object.keys(arrets).length) err('`trajet.arrets` : au moins un arrêt');
  lieux.forEach((l) => { if (!places[l.id]) places[l.id] = { x: l.x, y: l.y }; });
  const acteurs = {};
  Object.entries(S.acteurs || {}).forEach(([id, a]) => {
    if (!a || a.type !== 'porteur') err(`acteur « ${id} » : une scène trajet n'a qu'un acteur de type « porteur »`);
    acteurs[id] = { id, type: 'porteur' };
  });
  // La position à l'abscisse s, et le sens du camion (selon le sens de marche : `avance` = vers les s croissants).
  const position = (s, avance = true) => {
    const t = Math.max(0, Math.min(long, s));
    const g = segs.find((x) => t <= x.s0 + x.n + 1e-9) || segs[segs.length - 1];
    const u = (t - g.s0) / g.n, dx = Math.sign(g.q[0] - g.p[0]), dy = Math.sign(g.q[1] - g.p[1]);
    const sens = dx ? ((dx > 0) === avance ? 'E' : 'O') : ((dy > 0) === avance ? 'S' : 'N');
    return { x: g.p[0] + (g.q[0] - g.p[0]) * u, y: g.p[1] + (g.q[1] - g.p[1]) * u, sens };
  };
  return { trajet: true, sol: T.sol || null, route: R, lieux, arrets, places, acteurs, lots: {}, decor: [], couloirs: [], long, position,
    dehors: () => 0, aDroite: () => true, couloirEn: () => null };
}

// Le décor d'une scène trajet : le terrain, la route, les bâtiments (du fond vers l'élève) et leurs noms.
export function dessinerTrajet(I, sc) {
  const xs = [...sc.route.map((p) => p[0]), ...sc.lieux.map((l) => l.x)], ys = [...sc.route.map((p) => p[1]), ...sc.lieux.map((l) => l.y)];
  const [x0, y0, x1, y1] = sc.sol || [Math.min(...xs) - 3, Math.min(...ys) - 3.5, Math.max(...xs) + 4.5, Math.max(...ys) + 3];
  let g = I.face([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], '#ddd5c2', 'none');
  g += route(I, sc.route);
  sc.lieux.slice().sort((a, b) => (a.x + a.y) - (b.x + b.y)).forEach((l) => { g += batiment(I, l.type, l.x, l.y, { nom: l.nom }); });
  return g;
}
