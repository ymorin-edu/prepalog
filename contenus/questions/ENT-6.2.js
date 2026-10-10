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
//
// L'écran « Avant de commencer » (brief `docs/briefs/MOTEUR-avant-de-commencer.md`, 10/10/2026) : cinq questions d'ouverture,
// NON notées (l'élève ne le sait pas), avec les documents de la séance et deux photos à gauche. Elles préparent la lecture sans
// résoudre le piège en chaîne (ni le minimum, ni le jour, ni le remplacement). Deux sont d'éco-droit : le contrat de vente
// (Code civil, article 1113, onglet « Le droit ») et la consigne (arrêté du 6 février 2026, montants des conditions de vente).

import { apresFiche, apresGeste } from '../../core/declencheurs.js';
import { EQUIPE } from '../france-boissons.js';

export const QUESTIONS = {
  id: 'france-boissons-commande',
  part: 3,
  personnes: { ines: EQUIPE.ines, karim: EQUIPE.karim, lucas: EQUIPE.lucas },
  ouverture: { id: 'avant-de-commencer', de: 'ines', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Malo, le gérant de La Cabane à Malo, nous a écrit pour la Fête de la musique. Avant de prendre sa commande, lis ses documents à gauche et réponds à mes questions.',
    documents: ['commande-malo', 'fiche-client', 'stock', 'conditions',
      { id: 'photos', court: 'Photos', titre: 'Ce que Malo appelle « ses vides »', type: 'images', images: [
        { src: './contenus/images/france-boissons/futs-mur.jpg', alt: 'Des fûts de bière en métal alignés contre un mur',
          legende: 'Des fûts : le métal contient la bière, et le fût est consigné.', credit: 'Photo : Marco Zuppone, Unsplash' },
        { src: './contenus/images/france-boissons/casier-vides.jpg', alt: 'Un casier en plastique rempli de bouteilles',
          legende: 'Un casier : il range les bouteilles, et il est consigné lui aussi.', credit: 'Photo : Jennifer Chen, Unsplash' }] },
      'droit'],
    questions: ['qui-est-malo', 'les-vides', 'ou-regarder', 'vente-conclue', 'consigne-rendue'] },
  etapes: [
    { id: 'avant-reponse', de: 'ines', apres: apresFiche('bon-de-commande'), ferme: 'repondre:reponse-malo',
      titre: 'Point d’étape avant de répondre à Malo', continuer: 'répondre à Malo',
      situation: 'J’ai bien reçu ton bon de commande. Avant que tu répondes à Malo, une question.',
      questions: ['qui-utilise-le-bon'] },
  ],
  liste: [
    { id: 'qui-est-malo', type: 'ouverture', de: 'ines', doc: 'fiche-client',
      enonce: 'Qui est Malo pour France Boissons ?',
      aide: 'Regarde la fiche client. Un [[CHR|client CHR]], c’est un café, un hôtel ou un restaurant.',
      choix: [{ v: 'client', lib: 'Un client : il tient un bar et nous achète des boissons' },
        { v: 'fournisseur', lib: 'Un fournisseur : il nous vend de la bière' },
        { v: 'collegue', lib: 'Un collègue de la plateforme de Buchelay' }],
      juste: 'client',
      retour: 'Malo est un client CHR : il tient un bar de plage. C’est pour ça qu’on lui répondra au « vous », même s’il nous tutoie.' },
    { id: 'les-vides', type: 'ouverture', de: 'ines', doc: 'photos',
      enonce: 'Malo écrit « reprends mes vides ». De quoi parle-t-il ?',
      aide: 'Regarde les photos, puis clique sur les mots : [[vides]], [[consigne]].',
      choix: [{ v: 'consignes', lib: 'De ses fûts et casiers consignés, qu’il rend vides' },
        { v: 'jeter', lib: 'De bouteilles vides à jeter' },
        { v: 'annuler', lib: 'D’une ancienne commande à annuler' }],
      juste: 'consignes',
      retour: 'Les fûts et les casiers sont consignés : Malo les a payés en plus de la boisson, et le chauffeur les reprend vides à la livraison.' },
    { id: 'ou-regarder', type: 'ouverture', de: 'ines', doc: 'stock',
      enonce: 'Pour savoir ce qu’on peut livrer à Malo, où regardes-tu ?',
      aide: 'Pense à ce que demande Malo… et à ce que la plateforme a vraiment, et à ses règles.',
      choix: [{ v: 'stock-cond', lib: 'Dans le stock et dans les conditions de vente' },
        { v: 'message', lib: 'Dans le message de Malo : il dit ce qu’il veut' },
        { v: 'fiche', lib: 'Dans la fiche client seule' }],
      juste: 'stock-cond',
      retour: 'Le message dit ce que Malo veut. Le stock et les conditions de vente disent ce qu’on peut lui livrer. C’est en comparant les deux qu’on remplit le bon de commande.' },
    { id: 'vente-conclue', type: 'ouverture', de: 'ines', doc: 'droit',
      enonce: 'Malo a envoyé sa commande. D’après l’article 1113 du Code civil, la vente est-elle déjà conclue ?',
      aide: 'Lis l’article dans l’onglet « Le droit ». La commande de Malo, c’est une offre. Qui doit l’accepter ?',
      choix: [{ v: 'acceptation', lib: 'Non : il faut d’abord que France Boissons accepte sa commande' },
        { v: 'envoi', lib: 'Oui : elle est conclue dès que Malo envoie sa commande' },
        { v: 'paiement', lib: 'Non : elle sera conclue seulement quand Malo aura payé' }],
      juste: 'acceptation',
      retour: 'La commande de Malo est une offre. La vente est conclue quand France Boissons l’accepte, par exemple par ta réponse. Le paiement vient après : il n’est pas nécessaire pour que le contrat existe.' },
    { id: 'consigne-rendue', type: 'ouverture', de: 'ines', doc: 'conditions',
      enonce: 'Un bar rend au chauffeur 2 fûts vides et 3 casiers vides. Combien de consigne France Boissons lui rend-il ?',
      aide: 'Regarde les montants de consigne dans « Conditions de vente » : un montant par fût, un autre par casier.',
      choix: [{ v: '92', lib: '92 € (2 × 40 € + 3 × 4 €)' },
        { v: '80', lib: '80 € : on ne rend que la consigne des fûts' },
        { v: '0', lib: '0 € : la consigne payée n’est jamais rendue' }],
      juste: '92',
      retour: 'La consigne est rendue quand l’emballage revient vide : 2 × 40 € pour les fûts et 3 × 4 € pour les casiers, soit 92 €. Ces montants sont fixés par un arrêté, le même pour tous les distributeurs de boissons.' },
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
