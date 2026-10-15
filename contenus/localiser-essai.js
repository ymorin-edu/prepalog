// Contenu d'ESSAI de la vue « Localiser » (core/types/localiser.js, brief docs/briefs/MOTEUR-vue-localiser.md, lot 2, 15/10/2026).
// Aucune séance ne le charge : il sert au bloc de tests `localiser` (outils/test/localiser.mjs) et à la page d'essai
// `outils/essai-localiser-vue.html`. Deux jeux :
//   - ACTION : trois lieux ÉLOIGNÉS (Le Havre, Ensuès-la-Redonne, Nîmes) + le lieu bonus du confirmé (Labastide-Saint-Pierre) :
//     la fin dessine le trajet fléché sur la France entière ;
//   - PROCHE : trois lieux PROCHES de France Boissons (la plateforme de Buchelay et deux clients d'ENT-6.9 sur la côte) : la fin
//     dessine l'encart zoomé (règle du quart, décision 3 du chef de chantier).
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) :
//   - Action : les lieux, leurs rôles et les villes viennent du brief ENT-8.1 (§6.1, vérifiés par Cowork : entrepôt d'Ensuès exploité
//     par Geodis, hub d'import de Gonfreville-l'Orcher, magasin de Nîmes Cap Costières, six entrepôts Action en France). Le trajet
//     Le Havre → Ensuès → Nîmes est CONSTRUIT (dit dans le texte de fin).
//   - POSITIONS : APPROCHÉES. `contenus/action.js` (positions relevées dans OSM par le sous-agent « univers Action ») n'existait pas
//     quand ce fichier a été écrit : les positions du magasin, de l'entrepôt, de leurs « autres » et du réseau sont celles de la
//     maquette validée (approchées) ; celles du hub de Gonfreville-l'Orcher, de Rouen, Dieppe, Fécamp, du Havre et de Labastide
//     (Moissac, Caussade, Beaumont-de-Lomagne, Montauban, Toulouse) sont des centres de commune approchés. ENT-8.1 prendra celles
//     de `contenus/action.js`, objet OSM cité.
//   - France Boissons : la plateforme de Buchelay (78) est réelle ; « Café de l'Étal » (Deauville) et « Le Bistrot de la Digue »
//     (Houlgate) sont des établissements INVENTÉS d'ENT-6.9, sur des rues réelles ; positions approchées (centre de la rue).

import { FRANCE } from './france-contours.js';

export const LIEUX_ACTION = [
  { id: 'port', lettre: 'P', type: 'port', nom: 'Hub d’import d’Action, port du Havre', role: 'Les produits venus d’Asie arrivent ici par bateau.',
    ville: 'Gonfreville-l’Orcher', dep: '76', region: '28', lonlat: [0.2330, 49.5050], osm: 'centre de la commune (approché)',
    autres: [{ ville: 'Rouen', lonlat: [1.0993, 49.4431] }, { ville: 'Dieppe', lonlat: [1.0800, 49.9180] }, { ville: 'Fécamp', lonlat: [0.3750, 49.7570] }],
    reperes: [{ ville: 'Le Havre', lonlat: [0.1079, 49.4944] }],
    indice: 'Juste à l’est du Havre, au bord de l’estuaire de la Seine.', etiq: 'h' },
  { id: 'entrepot', lettre: 'E', type: 'entrepot', nom: 'Entrepôt Action d’Ensuès-la-Redonne', role: 'Geodis y stocke et prépare les commandes des magasins Action du Sud-Est.',
    ville: 'Ensuès-la-Redonne', dep: '13', region: '93', lonlat: [5.2050, 43.3550], osm: 'maquette (approché)',
    autres: [{ ville: 'Aix-en-Provence', lonlat: [5.4470, 43.5290] }, { ville: 'Arles', lonlat: [4.6310, 43.6770] }, { ville: 'Salon-de-Provence', lonlat: [5.0970, 43.6400] }],
    reperes: [{ ville: 'Marseille', lonlat: [5.3700, 43.2960] }],
    indice: 'Au bord de la mer, juste à l’ouest de Marseille.', etiq: 'b' },
  { id: 'magasin', lettre: 'M', type: 'magasin', nom: 'Action Nîmes Cap Costières', role: 'Le magasin que ton entrepôt livre.',
    ville: 'Nîmes', dep: '30', region: '76', lonlat: [4.3600, 43.8370], osm: 'maquette (approché)',
    autres: [{ ville: 'Alès', lonlat: [4.0820, 44.1250] }, { ville: 'Uzès', lonlat: [4.4190, 44.0120] }, { ville: 'Beaucaire', lonlat: [4.6440, 43.8080] }],
    reperes: [{ ville: 'Montpellier', lonlat: [3.8770, 43.6110] }, { ville: 'Avignon', lonlat: [4.8060, 43.9490] }],
    indice: 'Au sud du département, entre Montpellier et Avignon.', etiq: 'g' },
  { id: 'labastide', lettre: 'E', type: 'entrepot', bonus: true, nom: 'Entrepôt Action de Labastide-Saint-Pierre', role: 'Un autre entrepôt Action : il livre d’autres magasins.',
    ville: 'Labastide-Saint-Pierre', dep: '82', region: '76', lonlat: [1.3660, 43.9170], osm: 'maquette (approché)',
    autres: [{ ville: 'Moissac', lonlat: [1.0850, 44.1050] }, { ville: 'Caussade', lonlat: [1.5380, 44.1610] }, { ville: 'Beaumont-de-Lomagne', lonlat: [0.9880, 43.8830] }],
    reperes: [{ ville: 'Montauban', lonlat: [1.3550, 44.0180] }, { ville: 'Toulouse', lonlat: [1.4440, 43.6040] }], etiq: 'h' },
];

export const LOCALISER_ACTION = {
  id: 'essai-carte', libelle: 'Carte de France', titre: 'Où sont les lieux ?', contours: FRANCE,
  lieux: LIEUX_ACTION,
  flux: ['port', 'entrepot', 'magasin'],
  reseau: { libelle: 'autres entrepôts Action', sites: [
    { ville: 'Moissy-Cramayel', lonlat: [2.5930, 48.6260] }, { ville: 'Labastide-Saint-Pierre', lonlat: [1.3660, 43.9170] },
    { ville: 'Belleville-en-Beaujolais', lonlat: [4.7490, 46.1090] }, { ville: 'Verrières-en-Anjou', lonlat: [-0.4750, 47.5080] },
    { ville: 'Onnaing', lonlat: [3.5980, 50.3860] }] },
  fin: { titre: 'Le chemin de la marchandise',
    texte: 'Les produits arrivent d’Asie par bateau au Havre, puis l’entrepôt d’Ensuès prépare les commandes des magasins du Sud-Est. '
      + 'Les ronds creux sont les autres entrepôts Action en France. (Le trajet du Havre à Ensuès, puis à ce magasin de Nîmes, est imaginé pour l’exercice.)' },
};

export const LOCALISER_PROCHE = {
  id: 'essai-proche', libelle: 'Carte de France', titre: 'Où livre la plateforme ?', contours: FRANCE,
  lieux: [
    { id: 'buchelay', lettre: 'B', type: 'entrepot', nom: 'Plateforme France Boissons de Buchelay', role: 'Les boissons y sont stockées et préparées pour les clients.',
      ville: 'Buchelay', dep: '78', region: '11', lonlat: [1.6720, 48.9830],
      autres: [{ ville: 'Versailles', lonlat: [2.1200, 48.8050] }, { ville: 'Rambouillet', lonlat: [1.8300, 48.6440] }, { ville: 'Houdan', lonlat: [1.6000, 48.7900] }],
      reperes: [{ ville: 'Mantes-la-Jolie', lonlat: [1.7170, 48.9900] }],
      indice: 'Au nord-ouest du département, à côté de Mantes-la-Jolie.', etiq: 'd' },
    { id: 'etal', lettre: 'C', type: 'magasin', nom: 'Café de l’Étal', role: 'Un client de la côte : un café.',
      ville: 'Deauville', dep: '14', region: '28', lonlat: [0.0750, 49.3560],
      autres: [{ ville: 'Caen', lonlat: [-0.3700, 49.1830] }, { ville: 'Lisieux', lonlat: [0.2260, 49.1460] }, { ville: 'Bayeux', lonlat: [-0.7030, 49.2760] }],
      reperes: [{ ville: 'Honfleur', lonlat: [0.2330, 49.4190] }],
      indice: 'Au bord de la mer, à l’est de la côte du département.', etiq: 'h' },
    { id: 'digue', lettre: 'C', type: 'magasin', nom: 'Le Bistrot de la Digue', role: 'Un client de la côte : un bistrot.',
      ville: 'Houlgate', dep: '14', region: '28', lonlat: [-0.0790, 49.2990],
      autres: [{ ville: 'Falaise', lonlat: [-0.1930, 48.8950] }, { ville: 'Vire', lonlat: [-0.8890, 48.8380] }, { ville: 'Honfleur', lonlat: [0.2330, 49.4190] }],
      reperes: [{ ville: 'Caen', lonlat: [-0.3700, 49.1830] }],
      indice: 'Au bord de la mer, entre Caen et Deauville.', etiq: 'b' },
  ],
  flux: ['buchelay', 'etal', 'digue'],
  fin: { titre: 'La tournée des boissons', texte: 'De la plateforme de Buchelay aux cafés de la côte normande. (Jeu d’essai : les deux clients sont inventés.)' },
};
