// Vue « quai de réception » — recevoir un camion sous contrainte de temps hors froid.
//
// Écrite le 03/10/2026 (chantier P1, brief `docs/briefs/MOTEUR-vue-quai.md`), d'après la
// maquette jouable v8 (`docs/briefs/picard/maquette-quai-picard.html`), qui FAIT FOI pour
// l'interaction : même déroulé, mêmes durées, mêmes textes. Le code de la maquette était
// jetable (un état global, un seul fichier) : ici on reprend le comportement, pas le code.
//
// Elle vit dans l'environnement d'entreprise (`entreprise.js`), comme l'inventaire et la
// tournée, et n'existe que si la séance déclare `quai`. Elle ne connaît AUCUNE entreprise :
// lieu, photos, camion, palettes, coûts des gestes et aides viennent de la déclaration ; les
// couleurs, du `THEME` de l'entreprise. Pilote : Picard (ENT-4.1 à 4.4).
//
// Quatre étapes, un écran par étape :
//   1. le camion arrive — BL et ticket de l'enregistreur (lu portes fermées : pas de temps hors
//      froid), puis « Oui, vous pouvez ouvrir et décharger » ;
//   2. le déchargement, animé sur la photo du quai : le temps hors froid du lot démarre à
//      l'ouverture de la porte, le chauffeur pose les palettes une à une ;
//   3. le contrôle de chaque palette — dessinée en 3D : faire le tour, sonder à cœur, lire
//      l'étiquette, compter, décider (accepter / réserves / refuser) et donner le motif ;
//   4. rentrer le lot accepté en chambre froide (le temps hors froid s'arrête), écrire les
//      réserves précises sur le BL, faire signer le chauffeur, clore.
//
// Deux temps : le TEMPS DU QUAI (simulé, chaque geste coûte des minutes) et le TEMPS HORS FROID
// du lot (un seul pour tout le lot : le transporteur décharge tout). En évaluation, un troisième,
// le TEMPS RÉEL passé : il MESURE, il ne coupe rien (décision de Tristan, 03/10/2026). Il est
// compté par l'environnement, quel que soit l'écran (`entreprise.js`), et rangé ici dans l'état.
//
// L'état vit dans la base de l'élève, sous `db.quais[<quai.id>]` : une séance, un quai.
// Les jalons et la note se lisent avec `jalonsQuai` / `noteQuai`, exportées : la séance les
// importe (`etapesQuai`) et l'écran les affiche au bilan — une seule lecture, pas deux.
//
// Ce qui est construit pour plus tard sans être utilisé (brief §7) : `camions` est une liste,
// et les palettes sont rangées par identifiant ; le déchargement place n palettes.

import { ech } from '../ui.js';

/* ================================================================== libellés */
export const MOTIFS = {
  aucun: 'aucun motif', temperature: 'Température non conforme', avarie: 'Cartons endommagés',
  manquant: 'Manquant', produit: 'Produit différent de la commande',
};
export const DECISIONS = { '': '— à décider —', accepter: 'Accepter', reserves: 'Accepter avec réserves', refuser: 'Refuser' };
const VUES = ['vue de l’avant', 'vue du côté droit', 'vue de l’arrière', 'vue du côté gauche'];
const QCM_TICKET = [
  { v: 'rien', lib: 'Rien à signaler, la température est restée stable', court: 'rien à signaler' },
  { v: 'bref', lib: 'Un pic très bref, sans conséquence', court: 'pic bref' },
  { v: 'long', lib: 'Une remontée qui a duré : je la signale et je sonde chaque palette à cœur', court: 'remontée qui a duré' },
];
const ETAPES = ['① Le camion arrive', '② Déchargement', '③ Contrôle des palettes', '④ Réserves et chambre froide'];
const COUTS_DEFAUT = { ticket: 2, sonder: 1, tourner: 0.5, etiquette: 0.5, compter: 1, rentrer: 3, ligne: 1, signer: 1 };

/* ==================================================================== formats */
const fmtMin = (m) => { const e = Math.floor(m), s = m - e >= 0.5; if (!e && s) return '30 s'; return s ? `${e} min 30` : `${e} min`; };
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const v1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
const virgule = (n) => String(n).replace('.', ',');
const fmtT = (v) => `${String(v).replace('.', ',').replace('-', '−')} °C`;
const minutesDe = (hm) => { const [h, m] = String(hm || '06:00').split(':').map(Number); return h * 60 + (m || 0); };
const palier = (v, paliers) => { for (const [seuil, pts] of paliers) if (v <= seuil) return pts; return 0; };
// Ce que l'élève tape : « −14,2 », « -14.2 », « 2 ». Vide ou autre chose → NaN.
const nombre = (brut) => {
  const t = String(brut == null ? '' : brut).trim().replace(/\s/g, '').replace(/[−–]/g, '-').replace(',', '.');
  return t === '' || !/^[+-]?\d+(\.\d+)?$/.test(t) ? NaN : Number(t);
};

/* =================================================================== réglages */
// La déclaration de la séance, complétée de ses valeurs par défaut, et les palettes de tous les
// camions mises à plat (chacune garde le numéro de son camion). Les valeurs attendues sont
// CALCULÉES depuis la palette, jamais recopiées : cartons réels, manquants, avaries.
function reglages(Q) {
  const camions = Q.camions || [];
  const palettes = [];
  camions.forEach((c, ci) => (c.palettes || []).forEach((p) => {
    const manque = p.manque || [], avarie = p.avarie || {};
    const reel = p.W * p.D * p.L - manque.length;
    palettes.push(Object.assign({}, p, { camion: ci, manque, avarie, reel,
      avaries: Object.keys(avarie).length, manquants: p.bl - reel }));
  }));
  const aides = Object.assign({ regleCouches: false, detailComptage: false, repere: false, chefDeQuai: false, consignes: false }, Q.aides || {});
  return {
    lieu: Object.assign({ nom: 'Quai', temp: 4, refrigere: true, chambre: { nom: 'Chambre froide', temp: -23 } }, Q.lieu || {}),
    seuil: Q.seuilHorsFroid || 30,
    D: Object.assign({ ouverture: 0.5, parPalette: 1 }, Q.dechargement || {}),
    couts: Object.assign({}, COUTS_DEFAUT, Q.couts || {}),
    aides, camions, palettes, depart: minutesDe(camions[0] && camions[0].arrivee),
  };
}
export const dureeDechargement = (n, D) => D.ouverture + n * D.parPalette;

/* ======================================================================= état */
export function etatNeuf(Q) {
  const R = reglages(Q);
  const palettes = {};
  R.palettes.forEach((p) => { palettes[p.id] = paletteNeuve(); });
  return {
    v: 1, etape: 1, minute: 0, froid: 0, reel: 0, tiersTemps: false,
    ticketLu: false, ticketRep: null, decharge: false, evts: 0, sel: 0, journal: [],
    palettes, rentre: false, heureRentre: null, ecrit: false, lignes: [], deballage: false, mentionEcrite: false,
    signe: false, chefVu: false, passeOutreChef: false, ordreFroidDabord: null, paroleChauffeur: '', fini: false,
  };
}
const paletteNeuve = () => ({ vue: 0, vues: [0], sonde: null, compte: null, etiqVue: false, detail: {}, decision: '', motif: 'aucun', res: '' });

// Une base écrite avec une autre version du contenu : on complète sans rien effacer.
function normaliser(e, R) {
  if (!e.palettes) e.palettes = {};
  R.palettes.forEach((p) => { if (!e.palettes[p.id]) e.palettes[p.id] = paletteNeuve(); });
  if (!Array.isArray(e.journal)) e.journal = [];
  if (!Array.isArray(e.lignes)) e.lignes = [];
  if (typeof e.reel !== 'number') e.reel = 0;
  if (e.sel >= R.palettes.length) e.sel = 0;
}

/* ===================================================================== bilan */
// Ce que la réserve doit préciser, selon le motif choisi par l'élève.
const CHAMP_RES = {
  temperature: { lib: 'Température à cœur relevée (°C)', mode: 'decimal', attendu: (p) => p.temp, egal: (v, p) => Math.abs(nombre(v) - p.temp) < 0.05 },
  produit: { lib: 'Référence réellement livrée (lue sur l’étiquette)', mode: 'text', attendu: (p) => p.etiq.ref, egal: (v, p) => String(v).trim().toUpperCase() === String(p.etiq.ref).toUpperCase() },
  avarie: { lib: 'Nombre de cartons endommagés', mode: 'numeric', attendu: (p) => p.avaries, egal: (v, p) => nombre(v) === p.avaries },
  manquant: { lib: 'Nombre de cartons manquants', mode: 'numeric', attendu: (p) => p.manquants, egal: (v, p) => nombre(v) === p.manquants },
  aucun: { lib: 'Nombre de cartons concernés', mode: 'numeric', attendu: () => '?', egal: () => false },
};
function texteLigne(p, decision, motif, v) {
  const vide = v === '' || v === undefined || v === null;
  const val = vide ? '…' : v;
  if (decision === 'refuser') {
    const pourquoi = motif === 'temperature' ? `température à cœur ${vide ? '…' : fmtT(v)} (−18 °C exigé)`
      : motif === 'produit' ? `produit livré ${val} au lieu de ${p.ref} commandé`
        : motif === 'avarie' ? `${val} cartons endommagés` : motif === 'manquant' ? `${val} cartons manquants` : 'motif non précisé';
    return `${p.id} ${p.ref} : palette REFUSÉE — ${pourquoi}. ${p.reel} cartons repris par le chauffeur.`;
  }
  const quoi = motif === 'avarie' ? `${val} cartons endommagés (écrasés)`
    : motif === 'manquant' ? `manque ${val} cartons (BL ${p.bl}, reçu ${vide ? '…' : p.bl - (+nombre(v))})`
      : motif === 'temperature' ? `température à cœur ${vide ? '…' : fmtT(v)}` : motif === 'produit' ? `référence livrée ${val}` : 'réserve sans motif';
  return `${p.id} ${p.ref} : acceptée sous réserve — ${quoi}.`;
}
const ligneAttendue = (p) => texteLigne(p, p.attendu, p.motifAttendu, CHAMP_RES[p.motifAttendu].attendu(p));
const paletteJuste = (p, s) => s.decision === p.attendu && s.motif === p.motifAttendu && s.sonde !== null;

// Les jalons, dans l'ordre de la maquette (fonction `jalons()`). `compte: false` : ligne affichée
// au bilan (le détail du comptage, en guidage) mais qui ne compte pas. Aucun jalon n'est vrai par
// inaction : « mention non ajoutée » demande des réserves écrites, « lot rentré » un geste.
export function jalonsQuai(db, Q) {
  const R = reglages(Q);
  const e = db && db.quais && db.quais[Q.id];
  const L = [];
  let pts = 0, max = 0;
  const j = (id, lib, fait, attendu, ok, compte = true) => {
    if (compte) { max++; if (ok) pts++; }
    L.push({ id, lib, fait, attendu, ok: !!ok, compte });
  };
  const s0 = paletteNeuve();
  const E = e || etatNeuf(Q);
  const lib = Object.fromEntries((R.camions[0] && R.camions[0].qcmTicket && R.camions[0].qcmTicket.choix || QCM_TICKET).map((c) => [c.v, c.court || c.lib]));
  const attenduTicket = (R.camions[0] && R.camions[0].qcmTicket && R.camions[0].qcmTicket.attendu) || 'long';
  j('ticket', 'Enregistreur', E.ticketLu ? (lib[E.ticketRep] || 'lu, sans réponse') : 'non lu',
    `${lib[attenduTicket] || attenduTicket}${attenduTicket === 'long' ? ', à signaler' : ''}`, !!e && E.ticketLu && E.ticketRep === attenduTicket);
  R.palettes.forEach((p) => {
    const s = (E.palettes && E.palettes[p.id]) || s0;
    if (R.aides.detailComptage) {
      const d = s.detail || {}, couche = p.W * p.D, haut = p.manque.length;
      const okD = +d.dCouche === couche && +d.dCouches === p.L && +(d.dManque || 0) === haut;
      j(`${p.id}-detail`, `${p.id} détail`, d.dCouche ? `${d.dCouche} par couche × ${d.dCouches || '?'} couches − ${d.dManque || 0}` : 'non rempli',
        `${couche} par couche × ${p.L} couches − ${haut}`, okD, false);
    }
    j(`${p.id}-comptage`, `${p.id} comptage`, s.compte === null ? 'pas compté' : `${s.compte} cartons`, `${p.reel} cartons (BL : ${p.bl})`, s.compte === p.reel);
    const fait = s.decision ? `${DECISIONS[s.decision]} — ${MOTIFS[s.motif]}${s.sonde === null ? ' (sans sonder)' : ''}` : 'sans contrôle ni décision';
    j(`${p.id}-decision`, `${p.id} décision`, fait, `${DECISIONS[p.attendu]} — ${MOTIFS[p.motifAttendu]}`, paletteJuste(p, s));
  });
  R.palettes.forEach((p) => {
    if (p.attendu === 'accepter') return;
    const l = E.ecrit ? E.lignes.find((x) => x.id === p.id) : null;
    j(`${p.id}-reserve`, `${p.id} réserve écrite`, l ? l.texte : (E.ecrit ? 'aucune ligne' : 'réserves non écrites'), ligneAttendue(p), !!l && l.juste);
  });
  j('deballage', 'Mention « sous réserve de déballage »', E.mentionEcrite ? 'ajoutée' : 'non ajoutée', 'non ajoutée (aucune valeur juridique)', E.ecrit && !E.mentionEcrite);
  j('signature', 'Signature du chauffeur sous les réserves', E.signe ? 'obtenue' : 'pas de signature', 'obtenue', E.signe);
  j('rentre', 'Lot rentré en chambre froide', E.rentre ? `oui, après ${fmtMin(E.froid)} hors froid` : 'non', 'oui', E.rentre);
  return { L, pts, max };
}

// Les étapes à donner à `creerEntreprise` : un jalon compté = une étape du suivi.
export function etapesQuai(Q) {
  const ids = jalonsQuai({}, Q).L.filter((l) => l.compte);
  return ids.map(({ id, lib }) => ({
    id, titre: lib,
    verifier(db) {
      const l = jalonsQuai(db, Q).L.find((x) => x.id === id);
      return { status: l && l.ok ? 'ok' : 'attente' };
    },
  }));
}

// La note d'évaluation sur 20 (brief §6) : 15 points de réception (jalons) + 5 de rapidité
// (hors froid et temps réel), seulement si la réception est COMPLÈTE, et en proportion des
// palettes justes. Seuils et poids viennent de `quai.note` (réglage du contenu).
export function noteQuai(db, Q) {
  const R = reglages(Q);
  const N = Object.assign({ reception: 15, horsFroid: [[20, 3], [25, 2], [30, 1]], reel: [[12, 2], [16, 1]], tiersTemps: 4 / 3 }, Q.note || {});
  const e = (db && db.quais && db.quais[Q.id]) || etatNeuf(Q);
  const { L, pts, max } = jalonsQuai(db, Q);
  const s = (p) => (e.palettes && e.palettes[p.id]) || paletteNeuve();
  const complet = R.palettes.every((p) => s(p).decision) && e.rentre && e.signe;
  const justes = R.palettes.filter((p) => paletteJuste(p, s(p))).length;
  const prop = R.palettes.length ? justes / R.palettes.length : 0;
  const fac = e.tiersTemps ? N.tiersTemps : 1;
  const ptsFroid = e.decharge ? palier(e.froid, N.horsFroid) : 0;
  const ptsReel = palier((e.reel || 0) / 60, N.reel.map(([m, p]) => [m * fac, p]));
  const maxVitesse = (N.horsFroid[0] ? N.horsFroid[0][1] : 0) + (N.reel[0] ? N.reel[0][1] : 0);
  const vitesse = complet ? (ptsFroid + ptsReel) * prop : 0;
  const reception = max ? pts / max * N.reception : 0;
  const note = Math.round((reception + vitesse) * 100) / 100;
  return { score: note, max: N.reception + maxVitesse, L, pts, nJalons: max, complet, justes, nPalettes: R.palettes.length,
    prop, ptsFroid, ptsReel, vitesse, reception, froid: e.froid, reel: e.reel || 0, tiersTemps: !!e.tiersTemps, N, fac };
}

/* ============================================================ palette en 3D */
// Projection isométrique. Rotation de la palette : on change les coordonnées (i, j) selon la vue.
function tourner(i, j, W, D, r) {
  if (r === 0) return [i, j];
  if (r === 1) return [D - 1 - j, i];
  if (r === 2) return [W - 1 - i, D - 1 - j];
  return [j, W - 1 - i];
}
function tournerDir([dx, dy], r) {
  if (r === 0) return [dx, dy];
  if (r === 1) return [-dy, dx];
  if (r === 2) return [-dx, -dy];
  return [dy, -dx];
}
function palette3d(p, s, repereOn) {
  const r = s.vue, W2 = (r % 2) ? p.D : p.W, D2 = (r % 2) ? p.W : p.D;
  const S = 34, H = 26;
  const cx = 230 + (D2 - W2) * S * 0.866 / 2;
  const base = 330 - (W2 + D2) * S * 0.5;
  const P = (a, b, z) => [cx + (a - b) * S * 0.866, base + (a + b) * S * 0.5 - z * H];
  const poly = (pts, fill, extra = '') => `<polygon points="${pts.map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="#5e4424" stroke-width="1" ${extra}/>`;
  let o = '';
  const z0 = -0.55, z1 = 0;
  o += poly([P(0, 0, z1), P(W2, 0, z1), P(W2, D2, z1), P(0, D2, z1)], '#c9a46b');
  o += poly([P(W2, 0, z0), P(W2, D2, z0), P(W2, D2, z1), P(W2, 0, z1)], '#a07a43');
  o += poly([P(0, D2, z0), P(W2, D2, z0), P(W2, D2, z1), P(0, D2, z1)], '#8a6634');
  const manque = new Set(p.manque);
  // Carton repère : en vue de face, le plus haut à gauche (i = 0, j = D-1, couche la plus haute présente).
  let kRep = p.L - 1; while (kRep > 0 && manque.has(`0,${p.D - 1},${kRep}`)) kRep--;
  const repere = repereOn ? `0,${p.D - 1},${kRep}` : null;
  const boites = [];
  for (let k = 0; k < p.L; k++) for (let i = 0; i < p.W; i++) for (let j = 0; j < p.D; j++) {
    if (manque.has(`${i},${j},${k}`)) continue;
    const [a, b] = tourner(i, j, p.W, p.D, r);
    const av = p.avarie[`${i},${j},${k}`];
    boites.push({ a, b, k, av: av ? tournerDir(av, r) : null, rep: `${i},${j},${k}` === repere });
  }
  boites.sort((x, y) => (x.a + x.b + x.k) - (y.a + y.b + y.k) || x.k - y.k);
  const fr = tournerDir([0, 1], r);
  for (const { a, b, k, av, rep } of boites) {
    const top = [P(a, b, k + 1), P(a + 1, b, k + 1), P(a + 1, b + 1, k + 1), P(a, b + 1, k + 1)];
    const droite = [P(a + 1, b, k), P(a + 1, b + 1, k), P(a + 1, b + 1, k + 1), P(a + 1, b, k + 1)];
    const gauche = [P(a, b + 1, k), P(a + 1, b + 1, k), P(a + 1, b + 1, k + 1), P(a, b + 1, k + 1)];
    o += poly(top, '#e6cfa3') + poly(droite, '#c9a26a') + poly(gauche, '#b08550');
    o += `<line x1="${((top[0][0] + top[3][0]) / 2).toFixed(1)}" y1="${((top[0][1] + top[3][1]) / 2).toFixed(1)}" x2="${((top[1][0] + top[2][0]) / 2).toFixed(1)}" y2="${((top[1][1] + top[2][1]) / 2).toFixed(1)}" stroke="#a88a5a" stroke-width="2"/>`;
    if (rep) {
      const c = [(top[0][0] + top[2][0]) / 2, (top[0][1] + top[2][1]) / 2];
      o += `<g data-q-repere><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="15" ry="9" fill="#f6f1e4" style="stroke:var(--ardoise)" stroke-width="1.5"/><text x="${c[0].toFixed(1)}" y="${(c[1] + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" style="fill:var(--ardoise)">${ech(p.id)}</text></g>`;
    }
    // L'étiquette du carton, sur la face avant de la palette quand elle est tournée vers l'élève.
    const faceEtiq = fr[0] === 1 && fr[1] === 0 ? droite : fr[0] === 0 && fr[1] === 1 ? gauche : null;
    if (faceEtiq) {
      const m = (u, v) => [faceEtiq[0][0] + (faceEtiq[1][0] - faceEtiq[0][0]) * u + (faceEtiq[3][0] - faceEtiq[0][0]) * v, faceEtiq[0][1] + (faceEtiq[1][1] - faceEtiq[0][1]) * u + (faceEtiq[3][1] - faceEtiq[0][1]) * v];
      const ln = (u1, v1_, u2, v2) => `<line x1="${m(u1, v1_)[0].toFixed(1)}" y1="${m(u1, v1_)[1].toFixed(1)}" x2="${m(u2, v2)[0].toFixed(1)}" y2="${m(u2, v2)[1].toFixed(1)}" stroke="#777" stroke-width="1"/>`;
      o += `<g class="quai-etiq-clic" data-q-etiq><title>Lire l'étiquette</title>${poly([m(.3, .2), m(.75, .2), m(.75, .62), m(.3, .62)], '#f6f1e4', 'stroke-width=".6"')}${ln(.36, .35, .68, .35)}${ln(.36, .48, .6, .48)}</g>`;
    }
    // Carton écrasé : visible seulement si son côté abîmé fait face à l'élève.
    const face = av && av[0] === 1 && av[1] === 0 ? droite : av && av[0] === 0 && av[1] === 1 ? gauche : null;
    if (face) {
      const m = (u, v) => [face[0][0] + (face[1][0] - face[0][0]) * u + (face[3][0] - face[0][0]) * v, face[0][1] + (face[1][1] - face[0][1]) * u + (face[3][1] - face[0][1]) * v];
      o += `<g data-q-avarie>${poly([m(.15, .25), m(.5, .05), m(.85, .3), m(.75, .8), m(.35, .9), m(.2, .6)], '#6e4c22', 'opacity=".85"')}`;
      o += `<polyline points="${[m(.25, .5), m(.45, .35), m(.55, .6), m(.75, .45)].map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#2b1c0b" stroke-width="1.5"/></g>`;
    }
  }
  o += `<text x="230" y="372" text-anchor="middle" font-size="12" style="fill:var(--encre-douce)">${ech(p.id)} · ${VUES[r]}</text>`;
  return o;
}

/* ============================================ la palette filmée (vue de face) */
// Pour le déchargement et la chambre froide. (x, y) = milieu du bas de la palette ; e = échelle.
const f1 = (n) => n.toFixed(1);
const pts = (a) => a.map((q) => q.map(f1).join(',')).join(' ');
function paletteFace(p, x, y, e, o = {}) {
  const cw = 32 * e, ch = 27 * e, W = p.W, Lc = p.L, w = W * cw, h = Lc * ch;
  const dx = p.D * 7 * e, dy = p.D * 5.5 * e, hb = 13 * e;
  const X = x - w / 2, Y = y - hb;
  const manque = new Set(p.manque);
  let s = '';
  if (o.ombre !== false) s += `<ellipse cx="${f1(x + dx / 2)}" cy="${f1(y + 2 * e)}" rx="${f1(w * .62 + dx / 2)}" ry="${f1(9 * e)}" fill="#000" opacity=".28"/>`;
  s += `<polygon points="${pts([[X, Y], [X + w, Y], [X + w + dx, Y - dy], [X + dx, Y - dy]])}" fill="#b98f55"/>`;
  s += `<polygon points="${pts([[X + w, Y], [X + w + dx, Y - dy], [X + w + dx, y - dy], [X + w, y]])}" fill="#7d5a2c"/>`;
  s += `<rect x="${f1(X)}" y="${f1(Y)}" width="${f1(w)}" height="${f1(hb * .35)}" fill="#c99d61"/>`;
  for (const u of [0, .5, 1]) {
    const bx = X + (w - 14 * e) * u;
    s += `<rect x="${f1(bx)}" y="${f1(Y + hb * .35)}" width="${f1(14 * e)}" height="${f1(hb * .65)}" fill="#a77d45"/>`;
  }
  s += `<rect x="${f1(X)}" y="${f1(y - hb * .2)}" width="${f1(w)}" height="${f1(hb * .2)}" fill="#8f6a37"/>`;
  const top = Lc - 1;
  const colPleine = (i) => { for (let j = 0; j < p.D; j++) if (!manque.has(`${i},${j},${top}`)) return true; return false; };
  for (let k = 0; k < Lc; k++) {
    for (let i = 0; i < W; i++) {
      if (k === top && !colPleine(i)) continue;
      const cx = X + i * cw, cy = Y - (k + 1) * ch;
      s += `<rect x="${f1(cx)}" y="${f1(cy)}" width="${f1(cw)}" height="${f1(ch)}" fill="${(i + k) % 2 ? '#d2ad73' : '#c9a265'}" stroke="#6e5128" stroke-width="${f1(Math.max(.5, .9 * e))}"/>`;
      s += `<line x1="${f1(cx)}" y1="${f1(cy + ch * .5)}" x2="${f1(cx + cw)}" y2="${f1(cy + ch * .5)}" stroke="#ad8a55" stroke-width="${f1(1.4 * e)}"/>`;
    }
  }
  const hTop = (colPleine(W - 1) ? Lc : Lc - 1) * ch, hTopG = (colPleine(0) ? Lc : Lc - 1) * ch;
  s += `<polygon points="${pts([[X + w, Y], [X + w + dx, Y - dy], [X + w + dx, Y - dy - hTop], [X + w, Y - hTop]])}" fill="#a98450" stroke="#6e5128" stroke-width="${f1(.8 * e)}"/>`;
  s += `<polygon points="${pts([[X, Y - hTopG], [X + w, Y - hTop], [X + w + dx, Y - dy - hTop], [X + dx, Y - dy - hTopG]])}" fill="#e2c48e" stroke="#6e5128" stroke-width="${f1(.8 * e)}"/>`;
  s += `<polygon points="${pts([[X, Y], [X + w, Y], [X + w + dx, Y - dy], [X + w + dx, Y - dy - hTop], [X + w, Y - hTop], [X, Y - hTopG]])}" fill="url(#quaiFilm)"/>`;
  for (let u = 1; u < 4; u++) {
    const yy = Y - h * u / 4;
    s += `<line x1="${f1(X)}" y1="${f1(yy + 6 * e)}" x2="${f1(X + w + dx)}" y2="${f1(yy - dy - 4 * e)}" stroke="#fff" stroke-opacity=".22" stroke-width="${f1(1.2 * e)}"/>`;
  }
  const ew = 30 * e, eh = 22 * e, ex = X + w / 2 - ew / 2, ey = Y - h * .55;
  s += `<rect x="${f1(ex)}" y="${f1(ey)}" width="${f1(ew)}" height="${f1(eh)}" fill="#f7f4ec" stroke="#888" stroke-width="${f1(.6 * e)}"/>`;
  if (e > .3) s += `<text x="${f1(ex + ew / 2)}" y="${f1(ey + eh * .68)}" text-anchor="middle" font-size="${f1(12 * e)}" font-weight="700" fill="#0b1f6b" font-family="system-ui,sans-serif">${ech(p.id)}</text>`;
  return s;
}
const DEFS_FILM = `<linearGradient id="quaiFilm" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/>
  <stop offset=".6" stop-color="#fff" stop-opacity=".26"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>`;

const silhouette = (t = 48) => `<svg viewBox="0 0 60 60" width="${t}" height="${t}" aria-hidden="true"><circle cx="30" cy="20" r="11" style="fill:var(--filet)"/><path d="M8 58c2-14 11-22 22-22s20 8 22 22z" style="fill:var(--filet)"/></svg>`;
function signature(c, graine) {
  const g = graine === 1 ? [18, 34, 30, 8, 46, 40] : [22, 40, 16, 6, 52, 30];
  const d = `M8 ${g[1]} C ${g[0]} 4, ${g[0] + 20} 4, ${g[0] + 10} ${g[1]} S ${g[0] + 2} 50, ${g[0] + 24} 30`
    + ` C ${g[0] + 40} ${g[2]}, ${g[0] + 50} ${g[3] + 40}, ${g[0] + 64} 28`
    + ` S ${g[0] + 86} ${g[4]}, ${g[0] + 100} 26 S ${g[0] + 124} ${g[5]}, ${g[0] + 150} 24`;
  return `<svg viewBox="0 0 190 54"><path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// Au clavier seulement, on rend le focus après un redessin (charte : « conserver le focus »).
let clavier = false;
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', () => { clavier = true; }, true);
  document.addEventListener('pointerdown', () => { clavier = false; }, true);
}
const reduit = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==================================================================== la vue */
export function creerQuai(Q, opts = {}) {
  const R = reglages(Q);
  const EVAL = !!opts.copie;
  const A = R.aides;
  const C = R.couts;
  const N = R.palettes.length;
  const cam = R.camions[0] || {};
  const hhmm = (m) => { const t = R.depart + m; const h = Math.floor(t / 60) % 24, mm = Math.floor(t % 60); return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}${t % 1 ? '’30' : ''}`; };
  const formule = () => `${N} palettes × ${fmtMin(R.D.parPalette)} + ${fmtMin(R.D.ouverture)} d’ouverture = ${fmtMin(dureeDechargement(N, R.D))}`;
  const fictif = (nom, f) => `${ech(nom)}${f ? ' (fictif)' : ''}`;
  const lieuMin = R.lieu.nom.charAt(0).toLowerCase() + R.lieu.nom.slice(1);
  const accepte = (s) => s.decision === 'accepter' || s.decision === 'reserves';
  const st = (e, p) => e.palettes[p.id];
  // L'état d'écran : ce qui n'est pas du travail (chef de quai affiché, animation en cours…).
  const ui = { chef4: false, arme: false, armeRaz: false, msgCompte: '', anim: null, lancer: false, jouerCf: false, focus: null };

  function avancer(e, min, texte) {
    e.minute += min;
    if (e.decharge && !e.fini && !e.rentre) e.froid += min;
    e.journal.unshift(`${hhmm(e.minute)} — ${texte} (+${fmtMin(min)})`);
    if (e.journal.length > 80) e.journal.length = 80;
  }

  /* ------------------------------------------------------- déchargement animé */
  // Coordonnées dans la photo du quai (1280 × 853 pour Picard). Tout se déduit de la porte.
  const PH = Object.assign({ porte: { x0: 455, x1: 786, y0: 352, y1: 585 }, cadre: [0, 190, 1280, 663], largeur: 1280, hauteur: 853 }, Q.photos || {});
  const PORTE = PH.porte;
  const OUV = { L: PORTE.x0 + 23, R: PORTE.x1 - 23, T: PORTE.y0 + 20, B: PORTE.y1 - 19 };
  const VP = { x: (PORTE.x0 + PORTE.x1) / 2, y: PORTE.y0 + 106 }, PROF = .36;
  const SOL_Y0 = OUV.B, SOL_Y1 = PH.cadre[1] + PH.cadre[3] - 18;
  // Places au sol, de part et d'autre de l'allée centrale : les 5 de la maquette d'abord, puis
  // un rang de plus à droite, puis un second rang en retrait (ENT-4.2 en aura 8).
  const PLACES = PH.places || [[150, 800], [320, 768], [466, 738], [808, 738], [985, 768], [1150, 805], [245, 700], [1060, 700], [80, 712], [1225, 722]];
  const T_OUVRE = 900, T_PORTE = 2000, T_DEB = 2700, T_PAL = 2100, T_TRAJET = 1850;
  const FIN = T_DEB + N * T_PAL + 200;
  const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const echelle = (y) => .42 + (y - SOL_Y0) / (SOL_Y1 - SOL_Y0) * .58;

  function interieur(restantes) {
    const { L, R: Rr, T, B } = OUV;
    const pr = (x, y, k) => [VP.x + (x - VP.x) * k, VP.y + (y - VP.y) * k];
    const [l2, t2] = pr(L, T, PROF), [r2, b2] = pr(Rr, B, PROF);
    const pw = PORTE.x1 - PORTE.x0, ph = PORTE.y1 - PORTE.y0;
    let s = `<rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}" fill="#11161b"/>`;
    s += `<rect x="${L - 14}" y="${T - 14}" width="${Rr - L + 28}" height="${B - T + 14}" fill="#a7afb5"/>`;
    s += `<rect x="${L - 4}" y="${T - 4}" width="${Rr - L + 8}" height="${B - T + 4}" fill="#3a4148"/>`;
    s += `<polygon points="${pts([[L, T], [Rr, T], [r2, t2], [l2, t2]])}" fill="#b8c1c7"/>`;
    s += `<polygon points="${pts([[L, T], [l2, t2], [l2, b2], [L, B]])}" fill="#8f999f"/>`;
    s += `<polygon points="${pts([[Rr, T], [r2, t2], [r2, b2], [Rr, B]])}" fill="#9ea7ad"/>`;
    s += `<polygon points="${pts([[L, B], [Rr, B], [r2, b2], [l2, b2]])}" fill="#5f676c"/>`;
    s += `<rect x="${f1(l2)}" y="${f1(t2)}" width="${f1(r2 - l2)}" height="${f1(b2 - t2)}" fill="#7f8a92"/>`;
    s += `<rect x="${f1(l2 + 18)}" y="${f1(t2 + 3)}" width="${f1(r2 - l2 - 36)}" height="9" rx="2" fill="#8d979f"/>`;
    s += `<line x1="${VP.x}" y1="${T + 6}" x2="${VP.x}" y2="${f1(t2 + 2)}" stroke="#ffffff" stroke-width="5" opacity=".75"/>`;
    for (const k of [.82, .64, .48]) {
      const [a, b] = pr(L, T, k), [c, d] = pr(L, B, k), [ee] = pr(Rr, T, k);
      s += `<line x1="${f1(a)}" y1="${f1(b)}" x2="${f1(c)}" y2="${f1(d)}" stroke="#a7afb6" stroke-width="2"/>`;
      s += `<line x1="${f1(ee)}" y1="${f1(b)}" x2="${f1(ee)}" y2="${f1(d)}" stroke="#b5bcc2" stroke-width="2"/>`;
    }
    for (let u = 1; u < 8; u++) {
      const x = L + (Rr - L) * u / 8, [x2] = pr(x, B, PROF);
      s += `<line x1="${f1(x)}" y1="${B}" x2="${f1(x2)}" y2="${f1(b2)}" stroke="#6c757b" stroke-width="1"/>`;
    }
    // Palettes encore dans la remorque, deux par rang, les plus proches devant.
    const rangs = Math.max(1, Math.ceil(N / 2)), pas = Math.min(.24, .6 / rangs);
    const places = [];
    restantes.forEach((p, m) => {
      const rang = Math.floor(m / 2), cote = m % 2 ? 1 : -1;
      const k = 1 - rang * pas - .04;
      const [x, y] = pr(VP.x + cote * 62, B - 2, k);
      places.push([p, x, y, .42 * k]);
    });
    places.reverse().forEach(([p, x, y, e]) => { s += paletteFace(p, x, y, e, { ombre: false }); });
    s += `<rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}" fill="#1c3442" opacity=".30"/>`;
    s += `<rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}" fill="#a9d2f0" opacity=".08"/>`;
    s += `<polygon points="${pts([[L - 6, B], [Rr + 6, B], [Rr + 20, PORTE.y1], [L - 20, PORTE.y1]])}" fill="#6b7279"/>`;
    for (let u = 0; u < 14; u++) {
      const x = L - 20 + (Rr - L + 40) * (u + .5) / 14;
      s += `<rect x="${f1(x - 7)}" y="${PORTE.y1 - 5}" width="7" height="5" fill="${u % 2 ? '#1d1d1d' : '#e3b21b'}"/>`;
    }
    return s;
  }
  // Transpalette électrique + chauffeur (silhouette sans visage).
  function transpalette(x, y, e, pas, wPal) {
    let s = '';
    const bx = x - wPal * .18, by = y + 7 * e;
    s += `<ellipse cx="${f1(bx)}" cy="${f1(by + 2 * e)}" rx="${f1(30 * e)}" ry="${f1(6 * e)}" fill="#000" opacity=".3"/>`;
    s += `<rect x="${f1(bx - 22 * e)}" y="${f1(by - 44 * e)}" width="${f1(44 * e)}" height="${f1(44 * e)}" rx="${f1(5 * e)}" fill="#d9a514" stroke="#5b4508" stroke-width="${f1(e)}"/>`;
    s += `<rect x="${f1(bx - 22 * e)}" y="${f1(by - 44 * e)}" width="${f1(44 * e)}" height="${f1(10 * e)}" rx="${f1(4 * e)}" fill="#2b2b2b"/>`;
    s += `<rect x="${f1(bx - 16 * e)}" y="${f1(by - 26 * e)}" width="${f1(32 * e)}" height="${f1(4 * e)}" fill="#2b2b2b" opacity=".5"/>`;
    s += `<circle cx="${f1(bx)}" cy="${f1(by - 1 * e)}" r="${f1(6 * e)}" fill="#1c1c1c"/>`;
    const cx = bx - 58 * e, sol = by + 6 * e, b = Math.sin(pas) * 7 * e, c = '#232a31';
    const hx = cx + 16 * e, hy = sol - 92 * e;
    s += `<line x1="${f1(bx - 6 * e)}" y1="${f1(by - 42 * e)}" x2="${f1(hx)}" y2="${f1(hy)}" stroke="#2b2b2b" stroke-width="${f1(5 * e)}" stroke-linecap="round"/>`;
    s += `<g fill="${c}" stroke="${c}" stroke-linecap="round">`;
    s += `<ellipse cx="${f1(cx)}" cy="${f1(sol + 1 * e)}" rx="${f1(18 * e)}" ry="${f1(4 * e)}" fill="#000" stroke="none" opacity=".3"/>`;
    s += `<line x1="${f1(cx - 5 * e)}" y1="${f1(sol - 60 * e)}" x2="${f1(cx - 7 * e + b)}" y2="${f1(sol - 3 * e)}" stroke-width="${f1(10 * e)}"/>`;
    s += `<line x1="${f1(cx + 5 * e)}" y1="${f1(sol - 60 * e)}" x2="${f1(cx + 7 * e - b)}" y2="${f1(sol - 3 * e)}" stroke-width="${f1(10 * e)}"/>`;
    s += `<rect x="${f1(cx - 14 * e)}" y="${f1(sol - 114 * e)}" width="${f1(28 * e)}" height="${f1(58 * e)}" rx="${f1(11 * e)}" stroke="none"/>`;
    s += `<line x1="${f1(cx + 8 * e)}" y1="${f1(sol - 104 * e)}" x2="${f1(hx)}" y2="${f1(hy)}" stroke-width="${f1(8 * e)}"/>`;
    s += `<line x1="${f1(cx - 9 * e)}" y1="${f1(sol - 104 * e)}" x2="${f1(cx - 13 * e - b * .6)}" y2="${f1(sol - 70 * e)}" stroke-width="${f1(8 * e)}"/>`;
    s += `<circle cx="${f1(cx)}" cy="${f1(sol - 128 * e)}" r="${f1(12 * e)}" stroke="none"/>`;
    s += `<rect x="${f1(cx - 14 * e)}" y="${f1(sol - 98 * e)}" width="${f1(28 * e)}" height="${f1(6 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += `<rect x="${f1(cx - 14 * e)}" y="${f1(sol - 80 * e)}" width="${f1(28 * e)}" height="${f1(5 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += '</g>';
    return s;
  }
  // Brume froide : l'air froid tombe et coule au sol.
  function brume(t) {
    let s = '';
    for (let n = 0; n < 14; n++) {
      const d = T_OUVRE + 300 + n * 330, u = (t - d) / 4200;
      if (u <= 0 || u >= 1) continue;
      const a = Math.sin(u * Math.PI) * .72;
      const x = VP.x + (n % 2 ? 1 : -1) * (20 + (n % 5) * 40) * u, y = SOL_Y0 - 6 + 150 * u;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(80 + 170 * u)}" ry="${f1(16 + 22 * u)}" fill="#eef5fa" opacity="${a.toFixed(2)}"/>`;
    }
    return s;
  }
  // L'image à l'instant t : les morceaux dynamiques de la scène, et la légende.
  function image(t, e, attente) {
    const P = R.palettes;
    const depart = (n) => T_DEB + n * T_PAL;
    const montee = attente ? 0 : ease((t - T_OUVRE) / T_PORTE);
    const posees = [];
    let mobile = '', enCours = null;
    P.forEach((p, n) => {
      const [xf, yf] = PLACES[n % PLACES.length];
      if (attente) return;
      if (t >= depart(n) + T_TRAJET) posees.push([p, xf, yf]);
      else if (t >= depart(n)) {
        const u = ease((t - depart(n)) / T_TRAJET);
        const x0 = VP.x, y0 = SOL_Y0 + 4, cx = VP.x + (xf - VP.x) * .12, cy = yf - 10;
        const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * xf, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * yf;
        const ee = echelle(y);
        mobile = paletteFace(p, x, y, ee) + transpalette(x, y, ee, (t - depart(n)) / 110, p.W * 32 * ee);
        enCours = n;
      }
    });
    posees.sort((a, b) => a[2] - b[2]);
    const nb = posees.length;
    let leg;
    if (attente) leg = `${hhmm(e.minute)} — Le camion est à quai, portes fermées.`;
    else if (t < T_OUVRE) leg = `${hhmm(e.minute)} — Le chauffeur ouvre les portes arrière de sa remorque.`;
    else if (t < T_DEB) leg = `${hhmm(e.minute)} — La porte du quai se lève : l'air froid s'échappe et tombe au sol. Le temps hors froid démarre.`;
    else if (nb < P.length) leg = `${hhmm(e.minute)} — Le chauffeur sort la palette ${P[enCours ?? nb].id} au transpalette (${Math.min(nb + 1, P.length)} sur ${P.length}).`;
    else leg = `${hhmm(e.minute)} — Les ${P.length} palettes sont sur le quai. Le camion attend la fin de tes contrôles.`;
    const posIds = new Set(posees.map((q) => q[0].id));
    return {
      porte: `translate(0 ${f1(-montee * (PORTE.y1 - PORTE.y0 + 3))})`,
      remorque: interieur(attente ? P : P.filter((_, n) => t < depart(n))),
      brume: attente ? '' : brume(t),
      posees: posees.map(([p, x, y]) => paletteFace(p, x, y, echelle(y))).join(''),
      mobile, leg, nb,
      pastilles: P.map((p) => `<i class="${posIds.has(p.id) ? 'sur' : ''}">${ech(p.id)}</i>`).join(''),
    };
  }
  function scene2(e) {
    const fini = e.evts > N, attente = !e.decharge;
    const im = image(fini ? FIN : 0, e, attente);
    const [cx, cy, cw, chh] = PH.cadre;
    const pw = PORTE.x1 - PORTE.x0, ph = PORTE.y1 - PORTE.y0;
    const ax = PORTE.x1 + 14;
    const tempQuai = `${R.lieu.temp > 0 ? '+' : ''}${virgule(Number(R.lieu.temp).toFixed(1))} °C`;
    return `<div class="quai-scene2">
      <svg data-q-scene2 viewBox="${cx} ${cy} ${cw} ${chh}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${ech(R.lieu.nom)} : la porte s'ouvre, le chauffeur sort les palettes une à une au transpalette">
        <defs>
          <clipPath id="quaiCPorte"><rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}"/></clipPath>
          <clipPath id="quaiCPorte2"><rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}"/></clipPath>
          <filter id="quaiFlou" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
          ${DEFS_FILM}
        </defs>
        <image href="${ech(PH.quai)}" x="0" y="0" width="${PH.largeur}" height="${PH.hauteur}"/>
        <g clip-path="url(#quaiCPorte)">
          <g data-g="remorque">${im.remorque}</g>
          <g data-g="porte" transform="${im.porte}"><image href="${ech(PH.quai)}" x="0" y="0" width="${PH.largeur}" height="${PH.hauteur}" clip-path="url(#quaiCPorte2)"/></g>
        </g>
        <g aria-label="Afficheur de température du quai">
          <rect x="${ax}" y="${PORTE.y0 + 14}" width="96" height="54" rx="4" fill="#1b2228" stroke="#8d969c" stroke-width="2"/>
          <text x="${ax + 48}" y="${PORTE.y0 + 30}" text-anchor="middle" font-size="10" fill="#c9d2d8" font-family="system-ui,sans-serif" letter-spacing="1">${ech(R.lieu.nom.toUpperCase())}</text>
          <text data-q-afficheur x="${ax + 48}" y="${PORTE.y0 + 56}" text-anchor="middle" font-size="18" font-weight="700" fill="#8fd0ff" font-family="ui-monospace,Consolas,monospace">${tempQuai}</text>
        </g>
        <g aria-label="Horloge du quai">
          <rect x="${ax}" y="${PORTE.y0 + 78}" width="96" height="44" rx="4" fill="#1b2228" stroke="#8d969c" stroke-width="2"/>
          <text data-q-mur-lib x="${ax + 48}" y="${PORTE.y0 + 92}" text-anchor="middle" font-size="9" fill="#c9d2d8" font-family="system-ui,sans-serif" letter-spacing="1">${EVAL ? 'TEMPS PASSÉ' : 'HEURE DU QUAI'}</text>
          <text data-q-mur x="${ax + 48}" y="${PORTE.y0 + 114}" text-anchor="middle" font-size="18" font-weight="700" fill="#ffd27a" font-family="ui-monospace,Consolas,monospace">${EVAL ? mmss(e.reel) : hhmm(e.minute).slice(0, 5)}</text>
        </g>
        <g data-g="brume" filter="url(#quaiFlou)">${im.brume}</g>
        <g data-g="posees">${im.posees}</g>
        <g data-g="mobile">${im.mobile}</g>
      </svg>
      <div class="quai-legende" data-q-leg>${ech(im.leg)}</div>
    </div>
    <div class="quai-barre2">
      <div><div class="quai-compteur2">Palettes sur le quai : <b data-q-nb>${im.nb} / ${N}</b><span class="quai-pastilles2" data-q-past>${im.pastilles}</span></div>
        <div class="note">Durée du déchargement : <b>${formule()}</b> de temps du quai</div></div>
      <div class="quai-ligne">
        <button class="btn" data-q="passer" ${fini || attente ? 'hidden' : ''}>⏩ Passer l'animation</button>
        <button class="btn" data-q="revoir" data-libre ${fini ? '' : 'hidden'}>↺ Revoir le déchargement</button>
        <button class="btn btn-p" data-q="vers3" data-libre ${fini ? '' : 'disabled'}>Contrôler les palettes →</button>
      </div>
    </div>
    ${A.consignes ? `<p class="quai-aide">Le quai est réfrigéré (<b>${tempQuai}</b>, voir l'afficheur à droite de la porte), mais c'est bien plus chaud que la remorque à ${fmtT((cam.ticket && cam.ticket.consigne) || -20)}. Dès que la porte s'ouvre, <b>tout le lot sort du froid</b> : regarde la jauge en haut, elle a démarré. Le chauffeur pose les palettes ; à toi ensuite de les contrôler <b>vite et bien</b>, chaque geste coûte du temps.</p>` : ''}`;
  }
  // Le contrôleur de l'animation, posé sur la scène affichée. Les événements du temps du quai
  // (porte ouverte, chaque palette posée) ne passent qu'une fois, jamais en « revoir » ; s'ils
  // n'ont pas tous eu lieu quand l'écran disparaît, ils sont appliqués d'un coup.
  function evenements(e, t) {
    let fait = false;
    if (e.evts === 0 && t >= T_OUVRE) {
      e.evts = 1; avancer(e, R.D.ouverture, 'porte du quai ouverte, début du déchargement'); fait = true;
    }
    while (e.evts >= 1 && e.evts <= N && t >= T_DEB + (e.evts - 1) * T_PAL + T_TRAJET) {
      avancer(e, R.D.parPalette, `${R.palettes[e.evts - 1].id} posée sur le quai`); e.evts++; fait = true;
    }
    return fait;
  }
  function animer(z, e, api, rejeu) {
    const svg = z.querySelector('[data-q-scene2]');
    if (!svg) return null;
    const g = (n) => svg.querySelector(`[data-g="${n}"]`);
    let t = 0, t0 = null, raf = null;
    const a = {
      rejeu,
      finir() {
        cancelAnimationFrame(raf); raf = null;
        if (ui.anim === a) ui.anim = null;
        if (!rejeu && evenements(e, FIN)) api.sauver();
      },
    };
    const dessinerT = () => {
      const im = image(t, e, false);
      g('porte').setAttribute('transform', im.porte);
      g('remorque').innerHTML = im.remorque;
      g('brume').innerHTML = im.brume;
      g('posees').innerHTML = im.posees;
      g('mobile').innerHTML = im.mobile;
      const q = (s) => z.querySelector(s);
      if (q('[data-q-leg]')) q('[data-q-leg]').textContent = im.leg;
      if (q('[data-q-nb]')) q('[data-q-nb]').textContent = `${im.nb} / ${N}`;
      if (q('[data-q-past]')) q('[data-q-past]').innerHTML = im.pastilles;
    };
    const boucle = (now) => {
      if (!svg.isConnected) { a.finir(); return; }
      if (t0 === null) t0 = now - t;
      t = now - t0;
      if (!rejeu && evenements(e, t)) { api.sauver(); majHorloges(z, e); }
      dessinerT();
      if (t >= FIN) { a.finir(); api.redessiner(); return; }
      raf = requestAnimationFrame(boucle);
    };
    ui.anim = a;
    raf = requestAnimationFrame(boucle);
    return a;
  }

  /* ------------------------------------------------------ chambre froide (④) */
  function sceneCf(e, u) {
    let s = `<defs>${DEFS_FILM}</defs>`;
    s += '<rect x="0" y="0" width="640" height="300" fill="#3a4349"/>';
    s += '<polygon points="0,210 640,210 640,300 0,300" fill="#59636a"/>';
    s += '<rect x="0" y="0" width="250" height="210" fill="#d5dade"/>';
    for (let x = 0; x < 250; x += 50) s += `<line x1="${x}" y1="0" x2="${x}" y2="210" stroke="#b9c0c5" stroke-width="2"/>`;
    s += '<rect x="70" y="40" width="130" height="170" fill="#0f2233"/>';
    for (let k = 0; k < 9; k++) s += `<rect x="${72 + k * 14.2}" y="42" width="13" height="168" fill="#cfe6f7" opacity=".35"/>`;
    const tc = `${R.lieu.chambre.temp > 0 ? '+' : ''}${virgule(Number(R.lieu.chambre.temp).toFixed(1))} °C`.replace('-', '−');
    s += `<rect x="85" y="6" width="100" height="28" rx="3" fill="#1b2228"/><text x="135" y="26" text-anchor="middle" font-size="14" font-weight="700" fill="#8fd0ff" font-family="ui-monospace,Consolas,monospace">${tc}</text>`;
    s += `<text x="20" y="232" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.chambre.nom)}</text>`;
    s += '<rect x="540" y="60" width="100" height="150" fill="#cfd4d8"/><rect x="552" y="72" width="88" height="138" fill="#1d252b"/>';
    s += '<text x="590" y="232" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">Camion (refus)</text>';
    s += `<text x="320" y="292" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.nom)} · ${R.lieu.temp > 0 ? '+' : ''}${virgule(R.lieu.temp)} °C</text>`;
    const acc = R.palettes.filter((p) => accepte(st(e, p))), ref = R.palettes.filter((p) => !accepte(st(e, p)));
    const items = [];
    const pasA = Math.min(48, 220 / Math.max(1, acc.length));
    acc.forEach((p, k) => {
      const x0 = 300 + k * pasA, y0 = 262, uu = Math.max(0, Math.min(1, u * 1.4 - k * .1));
      const x = x0 + (135 - x0) * uu, y = y0 + (205 - y0) * uu, ee = .55 - .15 * uu;
      items.push([y, uu >= 1 ? '' : paletteFace(p, x, y, ee), uu < 1 ? 1 - uu * .9 : 0]);
    });
    const pasR = Math.min(48, 150 / Math.max(1, ref.length));
    ref.forEach((p, k) => {
      const x0 = 420 + k * pasR, y0 = 262;
      items.push([y0, paletteFace(p, x0, y0, .55) + `<text x="${x0}" y="${y0 + 16}" text-anchor="middle" font-size="11" font-weight="700" fill="#ff9a8a" font-family="system-ui">refusée</text>`, 1]);
    });
    items.sort((a, b) => a[0] - b[0]).forEach(([, gg, o]) => { s += `<g opacity="${o.toFixed(2)}">${gg}</g>`; });
    if (u >= 1 && acc.length) s += `<text x="135" y="130" text-anchor="middle" font-size="13" fill="#cfe6f7" font-family="system-ui">${acc.length} palettes au froid ✓</text>`;
    return s;
  }
  function jouerCf(z, e) {
    const svg = z.querySelector('[data-q-cf]');
    if (!svg) return;
    if (reduit()) { svg.innerHTML = sceneCf(e, 1); return; }
    let t0 = null;
    const pas = (now) => {
      if (!svg.isConnected) return;
      if (t0 === null) t0 = now;
      const u = Math.min(1, (now - t0) / 2600);
      svg.innerHTML = sceneCf(e, u);
      if (u < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }

  /* -------------------------------------------------------------- horloges */
  function horloges(e) {
    const trop = e.decharge && e.froid > R.seuil && !e.fini && !e.rentre;
    const lieu = `quai ${R.lieu.refrigere ? 'réfrigéré' : 'non réfrigéré'} ${R.lieu.temp > 0 ? '+' : ''}${virgule(R.lieu.temp)} °C`;
    return `<div class="quai-horloges">
      <div class="quai-horloge">
        <div class="quai-lib">Horloge du quai (temps simulé)</div>
        <div class="quai-val" data-q-heure>${hhmm(e.minute)}</div>
        <div class="note">avance seulement quand tu fais un geste</div>
      </div>
      <div class="quai-horloge quai-h-froid">
        <div class="quai-lib">Temps hors froid du lot</div>
        <div class="quai-val" data-q-froid>${e.decharge ? `<span class="${e.froid > R.seuil ? 'quai-depasse' : ''}">${fmtMin(e.froid)}</span>` : '— <span class="note">camion fermé</span>'}</div>
        <div class="quai-jauge"><i data-q-jauge style="width:${e.decharge ? Math.min(100, e.froid / (R.seuil * 1.5) * 100) : 0}%"></i></div>
        <div class="note" data-q-nfroid>${trop
          ? (A.consignes ? '<span class="quai-depasse">Repère dépassé : la marchandise se réchauffe. Termine tes contrôles et rentre le lot.</span>' : '<span class="quai-depasse">Repère dépassé.</span>')
          : `démarre quand le transporteur décharge · repère construit : ${R.seuil} min (${lieu})${e.rentre ? ' · arrêté : lot en chambre froide' : ''}`}</div>
      </div>
      ${EVAL ? `<div class="quai-horloge quai-h-reel">
        <div class="quai-lib">Temps passé (temps réel)</div>
        <div class="quai-val" data-q-reel>${mmss(e.reel)}</div>
        <div class="note">${e.tiersTemps ? 'mesuré, ne coupe rien · tiers-temps : seuils × 4/3' : 'mesuré, ne coupe rien : il compte dans la note de rapidité'}</div>
      </div>` : ''}
    </div>`;
  }
  // Mise à jour en place, sans redessiner (animation, chrono) : le reste de l'écran ne bouge pas.
  function majHorloges(z, e) {
    const h = z.querySelector('.quai-horloges');
    if (h) h.outerHTML = horloges(e);
    const mur = z.querySelector('[data-q-mur]');
    if (mur) mur.textContent = EVAL ? mmss(e.reel) : hhmm(e.minute).slice(0, 5);
  }

  /* ---------------------------------------------------------------- écrans */
  const blHtml = () => `<table class="quai-bl"><thead><tr><th>Palette</th><th>Réf.</th><th>Désignation</th><th class="num">Cartons</th></tr></thead>
    <tbody>${R.palettes.map((p) => `<tr><td>${ech(p.id)}</td><td class="mono">${ech(p.ref)}</td><td>${ech(p.nom)}</td><td class="num">${p.bl}</td></tr>`).join('')}</tbody></table>`;
  function ticketTexte() {
    const T = cam.ticket || {};
    const lignes = ['  ENREGISTREUR TEMP.  ', ` Remorque ${T.remorque || ''}  ${T.societe || ''}`, ` Consigne : ${Number(T.consigne ?? -20).toFixed(1)} C`,
      ` Depart  : ${T.depart || '00:00'}`, ' --------------------- ', '  HEURE      TEMP. C'];
    (T.releves || []).forEach(([h, t]) => lignes.push(`  ${h}      ${Number(t).toFixed(1).padStart(6)}`));
    lignes.push(' --------------------- ', ` Arrivee : ${cam.arrivee || ''}`, ' Signature chauffeur :', '', '  ~~~~~~~~~~~~~~~~~ ');
    return lignes.join('\n');
  }

  function ecran1(e) {
    const choix = (cam.qcmTicket && cam.qcmTicket.choix) || QCM_TICKET;
    return `<section class="quai-carte">
      <div class="quai-photo">
        <img src="${ech(PH.arrivee)}" alt="Remorques frigorifiques à quai devant un entrepôt">
        <div class="quai-legende">${ech(cam.arrivee || '')} — ${ech(R.lieu.nom)}. Le camion de ${fictif(cam.transporteur, cam.fictif)} vient de se mettre à quai, portes fermées.</div>
      </div>
      <div class="quai-chauffeur">${silhouette()}
        <p><b>Le chauffeur :</b> « Bonjour, livraison ${ech(cam.fournisseur)} pour le ${ech(lieuMin)}. Voilà mon bon de livraison et le ticket de l'enregistreur. Je peux ouvrir ? »</p>
      </div>
      <div class="quai-grille2">
        <div class="quai-doc">
          <div class="quai-doc-titre">📄 Bon de livraison</div>
          ${blHtml()}
          <div class="quai-reconst">BL n° ${ech(cam.bl)} — Document pédagogique, reconstitution, non contractuel.</div>
        </div>
        <div class="quai-doc">
          <div class="quai-doc-titre">🧾 Ticket de l'enregistreur de température</div>
          <button class="btn" data-q="ticket" ${e.ticketLu || e.fini ? 'disabled' : ''}>Lire le ticket <span class="quai-cout">· ${fmtMin(C.ticket)}</span></button>
          ${e.ticketLu ? `<div class="quai-ticket" data-q-ticket>${ech(ticketTexte())}</div>
          <div class="quai-qcm" role="radiogroup" aria-label="Ce que montre le ticket">
            <b>Ce que montre le ticket :</b>
            ${choix.map((c) => `<label><input type="radio" name="quaiTicket" data-q="ticketRep" value="${ech(c.v)}" ${e.ticketRep === c.v ? 'checked' : ''} ${e.fini ? 'disabled' : ''}> ${ech(c.lib)}</label>`).join('')}
          </div>` : ''}
        </div>
      </div>
      <p class="note">Tant que les portes sont fermées, la marchandise est au froid : c'est le bon moment pour lire les papiers.</p>
      <p><button class="btn btn-p" data-q="decharger" ${e.decharge || e.fini ? 'disabled' : ''}>« Oui, vous pouvez ouvrir et décharger »</button>
        <span class="quai-cout">le chauffeur pose toutes les palettes sur le quai ; le temps hors froid démarre · durée : ${formule()}</span></p>
    </section>`;
  }

  function ecran3(e) {
    const p = R.palettes[e.sel], s = st(e, p);
    const fige = e.fini || e.rentre || e.ecrit;
    const dis = fige ? 'disabled' : '';
    const onglets = R.palettes.map((q, n) => {
      const sq = st(e, q);
      const fait = [sq.sonde !== null ? 'sondée' : null, sq.compte !== null ? 'comptée' : null, sq.decision ? 'décidée' : null].filter(Boolean).join(', ') || 'à contrôler';
      return `<button role="tab" data-q="sel" data-libre data-n="${n}" aria-selected="${n === e.sel}" class="${n === e.sel ? 'on' : ''}">${ech(q.id)}<span class="quai-etat">${fait}</span></button>`;
    }).join('');
    const etiq = s.etiqVue
      ? `<div class="quai-etiq" data-q-etiquette><b>${ech(cam.fournisseur)}</b> — produit surgelé, conserver à −18 °C<br>Réf. ${ech(p.etiq.ref)}<br><b>${ech(p.etiq.nom)}</b><br>Contenu : ${ech(p.etiq.poids)}<br>Lot : ${ech(p.etiq.lot)} · À consommer de préférence avant fin : ${ech(p.etiq.ddm)}<div class="quai-code">||| |||| || ||||| | ||| 3 760000 ${ech(String(p.etiq.ref).replace('-', ''))}</div></div><div class="quai-reconst">Étiquette reconstituée, non contractuelle.</div>`
      : `<span class="note">🔍 Clique sur l'étiquette d'un carton pour la lire de près (${fmtMin(C.etiquette)}).</span>`;
    const d = s.detail || {};
    return `<section class="quai-carte">
      <h2 class="quai-h2"><span class="quai-pastille-etape">3</span>Le quai : contrôler chaque palette</h2>
      <div class="quai-onglets" role="tablist">${onglets}</div>
      <details class="quai-rappel-bl" data-libre><summary data-libre>📄 Revoir le bon de livraison</summary>${blHtml()}</details>
      <div class="quai-poste">
        <div class="quai-scene">
          <svg data-q-palette viewBox="0 0 460 380" role="img" aria-label="Palette ${ech(p.id)} vue en trois dimensions">${palette3d(p, s, A.repere)}</svg>
          <div class="quai-vue-lib">Côtés déjà vus : ${s.vues.length} sur 4</div>
          <button class="btn" data-q="tourner" ${dis}>↻ Faire le tour de la palette <span class="quai-cout">· ${fmtMin(C.tourner)}</span></button>
        </div>
        <div class="quai-outils">
          ${A.consignes ? '<div class="quai-aide">Pour compter sans tout compter : combien de cartons dans une couche ? combien de couches ? Puis regarde bien la couche du dessus.</div>' : ''}
          <div class="quai-ligne"><button class="btn" data-q="sonder" ${dis}>Sonder à cœur <span class="quai-cout">· ${fmtMin(C.sonder)}</span></button>
            ${s.sonde !== null ? `<span class="quai-constat" data-q-sonde>${virgule(Number(s.sonde).toFixed(1)).replace('-', '−')} °C à cœur</span>` : ''}</div>
          <div class="quai-zoom">${etiq}</div>
          ${A.regleCouches ? `<div class="quai-aide">Règle du quai : sur une palette, toutes les couches <b>sous la couche du dessus</b> sont complètes. Les cartons que tu ne vois pas au cœur sont donc bien là.${A.repere ? ' Le carton marqué <b>P1, P2…</b> te sert de repère quand tu fais le tour.' : ''}</div>` : ''}
          ${A.detailComptage ? `<div class="quai-detail">
            <label for="qdCouche">Cartons dans une couche complète</label><input id="qdCouche" type="number" min="0" data-q-detail="dCouche" value="${ech(d.dCouche ?? '')}" ${dis}>
            <label for="qdCouches">Nombre de couches</label><input id="qdCouches" type="number" min="0" data-q-detail="dCouches" value="${ech(d.dCouches ?? '')}" ${dis}>
            <label for="qdManque">Cartons manquants dans la couche du dessus</label><input id="qdManque" type="number" min="0" data-q-detail="dManque" value="${ech(d.dManque ?? '')}" ${dis}>
          </div>` : ''}
          <div class="quai-champ">
            <label for="qCompte">Total : cartons comptés sur cette palette</label>
            <div class="quai-ligne"><input id="qCompte" class="quai-court" type="number" min="0" inputmode="numeric" data-q-compte value="${s.compte ?? ''}" ${dis}>
              <button class="btn" data-q="compter" ${dis}>Noter le comptage <span class="quai-cout">· ${fmtMin(C.compter)}</span></button></div>
            <span class="note" data-q-rcompte>${ui.msgCompte ? ech(ui.msgCompte) : (s.compte !== null ? `Comptage noté : ${s.compte} cartons (BL : ${p.bl}).` : '')}</span>
          </div>
          <div class="quai-champ"><label for="qDecision">Décision</label>
            <select id="qDecision" data-q-decision ${dis}>${Object.entries(DECISIONS).map(([k, v]) => `<option value="${k}" ${s.decision === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
          <div class="quai-champ"><label for="qMotif">Motif de la réserve ou du refus</label>
            <select id="qMotif" data-q-motif ${dis}>${Object.entries(MOTIFS).map(([k, v]) => `<option value="${k}" ${s.motif === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
          <button class="btn btn-p" data-q="vers4" data-libre>Contrôles terminés → réserves et chambre froide</button>
        </div>
      </div>
      <div class="quai-journal" aria-live="polite">${e.journal.map((l) => `<div>${ech(l)}</div>`).join('')}</div>
    </section>`;
  }

  const aEcrire = (e) => R.palettes.filter((p) => ['reserves', 'refuser'].includes(st(e, p).decision));
  function ecran4(e, api) {
    const toutDecide = R.palettes.every((p) => st(e, p).decision);
    const liste = aEcrire(e);
    const nAcc = R.palettes.filter((p) => accepte(st(e, p))).length;
    let form;
    if (!toutDecide) form = `<p class="note">Décide d'abord pour chaque palette (étape 3) : il en reste ${R.palettes.filter((p) => !st(e, p).decision).length}.</p>`;
    else if (!liste.length) form = '<p class="note">Aucune palette refusée ou acceptée sous réserve : tu écriras « Néant ».</p>';
    else {
      form = liste.map((p) => {
        const s = st(e, p), c = CHAMP_RES[s.motif] || CHAMP_RES.aucun;
        return `<div class="quai-res-ligne"><b>${ech(p.id)} — ${DECISIONS[s.decision]} · ${MOTIFS[s.motif]}</b>
          <label class="quai-res-lib">${ech(c.lib)} <input class="quai-court" id="qRes-${ech(p.id)}" data-q-res="${ech(p.id)}" type="text" inputmode="${c.mode === 'text' ? 'text' : c.mode}" value="${ech(s.res)}" ${e.signe || e.fini ? 'disabled' : ''}></label></div>`;
      }).join('');
    }
    const lignes = e.ecrit ? ((e.lignes.length ? e.lignes.map((l) => `<div>${ech(l.texte)}</div>`).join('') : '<div>Néant — marchandise reçue conforme.</div>') + (e.mentionEcrite ? '<div>Sous réserve de déballage.</div>' : '')) : '';
    const parole = e.paroleChauffeur || (e.signe ? 'C’est signé. Je recharge les palettes refusées et j’y vais. Bonne journée !' : e.ecrit ? 'Faites voir ce que vous avez écrit… Je signe ?' : 'J’attends vos papiers pour signer. Mes autres clients m’attendent aussi.');
    const prof = api.estProf;
    let clore;
    if (EVAL && !prof) {
      clore = `<button class="btn btn-p${ui.arme ? ' quai-arme' : ''}" data-q="clore" ${!e.decharge || e.fini || !(e.rentre && e.signe) || api.copieRendue() ? 'disabled' : ''}>${ui.arme ? 'Rendre définitivement ? Cliquez pour confirmer' : 'Clore la réception et rendre ma copie'}</button>
        ${ui.arme ? '<button class="btn" data-q="desarmer">Annuler</button>' : ''}`;
    } else {
      clore = `<button class="btn btn-p" data-q="clore" ${!e.decharge || e.fini || !(e.rentre && e.signe) ? 'disabled' : ''}>Clore la réception</button>`;
    }
    return `<section class="quai-carte">
      <h2 class="quai-h2"><span class="quai-pastille-etape">4</span>Rentrer le lot en chambre froide, écrire les réserves, faire signer</h2>
      ${A.consignes ? `<p class="quai-aide">Règle du quai : <b>le froid d'abord, les papiers ensuite</b>. 1) <b>Rentre le lot</b> accepté en chambre froide (le temps hors froid s'arrête). 2) <b>Écris tes réserves sur le BL</b> et fais-les signer par le chauffeur. Le chauffeur peut attendre ; les surgelés, non.<br>
        Une réserve doit être <b>précise</b> : quelle palette, quoi, combien. « Sous réserve de déballage » ne vaut rien : ce n'est pas une réserve.</p>` : ''}
      ${ui.chef4 ? `<div class="quai-alerte" role="alert" data-q-chef>
        <p><b>Le chef de quai :</b> « Attends ! Tes palettes sont toujours sur le quai. <b>Rentre d'abord le lot accepté en chambre froide</b> : le chauffeur, lui, peut attendre cinq minutes ; les surgelés, non. Les papiers, tu les feras juste après. »</p>
        <button class="btn btn-p" data-q="chefRentrer">D'accord, je rentre le lot d'abord</button>
        <button class="btn" data-q="chefPapiers">J'écris quand même les réserves</button>
      </div>` : ''}
      ${A.chefDeQuai && e.mentionEcrite ? '<div class="quai-alerte" role="alert" data-q-chef-deballage><b>Le chef de quai :</b> « « Sous réserve de déballage », ça ne te protège de rien : ça ne dit ni quoi, ni combien, ni sur quelle palette. Ce sont tes réserves précises qui comptent. »</div>' : ''}
      <div class="quai-grille2">
        <div class="quai-doc">
          <div class="quai-doc-titre">🧊 ${ech(R.lieu.chambre.nom)}</div>
          <svg class="quai-cf" data-q-cf viewBox="0 0 640 300" role="img" aria-label="Le quai et l'entrée de la chambre froide">${sceneCf(e, e.rentre ? 1 : 0)}</svg>
          <p class="note" data-q-etatcf>${e.rentre ? `Lot rentré à ${hhmm(e.heureRentre ?? e.minute)} : ${nAcc} palettes en chambre froide, ${N - nAcc} refusée(s) au quai.`
            : (toutDecide ? `${nAcc} palettes à rentrer · temps hors froid : ${fmtMin(e.froid)}.` : 'Décide d’abord pour chaque palette.')}</p>
          <button class="btn btn-p" data-q="rentrer" ${!e.decharge || !toutDecide || e.rentre || e.fini ? 'disabled' : ''}>Rentrer le lot accepté en chambre froide <span class="quai-cout">· ${fmtMin(C.rentrer)} de manutention</span></button>
          <p class="note">Les palettes refusées restent au quai et repartent dans le camion.</p>
        </div>
        <div class="quai-doc">
          <div class="quai-doc-titre">✍️ Tes réserves</div>
          <div>${form}</div>
          <label class="quai-res-ligne quai-case"><input type="checkbox" data-q-deballage ${e.deballage ? 'checked' : ''} ${e.signe || e.fini || !toutDecide ? 'disabled' : ''}> Ajouter la mention « Sous réserve de déballage »</label>
          <div class="quai-ligne"><button class="btn" data-q="ecrire" ${!e.decharge || !toutDecide || e.signe || e.fini ? 'disabled' : ''}>${e.ecrit ? 'Réécrire les réserves' : 'Écrire les réserves sur le BL'} <span class="quai-cout">· ${fmtMin(Math.max(1, liste.length) * C.ligne)}</span></button></div>
        </div>
      </div>
      <div class="quai-doc quai-papier">
        <div class="quai-doc-titre">📄 Bon de livraison n° ${ech(cam.bl)} — exemplaire du destinataire</div>
        ${blHtml()}
        <div class="quai-zone-res"><div class="quai-lib-res">Réserves du destinataire :</div><div class="quai-manuscrit" data-q-lignes>${lignes}</div></div>
        <div class="quai-signatures">
          <div><div class="quai-lib-res">Le réceptionnaire (${ech(Q.destinataire || '')}${Q.destinataire ? ', ' : ''}${ech(R.lieu.nom)})</div><div class="quai-sig" data-q-sig-moi>${e.ecrit ? signature('#1d3a7a', 1) : ''}</div></div>
          <div><div class="quai-lib-res">Le chauffeur (${ech(cam.transporteur)})</div><div class="quai-sig" data-q-sig-chauffeur>${e.signe ? signature('#222', 2) : ''}</div></div>
        </div>
        <div class="quai-reconst">Document pédagogique, reconstitution, non contractuel.</div>
      </div>
      <div class="quai-chauffeur" data-q-parole>${silhouette(40)}<p><b>Le chauffeur :</b> « ${ech(parole)} »</p></div>
      <p class="quai-ligne"><button class="btn" data-q="signer" ${!e.ecrit || e.signe || e.fini ? 'disabled' : ''}>Faire signer le chauffeur <span class="quai-cout">· ${fmtMin(C.signer)}</span></button>
        ${clore}</p>
      ${bilan(e, api)}
    </section>`;
  }

  function bilan(e, api) {
    if (!e.fini) return '';
    if (EVAL && !api.estProf) {
      return `<div class="avis" data-q-bilan>Réception close${api.copieRendue() ? ' et copie rendue' : ''}. Ton enseignant te donnera la note.</div>`;
    }
    const db = { quais: { [Q.id]: e } };
    const { L } = jalonsQuai(db, Q);
    const tableau = `<table class="quai-bilan" data-q-bilan><thead><tr><th></th><th>Ce que tu as fait</th><th>Attendu</th><th></th></tr></thead><tbody>${L.map((l) => `<tr data-jalon="${ech(l.id)}"><td>${ech(l.lib)}</td><td>${ech(l.fait)}</td><td>${ech(l.attendu)}</td><td class="${l.ok ? 'quai-ok' : 'quai-ko'}">${l.ok ? '✓ juste' : '✗ à revoir'}${l.compte ? '' : ' <span class="note">(non compté)</span>'}</td></tr>`).join('')}</tbody></table>`;
    let teteProf = '';
    if (EVAL) {
      const n = noteQuai(db, Q);
      teteProf = `<details open class="quai-note-prof"><summary class="note">Côté enseignant : note ${v1(n.score)}/${n.max}</summary>${tableauNote(n)}</details>`;
    }
    const ordre = e.rentre ? (e.ordreFroidDabord
      ? ' Tu as rentré le lot <b>avant</b> d’écrire les papiers : bon réflexe, le chauffeur attend, les surgelés non.'
      : ` Tu as écrit les papiers <b>avant</b> de rentrer le lot${e.passeOutreChef ? ', malgré le chef de quai' : ''} : le temps hors froid a continué de tourner pendant ce temps. <b>Règle à retenir : le froid d’abord, les papiers ensuite.</b>`) : '';
    return `<div class="quai-bilan-bloc">
      <h3>Bilan de ta réception</h3>
      ${teteProf}${tableau}
      <p class="note">Temps hors froid du lot : ${e.decharge ? fmtMin(e.froid) : '—'} (repère ${R.seuil} min).${ordre}</p>
      <p class="note" data-q-reel-bilan>Temps réel passé : ${mmss(e.reel)} (mesuré pour caler les seuils de l'évaluation, non noté).</p>
      ${Q.bonASavoir ? `<p class="note">${Q.bonASavoir}</p>` : ''}
      ${EVAL ? '' : `<p><button class="btn${ui.armeRaz ? ' quai-arme' : ''}" data-q="recommencer">${ui.armeRaz ? 'Tout effacer et recommencer ? Cliquez pour confirmer' : 'Recommencer la réception'}</button></p>`}
    </div>`;
  }
  function tableauNote(n) {
    const sf = n.N.horsFroid.map(([m, p], i) => `${i ? '' : '≤ '}${m} min${i ? '' : ''} : ${p}`).join(' · ');
    const sr = n.N.reel.map(([m, p]) => `≤ ${v1(m * n.fac)} min : ${p}`).join(' · ');
    return `<table class="quai-note" data-q-note><tbody>
      <tr><td>Réception</td><td>${n.pts}/${n.nJalons} jalons</td><td>${v1(n.reception)} / ${n.N.reception}</td></tr>
      <tr><td>Temps hors froid</td><td>${fmtMin(n.froid)}</td><td>${n.ptsFroid} / ${n.N.horsFroid[0][1]} (${sf})</td></tr>
      <tr><td>Temps réel</td><td>${mmss(n.reel)}${n.tiersTemps ? ' (tiers-temps)' : ''}</td><td>${n.ptsReel} / ${n.N.reel[0][1]} (${sr})</td></tr>
      <tr><td>Rapidité retenue</td><td>${n.complet ? `réception complète, ${n.justes}/${n.nPalettes} palettes justes` : 'réception incomplète : pas de points de rapidité'}</td><td>${v1(n.vitesse)} / ${n.max - n.N.reception}</td></tr>
    </tbody></table>`;
  }

  /* --------------------------------------------------------------- gestes */
  function ecrireReserves(e, api) {
    const liste = aEcrire(e);
    e.lignes = liste.map((p) => {
      const s = st(e, p), c = CHAMP_RES[s.motif] || CHAMP_RES.aucun;
      const juste = s.decision === p.attendu && s.motif === p.motifAttendu && s.res !== '' && c.egal(s.res, p);
      return { id: p.id, texte: texteLigne(p, s.decision, s.motif, s.res), juste, vide: String(s.res).trim() === '' };
    });
    avancer(e, Math.max(1, liste.length) * C.ligne, `réserves écrites sur le BL (${liste.length} ligne${liste.length > 1 ? 's' : ''})`);
    e.ecrit = true; e.paroleChauffeur = ''; e.mentionEcrite = !!e.deballage;
    api.sauver(); api.redessiner();
  }
  function rentrer(e, api) {
    const n = R.palettes.filter((p) => accepte(st(e, p))).length;
    avancer(e, C.rentrer, `lot rentré en chambre froide (${n} palettes)`);
    e.ordreFroidDabord = !e.ecrit;
    e.rentre = true; e.heureRentre = e.minute;
    ui.jouerCf = true;
    api.sauver(); api.redessiner();
  }
  function aller(e, n, api) {
    if (n > 1 && !e.decharge) return;
    if (ui.anim) ui.anim.finir();
    e.etape = n; ui.chef4 = false; ui.msgCompte = '';
    api.sauver(); api.redessiner();
    if (api.haut) api.haut();
  }

  return {
    id: Q.id,
    nav: { libelle: Q.libelle || 'Quai de réception' },
    etatNeuf: () => etatNeuf(Q),
    jalons: (db) => jalonsQuai(db, Q),
    note: Q.note || EVAL ? (db) => noteQuai(db, Q) : null,
    // Le chrono réel, appelé chaque seconde par l'environnement : mise à jour en place.
    tic(z, e) {
      if (!z) return;
      const r = z.querySelector('[data-q-reel]');
      if (r) r.textContent = mmss(e.reel);
      const mur = z.querySelector('[data-q-mur]');
      if (mur && EVAL) mur.textContent = mmss(e.reel);
    },
    html(e, api) {
      normaliser(e, R);
      // Un déchargement interrompu (rechargement de page en pleine animation) : ce qui restait
      // du temps du quai s'applique d'un coup.
      if (e.decharge && e.evts <= N && !ui.anim && !ui.lancer) { evenements(e, FIN); api.sauver(); }
      const etape = e.decharge ? (e.etape || 1) : 1;
      const corps = etape === 1 ? ecran1(e) : etape === 2 ? `<section class="quai-carte">${scene2(e)}</section>` : etape === 3 ? ecran3(e) : ecran4(e, api);
      return `<div class="quai" data-quai="${ech(Q.id)}">
        <div class="quai-tete">
          <div><h2>${ech(Q.titre || R.lieu.nom)}</h2>
            <div class="note">Livraison « ${fictif(cam.fournisseur, cam.fictif)} » · camion frigorifique ${fictif(cam.transporteur, cam.fictif)}</div></div>
        </div>
        ${Q.avertissement ? `<div class="quai-avert">${Q.avertissement}</div>` : ''}
        ${horloges(e)}
        <nav class="quai-stepper" aria-label="Étapes de la réception">
          ${ETAPES.map((l, i) => `<button data-q="etape" data-libre data-n="${i + 1}" class="${etape === i + 1 ? 'on' : ''}" ${i > 0 && !e.decharge ? 'disabled' : ''} ${etape === i + 1 ? 'aria-current="step"' : ''}>${l}</button>`).join('')}
        </nav>
        ${corps}
      </div>`;
    },
    brancher(z, e, api) {
      const p = () => R.palettes[e.sel];
      const s = () => st(e, p());
      const geste = (fn) => () => { if (e.fini) return; fn(); };
      const on = (cle, fn) => z.querySelectorAll(`[data-q="${cle}"]`).forEach((b) => b.addEventListener('click', (ev) => fn(ev, b)));
      // Le focus suit l'élève qui travaille au clavier d'un redessin à l'autre.
      z.querySelectorAll('[data-q], input, select').forEach((el) => el.addEventListener('focus', () => {
        ui.focus = el.id ? `#${el.id}` : el.dataset.q ? `[data-q="${el.dataset.q}"]${el.dataset.n ? `[data-n="${el.dataset.n}"]` : ''}` : null;
      }));
      if (clavier && ui.focus) { const f = z.querySelector(ui.focus); if (f && !f.disabled) f.focus(); }

      on('etape', (ev, b) => aller(e, +b.dataset.n, api));
      on('ticket', geste(() => { if (e.ticketLu) return; e.ticketLu = true; avancer(e, C.ticket, 'ticket de l’enregistreur lu'); api.sauver(); api.redessiner(); }));
      z.querySelectorAll('[data-q="ticketRep"]').forEach((r) => r.addEventListener('change', () => { if (e.fini) return; e.ticketRep = r.value; api.sauver(); }));
      on('decharger', geste(() => {
        if (e.decharge) return;
        e.decharge = true; e.evts = 0; e.etape = 2; ui.lancer = true;
        api.sauver(); api.redessiner(); if (api.haut) api.haut();
      }));
      // Le déchargement démarre dans l'écran qu'on vient de dessiner. `prefers-reduced-motion` :
      // pas d'animation, la fin directement (palettes posées, temps du quai compté).
      if (ui.lancer) {
        ui.lancer = false;
        if (reduit()) { evenements(e, FIN); api.sauver(); api.redessiner(); return; }
        animer(z, e, api, false);
      }
      on('passer', () => { if (ui.anim) ui.anim.finir(); api.redessiner(); });
      on('revoir', () => {
        if (e.evts <= N) return;
        api.redessiner();
        const z2 = api.zone();
        z2.querySelector('[data-q="revoir"]')?.setAttribute('hidden', '');
        z2.querySelector('[data-q="passer"]')?.removeAttribute('hidden');
        if (!reduit()) animer(z2, e, api, true);
      });
      on('vers3', () => aller(e, 3, api));
      on('vers4', () => aller(e, 4, api));
      on('sel', (ev, b) => { e.sel = +b.dataset.n; ui.msgCompte = ''; api.sauver(); api.redessiner(); });
      on('tourner', geste(() => {
        const ss = s(); ss.vue = (ss.vue + 1) % 4; if (!ss.vues.includes(ss.vue)) ss.vues.push(ss.vue);
        avancer(e, C.tourner, `${p().id} : ${VUES[ss.vue]}`); api.sauver(); api.redessiner();
      }));
      on('sonder', geste(() => { s().sonde = p().temp; avancer(e, C.sonder, `${p().id} sondée`); api.sauver(); api.redessiner(); }));
      on('compter', geste(() => {
        const v = parseInt(z.querySelector('[data-q-compte]').value, 10);
        if (Number.isNaN(v)) { ui.msgCompte = 'Écris d’abord le nombre de cartons que tu as comptés.'; api.redessiner(); return; }
        ui.msgCompte = ''; s().compte = v; avancer(e, C.compter, `${p().id} : ${v} cartons notés`); api.sauver(); api.redessiner();
      }));
      z.querySelector('[data-q-palette]')?.addEventListener('click', (ev) => {
        if (!ev.target.closest('[data-q-etiq]') || e.fini || e.rentre || e.ecrit) return;
        const ss = s(); if (!ss.etiqVue) { ss.etiqVue = true; avancer(e, C.etiquette, `${p().id} : étiquette lue`); api.sauver(); }
        api.redessiner();
      });
      z.querySelectorAll('[data-q-detail]').forEach((i) => i.addEventListener('input', () => { s().detail[i.dataset.qDetail] = i.value; api.sauver(); }));
      z.querySelector('[data-q-decision]')?.addEventListener('change', (ev) => { s().decision = ev.target.value; api.sauver(); api.redessiner(); });
      z.querySelector('[data-q-motif]')?.addEventListener('change', (ev) => { s().motif = ev.target.value; api.sauver(); api.redessiner(); });
      z.querySelectorAll('[data-q-res]').forEach((i) => i.addEventListener('input', () => { e.palettes[i.dataset.qRes].res = i.value; api.sauver(); }));
      z.querySelector('[data-q-deballage]')?.addEventListener('change', (ev) => { e.deballage = ev.target.checked; api.sauver(); });
      on('rentrer', geste(() => { ui.chef4 = false; rentrer(e, api); }));
      on('ecrire', geste(() => {
        // Guidage : apprendre l'ordre (le froid d'abord, les papiers ensuite) sans l'imposer.
        if (A.chefDeQuai && !e.rentre && !e.chefVu) { e.chefVu = true; ui.chef4 = true; api.sauver(); api.redessiner(); api.zone().querySelector('[data-q-chef]')?.scrollIntoView({ block: 'center' }); return; }
        ecrireReserves(e, api);
      }));
      on('chefRentrer', geste(() => { ui.chef4 = false; rentrer(e, api); }));
      on('chefPapiers', geste(() => { ui.chef4 = false; e.passeOutreChef = true; ecrireReserves(e, api); }));
      on('signer', geste(() => {
        // Guidage : le chauffeur refuse de signer une réserve sans valeur.
        const vides = e.lignes.filter((l) => l.vide);
        if (A.chefDeQuai && vides.length) {
          e.paroleChauffeur = `Votre réserve sur ${vides.map((l) => l.id).join(', ')} ne dit pas combien ni quoi. Une réserve pas précise, ça ne vaut rien. Complétez et je signe.`;
          api.sauver(); api.redessiner(); return;
        }
        e.signe = true; e.paroleChauffeur = '';
        avancer(e, C.signer, 'BL signé par le chauffeur, réserves comprises');
        api.sauver(); api.redessiner();
      }));
      on('clore', geste(() => {
        if (!(e.rentre && e.signe)) return;
        if (EVAL && !api.estProf) {
          if (!ui.arme) { ui.arme = true; api.redessiner(); return; }
          ui.arme = false; e.fini = true; api.sauver(); api.redessiner(); api.rendreCopie(); return;
        }
        e.fini = true; api.sauver(); api.redessiner();
      }));
      on('desarmer', () => { ui.arme = false; api.redessiner(); });
      on('recommencer', () => {
        if (!ui.armeRaz) { ui.armeRaz = true; api.redessiner(); return; }
        ui.armeRaz = false; api.recommencer();
      });
      if (ui.jouerCf) { ui.jouerCf = false; jouerCf(z, e); }
    },
  };
}
