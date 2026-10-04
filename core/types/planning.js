// Vue « Planning » — poser des cartes sur une grille créneaux × ressources, voir les conflits,
// replanifier après un aléa.
//
// Écrite le 04/10/2026 (brief `docs/briefs/MOTEUR-vue-planning.md`), d'après la maquette jouable
// v8 (`docs/briefs/planning/maquette-planning.html`), qui FAIT FOI pour l'interaction : mêmes gestes,
// mêmes textes. Le code de la maquette était jetable (état global, trois jeux de règles écrits à la
// main) : ici on reprend le comportement, et les règles sont DÉCLARÉES par le contenu.
//
// Elle vit dans l'environnement d'entreprise (`entreprise.js`), comme le quai et l'inventaire, et
// n'existe que si la séance déclare `planning`. Elle ne connaît AUCUNE entreprise : grille, lignes,
// cartes, règles, jalons, aides, aléa et textes viennent de la déclaration ; les couleurs, du THEME.
//
// Une déclaration (exemples complets : `contenus/planning-essai.js`) :
//
//   planning: {
//     id, libelle, titre, date,
//     infos: (o) => [html…],                 // panneau consigne ; o = { guidage, phase, lignes, ressources, reprise(l) }
//     echelle: { type: 'heures', debut: '06:00', fin: '14:00', pas: 15 }
//           ou { type: 'jours', jours: ['lun 7', …], semaine: 5 },
//     lignes: { titre, liste: [{ id, nom, note?, de?, a?, dispo?, arrivee?, finHier?, … }] },
//     affectation: { question: 'Qui charge le camion {carte} ?', manque: 'cariste ?', lien: 'le cariste',
//                    liste: [{ id, nom, de?, a?, dispo?, … }],
//                    lecture: { titre, legende, bloc: (carte, ligne) => texte } },     // facultatif
//     cartes: { titre, legende?, aPlacer?, liste: [{ id, titre, court?, famille, des?, avant?, … }],
//               details: (c, o) => [html…], duree: (c) => minutes (ou jours), libDuree?, detailDuree?: (c) => texte,
//               ligne?: (c) => id de ligne imposée, semaineEntiere?, demandee?: (c) => jour, impose?: (c) => bool,
//               nonPosees?: (cartes) => texte, pauses?: { nombre, duree, libelle } },
//     familles: { semi: { teinte: 'a', legende: 'semi-remorque' }, … },
//     compteurs: [{ lib, valeur: 'presents' | 'besoin' | 'filtre', regle }],          // lignes sous la grille
//     regles: [{ id, type, …, message }],    // types : voir TYPES plus bas
//     jalons: [{ id, lib, regles: [ids] }],  // vrai si tout est posé (et affecté) ET aucune de ses règles n'a de problème
//     aides: { consignes: { regles, … }, fenetre, detailDuree, reprise, compteurConduite },
//     alea: { de, texte, cartes: { D: { des: '09:00' } }, ajoutCartes, ajoutLignes, ressources: { s2: { dispo: '12:00' } } },
//     note: { sur: 20 },                     // évaluation : jalons réussis / jalons × sur
//   }
//
// Les heures s'écrivent 'HH:MM' et les durées en MINUTES (en jours pour l'échelle « jours ») : le
// moteur les convertit en créneaux, durée ARRONDIE AU CRÉNEAU SUPÉRIEUR.
//
// L'état vit dans la base de l'élève, sous `db.plannings[<planning.id>]` (cloisonné par séance) :
//   { phase: 1 | 2 | 'fini', place: { <carte>: { r, s, k } }, v1, v2, aleaVu, verifs, premierGeste, envois }
// `v1` / `v2` : les versions ENVOYÉES, figées (`{ place, at }`). Les jalons se lisent sur elles, jamais
// sur le planning en cours : rien n'est vrai avant l'envoi.
//
// Le temps pédagogique (`api.temps`) décide de ce qui est signalé (brief §3.5) : guidage = en direct
// et toutes les aides ; entraînement = sur « Vérifier mon planning », aide « règles » seule ;
// évaluation = jamais, et le deuxième envoi rend la copie. On dit QUE une règle n'est pas
// respectée, jamais DE COMBIEN : les messages par défaut le respectent, ceux du contenu aussi.

// Pas d'import de `ui.js` : un corrigé de séance peut importer ce module hors du navigateur.
const ech = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cp = (o) => JSON.parse(JSON.stringify(o));
const pad2 = (n) => String(n).padStart(2, '0');
const minutesDe = (hm) => { const [h, m] = String(hm || '00:00').split(':').map(Number); return h * 60 + (m || 0); };
const hhmm = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`; };

// Au clavier seulement, on rend le focus après un redessin (charte : « conserver le focus »).
let clavier = false;
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', () => { clavier = true; }, true);
  document.addEventListener('pointerdown', () => { clavier = false; }, true);
}

/* ==================================================================== échelle */
// Deux échelles, un seul modèle : la grille a `n` colonnes (créneaux), une carte en couvre `L`.
function echelleDe(P) {
  const X = P.echelle || {};
  if (X.type === 'jours') {
    const jours = X.jours || [];
    const semaine = X.semaine || 0;
    const slot = (v) => (v == null ? null : typeof v === 'number' ? v : jours.indexOf(v));
    return {
      type: 'jours', n: jours.length, pas: 1, semaine, jours,
      lib: (t) => jours[t] || '', slot, slotDebut: slot, slotFin: (v) => (v == null ? null : slot(v) + 1),
      duree: (u) => Math.max(1, Math.round(Number(u) || 1)),
      minutes: (L) => L,
      fmt: (L) => `${L} jour${L > 1 ? 's' : ''}`,
      plage: (s, e) => `${jours[s]}${e - s > 1 ? ` → ${jours[e - 1]}` : ''}`,
      fort: (t) => !!semaine && t > 0 && t % semaine === 0,     // trait épais entre deux semaines
      tetes: jours.map((j, t) => ({ t, span: 1, lib: j })),
      largeur: X.largeur || 60, col1: X.col1 || 130,
    };
  }
  const debut = minutesDe(X.debut || '06:00'), fin = minutesDe(X.fin || '14:00'), pas = X.pas || 15;
  const n = Math.max(1, Math.round((fin - debut) / pas));
  const parHeure = Math.max(1, Math.round(60 / pas));
  const lib = (t) => hhmm(debut + t * pas);
  const tetes = [];
  for (let t = 0; t < n; t += parHeure) tetes.push({ t, span: Math.min(parHeure, n - t), lib: lib(t) });
  return {
    type: 'heures', n, pas, debut,
    lib, slot: (v) => (v == null ? null : Math.round((minutesDe(v) - debut) / pas)),
    // Une heure qui ne tombe pas sur un créneau : au plus tôt le créneau d'après, au plus tard celui d'avant.
    slotDebut: (v) => (v == null ? null : Math.ceil((minutesDe(v) - debut) / pas)),
    slotFin: (v) => (v == null ? null : Math.floor((minutesDe(v) - debut) / pas)),
    duree: (min) => Math.max(1, Math.ceil((Number(min) || 0) / pas)),
    minutes: (L) => L * pas,
    fmt: (L) => { const m = L * pas; return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${pad2(m % 60)}`; },
    plage: (s, e) => `${lib(s)}–${lib(e)}`,
    fort: (t) => t % parHeure === 0,                            // trait plus foncé à chaque heure
    tetes,
    largeur: X.largeur || (n > 40 ? 18 : 20), col1: X.col1 || (n > 40 ? 150 : 130),
  };
}

/* ================================================================== données */
// Une ressource (ligne de la grille ou seconde ressource) : ses heures ou jours de présence en créneaux.
function ressource(x, E) {
  const r = Object.assign({}, x);
  const de = x.de != null ? E.slotDebut(x.de) : 0;
  const dispo = x.dispo != null ? E.slotDebut(x.dispo) : 0;
  const arrivee = x.arrivee != null ? E.slot(x.arrivee) : 0;
  r._debut = Math.max(0, de, dispo, arrivee);
  r._fin = x.a != null ? E.slotFin(x.a) : E.n;
  return r;
}

// Une carte : la déclaration du contenu telle quelle (le contenu relit ses propres champs), plus les
// champs calculés par le moteur, préfixés d'un `_` pour ne jamais écraser ceux du contenu.
function carteDe(c, P, E) {
  const C = P.cartes || {};
  const u = c.duree != null ? c.duree : C.duree ? C.duree(c) : (c.jours || 1);
  const dem = C.demandee ? C.demandee(c) : c.date;
  return Object.assign({}, c, {
    titre: c.titre || c.id, court: c.court || c.id,
    _L: E.duree(u),
    _des: c.des != null ? E.slotDebut(c.des) : null,
    _avant: c.avant != null ? E.slotFin(c.avant) : null,
    _ligne: C.ligne ? C.ligne(c) : (c.ligne || null),
    _dem: dem != null ? E.slot(dem) : null,
    _impose: C.impose ? !!C.impose(c) : !!c.impose,
    _affecter: !!P.affectation,
    pause: false, nouveau: !!c.nouveau, modifie: c.modifie || [],
  });
}

// Les données d'une phase : la phase 2 applique l'aléa (cartes modifiées ou ajoutées, lignes
// ajoutées, ressources rendues indisponibles). Le planning de l'élève, lui, ne bouge pas.
function donnees(P, E, phase) {
  const A = phase >= 2 && P.alea ? P.alea : null;
  const C = P.cartes || {};
  const modif = (A && A.cartes) || {};
  let liste = (C.liste || []).map((c) => (modif[c.id] ? Object.assign({}, c, modif[c.id], { modifie: Object.keys(modif[c.id]) }) : c));
  if (A && A.ajoutCartes) liste = liste.concat(A.ajoutCartes.map((c) => Object.assign({ nouveau: true }, c)));
  const res = (A && A.ressources) || {};
  const maj = (x) => (res[x.id] ? Object.assign({}, x, res[x.id], { modifie: Object.keys(res[x.id]) }) : x);
  const lignes = ((P.lignes && P.lignes.liste) || []).concat((A && A.ajoutLignes) || []).map(maj).map((x) => ressource(x, E));
  const ressources = P.affectation ? (P.affectation.liste || []).concat((A && A.ajoutRessources) || []).map(maj).map((x) => ressource(x, E)) : [];
  const cartes = liste.map((c) => carteDe(c, P, E));
  const pauses = [];
  if (C.pauses) {
    for (let i = 1; i <= (C.pauses.nombre || 0); i++) {
      pauses.push({ id: `pause-${i}`, titre: C.pauses.libelle || 'Pause', court: C.pauses.court || 'Pause', famille: 'pause',
        _L: E.duree(C.pauses.duree || 45), _des: null, _avant: null, _ligne: null, _dem: null, _impose: false, _affecter: false,
        pause: true, nouveau: false, modifie: [] });
    }
  }
  const index = (L) => Object.fromEntries(L.map((x) => [x.id, x]));
  return { phase: A ? 2 : 1, lignes, ressources, cartes, pauses, toutes: cartes.concat(pauses),
    L: index(lignes), R: index(ressources), C: index(cartes.concat(pauses)) };
}

// Les cartes posées (le planning lu), avec leur début `s` et leur fin `e` (exclue), en créneaux.
function posees(D, place) {
  const I = [];
  D.toutes.forEach((c) => {
    const p = place && place[c.id];
    if (!p || p.s == null) return;
    const r = c._ligne || p.r;
    if (!D.L[r]) return;
    I.push({ id: c.id, c, r, k: p.k && D.R[p.k] ? p.k : null, s: p.s, e: p.s + c._L });
  });
  return I;
}

// Qui est là à chaque colonne : une ligne est « pas là » hors de sa présence (intérimaire pas encore
// arrivé) et sur les colonnes que couvrent ses cartes. Présent = toute colonne sans carte.
function presences(D, I, E) {
  const absent = {};
  D.lignes.forEach((l) => {
    absent[l.id] = new Set();
    for (let t = 0; t < E.n; t++) if (t < l._debut || t >= l._fin) absent[l.id].add(t);
  });
  I.forEach((i) => { for (let t = i.s; t < i.e; t++) absent[i.r].add(t); });
  const par = [];
  for (let t = 0; t < E.n; t++) par.push(D.lignes.filter((l) => !absent[l.id].has(t)));
  return par;
}

/* ===================================================================== règles */
// Chaque type de règle reçoit sa déclaration `R` et le planning lu `X`, et rend ses problèmes :
// `{ texte, cartes: [ids], cote: 'ligne' | 'affectation' | 'tous' }`. Le côté dit où le bloc fautif se
// montre : sur la grille (toujours) et, pour 'affectation' ou 'tous', aussi dans la grille en lecture
// seule et sur le nom de la seconde ressource. Les messages par défaut disent QUE, jamais DE COMBIEN.
const chevauche = (a, b) => a.s < b.e && b.s < a.e;
const msg = (R, defaut, ...args) => (typeof R.message === 'function' ? R.message(...args) : typeof R.message === 'string' ? R.message : defaut(...args));
const resDe = (X, i, sur) => (sur === 'affectation' ? (i.k ? X.D.R[i.k] : null) : X.D.L[i.r]);

const TYPES = {
  // Deux blocs qui se recouvrent sur la même ressource. Sur la ligne, une pause compte.
  unAlaFois(R, X) {
    const sur = R.sur || 'ligne', out = [];
    const L = X.I.filter((i) => (sur === 'ligne' ? true : i.k && !i.c.pause));
    for (let a = 0; a < L.length; a++) {
      for (let b = a + 1; b < L.length; b++) {
        const A = L[a], B = L[b];
        if (!chevauche(A, B)) continue;
        if (sur === 'ligne' ? A.r !== B.r : A.k !== B.k) continue;
        const res = resDe(X, A, sur);
        out.push({ texte: msg(R, (x, y, r) => `${r.nom} : ${x.id} et ${y.id} en même temps.`, A.c, B.c, res, X.o),
          cartes: [A.id, B.id], cote: R.marque || sur });
      }
    }
    return out;
  },
  // Une ressource qui ne convient pas à la carte (`si` : les cartes concernées ; `exige` : ce que la ressource doit être).
  compatible(R, X) {
    const sur = R.sur || 'ligne', out = [];
    X.I.filter((i) => !i.c.pause && (!R.si || R.si(i.c))).forEach((i) => {
      const res = resDe(X, i, sur);
      if (res && !R.exige(res, i.c)) {
        out.push({ texte: msg(R, (c, r) => `${c.id} : ${r.nom} ne convient pas.`, i.c, res, X.o), cartes: [i.id], cote: R.marque || sur });
      }
    });
    return out;
  },
  // Un bloc hors des heures (ou des jours) où la ressource est là : horaires `de` / `a`, `dispo`, `arrivee`.
  disponible(R, X) {
    const sur = R.sur || 'ligne', out = [];
    X.I.filter((i) => sur === 'ligne' || !i.c.pause).forEach((i) => {
      const res = resDe(X, i, sur);
      if (res && (i.s < res._debut || i.e > res._fin)) {
        out.push({ texte: msg(R, (c, r) => `${c.id} : ${r.nom} n'est pas disponible à ce moment-là.`, i.c, res, X.o), cartes: [i.id], cote: R.marque || sur });
      }
    });
    return out;
  },
  // Début avant `des`, fin après `avant` (champs de la carte). `message: { debut(c), fin(c) }`.
  fenetre(R, X) {
    const out = [], M = R.message || {};
    X.I.filter((i) => !i.c.pause).forEach((i) => {
      if (i.c._des != null && i.s < i.c._des) {
        out.push({ texte: M.debut ? M.debut(i.c, X.o) : `${i.id} : commence trop tôt.`, cartes: [i.id], cote: R.marque || 'tous' });
      }
      if (i.c._avant != null && i.e > i.c._avant) {
        out.push({ texte: M.fin ? M.fin(i.c, X.o) : `${i.id} : finit trop tard.`, cartes: [i.id], cote: R.marque || 'tous' });
      }
    });
    return out;
  },
  // Attente entre `des` et le début du bloc plus longue que `minutes` (critère métier).
  attenteMax(R, X) {
    const out = [];
    X.I.filter((i) => !i.c.pause && i.c._des != null).forEach((i) => {
      if (i.s >= i.c._des && X.E.minutes(i.s - i.c._des) > R.minutes) {
        out.push({ texte: msg(R, (c) => `${c.id} : l'attente est trop longue.`, i.c, X.o), cartes: [i.id], cote: R.marque || 'tous' });
      }
    });
    return out;
  },
  // Une carte à date imposée posée ailleurs qu'à sa date.
  dateImposee(R, X) {
    const out = [];
    X.I.filter((i) => i.c._impose && i.c._dem != null && i.s !== i.c._dem).forEach((i) => {
      out.push({ texte: msg(R, (c) => `${c.id} : la date est imposée, elle ne se déplace pas.`, i.c, X.o), cartes: [i.id], cote: R.marque || 'ligne' });
    });
    return out;
  },
  // Moins de présents que le besoin de la colonne (`besoin: [par colonne]`).
  effectif(R, X) {
    const out = [], pr = X.presents();
    for (let t = 0; t < X.E.n; t++) {
      if (pr[t].length < (R.besoin[t] || 0)) out.push({ texte: msg(R, (j) => `${j} : pas assez de monde présent.`, X.E.lib(t), t), cartes: [], cote: 'ligne', col: t });
    }
    return out;
  },
  // Aucun présent qui vérifie le filtre (un cariste CACES par jour).
  auMoinsUn(R, X) {
    const out = [], pr = X.presents();
    for (let t = 0; t < X.E.n; t++) {
      if (!pr[t].some(R.filtre)) out.push({ texte: msg(R, (j) => `${j} : aucun ${R.libelle || 'présent'} ne répond à la règle.`, X.E.lib(t), t), cartes: [], cote: 'ligne', col: t });
    }
    return out;
  },
  // Cumul des blocs d'une ligne au-delà de `max` minutes SANS carte Pause entre deux (la pause se planifie).
  cumulSansPause(R, X) {
    const out = [];
    X.D.lignes.forEach((l) => {
      const siens = X.I.filter((i) => i.r === l.id).sort((a, b) => a.s - b.s);
      let acc = 0, dit = false;
      siens.forEach((i) => {
        if (i.c.pause) { acc = 0; return; }
        acc += X.E.minutes(i.c._L);
        if (acc > R.max && !dit) { dit = true; out.push({ texte: msg(R, (x) => `${x.nom} travaille trop longtemps sans pause.`, l, X.o), cartes: [i.id], cote: R.marque || 'ligne' }); }
      });
    });
    return out;
  },
  // Somme des durées d'une ligne au-delà de `max` minutes.
  plafond(R, X) {
    const out = [];
    X.D.lignes.forEach((l) => {
      const siens = X.I.filter((i) => i.r === l.id && !i.c.pause);
      const tot = siens.reduce((a, i) => a + X.E.minutes(i.c._L), 0);
      if (tot > R.max) out.push({ texte: msg(R, (x) => `${x.nom} dépasse le maximum de la journée.`, l, X.o), cartes: siens.map((i) => i.id), cote: R.marque || 'ligne' });
    });
    return out;
  },
  // Premier départ avant la fin de service d'hier (`finHier` de la ligne) + `repos` minutes.
  reposDepuisVeille(R, X) {
    const out = [];
    X.D.lignes.forEach((l) => {
      const rep = repriseSlot(R, l, X.E);
      if (rep == null) return;
      const siens = X.I.filter((i) => i.r === l.id && !i.c.pause).sort((a, b) => a.s - b.s);
      if (siens.length && siens[0].s < rep) out.push({ texte: msg(R, (x) => `${x.nom} n'a pas eu son repos depuis la veille.`, l, X.o), cartes: [siens[0].id], cote: R.marque || 'ligne' });
    });
    return out;
  },
  // Critère métier : une carte non imposée posée ailleurs qu'à sa date demandée ALORS QUE sa date
  // demandée respectait toutes les règles `avec`. Jugé seulement quand tout est posé.
  sansNecessite(R, X) {
    const out = [];
    if (X.nonPosees.length) return out;
    X.I.filter((i) => !i.c._impose && i.c._dem != null && i.s !== i.c._dem).forEach((i) => {
      const place2 = Object.assign({}, X.place, { [i.id]: Object.assign({}, X.place[i.id], { s: i.c._dem }) });
      const autres = (R.avec || X.P.regles.filter((r) => r.type !== 'sansNecessite' && r.type !== 'critere').map((r) => r.id));
      const a = analyser(X.P, X.E, X.D, place2, autres);
      if (!a.P.length) out.push({ texte: msg(R, (c) => `${c.id} pouvait rester à la date demandée.`, i.c, X.o), cartes: [i.id], cote: R.marque || 'ligne' });
    });
    return out;
  },
  // Dernier recours : un critère propre à une séance. `verifier(x)` rend `[{ texte, cartes }]`.
  critere(R, X) {
    return (R.verifier({ D: X.D, I: X.I, place: X.place, o: X.o }) || []).map((p) => Object.assign({ cartes: [], cote: R.marque || 'ligne' }, p));
  },
};
export const TYPES_REGLES = Object.keys(TYPES);

// L'heure de reprise d'une ligne (fin d'hier + repos), en créneaux d'aujourd'hui ; null sans `finHier`.
function repriseMinutes(R, l) { return l.finHier == null ? null : minutesDe(l.finHier) + (R.repos || 0) - 1440; }
function repriseSlot(R, l, E) {
  const m = repriseMinutes(R, l);
  return m == null ? null : Math.max(0, Math.ceil((m - E.debut) / E.pas));
}

// Lire un planning : problèmes (dans l'ordre : ce qui manque, puis chaque règle déclarée), cartes
// fautives, et les règles en défaut. `seules` : ne passer que ces règles (critère « sans nécessité »).
function analyser(P, E, D, place, seules) {
  const I = posees(D, place);
  const pos = new Set(I.map((i) => i.id));
  const nonPosees = D.cartes.filter((c) => !pos.has(c.id));
  const nonAffectees = P.affectation ? I.filter((i) => !i.c.pause && !i.k).map((i) => i.c) : [];
  let pr = null;
  const X = { P, E, D, I, place: place || {}, nonPosees, presents: () => (pr || (pr = presences(D, I, E))), o: outils(E, D) };
  const textes = [];
  const C = P.cartes || {};
  if (!seules) {
    if (nonPosees.length) textes.push(C.nonPosees ? C.nonPosees(nonPosees) : `Cartes pas encore posées : ${nonPosees.map((c) => c.id).join(', ')}.`);
    if (nonAffectees.length) textes.push(P.affectation.nonAffectees ? P.affectation.nonAffectees(nonAffectees) : `Cartes sans affectation : ${nonAffectees.map((c) => c.id).join(', ')}.`);
  }
  const parRegle = {}, faux = {}, fauxK = {}, colFaux = {};
  (P.regles || []).forEach((R) => {
    if (seules && !seules.includes(R.id)) return;
    const L = TYPES[R.type](R, X);
    parRegle[R.id] = L;
    L.forEach((p) => {
      textes.push(p.texte);
      p.cartes.forEach((id) => { faux[id] = true; if (p.cote !== 'ligne') fauxK[id] = true; });
      if (p.col != null) { if (!colFaux[R.id]) colFaux[R.id] = new Set(); colFaux[R.id].add(p.col); }
    });
  });
  return { P: textes, parRegle, faux, fauxK, colFaux, I, nonPosees, nonAffectees,
    tous: !nonPosees.length && !nonAffectees.length, presents: X.presents };
}

// Ce que reçoivent les messages et les textes du contenu.
function outils(E, D) {
  return {
    h: E.lib, jour: E.lib, plage: E.plage, duree: E.fmt,
    ligne: (id) => D.L[id], ressource: (id) => D.R[id],
  };
}

/* =============================================================== compilation */
// La déclaration lue une fois : échelle, données des deux phases. Une déclaration fautive (type de
// règle inconnu, jalon qui cite une règle absente) s'arrête tout de suite, avec la raison en clair.
const COMPILES = new WeakMap();
function compiler(P) {
  if (COMPILES.has(P)) return COMPILES.get(P);
  if (!P || !P.id) throw new Error('planning : il faut un `id`.');
  const ids = new Set();
  (P.regles || []).forEach((R) => {
    if (!TYPES[R.type]) throw new Error(`planning ${P.id} : type de règle inconnu « ${R.type} » (types : ${TYPES_REGLES.join(', ')}).`);
    if (ids.has(R.id)) throw new Error(`planning ${P.id} : deux règles s'appellent « ${R.id} ».`);
    ids.add(R.id);
  });
  (P.jalons || []).forEach((j) => (j.regles || []).forEach((id) => {
    if (!ids.has(id)) throw new Error(`planning ${P.id} : le jalon « ${j.id} » cite la règle « ${id} », qui n'existe pas.`);
  }));
  const pbCouleurs = verifierCouleurs(P.familles);
  if (pbCouleurs.length) throw new Error(`planning ${P.id} : ${pbCouleurs.join(' ')}`);
  const E = echelleDe(P);
  const M = { P, E, D: { 1: donnees(P, E, 1), 2: donnees(P, E, 2) } };
  M.lire = (place, phase) => analyser(P, E, M.D[phase >= 2 && P.alea ? 2 : 1], place, null);
  M.jalons = (place, phase) => {
    const a = M.lire(place, phase);
    return (P.jalons || []).map((j) => ({ id: j.id, lib: j.lib, ok: a.tous && (j.regles || []).every((id) => !(a.parRegle[id] || []).length) }));
  };
  COMPILES.set(P, M);
  return M;
}

/* =============================================================== état, jalons */
export function etatNeuf() {
  return { phase: 1, place: {}, v1: null, v2: null, aleaVu: false, verifs: 0, premierGeste: null, envois: [] };
}
const VERSIONS = [{ v: 'v1', n: 1, lib: '1er envoi' }, { v: 'v2', n: 2, lib: "Après l'aléa" }];
const versionsDe = (P) => (P.alea ? VERSIONS : VERSIONS.slice(0, 1));

// Les jalons d'une base, lus sur les versions ENVOYÉES : `v1` sur les données d'avant l'aléa, `v2` sur
// celles d'après. Une version pas encore envoyée : tous ses jalons faux.
export function jalonsPlanning(db, P) {
  const M = compiler(P);
  const e = (db && db.plannings && db.plannings[P.id]) || etatNeuf();
  const L = [];
  versionsDe(P).forEach((V) => {
    const env = e[V.v];
    const J = env ? M.jalons(env.place || {}, V.n) : (P.jalons || []).map((j) => ({ id: j.id, lib: j.lib, ok: false }));
    J.forEach((j) => L.push({ id: `${V.v}-${j.id}`, version: V.lib, jalon: j.id, lib: j.lib, ok: j.ok }));
  });
  return { L, ok: L.filter((l) => l.ok).length, total: L.length };
}

// Les étapes à donner à `creerEntreprise` : un jalon = une étape du suivi.
export function etapesPlanning(P) {
  return jalonsPlanning({}, P).L.map(({ id, version, lib }) => ({
    id, titre: `${version} — ${lib}`,
    verifier(db) {
      const l = jalonsPlanning(db, P).L.find((x) => x.id === id);
      return { status: l && l.ok ? 'ok' : 'attente' };
    },
  }));
}

// La note d'évaluation (brief §7, provisoire) : jalons réussis / jalons × `note.sur`.
export function notePlanning(db, P) {
  const N = Object.assign({ sur: 20 }, P.note || {});
  const { L, ok, total } = jalonsPlanning(db, P);
  const e = (db && db.plannings && db.plannings[P.id]) || etatNeuf();
  return { score: total ? Math.round(ok / total * N.sur * 100) / 100 : 0, max: N.sur, ok, total,
    detail: { jalons: L.map((l) => ({ version: l.version, jalon: l.lib, ok: l.ok })),
      verifs: e.verifs || 0, premierGeste: e.premierGeste || null, envois: e.envois || [] } };
}

/* ======================================================================= vue */
/* ================================================================== couleurs */
// Les couleurs des familles sont LIBRES, déclarées par la séance (décision de Tristan, 04/10/2026),
// et sans lien avec la charte de l'entreprise : `familles: { semi: { couleur: '#f0be00', nom: 'jaune',
// legende: 'semi-remorque' } }`. La couleur sert de trait ; le fond est cette couleur TRANSLUCIDE posée
// sur le panneau (opacité `--pl-alpha` : 0,30 en thème clair, 0,16 en sombre, dans styles/planning.css).
// Le moteur REFUSE une couleur qui rendrait le texte illisible (contraste < 4,5 dans un des deux
// thèmes), qui serait trop proche d'une autre famille du même planning, ou qui est verte (« juste »),
// bleue (le client, sur les vues de transport) ou rouge (« faux ») : la séance ne se charge pas, et la
// suite de tests le voit avant tout envoi. `teinte: 'a'` / `'b'` reste un raccourci (jaune / violet).
const RACCOURCIS = { a: { couleur: '#f0be00', nom: 'jaune' }, b: { couleur: '#8b5cf6', nom: 'violet' } };
const COULEUR_DEFAUT = '#b8a582';
// Ce qui s'écrit sur les cartes et les blocs, par thème : à garder égal à styles/planning.css et base.css.
export const FONDS_PLANNING = {
  clair: { panneau: '#fdfbf7', alpha: 0.30, textes: { encre: '#1a1915', 'encre douce': '#555047', ambre: '#7d4e07', rouge: '#9d2727' } },
  sombre: { panneau: '#1a222b', alpha: 0.16, textes: { encre: '#e4eaf0', 'encre douce': '#9aabbb', ambre: '#f0c070', rouge: '#ff8f8a' } },
};
const rgbDe = (h) => {
  let x = String(h || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(x)) x = x.split('').map((c) => c + c).join('');
  return /^[0-9a-f]{6}$/i.test(x) ? x.match(/../g).map((v) => parseInt(v, 16)) : null;
};
const lumiere = (rgb) => {
  const l = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * l(rgb[0]) + 0.7152 * l(rgb[1]) + 0.0722 * l(rgb[2]);
};
export const contraste = (a, b) => { const x = lumiere(a), y = lumiere(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const teinteDe = (rgb) => {
  const [r, g, b] = rgb.map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const l = (mx + mn) / 2, sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) h = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  return { h: (h + 360) % 360, sat };
};
const familleDe = (f) => Object.assign({}, (f && RACCOURCIS[f.teinte]) || {}, f || {});

// Les problèmes d'un jeu de familles, en clair (vide = tout va bien). Exportée pour les tests.
export function verifierCouleurs(familles) {
  const out = [], vus = [];
  Object.entries(familles || {}).forEach(([id, f0]) => {
    const f = familleDe(f0);
    if (!f.couleur) return;
    const rgb = rgbDe(f.couleur);
    if (!rgb) { out.push(`famille « ${id} » : « ${f.couleur} » n'est pas une couleur (écrire #rrggbb).`); return; }
    const { h, sat } = teinteDe(rgb);
    if (sat >= 0.25) {
      if (h < 15 || h >= 340) out.push(`famille « ${id} » : ${f.couleur} est rouge, couleur réservée à « faux ».`);
      else if (h >= 75 && h < 170) out.push(`famille « ${id} » : ${f.couleur} est verte, couleur réservée à « juste ».`);
      else if (h >= 180 && h < 250) out.push(`famille « ${id} » : ${f.couleur} est bleue, couleur réservée au client sur les vues de transport.`);
    }
    Object.entries(FONDS_PLANNING).forEach(([theme, T]) => {
      const pan = rgbDe(T.panneau);
      const fond = rgb.map((c, i) => T.alpha * c + (1 - T.alpha) * pan[i]);
      Object.entries(T.textes).forEach(([nom, t]) => {
        const c = contraste(rgbDe(t), fond);
        if (c < 4.5) out.push(`famille « ${id} » : avec ${f.couleur}, le texte ${nom} devient illisible en thème ${theme} (contraste ${(Math.floor(c * 100) / 100).toFixed(2).replace('.', ',')} au lieu de 4,5 au moins).`);
      });
    });
    vus.forEach(([id2, rgb2]) => {
      if (Math.hypot(rgb[0] - rgb2[0], rgb[1] - rgb2[1], rgb[2] - rgb2[2]) < 70) out.push(`familles « ${id2} » et « ${id} » : couleurs trop proches, on ne les distinguerait pas.`);
    });
    vus.push([id, rgb]);
  });
  return out;
}

export function creerPlanning(P, opts = {}) {
  const M = compiler(P);
  const { E } = M;
  const C = P.cartes || {};
  const AF = P.affectation || null;
  const ui = { sel: null, bulle: null, verif: null, confirmer: false, raz: false, refaire: false, focus: null, focusVue: null, prise: 0 };

  const tempsDe = (api) => (opts.copie ? 'evaluation' : P.temps || (api && api.temps) || 'guidage');
  const phaseDonnees = (e) => (e.phase === 1 || !P.alea ? 1 : 2);
  // La couleur de la famille, posée en variables sur la carte ou le bloc (le CSS en fait le fond et le trait).
  const teinte = (c) => (c.pause ? 'pl-pause' : 'pl-fam');
  const couleur = (c) => {
    if (c.pause) return '';
    const f = familleDe((P.familles || {})[c.famille]);
    const rgb = rgbDe(f.couleur) || rgbDe(COULEUR_DEFAUT);
    return `--pl-c:${rgb.join(',')};--pl-t:rgb(${rgb.join(',')});`;
  };
  const famLib = (c) => ((P.familles || {})[c.famille] || {}).legende || '';
  const nomLigne = (D, id) => (D.L[id] ? D.L[id].nom : '');
  const nomRes = (D, id) => (D.R[id] ? D.R[id].nom : '');
  const regle = (type) => (P.regles || []).find((R) => R.type === type);

  // Ce qui est montré selon le temps (brief §3.5).
  function regime(api) {
    const t = tempsDe(api);
    const g = t === 'guidage';
    const A = P.aides || {};
    return { t, g, eval: t === 'evaluation', entr: t === 'entrainement',
      fenetre: g && !!A.fenetre, detailDuree: g && A.detailDuree !== false && !!C.detailDuree,
      reprise: g && !!A.reprise, conduite: g && !!A.compteurConduite };
  }

  /* -------------------------------------------------------------- les gestes */
  // Poser (ou déplacer) une carte. Ligne imposée : elle va sur sa ligne, où qu'on la lâche. Toujours
  // calée dans la grille ; « semaine entière » : ramenée dans la semaine de son premier jour.
  function poser(e, D, id, r, s) {
    const c = D.C[id]; if (!c) return;
    if (c._ligne) r = c._ligne;
    if (!D.L[r]) return;
    s = Math.max(0, Math.min(E.n - c._L, Math.round(s)));
    if (C.semaineEntiere && E.semaine) {
      const fin = (Math.floor(s / E.semaine) + 1) * E.semaine;
      if (s + c._L > fin) s = Math.max(0, fin - c._L);
    }
    const p = e.place[id] || {};
    p.r = r; p.s = s;
    e.place[id] = p;
    ui.bulle = c._affecter && !p.k ? id : null;
  }
  function retirer(e, id) { delete e.place[id]; if (ui.bulle === id) ui.bulle = null; }
  function geste(e, api) {
    ui.verif = null; ui.confirmer = false; ui.raz = false;
    if (!e.premierGeste) e.premierGeste = Date.now();
    api.sauver(); api.redessiner();
  }

  function envoyer(e, api) {
    const v = { place: cp(e.place), at: Date.now() };
    if (!Array.isArray(e.envois)) e.envois = [];
    e.envois.push(v.at);
    ui.confirmer = false; ui.verif = null; ui.sel = null; ui.bulle = null; ui.raz = false;
    let final = true;
    if (e.phase === 1) {
      e.v1 = v;
      if (P.alea) {
        final = false;
        // L'aléa arrive par la messagerie : sauver fait passer les déclencheurs, dont celui qui ouvre
        // la phase 2. Sans déclencheur déclaré (ou déjà passé, après « Recommencer »), on y passe ici.
        api.sauver();
        if (e.phase === 1 && (e.aleaVu || !api.aleaParMessage)) { e.phase = 2; e.aleaVu = true; }
      } else e.phase = 'fini';
    } else {
      e.v2 = v; e.phase = 'fini';
    }
    api.sauver();
    if (final && tempsDe(api) === 'evaluation' && api.rendreCopie) api.rendreCopie();
    api.redessiner();
    if (api.haut) api.haut();
  }

  /* -------------------------------------------------------------------- html */
  const htmlMessage = (e) => (e.phase === 2 && P.alea
    ? `<div class="pl-message" data-pl-message><div class="pl-de">Message reçu — ${ech(P.alea.de || '')}</div>${P.alea.texte || ''}</div>` : '');
  function htmlConsigne(e, D, R) {
    const A = P.aides || {};
    const cons = A.consignes || {};
    const o = { guidage: R.g, phase: D.phase, lignes: D.lignes, ressources: D.ressources,
      reprise: (l) => { const r = regle('reposDepuisVeille'); const m = r ? repriseMinutes(r, l) : null; return m == null || !R.reprise ? null : hhmm(m); },
      h: E.lib, duree: E.fmt };
    const infos = typeof P.infos === 'function' ? P.infos(o) : (P.infos || []);
    const aides = R.g ? Object.values(cons) : (cons.regles ? [cons.regles] : []);
    return `${htmlMessage(e)}<div class="pl-panneau pl-consigne">
      <h3>${ech(P.titre || '')}</h3>${P.date ? `<div class="pl-lbl">${ech(P.date)}</div>` : ''}
      ${infos.length ? `<ul>${infos.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}
      ${aides.map((t) => `<div class="pl-aide">${t}</div>`).join('')}
    </div>`;
  }

  function htmlCarte(e, D, c, an, R) {
    const p = e.place[c.id];
    const pose = !!(p && p.s != null && (c._ligne || D.L[p.r]));
    const direct = R.g;
    const o = Object.assign(outils(E, D), { guidage: R.g, duree: E.fmt(c._L) });
    if (c.pause) {
      return `<div class="pl-carte pl-pause${ui.sel === c.id ? ' pl-sel' : ''}${pose ? ' pl-posee' : ''}" draggable="true" data-pl-id="${ech(c.id)}" data-pl-vue="b"
        tabindex="0" role="button" aria-label="${ech(c.titre)}${pose ? ', posée' : ''}">
        <b>${ech(c.titre)}</b><span class="pl-etat">${pose ? `${ech(nomLigne(D, p.r))}, ${ech(E.lib(p.s))} <button class="pl-lien" data-pl-act="retirer" data-pour="${ech(c.id)}">Retirer</button>`
          : ech(C.pauses.aPoser || 'À poser si besoin')}</span></div>`;
    }
    const det = typeof C.details === 'function' ? C.details(c, o) : (c.details || []);
    let dur = '';
    if (C.libDuree) {
      dur = `<span class="pl-det">${ech(C.libDuree)} : ${R.detailDuree ? `${ech(C.detailDuree(c))} → ` : ''}<b>${ech(E.fmt(c._L))}</b></span>`;
    }
    let etat;
    if (!pose) etat = ech(C.aPlacer || 'À placer');
    else {
      const s = p.s, fin = s + c._L;
      const decale = c._dem != null && !c._impose && s !== c._dem;
      etat = `Posé : ${c._ligne ? '' : `${ech(nomLigne(D, p.r))}, `}${ech(E.plage(s, fin))}${decale ? ' (décalé)' : ''}`;
      if (c._affecter) {
        const fk = direct && an.fauxK[c.id];
        etat += ` · <span class="${fk ? 'pl-faux-t' : ''}">${p.k && D.R[p.k] ? ech(nomRes(D, p.k)) : `<span class="pl-manque">${ech(AF.manque || '?')}</span>`}</span>
          <button class="pl-lien" data-pl-act="bulle" data-pour="${ech(c.id)}">${p.k ? 'Changer' : 'Choisir'} ${ech(AF.lien || '')}</button>`;
      }
      etat += ` <button class="pl-lien" data-pl-act="retirer" data-pour="${ech(c.id)}">Retirer</button>`;
    }
    return `<div class="pl-carte ${teinte(c)}${ui.sel === c.id ? ' pl-sel' : ''}${pose ? ' pl-posee' : ''}" style="${couleur(c)}" draggable="true" data-pl-id="${ech(c.id)}" data-pl-vue="b"
        tabindex="0" role="button" aria-label="${ech(c.titre)}${pose ? ', posée' : ''}">
      <b>${ech(c.titre)}${c.nouveau ? ' (nouveau)' : ''}</b>
      ${det.map((x) => `<span class="pl-det">${x}</span>`).join('')}${dur}
      <span class="pl-etat">${etat}</span>
    </div>`;
  }

  // Les blocs d'une ligne, rangés en « couloirs » : deux blocs qui se recouvrent ne se cachent pas.
  function couloirs(L) {
    const fins = [], r = {};
    L.slice().sort((a, b) => a.s - b.s).forEach((it) => {
      let k = fins.findIndex((f) => f <= it.s);
      if (k < 0) { k = fins.length; fins.push(0); }
      fins[k] = it.e; r[it.id] = k;
    });
    return r;
  }

  const colonnes = () => `grid-template-columns:${E.col1}px repeat(${E.n}, minmax(${E.largeur}px,1fr));min-width:${E.col1 + E.n * E.largeur}px`;
  const tetes = (cls = '') => `<div class="pl-coin" style="grid-row:1;grid-column:1"></div>${E.tetes.map((x) =>
    `<div class="pl-tete${E.type === 'jours' && E.fort(x.t) ? ' pl-fort' : ''}${cls}" style="grid-row:1;grid-column:${x.t + 2} / span ${x.span}">${ech(x.lib)}</div>`).join('')}`;

  function htmlGrille(e, D, an, R) {
    const direct = R.g;
    const sel = R.fenetre && ui.sel ? D.C[ui.sel] : null;
    const rRepos = regle('reposDepuisVeille');
    const plaf = regle('plafond');
    let h = `<div class="pl-grille" data-pl-grille style="${colonnes()}${ui.bulle ? ';padding-bottom:120px' : ''}">${tetes()}`;
    D.lignes.forEach((l, i) => {
      const r = i + 2;
      const rep = R.reprise && rRepos ? repriseSlot(rRepos, l, E) : null;
      let petit = l.note ? ech(l.note) : '';
      if (R.conduite && plaf) {
        const m = an.I.filter((x) => x.r === l.id && !x.c.pause).reduce((a, x) => a + E.minutes(x.c._L), 0);
        const hm = (v) => `${Math.floor(v / 60)} h${v % 60 ? ` ${pad2(v % 60)}` : ''}`;
        petit += `${petit ? ' · ' : ''}conduite ${Math.floor(m / 60)} h ${pad2(m % 60)} / ${hm(plaf.max)}`;
      }
      h += `<div class="pl-res" style="grid-row:${r}">${ech(l.nom)}${petit ? `<small>${petit}</small>` : ''}</div>`;
      for (let t = 0; t < E.n; t++) {
        const pasLa = t < l._debut || t >= l._fin;
        const repos = rep != null && t < rep;
        let fen = false;
        if (sel && !sel.pause) {
          if (E.type === 'jours') fen = (sel._ligne ? sel._ligne === l.id : true) && sel._dem != null && t >= sel._dem && t < sel._dem + sel._L;
          else fen = (sel._des == null || t >= sel._des) && (sel._avant == null || t < sel._avant) && (sel._des != null || sel._avant != null);
        }
        h += `<button class="pl-case${E.fort(t) ? ' pl-fort' : ''}${pasLa || repos ? ' pl-hors' : ''}${fen ? ' pl-fen' : ''}" style="grid-row:${r};grid-column:${t + 2}"
          data-pl-case data-r="${ech(l.id)}" data-t="${t}" tabindex="-1" aria-label="${ech(l.nom)}, ${ech(E.lib(t))}">${pasLa && E.type === 'jours' ? 'pas là' : ''}</button>`;
      }
      const ici = an.I.filter((x) => x.r === l.id);
      const cl = couloirs(ici);
      ici.forEach((x) => {
        const c = x.c, faux = direct && an.faux[c.id];
        const k = c._affecter ? (x.k ? ech(nomRes(D, x.k)) : `<span class="pl-manque">${ech(AF.manque || '?')}</span>`) : '';
        const lib = c.pause ? ech(c.court) : c._affecter ? `<b>${ech(c.id)}</b> ${k}` : ech(c.court);
        h += `<button class="pl-bloc ${teinte(c)}${cl[c.id] ? ' pl-decale' : ''}${faux ? ' pl-bloc-faux' : ''}${ui.sel === c.id ? ' pl-sel' : ''}" draggable="true"
          data-pl-id="${ech(c.id)}" data-pl-vue="g" style="${couleur(c)}grid-row:${r};grid-column:${x.s + 2} / span ${c._L}"
          title="${ech(c.titre)} ${ech(E.plage(x.s, x.e))}" aria-label="${ech(c.titre)}, ${ech(l.nom)}, ${ech(E.plage(x.s, x.e))}${faux ? ', problème' : ''}">${lib}</button>`;
        if (ui.bulle === c.id && c._affecter) h += htmlBulle(e, D, c, x, r);
      });
    });
    // Compteurs sous la grille (cas personnel) : visibles à tous les temps ; en rouge en direct seulement.
    let r0 = D.lignes.length + 2;
    (P.compteurs || []).forEach((K) => {
      const Rg = (P.regles || []).find((x) => x.id === K.regle) || {};
      const pr = an.presents();
      h += `<div class="pl-res pl-res-compte" style="grid-row:${r0}">${ech(K.lib)}</div>`;
      for (let t = 0; t < E.n; t++) {
        let v = '';
        if (K.valeur === 'presents') v = pr[t].length;
        else if (K.valeur === 'besoin') v = (Rg.besoin || [])[t];
        else if (K.valeur === 'filtre') v = pr[t].filter(Rg.filtre || (() => false)).length;
        const faux = direct && K.valeur !== 'besoin' && an.colFaux[K.regle] && an.colFaux[K.regle].has(t);
        h += `<div class="pl-compte${E.fort(t) ? ' pl-fort' : ''}${faux ? ' pl-compte-faux' : ''}" style="grid-row:${r0};grid-column:${t + 2}" data-pl-compte="${ech(K.valeur)}" data-t="${t}">${v == null ? '' : v}</div>`;
      }
      r0++;
    });
    return h + '</div>';
  }

  function htmlBulle(e, D, c, x, r) {
    const span = Math.min(E.n, Math.max(8, Math.ceil(380 / E.largeur)));
    const c0 = Math.max(0, Math.min(x.s, E.n - span));
    const p = e.place[c.id] || {};
    const q = String(AF.question || 'Quelle ressource pour {carte} ?').replace('{carte}', c.id);
    return `<div class="pl-bulle-ancre" style="grid-row:${r};grid-column:${c0 + 2} / span ${span}"><div class="pl-bulle" role="group" aria-label="${ech(q)}" data-pl-bulle="${ech(c.id)}">
      <span class="pl-q">${ech(q)} <span class="pl-lbl">(${famLib(c) ? `${ech(famLib(c))}, ` : ''}${ech(E.plage(x.s, x.e))})</span></span>
      ${D.ressources.map((k) => `<button class="pl-choix${p.k === k.id ? ' pl-choisi' : ''}" data-pl-choix="${ech(k.id)}" data-pour="${ech(c.id)}" aria-pressed="${p.k === k.id}">${p.k === k.id ? '✓ ' : ''}${ech(k.nom)}</button>`).join('')}
      <button class="pl-lien" data-pl-act="deplacer" data-pour="${ech(c.id)}">Déplacer</button><button class="pl-lien" data-pl-act="retirer" data-pour="${ech(c.id)}">Retirer</button><button class="pl-lien" data-pl-act="fermer">Fermer</button>
    </div></div>`;
  }

  // La grille en lecture seule, remplie par la seconde ressource (« Journée des caristes »).
  function htmlLecture(D, an, R) {
    const Lc = AF && AF.lecture;
    if (!Lc) return '';
    let h = `<div class="pl-panneau"><h3>${ech(Lc.titre || '')}</h3><div class="pl-zone"><div class="pl-grille pl-grille-lecture" data-pl-lecture style="${colonnes()}">${tetes()}`;
    D.ressources.forEach((k, i) => {
      const r = i + 2;
      h += `<div class="pl-res" style="grid-row:${r}">${ech(k.nom)}${k.note ? `<small>${ech(k.note)}</small>` : ''}</div>`;
      for (let t = 0; t < E.n; t++) h += `<div class="pl-case pl-lect${E.fort(t) ? ' pl-fort' : ''}${t < k._debut || t >= k._fin ? ' pl-hors' : ''}" style="grid-row:${r};grid-column:${t + 2}"></div>`;
      const ici = an.I.filter((x) => x.k === k.id && !x.c.pause);
      const cl = couloirs(ici);
      ici.forEach((x) => {
        const faux = R.g && an.fauxK[x.id];
        const lib = Lc.bloc ? Lc.bloc(x.c, D.L[x.r]) : `${x.c.id} ${nomLigne(D, x.r)}`;
        h += `<div class="pl-bloc pl-lect ${teinte(x.c)}${cl[x.id] ? ' pl-decale' : ''}${faux ? ' pl-bloc-faux' : ''}" data-pl-lect="${ech(x.id)}" style="${couleur(x.c)}grid-row:${r};grid-column:${x.s + 2} / span ${x.c._L}">${ech(lib)}</div>`;
      });
    });
    return h + `</div></div>${Lc.legende ? `<div class="pl-legende">${ech(Lc.legende)}</div>` : ''}</div>`;
  }

  function htmlProblemes(e, an, R) {
    let h;
    if (R.g) {
      h = an.P.length ? `<ul class="pl-problemes" data-pl-problemes>${an.P.map((p) => `<li>${ech(p)}</li>`).join('')}</ul>`
        : '<p class="pl-ok" data-pl-problemes>Aucun problème : le planning respecte toutes les règles.</p>';
    } else if (R.entr && ui.verif) {
      h = ui.verif.length ? `<ul class="pl-problemes" data-pl-problemes>${ui.verif.map((p) => `<li>${ech(p)}</li>`).join('')}</ul>`
        : '<p class="pl-ok" data-pl-problemes>Aucun problème trouvé.</p>';
    } else if (R.entr) {
      h = '<p class="pl-lbl">Cliquez sur « Vérifier mon planning » quand vous pensez avoir fini.</p>';
    } else {
      h = '<p class="pl-lbl">Évaluation : le site ne signale rien. Relisez les règles vous-même.</p>';
    }
    const final = e.phase === 2 || !P.alea;
    const lib = !final ? 'Envoyer le planning au chef'
      : R.eval ? (P.alea ? 'Envoyer le planning corrigé et rendre ma copie' : 'Envoyer le planning et rendre ma copie')
        : (P.alea ? 'Envoyer le planning corrigé' : 'Envoyer le planning au chef');
    return `<div class="pl-panneau"><h3>${e.phase === 2 ? 'Planning à reprendre' : 'Votre planning'}</h3>${h}
      <div class="pl-actions">
        ${R.entr ? '<button class="btn" data-pl="verifier">Vérifier mon planning</button>' : ''}
        <button class="btn btn-p" data-pl="envoyer">${lib}</button>
        ${ui.raz ? '<span class="pl-confirme">Tout effacer ? <button class="btn" data-pl="razOui">Oui, réinitialiser</button> <button class="btn" data-pl="razNon">Non</button></span>'
          : '<button class="btn" data-pl="raz">Réinitialiser le planning</button>'}
        ${ui.confirmer ? '<span class="pl-confirme">Il reste des problèmes. <button class="btn" data-pl="quandMeme">Envoyer quand même</button></span>' : ''}
      </div></div>`;
  }

  function htmlBilan(e, api, R) {
    const { L, ok, total } = jalonsPlanning({ plannings: { [P.id]: e } }, P);
    const table = `<table class="pl-bilan" data-pl-bilan><thead><tr><th>Version</th><th>Jalon</th><th></th></tr></thead><tbody>${L.map((l) =>
      `<tr><td>${ech(l.version)}</td><td>${ech(l.lib)}</td><td><span class="pl-pastille ${l.ok ? 'pl-oui' : 'pl-non'}" data-ok="${l.ok}">${l.ok ? '✓' : '✗'}</span></td></tr>`).join('')}</tbody></table>`;
    if (R.eval) {
      return `<div class="pl-panneau" data-pl-rendu><h3>Copie rendue</h3><p>Votre planning a été envoyé. Le résultat sera donné par votre enseignant.</p>
        ${api.estProf ? `<h3 class="pl-prof">Côté enseignant — ${ok} / ${total} jalons</h3>${table}` : ''}</div>`;
    }
    return `<div class="pl-panneau"><h3>Bilan — ${ok} / ${total} jalons</h3>${table}
      <div class="pl-actions">${ui.refaire
        ? '<span class="pl-confirme">Tout recommencer ? <button class="btn" data-pl="refaireOui">Oui, recommencer</button> <button class="btn" data-pl="refaireNon">Non</button></span>'
        : '<button class="btn" data-pl="refaire">Recommencer</button>'}</div></div>`;
  }

  function legendeCartes() {
    if (C.legende) return C.legende;
    const ou = AF ? ` : une bulle s'ouvre pour choisir ${AF.lien || 'la seconde ressource'}` : '';
    return `Glissez une carte sur le planning${ou}. Ou cliquez la carte, puis la case.${AF ? ' Sur le planning, cliquez un bloc pour rouvrir sa bulle ; pour le déplacer, glissez-le ou choisissez « Déplacer ».' : ''} Clavier : Entrée pour prendre une carte${AF ? ' (ou ouvrir la bulle sur le planning)' : ''}, Espace pour déplacer un bloc, flèches, Suppr pour retirer, Échap pour fermer.`;
  }
  // La légende des couleurs : une pastille de la couleur, son nom s'il est donné, et ce qu'elle désigne.
  function legendeFamilles() {
    const L = Object.values(P.familles || {}).map(familleDe).filter((f) => f.legende).map((f) => {
      const rgb = rgbDe(f.couleur) || rgbDe(COULEUR_DEFAUT);
      return `<span class="pl-puce" style="--pl-c:${rgb.join(',')};--pl-t:rgb(${rgb.join(',')})"></span>${f.nom ? `${ech(f.nom)} : ` : ''}${ech(f.legende)}`;
    });
    if (C.pauses) L.push('<span class="pl-puce pl-pause"></span>hachuré : pause');
    return L.join(' · ');
  }

  return {
    id: P.id,
    nav: { libelle: P.libelle || 'Planning' },
    etatNeuf,
    jalons: (db) => jalonsPlanning(db, P),
    note: P.note || opts.copie ? (db) => notePlanning(db, P) : null,
    alea: !!P.alea,
    // Le temps 2 s'ouvre avec le message de l'aléa (`phasePlanning: 2` d'un déclencheur, entreprise.js).
    passerPhase(e, n) {
      if (n >= 2 && e.phase === 1 && e.v1) e.phase = 2;
      if (n >= 2) e.aleaVu = true;
    },
    // Ce que l'environnement lit pour des tests et la page d'essai : le planning en cours, lu.
    lire(e) { const a = M.lire(e.place, phaseDonnees(e)); return { problemes: a.P, tous: a.tous }; },
    html(e, api) {
      const R = regime(api);
      if (!e.place) Object.assign(e, etatNeuf(), e);
      if (e.phase === 'fini') return `<div class="pl" data-planning="${ech(P.id)}" data-pl-temps="${R.t}"><div class="pl-plein">${htmlBilan(e, api, R)}</div></div>`;
      const D = M.D[phaseDonnees(e)];
      const an = analyser(P, E, D, e.place, null);
      if (ui.sel && !D.C[ui.sel]) ui.sel = null;
      if (ui.bulle && !(e.place[ui.bulle] && D.C[ui.bulle])) ui.bulle = null;
      const sel = R.fenetre && ui.sel ? D.C[ui.sel] : null;
      const F = (P.aides || {}).fenetre;
      const info = R.fenetre
        ? `<div class="pl-info-sel" data-pl-info>${sel && !sel.pause
          ? `<span class="pl-fen-ech"></span> ${(F && typeof F.carte === 'function') ? F.carte(sel, outils(E, D)) : `${ech(sel.titre)} : la bande ambrée montre où le placer.`}`
          : ech((F && F.invite) || 'Cliquez une carte : une bande ambrée montre où elle peut se placer.')}</div>` : '';
      const fam = legendeFamilles();
      // « Agrandir le planning » (04/10/2026, écrans étroits du lycée) : le menu de l'environnement et le
      // panneau des consignes se replient, la grille prend toute la largeur. Les consignes se rouvrent d'un
      // clic ; le message de l'aléa, lui, reste toujours visible (en tête de la colonne de droite).
      const grand = !!e.agrandi, voirConsignes = !grand || ui.consignes;
      const barre = `<div class="pl-barre">
          <button class="btn" data-pl="agrandir" data-libre aria-pressed="${grand}">${grand ? '⤡ Réduire le planning' : '⤢ Agrandir le planning'}</button>
          ${grand ? `<button class="btn" data-pl="consignes" data-libre aria-expanded="${!!ui.consignes}">${ui.consignes ? 'Masquer les consignes' : 'Voir les consignes'}</button>` : ''}
        </div>`;
      return `<div class="pl${grand ? ' pl-agrandi' : ''}${voirConsignes ? '' : ' pl-sans-consignes'}" data-planning="${ech(P.id)}" data-pl-temps="${R.t}" data-pl-phase="${e.phase}">
        ${voirConsignes ? `<aside class="pl-gauche">${htmlConsigne(e, D, R)}</aside>` : ''}
        <section class="pl-droite">${barre}${voirConsignes ? '' : htmlMessage(e)}
          <div class="pl-panneau"><h3>${ech(C.titre || 'Cartes')}</h3>
            <div class="pl-cartes" data-pl-bac>${D.toutes.map((c) => htmlCarte(e, D, c, an, R)).join('')}</div>
            <div class="pl-legende">${ech(legendeCartes())}</div></div>
          <div class="pl-panneau"><h3>${ech((P.lignes && P.lignes.titre) || 'Planning')}</h3>${info}
            <div class="pl-zone">${htmlGrille(e, D, an, R)}</div>
            ${fam ? `<div class="pl-legende" data-pl-legende-couleurs>${fam}</div>` : ''}${P.lignes && P.lignes.legende ? `<div class="pl-legende">${ech(P.lignes.legende)}</div>` : ''}</div>
          ${htmlLecture(D, an, R)}
          ${htmlProblemes(e, an, R)}
        </section>
      </div>`;
    },
    brancher(z, e, api) {
      const R = regime(api);
      const racine = z.querySelector('.pl');
      if (!racine) return;
      const D = M.D[phaseDonnees(e)];
      const redessiner = () => api.redessiner();
      const on = (cle, fn) => racine.querySelectorAll(`[data-pl="${cle}"]`).forEach((b) => b.addEventListener('click', fn));
      // Le menu de l'environnement se replie avec le planning agrandi. Changer d'écran redessine tout
      // l'environnement (`aller` dans entreprise.js) : les autres écrans retrouvent leur menu.
      const coque = racine.closest('.ent-shell');
      if (coque) coque.classList.toggle('pl-agrandi', !!e.agrandi && e.phase !== 'fini');
      on('agrandir', () => { e.agrandi = !e.agrandi; ui.consignes = false; ui.focus = { pl: 'agrandir' }; api.sauver(); redessiner(); });
      on('consignes', () => { ui.consignes = !ui.consignes; ui.focus = { pl: 'consignes' }; redessiner(); });

      // Le bilan : recommencer en deux clics (la version envoyée et l'aléa reçu restent acquis).
      on('refaire', () => { ui.refaire = true; redessiner(); });
      on('refaireNon', () => { ui.refaire = false; redessiner(); });
      on('refaireOui', () => {
        ui.refaire = false; ui.sel = null; ui.bulle = null;
        const garde = { aleaVu: e.aleaVu || !!e.v1, verifs: e.verifs || 0, envois: e.envois || [], premierGeste: e.premierGeste, agrandi: !!e.agrandi };
        Object.keys(e).forEach((k) => delete e[k]);
        Object.assign(e, etatNeuf(), garde);
        api.sauver(); redessiner();
      });
      if (e.phase === 'fini') return;

      // Le focus suit l'élève qui travaille au clavier, d'un redessin à l'autre.
      racine.addEventListener('focusin', (ev) => {
        const t = ev.target.closest && ev.target.closest('[data-pl-id]');
        if (t) ui.focus = { id: t.dataset.plId, vue: t.dataset.plVue };
        else if (ev.target.dataset && ev.target.dataset.pl) ui.focus = { pl: ev.target.dataset.pl };
      });
      if (clavier && ui.focus) {
        const f = ui.focus;
        const vue = ui.focusVue || f.vue; ui.focusVue = null;
        const el = f.pl ? racine.querySelector(`[data-pl="${f.pl}"]`)
          : (racine.querySelector(`[data-pl-id="${CSS.escape(f.id)}"][data-pl-vue="${vue}"]`) || racine.querySelector(`[data-pl-id="${CSS.escape(f.id)}"]`));
        if (el) el.focus({ preventScroll: false });
      }
      // La bulle ouverte reste dans la zone visible.
      const bu = racine.querySelector('.pl-bulle');
      if (bu && ui.ouvrirBulle) { ui.ouvrirBulle = false; bu.scrollIntoView({ block: 'nearest', inline: 'nearest' }); if (clavier) bu.querySelector('.pl-choix')?.focus(); }

      const grille = racine.querySelector('[data-pl-grille]');
      const caseSous = (x, y) => (typeof document.elementsFromPoint === 'function' ? document.elementsFromPoint(x, y) : []).find((el) => el.dataset && el.dataset.plCase !== undefined && grille.contains(el));
      const largeur = () => { const c = grille.querySelector('[data-pl-case]'); return c ? c.getBoundingClientRect().width : E.largeur; };
      const fait = () => geste(e, api);

      // Les actions du panneau « Votre planning ».
      on('verifier', () => {
        ui.verif = M.lire(e.place, phaseDonnees(e)).P;
        e.verifs = (e.verifs || 0) + 1; api.sauver(); redessiner();
      });
      on('envoyer', () => {
        if (R.g && M.lire(e.place, phaseDonnees(e)).P.length && !ui.confirmer) { ui.confirmer = true; redessiner(); return; }
        envoyer(e, api);
      });
      on('quandMeme', () => envoyer(e, api));
      on('raz', () => { ui.raz = true; redessiner(); });
      on('razNon', () => { ui.raz = false; redessiner(); });
      // Réinitialiser : vide le planning EN COURS, jamais la version déjà envoyée.
      on('razOui', () => { e.place = {}; ui.sel = null; ui.bulle = null; fait(); });

      // Les liens des cartes et de la bulle.
      racine.querySelectorAll('[data-pl-act]').forEach((b) => b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const id = b.dataset.pour, act = b.dataset.plAct;
        if (act === 'retirer') { retirer(e, id); ui.sel = null; fait(); }
        else if (act === 'bulle') { ui.bulle = id; ui.sel = null; ui.ouvrirBulle = true; redessiner(); }
        else if (act === 'deplacer') { ui.sel = id; ui.bulle = null; redessiner(); }
        else if (act === 'fermer') { ui.bulle = null; redessiner(); }
      }));
      racine.querySelectorAll('[data-pl-choix]').forEach((b) => b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const id = b.dataset.pour;
        if (!e.place[id]) return;
        e.place[id].k = b.dataset.plChoix; ui.bulle = null;
        ui.focus = { id, vue: 'g' };
        fait();
      }));
      if (bu) {
        bu.addEventListener('keydown', (ev) => {
          if (ev.key !== 'Escape') return;
          ev.stopPropagation(); ev.preventDefault();
          const id = ui.bulle; ui.bulle = null; ui.focus = { id, vue: 'g' };
          redessiner();
        });
      }

      // Cartes et blocs : glisser, cliquer, clavier.
      racine.querySelectorAll('[data-pl-id]').forEach((el) => {
        const id = el.dataset.plId, vue = el.dataset.plVue, c = D.C[id];
        if (!c) return;
        el.addEventListener('dragstart', (ev) => {
          ev.dataTransfer.setData('text/plain', id);
          ev.dataTransfer.effectAllowed = 'move';
          ui.prise = vue === 'g' ? Math.max(0, Math.floor((ev.clientX - el.getBoundingClientRect().left) / largeur())) : 0;
          ui.sel = id;
          if (R.fenetre) setTimeout(() => surligner(racine, c), 0);
        });
        el.addEventListener('click', (ev) => {
          if (ev.target.closest('.pl-lien')) return;
          // Une carte « en main » se pose sur la case visée, même si un bloc y est déjà dessiné.
          if (vue === 'g' && ui.sel) {
            const cs = caseSous(ev.clientX, ev.clientY);
            const p = e.place[ui.sel];
            if (cs && (ui.sel !== id || !p || +cs.dataset.t !== p.s || cs.dataset.r !== (D.C[ui.sel]._ligne || p.r))) {
              poser(e, D, ui.sel, cs.dataset.r, +cs.dataset.t); ui.sel = null; fait(); return;
            }
          }
          if (vue === 'g' && c._affecter && ui.sel !== id) {
            ui.bulle = ui.bulle === id ? null : id; ui.sel = null; ui.ouvrirBulle = !!ui.bulle; redessiner(); return;
          }
          ui.sel = ui.sel === id ? null : id; ui.bulle = null; redessiner();
        });
        el.addEventListener('keydown', (ev) => {
          if (ev.target !== el) return;
          const k = ev.key;
          if (k === 'Escape') { if (ui.sel || ui.bulle) { ui.sel = null; ui.bulle = null; redessiner(); } return; }
          if (vue === 'b' && (k === 'Enter' || k === ' ')) { ev.preventDefault(); ui.sel = ui.sel === id ? null : id; ui.bulle = null; redessiner(); return; }
          if (vue === 'g' && k === 'Enter' && c._affecter && ui.sel !== id) { ev.preventDefault(); ui.bulle = id; ui.ouvrirBulle = true; redessiner(); return; }
          if (vue === 'g' && (k === ' ' || k === 'Enter') && ui.sel !== id) { ev.preventDefault(); ui.sel = id; ui.bulle = null; redessiner(); return; }
          if (ui.sel !== id) return;
          if (k === 'Delete' || k === 'Backspace') { ev.preventDefault(); retirer(e, id); ui.sel = null; ui.focus = { id, vue: 'b' }; fait(); return; }
          const p = e.place[id];
          const lignes = D.lignes.map((l) => l.id);
          if (!p) {
            if (k === 'ArrowDown') {
              ev.preventDefault();
              const s = c._dem != null ? c._dem : c._des != null ? c._des : 0;
              poser(e, D, id, c._ligne || lignes[0], s); ui.focusVue = 'g'; fait();
            }
            return;
          }
          let s = p.s, i = lignes.indexOf(c._ligne || p.r);
          if (k === 'ArrowRight') s++;
          else if (k === 'ArrowLeft') s--;
          else if (k === 'ArrowDown') i = Math.min(lignes.length - 1, i + 1);
          else if (k === 'ArrowUp') i = Math.max(0, i - 1);
          else return;
          ev.preventDefault();
          poser(e, D, id, lignes[i], s); ui.focusVue = 'g'; fait();
        });
      });

      grille.addEventListener('dragover', (ev) => ev.preventDefault());
      grille.addEventListener('drop', (ev) => {
        ev.preventDefault();
        const id = ev.dataTransfer.getData('text/plain');
        const cs = caseSous(ev.clientX, ev.clientY);
        if (!cs || !D.C[id]) return;
        poser(e, D, id, cs.dataset.r, +cs.dataset.t - ui.prise); ui.sel = null; ui.prise = 0; fait();
      });
      grille.querySelectorAll('[data-pl-case]').forEach((el) => el.addEventListener('click', () => {
        if (!ui.sel) { if (ui.bulle) { ui.bulle = null; redessiner(); } return; }
        poser(e, D, ui.sel, el.dataset.r, +el.dataset.t); ui.sel = null; fait();
      }));
      // Reposer une carte dans le bloc des cartes = la retirer du planning.
      const bac = racine.querySelector('[data-pl-bac]');
      bac.addEventListener('dragover', (ev) => ev.preventDefault());
      bac.addEventListener('drop', (ev) => {
        ev.preventDefault();
        const id = ev.dataTransfer.getData('text/plain');
        if (!e.place[id]) { ui.sel = null; redessiner(); return; }
        retirer(e, id); ui.sel = null; fait();
      });
    },
  };

  // Guidage : la bande ambrée de la carte prise, posée pendant le glisser sans redessiner.
  function surligner(racine, c) {
    racine.querySelectorAll('[data-pl-grille] [data-pl-case]').forEach((el) => {
      const t = +el.dataset.t;
      let fen = false;
      if (!c.pause) {
        if (E.type === 'jours') fen = (!c._ligne || c._ligne === el.dataset.r) && c._dem != null && t >= c._dem && t < c._dem + c._L;
        else fen = (c._des != null || c._avant != null) && (c._des == null || t >= c._des) && (c._avant == null || t < c._avant);
      }
      el.classList.toggle('pl-fen', fen);
    });
  }
}
