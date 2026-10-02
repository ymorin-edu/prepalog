// DEC-1 — La chaîne logistique.
// Contenu repris du module 2DE-1 de la Suite Logistique, porté sans modification.
// Une chaîne compte pour réussie quand ses 8 étapes sont bien placées.

import { creerOrdre } from '../core/types/ordre.js';

export const meta = {
  id: 'chaine-logistique',
  code: 'DEC-1',
  titre: 'La chaîne logistique',
  desc: "Remettre dans l'ordre les étapes d'une chaîne, du fournisseur au client. 4 scénarios.",
  rubrique: 'logistique',
  // Pas de champ `niveaux` : par défaut, tout est ouvert à tous les niveaux.
  // C'est « Conduite de séance » qui ferme ce qu'on ne veut pas ouvrir ce jour-là.
  // Compétences et temps pédagogique : voir core/competences.js (validé par Tristan, 02/10/2026).
  competences: ['C1.1'],
  temps: 'guidage',
  bareme: 4,
  portee: 'eleve',
  pret: true,
  tables: { resultats: {} },
};

const CHAINES = [
  {
    id: 'baskets',
    titre: 'Une paire de baskets',
    sousTitre: "De l'usine au client, le parcours classique d'un produit.",
    etapes: [
      { icone: '🏭', texte: 'Le fournisseur fabrique les baskets', expl: "Tout commence chez le fournisseur : c'est lui qui produit la marchandise." },
      { icone: '📝', texte: "L'entreprise passe commande au fournisseur", expl: "Le service achats commande les quantités nécessaires : c'est la commande fournisseur." },
      { icone: '🚛', texte: "Le camion apporte la marchandise à l'entrepôt", expl: "C'est le transport amont : il relie le fournisseur à l'entrepôt." },
      { icone: '📋', texte: 'On contrôle la livraison à la réception', expl: 'On compare la marchandise reçue au bon de livraison : quantités, références, état des colis.' },
      { icone: '📦', texte: 'On range la marchandise à son emplacement', expl: "C'est la mise en stock : chaque produit a une adresse précise dans l'entrepôt." },
      { icone: '🛒', texte: 'Le préparateur prélève les articles commandés', expl: "C'est la préparation de commande, ou picking : on va chercher les articles dans les rayonnages." },
      { icone: '🚚', texte: "On charge le camion à l'expédition", expl: "L'expédition prépare et charge les colis qui partent chez le client." },
      { icone: '🏠', texte: 'Le client reçoit sa commande', expl: "C'est le transport aval, la dernière étape : la livraison au client final." },
    ],
  },
  {
    id: 'ecommerce',
    titre: 'Un colis commandé sur internet',
    sousTitre: 'Ce qui se passe entre le clic et la sonnette.',
    etapes: [
      { icone: '💻', texte: 'Le client commande sur le site internet', expl: "La commande client arrive directement dans le système informatique de l'entrepôt." },
      { icone: '🖨️', texte: "La commande s'affiche chez le préparateur", expl: 'Le préparateur reçoit sa liste à prélever sur un terminal ou sur papier.' },
      { icone: '🛒', texte: "Le préparateur va chercher l'article dans le rayonnage", expl: 'Le prélèvement : on suit un chemin optimisé pour perdre le moins de temps possible.' },
      { icone: '📦', texte: "L'article est emballé dans un carton", expl: 'L\'emballage protège le produit pendant le transport. On parle de colisage.' },
      { icone: '🏷️', texte: "L'étiquette de transport est collée sur le colis", expl: "L'étiquette porte l'adresse et un code-barres qui suivra le colis partout." },
      { icone: '🔀', texte: 'Le colis est trié par destination', expl: 'Sur la plateforme de tri, les colis sont regroupés par secteur de livraison.' },
      { icone: '🚐', texte: 'Le colis part en tournée de livraison', expl: 'Le livreur charge sa tournée : plusieurs dizaines de colis dans un ordre précis.' },
      { icone: '✍️', texte: 'Le client signe la preuve de livraison', expl: "La signature prouve que le colis a bien été remis : c'est la preuve de livraison." },
    ],
  },
  {
    id: 'yaourts',
    titre: "Des yaourts jusqu'au supermarché",
    sousTitre: 'Une chaîne du froid : le produit ne doit jamais se réchauffer.',
    etapes: [
      { icone: '🥛', texte: 'La laiterie fabrique les yaourts', expl: 'La production est la première étape. Les yaourts sortent déjà réfrigérés.' },
      { icone: '🧊', texte: 'Les palettes sont filmées et étiquetées', expl: "Le film maintient les colis ; l'étiquette indique la référence et la DLC." },
      { icone: '❄️', texte: 'Chargement dans un camion frigorifique', expl: "Le camion frigorifique maintient la température : c'est le début de la chaîne du froid." },
      { icone: '🌡️', texte: 'À la réception, on contrôle la température', expl: 'Si la température est trop haute, la marchandise est refusée. Contrôle obligatoire.' },
      { icone: '🏬', texte: 'Stockage en chambre froide', expl: "Les produits frais ne vont jamais dans l'entrepôt classique, mais en chambre froide." },
      { icone: '📅', texte: 'Préparation de la commande en respectant les dates', expl: "On sort d'abord les produits dont la date est la plus proche : c'est le FEFO." },
      { icone: '🚚', texte: 'Expédition vers le supermarché', expl: 'Le camion frigorifique repart, toujours à température contrôlée.' },
      { icone: '🧺', texte: 'Mise en rayon dans le magasin', expl: 'Dernière étape : le produit arrive dans le rayon frais, prêt pour le client.' },
    ],
  },
  {
    id: 'retour',
    titre: 'Un retour client',
    sousTitre: 'La logistique inverse : le produit remonte la chaîne.',
    etapes: [
      { icone: '😕', texte: 'Le client demande à retourner son article', expl: 'Le retour démarre toujours par une demande du client : mauvaise taille, article défectueux…' },
      { icone: '🏷️', texte: 'Une étiquette de retour lui est envoyée', expl: "L'entreprise fournit l'étiquette prépayée : sans elle, le colis ne peut pas être suivi." },
      { icone: '🏪', texte: 'Le client dépose le colis en point relais', expl: 'Le point relais regroupe les retours avant leur enlèvement.' },
      { icone: '🚛', texte: "Le colis revient à l'entrepôt", expl: "Le transport retour ramène la marchandise là où elle est repartie." },
      { icone: '🔍', texte: "On contrôle l'état du produit", expl: 'Le produit est-il neuf, abîmé, incomplet ? Ce contrôle décide de la suite.' },
      { icone: '⚖️', texte: 'On décide : remise en stock ou rebut', expl: 'Un produit intact retourne en stock ; un produit abîmé part en rebut ou en recyclage.' },
      { icone: '💶', texte: 'Le client est remboursé', expl: "Le remboursement n'intervient qu'après le contrôle du produit retourné." },
      { icone: '🖥️', texte: 'Le stock est mis à jour dans le système', expl: "Sans mise à jour informatique, le stock réel et le stock théorique ne correspondent plus." },
    ],
  },
];

const moteur = creerOrdre({ scenarios: CHAINES });

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
