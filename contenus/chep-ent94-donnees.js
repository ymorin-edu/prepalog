// ENT-9.4 — CHEP, évaluation « la semaine de Légumes de la Lys » : les DONNÉES de la séance (le tirage des trois parties, les documents de la
// semaine, les piles du retour, la ramasse, ce que l'élève a fait, les attendus calculés). Brief : `docs/briefs/ENT-9.4-chep-evaluation.md` §6
// et §6 bis ; règles de calcul : `docs/briefs/COORDINATION-chep.md` §4. Le contenu (textes, documents, fiches, quai, tournée, messages, jalons)
// est dans `contenus/chep-ent94.js`.
//
// L'évaluation REPREND LES ÉCRANS d'ENT-9.1 et d'ENT-9.2 SANS AIDE, par leurs fabriques (jamais recopiés) : la grille du relevé
// (`fabriqueReleve`, chep-ent91-donnees.js), les piles (`pilesDe`, `comptesDe`, `constatsDe`, `creditDe`), la tournée (`tourneeChep`,
// `pointsCarte`) et son calcul (`fabriqueRamasse`, chep-ent92-donnees.js).
//
// LE TIRAGE (une seule graine : l'identifiant de l'élève, posée par le moteur dans `db.tirage.graine` parce que le quai est une fonction de la
// graine, comme ENT-9.2). Tiré par élève, dans cet ordre (ne JAMAIS changer l'ordre des tirages : le jeu d'un élève commencé changerait) :
//   A — S0 (120 à 180, pas de 5), E (140 à 200, pas de 20), T (20 à 24), la pièce `partiel` et son total N (18 à 22, dont 2 à 5 Europe ou
//       LPR), la pièce `nonMouvement` (16 à 20 palettes Europe vers Frais du Nord, ou une commande de 200 à 260 palettes), l'ordre des quatre
//       documents ;
//   B — l'ordre des quatre histoires de piles (juste, manque, intrus, abîmées), m (1 ou 2 manquantes), i (1 ou 2 palettes d'un autre pool, leur
//       pool et leurs places, jamais en haut ni en bas), a (1 ou 2 abîmées, au moins une visible seulement de l'arrière), le n° du bon ;
//   C — la pièce `dernier` (la plate-forme de la tournée qui a signalé le plus tard), V (les vides de MarchéLys, 390 à 400 : le camion complet),
//       les vides des quatre plates-formes de la tournée (par pas de 5 : Lesquin 125 à 135, Douai 105 à 115, Prouvy 95 à 105, Dourges 70 à 80).
// Pas de tirage mémorisé (`declarerTirage`) : comme ENT-9.2, le jeu est une fonction de la graine et de ce fichier.
// ⚠ Ne pas toucher aux tirages ni aux banques entre l'ouverture de l'évaluation et le ramassage : le jeu des élèves changerait (cas « jeu figé »
// du bloc `chep-94`, deux élèves réels écrits à la main).
//
// Aucun attendu n'est écrit en dur : le solde par `solde` de l'univers, les comptes des piles par `comptePile` (le moteur du quai), les km, les
// heures et les charges par la vue Tournée elle-même.

import { tirerJeu, graineDeBase } from '../core/tirage.js';
import { comptePile, decisionPile } from '../core/types/quai.js';
import { creerTournee } from '../core/types/tournee.js';
import { EMETTEURS, DISTRIBUTEURS, CENTRE, solde } from './chep.js';
import { fiche, declaration, lireNombre, fabriqueReleve, caseSolde, caseEntree, caseSortie } from './chep-ent91-donnees.js';
import { pilesDe, comptesDe, constatsDe, creditDe, pointsCarte, tourneeChep, fabriqueRamasse, tientHoraires, CAPACITE, PLACES_SOL, PILE_VIDES,
  POOLS_AUTRES, FACES, FACES_ARRIERE, libHoraire, SITES as SITES_92 } from './chep-ent92-donnees.js';

export { fiche, declaration, lireNombre, caseSolde, caseEntree, caseSortie, CAPACITE, PLACES_SOL, PILE_VIDES, comptesDe, tientHoraires };

export const ID = 'chep-evaluation';
export const ID_VOLET = 'chep-ent94';
export const QUAI_ID = 'chep-retours-eval';       // `db.quais[<id>]` n'est pas cloisonné par séance : un id propre à ENT-9.4
export const TOURNEE_ID = 'chep-ramasse-eval';     // les gestes `tournee:chep-ramasse-eval:envoyer` / `:reporter`
export const FICHES = { decl: 'decl', releve: 'releve', credit: 'credit', besoin: 'besoin' };
export const BLOC_COMPTE = 'compte';
// Lundi 1er février 2027 (coordination §6) ; la semaine du relevé : du lundi 25 au vendredi 29/01 ; la ramasse : jeudi 04/02.
export const SCENARIO = { date: '2027-02-01', heure: '07:50' };
export const SEMAINE = { debut: '2027-01-25', fin: '2027-01-29' };
export const RAMASSE = '2027-02-04';
export const CLIENT = EMETTEURS.lys;              // compte LL-59-0882 (celui de l'univers : le brief écrivait LL-59-0233)
export const EXPEDITEUR = DISTRIBUTEURS['halles-artois'];
const entre = (a, b) => Array.from({ length: b - a + 1 }, (_, k) => a + k);
const permutations = (L) => (L.length <= 1 ? [L] : L.flatMap((x, i) => permutations([...L.slice(0, i), ...L.slice(i + 1)]).map((p) => [x, ...p])));

/* ================================================================== A — les déclarations et le relevé */
// Les blocs de la fiche « déclarations », par RÔLE de document (stables d'un élève à l'autre : les gestes sont publiés sur base vide).
export const ROLES = ['emission', 'transfert', 'partiel', 'nonmvt'];
const FIXES = ['emission', 'transfert'];
export const PARTENAIRES = [
  { v: CENTRE.id, lib: CENTRE.lib },
  ...['frais-nord', 'halles-artois', 'hainaut-primeurs', 'marchelys', 'dourges'].map((k) => ({ v: k, lib: DISTRIBUTEURS[k].lib })),
  { v: 'aucun', lib: 'Aucun' },
];
// Les banques (JAMAIS de pièce supprimée ni renumérotée).
export const BANQUE_PARTIEL = [
  { id: 'pa-europe', iso: '2027-01-28', a: 'hainaut-primeurs', autres: 'europe' },
  { id: 'pa-lpr', iso: '2027-01-29', a: 'marchelys', autres: 'lpr' },
];
export const BANQUE_NON_MOUVEMENT = [
  { id: 'nm-europe', iso: '2027-01-28', a: 'frais-nord' },
  { id: 'nm-commande', iso: '2027-01-29', livraison: '2027-02-02' },
];
// L'ordre des quatre documents : une permutation des rôles où les deux documents fixes ne sont jamais tous les deux en tête.
export const ordreValide = (perm) => !perm.slice(0, 2).every((r) => FIXES.includes(r));
export const PERMUTATIONS = permutations(ROLES).filter(ordreValide);
const indexOrdre = (L) => PERMUTATIONS.findIndex((p) => p.join() === L.join());
// Les numéros (construits, les mêmes pour tous : ce sont les quantités qui changent).
export const NUMEROS = { emission: 'EM-27-01312', transfert: 'BL-LL-27-0144', 'pa-europe': 'BL-LL-27-0147', 'pa-lpr': 'BL-LL-27-0149',
  'nm-europe': 'BL-LL-27-0148', 'nm-commande': 'CMD-LL-27-0009' };
// Les lignes de marchandise d'un bordereau de légumes (construites : poireaux et carottes en colis, 60 colis par palette).
const lignesLegumes = (n) => {
  const total = n * 60, a = Math.round(total * 0.5);
  return [{ designation: 'Poireaux, cat. I, colis de 5 kg', colis: a, poids: a * 5 },
    { designation: 'Carottes lavées, cat. I, colis de 10 kg', colis: total - a, poids: (total - a) * 10 }];
};
function documentsA(V) {
  const pp = BANQUE_PARTIEL.find((p) => p.id === V.partiel) || BANQUE_PARTIEL[0];
  const pn = BANQUE_NON_MOUVEMENT.find((p) => p.id === V.nonMvt) || BANQUE_NON_MOUVEMENT[0];
  const c = V.n - V.autres;
  const D = {
    emission: { role: 'emission', piece: 'emission', genre: 'emission', iso: '2027-01-26', numero: NUMEROS.emission, qte: V.e,
      attendu: { type: 'emission', part: CENTRE.id, qte: V.e } },
    transfert: { role: 'transfert', piece: 'transfert', genre: 'bordereau', iso: '2027-01-27', numero: NUMEROS.transfert, a: 'dourges',
      supports: { chep: V.t }, lignes: lignesLegumes(V.t), attendu: { type: 'transfert', part: 'dourges', qte: V.t } },
    partiel: { role: 'partiel', piece: pp.id, genre: 'bordereau', iso: pp.iso, numero: NUMEROS[pp.id], a: pp.a, supports: { chep: c, [pp.autres]: V.autres },
      total: V.n, autres: pp.autres, lignes: lignesLegumes(V.n), attendu: { type: 'transfert', part: pp.a, qte: c } },
    nonmvt: pn.id === 'nm-europe'
      ? { role: 'nonmvt', piece: pn.id, genre: 'bordereau', iso: pn.iso, numero: NUMEROS[pn.id], a: pn.a, supports: { europe: V.nmEurope }, total: V.nmEurope,
        lignes: lignesLegumes(V.nmEurope), attendu: { type: 'aucun', part: 'aucun', qte: 0 } }
      : { role: 'nonmvt', piece: pn.id, genre: 'commande', iso: pn.iso, numero: NUMEROS[pn.id], qte: V.nmCommande, livraison: pn.livraison,
        attendu: { type: 'aucun', part: 'aucun', qte: 0 } },
  };
  const perm = PERMUTATIONS[Math.min(Math.max(0, V.ordreDocs | 0), PERMUTATIONS.length - 1)];
  return perm.map((role, i) => ({ ...D[role], lettre: 'ABCD'[i], id: `doc-${'abcd'[i]}` }));
}
// La partie A d'un jeu : les documents dans l'ordre de l'élève (A à D), le solde attendu (S0 + E − T − C).
export function partieA(jeu) {
  const documents = documentsA(jeu);
  const parRole = Object.fromEntries(documents.map((d) => [d.role, d]));
  return { valeurs: jeu, piecePartiel: parRole.partiel.piece, pieceNonMvt: parRole.nonmvt.piece, documents, parRole, s0: jeu.s0,
    solde: solde({ depart: jeu.s0, emissions: jeu.e, transferts: [jeu.t, parRole.partiel.attendu.qte] }) };
}
export function ecartsA(jeu) {
  const E = [];
  const J = partieA(jeu), P = J.parRole;
  if (!(jeu.s0 >= 120 && jeu.s0 <= 180 && jeu.s0 % 5 === 0)) E.push(`S0 ${jeu.s0} hors de 120 à 180 par 5`);
  if (![140, 160, 180, 200].includes(jeu.e)) E.push(`E ${jeu.e} hors de 140 à 200 par 20`);
  if (!(jeu.t >= 20 && jeu.t <= 24)) E.push(`T ${jeu.t} hors de 20 à 24`);
  if (!(jeu.n >= 18 && jeu.n <= 22) || !(jeu.autres >= 2 && jeu.autres <= 5)) E.push(`partiel ${jeu.n} dont ${jeu.autres} hors bornes`);
  if (!(P.partiel.attendu.qte > 0 && P.partiel.attendu.qte < P.partiel.total)) E.push('document partiel : pas de mélange');
  // Aucune quantité déclarée égale à une autre du même jeu (sinon un piège se confond avec la bonne réponse) : E, T, le total du partiel et
  // ses palettes CHEP ; les pièges de type ne doivent valoir que ce qu'ils n'imitent pas (comme ENT-9.1).
  const q = [jeu.e, jeu.t, jeu.n, P.partiel.attendu.qte];
  if (new Set(q).size !== q.length) E.push(`deux quantités égales : ${q.join(', ')}`);
  if (P.nonmvt.genre === 'commande' && jeu.nmCommande === jeu.e) E.push('la commande vaut l’émission');
  if (P.nonmvt.genre !== 'commande' && jeu.nmEurope === jeu.n) E.push('les palettes Europe seules valent le total du partiel');
  if (P.nonmvt.supports && P.nonmvt.supports.chep) E.push('le document sans mouvement porte des palettes CHEP');
  if (!ordreValide(J.documents.map((d) => d.role))) E.push('les deux documents fixes sont en tête');
  return E;
}

/* ================================================================== B — le retour de Halles d'Artois (quatre piles de 15) */
export const HISTOIRES = ['juste', 'manque', 'intrus', 'abimees'];
export const NB_PILES = HISTOIRES.length;
export const pilesDuJeu = (jeu) => pilesDe(jeu);   // la fabrique de 9.2 : sans la pile « double » ni la 6e du confirmé
export function ecartsB(jeu) {
  const E = [];
  if (!Array.isArray(jeu.ordre) || [...jeu.ordre].sort().join() !== [...HISTOIRES].sort().join()) return ['l’ordre des histoires n’est pas une permutation des quatre'];
  const piles = pilesDuJeu(jeu);
  if (piles.map(decisionPile).filter((d) => d.attendu === 'accepter').length !== 1) E.push('il faut une seule pile juste');
  const C = comptesDe(piles);
  if (C.annoncees !== 60) E.push(`annoncées ${C.annoncees} au lieu de 60`);
  if (C.aCrediter < 56 || C.aCrediter > 58) E.push(`à créditer ${C.aCrediter} hors de 56 à 58`);
  if (![1, 2].includes(jeu.m) || ![1, 2].includes(jeu.i) || ![1, 2].includes(jeu.a)) E.push('m, i ou a hors de 1 à 2');
  piles.forEach((p) => {
    const haut = p.hauteur === undefined ? p.bl : p.hauteur;
    Object.keys(p.intrus || {}).map(Number).forEach((n) => { if (n === haut || n === 1) E.push(`${p.id} : l’intrus n° ${n} est en haut ou en bas de la pile`); });
  });
  if (!Object.values(jeu.abimees).some((f) => FACES_ARRIERE.includes(f))) E.push('aucune palette abîmée visible seulement de l’arrière');
  if (!/^BC-27-\d{4}$/.test(jeu.bc)) E.push(`numéro de bon ${jeu.bc}`);
  return E;
}

/* ================================================================== C — la ramasse du jeudi 04/02 */
const h = (hh, mm = 0) => hh * 60 + mm;
// Les horaires d'enlèvement des vides (brief §6.3, construits) : AUCUN n'est celui d'ENT-9.2, et le camion complet n'est plus Frais du Nord.
export const SITES = {
  roubaix: { dist: 'marchelys', ville: 'Roubaix', horaire: [h(6), h(14)] },
  lesquin: { dist: 'frais-nord', ville: 'Lesquin', horaire: [h(13), h(17)] },
  douai: { dist: 'halles-artois', ville: 'Douai', horaire: [h(6), h(9, 30)] },
  prouvy: { dist: 'hainaut-primeurs', ville: 'Prouvy', horaire: [h(9), h(13)] },
  dourges: { dist: 'dourges', ville: 'Dourges', horaire: [h(7), h(12)] },
};
export const SITES_ENT92 = SITES_92;   // pour le cas « diffère de 9.2 » du bloc de tests
export const COMPLET = 'roubaix';      // MarchéLys : au moins 390 vides, un camion complet à lui seul
export const IDS_TOURNEE = ['lesquin', 'douai', 'prouvy', 'dourges'];
export const IDS_SITES = ['roubaix', ...IDS_TOURNEE];
export const nomSite = (id) => (SITES[id] ? DISTRIBUTEURS[SITES[id].dist].nom : id);
export const horaireDit = (id) => libHoraire(SITES[id].horaire);
export const BORNES_VIDES = { lesquin: [125, 135], douai: [105, 115], prouvy: [95, 105], dourges: [70, 80] };
export const MEDIANES = { lesquin: 130, douai: 110, prouvy: 100, dourges: 75 };
export const COMPLET_SIGNALE = '2027-01-29 07:40';
// La banque `dernier` : quatre pièces, une par plate-forme de la tournée, avec les dates et heures des quatre avis (construites) ; la
// plate-forme de la pièce a signalé le plus tard. Piège voulu dans `dr-prouvy` : un avis du vendredi à 17 h 25 est plus tôt qu'un avis du
// lundi à 7 h 10 (comparer les jours, pas seulement les heures). JAMAIS de pièce supprimée ni renumérotée.
export const BANQUE_DERNIER = [
  { id: 'dr-lesquin', site: 'lesquin', signale: { douai: '2027-01-29 08:50', prouvy: '2027-01-29 11:15', dourges: '2027-01-29 15:40', lesquin: '2027-02-01 07:35' } },
  { id: 'dr-douai', site: 'douai', signale: { prouvy: '2027-01-29 09:05', dourges: '2027-01-29 13:30', lesquin: '2027-01-29 16:45', douai: '2027-02-01 07:20' } },
  { id: 'dr-prouvy', site: 'prouvy', signale: { dourges: '2027-01-29 08:40', douai: '2027-01-29 10:20', lesquin: '2027-01-29 17:25', prouvy: '2027-02-01 07:10' } },
  { id: 'dr-dourges', site: 'dourges', signale: { douai: '2027-01-29 09:15', lesquin: '2027-01-29 14:05', prouvy: '2027-01-29 16:20', dourges: '2027-02-01 07:45' } },
];
export const pieceDernier = (id) => BANQUE_DERNIER.find((p) => p.id === id) || null;
export const PREMIER_SIGNALEMENT = '2027-01-29 00:00';
export const LIMITE_SIGNALEMENT = '2027-02-01 07:50';   // avant le message de Sandrine
export const minutesDe = (s) => { const [d, t] = s.split(' '); const [a, m, j] = d.split('-').map(Number); const [hh, mm] = t.split(':').map(Number); return Date.UTC(a, m - 1, j, hh, mm) / 60000; };
// Les points de la tournée (ceux de la carte, sans quantité) et les points avec les vides d'un tirage.
export const POINTS = pointsCarte(SITES, IDS_TOURNEE);
export const pointsDe = (vides) => POINTS.map((p) => ({ ...p, vides: vides[p.id] }));
export const TOURNEE_BASE = tourneeChep({ id: TOURNEE_ID, clients: POINTS, points: (db) => pointsDe(jeuDeBase(db || {}).vides) });
// L'instance de calcul de la vue (sa « base » n'est que `{ vides }` : voir le même avertissement dans chep-ent92-donnees.js).
const VUE = creerTournee({ ...TOURNEE_BASE, points: (calc) => pointsDe((calc && calc.vides) || MEDIANES) });
const CALCUL = fabriqueRamasse({ vue: VUE, ids: IDS_TOURNEE, banque: BANQUE_DERNIER, capacite: CAPACITE });
export const { bilanOrdre, ordresDe, equiteBanque } = CALCUL;
export const bilanTournee = (etat, db) => VUE.bilan(etat, { vides: jeuDeBase(db || {}).vides });
export function ecartsC(jeu) {
  const vo = jeu && jeu.vides;
  const E = [];
  const videsOk = !!vo && IDS_TOURNEE.every((id) => Number.isInteger(vo[id]) && vo[id] >= BORNES_VIDES[id][0] && vo[id] <= BORNES_VIDES[id][1] && vo[id] % 5 === 0);
  if (!videsOk) E.push(`les vides des quatre plates-formes ${vo ? IDS_TOURNEE.map((id) => `${id} ${vo[id]}`).join(', ') : '(absents)'} sont hors des bornes ou pas par pas de 5`);
  else E.push(...equiteBanque(vo));
  if (!(jeu.V >= CAPACITE && jeu.V <= CAPACITE + 10 && jeu.V % 5 === 0)) E.push(`MarchéLys : ${jeu.V} hors de ${CAPACITE} à ${CAPACITE + 10}`);
  const P = pieceDernier(jeu.dernier);
  if (!P) return [...E, `pièce « ${jeu.dernier} » inconnue`];
  const t = Object.fromEntries(IDS_TOURNEE.map((id) => [id, minutesDe(P.signale[id])]));
  if (IDS_TOURNEE.some((id) => id !== P.site && t[id] >= t[P.site])) E.push(`${P.id} : ${P.site} n’est pas le dernier à signaler`);
  if (IDS_TOURNEE.some((id) => t[id] < minutesDe(PREMIER_SIGNALEMENT) || t[id] > minutesDe(LIMITE_SIGNALEMENT))) E.push(`${P.id} : un avis hors du vendredi 29/01 au lundi 01/02 à 7 h 50`);
  if (minutesDe(COMPLET_SIGNALE) >= t[P.site]) E.push('MarchéLys a signalé après le site reporté');
  if (!videsOk) return E;
  const O = ordresDe(jeu);
  if (!(O.total <= CAPACITE)) E.push(`${P.id} : sans ${P.site}, ${O.total} palettes ne tiennent pas dans ${CAPACITE}`);
  if (!O.justes.length) E.push(`${P.id} : aucun ordre ne tient les horaires`);
  return E;
}

/* ================================================================== le tirage (une graine, trois parties) */
function tirer(hz) {
  // A
  const s0 = 120 + 5 * hz.entier(0, 12), e = 140 + 20 * hz.entier(0, 3), t = hz.entier(20, 24);
  const partiel = hz.choisir(BANQUE_PARTIEL).id, n = hz.entier(18, 22), autres = hz.entier(2, 5);
  const nonMvt = hz.choisir(BANQUE_NON_MOUVEMENT).id, nmEurope = hz.entier(16, 20), nmCommande = 200 + 10 * hz.entier(0, 6);
  const ordreDocs = hz.entier(0, PERMUTATIONS.length - 1);
  // B
  const ordre = hz.melanger(HISTOIRES);
  const m = hz.entier(1, 2), i = hz.entier(1, 2);
  const poolI = hz.choisir(POOLS_AUTRES);
  const placesI = hz.prendre(entre(2, PILE_VIDES - 1), i).sort((x, y) => x - y);        // jamais en bas (1) ni en haut (15)
  const a = hz.entier(1, 2);
  const placesA = hz.prendre(entre(1, PILE_VIDES), a).sort((x, y) => x - y);
  const arriere = hz.choisir(placesA);
  const abimees = Object.fromEntries(placesA.map((k) => [k, k === arriere ? hz.choisir(FACES_ARRIERE) : hz.choisir(FACES)]));
  const bc = `BC-27-${String(hz.entier(100, 999)).padStart(4, '0')}`;
  // C
  const dernier = hz.choisir(BANQUE_DERNIER).id;
  const V = CAPACITE + 5 * hz.entier(0, 2);
  const vides = Object.fromEntries(IDS_TOURNEE.map((id) => [id, BORNES_VIDES[id][0] + 5 * hz.entier(0, 2)]));
  return { s0, e, t, partiel, n, autres, nonMvt, nmEurope, nmCommande, ordreDocs, ordre, m, i, poolI, placesI, a, abimees, bc, dernier, V, vides };
}
export const verifier = (jeu) => [...ecartsA(jeu), ...ecartsB(jeu), ...ecartsC(jeu)];
// L'élève TÉMOIN du brief (§6), écrit à la main : A S0 150, E 180, T 22, `pa-lpr` 20 dont 16 CHEP, `nm-commande` → solde 292 ; B P1 un Logipal au
// n° 8, P2 juste, P3 une abîmée au n° 5 (face gauche, vue de l'arrière), P4 à 13 → reçues 58, autre pool 1, à créditer 57, réparation 1,
// manquantes 2 ; C les médianes (130, 110, 100, 75), MarchéLys 395. Graine réservée `@temoin` (ou `@temoin-<pièce de dernier>`) : une vraie graine
// (identifiant de compte) ne commence jamais par « @ ».
export const TEMOIN = { s0: 150, e: 180, t: 22, partiel: 'pa-lpr', n: 20, autres: 4, nonMvt: 'nm-commande', nmEurope: 18, nmCommande: 240,
  ordreDocs: indexOrdre(['emission', 'partiel', 'transfert', 'nonmvt']),
  ordre: ['intrus', 'juste', 'abimees', 'manque'], m: 2, i: 1, poolI: 'logipal', placesI: [8], a: 1, abimees: { 5: 'W' }, bc: 'BC-27-0204',
  dernier: 'dr-dourges', V: 395, vides: { ...MEDIANES } };
// Un second témoin (graine `@temoin2`) : S0 135, E 200, T 24, `pa-europe` 22 dont 17 CHEP, `nm-europe` → solde 294 ; P2 à 13, deux intrus LPR
// aux n° 5 et 11 (P3), deux abîmées (P4 : n° 3 face avant, n° 12 face arrière) → reçues 58, à créditer 56, réparation 2, manquantes 2 ; Douai a signalé le plus tard.
export const TEMOIN_2 = { ...TEMOIN, s0: 135, e: 200, t: 24, partiel: 'pa-europe', n: 22, autres: 5, nonMvt: 'nm-europe', nmEurope: 16,
  ordreDocs: indexOrdre(['nonmvt', 'transfert', 'partiel', 'emission']),
  ordre: ['juste', 'manque', 'intrus', 'abimees'], m: 2, i: 2, poolI: 'lpr', placesI: [5, 11], a: 2, abimees: { 3: 'S', 12: 'N' }, bc: 'BC-27-0371',
  dernier: 'dr-douai' };
export const TIRAGE_94 = { tirer, verifier, essais: 40, secours: TEMOIN };

const jeux = new Map();
// Le jeu d'une graine ('' : le jeu de référence, vu par l'enseignant ; `@temoin…` : les élèves témoins), toujours le même pour la même graine.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (g.startsWith('@temoin2')) return { ...TEMOIN_2 };
  if (g.startsWith('@temoin')) {
    const piece = g.slice('@temoin-'.length);
    return { ...TEMOIN, ...(pieceDernier(piece) ? { dernier: piece } : {}) };
  }
  if (!jeux.has(g)) jeux.set(g, tirerJeu(TIRAGE_94, `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const tirageDe = (graine) => tirerJeu(TIRAGE_94, `${String(graine == null ? '' : graine)}|${ID}`);
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));
export const jeuEleve = (db) => partieA(jeuDeBase(db || {}));     // la partie A, lue par la grille du relevé
export const pilesDeBase = (db) => pilesDuJeu(jeuDeBase(db || {}));
export const dernierDe = (db) => pieceDernier(jeuDeBase(db || {}).dernier);

/* ================================================================== ce que l'élève a fait (lu sans corriger) */
// La grille du relevé, par la fabrique d'ENT-9.1, en évaluation : ni colonne « Aide », ni note sous les lignes, ni « = » dans la case du solde.
export const RELEVE = fabriqueReleve({ jeuEleve, ficheDecl: FICHES.decl, ficheReleve: FICHES.releve, blocId: BLOC_COMPTE, semaine: SEMAINE,
  depart: 'relevé au 25/01', evaluation: true,
  titre: 'Une ligne par mouvement que tu as déclaré : chaque quantité dans sa colonne (0 dans l’autre), puis le solde au 29/01, calculé par une formule' });
export const { lignesDeclarees, soldeDeclare, lignesReleve, soldeDeLaFeuille } = RELEVE;
export const BLOC_RELEVE = RELEVE.BLOC;
// Le quai, la crédit et la tournée de l'élève.
export const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
export const quaiClos = (db) => !!(etatQuai(db) && etatQuai(db).fini);
export const constats = (db, pid) => constatsDe(etatQuai(db), pid);
export const creditDeSonControle = (db) => creditDe(pilesDeBase(db), etatQuai(db));
export const dejaEnvoyee = (id) => (db) => fiche(db, id).deja;
export const etatTournee = (db) => (db && db.transport && db.transport[ID] && db.transport[ID].tournee) || null;
export function tourneeEnvoyee(db) {
  const e = etatTournee(db);
  if (!e || !e.termine || !Array.isArray(e.ordre)) return null;
  return { e, b: bilanTournee({ ordre: e.ordre, quai: Array.isArray(e.quai) ? e.quai : [], report: {}, juge: {}, valide: null, phase: e.phase }, db) };
}
// L'attente du camion pour un ordre juste (relevée pour le compte rendu : avec Frais du Nord ouvert à 13 h, elle est longue).
export const attenteDe = (ordre, vides) => bilanOrdre(ordre, vides).attente;
