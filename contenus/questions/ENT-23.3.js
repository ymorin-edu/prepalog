// Les questions d'ENT-23.3 — Yves Rocher (2de, entraînement C2.2). Décidées par Claude (délégation de Tristan du 26/10/2026). Soizic est CONSTRUITE.
// 3 questions notées au fil (part 4 sur 20) et une réflexion non notée. « Avant de commencer » : non noté, 3 questions tirées.
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE_PREPA, OUVERTURE_PREPA, PERSONNES } from '../yves-rocher.js';

export const QUESTIONS = {
  id: 'yves-rocher-controle',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_PREPA(),
  liste: [
    ...BANQUE_PREPA,
    { id: 'pourquoi-controle', type: 'fil', de: 'soizic', groupe: 'Le contrôle', quand: apresFiche('f233-controle'),
      enonce: 'Pourquoi contrôler un carton avant de le fermer ?',
      choix: [{ v: 'avant', lib: 'Pour corriger une erreur ici, avant que la boutique la découvre' }, { v: 'punir', lib: 'Pour punir le préparateur' },
        { v: 'temps', lib: 'Pour passer le temps' }],
      juste: 'avant', retour: 'Une erreur corrigée ici évite une réclamation, un nouvel envoi et une boutique mécontente.' },
    { id: 'teinte', type: 'fil', de: 'soizic', groupe: 'Le carton', quand: apresFiche('f233-carton'),
      enonce: 'Une cliente voulait le rouge à lèvres teinte 12 et la boutique reçoit la teinte 15. Pour la boutique, c’est…',
      choix: [{ v: 'erreur', lib: 'une erreur : ce n’est pas le produit commandé' }, { v: 'pareil', lib: 'pareil : c’est un rouge à lèvres' }, { v: 'cadeau', lib: 'un cadeau' }],
      juste: 'erreur', retour: 'Deux teintes, ce sont deux références différentes.' },
    { id: 'scanner', type: 'fil', de: 'soizic', groupe: 'Les bons gestes', quand: apresFiche('f233-pratiques'),
      enonce: 'Quand tu scannes un article au moment de le prendre, le système…',
      choix: [{ v: 'verifie', lib: 'vérifie que c’est le bon produit et compte avec toi' }, { v: 'paie', lib: 'le paie au fournisseur' }, { v: 'rien', lib: 'ne fait rien' }],
      juste: 'verifie', retour: 'Le scan bipe si ce n’est pas la bonne référence : l’erreur ne part pas.' },
    { id: 'erreur', type: 'fil', de: 'soizic', reflexion: true, quand: apresFiche('f233-pratiques'),
      enonce: 'Si tu te trompes en préparant, que fais-tu ?',
      choix: [{ v: 'dire', lib: 'Je le dis tout de suite à Soizic' }, { v: 'corriger', lib: 'Je corrige seul(e)' }, { v: 'cacher', lib: 'Je ne dis rien' }],
      retour: 'Merci. Une erreur dite tout de suite se corrige vite.' },
  ],
};
