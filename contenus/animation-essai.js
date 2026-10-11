// Contenu d'ESSAI de la vue « animation à questions » (core/types/animation.js) — 05/10/2026.
//
// C'est la maquette Cowork d'ENT-6.5 (`docs/briefs/france-boissons/animation-6.5-couloir-2temps.html`,
// validée « parfait » par Tristan) REPRODUITE TELLE QUELLE à travers la vue : mêmes places, mêmes bulles,
// même rythme à 0,8. Premier critère de validation du brief (§13) : « c'est la même ».
// Il sert à la page `outils/essai-animation.html` et au bloc de tests `outils/test/animation.mjs`.
// Rien de réel ici n'est vérifié : dessin et scénario construits (palettes de rétention de 8 fûts en
// quinconce, règle de l'exercice, décision 52 du 05/10/2026). La séance ENT-6.5 déclarera son propre contenu.

export const MENTION = 'Contenu d’essai : la maquette d’animation d’ENT-6.5 rejouée par la vue du moteur. '
  + 'Dessin et scénario construits. Sans son.';

// Les écrans de présentation (chantier D-5) : textes du brief ENT-6.5 §4 (étape 0 « le matériel du poste », puis le mot
// FIFO expliqué), dessins de Cowork. Pour la page d'essai : un écran « Le matériel » seul, et l'animation précédée du mot.
const IMG = './contenus/images/france-boissons/';
export const ECRANS_MATERIEL = [
  { titre: 'Le chariot frontal',
    image: { src: IMG + 'materiel-chariot-frontal.svg', alt: 'Un chariot élévateur frontal pose une palette de fûts sur une autre palette', mention: 'Dessin — document pédagogique' },
    blocs: ['Le chariot frontal porte la palette devant lui, sur ses fourches. Il peut la lever pour <b>gerber</b> : poser une palette sur une autre.',
      'Pour le conduire, il faut une <b>autorisation de conduite</b> de l’employeur, après une formation comme le <b>CACES R489 catégorie 3</b>.',
      'Sécurité : on roule <b>fourches baissées</b>, et on ne passe jamais sous une charge levée.'] },
  { titre: 'La palette de rétention',
    image: { src: IMG + 'materiel-palette-retention.svg', alt: 'Une palette de rétention noire portant 8 fûts ; un fût fuit et la bière coule dans le bac' },
    blocs: ['Ici, chaque palette de fûts est posée sur une <b>palette de rétention</b> : un bac en plastique couvert d’une grille.',
      'Si un fût fuit, la bière coule dans le bac, pas sur le sol : personne ne glisse.',
      'Dans les entrepôts, on s’en sert surtout pour les produits dangereux. Ici, c’est un choix de l’exercice.'] },
];
export const ECRAN_FIFO = { titre: 'FIFO, le mot expliqué',
  blocs: ['<b>FIFO</b> veut dire <i>First In, First Out</i> : <b>premier entré, premier sorti</b>.',
    'On fait sortir d’abord le <b>lot</b> le plus ancien (un lot = les fûts fabriqués la même semaine : S20 est plus ancien que S24).',
    'Regarde ce qui se passe quand on range mal.'] };
export const MATERIEL_ESSAI = { id: 'essai-materiel', libelle: 'Le matériel', ecrans: ECRANS_MATERIEL, parties: [] };

export const ANIMATION_ESSAI = {
  id: 'essai-fifo',
  libelle: 'Comprendre le FIFO',
  vitesse: 0.8,
  alt: 'Animation : un chariot range et reprend des palettes de fûts dans deux couloirs de stockage de masse',
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
