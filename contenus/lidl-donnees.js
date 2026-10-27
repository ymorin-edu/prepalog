// Lidl — les DONNÉES des séances ENT-21.1 à 21.6 (2de GATL, entreprise n° 21 : la plateforme logistique et direction régionale de Meaux,
// Seine-et-Marne). Données pures : aucun effet de bord, aucune dépendance au navigateur (se charge aussi sous Node).
// Cadrage : `docs/briefs/lidl/CADRAGE-lidl-2de.md`.
//
// RÉEL (recherche du 27/10/2026) : Meaux, en activité depuis le 20 juin 2022, inaugurée le 16 septembre 2022 ; 55 000 m², dont 28 000 m² de produits
// secs et 24 000 m² de cellules froides (de +14 °C à -28 °C), environ 6 700 m² de fruits et légumes ; 3 500 m² de bureaux (la direction régionale) ;
// 61 magasins ; l'entrepôt de Crégy-lès-Meaux garde le non-alimentaire (Réussir, 26/09/2022). Les fruits et légumes y sont gardés un peu sous
// +10 °C (étude de cas Condair / xpair). Environ 1 600 magasins Lidl en France (Bourse Inside, 17/09/2026). Droit : surgelés à -18 °C ou moins
// (arrêté du 21/12/2009) ; délai de paiement des denrées périssables : 30 jours après la fin de la décade de livraison (Code de commerce, L441-11) ;
// TVA à 5,5 % sur les produits alimentaires.
// CONSTRUIT (dit dans les séances) : les quais et leur zone, les fournisseurs (aucun nom), les camions, les relevés, les rendez-vous, la grille
// tarifaire du transporteur, les coûts de la plateforme, les distances des magasins, les factures et leurs prix, les fiches fournisseurs, les prénoms.
// ⚠ Les jeux des évaluations (21.5, 21.6) sont une fonction de la graine de l'élève ET de ce fichier : ne rien y changer pendant qu'une classe joue.

import { empreinte, graineDeBase } from '../core/tirage.js';

export const nombreFr = (x) => String(Math.round(x * 100) / 100).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const euros = (x) => `${(Math.round(x * 100) / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`;
const r2 = (x) => Math.round(x * 100) / 100;

// ─────────────────────────────────────────── C1.3 : les zones, les quais, la réception
export const ZONES = [
  { v: 'sec', lib: 'Produits secs (température ambiante)', court: 'secs', ex: 'épicerie, boissons, conserves', quais: ['1', '2'] },
  { v: 'fl', lib: 'Fruits et légumes (un peu moins de +10 °C)', court: 'fruits et légumes', ex: 'fruits et légumes frais', quais: ['3'] },
  { v: 'frais', lib: 'Frais (de 0 à +4 °C)', court: 'frais', ex: 'produits laitiers, charcuterie, viande', quais: ['4', '5'] },
  { v: 'surgele', lib: 'Surgelés (-25 °C, jamais au-dessus de -18 °C)', court: 'surgelés', ex: 'tout ce qui est surgelé', quais: ['6'] },
];
export const QUAIS = ['1', '2', '3', '4', '5', '6'];
export const zoneDe = (v) => ZONES.find((z) => z.v === v);
// Les produits (génériques, aucune marque) et leur zone.
export const PRODUITS = {
  pates: { nom: 'Pâtes', zone: 'sec' }, eau: { nom: 'Eau en bouteilles', zone: 'sec' }, riz: { nom: 'Riz', zone: 'sec' }, cafe: { nom: 'Café moulu', zone: 'sec' },
  huile: { nom: 'Huile de tournesol', zone: 'sec' }, conserves: { nom: 'Conserves de légumes', zone: 'sec' },
  pommes: { nom: 'Pommes', zone: 'fl' }, salades: { nom: 'Salades', zone: 'fl' }, bananes: { nom: 'Bananes', zone: 'fl' }, clementines: { nom: 'Clémentines', zone: 'fl' },
  yaourts: { nom: 'Yaourts', zone: 'frais' }, jambon: { nom: 'Jambon', zone: 'frais' }, beurre: { nom: 'Beurre', zone: 'frais' }, fromage: { nom: 'Fromage', zone: 'frais' },
  glaces: { nom: 'Glaces', zone: 'surgele' }, legumes: { nom: 'Légumes surgelés', zone: 'surgele' }, frites: { nom: 'Frites surgelées', zone: 'surgele' },
  poisson: { nom: 'Poisson pané surgelé', zone: 'surgele' },
};
// Ce qu'on contrôle à la réception d'un camion (cases) : `juste` = à faire au quai.
export const CONTROLES = [
  { v: 'temperature', lib: 'La température du camion et des produits', juste: true },
  { v: 'nombre', lib: 'Le nombre de palettes, comparé à la commande', juste: true },
  { v: 'etat', lib: 'L’état des palettes et des emballages', juste: true },
  { v: 'dlc', lib: 'Les dates limites (DLC) des produits frais', juste: true },
  { v: 'prix', lib: 'Le prix de chaque produit', juste: false },
  { v: 'marque', lib: 'La marque du camion', juste: false },
];
// La règle des températures (frais : 4 °C au plus ; surgelés : -18 °C au plus ; fruits et légumes : de +6 à +12 °C, CONSTRUIT).
export const LIMITES = { frais: { max: 4 }, surgele: { max: -18 }, fl: { min: 6, max: 12 } };
export const releveJuste = (r) => { const L = LIMITES[r.zone]; return (L.min != null && r.t < L.min) || r.t > L.max ? 'prevenir' : 'accepter'; };

// ENT-21.1 : les produits à ranger, les camions du matin, les relevés.
export const P211 = ['yaourts', 'pommes', 'glaces', 'pates', 'jambon', 'salades'];
export const C211 = [
  { id: 'C1', de: 'Une laiterie de Normandie', produits: ['yaourts', 'beurre'], palettes: 18, zone: 'frais' },
  { id: 'C2', de: 'Un fabricant de pâtes', produits: ['pates', 'riz'], palettes: 26, zone: 'sec' },
  { id: 'C3', de: 'Un fabricant de surgelés', produits: ['glaces', 'frites'], palettes: 12, zone: 'surgele' },
  { id: 'C4', de: 'Un producteur de pommes du Loiret', produits: ['pommes'], palettes: 20, zone: 'fl' },
];
export const R211 = [
  { id: 'R1', camion: 'Le camion de surgelés', zone: 'surgele', t: -21 },
  { id: 'R2', camion: 'Le camion de la laiterie', zone: 'frais', t: 7 },
  { id: 'R3', camion: 'Le camion de pommes', zone: 'fl', t: 9 },
];

// ENT-21.2 : les demandes de rendez-vous du lundi 9 novembre 2026, dans l'ordre où elles sont arrivées. Un créneau d'une heure par quai :
// si tous les quais de la zone sont pris à l'heure demandée, le camion passe à l'heure suivante libre.
export const HEURES = ['6', '7', '8', '9'];
export const D212 = [
  { id: 'C1', de: 'Un fabricant de surgelés', produits: ['legumes', 'poisson'], palettes: 14, heure: '6' },
  { id: 'C2', de: 'Une fromagerie', produits: ['fromage'], palettes: 10, heure: '6' },
  { id: 'C3', de: 'Un glacier', produits: ['glaces'], palettes: 16, heure: '6' },
  { id: 'C4', de: 'Une charcuterie', produits: ['jambon'], palettes: 12, heure: '6' },
  { id: 'C5', de: 'Une laiterie', produits: ['yaourts', 'beurre'], palettes: 20, heure: '6' },
  { id: 'C6', de: 'Un embouteilleur d’eau', produits: ['eau'], palettes: 26, heure: '7' },
];
export const zoneCamion = (c) => PRODUITS[c.produits[0]].zone;
// Le planning : chaque camion, dans l'ordre des demandes, prend la première heure (à partir de l'heure demandée) où un quai de sa zone est libre.
export function planning(D) {
  const pris = {}; const out = {};
  for (const c of D) {
    const z = zoneDe(zoneCamion(c));
    for (const h of HEURES.slice(HEURES.indexOf(c.heure))) { const k = `${z.v}|${h}`; if ((pris[k] || 0) < z.quais.length) { pris[k] = (pris[k] || 0) + 1; out[c.id] = h; break; } }
  }
  return out;
}
// La durée de déchargement : 2 minutes par palette, plus 15 minutes de contrôle.
export const MIN_PALETTE = 2;
export const MIN_CONTROLE = 15;
export const duree = (palettes) => palettes * MIN_PALETTE + MIN_CONTROLE;

// ─────────────────────────────────────────── OTM-C1.4 : la cotation d'une livraison
// La grille du transporteur (CONSTRUITE) : un prix par palette selon la distance, un supplément froid, des prestations annexes.
export const GRILLE = [{ v: 'A', lib: 'Zone A : moins de 30 km', max: 30, prix: 38 }, { v: 'B', lib: 'Zone B : de 30 à 60 km', max: 60, prix: 46 },
  { v: 'C', lib: 'Zone C : plus de 60 km', max: Infinity, prix: 55 }];
export const FROID = 0.15;          // +15 % du prix du transport pour un camion frigorifique
export const HAYON = 25;            // par livraison
export const ATTENTE = 40;          // par heure entamée au-delà de 30 minutes gratuites
// « de 30 à 60 km » : 30 et 60 sont en zone B.
export const zoneKm = (km) => (km < 30 ? 'A' : km <= 60 ? 'B' : 'C');
export const prixPalette = (km) => GRILLE.find((g) => g.v === zoneKm(km)).prix;
export const heuresAttente = (min) => Math.max(0, Math.ceil((min - 30) / 60));
export function cotation(L) {
  const transport = r2(L.palettes * prixPalette(L.km));
  const froid = r2(transport * FROID);
  const annexes = r2((L.hayon ? HAYON : 0) + heuresAttente(L.attente) * ATTENTE);
  return { transport, froid, annexes, total: r2(transport + froid + annexes) };
}
// Le coût de revient si la plateforme livre avec son propre camion (CONSTRUIT) : 1,10 € par km (aller et retour), 31 € par heure de conducteur ;
// le prix de vente, si la plateforme facturait cette livraison : coût de revient + 20 %.
export const COUT_KM = 1.1;
export const COUT_HEURE = 31;
export const MARGE = 0.2;
export const revient = (L) => r2(L.km * 2 * COUT_KM + L.heures * COUT_HEURE);
export const prixVente = (L) => r2(revient(L) * (1 + MARGE));

// ENT-21.3 : trois magasins et une livraison.
export const M213 = [{ id: 'M1', km: 22 }, { id: 'M2', km: 42 }, { id: 'M3', km: 68 }];
export const L213 = { magasin: 'M2', km: 42, palettes: 12, zone: 'frais', hayon: true, attente: 50, heures: 4 };
// ENT-21.5 : trois jeux.
const JEUX215 = [
  { magasins: [{ id: 'M1', km: 18 }, { id: 'M2', km: 47 }, { id: 'M3', km: 73 }],
    livraison: { magasin: 'M3', km: 73, palettes: 10, zone: 'surgele', hayon: true, attente: 70, heures: 5 } },
  { magasins: [{ id: 'M1', km: 25 }, { id: 'M2', km: 64 }, { id: 'M3', km: 38 }],
    livraison: { magasin: 'M3', km: 38, palettes: 14, zone: 'frais', hayon: false, attente: 105, heures: 3 } },
  { magasins: [{ id: 'M1', km: 52 }, { id: 'M2', km: 12 }, { id: 'M3', km: 95 }],
    livraison: { magasin: 'M2', km: 12, palettes: 8, zone: 'frais', hayon: true, attente: 20, heures: 2 } },
];
export const indiceJeu = (db, n) => empreinte(`${graineDeBase(db)}|lidl`) % n;
export const jeu215 = (db) => JEUX215[indiceJeu(db, JEUX215.length)];
export const TOUS_JEUX215 = JEUX215;

// ─────────────────────────────────────────── AGO-2.2 et AGO-1.3 : la facture, l'échéance, la fiche fournisseur
export const TVA = 0.055;
// Une ligne : commandé (quantité, prix), reçu (quantité), facturé (quantité, prix). L'état : conforme, quantité ou prix.
export const etatLigne = (l) => (l.factQ !== l.recu ? 'quantite' : l.factP !== l.prix ? 'prix' : 'conforme');
export const htCorrige = (F) => r2(F.lignes.reduce((t, l) => t + l.recu * l.prix, 0));
export const tvaDe = (F) => r2(htCorrige(F) * TVA);
export const ttcDe = (F) => r2(htCorrige(F) + tvaDe(F));
// Les dates (ISO, en UTC).
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const dateDe = (iso) => { const [y, mo, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, mo - 1, d)); };
const isoDe = (t) => t.toISOString().slice(0, 10);
export const jourLong = (iso) => { const t = dateDe(iso); return `${JOURS[t.getUTCDay()]} ${t.getUTCDate() === 1 ? '1er' : t.getUTCDate()} ${MOIS[t.getUTCMonth()]} ${t.getUTCFullYear()}`; };
export const plusJ = (iso, n) => { const t = dateDe(iso); t.setUTCDate(t.getUTCDate() + n); return isoDe(t); };
export const finMois = (iso) => { const t = dateDe(iso); return isoDe(new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0))); };
export const finDecade = (iso) => { const d = dateDe(iso).getUTCDate(); return d <= 10 ? `${iso.slice(0, 8)}10` : d <= 20 ? `${iso.slice(0, 8)}20` : finMois(iso); };
export const echeance = (F) => plusJ(finDecade(F.livraison), 30);
export const echeancesPossibles = (F) => [plusJ(F.livraison, 30), echeance(F), finMois(F.livraison), plusJ(F.livraison, 60)].sort();
// La fiche fournisseur : ce qu'on met à jour (d'après un courrier signé) ; le RIB demandé par un courriel inconnu ne se change jamais sans rappeler.
export const CHAMPS = [{ v: 'adresse', lib: 'L’adresse' }, { v: 'telephone', lib: 'Le téléphone' }, { v: 'contact', lib: 'Le nom du contact' }, { v: 'rib', lib: 'Le RIB (coordonnées bancaires)' }];

// ENT-21.4 : la facture d'une laiterie (livrée le mercredi 14 octobre 2026).
export const F214 = {
  fournisseur: 'Une laiterie de Normandie', no: 'FA-2026-1187', livraison: '2026-10-14',
  lignes: [
    { ref: 'yaourts', lib: 'Yaourts nature (carton de 16)', cmd: 40, prix: 9.6, recu: 40, factQ: 40, factP: 9.6 },
    { ref: 'fromage', lib: 'Fromage blanc (carton de 12)', cmd: 30, prix: 12.5, recu: 28, factQ: 30, factP: 12.5 },
    { ref: 'beurre', lib: 'Crème fraîche (carton de 20)', cmd: 20, prix: 8.4, recu: 20, factQ: 20, factP: 8.9 },
  ],
  fiche: { adresse: '12 route de la Laiterie, 14000 Caen', telephone: '02 31 00 00 00', contact: 'Mme Lefèvre' },
  courrier: { adresse: '4 rue des Herbages, 14000 Caen', telephone: '02 31 00 00 47' },
};
// ENT-21.6 : trois jeux.
const JEUX216 = [
  { fournisseur: 'Un producteur de fruits du Val de Loire', no: 'FA-8812', livraison: '2026-11-02',
    lignes: [
      { ref: 'pommes', lib: 'Pommes (colis de 10 kg)', cmd: 50, prix: 11.2, recu: 50, factQ: 50, factP: 11.2 },
      { ref: 'poires', lib: 'Poires (colis de 10 kg)', cmd: 30, prix: 13.4, recu: 30, factQ: 30, factP: 13.9 },
      { ref: 'clementines', lib: 'Clémentines (colis de 10 kg)', cmd: 40, prix: 15, recu: 36, factQ: 40, factP: 15 }],
    fiche: { adresse: '8 chemin des Vergers, 45000 Orléans', telephone: '02 38 00 00 00', contact: 'M. Rolland' },
    courrier: { adresse: '21 avenue du Verger, 45000 Orléans' } },
  { fournisseur: 'Un fabricant d’épicerie', no: 'FA-30451', livraison: '2026-11-25',
    lignes: [
      { ref: 'riz', lib: 'Riz (carton de 12)', cmd: 60, prix: 7.5, recu: 58, factQ: 60, factP: 7.5 },
      { ref: 'huile', lib: 'Huile de tournesol (carton de 6)', cmd: 25, prix: 21, recu: 25, factQ: 25, factP: 21 },
      { ref: 'cafe', lib: 'Café moulu (carton de 24)', cmd: 30, prix: 31.8, recu: 30, factQ: 30, factP: 32.4 }],
    fiche: { adresse: '3 rue de l’Industrie, 51100 Reims', telephone: '03 26 00 00 00', contact: 'Mme Garnier' },
    courrier: { telephone: '03 26 00 00 85', contact: 'M. Perret' } },
  { fournisseur: 'Une charcuterie de Bretagne', no: 'FA-5530', livraison: '2026-11-17',
    lignes: [
      { ref: 'jambon', lib: 'Jambon (carton de 8)', cmd: 24, prix: 18.6, recu: 24, factQ: 24, factP: 19.2 },
      { ref: 'beurre', lib: 'Beurre (carton de 40)', cmd: 40, prix: 14.3, recu: 40, factQ: 40, factP: 14.3 },
      { ref: 'lait', lib: 'Lait (pack de 6)', cmd: 80, prix: 6.9, recu: 75, factQ: 80, factP: 6.9 }],
    fiche: { adresse: '15 rue du Port, 29200 Brest', telephone: '02 98 00 00 00', contact: 'M. Le Gall' },
    courrier: { adresse: '2 zone de Kergaradec, 29200 Brest', telephone: '02 98 00 00 12' } },
];
export const jeu216 = (db) => JEUX216[indiceJeu(db, JEUX216.length)];
export const TOUS_JEUX216 = JEUX216;
export const champsAJour = (F) => Object.keys(F.courrier);
