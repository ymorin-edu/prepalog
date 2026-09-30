// SCE-1 — Yves Rocher. Scénario repris de la Suite Logistique (module EC-2).
//
// Consignes et rendu attendu : sur le Padlet. Rien à dupliquer ici.

import { creerLien } from '../core/types/lien.js';

export const meta = {
  id: 'yves-rocher',
  code: 'SCE-1',
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
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
