// Corrigé d'ENT-12.7 (IKEA, évaluation « la livraison de ta cliente »), montré dans l'onglet « Corrigés » de l'enseignant. Chaque élève a SON jeu (cliente, imprévu, décalage de la journée) tiré de son
// identifiant : ce corrigé donne la réponse de chacune des quatre clientes et la règle de la journée, tout recalculé depuis les données (`contenus/ikea-ent127-donnees.js`). N'importe que des données pures.

import { CLIENTES, IMPREVUS, DECALAGES, prixJuste, montantCommande, maxTenues, commandesDe, creneauLib, IMPOSSIBLES } from '../ikea-ent127-donnees.js';
import { lib, MODES } from '../ikea.js';
import { RAISONS } from '../ikea-ent127-donnees.js';

const M = (jeu) => maxTenues(commandesDe(jeu));
const jeu0 = { cliente: 0, imprevu: 0, decalage: 0 };
const modes = (cl) => cl.articles.map((a) => `${a.lib} : ${lib(MODES, a.mode)} (${lib(RAISONS, a.raison).toLowerCase()})`).join(' ; ');
const nomCmd = (jeu, id) => commandesDe(jeu).find((c) => c.id === id).client;

export const CORRIGE = {
  code: 'ENT-12.7',
  titre: 'IKEA — évaluation : la livraison de ta cliente',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'L’appel (4 points)', genre: 'question', texte: 'Demander l’accès, fixer le bon créneau, ne rien promettre de faux',
      rep: CLIENTES.map((cl) => `${cl.civ} ${cl.nom} (${cl.ville}, ${cl.logement}) — créneau : ${cl.dispo === 'matin' ? 'le matin' : 'l’après-midi'} ; piège : ${cl.promesse.id} → « ${cl.promesse.juste} »`).join(' ‖ '),
      note: 'Accès demandé ET bon créneau 3 · rien de faux promis 1. Une seule réponse compte : la première.' },
    { etape: 2, etapeTitre: 'Le mode et le prix (6 points)', genre: 'question', texte: 'Un mode et sa raison pour chaque article, puis le prix total',
      rep: CLIENTES.map((cl) => `${cl.civ} ${cl.nom} : ${modes(cl)} → prix ${prixJuste(cl)} € (commande de ${montantCommande(cl)} €, ${cl.membre ? 'membre IKEA Family' : 'non membre'})`).join(' ‖ '),
      note: 'Un mode et sa raison par article : 1, 1 et 2 points (le dernier article de la commande vaut double) · le prix 2. Règle : le mode le moins cher parmi ceux qui conviennent au client et aux conditions du mode ; le Point Relais se paie une fois ; les articles d’un même mode se tarifent sur leur montant ensemble.' },
    { etape: 3, etapeTitre: 'La journée (6 points)', genre: 'question', texte: 'Replanifier les dix commandes sur trois camions après l’imprévu, puis prévenir les clients',
      rep: `Dans chacun des trois décalages (${DECALAGES.map((d) => `+${d / 4} h`).join(', ')}) : ${M(jeu0).max} commandes sur dix peuvent tenir leur créneau et un seul ensemble ; ${IMPOSSIBLES.map((id) => `${nomCmd(jeu0, id)} (${creneauLib(commandesDe(jeu0).find((c) => c.id === id))} sans décalage)`).join(' et ')} ne le peuvent pas, ce sont eux qu’on reporte à demain et qu’on prévient. Imprévus tirés : ${IMPREVUS.map((i) => i.court).join(' ; ')} (même effet : la péniche ne part pas).`,
      note: 'Camions, charge et créneaux tenus pour tout ce qui pouvait l’être 3 · les clients non tenus prévenus, et eux seuls 2 · la nouvelle date (demain) 1. Il y a plusieurs façons de poser les huit : ce qui compte, ce sont les règles.' },
    { etape: 4, etapeTitre: 'Les questions (4 points)', genre: 'question', texte: 'Quatre questions tirées avant de commencer, sans aide',
      rep: 'Reformuler la demande · l’accès (ascenseur, escalier) · le poids total des colis · le créneau tenu ; l’engagement sur la date et le créneau · la livraison par la fenêtre à la charge du client · annuler après un délai raisonnable · annuler tout de suite si la date était essentielle.',
      note: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher à 0. Les trois questions au fil du travail sont des réflexions, non notées.' },
  ],
};
