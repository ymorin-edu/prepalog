// Univers d'ESSAI de la vue « Tri des colis » (core/types/tri.js) — 26/10/2026, brief `docs/briefs/MOTEUR-vue-tri.md`.
//
// Le bloc de tests `outils/test/tri.mjs` monte le vrai moteur d'entreprise sur cette déclaration : la série de la page d'essai v4
// validée par Tristan (`docs/briefs/mondial-relay/maquette-tri-colis.html`), recopiée ici pour que les tests ne bougent pas quand
// une séance change ses colis. Communes et codes postaux réels de l'Aube ; tournées, commerces et numéros construits.

import { univers } from './essai-animation.js';
import { etapesTri } from '../core/types/tri.js';

export const SORTIES_ESSAI = [
  { id: 'T1', nom: 'Troyes', communes: [['Troyes', '10000']] },
  { id: 'T2', nom: 'Agglo ouest', communes: [['Sainte-Savine', '10300'], ['La Chapelle-Saint-Luc', '10600'], ['Saint-André-les-Vergers', '10120'], ['Rosières-près-Troyes', '10430'], ['Pont-Sainte-Marie', '10150']] },
  { id: 'T3', nom: 'Sud', communes: [['Saint-Julien-les-Villas', '10800'], ['Buchères', '10800'], ['Bréviandes', '10450'], ['Bar-sur-Seine', '10110'], ['Chaource', '10210'], ['Les Riceys', '10340']] },
  { id: 'T4', nom: 'Nord-ouest', communes: [['Romilly-sur-Seine', '10100'], ['Nogent-sur-Seine', '10400'], ['Arcis-sur-Aube', '10700']] },
  { id: 'T5', nom: 'Est', communes: [['Bar-sur-Aube', '10200'], ['Vendeuvre-sur-Barse', '10140'], ['Brienne-le-Château', '10500']] },
];
// La série de la page d'essai : 12 colis, 3 pièges, 4 à écarter (un par motif).
export const COLIS_ESSAI = [
  { n: 'MR 4417 2093', commune: 'Troyes', relais: 'Tabac de la Vienne', rue: '12 rue de la Cité', kg: 2.4, dim: [40, 30, 20] },
  { n: 'MR 4417 2108', commune: 'Saint-Julien-les-Villas', relais: 'Fleurs du Moulin', rue: '3 avenue Jean-Jaurès', kg: 1.1, dim: [30, 20, 10], piege: 'Ne pas confondre avec Saint-André-les-Vergers (T2).' },
  { n: 'MR 4417 2115', commune: 'Romilly-sur-Seine', relais: 'Épicerie Gambetta', rue: '48 rue Gambetta', kg: 31.6, dim: [60, 40, 40], anomalie: 'poids', geste: 'lourd' },
  { n: 'MR 4417 2122', commune: 'Sainte-Savine', relais: 'Pressing Lafayette', rue: '7 rue Lafayette', kg: 0.8, dim: [25, 20, 5] },
  { n: 'MR 4417 2139', commune: 'Bar-sur-Aube', relais: 'Librairie des Tanneurs', rue: '21 rue des Tanneurs', kg: 4.0, dim: [45, 35, 25], piege: 'Bar-sur-Aube (T5), pas Bar-sur-Seine (T3).' },
  { n: 'MR 4417 2146', commune: 'Bréviandes', relais: 'Boulangerie du Pont', rue: '2 place du Pont', kg: 3.2, dim: [50, 30, 30], etat: 'ouvert', anomalie: 'carton' },
  { n: 'MR 4417 2153', commune: 'Nogent-sur-Seine', relais: 'Bazar de la Halle', rue: '15 place de la Halle', kg: 6.5, dim: [55, 40, 30] },
  { n: 'MR 4417 2160', commune: 'Saint-André-les-Vergers', relais: 'Cordonnerie Hennequin', rue: '9 rue Hennequin', kg: 1.9, dim: [35, 25, 15], piege: 'Saint-André-les-Vergers est en T2.' },
  { n: 'MR 4417 2177', commune: 'Brienne-le-Château', relais: 'Café de la Gare', rue: '1 avenue de la Gare', kg: 12.3, dim: [130, 15, 10], anomalie: 'taille' },
  { n: 'MR 4417 2184', commune: 'Bar-sur-Seine', relais: 'Quincaillerie Régnier', rue: '30 Grande Rue', kg: 8.0, dim: [60, 40, 30], etat: 'enfonce', geste: 'enfonce' },
  { n: 'MR 4417 2191', commune: 'Pont-Sainte-Marie', relais: 'Presse des Marots', rue: '5 rue des Marots', kg: 0.6, dim: [20, 15, 5] },
  { n: 'MR 4417 2207', commune: 'Les Riceys', relais: 'Cave des Riceys', rue: '11 rue du Pressoir', kg: 9.9, dim: [50, 35, 35], etat: 'floue', anomalie: 'etiquette' },
];
const REGLES_ESSAI = { poidsMax: 30, longueurMax: 120, sommeMax: 150, source: 'Règles de poids et de taille : conditions de vente Mondial Relay pour un Point Relais (art. 2.1, janvier 2026).' };

// `temps` : le temps de la série unique ; `deux` : une série guidée puis une série d'entraînement (les 4 premiers colis).
export function triEssai({ temps = 'guidage', deux = false, secondes = 20 } = {}) {
  const serie = (id, t, colis) => ({ id, titre: id === 's1' ? 'Série 1' : 'Série 2', temps: t, ...(t !== 'guidage' ? { secondes } : {}), colis });
  return JSON.parse(JSON.stringify({
    id: 'essai-tri', libelle: 'Ligne de tri', lieu: 'Hub d’essai · ligne de tri des départs agence',
    qui: { prenom: 'Romain', poste: 'chef d’équipe' },
    sorties: SORTIES_ESSAI, regles: REGLES_ESSAI,
    series: deux ? [serie('s1', 'guidage', COLIS_ESSAI), serie('s2', 'entrainement', COLIS_ESSAI.slice(0, 4).map((c) => ({ ...c, geste: undefined })))]
      : [serie('s1', temps, COLIS_ESSAI)],
    fin: 'Fin de la nuit : les camions partent à 6 h.',
  }));
}

export function universTri(D = triEssai(), { copie = false, seance = 'essai-tri' } = {}) {
  return Object.assign(univers(), { tri: D, animations: [], etapes: etapesTri(D, seance, { copie }), copie, menu: [],
    ENTREPRISE: { id: 'essai-tri-colis', nom: 'Essai du tri des colis', sousTitre: 'Ligne de tri', exercice: 'Essai du tri des colis' } });
}
