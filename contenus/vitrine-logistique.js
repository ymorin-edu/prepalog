// ENT-25.1 — « Et si tu choisissais la Logistique ? » : la vitrine du Bac Pro Logistique pour les 2de GATL (semaine des filières, novembre 2026).
// Demande de Tristan du 12/11/2026 (fil « Préparer la semaine des filières en 2de ») : « le but est de mettre en avant le BAC PRO logistique », 2de GATL, 1 h ;
// puis « il faut que ça soit plus ludique et interactif » : choix « Tout en écrans de jeu » (12/11/2026, 12 h 49).
// Brief et compte rendu : `docs/briefs/ENT-25.1-vitrine-logistique.md` ; activité : `activites/vitrine-logistique.js` ; corrigé : `contenus/corriges/ENT-25.1.js`.
//
// Ce n'est pas une entreprise : la visite de quatre entreprises RÉELLES déjà vérifiées dans Prepalog, chacune avec un ÉCRAN DE JEU du moteur
// (aucune vue nouvelle, rien dans `core/`) :
//   ⓪ la carte de France (vue « Localiser ») : situer les quatre sites ;
//   ① Amazon, Brétigny-sur-Orge : la ligne de tri des colis (vue « Tri ») — l'étiquette, la balance, la bonne sortie ou l'écart ;
//   ② Stellantis, Sochaux : vingt minutes de bord de ligne (vue « Bord de ligne ») — envoyer les robots avant que la ligne s'arrête ;
//   ③ Airbus Helicopters, Marignane : l'appel de Nathalie (vue « Téléphone ») — l'hélicoptère au sol, le transport, la révision, le client ;
//   ④ Royal Canin, Aimargues : ranger trois palettes sur le plan de l'entrepôt (vue « Plan d'entrepôt », rangement) — la rotation ;
//   ⑤ Le Bac Pro Logistique en bref (Onisep, relevé le 12/11/2026) : trois vrai ou faux et le poste préféré (non jugé).
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) : les faits d'entreprise sont ceux, déjà vérifiés, des univers `contenus/amazon.js`, `stellantis.js`, `airbus.js`,
// `royal-canin.js` (leurs `MENTION`) ; positions sur la carte APPROCHÉES (centre de la commune, comme dans les autres séances) ; le Bac Pro d'après la fiche
// Onisep. Construits : Sarah, Karim, Nathalie, Sandrine ; la ligne de tri, ses sorties, ses règles et ses colis ; les postes, quantités et robots du bord de
// ligne (ceux d'ENT-13.6, `contenus/stellantis-ligne.js`) ; les transports d'Airbus et leurs prix ; le plan, le stock, les produits et les règles de
// l'entrepôt de Royal Canin.
// Notation : vitrine non comptée dans les compétences (`competences: []`) ; 20 points pour que l'élève voie un résultat.

import { catalogueSimple } from './entreprise-commun.js';
import { FRANCE } from './france-contours.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { jalonTri } from '../core/types/tri.js';
import { jalonLigne, etatLigne } from '../core/types/ligne.js';
import { jalonDialogue, premiereReponse } from '../core/types/dialogue.js';
import { jalonsEntrepot } from '../core/types/entrepot.js';
import { localiserFini, apresGeste, dialogueFini } from '../core/declencheurs.js';
import { POSTES as POSTES_ST, SEQUENCE as SEQUENCE_ST, ROBOTS as ROBOTS_ST } from './stellantis-ligne.js';

export const ID = 'vitrine-logistique';
export const ID_VOLET = 'vitrine-251';
export const VUE_CARTE = 'vitrine-carte';
export const TRI_ID = 'vitrine-tri';
export const LIGNE_ID = 'vitrine-ligne';
export const DIALOGUE = 'nathalie';
export const ENTREPOT_ID = 'vitrine-rangement';
export const FICHES = { bac: 'bac-251' };
export const JOUR = { iso: '2026-11-16', lib: 'lundi 16 novembre 2026' };

const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LOGOS = {
  amazon: './contenus/trames/logos/amazon.svg',
  stellantis: './contenus/trames/logos/stellantis.svg',
  airbus: './contenus/trames/logos/airbus.svg',
  royal: './contenus/trames/logos/royal-canin.svg',
};

// ─────────────────────────────────────────────────────────────── l'univers (le lycée, pas une entreprise)
export const ENTREPRISE = {
  id: 'vitrine-logistique',
  nom: 'Le Bac Pro Logistique',
  sousTitre: 'Semaine des filières — quatre entreprises où travaillent les logisticiens',
  exercice: 'La visite',
  logo: './contenus/trames/logos/prepalog.png',
};
export const VOCAB = { unit: 'article', unitPl: 'articles', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'lycee.example' };
// L'accent de Prepalog (le vert de `--ardoise`, clair) : le moteur le remplace par l'encre dans la zone de travail (charte verte, décision du 05/10/2026).
export const THEME = { accent: '#107c41', papier: true };
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

// ─────────────────────────────────────────────────────────────── ⓪ la carte de France (vue « Localiser »)
// Positions APPROCHÉES (centre de la commune). Brétigny et Sochaux : celles d'`amazon.js` et d'`stellantis-ent131.js` ; Marignane et Aimargues :
// centre de la commune, relevé de mémoire. Les « autres » villes sont dans le même département, à plus de 8 km.
export const LOCALISER = {
  id: VUE_CARTE, libelle: 'Carte de France', titre: 'Où sont les quatre entreprises ?', contours: FRANCE,
  lieux: [
    { id: 'amazon', lettre: 'A', type: 'entrepot', nom: 'Amazon, centre de distribution de Brétigny-sur-Orge', role: 'Un entrepôt de commandes internet, avec des robots.',
      ville: 'Brétigny-sur-Orge', dep: '91', region: '11', lonlat: [2.3058, 48.6114], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Évry-Courcouronnes', lonlat: [2.4400, 48.6290] }, { ville: 'Étampes', lonlat: [2.1614, 48.4344] }, { ville: 'Palaiseau', lonlat: [2.2453, 48.7146] }],
      reperes: [{ ville: 'Paris', lonlat: [2.3484, 48.8535] }], indice: 'Au sud de Paris.', etiq: 'b' },
    { id: 'stellantis', lettre: 'S', type: 'usine', nom: 'Stellantis, usine de Sochaux', role: 'Une usine de voitures : la logistique alimente la ligne.',
      ville: 'Sochaux', dep: '25', region: '27', lonlat: [6.8331, 47.5125], osm: 'commune de Sochaux (position approchée)',
      autres: [{ ville: 'Besançon', lonlat: [6.0240, 47.2378] }, { ville: 'Pontarlier', lonlat: [6.3547, 46.9047] }, { ville: 'Morteau', lonlat: [6.6014, 47.0590] }],
      reperes: [{ ville: 'Belfort', lonlat: [6.8628, 47.6397] }], indice: 'Dans l’est de la France, au pied du Jura, à côté de Montbéliard.', etiq: 'd' },
    { id: 'airbus', lettre: 'H', type: 'site', nom: 'Airbus Helicopters, Marignane', role: 'Le magasin des pièces de rechange des hélicoptères.',
      ville: 'Marignane', dep: '13', region: '93', lonlat: [5.2146, 43.4160], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Aix-en-Provence', lonlat: [5.4474, 43.5297] }, { ville: 'Arles', lonlat: [4.6278, 43.6766] }, { ville: 'Aubagne', lonlat: [5.5706, 43.2928] }],
      reperes: [{ ville: 'Marseille', lonlat: [5.3698, 43.2965] }], indice: 'Au bord de la Méditerranée, juste à côté de Marseille.', etiq: 'b' },
    { id: 'royal', lettre: 'R', type: 'site', nom: 'Royal Canin, Aimargues', role: 'L’entrepôt des croquettes, qui partent dans le monde entier.',
      ville: 'Aimargues', dep: '30', region: '76', lonlat: [4.2097, 43.6847], osm: 'centre de la commune (approché)',
      autres: [{ ville: 'Alès', lonlat: [4.0814, 44.1250] }, { ville: 'Bagnols-sur-Cèze', lonlat: [4.6196, 44.1623] }, { ville: 'Uzès', lonlat: [4.4196, 44.0125] }],
      reperes: [{ ville: 'Nîmes', lonlat: [4.3601, 43.8367] }], indice: 'Dans le sud, entre Nîmes et Montpellier.', etiq: 'g' },
  ],
  fin: { titre: 'La logistique est partout',
    texte: 'Un entrepôt près de Paris, une usine dans l’Est, un aéroport près de Marseille, un entrepôt dans le Gard : on trouve des logisticiens dans toute la France. '
      + '(Les places sur la carte sont approchées : c’est le centre de la commune.)' },
};

// ─────────────────────────────────────────────────────────────── ① Amazon : la ligne de tri (vue « Tri ») — CONSTRUIT
// Les colis partent vers trois tournées de livraison ; un colis au carton ouvert ou à l'étiquette illisible va à l'écart, chez le « problem solver ».
export const SORTIES_TRI = [
  { id: 'Sud', nom: 'Tournée Essonne', communes: [['Évry-Courcouronnes', '91000'], ['Massy', '91300'], ['Corbeil-Essonnes', '91100']] },
  { id: 'Loiret', nom: 'Tournée Orléans', communes: [['Orléans', '45000'], ['Olivet', '45160'], ['Saran', '45770']] },
  { id: 'Eure', nom: 'Tournée Chartres', communes: [['Chartres', '28000'], ['Dreux', '28100'], ['Châteaudun', '28200']] },
];
export const REGLES_TRI = { poidsMax: 30, carton: true, etiquette: true, source: 'Règles construites pour l’exercice.' };
export const COLIS_TRI = [
  { n: 'AZ 3301 0412', commune: 'Massy', relais: 'Tabac de la Gare', rue: '4 place de la Gare', kg: 1.2, dim: [30, 20, 10], etat: 'ferme' },
  { n: 'AZ 3301 0519', commune: 'Orléans', relais: 'Épicerie du Martroi', rue: '18 rue Royale', kg: 3.5, dim: [40, 30, 20], etat: 'ferme' },
  { n: 'AZ 3301 0623', commune: 'Chartres', relais: 'Presse de la Cathédrale', rue: '2 rue du Cheval Blanc', kg: 0.8, dim: [25, 18, 8], etat: 'ferme' },
  { n: 'AZ 3301 0788', commune: 'Corbeil-Essonnes', relais: 'Fleurs et Colis', rue: '9 rue Saint-Spire', kg: 6.4, dim: [50, 40, 30], etat: 'ouvert' },
  { n: 'AZ 3301 0841', commune: 'Dreux', relais: 'Café d’Orléans', rue: '31 rue d’Orléans', kg: 2.1, dim: [35, 25, 15], etat: 'ferme',
    piege: 'Le relais s’appelle « Café d’Orléans », rue d’Orléans… mais la commune, c’est Dreux : tournée Chartres. Lis toujours la ligne de la commune.' },
  { n: 'AZ 3301 0907', commune: 'Olivet', relais: 'Bureau de tabac du Loiret', rue: '6 rue Marcel Belot', kg: 4.0, dim: [40, 30, 25], etat: 'enfonce' },
  { n: 'AZ 3301 0955', commune: 'Évry-Courcouronnes', relais: 'Supérette des Pyramides', rue: '1 place des Pyramides', kg: 1.6, dim: [30, 22, 12], etat: 'floue' },
  { n: 'AZ 3301 1004', commune: 'Saran', relais: 'Boulangerie des Aydes', rue: '22 rue de la Chaise', kg: 5.2, dim: [45, 35, 20], etat: 'ferme',
    piege: 'Saran est juste à côté d’Orléans : c’est la tournée Orléans, pas une autre.' },
];
export const TRI = {
  id: TRI_ID, libelle: '① Amazon : le tri', lieu: 'Amazon, Brétigny-sur-Orge · la ligne de tri des colis (construite pour la visite)',
  qui: { prenom: 'Théo', poste: '« problem solver »' },
  sorties: SORTIES_TRI, ecart: { libelle: 'À l’écart', sous: 'problem solver' }, regles: REGLES_TRI,
  series: [{ id: 's1', titre: 'Les colis du matin', temps: 'guidage', consigne: 'Lis la commune sur l’étiquette et envoie le colis dans sa tournée. Un carton ouvert ou une étiquette illisible : à l’écart.',
    colis: COLIS_TRI.map((c) => ({ ...c })) }],
  fin: 'Tous les colis sont triés : les camions des tournées peuvent partir.',
};

// ─────────────────────────────────────────────────────────────── ② Stellantis : le bord de ligne (vue « Bord de ligne ») — CONSTRUIT
// Les trois premiers postes d'ENT-13.6 (roues, rétroviseurs, planches de bord), vingt minutes au ralenti, Karim arrête la ligne au premier geste.
export const LIGNE = {
  id: LIGNE_ID, libelle: '② Stellantis : la ligne', titre: 'Vingt minutes au bord de ligne', lieu: 'Stellantis, Sochaux · montage · ligne Peugeot 3008 / 5008',
  qui: { prenom: 'Karim', poste: 'chef d’équipe logistique' }, temps: 'guidage', debut: '06:00', minutes: 20, secondes: 2,
  modeles: [{ id: '3008' }, { id: '5008', long: true }], sequence: SEQUENCE_ST.slice(),
  postes: POSTES_ST.slice(0, 3).map((p) => ({ ...p, depart: p.depart.slice(), besoin: { ...p.besoin } })),
  robots: { ...ROBOTS_ST }, personnes: 1200,
  fin: 'Vingt minutes, vingt voitures : c’est ça, la logistique d’une usine.',
};

// ─────────────────────────────────────────────────────────────── ③ Airbus Helicopters : l'appel de Nathalie (vue « Téléphone ») — CONSTRUIT
export const PRESTATAIRES = [
  { v: 'coursier', lib: 'Coursier dédié', delai: 'livré le jour même', prix: '950 €' },
  { v: 'express', lib: 'Express aérien', delai: 'livré le lendemain', prix: '210 €' },
  { v: 'messagerie', lib: 'Messagerie', delai: 'livré en 3 jours', prix: '45 €' },
];
export const REPLIQUES = [
  { id: 'aog', dit: 'Allô {prenom} ? C’est Nathalie, aux expéditions. Un hélicoptère du SAMU est bloqué au sol à Lyon : il attend une pièce que nous avons en stock. On fait comment ?',
    choix: [
      { v: 'vite', juste: true, lib: 'C’est un hélicoptère au sol : la pièce part au plus vite, même si ça coûte plus cher.' },
      { v: 'cher', lib: 'On prend le transport le moins cher, comme d’habitude.', reaction: 'Le moins cher met trois jours… Pendant ce temps, l’hélicoptère ne peut sauver personne. Tu ferais quoi ?' },
      { v: 'demain', lib: 'On verra ça demain, on a déjà beaucoup de colis.', reaction: 'Demain ? Le SAMU n’attendra pas. Qu’est-ce qui compte le plus ici ?' },
    ] },
  { id: 'transport', dit: 'D’accord. Regarde le tableau des transports : lequel prends-tu ?',
    choix: [
      { v: 'coursier', juste: true, lib: 'Le coursier dédié : la pièce arrive le jour même.' },
      { v: 'express', lib: 'L’express aérien, il arrive demain.', reaction: 'Demain, c’est une journée sans hélicoptère. Il y a plus rapide dans le tableau.' },
      { v: 'messagerie', lib: 'La messagerie, à 45 €.', reaction: 'Trois jours ! Relis la règle : hélicoptère au sol, le plus rapide.' },
    ] },
  { id: 'revision', dit: 'Parfait, j’appelle le coursier. Autre chose : une école de pilotage veut une pièce pour la révision de son hélicoptère, dans deux semaines. Tu l’envoies comment ?',
    choix: [
      { v: 'messagerie', juste: true, lib: 'En messagerie : trois jours, ça arrive bien avant la révision, et c’est le moins cher.' },
      { v: 'coursier', lib: 'Avec un coursier, c’est plus sûr.', reaction: '950 € pour une pièce attendue dans deux semaines ? Ce n’est pas urgent. Il y a beaucoup moins cher qui arrive à temps.' },
      { v: 'express', lib: 'En express aérien, demain.', reaction: 'Elle arriverait à temps, oui… mais il y a moins cher qui arrive aussi à temps.' },
    ] },
  { id: 'client', dit: 'Très bien. Dernière chose : le coursier vient de partir avec la pièce pour Lyon. Tu fais quoi maintenant ?',
    choix: [
      { v: 'prevenir', juste: true, lib: 'Je préviens le SAMU de l’heure d’arrivée de la pièce, pour que les mécaniciens soient prêts.' },
      { v: 'rien', lib: 'Rien, le coursier s’en occupe.', reaction: 'Et le client, il sait quand la pièce arrive ? Les mécaniciens doivent se préparer.' },
    ] },
];
export const JUSTES_APPEL = { aog: 'vite', transport: 'coursier', revision: 'messagerie', client: 'prevenir' };
export const EQUIPE = {
  sarah: { nom: 'Sarah', role: 'élève de Terminale Bac Pro Logistique (ta guide)', appel: 'Sarah', registre: 'tu' },
  nathalie: { nom: 'Nathalie', role: 'responsable des expéditions d’Airbus Helicopters', appel: 'Nathalie', registre: 'tu' },
};
export const TELEPHONE = {
  libelle: '③ Airbus : l’appel',
  situation: 'Nathalie, la responsable des expéditions d’Airbus Helicopters, attend ton appel. Garde le document « Airbus Helicopters » ouvert : il a le tableau des transports.',
  dialogues: [{ id: DIALOGUE, de: 'nathalie', contact: { nom: 'Nathalie — expéditions Airbus Helicopters', detail: 'Marignane' }, repliques: REPLIQUES,
    fin: 'Merci {prenom}, tu as tout de suite compris ce qui compte : le bon transport, au bon prix, au bon moment. Bonne visite !' }],
};

// ─────────────────────────────────────────────────────────────── ④ Royal Canin : ranger trois palettes (vue « Plan d'entrepôt ») — CONSTRUIT
export const GAMMES_RC = { CHI: 'Croquettes pour chiens', CHA: 'Croquettes pour chats' };
export const PRODUITS_RC = {
  GCH: { nom: 'Croquettes chien, grand sac', ref: 'RC-GCH', gamme: 'CHI', court: 'chien' },
  PCH: { nom: 'Croquettes chiot, petit sac', ref: 'RC-PCH', gamme: 'CHI', court: 'chiot' },
  CHA: { nom: 'Croquettes chat, sac moyen', ref: 'RC-CHA', gamme: 'CHA', court: 'chat' },
  CHT: { nom: 'Croquettes chaton, petit sac', ref: 'RC-CHT', gamme: 'CHA', court: 'chaton' },
};
export const PLAN_RC = {
  allees: [{ id: 'A', cotes: ['A1', 'A2'] }],
  cotes: { A1: { gammes: ['CHI'], charge: { 1: 3000, 2: 1500, 3: 1500 } }, A2: { gammes: ['CHA'], charge: { 1: 3000, 2: 1500, 3: 1500 } } },
  travees: 3, niveaux: 3, emplacements: 2,
  horsService: ['A2-T01-N2-E2'],
  zones: { quais: ['QUAI 1', 'QUAI 2'] },
  rotation: {
    A: { lib: 'rapide', travees: [1], niveaux: [1, 2], texte: 'T01, niveau N1 ou N2' },
    B: { lib: 'moyenne', travees: [2], niveaux: [1, 2, 3], texte: 'T02' },
    C: { lib: 'lente', travees: [3], niveaux: [1, 2, 3], texte: 'T03' },
  },
};
const P = (produit, kg) => ({ produit, kg });
// Le stock de départ, figé : il reste, pour chaque palette, au moins une bonne place libre (A : A1-T01-N2-E2 ; B : A1-T02-N3-E1 ; C : A2-T03-N1-E2, N2-E1).
export const STOCK_RC = {
  'A1-T01-N1-E1': P('GCH', 720), 'A1-T01-N1-E2': P('GCH', 700), 'A1-T01-N2-E1': P('GCH', 720), 'A1-T01-N3-E1': P('PCH', 480),
  'A1-T02-N1-E1': P('PCH', 480), 'A1-T02-N1-E2': P('PCH', 500), 'A1-T02-N2-E1': P('GCH', 700), 'A1-T02-N2-E2': P('PCH', 480),
  'A1-T03-N1-E1': P('PCH', 460), 'A1-T03-N2-E2': P('GCH', 690),
  'A2-T01-N1-E1': P('CHA', 600), 'A2-T01-N1-E2': P('CHA', 620), 'A2-T01-N2-E1': P('CHA', 600), 'A2-T01-N3-E2': P('CHT', 420),
  'A2-T02-N1-E1': P('CHT', 420), 'A2-T02-N2-E2': P('CHA', 610), 'A2-T02-N3-E1': P('CHT', 400),
  'A2-T03-N1-E1': P('CHT', 410), 'A2-T03-N3-E1': P('CHA', 590),
};
export const PALETTES_RC = [
  { id: 'P1', produit: 'GCH', kg: 720, rotation: 'A' },
  { id: 'P2', produit: 'CHT', kg: 420, rotation: 'C' },
  { id: 'P3', produit: 'PCH', kg: 480, rotation: 'B' },
];
export const REGLES_RC = {
  titre: 'Les règles',
  lignes: [
    '<b>Type de produit</b> : les croquettes pour chiens côté A1, les croquettes pour chats côté A2.',
    '<b>Rotation</b> : A rapide → T01 (près des quais), N1 ou N2 · B moyenne → T02 · C lente → T03.',
    'Un emplacement <b>libre</b> et <b>en service</b>.',
  ],
  encadre: 'Plus un produit part souvent, plus il est rangé près des quais : le préparateur marche moins. Plan, stock et règles construits pour la visite.',
};
export const ENTREPOT = {
  id: ENTREPOT_ID, libelle: '④ Royal Canin : ranger', mode: 'rangement',
  personnage: { nom: 'Sandrine', role: 'responsable de l’entrepôt', date: 'lun. 16 nov., 10 h',
    texte: {
      guidage: 'Trois palettes de croquettes arrivent de l’usine. Range chacune à sa place : suis la consigne écrite sur la palette.',
      entrainement: 'Range les trois palettes en appliquant les règles de l’entrepôt.',
      evaluation: 'Range les trois palettes.',
    } },
  plan: PLAN_RC, gammes: GAMMES_RC, produits: PRODUITS_RC, stock: STOCK_RC,
  criteres: [{ type: 'etat' }, { type: 'gamme' }, { type: 'rotation' }, { type: 'charge' }], regles: REGLES_RC, palettes: PALETTES_RC,
};

// ─────────────────────────────────────────────────────────────── ⑤ Le Bac Pro Logistique en bref (fiche)
export const VRAI_FAUX = [{ v: 'vrai', lib: 'Vrai' }, { v: 'faux', lib: 'Faux' }];
export const AFFIRMATIONS = [
  { id: 'pfmp', lib: 'En Bac Pro Logistique, on passe environ 20 semaines en entreprise sur les trois ans.', juste: 'vrai' },
  { id: 'engins', lib: 'On apprend à conduire des engins de manutention, comme les chariots.', juste: 'vrai' },
  { id: 'apres', lib: 'Après le Bac Pro Logistique, on ne peut pas continuer ses études.', juste: 'faux' },
];
export const POSTES = [
  { v: 'amazon', lib: 'Amazon : trier les colis' },
  { v: 'stellantis', lib: 'Stellantis : alimenter la ligne des voitures' },
  { v: 'airbus', lib: 'Airbus Helicopters : expédier les pièces urgentes' },
  { v: 'royal', lib: 'Royal Canin : ranger dans l’entrepôt' },
  { v: 'aucun', lib: 'Aucun pour l’instant' },
];

// ─────────────────────────────────────────────────────────────── lecture de la base : quand chaque arrêt est fini
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const carteFaite = (db) => localiserFini(VUE_CARTE)(db, ID);
export const triFait = (db) => apresGeste(`tri:${TRI_ID}:s1:fini`)(db, ID);
export const ligneFaite = (db) => { const st = etatLigne(db, ID, LIGNE_ID); return !!(st && (st.premier || st.fait)); };
export const appelFait = (db) => dialogueFini(DIALOGUE)(db, ID);
const placeRC = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID] && db.entrepots[ENTREPOT_ID].place) || {};
export const rangementFait = (db) => PALETTES_RC.every((p) => !!placeRC(db)[p.id]);
export const bacFait = (db) => fiche(db, FICHES.bac).envoye || geste(db, `fiche:${FICHES.bac}:envoyer`);

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; le logo de chaque entreprise en tête)
export const STYLE = `
--douce:#555047;
.vl-doc{padding:14px 18px 0}
.vl-doc p{margin:0 0 8px}
.vl-logo{display:block; height:30px; width:auto; max-width:180px; margin:0 0 8px}
.vl-t{margin:0; font-size:1.08rem; font-weight:800}
.vl-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.vl-ul{margin:4px 0 8px; padding-left:20px; font-size:.95rem}
.vl-ul li{margin:4px 0}
.vl-table{border-collapse:collapse; width:100%; font-size:.92rem; margin:4px 0 10px}
.vl-table th,.vl-table td{border:1px solid #d9d3c6; padding:5px 8px; text-align:left; vertical-align:top}
.vl-table thead th{font-weight:700}
.vl-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;
const pied = (t) => `<p class="vl-pied">${ech(t)}</p>`;
const logo = (cle, nom) => `<img class="vl-logo" src="${LOGOS[cle]}" alt="${ech(nom)}">`;

export const DOC_AMAZON = { id: 'amazon-251', titre: 'Amazon à Brétigny-sur-Orge', court: 'Amazon',
  html: `<article class="vl-doc" aria-label="Amazon à Brétigny-sur-Orge">
    ${logo('amazon', 'Amazon')}
    <p class="vl-t">Amazon : des colis par centaines de milliers</p>
    <p class="vl-st">Centre de distribution de Brétigny-sur-Orge (Essonne)</p>
    <table class="vl-table"><tbody>
      <tr><th scope="row">La taille</th><td><b>70 000 m²</b> sur trois niveaux, environ <b>4 500 salariés</b>.</td></tr>
      <tr><th scope="row">Les robots</th><td>Environ <b>4 000 robots</b> apportent les armoires de produits aux préparateurs.</td></tr>
      <tr><th scope="row">Le volume</th><td>En moyenne <b>500 000 colis</b> préparés par jour.</td></tr>
      <tr><th scope="row">Le contrôle</th><td>Un colis qui pose problème <b>sort de la ligne</b> pour être vérifié.</td></tr>
    </tbody></table>
    <p><b>Ton travail :</b> sur la ligne de tri, envoie chaque colis vers la tournée de sa commune. Un carton ouvert ou une étiquette illisible va <b>à l’écart</b>.</p>
    <p>En Bac Pro Logistique, tu apprends à <b>préparer et expédier les commandes</b>, comme ici.</p>
    ${pied('Réels : le centre Amazon de Brétigny-sur-Orge, sa taille, ses robots, ses salariés et ses colis par jour. Construits : la ligne de tri de la visite, ses tournées, ses règles et ses colis. Document pédagogique.')}
  </article>` };

export const DOC_STELLANTIS = { id: 'stellantis-251', titre: 'Stellantis à Sochaux', court: 'Stellantis',
  html: `<article class="vl-doc" aria-label="Stellantis à Sochaux">
    ${logo('stellantis', 'Stellantis')}
    <p class="vl-t">Stellantis : une voiture par minute</p>
    <p class="vl-st">Usine de Sochaux (Doubs), où l’on monte les Peugeot 3008 et 5008</p>
    <table class="vl-table"><tbody>
      <tr><th scope="row">La ligne</th><td>Environ <b>1 045 voitures par jour</b> : <b>une par minute</b>.</td></tr>
      <tr><th scope="row">Les camions</th><td>Environ <b>250 camions</b> et <b>500 fournisseurs</b> par jour apportent les pièces.</td></tr>
      <tr><th scope="row">Les robots</th><td>Des robots autonomes portent les pièces jusqu’au <b>bord de la ligne</b>.</td></tr>
      <tr><th scope="row">Si ça manque</th><td>Une chaîne à l’arrêt immobilise environ <b>1 200 personnes</b>.</td></tr>
    </tbody></table>
    <p><b>Ton travail :</b> quand un bac se vide, sa carte tombe. Envoie un robot chercher des pièces <b>avant</b> que le poste manque, sinon la ligne s’arrête.</p>
    <p>En Terminale Logistique, tu apprends la <b>logistique industrielle</b> : alimenter une ligne sans jamais l’arrêter.</p>
    ${pied('Réels : l’usine Stellantis de Sochaux, ses voitures par jour, ses camions et fournisseurs, ses robots, les personnes immobilisées par un arrêt. Construits : les postes, les quantités, les robots de la visite. Document pédagogique.')}
  </article>` };

export const DOC_AIRBUS = { id: 'airbus-251', titre: 'Airbus Helicopters à Marignane', court: 'Airbus Helicopters',
  html: `<article class="vl-doc" aria-label="Airbus Helicopters à Marignane">
    ${logo('airbus', 'Airbus')}
    <p class="vl-t">Airbus Helicopters : une pièce pour un hélicoptère au sol</p>
    <p class="vl-st">Site de Marignane (Bouches-du-Rhône), magasin des pièces de rechange</p>
    <p>Airbus Helicopters a livré <b>361 hélicoptères</b> en 2024. Ses clients : secours, gendarmerie, transport sanitaire, écoles de pilotage. Quand un hélicoptère
      attend une pièce pour voler, on dit qu’il est <b>AOG</b> (« au sol ») : la pièce doit partir <b>au plus vite</b>.</p>
    <p class="vl-st" style="margin-top:10px">Les trois transports possibles (prix construits pour l’exercice)</p>
    <table class="vl-table"><thead><tr><th>Transport</th><th>Délai</th><th>Prix</th></tr></thead><tbody>
      ${PRESTATAIRES.map((p) => `<tr><td>${ech(p.lib)}</td><td>${ech(p.delai)}</td><td>${ech(p.prix)}</td></tr>`).join('')}
    </tbody></table>
    <p><b>La règle :</b> hélicoptère au sol, le plus <b>rapide</b>. Sinon, le moins <b>cher</b> qui arrive à temps.</p>
    <p>En Bac Pro Logistique, tu apprends à <b>confier une expédition</b> à un transporteur : au bon prix et à temps.</p>
    ${pied('Réels : Airbus Helicopters, son site de Marignane, son magasin de pièces de rechange, ses livraisons de 2024, le service AOG. Construits : Nathalie, les trois transports, leurs délais et leurs prix, la règle. Document pédagogique.')}
  </article>` };

export const DOC_ROYAL = { id: 'royal-251', titre: 'Royal Canin à Aimargues', court: 'Royal Canin',
  html: `<article class="vl-doc" aria-label="Royal Canin à Aimargues">
    ${logo('royal', 'Royal Canin')}
    <p class="vl-t">Royal Canin : des croquettes pour le monde entier</p>
    <p class="vl-st">Entrepôt de produits finis d’Aimargues (Gard)</p>
    <table class="vl-table"><tbody>
      <tr><th scope="row">La production</th><td>Royal Canin produit ses croquettes à Aimargues et à Cambrai : environ <b>349 000 tonnes</b> en 2024.</td></tr>
      <tr><th scope="row">L’export</th><td>Environ <b>85 %</b> partent à l’étranger, vers plus de 100 pays.</td></tr>
      <tr><th scope="row">L’entrepôt</th><td><b>1 800</b> emplacements de palettes sur des rayonnages de 7 m, des terminaux radio qui guident les caristes.</td></tr>
    </tbody></table>
    <p><b>Ton travail :</b> ranger trois palettes qui arrivent de l’usine. Chacune a sa place : le bon côté (chiens ou chats) et la bonne travée (plus elle part
      souvent, plus elle est près des quais).</p>
    <p>En Bac Pro Logistique, tu apprends à <b>ranger</b> et à <b>suivre les stocks</b>, et à conduire les chariots qui montent les palettes en hauteur.</p>
    ${pied('Réels : Royal Canin, ses usines d’Aimargues et de Cambrai, ses tonnes de 2024 et leur part exportée, l’entrepôt d’Aimargues. Construits : Sandrine, le plan, le stock, les produits et les règles de la visite. Document pédagogique.')}
  </article>` };

export const DOC_BAC = { id: 'bac-251', titre: 'Le Bac Pro Logistique en bref', court: 'Le Bac Pro Logistique',
  html: `<article class="vl-doc" aria-label="Le Bac Pro Logistique en bref">
    <p class="vl-t">Le Bac Pro Logistique en bref</p>
    <p class="vl-st">Bac pro « Métiers de la logistique », en 1re et en Terminale, après la 2de GATL</p>
    <ul class="vl-ul">
      <li>Il forme à <b>toute la chaîne logistique</b> : recevoir, ranger, suivre les stocks, préparer les commandes, expédier, organiser une petite équipe.</li>
      <li>Tu apprends à <b>conduire des engins de manutention</b> (les chariots) en sécurité.</li>
      <li>Tu passes environ <b>20 semaines en entreprise</b> (les PFMP) sur les trois ans.</li>
      <li>Des métiers : <b>préparateur de commandes</b>, <b>magasinier cariste</b>, agent de transit, puis chef d’équipe.</li>
      <li>Après le bac : travailler, ou continuer, par exemple en <b>BTS Gestion des transports et logistique associée</b>.</li>
    </ul>
    <p>Les quatre entreprises de la visite recrutent des logisticiens : dans un entrepôt, une usine, un aéroport ou un magasin de pièces.</p>
    ${pied('D’après la fiche Onisep « Bac pro métiers de la logistique », relevée le 12/11/2026. Document pédagogique.')}
  </article>` };

export const DOCUMENTS = [DOC_AMAZON, DOC_STELLANTIS, DOC_AIRBUS, DOC_ROYAL, DOC_BAC];

export const FICHE_BAC = {
  id: FICHES.bac, libelle: '⑤ Et toi ?', titre: 'Et toi, en Logistique ?',
  sousTitre: 'Lis le document « Le Bac Pro Logistique en bref ». Vrai ou faux ?',
  documents: [DOC_BAC.id],
  bouton: 'Ouvrir la fiche « Et toi ? »',
  blocs: [
    ...AFFIRMATIONS.map((a) => ({ type: 'liste', id: a.id, lib: a.lib, vide: 'Vrai ou faux ?', manque: 'un vrai ou faux', choix: VRAI_FAUX })),
    { type: 'liste', id: 'prefere', lib: 'Lequel de ces quatre postes t’a le plus plu ? (Il n’y a pas de mauvaise réponse.)', vide: 'Choisir…', manque: 'ton poste préféré', choix: POSTES },
  ],
  envoi: { bouton: 'Envoyer la fiche à Sarah', a: 'Sarah', suite: 'Sarah va te répondre.' },
};

// ─────────────────────────────────────────────────────────────── les jalons (20 points ; l'inaction vaut 0)
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
export const GROUPES = { carte: '⓪ La carte de France', amazon: '① Amazon : le tri', stellantis: '② Stellantis : la ligne', airbus: '③ Airbus : l’appel',
  royal: '④ Royal Canin : ranger', bac: '⑤ Le Bac Pro Logistique' };
export const POIDS = {
  carte: 0.5,                                              // × 8 (région et département des quatre sites, au premier coup) = 4
  tri: { communes: 2, pieges: 1, ecarts: 1 },              // 4
  ligne: { voitures: 2, arret: 2 },                         // 4
  appel: { aog: 1, transport: 0.75, revision: 0.75, client: 0.5 },   // 3
  palette: 1,                                              // × 3 = 3
  vf: { pfmp: 0.5, engins: 0.5, apres: 1 },                 // 2
};
const TITRES_TRI = { communes: 'Les colis en règle partent dans la bonne tournée', pieges: 'Les colis pièges (Dreux, Saran) partent dans la bonne tournée', ecarts: 'Le carton ouvert et l’étiquette illisible vont à l’écart, avec le bon motif' };
const TITRES_LIGNE = { voitures: 'Les voitures montées grâce à tes robots', arret: 'La ligne ne s’arrête pas (ou très peu)' };
const TITRES_APPEL = { aog: 'Hélicoptère au sol : au plus vite', transport: 'Le coursier dédié (le plus rapide)', revision: 'La révision : la messagerie (le moins cher à temps)',
  client: 'Prévenir le client de l’heure d’arrivée' };
const lignePlanRC = (db, palette) => jalonsEntrepot(db, ENTREPOT).L.find((l) => l.palette === palette);
export const ETAPES = [
  ...etapesLocaliser(LOCALISER, ID).map((j) => Object.assign(j, { poids: POIDS.carte, groupe: GROUPES.carte })),
  ...Object.entries(POIDS.tri).map(([m, poids]) => ({ ...jalonTri(TRI, ID, { id: `tri-${m}`, titre: TITRES_TRI[m], mesure: m }), groupe: GROUPES.amazon, poids })),
  ...Object.entries(POIDS.ligne).map(([m, poids]) => ({ ...jalonLigne(LIGNE, ID, { id: `ligne-${m}`, titre: TITRES_LIGNE[m], mesure: m }), groupe: GROUPES.stellantis, poids })),
  ...Object.entries(POIDS.appel).map(([r, poids]) => jalonDialogue({ seance: ID, dialogue: DIALOGUE, id: `appel-${r}`, titre: TITRES_APPEL[r], groupe: GROUPES.airbus, poids,
    juge: (appel) => premiereReponse(appel, r) === JUSTES_APPEL[r] })),
  ...PALETTES_RC.map((p) => ({ id: `palette-${p.id}`, titre: `${p.id} (${PRODUITS_RC[p.produit].nom}, rotation ${p.rotation}) bien rangée`, groupe: GROUPES.royal, poids: POIDS.palette,
    verifier(db) {
      const l = lignePlanRC(db, p.id), ou = placeRC(db)[p.id];
      if (l && l.ok) return ok;
      if (ou) return { status: 'ko', detail: `posée en ${ou}` };
      return attente;
    } })),
  ...AFFIRMATIONS.map((a) => ({ id: `vf-${a.id}`, titre: `Le Bac Pro : « ${a.lib} » ${a.juste === 'vrai' ? 'Vrai' : 'Faux'}`, groupe: GROUPES.bac, ecran: 'fiche',
    poids: POIDS.vf[a.id], verifier(db) { const f = fiche(db, FICHES.bac); return !f.envoye ? attente : f.valeurs[a.id] === a.juste ? ok : ko; } })),
];

// ─────────────────────────────────────────────────────────────── les messages de Sarah (au tu)
const SARAH = { nom: 'Sarah', mail: 'sarah@lycee.example' };
function heure(db, hhmm) {
  const [a, m, j] = JOUR.iso.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '08:00'), from: SARAH.nom, fromMail: SARAH.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJETS = {
  accueil: 'Bienvenue : on part en visite !', amazon: 'Premier arrêt : Amazon', stellantis: 'Deuxième arrêt : Stellantis', airbus: 'Troisième arrêt : Airbus Helicopters',
  royal: 'Quatrième arrêt : Royal Canin', bac: 'Et toi, en Logistique ?', fin: 'Merci pour la visite',
};
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.accueil,
    `Salut ${prenom} ! Je m’appelle Sarah, je suis en Terminale Bac Pro Logistique.\n\n`
      + 'Aujourd’hui, je te fais visiter quatre vraies entreprises où travaillent des logisticiens : Amazon, Stellantis, Airbus Helicopters et Royal Canin. '
      + 'À chaque arrêt, tu fais ce qu’on y fait vraiment : trier des colis, alimenter une ligne de voitures, expédier une pièce d’hélicoptère, ranger des palettes.\n\n'
      + 'D’abord, ouvre « Carte de France » dans le menu et place les quatre entreprises.\n\nSarah',
    { db })] }),
  declencheurs: [
    { id: 'amazon', quand: carteFaite, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.amazon,
      'Bravo ! Premier arrêt : le centre Amazon de Brétigny-sur-Orge, au sud de Paris. Les colis défilent sur la ligne de tri : à toi de les envoyer dans la bonne tournée.\n\n'
        + 'Lis le document « Amazon », puis ouvre « ① Amazon : le tri » dans le menu.\n\nSarah',
      { db, heure: '08:15', extra: { pieces: [DOC_AMAZON.id] } })] }) },
    { id: 'stellantis', quand: triFait, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.stellantis,
      'Les camions des tournées peuvent partir ! On file à Sochaux, dans l’usine Stellantis : une voiture sort chaque minute. Ton travail : envoyer les robots chercher les pièces '
        + 'avant que la ligne s’arrête. Karim, le chef d’équipe, est à côté de toi.\n\nLis le document « Stellantis », puis ouvre « ② Stellantis : la ligne ».\n\nSarah',
      { db, heure: '08:30', extra: { pieces: [DOC_STELLANTIS.id] } })] }) },
    { id: 'airbus', quand: ligneFaite, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.airbus,
      'On descend à Marignane, près de Marseille, chez Airbus Helicopters. Nathalie, la responsable des expéditions, a besoin de toi pour une urgence.\n\n'
        + 'Lis le document « Airbus Helicopters » (garde le tableau des transports sous les yeux), puis ouvre « ③ Airbus : l’appel » et appelle-la.\n\nSarah',
      { db, heure: '08:45', extra: { pieces: [DOC_AIRBUS.id] } })] }) },
    { id: 'royal', quand: appelFait, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.royal,
      'Dernière entreprise : Royal Canin, à Aimargues, dans le Gard. Trois palettes de croquettes arrivent de l’usine : range-les sur le plan de l’entrepôt.\n\n'
        + 'Lis le document « Royal Canin », puis ouvre « ④ Royal Canin : ranger ».\n\nSarah',
      { db, heure: '09:00', extra: { pieces: [DOC_ROYAL.id] } })] }) },
    { id: 'bac', quand: rangementFait, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.bac,
      'Tu as fait quatre métiers de la logistique : trier, alimenter une ligne, expédier une pièce urgente, ranger un entrepôt. Tout ça, on l’apprend en Bac Pro Logistique.\n\n'
        + 'Lis le document « Le Bac Pro Logistique en bref », puis ouvre la dernière fiche.\n\nSarah',
      { db, heure: '09:15', extra: { pieces: [DOC_BAC.id], ouvreFiche: FICHES.bac } })] }) },
    { id: 'fin', quand: bacFait, semer: (prenom, db) => ({ mails: [mail(prenom, SUJETS.fin,
      'Merci pour cette visite ! Tu as fait en une heure un petit bout de ce qu’on fait en 1re et en Terminale Logistique. '
        + 'Si tu as des questions sur la filière, pose-les à ton professeur : il y a aussi les élèves de 1re et de Terminale pour te répondre.\n\nSarah',
      { db, heure: '09:30' })] }) },
  ],
  corrections: {
    [FICHES.bac]: (prenom, n, db) => ({ mails: [mail(prenom, 'RE : Et toi ?', 'Merci, j’ai ta nouvelle fiche.\n\nSarah', { db, heure: '09:30' })] }),
  },
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
export const LEXIQUE = {
  'centre de distribution': 'Un entrepôt qui reçoit les articles, les range, puis prépare et expédie les commandes des clients.',
  'bord de ligne': 'L’endroit, juste à côté de la ligne de montage, où la logistique dépose les pièces dont chaque poste a besoin.',
  'AOG': '« Aircraft on ground » : un avion ou un hélicoptère bloqué au sol, qui attend une pièce pour repartir.',
  'rotation': 'La vitesse à laquelle un produit sort du stock : rapide (A), moyenne (B), lente (C).',
  'PFMP': 'Période de formation en milieu professionnel : les stages en entreprise du lycée professionnel.',
  'BTS': 'Brevet de technicien supérieur : un diplôme en deux ans après le bac.',
};
export const MENTION = 'Réels : Amazon (Brétigny-sur-Orge), Stellantis (Sochaux), Airbus Helicopters (Marignane), Royal Canin (Aimargues) et leurs chiffres, déjà vérifiés pour d’autres séances '
  + 'de Prepalog ; le Bac Pro Logistique d’après la fiche Onisep (relevée le 12/11/2026). Construits : Sarah, Théo, Karim, Nathalie et Sandrine, la ligne de tri et ses colis, les postes '
  + 'et les robots de la ligne, les transports d’Airbus et leurs prix, le plan et le stock de l’entrepôt de Royal Canin.';
export const ACCUEIL = {
  titre: 'Et si tu choisissais la Logistique ?',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Sarah', 'Menu Messagerie : Sarah, élève de Terminale, te fait visiter quatre entreprises.'],
    ['⓪ La carte de France', 'Place les quatre entreprises : la région, le département, la ville.'],
    ['① Amazon : le tri', 'Envoie chaque colis dans sa tournée, ou à l’écart.'],
    ['② Stellantis : la ligne', 'Envoie les robots avant que la ligne s’arrête.'],
    ['③ Airbus : l’appel', 'Un hélicoptère du SAMU attend une pièce : réponds à Nathalie.'],
    ['④ Royal Canin : ranger', 'Range trois palettes de croquettes sur le plan.'],
    ['⑤ Et toi ?', 'Le Bac Pro Logistique en bref, et le poste qui t’a plu.'],
    ['Bon à savoir', MENTION],
  ],
};
export const SUITE = [
  { vue: 'localiser', libelle: 'Carte de France', fait: carteFaite },
  { vue: 'tri', libelle: '① Amazon : le tri', fait: triFait },
  { vue: 'ligne', libelle: '② Stellantis : la ligne', fait: ligneFaite },
  { vue: 'telephone', libelle: '③ Airbus : l’appel', fait: appelFait },
  { vue: 'entrepot', libelle: '④ Royal Canin : ranger', fait: rangementFait },
  { vue: 'fiche', libelle: '⑤ Et toi ?', fait: bacFait },
];
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'La visite',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  equipe: EQUIPE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  localiser: LOCALISER,
  tri: TRI,
  ligne: LIGNE,
  telephone: TELEPHONE,
  entrepot: ENTREPOT,
  fiches: [FICHE_BAC],
  fermetures: {
    tri: { ouvertSi: carteFaite, message: 'Après la carte de France' },
    ligne: { ouvertSi: triFait, message: 'Après « ① Amazon »' },
    telephone: { ouvertSi: ligneFaite, message: 'Après « ② Stellantis »' },
    entrepot: { ouvertSi: appelFait, message: 'Après « ③ Airbus »' },
    fiche: { ouvertSi: rangementFait, message: 'Après « ④ Royal Canin »' },
  },
  finFige: 'La carte se joue au premier essai : elle ne se rejoue pas.',
};
