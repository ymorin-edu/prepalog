// Vue « Plan d'entrepôt » — se repérer dans un entrepôt : choisir une TRAVÉE sur le plan vu de dessus,
// puis un EMPLACEMENT dans la travée vue de face.
//
// Écrite le 04/10/2026 (brief `docs/briefs/MOTEUR-vue-plan-entrepot.md`, lots 1 et 2 : le cœur et le
// mode RANGEMENT), d'après la maquette v2 validée par Tristan (`docs/briefs/plan-entrepot/`), qui FAIT
// FOI pour l'interaction : mêmes gestes, mêmes textes. Le code de la maquette était jetable (état
// global, géométrie écrite à la main, stock tiré par un générateur) : ici on reprend le comportement,
// le plan est DÉCLARÉ par le contenu et dessiné par le moteur. Le mode « préparation » (lot 4) est
// venu le même jour (voir plus bas, « PRÉPARATION ») ; le mode « comptage » (lot 3) n'est pas encore
// écrit : une séance qui le déclare ne se charge pas.
//
// Elle vit dans l'environnement d'entreprise (`entreprise.js`), comme le quai et le planning, et
// n'existe que si la séance déclare `entrepot` (`plan` est déjà la vue de transport). Elle ne connaît
// AUCUNE entreprise : rien de Smoby ici. Décisions de Tristan (04/10/2026) tenues par le moteur :
//   - « je choisis la travée, puis l'emplacement » : le plan vu de dessus est découpé entre chaque
//     échelle, chaque travée montre qu'elle cache ses niveaux ; un clic l'ouvre en grand, vue de face ;
//   - l'adresse s'écrit `A1-T03-N2-E1` (allée A côté 1, travée 03, niveau 2, emplacement 1),
//     niveau 1 = sol ; on dit « emplacement », jamais « place » ;
//   - un emplacement occupé est refusé tout de suite, la palette reste en main ;
//   - AUCUNE règle ni remarque « lourd en bas » dans un rack : seule compte la charge TOTALE du niveau ;
//   - AUCUNE limite de poids au sol (niveau 1) : la palette ne charge aucune lisse (05/10/2026) ;
//   - l'aide « déjà posé » reste en évaluation (sans rouge) ; en guidage, le calcul « déjà posé + palette
//     en main = total » est fait pour l'élève ; en entraînement et en évaluation, la calculette du site (05/10/2026) ;
//   - le plan OU la vue ouverte, dans le même grand espace (onglets dans la page, Échap pour revenir).
//
// Une déclaration (exemple complet : `contenus/entrepot-essai.js`) :
//
//   entrepot: {
//     id, libelle,                          // id = clé de l'état (cloisonné par séance) ; libelle = menu
//     mode: 'rangement',
//     personnage: { nom, role, date, texte: { guidage, entrainement, evaluation } },
//     plan: {
//       allees: [{ id: 'A', cotes: ['A1', 'A2'] }, …],     // de gauche à droite ; 1 ou 2 côtés par allée
//       cotes: { A1: { gammes: ['MAT'], charge: { 1: 3000, 2: 1200, 3: 1200 }, note? }, … },
//       travees: 4, niveaux: 3, emplacements: 3,         // T01 en bas, près de l'allée principale
//       horsService: ['A1-T02-N2-E2', …],
//       zones: { litiges: ['L1', 'L2'], bureau: 'chef de quai', quais: ['QUAI 1', …] },
//       parcours: { debut: 'A', fin: 'B' },              // le parcours de prélèvement (dessiné, critère)
//       rotation: { A: { lib: 'rapide', travees: [1], niveaux: [1, 2], texte: 'T01, niveau N1 ou N2' }, … },
//     },
//     gammes: { MAT: 'Maisons et ateliers', … },
//     produits: { MAI: { nom, ref, gamme: 'MAT', court? }, … },   // court : le mot montré sur la vue de face
//     stock: { 'A1-T01-N1-E1': { produit: 'MAI', kg: 420 }, … },   // FIGÉ (aucun tirage)
//     palettes: [{ id: 'P1', nom, produit: 'MAI', kg: 420, rotation: 'A', contrainte: 'lourd' | 'fragile',
//                  reception: '1 carton écrasé' (rien = conforme), litige: true }, …],
//     criteres: [{ type, id?, nom?, message? }, …],      // types : CRITERES plus bas
//     regles: { titre?, lignes: [html…], encadre?: html },   // « Les règles ▾ » (guidage, entraînement)
//     jalons: [{ id, lib, palette: 'P1' }, …],           // défaut : un jalon par palette
//     note: { sur: 20 },                                 // évaluation : jalons réussis / jalons × sur
//   }
//
// L'état vit dans la base de l'élève, sous `db.entrepots[<entrepot.id>]` :
//   { place: { P1: 'A1-T01-N1-E3', P3: 'L1' }, verifie, verifs, premierGeste, aideCharge }
// La palette en main, la travée ouverte et le dernier message ne sont pas gardés (un rechargement
// revient au plan, les palettes posées restent posées).
//
// Le temps pédagogique (`api.temps`) décide de ce qui est montré (brief §8) : guidage = consigne de la
// palette en main, bandes de rotation, parcours dessiné ; après « Vérifier », le nom du critère seul (comme en
// entraînement : le texte de la faute dirait où aller) ; entraînement = parcours seul, nom du critère seul ; évaluation = rien avant la copie rendue (comme le
// Planning, décision de Tristan du 04/10). On dit QUE un critère n'est pas respecté, jamais DE COMBIEN.
//
// PRÉPARATION de commande au colis complet (`mode: 'preparation'`, brief §5.3, §5.4, §6.2, §7) :
// N1 = picking, N2 et au-dessus = réserve. L'élève prélève chaque ligne du bon au picking, demande la
// descente d'une palette de réserve quand le picking est sous son minimum, monte la palette de
// commande (dans l'ordre du prélèvement), la filme et l'étiquette. Ce que la séance ajoute :
//
//   produits: { MAI: { …, couches: [2, 2, 2], classe: 'lourd' | 'fragile' (rien = normal),
//                      carton: { kg: 50, parCouche: 2, h: 0.45 } }, … },   // h en mètres
//   plan.metres: { travee: 3, entreAllees: 9.4, avant: 0.9, arriere: 1.2, quai: 5.2 },
//       // en mètres : longueur d'une travée ; d'une allée à la suivante ; de l'allée principale au bas
//       // des racks ; du haut des racks au passage du haut ; position du quai sur l'allée principale,
//       // comptée depuis la première allée
//   commande: { num, client, enlevement, transporteur, heure, quai: 'QUAI 1', etiquette?: 'JDR · E1',
//               hMax: 1.8, kgMax: 800, support: { h: 0.15, kg: 25 },
//               lignes: [{ a: 'A1-T01-N1-E1', produit: 'MAI', q: 2 }, …],    // l'ordre du serpentin
//               desordre: [4, 5, 3, 0, 2, 1] },                                // l'ordre remis hors guidage
//   picking: { 'B1-T01-N1-E1': { q: 2, min: 6 }, … },   // les autres N1 : palette pleine, min = max(2, plein/4)
//   jalons: [{ id, lib, type }, …],   // types : JALONS_PREP plus bas ; défaut : les 9 du brief
//
// L'état : `db.entrepots[<id>]` = { faits: [{ a, k, q }] (les prélèvements, dans l'ordre), pick (cartons
// restants au picking), vides (réserves descendues), reappros, essaisReserve, parcours, fin, film, etiq,
// verifie, verifs, premierGeste }.

// Pas d'import de `ui.js` : un corrigé de séance peut importer ce module hors du navigateur.
// Le mode VISITE (second chantier, 05/10/2026) vit dans son propre fichier : voir sa tête.
import { compilerVisite, jalonsVisite, detailVisite, creerVisite, etatVisiteNeuf } from './entrepot-visite.js';
import { ech, pad2 } from '../texte.js';
const nb = (n) => Number(n).toLocaleString('fr-FR');
const kg = (n) => `${nb(n)} kg`;

export const adresse = (cote, t, n, e) => `${cote}-T${pad2(t)}-N${n}-E${e}`;
export function decoupe(a) {
  const m = /^([A-Z]+\d+)-T(\d+)-N(\d+)-E(\d+)$/.exec(String(a || ''));
  return m ? { c: m[1], t: +m[2], n: +m[3], e: +m[4] } : null;
}

// Au clavier seulement, on rend le focus après un redessin (charte : « conserver le focus »).
let clavier = false;
// Échap ramène de la vue ouverte au plan : une seule écoute pour toute la page, branchée sur la vue
// affichée en dernier (elle se tait si la vue n'est plus à l'écran).
let echap = null;
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', () => { clavier = true; }, true);
  document.addEventListener('pointerdown', () => { clavier = false; }, true);
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape' || !echap || !echap.racine.isConnected) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(ev.target.tagName || '')) return;
    if (echap.fn()) ev.preventDefault();
  });
}

/* ================================================================== critères */
// Chaque type rend la faute (texte du guidage) ou rien. `x` : { P (déclaration), M (compilée), p
// (palette), d (adresse découpée), cote, place (palettes de l'élève), crit (la déclaration du critère) }.
// Les messages respectent « que, pas de combien ». Une séance peut les remplacer (`message`, texte ou
// fonction de `x`) et renommer le critère (`nom`, affiché seul en entraînement).
const CRITERES = {
  etat: {
    nom: 'état',
    juger: (x) => (x.M.hs.has(x.a) ? 'emplacement hors service' : null),
  },
  gamme: {
    nom: 'type de produit',
    juger: (x) => {
      const g = x.M.gammeDe(x.p);
      if (x.cote.gammes.includes(g)) return null;
      return `la gamme ${x.M.nomGamme(g)} se range en ${x.M.cotesDeGamme(g).join(' ou ')}`;
    },
  },
  // Lourd en début de parcours, fragile en fin de parcours. Jugé seulement si le type de produit est
  // juste (sinon c'est lui qui arrête l'élève : une faute à la fois sur le même geste).
  parcours: {
    nom: 'parcours',
    juger: (x) => {
      const R = x.P.plan.parcours || {};
      if (x.M.crit.some((c) => c.type === 'gamme') && !x.cote.gammes.includes(x.M.gammeDe(x.p))) return null;
      if (x.p.contrainte === 'lourd' && R.debut && x.cote.allee !== R.debut) return `produit lourd : en début de parcours (allée ${R.debut})`;
      if (x.p.contrainte === 'fragile' && R.fin && x.cote.allee !== R.fin) return `produit fragile : en fin de parcours (allée ${R.fin})`;
      return null;
    },
  },
  rotation: {
    nom: 'rotation',
    juger: (x) => {
      const r = (x.P.plan.rotation || {})[x.p.rotation];
      if (!r) return null;
      if ((r.travees || []).includes(x.d.t) && (!r.niveaux || r.niveaux.includes(x.d.n))) return null;
      return `rotation ${r.lib} : ${r.texte}`;
    },
  },
  // { type: 'niveauInterdit', si: 'fragile', niveaux: [3] }
  niveauInterdit: {
    nom: 'produit fragile',
    juger: (x) => {
      const c = x.crit;
      if (c.si && x.p.contrainte !== c.si) return null;
      if (!(c.niveaux || []).includes(x.d.n)) return null;
      return `pas au niveau ${c.niveaux.map((n) => `N${n}`).join(' ni ')}`;
    },
  },
  // La charge TOTALE du niveau (stock + palettes de l'élève + celle-ci) ne dépasse pas la plaque.
  // Aucune règle « lourd en bas » : une palette sur une lisse n'écrase rien (décision du 04/10).
  // Au sol (niveau 1), aucune limite : la palette ne repose sur aucune lisse (décision du 05/10).
  charge: {
    nom: 'poids',
    juger: (x) => (x.d.n > 1 && x.M.chargeNiveau(x.place, x.d, x.p.id) + x.p.kg > x.cote.charge[x.d.n]
      ? 'la charge totale du niveau dépasse son maximum' : null),
  },
  // Le litige se juge à part (avant tout le reste) : une palette en litige va en zone litiges, une
  // palette saine n'y va pas. Ce type n'a pas de `juger` : voir `fautes`.
  litige: { nom: 'litige' },
};
export const TYPES_CRITERES = Object.keys(CRITERES);

/* ================================================================ compilation */
// Vérifie la déclaration (une séance mal déclarée ne se charge pas : la suite de tests le voit) et
// prépare ce que la vue et les jalons lisent.
const COMPILES = new WeakMap();
function compiler(P) {
  if (COMPILES.has(P)) return COMPILES.get(P);
  const err = (m) => { throw new Error(`entrepot ${P && P.id} : ${m}`); };
  if (!P || !P.id) err('il manque un id');
  const mode = P.mode || 'rangement';
  if (!['rangement', 'preparation', 'visite'].includes(mode)) err(`le mode « ${mode} » n'est pas encore écrit dans le moteur (lot 3 du brief)`);
  const L = P.plan || err('il manque le plan');
  const T = L.travees || 4, N = L.niveaux || 3, E = L.emplacements || 3;
  if (N > 4 || E > 4) err('4 niveaux et 4 emplacements par niveau au plus');
  const allees = (L.allees || []).map((al) => ({ id: al.id, cotes: (al.cotes || []).filter(Boolean) }));
  if (!allees.length) err('aucune allée');
  const cotes = {};
  allees.forEach((al) => al.cotes.forEach((id, i) => {
    const c = (L.cotes || {})[id] || err(`le côté ${id} n'est pas décrit dans plan.cotes`);
    // Le sol (N1) n'a pas de plaque : sa charge peut être déclarée, elle n'est pas lue.
    for (let n = 2; n <= N; n++) if (!(c.charge && c.charge[n] > 0)) err(`le côté ${id} n'a pas de charge maximale au niveau ${n}`);
    cotes[id] = { id, allee: al.id, gauche: i === 0, gammes: c.gammes || [], charge: c.charge, note: c.note || '' };
  }));
  const ordre = allees.flatMap((al) => al.cotes);
  const toutes = [];
  ordre.forEach((c) => { for (let t = 1; t <= T; t++) for (let n = 1; n <= N; n++) for (let e = 1; e <= E; e++) toutes.push(adresse(c, t, n, e)); });
  const existe = new Set(toutes);
  const hs = new Set(L.horsService || []);
  hs.forEach((a) => { if (!existe.has(a)) err(`emplacement hors service inconnu : ${a}`); });
  // Le décor (zone de réception, passage piétons de la visite) peut aussi se déclarer à côté du plan.
  const zones = Object.assign({}, L.zones || {}, P.zones || {});
  const litiges = zones.litiges || [];
  const produits = P.produits || {};
  const gammes = P.gammes || {};
  Object.entries(produits).forEach(([k, p]) => { if (!gammes[p.gamme]) err(`le produit ${k} a une gamme inconnue (${p.gamme})`); });
  const stock = P.stock || {};
  Object.entries(stock).forEach(([a, s]) => {
    if (!existe.has(a)) err(`stock à une adresse inconnue : ${a}`);
    if (hs.has(a)) err(`stock sur un emplacement hors service : ${a}`);
    if (!produits[s.produit]) err(`stock de ${a} : produit inconnu (${s.produit})`);
  });
  const pal = {};
  (P.palettes || []).forEach((p) => {
    if (!produits[p.produit]) err(`palette ${p.id} : produit inconnu (${p.produit})`);
    if (p.rotation && !(L.rotation || {})[p.rotation]) err(`palette ${p.id} : classe de rotation inconnue (${p.rotation})`);
    if (p.litige && !litiges.length) err(`palette ${p.id} en litige, mais aucune zone litiges`);
    pal[p.id] = p;
  });
  const crit = (P.criteres || []).map((c) => {
    if (!CRITERES[c.type]) err(`critère de type inconnu : ${c.type} (types : ${TYPES_CRITERES.join(', ')})`);
    return Object.assign({ id: c.type, nom: CRITERES[c.type].nom }, c);
  });
  const nomGamme = (g) => gammes[g] || g;
  const gammeDe = (p) => produits[p.produit].gamme;
  const cotesDeGamme = (g) => ordre.filter((c) => cotes[c].gammes.includes(g));
  const estLitige = (a) => litiges.includes(a);
  // Ce qui occupe un emplacement : le stock de départ, ou une palette de l'élève (`place`).
  const occupant = (place, a) => Object.keys(place || {}).find((id) => place[id] === a) || null;
  const kgEn = (place, a, sauf) => {
    if (stock[a]) return stock[a].kg;
    const o = occupant(place, a);
    return o && o !== sauf && pal[o] ? pal[o].kg : 0;
  };
  // La charge déjà posée sur le niveau de `d`, sans compter la palette `sauf`.
  const chargeNiveau = (place, d, sauf) => {
    let s = 0;
    for (let e = 1; e <= E; e++) s += kgEn(place, adresse(d.c, d.t, d.n, e), sauf);
    return s;
  };
  const M = { P, mode, T, N, E, allees, cotes, ordre, toutes, existe, hs, litiges, zones, produits, stock, pal, crit,
    nomGamme, gammeDe, cotesDeGamme, estLitige, occupant, chargeNiveau };
  if (mode === 'preparation') compilerPrep(M, err);
  else if (mode === 'visite') compilerVisite(M, err);
  else {
    M.jalons = (P.jalons || (P.palettes || []).map((p) => ({ id: `palette-${p.id}`, palette: p.id,
      lib: `${p.id} bien rangée (${p.nom || produits[p.produit].nom})` })));
    M.jalons.forEach((j) => { if (!pal[j.palette]) err(`jalon ${j.id} : palette inconnue (${j.palette})`); });
  }
  COMPILES.set(P, M);
  return M;
}

/* ============================================================ PRÉPARATION */
// Les jalons types de la préparation (brief §7). Les critères de la palette ne comptent QUE si toutes
// les lignes sont justes : une palette vide ou incomplète respecte « lourds en bas », poids et hauteur
// (piège d'inaction). Le parcours : au moins une ligne prélevée par défaut ; `garde: 'lignesJustes'`
// pour ne le compter, lui aussi, que sur une commande complète (ENT-5.6).
const JALONS_PREP = {
  lignesJustes: 'Lignes prélevées justes',
  reappro: 'Réapprovisionnement depuis la bonne référence',
  lourds: 'Lourds en bas',
  fragiles: 'Fragiles en haut',
  poids: 'Poids de la palette',
  hauteur: 'Hauteur de la palette',
  film: 'Film étirable',
  etiquettes: 'Étiquettes d’expédition',
  parcours: 'Parcours le plus court',
};
export const TYPES_JALONS_PREP = Object.keys(JALONS_PREP);
const CRIT_PALETTE = ['lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes'];
export const ETIQUETTES = [['avant', 'face avant'], ['arriere', 'face arrière'], ['gauche', 'côté gauche'], ['droite', 'côté droit'], ['dessus', 'dessus']];

function compilerPrep(M, err) {
  const P = M.P, C = P.commande || err('il manque la commande (mode préparation)');
  const classe = (k) => M.produits[k].classe || 'normal';
  Object.entries(M.produits).forEach(([k, p]) => {
    const c = p.carton;
    if (!c || !(c.kg > 0) || !(c.parCouche > 0) || !(c.h > 0)) err(`le produit ${k} n'a pas de carton { kg, parCouche, h }`);
    if (!Array.isArray(p.couches) || p.couches.length !== 3) err(`le produit ${k} n'a pas ses couches [largeur, profondeur, hauteur]`);
    if (!['normal', 'lourd', 'fragile'].includes(classe(k))) err(`le produit ${k} a une classe inconnue (${p.classe})`);
  });
  const lignes = C.lignes || [];
  if (!lignes.length) err('la commande n’a aucune ligne');
  const vues = new Set();
  lignes.forEach((l, i) => {
    const d = decoupe(l.a);
    if (!d || !M.existe.has(l.a)) err(`ligne ${i + 1} : adresse inconnue (${l.a})`);
    if (d.n !== 1) err(`ligne ${i + 1} : ${l.a} n'est pas au picking (niveau N1)`);
    if (!M.stock[l.a] || M.stock[l.a].produit !== l.produit) err(`ligne ${i + 1} : le stock de ${l.a} n'est pas ${l.produit}`);
    if (!(l.q > 0)) err(`ligne ${i + 1} : quantité absente`);
    if (vues.has(l.a)) err(`ligne ${i + 1} : ${l.a} est déjà sur le bon`);
    vues.add(l.a);
  });
  const desordre = C.desordre || lignes.map((_, i) => i);
  if ([...desordre].sort((a, b) => a - b).join() !== lignes.map((_, i) => i).join()) err('commande.desordre n’est pas un ordre des lignes');
  if (!(C.hMax > 0) || !(C.kgMax > 0)) err('la commande n’a pas de hauteur et de poids maximaux (hMax, kgMax)');
  const support = Object.assign({ h: 0, kg: 0 }, C.support || {});
  const PK = P.picking || {};
  Object.keys(PK).forEach((a) => { const d = decoupe(a); if (!d || d.n !== 1 || !M.stock[a]) err(`picking : ${a} n'est pas un emplacement N1 occupé`); });
  const plein = (a) => M.produits[M.stock[a].produit].couches.reduce((x, y) => x * y, 1);
  const pick0 = (a) => (PK[a] && PK[a].q != null ? PK[a].q : plein(a));
  const minPick = (a) => (PK[a] && PK[a].min != null ? PK[a].min : Math.max(2, Math.round(plein(a) / 4)));
  // Une ligne en rupture : le picking n'a pas de quoi la servir. Il doit être sous son minimum (sinon
  // la descente est refusée) et une palette de réserve de la même référence doit exister.
  const ruptures = lignes.filter((l) => pick0(l.a) < l.q).map((l) => l.a);
  ruptures.forEach((a) => {
    if (pick0(a) >= minPick(a)) err(`${a} : en rupture mais pas sous son minimum (le réapprovisionnement serait refusé)`);
    if (!Object.keys(M.stock).some((r) => decoupe(r).n > 1 && M.stock[r].produit === M.stock[a].produit)) err(`${a} : en rupture, sans palette de réserve de la même référence`);
  });
  M.jalons = (P.jalons || TYPES_JALONS_PREP.filter((t) => t !== 'reappro' || ruptures.length).map((t) => ({ type: t })))
    .map((j) => {
      if (!JALONS_PREP[j.type]) err(`jalon de type inconnu : ${j.type} (types : ${TYPES_JALONS_PREP.join(', ')})`);
      return Object.assign({ id: j.type, lib: JALONS_PREP[j.type] }, j);
    });
  // Les mètres (§5.4) : les points de prélèvement sont au milieu de l'allée, devant la travée ; y = 0
  // sur l'allée principale. Le serpentin est à sens unique : on monte la 1re allée, on redescend la
  // suivante… puis on rentre par l'allée principale.
  const m = P.plan.metres || err('il manque plan.metres (mode préparation)');
  ['travee', 'entreAllees', 'avant', 'arriere', 'quai'].forEach((k) => { if (!(m[k] >= 0)) err(`plan.metres.${k} manque`); });
  const xs = M.allees.map((_, i) => i * m.entreAllees);
  const xAl = Object.fromEntries(M.allees.map((al, i) => [al.id, xs[i]]));
  const haut = m.avant + M.T * m.travee + m.arriere;
  const point = (a) => { const d = decoupe(a); return [xAl[M.cotes[d.c].allee], m.avant + (d.t - 0.5) * m.travee]; };
  const quai = [m.quai, 0];
  const cyc = [[xs[0], 0]];
  xs.forEach((x, i) => { const monte = i % 2 === 0; if (i) cyc.push([x, monte ? 0 : haut]); cyc.push([x, monte ? haut : 0]); });
  if (xs.length % 2) cyc.push([xs[xs.length - 1], 0]);
  cyc.push([xs[0], 0]);
  const long = [0];
  for (let i = 1; i < cyc.length; i++) long.push(long[i - 1] + Math.abs(cyc[i][0] - cyc[i - 1][0]) + Math.abs(cyc[i][1] - cyc[i - 1][1]));
  const tour = long[long.length - 1];
  const eps = 1e-9;
  const sDe = ([x, y]) => {
    for (let i = 1; i < cyc.length; i++) {
      const [x0, y0] = cyc[i - 1], [x1, y1] = cyc[i];
      const surV = Math.abs(x0 - x1) < eps && Math.abs(x - x0) < eps && y >= Math.min(y0, y1) - eps && y <= Math.max(y0, y1) + eps;
      const surH = Math.abs(y0 - y1) < eps && Math.abs(y - y0) < eps && x >= Math.min(x0, x1) - eps && x <= Math.max(x0, x1) + eps;
      if (surV || surH) return long[i - 1] + Math.abs(x - x0) + Math.abs(y - y0);
    }
    return 0;
  };
  const pointA = (s) => {
    s = ((s % tour) + tour) % tour;
    for (let i = 1; i < cyc.length; i++) {
      if (s <= long[i] + eps) {
        const [x0, y0] = cyc[i - 1], [x1, y1] = cyc[i], d = long[i] - long[i - 1], f = d ? (s - long[i - 1]) / d : 0;
        return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
      }
    }
    return cyc[0];
  };
  const troncon = (p, q, mode) => {
    if (mode === 'serpentin') {
      const s0 = sDe(p);
      let L = sDe(q) - s0;
      if (L < -eps) L += tour;
      const pts = [p];
      for (const k of [...long.slice(1), ...long.slice(1).map((v) => v + tour)]) if (k > s0 + eps && k < s0 + L - eps) pts.push(pointA(k));
      pts.push(q);
      return { L, pts };
    }
    if (Math.abs(p[0] - q[0]) < eps) return { L: Math.abs(p[1] - q[1]), pts: [p, q] };
    return { L: p[1] + Math.abs(p[0] - q[0]) + q[1], pts: [p, [p[0], 0], [q[0], 0], q] };
  };
  // Un tour : quai → les points dans l'ordre (deux prélèvements de suite au même point n'en font qu'un) → quai.
  // `retour: false` s'arrête au dernier point (le tracé d'une préparation en cours).
  const longueurTour = (points, mode, retour = true) => {
    const seq = [quai];
    points.forEach((p) => { const z = seq[seq.length - 1]; if (Math.abs(z[0] - p[0]) > eps || Math.abs(z[1] - p[1]) > eps) seq.push(p); });
    if (seq.length === 1) return { L: 0, pts: [] };
    if (retour) seq.push(quai);
    let L = 0, pts = [];
    for (let i = 1; i < seq.length; i++) { const t = troncon(seq[i - 1], seq[i], mode); L += t.L; pts = pts.concat(i > 1 ? t.pts.slice(1) : t.pts); }
    return { L, pts };
  };
  const distincts = [];
  lignes.forEach((l) => { const p = point(l.a); if (!distincts.some((q) => q[0] === p[0] && q[1] === p[1])) distincts.push(p); });
  if (distincts.length > 8) err('plus de 8 points de prélèvement : le meilleur tour ne se calcule plus par essais');
  const meilleur = (mode) => {
    let best = Infinity;
    const perm = (reste, fait) => {
      if (!reste.length) { best = Math.min(best, longueurTour(fait, mode).L); return; }
      reste.forEach((p, i) => perm(reste.filter((_, j) => j !== i), [...fait, p]));
    };
    perm(distincts, []);
    return best;
  };
  Object.assign(M, { C, lignes, desordre, support, classe, plein, pick0, minPick, ruptures, point, longueurTour,
    tourLong: tour, cycle: cyc, metres: m, haut,
    meilleur: { serpentin: meilleur('serpentin'), retour: meilleur('retour') } });
}

const etatPrepNeuf = () => ({ faits: [], pick: {}, vides: [], reappros: [], essaisReserve: [], parcours: null,
  fin: false, film: '', etiq: {}, verifie: false, verifs: 0, premierGeste: null });

// Tout ce que la préparation calcule sur une base (état de l'élève) : lu par la vue, les jalons, la note.
function calculPrep(M, e) {
  const faits = e.faits || [];
  const C = M.C;
  const prelev = (l) => faits.filter((f) => f.a === l.a).reduce((t, f) => t + f.q, 0);
  const hors = {};
  faits.forEach((f) => { if (!M.lignes.some((l) => l.a === f.a)) hors[f.a] = { a: f.a, k: f.k, q: (hors[f.a] ? hors[f.a].q : 0) + f.q }; });
  const horsCommande = Object.values(hors);
  const justes = M.lignes.filter((l) => prelev(l) === l.q).length;
  const lignesJustes = justes === M.lignes.length && !horsCommande.length;
  // La palette : deux prélèvements de suite à la même adresse font une seule couche (on complète la
  // couche du dessus), comme le ferait un préparateur.
  const couches = [];
  faits.forEach((f) => {
    const z = couches[couches.length - 1];
    if (z && z.a === f.a) z.q += f.q; else couches.push({ a: f.a, k: f.k, q: f.q });
  });
  const carton = (k) => M.produits[k].carton;
  const hauteur = M.support.h + couches.reduce((t, c) => t + Math.ceil(c.q / carton(c.k).parCouche) * carton(c.k).h, 0);
  const poids = Math.round(M.support.kg + faits.reduce((t, f) => t + f.q * carton(f.k).kg, 0));
  // « Jamais une classe plus lourde posée sur une classe plus fragile » (§6.2), en deux critères.
  let nonLourd = false, okLourds = true;
  faits.forEach((f) => { if (M.classe(f.k) === 'lourd' && nonLourd) okLourds = false; if (M.classe(f.k) !== 'lourd') nonLourd = true; });
  const okFragiles = !faits.some((f, i) => M.classe(f.k) === 'fragile' && faits.slice(i + 1).some((g) => M.classe(g.k) !== 'fragile'));
  const tours = parseInt(e.film, 10);
  const etq = ETIQUETTES.map((x) => x[0]).filter((k) => (e.etiq || {})[k]).sort().join(',');
  const virg = (x) => x.toFixed(2).replace('.', ',');
  const regles = [
    { id: 'lourds', crit: 'lourds en bas', ok: okLourds, txt: 'un carton lourd a été posé sur un carton plus léger : les lourds se prélèvent en premier, ils font la base de la palette' },
    { id: 'fragiles', crit: 'fragiles en haut', ok: okFragiles, txt: 'des cartons ont été posés sur un carton fragile : les fragiles se prélèvent en dernier' },
    { id: 'poids', crit: 'poids', ok: poids <= C.kgMax, txt: `la palette dépasse le poids maximum du transporteur (${C.kgMax} kg)` },
    { id: 'hauteur', crit: 'hauteur', ok: hauteur <= C.hMax + 1e-9, txt: `la palette dépasse la hauteur maximum du transporteur (${virg(C.hMax)} m)` },
    { id: 'film', crit: 'film', ok: tours >= 3 && tours <= 5, txt: '3 à 5 tours de film, du socle au sommet' },
    { id: 'etiquettes', crit: 'étiquettes', ok: etq === 'arriere,avant,dessus' || etq === 'dessus,droite,gauche', txt: 'une étiquette sur deux côtés opposés et une sur le dessus' },
  ];
  const mode = e.parcours || 'serpentin';
  const T = M.longueurTour(faits.map((f) => M.point(f.a)), mode);
  // Le tracé avance avec la préparation : du quai au dernier prélèvement ; le retour au quai ne se dessine
  // qu'une fois la préparation terminée (choix de Tristan, 06/10/2026). Les mètres comptent le tour entier.
  const trace = e.fin ? T.pts : M.longueurTour(faits.map((f) => M.point(f.a)), mode, false).pts;
  const nbTours = mode === 'serpentin' && T.L > 0 ? Math.round(T.L / M.tourLong) : 0;
  const reappro = M.ruptures.length > 0 && M.ruptures.every((a) => (e.reappros || []).some((r) => r.pour === a));
  return { faits, prelev, horsCommande, justes, lignesJustes, couches, hauteur, poids, regles, metres: T.L, trace,
    tours: nbTours, mode, reappro };
}
// Le meilleur tour auquel l'élève se compare : en évaluation, le parcours est à choisir (allées à double
// sens) et le meilleur des deux compte (comme la maquette) ; sinon, le serpentin imposé.
const meilleurTour = (M, temps) => (temps === 'evaluation' ? Math.min(M.meilleur.serpentin, M.meilleur.retour) : M.meilleur.serpentin);

function jalonsPrep(M, e, temps) {
  const X = calculPrep(M, e);
  const best = meilleurTour(M, temps);
  const juge = (j) => {
    if (j.type === 'lignesJustes') return X.lignesJustes;
    if (j.type === 'reappro') return X.reappro;
    if (CRIT_PALETTE.includes(j.type)) return X.lignesJustes && X.regles.find((r) => r.id === j.type).ok;
    if (j.type === 'parcours') {
      const garde = j.garde === 'lignesJustes' ? X.lignesJustes : X.faits.length > 0;
      return garde && X.metres <= best + 1e-6;
    }
    return false;
  };
  return M.jalons.map((j) => ({ id: j.id, lib: j.lib, type: j.type, ok: juge(j) }));
}

// Les fautes de la palette `id` si elle était posée en `a`, les autres palettes de l'élève restant où
// elles sont (`place`). Rend [{ crit, nom, txt }] ; vide = bien rangée.
function fautes(M, place, id, a) {
  const p = M.pal[id];
  if (!a) return [{ crit: 'pose', nom: 'rangement', txt: 'pas posée' }];
  const lit = M.crit.find((c) => c.type === 'litige');
  const msg = (c, defaut, x) => (typeof c.message === 'function' ? c.message(x) : typeof c.message === 'string' ? c.message : defaut);
  const x = { P: M.P, M, p, a, place };
  if (M.estLitige(a) && (!lit || p.litige)) return [];
  if (lit && (M.estLitige(a) || p.litige)) {
    const txt = p.litige ? `${p.reception || 'palette en litige'} : elle va en zone litiges` : "elle n'est pas en litige : elle va en stock";
    return [{ crit: lit.id, nom: lit.nom, txt: msg(lit, txt, x) }];
  }
  const d = decoupe(a);
  Object.assign(x, { d, cote: M.cotes[d.c] });
  const F = [];
  M.crit.forEach((c) => {
    const T = CRITERES[c.type];
    if (!T.juger) return;
    const txt = T.juger(Object.assign({ crit: c }, x));
    if (txt) F.push({ crit: c.id, nom: c.nom, txt: msg(c, txt, x) });
  });
  return F;
}

// Toutes les bonnes réponses d'une palette, sur le stock de départ (aucune autre palette de l'élève
// posée) : pour la page d'essai, l'enseignant et les tests. JAMAIS montrées à l'élève.
function solutions(M, id) {
  return [...M.litiges, ...M.toutes].filter((a) => !M.stock[a] && !fautes(M, {}, id, a).length);
}

export function etatNeuf(mode) {
  if (mode === 'preparation') return etatPrepNeuf();
  if (mode === 'visite') return etatVisiteNeuf();
  return { place: {}, verifie: false, verifs: 0, premierGeste: null, aideCharge: true };
}
const etatDe = (db, P) => (db && db.entrepots && db.entrepots[P.id]) || etatNeuf(P.mode);

// Les jalons d'une base. Rangement : une palette est juste si elle est posée ET qu'aucun critère n'est
// faux à son adresse ; non posée = faux (l'inaction ne rapporte rien). Préparation : voir `jalonsPrep`.
// `temps` ne compte que pour le parcours de la préparation (en évaluation, le meilleur des deux).
export function jalonsEntrepot(db, P, temps = P.temps) {
  const M = compiler(P);
  const e = etatDe(db, P);
  let L;
  if (M.mode === 'preparation') L = jalonsPrep(M, Object.assign(etatPrepNeuf(), e), temps);
  else if (M.mode === 'visite') L = jalonsVisite(M, e);
  else {
    const place = e.place || {};
    L = M.jalons.map((j) => ({ id: j.id, lib: j.lib, palette: j.palette,
      ok: !!place[j.palette] && !fautes(M, place, j.palette, place[j.palette]).length }));
  }
  return { L, ok: L.filter((l) => l.ok).length, total: L.length };
}

// Les étapes à donner à `creerEntreprise` : un jalon = une étape du suivi. La visite rend aussi 'ko' (un
// essai faux), pour que le repérage sache ce qui n'a pas été réussi du premier coup.
export function etapesEntrepot(P) {
  return jalonsEntrepot({}, P).L.map(({ id, lib }) => ({
    id, titre: lib,
    verifier(db) {
      const l = jalonsEntrepot(db, P).L.find((x) => x.id === id);
      return { status: l && l.etat ? l.etat : l && l.ok ? 'ok' : 'attente' };
    },
  }));
}

// La note d'évaluation : jalons réussis / jalons × `note.sur` (comme le Planning).
export function noteEntrepot(db, P, temps = P.temps) {
  const N = Object.assign({ sur: 20 }, P.note || {});
  const { L, ok, total } = jalonsEntrepot(db, P, temps);
  const e = etatDe(db, P);
  const score = total ? Math.round(ok / total * N.sur * 100) / 100 : 0;
  if (compiler(P).mode === 'visite') {
    return { score, max: N.sur, ok, total, detail: { jalons: L.map((l) => ({ jalon: l.lib, ok: l.ok })), visite: detailVisite(compiler(P), e) } };
  }
  if (compiler(P).mode === 'preparation') {
    const X = calculPrep(compiler(P), Object.assign(etatPrepNeuf(), e));
    return { score, max: N.sur, ok, total,
      detail: { jalons: L.map((l) => ({ jalon: l.lib, ok: l.ok })), metres: Math.round(X.metres), tours: X.tours,
        parcours: X.mode, essaisReserve: (e.essaisReserve || []).length, verifs: e.verifs || 0, premierGeste: e.premierGeste || null } };
  }
  return { score, max: N.sur, ok, total,
    detail: { jalons: L.map((l) => ({ jalon: l.lib, ok: l.ok, adresse: (e.place || {})[l.palette] || null })),
      verifs: e.verifs || 0, premierGeste: e.premierGeste || null } };
}

// Les bonnes réponses de chaque palette (page d'essai, tests, côté enseignant).
export function bonnesReponses(P) {
  const M = compiler(P);
  return Object.fromEntries(Object.keys(M.pal).map((id) => [id, solutions(M, id)]));
}
// Ce que la préparation attend (page d'essai, côté enseignant, tests) : les meilleurs tours, et la
// palette montée dans l'ordre du serpentin. JAMAIS montré à l'élève.
export function attendusPreparation(P) {
  const M = compiler(P);
  const juste = calculPrep(M, Object.assign(etatPrepNeuf(), { faits: M.lignes.map((l) => ({ a: l.a, k: l.produit, q: l.q })) }));
  const desordre = calculPrep(M, Object.assign(etatPrepNeuf(), { faits: M.desordre.map((i) => M.lignes[i]).map((l) => ({ a: l.a, k: l.produit, q: l.q })) }));
  return { serpentin: M.meilleur.serpentin, retour: M.meilleur.retour, poids: juste.poids, hauteur: juste.hauteur,
    ordreSerpentin: juste.metres, desordre: { metres: desordre.metres, tours: desordre.tours } };
}
// Ce qu'une base donne en préparation (tests) : mètres, tours, poids, hauteur, règles de la palette.
export function calculPreparation(P, e) { return calculPrep(compiler(P), Object.assign(etatPrepNeuf(), e)); }
// Les fautes d'une palette posée à une adresse (tests : « chaque piège nomme son critère, et lui seul »).
export function fautesEntrepot(P, id, a, place = {}) { return fautes(compiler(P), place, id, a); }

/* ================================================================ géométrie */
// Le plan vu de dessus, en unités SVG (la maquette v2 donne 800 × 562 pour 2 allées de 2 côtés et
// 4 travées). Les allées se suivent de gauche à droite ; deux blocs voisins sont dos à dos. À droite
// des racks : zone litiges, bureau, zone de réception. La place libre à droite reste pour d'autres
// allées (décision de Tristan, 04/10) : le plan s'élargit avec elles.
const RW = 80, AW = 90, DOS = 4, X0 = 30, Y0 = 70, TH = 100, ZW = 210;
function geometrie(M) {
  let x = X0;
  const racks = {}, allees = {};
  M.allees.forEach((al, i) => {
    if (i) x += DOS;
    const [g, d] = al.cotes;
    if (g) { racks[g] = { x, regard: 'ouest' }; x += RW; }
    allees[al.id] = { x, cx: x + AW / 2 };
    x += AW;
    if (d) { racks[d] = { x, regard: 'est' }; x += RW; }
  });
  const droite = x;
  const ZX = droite + 38;
  const yBas = Y0 + M.T * TH;          // bas des racks
  const yPr = yBas + 12;               // allée principale
  // À droite des racks, de haut en bas : zone litiges, bureau ; la zone de réception descend jusqu'à
  // l'allée principale (en visite, elle est vide : sa place ne dépend plus des palettes).
  let y = 40;
  const litiges = M.litiges.length ? { y, h: 30 + Math.ceil(M.litiges.length / 2) * 74 } : null;
  if (litiges) y += litiges.h + 18;
  const bureau = M.zones.bureau ? { y, h: 54 } : null;
  if (bureau) y += 54 + 18;
  const yRec = Math.max(y, yPr - 192);
  return { racks, allees, droite, ZX, W: ZX + ZW + 18, H: yBas + 92, yBas, yPr, litiges, bureau,
    recep: { y: yRec, h: yPr - 6 - yRec },
    quaiX: (i) => 270 + i * 100,
    yTrav: (t) => Y0 + (M.T - t) * TH }; // T01 en bas, près de l'allée principale
}

/* ======================================================================= vue */
export function creerEntrepot(P, opts = {}) {
  const M = compiler(P);
  if (M.mode === 'visite' && opts.copie) throw new Error(`entrepot ${P.id} : le mode visite n'a pas d'évaluation`);
  const G = geometrie(M);
  const PREP = M.mode === 'preparation';
  // `empl` : la fiche de prélèvement ouverte ; `reappro` : le picking qu'on réapprovisionne (on attend le
  // clic sur la palette de réserve) ; `voir` : la palette de commande ouverte ; `nb` : la saisie en cours.
  const ui = { main: null, trav: null, msg: '', msgType: '', anim: false, regles: false, confirmer: false, focus: null,
    empl: null, reappro: null, voir: false, nb: '' };

  const tempsDe = (api) => (opts.copie ? 'evaluation' : P.temps || (api && api.temps) || 'guidage');
  function regime(api) {
    const t = tempsDe(api);
    const rendue = !!(api && api.copieRendue && api.copieRendue());
    return { t, g: t === 'guidage', entr: t === 'entrainement', eval: t === 'evaluation', rendue,
      fige: t === 'evaluation' && rendue,
      bandes: t === 'guidage' && !PREP, parcours: t !== 'evaluation', regles: t !== 'evaluation', aideCharge: !PREP };
  }
  const produit = (p) => M.produits[p.produit];
  const nomPal = (p) => p.nom || produit(p).nom;
  const court = (k) => { const p = M.produits[k]; return p.court || String(p.nom).split(' ')[0]; };
  // En préparation, une palette de réserve descendue au picking libère son emplacement (`vides`).
  const etatEmp = (e, a) => (M.hs.has(a) ? 'hs' : M.stock[a] && !(e.vides || []).includes(a) ? 'stock' : M.occupant(e.place, a) ? 'eleve' : 'libre');
  // Le grand espace montre la vue ouverte (sinon le plan) : une travée, et en préparation la fiche de
  // prélèvement ou la palette de commande (toujours elle, une fois la préparation terminée).
  const vueOuverte = (e, R) => (PREP ? !!(ui.trav || ui.empl || ui.voir || e.fin || R.fige) : !!ui.trav);

  /* ----------------------------------------------------------- les gestes */
  function noterGeste(e) { if (!e.premierGeste) e.premierGeste = Date.now(); }
  function dire(t, type) { ui.msg = t; ui.msgType = type || ''; }
  function prendre(e, id) {
    if (e.place[id]) delete e.place[id];             // reprendre une palette déjà posée
    else if (ui.main === id) { ui.main = null; dire(''); return; }
    ui.main = id; e.verifie = false; ui.confirmer = false; dire('');
    noterGeste(e);
  }
  function poser(e, a) {
    if (!ui.main) { dire(`<b>${ech(a)}</b> : prenez d'abord une palette.`); return false; }
    if (M.stock[a] || M.occupant(e.place, a)) {
      dire(M.estLitige(a) ? `${ech(a)} est déjà occupé.` : 'Emplacement déjà occupé. La palette reste en main.', 'non');
      return false;
    }
    e.place[ui.main] = a; e.verifie = false; ui.confirmer = false;
    dire(M.estLitige(a) ? `<b>${ech(ui.main)}</b> posée en zone litiges ${ech(a)}.` : `<b>${ech(ui.main)}</b> posée en <b>${ech(a)}</b>.`, 'oui');
    ui.main = null;
    noterGeste(e);
    return true;
  }

  /* ----------------------------------------------- l'adresse qui se construit */
  function htmlAdresse(e, R, survol) {
    const t = ui.trav ? decoupe(`${ui.trav}-N1-E1`) : null;
    const s = survol ? decoupe(survol) : ui.empl ? decoupe(ui.empl) : null;
    const v = [t && t.c, t && `T${pad2(t.t)}`, s && `N${s.n}`, s && `E${s.e}`];
    const lib = ['allée · côté', 'travée', 'niveau', 'emplacement'];
    const prochain = v.findIndex((x) => !x);
    const cases = v.map((x, i) => `<span class="pe-case${x ? ' pe-plein' : ''}${i === prochain && (i < 2 || t) ? ' pe-attend' : ''}"><b>${x || '?'}</b><small>${lib[i]}</small></span>`)
      .join('<span class="pe-tiret">-</span>');
    return `<span class="pe-lbl">Adresse</span>${cases}<span class="pe-consigne" data-pe-consigne>${consigne(e, R)}</span>`;
  }
  function consigne(e, R) {
    if (PREP) return consignePrep(e, R);
    const n = (k, txt) => `<span class="pe-num">${k}</span>${txt}`;
    const nb = Object.keys(e.place).length, total = Object.keys(M.pal).length;
    if (R.fige) return n('✓', 'Copie rendue. Le résultat sera donné par votre enseignant.');
    if (nb === total && !ui.main) {
      if (R.eval) return n('✓', `Les ${total} palettes sont posées. Relisez votre rangement, puis cliquez <b>Rendre mon travail</b>.`);
      return e.verifie ? n('✓', 'Une palette mal rangée ? Cliquez sa carte pour la reprendre en main.')
        : n('✓', `Les ${total} palettes sont posées. Cliquez <b>Vérifier mon rangement</b>.`);
    }
    if (!ui.main) return n(1, `Prenez une palette (carte ci-dessus ou zone de réception du plan)${R.g ? ' : sa consigne s’affiche à gauche du plan.' : '.'}`);
    const p = M.pal[ui.main];
    if (!ui.trav) return n(2, `<b>${ech(p.id)}</b> en main (${kg(p.kg)}). Choisissez une <b>travée</b> sur le plan${p.litige && R.g ? ' — ou la zone litiges' : ''}.`);
    return n(3, `<b>${ech(p.id)}</b> en main (${kg(p.kg)}). Choisissez le <b>niveau</b> et l'<b>emplacement</b> dans la vue de face.`);
  }

  /* -------------------------------------------------------------- le bandeau */
  function verdict(e, id, R, api) {
    const f = fautes(M, e.place, id, e.place[id]);
    if (R.eval) {
      if (!(R.rendue && api.estProf)) return '';
      return f.length ? `<span class="pe-verd pe-ko">✗ ${ech([...new Set(f.map((x) => x.nom))].join(', '))}</span>` : '<span class="pe-verd pe-ok">✓ bien rangée</span>';
    }
    if (!e.verifie) return '';
    if (!f.length) return '<span class="pe-verd pe-ok" data-pe-verdict="ok">✓ bien rangée</span>';
    // Guidage comme entraînement : le NOM du critère, jamais le texte qui dit où aller (sinon « Vérifier »
    // illimité range à la place de l'élève ; décision de Tristan du 04/10, brief MOTEUR-entrepot-verdict-guidage).
    return `<span class="pe-verd pe-ko" data-pe-verdict="ko">✗ critère : ${ech([...new Set(f.map((x) => x.nom))].join(', '))}</span>`;
  }
  function fichePalette(e, p) {
    const r = (P.plan.rotation || {})[p.rotation];
    const ou = e.place[p.id];
    return `<dl><dt>Poids</dt><dd>${kg(p.kg)}</dd><dt>Gamme</dt><dd>${ech(M.nomGamme(produit(p).gamme))}</dd>
      ${r ? `<dt>Rotation</dt><dd>${ech(p.rotation)} (${ech(r.lib)})</dd>` : ''}<dt>Contrainte</dt><dd>${ech(p.contrainte || '—')}</dd>
      <dt>Réception</dt><dd class="${p.reception ? 'pe-res' : ''}">${ech(p.reception || 'conforme')}</dd>
      <dt>Emplacement</dt><dd>${ou ? `<span class="pe-etat pe-mono">${ech(ou)}</span>` : ui.main === p.id ? '<span class="pe-etat">en main</span>' : '—'}</dd></dl>`;
  }
  function htmlBandeau(e, R, api) {
    const per = P.personnage || {};
    const txt = (per.texte || {})[R.t] || '';
    const cartes = Object.values(M.pal).map((p) => `<button type="button" title="${ech(`${p.id} ${nomPal(p)}`)}" class="pe-pal${ui.main === p.id ? ' pe-en-main' : ''}${e.place[p.id] ? ' pe-posee' : ''}"
        data-pe-pal="${ech(p.id)}" data-pe-cle="pal:${ech(p.id)}" ${R.fige ? 'disabled' : ''} aria-pressed="${ui.main === p.id}">
        <span class="pe-ttl"><span class="pe-pid">${ech(p.id)}</span> ${ech(nomPal(p))}</span>${fichePalette(e, p)}
        <span class="pe-verd-l" data-pe-verd="${ech(p.id)}">${verdict(e, p.id, R, api)}</span></button>`).join('');
    const nb = Object.keys(e.place).length;
    let act;
    if (R.eval) {
      act = R.rendue ? '<button type="button" class="btn" disabled>Copie rendue</button>'
        : ui.confirmer ? `<span class="pe-confirme">Rendre la copie ? Vous ne pourrez plus rien changer.
            <button type="button" class="btn btn-p" data-pe="rendreOui" data-pe-cle="b:rendreOui">Oui, rendre</button>
            <button type="button" class="btn" data-pe="rendreNon" data-pe-cle="b:rendreNon">Non</button></span>`
          : `<button type="button" class="btn btn-p" data-pe="rendre" data-pe-cle="b:rendre">Rendre mon travail</button>`;
    } else {
      act = `<button type="button" class="btn btn-p" data-pe="verifier" data-pe-cle="b:verifier" ${nb ? '' : 'disabled'}>Vérifier mon rangement</button>`;
    }
    const RG = P.regles;
    const regles = R.regles && RG ? `<details class="pe-regles" data-pe-regles ${ui.regles ? 'open' : ''}><summary data-pe-cle="b:regles">${ech(RG.titre || 'Les règles')} ▾</summary>
      <div class="pe-regles-corps"><b>${ech(RG.entete || "Les règles de l'entrepôt")}</b><ol>${(RG.lignes || []).map((l) => `<li>${l}</li>`).join('')}</ol>
      ${RG.encadre ? `<div class="pe-encadre">${RG.encadre}</div>` : ''}</div></details>` : '';
    return `<div class="pe-bandeau">
      <div class="pe-perso"><b>${ech([per.nom, per.role].filter(Boolean).join(', '))}${per.date ? ` · ${ech(per.date)}` : ''}</b>${txt}</div>
      <div class="pe-liste"><h3>${ech(P.titreListe || 'Palettes à ranger')}</h3><div class="pe-cartes">${cartes}</div></div>
      <div class="pe-act">${act}${regles}</div></div>`;
  }

  /* --------------------------------------------------- la colonne de côté */
  function consignePalette(p) {
    if (p.litige) return [`${ech(p.reception || 'Palette en litige')} : <b>zone litiges</b>.`];
    const L = [];
    const g = produit(p).gamme;
    const has = (t) => M.crit.some((c) => c.type === t);
    const R = P.plan.parcours || {};
    if (has('gamme')) L.push(`gamme ${ech(M.nomGamme(g))} : côté <b>${M.cotesDeGamme(g).join(' ou ')}</b>`);
    if (has('parcours') && p.contrainte === 'lourd' && R.debut) L.push(`produit lourd : <b>début de parcours (allée ${ech(R.debut)})</b>`);
    if (has('parcours') && p.contrainte === 'fragile' && R.fin) L.push(`produit fragile : <b>fin de parcours (allée ${ech(R.fin)})</b>`);
    const r = (P.plan.rotation || {})[p.rotation];
    if (has('rotation') && r) L.push(`rotation ${ech(r.lib)} : <b>${ech(r.texte)}</b>`);
    M.crit.filter((c) => c.type === 'niveauInterdit' && (!c.si || c.si === p.contrainte))
      .forEach((c) => L.push(`${ech(p.contrainte || 'ce produit')} : <b>pas au niveau ${c.niveaux.map((n) => `N${n}`).join(' ni ')}</b>`));
    if (has('charge')) L.push('vérifie la <b>charge du niveau</b>');
    return L;
  }
  function htmlCote(e, R, api) {
    let h = '';
    if (R.g && !R.fige) {
      h += `<div class="pe-cons" data-pe-cons>${ui.main
        ? `<b>Consigne pour ${ech(ui.main)}</b>${consignePalette(M.pal[ui.main]).map((l) => `<span>${l}</span>`).join('')}`
        : 'Prenez une palette : sa consigne s’affiche ici.'}</div>`;
    }
    if (!ui.trav) {
      h += `<div class="pe-msg-cote pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pe-msg-plan>${ui.msg}</div>`;
      h += `<div class="pe-astuce">Cliquez une <b>travée</b> sur le plan : elle s’ouvre en grand, vue de face.</div>`;
    }
    h += `<div class="pe-implant"><span class="pe-t">Implantation :</span>${M.ordre.map((c) => `<span><b>${ech(c)}</b> ${ech(M.cotes[c].gammes.map(M.nomGamme).join(' + '))}${M.cotes[c].note ? ` <i>(${ech(M.cotes[c].note)})</i>` : ''}</span>`).join('')}</div>`;
    h += `<div class="pe-legende"><span><i class="pe-puce pe-p-stock"></i>occupé</span><span><i class="pe-puce pe-p-eleve"></i>votre palette</span>
      <span><i class="pe-puce pe-p-hs"></i>hors service</span><span><i class="pe-puce"></i>libre</span></div>`;
    if (api.estProf) {
      const B = bonnesReponses(P);
      h += `<details class="pe-prof"><summary>Côté enseignant : bonnes réponses</summary>${Object.entries(B).map(([id, L]) =>
        `<div><b>${ech(id)}</b> : <span class="pe-mono">${L.map(ech).join(', ') || 'aucune'}</span></div>`).join('')}</details>`;
    }
    return `<aside class="pe-cote">${h}</aside>`;
  }

  /* -------------------------------------------------- le plan vu de dessus */
  const TXT = 'font-family="inherit"';
  // `o.lecture` : travées non cliquables (parcours de visite) ; `o.dessus` : ce qu'une visite pose sur le
  // plan (trace, étapes, cônes de vue) ; `o.aria` : la description du plan.
  function htmlPlan(e, R, o = {}) {
    const { racks, allees, ZX, W, H, yBas, yPr, yTrav } = G;
    const ink = 'var(--encre)', soft = 'var(--encre-douce)';
    const ids = M.allees.map((a) => a.id);
    let s = `<defs><pattern id="peHach" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="var(--pe-litige)"/><line x1="0" y1="0" x2="0" y2="10" stroke="var(--pe-hachure)" stroke-width="4"/></pattern>
      <marker id="peFl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--pe-jaune-sol)"/></marker>
      <marker id="peOeil" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ardoise)"/></marker></defs>`;
    s += `<rect x="10" y="10" width="${W - 20}" height="${H - 17}" fill="var(--pe-sol)" stroke="${ink}" stroke-width="5"/>`;
    // les allées entre les racks, et le passage du haut qui les relie
    M.allees.forEach((al) => {
      const x = allees[al.id].x, yc = Y0 + M.T * TH / 2;
      s += `<rect x="${x}" y="${Y0 - 54}" width="${AW}" height="${M.T * TH + 54}" fill="var(--pe-sol2)"/>`;
      s += `<text x="${x + AW / 2}" y="${yc}" text-anchor="middle" font-size="22" font-weight="800" fill="${soft}" ${TXT} letter-spacing="3" transform="rotate(-90 ${x + AW / 2} ${yc})">ALLÉE ${ech(al.id)}</text>`;
    });
    const xa = allees[ids[0]].x, xb = allees[ids[ids.length - 1]].x + AW;
    if (ids.length > 1) s += `<rect x="${xa}" y="16" width="${xb - xa}" height="26" fill="var(--pe-sol2)"/>`;
    // l'allée principale (flèches de sens unique)
    s += `<rect x="16" y="${yPr}" width="${W - 32}" height="54" fill="var(--pe-sol2)"/>
      <line x1="16" y1="${yPr}" x2="${W - 16}" y2="${yPr}" stroke="var(--pe-jaune-sol)" stroke-width="4"/><line x1="16" y1="${yPr + 54}" x2="${W - 16}" y2="${yPr + 54}" stroke="var(--pe-jaune-sol)" stroke-width="4"/>
      ${PREP && R.eval ? '' : `<line x1="360" y1="${yPr + 18}" x2="240" y2="${yPr + 18}" stroke="var(--pe-jaune-sol)" stroke-width="3" marker-end="url(#peFl)"/><line x1="60" y1="${yPr + 36}" x2="180" y2="${yPr + 36}" stroke="var(--pe-jaune-sol)" stroke-width="3" marker-end="url(#peFl)"/>`}
      <text x="${o.dessus ? 470 : 380}" y="${yPr + 32}" font-size="13" font-weight="700" fill="${soft}" ${TXT}>ALLÉE PRINCIPALE</text>`;
    // le passage piétons (décor de visite) : il traverse l'allée principale devant la zone déclarée
    const PP = M.zones.passagePietons;
    if (PP) {
      const xp = PP.x || G.ZX + 108;
      s += `<pattern id="peZebre" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="6" height="12" fill="#f3f0e8"/></pattern>
        <rect x="${xp - 20}" y="${yPr + 2}" width="40" height="50" fill="url(#peZebre)" stroke="${soft}" stroke-dasharray="3 3" data-pe-pietons/>
        <text x="${xp + 26}" y="${yPr + 24}" font-size="10.5" font-weight="700" fill="${soft}" ${TXT}>passage</text><text x="${xp + 26}" y="${yPr + 38}" font-size="10.5" font-weight="700" fill="${soft}" ${TXT}>piétons</text>`;
    }
    // les bandes de rotation (guidage) : A près des quais, puis B, puis C au fond
    if (R.bandes && P.plan.rotation) {
      const op = [0.2, 0.1, 0];
      Object.entries(P.plan.rotation).forEach(([k, r], i) => {
        const tt = r.travees || []; if (!tt.length) return;
        const tH = Math.max(...tt), tB = Math.min(...tt), y = yTrav(tH), h = (tH - tB + 1) * TH, xl = G.droite + 14;
        if (op[i]) s += `<rect x="16" y="${y}" width="${G.droite + 4}" height="${h}" fill="rgba(var(--pe-bande),${op[i]})" data-pe-bande="${ech(k)}"/>`;
        s += `<text x="${xl}" y="${y + h / 2}" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--terre)" ${TXT} transform="rotate(-90 ${xl} ${y + h / 2})">${ech(k)} · ${ech(String(r.lib).toUpperCase())}</text>`;
      });
    }
    M.allees.forEach((al) => al.cotes.forEach((c) => { s += htmlRack(e, c, racks[c], o.lecture); }));
    // le parcours de prélèvement, à sens unique : il monte la première allée et redescend la suivante
    if (R.parcours && P.plan.parcours) {
      const yh = 29, yb = yPr + 18;
      const xs = ids.map((id) => allees[id].cx);
      let d = `M${xs[0]},${yb}`;
      xs.forEach((x, i) => { const haut = i % 2 === 0; d += i ? ` L${x},${haut ? yb : yh}` : ''; d += ` L${x},${haut ? yh : yb}`; });
      s += `<path d="${d}" fill="none" stroke="var(--ardoise)" stroke-width="3" stroke-dasharray="9 6" data-pe-parcours/>`;
      xs.forEach((x, i) => {
        const monte = i % 2 === 0;
        s += `<path d="M${x},${monte ? yBas - 100 : 140} L${x},${monte ? 120 : yBas - 150}" fill="none" stroke="var(--ardoise)" stroke-width="3" marker-end="url(#peOeil)"/>`;
      });
      const etiq = (x, t) => `<rect x="${x - 32}" y="${yBas - 4}" width="64" height="18" rx="9" fill="var(--panneau)" stroke="var(--ardoise)" stroke-width="2"/><text x="${x}" y="${yBas + 9}" text-anchor="middle" font-size="11" font-weight="800" fill="var(--ardoise)" ${TXT}>${t}</text>`;
      s += etiq(xs[0], 'départ') + (xs.length > 1 ? etiq(xs[xs.length - 1], 'arrivée') : '');
      if (xs.length > 1) s += `<text x="${(xa + xb) / 2}" y="25" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--ardoise)" ${TXT}>PARCOURS DE PRÉLÈVEMENT →</text>`;
    }
    // à droite des racks : zone litiges, bureau, zone de réception
    let y = 40;
    if (M.litiges.length) {
      const rangs = Math.ceil(M.litiges.length / 2), h = 30 + rangs * 74;
      s += `<rect x="${ZX}" y="${y}" width="${ZW}" height="${h}" fill="url(#peHach)" stroke="var(--rouge)" stroke-width="2.5" stroke-dasharray="8 5"/>
        <text x="${ZX + ZW / 2}" y="${y + 20}" text-anchor="middle" font-size="15" font-weight="800" fill="var(--rouge)" ${TXT}>ZONE LITIGES</text>`;
      M.litiges.forEach((l, i) => {
        const x = ZX + 16 + (i % 2) * 94, yl = y + 30 + Math.floor(i / 2) * 74, p = M.occupant(e.place, l);
        s += `<g class="pe-lit" data-pe-lit="${ech(l)}" data-pe-cle="lit:${ech(l)}" tabindex="0" role="button" aria-label="Zone litiges ${ech(l)}${p ? `, ${ech(p)}` : ', libre'}">
          <rect x="${x}" y="${yl}" width="84" height="64" rx="3" fill="${p ? 'var(--pe-carton)' : 'var(--panneau)'}" stroke="var(--rouge)" stroke-width="2"/>
          <text x="${x + 42}" y="${yl + (p ? 26 : 38)}" text-anchor="middle" class="pe-mono" font-size="16" font-weight="700" fill="${p ? '#1a1915' : soft}">${ech(l)}</text>
          ${p ? `<text x="${x + 42}" y="${yl + 50}" text-anchor="middle" font-size="16" font-weight="800" fill="#1a1915" ${TXT}>${ech(p)}</text>` : ''}</g>`;
      });
      y += h + 18;
    }
    if (M.zones.bureau) {
      s += `<rect x="${ZX}" y="${y}" width="${ZW}" height="54" fill="var(--panneau)" stroke="${ink}" stroke-width="2.5"/>
        <text x="${ZX + ZW / 2}" y="${y + 24}" text-anchor="middle" font-size="14" font-weight="700" fill="${ink}" ${TXT}>Bureau</text><text x="${ZX + ZW / 2}" y="${y + 41}" text-anchor="middle" font-size="12" fill="${soft}" ${TXT}>${ech(M.zones.bureau)}</text>`;
    }
    const pals = Object.values(M.pal), rangs = Math.max(1, Math.ceil(pals.length / 2));
    const hR = rangs * 76 + 34, yR = yPr - 6 - hR;
    if (PREP) s += htmlPlanPrep(e, R);
    else if (M.mode === 'visite') {
      const Z = M.zones.reception || {}, r = G.recep;
      s += `<rect x="${ZX}" y="${r.y}" width="${ZW}" height="${r.h}" fill="none" stroke="var(--pe-jaune-sol)" stroke-width="3" stroke-dasharray="12 6"/>
        <text x="${ZX + 10}" y="${r.y + 20}" font-size="13" font-weight="800" fill="${ink}" ${TXT}>ZONE DE RÉCEPTION</text>
        ${Z.note ? `<text x="${ZX + 10}" y="${r.y + 38}" font-size="12" fill="${soft}" ${TXT}>${ech(Z.note)}</text>` : ''}`;
    } else {
      s += `<rect x="${ZX}" y="${yR}" width="${ZW}" height="${hR}" fill="none" stroke="var(--pe-jaune-sol)" stroke-width="3" stroke-dasharray="12 6"/>
        <text x="${ZX + 10}" y="${yR + 20}" font-size="13" font-weight="800" fill="${ink}" ${TXT}>ZONE DE RÉCEPTION</text>`;
    }
    pals.forEach((p, i) => {
      if (e.place[p.id]) return;
      const x = ZX + 16 + (i % 2) * 94, yp = yR + 32 + Math.floor(i / 2) * 76, on = ui.main === p.id;
      s += `<g class="pe-palq" data-pe-pal="${ech(p.id)}" data-pe-cle="palq:${ech(p.id)}" tabindex="0" role="button" aria-label="Palette ${ech(p.id)}, ${kg(p.kg)}${on ? ', en main' : ''}">
        <rect x="${x}" y="${yp}" width="84" height="66" rx="3" fill="var(--pe-carton)" stroke="${on ? 'var(--ardoise)' : 'var(--pe-carton-trait)'}" stroke-width="${on ? 6 : 2}"/>
        <rect x="${x + 16}" y="${yp + 7}" width="52" height="24" rx="2" fill="#fbfaf6"/><text x="${x + 42}" y="${yp + 25}" text-anchor="middle" font-size="17" font-weight="800" fill="#1a1915" ${TXT}>${ech(p.id)}</text>
        <text x="${x + 42}" y="${yp + 54}" text-anchor="middle" font-size="15" font-weight="700" fill="#1a1915" ${TXT}>${kg(p.kg)}</text></g>`;
    });
    // les quais, sur le mur du bas
    (M.zones.quais || []).forEach((q, i) => {
      const x = G.quaiX(i);
      const lib = PREP && q === M.C.quai && M.C.enlevement ? `${q} · ${M.C.enlevement}` : q;
      s += `<rect x="${x}" y="${H - 24}" width="80" height="15" fill="var(--pe-jaune-sol)"/><text x="${x + 40}" y="${H - 12}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1a1915" ${TXT}>${ech(lib)}</text>`;
    });
    s += `<g transform="translate(${W - 30},20)"><circle r="12" fill="var(--panneau)" stroke="${soft}"/><path d="M0,-8 L3.5,3.5 L0,1 L-3.5,3.5 z" fill="${ink}"/><text x="-18" y="4" text-anchor="middle" font-size="10" font-weight="800" fill="${ink}" ${TXT}>N</text></g>`;
    if (o.dessus) s += o.dessus;
    return `<svg class="pe-svg-plan" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${ech(o.aria || "Plan de l'entrepôt, travées cliquables")}">${s}</svg>`;
  }
  // Un côté de rack vu de dessus, découpé entre chaque échelle ; chaque travée montre ses niveaux.
  function htmlRack(e, c, g, lecture) {
    const x = g.x;
    let s = `<text x="${x + RW / 2}" y="${Y0 - 10}" text-anchor="middle" font-size="20" font-weight="800" fill="var(--encre)" ${TXT}>${ech(c)}</text>`;
    for (let t = 0; t <= M.T; t++) s += `<rect x="${x - 2}" y="${Y0 + t * TH - 4}" width="${RW + 4}" height="8" fill="var(--pe-montant)"/>`;
    const cw = 54 / M.E, ch = 51 / M.N;
    for (let t = 1; t <= M.T; t++) {
      const y = G.yTrav(t), id = `${c}-T${pad2(t)}`;
      const lisseX = g.regard === 'ouest' ? x + RW - 3 : x;   // les lisses sont côté allée
      s += `<g ${lecture ? 'class="pe-trav-l"' : `class="pe-trav" data-pe-trav="${id}" data-pe-cle="trav:${id}" tabindex="0" role="button" aria-label="Travée ${id}, ${M.N} niveaux"`}>
        <rect class="pe-fond-trav" x="${x}" y="${y + 5}" width="${RW}" height="${TH - 10}" rx="2" fill="var(--panneau)" stroke="var(--pe-gris-trait)" stroke-width="1.2"/>
        <rect x="${lisseX}" y="${y + 5}" width="3" height="${TH - 10}" fill="var(--pe-lisse)"/>
        <text x="${x + RW / 2}" y="${y + 24}" text-anchor="middle" class="pe-mono" font-size="15" font-weight="800" fill="var(--encre)">T${pad2(t)}</text>`;
      for (let n = 1; n <= M.N; n++) for (let e2 = 1; e2 <= M.E; e2++) {
        const a = adresse(c, t, n, e2), st = etatEmp(e, a);
        const fill = st === 'stock' ? 'var(--pe-gris)' : st === 'eleve' ? 'var(--pe-carton)' : st === 'hs' ? 'url(#peHach)' : 'var(--panneau)';
        s += `<rect x="${(x + 13 + (e2 - 1) * cw).toFixed(1)}" y="${(y + 82 - n * ch).toFixed(1)}" width="${(cw - 2).toFixed(1)}" height="${(ch - 4).toFixed(1)}" fill="${fill}" stroke="${st === 'hs' ? 'var(--rouge)' : 'var(--pe-gris-trait)'}" stroke-width=".8" data-pe-mini="${a}" data-pe-etat="${st}"/>`;
      }
      for (let n = 1; n <= M.N; n++) s += `<line x1="${x + 12}" y1="${(y + 82 - (n - 1) * ch - 2).toFixed(1)}" x2="${x + 68}" y2="${(y + 82 - (n - 1) * ch - 2).toFixed(1)}" stroke="var(--pe-lisse)" stroke-width="1.5"/>`;
      s += `<text x="${x + RW / 2}" y="${y + 96}" text-anchor="middle" font-size="9.5" fill="var(--encre-douce)" ${TXT}>${M.N} niveaux</text></g>`;
    }
    return s;
  }

  /* ------------------------------------------- la travée vue de face */
  function htmlFace(e, R) {
    const d = decoupe(`${ui.trav}-N1-E1`), c = M.cotes[d.c], g = G.racks[d.c];
    // Le capteur de charge (05/10/2026) : un boîtier fixé au montant droit, un par niveau au-dessus du sol. Il
    // affiche ce qui est posé sur le niveau, plus la palette en main (dans les trois temps : il calcule). En
    // guidage et en entraînement, chiffres et cadre passent au rouge avec « SURCHARGE » au-delà de la plaque ;
    // en évaluation, jamais : il dirait « faux » avant la copie. Désactivable (case « capteur de charge »).
    const aide = R.aideCharge && e.aideCharge !== false, CG = 14, CW = 104;
    const PW = 160, XG = 40, WF = XG * 2 + M.E * PW + (aide ? CG + CW : 0), base = 140 + (M.N - 1) * 130, HF = base + 40;
    const Y = (n) => base - (n - 1) * 130;
    const pm = ui.main ? M.pal[ui.main] : null;
    const capteur = (n, yb, x, pose, max) => {
      const v = pm ? M.chargeNiveau(e.place, { c: d.c, t: d.t, n }, pm.id) + pm.kg : pose;
      const trop = !R.eval && v > max, y = yb - 104, h = 92, lum = trop ? '#ff8a7a' : '#f3d04a';
      const bas = trop ? 'SURCHARGE' : pm ? `dont ${nb(pm.kg)} en main` : 'posé';
      return `<g data-pe-capteur="${n}" role="img" aria-label="Capteur de charge N${n} : ${kg(v)}${pm ? `, dont ${kg(pm.kg)} en main` : ''}">
        <line x1="${x - CG}" y1="${yb - 20}" x2="${x}" y2="${yb - 20}" stroke="#555047" stroke-width="3"/>
        <rect x="${x}" y="${y}" width="${CW}" height="${h}" rx="8" fill="#2a2d31" stroke="${trop ? 'var(--rouge)' : '#1a1915'}" stroke-width="${trop ? 3 : 1.5}" data-pe-cadre="${n}"/>
        <text x="${x + CW / 2}" y="${y + 16}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#c9c3b8" letter-spacing=".08em" ${TXT}>CHARGE N${n}</text>
        <rect x="${x + 8}" y="${y + 23}" width="${CW - 16}" height="34" rx="3" fill="#141a12"/>
        <text x="${x + 13}" y="${y + 33}" font-size="9" fill="#a39c8e" class="pe-mono">kg</text>
        <text x="${x + CW - 13}" y="${y + 50}" text-anchor="end" font-size="21" font-weight="700" fill="${lum}" class="pe-mono" data-pe-deja="${n}">${nb(v)}</text>
        <text x="${x + CW / 2}" y="${y + 71}" text-anchor="middle" font-size="10" fill="#c9c3b8" class="pe-mono">MAX ${nb(max)} kg</text>
        <text x="${x + CW / 2}" y="${y + 85}" text-anchor="middle" font-size="10" font-weight="700" fill="${trop ? lum : '#a39c8e'}" ${TXT} data-pe-bas="${n}">${bas}</text></g>`;
    };
    let s = `<defs><pattern id="peHachF" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="var(--pe-litige)"/><line x1="0" y1="0" x2="0" y2="10" stroke="var(--pe-hachure)" stroke-width="4"/></pattern></defs>`;
    s += `<rect x="0" y="${base + 6}" width="${WF}" height="30" fill="var(--pe-sol)"/>`;
    // les travées voisines, vues depuis l'allée
    const gau = g.regard === 'ouest' ? d.t - 1 : d.t + 1, dro = g.regard === 'ouest' ? d.t + 1 : d.t - 1, ym = Y(2);
    const voisin = (t, x, rot) => (t >= 1 && t <= M.T ? `<text x="${x}" y="${ym}" text-anchor="middle" font-size="13" fill="var(--encre-douce)" ${TXT} transform="rotate(${rot} ${x} ${ym})">${rot < 0 ? '← ' : ''}T${pad2(t)}${rot > 0 ? ' →' : ''}</text>` : '');
    s += voisin(gau, 14, -90) + voisin(dro, WF - 14, 90);
    for (let n = 1; n <= M.N; n++) {
      const yb = Y(n), total = M.chargeNiveau(e.place, { c: d.c, t: d.t, n }, null);
      for (let k = 1; k <= M.E; k++) {
        const a = adresse(d.c, d.t, n, k), p = M.occupant(e.place, a), hs = M.hs.has(a), x = XG + (k - 1) * PW;
        const st = PREP && (e.vides || []).includes(a) ? null : M.stock[a];
        const lib = st ? (PREP ? `${court(st.produit)}, ${n === 1 ? `picking, ${pickDe(e, a)} cartons` : 'réserve'}` : `${court(st.produit)}, ${kg(st.kg)}`)
          : p ? `votre palette ${p}, ${kg(M.pal[p].kg)}` : hs ? 'hors service' : 'libre';
        // La visite met en avant l'emplacement trouvé, et lui seul, en vert : il dit « juste » (l'accent de
        // l'entreprise peut être rouge, comme chez Smoby).
        const marque = ui.marque === a;
        s += `<g class="pe-emp${marque ? ' pe-marque' : ''}" data-pe-emp="${a}" data-pe-cle="emp:${a}" tabindex="0" role="button" aria-label="${a} : ${ech(lib)}">
          <rect class="pe-cible" x="${x + 3}" y="${yb - 116}" width="${PW - 6}" height="112" rx="3" fill="${hs ? 'url(#peHachF)' : marque ? 'var(--vert-pale)' : 'transparent'}" stroke="${marque ? 'var(--vert)' : 'transparent'}" stroke-width="${marque ? 4 : 0}"/>`;
        const contenuPrep = PREP ? empPrep(e, a, n, x, yb, PW) : null;
        if (contenuPrep) s += contenuPrep;
        else if (st || p) {
          s += `<rect x="${x + 14}" y="${yb - 92}" width="${PW - 28}" height="78" fill="${p ? 'var(--pe-carton)' : 'var(--pe-gris)'}" stroke="${p ? 'var(--pe-carton-trait)' : 'var(--pe-gris-trait)'}" stroke-width="${p ? 2.5 : 1}"/>
            <rect x="${x + 14}" y="${yb - 14}" width="${PW - 28}" height="11" fill="#a87b45"/>
            <text x="${x + PW / 2}" y="${yb - 58}" text-anchor="middle" font-size="13" font-weight="${p ? 800 : 600}" fill="${p ? '#1a1915' : 'var(--pe-sur-gris)'}" ${TXT}>${ech(p || court(st.produit))}</text>
            <text x="${x + PW / 2}" y="${yb - 38}" text-anchor="middle" font-size="15" font-weight="800" fill="${p ? '#1a1915' : 'var(--pe-sur-gris)'}" ${TXT}>${kg(p ? M.pal[p].kg : st.kg)}</text>`;
        } else if (hs) {
          s += `<text x="${x + PW / 2}" y="${yb - 56}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--rouge)" ${TXT}>HORS SERVICE</text>`;
        } else {
          s += `<text x="${x + PW / 2}" y="${yb - 52}" text-anchor="middle" font-size="13" fill="var(--encre-douce)" ${TXT}>libre</text>`;
        }
        s += `<text x="${x + PW / 2}" y="${yb - 100}" text-anchor="middle" class="pe-mono" font-size="13" font-weight="700" fill="var(--encre-douce)">E${k}</text></g>`;
      }
      if (n > 1) s += `<rect x="${XG}" y="${yb}" width="${M.E * PW}" height="12" fill="var(--pe-lisse)"/>`;
      // étiquette du niveau, plaque de charge, et le capteur (voir plus haut). Au sol, ni plaque ni capteur : pas de limite.
      const py = n === 1 ? yb + 8 : yb - 2, xr = XG + M.E * PW;
      s += `<rect x="${XG + 4}" y="${py}" width="132" height="18" rx="2" fill="var(--panneau)" stroke="var(--encre-douce)"/><text x="${XG + 70}" y="${py + 14}" text-anchor="middle" class="pe-mono" font-size="12" font-weight="800" fill="var(--encre)">${ech(d.c)}-T${pad2(d.t)}-N${n}</text>`;
      if (!PREP && n > 1) s += `<rect x="${xr - 168}" y="${py}" width="164" height="18" rx="2" fill="var(--pe-plaque)" data-pe-plaque="${n}"/><text x="${xr - 86}" y="${py + 14}" text-anchor="middle" class="pe-mono" font-size="12" font-weight="800" fill="#1a1915">max ${kg(c.charge[n])} / niveau</text>`;
      if (aide && n > 1) s += capteur(n, yb, xr + 6 + CG, total, c.charge[n]);
      s += `<text x="${XG - 6}" y="${yb - 52}" text-anchor="end" font-size="13" font-weight="800" fill="var(--encre-douce)" ${TXT}>N${n}</text>`;
    }
    for (const x of [XG, XG + M.E * PW]) s += `<rect x="${x - 6}" y="${Y(M.N) - 120}" width="12" height="${base - Y(M.N) + 128}" fill="var(--pe-montant)"/>`;
    const anim = ui.anim; ui.anim = false;
    return `<div class="pe-releve${anim ? ' pe-anim' : ''}"><svg class="pe-svg-face" viewBox="0 0 ${WF} ${HF}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Travée ${ui.trav} vue de face">${s}</svg></div>`;
  }
  function htmlEntete(e, R) {
    const c = M.cotes[ui.trav.split('-')[0]];
    const fil = `Plan › <b>Travée</b> <span class="pe-mono">${ech(ui.trav)}</span> <span class="pe-petit">(vue depuis l'allée ${ech(c.allee)}${c.note ? `, ${ech(c.note)}` : ''})</span>`;
    const aide = R.aideCharge && !R.fige ? `<label class="pe-case-aide"><input type="checkbox" data-pe="aideCharge" data-pe-cle="b:aideCharge" ${e.aideCharge !== false ? 'checked' : ''}> capteur de charge</label>` : '';
    return `<div class="pe-entete"><div class="pe-fil">${fil}</div>
      <div class="pe-msg-vue"><div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pe-msg>${ui.msg}</div></div>
      ${aide}<button type="button" class="btn btn-p pe-retour" data-pe="retour" data-pe-cle="b:retour">← Retour au plan</button></div>${htmlCalcul(e, R)}`;
  }
  // Guidage : le calcul de charge est fait pour l'élève, niveau par niveau (le sol n'a pas de limite) ;
  // il lui reste à comparer chaque total à la plaque. Suit la case « capteur de charge ».
  function htmlCalcul(e, R) {
    if (!R.g || !R.aideCharge || R.fige || e.aideCharge === false || !ui.main || !ui.trav) return '';
    const p = M.pal[ui.main], d = decoupe(`${ui.trav}-N1-E1`);
    const L = [];
    for (let n = M.N; n >= 2; n--) {
      const deja = M.chargeNiveau(e.place, { c: d.c, t: d.t, n }, p.id);
      L.push(`<span data-pe-calc="${n}"><b>N${n}</b> : ${nb(deja)} + ${nb(p.kg)} = <b>${kg(deja + p.kg)}</b></span>`);
    }
    L.push('<span><b>N1</b> (sol) : pas de limite</span>');
    return `<div class="pe-calcul" data-pe-calcul>Si vous posez <b>${ech(p.id)}</b> (${kg(p.kg)}) dans cette travée : ${L.join('<span class="pe-sep"> · </span>')}</div>`;
  }

  /* ================================================== PRÉPARATION : la vue */
  const virg = (x, d = 2) => Number(x).toFixed(d).replace('.', ',');
  const reserve = `N2${M.N > 2 ? `-N${M.N}` : ''}`;
  const ordreLignes = (R) => (R.g ? M.lignes.map((_, i) => i) : M.desordre);
  const pickDe = (e, a) => (a in (e.pick || {}) ? e.pick[a] : M.pick0(a));
  const prochaine = (R, X) => ordreLignes(R).map((i) => M.lignes[i]).find((l) => X.prelev(l) < l.q) || null;
  const travDe = (a) => { const d = decoupe(a); return `${d.c}-T${pad2(d.t)}`; };
  const quaiLib = (q) => String(q || '').replace(/^QUAI\s*/i, 'quai n° ');

  function consignePrep(e, R) {
    const n = (k, txt) => `<span class="pe-num">${k}</span>${txt}`;
    if (R.fige) return n('✓', 'Copie rendue. Le résultat sera donné par votre enseignant.');
    if (e.fin) {
      if (e.verifie) return n('✓', 'Lisez votre bilan. <b>Reprendre la préparation</b> pour corriger.');
      return n(4, `Filmez et étiquetez la palette, puis cliquez <b>${R.eval ? 'Rendre mon travail' : 'Vérifier ma préparation'}</b>.`);
    }
    if (ui.reappro) return n('↻', `Réapprovisionnement : cliquez une palette de <b>réserve</b> (${reserve}) de la même référence.`);
    if (R.eval && !e.parcours) return n(1, 'Choisissez votre <b>parcours</b> (en haut à droite).');
    if (ui.empl) return n(3, 'Saisissez le nombre de cartons à prélever, puis cliquez <b>Prélever</b>.');
    const X = calculPrep(M, e), s = prochaine(R, X);
    if (!s) return n('✓', 'Toutes les lignes sont prélevées. Cliquez <b>Terminer la préparation</b> (en haut).');
    if (!ui.trav || ui.voir) {
      if (R.g) return n(1, `Ligne ${ordreLignes(R).indexOf(M.lignes.indexOf(s)) + 1} : cliquez la travée <b>${ech(travDe(s.a))}</b> sur le plan.`);
      return n(1, 'Choisissez la ligne suivante du bon et cliquez sa <b>travée</b> sur le plan.');
    }
    return n(2, 'Cliquez l’emplacement de <b>picking</b> (niveau N1) de la ligne.');
  }

  // Le bandeau : le personnage, le bon de préparation (une carte par ligne), les boutons.
  function htmlBandeauPrep(e, R) {
    const per = P.personnage || {}, C = M.C, X = calculPrep(M, e);
    const ici = R.g && !e.fin ? prochaine(R, X) : null;
    const cartes = ordreLignes(R).map((i, j) => {
      const l = M.lignes[i], pr = X.prelev(l), cl = M.classe(l.produit), p = M.produits[l.produit];
      return `<div class="pe-ligne${ici === l ? ' pe-ici' : ''}" data-pe-ligne="${i}" title="${ech(`${p.nom} · ${String(p.carton.kg).replace('.', ',')} kg le carton`)}">
        <span class="pe-ttl"><span class="pe-pid">${j + 1}</span><span class="pe-mono">${ech(l.a)}</span></span>
        <span class="pe-des">${ech(court(l.produit))}${cl === 'lourd' ? ' <span class="pe-tag">LOURD</span>' : ''}${cl === 'fragile' ? ' <span class="pe-tag pe-fragile">FRAGILE</span>' : ''}</span>
        <span>cde <b class="pe-mono">${l.q}</b> · prél. <b class="pe-mono" data-pe-prel="${i}">${pr || '…'}</b></span></div>`;
    }).join('');
    const verrou = e.faits.length || R.fige ? 'disabled' : '';
    const choix = R.eval ? `<fieldset class="pe-choix"><legend>Mon parcours</legend>
        <label title="On monte la première allée, on traverse en haut, on redescend la suivante."><input type="radio" name="peParcours" value="serpentin" data-pe-cle="b:serpentin" ${e.parcours === 'serpentin' ? 'checked' : ''} ${verrou}> <b>Serpentin</b></label>
        <label title="On entre dans chaque allée par l’allée principale et on ressort par le même bout."><input type="radio" name="peParcours" value="retour" data-pe-cle="b:retour-parcours" ${e.parcours === 'retour' ? 'checked' : ''} ${verrou}> <b>Retour</b></label></fieldset>` : '';
    const actif = e.faits.length && !e.fin && !R.fige ? '' : 'disabled';
    const RG = P.regles;
    const regles = R.regles && RG ? `<details class="pe-regles" data-pe-regles ${ui.regles ? 'open' : ''}><summary data-pe-cle="b:regles">${ech(RG.titre || 'Les règles')} ▾</summary>
      <div class="pe-regles-corps"><b>${ech(RG.entete || 'Les règles de la préparation')}</b><ol>${(RG.lignes || []).map((l) => `<li>${l}</li>`).join('')}</ol>
      ${RG.encadre ? `<div class="pe-encadre">${RG.encadre}</div>` : ''}</div></details>` : '';
    return `<div class="pe-bandeau pe-bandeau-prep">
      <div class="pe-perso"><b>${ech([per.nom, per.role].filter(Boolean).join(', '))}${per.date ? ` · ${ech(per.date)}` : ''}</b>${(per.texte || {})[R.t] || ''}</div>
      <div class="pe-liste"><h3 class="pe-bon">Bon de préparation <b class="pe-mono">${ech(C.num || '')}</b> · ${ech(C.client || '')} · enlèvement ${ech(C.enlevement || '')} · ${ech(C.transporteur || '')}, <span data-pe-heure>${ech(C.heure || '')}</span>${C.quai ? ` · ${ech(quaiLib(C.quai))}` : ''}</h3>
        <div class="pe-cartes">${cartes}</div></div>
      <div class="pe-act">${choix}
        <button type="button" class="btn btn-p" data-pe="terminer" data-pe-cle="b:terminer" ${actif}>Terminer la préparation</button>
        <button type="button" class="btn" data-pe="reposer" data-pe-cle="b:reposer" ${actif}>↶ Reposer le dernier</button>${regles}</div></div>`;
  }

  // La colonne de côté : picking / réserve, le compteur de mètres, ce qui est hors commande.
  function htmlCotePrep(e, R, api) {
    const X = calculPrep(M, e);
    let h = '';
    if (!vueOuverte(e, R)) {
      h += `<div class="pe-msg-cote pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pe-msg-plan>${ui.msg}</div>`;
      h += '<div class="pe-astuce">Cliquez une <b>travée</b> sur le plan : elle s’ouvre en grand, vue de face.</div>';
    }
    const mode = e.parcours || (R.eval ? null : 'serpentin');
    h += `<div class="pe-metres" data-pe-metres><span class="pe-t">N1 = picking · ${reserve} = réserve</span>
      <span>Parcours ${mode ? `<b>${mode}</b>` : 'à choisir'} : <b class="pe-mono" data-pe-m>${Math.round(X.metres)} m</b>${X.tours > 1 ? ` <b class="${R.eval ? '' : 'pe-ko'}" data-pe-tours>· ${X.tours} tours</b>` : ''}</span>
      <span class="pe-petit">(retour au quai compris)</span></div>`;
    if (X.horsCommande.length) h += `<div class="pe-hors">Aussi sur la palette : ${X.horsCommande.map((x) => `<span class="pe-mono">${ech(x.a)}</span> × ${x.q}`).join(', ')}</div>`;
    h += `<div class="pe-implant"><span class="pe-t">Implantation :</span>${M.ordre.map((c) => `<span><b>${ech(c)}</b> ${ech(M.cotes[c].gammes.map(M.nomGamme).join(' + '))}</span>`).join('')}</div>`;
    h += `<div class="pe-legende"><span><i class="pe-puce pe-p-stock"></i>occupé</span><span><i class="pe-puce pe-p-hs"></i>hors service</span><span><i class="pe-puce"></i>libre</span></div>`;
    if (api.estProf) {
      const A = attendusPreparation(P);
      h += `<details class="pe-prof"><summary>Côté enseignant : attendus</summary>
        <div>Meilleur tour : serpentin <b>${Math.round(A.serpentin)} m</b>, retour <b>${Math.round(A.retour)} m</b></div>
        <div>Liste dans le désordre suivie en serpentin : ${Math.round(A.desordre.metres)} m (${A.desordre.tours} tours)</div>
        <div>Palette dans l’ordre du bon : ${A.poids} kg, ${virg(A.hauteur)} m</div>
        ${M.ruptures.length ? `<div>Rupture : <span class="pe-mono">${M.ruptures.map(ech).join(', ')}</span></div>` : ''}</details>`;
    }
    return `<aside class="pe-cote">${h}</aside>`;
  }

  // Sur le plan : le tracé du tour de l'élève, les numéros des lignes (guidage), la zone d'expédition.
  function versSvg([xm, ym]) {
    const m = M.metres, xsM = M.allees.map((_, i) => i * m.entreAllees), xsS = M.allees.map((al) => G.allees[al.id].cx);
    const pxT = TH / m.travee;
    let x;
    if (xsM.length < 2 || xm <= xsM[0]) x = xsS[0] + (xm - xsM[0]) * pxT;
    else if (xm >= xsM[xsM.length - 1]) x = xsS[xsS.length - 1] + (xm - xsM[xsM.length - 1]) * pxT;
    else {
      const i = xsM.findIndex((v, k) => xm >= v && xm <= xsM[k + 1]);
      x = xsS[i] + (xm - xsM[i]) / (xsM[i + 1] - xsM[i]) * (xsS[i + 1] - xsS[i]);
    }
    const yPrC = G.yPr + 27, racks = m.avant + M.T * m.travee;
    let y;
    if (ym <= m.avant) y = yPrC + (G.yBas - yPrC) * (m.avant ? ym / m.avant : 1);
    else if (ym <= racks) y = G.yBas - (ym - m.avant) / m.travee * TH;
    else y = Y0 + (29 - Y0) * (m.arriere ? (ym - racks) / m.arriere : 1);
    return [x, y];
  }
  function htmlPlanPrep(e, R) {
    const X = calculPrep(M, e);
    let s = '';
    if (X.trace.length) {
      const pts = X.trace.map(versSvg).map((p) => p.map((v) => v.toFixed(0)).join(',')).join(' ');
      s += `<g transform="translate(7,-7)" pointer-events="none" data-pe-trace><polyline points="${pts}" fill="none" stroke="var(--terre)" stroke-width="5" stroke-linejoin="round" opacity=".85"/>`;
      X.faits.forEach((f) => { const [x, y] = versSvg(M.point(f.a)); s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="6" fill="var(--terre)"/>`; });
      s += '</g>';
    }
    if (R.g) {
      const vus = {};
      M.lignes.forEach((l, i) => {
        const d = decoupe(l.a), g = G.racks[d.c], cle = `${d.c}${d.t}`, j = vus[cle] = (vus[cle] == null ? -1 : vus[cle]) + 1;
        const cx = j === 0 ? g.x + RW - 11 : g.x + 11, cy = G.yTrav(d.t) + 19, fait = X.prelev(l) === l.q;
        s += `<g pointer-events="none" data-pe-numero="${i + 1}"><circle cx="${cx}" cy="${cy}" r="10" fill="${fait ? 'var(--panneau)' : 'var(--pe-plaque)'}" stroke="${fait ? 'var(--ardoise)' : 'var(--encre)'}" stroke-width="${fait ? 2 : 1.2}"/>
          <text x="${cx}" y="${cy + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${fait ? 'var(--ardoise)' : '#1a1915'}" ${TXT}>${fait ? '✓' : i + 1}</text></g>`;
      });
    }
    // la zone d'expédition et la palette de commande (cliquable)
    const hR = 112, yR = G.yPr - 6 - hR, ZX = G.ZX, nb = X.faits.reduce((t, f) => t + f.q, 0);
    s += `<rect x="${ZX}" y="${yR}" width="${ZW}" height="${hR}" fill="none" stroke="var(--pe-jaune-sol)" stroke-width="3" stroke-dasharray="12 6"/>
      <text x="${ZX + 10}" y="${yR + 20}" font-size="13" font-weight="800" fill="var(--encre)" ${TXT}>ZONE D’EXPÉDITION</text>
      <g class="pe-palq" data-pe-voir data-pe-cle="voir:plan" tabindex="0" role="button" aria-label="Palette de commande, ${nb} cartons">
        <rect x="${ZX + 16}" y="${yR + 30}" width="${ZW - 32}" height="70" rx="3" fill="var(--pe-carton)" stroke="var(--pe-carton-trait)" stroke-width="2"/>
        <text x="${ZX + ZW / 2}" y="${yR + 58}" text-anchor="middle" font-size="15" font-weight="800" fill="#1a1915" ${TXT}>Palette de commande</text>
        <text x="${ZX + ZW / 2}" y="${yR + 82}" text-anchor="middle" font-size="14" font-weight="700" fill="#1a1915" ${TXT}>${nb} carton${nb > 1 ? 's' : ''} · ${kg(X.poids)}</text></g>`;
    return s;
  }

  // Le contenu d'un emplacement dans la vue de face : N1 = picking (cartons, minimum), au-dessus = réserve.
  function empPrep(e, a, n, x, yb, PW) {
    const st = (e.vides || []).includes(a) ? null : M.stock[a];
    if (!st) return null;
    if (n === 1) {
      const q = pickDe(e, a), mn = M.minPick(a), bas = q < mn;
      return `<rect x="${x + 14}" y="${yb - 92}" width="${PW - 28}" height="78" fill="var(--pe-carton)" stroke="var(--pe-carton-trait)" stroke-width="1.5"/>
        <rect x="${x + 14}" y="${yb - 14}" width="${PW - 28}" height="11" fill="#a87b45"/>
        <text x="${x + PW / 2}" y="${yb - 70}" text-anchor="middle" font-size="13" font-weight="800" fill="#1a1915" ${TXT}>${ech(court(st.produit))}</text>
        <rect x="${x + 26}" y="${yb - 62}" width="${PW - 52}" height="40" rx="2" fill="#fbfaf6" stroke="${bas ? 'var(--rouge)' : '#8a8478'}" stroke-width="${bas ? 2.5 : 1}" data-pe-bas="${bas}"/>
        <text x="${x + PW / 2}" y="${yb - 45}" text-anchor="middle" font-size="14" font-weight="800" fill="${bas ? '#9d2727' : '#1a1915'}" ${TXT} data-pe-q="${a}">${q} ctn</text>
        <text x="${x + PW / 2}" y="${yb - 28}" text-anchor="middle" font-size="12" font-weight="600" fill="${bas ? '#9d2727' : '#555047'}" ${TXT}>min ${mn}</text>`;
    }
    return `<rect x="${x + 14}" y="${yb - 92}" width="${PW - 28}" height="78" fill="var(--pe-gris)" stroke="var(--pe-gris-trait)" stroke-width="1"/>
      <rect x="${x + 14}" y="${yb - 14}" width="${PW - 28}" height="11" fill="#a87b45"/>
      <text x="${x + PW / 2}" y="${yb - 58}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--pe-sur-gris)" ${TXT}>${ech(court(st.produit))}</text>
      <text x="${x + PW / 2}" y="${yb - 38}" text-anchor="middle" font-size="12" fill="var(--pe-sur-gris)" ${TXT}>réserve</text>`;
  }

  // Une palette de cartons en perspective (fiche de prélèvement) : couches du dessous complètes, les
  // cartons manquants sur la couche du dessus, ceux en trop posés dessus. Repris de la maquette (`pile`).
  function pile([W, D, L], ecart) {
    const cubes = [];
    for (let z = 0; z < L; z++) for (let x = 0; x < W; x++) for (let y = 0; y < D; y++) cubes.push([x, y, z]);
    if (ecart < 0) {
      const hautC = [...cubes].sort((p, q) => (q[2] - p[2]) || ((p[0] + p[1]) - (q[0] + q[1]))).slice(0, -ecart);
      hautC.forEach((h) => cubes.splice(cubes.indexOf(h), 1));
    }
    if (ecart > 0) for (let i = 0; i < ecart; i++) cubes.push([W - 1 - i % W, D - 1 - Math.floor(i / W) % D, L + Math.floor(i / (W * D))]);
    const a = 30, k = 0.87, bh = 0.8;
    const Pj = (x, y, z) => [(x - y) * a * k, (x + y) * a * 0.5 - z * bh * a];
    const poly = (pts) => pts.map((q) => Pj(...q).map((v) => v.toFixed(1)).join(',')).join(' ');
    const b = -0.22 / bh, trait = '#6e4a22';
    let s = `<polygon points="${poly([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]])}" fill="#b98b55"/>`;
    s += `<polygon points="${poly([[W, 0, b], [W, D, b], [W, D, 0], [W, 0, 0]])}" fill="#8f6532"/><polygon points="${poly([[0, D, b], [W, D, b], [W, D, 0], [0, D, 0]])}" fill="#a87b45"/>`;
    cubes.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]) || p[2] - q[2]);
    for (const [x, y, z] of cubes) {
      s += `<polygon points="${poly([[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]])}" fill="#e6c48f" stroke="${trait}" stroke-width="1.1" stroke-linejoin="round"/>`;
      s += `<polygon points="${poly([[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]])}" fill="#b98a50" stroke="${trait}" stroke-width="1.1" stroke-linejoin="round"/>`;
      s += `<polygon points="${poly([[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]])}" fill="#d0a066" stroke="${trait}" stroke-width="1.1" stroke-linejoin="round"/>`;
      s += `<polygon points="${poly([[x + 0.44, y, z + 1], [x + 0.56, y, z + 1], [x + 0.56, y + 1, z + 1], [x + 0.44, y + 1, z + 1]])}" fill="#c9a571" opacity=".9"/>`;
      s += `<polygon points="${poly([[x + 0.12, y + 1, z + 0.22], [x + 0.38, y + 1, z + 0.22], [x + 0.38, y + 1, z + 0.5], [x + 0.12, y + 1, z + 0.5]])}" fill="#fbfaf6" stroke="#9a8f80" stroke-width=".5"/>`;
    }
    const Lh = L + Math.max(1, Math.ceil(Math.max(0, ecart) / (W * D)));
    const xs = [Pj(0, D, 0)[0], Pj(W, 0, 0)[0]], ys = [Pj(0, 0, Lh)[1], Pj(W, D, b)[1]], mg = 12;
    return `<svg viewBox="${(xs[0] - mg).toFixed(1)} ${(ys[0] - mg).toFixed(1)} ${(xs[1] - xs[0] + 2 * mg).toFixed(1)} ${(ys[1] - ys[0] + 2 * mg).toFixed(1)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Les cartons du picking">${s}</svg>`;
  }

  // La fiche de prélèvement d'un emplacement de picking.
  function htmlFiche(e, R) {
    const a = ui.empl, st = M.stock[a], p = M.produits[st.produit], c = p.carton, cl = M.classe(st.produit);
    const q = pickDe(e, a), mn = M.minPick(a), bas = q < mn;
    const X = calculPrep(M, e), l = M.lignes.find((x) => x.a === a), reste = l ? l.q - X.prelev(l) : 0;
    let aide = '';
    if (R.g) {
      if (!l) aide = 'Cette adresse n’est pas sur le bon de préparation.';
      else if (reste <= 0) aide = 'Cette ligne est déjà prélevée.';
      else if (q < reste) aide = `Il faut <b>${reste}</b> cartons et il n’en reste que <b>${q}</b> : le picking est sous son minimum. Cliquez <b>↻ Descente de la réserve</b> : une palette de la même référence est stockée au-dessus, en réserve.`;
      else aide = `Ligne du bon : prélevez <b>${reste}</b> carton${reste > 1 ? 's' : ''}.`;
    }
    return `<div class="pe-fiche" data-pe-fiche="${ech(a)}">
      <div class="pe-etiq"><span class="pe-mono">${ech(p.ref || '')}</span><span>${ech(p.nom)}</span><span class="pe-mono">${ech(a)}</span></div>
      <div class="pe-pick${bas ? ' pe-bas' : ''}" data-pe-pick>Picking : <b>${q} carton${q > 1 ? 's' : ''}</b> · minimum ${mn}${bas ? ' — <b>sous le minimum</b>' : ''}
        <span class="pe-petit">· ${String(c.kg).replace('.', ',')} kg le carton${cl === 'lourd' ? ' · <b>lourd</b>' : ''}${cl === 'fragile' ? ' · <b>fragile</b>' : ''}</span></div>
      <div class="pe-fiche-corps"><div class="pe-fiche-g">
        ${aide ? `<div class="pe-aide" data-pe-aide>${aide}</div>` : ''}
        <div class="pe-saisie"><label for="peNb"><b>Cartons à prélever</b></label>
          <input id="peNb" type="number" min="1" inputmode="numeric" value="${ech(ui.nb)}" data-pe-nb data-pe-cle="b:nb">
          <button type="button" class="btn btn-p" data-pe="prelever" data-pe-cle="b:prelever">Prélever</button></div>
        <div><button type="button" class="btn" data-pe="reappro" data-pe-cle="b:reappro">↻ Descente de la réserve</button></div></div>
        <div class="pe-pile">${pile(p.couches, q - M.plein(a))}</div></div></div>`;
  }

  // La palette de commande, vue de face, montée dans l'ordre du prélèvement.
  function dessinPalette(e, X) {
    const C = M.C, K = 200, W = 220, X0 = 16, hv = Math.max(X.hauteur, C.hMax) + 0.14, H = hv * K + 30, Yb = H - 18;
    const hp = M.support.h * K;
    let s = `<rect x="0" y="${Yb}" width="460" height="18" fill="var(--pe-sol)"/>`;
    s += `<rect x="${X0}" y="${Yb - hp}" width="${W}" height="8" fill="#b98b55"/>`;
    [0, 0.45, 0.9].forEach((f) => { s += `<rect x="${X0 + f * W}" y="${Yb - hp + 8}" width="${W * 0.1}" height="${Math.max(0, hp - 8)}" fill="#8f6532"/>`; });
    let y = Yb - hp;
    if (!X.couches.length) s += `<text x="${X0 + W / 2}" y="${Yb - hp - 30}" text-anchor="middle" font-size="14" fill="var(--encre-douce)" ${TXT}>Palette vide : prélevez la première ligne.</text>`;
    X.couches.forEach((f, i) => {
      const c = M.produits[f.k].carton, cl = M.classe(f.k), n = Math.ceil(f.q / c.parCouche), bh = c.h * K, bw = W / c.parCouche;
      for (let k = 0; k < n; k++) {
        const dans = Math.min(c.parCouche, f.q - k * c.parCouche);
        for (let j = 0; j < dans; j++) s += `<rect x="${(X0 + j * bw + 1).toFixed(1)}" y="${(y - bh * (k + 1) + 1).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${(bh - 2).toFixed(1)}" fill="${cl === 'fragile' ? '#f2dcb8' : cl === 'lourd' ? '#b07c40' : '#d4a46a'}" stroke="#6e4a22" stroke-width="1.2"/>`;
      }
      const top = y - bh * n, ym = (y + top) / 2;
      if (cl === 'fragile') s += `<text x="${X0 + W / 2}" y="${ym + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#9d2727" ${TXT}>FRAGILE</text>`;
      s += `<line x1="${X0 + W + 2}" y1="${ym}" x2="${X0 + W + 12}" y2="${ym}" stroke="var(--encre-douce)"/>
        <text x="${X0 + W + 16}" y="${ym + 5}" font-size="15" font-weight="700" fill="var(--encre)" ${TXT}>${i + 1}. ${ech(court(f.k))} × ${f.q} <tspan font-weight="400" fill="var(--encre-douce)">(${Math.round(f.q * c.kg)} kg${cl === 'lourd' ? ', lourd' : ''})</tspan></text>`;
      y = top;
    });
    if (e.film) s += `<rect x="${X0 - 3}" y="${y - 2}" width="${W + 6}" height="${Yb - hp - y + 10}" fill="rgba(150,190,230,.22)" stroke="rgba(120,160,210,.8)" stroke-width="1.5" data-pe-filme/>`;
    if ((e.etiq || {}).avant && X.couches.length) s += `<rect x="${X0 + W - 58}" y="${(y + Yb - hp) / 2 - 14}" width="50" height="28" fill="#fbfaf6" stroke="#555"/><text x="${X0 + W - 33}" y="${(y + Yb - hp) / 2 + 4}" text-anchor="middle" font-size="9" font-weight="800" fill="#1a1915" ${TXT}>${ech(C.etiquette || C.enlevement || '')}</text>`;
    if ((e.etiq || {}).dessus && X.couches.length) s += `<rect x="${X0 + W / 2 - 22}" y="${y - 6}" width="44" height="6" fill="#fbfaf6" stroke="#555"/>`;
    const yMax = Yb - C.hMax * K;
    s += `<line x1="${X0 - 10}" y1="${yMax}" x2="${X0 + W + 10}" y2="${yMax}" stroke="var(--rouge)" stroke-width="2" stroke-dasharray="7 5"/>
      <text x="${X0 + W + 16}" y="${yMax + 5}" font-size="14" font-weight="800" fill="var(--rouge)" ${TXT}>${virg(C.hMax)} m max${C.transporteur ? ` (${ech(C.transporteur)})` : ''}</text>`;
    return `<svg viewBox="0 0 460 ${H.toFixed(0)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Palette de commande vue de face">${s}</svg>`;
  }

  // Le bilan, selon le temps (§8) : expliqué en guidage, nom du critère en entraînement, chiffres et
  // global en évaluation (après la copie rendue, pour l'enseignant). « Que », jamais « de combien ».
  function htmlBilan(e, R, X) {
    const best = meilleurTour(M, R.t), L = X.metres;
    const plus = L > best + 0.5 ? Math.round((L - best) / best * 100) : 0;
    const nbL = M.lignes.length + X.horsCommande.length, err = nbL - X.justes, taux = Math.round(err / nbL * 100);
    let h = `<div class="pe-bilan" data-pe-bilan><h3>Indicateurs</h3>
      <div data-pe-bilan-m>Mètres parcourus : <b class="pe-gros">${Math.round(L)} m</b>${X.mode === 'serpentin' && X.tours > 1 ? ` (<b>${X.tours} tours</b> au lieu d’un)` : ''} · meilleur tour ${R.eval ? 'possible' : 'en serpentin'} : ${Math.round(best)} m
        ${plus ? `<span class="pe-ko">(+${plus} %)</span>` : '<span class="pe-ok">✓</span>'}</div>`;
    if (R.g && plus) h += '<div>En sens unique, revenir en arrière oblige à refaire un tour complet : suivez la liste dans l’ordre du parcours.</div>';
    h += `<div data-pe-bilan-l>Lignes justes : <b class="pe-gros">${X.justes}/${M.lignes.length}</b> · taux d’erreur : <b>${taux} %</b>${X.horsCommande.length ? ` (${X.horsCommande.length} ligne${X.horsCommande.length > 1 ? 's' : ''} hors commande)` : ''}</div>`;
    if (!R.eval) {
      M.lignes.forEach((l) => {
        const pr = X.prelev(l);
        if (pr === l.q) return;
        if (R.entr) { h += `<div class="pe-ko">✗ ${ech(l.a)} : quantité</div>`; return; }
        const rupture = M.ruptures.includes(l.a) && !(e.reappros || []).some((r) => r.pour === l.a);
        h += `<div class="pe-ko">✗ ${ech(l.a)} ${ech(M.produits[l.produit].nom)} : ${pr} prélevé${pr > 1 ? 's' : ''} sur ${l.q}${rupture ? ' — picking en rupture : il fallait demander la descente de la réserve' : ''}</div>`;
      });
      X.horsCommande.forEach((x) => { h += `<div class="pe-ko">✗ ${ech(x.a)}${R.g ? ` ${ech(M.produits[x.k].nom)} : ${x.q} carton(s) qui ne sont pas sur le bon` : ' : hors commande'}</div>`; });
    }
    const nOk = X.regles.filter((r) => r.ok).length;
    h += `<h3>Palette conforme ?</h3><div data-pe-bilan-p>${nOk === X.regles.length ? '<span class="pe-ok">✓ palette conforme</span>' : '<span class="pe-ko">✗ palette non conforme</span>'} · ${nOk}/${X.regles.length} règles</div>`;
    if (!R.eval) h += X.regles.map((r) => `<div class="${r.ok ? 'pe-ok' : 'pe-ko'}" data-pe-regle="${r.id}" data-ok="${r.ok}">${r.ok ? '✓' : '✗'} ${ech(r.crit)}${!r.ok && R.g ? ` : ${ech(r.txt)}` : ''}</div>`).join('');
    return `${h}</div>`;
  }

  function htmlPalette(e, R, api) {
    const C = M.C, X = calculPrep(M, e);
    let fin = '';
    if (e.fin || R.fige) {
      const off = R.fige ? 'disabled' : '';
      let boutons;
      if (R.eval) {
        boutons = R.rendue ? '<button type="button" class="btn" disabled>Copie rendue</button>'
          : ui.confirmer ? `<span class="pe-confirme">Rendre la copie ? Vous ne pourrez plus rien changer.
              <button type="button" class="btn btn-p" data-pe="rendreOui" data-pe-cle="b:rendreOui">Oui, rendre</button>
              <button type="button" class="btn" data-pe="rendreNon" data-pe-cle="b:rendreNon">Non</button></span>`
            : '<button type="button" class="btn btn-p" data-pe="rendre" data-pe-cle="b:rendre">Rendre mon travail</button>';
      } else boutons = '<button type="button" class="btn btn-p" data-pe="verifierPrep" data-pe-cle="b:verifierPrep">Vérifier ma préparation</button>';
      if (!R.fige) boutons += '<button type="button" class="btn" data-pe="reprendre" data-pe-cle="b:reprendre">Reprendre la préparation</button>';
      fin = `<div class="pe-finir"><b>Avant l’enlèvement</b>
        <label>Film étirable : <select data-pe-film data-pe-cle="b:film" ${off}><option value="">— tours —</option>${[1, 2, 3, 4, 5, 6].map((t) => `<option value="${t}" ${String(e.film) === String(t) ? 'selected' : ''}>${t}</option>`).join('')}</select> tours</label>
        <div>Étiquette d’expédition sur :</div>
        <div class="pe-etq">${ETIQUETTES.map(([k, lib]) => `<label><input type="checkbox" data-pe-etiq="${k}" data-pe-cle="etiq:${k}" ${(e.etiq || {})[k] ? 'checked' : ''} ${off}> ${lib}</label>`).join('')}</div>
        <div class="pe-boutons">${boutons}</div></div>
        ${(!R.eval && e.verifie) || (R.eval && R.rendue && api.estProf) ? htmlBilan(e, R, X) : ''}`;
    } else {
      fin = `<div class="pe-finir pe-petit">La palette se monte dans l’ordre du prélèvement. Quand toutes les lignes sont prélevées : <b>Terminer la préparation</b> (en haut).</div>`;
    }
    return `<div class="pe-palcmd"><div class="pe-palcmd-dessin">
        <div class="pe-palcmd-tete"><b>Palette de commande · ${ech(C.client || '')} · ${ech(C.enlevement || '')}</b>
          <span class="pe-petit">Palette Europe 80 × 120, montée dans l’ordre du prélèvement · <b data-pe-kg>${X.poids.toLocaleString('fr-FR')} kg</b> / ${C.kgMax} kg · <b data-pe-h>${virg(X.hauteur)} m</b> / ${virg(C.hMax)} m</span></div>
        <div class="pe-palsvg">${dessinPalette(e, X)}</div></div>
      <div class="pe-palcmd-cote">${fin}</div></div>`;
  }

  // En préparation, une travée ouverte coupe le grand espace en deux : la palette de commande toujours à
  // gauche (elle se monte sous les yeux de l'élève), la travée puis la fiche de prélèvement à droite.
  function htmlPaletteMini(e) {
    const C = M.C, X = calculPrep(M, e);
    return `<div class="pe-palmini" data-pe-palmini>
        <div class="pe-palcmd-tete"><b>Palette de commande</b>
          <span class="pe-petit"><b data-pe-kg>${X.poids.toLocaleString('fr-FR')} kg</b> / ${C.kgMax} kg · <b data-pe-h>${virg(X.hauteur)} m</b> / ${virg(C.hMax)} m</span></div>
        <div class="pe-palsvg">${dessinPalette(e, X)}</div></div>`;
  }

  function htmlEntetePrep(e, R) {
    const palette = ui.voir || e.fin || R.fige;
    const parts = ['Plan'];
    if (palette && !ui.empl) parts.push('<b>Palette de commande</b>');
    else {
      if (ui.trav) {
        const c = M.cotes[ui.trav.split('-')[0]];
        parts.push(ui.empl ? `Travée <span class="pe-mono">${ech(ui.trav)}</span>` : `<b>Travée</b> <span class="pe-mono">${ech(ui.trav)}</span> <span class="pe-petit">(vue depuis l'allée ${ech(c.allee)})</span>`);
      }
      if (ui.empl) parts.push(`<b>Prélèvement</b> <span class="pe-mono">${ech(ui.empl)}</span>`);
    }
    const lib = ui.reappro ? '✕ Annuler le réapprovisionnement' : ui.empl ? '← Retour à la travée' : '← Retour au plan';
    const retour = e.fin || R.fige ? '' : `<button type="button" class="btn btn-p pe-retour" data-pe="retour" data-pe-cle="b:retour">${lib}</button>`;
    return `<div class="pe-entete"><div class="pe-fil">${parts.join(' › ')}</div>
      <div class="pe-msg-vue"><div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pe-msg>${ui.msg}</div></div>
      ${retour}</div>`;
  }

  /* ------------------------------------------------ PRÉPARATION : les gestes */
  function cliquerPrep(e, a, R) {
    if (e.fin) { dire('La préparation est terminée : cliquez <b>Reprendre la préparation</b> pour prélever encore.'); return; }
    const d = decoupe(a), st = (e.vides || []).includes(a) ? null : M.stock[a];
    if (ui.reappro) {
      const cible = ui.reappro, k = M.stock[cible].produit;
      if (d.n === 1) { dire(`La réserve est aux niveaux <b>${reserve}</b>, au-dessus du picking.`, 'non'); return; }
      if (!st) { dire(`<b>${ech(a)}</b> : emplacement vide.`, 'non'); return; }
      if (st.produit !== k) { const p = M.produits[st.produit]; dire(`<b>${ech(a)}</b> : ce n’est pas la même référence (${ech([p.ref, court(st.produit)].filter(Boolean).join(', '))}).`, 'non'); return; }
      e.pick[cible] = pickDe(e, cible) + M.plein(a);
      e.vides.push(a); e.reappros.push({ pour: cible, de: a }); ui.reappro = null; e.verifie = false;
      noterGeste(e);
      dire(`Réapprovisionnement fait : la palette de <b>${ech(a)}</b> est descendue en <b>${ech(cible)}</b> par le cariste (CACES 5). Picking : ${pickDe(e, cible)} cartons.`, 'oui');
      return;
    }
    if (!st) { dire(`<b>${ech(a)}</b> : emplacement vide.`); return; }
    if (d.n > 1) {
      e.essaisReserve.push(a); noterGeste(e);
      dire(`<b>${ech(a)}</b> est une palette de <b>réserve</b> : on prélève au niveau <b>N1</b> (picking).`, 'non');
      return;
    }
    if (R.eval && !e.parcours) { dire('Choisissez d’abord votre parcours (en haut à droite).', 'non'); return; }
    ui.empl = a; ui.nb = ''; ui.focus = 'b:nb'; dire('');
  }
  function prelever(e) {
    const a = ui.empl, v = parseInt(ui.nb, 10), q = pickDe(e, a);
    if (Number.isNaN(v) || v < 1) { dire('Saisissez un nombre de cartons.', 'non'); ui.focus = 'b:nb'; return; }
    if (v > q) { dire(`Il n’y a que <b>${q}</b> carton${q > 1 ? 's' : ''} au picking.`, 'non'); ui.focus = 'b:nb'; return; }
    const k = M.stock[a].produit;
    e.pick[a] = q - v; e.faits.push({ a, k, q: v }); e.verifie = false;
    ui.empl = null; ui.nb = ''; ui.focus = `emp:${a}`;
    noterGeste(e);
    dire(`${v} × ${ech(M.produits[k].nom)} posé${v > 1 ? 's' : ''} sur la palette de commande.`, 'oui');
  }
  function demanderReappro(e) {
    const a = ui.empl;
    if (pickDe(e, a) >= M.minPick(a)) { dire('Le picking n’est pas sous son minimum : pas de réapprovisionnement.', 'non'); return; }
    ui.reappro = a; ui.empl = null; ui.nb = '';
    dire(`↻ Réapprovisionnement de <b>${ech(a)}</b> : cliquez la palette de réserve (${reserve}) de la même référence. Échap pour annuler.`);
  }
  function reposer(e) {
    const f = e.faits.pop();
    if (!f) return;
    e.pick[f.a] = pickDe(e, f.a) + f.q; e.verifie = false;
    dire(`${f.q} × ${ech(M.produits[f.k].nom)} reposé${f.q > 1 ? 's' : ''} en ${ech(f.a)}.`);
  }
  // Retour (bouton, Échap) : on annule le réappro, on referme la fiche, la palette, puis la travée.
  function fermerPrep(e) {
    if (ui.reappro) ui.reappro = null;
    else if (ui.empl) { ui.focus = `emp:${ui.empl}`; ui.empl = null; }
    else if (ui.voir) ui.voir = false;
    else if (ui.trav) { ui.focus = `trav:${ui.trav}`; ui.trav = null; }
    else return false;
    dire('');
    return true;
  }

  function brancherPrep(racine, e, R, on, activer, sauver, redessiner) {
    const fait = () => { sauver(); redessiner(); };
    racine.querySelectorAll('[data-pe-voir]').forEach((g) => activer(g, () => { ui.voir = true; ui.empl = null; ui.reappro = null; dire(''); redessiner(); }));
    const nb = racine.querySelector('[data-pe-nb]');
    if (nb) {
      nb.addEventListener('input', () => { ui.nb = nb.value; });
      nb.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); ui.nb = nb.value; prelever(e); fait(); } });
      // la fiche s'ouvre prête à la saisie (souris comme clavier)
      if (ui.focus === 'b:nb') nb.focus({ preventScroll: true });
    }
    on('prelever', () => { if (nb) ui.nb = nb.value; prelever(e); fait(); });
    on('reappro', () => { demanderReappro(e); fait(); });
    on('reposer', () => { reposer(e); ui.focus = 'b:reposer'; fait(); });
    on('terminer', () => {
      e.fin = true; e.verifie = false; ui.reappro = null; ui.empl = null; ui.voir = false; ui.trav = null; dire('');
      ui.focus = 'b:film'; fait();
    });
    on('reprendre', () => { e.fin = false; e.verifie = false; ui.confirmer = false; dire(''); fait(); });
    on('verifierPrep', () => {
      e.verifie = true; e.verifs = (e.verifs || 0) + 1; ui.focus = 'b:verifierPrep'; fait();
      const bilan = document.querySelector(`[data-entrepot="${CSS.escape(P.id)}"] [data-pe-bilan]`);
      if (bilan) bilan.scrollIntoView({ block: 'nearest' });
    });
    racine.querySelectorAll('input[name="peParcours"]').forEach((i) => i.addEventListener('change', () => {
      if (e.faits.length) return;
      e.parcours = i.value; dire(''); ui.focus = i.dataset.peCle; fait();
    }));
    const film = racine.querySelector('[data-pe-film]');
    if (film) film.addEventListener('change', () => { e.film = film.value; ui.focus = 'b:film'; fait(); });
    racine.querySelectorAll('[data-pe-etiq]').forEach((c) => c.addEventListener('change', () => {
      e.etiq = Object.assign({}, e.etiq, { [c.dataset.peEtiq]: c.checked }); ui.focus = c.dataset.peCle; fait();
    }));
  }

  // La visite prête au mode du second chantier ce que celui-ci a déjà : le plan, la vue de face, l'état
  // d'écran partagé, Échap, le clavier. Ici seulement : toutes les fonctions ci-dessus sont prêtes.
  if (M.mode === 'visite') {
    return creerVisite(P, M, { G, ui, Y0, TH, htmlPlan, htmlFace,
      echap: (racine, fn) => { echap = { racine, fn }; }, clavier: () => clavier });
  }

  return {
    signaux: [`entrepot:${P.id}:poser`, `entrepot:${P.id}:verifier`],
    id: P.id,
    nav: { libelle: P.libelle || "Plan de l'entrepôt" },
    etatNeuf: () => etatNeuf(M.mode),
    jalons: (db) => jalonsEntrepot(db, P),
    note: P.note || opts.copie ? (db) => noteEntrepot(db, P, opts.copie ? 'evaluation' : undefined) : null,
    // La calculette du site (core/calculette.js), en rangement, hors guidage : c'est l'environnement
    // d'entreprise qui la pose quand l'écran du plan est ouvert et la retire ailleurs.
    calculette: (api) => !PREP && !regime(api).g,
    bonnesReponses: () => (PREP ? attendusPreparation(P) : bonnesReponses(P)),
    // Ce que lisent les tests et la page d'essai : la palette en main, la travée ouverte, la fiche…
    lire: () => ({ main: ui.main, trav: ui.trav, msg: ui.msg, empl: ui.empl, reappro: ui.reappro, voir: ui.voir }),
    html(e, api) {
      if (PREP ? !e.faits : !e.place) Object.assign(e, etatNeuf(M.mode), e);
      const R = regime(api);
      if (R.fige) { ui.main = null; ui.confirmer = false; ui.empl = null; ui.reappro = null; }
      const ouverte = vueOuverte(e, R);
      let espace;
      if (!ouverte) espace = `<div class="pe-plan">${htmlPlan(e, R)}</div>`;
      else if (!PREP) espace = `${htmlEntete(e, R)}<div class="pe-face">${htmlFace(e, R)}</div>`;
      else if (ui.voir || e.fin || R.fige) espace = `${htmlEntetePrep(e, R)}<div class="pe-vue">${htmlPalette(e, R, api)}</div>`;
      else {
        const droite = ui.empl ? `<div class="pe-vue">${htmlFiche(e, R)}</div>` : `<div class="pe-face">${htmlFace(e, R)}</div>`;
        espace = `${htmlEntetePrep(e, R)}<div class="pe-partage">${htmlPaletteMini(e)}<div class="pe-partage-d">${droite}</div></div>`;
      }
      return `<div class="pe${PREP ? ' pe-prep' : ''}" data-entrepot="${ech(P.id)}" data-pe-mode="${M.mode}" data-pe-temps="${R.t}" data-pe-ouverte="${ouverte}">
        <div class="pe-adresse" data-pe-adresse>${htmlAdresse(e, R, null)}</div>
        ${PREP ? htmlBandeauPrep(e, R) : htmlBandeau(e, R, api)}
        <div class="pe-jeu">${PREP ? htmlCotePrep(e, R, api) : htmlCote(e, R, api)}
          <section class="pe-espace">${espace}</section></div></div>`;
    },
    brancher(z, e, api) {
      const racine = z.querySelector('.pe');
      if (!racine) return;
      const R = regime(api);
      const redessiner = () => api.redessiner();
      const sauver = () => api.sauver();
      // GESTES (questions au fil, lot 3) : `entrepot:<id>:poser` (poser une palette), `entrepot:<id>:verifier` (« Vérifier »).
      const sig = (n) => { if (api.signal) api.signal(`entrepot:${P.id}:${n}`); };
      // Un clic, ou Entrée / Espace sur un élément du plan (les groupes SVG n'ont pas de clic clavier).
      const activer = (el, fn) => {
        el.addEventListener('click', fn);
        if (el.tagName !== 'BUTTON') el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); } });
      };
      const on = (cle, fn) => racine.querySelectorAll(`[data-pe="${cle}"]`).forEach((b) => activer(b, fn));
      const fermer = () => {
        if (PREP) { if (!fermerPrep(e)) return false; redessiner(); return true; }
        if (!ui.trav) return false;
        ui.focus = `trav:${ui.trav}`; ui.trav = null; dire('');
        redessiner();
        return true;
      };
      echap = { racine, fn: fermer };
      // La hauteur d'écran qui reste sous le bandeau, page remontée en haut : le plan y tient en entier.
      const espace = racine.querySelector('.pe-espace');
      const caler = () => {
        if (!espace.isConnected) { window.removeEventListener('resize', caler); return; }
        const haut = espace.getBoundingClientRect().top + window.scrollY;
        const entete = racine.querySelector('.pe-entete');
        const reste = window.innerHeight - haut - 22 - (entete ? entete.offsetHeight + 6 : 0);
        racine.style.setProperty('--pe-dispo', `${Math.max(entete ? 340 : 420, Math.round(reste))}px`);
      };
      caler();
      window.addEventListener('resize', caler);
      racine.addEventListener('focusin', (ev) => { const t = ev.target.closest && ev.target.closest('[data-pe-cle]'); if (t) ui.focus = t.dataset.peCle; });
      const det = racine.querySelector('[data-pe-regles]');
      if (det) det.addEventListener('toggle', () => { ui.regles = det.open; });
      on('retour', fermer);
      if (clavier && ui.focus) {
        const el = racine.querySelector(`[data-pe-cle="${CSS.escape(ui.focus)}"]`);
        if (el) el.focus({ preventScroll: true });
      }
      if (R.fige) return;

      // Les palettes : la carte du bandeau ou la palette de la zone de réception.
      racine.querySelectorAll('[data-pe-pal]').forEach((b) => activer(b, () => { prendre(e, b.dataset.pePal); sauver(); redessiner(); }));
      // Une travée : elle s'ouvre en grand, vue de face (la travée se relève).
      racine.querySelectorAll('[data-pe-trav]').forEach((g) => activer(g, () => {
        ui.trav = g.dataset.peTrav; ui.anim = true; dire('');
        ui.voir = false; ui.empl = null;
        ui.focus = `emp:${ui.trav}-N1-E1`;
        redessiner();
      }));
      // La zone litiges, sur le plan.
      racine.querySelectorAll('[data-pe-lit]').forEach((g) => activer(g, () => {
        if (!ui.main) { dire(`<b>${ech(g.dataset.peLit)}</b> : prenez d'abord une palette.`); redessiner(); return; }
        poser(e, g.dataset.peLit); sig('poser'); sauver(); redessiner();
      }));
      // Un emplacement de la vue de face : poser la palette en main. Le survol remplit l'adresse.
      const barre = racine.querySelector('[data-pe-adresse]');
      racine.querySelectorAll('[data-pe-emp]').forEach((g) => {
        activer(g, () => {
          if (PREP) cliquerPrep(e, g.dataset.peEmp, R); else poser(e, g.dataset.peEmp);
          sig('poser'); sauver(); redessiner();
        });
        const sur = () => { barre.innerHTML = htmlAdresse(e, R, g.dataset.peEmp); };
        const hors = () => { barre.innerHTML = htmlAdresse(e, R, null); };
        g.addEventListener('mouseenter', sur); g.addEventListener('focus', sur);
        g.addEventListener('mouseleave', hors); g.addEventListener('blur', hors);
      });
      on('aideCharge', () => { e.aideCharge = !(e.aideCharge !== false); ui.focus = 'b:aideCharge'; sauver(); redessiner(); });
      on('verifier', () => { e.verifie = true; e.verifs = (e.verifs || 0) + 1; sig('verifier'); sauver(); redessiner(); });
      on('rendre', () => { ui.confirmer = true; ui.focus = 'b:rendreOui'; redessiner(); });
      on('rendreNon', () => { ui.confirmer = false; ui.focus = 'b:rendre'; redessiner(); });
      on('rendreOui', () => { ui.confirmer = false; ui.main = null; ui.trav = null; sauver(); if (api.rendreCopie) api.rendreCopie(); redessiner(); });
      if (PREP) brancherPrep(racine, e, R, on, activer, sauver, redessiner);
    },
  };
}
