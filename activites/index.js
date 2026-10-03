// Registre des activités et des rubriques d'accueil.
//
// Ajouter une activité = écrire son fichier, puis ajouter une ligne dans ACTIVITES.
// L'accueil, les droits, la sauvegarde des scores et le suivi de classe suivent tout seuls.
//
// L'ordre d'affichage ne dépend PAS de l'ordre de cette liste : il est calculé à partir
// des `code` (voir `ordonner` plus bas). Une activité se déplace en changeant son numéro
// de module, pas en déplaçant sa ligne ici. L'ordre de la liste reste quand même rangé
// comme l'affichage, pour que le fichier ne raconte pas autre chose que l'écran.

export const ACTIVITES = [
  () => import('./chaine-logistique.js'),
  () => import('./magasin.js'),
  () => import('./quiz-flux.js'),
  () => import('./zones-entrepot.js'),
  () => import('./calculs-stock.js'),
  () => import('./entr-conversions.js'),
  () => import('./entr-proportionnalite.js'),
  () => import('./entr-arrondis.js'),
  // Tableur : les numéros donnent la progression — prise en main, puis séries appliquées,
  // puis la journée complète, puis l'inventaire.
  () => import('./excel-pas-a-pas.js'),
  () => import('./excel-stock.js'),
  () => import('./calculs-commerciaux.js'),
  () => import('./journee-entrepot.js'),
  () => import('./inventaire-tableur.js'),
  // Scénarios.
  () => import('./yves-rocher.js'),
  () => import('./foot-locker.js'),
  () => import('./bouygues-telecom.js'),
  () => import('./brasseries-gatinais.js'),
  () => import('./reception-plateforme.js'),
  // Environnements d'entreprise (LogiSim). Une tuile par séance, dans l'ordre de la
  // séquence : on réceptionne, puis on prépare, puis on remonte la traçabilité.
  () => import('./spartoo-reception.js'),
  () => import('./spartoo.js'),
  () => import('./spartoo-tracabilite.js'),
  () => import('./cdiscount-mouvements.js'),
  () => import('./cdiscount-inventaire.js'),
  () => import('./cdiscount-regularise.js'),
  // Boost (Nîmes) — ENT-3.x. C2.4 « Organiser une tournée de livraison » prend quatre
  // séances : guidage, entraînement, erreur induite, évaluation. ENT-3.4 reste à écrire.
  () => import('./boost-tournee.js'),
  () => import('./boost-ent32.js'),
  () => import('./boost-ent33.js'),
  // Picard (Sainghin-en-Mélantois) — ENT-4.x. C1.4 « réception » en quatre séances, sur la vue quai.
  () => import('./picard-ent41.js'),
  () => import('./picard-ent42.js'),
  () => import('./picard-ent43.js'),
];

// Pictogrammes des rubriques. Une seule grille pour les dix : trait de 1,6 px, bouts et
// angles arrondis, 2 px de marge, aucun remplissage. La taille est posée par le CSS
// (.rubrique-disc svg), jamais ici : le même dessin sert à 24, 32 et 34 px.
export const ICONES = {
  // rayonnage et cartons
  magasin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.3" y="3.6" width="17.4" height="16.8" rx="1.3"/><path d="M3.3 9.2h17.4M3.3 14.8h17.4"/><rect x="5.7" y="5.3" width="4.3" height="2.5" rx=".4"/><rect x="12.6" y="10.9" width="4.3" height="2.5" rx=".4"/><rect x="5.7" y="16.5" width="4.3" height="2.5" rx=".4"/></svg>`,
  // carton sanglé, l'objet de base du métier
  logistique: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.4 19.6 7.3v7.8L12 19 4.4 15.1V7.3z"/><path d="M4.4 7.3 12 11.2l7.6-3.9M12 11.2V19"/><path d="M8.2 5.3 15.8 9.2"/></svg>`,
  // série de questions cochées au fur et à mesure (c'était une horloge)
  quiz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.6 7 1.7 1.7L8.4 5.4"/><path d="m3.6 13 1.7 1.7 3.1-3.3"/><path d="m3.6 19 1.7 1.7 3.1-3.3"/><path d="M11.6 7.4h8.8M11.6 13.4h8.8M11.6 19.4h5.6"/></svg>`,
  // dossier d'étude de cas, repris à la loupe
  scenario: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.2h7.4L19 8.6v12.2H6z"/><path d="M13.2 3.2v5.6h5.6"/><circle cx="11.2" cy="15" r="2.7"/><path d="m13.2 17 2.3 2.3"/></svg>`,
  // classeur : bandeau d'en-tête puis colonnes
  tableur: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.4" y="4" width="17.2" height="16" rx="1.4"/><path d="M3.4 8.6h17.2"/><path d="M9.2 8.6V20M15 8.6V20M3.4 14.3h17.2"/></svg>`,
  // porteur et sa remorque
  transport: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.4 5.9h11.2v9.9H2.4z"/><path d="M13.6 9.2h3.8l3.2 3.9v2.7h-7"/><path d="M2.4 15.8h3.1M8.6 15.8h6.2M18.2 15.8h2.4"/><circle cx="7.1" cy="17.9" r="2.1"/><circle cx="16.8" cy="17.9" r="2.1"/></svg>`,
  // registre ouvert
  gestion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.7C12 6.7 10 4.9 4.2 4.9v13.2C10 18.1 12 19.9 12 19.9s2-1.8 7.8-1.8V4.9C14 4.9 12 6.7 12 6.7Z"/><path d="M12 6.7v13.2"/></svg>`,
  // l'entreprise, avec sa porte
  entreprise: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.2 20.6h17.6"/><path d="M5.6 20.6V7.3L12 4.1l6.4 3.2v13.3"/><path d="M9.2 9.9h1.7M13.1 9.9h1.7M9.2 13.3h1.7M13.1 13.3h1.7"/><path d="M10.1 20.6v-3.7h3.8v3.7"/></svg>`,
  // deux comptes, pas un
  comptes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9.4" cy="8.3" r="3.3"/><path d="M3.5 19.6c0-3.3 2.6-5.8 5.9-5.8s5.9 2.5 5.9 5.8"/><path d="M16.2 6.2a3.3 3.3 0 0 1 0 6.2"/><path d="M17.5 19.6c0-2.4-.8-4.3-2.2-5.4"/></svg>`,
  // des résultats qui montent (c'était la grille du tableur, en double)
  suivi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.4 20.4h17.2"/><path d="M5.4 20.4v-7.6h3.5v7.6"/><path d="M10.3 20.4V7.9h3.5v12.5"/><path d="M15.2 20.4v-9.9h3.5v9.9"/></svg>`,
};

// Les cartes de l'accueil. Une rubrique liste soit des `ids` explicites, soit une
// catégorie (`cat`) qui filtre les activités. `bande` regroupe les cartes par ligne,
// séparées par un filet.
export const RUBRIQUES = [
  // bande 1 — le cours : découvrir, puis appliquer sur un cas complet
  { id: 'logistique', label: 'Logistique', bande: 1, cat: 'logistique', icone: 'logistique',
    desc: "Découvrir et pratiquer les opérations de la chaîne logistique." },
  { id: 'scenario', label: 'Scénario', bande: 1, cat: 'scenario', icone: 'scenario',
    desc: "Études de cas complètes, sur Padlet ou Digipad, notées par l'enseignant." },

  // bande 2 — l'entraînement
  { id: 'quiz', label: 'Quiz', bande: 2, cat: 'quiz', icone: 'quiz',
    desc: 'Séries de questions courtes, corrigées immédiatement.' },
  { id: 'tableur', label: 'Tableur', bande: 2, cat: 'tableur', icone: 'tableur',
    desc: 'Compléter un classeur, le déposer, obtenir la correction automatique.' },

  // bande 3 — les outils de travail
  { id: 'logisim', label: 'Logisim', bande: 3, cat: 'logisim', icone: 'entreprise', parEntreprise: true,
    desc: "Des environnements d'entreprise complets. Chaque élève travaille dans sa propre base." },
  { id: 'magasin', label: 'Magasin', bande: 3, ids: ['magasin'], icone: 'magasin',
    desc: 'La base du magasin pédagogique : produits, emplacements et état du stock.' },
];

// Les entreprises de Logisim (02/10/2026, décision de Tristan) : la pastille Logisim montre
// d'abord leurs logos, puis les séances de l'entreprise choisie. Une séance appartient à
// l'entreprise du PREMIER NOMBRE de son code : ENT-3.2 → 3. Une entreprise nouvelle = une ligne.
// Le nom et le métier sont recopiés du `sousTitre` des contenus (contenus/<nom>.js) : ces
// fichiers sont lourds, l'accueil ne les importe pas.
export const ENTREPRISES = [
  { n: 1, nom: 'Spartoo', metier: 'Vente de chaussures en ligne', logo: './contenus/trames/logos/spartoo.jpg' },
  { n: 2, nom: 'Cdiscount', metier: 'Entrepôt de Cestas — suivi des stocks', logo: './contenus/trames/logos/cdiscount.png' },
  { n: 3, nom: 'Boost', metier: 'Logistique e-commerce — Nîmes', logo: './contenus/trames/logos/boost.png' },
  { n: 4, nom: 'Picard', metier: 'Entrepôt de surgelés — Sainghin-en-Mélantois', logo: './contenus/trames/logos/picard.svg' },
];

// ------------------------------------------------------------------- l'ordre
//
// L'affichage suit les NUMÉROS DE MODULE, pas l'ordre de la liste ci-dessus : TAB-1, TAB-2,
// TAB-3, puis TAB-5 ; ENT-1.1, ENT-1.2, ENT-1.3. C'est ce que l'élève lit sur la tuile, donc
// c'est ce qui doit décider.
//
// Avant, l'ordre était celui de la liste, et les numéros étaient censés suivre. Ça ne
// tenait pas : TAB-5 avait été ajouté avant TAB-1, et se retrouvait affiché en premier
// dans la rubrique Tableur, dans les colonnes du suivi de classe et dans la conduite de
// séance — trois endroits pour un seul oubli, et rien pour le signaler.
//
// Les FAMILLES, elles, gardent l'ordre de la liste : la pastille Tableur n'a pas à passer
// avant les quiz sous prétexte que « QUI » vient après « TAB » dans l'alphabet. Le rang
// d'une famille est celui de sa première apparition dans ACTIVITES.
//
// Un numéro peut avoir PLUSIEURS NIVEAUX, séparés par des points : `ENT-1.1`, `ENT-1.2`,
// `ENT-1.3` sont les trois séances de Spartoo, `ENT-2.1` sera la première de TechPro. Le
// premier nombre dit l'entreprise, le second la séance — ce que la numérotation à plat
// (`ENT-1`, `ENT-2`, `ENT-3`) n'exprimait pas, au point qu'ajouter une entreprise obligeait
// à renuméroter. Rien n'empêche un troisième niveau si le besoin vient.
//
// La comparaison se fait **segment par segment**, pas sur le nombre à virgule : `1.10` doit
// venir après `1.9`, alors que `1.10 < 1.9` si on les lit comme des décimaux. C'est le piège
// classique des numéros de version, et il arriverait dès la dixième séance.
//
// Un code hors forme `XXX-9` ou `XXX-9.9` garde sa place : on ne veut pas qu'une coquille
// dans un `code` fasse disparaître une activité de l'accueil.

const FORME_CODE = /^([A-Z]+)-(\d+(?:\.\d+)*)$/;

// Rend un tableau de nombres : 'ENT-1.2' → [1, 2]. Un code mal formé rend [].
const segments = (code) => {
  const m = FORME_CODE.exec(code || '');
  return m ? m[2].split('.').map(Number) : [];
};

// Ordre lexicographique sur les segments. Un numéro plus court passe avant celui qui le
// prolonge : `ENT-1` avant `ENT-1.1`.
function comparerSegments(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] === undefined ? -1 : a[i];
    const y = b[i] === undefined ? -1 : b[i];
    if (x !== y) return x - y;
  }
  return 0;
}

function ordonner(mods) {
  const rangFamille = new Map();
  mods.forEach((m) => {
    const famille = (FORME_CODE.exec(m.meta.code || '') || [])[1] || m.meta.code || '';
    if (!rangFamille.has(famille)) rangFamille.set(famille, rangFamille.size);
  });
  // `sort` est stable : deux activités de même code gardent l'ordre de la liste.
  return mods.slice().sort((a, b) => {
    const ca = FORME_CODE.exec(a.meta.code || '');
    const cb = FORME_CODE.exec(b.meta.code || '');
    const fa = rangFamille.get(ca ? ca[1] : a.meta.code || '');
    const fb = rangFamille.get(cb ? cb[1] : b.meta.code || '');
    if (fa !== fb) return fa - fb;
    return comparerSegments(segments(a.meta.code), segments(b.meta.code));
  });
}

const cache = new Map();

export async function chargerActivites() {
  if (cache.size) return Array.from(cache.values());
  const mods = await Promise.all(ACTIVITES.map((f) => f()));
  // On range AVANT de remplir le cache : tout ce qui consomme `chargerActivites()` —
  // l'accueil, le suivi de classe, la conduite de séance — hérite du même ordre.
  ordonner(mods).forEach((m) => cache.set(m.meta.id, m));
  return Array.from(cache.values());
}

export async function activite(id) {
  await chargerActivites();
  return cache.get(id) || null;
}

// Activités d'une rubrique : dans l'ordre déclaré pour `ids`, par numéro de module pour
// `cat` — `mods` arrive déjà rangé par `chargerActivites`.
export function activitesDeRubrique(rubrique, mods) {
  if (!rubrique) return [];
  if (rubrique.ids) {
    return rubrique.ids.map((id) => mods.find((m) => m.meta.id === id)).filter(Boolean);
  }
  return mods.filter((m) => m.meta.rubrique === rubrique.cat);
}

// Les séances d'une rubrique rangée par entreprise, regroupées : une entrée par entreprise
// qui a au moins une séance dans `acts` (déjà filtrées par ce que voit l'utilisateur), dans
// l'ordre de la table. Une séance dont le numéro n'est dans aucune ligne ne disparaît pas :
// elle va sous « Autres », toujours en dernier, sans logo.
export function entreprisesDe(acts) {
  const connues = new Set(ENTREPRISES.map((e) => e.n));
  const groupes = ENTREPRISES.map((e) => ({ id: String(e.n), nom: e.nom, metier: e.metier, logo: e.logo,
    acts: acts.filter((m) => segments(m.meta.code)[0] === e.n) }));
  groupes.push({ id: 'autres', nom: 'Autres séances', metier: "Séances qui ne sont rattachées à aucune entreprise de la liste.",
    logo: null, acts: acts.filter((m) => !connues.has(segments(m.meta.code)[0])) });
  return groupes.filter((g) => g.acts.length);
}
