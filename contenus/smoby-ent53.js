// ENT-5.3 — Smoby, « la visite de la plateforme » : la déclaration de la visite (mode `visite` de la vue Plan
// d'entrepôt, `core/types/entrepot-visite.js`). Brief de la séance : `docs/briefs/ENT-5.3-smoby-visite.md` (§6 :
// tout le contenu, textes AU MOT PRÈS, validés par Tristan à l'écran sur la maquette v2 du 04/10/2026).
// Elle sert aussi de cas « visite » à la page d'essai du moteur (`contenus/entrepot-essai.js`).
//
// Vérifié : la plateforme de stockage logistique de Smoby à Moirans-en-Montagne (hebdo39.net).
// Construit : le plan de la zone et son stock (ceux d'ENT-5.5, `contenus/smoby-entrepot.js`), le parcours de
// visite, Bruno (chef de quai, prénom inventé), l'adresse A1-T03-N2-E1.
// Photos : libres (Pexels, Unsplash) et un dessin de Cowork ; AUCUNE n'est la plateforme Smoby, aucun visage —
// dit sous chaque photo. Sources, retouches et empreintes : `contenus/smoby/LISEZMOI.md`.
//
// Les coordonnées sont dans le repère de chaque image (`repere`), reprises de la maquette v2.

import { etapesEntrepot } from '../core/types/entrepot.js';
import { LEXIQUE as LEXIQUE_SMOBY, VOCAB as VOCAB_SMOBY } from './smoby.js';
import { BRUNO } from './smoby-ent54.js';
import { GAMMES, PRODUITS, PLAN, STOCK } from './smoby-entrepot.js';

const D = './contenus/smoby/visite/';
const AUTRE = 'Photo d’un autre entrepôt : ';

export const IMAGES = {
  ciel: { src: `${D}ciel-pexels-2804929.jpg`, repere: [1600, 1066], alt: 'Plateforme logistique vue par drone',
    mention: `${AUTRE}Marcin Jozwiak, Pexels n° 2804929.` },
  quaiInt: { src: './contenus/smoby/quai-interieur.jpg', repere: [1280, 854], alt: 'Le quai vu de l’intérieur : porte ouverte, niveleur, remorque',
    mention: `${AUTRE}Pexels n° 1267327, marques effacées.` },
  reception: { src: `${D}visite-reception-pexels-4481326.jpg`, repere: [1280, 854], alt: 'Palettes filmées posées au sol dans un hall',
    mention: `${AUTRE}Tiger Lily, Pexels n° 4481326.` },
  principale: { src: `${D}visite-allee-principale-pexels-36398150.jpg`, repere: [1280, 853], alt: 'Large allée avec marquage au sol, chariot au loin',
    mention: `${AUTRE}Willians Huerta, Pexels n° 36398150, marque du chariot floutée.` },
  // Le fichier fait 1600 × 900 ; les coordonnées des mots sont dans le repère de la maquette (même proportion).
  allee: { src: `${D}allee-pexels-5775099.jpg`, repere: [1400, 788], alt: 'Allée d’entrepôt avec racks à palettes',
    mention: `${AUTRE}Handi Boyz LLC, Pexels n° 5775099.` },
  litiges: { src: `${D}visite-litiges-unsplash-mFUIel9hWos.jpg`, repere: [900, 922], alt: 'Coin isolé : palettes filmées et cartons mis à part',
    mention: `${AUTRE}Duc LE, Unsplash, marques effacées.` },
  litigesDessin: { src: `${D}visite-litiges-dessin.jpg`, repere: [1280, 854], alt: 'Dessin d’une zone litiges : marquage rouge, panneau, emplacements L1 et L2, palettes bloquées',
    mention: 'Dessin : ce qu’on doit voir dans une zone litiges.' },
  bureau: { src: `${D}visite-bureau-pexels-7658310.jpg`, repere: [1280, 854], alt: 'Bureau d’atelier : classeur, papiers, écrans',
    mention: `${AUTRE}Pavel Danilyuk, Pexels n° 7658310.` },
  quiz: { src: `${D}rack-pexels-4483609.jpg`, repere: [1280, 1920], alt: 'Racks à palettes avec une allée',
    mention: `${AUTRE}Pexels n° 4483609.` },
  travee: { src: `${D}visite-travee-pexels-29454378.jpg`, repere: [1100, 1246], alt: 'Racks à palettes vus de face',
    mention: `${AUTRE}Pexels n° 29454378, recadrée, marques floutées.` },
};

const ADRESSE = 'A1-T03-N2-E1';

export const VISITE = {
  id: 'smoby-visite',
  libelle: 'Visite de la plateforme',
  mode: 'visite',
  // Chaque case notée à son PREMIER essai (lot 3 du brief SMOBY-notation-5.3-5.8, Q1 de Tristan du 07/10/2026) :
  // l'élève recommence toujours jusqu'à trouver, mais la note garde le premier essai.
  premierEssai: true,
  plan: PLAN, gammes: GAMMES, produits: PRODUITS, stock: STOCK,
  // À 8 h, aucune palette n'est encore arrivée ; on traverse l'allée principale devant la zone de réception.
  zones: { reception: { note: 'vide à 8 h' }, passagePietons: { devant: 'reception' } },
  personnage: { nom: 'Bruno', role: 'chef de quai', date: 'mercredi 9 décembre' },
  images: IMAGES,
  etapes: [
    {
      id: 'accueil', type: 'accueil', titre: 'Accueil', heure: '8:00', image: 'ciel',
      texte: 'Bienvenue Yanis ! Avant de toucher un chariot, on fait le tour de la plateforme. D’abord vue du ciel, puis on entre dans l’entrepôt.',
      consigne: 'Lis le message de Bruno, puis clique <b>Suivant</b>.',
      surTitre: 'Smoby · plateforme de Moirans-en-Montagne (Jura)',
      grandTitre: 'Premier jour de Yanis :<br>la visite de la plateforme',
      intro: 'Mercredi 9 décembre, 8 h. Yanis commence au poste de cariste. Avant de toucher un chariot, Bruno, le chef de quai, lui fait faire le tour.',
      programme: [
        'Découvrir la plateforme vue du ciel', 'Suivre le parcours de visite dans l’entrepôt',
        'Reconnaître chaque endroit sur une photo', 'Apprendre les mots du rack',
        'Les retrouver sur une autre photo', 'Délimiter toi-même une travée',
        `Lire une adresse d’emplacement (<b class="pe-mono">${ADRESSE}</b>) et la retrouver dans l’entrepôt`,
      ],
      encadre: 'Les photos viennent <b>d’autres entrepôts</b> : ce ne sont pas celles de Smoby.',
    },
    {
      id: 'ciel', type: 'photoPoints', titre: 'Vue du ciel', heure: '8:05', image: 'ciel', effet: 'zoom', rayon: 31,
      texte: 'Voilà la plateforme vue d’en haut. Repère bien où passent les camions… et où passent les piétons.',
      aide: 'Ouvre les 6 points, puis réponds aux 3 questions.',
      liste: 'Les 6 points',
      consigne: 'Ouvre les <b>6 points</b> de la photo : un clic fait descendre le drone.',
      consigneTous: 'Les 6 points sont ouverts. Relis-les si besoin, puis clique <b>Passer aux 3 questions</b> (à gauche).',
      consigneFini: 'Les 3 questions sont réussies. Clique <b>Suivant</b>.',
      points: [
        { n: 1, x: 1080, y: 120, mot: 'L’entrepôt', def: 'Le bâtiment de stockage : sous ce toit, les racks et les allées où travaille Yanis.', zoom: { cx: 1090, cy: 155, s: 1.62 } },
        { n: 2, x: 470, y: 420, mot: 'Les quais', def: 'Les portes où les camions se mettent à cul pour être chargés ou déchargés. Ici, deux semi-remorques sont à quai.', zoom: { cx: 495, cy: 400, s: 3 } },
        { n: 3, x: 1040, y: 575, mot: 'Parking poids lourds', def: 'Les remorques attendent leur tour, garées en épi, avant d’aller à quai.', zoom: { cx: 1040, cy: 560, s: 2.2 } },
        { n: 4, x: 330, y: 760, mot: 'Aire de manœuvre', def: 'Le grand espace où les camions reculent vers les quais. On n’y circule pas à pied.', zoom: { cx: 350, cy: 640, s: 2 } },
        { n: 5, x: 440, y: 578, mot: 'Passage piétons', def: 'Le seul chemin pour traverser à pied la cour des camions.', zoom: { cx: 470, cy: 560, s: 2.6 } },
        { n: 6, x: 667, y: 1000, mot: 'Parking des salariés', def: 'Les voitures restent à part : voitures et camions ne se croisent pas.', zoom: { cx: 700, cy: 960, s: 2 } },
      ],
      puis: {
        type: 'photoQuestions', bouton: 'Passer aux 3 questions →', liste: 'Les 3 questions',
        consigne: '{q} <b>&nbsp;Clique sur la photo.</b>',
        juste: 'Oui, c’est bien ici.', faux: 'Pas ici. Relis le point « {aide} », dans la liste à gauche.',
        questions: [
          { id: 'camions', q: 'Où attendent les camions avant d’aller à quai ?', zones: [[720, 470, 1360, 650]], aide: 'Parking poids lourds' },
          { id: 'pietons', q: 'Par où un piéton traverse-t-il la cour ?', zones: [[180, 545, 700, 605], [30, 420, 200, 560]], aide: 'Passage piétons' },
          { id: 'quais', q: 'Où les camions sont-ils chargés et déchargés ?', zones: [[390, 300, 600, 510]], aide: 'Les quais' },
        ],
      },
    },
    {
      id: 'parcours', type: 'parcours', titre: 'Le parcours', heure: '8:15',
      texte: 'On entre. Suis-moi : je te montre le chemin d’une palette, du quai jusqu’au rack.',
      aide: 'Suis les 6 étapes du parcours.',
      consigne: 'Clique les étapes du parcours <b>dans l’ordre</b>, sur le plan : chacune montre ce qu’on voit depuis ce point.',
      consigneFini: 'Le tour est fini. Clique <b>Suivant</b>.',
      debut: 'Commence par l’étape <b>n° 1</b>, devant le quai.',
      ordreMsg: 'Dans l’ordre : l’étape suivante est la n° {n}.',
      etapes: [
        { n: 1, ancre: 'quai:QUAI 2', titre: 'Le quai', images: ['quaiInt'], dir: 90, cone: 34,
          texte: '« Ici arrivent les camions, à reculons contre la porte. Le niveleur fait le pont entre le camion et le sol. On ne décharge jamais un camion qui n’est pas calé. »' },
        { n: 2, ancre: 'zone:reception', titre: 'La zone de réception', images: ['reception'], dir: -90, cone: 70,
          texte: '« Les palettes déchargées attendent ici. On les contrôle avec le bon de livraison avant de les ranger. Cet après-midi, ce sera ton travail. »' },
        { n: 3, ancre: 'allee:principale', decalage: [-80, 0], titre: 'L’allée principale', images: ['principale'], dir: 180, cone: 60,
          texte: '« Les chariots roulent ici dans les deux sens. À pied, on reste sur le côté, et on traverse seulement au passage piétons. »' },
        { n: 4, ancre: 'allee:A', decalage: [0, 80], titre: 'Les allées de stockage', images: ['allee'], dir: -90, cone: 70,
          texte: '« Les racks à palettes, de chaque côté de l’allée : A1 à gauche, A2 à droite. Chaque emplacement a une adresse collée sur la lisse : c’est comme ça qu’on retrouve une palette. »' },
        { n: 5, ancre: 'zone:litiges', titre: 'La zone litiges', images: ['litiges', 'litigesDessin'], dir: 0, cone: 50,
          texte: '« Une palette abîmée ou en attente d’une réponse du fournisseur vient ici, en L1 ou L2. Elle ne va pas en stock. »' },
        { n: 6, ancre: 'zone:bureau', titre: 'Le bureau du chef de quai', images: ['bureau'], dir: 0, cone: 50,
          texte: '« Mon bureau. Un problème, un document à signer : c’est ici. »' },
      ],
    },
    {
      // Demande de Tristan (05/10/2026) : après le parcours, l'élève associe chaque photo à son endroit du plan.
      // Photos dans le désordre ; litiges : la vraie photo (pas le dessin). Textes de Claude Code, à valider.
      id: 'reperer', type: 'associer', titre: 'Où est-ce ?', heure: '8:25', parcours: 'parcours',
      texte: 'À toi. Je te montre une photo : tu me dis de quel endroit du parcours elle a été prise.',
      aide: 'Associe les 6 photos à leur endroit.',
      liste: 'Les photos',
      consigne: 'D’où a été prise cette photo ? <b>Clique son numéro sur le plan.</b>',
      consigneFini: 'Les 6 photos sont associées. Clique <b>Suivant</b>.',
      juste: 'Oui : n° {n}, {titre}.',
      faux: 'Non, pas depuis le n° {n}. Regarde bien la photo, ou revois le parcours.',
      photos: [
        { id: 'allee', image: 'allee', n: 4 }, { id: 'quai', image: 'quaiInt', n: 1 }, { id: 'bureau', image: 'bureau', n: 6 },
        { id: 'reception', image: 'reception', n: 2 }, { id: 'litiges', image: 'litiges', n: 5 }, { id: 'principale', image: 'principale', n: 3 },
      ],
    },
    {
      id: 'mots', type: 'photoPoints', titre: 'Les mots du rack', heure: '8:30', image: 'allee', effet: 'bulle', rayon: 24,
      texte: 'Un rack à palettes a son vocabulaire. Si tu dis « l’étagère orange », personne ne te comprend.',
      aide: 'Ouvre les 8 mots.',
      liste: 'Les mots du rack',
      consigne: 'Ouvre les <b>8 mots</b> du rack : clique un numéro sur la photo, ou un mot dans la liste.',
      consigneFini: 'Les 8 mots sont ouverts. Clique <b>Suivant</b>.',
      points: [
        { n: 1, x: 215, y: 430, mot: 'Échelle', def: 'Le montant vertical, percé de trous, qui porte les lisses. Deux échelles délimitent une travée.' },
        { n: 2, x: 430, y: 247, mot: 'Lisse', def: 'La barre horizontale sur laquelle on pose les palettes. Sa charge maximale est écrite sur une plaque.' },
        { n: 3, x: 150, y: 118, cx: 155, cy: 182, mot: 'Étiquette d’adresse', def: 'L’adresse de l’emplacement, collée sur la lisse. On la lit avant de poser la palette.' },
        { n: 4, x: 385, y: 470, mot: 'Palette filmée', def: 'Les cartons sont tenus par un film plastique étirable enroulé autour de la palette.' },
        { n: 5, x: 740, y: 620, mot: 'Allée', def: 'Le couloir entre deux racks, où roulent les chariots.' },
        { n: 6, x: 1300, y: 290, mot: 'Niveau', def: 'Chaque étage de lisses est un niveau. Le sol est le niveau 1.' },
        { n: 7, x: 330, y: 330, mot: 'Travée', def: 'L’espace entre deux échelles, sur toute la hauteur du rack.' },
        { n: 8, x: 1100, y: 420, mot: 'Croisillons', def: 'Les barres en diagonale qui rigidifient l’échelle. Un croisillon tordu : rack à signaler.' },
      ],
    },
    {
      id: 'quiz', type: 'photoQuestions', titre: 'Quiz', heure: '8:40', image: 'quiz',
      texte: 'Même vocabulaire, autre entrepôt. Montre-moi que tu as retenu.',
      aide: 'Trouve les 4 éléments sur la photo.',
      liste: 'Tes réponses',
      consigne: 'Sur cette photo d’un autre entrepôt, <b>clique sur {mot}</b>.',
      consigneFini: 'Les 4 éléments sont trouvés. Clique <b>Suivant</b>.',
      juste: 'Oui : c’est {mot}.', faux: 'Non, pas ici. {aide}',
      encadre: 'Pas de légende ici : c’est à toi de reconnaître chaque élément.',
      questions: [
        // Toutes les cibles visibles (retours 5.3, A1) : toutes les échelles des racks ; les lisses qui portent une
        // palette filmée (pas celle des fûts bleus) ; toutes les palettes filmées.
        { id: 'echelle', mot: 'une échelle', zones: [[165, 0, 335, 1560], [300, 150, 425, 1500], [545, 380, 660, 1340], [705, 530, 770, 1240], [800, 650, 860, 1190], [865, 720, 955, 1140], [1135, 0, 1280, 1700]],
          aide: 'Une échelle est un montant vertical percé de trous, relié à un autre par des barres en diagonale.' },
        { id: 'lisse', mot: 'une lisse qui porte une palette filmée', zones: [[305, 80, 1190, 165], [0, 495, 190, 558], [0, 555, 330, 650], [330, 690, 565, 728], [0, 998, 560, 1068]],
          aide: 'Une lisse est la barre horizontale sous la palette : la palette pose dessus.' },
        { id: 'palette', mot: 'une palette filmée', zones: [[0, 150, 265, 500], [350, 490, 560, 700], [0, 680, 250, 960], [340, 0, 640, 85], [630, 0, 905, 75], [365, 820, 560, 960]],
          aide: 'Cherche des cartons ou des seaux entourés de film plastique.' },
        { id: 'allee', mot: 'l’allée', zones: [[0, 1560, 1180, 1920], [230, 1350, 1150, 1560], [780, 1100, 1140, 1350]],
          aide: 'L’allée est le couloir au sol, entre les racks.' },
      ],
    },
    {
      // Une seule travée complète (celle du milieu). Son niveau du bas est un passage : c'est toujours une
      // travée — à dire en classe (décision 11 de Tristan).
      id: 'travee', type: 'delimiter', titre: 'La travée', heure: '8:45', image: 'travee',
      texte: 'La travée, c’est le mot qu’on emploie le plus ici. Montre-moi où commence et où finit une travée.',
      aide: 'Place les 4 coins de la travée, puis trouve ses 3 lisses.',
      liste: 'La travée',
      consigne: 'Une travée, c’est l’espace <b>entre deux échelles</b>, <b>du sol jusqu’en haut</b> du rack. Clique <b>les 4 coins</b> d’une travée complète sur la photo.',
      consigneFini: 'Travée délimitée et ses 3 lisses trouvées. Clique <b>Suivant</b>.',
      rappel: 'Rappel : une <b>échelle</b> est le montant vertical percé de trous ; une travée va d’une échelle à la suivante, sur <b>toute la hauteur</b>. Clique un point déjà posé pour l’enlever.',
      coins: { hg: [287, 45], hd: [847, 47], bg: [258, 1175], bd: [876, 1173] },
      tolerance: 80,
      messages: {
        juste: 'Oui : cette travée va de l’échelle de gauche à l’échelle de droite, du sol jusqu’en haut.',
        faux: 'Pas encore : {coins}. Un coin se place là où une <b>échelle</b> touche le <b>sol</b> ou s’arrête <b>en haut</b>. Clique le point rouge pour l’enlever.',
      },
      correction: { legendes: [
        { texte: 'échelle', x: 268, y: 780, rot: -90 }, { texte: 'échelle', x: 866, y: 780, rot: 90 },
        { texte: 'sol', x: 550, y: 1122 }, { texte: '1 travée', x: 550, y: 590, plein: true },
      ] },
      jalon: 'Travée délimitée (4 coins justes)',
      puis: {
        type: 'zones', liste: 'Les lisses', jalon: 'Les 3 lisses de la travée trouvées',
        consigne: 'Maintenant, clique <b>chaque lisse de cette travée</b> : les barres horizontales accrochées à ses deux échelles, qui portent les palettes.',
        rappel: 'Rappel : une <b>lisse</b> est la barre horizontale posée entre deux échelles ; les palettes reposent dessus. Attention aux barres <b>du fond</b>, qu’on voit à travers la travée.',
        x: [270, 870], marge: 8,
        // La lisse du haut compte même vide (décision 11).
        cibles: [{ nom: 'lisse du haut', y0: 60, y1: 96 }, { nom: 'lisse du milieu', y0: 436, y1: 472 }, { nom: 'lisse du bas', y0: 670, y1: 704 }],
        pieges: [[145, 178], [208, 242], [288, 312], [368, 394]].map(([y0, y1]) => ({ y0, y1,
          message: 'Cette barre est <b>au fond</b>, sur le rack de derrière. Cherche les lisses accrochées aux échelles <b>de devant</b>.' })),
        juste: 'Oui : c’est la {nom}.',
        horsEtendue: 'C’est bien une lisse, mais celle de la <b>travée d’à côté</b>. Reste entre les deux échelles de ta travée.',
        horsCible: 'Ici, ce n’est pas une lisse. Une lisse est une barre horizontale orange, entre les deux échelles.',
        dejaTrouve: 'Celle-ci est déjà trouvée.',
      },
    },
    {
      id: 'adresse', type: 'adresse', titre: 'L’adresse', heure: '8:50', code: ADRESSE,
      texte: 'Chaque emplacement a une adresse. Avec elle, tu retrouves n’importe quelle palette sans chercher.',
      aide: 'Décompose l’adresse, puis retrouve l’emplacement.',
      sens: ['allée et côté', 'travée', 'niveau', 'emplacement'],
      choix: ['allée et côté', 'emplacement', 'niveau', 'travée'],
      consigne: 'Bruno te montre une étiquette collée sur une lisse. <b>Que veut dire chaque partie ?</b> Choisis, puis valide.',
      rappel: 'Une adresse se lit <b>de la plus grande zone à la plus petite</b> : on trouve l’allée, puis la travée, puis le niveau, puis l’emplacement.',
      encadre: '<b>A1</b> : allée A, côté 1. Une allée a deux côtés : <b>A1</b> et <b>A2</b> sont les racks de part et d’autre de l’allée A. '
        + '<b>T</b> = travée, <b>N</b> = niveau (le sol est N1), <b>E</b> = emplacement (3 palettes par niveau).',
      consigneTravee: 'Retrouve <b>{code}</b> : clique la bonne <b>travée</b> sur le plan.',
      consigneEmplacement: 'Clique l’<b>emplacement</b> {code} dans la travée vue de face.',
      consigneFini: 'Emplacement trouvé. Clique <b>Suivant</b>.',
      // La désignation et le poids sont lus dans le stock par le moteur, jamais recopiés ici.
      trouve: '✓ Trouvé : <b>{adresse}</b> — une {produit} de {kg}.',
      jalons: { decomposer: `Adresse ${ADRESSE} décomposée (4 parties justes)`, retrouver: `Emplacement ${ADRESSE} retrouvé en 3 clics au plus` },
      // Au premier clic, c'est une chance sur 144 : trop dur en guidage (brief SMOBY-notation §5.1, validé).
      clicsMax: 3,
    },
  ],
  fin: {
    titre: 'Fin', heure: '9:00', image: 'ciel',
    texte: 'Bien, Yanis. Cet après-midi, premier camion de l’usine d’Arinthod au quai n° 2. On commence par la sécurité.',
    consigne: 'La visite est terminée.',
    grandTitre: 'Fin de la visite',
  },
};

// ─────────────────────────────────────────────────────────────── la séance (activites/smoby-visite.js)

// Les jalons, dans l'ordre du suivi, notés au premier essai (brief SMOBY-notation-5.3-5.8 §5.1, barème validé par
// Tristan le 07/10/2026) : 23 cases, 20 points, 6 lignes au bandeau de fin. Les 6 points du ciel, le parcours et
// les 8 mots restent des passages obligés, non notés (on ne peut pas s'y tromper).
const BAREME = [
  ['Vue du ciel', /^ciel-/, 1],                         // 3 questions à 1
  ['Où est-ce ?', /^reperer-/, 2 / 3],                  // 6 photos à 2/3
  ['Les éléments du rack', /^quiz-/, 0.75],            // 4 éléments (l'échelle se trouve au hasard une fois sur trois)
  ['La travée', /^travee-(hg|hd|bg|bd)$/, 0.5],         // 4 coins à 0,5
  ['La travée', /^travee-cibles$/, 2],                  // les 3 lisses sans clic faux
  ['L’adresse : la décomposer', /^adresse-partie/, 1],  // 4 parties à 1 (une seule validation)
  ['L’adresse : la retrouver', /^adresse-retrouver$/, 2],
];
export const ETAPES = etapesEntrepot(VISITE).map((e) => {
  // Un jalon sans place au barème ne fait pas tomber le site (une séance qui lève une erreur vide l'accueil) : il ne
  // pèse rien, et le moteur prévient que la somme ne fait plus 20 (un test le voit).
  const b = BAREME.find(([, re]) => re.test(e.id)) || [e.titre, null, 0];
  if (!b[1]) console.warn(`[ENT-5.3] le jalon ${e.id} n'a pas de place au barème`);
  return Object.assign(e, { groupe: b[0], poids: b[2] });
});

export const VOCAB = Object.assign({}, VOCAB_SMOBY, { unit: 'palette', unitPl: 'palettes' });

// Les 8 mots du rack, cliquables partout dans la séance, avec la définition de l'étape « Les mots du rack »
// (brief §6.5 : même définition) — lue dans la déclaration, jamais recopiée.
const MOTS = VISITE.etapes.find((e) => e.id === 'mots').points;
export const LEXIQUE = Object.assign({}, LEXIQUE_SMOBY,
  Object.fromEntries(MOTS.map((p) => [p.mot.charAt(0).toLowerCase() + p.mot.slice(1), p.def])));

// Un seul message, qui envoie vers la visite (le brief ne prévoit pas de messagerie ; écrit par Claude Code,
// à valider à l'écran). Tout le reste se dit dans la visite, étape par étape.
// Le message est daté dans l'histoire (retours 5.3, A6) : mercredi 9 décembre, 7 h 55, heure locale, de l'année
// scolaire en cours (de septembre à décembre : cette année ; de janvier à août : l'année d'avant).
function tsVisite() {
  const d = new Date();
  const an = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return new Date(an, 11, 9, 7, 55).getTime();
}

export const VOLET = {
  id: 'smoby-visite',
  semer: () => ({
    mails: [{
      folder: 'in', ts: tsVisite(), from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
      subject: 'Ton premier jour : la visite', kind: 'text',
      text: 'Bienvenue Yanis !\n\nAvant de toucher un chariot, on fait le tour de la plateforme. '
        + 'Menu « Visite de la plateforme » : je t’attends à la première étape.\n\nBruno',
    }],
  }),
};

export const ACCUEIL = {
  titre: 'La visite de la plateforme',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Bruno', 'Menu Messagerie : ton premier jour commence par la visite.'],
    ['Faire la visite avec Bruno', 'Menu Visite de la plateforme : une étape après l’autre, « Suivant » quand elle est finie.'],
    ['Les mots du métier', 'Les mots soulignés s’ouvrent d’un clic : [[échelle]], [[lisse]], [[travée]], [[niveau]]…'],
  ],
};
