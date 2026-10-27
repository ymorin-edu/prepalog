// ENT-2.7 — Cdiscount, « les bons articles au bon endroit » : GUIDAGE de C2.2 (optimiser les préparations de commandes), 1re. Lundi 30 novembre, après le
// Black Friday : trois références font 80 % des lignes de la zone M et sont rangées au fond de l'allée. L'élève trouve la classe A, la rapproche du
// poste d'emballage, chiffre la marche gagnée et l'écrit à Nadia.
// Fabrique : `contenus/cdiscount-noel.js` ; données : `D27` de `contenus/cdiscount-noel-donnees.js` ; questions : `contenus/questions/ENT-2.7.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : la classe A 4 · sa part des lignes 2 · sa part des références 1 · chaque
// emplacement proche bien rempli 1,5 (× 3) · la marche avant 1,5 · après 1,5 · la proposition à Nadia 1,5 · questions au fil 4 = 20.

import { seance } from './cdiscount-noel.js';
import { D27 } from './cdiscount-noel-donnees.js';
import { QUESTIONS } from './questions/ENT-2.7.js';

export { ENTREPRISE, baseDeDepart } from './cdiscount-noel.js';

const S = seance(D27, {
  id: 'cdiscount-bon-endroit',
  K: { abc: true, pctRefs: true, places: true, marche: true },
  poids: { classeA: 4, pctLignes: 2, pctRefs: 1, m1: 1.5, m2: 1.5, m3: 1.5, avant: 1.5, apres: 1.5, 'compte-rendu': 1.5 },
  objet: 'Le fond de l’allée, à revoir avant Noël',
  ficheTitre: 'Les bons articles au bon endroit',
  consigne: 'La semaine du Black Friday a été dure : les préparateurs ont passé leurs journées au fond de l’allée M. Je voudrais réimplanter l’allée cette nuit, '
    + 'avant la vague de Noël. Avec l’export des lignes de la semaine 48 et le plan de l’allée :\n\n1. trouve la classe A (la fiche méthode est jointe) ;\n'
    + '2. dis-moi quelle référence ranger dans chacun des emplacements les plus proches du poste ;\n3. calcule la marche de la semaine pour la classe A, '
    + 'rangée comme aujourd’hui et comme tu le proposes.\n\nOuvre la fiche de calcul, puis écris-moi ta proposition.',
  poste: '<p>Ton travail aujourd’hui : trouver les <b>quelques références</b> qui font l’essentiel des lignes, et les <b>rapprocher</b> du poste d’emballage.</p>',
  etape: 'Classe A d’après les lignes de la semaine, puis la référence à mettre dans chaque emplacement proche, puis la marche avant et après.',
  documents: ['poste', 'lignes', 'allee', 'methode-abc', 'droit'],
  questions: QUESTIONS,
});
export const { ID, FICHE_ID, PHRASES_ID, VOLET_ID, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS, CATALOGUE } = S;
