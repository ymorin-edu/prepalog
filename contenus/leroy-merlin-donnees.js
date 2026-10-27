// Leroy Merlin — les DONNÉES des séances ENT-20.1 à 20.8 (1re Bac Pro, entreprise n° 20 : la plateforme logistique nationale de Réau, Seine-et-Marne).
// Données pures : aucun effet de bord, aucune dépendance au navigateur (se charge aussi sous Node). Cadrage : `docs/briefs/leroy-merlin/CADRAGE-leroy-merlin-1re.md`.
//
// RÉEL (recherche du 27/10/2026) : Réau, inaugurée en avril 2019, 72 000 m² en 12 cellules, plateforme nationale depuis l'été 2021 (EcommerceMag,
// 01/04/2021) ; 36 000 m² automatisés avec Still, 27 chariots automatiques, 3 600 mouvements de palettes par jour, 4 000 références, livraisons vers
// 140 magasins et les clients e-commerce, objectif « zéro accident du travail » (Stratégies Logistique, 07/10/2022) ; trois sites nationaux (Dourges,
// Valence, Réau), huit régionaux et trois e-commerce ; colis de moins de 30 kg livrés à J+1, encombrants à J+3 (Stratégies Logistique, 11/08/2022).
// Droit (résumé) : protocole de sécurité des opérations de chargement et de déchargement (Code du travail, R4515-4 et suivants) ; port de charges
// (R4541-9) ; principes généraux de prévention (L4121-2).
// CONSTRUIT (dit dans les séances) : les situations de travail, les mesures, le relevé de Kevin, les accidents et les heures du site, les commandes,
// les clients, les magasins demandeurs, les stocks, les jours de livraison (lundi au samedi), les prénoms.
// ⚠ Les jeux des évaluations (20.4, 20.8) sont une fonction de la graine de l'élève ET de ce fichier : ne rien y changer pendant qu'une classe joue.

import { empreinte, graineDeBase } from '../core/tirage.js';

// ─────────────────────────────────────────── C1.2 : les risques, les mesures
export const RISQUES = [
  { v: 'tms', lib: 'Mal de dos, troubles musculosquelettiques (port de charges, mauvaise posture)' },
  { v: 'collision', lib: 'Heurt entre un piéton et un chariot' },
  { v: 'chute-objet', lib: 'Chute d’une charge depuis le rack' },
  { v: 'chute-pied', lib: 'Glissade ou chute de plain-pied' },
  { v: 'quai', lib: 'Départ du camion pendant le chargement, chute au bord du quai' },
  { v: 'incendie', lib: 'Incendie' },
];
// Le niveau de la mesure (principes généraux de prévention, L4121-2 : supprimer le risque, puis protéger tout le monde, puis la personne).
export const NIVEAUX = [
  { v: 'supprimer', lib: 'Supprimer le danger' },
  { v: 'collective', lib: 'Protection collective (aide mécanique, balisage, plan de circulation…)' },
  { v: 'individuelle', lib: 'Protection individuelle (EPI : gants, chaussures, gilet…)' },
];
const m = (v, lib, niveau) => ({ v, lib, niveau });
// Chaque situation : le risque, la meilleure mesure (et son niveau), deux mesures moins bonnes ou fausses. CONSTRUITES.
export const SITUATIONS = {
  carrelage: { texte: 'Un préparateur porte seul, à la main, des cartons de carrelage de 32 kg du bas du rack jusqu’à son chariot.', risque: 'tms',
    mesures: [m('aide', 'Prendre les cartons avec une aide mécanique (gerbeur, table élévatrice)', 'collective'),
      m('gants', 'Mettre des gants pour mieux tenir les cartons', 'individuelle'), m('vite', 'Aller plus vite pour finir avant la pause', null)], juste: 'aide' },
  allee: { texte: 'Pour aller plus vite à la pause, un collègue coupe l’allée des chariots au lieu de suivre le passage piéton.', risque: 'collision',
    mesures: [m('passage', 'Rappeler le plan de circulation : piétons dans les passages marqués au sol', 'collective'),
      m('gilet', 'Lui dire de mettre son gilet haute visibilité, et c’est tout', 'individuelle'), m('klaxon', 'Demander aux caristes de klaxonner plus fort', null)], juste: 'passage' },
  film: { texte: 'En haut du rack, une palette de sacs de ciment a son film déchiré : un sac dépasse dans l’allée.', risque: 'chute-objet',
    mesures: [m('baliser', 'Baliser l’allée sous la palette et prévenir le chef d’équipe', 'collective'),
      m('casque', 'Passer dessous avec un casque', 'individuelle'), m('pousser', 'Monter sur le rack pour repousser le sac', null)], juste: 'baliser' },
  quai: { texte: 'Au quai 6, le chauffeur reste dans sa cabine, moteur allumé, pendant que le cariste entre dans la remorque.', risque: 'quai',
    mesures: [m('cles', 'Moteur coupé, clé remise au quai, camion calé avant que le cariste entre', 'supprimer'),
      m('rapide', 'Décharger vite pour que le chauffeur reparte plus tôt', null), m('gilet-quai', 'Le cariste met son gilet haute visibilité', 'individuelle')], juste: 'cles' },
  sable: { texte: 'Un sac de sable s’est percé : du sable est répandu au sol devant le quai 4.', risque: 'chute-pied',
    mesures: [m('nettoyer', 'Baliser la zone, puis nettoyer tout de suite', 'supprimer'),
      m('contourner', 'Prévenir les collègues de contourner, sans nettoyer', null), m('chaussures', 'Vérifier que tout le monde a ses chaussures de sécurité', 'individuelle')], juste: 'nettoyer' },
  agv: { texte: 'Un chariot automatique arrive dans l’allée réservée où tu es en train de compter des colis.', risque: 'collision',
    mesures: [m('zone', 'Ne jamais travailler dans une allée réservée aux chariots automatiques : demander l’arrêt de l’allée avant d’y entrer', 'supprimer'),
      m('arreter', 'Lever la main pour qu’il s’arrête', null), m('gilet-agv', 'Mettre ton gilet pour qu’il te voie', 'individuelle')], juste: 'zone' },
  cartons: { texte: 'Des cartons vides s’empilent contre le local de charge des batteries des chariots.', risque: 'incendie',
    mesures: [m('evacuer', 'Évacuer les cartons vers la benne et dégager les abords du local', 'supprimer'),
      m('extincteur', 'Vérifier qu’il y a un extincteur pas loin', null), m('plus-tard', 'Les laisser jusqu’à la fin de la journée', null)], juste: 'evacuer' },
  peinture: { texte: 'Pour poser un pot de peinture de 15 L en bas du rack, tu te penches en avant, jambes tendues.', risque: 'tms',
    mesures: [m('flechir', 'Plier les jambes, garder le dos droit, la charge près du corps', null),
      m('ceinture', 'Mettre une ceinture lombaire et continuer comme avant', 'individuelle'), m('jeter', 'Laisser glisser le pot jusqu’en bas', null)], juste: 'flechir' },
};
// La posture n'est pas une « protection collective » : c'est une consigne de travail. On ne demande pas son niveau (`niveauDemande: false`).
SITUATIONS.peinture.niveauDemande = false;
export const mesureJuste = (k) => SITUATIONS[k].mesures.find((x) => x.v === SITUATIONS[k].juste);

// Les EPI par zone (CONSTRUITS, conformes à l'usage) : ce qui est obligatoire.
export const EPI = [
  { v: 'chaussures', lib: 'Chaussures de sécurité', juste: true },
  { v: 'gilet', lib: 'Gilet haute visibilité', juste: true },
  { v: 'gants', lib: 'Gants de manutention', juste: true },
  { v: 'casque-audio', lib: 'Casque audio pour la musique', juste: false },
  { v: 'bijoux', lib: 'Bague et bracelet', juste: false },
];

// Le protocole de sécurité au quai : l'ordre des étapes (CONSTRUIT d'après l'usage ; le protocole écrit est une obligation réelle).
export const QUAI = [
  { v: 'accueil', lib: 'Le chauffeur se présente à l’accueil avec ses documents et reçoit le protocole' },
  { v: 'aquai', lib: 'Il met le camion à quai, coupe le moteur et serre le frein' },
  { v: 'cle', lib: 'Il remet la clé au quai ; le camion est calé' },
  { v: 'attente', lib: 'Il attend dans la zone chauffeurs, hors de la zone de manutention' },
  { v: 'decharge', lib: 'Le cariste vérifie le feu et le niveleur, puis décharge' },
  { v: 'fin', lib: 'Fin du déchargement : le cariste rend la clé, le chauffeur repart' },
];
export const QUAI_DEPART = ['decharge', 'accueil', 'fin', 'cle', 'attente', 'aquai'];

// Le taux de fréquence et le taux de gravité (formules RÉELLES, utilisées par l'Assurance maladie et l'INRS) :
// TF = accidents avec arrêt × 1 000 000 ÷ heures travaillées ; TG = jours d'arrêt × 1 000 ÷ heures travaillées.
export const tf = (A) => Math.round((A.accidents * 1e6 / A.heures) * 100) / 100;
export const tg = (A) => Math.round((A.jours * 1e3 / A.heures) * 100) / 100;
export const ACC202 = { annee: 2025, accidents: 6, jours: 84, heures: 480000 };      // CONSTRUIT : TF 12,5 ; TG 0,18 (0,175)
// Les causes des accidents de l'année (CONSTRUITES), pour le diagramme de la séance 20.2.
export const CAUSES202 = [{ cause: 'Port de charges', n: 3 }, { cause: 'Heurt chariot / piéton', n: 1 }, { cause: 'Chute de plain-pied', n: 2 }];

// ENT-20.3 : le relevé de Kevin (CONSTRUIT). Pour chaque situation, ce qu'il a écrit ; trois lignes fausses.
export const KEVIN = [
  { s: 'carrelage', risque: 'tms', mesure: 'gants' },          // faux : la mesure (des gants au lieu d'une aide mécanique)
  { s: 'film', risque: 'chute-objet', mesure: 'baliser' },     // juste
  { s: 'sable', risque: 'chute-pied', mesure: 'chaussures' },  // faux : la mesure (l'EPI au lieu de nettoyer)
  { s: 'quai', risque: 'collision', mesure: 'cles' },          // faux : le risque (c'est le départ du camion)
  { s: 'allee', risque: 'collision', mesure: 'passage' },      // juste
];
export const etatKevin = (L) => (L.risque !== SITUATIONS[L.s].risque ? 'risque' : L.mesure !== SITUATIONS[L.s].juste ? 'mesure' : 'juste');

// ENT-20.4 : trois jeux (un par élève, d'après sa graine).
const JEUX204 = [
  { situations: ['carrelage', 'agv', 'cartons', 'sable'], acc: { annee: 2025, accidents: 4, jours: 52, heures: 400000 } },   // TF 10 ; TG 0,13
  { situations: ['film', 'peinture', 'quai', 'allee'], acc: { annee: 2025, accidents: 9, jours: 135, heures: 600000 } },     // TF 15 ; TG 0,225 → 0,23
  { situations: ['sable', 'allee', 'agv', 'carrelage'], acc: { annee: 2025, accidents: 5, jours: 60, heures: 250000 } },     // TF 20 ; TG 0,24
];
export const indiceJeu = (db, n) => empreinte(`${graineDeBase(db)}|leroy-merlin`) % n;
export const jeu204 = (db) => JEUX204[indiceJeu(db, JEUX204.length)];
export const TOUS_JEUX204 = JEUX204;

// ─────────────────────────────────────────── C2.1 : les demandes des clients
// Les jours de livraison : du lundi au samedi (CONSTRUIT). Colis de moins de 30 kg : J+1 ; encombrant (30 kg ou plus) : J+3 (RÉEL, 2022).
export const KG_ENCOMBRANT = 30;
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const dateDe = (iso) => { const [y, mo, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, mo - 1, d)); };
export const isoDe = (t) => t.toISOString().slice(0, 10);
export const jourLong = (iso) => { const t = dateDe(iso); return `${JOURS[t.getUTCDay()]} ${t.getUTCDate() === 1 ? '1er' : t.getUTCDate()} ${MOIS[t.getUTCMonth()]}`; };
// Ajoute n jours de livraison (le dimanche ne compte pas).
export function plusJours(iso, n) {
  const t = dateDe(iso);
  let k = 0;
  while (k < n) { t.setUTCDate(t.getUTCDate() + 1); if (t.getUTCDay() !== 0) k++; }
  return isoDe(t);
}
export const poidsCommande = (c) => Math.round(c.lignes.reduce((t, l) => t + PRODUITS[l.ref].kg * l.qte, 0) * 100) / 100;
export const encombrant = (c) => c.lignes.some((l) => PRODUITS[l.ref].kg >= KG_ENCOMBRANT) || poidsCommande(c) >= KG_ENCOMBRANT;
export const delai = (c) => (encombrant(c) ? 3 : 1);
export const livraison = (c) => plusJours(c.jour, delai(c));

// Les produits (CONSTRUITS, sans marque) : poids d'une unité.
const p = (ref, nom, kg) => ({ ref, nom, kg });
export const PRODUITS = Object.fromEntries([
  p('perceuse', 'Perceuse sans fil 18 V', 2.1), p('ampoules', 'Lot de 6 ampoules LED', 0.4), p('peinture', 'Pot de peinture blanche 10 L', 14),
  p('carrelage', 'Carton de carrelage (1,44 m²)', 32), p('wc', 'Pack WC à poser', 38), p('robinet', 'Mitigeur de cuisine', 1.6),
  p('vis', 'Boîte de 500 vis', 1.2), p('ciment', 'Sac de ciment 35 kg', 35), p('etagere', 'Étagère métal 5 plateaux', 24),
  p('colle', 'Seau de colle à carrelage 25 kg', 25), p('porte', 'Bloc-porte 83 cm', 29), p('tondeuse', 'Tondeuse électrique', 17),
].map((x) => [x.ref, x]));

// Le type de client : interne (un magasin de l'enseigne) ou externe (un particulier, un artisan).
export const TYPES = [{ v: 'interne', lib: 'Client interne (un magasin Leroy Merlin)' }, { v: 'externe', lib: 'Client externe (un particulier, un artisan)' }];

// ENT-20.5 : les demandes du lundi 16 novembre 2026 (CONSTRUITES).
export const D205 = {
  jour: '2026-11-16',
  demandes: [
    { id: 'D1', de: 'Le magasin de Melun', type: 'interne', texte: 'Rupture de vis en rayon : il nous faut 40 boîtes de 500 vis pour demain matin.' },
    { id: 'D2', de: 'M. Garnier, particulier', type: 'externe', texte: 'J’ai commandé une perceuse sur le site ce matin : quand vais-je la recevoir ?' },
    { id: 'D3', de: 'Le magasin de Créteil', type: 'interne', texte: 'Notre camion de ce matin avait une palette de peinture abîmée.' },
    { id: 'D4', de: 'Mme Dias, artisane carreleuse', type: 'externe', texte: 'J’ai commandé du carrelage et de la colle hier : quand arrivent-ils ?' },
  ],
  commandes: [
    { id: 'W-5521', client: 'M. Garnier', jour: '2026-11-16', lignes: [{ ref: 'perceuse', qte: 1 }, { ref: 'ampoules', qte: 2 }] },
    { id: 'W-5508', client: 'Mme Dias', jour: '2026-11-15', lignes: [{ ref: 'carrelage', qte: 6 }, { ref: 'colle', qte: 2 }] },
    { id: 'W-5530', client: 'Mme Royer', jour: '2026-11-16', lignes: [{ ref: 'robinet', qte: 1 }, { ref: 'vis', qte: 1 }] },
  ],
};
// ENT-20.6 : le samedi 21 novembre 2026.
export const D206 = {
  jour: '2026-11-21',
  demandes: [
    { id: 'D1', de: 'Le magasin de Meaux', type: 'interne', texte: 'Nous voulons avancer la livraison de nos étagères.' },
    { id: 'D2', de: 'M. Lemoine, particulier', type: 'externe', texte: 'Je change d’adresse de livraison pour ma tondeuse.' },
    { id: 'D3', de: 'M. Rivière, maçon', type: 'externe', texte: 'Il manque un sac de ciment dans notre livraison.' },
    { id: 'D4', de: 'Le magasin de Chelles', type: 'interne', texte: 'Combien de blocs-portes avez-vous en stock pour nous ?' },
    { id: 'D5', de: 'Mme Petit, particulière', type: 'externe', texte: 'Mon colis d’ampoules n’est pas arrivé.' },
  ],
  commandes: [
    { id: 'W-6012', client: 'M. Lemoine', jour: '2026-11-20', lignes: [{ ref: 'tondeuse', qte: 1 }] },
    { id: 'W-6015', client: 'Mme Petit', jour: '2026-11-20', lignes: [{ ref: 'ampoules', qte: 3 }, { ref: 'vis', qte: 2 }] },
    { id: 'W-6018', client: 'M. Rivière', jour: '2026-11-21', lignes: [{ ref: 'ciment', qte: 10 }] },
    { id: 'W-6020', client: 'M. Hamon', jour: '2026-11-21', lignes: [{ ref: 'peinture', qte: 2 }, { ref: 'robinet', qte: 1 }] },
  ],
  // Le taux de service de la semaine (CONSTRUIT) : commandes livrées complètes et à la date promise ÷ commandes livrées.
  service: { livrees: 1250, aTemps: 1175 },   // 94 %
};
export const tauxService = (S) => Math.round((S.aTemps / S.livrees) * 1000) / 10;
// ENT-20.7 : les réponses de Jordan (CONSTRUITES) aux commandes du mardi 24 novembre 2026. Trois sont fausses.
export const D207 = {
  jour: '2026-11-24',
  commandes: [
    { id: 'W-6101', client: 'Mme Morel', jour: '2026-11-24', lignes: [{ ref: 'wc', qte: 1 }], promis: '2026-11-25' },            // faux : 38 kg → J+3 = 27
    { id: 'W-6102', client: 'M. Faure', jour: '2026-11-24', lignes: [{ ref: 'perceuse', qte: 1 }, { ref: 'vis', qte: 1 }], promis: '2026-11-25' },   // juste
    { id: 'W-6103', client: 'M. Blanc', jour: '2026-11-21', lignes: [{ ref: 'robinet', qte: 2 }], promis: '2026-11-22' },          // faux : le dimanche → lundi 23
    { id: 'W-6104', client: 'Mme Roux', jour: '2026-11-24', lignes: [{ ref: 'peinture', qte: 2 }, { ref: 'vis', qte: 2 }], promis: '2026-11-25' },  // faux : 30,4 kg → J+3 = 27
    { id: 'W-6105', client: 'M. Henry', jour: '2026-11-24', lignes: [{ ref: 'etagere', qte: 1 }], promis: '2026-11-25' },          // juste : 24 kg
  ],
};
export const promisJuste = (c) => c.promis === livraison(c);
// ENT-20.8 : trois jeux.
const JEUX208 = [
  { jour: '2026-11-28', demandes: [
      { id: 'D1', de: 'Le magasin de Torcy', type: 'interne', texte: 'Il nous faut des sacs de ciment pour un chantier client.' },
      { id: 'D2', de: 'M. Perrin, particulier', type: 'externe', texte: 'Quand arrive ma commande ?' },
      { id: 'D3', de: 'Mme Caron, architecte d’intérieur', type: 'externe', texte: 'Puis-je ajouter un article à ma commande ?' }],
    commandes: [
      { id: 'W-7001', client: 'M. Perrin', jour: '2026-11-27', lignes: [{ ref: 'porte', qte: 1 }, { ref: 'vis', qte: 1 }] },      // 30,2 kg → J+3 : mardi 1er décembre
      { id: 'W-7002', client: 'Mme Caron', jour: '2026-11-28', lignes: [{ ref: 'robinet', qte: 1 }] },                            // samedi → lundi 30
      { id: 'W-7003', client: 'Mme Lucas', jour: '2026-11-27', lignes: [{ ref: 'peinture', qte: 1 }, { ref: 'ampoules', qte: 1 }] } ],   // 14,4 kg → samedi 28
    service: { livrees: 800, aTemps: 744 } },                                                                                      // 93 %
  { jour: '2026-11-26', demandes: [
      { id: 'D1', de: 'M. Arnaud, particulier', type: 'externe', texte: 'Ma perceuse est arrivée cassée.' },
      { id: 'D2', de: 'Le magasin de Lagny', type: 'interne', texte: 'Pouvez-vous nous envoyer 20 mitigeurs ?' },
      { id: 'D3', de: 'Le magasin de Provins', type: 'interne', texte: 'Notre livraison de ce matin est arrivée en retard.' }],
    commandes: [
      { id: 'W-7101', client: 'M. Arnaud', jour: '2026-11-26', lignes: [{ ref: 'tondeuse', qte: 1 }, { ref: 'vis', qte: 1 }] },   // 18,2 kg → vendredi 27
      { id: 'W-7102', client: 'M. Simon', jour: '2026-11-26', lignes: [{ ref: 'colle', qte: 1 }, { ref: 'peinture', qte: 1 }] },  // 39 kg → lundi 30
      { id: 'W-7103', client: 'Mme Noël', jour: '2026-11-25', lignes: [{ ref: 'wc', qte: 1 }] } ],                                  // 38 kg, mercredi + J+3 → samedi 28
    service: { livrees: 640, aTemps: 608 } },                                                                                      // 95 %
  { jour: '2026-11-28', demandes: [
      { id: 'D1', de: 'Le magasin de Fontainebleau', type: 'interne', texte: 'Nous n’avons pas reçu nos pots de peinture.' },
      { id: 'D2', de: 'Mme Brun, particulière', type: 'externe', texte: 'Quand serai-je livrée ?' },
      { id: 'D3', de: 'M. Bertin, plombier', type: 'externe', texte: 'Il me manque deux mitigeurs.' }],
    commandes: [
      { id: 'W-7201', client: 'Mme Brun', jour: '2026-11-28', lignes: [{ ref: 'etagere', qte: 1 }, { ref: 'ampoules', qte: 1 }] },  // 24,4 kg, samedi → lundi 30
      { id: 'W-7202', client: 'M. Bertin', jour: '2026-11-27', lignes: [{ ref: 'carrelage', qte: 1 }] },                           // 32 kg, vendredi + J+3 → mardi 1er décembre
      { id: 'W-7203', client: 'Mme Vidal', jour: '2026-11-28', lignes: [{ ref: 'wc', qte: 1 }] } ],                                 // 38 kg, samedi + J+3 → mercredi 2 décembre
    service: { livrees: 1500, aTemps: 1365 } },                                                                                    // 91 %
];
export const jeu208 = (db) => JEUX208[indiceJeu(db, JEUX208.length)];
export const TOUS_JEUX208 = JEUX208;

export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
