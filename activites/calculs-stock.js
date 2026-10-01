// QUI-7 — Calculs de stock.
// Activité témoin du type « saisie numérique ». Les tolérances évitent qu'un arrondi
// intermédiaire soit compté faux : c'est le raisonnement qu'on évalue, pas la calculette.

import { creerNumerique } from '../core/types/numerique.js';

export const meta = {
  id: 'calculs-stock',
  code: 'QUI-7',
  titre: 'Calculs de stock',
  desc: 'Stock moyen, rotation, couverture, valorisation — huit calculs de base.',
  rubrique: 'quiz',
  // Pas de champ `niveaux` : par défaut, tout est ouvert à tous les niveaux.
  // C'est « Conduite de séance » qui ferme ce qu'on ne veut pas ouvrir ce jour-là.
  competences: [],
  bareme: 8,
  portee: 'eleve',
  pret: true,
};

const moteur = creerNumerique({
  consigne: 'Répondez par un nombre. La virgule et le point décimal sont acceptés.',
  questions: [
    {
      id: 'c1',
      enonce: "Le stock initial est de 320 unités, le stock final de 180. Quel est le stock moyen ?",
      reponse: 250, unite: 'unités',
      expl: 'Stock moyen = (stock initial + stock final) ÷ 2.',
    },
    {
      id: 'c2',
      enonce: "Les sorties de l'année s'élèvent à 4 800 unités pour un stock moyen de 400. Quel est le coefficient de rotation ?",
      reponse: 12, tolerance: 0.1,
      expl: 'Rotation = sorties annuelles ÷ stock moyen.',
    },
    {
      id: 'c3',
      enonce: 'Avec un coefficient de rotation de 12, quelle est la durée moyenne de stockage, en jours ?',
      reponse: 30, tolerance: 0.5, unite: 'jours',
      expl: 'Durée de stockage = 360 ÷ coefficient de rotation.',
    },
    {
      id: 'c4',
      enonce: "Un carton contient 24 unités. Combien de cartons complets faut-il pour expédier 500 unités ?",
      reponse: 21,
      aide: 'On ne peut pas expédier un carton incomplet : arrondissez à l\'entier supérieur.',
      expl: '500 ÷ 24 = 20,83 → 21 cartons.',
    },
    {
      id: 'c5',
      enonce: "Une palette supporte 8 couches de 6 cartons. Combien de cartons par palette ?",
      reponse: 48,
      expl: 'Nombre de couches × cartons par couche.',
    },
    {
      id: 'c6',
      enonce: 'Le stock physique compte 187 unités, le stock informatique en indique 195. Quel est l\'écart, en valeur absolue ?',
      reponse: 8, unite: 'unités',
      expl: "L'écart d'inventaire se mesure toujours en valeur absolue avant d'être expliqué.",
    },
    {
      id: 'c7',
      enonce: "340 unités à 12,50 € l'unité : quelle est la valeur du stock ?",
      reponse: 4250, tolerance: 0.01, unite: '€',
      expl: 'Valeur du stock = quantité × prix unitaire.',
    },
    {
      id: 'c8',
      enonce: 'Consommation moyenne de 45 unités par jour, délai de livraison de 6 jours, stock de sécurité de 80 unités. Quel est le stock d\'alerte ?',
      reponse: 350, unite: 'unités',
      expl: "Stock d'alerte = (consommation journalière × délai) + stock de sécurité.",
    },
  ],
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
