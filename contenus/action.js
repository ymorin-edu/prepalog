// Action (entrepôt Geodis d’Ensuès-la-Redonne, Bouches-du-Rhône) — l’univers commun des séances ENT-8.x (CAP OL, guidage C1.1 et C1.2).
// Créé pour ENT-8.1 (brief `docs/briefs/ENT-8.1-action-se-situer.md` §6), partagé avec ENT-8.2 : À LIRE, jamais à redéclarer dans une
// séance (identité, charte, équipe, lieux de la carte, lexique, document « Action et Geodis en bref », photos). Chaque séance apporte
// ses messages, ses fiches, ses banques et ses jalons. Aucun effet de bord à l’import : que des constantes et des fonctions pures.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (brief ENT-8.1 §2 ; relevés de Claude Code le 15/10/2026)
//
// Vérifié (Cowork, 15/10/2026, sources dans la fiche du projet `claude/prepalog-action-recherche.md`) : Action, enseigne néerlandaise de
// magasins à petits prix (fondée en 1993, siège à Zwaagdijk-Oost, détenue en majorité par le fonds 3i) ; l’entrepôt Action d’Ensuès-la-
// Redonne (Bouches-du-Rhône), exploité par Geodis, qui livre les magasins du Sud-Est ; Geodis, filiale de la SNCF ; le hub d’import
// d’Action à Gonfreville-l’Orcher (port du Havre) — réel mais seulement comme TITRE d’une actualité d’Action (le corps de la page n’a pas
// pu être lu) ; les six entrepôts Action en France ; le magasin Action de Nîmes Cap Costières (place André Bazile).
// Vérifié par Claude Code (OpenStreetMap, Nominatim, 15/10/2026) : le magasin « Action », place André Bazile, 30900 Nîmes (nœud
// OSM 7014671783, étiqueté `shop=variety_store`, `brand=Action`) ; un bâtiment « Action » (`building=warehouse`, relevé sur le terrain) au
// Parc logistique des Aiguilles, Ensuès-la-Redonne (chemin OSM 1123368842) ; un bâtiment « Action », ZAC Grand Sud Logistique,
// Labastide-Saint-Pierre (chemin OSM 631031263). L’objet OSM d’Ensuès ne dit pas que Geodis l’exploite : cela vient de la recherche de Cowork.
// APPROCHÉ (dit ici et dans le compte rendu du brief) : le hub d’import n’existe pas dans OpenStreetMap sous le nom d’Action ; sa position
// sur la carte est le CENTRE de la commune de Gonfreville-l’Orcher (relation OSM 411190), pas l’adresse du hub. Idem pour les « autres »
// villes, les repères et les quatre autres entrepôts du réseau : centre de la commune.
// Construit (à dire dans la séance) : Samia, Kevin, Julie et leurs fonctions ; le trajet Le Havre → Ensuès → Nîmes ; le fait
// qu’Ensuès livre le magasin de Cap Costières ; le document « Action et Geodis en bref » (mise en forme, choix des faits) ; les messages.
// Photos : toutes libres (Pexels), AUCUNE d’Action ni de Geodis, aucun visage ; voir `contenus/images/action/CREDITS.md`.
//
// Logo : `contenus/trames/logos/action.svg` (Wikimedia Commons, PD-textlogo, mais marque ; accord de Tristan, brief §2). Bleu
// `#195799` (lettres) et cyan `#00bbf1` (barres). Les autres logos d’entreprise sont dans `contenus/trames/logos/` : il y est rangé (chemin `LOGO`), les photos restent dans `contenus/images/action/`. Ancien texte :
// une ligne à changer ici (`LOGO`) et dans `ENTREPRISES` de `activites/index.js`.
//
// Charte : accent = le bleu du logo, #195799 (6,50 sur le papier #f4f1ea, 7,09 sur le panneau #fdfbf7 ; 7,33 avec du blanc dessus).
// Teinte 211° : ni rouge ni verte, donc le moteur (`accentRougeOuVert`) le garde dans la zone de travail. ATTENTION : c’est aussi la
// teinte du « bleu client » des cartes de transport ; la vue « Localiser » doit être vérifiée à l’écran (l’accent ne doit pas se
// confondre avec le bleu du magasin sur la carte), cf. brief ENT-8.1 §2 « Charte ». Thème papier (comme Decathlon).

import { catalogueSimple } from './entreprise-commun.js';

const IMG = './contenus/images/action/';
export const LOGO = './contenus/trames/logos/action.svg';

export const ENTREPRISE = {
  id: 'action',
  nom: 'Action',
  sousTitre: 'Entrepôt Geodis d’Ensuès-la-Redonne (13) — commerce à petits prix',
  exercice: 'Bienvenue chez Geodis',
  logo: LOGO,
};

export const VOCAB = {
  unit: 'palette', unitPl: 'palettes',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'geodis-ensues.example',
};

export const THEME = { accent: '#195799', papier: true };

// Ce qui est réel et ce qui est construit, dit à l’élève (accueil et fin de la carte). Mention de ENT-8.1 §0 n° 8.
export const MENTION = 'Réels : Action (magasins à petits prix), Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), '
  + 'le port du Havre. Construit : Samia, Kevin et Julie, leurs fonctions et leurs prénoms, le trajet du Havre à Ensuès puis au magasin de Nîmes, '
  + 'le fait qu’Ensuès livre ce magasin, tous les documents. La place du hub sur la carte est approchée.';

// ─────────────────────────────────────────── l’équipe (construite) : au TU entre collègues
export const EQUIPE = {
  samia: { nom: 'Samia', role: 'cheffe d’équipe à la réception (ta tutrice)', appel: 'Samia', registre: 'tu' },
  kevin: { nom: 'Kevin', role: 'cariste', appel: 'Kevin', registre: 'tu' },
  julie: { nom: 'Julie', role: 'agent administratif', appel: 'Julie', registre: 'tu' },
};
export const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;

// ─────────────────────────────────────────── les lieux de la carte (ENT-8.1 §6.1) : déclaration `localiser.lieux`
// Positions `[longitude, latitude]` relevées dans OpenStreetMap (Nominatim, 15/10/2026), arrondies à 4 décimales (≈ 10 m).
// `osm` = l’objet OSM cité. Codes `dep` et `region` : INSEE (COG) ; le contrôle de la vue vérifie qu’ils vont ensemble et que chaque
// point est dans son département (rejoué ici avec `contenus/france-contours.js` : les 16 points sont DANS, régions 76 / 93 / 28 / 76).
// Distances (haversine) du bon point à ses « autres » : Gard 22,7 / 23,2 / 41,3 km ; Bouches-du-Rhône 26,5 / 30,2 / 56,3 km ;
// Seine-Maritime 30,0 / 62,5 / 76,7 km ; Tarn-et-Garonne 26,3 / 27,7 / 32,5 km (toutes au-dessus des 8 km minimum de la vue).
// Le Havre est un repère du port (à 9,2 km de Gonfreville), pas un « autre ».
// `etiq` (place du nom sur la carte de fin : h, b, g, d) : PROPOSITION, à régler à l’écran. Textes du panneau : ceux du brief.
export const LIEUX = [
  { id: 'magasin', lettre: 'M', type: 'magasin',
    nom: 'Action Nîmes Cap Costières', role: 'Le magasin que ton entrepôt livre.',
    ville: 'Nîmes', dep: '30', region: '76',
    lonlat: [4.3558, 43.8087], osm: 'node 7014671783',
    autres: [
      { ville: 'Alès', lonlat: [4.0853, 44.1254], osm: 'relation 76009' },
      { ville: 'Uzès', lonlat: [4.4197, 44.0121], osm: 'relation 380050' },
      { ville: 'Beaucaire', lonlat: [4.6393, 43.8085], osm: 'relation 384088' },
    ],
    reperes: [{ ville: 'Montpellier', lonlat: [3.8767, 43.6112] }, { ville: 'Avignon', lonlat: [4.8059, 43.9492] }],
    indice: 'Au sud du département, entre Montpellier et Avignon.', etiq: 'h' },
  { id: 'entrepot', lettre: 'E', type: 'entrepot',
    nom: 'Entrepôt Action d’Ensuès-la-Redonne', role: 'Geodis y stocke et prépare les commandes des magasins Action du Sud-Est.',
    ville: 'Ensuès-la-Redonne', dep: '13', region: '93',
    lonlat: [5.1942, 43.3784], osm: 'way 1123368842',
    autres: [
      { ville: 'Aix-en-Provence', lonlat: [5.4475, 43.5298], osm: 'relation 70279' },
      { ville: 'Arles', lonlat: [4.631, 43.6776], osm: 'relation 73911' },
      { ville: 'Salon-de-Provence', lonlat: [5.098, 43.6405], osm: 'relation 70295' },
    ],
    reperes: [{ ville: 'Marseille', lonlat: [5.3778, 43.2964] }],
    indice: 'Au bord de la mer, juste à l’ouest de Marseille.', etiq: 'b' },
  // Position APPROCHÉE : centre de la commune (le hub n’est pas dans OSM sous le nom d’Action).
  { id: 'port', lettre: 'P', type: 'port',
    nom: 'Hub d’import d’Action, port du Havre', role: 'Les produits venus d’Asie arrivent ici par bateau.',
    ville: 'Gonfreville-l’Orcher', dep: '76', region: '28',
    lonlat: [0.2338, 49.5039], osm: 'relation 411190',
    autres: [
      { ville: 'Rouen', lonlat: [1.094, 49.4405], osm: 'relation 75628' },
      { ville: 'Dieppe', lonlat: [1.0791, 49.9246], osm: 'relation 110435' },
      { ville: 'Fécamp', lonlat: [0.3764, 49.7572], osm: 'relation 109976' },
    ],
    reperes: [{ ville: 'Le Havre', lonlat: [0.108, 49.4939] }],
    indice: 'Juste à l’est du Havre, au bord de l’estuaire de la Seine.', etiq: 'g' },
  // Lieu BONUS (chez un confirmé seulement, jamais d’indice).
  { id: 'labastide', lettre: 'E', type: 'entrepot', bonus: true,
    nom: 'Entrepôt Action de Labastide-Saint-Pierre', role: 'Un autre entrepôt Action : il livre d’autres magasins.',
    ville: 'Labastide-Saint-Pierre', dep: '82', region: '76',
    lonlat: [1.3121, 43.9171], osm: 'way 631031263',
    autres: [
      { ville: 'Moissac', lonlat: [1.0847, 44.1051], osm: 'relation 144906' },
      { ville: 'Caussade', lonlat: [1.5365, 44.1608], osm: 'relation 253322' },
      { ville: 'Beaumont-de-Lomagne', lonlat: [0.9876, 43.8818], osm: 'relation 228335' },
    ],
    reperes: [{ ville: 'Montauban', lonlat: [1.355, 44.0176] }, { ville: 'Toulouse', lonlat: [1.4442, 43.6045] }],
    etiq: 'g' },   // pas d’`indice` : lieu bonus, réservé au niveau confirmé
];

// L’ordre du trajet de la marchandise, montré à la fin de la carte.
export const FLUX = ['port', 'entrepot', 'magasin'];

// Les autres entrepôts Action de France (ronds creux). Labastide est aussi un lieu bonus : la vue ne la dessine pas deux fois.
// Centres de commune (OSM, Nominatim), donc positions APPROCHÉES.
export const RESEAU = {
  libelle: 'autres entrepôts Action',
  sites: [
    { ville: 'Moissy-Cramayel', lonlat: [2.5937, 48.6272] },
    { ville: 'Labastide-Saint-Pierre', lonlat: [1.3121, 43.9171] },
    { ville: 'Belleville-en-Beaujolais', lonlat: [4.7216, 46.1144] },
    { ville: 'Verrières-en-Anjou', lonlat: [-0.4675, 47.5179] },
    { ville: 'Onnaing', lonlat: [3.6011, 50.3871] },
  ],
};

// D’où vient chaque position (pour le compte rendu et les tests) : `releve` = l’objet d’OpenStreetMap est l’établissement lui-même ;
// `approche` = centre de commune.
export const PROVENANCE = { magasin: 'releve', entrepot: 'releve', port: 'approche', labastide: 'releve' };

// ─────────────────────────────────────────── formats
const z2 = (n) => String(n).padStart(2, '0');
export const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export { z2 };

// ─────────────────────────────────────────── le lexique commun (mots cliquables, niveau CAP : une phrase, des mots simples)
export const LEXIQUE = {
  entrepôt: 'Grand bâtiment où l’on range les produits et où l’on prépare les commandes avant de les envoyer aux magasins.',
  prestataire: 'Entreprise qui fait un travail pour le compte d’une autre. Geodis est le prestataire d’Action : elle fait tourner l’entrepôt, les produits restent à Action.',
  'hub d’import': 'Grand site où arrivent les produits venus de l’étranger, avant d’être envoyés vers les entrepôts.',
  'chaîne logistique': 'Tout le chemin d’un produit, de l’usine jusqu’au client : transports, entrepôts, magasin.',
  région: 'Grande partie de la France. Chaque région est découpée en départements.',
  département: 'Partie d’une région, avec un numéro (le Gard, c’est le 30). Il contient des villes et des villages.',
  filmer: 'Entourer une palette de film plastique pour que les colis tiennent ensemble pendant le transport.',
  enseigne: 'Le nom sous lequel un commerce est connu. Tous les magasins Action ont la même enseigne.',
  planigramme: 'Tableau qui montre quel camion arrive, à quelle heure et à quel quai.',
  créneau: 'Heure et quai réservés pour un camion.',
  quai: 'Endroit de l’entrepôt où les camions se garent pour être chargés ou déchargés.',
  réceptionnaire: 'Personne qui reçoit les marchandises à l’arrivée du camion et vérifie qu’elles sont bien celles attendues.',
  'zone litiges': 'Endroit où l’on met de côté la marchandise qui pose problème (abîmée, en trop, pas commandée).',
  EPI: 'Équipement de protection individuelle : chaussures de sécurité, gilet haute visibilité, gants…',
  WMS: 'Logiciel de l’entrepôt qui sait où est chaque produit et ce qu’il faut en faire.',
  'bon de commande': 'Document par lequel un client demande des produits à son fournisseur.',
  'bon de livraison': 'Document qui accompagne la livraison et liste ce que le fournisseur a envoyé.',
  'lettre de voiture': 'Document du transporteur qui accompagne la marchandise : qui envoie, qui reçoit, quoi, et par quel camion.',
  transpalette: 'Petit engin à deux fourches qui sert à déplacer une palette au sol.',
  niveleur: 'Plaque au bord du quai qui fait le pont entre le quai et le camion, pour passer avec l’engin.',
  'rendre compte': 'Dire à son chef ce qu’on a fait ou vu.',
  tutrice: 'Personne de l’entreprise qui t’accueille pendant ton stage, te donne les consignes et suit ton travail.',
  tuteur: 'Personne de l’entreprise qui t’accueille pendant ton stage, te donne les consignes et suit ton travail.',
};

// ─────────────────────────────────────────── les photos (libres, ni Action ni Geodis, aucun visage)
// `mention` : ligne à afficher SOUS la photo (colonne « Mention » de `contenus/images/action/CREDITS.md`). `alt` : texte de
// remplacement, sans aucun nombre ni nom de marque.
export const PHOTOS = {
  entrepot: { src: IMG + 'entrepot-racks.jpg', alt: 'Une allée d’entrepôt entre deux rangées de racks à palettes chargées de cartons et de seaux',
    mention: 'Photo d’un autre entrepôt — Tiger Lily / Pexels' },
  rayon: { src: IMG + 'rayon-magasin.jpg', alt: 'Un bazar de produits ménagers : des balais et des serpillières accrochés en hauteur, des bassines et des seaux de toutes les couleurs empilés au sol',
    mention: 'Photo d’un autre magasin — Victoria Emerson / Pexels' },
  semi: { src: IMG + 'semi-remorque.jpg', alt: 'Un camion rouge avec une grande remorque blanche sur une route, en plein soleil',
    mention: 'Photo d’un autre camion — Quintin Gellar / Pexels' },
  palette: { src: IMG + 'palette-filmee.jpg', alt: 'Des piles de cartons posées sur des palettes et entourées de film plastique transparent',
    mention: 'Photo d’un autre entrepôt — Freek Wolsink / Pexels' },
  quai: { src: IMG + 'quai-camion.jpg', alt: 'Trois remorques blanches reculées contre des portes de quai, sous un ciel bleu',
    mention: 'Photo d’un autre quai — ELEVATE / Pexels' },
  transpalette: { src: IMG + 'transpalette-manuel.jpg', alt: 'Un transpalette rouge à timon posé dans le fond vide d’une remorque',
    mention: 'Photo d’un autre entrepôt — Caleb Oquendo / Pexels', electrique: false },
  gilet: { src: IMG + 'gilets-epi.jpg', alt: 'Des gilets orange à bandes réfléchissantes et des casques bleus, accrochés côte à côte',
    mention: 'Photo d’un autre site — Carsten Ruthemann / Pexels' },
  colis: { src: IMG + 'zone-colis.jpg', alt: 'Des palettes de cartons filmés, posées à même le sol d’un entrepôt, avec un ruban orange peint par terre',
    mention: 'Photo d’un autre entrepôt — Freek Wolsink / Pexels' },
  vestiaire: { src: IMG + 'vestiaire.jpg', alt: 'Un couloir de vestiaire entre deux rangées de casiers métalliques orange',
    mention: 'Photo d’un autre vestiaire — ubeyde oral / Pexels' },
};
// La photo d’entrepôt sert aussi à « racks » (brief ENT-8.2).
PHOTOS.racks = PHOTOS.entrepot;

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

// ─────────────────────────────────────────── les documents communs (papier, encre ; aucune couleur de repère)
// Les classes `ac-*` sont propres à Action (celles du site, `.pied`, `.note`…, s’appliqueraient aussi dans un document).
export const STYLE_DOCUMENTS = `
--douce:#555047;
.ac-doc{padding:14px 18px 0}
.ac-doc p{margin:0 0 8px}
.ac-t{margin:0; font-size:1.1rem; font-weight:800}
.ac-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.ac-logo{display:block; height:42px; width:auto; margin:0 0 10px}
.ac-l{display:flex; gap:10px; align-items:baseline; margin:0 0 8px; font-size:1rem; line-height:1.4}
.ac-n{flex:0 0 1.6em; font-weight:800; color:var(--ardoise)}
.ac-l p{margin:0}
.ac-fig{margin:6px 0 12px; max-width:420px}
.ac-fig img{display:block; width:100%; height:auto; border-radius:4px}
.ac-fig figcaption{margin-top:3px; font-size:.74rem; color:var(--douce)}
.ac-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;
export const PIED = (quoi) => `<p class="ac-pied">${quoi}</p>`;
export const PIED_RECONSTITUTION = 'Document pédagogique — reconstitution d’après des informations publiques, non contractuel.';

// Une figure : la photo, son texte de remplacement et la mention sous l’image.
export const figure = (id) => { const p = PHOTOS[id]; return `<figure class="ac-fig"><img src="${ech(p.src)}" alt="${ech(p.alt)}" loading="lazy"><figcaption>${ech(p.mention)}</figcaption></figure>`; };

// « Action et Geodis en bref » (brief ENT-8.1 §4, étape 1 : six lignes, une image par bloc — le logo d’Action, une photo d’entrepôt, une
// photo de rayon). Texte du brief, mot pour mot ; aucun chiffre qui donnerait une réponse de la fiche « Qui est qui ? ».
export const DOC_ACTION = { id: 'action', titre: 'Action et Geodis en bref', court: 'Action et Geodis en bref',
  html: `<article class="ac-doc" aria-label="Action et Geodis en bref">
    <img class="ac-logo" src="${LOGO}" alt="Logo d’Action">
    <p class="ac-t">Action et Geodis en bref</p>
    <p class="ac-st">Lis ces six lignes avant de remplir la fiche.</p>
    <div class="ac-l"><span class="ac-n">1</span><p>Action est une entreprise de magasins à petits prix. Elle vend des produits pour la maison, la déco, le bricolage, l’hygiène…</p></div>
    ${figure('rayon')}
    <div class="ac-l"><span class="ac-n">2</span><p>Il y a des magasins Action dans toute la France. On y trouve les mêmes produits partout.</p></div>
    <div class="ac-l"><span class="ac-n">3</span><p>Les produits sont fabriqués par des fournisseurs, souvent en Asie.</p></div>
    <div class="ac-l"><span class="ac-n">4</span><p>Pour remplir ses magasins, Action a des [[entrepôt|entrepôts]]. L’entrepôt d’Ensuès-la-Redonne, près de Marseille, livre les magasins du Sud-Est.</p></div>
    ${figure('entrepot')}
    <div class="ac-l"><span class="ac-n">5</span><p>Ce n’est pas Action qui fait tourner cet entrepôt : c’est <b>Geodis</b>, une entreprise de logistique. Les produits restent à Action.</p></div>
    <div class="ac-l"><span class="ac-n">6</span><p>Geodis appartient au groupe SNCF. Action appartient surtout à un fonds d’investissement.</p></div>
    ${PIED(PIED_RECONSTITUTION)}
  </article>` };
