// Vue « Plan d'entrepôt », mode STOCKAGE DE MASSE — ranger des palettes au sol, gerbées, dans des couloirs
// qu'un chariot frontal remplit et vide par l'allée.
//
// Écrit le 11/10/2026 (chantier D-5, demande au moteur du brief `docs/briefs/ENT-6.5-france-boissons-rangement.md`
// §7.1), d'après la maquette validée par Tristan (`docs/briefs/france-boissons/maquette-6.5-stockage-masse.html`,
// « beaucoup mieux en 3D iso ») : mêmes gestes, mêmes textes. Le code de la maquette était jetable ; ici le plan est
// DÉCLARÉ par la séance et dessiné par le kit `core/iso.js` (le même que l'animation du FIFO, pour qu'on retrouve
// dans la vue les panneaux et les flèches de l'animation). Rien de France Boissons ici.
//
// Troisième mode de la vue (`entrepot.js` l'importe, comme la visite) : rien du plan à racks n'y sert (ni travée, ni
// niveau de lisse, ni adresse `A1-T01-N1-E1`). Une place se dit « couloir M02, position 1, niveau 1 » ; position 1 =
// le FOND (contre le mur), la dernière = DEVANT (côté allée) ; niveau 1 = au sol.
//
// CE QUE LE MOTEUR EMPÊCHE (geste physique impossible, jamais une règle) : poser derrière une pile (le chariot ne
// passe pas), poser sur une pile déjà à `portee` niveaux (hors de portée), reprendre une palette qui n'est pas au
// sommet ou devant laquelle il y a une pile. Tout le reste est ACCEPTÉ et jugé à la validation.
//
// Une déclaration (exemple complet : `contenus/entrepot-masse-essai.js`) :
//
//   entrepot: {
//     id, libelle, mode: 'masse',
//     personnage: { nom, role, date, texte: { guidage, entrainement, evaluation } },   // une ligne en haut
//     consigne: 'Prends une palette (clique sa carte), puis clique un couloir sur le plan.',
//     plan: {
//       couloirs: [{ id: 'M01', places: 4 }, …, { id: 'M08', places: 4, reserve: 'vides' }],   // de gauche à droite
//       reception: 'Zone de réception',                       // où attendent les palettes à ranger
//       litiges: { titre: 'Zone litiges', ligne?, futs: 1 },   // décor (facultatif) : le fût qui fuit, sur sa palette
//       quais: ['QUAI 10', …],                                // décor (facultatif)
//     },
//     references: { HEI30: { nom: 'Heineken fût 30 L', court: 'Heineken 30 L', format: '30 L' }, …,
//                   VIDES: { nom: 'Fûts vides', court: 'VIDES', vides: true } },
//     hauteurs: { '30 L': 2, '20 L': 3 },     // hauteur de gerbage autorisée, en palettes, par format
//     portee: 4,                              // le nombre de niveaux qu'atteint le chariot (4 par défaut)
//     lots: { S20: { couleur: 'jaune' }, S24: { couleur: 'bleu' } },   // couleurs du kit (LOTS_KIT)
//     stock: { M01: [[{ ref: 'HEI30', lot: 'S20' }, { ref: 'HEI30', lot: 'S20' }]], M08: [[…], [{ ref: 'VIDES', futs: 6 }]] },
//         // par couloir : les piles du FOND vers l'avant, chaque pile du bas vers le haut ; `futs` : 8 par défaut
//     palettes: [{ id: 'P1', ref: 'HEI30', lot: 'S24', futs: 8, kg: 350, reception: 'conforme' }, …],
//     criteres: [{ type: 'zoneReservee' }, { type: 'uneReference' }, { type: 'unSeulLot' }, { type: 'hauteurGerbage' },
//                { type: 'parLeFond' }],      // `nom` pour renommer (le nom est tout ce que voit l'élève)
//     regles: { titre?, lignes: [html…], encadre? },    // « Les règles ▾ » (guidage, entraînement)
//     jalons: [{ id, lib, palette: 'P1' }, …],          // défaut : un jalon par palette
//     note: { sur: 20 },
//   }
//
// L'état, dans la base de l'élève (`db.entrepots[<id>]`, cloisonné par séance) :
//   { pos: { P1: { c: 'M02', p: 1 } }, ordre: ['P1', …] (l'ordre où il a posé), valide, at, premierGeste, verifs }
// Le niveau ne se range pas : il se déduit de l'ordre de pose (une palette ne se pose qu'au sommet d'une pile).
// La palette en main et le couloir ouvert ne sont pas gardés (un rechargement revient au plan).
//
// QUAND UNE PALETTE EST-ELLE BIEN RANGÉE ? Aucun critère faux, chacun jugé contre ce qui était DANS LE COULOIR QUAND
// L'ÉLÈVE L'A POSÉE (le stock de départ et ses palettes posées avant elle) : c'est le geste qui casse la règle qui est
// faux, pas la palette qui était là avant. « Couloir réservé » passe en premier et arrête les autres (une faute à la
// fois sur ce geste-là). Rien n'est jugé avant « Valider mon rangement » (qui FIGE le rangement) ; après, le bilan
// nomme le critère seulement, jamais la bonne place (règle « que, pas de combien »). Évaluation : rien avant la copie.
//
// POUR LA FICHE QUI SUIT (ENT-6.5, jalons 7 à 10) : `placeMasse(db, P, 'P1')` (exporté par `entrepot.js`) rend la
// place où l'élève a posé la palette, juste ou fausse : la fiche est comparée à SON rangement (pas de double peine).

import { ech } from '../texte.js';
import { projection, DEFS, compilerScene, dessinerDecor, dessinerCharge, etiquetteCharge, cadreEtiquette, HAUT_NIVEAU, FUTS_PALETTE, LOTS_KIT } from '../iso.js';

/* ================================================================== critères */
const CRITERES = {
  zoneReservee: 'couloir réservé',
  uneReference: 'une seule référence',
  unSeulLot: 'un seul lot par couloir',
  hauteurGerbage: 'hauteur de gerbage',
  parLeFond: 'par le fond',
};
export const TYPES_CRITERES_MASSE = Object.keys(CRITERES);
const RESERVES = ['vides'];

/* ================================================================ compilation */
export function compilerMasse(P, err) {
  const L = P.plan || err('il manque le plan');
  const couloirs = (L.couloirs || []).map((c, k) => {
    if (!c || !c.id) err(`couloir n° ${k + 1} : il manque l'id`);
    const n = c.places | 0;
    if (n < 1 || n > 6) err(`couloir ${c.id} : \`places\` va de 1 à 6`);
    if (c.reserve != null && !RESERVES.includes(c.reserve)) err(`couloir ${c.id} : réserve inconnue « ${c.reserve} » (réserves : ${RESERVES.join(', ')})`);
    return { id: c.id, n, k, reserve: c.reserve || null };
  });
  if (!couloirs.length) err('aucun couloir (plan.couloirs)');
  const C = {};
  couloirs.forEach((c) => { if (C[c.id]) err(`couloir ${c.id} déclaré deux fois`); C[c.id] = c; });
  const refs = P.references || err('il manque les références');
  const hauteurs = P.hauteurs || {};
  Object.entries(refs).forEach(([k, r]) => {
    if (!r || !r.nom) err(`référence ${k} : il manque le nom`);
    if (r.vides) return;
    if (!r.format) err(`référence ${k} : il manque le format (« 30 L »)`);
    if (!(hauteurs[r.format] >= 1)) err(`référence ${k} : pas de hauteur de gerbage pour le format « ${r.format} » (hauteurs)`);
  });
  const portee = P.portee == null ? 4 : P.portee | 0;
  if (portee < 1 || portee > 5) err('`portee` va de 1 à 5 niveaux');
  const lots = {};
  Object.entries(P.lots || {}).forEach(([id, l]) => {
    if (!LOTS_KIT[l && l.couleur]) err(`lot ${id} : couleur inconnue « ${l && l.couleur} » (couleurs du kit : ${Object.keys(LOTS_KIT).join(', ')})`);
    lots[id] = l.couleur;
  });
  const charge = (x, ou) => {
    if (!x || !refs[x.ref]) err(`${ou} : référence inconnue (${x && x.ref})`);
    if (!refs[x.ref].vides && !lots[x.lot]) err(`${ou} : lot inconnu « ${x.lot} » (lots)`);
    if (x.futs != null && !(Number.isInteger(x.futs) && x.futs >= 0 && x.futs <= FUTS_PALETTE)) err(`${ou} : \`futs\` va de 0 à ${FUTS_PALETTE}`);
  };
  const stock = {};
  couloirs.forEach((c) => { stock[c.id] = Array.from({ length: c.n }, () => []); });
  Object.entries(P.stock || {}).forEach(([cid, piles]) => {
    if (!C[cid]) err(`stock dans un couloir inconnu : ${cid}`);
    if (!Array.isArray(piles) || piles.length > C[cid].n) err(`stock de ${cid} : au plus ${C[cid].n} piles (une par position)`);
    piles.forEach((pile, i) => {
      if (!Array.isArray(pile)) err(`stock de ${cid}, position ${i + 1} : une pile est une liste (du bas vers le haut)`);
      if (pile.length > portee) err(`stock de ${cid}, position ${i + 1} : plus haut que la portée du chariot (${portee})`);
      pile.forEach((x, n) => charge(x, `stock de ${cid}, position ${i + 1}, niveau ${n + 1}`));
      stock[cid][i] = pile.map((x) => ({ stock: true, ref: x.ref, lot: x.lot || null, futs: x.futs == null ? FUTS_PALETTE : x.futs }));
    });
  });
  const pal = {};
  (P.palettes || []).forEach((p) => {
    if (!p || !p.id) err('une palette sans id');
    if (pal[p.id]) err(`palette ${p.id} déclarée deux fois`);
    charge(p, `palette ${p.id}`);
    pal[p.id] = Object.assign({ futs: FUTS_PALETTE }, p);
  });
  if (!Object.keys(pal).length) err('aucune palette à ranger');
  const crit = (P.criteres || []).map((c) => {
    if (!CRITERES[c.type]) err(`critère de type inconnu : ${c.type} (types : ${TYPES_CRITERES_MASSE.join(', ')})`);
    return Object.assign({ id: c.type, nom: CRITERES[c.type] }, c);
  });
  const nomCourt = (ref) => refs[ref].court || refs[ref].nom;
  const jalons = P.jalons || Object.values(pal).map((p) => ({ id: `palette-${p.id}`, palette: p.id, lib: `${p.id} bien rangée (${nomCourt(p.ref)})` }));
  jalons.forEach((j) => { if (!pal[j.palette]) err(`jalon ${j.id} : palette inconnue (${j.palette})`); });
  return { P, mode: 'masse', couloirs, C, refs, hauteurs, portee, lots, stock, pal, crit, jalons, nomCourt,
    nMax: Math.max(...couloirs.map((c) => c.n)) };
}

/* ======================================================== l'état et ses piles */
export const etatMasseNeuf = () => ({ pos: {}, ordre: [], valide: false, at: null, premierGeste: null, verifs: 0 });

// Les piles d'un couloir : le stock de départ, puis les palettes de l'élève dans l'ordre où il les a posées.
function piles(M, e, cid) {
  const L = M.stock[cid].map((pile) => pile.slice());
  (e.ordre || []).forEach((id) => {
    const o = (e.pos || {})[id], p = M.pal[id];
    if (o && p && o.c === cid && L[o.p - 1]) L[o.p - 1].push({ id, ref: p.ref, lot: p.lot, futs: p.futs });
  });
  return L;
}
// La position la plus en avant qui porte une pile (0 : couloir vide).
const devant = (L) => L.reduce((f, pl, i) => (pl.length ? i + 1 : f), 0);

// Où le chariot peut poser dans ce couloir : sur la pile de devant (si elle n'est pas à sa portée maximale), ou au
// sol à n'importe quelle position libre devant elle. Jamais derrière une pile.
export function placesPossibles(M, e, cid) {
  const L = piles(M, e, cid), f = devant(L), R = [];
  if (f && L[f - 1].length < M.portee) R.push({ p: f, n: L[f - 1].length + 1 });
  for (let p = f + 1; p <= L.length; p++) R.push({ p, n: 1 });
  return R;
}
function niveauDe(M, e, id) {
  const o = (e.pos || {})[id];
  if (!o) return null;
  return piles(M, e, o.c)[o.p - 1].findIndex((x) => x.id === id) + 1;
}
// Reprendre : la palette est au sommet de sa pile, et aucune pile devant elle.
function reprenable(M, e, id) {
  const o = e.pos[id], L = piles(M, e, o.c), pl = L[o.p - 1];
  return pl[pl.length - 1].id === id && L.slice(o.p).every((x) => !x.length);
}
// La place d'une palette, pour la fiche qui suit et le détail de la note.
export function placeDe(M, e, id) {
  const o = (e.pos || {})[id];
  return o ? { couloir: o.c, position: o.p, niveau: niveauDe(M, e, id) } : null;
}
const texteDePlace = (pl) => (pl ? `${pl.couloir} · position ${pl.position} · niveau ${pl.niveau}` : null);

/* ================================================================ le jugement */
// Les critères faux d'une palette posée (liste vide = bien rangée ; null = pas posée).
export function fautesMasse(M, e, id) {
  const o = (e.pos || {})[id];
  if (!o) return null;
  const p = M.pal[id], r = M.refs[p.ref], c = M.C[o.c];
  const L = piles(M, e, o.c), rang = e.ordre.indexOf(id);
  const avant = L.flat().filter((x) => x.stock || (x.id !== id && e.ordre.indexOf(x.id) < rang));
  const niv = L[o.p - 1].findIndex((x) => x.id === id) + 1;
  const F = [];
  for (const k of M.crit) {
    if (k.type === 'zoneReservee') {
      if ((c.reserve === 'vides') !== !!r.vides) return [k];
    } else if (k.type === 'uneReference') {
      if (avant.some((x) => x.ref !== p.ref)) F.push(k);
    } else if (k.type === 'unSeulLot') {
      if (avant.some((x) => !M.refs[x.ref].vides && x.lot !== p.lot)) F.push(k);
    } else if (k.type === 'hauteurGerbage') {
      if (!r.vides && niv > M.hauteurs[r.format]) F.push(k);
    } else if (k.type === 'parLeFond') {
      if (L.slice(0, o.p - 1).some((x) => !x.length)) F.push(k);
    }
  }
  return F;
}

// Les jalons : rien n'est jugé avant la validation (le rangement figé) ; après, juste ou faux (`etat: 'ko'`).
export function jalonsMasse(M, e) {
  return M.jalons.map((j) => {
    const F = fautesMasse(M, e, j.palette);
    const ok = !!e.valide && !!F && !F.length;
    return { id: j.id, lib: j.lib, palette: j.palette, ok, etat: e.valide ? (ok ? 'ok' : 'ko') : undefined,
      criteres: F ? F.map((k) => k.nom) : null, place: texteDePlace(placeDe(M, e, j.palette)) };
  });
}

// Toutes les bonnes places d'une palette, sur le stock de départ seul (page d'essai, enseignant, tests). JAMAIS
// montrées à l'élève.
export function solutionsMasse(M) {
  return Object.fromEntries(Object.keys(M.pal).map((id) => [id, M.couloirs.flatMap((c) => placesPossibles(M, etatMasseNeuf(), c.id)
    .filter(({ p }) => { const e = { pos: { [id]: { c: c.id, p } }, ordre: [id] }; return !fautesMasse(M, e, id).length; })
    .map(({ p, n }) => `${c.id} · position ${p} · niveau ${n}`))]));
}

/* ================================================================ la géométrie */
// Le plan d'ensemble, en places de palette : couloir k à x = k × PAS, position p à y = p − 1 (le fond contre le mur,
// en y = −0,5). À droite des couloirs : zone litiges, puis zone de réception (les palettes à ranger). Devant : l'allée,
// puis les quais.
const PAS = 1.3;
// Le mur du fond, plus haut que celui de l'animation : les panneaux des couloirs passent au-dessus des piles et de leurs
// étiquettes (maquette). En places de palette.
const MUR = 2.9, PANNEAU = [2.3, 2.75];
function geometrie(M) {
  const N = M.nMax, K = M.couloirs.length;
  const xR = (K - 1) * PAS + 1.6, xFin = xR + 3.9;
  // La réception au fond (les étiquettes de ses palettes montent devant le mur, sans rien cacher), deux palettes par
  // rang, les rangs décalés pour que les étiquettes ne se recouvrent pas ; la zone litiges devant, côté allée.
  const nPal = Object.keys(M.pal).length, rangs = Math.ceil(nPal / 2);
  const yR1 = -.1 + (rangs - 1) * 1.4 + 1.6;    // une bande libre devant le dernier rang : le titre de la zone
  return { N, xR, xFin, yAllee: N + .25, yQuai: N + 2.05,
    reception: { de: [xR, -.4], a: [xR + 3.6, yR1] },
    litiges: { de: [xR, yR1 + .15], a: [xR + 3.6, Math.max(yR1 + 1.1, N + .2)] },
    placeRecep: (i) => [xR + .25 + (i % 2) * 2.3, -.15 + Math.floor(i / 2) * 1.4] };
}

/* ======================================================================= vue */
// `h` : ce que prête `entrepot.js` (Échap, focus au clavier). `opts.copie` : l'évaluation.
export function creerMasse(P, M, opts, h) {
  const G = geometrie(M);
  const ui = { main: null, ouvert: null, msg: '', msgType: '', confirmer: false, regles: false, tombe: null, vu: false, focus: null };
  const tempsDe = (api) => (opts.copie ? 'evaluation' : P.temps || (api && api.temps) || 'guidage');
  function regime(api, e) {
    const t = tempsDe(api), rendue = !!(api && api.copieRendue && api.copieRendue());
    return { t, eval: t === 'evaluation', rendue, fige: !!e.valide || (t === 'evaluation' && rendue), regles: t !== 'evaluation' };
  }
  const nomPal = (p) => M.refs[p.ref].nom;
  const toutesPosees = (e) => Object.keys(M.pal).every((id) => e.pos[id]);

  /* ----------------------------------------------------------- les gestes */
  function dire(t, type) { ui.msg = t; ui.msgType = type || ''; }
  function noterGeste(e) { if (!e.premierGeste) e.premierGeste = Date.now(); }
  function prendre(e, id) {
    if (!M.pal[id]) return;
    if (e.pos[id]) {
      if (!reprenable(M, e, id)) { dire('Impossible de la reprendre : une autre palette la bloque.', 'non'); return; }
      delete e.pos[id];
      e.ordre = e.ordre.filter((x) => x !== id);
    } else if (ui.main === id) { ui.main = null; dire(''); return; }
    ui.main = id; ui.confirmer = false; dire('');
    noterGeste(e);
  }
  // Poser la palette en main à la position `p` du couloir `cid` (au sommet de la pile qui s'y trouve).
  function poser(e, cid, p) {
    if (!ui.main) { dire("Prends d'abord une palette : clique sa carte.", 'non'); return false; }
    const L = placesPossibles(M, e, cid), ici = L.find((x) => x.p === p);
    if (!ici) {
      const f = devant(piles(M, e, cid));
      dire(p < f ? 'Impossible : une pile est devant, le chariot ne passe pas.' : 'Impossible : cette pile est hors de portée du chariot.', 'non');
      return false;
    }
    const id = ui.main;
    e.pos[id] = { c: cid, p };
    e.ordre = e.ordre.filter((x) => x !== id).concat(id);
    ui.main = null; ui.tombe = id;
    dire(`<b>${ech(id)}</b> posée en ${ech(cid)}, position ${p}, niveau ${ici.n}.`, 'oui');
    noterGeste(e);
    return true;
  }

  /* ----------------------------------------------------------- le dessin */
  const I0 = projection({ unite: 40, origine: [0, 0] });
  const etiquette = (x) => {
    const top = x[x.length - 1];
    if (M.refs[top.ref].vides) return { lot: '_vides', texte: M.nomCourt(top.ref) };
    return { lot: top.lot, texte: top.id ? `${top.id} · ${top.lot}` : `lot ${top.lot}` };
  };
  // L'étiquette du sommet d'une pile (à poser après les boîtes de place du couloir ouvert).
  const etiquettePile = (I, sc, x, y, L) => {
    if (!L.length) return '';
    const et = etiquette(L), top = L[L.length - 1];
    return etiquetteCharge(I, { x, y, z: (L.length - 1) * HAUT_NIVEAU, lot: et.lot, texte: et.texte }, sc, { sel: !!top.id });
  };
  // Les étiquettes du plan d'ensemble, posées en dernier : une pile haute dans un couloir voisin recouvrirait celle d'une
  // pile basse (P2 sur la pile de M03 à côté de P1 en M02). De la plus basse à l'écran à la plus haute, chacune garde sa
  // place si elle est libre, sinon elle monte d'un cran jusqu'à l'être ; un trait la relie à sa pile.
  function etiquettesPlan(I, sc, T) {
    const L = T.filter((t) => t.L.length).map((t) => {
      const et = etiquette(t.L), p = { x: t.x, y: t.y, z: (t.L.length - 1) * HAUT_NIVEAU, lot: et.lot, texte: et.texte };
      return { p, sel: !!t.L[t.L.length - 1].id, r: cadreEtiquette(I, p, et.texte) };
    }).sort((a, b) => b.r.y - a.r.y);
    const poses = [], touche = (a, b) => a.x < b.x + b.w + 2 && b.x < a.x + a.w + 2 && a.y < b.y + b.h + 2 && b.y < a.y + a.h + 2;
    return L.map((it) => {
      let dy = 0;
      while (poses.some((q) => touche(Object.assign({}, it.r, { y: it.r.y - dy }), q)) && dy < 200) dy += 6;
      poses.push(Object.assign({}, it.r, { y: it.r.y - dy }));
      return etiquetteCharge(I, it.p, sc, { sel: it.sel, dy });
    }).join('');
  }
  // La scène du kit : les couloirs déclarés, les couleurs de lot, plus le gris des vides.
  const lotsScene = () => Object.assign({ _vides: { couleur: 'gris' } }, Object.fromEntries(Object.entries(M.lots).map(([k, c]) => [k, { couleur: c }])));
  // Une pile : ses palettes de bas en haut, l'étiquette sur celle du sommet. La palette qui vient d'être posée tombe ;
  // au premier dessin, les palettes apparaissent l'une après l'autre (`k` : le rang d'apparition).
  // `sansEtiquette` : l'étiquette du sommet est posée plus tard (`etiquettePile`).
  function pile(I, sc, x, y, L, k0, sansEtiquette) {
    let s = '';
    L.forEach((it, n) => {
      const haut = n === L.length - 1, et = haut ? etiquette(L) : null;
      const c = dessinerCharge(I, { x, y, z: n * HAUT_NIVEAU, futs: it.futs, lot: et ? et.lot : null, texte: et ? et.texte : null }, sc, { sel: !!it.id && haut, sansEtiquette });
      const cls = it.id && it.id === ui.tombe ? 'pm-tombe' : !ui.vu ? 'pm-apparait' : '';
      s += `<g${it.id ? ` data-pm-posee="${ech(it.id)}"` : ''}${cls ? ` class="${cls}" style="animation-delay:${cls === 'pm-apparait' ? (k0 + n) * 45 : 0}ms"` : ''}>${c}</g>`;
    });
    return s;
  }
  // Le cadre : les coins du sol et le haut du mur et des piles, projetés.
  function cadre(I, pts) {
    const xy = pts.map((p) => I.P(...p)), xs = xy.map((p) => p[0]), ys = xy.map((p) => p[1]);
    const x0 = Math.min(...xs) - 14, y0 = Math.min(...ys) - 40;
    return `${x0.toFixed(0)} ${y0.toFixed(0)} ${(Math.max(...xs) - x0 + 14).toFixed(0)} ${(Math.max(...ys) - y0 + 14).toFixed(0)}`;
  }

  // LE PLAN D'ENSEMBLE.
  function svgPlan(e, R) {
    const I = I0, N = G.N, xF = G.xFin;
    const decor = [
      { type: 'sol', de: [-.6, -.5], a: [xF, G.yQuai + .6] },
      { type: 'mur', y: -.5, de: -.6, a: xF, hauteur: MUR },
      { type: 'allee', de: [-.6, G.yAllee], a: [xF, G.yAllee + 1.6] },
      { type: 'texteSol', texte: 'ALLÉE — le chariot entre par ici', en: [(M.couloirs.length - 1) * PAS / 2 + .5, G.yAllee + 1.35], style: 'allee' },
      ...M.couloirs.map((c) => ({ type: 'couloirMasse', id: c.id, x: c.k * PAS, y: N - c.n, profondeur: c.n, panneau: c.id, panneauZ: PANNEAU, panneauTaille: 12.5, fleches: true, mots: c.k === 0, reserve: !!c.reserve })),
    ];
    if (P.plan.litiges) decor.push({ type: 'zone', ton: 'litiges', de: G.litiges.de, a: G.litiges.a, titre: (P.plan.litiges.titre || 'Zone litiges').toUpperCase(), ligne: P.plan.litiges.ligne || '' });
    decor.push({ type: 'zone', ton: 'reception', de: G.reception.de, a: G.reception.a, titre: (P.plan.reception || 'Zone de réception').toUpperCase() });
    (P.plan.quais || []).forEach((q, k) => { const x = .2 + k * 2.4; if (x + 1.6 <= xF) decor.push({ type: 'quai', de: [x, G.yQuai], texte: q }); });
    const sc = compilerScene({ decor, lots: lotsScene() }, `entrepot ${P.id}`);
    let s = dessinerDecor(I, sc);
    let k0 = 0;
    const T = [];
    M.couloirs.forEach((c) => {
      const x = c.k * PAS, y0 = N - c.n, L = piles(M, e, c.id), titre = titreCouloir(e, c);
      let g = `<polygon class="pm-sol" points="${I.pts([[x - .05, y0 - .05, 0], [x + 1.05, y0 - .05, 0], [x + 1.05, N + .05, 0], [x - .05, N + .05, 0]])}"/>`;
      g += `<polygon class="pm-panneau" points="${I.pts([[x + .1, -.5, PANNEAU[0] - .05], [x + .9, -.5, PANNEAU[0] - .05], [x + .9, -.5, PANNEAU[1] + .05], [x + .1, -.5, PANNEAU[1] + .05]])}"/>`;
      L.forEach((pl, i) => { g += pile(I, sc, x, y0 + i, pl, k0, true); k0 += pl.length; T.push({ x, y: y0 + i, L: pl }); });
      s += `<g class="pm-couloir${R.fige ? ' pm-lecture' : ''}" data-pm-couloir="${ech(c.id)}" data-pe-cle="c:${ech(c.id)}" ${R.fige ? '' : 'tabindex="0" role="button"'} aria-label="${ech(`Couloir ${c.id} : ${titre}`)}">${g}</g>`;
    });
    // Le décor de la zone litiges : une palette de rétention et ce qu'elle porte (le fût qui fuit).
    if (P.plan.litiges) s += dessinerCharge(I, { x: G.litiges.de[0] + 2.55, y: G.litiges.de[1] + .02, z: 0, futs: P.plan.litiges.futs == null ? 1 : P.plan.litiges.futs, fuite: true }, sc);
    // Les palettes qui attendent en réception (cliquables) ; celle en main garde sa place, cerclée.
    Object.values(M.pal).forEach((p, i) => {
      if (e.pos[p.id]) return;
      const [x, y] = G.placeRecep(i), main = ui.main === p.id;
      const c = dessinerCharge(I, { x, y, z: 0, futs: p.futs, lot: p.lot, texte: `${p.id}${main ? ' en main' : ''}` }, sc, { sel: main });
      s += `<g class="pm-recep${!ui.vu ? ' pm-apparait' : ''}" data-pm-pal="${ech(p.id)}" data-pe-cle="r:${ech(p.id)}" ${R.fige ? '' : 'tabindex="0" role="button"'} aria-label="${ech(`${p.id} ${nomPal(p)}, en réception`)}">${c}</g>`;
    });
    s += `<g pointer-events="none">${etiquettesPlan(I, sc, T)}</g>`;
    const vb = cadre(I, [[-.6, -.5, 0], [xF, -.5, 0], [xF, G.yQuai + .6, 0], [-.6, G.yQuai + .6, 0], [-.6, -.75, MUR], [xF, -.75, MUR]]);
    return `<svg class="pm-svg" viewBox="${vb}" role="img" aria-label="La zone de stockage de masse, en 3D : ${M.couloirs.length} couloirs, l’allée devant, la zone de réception à droite">${DEFS}${s}</svg>`;
  }

  // LE COULOIR OUVERT, en grand.
  function svgCouloir(e, R) {
    const c = M.C[ui.ouvert], n = c.n, I = projection({ unite: 70, origine: [0, 0] });
    const decor = [
      { type: 'sol', de: [-.7, -.5], a: [2.8, n + 1.9] },
      { type: 'mur', y: -.5, de: -.7, a: 2.8, hauteur: MUR },
      { type: 'allee', de: [-.7, n + .25], a: [2.8, n + 1.9] },
      { type: 'couloirMasse', id: c.id, x: 0, profondeur: n, panneau: c.id, panneauZ: PANNEAU, fleches: true, reserve: !!c.reserve },
      { type: 'texteSol', texte: 'ALLÉE : le chariot entre et sort par ici', en: [.9, n + 1.7], style: 'allee' },
    ];
    const sc = compilerScene({ decor, lots: lotsScene() }, `entrepot ${P.id}`);
    let s = dessinerDecor(I, sc);
    const L = piles(M, e, c.id), f = devant(L), possibles = R.fige || !ui.main ? [] : placesPossibles(M, e, c.id);
    let etiq = '';
    L.forEach((pl, i) => {
      const y = i, p = i + 1;
      const [lx, ly] = I.P(1.12, y + .5, 0);
      s += `<text x="${lx + 6}" y="${ly + 5}" font-size="13" font-weight="700" fill="#3d3a33">position ${p}${p === 1 ? ' (fond)' : p === n ? ' (devant)' : ''}</text>`;
      if (ui.main && !R.fige && p < f) s += `<text x="${lx + 6}" y="${ly + 21}" font-size="12" font-weight="700" fill="#9d2727">inaccessible (une pile devant)</text>`;
      s += pile(I, sc, 0, y, pl, 0, true);
      etiq += etiquettePile(I, sc, 0, y, pl);
      const ici = possibles.find((x) => x.p === p);
      if (ici) {
        // Au sol : un carré en pointillé (des boîtes debout se recouvriraient d'une place à l'autre) ; sur une pile : une
        // boîte de la hauteur d'une palette, posée sur elle.
        const z0 = (ici.n - 1) * HAUT_NIVEAU, z1 = ici.n > 1 ? z0 + HAUT_NIVEAU : 0;
        const F = ici.n > 1 ? [[[.03, y + .97, z0], [.97, y + .97, z0], [.97, y + .97, z1], [.03, y + .97, z1]], [[.97, y + .03, z0], [.97, y + .97, z0], [.97, y + .97, z1], [.97, y + .03, z1]],
          [[.03, y + .03, z1], [.97, y + .03, z1], [.97, y + .97, z1], [.03, y + .97, z1]]] : [[[.05, y + .05, 0], [.95, y + .05, 0], [.95, y + .95, 0], [.05, y + .95, 0]]];
        const [tx, ty] = I.P(.5, y + .5, z1);
        s += `<g class="pm-place" data-pm-place="${p}" data-pe-cle="p:${p}" tabindex="0" role="button" aria-label="${ech(`Poser ${ui.main} en position ${p}, niveau ${ici.n}`)}">${F.map((q) => `<polygon points="${I.pts(q)}"/>`).join('')}
          <text x="${tx}" y="${ty + 5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0b6634">${ech(ui.main)} ici · niv. ${ici.n}</text></g>`;
      }
    });
    // Les étiquettes par-dessus les boîtes de place, mais transparentes au clic : la boîte reste cliquable en son milieu.
    s += `<g pointer-events="none">${etiq}</g>`;
    const vb = cadre(I, [[-.7, -.5, 0], [2.8, -.5, 0], [2.8, n + 1.9, 0], [-.7, n + 1.9, 0], [-.7, -.75, MUR], [2.8, -.75, MUR], [2.6, n * .5, 0]]);
    return `<svg class="pm-svg" viewBox="${vb}" role="img" aria-label="${ech(`Le couloir ${c.id} en 3D : position 1 au fond, contre le mur ; position ${n} devant, côté allée`)}">${DEFS}${s}</svg>`;
  }

  /* ------------------------------------------------------- textes de côté */
  function titreCouloir(e, c) {
    const L = piles(M, e, c.id).flat();
    if (c.reserve) return `${M.nomCourt(Object.keys(M.refs).find((r) => M.refs[r].vides) || '') || 'vides'} (couloir réservé)`;
    if (!L.length) return 'vide';
    const refs = [...new Set(L.map((x) => M.nomCourt(x.ref)))], lots = [...new Set(L.filter((x) => x.lot).map((x) => x.lot))];
    return `${refs.join(' + ')}${lots.length ? ` · lot ${lots.join(', ')}` : ''}`;
  }
  function carte(e, p, R) {
    const pl = placeDe(M, e, p.id);
    return `<button type="button" class="pe-pal pm-pal${ui.main === p.id ? ' pe-en-main' : ''}${pl ? ' pe-posee' : ''}" data-pm-pal="${ech(p.id)}" data-pe-cle="pal:${ech(p.id)}"
        ${R.fige ? 'disabled' : ''} aria-pressed="${ui.main === p.id}" title="${ech(`${p.id} ${nomPal(p)}`)}">
      <span class="pe-ttl"><span class="pe-pid">${ech(p.id)}</span> ${ech(nomPal(p))}</span>
      <dl><dt>Fûts · poids</dt><dd>${p.futs} · ${p.kg != null ? `${p.kg} kg` : '—'}</dd><dt>Lot</dt><dd>${ech(p.lot)}</dd>
        <dt>Réception</dt><dd class="pm-recep-txt">${ech(p.reception || 'conforme')}</dd>
        <dt>Posée</dt><dd>${pl ? `<b>${ech(pl.couloir)} · pos. ${pl.position} · niv. ${pl.niveau}</b>` : ui.main === p.id ? '<b>en main</b>' : '—'}</dd></dl>${verdict(e, p.id, R)}</button>`;
  }
  // Après la validation (hors évaluation) : ✓, ou le NOM des critères faux, dans la carte de la palette. Jamais la bonne place.
  function verdict(e, id, R) {
    if (!e.valide || R.eval) return '';
    const j = jalonsMasse(M, e).find((x) => x.palette === id);
    if (!j) return '';
    return `<span class="pe-verd pm-verd ${j.ok ? 'pe-ok' : 'pe-ko'}" data-pm-verd="${ech(id)}">${j.ok ? '✓ bien rangée' : `✗ critère : ${ech((j.criteres || []).join(', ') || 'non posée')}`}</span>`;
  }
  function consigne(e, R) {
    if (R.fige) return R.eval ? 'Copie rendue.' : 'Rangement validé : il ne change plus.';
    if (ui.main) return `<b>${ech(ui.main)}</b> en main. ${ui.ouvert ? 'Clique la place où la poser (boîte verte).' : 'Clique un couloir, puis la place où la poser.'}`;
    if (toutesPosees(e)) return R.eval ? 'Toutes les palettes sont posées : rends ton travail quand tu as fini.' : 'Toutes les palettes sont posées : relis les règles, puis valide ton rangement.';
    return ech(P.consigne || 'Prends une palette (clique sa carte), puis clique un couloir sur le plan.');
  }
  function actions(e, R) {
    if (R.fige) return `<button type="button" class="btn" disabled>${R.eval ? 'Copie rendue' : 'Rangement validé'}</button>`;
    if (ui.confirmer) {
      return `<span class="pe-confirme">${R.eval ? 'Rendre la copie ?' : 'Valider ?'} Tu ne pourras plus rien changer.
        <button type="button" class="btn btn-p" data-pm="oui" data-pe-cle="b:oui">Oui</button>
        <button type="button" class="btn" data-pm="non" data-pe-cle="b:non">Non</button></span>`;
    }
    const pret = R.eval || toutesPosees(e);
    return `<button type="button" class="btn btn-p" data-pm="valider" data-pe-cle="b:valider" ${pret ? '' : 'disabled'}>${R.eval ? 'Rendre mon travail' : 'Valider mon rangement'}</button>`;
  }

  return {
    signaux: [`entrepot:${P.id}:poser`, `entrepot:${P.id}:verifier`],
    id: P.id,
    nav: { libelle: P.libelle || "Plan de l'entrepôt" },
    etatNeuf: etatMasseNeuf,
    calculette: () => false,
    lire: () => ({ main: ui.main, ouvert: ui.ouvert, msg: ui.msg }),
    html(e, api) {
      if (!e.pos) Object.assign(e, etatMasseNeuf(), e);
      const R = regime(api, e);
      if (R.fige) { ui.main = null; ui.confirmer = false; }
      const per = P.personnage || {}, txt = (per.texte || {})[R.t] || '';
      const RG = P.regles;
      const regles = R.regles && RG ? `<details class="pe-regles" data-pe-regles ${ui.regles ? 'open' : ''}><summary data-pe-cle="b:regles">${ech(RG.titre || 'Les règles')} ▾</summary>
        <div class="pe-regles-corps"><b>${ech(RG.entete || 'Les règles de la zone de masse')}</b><ol>${(RG.lignes || []).map((l) => `<li>${l}</li>`).join('')}</ol>
        ${RG.encadre ? `<div class="pe-encadre">${RG.encadre}</div>` : ''}</div></details>` : '';
      const c = ui.ouvert ? M.C[ui.ouvert] : null;
      const fil = c
        ? `<button type="button" class="btn" data-pm="retour" data-pe-cle="b:retour">← Retour au plan</button><span>Couloir <b>${ech(c.id)}</b> en 3D — ${ech(titreCouloir(e, c))}</span>`
        : `<span>Zone de stockage de masse, en 3D — ${R.fige ? 'ton rangement' : 'clique un couloir pour l’ouvrir en grand'}</span>`;
      const prof = api && api.estProf ? `<details class="pe-prof"><summary>Côté enseignant : bonnes places</summary>${Object.entries(solutionsMasse(M)).map(([id, L]) =>
        `<div><b>${ech(id)}</b> : ${L.map(ech).join(' ; ') || 'aucune'}</div>`).join('')}</details>` : '';
      const svg = c ? svgCouloir(e, R) : svgPlan(e, R);
      ui.vu = true; ui.tombe = null;
      return `<div class="pe pm" data-entrepot="${ech(P.id)}" data-pe-mode="masse" data-pe-temps="${R.t}" data-pm-ouvert="${c ? ech(c.id) : ''}" data-pm-valide="${!!e.valide}">
        <div class="pm-haut"><div class="pe-perso pm-perso"><b>${ech([per.nom, per.role].filter(Boolean).join(', '))}${per.date ? ` · ${ech(per.date)}` : ''}</b>${txt}</div>
          <div class="pm-act">${actions(e, R)}${regles}</div></div>
        <div class="pm-jeu"><aside class="pm-cote"><div class="pm-cartes">${Object.values(M.pal).map((p) => carte(e, p, R)).join('')}</div>
            <div class="pm-consigne" data-pm-consigne>${consigne(e, R)}</div>
            <div class="pe-msg pm-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pm-msg role="status">${ui.msg}</div>${prof}</aside>
          <section class="pe-espace pm-espace"><div class="pm-fil">${fil}</div><div class="pm-dessin">${svg}</div></section></div></div>`;
    },
    brancher(z, e, api) {
      const racine = z.querySelector('.pm');
      if (!racine) return;
      const R = regime(api, e);
      const redessiner = () => api.redessiner();
      const sauver = () => api.sauver();
      const sig = (n) => { if (api.signal) api.signal(`entrepot:${P.id}:${n}`); };
      const activer = (el, fn) => {
        el.addEventListener('click', fn);
        if (el.tagName !== 'BUTTON') el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); } });
      };
      const on = (cle, fn) => racine.querySelectorAll(`[data-pm="${cle}"]`).forEach((b) => activer(b, fn));
      const fermer = () => { if (!ui.ouvert) return false; ui.focus = `c:${ui.ouvert}`; ui.ouvert = null; dire(''); redessiner(); return true; };
      h.echap(racine, fermer);
      // La hauteur d'écran qui reste sous le haut de la vue : la 3D y tient en entier (1366 × 768 sans défiler).
      const dessin = racine.querySelector('.pm-dessin');
      const caler = () => {
        if (!dessin.isConnected) { window.removeEventListener('resize', caler); return; }
        const haut = dessin.getBoundingClientRect().top + window.scrollY;
        racine.style.setProperty('--pm-dispo', `${Math.max(300, Math.round(window.innerHeight - haut - 18))}px`);
      };
      caler();
      window.addEventListener('resize', caler);
      racine.addEventListener('focusin', (ev) => { const t = ev.target.closest && ev.target.closest('[data-pe-cle]'); if (t) ui.focus = t.dataset.peCle; });
      const det = racine.querySelector('[data-pe-regles]');
      if (det) det.addEventListener('toggle', () => { ui.regles = det.open; });
      on('retour', fermer);
      if (h.clavier() && ui.focus) {
        const el = racine.querySelector(`[data-pe-cle="${CSS.escape(ui.focus)}"]`);
        if (el) el.focus({ preventScroll: true });
      }
      if (R.fige) return;
      racine.querySelectorAll('[data-pm-pal]').forEach((b) => activer(b, () => { prendre(e, b.dataset.pmPal); sauver(); redessiner(); }));
      racine.querySelectorAll('[data-pm-couloir]').forEach((g) => activer(g, () => {
        ui.ouvert = g.dataset.pmCouloir; ui.confirmer = false; dire('');
        const L = placesPossibles(M, e, ui.ouvert);
        ui.focus = ui.main && L.length ? `p:${L[0].p}` : 'b:retour';
        redessiner();
      }));
      racine.querySelectorAll('[data-pm-place]').forEach((g) => activer(g, () => {
        if (poser(e, ui.ouvert, +g.dataset.pmPlace)) sig('poser');
        ui.focus = 'b:retour';
        sauver(); redessiner();
      }));
      on('valider', () => { ui.confirmer = true; ui.focus = 'b:oui'; redessiner(); });
      on('non', () => { ui.confirmer = false; ui.focus = 'b:valider'; redessiner(); });
      on('oui', () => {
        ui.confirmer = false; ui.main = null; ui.ouvert = null;
        e.valide = true; e.at = Date.now(); e.verifs = (e.verifs || 0) + 1;
        sig('verifier'); sauver();
        if (R.eval && api.rendreCopie) api.rendreCopie();
        // Tout l'écran, menu compris (ENT-6.5, 11/10/2026) : une entrée qui attend le rangement validé (fiche `quand`,
        // `fermetures`) apparaît tout de suite, sans attendre un autre clic du menu.
        if (api.redessinerTout) api.redessinerTout(); else redessiner();
      });
    },
  };
}
