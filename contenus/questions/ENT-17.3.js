// Les questions d'ENT-17.3 — La Redoute (guidage). Décidées par Claude (délégation de Tristan du 26/10/2026, fil « Proposer les prochains
// blocs »). Claire et Julien sont CONSTRUITS. 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (les retours gratuits).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (banque commune de `contenus/la-redoute.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_CLAIRE } from '../la-redoute.js';

const F = 'fiche-173';

export const QUESTIONS = {
  id: 'la-redoute-retours',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'essaye', type: 'fil', de: 'claire', groupe: 'Les retours', quand: apresGeste(`fiche:${F}:fil-R-02`),
      enonce: 'R-02 est propre et sans défaut. Pourquoi ne va-t-il pas directement en stock ?',
      choix: [{ v: 'controle', lib: 'Il a été essayé : on le contrôle et on le prépare avant de le revendre' }, { v: 'sale', lib: 'Parce qu’il est sale' }, { v: 'defaut', lib: 'Parce qu’il a un défaut' }],
      juste: 'controle', retour: 'Le client suivant doit recevoir un article comme neuf : contrôle, repassage, nouvel emballage.' },
    { id: 'pas-detruire', type: 'fil', de: 'claire', groupe: 'Les retours', quand: apresGeste(`fiche:${F}:fil-R-05`),
      enonce: 'R-05 est hors d’usage. Pourquoi ne pas le jeter à la benne ?',
      choix: [{ v: 'agec', lib: 'La loi interdit de détruire les invendus non alimentaires : on recycle la matière' }, { v: 'prix', lib: 'La benne coûte cher' }, { v: 'client', lib: 'Le client pourrait le demander' }],
      juste: 'agec', retour: 'Loi AGEC : pas de destruction. Un textile hors d’usage part en filière de recyclage.' },
    { id: 'don-pas-vente', type: 'fil', de: 'claire', groupe: 'Les retours', quand: apresGeste(`fiche:${F}:taux`),
      enonce: 'Pourquoi un don ne compte-t-il pas dans le taux de remise en vente ?',
      choix: [{ v: 'revenu', lib: 'Un don ne revient pas à la vente : le taux mesure ce qu’on revend' }, { v: 'mauvais', lib: 'Parce que donner est une mauvaise chose' }, { v: 'compte', lib: 'Il compte, il faut l’ajouter' }],
      juste: 'revenu', retour: 'Un don est utile, mais ce n’est pas une vente : on les compte à part.' },
    { id: 'retour-gratuit', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_CLAIRE }),
      enonce: 'Des clients commandent deux tailles et renvoient celle qui ne va pas. Quelle conséquence ?',
      choix: [{ v: 'transport', lib: 'Deux fois plus de colis, de transport et de manutention' }, { v: 'aucune', lib: 'Aucune' }, { v: 'vente', lib: 'Plus de ventes' }],
      retour: 'Chaque retour, c’est un aller-retour en camion : aider le client à choisir sa taille réduit les retours.' },
  ],
};
