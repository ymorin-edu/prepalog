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
  // roues côté gauche (cachées en partie par la caisse)
  g += boite(x + .04, y + 1.2, 0, .12, .32, .3, ['#2a2d2f', '#1d1f20', '#151718']) + boite(x + .04, y + 1.75, 0, .12, .3, .3, ['#2a2d2f', '#1d1f20', '#151718']);
  // caisse et contrepoids
  g += boite(x + .1, y + 1.12, .12, .8, .75, .55, ['#e58a2a', '#d97a1c', '#b5631a']);
  g += boite(x + .1, y + 1.85, .12, .8, .3, .75, ['#c86d18', '#b5631a', '#9a5415']);
  // siège + cariste (silhouette sans visage)
  g += boite(x + .32, y + 1.5, .67, .36, .3, .12, ['#2a2d2f', '#1d1f20', '#151718']);
  const [hx, hy] = P(x + .5, y + 1.55, 1.25);
  g += `<path d="M${hx - 14},${hy + 34} Q${hx},${hy + 4} ${hx + 14},${hy + 34} Z" fill="#33393d"/><circle cx="${hx}" cy="${hy}" r="10" fill="#33393d"/>`;
  // roues côté droit (devant)
  g += boite(x + .86, y + 1.2, 0, .12, .32, .3, ['#2a2d2f', '#1d1f20', '#151718']) + boite(x + .86, y + 1.75, 0, .12, .3, .3, ['#2a2d2f', '#1d1f20', '#151718']);
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

function ech(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
