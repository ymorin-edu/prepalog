// Mode « palettier » de la vue Plan d'entrepôt : ranger À L'ADRESSE DONNÉE par le système (chantier E-7, lot 1,
// 21/10/2026, brief `docs/briefs/MOTEUR-palettier-adresse-donnee.md` et décisions du chef `docs/briefs/COORDINATION-palettier.md` §3).
//
// Chez Action (CAP), c'est le SYSTÈME qui donne l'adresse : l'élève lit l'adresse sur la palette, va à l'emplacement, le
// regarde de près, puis pose au sol (niveau 1) ou confie la palette au cariste au-dessus du sol ; s'il ne peut pas ranger
// là, il signale. C'est l'inverse du mode `rangement` (Smoby, ENT-5.5 : l'élève choisit d'après des critères), d'où un
// mode à part, dans son fichier : il EMPRUNTE à `entrepot.js` le plan vu de dessus, la travée de face, les adresses, la
// charge d'un niveau (`chargeNiveau`), les occupants et les emplacements hors service, comme le fait la visite. Rien du
// dessin de Smoby ne change : la travée de face n'a gagné que des réglages, chacun absent = le dessin d'avant.
//
// Une déclaration (exemple complet : `contenus/palettier-essai.js`, page d'essai `outils/essai-palettier.html`) :
//
//   entrepot: {
//     id, libelle, mode: 'palettier',
//     personnage: { nom, role, date, texte },            // texte : une chaîne, ou { guidage, entrainement, evaluation }
//     plan: { allees, cotes: { A1: { charge: { 2: 1500, 3: 1200, 4: 1000 } } }, travees, niveaux (≤ 4), emplacements,
//             horsService, zones: { quais } },            // comme le rangement ; le sol (N1) n'a ni plaque ni limite
//     produits: { LES: { nom, court? } }, stock: { 'A1-T01-N1-E1': { produit: 'LES', kg: 493 } },   // pas de gammes
//     palettes: [
//       { id: 'P1', nom: 'Lessive liquide 3 L', cartons: 24, kg: 13, adresse: 'A1-T03-N1-E2' },   // kg : UN carton
//       { id: 'P5', …, adresse: 'A1-T02-N3-E2', nouvelleAdresse: 'A1-T04-N2-E3' },  // à signaler ; le système donne la nouvelle
//       { id: 'P7', …, adresse: '…', aSignaler: true },                             // à signaler, sans nouvelle adresse
//       { id: 'P6', …, niveaux: ['confirme'] },                                       // présente au confirmé seulement : jalons bonus
//     ],
//     cariste: { nom: 'Kevin', niveaux: [2, 3, 4], monte: 'validation' },   // monte : 'validation' (défaut) ou (db) => booléen
//     aideCharge: 'somme' | 'pose' | 'plaque',   // vue de près : plaque + déjà posé + somme / plaque + déjà posé / plaque seule (défaut)
//     verdict: 'critere' | 'adresse',            // après « Valider » : nom du critère faux / critère et adresse attendue ; absent = rien
//     regles: { titre?, entete?, lignes: [html…], encadre? },   // « Les règles ▾ » (jamais en copie)
//   }
//
// Le poids d'une palette = cartons × kg + 25 (le support), CALCULÉ ici (ENT-8.11 §6), jamais recopié.
//
// GESTES publiés (tous inscrits dans `signaux`, préfixés `entrepot:<id>:`) : `prendre:<P>` (palette prise en main, en
// réception ou reprise), `poser:<P>` (pose réussie au sol), `confier:<P>` (confiée au cariste), `signaler:<P>`, `ouvrir`
// (toute ouverture d'un emplacement de près, publiée à chaque fois : `api.signal` ne retient que la première), `valider`.
// Après « Valider », plus aucun geste.
//
// L'ÉTAT, dans `db.entrepots[<id>]` (cloisonné par séance), lu par les lots 2 à 6 :
//   { enMain: 'P1' | null, posees: { P1: 'A1-T03-N1-E2' }, confiees: { P3: 'A2-T02-N3-E1' },
//     signalees: { P5: { motif: 'charge', adresse: 'A1-T02-N3-E2' } }, nouvelles: { P5: 'A1-T04-N2-E3' },
//     tentativesHaut: 0, valide: false, at: null, premierGeste: null }
// Une palette confiée est MONTÉE (dessinée à son emplacement) quand Kevin la monte : à la validation (`monte: 'validation'`),
// ou dès que `monte(db)` est vrai, relu à chaque dessin. Ce n'est pas rangé dans l'état : c'est calculé (`montees`).
//
// JALONS (ids stables ; `attente` avant « Valider », `ok` / `ko` après, jamais `attente` après) :
//   `place-<P>`   palette à ranger : posée au sol, ou confiée, À SON ADRESSE ; signalée à tort (son adresse était possible) = ko ;
//   `signale-<P>` palette à signaler (`nouvelleAdresse` ou `aSignaler`) : signalée DEPUIS son adresse, avec un motif vrai,
//                 non rangée à son adresse d'origine, puis (si le système a donné une nouvelle adresse) rangée à la nouvelle ;
//   `pasPoseHaut` aucune tentative de pose au-dessus du sol, et toutes les palettes traitées (posée, confiée ou signalée) ;
//   `charge`      aucune palette posée ou confiée au-delà d'une plaque, et toutes les palettes traitées.
// Les jalons d'une palette `niveaux: ['confirme']` sont `bonus: true`. LA VÉRITÉ d'un emplacement (`verite`) : hors service
// → `abime` ; stock de départ ou une autre palette de l'élève (à la fin) → `occupe` ; charge du niveau (stock + toutes les
// autres palettes de l'élève, à la fin) + la palette > plaque → `charge`. `autre` n'est jamais vrai.

import { ech, pad2 } from '../texte.js';
import { niveauEleve, graineDeBase, NIVEAUX_ELEVE } from '../tirage.js';

const nb = (n) => Number(n).toLocaleString('fr-FR');
const kg = (n) => `${nb(n)} kg`;
const decoupe = (a) => {
  const m = /^([A-Z]+\d+)-T(\d+)-N(\d+)-E(\d+)$/.exec(String(a || ''));
  return m ? { c: m[1], t: +m[2], n: +m[3], e: +m[4] } : null;
};

// Les motifs d'un signalement, dans l'ordre des boutons (au « tu »).
export const MOTIFS = [['occupe', 'C’est occupé'], ['charge', 'La charge serait dépassée'], ['abime', 'L’emplacement est abîmé'], ['autre', 'Autre']];
const MOTIF_IDS = MOTIFS.map((m) => m[0]);
export const AIDES_CHARGE = ['somme', 'pose', 'plaque'];
export const VERDICTS = ['critere', 'adresse'];
// Le support d'une palette (ENT-8.11 §6) et le poids d'une palette chargée, calculé, arrondi au centième.
export const SUPPORT_KG = 25;
export const poidsPalette = (cartons, kgCarton) => Math.round((cartons * kgCarton + SUPPORT_KG) * 100) / 100;

/* ================================================================ compilation */
// Appelée par `compiler` (entrepot.js) après le plan, le stock et les produits, qui sont ceux du rangement. Remplit `M.pal`
// (le même objet que lisent `chargeNiveau` et `occupant` : le poids d'une palette y est son poids TOTAL), et pose
// `M.cariste`, `M.aide`, `M.verdict`, `M.jalons`. Une déclaration fautive ne se charge pas.
export function compilerPalettier(M, err) {
  const P = M.P;
  if (!Array.isArray(P.palettes) || !P.palettes.length) err('aucune palette à ranger (palettes)');
  const C = P.cariste;
  let cariste = null;
  if (C) {
    if (!C.nom) err('cariste : il manque le nom');
    const tous = []; for (let n = 2; n <= M.N; n++) tous.push(n);
    const niveaux = C.niveaux || tous;
    if (!Array.isArray(niveaux) || !niveaux.length || niveaux.some((n) => !tous.includes(n))) err(`cariste : niveaux à choisir parmi ${tous.join(', ')} (le sol, N1, c'est l'élève)`);
    if (C.monte != null && C.monte !== 'validation' && typeof C.monte !== 'function') err('cariste.monte : « validation » ou une fonction de la base (db) => vrai / faux');
    cariste = { nom: String(C.nom), role: C.role || 'cariste', niveaux: niveaux.slice(), monte: C.monte == null ? 'validation' : C.monte };
  }
  const prises = new Map();   // adresse → palette qui la déclare (adresse ou nouvelle adresse)
  const verifierAdresse = (ou, a, quoi) => {
    const d = decoupe(a);
    if (!d || !M.existe.has(a)) err(`${ou} : ${quoi} inconnue (${a})`);
    if (prises.has(a)) err(`${ou} : ${quoi} ${a} est déjà celle de ${prises.get(a)}`);
    return d;
  };
  P.palettes.forEach((p, i) => {
    const ou = `palette ${p && p.id ? p.id : `n° ${i + 1}`}`;
    if (!p || !p.id) err(`${ou} : il manque un id`);
    if (M.pal[p.id]) err(`${ou} déclarée deux fois`);
    if (!p.nom) err(`${ou} : il manque le nom`);
    if (!(Number.isInteger(p.cartons) && p.cartons > 0)) err(`${ou} : cartons (un nombre entier de cartons)`);
    if (!(p.kg > 0)) err(`${ou} : kg (le poids d'UN carton)`);
    const d = verifierAdresse(ou, p.adresse, 'adresse');
    prises.set(p.adresse, p.id);
    const aSignaler = p.nouvelleAdresse != null || p.aSignaler === true;
    if (p.nouvelleAdresse != null) {
      const dn = verifierAdresse(ou, p.nouvelleAdresse, 'nouvelle adresse');
      prises.set(p.nouvelleAdresse, p.id);
      if (dn.n > 1 && !(cariste && cariste.niveaux.includes(dn.n))) err(`${ou} : sa nouvelle adresse est au niveau N${dn.n}, que le cariste ne dessert pas`);
    }
    if (!aSignaler && d.n > 1 && !(cariste && cariste.niveaux.includes(d.n))) err(`${ou} : son adresse est au niveau N${d.n}, que le cariste ne dessert pas (déclarer « cariste »)`);
    if (p.niveaux != null && !(Array.isArray(p.niveaux) && p.niveaux.length === 1 && p.niveaux[0] === 'confirme')) {
      err(`${ou} : niveaux — seul ['confirme'] est prévu (une palette bonus du confirmé), parmi ${NIVEAUX_ELEVE.join(', ')}`);
    }
    M.pal[p.id] = { id: p.id, nom: String(p.nom), cartons: p.cartons, kgCarton: p.kg, kg: poidsPalette(p.cartons, p.kg),
      adresse: p.adresse, nouvelleAdresse: p.nouvelleAdresse || null, aSignaler, niveaux: p.niveaux ? p.niveaux.slice() : null,
      bonus: !!p.niveaux };
  });
  if (!Object.values(M.pal).some((p) => !p.bonus)) err('toutes les palettes sont des bonus du confirmé : il en faut au moins une pour tous');
  const aide = P.aideCharge == null ? 'plaque' : P.aideCharge;
  if (!AIDES_CHARGE.includes(aide)) err(`aideCharge : ${AIDES_CHARGE.join(', ')} (absent = plaque)`);
  if (P.verdict != null && !VERDICTS.includes(P.verdict)) err(`verdict : ${VERDICTS.join(', ')} (absent = rien)`);
  const jalons = [];
  Object.values(M.pal).forEach((p) => {
    const b = p.bonus ? { bonus: true } : {};
    jalons.push(p.aSignaler
      ? { id: `signale-${p.id}`, type: 'signale', palette: p.id, lib: `${p.id} signalée avec le bon motif (${p.nom})`, ...b }
      : { id: `place-${p.id}`, type: 'place', palette: p.id, lib: `${p.id} rangée à son adresse (${p.nom})`, ...b });
  });
  jalons.push({ id: 'pasPoseHaut', type: 'pasPoseHaut', lib: 'Aucune palette posée soi-même au-dessus du sol' });
  jalons.push({ id: 'charge', type: 'charge', lib: 'Aucune plaque de charge dépassée' });
  Object.assign(M, { cariste, aide, verdict: P.verdict || null, jalons });
}

/* ==================================================================== le modèle */
export const etatPalettierNeuf = () => ({ enMain: null, posees: {}, confiees: {}, signalees: {}, nouvelles: {}, tentativesHaut: 0,
  valide: false, at: null, premierGeste: null });
const normal = (e) => Object.assign(etatPalettierNeuf(), e || {});
// Une palette est-elle là pour cet élève ? (`niveaux: ['confirme']` : au confirmé seulement.)
const presente = (p, niveau) => !p.niveaux || p.niveaux.includes(niveau);
export const presentes = (M, niveau) => Object.values(M.pal).filter((p) => presente(p, niveau));
// Où est chaque palette rangée à la fin : posée au sol, ou confiée (son emplacement de destination).
export const placement = (e) => Object.assign({}, e.posees || {}, e.confiees || {});
const traitee = (e, pl, id) => !!(pl[id] || (e.signalees || {})[id]);
const plaqueDe = (M, d) => M.cotes[d.c].charge[d.n];

// La VÉRITÉ d'un emplacement `a` pour la palette `p` : ce qui empêche vraiment de l'y ranger, d'après le stock de départ et ce
// que l'élève a rangé ailleurs (`pl`, sans compter `p`). Vide = l'adresse était possible.
export function verite(M, pl, p, a) {
  const d = decoupe(a);
  if (!d) return [];
  const F = [];
  if (M.hs.has(a)) F.push('abime');
  if (M.stock[a] || Object.keys(pl).some((id) => id !== p.id && pl[id] === a)) F.push('occupe');
  if (d.n > 1 && M.chargeNiveau(pl, d, p.id) + p.kg > plaqueDe(M, d) + 1e-9) F.push('charge');
  return F;
}
// La palette `p` est-elle rangée (posée ou confiée) sur un niveau dont elle fait dépasser la plaque ?
function depasse(M, pl, p) {
  const d = decoupe(pl[p.id]);
  return !!d && d.n > 1 && M.chargeNiveau(pl, d, p.id) + p.kg > plaqueDe(M, d) + 1e-9;
}
// Les critères faux d'une palette, d'après l'état (les noms montrés après « Valider ») : 'signalement', 'adresse',
// 'plaque de charge'. Le lot 2 ajoutera 'scan'.
export function fautesPalette(M, e, p) {
  e = normal(e);
  const pl = placement(e), s = e.signalees[p.id], ou = pl[p.id];
  const F = [];
  if (!p.aSignaler) {
    if (s && !verite(M, pl, p, p.adresse).length) F.push('signalement');
    if (ou !== p.adresse) F.push('adresse');
  } else {
    if (!(s && s.adresse === p.adresse && verite(M, pl, p, p.adresse).includes(s.motif))) F.push('signalement');
    const nouvelle = e.nouvelles[p.id];
    if (ou === p.adresse || (nouvelle && ou !== nouvelle)) F.push('adresse');
  }
  if (depasse(M, pl, p)) F.push('plaque de charge');
  return F;
}

// Les jalons d'un état, pour un élève de niveau `niveau` (les palettes absentes pour lui n'ont pas de jalon).
export function jalonsPalettier(M, e, niveau = 'standard') {
  e = normal(e);
  const ps = presentes(M, niveau), ids = new Set(ps.map((p) => p.id));
  const pl = placement(e), v = !!e.valide;
  const toutes = ps.every((p) => traitee(e, pl, p.id));
  return M.jalons.filter((j) => !j.palette || ids.has(j.palette)).map((j) => {
    let ok;
    if (j.palette) {
      const F = fautesPalette(M, e, M.pal[j.palette]);
      ok = !F.includes('adresse') && !F.includes('signalement');
    } else if (j.type === 'pasPoseHaut') ok = toutes && !(e.tentativesHaut > 0);
    else ok = toutes && !ps.some((p) => depasse(M, pl, p));
    return { id: j.id, lib: j.lib, palette: j.palette || null, bonus: !!j.bonus, ok: v && ok, etat: v ? (ok ? 'ok' : 'ko') : 'attente' };
  });
}

// Le détail rangé avec la note (l'enseignant le lit).
export function detailPalettier(M, e, L) {
  e = normal(e);
  return { jalons: L.map((l) => ({ jalon: l.lib, ok: l.ok, etat: l.etat, ...(l.bonus ? { bonus: true } : {}) })),
    posees: Object.assign({}, e.posees), confiees: Object.assign({}, e.confiees),
    signalees: Object.fromEntries(Object.entries(e.signalees).map(([id, s]) => [id, s.motif])),
    tentativesHaut: e.tentativesHaut || 0, valide: !!e.valide, premierGeste: e.premierGeste || null };
}

// Ce qu'attend chaque palette, sur le stock de départ (enseignant, page d'essai ; JAMAIS montré à l'élève).
export function attendusPalettier(M) {
  return Object.fromEntries(Object.values(M.pal).map((p) => {
    const d = decoupe(p.adresse);
    const x = p.aSignaler ? { signaler: verite(M, {}, p, p.adresse), puis: p.nouvelleAdresse }
      : { adresse: p.adresse, geste: d.n === 1 ? 'poser' : 'confier' };
    if (p.bonus) x.niveaux = p.niveaux.slice();
    return [p.id, x];
  }));
}

// Les palettes que le cariste a montées : toutes les confiées, à la validation (défaut) ou dès que `monte(db)` est vrai.
export function montees(M, e, db) {
  const C = M.cariste;
  e = normal(e);
  if (!C) return [];
  let ok;
  if (typeof C.monte === 'function') { try { ok = !!C.monte(db || {}); } catch (x) { ok = false; } } else ok = !!e.valide;
  return ok ? Object.keys(e.confiees) : [];
}

// LU PAR UNE SÉANCE (exports d'`entrepot.js`) : les palettes confiées (les phrases du message à Kevin), l'état en clair.
export function confieesPalettier(M, e, niveau = 'standard') {
  e = normal(e);
  return presentes(M, niveau).filter((p) => e.confiees[p.id]).map((p) => ({ id: p.id, nom: p.nom, adresse: e.confiees[p.id] }));
}
export function etatLisiblePalettier(M, e, db) {
  e = normal(e);
  return { enMain: e.enMain || null, posees: Object.assign({}, e.posees), confiees: Object.assign({}, e.confiees),
    signalees: Object.fromEntries(Object.entries(e.signalees).map(([id, s]) => [id, s.motif])),
    nouvelles: Object.assign({}, e.nouvelles), montees: montees(M, e, db), tentativesHaut: e.tentativesHaut || 0, valide: !!e.valide };
}

// La déclaration d'un élève quand la séance passe une FONCTION `(graine, { niveau, copie })` (lot 0) : la même que celle
// que construit le moteur pour sa base (graine et niveau lus dans la base), gardée par graine, niveau et copie.
const TIRES = new WeakMap();
export function declarationDe(E, db, { copie = false } = {}) {
  if (typeof E !== 'function') return E;
  const g = graineDeBase(db), niveau = niveauEleve(db, { copie });
  let C = TIRES.get(E);
  if (!C) TIRES.set(E, (C = new Map()));
  const k = `${g}|${niveau}|${copie ? 1 : 0}`;
  if (!C.has(k)) C.set(k, E(g, { niveau, copie }));
  return C.get(k);
}

/* ======================================================================= la vue */
// `O` : ce que prête `creerEntrepot` — la géométrie du plan (`G`, `AW`), le plan et la travée de face déjà écrits
// (`htmlPlan`, `htmlFace`), l'état d'écran partagé (`ui` : `trav`, `anim`, `focus`, `main`), Échap, le clavier.
export function creerPalettier(P, M, opts, O) {
  const ui = O.ui, G = O.G;
  Object.assign(ui, { pres: null, signaler: false, journal: [], confirmer: false, msg: '', msgType: '' });
  const COPIE = !!opts.copie;
  const C = M.cariste, NOM = C ? C.nom : 'le cariste';
  const geste = (n) => `entrepot:${P.id}:${n}`;
  const signaux = [...Object.keys(M.pal).flatMap((id) => ['prendre', 'poser', 'confier', 'signaler'].map((x) => geste(`${x}:${id}`))),
    geste('ouvrir'), geste('valider')];

  function regime(api, e) {
    const rendue = !!(api && api.copieRendue && api.copieRendue());
    return { copie: COPIE, rendue, fige: !!e.valide || rendue, prof: !!(api && api.estProf),
      niveau: niveauEleve(api && api.db, { copie: COPIE }),
      temps: COPIE ? 'evaluation' : (P.temps || (api && api.temps) || 'guidage') };
  }
  // Ce que chaque dessin recalcule : les palettes de l'élève, où tout est rangé, ce que Kevin a monté.
  function calcul(e, R, api) {
    const ps = presentes(M, R.niveau);
    return { ps, ids: new Set(ps.map((p) => p.id)), pl: placement(e), montees: montees(M, e, api && api.db) };
  }
  function normaliser(e) {
    if (!e.posees) Object.assign(e, etatPalettierNeuf(), e);
    ['posees', 'confiees', 'signalees', 'nouvelles'].forEach((k) => { if (!e[k]) e[k] = {}; });
  }

  /* ------------------------------------------------------------- les gestes */
  const dire = (t, type) => { ui.msg = t; ui.msgType = type || ''; };
  // LE SYSTÈME parle : une ligne de l'encart « Système ». Le lot 2 rebranchera cette fonction sur le Terminal.
  function direSysteme(texte) { ui.journal.push(texte); if (ui.journal.length > 4) ui.journal.shift(); }
  const noterGeste = (e) => { if (!e.premierGeste) e.premierGeste = Date.now(); };
  const occupeA = (e, a) => !!M.stock[a] || Object.values(placement(e)).includes(a);
  const adresseDe = (e, p) => e.nouvelles[p.id] || p.adresse;

  // Prendre une palette (sa carte ou la réception du plan) ; la reprendre si elle est posée ou attend Kevin ; recliquer la
  // palette en main la remet en réception. Rend le geste à publier, ou rien.
  function prendre(e, id, X) {
    if (!X.ids.has(id)) return null;
    if (e.enMain === id) { e.enMain = null; dire(''); return null; }
    if (X.montees.includes(id)) { dire(`<b>${ech(id)}</b> est déjà montée par ${ech(NOM)} : elle ne se reprend plus.`, 'non'); return null; }
    delete e.posees[id]; delete e.confiees[id];
    e.enMain = id; ui.signaler = false; ui.confirmer = false; dire('');
    noterGeste(e);
    return `prendre:${id}`;
  }
  function poserIci(e, a) {
    const p = M.pal[e.enMain], d = decoupe(a);
    if (!p) return null;
    noterGeste(e);
    if (d.n > 1) {
      e.tentativesHaut = (e.tentativesHaut || 0) + 1;
      dire(`Au-dessus du sol, c’est ${ech(NOM)} qui monte la palette.`, 'non');
      return null;
    }
    if (occupeA(e, a)) { dire('Emplacement déjà occupé. La palette reste en main.', 'non'); return null; }
    e.posees[p.id] = a; e.enMain = null;
    dire(`<b>${ech(p.id)}</b> posée en <b class="pe-mono">${ech(a)}</b>.`, 'oui');
    return `poser:${p.id}`;
  }
  function confier(e, a) {
    const p = M.pal[e.enMain], d = decoupe(a);
    if (!p || !C) return null;
    noterGeste(e);
    if (d.n === 1) { dire('Au sol, tu poses toi-même.', 'non'); return null; }
    if (!C.niveaux.includes(d.n)) { dire(`${ech(NOM)} ne monte pas au niveau N${d.n}.`, 'non'); return null; }
    if (occupeA(e, a)) { dire('Emplacement déjà occupé. La palette reste en main.', 'non'); return null; }
    e.confiees[p.id] = a; e.enMain = null;
    dire(`<b>${ech(p.id)}</b> confiée à ${ech(NOM)} : elle attend dans la zone « À monter ».`, 'oui');
    return `confier:${p.id}`;
  }
  // Signaler : la palette retourne en réception, marquée. Le système répond (jamais de jugement à l'écran) : la nouvelle
  // adresse si la palette en déclare une, sinon « Signalement enregistré. » ; en copie, « C’est noté. » seulement.
  function signaler(e, a, motif) {
    const p = M.pal[e.enMain];
    if (!p || !MOTIF_IDS.includes(motif)) return null;
    e.signalees[p.id] = { motif, adresse: a }; e.enMain = null; ui.signaler = false;
    noterGeste(e);
    if (COPIE) direSysteme('C’est noté.');
    else if (p.nouvelleAdresse) { e.nouvelles[p.id] = p.nouvelleAdresse; direSysteme(`Nouvelle adresse : ${p.nouvelleAdresse}.`); }
    else direSysteme('Signalement enregistré.');
    dire(`<b>${ech(p.id)}</b> signalée : elle retourne en réception.`, 'oui');
    return `signaler:${p.id}`;
  }

  /* ------------------------------------------------------------- le dessin */
  // L'état que lisent le plan et la travée de face du rangement : `place` = ce qui est physiquement dans le rack (posées,
  // montées) ; une palette qui attend Kevin ou absente pour cet élève est rangée « ailleurs », hors du plan et de la réception.
  function vueE(e, X) {
    const place = {};
    Object.values(M.pal).forEach((p) => { if (!X.ids.has(p.id)) place[p.id] = 'absente'; });
    Object.assign(place, e.posees);
    Object.entries(e.confiees).forEach(([id, a]) => { place[id] = X.montees.includes(id) ? a : 'à monter'; });
    return { place, vides: [], aideCharge: false };
  }
  const reserves = (e, X) => Object.fromEntries(Object.entries(e.confiees).filter(([id]) => !X.montees.includes(id)).map(([id, a]) => [a, id]));

  // La zone « À MONTER », au pied de chaque allée (trait de l'accent, jamais d'aplat vert) : les palettes confiées que Kevin
  // n'a pas encore montées, avec leur destination.
  function dessusAMonter(e, X) {
    if (!C) return '';
    const att = Object.entries(e.confiees).filter(([id]) => !X.montees.includes(id));
    let s = '';
    M.allees.forEach((al) => {
      const x = G.allees[al.id].x + 5, w = O.AW - 10, y = G.yBas - 72, h = 66;
      const ici = att.filter(([, a]) => M.cotes[decoupe(a).c].allee === al.id);
      s += `<g data-pal-amonter="${ech(al.id)}" pointer-events="none"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="var(--panneau)" stroke="var(--ardoise)" stroke-width="2.5" stroke-dasharray="7 4"/>
        <text x="${x + w / 2}" y="${y + 15}" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--ardoise)" font-family="inherit">À MONTER</text>`;
      ici.slice(0, 2).forEach(([id, a], k) => {
        const d = decoupe(a), yy = y + 22 + k * 21;
        s += `<rect x="${x + 4}" y="${yy}" width="${w - 8}" height="18" rx="2" fill="none" stroke="var(--pe-carton-trait)" stroke-width="1.5" data-pal-amonter-p="${ech(id)}"/>
          <text x="${x + w / 2}" y="${yy + 13}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--encre)" class="pe-mono">${ech(id)} T${pad2(d.t)}-N${d.n}-E${d.e}</text>`;
      });
      if (ici.length > 2) s += `<text x="${x + w / 2}" y="${y + h - 3}" text-anchor="middle" font-size="9.5" fill="var(--encre-douce)" font-family="inherit">+ ${ici.length - 2}</text>`;
      s += '</g>';
    });
    return s;
  }

  function consigne(e, R, X) {
    const n = (k, t) => `<span class="pe-num">${k}</span>${t}`;
    if (R.fige) return n('✓', R.copie ? 'Copie rendue.' : 'Rangement validé : il ne change plus.');
    const pm = e.enMain ? M.pal[e.enMain] : null;
    if (!pm) {
      if (X.ps.every((p) => traitee(e, X.pl, p.id))) return n('✓', 'Toutes les palettes sont traitées. Relis, puis clique <b>Valider mon rangement</b>.');
      return n(1, 'Prends une palette en réception (sa carte, en haut).');
    }
    const a = `<b class="pe-mono">${ech(adresseDe(e, pm))}</b>`;
    if (!ui.trav) return n(2, `<b>${ech(pm.id)}</b> en main, adresse ${a}. Clique sa <b>travée</b> sur le plan.`);
    if (!ui.pres) return n(3, `<b>${ech(pm.id)}</b> en main, adresse ${a}. Clique l’<b>emplacement</b> pour le voir de près.`);
    return n(4, `Vérifie l’emplacement, puis choisis : <b>poser</b>${C ? `, <b>confier à ${ech(NOM)}</b>` : ''} ou <b>signaler</b>.`);
  }
  // La barre d'adresse (comme le rangement) : elle se remplit au survol d'un emplacement, avec la consigne à droite.
  function barre(e, R, X, survol) {
    const t = ui.trav ? decoupe(`${ui.trav}-N1-E1`) : null;
    const s = survol ? decoupe(survol) : ui.pres ? decoupe(ui.pres) : null;
    const v = [t && t.c, t && `T${pad2(t.t)}`, s && `N${s.n}`, s && `E${s.e}`];
    const lib = ['allée · côté', 'travée', 'niveau', 'emplacement'];
    const prochain = v.findIndex((x) => !x);
    const cases = v.map((x, i) => `<span class="pe-case${x ? ' pe-plein' : ''}${i === prochain && (i < 2 || t) ? ' pe-attend' : ''}"><b>${x || '?'}</b><small>${lib[i]}</small></span>`)
      .join('<span class="pe-tiret">-</span>');
    return `<span class="pe-lbl">Adresse</span>${cases}<span class="pe-consigne" data-pe-consigne>${consigne(e, R, X)}</span>`;
  }

  // Après « Valider » (hors copie, si la séance le déclare) : le nom du critère faux, ou le critère et l'adresse attendue.
  function verdict(e, p, R) {
    if (!e.valide || R.copie || !M.verdict) return '';
    const F = fautesPalette(M, e, p);
    if (!F.length) return '<span class="pe-verd pe-ok" data-pal-verdict="ok">✓ bien rangée</span>';
    let t = `✗ ${F.join(', ')}`;
    if (M.verdict === 'adresse' && (F.includes('adresse') || F.includes('signalement'))) {
      t += p.aSignaler ? ` · à signaler${p.nouvelleAdresse ? `, puis ${p.nouvelleAdresse}` : ''}` : ` · adresse attendue : ${p.adresse}`;
    }
    return `<span class="pe-verd pe-ko" data-pal-verdict="ko">${ech(t)}</span>`;
  }
  function carte(e, p, R, X) {
    const nouvelle = e.nouvelles[p.id], conf = e.confiees[p.id], mont = X.montees.includes(p.id);
    const etat = e.enMain === p.id ? 'en main' : e.posees[p.id] ? `posée en ${e.posees[p.id]}`
      : conf ? (mont ? `montée en ${conf}` : `à monter (${NOM})`) : e.signalees[p.id] ? 'signalée' : 'en réception';
    const cls = `pe-pal pal-carte${e.enMain === p.id ? ' pe-en-main' : ''}${e.posees[p.id] || mont ? ' pe-posee' : ''}${conf && !mont ? ' pal-confiee' : ''}`;
    return `<button type="button" class="${cls}" data-pe-pal="${ech(p.id)}" data-pe-cle="pal:${ech(p.id)}" ${R.fige ? 'disabled' : ''} aria-pressed="${e.enMain === p.id}" title="${ech(`${p.id} ${p.nom}`)}">
      <span class="pe-ttl"><span class="pe-pid">${ech(p.id)}</span> ${ech(p.nom)}</span>
      <span class="pal-etiq${nouvelle ? ' pal-nouvelle' : ''}" data-pal-etiq="${ech(p.id)}"><small>${nouvelle ? 'Nouvelle adresse' : 'Adresse'}</small> <b class="pe-mono">${ech(nouvelle || p.adresse)}</b></span>
      <span class="pal-info">${p.cartons} cartons · ${kg(p.kg)}</span>
      <span class="pal-etat" data-pal-etat="${ech(p.id)}">${ech(etat)}</span>
      <span class="pe-verd-l" data-pe-verd="${ech(p.id)}">${verdict(e, p, R)}</span></button>`;
  }
  function bandeau(e, R, X) {
    const per = P.personnage || {};
    const txt = typeof per.texte === 'string' ? per.texte : ((per.texte || {})[R.temps] || '');
    let act;
    if (R.fige) act = `<button type="button" class="btn" disabled>${R.copie ? 'Copie rendue' : 'Rangement validé'}</button>`;
    else if (ui.confirmer) {
      const reste = X.ps.filter((p) => !traitee(e, X.pl, p.id)).length;
      act = `<span class="pe-confirme" data-pal-confirme>Valider ? Tu ne pourras plus rien changer.${reste ? ` (${reste} palette${reste > 1 ? 's' : ''} encore en réception.)` : ''}
        <button type="button" class="btn btn-p" data-pal="validerOui" data-pe-cle="b:validerOui">Oui, valider</button>
        <button type="button" class="btn" data-pal="validerNon" data-pe-cle="b:validerNon">Non</button></span>`;
    } else act = '<button type="button" class="btn btn-p" data-pal="valider" data-pe-cle="b:valider">Valider mon rangement</button>';
    const RG = P.regles;
    const regles = !R.copie && RG ? `<details class="pe-regles" data-pe-regles ${ui.regles ? 'open' : ''}><summary data-pe-cle="b:regles">${ech(RG.titre || 'Les règles')} ▾</summary>
      <div class="pe-regles-corps"><b>${ech(RG.entete || 'Ranger à l’adresse donnée')}</b><ol>${(RG.lignes || []).map((l) => `<li>${l}</li>`).join('')}</ol>
      ${RG.encadre ? `<div class="pe-encadre">${RG.encadre}</div>` : ''}</div></details>` : '';
    return `<div class="pe-bandeau pal-bandeau">
      <div class="pe-perso"><b>${ech([per.nom, per.role].filter(Boolean).join(', '))}${per.date ? ` · ${ech(per.date)}` : ''}</b>${txt}</div>
      <div class="pe-liste"><h3>${ech(P.titreListe || 'Réception : palettes à ranger')}</h3><div class="pe-cartes">${X.ps.map((p) => carte(e, p, R, X)).join('')}</div></div>
      <div class="pe-act">${act}${regles}</div></div>`;
  }

  // Une étiquette d'emplacement, comme sur la lisse (code à barres décoratif tiré de l'adresse) : le lot 2 y scannera.
  function etiquette(a) {
    let x = 0, bars = '';
    [...a].forEach((ch, i) => {
      const c = ch.charCodeAt(0);
      [1 + (c % 3), 1 + ((c >> 2) % 2), 2 + ((c + i) % 2)].forEach((w, k) => { if (k !== 1) bars += `<rect x="${x}" y="0" width="${w}" height="22" fill="#1a1915"/>`; x += w + 1; });
    });
    return `<div class="pal-etiq-emp" data-pal-etiq-emp="${ech(a)}"><b class="pe-mono">${ech(a)}</b>
      <svg class="pal-code" viewBox="0 0 ${x} 22" preserveAspectRatio="none" aria-hidden="true">${bars}</svg></div>`;
  }
  // LA VUE DE PRÈS d'un emplacement : son étiquette, le niveau, ce qui l'occupe, la plaque (jamais au sol), le « déjà posé »
  // et la somme selon `aideCharge`, la palette en main, les trois boutons (les mêmes à tous les niveaux) ou les motifs.
  function pres(e, R, X) {
    const a = ui.pres;
    const msg = `<div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pal-msg role="status">${ui.msg}</div>`;
    if (!a) return `<div class="pal-pres pal-pres-vide" data-pal-pres="">Clique un <b>emplacement</b> de la travée : tu le vois de près ici.${msg}</div>`;
    const d = decoupe(a), cote = M.cotes[d.c], plaque = d.n > 1 ? cote.charge[d.n] : null;
    const st = M.stock[a], aMoi = Object.keys(X.pl).find((id) => X.pl[id] === a && !(e.confiees[id] && !X.montees.includes(id)));
    const res = reserves(e, X)[a];
    const poids = M.aide !== 'plaque';
    const occ = M.hs.has(a) ? ['hs', 'Emplacement hors service']
      : st ? ['stock', `Occupé : ${(M.produits[st.produit] || {}).nom || st.produit}${poids ? ` · ${kg(st.kg)}` : ''}`]
      : aMoi ? ['eleve', `Occupé : ta palette ${aMoi}${poids ? ` · ${kg(M.pal[aMoi].kg)}` : ''}`]
      : res ? ['reserve', `Réservé : ${res}, à monter (${NOM})`] : ['libre', 'Libre'];
    const pm = e.enMain ? M.pal[e.enMain] : null;
    let h = etiquette(a);
    h += `<div class="pal-niv"><span>Niveau <b>N${d.n}</b> · ${d.n === 1 ? 'le sol (picking)' : 'réserve, au-dessus du sol'}</span>
      <span class="pal-occ pal-occ-${occ[0]}" data-pal-occ="${occ[0]}">${ech(occ[1])}</span></div>`;
    if (plaque) {
      let charge = `<div class="pal-plaque" data-pal-plaque>Charge max <b>${kg(plaque)}</b> par niveau</div>`;
      if (poids) {
        const deja = M.chargeNiveau(X.pl, d, null);
        charge += `<div class="pal-capteur" data-pal-capteur role="img" aria-label="Déjà posé sur le niveau N${d.n} : ${kg(deja)}">
          <span class="pal-capteur-t">CHARGE N${d.n}</span><span class="pal-capteur-v"><small>kg</small><b data-pal-deja>${nb(deja)}</b></span><span class="pal-capteur-b">déjà posé</span></div>`;
        if (M.aide === 'somme' && pm) charge += `<div class="pal-somme" data-pal-somme>Avec ta palette <b>${ech(pm.id)}</b> : ${nb(deja)} + ${nb(pm.kg)} = <b>${kg(deja + pm.kg)}</b></div>`;
      }
      h += `<div class="pal-charge">${charge}</div>`;
    } else h += '<div class="pal-sol">Au sol : pas de plaque de charge.</div>';
    if (R.fige) return `<div class="pal-pres" data-pal-pres="${ech(a)}">${h}${msg}</div>`;
    // Pendant le choix du motif, la ligne « En main » cède sa place aux motifs (la carte dit déjà quelle palette est en main).
    if (!(pm && ui.signaler)) h += `<div class="pal-main" data-pal-main>${pm ? `En main : <b title="${ech(pm.nom)}">${ech(pm.id)}</b> (${kg(pm.kg)}), adresse <b class="pe-mono">${ech(adresseDe(e, pm))}</b>`
      : 'Aucune palette en main : prends-en une en réception (en haut).'}</div>`;
    if (pm && ui.signaler) {
      h += `<fieldset class="pal-motifs" data-pal-motifs><legend>On ne peut pas ranger ici : pourquoi ?</legend>
        ${MOTIFS.map(([k, lib]) => `<button type="button" class="btn" data-pal-motif="${k}" data-pe-cle="motif:${k}">${ech(lib)}</button>`).join('')}
        <button type="button" class="btn pal-annuler" data-pal="signalerNon" data-pe-cle="b:signalerNon">Annuler</button></fieldset>`;
    } else if (pm) {
      h += `<div class="pal-boutons">
        <button type="button" class="btn btn-p" data-pal="poser" data-pe-cle="b:poser">Poser ici</button>
        ${C ? `<button type="button" class="btn" data-pal="confier" data-pe-cle="b:confier">Confier à ${ech(NOM)}</button>` : ''}
        <button type="button" class="btn pal-signaler" data-pal="signaler" data-pe-cle="b:signaler">Signaler : on ne peut pas ranger ici</button></div>`;
    }
    return `<div class="pal-pres" data-pal-pres="${ech(a)}">${h}${msg}</div>`;
  }

  function cote(e, R, X, api) {
    const L = ui.journal.length ? ui.journal : Object.entries(e.nouvelles).map(([id, a]) => `${id} : nouvelle adresse ${a}.`);
    let h = `<div class="pal-systeme" data-pal-systeme><div class="pal-systeme-t">Système</div>
      <div class="pal-systeme-e" aria-live="polite">${L.length ? L.map((l, i) => `<div class="${i === L.length - 1 ? 'pal-sys-actu' : 'pal-sys-passe'}">${ech(l)}</div>`).join('') : '<span class="pal-sys-vide">—</span>'}</div></div>`;
    if (!ui.trav) h += `<div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pal-msg role="status">${ui.msg}</div>`;
    if (C) {
      const att = Object.entries(e.confiees).filter(([id]) => !X.montees.includes(id));
      h += `<div class="pal-liste-amonter" data-pal-amonter-liste><span class="pe-t">À monter (${ech(NOM)}) :</span>${att.length
        ? att.map(([id, a]) => `<span><b>${ech(id)}</b> → <span class="pe-mono">${ech(a)}</span></span>`).join('') : ' aucune'}</div>`;
    }
    h += `<div class="pe-legende"><span><i class="pe-puce pe-p-stock"></i>occupé</span><span><i class="pe-puce pe-p-eleve"></i>ta palette</span>
      <span><i class="pe-puce pal-p-reserve"></i>à monter</span><span><i class="pe-puce pe-p-hs"></i>hors service</span><span><i class="pe-puce"></i>libre</span></div>`;
    if (R.prof) {
      const A = attendusPalettier(M);
      h += `<details class="pe-prof"><summary>Côté enseignant : attendus</summary>${Object.entries(A).map(([id, x]) => `<div><b>${ech(id)}</b> : ${x.signaler
        ? `signaler (${ech(x.signaler.join(', ') || '—')})${x.puis ? `, puis <span class="pe-mono">${ech(x.puis)}</span>` : ''}`
        : `${x.geste === 'poser' ? 'poser' : `confier à ${ech(NOM)}`} en <span class="pe-mono">${ech(x.adresse)}</span>`}${x.niveaux ? ' (confirmé)' : ''}</div>`).join('')}</details>`;
    }
    return `<aside class="pal-cote">${h}</aside>`;
  }

  function html(e, api) {
    normaliser(e);
    const R = regime(api, e);
    const X = calcul(e, R, api);
    if (e.enMain && (!X.ids.has(e.enMain) || X.pl[e.enMain])) e.enMain = null;
    if (R.fige) { ui.confirmer = false; ui.signaler = false; }
    ui.main = e.enMain;
    const VE = vueE(e, X);
    let espace;
    if (!ui.trav) {
      espace = `<div class="pe-plan">${O.htmlPlan(VE, { bandes: false, parcours: false, eval: false, aideCharge: false, g: false },
        { dessus: dessusAMonter(e, X), aria: 'Plan de l’entrepôt : clique une travée pour l’ouvrir' })}</div>`;
    } else {
      const c = M.cotes[ui.trav.split('-')[0]];
      const RF = { aideCharge: false, eval: false, sansPoids: M.aide === 'plaque', reserves: reserves(e, X), choisi: ui.pres };
      espace = `<div class="pe-entete"><div class="pe-fil pal-fil">Plan › <b>Travée</b> <span class="pe-mono">${ech(ui.trav)}</span> <span class="pe-petit">(vue depuis l’allée ${ech(c.allee)})</span></div>
          <button type="button" class="btn btn-p pe-retour" data-pal="retour" data-pe-cle="b:retour">← Retour au plan</button></div>
        <div class="pal-partage"><div class="pe-face">${O.htmlFace(VE, RF)}</div><div class="pal-pres-zone">${pres(e, R, X)}</div></div>`;
    }
    return `<div class="pe pal" data-entrepot="${ech(P.id)}" data-pe-mode="palettier" data-pe-temps="${R.temps}" data-pal-valide="${!!e.valide}" data-pe-ouverte="${!!ui.trav}">
      <div class="pe-adresse" data-pe-adresse>${barre(e, R, X, null)}</div>
      ${bandeau(e, R, X)}
      <div class="pal-jeu"><section class="pe-espace">${espace}</section>${cote(e, R, X, api)}</div></div>`;
  }

  function brancher(z, e, api) {
    const racine = z.querySelector('.pal');
    if (!racine) return;
    normaliser(e);
    const R = regime(api, e);
    const X = calcul(e, R, api);
    const redessiner = () => api.redessiner();
    const sig = (n) => { if (n && api.signal && !R.fige) api.signal(geste(n)); };
    const fait = (n) => { sig(n); api.sauver(); redessiner(); };
    const activer = (el, fn) => {
      el.addEventListener('click', fn);
      if (el.tagName !== 'BUTTON') el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); } });
    };
    const on = (cle, fn) => racine.querySelectorAll(`[data-pal="${cle}"]`).forEach((b) => activer(b, fn));
    // Échap : les motifs, puis la vue de près, puis la travée.
    const fermer = () => {
      if (ui.signaler) { ui.signaler = false; ui.focus = 'b:signaler'; }
      else if (ui.pres) { ui.focus = `emp:${ui.pres}`; ui.pres = null; }
      else if (ui.trav) { ui.focus = `trav:${ui.trav}`; ui.trav = null; }
      else return false;
      dire(''); redessiner(); return true;
    };
    O.echap(racine, fermer);
    // La hauteur d'écran qui reste sous le bandeau : le plan, la travée et la vue de près y tiennent sans défiler.
    const espace = racine.querySelector('.pe-espace');
    const caler = () => {
      if (!espace.isConnected) { window.removeEventListener('resize', caler); return; }
      const haut = espace.getBoundingClientRect().top + window.scrollY;
      const entete = racine.querySelector('.pe-entete');
      const reste = window.innerHeight - haut - 22 - (entete ? entete.offsetHeight + 6 : 0), min = entete ? 340 : 380;
      racine.style.setProperty('--pe-dispo', `${Math.max(min, Math.round(reste))}px`);
    };
    caler();
    window.addEventListener('resize', caler);
    racine.addEventListener('focusin', (ev) => { const t = ev.target.closest && ev.target.closest('[data-pe-cle]'); if (t) ui.focus = t.dataset.peCle; });
    const det = racine.querySelector('[data-pe-regles]');
    if (det) det.addEventListener('toggle', () => { ui.regles = det.open; });
    if (O.clavier() && ui.focus) {
      const el = racine.querySelector(`[data-pe-cle="${CSS.escape(ui.focus)}"]`);
      if (el) el.focus({ preventScroll: true });
    }
    on('retour', () => { ui.focus = ui.trav ? `trav:${ui.trav}` : null; ui.pres = null; ui.trav = null; ui.signaler = false; dire(''); redessiner(); });
    // Regarder reste permis après « Valider » (ouvrir une travée, un emplacement) ; aucun geste n'est plus publié.
    racine.querySelectorAll('[data-pe-trav]').forEach((g) => activer(g, () => {
      ui.trav = g.dataset.peTrav; ui.pres = null; ui.anim = true; ui.signaler = false; dire('');
      ui.focus = `emp:${ui.trav}-N1-E1`;
      redessiner();
    }));
    const barreEl = racine.querySelector('[data-pe-adresse]');
    racine.querySelectorAll('[data-pe-emp]').forEach((g) => {
      activer(g, () => {
        ui.pres = g.dataset.peEmp; ui.signaler = false; dire('');
        ui.focus = e.enMain && !R.fige ? 'b:poser' : `emp:${ui.pres}`;
        fait('ouvrir');
      });
      const sur = () => { barreEl.innerHTML = barre(e, R, X, g.dataset.peEmp); };
      const hors = () => { barreEl.innerHTML = barre(e, R, X, null); };
      g.addEventListener('mouseenter', sur); g.addEventListener('focus', sur);
      g.addEventListener('mouseleave', hors); g.addEventListener('blur', hors);
    });
    if (R.fige) return;
    racine.querySelectorAll('[data-pe-pal]').forEach((b) => activer(b, () => fait(prendre(e, b.dataset.pePal, X))));
    on('poser', () => { const n = poserIci(e, ui.pres); ui.focus = n ? `emp:${ui.pres}` : 'b:poser'; fait(n); });
    on('confier', () => { const n = confier(e, ui.pres); ui.focus = n ? `emp:${ui.pres}` : 'b:confier'; fait(n); });
    on('signaler', () => { ui.signaler = true; dire(''); ui.focus = `motif:${MOTIF_IDS[0]}`; redessiner(); });
    on('signalerNon', () => { ui.signaler = false; ui.focus = 'b:signaler'; redessiner(); });
    racine.querySelectorAll('[data-pal-motif]').forEach((b) => activer(b, () => { const n = signaler(e, ui.pres, b.dataset.palMotif); ui.focus = `emp:${ui.pres}`; fait(n); }));
    on('valider', () => { ui.confirmer = true; ui.focus = 'b:validerOui'; redessiner(); });
    on('validerNon', () => { ui.confirmer = false; ui.focus = 'b:valider'; redessiner(); });
    on('validerOui', () => {
      ui.confirmer = false; ui.signaler = false; ui.pres = null; ui.trav = null;
      e.enMain = null; e.valide = true; e.at = Date.now(); noterGeste(e);
      sig('valider'); api.sauver();
      if (COPIE && api.rendreCopie) api.rendreCopie();
      // Tout l'écran, menu compris : un message qui attend le geste `valider` (Kevin, ENT-8.11) arrive tout de suite.
      if (api.redessinerTout) api.redessinerTout(); else redessiner();
    });
  }

  return {
    signaux, id: P.id,
    nav: { libelle: P.libelle || "Plan de l'entrepôt" },
    etatNeuf: etatPalettierNeuf,
    // La calculette du site quand l'élève fait lui-même « déjà posé + sa palette » (aide `pose`), comme le rangement hors guidage.
    calculette: () => M.aide === 'pose',
    // Ce que lisent les tests et la page d'essai.
    lire: () => ({ trav: ui.trav, pres: ui.pres, msg: ui.msg, signaler: ui.signaler, journal: ui.journal.slice() }),
    html, brancher,
  };
}
