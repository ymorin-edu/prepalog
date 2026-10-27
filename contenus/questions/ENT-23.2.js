// Les questions d'ENT-23.2 — Yves Rocher (2de, entraînement C2.2). Décidées par Claude (délégation de Tristan du 26/10/2026). Soizic est CONSTRUITE.
// 3 questions notées au fil (part 4 sur 20) et une réflexion non notée. « Avant de commencer » : non noté, 3 questions tirées.
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE_PREPA, OUVERTURE_PREPA, PERSONNES } from '../yves-rocher.js';

export const QUESTIONS = {
  id: 'yves-rocher-chariot',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_PREPA(),
  liste: [
    ...BANQUE_PREPA,
    { id: 'quatre', type: 'fil', de: 'soizic', groupe: 'Préparer', quand: apresFiche('f232-types'),
      enonce: 'Pourquoi prendre quatre commandes sur un même chariot ?',
      choix: [{ v: 'pas', lib: 'Pour passer une seule fois à chaque adresse au lieu de quatre' }, { v: 'lourd', lib: 'Pour que le chariot soit plus lourd' },
        { v: 'melanger', lib: 'Pour mélanger les commandes' }],
      juste: 'pas', retour: 'Un seul passage à l’adresse sert quatre boutiques : c’est le chariot multi-commandes.' },
    { id: 'retour-arriere', type: 'fil', de: 'soizic', groupe: 'Les arrêts', quand: apresFiche('f232-ordre'),
      enonce: 'Tu as oublié un produit dans l’allée 03 et tu es déjà à l’allée 14. Qu’est-ce que ça coûte ?',
      choix: [{ v: 'temps', lib: 'Du temps et des pas : il faut revenir en arrière' }, { v: 'rien', lib: 'Rien du tout' }, { v: 'argent', lib: 'Une amende' }],
      juste: 'temps', retour: 'Un retour en arrière allonge ta tournée : c’est pour ça qu’on suit l’ordre des adresses.' },
    { id: 'bac', type: 'fil', de: 'soizic', groupe: 'Le chariot', quand: apresFiche('f232-chariot'),
      enonce: 'Tu mets les vernis dans le bac de Rennes au lieu du bac de Lorient. Que se passe-t-il ?',
      choix: [{ v: 'deux', lib: 'Deux boutiques reçoivent une commande fausse' }, { v: 'une', lib: 'Seule Rennes a un problème' }, { v: 'rien', lib: 'Rien : les vernis sont tous pareils' }],
      juste: 'deux', retour: 'Lorient n’a pas ses vernis, Rennes en a en trop : deux réclamations.' },
    { id: 'difficile', type: 'fil', de: 'soizic', reflexion: true, quand: apresFiche('f232-chariot'),
      enonce: 'Qu’est-ce qui t’a paru le plus difficile ?',
      choix: [{ v: 'calcul', lib: 'Les cartons et le détail' }, { v: 'ordre', lib: 'L’ordre des adresses' }, { v: 'bacs', lib: 'Répartir dans les bacs' }],
      retour: 'Merci : on le retravaille ensemble.' },
  ],
};
