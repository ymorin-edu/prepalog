// ENT-7.1 — Decathlon, « ton premier conteneur » : les DONNÉES PURES de la séance (le conteneur, les offres, le tirage, les attendus).
// À part de `contenus/decathlon-ent71.js` parce que ce fichier-ci se charge aussi hors navigateur (corrigé, tests) : rien ici n'importe le
// moteur (sauf `core/tirage.js`, module pur). Brief : `docs/briefs/ENT-7.1-decathlon-choisir-transporteur.md` §6 et §6 bis.
//
// La PIÈCE FIXE (la même structure pour tous) : un conteneur arrivé à Anvers et ses trois offres référencées (route, barge, rail).
// TIRÉ par élève (décision 22, contre la copie) : le numéro du conteneur, le scellé, le poids, les prix dans leurs bornes ; QUELLE offre
// référencée arrive trop tard (banque `retard` : le rail, ou la barge) — la bonne réponse est donc la barge OU le rail ; l'offre hors
// liste (banque `horsListe`) ; pour un confirmé, deux offres de plus (banque `bonus`). Tout ce qui est attendu est CALCULÉ ici, jamais
// écrit en dur : le CO₂ (sur le poids tiré et les kilomètres de la carte), l'offre en retard, les offres restantes, la bonne réponse.

import { declarerTirage, hasard } from '../core/tirage.js';
import { PRESTATAIRES, REFERENCES, co2, troncons, kmTotal, nomLieu, numeroConteneur, PREFIXE, quand } from './decathlon.js';

export const ID = 'decathlon-choix-transporteur';
export const ID_VOLET = 'dk-ent71';
// Lundi 25 janvier 2027, 8 h 30 (séance AVANT le départ des offres).
export const SCENARIO = { date: '2027-01-25', heure: '08:30' };
export const DESTINATION = 'rouvignies';

// Les écrans (ids JAMAIS modifiés : écrits dans la base de l'élève).
export const FICHE = 'cmp';
export const B = { limite: 'limite', heure: 'heure', budget: 'budget', critere: 'critere', tri: 'tri', offres: 'offres', retenue: 'retenue', justif: 'justif' };
export const COL = { liste: 'liste', date: 'date' };

// ─────────────────────────────────────────────────────────────── le cahier des charges (fixe)
export const DISPO = { iso: '2027-01-26', h: 8 };          // mise à disposition au terminal d'Anvers
export const LIMITE = { iso: '2027-01-28', h: 14 };        // au quai de Rouvignies, au plus tard (mise en rayon)
export const BUDGET = 900;                                  // € HT, tout compris
export const REFERENCE = 'PO-ROU-2027-0381';
export const CRITERES = [
  { v: 'prix', lib: 'le prix le plus bas' },
  { v: 'co2', lib: 'le moins de CO₂' },
  { v: 'tot', lib: 'l’arrivée la plus tôt' },
];
export const CRITERE_JUSTE = 'co2';
export const JUSTIFS = [
  { v: 'co2', lib: 'Les offres restantes tiennent toutes la date ; je retiens celle qui émet le moins de CO₂.' },
  { v: 'prix', lib: 'Je retiens l’offre la moins chère, pour respecter le budget.' },
  { v: 'tot', lib: 'Je retiens l’offre qui arrive le plus tôt, pour avoir de la marge.' },
];
export const JUSTIF_JUSTE = 'co2';

// Les numéros de conteneur (6 numéros de série ; le chiffre de contrôle est calculé). Préfixe libre au registre BIC.
export const SERIES = ['418207', '306552', '527190', '611348', '245873', '739016'];

// ─────────────────────────────────────────────────────────────── les banques (JAMAIS de pièce supprimée ni renumérotée)
// `retard` : l'offre référencée qui arrive trop tard. Même difficulté pour toutes : une offre en retard, puis deux à départager par le CO₂.
export const BANQUE_RETARD = [
  { id: 'rt-rail', difficulte: 'moyen', retard: 'rail', titre: 'Le rail arrive vendredi (départ hebdomadaire du jeudi)' },
  { id: 'rt-barge', difficulte: 'moyen', retard: 'barge', titre: 'La barge du mardi est complète (la suivante arrive vendredi)' },
];
// `horsListe` : moins chère que les trois référencées, à l'heure, et moins émettrice que la bonne réponse (sinon le critère CO₂
// l'écarterait sans lire la liste). `co2` : un nombre, ou `{ bonne: −6 }` (relatif à la bonne réponse de l'élève), ou `{ route: +8 }`.
export const BANQUE_HORS_LISTE = [
  { id: 'hl-eflux', difficulte: 'difficile', nom: 'E-Flux Logistique', mode: 'route', modeLib: 'route, camion électrique', prix: 590, co2: 18,
    arrivee: { iso: '2027-01-27', h: 10 }, devis: 'EFL-27-031', mail: 'devis@e-flux-logistique.example', ville: 'Lesquin (59)' },
  { id: 'hl-bateliers', difficulte: 'difficile', nom: 'Bateliers du Nord', mode: 'barge', modeLib: 'barge + camion', prix: 640, co2: { bonne: -6 },
    arrivee: { iso: '2027-01-27', h: 17 }, devis: 'BN-27-0045', mail: 'fret@bateliers-du-nord.example', ville: 'Douai (59)' },
  { id: 'hl-railco', difficulte: 'difficile', nom: 'RailCo Express', mode: 'rail', modeLib: 'rail + camion', prix: 610, co2: { bonne: -4 },
    arrivee: { iso: '2027-01-27', h: 15 }, devis: 'RCX-2701-12', mail: 'contact@railco-express.example', ville: 'Courtrai (Belgique)' },
  // Gardée pour une banque future, non tirée au socle (brief §6 bis) ; son nom serait à revérifier avant usage.
  { id: 'hl-eclair', difficulte: 'facile', nom: 'Fret Éclair', mode: 'route', modeLib: 'route', prix: 540, co2: { route: 8 },
    arrivee: { iso: '2027-01-27', h: 9 }, devis: 'FE-0127-9', mail: 'devis@fret-eclair.example', ville: 'Valenciennes (59)' },
];
// `bonus` (confirmé seulement : deux cas en plus). Écartée pour la bonne raison = « non » dans la bonne colonne (`ecarte`).
export const BANQUE_BONUS = [
  // Le brief l'appelait « offre express » ; un express qui arrive après l'offre ordinaire ne tenait pas : c'est un second devis du même
  // transporteur, enlèvement jeudi midi. Référencé, mais arrive jeudi À 16 H : l'heure compte.
  { id: 'bo-heure', difficulte: 'difficile', ecarte: 'date', titre: 'Routiers du Hainaut, 2e devis : jeudi à 16 h (l’heure compte)' },
  { id: 'bo-homonyme', difficulte: 'difficile', ecarte: 'liste', titre: 'Routiers du Haynaut : un nom presque pareil, hors liste' },
  { id: 'bo-suivant', difficulte: 'difficile', ecarte: 'date', titre: 'La bonne offre, départ suivant : lundi 01/02' },
];

// ─────────────────────────────────────────────────────────────── le jeu d'un élève
const avant = (a, b) => (a.iso < b.iso || (a.iso === b.iso && a.h <= b.h));
export const tientLaDate = (arrivee) => avant(arrivee, LIMITE);

// Les valeurs tirées (rangées une fois) ; DEFAUT = l'élève « témoin » du brief (base vide, contrôle au chargement).
export const DEFAUT = { serie: 0, scelle: 7713420, poids: 14620, prixRoute: 690, prixBarge: 760, prixRail: 800 };
const valeursTirees = (h) => ({
  serie: h.entier(0, SERIES.length - 1), scelle: h.entier(1000000, 9999999), poids: 13500 + 10 * h.entier(0, 230),
  prixRoute: 660 + 10 * h.entier(0, 6), prixBarge: 730 + 10 * h.entier(0, 6), prixRail: 770 + 10 * h.entier(0, 6),
});

// Les trois offres référencées, selon l'offre en retard (`retard` : 'rail' ou 'barge') et les valeurs.
function offresReferencees(retard, V) {
  const c = (m) => co2(V.poids, DESTINATION, m);
  const km = (m) => troncons(DESTINATION, m);
  const [kRoute] = km('route'), [kBarge, kCamB] = km('barge'), [kRail, kCamR] = km('rail');
  const route = { id: 'route', prix: V.prixRoute, co2: c('route'), devis: 'RH-27-0114', arrivee: { iso: '2027-01-27', h: 11 },
    deroule: [`Enlèvement au terminal d’Anvers : ${quand('2027-01-27', 7)}`, `Route : ${kRoute.km} km jusqu’à l’entrepôt, sans changer de véhicule`] };
  const barge = retard === 'barge'
    ? { id: 'barge', prix: V.prixBarge, co2: c('barge'), devis: 'CTG-ANT-27-0352', arrivee: { iso: '2027-01-29', h: 9 },
      deroule: ['Barge du mar. 26/01 au soir : complète', 'Prochain départ : jeu. 28/01 au soir',
        `Barge : ${kBarge.km} km sur l’Escaut jusqu’au ${nomLieu(kBarge.a).replace(/^Terminal/, 'terminal')}, arrivée ven. 29/01 au matin`,
        `Camion : ${kCamB.km} km jusqu’à l’entrepôt`] }
    : { id: 'barge', prix: V.prixBarge, co2: c('barge'), devis: 'CTG-ANT-27-0352', arrivee: { iso: '2027-01-27', h: 16 },
      deroule: ['Chargement sur la barge : mar. 26/01 au soir',
        `Barge : ${kBarge.km} km sur l’Escaut jusqu’au ${nomLieu(kBarge.a).replace(/^Terminal/, 'terminal')}, arrivée mer. 27/01 au matin`,
        `Camion : ${kCamB.km} km jusqu’à l’entrepôt`] };
  barge.detailPrix = [['Fret barge', V.prixBarge - 290], ['Manutention aux terminaux', 110], ['Camion final', 180]];
  const rail = retard === 'rail'
    ? { id: 'rail', prix: V.prixRail, co2: c('rail'), devis: 'RFB-2701-088', arrivee: { iso: '2027-01-29', h: 10 },
      deroule: ['Départ du train (hebdomadaire) : jeu. 28/01', `Train : ${kRail.km} km jusqu’au ${nomLieu(kRail.a).replace(/^Terminal/, 'terminal')}, arrivée ven. 29/01`,
        `Camion : ${kCamR.km} km jusqu’à l’entrepôt`] }
    : { id: 'rail', prix: V.prixRail, co2: c('rail'), devis: 'RFB-2701-088', arrivee: { iso: '2027-01-27', h: 15 },
      deroule: ['Départ du train : mar. 26/01', `Train : ${kRail.km} km jusqu’au ${nomLieu(kRail.a).replace(/^Terminal/, 'terminal')}, arrivée mer. 27/01`,
        `Camion : ${kCamR.km} km jusqu’à l’entrepôt`] };
  return [route, barge, rail].map((o) => ({ ...PRESTATAIRES[o.id], ...o, prestataire: o.id, mode: o.id, referencee: true,
    troncons: km(o.id), tient: tientLaDate(o.arrivee) }));
}
const bonneDe = (refs) => refs.filter((o) => o.tient).sort((a, b) => a.co2 - b.co2)[0];

// L'offre hors liste d'une pièce, son CO₂ calculé sur la bonne réponse ou la route.
function offreHorsListe(p, refs) {
  const bonne = bonneDe(refs), route = refs.find((o) => o.id === 'route');
  const c = typeof p.co2 === 'number' ? p.co2 : p.co2.bonne != null ? bonne.co2 + p.co2.bonne : route.co2 + p.co2.route;
  const deroule = p.mode === 'route' ? [`Enlèvement au terminal d’Anvers : ${quand('2027-01-27', p.arrivee.h - 4)}`, `Route : ${kmTotal(DESTINATION, 'route')} km, porte à porte`]
    : p.mode === 'barge' ? ['Chargement sur la barge : mar. 26/01', 'Barge sur l’Escaut, puis camion jusqu’à l’entrepôt']
      : ['Départ du train : mar. 26/01', 'Train, puis camion jusqu’à l’entrepôt'];
  return { id: p.id, piece: p.id, nom: p.nom, mode: p.mode, modeLib: p.modeLib, mail: p.mail, ville: p.ville, referencee: false, prix: p.prix, co2: c,
    devis: p.devis, arrivee: p.arrivee, tient: tientLaDate(p.arrivee), deroule, troncons: troncons(DESTINATION, p.mode) };
}

// Les offres bonus d'un confirmé.
function offreBonus(p, refs, V) {
  const route = refs.find((o) => o.id === 'route'), bonne = bonneDe(refs);
  if (p.id === 'bo-heure') {
    return { ...PRESTATAIRES.route, id: p.id, piece: p.id, prestataire: 'route', nom: `${PRESTATAIRES.route.nom} (2e devis)`, referencee: true,
      prix: route.prix - 40, co2: route.co2, devis: 'RH-27-0115', arrivee: { iso: '2027-01-28', h: 16 }, troncons: route.troncons,
      deroule: [`Enlèvement au terminal d’Anvers : ${quand('2027-01-28', 12)}`, `Route : ${kmTotal(DESTINATION, 'route')} km, sans changer de véhicule`] };
  }
  if (p.id === 'bo-homonyme') {
    return { id: p.id, piece: p.id, nom: 'Routiers du Haynaut', mode: 'route', modeLib: 'route', mail: 'affretement@routiers-haynaut.example',
      ville: 'Maubeuge (59)', referencee: false, prix: route.prix - 50, co2: route.co2, devis: 'RHY-27-208', arrivee: { iso: '2027-01-27', h: 12 },
      troncons: route.troncons, deroule: [`Enlèvement au terminal d’Anvers : ${quand('2027-01-27', 8)}`, `Route : ${kmTotal(DESTINATION, 'route')} km, porte à porte`] };
  }
  // bo-suivant : la bonne offre, au départ suivant (lundi 01/02).
  const k = troncons(DESTINATION, bonne.mode);
  return { ...PRESTATAIRES[bonne.prestataire], id: p.id, piece: p.id, prestataire: bonne.prestataire, nom: `${bonne.nom} (départ suivant)`, referencee: true,
    prix: bonne.prix - 40, co2: bonne.co2, devis: `${bonne.devis}-S`, arrivee: { iso: '2027-02-01', h: bonne.mode === 'barge' ? 9 : 10 }, troncons: k,
    deroule: [`Départ suivant : ven. 29/01`, ...k.map((s) => `${s.type === 'camion' ? 'Camion' : s.type === 'barge' ? 'Barge' : 'Train'} : ${s.km} km`)] };
}

// Le jeu complet d'un tirage (ids des pièces + valeurs) : les offres dans l'ordre de l'élève, la bonne réponse, le conteneur.
// `graine` : l'ordre des offres (le socle mélangé, la pièce hors liste à une place tirée ; les cas bonus à la fin).
export function jeuDe({ retard = 'rt-rail', horsListe = 'hl-eflux', bonus = [], valeurs = DEFAUT, graine = '' } = {}) {
  const V = { ...DEFAUT, ...(valeurs || {}) };
  const pr = BANQUE_RETARD.find((p) => p.id === retard) || BANQUE_RETARD[0];
  const refs = offresReferencees(pr.retard, V);
  const hl = offreHorsListe(BANQUE_HORS_LISTE.find((p) => p.id === horsListe) || BANQUE_HORS_LISTE[0], refs);
  const socle = [...refs, { ...hl, slot: 'horsliste' }].map((o) => ({ ...o, slot: o.slot || o.id }));
  const ordre = graine ? hasard(`${graine}|ordre`).melanger(socle) : socle;
  const plus = bonus.map((id, k) => ({ ...offreBonus(BANQUE_BONUS.find((p) => p.id === id), refs, V), slot: `bonus${k + 1}`, ecarte: BANQUE_BONUS.find((p) => p.id === id).ecarte }));
  const offres = [...ordre, ...plus].map((o, i) => ({ ...o, lettre: 'ABCDEFGH'[i], tient: tientLaDate(o.arrivee) }));
  const bonne = bonneDe(refs);
  return {
    valeurs: V, retard: pr.retard, pieceRetard: pr.id, pieceHorsListe: hl.piece, bonus, offres,
    enRetard: offres.find((o) => o.slot === pr.retard), horsListe: offres.find((o) => o.slot === 'horsliste'),
    bonne: offres.find((o) => o.slot === bonne.id),
    restantes: offres.filter((o) => REFERENCES.includes(o.slot) && o.tient),
    conteneur: numeroConteneur(PREFIXE, SERIES[V.serie] || SERIES[0]),
    scelle: `DC ${String(V.scelle).replace(/^(\d)(\d{3})(\d{3})$/, '$1 $2 $3')}`,
    poids: V.poids,
  };
}

// Le contrôle d'équité (brief §6 bis) sur un jeu : la liste des écarts en clair (vide = conforme).
export function ecartsEquite(J) {
  const E = [];
  const o = (s) => J.offres.find((x) => x.slot === s);
  const [r, b, ra, hl] = ['route', 'barge', 'rail', 'horsliste'].map(o);
  if (!(b.co2 < ra.co2 && ra.co2 < r.co2)) E.push(`CO₂ : barge ${b.co2}, rail ${ra.co2}, route ${r.co2} (barge < rail < route attendu)`);
  const enRetard = [r, b, ra].filter((x) => !x.tient);
  if (enRetard.length !== 1) E.push(`${enRetard.length} offre(s) référencée(s) en retard au lieu d’une`);
  if (!r.tient) E.push('la route est en retard');
  if (!hl.tient) E.push('l’offre hors liste est en retard');
  if (!(hl.co2 < J.bonne.co2)) E.push(`hors liste ${hl.co2} kg, pas moins que la bonne réponse ${J.bonne.co2} kg`);
  if (!(hl.prix < Math.min(r.prix, b.prix, ra.prix))) E.push(`hors liste ${hl.prix} €, pas moins chère que les trois référencées`);
  if ([r, b, ra].some((x) => x.prix > BUDGET - 50)) E.push('une offre référencée dépasse le budget − 50 €');
  if (!(r.prix < Math.min(b.prix, ra.prix))) E.push('la route n’est pas la moins chère des référencées');
  const socle = [r, b, ra, hl];
  if (new Set(socle.map((x) => x.prix)).size !== socle.length) E.push('deux offres ont le même prix');
  if (new Set(socle.map((x) => x.co2)).size !== socle.length) E.push('deux offres ont le même CO₂');
  return E;
}

// Le tirage mémorisé (core/tirage.js) : ses jeux sont contrôlés par `ecartsEquite` (le jeu reconstruit sans l'ordre, qui n'y change rien).
const jeuDuTirage = (jeu) => jeuDe({ retard: jeu.pieces.retard[0].id, horsListe: jeu.pieces.horsListe[0].id,
  bonus: ((jeu.bonus && jeu.bonus.bonus) || []).map((p) => p.id), valeurs: jeu.valeurs });
export const TIRAGE = declarerTirage({
  banques: {
    retard: { pieces: BANQUE_RETARD, melange: { moyen: 1 } },
    horsListe: { pieces: BANQUE_HORS_LISTE, melange: { difficile: 1 } },
    bonus: { pieces: BANQUE_BONUS, melange: {}, bonus: { confirme: { difficile: 2 } }, ordre: 'fixe' },
  },
  valeurs: valeursTirees,
  verifier: (jeu) => ecartsEquite(jeuDuTirage(jeu)),
});
TIRAGE.lier(ID);

// Le jeu de l'élève, lu dans sa base (sans tirage — base vide, contrôle au chargement — : le jeu « témoin » du brief).
export function jeuEleve(db) {
  const rec = TIRAGE.tirage(db);
  if (!rec) return jeuDe({});
  const p1 = TIRAGE.piecesTirees(db, 'retard')[0], p2 = TIRAGE.piecesTirees(db, 'horsListe')[0];
  return jeuDe({ retard: p1 && p1.id, horsListe: p2 && p2.id, bonus: TIRAGE.piecesBonus(db, 'bonus').map((p) => p.id),
    valeurs: TIRAGE.valeursTirees(db), graine: rec.graine });
}

// ─────────────────────────────────────────────────────────────── la fiche de l'élève
// Une saisie de nombre, telle que tapée → un nombre ou NaN. Même lecture que `lireNombre` de la fiche (un test le vérifie).
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
// Une saisie d'heure → minutes depuis minuit, ou NaN. Même lecture que `lireHeure` de la fiche.
export function lireHeure(s) {
  const m = String(s == null ? '' : s).trim().toLowerCase().match(/^(\d{1,2})\s*(?:[:h]\s*(\d{2})?)?$/);
  if (!m) return NaN;
  const h = Number(m[1]), mn = m[2] ? Number(m[2]) : 0;
  return h < 24 && mn < 60 ? h * 60 + mn : NaN;
}
// La fiche de l'élève : `{ envoye, v }` (v = ses valeurs, même pas encore envoyées).
export function fiche(db) {
  const f = db && db.fiches && db.fiches[FICHE];
  return { envoye: !!(f && f.envoye), v: (f && f.valeurs) || {} };
}
// L'adresse des cases de la feuille « Comparer » pour une offre (ligne 1 = l'en-tête).
export const casePrix = (J, slot) => `B${J.offres.findIndex((o) => o.slot === slot) + 2}`;
export const caseCO2 = (J, slot) => `C${J.offres.findIndex((o) => o.slot === slot) + 2}`;
export const caseDe = (v, ref) => (v[B.offres] && v[B.offres].cases && v[B.offres].cases[ref]);
// Ce que l'élève a reporté pour une offre : { prix, co2 } en nombres (NaN si illisible).
export const reporte = (J, v, slot) => ({ prix: lireNombre(caseDe(v, casePrix(J, slot))), co2: lireNombre(caseDe(v, caseCO2(J, slot))) });
// Sa réponse oui / non pour une offre et une colonne : true, false ou undefined.
export const tri = (v, slot, col) => (v[B.tri] && v[B.tri][slot] ? v[B.tri][slot][col] : undefined);
