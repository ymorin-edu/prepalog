// SCE-4 — Les Brasseries du Gâtinais. Scénario repris de la Suite Logistique (EC-1).
//
// Consignes et rendu attendu : sur le Padlet. Rien à dupliquer ici.

import { creerLien } from '../core/types/lien.js';

export const meta = {
  id: 'brasseries-gatinais',
  code: 'SCE-4',
  titre: 'Les Brasseries du Gâtinais',
  desc: 'Palettisation, mise en stock et adressage — scénario complet noté.',
  rubrique: 'scenario',
  // Compétences et temps pédagogique : voir core/competences.js (validé par Tristan, 02/10/2026).
  competences: ['C1.5'],
  temps: 'guidage',
  bareme: 20,
  notation: 'prof',
  portee: 'eleve',
  pret: true,
};

const moteur = creerLien({
  url: 'https://padlet.com/morintristan1/scenario-les-brasseries-du-gatinais-u8yjywfuo31t22cg',
  service: 'le Padlet',
  objectif: 'Palettisation, mise en stock et adressage',
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
