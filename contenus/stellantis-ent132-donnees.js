// ENT-13.2 — Stellantis Sochaux, « les camions du matin » : les DONNÉES PURES (brief `docs/briefs/ENT-13.2-stellantis-camions-du-matin.md` ; choix de Tristan du 26/10/2026).
// Importé par le contenu (`contenus/stellantis-ent132.js`), les questions, le corrigé et les tests. Univers : `contenus/stellantis.js`. Aucun effet de bord.
//
// LE JOUR : mardi 14 septembre 2027, 5 h 30, bureau de réception du montage. L'élève (PFMP, équipe logistique de Karim) tient cinq quais et pose les huit camions du matin ;
// puis il reçoit celui des faisceaux. VÉRIFIÉ (Le Trois, 16/07/2026) : environ 250 camions et 500 fournisseurs par jour, un stock sur place de quelques heures à une journée et demie,
// une équipe logistique qui planifie les camions et les reçoit. CONSTRUIT : les cinq quais tenus (le nombre réel est inconnu), le quai 5 « pour porteurs », les huit camions
// (FAMILLES de pièces, aucun nom d'équipementier), leurs heures, leurs palettes, la couverture de chaque pièce à la ligne, le camion de faisceaux et son contenu.
// LE PLANNING ET LE QUAI SONT FIXES (comme ENT-12.5) : séance de révision, même matinée pour tous.

import { JOURS } from './stellantis.js';

export const ID = 'stellantis-camions-du-matin';
export const ID_VOLET = 'st-ent132';
export const PL = 'st-planning-132';
export const ID_QUAI = 'st-quai-132';
export const ID_PHRASES = 'compte-rendu-karim-132';
export const JOUR = JOURS.mardi;
export const MIN_PAR_PALETTE = 5;

// ─────────────────────────────────────────────────────────────── l'échelle : 5 h 30 → 11 h, un créneau tous les 15 minutes
export const DEBUT = 5 * 60 + 30, PAS = 15, NB = 22;
export const minutes = (hm) => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + (m || 0); };
export const slotDe = (hm) => Math.round((minutes(hm) - DEBUT) / PAS);
export const heureDe = (slot) => { const m = DEBUT + slot * PAS; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
export const hlib = (hm) => { const [h, m] = hm.split(':'); return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`; };
// Une durée en minutes : « 1 h 40 », « 45 min ».
export const duree = (min) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`);

// ─────────────────────────────────────────────────────────────── les cinq quais (le 5 est réservé aux porteurs)
export const QUAIS = [1, 2, 3, 4, 5].map((n) => ({ id: `q${n}`, nom: `Quai ${n}`, porteurs: n === 5 }));
export const QUAIS_IDS = QUAIS.map((q) => q.id);
export const QUAI_PORTEURS = 'q5';
// Un camion de la nuit encore en cours de déchargement : dessiné en gris sur la grille, aucune carte ne peut y passer.
export const OCCUPE = { quai: 'q2', de: '05:30', a: '06:30', titre: 'Camion de la nuit, encore en cours de déchargement' };

// ─────────────────────────────────────────────────────────────── les huit camions du matin
// `couv` : la couverture de la pièce à la ligne, en minutes de production. Un camion est URGENT quand sa pièce couvre moins de trois heures (`SEUIL_URGENT`).
// Durée = palettes × 5 min (décharger et contrôler), arrondie au quart d'heure par le moteur.
export const SEUIL_URGENT = 180;
export const CAMIONS = [
  { id: 'sieges', nom: 'Fournisseur de sièges', court: 'Sièges', type: 'semi', palettes: 16, arrivee: '05:45', couv: 190 },
  { id: 'planches', nom: 'Fournisseur de planches de bord', court: 'Planches de bord', type: 'semi', palettes: 12, arrivee: '05:45', couv: 150 },
  { id: 'roues', nom: 'Fournisseur de roues', court: 'Roues', type: 'semi', palettes: 14, arrivee: '06:00', couv: 240 },
  { id: 'retros', nom: 'Fournisseur de rétroviseurs', court: 'Rétroviseurs', type: 'porteur', palettes: 8, arrivee: '06:00', couv: 300 },
  { id: 'faisceaux', nom: 'Fournisseur de faisceaux électriques', court: 'Faisceaux', type: 'semi', palettes: 6, arrivee: '06:15', couv: 100 },
  { id: 'moquettes', nom: 'Fournisseur de moquettes', court: 'Moquettes', type: 'porteur', palettes: 6, arrivee: '07:30', couv: 380 },
  { id: 'batteries', nom: 'Fournisseur de batteries', court: 'Batteries', type: 'semi', palettes: 20, arrivee: '08:00', couv: 270 },
  { id: 'joints', nom: 'Fournisseur de joints', court: 'Joints', type: 'porteur', palettes: 10, arrivee: '09:00', couv: 420 },
].map((c) => ({ ...c, urgent: c.couv < SEUIL_URGENT }));
export const parId = Object.fromEntries(CAMIONS.map((c) => [c.id, c]));
export const dureeDe = (c) => c.palettes * MIN_PAR_PALETTE;
export const longueur = (c) => Math.ceil(dureeDe(c) / PAS);
export const libType = (t) => (t === 'semi' ? 'semi-remorque' : 'porteur');
export const URGENTS = CAMIONS.filter((c) => c.urgent).map((c) => c.id);
// L'urgence : le camion de faisceaux annonce 45 minutes d'avance (un multiple du créneau).
export const AVANCE = 'faisceaux';
export const AVANCE_MIN = 45;
export const ARRIVEE_AVANT = heureDe(slotDe(parId[AVANCE].arrivee) - AVANCE_MIN / PAS);   // '05:30'
export const arriveeSlot = (c, version) => slotDe(c.id === AVANCE && version === 2 ? ARRIVEE_AVANT : c.arrivee);

// ─────────────────────────────────────────────────────────────── le jugement d'un planning (lu sur `{ carte: { r, s } }`, `s` = créneau de début)
export const toutesPosees = (place) => CAMIONS.every((c) => place && place[c.id] && place[c.id].s != null && QUAIS_IDS.includes(place[c.id].r));
export function tropTot(place, version = 1) { return CAMIONS.filter((c) => place && place[c.id] && place[c.id].s < arriveeSlot(c, version)).map((c) => c.id); }
export function malPlaces(place) { return CAMIONS.filter((c) => c.type === 'semi' && place && place[c.id] && place[c.id].r === QUAI_PORTEURS).map((c) => c.id); }
export function chevauchements(place) {
  const S = CAMIONS.filter((c) => place && place[c.id] && QUAIS_IDS.includes(place[c.id].r) && place[c.id].s != null)
    .map((c) => ({ id: c.id, r: place[c.id].r, s: place[c.id].s, e: place[c.id].s + longueur(c) }));
  const out = [];
  for (let a = 0; a < S.length; a++) for (let b = a + 1; b < S.length; b++) if (S[a].r === S[b].r && S[a].s < S[b].e && S[b].s < S[a].e) out.push([S[a].id, S[b].id]);
  const o = { s: slotDe(OCCUPE.de), e: slotDe(OCCUPE.a) };
  S.forEach((x) => { if (x.r === OCCUPE.quai && x.s < o.e && o.s < x.e) out.push([x.id, 'nuit']); });
  return out;
}
// Les camions urgents qui commencent APRÈS leur arrivée : la ligne les attend.
export function urgentsEnRetard(place, version = 1) {
  return CAMIONS.filter((c) => c.urgent && place && place[c.id] && place[c.id].s > arriveeSlot(c, version)).map((c) => c.id);
}

// ─────────────────────────────────────────────────────────────── lectures de la base de l'élève
export const planningEnvoye = (db, v = 2) => (db && db.plannings && db.plannings[PL] && db.plannings[PL][`v${v}`]) || null;
export const planEnCours = (db) => (db && db.plannings && db.plannings[PL] && db.plannings[PL].place) || {};
const etatQuai = (db) => (db && db.quais && db.quais[ID_QUAI]) || null;
export const quaiEcrit = (db) => !!(etatQuai(db) && etatQuai(db).ecrit);
export const quaiSigne = (db) => !!(etatQuai(db) && etatQuai(db).signe);

// ─────────────────────────────────────────────────────────────── le camion de faisceaux (le quai)
// Le camion apporte quatre palettes de cartons de faisceaux (références CONSTRUITES). Le BL annonce 100 cartons ; la ligne en prend 1 par minute (couverture 1 h 40).
// L'écart au brief (dit à Tristan) : le quai ne sait pas montrer « une palette annoncée au BL et absente » ; la palette P4 arrive donc incomplète (des cartons manquent).
export const PALETTES = [
  { id: 'P1', ref: 'FAS-HAB', nom: 'Faisceau d’habitacle', bl: 24, W: 4, D: 3, L: 2, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
    etiq: { ref: 'FAS-HAB', nom: 'FAISCEAU D’HABITACLE', poids: '1 faisceau par carton', lot: 'FRN-0914-1' } },
  // Couche du dessus incomplète, mais conforme au BL : le piège de comptage.
  { id: 'P2', ref: 'FAS-PLA', nom: 'Faisceau de plafonnier', bl: 16, W: 3, D: 3, L: 2, manque: ['0,0,1', '1,0,1'], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
    etiq: { ref: 'FAS-PLA', nom: 'FAISCEAU DE PLAFONNIER', poids: '1 faisceau par carton', lot: 'FRN-0914-2' } },
  // Le film déchiré : trois cartons écrasés sur la face arrière (il faut faire le tour).
  { id: 'P3', ref: 'FAS-POR', nom: 'Faisceau de porte', bl: 36, W: 4, D: 3, L: 3, manque: [], avarie: { '1,0,1': [0, -1], '2,0,1': [0, -1], '1,0,2': [0, -1] }, attendu: 'reserves', motifAttendu: 'avarie',
    etiq: { ref: 'FAS-POR', nom: 'FAISCEAU DE PORTE', poids: '1 faisceau par carton', lot: 'FRN-0914-3' } },
  // Six cartons manquants dans la couche du dessus, côté avant.
  { id: 'P4', ref: 'FAS-COF', nom: 'Faisceau de coffre', bl: 24, W: 4, D: 3, L: 2, manque: ['0,2,1', '1,2,1', '2,2,1', '3,2,1', '0,1,1', '1,1,1'], avarie: {}, attendu: 'reserves', motifAttendu: 'manquant',
    etiq: { ref: 'FAS-COF', nom: 'FAISCEAU DE COFFRE', poids: '1 faisceau par carton', lot: 'FRN-0914-4' } },
];
const reelDe = (p) => p.W * p.D * p.L - p.manque.length;
export const BL_TOTAL = PALETTES.reduce((t, p) => t + p.bl, 0);                       // 100
export const RECU = PALETTES.reduce((t, p) => t + reelDe(p), 0);                      // 94
export const MANQUANTS = BL_TOTAL - RECU;                                             // 6
export const ECRASES = PALETTES.reduce((t, p) => t + Object.keys(p.avarie).length, 0); // 3
export const UTILISABLES = RECU - ECRASES;                                            // 91
export const CARTONS_PAR_MIN = 1;
export const couvertureDe = (cartons) => Math.round(cartons / CARTONS_PAR_MIN);       // minutes de production

export const QUAI = {
  id: ID_QUAI, rendu: 'iso', froid: false,
  titre: 'Usine de Sochaux — Quai 4, camion de faisceaux',
  destinataire: 'Usine Stellantis de Sochaux, montage',
  avertissement: 'Réels : l’usine Stellantis de Sochaux, ses fournisseurs par camion, la réception des pièces. Le quai est un <b>dessin construit</b> : ce n’est pas un quai de l’usine. '
    + 'Le camion de faisceaux, son bon de livraison, ses palettes et leurs défauts sont <b>construits pour l’exercice</b>.',
  lieu: { nom: 'Quai 4', temp: 15, refrigere: false },
  zone: { nom: 'Zone de réception' },
  document: { nom: 'Bon de livraison', court: 'BL' },
  motifs: ['avarie', 'manquant'],
  recommencer: false,
  dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste' },
  calcul: { forme: 'feuille', rappel: true },
  aides: { regleCouches: true, consignes: true },
  camions: [{
    transporteur: 'Transporteur de faisceaux (construit)', fournisseur: 'Fournisseur de faisceaux électriques (construit)', bl: 'FRN-14-0930', arrivee: ARRIVEE_AVANT,
    parole: 'Bonjour ! Les faisceaux pour le montage. Voilà le bon de livraison : 100 cartons.',
    palettes: JSON.parse(JSON.stringify(PALETTES)),
  }],
};

// ─────────────────────────────────────────────────────────────── le compte rendu à Karim (phrases à choisir ; seul le fond compte)
export const LIGNE_RECU = `J’ai reçu ${RECU} cartons de faisceaux sur les ${BL_TOTAL} annoncés au bon de livraison.`;
export const LIGNE_COUVERTURE = `Avec les ${UTILISABLES} cartons utilisables, la ligne tient encore ${duree(couvertureDe(UTILISABLES))}.`;
export const PHRASES = {
  id: ID_PHRASES,
  lignes: [
    { id: 'salutation', texte: 'Karim,' },
    { id: 'recu', choix: [LIGNE_RECU, `J’ai reçu les ${BL_TOTAL} cartons annoncés au bon de livraison.`, 'Le camion est conforme, rien à signaler.'], juste: 0 },
    { id: 'couverture', choix: [LIGNE_COUVERTURE, `Avec les ${BL_TOTAL} cartons du bon de livraison, la ligne tient encore ${duree(couvertureDe(BL_TOTAL))}.`,
      `Avec les ${RECU} cartons reçus, la ligne tient encore ${duree(couvertureDe(RECU))}.`, 'La ligne ne manquera de rien ce matin.'], juste: 0 },
    { id: 'fin', texte: 'Je reste à la réception.' },
  ],
  melanger: true,
};
