// Kuehne+Nagel — le hub aérien de Roissy-Charles-de-Gaulle : les DONNÉES PURES des séances ENT-24.1 à 24.5 (1re Bac Pro, C1.3 « Préparer l'action de
// réception »). Importé par l'univers (`contenus/kuehne-nagel.js`), les séances, les questions, les corrigés et les tests. Aucun texte d'écran ici.
//
// RÉEL (communiqué de l'inauguration, oct. 2023 ; Journal de l'Aviation, 23/10/2023) : le hub est dans la Cargo City de Roissy-CDG, en bord de piste ;
// 12 900 m² de bâtiments dont 10 500 m² d'entrepôt, 4 500 m² à température dirigée (2 à 8 °C, 15 à 25 °C, -20 à -80 °C, jusqu'à -150 °C) ;
// 260 collaborateurs ; environ 60 % de l'activité est pharmaceutique ; 300 palettes avion par semaine ; pièces d'avion AOG (avion au sol) 24 h sur 24.
// CONSTRUIT : les quais Q1 à Q4 et leur zone, les envois, leurs numéros de lettre de transport aérien (préfixe 999, qui n'est celui d'aucune compagnie),
// les heures de mise à disposition, les heures limites, la règle de durée, les retards, les prénoms.

// ─────────────────────────────────────────── les zones et les quais
export const ZONES = [
  { v: 'froid', lib: 'Chambre froide de 2 à 8 °C', court: '2 à 8 °C' },
  { v: 'ambiant', lib: 'Zone dirigée de 15 à 25 °C', court: '15 à 25 °C' },
  { v: 'general', lib: 'Fret général (sans température)', court: 'fret général' },
];
export const zoneLib = (z) => ZONES.find((x) => x.v === z).lib;
export const zoneCourt = (z) => ZONES.find((x) => x.v === z).court;
export const QUAIS = [
  { id: 'q1', nom: 'Quai 1', zone: 'froid' },
  { id: 'q2', nom: 'Quai 2', zone: 'froid' },
  { id: 'q3', nom: 'Quai 3', zone: 'ambiant' },
  { id: 'q4', nom: 'Quai 4', zone: 'general' },
];
export const zoneDuQuai = (id) => (QUAIS.find((q) => q.id === id) || {}).zone || null;

// La zone d'un produit : ce que dit l'étiquette de température de l'envoi.
export const PRODUITS = {
  vaccins: { nom: 'Vaccins', zone: 'froid', etiquette: 'Conserver entre +2 °C et +8 °C' },
  insuline: { nom: 'Insuline', zone: 'froid', etiquette: 'Conserver entre +2 °C et +8 °C' },
  essais: { nom: 'Médicaments pour un essai clinique', zone: 'froid', etiquette: 'Conserver entre +2 °C et +8 °C' },
  comprimes: { nom: 'Médicaments en comprimés', zone: 'ambiant', etiquette: 'Conserver entre +15 °C et +25 °C' },
  sirops: { nom: 'Sirops et pommades', zone: 'ambiant', etiquette: 'Conserver entre +15 °C et +25 °C' },
  moteur: { nom: 'Pièces de moteur d’avion', zone: 'general', etiquette: 'AOG : avion au sol', aog: true },
  train: { nom: 'Pièces de train d’atterrissage', zone: 'general', etiquette: 'AOG : avion au sol', aog: true },
  montres: { nom: 'Montres de luxe', zone: 'general', etiquette: 'Aucune température' },
  electronique: { nom: 'Composants électroniques', zone: 'general', etiquette: 'Aucune température' },
  textile: { nom: 'Vêtements de créateur', zone: 'general', etiquette: 'Aucune température' },
};

// ─────────────────────────────────────────── la règle de durée (construite) : 15 minutes de mise à quai et de contrôle, puis 10 minutes par palette
export const MISE_A_QUAI = 15, PAR_PALETTE = 10;
export const duree = (palettes) => MISE_A_QUAI + PAR_PALETTE * palettes;

// ─────────────────────────────────────────── l'échelle du planning : 06:00 → 13:00, un créneau tous les 15 minutes
export const DEBUT = 6 * 60, FIN = 13 * 60, PAS = 15;
export const minutes = (hm) => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + (m || 0); };
export const slotDe = (hm) => Math.round((minutes(hm) - DEBUT) / PAS);
export const longueur = (e) => Math.ceil(duree(e.palettes) / PAS);
export const hlib = (hm) => { const [h, m] = String(hm).split(':'); return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`; };

// Un envoi : { id, lta, produit, palettes, vol, des (mis à disposition par la compagnie), avant? (reçu et rangé au plus tard) }.
const e = (id, lta, produit, palettes, vol, des, avant = null) => ({ id, lta, produit, palettes, vol, des, avant, zone: PRODUITS[produit].zone });

// ─────────────────────────────────────────── ENT-24.1 (guidage, fiches) : les pré-alertes de la nuit
export const PRE241 = [
  e('A', '999-4410 2231', 'vaccins', 4, 'vol de Chicago', '06:00', '08:00'),
  e('B', '999-4410 2246', 'comprimes', 5, 'vol de Montréal', '06:30', '10:00'),
  e('C', '999-4410 2250', 'moteur', 2, 'vol de Singapour', '07:30', '09:00'),
  e('D', '999-4410 2265', 'montres', 1, 'vol de Hong Kong', '06:00'),
  e('E', '999-4410 2272', 'insuline', 3, 'vol de Copenhague', '07:00', '09:00'),
];

// ─────────────────────────────────────────── ENT-24.2 (guidage, Planning) : le jeudi matin
export const ENVOIS242 = [
  e('A', '999-4410 3011', 'vaccins', 4, 'vol de Chicago', '06:00', '08:00'),
  e('B', '999-4410 3026', 'insuline', 3, 'vol de Copenhague', '06:30', '09:00'),
  e('C', '999-4410 3030', 'essais', 1, 'vol de Boston', '07:00', '08:00'),
  e('D', '999-4410 3045', 'comprimes', 5, 'vol de Montréal', '06:00', '10:00'),
  e('E', '999-4410 3052', 'sirops', 2, 'vol de Dubaï', '08:00', '11:00'),
  e('F', '999-4410 3064', 'moteur', 2, 'vol de Singapour', '07:30', '09:00'),
  e('G', '999-4410 3071', 'montres', 1, 'vol de Hong Kong', '06:00'),
  e('H', '999-4410 3086', 'electronique', 6, 'vol de Shanghai', '06:30'),
  e('I', '999-4410 3090', 'vaccins', 6, 'vol de New York', '09:00', '11:00'),
];
// L'aléa d'ENT-24.2 : le vol de New York a une heure de retard ; un envoi AOG urgent arrive de Toulouse par la route.
export const ALEA242 = { retard: { I: { des: '10:00', avant: '12:00' } }, ajout: [e('J', '999-4410 3105', 'train', 3, 'camion de Toulouse', '08:00', '09:00')] };

// ─────────────────────────────────────────── ENT-24.3 (entraînement, Planning) : le lundi matin, puis la porte froide du quai 2 en panne
export const ENVOIS243 = [
  e('A', '999-4411 1015', 'vaccins', 3, 'vol de Chicago', '06:00', '07:30'),
  e('B', '999-4411 1020', 'insuline', 2, 'vol de Copenhague', '06:00', '08:00'),
  e('C', '999-4411 1034', 'essais', 2, 'vol de Boston', '07:00', '09:00'),
  e('D', '999-4411 1041', 'vaccins', 5, 'vol de New York', '08:00', '10:30'),
  e('E', '999-4411 1056', 'comprimes', 4, 'vol de Montréal', '06:30', '09:00'),
  e('F', '999-4411 1063', 'sirops', 3, 'vol de Dubaï', '07:30', '10:00'),
  e('G', '999-4411 1077', 'train', 2, 'vol de Singapour', '06:30', '08:00'),
  e('H', '999-4411 1082', 'textile', 4, 'vol de Shanghai', '06:00'),
  e('K', '999-4411 1096', 'electronique', 3, 'vol de Séoul', '07:00'),
];
// L'aléa d'ENT-24.3 : à 6 h 30, la porte froide du quai 2 se bloque (le quai 2 n'existe plus pour la matinée).
export const ALEA243 = { retire: ['q2'] };

// ─────────────────────────────────────────── ENT-24.4 (entraînement, erreur induite, fiches) : le planning de Lucas
// Lucas a planifié cinq envois ; trois de ses lignes sont fausses (une mauvaise zone, un début avant la mise à disposition, une fin après l'heure limite).
export const ENVOIS244 = [
  e('A', '999-4412 0510', 'vaccins', 3, 'vol de Chicago', '06:00', '08:00'),
  e('B', '999-4412 0525', 'sirops', 4, 'vol de Dubaï', '07:00', '10:00'),
  e('C', '999-4412 0532', 'moteur', 2, 'vol de Singapour', '07:30', '08:30'),
  e('D', '999-4412 0547', 'insuline', 2, 'vol de Copenhague', '08:00', '10:00'),
  e('E', '999-4412 0554', 'electronique', 5, 'vol de Shanghai', '06:30'),
];
// Le planning de Lucas : { envoi: [quai, début] }.
export const LUCAS244 = { A: ['q1', '06:00'], B: ['q1', '08:00'], C: ['q4', '08:00'], D: ['q2', '07:30'], E: ['q4', '06:30'] };
// Les corrections attendues : B au quai 3 ; C à 7 h 45 (E occupe le quai 4 jusqu'à 7 h 35, C doit finir avant 8 h 30) ; D à 8 h (disponible à 8 h).
export const CORR244 = { B: { quais: ['q2', 'q3', 'q4'], juste: 'q3' }, C: { heures: ['07:30', '07:45', '08:15'], juste: '07:45' }, D: { heures: ['07:30', '08:00', '10:00'], juste: '08:00' } };
export const DEFAUTS = [
  { v: 'juste', lib: 'Rien à redire' },
  { v: 'zone', lib: 'Le quai n’est pas dans la bonne zone de température' },
  { v: 'tot', lib: 'Le déchargement commence avant que l’envoi soit disponible' },
  { v: 'tard', lib: 'Le déchargement finit après l’heure limite' },
  { v: 'deux', lib: 'Deux envois sur le même quai en même temps' },
];

// ─────────────────────────────────────────── ENT-24.5 (évaluation, fiches + Planning) : le mercredi matin, un jeu neuf
export const PRE245 = [
  e('A', '999-4413 7710', 'insuline', 4, 'vol de Copenhague', '06:00', '08:00'),
  e('B', '999-4413 7725', 'sirops', 3, 'vol de Dubaï', '06:30', '09:30'),
  e('C', '999-4413 7731', 'train', 2, 'vol de Singapour', '07:00', '08:30'),
  e('D', '999-4413 7746', 'textile', 3, 'vol de Shanghai', '06:00'),
];
export const ENVOIS245 = [
  ...PRE245,
  e('E', '999-4413 7752', 'vaccins', 2, 'vol de Boston', '06:30', '08:00'),
  e('F', '999-4413 7767', 'comprimes', 4, 'vol de Montréal', '07:30', '10:30'),
  e('G', '999-4413 7773', 'essais', 3, 'vol de New York', '08:00', '10:00'),
  e('H', '999-4413 7788', 'montres', 2, 'vol de Hong Kong', '07:00'),
];
// L'aléa d'ENT-24.5 : le vol de Boston a 45 minutes de retard ; un envoi AOG urgent s'ajoute.
export const ALEA245 = { retard: { E: { des: '07:15', avant: '09:00' } }, ajout: [e('J', '999-4413 7790', 'moteur', 2, 'camion de Bordeaux', '08:00', '09:00')] };

// ─────────────────────────────────────────── appliquer un aléa, juger un planning
export const apresAlea = (envois, A) => [...envois.map((x) => ({ ...x, ...((A.retard && A.retard[x.id]) || {}) })), ...(A.ajout || [])];
export const quaisApres = (A) => QUAIS.filter((q) => !(A.retire || []).includes(q.id));
// Ce qu'une ligne de planning casse : 'zone', 'tot', 'tard', ou null. `debut` en 'HH:MM'.
export function defautDe(envoi, quai, debut) {
  if (zoneDuQuai(quai) !== envoi.zone) return 'zone';
  if (minutes(debut) < minutes(envoi.des)) return 'tot';
  if (envoi.avant && minutes(debut) + duree(envoi.palettes) > minutes(envoi.avant)) return 'tard';
  return null;
}
// Le défaut de chaque ligne d'un planning tout fait (les chevauchements comptent : une ligne qui en recouvre une autre du même quai = 'deux').
export function defautsPlanning(envois, P) {
  const out = {};
  for (const x of envois) {
    const [q, d] = P[x.id];
    let f = defautDe(x, q, d);
    if (!f) {
      const deb = minutes(d), fin = deb + duree(x.palettes);
      if (envois.some((y) => y.id !== x.id && P[y.id][0] === q && minutes(P[y.id][1]) < fin && deb < minutes(P[y.id][1]) + duree(y.palettes))) f = 'deux';
    }
    out[x.id] = f || 'juste';
  }
  return out;
}
// Un planning est-il possible ? Recherche exhaustive (quarts d'heure, quais de la bonne zone) ; rend une solution { envoi: [quai, créneau] } ou null.
export function solution(envois, quais = QUAIS) {
  const L = [...envois].sort((a, b) => (a.avant ? minutes(a.avant) : 9999) - (b.avant ? minutes(b.avant) : 9999) || minutes(a.des) - minutes(b.des));
  const occ = Object.fromEntries(quais.map((q) => [q.id, []]));
  const res = {};
  const NB = (FIN - DEBUT) / PAS;
  const go = (i) => {
    if (i === L.length) return true;
    const x = L[i], n = longueur(x);
    for (const q of quais.filter((y) => y.zone === x.zone)) {
      for (let s = slotDe(x.des); s + n <= NB; s++) {
        if (x.avant && s + n > slotDe(x.avant)) break;
        if (occ[q.id].some(([a, b]) => s < b && a < s + n)) continue;
        occ[q.id].push([s, s + n]); res[x.id] = [q.id, s];
        if (go(i + 1)) return true;
        occ[q.id].pop(); delete res[x.id];
      }
    }
    return false;
  };
  return go(0) ? { ...res } : null;
}
// Les heures : `heureDe(créneau)`.
export const heureDe = (slot) => { const m = DEBUT + slot * PAS; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
export const total = (L, f) => L.reduce((t, x) => t + f(x), 0);
