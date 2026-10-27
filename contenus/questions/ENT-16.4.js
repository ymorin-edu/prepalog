// Les questions d'ENT-16.4 — Royal Canin, « la commande export de Mehdi » (erreur induite). Décidées par Claude (délégation de Tristan du 26/10/2026).
// Mehdi est CONSTRUIT. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (la livraison non conforme). « Avant de commencer » : non noté.

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_SANDRINE } from '../royal-canin.js';

const F = 'fiche-164';

export const QUESTIONS = {
  id: 'royal-canin-export',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'a-quelques-jours', type: 'fil', de: 'sandrine', groupe: 'La commande export', quand: apresGeste(`fiche:${F}:nonconformes`),
      enonce: 'Le lot L7203 a une DDM au 20/11/2027, presque 9 mois. Pourquoi ne peut-il pas partir ?',
      choix: [{ v: 'limite', lib: 'La limite est le 01/12/2027 : il lui manque quelques jours, il n’est pas conforme' },
        { v: 'peut', lib: 'Il peut partir : presque 9 mois, ça suffit' }, { v: 'vieux', lib: 'Parce qu’il a été fabriqué trop tôt' }],
      juste: 'limite', retour: 'Une exigence se respecte au jour près : on calcule la date limite, et on compare.' },
    { id: 'fifo-fefo', type: 'fil', de: 'sandrine', groupe: 'La commande export', quand: apresGeste(`fiche:${F}:cause`),
      enonce: 'Pourquoi trier les lots par DDM (FEFO) plutôt que par date d’entrée (FIFO) ?',
      choix: [{ v: 'date', lib: 'C’est la DDM qui compte pour le client, et l’ordre d’entrée ne suit pas toujours l’ordre des dates' },
        { v: 'pareil', lib: 'C’est la même chose' }, { v: 'vite', lib: 'Le FEFO va plus vite' }],
      juste: 'date', retour: 'Des lots peuvent avoir des durées de vie différentes : on sort d’abord celui qui périme le premier, parmi ceux qui conviennent.' },
    { id: 'ou-vont', type: 'fil', de: 'sandrine', groupe: 'La commande export', quand: apresFiche(F),
      enonce: 'Que deviennent L7124 et L7203, retirés de la commande ?',
      choix: [{ v: 'france', lib: 'Ils partent vers des clients moins exigeants (en France, délais courts)' },
        { v: 'jeter', lib: 'On les jette' }, { v: 'export', lib: 'On les envoie quand même à un autre client export' }],
      juste: 'france', retour: 'Un lot trop court pour un client ne l’est pas pour tous : on l’oriente vers une commande qui le permet.' },
    { id: 'retour-export', type: 'fil', de: 'sandrine', reflexion: true, quand: apresMail({ a: MAIL_SANDRINE }),
      enonce: 'Si le camion était parti avec la préparation de Mehdi et que le client refusait deux palettes à l’arrivée, qui en supporterait le coût ?',
      choix: [{ v: 'vendeur', lib: 'Royal Canin, le vendeur : il n’a pas livré ce qui était convenu' }, { v: 'client', lib: 'Le client' },
        { v: 'transporteur', lib: 'Le transporteur' }],
      retour: 'Le vendeur doit livrer conforme : retour, remplacement ou pénalité sont pour lui. Vérifier avant le départ coûte bien moins cher.' },
  ],
};
