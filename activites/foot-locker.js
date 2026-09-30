// SCE-4 — Foot Locker. Scénario repris de la Suite Logistique (module EC-4).

import { creerLien } from '../core/types/lien.js';

export const meta = {
  id: 'foot-locker',
  code: 'SCE-4',
  titre: 'Foot Locker',
  desc: 'Scénario logistique complet, noté.',
  rubrique: 'scenario',
  competences: [],
  bareme: 20,
  notation: 'prof',
  portee: 'eleve',
  pret: true,
};

const moteur = creerLien({
  url: 'https://padlet.com/morintristan1/scenario-foot-locker-ass6vye6bs4mniqm',
  service: 'le Padlet',
  objectif: "Étude de cas logistique dans l'univers Foot Locker",
  consigne: 'Tout le travail se fait sur le Padlet.',
  rendu: 'Déposez vos réponses sur le Padlet avant la fin de la séance.',
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
