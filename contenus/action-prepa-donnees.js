// Action — l'ENTREPÔT DE PRÉPARATION d'Ensuès-la-Redonne, partagé par ENT-8.15 à 8.18 (C3.1 à C3.3) : le plan, les produits en cartons, le
// stock de départ, et la COMMANDE TIRÉE PAR ÉLÈVE (chantier E-8, lot 0). Données pures : aucun effet de bord à l'import, aucune dépendance au
// navigateur. Brief moteur : `docs/briefs/MOTEUR-preparation-vocale-cartons.md` (§4, lot 0) ; séances : `docs/briefs/ENT-8.15-action-preparer.md`
// (§0, §6) et suivantes.
//
// VÉRIFIÉ (offre France Travail 191TDTN, client « GEODIS/ACTION », actualisée le 29/04/2025) : à Ensuès, le préparateur travaille à la voix,
// avec un scanner, filme et met à quai. Les catégories de produits d'Action (communiqué du 15/10/2020, comme ENT-8.11). Les magasins Action
// du Sud-Est nommés dans `MAGASINS` (brief ENT-8.15 §0) ; Nîmes Cap Costières (univers `contenus/action.js`).
// CONSTRUIT (dit dans les séances, `MENTION_PREPA`) : tout le reste — le plan (allées A et B, côtés A1, A2, B1, B2, 6 travées, 4 niveaux,
// 3 emplacements ; N1 = picking, N2 à N4 = réserve), les plaques, le stock, les colisages, les poids et hauteurs des cartons, les codes de
// contrôle, les commandes, et le fait que ces magasins soient livrés depuis Ensuès.
//
// LES PRODUITS : les huit d'ENT-8.11 (noms et kg d'un carton LUS dans `action-ent811-donnees.js`, jamais modifié) et trois fragiles (brief ENT-8.15
// §6.2). Ce fichier ajoute ce que la préparation lit : `couches` (une palette pleine du picking), `carton: { kg, parCouche, h }` (cartons par
// couche sur la palette de commande, hauteur en m) et `classe` : lourd (carton de plus de 10 kg), fragile (verre, céramique), rien = normal.
//
// LA COMMANDE D'UN ÉLÈVE (`preparation(opts)` rend une FONCTION `(graine, { niveau, copie })`, comme le palettier d'ENT-8.11) : une ligne par
// produit, toutes au picking (N1), triées dans l'ordre du CIRCUIT (on monte l'allée A de T01 à T06, on redescend l'allée B de T06 à T01 : le
// serpentin du moteur). Selon la séance (`opts`) :
//   - `ordre: 'favorable'` (8.15, 8.16) : l'ordre du circuit est déjà celui de la palette (lourds, puis normaux, puis fragiles) ;
//     `ordre: 'piege'` (8.17) : poser dans l'ordre du circuit casse TOUJOURS au moins une règle de calage (il faut poser « à côté ») ;
//   - `vides: 1` : une ligne en RUPTURE (picking vide, une palette de réserve du même produit existe : la réserve descendue) ;
//   - `abimes: 1` : un carton abîmé devant un emplacement de la commande, et sa LIGNE DE REMPLACEMENT (autre emplacement du même produit, plus
//     loin dans le circuit et avant la ligne suivante : jamais de retour en arrière) — données du lot 3, que le moteur lira alors ;
//   - la bonne palette tient TOUJOURS dans `kgMax` et `hMax` (contrôle d'équité).
// Les CODES DE CONTRÔLE (2 chiffres, jamais deux fois le même dans une allée) sont tirés par élève pour tous les emplacements du picking (lot 1).
// ⚠ Le jeu d'un élève est une fonction de son identifiant, de `opts.id` ET de ce fichier : ne rien y changer pendant qu'une classe joue.

import { tirerJeu, hasard } from '../core/tirage.js';
import { PRODUITS as P811 } from './action-ent811-donnees.js';

export const SUPPORT = { h: 0.15, kg: 25 };
export const KG_MAX = 600;
// Le brief proposait 1,60 m ; à 7 lignes d'une couche (0,2 à 0,4 m) la bonne palette dépasserait : 1,80 m, comme Smoby (ENT-5.6).
export const H_MAX = 1.8;

// ─────────────────────────────────────────────────────────────── les produits
export const GAMMES = { ENT: 'entretien de la maison', ANI: 'animaux', BUR: 'bureau et loisirs créatifs', LIN: 'mode et linge de maison',
  DEC: 'décoration', MEN: 'articles ménagers', JOU: 'jouets et loisirs' };
const de811 = (k, gamme, couches, parCouche, h, classe) => ({ nom: P811[k].nom, court: P811[k].court, gamme, couches,
  ...(classe ? { classe } : {}), carton: { kg: P811[k].kg, parCouche, h } });
export const PRODUITS = {
  LES: de811('LES', 'ENT', [3, 3, 4], 6, 0.26, 'lourd'),
  NET: de811('NET', 'ENT', [4, 2, 5], 6, 0.24, 'lourd'),
  CRO: de811('CRO', 'ANI', [4, 2, 4], 6, 0.25, 'lourd'),
  CAH: de811('CAH', 'BUR', [3, 2, 5], 6, 0.18),
  SER: de811('SER', 'LIN', [4, 2, 5], 6, 0.22),
  BOU: de811('BOU', 'DEC', [5, 3, 4], 10, 0.16),
  BOI: de811('BOI', 'MEN', [3, 2, 4], 6, 0.3),
  PEL: de811('PEL', 'JOU', [3, 2, 4], 6, 0.3),
  VER: { nom: 'Verres à eau', court: 'Verres', gamme: 'MEN', couches: [4, 2, 5], classe: 'fragile', carton: { kg: 4, parCouche: 8, h: 0.2 } },
  VAS: { nom: 'Vases en verre', court: 'Vases', gamme: 'DEC', couches: [3, 2, 5], classe: 'fragile', carton: { kg: 5, parCouche: 6, h: 0.24 } },
  ASS: { nom: 'Assiettes en céramique', court: 'Assiettes', gamme: 'MEN', couches: [3, 3, 4], classe: 'fragile', carton: { kg: 8, parCouche: 6, h: 0.16 } },
};
export const CODES = Object.keys(PRODUITS);
export const classeDe = (k) => PRODUITS[k].classe || 'normal';
export const LOURDS = CODES.filter((k) => classeDe(k) === 'lourd');
export const NORMAUX = CODES.filter((k) => classeDe(k) === 'normal');
export const FRAGILES = CODES.filter((k) => classeDe(k) === 'fragile');
export const pleine = (k) => PRODUITS[k].couches.reduce((a, b) => a * b, 1);
export const poidsPleine = (k) => Math.round((pleine(k) * PRODUITS[k].carton.kg + SUPPORT.kg) * 100) / 100;
// Le minimum du picking (celui du moteur quand la séance ne le donne pas) : max(2, plein / 4).
export const minPicking = (k) => Math.max(2, Math.round(pleine(k) / 4));

// ─────────────────────────────────────────────────────────────── le plan (construit)
export const COTES = ['A1', 'A2', 'B1', 'B2'];
export const TRAVEES = 6, NIVEAUX = 4, EMPLACEMENTS = 3;
export const PLAQUES = { 2: 1500, 3: 1200, 4: 1000 };
const z2 = (n) => String(n).padStart(2, '0');
export const adresse = (c, t, n, e) => `${c}-T${z2(t)}-N${n}-E${e}`;
export const decoupe = (a) => { const m = /^([AB][12])-T(\d+)-N(\d)-E(\d)$/.exec(String(a || '')); return m ? { c: m[1], t: +m[2], n: +m[3], e: +m[4] } : null; };
const T_ = [...Array(TRAVEES).keys()].map((i) => i + 1), N_ = [1, 2, 3, 4], E_ = [1, 2, 3];
export const PICKING_TOUS = COTES.flatMap((c) => T_.flatMap((t) => E_.map((e) => adresse(c, t, 1, e))));
// Le rang d'un emplacement du picking dans le circuit : on monte l'allée A (T01 → T06), on redescend l'allée B (T06 → T01). Les deux côtés
// d'une travée sont au même point (le préparateur est au milieu de l'allée), le côté et l'emplacement départagent seulement.
export function rangCircuit(a) {
  const d = decoupe(a);
  const t = d.c[0] === 'A' ? d.t : 2 * TRAVEES + 1 - d.t;
  return t * 100 + (d.c[1] === '1' ? 0 : 10) + d.e;
}
export const quaiDe = (n) => `QUAI ${n}`;
export const PLAN = {
  allees: [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],
  cotes: Object.fromEntries(COTES.map((c) => [c, { charge: { ...PLAQUES } }])),
  travees: TRAVEES, niveaux: NIVEAUX, emplacements: EMPLACEMENTS,
  horsService: [],
  parcours: { debut: 'A', fin: 'B' },
  // En mètres : une travée de 2,7 m ; 9,4 m d'une allée à l'autre ; le quai à 5,2 m de l'allée A (comme Smoby, construit).
  metres: { travee: 2.7, entreAllees: 9.4, avant: 0.9, arriere: 1.2, quai: 5.2 },
};

// LE STOCK DE DÉPART, le même pour toute la classe (règle fixe, graine constante) : chaque emplacement du picking porte une palette pleine
// (chaque produit sur 6 ou 7 emplacements, de quoi tirer une ligne de remplacement) ; en réserve, 0 à 3 palettes par niveau, la plaque
// respectée, et chaque produit au moins deux fois (de quoi descendre une réserve).
function fabriquerStock() {
  for (let essai = 0; essai < 50; essai++) {
    const H = hasard(`action-prepa|stock|${essai}`);
    const S = {};
    const ordre = H.melanger(PICKING_TOUS);
    ordre.forEach((a, i) => { S[a] = CODES[i % CODES.length]; });
    COTES.forEach((c) => T_.forEach((t) => N_.slice(1).forEach((n) => {
      let charge = 0;
      H.prendre(E_, H.entier(0, 3)).forEach((e) => {
        const k = H.choisir(CODES);
        if (charge + poidsPleine(k) > PLAQUES[n]) return;
        charge += poidsPleine(k);
        S[adresse(c, t, n, e)] = k;
      });
    })));
    const enReserve = (k) => Object.entries(S).filter(([a, x]) => x === k && decoupe(a).n > 1).length;
    if (CODES.every((k) => enReserve(k) >= 2)) return Object.fromEntries(Object.entries(S).map(([a, k]) => [a, { produit: k, kg: poidsPleine(k) }]));
  }
  throw new Error('action-prepa : aucun stock de départ conforme');
}
export const STOCK = fabriquerStock();
export const produitEn = (a) => (STOCK[a] ? STOCK[a].produit : null);
export const emplacementsDe = (k) => PICKING_TOUS.filter((a) => produitEn(a) === k);
export const aReserve = (k) => Object.keys(STOCK).some((a) => decoupe(a).n > 1 && STOCK[a].produit === k);

// ─────────────────────────────────────────────────────────────── les magasins (réels, Action dans le Sud-Est ; la livraison depuis Ensuès : construite)
export const NIMES = { id: 'nimes', nom: 'Nîmes Cap Costières', court: 'Nîmes' };
export const MAGASINS = [
  { id: 'centre-bourse', nom: 'Marseille Centre Bourse', court: 'Centre Bourse' },
  { id: 'grand-littoral', nom: 'Marseille Grand Littoral', court: 'Grand Littoral' },
  { id: 'le-merlan', nom: 'Marseille Le Merlan', court: 'Le Merlan' },
  { id: 'la-valentine', nom: 'Marseille La Valentine', court: 'La Valentine' },
  { id: 'saint-loup', nom: 'Marseille Saint-Loup', court: 'Saint-Loup' },
  { id: 'lombard', nom: 'Marseille avenue de Lombard', court: 'Lombard' },
  { id: 'chateauneuf', nom: 'Châteauneuf-les-Martigues', court: 'Châteauneuf' },
  NIMES,
];
export const MENTION_PREPA = 'L’entrepôt, les adresses, les commandes et les codes de contrôle sont construits pour l’exercice. Action et Geodis ne '
  + 'publient pas l’organisation de l’entrepôt d’Ensuès ni la liste des magasins qu’il livre.';

// ─────────────────────────────────────────────────────────────── la palette d'une commande (calculée comme le moteur, pour l'équité)
// `L` : des lignes { produit, q } dans l'ordre de POSE. Mêmes règles que `calculPrep` (core/types/entrepot.js) : une ligne = une couche (ou
// plus), hauteur = support + Σ ⌈q / parCouche⌉ × h ; jamais un lourd sur un non-lourd ; rien de non fragile sur un fragile.
export function palette(L) {
  const c = (k) => PRODUITS[k].carton;
  const hauteur = SUPPORT.h + L.reduce((t, l) => t + Math.ceil(l.q / c(l.produit).parCouche) * c(l.produit).h, 0);
  const poids = Math.round(SUPPORT.kg + L.reduce((t, l) => t + l.q * c(l.produit).kg, 0));
  let nonLourd = false, lourds = true;
  L.forEach((l) => { if (classeDe(l.produit) === 'lourd' && nonLourd) lourds = false; if (classeDe(l.produit) !== 'lourd') nonLourd = true; });
  const fragiles = !L.some((l, i) => classeDe(l.produit) === 'fragile' && L.slice(i + 1).some((m) => classeDe(m.produit) !== 'fragile'));
  return { hauteur: Math.round(hauteur * 100) / 100, poids, lourds, fragiles };
}
const RANG_CLASSE = { lourd: 0, normal: 1, fragile: 2 };
// La bonne palette : les lignes rangées lourds, normaux, fragiles (l'ordre de pose qui respecte tout).
export const bonOrdre = (L) => [...L].sort((a, b) => RANG_CLASSE[classeDe(a.produit)] - RANG_CLASSE[classeDe(b.produit)]);

/* ================================================================== le tirage d'une commande */
const DEFAUTS = { lignes: 5, fragiles: 0, lourds: 1, abimes: 0, vides: 0, ordre: 'favorable', kgMax: KG_MAX, hMax: H_MAX, qMin: 3, qMax: 6 };

// DEUX MAGASINS (`magasins: 2`, chantier E-8 lot 4, ENT-8.18) : Nîmes et un autre, dans un ordre tiré ; `lignes` lignes, la moitié pour chacun
// (`pour` : 0 ou 1) ; un produit COMMUN aux deux, sur deux lignes consécutives à la même adresse ; chaque palette tient dans les limites.
export function tirerCommande(o, h) {
  const deux = o.magasins === 2;
  const n = deux ? o.lignes - 1 : o.lignes;
  const magasin = o.magasin ? MAGASINS.find((m) => m.id === o.magasin) : h.choisir(deux ? MAGASINS.filter((m) => m !== NIMES) : MAGASINS);
  // Les produits : `fragiles` fragiles, au moins `lourds` lourds, le reste parmi tous les autres ; tous différents.
  const pris = h.prendre(FRAGILES, o.fragiles);
  const autres = CODES.filter((k) => classeDe(k) !== 'fragile');
  const lourds = h.prendre(LOURDS, o.lourds);
  pris.push(...lourds, ...h.prendre(autres.filter((k) => !lourds.includes(k)), n - o.fragiles - o.lourds));
  // Les adresses : favorable = dans l'ordre des classes le long du circuit ; piège = au hasard (le contrôle dit si l'ordre casse une règle).
  let lignes;
  if (o.ordre === 'favorable') {
    // Une recherche en profondeur, au hasard : les classes dans l'ordre (lourds, normaux, fragiles), dans une classe les produits dans un ordre
    // quelconque, chacun à un emplacement plus loin dans le circuit que le précédent.
    const groupes = [0, 1, 2].map((r) => pris.filter((k) => RANG_CLASSE[classeDe(k)] === r)).filter((g) => g.length);
    let pas = 0;
    const chercher = (gi, reste, apres) => {
      if (++pas > 5000) throw new Error('circuit trop court');
      if (!reste.length) return gi + 1 >= groupes.length ? [] : chercher(gi + 1, groupes[gi + 1], apres);
      for (const produit of h.melanger(reste)) {
        for (const a of h.melanger(emplacementsDe(produit).filter((x) => rangCircuit(x) > apres))) {
          const suite = chercher(gi, reste.filter((k) => k !== produit), rangCircuit(a));
          if (suite) return [{ a, produit }, ...suite];
        }
      }
      return null;
    };
    lignes = chercher(0, groupes[0], -1);
    if (!lignes) throw new Error('circuit trop court');
  } else {
    lignes = pris.map((produit) => ({ a: h.choisir(emplacementsDe(produit)), produit }));
  }
  lignes.sort((x, y) => rangCircuit(x.a) - rangCircuit(y.a));
  let commun = -1;
  if (deux) {
    // La ligne commune, doublée juste après elle ; les autres lignes réparties moitié-moitié.
    commun = h.entier(0, lignes.length - 1);
    const paire = h.melanger([0, 1]);
    const autres = h.melanger([...Array(lignes.length - 1)].map((_, i) => i % 2));
    let k = 0;
    lignes.forEach((l, i) => { l.pour = i === commun ? paire[0] : autres[k++]; });
    lignes.splice(commun + 1, 0, { a: lignes[commun].a, produit: lignes[commun].produit, pour: paire[1] });
  }
  lignes.forEach((l) => { l.q = h.entier(o.qMin, o.qMax); });
  const estCommun = (i) => deux && (i === commun || i === commun + 1);
  // Le picking des lignes : de quoi servir (au moins q + minimum), sauf la ligne en rupture (vide, sous son minimum).
  const idx = lignes.map((_, i) => i);
  const vides = h.prendre(idx.filter((i) => aReserve(lignes[i].produit) && !estCommun(i)), o.vides);
  // Une ligne de remplacement possible : un autre emplacement du même produit, plus loin dans le circuit, avant la ligne suivante.
  const remplacantsDe = (i) => emplacementsDe(lignes[i].produit).filter((a) => a !== lignes[i].a && rangCircuit(a) > rangCircuit(lignes[i].a)
    && (!lignes[i + 1] || rangCircuit(a) < rangCircuit(lignes[i + 1].a)) && !lignes.some((m) => m.a === a));
  const abimes = h.prendre(idx.filter((i) => !estCommun(i) && !vides.some((v) => Math.abs(v - i) <= 1) && remplacantsDe(i).length), o.abimes);
  if (abimes.length < o.abimes) throw new Error('aucune ligne de remplacement');
  const picking = {};
  lignes.forEach((l, i) => {
    const min = minPicking(l.produit), q = lignes.filter((m) => m.a === l.a).reduce((t, m) => t + m.q, 0);
    if (!picking[l.a]) picking[l.a] = { q: vides.includes(i) ? 0 : Math.min(pleine(l.produit), q + min + h.entier(0, 12)), min };
  });
  const remplacements = {};
  abimes.forEach((i) => { remplacements[lignes[i].a] = h.choisir(remplacantsDe(i)); });
  // Les codes de contrôle : par allée, des nombres de 10 à 99 tous différents.
  const codes = {};
  ['A', 'B'].forEach((al) => {
    const ici = PICKING_TOUS.filter((a) => a[0] === al);
    const tires = h.prendre([...Array(90).keys()].map((x) => String(x + 10)), ici.length);
    ici.forEach((a, i) => { codes[a] = tires[i]; });
  });
  const num = String(h.entier(4100, 4899));
  return {
    magasin: magasin.id,
    num,
    ...(deux ? { magasins: h.melanger([magasin.id, NIMES.id]), nums: [num, String(Number(num) + h.entier(1, 40))] } : {}),
    quai: h.entier(1, 6),
    depart: `${h.choisir(['7', '8'])} h ${h.choisir(['00', '15', '30', '45'])}`,
    lignes,
    picking,
    vides: vides.map((i) => lignes[i].a),
    abimes: Object.fromEntries(abimes.map((i) => [lignes[i].a, 1])),
    remplacements,
    codes,
  };
}

// Les contraintes d'équité, en clair (liste vide = jeu conforme). Rejouées sur 300 graines par le bloc `preparation-vocale`.
export function verifierCommande(o, jeu) {
  const f = [];
  if (!jeu || !Array.isArray(jeu.lignes)) return ['jeu incomplet'];
  const L = jeu.lignes;
  const deux = o.magasins === 2;
  if (L.length !== o.lignes) f.push(`${L.length} lignes au lieu de ${o.lignes}`);
  if (!MAGASINS.some((m) => m.id === jeu.magasin) || (o.magasin && jeu.magasin !== o.magasin)) f.push('magasin inconnu');
  // Deux magasins : une seule paire de lignes du même produit, consécutives, à la même adresse, une pour chaque magasin.
  const paires = L.map((l, i) => i).filter((i) => i && L[i].a === L[i - 1].a);
  const attendu = deux ? 1 : 0;
  if (new Set(L.map((l) => l.produit)).size !== L.length - attendu) f.push('deux lignes du même produit');
  if (new Set(L.map((l) => l.a)).size !== L.length - attendu || paires.length !== attendu) f.push('deux lignes à la même adresse');
  if (deux) {
    if (!Array.isArray(jeu.magasins) || jeu.magasins.length !== 2 || !jeu.magasins.includes(NIMES.id) || jeu.magasins[0] === jeu.magasins[1]) f.push('les deux magasins (Nîmes et un autre)');
    if (paires.length === 1 && L[paires[0]].pour === L[paires[0] - 1].pour) f.push('la ligne commune pour un seul magasin');
    [0, 1].forEach((p) => {
      const M = L.filter((l) => l.pour === p), q = M.reduce((t, l) => t + l.q, 0);
      if (M.length !== o.lignes / 2) f.push(`magasin ${p + 1} : ${M.length} lignes`);
      if (q < 12 || q > 20) f.push(`magasin ${p + 1} : ${q} cartons (12 à 20)`);
    });
  }
  L.forEach((l, i) => {
    const d = decoupe(l.a);
    if (!d || d.n !== 1 || produitEn(l.a) !== l.produit) f.push(`ligne ${i + 1} : pas au picking de son produit`);
    if (!(l.q >= o.qMin && l.q <= o.qMax)) f.push(`ligne ${i + 1} : quantité hors de ${o.qMin} à ${o.qMax}`);
    if (i && rangCircuit(l.a) <= rangCircuit(L[i - 1].a) && !(deux && l.a === L[i - 1].a)) f.push(`ligne ${i + 1} : pas dans l'ordre du circuit`);
  });
  if (f.length) return f;
  if (L.filter((l) => classeDe(l.produit) === 'fragile').length !== o.fragiles) f.push('nombre de fragiles');
  if (L.filter((l) => classeDe(l.produit) === 'lourd').length < o.lourds) f.push('pas assez de lourds');
  // Chaque palette (une par magasin) : la bonne tient dans les limites ; l'ordre du circuit est favorable ou piège comme demandé.
  (deux ? [0, 1].map((p) => L.filter((l) => l.pour === p)) : [L]).forEach((LP) => {
    const terminal = palette(LP), bonne = palette(bonOrdre(LP));
    if (!bonne.lourds || !bonne.fragiles) f.push('la bonne palette casse une règle');
    if (bonne.poids > o.kgMax) f.push(`la bonne palette dépasse ${o.kgMax} kg`);
    if (bonne.hauteur > o.hMax + 1e-9) f.push(`la bonne palette dépasse ${o.hMax} m`);
    if (o.ordre === 'favorable' && !(terminal.lourds && terminal.fragiles)) f.push('ordre favorable : poser dans l’ordre du circuit casse une règle');
    if (o.ordre === 'piege' && !deux && terminal.lourds && terminal.fragiles) f.push('ordre piège : poser dans l’ordre du circuit ne casse aucune règle');
  });
  // Le picking : chaque ligne servie, sauf la rupture (sous son minimum, une réserve du même produit existe).
  L.forEach((l, i) => {
    const p = jeu.picking[l.a];
    if (!p) { f.push(`ligne ${i + 1} : picking absent`); return; }
    if (p.q > pleine(l.produit)) f.push(`ligne ${i + 1} : picking plus que plein`);
    const rupture = jeu.vides.includes(l.a);
    if (rupture && !(p.q < p.min && p.q < l.q && aReserve(l.produit))) f.push(`ligne ${i + 1} : rupture mal faite`);
    if (!rupture && p.q < L.filter((m) => m.a === l.a).reduce((t, m) => t + m.q, 0) + p.min) f.push(`ligne ${i + 1} : picking trop juste (le réapprovisionnement s'imposerait)`);
  });
  if (jeu.vides.length !== o.vides) f.push('nombre de lignes en rupture');
  const ab = Object.keys(jeu.abimes);
  if (ab.length !== o.abimes) f.push('nombre de cartons abîmés');
  ab.forEach((a) => {
    const i = L.findIndex((l) => l.a === a), r = jeu.remplacements[a];
    if (i < 0) { f.push('abîmé hors commande'); return; }
    if (jeu.vides.some((v) => Math.abs(L.findIndex((l) => l.a === v) - i) <= 1)) f.push('abîmé et rupture sur des lignes voisines');
    if (!r || produitEn(r) !== L[i].produit || r === a || L.some((l) => l.a === r)) f.push('ligne de remplacement fausse');
    else if (rangCircuit(r) <= rangCircuit(a) || (L[i + 1] && rangCircuit(r) >= rangCircuit(L[i + 1].a))) f.push('remplacement hors du sens du circuit');
  });
  const codesA = (al) => PICKING_TOUS.filter((a) => a[0] === al).map((a) => jeu.codes[a]);
  ['A', 'B'].forEach((al) => {
    const C = codesA(al);
    if (C.some((c) => !/^[1-9]\d$/.test(c || '')) || new Set(C).size !== C.length) f.push(`codes de contrôle de l'allée ${al}`);
  });
  return f;
}

// La déclaration d'un élève, en mode `preparation` du Plan d'entrepôt. `opts` : `id` (l'id de l'entrepôt, le même pour tous les élèves ;
// il entre aussi dans la graine), le tirage (`lignes`, `fragiles`, `lourds`, `abimes`, `vides`, `ordre`, `kgMax`, `hMax`, `magasin`), et ce
// que la séance passe tel quel (`libelle`, `personnage`, `regles`, `jalons`). Rend `(graine, { niveau, copie }) => déclaration`.
export function preparation(opts) {
  const o = Object.assign({}, DEFAUTS, opts);
  if (!o.id) throw new Error('action-prepa : il manque l’id de l’entrepôt');
  const DECL = { tirer: (h) => tirerCommande(o, h), verifier: (jeu) => verifierCommande(o, jeu), essais: 40 };
  DECL.secours = tirerJeu(Object.assign({}, DECL, { secours: null }), `secours-${o.id}`).jeu;
  if (!DECL.secours) throw new Error(`action-prepa (${o.id}) : le tirage ne donne aucune commande conforme (tirer et verifier se contredisent)`);
  const jeux = new Map();
  const jeuDe = (graine) => {
    const g = String(graine == null ? '' : graine);
    if (!jeux.has(g)) jeux.set(g, tirerJeu(DECL, `${g}|${o.id}`));
    return jeux.get(g);
  };
  const fn = (graine /* , { niveau, copie } : le tirage ne dépend pas encore du niveau (lot 0) */) => {
    const { jeu } = jeuDe(graine);
    const m = MAGASINS.find((x) => x.id === jeu.magasin);
    return {
      id: o.id, libelle: o.libelle || 'Préparer la commande', mode: 'preparation',
      ...(o.personnage ? { personnage: o.personnage } : {}),
      plan: Object.assign({}, PLAN, { zones: { quais: [quaiDe(jeu.quai)] } }),
      gammes: GAMMES, produits: PRODUITS, stock: STOCK,
      ...(o.regles ? { regles: o.regles } : {}),
      commande: Object.assign({
        num: jeu.num, client: m.nom, magasin: m.id, heure: jeu.depart, quai: quaiDe(jeu.quai), etiquette: m.court,
        hMax: o.hMax, kgMax: o.kgMax, support: { ...SUPPORT },
        lignes: jeu.lignes.map((l) => ({ a: l.a, produit: l.produit, q: l.q, ...(jeu.magasins ? { pour: l.pour } : {}) })),
      }, jeu.magasins ? (() => {
        // Deux magasins : une commande et une palette par magasin (`destinataires`, dans l'ordre de `pour`).
        const D = jeu.magasins.map((id, p) => { const x = MAGASINS.find((y) => y.id === id); return { magasin: id, client: x.nom, etiquette: x.court, num: jeu.nums[p] }; });
        return { destinataires: D, num: D.map((d) => d.num).join(' et '), client: D.map((d) => d.client).join(' et ') };
      })() : {}),
      picking: jeu.picking,
      // Lus par les lots 1 et 3 du chantier E-8 (le moteur du lot 0 ne les lit pas encore).
      codes: jeu.codes, abimes: jeu.abimes, remplacements: jeu.remplacements,
      ...(o.jalons ? { jalons: o.jalons } : {}),
      // Le terminal vocal (chantier E-8, lots 1-2) : sans lui, la préparation est celle de Smoby (bon papier, ENT-5.6).
      ...(o.terminal ? { terminal: o.terminal } : {}),
    };
  };
  fn.jeuDe = jeuDe;     // pour les tests et le côté enseignant : { jeu, essai, secours }
  fn.options = o;
  return fn;
}
