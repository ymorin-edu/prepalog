// ENT-8.2 — Action, « ma prise de poste à la réception » : le contenu de la séance (brief `docs/briefs/ENT-8.2-action-prise-de-poste.md`).
// CAP OL, guidage de CAP-C1.2 (prendre un poste en autonomie). Univers commun : `contenus/action.js` (lu, jamais modifié ici).
// Activité : `activites/action-prise-de-poste.js`. Questions : `contenus/questions/ENT-8.2.js`. Corrigé : `contenus/corriges/ENT-8.2.js`.
//
// Mardi 9 novembre, 6 h. L'élève, stagiaire en PFMP chez Geodis à l'entrepôt Action d'Ensuès-la-Redonne, tient le poste de réception :
//   ① visite de la réception (plan d'entrepôt, mode visite, noté au premier essai) ;
//   ② fiche « Qui fait quoi ? » (tâches TIRÉES) ;
//   ③ planigramme (document fabriqué depuis les données du planning) + fiche « Lire le planigramme » (lectures TIRÉES, réponses CALCULÉES
//      sur la grille) + planning des quais (une carte à poser sur une grille déjà occupée) ;
//   ④ les trois documents du camion du Havre (n° de commande et quantités TIRÉS) + fiche « Avant d'ouvrir le camion » ;
//   ⑤ compte rendu à Samia par phrases à choisir (valeurs LUES dans la grille).
// Rien n'est jugé à l'écran ; le bandeau de fin dit juste / à corriger par bloc. Ce module exporte aussi ce qu'une séance future d'Action
// (C1.3, la réception) peut reprendre : le plan de la réception (`PLAN_RECEPTION`, `ZONES_RECEPTION`), le document « Le droit » (`DOC_DROIT`),
// le planigramme (`CAMIONS`, `docPlanigramme`).
//
// VÉRIFIÉ / CONSTRUIT (brief §2) — voir aussi l'en-tête de `contenus/action.js` :
//   Vérifié : Action (magasins à petits prix), l'entrepôt d'Ensuès-la-Redonne exploité par Geodis, le hub d'import d'Action à Gonfreville-
//   l'Orcher (port du Havre), les métiers recrutés à Ensuès (opérateurs, caristes, chefs d'équipe, contrôleurs, agents administratifs).
//   Textes de loi RECOPIÉS MOT POUR MOT sur Légifrance le 15/10/2026 : C. civ. art. 1603 (LEGIARTI000006441528) et 1604
//   (LEGIARTI000006441557) ; C. trav. art. L4111-5 (LEGIARTI000006903144, en vigueur depuis le 01/05/2008) et L4141-1, 1er alinéa
//   (LEGIARTI000027326445, en vigueur depuis le 18/04/2013 ; 1er alinéa relu aussi sur code.travail.gouv.fr).
//   Construit (dit dans la séance) : le plan de la réception, le planigramme et ses camions, les horaires, les trois documents (fournisseur
//   « Vaisselle Lotus » et transporteur « Transports Seine-Provence » : noms construits), le transpalette en charge, la répartition des tâches
//   (Julie tient le planigramme), Samia, Kevin, Julie.
//   Photos : libres (Pexels), ni Action ni Geodis, aucun visage ; deux reprises du dépôt (Smoby) : le dessin de la zone litiges et la photo
//   de bureau (Pexels 7658310) ; la photo du quai intérieur (Pexels 1267327, `contenus/smoby/LISEZMOI.md`) sert à la question du niveleur.

import { declarerTirage, hasard } from '../core/tirage.js';
import { apresGeste, apresFiche, apresPlanning, apresMail } from '../core/declencheurs.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { etapesPlanning } from '../core/types/planning.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-8.2.js';
import { EQUIPE, LEXIQUE, PHOTOS, STYLE_DOCUMENTS, PIED, PIED_RECONSTITUTION, mailDe, ech, figure } from './action.js';

export const ID = 'action-prise-de-poste';
export const ID_VOLET = 'action-ent82';
export const VISITE_ID = 'action-reception';
export const PLANNING_ID = 'action-quais';
export const PHRASES_ID = 'compte-rendu-samia';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { qui: 'qui-fait-quoi', lire: 'planigramme', docs: 'documents', avant: 'avant-ouvrir' };

// ─────────────────────────────────────────────────────────────── l'heure du scénario (mardi 9 novembre, aucune année écrite)
// Les messages portent la date du scénario (une heure par étape, de 6 h à 6 h 58, dans l'ordre du déroulé) : le 9 novembre de l'année scolaire en cours (de septembre à décembre : cette année ; de janvier
// à août : l'année d'avant), comme Smoby. La Messagerie n'affiche pas le jour de la semaine. Heure d'ouverture + temps réellement passé.
const anScolaire = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anScolaire(), 10, 9, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── outils
const toMin = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
const z2 = (n) => String(n).padStart(2, '0');
export const versHHMM = (m) => `${z2(Math.floor(m / 60))}:${z2(m % 60)}`;
// 420 → « 7 h », 450 → « 7 h 30 ».
export const heureLue = (m) => `${Math.floor(m / 60)} h${m % 60 ? ` ${z2(m % 60)}` : ''}`;
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Une fiche « déjà envoyée une fois » : vraie aussi pendant une correction (« Corriger » retire `envoye`, le geste reste rangé) — les
// écrans qui la suivent ne disparaissent pas du menu quand l'élève la reprend.
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// ─────────────────────────────────────────────────────────────── le planigramme (grille IDENTIQUE pour toute la classe, brief §6.1)
// Construit. Noms GÉNÉRIQUES (aucune entreprise réelle). Les lectures, les phrases du compte rendu et le document en sont CALCULÉS.
export const QUAIS = [{ id: 'Q1', nom: 'Quai 1' }, { id: 'Q2', nom: 'Quai 2' }, { id: 'Q3', nom: 'Quai 3' }, { id: 'Q4', nom: 'Quai 4' }];
export const CAMIONS = [
  { id: 'bougies', quai: 'Q1', de: '06:00', a: '07:30', titre: 'Fournisseur de bougies', court: 'Bougies', lib: 'le fournisseur de bougies' },
  { id: 'jouets', quai: 'Q1', de: '09:00', a: '10:30', titre: 'Fournisseur de jouets', court: 'Jouets', lib: 'le fournisseur de jouets' },
  { id: 'havre', quai: 'Q2', de: '07:00', a: '08:30', titre: 'Camion du Havre', court: 'Camion du Havre', lib: 'le camion du Havre' },
  { id: 'menagers', quai: 'Q3', de: '06:30', a: '08:00', titre: 'Fournisseur de produits ménagers', court: 'Produits ménagers', lib: 'le fournisseur de produits ménagers' },
  { id: 'papeterie', quai: 'Q3', de: '08:30', a: '10:00', titre: 'Fournisseur de papeterie', court: 'Papeterie', lib: 'le fournisseur de papeterie' },
  { id: 'palettes', quai: 'Q4', de: '08:30', a: '10:00', titre: 'Retour de palettes vides', court: 'Palettes vides', lib: 'le retour de palettes vides' },
];
// La carte à poser (brief §6.1) : un camion d'une heure, entre 9 h et 11 h.
export const CARTE = { id: 'linge', titre: 'Linge de maison — 1 h', court: 'Linge de maison', des: '09:00', avant: '11:00', duree: 60 };
export const ECHELLE = { debut: '06:00', fin: '12:00' };
const nomQuai = (q) => (QUAIS.find((x) => x.id === q) || {}).nom || q;
const minQuai = (q) => nomQuai(q).replace(/^Q/, 'q');   // « quai 2 » dans une phrase

// Les LECTURES, calculées sur une grille (la vraie, ou une grille modifiée par un test). Chaque lecture : { q, choix: [{ v, lib }], juste,
// justes (toutes les valeurs qui répondent à la question sur cette grille : une seule attendue) }.
export function lecturesDe(camions = CAMIONS) {
  const parDebut = camions.slice().sort((a, b) => toMin(a.de) - toMin(b.de));
  const alpha = (L) => L.slice().sort((a, b) => a.lib.localeCompare(b.lib, 'fr'));
  const choixCamions = (justes, cle) => {
    const j = justes[0];
    const autres = camions.filter((c) => c.id !== (j && j.id)).sort((a, b) => cle(a) - cle(b));
    return alpha([j, ...autres.slice(0, 3)].filter(Boolean)).map((c) => ({ v: c.id, lib: c.lib }));
  };
  const havres = camions.filter((c) => c.id === 'havre');
  const H = havres[0] || null;
  const L = {};
  // À quelle heure le camion du Havre est-il attendu ? → son heure d'arrivée ; pièges : les 3 heures d'arrivée de la grille les plus proches.
  {
    const juste = H ? toMin(H.de) : null;
    const debuts = [...new Set(camions.map((c) => toMin(c.de)))].filter((m) => m !== juste);
    const pieges = debuts.sort((a, b) => Math.abs(a - juste) - Math.abs(b - juste) || a - b).slice(0, 3);
    L['l-havre-heure'] = { q: 'À quelle heure le camion du Havre est-il attendu ?', juste: H ? versHHMM(juste) : null,
      justes: havres.map((c) => c.de), choix: [juste, ...pieges].filter((m) => m != null).sort((a, b) => a - b).map((m) => ({ v: versHHMM(m), lib: heureLue(m) })) };
  }
  // À quel quai le camion du Havre se met-il ?
  L['l-havre-quai'] = { q: 'À quel quai le camion du Havre se met-il ?', juste: H ? H.quai : null, justes: havres.map((c) => c.quai),
    choix: QUAIS.map((q) => ({ v: q.id, lib: q.nom })) };
  // Quel camion arrive le premier ce matin ?
  {
    const m0 = parDebut.length ? toMin(parDebut[0].de) : null;
    const justes = camions.filter((c) => toMin(c.de) === m0);
    L['l-premier'] = { q: 'Quel camion arrive le premier ce matin ?', juste: justes[0] ? justes[0].id : null, justes: justes.map((c) => c.id),
      choix: choixCamions(justes, (c) => toMin(c.de)) };
  }
  // Quel quai est libre de 9 h à 10 h ?
  {
    const libres = QUAIS.filter((q) => !camions.some((c) => c.quai === q.id && toMin(c.de) < 600 && toMin(c.a) > 540)).map((q) => q.id);
    L['l-libre-9h'] = { q: 'Quel quai est libre de 9 h à 10 h ?', juste: libres[0] || null, justes: libres, choix: QUAIS.map((q) => ({ v: q.id, lib: q.nom })) };
  }
  // Combien de camions sont prévus au quai 3 ce matin ?
  {
    const n = camions.filter((c) => c.quai === 'Q3').length;
    L['l-q3-combien'] = { q: 'Combien de camions sont prévus au quai 3 ce matin ?', juste: String(n), justes: [String(n)],
      choix: [1, 2, 3, 4].map((k) => ({ v: String(k), lib: String(k) })) };
  }
  // Quel camion libère son quai le dernier ?
  {
    const fin = Math.max(...camions.map((c) => toMin(c.a)));
    const justes = camions.filter((c) => toMin(c.a) === fin);
    L['l-dernier'] = { q: 'Quel camion libère son quai le dernier ?', juste: justes[0] ? justes[0].id : null, justes: justes.map((c) => c.id),
      choix: choixCamions(justes, (c) => -toMin(c.a)) };
  }
  return L;
}

// Le CONTRÔLE de la grille (au chargement : la séance refuse de s'ouvrir s'il rend quelque chose) — chaque lecture a UNE seule bonne réponse,
// et elle est parmi ses choix ; la carte a au moins une place juste ; heures sur la demi-heure, dans l'échelle ; pas deux camions à la fois
// sur un quai.
export function ecartsGrille(camions = CAMIONS) {
  const E = [];
  const L = lecturesDe(camions);
  Object.entries(L).forEach(([id, x]) => {
    if (x.justes.length !== 1) E.push(`lecture ${id} : ${x.justes.length} bonne(s) réponse(s) sur la grille au lieu d'une`);
    else if (!x.choix.some((c) => c.v === x.juste)) E.push(`lecture ${id} : la bonne réponse n'est pas dans les choix`);
    if (x.choix.length !== 4) E.push(`lecture ${id} : ${x.choix.length} choix au lieu de 4`);
    if (new Set(x.choix.map((c) => c.v)).size !== x.choix.length) E.push(`lecture ${id} : deux choix identiques`);
  });
  camions.forEach((c) => {
    [c.de, c.a].forEach((h) => { if (toMin(h) % 30 || toMin(h) < toMin(ECHELLE.debut) || toMin(h) > toMin(ECHELLE.fin)) E.push(`camion ${c.id} : ${h} hors de la demi-heure ou de l'échelle`); });
    if (toMin(c.de) >= toMin(c.a)) E.push(`camion ${c.id} : il repart avant d'arriver`);
    camions.forEach((d) => { if (d !== c && d.quai === c.quai && toMin(d.de) < toMin(c.a) && toMin(d.a) > toMin(c.de) && c.id < d.id) E.push(`camions ${c.id} et ${d.id} en même temps au ${nomQuai(c.quai)}`); });
  });
  if (!placesJustes(camions).length) E.push('la carte « linge de maison » n’a aucune place juste');
  return E;
}
// Les places justes de la carte (quai, heure de début en minutes) : un quai libre pendant l'heure, dans la fenêtre.
export function placesJustes(camions = CAMIONS) {
  const P = [];
  QUAIS.forEach((q) => {
    for (let m = toMin(CARTE.des); m + CARTE.duree <= toMin(CARTE.avant); m += 15) {
      if (!camions.some((c) => c.quai === q.id && toMin(c.de) < m + CARTE.duree && toMin(c.a) > m)) P.push([q.id, m]);
    }
  });
  return P;
}
{ const E = ecartsGrille(); if (E.length) throw new Error(`ENT-8.2 : le planigramme ne tient pas — ${E.join(' ; ')}`); }

export const LECTURES = lecturesDe();
// Ce que le compte rendu dit du camion du Havre : LU dans la grille.
const HAVRE = CAMIONS.find((c) => c.id === 'havre');
export const QUAI_HAVRE = minQuai(HAVRE.quai);                // « quai 2 »
export const HEURE_HAVRE = heureLue(toMin(HAVRE.de));         // « 7 h »

// Le document « Planigramme » : un tableau quais × demi-heures, fabriqué depuis les mêmes données que le planning (jamais recopié).
export function tablePlanigramme(camions, { vide = false } = {}) {
  const d0 = toMin(ECHELLE.debut), d1 = toMin(ECHELLE.fin), n = (d1 - d0) / 30;
  let h = '<tr><th scope="col" class="ac-q">Quai</th>';
  for (let m = d0; m < d1; m += 60) h += `<th scope="col" colspan="2">${heureLue(m)}</th>`;
  h += '</tr>';
  const lignes = QUAIS.map((q) => {
    let s = `<tr><th scope="row" class="ac-q">${ech(q.nom)}</th>`;
    for (let i = 0; i < n;) {
      const m = d0 + i * 30;
      const c = vide ? null : camions.find((x) => x.quai === q.id && toMin(x.de) === m);
      if (c) {
        const span = (toMin(c.a) - toMin(c.de)) / 30;
        s += `<td class="ac-pris" colspan="${span}"><b>${ech(c.court)}</b><br>${heureLue(toMin(c.de))} – ${heureLue(toMin(c.a))}</td>`;
        i += span;
      } else { s += '<td></td>'; i += 1; }
    }
    return `${s}</tr>`;
  }).join('');
  return `<table class="ac-tab ac-pg"><colgroup><col class="ac-q">${'<col>'.repeat(n)}</colgroup><thead>${h}</thead><tbody>${lignes}</tbody></table>`;
}
export const docPlanigramme = (camions = CAMIONS) => `<article class="ac-doc" aria-label="Planigramme du mardi 9 novembre">
    <p class="ac-gros">PLANIGRAMME DE RÉCEPTION</p>
    <p class="ac-st">Entrepôt Action — Geodis, Ensuès-la-Redonne · mardi 9 novembre · une case = une demi-heure</p>
    ${tablePlanigramme(camions)}
    ${PIED(`${PIED_RECONSTITUTION} Camions et horaires construits pour l’exercice.`)}
  </article>`;

// ─────────────────────────────────────────────────────────────── le tirage (brief §6 bis)
export const EQUIPE_CHOIX = [
  { v: 'kevin', lib: 'Kevin, cariste' }, { v: 'moi', lib: 'toi, réceptionnaire' },
  { v: 'samia', lib: 'Samia, cheffe d’équipe' }, { v: 'julie', lib: 'Julie, agent administratif' },
];
// Les tâches (JAMAIS de pièce supprimée ni renumérotée). Construites d'après les métiers vérifiés ; la répartition est construite.
export const BANQUE_TACHES = [
  { id: 't-decharger', difficulte: 'facile', lib: 'Décharger le camion au chariot.', qui: 'kevin' },
  { id: 't-saisir', difficulte: 'facile', lib: 'Saisir la réception dans le WMS.', qui: 'julie' },
  { id: 't-bl', difficulte: 'facile', lib: 'Vérifier le bon de livraison avec le chauffeur.', qui: 'moi' },
  { id: 't-compter', difficulte: 'moyen', lib: 'Compter les cartons d’une palette et regarder leur état.', qui: 'moi' },
  { id: 't-rdv', difficulte: 'moyen', lib: 'Noter au planigramme le rendez-vous d’un fournisseur.', qui: 'julie' },
  { id: 't-ranger', difficulte: 'moyen', lib: 'Amener une palette contrôlée jusqu’au stock.', qui: 'kevin' },
  { id: 't-refuser', difficulte: 'difficile', lib: 'Décider de refuser une palette abîmée.', qui: 'samia' },
  { id: 't-equipe', difficulte: 'difficile', lib: 'Répartir le travail de l’équipe le matin.', qui: 'samia' },
];
export const BANQUE_LECTURES = [
  { id: 'l-havre-heure', difficulte: 'facile' }, { id: 'l-havre-quai', difficulte: 'facile' }, { id: 'l-premier', difficulte: 'facile' },
  { id: 'l-libre-9h', difficulte: 'moyen' }, { id: 'l-q3-combien', difficulte: 'moyen' },
  { id: 'l-dernier', difficulte: 'difficile' },
];
// Les valeurs de la commande : n° tiré, N multiple de 24 entre 720 et 1 440, k multiple de 24 entre 24 et 96 (des cartons par couche).
export const valeursCommande = (h) => ({ numero: h.entier(100000, 999999), N: 24 * h.entier(30, 60), k: 24 * h.entier(1, 4) });
// Contrôle d'équité (vide = conforme) : trois personnes différentes dans le socle des tâches (sinon « tout à Samia » rapporterait), et
// une commande cohérente.
export function ecartsJeu(jeu) {
  const E = [];
  const T = (jeu.pieces && jeu.pieces.taches) || [];
  const qui = new Set(T.map((p) => p && p.qui));
  if (qui.size !== T.length) E.push(`les ${T.length} tâches ne vont pas à ${T.length} personnes différentes`);
  const V = jeu.valeurs || {};
  if (!(V.k > 0 && V.k < V.N)) E.push('k doit être entre 0 et N');
  if (V.N % 24 || V.k % 24 || V.N < 720 || V.N > 1440 || V.k < 24 || V.k > 96) E.push('N et k : multiples de 24, N de 720 à 1 440, k de 24 à 96');
  return E;
}
export const TIRAGE = declarerTirage({
  banques: {
    taches: { pieces: BANQUE_TACHES, melange: { facile: 1, moyen: 1, difficile: 1 }, bonus: { confirme: { moyen: 1 } }, ordre: 'melange' },
    lectures: { pieces: BANQUE_LECTURES, melange: { facile: 1, moyen: 1 }, bonus: { confirme: { difficile: 1 } }, ordre: 'melange' },
  },
  valeurs: valeursCommande,
  verifier: ecartsJeu,
});
TIRAGE.lier(ID);

// Le jeu de l'élève, lu dans sa base. Sans tirage (base vide au chargement, enseignant) : le premier de chaque difficulté, une commande témoin.
const parId = (B, id) => B.find((p) => p.id === id);
export const DEFAUT = { taches: ['t-decharger', 't-compter', 't-refuser'], lectures: ['l-havre-heure', 'l-libre-9h'], valeurs: { numero: 482913, N: 960, k: 48 } };
export const tachesDe = (db) => (TIRAGE.tirage(db) ? TIRAGE.piecesTirees(db, 'taches') : DEFAUT.taches.map((id) => parId(BANQUE_TACHES, id)));
export const tachesBonus = (db) => TIRAGE.piecesBonus(db, 'taches');
export const lecturesTirees = (db) => (TIRAGE.tirage(db) ? TIRAGE.piecesTirees(db, 'lectures') : DEFAUT.lectures.map((id) => parId(BANQUE_LECTURES, id)));
export const lecturesBonus = (db) => TIRAGE.piecesBonus(db, 'lectures');
export function commandeDe(db) {
  const V = TIRAGE.tirage(db) ? TIRAGE.valeursTirees(db) : DEFAUT.valeurs;
  const N = V.N, k = V.k, livre = N - k;
  return { numero: `AC-${V.numero}`, N, k, livre, palettes: Math.ceil(livre / 96), bl: `BL-${String(V.numero).slice(-4)}-09`, lv: `LV-${String(V.numero * 7).slice(-6)}` };
}
const graineDe = (db) => { const r = TIRAGE.tirage(db); return r ? r.graine : ''; };
const melangerPour = (db, quoi, L) => (graineDe(db) ? hasard(`${graineDe(db)}|${quoi}`).melanger(L) : L.slice());

// ─────────────────────────────────────────────────────────────── les documents (reconstitués)
const FOURNISSEUR = 'Vaisselle Lotus';               // nom CONSTRUIT
const TRANSPORTEUR = 'Transports Seine-Provence';    // nom CONSTRUIT
const ARTICLE = 'Assiettes plates en grès, lot de 6';
const n = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const pied = PIED(`${PIED_RECONSTITUTION} Noms du fournisseur et du transporteur construits.`);

const docBonCommande = (db) => { const C = commandeDe(db);
  return `<article class="ac-doc" aria-label="Bon de commande">
    <p class="ac-gros">BON DE COMMANDE</p>
    <p class="ac-st">N° <b>${ech(C.numero)}</b></p>
    <dl class="ac-dl">
      <dt>Acheteur</dt><dd>Action (magasins à petits prix)</dd>
      <dt>Fournisseur</dt><dd>${FOURNISSEUR}</dd>
      <dt>Article</dt><dd>${ARTICLE}</dd>
      <dt>Quantité commandée</dt><dd><b>${n(C.N)} cartons</b></dd>
      <dt>Livrer à</dt><dd>Entrepôt Action — Geodis, Ensuès-la-Redonne</dd>
      <dt>Livraison prévue</dt><dd>mardi 9 novembre</dd>
    </dl>
    ${pied}
  </article>`; };
const docBonLivraison = (db) => { const C = commandeDe(db);
  return `<article class="ac-doc" aria-label="Bon de livraison">
    <p class="ac-gros">BON DE LIVRAISON</p>
    <p class="ac-st">N° <b>${ech(C.bl)}</b> · de ${FOURNISSEUR}</p>
    <dl class="ac-dl">
      <dt>Client</dt><dd>Action — entrepôt d’Ensuès-la-Redonne</dd>
      <dt>Votre commande</dt><dd>${ech(C.numero)}</dd>
      <dt>Article</dt><dd>${ARTICLE}</dd>
      <dt>Quantité livrée</dt><dd><b>${n(C.livre)} cartons</b></dd>
    </dl>
    <p class="ac-st"><b>Réserves</b> (à écrire par le réceptionnaire)</p>
    <div class="ac-res" aria-label="Case réserves, vide"></div>
    <p class="ac-st">Signature du réceptionnaire :</p>
    <div class="ac-res" aria-label="Case signature, vide"></div>
    ${pied}
  </article>`; };
const docLettreVoiture = (db) => { const C = commandeDe(db);
  return `<article class="ac-doc" aria-label="Lettre de voiture">
    <p class="ac-gros">LETTRE DE VOITURE</p>
    <p class="ac-st">N° <b>${ech(C.lv)}</b> · transport par route</p>
    <dl class="ac-dl">
      <dt>Transporteur</dt><dd>${TRANSPORTEUR}</dd>
      <dt>Expéditeur</dt><dd>Hub d’import Action, Gonfreville-l’Orcher (port du Havre)</dd>
      <dt>Destinataire</dt><dd>Entrepôt Action / Geodis, Ensuès-la-Redonne</dd>
      <dt>Marchandise</dt><dd>Vaisselle, ${C.palettes} palettes</dd>
      <dt>Date</dt><dd>mardi 9 novembre</dd>
    </dl>
    ${pied}
  </article>`; };

// « Le droit » : textes RECOPIÉS de Légifrance le 15/10/2026 (identifiants dans l'en-tête). Exporté pour les séances d'Action qui suivront.
export const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-gros">LE DROIT</p>
    <p class="ac-st">Deux textes du Code du travail, deux textes du Code civil</p>
    <p><b>Code du travail, article L4111-5</b> (santé et sécurité au travail)</p>
    <p class="ac-cite">« Pour l’application de la présente partie, les travailleurs sont les salariés, y compris temporaires, et les stagiaires, ainsi que toute personne placée à quelque titre que ce soit sous l’autorité de l’employeur. »</p>
    <p><b>Code du travail, article L4141-1</b> (1er alinéa)</p>
    <p class="ac-cite">« L’employeur organise et dispense une information des travailleurs sur les risques pour la santé et la sécurité et les mesures prises pour y remédier. »</p>
    <p><b>Code civil, article 1603</b> (il = le vendeur)</p>
    <p class="ac-cite">« Il a deux obligations principales, celle de délivrer et celle de garantir la chose qu’il vend. »</p>
    <p><b>Code civil, article 1604</b></p>
    <p class="ac-cite">« La délivrance est le transport de la chose vendue en la puissance et possession de l’acheteur. »</p>
    ${PIED('Textes réels, recopiés de Légifrance (consulté le 15/10/2026).')}
  </article>` };

// Pour « Avant de commencer » : un planigramme VIDE (aucun camion de la séance) et le contexte du stage.
const DOC_PLANIGRAMME_VIDE = { id: 'planigramme-vide', titre: 'Un planigramme (vide)', court: 'Un planigramme',
  html: `<article class="ac-doc" aria-label="Un planigramme vide">
    <p class="ac-gros">PLANIGRAMME DE RÉCEPTION</p>
    <p class="ac-st">Exemple vide : chaque camion prévu prend une case à son quai, de son heure d’arrivée à son heure de départ.</p>
    ${tablePlanigramme([], { vide: true })}
    ${PIED('Document pédagogique — modèle construit pour l’exercice.')}
  </article>` };
const DOC_STAGE = { id: 'stage', titre: 'Ton stage à la réception', court: 'Ton stage',
  html: `<article class="ac-doc" aria-label="Ton stage à la réception">
    <p class="ac-t">Ton stage à la réception</p>
    <p class="ac-st">Mardi 9 novembre, 6 h</p>
    <p>Tu es en stage (PFMP) chez <b>Geodis</b>, à l’entrepôt Action d’Ensuès-la-Redonne. Aujourd’hui, tu tiens le poste de <b>réception</b>.</p>
    <p>Ta [[tutrice]] : <b>Samia</b>. Avec toi : <b>Kevin</b> et <b>Julie</b>.</p>
    ${figure('colis')}
    ${PIED('Samia, Kevin et Julie sont construits pour l’exercice.')}
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.ac-gros{margin:0 0 4px; font-size:1.55rem; font-weight:900; letter-spacing:.05em}
.ac-dl{display:grid; grid-template-columns:max-content 1fr; gap:5px 14px; margin:6px 0 12px; font-size:1rem}
.ac-dl dt{font-weight:700}
.ac-dl dd{margin:0}
.ac-tab{border-collapse:collapse; width:100%; margin:6px 0 10px; font-size:.8rem; table-layout:fixed}
.ac-tab th,.ac-tab td{border:1px solid #b9b3a6; padding:3px 4px; text-align:center; vertical-align:middle}
.ac-tab th.ac-q,.ac-tab col.ac-q{width:58px}
.ac-tab td.ac-pris{background:rgba(85,80,71,.16); line-height:1.15; font-size:.74rem}
.ac-tab td{height:42px}
.ac-res{border:1.5px solid #555047; min-height:40px; margin:2px 0 8px; border-radius:2px}
.ac-cite{margin:2px 0 10px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
`;
export const DOCUMENTS = [
  { id: 'planigramme-doc', titre: 'Planigramme du mardi 9 novembre', court: 'Planigramme', html: () => docPlanigramme() },
  { id: 'bon-commande', titre: 'Bon de commande', court: 'Bon de commande', html: docBonCommande },
  { id: 'bon-livraison', titre: 'Bon de livraison', court: 'Bon de livraison', html: docBonLivraison },
  { id: 'lettre-voiture', titre: 'Lettre de voiture', court: 'Lettre de voiture', html: docLettreVoiture },
  DOC_DROIT, DOC_PLANIGRAMME_VIDE, DOC_STAGE,
];

// ─────────────────────────────────────────────────────────────── ① la visite de la réception (plan CONSTRUIT)
// Le moteur exige au moins une allée avec ses côtés : deux allées de racks à un niveau (« le stock », où partent les palettes contrôlées),
// pour que le plan soit assez large pour quatre quais. Les zones nommées s'empilent à droite des racks (litiges, bureau, vestiaire, contrôle,
// réception) ; les quais sont sur le mur du bas (le moteur les dessine ainsi).
export const ZONES_RECEPTION = {
  litiges: ['L1', 'L2'], bureau: 'cheffe d’équipe et administratif', quais: QUAIS.map((q) => q.nom),
  vestiaire: { note: 'EPI : chaussures, gilet, gants' }, controle: { note: 'compter, regarder l’état' },
};
export const PLAN_RECEPTION = {
  allees: [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],
  cotes: { A1: { gammes: [] }, A2: { gammes: [] }, B1: { gammes: [] }, B2: { gammes: [] } },
  travees: 4, niveaux: 1, emplacements: 1,
  zones: ZONES_RECEPTION,
};
const AUTRE = 'Photo d’un autre entrepôt — ';
export const IMAGES_VISITE = {
  quai: { src: PHOTOS.quai.src, repere: [1200, 801], alt: PHOTOS.quai.alt, mention: PHOTOS.quai.mention },
  vestiaire: { src: PHOTOS.vestiaire.src, repere: [1200, 807], alt: PHOTOS.vestiaire.alt, mention: PHOTOS.vestiaire.mention },
  reception: { src: PHOTOS.colis.src, repere: [1200, 800], alt: PHOTOS.colis.alt, mention: PHOTOS.colis.mention },
  controle: { src: PHOTOS.palette.src, repere: [740, 1040], alt: PHOTOS.palette.alt, mention: PHOTOS.palette.mention },
  litiges: { src: './contenus/smoby/visite/visite-litiges-dessin.jpg', repere: [1280, 854],
    alt: 'Dessin d’une zone litiges : marquage au sol, panneau, deux emplacements, palettes bloquées', mention: 'Dessin : ce qu’on doit voir dans une zone litiges.' },
  bureau: { src: './contenus/smoby/visite/visite-bureau-pexels-7658310.jpg', repere: [1280, 854],
    alt: 'Un bureau : une grande table, des écrans, des classeurs et des papiers', mention: `${AUTRE}Pavel Danilyuk / Pexels` },
};
export const VISITE = {
  id: VISITE_ID, libelle: 'Visite de la réception', mode: 'visite',
  premierEssai: true,
  plan: PLAN_RECEPTION,
  zones: { reception: { note: 'palettes déchargées' } },
  personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'mardi 9 novembre' },
  images: IMAGES_VISITE,
  etapes: [
    { id: 'accueil', type: 'accueil', titre: 'Accueil', heure: '6:00', image: 'quai',
      texte: 'Bienvenue ! On fait le tour de la réception. Ensuite, tu tiens ton poste.',
      consigne: 'Lis le message de Samia, puis clique <b>Suivant</b>.',
      surTitre: 'Action · entrepôt Geodis d’Ensuès-la-Redonne',
      grandTitre: 'Bienvenue à la réception',
      intro: 'Mardi 9 novembre, 6 h. Samia, ta tutrice, te montre ton poste.',
      programme: ['Suivre le tour de la réception sur le plan', 'Reconnaître chaque endroit sur une photo'],
      encadre: 'Les photos viennent <b>d’autres entrepôts</b>. Le plan est <b>construit pour l’exercice</b>.' },
    { id: 'parcours', type: 'parcours', titre: 'Le tour', heure: '6:05',
      texte: 'Suis-moi : je te montre où travaille chacun.',
      aide: 'Ouvre les étapes du tour, dans l’ordre.',
      consigne: 'Clique les étapes du tour <b>dans l’ordre</b>, sur le plan.',
      consigneFini: 'Le tour est fini. Clique <b>Suivant</b>.',
      debut: 'Commence par l’étape <b>n° 1</b>.',
      ordreMsg: 'Dans l’ordre : l’étape suivante est la n° {n}.',
      etapes: [
        { n: 1, ancre: 'zone:vestiaire', titre: 'Vestiaire et EPI', images: ['vestiaire'], dir: 0, cone: 50,
          texte: 'Tout le monde passe ici d’abord : chaussures de sécurité, gilet, gants. Personne n’entre sur le [[quai]] sans.' },
        { n: 2, ancre: 'quai:Quai 2', titre: 'Les quais', images: ['quai'], dir: 90, cone: 34,
          texte: 'Les camions s’y mettent à quai. Kevin, le cariste, les décharge au chariot.' },
        { n: 3, ancre: 'zone:reception', titre: 'Zone de réception', images: ['reception'], dir: 0, cone: 50,
          texte: 'Les palettes déchargées attendent ici. Les [[réceptionnaire|réceptionnaires]] (ton poste aujourd’hui) vérifient le [[bon de livraison]].' },
        { n: 4, ancre: 'zone:controle', titre: 'Zone de contrôle', images: ['controle'], dir: 0, cone: 50,
          texte: 'On compte les cartons et on regarde leur état avant de les ranger.' },
        { n: 5, ancre: 'zone:litiges', titre: 'Zone litiges', images: ['litiges'], dir: 0, cone: 50,
          texte: 'Ce qui pose problème (abîmé, en trop, pas commandé) est mis de côté ici, avec une étiquette.' },
        { n: 6, ancre: 'zone:bureau', titre: 'Bureau de la réception', images: ['bureau'], dir: 0, cone: 50,
          texte: 'Samia, cheffe d’équipe, organise le travail et décide en cas de problème. Julie, agent administratif, tient le [[planigramme]] et saisit les réceptions dans le [[WMS]].' },
      ] },
    { id: 'reperer', type: 'associer', titre: 'Où est-ce ?', heure: '6:15', parcours: 'parcours',
      texte: 'À toi. Je te montre une photo : dis-moi à quel endroit du tour elle a été prise.',
      aide: 'Associe chaque photo à son endroit.',
      liste: 'Les photos',
      consigne: 'Où est-ce ? <b>Clique son numéro sur le plan.</b>',
      consigneFini: 'Toutes les photos sont associées. Clique <b>Suivant</b>.',
      juste: 'Oui : n° {n}, {titre}.',
      faux: 'Non, pas le n° {n}. Regarde bien la photo, ou revois le tour.',
      photos: [{ id: 'quai', image: 'quai', n: 2 }, { id: 'bureau', image: 'bureau', n: 6 }, { id: 'vestiaire', image: 'vestiaire', n: 1 },
        { id: 'reception', image: 'reception', n: 3 }] },
  ],
  fin: { titre: 'Fin', heure: '6:20', image: 'quai', texte: 'Tu connais la réception. Maintenant, l’équipe.', consigne: 'La visite est terminée.',
    grandTitre: 'Fin de la visite' },
};

// ─────────────────────────────────────────────────────────────── ② « Qui fait quoi ? »
export const FICHE_QUI = {
  id: FICHES.qui, libelle: 'Qui fait quoi ?', titre: 'Qui fait quoi à la réception ?',
  sousTitre: 'Pour chaque tâche, choisis qui la fait.',
  bouton: 'Ouvrir la fiche « Qui fait quoi ? »',
  quand: (db) => geste(db, `entrepot:${VISITE_ID}:visite:fin`) || envoyee(db, FICHES.qui),
  blocs: (db) => [...tachesDe(db), ...tachesBonus(db)].map((p) => ({ type: 'liste', id: p.id, lib: p.lib, vide: 'Choisir…', choix: EQUIPE_CHOIX,
    manque: `qui doit « ${p.lib.replace(/\.$/, '')} »` })),
  envoi: { bouton: 'Envoyer la fiche à Samia', a: 'Samia', suite: 'Julie va t’écrire.' },
};

// ─────────────────────────────────────────────────────────────── ③ « Lire le planigramme » et le planning des quais
export const FICHE_LIRE = {
  id: FICHES.lire, libelle: 'Lire le planigramme', titre: 'Lire le planigramme',
  sousTitre: 'Le planigramme est à gauche. Réponds aux questions de Julie.',
  documents: ['planigramme-doc'], largeurDocs: 1.3,
  bouton: 'Ouvrir la fiche « Lire le planigramme »',
  quand: dejaEnvoyee(FICHES.qui),
  blocs: (db) => [...lecturesTirees(db), ...lecturesBonus(db)].map((p) => { const L = LECTURES[p.id];
    return { type: 'liste', id: p.id, lib: L.q, vide: 'Choisir…', choix: L.choix, manque: 'une réponse' }; }),
  envoi: { bouton: 'Envoyer la fiche à Julie', a: 'Julie', suite: 'Regarde tes messages.' },
};
export const PLANNING = {
  id: PLANNING_ID, libelle: 'Planning des quais', titre: 'Planning des quais — mardi 9 novembre', date: 'Mardi 9 novembre',
  quand: (db) => dejaEnvoyee(FICHES.lire)(db),
  infos: () => ['Le fournisseur de linge de maison demande <b>une heure</b>, <b>entre 9 h et 11 h</b>.',
    'Un quai ne reçoit qu’un camion à la fois : les blocs gris pointillés sont déjà pris.'],
  echelle: { type: 'heures', debut: ECHELLE.debut, fin: ECHELLE.fin, pas: 15 },
  lignes: { titre: 'Quais de réception', liste: QUAIS.map((q) => ({ id: q.id, nom: q.nom,
    occupe: CAMIONS.filter((c) => c.quai === q.id).map((c) => ({ de: c.de, a: c.a, titre: c.titre })) })) },
  cartes: { titre: 'Le camion à placer',
    liste: [{ id: CARTE.id, titre: CARTE.titre, court: CARTE.court, famille: 'linge', des: CARTE.des, avant: CARTE.avant }],
    details: () => [], duree: () => CARTE.duree, nonPosees: () => 'Le camion de linge de maison n’est pas encore posé.', legende: ' ' },
  familles: { linge: { couleur: '#8b5cf6', nom: 'violet', legende: 'linge de maison' } },
  regles: [
    { id: 'quai', type: 'unAlaFois', sur: 'ligne' },
    { id: 'fenetre', type: 'fenetre', message: { debut: () => 'Le camion arrive avant 9 h.', fin: () => 'Le camion finit après 11 h.' } },
  ],
  jalons: [{ id: 'quai-libre', lib: 'Le camion sur un quai libre', regles: ['quai'] },
    { id: 'creneau', lib: 'Le camion dans le créneau demandé', regles: ['fenetre'] }],
  aides: { consignes: { regles: 'Glisse le camion sur un quai, à l’heure où il arrive (ou clique-le, puis clique la case). Puis envoie le planning.' } },
};

// ─────────────────────────────────────────────────────────────── ④ les documents du camion, « Avant d'ouvrir le camion »
export const CHOIX_DOCS = [{ v: 'commande', lib: 'le bon de commande' }, { v: 'livraison', lib: 'le bon de livraison' },
  { v: 'voiture', lib: 'la lettre de voiture' }, { v: 'facture', lib: 'la facture' }];
export const LIGNES_DOCS = [
  { id: 'commande', lib: 'Quel document dit ce qu’Action a commandé ?', juste: 'commande' },
  { id: 'livraison', lib: 'Quel document dit ce que le camion apporte ?', juste: 'livraison' },
  { id: 'transport', lib: 'Quel document dit qui transporte la marchandise ?', juste: 'voiture' },
];
export const FICHE_DOCS = {
  id: FICHES.docs, libelle: 'Les documents du camion', titre: 'Les documents du camion',
  sousTitre: 'Les trois documents sont à gauche. Dis à quoi sert chacun.',
  documents: ['bon-commande', 'bon-livraison', 'lettre-voiture'],
  bouton: 'Ouvrir la fiche « Les documents du camion »',
  quand: (db) => !!(db && db.plannings && db.plannings[PLANNING_ID] && db.plannings[PLANNING_ID].v1) || geste(db, `planning:${PLANNING_ID}:envoyer`) || envoyee(db, FICHES.docs),
  blocs: (db) => LIGNES_DOCS.map((l) => ({ type: 'liste', id: l.id, lib: l.lib, vide: 'Choisir…', choix: melangerPour(db, 'documents', CHOIX_DOCS), manque: 'un document' })),
  envoi: { bouton: 'Envoyer la fiche à Samia', a: 'Samia', suite: 'Ouvre maintenant la fiche « Avant d’ouvrir le camion ».' },
};
export const CASES_AVANT = [
  { v: 'epi', lib: 'Mes EPI (chaussures de sécurité, gilet)', juste: true },
  { v: 'transpalette', lib: 'Un transpalette électrique chargé', juste: true },
  { v: 'quai', lib: 'Un quai libre et préparé', juste: true },
  { v: 'bl', lib: 'Le bon de livraison du camion', juste: true },
  { v: 'cle', lib: 'La clé du magasin de Nîmes', juste: false },
  { v: 'carte-grise', lib: 'La carte grise de ma voiture', juste: false },
  { v: 'conges', lib: 'Le planning des congés', juste: false },
];
export const FICHE_AVANT = {
  id: FICHES.avant, libelle: 'Avant d’ouvrir le camion', titre: 'Avant d’ouvrir le camion',
  sousTitre: 'Coche ce qu’il te faut avant d’ouvrir le camion.',
  bouton: 'Ouvrir la fiche « Avant d’ouvrir le camion »',
  quand: dejaEnvoyee(FICHES.docs),
  blocs: (db) => [{ type: 'cases', id: 'avant', choix: melangerPour(db, 'avant', CASES_AVANT).map((c) => ({ v: c.v, lib: c.lib })) }],
  envoi: { bouton: 'Envoyer la fiche à Samia', a: 'Samia', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ⑤ rendre compte (phrases à choisir, valeurs LUES dans la grille)
const autresQuais = QUAIS.filter((q) => q.id !== HAVRE.quai);
const PIEGES_QUAI = [autresQuais[0], autresQuais[autresQuais.length - 1]].map((q) => minQuai(q.id));            // quai 1, quai 4
const PIEGES_HEURE = [...new Set(CAMIONS.map((c) => toMin(c.de)))].filter((m) => m > toMin(HAVRE.de)).sort((a, b) => a - b).slice(0, 2).map(heureLue);   // 8 h 30, 9 h
const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const phrasesCompteRendu = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: ['Bonjour Samia,', 'Salut ma grande,', 'Madame la directrice,'], juste: 0 },
  { id: 'quai', choix: [QUAI_HAVRE, ...PIEGES_QUAI].map((q) => `${majuscule(q)} est prêt pour le camion du Havre.`), juste: 0 },
  { id: 'heure', choix: [HEURE_HAVRE, ...PIEGES_HEURE].map((h) => `Le camion est attendu à ${h}.`), juste: 0 },
  { id: 'manque', choix: [`Il manque un transpalette chargé : Kevin a mis celui du ${QUAI_HAVRE} en charge.`, 'Il ne manque rien.', 'Il manque la clé du magasin.'], juste: 0 },
  { id: 'fin', choix: [`Je t’attends au quai. ${prenom}`, 'Bisous', 'À plus.'], juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── les messages
const SAMIA = { nom: EQUIPE.samia.nom, mail: mailDe('samia') };
const KEVIN = { nom: EQUIPE.kevin.nom, mail: mailDe('kevin') };
const JULIE = { nom: EQUIPE.julie.nom, mail: mailDe('julie') };
const FOURN = { nom: 'Fournisseur de linge de maison', mail: 'transport@fournisseur-linge.example' };
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '06:00', { db: o.db, decalage: o.decalage || 0 }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const merci = (de) => (prenom, nb, db) => ({ mails: [mail(prenom, de, 'Bien reçu', `Bien reçu, merci.\n\n${de.nom}`, { db, heure: '06:58' })] });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, SAMIA, 'Ta prise de poste',
      `Bonjour ${prenom} !\n\nAujourd’hui, tu tiens le poste de réception. Je te donne d’abord les consignes, ensuite tu travailles seul ; je reste ta [[tutrice]], tu me [[rendre compte|rends compte]].\n\n`
        + 'On commence par un tour de la réception. Ouvre « Visite de la réception ».\n\nSamia'),
  ] }),
  // « Corriger » : un accusé à chaque renvoi, jamais « juste ».
  corrections: { [FICHES.qui]: merci(SAMIA), [FICHES.lire]: merci(JULIE), [FICHES.docs]: merci(SAMIA), [FICHES.avant]: merci(SAMIA), [PHRASES_ID]: merci(SAMIA) },
  declencheurs: [
    { id: 'equipe', quand: apresGeste(`entrepot:${VISITE_ID}:visite:fin`),
      semer: (prenom, db) => ({ mails: [mail(prenom, SAMIA, 'L’équipe de la réception',
        'Voici l’équipe de la réception. Pour chaque tâche, choisis qui la fait, puis renvoie-moi la fiche.\n\nSamia',
        { db, heure: '06:20', extra: { ouvreFiche: FICHES.qui } })] }) },
    { id: 'planigramme', quand: apresFiche(FICHES.qui),
      semer: (prenom, db) => ({ mails: [mail(prenom, JULIE, 'Le planigramme de ce matin',
        `Salut ${prenom}, voici le [[planigramme]] de ce matin. Lis-le et réponds à mes questions.\n\nJulie`,
        { db, heure: '06:25', extra: { pieces: ['planigramme-doc'], ouvreFiche: FICHES.lire } })] }) },
    { id: 'fournisseur', quand: apresFiche(FICHES.lire),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, FOURN, 'Demande de créneau — linge de maison',
          'Bonjour,\n\nnous avons un camion de linge de maison pour Action Ensuès. Pouvez-vous nous donner un [[créneau]] d’une heure entre 9 h et 11 h ce matin ?\n\nMerci.\n\n'
            + 'Le service transport d’un fournisseur européen', { db, heure: '06:30' }),
        mail(prenom, JULIE, 'Le camion de linge de maison',
          'Place ce camion sur le planning des quais (menu « Planning des quais »), puis envoie-le-moi.\n\nJulie', { db, heure: '06:31' }),
      ] }) },
    { id: 'documents', quand: apresPlanning(PLANNING_ID),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, JULIE, 'Le planning des quais', 'Merci, je préviens le fournisseur.\n\nJulie', { db, heure: '06:40' }),
        mail(prenom, SAMIA, 'Les documents du camion du Havre',
          'Le camion du Havre arrive bientôt. Voici ses trois documents. Dis-moi à quoi sert chacun.\n\nJe te joins aussi « Le droit » : quatre textes à connaître.\n\nSamia',
          { db, heure: '06:41', extra: { pieces: ['bon-commande', 'bon-livraison', 'lettre-voiture', 'droit'], ouvreFiche: FICHES.docs } }),
      ] }) },
    { id: 'compte-rendu', quand: apresFiche(FICHES.avant),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, KEVIN, 'Le transpalette', `Salut ! Le [[transpalette]] du ${QUAI_HAVRE} était déchargé : je l’ai mis en charge.\n\nKevin`, { db, heure: '06:50' }),
        mail(prenom, SAMIA, 'Rends-moi compte',
          'Avant que le camion arrive, [[rendre compte|rends-moi compte]] : le quai, l’heure du camion, ce qui manque.\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nSamia',
          { db, heure: '06:51', extra: { phrases: phrasesCompteRendu(prenom) } }),
      ] }) },
    { id: 'fin', quand: apresMail({ a: SAMIA.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, SAMIA, 'Le camion arrive', `Merci ${prenom}. Le camion arrive : on décharge ensemble.\n\nSamia`, { db, heure: '06:57' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 15/10/2026 à 19 h 18, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant l'envoi (fiches, planning, phrases) ni avant le premier essai
// (visite) : l'inaction vaut 0.
export const GROUPES = { visite: 'Repérer mon poste', qui: 'Qui fait quoi ?', planigramme: 'Le planigramme', docs: 'Les documents du camion',
  compte: 'Rendre compte' };
const jalonsVisite = etapesEntrepot(VISITE).map((e) => { delete e.ecran; return Object.assign(e, { groupe: GROUPES.visite, poids: 0.75 }); });
const jalonListe = (id, titre, groupe, ficheId, piece) => ({ id, titre, groupe, poids: 1, ecran: `fiche:${ficheId}`,
  verifier(db) { if (!envoyee(db, ficheId)) return attente; const p = piece(db); return p && valeurDe(db, ficheId, p.id) === p.juste ? ok : ko; } });
const tacheRang = (k) => (db) => { const p = tachesDe(db)[k]; return p && { id: p.id, juste: p.qui }; };
const lectureRang = (k) => (db) => { const p = lecturesTirees(db)[k]; return p && { id: p.id, juste: LECTURES[p.id].juste }; };
const bonus = (id, titre, ficheId, liste, juste) => ({ id, titre, bonus: true,
  verifier(db) { const B = liste(db); if (!B.length) return null; if (!envoyee(db, ficheId)) return attente;
    return B.every((p) => valeurDe(db, ficheId, p.id) === juste(p)) ? ok : ko; } });
const casesCochees = (db) => { const v = valeurDe(db, FICHES.avant, 'avant'); return Array.isArray(v) ? v : []; };
export const avantJuste = (coches) => CASES_AVANT.every((c) => c.juste === coches.includes(c.v));
const ligneCR = (id, titre, lignes, poids) => ({ id, titre, groupe: GROUPES.compte, poids, ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return lignes.every((l) => r.justes.includes(l)) ? ok : ko; } });

export const ETAPES = [
  ...jalonsVisite,
  ...[0, 1, 2].map((k) => jalonListe(`tache-${k + 1}`, `Qui fait quoi : la tâche n° ${k + 1}`, GROUPES.qui, FICHES.qui, tacheRang(k))),
  ...[0, 1].map((k) => jalonListe(`lecture-${k + 1}`, `Le planigramme : la lecture n° ${k + 1}`, GROUPES.planigramme, FICHES.lire, lectureRang(k))),
  ...etapesPlanning(PLANNING).map((e) => Object.assign(e, { titre: e.id === 'v1-quai-libre' ? 'Le planning : le camion sur un quai libre' : 'Le planning : le camion dans le créneau demandé',
    groupe: GROUPES.planigramme, poids: 1, ecran: `planning:${PLANNING_ID}` })),
  ...LIGNES_DOCS.map((l) => jalonListe(`doc-${l.id}`, `Les documents : « ${l.lib} »`, GROUPES.docs, FICHES.docs, () => ({ id: l.id, juste: l.juste }))),
  { id: 'avant-ouvrir', titre: 'Avant d’ouvrir le camion : ce qu’il faut, rien de trop', groupe: GROUPES.docs, poids: 1, ecran: `fiche:${FICHES.avant}`,
    verifier: (db) => (!envoyee(db, FICHES.avant) ? attente : avantJuste(casesCochees(db)) ? ok : ko) },
  ligneCR('cr-contenu', 'Le compte rendu : le quai, l’heure du camion et ce qui manque', ['quai', 'heure', 'manque'], 1),
  ligneCR('cr-salutation', 'Le compte rendu : la salutation', ['salutation'], 0.5),
  ligneCR('cr-fin', 'Le compte rendu : la fin du message', ['fin'], 0.5),
  // Les cas bonus du confirmé (sans poids ni groupe, cachés à l'élève) : `null` chez qui ne les a pas reçus.
  bonus('bonus-tache', 'Qui fait quoi : une tâche de plus', FICHES.qui, tachesBonus, (p) => p.qui),
  bonus('bonus-lecture', 'Le planigramme : une lecture de plus', FICHES.lire, lecturesBonus, (p) => LECTURES[p.id].juste),
];

// ─────────────────────────────────────────────────────────────── pastilles, lexique, accueil, options
export const PASTILLES = [
  { libelle: 'Visite', fait: (db) => geste(db, `entrepot:${VISITE_ID}:visite:fin`) },
  { libelle: 'Qui fait quoi ?', fait: dejaEnvoyee(FICHES.qui) },
  { libelle: 'Planigramme', fait: (db) => dejaEnvoyee(FICHES.lire)(db) && !!(db.plannings && db.plannings[PLANNING_ID] && db.plannings[PLANNING_ID].v1) },
  { libelle: 'Documents', fait: (db) => dejaEnvoyee(FICHES.docs)(db) && dejaEnvoyee(FICHES.avant)(db) },
  { libelle: 'Compte rendu', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const LEXIQUE_82 = {
  ...LEXIQUE,
  cariste: 'Personne qui conduit un chariot élévateur pour charger, décharger et ranger les palettes.',
  'cheffe d’équipe': 'Personne qui organise le travail d’une équipe et décide en cas de problème.',
  délivrer: 'Pour un vendeur : livrer à l’acheteur la chose vendue, celle qui a été commandée.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), le hub d’import du Havre, le Code du travail et le '
  + 'Code civil. Construit : le plan de la réception, le planigramme et ses camions, les trois documents et leurs noms d’entreprises, Samia, Kevin et Julie.';
export const ACCUEIL = {
  titre: 'Ma prise de poste à la réception',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Repérer mon poste', 'Menu Visite de la réception.'],
    ['② Qui fait quoi ?', 'La fiche arrive après la visite.'],
    ['③ Le planigramme', 'Julie t’envoie le planigramme. Ensuite, un camion à placer sur le planning des quais.'],
    ['④ Les documents du camion', 'Samia t’envoie les trois documents.'],
    ['⑤ Rendre compte', 'Réponds à Samia, une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'La visite et les questions de Samia se jouent au premier essai : elles ne se rejouent pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 2 : ma prise de poste',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_82,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_QUI, FICHE_LIRE, FICHE_DOCS, FICHE_AVANT],
  planning: PLANNING,
  entrepot: VISITE,
  pastilles: PASTILLES,
  equipe: EQUIPE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
};
