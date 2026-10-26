// Corrigé d'ENT-12.3 (IKEA, « la Seine est en crue »), montré dans l'onglet « Corrigés » de l'enseignant. Entraînement : le planning est le même pour tous (pièce fixe) ; tout se recalcule
// depuis les données (`contenus/ikea-ent123-donnees.js`). N'importe que les données pures : se charge aussi sous Node.

import { CAMIONS, IMPOSSIBLES, parId, maxTenues, creneauLib, KM_TOTAL } from '../ikea-ent123-donnees.js';

const nom = (id) => parId[id].client;
const M = maxTenues();

export const CORRIGE = {
  code: 'ENT-12.3',
  titre: 'IKEA — la Seine est en crue',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Le planning (10 points)', genre: 'question', texte: 'Poser les dix commandes sur trois camions, sans recouvrement, dans la charge, dans les créneaux',
      rep: `${M.max} commandes sur dix peuvent tenir leur créneau (${M.ensembles[0].map(nom).join(', ')}) ; ${IMPOSSIBLES.map(nom).join(' et ')} ne le peuvent pas : le bloc « trajet + livraison » est plus long que leur créneau (${IMPOSSIBLES.map((id) => `${nom(id)} ${creneauLib(parId[id])}`).join(' ; ')}). `
        + 'Ces deux-là se reportent à demain. Une solution : Camion 1 — Mme Martin 8 h, M. Nguyen 9 h 15, Mme Lefèvre 10 h 45 · Camion 2 — M. Morel 10 h, M. Perrin 14 h, Mme Garcia 15 h 15 · Camion 3 — M. Diallo 14 h, Mme Costa 15 h.',
      note: `Poser et sans recouvrement 3 · charge des camions (${CAMIONS.map((c) => `${c.nom} ${c.note}`).join(' ; ')}) 2 · créneaux tenus pour tout ce qui pouvait l’être 5. Il y a plusieurs solutions : ce qui compte, ce sont les règles.` },
    { etape: 2, etapeTitre: 'Prévenir les clients (4 points)', genre: 'question', texte: 'Qui prévenir, et quelle date',
      rep: `Ceux que SON planning ne tient pas : ici ${IMPOSSIBLES.map(nom).join(' et ')} (reportés à demain) ; la nouvelle date : demain, vendredi 12 mars, le matin.`,
      note: 'Qui 3 · la date 1. Un client hors de son créneau sur un camion est aussi « non tenu » : l’élève qui en laisse un doit le prévenir.' },
    { etape: 3, etapeTitre: 'La réponse à Mme Roux (2 points)', genre: 'question', texte: 'Les phrases justes',
      rep: 'Salutation « Bonjour Madame Roux, » · la règle : elle peut mettre fin à sa commande si IKEA ne livre pas dans le délai supplémentaire qu’elle lui accorde par écrit (pas tout de suite, sauf si la date était essentielle) '
        + '· la nouvelle date : demain, vendredi 12 mars, le matin · fin « Cordialement, … ».',
      note: 'La règle et la date comptent 2 points ; la salutation et la fin ne sont pas notées.' },
    { etape: 4, etapeTitre: 'Les questions (4 points)', genre: 'question', texte: 'Quatre questions notées au fil du travail',
      rep: `Pourquoi la péniche ne passe pas (ponts trop bas, courant) · M. Diallo livré à 17 h (l’engagement de créneau) · les kilomètres en plus (${KM_TOTAL} km pour les dix commandes) · Mme Roux peut-elle annuler tout de suite (non : délai raisonnable d’abord, sauf date essentielle).`,
      note: 'Corrigées tout de suite. « Avant de commencer » (trois questions tirées) n’est pas noté.' },
  ],
};
