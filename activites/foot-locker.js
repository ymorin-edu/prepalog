// SCE-2 — Foot Locker. Scénario repris de la Suite Logistique (module EC-4).
//
// Consignes et rendu attendu : sur le Padlet. Rien à dupliquer ici.

import { creerLien } from '../core/types/lien.js';

export const meta = {
  id: 'foot-locker',
  code: 'SCE-2',
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
  objectif: 'Étude de cas logistique dans l\'univers Foot Locker',
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
