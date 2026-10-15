// ENT-7.4 — Decathlon, évaluation « un conteneur pour Dourges » : les DONNÉES PURES de la séance (le conteneur, les offres, le tirage, les attendus).
// À part de `contenus/decathlon-ent74.js` parce que ce fichier-ci se charge aussi hors navigateur (corrigé, tests) : rien ici n'importe le
// moteur (sauf `core/tirage.js`, module pur). Brief : `docs/briefs/ENT-7.4-decathlon-evaluation-dourges.md` §4, §5 et §6.
//
// ÉVALUATION : autre entrepôt (Dourges, Delta 3), autre carte, autres offres. CONTRE LA COPIE (décision 22) : l'offre référencée qui arrive trop
// tard est TIRÉE par élève (banque `retard` : le rail, ou la barge), donc la bonne réponse est le rail OU la barge. Tout ce qui est attendu est
// CALCULÉ ici, jamais écrit en dur : le CO₂ (sur le poids tiré et les kilomètres de la carte vers Dourges), l'offre en retard, les offres restantes,
// la bonne réponse, l'arrivée de l'offre que l'élève a commandée.

import { declarerTirage, hasard } from '../core/tirage.js';
import { PRESTATAIRES, REFERENCES, co2, troncons, kmTotal, nomLieu, numeroConteneur, chiffreControle, PREFIXE, quand } from './decathlon.js';

export const ID = 'decathlon-evaluation-dourges';
export const ID_VOLET = 'dk-ent74';
// Lundi 1er mars 2027, 8 h 30. L'élève est seul au service transport amont (Claire est en déplacement).
export const SCENARIO = { date: '2027-03-01', heure: '08:30' };
export const DESTINATION = 'dourges';

// Les écrans et les cases (ids JAMAIS modifiés : écrits dans la base de l'élève).
export const CMP = 'cmp4';
export const OT = 'ot4';
export const DIALOGUE = 'quai';
export const B = { limite: 'limite', heure: 'heure', budget: 'budget', critere: 'critere', tri: 'tri', offres: 'offres', retenue: 'retenue', justif: 'justif' };
export const COL = { liste: 'liste', date: 'date' };
export const BO = { presta: 'presta', cont: 'cont', type: 'type', scelle: 'scelle', poids: 'poids', enl: 'enl', dispo: 'dispo', ref: 'ref',
  liv: 'liv', limd: 'limd', limh: 'limh', inst: 'inst' };

// Le cahier des charges (fixe).
export const DISPO = { iso: '2027-03-01', h: 8 };            // mise à disposition au terminal d'Anvers
export const LIMITE = { iso: '2027-03-10', h: 14 };          // au quai de Dourges, au plus tard
export const BUDGET = 850;                                    // € HT, tout compris
export const OT_NUM = 'OT-2027-0204';
export const FICHIER = `${OT_NUM}.pdf`;
export const CRITERE_JUSTE = 'co2';
export const CRITERES = [
  { v: 'prix', lib: 'le prix le plus bas' },
  { v: 'co2', lib: 'le moins de CO₂' },
  { v: 'tot', lib: 'l’arrivée la plus tôt' },
];
// Les phrases de justification (leur ordre est tiré par élève, voir la séance). La juste : la date d'abord, puis le CO₂.
export const JUSTIFS = [
  { v: 'date-co2', lib: 'J’écarte l’offre hors liste et l’offre en retard ; parmi les offres référencées qui tiennent la date, je retiens celle qui émet le moins de CO₂.' },
  { v: 'prix', lib: 'Je retiens l’offre la moins chère, pour respecter le budget.' },
  { v: 'tot', lib: 'Je retiens l’offre qui arrive le plus tôt, pour avoir de la marge.' },
];
export const JUSTIF_JUSTE = 'date-co2';

// Les listes de l'ordre (les `v` sont écrites dans la base : JAMAIS modifiées).
export const PRESTAS = [{ v: 'routiers', lib: 'Routiers du Hainaut' }, { v: 'contargo', lib: 'Contargo' }, { v: 'rail', lib: 'Rail Flandres-Artois' }];
export const PRESTA_DE = { route: 'routiers', barge: 'contargo', rail: 'rail' };
export const TYPES = [{ v: '20', lib: '20 pieds' }, { v: '40', lib: '40 pieds' }, { v: '40hc', lib: '40 pieds high cube (40’ HC)' }];
export const LIEUX_ENL = [{ v: 'anvers', lib: 'Terminal à conteneurs, port d’Anvers' }, { v: 'bruay', lib: 'Terminal de Bruay-sur-l’Escaut' },
  { v: 'dourges', lib: 'Terminal de Dourges' }];
export const LIEUX_LIV = [{ v: 'rouvignies', lib: 'Decathlon Rouvignies — quai de réception conteneurs' }, { v: 'dourges', lib: 'Decathlon Dourges — Delta 3' },
  { v: 'bruay', lib: 'Terminal de Bruay-sur-l’Escaut' }];
export const BONNES = { type: '40hc', enl: 'anvers', liv: 'dourges' };
export const INSTRUCTIONS_JUSTES = [
  { v: 'rdv', lib: 'Livraison sur rendez-vous : prendre le créneau auprès du quai de réception.' },
  { v: 'scelle', lib: 'Ne pas briser le scellé : il est ouvert au quai, à réception.' },
  { v: 'vide', lib: 'Ramener le conteneur vide au terminal après déchargement.' },
];

// Les numéros de conteneur : 8 séries, DIFFÉRENTES de celles d'ENT-7.1, 7.2 et 7.3 (un test le vérifie). Le préfixe PRPU est libre au registre BIC
// (vérifié le 13/10/2026) ; le « PLGU » du brief est attribué à une société réelle : il n'est pas utilisé.
export const SERIES = ['602215', '149378', '853027', '271864', '394506', '716432', '580193', '925641'];
// Le numéro que le chef de quai « lit mal » : deux chiffres voisins inversés, le chiffre de contrôle gardé. Ce n'est jamais un numéro valable
// (le chiffre de contrôle de la série inversée diffère de celui qui est écrit) : un test le vérifie sur toutes les séries.
export function seriePiege(serie) {
  const vrai = chiffreControle(PREFIXE + serie);
  for (let i = 0; i < serie.length - 1; i++) {
    if (serie[i] === serie[i + 1]) continue;
    const inv = serie.slice(0, i) + serie[i + 1] + serie[i] + serie.slice(i + 2);
    if (chiffreControle(PREFIXE + inv) !== vrai) return inv;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────── les banques (JAMAIS de pièce supprimée ni renumérotée)
// `retard` : l'offre référencée qui arrive trop tard. Une seule, jamais la route.
export const BANQUE_RETARD = [
  { id: 'rt4-barge', difficulte: 'moyen', retard: 'barge', titre: 'La barge reprend après la réouverture de l’Escaut : elle arrive vendredi (bonne réponse : le rail)' },
  { id: 'rt4-rail', difficulte: 'moyen', retard: 'rail', titre: 'Le train du 08/03 est supprimé (travaux) : le rail arrive jeudi (bonne réponse : la barge)' },
];
// `horsListe` : moins chère que les trois référencées, à l'heure, et moins émettrice que la bonne réponse. `co2` : un nombre, ou `{ bonne: −6 }`
// (relatif à la bonne réponse de l'élève). Mêmes prestataires fictifs qu'ENT-7.1, autres devis et autre arrivée.
export const BANQUE_HORS_LISTE = [
  { id: 'hl4-eflux', difficulte: 'difficile', nom: 'E-Flux Logistique', mode: 'route', modeLib: 'route, camion électrique', prix: 570, co2: 18,
    arrivee: { iso: '2027-03-09', h: 11 }, devis: 'EFL-27-044', mail: 'devis@e-flux-logistique.example', ville: 'Lesquin (59)' },
  { id: 'hl4-bateliers', difficulte: 'difficile', nom: 'Bateliers du Nord', mode: 'barge', modeLib: 'barge + camion', prix: 590, co2: { bonne: -6 },
    arrivee: { iso: '2027-03-09', h: 16 }, devis: 'BN-27-0071', mail: 'fret@bateliers-du-nord.example', ville: 'Douai (59)' },
  { id: 'hl4-railco', difficulte: 'difficile', nom: 'RailCo Express', mode: 'rail', modeLib: 'rail + camion', prix: 580, co2: { bonne: -4 },
    arrivee: { iso: '2027-03-09', h: 14 }, devis: 'RCX-2703-09', mail: 'contact@railco-express.example', ville: 'Courtrai (Belgique)' },
  // Gardée pour une banque future, non tirée au socle.
  { id: 'hl4-eclair', difficulte: 'facile', nom: 'Fret Éclair', mode: 'route', modeLib: 'route', prix: 540, co2: 90,
    arrivee: { iso: '2027-03-09', h: 12 }, devis: 'FE-0309-4', mail: 'devis@fret-eclair.example', ville: 'Valenciennes (59)' },
];
// `instructions` : 3 instructions fausses, 2 tirées (comme ENT-7.2). Les `v` ne changent jamais.
export const BANQUE_INSTRUCTIONS = [
  { id: 'in4-froid', difficulte: 'moyen', v: 'froid', lib: 'Conteneur frigorifique : maintenir à −18 °C.' },
  { id: 'in4-adr', difficulte: 'moyen', v: 'adr', lib: 'Marchandises dangereuses : transport ADR.' },
  { id: 'in4-douane', difficulte: 'moyen', v: 'douane', lib: 'Livraison en zone sous douane.' },
];
// Le contenu du conteneur (tiré parmi 3, dit sur l'avis et le cahier des charges).
export const CONTENUS = ['Vélos et accessoires', 'Tentes et sacs de randonnée', 'Textile de ski'];

// ─────────────────────────────────────────────────────────────── le jeu d'un élève
const avant = (a, b) => (a.iso < b.iso || (a.iso === b.iso && a.h <= b.h));
export const tientLaDate = (arrivee) => avant(arrivee, LIMITE);

// Les valeurs tirées (rangées une fois) ; DEFAUT = l'élève « témoin » (base vide, contrôle au chargement).
// Les prix : route 610-650, rail 660-710, barge 720-750 (jamais deux prix égaux, la route toujours la moins chère des référencées, tous ≤ budget − 50).
export const DEFAUT = { serie: 0, scelle: 772061, poids: 13950, ref: 381, contenu: 0, prixRoute: 640, prixBarge: 720, prixRail: 690 };
const valeursTirees = (h) => ({
  serie: h.entier(0, SERIES.length - 1), scelle: h.entier(1000000, 9999999), poids: 13500 + 10 * h.entier(0, 230), ref: h.entier(1, 9999),
  contenu: h.entier(0, CONTENUS.length - 1),
  prixRoute: 610 + 10 * h.entier(0, 4), prixRail: 660 + 10 * h.entier(0, 5), prixBarge: 720 + 10 * h.entier(0, 3),
});

// Les trois offres référencées, selon l'offre en retard (`retard` : 'rail' ou 'barge') et les valeurs.
function offresReferencees(retard, V) {
  const c = (m) => co2(V.poids, DESTINATION, m);
  const km = (m) => troncons(DESTINATION, m);
  const [kRoute] = km('route'), [kBarge, kCamB] = km('barge'), [kRail, kCamR] = km('rail');
  const terminal = nomLieu(kBarge.a).replace(/^Terminal/, 'terminal');
  const route = { id: 'route', prix: V.prixRoute, co2: c('route'), devis: 'RH-27-0204', arrivee: { iso: '2027-03-09', h: 10 },
    deroule: [`Enlèvement au terminal d’Anvers : ${quand('2027-03-09', 6)}`, `Route : ${kRoute.km} km jusqu’à l’entrepôt de Dourges, sans changer de véhicule`] };
  const barge = retard === 'barge'
    ? { id: 'barge', prix: V.prixBarge, co2: c('barge'), devis: 'CTG-ANT-27-0419', arrivee: { iso: '2027-03-12', h: 9 },
      deroule: ['Escaut fermé pour maintenance des écluses : pas de départ lun. 08/03', 'Premier départ après la réouverture : mer. 10/03 au soir',
        `Barge : ${kBarge.km} km jusqu’au ${terminal}, arrivée ven. 12/03 au matin`, `Camion : ${kCamB.km} km jusqu’à l’entrepôt`] }
    : { id: 'barge', prix: V.prixBarge, co2: c('barge'), devis: 'CTG-ANT-27-0419', arrivee: { iso: '2027-03-09', h: 9 },
      deroule: ['Chargement sur la barge : lun. 08/03', `Barge : ${kBarge.km} km jusqu’au ${terminal}, arrivée mar. 09/03 au matin`, `Camion : ${kCamB.km} km jusqu’à l’entrepôt`] };
  const rail = retard === 'rail'
    ? { id: 'rail', prix: V.prixRail, co2: c('rail'), devis: 'RFA-2703-017', arrivee: { iso: '2027-03-11', h: 10 },
      deroule: ['Train du lun. 08/03 : supprimé (travaux sur la ligne)', 'Prochain départ : mer. 10/03',
        `Train : ${kRail.km} km jusqu’au ${terminal}, arrivée jeu. 11/03`, `Camion : ${kCamR.km} km jusqu’à l’entrepôt`] }
    : { id: 'rail', prix: V.prixRail, co2: c('rail'), devis: 'RFA-2703-017', arrivee: { iso: '2027-03-09', h: 15 },
      deroule: ['Départ du train : lun. 08/03', `Train : ${kRail.km} km jusqu’au ${terminal}, arrivée mar. 09/03`, `Camion : ${kCamR.km} km jusqu’à l’entrepôt`] };
  return [route, barge, rail].map((o) => ({ ...PRESTATAIRES[o.id], ...o, prestataire: o.id, mode: o.id, referencee: true,
    troncons: km(o.id), tient: tientLaDate(o.arrivee) }));
}
const bonneDe = (refs) => refs.filter((o) => o.tient).sort((a, b) => a.co2 - b.co2)[0];

// L'offre hors liste d'une pièce, son CO₂ calculé sur la bonne réponse.
function offreHorsListe(p, refs) {
  const bonne = bonneDe(refs);
  const c = typeof p.co2 === 'number' ? p.co2 : bonne.co2 + p.co2.bonne;
  const deroule = p.mode === 'route' ? [`Enlèvement au terminal d’Anvers : ${quand(p.arrivee.iso, p.arrivee.h - 4)}`, `Route : ${kmTotal(DESTINATION, 'route')} km, porte à porte`]
    : p.mode === 'barge' ? ['Chargement sur la barge : lun. 08/03', 'Barge, puis camion jusqu’à l’entrepôt']
      : ['Départ du train : lun. 08/03', 'Train, puis camion jusqu’à l’entrepôt'];
  return { id: p.id, piece: p.id, nom: p.nom, mode: p.mode, modeLib: p.modeLib, mail: p.mail, ville: p.ville, referencee: false, prix: p.prix, co2: c,
    devis: p.devis, arrivee: p.arrivee, tient: tientLaDate(p.arrivee), deroule, troncons: troncons(DESTINATION, p.mode) };
}

const z = (n, k) => String(n).padStart(k, '0');
// Le jeu complet d'un tirage : les offres dans l'ordre de l'élève, la bonne réponse, le conteneur, l'ordre à remplir.
export function jeuDe({ retard = 'rt4-barge', horsListe = 'hl4-eflux', instructions = ['in4-froid', 'in4-adr'], valeurs = DEFAUT, graine = '' } = {}) {
  const V = { ...DEFAUT, ...(valeurs || {}) };
  const pr = BANQUE_RETARD.find((p) => p.id === retard) || BANQUE_RETARD[0];
  const refs = offresReferencees(pr.retard, V);
  const hl = offreHorsListe(BANQUE_HORS_LISTE.find((p) => p.id === horsListe) || BANQUE_HORS_LISTE[0], refs);
  const socle = [...refs, { ...hl, slot: 'horsliste' }].map((o) => ({ ...o, slot: o.slot || o.id }));
  const ordre = graine ? hasard(`${graine}|ordre74`).melanger(socle) : socle;
  const offres = ordre.map((o, i) => ({ ...o, lettre: 'ABCDEFGH'[i], tient: tientLaDate(o.arrivee) }));
  const bonne = bonneDe(refs);
  const S = SERIES[V.serie] || SERIES[0];
  const fausses = instructions.map((id) => BANQUE_INSTRUCTIONS.find((p) => p.id === id)).filter(Boolean);
  const liste = [...INSTRUCTIONS_JUSTES.map((x) => ({ ...x, juste: true })), ...fausses.map((p) => ({ v: p.v, lib: p.lib, juste: false }))];
  return {
    valeurs: V, retard: pr.retard, pieceRetard: pr.id, pieceHorsListe: hl.piece, offres,
    enRetard: offres.find((o) => o.slot === pr.retard), horsListe: offres.find((o) => o.slot === 'horsliste'),
    bonne: offres.find((o) => o.slot === bonne.id),
    restantes: offres.filter((o) => REFERENCES.includes(o.slot) && o.tient),
    conteneur: numeroConteneur(PREFIXE, S),
    sansEspaces: numeroConteneur(PREFIXE, S).replace(/\s/g, ''),
    piege: `${PREFIXE} ${seriePiege(S)} ${chiffreControle(PREFIXE + S)}`,
    scelle: `DC ${z(V.scelle, 7).replace(/^(\d)(\d{3})(\d{3})$/, '$1 $2 $3')}`, poids: V.poids,
    reference: `PO-DOU-2027-${z(V.ref, 4)}`,
    contenu: CONTENUS[V.contenu] || CONTENUS[0],
    instructions: graine ? hasard(`${graine}|instructions74`).melanger(liste) : liste, fausses: fausses.map((p) => p.v),
  };
}

// Le contrôle d'équité sur un jeu : la liste des écarts en clair (vide = conforme).
export function ecartsEquite(J) {
  const E = [];
  const o = (s) => J.offres.find((x) => x.slot === s);
  const [r, b, ra, hl] = ['route', 'barge', 'rail', 'horsliste'].map(o);
  if (!(ra.co2 < b.co2 && b.co2 < r.co2)) E.push(`CO₂ : rail ${ra.co2}, barge ${b.co2}, route ${r.co2} (rail < barge < route attendu)`);
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
  if (new Set(socle.map((x) => `${x.arrivee.iso} ${x.arrivee.h}`)).size !== socle.length) E.push('deux offres arrivent à la même heure (le chef de quai ne les distinguerait pas)');
  if (!seriePiege(SERIES[J.valeurs.serie] || SERIES[0])) E.push('pas de numéro piège pour cette série');
  if (new Set(J.instructions.map((x) => x.v)).size !== J.instructions.length) E.push('deux instructions identiques');
  if (J.fausses.length !== 2) E.push(`${J.fausses.length} instruction(s) fausse(s) au lieu de 2`);
  return E;
}

// Le tirage mémorisé (core/tirage.js) : ses jeux sont contrôlés par `ecartsEquite`.
const jeuDuTirage = (jeu) => jeuDe({ retard: jeu.pieces.retard[0].id, horsListe: jeu.pieces.horsListe[0].id,
  instructions: jeu.pieces.instructions.map((p) => p.id), valeurs: jeu.valeurs });
export const TIRAGE = declarerTirage({
  banques: {
    retard: { pieces: BANQUE_RETARD, melange: { moyen: 1 } },
    horsListe: { pieces: BANQUE_HORS_LISTE, melange: { difficile: 1 } },
    instructions: { pieces: BANQUE_INSTRUCTIONS, melange: { moyen: 2 }, ordre: 'fixe' },
  },
  valeurs: valeursTirees,
  verifier: (jeu) => ecartsEquite(jeuDuTirage(jeu)),
});
TIRAGE.lier(ID);

// Le jeu de l'élève, lu dans sa base (sans tirage — base vide, contrôle au chargement — : le jeu « témoin »).
export function jeuEleve(db) {
  const rec = TIRAGE.tirage(db);
  if (!rec) return jeuDe({});
  const p1 = TIRAGE.piecesTirees(db, 'retard')[0], p2 = TIRAGE.piecesTirees(db, 'horsListe')[0];
  return jeuDe({ retard: p1 && p1.id, horsListe: p2 && p2.id, instructions: TIRAGE.piecesTirees(db, 'instructions').map((p) => p.id),
    valeurs: TIRAGE.valeursTirees(db), graine: rec.graine });
}

// ─────────────────────────────────────────────────────────────── lectures de la base de l'élève (sans le moteur)
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
export const reporte = (J, v, slot) => ({ prix: lireNombre(caseDe(v, casePrix(J, slot))), co2: lireNombre(caseDe(v, caseCO2(J, slot))) });
// Sa réponse oui / non pour une offre et une colonne : true, false ou undefined.
export const tri = (v, slot, col) => (v[B.tri] && v[B.tri][slot] ? v[B.tri][slot][col] : undefined);
export const cochees = (v) => (Array.isArray(v[BO.inst]) ? v[BO.inst] : []);
// Le prénom de l'élève : celui du premier message reçu (« to »).
export const prenomDe = (db) => { const m = ((db && db.mails) || []).find((x) => x.folder === 'in' && x.to); return m ? String(m.to) : ''; };
// L'offre que l'élève a COMMANDÉE (l'arrivée que dit le chef de quai) : le transporteur de son ordre ; à défaut, l'offre qu'il a retenue ;
// à défaut, la bonne réponse. Une erreur de choix ne se paie pas deux fois.
export function commandee(db) {
  const J = jeuEleve(db);
  const presta = fiche(db, OT).v[BO.presta], retenue = fiche(db, CMP).v[B.retenue];
  const mode = Object.keys(PRESTA_DE).find((m) => PRESTA_DE[m] === presta);
  return J.offres.find((o) => o.slot === mode) || J.offres.find((o) => o.slot === retenue) || J.bonne;
}
