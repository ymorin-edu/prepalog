// Données d'ESSAI du terminal de préparation (chantier D-7, lot 1, 12/10/2026) : les lignes du brief ENT-6.7 §4 étape 1,
// recopiées pour la page `outils/essai-terminal.html` et le bloc de tests `entrepot`. La séance aura les siennes, calculées
// depuis son plan de picking (lot 3) : rien ici n'est lu par la séance.

export const MOTS = [
  { id: 'manquant', lib: 'Manquant', combien: true },
  { id: 'abime', lib: 'Abîmé', combien: true },
  { id: 'vide', lib: 'Emplacement vide' },
];

export const LIGNES = [
  { id: 'L1', lieu: 'Côté A, travée 01, niveau 1.', code: '36', prends: 3, pose: 'Pose tes casiers.',
    question: 'Eau minérale, casier de douze bouteilles. Prends 3.' },
  { id: 'L2', lieu: 'Côté A, travée 02, niveau 1.', code: '24', prends: 2, pose: 'Pose tes fûts.',
    question: 'Pelforth Blonde, vingt litres. Prends 2.' },
  { id: 'L3', lieu: 'Côté A, travée 03, niveau 1.', code: '49', prends: 2, pose: 'Pose tes fûts.',
    question: 'Affligem Blonde, vingt litres, lot S18. Prends 2.',
    remplacement: { id: 'L4', lieu: 'Côté B, travée 03, niveau 1.', code: '83', pose: 'Pose tes fûts.',
      question: (n) => `Affligem Blonde, vingt litres, lot S24. Prends ${n}.` } },
  { id: 'L5', lieu: 'Côté A, travée 04, niveau 1.', code: '17', prends: 6, pose: 'Pose tes fûts.',
    question: 'Heineken, trente litres. Prends 6.' },
];

export const TEXTES = {
  fin: 'Commande terminée : La Cabane à Malo. Filme et étiquette tes palettes.',
  codeFaux: 'Code faux. Vérifie l’emplacement.',
};

export const PHRASE_BILAN = 'Chaque réponse au terminal est enregistrée avec son heure. C’est ainsi que l’entreprise mesure la productivité des préparateurs.';
