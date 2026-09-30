// SCE-5 — Réception plateforme logistique. Scénario repris de la Suite Logistique (EC-3).
//
// Consignes et rendu attendu : sur le Padlet. Rien à dupliquer ici.

import { creerLien } from '../core/types/lien.js';

export const meta = {
  id: 'reception-plateforme',
  code: 'SCE-5',
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
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
