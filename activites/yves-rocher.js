// SCE-2 — Yves Rocher. Scénario repris de la Suite Logistique (module EC-2).

import { creerLien } from '../core/types/lien.js';

export const meta = {
  id: 'yves-rocher',
  code: 'SCE-2',
  titre: 'Yves Rocher',
  desc: 'Contrôle des stocks — scénario complet noté.',
  rubrique: 'scenario',
  competences: [],
  bareme: 20,
  notation: 'prof',
  portee: 'eleve',
  pret: true,
};

const moteur = creerLien({
  url: 'https://padlet.com/morintristan1/scenario-yves-rocher-dhw8plzoaanxoo05',
  service: 'le Padlet',
  objectif: 'Contrôle des stocks',
  consigne: "Étude de cas sur le contrôle des stocks dans l'univers Yves Rocher. Tout le travail se fait sur le Padlet.",
  rendu: 'Déposez vos réponses sur le Padlet avant la fin de la séance.',
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
