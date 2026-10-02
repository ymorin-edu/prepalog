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

// Les sept destinataires de la tournée. Commerces INVENTÉS, à des adresses de rue RÉELLES.
// `zone` est le quartier : il n'apparaît à l'élève qu'après le repérage, ou s'il prend le
// filet de sécurité « je n'ai pas accès à Internet ».
//
// **Aucun nom de commerce ne nomme son propre quartier**, et c'est un test qui l'a attrapé :
// « Épicerie Fontaine » et « Caveau des Costières » donnaient la réponse dans leur enseigne.
// Ils sont devenus Verdier et Pélissier, deux patronymes gardois sans attache de quartier.
//
// Trois adresses, en revanche, nomment leur quartier et il n'y a rien à y faire : **quai de la
// Fontaine**, **route de Courbessac** et **rue de Grézan** sont des rues réelles, cohérentes
// avec la position de leur point, et les renommer serait mentir. Pour ces trois clients, le
// quartier vient avec l'adresse ; la CASE du quadrillage reste à lire sur le plan, et c'est
// elle qu'on corrige. Pour les quatre autres, l'élève doit vraiment aller chercher.
export const DESTINATAIRES = [
  { id: 'c1', nom: 'Le Comptoir des Halles', zone: 'Écusson',
    adresse: 'rue Général Perrier, 30000 Nîmes', x: 305, y: 200, kg: 31, colis: 4,
    marque: 'chocolats Marou', tel: '04 65 98 10 41' },
  { id: 'c2', nom: 'Épicerie Verdier', zone: 'Jardins de la Fontaine',
    adresse: 'quai de la Fontaine, 30900 Nîmes', x: 250, y: 120, kg: 24, colis: 3,
    marque: 'chocolats Marou', tel: '04 65 98 10 52' },
  { id: 'c3', nom: 'La Pointe Sud', zone: 'Ville Active',
    adresse: "rue de l'Hostellerie, 30900 Nîmes", x: 200, y: 330, kg: 58, colis: 7,
    marque: 'vaisselle Molleni', tel: '04 65 98 10 63' },
  { id: 'c4', nom: 'Maison Lauze', zone: 'Saint-Césaire',
    adresse: 'rue de Mascard, 30900 Nîmes', x: 120, y: 270, kg: 42, colis: 5,
    marque: 'vaisselle Molleni', tel: '04 65 98 10 74' },
  { id: 'c5', nom: 'Studio Garance', zone: 'Courbessac',
    adresse: 'route de Courbessac, 30000 Nîmes', x: 530, y: 215, kg: 19, colis: 2,
    marque: 'vêtements Jacker', tel: '04 65 98 10 85' },
  { id: 'c6', nom: 'Atelier Mazet', zone: 'Grézan',
    adresse: 'rue de Grézan, 30000 Nîmes', x: 432, y: 95, kg: 36, colis: 4,
    marque: 'vêtements Jacker', tel: '04 65 98 10 96' },
  { id: 'c7', nom: 'Caveau Pélissier', zone: 'Costières',
    adresse: 'avenue de la Bouvine, 30900 Nîmes', x: 365, y: 375, kg: 27, colis: 3,
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

/* ======================================================== le plan de Nîmes, dessiné ====
 * Plan SCHÉMATIQUE en SVG, repris de la maquette du 02/10 et retouché. Pas un fond
 * cartographique : un fond Google Maps ou OpenStreetMap ne se reprend pas dans un support
 * diffusé à une classe, et un plan dessiné est plus lisible au vidéoprojecteur. L'élève, lui,
 * va bien chercher l'adresse sur un plan en ligne — dans un autre onglet.
 *
 * `fond` ne contient QUE le décor : quartiers, voies, noms de lieux. Le quadrillage, les
 * repères de départ et d'arrivée, les points numérotés, le tracé, la légende et l'échelle
 * sont dessinés par `core/types/plan.js`. Les redessiner ici les mettrait en double.
 *
 * ── L'entrepôt est au SUD-OUEST, et c'est une correction du 02/10 au soir ──────────────
 * La maquette le plaçait au nord-est (case E2). Son adresse réelle, 31 avenue Joliot Curie,
 * est dans le quartier Carémeau, à l'ouest-sud-ouest du centre : un élève qui vérifie en
 * ligne aurait vu l'écart. Il est donc en **A3**, avec la rue qui le dessert (av. Joliot-Curie,
 * arrivant de l'ouest) et l'étiquette « Saint-Césaire » redescendue pour lui faire place.
 *
 * Le calibrage a été réénuméré avec cette position — 720 ordres de passage parcourus un par
 * un, pas estimés — et il tient : une seule combinaison de clients possible, 179 kg sur 180,
 * 125 ordres sur 720 qui arrivent à l'heure (17 %), le meilleur à 15 h 27 et le pire à
 * 17 h 12. Voir le détail dans `claude/prepalog-boost-c24-c26.md`.
 */

/* ── Le décor ne suit PAS la charte de Boost, et c'est voulu — décision du 03/10 ──────────
 *
 * La première version peignait les quartiers avec `var(--ardoise-fond)`, c'est-à-dire **le
 * bleu électrique qui sert aussi aux points clients**. Le décor concurrençait donc les
 * données : sept pastilles bleues posées sur six aplats bleus. Tristan a levé la contrainte
 * (*« tu n'es pas obligé d'utiliser la charte graphique du site pour le plan si ça aide »*).
 *
 * Le décor a maintenant sa propre palette, en dur, et une règle simple :
 *
 *   `#b9a88f` sable   le bâti — un seul lavis pour tous les quartiers, ils ne sont pas une
 *                     série de données et n'ont aucune raison de se distinguer les uns des
 *                     autres ;
 *   `#4f9e72` vert    les espaces verts : les Jardins de la Fontaine ;
 *   `#a6daf4` ciel    l'Écusson, le centre historique ;
 *   `#d98a5f` terre   les trois monuments, et eux seuls.
 *
 * Et les TROIS couleurs de la charte restent réservées à ce qui compte, parce que ce sont
 * les seules choses vives du plan : **menthe = l'entrepôt et le tracé, jaune = la gare,
 * bleu électrique = les clients à livrer.** Le décor recule pour qu'elles ressortent.
 *
 * Le module Boost est sombre quel que soit le thème du site, donc ces couleurs en dur n'ont
 * qu'un fond à tenir. Elles ont quand même été regardées sur le thème clair : elles tiennent.
 *
 * ── Rendre Nîmes reconnaissable — trois ajouts, et un retrait ────────────────────────────
 *
 * La première version aurait pu être le plan de n'importe quelle ville moyenne. Un élève
 * reconnaît sa ville par ses monuments, ses axes structurants et son orientation.
 *
 *   1. TROIS REPÈRES que tous les élèves connaissent : les Arènes, la Maison Carrée et la
 *      Tour Magne. Silhouettes schématiques dessinées ici, monuments publics. Chacune porte
 *      son nom — on travaille avec des lecteurs fragiles, l'icône seule ne suffit pas.
 *   2. LA VOIE FERRÉE. La gare flottait. Or le train EST le sujet de la séance : la ligne
 *      qui la traverse donne un sens à la tournée et structure tout le bas du plan. Elle
 *      s'arrête à l'ouest avant Maison Lauze pour ne pas lui passer dessus.
 *   3. LA FLÈCHE DU NORD. Il n'y en avait pas, alors que la séance envoie l'élève comparer
 *      notre plan avec un plan en ligne. Sans orientation, la comparaison est un devinette.
 *
 * Retrait : la liaison en tirets entrepôt → gare. Le tracé du noyau la dessine déjà dès que
 * l'élève ordonne ses arrêts, et elle était presque confondue avec la voie ferrée.
 *
 * ── Ce que ce décor ne doit PAS faire ───────────────────────────────────────────────────
 *
 * Ne jamais redessiner ce que `core/types/plan.js` dessine : le quadrillage, les repères de
 * départ et d'arrivée, les points numérotés, le tracé, la légende et l'échelle. On les
 * verrait en double, et un test le garde.
 *
 * Et ne jamais déplacer un point : les sept cases sont écrites dans un test, et tout le
 * calibrage (125 ordres sur 720, meilleure arrivée 15 h 27) repose sur ces positions. Le
 * décor se redessine AUTOUR des points, jamais l'inverse.
 *
 * ── Une honnêteté à tenir en classe ─────────────────────────────────────────────────────
 *
 * Le centre est dessiné environ deux fois trop grand par rapport à l'échelle : 1,6 km sur le
 * plan pour 800 m dans la réalité. C'est normal pour un plan schématique — sans ça l'Écusson
 * serait un timbre-poste — mais ça veut dire deux choses : les trois monuments sont placés
 * les uns par rapport aux autres et non au mètre, et un élève qui mesure nos distances sur un
 * plan en ligne ne retrouvera pas nos kilomètres. À annoncer.
 */

// Les traverses de la voie ferrée, calculées plutôt que dessinées à la main : de petits
// traits perpendiculaires régulièrement espacés le long du rail. C'est ce qui distingue une
// voie ferrée d'une route en pointillés — et un élève qui ne connaît pas le symbole le
// reconnaît quand même comme « pas une route ».
const RAIL = { x1: 165, y1: 267, x2: 600, y2: 232 };
const traverses = (r, pas = 13, demi = 4.5) => {
  const dx = r.x2 - r.x1, dy = r.y2 - r.y1, L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L;          // le long du rail
  const px = -uy * demi, py = ux * demi;   // perpendiculaire
  let d = '';
  for (let s = pas / 2; s < L; s += pas) {
    const x = r.x1 + ux * s, y = r.y1 + uy * s;
    d += `M${(x - px).toFixed(1)} ${(y - py).toFixed(1)} L${(x + px).toFixed(1)} ${(y + py).toFixed(1)} `;
  }
  return d.trim();
};

const DECOR = `
  <!-- le bâti : un seul lavis pour tous les quartiers -->
  <g fill="#b9a88f" opacity=".17">
    <rect x="150" y="290" width="150" height="80"  rx="10"/>
    <rect x="70"  y="230" width="120" height="80"  rx="10"/>
    <rect x="400" y="60"  width="160" height="110" rx="10"/>
    <rect x="480" y="180" width="110" height="80"  rx="10"/>
    <rect x="290" y="330" width="200" height="70"  rx="10"/>
    <rect x="38"  y="212" width="100" height="62"  rx="10"/>
  </g>
  <!-- les espaces verts, et le centre historique -->
  <ellipse cx="243" cy="112" rx="52" ry="34" fill="#4f9e72" opacity=".26"/>
  <path d="M272 162 L348 158 L366 205 L338 244 L286 240 L264 206 Z"
        fill="#a6daf4" opacity=".20" stroke="#a6daf4" stroke-opacity=".45"/>
  <!-- les voies -->
  <g stroke="var(--encre-douce)" stroke-opacity=".55" fill="none" stroke-linecap="round">
    <path d="M258 60 L258 300" stroke-width="5"/>
    <path d="M60 205 L600 195" stroke-width="5"/>
    <path d="M20 395 L580 385" stroke-width="7" stroke-opacity=".4"/>
    <path d="M20 232 L150 246 L258 240" stroke-width="3"/>
    <path d="M200 330 L300 250 L365 375" stroke-width="2.5"/>
    <path d="M120 270 L205 252" stroke-width="2.5"/>
    <path d="M432 95 L470 150 L530 215" stroke-width="2.5"/>
  </g>
  <!-- la voie ferrée : le rail, puis ses traverses. Même encre que les voies, mais à pleine
       opacité quand les routes sont à .55 — elle ressort comme une structure, et elle suit le
       thème au lieu d'une couleur figée qui disparaîtrait sur fond clair. -->
  <g class="plan-rail" data-rail="${RAIL.x1},${RAIL.y1} ${RAIL.x2},${RAIL.y2}"
     stroke="var(--encre-douce)" fill="none">
    <path d="M${RAIL.x1} ${RAIL.y1} L${RAIL.x2} ${RAIL.y2}" stroke-width="2.2"/>
    <path d="${traverses(RAIL)}" stroke-width="1.6" stroke-opacity=".75"/>
  </g>
  <!-- les trois repères : Arènes, Maison Carrée, Tour Magne -->
  <g class="plan-reperes">
    <g transform="translate(338,227)" stroke="#d98a5f" fill="none">
      <ellipse rx="12.5" ry="9.5" stroke-width="2.6"/>
      <ellipse rx="6.5" ry="4.5" stroke-width="1.6"/>
    </g>
    <g transform="translate(282,180)" fill="#d98a5f">
      <path d="M-11 -7 L0 -13.5 L11 -7 Z"/>
      <rect x="-11" y="-6" width="22" height="2.6"/>
      <rect x="-9.6" y="-2.6" width="2.4" height="8.6"/>
      <rect x="-4.8" y="-2.6" width="2.4" height="8.6"/>
      <rect x="0"    y="-2.6" width="2.4" height="8.6"/>
      <rect x="4.8"  y="-2.6" width="2.4" height="8.6"/>
      <rect x="-12" y="6" width="24" height="2.6"/>
    </g>
    <g transform="translate(215,95)" fill="#d98a5f">
      <path d="M-5 10 L-4 -8 L4 -8 L5 10 Z"/>
      <rect x="-6.6" y="-11.4" width="13.2" height="3.6"/>
    </g>
  </g>
  <!-- la flèche du nord -->
  <g class="plan-nord" transform="translate(52,64)" fill="var(--encre-douce)" opacity=".9">
    <path d="M0 -22 L6.5 6 L0 1.5 L-6.5 6 Z"/>
    <text y="20" text-anchor="middle" font-size="12" font-weight="700">N</text>
  </g>
  <g font-size="11.5" fill="var(--encre-douce)">
    <text x="300" y="385" text-anchor="middle">A 9 / A 54</text>
    <text x="264" y="74" transform="rotate(-90 264 74)" text-anchor="end">av. Jean-Jaurès</text>
    <text x="24" y="262">av. Joliot-Curie</text>
    <text x="76" y="302">Saint-Césaire</text>
    <text x="158" y="302">Ville Active</text>
    <text x="408" y="78">Grézan</text>
    <text x="480" y="272">Courbessac</text>
    <text x="455" y="347" text-anchor="middle">Costières</text>
    <text x="435" y="236" text-anchor="middle">voie ferrée</text>
    <text x="596" y="221" text-anchor="end">→ Paris</text>
    <text x="310" y="153" text-anchor="middle" font-size="12" font-weight="600">Écusson</text>
  </g>
  <g font-size="11.5" font-weight="600" fill="#d98a5f">
    <text x="358" y="232">Arènes</text>
    <text x="266" y="174" text-anchor="end">Maison Carrée</text>
    <text x="205" y="84"  text-anchor="end">Tour Magne</text>
  </g>`;

// Le plan sans ses réglages de séance : chaque séance ENT-3.x y ajoute son libellé, sa
// consigne et son `reperage`. Les cases attendues ne sont **pas** écrites ici : `caseDe`
// les recalcule depuis la position du point, donc une fiche client ne peut pas contredire
// le plan. Pour mémoire humaine, elles tombent sur D2, C2, C4, B3, F3, E1, D4 et l'entrepôt
// en A3.
export const PLAN_NIMES = {
  alt: "Plan schématique de Nîmes : l'entrepôt Boost au sud-ouest, sept clients à livrer et "
     + 'la gare de Nîmes-Centre.',
  largeur: 600, hauteur: 420,
  fond: DECOR,
  grille: { colonnes: 'ABCDEF', lignes: 4 },
  // 60 px par kilomètre ; les distances par la route valent 1,30 fois la distance à vol
  // d'oiseau — on ne roule pas tout droit en ville.
  echelle: { pixels: 60, facteurRoute: 1.30, libelle: '1 km' },
  depart: { nom: 'Entrepôt Boost', lettre: 'B', x: 85, y: 238 },
  arrivee: { nom: 'Gare de Nîmes-Centre', x: 318, y: 255 },
  points: DESTINATAIRES,
  legendePoints: 'Client à livrer',
};

/* ================================================= les données du vélo-cargo ========== */

// Vélo-cargo : 180 kg de charge utile, 12 km/h en ville, 6 minutes par arrêt. Départ de
// l'entrepôt à 13 h 00, le train pour Paris part à 16 h 10. Les sept commandes pèsent
// 237 kg en tout : il y a 57 kg de trop, donc il faut choisir.
export const VELO = {
  chargeUtile: 180,
  depart: 13 * 60,
  train: 16 * 60 + 10,
  vitesse: 12,
  service: 6,
};

export const MASSE_TOTALE = DESTINATAIRES.reduce((t, d) => t + d.kg, 0);   // 237 kg
