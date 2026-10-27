// Schneider Electric — les DONNÉES des séances ENT-22.1 à 22.10 (CAP OL, entreprise n° 22 : le centre de distribution d'Évreux, Eure).
// Données pures : aucun effet de bord, aucune dépendance au navigateur (se charge aussi sous Node). Cadrage : `docs/briefs/schneider/CADRAGE-schneider-cap.md`.
//
// RÉEL (recherche du 27/10/2026, sources dans le cadrage) : le centre d'Évreux (zone du Long-Buisson, bâti en 2014, HQE) fait 43 000 m² en six
// cellules de 6 000 m², environ 350 salariés et 40 000 références (2019) ; 12 000 à 21 000 lignes de commande par jour, 24 h sur 24 cinq jours sur
// sept ; il livre la France et les plateformes européennes du groupe (120 pays) ; chaque jour environ 5 000 cartons reçus (56 % recyclés) ;
// 60 000 palettes reçues réutilisées par d'autres sites du groupe ; deux exosquelettes pour les cartons de plus de 25 kg ; un drone d'inventaire ;
// des chariots automatisés. Septembre 2025 : premier centre de distribution « circulaire » du groupe, « Sustainability Lighthouse » du Forum
// économique mondial ; énergie -18 % et plastique à usage unique -40 % en deux ans ; commande et reprise de plus de 3 000 types de produits.
// L'usine du Vaudreuil (Eure) fabrique des contacteurs (2019) ; le siège social est à Rueil-Malmaison (Hauts-de-Seine).
// CONSTRUIT (dit dans les séances) : les camions, leurs heures, quais, scellés et palettes ; le protocole du quai ; les bons de livraison et les
// comptages ; les adresses du palettier et sa plaque de charge ; les palettes, leurs poids et hauteurs ; les comptages du drone ; les produits
// (désignations génériques, aucune référence du catalogue) ; l'équipe et les prénoms.
// ⚠ Les jeux des évaluations (22.6, 22.10) sont une fonction de la graine de l'élève ET de ce fichier : ne rien y changer pendant qu'une classe joue.

import { empreinte, graineDeBase } from '../core/tirage.js';

// ─────────────────────────────────────────── les produits (construits, désignations génériques)
const p = (id, nom, kg) => ({ id, nom, kg });
export const PRODUITS = Object.fromEntries([
  p('disj', 'Disjoncteurs modulaires (carton de 12)', 1.8),
  p('diff', 'Interrupteurs différentiels (carton de 6)', 2.4),
  p('prise', 'Prises de courant (carton de 20)', 2),
  p('contacteur', 'Contacteurs (carton de 10)', 3.5),
  p('coffret', 'Coffret électrique de trois rangées', 7.5),
  p('borne', 'Borne de recharge murale', 14),
  p('variateur', 'Variateur de vitesse', 19),
  p('variateur-g', 'Variateur de vitesse, grand modèle', 27),
  p('onduleur', 'Onduleur', 32),
  p('armoire', 'Armoire électrique en métal', 48),
  p('interrupteur', 'Interrupteurs (carton de 25)', 3),
  p('tableau', 'Tableau électrique prêt à poser', 11),
].map((x) => [x.id, x]));
export const nomDe = (id) => PRODUITS[id].nom;
export const KG_AIDE = 25;     // RÉEL (2019) : les exosquelettes servent aux cartons de plus de 25 kg ; CONSTRUIT : la règle « ou à deux »
export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ─────────────────────────────────────────── la réception : les camions et le pré-contrôle (construits)
export const QUAIS = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'];
const camion = (id, de, heure, quai, palettes, avis, scelle) => ({ id, de, heure, quai, palettes, avis, scelle });
// ENT-22.2 (guidage) : le planigramme du lundi ; « ton » camion est C2 (usine du Vaudreuil).
export const PLAN222 = [
  camion('C1', 'Un fournisseur de cartons d’emballage', '06:00', 'Q2', 22, 'AE-5310', '448 102'),
  camion('C2', 'L’usine du Vaudreuil (contacteurs)', '07:30', 'Q5', 18, 'AE-5318', '448 213'),
  camion('C3', 'Une usine du groupe en Europe', '09:00', 'Q3', 26, 'AE-5322', '448 377'),
  camion('C4', 'Un autre centre de distribution du groupe', '10:30', 'Q7', 12, 'AE-5327', '448 420'),
];
export const MON222 = 'C2';
export const HEURES = ['06:00', '07:30', '09:00', '10:30', '12:00'];

// Une situation de pré-contrôle : ce que dit l'avis d'expédition, ce que tu vois au quai. Le juste se CALCULE.
//   decharger : tout concorde ; reserve : on décharge et on note (palettes en moins ou en plus, palette abîmée) ;
//   appeler : on n'ouvre pas (scellé différent ou absent, camion qui n'est pas sur le planigramme).
export const PRECONTROLE = [
  { v: 'decharger', lib: 'Tout concorde : je décharge' },
  { v: 'reserve', lib: 'Je décharge, et je note le problème pour les réserves' },
  { v: 'appeler', lib: 'Je n’ouvre pas les portes : j’appelle Nadia' },
  { v: 'refuser', lib: 'Je renvoie le camion sans rien dire' },
];
const sit = (id, camion, avis, vu) => ({ id, camion, avis, vu });
export function precontroleJuste(S) {
  if (!S.avis.planifie || S.vu.scelle !== S.avis.scelle) return 'appeler';
  if (S.vu.palettes !== S.avis.palettes || S.vu.abimee) return 'reserve';
  return 'decharger';
}
export const SIT222 = [
  sit('S1', 'Camion C2, usine du Vaudreuil', { planifie: true, scelle: '448 213', palettes: 18 }, { scelle: '448 213', palettes: 18, abimee: false, etat: 'Les palettes sont droites et bien filmées.' }),
  sit('S2', 'Camion C3, usine du groupe en Europe', { planifie: true, scelle: '448 377', palettes: 26 }, { scelle: '448 371', palettes: 26, abimee: false, etat: 'Le scellé est en place.' }),
  sit('S3', 'Camion C4, autre centre du groupe', { planifie: true, scelle: '448 420', palettes: 12 }, { scelle: '448 420', palettes: 12, abimee: true, etat: 'Une palette penche, son film est déchiré.' }),
];
export const SIT223 = [
  sit('S1', 'Camion C1, usine du Vaudreuil', { planifie: true, scelle: '451 006', palettes: 20 }, { scelle: '451 006', palettes: 20, abimee: false, etat: 'Les palettes sont droites et bien filmées.' }),
  sit('S2', 'Camion C2, usine du groupe en Europe', { planifie: true, scelle: '451 019', palettes: 18 }, { scelle: '451 019', palettes: 17, abimee: false, etat: 'Le scellé est en place.' }),
  sit('S3', 'Camion C3, fournisseur de bornes', { planifie: true, scelle: '451 024', palettes: 24 }, { scelle: 'aucun scellé', palettes: 24, abimee: false, etat: 'Les portes sont fermées, mais sans scellé.' }),
  sit('S4', 'Un camion qui se présente au quai Q8', { planifie: false, scelle: '—', palettes: 0 }, { scelle: '452 880', palettes: 10, abimee: false, etat: 'Ce camion n’est pas sur le planigramme du jour.' }),
];
// Les colis à porter à la main au déchargement : plus de 25 kg, exosquelette ou à deux.
export const LOURDS222 = ['onduleur', 'coffret', 'variateur', 'armoire', 'borne', 'contacteur'];
export const LOURDS223 = ['borne', 'armoire', 'prise', 'onduleur', 'variateur-g', 'coffret'];
export const aAider = (ids) => ids.filter((id) => PRODUITS[id].kg > KG_AIDE);

// ENT-22.3 (entraînement) : le planigramme du mardi ; un camion en avance sur un quai pris.
export const PLAN223 = [
  camion('C1', 'L’usine du Vaudreuil (contacteurs)', '06:00', 'Q4', 20, 'AE-5401', '451 006'),
  camion('C2', 'Une usine du groupe en Europe', '07:30', 'Q1', 18, 'AE-5406', '451 019'),
  camion('C3', 'Un fournisseur de bornes de recharge', '09:00', 'Q1', 24, 'AE-5412', '451 024'),
  camion('C4', 'Un autre centre de distribution du groupe', '10:30', 'Q6', 15, 'AE-5418', '451 031'),
];
export const AVANCE = [
  { v: 'nadia', lib: 'Je préviens Nadia : c’est elle qui décide d’un autre quai ou de l’attente' },
  { v: 'autre', lib: 'Je le mets à un quai libre, sans rien dire' },
  { v: 'renvoyer', lib: 'Je lui dis de revenir demain' },
];
export const CHAUFFEUR = [
  { v: 'salle', lib: 'Non : il attend en salle des chauffeurs, c’est moi qui décharge' },
  { v: 'oui', lib: 'Oui : à deux, on va plus vite' },
  { v: 'cabine', lib: 'Il reste dans sa cabine, moteur allumé' },
];

// ─────────────────────────────────────────── le contrôle : bon de livraison et comptage (construits)
// Une ligne : { id, prod, bl (colis sur le bon), compte (colis comptés), abimes (colis abîmés parmi les comptés), defaut? }. Le statut se CALCULE.
export const STATUTS = [
  { v: 'conforme', lib: 'Conforme' }, { v: 'manquant', lib: 'Il en manque' }, { v: 'trop', lib: 'Il y en a trop' }, { v: 'avarie', lib: 'Colis abîmé' },
];
const l = (id, prod, bl, compte, abimes = 0, defaut = '') => ({ id, prod, bl, compte, abimes, defaut });
export function statut(L) {
  if (L.compte < L.bl) return 'manquant';
  if (L.compte > L.bl) return 'trop';
  if (L.abimes > 0) return 'avarie';
  return 'conforme';
}
export const manque = (lignes) => lignes.reduce((t, L) => t + Math.max(0, L.bl - L.compte), 0);
export const enTrop = (lignes) => lignes.reduce((t, L) => t + Math.max(0, L.compte - L.bl), 0);
export const abimes = (lignes) => lignes.reduce((t, L) => t + L.abimes, 0);
export const DECISIONS = [
  { v: 'sans', lib: 'J’accepte la livraison sans réserve' },
  { v: 'reserves', lib: 'J’accepte la livraison avec des réserves écrites' },
  { v: 'refuser', lib: 'Je refuse toute la livraison' },
];
export const decision = (lignes) => (lignes.every((L) => statut(L) === 'conforme') ? 'sans' : 'reserves');
const pluriel = (n, s, pl) => `${n} ${n > 1 ? pl : s}`;
const court = (prod) => PRODUITS[prod].nom.replace(/ \(.*\)$/, '').toLowerCase();
// La réserve précise : ce qui manque, ce qui est abîmé, ce qui est en trop, avec la désignation.
export function reserveJuste(lignes) {
  const morceaux = [];
  for (const L of lignes) {
    const s = statut(L);
    if (s === 'manquant') morceaux.push(`${pluriel(L.bl - L.compte, 'colis manquant', 'colis manquants')} (${court(L.prod)})`);
    if (s === 'trop') morceaux.push(`${pluriel(L.compte - L.bl, 'colis en trop', 'colis en trop')} (${court(L.prod)})`);
    if (L.abimes > 0) morceaux.push(`${pluriel(L.abimes, 'colis abîmé', 'colis abîmés')} : ${L.defaut} (${court(L.prod)})`);
  }
  return morceaux.join(' ; ');
}
// Trois réserves fausses : vague, chiffres échangés, aucune.
export function reserves(lignes) {
  const juste = reserveJuste(lignes);
  const L1 = lignes.find((L) => statut(L) === 'manquant');
  const L2 = lignes.find((L) => L.abimes > 0);
  const melangee = L1 && L2 ? `${pluriel(L2.abimes + 1, 'colis manquant', 'colis manquants')} (${court(L1.prod)}) ; ${pluriel(Math.max(1, L1.bl - L1.compte - 1) + 1, 'colis abîmé', 'colis abîmés')} (${court(L2.prod)})` : 'Il manque des colis.';
  const L = [{ v: 'juste', lib: juste }, { v: 'vague', lib: 'Sous réserve de déballage' }, { v: 'melangee', lib: melangee }, { v: 'abime', lib: 'Livraison abîmée, à vérifier' }];
  // Les menus de fiche ne sont pas mélangés : la réserve juste ne doit pas être toujours la première. Rang tiré des chiffres de la livraison.
  const k = (manque(lignes) + abimes(lignes) + enTrop(lignes)) % L.length;
  return [...L.slice(k), ...L.slice(0, k)];
}

// ENT-22.4 (guidage)
export const BL224 = { no: 'BL 70 2241', de: 'L’usine du Vaudreuil', lignes: [
  l('L1', 'disj', 40, 40), l('L2', 'diff', 24, 22), l('L3', 'prise', 30, 30, 1, 'carton écrasé'), l('L4', 'contacteur', 18, 18), l('L5', 'coffret', 6, 7),
] };
// ENT-22.5 (entraînement, erreur induite) : le contrôle de Mehdi, deux statuts faux, la décision et la réserve fausses.
export const BL225 = { no: 'BL 70 2287', de: 'Un fournisseur de bornes de recharge', lignes: [
  l('L1', 'variateur', 8, 8), l('L2', 'borne', 10, 9), l('L3', 'disj', 50, 50, 2, 'cartons mouillés'), l('L4', 'contacteur', 20, 22), l('L5', 'prise', 25, 25),
] };
export const MEHDI225 = { statuts: { L1: 'conforme', L2: 'conforme', L3: 'avarie', L4: 'manquant', L5: 'conforme' }, decision: 'sans', reserve: 'Sous réserve de déballage' };
export const erreursMehdi = (bl, M) => bl.lignes.filter((L) => M.statuts[L.id] !== statut(L)).map((L) => L.id);

// ─────────────────────────────────────────── la mise en stock : palettier, plaque de charge, adresses (construits)
// Une adresse : cellule-allée-colonne-niveau, par exemple C3-12-07-2 (niveau 0 = au sol). Charge et hauteur par niveau : la plaque de charge.
export const PLAQUE = [
  { niveaux: [0, 1], kg: 1000, h: 1.6 },
  { niveaux: [2, 3], kg: 800, h: 1.6 },
  { niveaux: [4], kg: 500, h: 1.1 },
];
export const plaqueDe = (niveau) => PLAQUE.find((x) => x.niveaux.includes(niveau));
export const niveauDe = (adr) => Number(String(adr).split('-')[3]);
export const PARTIES = [
  { v: 'cellule', lib: 'la cellule' }, { v: 'allee', lib: 'l’allée' }, { v: 'colonne', lib: 'la colonne' }, { v: 'niveau', lib: 'le niveau' },
];
export const partiesDe = (adr) => { const [c, a, k, n] = String(adr).split('-'); return { cellule: c, allee: a, colonne: k, niveau: n }; };
// Ce que les règles disent d'une palette posée à une adresse, les palettes posées avant elle comptant aussi.
// Rend null (juste) ou la règle cassée : 'adresse' (inconnue ou occupée), 'deja' (une autre palette y est déjà posée), 'poids', 'hauteur'.
export function regleCassee(libres, pal, adr, avant = []) {
  if (!libres.includes(adr)) return 'adresse';
  if (avant.includes(adr)) return 'deja';
  const P = plaqueDe(niveauDe(adr));
  if (pal.kg > P.kg) return 'poids';
  if (pal.h > P.h) return 'hauteur';
  return null;
}
export function jugerRangement(libres, palettes, choix) {
  const poses = [];
  return palettes.map((pal, i) => { const r = regleCassee(libres, pal, choix[i], poses); if (choix[i]) poses.push(choix[i]); return r; });
}
export const adressesJustes = (libres, pal) => libres.filter((a) => !regleCassee(libres, pal, a));
const pal = (id, prod, kg, h) => ({ id, prod, kg, h });
// ENT-22.7 (guidage) : cinq emplacements libres, quatre palettes ; les deux lourdes n'ont que les niveaux 0 et 1.
export const R227 = { libres: ['C3-12-04-0', 'C3-12-05-1', 'C3-12-06-2', 'C3-12-07-3', 'C3-12-08-4'],
  occupes: ['C3-12-09-0', 'C3-12-10-1', 'C3-12-11-2'],
  palettes: [pal('P1', 'armoire', 920, 1.5), pal('P2', 'disj', 380, 1.4), pal('P3', 'prise', 260, 1.0), pal('P4', 'onduleur', 860, 1.2)] };
export const ADR227 = 'C3-12-07-2';
export const GESTES227 = [
  { v: 'scan-pal', lib: 'Je scanne l’étiquette de la palette' },
  { v: 'adresse', lib: 'Le terminal me donne une adresse' },
  { v: 'poser', lib: 'Je pose la palette à cette adresse' },
  { v: 'scan-adr', lib: 'Je scanne l’étiquette de l’emplacement pour confirmer' },
];
export const DEPART227 = ['poser', 'scan-adr', 'scan-pal', 'adresse'];
export const PLAQUE_CHOIX = [
  { v: 'monter', lib: 'Je la monte quand même : c’est le terminal qui l’a dit' },
  { v: 'signaler', lib: 'Je ne la monte pas : je le signale, le terminal me donne une autre adresse' },
  { v: 'allee', lib: 'Je la laisse au sol, dans l’allée' },
];
export const SIT227 = { kg: 950, adr: 'C3-12-07-3' };   // 950 kg proposée au niveau 3 (800 kg) → signaler

// ─────────────────────────────────────────── l'inventaire du drone (construit ; le drone d'inventaire est réel)
// Une adresse : { adr, prod, systeme, drone, main } ; `main` = le recomptage à la main.
const inv = (adr, prod, systeme, drone, main) => ({ adr, prod, systeme, drone, main });
export const RELEVE = [{ v: 'ok', lib: 'Le drone et le système sont d’accord' }, { v: 'recompter', lib: 'Ils ne sont pas d’accord : à recompter à la main' }];
export const releveJuste = (I) => (I.drone === I.systeme ? 'ok' : 'recompter');
export const ECARTS = [
  { v: 'drone', lib: 'Le compte du système est juste : le drone s’est trompé' },
  { v: 'manque', lib: 'Il manque des colis : je signale l’écart' },
  { v: 'trop', lib: 'Il y a des colis en trop : je signale l’écart' },
];
export const ecartJuste = (I) => (I.main === I.systeme ? 'drone' : I.main < I.systeme ? 'manque' : 'trop');
export const INV228 = [
  inv('C2-04-03-2', 'contacteur', 36, 36, 36), inv('C2-04-04-3', 'disj', 48, 44, 48), inv('C2-04-05-1', 'borne', 12, 12, 12),
  inv('C2-04-06-2', 'prise', 60, 57, 57), inv('C2-04-07-4', 'diff', 30, 30, 30),
];
export const R228 = { libres: ['C2-05-01-0', 'C2-05-02-2', 'C2-05-03-4'], occupes: ['C2-05-04-1'],
  palettes: [pal('P1', 'variateur', 610, 1.3), pal('P2', 'interrupteur', 300, 1.5)] };

// ─────────────────────────────────────────── le centre circulaire (22.9)
export const FILIERES = [
  { v: 'carton', lib: 'La benne à carton (recyclé)' }, { v: 'film', lib: 'Le bac à film plastique' },
  { v: 'pile', lib: 'La pile de palettes à réutiliser' }, { v: 'bois', lib: 'La benne à bois' }, { v: 'retours', lib: 'La zone des retours (tri, réparation)' },
];
export const DECHETS = [
  { id: 'd1', lib: 'Un carton vide, déplié', juste: 'carton' },
  { id: 'd2', lib: 'Le film qui entourait une palette', juste: 'film' },
  { id: 'd3', lib: 'Une palette vide en bon état', juste: 'pile' },
  { id: 'd4', lib: 'Une palette vide aux planches cassées', juste: 'bois' },
  { id: 'd5', lib: 'Un vieux disjoncteur repris chez un client', juste: 'retours' },
];
export const CONSEQUENCES = [
  { v: 'facture', lib: 'La facture d’électricité du centre baisse' },
  { v: 'achats', lib: 'Le centre achète moins de palettes neuves' },
  { v: 'dechets', lib: 'Moins d’emballages à jeter et à acheter' },
  { v: 'seconde', lib: 'Des produits sont réparés ou remis à neuf, puis revendus' },
  { v: 'prix', lib: 'Les produits coûtent deux fois plus cher' },
];
export const FAITS229 = [
  { id: 'f1', lib: 'En deux ans, le centre a baissé de 18 % sa consommation d’énergie.', juste: 'facture' },
  { id: 'f2', lib: 'Les 60 000 palettes reçues dans l’année servent à nouveau dans d’autres sites du groupe.', juste: 'achats' },
  { id: 'f3', lib: 'En deux ans, le plastique à usage unique a baissé de 40 %.', juste: 'dechets' },
  { id: 'f4', lib: 'Les clients peuvent faire reprendre plus de 3 000 types de produits.', juste: 'seconde' },
];
export const CARTONS_JOUR = 5000;
export const PART_RECYCLEE = 56;
export const recycles = () => CARTONS_JOUR * PART_RECYCLEE / 100;
export const ECOGESTES = [
  { v: 'plier', lib: 'Je plie les cartons avant de les mettre dans la benne', juste: true },
  { v: 'separer', lib: 'Je sépare le film plastique du carton', juste: true },
  { v: 'pile', lib: 'Je remets en pile une palette en bon état', juste: true },
  { v: 'tout', lib: 'Je jette la palette cassée avec les cartons', juste: false },
  { v: 'porte', lib: 'Je laisse la porte du quai ouverte quand il n’y a pas de camion', juste: false },
];

// ─────────────────────────────────────────── ENT-22.6 : trois jeux (un par élève, d'après sa graine)
export const indiceJeu = (db, n, sel) => empreinte(`${graineDeBase(db)}|schneider|${sel}`) % n;
const JEUX226 = [
  { plan: [camion('C1', 'Une usine du groupe en Europe', '06:00', 'Q3', 16, 'AE-5502', '453 110'),
      camion('C2', 'L’usine du Vaudreuil (contacteurs)', '07:30', 'Q6', 21, 'AE-5509', '453 118'),
      camion('C3', 'Un fournisseur de cartons d’emballage', '09:00', 'Q2', 9, 'AE-5513', '453 124'),
      camion('C4', 'Un autre centre de distribution du groupe', '10:30', 'Q8', 14, 'AE-5520', '453 131')], mon: 'C2',
    sits: [sit('S1', 'Camion C2, usine du Vaudreuil', { planifie: true, scelle: '453 118', palettes: 21 }, { scelle: '453 118', palettes: 20, abimee: false, etat: 'Le scellé est en place.' }),
      sit('S2', 'Camion C4, autre centre du groupe', { planifie: true, scelle: '453 131', palettes: 14 }, { scelle: '453 113', palettes: 14, abimee: false, etat: 'Le scellé est en place.' })],
    lourds: ['onduleur', 'disj', 'variateur', 'armoire', 'tableau'],
    bl: { no: 'BL 70 2302', de: 'L’usine du Vaudreuil', lignes: [l('L1', 'contacteur', 30, 30), l('L2', 'disj', 24, 21), l('L3', 'diff', 12, 12, 1, 'carton éventré'),
      l('L4', 'prise', 20, 20), l('L5', 'coffret', 8, 9)] } },
  { plan: [camion('C1', 'L’usine du Vaudreuil (contacteurs)', '06:00', 'Q1', 19, 'AE-5531', '454 006'),
      camion('C2', 'Un fournisseur de bornes de recharge', '07:30', 'Q4', 12, 'AE-5536', '454 012'),
      camion('C3', 'Une usine du groupe en Europe', '09:00', 'Q7', 25, 'AE-5540', '454 019'),
      camion('C4', 'Un fournisseur de cartons d’emballage', '10:30', 'Q2', 8, 'AE-5544', '454 025')], mon: 'C3',
    sits: [sit('S1', 'Camion C3, usine du groupe en Europe', { planifie: true, scelle: '454 019', palettes: 25 }, { scelle: '454 019', palettes: 25, abimee: false, etat: 'Les palettes sont droites et bien filmées.' }),
      sit('S2', 'Un camion qui se présente au quai Q5', { planifie: false, scelle: '—', palettes: 0 }, { scelle: '455 702', palettes: 11, abimee: false, etat: 'Ce camion n’est pas sur le planigramme du jour.' })],
    lourds: ['borne', 'variateur-g', 'contacteur', 'onduleur', 'coffret'],
    bl: { no: 'BL 70 2318', de: 'Une usine du groupe en Europe', lignes: [l('L1', 'variateur', 10, 10, 2, 'cartons percés'), l('L2', 'interrupteur', 40, 40),
      l('L3', 'borne', 6, 5), l('L4', 'diff', 18, 20), l('L5', 'disj', 36, 36)] } },
  { plan: [camion('C1', 'Un autre centre de distribution du groupe', '06:00', 'Q5', 13, 'AE-5560', '456 300'),
      camion('C2', 'Une usine du groupe en Europe', '07:30', 'Q2', 22, 'AE-5566', '456 307'),
      camion('C3', 'L’usine du Vaudreuil (contacteurs)', '09:00', 'Q8', 17, 'AE-5571', '456 315'),
      camion('C4', 'Un fournisseur de bornes de recharge', '10:30', 'Q3', 10, 'AE-5575', '456 322')], mon: 'C1',
    sits: [sit('S1', 'Camion C1, autre centre du groupe', { planifie: true, scelle: '456 300', palettes: 13 }, { scelle: '456 300', palettes: 13, abimee: true, etat: 'Deux palettes sont écrasées sur le dessus.' }),
      sit('S2', 'Camion C3, usine du Vaudreuil', { planifie: true, scelle: '456 315', palettes: 17 }, { scelle: '456 315', palettes: 17, abimee: false, etat: 'Les palettes sont droites et bien filmées.' })],
    lourds: ['armoire', 'prise', 'tableau', 'variateur-g', 'variateur'],
    bl: { no: 'BL 70 2335', de: 'Un autre centre de distribution du groupe', lignes: [l('L1', 'prise', 30, 32), l('L2', 'contacteur', 16, 16),
      l('L3', 'tableau', 4, 4, 1, 'porte enfoncée'), l('L4', 'interrupteur', 20, 17), l('L5', 'diff', 10, 10)] } },
];
export const TOUS_JEUX226 = JEUX226;
export const jeu226 = (db) => JEUX226[indiceJeu(db, JEUX226.length, '226')];

// ─────────────────────────────────────────── ENT-22.10 : trois jeux
const JEUX2210 = [
  { libres: ['C5-02-03-0', 'C5-02-04-1', 'C5-02-05-2', 'C5-02-06-3', 'C5-02-07-4'], occupes: ['C5-02-08-0', 'C5-02-09-2'],
    palettes: [pal('P1', 'tableau', 880, 1.4), pal('P2', 'interrupteur', 240, 1.0), pal('P3', 'borne', 720, 1.5), pal('P4', 'armoire', 960, 1.5)],
    adr: 'C5-02-06-3', plaque: { kg: 870, adr: 'C5-02-05-2' },
    inv: [inv('C4-07-01-1', 'diff', 24, 24, 24), inv('C4-07-02-3', 'contacteur', 40, 37, 37), inv('C4-07-03-2', 'disj', 18, 18, 18)] },
  { libres: ['C1-08-11-0', 'C1-08-12-2', 'C1-08-13-1', 'C1-08-14-4', 'C1-08-15-3'], occupes: ['C1-08-16-1', 'C1-08-17-4'],
    palettes: [pal('P1', 'onduleur', 940, 1.3), pal('P2', 'variateur', 650, 1.5), pal('P3', 'prise', 210, 0.9), pal('P4', 'coffret', 990, 1.4)],
    adr: 'C1-08-14-4', plaque: { kg: 820, adr: 'C1-08-15-3' },
    inv: [inv('C6-03-05-2', 'borne', 14, 11, 14), inv('C6-03-06-1', 'prise', 50, 50, 50), inv('C6-03-07-3', 'interrupteur', 32, 32, 32)] },
  { libres: ['C4-10-21-4', 'C4-10-22-0', 'C4-10-23-3', 'C4-10-24-1', 'C4-10-25-2'], occupes: ['C4-10-26-0', 'C4-10-27-3'],
    palettes: [pal('P1', 'armoire', 970, 1.5), pal('P2', 'diff', 290, 1.0), pal('P3', 'tableau', 900, 1.4), pal('P4', 'contacteur', 520, 1.5)],
    adr: 'C4-10-23-3', plaque: { kg: 1120, adr: 'C4-10-24-1' },
    inv: [inv('C3-01-02-0', 'variateur', 9, 9, 9), inv('C3-01-03-2', 'disj', 60, 60, 60), inv('C3-01-04-1', 'coffret', 12, 14, 15)] },
];
export const TOUS_JEUX2210 = JEUX2210;
export const jeu2210 = (db) => JEUX2210[indiceJeu(db, JEUX2210.length, '2210')];
// Une palette trop lourde pour le niveau proposé : on signale (le juste ne dépend pas du jeu).
export const plaqueJuste = (kg, adr) => (kg > plaqueDe(niveauDe(adr)).kg ? 'signaler' : 'monter');
