// Corrigé d'ENT-25.1 (semaine des filières de 2de : une réception chez Spartoo), montré dans l'onglet « Corrigés » de l'enseignant.
// Le même jeu pour tous (aucun tirage). N'importe que les données pures : se charge aussi sous Node.

import { LOCALISER, PALETTE, CARTONS_RECUS, PAIRES_PAR_CARTON, PLAN, PALETTES, PLACE_JUSTE, SAISIE, BL, REC, POIDS } from '../vitrine-logistique.js';

const somme = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const L = LOCALISER.lieux[0];

export const CORRIGE = {
  code: 'ENT-25.1',
  titre: 'Et si tu choisissais la Logistique ?',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: `⓪ La carte de France (${POIDS.carte * 2} points)`, genre: 'question', texte: 'Où est l’entrepôt de Spartoo ?',
      rep: `${L.ville} : région Auvergne-Rhône-Alpes, département de l’Isère (${L.dep}).`,
      note: `${POIDS.carte} point par réponse juste au premier coup (région, puis département).` },
    { etape: 2, etapeTitre: `① Au quai : le contrôle (${somme(POIDS.quai)} points)`, genre: 'tableau', texte: `La palette du bon de livraison ${BL}`,
      entetes: ['Geste', 'Attendu'],
      reponses: [
        ['Compter (quantitatif)', `${PALETTE.bl} cartons annoncés, ${CARTONS_RECUS} comptés : 2 × 2 cartons par couche, 3 couches, il manque un carton en haut, au fond`],
        ['Faire le tour (qualitatif)', 'Un carton enfoncé sur la face arrière (invisible de face)'],
        ['Décider', 'Accepter avec réserves, deux motifs : carton endommagé et carton manquant'],
        ['Écrire les réserves sur le bon', '1 carton endommagé, 1 carton manquant ; puis faire signer le chauffeur'],
      ],
      note: `Comptage ${POIDS.quai.comptage}, décision ${POIDS.quai.decision}, réserves ${POIDS.quai.reserve}. La signature ne compte pas de points ; le bon signé ne se corrige plus.` },
    { etape: 3, etapeTitre: `② La mise en stock (${POIDS.ranger} points)`, genre: 'question', texte: 'L’emplacement de la palette',
      rep: `${PLACE_JUSTE} : côté A1 (chaussures de sport), rotation ${PALETTES[0].rotation} → ${PLAN.rotation[PALETTES[0].rotation].texte}, le seul emplacement libre et en service.`,
      note: 'Une palette posée ailleurs est fausse ; l’élève peut la reprendre tant qu’il n’a pas fini.' },
    { etape: 4, etapeTitre: `③ La saisie dans le logiciel (${somme(POIDS.saisie)} points)`, genre: 'tableau', texte: `Le bon de réception ${REC}`,
      entetes: ['Case', 'Attendu'],
      reponses: [
        ['Numéro de lot', SAISIE.lot],
        ['Quantité annoncée', `${SAISIE.annonce} paires (${PALETTE.bl} cartons × ${PAIRES_PAR_CARTON})`],
        ['Quantité comptée', `${SAISIE.compte} paires (${CARTONS_RECUS} cartons × ${PAIRES_PAR_CARTON})`],
        ['État', 'Colis endommagé'],
        ['Décision', 'Accepté sous réserve'],
      ],
      note: `Lot ${POIDS.saisie.lot}, quantités ${POIDS.saisie.quantites}, état et décision ${POIDS.saisie.decision}. À la validation, ${SAISIE.compte} paires entrent en stock avec le lot.` },
    { etape: 5, etapeTitre: 'Les questions de Sarah (non notées)', genre: 'tableau', texte: '« Avant de commencer », puis au fil de la réception',
      entetes: ['Question', 'Réponse attendue'],
      reponses: [
        ['Que vend Spartoo ?', 'Des chaussures, sur Internet'],
        ['88 000 m², c’est à peu près…', 'Une douzaine de terrains de football'],
        ['Les chaussures sont rangées…', 'Par catégorie (sport, ville…)'],
        ['La puce RFID sert à…', 'Savoir où est chaque paire'],
        ['Accepter avec réserves, c’est…', 'Garder la marchandise et écrire le problème sur le bon avant de signer'],
        ['Le chauffeur est pressé : tu signes ?', 'Non : on contrôle d’abord, on signe après'],
        ['12 cartons de 6 paires : combien de paires annoncées ?', '72 paires (corrigée au bilan)'],
        ['Pourquoi les réserves avant que le chauffeur reparte ?', 'La signature du chauffeur est la preuve ; ensuite, 3 jours pour protester (C. com. L133-3)'],
        ['Pourquoi près des quais ce qui part souvent ?', 'Moins de chemin pour préparer les commandes (corrigée au bilan)'],
        ['Pourquoi 66 et pas 72 ?', 'Le stock doit dire ce qui est vraiment arrivé'],
        ['Après le Bac Pro Logistique ?', 'Travailler, ou continuer ses études (BTS)'],
      ],
      note: 'Aucune ne compte dans la note sur 20. « Avant de commencer » est corrigé à l’écran ; au fil, Sarah donne son avis.' },
  ],
};
