// Boost (Nîmes) — l'univers de l'environnement ENT-3.x.
//
// Boost est une entreprise RÉELLE : logisticien e-commerce installé à Nîmes depuis 2024,
// entreprise d'insertion labellisée, 3 500 m² d'entrepôt, 18 salariés, une quarantaine de
// clients, un partenariat WePost où les colis partent **en vélo-cargo** jusqu'à la gare puis
// en train. C'est ce dernier point qui fait le scénario de C2.4 : organiser une tournée.
//
// Ce fichier porte ce qui est COMMUN à toutes les séances ENT-3.x — identité, charte, plan
// de Nîmes, destinataires. Chaque séance apporte sa consigne, ses jalons et ses réglages :
// voir `contenus/boost-tournee.js` pour ENT-3.1.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT — à dire aux élèves, règle du projet
//
// Vérifié (sources publiques, voir `claude/prepalog-boost-c24-c26.md`) :
//   - l'entreprise, son métier, sa taille, son positionnement, son partenariat WePost ;
//   - son adresse : 31 avenue Joliot Curie, 30900 Nîmes (SIRET 893 293 654 00032) ;
//   - les sept NOMS DE RUE de Nîmes, un par quartier, chacun cohérent avec la position de
//     son point sur le plan ;
//   - les trois marques citées comme clientes : Marou (chocolat), Molleni (vaisselle),
//     Jacker (vêtements).
//
// Construit, et assumé comme tel :
//   - les sept commerces destinataires (des commerces nîmois inventés) ;
//   - les poids, les nombres de colis, les distances, les horaires, la charge utile du
//     vélo-cargo et le train de 16 h 10 ;
//   - la tournée dans Nîmes elle-même : le vélo-cargo réel va de l'entrepôt à la gare.
//
// **Pas de numéro de rue pour les sept clients.** La rue est réelle, le commerce est
// inventé : un numéro désignerait un vrai bâtiment avec de vrais occupants. Le nom de rue
// suffit pour trouver le quartier sur un plan en ligne.
//
// **Téléphones** dans la plage 04 65 98 xx xx, réservée par l'Arcep à la fiction, et
// adresses de courriel en `.example` : aucun numéro ni aucune boîte réelle n'est jointe
// depuis un exercice.
//
// **La gare.** Voxlog écrit « gare de Nîmes TGV », mais la gare Nîmes–Pont-du-Gard est à
// Manduel, à quinze kilomètres : aucun vélo-cargo n'y va. C'est la **gare de Nîmes-Centre**
// dans les contenus, où passent aussi des TGV pour Paris.

/* ====================================================== identité et vocabulaire ====== */

export const ENTREPRISE = {
  id: 'boost',
  nom: 'Boost',
  sousTitre: 'Logistique e-commerce — Nîmes',
  exercice: 'Organiser la tournée du vélo-cargo',
  logo: './contenus/trames/logos/boost.png',
};

export const VOCAB = {
  unit: 'colis', unitPl: 'colis',
  sizeLabel: 'Format', sizeShort: 'F.',
  configWord: 'format', icone: 'carton',
  mailDomain: 'boost.example',
};

/* ================================================================= la charte de Boost ==
 * Relevée sur leboost.net et sur le logo, pas inventée — tableau dans
 * `claude/prepalog-boost-c24-c26.md`. Quatre valeurs sont RELEVÉES :
 *
 *   #13163e  nuit, la couleur la plus présente du site
 *   #09073b  nuit profond, second aplat
 *   #25c998  vert menthe, pixel dominant du logo
 *   #345cfd  bleu électrique, second ton du logo
 *   #f0bd3c  jaune du bouton d'action
 *
 * Les autres (survol, filet, encre, rouge) sont DÉRIVÉES de ces cinq : il n'y a rien à
 * relever pour elles sur un site vitrine, et il en faut pour un écran de logiciel.
 *
 * Les rôles sont choisis pour que les deux vues de transport tombent juste sans une ligne
 * de CSS en plus — elles sont écrites en variables :
 *
 *   --vert   → menthe        l'entrepôt et le tracé de la tournée
 *   --terre  → jaune         la gare
 *   --ardoise-fond → bleu    les points clients et les aplats pleins
 */
export const THEME = {
  accent: '#25c998',
  surAccent: '#09073b',
  sombre: {
    fond: '#09073b',        // nuit profond : le fond de fenêtre
    panneau: '#13163e',     // nuit : les panneaux posés dessus
    bandeau: '#09073b',
    menu: '#09073b',
    survol: '#1c2057',      // dérivé
    filet: '#2b3070',       // dérivé
    encre: '#eef0fa',       // dérivé
    encreDouce: '#a2abd6',  // dérivé
    accent: '#25c998',      // menthe : textes, bordures, marque
    accentFond: '#345cfd',  // bleu électrique : aplats pleins, points clients
    accentClair: 'rgba(52,92,253,.20)',
    terre: '#f0bd3c',       // jaune de la charte : la gare, les repères d'attention
    vert: '#25c998',        // menthe : l'entrepôt, le tracé, le « juste »
    rouge: '#f1706c',       // dérivé : un rouge qui tient sur le bleu nuit
  },
};

/* ============================================= catalogue, tiers et base de départ ====== */

// Le catalogue est VIDE, et c'est un choix explicite, pas un oubli.
//
// Boost est un prestataire : il stocke et expédie pour des marques. Les trois marques
// citées (Marou, Molleni, Jacker) sont ses DONNEURS D'ORDRE, pas ses fournisseurs, et les
// sept commerces sont les destinataires. Les écrans « Catalogue », « Stock », « Réceptions »,
// « Commandes » et « Fournisseurs » du noyau sont taillés pour un e-commerçant qui achète et
// revend : ils ne décrivent pas le métier de Boost tel quel.
//
// Plutôt que de fabriquer un faux catalogue de références au nom de marques réelles, ces
// écrans restent vides pour ENT-3.1, qui est une séance de transport. Ce qu'on y mettra —
// et s'il faut pouvoir masquer les entrées de menu inutiles — est une décision à prendre
// avec Tristan avant ENT-3.5. Les tuiles d'accueil de la séance n'affichent donc que la
// messagerie : aucun compteur à zéro n'est montré à l'élève.
export const CATALOGUE = { MODELS: [], MM: {}, VARIANTS: [], VM: {} };

export const SUPPLIERS = [];
export const SUP_BY_ID = {};

// Les sept destinataires de la tournée. Commerces INVENTÉS, à des rues RÉELLES de Nîmes.
// `zone` est le quartier : l'élève le choisit dans un menu en ENT-3.1.
//
// **Aucun nom de commerce ne nomme son propre quartier**, et c'est un test qui l'a attrapé :
// « Épicerie Fontaine » et « Caveau des Costières » donnaient la réponse dans leur enseigne.
// Ils sont devenus Verdier et Pélissier, deux patronymes gardois sans attache de quartier.
//
// ── Refonte du 03/10/2026 : la carte réelle ────────────────────────────────────────────────
// Sur le plan schématique, quatre rues sur sept ne tombaient pas dans le contour officiel de
// leur quartier (IRIS de l'INSEE). Décision de Tristan : on garde les quartiers et on DÉPLACE
// l'adresse, sur une rue réelle qui tombe entièrement dans le bon contour. Courbessac sortait de
// la carte et Grézan n'a pas d'IRIS à son nom : ils sont remplacés par Croix de Fer et Gambetta.
// La position de chaque point, sa case et son quartier dessiné viennent de
// `contenus/boost-ent31-carte.js` ; un test vérifie que cette liste et la carte disent la même
// chose (nom, rue, quartier, masse, colis).
export const DESTINATAIRES = [
  { id: 'c1', nom: 'Le Comptoir des Halles', zone: 'Écusson',
    adresse: 'rue du Général Perrier, 30000 Nîmes', kg: 31, colis: 4,
    marque: 'chocolats Marou', tel: '04 65 98 10 41' },
  { id: 'c2', nom: 'Épicerie Verdier', zone: 'Jardins de la Fontaine',
    adresse: 'rue de Combret, 30000 Nîmes', kg: 24, colis: 3,
    marque: 'chocolats Marou', tel: '04 65 98 10 52' },
  { id: 'c3', nom: 'La Pointe Sud', zone: 'Ville Active',
    adresse: "rue de l'Hostellerie, 30900 Nîmes", kg: 58, colis: 7,
    marque: 'vaisselle Molleni', tel: '04 65 98 10 63' },
  { id: 'c4', nom: 'Maison Lauze', zone: 'Saint-Césaire',
    adresse: 'rue de Mascard, 30900 Nîmes', kg: 42, colis: 5,
    marque: 'vaisselle Molleni', tel: '04 65 98 10 74' },
  { id: 'c5', nom: 'Studio Garance', zone: 'Croix de Fer',
    adresse: 'rue Edmond Rostand, 30000 Nîmes', kg: 19, colis: 2,
    marque: 'vêtements Jacker', tel: '04 65 98 10 85' },
  { id: 'c6', nom: 'Atelier Mazet', zone: 'Gambetta',
    adresse: 'rue Graverol, 30000 Nîmes', kg: 36, colis: 4,
    marque: 'vêtements Jacker', tel: '04 65 98 10 96' },
  { id: 'c7', nom: 'Caveau Pélissier', zone: 'Costières',
    adresse: 'rue Roger Sabatier, 30900 Nîmes', kg: 27, colis: 3,
    marque: 'vaisselle Molleni', tel: '04 65 98 10 17' },
];

// Les mêmes sept, vus par l'écran « Clients » du noyau. L'adresse de rue y figure — c'est
// la même que sur la fiche de tournée — mais **pas le quartier** : c'est le quartier que
// l'élève doit trouver, et un écran qui le donnerait viderait l'exercice.
const depuis = (annee, mois, jour) => new Date(annee, mois - 1, jour).getTime();
export const CUSTOMERS = DESTINATAIRES.map((d, i) => ({
  id: 'C' + String(i + 1).padStart(3, '0'),
  prenom: '', nom: d.nom,
  email: 'contact@' + d.id + '.example',
  tel: d.tel,
  adr: d.adresse.replace(/, \d{5} .*$/, ''),
  cp: (d.adresse.match(/\b(\d{5})\b/) || [])[1] || '30000',
  ville: 'Nîmes',
  since: depuis(2024, 9 + (i % 4), 3 + i * 2),
  nb: 4 + i,
}));
export const CM = (() => { const o = {}; CUSTOMERS.forEach((c) => { o[c.id] = c; }); return o; })();

// Base de départ commune aux séances ENT-3.x : rien à semer ici, chaque séance sème son
// volet. Les sept destinataires sont dans le contenu, pas dans la base de l'élève — ils ne
// changent pas d'une séance à l'autre.
export function baseDeDepart() {
  return {
    v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
    customers: [], suppliers: [], seq: 1, _depart: [],
  };
}

/* ============================================================ le plan de Nîmes ========== */

// Le plan SCHÉMATIQUE d'ENT-3.1 (décor SVG dessiné à la main, `PLAN_NIMES`) a été retiré le
// 03/10/2026 : ENT-3.1 passe sur la carte réelle, comme ENT-3.2 (brief
// `docs/briefs/ENT-3.1-refonte-carte.md`). Sa carte est `contenus/boost-ent31-carte.js`,
// GÉNÉRÉE par `outils/carte/construire.py` depuis `outils/carte/boost-ent31.json`.

/* ================================================= les données du vélo-cargo ========== */

// Vélo-cargo : 180 kg de charge utile, 12 km/h en ville, 6 minutes par arrêt. Le train pour
// Paris part à 16 h 10. Les sept commandes d'ENT-3.1 pèsent 237 kg en tout : 57 kg de trop.
//
// Départ à 14 h 00 depuis la refonte du 03/10/2026 (13 h 00 sur le plan schématique). Avec les
// km comptés par les rues, la tournée d'ENT-3.1 fait 11 à 25 km au lieu de 22 : partie à 13 h,
// tout ordre attrapait le train. À 14 h, 35 % des 720 ordres le prennent (calibrer.mjs).
export const VELO = {
  chargeUtile: 180,
  depart: 14 * 60,
  train: 16 * 60 + 10,
  vitesse: 12,
  service: 6,
};

export const MASSE_TOTALE = DESTINATAIRES.reduce((t, d) => t + d.kg, 0);   // 237 kg
