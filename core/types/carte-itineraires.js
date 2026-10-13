// Vue « Carte des itinéraires » — d'un point A à un point B par plusieurs modes (route, barge, rail…), sur une carte
// RÉELLE calculée depuis OpenStreetMap.
//
// Écrite le 13/10/2026 (brief `docs/briefs/MOTEUR-carte-regionale.md`, lot 2) pour Decathlon ENT-7.1 à 7.4, et pour
// toute carte « d'un point A à un point B par plusieurs modes » (Terminale : plan multimodal…). Elle ne connaît ni
// Decathlon, ni Anvers : tout vient du module généré par `outils/carte/construire-region.py` et de la séance.
//
//   creerEntreprise({ …,
//     carteItineraires: {
//       carte: CARTE,                       // contenus/<nom>-carte.js
//       destination: 'rouvignies',          // une clé de `CARTE.itineraires`
//       libelle: 'Carte des itinéraires',   // entrée de menu (facultatif)
//       titre, consigne,                    // en-tête de la vue (facultatifs)
//       alt: "Carte d'Anvers à Rouvignies : trois itinéraires, route, barge et rail",   // sans chiffre (facultatif)
//       offres: (mode, db) => ['Contargo'], // noms des prestataires qui ont fait une offre pour ce mode (facultatif)
//       quadrillage: false,                 // vrai : quadrillage et repères en bordure (absent par défaut, 13/10)
//       marques: [{                         // marques d'ALÉA (lot 3, ENT-7.3), facultatives
//         id: 'kain', lonlat: [3.3714, 50.6284], titre: 'Écluse de Kain fermée',
//         texte: 'Arrêt de navigation du 02/02 au 05/03', coupe: 'barge',   // le type de tronçon arrêté là
//         quand: (db) => …,                 // la marque n'apparaît que quand c'est vrai (après le déclencheur)
//         legende: 'Navigation arrêtée',    // libellé de la légende (défaut : le titre)
//       }],
//     },
//   })
//
// ── Les décisions de Tristan, et où elles vivent ici ───────────────────────────────────────────────────────────
//   - RIEN N'EST NOTÉ sur cette carte et rien n'y est un geste de travail : ouvrir, cliquer un itinéraire, zoomer ;
//     l'itinéraire choisi est un état d'AFFICHAGE (il ne va pas dans la base). Seul le repérage de l'enseignant compte
//     les ouvertures, dans `db.indicateurs[séance].carte[mode]`, comme les documents (`api.reperer`, entreprise.js) ;
//   - les modes se distinguent par la FORME et la COULEUR (variante C, choisie le 13/10 sur la page d'essai) : route =
//     trait plein encre ; barge = tirets violets ; rail = trait ambre à traverses ; camion = pointillé encre. Ni vert
//     (« juste », l'ordre d'une tournée), ni rouge (« faux ») ; le bleu ne dit que l'entrepôt d'arrivée. Une carte est
//     un plan papier : ses couleurs sont fixes, les mêmes en thème clair et sombre (comme `carte.js`) ;
//   - un itinéraire choisi s'épaissit, les autres s'estompent ; un second clic le désélectionne ;
//   - les derniers kilomètres : un BOUTON qui zoome (choix du 13/10), sur `CARTE.vues[destination]` ;
//   - pas de quadrillage par défaut (13/10 : aucune séance Decathlon ne lit une case) ; `quadrillage: true` le remet ;
//   - une MARQUE D'ALÉA se dessine SANS COULEUR (brief moteur §7, lot 3) : rond blanc, croix épaisse à l'encre, cartouche
//     du titre et du texte. Le brief ENT-7.3 la voulait ambre (`--terre`) : depuis la variante C, l'ambre dit le rail, une
//     marque ambre se confondrait avec lui. Le tronçon `coupe` passe en trait estompé APRÈS la marque, et tout ce qui le
//     suit sur le même itinéraire (le camion final) ; la fiche de cet itinéraire l'annonce. Elle n'apparaît que quand
//     `quand(db)` est vrai : un aléa ne se montre pas avant son déclencheur. Le texte alternatif de la carte ajoute le
//     titre (sans chiffre) ;
//   - au zoom des derniers kilomètres, les noms des lieux prennent les places calculées pour cette échelle (`nomsZoom`) :
//     le terminal et l'entrepôt de Dourges, à 800 m l'un de l'autre, se chevauchaient (lot 3).
//
// Clavier : la liste « Trois façons d'aller à… » est faite de boutons (Tab, Entrée, Espace) ; les tracés se cliquent à
// la souris (zone de clic élargie, invisible) et ne sont pas des arrêts de tabulation : on n'y passerait pas deux fois.
// Rien ne redessine la page au clic : la vue met à jour ses propres morceaux, le focus reste où il est.

import { ech } from '../ui.js';
import { monterCadre } from './carte.js';

// Les traits, en pixels d'écran : chacun est une pile de couches (la première dessous).
const ENCRE = '#1f1c18', VIOLET = '#6a3d9a', AMBRE = '#a8600a', PAPIER = '#f3f1ec';
export const TRAITS = {
  route:  [{ w: 5, c: ENCRE }],
  barge:  [{ w: 4, c: VIOLET, dash: [18, 5], cap: 'butt' }],
  rail:   [{ w: 2, c: AMBRE }, { w: 8, c: AMBRE, dash: [1.6, 7], cap: 'butt' }],
  camion: [{ w: 3, c: ENCRE, dash: [0.1, 6] }],
};
const NOM_TYPE = { route: 'Route', barge: 'Barge', rail: 'Rail', camion: 'Camion' };
const largeurMax = (L) => Math.max(...L.map((c) => c.w));
const ELARGI = 1.4;            // l'itinéraire choisi
const CLIC = 18;               // la zone de clic d'un tracé, en pixels
const LETTRE = { port: 'P', terminal: 'T', entrepot: 'E' };
const SEUIL_MARQUE = 3000;     // m : une marque coupe un tronçon de son type qui passe à moins de 3 km

// Un chemin du module (« M x y l dx dy … », coordonnées relatives entières) → ses points absolus, et l'inverse.
function points(d) {
  const out = []; let x = 0, y = 0;
  for (const m of String(d).matchAll(/([Ml])(-?\d+) (-?\d+)/g)) {
    if (m[1] === 'M') { x = +m[2]; y = +m[3]; } else { x += +m[2]; y += +m[3]; }
    out.push([x, y]);
  }
  return out;
}
const chemin = (P) => (P.length ? 'M' + P.map(([x, y]) => `${x} ${y}`).join('L') : '');

function echantillon(type, h = 16) {
  const L = TRAITS[type], d = `M5 ${h / 2}H51`;
  return `<svg class="ci-ech" width="56" height="${h}" aria-hidden="true">
    ${L.map((c) => `<path d="${d}" stroke="${c.c}" stroke-width="${c.w}" fill="none" style="stroke-linecap:${c.cap || 'round'}"
      ${c.dash ? `stroke-dasharray="${c.dash}"` : ''}/>`).join('')}</svg>`;
}

export function creerCarteItineraires(O) {
  const C = O && O.carte;
  if (!C || !C.frame || !C.itineraires || !C.lieux) throw new Error('carteItineraires : `carte` manquante (contenus/…-carte.js, construire-region.py)');
  const DEST = O.destination;
  const I = C.itineraires[DEST];
  if (!I) throw new Error(`carteItineraires : destination inconnue « ${DEST} » (connues : ${Object.keys(C.itineraires).join(', ')})`);
  const MODES = Object.keys(I);
  for (const m of MODES) for (const s of I[m].segments) {
    if (!TRAITS[s.type]) throw new Error(`carteItineraires : type de tronçon inconnu « ${s.type} » (${m})`);
  }
  const ARRIVEE = I[MODES[0]].segments.at(-1).a;
  const DEPART = I[MODES[0]].segments[0].de;
  const IDS = [...new Set(MODES.flatMap((m) => I[m].segments.flatMap((s) => [s.de, s.a])))];
  const NOMS_LIEUX = C.noms[DEST];
  const NOMS_ZOOM = (C.nomsZoom && C.nomsZoom[DEST]) || {};
  // Les marques d'aléa, contrôlées au chargement : une marque mal déclarée empêche la séance de se charger.
  const MARQUES = (O.marques || []).map((m) => {
    if (!m || typeof m.id !== 'string' || !Array.isArray(m.lonlat) || m.lonlat.length !== 2 || !m.titre) {
      throw new Error(`carteItineraires : une marque demande { id, lonlat: [longitude, latitude], titre } (${m && m.id})`);
    }
    if (!C.proj) throw new Error('carteItineraires : la carte n’a pas de projection (relancer outils/carte/construire-region.py)');
    if (m.coupe && !TRAITS[m.coupe]) throw new Error(`carteItineraires : la marque « ${m.id} » coupe un type inconnu « ${m.coupe} »`);
    if (m.quand && typeof m.quand !== 'function') throw new Error(`carteItineraires : la marque « ${m.id} » : \`quand\` doit être une fonction (db) → vrai/faux`);
    const [L0, P0, KX, KY] = C.proj, [FX, FY, FW, FH] = C.frame;
    const x = (m.lonlat[0] - L0) * KX, y = (P0 - m.lonlat[1]) * KY;
    if (x < FX || y < FY || x > FX + FW || y > FY + FH) throw new Error(`carteItineraires : la marque « ${m.id} » est hors de la carte`);
    return Object.assign({}, m, { x, y });
  });
  const marquesActives = (db) => MARQUES.filter((m) => {
    if (!m.quand) return true;
    try { return !!m.quand(db || {}); } catch (e) { return false; }
  });
  // Les morceaux de chaque itinéraire, avec les marques actives : un tronçon du type `coupe` passant à moins de
  // SEUIL_MARQUE est coupé au point le plus proche de la marque ; ce qui suit (et les tronçons suivants) est « après ».
  function morceaux(m, actives) {
    let coupe = null;
    const segs = I[m].segments.map((s) => {
      if (coupe) return [{ d: s.d, apres: true }];
      for (const k of actives.filter((a) => a.coupe === s.type)) {
        const P = points(s.d);
        let i0 = -1, dmin = Infinity;
        P.forEach(([x, y], i) => { const d = Math.hypot(x - k.x, y - k.y); if (d < dmin) { dmin = d; i0 = i; } });
        if (dmin < SEUIL_MARQUE && i0 > 0) {
          coupe = k;
          return [{ d: chemin(P.slice(0, i0 + 1)), apres: false }, { d: chemin(P.slice(i0)), apres: true }];
        }
      }
      return [{ d: s.d, apres: false }];
    });
    return { segs, coupe };
  }
  // Ce que le dernier dessin a montré (marques actives, itinéraire coupé par quelle marque) : la fiche le relit.
  let dessin = { actives: [], coupes: {} };
  const PLURIEL = ['', 'une', 'deux', 'trois', 'quatre', 'cinq'][MODES.length] || String(MODES.length);
  const listeModes = MODES.map((m) => I[m].nom.split(' ')[0].toLowerCase());
  const ALT = O.alt || `Carte de ${C.lieux[DEPART].court} à ${C.lieux[ARRIVEE].court} : ${PLURIEL} itinéraires, `
    + `${listeModes.slice(0, -1).join(', ')} et ${listeModes.at(-1)}`;
  // « Entrepôt de Rouvignies » → « Rouvignies » (« Trois façons d'aller à Rouvignies »).
  const nomDest = C.lieux[ARRIVEE].court.replace(/^Entrepôt (de |d’|d')/, '');
  const typesUtilises = Object.keys(TRAITS).filter((t) => MODES.some((m) => I[m].segments.some((s) => s.type === t)));

  // L'état d'AFFICHAGE : vue (ensemble ou derniers kilomètres) et itinéraire choisi. Il survit à un redessin de la
  // page (ce module garde la même fermeture), pas à un rechargement.
  const ui = { vue: 'ensemble', choisi: null };

  function svgCarte(db) {
    const actives = marquesActives(db);
    const M = Object.fromEntries(MODES.map((m) => [m, morceaux(m, actives)]));
    dessin = { actives, coupes: Object.fromEntries(MODES.filter((m) => M[m].coupe).map((m) => [m, M[m].coupe])) };
    const [FX, FY, FW, FH] = C.frame;
    const K = C.couches;
    let dG = '';
    if (O.quadrillage) {
      for (let i = 1; i < C.cols.length; i++) dG += `M${FX + i * C.pas} ${FY}V${FY + FH}`;
      for (let j = 1; j < C.nl; j++) dG += `M${FX} ${FY + j * C.pas}H${FX + FW}`;
    }
    const pays = (C.pays || []).map((p) => `<text class="ci-pays" data-fs="13" x="${p.x}" y="${p.y}">${ech(p.nom)}</text>`).join('');
    const villes = (C.villes || []).map((v) => `<circle class="ci-ville" data-r="2.6" cx="${v.x}" cy="${v.y}"/>
      <text class="ci-vnom" data-fs="12" data-px="${v.dx} ${v.dy}" x="${v.x}" y="${v.y}" text-anchor="${v.ancre}">${ech(v.nom)}</text>`).join('');
    // Les itinéraires : un groupe par mode, un sous-groupe par tronçon (halo, couches, zone de clic). Le choisi est
    // remis au-dessus des autres par `marquer` (déplacé en fin de groupe).
    const its = MODES.map((m) => `<g class="ci-it" data-ci-it="${ech(m)}">${I[m].segments.map((s, j) => M[m].segs[j].map((mo) => `<g data-type="${s.type}"${mo.apres ? ' class="ci-apres"' : ''}>
        <path class="ci-halo" d="${mo.d}"/>
        ${TRAITS[s.type].map((c, i) => `<path class="ci-couche" data-couche="${i}" d="${mo.d}" stroke="${c.c}" style="stroke-linecap:${c.cap || 'round'}"/>`).join('')}
        <path class="ci-clic" data-ci-clic="${ech(m)}" d="${mo.d}"/></g>`).join('')).join('')}</g>`).join('');
    const lieux = IDS.map((k) => {
      const l = C.lieux[k], n = NOMS_LIEUX[k], nz = NOMS_ZOOM[k] || n;
      const type = k === ARRIVEE ? 'entrepot' : (l.type === 'port' ? 'port' : 'terminal');
      return `<g class="ci-lieu ci-${type}" data-x="${l.x}" data-y="${l.y}" data-ci-lieu="${ech(k)}"><title>${ech(l.nom)}</title>
          <circle class="ci-rond" r="${type === 'terminal' ? 7 : 10}"/><text class="ci-lettre" font-size="${type === 'terminal' ? 9 : 11}">${LETTRE[type]}</text></g>
        <text class="ci-lnom" data-fs="12.5" data-px="${n.dx} ${n.dy}" data-ancre="${n.ancre}" data-pz="${nz.dx} ${nz.dy}" data-ancre-z="${nz.ancre}"
          x="${l.x}" y="${l.y}" text-anchor="${n.ancre}">${ech(l.court)}</text>`;
    }).join('');
    // Une marque d'aléa : rond blanc, croix à l'encre, cartouche (titre, texte) à droite, en pixels d'écran.
    const marques = actives.map((k) => {
      const W = Math.round(Math.max(k.titre.length * 7.4, String(k.texte || '').length * 6.4)) + 14;
      return `<g class="ci-marque" data-x="${k.x}" data-y="${k.y}" data-ci-marque="${ech(k.id)}">
          <title>${ech(k.titre + (k.texte ? ' — ' + k.texte : ''))}</title>
          <circle class="ci-m-rond" r="11"/><path class="ci-m-croix" d="M-6 -6L6 6M6 -6L-6 6"/>
          <g class="ci-m-cartouche" transform="translate(17 -19)"><rect width="${W}" height="${k.texte ? 38 : 22}" rx="3"/>
            <text class="ci-m-titre" x="7" y="15">${ech(k.titre)}</text>
            ${k.texte ? `<text class="ci-m-texte" x="7" y="31">${ech(k.texte)}</text>` : ''}</g></g>`;
    }).join('');
    const alt = ALT + actives.map((k) => ' ; ' + (k.alt || k.titre)).join('');
    return `<svg class="ct-svg ci-svg" data-ct-svg role="img" aria-label="${ech(alt)}">
      <defs><clipPath id="ci-clip"><rect x="${FX}" y="${FY}" width="${FW}" height="${FH}"/></clipPath></defs>
      <rect class="ci-fond" x="${FX - 1e5}" y="${FY - 1e5}" width="${FW + 2e5}" height="${FH + 2e5}"/>
      <g clip-path="url(#ci-clip)">
        <path class="ci-eau" d="${K.eau}"/><path class="ci-eauL" d="${K.eauL}"/>
        <path class="ci-rail" d="${K.rail}"/><path class="ci-auto" d="${K.autoroutes}"/>
        <path class="ci-front" d="${K.frontieres}"/>
        ${dG ? `<path class="ci-grille" d="${dG}"/>` : ''}
        ${pays}${villes}
      </g>
      <rect class="ci-cadre" x="${FX}" y="${FY}" width="${FW}" height="${FH}"/>
      <g data-ci-its>${its}</g>${lieux}${marques}
    </svg>`;
  }

  function fiche(db) {
    const it = ui.choisi && I[ui.choisi];
    if (!it) return `<p class="note">Cliquez un itinéraire, sur la carte ou dans la liste, pour voir son trajet.</p>`;
    const troncons = it.segments.map((s) => `${NOM_TYPE[s.type].toLowerCase()} ${s.km} km`).join(' + ');
    const k = dessin.coupes[ui.choisi];
    const alea = k ? `<p class="ci-alea"><b>${ech(k.titre)}</b>${k.texte ? ` — ${ech(k.texte)}` : ''}</p>` : '';
    let offres = null;
    if (O.offres) { try { offres = O.offres(ui.choisi, db) || []; } catch (e) { offres = []; } }
    return `<h4>${ech(it.nom)} <span class="ci-km">${it.km} km</span></h4>${alea}
      <p>${ech(it.texte)}</p>
      <dl>
        <dt>Distance par tronçon</dt><dd>${ech(troncons)}</dd>
        <dt>Terminaux</dt><dd>${it.terminaux.length ? it.terminaux.map((k) => ech(C.lieux[k].nom)).join(', ') : 'aucun : porte à porte'}</dd>
        <dt>Ruptures de charge</dt><dd>${it.ruptures === 0 ? 'aucune' : it.ruptures}</dd>
        ${offres ? `<dt>Offres reçues pour ce mode</dt><dd>${offres.length ? offres.map(ech).join(', ') : 'aucune'}</dd>` : ''}
      </dl>
      ${offres ? '<p class="note">Les prix, dates et CO₂ sont dans les devis.</p>' : ''}`;
  }

  return {
    nav: { id: 'itineraires', libelle: O.libelle || 'Carte des itinéraires' },
    modes: MODES,
    marquesActives: (db) => marquesActives(db).map((k) => k.id),
    html(db) {
      const carte = svgCarte(db);         // d'abord : la légende et la fiche relisent les marques qu'il a posées
      const tete = `<div class="ent-tete"><h2>${ech(O.titre || O.libelle || 'Carte des itinéraires')}</h2></div>
        ${O.consigne ? `<p class="note">${ech(O.consigne)}</p>` : ''}`;
      const boutons = MODES.map((m) => `<button type="button" class="ci-choix" data-ci-mode="${ech(m)}" aria-pressed="false">
          ${echantillon(I[m].segments[0].type)}<span class="ci-nom">${ech(I[m].nom)}</span><span class="ci-km">${I[m].km} km</span></button>`).join('');
      // La légende est posée DANS la carte (coin haut gauche, comme sur un plan papier) : la colonne garde la place pour
      // la liste et la fiche (1280 × 720). Ses couleurs sont celles de la carte, fixes.
      const legende = typesUtilises.map((t) => `<li>${echantillon(t, 14)}${NOM_TYPE[t]}</li>`).join('')
        + `<li><svg width="56" height="22" aria-hidden="true"><g class="ci-lieu ci-entrepot" transform="translate(28 11)"><circle class="ci-rond" r="9"/><text class="ci-lettre" font-size="10">E</text></g></svg>${ech(C.lieux[ARRIVEE].court)}</li>`
        + `<li><svg width="56" height="22" aria-hidden="true"><g class="ci-lieu ci-terminal" transform="translate(28 11)"><circle class="ci-rond" r="7"/><text class="ci-lettre" font-size="9">T</text></g></svg>Terminal (changement de mode)</li>`
        + `<li><svg width="56" height="14" aria-hidden="true"><path d="M4 7H52" class="ci-front" stroke-width="1.4" stroke-dasharray="10 4 2 4"/></svg>Frontière</li>`
        + dessin.actives.map((k) => `<li><svg width="56" height="22" aria-hidden="true"><g class="ci-marque" transform="translate(28 11) scale(.8)">
            <circle class="ci-m-rond" r="11"/><path class="ci-m-croix" d="M-6 -6L6 6M6 -6L-6 6"/></g></svg>${ech(k.legende || k.titre)}</li>`).join('');
      return `${tete}
      <div class="ci-vue">
        <section class="ci-bloc">
          <div class="ct-barre">
            <button class="btn btn-s" data-ci-ensemble>Vue d'ensemble</button>
            ${C.vues && C.vues[DEST] ? '<button class="btn btn-s" data-ci-derniers>Voir les derniers kilomètres</button>' : ''}
            <span class="ct-aide" data-ct-aide></span>
          </div>
          <div class="ct-cadre-carte ci-boite" data-ct-cadre>
            ${carte}
            <div class="ct-reperes" data-ct-reperes></div>
            <div class="ct-echelle"><span data-ct-ech-txt></span><i data-ct-ech-barre></i></div>
            <div class="ct-attrib">${ech(C.attrib || '© contributeurs OpenStreetMap')}</div>
            <ul class="ci-legende" aria-label="Légende">${legende}</ul>
            <div class="ct-bulle" data-ct-bulle role="status" aria-live="polite"></div>
          </div>
        </section>
        <aside class="ci-panneau">
          <h3>${ech(PLURIEL[0].toUpperCase() + PLURIEL.slice(1))} façons d'aller à ${ech(nomDest)}</h3>
          <div class="ci-liste" role="group" aria-label="Itinéraires">${boutons}</div>
          <div class="ci-fiche" data-ci-fiche aria-live="polite"></div>
        </aside>
      </div>`;
    },

    // `api` = { db, reperer(mode) } — fourni par la vue hôte (entreprise.js). `reperer` compte une ouverture
    // (repérage de l'enseignant, jamais un jalon) ; il ne fait rien chez l'enseignant ni dans une copie rendue.
    brancher(z, api = {}) {
      if (!z.querySelector('[data-ct-svg]')) return null;
      const db = api.db || {};
      const svg = z.querySelector('[data-ct-svg]');
      const groupes = {}; svg.querySelectorAll('[data-ci-it]').forEach((g) => { groupes[g.dataset.ciIt] = g; });
      const conteneur = svg.querySelector('[data-ci-its]');

      function epaisseurs(k, zz) {
        const px = (el, w, dash) => { el.style.strokeWidth = w * k; el.style.strokeDasharray = dash ? dash.map((x) => x * k).join(' ') : ''; };
        svg.querySelectorAll('.ci-eauL').forEach((p) => px(p, 1.6));
        svg.querySelectorAll('.ci-auto').forEach((p) => px(p, 2.2));
        svg.querySelectorAll('.ci-rail').forEach((p) => px(p, 1.1));
        svg.querySelectorAll('.ci-front').forEach((p) => { if (p.closest('svg') === svg) px(p, 1.4, [10, 4, 2, 4]); });
        svg.querySelectorAll('.ci-grille').forEach((p) => px(p, 1));
        svg.querySelectorAll('.ci-cadre').forEach((p) => px(p, 1.6));
        for (const [m, g] of Object.entries(groupes)) {
          const f = ui.choisi === m ? ELARGI : 1;
          g.querySelectorAll('[data-type]').forEach((t) => {
            const L = TRAITS[t.dataset.type];
            px(t.querySelector('.ci-halo'), (largeurMax(L) + 3) * f);
            L.forEach((c, i) => px(t.querySelector(`[data-couche="${i}"]`), c.w * f, c.dash && c.dash.map((x) => x * f)));
            px(t.querySelector('.ci-clic'), CLIC);
          });
        }
        svg.querySelectorAll('[data-fs]').forEach((t) => {
          t.style.fontSize = t.dataset.fs * k + 'px'; t.style.strokeWidth = 3 * k;
          // Au zoom (à mi-chemin de l'animation), les noms des lieux prennent leurs places de zoom.
          const z = zz > 0.5 && t.dataset.pz;
          const pos = z ? t.dataset.pz : t.dataset.px;
          if (pos) { const [a, b] = pos.split(' ').map(Number); t.setAttribute('dx', a * k); t.setAttribute('dy', b * k); }
          if (t.dataset.ancre) t.setAttribute('text-anchor', z ? t.dataset.ancreZ : t.dataset.ancre);
        });
        svg.querySelectorAll('[data-r]').forEach((c) => c.setAttribute('r', c.dataset.r * k));
        svg.querySelectorAll('.ci-lieu, .ci-marque').forEach((g) => g.setAttribute('transform', `translate(${g.dataset.x} ${g.dataset.y}) scale(${k})`));
      }
      const [FX, FY, FW, FH] = C.frame;
      const ENSEMBLE = [FX - 2500, FY - 3500, FW + 5000, FH + 6000];
      const S = monterCadre(z, C, ui, {
        vb: (v) => (v === 'derniers' ? C.vues[DEST] : ENSEMBLE),
        zz: (v) => (v === 'derniers' ? 1 : 0),
        epaisseurs, grille: !!O.quadrillage,
        aide: () => (ui.vue === 'ensemble' ? 'Cliquez un itinéraire pour voir son trajet.'
          : 'Les derniers kilomètres : du terminal à l’entrepôt.'),
      });

      function marquer() {
        for (const [m, g] of Object.entries(groupes)) {
          g.classList.toggle('ci-choisi', ui.choisi === m);
          g.classList.toggle('ci-estompe', !!ui.choisi && ui.choisi !== m);
        }
        if (ui.choisi) conteneur.appendChild(groupes[ui.choisi]);       // au-dessus des autres
        z.querySelectorAll('[data-ci-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ciMode === ui.choisi)));
        z.querySelector('[data-ci-fiche]').innerHTML = fiche(db);
        S.appliquer();
      }
      function choisir(m) {
        ui.choisi = ui.choisi === m ? null : m;
        if (ui.choisi && api.reperer) api.reperer(ui.choisi);
        marquer();
      }
      function vue(v) {
        ui.vue = v;
        const b1 = z.querySelector('[data-ci-ensemble]'), b2 = z.querySelector('[data-ci-derniers]');
        if (b1) b1.classList.toggle('btn-p', v === 'ensemble');
        if (b2) b2.classList.toggle('btn-p', v === 'derniers');
        S.aide();
      }
      z.querySelectorAll('[data-ci-mode]').forEach((b) => b.addEventListener('click', () => choisir(b.dataset.ciMode)));
      svg.querySelectorAll('[data-ci-clic]').forEach((p) => p.addEventListener('click', (ev) => { ev.stopPropagation(); choisir(p.dataset.ciClic); }));
      const b1 = z.querySelector('[data-ci-ensemble]'), b2 = z.querySelector('[data-ci-derniers]');
      if (b1) b1.addEventListener('click', () => { vue('ensemble'); S.allerA(ENSEMBLE, 0); });
      if (b2) b2.addEventListener('click', () => { vue('derniers'); S.allerA(C.vues[DEST], 1); });
      vue(ui.vue); marquer();
      return S;
    },
  };
}
