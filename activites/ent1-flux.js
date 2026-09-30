// Activité témoin nº 1 — QCM autocorrigé, portée élève.
// Montre le circuit complet : rendu, correction, enregistrement du score, suivi de classe.

import { creerQCM, sceller } from '../core/types/qcm.js';

export const meta = {
  id: 'ent1',
  code: 'ENT-1',
  titre: 'Les flux logistiques',
  desc: 'Vérifier les notions de base : flux poussé, flux tiré, stock de sécurité.',
  rubrique: 'quiz',
  bareme: 6,
  portee: 'eleve',
  pret: true,
};

// Écrit lisiblement, puis scellé : les bonnes réponses ne partent pas en clair.
const QUESTIONS = sceller([
  {
    id: 'q1',
    enonce: "Dans un flux tiré, la production est déclenchée par :",
    choix: ["Une prévision de vente", "Une commande réelle du client", "Le niveau du stock de sécurité", "Le planning annuel"],
    justes: ["Une commande réelle du client"],
    explication: "Le flux tiré part de la demande réelle ; le flux poussé part de la prévision.",
  },
  {
    id: 'q2',
    enonce: "Le stock de sécurité sert à :",
    choix: ["Couvrir les aléas de la demande et des délais", "Remplir l'entrepôt", "Réduire le coût de passation", "Accélérer la préparation"],
    justes: ["Couvrir les aléas de la demande et des délais"],
    explication: "Il absorbe l'imprévu : retard fournisseur ou pic de commandes.",
  },
  {
    id: 'q3',
    enonce: "Quelles opérations relèvent de la réception ? (plusieurs réponses)",
    multiple: true,
    choix: ["Le contrôle quantitatif", "Le contrôle qualitatif", "Le picking", "Le déchargement"],
    justes: ["Le contrôle quantitatif", "Le contrôle qualitatif", "Le déchargement"],
    explication: "Le picking appartient à la préparation de commandes, pas à la réception.",
  },
  {
    id: 'q4',
    enonce: "Le PCB désigne :",
    choix: ["Le poids du colis brut", "La quantité de produits par colis", "Le prix du colis de base", "Le plan de chargement du back-office"],
    justes: ["La quantité de produits par colis"],
    explication: "PCB : par combien de produits le colis est constitué.",
  },
  {
    id: 'q5',
    enonce: "La logistique inverse concerne :",
    choix: ["Les retours et la fin de vie des produits", "Les livraisons express", "Le transport maritime", "Le stockage en hauteur"],
    justes: ["Les retours et la fin de vie des produits"],
    explication: "Retours clients, recyclage, reconditionnement.",
  },
  {
    id: 'q6',
    enonce: "Dans un entrepôt, une adresse d'emplacement code généralement :",
    choix: ["Allée, travée, niveau", "Client, produit, quantité", "Fournisseur, date, prix", "Palette, colis, unité"],
    justes: ["Allée, travée, niveau"],
    explication: "L'adressage permet de localiser physiquement un produit.",
  },
]);

const moteur = creerQCM({ questions: QUESTIONS, melanger: true });

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
