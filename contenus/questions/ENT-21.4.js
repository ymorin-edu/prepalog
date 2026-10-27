// Les questions d'ENT-21.4 — Lidl (2de, guidage AGO-2.2 et AGO-1.3). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil
// (part 4), dont une d'éco-droit, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_COMPTA, OUVERTURE_COMPTA, PERSONNES, MAIL_CLAIRE } from '../lidl.js';

export const QUESTIONS = {
  id: 'lidl-facture',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_COMPTA(),
  liste: [
    ...BANQUE_COMPTA,
    { id: 'reception', type: 'fil', de: 'claire', groupe: 'Le rapprochement', quand: apresFiche('f214-rapprochement'),
      enonce: 'Comment sais-tu que deux cartons de fromage blanc n’ont pas été reçus ?',
      choix: [{ v: 'bon', lib: 'Par le bon de réception rempli au quai' }, { v: 'facture', lib: 'Par la facture' }, { v: 'devine', lib: 'Je le devine' }],
      juste: 'bon', retour: 'Le quai et la comptabilité travaillent ensemble : sans bon de réception juste, pas de facture juste.' },
    { id: 'tva', type: 'fil', de: 'claire', groupe: 'Le montant', quand: apresFiche('f214-montants'),
      enonce: 'La TVA que nous payons au fournisseur, à qui va-t-elle au bout du compte ?',
      choix: [{ v: 'etat', lib: 'À l’État : le fournisseur la reverse' }, { v: 'fournisseur', lib: 'Au fournisseur, c’est son bénéfice' }, { v: 'lidl', lib: 'À Lidl' }],
      juste: 'etat', retour: 'La TVA est un impôt : l’entreprise la collecte et la reverse à l’État.' },
    { id: 'droit-delai', type: 'fil', de: 'claire', groupe: 'L’échéance', quand: apresFiche('f214-echeance'),
      enonce: 'Pourquoi la loi fixe-t-elle un délai court pour payer les produits frais ?',
      choix: [{ v: 'producteurs', lib: 'Pour que les producteurs, souvent petits, soient payés vite' }, { v: 'banque', lib: 'Pour faire gagner les banques' },
        { v: 'rien', lib: 'Il n’y a aucune raison' }],
      juste: 'producteurs', retour: 'Un producteur paie ses salariés et ses récoltes chaque mois : un retard de paiement peut le mettre en difficulté.' },
    { id: 'fraude', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_CLAIRE }),
      enonce: 'Le courriel « urgent » pour changer de RIB, tu l’aurais repéré tout(e) seul(e) ?',
      choix: [{ v: 'oui', lib: 'Oui : l’urgence et l’adresse inconnue m’auraient alerté(e)' }, { v: 'peut-etre', lib: 'Peut-être' }, { v: 'non', lib: 'Non' }],
      retour: 'Cette fraude « au faux fournisseur » est fréquente : la règle du rappel au numéro connu protège tout le monde.' },
  ],
};
