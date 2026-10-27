// Les questions d'ENT-22.1 — Schneider Electric (CAP, entraînement). Décidées par Claude (délégation de Tristan du 26/10/2026). Nadia est CONSTRUITE.
// 3 questions notées au fil (part 4 sur 20) et une réflexion non notée. « Avant de commencer » : non noté, 3 questions tirées parmi 6 (banque
// commune de `contenus/schneider.js` : les notions du scénario, pas d'éco-droit à part au CAP).
import { apresFiche } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../schneider.js';

export const QUESTIONS = {
  id: 'schneider-bienvenue',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'probleme', type: 'fil', de: 'nadia', groupe: 'Qui fait quoi ?', quand: apresFiche('f221-qui'),
      enonce: 'Au quai, le scellé d’un camion n’a pas le bon numéro. Qui appelles-tu ?',
      choix: [{ v: 'nadia', lib: 'Nadia, la cheffe d’équipe' }, { v: 'julien', lib: 'Julien, le cariste' }, { v: 'chauffeur', lib: 'Personne : je laisse le chauffeur décider' }],
      juste: 'nadia', retour: 'Nadia décide : toi, tu signales et tu n’ouvres pas.' },
    { id: 'distributeur', type: 'fil', de: 'nadia', groupe: 'Le voyage d’un disjoncteur', quand: apresFiche('f221-voyage'),
      enonce: 'Qui commande les produits au centre d’Évreux ?',
      choix: [{ v: 'distrib', lib: 'Des distributeurs de matériel électrique, qui revendent aux électriciens' }, { v: 'particulier', lib: 'Des particuliers, sur Internet' },
        { v: 'usine', lib: 'Les usines du groupe' }],
      juste: 'distrib', retour: 'Le centre prépare les commandes des distributeurs ; l’électricien achète chez eux.' },
    { id: 'exo', type: 'fil', de: 'nadia', groupe: 'Les outils du centre', quand: apresFiche('f221-outils'),
      enonce: 'À quoi sert l’exosquelette ?',
      choix: [{ v: 'dos', lib: 'À soulager le dos pour porter les cartons lourds' }, { v: 'vite', lib: 'À courir plus vite' }, { v: 'froid', lib: 'À ne pas avoir froid' }],
      juste: 'dos', retour: 'Au-delà de 25 kg, un carton se porte avec l’exosquelette ou à deux.' },
    { id: 'pourquoi-evreux', type: 'fil', de: 'nadia', reflexion: true, quand: apresFiche('f221-outils'),
      enonce: 'Pourquoi un centre de distribution près de Paris et de la Normandie ?',
      choix: [{ v: 'clients', lib: 'Pour être près des usines, des autoroutes et de beaucoup de clients' }, { v: 'mer', lib: 'Pour voir la mer' }, { v: 'hasard', lib: 'Par hasard' }],
      retour: 'Près des usines et des grands axes, les camions roulent moins.' },
  ],
};
