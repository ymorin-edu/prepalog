// ENT-9.2 — CHEP, « un retour à contrôler, une ramasse à organiser » : les DONNÉES de la séance (le tirage des piles et de la pièce
// `dernier`, le quai d'un élève, la tournée de ramasse, ce que l'élève a fait, les attendus calculés). Brief :
// `docs/briefs/ENT-9.2-chep-ramasse-et-retours.md` §6 et §6 bis ; règles de calcul : `docs/briefs/COORDINATION-chep.md` §4.
// Le contenu (textes, documents, messages, fiches, jalons) est dans `contenus/chep-ent92.js`.
//
// LE TIRAGE (une seule graine : l'identifiant de l'élève, posée par le moteur dans `db.tirage.graine` parce que le quai est une
// fonction de la graine, comme ENT-8.8). Tiré par élève : l'ORDRE des cinq histoires de piles (juste, manque, intrus, abîmées,
// double), m (1 ou 2 palettes manquantes), i (1 ou 2 palettes d'un autre pool, leur pool et leurs places, jamais en haut ni en bas de
// la pile), a (1 à 3 palettes abîmées, au moins une visible seulement de l'arrière), le pool et la place de l'intrus de la pile
// « double », le numéro du bon de collecte, la pièce `dernier` (celle des quatre plates-formes qui a signalé ses vides le plus tard)
// V (les vides de Frais du Nord, 390 à 400 par pas de 5) et, depuis le 18/10/2026, les vides des quatre plates-formes de la tournée
// (Douai 135 à 145, Prouvy 115 à 125, Roubaix 90 à 100, Dourges 65 à 75, par pas de 5 : `BORNES_VIDES`), tirés EN DERNIER pour que les
// autres tirages d'une même graine ne bougent pas. Un confirmé reçoit en plus une 6e pile (abîmées, deux dégâts tous deux
// visibles seulement de l'arrière), tirée chez TOUS (le générateur avance pareil) et ajoutée APRÈS les cinq : son socle est le même.
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : changer le tirage changerait les piles d'un élève qui a
// déjà commencé. Pas de tirage mémorisé (`declarerTirage`) : il aurait fallu inscrire la banque dans `BANQUES_FIGEES` du bloc de tests
// `tirage-niveaux`, hors du périmètre de la séance (dit au compte rendu du brief).
//
// LES QUANTITÉS DES QUATRE PLATES-FORMES de la tournée sont tirées par élève (§6.3), mêmes sites pour tous : depuis le 18/10/2026 la vue
// Tournée lit ses points dans la base de l'élève (`tournee.points: (db) => […]`, chantier MOTEUR-tournee-points-par-eleve). Les
// horaires, les distances et la capacité (390) sont les mêmes pour tous. V (Frais du Nord) n'est pas dans la tournée : il est tiré aussi.
//
// Aucun attendu n'est écrit en dur : les comptes des piles viennent de `comptePile` / `decisionPile` (le moteur du quai), les km, les
// heures, les charges et les créneaux de la vue Tournée elle-même (`creerTournee(…).bilan`), la capacité de 26 places × 15 palettes.

import { tirerJeu, graineDeBase, niveauEleve } from '../core/tirage.js';
import { comptePile, decisionPile } from '../core/types/quai.js';
import { creerTournee } from '../core/types/tournee.js';
import { CARTE } from './chep-carte.js';
import { DISTRIBUTEURS, TRANSPORTEUR } from './chep.js';

export const ID = 'chep-ramasse-retours';
export const ID_VOLET = 'chep-ent92';
export const QUAI_ID = 'chep-retours';            // `db.quais[<id>]` n'est pas cloisonné par séance : un id propre à CHEP
export const TOURNEE_ID = 'chep-ramasse';          // les gestes `tournee:chep-ramasse:envoyer` / `:reporter`
export const FICHES = { credit: 'credit', besoin: 'besoin' };
// Mardi 19 janvier 2027 (coordination §6) : 8 h au quai des retours, 14 h au bureau d'exploitation.
export const SCENARIO = { date: '2027-01-19', matin: '08:05', apresMidi: '14:02' };
export const EXPEDITEUR = DISTRIBUTEURS['opale-frais'];
export { TRANSPORTEUR };

// ─────────────────────────────────────────────────────────────── le camion de collecte (construit, coordination §2)
export const PLACES_SOL = 26;        // places au sol d'un semi pour des palettes 1 200 × 1 000
export const PILE_VIDES = 15;        // on empile les vides par 15 (et le bon annonce des piles de 15)
export const CAPACITE = PLACES_SOL * PILE_VIDES;
export const POIDS_PALETTE = 25;     // kg (fait vérifié de 2017 : Terra Nuna)
export const NB_PILES = 5;           // pièce fixe : cinq piles annoncées

// ─────────────────────────────────────────────────────────────── les piles (le quai)
export const HISTOIRES = ['juste', 'manque', 'intrus', 'abimees', 'double'];
export const POOLS_AUTRES = ['lpr', 'epal', 'logipal'];
export const FACES = ['N', 'S', 'E', 'W'];
export const FACES_ARRIERE = ['N', 'W'];   // invisibles de la vue de départ (S se voit aux vues 0 et 3, E aux vues 0 et 1)
const IDS_PILES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const entre = (a, b) => Array.from({ length: b - a + 1 }, (_, k) => a + k);

// ─────────────────────────────────────────────────────────────── la ramasse (§6.3)
const h = (hh, mm = 0) => hh * 60 + mm;
// Les plates-formes : id de la carte → distributeur de l'univers, horaires d'enlèvement des vides (construits, jeu B du 18/10/2026).
export const SITES = {
  lesquin: { dist: 'frais-nord', ville: 'Lesquin', horaire: [h(6), h(14)] },
  douai: { dist: 'halles-artois', ville: 'Douai', horaire: [h(9), h(12)] },
  prouvy: { dist: 'hainaut-primeurs', ville: 'Prouvy', horaire: [h(8), h(12)] },
  roubaix: { dist: 'marchelys', ville: 'Roubaix', horaire: [h(6), h(9)] },
  dourges: { dist: 'dourges', ville: 'Dourges', horaire: [h(9), h(12)] },
};
export const IDS_TOURNEE = ['douai', 'prouvy', 'roubaix', 'dourges'];
// Les vides de chaque plate-forme sont TIRÉS par élève (§6.3) : bornes (par pas de 5) et médianes (le témoin `@temoin…`, et l'instance de calcul `VUE` ci-dessous sur une base sans quantités ; la séance elle-même tire le jeu de la graine, même sur une base vide).
export const BORNES_VIDES = { douai: [135, 145], prouvy: [115, 125], roubaix: [90, 100], dourges: [65, 75] };
export const MEDIANES = { douai: 140, prouvy: 120, roubaix: 95, dourges: 70 };
export const nomSite = (id) => (SITES[id] ? DISTRIBUTEURS[SITES[id].dist].nom : id);
export const FRAIS = { id: 'lesquin', signale: '2027-01-18 07:40' };
// La banque `dernier` : quatre pièces, une par plate-forme ; chacune porte les dates et heures des quatre avis (construites), la
// plate-forme de la pièce ayant signalé le plus tard. Piège voulu dans `dr-roubaix` : un avis du lundi à 17 h 20 est plus tôt qu'un
// avis du mardi à 8 h 50 (comparer les jours, pas seulement les heures). JAMAIS de pièce supprimée ni renumérotée.
export const BANQUE_DERNIER = [
  { id: 'dr-douai', site: 'douai', signale: { prouvy: '2027-01-18 08:55', roubaix: '2027-01-18 11:20', dourges: '2027-01-18 15:05', douai: '2027-01-19 09:35' } },
  { id: 'dr-prouvy', site: 'prouvy', signale: { dourges: '2027-01-18 09:10', douai: '2027-01-18 13:45', roubaix: '2027-01-18 16:30', prouvy: '2027-01-19 10:15' } },
  { id: 'dr-roubaix', site: 'roubaix', signale: { douai: '2027-01-18 08:40', dourges: '2027-01-18 10:55', prouvy: '2027-01-18 17:20', roubaix: '2027-01-19 08:50' } },
  { id: 'dr-dourges', site: 'dourges', signale: { douai: '2027-01-18 09:10', prouvy: '2027-01-18 14:25', roubaix: '2027-01-18 16:50', dourges: '2027-01-19 10:40' } },
];
export const pieceDernier = (id) => BANQUE_DERNIER.find((p) => p.id === id) || null;
export const LIMITE_SIGNALEMENT = '2027-01-19 11:00';
const minutesDe = (s) => { const [d, t] = s.split(' '); const [a, m, j] = d.split('-').map(Number); const [hh, mm] = t.split(':').map(Number); return Date.UTC(a, m - 1, j, hh, mm) / 60000; };

/* ================================================================== le tirage */
function tirer(hz) {
  const ordre = hz.melanger(HISTOIRES);
  const m = hz.entier(1, 2);
  const i = hz.entier(1, 2);
  const poolI = hz.choisir(POOLS_AUTRES);
  const placesI = hz.prendre(entre(2, PILE_VIDES - 1), i).sort((x, y) => x - y);       // jamais en bas (1) ni en haut (15)
  const a = hz.entier(1, 3);
  const placesA = hz.prendre(entre(1, PILE_VIDES), a).sort((x, y) => x - y);
  const arriere = hz.choisir(placesA);
  const abimees = Object.fromEntries(placesA.map((n) => [n, n === arriere ? hz.choisir(FACES_ARRIERE) : hz.choisir(FACES)]));
  const poolD = hz.choisir(POOLS_AUTRES);
  const placeD = hz.entier(2, PILE_VIDES - 2);                                           // pile de 14 : ni le 1, ni le 14
  // La 6e pile du confirmé (tirée chez tous : le socle d'un confirmé est celui d'un standard).
  const places6 = hz.prendre(entre(1, PILE_VIDES), 2).sort((x, y) => x - y);
  const abimees6 = Object.fromEntries(places6.map((n) => [n, hz.choisir(FACES_ARRIERE)]));
  const bc = `BC-27-${String(hz.entier(100, 999)).padStart(4, '0')}`;
  const dernier = hz.choisir(BANQUE_DERNIER).id;
  const V = CAPACITE + 5 * hz.entier(0, 2);
  // Les vides des quatre plates-formes : tirés APRÈS tous les autres (les tirages d'une même graine ne bougent pas), trois valeurs chacun.
  const vides = {
    douai: BORNES_VIDES.douai[0] + 5 * hz.entier(0, 2), prouvy: BORNES_VIDES.prouvy[0] + 5 * hz.entier(0, 2),
    roubaix: BORNES_VIDES.roubaix[0] + 5 * hz.entier(0, 2), dourges: BORNES_VIDES.dourges[0] + 5 * hz.entier(0, 2),
  };
  return { ordre, m, i, poolI, placesI, a, abimees, poolD, placeD, abimees6, bc, dernier, V, vides };
}

// L'élève TÉMOIN du brief (§6.2, tests et corrigé) : P1 juste ; P2 à 14 ; P3 une LPR au n° 6 ; P4 deux abîmées (n° 4 face N, n° 11 face S) ;
// P5 à 14 avec une palette Europe au n° 9. Graine réservée `@temoin` (ou `@temoin-<pièce de dernier>`) : une vraie graine (identifiant de
// compte) ne commence jamais par « @ ».
export const TEMOIN = { ordre: ['juste', 'manque', 'intrus', 'abimees', 'double'], m: 1, i: 1, poolI: 'lpr', placesI: [6], a: 2,
  abimees: { 4: 'N', 11: 'S' }, poolD: 'epal', placeD: 9, abimees6: { 3: 'W', 12: 'N' }, bc: 'BC-27-0119', dernier: 'dr-dourges', V: 395,
  vides: { ...MEDIANES } };   // les médianes : un tirage possible, qui garde les valeurs écrites à la main des tests (425, 285, 305, 330, 355)

// Les piles d'un jeu (déclarations du quai). `confirme` : la 6e pile en plus.
export function pilesDe(jeu, { confirme = false } = {}) {
  const P = jeu.ordre.map((hist, k) => {
    const id = IDS_PILES[k];
    const base = { id, forme: 'pile', ref: 'CHEP-1210', nom: 'Palettes CHEP 1 200 × 1 000 vides', bl: PILE_VIDES,
      etiq: { ref: `${jeu.bc}-${id}`, nom: `BON DE COLLECTE — PILE ${id.slice(1)}`, poids: `${PILE_VIDES} palettes annoncées` } };
    if (hist === 'manque') return { ...base, hauteur: PILE_VIDES - jeu.m };
    if (hist === 'intrus') return { ...base, intrus: Object.fromEntries(jeu.placesI.map((n) => [n, jeu.poolI])) };
    if (hist === 'abimees') return { ...base, abimee: { ...jeu.abimees } };
    if (hist === 'double') return { ...base, hauteur: PILE_VIDES - 1, intrus: { [jeu.placeD]: jeu.poolD } };
    return base;
  });
  if (confirme) {
    const id = IDS_PILES[NB_PILES];
    P.push({ id, forme: 'pile', ref: 'CHEP-1210', nom: 'Palettes CHEP 1 200 × 1 000 vides', bl: PILE_VIDES, abimee: { ...jeu.abimees6 },
      etiq: { ref: `${jeu.bc}-${id}`, nom: `BON DE COLLECTE — PILE ${id.slice(1)}`, poids: `${PILE_VIDES} palettes annoncées` } });
  }
  return P;
}
// Les comptes d'un jeu (calculés par le moteur du quai, jamais écrits) : annoncées, reçues, autres pools, à créditer, à réparer, manquantes.
export function comptesDe(piles) {
  const C = piles.map(comptePile);
  const s = (k) => C.reduce((t, c) => t + c[k], 0);
  return { annoncees: s('bl'), recues: s('hauteur'), autres: s('intrus'), aCrediter: s('aCrediter'), reparation: s('aReparer'), manquantes: s('manquantes') };
}

/* ================================================================== la tournée de ramasse (déclaration de la vue, partagée) */
const libHoraire = ([a, b]) => `de ${Math.floor(a / 60)} h à ${Math.floor(b / 60)} h`;
export const horaireDit = (id) => libHoraire(SITES[id].horaire);
// Les points de la tournée : ceux de la carte (positions, rues), avec le nom typographique de l'univers et le créneau. Le quartier est
// retiré : la ligne du point dit l'horaire des vides (sinon la carte y met le nom du quartier). Les VIDES n'y sont pas : ils sont ceux de
// l'élève (`pointsDe`, `tournee.points(db)`) ; la carte se dessine depuis cette liste sans lire les quantités.
export const POINTS = CARTE.clients.filter((c) => IDS_TOURNEE.includes(c.id)).map((c) => ({
  ...c, quartier: null, nom: nomSite(c.id),
  zone: SITES[c.id].ville,
  creneau: { apres: SITES[c.id].horaire[0], avant: SITES[c.id].horaire[1], libelle: `enlèvement des vides ${horaireDit(c.id)}` },
}));
// Les points avec les vides d'un tirage : mêmes sites pour tous, valeurs de l'élève.
export const pointsDe = (vides) => POINTS.map((p) => ({ ...p, vides: vides[p.id] }));
export const HORAIRE = { depart: h(6), vitesse: 55, service: { base: 20, parColis: 0.05, champ: 'vides', unite: 'palette' } };
export const TOURNEE_BASE = {
  id: TOURNEE_ID,
  plan: { carte: CARTE, clients: POINTS },
  points: (db) => pointsDe(videsDeBase(db)),   // relue dans la base de l'élève à chaque dessin et par le bilan (moteur du 18/10/2026)
  mesures: [{ id: 'vides', libelle: 'Palettes vides à bord', unite: 'palettes', max: CAPACITE, depart: 0, reprend: 'vides',
    libelleDepasse: 'Le camion ne peut pas tout prendre' }],
  // `libelleRate` (18/10/2026) : un quai atteint après son heure d'enlèvement est « fermé », jamais « raté de N min ».
  horaire: { ...HORAIRE, libelleLimite: 'retour à Templemars', libelleRate: 'quai fermé à l’arrivée' },
  quai: { libelle: 'Reporter à vendredi', titre: 'Reportés à la tournée de vendredi', reprendre: 'remettre dans la tournée',
    vide: 'Aucun : les quatre sites sont dans la tournée.', max: 1 },
  departAQuai: true,
};
// La vue elle-même, pour les jalons, le contrôle d'équité, le corrigé et les tests : son bilan, pas un calcul parallèle.
// ⚠ INSTANCE DE CALCUL : sa « base » n'est qu'un petit objet `{ vides }` (les quatre quantités), pas la base d'un élève. Elle ne peut pas
// utiliser `TOURNEE_BASE.points` : celle-ci tire un jeu (`jeuDeBase` → `verifier` → `ordresDe` → cette instance) et la vue appelle
// `points({})` dès sa création, avant que l'instance existe. Sur `{}`, les médianes (jamais vues par un élève).
const VUE = creerTournee({ ...TOURNEE_BASE, points: (calc) => pointsDe((calc && calc.vides) || MEDIANES) });
const videsDeBase = (db) => jeuDeBase(db || {}).vides;
export const bilanTournee = (etat, db) => VUE.bilan(etat, { vides: videsDeBase(db) });
const etatDe = (ordre) => ({ ordre: ordre.map(String), quai: IDS_TOURNEE.filter((x) => !ordre.includes(x)), report: {}, juge: {}, valide: null });
export const bilanOrdre = (ordre, vides) => VUE.bilan(etatDe(ordre), { vides });
export const tientHoraires = (b) => !b.creneaux.some((c) => c.charge && c.trop === 'tard');
const permutations = (L) => (L.length <= 1 ? [L] : L.flatMap((x, i) => permutations([...L.slice(0, i), ...L.slice(i + 1)]).map((p) => [x, ...p])));
// Pour une pièce : les six ordres des trois sites restants, chacun avec ses km et s'il tient les horaires ; l'ordre au plus court.
const memo = new Map();
// Le jeu fournit la pièce `dernier` et les quatre quantités (mémo par pièce + quantités : trois valeurs par site, 324 combinaisons au plus).
const cleVides = (vides) => IDS_TOURNEE.map((id) => vides[id]).join(',');
export function ordresDe(jeu) {
  const cle = `${jeu.dernier}|${cleVides(jeu.vides)}`;
  if (memo.has(cle)) return memo.get(cle);
  const P = pieceDernier(jeu.dernier);
  const reste = IDS_TOURNEE.filter((x) => x !== P.site);
  const ordres = permutations(reste).map((o) => { const b = bilanOrdre(o, jeu.vides); return { ordre: o, km: b.km, tient: tientHoraires(b), pic: b.pics.vides }; });
  const court = ordres.slice().sort((x, y) => x.km - y.km)[0];
  const r = { reste, ordres, court, justes: ordres.filter((o) => o.tient), total: reste.reduce((t, id) => t + jeu.vides[id], 0) };
  memo.set(cle, r);
  return r;
}

/* ================================================================== le contrôle d'équité (§6.2 et §6.3) */
// Pour CES quantités (mémo par quantités) : les quatre sites ne tiennent pas dans un camion, l'ordre au plus court rate les horaires dans
// au moins deux pièces sur quatre, et chaque pièce garde au moins un ordre qui tient.
const ecartsBanque = new Map();
export function equiteBanque(vides) {
  const cle = cleVides(vides);
  if (ecartsBanque.has(cle)) return ecartsBanque.get(cle);
  const E = [];
  const tous = IDS_TOURNEE.reduce((t, id) => t + vides[id], 0);
  if (!(tous > CAPACITE)) E.push(`les quatre sites (${tous}) tiennent dans un camion : rien à reporter`);
  const O = BANQUE_DERNIER.map((p) => ordresDe({ dernier: p.id, vides }));
  const rates = O.filter((o) => !o.court.tient).length;
  if (rates < 2) E.push(`l’ordre au plus court tient les horaires dans ${4 - rates} pièces sur 4 : les horaires ne servent à rien`);
  BANQUE_DERNIER.forEach((p, k) => { if (!O[k].justes.length) E.push(`${p.id} : aucun ordre ne tient les horaires`); });
  if (new Set(BANQUE_DERNIER.map((p) => p.site)).size !== 4) E.push('la banque « dernier » ne couvre pas les quatre plates-formes');
  ecartsBanque.set(cle, E);
  return E;
}
export function verifier(jeu) {
  const vo = jeu && jeu.vides;
  const E = [];
  // Les vides des quatre plates-formes : chacun dans ses bornes, par pas de 5 (sinon on ne calcule rien dessus).
  const videsOk = !!vo && IDS_TOURNEE.every((id) => Number.isInteger(vo[id]) && vo[id] >= BORNES_VIDES[id][0] && vo[id] <= BORNES_VIDES[id][1] && vo[id] % 5 === 0);
  if (!videsOk) E.push(`les vides des quatre plates-formes ${vo ? IDS_TOURNEE.map((id) => `${id} ${vo[id]}`).join(', ') : '(absents)'} sont hors des bornes ou pas par pas de 5`);
  else E.push(...equiteBanque(vo));
  if (!jeu || !Array.isArray(jeu.ordre) || [...jeu.ordre].sort().join() !== [...HISTOIRES].sort().join()) return [...E, 'l’ordre des histoires n’est pas une permutation des cinq'];
  const piles = pilesDe(jeu);
  const D = piles.map(decisionPile);
  if (D.filter((d) => d.attendu === 'accepter').length !== 1) E.push('il faut une seule pile juste');
  const C = comptesDe(piles);
  if (C.aCrediter < 66 || C.aCrediter > 72) E.push(`à créditer ${C.aCrediter} hors de 66 à 72`);
  piles.forEach((p) => {
    const haut = p.hauteur === undefined ? p.bl : p.hauteur;
    Object.keys(p.intrus || {}).map(Number).forEach((n) => { if (n === haut || n === 1) E.push(`${p.id} : l’intrus n° ${n} est en haut ou en bas de la pile`); });
    Object.keys(p.intrus || {}).forEach((n) => { if ((p.abimee || {})[n]) E.push(`${p.id} : la palette ${n} est intruse et abîmée`); });
  });
  if (!Object.values(jeu.abimees).some((f) => FACES_ARRIERE.includes(f))) E.push('aucune palette abîmée visible seulement de l’arrière');
  if (!Object.values(jeu.abimees6).every((f) => FACES_ARRIERE.includes(f)) || Object.keys(jeu.abimees6).length !== 2) E.push('6e pile : deux dégâts, de l’arrière');
  if (!(jeu.V >= CAPACITE && jeu.V <= CAPACITE + 10)) E.push(`Frais du Nord : ${jeu.V} hors de ${CAPACITE} à ${CAPACITE + 10}`);
  if (!/^BC-27-\d{4}$/.test(jeu.bc)) E.push(`numéro de bon ${jeu.bc}`);
  const P = pieceDernier(jeu.dernier);
  if (!P) return [...E, `pièce « ${jeu.dernier} » inconnue`];
  // Les dates des avis : la plate-forme de la pièce a signalé le plus tard, toutes entre le lundi 18/01 et le mardi 19/01 à 11 h.
  const t = Object.fromEntries(IDS_TOURNEE.map((id) => [id, minutesDe(P.signale[id])]));
  if (IDS_TOURNEE.some((id) => id !== P.site && t[id] >= t[P.site])) E.push(`${P.id} : ${P.site} n’est pas le dernier à signaler`);
  if (IDS_TOURNEE.some((id) => t[id] < minutesDe('2027-01-18 00:00') || t[id] > minutesDe(LIMITE_SIGNALEMENT))) E.push(`${P.id} : un avis hors du lundi 18/01 au mardi 19/01 à 11 h`);
  if (minutesDe(FRAIS.signale) >= t[P.site]) E.push('Frais du Nord a signalé après le site reporté');
  if (!videsOk) return E;
  const O = ordresDe(jeu);
  if (!(O.total <= CAPACITE)) E.push(`${P.id} : sans ${P.site}, ${O.total} palettes ne tiennent pas dans ${CAPACITE}`);
  if (!O.justes.length) E.push(`${P.id} : aucun ordre ne tient les horaires`);
  return E;
}
const DECL = { tirer, verifier, essais: 40 };
DECL.secours = TEMOIN;
export const TIRAGE = DECL;

// Le jeu d'une graine ('' : le jeu de référence, vu par l'enseignant ; `@temoin…` : l'élève témoin), toujours le même pour la même graine.
const jeux = new Map();
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (g.startsWith('@temoin')) {
    const piece = g.slice('@temoin-'.length);
    return { ...TEMOIN, ...(pieceDernier(piece) ? { dernier: piece } : {}) };
  }
  if (!jeux.has(g)) jeux.set(g, tirerJeu(TIRAGE, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const tirageDe = (graine) => tirerJeu(TIRAGE, `${String(graine == null ? '' : graine)}|${ID}`);
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));
export const confirme = (db) => niveauEleve(db) === 'confirme';
export const pilesDeBase = (db) => pilesDe(jeuDeBase(db), { confirme: confirme(db) });
export const dernierDe = (db) => pieceDernier(jeuDeBase(db).dernier);

/* ================================================================== ce que l'élève a fait (lu sans corriger) */
// Une saisie, telle que tapée → un nombre ou NaN (même lecture que `lireNombre` de la fiche, recopiée pour ne pas tirer l'écran).
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
export const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
export const quaiClos = (db) => !!(etatQuai(db) && etatQuai(db).fini);
// Ce que l'élève a constaté sur une pile : son compte, sa décision, et pour chaque motif coché sa quantité (0 si le motif n'est pas
// coché ; une valeur qui n'est pas un nombre compte 0 : il n'a rien chiffré).
export function constats(db, pid) {
  const s = (etatQuai(db) && etatQuai(db).palettes && etatQuai(db).palettes[pid]) || {};
  const q = (m) => { const v = s.motif === m ? s.res : s.motif2 === m ? s.res2 : null; if (v == null) return null; const n = lireNombre(v); return Number.isFinite(n) ? n : 0; };
  const motifs = [s.motif, s.motif2].filter((m) => m && m !== 'aucun');
  return { valide: !!s.valide, compte: Number.isFinite(s.compte) ? s.compte : null, decision: s.decision || '', motifs,
    manquant: q('manquant'), avarie: q('avarie'), produit: q('produit') };
}
// Le crédit attendu D'APRÈS SON CONTRÔLE (règle « une erreur ne se paie qu'une fois ») : pour chaque pile de son quai, son compte moins
// ses palettes d'un autre pool ; hors pool = ses palettes d'un autre pool ; réparation = ses palettes abîmées.
export function creditDeSonControle(db) {
  return pilesDeBase(db).reduce((t, p) => {
    const c = constats(db, p.id);
    return { aCrediter: t.aCrediter + (c.compte || 0) - (c.produit || 0), horsPool: t.horsPool + (c.produit || 0), reparation: t.reparation + (c.avarie || 0) };
  }, { aCrediter: 0, horsPool: 0, reparation: 0 });
}
// Une fiche de l'élève : `{ envoye, deja, v }` (v = ses valeurs ; `deja` = envoyée au moins une fois, même rouverte par « Corriger »).
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), deja: !!(f && (f.envoye || f.envois)), v: (f && f.valeurs) || {} };
}
export const dejaEnvoyee = (id) => (db) => fiche(db, id).deja;
// La tournée de l'élève : son état (rangé par la vue sous `db.transport[<séance>].tournee`), envoyée ou non, et son bilan.
export const etatTournee = (db) => (db && db.transport && db.transport[ID] && db.transport[ID].tournee) || null;
export function tourneeEnvoyee(db) {
  const e = etatTournee(db);
  if (!e || !e.termine || !Array.isArray(e.ordre)) return null;
  return { e, b: bilanTournee({ ordre: e.ordre, quai: Array.isArray(e.quai) ? e.quai : [], report: {}, juge: {}, valide: null, phase: e.phase }, db) };
}
