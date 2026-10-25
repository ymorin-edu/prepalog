// Vue « Plan d'entrepôt », mode PRÉPARATION GUIDÉE À LA VOIX, en cartons — le mode `preparation` (ENT-5.6 Smoby : plan, travée de
// face, picking au niveau 1, réserve au-dessus) quand la déclaration porte un `terminal` : le TERMINAL VOCAL (ENT-6.7 France Boissons,
// `terminal.js`) remplace le bon de préparation, et le MONTAGE « Où poses-tu ? Palette · À côté » (porté d'`entrepot-picking.js`) monte la
// palette dans l'ordre de POSE, pas de prélèvement. Chantier E-8 (brief `docs/briefs/MOTEUR-preparation-vocale-cartons.md`), lots 1 et 2,
// 25/10/2026 ; pour Action, ENT-8.15 à 8.19. Rien de Smoby ni de France Boissons ne change : sans `terminal`, le mode préparation est
// celui d'ENT-5.6, intact (`entrepot.js`) ; l'allée 3D de France Boissons reste `entrepot-picking.js`.
//
// Ce que la déclaration ajoute au mode préparation (le reste : la tête d'`entrepot.js`, « PRÉPARATION ») :
//
//   terminal: {
//     titre?: 'Préparation',                          // la seconde moitié de l'en-tête du boîtier
//     mots?: [{ id, lib, combien }],                  // défaut : Manquant, Abîmé (combien ?), Emplacement vide (ceux du picking)
//     fin?: 'Commande terminée. …', phraseBilan?: '…', // la phrase de fin ; celle sous « Ce que le terminal sait de toi »
//     montrer?: 'travee',                             // l'aide de l'élève accompagné : la travée de la ligne en cours, cernée sur le plan
//   },
//   codes: { 'A1-T03-N1-E1': '47', … },             // le CODE DE CONTRÔLE de chaque emplacement de la commande (2 à 4 chiffres)
//   produits: { LES: { …, voix?: 'Lessive liquide, trois litres' } },   // `voix` : ce que dit le terminal (défaut : `nom`)
//   jalons?: [{ type: 'lignes' }, { type: 'lourds' }, …],   // 'lignes' = un jalon par ligne ; défaut : lignes, lourds, fragiles, poids,
//                                                           // hauteur, film, etiquettes (ni `parcours` : le système choisit le chemin,
//                                                           // ni `lignesJustes` : chaque ligne a son jalon)
//
// LE TERMINAL dit « Allée B1, travée 03, niveau 1, emplacement 2. Code de contrôle ? » ; le code n'est écrit QUE sur l'étiquette de la
// lisse, dans la VUE DE PRÈS (clic sur l'emplacement dans la travée de face) : ni sur le plan, ni dans la travée, ni dans un texte.
// Puis « Lessive liquide 3 L. Prends 4. » : la quantité juste PRÉLÈVE (le picking baisse), le terminal dit « Pose tes 4 cartons. » et
// attend ; sous lui : « Où poses-tu les 4 cartons Lessive ? » → Palette · « À côté, je les pose après » (une ligne = une destination).
// Le terminal fini, les cartons « à côté » se posent (clic sur le groupe, puis « Sur la palette ») ; « ↶ Reposer le dernier » remet à
// côté le dernier groupe posé ; film et étiquettes ; « Vérifier ma préparation » (actif quand rien n'est à côté).
// LA PALETTE se recalcule depuis l'ordre de pose (jamais rangée) : hauteur = support + Σ ⌈q / parCouche⌉ × h ; poids ; « jamais un lourd
// sur un non-lourd » ; « rien de non fragile sur un fragile » — les règles de `calculPrep` (ENT-5.6), lues ici sur l'ordre de POSE.
//
// JALONS : un par ligne (la quantité demandée, prise, sans exception ; jugé à la fin du terminal, rien avant) ; puis les critères de la
// palette, jugés SEULEMENT si le terminal est fini, que toutes les lignes sont justes et que rien n'est à côté (une palette vide ou
// incomplète respecte « lourds en bas » : aucun jalon par inaction, comme Smoby et France Boissons). Jamais rien de refusé au montage.
// Les CODES FAUX sont comptés dans « Ce que le terminal sait de toi », jamais notés.
//
// L'ÉTAT, dans la base de l'élève (`db.entrepots[<id>]`) :
//   { terminal (voir `terminal.js`), pick: { adresse: cartons restants }, palettes: [[{ a, k, q, ligne }, …]] (l'ordre de pose),
//     cote: [{ a, k, q, ligne }], film: ['4'], etiq: [{ avant: true, … }], vus: { adresse: date }, verifie, verifs, premierGeste }
// Gestes publiés (questions au fil) : `entrepot:<id>:ouvrir:<adresse>` (vue de près), `code:<ligne>` (code juste), `ligne:<ligne>`
// (ligne posée), `poser:palette` / `poser:cote`, `pose:lourd|normal|fragile` (un groupe posé sur la palette), `fin` (terminal fini),
// `film`, `etiquettes`, `verifier`.

import { ech, pad2 } from '../texte.js';
import { creerTerminal, terminalNeuf, bilanTerminal, htmlBilanTerminal, lignesDuTerminal } from './terminal.js';

export const MOTS_VOCAL = [
  { id: 'manquant', lib: 'Manquant', combien: true },
  { id: 'abime', lib: 'Abîmé', combien: true },
  { id: 'vide', lib: 'Emplacement vide' },
];
const CRITERES = ['lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes'];
const ETIQ_COTES = [['avant', 'face avant'], ['arriere', 'face arrière'], ['gauche', 'côté gauche'], ['droite', 'côté droit'], ['dessus', 'dessus']];
const ETIQ_JUSTES = ['arriere,avant,dessus', 'dessus,droite,gauche'];
const TXT = 'font-family="system-ui, sans-serif"';
const virg = (x, d = 2) => Number(x).toFixed(d).replace('.', ',');
const decoupe = (a) => { const m = /^([A-Z]+\d+)-T(\d+)-N(\d+)-E(\d+)$/.exec(String(a || '')); return m ? { c: m[1], t: +m[2], n: +m[3], e: +m[4] } : null; };

/* ================================================================ compilation */
// Appelée par `compilerPrep` (entrepot.js) quand la déclaration porte `terminal`, après les lignes, le picking et les jalons de Smoby.
// Pose `M.vocal` et remplace `M.jalons`. `libs` : les noms des critères de la préparation (JALONS_PREP d'entrepot.js).
export function compilerVocal(M, err, libs) {
  const P = M.P, D = P.terminal, C = M.C;
  if (typeof D !== 'object') err('terminal : un objet { titre?, mots?, fin? }');
  const codes = P.codes || err('terminal : il manque les codes de contrôle (`codes`, un par emplacement de la commande)');
  const mots = D.mots || MOTS_VOCAL;
  if (!Array.isArray(mots)) err('terminal : `mots` est une liste');
  mots.forEach((m) => { if (!m || !m.id || !m.lib) err('terminal : un mot sans `id` ou sans `lib`'); });
  const court = (k) => M.produits[k].court || String(M.produits[k].nom).split(' ')[0];
  const voix = (k) => M.produits[k].voix || M.produits[k].nom;
  const codeDe = (a, ou) => {
    const c = codes[a] == null ? '' : String(codes[a]);
    if (!/^\d{2,4}$/.test(c)) err(`${ou} : le code de contrôle de ${a} manque ou ne fait pas 2 à 4 chiffres (\`codes\`)`);
    return c;
  };
  const lieu = (a) => { const d = decoupe(a); return `Allée ${d.c}, travée ${pad2(d.t)}, niveau 1, emplacement ${d.e}.`; };
  const pose = (n) => (n > 1 ? `Pose tes ${n} cartons.` : 'Pose ton carton.');
  const lignes = M.lignes.map((l, i) => ({ id: `L${i + 1}`, a: l.a, produit: l.produit, q: l.q, lieu: lieu(l.a), code: codeDe(l.a, `ligne ${i + 1}`),
    prends: l.q, question: `${voix(l.produit)}. Prends ${l.q}.`, pose }));
  const palettes = [{ p: 0, client: C.client || '', etiquette: C.etiquette || C.client || '' }];
  const types = (P.jalons || [{ type: 'lignes' }, ...CRITERES.map((t) => ({ type: t }))]).map((j) => j.type);
  const jalons = [];
  types.forEach((t) => {
    if (t === 'lignes') lignes.forEach((l, i) => jalons.push({ id: `ligne-${l.id}`, ligne: l.id, prends: l.q, lib: `Ligne ${i + 1} : ${court(l.produit)}` }));
    else if (CRITERES.includes(t)) jalons.push({ id: t, critere: t, lib: libs[t] });
    else err(`jalon de type « ${t} » : avec le terminal, les types sont lignes, ${CRITERES.join(', ')}`);
  });
  if (!jalons.some((j) => j.ligne)) err('jalons : il faut le type « lignes » (un jalon par ligne)');
  M.jalons = jalons.map((j) => Object.assign({ type: j.critere || 'ligne' }, j));
  M.vocal = { lignes, mots, palettes, court, titre: D.titre || 'Préparation', montrer: D.montrer || '',
    textes: { fin: D.fin || 'Commande terminée.', codeFaux: D.codeFaux || 'Code faux. Vérifie l’emplacement.' }, phraseBilan: D.phraseBilan || '' };
}

/* ================================================================ le jugement */
export const etatVocalNeuf = () => ({ terminal: terminalNeuf(), pick: {}, palettes: [[]], cote: [], film: [], etiq: [], vus: {},
  verifie: false, verifs: 0, premierGeste: null });
const completer = (e) => { Object.entries(etatVocalNeuf()).forEach(([k, v]) => { if (e[k] == null) e[k] = v; }); return e; };

// Une palette rejouée dans l'ordre de pose : couches (deux groupes de suite du même emplacement font une couche), hauteur, poids, règles.
export function calculPalette(M, liste, film, etiq) {
  const couches = [];
  (liste || []).forEach((g) => { const z = couches[couches.length - 1]; if (z && z.a === g.a) z.q += g.q; else couches.push({ a: g.a, k: g.k, q: g.q }); });
  const carton = (k) => M.produits[k].carton;
  const hauteur = M.support.h + couches.reduce((t, c) => t + Math.ceil(c.q / carton(c.k).parCouche) * carton(c.k).h, 0);
  const poids = Math.round(M.support.kg + (liste || []).reduce((t, g) => t + g.q * carton(g.k).kg, 0));
  let nonLourd = false, lourds = true;
  (liste || []).forEach((g) => { if (M.classe(g.k) === 'lourd' && nonLourd) lourds = false; if (M.classe(g.k) !== 'lourd') nonLourd = true; });
  const fragiles = !(liste || []).some((g, i) => M.classe(g.k) === 'fragile' && liste.slice(i + 1).some((h) => M.classe(h.k) !== 'fragile'));
  const tours = parseInt(film, 10);
  const etq = ETIQ_COTES.map((x) => x[0]).filter((k) => (etiq || {})[k]).sort().join(',');
  return { couches, hauteur, poids, cartons: (liste || []).reduce((t, g) => t + g.q, 0),
    regles: { lourds, fragiles, poids: poids <= M.C.kgMax, hauteur: hauteur <= M.C.hMax + 1e-9, film: tours >= 3 && tours <= 5, etiquettes: ETIQ_JUSTES.includes(etq) } };
}

export function jalonsVocal(M, e0) {
  const e = completer(Object.assign({}, e0));
  const T = e.terminal || terminalNeuf(), R = T.reponses || {}, EX = T.exceptions || {}, fin = !!T.fin;
  const L = [];
  M.jalons.filter((j) => j.ligne).forEach((j) => {
    const ok = fin && !EX[j.ligne] && R[j.ligne] === j.prends;
    L.push({ id: j.id, lib: j.lib, ok, etat: fin ? (ok ? 'ok' : 'ko') : undefined, ligne: j.ligne, pris: j.ligne in R ? R[j.ligne] : null, exception: EX[j.ligne] || null });
  });
  const lignesOk = L.every((l) => l.ok), rien = !(e.cote || []).length;
  // Chaque carton pris est sur une palette (une base incomplète ou bricolée ne gagne aucun critère).
  const poses = {};
  (e.palettes || []).forEach((pl) => (pl || []).forEach((g) => { poses[g.ligne] = (poses[g.ligne] || 0) + g.q; }));
  const complet = M.vocal.lignes.every((l) => (poses[l.id] || 0) === (R[l.id] || 0));
  const juge = fin && rien && lignesOk && complet;
  const X = M.vocal.palettes.map((pl) => calculPalette(M, e.palettes[pl.p] || [], (e.film || [])[pl.p], (e.etiq || [])[pl.p]));
  M.jalons.filter((j) => j.critere).forEach((j) => {
    const ok = juge && X.every((x) => x.regles[j.critere]);
    L.push({ id: j.id, lib: j.lib, ok, critere: j.critere, nonJuge: fin && rien && !lignesOk });
  });
  return L;
}

// Ce que le terminal attend, ligne à ligne (côté enseignant, page d'essai, tests) : JAMAIS montré à l'élève.
export function attendusVocal(M) {
  return M.vocal.lignes.map((l) => ({ ligne: l.id, emplacement: l.a, code: l.code, prends: l.q, produit: l.produit }));
}
export function detailVocal(M, e0, L) {
  const e = completer(Object.assign({}, e0)), T = e.terminal || terminalNeuf();
  return { jalons: L.map((l) => ({ jalon: l.lib, ok: l.ok, pris: l.pris, exception: l.exception })), codesFaux: T.codesFaux || {},
    vus: Object.keys(e.vus || {}), palettes: (e.palettes || []).map((p) => p.map((g) => `${g.k} ${g.q}`)), aCote: (e.cote || []).length,
    verifs: e.verifs || 0, premierGeste: e.premierGeste || null };
}

/* ======================================================================= vue */
// `O` : ce que prête `creerEntrepot` — la géométrie du plan (`G`), le plan et la travée de face (`htmlPlan`, `htmlFace`, qui lisent
// `e.pick` et `e.vides`), l'état d'écran partagé (`ui` : `trav`, `anim`, `focus`, `msg`), la pile de cartons dessinée, Échap, le clavier.
export function creerVocal(P, M, opts, O) {
  if (opts.copie) throw new Error(`entrepot ${P.id} : la préparation vocale n'a pas encore d'évaluation (chantier E-8, lot 5)`);
  const ui = O.ui, G = O.G, V = M.vocal;
  Object.assign(ui, { pres: null, main: null, regles: false });
  const geste = (n) => `entrepot:${P.id}:${n}`;
  const TERM = creerTerminal({ lignes: V.lignes, textes: V.textes, titre: V.titre, mots: V.mots });
  const tempsDe = (api) => P.temps || (api && api.temps) || 'guidage';
  const pickDe = (e, a) => (a in (e.pick || {}) ? e.pick[a] : M.pick0(a));
  const court = V.court;
  const ligneEnCours = (e) => lignesDuTerminal(V.lignes, e.terminal)[e.terminal.i] || null;
  const dire = (t, type) => { ui.msg = t; ui.msgType = type || ''; };
  const noter = (e) => { if (!e.premierGeste) e.premierGeste = Date.now(); };
  const quoi = (k, n) => `${n > 1 ? `les ${n} cartons` : 'le carton'} ${court(k)}`;

  /* --------------------------------------------------------- les dessins */
  // La palette de commande vue de face, montée dans l'ordre de pose (repris de la palette de Smoby, ENT-5.6, sans changer le dessin).
  function svgPalette(e, pl) {
    const C = M.C, liste = e.palettes[pl.p] || [], X = calculPalette(M, liste, (e.film || [])[pl.p], (e.etiq || [])[pl.p]);
    const K = 200, W = 220, X0 = 16, hv = Math.max(X.hauteur, C.hMax) + 0.14, H = hv * K + 30, Yb = H - 18, hp = M.support.h * K;
    let s = `<rect x="0" y="${Yb}" width="460" height="18" fill="var(--pe-sol)"/><rect x="${X0}" y="${Yb - hp}" width="${W}" height="8" fill="#b98b55"/>`;
    [0, 0.45, 0.9].forEach((f) => { s += `<rect x="${X0 + f * W}" y="${Yb - hp + 8}" width="${W * 0.1}" height="${Math.max(0, hp - 8)}" fill="#8f6532"/>`; });
    let y = Yb - hp;
    if (!X.couches.length) s += `<text x="${X0 + W / 2}" y="${Yb - hp - 30}" text-anchor="middle" font-size="14" fill="var(--encre-douce)" ${TXT}>Palette vide.</text>`;
    X.couches.forEach((f, i) => {
      const c = M.produits[f.k].carton, cl = M.classe(f.k), n = Math.ceil(f.q / c.parCouche), bh = c.h * K, bw = W / c.parCouche;
      for (let k = 0; k < n; k++) {
        const dans = Math.min(c.parCouche, f.q - k * c.parCouche);
        for (let j = 0; j < dans; j++) s += `<rect x="${(X0 + j * bw + 1).toFixed(1)}" y="${(y - bh * (k + 1) + 1).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${(bh - 2).toFixed(1)}" fill="${cl === 'fragile' ? '#f2dcb8' : cl === 'lourd' ? '#b07c40' : '#d4a46a'}" stroke="#6e4a22" stroke-width="1.2"/>`;
      }
      const top = y - bh * n, ym = (y + top) / 2;
      if (cl === 'fragile') s += `<text x="${X0 + W / 2}" y="${ym + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#9d2727" ${TXT}>FRAGILE</text>`;
      s += `<line x1="${X0 + W + 2}" y1="${ym}" x2="${X0 + W + 12}" y2="${ym}" stroke="var(--encre-douce)"/>
        <text x="${X0 + W + 16}" y="${ym + 5}" font-size="15" font-weight="700" fill="var(--encre)" ${TXT}>${i + 1}. ${ech(court(f.k))} × ${f.q} <tspan font-weight="400" fill="var(--encre-douce)">(${Math.round(f.q * c.kg)} kg${cl === 'lourd' ? ', lourd' : cl === 'fragile' ? ', fragile' : ''})</tspan></text>`;
      y = top;
    });
    const et = (e.etiq || [])[pl.p] || {};
    if ((e.film || [])[pl.p] && X.couches.length) s += `<rect x="${X0 - 3}" y="${y - 2}" width="${W + 6}" height="${Yb - hp - y + 10}" fill="rgba(150,190,230,.22)" stroke="rgba(120,160,210,.8)" stroke-width="1.5" data-pvc-filme/>`;
    if (et.avant && X.couches.length) s += `<rect x="${X0 + W - 70}" y="${(y + Yb - hp) / 2 - 14}" width="62" height="28" fill="#fbfaf6" stroke="#555"/><text x="${X0 + W - 39}" y="${(y + Yb - hp) / 2 + 4}" text-anchor="middle" font-size="9" font-weight="800" fill="#1a1915" ${TXT}>${ech(pl.etiquette)}</text>`;
    if (et.dessus && X.couches.length) s += `<rect x="${X0 + W / 2 - 22}" y="${y - 6}" width="44" height="6" fill="#fbfaf6" stroke="#555"/>`;
    const yMax = Yb - C.hMax * K;
    s += `<line x1="${X0 - 10}" y1="${yMax}" x2="${X0 + W + 10}" y2="${yMax}" stroke="var(--rouge)" stroke-width="2" stroke-dasharray="7 5"/>
      <text x="${X0 + W + 16}" y="${yMax + 5}" font-size="14" font-weight="800" fill="var(--rouge)" ${TXT}>${virg(C.hMax)} m max</text>`;
    return { X, svg: `<svg viewBox="0 0 460 ${H.toFixed(0)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${ech(`Palette ${pl.client}, vue de face`)}">${s}</svg>` };
  }
  function htmlPalettes(e) {
    return `<div class="pvc-palettes">${V.palettes.map((pl) => {
      const { X, svg } = svgPalette(e, pl);
      const cible = ui.main != null && (e.terminal || {}).fin;
      return `<figure class="pe-palmini pvc-pal${cible ? ' pvc-cible' : ''}" data-pvc-pal="${pl.p}"${cible ? ` tabindex="0" role="button" data-pe-cle="pal:${pl.p}" aria-label="${ech(`Poser sur la palette ${pl.client}`)}"` : ''}>
        <div class="pe-palcmd-tete"><b>Palette ${ech(pl.client)}</b>
          <span class="pe-petit"><b data-pe-kg>${X.poids.toLocaleString('fr-FR')} kg</b> / ${M.C.kgMax} kg · <b data-pe-h>${virg(X.hauteur)} m</b> / ${virg(M.C.hMax)} m</span></div>
        <div class="pe-palsvg">${svg}</div></figure>`;
    }).join('')}</div>`;
  }

  // LA VUE DE PRÈS d'un emplacement de picking : les cartons (la pile de la fiche de Smoby) et l'étiquette de la lisse, avec le code de
  // contrôle en gros. Une réserve, un emplacement vide : rien à prendre ici.
  function htmlPres(e, a) {
    const st = (e.vides || []).includes(a) ? null : M.stock[a];
    const d = decoupe(a);
    if (!st) return `<div class="pvc-pres" data-pvc-pres="${ech(a)}"><div class="pvc-vide">Emplacement vide.</div>${htmlLisse(a, null)}</div>`;
    const p = M.produits[st.produit], q = pickDe(e, a);
    const cartons = q > 0 ? O.pile(p.couches, q - M.plein(a), `Les cartons de ${a}`) : '<div class="pvc-vide">Plus aucun carton.</div>';
    return `<div class="pvc-pres" data-pvc-pres="${ech(a)}"><div class="pvc-cartons">${cartons}</div>${htmlLisse(a, p, d)}</div>`;
  }
  function htmlLisse(a, p) {
    const code = P.codes[a];
    return `<div class="pvc-lisse" role="img" aria-label="${ech(`Étiquette de la lisse : ${a}${p ? `, ${p.nom}` : ''}${code ? `, code de contrôle ${code}` : ''}`)}">
      <span class="pe-mono pvc-adr">${ech(a)}</span><span class="pvc-des">${p ? ech(p.nom) : '—'}</span>
      <span class="pvc-code"><small>code</small><b class="pe-mono" data-pvc-code>${code ? ech(code) : '—'}</b></span></div>`;
  }

  /* --------------------------------------------------------- le montage */
  function htmlMontage(e, t, jal) {
    const T = e.terminal, fin = !!T.fin, cote = e.cote || [];
    const bouton = (attrs, cle, lib, off, cls = 'btn') => `<button type="button" class="${cls}" ${attrs} data-pe-cle="${cle}" ${off ? 'disabled' : ''}>${lib}</button>`;
    let h = '<section class="pk-montage pvc-montage" data-pvc-montage aria-label="La palette">';
    if (!fin && T.phase === 'pose') {
      const l = ligneEnCours(e), n = T.reponses[l.id];
      h += `<div class="pk-question" data-pvc-question>Où poses-tu ${ech(quoi(l.produit, n))} ?</div><div class="pk-poser">${
        V.palettes.map((pl) => bouton(`data-pvc-poser="${pl.p}"`, `poser:${pl.p}`, V.palettes.length > 1 ? `Palette ${ech(pl.client)}` : 'Palette')).join('')}${
        bouton('data-pvc-poser="cote"', 'poser:cote', 'À côté, je les pose après', false, 'btn pk-acote')}</div>`;
    } else if (!fin) h += '<div class="pe-petit">Suis le terminal : va à l’emplacement, lis le code sur l’étiquette, prends, puis pose.</div>';
    if (cote.length) {
      h += `<div class="pk-cote" data-pvc-cote><b>À côté :</b> ${cote.map((g, k) => `<button type="button" class="pk-objet${ui.main === k ? ' pk-main' : ''}" data-pvc-objet="${k}"
        data-pe-cle="objet:${k}" aria-pressed="${ui.main === k}" ${fin ? '' : 'disabled'}>${ech(court(g.k))} × ${g.q}</button>`).join('')}
        <div class="pe-petit">${fin ? (ui.main != null ? `Pose-le sur la palette.</div><div class="pk-poser">${V.palettes.map((pl) => bouton(`data-pvc-vers="${pl.p}"`, `vers:${pl.p}`, V.palettes.length > 1 ? `Sur la palette ${ech(pl.client)}` : 'Sur la palette')).join('')}` : 'Clique un groupe de cartons, puis la palette.') : 'Tu les poseras quand la commande sera terminée.'}</div></div>`;
    }
    if (fin) {
      h += `<div class="pk-reposer">${V.palettes.map((pl) => bouton(`data-pvc-reposer="${pl.p}"`, `reposer:${pl.p}`, `↶ Reposer le dernier${V.palettes.length > 1 ? ` (${ech(pl.client)})` : ''}`, !(e.palettes[pl.p] || []).length)).join('')}</div>`;
      h += `<div class="pe-finir pk-finir"><b>Avant le quai</b>${V.palettes.map((pl) => `<div class="pk-fin-pal" data-pvc-fin="${pl.p}">${V.palettes.length > 1 ? `<b>Palette ${ech(pl.client)}</b>` : ''}
          <label>Film étirable : <select data-pvc-film="${pl.p}" data-pe-cle="film:${pl.p}"><option value="">— tours —</option>${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${String((e.film || [])[pl.p]) === String(n) ? 'selected' : ''}>${n}</option>`).join('')}</select> tours</label>
          <div class="pe-etq">Étiquette « ${ech(pl.etiquette)} » sur : ${ETIQ_COTES.map(([k, lib]) => `<label><input type="checkbox" data-pvc-etiq="${pl.p}:${k}" data-pe-cle="etiq:${pl.p}:${k}" ${((e.etiq || [])[pl.p] || {})[k] ? 'checked' : ''}> ${lib}</label>`).join('')}</div></div>`).join('')}
        <div class="pe-boutons">${bouton('data-pvc="verifier"', 'b:verifier', 'Vérifier ma préparation', cote.length > 0, 'btn btn-p')}</div></div>`;
      if (e.verifie) {
        const nonJuge = jal.some((j) => j.nonJuge);
        h += `<div class="pm-bilan pk-bilan" data-pvc-bilan><b>Ma préparation</b>${jal.map((j) => `<div class="${j.nonJuge ? 'pe-petit' : j.ok ? 'pe-ok' : 'pe-ko'}" data-pvc-jalon="${ech(j.id)}" data-ok="${j.ok}">${
          j.nonJuge ? '— non jugé' : j.ok ? '✓' : '✗'} ${ech(j.lib)}</div>`).join('')}
          <small>${nonJuge ? 'La palette n’est jugée que si toutes les lignes sont justes.' : ''}</small></div>`;
      }
    }
    return `${h}</section>`;
  }

  /* --------------------------------------------------------- les gestes */
  function poserLigne(e, dest, sig) {
    const T = e.terminal;
    if (T.fin || T.phase !== 'pose') return null;
    const l = ligneEnCours(e), n = T.reponses[l.id] || 0, g = { a: l.a, k: l.produit, q: n, ligne: l.id };
    if (dest === 'cote') e.cote = [...(e.cote || []), g];
    else e.palettes[dest] = [...(e.palettes[dest] || []), g];
    e.verifie = false; noter(e);
    const r = TERM.poser(T);
    sig(dest === 'cote' ? 'poser:cote' : 'poser:palette');
    if (dest !== 'cote') sig(`pose:${M.classe(l.produit)}`);
    sig(`ligne:${l.id}`);
    if (r.evt === 'fin') sig('fin');
    dire('');
    return r.evt;
  }
  function poserGroupe(e, p) {
    const cote = e.cote || [];
    if (ui.main == null || !cote[ui.main] || !(e.terminal || {}).fin) return false;
    const [g] = cote.splice(ui.main, 1);
    e.palettes[p] = [...(e.palettes[p] || []), g];
    e.cote = cote; e.verifie = false; ui.main = null;
    return g;
  }
  function reposer(e, p) {
    const L = e.palettes[p] || [];
    if (!L.length || !(e.terminal || {}).fin) return;
    e.palettes[p] = L.slice(0, -1);
    e.cote = [...(e.cote || []), L[L.length - 1]]; e.verifie = false; ui.main = null;
  }
  // Une quantité acceptée par le terminal : les cartons quittent le picking (le terminal attend la pose).
  function preleve(e, l) {
    const n = e.terminal.reponses[l.id] || 0;
    if (n > 0) e.pick = Object.assign({}, e.pick, { [l.a]: Math.max(0, pickDe(e, l.a) - n) });
  }

  // L'aide de l'accompagné : la travée de la ligne en cours, cernée sur le plan (jamais l'emplacement, jamais le code).
  function dessusPlan(e) {
    if (V.montrer !== 'travee' || e.terminal.fin) return '';
    const l = ligneEnCours(e);
    if (!l) return '';
    const d = decoupe(l.a), g = G.racks[d.c];
    return `<rect x="${g.x - 4}" y="${G.yTrav(d.t) + 1}" width="${88}" height="${98}" rx="4" fill="none" stroke="var(--ardoise)" stroke-width="4" stroke-dasharray="9 5" pointer-events="none" data-pvc-montre="${d.c}-T${pad2(d.t)}"/>`;
  }

  return {
    signaux: [...M.vocal.lignes.flatMap((l) => [`code:${l.id}`, `ligne:${l.id}`]), ...Object.keys(P.codes || {}).map((a) => `ouvrir:${a}`),
      'poser:palette', 'poser:cote', 'pose:lourd', 'pose:normal', 'pose:fragile', 'fin', 'film', 'etiquettes', 'verifier'].map(geste),
    id: P.id,
    nav: { libelle: P.libelle || 'Préparer la commande' },
    etatNeuf: etatVocalNeuf,
    calculette: () => false,
    lire: () => ({ trav: ui.trav, pres: ui.pres, main: ui.main, msg: ui.msg }),
    html(e, api) {
      completer(e);
      const t = tempsDe(api), estProf = !!(api && api.estProf), T = e.terminal;
      const per = P.personnage || {}, txt = typeof per.texte === 'string' ? per.texte : (per.texte || {})[t] || '';
      const RG = P.regles, C = M.C;
      const regles = t !== 'evaluation' && RG ? `<details class="pe-regles" data-pe-regles ${ui.regles || RG.ouvertes ? 'open' : ''}><summary data-pe-cle="b:regles">${ech(RG.titre || 'Les règles')} ▾</summary>
        <div class="pe-regles-corps"><b>${ech(RG.entete || 'Les règles de la préparation')}</b><ol>${(RG.lignes || []).map((x) => `<li>${x}</li>`).join('')}</ol>
        ${RG.encadre ? `<div class="pe-encadre">${RG.encadre}</div>` : ''}</div></details>` : '';
      const R = { t, g: t === 'guidage', entr: t === 'entrainement', eval: false, fige: false, aideCharge: false, regles: false, choisi: ui.pres };
      const jal = jalonsVocal(M, e);
      let espace;
      // Le terminal fini, la palette prend toute la place (les cartons à côté s'y posent, « Reposer » se voit) ; la travée reste ouvrable.
      if (!ui.trav && T.fin) espace = htmlPalettes(e);
      else if (!ui.trav) espace = `<div class="pe-plan">${O.htmlPlan(e, R, { dessus: dessusPlan(e) })}</div>`;
      else {
        const fil = `<div class="pe-entete"><div class="pe-fil">Plan › <b>Travée</b> <span class="pe-mono">${ech(ui.trav)}</span>${ui.pres ? ` › <b>De près</b> <span class="pe-mono">${ech(ui.pres)}</span>` : ''}</div>
          <div class="pe-msg-vue"><div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pe-msg>${ui.msg}</div></div>
          <button type="button" class="btn btn-p pe-retour" data-pvc="retour" data-pe-cle="b:retour">${ui.pres ? '← Retour à la travée' : '← Retour au plan'}</button></div>`;
        const droite = ui.pres ? `<div class="pe-vue">${htmlPres(e, ui.pres)}</div>` : `<div class="pe-face">${O.htmlFace(e, R)}</div>`;
        espace = `${fil}<div class="pe-partage">${htmlPalettes(e)}<div class="pe-partage-d">${droite}</div></div>`;
      }
      const bilan = T.fin ? htmlBilanTerminal(bilanTerminal(T, V.lignes), V.phraseBilan) : '';
      const prof = !estProf ? '' : `<details class="pe-prof" data-pvc-attendus><summary>Côté enseignant : ce que le terminal attend</summary>${attendusVocal(M).map((x) =>
        `<div><b class="pe-mono">${ech(x.emplacement)}</b> (code ${ech(x.code)}) : prendre ${x.prends} ${ech(court(x.produit))}</div>`).join('')}</details>`;
      return `<div class="pe pe-prep pvc" data-entrepot="${ech(P.id)}" data-pe-mode="preparation" data-pvc-vocal data-pe-temps="${t}" data-pe-ouverte="${!!ui.trav}">
        <div class="pe-bandeau pvc-bandeau"><div class="pe-perso"><b>${ech([per.nom, per.role].filter(Boolean).join(', '))}${per.date ? ` · ${ech(per.date)}` : ''}</b>${txt}</div>
          <div class="pvc-cmd"><span class="pe-bon">Commande <b class="pe-mono">${ech(C.num || '')}</b></span> <b>${ech(C.client || '')}</b>
            <span class="pe-petit">${ech(C.quai || '')}${C.heure ? ` · départ ${ech(C.heure)}` : ''} · palette ${virg(M.C.hMax)} m et ${M.C.kgMax} kg max</span>
            <span class="pe-petit pvc-survol" data-pe-adresse aria-live="off"></span></div>
          <div class="pe-act">${regles}</div></div>
        <div class="pe-jeu pvc-jeu"><aside class="pe-cote pvc-cote">${TERM.html(T, { estProf, son: !!(api && api.sonTerminal && api.sonTerminal()) })}
            ${htmlMontage(e, t, jal)}${!ui.trav ? `<div class="pe-msg ${ui.msgType ? `pe-${ui.msgType}` : ''}" data-pe-msg-plan>${ui.msg}</div>` : ''}${bilan}${prof}</aside>
          <section class="pe-espace">${espace}</section></div></div>`;
    },
    brancher(z, e, api) {
      const racine = z.querySelector('.pvc');
      if (!racine) return;
      completer(e);
      const redessiner = () => api.redessiner();
      const sauver = () => api.sauver();
      const sig = (n) => { if (api.signal) api.signal(geste(n)); };
      const activer = (el, fn) => {
        el.addEventListener('click', fn);
        if (el.tagName !== 'BUTTON') el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); } });
      };
      const fermer = () => {
        if (ui.pres) { ui.focus = `emp:${ui.pres}`; ui.pres = null; }
        else if (ui.trav) { ui.focus = `trav:${ui.trav}`; ui.trav = null; }
        else return false;
        dire(''); redessiner(); return true;
      };
      O.echap(racine, fermer);
      const espace = racine.querySelector('.pe-espace');
      const caler = () => {
        if (!espace.isConnected) { window.removeEventListener('resize', caler); return; }
        const haut = espace.getBoundingClientRect().top + window.scrollY;
        const entete = racine.querySelector('.pe-entete');
        const reste = window.innerHeight - haut - 22 - (entete ? entete.offsetHeight + 6 : 0);
        racine.style.setProperty('--pe-dispo', `${Math.max(entete ? 300 : 380, Math.round(reste))}px`);
        // La colonne du terminal tient dans l'écran et défile seule (1366 × 768, 1280 × 720).
        racine.style.setProperty('--pvc-cote', `${Math.max(380, Math.round(window.innerHeight - haut - 16))}px`);
      };
      caler();
      window.addEventListener('resize', caler);
      racine.addEventListener('focusin', (ev) => { const x = ev.target.closest && ev.target.closest('[data-pe-cle]'); if (x) ui.focus = x.dataset.peCle; });
      const det = racine.querySelector('[data-pe-regles]');
      if (det) det.addEventListener('toggle', () => { ui.regles = det.open; });
      racine.querySelectorAll('[data-pvc="retour"]').forEach((b) => activer(b, fermer));
      racine.querySelectorAll('[data-pe-trav]').forEach((g) => activer(g, () => {
        ui.trav = g.dataset.peTrav; ui.pres = null; ui.anim = true; dire(''); ui.focus = `emp:${ui.trav}-N1-E1`; redessiner();
      }));
      const barre = racine.querySelector('[data-pe-adresse]');
      racine.querySelectorAll('[data-pe-emp]').forEach((g) => {
        activer(g, () => {
          const a = g.dataset.peEmp, d = decoupe(a);
          if (d.n > 1) { dire(`<b>${ech(a)}</b> : c’est la <b>réserve</b>. Tu prends au niveau 1, au sol.`, 'non'); redessiner(); return; }
          ui.pres = a; ui.focus = 'b:retour'; dire('');
          if (!e.vus[a]) { e.vus[a] = Date.now(); noter(e); }
          sig(`ouvrir:${a}`); sauver(); redessiner();
        });
        const sur = () => { if (barre) barre.textContent = g.dataset.peEmp; };
        const hors = () => { if (barre) barre.textContent = ''; };
        g.addEventListener('mouseenter', sur); g.addEventListener('focus', sur);
        g.addEventListener('mouseleave', hors); g.addEventListener('blur', hors);
      });
      const tout = () => (api.redessinerTout ? api.redessinerTout() : redessiner());
      const fait = (cle) => { if (cle !== undefined) ui.focus = cle; sauver(); redessiner(); };
      racine.querySelectorAll('[data-pvc-poser]').forEach((b) => activer(b, () => {
        const d = b.dataset.pvcPoser;
        const evt = poserLigne(e, d === 'cote' ? 'cote' : +d, sig);
        ui.focus = evt === 'fin' ? ((e.cote || []).length ? 'objet:0' : 'film:0') : null;
        sauver();
        if (evt === 'fin') tout(); else redessiner();
      }));
      racine.querySelectorAll('[data-pvc-objet]').forEach((b) => activer(b, () => {
        const k = +b.dataset.pvcObjet;
        ui.main = ui.main === k ? null : k; ui.focus = ui.main == null ? `objet:${k}` : 'vers:0'; redessiner();
      }));
      const vers = (p) => {
        const g = poserGroupe(e, p);
        if (g) sig(`pose:${M.classe(g.k)}`);
        fait((e.cote || []).length ? 'objet:0' : 'film:0');
      };
      racine.querySelectorAll('[data-pvc-vers]').forEach((b) => activer(b, () => vers(+b.dataset.pvcVers)));
      racine.querySelectorAll('[data-pvc-pal][role="button"]').forEach((g) => activer(g, () => vers(+g.dataset.pvcPal)));
      racine.querySelectorAll('[data-pvc-reposer]').forEach((b) => activer(b, () => { reposer(e, +b.dataset.pvcReposer); fait(`reposer:${b.dataset.pvcReposer}`); }));
      racine.querySelectorAll('[data-pvc-film]').forEach((s) => s.addEventListener('change', () => {
        const p = +s.dataset.pvcFilm;
        e.film = V.palettes.map((pl) => (e.film || [])[pl.p] || ''); e.film[p] = s.value; e.verifie = false; sig('film'); fait(`film:${p}`);
      }));
      racine.querySelectorAll('[data-pvc-etiq]').forEach((c) => c.addEventListener('change', () => {
        const [p, k] = c.dataset.pvcEtiq.split(':');
        e.etiq = V.palettes.map((pl) => Object.assign({}, (e.etiq || [])[pl.p] || {}));
        e.etiq[+p][k] = c.checked; e.verifie = false; sig('etiquettes'); fait(`etiq:${p}:${k}`);
      }));
      racine.querySelectorAll('[data-pvc="verifier"]').forEach((b) => activer(b, () => {
        if ((e.cote || []).length || !e.terminal.fin) return;
        e.verifie = true; e.verifs = (e.verifs || 0) + 1; sig('verifier');
        ui.focus = 'b:verifier'; sauver(); tout();
        const bl = document.querySelector(`[data-entrepot="${CSS.escape(P.id)}"] [data-pvc-bilan]`);
        if (bl) bl.scrollIntoView({ block: 'nearest' });
      }));
      if (O.clavier() && ui.focus) {
        const el = racine.querySelector(`[data-pe-cle="${CSS.escape(ui.focus)}"]`);
        if (el) el.focus({ preventScroll: true });
      }
      TERM.brancher(racine, e.terminal, { sauver,
        redessiner: () => (e.terminal.fin ? tout() : redessiner()),
        signal: (evt, l) => {
          if (!l) return;
          noter(e);
          if (evt === 'code') sig(`code:${l.id}`);
          if (evt === 'pris') preleve(e, l);
          // Une ligne finie sans pose (un mot qui signale toute la ligne) : publiée comme une ligne posée.
          if ((evt === 'reponse' || evt === 'fin') && e.terminal.phase !== 'pose') sig(`ligne:${l.id}`);
          if (evt === 'fin') sig('fin');
        } });
    },
  };
}
