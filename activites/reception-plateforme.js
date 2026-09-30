// SCE-3 — Réception plateforme logistique. Scénario repris de la Suite Logistique (EC-3).

import { creerLien } from '../core/types/lien.js';

export const meta = {
  id: 'reception-plateforme',
  code: 'SCE-3',
  titre: 'Réception sur plateforme logistique',
  desc: 'Gérer la réception de marchandise sur une plateforme — scénario complet noté.',
  rubrique: 'scenario',
  competences: [],
  bareme: 20,
  notation: 'prof',
  portee: 'eleve',
  pret: true,
};

const moteur = creerLien({
  url: 'https://padlet.com/morintristan1/gerer-la-reception-de-marchandise-sur-la-plateforme-logistiq-swoji8nns1v2zorv',
  service: 'le Padlet',
  objectif: 'Gérer la réception de marchandise sur une plateforme logistique',
  consigne: 'Tout le travail se fait sur le Padlet : dossier, documents de réception et questions.',
  rendu: 'Déposez vos réponses sur le Padlet avant la fin de la séance.',
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
