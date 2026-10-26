// Les questions d'ENT-13.1 — Stellantis, « une voiture par minute » (brief `docs/briefs/ENT-13.1-stellantis-une-voiture-par-minute.md` §4 bis et §4 ter ; choix de Tristan du 26/10/2026 :
// propositions du brief prises telles quelles). Modifier ce fichier suffit (voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`). Karim est CONSTRUIT.
//
// QUESTIONS NOTÉES (`part: 3`, une seule ligne au bandeau de fin, « Les questions de Karim », 0,75 point chacune) :
//  `rougegoutte` (au département de Rougegoutte posé, corrigée tout de suite : le fournisseur voisin livre le jour même), `transstockeur` (à l'envoi du voyage, corrigée tout de suite : 6 minutes,
//  6 voitures), `un-km` (à l'envoi du voyage, corrigée tout de suite : 1 km devenu 150 à 200 m), ★ `externalisation` (éco-droit appliqué au cas : à l'envoi des chiffres, corrigée AU BILAN).
// RÉFLEXION non notée : `aval-2022` (les voitures garées sur l'ancien aérodrome de Lure-Malbouhans en 2022), posée à TOUS à l'envoi de la dernière fiche, texte autonome : le moteur pose en fin de séance
// toute question au fil restée en attente, donc une réflexion « confirmé seul » serait posée aussi au niveau standard, qui n'a pas vu ce lieu sur la carte (écart au brief, dit à Tristan).
// « Avant de commencer » : NON noté, 3 questions tirées (une de flux, une de logistique, une d'éco-droit) parmi 6, corrigées à l'écran. Aucun texte de loi n'est cité.

import { apresGeste, apresFiche } from '../../core/declencheurs.js';
import { ID, FICHES } from '../stellantis-ent131-donnees.js';

const GROUPE = 'Les questions de Karim';
const KARIM = { nom: 'Karim', role: 'chef d’équipe logistique', appel: 'Karim' };
const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'karim', doc, rubrique, enonce, choix, juste, retour, ...o });

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: { karim: KARIM },
  ouverture: { id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour et bienvenue à Sochaux ! Avant de commencer, lis la fiche « Une usine dans sa chaîne » et réponds à mes questions.',
    documents: ['chaine-131', 'sochaux-131'],
    tirage: { flux: 1, logistique: 1, eco: 1 },
    questions: ['amont', 'tendu', 'stock', 'quai', 'externe', 'fournisseur'] },
  liste: [
    // ── flux (2 : l'élève en reçoit 1)
    q('amont', 'flux', 'chaine-131', 'L’amont d’une usine, ce sont…',
      [{ v: 'fournisseurs', lib: 'ses fournisseurs, qui lui envoient les pièces' }, { v: 'clients', lib: 'ses clients, qui achètent les voitures' }, { v: 'salaries', lib: 'ses salariés' }], 'fournisseurs',
      'L’amont, c’est ce qui arrive avant l’usine : les fournisseurs. L’aval, c’est ce qui part après : ici, les voitures terminées.', { cle: true }),
    q('tendu', 'flux', 'chaine-131', 'Travailler à flux tendu, c’est…',
      [{ v: 'juste', lib: 'recevoir juste ce qu’il faut, juste au moment où il le faut' }, { v: 'gros', lib: 'garder un très gros stock' }, { v: 'vite', lib: 'travailler le plus vite possible' }], 'juste',
      'Le flux tendu (juste-à-temps) : presque pas de stock, les pièces arrivent au moment où la ligne en a besoin.', { cle: true }),
    // ── logistique (2)
    q('stock', 'logistique', 'sochaux-131', 'À Sochaux, le stock sur place couvre…',
      [{ v: 'heures', lib: 'quelques heures à une journée et demie de production' }, { v: 'mois', lib: 'plusieurs mois' }, { v: 'semaines', lib: 'plusieurs semaines' }], 'heures',
      'Le stock est petit : quelques heures à une journée et demie. C’est pourquoi les camions arrivent toute la journée.', { cle: true }),
    q('quai', 'logistique', 'chaine-131', 'Dans une usine, le client de la logistique, c’est…',
      [{ v: 'ligne', lib: 'la ligne de montage' }, { v: 'conso', lib: 'le consommateur qui achète la voiture' }, { v: 'concession', lib: 'la concession' }], 'ligne',
      'La logistique d’usine sert d’abord la ligne de montage : la bonne pièce, au bon moment, au bord de la ligne.', { cle: true }),
    // ── éco-droit (2)
    q('externe', 'eco', 'chaine-131', 'Externaliser, c’est…',
      [{ v: 'confier', lib: 'confier une partie du travail à une autre entreprise spécialisée' }, { v: 'fermer', lib: 'fermer l’usine' }, { v: 'vendre', lib: 'vendre l’usine' }], 'confier',
      'Externaliser, c’est faire faire par une autre entreprise : l’usine achète ses pièces au lieu de tout fabriquer elle-même.', { cle: true }),
    q('fournisseur', 'eco', 'sochaux-131', 'Un fournisseur de l’usine, c’est…',
      [{ v: 'entreprise', lib: 'une autre entreprise, avec laquelle l’usine a un contrat de vente' }, { v: 'service', lib: 'un service de l’usine' }, { v: 'client', lib: 'un client de l’usine' }], 'entreprise',
      'Un fournisseur est une entreprise indépendante : elle vend ses pièces à l’usine, par contrat.', { cle: true }),

    // ── au fil du travail
    { id: 'rougegoutte', type: 'fil', de: 'karim', quand: apresGeste('localiser:smrc:departement'), poids: 1, groupe: GROUPE,
      enonce: 'L’équipementier de Rougegoutte est à environ 25 km de l’usine. Une pièce commandée ce matin, quand peut-elle arriver ?',
      choix: [{ v: 'jour', lib: 'Dans la journée : c’est assez près pour livrer le jour même' }, { v: 'semaines', lib: 'Dans quinze semaines' }, { v: 'jamais', lib: 'Jamais : c’est trop loin' }],
      juste: 'jour', retour: 'À 25 km, un camion arrive en moins d’une heure : certaines pièces sont commandées le matin pour le jour même. Les pièces venues de Shanghai, elles, sont commandées quinze semaines à l’avance.' },
    { id: 'transstockeur', type: 'fil', de: 'karim', quand: apresFiche(FICHES.voyage), poids: 1, groupe: GROUPE,
      enonce: 'La ligne monte une voiture par minute. Le transstockeur met environ 6 minutes à sortir une palette. Pendant ces 6 minutes, combien de voitures sont montées ?',
      choix: [{ v: '6', lib: '6 voitures' }, { v: '1', lib: '1 voiture' }, { v: '60', lib: '60 voitures' }],
      juste: '6', retour: '6 minutes × 1 voiture par minute = 6 voitures. La palette doit donc être demandée avant que la ligne en manque.' },
    { id: 'un-km', type: 'fil', de: 'karim', quand: apresFiche(FICHES.voyage), poids: 1, groupe: GROUPE,
      enonce: 'Avant 2022, une pièce parcourait environ 1 km du camion à la ligne. Aujourd’hui, de 150 à 200 m. Le trajet est devenu…',
      choix: [{ v: 'cinq', lib: 'environ 5 à 7 fois plus court' }, { v: 'deux', lib: 'environ 2 fois plus court' }, { v: 'pareil', lib: 'à peu près pareil' }],
      juste: 'cinq', retour: '1 000 m ÷ 200 m = 5 et 1 000 m ÷ 150 m ≈ 7 : le chemin est cinq à sept fois plus court, ce qui fait gagner du temps à chaque pièce.' },
    { id: 'externalisation', type: 'fil', de: 'karim', quand: apresFiche(FICHES.chiffres), apres: 'bilan', poids: 1, groupe: GROUPE,
      enonce: 'Stellantis achète des pièces à environ 500 fournisseurs par jour au lieu de les fabriquer toutes. Quel est l’intérêt pour l’usine ?',
      choix: [{ v: 'specialises', lib: 'Chaque fournisseur est spécialisé dans sa pièce, et l’usine se concentre sur le montage' }, { v: 'gratuit', lib: 'Les pièces sont gratuites' }, { v: 'rien', lib: 'Aucun : tout fabriquer serait mieux' }],
      juste: 'specialises', retour: 'En externalisant, l’usine confie chaque pièce à une entreprise qui la fabrique bien et en grande série, et garde pour elle le montage. En contrepartie, elle dépend de ses fournisseurs : un manque arrête la ligne.' },
    { id: 'aval-2022', type: 'fil', de: 'karim', quand: apresFiche(FICHES.usine), apres: 'bilan', reflexion: true,
      enonce: 'En 2022, des voitures finies ont été garées sur l’ancien aérodrome de Lure-Malbouhans. Que montre cet exemple ?',
      choix: [{ v: 'place', lib: 'Quand les voitures finies ne partent pas assez vite, l’usine manque de place pour les garder' }, { v: 'vente', lib: 'Que les voitures ne se vendaient pas' }, { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'La première réponse se tient : l’usine produit une voiture par minute, il faut donc qu’elles partent aussi vite par la route ou le rail, sinon il faut un parking. Ce n’est pas forcément un problème de ventes.' },
  ],
};
