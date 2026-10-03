// Réglages propres à un élève, posés par l'enseignant (brief MOTEUR-tiers-temps, 03/10/2026).
//
// Deux réglages indépendants, rangés dans le profil de l'élève :
//   - `aisance` : 'standard' (défaut) ou 'confirme'. Un élève confirmé peut recevoir des jeux
//     de données plus complets (règle de Tristan : +30 % en guidage et entraînement, +50 % en
//     bonus). Le moteur ne grossit RIEN de lui-même : seule une séance qui le prévoit dans son
//     contenu lit `ctx.aisance`. Une séance qui ne le lit pas reste identique pour tous.
//     Le nom `aisance` évite toute confusion avec le niveau de CLASSE du groupe (`niveauGroupe`).
//   - `tiersTemps` : booléen. Une épreuve chronométrée multiplie ses seuils de temps par 4/3.
//     C'est un aménagement (PAP, PPS) : donnée de santé indirecte. Il ne s'affiche qu'à
//     l'élève concerné et dans l'onglet « Comptes élèves » de l'enseignant, jamais dans une vue
//     de classe projetable, et il n'est pas exporté.
//
// Seul l'enseignant écrit ces champs : les règles Firestore refusent qu'un élève les change sur
// son propre profil. Un champ absent vaut le défaut (standard, pas de tiers-temps).
// D'autres aménagements (police agrandie, lecture audio) pourront s'ajouter ici plus tard.

export const AISANCES = [
  { id: 'standard', label: 'Standard' },
  { id: 'confirme', label: 'Confirmé' },
];

export const CHAMPS_AMENAGEMENTS = ['aisance', 'tiersTemps'];

// Les réglages d'un profil, toujours complets et toujours valides.
export function amenagements(profil) {
  return {
    aisance: profil && profil.aisance === 'confirme' ? 'confirme' : 'standard',
    tiersTemps: !!(profil && profil.tiersTemps === true),
  };
}

// Ne laisse passer que les deux champs, avec des valeurs valides.
export function filtrerAmenagements(patch) {
  const p = {};
  if (patch && 'aisance' in patch) p.aisance = patch.aisance === 'confirme' ? 'confirme' : 'standard';
  if (patch && 'tiersTemps' in patch) p.tiersTemps = patch.tiersTemps === true;
  return p;
}
