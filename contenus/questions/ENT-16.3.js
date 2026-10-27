// Les questions d'ENT-16.3 — Royal Canin, « présenter les indicateurs à la réunion » (rendre compte à l'oral). Décidées par Claude (délégation de Tristan du
// 26/10/2026 pour les blocs de Terminale). 4 questions notées au fil (part 4 sur 20), dont une d'éco-droit appliquée au cas (la discrétion du salarié,
// Code du travail, art. L1222-1). « Avant de commencer » : non noté, banque commune des séances Royal Canin.

import { phrasesJustes } from '../../core/phrases.js';
import { BANQUE, OUVERTURE, PERSONNES } from '../royal-canin.js';
import { T163 as T } from '../royal-canin-tableur.js';
import { nombreFr as n } from '../royal-canin-donnees.js';

const PLAN = 'plan-diapos-163';
const planEnvoye = (db) => phrasesJustes(db, PLAN).envoye;

export const QUESTIONS = {
  id: 'royal-canin-reunion',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'titre-message', type: 'fil', de: 'sandrine', groupe: 'Préparer ses diapos', quand: T.depose,
      enonce: 'Sur une diapo projetée en réunion, le titre doit…',
      choix: [{ v: 'message', lib: 'dire ce qu’il faut retenir (par exemple : « 3 risques de rupture à traiter cette semaine »)' },
        { v: 'sujet', lib: 'donner seulement le sujet (« Les indicateurs »)' }, { v: 'rien', lib: 'être le plus court possible, un seul mot' }],
      juste: 'message', retour: 'Le directeur lit le titre d’abord : s’il dit le message, la diapo est comprise en deux secondes.' },
    { id: 'texte-diapo', type: 'fil', de: 'sandrine', groupe: 'Préparer ses diapos', quand: T.depose,
      enonce: 'Combien de texte mettre sur une diapo ?',
      choix: [{ v: 'peu', lib: 'Peu : des chiffres clés et un graphique, c’est toi qui expliques' },
        { v: 'tout', lib: 'Tout ce que tu vas dire, pour pouvoir le lire' }, { v: 'tableau', lib: 'Le tableau complet du fichier, pour être précis' }],
      juste: 'peu', retour: 'Une diapo qu’on lit à voix haute ennuie la salle ; un tableau de 24 lignes ne se lit pas du fond de la salle.' },
    { id: 'question-directeur', type: 'fil', de: 'sandrine', groupe: 'Défendre ses chiffres', quand: planEnvoye,
      enonce: 'Le directeur demande : « Pourquoi parler de rupture ? Il reste du stock. » Que réponds-tu ?',
      choix: [{ v: 'delai', lib: 'Le stock tient moins longtemps que la production ne met à arriver : il manquera des sacs avant' },
        { v: 'peu', lib: 'Parce qu’il reste peu de sacs' }, { v: 'objectif', lib: 'Parce que la couverture est sous 15 jours' }],
      juste: 'delai',
      selon: (db) => { const I = T.I(db), r = I.urgente;
        return { enonce: `Le directeur demande : « Pourquoi dire que ${r} est en rupture ? Il en reste ${n(T.jeu(db).ind.find((l) => l[0] === r)[2])} sacs. » Que réponds-tu ?`,
          libs: { delai: `Ces sacs tiennent ${n(I.par[r].couverture)} jours ; la production en met ${I.par[r].delai} à arriver : il manquera des sacs avant` } }; },
      retour: 'Une rupture, ce n’est pas un stock nul : c’est un stock qui s’épuise avant l’arrivée de la prochaine production.' },
    { id: 'confidentiel', type: 'fil', de: 'sandrine', groupe: 'Le droit appliqué au cas', quand: planEnvoye,
      enonce: 'Un ami te propose de publier ton support sur un réseau social, pour montrer ton travail de stage. Qu’en penses-tu ?',
      choix: [{ v: 'non', lib: 'Non : ce sont des informations internes ; le salarié exécute son contrat de bonne foi et doit être discret' },
        { v: 'oui', lib: 'Oui : c’est mon travail, j’en fais ce que je veux' }, { v: 'flou', lib: 'Oui, si je retire le logo de l’entreprise' }],
      juste: 'non', retour: 'Code du travail, art. L1222-1 : « Le contrat de travail est exécuté de bonne foi. » Les juges en tirent une obligation de loyauté et de discrétion sur les informations internes.' },
  ],
};
