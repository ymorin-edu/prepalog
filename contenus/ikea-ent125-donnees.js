// ENT-12.5 — IKEA, « les quais du mardi » : les DONNÉES PURES (brief `docs/briefs/ENT-12.5-ikea-les-quais-du-mardi.md` ; choix de Tristan du 26/10/2026).
// Importé par le contenu (`contenus/ikea-ent125.js`), les questions, le corrigé et les tests. Univers : `contenus/ikea.js`. Aucun effet de bord.
//
// LE JOUR : mardi 9 mars 2027, 5 h 45. L'élève (employé(e) logistique) tient six quais de réception du centre de Gennevilliers (21 à 26) et pose les sept camions du matin.
// VÉRIFIÉ (26/10/2026, voir `contenus/ikea.js`) : le centre a 71 portes de quai et se réapprovisionne auprès des autres centres IKEA de France et d'Allemagne et de fournisseurs en direct ;
// un autre centre IKEA (Saint-Quentin-Fallavier) travaille en deux équipes (6 h – 13 h 20, 13 h 30 – 20 h 50). CONSTRUIT : les six quais tenus (sur 71), le quai 26 « pour porteurs », les sept camions,
// leurs heures d'arrivée, leurs nombres de palettes, les 2 minutes par palette, le créneau de la veille encore pris, Samir.
// LE PLANNING EST FIXE (séance de découverte en guidage, comme ENT-12.3) : même planning pour tous les élèves ; aucun tirage de valeurs de planning.

export const ID = 'ikea-quais-du-mardi';
export const ID_VOLET = 'ik-ent125';
export const PL = 'ik-planning-125';
export const FICHE_SAMIR = 'samir-125';
export const JOUR = { iso: '2027-03-09', lib: 'mardi 9 mars 2027' };
export const MIN_PAR_PALETTE = 2;

// ─────────────────────────────────────────────────────────────── l'échelle : 06:00 → 13:30, un créneau tous les 15 minutes
export const DEBUT = 6 * 60, PAS = 15, NB = 30;
export const minutes = (hm) => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + (m || 0); };
export const slotDe = (hm) => Math.round((minutes(hm) - DEBUT) / PAS);
export const heureDe = (slot) => { const m = DEBUT + slot * PAS; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
export const hlib = (hm) => { const [h, m] = hm.split(':'); return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`; };

// ─────────────────────────────────────────────────────────────── les six quais (le 26 est réservé aux porteurs)
export const QUAIS = [21, 22, 23, 24, 25, 26].map((n) => ({ id: `q${n}`, nom: `Quai ${n}`, porteurs: n === 26 }));
export const QUAIS_IDS = QUAIS.map((q) => q.id);
export const QUAI_PORTEURS = 'q26';
// Un créneau de la veille encore pris (équipe d'après-midi) : dessiné en gris sur la grille, aucune carte ne peut y passer.
export const OCCUPE = { quai: 'q22', de: '06:00', a: '07:00', titre: 'Camion de la veille, encore en cours de déchargement' };

// ─────────────────────────────────────────────────────────────── les sept camions du matin (arrivée prévue ; durée = palettes × 2 min, sauf la caisse mobile)
export const CAMIONS = [
  { id: 'nav1', nom: 'Navette 1 — Saint-Quentin-Fallavier', court: 'Navette 1', type: 'semi', origine: 'un autre centre IKEA de France', palettes: 26, arrivee: '06:00' },
  { id: 'f1', nom: 'Fournisseur A — porteur', court: 'Fournisseur A', type: 'porteur', origine: 'un fournisseur, en direct', palettes: 12, arrivee: '06:15' },
  { id: 'nav2', nom: 'Navette 2 — Saint-Quentin-Fallavier', court: 'Navette 2', type: 'semi', origine: 'un autre centre IKEA de France', palettes: 28, arrivee: '06:30' },
  { id: 'f2', nom: 'Fournisseur B — semi-remorque', court: 'Fournisseur B', type: 'semi', origine: 'un fournisseur, en direct', palettes: 24, arrivee: '07:00' },
  { id: 'f3', nom: 'Fournisseur C — porteur', court: 'Fournisseur C', type: 'porteur', origine: 'un fournisseur, en direct', palettes: 18, arrivee: '07:30' },
  { id: 'allemagne', nom: 'Camion d’un centre IKEA d’Allemagne', court: 'Allemagne', type: 'semi', origine: 'un centre IKEA d’Allemagne', palettes: 30, arrivee: '08:00' },
  { id: 'caisse', nom: 'Caisse mobile vide (de Bercy)', court: 'Caisse mobile', type: 'porteur', origine: 'le port de Bercy', palettes: 0, arrivee: '09:00', dur: 30 },
];
export const parId = Object.fromEntries(CAMIONS.map((c) => [c.id, c]));
export const dureeDe = (c) => (c.dur != null ? c.dur : c.palettes * MIN_PAR_PALETTE);
export const longueur = (c) => Math.ceil(dureeDe(c) / PAS);
export const libType = (t) => (t === 'semi' ? 'semi-remorque' : 'porteur');
// L'aléa : le camion d'Allemagne annonce 1 h 30 de retard.
export const RETARDATAIRE = 'allemagne';
export const RETARD_MIN = 90;
export const ARRIVEE_APRES = heureDe(slotDe(parId[RETARDATAIRE].arrivee) + RETARD_MIN / PAS);   // '09:30'
export const arriveeSlot = (c, version) => slotDe(c.id === RETARDATAIRE && version === 2 ? ARRIVEE_APRES : c.arrivee);

// ─────────────────────────────────────────────────────────────── le jugement d'un planning (lu sur `{ carte: { r, s } }`, `s` = créneau de début)
export const toutesPosees = (place) => CAMIONS.every((c) => place && place[c.id] && place[c.id].s != null && QUAIS_IDS.includes(place[c.id].r));
// Les camions qui commencent avant leur arrivée.
export function tropTot(place, version = 1) { return CAMIONS.filter((c) => place && place[c.id] && place[c.id].s < arriveeSlot(c, version)).map((c) => c.id); }
// Les camions posés sur un quai qui ne leur convient pas (une semi-remorque ne va pas au quai des porteurs).
export function malPlaces(place) { return CAMIONS.filter((c) => c.type === 'semi' && place && place[c.id] && place[c.id].r === QUAI_PORTEURS).map((c) => c.id); }
// Les couples de camions qui se chevauchent sur un même quai, ou qui prennent le créneau de la veille.
export function chevauchements(place) {
  const S = CAMIONS.filter((c) => place && place[c.id] && QUAIS_IDS.includes(place[c.id].r) && place[c.id].s != null)
    .map((c) => ({ id: c.id, r: place[c.id].r, s: place[c.id].s, e: place[c.id].s + longueur(c) }));
  const out = [];
  for (let a = 0; a < S.length; a++) for (let b = a + 1; b < S.length; b++) if (S[a].r === S[b].r && S[a].s < S[b].e && S[b].s < S[a].e) out.push([S[a].id, S[b].id]);
  const o = { s: slotDe(OCCUPE.de), e: slotDe(OCCUPE.a) };
  S.forEach((x) => { if (x.r === OCCUPE.quai && x.s < o.e && o.s < x.e) out.push([x.id, 'veille']); });
  return out;
}

// ─────────────────────────────────────────────────────────────── lectures de la base de l'élève
export const planningEnvoye = (db, v = 2) => (db && db.plannings && db.plannings[PL] && db.plannings[PL][`v${v}`]) || null;
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
