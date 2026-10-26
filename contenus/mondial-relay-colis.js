// Mondial Relay (2de, scénario S3) — les COLIS de la ligne de tri, communs à ENT-11.2 (première nuit au tri) et ENT-11.3
// (évaluation du tri). Vue « Tri des colis » : `core/types/tri.js` (format, bon tri CALCULÉ, jamais écrit).
//
// Réels : les communes de l'Aube et leurs codes postaux ; les règles du colis (30 kg, 120 cm, 150 cm : conditions de vente,
// offre Start, 07/01/2026, art. 2.1). Construits : les tournées (le plan de tri), les commerces Points Relais et leurs adresses,
// les numéros de colis, les poids et les dimensions. `anomalie`, quand il est écrit, n'est qu'un CONTRÔLE : la vue refuse le
// colis si ses mesures disent autre chose.
//
// Le tirage d'une série (`tirerSerie`) est une fonction PURE de la graine : changer la banque ou le code change la série des
// élèves (ne rien y toucher entre l'ouverture d'une évaluation et le ramassage).

import { TOURNEES, REGLES_COLIS, SOURCE_CGV, FIL_ROUGE } from './mondial-relay.js';
import { hasard } from '../core/tirage.js';
import { bonTri, compositionSerie } from '../core/types/tri.js';

// Le plan de tri de l'agence (les tournées du lendemain) et les règles du poste.
export const SORTIES = TOURNEES.map((t) => ({ id: t.id, nom: t.nom, communes: t.communes }));
export const REGLES = {
  poidsMax: REGLES_COLIS.relais.poidsMax, longueurMax: REGLES_COLIS.relais.longueurMax, sommeMax: REGLES_COLIS.relais.sommeMax,
  source: `Règles de poids et de taille : ${SOURCE_CGV}, art. 2.1 (Point Relais).`,
};
export const ECART = { libelle: 'À l’écart', sous: 'expertise' };

// Le colis d'Inès (fil rouge) : la lampe en céramique, carton enfoncé dans un coin mais FERMÉ : il part (en T3).
export const COLIS_INES = { n: FIL_ROUGE.colis, commune: FIL_ROUGE.destination.commune, relais: FIL_ROUGE.destination.relais,
  rue: '30 Grande Rue', kg: 3.2, dim: [40, 30, 30], etat: 'enfonce', geste: 'ines' };

// ─────────────────────────────────────────── la série 1 d'ENT-11.2 (la page d'essai validée par Tristan, puis le colis d'Inès)
export const SERIE_GUIDEE = [
  { n: 'MR 4417 2093', commune: 'Troyes', relais: 'Tabac de la Vienne', rue: '12 rue de la Cité', kg: 2.4, dim: [40, 30, 20] },
  { n: 'MR 4417 2108', commune: 'Saint-Julien-les-Villas', relais: 'Fleurs du Moulin', rue: '3 avenue Jean-Jaurès', kg: 1.1, dim: [30, 20, 10],
    piege: 'Saint-Julien-les-Villas (10800) est en T3 ; ne la confonds pas avec Saint-André-les-Vergers (10120), en T2.' },
  { n: 'MR 4417 2115', commune: 'Romilly-sur-Seine', relais: 'Épicerie Gambetta', rue: '48 rue Gambetta', kg: 31.6, dim: [60, 40, 40], anomalie: 'poids', geste: 'lourd' },
  { n: 'MR 4417 2122', commune: 'Sainte-Savine', relais: 'Pressing Lafayette', rue: '7 rue Lafayette', kg: 0.8, dim: [25, 20, 5] },
  { n: 'MR 4417 2139', commune: 'Bar-sur-Aube', relais: 'Librairie des Tanneurs', rue: '21 rue des Tanneurs', kg: 4.0, dim: [45, 35, 25], geste: 'bar',
    piege: 'Bar-sur-Aube (10200) est en T5 ; Bar-sur-Seine (10110) est en T3. Le code postal tranche.' },
  { n: 'MR 4417 2146', commune: 'Bréviandes', relais: 'Boulangerie du Pont', rue: '2 place du Pont', kg: 3.2, dim: [50, 30, 30], etat: 'ouvert', anomalie: 'carton' },
  { n: 'MR 4417 2153', commune: 'Nogent-sur-Seine', relais: 'Bazar de la Halle', rue: '15 place de la Halle', kg: 6.5, dim: [55, 40, 30] },
  { n: 'MR 4417 2160', commune: 'Saint-André-les-Vergers', relais: 'Cordonnerie Hennequin', rue: '9 rue Hennequin', kg: 1.9, dim: [35, 25, 15],
    piege: 'Saint-André-les-Vergers (10120) est en T2 ; Saint-Julien-les-Villas (10800) est en T3.' },
  { n: 'MR 4417 2177', commune: 'Brienne-le-Château', relais: 'Café de la Gare', rue: '1 avenue de la Gare', kg: 12.3, dim: [130, 15, 10], anomalie: 'taille' },
  { n: 'MR 4417 2186', commune: 'Chaource', relais: 'Tabac du Centre', rue: '4 place de l’Église', kg: 7.5, dim: [60, 40, 30] },
  { n: 'MR 4417 2191', commune: 'Pont-Sainte-Marie', relais: 'Presse des Marots', rue: '5 rue des Marots', kg: 0.6, dim: [20, 15, 5] },
  { n: 'MR 4417 2207', commune: 'Les Riceys', relais: 'Cave des Riceys', rue: '11 rue du Pressoir', kg: 9.9, dim: [50, 35, 35], etat: 'floue', anomalie: 'etiquette' },
  COLIS_INES,
];

// ─────────────────────────────────────────── la banque des séries tirées
const c = (n, commune, relais, rue, kg, dim, o = {}) => ({ n: `MR 4418 ${n}`, commune, relais, rue, kg, dim, ...o });
// En règle, sans piège.
export const ORDINAIRES = [
  c('3011', 'Troyes', 'Boulangerie de la Paix', '8 rue de la Paix', 1.8, [35, 25, 15]),
  c('3028', 'Troyes', 'Pressing des Halles', '3 place des Halles', 0.9, [30, 20, 8]),
  c('3035', 'Troyes', 'Tabac du Marché', '14 rue du Marché', 5.4, [50, 35, 30]),
  c('3042', 'Troyes', 'Épicerie du Quai', '40 quai des Comtes', 2.7, [40, 30, 25]),
  c('3059', 'Sainte-Savine', 'Fleurs de la Mairie', '2 place de la Mairie', 3.1, [45, 30, 20]),
  c('3066', 'Sainte-Savine', 'Tabac de la Gare', '19 avenue de la Gare', 0.7, [25, 18, 6]),
  c('3073', 'La Chapelle-Saint-Luc', 'Supérette des Marronniers', '6 rue des Marronniers', 4.6, [50, 40, 20]),
  c('3080', 'La Chapelle-Saint-Luc', 'Presse de l’Écluse', '11 rue de l’Écluse', 1.2, [30, 25, 10]),
  c('3097', 'Pont-Sainte-Marie', 'Quincaillerie du Pont', '27 rue du Pont', 8.8, [60, 40, 35]),
  c('3103', 'Buchères', 'Boulangerie de l’Église', '1 rue de l’Église', 2.2, [40, 30, 15]),
  c('3110', 'Bréviandes', 'Pharmacie des Tilleuls', '5 rue des Tilleuls', 0.5, [20, 15, 10]),
  c('3127', 'Chaource', 'Fromagerie du Bourg', '9 Grande Rue', 6.1, [45, 35, 30]),
  c('3134', 'Chaource', 'Presse du Lavoir', '3 rue du Lavoir', 1.4, [35, 25, 10]),
  c('3141', 'Les Riceys', 'Épicerie des Vignes', '16 rue des Vignes', 11.0, [60, 40, 40]),
  c('3158', 'Romilly-sur-Seine', 'Bazar du Marché', '33 rue du Marché', 3.9, [45, 35, 25]),
  c('3165', 'Romilly-sur-Seine', 'Tabac de la Seine', '2 quai de la Seine', 0.8, [25, 20, 5]),
  c('3172', 'Nogent-sur-Seine', 'Librairie du Port', '12 rue du Port', 2.5, [40, 30, 20]),
  c('3189', 'Nogent-sur-Seine', 'Cave de l’Île', '7 rue de l’Île', 14.2, [55, 40, 40]),
  c('3196', 'Vendeuvre-sur-Barse', 'Tabac du Château', '4 place du Château', 1.6, [30, 25, 15]),
  c('3202', 'Vendeuvre-sur-Barse', 'Droguerie des Forges', '18 rue des Forges', 7.3, [50, 40, 30]),
  c('3219', 'Brienne-le-Château', 'Presse de l’École', '10 rue de l’École', 0.9, [30, 20, 10]),
];
// En règle, à PIÈGE de lecture (deux communes qui se ressemblent) : le texte est le retour du guidage.
const P_JULIEN = 'Saint-Julien-les-Villas (10800) est en T3 ; Saint-André-les-Vergers (10120) est en T2.';
const P_BAR = 'Bar-sur-Aube (10200) est en T5 ; Bar-sur-Seine (10110) est en T3. Le code postal tranche.';
const P_ROSIERES = 'Rosières-près-Troyes (10430) n’est pas Troyes : elle est en T2.';
const P_ARCIS = 'Arcis-sur-Aube (10700) est en T4 ; ne la confonds pas avec Bar-sur-Aube (T5).';
export const PIEGES = [
  c('4015', 'Saint-Julien-les-Villas', 'Boulangerie Jean-Jaurès', '22 avenue Jean-Jaurès', 2.1, [40, 30, 15], { piege: P_JULIEN }),
  c('4022', 'Saint-Julien-les-Villas', 'Pressing du Moulin', '6 rue du Moulin', 0.6, [25, 20, 5], { piege: P_JULIEN }),
  c('4039', 'Saint-André-les-Vergers', 'Tabac des Vergers', '14 rue des Vergers', 1.3, [30, 25, 10], { piege: P_JULIEN }),
  c('4046', 'Saint-André-les-Vergers', 'Fleurs de l’Avenue', '31 avenue Maréchal-Leclerc', 4.4, [50, 30, 30], { piege: P_JULIEN }),
  c('4053', 'Bar-sur-Aube', 'Presse de la Halle', '8 rue de la Halle', 0.9, [30, 20, 10], { piege: P_BAR }),
  c('4060', 'Bar-sur-Aube', 'Épicerie Saint-Pierre', '2 place Saint-Pierre', 6.7, [55, 35, 30], { piege: P_BAR }),
  c('4077', 'Bar-sur-Seine', 'Boulangerie du Pont-Neuf', '5 rue du Pont-Neuf', 1.7, [35, 25, 20], { piege: P_BAR }),
  c('4084', 'Bar-sur-Seine', 'Tabac de la Grande Rue', '44 Grande Rue', 3.3, [45, 30, 20], { piege: P_BAR }),
  c('4091', 'Rosières-près-Troyes', 'Supérette des Écoles', '3 rue des Écoles', 2.9, [40, 30, 25], { piege: P_ROSIERES }),
  c('4107', 'Rosières-près-Troyes', 'Presse du Stade', '12 rue du Stade', 0.4, [20, 15, 5], { piege: P_ROSIERES }),
  c('4114', 'Arcis-sur-Aube', 'Librairie du Pont', '9 rue du Pont', 1.1, [30, 25, 10], { piege: P_ARCIS }),
  c('4121', 'Arcis-sur-Aube', 'Bazar de la Place', '1 place de la République', 5.8, [50, 40, 25], { piege: P_ARCIS }),
];
// À ÉCARTER, une anomalie chacun (contrôlée par la vue).
export const ECARTS = [
  c('5018', 'Romilly-sur-Seine', 'Épicerie de la Poste', '20 rue de la Poste', 34.0, [50, 40, 40], { anomalie: 'poids' }),
  c('5025', 'Troyes', 'Bazar des Comtes', '5 rue des Comtes', 30.4, [55, 45, 40], { anomalie: 'poids' }),
  c('5032', 'Vendeuvre-sur-Barse', 'Quincaillerie du Lac', '7 rue du Lac', 32.5, [60, 40, 35], { anomalie: 'poids' }),
  c('5049', 'Chaource', 'Cave du Bourg', '13 Grande Rue', 31.2, [60, 40, 40], { anomalie: 'poids' }),
  c('5056', 'Sainte-Savine', 'Tabac Lafayette', '28 rue Lafayette', 6.0, [125, 25, 10], { anomalie: 'taille' }),
  c('5063', 'Nogent-sur-Seine', 'Bazar de la Halle', '15 place de la Halle', 9.0, [60, 50, 45], { anomalie: 'taille' }),
  c('5070', 'Bréviandes', 'Fleurs du Pont', '8 rue du Pont', 8.0, [70, 50, 35], { anomalie: 'taille' }),
  c('5087', 'Brienne-le-Château', 'Droguerie de la Gare', '6 avenue de la Gare', 4.2, [135, 20, 15], { anomalie: 'taille' }),
  c('5094', 'Troyes', 'Pressing du Beffroi', '9 rue du Beffroi', 2.6, [40, 30, 25], { etat: 'ouvert', anomalie: 'carton' }),
  c('5100', 'La Chapelle-Saint-Luc', 'Épicerie des Peupliers', '17 rue des Peupliers', 5.1, [50, 35, 30], { etat: 'ouvert', anomalie: 'carton' }),
  c('5117', 'Buchères', 'Tabac du Centre', '2 rue du Centre', 1.9, [35, 25, 20], { etat: 'ouvert', anomalie: 'carton' }),
  c('5124', 'Pont-Sainte-Marie', 'Librairie des Marots', '12 rue des Marots', 2.3, [40, 30, 15], { etat: 'floue', anomalie: 'etiquette' }),
  c('5131', 'Les Riceys', 'Presse du Pressoir', '4 rue du Pressoir', 3.6, [45, 30, 25], { etat: 'floue', anomalie: 'etiquette' }),
  c('5148', 'Arcis-sur-Aube', 'Boulangerie de la Halle', '1 rue de la Halle', 0.8, [30, 20, 10], { etat: 'floue', anomalie: 'etiquette' }),
];
// Difficiles (niveau confirmé, ENT-11.2) : juste à la limite.
export const DIFFICILES = [
  c('6014', 'Pont-Sainte-Marie', 'Bazar du Canal', '3 rue du Canal', 30.0, [50, 40, 40]),                   // 30,0 kg pile : il part
  c('6021', 'La Chapelle-Saint-Luc', 'Quincaillerie Thiers', '22 rue Thiers', 7.0, [61, 50, 40], { anomalie: 'taille' }),  // 151 cm
  c('6038', 'Troyes', 'Tabac de la Tour', '1 rue de la Tour', 3.0, [120, 20, 10]),                            // 120 cm pile, 150 cm pile : il part
];

// Une série tirée : `ecarts` à écarter de motifs DIFFÉRENTS, `pieges` à piège, `ordinaires` en règle ; chaque sortie servie au
// moins une fois par un colis en règle ; mélangée. `h` : le hasard d'une graine (`core/tirage.js`). Rend la liste des colis.
export function tirerSerie(h, { ecarts = 3, pieges = 2, ordinaires = 5, en = [] } = {}) {
  const D = { sorties: SORTIES, regles: REGLES };
  for (let essai = 0; essai < 60; essai++) {
    const motifs = h.prendre(['poids', 'taille', 'carton', 'etiquette'], ecarts);
    const E = motifs.map((m) => h.choisir(ECARTS.filter((x) => x.anomalie === m)));
    const P = h.prendre(PIEGES, pieges);
    const O = h.prendre(ORDINAIRES, ordinaires);
    const serie = h.melanger([...E, ...P, ...O, ...en]);
    const comp = compositionSerie(D, { colis: serie });
    if (comp.sorties.length === SORTIES.length && new Set(serie.map((x) => x.n)).size === serie.length) return serie.map((x) => ({ ...x }));
  }
  throw new Error('tirerSerie : aucune série ne sert toutes les sorties');
}
// Le bon tri d'un colis de la banque (pour les corrigés et les tests).
export const bonTriColis = (x) => bonTri({ sorties: SORTIES, regles: REGLES }, x);
