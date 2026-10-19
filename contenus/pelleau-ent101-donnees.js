// ENT-10.1 — Transports Pelleau : les DONNÉES PURES de la séance (lieux de la carte, banques, tirage, lectures de la base de l'élève).
// Aucun effet de bord, aucune interface : importé par le contenu (`contenus/pelleau-ent101.js`), les tests et le corrigé
// (`contenus/corriges/ENT-10.1.js`, chargé aussi sous Node). Brief `docs/briefs/ENT-10.1-pelleau-se-situer.md` §6.1 et §6 bis.
// Textes des tâches, étapes, métiers et situations : ceux du brief (CONSTRUITS par Cowork), écrits tels quels.

import { declarerTirage, hasard } from '../core/tirage.js';

export const ID = 'pelleau-se-situer';
export const VUE = 'pelleau-carte';
export const ID_VOLET = 'pelleau-ent101';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { qui: 'qui-est-qui', histoire: 'histoire', metiers: 'metiers', changer: 'changer' };

// ─────────────────────────────────────────────────────────────── les lieux de la carte (brief §6.1)
// Positions `[longitude, latitude]` relevées dans OpenStreetMap (Nominatim, 19/10/2026), arrondies à 4 décimales ; `osm` = l'objet cité.
// Codes `dep` et `region` : INSEE (Bretagne 53, Finistère 29 ; Île-de-France 11, Val-de-Marne 94).
//   entrepot : l'entrepôt Pelleau n'est PAS dans OSM sous son nom : le point est le lieu-dit Kergaradec à Gouesnou (nœud OSM 1674638550),
//     donc APPROCHÉ (la ZAC de Kergaradec, pas le bâtiment). Brest (4,3 km) n'est qu'un repère, jamais un « autre ».
//   berceau : centre de la commune de Plabennec (relation 1189484), APPROCHÉ (la commune, pas un bâtiment).
//   rungis : le Marché international de Rungis (chemin OSM 130808774, `amenity=marketplace`), RELEVÉ.
//   saint-pol (bonus) : centre de la commune (relation 420905). Repère : Morlaix (Brest est un de ses « autres »).
// « Autres » : centres de commune. ÉCART AVEC LE BRIEF (§6.1 « changer la ville d'autres et le dire ») : pour Rungis, Créteil (7,3 km du MIN)
// et Champigny-sur-Marne (6,4 km de Vincennes) ne tiennent pas les 8 km de la vue : remplacés par Le Plessis-Trévise et Mandres-les-Roses.
// Distances (haversine) du point à ses autres, et des autres entre eux, toutes au-dessus de 10 km (MIN : Vincennes 11,7, Le Plessis-Trévise
// 16,8, Mandres-les-Roses 14,9 ; entre eux 10,7, 17,8, 12,1). Le Finistère : toutes au-dessus de 20 km.
// `etiq` (place du nom à la fin) : PROPOSITION, à régler à l'écran.
const QUIMPER = { ville: 'Quimper', lonlat: [-4.1025, 47.996], osm: 'relation 296095' };
const MORLAIX = { ville: 'Morlaix', lonlat: [-3.8332, 48.5825], osm: 'relation 297387' };
const BREST = { ville: 'Brest', lonlat: [-4.4851, 48.3912], osm: 'relation 1076124' };
export const LIEUX_CARTE = [
  { id: 'entrepot', lettre: 'E', type: 'entrepot',
    nom: 'Entrepôt Transports Pelleau', role: 'L’entrepôt neuf où tu travailles.',
    ville: 'Gouesnou', dep: '29', region: '53',
    lonlat: [-4.4638, 48.4292], osm: 'node 1674638550',
    autres: [QUIMPER, MORLAIX, { ville: 'Carhaix-Plouguer', lonlat: [-3.5711, 48.2765], osm: 'relation 1400527' }],
    reperes: [{ ville: 'Brest', lonlat: BREST.lonlat }],
    indice: 'Tout au bout de la Bretagne, au nord de Brest.', etiq: 'b' },
  { id: 'berceau', lettre: 'P', type: 'site',
    nom: 'Plabennec, là où tout a commencé', role: 'Gabriel Pelleau y crée l’entreprise en 1930.',
    ville: 'Plabennec', dep: '29', region: '53',
    lonlat: [-4.4268, 48.502], osm: 'relation 1189484',
    autres: [QUIMPER, MORLAIX, { ville: 'Concarneau', lonlat: [-3.9224, 47.8757], osm: 'relation 166492' }],
    reperes: [{ ville: 'Brest', lonlat: BREST.lonlat }],
    indice: 'Le même département que l’entrepôt.', etiq: 'h' },
  { id: 'rungis', lettre: 'R', type: 'magasin',
    nom: 'Marché de Rungis (MIN)', role: 'Le grand marché où les camions livrent les primeurs.',
    ville: 'Rungis', dep: '94', region: '11',
    lonlat: [2.3579, 48.7571], osm: 'way 130808774',
    autres: [
      { ville: 'Vincennes', lonlat: [2.4397, 48.8475], osm: 'relation 108346' },
      { ville: 'Le Plessis-Trévise', lonlat: [2.5733, 48.8092], osm: 'relation 108284' },
      { ville: 'Mandres-les-Roses', lonlat: [2.5428, 48.7022], osm: 'relation 106765' },
    ],
    reperes: [{ ville: 'Paris', lonlat: [2.3484, 48.8535] }],
    indice: 'Au sud de Paris.', etiq: 'd' },
  // Lieu BONUS (chez un confirmé seulement, jamais d'indice).
  { id: 'saint-pol', lettre: 'S', type: 'site', bonus: true,
    nom: 'Saint-Pol-de-Léon', role: 'Les primeurs de 1960 partaient d’ici.',
    ville: 'Saint-Pol-de-Léon', dep: '29', region: '53',
    lonlat: [-3.9869, 48.685], osm: 'relation 420905',
    autres: [QUIMPER, BREST, { ville: 'Châteaulin', lonlat: [-4.0917, 48.1968], osm: 'relation 337909' }],
    reperes: [{ ville: 'Morlaix', lonlat: MORLAIX.lonlat }],
    etiq: 'd' },
];
export const FLUX = ['entrepot', 'rungis'];
// D'où vient chaque position : `releve` = l'objet OSM est le lieu lui-même ; `approche` = lieu-dit ou centre de commune.
export const PROVENANCE = { entrepot: 'approche', berceau: 'approche', rungis: 'releve', 'saint-pol': 'approche' };

// ─────────────────────────────────────────────────────────────── les banques (brief §6 bis ; ids JAMAIS supprimés ni renumérotés)
// « Qui est qui ? » : les 4 personnes, offertes à CHAQUE ligne, dans cet ordre (choix fixes du brief).
export const PERSONNES = [
  { v: 'erwan', lib: 'Erwan, responsable' },
  { v: 'yann', lib: 'Yann, magasinier-cariste' },
  { v: 'loic', lib: 'Loïc, conducteur' },
  { v: 'maelys', lib: 'Maëlys, agent d’exploitation' },
];
export const TACHES = [
  { id: 't-tournee', difficulte: 'facile', texte: 'Faire la tournée de ramasse chez les producteurs.', qui: 'loic' },
  { id: 't-chariot', difficulte: 'facile', texte: 'Ranger une palette en haut du rack au chariot.', qui: 'yann' },
  { id: 't-tuteur', difficulte: 'facile', texte: 'Te donner les consignes et suivre ton stage.', qui: 'erwan' },
  { id: 't-planning', difficulte: 'moyen', texte: 'Organiser l’heure de retour des camions.', qui: 'maelys' },
  { id: 't-saisie', difficulte: 'moyen', texte: 'Saisir dans l’ordinateur ce que l’entrepôt a reçu.', qui: 'maelys' },
  { id: 't-decider', difficulte: 'difficile', texte: 'Décider ce qu’on fait d’une palette abîmée.', qui: 'erwan' },
  { id: 't-ouvrir', difficulte: 'moyen', texte: 'Préparer les engins avant l’arrivée du camion.', qui: 'yann' },
];
// « L'histoire de Pelleau » : les 6 étapes (faits vérifiés, brief §2), libellés SANS année (l'élève lit la frise de « Pelleau en bref »).
// Difficulté = rangement pour le tirage : `facile` = avant 1960 (une toujours tirée), `moyen` = après ; `e2026` est la pièce fixe.
export const ETAPES_HISTOIRE = [
  { id: 'e1930', an: 1930, difficulte: 'facile', lib: 'La création à Plabennec : bétail et matériaux de construction' },
  { id: 'e1945', an: 1945, difficulte: 'facile', lib: 'Les premiers primeurs (légumes frais)' },
  { id: 'e1989', an: 1989, difficulte: 'moyen', lib: 'Les plants de pommes de terre pour Germicopa' },
  { id: 'e1993', an: 1993, difficulte: 'moyen', lib: 'L’entrée dans le groupe Sofipel' },
  { id: 'e2013', an: 2013, difficulte: 'moyen', lib: 'Les voitures neuves et d’occasion' },
  { id: 'e2026', an: 2026, lib: 'L’entrepôt neuf et le stockage' },
];
// « Ce que fait Pelleau » : le travail et son métier (3 choix fixes).
export const METIERS = [
  { v: 'marchandises', lib: 'Transporter des marchandises' },
  { v: 'vehicules', lib: 'Transporter des véhicules' },
  { v: 'stocker', lib: 'Stocker des marchandises' },
];
export const TRAVAUX = [
  { id: 'm-rungis', difficulte: 'facile', texte: 'Livrer des primeurs à Rungis.', metier: 'marchandises' },
  { id: 'm-concession', difficulte: 'facile', texte: 'Amener une voiture neuve à une concession.', metier: 'vehicules' },
  { id: 'm-racks', difficulte: 'facile', texte: 'Garder 20 palettes de biscuits d’un client.', metier: 'stocker' },
  { id: 'm-plants', difficulte: 'moyen', texte: 'Livrer des plants de pommes de terre, entre 4 et 8 °C.', metier: 'marchandises' },
  { id: 'm-accidente', difficulte: 'moyen', texte: 'Amener une voiture accidentée au garage.', metier: 'vehicules' },
  { id: 'm-preparer', difficulte: 'difficile', texte: 'Préparer la commande d’un client à partir de son stock.', metier: 'stocker' },
];
// « Ce que je change » : une situation, ses 3 choix (clés neutres), la juste. Le brief ne donne pas de difficulté : toutes `facile`
// (le socle en tire 2, le bonus 1 : même difficulté pour tous, la note reste juste).
export const SITUATIONS = [
  { id: 's-compter', difficulte: 'facile', texte: 'Tu comptes bien les cartons d’une palette qui arrive.', juste: 'stock',
    choix: [{ v: 'stock', lib: 'Le client sait exactement ce qu’il a en stock.' }, { v: 'vite', lib: 'Le camion roule plus vite.' },
      { v: 'rien', lib: 'Rien ne change.' }] },
  { id: 's-adresse', difficulte: 'facile', texte: 'Tu ranges la palette à la bonne place du rack.', juste: 'retrouve',
    choix: [{ v: 'retrouve', lib: 'On la retrouve tout de suite le jour où le client la demande.' }, { v: 'prix', lib: 'Le client paie moins.' },
      { v: 'solide', lib: 'Le rack est plus solide.' }] },
  { id: 's-signaler', difficulte: 'facile', texte: 'Tu signales un carton abîmé dès l’arrivée.', juste: 'preuve',
    choix: [{ v: 'preuve', lib: 'Pelleau peut prouver que le carton est arrivé abîmé.' }, { v: 'repare', lib: 'Le carton se répare.' },
      { v: 'prime', lib: 'Loïc a une prime.' }] },
  { id: 's-engin', difficulte: 'facile', texte: 'Tu vérifies ton transpalette avant de t’en servir.', juste: 'blesse',
    choix: [{ v: 'blesse', lib: 'Personne ne se blesse avec un engin en panne.' }, { v: 'vite', lib: 'Le transpalette va plus vite.' },
      { v: 'stock', lib: 'Le stock augmente.' }] },
];

// ─────────────────────────────────────────────────────────────── l'équité du tirage
// Les étapes dans l'ordre JUSTE (de la plus ancienne à la plus récente).
export const ordreJuste = (L) => L.slice().sort((a, b) => a.an - b.an).map((p) => p.id);
// Le départ ne place AUCUNE étape à son rang juste : chaque étape vaut 0,75 à sa place, envoyer sans rien toucher doit valoir 0.
export const departSansPlace = (ids, juste) => ids.every((x, i) => x !== juste[i]);
export function ecartsEquite(jeu) {
  const E = [];
  const T = jeu.pieces.taches || [];
  if (new Set(T.map((p) => p.qui)).size !== T.length) E.push('qui est qui : deux tâches de la même personne');
  const M = jeu.pieces.travaux || [];
  if (new Set(M.map((p) => p.metier)).size !== M.length) E.push('ce que fait Pelleau : deux travaux du même métier');
  const H = jeu.pieces.etapes || [];
  if (!departSansPlace(H.map((p) => p.id), ordreJuste(H))) E.push('histoire : une étape est déjà à sa place au départ');
  return E;
}
export const TIRAGE = declarerTirage({
  banques: {
    taches: { pieces: TACHES, melange: { facile: 1, moyen: 1, difficile: 1 }, bonus: { confirme: { moyen: 1 } }, ordre: 'melange' },
    // L'ordre tiré EST l'ordre de départ de la fiche (`e2026` à une place tirée) ; `verifier` le re-tire s'il place une étape juste.
    etapes: { pieces: ETAPES_HISTOIRE, fixes: ['e2026'], melange: { facile: 1, moyen: 2 }, ordre: 'melange' },
    travaux: { pieces: TRAVAUX, melange: { facile: 2, moyen: 1 }, bonus: { confirme: { difficile: 1 } }, ordre: 'melange' },
    situations: { pieces: SITUATIONS, melange: { facile: 2 }, bonus: { confirme: { facile: 1 } }, ordre: 'melange' },
  },
  verifier: ecartsEquite,
  // Trois règles à la fois (3 personnes, 3 métiers, aucune étape à sa place) : un tirage sur 14 environ les tient toutes ; 40 essais
  // laisseraient près d'un élève sur 18 au jeu de secours. 200 essais : moins d'un sur un million (le bloc de tests exige zéro secours).
  essais: 200,
});
TIRAGE.lier(ID);

// ─────────────────────────────────────────────────────────────── le jeu de l'élève, lu dans SA base
// Base sans tirage (contrôle au chargement, sur une base vide) : le jeu d'une graine fixe (« modele »), pour que les fiches aient leurs
// lignes (et leurs gestes `fiche:changer:situation-1`…). Il ne sert qu'au dessin : les jalons restent « à faire » tant que rien n'est envoyé.
let MODELE = null;
const baseModele = () => (MODELE || (MODELE = { tirages: { [ID]: { graine: 'modele', ...TIRAGE.tirer('modele') } } }));
const jeu = (db) => (TIRAGE.tirage(db) ? db : baseModele());
const graineDe = (db) => { const r = TIRAGE.tirage(jeu(db)); return (r && r.graine) || 'modele'; };

export const tachesSocle = (db) => TIRAGE.piecesTirees(jeu(db), 'taches');
export const tachesDe = (db) => [...tachesSocle(db), ...TIRAGE.piecesBonus(jeu(db), 'taches')];
export const etapesDe = (db) => TIRAGE.piecesTirees(jeu(db), 'etapes');            // dans l'ordre de DÉPART
export const etapesJustes = (db) => ordreJuste(etapesDe(db));                         // ids, de la plus ancienne à la plus récente
export const travauxSocle = (db) => TIRAGE.piecesTirees(jeu(db), 'travaux');
export const travauxDe = (db) => [...travauxSocle(db), ...TIRAGE.piecesBonus(jeu(db), 'travaux')];
export const situationsSocle = (db) => TIRAGE.piecesTirees(jeu(db), 'situations');
export const situationsDe = (db) => [...situationsSocle(db), ...TIRAGE.piecesBonus(jeu(db), 'situations')];
// Les 3 choix d'une situation, dans un ordre tiré par élève.
export const choixSituation = (db, p) => hasard(`${graineDe(db)}|${ID}|choix|${p.id}`).melanger(p.choix);

export const champTache = (i) => `tache-${i + 1}`;
export const champTravail = (i) => `travail-${i + 1}`;
export const champSituation = (i) => `situation-${i + 1}`;
const libDe = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
export const libPersonne = (v) => libDe(PERSONNES, v);
export const libMetier = (v) => libDe(METIERS, v);
export const libEtape = (id) => (ETAPES_HISTOIRE.find((e) => e.id === id) || {}).lib || id;
export const libSituation = (p) => libDe(p.choix, p.juste);

// Une fiche envoyée (lecture seule) : { envoye, valeurs }.
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
// Une fiche déjà envoyée une fois (même rouverte par « Corriger » ensuite) : la suite ne se referme pas.
export const dejaEnvoyee = (id) => (db) => { const f = db && db.fiches && db.fiches[id]; return !!(f && (f.envoye || f.envois)); };
