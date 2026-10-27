// Corrigé d'ENT-16.3 (Royal Canin, « présenter les indicateurs à la réunion »), onglet « Corrigés » de l'enseignant. Valeurs tirées par élève : `corrigeEleve`.
// La note de l'oral est celle de l'enseignant (grille ci-dessous) ; le site ne donne qu'une note de préparation, remplacée dès que l'enseignant saisit la sienne.
import { T163 } from '../royal-canin-tableur.js';
import { GRILLE } from '../royal-canin-ent163.js';
import { corrigeTableurEleve } from '../royal-canin-corrige.js';
import { OBJECTIF_COUVERTURE, JOURS } from '../royal-canin-donnees.js';
export const CORRIGE = {
  code: 'ENT-16.3',
  titre: 'Royal Canin — présenter les indicateurs à la réunion',
  trame: '(pas de trame : l’écran, le tableur, puis le support de l’élève)',
  items: [
    { etape: 1, etapeTitre: 'Les chiffres de décembre (9 points de préparation)', genre: 'question', texte: 'Le fichier déposé',
      rep: `Stock moyen =(début+fin)/2 · Rotation =sorties/stock moyen · Conso par jour =sorties/${JOURS} · Couverture =stock fin/conso · Alerte =SI(couverture<délai;"Rupture";SI(couverture>${OBJECTIF_COUVERTURE};"Surstock";"OK")) · taux de service au format %.`,
      note: 'Retour détaillé et redépôt illimité : l’élève présente des chiffres justes.' },
    { etape: 2, etapeTitre: 'Le plan des diapos (7 points de préparation)', genre: 'question', texte: 'Titre, graphique, décisions',
      rep: 'Un titre qui dit le message (le nombre de ruptures et de surstocks, le taux de service) · un graphique en barres couverture / délai des références en alerte · avancer d’abord la rupture la plus urgente (le plus de jours manquants), retarder les surstocks.',
      note: 'Les phrases sont calculées sur le mois de l’élève (voir son corrigé).' },
    { etape: 3, etapeTitre: 'Les questions notées (4 points de préparation)', genre: 'question', texte: 'Quatre questions au fil',
      rep: 'Un titre dit ce qu’il faut retenir · peu de texte sur une diapo · une rupture = un stock qui tient moins que le délai · ne pas publier des informations internes (Code du travail, art. L1222-1, bonne foi → loyauté et discrétion).',
      note: '« Avant de commencer » n’est pas noté.' },
    { etape: 4, etapeTitre: 'L’oral : la note de l’enseignant (sur 20)', genre: 'question', texte: 'La grille, remise à l’élève avec la consigne',
      rep: GRILLE.map(([c, p, t]) => `${c} (${p}) : ${t}`).join(' · '),
      note: 'Saisir la note dans le Suivi (colonne ENT-16.3) : elle remplace la note de préparation.' },
  ],
};
export const corrigeEleve = (base) => corrigeTableurEleve(T163, base);
