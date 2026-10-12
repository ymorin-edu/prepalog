// Vue « Plan d'entrepôt », mode PICKING — une ALLÉE DE PICKING en 3D isométrique, guidée par le TERMINAL VOCAL : on va à
// l'emplacement annoncé, on lit son code sur l'étiquette de la lisse (de près seulement), on prélève, on signale une anomalie.
//
// Écrit le 12/10/2026 (chantier D-7, lot 3, demande au moteur du brief `docs/briefs/ENT-6.7-france-boissons-preparation.md`
// §7.2), d'après la maquette validée par Tristan (`docs/briefs/france-boissons/maquette-6.7-preparation-vocale.html`) : mêmes
// gestes, mêmes textes. Les dessins sont ceux du kit iso (`core/iso.js`, section « l'allée de picking », lot 2) ; le terminal
// est celui de l'inventaire d'ENT-6.6, en préparation (`terminal.js`, lot 1). Rien de France Boissons ici.
//
// Quatrième mode de la vue (`entrepot.js` l'importe, comme la masse) : décision de Tristan du 12/10/2026, plutôt qu'une option
// « 3D » du mode préparation d'ENT-5.6 (dont le bon de préparation, le parcours dessiné et la palette montée dans l'ordre ne
// servent pas quand le terminal guide). Une allée, deux côtés : A au fond de l'image, B devant (en transparence) ; T01 près
// de la zone de préparation et du quai, la dernière travée au fond. N1 = le picking (tiroir coulissant) ; N2-N3 sans
// marchandise (la réserve est au sol, en zone de masse : décision de Tristan du 06/10/2026).
//
// Une déclaration (exemple complet : `contenus/entrepot-picking-essai.js`) :
//
//   entrepot: {
//     id, libelle, mode: 'picking',
//     personnage: { nom, role, date, texte: { guidage, entrainement } },   // une ligne en haut
//     consigne: 'Écoute (ou lis) le terminal, va à l’emplacement, réponds.',
//     annonce: 'Ce matin, le picking a été réapprovisionné …',            // facultatif : une phrase sous la consigne
//     plan: { travees: 4, zone: 'Zone de préparation', quai: 'QUAI 14' },  // 1 à 6 travées par côté ; zone et quai : décor
//     references: {
//       EAU1L: { nom: 'Eau minérale 1 L', voix: 'Eau minérale, casier de douze bouteilles', type: 'casier', capsule: 'bleu' },
//       AFF20: { nom: 'Affligem Blonde 20 L', voix: 'Affligem Blonde, vingt litres', type: 'fut', litres: 20, bande: 'cuivre' }, …
//     },   // `voix` : ce que dit le terminal (défaut : `nom`) ; teintes par NOM (TEINTES_FUT, TEINTES_CAPSULE du kit)
//     emplacements: {     // TOUS les emplacements des deux côtés, « A-T01 » à « B-T04 » (le niveau 1, le seul de picking)
//       'A-T03': { ref: 'AFF20', lot: 'S18', n: 2, abimes: 1, code: '49' },   // abimes : les fûts cabossés, les plus en avant
//       'B-T04': { ref: 'HEI20', n: 0, code: '62' }, …                           // n: 0 = tiroir vide
//     },
//     terminal: {
//       titre: 'Préparation',
//       lignes: [                                             // dans l'ordre du parcours
//         { emplacement: 'A-T01', prends: 3 },
//         { emplacement: 'A-T03', prends: 2, attendu: { mot: 'abime', n: 1 },  // l'exception juste (sinon : aucune)
//           remplacement: { emplacement: 'B-T03' } },          // ajoutée par le terminal après TOUTE exception sur la ligne
//         …],
//       mots: [{ id, lib, combien }],                         // défaut : Manquant, Abîmé (combien ?), Emplacement vide
//       fin: 'Commande terminée : …', phraseBilan: '…',       // la phrase de fin ; la phrase sous « Ce que le terminal sait de toi »
//     },
//     regles: { titre?, entete?, lignes: [html…], encadre? },  // « Les règles ▾ » (guidage, entraînement)
//     note: { sur: 20 },
//   }
//
// Le terminal dit « Côté A, travée 03, niveau 1. Code de contrôle ? », puis « <voix>, lot S18. Prends 2. ». Le CODE n'est écrit
// que sur l'étiquette de la lisse, dans la VUE DE PRÈS (clic sur la travée ou son adresse au sol) : ni dans l'allée, ni dans
// un texte d'aide (choix validé du brief : il faut « aller » à l'emplacement). Le fût cabossé se voit, il n'est écrit nulle part.
//
// JALONS (brief §5, 1 à 5) : un par ligne, et un pour la ligne de remplacement d'une ligne qui a un `attendu`. Rien n'est jugé
// avant la fin du terminal (sinon le suivi dirait ligne à ligne si c'est juste) ; une ligne non faite est fausse.
//   - ligne sans `attendu` : la quantité demandée, prise, sans exception ;
//   - ligne avec `attendu` : ce mot-là, cette quantité-là, puis le reste pris (« Manquant » au lieu d'« Abîmé » : faux) ;
//   - ligne de remplacement : présente (une exception a été dite) et la quantité `attendu.n` prise.
// `lib` d'un jalon : `jalon` sur la ligne (et sur `remplacement`), sinon « Ligne n : <nom> » — jamais la réponse.
// Le montage des palettes (§7.3, lot 4) n'est pas encore là : une ligne ne déclare pas encore de `pose`. Pas d'évaluation.
//
// L'état, dans la base de l'élève (`db.entrepots[<id>]`, cloisonné par séance) :
//   { terminal: (voir `terminal.js`), vus: { 'A-T03': date de la première ouverture }, premierGeste }
// `vus` est une trace pour l'enseignant, jamais notée. La travée ouverte et la place du préparateur ne sont pas gardées.
// Gestes publiés (questions au fil) : `entrepot:<id>:ouvrir:<emplacement>`, `entrepot:<id>:ligne:<ligne>` (une ligne finie),
// `entrepot:<id>:fin`.

import { ech } from '../texte.js';
import { projection, DEFS, compilerScene, dessinerDecor, traveePicking, volumeTravee, personne, TRAVEE, PLACES_TIROIR, HAUT_FUT,
  TEINTES_FUT, TEINTES_CAPSULE } from '../iso.js';
import { creerTerminal, terminalNeuf, bilanTerminal, htmlBilanTerminal } from './terminal.js';

export const MOTS_PREPARATION = [
  { id: 'manquant', lib: 'Manquant', combien: true },
  { id: 'abime', lib: 'Abîmé', combien: true },
  { id: 'vide', lib: 'Emplacement vide' },
];
const COTES = ['A', 'B'];
const t2 = (t) => String(t).padStart(2, '0');

/* ================================================================ compilation */
export function compilerPicking(P, err) {
  const L = P.plan || err('il manque le plan');
  const T = L.travees == null ? 4 : L.travees | 0;
  if (T < 1 || T > 6) err('`plan.travees` va de 1 à 6');
  const refs = P.references || err('il manque les références');
  Object.entries(refs).forEach(([k, r]) => {
    if (!r || !r.nom) err(`référence ${k} : il manque le nom`);
    if (r.type === 'fut') {
      if (!HAUT_FUT[r.litres]) err(`référence ${k} : un fût de ${r.litres} L n'est pas dessiné (${Object.keys(HAUT_FUT).join(' ou ')} L)`);
      if (r.bande != null && !TEINTES_FUT[r.bande]) err(`référence ${k} : teinte de fût « ${r.bande} » inconnue (${Object.keys(TEINTES_FUT).join(', ')})`);
    } else if (r.type === 'casier') {
      if (r.capsule != null && !TEINTES_CAPSULE[r.capsule]) err(`référence ${k} : teinte de capsule « ${r.capsule} » inconnue (${Object.keys(TEINTES_CAPSULE).join(', ')})`);
    } else err(`référence ${k} : \`type\` est « fut » ou « casier »`);
  });
  const E = {}, D = P.emplacements || err('il manque les emplacements');
  Object.keys(D).forEach((adr) => {
    const m = /^([AB])-T(\d\d)$/.exec(adr);
    if (!m || +m[2] < 1 || +m[2] > T) err(`emplacement « ${adr} » inconnu (de A-T01 à B-T${t2(T)})`);
  });
  COTES.forEach((c) => { for (let t = 1; t <= T; t++) {
    const adr = `${c}-T${t2(t)}`, x = D[adr] || err(`il manque l'emplacement ${adr} (chaque travée des deux côtés est déclarée)`);
    const r = refs[x.ref] || err(`emplacement ${adr} : référence inconnue (${x.ref})`);
    const n = x.n | 0, ab = x.abimes == null ? 0 : x.abimes | 0;
    if (!(Number.isInteger(x.n) && n >= 0 && n <= PLACES_TIROIR[r.type])) err(`emplacement ${adr} : \`n\` va de 0 à ${PLACES_TIROIR[r.type]} (places du tiroir)`);
    if (ab < 0 || ab > n || (ab && r.type !== 'fut')) err(`emplacement ${adr} : \`abimes\` va de 0 à n, et seulement pour des fûts`);
    const code = x.code == null ? '' : String(x.code);
    if (!/^\d{1,4}$/.test(code)) err(`emplacement ${adr} : le code détrompeur (\`code\`) s'écrit avec 1 à 4 chiffres`);
    E[adr] = { adr, cote: c, t, ref: x.ref, lot: x.lot ? String(x.lot) : null, n, abimes: ab, code };
  } });
  const terminal = compilerTerminalPicking(P.terminal || err('il manque le terminal (le picking est guidé à la voix)'), { E, refs }, err);
  return { P, mode: 'picking', T, refs, E, terminal, nomDe: (ref) => refs[ref].court || refs[ref].nom };
}

function compilerTerminalPicking(D, { E, refs }, err) {
  if (!Array.isArray(D.lignes) || !D.lignes.length) err('terminal : `lignes` est une liste (au moins une ligne)');
  const mots = D.mots || MOTS_PREPARATION;
  if (!Array.isArray(mots)) err('terminal : `mots` est une liste');
  mots.forEach((m) => { if (!m || !m.id || !m.lib) err('terminal : un mot sans `id` ou sans `lib`'); });
  const ids = new Set();
  const unId = (id, ou) => { if (ids.has(id)) err(`${ou} : la ligne ${id} existe déjà (donner un \`id\`)`); ids.add(id); return id; };
  const lieu = (e) => `Côté ${e.cote}, travée ${t2(e.t)}, niveau 1.`;
  const dire = (e, n) => `${refs[e.ref].voix || refs[e.ref].nom}${e.lot ? `, lot ${e.lot}` : ''}. Prends ${n}.`;
  const jalons = [];
  const lignes = D.lignes.map((l, k) => {
    const ou = `terminal, ligne n° ${k + 1}`;
    const e = E[l && l.emplacement] || err(`${ou} : emplacement inconnu (${l && l.emplacement})`);
    if ('pose' in l) err(`${ou} : la pose sur les palettes arrive avec le montage (chantier D-7, lot 4)`);
    const prends = l.prends;
    if (!Number.isInteger(prends) || prends < 1 || prends > e.n) err(`${ou} : \`prends\` va de 1 à ${e.n} (ce que contient ${e.adr})`);
    const id = unId(String(l.id || e.adr), ou);
    const a = l.attendu || null;
    if (a) {
      const m = mots.find((x) => x.id === a.mot) || err(`${ou} : l'exception attendue dit un mot inconnu (${a.mot})`);
      if (!m.combien && a.n !== prends) err(`${ou} : « ${m.lib} » signale toute la ligne, \`attendu.n\` vaut ${prends}`);
      if (!Number.isInteger(a.n) || a.n < 1 || a.n > prends) err(`${ou} : \`attendu.n\` va de 1 à ${prends}`);
    }
    const ligne = { id, emplacement: e.adr, lieu: lieu(e), code: e.code, prends, question: dire(e, prends) };
    jalons.push({ id: `ligne-${id}`, ligne: id, prends, attendu: a, lib: l.jalon || null, ref: e.ref });
    if (l.remplacement) {
      const r = l.remplacement, er = E[r.emplacement] || err(`${ou} : remplacement à un emplacement inconnu (${r.emplacement})`);
      if (er.ref !== e.ref) err(`${ou} : le remplacement est la même référence (${e.ref}), pas ${er.ref}`);
      if (er.n < prends) err(`${ou} : le remplacement ${er.adr} ne contient que ${er.n} (il en faut ${prends} si toute la ligne est signalée)`);
      const rid = unId(String(r.id || er.adr), `${ou}, remplacement`);
      ligne.remplacement = { id: rid, emplacement: er.adr, lieu: lieu(er), code: er.code, question: (n) => dire(er, n) };
      if (a) jalons.push({ id: `ligne-${rid}`, ligne: rid, remplace: id, n: a.n, lib: r.jalon || null, ref: er.ref });
    } else if (a) err(`${ou} : une exception attendue sans \`remplacement\` (le terminal ne donnerait pas la suite)`);
    return ligne;
  });
  jalons.forEach((j, k) => { if (!j.lib) j.lib = `Ligne ${k + 1} : ${refs[j.ref].court || refs[j.ref].nom}`; });
  return { titre: D.titre || '', lignes, mots, jalons, phraseBilan: D.phraseBilan || '',
    textes: { fin: D.fin || 'Préparation terminée.', codeFaux: D.codeFaux || 'Code faux. Vérifie l’emplacement.' } };
}

/* ================================================================ le jugement */
export const etatPickingNeuf = () => ({ terminal: terminalNeuf(), vus: {}, premierGeste: null });

// Les jalons (brief §5, 1 à 5) : juste ou faux une fois le terminal fini, rien avant (voir la tête).
export function jalonsPicking(M, e) {
  const T = e.terminal || terminalNeuf(), R = T.reponses || {}, EX = T.exceptions || {}, fin = !!T.fin;
  return M.terminal.jalons.map((j) => {
    let ok;
    if (j.remplace) ok = R[j.ligne] === j.n;
    else if (j.attendu) { const x = EX[j.ligne]; ok = !!x && x.mot === j.attendu.mot && x.n === j.attendu.n && R[j.ligne] === j.prends - j.attendu.n; }
    else ok = !EX[j.ligne] && R[j.ligne] === j.prends;
    ok = fin && ok;
    return { id: j.id, lib: j.lib, ok, etat: fin ? (ok ? 'ok' : 'ko') : undefined, ligne: j.ligne,
      pris: j.ligne in R ? R[j.ligne] : null, exception: EX[j.ligne] || null };
  });
}

// Ce que le terminal attend, ligne à ligne (côté enseignant, page d'essai, tests) : JAMAIS montré à l'élève.
export function attendusPicking(M) {
  return M.terminal.lignes.flatMap((l) => {
    const j = M.terminal.jalons.find((x) => x.ligne === l.id), a = j && j.attendu;
    const L = [{ ligne: l.id, emplacement: l.emplacement, code: l.code, prends: a ? l.prends - a.n : l.prends, mot: a ? a.mot : null, n: a ? a.n : 0 }];
    if (a) L.push({ ligne: l.remplacement.id, emplacement: l.remplacement.emplacement, code: l.remplacement.code, prends: a.n, mot: null, n: 0 });
    return L;
  });
}

/* ================================================================ la géométrie */
// En mètres. Côté A au fond (y de 0 à 1), l'allée, côté B devant (y de 3,2 à 4,2) ; T01 à droite, près de la zone de
// préparation et du quai ; une travée tous les 2,10 m (l'écart sépare les volumes qu'on survole).
const PAS = 2.1, Y = { A: 0, B: 3.2 }, ALLEE = [1.05, 3.15];
function geometrie(M) {
  const xT = (t) => (M.T - t) * PAS, xFin = (M.T - 1) * PAS + TRAVEE.L;
  const zone = { de: [xFin + .5, .2], a: [xFin + 3.1, 4.2] };
  return { xT, xFin, zone, xMax: zone.a[0] + .4, yMax: 5.2,
    // Où se tient le préparateur : dans l'allée, devant la travée (tourné vers elle), ou dans la zone de préparation au départ.
    ici: (adr) => {
      if (!adr) return { x: zone.de[0] + .9, y: 2.1, dos: false };
      const e = M.E[adr];
      return { x: xT(e.t) + TRAVEE.L / 2, y: e.cote === 'A' ? 1.75 : 2.6, dos: e.cote === 'A' };
    } };
}

/* ======================================================================= vue */
// `h` : ce que prête `entrepot.js` (Échap, focus au clavier).
export function creerPicking(P, M, opts, h) {
  if (opts.copie) throw new Error(`entrepot ${P.id} : le mode picking n'a pas encore d'évaluation`);
  const G = geometrie(M);
  const ui = { ouvert: null, ici: null, regles: false, focus: null };
  const tempsDe = (api) => P.temps || (api && api.temps) || 'guidage';
  const TT = M.terminal;
  const TERM = creerTerminal({ lignes: TT.lignes, textes: TT.textes, titre: TT.titre, mots: TT.mots });
  const contenu = (e) => {
    const r = M.refs[e.ref];
    return r.type === 'fut' ? { type: 'fut', n: e.n, litres: r.litres, bande: r.bande, abimes: e.abimes }
      : { type: 'casier', n: e.n, capsule: r.capsule };
  };
  const cadre = (I, pts) => {
    const xy = pts.map((p) => I.P(...p)), xs = xy.map((p) => p[0]), ys = xy.map((p) => p[1]);
    const x0 = Math.min(...xs) - 14, y0 = Math.min(...ys) - 14;
    return `${x0.toFixed(0)} ${y0.toFixed(0)} ${(Math.max(...xs) - x0 + 14).toFixed(0)} ${(Math.max(...ys) - y0 + 14).toFixed(0)}`;
  };

  // L'ALLÉE. De l'arrière vers l'avant : sol, mur, zone de préparation ; côté A ; le préparateur ; côté B en transparence.
  // Puis ce qu'on clique, AU-DESSUS de tout : les volumes des travées (B d'abord, A par-dessus : là où ils se recouvrent à
  // l'écran, c'est la travée du fond qu'on vise), et les adresses écrites au sol. Les dessins des travées ne prennent pas le
  // clic (le côté B, transparent, couvrirait le côté A). AUCUN code ici.
  function svgAllee() {
    const I = projection({ unite: 60, origine: [0, 0] }), xF = G.xMax;
    const decor = [
      { type: 'sol', de: [-.4, -.4], a: [xF, G.yMax] },
      { type: 'mur', y: -.3, de: -.4, a: xF, hauteur: 2.9 },
      { type: 'allee', de: [-.4, ALLEE[0]], a: [G.xFin + .3, ALLEE[1]] },
      { type: 'texteSol', texte: 'ALLÉE DE PICKING', en: [G.xFin / 2, (ALLEE[0] + ALLEE[1]) / 2 + .25], style: 'allee' },
    ];
    if (P.plan.zone) decor.push({ type: 'zone', ton: 'reception', de: G.zone.de, a: G.zone.a, titre: String(P.plan.zone).toUpperCase() });
    if (P.plan.quai) decor.push({ type: 'quai', de: [G.zone.de[0] + .5, G.yMax - .7], texte: P.plan.quai });
    let s = dessinerDecor(I, compilerScene({ decor }, `entrepot ${P.id}`));
    const art = (c) => Object.values(M.E).filter((e) => e.cote === c)
      .map((e) => traveePicking(I, G.xT(e.t), Y[c], { cote: c, contenu: contenu(e), voile: c === 'B' ? .3 : null })).join('');
    const p = G.ici(ui.ici);
    s += `<g pointer-events="none">${art('A')}<g data-pk-preparateur="${ech(ui.ici || '')}">${personne(I, p.x, p.y, { casque: true, terminal: true, dos: p.dos })}</g>${art('B')}</g>`;
    const volume = (e) => `<g class="pk-trav${ui.ici === e.adr ? ' pk-ici' : ''}" data-pk-trav="${ech(e.adr)}" data-pe-cle="t:${ech(e.adr)}" tabindex="0" role="button"
      aria-label="${ech(`Aller à la travée ${e.adr}`)}">${volumeTravee(I, G.xT(e.t), Y[e.cote]).map((q) => `<polygon points="${q}"/>`).join('')}</g>`;
    s += ['B', 'A'].map((c) => Object.values(M.E).filter((e) => e.cote === c).map(volume).join('')).join('');
    s += Object.values(M.E).map((e) => {
      const [ax, ay] = I.P(G.xT(e.t) + TRAVEE.L / 2, e.cote === 'A' ? ALLEE[0] + .3 : ALLEE[1] - .3, 0);
      return `<text class="pk-adr" data-pk-adr="${ech(e.adr)}" x="${ax.toFixed(1)}" y="${(ay + 5).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="800"
        fill="#3d3a33" stroke="#efeadf" stroke-width="4" paint-order="stroke">${ech(e.adr)}</text>`;
    }).join('');
    const vb = cadre(I, [[-.4, -.4, 0], [xF, -.4, 0], [xF, G.yMax, 0], [-.4, G.yMax, 0], [-.4, -.55, 2.9], [xF, -.55, 2.9]]);
    return `<svg class="pm-svg pk-svg" viewBox="${vb}" role="img" aria-label="${ech(`L’allée de picking, en 3D : côté A au fond, côté B devant, de la travée 01 (à droite, près de la ${String(P.plan.zone || 'zone de préparation').toLowerCase()}) à la travée ${t2(M.T)}`)}">${DEFS}${s}</svg>`;
  }

  // LA VUE DE PRÈS : la travée seule, de face depuis l'allée (un côté B se voit aussi de face), étages du dessus en
  // transparence, le tiroir et sa marchandise, l'étiquette de la lisse avec le code détrompeur en gros.
  function svgPres(e) {
    const I = projection({ unite: 150, origine: [0, 0] }), r = M.refs[e.ref], { L, D } = TRAVEE;
    const decor = [
      { type: 'sol', de: [-.4, -.3], a: [L + .5, D + 1.1] },
      { type: 'allee', de: [-.4, D + .05], a: [L + .5, D + 1.1] },
      { type: 'texteSol', texte: 'ALLÉE', en: [L + .1, D + .42], style: 'allee' },
    ];
    let s = dessinerDecor(I, compilerScene({ decor }, `entrepot ${P.id}`));
    s += traveePicking(I, 0, 0, { cote: 'A', contenu: contenu(e), voileHaut: .3,
      etiquette: { adresse: `${e.adr}-N1`, designation: r.nom, lot: e.lot, code: e.code } });
    // Cadré sur le niveau 1 et le bas du niveau 2 : le tiroir, sa marchandise et l'étiquette en grand (le haut est vide).
    const vb = cadre(I, [[-.15, -.1, 0], [L + .25, -.1, 0], [L + .25, D + .6, 0], [-.15, D + .6, 0], [0, 0, TRAVEE.N2 + .2], [L, 0, TRAVEE.N2 + .2]]);
    return `<svg class="pm-svg pk-svg" viewBox="${vb}" role="img" aria-label="${ech(`L’emplacement ${e.adr}-N1, de près : le tiroir coulissant et l’étiquette de la lisse`)}">${DEFS}${s}</svg>`;
  }

  return {
    signaux: [...Object.keys(M.E).map((a) => `entrepot:${P.id}:ouvrir:${a}`),
      ...TT.lignes.flatMap((l) => [l.id, ...(l.remplacement ? [l.remplacement.id] : [])]).map((id) => `entrepot:${P.id}:ligne:${id}`),
      `entrepot:${P.id}:fin`],
    id: P.id,
    nav: { libelle: P.libelle || 'Allée de picking' },
    etatNeuf: etatPickingNeuf,
    calculette: () => false,
    lire: () => ({ ouvert: ui.ouvert, ici: ui.ici }),
    html(e, api) {
      if (!e.terminal) Object.assign(e, etatPickingNeuf(), e);
      if (!e.vus) e.vus = {};
      const t = tempsDe(api), estProf = !!(api && api.estProf);
      const per = P.personnage || {}, txt = (per.texte || {})[t] || '';
      const RG = P.regles;
      const regles = t !== 'evaluation' && RG ? `<details class="pe-regles" data-pe-regles ${ui.regles ? 'open' : ''}><summary data-pe-cle="b:regles">${ech(RG.titre || 'Les règles')} ▾</summary>
        <div class="pe-regles-corps"><b>${ech(RG.entete || 'Les règles')}</b><ol>${(RG.lignes || []).map((l) => `<li>${l}</li>`).join('')}</ol>
        ${RG.encadre ? `<div class="pe-encadre">${RG.encadre}</div>` : ''}</div></details>` : '';
      const e0 = ui.ouvert ? M.E[ui.ouvert] : null;
      const fil = e0 ? `<button type="button" class="btn" data-pm="retour" data-pe-cle="b:retour">← Retour à l’allée</button>
          <span>Allée de picking › <b>${ech(e0.adr)}</b>, de près — N1 : picking (tiroir coulissant) · N2-N3 : vides</span>`
        : '<span>Allée de picking, en 3D — clique une travée (ou son adresse au sol) pour y aller et lire son étiquette.</span>';
      const bilan = e.terminal.fin ? htmlBilanTerminal(bilanTerminal(e.terminal, TT.lignes), TT.phraseBilan) : '';
      const prof = !estProf ? '' : `<details class="pe-prof" data-pk-attendus><summary>Côté enseignant : ce que le terminal attend</summary>${attendusPicking(M).map((a) =>
        `<div><b>${ech(a.emplacement)}</b> (code ${ech(a.code)}) : ${a.mot ? `${ech((TT.mots.find((m) => m.id === a.mot) || {}).lib || a.mot)} ${a.n}, puis ` : ''}prendre ${a.prends}</div>`).join('')}</details>`;
      return `<div class="pe pm pk" data-entrepot="${ech(P.id)}" data-pe-mode="picking" data-pe-temps="${t}" data-pk-ouvert="${e0 ? ech(e0.adr) : ''}">
        <div class="pm-haut"><div class="pe-perso pm-perso"><b>${ech([per.nom, per.role].filter(Boolean).join(', '))}${per.date ? ` · ${ech(per.date)}` : ''}</b>${txt}</div>
          <div class="pm-act">${regles}</div></div>
        <div class="pm-jeu pm-avec-term"><aside class="pm-cote">${TERM.html(e.terminal, { estProf, son: !!(api && api.sonTerminal && api.sonTerminal()) })}
            <div class="pm-consigne" data-pm-consigne>${ech(P.consigne || 'Écoute (ou lis) le terminal, va à l’emplacement, réponds.')}</div>
            ${P.annonce ? `<div class="pm-consigne pk-annonce" data-pk-annonce>${ech(P.annonce)}</div>` : ''}${bilan}${prof}</aside>
          <section class="pe-espace pm-espace"><div class="pm-fil">${fil}</div><div class="pm-dessin">${e0 ? svgPres(e0) : svgAllee()}</div></section></div></div>`;
    },
    brancher(z, e, api) {
      const racine = z.querySelector('.pk');
      if (!racine) return;
      const redessiner = () => api.redessiner();
      const sauver = () => api.sauver();
      const sig = (n) => { if (api.signal) api.signal(`entrepot:${P.id}:${n}`); };
      const activer = (el, fn) => {
        el.addEventListener('click', fn);
        if (el.tagName !== 'BUTTON') el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); } });
      };
      const fermer = () => {
        if (!ui.ouvert) return false;
        ui.focus = `t:${ui.ouvert}`; ui.ouvert = null; redessiner(); return true;
      };
      h.echap(racine, fermer);
      // La hauteur d'écran qui reste sous le haut de la vue : la 3D y tient en entier (1366 × 768 sans défiler).
      const dessin = racine.querySelector('.pm-dessin');
      const caler = () => {
        if (!dessin.isConnected) { window.removeEventListener('resize', caler); return; }
        const haut = dessin.getBoundingClientRect().top + window.scrollY;
        racine.style.setProperty('--pm-dispo', `${Math.max(300, Math.round(window.innerHeight - haut - 18))}px`);
      };
      caler();
      window.addEventListener('resize', caler);
      racine.addEventListener('focusin', (ev) => { const t = ev.target.closest && ev.target.closest('[data-pe-cle]'); if (t) ui.focus = t.dataset.peCle; });
      const det = racine.querySelector('[data-pe-regles]');
      if (det) det.addEventListener('toggle', () => { ui.regles = det.open; });
      racine.querySelectorAll('[data-pm="retour"]').forEach((b) => activer(b, fermer));
      // Aller à une travée : le préparateur s'y place, la vue de près s'ouvre ; la première ouverture est retenue.
      const aller = (adr) => {
        if (!M.E[adr]) return;
        ui.ouvert = adr; ui.ici = adr; ui.focus = 'b:retour';
        if (!e.vus[adr]) { e.vus[adr] = Date.now(); if (!e.premierGeste) e.premierGeste = e.vus[adr]; sauver(); }
        sig(`ouvrir:${adr}`);
        redessiner();
      };
      racine.querySelectorAll('[data-pk-trav]').forEach((g) => activer(g, () => aller(g.dataset.pkTrav)));
      // L'adresse au sol se clique aussi, et éclaire le volume de sa travée.
      racine.querySelectorAll('[data-pk-adr]').forEach((t) => {
        const vol = racine.querySelector(`[data-pk-trav="${CSS.escape(t.dataset.pkAdr)}"]`);
        t.addEventListener('click', () => aller(t.dataset.pkAdr));
        t.addEventListener('mouseenter', () => { if (vol) vol.classList.add('pk-survol'); });
        t.addEventListener('mouseleave', () => { if (vol) vol.classList.remove('pk-survol'); });
      });
      if (h.clavier() && ui.focus) {
        const el = racine.querySelector(`[data-pe-cle="${CSS.escape(ui.focus)}"]`);
        if (el) el.focus({ preventScroll: true });
      }
      // À la fin du terminal, tout l'écran (menu compris) : une entrée qui attend la fin apparaît tout de suite.
      TERM.brancher(racine, e.terminal, { sauver,
        redessiner: () => (e.terminal.fin && api.redessinerTout ? api.redessinerTout() : redessiner()),
        signal: (evt, l) => {
          if ((evt === 'reponse' || evt === 'fin') && l) sig(`ligne:${l.id}`);
          if (evt === 'fin') sig('fin');
        } });
    },
  };
}
