// Vue « Tri des colis » — au poste de lecture d'une ligne de tri, l'élève lit l'étiquette du colis, trouve la sortie de sa
// tournée dans le plan de tri et l'y envoie, ou le met à l'écart en disant pourquoi. Chantier moteur du 26/10/2026 (brief
// `docs/briefs/MOTEUR-vue-tri.md`) : la logique de la page d'essai v4 validée par Tristan à l'écran
// (`docs/briefs/mondial-relay/maquette-tri-colis.html`, retours §8 du brief) DÉPLACÉE ici. Rien de Mondial Relay : la séance
// déclare ses sorties, ses règles et ses colis ; la vue fournit le poste, les gestes, les jalons. Servira aussi au CAP (Amazon,
// GLS, Bigblue) et à l'expédition d'autres entreprises.
//
// Ce que la séance déclare (option `tri` de `creerEntreprise`) :
//   tri: {
//     id: 'mr-tri-112',                       // un id par séance (état : db.tris[<séance>][<id>])
//     libelle: 'Ligne de tri',                // l'entrée du menu (défaut : « Ligne de tri »)
//     lieu: 'Hub de Buchères · ligne de tri des départs agence',   // sous le titre (facultatif)
//     qui: { prenom: 'Romain', poste: 'chef d’équipe' },           // qui donne la consigne (facultatif)
//     sorties: [{ id: 'T1', nom: 'Troyes', communes: [['Troyes', '10000']] }, …],   // 2 à 9 sorties (touches 1 à 9)
//     ecart: { libelle: 'À l’écart', sous: 'expertise' },          // facultatif
//     regles: { poidsMax: 30, longueurMax: 120, sommeMax: 150, carton: true, etiquette: true, source: '…' },
//     series: [
//       { id: 's1', titre: 'Série 1', temps: 'guidage' | 'entrainement' | 'evaluation', secondes: 20, consigne: '…',
//         colis: [{ n: 'MR 4417 2093', commune: 'Troyes', relais: 'Tabac de la Vienne', rue: '12 rue de la Cité',
//                   kg: 2.4, dim: [40, 30, 20], etat: 'ferme' | 'enfonce' | 'ouvert' | 'floue',
//                   piege: 'Ne pas confondre avec…', geste: 'ines', anomalie: 'poids' }, …] },
//     ],
//     fin: 'Phrase de la fin de la dernière série (facultative).',
//   }
// ou une FONCTION de la graine (modèle de l'inspection tirée) : `tri: (graine, { niveau, copie }) => ({ … })`, mêmes ids de
// séries pour toutes les graines.
//
// LE BON TRI SE CALCULE, il ne s'écrit jamais (brief §3) : un colis a une anomalie quand il pèse plus que `poidsMax` (poids),
// quand son plus grand côté dépasse `longueurMax` ou la somme de ses côtés `sommeMax` (taille), quand son carton est `ouvert`
// (carton), quand son étiquette est `floue` (étiquette). Avec une anomalie, il va à l'écart avec ce motif ; sinon, dans la
// sortie de sa commune. Un carton `enfonce` (marqué mais fermé) n'est PAS une anomalie : il part. `anomalie`, s'il est écrit,
// n'est qu'un CONTRÔLE (la séance ne se charge pas s'il contredit le calcul), et un colis a au plus une anomalie.
// `piege` : un colis en règle dont la commune se confond avec une autre (le texte est le retour du guidage). `geste` : le colis
// publie `tri:<id>:<geste>` quand il quitte le tapis (envoyé, écarté, ou non trié au second passage).
//
// LES TROIS TEMPS (brief §2, retours de Tristan) :
//   - guidage : pas de minuteur, retour tout de suite (« ✓ Juste. » en vert texte, « ✗ … » en rouge texte, avec ce qu'il faut
//     regarder), bilan à la fin, « Rejouer la série » (le PREMIER résultat compte, règle du dépôt) ;
//   - entraînement : `secondes` par colis à partir du DEUXIÈME (le premier laisse le temps de lire) ; un colis laissé passer
//     fait le tour de la boucle et revient en fin de série ; au second passage raté, il est « non trié » ; aucun retour pendant
//     la série, bilan à la fin ;
//   - évaluation (séance `copie`) : comme l'entraînement (minuteur large décidé par Tristan le 26/10/2026 : 28 s proposé), aucun
//     bilan pour l'élève ; la note se lit au Suivi. Le tiers-temps de l'élève multiplie le temps par 4/3. Une séance `copie` n'a
//     que des séries `evaluation`, une séance de travail n'en a aucune.
// Le minuteur ne compte pas quand l'onglet est caché, ni pendant une question au fil (`gele()`).
//
// L'état, rangé par le moteur dans la base de l'élève, cloisonné par séance : `db.tris[<séance>][<id>]` =
//   { series: { <id de série>: { file: [k…], pos, res: { <k>: { s, motif } }, tours: [k…], fait, vu, premier } } }
// `k` = rang du colis dans sa série ; `s` = id de sortie, 'ecart' ou null (non trié) ; `premier` = les résultats du premier
// passage complet (guidage rejoué). Ce qui est DESSINÉ (le colis du moment, les bacs) se calcule, jamais rangé.
//
// Les jalons (`jalonTri`, à poser dans `etapes` avec `poids` et `groupe`) : `communes` (colis en règle sans piège bien triés,
// sur le nombre), `pieges` (colis à piège bien triés), `ecarts` (colis à écarter, écartés avec le bon motif), `fauxEcarts`
// (aucun colis en règle mis à l'écart ET aucun laissé sur le tapis), `complet` (série finie). Chacun lit une ou plusieurs
// séries (`coef` pour les pondérer) et reste « à faire » tant qu'elles ne sont pas finies. AUCUN JALON NE SE GAGNE SANS TRIER :
// une série laissée passer donne 0 partout (`fauxEcarts` compris). Un chiffre caché ne se déduit pas : le retour dit « trop
// lourd », jamais « 1,6 kg de trop » (la balance et les cotes, elles, sont à lire).
//
// Gestes publiés : `tri:<id>:<série>:fini` (chaque série finie) et `tri:<id>:<geste>` (les colis qui en déclarent un).
// API reçue du moteur : { db, seance, estProf, signal(nom), gele(), figee, tiersTemps, sauver() }.

import { ech } from '../texte.js';
import { auClavier } from '../gestes.js';
import { graineDeBase, niveauEleve } from '../tirage.js';

export const MOTIFS_TRI = { poids: 'Trop lourd', taille: 'Trop grand', carton: 'Carton ouvert', etiquette: 'Étiquette illisible' };
export const ETATS_COLIS = ['ferme', 'enfonce', 'ouvert', 'floue'];
export const TEMPS_TRI = ['guidage', 'entrainement', 'evaluation'];
export const MESURES_TRI = ['communes', 'pieges', 'ecarts', 'fauxEcarts', 'complet'];
const REGARDER = { poids: 'Regarde la balance.', taille: 'Regarde ses dimensions.', carton: 'Regarde le carton.', etiquette: 'Regarde l’étiquette.' };
const ID = /^[a-z0-9][a-z0-9-]*$/i;

/* ================================================================ les règles */
// Les motifs que la séance applique (poids, taille, et carton / étiquette sauf `false`), dans l'ordre des boutons.
export function motifsDe(R) {
  const r = R || {};
  return ['poids', 'taille', 'carton', 'etiquette'].filter((m) => (m === 'poids' ? r.poidsMax != null
    : m === 'taille' ? r.longueurMax != null || r.sommeMax != null : r[m] !== false));
}
// Toutes les anomalies d'un colis d'après ses mesures et son état (une déclaration valide n'en a qu'une au plus).
export function anomaliesColis(c, R) {
  const r = R || {}, M = motifsDe(r), out = [];
  const dim = Array.isArray(c.dim) ? c.dim : [];
  if (M.includes('poids') && c.kg > r.poidsMax) out.push('poids');
  if (M.includes('taille') && ((r.longueurMax != null && Math.max(...dim) > r.longueurMax)
    || (r.sommeMax != null && dim.reduce((a, b) => a + b, 0) > r.sommeMax))) out.push('taille');
  if (M.includes('carton') && c.etat === 'ouvert') out.push('carton');
  if (M.includes('etiquette') && c.etat === 'floue') out.push('etiquette');
  return out;
}
const sortieDe = (D, commune) => { const S = D.sorties.find((s) => s.communes.some(([c]) => c === commune)); return S ? S.id : null; };
const cpDe = (D, commune) => { for (const S of D.sorties) for (const [c, cp] of S.communes) if (c === commune) return cp; return ''; };
// Le bon tri d'un colis : { s: id de sortie | 'ecart', motif: null | motif }.
export function bonTri(D, c) {
  const a = anomaliesColis(c, D.regles)[0] || null;
  return a ? { s: 'ecart', motif: a } : { s: sortieDe(D, c.commune), motif: null };
}
const juste = (D, c, r) => { const b = bonTri(D, c); return !!r && r.s === b.s && (b.s !== 'ecart' || r.motif === b.motif); };
// Le temps d'une série chronométrée (0 = pas de minuteur), le tiers-temps compris.
export const secondesSerie = (S, { tiersTemps = false } = {}) => (S.temps === 'guidage' ? 0 : Math.round(S.secondes * (tiersTemps ? 4 / 3 : 1)));

/* ================================================================ la déclaration */
export function verifierTri(D, { copie = false } = {}) {
  const f = [];
  if (!D || typeof D !== 'object') return ['la déclaration doit être un objet'];
  if (typeof D.id !== 'string' || !ID.test(D.id)) f.push('il faut un `id` (lettres, chiffres, tirets)');
  const sorties = Array.isArray(D.sorties) ? D.sorties : [];
  if (sorties.length < 2 || sorties.length > 9) f.push('il faut de 2 à 9 sorties (une touche de 1 à 9 chacune)');
  const vuesS = new Set(), vuesC = new Map();
  sorties.forEach((S, i) => {
    if (!S || typeof S.id !== 'string' || !S.id.trim()) { f.push(`la sortie n° ${i + 1} n’a pas d’id`); return; }
    if (S.id === 'ecart') f.push('« ecart » est réservé à la mise à l’écart');
    if (vuesS.has(S.id)) f.push(`la sortie « ${S.id} » est déclarée deux fois`);
    vuesS.add(S.id);
    if (!Array.isArray(S.communes) || !S.communes.length) f.push(`la sortie « ${S.id} » n’a aucune commune`);
    (S.communes || []).forEach((x) => {
      if (!Array.isArray(x) || typeof x[0] !== 'string' || !/^\d{5}$/.test(String(x[1]))) { f.push(`la sortie « ${S.id} » a une commune mal écrite (il faut ['Commune', 'code postal'])`); return; }
      if (vuesC.has(x[0])) f.push(`la commune « ${x[0]} » est dans deux sorties (${vuesC.get(x[0])} et ${S.id})`);
      vuesC.set(x[0], S.id);
    });
  });
  const R = D.regles || {};
  ['poidsMax', 'longueurMax', 'sommeMax'].forEach((k) => { if (R[k] != null && !(typeof R[k] === 'number' && R[k] > 0)) f.push(`la règle « ${k} » doit être un nombre positif`); });
  if (!motifsDe(R).length) f.push('aucune règle de mise à l’écart');
  const series = Array.isArray(D.series) ? D.series : [];
  if (!series.length) f.push('il faut au moins une série de colis');
  const idsSerie = new Set(), gestes = new Set();
  series.forEach((S, i) => {
    const nomS = S && S.id ? `la série « ${S.id} »` : `la série n° ${i + 1}`;
    if (!S || typeof S.id !== 'string' || !ID.test(S.id)) { f.push(`${nomS} n’a pas d’id (lettres, chiffres, tirets)`); return; }
    if (idsSerie.has(S.id)) f.push(`${nomS} est déclarée deux fois`);
    idsSerie.add(S.id);
    if (!TEMPS_TRI.includes(S.temps)) f.push(`${nomS} : temps inconnu « ${S.temps} » (${TEMPS_TRI.join(', ')})`);
    if (copie && S.temps !== 'evaluation') f.push(`${nomS} : une évaluation (copie) n’a que des séries « evaluation »`);
    if (!copie && S.temps === 'evaluation') f.push(`${nomS} : une série « evaluation » demande une séance copie`);
    if (S.temps && S.temps !== 'guidage' && !(typeof S.secondes === 'number' && S.secondes >= 5)) f.push(`${nomS} : il faut \`secondes\` (au moins 5) par colis`);
    const colis = Array.isArray(S.colis) ? S.colis : [];
    if (!colis.length) f.push(`${nomS} n’a aucun colis`);
    const nums = new Set();
    colis.forEach((c, k) => {
      const nomC = `${nomS}, colis ${c && c.n ? `« ${c.n} »` : `n° ${k + 1}`}`;
      if (!c || typeof c.n !== 'string' || !c.n.trim()) { f.push(`${nomC} : il faut son numéro \`n\``); return; }
      if (nums.has(c.n)) f.push(`${nomC} est deux fois dans la série`);
      nums.add(c.n);
      if (!vuesC.has(c.commune)) f.push(`${nomC} : la commune « ${c.commune} » n’est dans aucune sortie`);
      if (!(typeof c.kg === 'number' && c.kg > 0)) f.push(`${nomC} : il faut son poids \`kg\``);
      if (!Array.isArray(c.dim) || c.dim.length !== 3 || !c.dim.every((x) => typeof x === 'number' && x > 0)) f.push(`${nomC} : il faut ses trois dimensions \`dim\` en cm`);
      if (c.etat != null && !ETATS_COLIS.includes(c.etat)) f.push(`${nomC} : état inconnu « ${c.etat} » (${ETATS_COLIS.join(', ')})`);
      if (!c.relais || !c.rue) f.push(`${nomC} : il faut le point de livraison \`relais\` et son adresse \`rue\``);
      const A = anomaliesColis(c, R);
      if (A.length > 1) f.push(`${nomC} a plusieurs anomalies (${A.join(', ')}) : une seule par colis`);
      if (c.anomalie !== undefined && (c.anomalie || null) !== (A[0] || null)) f.push(`${nomC} : l’anomalie écrite (« ${c.anomalie} ») contredit ses mesures (${A[0] || 'aucune'})`);
      if (c.piege != null && (typeof c.piege !== 'string' || !c.piege.trim())) f.push(`${nomC} : le piège est un texte`);
      if (c.piege && A.length) f.push(`${nomC} : un piège ne se pose que sur un colis en règle`);
      if (c.geste != null) {
        if (typeof c.geste !== 'string' || !ID.test(c.geste)) f.push(`${nomC} : geste mal écrit`);
        else if (gestes.has(c.geste) || idsSerie.has(c.geste)) f.push(`${nomC} : le geste « ${c.geste} » est déjà pris`);
        gestes.add(c.geste);
      }
    });
  });
  return f;
}

// Ce qu'une série contient (pour les contrôles d'équité d'un tirage) : nombre de colis, d'écarts par motif, de pièges, sorties servies.
export function compositionSerie(D, S) {
  const ecarts = {}, servies = new Set();
  let pieges = 0;
  S.colis.forEach((c) => {
    const b = bonTri(D, c);
    if (b.s === 'ecart') ecarts[b.motif] = (ecarts[b.motif] || 0) + 1; else servies.add(b.s);
    if (c.piege) pieges += 1;
  });
  return { colis: S.colis.length, ecarts, nbEcarts: Object.values(ecarts).reduce((a, b) => a + b, 0), pieges, sorties: [...servies].sort() };
}

/* ================================================================ l'état */
export const etatTri = (db, seance, id) => (db && db.tris && db.tris[seance] && db.tris[seance][id]) || null;
export const declarationDe = (decl, db, { copie = false } = {}) => (typeof decl === 'function'
  ? decl(graineDeBase(db || {}) || '', { niveau: niveauEleve(db || {}, { copie }), copie }) : decl);
const serieNeuve = (S) => ({ file: S.colis.map((_, k) => k), pos: 0, res: {}, tours: [], fait: false, vu: false, premier: null });
function completer(D, st) {
  if (!st.series) st.series = {};
  D.series.forEach((S) => { if (!st.series[S.id]) st.series[S.id] = serieNeuve(S); });
  return st;
}
// La série à l'écran : la première qui n'est pas finie et vue ; toutes vues = la dernière.
const serieCourante = (D, st) => D.series.find((S) => !(st.series[S.id].fait && st.series[S.id].vu)) || D.series[D.series.length - 1];
// Les résultats qui comptent : le premier passage complet (guidage rejoué), sinon le passage en cours.
const resultats = (E) => (E.premier || E.res);

/* ================================================================ les jalons */
// Le décompte d'une série finie, pour une mesure : { juste, sur }.
export function compterSerie(D, S, E, mesure) {
  const R = resultats(E);
  const C = S.colis.map((c, k) => ({ c, b: bonTri(D, c), r: R[k] || null }));
  const aTrier = C.filter((x) => x.b.s !== 'ecart');
  if (mesure === 'complet') return { juste: E.fait && C.some((x) => x.r && x.r.s != null) ? 1 : 0, sur: 1 };
  if (mesure === 'fauxEcarts') {
    const ok = aTrier.length > 0 && aTrier.every((x) => x.r && x.r.s != null && x.r.s !== 'ecart');
    return { juste: ok ? 1 : 0, sur: 1 };
  }
  const L = mesure === 'communes' ? aTrier.filter((x) => !x.c.piege) : mesure === 'pieges' ? aTrier.filter((x) => x.c.piege) : C.filter((x) => x.b.s === 'ecart');
  return { juste: L.filter((x) => juste(D, x.c, x.r)).length, sur: L.length };
}
// Un jalon de la vue, à poser dans `etapes` (la séance y ajoute `poids` et `groupe`). `series` : les séries lues (défaut : toutes) ;
// `coef` : leur poids relatif ({ s2: 0.5 } = la série 2 compte pour moitié). « À faire » tant qu'une série lue n'est pas finie ;
// ensuite `ok` avec la part juste (`fraction`), ou `ko` si rien n'est juste.
export function jalonTri(decl, seance, { id, titre, mesure, series = null, coef = {}, copie = false } = {}) {
  if (typeof seance !== 'string' || !seance.trim()) throw new Error('jalonTri(decl, seance, …) : il faut l’id de la séance (l’état est rangé sous db.tris[séance][id])');
  if (!MESURES_TRI.includes(mesure)) throw new Error(`jalonTri : mesure inconnue « ${mesure} » (${MESURES_TRI.join(', ')})`);
  const D0 = declarationDe(decl, {}, { copie });
  const ids = series || D0.series.map((S) => S.id);
  ids.forEach((s) => { if (!D0.series.some((S) => S.id === s)) throw new Error(`jalonTri « ${id} » : la série « ${s} » n’existe pas`); });
  const part = (db) => {
    const D = declarationDe(decl, db, { copie });
    const st = etatTri(db, seance, D.id);
    if (!st || !st.series) return null;
    let num = 0, den = 0;
    for (const s of ids) {
      const S = D.series.find((x) => x.id === s), E = st.series[s];
      if (!E || !E.fait) return null;
      const n = compterSerie(D, S, E, mesure);
      if (!n.sur) continue;
      const w = coef[s] != null ? coef[s] : 1;
      num += w * (n.juste / n.sur); den += w;
    }
    return den ? num / den : 0;
  };
  return {
    id: id || `tri-${mesure}`, titre: titre || id || mesure,
    verifier(db) { const p = part(db); return p == null ? { status: 'attente' } : { status: p > 0 ? 'ok' : 'ko' }; },
    fraction(db) { const p = part(db); return p == null ? 0 : p; },
  };
}
// Les cinq jalons, sur toutes les séries, sans poids (séances d'essai, tests).
export const etapesTri = (decl, seance, { copie = false } = {}) => MESURES_TRI.map((m) => jalonTri(decl, seance, { id: `tri-${m}`, titre: m, mesure: m, copie }));

// Les lignes du bilan d'une série (corrigé, bilan à l'écran).
export function lignesTri(D, S, E) {
  const R = resultats(E);
  return S.colis.map((c, k) => {
    const r = R[k] || null, b = bonTri(D, c);
    return { k, n: c.n, commune: c.commune, ton: !r || r.s == null ? 'non trié' : r.s === 'ecart' ? `à l’écart (${MOTIFS_TRI[r.motif] || '?'})` : r.s,
      bon: b.s === 'ecart' ? `à l’écart (${MOTIFS_TRI[b.motif]})` : b.s, juste: juste(D, c, r) };
  });
}

/* ================================================================ le dessin */
const P = (pts) => pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
const kgTexte = (kg) => (Math.round(kg * 10) / 10).toFixed(1).replace('.', ',');
// Un carton en perspective cavalière ; (x0, y0) = coin avant gauche du dessus. Fermé : scotch sur le dessus et la face avant.
// Enfoncé : fermé, un coin avant écrasé (marqué, mais il part). Ouvert : quatre rabats ouverts, l'intérieur sombre, du papier
// froissé, le scotch arraché qui pend (page d'essai v4, « applique-toi sur le carton ouvert »).
export function boite(c, x0, y0, w, d, h) {
  const ouvert = c.etat === 'ouvert', f = Math.max(d, 14) * 1.15;
  const T = (a, b) => [x0 + a, y0 + b];
  let s = '';
  if (ouvert) {
    s += `<polygon points="${P([T(d, -d), T(w + d, -d), T(w + d - 4, -d - f), T(d + 6, -d - f * 0.9)])}" fill="#dcc08f" stroke="#a9824f" stroke-width="1.6"/>`;
    s += `<polygon points="${P([T(0, 0), T(d, -d), T(d - f, -d - f * 0.25), T(-f, -f * 0.05)])}" fill="#d2b380" stroke="#a9824f" stroke-width="1.6"/>`;
  }
  s += `<polygon points="${P([T(w, 0), T(w + d, -d), T(w + d, h - d), T(w, h)])}" fill="#b8915b" stroke="#a9824f" stroke-width="2"/>`;
  s += `<rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#c9a26b" stroke="#a9824f" stroke-width="2"/>`;
  if (!ouvert) {
    s += `<polygon points="${P([T(0, 0), T(d, -d), T(w + d, -d), T(w, 0)])}" fill="#d8b47e" stroke="#a9824f" stroke-width="2"/>`;
    s += `<polygon points="${P([T(w / 2 - 8, 0), T(w / 2 - 8 + d, -d), T(w / 2 + 8 + d, -d), T(w / 2 + 8, 0)])}" fill="rgba(240,226,190,.6)"/>`;
    s += `<rect x="${(x0 + w / 2 - 8).toFixed(1)}" y="${y0.toFixed(1)}" width="16" height="${Math.min(h * 0.35, 26).toFixed(1)}" fill="rgba(240,226,190,.6)"/>`;
    if (c.etat === 'enfonce') {
      // Le coin avant droit écrasé : un creux plus sombre et deux plis, le scotch tient.
      const e = Math.min(w, h) * 0.28;
      s += `<polygon points="${P([T(w - e, 0), T(w, 0), T(w, e), T(w - e * 0.35, e * 0.45)])}" fill="#9c7744" stroke="#7d5c30" stroke-width="1.4"/>`;
      s += `<polyline points="${P([T(w - e * 1.2, e * 0.15), T(w - e * 0.35, e * 0.45), T(w - e * 0.1, e * 1.2)])}" fill="none" stroke="#7d5c30" stroke-width="1.2"/>`;
    }
  } else {
    s += `<polygon points="${P([T(0, 0), T(d, -d), T(w + d, -d), T(w, 0)])}" fill="#4a3620" stroke="#a9824f" stroke-width="2"/>`;
    s += `<polygon points="${P([T(d, -d), T(w + d, -d), T(w + d * 0.55, -d * 0.45), T(d * 0.55, -d * 0.45)])}" fill="#7a5c34"/>`;
    s += `<path d="M${P([T(w * 0.3, -d * 0.3)])} q8,-14 18,-4 q6,-12 16,-2 q10,-8 12,6 z" fill="#ece6da" stroke="#b9b1a3" stroke-width="1"/>`;
    s += `<polygon points="${P([T(w, 0), T(w + d, -d), T(w + d + f, -d - f * 0.2), T(w + f, -f * 0.02)])}" fill="#d2b380" stroke="#a9824f" stroke-width="1.6"/>`;
    s += `<polygon points="${P([T(0, 0), T(w, 0), T(w - 6, f * 0.85), T(w * 0.55, f * 0.95), T(w * 0.45, f * 0.7), T(6, f * 0.8)])}" fill="#b98f58" stroke="#a9824f" stroke-width="1.6"/>`;
    s += `<polygon points="${P([T(w / 2 - 8, 0), T(w / 2 + 8, 0), T(w / 2 + 8, f * 0.95 + 10), T(w / 2 + 4, f * 0.95 + 6), T(w / 2, f * 0.95 + 12), T(w / 2 - 4, f * 0.95 + 5), T(w / 2 - 8, f * 0.95 + 11)])}" fill="rgba(240,226,190,.75)" stroke="#bfae86" stroke-width="1"/>`;
  }
  return s;
}
// La vue de près : le carton et ses trois cotes ; l'échelle s'adapte au plus grand côté.
export function dessinCarton(c) {
  const [L, l, H] = c.dim, k = Math.min(2.2, 220 / (L + l * 0.5)), w = L * k, d = l * k * 0.5, h = H * k;
  const f = c.etat === 'ouvert' ? Math.max(d, 14) * 1.15 : 0;
  const x0 = 80 + f * 0.6, y0 = 14 + d + f, W = Math.max(300, x0 + w + d + f + 60), Hs = y0 + h + 42;
  const cote = (x1, y1, x2, y2) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#2f5f9e" stroke-width="1.6" marker-start="url(#tri-fl)" marker-end="url(#tri-fl)"/>`;
  const txt = (x, y, t, a = 'middle') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="14" font-weight="700" fill="#2f5f9e" text-anchor="${a}">${t}</text>`;
  return `<svg viewBox="0 0 ${W.toFixed(0)} ${Hs.toFixed(0)}" role="img" aria-label="Le carton : ${L} cm de long, ${l} cm de large, ${H} cm de haut" data-t-carton>`
    + `<defs><marker id="tri-fl" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2f5f9e"/></marker></defs>`
    + boite(c, x0, y0, w, d, h)
    + cote(x0, y0 + h + 16, x0 + w, y0 + h + 16) + txt(x0 + w / 2, y0 + h + 36, `${L} cm`)
    + cote(x0 + w + 8, y0 + h + 4, x0 + w + d + 8, y0 + h - d + 4) + txt(x0 + w + d / 2 + 34, y0 + h - d / 2 + 14, `${l} cm`)
    + cote(x0 - 14, y0, x0 - 14, y0 + h) + txt(x0 - 20, y0 + h / 2 + 5, `${H} cm`, 'end')
    + '</svg>';
}
// Le poste : tapis, balance numérique au milieu dessous, le colis cliquable à l'échelle de ses dimensions (tailles minimales).
export function dessinPoste(c) {
  let h = '<rect x="140" y="214" width="140" height="14" fill="#6c7279"/>'
    + '<rect x="125" y="228" width="170" height="56" rx="8" fill="#2c3035" stroke="#555b62" stroke-width="2"/>'
    + '<rect x="138" y="237" width="144" height="36" rx="4" fill="#0f1214" stroke="#3d4349"/>'
    + `<text x="205" y="265" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-size="27" font-weight="700" fill="#ffd36a" data-t-balance>${c ? kgTexte(c.kg) : '0,0'}</text>`
    + '<text x="275" y="269" text-anchor="end" font-size="11" fill="#c9b37a">kg</text>'
    + '<text x="210" y="297" text-anchor="middle" font-size="11.5" fill="#555047">balance du poste de lecture</text>'
    + '<rect x="0" y="186" width="420" height="28" rx="6" fill="#3b3f44"/>';
  for (let x = 8; x < 420; x += 34) h += `<rect x="${x}" y="191" width="20" height="18" rx="3" fill="#4a4f55"/>`;
  h += '<rect x="130" y="183" width="160" height="5" rx="2" fill="#9aa1a8"/>';
  if (!c) return `${h}<text x="210" y="110" text-anchor="middle" font-size="15" fill="#555047">Plus aucun colis sur le tapis.</text>`;
  const [L, l, H] = c.dim, k = Math.min(2.3, 280 / (L + l * 0.5)), w = Math.max(72, L * k), d = Math.max(14, l * k * 0.45), hh = Math.max(40, H * k);
  const ouvert = c.etat === 'ouvert', f = ouvert ? Math.max(d, 14) * 1.15 : 0;
  const x = 210 - (w + d) / 2, y = 183 - hh;
  h += `<g class="tri-colis" data-t-colis tabindex="0" role="button" aria-label="Voir le colis de près">${boite(c, x, y, w, d, hh)}`;
  // L'étiquette vue de loin : illisible tant qu'on ne clique pas.
  if (!ouvert) {
    const ew = Math.min(64, w - 12), eh = Math.min(hh - 10, 40), ey = Math.min(y + Math.min(30, hh * 0.3) + 2, y + hh - eh - 4), ex = x + w - ew - 5;
    h += `<rect x="${ex.toFixed(1)}" y="${ey.toFixed(1)}" width="${ew.toFixed(1)}" height="${eh.toFixed(1)}" rx="2" fill="#fbf8f1" stroke="#9a948a"/>`;
    for (let n = 0; n < 4 && 7 + n * 8 < eh; n++) h += `<rect x="${(ex + 5).toFixed(1)}" y="${(ey + 6 + n * 8).toFixed(1)}" width="${(ew * (n === 3 ? 0.45 : 0.75)).toFixed(1)}" height="3.5" rx="1" fill="#b3ada2"/>`;
  } else {
    const ew = Math.min(64, w * 0.38), ex = x + 6, ey = y + f * 0.95 + 6, eh = Math.min(36, hh - f - 12);
    if (eh > 14) {
      h += `<rect x="${ex.toFixed(1)}" y="${ey.toFixed(1)}" width="${ew.toFixed(1)}" height="${eh.toFixed(1)}" rx="2" fill="#fbf8f1" stroke="#9a948a"/>`;
      for (let n = 0; n < 3 && 7 + n * 8 < eh; n++) h += `<rect x="${(ex + 5).toFixed(1)}" y="${(ey + 6 + n * 8).toFixed(1)}" width="${(ew * 0.7).toFixed(1)}" height="3.5" rx="1" fill="#b3ada2"/>`;
    }
  }
  return `${h}<rect x="${(x - f - 4).toFixed(1)}" y="${(y - d - f - 4).toFixed(1)}" width="${(w + d + 2 * f + 8).toFixed(1)}" height="${(hh + d + f + 8).toFixed(1)}" rx="6" class="tri-contour"/></g>`;
}

/* ================================================================ la vue */
export function creerTri(decl, { copie = false, graine = '', niveau = 'standard' } = {}) {
  const COPIE = !!copie;
  let D;
  try { D = typeof decl === 'function' ? decl(graine, { niveau, copie: COPIE }) : decl; }
  catch (x) { throw new Error(`tri : la fonction de la graine ne marche pas (${x && x.message ? x.message : x})`); }
  const fautes = verifierTri(D, { copie: COPIE });
  if (fautes.length) throw new Error(`tri${D && typeof D.id === 'string' && D.id ? ` « ${D.id} »` : ''} : ${fautes.join(' ; ')}`);
  const MOTIFS = motifsDe(D.regles);
  const geste = (g) => `tri:${D.id}:${g}`;
  const signaux = [...D.series.map((S) => geste(`${S.id}:fini`)), ...D.series.flatMap((S) => S.colis.filter((c) => c.geste).map((c) => geste(c.geste)))];
  const qui = D.qui && D.qui.prenom ? D.qui : null;
  const ecart = Object.assign({ libelle: 'À l’écart', sous: 'expertise' }, D.ecart || {});
  // L'interface en mémoire (ce qui n'est pas du travail) : le choix en cours, la fiche ouverte, le dernier retour, le minuteur.
  const ui = { choix: { s: null, motif: null }, fiche: false, retour: '', cle: '', reste: 0 };
  const bloque = (st, api) => !!(api && api.figee);

  const colisDe = (S, E) => (E.fait || E.pos >= E.file.length ? null : S.colis[E.file[E.pos]]);
  const decides = (E) => Object.keys(E.res).length;
  const tempsDe = (S, api) => secondesSerie(S, { tiersTemps: !!(api && api.tiersTemps) });
  // Le minuteur court-il pour ce colis ? Pas en guidage, pas sur le premier colis de la série (le temps de lire).
  const chrono = (S, E) => S.temps !== 'guidage' && !E.fait && !(E.pos === 0 && decides(E) === 0);

  function consigne(S, api) {
    if (S.consigne) return S.consigne;
    const n = tempsDe(S, api);
    if (S.temps === 'evaluation') return `Trie la série seul : aucune aide ne s’affiche. À partir du deuxième colis, chacun reste ${n} secondes au poste ; un colis que tu laisses passer revient une fois à la fin.`;
    if (S.temps === 'entrainement') return `Ça va vite : à partir du deuxième colis, chacun reste ${n} secondes au poste. Un colis que tu laisses passer fait le tour de la boucle et revient à la fin.`;
    return 'Un colis arrive sur la balance. Clique-le pour lire son étiquette et voir ses dimensions, cherche la commune dans le plan de tri, choisis la sortie de sa tournée, puis envoie-le. S’il ne peut pas partir, mets-le à l’écart et dis pourquoi.';
  }
  const libChoix = (s) => (s === 'ecart' ? ecart.libelle : s);

  function ficheHtml(c) {
    if (!c) return '<div class="tri-vide"></div>';
    if (!ui.fiche) return '<div class="tri-vide">Clique le carton pour lire son étiquette et voir ses dimensions.</div>';
    const floue = c.etat === 'floue';
    return `<div class="tri-fiche-tete"><span>Le colis de près</span><button type="button" class="btn" data-t="fermer">Fermer</button></div>
      <div class="tri-fiche-carton">${dessinCarton(c)}</div>
      <div class="tri-etiq${floue ? ' tri-floue' : ''}" data-t-etiquette>
        <div class="tri-num">${ech(c.n)}</div>
        <div class="tri-flou">Point Relais : <b>${ech(c.relais)}</b><br>${ech(c.rue)}</div>
        <div class="tri-dest tri-flou">${ech(cpDe(D, c.commune))} ${ech(c.commune.toUpperCase())}</div>
        <div class="tri-cab"></div>
        <div class="tri-mini">étiquette reconstituée</div>
      </div>`;
  }
  function sortiesHtml(S, E, c, dis) {
    const R = E.res, nb = {};
    Object.values(R).forEach((r) => { if (r && r.s != null) nb[r.s] = (nb[r.s] || 0) + 1; });
    const bac = (id) => `<span class="tri-bac" aria-hidden="true">${'<i></i>'.repeat(Math.min(nb[id] || 0, 18))}</span>`;
    const d = !c || dis ? ' disabled' : '';
    return D.sorties.map((x, k) => `<button type="button" class="tri-sortie" data-t="sortie" data-s="${ech(x.id)}" aria-pressed="${ui.choix.s === x.id}"${d}>
        <span class="tri-t">${ech(x.id)}</span><small>${ech(x.nom || '')}</small><span class="tri-kbd">${k + 1}</span>${bac(x.id)}</button>`).join('')
      + `<button type="button" class="tri-sortie tri-ecart" data-t="sortie" data-s="ecart" aria-pressed="${ui.choix.s === 'ecart'}"${d}>
        <span class="tri-t">${ech(ecart.libelle)}</span><small>${ech(ecart.sous || '')}</small><span class="tri-kbd">0</span>${bac('ecart')}</button>`;
  }
  function validerHtml(c, dis) {
    const { s, motif } = ui.choix;
    const pret = !!(c && s && (s !== 'ecart' || motif)) && !dis;
    const motifs = s === 'ecart' ? `<span class="tri-motifs" role="group" aria-label="Pourquoi le mets-tu à l’écart ?"><span>Pourquoi ?</span>${MOTIFS.map((m) =>
      `<button type="button" class="tri-motif" data-t="motif" data-m="${m}" aria-pressed="${motif === m}"${dis ? ' disabled' : ''}>${ech(MOTIFS_TRI[m])}</button>`).join('')}</span>` : '';
    const choix = !c ? '' : !s ? 'Choisis une sortie.' : s === 'ecart' ? (motif ? `Ton choix : <b>à l’écart, ${ech(MOTIFS_TRI[motif].toLowerCase())}</b>` : 'Dis pourquoi tu le mets à l’écart.') : `Ton choix : <b>${ech(s)}</b>`;
    const lib = s === 'ecart' ? 'Mettre le colis à l’écart' : s ? `Envoyer le colis en ${ech(s)}` : 'Envoyer le colis';
    return `${motifs}<span class="tri-choix" data-t-choix>${choix}</span>
      <button type="button" class="btn btn-p tri-envoyer" data-t="envoyer"${pret ? '' : ' disabled'}>${lib}</button>`;
  }
  function planHtml() {
    const R = D.regles || {};
    const li = [];
    if (MOTIFS.includes('poids')) li.push(`il pèse plus de <b>${ech(String(R.poidsMax).replace('.', ','))} kg</b> ;`);
    if (MOTIFS.includes('taille')) {
      const a = R.longueurMax != null ? `plus de <b>${R.longueurMax} cm</b> de long` : '';
      const b = R.sommeMax != null ? `plus de <b>${R.sommeMax} cm</b> en additionnant longueur, largeur et hauteur` : '';
      li.push(`il mesure ${[a, b].filter(Boolean).join(', ou ')} ;`);
    }
    if (MOTIFS.includes('carton')) li.push('son carton est ouvert ;');
    if (MOTIFS.includes('etiquette')) li.push('son étiquette ne se lit pas.');
    return `<h3>Plan de tri</h3>
      <table class="tri-plan"><thead><tr><th>Sortie</th><th>Communes (code postal)</th></tr></thead><tbody>${D.sorties.map((x) =>
        `<tr><td class="tri-t">${ech(x.id)}</td><td>${x.communes.map(([cm, cp]) => `${ech(cm)} (${ech(cp)})`).join(', ')}</td></tr>`).join('')}</tbody></table>
      <div class="tri-regles"><b>Un colis ne part pas si :</b><ul>${li.map((x) => `<li>${x}</li>`).join('')}</ul>
        ${R.source ? `<span class="tri-source">${ech(R.source)}</span>` : ''}</div>`;
  }
  function bilanHtml(S, E, api) {
    const dernier = S === D.series[D.series.length - 1];
    const suite = !dernier ? `<button type="button" class="btn btn-p" data-t="suite">Passer à la série suivante →</button>` : '';
    if (S.temps === 'evaluation' && !(api && api.estProf)) {
      return `<div class="tri-bilan" data-t-bilan><h3>${ech(S.titre || 'Série')} terminée</h3>
        <p>Ton tri est enregistré. Il sera corrigé avec ta copie.</p>${suite}${dernier && D.fin ? `<p>${ech(D.fin)}</p>` : ''}</div>`;
    }
    const L = lignesTri(D, S, E), nb = L.filter((l) => l.juste).length;
    const rejouer = S.temps === 'guidage' && !bloque(null, api) && !E.vu ? '<button type="button" class="btn" data-t="rejouer">Rejouer la série</button>' : '';
    return `<div class="tri-bilan" data-t-bilan><h3>Bilan de la série : ${nb} colis sur ${L.length} bien triés</h3>
      ${E.premier && S.temps === 'guidage' ? '<p class="note">Seul ton premier passage compte pour la note.</p>' : ''}
      <table class="tri-tab"><thead><tr><th>Colis</th><th>Commune</th><th>Ton tri</th><th>Le bon tri</th><th></th></tr></thead><tbody>${L.map((l) =>
        `<tr data-t-ligne="${l.k}"><td>${ech(l.n)}</td><td>${ech(l.commune)}</td><td>${ech(l.ton)}</td><td>${ech(l.bon)}</td><td class="${l.juste ? 'tri-ok' : 'tri-ko'}">${l.juste ? '✓' : '✗'}</td></tr>`).join('')}</tbody></table>
      <p class="tri-ligne">${rejouer}${suite}</p>${dernier && D.fin ? `<p>${ech(D.fin)}</p>` : ''}</div>`;
  }
  function contenuHtml(st, api) {
    completer(D, st);
    const S = serieCourante(D, st), E = st.series[S.id], c = colisDe(S, E), dis = bloque(st, api);
    const cle = `${S.id}:${E.pos}:${E.fait}`;
    if (ui.cle !== cle) { ui.cle = cle; ui.choix = { s: null, motif: null }; ui.fiche = false; ui.reste = tempsDe(S, api); }
    const boucle = E.tours.filter((k) => E.file.indexOf(k, E.pos) >= 0).length;
    const compteur = E.fait ? 'Série terminée' : `Colis ${Math.min(decides(E) + 1, S.colis.length)} / ${S.colis.length}${boucle ? ` · ${boucle} sur la boucle` : ''}`;
    const titre = D.series.length > 1 ? `${S.titre || S.id} (${D.series.indexOf(S) + 1} sur ${D.series.length})` : (S.titre || '');
    const t = chrono(S, E) && c && !dis;
    return `<div class="tri-tete"><b>${ech(titre)}</b>${D.lieu ? `<span>${ech(D.lieu)}</span>` : ''}<span class="tri-compteur" data-t-compteur>${compteur}</span></div>
      <p class="tri-consigne">${qui ? `<b>${ech(qui.prenom)}${qui.poste ? `, ${ech(qui.poste)}` : ''}</b>` : ''}${ech(consigne(S, api))}</p>
      ${E.fait ? bilanHtml(S, E, api) : `<div class="tri-grille">
        <div class="tri-zone">
          <div class="tri-haut">
            <div><svg class="tri-scene" data-t-scene viewBox="0 0 420 300" role="img" aria-label="Le tapis, la balance et le colis au poste de lecture">${dessinPoste(c)}</svg>
              <div class="tri-minuteur"${t ? '' : ' hidden'} data-t-minuteur><i style="width:${Math.max(0, (ui.reste / Math.max(1, tempsDe(S, api))) * 100).toFixed(1)}%"></i></div></div>
            <div class="tri-fiche" data-t-fiche aria-live="polite">${ficheHtml(c)}</div>
          </div>
          <div class="tri-sorties" data-t-sorties>${sortiesHtml(S, E, c, dis)}</div>
          <div class="tri-valider" data-t-valider>${validerHtml(c, dis)}</div>
          <div class="tri-retour" data-t-retour aria-live="polite">${ui.retour}</div>
        </div>
        <div class="tri-zone tri-droite">${planHtml()}</div>
      </div>`}`;
  }
  function html(st, api) {
    return `<section class="tri" data-tri="${ech(D.id)}" data-t-tri${COPIE ? ' data-t-copie' : ''}>${contenuHtml(st, api)}</section>`;
  }

  /* ---------------------------------------------------------------- les gestes */
  // Le colis du moment quitte le tapis : envoyé, écarté, ou laissé passer (`s` null). Rend le texte du retour.
  function decider(st, api, s, motif) {
    const S = serieCourante(D, st), E = st.series[S.id], c = colisDe(S, E);
    if (!c) return '';
    const k = E.file[E.pos];
    let txt = '', quitte = true;
    if (s == null) {
      if (E.tours.includes(k)) { E.res[k] = { s: null, motif: null }; txt = `<span class="tri-ko">Colis non trié.</span> Le colis ${ech(c.n)} est passé deux fois sans être envoyé${qui ? ` : ${ech(qui.prenom)} le trie à la main` : ''}.`; }
      else { E.tours.push(k); E.file.push(k); quitte = false; txt = `Le colis ${ech(c.n)} est passé sans être envoyé : il fait le tour de la boucle et reviendra à la fin.`; }
    } else {
      E.res[k] = { s, motif: s === 'ecart' ? motif : null };
      const b = bonTri(D, c), ok = juste(D, c, E.res[k]);
      if (S.temps === 'guidage') {
        const de = `Colis ${ech(c.n)} : `;
        if (ok) txt = `${de}<span class="tri-ok">✓ Juste.</span> ${b.s === 'ecart' ? `${qui ? ech(qui.prenom) : 'On'} l’emporte au poste d’${ech(ecart.sous || 'expertise')}.` : `${ech(c.commune)} part bien en ${ech(b.s)}.`}`;
        else if (b.s === 'ecart' && s === 'ecart') txt = `${de}<span class="tri-ko">✗ Bonne idée de l’écarter, mais pas pour cette raison.</span> ${REGARDER[b.motif]}`;
        else if (b.s === 'ecart') txt = `${de}<span class="tri-ko">✗ Ce colis ne peut pas partir.</span> ${REGARDER[b.motif]}${qui ? ` ${ech(qui.prenom)} le récupère dans le bac.` : ''}`;
        else if (s === 'ecart') txt = `${de}<span class="tri-ko">✗ Ce colis pouvait partir.</span> Il est en règle : ${ech(c.commune)}, c’est ${ech(b.s)}.${c.piege ? ` ${ech(c.piege)}` : ''}`;
        else txt = `${de}<span class="tri-ko">✗ ${ech(c.commune)} n’est pas en ${ech(s)}.</span> Cherche la commune dans le plan de tri.${c.piege ? ` ${ech(c.piege)}` : ''}`;
      } else txt = `Colis ${ech(c.n)} ${s === 'ecart' ? 'mis à l’écart' : `envoyé en ${ech(s)}`}.`;
    }
    if (quitte && c.geste) api.signal && api.signal(geste(c.geste));
    E.pos += 1;
    if (E.pos >= E.file.length) {
      E.fait = true;
      if (!E.premier) E.premier = JSON.parse(JSON.stringify(E.res));
      api.signal && api.signal(geste(`${S.id}:fini`));
    }
    return txt;
  }

  // Le clavier : un seul écouteur pour la page, branché sur la dernière vue montée.
  function brancher(z, st, api) {
    const racine = z.querySelector('[data-t-tri]');
    if (!racine) return;
    completer(D, st);
    const gele = () => !!(api.gele && api.gele());
    function rendre() {
      const a = document.activeElement;
      const avant = a && racine.contains(a) ? (a.dataset && a.dataset.t ? `[data-t="${a.dataset.t}"]${a.dataset.s ? `[data-s="${a.dataset.s}"]` : ''}${a.dataset.m ? `[data-m="${a.dataset.m}"]` : ''}`
        : a.hasAttribute && a.hasAttribute('data-t-colis') ? '[data-t-colis]' : null) : null;
      racine.innerHTML = contenuHtml(st, api);
      if (avant && auClavier()) {
        const b = racine.querySelector(avant) || racine.querySelector('[data-t-colis]') || racine.querySelector('[data-t="suite"],[data-t="rejouer"]');
        if (b && !b.disabled) b.focus({ preventScroll: true });
      }
    }
    const courant = () => { const S = serieCourante(D, st); const E = st.series[S.id]; return { S, E, c: colisDe(S, E) }; };
    function choisir(s) {
      const { c } = courant();
      if (!c || bloque(st, api) || gele()) return;
      ui.choix = { s, motif: s === 'ecart' ? ui.choix.motif : null };
      rendre();
    }
    function envoyer() {
      const { c } = courant();
      const { s, motif } = ui.choix;
      if (!c || bloque(st, api) || gele() || !s || (s === 'ecart' && !motif)) return;
      ui.retour = decider(st, api, s, motif);
      api.sauver();
      rendre();
    }
    function laisserPasser() {
      const { c } = courant();
      if (!c || bloque(st, api)) return;
      ui.retour = decider(st, api, null, null);
      api.sauver();
      rendre();
    }
    racine.addEventListener('click', (ev) => {
      if (gele()) return;
      if (ev.target.closest && ev.target.closest('[data-t-colis]')) { if (!bloque(st, api)) { ui.fiche = true; rendre(); } return; }
      const b = ev.target.closest && ev.target.closest('button[data-t]');
      if (!b || b.disabled) return;
      const quoi = b.dataset.t;
      if (quoi === 'fermer') { ui.fiche = false; rendre(); return; }
      if (bloque(st, api)) return;
      if (quoi === 'sortie') choisir(b.dataset.s);
      else if (quoi === 'motif') { ui.choix.motif = b.dataset.m; rendre(); }
      else if (quoi === 'envoyer') envoyer();
      else if (quoi === 'suite') {
        const { E } = courant();
        if (!E.fait) return;
        E.vu = true; ui.retour = '';
        api.sauver(); rendre();
      } else if (quoi === 'rejouer') {
        const { S, E } = courant();
        if (!E.fait || S.temps !== 'guidage') return;
        const premier = E.premier;
        st.series[S.id] = Object.assign(serieNeuve(S), { premier });
        ui.retour = ''; ui.cle = '';
        api.sauver(); rendre();
      }
    });
    racine.addEventListener('keydown', (ev) => {
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.hasAttribute && ev.target.hasAttribute('data-t-colis')) {
        ev.preventDefault(); if (!gele() && !bloque(st, api)) { ui.fiche = true; rendre(); }
      }
    });
    actif = { racine, clavier(ev) {
      if (gele() || bloque(st, api)) return;
      const t = ev.target;
      if (t && t.closest && t.closest('input,textarea,select,[contenteditable="true"]')) return;
      const k = ev.key;
      if (/^[1-9]$/.test(k) && +k <= D.sorties.length) { choisir(D.sorties[+k - 1].id); ev.preventDefault(); }
      else if (k === '0') { choisir('ecart'); ev.preventDefault(); }
      else if (k === 'Enter' && !(t && t.closest && t.closest('button,[data-t-colis],a'))) { envoyer(); }
    } };
    if (!ecouteClavier) {
      ecouteClavier = true;
      document.addEventListener('keydown', (ev) => { if (actif && actif.racine.isConnected) actif.clavier(ev); });
    }
    // Le minuteur : par écart d'horloge, arrêté onglet caché et pendant une question au fil. Il s'arrête de lui-même quand la vue
    // n'est plus à l'écran ; le temps qui restait est gardé en mémoire (revenir sur l'écran ne le remet pas à neuf).
    let dernier = Date.now();
    const minuterie = setInterval(() => {
      if (!racine.isConnected) { clearInterval(minuterie); return; }
      const t = Date.now(), dt = Math.min(1, (t - dernier) / 1000);
      dernier = t;
      const { S, E, c } = courant();
      if (!c || !chrono(S, E) || bloque(st, api) || gele() || (typeof document !== 'undefined' && document.hidden)) return;
      ui.reste -= dt;
      const j = racine.querySelector('[data-t-minuteur] i');
      if (j) j.style.width = `${Math.max(0, (ui.reste / Math.max(1, tempsDe(S, api))) * 100).toFixed(1)}%`;
      if (ui.reste <= 0) laisserPasser();
    }, 200);
    // Pour les tests : l'état d'écran et le passage du temps, sans attendre.
    racine.__tri = { lire: () => ({ choix: { ...ui.choix }, fiche: ui.fiche, reste: ui.reste }), avancer: (s) => { ui.reste -= s; }, declaration: D };
  }

  return {
    id: D.id,
    nav: { libelle: D.libelle || 'Ligne de tri' },
    signaux,
    copie: COPIE,
    declaration: D,
    etatNeuf: () => completer(D, { series: {} }),
    html,
    brancher,
  };
}
let ecouteClavier = false;
let actif = null;
