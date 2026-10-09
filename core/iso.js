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
export const TYPES_DECOR = ['sol', 'mur', 'allee', 'couloirMasse', 'reperesProfondeur', 'texteSol'];
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
      s += face([[x - .05, y - .05, 0], [x + 1.05, y - .05, 0], [x + 1.05, y + n + .05, 0], [x - .05, y + n + .05, 0]], '#f6f2e9', '#b9b3a6');
      for (let k = 0; k < n; k++) s += `<polygon points="${pts([[x + .08, y + k + .08, 0], [x + .92, y + k + .08, 0], [x + .92, y + k + .92, 0], [x + .08, y + k + .92, 0]])}" fill="none" stroke="#c9c3b6" stroke-dasharray="5 4"/>`;
      // Le panneau du couloir, sur le mur du fond (ou juste derrière la première place s'il n'y a pas de mur).
      if (d.panneau) {
        const ym = yMur != null ? yMur : y - 0.5;
        s += face([[x + .15, ym, .45], [x + .85, ym, .45], [x + .85, ym, .85], [x + .15, ym, .85]], '#1f5f3a', '#0f3d24');
        const [lx, ly] = P(x + .5, ym, .65);
        s += `<text x="${lx}" y="${ly + 6}" text-anchor="middle" font-size="17" font-weight="800" fill="#fff" transform="rotate(30 ${lx} ${ly})">${ech(d.panneau)}</text>`;
      }
      // Flèche verte = entrée (côté gauche du couloir), flèche rouge = sortie (côté droit).
      if (d.fleches) {
        const b = y + n;
        s += face([[x + .22, b + .95, 0], [x + .38, b + .95, 0], [x + .38, b + .45, 0], [x + .48, b + .45, 0], [x + .3, b + .15, 0], [x + .12, b + .45, 0], [x + .22, b + .45, 0]], '#107c41', 'none');
        s += face([[x + .62, b + .15, 0], [x + .78, b + .15, 0], [x + .78, b + .65, 0], [x + .88, b + .65, 0], [x + .7, b + .95, 0], [x + .52, b + .65, 0], [x + .62, b + .65, 0]], '#9d2727', 'none');
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
    if (d.type === 'sol' || d.type === 'allee') { const [x0, y0] = d.de, [x1, y1] = d.a; L.push([x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]); }
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
export const HAUT_RETENTION = ZB + KH;   // le dessus des fûts (pour viser une bulle au-dessus d'une charge)

function fut(I, cx, cy, z) {
  const { P, unite } = I;
  const [bx, by] = P(cx, cy, z), [tx, ty] = P(cx, cy, z + KH), rx = KR * unite * K1, ry = KR * unite * K2;
  let g = `<path d="M${bx - rx},${by} L${tx - rx},${ty} L${tx + rx},${ty} L${bx + rx},${by} A${rx},${ry} 0 0 1 ${bx - rx},${by} Z" fill="url(#isoMetal)" stroke="#6f777c" stroke-width=".8"/>`;
  [0.22, 0.78].forEach((f) => { const yy = by + (ty - by) * f; g += `<path d="M${bx - rx},${yy} A${rx},${ry} 0 0 0 ${bx + rx},${yy}" fill="none" stroke="#7d858a" stroke-width="1.8"/>`; });
  return g + `<ellipse cx="${tx}" cy="${ty}" rx="${rx}" ry="${ry}" fill="#eef0f1" stroke="#7d858a"/><ellipse cx="${tx}" cy="${ty}" rx="${rx * .32}" ry="${ry * .32}" fill="#4a4f52"/>`;
}
function retention(I, x, y, z) {
  const { pts, boite } = I;
  let g = '';
  [[.06, .06], [.78, .06], [.06, .78], [.78, .78]].forEach(([a, b]) => { g += boite(x + a, y + b, z, .16, .16, .05, ['#2a2d2f', '#1e2123', '#16191a']); });
  g += boite(x + .03, y + .03, z + .05, .94, .94, ZB - .05, ['#3d4245', '#2f3336', '#24282a']);
  for (let k = 1; k < 6; k++) {
    const t = .03 + k * .94 / 6;
    g += `<polyline points="${pts([[x + t, y + .97, z + .06], [x + t, y + .97, z + ZB - .02]])}" stroke="#1b1e20" stroke-width="2"/><polyline points="${pts([[x + .97, y + t, z + .06], [x + .97, y + t, z + ZB - .02]])}" stroke="#1b1e20" stroke-width="2"/>`;
  }
  return g;
}
const PLACES_FUTS = [[.28, .28], [.72, .28], [.28, .72], [.72, .72]];

// Une charge posée ou portée. `p` : { x, y, z, charge: 'retention', futs (0-4, 4 par défaut), lot,
// etiq, etiqTon, alerte }. `sc` : la scène compilée (couleurs des lots, côté de l'étiquette).
export function dessinerCharge(I, p, sc) {
  const { P } = I;
  let g = retention(I, p.x, p.y, p.z);
  const n = p.futs == null ? 4 : p.futs;
  PLACES_FUTS.slice(0, n).sort((a, b) => (a[0] + a[1]) - (b[0] + b[1])).forEach(([dx, dy]) => { g += fut(I, p.x + dx, p.y + dy, p.z + ZB); });
  const [cx, cy] = P(p.x + .5, p.y + .5, p.z + HAUT_RETENTION + .12);
  const L = p.lot ? sc.lots[p.lot] : null;
  if (L) g += `<rect x="${cx - 34}" y="${cy - 22}" width="68" height="22" rx="5" fill="${L.c}" stroke="rgba(0,0,0,.35)"/><text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="14" font-weight="800" fill="${L.t}">lot ${ech(p.lot)}</text>`;
  if (p.etiq) {
    const coul = TONS_SOL[p.etiqTon] || TONS_SOL.neutre;
    if (sc.aDroite(p.x)) { const [ex, ey] = P(p.x + 1.08, p.y + .62, 0); g += `<text x="${ex}" y="${ey}" font-size="13" font-weight="700" fill="${coul}">${ech(p.etiq)}</text>`; }
    else g += `<text x="${cx}" y="${cy - 30}" text-anchor="middle" font-size="13" font-weight="700" fill="${coul}">${ech(p.etiq)}</text>`;
  }
  if (p.alerte) g += `<circle cx="${cx + 44}" cy="${cy - 12}" r="15" fill="#9d2727"/><text x="${cx + 44}" y="${cy - 6}" text-anchor="middle" font-size="18" font-weight="800" fill="#fff">!</text>`;
  return g;
}

/* ============================== chariot élévateur frontal (fourches vers le fond) */
// `c` : { x, y (bout des fourches), lev (hauteur des fourches), charge (une charge portée ou null) }.
// Le cariste est une silhouette SANS VISAGE (règle du projet).
export function dessinerChariotFrontal(I, c, sc) {
  const { P, boite } = I;
  const x = c.x, y = c.y, l = c.lev;
  let g = '';
  // fourches (au fond, dessinées d'abord)
  g += boite(x + .2, y, l, .12, 1.02, .05, ['#4a4f52', '#33373a', '#2a2e30']) + boite(x + .68, y, l, .12, 1.02, .05, ['#4a4f52', '#33373a', '#2a2e30']);
  if (c.charge) g += dessinerCharge(I, Object.assign({}, c.charge, { x, y, z: l + .05 }), sc);
  // mât
  g += boite(x + .1, y + 1.02, 0, .1, .1, 2.1, ['#5a5f62', '#45494c', '#3a3e41']) + boite(x + .8, y + 1.02, 0, .1, .1, 2.1, ['#5a5f62', '#45494c', '#3a3e41']);
  g += boite(x + .1, y + 1.02, 2.0, .8, .1, .1, ['#5a5f62', '#45494c', '#3a3e41']);
  g += boite(x + .18, y + 1.0, l, .64, .06, .32, ['#4a4f52', '#3a3e41', '#33373a']); // tablier
  // roues côté gauche (cachées en partie par la caisse) : rondes (06/10/2026, ENT-1.1 §7.9)
  g += roue(I, x + .04, y + 1.36, .15, .15, .12) + roue(I, x + .04, y + 1.9, .15, .15, .12);
  // caisse et contrepoids
  g += boite(x + .1, y + 1.12, .12, .8, .75, .55, ['#e58a2a', '#d97a1c', '#b5631a']);
  g += boite(x + .1, y + 1.85, .12, .8, .3, .75, ['#c86d18', '#b5631a', '#9a5415']);
  // siège + cariste (silhouette sans visage)
  g += boite(x + .32, y + 1.5, .67, .36, .3, .12, ['#2a2d2f', '#1d1f20', '#151718']);
  const [hx, hy] = P(x + .5, y + 1.55, 1.25);
  g += `<path d="M${hx - 14},${hy + 34} Q${hx},${hy + 4} ${hx + 14},${hy + 34} Z" fill="#33393d"/><circle cx="${hx}" cy="${hy}" r="10" fill="#33393d"/>`;
  // roues côté droit (devant)
  g += roue(I, x + .86, y + 1.36, .15, .15, .12) + roue(I, x + .86, y + 1.9, .15, .15, .12);
  // protège-conducteur
  [[.14, 1.2], [.82, 1.2], [.14, 1.95], [.82, 1.95]].forEach(([a, b]) => { g += boite(x + a, y + b, .67, .05, .05, 1.0, ['#3a3e41', '#2a2e30', '#222527']); });
  g += boite(x + .12, y + 1.18, 1.67, .78, .84, .05, ['#3a3e41', '#2a2e30', '#222527']);
  return g;
}

/* ===================================================== les objets mobiles */
// Les charges visibles du fond vers l'avant (et de gauche à droite), puis les acteurs.
export function dessinerObjets(I, sc, charges, acteurs) {
  const portees = new Set(acteurs.map((a) => a.charge).filter(Boolean));
  const ps = charges.filter((p) => p.visible && !portees.has(p)).sort((a, b) => (a.x + a.y) - (b.x + b.y));
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
export function facadeQuai(I, portes = ['6', '7', '8']) {
  const { face, boite, pts, P } = I;
  const X = [1.0, 3.6, 6.2], noir = ['#111', '#1a1a1a', '#0c0c0c'];
  let g = face([[-1.5, -0.4, 0], [10, -0.4, 0], [10, 8.5, 0], [-1.5, 8.5, 0]], '#bdb8ae', 'none');
  X.forEach((dx) => { g += face([[dx - .05, 0, 0], [dx, 0, 0], [dx, 5, 0], [dx - .05, 5, 0]], '#e7c628', 'none') + face([[dx + 1.2, 0, 0], [dx + 1.25, 0, 0], [dx + 1.25, 5, 0], [dx + 1.2, 5, 0]], '#e7c628', 'none'); });
  g += boite(-1, -0.5, 0, 10.5, 0.5, 2.75, ['#8d969b', '#aab2b7', '#949ca1']);
  for (let x = -0.8; x < 9.5; x += 0.35) g += `<polyline points="${pts([[x, 0, 0], [x, 0, 2.75]])}" stroke="rgba(0,0,0,.08)"/>`;
  X.forEach((dx, n) => {
    g += face([[dx - .12, 0.001, 0], [dx + 1.32, 0.001, 0], [dx + 1.32, 0.001, 2.2], [dx - .12, 0.001, 2.2]], '#2a2d30', 'none');
    g += face([[dx, 0.002, 0.95], [dx + 1.2, 0.002, 0.95], [dx + 1.2, 0.002, 2.08], [dx, 0.002, 2.08]], '#c4cacd', '#8d969b');
    for (let z = 1.12; z < 2.08; z += 0.2) g += `<polyline points="${pts([[dx, 0.003, z], [dx + 1.2, 0.003, z]])}" stroke="#98a1a6"/>`;
    g += boite(dx + .05, 0, 0.75, .16, .12, .2, noir) + boite(dx + .99, 0, 0.75, .16, .12, .2, noir);
    g += face([[dx + .35, 0.004, 2.32], [dx + .85, 0.004, 2.32], [dx + .85, 0.004, 2.62], [dx + .35, 0.004, 2.62]], '#1f5f3a', '#0f3d24');
    const [lx, ly] = P(dx + .6, 0.004, 2.47);
    g += `<text x="${lx.toFixed(1)}" y="${(ly + 6).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="800" fill="#fff" transform="rotate(30 ${lx.toFixed(1)} ${ly.toFixed(1)})">${ech(portes[n] || '')}</text>`;
  });
  g += boite(-1, 0, 0, 10.5, 0.35, 0.75, ['#a7a39b', '#b9b5ad', '#9a968e']);
  X.forEach((dx) => { g += boite(dx + .05, 0.35, 0.3, .16, .12, .3, noir) + boite(dx + .99, 0.35, 0.3, .16, .12, .3, noir); });
  g += face([[8.3, 0.001, 0], [8.95, 0.001, 0], [8.95, 0.001, 1.5], [8.3, 0.001, 1.5]], '#3b4a55', 'none');
  const [ax, ay] = P(8.62, 0.002, 1.75);
  g += `<text x="${ax.toFixed(1)}" y="${ay.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#1d1d1b" transform="rotate(30 ${ax.toFixed(1)} ${ay.toFixed(1)})">Accueil chauffeurs</text>`;
  return g;
}
// Où se gare un camion à la porte n (0, 1, 2) de `facadeQuai` : son x.
export const X_PORTE_FACADE = [1.1, 3.7, 6.3];

// Un camion porteur (caisse blanche, cabine bleue) en marche arrière vers la façade : (x, yr) = coin de
// l'arrière de la caisse. Roues rondes.
export function camionPorteur(I, x, yr) {
  const { boite, face, P } = I;
  let g = '';
  const [ox, oy] = P(x + .5, yr + 1.8, 0);
  g += `<ellipse cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" rx="${(I.unite * 1.9).toFixed(1)}" ry="${(I.unite * .75).toFixed(1)}" fill="rgba(0,0,0,.15)"/>`;
  [0.56, 1.06, 3.06].forEach((dy) => { g += roue(I, x + .04, yr + dy, .2, .19, .14) + roue(I, x + .82, yr + dy, .2, .19, .14); });
  g += boite(x + .1, yr, .33, .8, 3.5, .13, ['#3b3f42', '#2f3336', '#26292b']);
  g += boite(x, yr, .46, 1, 2.55, 1.5, ['#f4f4f1', '#e4e5e1', '#d3d5d0']);
  g += face([[x + 1, yr, .5], [x + 1, yr + 2.55, .5], [x + 1, yr + 2.55, .6], [x + 1, yr, .6]], '#2f5f8e', 'none');
  g += boite(x + .03, yr + 2.6, .36, .94, .92, 1.2, ['#3d6e9e', '#2f5f8e', '#284f78']);
  g += face([[x + .1, yr + 3.52, 1.02], [x + .9, yr + 3.52, 1.02], [x + .9, yr + 3.52, 1.46], [x + .1, yr + 3.52, 1.46]], '#1d2a35', 'none');
  g += face([[x + .97, yr + 2.68, 1.05], [x + .97, yr + 3.25, 1.05], [x + .97, yr + 3.25, 1.45], [x + .97, yr + 2.68, 1.45]], '#1d2a35', 'none');
  g += face([[x + .15, yr + 3.53, .5], [x + .3, yr + 3.53, .5], [x + .3, yr + 3.53, .6], [x + .15, yr + 3.53, .6]], '#ffe8a3', 'none')
    + face([[x + .7, yr + 3.53, .5], [x + .85, yr + 3.53, .5], [x + .85, yr + 3.53, .6], [x + .7, yr + 3.53, .6]], '#ffe8a3', 'none');
  return g;
}

// L'ouverture de la porte de quai vue de l'intérieur : x de 2,4 à 3,6, y = 0 (plan du mur), 2,05 m de haut.
export const OUVERTURE_QUAI = { x0: 2.4, x1: 3.6, h: 2.05 };
// Le polygone de l'ouverture (pour un clipPath).
export const ouvertureQuai = (I) => I.pts([[2.4, 0, 0], [3.6, 0, 0], [3.6, 0, 2.05], [2.4, 0, 2.05]]);
// Le sol du quai côté entrepôt, avec la zone de réception marquée (pointillés jaunes, `nomZone` écrit au sol)
// et la bande jaune et noire du seuil.
export function solQuai(I, nomZone = 'Zone de réception') {
  const { face, pts, P } = I;
  let g = face([[-1.2, 0, 0], [7.5, 0, 0], [7.5, 6, 0], [-1.2, 6, 0]], '#e4dfd3', '#c9c3b6');
  g += `<polygon data-iso-zone points="${pts([[2.35, 1.9, 0], [3.85, 1.9, 0], [3.85, 3.6, 0], [2.35, 3.6, 0]])}" fill="rgba(231,198,40,.12)" stroke="#d1a90f" stroke-width="3" stroke-dasharray="10 6"/>`;
  const [tx, ty] = P(4.0, 2.75, 0);
  g += `<text x="${(tx + 4).toFixed(1)}" y="${(ty + 4).toFixed(1)}" font-size="13" font-weight="800" fill="#555047" transform="rotate(-30 ${tx.toFixed(1)} ${ty.toFixed(1)})">${ech(String(nomZone).toUpperCase())}</text>`;
  for (let k = 0; k < 8; k++) { const x = 2.4 + k * 0.15; g += face([[x, 0, 0], [x + 0.15, 0, 0], [x + 0.15, 0.18, 0], [x, 0.18, 0]], k % 2 ? '#1b1b1b' : '#e7c628', 'none'); }
  return g;
}
// Le niveleur de quai (plaque entre le quai et la remorque) : dessiné AVEC LE SOL, avant tout ce qui passe
// dessus. `part` : 'dedans' (dans la remorque, à clipper) ou 'dehors' (la partie devant le mur).
export function niveleur(I, part = 'dedans') {
  const { face, pts } = I;
  if (part === 'dehors') return face([[2.45, 0, 0.004], [3.55, 0, 0.004], [3.55, 0.2, 0.004], [2.45, 0.2, 0.004]], '#8b9094', '#6d7276');
  let g = face([[2.45, -0.6, 0.004], [3.55, -0.6, 0.004], [3.55, 0.2, 0.004], [2.45, 0.2, 0.004]], '#8b9094', '#6d7276');
  for (let k = 0; k < 7; k++) { const x = 2.45 + k * 1.1 / 7; g += face([[x, -0.6, 0.005], [x + 1.1 / 7, -0.6, 0.005], [x + 1.1 / 7, -0.5, 0.005], [x, -0.5, 0.005]], k % 2 ? '#1b1b1b' : '#e7c628', 'none'); }
  for (let y = -0.35; y < 0.2; y += 0.12) g += `<polyline points="${pts([[2.5, y, 0.005], [3.5, y, 0.005]])}" stroke="#7a7f83" stroke-width="1"/>`;
  return g;
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

