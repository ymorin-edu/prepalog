// Univers d'ESSAI de la vue « Bord de ligne » (core/types/ligne.js) — 27/10/2026, brief `docs/briefs/MOTEUR-vue-bord-de-ligne.md`.
//
// Le bloc de tests `outils/test/ligne.mjs` monte le vrai moteur d'entreprise sur cette déclaration : la matinée de la page d'essai du
// 26/10/2026 (`docs/briefs/stellantis/maquette-bord-de-ligne.html`), recopiée ici pour que les tests ne bougent pas quand une séance
// change ses postes. Tout est construit (postes, quantités, poids, délais, camion).

import { univers } from './essai-animation.js';
import { etapesLigne } from '../core/types/ligne.js';

export const POSTES_ESSAI = [
  { id: 'roue', poste: 'Poste 1', zone: 'roues', nom: 'Roues complètes', piece: 'roue', contenant: 'palette', par: 28, kg: 560, besoin: { 3008: 4, 5008: 4 }, depart: [12, 28], stock: 20 },
  { id: 'retro', poste: 'Poste 2', zone: 'portes', nom: 'Rétroviseurs', piece: 'retro', contenant: 'bac', par: 30, kg: 60, besoin: { 3008: 2, 5008: 2 }, depart: [20, 30], stock: 10 },
  { id: 'pdb', poste: 'Poste 3', zone: 'habitacle', nom: 'Planches de bord', piece: 'pdb', contenant: 'rack', par: 10, kg: 520, besoin: { 3008: 1, 5008: 1 }, depart: [6, 10], stock: 3 },
  { id: 'siege', poste: 'Poste 4', zone: 'sièges', nom: 'Sièges du 3e rang', piece: 'siege', contenant: 'rack', par: 6, kg: 300, besoin: { 3008: 0, 5008: 1 }, depart: [3, 6], stock: 5 },
];
export const SEQUENCE_ESSAI = ['3008', '3008', '5008', '3008', '3008', '3008', '5008', '3008', '3008', '5008'];
export const CAMION_ESSAI = {
  poste: 'pdb', annonce: '06:20', prevu: '06:30', arrivee: '07:15', contenants: 8, secours: '06:38', de: 'Karim',
  decisions: [
    { v: 'secours', lib: 'Demander un convoi de secours à l’équipementier et prévenir la cheffe d’atelier du montage', juste: true, secours: true, retour: 'Karim : « Je préviens l’atelier. Le convoi part. »' },
    { v: 'attendre', lib: 'Attendre le camion : il arrivera bien', retour: 'Karim : « D’accord… On croise les doigts. »' },
    { v: 'vider', lib: 'Envoyer tout de suite les racks du transstockeur au bord de ligne', retour: 'Karim : « Le bord de ligne n’a que deux places par poste : ça ne change rien au total. »' },
  ],
};

// `temps` : le temps de la matinée ; `camion` : avec le camion en retard ; `minutes` : la durée.
export function ligneEssai({ temps = 'guidage', camion = false, minutes = 90 } = {}) {
  return JSON.parse(JSON.stringify({
    id: 'essai-ligne', libelle: 'Bord de ligne', lieu: 'Montage d’essai · ligne 3008 / 5008', titre: 'Matinée d’essai',
    qui: { prenom: 'Karim', poste: 'chef d’équipe logistique' },
    temps, debut: '06:00', minutes,
    modeles: [{ id: '3008' }, { id: '5008', long: true }], sequence: SEQUENCE_ESSAI,
    postes: POSTES_ESSAI.map((p) => (camion ? p : { ...p, stock: p.id === 'pdb' ? 12 : p.stock })),
    robots: { nombre: 2, places: 2, kgMax: 1000, trajet: 5, retour: 1, urgent: 3, urgents: 2 },
    personnes: 1200,
    ...(camion ? { camion: CAMION_ESSAI } : {}),
    fin: 'Fin de la matinée : l’équipe d’après-midi prend le relais.',
  }));
}

export function universLigne(D = ligneEssai(), { copie = false, seance = 'essai-ligne' } = {}) {
  return Object.assign(univers(), { ligne: D, animations: [], etapes: etapesLigne(D, seance, { copie }), copie, menu: [],
    ENTREPRISE: { id: 'essai-ligne', nom: 'Essai du bord de ligne', sousTitre: 'Bord de ligne', exercice: 'Essai du bord de ligne' } });
}
