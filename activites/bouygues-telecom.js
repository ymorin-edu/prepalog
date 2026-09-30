// SCE-5 — Bouygues Telecom. Scénario repris de la Suite Logistique (module EC-5).
// Seul scénario porté par un Digipad et non un Padlet.

import { creerLien } from '../core/types/lien.js';

export const meta = {
  id: 'bouygues-telecom',
  code: 'SCE-5',
  titre: 'Bouygues Telecom',
  desc: 'Scénario logistique complet, noté.',
  rubrique: 'scenario',
  competences: [],
  bareme: 20,
  notation: 'prof',
  portee: 'eleve',
  pret: true,
};

const moteur = creerLien({
  url: 'https://digipad.app/p/1892506/268c962733fa98',
  service: 'le Digipad',
  objectif: "Étude de cas logistique dans l'univers Bouygues Telecom",
  consigne: 'Tout le travail se fait sur le Digipad.',
  rendu: 'Déposez vos réponses sur le Digipad avant la fin de la séance.',
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
