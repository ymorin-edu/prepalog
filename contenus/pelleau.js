// Transports Pelleau (entrepôt neuf de Gouesnou, Finistère) — l'univers commun des séances ENT-10.x (CAP OL, C1.1 à C1.4).
// Créé par ENT-10.1 (brief `docs/briefs/ENT-10.1-pelleau-se-situer.md` §6 ; feuille de route `docs/briefs/FEUILLE-DE-ROUTE-pelleau.md` §0 ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-pelleau.md` §2, qui passent avant les briefs). Partagé par 10.1 à 10.12 :
// À LIRE, jamais à redéclarer dans une séance (identité, charte, équipe, lieux du site, clients, palettes types, plan de l'entrepôt,
// lexique, documents communs, textes de droit, gabarits). Aucun effet de bord à l'import : que des constantes et des fonctions pures.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (alerte 9 ; brief ENT-10.1 §2, sources de la feuille de route, consultées le 18/10/2026)
//
// Vérifié (site transports-pelleau.fr : accueil, à propos, stockage, transport, véhicules, engagements, actualités ; Journal du Poids
// Lourd, 06/04/2026 ; Bretagne Supply Chain, 30/04/2026) : entreprise créée en 1930 à Plabennec par Gabriel Pelleau (bétail, matériaux de
// construction) ; 1945 primeurs ; 1960 transmise à ses trois fils (primeurs de Saint-Pol-de-Léon et du port de Brest) ; 1989 début du travail
// avec Germicopa (plants de pommes de terre) ; 1993 rattachée à la holding Sofipel ; 1998 véhicules accidentés ; 2013 véhicules neufs et
// d'occasion ; 2020 flotte de porte-voitures doublée ; 2026 nouveau bâtiment et activité de stockage, en service début mai 2026 ;
// 26 salariés, 20 véhicules suivis dont 10 porte-voitures, 24 000 véhicules transportés en 2025, démarche Objectif CO₂ ; livraisons chaque
// jour du Finistère vers la région parisienne (MIN de Rungis, plates-formes de la grande distribution, sites industriels), ramasses
// quotidiennes chez les producteurs locaux ; entrepôt sur racks, environ 1 000 palettes, ambiant seulement ; ZAC de Kergaradec, 29850
// Gouesnou. Les plants de pommes de terre se gardent entre 4 et 8 °C, jamais au gel (site Pelleau).
// JAMAIS écrit : la surface de l'entrepôt (les deux sources se contredisent : 1 000 / 1 600 m²), le nom du dirigeant, les logos de
// l'accueil du site comme clients.
// Vérifié par Claude Code le 19/10/2026 : textes de droit recopiés sur Légifrance (voir `DROIT_CONSULTE` plus bas) ; aucune entreprise
// « Biscuiterie Ar Vag », « Agri-Kerlann », « Ferme de Kervéguen » (recherche de Cowork du 18/10/2026, feuille de route §0.5, non refaite).
//
// Construit (à dire dans la séance : pied des documents, texte de fin de la carte, `MENTION`) : Erwan, Yann, Loïc, Maëlys et leurs
// fonctions (prénoms bretons courants, aucun salarié réel) ; les trois clients qui stockent (fictifs) et leurs palettes ; le plan du site
// (2 quais, zones, deux allées de racks, local de charge) ; le passage des ramasses par l'entrepôt avant de repartir ; la mise en forme
// des documents « Pelleau en bref » et « L'équipe de l'entrepôt » ; les messages. Distance Brest – Rungis : ≈ 580 km par la route
// (Kelbillet, non recoupé par Mappy) : on écrit « près de 600 km ».
//
// Dates (feuille de route §0.7 ; décision n° 9 du chef) : les messages sont datés de MAI 2026 (`ANNEE`), le mois réel de l'ouverture de
// l'entrepôt ; JAMAIS de jour de la semaine dans un message ou un document daté.
//
// Logo : `contenus/trames/logos/pelleau.png` (PNG du site officiel, 1940 × 445, récupéré par `outils/logo-pelleau.mjs`, lot A ; accord de
// Tristan du 18/10/2026 à 22 h 03 ; le site n'offre pas de SVG). Une seule couleur : bleu nuit #242d5b (relevée sur les pixels opaques).
//
// Charte : accent = le bleu nuit du logo, #242d5b. Contraste (WCAG) : 11,63 sur le papier #f4f1ea, 12,69 sur le panneau #fdfbf7, 13,11 avec
// du blanc dessus (≥ 4,5 partout). Teinte 230°, saturation 0,43 : ni rouge ni vert, le moteur (`accentRougeOuVert`) le garde dans la zone de
// travail ; il n'est pas le vert « juste ». ATTENTION : c'est un bleu, de la famille du « bleu client » des cartes de transport (`--lc-bleu`,
// un bleu moyen #3b7be0 mêlé d'encre) ; il est nettement plus sombre. La carte d'ENT-10.1 montre Rungis en bleu client (type `magasin`) : à
// vérifier à l'écran que le bandeau et la carte ne se confondent pas (comme Action, #195799). Thème papier : les documents sont des papiers clairs.

import { catalogueSimple } from './entreprise-commun.js';

export const LOGO = './contenus/trames/logos/pelleau.png';

export const ENTREPRISE = {
  id: 'pelleau',
  nom: 'Transports Pelleau',
  sousTitre: 'Entrepôt neuf de Gouesnou (29) — transport et stockage',
  exercice: 'Bienvenue chez Pelleau',
  logo: LOGO,
};

export const VOCAB = {
  unit: 'palette', unitPl: 'palettes',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'pelleau-gouesnou.example',
};

export const THEME = { accent: '#242d5b', papier: true };

// Ce qui est réel et ce qui est construit, dit à l'élève (accueil des séances, fin de la carte).
export const MENTION = 'Réels : les Transports Pelleau, leur histoire, leur entrepôt neuf de Gouesnou, leurs camions vers la région parisienne. '
  + 'Construits : Erwan, Yann, Loïc et Maëlys (prénoms et fonctions), les clients qui stockent à l’entrepôt (entreprises fictives), le plan du '
  + 'site, le passage des ramasses par l’entrepôt et tous les documents.';

// ─────────────────────────────────────────── l'heure du scénario (mai 2026, aucun jour de la semaine écrit)
// `heureScenario(jour, 'hh:mm', { db, volet, decalage })` : le `jour` de mai 2026 à cette heure, plus le temps réellement passé depuis
// l'ouverture de la séance (`db.volets[volet]`) et `decalage` minutes : un message déclenché arrive après l'accueil.
export const ANNEE = 2026;
export function heureScenario(jour, hhmm, { db, volet, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && volet && db.volets[volet]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(ANNEE, 4, jour, h, mn).getTime() + ecoule + decalage * 60000;
}
// Les jours de la semaine, pour les TESTS (aucun message ne doit en contenir un).
export const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

// ─────────────────────────────────────────── le site (construit) : 2 quais, des zones, deux allées de racks, le local de charge
export const LIEUX = {
  site: 'Entrepôt des Transports Pelleau, ZAC de Kergaradec, Gouesnou (29)',
  quais: ['Quai A', 'Quai B'],
  reception: 'Zone de réception',
  controle: 'Zone de contrôle',
  litiges: 'Zone litiges',
  bureau: 'Bureau transport',
  vestiaire: 'Vestiaire',
  allees: ['Allée A', 'Allée B'],
  charge: 'Local de charge des transpalettes',
};

// Le plan de l'entrepôt (vue « Plan d'entrepôt », mode `visite` d'ENT-10.2) : même forme que `PLAN_RECEPTION` d'ENT-8.2 (déjà chargée
// par le moteur). Deux allées de racks (le stock ambiant), les zones nommées à droite des racks, les deux quais sur le mur du bas. Le local
// de charge n'est pas une zone du moteur : il est dit dans la note du vestiaire (il est à côté, brief ENT-10.2 §4, arrêt 1).
export const PLAN_ENTREPOT = {
  allees: [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],
  cotes: { A1: { gammes: [] }, A2: { gammes: [] }, B1: { gammes: [] }, B2: { gammes: [] } },
  travees: 4, niveaux: 1, emplacements: 1,
  zones: {
    litiges: ['L1', 'L2'], bureau: 'bureau transport', quais: LIEUX.quais,
    vestiaire: { note: 'EPI ; à côté : le local de charge des transpalettes' }, controle: { note: 'compter, regarder l’état' },
  },
};

// ─────────────────────────────────────────── l'équipe (construite) : au TU entre collègues
// `metier` et `phrase` : la carte de chaque personne dans le document « L'équipe de l'entrepôt » ; `picto` : son pictogramme (aucun visage).
export const EQUIPE = {
  erwan: { nom: 'Erwan', role: 'responsable de l’entrepôt (ton tuteur)', appel: 'Erwan', registre: 'tu',
    metier: 'Responsable de l’entrepôt', picto: 'responsable',
    phrase: 'Je dirige l’entrepôt. Je suis ton tuteur : je te donne les consignes, je suis ton travail et je décide quand il y a un problème.' },
  yann: { nom: 'Yann', role: 'magasinier-cariste', appel: 'Yann', registre: 'tu',
    metier: 'Magasinier-cariste', picto: 'cariste',
    phrase: 'Je décharge les camions et je range les palettes dans les racks, avec le chariot élévateur. Je prépare aussi les engins le matin.' },
  loic: { nom: 'Loïc', role: 'conducteur', appel: 'Loïc', registre: 'tu',
    metier: 'Conducteur', picto: 'conducteur',
    phrase: 'Je conduis un camion Pelleau. Le matin, je fais la tournée de ramasse chez les producteurs, puis je reviens à l’entrepôt.' },
  maelys: { nom: 'Maëlys', role: 'agent d’exploitation au bureau transport', appel: 'Maëlys', registre: 'tu',
    metier: 'Agent d’exploitation', picto: 'exploitation',
    phrase: 'Au bureau transport, je fais le planning des camions et j’enregistre dans l’ordinateur ce que l’entrepôt reçoit.' },
};
export const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;

// ─────────────────────────────────────────── les clients qui stockent à l'entrepôt (TOUS fictifs, feuille de route §0.5)
// Format de `docs/briefs/MOTEUR-depose-par-client.md` §2 : `{ nom, court }` (le nom long pour la bulle et le bilan, le court écrit au sol,
// en capitales). En plus (construit) : la ville, générique ; le produit ; le conditionnement. Kervéguen n'apparaît qu'en ENT-10.11 et 10.12.
export const CLIENTS = {
  'ar-vag': { nom: 'Biscuiterie Ar Vag', court: 'AR VAG', ville: 'près de Landerneau', produit: 'biscuits', conditionnement: 'cartons' },
  'agri-kerlann': { nom: 'Agri-Kerlann', court: 'AGRI-KERLANN', ville: 'près de Lesneven', produit: 'terreau et engrais',
    conditionnement: 'sacs' },
  kerveguen: { nom: 'Ferme de Kervéguen', court: 'KERVÉGUEN', ville: 'dans le Léon', produit: 'plants de pommes de terre',
    conditionnement: 'sacs', temperature: 'Conserver entre 4 et 8 °C — craint le gel' },
};
export const MENTION_FICTIF = 'entreprise fictive';
// Ajouté par ENT-10.5 (19/10/2026) : le nom écrit AU SOL d'une case de dépose (vue quai, dépose par client) quand `court` ne s'y lit pas à
// 1366 × 768 (« AGRI-KERLANN » sort sur deux lignes, en petit : compte rendu du lot D). PROPOSITION de Claude Code, à valider à l'écran par
// Tristan ; `CLIENTS` ne change pas (ENT-10.1 le lit). `clientsDepose(ids)` rend `depose.clients` au format du moteur ({ nom, court } seulement).
export const AU_SOL = { 'agri-kerlann': 'AGRI' };
export const clientsDepose = (ids) => Object.fromEntries(ids.map((id) => [id, { nom: CLIENTS[id].nom, court: AU_SOL[id] || CLIENTS[id].court }]));

// ─────────────────────────────────────────── les palettes types (construites ; reprises par ENT-10.5 à 10.12)
// Une palette = des colis rangés en couches : `couches` × `parCouche` = `colis` (palette complète). Désignations génériques, références au
// format « client en 2 lettres + 5 chiffres », poids construits. ENT-10.5 §6 : Ar Vag 5 couches × 8 cartons, Agri-Kerlann 4 couches × 10 sacs.
export const PALETTE_AR_VAG = { client: 'ar-vag', ref: 'AV-20418', designation: 'Biscuits au beurre, cartons de 12 paquets',
  unite: 'carton', unitePl: 'cartons', couches: 5, parCouche: 8, colis: 40, poidsColis: 4 };
export const PALETTE_AGRI = { client: 'agri-kerlann', ref: 'AK-31205', designation: 'Terreau universel, sacs de 40 L',
  unite: 'sac', unitePl: 'sacs', couches: 4, parCouche: 10, colis: 40, poidsColis: 15 };
export const PALETTE_KERVEGUEN = { client: 'kerveguen', ref: 'KG-10633', designation: 'Plants de pommes de terre, sacs de 25 kg',
  unite: 'sac', unitePl: 'sacs', couches: 4, parCouche: 8, colis: 32, poidsColis: 25,
  temperature: { min: 4, max: 8 }, etiquette: CLIENTS.kerveguen.temperature };
export const PALETTES_TYPES = { 'ar-vag': PALETTE_AR_VAG, 'agri-kerlann': PALETTE_AGRI, kerveguen: PALETTE_KERVEGUEN };

// ─────────────────────────────────────────── les photos (aucun visage) : deux de Pelleau, les autres d'Action
// `racks` et `semi` : photos du site de Transports Pelleau, récupérées par `outils/photos-pelleau.mjs` (19/10/2026, accord de Tristan),
// rangées dans `contenus/images/pelleau/` (crédits : `CREDITS.md`, section « Transports Pelleau »). `chariot` et `quai` : fichiers et mentions
// de `contenus/images/action/CREDITS.md` (Pexels), repris tels quels (Pelleau n'a pas de photo de chariot sur son site).
const IMG = './contenus/images/action/';
const IMG_PELLEAU = './contenus/images/pelleau/';
export const PHOTOS = {
  racks: { src: IMG_PELLEAU + 'entrepot-racks.jpg', alt: 'Une grande allée d’entrepôt entre deux rangées de racks orange et bleu, vides, avec un chariot jaune au fond à droite',
    mention: 'Photo : Transports Pelleau' },
  semi: { src: IMG_PELLEAU + 'camion-pelleau-port.jpg', alt: 'Un camion blanc et bleu marine, avec une grande remorque ornée de pommes de terre, garé sur un quai de port devant une grue',
    mention: 'Photo : Transports Pelleau' },
  chariot: { src: IMG + 'chariot-elevateur.jpg', alt: 'Un chariot élévateur orange, fourches baissées, dans un entrepôt',
    mention: 'Photo d’un autre entrepôt — Ani Set / Pexels' },
  quai: { src: IMG + 'quai-camion.jpg', alt: 'Trois remorques blanches reculées contre des portes de quai, sous un ciel bleu',
    mention: 'Photo d’un autre quai — ELEVATE / Pexels' },
};

// ─────────────────────────────────────────── le lexique commun (mots cliquables, niveau CAP : une phrase, des mots simples)
export const LEXIQUE = {
  transporteur: 'Entreprise qui déplace la marchandise des autres d’un lieu à un autre, avec ses camions.',
  entreposeur: 'Entreprise qui garde dans son entrepôt la marchandise de ses clients, et la leur rend quand ils la demandent.',
  'prestataire logistique': 'Entreprise qui fait la logistique pour le compte d’une autre : transporter, stocker, préparer les commandes.',
  ramasse: 'Tournée d’un camion pour aller chercher la marchandise chez plusieurs expéditeurs.',
  MIN: 'Marché d’intérêt national : un très grand marché de gros. Celui de Rungis, au sud de Paris, reçoit chaque nuit des fruits, des légumes, de la viande…',
  'grande distribution': 'Les grandes chaînes de supermarchés et d’hypermarchés, et leurs entrepôts (plates-formes).',
  holding: 'Société qui possède d’autres sociétés et les regroupe en un groupe.',
  'stock ambiant': 'Marchandise gardée sans froid, à la température de l’entrepôt.',
  rack: 'Grand rayonnage en métal où l’on range les palettes en hauteur.',
  magasinier: 'Personne qui reçoit, contrôle, range et prépare la marchandise dans un entrepôt.',
  tuteur: 'Personne de l’entreprise qui t’accueille pendant ton stage, te donne les consignes et suit ton travail.',
  primeurs: 'Fruits et légumes frais, souvent les premiers de la saison.',
  'porte-voitures': 'Camion qui transporte des voitures sur deux étages.',
  quai: 'Endroit de l’entrepôt où les camions se garent pour être chargés ou déchargés.',
  transpalette: 'Engin à deux fourches qui sert à déplacer une palette au sol.',
};

// ─────────────────────────────────────────── ce que le moteur exige (aucun article en jeu)
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return {
    v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
    customers: [], suppliers: [], seq: 1, _depart: [],
  };
}

// ─────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
// Les classes `pe-*` sont propres à Pelleau. Tout document reconstitué porte le pied `PIED` (décision n° 16 du chef, mot pour mot).
export const PIED = 'Document pédagogique — reconstitution, non contractuel. Les clients cités sont des entreprises fictives.';
export const STYLE_DOCUMENTS = `
--douce:#555047;
.pe-doc{padding:14px 18px 0}
.pe-doc p{margin:0 0 8px}
.pe-logo{display:block; height:38px; width:auto; margin:0 0 10px}
.pe-t{margin:0; font-size:1.08rem; font-weight:800}
.pe-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.pe-entete{display:flex; justify-content:space-between; align-items:baseline; gap:8px; border-bottom:2px solid var(--encre); padding-bottom:6px; margin-bottom:8px}
.pe-entete b{font-size:1.02rem}
.pe-entete span{font-size:.78rem; color:var(--douce); text-align:right}
.pe-ul{margin:6px 0 0; padding-left:20px; font-size:.92rem}
.pe-ul li{margin:4px 0}
.pe-frise{list-style:none; margin:6px 0 10px; padding:0 0 0 6px; border-left:3px solid var(--encre)}
.pe-frise li{display:flex; gap:12px; align-items:baseline; margin:0 0 7px; font-size:.95rem; line-height:1.35}
.pe-an{flex:0 0 3.2em; font-weight:800; font-size:1.02rem}
.pe-cartes{display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:6px 0 4px}
.pe-carte{display:flex; gap:10px; align-items:flex-start; border:1.5px solid #cfc8ba; border-radius:6px; padding:8px 10px}
.pe-carte p{margin:2px 0 0; font-size:.9rem; line-height:1.35}
.pe-carte b{font-size:1rem}
.pe-carte .pe-metier{display:block; font-size:.84rem; color:var(--douce)}
.pe-picto{flex:0 0 34px; width:34px; height:34px}
.pe-art{margin:10px 0 2px}
.pe-loi{margin:2px 0 6px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.pe-loi p{margin:0 0 4px}
.pe-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Le pied d'un document (texte simple, échappé ; le pied imposé par défaut).
export const pied = (texte = PIED) => `<p class="pe-pied">${ech(texte)}</p>`;
// Un en-tête de document : qui l'émet, à droite ses références (textes simples).
export const entete = (qui, refs = []) => `<div class="pe-entete"><b>${ech(qui)}</b><span>${refs.map(ech).join('<br>')}</span></div>`;

// Les pictogrammes des métiers (traits seulement, aucun visage) : document « L'équipe de l'entrepôt ».
const TRAIT = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const PICTOS = {
  // une planchette à pince et sa liste : celui qui dirige et donne les consignes
  responsable: '<rect x="6" y="5" width="20" height="24" rx="2"/><path d="M12 5 V3 H20 V5"/><path d="M10 12 H22 M10 17 H22 M10 22 H17"/>',
  // un chariot élévateur : mât, fourches, roues
  cariste: '<path d="M4 25 V15 H14 L17 21 V25"/><path d="M8 15 V9 H13 L15 15"/><path d="M22 4 V26 M22 26 H30"/><circle cx="8" cy="26" r="2.5"/><circle cx="16" cy="26" r="2.5"/>',
  // un camion porteur : caisse, cabine, roues
  conducteur: '<rect x="2" y="9" width="18" height="14" rx="1"/><path d="M20 13 H26 L30 18 V23 H20"/><circle cx="8" cy="25" r="2.5"/><circle cx="24" cy="25" r="2.5"/>',
  // un écran d'ordinateur et un planning
  exploitation: '<rect x="3" y="5" width="26" height="17" rx="1.5"/><path d="M12 27 H20 M16 22 V27"/><path d="M7 10 H14 M7 14 H20 M7 18 H11"/>',
};
export const picto = (k) => `<svg class="pe-picto" viewBox="0 0 32 32" aria-hidden="true" ${TRAIT}>${PICTOS[k] || ''}</svg>`;

// « L'équipe de l'entrepôt » (ENT-10.1, étape 1) : quatre cartes, prénom, métier, une phrase, un pictogramme. Construit.
export const DOC_EQUIPE = { id: 'equipe', titre: 'L’équipe de l’entrepôt', court: 'L’équipe de l’entrepôt',
  html: `<article class="pe-doc" aria-label="L’équipe de l’entrepôt">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">L’équipe de l’entrepôt</p>
    <p class="pe-st">Entrepôt de Gouesnou — ceux avec qui tu vas travailler</p>
    <div class="pe-cartes">${Object.values(EQUIPE).map((p) => `<div class="pe-carte">${picto(p.picto)}<div><b>${ech(p.nom)}</b>
      <span class="pe-metier">${ech(p.metier)}</span><p>${ech(p.phrase)}</p></div></div>`).join('')}</div>
    ${pied('Document pédagogique — reconstitution, non contractuel. Les prénoms et les fonctions sont imaginés pour l’exercice.')}
  </article>` };

// « Pelleau en bref » (ENT-10.1, étape 3) : la frise (faits vérifiés du brief §2) et l'entreprise aujourd'hui. Mise en forme construite.
export const DOC_PELLEAU = { id: 'pelleau', titre: 'Pelleau en bref', court: 'Pelleau en bref',
  html: `<article class="pe-doc" aria-label="Pelleau en bref">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Pelleau en bref</p>
    <p class="pe-st">Une entreprise familiale du Finistère, née à Plabennec</p>
    <ol class="pe-frise">
      <li><span class="pe-an">1930</span><span>Gabriel Pelleau crée l’entreprise à Plabennec : il transporte du bétail et des matériaux de construction.</span></li>
      <li><span class="pe-an">1945</span><span>Les premiers [[primeurs]]. En 1960, ses trois fils reprennent : primeurs de Saint-Pol-de-Léon et du port de Brest.</span></li>
      <li><span class="pe-an">1989</span><span>Pelleau commence à transporter les plants de pommes de terre de Germicopa.</span></li>
      <li><span class="pe-an">1993</span><span>L’entreprise entre dans le groupe Sofipel, une [[holding]] née de Pelleau.</span></li>
      <li><span class="pe-an">2013</span><span>Pelleau transporte aussi des voitures neuves et d’occasion (les voitures accidentées depuis 1998).</span></li>
      <li><span class="pe-an">2026</span><span>Un entrepôt neuf à Gouesnou : Pelleau stocke aussi la marchandise de ses clients.</span></li>
    </ol>
    <p class="pe-t" style="font-size:.98rem">Aujourd’hui</p>
    <ul class="pe-ul">
      <li>Un [[transporteur]] : chaque jour, des camions partent du Finistère vers la région parisienne (le [[MIN]] de Rungis, les plates-formes de la
        [[grande distribution]], des usines). Chaque matin, des tournées de [[ramasse]] chez les producteurs.</li>
      <li>Des [[porte-voitures]] : 20 véhicules suivis, dont 10 porte-voitures ; 24 000 véhicules transportés en 2025.</li>
      <li>Et maintenant un [[entreposeur]] : l’entrepôt de Gouesnou (ZAC de Kergaradec), en service depuis mai 2026, garde environ 1 000 palettes
        sur [[rack|racks]], en [[stock ambiant]].</li>
      <li>26 salariés. Une démarche Objectif CO₂ pour moins polluer.</li>
    </ul>
    <p class="pe-st" style="margin-top:8px">Sources : site des Transports Pelleau ; Journal du Poids Lourd, 06/04/2026.</p>
    ${pied()}
  </article>` };

// ─────────────────────────────────────────── le droit (textes réels, recopiés de Légifrance)
// Textes RECOPIÉS sur Légifrance le 19/10/2026 par Claude Code (fiche de chaque article), mot pour mot ; seule la typographie est celle du
// site (apostrophe courbe ’).
//   Code civil 1927 : LEGIARTI000006445080 ; 1928 : LEGIARTI000006445087 ; 1932 : LEGIARTI000006445095 (versions en vigueur depuis le
//   21/03/1804, loi du 14 mars 1804).
//   Code du travail D4153-27 : LEGIARTI000028058805, version en vigueur depuis le 14/10/2013 (décret n° 2013-915 du 11 octobre 2013) ;
//   R4153-40 : LEGIARTI000033769318, version en vigueur depuis le 01/01/2017 (décret n° 2016-1908 du 27 décembre 2016) — la fin du texte
//   (« … du II de l’article R. 4624-23. ») est lue sur code.travail.gouv.fr, la page de Légifrance l'ayant coupée à la lecture ;
//   R4153-51 : LEGIARTI000028057958, version en vigueur depuis le 14/10/2013 (décret n° 2013-914 du 11 octobre 2013).
export const DROIT_CONSULTE = '19/10/2026';
export const ARTICLES_DEPOT = {
  1927: 'Le dépositaire doit apporter, dans la garde de la chose déposée, les mêmes soins qu’il apporte dans la garde des choses qui lui appartiennent.',
  1928: 'La disposition de l’article précédent doit être appliquée avec plus de rigueur : 1° si le dépositaire s’est offert lui-même pour recevoir le dépôt ; 2° s’il a stipulé un salaire pour la garde du dépôt ; 3° si le dépôt a été fait uniquement pour l’intérêt du dépositaire ; 4° s’il a été convenu expressément que le dépositaire répondrait de toute espèce de faute.',
  1932: 'Le dépositaire doit rendre identiquement la chose même qu’il a reçue. Ainsi, le dépôt des sommes monnayées doit être rendu dans les mêmes espèces qu’il a été fait, soit dans le cas d’augmentation, soit dans le cas de diminution de leur valeur.',
};
export const DOC_DROIT_DEPOT = { id: 'droit-depot', titre: 'Le droit : garder la marchandise d’un client', court: 'Le droit',
  html: `<article class="pe-doc" aria-label="Le droit : garder la marchandise d’un client">
    <p class="pe-t">Le droit : garder la marchandise d’un client</p>
    <p class="pe-st">Code civil — le dépôt. Le client est le déposant, Pelleau est le dépositaire.</p>
    <p class="pe-art"><b>Code civil, article 1927</b></p>
    <p class="pe-loi">« ${ARTICLES_DEPOT[1927]} »</p>
    <p class="pe-art"><b>Code civil, article 1928</b></p>
    <p class="pe-loi">« ${ARTICLES_DEPOT[1928]} »</p>
    <p class="pe-art"><b>Code civil, article 1932</b></p>
    <p class="pe-loi">« ${ARTICLES_DEPOT[1932]} »</p>
    <p class="pe-st" style="margin-top:10px">Ce que ça veut dire chez Pelleau</p>
    <ul class="pe-ul">
      <li>Le client <b>paie</b> Pelleau pour garder sa marchandise : Pelleau doit en prendre soin <b>avec plus de rigueur</b> encore.</li>
      <li>Pelleau doit <b>rendre la même marchandise</b>, telle qu’il l’a reçue.</li>
    </ul>
    ${pied(`Textes réels, recopiés de Légifrance (consulté le ${DROIT_CONSULTE}). Explication : document pédagogique.`)}
  </article>` };

export const ARTICLES_JEUNES = {
  'D4153-27': ['I. - Il est interdit d’affecter les jeunes à la conduite d’équipements de travail mobiles automoteurs et d’équipements de travail servant au levage.',
    'II. - Il peut être dérogé à l’interdiction mentionnée au I dans les conditions et formes prévues à la section 3 du présent chapitre.'],
  'R4153-40': ['L’employeur ou le responsable de l’établissement mentionné à l’article L. 4111-1 et le chef d’établissement mentionné aux articles R. 4153-38 et R. 4153-39 peuvent, pour une durée de trois ans à compter de l’envoi de la déclaration prévue à l’article R. 4153-41, affecter des jeunes aux travaux interdits susceptibles de dérogation mentionnés à la section 2 du présent chapitre, sous réserve de satisfaire aux conditions suivantes :',
    '1° Avoir procédé à l’évaluation prévue aux articles L. 4121-3 et suivants, comprenant une évaluation des risques existants pour les jeunes et liés à leur travail ; cette évaluation est préalable à l’affectation des jeunes à leurs postes de travail ;',
    '2° Avoir, à la suite de cette évaluation, mis en œuvre les actions de prévention prévues au deuxième alinéa de l’article L. 4121-3 ;',
    '3° Avant toute affectation du jeune à ces travaux :',
    'a) Pour l’employeur, en application des articles L. 4141-1 et suivants, avoir informé le jeune sur les risques pour sa santé et sa sécurité et les mesures prises pour y remédier et lui avoir dispensé la formation à la sécurité en s’assurant qu’elle est adaptée à son âge, son niveau de formation et son expérience professionnelle ;',
    'b) Pour le chef d’établissement, lui avoir dispensé la formation à la sécurité prévue dans le cadre de la formation professionnelle assurée, adaptée à son âge, son niveau de formation et son expérience professionnelle et en avoir organisé l’évaluation.',
    'Dans les établissements mentionnés au 4° de l’article R. 4153-39, par dérogation aux dispositions qui précèdent, le chef d’établissement doit avoir mis en œuvre l’information et la formation mentionnées au a ou, lorsque la formation assurée conduit à un diplôme technologique ou professionnel, avoir mis en œuvre la formation à la sécurité et son évaluation mentionnées au b.',
    '4° Assurer l’encadrement du jeune en formation par une personne compétente durant l’exécution de ces travaux ;',
    '5° Avoir obtenu, pour chaque jeune, la délivrance d’un avis médical d’aptitude. Cet avis médical est délivré chaque année soit par le médecin du travail pour les salariés, soit par le médecin chargé du suivi médical des élèves et des étudiants, des stagiaires de la formation professionnelle ou des jeunes accueillis dans les établissements mentionnés au 4° de l’article R. 4153-39.',
    'Tout jeune affecté aux travaux mentionnés au premier alinéa bénéficie du suivi individuel renforcé de son état de santé prévu aux articles R. 4624-22 à R. 4624-28 en application du II de l’article R. 4624-23.'],
  'R4153-51': ['Les jeunes travailleurs peuvent être affectés à la conduite d’équipements de travail mobiles automoteurs et d’équipements de travail servant au levage lorsqu’ils ont reçu la formation prévue à l’article R. 4323-55 et s’ils sont titulaires de l’autorisation de conduite prévue à l’article R. 4323-56, s’agissant des équipements dont la conduite est subordonnée à l’obtention d’une telle autorisation.'],
};
const loi = (L) => `<div class="pe-loi">${L.map((p, i) => `<p>${i === 0 ? '« ' : ''}${ech(p)}${i === L.length - 1 ? ' »' : ''}</p>`).join('')}</div>`;
export const DOC_DROIT_JEUNES = { id: 'droit-jeunes', titre: 'Le droit : un jeune peut-il conduire un engin ?', court: 'Le droit',
  html: `<article class="pe-doc" aria-label="Le droit : un jeune peut-il conduire un engin ?">
    <p class="pe-t">Le droit : un jeune peut-il conduire un engin ?</p>
    <p class="pe-st">Code du travail — les jeunes de moins de 18 ans et les engins qui roulent tout seuls (transpalette électrique, chariot)</p>
    <p class="pe-art"><b>Code du travail, article D4153-27</b></p>
    ${loi(ARTICLES_JEUNES['D4153-27'])}
    <p class="pe-art"><b>Code du travail, article R4153-40</b></p>
    ${loi(ARTICLES_JEUNES['R4153-40'])}
    <p class="pe-art"><b>Code du travail, article R4153-51</b></p>
    ${loi(ARTICLES_JEUNES['R4153-51'])}
    ${pied(`Textes réels, recopiés de Légifrance (consulté le ${DROIT_CONSULTE}).`)}
  </article>` };
