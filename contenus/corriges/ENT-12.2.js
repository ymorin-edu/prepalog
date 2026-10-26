// Corrigé d'ENT-12.2 (IKEA, « la demande de Mme Benali »), montré dans l'onglet « Corrigés » de l'enseignant. Chaque élève a SA commande (poids des colis, prix de
// l'armoire et du canapé, membre ou non) : `corrigeEleve(base, uid)` la rend, CALCULÉE depuis sa base. N'importe que les données pures : se charge aussi sous Node.

import { ID, TIRAGE, situationDe, CRENEAUX, CRENEAU_JUSTE, ARTICLES, RAISONS } from '../ikea-ent122-donnees.js';
import { MODES, lib, euros } from '../ikea.js';
import { graineDeBase } from '../../core/tirage.js';

export const CORRIGE = {
  code: 'ENT-12.2',
  titre: 'IKEA — la demande de Mme Benali',
  trame: '(pas de trame : tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'L’appel (7 points)', genre: 'question', texte: 'Ce qu’il faut dire à Mme Benali',
      rep: 'Se présenter et vérifier qu’on parle à la bonne personne · demander l’étage, l’ascenseur ET la largeur de l’escalier · fixer le créneau du matin (mardi 16 mars, 8 h à 12 h) '
        + '· la reprise : l’ancien canapé oui, s’il est démonté ; la chaise non (même nature que le produit acheté, art. 14.2.2) · ne pas promettre de monter l’armoire en « devant chez vous » '
        + '· la lampe part en Point Relais.',
      note: 'Guidage : une réplique maladroite fait réagir Mme Benali, l’élève recommence ; la première réponse à chaque réplique est jugée. Accès 3 · créneau et reprise 2 · rien de faux promis 2.' },
    { etape: 2, etapeTitre: 'Le mode de livraison (8 points)', genre: 'question', texte: 'Un mode et ce qui le décide, par article',
      rep: ARTICLES.map((a) => `${a.lib} → ${lib(MODES, a.mode)} (${lib(RAISONS, a.raison).toLowerCase()})`).join(' · '),
      note: '2 points par article (mode ET raison justes), 2 points pour le prix. Le prix se calcule sur le montant des meubles (armoire + canapé), sans la lampe : tarif « dans la pièce » + Point Relais.' },
    { etape: 3, etapeTitre: 'Le message (2 points)', genre: 'question', texte: 'Les phrases justes',
      rep: 'Salutation « Bonjour Madame Benali, » · le créneau du matin · les meubles dans la pièce et la lampe au Point Relais · le prix de SA livraison · la reprise du canapé (pas de la chaise) '
        + '· le rappel : prévenir 72 heures avant · fin « Cordialement, … ».',
      note: 'Date, mode, prix, reprise et rappel : 1 point si les cinq lignes sont justes. La salutation et la fin comptent dans le ton (1 point avec l’appel).' },
    { etape: 4, etapeTitre: 'Les questions (3 points)', genre: 'question', texte: 'Quatre questions notées au fil du travail',
      rep: 'Pourquoi l’étage compte (deux livreurs, plus de temps) · la vieille chaise (non : même nature) · pourquoi pas le Point Relais pour l’armoire (chaque colis dépasse 19 kg) · l’économie d’un membre (25 €).',
      note: 'Corrigées tout de suite. « Avant de commencer » (trois questions tirées) n’est pas noté.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  const graine = graineDeBase(db) || String(uid || 'anonyme');
  if (!ouvert) db = { tirage: { graine }, tirages: { [ID]: { graine: `${graine}|${ID}`, ...TIRAGE.tirer(`${graine}|${ID}`) } } };
  const S = situationDe(db);
  const items = [
    { genre: 'fait', texte: 'Sa commande', rep: `armoire en 3 colis de ${S.kg.join(', ')} kg (${S.kgArmoire} kg) à ${euros(S.armoire)} · canapé à ${euros(S.canape)} · cliente ${S.membre ? 'membre' : 'non membre'}` },
    { genre: 'fait', texte: 'Le créneau', rep: CRENEAUX.find((c) => c.v === CRENEAU_JUSTE).lib },
    { genre: 'fait', texte: 'Le prix de la lampe (Point Relais)', rep: euros(S.relais) },
    { genre: 'fait', texte: `Le prix des meubles (« dans la pièce », commande de ${euros(S.meubles)})`, rep: euros(S.piece) },
    { genre: 'fait', texte: 'Le prix total à écrire', rep: euros(S.total) },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
