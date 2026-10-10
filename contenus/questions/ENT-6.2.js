// Les questions d'ENT-6.2 — France Boissons, la commande de La Cabane à Malo (brief `docs/briefs/ENT-6.2-france-boissons-commande.md`,
// §4 bis, choix de Tristan du 10/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES.
//
// - `pourquoi-ce-remplacement` : Karim, au choix dans la liste « Remplacement » du bon, réflexion, NON notée.
// - `jour-engage` : Inès, au choix de la phrase « livraison » dans la réponse à Malo, NOTÉE (1,5), correction au bilan (on ne
//   dit pas quel jour est juste). Éco-droit : le texte (Code civil, art. 1113) est dans le document « Le droit ».
// - `qui-utilise-le-bon` : point d'étape d'Inès après l'envoi du bon, NOTÉE (1,5) ; « Répondre » à Malo reste fermé jusqu'à la réponse.
// - `vides-faux` : Lucas, au choix de la phrase « vides », réflexion, NON notée.
// Les deux notées pèsent chacune 1 dans la `part` de 3 : 1,5 point sur 20 chacune.

import { apresFiche, apresGeste } from '../../core/declencheurs.js';
import { EQUIPE } from '../france-boissons.js';

export const QUESTIONS = {
  id: 'france-boissons-commande',
  part: 3,
  personnes: { ines: EQUIPE.ines, karim: EQUIPE.karim, lucas: EQUIPE.lucas },
  etapes: [
    { id: 'avant-reponse', de: 'ines', apres: apresFiche('bon-de-commande'), ferme: 'repondre:reponse-malo',
      titre: 'Point d’étape avant de répondre à Malo', continuer: 'répondre à Malo',
      situation: 'J’ai bien reçu ton bon de commande. Avant que tu répondes à Malo, une question.',
      questions: ['qui-utilise-le-bon'] },
  ],
  liste: [
    { id: 'pourquoi-ce-remplacement', type: 'fil', de: 'karim', quand: apresGeste('fiche:bon-de-commande:remplacement'), reflexion: true,
      enonce: 'Je vois ton choix dans la liste « Remplacement ». Pourquoi ce choix ?',
      choix: [{ v: 'blonde', lib: 'C’est une blonde de 20 L, comme Malo le demande' },
        { v: 'stock', lib: 'Il y en a assez en stock' },
        { v: 'minimum', lib: 'Pour atteindre le minimum de commande' },
        { v: 'hasard', lib: 'Au hasard' }],
      retour: 'Ce qui compte : ce que Malo a demandé, ce qu’on a en stock, et le minimum de 10 fûts.' },
    { id: 'jour-engage', type: 'fil', de: 'ines', quand: apresGeste('messagerie:phrase:livraison'), apres: 'bilan',
      enonce: 'Le jour que tu écris à Malo engage France Boissons. Pourquoi ? (Le texte du Code civil est dans « Le droit », à gauche.)',
      choix: [{ v: 'acceptation', lib: 'Ta réponse accepte sa commande : la vente est conclue avec ce jour-là' },
        { v: 'malo', lib: 'Parce que Malo l’a demandé' },
        { v: 'stock', lib: 'Parce que c’est écrit dans le stock' },
        { v: 'indication', lib: 'Ce n’est qu’une indication, on peut changer' }],
      juste: 'acceptation', groupe: 'Question d’Inès : le jour qui engage',
      retour: 'Malo propose, ta réponse accepte : le contrat est formé avec ce que tu as écrit. Un jour promis et non tenu, c’est un client qui n’a pas ses fûts pour sa fête.' },
    { id: 'qui-utilise-le-bon', type: 'transition', de: 'ines',
      enonce: 'Qui va travailler à partir de ton bon de commande d’ici vendredi ?',
      choix: [{ v: 'prepa-chauffeur', lib: 'Le préparateur jeudi, puis le chauffeur vendredi' },
        { v: 'personne', lib: 'Personne, il est rangé' },
        { v: 'malo', lib: 'Malo, qui le signe' },
        { v: 'brasserie', lib: 'La brasserie' }],
      juste: 'prepa-chauffeur', groupe: 'Point d’étape : qui utilise ton bon',
      retour: 'Le préparateur prépare la commande avec ton bon, puis le chauffeur la livre. Une erreur sur le bon, c’est une erreur dans le camion.' },
    { id: 'vides-faux', type: 'fil', de: 'lucas', quand: apresGeste('messagerie:phrase:vides'), reflexion: true,
      enonce: 'Vendredi soir, je rapporte les vides. Si le chiffre de ton bon est faux, qui le voit en premier ?',
      choix: [{ v: 'chauffeur', lib: 'Toi, au déchargement' },
        { v: 'magasinier', lib: 'Le magasinier qui compte les vides' },
        { v: 'malo', lib: 'Malo' },
        { v: 'personne', lib: 'Personne' }],
      retour: 'On le voit au retour, quand le compte ne tombe pas juste : c’est pour ça qu’on recopie les vides avec soin.' },
  ],
};
