// Picard — ENT-4.2 « Deux camions, un seul quai » (entraînement) : le quai de la séance.
//
// Brief `docs/briefs/ENT-4.2-picard-deux-camions.md`. Deux camions attendent, un seul quai : l'élève lit
// les deux tickets, choisit le camion à décharger d'abord ET la raison, puis réceptionne les deux lots
// sans aucune aide (seul le bilan juste/faux reste). Tout est CONSTRUIT (voir `contenus/picard.js`) ;
// fournisseurs et transporteurs sont fictifs, noms vérifiés par recherche web le 03/10/2026 (aucune
// entreprise à ce nom) : Glaces Néviane, Transports Hivernel, Légumes d'Orvalle, Transports Calvenor.
//
// À l'écran, chaque camion porte le nom de son fournisseur (demande de Tristan, 03/10/2026) ; « A » et « B »
// ne restent que dans les identifiants (palettes A1… B5, jalons).
//
// Le camion A (Glaces Néviane) a un groupe froid qui faiblit : ses glaces sont à −18,5 °C à cœur au début, et
// gagnent 0,25 °C par minute du temps du quai tant qu'il reste porte fermée (décision de Tristan,
// brief §11). La vue calcule la température réelle à la sonde et la décision attendue qui en découle,
// par la RÈGLE DU QUAI À TROIS ZONES (décision de Tristan, 03/10/2026, construite pour l'exercice sur
// les seuils vérifiés −18 °C et tolérance −15 °C) : −18 °C ou plus froid → accepter ; entre −18 et
// −15 °C → accepter avec réserves, température relevée ; au-dessus de −15 °C → refuser. Les deux chemins :
//   - A d'abord : on ne peut choisir qu'après avoir lu les deux tickets (2 × 2 min), A s'ouvre à
//     4 min → −17,5 °C à cœur : dans la tolérance, mais plus chaud que −18 °C : réserves — température ;
//   - B d'abord : au plus vite 4 min (tickets) + 5 min 30 (déchargement de B) + 1 min (une ligne de
//     réserve) + 1 min (signature) + 3 min (manœuvre de mise à quai de A) = 14 min 30 → −14,9 °C :
//     les trois palettes de A sont à refuser, quoi que fasse l'élève. Garde-fou : un test le vérifie.
//
//   A1  glace vanille                              (A d'abord) −17,5 °C → réserves, température
//   A2  sorbets citron (3 couches) + framboise (1)  deux références, compter chacune ; −17,5 °C → réserves
//   A3  bâtonnets chocolat                          (A d'abord) −17,5 °C → réserves, température
//   B1  petits pois                                 aucun aléa       → accepter
//   B2  poêlée campagnarde, −14,8 °C à cœur         ticket parfait   → refuser, température
//   B3  brocolis : étiquette avant déchirée, l'arrière dit CFL-1000  → refuser, produit différent
//   B4  haricots beurre, 1 carton manquant (coin du fond, en haut)   → réserves, manquant (1)
//   B5  carottes en rondelles                        aucun aléa       → accepter

import { etapesQuai } from '../core/types/quai.js';
import { LIEU, PHOTOS, DECHARGEMENT, COUTS, SEUIL_HORS_FROID, AVERTISSEMENT, BON_A_SAVOIR, releves } from './picard.js';

const ETIQ = (ref, nom, poids, lot, ddm) => ({ ref, nom, poids, lot, ddm });

export const PALETTES_A = [
  { id: 'A1', ref: 'GVA-2500', nom: 'Glace vanille 2,5 L', bl: 36,
    etiq: ETIQ('GVA-2500', 'CRÈME GLACÉE VANILLE 2,5 L', '4 × 2,5 L', 'L26-3104', '04/2028'),
    W: 3, D: 3, L: 4, manque: [], avarie: {}, temp: -18.5, attendu: 'accepter', motifAttendu: 'aucun' },
  // Deux références sur la palette : les trois couches du bas en sorbet citron, celle du dessus en
  // framboise (bande de couleur sur les cartons, une étiquette par référence).
  { id: 'A2', W: 3, D: 2, L: 4, manque: [], avarie: {}, temp: -18.5, attendu: 'accepter', motifAttendu: 'aucun',
    refs: [
      { ref: 'SCI-500', nom: 'Sorbet citron 500 mL', bl: 18, couches: [0, 1, 2], teinte: '#d9b616',
        etiq: ETIQ('SCI-500', 'SORBET PLEIN FRUIT CITRON', '6 × 500 mL', 'L26-3117', '05/2028') },
      { ref: 'SFR-500', nom: 'Sorbet framboise 500 mL', bl: 6, couches: [3], teinte: '#b0306a',
        etiq: ETIQ('SFR-500', 'SORBET PLEIN FRUIT FRAMBOISE', '6 × 500 mL', 'L26-3118', '05/2028') },
    ] },
  { id: 'A3', ref: 'BCH-060', nom: 'Bâtonnets glacés chocolat', bl: 48,
    etiq: ETIQ('BCH-060', 'BÂTONNETS GLACÉS CHOCOLAT', '12 × 6 × 60 mL', 'L26-3126', '03/2028'),
    W: 4, D: 3, L: 4, manque: [], avarie: {}, temp: -18.5, attendu: 'accepter', motifAttendu: 'aucun' },
];

export const PALETTES_B = [
  { id: 'B1', ref: 'PPO-1000', nom: 'Petits pois extra-fins 1 kg', bl: 60,
    etiq: ETIQ('PPO-1000', 'PETITS POIS EXTRA-FINS', '10 × 1 kg', 'L26-5021', '08/2028'),
    W: 4, D: 3, L: 5, manque: [], avarie: {}, temp: -21.0, attendu: 'accepter', motifAttendu: 'aucun' },
  { id: 'B2', ref: 'POE-750', nom: 'Poêlée campagnarde 750 g', bl: 36,
    etiq: ETIQ('POE-750', 'POÊLÉE CAMPAGNARDE', '12 × 750 g', 'L26-5034', '06/2028'),
    W: 3, D: 3, L: 4, manque: [], avarie: {}, temp: -14.8, attendu: 'refuser', motifAttendu: 'temperature' },
  // L'étiquette de face est déchirée : la vraie référence se lit sur la face arrière.
  { id: 'B3', ref: 'BRO-1000', nom: 'Brocolis en fleurettes 1 kg', bl: 30, etiqAvant: 'dechiree',
    etiq: ETIQ('CFL-1000', 'CHOU-FLEUR EN FLEURETTES', '10 × 1 kg', 'L26-5047', '09/2028'),
    W: 3, D: 2, L: 5, manque: [], avarie: {}, temp: -20.6, attendu: 'refuser', motifAttendu: 'produit' },
  { id: 'B4', ref: 'HBE-1000', nom: 'Haricots beurre 1 kg', bl: 32,
    etiq: ETIQ('HBE-1000', 'HARICOTS BEURRE EXTRA-FINS', '10 × 1 kg', 'L26-5052', '10/2028'),
    W: 4, D: 2, L: 4, manque: ['3,0,3'], avarie: {}, temp: -20.2, attendu: 'reserves', motifAttendu: 'manquant' },
  { id: 'B5', ref: 'CAR-1000', nom: 'Carottes en rondelles 1 kg', bl: 45,
    etiq: ETIQ('CAR-1000', 'CAROTTES EN RONDELLES', '10 × 1 kg', 'L26-5068', '11/2028'),
    W: 3, D: 3, L: 5, manque: [], avarie: {}, temp: -20.8, attendu: 'accepter', motifAttendu: 'aucun' },
];

// Les produits livrés, une ligne par référence (pour le catalogue de l'environnement).
export const PRODUITS_ENT42 = PALETTES_A.concat(PALETTES_B).flatMap((p) => p.refs || [p]);

// Ce que montre un ticket : les trois réponses d'ENT-4.1, plus le froid qui faiblit encore à l'arrivée.
const QCM = [
  { v: 'rien', lib: 'Rien à signaler : la température est restée stable', court: 'rien à signaler' },
  { v: 'bref', lib: 'Un pic très bref, sans conséquence', court: 'pic bref' },
  { v: 'long', lib: 'Une remontée qui a duré, puis le froid est revenu : je la signale et je sonde chaque palette', court: 'remontée qui a duré' },
  { v: 'faiblit', lib: 'La température remonte encore à l’arrivée, de plus en plus vite : le groupe froid faiblit', court: 'le froid faiblit encore à l’arrivée' },
];

export const QUAI_ENT42 = {
  id: 'picard-ent42',
  titre: 'Entrepôt Picard de Sainghin-en-Mélantois (59) — Quai 32, réception',
  destinataire: 'Picard',
  avertissement: AVERTISSEMENT,
  bonASavoir: BON_A_SAVOIR,
  lieu: LIEU,
  seuilHorsFroid: SEUIL_HORS_FROID,
  dechargement: DECHARGEMENT,
  couts: COUTS,
  calcul: { forme: 'feuille' },                  // zone de calcul : lignes nommées, sans rappel (entraînement)
  aides: {},
  photos: PHOTOS,
  // L'élève prend son poste à 6 h 10 : les deux camions sont là.
  debut: '06:10',
  seuilRefus: -15,
  seuilReserve: -18,
  manoeuvre: 3,
  ordre: {
    question: 'Quel camion faites-vous décharger en premier ?',
    premier: 0,
    juste: 'froid',
    phrases: [
      { v: 'arrive', lib: 'Le camion Glaces Néviane est arrivé le premier' },
      { v: 'palettes', lib: 'Le camion Légumes d’Orvalle a plus de palettes' },
      { v: 'froid', lib: 'Le ticket des Glaces Néviane montre que leur froid faiblit : les glaces se réchauffent si le camion attend' },
      { v: 'cher', lib: 'Les glaces sont plus chères' },
    ],
  },
  camions: [
    { lettre: 'A', transporteur: 'Transports Hivernel', fournisseur: 'Glaces Néviane', fictif: true, bl: 'GN-26-0417', arrivee: '06:00',
      parole: 'Bonjour, livraison Glaces Néviane : trois palettes de glaces. Voilà mon bon de livraison et le ticket de l’enregistreur.',
      rechauffeEnAttente: 0.25,
      // Remontée qui s'accélère sur la dernière heure, et continue à l'arrivée (groupe froid faible).
      ticket: { remorque: 'FR-318', societe: 'Hivernel', consigne: -20, depart: '00:00',
        releves: releves({ 285: -20.6, 300: -20.3, 315: -19.9, 330: -19.3, 345: -18.5, 360: -17.4 }) },
      qcmTicket: { choix: QCM, attendu: 'faiblit' },
      palettes: PALETTES_A },
    { lettre: 'B', transporteur: 'Transports Calvenor', fournisseur: 'Légumes d’Orvalle', fictif: true, bl: 'LO-26-2290', arrivee: '06:10',
      parole: 'Bonjour, Légumes d’Orvalle, cinq palettes. Pile à l’heure ! Voilà mon bon de livraison et le ticket de l’enregistreur.',
      ticket: { remorque: 'FR-744', societe: 'Calvenor', consigne: -20, depart: '00:00', releves: releves({}) },
      qcmTicket: { choix: QCM, attendu: 'rien' },
      palettes: PALETTES_B },
  ],
};

// Un jalon de la vue = une étape du suivi (30 : ordre et raison, 2 tickets, 8 comptages, 8 décisions,
// 6 réserves — les 3 palettes du camion A et B2, B3, B4 —, pas de mention de déballage, 2 signatures,
// 2 lots rentrés). Les décisions et réserves du camion A se lisent sur la température réelle.
// `attendu` des palettes de A = ce qu'elles seraient sans attente (la vue le recalcule).
export const ETAPES = etapesQuai(QUAI_ENT42);

export const ACCUEIL = {
  titre: 'Deux camions, un seul quai',
  kpis: ['mail'],
  etapes: [
    ['Lire le message du chef de quai', 'Menu Messagerie : les deux camions de ce matin.'],
    ['Aller au quai', 'Menu Quai de réception : deux camions attendent, portes fermées.'],
    ['Lire les deux tickets, puis décider', 'Quel camion décharger en premier, et pourquoi ?'],
    ['Réceptionner un camion, puis l’autre', 'Contrôler chaque palette, décider, rentrer le lot, écrire les réserves, faire signer.'],
  ],
};

// Le mail d'accueil du chef de quai (personnage fictif). Texte écrit par Claude Code (brief §11), à
// relire par Tristan en jouant la séance.
export const VOLET = {
  id: 'picard-ent42',
  semer(prenom) {
    return { mails: [{ folder: 'in', ts: Date.now() - 600e3, from: 'Le chef de quai', fromMail: 'chef.quai@picard-quai.example',
      to: prenom, subject: 'Quai 32 : deux camions ce matin', kind: 'text',
      text: `Bonjour ${prenom}, deux camions pour toi ce matin au quai 32. À 6 h 00, le camion Glaces Néviane : 3 palettes `
        + 'de glaces, transporteur Transports Hivernel. À 6 h 10, le camion Légumes d\'Orvalle : 5 palettes de légumes, '
        + 'transporteur Transports Calvenor. Un seul quai : c\'est toi qui décides lequel tu fais décharger en premier, et tu dois '
        + 'pouvoir dire pourquoi. Lis les deux tickets avant de décider. Et toujours : le froid d\'abord, les papiers ensuite. '
        + 'Aujourd\'hui, pas d\'aide : je regarde ton bilan à la fin. — Le chef de quai' }] };
  },
};
