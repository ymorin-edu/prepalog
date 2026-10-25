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
// LOT 3 (25/10/2026), LES EXCEPTIONS : `abimes: { adresse: n }` → n cartons abîmés DESSINÉS devant la pile de près (coin enfoncé, ruban
// déchiré ; jamais écrits) ; pris d'abord ; « Abîmé : n » les laisse et le terminal ajoute la ligne de remplacement (`remplacements:
// { adresse: autre adresse du même produit }`) ; pris sans rien dire, ils partent sur la palette, dessinés abîmés. Un emplacement de picking
// sans de quoi servir la ligne (`picking.q` < quantité) est VIDE : le terminal refuse la quantité tant que rien n'est dit ; « Emplacement
// vide » → « Réserve demandée au cariste. », Kevin descend une palette de réserve (geste de Smoby) et la ligne est redite. Jalons (types) :
// `lignes` (les lignes normales, ligne-1…), `abime` (abime-dit, abime-remplacement), `vide` (vide-dit, vide-reprise), `rienAbime`.
// Gestes : `mot:<id>`, `abime` / `vide` (la ligne d'exception finie), `reserve` (Kevin a descendu la réserve).
//
// LOT 4 (25/10/2026), DEUX MAGASINS : `commande.destinataires: [{ client, etiquette, num }, …]` et `pour` sur chaque ligne. Le terminal dit
// « Pour Nîmes. Allée … » ; la pose propose une palette par magasin ; le terminal fini, « Contrôler mes palettes » montre chaque palette à
// côté de sa liste de colisage, et un groupe se déplace d'une palette à l'autre ; l'étiquette se choisit (magasin) avant les faces. Jalons :
// `grouper-1`, `grouper-2` (la palette porte tous les cartons de ses lignes et rien d'autre, état final), puis chaque critère par palette
// (`lourds-1`…), jugé seulement si la palette est groupée ; `etiquettes-p` demande l'étiquette de SON magasin. Gestes : `controle:ouvrir`,
// `controle:fermer`, `deplacer`. `terminal.cocher` (accompagné) : la liste de colisage se coche quand le compte y est.
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
  // Lot 3 : les EXCEPTIONS de la déclaration. `abimes: { adresse: n }` (n cartons abîmés devant, au picking) et `remplacements: { adresse:
  // autre adresse du même produit }` ; un emplacement de picking qui n'a pas de quoi servir sa ligne (`picking.q` < la quantité) est VIDE :
  // la ligne est `bloque` (le terminal refuse la quantité tant que rien n'est dit) et sa remplacement, à la MÊME adresse, la redit une fois
  // la réserve descendue par Kevin.
  const abimes = P.abimes || {}, remplacements = P.remplacements || {};
  // Lot 4 : DEUX MAGASINS (`commande.destinataires`, une palette chacun ; chaque ligne dit `pour` qui) : le terminal nomme le magasin à
  // chaque ligne (« Pour Nîmes. Allée … »), la pose propose une palette par magasin.
  const DEST = C.destinataires;
  if (DEST && (!Array.isArray(DEST) || DEST.length < 2 || DEST.some((d) => !d || !d.client))) err('commande.destinataires : au moins deux { client, etiquette, num }');
  const palettes = DEST ? DEST.map((d, p) => ({ p, client: d.client, etiquette: d.etiquette || d.client, num: d.num || '' }))
    : [{ p: 0, client: C.client || '', etiquette: C.etiquette || C.client || '' }];
  const pourDe = (l, i) => {
    if (!DEST) return 0;
    if (!Number.isInteger(l.pour) || l.pour < 0 || l.pour >= DEST.length) err(`ligne ${i + 1} : \`pour\` (le magasin, de 0 à ${DEST.length - 1}) manque`);
    return l.pour;
  };
  const pourQui = (p) => (DEST ? `Pour ${palettes[p].etiquette}. ` : '');
  const lignes = M.lignes.map((l, i) => {
    const pour = pourDe(l, i);
    const L = { id: `L${i + 1}`, a: l.a, produit: l.produit, q: l.q, pour, lieu: `${pourQui(pour)}${lieu(l.a)}`, code: codeDe(l.a, `ligne ${i + 1}`),
      prends: l.q, question: `${voix(l.produit)}. Prends ${l.q}.`, pose };
    const ab = abimes[l.a] || 0, vide = M.pick0(l.a) < l.q;
    if (ab && vide) err(`ligne ${i + 1} : ${l.a} ne peut pas être à la fois vide et abîmé`);
    const prendsN = (n) => `${voix(l.produit)}. Prends ${n}.`;
    if (ab) {
      if (!(ab > 0 && ab < l.q)) err(`ligne ${i + 1} : ${ab} carton(s) abîmé(s) en ${l.a}, il en faut moins que la quantité (${l.q})`);
      const r = remplacements[l.a];
      if (!r || !M.stock[r] || M.stock[r].produit !== l.produit || decoupe(r).n !== 1) err(`ligne ${i + 1} : il faut une adresse de remplacement au picking, du même produit (\`remplacements['${l.a}']\`)`);
      Object.assign(L, { attendu: { mot: 'abime', n: ab },
        remplacement: { a: r, produit: l.produit, pour, lieu: `${pourQui(pour)}${lieu(r)}`, code: codeDe(r, `ligne ${i + 1}, remplacement`), question: prendsN, pose } });
    }
    if (vide) Object.assign(L, { attendu: { mot: 'vide' }, bloque: true,
      remplacement: { a: l.a, produit: l.produit, pour, lieu: `Kevin a descendu la réserve. ${pourQui(pour)}${lieu(l.a)}`, code: L.code, question: prendsN, pose } });
    return L;
  });
  const lAb = lignes.filter((l) => l.attendu && l.attendu.mot === 'abime'), lVi = lignes.filter((l) => l.attendu && l.attendu.mot === 'vide');
  const types = (P.jalons || [{ type: 'lignes' }, ...(lAb.length ? [{ type: 'abime' }] : []), ...(lVi.length ? [{ type: 'vide' }] : []),
    ...(DEST ? [{ type: 'grouper' }] : []), ...CRITERES.map((t) => ({ type: t })), ...(lAb.length ? [{ type: 'rienAbime' }] : [])]).map((j) => j.type);
  // Deux palettes : `grouper` (chaque palette ne porte que ses lignes) et les critères, un jalon par palette (`lourds-1`, `lourds-2`…).
  const parPalette = (id, lib, o) => (DEST ? palettes.map((pl) => Object.assign({ id: `${id}-${pl.p + 1}`, lib: `${lib} (${pl.etiquette})`, p: pl.p }, o))
    : [Object.assign({ id, lib, p: 0 }, o)]);
  const jalons = [];
  const num = (l) => lignes.indexOf(l) + 1, suf = (k) => (k ? `-${k + 1}` : '');
  // Les ids ne dépendent pas de la graine (contrôle de `etapesEntrepot`) : les lignes NORMALES sont numérotées entre elles (ligne-1…),
  // les exceptions par leur rang (abime-dit, abime-dit-2…).
  types.forEach((t) => {
    if (t === 'lignes') lignes.filter((l) => !l.attendu).forEach((l, k) => jalons.push({ id: `ligne-${k + 1}`, ligne: l.id, prends: l.q, lib: `Ligne ${num(l)} : ${court(l.produit)}` }));
    else if (t === 'abime') {
      if (!lAb.length) err('jalon « abime » : aucune ligne n’a de carton abîmé (`abimes`)');
      lAb.forEach((l, k) => jalons.push(
        { id: `abime-dit${suf(k)}`, cas: 'abimeDit', ligne: l.id, l, lib: `Ligne ${num(l)} : carton abîmé signalé` },
        { id: `abime-remplacement${suf(k)}`, cas: 'abimeRempl', ligne: l.id, l, lib: `Ligne ${num(l)} : ligne de remplacement prise` }));
    } else if (t === 'vide') {
      if (!lVi.length) err('jalon « vide » : aucun emplacement de la commande n’est vide');
      lVi.forEach((l, k) => jalons.push(
        { id: `vide-dit${suf(k)}`, cas: 'videDit', ligne: l.id, l, lib: `Ligne ${num(l)} : emplacement vide signalé` },
        { id: `vide-reprise${suf(k)}`, cas: 'videReprise', ligne: l.id, l, lib: `Ligne ${num(l)} : ligne reprise après la réserve` }));
    } else if (t === 'rienAbime') {
      if (!lAb.length) err('jalon « rienAbime » : aucune ligne n’a de carton abîmé (`abimes`)');
      jalons.push({ id: 'rienAbime', cas: 'rienAbime', lib: 'Aucun carton abîmé sur la palette' });
    } else if (t === 'grouper') {
      if (!DEST) err('jalon « grouper » : il faut deux magasins (`commande.destinataires`)');
      jalons.push(...parPalette('grouper', 'Seulement ses lignes', { cas: 'grouper' }));
    } else if (CRITERES.includes(t)) jalons.push(...parPalette(t, libs[t], { critere: t }));
    else err(`jalon de type « ${t} » : avec le terminal, les types sont lignes, abime, vide, rienAbime, grouper, ${CRITERES.join(', ')}`);
  });
  if (!jalons.some((j) => j.ligne)) err('jalons : il faut le type « lignes » (un jalon par ligne)');
  M.jalons = jalons.map((j) => Object.assign({ type: j.critere || j.cas || 'ligne' }, j));
  M.vocal = { lignes, mots, palettes, court, abimes, deux: !!DEST, cocher: !!D.cocher, titre: D.titre || 'Préparation', montrer: D.montrer || '',
    textes: { fin: D.fin || 'Commande terminée.', codeFaux: D.codeFaux || 'Code faux. Vérifie l’emplacement.',
      // « Emplacement vide » : le terminal appelle le cariste (lot 3) ; les autres mots, la phrase du terminal.
      comprisMot: (n, lib, combien) => (combien ? `Compris : ${n} ${lib.toLowerCase()}.` : `Compris : ${lib.toLowerCase()}. Réserve demandée au cariste.`) },
    phraseBilan: D.phraseBilan || '' };
}

/* ================================================================ le jugement */
export const etatVocalNeuf = () => ({ terminal: terminalNeuf(), pick: {}, vides: [], palettes: [[]], cote: [], film: [], etiq: [], vus: {},
  reserves: [], mainAbimes: 0, etiqMag: [], controles: 0, verifie: false, verifs: 0, premierGeste: null });
const completer = (e) => { Object.entries(etatVocalNeuf()).forEach(([k, v]) => { if (e[k] == null) e[k] = v; }); return e; };

// Une palette rejouée dans l'ordre de pose : couches (deux groupes de suite du même produit font une couche : la ligne et sa remplacement
// se complètent), hauteur, poids, règles.
export function calculPalette(M, liste, film, etiq) {
  const couches = [];
  (liste || []).forEach((g) => { const z = couches[couches.length - 1]; if (z && z.k === g.k) { z.q += g.q; z.abimes += g.abimes || 0; } else couches.push({ a: g.a, k: g.k, q: g.q, abimes: g.abimes || 0 }); });
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
  // Une ligne d'exception : le bon mot (et le bon nombre d'abîmés), puis le reste pris ; sa remplacement : la quantité attendue prise.
  const juges = {
    ligne: (j) => !EX[j.ligne] && R[j.ligne] === j.prends,
    abimeDit: (j) => { const x = EX[j.ligne]; return !!x && x.mot === 'abime' && x.n === j.l.attendu.n && R[j.ligne] === j.l.prends - j.l.attendu.n; },
    abimeRempl: (j) => R[`${j.ligne}-r`] === j.l.attendu.n,
    videDit: (j) => !!EX[j.ligne] && EX[j.ligne].mot === 'vide',
    videReprise: (j) => !!EX[j.ligne] && EX[j.ligne].mot === 'vide' && R[`${j.ligne}-r`] === j.l.prends,
  };
  M.jalons.filter((j) => j.ligne).forEach((j) => {
    const ok = fin && juges[j.cas || 'ligne'](j);
    L.push({ id: j.id, lib: j.lib, ok, etat: fin ? (ok ? 'ok' : 'ko') : undefined, ligne: j.ligne, pris: j.ligne in R ? R[j.ligne] : null, exception: EX[j.ligne] || null });
  });
  const lignesOk = L.every((l) => l.ok), rien = !(e.cote || []).length;
  // Chaque carton pris est sur une palette (une base incomplète ou bricolée ne gagne aucun critère).
  const poses = {};
  (e.palettes || []).forEach((pl) => (pl || []).forEach((g) => { poses[g.ligne] = (poses[g.ligne] || 0) + g.q; }));
  const complet = lignesDuTerminal(M.vocal.lignes, T).every((l) => (poses[l.id] || 0) === (R[l.id] || 0));
  const juge = fin && rien && lignesOk && complet;
  M.jalons.filter((j) => j.cas === 'rienAbime').forEach((j) => {
    L.push({ id: j.id, lib: j.lib, ok: fin && rien && complet && !(e.palettes || []).some((pl) => (pl || []).some((g) => g.abimes > 0)) });
  });
  const X = M.vocal.palettes.map((pl) => calculPalette(M, e.palettes[pl.p] || [], (e.film || [])[pl.p], (e.etiq || [])[pl.p]));
  if (!M.vocal.deux) {
    M.jalons.filter((j) => j.critere).forEach((j) => {
      const ok = juge && X[0].regles[j.critere];
      L.push({ id: j.id, lib: j.lib, ok, critere: j.critere, nonJuge: fin && rien && !lignesOk });
    });
  } else {
    // Deux palettes (lot 4) : jugées sur l'état FINAL (après « Contrôler mes palettes »). Une palette est groupée si elle porte tous les
    // cartons de ses lignes et rien d'autre (vide = faux) ; ses critères ne se jugent que si elle est groupée ; l'étiquette doit être celle
    // de SON magasin.
    const LT = lignesDuTerminal(M.vocal.lignes, T), pourDe = Object.fromEntries(LT.map((l) => [l.id, l.pour]));
    const groupee = M.vocal.palettes.map((pl) => {
      const G = e.palettes[pl.p] || [], ici = {};
      G.forEach((g) => { ici[g.ligne] = (ici[g.ligne] || 0) + g.q; });
      return fin && rien && G.length > 0 && G.every((g) => pourDe[g.ligne] === pl.p)
        && LT.filter((l) => l.pour === pl.p).every((l) => (ici[l.id] || 0) === (R[l.id] || 0));
    });
    M.jalons.filter((j) => j.cas === 'grouper').forEach((j) => L.push({ id: j.id, lib: j.lib, ok: groupee[j.p], p: j.p }));
    M.jalons.filter((j) => j.critere).forEach((j) => {
      const bonne = j.critere !== 'etiquettes' || String((e.etiqMag || [])[j.p]) === String(j.p);
      L.push({ id: j.id, lib: j.lib, ok: groupee[j.p] && X[j.p].regles[j.critere] && bonne, critere: j.critere, p: j.p, nonJuge: fin && rien && !groupee[j.p] });
    });
  }
  const rang = Object.fromEntries(M.jalons.map((j, i) => [j.id, i]));
  return L.sort((a, b) => rang[a.id] - rang[b.id]);
}

// Ce que le terminal attend, ligne à ligne (côté enseignant, page d'essai, tests) : JAMAIS montré à l'élève.
export function attendusVocal(M) {
  return M.vocal.lignes.map((l) => ({ ligne: l.id, emplacement: l.a, code: l.code, prends: l.q, produit: l.produit }));
}
export function detailVocal(M, e0, L) {
  const e = completer(Object.assign({}, e0)), T = e.terminal || terminalNeuf();
  return { jalons: L.map((l) => ({ jalon: l.lib, ok: l.ok, pris: l.pris, exception: l.exception })), codesFaux: T.codesFaux || {},
    vus: Object.keys(e.vus || {}), palettes: (e.palettes || []).map((p) => p.map((g) => `${g.k} ${g.q}`)), aCote: (e.cote || []).length,
    verifs: e.verifs || 0, premierGeste: e.premierGeste || null, ...(M.vocal.deux ? { etiqMag: e.etiqMag || [], controles: e.controles || 0 } : {}) };
}

// Un carton abîmé, dessiné : le coin enfoncé (un triangle sombre) et le ruban déchiré (un zigzag) — des traits, lisibles en noir et blanc.
function abime(x, y, w, h) {
  const c = Math.min(w, h) * 0.42, m = x + w / 2;
  return `<g data-pvc-abime pointer-events="none"><path d="M${(x + w - c).toFixed(1)} ${y.toFixed(1)} L${(x + w).toFixed(1)} ${y.toFixed(1)} L${(x + w).toFixed(1)} ${(y + c).toFixed(1)} Z" fill="#4a3216"/>
    <path d="M${(x + w - c).toFixed(1)} ${y.toFixed(1)} L${(x + w - c * 0.45).toFixed(1)} ${(y + c * 0.55).toFixed(1)} L${(x + w).toFixed(1)} ${(y + c).toFixed(1)}" fill="none" stroke="#1a1915" stroke-width="1.6"/>
    <path d="M${m.toFixed(1)} ${(y + 2).toFixed(1)} l-3 ${(h * 0.18).toFixed(1)} l6 ${(h * 0.14).toFixed(1)} l-5 ${(h * 0.16).toFixed(1)} l4 ${(h * 0.14).toFixed(1)}" fill="none" stroke="#1a1915" stroke-width="1.8"/></g>`;
}

/* ======================================================================= vue */
// `O` : ce que prête `creerEntrepot` — la géométrie du plan (`G`), le plan et la travée de face (`htmlPlan`, `htmlFace`, qui lisent
// `e.pick` et `e.vides`), l'état d'écran partagé (`ui` : `trav`, `anim`, `focus`, `msg`), la pile de cartons dessinée, Échap, le clavier.
export function creerVocal(P, M, opts, O) {
  if (opts.copie) throw new Error(`entrepot ${P.id} : la préparation vocale n'a pas encore d'évaluation (chantier E-8, lot 5)`);
  const ui = O.ui, G = O.G, V = M.vocal;
  Object.assign(ui, { pres: null, main: null, regles: false, controle: false, dep: null });
  const geste = (n) => `entrepot:${P.id}:${n}`;
  const TERM = creerTerminal({ lignes: V.lignes, textes: V.textes, titre: V.titre, mots: V.mots });
  const tempsDe = (api) => P.temps || (api && api.temps) || 'guidage';
  const pickDe = (e, a) => (a in (e.pick || {}) ? e.pick[a] : M.pick0(a));
  const court = V.court;
  const ligneEnCours = (e) => lignesDuTerminal(V.lignes, e.terminal)[e.terminal.i] || null;
  // Les cartons abîmés encore devant la pile d'une adresse : ceux de la déclaration, moins ceux déjà pris (sur une palette ou à côté, ou en
  // main). « Abîmé : n » les laisse au picking, devant : ils se voient toujours, l'élève prend les autres.
  const abimesDevant = (e, a) => {
    const pris = [...(e.palettes || []).flat(), ...(e.cote || [])].filter((g) => g && g.a === a).reduce((t, g) => t + (g.abimes || 0), 0);
    return Math.max(0, (V.abimes[a] || 0) - pris - (e.mainAbimes && e.mainA === a ? e.mainAbimes : 0));
  };
  const laisses = (e, a) => {
    const EX = (e.terminal || {}).exceptions || {};
    return V.lignes.filter((l) => l.a === a && EX[l.id] && EX[l.id].mot === 'abime').reduce((t, l) => t + EX[l.id].n, 0);
  };
  // « Emplacement vide » (ou tout mot) sur une ligne `bloque` : Kevin descend une palette de réserve du même produit (le geste de Smoby,
  // ENT-5.6 : la réserve libère son emplacement, le picking reçoit une palette pleine), et le terminal redit la ligne.
  function descendre(e, l, sig) {
    if ((e.reserves || []).some((x) => x.a === l.a)) return;
    const r = Object.keys(M.stock).find((x) => decoupe(x).n > 1 && M.stock[x].produit === l.produit && !(e.vides || []).includes(x));
    if (!r) return;
    e.vides = [...(e.vides || []), r];
    e.pick = Object.assign({}, e.pick, { [l.a]: pickDe(e, l.a) + M.plein(l.a) });
    e.reserves = [...(e.reserves || []), { a: l.a, r, h: Date.now() }];
    dire(`Kevin, le cariste, a descendu la palette de réserve <b>${ech(r)}</b> au picking <b>${ech(l.a)}</b>.`, 'ok');
    sig('reserve');
  }
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
        for (let j = 0; j < dans; j++) {
          const x = X0 + j * bw + 1, yy = y - bh * (k + 1) + 1;
          s += `<rect x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${(bh - 2).toFixed(1)}" fill="${cl === 'fragile' ? '#f2dcb8' : cl === 'lourd' ? '#b07c40' : '#d4a46a'}" stroke="#6e4a22" stroke-width="1.2"/>`;
          // Les cartons abîmés pris (lot 3) : les premiers de la couche du bas, dessinés abîmés (jamais écrits).
          if (k === 0 && j < f.abimes) s += abime(x, yy, bw - 2, bh - 2);
        }
      }
      const top = y - bh * n, ym = (y + top) / 2;
      if (cl === 'fragile') s += `<text x="${X0 + W / 2}" y="${ym + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#9d2727" ${TXT}>FRAGILE</text>`;
      s += `<line x1="${X0 + W + 2}" y1="${ym}" x2="${X0 + W + 12}" y2="${ym}" stroke="var(--encre-douce)"/>
        <text x="${X0 + W + 16}" y="${ym + 5}" font-size="15" font-weight="700" fill="var(--encre)" ${TXT}>${i + 1}. ${ech(court(f.k))} × ${f.q} <tspan font-weight="400" fill="var(--encre-douce)">(${Math.round(f.q * c.kg)} kg${cl === 'lourd' ? ', lourd' : cl === 'fragile' ? ', fragile' : ''})</tspan></text>`;
      y = top;
    });
    const et = (e.etiq || [])[pl.p] || {};
    // Deux magasins : l'étiquette est celle que l'élève a choisie (elle peut être celle de l'autre magasin).
    const mag = (e.etiqMag || [])[pl.p], texteEtq = !V.deux ? pl.etiquette : mag !== '' && mag != null && V.palettes[+mag] ? V.palettes[+mag].etiquette : '';
    if ((e.film || [])[pl.p] && X.couches.length) s += `<rect x="${X0 - 3}" y="${y - 2}" width="${W + 6}" height="${Yb - hp - y + 10}" fill="rgba(150,190,230,.22)" stroke="rgba(120,160,210,.8)" stroke-width="1.5" data-pvc-filme/>`;
    if (et.avant && X.couches.length) s += `<rect x="${X0 + W - 70}" y="${(y + Yb - hp) / 2 - 14}" width="62" height="28" fill="#fbfaf6" stroke="#555"/><text x="${X0 + W - 39}" y="${(y + Yb - hp) / 2 + 4}" text-anchor="middle" font-size="9" font-weight="800" fill="#1a1915" ${TXT}>${ech(texteEtq)}</text>`;
    if (et.dessus && X.couches.length) s += `<rect x="${X0 + W / 2 - 22}" y="${y - 6}" width="44" height="6" fill="#fbfaf6" stroke="#555"/>`;
    const yMax = Yb - C.hMax * K;
    s += `<line x1="${X0 - 10}" y1="${yMax}" x2="${X0 + W + 10}" y2="${yMax}" stroke="var(--rouge)" stroke-width="2" stroke-dasharray="7 5"/>
      <text x="${X0 + W + 16}" y="${yMax + 5}" font-size="14" font-weight="800" fill="var(--rouge)" ${TXT}>${virg(C.hMax)} m max</text>`;
    return { X, svg: `<svg viewBox="0 0 460 ${H.toFixed(0)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${ech(`Palette ${pl.client}, vue de face`)}">${s}</svg>` };
  }
  function htmlPalettes(e) {
    return `<div class="pvc-palettes${V.deux ? ' pvc-deux' : ''}">${V.palettes.map((pl) => {
      const { X, svg } = svgPalette(e, pl);
      const cible = ui.main != null && (e.terminal || {}).fin;
      return `<figure class="pe-palmini pvc-pal${cible ? ' pvc-cible' : ''}" data-pvc-pal="${pl.p}"${cible ? ` tabindex="0" role="button" data-pe-cle="pal:${pl.p}" aria-label="${ech(`Poser sur la palette ${pl.client}`)}"` : ''}>
        <div class="pe-palcmd-tete"><b>Palette ${ech(V.deux ? pl.etiquette : pl.client)}</b>${V.deux && pl.num ? ` <span class="pe-petit">commande ${ech(pl.num)}</span>` : ''}
          <span class="pe-petit"><b data-pe-kg>${X.poids.toLocaleString('fr-FR')} kg</b> / ${M.C.kgMax} kg · <b data-pe-h>${virg(X.hauteur)} m</b> / ${virg(M.C.hMax)} m</span></div>
        <div class="pe-palsvg">${svg}</div></figure>`;
    }).join('')}</div>`;
  }

  // « CONTRÔLER MES PALETTES » (lot 4, deux magasins) : pour chaque palette, la LISTE DE COLISAGE (ce que le système attend pour ce magasin,
  // par produit) à côté du dessin ; les groupes posés se déplacent d'une palette à l'autre (clic sur le groupe, puis sur l'autre palette).
  // Le système ne dit pas où est l'erreur ; l'accompagné (`terminal.cocher`) voit chaque ligne se cocher quand le compte y est.
  function htmlControle(e) {
    return `<div class="pvc-controle" data-pvc-controle>${V.palettes.map((pl) => {
      const { X, svg } = svgPalette(e, pl), G = e.palettes[pl.p] || [];
      const attendu = {};
      M.lignes.forEach((l) => { if (l.pour === pl.p) attendu[l.produit] = (attendu[l.produit] || 0) + l.q; });
      const ici = {};
      G.forEach((g) => { ici[g.k] = (ici[g.k] || 0) + g.q; });
      const cible = ui.dep && ui.dep.p !== pl.p;
      const liste = Object.entries(attendu).map(([k, q]) => `<li data-pvc-colis="${ech(k)}">${V.cocher && ici[k] === q ? '<b class="pvc-coche" aria-label="présent">✓</b> ' : ''}${ech(M.produits[k].nom)} <b>× ${q}</b></li>`).join('');
      const groupes = G.map((g, k) => `<button type="button" class="pk-objet${ui.dep && ui.dep.p === pl.p && ui.dep.k === k ? ' pk-main' : ''}" data-pvc-groupe="${pl.p}:${k}" data-pe-cle="groupe:${pl.p}:${k}"
        aria-pressed="${!!(ui.dep && ui.dep.p === pl.p && ui.dep.k === k)}">${ech(court(g.k))} × ${g.q}</button>`).join('') || '<span class="pe-petit">Rien.</span>';
      return `<section class="pvc-ctl-pal${cible ? ' pvc-cible' : ''}" data-pvc-ctl="${pl.p}"${cible ? ` tabindex="0" role="button" data-pe-cle="ctl:${pl.p}" aria-label="${ech(`Mettre sur la palette ${pl.etiquette}`)}"` : ''}>
        <div class="pe-palcmd-tete"><b>Palette ${ech(pl.etiquette)}</b> <span class="pe-petit">commande ${ech(pl.num)} · ${X.poids.toLocaleString('fr-FR')} kg · ${virg(X.hauteur)} m</span></div>
        <div class="pvc-ctl-corps"><div class="pvc-colisage"><b>Liste de colisage</b><ul>${liste}</ul></div><div class="pvc-ctl-svg">${svg}</div></div>
        <div class="pk-cote pvc-ctl-groupes"><b>Sur la palette :</b> ${groupes}</div></section>`;
    }).join('')}</div>`;
  }

  // LA VUE DE PRÈS d'un emplacement de picking : les cartons (la pile de la fiche de Smoby) et l'étiquette de la lisse, avec le code de
  // contrôle en gros. Une réserve, un emplacement vide : rien à prendre ici.
  function htmlPres(e, a) {
    const st = (e.vides || []).includes(a) ? null : M.stock[a];
    const d = decoupe(a);
    if (!st) return `<div class="pvc-pres" data-pvc-pres="${ech(a)}"><div class="pvc-vide">Emplacement vide.</div>${htmlLisse(a, null)}</div>`;
    const p = M.produits[st.produit], q = pickDe(e, a), nAb = Math.min(q, abimesDevant(e, a));
    const cartons = q > 0 ? O.pile(p.couches, q - M.plein(a), `Les cartons de ${a}`) : '<div class="pvc-vide" data-pvc-vide>Emplacement vide.</div>';
    // Les cartons abîmés DEVANT la pile (lot 3) : dessinés, jamais écrits.
    const devant = nAb ? `<svg class="pvc-devant" viewBox="0 0 ${nAb * 74 + 6} 60" role="img" aria-label="${ech(`Devant la pile : ${nAb > 1 ? `${nAb} cartons` : 'un carton'}, coin enfoncé, ruban déchiré`)}">${
      Array.from({ length: nAb }, (_, i) => `<rect x="${i * 74 + 4}" y="6" width="68" height="50" fill="#d4a46a" stroke="#6e4a22" stroke-width="1.4"/>${abime(i * 74 + 4, 6, 68, 50)}`).join('')}</svg>` : '';
    return `<div class="pvc-pres" data-pvc-pres="${ech(a)}"><div class="pvc-cartons">${cartons}${devant}</div>${htmlLisse(a, p, d)}</div>`;
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
        V.palettes.map((pl) => bouton(`data-pvc-poser="${pl.p}"`, `poser:${pl.p}`, V.deux ? `Palette ${ech(pl.etiquette)}` : 'Palette')).join('')}${
        bouton('data-pvc-poser="cote"', 'poser:cote', 'À côté, je les pose après', false, 'btn pk-acote')}</div>`;
    } else if (!fin) h += '<div class="pe-petit">Suis le terminal : va à l’emplacement, lis le code sur l’étiquette, prends, puis pose.</div>';
    if (cote.length) {
      h += `<div class="pk-cote" data-pvc-cote><b>À côté :</b> ${cote.map((g, k) => `<button type="button" class="pk-objet${ui.main === k ? ' pk-main' : ''}" data-pvc-objet="${k}"
        data-pe-cle="objet:${k}" aria-pressed="${ui.main === k}" ${fin ? '' : 'disabled'}>${ech(court(g.k))} × ${g.q}</button>`).join('')}
        <div class="pe-petit">${fin ? (ui.main != null ? `Pose-le sur la palette.</div><div class="pk-poser">${V.palettes.map((pl) => bouton(`data-pvc-vers="${pl.p}"`, `vers:${pl.p}`, V.deux ? `Sur la palette ${ech(pl.etiquette)}` : 'Sur la palette')).join('')}` : 'Clique un groupe de cartons, puis la palette.') : 'Tu les poseras quand la commande sera terminée.'}</div></div>`;
    }
    if (fin) {
      if (V.deux) {
        // Deux magasins : contrôler (et déplacer) avant le film ; « Reposer le dernier » ne sert plus.
        h += `<div class="pk-poser">${bouton('data-pvc="controle"', 'b:controle', ui.controle ? 'Fermer le contrôle' : 'Contrôler mes palettes', cote.length > 0, ui.controle ? 'btn' : 'btn btn-p')}</div>`;
        if (ui.controle) h += `<div class="pe-petit" data-pvc-aide-ctl>${ui.dep ? 'Clique l’autre palette pour y mettre ce groupe.' : 'Compare chaque palette à sa liste. Un groupe mal placé : clique-le, puis l’autre palette.'}</div>`;
      } else h += `<div class="pk-reposer">${V.palettes.map((pl) => bouton(`data-pvc-reposer="${pl.p}"`, `reposer:${pl.p}`, '↶ Reposer le dernier', !(e.palettes[pl.p] || []).length)).join('')}</div>`;
      h += `<div class="pe-finir pk-finir"><b>Avant le quai</b>${V.palettes.map((pl) => `<div class="pk-fin-pal" data-pvc-fin="${pl.p}">${V.deux ? `<b>Palette ${ech(pl.etiquette)}</b>` : ''}
          <label>Film étirable : <select data-pvc-film="${pl.p}" data-pe-cle="film:${pl.p}"><option value="">— tours —</option>${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${String((e.film || [])[pl.p]) === String(n) ? 'selected' : ''}>${n}</option>`).join('')}</select> tours</label>
          <div class="pe-etq">${V.deux ? `<label>Étiquette du magasin : <select data-pvc-etiqmag="${pl.p}" data-pe-cle="etiqmag:${pl.p}"><option value="">— magasin —</option>${
            V.palettes.map((q) => `<option value="${q.p}" ${String((e.etiqMag || [])[pl.p]) === String(q.p) ? 'selected' : ''}>${ech(q.etiquette)}</option>`).join('')}</select></label> sur : ` : `Étiquette « ${ech(pl.etiquette)} » sur : `}${ETIQ_COTES.map(([k, lib]) => `<label><input type="checkbox" data-pvc-etiq="${pl.p}:${k}" data-pe-cle="etiq:${pl.p}:${k}" ${((e.etiq || [])[pl.p] || {})[k] ? 'checked' : ''}> ${lib}</label>`).join('')}</div></div>`).join('')}
        <div class="pe-boutons">${bouton('data-pvc="verifier"', 'b:verifier', V.deux ? 'Vérifier mes palettes' : 'Vérifier ma préparation', cote.length > 0, 'btn btn-p')}</div></div>`;
      if (e.verifie) {
        const nonJuge = jal.some((j) => j.nonJuge);
        h += `<div class="pm-bilan pk-bilan" data-pvc-bilan><b>Ma préparation</b>${jal.map((j) => `<div class="${j.nonJuge ? 'pe-petit' : j.ok ? 'pe-ok' : 'pe-ko'}" data-pvc-jalon="${ech(j.id)}" data-ok="${j.ok}">${
          j.nonJuge ? '— non jugé' : j.ok ? '✓' : '✗'} ${ech(j.lib)}</div>`).join('')}
          <small>${nonJuge ? (V.deux ? 'Une palette n’est jugée que si elle ne porte que ses lignes, toutes.' : 'La palette n’est jugée que si toutes les lignes sont justes.') : ''}</small></div>`;
      }
    }
    return `${h}</section>`;
  }

  /* --------------------------------------------------------- les gestes */
  function poserLigne(e, dest, sig) {
    const T = e.terminal;
    if (T.fin || T.phase !== 'pose') return null;
    const l = ligneEnCours(e), n = T.reponses[l.id] || 0, g = { a: l.a, k: l.produit, q: n, ligne: l.id };
    if (e.mainAbimes) g.abimes = e.mainAbimes;
    e.mainAbimes = 0; e.mainA = null;
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
  // Les abîmés sont devant : pris d'abord, sauf ceux que l'élève a signalés (laissés) — ils partent avec le groupe (`mainAbimes`).
  function preleve(e, l) {
    const n = e.terminal.reponses[l.id] || 0;
    if (n <= 0) return;
    const dispo = Math.max(0, abimesDevant(e, l.a) - laisses(e, l.a));
    e.mainAbimes = Math.min(n, dispo); e.mainA = l.a;
    e.pick = Object.assign({}, e.pick, { [l.a]: Math.max(0, pickDe(e, l.a) - n) });
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
      'poser:palette', 'poser:cote', 'pose:lourd', 'pose:normal', 'pose:fragile', 'fin', 'film', 'etiquettes', 'verifier',
      ...M.vocal.mots.map((m) => `mot:${m.id}`), 'abime', 'vide', 'reserve', 'controle:ouvrir', 'controle:fermer', 'deplacer'].map(geste),
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
      if (ui.controle && T.fin) espace = htmlControle(e);
      else if (!ui.trav && T.fin) espace = htmlPalettes(e);
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
      // Lot 4 : le contrôle des palettes, le déplacement d'un groupe, l'étiquette du magasin.
      racine.querySelectorAll('[data-pvc="controle"]').forEach((b) => activer(b, () => {
        ui.controle = !ui.controle; ui.dep = null; ui.trav = null; ui.pres = null;
        if (ui.controle) e.controles = (e.controles || 0) + 1;
        sig(ui.controle ? 'controle:ouvrir' : 'controle:fermer'); fait('b:controle');
      }));
      racine.querySelectorAll('[data-pvc-groupe]').forEach((b) => activer(b, () => {
        const [p, k] = b.dataset.pvcGroupe.split(':').map(Number);
        ui.dep = ui.dep && ui.dep.p === p && ui.dep.k === k ? null : { p, k }; ui.focus = `groupe:${p}:${k}`; redessiner();
      }));
      racine.querySelectorAll('[data-pvc-ctl][role="button"]').forEach((z) => activer(z, () => {
        const q = +z.dataset.pvcCtl;
        if (!ui.dep || ui.dep.p === q) return;
        const L = [...(e.palettes[ui.dep.p] || [])], [g] = L.splice(ui.dep.k, 1);
        if (!g) return;
        e.palettes[ui.dep.p] = L; e.palettes[q] = [...(e.palettes[q] || []), g]; e.verifie = false; ui.dep = null;
        sig('deplacer'); fait(`groupe:${q}:${e.palettes[q].length - 1}`);
      }));
      racine.querySelectorAll('[data-pvc-etiqmag]').forEach((c) => c.addEventListener('change', () => {
        const p = +c.dataset.pvcEtiqmag;
        e.etiqMag = V.palettes.map((pl) => ((e.etiqMag || [])[pl.p] == null ? '' : e.etiqMag[pl.p])); e.etiqMag[p] = c.value; e.verifie = false;
        sig('etiquettes'); fait(`etiqmag:${p}`);
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
          const ex = (e.terminal.exceptions || {})[l.id];
          // Un mot dit (« Abîmé », « Manquant », « Emplacement vide ») : `mot:<id>` (publié une fois, l'environnement ne garde que le premier).
          if (evt === 'mot' && e.terminal.mot) sig(`mot:${e.terminal.mot.id}`);
          else if (ex) sig(`mot:${ex.mot}`);
          if (ex && l.bloque) descendre(e, l, sig);
          // La ligne d'exception finie (quoi qu'on ait dit) : `abime` / `vide`, pour les questions au fil des séances.
          if (l.attendu && (evt === 'reponse' || evt === 'fin' || evt === 'pris')) sig(l.attendu.mot);
          // Une ligne finie sans pose (un mot qui signale toute la ligne) : publiée comme une ligne posée.
          if ((evt === 'reponse' || evt === 'fin') && e.terminal.phase !== 'pose') sig(`ligne:${l.id}`);
          if (evt === 'fin') sig('fin');
        } });
    },
  };
}
