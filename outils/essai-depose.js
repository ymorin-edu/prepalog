// Page d'ESSAI (maquette cliquable) du lot 2 du chantier « quai en deux séances » : la DÉPOSE DIRIGÉE PAR L'ÉLÈVE
// (brief `docs/briefs/ENT-8.7-action-decharger.md` §7.2, §4 étape 3, §6.4, §10). Elle n'est liée nulle part et ne
// touche pas au moteur : Tristan la clique AVANT qu'on branche l'interaction dans `core/types/quai.js`.
//
// Ce que la maquette montre : le quai 2 (Geodis, centre Action) en rendu iso, le camion à quai porte ouverte, Kevin au
// chariot frontal, 4 palettes filmées. Pour chaque palette, Kevin la sort du camion et ATTEND, palette sur les fourches ;
// les cases libres s'éclairent (contour, jamais d'aplat vert) ; l'élève clique une case. Guidage : une case piège fait
// réagir Kevin et se grise, l'élève rechoisit. Évaluation (`copie`) : le premier clic pose, sans réaction.
//
// Le fichier est rangé en quatre parties, pour passer dans `quai.js` ensuite :
//   (1) l'ÉTAT et les FONCTIONS PURES (aucun accès au navigateur) : contrôle du contenu, état neuf, choix d'une case, jalons ;
//   (2) la GÉOMÉTRIE (pure aussi) : où sont les cases dans le monde du quai iso, les trajets du chariot ;
//   (3) le RENDU (des chaînes SVG, avec les primitives de `core/iso.js`, les mêmes que le quai) ;
//   (4) le CÂBLAGE (la page d'essai : réglages, animation, clics, clavier).
//
// Redessiné ici faute d'export dans `quai.js` (rien n'y est modifié) : le sol du quai (`solQuai` met l'étiquette de la
// zone là où tombe le quai 3), la palette de cartons du quai (`palIso` est interne à `creerQuai`), le dessin du chariot
// avec sa charge (copie de `imageIsoChariot`), le film étirable (aucune primitive pour une palette de cartons).
//
// Page : outils/essai-depose.html (servie par `lancer.bat`, http://localhost:8000/outils/essai-depose.html).

import { projection, murQuai, remorqueInterieur, niveleur, lampeQuai, ouvertureQuai, paletteCartons,
  dessinerChariotFrontal, horlogeQuai } from '../core/iso.js';
import { CHARIOT_QUAI, CHARIOT_FL, CHARIOT_BL } from '../core/types/quai.js';
import { ech } from '../core/texte.js';
import { auClavier } from '../core/gestes.js';

/* =============================================================== (1) état et fonctions pures */

export const SOLS_DEPOSE = ['pieton', 'autre-quai'];
export const PREMIERE_BULLE = 'Dis-moi où je pose chaque palette. Pas de gerbage à la réception.';
const minuscule = (t) => String(t).charAt(0).toLowerCase() + String(t).slice(1);
// Les réactions de Kevin par défaut, d'après le sol de la case (le contenu peut les remplacer, case par case).
export const reactionDefaut = (c) => (c.sol === 'pieton' ? 'Là, c’est l’allée piétonne : je ne pose pas ici.'
  : c.sol === 'autre-quai' ? `Ça, c’est la zone du ${minuscule(c.legende || 'quai voisin')}.` : '');
// Le nom lu par un lecteur d'écran : le NOM de la case et ce qu'on voit au sol, jamais le verdict.
export const nomDefaut = (c) => (c.sol === 'pieton' ? `Case ${c.id}, allée piétonne`
  : c.sol === 'autre-quai' ? `Case ${c.id}, devant le ${minuscule(c.legende || 'quai voisin')}` : `Case ${c.id}`);

const CLES_DEPOSE = ['cases', 'passage', 'consigne', 'grise'];
const CLES_CASE = ['id', 'nom', 'juste', 'reaction', 'sol', 'legende', 'peinte'];
export const MAX_CASES = 8;

// Le contrôle du contenu, comme `verifierQuai` : la liste des écarts en clair, vide si tout va bien. `nbPalettes` : les
// palettes du camion (une case occupée ne se propose plus et il n'y a pas de gerbage : il faut AU MOINS une case juste
// par palette, sinon l'élève de guidage finirait sans case où poser).
export function verifierDepose(D, nbPalettes) {
  const E = [];
  if (!D || typeof D !== 'object' || Array.isArray(D)) return ['depose doit être un objet { cases, passage }'];
  Object.keys(D).forEach((k) => { if (!CLES_DEPOSE.includes(k)) E.push(`depose : clé « ${k} » inconnue (${CLES_DEPOSE.join(', ')})`); });
  const C = D.cases;
  if (!Array.isArray(C) || !C.length) return E.concat(['depose.cases doit être une liste non vide']);
  if (C.length > MAX_CASES) E.push(`depose.cases : ${C.length} cases, ${MAX_CASES} au plus (plan non éprouvé au-delà)`);
  const vus = new Set();
  C.forEach((c, i) => {
    const nom = `depose.cases[${i}]${c && typeof c.id === 'string' && c.id ? ` (« ${c.id} »)` : ''}`;
    if (!c || typeof c !== 'object') { E.push(`${nom} : une case est un objet`); return; }
    Object.keys(c).forEach((k) => { if (!CLES_CASE.includes(k)) E.push(`${nom} : clé « ${k} » inconnue (${CLES_CASE.join(', ')})`); });
    if (typeof c.id !== 'string' || !c.id.trim()) E.push(`${nom} : id vide`);
    else if (vus.has(c.id)) E.push(`${nom} : id en double`);
    else vus.add(c.id);
    if (c.sol !== undefined && !SOLS_DEPOSE.includes(c.sol)) E.push(`${nom} : sol « ${c.sol} » inconnu (${SOLS_DEPOSE.join(', ')})`);
    if (c.juste !== undefined && typeof c.juste !== 'boolean') E.push(`${nom} : juste doit être true ou false`);
    if (c.juste === true && c.sol) E.push(`${nom} : juste: true sur une case « ${c.sol} » (incohérent : la case se dessine comme un piège)`);
    if (c.sol === 'autre-quai' && (typeof c.legende !== 'string' || !c.legende.trim())) E.push(`${nom} : une case « autre-quai » demande sa légende (« Quai 3 »)`);
    ['nom', 'reaction', 'legende'].forEach((k) => { if (c[k] !== undefined && (typeof c[k] !== 'string' || !c[k].trim())) E.push(`${nom} : ${k} vide`); });
    if (c.juste === false && !c.sol && !c.reaction) E.push(`${nom} : une case fausse sans sol demande sa réaction (ce que dit le cariste)`);
    if (c.peinte !== undefined && typeof c.peinte !== 'boolean') E.push(`${nom} : peinte doit être true ou false`);
    if (c.peinte === false && !c.sol) E.push(`${nom} : peinte: false sur une case sans sol (une case juste est toujours peinte au sol)`);
  });
  const P = D.passage === undefined ? Math.floor(C.length / 2) : D.passage;
  if (!Number.isInteger(P) || P < 0 || P > C.length) E.push(`depose.passage : ${D.passage} n’est pas un nombre de cases à gauche de la porte (0 à ${C.length})`);
  else {
    // Une case « autre-quai » collée au passage mettrait la porte du quai voisin sur celle du quai : refusé.
    [P - 1, P].forEach((i) => { if (C[i] && C[i].sol === 'autre-quai') E.push(`depose.cases[${i}] : une case « autre-quai » ne touche pas le passage de la porte (la porte du quai voisin tomberait sur celle-ci)`); });
  }
  if (['garde', 'palette'].indexOf(D.grise === undefined ? 'garde' : D.grise) < 0) E.push(`depose.grise : « ${D.grise} » inconnu (garde, palette)`);
  const justes = C.filter((c) => c && (c.juste !== undefined ? c.juste : !c.sol)).length;
  if (Number.isInteger(nbPalettes) && justes < nbPalettes) E.push(`depose : ${nbPalettes} palettes et ${justes} case${justes > 1 ? 's' : ''} juste${justes > 1 ? 's' : ''} : il faut au moins une case juste par palette (une case occupée ne se propose plus, pas de gerbage à la réception)`);
  return E;
}

// Les cases telles que la vue s'en sert : `juste` déduit du sol quand il n'est pas déclaré, `nom` et `reaction` par défaut.
export function normaliserCases(D) {
  return D.cases.map((c) => {
    const k = { id: c.id, sol: c.sol || null, legende: c.legende || null, peinte: c.peinte !== false };
    k.juste = c.juste !== undefined ? c.juste : !c.sol;
    k.nom = c.nom || nomDefaut(k);
    k.reaction = c.reaction || reactionDefaut(k);
    return k;
  });
}

// L'état rangé (dans `db.quais[<id>].depose` au branchement) : par palette, { premier, essais, pose }.
//   premier : la PREMIÈRE case cliquée (le jalon la lit) ; essais : toutes les cases cliquées, dans l'ordre ;
//   pose : la case où la palette est posée (null tant qu'elle ne l'est pas).
// Les cases grisées et occupées ne sont JAMAIS rangées : elles se calculent depuis `essais` et `pose`.
export function etatDeposeNeuf() { return { depose: {} }; }

const caseDe = (cases, id) => cases.find((c) => c.id === id) || null;
export const casesOccupees = (etat) => new Set(Object.values(etat.depose).map((d) => d.pose).filter(Boolean));
// Les cases grisées pour cette palette : les pièges déjà essayés (par cette palette seulement si `grise: 'palette'`,
// par toutes les palettes si `grise: 'garde'`). En évaluation, rien ne se grise jamais (le premier clic pose).
export function casesGrisees(etat, cases, palette, { copie = false, grise = 'garde' } = {}) {
  const G = new Set();
  if (copie) return G;
  Object.entries(etat.depose).forEach(([p, d]) => {
    if (grise === 'palette' && p !== palette) return;
    d.essais.forEach((id) => { const c = caseDe(cases, id); if (c && !c.juste) G.add(id); });
  });
  return G;
}
// Les cases que l'élève peut cliquer pour cette palette, dans l'ordre du contenu (de gauche à droite à l'écran).
export function casesProposees(etat, cases, palette, opts = {}) {
  const occ = casesOccupees(etat), gr = casesGrisees(etat, cases, palette, opts);
  return cases.filter((c) => !occ.has(c.id) && !gr.has(c.id)).map((c) => c.id);
}
// Le choix d'une case pour la palette en attente. Rend le NOUVEL état (l'ancien n'est pas touché), ou le MÊME objet si le
// clic ne compte pas (palette déjà posée, case inconnue, occupée ou grisée). Guidage : une case fausse est notée dans
// `essais` et la palette reste sur les fourches ; une case juste la pose. Évaluation (`copie`) : le premier clic pose.
export function choisirCase(etat, cases, palette, id, opts = {}) {
  const d = etat.depose[palette] || { premier: null, essais: [], pose: null };
  if (d.pose) return etat;
  const c = caseDe(cases, id);
  if (!c || !casesProposees(etat, cases, palette, opts).includes(id)) return etat;
  const n = { premier: d.premier || id, essais: d.essais.concat([id]), pose: opts.copie || c.juste ? id : null };
  return { depose: Object.assign({}, etat.depose, { [palette]: n }) };
}
// Ce qu'a donné le dernier clic sur cette palette : 'pose' (posée) ou 'refus' (case fausse, guidage) et la réaction.
export function issueDernierChoix(etat, cases, palette) {
  const d = etat.depose[palette];
  if (!d || !d.essais.length) return null;
  const id = d.essais[d.essais.length - 1], c = caseDe(cases, id);
  return d.pose ? { issue: 'pose', case: id } : { issue: 'refus', case: id, reaction: c ? c.reaction : '' };
}
// La palette que le cariste porte ou va porter : la première de l'ordre de sortie qui n'est pas posée (null : fini).
export const paletteEnAttente = (etat, ordre) => ordre.find((p) => !(etat.depose[p] && etat.depose[p].pose)) || null;
export const deposeFinie = (etat, ordre) => paletteEnAttente(etat, ordre) === null;
// Les jalons : un par palette, dans l'ordre du camion (P1, P2…). Juste = le PREMIER choix est une case juste ET toutes
// les palettes sont posées (brief §5 : « une palette non posée = faux ; rien n'est vrai avant la fin du déchargement »).
// `lib` neutre (il peut se lire pendant la séance) ; la bonne réponse est dans `attendu`, lue au bilan.
export function jalonsDepose(etat, cases, palettes) {
  const fini = palettes.every((p) => etat.depose[p] && etat.depose[p].pose);
  const justes = cases.filter((c) => c.juste).map((c) => c.id).join(', ');
  return palettes.map((p) => {
    const d = etat.depose[p], c = d && d.premier ? caseDe(cases, d.premier) : null;
    return { id: `depose-${p}`, palette: p, lib: `Dépose de la palette ${p}`, ok: !!(fini && c && c.juste),
      premier: d ? d.premier : null, attendu: `une case de la zone de réception (${justes})` };
  });
}

/* =============================================================== (2) géométrie (pure) */
// Le monde du quai iso (mètres, projection du quai : unité 60, origine [470, 235]) : le mur en y = 0, l'ouverture de la
// porte de x = 2,4 à 3,6, la remorque derrière (y < 0). Les cases sont posées SUR UNE LIGNE parallèle au mur, de part et
// d'autre d'un PASSAGE laissé libre devant la porte (`passage` = le nombre de cases à gauche).
//
// POURQUOI UNE LIGNE, et pas « deux rangées de 3 » l'une derrière l'autre : le chariot dessiné ne tourne pas (fourches vers
// le mur, `planChariot`) et l'élève choisit l'ordre. Une case de la rangée du fond, derrière une palette déjà posée devant
// elle, ne serait plus atteignable (le corps du chariot, 1,8 m derrière ses fourches, tomberait dans la palette posée).
// Sur une ligne, chaque case est servie par l'allée devant la zone, quel que soit l'ordre : aucune collision possible.
export const GEO_DEPOSE = {
  PAS: 1.05, LARG: 0.95, PROF: 1.4, Y0: 1.6,      // une case (contour au sol) et le pas d'une case à l'autre
  PAL: [0.8, 1.2],                                 // une palette de cartons tournée d'un quart de tour (dimsPalette(3))
  X_PORTE: 3.0, BORD_G: 2.4, BORD_D: 3.6,          // le milieu de l'ouverture ; aucune case dans le passage (2,4 à 3,6)
  Y_CAMION: -2.9, PAS_CAMION: 1.3,                 // la palette de tête dans la remorque, et la file derrière elle (ceux du quai)
};
const G = GEO_DEPOSE;
// Les suites de cases voisines d'un même sol (une allée piétonne par suite, un quai voisin par suite).
function suites(cases, geo, sol) {
  const R = [];
  cases.forEach((c, i) => {
    if (c.sol !== sol) return;
    const der = R[R.length - 1];
    if (der && der.i1 === i - 1) { der.i1 = i; der.x1 = geo[i].x1; } else R.push({ i0: i, i1: i, x0: geo[i].x0, x1: geo[i].x1, legende: c.legende });
  });
  return R;
}
export function geometrieDepose(cases, passage = Math.floor(cases.length / 2)) {
  const gab = G.PAL, ec = Math.max(0, gab[1] - CHARIOT_FL);   // la palette dépasse le bout des fourches de `ec`
  const geo = cases.map((c, i) => {
    const x0 = i < passage ? G.BORD_G - G.LARG - (passage - 1 - i) * G.PAS : G.BORD_D + (i - passage) * G.PAS;
    const px = x0 + (G.LARG - gab[0]) / 2, py = G.Y0 + (G.PROF - gab[1]) / 2;
    return { id: c.id, x0, x1: x0 + G.LARG, y0: G.Y0, y1: G.Y0 + G.PROF, px, py, cx: px + gab[0] / 2, ycPose: py + gab[1] - CHARIOT_FL, peinte: c.peinte !== false };
  });
  // La zone de réception peinte : autour des cases peintes au sol, hors quai voisin (une case `peinte: false` en reste dehors).
  const z = geo.filter((g, i) => cases[i].sol !== 'autre-quai' && g.peinte);
  const xNom = Math.min(...geo.filter((_, i) => cases[i].juste).map((g) => g.x0));   // le nom de la zone commence à la première case juste
  return {
    cases: geo,
    pieton: suites(cases, geo, 'pieton'),
    autres: suites(cases, geo, 'autre-quai').map((s) => Object.assign(s, { xPorte: (s.x0 + s.x1) / 2 })),
    zone: z.length ? { x0: Math.min(...z.map((g) => g.x0)) - 0.12, x1: Math.max(...z.map((g) => g.x1)) + 0.12, y0: G.Y0 - 0.12, y1: G.Y0 + G.PROF + 0.12, xNom } : null,
    sol: { x0: Math.min(-1.2, Math.min(...geo.map((g) => g.x0)) - 0.6), x1: Math.max(7.5, Math.max(...geo.map((g) => g.x1)) + 0.6), y1: 6.4 },
    xPorte: G.X_PORTE,
    ycCamion: G.Y_CAMION + gab[1] - CHARIOT_FL,      // bout des fourches pour prendre la palette de tête
    ycSortie: 0.12 + ec,                             // juste sorti de la remorque (la palette devant le seuil)
    ycAllee: G.Y0 + G.PROF + 0.12 + ec,              // dans l'allée devant la zone : la palette portée ne touche aucune case
  };
}
// Le point d'attente : à la sortie du camion (`'sortie'`) ou dans l'allée devant la zone (`'allee'`).
export const ycAttente = (geo, attente) => (attente === 'allee' ? geo.ycAllee : geo.ycSortie);

// Un trajet = des segments { t0, t1, a: [cx, yc, lev], b } (comme `planChariot`) et des instants nommés. La différence
// avec le quai d'aujourd'hui : le plan ne se précalcule plus en entier (on ne sait pas où ira la palette avant le clic) ;
// un trajet par geste, joué après le choix.
function planificateur(depart) {
  const V = CHARIOT_QUAI.V, legs = [], marques = {};
  let t = 0, pos = depart.slice();
  const aller = (cx, yc, lev, vitesse) => {
    const b = [cx == null ? pos[0] : cx, yc == null ? pos[1] : yc, lev == null ? pos[2] : lev];
    if (b[0] === pos[0] && b[1] === pos[1] && b[2] === pos[2]) return;
    const d = lev != null && lev !== pos[2] ? V.leve : Math.max(250, 1000 * Math.hypot(b[0] - pos[0], b[1] - pos[1]) / vitesse);
    legs.push({ t0: t, t1: t + d, a: pos.slice(), b }); t += d; pos = b;
  };
  return { V, aller, marque: (n) => { marques[n] = t; }, fin: () => ({ legs, marques, duree: t, arrivee: pos.slice() }) };
}
// Chercher la palette de tête : du point d'attente, à vide, jusque dans la remorque, la lever, revenir l'attendre.
export function trajetChercher(geo, attente) {
  const yA = ycAttente(geo, attente), p = planificateur([geo.xPorte, yA, 0]);
  p.aller(null, geo.ycCamion, null, p.V.avance);
  p.marque('leve'); p.aller(null, null, CHARIOT_QUAI.LEV); p.marque('sortie');
  p.aller(null, yA, null, p.V.recule);
  return p.fin();
}
// Poser la palette portée dans une case : reculer jusqu'à l'allée, glisser devant la case, avancer, poser, dégager,
// revenir au point d'attente à vide.
export function trajetPoser(geo, k, attente) {
  const yA = ycAttente(geo, attente), p = planificateur([geo.xPorte, yA, CHARIOT_QUAI.LEV]);
  p.aller(null, geo.ycAllee, null, p.V.recule);
  p.aller(k.cx, null, null, p.V.crabeCharge);
  p.aller(null, k.ycPose, null, p.V.avance);
  p.aller(null, null, 0); p.marque('pose');
  p.aller(null, geo.ycAllee, null, p.V.recule);
  p.aller(geo.xPorte, null, null, p.V.crabe);
  p.aller(null, yA, null, p.V.avance);
  return p.fin();
}
export function positionSur(legs, t, depart) {
  if (!legs.length) return depart.slice();
  let leg = legs[legs.length - 1];
  for (const l of legs) if (t < l.t1) { leg = l; break; }
  const f = leg.t1 > leg.t0 ? Math.min(1, Math.max(0, (t - leg.t0) / (leg.t1 - leg.t0))) : 1;
  return [0, 1, 2].map((i) => leg.a[i] + (leg.b[i] - leg.a[i]) * f);
}
// Le contrôle des collisions (pour la maquette et pour le futur test) : tous les rectangles balayés d'un trajet de pose
// évitent toutes les AUTRES cases. Rend la liste des heurts (vide : aucun).
export function heurtsPose(geo, k) {
  const D = CHARIOT_QUAI.DEMI, gab = G.PAL, H = [];
  const emprise = ([cx, yc, lev]) => ({ x0: Math.min(cx - D, cx - gab[0] / 2), x1: Math.max(cx + D, cx + gab[0] / 2), y0: lev > 0 ? Math.min(yc, yc + CHARIOT_FL - gab[1]) : yc, y1: yc + CHARIOT_BL });
  const coupe = (a, b) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.y0 < b.y1 - 1e-6 && b.y0 < a.y1 - 1e-6;
  const legs = trajetPoser(geo, k, 'sortie').legs.concat(trajetPoser(geo, k, 'allee').legs, trajetChercher(geo, 'sortie').legs, trajetChercher(geo, 'allee').legs);
  legs.forEach((l, n) => {
    const r = emprise(l.a), s = emprise(l.b), b = { x0: Math.min(r.x0, s.x0), x1: Math.max(r.x1, s.x1), y0: Math.min(r.y0, s.y0), y1: Math.max(r.y1, s.y1) };
    geo.cases.forEach((o) => { if (o.id !== k.id && coupe(b, { x0: o.px, x1: o.px + gab[0], y0: o.py, y1: o.py + gab[1] })) H.push(`${k.id} : segment ${n} dans ${o.id}`); });
  });
  return H;
}

/* =============================================================== (3) rendu (SVG) */

const I2 = projection({ unite: 60, origine: [470, 235] });
const ENCRE = '#1a1915', PAPIER = '#fdfbf7';   // les teintes claires de la charte : le dessin iso ne change pas avec le thème
const N2 = (v) => v.toFixed(1);
// La matrice du plan du sol : un texte ou un pictogramme écrit en mètres, à plat sur le sol (x vers la droite, y vers l'élève).
function matriceSol(I) {
  const [ox, oy] = I.P(0, 0, 0), [ax, ay] = I.P(1, 0, 0), [bx, by] = I.P(0, 1, 0);
  return `matrix(${(ax - ox).toFixed(3)},${(ay - oy).toFixed(3)},${(bx - ox).toFixed(3)},${(by - oy).toFixed(3)},${ox.toFixed(1)},${oy.toFixed(1)})`;
}
const MAT_SOL = matriceSol(I2);
const surSol = (contenu) => `<g transform="${MAT_SOL}">${contenu}</g>`;
const rectSol = (x0, y0, x1, y1, z = 0) => I2.pts([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);
const POLICE = 'Inter, system-ui, \'Segoe UI\', Arial, sans-serif';

// Les palettes du camion du Havre (brief §6.3 : désignations génériques, quantités construites). La vue ne montre que
// leur aspect (palettes filmées) ; `W × D` cartons par couche, `L` couches, `H` la hauteur des cartons (m).
export const PALETTES = [
  { id: 'P1', nom: 'Bougies parfumées, lot de 3', W: 4, D: 2, L: 5, H: 1.30 },
  { id: 'P2', nom: 'Assiettes plates en grès, lot de 6', W: 3, D: 2, L: 4, H: 1.16 },
  { id: 'P3', nom: 'Boîtes de rangement plastique', W: 5, D: 1, L: 4, H: 1.40 },
  { id: 'P4', nom: 'Torchons de cuisine, lot de 3', W: 4, D: 2, L: 6, H: 1.26 },
];
function palCartons(p) {
  const total = p.W * p.D * p.L, cartons = [];
  for (let k = 0; k < p.L; k++) for (let j = 0; j < p.D; j++) for (let i = 0; i < p.W; i++) cartons.push({ i, j, k, no: 1 + k * p.W * p.D + j * p.W + i, absent: false, abime: null, etiq: {} });
  return { nW: p.W, nD: p.D, nL: p.L, total, cartons };
}
const PLANCHER = 0.144;
// Le film étirable : un voile translucide sur les faces visibles (devant, droite, dessus) et un trait par tour, coupé au mur.
function film(x, y, w, d, z0, z1, yMin, yMax) {
  const voile = 'rgba(205,228,242,.34)', trait = 'rgba(120,160,190,.6)';
  const ya = Math.max(y, yMin), yb = Math.min(y + d, yMax);
  if (yb <= ya) return '';
  let s = '';
  if (y + d <= yMax + 1e-6) s += I2.face([[x, y + d, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x, y + d, z1]], voile, trait);
  s += I2.face([[x + w, ya, z0], [x + w, yb, z0], [x + w, yb, z1], [x + w, ya, z1]], voile, trait);
  s += I2.face([[x, ya, z1], [x + w, ya, z1], [x + w, yb, z1], [x, yb, z1]], 'rgba(215,234,245,.26)', trait);
  for (let t = 1; t <= 4; t++) {
    const zz = z0 + (z1 - z0) * t / 5;
    const L = (y + d <= yMax + 1e-6 ? [[x, y + d, zz], [x + w, y + d, zz]] : [[x + w, yb, zz]]).concat([[x + w, ya, zz]]);
    s += `<polyline points="${I2.pts(L)}" fill="none" stroke="rgba(110,150,180,.55)" stroke-width="1"/>`;
  }
  return `<g pointer-events="none">${s}</g>`;
}
const MEMO_PAL = new Map();
function palSvg(p, x, y, yMin, yMax) {
  if (!MEMO_PAL.has(p.id)) MEMO_PAL.set(p.id, palCartons(p));
  const ch = p.H / p.L, w = G.PAL[0], d = G.PAL[1];
  return `<g data-dep-pal="${ech(p.id)}" pointer-events="none">${paletteCartons(I2, MEMO_PAL.get(p.id), x, y, 3, { yMin: Math.max(yMin, -3.6), yMax, lisible: false, hauteurCarton: ch })}${film(x, y, w, d, PLANCHER + 0.01, PLANCHER + p.H + 0.02, Math.max(yMin, -3.6), yMax)}</g>`;
}
// Le chariot (copie de `imageIsoChariot`) : sa projection à l'échelle K posée sur le bout des fourches, la palette portée
// sur les fourches, coupé au mur (`yMin` / `yMax` monde).
function chariotSvg(pos, portee, yMin, yMax) {
  const K = CHARIOT_QUAI.K, [cx, yc, lev] = pos;
  const Ik = projection({ unite: I2.unite * K, origine: I2.P(cx - 0.5 * K, yc, 0) });
  const yPal = yc + CHARIOT_FL - G.PAL[1], xPal = cx - G.PAL[0] / 2;
  const charge = portee ? `<g transform="translate(0 ${(-lev * I2.unite).toFixed(2)})">${palSvg(portee, xPal, yPal, yMin, yMax)}</g>` : '';
  return dessinerChariotFrontal(Ik, { x: 0, y: 0, lev: lev / K, chargeSvg: charge, coupe: { yMin: (yMin - yc) / K, yMax: (yMax - yc) / K }, gilet: true }, {});
}
// Un pictogramme piéton peint au sol (en mètres, centré en (x, y), 0,7 m de côté) : carré jaune, silhouette qui marche.
function pictoPieton(x, y) {
  const s = 0.7, x0 = x - s / 2, y0 = y - s / 2;
  return surSol(`<g data-dep-picto="pieton"><rect x="${x0}" y="${y0}" width="${s}" height="${s}" rx="0.06" fill="#e7c628" stroke="#a88a0c" stroke-width="0.02"/>
    <g fill="none" stroke="${ENCRE}" stroke-width="0.055" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${x + 0.02},${y - 0.14} L${x - 0.03},${y + 0.07} M${x - 0.03},${y + 0.07} L${x - 0.13},${y + 0.25} M${x - 0.03},${y + 0.07} L${x + 0.08},${y + 0.16} L${x + 0.1},${y + 0.27}
        M${x + 0.01},${y - 0.1} L${x - 0.12},${y - 0.01} M${x + 0.01},${y - 0.1} L${x + 0.1},${y - 0.02} L${x + 0.16},${y + 0.06}"/></g>
    <circle cx="${x + 0.04}" cy="${y - 0.22}" r="0.055" fill="${ENCRE}"/></g>`);
}
// Une porte sectionnelle FERMÉE sur le mur (le quai voisin), son seuil au sol et son panneau, comme `murQuai`.
function porteVoisine(xc, legende) {
  const x0 = xc - 0.6, x1 = xc + 0.6;
  let g = `<g data-dep-quai-voisin>${I2.face([[x0 - 0.06, 0.0008, 0], [x1 + 0.06, 0.0008, 0], [x1 + 0.06, 0.0008, 2.11], [x0 - 0.06, 0.0008, 2.11]], '#8d969b', 'none')}`;
  g += I2.face([[x0, 0.001, 0], [x1, 0.001, 0], [x1, 0.001, 2.05], [x0, 0.001, 2.05]], '#d4d8da', '#8d969b');
  for (let z = 0.2; z < 2.05; z += 0.25) g += `<polyline points="${I2.pts([[x0, 0.002, z], [x1, 0.002, z]])}" stroke="#a3abb0"/>`;
  g += I2.face([[xc - 0.3, 0.003, 2.25], [xc + 0.3, 0.003, 2.25], [xc + 0.3, 0.003, 2.55], [xc - 0.3, 0.003, 2.55]], '#1f5f3a', '#0f3d24');
  const [lx, ly] = I2.P(xc, 0.004, 2.4);
  g += `<text x="${N2(lx)}" y="${N2(ly + 6)}" text-anchor="middle" font-size="11" font-weight="800" fill="${PAPIER}" transform="rotate(30 ${N2(lx)} ${N2(ly)})">${ech(String(legende).toUpperCase())}</text></g>`;
  return g;
}
// La bande jaune et noire du seuil d'une porte de quai (celle de `solQuai`), 8 bandes de 15 cm à partir de x0.
const seuil = (x0) => { let g = ''; for (let k = 0; k < 8; k++) { const x = x0 + k * 0.15; g += I2.face([[x, 0, 0], [x + 0.15, 0, 0], [x + 0.15, 0.18, 0], [x, 0.18, 0]], k % 2 ? '#1b1b1b' : '#e7c628', 'none'); } return g; };
// Une porte piétonne dans le mur, au bout de l'allée piétonne.
function portePietonne(xc) {
  const x0 = xc - 0.45, x1 = xc + 0.45;
  return `<g data-dep-porte-pietonne>${I2.face([[x0, 0.001, 0], [x1, 0.001, 0], [x1, 0.001, 2.0], [x0, 0.001, 2.0]], '#6f7b83', '#4c565d')}`
    + I2.face([[x0 + 0.2, 0.002, 1.25], [x1 - 0.2, 0.002, 1.25], [x1 - 0.2, 0.002, 1.75], [x0 + 0.2, 0.002, 1.75]], '#b9cad4', '#4c565d')
    + `<circle cx="${N2(I2.P(x1 - 0.12, 0.002, 1.0)[0])}" cy="${N2(I2.P(x1 - 0.12, 0.002, 1.0)[1])}" r="2.5" fill="#2b2f33"/></g>`;
}

// Le décor fixe : sol (agrandi à la largeur des cases), zones, allées, cases au sol, mur, portes. Ne change pas pendant
// l'animation (il est calculé une fois par variante).
export function decorDepose(cases, geo) {
  const S = geo.sol;
  let sol = I2.face([[S.x0, 0, 0], [S.x1, 0, 0], [S.x1, S.y1, 0], [S.x0, S.y1, 0]], '#e4dfd3', '#c9c3b6');
  // La zone de réception du quai (pointillés jaunes, comme `solQuai`) et son nom peint au sol, devant.
  if (geo.zone) {
    const Z = geo.zone;
    sol += `<polygon data-dep-zone points="${rectSol(Z.x0, Z.y0, Z.x1, Z.y1)}" fill="rgba(231,198,40,.12)" stroke="#d1a90f" stroke-width="3" stroke-dasharray="10 6"/>`;
    sol += surSol(`<text x="${Z.xNom}" y="${Z.y1 + 0.42}" font-size="0.3" font-weight="800" fill="#555047" font-family="${POLICE}">ZONE DE RÉCEPTION — QUAI 2</text>`);
  }
  // L'allée piétonne : une bande hachurée du mur au fond du quai, bordée de deux traits pleins, pictogrammes.
  geo.pieton.forEach((a, n) => {
    const x0 = a.x0 - 0.12, x1 = a.x1 + 0.12, id = `depHachure${n}`;
    let raies = '';
    for (let y = -2; y < S.y1 + 2; y += 0.42) raies += `<polygon points="${I2.pts([[x0, y, 0], [x1, y + (x1 - x0), 0], [x1, y + (x1 - x0) + 0.16, 0], [x0, y + 0.16, 0]])}" fill="rgba(231,198,40,.62)"/>`;
    sol += `<g data-dep-allee-pietonne><clipPath id="${id}"><polygon points="${rectSol(x0, 0, x1, S.y1)}"/></clipPath>`;
    sol += `<polygon points="${rectSol(x0, 0, x1, S.y1)}" fill="rgba(231,198,40,.16)"/><g clip-path="url(#${id})">${raies}</g>`;
    sol += `<polyline points="${I2.pts([[x0, 0, 0], [x0, S.y1, 0]])}" stroke="#d1a90f" stroke-width="3.5" fill="none"/><polyline points="${I2.pts([[x1, 0, 0], [x1, S.y1, 0]])}" stroke="#d1a90f" stroke-width="3.5" fill="none"/>`;
    sol += pictoPieton((x0 + x1) / 2, 0.75) + pictoPieton((x0 + x1) / 2, 4.3);
    sol += surSol(`<text x="${x0 + 0.08}" y="${5.35}" font-size="0.26" font-weight="800" fill="#555047" font-family="${POLICE}">PIÉTONS</text>`) + '</g>';
  });
  // Le quai voisin : sa zone en pointillés et sa légende peinte au sol (« QUAI 3 »).
  geo.autres.forEach((a) => {
    sol += `<g data-dep-zone-voisine><polygon points="${rectSol(a.x0 - 0.12, G.Y0 - 0.12, a.x1 + 0.12, G.Y0 + G.PROF + 0.12)}" fill="rgba(231,198,40,.08)" stroke="#d1a90f" stroke-width="3" stroke-dasharray="10 6"/>`;
    sol += surSol(`<text x="${a.x0 - 0.05}" y="${G.Y0 + G.PROF + 0.42}" font-size="0.3" font-weight="800" fill="#555047" font-family="${POLICE}">${ech(String(a.legende).toUpperCase())}</text>`) + '</g>';
    sol += seuil(a.xPorte - 0.6);
  });
  // Les cases peintes au sol : un contour fin et leur nom (R1…). Brief §6.4 : toutes, pièges compris ; une case
  // `peinte: false` (un piège qu'aucun marquage ne désigne comme une case) n'a ni contour ni nom au sol : elle ne
  // s'éclaire que pendant le choix.
  geo.cases.forEach((k) => {
    if (!k.peinte) return;
    sol += `<polygon points="${rectSol(k.x0, k.y0, k.x1, k.y1, 0.002)}" fill="none" stroke="#6d675b" stroke-width="1.6"/>`;
    sol += surSol(`<text x="${(k.x0 + k.x1) / 2}" y="${k.y0 + 0.62}" text-anchor="middle" font-size="0.4" font-weight="800" fill="#6d675b" font-family="${POLICE}">${ech(k.id)}</text>`);
  });
  sol += seuil(2.4);
  // (Pas de marquage du point d'attente : essayé, il est toujours sous le chariot qui attend dessus, donc jamais vu.)
  // Le mur : celui du quai (`murQuai`, porte levée, panneau QUAI 2), prolongé à gauche et à droite au besoin.
  const m = ['#b9b3a6', '#c9c3b6', '#a9a397'];
  let mur = S.x0 < -1.2 ? I2.boite(S.x0, -0.3, 0, -1.2 - S.x0, 0.3, 2.7, m) : '';
  mur += murQuai(I2, 1, 'Quai 2');
  if (S.x1 > 7.5) mur += I2.boite(7.5, -0.3, 0, S.x1 - 7.5, 0.3, 2.7, m);
  geo.autres.forEach((a) => { mur += porteVoisine(a.xPorte, a.legende); });
  geo.pieton.forEach((a) => { mur += portePietonne((a.x0 + a.x1) / 2); });
  mur += horlogeQuai(I2, 1.0, 0.01, 2.25, '07:24');
  return { sol, mur };
}

// Le cadre (viewBox) : tout ce qui peut se voir — le mur au-dessus des cases, la remorque, l'allée où le chariot glisse.
export function cadreDepose(geo) {
  const xs = geo.cases.map((k) => k.x0).concat(geo.cases.map((k) => k.x1));
  const x0 = Math.min(...xs) - 0.3, x1 = Math.max(...xs) + 0.3, yBas = geo.ycAllee + CHARIOT_BL + 0.15;
  const cx0 = Math.min(...geo.cases.map((k) => k.cx)) - 0.5, cx1 = Math.max(...geo.cases.map((k) => k.cx)) + 0.5;
  const pts = [[x0, 0, 2.75], [x1, 0, 2.75], [x0, G.Y0 + G.PROF + 0.7, 0], [x1, G.Y0 + G.PROF + 0.7, 0], [cx0, yBas, 0], [cx1, yBas, 0], [3.6, -3.6, 2.05], [2.4, -3.6, 2.1]];
  const P = pts.map((p) => I2.P(...p));
  const a = Math.min(...P.map((p) => p[0])) - 10, b = Math.min(...P.map((p) => p[1])) - 10;
  return [Math.floor(a), Math.floor(b), Math.ceil(Math.max(...P.map((p) => p[0])) + 10 - a), Math.ceil(Math.max(...P.map((p) => p[1])) + 10 - b)];
}

// L'image mobile : la remorque et sa file, les palettes posées, le chariot. `vis` = ce qu'on voit à cet instant :
//   { pos: [cx, yc, lev], portee: id | null, posees: { id: caseId }, camion: [ids dans la remorque, tête d'abord], retard: 0..1 }
export function imageDepose(vis, geo, decor, palettes) {
  const Pp = (id) => palettes.find((p) => p.id === id);
  const dedans = [], dehors = [];
  const ajoute = (cle, ded, deh) => { if (ded) dedans.push([cle, ded]); if (deh) dehors.push([cle, deh]); };
  vis.camion.forEach((id, r) => {
    const y = G.Y_CAMION - (r + vis.retard) * G.PAS_CAMION, x = G.X_PORTE - G.PAL[0] / 2;
    ajoute(x + y, palSvg(Pp(id), x, y, -99, 0), '');
  });
  Object.entries(vis.posees).forEach(([id, cid]) => {
    const k = geo.cases.find((c) => c.id === cid);
    ajoute(k.px + G.PAL[0] / 2 + k.py + G.PAL[1] / 2, '', palSvg(Pp(id), k.px, k.py, 0, 99));
  });
  const [cx, yc] = vis.pos, portee = vis.portee ? Pp(vis.portee) : null;
  const yPal = yc + CHARIOT_FL - G.PAL[1], cle = cx + yc + CHARIOT_BL / 2;
  if (Math.min(yc, portee ? yPal : yc) < 0.02) dedans.push([cle, `<g data-dep-chariot="dedans" pointer-events="none">${chariotSvg(vis.pos, portee, -99, 0)}</g>`]);
  if (yc + CHARIOT_BL > 0) dehors.push([cle, `<g data-dep-chariot="dehors" pointer-events="none">${chariotSvg(vis.pos, portee, 0, 99)}</g>`]);
  const trier = (L) => L.sort((a, b) => a[0] - b[0]).map((x) => x[1]).join('');
  const lp = lampeQuai(I2, 'allumee');
  return `${decor.sol}<g clip-path="url(#depOuv)">${remorqueInterieur(I2)}${niveleur(I2, 'dedans', 'pose')}${lp.cone}${trier(dedans)}</g>`
    + `${decor.mur}${niveleur(I2, 'dehors', 'pose')}${lp.tete}${trier(dehors)}`;
}
export const defsDepose = () => `<defs><clipPath id="depOuv"><polygon points="${ouvertureQuai(I2)}"/></clipPath>
  <pattern id="depGrise" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><rect width="8" height="8" fill="rgba(120,116,108,.30)"/><line x1="0" y1="0" x2="0" y2="8" stroke="rgba(85,80,71,.55)" stroke-width="3"/></pattern></defs>`;

// La couche des cases, AU-DESSUS de tout (le chariot ou une palette portée peuvent cacher une partie d'une case : son
// contour éclairé reste visible et cliquable par-dessus). Chaque case proposée est un bouton : rôle, tabindex, NOM (jamais
// le verdict, aucun attribut ne dit si elle est juste). Les grisées : hachure grise, sans rôle ni tabindex.
export function coucheCases(geo, cases, { proposees = [], grisees = new Set() } = {}) {
  return geo.cases.map((k, i) => {
    const pts = rectSol(k.x0, k.y0, k.x1, k.y1, 0.004), c = cases[i];
    if (proposees.includes(k.id)) {
      return `<g class="dep-case" data-dep-case="${ech(k.id)}" role="button" tabindex="0" aria-label="${ech(c.nom)}">
        <polygon class="dep-case-zone" points="${pts}"/><polygon class="dep-case-halo" points="${pts}"/><polygon class="dep-case-trait" points="${pts}"/></g>`;
    }
    if (grisees.has(k.id)) return `<g class="dep-grisee" data-dep-grisee="${ech(k.id)}" aria-hidden="true"><polygon points="${pts}" fill="url(#depGrise)" stroke="#7d776c" stroke-width="2" stroke-dasharray="5 4"/></g>`;
    return '';
  }).join('');
}
// Une bulle de Kevin, la pointe sur sa tête (la bulle du quai, `bulle`). Les lignes : une phrase par ligne, coupées à 40 signes.
export function couper(texte, max = 40) {
  const L = [];
  String(texte).split(/(?<=[.!?…])\s+/).forEach((ph) => {
    let l = '';
    ph.split(/\s+/).forEach((m) => { if (l && (l + ' ' + m).length > max) { L.push(l); l = m; } else l = l ? `${l} ${m}` : m; });
    if (l) L.push(l);
  });
  return L;
}
// La bulle du quai (`bulle` de `core/iso.js`) ne sait que se poser juste au-dessus de la tête : ici, la boîte remonte
// au-dessus des cases qu'elle couvrirait (sa pointe s'allonge jusqu'à la tête), pour ne JAMAIS cacher une case à choisir.
// Fond papier de la charte (#fdfbf7) au lieu du blanc pur de `bulle`.
let mesureur = null;
function largeurTexte(t) {
  if (mesureur === null) {
    try { const c = document.createElement('canvas').getContext('2d'); c.font = `14px ${POLICE}`; mesureur = c; } catch (x) { mesureur = false; }
  }
  return mesureur ? mesureur.measureText(t).width : String(t).length * 7.4;
}
export function bulleKevin(pos, texte, geo) {
  const [x, y] = I2.P(pos[0], pos[1] + 1.32, 1.58), lignes = couper(texte);
  const pad = 14, lh = 20, r = 12, q = 12;
  const W = Math.ceil(Math.max(...lignes.map(largeurTexte))) + pad * 2, H = lignes.length * lh + pad * 2 - 6;
  const bx = x - 30;
  let by = y - 14 - H;
  const sous = geo.cases.filter((k) => { const xs = [[k.x0, k.y0], [k.x1, k.y0], [k.x1, k.y1], [k.x0, k.y1]].map(([a, b]) => I2.P(a, b, 0)[0]); return Math.max(...xs) > bx && Math.min(...xs) < bx + W; });
  if (sous.length) by = Math.min(by, Math.min(...sous.map((k) => I2.P(k.x0, k.y0, 0)[1])) - 10 - H);
  const d = `M${bx + r},${by} H${bx + W - r} A${r},${r} 0 0 1 ${bx + W},${by + r} V${by + H - r} A${r},${r} 0 0 1 ${bx + W - r},${by + H} H${x + q} L${x},${y} L${x - q * 0.2},${by + H} H${bx + r} A${r},${r} 0 0 1 ${bx},${by + H - r} V${by + r} A${r},${r} 0 0 1 ${bx + r},${by} Z`;
  return `<g data-iso-bulle><path d="${d}" fill="rgba(0,0,0,.18)" transform="translate(2,3)"/><path d="${d}" fill="${PAPIER}" stroke="#2c2c2c" stroke-width="1.5"/>`
    + lignes.map((l, k) => `<text x="${bx + pad}" y="${by + pad + 11 + k * lh}" font-size="14" font-family="${POLICE}" fill="${ENCRE}">${ech(l)}</text>`).join('') + '</g>';
}

/* =============================================================== (4) câblage de la page d'essai */

// Les deux variantes à trancher (brief §6.4 : 6 cases dont 2 + 2 pièges, incohérent avec 4 palettes ; voir la page).
export const VARIANTES = {
  A: { passage: 3, cases: [{ id: 'R1', sol: 'pieton' }, { id: 'R2' }, { id: 'R3' }, { id: 'R4' }, { id: 'R5' }, { id: 'R6', sol: 'autre-quai', legende: 'Quai 3' }] },
  B: { passage: 4, cases: [{ id: 'R1', sol: 'pieton' }, { id: 'R2', sol: 'pieton' }, { id: 'R3' }, { id: 'R4' }, { id: 'R5' }, { id: 'R6' }, { id: 'R7', sol: 'autre-quai', legende: 'Quai 3' }, { id: 'R8', sol: 'autre-quai', legende: 'Quai 3' }] },
};
// Les pièges « non peints » : seules les cases justes sont peintes et numérotées (R1 à R4) ; un piège n'est qu'un endroit
// du sol (l'allée, devant le quai 3), qui ne s'éclaire que pendant le choix. Même place, autre déclaration.
const RANGS = ['première', 'deuxième'];
export function declarationVariante(v, pieges) {
  const D = VARIANTES[v];
  if (pieges !== 'nus') return D;
  let n = 0;
  const compte = { pieton: 0, 'autre-quai': 0 }, total = { pieton: 0, 'autre-quai': 0 };
  D.cases.forEach((c) => { if (c.sol) total[c.sol]++; });
  return { passage: D.passage, cases: D.cases.map((c) => {
    if (!c.sol) return { id: `R${++n}` };
    const k = compte[c.sol]++, plus = total[c.sol] > 1 ? `, ${RANGS[k]} place` : '';
    return c.sol === 'pieton' ? { id: `allee-${k + 1}`, sol: 'pieton', peinte: false, nom: `Allée piétonne${plus}` }
      : { id: `quai3-${k + 1}`, sol: 'autre-quai', legende: c.legende, peinte: false, nom: `Devant le ${minuscule(c.legende)}${plus}` };
  }) };
}
// Le brief §6.4 pris à la lettre : 6 cases, 2 sur l'allée piétonne, 2 devant le quai 3, donc 2 justes pour 4 palettes.
export const BRIEF_A_LA_LETTRE = { passage: 3, cases: [{ id: 'R1', sol: 'pieton' }, { id: 'R2', sol: 'pieton' }, { id: 'R3' }, { id: 'R4' }, { id: 'R5', sol: 'autre-quai', legende: 'Quai 3' }, { id: 'R6', sol: 'autre-quai', legende: 'Quai 3' }] };
export const ID_QUAI = 'action-decharger';
const TEXTE_FIN = 'Les 4 palettes sont en zone de réception. Le contrôle, c’est la prochaine fois.';

export function monterDepose(racine) {
  const $ = (s) => racine.querySelector(s);
  const ecran = $('[data-dep-ecran]'), cadre = $('[data-dep-sait]');
  const reduitSysteme = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduitSysteme) $('[name="calme"]').checked = true;
  const ORDRE = PALETTES.map((p) => p.id).reverse();   // sortie dans l'ordre inverse du chargement : P4, P3, P2, P1
  let S = null;

  const reglages = () => ({
    variante: $('[name="variante"]:checked').value,
    copie: $('[name="mode"]:checked').value === 'copie',
    attente: $('[name="attente"]:checked').value,
    grise: $('[name="grise"]:checked').value,
    calme: $('[name="calme"]').checked,
    pieges: $('[name="pieges"]:checked').value,
  });

  function demarrer() {
    if (S && S.raf) cancelAnimationFrame(S.raf);
    const R = reglages(), D = declarationVariante(R.variante, R.pieges), cases = normaliserCases(D), geo = geometrieDepose(cases, D.passage);
    S = { R, D, cases, geo, etat: etatDeposeNeuf(), phase: 'anim', anim: null, raf: null, geste: null, focusApres: null, journal: [],
      decor: decorDepose(cases, geo), cadre: cadreDepose(geo),
      vis: { pos: [geo.xPorte, ycAttente(geo, R.attente), 0], portee: null, posees: {}, camion: ORDRE.slice(), retard: 0 } };
    ecran.classList.toggle('dep-calme', R.calme);
    construireEcran();
    jouer([chercher(ORDRE[0])], () => entrerChoix());
  }

  // Un geste animé = un trajet et ce qu'il change dans l'image à ses instants nommés.
  const chercher = (id) => ({ tr: trajetChercher(S.geo, S.R.attente), leve: () => { S.vis.camion = S.vis.camion.filter((x) => x !== id); S.vis.portee = id; S.vis.retard = 1; }, id, quoi: 'chercher' });
  const poser = (id, cid) => ({ tr: trajetPoser(S.geo, S.geo.cases.find((k) => k.id === cid), S.R.attente), pose: () => { S.vis.posees[id] = cid; S.vis.portee = null; }, id, cid, quoi: 'poser' });

  function jouer(gestes, ensuite) {
    S.phase = 'anim';
    let t0 = 0;
    const chaine = gestes.map((g) => { const c = Object.assign({ t0 }, g); t0 += g.tr.duree; return c; });
    S.anim = { chaine, duree: t0, ensuite, fait: new Set(), debut: null };
    majCases(); majTextes();
    if (S.R.calme) { finirAnim(); return; }
    const boucle = (now) => {
      if (!S.anim) return;
      if (S.anim.debut === null) S.anim.debut = now;
      const t = now - S.anim.debut;
      if (t >= S.anim.duree) { finirAnim(); return; }
      appliquer(t); dessinerIso(); majTextes(t);
      S.raf = requestAnimationFrame(boucle);
    };
    S.raf = requestAnimationFrame(boucle);
  }
  // L'image à l'instant t de la chaîne : les instants passés sont appliqués une fois, le chariot interpolé.
  function appliquer(t) {
    const A = S.anim;
    for (const g of A.chaine) {
      const tl = t - g.t0, M = g.tr.marques;
      if (g.leve && tl >= M.leve && !A.fait.has(g)) { A.fait.add(g); g.leve(); }
      if (g.pose && tl >= M.pose && !A.fait.has(g)) { A.fait.add(g); g.pose(); }
      if (g.leve && A.fait.has(g)) S.vis.retard = 1 - Math.min(1, Math.max(0, (tl - M.sortie - 700) / 800));
    }
    const g = A.chaine.find((x) => t < x.t0 + x.tr.duree) || A.chaine[A.chaine.length - 1];
    S.vis.pos = positionSur(g.tr.legs, t - g.t0, g.tr.legs.length ? g.tr.legs[0].a : S.vis.pos);
  }
  function finirAnim() {
    if (!S.anim) return;
    cancelAnimationFrame(S.raf); S.raf = null;
    const A = S.anim;
    A.chaine.forEach((g) => { if (!A.fait.has(g)) { A.fait.add(g); if (g.leve) g.leve(); if (g.pose) g.pose(); } });
    S.vis.retard = 0;
    const der = A.chaine[A.chaine.length - 1];
    S.vis.pos = der.tr.arrivee.slice();
    S.anim = null;
    A.ensuite();
  }

  function entrerChoix() {
    const p = paletteEnAttente(S.etat, ORDRE);
    if (!p) { S.phase = 'fin'; S.geste = S.geste || new Date().toLocaleTimeString('fr-FR'); toutRedessiner(); annoncer(TEXTE_FIN); return; }
    S.phase = 'choix';
    toutRedessiner();
    const pal = PALETTES.find((x) => x.id === p), rang = ORDRE.indexOf(p) + 1;
    annoncer(`${rang === 1 ? `Kevin : « ${PREMIERE_BULLE} » ` : ''}Kevin attend avec la palette ${p}, ${minuscule(pal.nom)} (${rang} sur ${ORDRE.length}). Choisis la case où il la pose.`);
    focaliser();
  }

  function cliquer(cid) {
    if (S.phase !== 'choix') return;
    const p = paletteEnAttente(S.etat, ORDRE), opts = { copie: S.R.copie, grise: S.R.grise };
    const n = choisirCase(S.etat, S.cases, p, cid, opts);
    if (n === S.etat) return;
    S.etat = n;
    const is = issueDernierChoix(S.etat, S.cases, p);
    S.journal.push(`${p} → ${cid} : ${is.issue === 'pose' ? 'posée' : 'refusée par Kevin'}`);
    if (is.issue === 'refus') {
      S.focusApres = cid;
      toutRedessiner();
      annoncer(`Kevin : « ${is.reaction} » Choisis une autre case.`);
      focaliser();
      return;
    }
    S.focusApres = cid;
    const suite = paletteEnAttente(S.etat, ORDRE);
    jouer(suite ? [poser(p, cid), chercher(suite)] : [poser(p, cid)], () => entrerChoix());
  }

  // Le focus clavier : après un redessin, sur la case suivante encore proposée (jamais au clic de souris).
  function focaliser() {
    if (!auClavier()) return;
    const L = Array.from(ecran.querySelectorAll('[data-dep-case]'));
    if (!L.length) return;
    const ids = S.geo.cases.map((k) => k.id), dep = S.focusApres ? ids.indexOf(S.focusApres) : -1;
    const suivant = L.find((el) => ids.indexOf(el.dataset.depCase) > dep) || L[0];
    suivant.focus();
  }

  /* ------- l'écran élève (maquette de la vue) */
  function construireEcran() {
    const [vx, vy, vw, vh] = S.cadre;
    ecran.innerHTML = `
      <header class="dep-bandeau"><b>Quai 2</b><span>Centre de distribution Action — réception (Geodis)</span><span class="dep-maquette">maquette</span>
        <button type="button" class="dep-quitter" data-dep-quitter hidden>Quitter le plein écran</button></header>
      <ol class="dep-stepper" aria-label="Étapes du quai"><li class="fait">① Arrivée du camion</li><li class="ici" aria-current="step">② Déchargement</li></ol>
      <p class="dep-consigne">Kevin sort les palettes une à une. Pour chacune, <b>clique la case de la zone de réception</b> où il doit la poser.</p>
      <div class="quai-scene2 quai-iso dep-scene">
        <svg data-dep-svg viewBox="${vx} ${vy} ${vw} ${vh}" role="group" aria-label="Le quai 2 vu de l’intérieur : le camion à quai, Kevin au chariot, la zone de réception et ses cases">
          ${defsDepose()}<g data-dep-iso aria-hidden="true"></g><g data-dep-cases></g><g data-dep-bulle aria-hidden="true"></g>
        </svg>
        <div class="quai-legende" data-dep-leg></div>
      </div>
      <div class="quai-barre2 dep-barre">
        <div class="quai-compteur2">Palettes en zone de réception : <b data-dep-nb></b><span class="quai-pastilles2" data-dep-past></span></div>
        <button type="button" class="btn" data-dep-passer hidden>⏩ Passer l'animation</button>
      </div>
      <p class="quai-fin-decharge" role="status" data-dep-fin hidden></p>
      <p class="dep-sr" aria-live="polite" data-dep-annonce></p>`;
    const svg = $('[data-dep-svg]');
    svg.addEventListener('click', (ev) => { const g = ev.target.closest('[data-dep-case]'); if (g) cliquer(g.dataset.depCase); });
    svg.addEventListener('keydown', (ev) => {
      const g = ev.target.closest('[data-dep-case]');
      if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); cliquer(g.dataset.depCase); }
    });
    $('[data-dep-passer]').addEventListener('click', () => finirAnim());
    $('[data-dep-quitter]').addEventListener('click', () => pleinEcran(false));
    $('[data-dep-quitter]').hidden = !document.body.classList.contains('dep-plein');
    dessinerIso(); majCases(); majTextes();
  }
  const dessinerIso = () => { $('[data-dep-iso]').innerHTML = imageDepose(S.vis, S.geo, S.decor, PALETTES); };
  function majCases() {
    const p = S.phase === 'choix' ? paletteEnAttente(S.etat, ORDRE) : null, opts = { copie: S.R.copie, grise: S.R.grise };
    const proposees = p ? casesProposees(S.etat, S.cases, p, opts) : [];
    const grisees = p ? casesGrisees(S.etat, S.cases, p, opts) : (S.R.grise === 'garde' ? casesGrisees(S.etat, S.cases, null, opts) : new Set());
    $('[data-dep-cases]').innerHTML = coucheCases(S.geo, S.cases, { proposees, grisees });
    // La bulle : la réaction au dernier clic faux (guidage), sinon la première consigne de Kevin avant la première palette.
    let texte = '';
    if (p) {
      const is = issueDernierChoix(S.etat, S.cases, p);
      if (is && is.issue === 'refus') texte = is.reaction;
      else if (p === ORDRE[0] && !(S.etat.depose[p] && S.etat.depose[p].essais.length)) texte = PREMIERE_BULLE;
    }
    $('[data-dep-bulle]').innerHTML = texte ? bulleKevin(S.vis.pos, texte, S.geo) : '';
  }
  function majTextes(t) {
    const nb = Object.keys(S.vis.posees).length, N = ORDRE.length;
    let leg = '';
    if (S.phase === 'fin') leg = `Les ${N} palettes sont en zone de réception.`;
    else if (S.phase === 'choix') {
      const p = paletteEnAttente(S.etat, ORDRE), pal = PALETTES.find((x) => x.id === p);
      leg = `Kevin attend avec la palette ${p} — ${minuscule(pal.nom)} (${ORDRE.indexOf(p) + 1} sur ${N}). Où la pose-t-il ?`;
    } else if (S.anim) {
      const tt = t || 0, g = S.anim.chaine.find((x) => tt < x.t0 + x.tr.duree) || S.anim.chaine[0];
      leg = g.quoi === 'poser' ? `Kevin pose la palette ${g.id} en ${g.cid}.` : `Kevin sort la palette ${g.id} du camion (${ORDRE.indexOf(g.id) + 1} sur ${N}).`;
    }
    $('[data-dep-leg]').textContent = leg;
    $('[data-dep-nb]').textContent = `${nb} / ${N}`;
    $('[data-dep-past]').innerHTML = PALETTES.map((p) => `<i class="${S.vis.posees[p.id] ? 'sur' : ''}">${ech(p.id)}</i>`).join('');
    $('[data-dep-passer]').hidden = S.phase !== 'anim';
    const fin = $('[data-dep-fin]');
    fin.hidden = S.phase !== 'fin';
    fin.textContent = S.phase === 'fin' ? TEXTE_FIN : '';
  }
  function toutRedessiner() { dessinerIso(); majCases(); majTextes(); majCadre(); }
  function annoncer(t) { const a = $('[data-dep-annonce]'); a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); }

  /* ------- le cadre « ce que la vue sait » (pour Tristan, jamais pour l'élève) */
  function majCadre() {
    const J = jalonsDepose(S.etat, S.cases, PALETTES.map((p) => p.id));
    const ligne = (id) => {
      const d = S.etat.depose[id], j = J.find((x) => x.palette === id), c = d && d.premier ? S.cases.find((k) => k.id === d.premier) : null;
      return `<tr><td>${id}</td><td>${d ? ech(d.premier) : '—'}${c ? (c.juste ? ' (juste)' : ' (piège)') : ''}</td><td>${d ? ech(d.essais.join(', ')) : '—'}</td><td>${d && d.pose ? ech(d.pose) : '—'}</td><td>${j.ok ? '✓' : '✗'}</td></tr>`;
    };
    const ecarts = verifierDepose(S.D, PALETTES.length), lettre = verifierDepose(BRIEF_A_LA_LETTRE, PALETTES.length);
    const H = S.geo.cases.flatMap((k) => heurtsPose(S.geo, k));
    cadre.innerHTML = `
      <div class="dep-defile"><table class="dep-table"><caption>État <code>depose</code> (ordre de sortie : ${ORDRE.join(', ')})</caption>
        <thead><tr><th>Palette</th><th>Premier choix</th><th>Essais</th><th>Posée en</th><th>Jalon</th></tr></thead>
        <tbody>${ORDRE.map(ligne).join('')}</tbody></table></div>
      <p><b>Jalons</b> (<code>jalonsDepose</code>, ordre du camion) : ${J.map((j) => `${j.palette} ${j.ok ? '✓' : '✗'}`).join(' · ')}
        ${deposeFinie(S.etat, ORDRE) ? '' : '<br><small>Tous ✗ tant que la dernière palette n’est pas posée (brief §5 : rien n’est vrai avant la fin du déchargement).</small>'}</p>
      <p><b>Geste de fin</b> <code>quai:${ID_QUAI}:dechargement</code> : ${S.geste ? `publié (${S.geste})` : 'pas encore'}</p>
      <p><b>Contrôle du contenu</b> (<code>verifierDepose</code>, variante ${S.R.variante}) : ${ecarts.length ? ecarts.map(ech).join(' ; ') : 'aucun écart'}.
        Collisions du chariot (toutes les cases, les deux points d’attente) : ${H.length ? ech(H.join(' ; ')) : 'aucune'}.</p>
      <p><b>Le brief §6.4 à la lettre</b> (6 cases : 2 allée piétonne, 2 quai 3, donc 2 justes) serait refusé : ${lettre.map(ech).join(' ; ')}.</p>
      <details><summary>Journal des clics</summary><p>${S.journal.length ? S.journal.map(ech).join('<br>') : 'aucun clic'}</p></details>
      <details><summary>Déclaration du contenu (variante ${S.R.variante})</summary><pre>${ech(JSON.stringify({ depose: S.D }, null, 1))}</pre></details>
      <details><summary>État rangé (JSON)</summary><pre data-dep-json>${ech(JSON.stringify(S.etat))}</pre></details>`;
  }

  /* ------- plein écran (gabarit 1366 × 768) */
  function pleinEcran(oui) {
    document.body.classList.toggle('dep-plein', oui);
    const q = $('[data-dep-quitter]'); if (q) q.hidden = !oui;
    if (oui) { const l = ecran.querySelector('[data-dep-case]'); if (l && auClavier()) l.focus(); }
  }
  racine.querySelector('[data-dep-plein]').addEventListener('click', () => pleinEcran(true));
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && document.body.classList.contains('dep-plein')) pleinEcran(false); });
  racine.querySelector('[data-dep-reglages]').addEventListener('change', demarrer);
  racine.querySelector('[data-dep-rejouer]').addEventListener('click', demarrer);
  demarrer();
  // Pour l'essai automatique (Playwright) : lire l'état sans passer par le texte du cadre.
  return { etat: () => S.etat, phase: () => S.phase, reglages: () => S.R, finir: () => finirAnim() };
}
