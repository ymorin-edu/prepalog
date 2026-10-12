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
//     montage: {                                              // facultatif (lot 4) : les palettes client à monter
//       palettes: 2,                                          // 1 à 3 palettes client 1,20 × 0,80 de 6 cases
//       titre: 'Tes palettes client · 1,20 × 0,80',
//       etiquette: 'La Cabane à Malo — Villers-sur-Mer · …',  // le texte de l'étiquette d'expédition (affiché)
//       futsMax: 6, film: [3, 5],                             // les règles jugées (défauts : 6 cases, 3 à 5 tours)
//       reflexion: 'Le terminal t’a donné les lignes …',      // facultatif : « Pour réfléchir », réponse libre non notée
//       jalons: { casier, futs, film, etiquettes, palettes }, // facultatif : les noms des critères (sinon ceux de la maquette)
//     },
//     note: { sur: 20 },   // page d'essai SEULEMENT : dans une séance, elle remplace la note pondérée (voir FICHE-SEANCE.md)
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
//
// LE MONTAGE (chantier D-7, lot 4, 12/10/2026 ; brief ENT-6.7 §4 étape 2, §5 jalons 6 à 10, §7.3 et §7.4), si `montage` est
// déclaré : après chaque quantité acceptée, le terminal dit « Pose tes fûts. » et attend ; sous lui, « Où poses-tu les 2 fûts
// Pelforth Blonde 20 L ? » → Palette 1 · Palette 2 · « À côté, je le pose après » (une ligne = une seule destination). Le
// terminal fini, les objets « à côté » se posent (clic sur l'objet, puis sur une palette), on filme et on étiquette CHAQUE
// palette, puis « Vérifier ma préparation » (actif quand rien n'est à côté). « ↶ Reposer le dernier » (décision de Tristan du
// 12/10/2026), le terminal fini, remet à côté le dernier objet posé sur une palette ; les lignes du terminal ne se refont pas.
// RÈGLE DE POSE (brief, construite) : une palette a 6 cases ; un objet va sur la première case vide ; sinon un fût va sur un
// casier au sommet d'une case (la faute que voit le critère « casier »), à défaut sur un fût ; un casier va sur un fût, à
// défaut sur un casier ; entre plusieurs cases, la plus basse (puis la première). Rien n'est jamais refusé. La pile se
// recalcule depuis l'ordre de pose (`montage`), jamais rangée.
// Le fût cabossé : un tiroir donne d'abord ses fûts de devant, donc les cabossés ; un fût signalé « Abîmé » reste au tiroir
// (décision 50). Pris sans rien dire, il part sur la palette, cabossé (le dessin le montre).
// JALONS 6 à 10, à la suite des lignes : aucun fût sur un casier ; `futsMax` fûts au plus par palette ; film (`film`) et
// étiquettes (deux côtés opposés + le dessus) sur chaque palette utilisée ; toutes les palettes utilisées. Jugés à
// « Vérifier » seulement (un changement efface la vérification) et SEULEMENT si les jalons des lignes sont justes et que
// rien n'est à côté : une palette vide respecte « aucun fût sur un casier » (aucun jalon par inaction, décision 50).
// Pas d'évaluation (un entraînement).
//
// L'état, dans la base de l'élève (`db.entrepots[<id>]`, cloisonné par séance) :
//   { terminal: (voir `terminal.js`), vus: { 'A-T03': date de la première ouverture }, premierGeste,
//     palettes: [[{ ref, emp, ligne, abime? }, …], …] (l'ordre de pose), cote: [objets à côté], film: ['4', …],
//     etiq: [{ avant: true, … }, …], verifie, verifs, reflexion }
// `vus` est une trace pour l'enseignant, jamais notée. La travée ouverte et la place du préparateur ne sont pas gardées.
// Gestes publiés (questions au fil) : `entrepot:<id>:ouvrir:<emplacement>`, `entrepot:<id>:ligne:<ligne>` (une ligne finie,
// donc posée), `entrepot:<id>:fin`, et avec un montage `entrepot:<id>:verifier`.

import { ech } from '../texte.js';
import { projection, DEFS, compilerScene, dessinerDecor, traveePicking, volumeTravee, personne, TRAVEE, PLACES_TIROIR, HAUT_FUT,
  TEINTES_FUT, TEINTES_CAPSULE, paletteClient, hauteurObjet, CASES_PALETTE, PAL_EUR } from '../iso.js';
import { creerTerminal, terminalNeuf, bilanTerminal, htmlBilanTerminal, lignesDuTerminal } from './terminal.js';

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
  const montage = P.montage ? compilerMontage(P.montage, err) : null;
  const terminal = compilerTerminalPicking(P.terminal || err('il manque le terminal (le picking est guidé à la voix)'), { E, refs, montage }, err);
  if (montage) montage.jalons.forEach((j) => terminal.jalons.push(j));
  return { P, mode: 'picking', T, refs, E, terminal, montage, nomDe: (ref) => refs[ref].court || refs[ref].nom };
}

// Les côtés d'une palette qu'on étiquette, et ce qu'on lit à l'écran.
export const COTES_PALETTE = [['avant', 'avant'], ['arriere', 'arrière'], ['gauche', 'gauche'], ['droite', 'droite'], ['dessus', 'dessus']];
const ETIQ_JUSTES = ['arriere,avant,dessus', 'dessus,droite,gauche'];
const NOMBRES = ['', 'une', 'deux', 'trois'];

function compilerMontage(D, err) {
  const n = D.palettes == null ? 2 : D.palettes;
  if (!Number.isInteger(n) || n < 1 || n > 3) err('montage : `palettes` va de 1 à 3');
  const futsMax = D.futsMax == null ? CASES_PALETTE : D.futsMax;
  if (!Number.isInteger(futsMax) || futsMax < 1 || futsMax > CASES_PALETTE) err(`montage : \`futsMax\` va de 1 à ${CASES_PALETTE}`);
  const film = D.film || [3, 5];
  if (!Array.isArray(film) || film.length !== 2 || !film.every((t) => Number.isInteger(t) && t >= 1 && t <= 6) || film[0] > film[1]) {
    err('montage : `film` est [tours au moins, tours au plus], de 1 à 6');
  }
  const J = D.jalons || {};
  const libs = {
    casier: J.casier || 'Critère : aucun casier sous un fût',
    futs: J.futs || `Critère : ${futsMax} fûts au plus par palette client`,
    film: J.film || 'Critère : film étirable',
    etiquettes: J.etiquettes || 'Critère : étiquettes d’expédition',
    palettes: J.palettes || (n === 1 ? 'Critère : la palette, rien à côté' : `Critère : ${NOMBRES[n]} palettes`),
  };
  return { n, futsMax, film, titre: D.titre || `${n > 1 ? 'Tes palettes client' : 'Ta palette client'} · 1,20 × 0,80`,
    etiquette: D.etiquette ? String(D.etiquette) : '', reflexion: D.reflexion ? String(D.reflexion) : '',
    jalons: Object.entries(libs).map(([type, lib]) => ({ id: `montage-${type}`, montage: type, lib })) };
}

function compilerTerminalPicking(D, { E, refs, montage }, err) {
  if (!Array.isArray(D.lignes) || !D.lignes.length) err('terminal : `lignes` est une liste (au moins une ligne)');
  const mots = D.mots || MOTS_PREPARATION;
  if (!Array.isArray(mots)) err('terminal : `mots` est une liste');
  mots.forEach((m) => { if (!m || !m.id || !m.lib) err('terminal : un mot sans `id` ou sans `lib`'); });
  const ids = new Set();
  const unId = (id, ou) => { if (ids.has(id)) err(`${ou} : la ligne ${id} existe déjà (donner un \`id\`)`); ids.add(id); return id; };
  const lieu = (e) => `Côté ${e.cote}, travée ${t2(e.t)}, niveau 1.`;
  const dire = (e, n) => `${refs[e.ref].voix || refs[e.ref].nom}${e.lot ? `, lot ${e.lot}` : ''}. Prends ${n}.`;
  // Avec un montage, le terminal attend la pose : « Pose tes casiers. », « Pose ton fût. ».
  const pose = (e) => (montage ? (n) => `Pose ${n > 1 ? 'tes' : 'ton'} ${refs[e.ref].type === 'casier' ? 'casier' : 'fût'}${n > 1 ? 's' : ''}.` : undefined);
  const jalons = [];
  const lignes = D.lignes.map((l, k) => {
    const ou = `terminal, ligne n° ${k + 1}`;
    const e = E[l && l.emplacement] || err(`${ou} : emplacement inconnu (${l && l.emplacement})`);
    if ('pose' in l) err(`${ou} : une ligne ne déclare pas \`pose\`, la pose vient du \`montage\` (chantier D-7, lot 4)`);
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
    if (montage) ligne.pose = pose(e);
    jalons.push({ id: `ligne-${id}`, ligne: id, prends, attendu: a, lib: l.jalon || null, ref: e.ref });
    if (l.remplacement) {
      const r = l.remplacement, er = E[r.emplacement] || err(`${ou} : remplacement à un emplacement inconnu (${r.emplacement})`);
      if (er.ref !== e.ref) err(`${ou} : le remplacement est la même référence (${e.ref}), pas ${er.ref}`);
      if (er.n < prends) err(`${ou} : le remplacement ${er.adr} ne contient que ${er.n} (il en faut ${prends} si toute la ligne est signalée)`);
      const rid = unId(String(r.id || er.adr), `${ou}, remplacement`);
      ligne.remplacement = { id: rid, emplacement: er.adr, lieu: lieu(er), code: er.code, question: (n) => dire(er, n) };
      if (montage) ligne.remplacement.pose = pose(er);
      if (a) jalons.push({ id: `ligne-${rid}`, ligne: rid, remplace: id, n: a.n, lib: r.jalon || null, ref: er.ref });
    } else if (a) err(`${ou} : une exception attendue sans \`remplacement\` (le terminal ne donnerait pas la suite)`);
    return ligne;
  });
  jalons.forEach((j, k) => { if (!j.lib) j.lib = `Ligne ${k + 1} : ${refs[j.ref].court || refs[j.ref].nom}`; });
  return { titre: D.titre || '', lignes, mots, jalons, phraseBilan: D.phraseBilan || '',
    textes: { fin: D.fin || 'Préparation terminée.', codeFaux: D.codeFaux || 'Code faux. Vérifie l’emplacement.' } };
}

/* ================================================================ le jugement */
export const etatPickingNeuf = () => ({ terminal: terminalNeuf(), vus: {}, premierGeste: null,
  palettes: [], cote: [], film: [], etiq: [], verifie: false, verifs: 0, reflexion: '' });

// Les objets que pose une ligne de `n` pris à l'emplacement `emp` : le tiroir donne ses fûts de devant d'abord, donc les
// cabossés qui y restent, sauf ceux que l'élève a signalés « Abîmé » sur cette ligne (ils restent au tiroir).
export function objetsPris(M, e, l, n) {
  const E = M.E[l.emplacement], deja = tousPoses(e).filter((o) => o.emp === E.adr && o.abime).length;
  const x = ((e.terminal || {}).exceptions || {})[l.id], signales = x && x.mot === 'abime' ? x.n : 0;
  const ab = Math.max(0, Math.min(n, E.abimes - deja - signales));
  return Array.from({ length: n }, (_, k) => (k < ab ? { ref: E.ref, emp: E.adr, ligne: l.id, abime: 1 } : { ref: E.ref, emp: E.adr, ligne: l.id }));
}
const tousPoses = (e) => [...(e.palettes || []).flat(), ...(e.cote || [])];

// Une palette montée, rejouée dans l'ordre de pose (la règle de la tête) : [{ o, c (case), z (hauteur du pied), sous }].
export function empiler(M, liste) {
  const piles = Array.from({ length: CASES_PALETTE }, () => []), h = piles.map(() => 0);
  const type = (o) => (o ? M.refs[o.ref].type : null);
  return (liste || []).map((o) => {
    let c = piles.findIndex((p) => !p.length);
    if (c < 0) {
      const sommet = (k) => type(piles[k][piles[k].length - 1]);
      const veut = type(o) === 'fut' ? 'casier' : 'fut';
      let cand = piles.map((_, k) => k).filter((k) => sommet(k) === veut);
      if (!cand.length) cand = piles.map((_, k) => k);
      c = cand.reduce((a, k) => (h[k] < h[a] - 1e-9 ? k : a), cand[0]);
    }
    const q = { o, c, z: h[c], sous: piles[c][piles[c].length - 1] || null };
    piles[c].push(o); h[c] += hauteurObjet(isoDe(M, o));
    return q;
  });
}
// Un objet posé tel que le kit iso le dessine.
function isoDe(M, o) {
  const r = M.refs[o.ref];
  return r.type === 'fut' ? { type: 'fut', litres: r.litres, bande: r.bande, abime: !!o.abime } : { type: 'casier', capsule: r.capsule };
}

// Ce que le montage donne sur une base : par palette, les piles, les fûts, un fût sur un casier, film et étiquettes justes.
export function calculMontage(M, e) {
  const Mo = M.montage;
  return Array.from({ length: Mo.n }, (_, p) => {
    const liste = (e.palettes || [])[p] || [], pos = empiler(M, liste);
    const tours = parseInt((e.film || [])[p], 10);
    const etq = COTES_PALETTE.map((x) => x[0]).filter((k) => ((e.etiq || [])[p] || {})[k]).sort().join(',');
    return { p, liste, pos, futs: liste.filter((o) => M.refs[o.ref].type === 'fut').length,
      futSurCasier: pos.some((q) => M.refs[q.o.ref].type === 'fut' && q.sous && M.refs[q.sous.ref].type === 'casier'),
      film: tours >= Mo.film[0] && tours <= Mo.film[1], etiquettes: ETIQ_JUSTES.includes(etq) };
  });
}

// Les jalons (brief §5) : ceux des lignes, juste ou faux une fois le terminal fini, rien avant ; ceux du montage, à
// « Vérifier » seulement, et « non jugé » (faux) tant qu'une ligne est fausse (voir la tête).
export function jalonsPicking(M, e) {
  const T = e.terminal || terminalNeuf(), R = T.reponses || {}, EX = T.exceptions || {}, fin = !!T.fin;
  const lignes = M.terminal.jalons.filter((j) => !j.montage);
  const L = lignes.map((j) => {
    let ok;
    if (j.remplace) ok = R[j.ligne] === j.n;
    else if (j.attendu) { const x = EX[j.ligne]; ok = !!x && x.mot === j.attendu.mot && x.n === j.attendu.n && R[j.ligne] === j.prends - j.attendu.n; }
    else ok = !EX[j.ligne] && R[j.ligne] === j.prends;
    ok = fin && ok;
    return { id: j.id, lib: j.lib, ok, etat: fin ? (ok ? 'ok' : 'ko') : undefined, ligne: j.ligne,
      pris: j.ligne in R ? R[j.ligne] : null, exception: EX[j.ligne] || null };
  });
  if (!M.montage) return L;
  const lignesOk = L.every((l) => l.ok), juge = fin && !!e.verifie, X = calculMontage(M, e);
  const utilisees = X.filter((x) => x.liste.length), rien = !(e.cote || []).length;
  const regle = {
    casier: () => !X.some((x) => x.futSurCasier),
    futs: () => X.every((x) => x.futs <= M.montage.futsMax),
    film: () => utilisees.length > 0 && utilisees.every((x) => x.film),
    etiquettes: () => utilisees.length > 0 && utilisees.every((x) => x.etiquettes),
    palettes: () => utilisees.length === X.length,
  };
  M.terminal.jalons.filter((j) => j.montage).forEach((j) => {
    const ok = juge && lignesOk && rien && regle[j.montage]();
    L.push({ id: j.id, lib: j.lib, ok, etat: juge ? (ok ? 'ok' : 'ko') : undefined, montage: j.montage, nonJuge: juge && !lignesOk });
  });
  return L;
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
  const ui = { ouvert: null, ici: null, regles: false, focus: null, main: null };
  const tempsDe = (api) => P.temps || (api && api.temps) || 'guidage';
  const TT = M.terminal;
  const TERM = creerTerminal({ lignes: TT.lignes, textes: TT.textes, titre: TT.titre, mots: TT.mots });
  const MO = M.montage;
  let etat = null;      // la base de l'élève, le temps d'un dessin (les tiroirs se vident de ce qui a été pris)
  // Ce qui a été pris à un emplacement : posé (palettes, à côté), ou pris et pas encore posé (la ligne en cours).
  const enMain = (e) => {
    const T = e.terminal || {};
    if (!MO || T.fin || T.phase !== 'pose') return [];
    const l = lignesDuTerminal(TT.lignes, T)[T.i];
    return l ? objetsPris(M, e, l, T.reponses[l.id] || 0) : [];
  };
  const contenu = (x) => {
    const r = M.refs[x.ref];
    const pris = etat && MO ? [...tousPoses(etat), ...enMain(etat)].filter((o) => o.emp === x.adr) : [];
    const n = Math.max(0, x.n - pris.length), ab = Math.max(0, Math.min(n, x.abimes - pris.filter((o) => o.abime).length));
    return r.type === 'fut' ? { type: 'fut', n, litres: r.litres, bande: r.bande, abimes: ab }
      : { type: 'casier', n, capsule: r.capsule };
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

  /* -------------------------------------------------------------- le montage (lot 4) */
  // Ce que dit un objet, un groupe d'objets : « les 2 fûts Pelforth Blonde 20 L », « le casier Eau minérale 1 L ».
  const quoi = (ref, n) => {
    const r = M.refs[ref], mot = r.type === 'casier' ? 'casier' : 'fût';
    return n > 1 ? `les ${n} ${mot}s ${r.nom}` : `le ${mot} ${r.nom}`;
  };
  const listePal = (e, p) => ((e.palettes || [])[p] || []);

  // LES PALETTES, côte à côte, chacune dans son cadre en 3D (en diagonale dans un seul dessin, elles prenaient deux fois la
  // hauteur de la colonne) ; chacune se clique quand un objet « à côté » est en main. Le cadre est celui d'une pile de deux
  // couches : le dessin ne bouge pas quand on pose.
  function svgPalettes(e) {
    const I = projection({ unite: 100, origine: [0, 0] }), X = calculMontage(M, e), { W, D } = PAL_EUR, prise = ui.main != null;
    const vb = cadre(I, [[-.1, -.1, 0], [W + .1, -.1, 0], [W + .1, D + .1, 0], [-.1, D + .1, 0], [0, 0, 1.05], [W, 0, 1.05], [0, D, 1.05]]);
    return X.map((x) => {
      const piles = Array.from({ length: CASES_PALETTE }, () => []);
      x.pos.forEach((q) => piles[q.c].push(isoDe(M, q.o)));
      const dessin = `<polygon class="pk-pal-sol" points="${I.pts([[-.08, -.08, 0], [W + .08, -.08, 0], [W + .08, D + .08, 0], [-.08, D + .08, 0]])}"/>`
        + paletteClient(I, 0, 0, { piles, film: parseInt((e.film || [])[x.p], 10) || 0,
          etiquettes: COTES_PALETTE.map((c) => c[0]).filter((k) => ((e.etiq || [])[x.p] || {})[k]), casesVisibles: true });
      return `<figure class="pk-pal${prise ? ' pk-pal-cible' : ''}" data-pk-pal="${x.p}" data-pk-objets="${x.liste.length}"${prise ? ` tabindex="0" role="button" aria-label="${ech(`Poser sur la palette ${x.p + 1}`)}"` : ''}>
        <svg class="pk-pal-svg" viewBox="${vb}" role="img" aria-label="${ech(`Palette ${x.p + 1}`)}">${DEFS}${dessin}</svg><figcaption>Palette ${x.p + 1}</figcaption></figure>`;
    }).join('');
  }

  function htmlMontage(e, t, jal) {
    const T = e.terminal, fin = !!T.fin, X = calculMontage(M, e), cote = e.cote || [];
    const bouton = (attrs, cle, lib, off, cls = 'btn') => `<button type="button" class="${cls}" ${attrs} data-pe-cle="${cle}" ${off ? 'disabled' : ''}>${lib}</button>`;
    let h = `<section class="pk-montage" data-pk-montage aria-label="${ech(MO.titre)}"><b class="pk-titre">${ech(MO.titre)}</b>`;
    if (!fin && T.phase === 'pose') {
      const l = lignesDuTerminal(TT.lignes, T)[T.i], n = T.reponses[l.id];
      h += `<div class="pk-question" data-pk-question>Où poses-tu ${ech(quoi(M.E[l.emplacement].ref, n))} ?</div><div class="pk-poser">${
        X.map((x) => bouton(`data-pk-poser="${x.p}"`, `poser:${x.p}`, `Palette ${x.p + 1}`)).join('')}${
        bouton('data-pk-poser="cote"', 'poser:cote', 'À côté, je le pose après', false, 'btn pk-acote')}</div>`;
    } else if (!fin) h += '<div class="pe-petit">Suis le terminal : va à l’emplacement, lis le code, prends, puis pose.</div>';
    // « ↶ Reposer le dernier » : à l'étape 2 seulement (le brief : on corrige les objets posés avant de vérifier).
    h += `<div class="pk-palettes">${svgPalettes(e)}</div>${fin ? `<div class="pk-reposer">${X.map((x) => bouton(`data-pk-reposer="${x.p}"`, `reposer:${x.p}`,
      `↶ Reposer le dernier (palette ${x.p + 1})`, !x.liste.length)).join('')}</div>` : ''}`;
    if (cote.length) {
      h += `<div class="pk-cote" data-pk-cote><b>À côté :</b> ${cote.map((o, k) => `<button type="button" class="pk-objet${ui.main === k ? ' pk-main' : ''}" data-pk-objet="${k}"
        data-pe-cle="objet:${k}" aria-pressed="${ui.main === k}" ${fin ? '' : 'disabled'}>${M.refs[o.ref].type === 'casier' ? '▦' : '◯'} ${ech(M.refs[o.ref].nom)}${o.abime ? ' (cabossé)' : ''}</button>`).join('')}
        <div class="pe-petit">${fin ? (ui.main != null ? `Clique la palette où le poser.</div><div class="pk-poser">${X.map((x) => bouton(`data-pk-vers="${x.p}"`, `vers:${x.p}`, `Sur la palette ${x.p + 1}`)).join('')}` : 'Clique un objet, puis une palette.') : 'Tu les poseras quand la commande sera terminée.'}</div></div>`;
    }
    if (fin) {
      h += `<div class="pe-finir pk-finir"><b>Avant l’expédition</b>${MO.etiquette ? `<div class="pe-petit" data-pk-etiquette>Étiquette d’expédition : « ${ech(MO.etiquette)} »</div>` : ''}${
        X.map((x) => `<div class="pk-fin-pal" data-pk-fin="${x.p}"><b>Palette ${x.p + 1}</b>
          <label>Film étirable : <select data-pk-film="${x.p}" data-pe-cle="film:${x.p}"><option value="">— tours —</option>${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${String((e.film || [])[x.p]) === String(n) ? 'selected' : ''}>${n}</option>`).join('')}</select> tours</label>
          <div class="pe-etq">Étiquettes : ${COTES_PALETTE.map(([k, lib]) => `<label><input type="checkbox" data-pk-etiq="${x.p}:${k}" data-pe-cle="etiq:${x.p}:${k}" ${((e.etiq || [])[x.p] || {})[k] ? 'checked' : ''}> ${lib}</label>`).join('')}</div></div>`).join('')}
        <div class="pe-boutons">${bouton('data-pk="verifier"', 'b:verifier', 'Vérifier ma préparation', cote.length > 0, 'btn btn-p')}</div></div>`;
      if (e.verifie) {
        const nonJuge = jal.some((j) => j.nonJuge);
        h += `<div class="pm-bilan pk-bilan" data-pk-bilan><b>Ma préparation</b>${jal.map((j) => `<div class="${j.nonJuge ? 'pe-petit' : j.ok ? 'pe-ok' : 'pe-ko'}" data-pk-jalon="${ech(j.id)}" data-ok="${j.ok}">${
          j.nonJuge ? '— non jugé' : j.ok ? '✓' : '✗'} ${ech(j.lib)}</div>`).join('')}
          <div><b>${jal.filter((j) => j.ok).length} / ${jal.length}</b></div>
          <small>${t === 'guidage' || t === 'entrainement' ? 'Entraînement : seul le nom du critère est donné.' : ''}${nonJuge ? ' Les critères des palettes ne sont jugés que si toutes les lignes sont justes.' : ''}</small></div>`;
        if (MO.reflexion) h += `<label class="pk-reflexion" data-pk-reflexion-bloc><b>Pour réfléchir</b> ${ech(MO.reflexion)}
          <textarea data-pk-reflexion data-pe-cle="b:reflexion" rows="3" placeholder="ta réponse">${ech(e.reflexion || '')}</textarea></label>`;
      }
    }
    return `${h}</section>`;
  }

  // Les gestes du montage. `fait()` sauve et redessine ; une pose ou un changement efface la vérification.
  function poserLigne(e, dest, h) {
    const T = e.terminal;
    if (T.fin || T.phase !== 'pose') return;
    const l = lignesDuTerminal(TT.lignes, T)[T.i], objets = objetsPris(M, e, l, T.reponses[l.id] || 0);
    if (dest === 'cote') e.cote = [...(e.cote || []), ...objets];
    else { e.palettes = Array.from({ length: MO.n }, (_, p) => listePal(e, p)); e.palettes[dest] = [...e.palettes[dest], ...objets]; }
    e.verifie = false;
    const r = TERM.poser(T);
    // Les gestes AVANT la sauvegarde : c'est elle qui fait arriver une question au fil sur ce geste.
    h.sig(`ligne:${l.id}`);
    if (r.evt === 'fin') h.sig('fin');
    h.sauver();
    if (r.evt === 'fin') { ui.focus = 'film:0'; return 'fin'; }
    ui.focus = null;
    return r.evt;
  }
  function poserObjet(e, p) {
    const cote = e.cote || [];
    if (ui.main == null || !cote[ui.main] || !(e.terminal || {}).fin) return;
    const [o] = cote.splice(ui.main, 1);
    e.palettes = Array.from({ length: MO.n }, (_, k) => listePal(e, k)); e.palettes[p] = [...e.palettes[p], o];
    e.cote = cote; e.verifie = false; ui.main = null;
  }
  function reposer(e, p) {
    const T = e.terminal || {}, L = listePal(e, p);
    if (!L.length || !T.fin) return;
    e.palettes = Array.from({ length: MO.n }, (_, k) => listePal(e, k));
    const o = e.palettes[p].pop();
    e.cote = [...(e.cote || []), o]; e.verifie = false; ui.main = null;
  }

  return {
    signaux: [...Object.keys(M.E).map((a) => `entrepot:${P.id}:ouvrir:${a}`),
      ...TT.lignes.flatMap((l) => [l.id, ...(l.remplacement ? [l.remplacement.id] : [])]).map((id) => `entrepot:${P.id}:ligne:${id}`),
      `entrepot:${P.id}:fin`, ...(MO ? [`entrepot:${P.id}:verifier`] : [])],
    id: P.id,
    nav: { libelle: P.libelle || 'Allée de picking' },
    etatNeuf: etatPickingNeuf,
    calculette: () => false,
    lire: () => ({ ouvert: ui.ouvert, ici: ui.ici }),
    html(e, api) {
      // Une base d'avant le montage (lot 3) prend les champs qui lui manquent, sans rien perdre.
      Object.entries(etatPickingNeuf()).forEach(([k, v]) => { if (e[k] == null) e[k] = v; });
      etat = e;
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
        <div class="pm-jeu pm-avec-term${MO ? ' pk-avec-montage' : ''}"><aside class="pm-cote">${TERM.html(e.terminal, { estProf, son: !!(api && api.sonTerminal && api.sonTerminal()) })}
            ${MO ? htmlMontage(e, t, jalonsPicking(M, e)) : ''}<div class="pm-consigne" data-pm-consigne>${ech(P.consigne || 'Écoute (ou lis) le terminal, va à l’emplacement, réponds.')}</div>
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
        sig(`ouvrir:${adr}`);
        if (!e.vus[adr]) { e.vus[adr] = Date.now(); if (!e.premierGeste) e.premierGeste = e.vus[adr]; sauver(); }
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
      // LE MONTAGE : la destination de la ligne en cours, l'objet « à côté » en main et sa palette, reposer, film,
      // étiquettes, vérifier. Une fin de terminal redessine tout l'écran (comme une fin au clavier).
      if (MO) {
        // La colonne défile seule : elle garde sa place d'un dessin à l'autre, et descend juste ce qu'il faut pour montrer
        // les palettes quand une pose est attendue (une fois par ligne : l'élève peut remonter lire le terminal).
        const col = racine.querySelector('.pm-cote');
        col.scrollTop = ui.defile || 0;
        col.addEventListener('scroll', () => { ui.defile = col.scrollTop; });
        const T0 = e.terminal;
        if (!T0.fin && T0.phase === 'pose' && ui.vuPose !== T0.i) {
          ui.vuPose = T0.i;
          const bas = racine.querySelector('[data-pk-montage] .pk-palettes');
          const d = bas ? bas.getBoundingClientRect().bottom - col.getBoundingClientRect().bottom + 6 : 0;
          if (d > 0) { col.scrollTop += d; ui.defile = col.scrollTop; }
        }
        const fait = (cle) => { if (cle !== undefined) ui.focus = cle; sauver(); redessiner(); };
        racine.querySelectorAll('[data-pk-poser]').forEach((b) => activer(b, () => {
          const d = b.dataset.pkPoser;
          const evt = poserLigne(e, d === 'cote' ? 'cote' : +d, { sauver, sig });
          if (evt === 'fin' && api.redessinerTout) api.redessinerTout(); else redessiner();
        }));
        racine.querySelectorAll('[data-pk-objet]').forEach((b) => activer(b, () => {
          const k = +b.dataset.pkObjet;
          ui.main = ui.main === k ? null : k; ui.focus = ui.main == null ? `objet:${k}` : 'vers:0'; redessiner();
        }));
        const vers = (p) => { poserObjet(e, p); fait((e.cote || []).length ? 'objet:0' : 'film:0'); };
        racine.querySelectorAll('[data-pk-vers]').forEach((b) => activer(b, () => vers(+b.dataset.pkVers)));
        racine.querySelectorAll('[data-pk-pal][role="button"]').forEach((g) => activer(g, () => vers(+g.dataset.pkPal)));
        racine.querySelectorAll('[data-pk-reposer]').forEach((b) => activer(b, () => { reposer(e, +b.dataset.pkReposer); fait(`reposer:${b.dataset.pkReposer}`); }));
        racine.querySelectorAll('[data-pk-film]').forEach((s) => s.addEventListener('change', () => {
          const p = +s.dataset.pkFilm;
          e.film = Array.from({ length: MO.n }, (_, k) => (e.film || [])[k] || ''); e.film[p] = s.value; e.verifie = false; fait(`film:${p}`);
        }));
        racine.querySelectorAll('[data-pk-etiq]').forEach((c) => c.addEventListener('change', () => {
          const [p, k] = c.dataset.pkEtiq.split(':');
          e.etiq = Array.from({ length: MO.n }, (_, i) => Object.assign({}, (e.etiq || [])[i] || {}));
          e.etiq[+p][k] = c.checked; e.verifie = false; fait(`etiq:${p}:${k}`);
        }));
        racine.querySelectorAll('[data-pk="verifier"]').forEach((b) => activer(b, () => {
          if ((e.cote || []).length || !(e.terminal || {}).fin) return;
          e.verifie = true; e.verifs = (e.verifs || 0) + 1; sig('verifier');
          ui.focus = 'b:verifier'; sauver();
          if (api.redessinerTout) api.redessinerTout(); else redessiner();
          const bilanEl = document.querySelector(`[data-entrepot="${CSS.escape(P.id)}"] [data-pk-bilan]`);
          if (bilanEl) bilanEl.scrollIntoView({ block: 'nearest' });
        }));
        // La réponse libre : gardée à chaque frappe, sans redessiner (le curseur reste où il est).
        const refl = racine.querySelector('[data-pk-reflexion]');
        if (refl) refl.addEventListener('input', () => { e.reflexion = refl.value.slice(0, 2000); sauver(); });
      }
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
