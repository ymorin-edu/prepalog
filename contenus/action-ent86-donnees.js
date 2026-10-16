// ENT-8.6 — Action, évaluation « ma prise de poste dans un nouveau site » : les DONNÉES PURES de la séance (site de l’élève, équipe, plan aux
// numéros tirés, planigramme du 12 janvier, banques et tirage, notes du quai, phrases du compte rendu calculées sur ce que l’élève a fait).
// Aucun effet de bord à l’import (sauf le contrôle de la grille, qui refuse une grille fausse), aucune interface : importé par le contenu
// (`contenus/action-ent86.js`), les questions (`contenus/questions/ENT-8.6.js`) et le corrigé (`contenus/corriges/ENT-8.6.js`).
// Brief `docs/briefs/ENT-8.6-action-evaluation-prise-de-poste.md` §5, §6, §6 bis ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-action.md` §7.
//
// Les deux sites et le tirage du site (fonction pure de l’identifiant de l’élève : le MÊME site qu’en ENT-8.5) : `contenus/action-eval-sites.js`,
// module partagé, lu ici sans y rien changer. Aucune base partagée (`jeuId`) avec ENT-8.5.
//
// VÉRIFIÉ (brief ENT-8.5 §2) : les sites, prestataires et magasins (voir `contenus/action-eval-sites.js`) ; le hub d’import d’Action à
// Gonfreville-l’Orcher (comme ENT-8.1).
// CONSTRUIT (dit dans la séance, `MENTION`) : les collègues (Onnaing : Léo, cariste, Manon, agent administratif ; Belleville : Hugo, cariste,
// Chloé, agent administratif — brief §11 n° 6), le plan (celui de Labastide d’ENT-8.4, NUMÉROS TIRÉS par élève), le planigramme du mardi
// 12 janvier et ses camions (noms génériques), la carte « Linge de maison », les documents (fournisseur « Jouets Clairbois » repris d’ENT-8.4,
// transporteur « Transports Estuaire-Seine » : noms construits), les quatre notes du quai, les horaires, les quantités.
// Textes de Cowork repris tels quels (brief §4, §6.3) ; textes du constructeur (notes du quai, consignes) listés au compte rendu du brief.

import { declarerTirage, hasard } from '../core/tirage.js';
import { siteDeBase } from './action-eval-sites.js';
import { PLAN_LABASTIDE, BANQUE_LIEUX, BANQUE_TACHES, BANQUE_DOCS, valeursCommande, toMin, versHHMM, heureLue, nombre } from './action-ent84-donnees.js';

export const ID = 'action-evaluation-prise-de-poste';
export const ID_VOLET = 'action-ent86';
export const PLANNING_ID = 'action-eval-quais';
export const PHRASES_ID = 'compte-rendu-86';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { reperer: 'reperer', qui: 'qui-fait-quoi', lire: 'planigramme', docs: 'documents' };
export { toMin, versHHMM, heureLue, nombre };

// ─────────────────────────────────────────────────────────────── le site et l’équipe de l’élève
export const siteEleve = (db) => siteDeBase(db, ID);
// Les collègues, par site (CONSTRUITS, brief §2 et §11 n° 6).
export const COLLEGUES = { onnaing: { cariste: 'Léo', agent: 'Manon' }, belleville: { cariste: 'Hugo', agent: 'Chloé' } };
const sansAccent = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// L’équipe d’un site : prénoms, fonction du chef (« chef d’équipe » / « cheffe d’équipe »), adresses de messagerie (domaine du tuteur).
export function equipeDe(S) {
  const C = COLLEGUES[S.id] || COLLEGUES.onnaing;
  const dom = S.tuteur.mail.split('@')[1];
  return { tuteur: S.tuteur.prenom, chef: S.tuteur.fonction.replace(/ à la réception$/, ''), cariste: C.cariste, agent: C.agent,
    mailTuteur: S.tuteur.mail, mailAgent: `${sansAccent(C.agent)}@${dom}` };
}
// Les quatre choix de « Qui fait quoi ? », dans l’ordre fixe de l’équipe (brief §4, étape 2). Clés neutres.
export const choixEquipe = (Q) => [
  { v: 'chef', lib: `${Q.tuteur}, ${Q.chef}` }, { v: 'cariste', lib: `${Q.cariste}, cariste` },
  { v: 'moi', lib: 'toi, réceptionnaire' }, { v: 'agent', lib: `${Q.agent}, agent administratif` },
];
// Les tâches d’ENT-8.4 nomment Romain, Lucas, Inès : ici, le chef, le cariste, l’agent du site.
const QUI_84 = { romain: 'chef', lucas: 'cariste', ines: 'agent', moi: 'moi' };
export const quiDe = (p) => QUI_84[p.qui];

// ─────────────────────────────────────────────────────────────── le plan, numéros TIRÉS par élève (brief §4 étape 1, §7 point 3)
// Le dessin d’ENT-8.4 n’est pas modifié : ses ronds portent les numéros d’ENT-8.4 (`n` de chaque lieu). Ici, chaque rond reçoit le numéro
// `plan[n − 1]` de l’élève (une permutation de 1 à 8), par remplacement dans le texte du dessin. ENT-8.4 garde ses numéros fixes.
const ROND = /(<g class="lb-num">[\s\S]*?<text[^>]*>)(\d)(<\/text><\/g>)/g;
export function planNumerote(perm) {
  let n = 0;
  const svg = PLAN_LABASTIDE.replace(ROND, (m, a, k, b) => { n++; return `${a}${perm[Number(k) - 1]}${b}`; });
  if (n !== 8) throw new Error(`ENT-8.6 : le plan d’ENT-8.4 n’a plus 8 ronds numérotés (${n} trouvés)`);
  return svg;
}
// Les numéros affichés sur le plan, lus dans le dessin (contrôle et tests).
export const numerosDuPlan = (svg) => [...svg.matchAll(ROND)].map((x) => Number(x[2]));
export const estPermutation = (p) => Array.isArray(p) && p.length === 8 && [...p].sort((a, b) => a - b).join(',') === '1,2,3,4,5,6,7,8';
export const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8].map((k) => ({ v: String(k), lib: `n° ${k}` }));

// ─────────────────────────────────────────────────────────────── le planigramme (grille IDENTIQUE pour toute la classe, brief §6.1)
export const ECHELLE = { debut: '06:00', fin: '13:00', pas: 30 };
export const QUAIS = [{ id: 'Q1', nom: 'Quai 1' }, { id: 'Q2', nom: 'Quai 2' }, { id: 'Q3', nom: 'Quai 3' }, { id: 'Q4', nom: 'Quai 4' }];
// Les camions déjà prévus (`occupe` du planning, document, lectures : TOUT en est calculé). CONSTRUITS (brief §6.1).
export const CAMIONS = [
  { id: 'vaisselle', quai: 'Q1', de: '06:00', a: '07:30', court: 'Vaisselle', lib: 'le camion de vaisselle' },
  { id: 'jouets', quai: 'Q1', de: '08:00', a: '09:30', court: 'Jouets', lib: 'le camion de jouets' },
  { id: 'papeterie', quai: 'Q1', de: '10:30', a: '12:00', court: 'Papeterie', lib: 'le camion de papeterie' },
  { id: 'havre', quai: 'Q2', de: '06:30', a: '08:00', court: 'Camion du Havre', lib: 'le camion du Havre', havre: true },
  { id: 'textile', quai: 'Q2', de: '09:00', a: '10:30', court: 'Textile', lib: 'le camion de textile' },
  { id: 'retours', quai: 'Q3', de: '06:00', a: '07:00', court: 'Retours des magasins', lib: 'les retours des magasins' },
  { id: 'bougies', quai: 'Q3', de: '07:00', a: '08:30', court: 'Bougies', lib: 'le camion de bougies' },
  { id: 'menagers', quai: 'Q3', de: '11:00', a: '12:30', court: 'Produits ménagers', lib: 'le camion de produits ménagers' },
  { id: 'decorations', quai: 'Q4', de: '07:30', a: '09:00', court: 'Décorations', lib: 'le camion de décorations' },
  { id: 'palettes', quai: 'Q4', de: '09:00', a: '10:00', court: 'Retour de palettes vides', lib: 'le retour de palettes vides' },
];
// La carte à poser (brief §4 étape 3b) : « Linge de maison — 1 h », entre 9 h et midi.
export const CARTE = { id: 'linge', titre: 'Linge de maison — 1 h', court: 'Linge de maison', lib: 'le camion de linge de maison',
  duree: 60, des: '09:00', avant: '12:00' };
export const nomQuai = (q) => (QUAIS.find((x) => x.id === q) || {}).nom || q;
export const minQuai = (q) => nomQuai(q).replace(/^Q/, 'q');   // « quai 3 » dans une phrase
const chevauche = (a, b) => a.quai === b.quai && toMin(a.de) < toMin(b.a) && toMin(b.de) < toMin(a.a);
export const camionCarte = (r, m) => ({ id: CARTE.id, quai: r, de: versHHMM(m), a: versHHMM(m + CARTE.duree) });

export function conflits(camions) {
  const P = [];
  camions.forEach((c, i) => camions.slice(i + 1).forEach((d) => { if (chevauche(c, d)) P.push([c.id, d.id].sort()); }));
  return P;
}
// Les places justes de la carte (quai, début en minutes) : 1 h sans recouvrir aucun camion, entre 9 h et midi.
export function placesLibres(camions = CAMIONS) {
  const P = [];
  QUAIS.forEach((q) => {
    for (let m = toMin(CARTE.des); m + CARTE.duree <= toMin(CARTE.avant); m += ECHELLE.pas) {
      if (!camions.some((x) => chevauche(x, camionCarte(q.id, m)))) P.push([q.id, m]);
    }
  });
  return P;
}
// Une pose est-elle juste (les deux règles du planning : quai libre, fenêtre) ? Pour les tests et le corrigé ; le jalon, lui, est jugé
// par le moteur du planning.
export const poseJuste = (r, m, camions = CAMIONS) => placesLibres(camions).some(([q, x]) => q === r && x === m);

// Les LECTURES (brief §6.4), calculées sur une grille. Chaque lecture : { q, choix: [{ v, lib }], juste, justes (toutes les valeurs qui
// répondent sur cette grille : une seule attendue) }.
export function lecturesDe(camions = CAMIONS) {
  const L = {};
  const alpha = (X) => X.slice().sort((a, b) => a.lib.localeCompare(b.lib, 'fr'));
  const vq = QUAIS.map((q) => ({ v: q.id, lib: q.nom }));
  const H = camions.filter((c) => c.havre);
  { const m = H[0] ? toMin(H[0].de) : 390;
    L['l-havre-heure'] = { q: 'À quelle heure arrive le camion du Havre ?', juste: H[0] ? H[0].de : null, justes: H.map((c) => c.de),
      choix: [m - 30, m, m + 30, H[0] ? toMin(H[0].a) : m + 90].map((x) => ({ v: versHHMM(x), lib: heureLue(x) })) }; }
  L['l-havre-quai'] = { q: 'À quel quai se met le camion du Havre ?', juste: H[0] ? H[0].quai : null, justes: H.map((c) => c.quai), choix: vq };
  { const J = camions.filter((c) => c.id === 'retours');
    L['l-retours'] = { q: 'À quel quai arrivent les retours des magasins ?', juste: J[0] ? J[0].quai : null, justes: J.map((c) => c.quai), choix: vq }; }
  { const n = camions.filter((c) => c.quai === 'Q1').length;
    L['l-q1-combien'] = { q: 'Combien de camions sont prévus au quai 1 ?', juste: String(n), justes: [String(n)],
      choix: [1, 2, 3, 4].map((k) => ({ v: String(k), lib: String(k) })) }; }
  { const libres = QUAIS.filter((q) => !camions.some((c) => chevauche(c, { quai: q.id, de: '07:00', a: '07:30' }))).map((q) => q.id);
    L['l-libre-7h'] = { q: 'Quel quai est libre de 7 h à 7 h 30 ?', juste: libres[0] || null, justes: libres, choix: vq }; }
  { const max = Math.max(...camions.map((c) => toMin(c.a)));
    const J = camions.filter((c) => toMin(c.a) === max);
    const quatre = camions.slice().sort((a, b) => toMin(b.a) - toMin(a.a) || a.id.localeCompare(b.id)).slice(0, 4);
    L['l-dernier'] = { q: 'Quel camion libère son quai le dernier ?', juste: J[0] ? J[0].id : null, justes: J.map((c) => c.id),
      choix: alpha(quatre.map((c) => ({ v: c.id, lib: c.lib }))) }; }
  return L;
}

// Le CONTRÔLE de la grille (au chargement : la séance refuse de s’ouvrir s’il rend quelque chose) — brief §6.1 : aucun conflit, au moins
// 3 places justes sur au moins 3 quais, une seule bonne réponse par lecture parmi 4 choix distincts, heures sur la demi-heure, dans l’échelle.
export function ecartsGrille(camions = CAMIONS) {
  const E = [];
  Object.entries(lecturesDe(camions)).forEach(([id, x]) => {
    if (x.justes.length !== 1) E.push(`lecture ${id} : ${x.justes.length} bonne(s) réponse(s) sur la grille au lieu d’une`);
    else if (!x.choix.some((c) => c.v === x.juste)) E.push(`lecture ${id} : la bonne réponse n’est pas dans les choix`);
    if (x.choix.length !== 4) E.push(`lecture ${id} : ${x.choix.length} choix au lieu de 4`);
    if (new Set(x.choix.map((c) => c.v)).size !== x.choix.length) E.push(`lecture ${id} : deux choix identiques`);
  });
  camions.forEach((c) => {
    [c.de, c.a].forEach((h) => { if (toMin(h) % ECHELLE.pas || toMin(h) < toMin(ECHELLE.debut) || toMin(h) > toMin(ECHELLE.fin)) E.push(`camion ${c.id} : ${h} hors de la demi-heure ou de l’échelle`); });
    if (toMin(c.de) >= toMin(c.a)) E.push(`camion ${c.id} : il repart avant d’arriver`);
  });
  conflits(camions).forEach(([a, b]) => E.push(`camions ${a} et ${b} en même temps au même quai`));
  const P = placesLibres(camions);
  if (P.length < 3) E.push(`${P.length} place(s) juste(s) pour la carte au lieu de 3 au moins`);
  if (new Set(P.map(([q]) => q)).size < 3) E.push('les places justes de la carte tiennent sur moins de 3 quais');
  return E;
}
{ const E = ecartsGrille(); if (E.length) throw new Error(`ENT-8.6 : le planigramme ne tient pas — ${E.join(' ; ')}`); }
export const LECTURES = lecturesDe();
export const HAVRE = CAMIONS.find((c) => c.havre);

// ─────────────────────────────────────────────────────────────── la note du quai (banque `quai`, une tirée ; textes CONSTRUITS)
// Chaque note : ce que le cariste a noté au quai 2 à 6 h 40 ; ce qu’on répond à « Peut-on ouvrir ? » (`ouvrir`) et à « Que fais-tu
// d’abord ? » (`dabord`) ; la phrase du compte rendu (`phrase`, texte du brief §6.3). La note « tout est prêt » existe (sinon « non »
// rapporterait toujours, brief §5). Les EPI sont toujours en ordre : « je n’ai pas mes EPI » n’est jamais la réponse.
const EPI_OK = 'Chaussures et gilet : OK.';
const DEGAGE = 'Devant la porte : rien, le quai est dégagé.';
export const NOTES = [
  { id: 'encombre', difficulte: 'facile', ouvrir: 'encombre', dabord: 'degager', phrase: 'Le quai est encombré : je le fais dégager avant d’ouvrir.',
    lignes: [EPI_OK, 'Transpalette : chargé.', 'Bon de livraison : reçu du chauffeur.', 'Devant la porte : 12 palettes de retours des magasins, pas encore rangées.'] },
  { id: 'transpalette', difficulte: 'facile', ouvrir: 'transpalette', dabord: 'charge', phrase: 'Le transpalette était déchargé : je l’ai mis en charge.',
    lignes: [EPI_OK, 'Transpalette : batterie vide. Aucun autre transpalette chargé au quai.', 'Bon de livraison : reçu du chauffeur.', DEGAGE] },
  { id: 'bl', difficulte: 'facile', ouvrir: 'bl', dabord: 'bl', phrase: 'Le chauffeur n’avait pas le bon de livraison : je le lui ai demandé.',
    lignes: [EPI_OK, 'Transpalette : chargé.', 'Bon de livraison : le chauffeur ne l’a pas donné.', DEGAGE] },
  { id: 'pret', difficulte: 'facile', ouvrir: 'pret', dabord: 'ouvrir', phrase: 'Tout est prêt, on ouvre le camion.',
    lignes: [EPI_OK, 'Transpalette : chargé.', 'Bon de livraison : reçu du chauffeur.', DEGAGE] },
];
// « Peut-on ouvrir le camion maintenant ? » (5 choix, brief §4 étape 4) et « Que fais-tu d’abord ? » (4 choix).
export const CHOIX_OUVRIR = [
  { v: 'pret', lib: 'Oui, tout est prêt.' },
  { v: 'encombre', lib: 'Non : le quai est encombré.' },
  { v: 'transpalette', lib: 'Non : il manque un transpalette chargé.' },
  { v: 'bl', lib: 'Non : il manque le bon de livraison.' },
  { v: 'epi', lib: 'Non : je n’ai pas mes EPI.' },
];
export const choixDabord = (cariste) => [
  { v: 'degager', lib: 'Je fais dégager le quai.' },
  { v: 'charge', lib: 'Je mets un transpalette en charge et j’en prends un chargé.' },
  { v: 'bl', lib: 'Je demande le bon de livraison au chauffeur.' },
  { v: 'ouvrir', lib: `J’ouvre le camion avec ${cariste}.` },
];
export const CHOIX_DOCS = [{ v: 'commande', lib: 'le bon de commande' }, { v: 'livraison', lib: 'le bon de livraison' },
  { v: 'voiture', lib: 'la lettre de voiture' }, { v: 'facture', lib: 'la facture' }];
// « Combien de cartons manquent ? » : k (juste), N − k, N, k + 24 (brief §4 étape 4).
export const nombresManque = (C) => [C.k, C.livre, C.N, C.k + 24];

// ─────────────────────────────────────────────────────────────── les banques et le tirage (ni bonus ni niveau)
// Lieux, tâches et questions « Quel document dit… ? » : les banques d’ENT-8.4, importées telles quelles. Lectures : banque propre (§6.4).
export const BANQUE_LECTURES = [
  { id: 'l-havre-heure', difficulte: 'facile' }, { id: 'l-havre-quai', difficulte: 'facile' }, { id: 'l-retours', difficulte: 'facile' },
  { id: 'l-q1-combien', difficulte: 'moyen' }, { id: 'l-libre-7h', difficulte: 'moyen' }, { id: 'l-dernier', difficulte: 'moyen' },
];
export { BANQUE_LIEUX, BANQUE_TACHES, BANQUE_DOCS };
// Les valeurs : la commande d’ENT-8.4 (n°, N multiple de 24 de 720 à 1 440, k multiple de 24 de 24 à 96) et la permutation du plan.
export const valeurs86 = (h) => ({ ...valeursCommande(h), plan: h.melanger([1, 2, 3, 4, 5, 6, 7, 8]) });
// Contrôle d’équité (vide = conforme) : trois personnes différentes dans les tâches (sinon « tout au chef » rapporterait) ; N et k ; une
// vraie permutation ; quatre nombres distincts pour « combien manquent ? ».
export function ecartsJeu(jeu) {
  const E = [];
  const T = (jeu.pieces && jeu.pieces.taches) || [];
  if (new Set(T.map((p) => p && quiDe(p))).size !== T.length) E.push(`les ${T.length} tâches ne vont pas à ${T.length} personnes différentes`);
  const V = jeu.valeurs || {};
  if (!(V.k > 0 && V.k < V.N)) E.push('k doit être entre 0 et N');
  if (V.N % 24 || V.k % 24 || V.N < 720 || V.N > 1440 || V.k < 24 || V.k > 96) E.push('N et k : multiples de 24, N de 720 à 1 440, k de 24 à 96');
  if (!estPermutation(V.plan)) E.push('le plan : les numéros ne sont pas une permutation de 1 à 8');
  const M = nombresManque({ k: V.k, N: V.N, livre: V.N - V.k });
  if (new Set(M).size !== 4) E.push('« combien manquent ? » : deux nombres identiques');
  return E;
}
export const TIRAGE = declarerTirage({
  banques: {
    lieux: { pieces: BANQUE_LIEUX, melange: { facile: 1, moyen: 2, difficile: 1 }, ordre: 'melange' },
    taches: { pieces: BANQUE_TACHES, melange: { facile: 1, moyen: 1, difficile: 1 }, ordre: 'melange' },
    lectures: { pieces: BANQUE_LECTURES, melange: { facile: 1, moyen: 1 }, ordre: 'fixe' },
    documents: { pieces: BANQUE_DOCS, melange: { facile: 2 }, ordre: 'melange' },
    quai: { pieces: NOTES, melange: { facile: 1 } },
  },
  valeurs: valeurs86,
  verifier: ecartsJeu,
});
TIRAGE.lier(ID);

// ─────────────────────────────────────────────────────────────── le jeu de l’élève, lu dans SA base
// Sans tirage rangé (base vide du contrôle au chargement, enseignant) : un jeu témoin fixe, conforme.
const parId = (B, id) => B.find((p) => p.id === id);
export const DEFAUT = { lieux: ['l-quai', 'l-controle', 'l-bureau', 'l-retours'], taches: ['t-decharger', 't-retours', 't-refuser'],
  lectures: ['l-havre-quai', 'l-q1-combien'], documents: ['commande', 'livraison'], quai: ['encombre'],
  valeurs: { numero: 731542, N: 1152, k: 72, plan: [6, 3, 8, 1, 7, 2, 5, 4] } };
const tire = (banque, B) => (db) => (TIRAGE.tirage(db) ? TIRAGE.piecesTirees(db, banque) : DEFAUT[banque].map((id) => parId(B, id)));
export const lieuxDe = tire('lieux', BANQUE_LIEUX);
export const tachesDe = tire('taches', BANQUE_TACHES);
export const lecturesTirees = tire('lectures', BANQUE_LECTURES);
export const documentsDe = tire('documents', BANQUE_DOCS);
export const noteDe = (db) => tire('quai', NOTES)(db)[0];
const valeursDe = (db) => (TIRAGE.tirage(db) ? TIRAGE.valeursTirees(db) : DEFAUT.valeurs);
// La permutation du plan : `plan[n − 1]` = le numéro, chez l’élève, du rond qui porte `n` dans le dessin d’ENT-8.4.
export const planDe = (db) => { const p = valeursDe(db).plan; return estPermutation(p) ? p : DEFAUT.valeurs.plan; };
export const numeroDe = (db, lieu) => String(planDe(db)[lieu.n - 1]);
export function commandeDe(db) {
  const V = valeursDe(db);
  const N = V.N, k = V.k, livre = N - k;
  return { numero: `AC-${V.numero}`, N, k, livre, palettes: Math.ceil(livre / 96), bl: `BL-${String(V.numero).slice(-4)}-12`, lv: `LV-${String(V.numero * 7).slice(-6)}` };
}
const graineDe = (db) => { const r = TIRAGE.tirage(db); return r ? r.graine : ''; };
export const melangerPour = (db, quoi, L) => (graineDe(db) ? hasard(`${graineDe(db)}|${quoi}`).melanger(L) : L.slice());

// Lectures de la base (sans tirer l’interface).
export function fiche(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
export const envoyee = (id) => (db) => fiche(db, id).envoye;
export const placeEnvoyee = (db) => { const e = db && db.plannings && db.plannings[PLANNING_ID]; return (e && e.v1 && e.v1.place) || null; };
export const planningEnvoye = (db) => !!(db && db.plannings && db.plannings[PLANNING_ID] && db.plannings[PLANNING_ID].v1);

// ─────────────────────────────────────────────────────────────── le compte rendu (phrases, brief §6.3) — une erreur ne se paie qu’une fois
// La pose de la carte dans une version envoyée (`place[carte] = { r, s }`, s = rang de la demi-heure depuis 6 h) → { r, m } ou null.
export function poseDe(place) {
  const p = place && place[CARTE.id];
  return p && p.r ? { r: p.r, m: toMin(ECHELLE.debut) + p.s * ECHELLE.pas } : null;
}
export const phraseCreneau = (r, m) => `J’ai mis le camion de linge de maison au ${minQuai(r)} à ${heureLue(m)}.`;
export const PAS_PLACE = 'Je ne l’ai pas placé.';
// Les « autres places de la grille » proposées en pièges (des places justes : la ligne juge la TRANSMISSION, pas la place).
export const CANDIDATS = [['Q3', 540], ['Q1', 570], ['Q4', 600], ['Q2', 630]];
// La ligne « le créneau » : la phrase juste est celle de ce que l’élève a POSÉ (juste ou faux) ; carte non posée : « Je ne l’ai pas placé. ».
export function ligneCreneau(place) {
  const pose = poseDe(place);
  const autres = CANDIDATS.filter(([r, m]) => !(pose && pose.r === r && pose.m === m)).map(([r, m]) => phraseCreneau(r, m));
  if (!pose) return { choix: [...autres.slice(0, 3), PAS_PLACE], juste: 3 };
  return { choix: [phraseCreneau(pose.r, pose.m), ...autres.slice(0, 2), PAS_PLACE], juste: 0 };
}
// La ligne « le quai 2 » : les phrases des quatre notes ; la juste suit la réponse de l’élève à « Peut-on ouvrir ? » ; une réponse sans
// phrase (« je n’ai pas mes EPI », vide) : la note tirée.
export const PHRASES_QUAI = NOTES.map((n) => n.phrase);
export function noteAttendue(db) {
  const r = fiche(db, FICHES.docs).valeurs.ouvrir;
  return NOTES.find((n) => n.ouvrir === r) || noteDe(db);
}
export const justeQuai = (db) => NOTES.indexOf(noteAttendue(db));
// La ligne « ce qui manque » : la juste suit la réponse de l’élève à « Combien de cartons manquent ? » (N → « Il manque N cartons. ») ; une
// réponse sans phrase (N − k, k + 24, vide) : k.
export const choixManque = (C) => [`Il manque ${nombre(C.k)} cartons de jouets sur le bon de livraison.`, `Il manque ${nombre(C.N)} cartons.`, 'Il ne manque rien.'];
export function justeManque(db) {
  const C = commandeDe(db);
  return fiche(db, FICHES.docs).valeurs.manque === String(C.N) ? 1 : 0;
}
