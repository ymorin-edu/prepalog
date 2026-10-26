// Corrigé d'ENT-12.8 (IKEA, « évaluation : la facture de mars »), montré dans l'onglet « Corrigés » de l'enseignant. Chaque élève a SA facture (trois erreurs tirées parmi six,
// une de chaque niveau) : `corrigeEleve(base, uid)` la rend, CALCULÉE depuis sa base. N'importe que les données pures : se charge aussi sous Node.

import { ID, TIRAGE, dossier } from '../ikea-ent128-donnees.js';
import { ERREURS } from '../ikea-facture.js';
import { euros } from '../ikea.js';
import { graineDeBase } from '../../core/tirage.js';

export const CORRIGE = {
  code: 'ENT-12.8',
  titre: 'IKEA — évaluation : la facture de mars',
  trame: '(pas de trame : tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'Les trois erreurs (9 points)', genre: 'question', texte: 'Une erreur de chaque niveau',
      rep: 'Trois erreurs tirées parmi six : facile (doublon ou total faux), moyenne (mauvais tarif ou colis en trop), difficile (livraison non faite ou supplément d’étage indu). Les lignes exactes sont dans le corrigé de chaque élève.',
      note: '3 points par erreur trouvée sous le bon motif (pour le doublon, l’une OU l’autre des deux lignes identiques). Cocher beaucoup de lignes (trois lignes justes ou plus) ne rapporte aucune erreur.' },
    { etape: 2, etapeTitre: 'Aucune ligne juste contestée (2 points)', genre: 'question', texte: 'Les pièges',
      rep: 'La livraison manquée correctement facturée à 30 % et la ligne avec une réserve précise sur le bon restent justes. Il faut avoir contesté au moins une ligne, et ne dire « total faux » que s’il l’est.',
      note: 'Une fiche vide ne rapporte rien.' },
    { etape: 3, etapeTitre: 'Le bon montant (3 points)', genre: 'question', texte: 'Total HT, TVA, TTC et écart', rep: 'Voir le corrigé de chaque élève : le total juste est la somme des prix dus pour les bons, calculés avec le tarif.',
      note: 'Les quatre montants doivent être justes.' },
    { etape: 4, etapeTitre: 'La réclamation (2 points)', genre: 'question', texte: 'Les phrases justes',
      rep: 'Les lignes contestées · les motifs · l’avoir du montant de l’écart (HT et TTC) · salutation « Madame, Monsieur, » et fin « Cordialement, … » (imposées, non notées).',
      note: 'Aucun jalon de forme.' },
    { etape: 5, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions tirées, sans aide',
      rep: 'Une facture d’achat · le bon signé · HT et TTC · le doublon · l’avoir · le paiement de l’indu (art. 1302) · ce qui est dû · la preuve.',
      note: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Les deux réflexions au fil ne sont pas notées.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  const graine = graineDeBase(db) || String(uid || 'anonyme');
  if (!ouvert) db = { tirage: { graine }, tirages: { [ID]: { graine: `${graine}|${ID}`, ...TIRAGE.tirer(`${graine}|${ID}`) } } };
  const F = dossier(db), L = (n) => F.lignes[n - 1];
  const items = Object.entries(F.fautes).map(([t, f]) => ({ genre: 'fait',
    texte: `${ERREURS[t].lib} (${ERREURS[t].niveau})`,
    rep: t === 'calcul' ? `total affiché ${euros(F.totalAffiche)} HT, somme des lignes ${euros(F.somme)} HT`
      : t === 'doublon' ? `ligne ${f.lignes[0]} (identique à la ligne ${f.accepte[0]}, même bon ${L(f.lignes[0]).bl}) ; la ligne ${f.accepte[0]} est aussi acceptée`
      : `ligne ${f.lignes[0]} (bon ${L(f.lignes[0]).bl}, ${L(f.lignes[0]).client})` }));
  items.push(
    { genre: 'fait', texte: 'Les lignes à réclamer', rep: F.lignesContestees.join(', ') },
    { genre: 'fait', texte: 'Le bon montant', rep: `HT ${euros(F.justes.ht)} · TVA ${euros(F.justes.tva)} · TTC ${euros(F.justes.ttc)} · écart à réclamer ${euros(F.ecartHT)} HT` });
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
