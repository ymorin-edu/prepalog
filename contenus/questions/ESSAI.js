// Les questions de la SÉANCE D'ESSAI des questions au fil (`contenus/questions-essai.js`, page `outils/essai-questions.html`).
// Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`.
// Personnes et situation CONSTRUITES pour l'essai (une ENT-6.2 simplifiée : le bon de commande de Malo).

import { apresFiche, apresMail } from '../../core/declencheurs.js';

const MALO = 'malo@cafe-essai.example';
// Le choix d'un remplacement sur le bon (un geste : choisir, quel que soit le choix). Le lot 3 le remplacera par un
// signal de la fiche (`apresGeste`).
const remplacementChoisi = (db) => !!(db.fiches && db.fiches.bon && db.fiches.bon.valeurs && db.fiches.bon.valeurs.remplacement);

export const QUESTIONS = {
  id: 'essai-questions',
  part: 4,
  personnes: {
    Karim: { nom: 'Karim Benali', role: 'chef d’équipe préparation' },
    Ines: { nom: 'Inès Moreau', appel: 'Inès', role: 'assistante commerciale' },
  },
  etapes: [
    { id: 'avant-malo', de: 'Ines', apres: apresFiche('bon'), ferme: 'repondre:malo',
      titre: 'Point d’étape avant de répondre à Malo', continuer: 'répondre à Malo',
      situation: 'J’ai bien ton bon, merci. Avant que tu répondes à Malo, deux questions.',
      questions: ['qui-utilise-le-bon', 'ce-que-malo-attend'] },
  ],
  liste: [
    { id: 'ou-verifier', type: 'fil', de: 'Karim', quand: remplacementChoisi, apres: 'bilan',
      enonce: 'Je te vois choisir un remplacement pour Malo. Où vérifies-tu ce qu’on peut vraiment lui livrer ?',
      choix: [{ v: 'stock', lib: 'Dans le stock de l’entrepôt' }, { v: 'mail', lib: 'Dans le mail de Malo' },
        { v: 'fiche', lib: 'Sur la fiche du client' }, { v: 'malo', lib: 'Je demande à Malo ce qu’il préfère' }],
      juste: 'stock', groupe: 'Question de Karim : où vérifier ce qu’on peut livrer',
      retour: 'Le client dit ce qu’il veut ; le stock dit ce qu’on a. Un remplacement qu’on n’a pas en rayon, c’est un deuxième client déçu.' },
    { id: 'qui-utilise-le-bon', type: 'transition', de: 'Ines',
      enonce: 'Ton bon part à l’entrepôt. Qui s’en sert en premier ?',
      choix: [{ v: 'prepa', lib: 'Le préparateur de commandes' }, { v: 'compta', lib: 'La comptabilité' },
        { v: 'chauffeur', lib: 'Le chauffeur' }],
      juste: 'prepa', groupe: 'Point d’étape : qui utilise ton bon',
      retour: 'C’est le préparateur qui va chercher les cartons avec ton bon. Une erreur sur le bon, c’est une erreur dans le camion.' },
    { id: 'ce-que-malo-attend', type: 'transition', de: 'Ines',
      enonce: 'Malo va lire ta réponse. Que doit-il y trouver d’abord ?',
      choix: [{ v: 'remplacement', lib: 'Le produit de remplacement et la quantité' }, { v: 'excuses', lib: 'Des excuses pour la rupture' },
        { v: 'tarif', lib: 'Le tarif complet de l’entrepôt' }],
      juste: 'remplacement', groupe: 'Point d’étape : ce que Malo attend',
      retour: 'Malo doit pouvoir dire oui ou non tout de suite : ce qu’il recevra, et combien. Le reste vient après.' },
    { id: 'vides', type: 'fil', de: 'Karim', quand: apresMail({ a: MALO }), reflexion: true,
      enonce: 'Malo nous rend aussi ses bouteilles vides consignées. Pour toi, qu’est-ce qui compte le plus dans ce retour ?',
      choix: [{ v: 'compter', lib: 'Les compter juste, pour le rembourser' }, { v: 'trier', lib: 'Les trier, pour le recyclage' },
        { v: 'vite', lib: 'Les reprendre vite, pour libérer son café' }],
      retour: 'Les trois comptent. Au quai, on commence par compter : c’est ce qui fait le remboursement du client.' },
  ],
};
