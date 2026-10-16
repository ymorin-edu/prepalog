// Action — les DEUX SITES des évaluations CAP d’Action (ENT-8.5 « se situer », ENT-8.6 « prise de poste ») : module PARTAGÉ, données pures,
// aucun effet de bord, aucune dépendance à une séance. Brief `docs/briefs/ENT-8.5-action-evaluation-se-situer.md` §2, §6 et §7 point 3 ;
// décision du chef de chantier (`docs/briefs/COORDINATION-action.md` §7, n° 3).
//
// Chaque élève reçoit UN site, tiré par une fonction PURE de son identifiant (`siteDe(uid)`), SANS l’id de la séance : le même élève a le
// même site dans ENT-8.5 et dans ENT-8.6 (la fiction continue le lendemain), sans base partagée (`jeuId`). Une séance lit le site de
// l’élève dans SA base par `siteDeBase(db, idSeance)` : l’identifiant est la graine que le moteur range avec le tirage de la séance
// (`db.tirages[<séance>].graine` = « <uid>|<séance> », `core/tirage.js`), à défaut la graine posée par le moteur (`graineDeBase`).
// Une base vide (contrôle au chargement, enseignant sans tirage) : le site par défaut, Onnaing.
//
// VÉRIFIÉ (brief §2, recherche de Cowork du 16/10/2026, sources au brief) : Onnaing (59), le plus récent centre d’Action en France, exploité
// par GXO ; Belleville-en-Beaujolais (69), 60 000 m², exploité par Kuehne+Nagel, livre le Sud-Est ; le magasin Action de La Sentinelle (59),
// zone du Vignoble, rue des Vignes (ouvert le 8/11/2025) ; un magasin Action à Villefranche-sur-Saône (69) (offre France Travail, adresse non
// donnée). Hub d’import du Havre : comme ENT-8.1.
// CONSTRUIT (dit dans la séance) : que CE site livre CE magasin ; le trajet Le Havre → entrepôt → magasin ; les tuteurs Karim et Sandrine et
// leurs fonctions ; les adresses de messagerie (domaines `.example`) ; l’« autre magasin » de l’étiquette fausse (Roques, Nîmes : deux
// magasins du réseau vus en ENT-8.1 et 8.3). Positions : voir `contenus/action.js` (lieux ajoutés pour ENT-8.5) et `MENTION` de chaque site.

import { hasard, graineDeBase } from '../core/tirage.js';
import { LIEUX, LIEU_ONNAING, LIEU_BELLEVILLE, LIEU_VILLEFRANCHE, LIEU_LA_SENTINELLE } from './action.js';

// Les clés des sites (JAMAIS modifiées : elles décident du jeu de chaque élève, dans deux séances).
export const IDS_SITES = ['onnaing', 'belleville'];
export const SITE_DEFAUT = 'onnaing';

// Le port : celui d’ENT-8.1, tel quel (Gonfreville-l’Orcher, position approchée au centre de la commune).
const PORT = LIEUX.find((l) => l.id === 'port');
// Onnaing : le lieu d’ENT-8.3 (où il est BONUS, sans indice), joué ici dans le socle : id `entrepot`, un `indice`, un `role` neutre.
const { bonus: _b, ...ONNAING_83 } = LIEU_ONNAING;
const LIEU_ONNAING_ENTREPOT = { ...ONNAING_83, id: 'entrepot', nom: 'L’entrepôt GXO d’Onnaing', role: 'L’entrepôt où tu fais ton stage.',
  indice: 'Tout près de Valenciennes, à l’est, vers la Belgique.', etiq: 'd' };

// Les deux sites. Mêmes clés, même structure (équité, brief §6 bis) : seule la carte change.
//   site : la commune de l’entrepôt ; ville : la commune du magasin ; prestataire : l’entreprise qui fait tourner l’entrepôt ;
//   tuteur : { prenom, fonction, mot (« ton tuteur » / « ta tutrice »), mail } ; autreMagasin : l’étiquette fausse de « Ce que je change » ;
//   lieux : la carte (entrepôt → magasin → port, mêmes ids pour les deux sites) ; position : la phrase de fin de carte sur les points approchés.
export const SITES = {
  onnaing: {
    id: 'onnaing', site: 'Onnaing', deSite: 'd’Onnaing', departement: 'le Nord', prestataire: 'GXO', ville: 'La Sentinelle',
    magasin: 'le magasin Action de La Sentinelle', autreMagasin: 'Roques',
    tuteur: { prenom: 'Karim', fonction: 'chef d’équipe à la réception', mot: 'ton tuteur', mail: 'karim@gxo-onnaing.example' },
    lieux: [LIEU_ONNAING_ENTREPOT, LIEU_LA_SENTINELLE, PORT],
    position: 'Le point d’Onnaing est au centre de la commune ; celui de La Sentinelle, sur la zone du Vignoble.',
  },
  belleville: {
    id: 'belleville', site: 'Belleville-en-Beaujolais', deSite: 'de Belleville-en-Beaujolais', departement: 'le Rhône', prestataire: 'Kuehne+Nagel', ville: 'Villefranche-sur-Saône',
    magasin: 'le magasin Action de Villefranche-sur-Saône', autreMagasin: 'Nîmes',
    tuteur: { prenom: 'Sandrine', fonction: 'cheffe d’équipe à la réception', mot: 'ta tutrice', mail: 'sandrine@kn-belleville.example' },
    lieux: [LIEU_BELLEVILLE, LIEU_VILLEFRANCHE, PORT],
    position: 'Le point de Belleville-en-Beaujolais est au centre de la commune.',
  },
};
// L’ordre du trajet de la marchandise (fin de la carte), le même pour les deux sites.
export const FLUX = ['port', 'entrepot', 'magasin'];

// LE SITE D’UN ÉLÈVE : fonction PURE de son identifiant, SANS séance (même résultat dans ENT-8.5 et ENT-8.6). Identifiant vide : le défaut.
export function siteDe(uid) {
  const u = String(uid || '');
  if (!u) return SITE_DEFAUT;
  return hasard(`${u}|action-evaluation-site`).reel() < 0.5 ? 'onnaing' : 'belleville';
}
// L’identifiant de l’élève, relu dans la base d’une séance : la graine du tirage de cette séance, sans le « |<séance> » que le moteur y
// ajoute ; à défaut, la graine posée par le moteur ; sinon ''.
export function uidDeBase(db, idSeance) {
  const r = db && db.tirages && db.tirages[idSeance];
  const g = r && typeof r.graine === 'string' ? r.graine : '';
  const fin = `|${idSeance}`;
  if (g) return g.endsWith(fin) ? g.slice(0, -fin.length) : g;
  return graineDeBase(db);
}
// Le site (l’objet) de l’élève dont `db` est la base, pour la séance `idSeance`.
export const siteDeBase = (db, idSeance) => SITES[siteDe(uidDeBase(db, idSeance))];

// Remplit un texte à trous : {site}, {de-site} (« d’Onnaing », « de Belleville-en-Beaujolais »), {ville}, {prestataire}, {autre} (l’autre
// magasin), {tuteur} (le prénom), {magasin}.
export function remplir(t, S) {
  return String(t).replace(/\{(site|de-site|ville|prestataire|autre|tuteur|magasin)\}/g, (m, k) => ({
    site: S.site, 'de-site': S.deSite, ville: S.ville, prestataire: S.prestataire, autre: S.autreMagasin, tuteur: S.tuteur.prenom, magasin: S.magasin,
  })[k]);
}
