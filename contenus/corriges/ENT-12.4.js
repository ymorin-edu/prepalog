// Corrigé d'ENT-12.4 (IKEA, « la facture du transporteur »), montré dans l'onglet « Corrigés » de l'enseignant. Guidage : la facture est la même pour tous (pièce fixe) ;
// tout se recalcule depuis les bons et le tarif (`contenus/ikea-facture.js`). N'importe que les données pures : se charge aussi sous Node.

import { dossier } from '../ikea-ent124-donnees.js';
import { ERREURS } from '../ikea-facture.js';
import { euros } from '../ikea.js';

const F = dossier();
const L = (n) => F.lignes[n - 1];

export const CORRIGE = {
  code: 'ENT-12.4',
  titre: 'IKEA — la facture du transporteur',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Les trois lignes fausses (9 points)', genre: 'question', texte: 'Où sont les erreurs',
      rep: Object.entries(F.fautes).filter(([t]) => t !== 'calcul').map(([t, f]) => `${ERREURS[t].lib} : ligne ${f.lignes[0]}${t === 'doublon' ? ` (identique à la ligne ${f.accepte[0]}, même bon ${L(f.lignes[0]).bl})` : ` (bon ${L(f.lignes[0]).bl})`}`).join(' · '),
      note: '3 points par erreur trouvée sous le bon motif. Pour le doublon, la ligne 8 ou la ligne 12 est acceptée (une seule des deux).' },
    { etape: 2, etapeTitre: 'Aucune ligne juste contestée (2 points)', genre: 'question', texte: 'Les pièges',
      rep: 'La ligne avec une réserve précise sur le bon (ligne 7) et la livraison manquée correctement facturée à 30 % restent justes. Il faut avoir contesté au moins une ligne.',
      note: 'Une fiche vide ne rapporte rien.' },
    { etape: 3, etapeTitre: 'Le bon montant (3 points)', genre: 'question', texte: 'Total HT, TVA, TTC et écart',
      rep: `Total HT juste ${euros(F.justes.ht)} · TVA ${euros(F.justes.tva)} · TTC ${euros(F.justes.ttc)} · écart à réclamer ${euros(F.ecartHT)} HT (facturé ${euros(F.totalAffiche)} HT)`,
      note: 'Le total juste est la somme des prix dus pour les onze bons, calculés avec le tarif.' },
    { etape: 4, etapeTitre: 'La réclamation (2 points)', genre: 'question', texte: 'Les phrases justes',
      rep: 'Les lignes contestées (4, 6 et 12) · les trois motifs · l’avoir du montant de l’écart (HT et TTC) · salutation « Madame, Monsieur, » et fin « Cordialement, … » (imposées, non jugées).',
      note: 'Aucun jalon de forme : la salutation et la fin sont à choisir mais ne sont pas notées.' },
    { etape: 5, etapeTitre: 'Les questions (4 points)', genre: 'question', texte: 'Quatre questions notées au fil du travail',
      rep: 'La pièce de comparaison (bon signé + tarif) · pourquoi pas la livraison complète (livraison manquée) · l’écart en TTC (× 1,2) · à quoi sert un avoir (annuler tout ou partie). Réflexion non notée : payer d’abord ? (art. 1302).',
      note: 'Corrigées tout de suite. « Avant de commencer » n’est pas noté.' },
  ],
};
export function corrigeEleve() { return { texte: '', items: [] }; }
