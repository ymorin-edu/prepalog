// Les questions d'ENT-16.2 — Royal Canin, « les indicateurs de novembre » (entraînement, au tableur). Décidées par Claude (délégation de Tristan du 26/10/2026),
// refaites le 27/10/2026 pour le tableur : les valeurs sont tirées pour chaque élève, deux questions lisent SON mois (`selon`).
// 3 questions notées au fil (part 4 sur 20) et une réflexion d'éco-droit (la fréquence des transports). « Avant de commencer » : non noté.

import { apresMail } from '../../core/declencheurs.js';
import { BANQUE, OUVERTURE, PERSONNES, MAIL_SANDRINE } from '../royal-canin.js';
import { T162 as T } from '../royal-canin-tableur.js';
import { nombreFr as n } from '../royal-canin-donnees.js';

// La référence « presque en rupture » de l'élève : à l'heure, la plus proche de son délai.
function presque(db) {
  const I = T.I(db);
  const r = Object.keys(I.par).filter((x) => !I.rupture.includes(x) && !I.surstock.includes(x))
    .sort((a, b) => (I.par[a].couverture - I.par[a].delai) - (I.par[b].couverture - I.par[b].delai))[0];
  return { r, couv: n(I.par[r].couverture), delai: I.par[r].delai };
}

export const QUESTIONS = {
  id: 'royal-canin-indicateurs-novembre',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE(),
  liste: [
    ...BANQUE,
    { id: 'cambrai', type: 'fil', de: 'sandrine', groupe: 'Les indicateurs', quand: T.exporte,
      enonce: 'Pourquoi ne garder que les références d’Aimargues dans ton fichier ?',
      choix: [{ v: 'nos', lib: 'Celles de Cambrai sont produites et suivies par l’autre usine : les mélanger fausserait nos indicateurs et nos décisions' },
        { v: 'trop', lib: 'Pour avoir moins de lignes à calculer' }, { v: 'faux', lib: 'Parce que les chiffres de Cambrai sont faux' }],
      juste: 'nos', retour: 'Un indicateur se calcule sur le périmètre qu’on pilote : nos références, nos productions, nos délais.' },
    { id: 'pas-rupture', type: 'fil', de: 'sandrine', groupe: 'Les indicateurs', quand: T.depose,
      enonce: 'Une de tes références a une couverture à peine plus longue que son délai. Est-ce un risque de rupture ?',
      choix: [{ v: 'non', lib: 'Non : le stock tient plus longtemps que le délai, la prochaine production arrive avant' },
        { v: 'oui', lib: 'Oui : c’est très peu de jours' }, { v: 'egal', lib: 'Oui, dès que la couverture est sous 5 jours' }],
      juste: 'non',
      selon: (db) => { const P = presque(db);
        return { enonce: `${P.r} a ${P.couv} jours de couverture pour ${P.delai} jours de délai. Est-ce un risque de rupture ?`,
          retour: `On compare la couverture au délai de la référence, pas à un chiffre fixe : ${P.couv} jours de stock pour ${P.delai} jours de délai, ça passe, de peu.` }; },
      retour: 'On compare la couverture au délai de la référence, pas à un chiffre fixe.' },
    { id: 'usine', type: 'fil', de: 'sandrine', groupe: 'Les indicateurs', quand: T.depose,
      enonce: 'Ta rupture la plus urgente : que demandes-tu à l’usine ?',
      choix: [{ v: 'avancer', lib: 'D’avancer sa production, en priorité' }, { v: 'retarder', lib: 'De retarder sa production' },
        { v: 'rien', lib: 'Rien : la production viendra' }],
      juste: 'avancer',
      selon: (db) => { const I = T.I(db), r = I.urgente;
        return { enonce: `${r} n’a plus que ${n(I.par[r].couverture)} jours de stock pour ${I.par[r].delai} jours de délai. Que demandes-tu à l’usine ?`,
          retour: `Il manquerait ${n(I.par[r].delai - I.par[r].couverture)} jours de sacs à livrer : on avance sa production, et on prévient les clients si on n’y arrive pas.` }; },
      retour: 'Des jours sans sacs à livrer sinon : on avance, et on prévient les clients si on n’y arrive pas.' },
    { id: 'camions', type: 'fil', de: 'sandrine', reflexion: true, quand: apresMail({ a: MAIL_SANDRINE }),
      enonce: 'Un client veut être livré tous les jours en petites quantités pour avoir moins de stock. Quel est le revers ?',
      choix: [{ v: 'camions', lib: 'Plus de camions à moitié vides sur la route : plus de coûts et plus d’émissions' },
        { v: 'aucun', lib: 'Aucun' }, { v: 'qualite', lib: 'Les croquettes s’abîment' }],
      retour: 'Moins de stock chez le client, plus de transport : on cherche l’équilibre (regrouper, remplir les camions).' },
  ],
};
