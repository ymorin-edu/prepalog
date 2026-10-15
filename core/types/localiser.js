// Vue « Localiser » — situer les lieux d'une entreprise sur la carte de France : région → département → ville.
//
// Écrite le 15/10/2026 (brief `docs/briefs/MOTEUR-vue-localiser.md`, lots 2 et 3 ; maquette validée par Tristan,
// `docs/briefs/action/maquette-localiser-action.html`). Première séance : Action ENT-8.1 (CAP OL). Rien d'Action ici :
// le contenu déclare ses lieux, la vue fournit la carte, le geste, l'aide, la note et la fin.
//
// Ce que la séance déclare (option `localiser` de `creerEntreprise`) :
//   localiser: {
//     id: 'action-carte', libelle: 'Carte de France', titre: 'Où sont les lieux ?',
//     contours: FRANCE,                        // le module contenus/france-contours.js (le moteur n'importe rien de contenus/)
//     lieux: [ { id, lettre, type, nom, role, ville, dep, region, lonlat: [lon, lat], osm,
//                autres: [{ ville, lonlat, osm } ×3], reperes: [{ ville, lonlat }], indice, etiq, bonus }, … ],
//              // ou (db) => [...] (contrôlé sur une base vide ; les ids doivent être les mêmes pour tous)
//     flux: ['port', 'entrepot', 'magasin'],   // facultatif : le trajet de la marchandise, à la fin
//     reseau: { libelle: 'autres entrepôts Action', sites: [{ ville, lonlat }] },   // facultatif : ronds creux, à la fin
//     fin: { titre, texte },                   // facultatif : le panneau de la fin
//   }
// `type` : magasin (bleu, le client), entrepot (terre), port (encre), usine, site. `etiq` : place du nom à la fin (h, b, g, d).
// Un lieu `bonus: true` n'est joué que par un élève CONFIRMÉ (`db.aisance`), jamais en évaluation ; le meta doit déclarer
// `niveauxPrevus: ['confirme']` (contrôlé à l'ouverture par le moteur).
//
// Les décisions de Tristan (15/10/2026) et où elles vivent :
//   - trois étapes par lieu ; seules la RÉGION et le DÉPARTEMENT sont notés, au PREMIER ESSAI (`etapesLocaliser`) ; la ville
//     se joue sans note et hors du bilan ;
//   - on recommence jusqu'à trouver ; après DEUX erreurs sur la même étape, la bonne zone (ou le bon point) est entourée en
//     pointillés terre ; jamais le nom de la bonne réponse dans le message ;
//   - les niveaux (§2.5 du brief) : accompagné (noms des régions, nom et numéro des départements, noms sur les points),
//     standard (noms des régions, numéros, repères, indice), confirmé (aucun nom ni numéro, repères, pas d'indice, la ville seule) ;
//   - couleurs : magasin bleu, entrepôt terre, port encre ; le vert plein ne dit que « juste » ; le faux = trait rouge.
//
// L'état, rangé par le moteur dans la base de l'élève, cloisonné par séance : `db.localiser[<séance>][<id de la vue>]` =
//   { courant: { lieu, etape }, lieux: { <lieu>: { region: { premier, essais, at }, departement: {…}, ville: {…} } }, fini }
// `premier` s'écrit une fois (vrai : le premier clic était le bon) ; `essais` compte les clics ; `at` = l'heure où l'étape
// est trouvée. L'étape en cours se déduit de l'état (la reprise après rechargement retombe toujours au bon endroit).
//
// Les gestes publiés (questions au fil, messages déclenchés), une seule fois, à la FIN de l'étape (après l'animation du zoom) :
//   `localiser:<lieu>:region`, `localiser:<lieu>:departement`, `localiser:<lieu>:ville`, et `localiser:<vue>:fin` (bilan atteint).
//
// API reçue du moteur : { db, seance, estProf, gele(), signal(nom), sauver(), redessiner(), reperer(lieu, etape), graine }.

import { ech } from '../ui.js';
import { monterCadre } from './carte.js';

export const TYPES_LIEU = { magasin: 'magasin', entrepot: 'entrepôt', port: 'port', usine: 'usine', site: 'site' };
const ORDRE_TYPES = ['magasin', 'entrepot', 'port', 'usine', 'site'];
const ETAPES = ['region', 'departement', 'ville'];
const NIVEAUX = ['accompagne', 'standard', 'confirme'];
const DIST_MIN_KM = 8;          // deux points d'un même lieu : au-delà, ils ne se touchent pas au zoom du département
const TOL_KM = 0.3;             // un point de ville en bord de mer peut tomber ≈ 300 m hors du tracé détaillé
const DUREE_ZOOM = 650;
const PAUSE_JUSTE = 500;
const FLASH = 700;
export const MENTION = 'Contours : IGN Admin Express (Licence Ouverte). Positions : © contributeurs OpenStreetMap.';
const CONSIGNES = {
  region: 'Clique la région où se trouve ce lieu.',
  departement: 'Clique maintenant le département.',
  ville: 'Clique la bonne ville parmi les points.',
  vu: 'Voilà où se trouve ce lieu en France.',
};
const RATE = { region: 'Ce n’est pas la bonne région.', departement: 'Ce n’est pas le bon département.', ville: 'Ce n’est pas la bonne ville.' };
const AIDE = { region: 'Regarde la zone entourée.', departement: 'Regarde la zone entourée.', ville: 'Regarde le point entouré.' };

/* ------------------------------------------------------------------ géométrie */

const projeter = (F, ll) => [(ll[0] - F.proj.lonMin) * F.proj.k * F.proj.s, (F.proj.latMax - ll[1]) * F.proj.s];
const unitesParKm = (F) => F.proj.s / 111.195;
function kmEntre(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad, dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// Les anneaux d'un tracé « M x y l dx dy … z M … z » (le format du module des contours).
function anneaux(d) {
  return String(d).split('z').map((part) => {
    const pts = []; let x = 0, y = 0;
    for (const m of part.matchAll(/([Ml])(-?\d+) (-?\d+)/g)) {
      if (m[1] === 'M') { x = +m[2]; y = +m[3]; } else { x += +m[2]; y += +m[3]; }
      pts.push([x, y]);
    }
    return pts;
  }).filter((a) => a.length > 2);
}
function distSeg(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
// Dans le tracé (pair-impair sur tous les anneaux), ou à moins de `tol` unités de son bord.
function dansTrace(rings, p, tol) {
  let dedans = false, proche = Infinity;
  for (const r of rings) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const a = r[i], b = r[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) dedans = !dedans;
      proche = Math.min(proche, distSeg(p, a, b));
    }
  }
  return dedans || proche <= tol;
}
// Un cadre [x0, y0, x1, y1] élargi de `marge` (fraction du plus grand côté) → viewBox [x, y, l, h].
function boite(c, marge) {
  const m = Math.max(c[2] - c[0], c[3] - c[1]) * marge;
  return [c[0] - m, c[1] - m, c[2] - c[0] + 2 * m, c[3] - c[1] + 2 * m];
}
function englobe(points, cadre) {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  if (cadre) { xs.push(cadre[0], cadre[2]); ys.push(cadre[1], cadre[3]); }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/* ------------------------------------------------------------------ ordre stable des points */

function hache(t) {
  let h = 2166136261;
  for (const c of String(t)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// L'ordre des 4 points d'un lieu : mélangé, mais toujours le même pour un élève (graine) et un lieu.
export function ordreChoix(lieu, graine) {
  const a = [{ ville: lieu.ville, lonlat: lieu.lonlat, bon: true }, ...lieu.autres.map((x) => ({ ville: x.ville, lonlat: x.lonlat, bon: false }))];
  let s = hache(`${graine}|${lieu.id}`) || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ lieux, état */

const texte = (v) => typeof v === 'string' && v.trim().length > 0;
const coord = (v) => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number' && Number.isFinite(n));
const listeLieux = (L, db) => (typeof L.lieux === 'function' ? L.lieux(db || {}) : L.lieux) || [];
const niveauDe = (db) => (db && NIVEAUX.includes(db.aisance) ? db.aisance : 'standard');
// Les lieux que joue CET élève, dans l'ordre : un lieu bonus seulement chez un confirmé.
export function lieuxDe(L, db, niveau = niveauDe(db)) {
  return listeLieux(L, db).filter((l) => !l.bonus || niveau === 'confirme');
}
const etatVue = (db, seance, vue) => (db && db.localiser && db.localiser[seance] && db.localiser[seance][vue]) || null;
const xEtape = (e, lieu, et) => (e && e.lieux && e.lieux[lieu] && e.lieux[lieu][et]) || null;
function etapeDe(e, l) {
  for (const et of ETAPES) { const x = xEtape(e, l.id, et); if (!x || !x.at) return et; }
  return 'vu';
}
export const gesteLocaliser = (lieu, etape) => `localiser:${lieu}:${etape}`;

/* ------------------------------------------------------------------ contrôles au chargement */

export function controlerLocaliser(L) {
  const faute = (m) => { throw new Error(`localiser${L && L.id ? ` « ${L.id} »` : ''} : ${m}`); };
  if (!L || typeof L !== 'object') faute('la déclaration doit être un objet');
  if (!texte(L.id)) faute('« id » (texte non vide) est exigé : l’état de l’élève est rangé sous cet identifiant');
  const F = L.contours;
  if (!F || !Array.isArray(F.regions) || !Array.isArray(F.deps) || !F.proj || !F.w || !F.h) {
    faute('« contours » est exigé : le module des contours de la France (`FRANCE` de contenus/france-contours.js)');
  }
  for (const k of ['libelle', 'titre']) if (L[k] != null && !texte(L[k])) faute(`« ${k} » est un texte non vide`);
  const REG = new Map(F.regions.map((r) => [r.code, r])), DEP = new Map(F.deps.map((d) => [d.code, d]));
  let lieux;
  try { lieux = listeLieux(L, {}); } catch (e) { faute(`« lieux(db) » ne marche pas sur une base vide : ${e && e.message ? e.message : e}`); }
  if (!Array.isArray(lieux) || !lieux.length) faute('« lieux » : au moins un lieu');
  const ids = new Set([L.id]);
  const tol = TOL_KM * unitesParKm(F);
  lieux.forEach((l, n) => {
    const nom = `le lieu ${l && texte(l.id) ? `« ${l.id} »` : `n° ${n + 1}`}`;
    const err = (m) => faute(`${nom} : ${m}`);
    if (!l || typeof l !== 'object') err('doit être un objet');
    if (!texte(l.id)) err('« id » (texte non vide) est exigé');
    if (ids.has(l.id)) err(`l’id « ${l.id} » est déjà pris (par un autre lieu ou par la vue) : les gestes « localiser:<id>:… » se confondraient`);
    ids.add(l.id);
    if (!Object.hasOwn(TYPES_LIEU, l.type)) err(`type « ${l.type} » inconnu (types : ${Object.keys(TYPES_LIEU).join(', ')})`);
    for (const k of ['lettre', 'nom', 'role', 'ville']) if (!texte(l[k])) err(`le texte « ${k} » est vide`);
    if (!l.bonus && !texte(l.indice)) err('le texte « indice » est vide (il est montré au niveau standard)');
    if (l.indice != null && !texte(l.indice)) err('le texte « indice » est vide');
    if (l.bonus != null && typeof l.bonus !== 'boolean') err('« bonus » vaut true ou false');
    if (l.etiq != null && !['h', 'b', 'g', 'd'].includes(l.etiq)) err(`« etiq » vaut h, b, g ou d (reçu : ${l.etiq})`);
    const D = DEP.get(l.dep);
    if (!D) err(`le département « ${l.dep} » n’est pas dans les contours (France métropolitaine seulement, codes INSEE : « 30 », « 2A »…)`);
    if (!REG.has(l.region)) err(`la région « ${l.region} » n’est pas dans les contours (codes INSEE des 13 régions métropolitaines)`);
    if (D.region !== l.region) err(`le département ${D.nom} (${D.code}) n’est pas dans la région « ${l.region} » (il est dans ${REG.get(D.region).nom}, ${D.region})`);
    if (!coord(l.lonlat)) err('« lonlat » : [longitude, latitude] en nombres');
    if (!Array.isArray(l.autres) || l.autres.length !== 3) err(`il faut exactement 3 « autres » villes du même département (reçu : ${Array.isArray(l.autres) ? l.autres.length : 'aucune'})`);
    l.autres.forEach((a, i) => {
      if (!a || !texte(a.ville)) err(`l’autre ville n° ${i + 1} n’a pas de nom (« ville »)`);
      if (!coord(a.lonlat)) err(`« ${a.ville} » : « lonlat » : [longitude, latitude] en nombres`);
    });
    (l.reperes || []).forEach((r, i) => {
      if (!r || !texte(r.ville) || !coord(r.lonlat)) err(`le repère n° ${i + 1} : il faut { ville, lonlat }`);
    });
    if (l.reperes != null && !Array.isArray(l.reperes)) err('« reperes » est une liste');
    const points = [{ ville: l.ville, lonlat: l.lonlat }, ...l.autres];
    const villes = points.map((p) => p.ville.trim().toLowerCase());
    if (new Set(villes).size !== villes.length) err('les 4 villes à choisir doivent avoir 4 noms différents');
    const rings = anneaux(D.fin);
    for (const p of points) {
      if (!dansTrace(rings, projeter(F, p.lonlat), tol)) err(`le point de « ${p.ville} » est hors du département ${D.nom} (${D.code})`);
    }
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const km = kmEntre(points[i].lonlat, points[j].lonlat);
        if (km < DIST_MIN_KM) err(`« ${points[i].ville} » et « ${points[j].ville} » sont à ${km.toFixed(1).replace('.', ',')} km l’un de l’autre : moins de ${DIST_MIN_KM} km, les points se toucheraient au zoom du département`);
      }
    }
  });
  if (L.flux != null) {
    if (!Array.isArray(L.flux) || L.flux.length < 2) faute('« flux » : la liste des ids du trajet, au moins deux');
    L.flux.forEach((id) => {
      const l = lieux.find((x) => x.id === id);
      if (!l) faute(`« flux » cite le lieu « ${id} », qui n’existe pas (lieux : ${lieux.map((x) => x.id).join(', ')})`);
      if (l.bonus) faute(`« flux » cite le lieu bonus « ${id} » : le trajet doit être le même pour tous`);
    });
  }
  if (L.reseau != null) {
    if (!L.reseau || !texte(L.reseau.libelle) || !Array.isArray(L.reseau.sites)) faute('« reseau » : { libelle, sites: [{ ville, lonlat }] }');
    L.reseau.sites.forEach((s, i) => { if (!s || !texte(s.ville) || !coord(s.lonlat)) faute(`« reseau » : le site n° ${i + 1} : il faut { ville, lonlat }`); });
  }
  if (L.fin != null) {
    if (typeof L.fin !== 'object') faute('« fin » : { titre, texte }');
    for (const k of ['titre', 'texte']) if (L.fin[k] != null && !texte(L.fin[k])) faute(`« fin.${k} » est un texte non vide`);
  }
  return lieux;
}

/* ------------------------------------------------------------------ jalons, corrigé */

// Deux jalons par lieu du socle : la région et le département, jugés au PREMIER essai (`attente` tant que l'étape n'est pas
// trouvée, puis `ok` du premier coup ou `ko`). Aucun `ecran` : la carte ne se rouvre pas par « Corriger ». La séance y pose
// `poids` et `groupe`. Un lieu bonus rend deux jalons `bonus: true` (sans poids ni groupe), `null` chez un élève qui ne l'a pas.
export function etapesLocaliser(L, seance) {
  if (!texte(seance)) throw new Error('etapesLocaliser(L, seance) : il faut l’id de la séance (l’état est rangé sous db.localiser[séance][vue])');
  return listeLieux(L, {}).flatMap((l) => ['region', 'departement'].map((et) => {
    const j = {
      id: `localiser:${l.id}:${et}`,
      titre: `${l.nom} : ${et === 'region' ? 'la région' : 'le département'}, du premier coup`,
      verifier(db) {
        const present = lieuxDe(L, db).some((x) => x.id === l.id);
        if (!present) return l.bonus ? null : { status: 'attente' };
        const x = xEtape(etatVue(db, seance, L.id), l.id, et);
        if (!x || !x.at) return { status: 'attente' };
        return { status: x.premier === true ? 'ok' : 'ko' };
      },
    };
    if (l.bonus) j.bonus = true;
    return j;
  }));
}

// Pour le corrigé de l'enseignant : par lieu, la région, le département et la ville attendus.
export function corrigeLocaliser(L) {
  const F = L.contours;
  const REG = new Map(F.regions.map((r) => [r.code, r])), DEP = new Map(F.deps.map((d) => [d.code, d]));
  return listeLieux(L, {}).map((l) => ({ id: l.id, nom: l.nom, bonus: !!l.bonus, ville: l.ville,
    region: `${REG.get(l.region).nom} (${l.region})`, departement: `${DEP.get(l.dep).nom} (${l.dep})` }));
}

/* ------------------------------------------------------------------ la vue */

export function creerLocaliser(L, opts = {}) {
  if (opts.copie) {
    throw new Error(`localiser${L && L.id ? ` « ${L.id} »` : ''} : la carte ne se joue pas en évaluation (copie) tant que la question n’est pas tranchée (brief MOTEUR-vue-localiser, §11 n° 1)`);
  }
  const lieux0 = controlerLocaliser(L);
  const F = L.contours;
  const REG = new Map(F.regions.map((r) => [r.code, r])), DEP = new Map(F.deps.map((d) => [d.code, d]));
  const P = (ll) => projeter(F, ll);
  const VUE_FRANCE = boite([0, 0, F.w, F.h], 0.02);
  const signaux = [...lieux0.flatMap((l) => ETAPES.map((et) => gesteLocaliser(l.id, et))), `localiser:${L.id}:fin`];
  // Interface en mémoire (ce qui n'est pas du travail) : message, animation, réglages de l'enseignant.
  const ui = { msg: '', cls: '', anime: false, niveauProf: 'standard', R: null, k: 1 };

  function contexte(e, api) {
    const db = api.db || {};
    const niveau = api.estProf ? ui.niveauProf : niveauDe(db);
    const lieux = lieuxDe(L, db, niveau);
    if (!e.lieux) e.lieux = {};
    let l = lieux.find((x) => e.courant && x.id === e.courant.lieu);
    if (!l) {
      l = lieux.find((x) => etapeDe(e, x) !== 'vu') || lieux[lieux.length - 1];
      e.courant = { lieu: l.id, etape: etapeDe(e, l) };
    }
    const tous = lieux.every((x) => etapeDe(e, x) === 'vu');
    const etape = e.fini && tous ? 'fin' : etapeDe(e, l);
    if (etape !== 'fin') e.courant.etape = etape;
    const R = { e, api, db, niveau, lieux, l, i: lieux.indexOf(l), etape, D: DEP.get(l.dep), graine: api.graine || 'eleve' };
    ui.R = R;
    return R;
  }
  const vueDe = (R) => (R.etape === 'departement' ? `r:${R.l.region}` : R.etape === 'ville' ? `d:${R.l.id}` : 'france');
  function vbDe(v) {
    if (v.startsWith('r:')) return boite(REG.get(v.slice(2)).cadre, 0.06);
    if (v.startsWith('d:')) {
      const l = ui.R.lieux.find((x) => x.id === v.slice(2)) || ui.R.l;
      const pts = [l.lonlat, ...l.autres.map((a) => a.lonlat), ...(ui.R.niveau !== 'accompagne' ? (l.reperes || []).map((r) => r.lonlat) : [])].map(P);
      return boite(englobe(pts, DEP.get(l.dep).cadre), 0.1);
    }
    return VUE_FRANCE;
  }
  const erreurs = (R, et) => { const x = xEtape(R.e, R.l.id, et); return x && !x.at ? x.essais || 0 : 0; };
  const places = (R) => R.lieux.filter((x) => etapeDe(R.e, x) === 'vu');

  /* ---------------------------------------------- la fin : trajet fléché ou encart */
  // Règle (décision 3 du chef de chantier) : si les lieux du `flux` tiennent dans un quart de la largeur ET un quart de la
  // hauteur de la France, ils se toucheraient sur la carte entière → encart zoomé ; sinon trajet fléché sur la France entière.
  function fluxDe(R) {
    if (!L.flux) return [];
    return L.flux.map((id) => R.lieux.find((x) => x.id === id)).filter(Boolean);
  }
  function modeFin(R) {
    const fl = fluxDe(R);
    if (fl.length < 2) return null;
    const b = englobe(fl.map((x) => P(x.lonlat)));
    return b[2] - b[0] <= F.w / 4 && b[3] - b[1] <= F.h / 4 ? 'encart' : 'trajet';
  }
  function vbEncart(R) {
    const b = boite(englobe(fluxDe(R).map((x) => P(x.lonlat))), 0.6);
    // Proportion 4 : 3, le cadre agrandi autour de son centre.
    const r = 4 / 3, [x, y, w, h] = b;
    if (w / h > r) { const nh = w / r; return [x, y - (nh - h) / 2, w, nh]; }
    const nw = h * r; return [x - (nw - w) / 2, y, nw, h];
  }
  // Le réseau, sans les sites déjà posés comme lieux (même ville, ou à moins de 2 km).
  function reseauDe(R) {
    if (!L.reseau) return [];
    const nrm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    return L.reseau.sites.filter((s) => !R.lieux.some((l) => nrm(l.ville) === nrm(s.ville) || kmEntre(l.lonlat, s.lonlat) < 2));
  }

  /* ---------------------------------------------- le dessin de la carte */
  const cliquable = (cle, label) => ` data-lc-cle="${ech(cle)}" tabindex="0" role="button" aria-label="${ech(label)}"`;
  const OFFS = { h: [0, -15, 'middle'], b: [0, 24, 'middle'], g: [-13, 5, 'end'], d: [13, 5, 'start'] };
  const nomSvg = (x, y, t, fs, cls = 'lc-nom', dx = 0, dy = 0, ancre = 'middle') => `<text class="${cls}" x="${x}" y="${y}" data-fs="${fs}" data-dx="${dx}" data-dy="${dy}" text-anchor="${ancre}">${ech(t)}</text>`;
  const pointPose = (l) => { const [x, y] = P(l.lonlat); return `<circle class="lc-place lc-t-${l.type}" cx="${x}" cy="${y}" data-r="8" data-lc-place="${ech(l.id)}"/>`; };
  const nomPose = (l, fs = 14) => { const [x, y] = P(l.lonlat), o = OFFS[l.etiq || 'h']; return nomSvg(x, y, l.ville, fs, 'lc-nom', o[0], o[1], o[2]); };

  function dessinCarte(R) {
    const { l, niveau, etape } = R;
    let zones = '', points = '', etiq = '', traits = '', reseau = '', cadreEncart = '';
    if (etape === 'region') {
      const aide = erreurs(R, 'region') >= 2;
      zones = F.regions.map((r, n) => `<path class="lc-zone${aide && r.code === l.region ? ' aide' : ''}" d="${r.d}"${cliquable(r.code, niveau === 'confirme' ? `Région ${n + 1}` : r.nom)}/>`).join('');
      if (niveau !== 'confirme') etiq = F.regions.map((r) => nomSvg(r.lab[0], r.lab[1], r.nom, 12.5)).join('');
      points = places(R).map(pointPose).join('');
    } else if (etape === 'departement') {
      const aide = erreurs(R, 'departement') >= 2;
      const deps = F.deps.filter((d) => d.region === l.region);
      zones = F.regions.filter((r) => r.code !== l.region).map((r) => `<path class="lc-zone lc-eteinte" d="${r.d}"/>`).join('')
        + deps.map((d, n) => `<path class="lc-zone${aide && d.code === l.dep ? ' aide' : ''}" d="${d.d}"${cliquable(d.code,
          niveau === 'accompagne' ? `${d.nom} (${d.code})` : niveau === 'standard' ? `Département ${d.code}` : `Département ${n + 1}`)}/>`).join('');
      if (niveau === 'accompagne') etiq = deps.map((d) => nomSvg(d.lab[0], d.lab[1], `${d.nom} (${d.code})`, 12)).join('');
      else if (niveau === 'standard') etiq = deps.map((d) => nomSvg(d.lab[0], d.lab[1], d.code, 15, 'lc-nom lc-num')).join('');
      points = places(R).map(pointPose).join('');
    } else if (etape === 'ville') {
      const D = R.D;
      zones = F.regions.map((r) => `<path class="lc-zone lc-eteinte" d="${r.d}"/>`).join('')
        + D.voisins.map((c) => `<path class="lc-zone lc-eteinte" d="${DEP.get(c).fin}"/>`).join('')
        + `<path class="lc-zone lc-fixe lc-dep" d="${D.fin}"/>`;
      const aide = erreurs(R, 'ville') >= 2;
      if (niveau !== 'accompagne') {
        (l.reperes || []).forEach((r) => {
          const [x, y] = P(r.lonlat);
          points += `<rect class="lc-repere" data-carre="9" data-x="${x}" data-y="${y}"/>`;
          etiq += nomSvg(x, y, r.ville, 13, 'lc-nom lc-doux', 0, -13);
        });
      }
      ordreChoix(l, R.graine).forEach((c, n) => {
        const [x, y] = P(c.lonlat);
        points += `<g class="lc-choix${aide && c.bon ? ' aide' : ''}"${cliquable(`p${n + 1}`, niveau === 'accompagne' ? c.ville : `Point ${n + 1}`)}>
          <circle class="lc-choix-large" cx="${x}" cy="${y}" data-r="22"/><circle class="lc-choix-cible" cx="${x}" cy="${y}" data-r="9"/></g>`;
        if (niveau === 'accompagne') etiq += nomSvg(x, y, c.ville, 14, 'lc-nom', 0, -17);
      });
    } else {
      // 'vu' (le lieu vient d'être posé) et 'fin' : la France entière, les points posés.
      zones = F.regions.map((r) => `<path class="lc-zone lc-fixe" d="${r.d}"/>`).join('');
      const pl = places(R);
      points = pl.map(pointPose).join('');
      if (etape === 'vu') etiq = nomPose(l, 15);
      else {
        const mode = modeFin(R);
        const fl = fluxDe(R);
        if (mode !== 'encart') etiq = pl.map((x) => nomPose(x)).join('');
        if (mode === 'trajet') {
          for (let i = 0; i < fl.length - 1; i++) {
            const a = P(fl[i].lonlat), b = P(fl[i + 1].lonlat);
            traits += `<path class="lc-fleche" data-de="${a.join(' ')}" data-a="${b.join(' ')}"/><path class="lc-pointe"/>`;
          }
        }
        if (mode === 'encart') {
          const [x, y, w, h] = vbEncart(R);
          cadreEncart = `<rect class="lc-cadre-encart" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        }
        reseau = reseauDe(R).map((s) => { const [x, y] = P(s.lonlat); return `<circle class="lc-reseau" cx="${x}" cy="${y}" data-r="6"><title>${ech(s.ville)}</title></circle>`; }).join('');
      }
    }
    return { zones, points, etiq, traits, reseau, cadreEncart };
  }

  // L'encart (fin, lieux proches) : une petite carte posée dans un coin de la grande, du côté opposé aux lieux.
  function dessinEncart(R) {
    if (R.etape !== 'fin' || modeFin(R) !== 'encart') return '';
    const vb = vbEncart(R), [x0, y0, w, h] = vb;
    const deps = F.deps.filter((d) => d.cadre[2] >= x0 && d.cadre[0] <= x0 + w && d.cadre[3] >= y0 && d.cadre[1] <= y0 + h);
    const fl = fluxDe(R);
    let traits = '';
    for (let i = 0; i < fl.length - 1; i++) {
      const a = P(fl[i].lonlat), b = P(fl[i + 1].lonlat);
      traits += `<path class="lc-fleche" data-de="${a.join(' ')}" data-a="${b.join(' ')}"/><path class="lc-pointe"/>`;
    }
    const pts = R.lieux.filter((l) => { const [x, y] = P(l.lonlat); return x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h; });
    return `<svg class="lc-encart-svg" data-lc-encart-svg viewBox="${vb.join(' ')}" role="img" aria-label="${ech('Le trajet en grand : ' + fl.map((l) => l.ville).join(', puis '))}">
      <rect class="lc-mer" x="${x0 - w}" y="${y0 - h}" width="${3 * w}" height="${3 * h}"/>
      ${deps.map((d) => `<path class="lc-zone lc-fixe" d="${d.d}"/>`).join('')}
      <g>${traits}</g>${pts.map(pointPose).join('')}${pts.map((l) => nomPose(l, 13)).join('')}</svg>`;
  }

  // Les tailles d'ÉCRAN constantes, quel que soit le zoom : `k` = unités de la carte par pixel.
  function echelles(racine, k) {
    racine.querySelectorAll('svg [data-fs]').forEach((t) => {
      const kk = t.closest('[data-lc-encart-svg]') ? kEncart(racine) : k;
      t.style.fontSize = t.dataset.fs * kk + 'px'; t.style.strokeWidth = 3.2 * kk + 'px';
      t.setAttribute('dx', t.dataset.dx * kk); t.setAttribute('dy', t.dataset.dy * kk);
    });
    racine.querySelectorAll('svg [data-r]').forEach((c) => {
      const kk = c.closest('[data-lc-encart-svg]') ? kEncart(racine) : k;
      c.setAttribute('r', c.dataset.r * kk);
      if (c.dataset.sw) c.style.strokeWidth = c.dataset.sw * kk + 'px';
    });
    racine.querySelectorAll('svg [data-carre]').forEach((q) => {
      const c = q.dataset.carre * k;
      q.setAttribute('x', q.dataset.x - c / 2); q.setAttribute('y', q.dataset.y - c / 2);
      q.setAttribute('width', c); q.setAttribute('height', c);
    });
    racine.querySelectorAll('svg .lc-fleche').forEach((f) => {
      const kk = f.closest('[data-lc-encart-svg]') ? kEncart(racine) : k;
      const a = f.dataset.de.split(' ').map(Number), b = f.dataset.a.split(' ').map(Number);
      const dx = b[0] - a[0], dy = b[1] - a[1], L2 = Math.hypot(dx, dy) || 1;
      // Une courbe douce : le point de contrôle décalé sur la gauche du trajet.
      const c = [(a[0] + b[0]) / 2 + (dy / L2) * 0.18 * L2, (a[1] + b[1]) / 2 - (dx / L2) * 0.18 * L2];
      const u0 = [c[0] - a[0], c[1] - a[1]], n0 = Math.hypot(...u0) || 1;
      const u2 = [b[0] - c[0], b[1] - c[1]], n2 = Math.hypot(...u2) || 1;
      const ecart = 13 * kk;
      // Deux lieux qui se touchent à cette échelle : pas de flèche (elle se retournerait entre les deux ronds).
      const court = L2 < 36 * kk;
      f.style.display = court ? 'none' : '';
      if (f.nextElementSibling && f.nextElementSibling.classList.contains('lc-pointe')) f.nextElementSibling.style.display = court ? 'none' : '';
      const p0 = [a[0] + (u0[0] / n0) * ecart, a[1] + (u0[1] / n0) * ecart], p2 = [b[0] - (u2[0] / n2) * ecart, b[1] - (u2[1] / n2) * ecart];
      f.setAttribute('d', `M${p0[0]} ${p0[1]}Q${c[0]} ${c[1]} ${p2[0]} ${p2[1]}`);
      f.style.strokeWidth = 2.4 * kk + 'px'; f.style.strokeDasharray = `${8 * kk} ${5 * kk}`;
      const pointe = f.nextElementSibling;
      if (pointe && pointe.classList.contains('lc-pointe')) {
        const ang = Math.atan2(u2[1], u2[0]) * 180 / Math.PI;
        pointe.setAttribute('d', 'M0 0L-11 -5.5L-11 5.5Z');
        pointe.setAttribute('transform', `translate(${p2[0]} ${p2[1]}) rotate(${ang}) scale(${kk})`);
      }
    });
  }
  function kEncart(racine) {
    const s = racine.querySelector('[data-lc-encart-svg]');
    if (!s) return 1;
    const vb = s.viewBox.baseVal;
    return vb.width / (s.getBoundingClientRect().width || 300);
  }
  // L'encart du côté de la carte opposé aux lieux, en haut.
  function placerEncart(racine, R) {
    const box = racine.querySelector('[data-lc-encart]');
    if (!box) return;
    if (R.etape !== 'fin' || modeFin(R) !== 'encart') { box.hidden = true; return; }
    box.hidden = false;
    const b = englobe(fluxDe(R).map((x) => P(x.lonlat)));
    const droite = (b[0] + b[2]) / 2 < F.w / 2;
    box.classList.toggle('lc-encart-droite', droite);
    box.classList.toggle('lc-encart-gauche', !droite);
  }

  /* ---------------------------------------------- le panneau */
  function panneauHtml(R) {
    const { l, niveau, etape, lieux, api } = R;
    const tete = `<div class="lc-tete"><span class="lc-titre">${ech(L.titre || L.libelle || 'Carte de France')}</span>
      <span class="lc-compteur" data-lc-compteur>${etape === 'fin' ? 'Bilan' : `Lieu ${R.i + 1} sur ${lieux.length}`}</span></div>`;
    const prof = api.estProf ? `<div class="lc-prof" data-lc-prof>
        <label>Lieu <select data-lc-prof-lieu>${lieux.map((x, n) => `<option value="${ech(x.id)}"${x === l && etape !== 'fin' ? ' selected' : ''}>${n + 1}. ${ech(x.ville)}${x.bonus ? ' (bonus)' : ''}</option>`).join('')}</select></label>
        <label>Niveau <select data-lc-prof-niveau>${NIVEAUX.map((n) => `<option value="${n}"${n === niveau ? ' selected' : ''}>${{ accompagne: 'accompagné', standard: 'standard', confirme: 'confirmé' }[n]}</option>`).join('')}</select></label>
        <button type="button" class="btn btn-s" data-lc-bouton="recommencer">Recommencer</button>
        <span class="lc-prof-note">Vous cliquez librement : rien n’est écrit.</span></div>` : '';
    if (etape === 'fin') {
      const lignes = lieux.map((x) => `<tr><td class="lc-bilan-lieu"><span class="lc-pastille lc-petite lc-t-${x.type}" aria-hidden="true">${ech(x.lettre)}</span>${ech(x.ville)}</td>${['region', 'departement'].map((et) => {
        const ok = xEtape(R.e, x.id, et) && xEtape(R.e, x.id, et).premier === true;
        return `<td class="${ok ? 'lc-ok' : 'lc-ko'}" data-lc-bilan-case="${ech(x.id)}:${et}">${ok ? '✓' : '✗'}<span class="lc-lu">${ok ? ' du premier coup' : ' après une erreur'}</span></td>`;
      }).join('')}</tr>`).join('');
      const nb = lieux.reduce((s, x) => s + ['region', 'departement'].filter((et) => xEtape(R.e, x.id, et) && xEtape(R.e, x.id, et).premier === true).length, 0);
      return `${tete}${prof}
        <div class="lc-bilan" data-lc-bilan><table><thead><tr><td></td><th scope="col">Région</th><th scope="col">Département</th></tr></thead><tbody>${lignes}</tbody></table>
        <p data-lc-premier-coup>Du premier coup : <b>${nb} sur ${lieux.length * 2}</b>.</p></div>
        ${L.fin ? `<div class="lc-fin" data-lc-fin>${L.fin.titre ? `<h3>${ech(L.fin.titre)}</h3>` : ''}${L.fin.texte ? `<p>${ech(L.fin.texte)}</p>` : ''}</div>` : ''}`;
    }
    const D = R.D;
    const ville = niveau === 'confirme' ? l.ville : `${l.ville}, ${D.nom} (${D.code})`;
    const ordre = ['region', 'departement', 'ville', 'vu'];
    const etapes = ETAPES.map((et, n) => {
      const cls = et === etape ? 'encours' : ordre.indexOf(et) < ordre.indexOf(etape) ? 'fait' : '';
      return `<li class="${cls}" data-lc-etape="${et}">${n + 1}. ${{ region: 'Région', departement: 'Département', ville: 'Ville' }[et]}</li>`;
    }).join('');
    const dernier = R.i === lieux.length - 1;
    return `${tete}${prof}
      <div class="lc-lieu"><span class="lc-pastille lc-t-${l.type}" aria-hidden="true">${ech(l.lettre)}</span>
        <div><div class="lc-nom-lieu">${ech(l.nom)}</div><div class="lc-role">${ech(l.role)}</div><div class="lc-ville" data-lc-ville>${ech(ville)}</div></div></div>
      <p class="lc-consigne" data-lc-consigne>${CONSIGNES[etape]}</p>
      ${etape === 'ville' && niveau === 'standard' && l.indice ? `<p class="lc-indice" data-lc-indice>Indice : ${ech(l.indice)}</p>` : ''}
      <p class="lc-message${ui.cls ? ' lc-' + ui.cls : ''}" data-lc-message role="status">${ech(ui.msg)}</p>
      <ol class="lc-etapes">${etapes}</ol>
      ${etape === 'vu' && !ui.anime ? `<button type="button" class="btn lc-suivant" data-lc-bouton="${dernier ? 'bilan' : 'suivant'}">${dernier ? 'Voir le bilan' : 'Lieu suivant'}</button>` : ''}`;
  }

  function legendeHtml(R) {
    const types = ORDRE_TYPES.filter((t) => R.lieux.some((x) => x.type === t));
    const fin = R.etape === 'fin';
    return types.map((t) => `<li><i class="lc-rond lc-t-${t}" aria-hidden="true"></i>${TYPES_LIEU[t]}</li>`).join('')
      + (fin && modeFin(R) ? '<li><svg width="34" height="12" aria-hidden="true"><path class="lc-fleche-leg" d="M2 6H24"/><path class="lc-pointe" d="M32 6L23 1.5L23 10.5Z"/></svg>trajet de la marchandise</li>' : '')
      + (fin && reseauDe(R).length ? `<li><i class="lc-rond lc-creux" aria-hidden="true"></i>${ech(L.reseau.libelle)}</li>` : '');
  }

  function html(e, api) {
    const R = contexte(e, api);
    const C = dessinCarte(R);
    return `<div class="lc${api.estProf ? ' lc-est-prof' : ''}" data-lc data-lc-etape="${R.etape}" data-lc-lieu="${ech(R.l.id)}" data-lc-niveau="${R.niveau}">
      <section class="lc-panneau" data-lc-panneau>${panneauHtml(R)}</section>
      <section class="lc-carte">
        <div class="lc-boite" data-ct-cadre>
          <svg class="lc-svg" data-ct-svg role="group" aria-label="Carte de France">
            <rect class="lc-mer" x="${-F.w * 3}" y="${-F.h * 3}" width="${F.w * 7}" height="${F.h * 7}"/>
            <g data-lc-zones>${C.zones}</g><g data-lc-reseau>${C.reseau}</g><g data-lc-traits>${C.traits}</g>
            <g data-lc-points>${C.points}</g><g data-lc-etiq>${C.etiq}</g><g data-lc-encadre>${C.cadreEncart}</g>
          </svg>
          <div class="lc-encart" data-lc-encart hidden>${dessinEncart(R)}</div>
        </div>
        <div class="lc-pied"><ul class="lc-legende" data-lc-legende aria-label="Légende">${legendeHtml(R)}</ul>
          <p class="lc-credit" data-lc-credit>${ech(MENTION)}</p></div>
      </section>
    </div>`;
  }

  /* ---------------------------------------------- le geste */
  function brancher(z, e, api) {
    const racine = z.querySelector('[data-lc]');
    if (!racine) return;
    let R = contexte(e, api);
    const svg = racine.querySelector('[data-ct-svg]');
    const ici = { vue: vueDe(R) };
    caler(racine);
    const S = monterCadre(racine, { frame: [0, 0, F.w, F.h] }, ici, {
      vb: vbDe, zz: () => 0, grille: false, echelle: false, duree: DUREE_ZOOM,
      epaisseurs: (k) => { ui.k = k; echelles(racine, k); },
    });
    placerEncart(racine, R);
    S.appliquer();
    const gele = () => !!(api.gele && api.gele());

    // Redessine la carte (zones, points, noms) et le panneau pour l'état courant, sans animation. Le focus clavier reste
    // sur la même zone si elle existe encore, sinon sur la première zone de l'étape.
    function maj({ carte = true, panneau = true } = {}) {
      R = contexte(e, api);
      const a = document.activeElement;
      const avant = a && racine.contains(a) ? (a.dataset.lcCle ? ['cle', a.dataset.lcCle] : a.dataset.lcBouton ? ['bouton', a.dataset.lcBouton] : ['autre']) : null;
      racine.dataset.lcEtape = R.etape; racine.dataset.lcLieu = R.l.id; racine.dataset.lcNiveau = R.niveau;
      if (carte) {
        const C = dessinCarte(R);
        for (const k of ['zones', 'reseau', 'traits', 'points', 'etiq']) racine.querySelector(`[data-lc-${k}]`).innerHTML = C[k];
        racine.querySelector('[data-lc-encadre]').innerHTML = C.cadreEncart;
        racine.querySelector('[data-lc-encart]').innerHTML = dessinEncart(R);
        racine.querySelector('[data-lc-legende]').innerHTML = legendeHtml(R);
        placerEncart(racine, R);
      }
      if (panneau) racine.querySelector('[data-lc-panneau]').innerHTML = panneauHtml(R);
      echelles(racine, ui.k);
      if (avant) {
        const cible = (avant[0] === 'cle' && racine.querySelector(`[data-lc-cle="${CSS.escape(avant[1])}"]`))
          || (avant[0] === 'bouton' && racine.querySelector(`[data-lc-bouton="${CSS.escape(avant[1])}"]`))
          || (!a.isConnected && (racine.querySelector('[data-lc-cle]') || racine.querySelector('[data-lc-bouton]')));
        if (cible && cible !== document.activeElement) cible.focus({ preventScroll: true });
      }
    }

    // Le message seul (juste, faux), sans redessiner le panneau : l'étape affichée ne change qu'avec la carte.
    function dire(msg, cls) {
      ui.msg = msg; ui.cls = cls;
      const m = racine.querySelector('[data-lc-message]');
      if (m) { m.textContent = msg; m.className = `lc-message${cls ? ' lc-' + cls : ''}`; }
    }
    const garderClavier = () => { const a = document.activeElement; return !!(a && a !== document.body && racine.contains(a)); };
    function rendreFocus(auClavier) {
      if (!auClavier || racine.contains(document.activeElement)) return;
      const c = racine.querySelector('[data-lc-cle]') || racine.querySelector('[data-lc-bouton]');
      if (c) c.focus({ preventScroll: true });
    }

    function etatEtape(id, et) {
      const xl = e.lieux[id] || (e.lieux[id] = {});
      return xl[et] || (xl[et] = { premier: null, essais: 0, at: null });
    }

    function choisir(cle, el) {
      if (ui.anime || gele()) return;
      const et = R.etape;
      if (!ETAPES.includes(et)) return;
      const l = R.l;
      const juste = et === 'region' ? cle === l.region : et === 'departement' ? cle === l.dep
        : (ordreChoix(l, R.graine)[+String(cle).slice(1) - 1] || {}).bon === true;
      const x = etatEtape(l.id, et);
      x.essais += 1;
      if (x.premier == null) x.premier = juste;
      if (!juste) {
        if (api.reperer) api.reperer(l.id, et);
        el.classList.add('faux');
        setTimeout(() => el.classList.remove('faux'), FLASH);
        const n = x.essais;
        dire(`${RATE[et]} ${n >= 2 ? AIDE[et] : 'Essaie encore.'}`, 'faux');
        if (n >= 2) {
          const bon = et === 'ville'
            ? racine.querySelector(`[data-lc-cle="p${ordreChoix(l, R.graine).findIndex((c) => c.bon) + 1}"]`)
            : racine.querySelector(`[data-lc-cle="${CSS.escape(et === 'region' ? l.region : l.dep)}"]`);
          if (bon) bon.classList.add('aide');
        }
        api.sauver();
        return;
      }
      // Juste : la zone en « juste », puis l'étape suivante, zoomée ; le geste est publié à la fin de l'animation.
      x.at = Date.now();
      const auClavier = garderClavier();
      el.classList.add('juste');
      el.classList.remove('aide');
      dire(et === 'ville' ? `${l.ville} est placée sur la carte.` : 'Bien vu !', 'juste');
      ui.anime = true;
      racine.classList.add('lc-anime');
      setTimeout(() => {
        if (!racine.isConnected) { ui.anime = false; return; }
        if (et !== 'ville') { ui.msg = ''; ui.cls = ''; }
        R = contexte(e, api);
        const v = vueDe(R);
        maj();
        S.allerA(vbDe(v), 0, () => {
          ui.anime = false;
          racine.classList.remove('lc-anime');
          ici.vue = v;
          if (!racine.isConnected) return;
          api.signal(gesteLocaliser(l.id, et));
          api.sauver();
          maj({ carte: false });
          rendreFocus(auClavier);
        });
      }, PAUSE_JUSTE);
    }

    svg.addEventListener('mousedown', (ev) => { if (ev.target.closest('[data-lc-cle]')) ev.preventDefault(); });
    svg.addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-lc-cle]');
      if (el) choisir(el.dataset.lcCle, el);
    });
    svg.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const el = ev.target.closest('[data-lc-cle]');
      if (!el) return;
      ev.preventDefault();
      if (gele()) return;
      choisir(el.dataset.lcCle, el);
    });
    const panneau = racine.querySelector('[data-lc-panneau]');
    panneau.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-lc-bouton]');
      if (!b || ui.anime || gele()) return;
      const quoi = b.dataset.lcBouton;
      if (quoi === 'suivant') {
        const suivant = R.lieux[R.i + 1];
        if (!suivant) return;
        e.courant = { lieu: suivant.id, etape: etapeDe(e, suivant) };
        ui.msg = ''; ui.cls = '';
        api.sauver();
        maj();
      } else if (quoi === 'bilan') {
        if (!R.lieux.every((x) => etapeDe(e, x) === 'vu')) return;
        e.fini = Date.now();
        ui.msg = ''; ui.cls = '';
        api.signal(`localiser:${L.id}:fin`);
        api.sauver();
        maj();
      } else if (quoi === 'recommencer' && api.estProf) {
        Object.keys(e).forEach((k) => delete e[k]);
        Object.assign(e, etatNeuf());
        ui.msg = ''; ui.cls = '';
        maj();
        S.allerA(VUE_FRANCE, 0, () => { ici.vue = 'france'; });
      }
    });
    panneau.addEventListener('change', (ev) => {
      if (!api.estProf) return;
      const t = ev.target;
      if (t.matches('[data-lc-prof-niveau]')) {
        ui.niveauProf = t.value;
        Object.keys(e).forEach((k) => delete e[k]);
        Object.assign(e, etatNeuf());
      } else if (t.matches('[data-lc-prof-lieu]')) {
        e.courant = { lieu: t.value, etape: 'region' };
        delete e.lieux[t.value];
        e.fini = null;
      } else return;
      ui.msg = ''; ui.cls = ''; ui.anime = false;
      maj();
      R = contexte(e, api);
      S.allerA(vbDe(vueDe(R)), 0, () => { ici.vue = vueDe(R); });
    });

    if (!ecouteRedim) {
      ecouteRedim = true;
      window.addEventListener('resize', () => { const r = document.querySelector('[data-lc]'); if (r) caler(r); });
    }
    // Une question au fil pose son bandeau AU-DESSUS de l'écran sans le redessiner : la carte descend. La hauteur se recalcule
    // dès que la page change de taille (le calcul ne dépend que de la place de la carte : il se stabilise au second passage).
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => { if (racine.isConnected) caler(racine); else ro.disconnect(); });
      ro.observe(document.body);
    }
    // Pour les tests et la page d'essai : l'état d'écran, sans passer par le DOM.
    racine.__lc = { lire: () => ({ etape: R.etape, lieu: R.l.id, niveau: R.niveau, anime: ui.anime, msg: ui.msg, vue: ici.vue,
      bon: R.etape === 'ville' ? `p${ordreChoix(R.l, R.graine).findIndex((c) => c.bon) + 1}` : R.etape === 'region' ? R.l.region : R.l.dep,
      encart: modeFin(R) }) };
  }

  function etatNeuf() { return { courant: null, lieux: {}, fini: null }; }

  return {
    id: L.id,
    nav: { libelle: L.libelle || 'Carte de France' },
    signaux,
    aBonus: lieux0.some((l) => l.bonus),
    etatNeuf,
    lieuxDe: (db, niveau) => lieuxDe(L, db, niveau),
    corrige: () => corrigeLocaliser(L),
    html,
    brancher,
  };
}
let ecouteRedim = false;

// La carte prend la hauteur qui reste sous le bandeau : ni la page ni le panneau ne défilent à 1366 × 768 et 1280 × 720.
function caler(racine) {
  if (!racine.isConnected) return;
  if (window.innerWidth < 820) { racine.style.removeProperty('--lc-h'); return; }
  const haut = racine.getBoundingClientRect().top + window.scrollY;
  racine.style.setProperty('--lc-h', `${Math.max(380, Math.floor(window.innerHeight - haut - 14))}px`);
}
