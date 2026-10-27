// Airbus Helicopters — le magasin des pièces de rechange de Marignane : les DONNÉES PURES des séances ENT-18.1 à 18.5 (Terminale, C2.6 « confier
// l'expédition à un prestataire de transport externe », C3.1 « adapter le processus logistique selon le type de produit ou de flux »). Importé par la
// fabrique (`contenus/airbus.js`), les contenus de séance, les corrigés et les tests. Cadrage : `docs/briefs/airbus/CADRAGE-airbus-tle.md`.
//
// VÉRIFIÉ (recherche web, 27/10/2026) : Airbus Helicopters, site de Marignane (Bouches-du-Rhône), « 3e site industriel français » ; un nouveau magasin
// de pièces de rechange neuves pour toute la gamme d'hélicoptères (site des Florides) ; un service « AOG » (hélicoptère immobilisé au sol) chargé de
// livrer les pièces de façon « ultra-rapide » (offres d'emploi Airbus Helicopters, 2026) ; 361 hélicoptères livrés en 2024, commandes de 182 clients
// dans 42 pays (communiqué Airbus du 27/01/2025).
// CONSTRUIT : les prestataires (noms génériques), leurs tarifs, délais et limites, la règle de choix du site, les pièces, les colis, les clients, les
// distances, les prénoms (Nathalie, Sofiane).

// ─────────────────────────────────────────── les prestataires (CONSTRUITS)
// diviseur : poids volumétrique (kg) = L × l × h (cm) ÷ diviseur ; tarif au kg taxable avec un minimum, ou au km ; longueur maximale d'un colis.
export const PRESTAS = [
  { id: 'messagerie', nom: 'Messagerie (route, groupage)', delai: 2, parKg: 0.8, minimum: 30, diviseur: 4000, longMax: 300, md: 40 },
  { id: 'express', nom: 'Express (livré le lendemain avant midi)', delai: 1, parKg: 3, minimum: 60, diviseur: 5000, longMax: 150, md: 90 },
  { id: 'coursier', nom: 'Coursier dédié (départ immédiat, livré le jour même)', delai: 0, parKm: 1.5, kmMax: 800, longMax: 250, md: 0 },
  { id: 'affretement', nom: 'Affrètement (camion plateau dédié)', delai: 1, parKm: 2, minimum: 350, longMax: 1400, md: 0 },
];
export const PRESTA = Object.fromEntries(PRESTAS.map((p) => [p.id, p]));

// ─────────────────────────────────────────── les calculs
const arrondi2 = (x) => Math.round(x * 100) / 100;
export const volumetrique = (c, p) => arrondi2((c.L * c.l * c.h) / PRESTA[p].diviseur);
// Poids taxable : le plus grand du poids réel et du poids volumétrique, arrondi au kg supérieur.
export const taxable = (c, p) => Math.ceil(Math.max(c.kg, volumetrique(c, p)));
export function offre(E, p) {
  const P = PRESTA[p];
  if (E.colis.L > P.longMax) return { ok: false, pourquoi: 'trop long' };
  if (P.kmMax && E.km > P.kmMax) return { ok: false, pourquoi: 'trop loin' };
  if (P.delai > E.delai) return { ok: false, pourquoi: 'trop lent' };
  const md = E.danger ? P.md : 0;
  if (P.parKg) { const t = taxable(E.colis, p); return { ok: true, taxable: t, cout: arrondi2(Math.max(P.minimum, P.parKg * t) + md) }; }
  return { ok: true, cout: arrondi2(Math.max(P.minimum || 0, P.parKm * E.km) + md) };
}
// La règle du site : 1) hélicoptère au sol (AOG) → le plus RAPIDE qui accepte le colis (le coursier s'il peut y aller, sinon l'express) ;
// 2) sinon → le MOINS CHER parmi ceux qui acceptent le colis et livrent à temps.
export function choix(E) {
  const ok = PRESTAS.filter((p) => offre(E, p.id).ok);
  if (E.aog) return ok.slice().sort((a, b) => a.delai - b.delai)[0].id;
  return ok.slice().sort((a, b) => offre(E, a.id).cout - offre(E, b.id).cout)[0].id;
}
export function bilan(D) {
  const presta = Object.fromEntries(D.expeditions.map((E) => [E.no, choix(E)]));
  const off = Object.fromEntries(D.expeditions.map((E) => [E.no, offre(E, presta[E.no])]));
  return { presta, off, danger: D.expeditions.filter((E) => E.danger).map((E) => E.no) };
}
// Ce qu'a réservé le collègue d'ENT-18.4 : son choix et son coût (il prend toujours le poids réel, jamais le volumétrique). Ses réservations fausses :
// le prestataire OU le coût n'est pas le bon.
export function travailDeSofiane(D) {
  const B = bilan(D);
  const cout = (E) => { const P = PRESTA[D.choixCollegue[E.no]]; return P.parKg ? arrondi2(Math.max(P.minimum, P.parKg * Math.ceil(E.colis.kg)) + (E.danger ? P.md : 0)) : offre(E, P.id).cout; };
  const couts = Object.fromEntries(D.expeditions.map((E) => [E.no, cout(E)]));
  const faux = D.expeditions.map((E) => E.no).filter((no) => D.choixCollegue[no] !== B.presta[no] || couts[no] !== B.off[no].cout);
  return { faux, couts };
}

// ─────────────────────────────────────────── les jeux
// expédition : { no, client, ville, km, piece, colis: { L, l, h (cm), kg }, delai (jours ouvrés demandés), aog, danger }
const X = (no, client, ville, km, piece, [L, l, h, kg], delai, o = {}) => ({ no, client, ville, km, piece, colis: { L, l, h, kg }, delai, aog: false, danger: false, ...o });
// ENT-18.1 (guidage, C2.6) : quatre expéditions de routine ; le capot léger mais encombrant (taxable 144 kg pour 12 kg réels) ; le kit demandé pour
// demain part en express.
export const D181 = {
  code: 'ENT-18.1', jour: 'lundi 2 novembre',
  expeditions: [
    X('EXP-1801', 'un opérateur de transport sanitaire', 'Toulouse', 400, 'Filtre à huile de boîte de transmission', [40, 30, 20, 6], 3),
    X('EXP-1802', 'une école de pilotage', 'Lyon', 320, 'Capot moteur en composite', [120, 80, 60, 12], 3),
    X('EXP-1803', 'un opérateur de travail aérien', 'Paris', 770, 'Kit de joints d’étanchéité', [30, 20, 10, 2], 1),
    X('EXP-1804', 'un centre de maintenance', 'Bordeaux', 650, 'Pompe hydraulique', [110, 60, 50, 140], 2),
  ],
  calcul: ['EXP-1802', 'EXP-1804'],
};
// ENT-18.2 (entraînement, C2.6) : cinq expéditions ; un carénage encombrant à 160 km (la messagerie bat le coursier de peu), un calculateur pour
// demain à 990 km (express : trop loin pour le coursier), un arbre de 2,8 m (seule la messagerie et l'affrètement le prennent).
export const D182 = {
  code: 'ENT-18.2', jour: 'mardi 3 novembre',
  expeditions: [
    X('EXP-1811', 'un opérateur offshore', 'Montpellier', 160, 'Carénage de queue', [140, 90, 70, 15], 2),
    X('EXP-1812', 'une gendarmerie (unité aérienne)', 'Nantes', 990, 'Calculateur de bord', [50, 40, 30, 9], 1),
    X('EXP-1813', 'un centre de maintenance', 'Lille', 1000, 'Arbre de transmission', [280, 30, 30, 45], 3),
    X('EXP-1814', 'une école de pilotage', 'Nice', 200, 'Jeu de plaquettes de frein de rotor', [30, 30, 20, 8], 2),
    X('EXP-1815', 'un opérateur de transport sanitaire', 'Strasbourg', 800, 'Siège d’équipage', [90, 70, 110, 28], 3),
  ],
  calcul: ['EXP-1811', 'EXP-1815'],
};
// ENT-18.3 (guidage, C3.1) : les flux particuliers ; un hélicoptère au sol à Grenoble (AOG, coursier) ; une pale de rotor de 5,5 m (affrètement) ;
// une batterie lithium (marchandise dangereuse : supplément et déclaration) ; un AOG trop loin pour le coursier (express).
export const D183 = {
  code: 'ENT-18.3', jour: 'jeudi 5 novembre',
  expeditions: [
    X('EXP-1821', 'un opérateur de secours en montagne', 'Grenoble', 300, 'Servocommande', [60, 40, 30, 11], 0, { aog: true }),
    X('EXP-1822', 'un opérateur de travail aérien', 'Tours', 820, 'Pale de rotor principal', [550, 60, 30, 70], 5),
    X('EXP-1823', 'un centre de maintenance', 'Lyon', 320, 'Batterie lithium-ion de démarrage', [50, 30, 30, 25], 2, { danger: true }),
    X('EXP-1824', 'une gendarmerie (unité aérienne)', 'Rennes', 1150, 'Démarreur-générateur', [45, 35, 30, 14], 1, { aog: true }),
  ],
  calcul: ['EXP-1821', 'EXP-1823'],
};
// ENT-18.4 (erreur induite) : les réservations de Sofiane : l'AOG de Clermont-Ferrand mis en messagerie (moins cher, mais deux jours) ; le capotage
// réservé sur le poids réel (le bon prestataire, mais le coût faux : 30 € au minimum au lieu de 0,8 × 210 = 168 €) ; le roulement est juste.
export const D184 = {
  code: 'ENT-18.4', jour: 'lundi 9 novembre', collegue: 'Sofiane',
  expeditions: [
    X('EXP-1831', 'un opérateur de transport sanitaire', 'Clermont-Ferrand', 480, 'Pompe à carburant', [40, 30, 30, 7], 0, { aog: true }),
    X('EXP-1832', 'une école de pilotage', 'Pau', 560, 'Capotage de turbine', [150, 70, 80, 9], 3),
    X('EXP-1833', 'un centre de maintenance', 'Toulouse', 400, 'Roulement de rotor', [30, 30, 25, 18], 2),
  ],
  choixCollegue: { 'EXP-1831': 'messagerie', 'EXP-1832': 'messagerie', 'EXP-1833': 'messagerie' },
  calcul: ['EXP-1831', 'EXP-1832', 'EXP-1833'],
};
// ENT-18.5 (évaluation) : jeu NEUF ; un encombrant, un AOG, une batterie, une routine.
export const D185 = {
  code: 'ENT-18.5', jour: 'jeudi 12 novembre',
  expeditions: [
    X('EXP-1841', 'une école de pilotage', 'Avignon', 100, 'Porte de soute', [130, 100, 40, 14], 3),
    X('EXP-1842', 'un opérateur de secours en montagne', 'Chambéry', 360, 'Tachymètre de rotor', [25, 20, 15, 1.5], 0, { aog: true }),
    X('EXP-1843', 'un centre de maintenance', 'Nantes', 990, 'Batterie lithium-ion de démarrage', [50, 30, 30, 25], 2, { danger: true }),
    X('EXP-1844', 'un opérateur offshore', 'Marseille', 30, 'Filtre de climatisation', [50, 40, 30, 3], 2),
  ],
  calcul: ['EXP-1841', 'EXP-1843'],
};

export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
