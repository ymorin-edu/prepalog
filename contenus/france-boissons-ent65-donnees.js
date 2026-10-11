// ENT-6.5 — France Boissons, « ranger les fûts » : les DONNÉES PURES de la séance (animation, zone de masse, palettes, poids, lignes
// attendues). À part de `contenus/france-boissons-ent65.js` parce que ce fichier-ci se charge aussi hors navigateur : le corrigé
// (`contenus/corriges/ENT-6.5.js`) le lit, et le test « tout corrigé déclaré existe » l’importe dans Node, où `core/types/animation.js`
// et `core/types/fiche.js` ne se chargent pas. Rien ici n’importe le moteur. Le contenu de la séance réexporte tout.

import { STOCK_BUCHELAY } from './france-boissons.js';
import { PALETTES_ENT64 } from './france-boissons-ent64.js';

export const ID = 'france-boissons-rangement';
export const MASSE_ID = 'fb-ent65-masse';
export const FICHE_ID = 'entree-stock';
export const ID_VOLET = 'fb-ent65';

// Mercredi 16 juin 2027, 16 h (calendrier de S2 : 6.4 le mercredi à 14 h, 6.5 à 16 h).
export const SCENARIO = { date: '2027-06-16' };

const IMG = './contenus/images/france-boissons/';

// ─────────────────────────────────────────────────────────────── étape 0 : le matériel du poste (brief §4, étape 0)
// Une animation faite seulement d'écrans : une entrée « Le matériel » du menu, sans jalon (choix de Tristan du 11/10/2026).
export const MATERIEL = {
  id: 'fb-ent65-materiel',
  libelle: 'Le matériel',
  ecrans: [
    { titre: 'Le chariot frontal',
      image: { src: IMG + 'materiel-chariot-frontal.svg', alt: 'Un chariot élévateur frontal pose une palette de fûts sur une autre palette', mention: 'Dessin — document pédagogique' },
      blocs: ['Le [[chariot frontal]] porte la palette devant lui, sur ses fourches. Il peut la lever pour <b>[[gerber]]</b> : poser une palette sur une autre.',
        'Pour le conduire, il faut une <b>autorisation de conduite</b> de l’employeur, après une formation comme le <b>CACES R489 catégorie 3</b>.',
        'Sécurité : on roule <b>fourches baissées</b>, et on ne passe jamais sous une charge levée.'] },
    { titre: 'La palette de rétention',
      image: { src: IMG + 'materiel-palette-retention.svg', alt: 'Une palette de rétention noire portant 8 fûts ; un fût fuit et la bière coule dans le bac', mention: 'Dessin — document pédagogique' },
      blocs: ['Ici, chaque palette de fûts est posée sur une <b>[[palette de rétention]]</b> : un bac en plastique couvert d’une grille.',
        'Si un fût fuit, la bière coule dans le bac, pas sur le sol : personne ne glisse.',
        'Dans les entrepôts, on s’en sert surtout pour les produits dangereux. Ici, c’est un choix de l’exercice.'] },
  ],
  parties: [],
};

// ─────────────────────────────────────────────────────────────── étape 1 : comprendre le FIFO (brief §4, étape 1)
// L'animation de la maquette validée « parfait » (`docs/briefs/france-boissons/animation-6.5-couloir-2temps.html`), telle quelle :
// mêmes places, mêmes bulles, même rythme à 0,8 (c'est aussi `contenus/animation-essai.js`, rejouée par la vue du moteur).
export const FIFO = {
  id: 'fb-ent65-fifo',
  libelle: 'Comprendre le FIFO',
  vitesse: 0.8,
  libelleEcrans: 'Revoir le mot FIFO',
  alt: 'Animation : un chariot range et reprend des palettes de fûts dans deux couloirs de stockage de masse',
  ecrans: [{ titre: 'FIFO, le mot expliqué',
    blocs: ['<b>[[FIFO]]</b> veut dire <i>First In, First Out</i> : <b>premier entré, premier sorti</b>.',
      'On fait sortir d’abord le <b>[[lot]]</b> le plus ancien (un lot = les fûts fabriqués la même semaine : S20 est plus ancien que S24).',
      'Regarde ce qui se passe quand on range mal.'] }],
  scene: {
    decor: [
      { type: 'sol', de: [-0.6, -0.5], a: [3.6, 4.95] },
      { type: 'mur', y: -0.5, de: -0.6, a: 3.6, hauteur: 1.1 },
      { type: 'allee', de: [-0.6, 3.25], a: [3.6, 4.95] },
      { type: 'couloirMasse', id: 'M01', x: 0, profondeur: 3, panneau: 'M01', fleches: true },
      { type: 'couloirMasse', id: 'M02', x: 1.7, profondeur: 3, panneau: 'M02', fleches: true },
      { type: 'reperesProfondeur', couloir: 'M02' },
      { type: 'texteSol', texte: 'ALLÉE — le chariot entre et sort par ici', en: [1.9, 4.6], style: 'allee', rotation: 30 },
    ],
    lots: { S20: { couleur: 'jaune' }, S24: { couleur: 'bleu' } },
    acteurs: { chariot: { type: 'chariotFrontal' } },
  },
  parties: [
    {
      titre: 'Partie 1 sur 2 — l’erreur',
      pas: [
        { nouvelle: 'a', lot: 'S20' },
        { nouvelle: 'b', lot: 'S20' },
        { legende: 'Le chariot entre <u>par l’allée</u>. Il range le lot <b>S20</b> en commençant <b>par le fond</b>.' },
        { attendre: 1200 },
        { geste: 'poser', acteur: 'chariot', objet: 'a', place: 'M01.fond' },
        { etiquette: 'a', texte: 'posée en 1re' },
        { bulle: 'fond', lignes: ['Au fond d’abord :', 'sinon on ne pourrait', 'plus y aller ensuite'], vers: 'M01.fond', hauteur: 0.9, decalage: [-330, -150] },
        { attendre: 1800 },
        { effacer: ['fond'] },
        { geste: 'poser', acteur: 'chariot', objet: 'b', place: 'M01.milieu' },
        { etiquette: 'b', texte: 'posée en 2e' },
        { attendre: 1000 },
        { nouvelle: 'n', lot: 'S24' },
        { legende: 'Le lot <b>S24</b>, plus récent, arrive. On le pose <b>devant</b>, dans le même couloir…' },
        { attendre: 700 },
        { geste: 'poser', acteur: 'chariot', objet: 'n', place: 'M01.devant' },
        { etiquette: 'n', texte: 'posée en 3e (dernière)' },
        { bulle: 'melange', lignes: ['Deux lots dans le même', 'couloir : S20 et S24'], vers: 'M01.devant', hauteur: 0.9, decalage: [-360, -120], ton: 'alerte' },
        { attendre: 2600 },
        { effacer: ['melange'] },
        { legende: 'Une commande arrive. Le chariot ne peut prendre <b>que la palette de devant</b> : il sort le lot <b>récent</b> S24.' },
        { bulle: 'seule', lignes: ['La seule palette', 'que le chariot atteint'], vers: 'M01.devant', hauteur: 0.7, decalage: [-360, -40] },
        { bulle: 'derriere', lignes: ['Derrière : impossible', 'd’y aller'], vers: 'M01.fond', hauteur: 0.9, decalage: [-330, -150] },
        { attendre: 2600 },
        { effacer: ['seule', 'derriere'] },
        { geste: 'reprendre', acteur: 'chariot', objet: 'n' },
        { bulle: 'sortie', lignes: ['Sortie en 1re :', 'c’est la DERNIÈRE posée !'], vers: [0.5, 4.0, 0], decalage: [-330, -110], ton: 'alerte', fleche: false },
        { attendre: 2400 },
        { effacer: ['sortie'] },
        { legende: 'Le lot <b>S20, le plus ancien</b>, reste au fond. <b>Arrête-toi et réfléchis.</b>' },
        { alerte: ['a', 'b'] },
        { attendre: 1200 },
      ],
      question: {
        id: 'q1', titre: 'Question 1 — à toi de réfléchir',
        enonce: 'Pourquoi le lot S20, le plus ancien, ne sort-il pas ?',
        choix: ['Le lot S20 est trop lourd pour le chariot.',
          'Le chariot entre par l’allée : il ne peut prendre que la palette de devant.',
          'Le cariste a oublié le lot S20.',
          'Les fûts du lot S20 sont abîmés.'],
        juste: 1,
        explication: 'Le chariot n’entre que par l’allée. La dernière palette posée devant sort donc la première, et le S20 reste coincé au fond tant qu’on pose du neuf devant lui.',
        suite: '▶ Voir la bonne façon',
      },
    },
    {
      titre: 'Partie 2 sur 2 — la bonne façon',
      depart: { palettes: [{ id: 'a', lot: 'S20', place: 'M01.fond' }, { id: 'b', lot: 'S20', place: 'M01.milieu' }] },
      pas: [
        { nouvelle: 'm', lot: 'S24' },
        { legende: 'La bonne façon : le lot S24 va dans <b>un autre couloir</b>, M02, au fond. <b>Un seul lot par couloir.</b>' },
        { bulle: 'm02', lignes: ['M02 est vide :', 'le lot S24 a son couloir'], vers: 'M02.milieu', decalage: [60, 30], ton: 'ok' },
        { attendre: 1600 },
        { geste: 'poser', acteur: 'chariot', objet: 'm', place: 'M02.fond' },
        { etiquette: 'm', texte: 'lot S24 seul ici', ton: 'ok' },
        { effacer: ['m02'] },
        { bulle: 'm01', lignes: ['M01 : que du S20'], vers: 'M01.milieu', hauteur: 0.9, decalage: [-330, -120], ton: 'ok' },
        { attendre: 2200 },
        { effacer: ['m01'] },
        { legende: 'Une commande arrive : on prend <b>le lot le plus ancien</b>, dans M01. Rien n’est bloqué.' },
        { bulle: 'ancien', lignes: ['Le plus ancien sort', 'en premier : S20'], vers: 'M01.milieu', hauteur: 0.7, decalage: [-380, -10], ton: 'ok' },
        { attendre: 1600 },
        { geste: 'reprendre', acteur: 'chariot', objet: 'b' },
        { effacer: ['ancien'] },
        { bulle: 'attend', lignes: ['S24 attend son tour,', 'sans rien bloquer'], vers: 'M02.fond', hauteur: 0.9, decalage: [70, 10], ton: 'ok' },
        { attendre: 2400 },
      ],
      question: {
        id: 'q2', titre: 'Question 2 — à ton tour',
        enonce: 'Demain, un lot S26 de Heineken arrive. M01 contient du S20, M02 du S24, M03 est vide. Où poses-tu le lot S26 ?',
        choix: ['En M02, devant le lot S24.', 'En M01, devant le lot S20.', 'En M03, au fond.', 'En M02, sur le lot S24.'],
        juste: 2,
        explication: 'Un seul lot par couloir : le S26 prend le couloir vide M03, en commençant par le fond. Ainsi le S20 puis le S24 pourront sortir avant lui.',
        suite: '⟲ Tout revoir depuis le début',
      },
    },
  ],
  aRetenir: 'le chariot entre par l’allée, la <b>dernière palette posée sort en premier</b>. Donc <b>un seul lot par couloir</b>.',
};

// ─────────────────────────────────────────────────────────────── étape 2 : la zone de masse (brief §4, étape 2)
// Les références de la zone : clés courtes de la vue ; `article` = la ligne du stock de Buchelay (nom, stock d'avant).
export const REFS = {
  HEI30: { article: 'heineken30', format: '30 L' },
  AFF20: { article: 'affligem20', format: '20 L' },
  PEL20: { article: 'pelforth20', format: '20 L' },
  EDW20: { article: 'edelweiss20', format: '20 L' },
};
export const articleDe = (cle) => STOCK_BUCHELAY.find((a) => a.id === REFS[cle].article);
const pile = (ref, lot, n, futs) => Array.from({ length: n }, () => (futs == null ? { ref, lot } : { ref, lot, futs }));

// Les palettes reçues en ENT-6.4 (même ordre, même nombre de fûts BONS : le fût qui fuit de P3 est resté en zone litiges ; P2 est de la
// Pelforth, lue sur l'étiquette). Poids construits (fût plein 30 L ≈ 40 kg, 20 L ≈ 29 kg, palette de rétention ≈ 30 kg, à la dizaine).
// Lot : S24 pour toutes (brief §4).
const CLE_ENT64 = { 'HEI-30': 'HEI30', 'AFF-20': 'AFF20', 'PEL-20': 'PEL20', 'EDW-20': 'EDW20' };
const KG_FUT = { '30 L': 40, '20 L': 29 }, KG_RETENTION = 30;
export const PALETTES = PALETTES_ENT64.map((p) => {
  const ref = CLE_ENT64[p.etiq.ref];                                   // ce qui est VRAIMENT sur la palette (l'étiquette)
  const futs = 8 - p.manque.length - Object.keys(p.avarie).length;     // les fûts bons sur 8 places (P3 : 8 − 1 qui fuit ; P4 : 8 − 1 vide)
  const kg = Math.round((futs * KG_FUT[REFS[ref].format] + KG_RETENTION) / 10) * 10;
  const reception = p.etiq.ref !== p.ref ? `réserve « produit différent » : le BL dit ${articleDe(CLE_ENT64[p.ref]).marque}, l’étiquette ${articleDe(ref).marque}`
    : Object.keys(p.avarie).length ? `${futs} fûts : le 8e fuit, il est en zone litiges`
      : p.bl < 8 ? `conforme (${futs} fûts, comme le BL)` : 'conforme';
  return { id: p.id, ref, lot: 'S24', futs, kg, reception };
});

export const REGLES = [
  'Un couloir = <b>une seule référence</b>.',
  '<b>Un seul lot par couloir</b> : le chariot entre par l’allée et reprend la palette de devant ; on ne pose donc jamais un lot devant ni sur un lot plus ancien (c’est ce qui permet de respecter le FIFO).',
  '<b>Hauteur de gerbage</b> : fûts 30 L → 2 palettes au plus ; fûts 20 L → 3 au plus.',
  'On remplit un couloir <b>par le fond</b>.',
  'Le couloir <b>VIDES</b> ne reçoit que les fûts vides rendus par les clients.',
];

export const MASSE = {
  id: MASSE_ID,
  libelle: 'Zone de masse',
  mode: 'masse',
  personnage: { nom: 'Nadia', role: 'cheffe de quai', date: 'mercredi 16 juin, 16 h',
    texte: { guidage: 'On range les palettes de Mons dans la zone de masse. Le fût qui fuit reste en zone litiges.',
      entrainement: 'On range les palettes de Mons dans la zone de masse. Le fût qui fuit reste en zone litiges.',
      evaluation: 'Range les palettes reçues dans la zone de masse.' } },
  consigne: 'Prends une palette (clique sa carte), puis clique un couloir sur le plan.',
  plan: {
    couloirs: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07'].map((id) => ({ id, places: 4 })).concat({ id: 'M08', places: 4, reserve: 'vides' }),
    reception: 'Zone de réception',
    litiges: { titre: 'Zone litiges', futs: 1 },
    quais: ['QUAI 10', 'QUAI 11', 'QUAI 12', 'QUAI 13', 'QUAI 14'],
  },
  references: Object.assign(Object.fromEntries(Object.keys(REFS).map((k) => [k,
    { nom: articleDe(k).court, court: articleDe(k).court.replace(' Blonde', '').replace(' fût', ''), format: REFS[k].format }])),
  { VIDES: { nom: 'Fûts vides (retours clients)', court: 'VIDES', vides: true } }),
  hauteurs: { '30 L': 2, '20 L': 3 },
  portee: 4,
  lots: { S18: { couleur: 'ambre' }, S19: { couleur: 'ambre' }, S20: { couleur: 'jaune' }, S24: { couleur: 'bleu' } },
  // Le stock de départ (construit, position 1 = le fond) : celui de l'extrait de stock d'ENT-6.2 (Heineken 30 L 16, Affligem 2, Pelforth 24,
  // Edelweiss 24 ; le bloc de tests vérifie l'accord avec `dispo`).
  stock: {
    M01: [pile('HEI30', 'S20', 2)],
    M03: [pile('PEL20', 'S24', 2)],
    M04: [pile('PEL20', 'S19', 1)],
    M05: [pile('AFF20', 'S18', 1, 2)],
    M07: [pile('EDW20', 'S24', 3)],
    M08: [pile('VIDES', null, 2), pile('VIDES', null, 1, 6)],
  },
  palettes: PALETTES,
  criteres: [{ type: 'zoneReservee', nom: 'couloir VIDES' }, { type: 'uneReference' }, { type: 'unSeulLot' }, { type: 'hauteurGerbage' }, { type: 'parLeFond' }],
  regles: { titre: 'Les règles', lignes: REGLES },
};


// Ce que la ligne d'une palette doit porter (CALCULÉ) : la référence vraie, les fûts entrés, le stock après ; le couloir est celui de l'élève.
export const attenduLigne = (id) => {
  const p = PALETTES.find((x) => x.id === id), a = articleDe(p.ref);
  return { ref: p.ref, lot: p.lot, futs: p.futs, avant: a.dispo, apres: a.dispo + p.futs };
};

// ─────────────────────────────────────────────────────────────── les jalons (10, pondérés : 17 + 3 de questions = 20)
// Poids validés par Tristan le 11/10/2026 (brief §5) : comprendre le FIFO 3,5 (Q1 1,5, Q2 2), rangement 8,5 (P1 2,5, P2 2,5, P3 1,5,
// P4 2), entrée en stock 5 (P1 1, P2 1,5, P3 1,5, P4 1), plus 3 pour les deux questions au fil notées (`part`). La forme pèse 0.
// C1.5 = 12 (jalons 1 à 6), C1.6 = 8 (jalons 7 à 10 et les questions).
export const GROUPES = { fifo: 'Comprendre le FIFO', rangement: 'Rangement dans la zone de masse', stock: 'Entrée en stock' };
export const POIDS = {
  [`${FIFO.id}-q1`]: 1.5, [`${FIFO.id}-q2`]: 2,
  'palette-P1': 2.5, 'palette-P2': 2.5, 'palette-P3': 1.5, 'palette-P4': 2,
  'stock-P1': 1, 'stock-P2': 1.5, 'stock-P3': 1.5, 'stock-P4': 1,
};
