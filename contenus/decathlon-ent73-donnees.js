// ENT-7.3 — Decathlon, « la barge ne passe plus » : les DONNÉES PURES de la séance (le conteneur, les offres, le tirage, les attendus).
// À part de `contenus/decathlon-ent73.js` parce que ce fichier-ci se charge aussi hors navigateur (corrigé, tests) : rien ici n'importe le
// moteur (sauf `core/tirage.js`, module pur). Brief : `docs/briefs/ENT-7.3-decathlon-la-barge-ne-passe-plus.md` §4, §5, §6 et §6 bis.
//
// La PIÈCE FIXE : un conteneur arrivé à Anvers, quatre offres (route, barge, rail, et RailCo Express HORS LISTE), un arrêt de l'Escaut (avarie
// à l'écluse de Kain) qui tombe après la commande de la barge. TIRÉ par élève : le numéro du conteneur (6 séries, ≠ 7.1 et 7.2 ; le chiffre de
// contrôle est CALCULÉ), le scellé, le poids brut, la référence, les prix dans leurs bornes ; pour un confirmé, une cinquième offre
// (banque `bonus`). Tout ce qui est attendu est CALCULÉ ici, jamais écrit en dur : le CO₂ (sur le poids tiré et les kilomètres de la carte),
// quelles offres tiennent la date avant et après l'aléa, la bonne réponse.

import { declarerTirage, hasard } from '../core/tirage.js';
import { PRESTATAIRES, REFERENCES, co2, troncons, kmTotal, nomLieu, numeroConteneur, PREFIXE, quand } from './decathlon.js';

export const ID = 'decathlon-barge-arretee';
export const ID_VOLET = 'dk-ent73';
// Lundi 1er février 2027, 8 h.
export const SCENARIO = { date: '2027-02-01', heure: '08:00' };
export const DESTINATION = 'rouvignies';

// Les écrans et les cases (ids JAMAIS modifiés : écrits dans la base de l'élève).
export const CMP1 = 'cmp1';
export const CMP2 = 'cmp2';
export const OT1 = 'ot1';
export const OT2 = 'ot2';
export const DIALOGUE = 'quai';
export const ALEA = 'alea';                                  // l'id du déclencheur de l'imprévu (la marque est dans `db.volets`)
export const B = { limite: 'limite', heure: 'heure', budget: 'budget', critere: 'critere', tri: 'tri', offres: 'offres', retenue: 'retenue', justif: 'justif' };
export const COL = { liste: 'liste', date: 'date' };
export const BO = { presta: 'presta', cont: 'cont', type: 'type', scelle: 'scelle', poids: 'poids', enl: 'enl', dispo: 'dispo', ref: 'ref',
  liv: 'liv', limd: 'limd', limh: 'limh', inst: 'inst' };

// Le cahier des charges (fixe).
export const DISPO = { iso: '2027-02-01', h: 8 };            // mise à disposition au terminal d'Anvers
export const LIMITE = { iso: '2027-02-11', h: 14 };          // au quai de Rouvignies, au plus tard
export const BUDGET = 950;                                    // € HT, tout compris
export const CRITERE_JUSTE = 'co2';
export const CRITERES = [
  { v: 'prix', lib: 'le prix le plus bas' },
  { v: 'co2', lib: 'le moins de CO₂' },
  { v: 'tot', lib: 'l’arrivée la plus tôt' },
];
// L'arrêt de l'Escaut (construit) : avarie à l'écluse de Kain.
export const ARRET = { du: { iso: '2027-02-02' }, au: { iso: '2027-03-05' }, lieu: 'écluse de Kain', lonlat: [3.3714, 50.6284] };
// Les pièces de la commande (construites).
export const COMMANDE = 'BARGE-2027-0311';
export const OT_1 = 'OT-2027-0151';
export const OT_2 = 'OT-2027-0158';
export const FICHIER_1 = `${OT_1}.pdf`;
export const FICHIER_2 = `${OT_2}.pdf`;

// Les listes des ordres (les `v` sont écrites dans la base : JAMAIS modifiées).
export const PRESTAS = [{ v: 'routiers', lib: 'Routiers du Hainaut' }, { v: 'contargo', lib: 'Contargo' }, { v: 'rail', lib: 'Rail Flandres-Artois' }];
export const TYPES = [{ v: '20', lib: '20 pieds' }, { v: '40', lib: '40 pieds' }, { v: '40hc', lib: '40 pieds high cube (40’ HC)' }];
export const LIEUX_ENL = [{ v: 'anvers', lib: 'Terminal à conteneurs, port d’Anvers' }, { v: 'bruay', lib: 'Terminal de Bruay-sur-l’Escaut' },
  { v: 'rouvignies', lib: 'Entrepôt de Rouvignies' }];
export const LIEUX_LIV = [{ v: 'rouvignies', lib: 'Decathlon Rouvignies — quai de réception conteneurs' }, { v: 'dourges', lib: 'Decathlon Dourges — Delta 3' },
  { v: 'bruay', lib: 'Terminal de Bruay-sur-l’Escaut' }];
export const BONNES = { presta: 'rail', type: '40hc', enl: 'anvers', liv: 'rouvignies' };
export const INSTRUCTIONS = [
  { v: 'rdv', lib: 'Livraison sur rendez-vous : prendre le créneau auprès du quai de réception.' },
  { v: 'scelle', lib: 'Ne pas briser le scellé : il est ouvert au quai, à réception.' },
  { v: 'vide', lib: 'Ramener le conteneur vide au terminal après déchargement.' },
];

// Les numéros de conteneur : 6 séries, DIFFÉRENTES de celles d'ENT-7.1 et d'ENT-7.2 (un test le vérifie).
export const SERIES = ['530641', '184926', '762305', '297814', '846159', '413687'];

// ─────────────────────────────────────────────────────────────── la banque (JAMAIS de pièce supprimée ni renumérotée)
// `bonus` (confirmé seulement : un cas en plus, une cinquième offre au comparateur n° 2). `ecarte` : la colonne où la bonne réponse est « non ».
export const BANQUE_BONUS = [
  { id: 'b73-heure', difficulte: 'difficile', ecarte: 'date', titre: 'Routiers du Hainaut, 2e devis : jeudi 11/02 à 16 h (l’heure compte)' },
  { id: 'b73-homonyme', difficulte: 'difficile', ecarte: 'liste', titre: 'Routiers du Haynaut : un nom presque pareil, hors liste' },
  { id: 'b73-suivant', difficulte: 'difficile', ecarte: 'date', titre: 'Le rail, départ suivant : arrivée vendredi 12/02' },
];

// ─────────────────────────────────────────────────────────────── le jeu d'un élève
const avant = (a, b) => (a.iso < b.iso || (a.iso === b.iso && a.h <= b.h));
export const tientLaDate = (arrivee) => avant(arrivee, LIMITE);

// Les valeurs tirées (rangées une fois) ; DEFAUT = l'élève « témoin » du brief (base vide, contrôle au chargement).
export const DEFAUT = { serie: 0, scelle: 771518, poids: 15180, ref: 523, prixRoute: 690, prixBarge: 760, prixRail: 800 };
const valeursTirees = (h) => ({
  serie: h.entier(0, SERIES.length - 1), scelle: h.entier(100000, 9999999), poids: 13500 + 10 * h.entier(0, 230), ref: h.entier(1, 9999),
  prixRoute: 660 + 10 * h.entier(0, 6), prixBarge: 730 + 10 * h.entier(0, 6), prixRail: 770 + 10 * h.entier(0, 6),
});

export const PRIX_RAILCO = 610;                                // fixe : moins cher que les trois référencées (la plus basse est à 660 €)
export const ECART_CO2_RAILCO = -6;                            // RailCo émet 6 kg de moins que la barge

// Les quatre offres du socle. `tientAvant` : à la date du cahier des charges, sur le devis ; `tientApres` : une fois l'Escaut arrêté
// (la barge ne part pas : l'arrêt dure jusqu'au 05/03, bien après la limite). `referencee` : dans la liste du transport amont.
function offresSocle(V) {
  const c = (m) => co2(V.poids, DESTINATION, m);
  const km = (m) => troncons(DESTINATION, m);
  const [kRoute] = km('route'), [kBarge, kCamB] = km('barge'), [kRail, kCamR] = km('rail');
  const bruay = nomLieu(kBarge.a).replace(/^Terminal/, 'terminal'), dourges = nomLieu(kRail.a).replace(/^Terminal/, 'terminal');
  const route = { id: 'route', prix: V.prixRoute, co2: c('route'), devis: 'RH-27-0141', arrivee: { iso: '2027-02-10', h: 11 },
    deroule: [`Enlèvement au terminal d’Anvers : ${quand('2027-02-10', 7)}`, `Route : ${kRoute.km} km jusqu’à l’entrepôt, sans changer de véhicule`] };
  const barge = { id: 'barge', prix: V.prixBarge, co2: c('barge'), devis: 'CTG-ANT-27-0388', arrivee: { iso: '2027-02-05', h: 9 },
    deroule: ['Chargement sur la barge : mer. 03/02, départ au soir',
      `Barge : ${kBarge.km} km sur l’Escaut jusqu’au ${bruay}, arrivée ven. 05/02 au matin`, `Camion : ${kCamB.km} km jusqu’à l’entrepôt`], coupee: true };
  const rail = { id: 'rail', prix: V.prixRail, co2: c('rail'), devis: 'RFA-2702-021', arrivee: { iso: '2027-02-05', h: 15 },
    deroule: ['Départ du train : jeu. 04/02', `Train : ${kRail.km} km jusqu’au ${dourges}, arrivée ven. 05/02`, `Camion : ${kCamR.km} km jusqu’à l’entrepôt`] };
  const refs = [route, barge, rail].map((o) => ({ ...PRESTATAIRES[o.id], ...o, prestataire: o.id, mode: o.id, referencee: true, troncons: km(o.id) }));
  const railco = { id: 'horsliste', piece: 'railco', nom: 'RailCo Express', mode: 'rail', modeLib: 'rail + camion', mail: 'contact@railco-express.example',
    ville: 'Courtrai (Belgique)', referencee: false, prix: PRIX_RAILCO, co2: c('barge') + ECART_CO2_RAILCO, devis: 'RCX-2702-04', arrivee: { iso: '2027-02-05', h: 9 },
    deroule: ['Départ du train : jeu. 04/02', 'Train, puis camion jusqu’à l’entrepôt'], troncons: km('rail') };
  return [...refs, railco];
}

// Les offres en plus d'un confirmé.
function offreBonus(p, refs) {
  const route = refs.find((o) => o.id === 'route'), rail = refs.find((o) => o.id === 'rail');
  if (p.id === 'b73-heure') {
    return { ...PRESTATAIRES.route, id: p.id, piece: p.id, prestataire: 'route', nom: `${PRESTATAIRES.route.nom} (2e devis)`, referencee: true,
      prix: route.prix - 40, co2: route.co2, devis: 'RH-27-0142', arrivee: { iso: '2027-02-11', h: 16 }, troncons: route.troncons,
      deroule: [`Enlèvement au terminal d’Anvers : ${quand('2027-02-11', 12)}`, `Route : ${kmTotal(DESTINATION, 'route')} km, sans changer de véhicule`] };
  }
  if (p.id === 'b73-homonyme') {
    return { id: p.id, piece: p.id, nom: 'Routiers du Haynaut', mode: 'route', modeLib: 'route', mail: 'affretement@routiers-haynaut.example',
      ville: 'Maubeuge (59)', referencee: false, prix: route.prix - 50, co2: route.co2, devis: 'RHY-27-211', arrivee: { iso: '2027-02-10', h: 12 },
      troncons: route.troncons, deroule: [`Enlèvement au terminal d’Anvers : ${quand('2027-02-10', 8)}`, `Route : ${kmTotal(DESTINATION, 'route')} km, porte à porte`] };
  }
  // b73-suivant : le rail, au départ suivant (jeudi 11/02), arrive vendredi 12/02.
  return { ...PRESTATAIRES.rail, id: p.id, piece: p.id, prestataire: 'rail', nom: `${PRESTATAIRES.rail.nom} (départ suivant)`, referencee: true,
    prix: rail.prix - 40, co2: rail.co2, devis: 'RFA-2702-022', arrivee: { iso: '2027-02-12', h: 15 }, troncons: rail.troncons,
    deroule: ['Départ suivant du train : jeu. 11/02', ...rail.troncons.map((s) => `${s.type === 'camion' ? 'Camion' : 'Train'} : ${s.km} km`)] };
}

// Le jeu complet d'un tirage : les offres dans l'ordre de l'élève (le socle mélangé, les offres bonus à la fin), la bonne réponse, le conteneur.
export function jeuDe({ bonus = [], valeurs = DEFAUT, graine = '' } = {}) {
  const V = { ...DEFAUT, ...(valeurs || {}) };
  const socle = offresSocle(V);
  const refs = socle.filter((o) => o.referencee);
  const ordre = graine ? hasard(`${graine}|ordre73`).melanger(socle.map((o) => ({ ...o, slot: o.id }))) : socle.map((o) => ({ ...o, slot: o.id }));
  const plus = bonus.map((id, k) => { const p = BANQUE_BONUS.find((x) => x.id === id);
    return { ...offreBonus(p, refs), slot: `bonus${k + 1}`, ecarte: p.ecarte }; });
  const offres = [...ordre, ...plus].map((o, i) => ({ ...o, lettre: 'ABCDEFGH'[i], tientAvant: tientLaDate(o.arrivee), tient: o.coupee ? false : tientLaDate(o.arrivee) }));
  const restantes = offres.filter((o) => REFERENCES.includes(o.slot) && o.tient);
  const bonne = restantes.slice().sort((a, b) => a.co2 - b.co2)[0];
  return {
    valeurs: V, bonus, offres, bonne, restantes,
    horsListe: offres.find((o) => o.slot === 'horsliste'), barge: offres.find((o) => o.slot === 'barge'),
    conteneur: numeroConteneur(PREFIXE, SERIES[V.serie] || SERIES[0]),
    scelle: `DC ${String(V.scelle).padStart(7, '0').replace(/^(\d)(\d{3})(\d{3})$/, '$1 $2 $3')}`, poids: V.poids,
    reference: `PO-ROU-2027-${String(V.ref).padStart(4, '0')}`,
  };
}

// Le contrôle d'équité (brief §6 bis) sur un jeu : la liste des écarts en clair (vide = conforme).
export function ecartsEquite(J) {
  const E = [];
  const o = (s) => J.offres.find((x) => x.slot === s);
  const [r, b, ra, hl] = ['route', 'barge', 'rail', 'horsliste'].map(o);
  if (!(b.co2 < ra.co2 && ra.co2 < r.co2)) E.push(`CO₂ : barge ${b.co2}, rail ${ra.co2}, route ${r.co2} (barge < rail < route attendu)`);
  if (![r, b, ra].every((x) => x.tientAvant)) E.push('une offre référencée ne tient pas la date avant l’aléa');
  if (!(r.tient && ra.tient)) E.push('la route et le rail doivent tenir la date après l’aléa');
  if (b.tient) E.push('la barge tient la date après l’aléa');
  if (!(J.bonne && J.bonne.slot === 'rail')) E.push('la bonne réponse après l’aléa n’est pas le rail');
  if (!hl.tientAvant || !hl.tient) E.push('l’offre hors liste est en retard');
  if (!(hl.co2 < J.bonne.co2)) E.push(`hors liste ${hl.co2} kg, pas moins que la bonne réponse ${J.bonne.co2} kg`);
  if (!(hl.prix < Math.min(r.prix, b.prix, ra.prix))) E.push(`hors liste ${hl.prix} €, pas moins chère que les trois référencées`);
  if ([r, b, ra].some((x) => x.prix > BUDGET - 50)) E.push('une offre référencée dépasse le budget − 50 €');
  if (!(r.prix < Math.min(b.prix, ra.prix))) E.push('la route n’est pas la moins chère des référencées');
  const socle = [r, b, ra, hl];
  if (new Set(socle.map((x) => x.prix)).size !== socle.length) E.push('deux offres ont le même prix');
  if (new Set(socle.map((x) => x.co2)).size !== socle.length) E.push('deux offres ont le même CO₂');
  J.offres.filter((x) => x.ecarte).forEach((x) => {
    const bon = x.ecarte === 'date' ? !x.tientAvant : !x.referencee;
    if (!bon) E.push(`l’offre en plus « ${x.nom} » n’est pas écartée par la colonne « ${x.ecarte} »`);
    if (x.ecarte === 'liste' && !x.tientAvant) E.push(`l’offre en plus « ${x.nom} » doit tenir la date pour n’être écartée que par la liste`);
    if (x.ecarte === 'date' && !x.referencee) E.push(`l’offre en plus « ${x.nom} » doit être référencée pour n’être écartée que par la date`);
  });
  return E;
}

// Le tirage mémorisé (core/tirage.js) : ses jeux sont contrôlés par `ecartsEquite`.
const jeuDuTirage = (jeu) => jeuDe({ bonus: ((jeu.bonus && jeu.bonus.bonus) || []).map((p) => p.id), valeurs: jeu.valeurs });
export const TIRAGE = declarerTirage({
  banques: { bonus: { pieces: BANQUE_BONUS, melange: {}, bonus: { confirme: { difficile: 1 } }, ordre: 'fixe' } },
  valeurs: valeursTirees,
  verifier: (jeu) => ecartsEquite(jeuDuTirage(jeu)),
});
TIRAGE.lier(ID);

// Le jeu de l'élève, lu dans sa base (sans tirage — base vide, contrôle au chargement — : le jeu « témoin » du brief).
export function jeuEleve(db) {
  const rec = TIRAGE.tirage(db);
  if (!rec) return jeuDe({});
  return jeuDe({ bonus: TIRAGE.piecesBonus(db, 'bonus').map((p) => p.id), valeurs: TIRAGE.valeursTirees(db), graine: rec.graine });
}

// ─────────────────────────────────────────────────────────────── lectures de la base de l'élève (sans le moteur)
// Mêmes lectures que `lireNombre` / `lireHeure` de la fiche (un test le vérifie pour 7.1 ; ici, recopiées).
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
export function lireHeure(s) {
  const m = String(s == null ? '' : s).trim().toLowerCase().match(/^(\d{1,2})\s*(?:[:h]\s*(\d{2})?)?$/);
  if (!m) return NaN;
  const h = Number(m[1]), mn = m[2] ? Number(m[2]) : 0;
  return h < 24 && mn < 60 ? h * 60 + mn : NaN;
}
export const sansEspaces = (s) => String(s == null ? '' : s).replace(/[\s  ]/g, '').toUpperCase();
// Une fiche de l'élève : `{ envoye, v }` (v = ses valeurs, même pas encore envoyées).
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), v: (f && f.valeurs) || {} };
}
// L'adresse des cases de la feuille « Comparer » pour une offre (ligne 1 = l'en-tête).
export const casePrix = (J, slot) => `B${J.offres.findIndex((o) => o.slot === slot) + 2}`;
export const caseCO2 = (J, slot) => `C${J.offres.findIndex((o) => o.slot === slot) + 2}`;
export const caseDe = (v, ref) => (v[B.offres] && v[B.offres].cases && v[B.offres].cases[ref]);
// Sa réponse oui / non pour une offre et une colonne : true, false ou undefined.
export const tri = (v, slot, col) => (v[B.tri] && v[B.tri][slot] ? v[B.tri][slot][col] : undefined);
// Le prénom de l'élève : celui du premier message reçu (« to »).
export const prenomDe = (db) => { const m = ((db && db.mails) || []).find((x) => x.folder === 'in' && x.to); return m ? String(m.to) : ''; };
// L'imprévu a-t-il eu lieu ? (la marque que le moteur range une fois, `<volet>#<déclencheur>`.)
export const aleaDeclenche = (db) => !!(db && db.volets && db.volets[`${ID_VOLET}#${ALEA}`]);
// Le n° de conteneur tel que l'élève l'a écrit dans son premier ordre (à défaut, celui de l'avis).
export const numeroEcrit = (db) => { const x = fiche(db, OT1).v[BO.cont]; return x != null && String(x).trim() ? String(x).trim() : jeuEleve(db).conteneur; };
