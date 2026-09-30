// SCE-1 — Les Brasseries du Gâtinais.
// Scénario repris tel quel de la Suite Logistique (module EC-1) : le travail se fait
// sur le Padlet, la note est saisie par l'enseignant dans « Suivi de classe ».

import { creerLien } from '../core/types/lien.js';

export const meta = {
  id: 'brasseries-gatinais',
  code: 'SCE-1',
  titre: 'Les Brasseries du Gâtinais',
  desc: 'Palettisation, mise en stock et adressage — scénario complet noté.',
  rubrique: 'scenario',
  competences: [],
  bareme: 20,
  notation: 'prof',
  portee: 'eleve',
  pret: true,
};

const moteur = creerLien({
  url: 'https://padlet.com/morintristan1/scenario-les-brasseries-du-gatinais-u8yjywfuo31t22cg',
  service: 'le Padlet',
  objectif: 'Palettisation, mise en stock et adressage',
  consigne: "Tout le travail se fait sur le Padlet. Lisez le dossier, puis répondez dans l'ordre.",
  etapes: [
    'Calculer le poids et la hauteur des trois palettes.',
    'Déterminer, pour chacune, dans quelle travée elle peut être stockée.',
    'Répondre aux questions du dossier.',
  ],
  rendu: 'Déposez vos réponses sur le Padlet avant la fin de la séance.',
});

export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
