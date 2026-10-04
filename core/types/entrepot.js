// Vue « Plan d'entrepôt » — se repérer dans un entrepôt : choisir une TRAVÉE sur le plan vu de dessus,
// puis un EMPLACEMENT dans la travée vue de face.
//
// Écrite le 04/10/2026 (brief `docs/briefs/MOTEUR-vue-plan-entrepot.md`, lots 1 et 2 : le cœur et le
// mode RANGEMENT), d'après la maquette v2 validée par Tristan (`docs/briefs/plan-entrepot/`), qui FAIT
// FOI pour l'interaction : mêmes gestes, mêmes textes. Le code de la maquette était jetable (état
// global, géométrie écrite à la main, stock tiré par un générateur) : ici on reprend le comportement,
// le plan est DÉCLARÉ par le contenu et dessiné par le moteur. Les modes « comptage » et
// « préparation » (lots 3 et 4) ne sont pas encore écrits : une séance qui les déclare ne se charge pas.
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
// palette en main, bandes de rotation, parcours dessiné, verdict expliqué critère par critère ;
// entraînement = parcours seul, nom du critère seul ; évaluation = rien avant la copie rendue (comme le
// Planning, décision de Tristan du 04/10). On dit QUE un critère n'est pas respecté, jamais DE COMBIEN.

// Pas d'import de `ui.js` : un corrigé de séance peut importer ce module hors du navigateur.
const ech = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = (n) => String(n).padStart(2, '0');
const kg = (n) => `${Number(n).toLocaleString('fr-FR')} kg`;

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
  charge: {
    nom: 'poids',
    juger: (x) => (x.M.chargeNiveau(x.place, x.d, x.p.id) + x.p.kg > x.cote.charge[x.d.n]
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
  if (mode !== 'rangement') err(`le mode « ${mode} » n'est pas encore écrit dans le moteur (lots 3 et 4 du brief)`);
  const L = P.plan || err('il manque le plan');
  const T = L.travees || 4, N = L.niveaux || 3, E = L.emplacements || 3;
  if (N > 4 || E > 4) err('4 niveaux et 4 emplacements par niveau au plus');
  const allees = (L.allees || []).map((al) => ({ id: al.id, cotes: (al.cotes || []).filter(Boolean) }));
  if (!allees.length) err('aucune allée');
  const cotes = {};
  allees.forEach((al) => al.cotes.forEach((id, i) => {
    const c = (L.cotes || {})[id] || err(`le côté ${id} n'est pas décrit dans plan.cotes`);
    for (let n = 1; n <= N; n++) if (!(c.charge && c.charge[n] > 0)) err(`le côté ${id} n'a pas de charge maximale au niveau ${n}`);
    cotes[id] = { id, allee: al.id, gauche: i === 0, gammes: c.gammes || [], charge: c.charge, note: c.note || '' };
  }));
  const ordre = allees.flatMap((al) => al.cotes);
  const toutes = [];
  ordre.forEach((c) => { for (let t = 1; t <= T; t++) for (let n = 1; n <= N; n++) for (let e = 1; e <= E; e++) toutes.push(adresse(c, t, n, e)); });
  const existe = new Set(toutes);
  const hs = new Set(L.horsService || []);
  hs.forEach((a) => { if (!existe.has(a)) err(`emplacement hors service inconnu : ${a}`); });
  const zones = L.zones || {};
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
  const M = { P, T, N, E, allees, cotes, ordre, toutes, existe, hs, litiges, zones, produits, stock, pal, crit,
    nomGamme, gammeDe, cotesDeGamme, estLitige, occupant, chargeNiveau };
  M.jalons = (P.jalons || (P.palettes || []).map((p) => ({ id: `palette-${p.id}`, palette: p.id,
    lib: `${p.id} bien rangée (${p.nom || produits[p.produit].nom})` })));
  M.jalons.forEach((j) => { if (!pal[j.palette]) err(`jalon ${j.id} : palette inconnue (${j.palette})`); });
  COMPILES.set(P, M);
  return M;
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

export function etatNeuf() {
  return { place: {}, verifie: false, verifs: 0, premierGeste: null, aideCharge: true };
}
const etatDe = (db, P) => (db && db.entrepots && db.entrepots[P.id]) || etatNeuf();

// Les jalons d'une base : une palette est juste si elle est posée ET qu'aucun critère n'est faux à son
// adresse. Non posée = faux (l'inaction ne rapporte rien).
export function jalonsEntrepot(db, P) {
  const M = compiler(P);
  const e = etatDe(db, P);
  const place = e.place || {};
  const L = M.jalons.map((j) => ({ id: j.id, lib: j.lib, palette: j.palette,
    ok: !!place[j.palette] && !fautes(M, place, j.palette, place[j.palette]).length }));
  return { L, ok: L.filter((l) => l.ok).length, total: L.length };
}

// Les étapes à donner à `creerEntreprise` : un jalon = une étape du suivi.
export function etapesEntrepot(P) {
  return jalonsEntrepot({}, P).L.map(({ id, lib }) => ({
    id, titre: lib,
    verifier(db) {
      const l = jalonsEntrepot(db, P).L.find((x) => x.id === id);
      return { status: l && l.ok ? 'ok' : 'attente' };
    },
  }));
}

// La note d'évaluation : jalons réussis / jalons × `note.sur` (comme le Planning).
export function noteEntrepot(db, P) {
  const N = Object.assign({ sur: 20 }, P.note || {});
  const { L, ok, total } = jalonsEntrepot(db, P);
  const e = etatDe(db, P);
  return { score: total ? Math.round(ok / total * N.sur * 100) / 100 : 0, max: N.sur, ok, total,
    detail: { jalons: L.map((l) => ({ jalon: l.lib, ok: l.ok, adresse: (e.place || {})[l.palette] || null })),
      verifs: e.verifs || 0, premierGeste: e.premierGeste || null } };
}

// Les bonnes réponses de chaque palette (page d'essai, tests, côté enseignant).
export function bonnesReponses(P) {
  const M = compiler(P);
  return Object.fromEntries(Object.keys(M.pal).map((id) => [id, solutions(M, id)]));
}
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
  return { racks, allees, droite, ZX, W: ZX + ZW + 18, H: yBas + 92, yBas, yPr,
    yTrav: (t) => Y0 + (M.T - t) * TH }; // T01 en bas, près de l'allée principale
}

/* ======================================================================= vue */
export function creerEntrepot(P, opts = {}) {
  const M = compiler(P);
  const G = geometrie(M);
  const ui = { main: null, trav: null, msg: '', msgType: '', anim: false, regles: false, confirmer: false, focus: null };

  const tempsDe = (api) => (opts.copie ? 'evaluation' : P.temps || (api && api.temps) || 'guidage');
  function regime(api) {
    const t = tempsDe(api);
    const rendue = !!(api && api.copieRendue && api.copieRendue());
    return { t, g: t === 'guidage', entr: t === 'entrainement', eval: t === 'evaluation', rendue,
      fige: t === 'evaluation' && rendue,
      bandes: t === 'guidage', parcours: t !== 'evaluation', regles: t !== 'evaluation', aideCharge: t !== 'evaluation' };
  }
  const produit = (p) => M.produits[p.produit];
  const nomPal = (p) => p.nom || produit(p).nom;
  const court = (k) => { const p = M.produits[k]; return p.court || String(p.nom).split(' ')[0]; };
  const etatEmp = (place, a) => (M.hs.has(a) ? 'hs' : M.stock[a] ? 'stock' : M.occupant(place, a) ? 'eleve' : 'libre');

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
    const s = survol ? decoupe(survol) : null;
    const v = [t && t.c, t && `T${pad2(t.t)}`, s && `N${s.n}`, s && `E${s.e}`];
    const lib = ['allée · côté', 'travée', 'niveau', 'emplacement'];
    const prochain = v.findIndex((x) => !x);
    const cases = v.map((x, i) => `<span class="pe-case${x ? ' pe-plein' : ''}${i === prochain && (i < 2 || t) ? ' pe-attend' : ''}"><b>${x || '?'}</b><small>${lib[i]}</small></span>`)
      .join('<span class="pe-tiret">-</span>');
    return `<span class="pe-lbl">Adresse</span>${cases}<span class="pe-consigne" data-pe-consigne>${consigne(e, R)}</span>`;
  }
  function consigne(e, R) {
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
    if (R.entr) return `<span class="pe-verd pe-ko" data-pe-verdict="ko">✗ critère : ${ech([...new Set(f.map((x) => x.nom))].join(', '))}</span>`;
    return `<span class="pe-verd pe-ko" data-pe-verdict="ko">${f.map((x) => `✗ ${ech(x.nom)} : ${ech(x.txt)}`).join(' · ')}</span>`;
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
  function htmlPlan(e, R) {
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
      <line x1="360" y1="${yPr + 18}" x2="240" y2="${yPr + 18}" stroke="var(--pe-jaune-sol)" stroke-width="3" marker-end="url(#peFl)"/><line x1="60" y1="${yPr + 36}" x2="180" y2="${yPr + 36}" stroke="var(--pe-jaune-sol)" stroke-width="3" marker-end="url(#peFl)"/>
      <text x="380" y="${yPr + 32}" font-size="13" font-weight="700" fill="${soft}" ${TXT}>ALLÉE PRINCIPALE</text>`;
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
    M.allees.forEach((al) => al.cotes.forEach((c) => { s += htmlRack(e, c, racks[c]); }));
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
    s += `<rect x="${ZX}" y="${yR}" width="${ZW}" height="${hR}" fill="none" stroke="var(--pe-jaune-sol)" stroke-width="3" stroke-dasharray="12 6"/>
      <text x="${ZX + 10}" y="${yR + 20}" font-size="13" font-weight="800" fill="${ink}" ${TXT}>ZONE DE RÉCEPTION</text>`;
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
      const x = 270 + i * 100;
      s += `<rect x="${x}" y="${H - 24}" width="80" height="15" fill="var(--pe-jaune-sol)"/><text x="${x + 40}" y="${H - 12}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1a1915" ${TXT}>${ech(q)}</text>`;
    });
    s += `<g transform="translate(${W - 30},20)"><circle r="12" fill="var(--panneau)" stroke="${soft}"/><path d="M0,-8 L3.5,3.5 L0,1 L-3.5,3.5 z" fill="${ink}"/><text x="-18" y="4" text-anchor="middle" font-size="10" font-weight="800" fill="${ink}" ${TXT}>N</text></g>`;
    return `<svg class="pe-svg-plan" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Plan de l'entrepôt, travées cliquables">${s}</svg>`;
  }
  // Un côté de rack vu de dessus, découpé entre chaque échelle ; chaque travée montre ses niveaux.
  function htmlRack(e, c, g) {
    const x = g.x;
    let s = `<text x="${x + RW / 2}" y="${Y0 - 10}" text-anchor="middle" font-size="20" font-weight="800" fill="var(--encre)" ${TXT}>${ech(c)}</text>`;
    for (let t = 0; t <= M.T; t++) s += `<rect x="${x - 2}" y="${Y0 + t * TH - 4}" width="${RW + 4}" height="8" fill="var(--pe-montant)"/>`;
    const cw = 54 / M.E, ch = 51 / M.N;
    for (let t = 1; t <= M.T; t++) {
      const y = G.yTrav(t), id = `${c}-T${pad2(t)}`;
      const lisseX = g.regard === 'ouest' ? x + RW - 3 : x;   // les lisses sont côté allée
      s += `<g class="pe-trav" data-pe-trav="${id}" data-pe-cle="trav:${id}" tabindex="0" role="button" aria-label="Travée ${id}, ${M.N} niveaux">
        <rect class="pe-fond-trav" x="${x}" y="${y + 5}" width="${RW}" height="${TH - 10}" rx="2" fill="var(--panneau)" stroke="var(--pe-gris-trait)" stroke-width="1.2"/>
        <rect x="${lisseX}" y="${y + 5}" width="3" height="${TH - 10}" fill="var(--pe-lisse)"/>
        <text x="${x + RW / 2}" y="${y + 24}" text-anchor="middle" class="pe-mono" font-size="15" font-weight="800" fill="var(--encre)">T${pad2(t)}</text>`;
      for (let n = 1; n <= M.N; n++) for (let e2 = 1; e2 <= M.E; e2++) {
        const a = adresse(c, t, n, e2), st = etatEmp(e.place, a);
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
    const PW = 160, XG = 40, WF = XG * 2 + M.E * PW, base = 140 + (M.N - 1) * 130, HF = base + 40;
    const Y = (n) => base - (n - 1) * 130;
    let s = `<defs><pattern id="peHachF" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="var(--pe-litige)"/><line x1="0" y1="0" x2="0" y2="10" stroke="var(--pe-hachure)" stroke-width="4"/></pattern></defs>`;
    s += `<rect x="0" y="${base + 6}" width="${WF}" height="30" fill="var(--pe-sol)"/>`;
    // les travées voisines, vues depuis l'allée
    const gau = g.regard === 'ouest' ? d.t - 1 : d.t + 1, dro = g.regard === 'ouest' ? d.t + 1 : d.t - 1, ym = Y(2);
    const voisin = (t, x, rot) => (t >= 1 && t <= M.T ? `<text x="${x}" y="${ym}" text-anchor="middle" font-size="13" fill="var(--encre-douce)" ${TXT} transform="rotate(${rot} ${x} ${ym})">${rot < 0 ? '← ' : ''}T${pad2(t)}${rot > 0 ? ' →' : ''}</text>` : '');
    s += voisin(gau, 14, -90) + voisin(dro, WF - 14, 90);
    for (let n = 1; n <= M.N; n++) {
      const yb = Y(n), total = M.chargeNiveau(e.place, { c: d.c, t: d.t, n }, null);
      for (let k = 1; k <= M.E; k++) {
        const a = adresse(d.c, d.t, n, k), st = M.stock[a], p = M.occupant(e.place, a), hs = M.hs.has(a), x = XG + (k - 1) * PW;
        const lib = st ? `${court(st.produit)}, ${kg(st.kg)}` : p ? `votre palette ${p}, ${kg(M.pal[p].kg)}` : hs ? 'hors service' : 'libre';
        s += `<g class="pe-emp" data-pe-emp="${a}" data-pe-cle="emp:${a}" tabindex="0" role="button" aria-label="${a} : ${ech(lib)}">
          <rect class="pe-cible" x="${x + 3}" y="${yb - 116}" width="${PW - 6}" height="112" rx="3" fill="${hs ? 'url(#peHachF)' : 'transparent'}" stroke="transparent"/>`;
        if (st || p) {
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
      // étiquette du niveau, plaque de charge, et l'aide « déjà posé » (désactivable, coupée en évaluation)
      const py = n === 1 ? yb + 8 : yb - 2, xr = XG + M.E * PW;
      s += `<rect x="${XG + 4}" y="${py}" width="132" height="18" rx="2" fill="var(--panneau)" stroke="var(--encre-douce)"/><text x="${XG + 70}" y="${py + 14}" text-anchor="middle" class="pe-mono" font-size="12" font-weight="800" fill="var(--encre)">${ech(d.c)}-T${pad2(d.t)}-N${n}</text>`;
      s += `<rect x="${xr - 168}" y="${py}" width="164" height="18" rx="2" fill="var(--pe-plaque)" data-pe-plaque="${n}"/><text x="${xr - 86}" y="${py + 14}" text-anchor="middle" class="pe-mono" font-size="12" font-weight="800" fill="#1a1915">max ${kg(c.charge[n])} / niveau</text>`;
      if (R.aideCharge && e.aideCharge !== false) {
        const trop = total > c.charge[n], xd = xr - 172 - 150;
        s += `<rect x="${xd}" y="${py}" width="146" height="18" rx="2" fill="var(--panneau)" stroke="${trop ? 'var(--rouge)' : 'var(--encre-douce)'}" stroke-width="${trop ? 2 : 1}"/>
          <text x="${xd + 73}" y="${py + 14}" text-anchor="middle" font-size="12" font-weight="800" fill="${trop ? 'var(--rouge)' : 'var(--encre)'}" ${TXT} data-pe-deja="${n}">déjà posé : ${kg(total)}</text>`;
      }
      s += `<text x="${XG - 6}" y="${yb - 52}" text-anchor="end" font-size="13" font-weight="800" fill="var(--encre-douce)" ${TXT}>N${n}</text>`;
    }
    for (const x of [XG, XG + M.E * PW]) s += `<rect x="${x - 6}" y="${Y(M.N) - 120}" width="12" height="${base - Y(M.N) + 128}" fill="var(--pe-montant)"/>`;
    const anim = ui.anim; ui.anim = false;
    return `<div class="pe-releve${anim ? ' pe-anim' : ''}"><svg class="pe-svg-face" viewBox="0 0 ${WF} ${HF}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Travée ${ui.trav} vue de face">${s}</svg></div>`;
  }
  function htmlEntete(e, R) {
    const c = M.cotes[ui.trav.split('-')[0]];
    const fil = `Plan › <b>Travée</b> <span class="pe-mono">${ech(ui.trav)}</span> <span class="pe-petit">(vue depuis l'allée ${ech(c.allee)}${c.note ? `, ${ech(c.note)}` : ''})</span>`;
    const aide = R.aideCharge && !R.fige ? `<label class="pe-case-aide"><input type="checkbox" data-pe="aideCharge" data-pe-cle="b:aideCharge" ${e.aideCharge !== false ? 'checked' : ''}> charge déjà posée</label>` : '';
    return `<div class="pe-entete"><div class="pe-fil">${fil}</div>
      <div class="pe-msg-vue"><div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pe-msg>${ui.msg}</div></div>
      ${aide}<button type="button" class="btn btn-p pe-retour" data-pe="retour" data-pe-cle="b:retour">← Retour au plan</button></div>`;
  }

  return {
    id: P.id,
    nav: { libelle: P.libelle || "Plan de l'entrepôt" },
    etatNeuf,
    jalons: (db) => jalonsEntrepot(db, P),
    note: P.note || opts.copie ? (db) => noteEntrepot(db, P) : null,
    bonnesReponses: () => bonnesReponses(P),
    // Ce que lisent les tests et la page d'essai : la palette en main, la travée ouverte.
    lire: () => ({ main: ui.main, trav: ui.trav, msg: ui.msg }),
    html(e, api) {
      if (!e.place) Object.assign(e, etatNeuf(), e);
      const R = regime(api);
      if (R.fige) { ui.main = null; ui.confirmer = false; }
      const ouverte = !!ui.trav;
      return `<div class="pe" data-entrepot="${ech(P.id)}" data-pe-temps="${R.t}" data-pe-ouverte="${ouverte}">
        <div class="pe-adresse" data-pe-adresse>${htmlAdresse(e, R, null)}</div>
        ${htmlBandeau(e, R, api)}
        <div class="pe-jeu">${htmlCote(e, R, api)}
          <section class="pe-espace">${ouverte
            ? `${htmlEntete(e, R)}<div class="pe-face">${htmlFace(e, R)}</div>`
            : `<div class="pe-plan">${htmlPlan(e, R)}</div>`}</section></div></div>`;
    },
    brancher(z, e, api) {
      const racine = z.querySelector('.pe');
      if (!racine) return;
      const R = regime(api);
      const redessiner = () => api.redessiner();
      const sauver = () => api.sauver();
      // Un clic, ou Entrée / Espace sur un élément du plan (les groupes SVG n'ont pas de clic clavier).
      const activer = (el, fn) => {
        el.addEventListener('click', fn);
        if (el.tagName !== 'BUTTON') el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); } });
      };
      const on = (cle, fn) => racine.querySelectorAll(`[data-pe="${cle}"]`).forEach((b) => activer(b, fn));
      const fermer = () => {
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
        ui.focus = `emp:${ui.trav}-N1-E1`;
        redessiner();
      }));
      // La zone litiges, sur le plan.
      racine.querySelectorAll('[data-pe-lit]').forEach((g) => activer(g, () => {
        if (!ui.main) { dire(`<b>${ech(g.dataset.peLit)}</b> : prenez d'abord une palette.`); redessiner(); return; }
        poser(e, g.dataset.peLit); sauver(); redessiner();
      }));
      // Un emplacement de la vue de face : poser la palette en main. Le survol remplit l'adresse.
      const barre = racine.querySelector('[data-pe-adresse]');
      racine.querySelectorAll('[data-pe-emp]').forEach((g) => {
        activer(g, () => { poser(e, g.dataset.peEmp); sauver(); redessiner(); });
        const sur = () => { barre.innerHTML = htmlAdresse(e, R, g.dataset.peEmp); };
        const hors = () => { barre.innerHTML = htmlAdresse(e, R, null); };
        g.addEventListener('mouseenter', sur); g.addEventListener('focus', sur);
        g.addEventListener('mouseleave', hors); g.addEventListener('blur', hors);
      });
      on('aideCharge', () => { e.aideCharge = !(e.aideCharge !== false); ui.focus = 'b:aideCharge'; sauver(); redessiner(); });
      on('verifier', () => { e.verifie = true; e.verifs = (e.verifs || 0) + 1; sauver(); redessiner(); });
      on('rendre', () => { ui.confirmer = true; ui.focus = 'b:rendreOui'; redessiner(); });
      on('rendreNon', () => { ui.confirmer = false; ui.focus = 'b:rendre'; redessiner(); });
      on('rendreOui', () => { ui.confirmer = false; ui.main = null; ui.trav = null; sauver(); if (api.rendreCopie) api.rendreCopie(); redessiner(); });
    },
  };
}
