// Vue « carte » — situer les nouveaux clients sur la VRAIE carte d'une ville.
//
// Écrite le 02/10/2026 pour ENT-3.2 et les séances suivantes de C2.4. Elle reprend, dans le
// moteur, la page d'essai validée par Tristan le même jour (`essai-plan-osm.html`). **ENT-3.1
// ne change pas** : elle garde son plan schématique (`plan.js`) et son repérage par cases.
//
// Ce que la vue NE connaît PAS : Nîmes, Boost, le vélo-cargo. Tout vient du contenu :
//   creerCarte({
//     libelle: 'Plan de Nîmes',            // entrée de menu
//     titre, consigne,                     // en-tête de la vue
//     carte: CARTE,                        // le module généré par outils/carte/construire.py
//     clients: [...],                      // facultatif : sinon `carte.clients`
//   })
// Un client : { id, nom, adresse, rue, nouveau, quartier, case, kg, colis, x, y }. `rue` est le
// nom OSM exact, `x, y` la position du numéro dans la Base Adresse Nationale, en mètres.
//
// ── Les décisions de Tristan (02/10/2026), et où elles vivent ici ──────────────────────────
//   - une carte OSM DESSINÉE en vecteur, pas une image : les couches viennent du module ;
//   - quartiers = regroupements d'IRIS de l'INSEE, cliquables ; zoom animé au clic ;
//   - un index des rues façon plan papier (quartier + case), pour TOUTES les rues des quartiers
//     dessinés : il ne souffle rien ;
//   - le point S'AIMANTE : l'élève clique n'importe où sur la bonne rue, le point se pose au
//     numéro. Une autre rue est refusée, avec son nom, et compte comme un essai ;
//   - seuls les NOUVEAUX clients sont à situer : les habituels sont déjà sur la carte. « Le nerf
//     de l'exercice reste d'optimiser la tournée » : le repérage ne doit pas manger la séance ;
//   - quadrillage de 1 km ; le mode « écrire la case » est abandonné ;
//   - pas de mode hors connexion : la carte est dans le dépôt, elle n'a besoin de rien dehors.
//
// ── Les essais ─────────────────────────────────────────────────────────────────────────────
// Un clic sur une autre rue est compté par client (`etat.essais`). Décision de Tristan du
// 02/10 : **ils comptent dans la note en évaluation** (ENT-3.4), pas en guidage ni en
// entraînement. La vue ne note rien : elle tient le compte, `bilan()` le rend, et c'est la
// séance qui décide d'en faire un jalon. Un clic sur les maisons, ou en vue d'ensemble, n'est
// pas un essai : l'élève n'a désigné aucune rue.
//
// ── Les noms de rues (règle du 02/10, défaut « ous » de la rue Rousselier) ─────────────────
// Un nom n'est « posé » que s'il se lit ENTIER à l'écran. Le module en garantit la place à la
// construction (largeurs mesurées, échec du build sinon) ; `ajusterEtiquettes` réduit à
// l'écran un nom que la police du poste rendrait plus large ; la suite de tests mesure chaque
// nom rendu, avec une police normale puis 12 % plus large.
//
// L'état, rangé par l'hôte dans la base de l'élève :
//   { places: { id: horodatage }, essais: { id: n }, valide: horodatage }

import { ech } from '../ui.js';

// « Rue de la Madeleine » → « rue de la Madeleine », pour l'écrire au milieu d'une phrase.
const minu = (t) => (t ? t[0].toLowerCase() + t.slice(1) : '');
// Recherche sans accents ni casse, apostrophe typographique comprise : « ecusson » trouve
// « Écusson », « l'aspic » trouve « l’Aspic ».
export const pourTri = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’]/g, "'").toLowerCase();

/* -------------------------------------------------------------------- géométrie des rues */

// Relit un chemin « M x y l dx dy … » (coordonnées relatives entières, le format du module)
// en segments absolus.
export function segments(d) {
  const out = []; let x = 0, y = 0, prev = null;
  for (const m of String(d).matchAll(/([Ml])(-?\d+) (-?\d+)/g)) {
    if (m[1] === 'M') { x = +m[2]; y = +m[3]; prev = [x, y]; }
    else { x += +m[2]; y += +m[3]; out.push([prev, [x, y]]); prev = [x, y]; }
  }
  return out;
}
function distSeg(p, [a, b]) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / L)) : 0;
  return Math.hypot(p.x - a[0] - t * dx, p.y - a[1] - t * dy);
}
// La rue la plus proche d'un point, dans une tolérance en mètres ; `null` s'il n'y en a pas.
export function rueSous(RUES, p, tol) {
  let best = null;
  for (const r of RUES) for (const s of r.s) {
    const d = distSeg(p, s);
    if (d <= tol && (!best || d < best.d)) best = { n: r.n, d };
  }
  return best;
}

// La case du quadrillage d'un point (« C2 »). Même calcul que le build, recalculé ici pour
// que le contenu ne puisse pas se contredire.
export function caseCarte(C, p) {
  const [fx, fy] = C.frame;
  const i = Math.floor((p.x - fx) / C.pas), j = Math.floor((p.y - fy) / C.pas);
  if (i < 0 || j < 0 || i >= C.cols.length || j >= C.nl) return null;
  return C.cols[i] + (j + 1);
}

/* ------------------------------------------------------------------------- le dessin */

// Largeurs des routes, en pixels d'écran : [vue d'ensemble, zoom]. Interpolées pendant le zoom.
const ORDRE = ['pie', 'svc', 'min', 'ped', 'sec', 'maj'];
const LARG = { maj: [2.6, 13], sec: [1.7, 10], min: [0.8, 7.5], ped: [0.7, 7.5], svc: [0, 4], pie: [0, 1.8] };

function marqueurSvg(x, y, lettre, cl, nom, titre) {
  return `<g class="ct-mk ${cl}" data-x="${x}" data-y="${y}" transform="translate(${x} ${y})">
    ${titre ? `<title>${ech(titre)}</title>` : ''}
    <circle class="ct-rond" r="11"/><text class="ct-mk-l">${ech(lettre)}</text>
    ${nom ? `<text class="ct-mk-nom" x="16" y="4">${ech(nom)}</text>` : ''}</g>`;
}

// `o.fixes` (vrai par défaut) : l'entrepôt et la gare dessinés comme décor. La vue Tournée les
// dessine elle-même, parce que chez elle ce sont des arrêts à poser (`extremitesACliquer`).
function svgCarte(C, o = {}) {
  const [FX, FY, FW, FH] = C.frame;
  const K = C.couches;
  let defs = `<clipPath id="ct-clip"><rect x="${FX}" y="${FY}" width="${FW}" height="${FH}"/></clipPath>`;
  let dG = '';
  for (let i = 1; i < C.cols.length; i++) dG += `M${FX + i * C.pas} ${FY}V${FY + FH}`;
  for (let j = 1; j < C.nl; j++) dG += `M${FX} ${FY + j * C.pas}H${FX + FW}`;

  const routes = ORDRE.filter((c) => c !== 'pie').map((c) => `<path class="ct-r ct-cas ${c}" data-cas="${c}" d="${K[c]}"/>`).join('')
    + ORDRE.map((c) => `<path class="ct-r ${c === 'pie' ? 'ct-pie' : 'ct-fil ' + c}" data-fil="${c}" d="${K[c]}"/>`).join('');

  const quartiers = Object.entries(C.quartiers).map(([k, q]) => `<path class="ct-q" d="${q.d}" data-q="${ech(k)}"
      tabindex="0" role="button" aria-label="${ech('Zoomer sur ' + q.nom)}"/>`).join('');
  const qnoms = Object.entries(C.quartiers).map(([k, q]) => `<text class="ct-qnom" x="${q.lx}" y="${q.ly}">${ech(q.nom)}</text>`).join('');

  // Les noms de rues, un groupe par quartier : le long de la rue (textPath), taille fixe en
  // mètres — c'est à cette taille que leur place a été calculée sans chevauchement.
  const etiq = Object.entries(C.etiquettes).map(([k, L]) => {
    const fs = C.quartiers[k].fs;
    const textes = L.map((e, i) => {
      defs += `<path id="ct-p-${ech(k)}-${i}" d="${e.d}"/>`;
      return `<text class="r${e.r}"><textPath href="#ct-p-${ech(k)}-${i}" startOffset="50%" text-anchor="middle">${ech(e.n)}</textPath></text>`;
    }).join('');
    return `<g class="ct-etiq" data-etiq="${ech(k)}" style="font-size:${fs}px;stroke-width:${fs * 0.27}">${textes}</g>`;
  }).join('');
  const reperes = C.reperes.map((r) => `<text class="ct-rep" x="${r.x}" y="${r.y}">${ech(r.n)}</text>`).join('');

  const fixes = o.fixes === false ? '' : marqueurSvg(C.depart.x, C.depart.y, 'E', 'ct-mk-depart', C.depart.nom)
    + marqueurSvg(C.arrivee.x, C.arrivee.y, 'G', 'ct-mk-arrivee', C.arrivee.nom);

  return `<svg class="ct-svg" data-ct-svg role="img" aria-label="Plan de la ville">
    <defs>${defs}</defs>
    <g clip-path="url(#ct-clip)">
      <rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" class="ct-fond"/>
      <path class="ct-vert" d="${K.vert}"/><path class="ct-cimetiere" d="${K.cimetiere}"/>
      <path class="ct-eau" d="${K.eau}"/><path class="ct-eauL" d="${K.eauL}"/>
      <path class="ct-bati" d="${K.bati}"/>
      ${routes}
      <path class="ct-rail" d="${K.rail}"/><path class="ct-railT" d="${K.rail}"/>
      <path class="ct-grille" d="${dG}"/>
      <path class="ct-masque"/>
      ${quartiers}${qnoms}${etiq}${reperes}
    </g>
    <rect class="ct-cadre" x="${FX}" y="${FY}" width="${FW}" height="${FH}"/>
    <path class="ct-trace" data-ct-trace d="${o.trace || ''}"/>
    <g class="ct-fixes">${fixes}</g>
    <g class="ct-pins" data-pins>${o.calque || ''}</g>
  </svg>`;
}

/* ------------------------------------------------------------------------------- la scène */
// La carte elle-même — cadre, zoom, échelle, quadrillage, bulle — partagée par les deux vues :
// le repérage (`creerCarte`) et la tournée (`tournee.js`, via `carteTournee`). Chacune pose
// ses propres calques par-dessus.

function vueEnsemble(C) {
  const [FX, FY, FW, FH] = C.frame;
  return [FX - 200, FY - 260, FW + 400, FH + 420];
}

function htmlCadre(C, o = {}) {
  const boutonsQ = Object.entries(C.quartiers).map(([k, q]) => `<button class="btn btn-s" data-ct-zoom="${ech(k)}">${ech(q.nom)}</button>`).join(' ');
  return `<div class="ct-barre">
      <button class="btn btn-s" data-ct-ensemble>Vue d'ensemble</button>
      ${boutonsQ}
      <span class="ct-aide" data-ct-aide></span>
    </div>
    <div class="ct-cadre-carte${o.classe ? ' ' + o.classe : ''}" data-ct-cadre>
      ${svgCarte(C, o)}
      <div class="ct-reperes" data-ct-reperes></div>
      <div class="ct-echelle"><span data-ct-ech-txt></span><i data-ct-ech-barre></i></div>
      <div class="ct-attrib">© contributeurs OpenStreetMap · quartiers : IRIS © IGN-INSEE · bâti : OSM / IGN BD TOPO</div>
      <div class="ct-bulle" data-ct-bulle role="status" aria-live="polite"></div>
    </div>`;
}

// `ui` : { vue } — l'état d'affichage, gardé par l'appelant pour survivre à un redessin.
// `o.aide(ui)` : le texte d'aide de la barre ; `o.clicQuartier(ev)` : vrai si un clic sur un
// quartier doit l'ouvrir (le repérage le refuse quand un client est armé et la carte zoomée).
function monterScene(z, C, ui, o = {}) {
  const $ = (s) => z.querySelector(s);
  const svg = $('[data-ct-svg]'), cadre = $('[data-ct-cadre]');
  const [FX, FY, FW, FH] = C.frame;
  const VUE_ENSEMBLE = vueEnsemble(C);
  const routesCas = {}, routesFil = {};
  svg.querySelectorAll('[data-cas]').forEach((p) => { routesCas[p.dataset.cas] = p; });
  svg.querySelectorAll('[data-fil]').forEach((p) => { routesFil[p.dataset.fil] = p; });
  const qs = {}; svg.querySelectorAll('[data-q]').forEach((p) => { qs[p.dataset.q] = p; });
  const etiqs = {}; svg.querySelectorAll('[data-etiq]').forEach((g) => { etiqs[g.dataset.etiq] = g; });
  const masque = svg.querySelector('.ct-masque');
  const vb = { v: (ui.vue === 'ensemble' ? VUE_ENSEMBLE : C.quartiers[ui.vue].vb).slice(),
    z: ui.vue === 'ensemble' ? 0 : 1 };

  function visible(v) {
    const W = cadre.clientWidth || 800, H = cadre.clientHeight || 560;
    const s = Math.min(W / v[2], H / v[3]);
    const vw = W / s, vh = H / s;
    return { s, x: v[0] - (vw - v[2]) / 2, y: v[1] - (vh - v[3]) / 2, w: vw, h: vh };
  }
  // Les traits gardent une épaisseur d'ÉCRAN fixe, quel que soit le zoom : `k` = mètres par pixel.
  function appliquer() {
    const v = vb.v, zz = vb.z;
    svg.setAttribute('viewBox', v.join(' '));
    const vis = visible(v), k = 1 / vis.s;
    for (const c of ORDRE) {
      const [a, b] = LARG[c];
      routesFil[c].style.strokeWidth = (c === 'pie' ? (a + (b - a) * zz) : b * zz) * k;
      if (routesCas[c]) routesCas[c].style.strokeWidth = (a * (1 - zz) + (b + 1.8) * zz) * k;
    }
    routesFil.pie.style.strokeDasharray = `${4 * k} ${3 * k}`;
    routesFil.pie.style.opacity = zz;
    routesCas.svc.style.opacity = zz; routesFil.svc.style.opacity = zz;
    const bati = svg.querySelector('.ct-bati'); bati.style.opacity = zz; bati.style.strokeWidth = 0.6 * k;
    svg.querySelector('.ct-rail').style.strokeWidth = (2.2 + 2.4 * zz) * k;
    const rt = svg.querySelector('.ct-railT'); rt.style.strokeWidth = (1.2 + 1.6 * zz) * k;
    rt.style.strokeDasharray = `${6 * k} ${6 * k}`;
    svg.querySelector('.ct-eauL').style.strokeWidth = 2 * k;
    svg.querySelector('.ct-grille').style.strokeWidth = (1.1 + 0.5 * zz) * k;
    svg.querySelector('.ct-cadre').style.strokeWidth = 1.6 * k;
    svg.querySelector('.ct-trace').style.strokeWidth = 5 * k;
    for (const p of Object.values(qs)) {
      p.style.strokeWidth = (2 + zz) * k;
      p.style.strokeDasharray = zz > 0.5 ? 'none' : `${7 * k} ${4 * k}`;
    }
    svg.querySelectorAll('.ct-qnom').forEach((t) => { t.style.fontSize = 14 * k + 'px'; t.style.strokeWidth = 4 * k; });
    svg.querySelectorAll('.ct-rep').forEach((t) => { t.style.fontSize = 12.5 * k + 'px'; t.style.strokeWidth = 3 * k; });
    svg.querySelectorAll('.ct-mk').forEach((g) => {
      g.setAttribute('transform', `translate(${g.dataset.x} ${g.dataset.y}) scale(${k})`);
    });
    reperesGrille(vis);
    echelle(k);
  }
  function reperesGrille(v) {
    const box = $('[data-ct-reperes]'); box.innerHTML = '';
    const px = (x) => (x - v.x) * v.s, py = (y) => (y - v.y) * v.s;
    const haut = Math.max(py(FY), 0) + 13, gauche = Math.max(px(FX), 0) + 15;
    for (let i = 0; i < C.cols.length; i++) {
      const a = Math.max(FX + i * C.pas, v.x), b = Math.min(FX + (i + 1) * C.pas, v.x + v.w);
      if (b - a < 30 / v.s) continue;
      const s = document.createElement('span'); s.textContent = C.cols[i];
      s.style.left = px((a + b) / 2) + 'px'; s.style.top = (py(FY) > 0 ? py(FY) - 14 : haut) + 'px';
      box.appendChild(s);
    }
    for (let j = 0; j < C.nl; j++) {
      const a = Math.max(FY + j * C.pas, v.y), b = Math.min(FY + (j + 1) * C.pas, v.y + v.h);
      if (b - a < 30 / v.s) continue;
      const s = document.createElement('span'); s.textContent = j + 1;
      s.style.top = py((a + b) / 2) + 'px'; s.style.left = (px(FX) > 0 ? px(FX) - 16 : gauche) + 'px';
      box.appendChild(s);
    }
  }
  function echelle(k) {
    const pas = [50, 100, 200, 250, 500, 1000, 2000].find((p) => p >= 110 * k * 0.6) || 1000;
    $('[data-ct-ech-barre]').style.width = pas / k + 'px';
    $('[data-ct-ech-txt]').textContent = pas >= 1000 ? pas / 1000 + ' km' : pas + ' m';
  }

  let anim = null;
  function allerA(cible, zCible, fin) {
    cancelAnimationFrame(anim);
    const v0 = vb.v.slice(), z0 = vb.z, t0 = performance.now(), T = 520;
    const pas = (t) => {
      const u = Math.min(1, (t - t0) / T), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      vb.v = v0.map((x, i) => x + (cible[i] - x) * e);
      vb.z = z0 + (zCible - z0) * e;
      appliquer();
      if (u < 1) anim = requestAnimationFrame(pas); else if (fin) fin();
    };
    anim = requestAnimationFrame(pas);
  }
  function aide() { const el = $('[data-ct-aide]'); if (el && o.aide) el.textContent = o.aide(ui); }
  function marquerVue() {
    const k = ui.vue;
    svg.classList.toggle('ct-zoom', k !== 'ensemble');
    for (const q in qs) qs[q].classList.toggle('actif', q === k);
    for (const q in etiqs) etiqs[q].classList.toggle('vue', q === k);
    masque.setAttribute('d', k === 'ensemble' ? ''
      : `M${FX - 9e3} ${FY - 9e3}h${FW + 18e3}v${FH + 18e3}h${-(FW + 18e3)}z` + C.quartiers[k].d);
    z.querySelector('[data-ct-ensemble]').classList.toggle('btn-p', k === 'ensemble');
    z.querySelectorAll('[data-ct-zoom]').forEach((b) => b.classList.toggle('btn-p', b.dataset.ctZoom === k));
    if (k !== 'ensemble') ajusterEtiquettes(k);
    aide();
  }
  function zoomer(k) { ui.vue = k; marquerVue(); allerA(C.quartiers[k].vb, 1); }
  function ensemble() { ui.vue = 'ensemble'; marquerVue(); allerA(VUE_ENSEMBLE, 0); }

  // Garde-fou : un nom plus long que son chemin serait coupé AUX DEUX BOUTS par le navigateur
  // (le « ous » de Rousselier, 02/10). La place a été calculée avec des largeurs mesurées,
  // mais la police du poste peut être plus large : on réduit alors CE nom jusqu'à ce qu'il
  // tienne entier. Mesuré à l'ouverture du quartier, quand le groupe est affiché.
  function ajusterEtiquettes(k) {
    const g = etiqs[k]; if (!g || g.dataset.ajuste) return;
    g.dataset.ajuste = '1';
    const fs = C.quartiers[k].fs;
    for (const t of g.querySelectorAll('text')) {
      const ch = svg.querySelector(t.firstChild.getAttribute('href'));
      const dispo = ch.getTotalLength() * 0.97, long = t.getComputedTextLength();
      if (long > dispo) t.style.fontSize = (fs * dispo / long) + 'px';
    }
  }

  let minuteur = null;
  function bulle(txt) {
    const b = $('[data-ct-bulle]'); b.textContent = txt; b.classList.add('vue');
    clearTimeout(minuteur); minuteur = setTimeout(() => b.classList.remove('vue'), 3200);
  }

  $('[data-ct-ensemble]').addEventListener('click', ensemble);
  z.querySelectorAll('[data-ct-zoom]').forEach((b) => b.addEventListener('click', () => zoomer(b.dataset.ctZoom)));
  for (const k in qs) {
    qs[k].addEventListener('click', (ev) => {
      if (!o.clicQuartier || o.clicQuartier(ev)) { ev.stopPropagation(); zoomer(k); }
    });
    qs[k].addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); zoomer(k); }
    });
  }
  // La carte se recalcule si son cadre change de taille (fenêtre, panneau latéral).
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => { if (svg.isConnected) appliquer(); else ro.disconnect(); });
    ro.observe(cadre);
  }
  marquerVue(); appliquer();
  return { svg, cadre, vb, visible, appliquer, zoomer, ensemble, bulle, aide };
}

/* ----------------------------------------------------------------------- la vue repérage */

export function creerCarte(PLAN) {
  const C = PLAN.carte;
  if (!C || !C.frame || !C.couches) throw new Error('creerCarte : `carte` manquante (contenus/…-carte.js)');
  const CLIENTS = (PLAN.clients || C.clients || []).map((c, i) => Object.assign({ numero: i + 1 }, c));
  const NOUVEAUX = CLIENTS.filter((c) => c.nouveau);
  const HABITUELS = CLIENTS.filter((c) => !c.nouveau);
  const NOMS_Q = Object.fromEntries(Object.entries(C.quartiers).map(([k, q]) => [k, q.nom]));
  const RUES = Object.entries(C.rues).map(([n, d]) => ({ n, s: segments(d) }));

  // Le contenu ne peut pas déclarer un nouveau client introuvable : sa rue doit être cliquable
  // et porter son nom dans le zoom de son quartier. Sinon, c'est une erreur, pas un saut.
  NOUVEAUX.forEach((c) => {
    if (!C.rues[c.rue]) throw new Error(`creerCarte : la ${c.rue} (${c.nom}) n'est pas sur la carte`);
    if (!C.quartiers[c.quartier]) throw new Error(`creerCarte : quartier inconnu pour ${c.nom}`);
    if (!C.etiquettes[c.quartier].some((e) => e.n === c.rue)) {
      throw new Error(`creerCarte : la ${c.rue} n'a pas son nom dans le zoom ${c.quartier}`);
    }
  });

  const vide = () => ({ places: {}, essais: {}, valide: null });
  const fini = (etat) => NOUVEAUX.every((c) => etat.places && etat.places[c.id]);

  // L'état d'AFFICHAGE (zoom, client armé, recherche) n'est pas du travail d'élève : il ne va
  // pas dans la base. Il survit à un redessin de la page, pas à un rechargement.
  const ui = { vue: 'ensemble', arme: null, recherche: '' };

  function bilan(etat0) {
    const etat = Object.assign(vide(), etat0 || {});
    const parClient = NOUVEAUX.map((c) => ({ id: c.id, nom: c.nom, place: !!etat.places[c.id],
      essais: etat.essais[c.id] || 0 }));
    return {
      nouveaux: NOUVEAUX.length,
      places: parClient.filter((c) => c.place).length,
      essais: parClient.reduce((s, c) => s + c.essais, 0),
      premierCoup: parClient.filter((c) => c.place && !c.essais).length,
      parClient,
      valide: !!etat.valide,
    };
  }

  return {
    nav: { id: 'plan', libelle: PLAN.libelle || 'Plan' },
    clients: CLIENTS,
    bilan,
    // Même contrat que `plan.js` : la tournée attend `ouvreSuite`.
    temps2: (etat) => !!(etat && etat.valide),
    ouvreSuite: (etat) => !NOUVEAUX.length || !!(etat && etat.valide),
    horsConnexion: null,
    estHorsConnexion: () => false,
    activerHorsConnexion: () => {},

    html() {
      const tete = `<div class="ent-tete"><h2>${ech(PLAN.titre || 'Plan')}</h2></div>
        ${PLAN.consigne ? `<p class="note">${ech(PLAN.consigne)}</p>` : ''}`;
      const fiche = (c) => `<div class="ct-tete"><span class="ct-num">${c.numero}</span><span class="ct-nom">${ech(c.nom)}</span>
          <span class="ct-poids">${c.colis} colis · ${c.kg} kg</span></div>
        <div class="ct-adr">${ech(c.adresse)}</div>`;
      return `${tete}
      <div class="ct-grille-vue">
        <section class="ct-bloc">${htmlCadre(C)}</section>
        <aside class="ct-panneau">
          <h3>Nouveaux clients à situer</h3>
          <p class="note">Cherchez la rue dans l’index, ouvrez le quartier, puis cliquez sur la rue :
            le point se pose tout seul au bon numéro.</p>
          <div data-ct-nouveaux>${NOUVEAUX.map((c) => `<div class="ct-client" data-ct-client="${ech(c.id)}">${fiche(c)}<div class="ct-ch" data-ct-ch></div></div>`).join('')}</div>
          <div class="ct-bilan" data-ct-bilan></div>
          <h3>Index des rues</h3>
          <div class="ct-index">
            <input class="champ" type="search" data-ct-cherche value="${ech(ui.recherche)}"
              placeholder="Chercher une rue… (ex. Madeleine)" aria-label="Chercher une rue dans l’index">
            <ul data-ct-index></ul>
          </div>
          <h3>Clients habituels (déjà sur la carte)</h3>
          ${HABITUELS.map((c) => `<div class="ct-client ct-habituel">${fiche(c)}</div>`).join('')}
        </aside>
      </div>`;
    },

    // `api` = { etat, sauver(), redessiner(), toast(msg) } — fourni par la vue hôte.
    //
    // Rien ici ne redessine la page : la carte pèse un demi-mégaoctet de tracés, et la refaire
    // à chaque clic ferait clignoter l'écran et perdre le zoom. La vue met à jour ses propres
    // morceaux (points, fiches, bilan) et sauve.
    brancher(z, api) {
      const etat = api.etat;
      if (!etat.places) etat.places = {};
      if (!etat.essais) etat.essais = {};
      const $ = (s) => z.querySelector(s);
      if (!$('[data-ct-svg]')) return;
      let S = null;
      S = monterScene(z, C, ui, {
        aide: () => {
          const c = ui.arme && CLIENTS.find((x) => x.id === ui.arme);
          const cadre = z.querySelector('[data-ct-cadre]');
          if (cadre) cadre.classList.toggle('ct-pose', !!c);
          return c ? `Cherchez la ${minu(c.rue)} et cliquez dessus.`
            : (ui.vue === 'ensemble' ? 'Cliquez un quartier pour zoomer et lire les noms de rues.'
              : 'Lisez les noms de rues. L’autre quartier reste cliquable.');
        },
        // Client armé et carte zoomée : le clic va à la rue qui est dessous, pas au quartier.
        clicQuartier: () => !ui.arme || ui.vue === 'ensemble',
      });
      const { svg } = S;
      const pins = svg.querySelector('[data-pins]');

      function dessinerPoints() {
        pins.innerHTML = CLIENTS.filter((c) => !c.nouveau || etat.places[c.id])
          .map((c) => marqueurSvg(c.x, c.y, String(c.numero), 'ct-mk-client', null, `${c.numero}. ${c.nom}`)).join('');
        S.appliquer();
      }
      function fiches() {
        z.querySelectorAll('[data-ct-client]').forEach((d) => {
          const c = CLIENTS.find((x) => x.id === d.dataset.ctClient);
          const ok = !!etat.places[c.id], n = etat.essais[c.id] || 0;
          const essais = n ? `${n} clic${n > 1 ? 's' : ''} sur une autre rue` : '';
          d.classList.toggle('arme', ui.arme === c.id);
          d.classList.toggle('place', ok);
          d.querySelector('[data-ct-ch]').innerHTML = ok
            ? `<span class="pastille ok">Situé</span> <span class="ct-essais">${essais || 'du premier coup'}</span>`
            : `<button class="btn ${ui.arme === c.id ? 'btn-s' : 'btn-p'}" data-ct-arme="${ech(c.id)}">${ui.arme === c.id ? 'Annuler' : 'Situer sur la carte'}</button>
               <span class="ct-essais">${essais}</span>`;
        });
        z.querySelectorAll('[data-ct-arme]').forEach((b) => b.addEventListener('click', () => {
          armer(ui.arme === b.dataset.ctArme ? null : b.dataset.ctArme);
        }));
        const fait = NOUVEAUX.length - NOUVEAUX.filter((c) => !etat.places[c.id]).length;
        const pl = fait > 1 ? 's' : '';
        $('[data-ct-bilan]').innerHTML = fait < NOUVEAUX.length
          ? `${fait} nouveau${fait > 1 ? 'x' : ''} client${pl} situé${pl} sur ${NOUVEAUX.length}.`
          : `<div class="avis avis-ok">Les ${CLIENTS.length} clients sont sur la carte : la tournée peut commencer.</div>`;
      }
      function armer(id) {
        ui.arme = id;
        if (id && ui.vue === 'ensemble') S.bulle('Ouvrez d’abord le bon quartier (l’index des rues vous le donne).');
        fiches(); S.aide();
      }

      function index() {
        const q = pourTri(ui.recherche.trim());
        const liste = C.index.filter((e) => !q || pourTri(e.n).includes(q));
        const ul = $('[data-ct-index]');
        ul.innerHTML = !liste.length ? '<li class="ct-vide">Aucune rue de ce nom dans les quartiers du plan.</li>'
          : liste.map((e) => {
            const i = e.n.lastIndexOf(e.p);
            const nom = i >= 0 ? ech(e.n.slice(0, i)) + '<b>' + ech(e.p) + '</b>' + ech(e.n.slice(i + e.p.length)) : '<b>' + ech(e.n) + '</b>';
            return `<li tabindex="0" data-ct-rue="${ech(e.n)}" data-ct-va="${ech(e.q[0])}" title="Ouvrir le quartier">
              <span>${nom}</span><span class="ct-ou">${ech(e.q.map((k) => NOMS_Q[k]).join(', '))} · ${ech(e.c.join(', '))}</span></li>`;
          }).join('');
        ul.querySelectorAll('[data-ct-va]').forEach((li) => {
          li.addEventListener('click', () => S.zoomer(li.dataset.ctVa));
          li.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') S.zoomer(li.dataset.ctVa); });
        });
      }
      $('[data-ct-cherche]').addEventListener('input', (ev) => { ui.recherche = ev.target.value; index(); });

      /* --- poser un point : le clic sur la rue --- */
      svg.addEventListener('click', (ev) => {
        if (!ui.arme) return;
        if (ui.vue === 'ensemble') { S.bulle('Ouvrez d’abord le bon quartier : les noms de rues n’apparaissent qu’au zoom.'); return; }
        const c = CLIENTS.find((x) => x.id === ui.arme);
        const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        const k = 1 / S.visible(S.vb.v).s;
        const r = rueSous(RUES, p, 12 * k);   // 12 pixels d'écran autour de l'axe, à tout zoom
        if (!r) { S.bulle('Cliquez sur une rue (le trait blanc), pas sur les maisons.'); return; }
        if (r.n !== c.rue) {
          etat.essais[c.id] = (etat.essais[c.id] || 0) + 1;
          api.sauver();
          S.bulle(`Ici c’est : ${r.n}. Cherchez la ${minu(c.rue)}.`);
          fiches(); return;
        }
        etat.places[c.id] = Date.now();
        const tout = fini(etat);
        if (tout && !etat.valide) etat.valide = Date.now();
        api.sauver();
        ui.arme = null;
        dessinerPoints(); fiches(); S.aide();
        S.bulle(`${c.nom} est sur la carte (${c.adresse.split(',')[0]}).`);
        if (tout) {
          if (api.toast) api.toast('Repérage terminé : la tournée peut commencer.');
          setTimeout(() => { if (svg.isConnected) S.ensemble(); }, 1400);
        }
      });

      dessinerPoints(); fiches(); index(); S.aide();
    },
  };
}

/* ------------------------------------------------------------- la tournée sur la carte réelle */
// Décisions de Tristan du 02/10/2026 (soir) : les km se comptent PAR LES RUES, et le tracé SUIT
// LES RUES. Les deux viennent de la table `carte.trajets`, calculée une fois au build
// (`outils/carte/itineraires.py`) : `'a|b' → { m: mètres, d: chemin }`, dans les deux sens.
//
// `tournee.js` reste le seul maître de la tournée (ordre, quai, cumuls, horaire, report). Il
// demande à ce module trois choses quand son plan déclare une `carte` :
//   - `planDeCarte(PLAN)` : le plan vu par la tournée (points, départ, arrivée, légende) ;
//   - `kmCarte(P, a, b)`  : la distance d'un trajet, par les rues ;
//   - `carteTournee(P)`   : le dessin et son branchement, avec le même vocabulaire de cibles
//     que `svgPlan` (`data-clic-point`, `data-clic-extremite`), pour que les clics de la
//     tournée marchent sans une ligne de plus dans `tournee.js`.

export function planDeCarte(PLAN) {
  const C = PLAN.carte;
  const clients = (PLAN.clients || C.clients || []).map((c, i) => Object.assign({ numero: i + 1 }, c,
    { zone: c.quartier ? (C.quartiers[c.quartier] || {}).nom || '' : (c.zone || '') }));
  return Object.assign({}, PLAN, {
    carte: C,
    points: clients,
    depart: Object.assign({ id: 'depart', lettre: 'E' }, C.depart),
    arrivee: Object.assign({ id: 'arrivee', lettre: 'G' }, C.arrivee),
    echelle: { libelle: 'une case = 1 km' },
    legende: [
      { forme: 'rond', couleur: '#25c998', texte: C.depart.nom },
      { forme: 'rond', couleur: '#f0bd3c', texte: C.arrivee.nom },
      { forme: 'rond', couleur: '#345cfd', texte: 'Client : son numéro' },
    ],
  });
}

export function trajetCarte(P, a, b) {
  const t = P.carte.trajets && P.carte.trajets[`${a.id}|${b.id}`];
  if (!t) throw new Error(`pas d'itinéraire calculé de « ${a.id} » à « ${b.id} » : relancer outils/carte/construire.py`);
  return t;
}
export const kmCarte = (P, a, b) => trajetCarte(P, a, b).m / 1000;

// Un marqueur de la tournée : mêmes signes que `svgPlan` (un signe, un sens) — rond bleu = QUI,
// pastille menthe = QUAND, rond creux pointillé = PAS AUJOURD'HUI. Dessiné en pixels d'écran
// et mis à l'échelle par la scène, comme les autres marqueurs de la carte.
function marqueurTournee(p, o) {
  return `<g class="ct-mk ${o.cl}${o.creux ? ' ct-mk-creux' : ''}" data-x="${p.x}" data-y="${p.y}"
      transform="translate(${p.x} ${p.y})"${o.data || ''}>
    <title>${ech(o.titre)}</title>
    <circle class="ct-rond" r="11"/><text class="ct-mk-l">${ech(o.lettre)}</text>
    ${o.rang ? `<g class="plan-pt-ordre ct-ordre" pointer-events="none"><circle cx="-13.5" cy="-13.5" r="8"/>
      <text x="-13.5" y="-13.5">${ech(o.rang)}</text></g>` : ''}
    ${o.nom ? `<text class="ct-mk-nom" x="16" y="4">${ech(o.nom)}</text>` : ''}
    ${o.cible || ''}
  </g>`;
}

export function carteTournee(P) {
  const C = P.carte;
  const ui = { vue: 'ensemble' };
  return {
    html(o) {
      const ordre = o.ordre || [];
      const ext = !!o.extremites;
      const departPose = !ext || !!o.departPose, arriveePose = !ext || !!o.arriveePose;
      const suite = [];
      if (ordre.length || (ext && (departPose || arriveePose))) {
        if (departPose) suite.push(P.depart);
        ordre.forEach((id) => { const p = P.points.find((q) => String(q.id) === String(id)); if (p) suite.push(p); });
        if (arriveePose) suite.push(P.arrivee);
      }
      const trace = suite.slice(1).map((b, i) => trajetCarte(P, suite[i], b).d).join('');
      const cible = (attrs, label) => !o.cliquable ? '' : `<circle class="plan-pt-cible" r="20" fill="transparent"
          ${attrs} role="button" tabindex="0" aria-label="${ech(label)}"/>`;
      const bout = (p, quoi, pose, cl) => marqueurTournee(p, {
        cl: cl + (o.cliquable && ext ? ' plan-pt-clic' : ''), creux: ext && !pose, lettre: p.lettre,
        rang: ext && pose ? (quoi === 'depart' ? 'D' : 'A') : '', nom: p.nom, titre: p.nom,
        cible: !ext ? '' : cible(`data-clic-extremite="${quoi}"`, pose ? `Retirer ${p.nom} de la tournée`
          : `Placer ${p.nom} comme ${quoi === 'depart' ? 'départ' : 'arrivée'} de la tournée`),
      });
      const points = P.points.map((p) => {
        const rang = ordre.findIndex((x) => String(x) === String(p.id));
        return marqueurTournee(p, {
          cl: 'ct-mk-client plan-pt' + (o.cliquable ? ' plan-pt-clic' : '') + (rang < 0 ? ' plan-pt-quai' : ''),
          creux: rang < 0, lettre: String(p.numero), rang: rang < 0 ? '' : String(rang + 1),
          titre: `${p.numero}. ${p.nom}`,
          data: ` data-point="${ech(p.id)}"${rang >= 0 ? ` data-rang="${rang + 1}"` : ''}`,
          cible: cible(`data-clic-point="${ech(p.id)}"`, rang < 0 ? `Ajouter ${p.nom} à la fin de la tournée`
            : `Retirer ${p.nom} de la tournée (actuellement ${rang + 1}ᵉ arrêt)`),
        });
      }).join('');
      const calque = bout(P.depart, 'depart', departPose, 'ct-mk-depart')
        + bout(P.arrivee, 'arrivee', arriveePose, 'ct-mk-arrivee') + points;
      return htmlCadre(C, { fixes: false, trace, calque, classe: 'ct-cadre-tournee' });
    },
    // La tournée redessine toute sa vue à chaque clic : la scène est remontée à chaque fois,
    // mais le ZOOM est gardé ici, donc l'élève qui travaille dans l'Écusson y reste.
    brancher(z) {
      if (!z.querySelector('[data-ct-svg]')) return null;
      return monterScene(z, C, ui, {
        aide: () => (ui.vue === 'ensemble'
          ? 'Cliquez les clients dans l’ordre de passage. Un quartier s’ouvre avec ses boutons.'
          : 'Cliquez les clients dans l’ordre de passage.'),
        // Un clic sur un quartier (hors d'un point) l'ouvre ; un point garde son clic à lui.
        clicQuartier: (ev) => !ev.target.closest('[data-clic-point],[data-clic-extremite]'),
      });
    },
  };
}
