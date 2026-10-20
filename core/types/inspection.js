// Vue « Inspection du poste » — avant tout camion, l'élève regarde son poste et son engin, repère ce qui ne va pas et le
// signale. Chantier Transports Pelleau, lot G-5 (19/10/2026) : la logique de la maquette validée par Tristan à l'écran
// (`outils/essai-inspection-poste.html`, lot B, retours du 19/10/2026) DÉPLACÉE ici, pas réécrite ; puis la vue branchée dans le
// moteur d'entreprise. Brief `docs/briefs/MOTEUR-inspection-poste.md`, décisions `docs/briefs/COORDINATION-pelleau.md` §2 (1 à 8).
// Rien de Pelleau ici : la séance déclare ses points, la vue fournit la scène, les gestes, les jalons.
//
// Ce que la séance déclare (option `inspection` de `creerEntreprise`) :
//   inspection: {
//     id: 'pelleau-poste-102',               // un id par séance (état : db.inspections[<séance>][<id>])
//     libelle: 'Mon poste',                  // l'entrée du menu (défaut : « Mon poste »)
//     qui: 'Erwan',                          // « Signaler à Erwan » (défaut : « ton chef d'équipe »)
//     consigne: 'Regarde ton poste et ton transpalette. Clique ce qui ne va pas, puis signale-le à Erwan.',
//     vues: ['charge', 'quai'],              // ordre d'affichage (défaut : les deux)
//     points: [
//       { id: 'tp1', objet: 'transpalette', n: 1, etat: 'ok', ok: true, lib: 'Transpalette n° 1 en ordre' },
//       { id: 'tp2-fourche', objet: 'transpalette', n: 2, etat: 'fourcheTordue', ok: false, lib: 'Fourche tordue…', repare: '…' },
//       { id: 'extincteur', objet: 'extincteur', etat: 'absent', ok: false, reparable: false, lib: '…', repare: '…' },
//       { id: 'plan', objet: 'affichage', etat: 'affiche', ok: true, lib: 'Plan de circulation affiché' },
//     ],
//     essai: { objet: 'transpalette', n: 2, resultat: 'muet' },   // ou une liste ; un bouton « Essayer l'avertisseur du n° 2 »
//     arret: true,                           // true, false ou le texte de l'arrêt (guidage seulement)
//     commencer: 'C’est bon, je prends mon poste',
//     signaler: { rien, fin, vide, deja, note, reponse },   // facultatif : les répliques du collègue ; `reponse` = LA phrase unique (voir `signaler`)
//     bilan: '…',                            // phrase au bilan de la vue si un jalon est faux
//   }
// ou une FONCTION de la graine (modèle du quai tiré) : `inspection: (graine, { niveau, copie }) => ({ … })`, mêmes `id`, même nombre de
// défauts et d'essais pour toutes les graines (les jalons de la k-ième place se lisent sur le jeu de la base de l'élève).
//
// Objets (kit `core/iso.js`) : `transpalette` (vue « charge », n° 1 ou 2, états ok · fourcheTordue · roueAbimee · batterie ·
// arretUrgence · fuite · avertisseur — ce dernier ne se voit pas, seulement à l'essai), `extincteur` (vue « quai », present · absent),
// `affichage` (vue « quai », affiche · absent). La borne de charge est un décor.
//
// L'état, rangé par le moteur dans la base de l'élève, cloisonné par séance : `db.inspections[<séance>][<id>]` =
//   { marques: [{ n, vue, x, y, point, envoi }], compteur, signaux: [{ points, marques, apresArret }], essais: [n…], arrete, fait, chef }
// L'état DESSINÉ des objets se calcule (`etatsInspection`), il n'est jamais rangé.
//
// Les gestes publiés (questions au fil, messages déclenchés) : `inspection:<id>:signaler` (chaque envoi réel), `inspection:<id>:essai`
// (le premier essai d'un avertisseur ; seulement si un essai est déclaré), `inspection:<id>:fini` (le figeage « C'est bon », pas l'arrêt).
// Déclencheur : `inspectionFinie('<id>')` (core/declencheurs.js).
//
// API reçue du moteur : { db, seance, estProf, signal(nom), gele(), figee, sauver() }.
//
// REPRIS DU QUAI (core/types/quai.js, inspection sur la scène, D-4) — même algorithme, propre à cette vue, et pourquoi (choix
// du lot G-5, §5 du brief) : `pointTouche` / `zonesScene` du quai sont liés au camion (`boitesCamion`, `OBJETS_SCENE`) ;
// `signalerScene`, `validerScene`, `jalonsScene` sont des fonctions internes de `creerQuai` (fermeture sur son état `db.quais[id]`) :
// les exporter demanderait de les sortir de la fermeture, donc de changer `quai.js` au-delà d'un `export`. Rien n'est importé du quai.
// DIFFÉRENCE voulue (Tristan, 19/10/2026) : un clic qui ne touche aucun objet ne pose RIEN (le quai fait de même depuis le 20/10/2026).

import { projection, boiteEcran, solQuai, murQuai, transpaletteElectrique, boitesTranspalette, ETATS_TRANSPALETTE,
  extincteur, boitesExtincteur, ETATS_EXTINCTEUR, affichage, boitesAffichage, ETATS_AFFICHAGE, borneCharge, prisesBorne } from '../iso.js';
import { ech } from '../texte.js';
import { secondClic } from '../gestes.js';
import { graineDeBase, niveauEleve } from '../tirage.js';

/* ================================================================ les objets */
// Les objets qu'on inspecte : la vue où on les voit, leurs états (le SÛR en premier). 'avertisseur' est un état du transpalette
// qui NE SE VOIT PAS (dessiné comme 'ok') : il ne se trouve qu'en essayant l'avertisseur.
export const OBJETS_INSPECTION = {
  transpalette: { vue: 'charge', etats: ETATS_TRANSPALETTE.concat(['avertisseur']), sur: 'ok', numero: true },
  extincteur: { vue: 'quai', etats: ETATS_EXTINCTEUR.slice(), sur: 'present' },
  affichage: { vue: 'quai', etats: ETATS_AFFICHAGE.slice(), sur: 'affiche' },
};
export const NUMEROS_TRANSPALETTE = [1, 2];
export const RESULTATS_ESSAI = ['sonne', 'muet'];
const dessinTp = (etat) => (etat === 'avertisseur' ? 'ok' : etat);

// Les deux vues : projection, cadre, titre (le bouton de bascule) et texte pour les lecteurs d'écran (sans nommer d'objet).
export const VUES_INSPECTION = {
  charge: { unite: 120, origine: [264, 139], viewBox: [0, 0, 640, 480], titre: 'Le local de charge', aria: 'Le local de charge, vu de l’entrée' },
  quai: { unite: 95, origine: [106, 150], viewBox: [0, 0, 640, 480], titre: 'Le quai', aria: 'Le quai, vu de l’intérieur, porte fermée' },
};
// Le dessin déborde du cadre (viewBox) : sur un écran large, la scène s'affiche en entier et l'on voit ce qui l'entoure. Sol et
// murs vont donc bien au-delà (aucun bord visible), mais seuls les clics DANS le cadre comptent.
const SOL_LARGE = [-7, 12, 10];
export const projeterVue = (vue) => projection({ unite: VUES_INSPECTION[vue].unite, origine: VUES_INSPECTION[vue].origine });
// La mise en place (mètres) : les deux places du local de charge, la borne entre elles, le cadre et l'extincteur au quai.
const PLACE_TP = { 1: [0.2, 0.3], 2: [2.4, 0.3] };
const BORNE = [1.66, 0];
const PRISES = prisesBorne(BORNE);
const prisePour = (n) => PRISES[n === 1 ? 0 : 1];
const AFFICHAGE_QUAI = [0.9, 0], EXTINCTEUR_QUAI = [4.25, 0], ZONE_QUAI = [2.45, 3.55, 1.3, 2.3];
export const MARGE_ZONE = 12;   // comme le quai (brief D-4 2.3 : au moins 12 de marge)

const cle = (p) => (p.objet === 'transpalette' ? `transpalette-${p.n}` : p.objet);
export const listeEssais = (D) => (!D || D.essai == null ? [] : Array.isArray(D.essai) ? D.essai : [D.essai]);
// Les transpalettes dessinés : ceux que nomme un point ou un essai (le n° 1 seul si aucun).
export function numerosDessines(D) {
  const N = new Set();
  ((D && D.points) || []).forEach((p) => { if (p && p.objet === 'transpalette' && NUMEROS_TRANSPALETTE.includes(p.n)) N.add(p.n); });
  listeEssais(D).forEach((e) => { if (e && NUMEROS_TRANSPALETTE.includes(e.n)) N.add(e.n); });
  return N.size ? [...N].sort() : [1];
}

/* ================================================================ la déclaration */
// La liste des écarts d'une déclaration, en français courant (vide = tout va bien). Appelée au chargement : la séance qui en a
// un ne se charge pas (on ne découvre pas en classe qu'un objet ne se dessine pas).
export function verifierInspection(D) {
  const E = [];
  if (!D || typeof D !== 'object') return ['inspection : ce n’est pas une déclaration'];
  if (typeof D.id !== 'string' || !D.id.trim()) E.push('inspection.id : vide (un id par séance, par exemple « pelleau-poste-102 »)');
  else if (D.id.includes(':')) E.push(`inspection.id : « ${D.id} » contient « : » (il entre dans le nom des gestes, inspection:<id>:…)`);
  const vues = D.vues === undefined ? ['charge', 'quai'] : D.vues;
  if (!Array.isArray(vues) || !vues.length) E.push('inspection.vues : une liste non vide (« charge », « quai »)');
  else {
    vues.forEach((v) => { if (!VUES_INSPECTION[v]) E.push(`inspection.vues : « ${v} » n’existe pas (${Object.keys(VUES_INSPECTION).join(', ')})`); });
    if (new Set(vues).size !== vues.length) E.push('inspection.vues : une vue en double');
  }
  if (D.arret !== undefined && typeof D.arret !== 'boolean' && typeof D.arret !== 'string') E.push('inspection.arret : true, false ou le texte de l’arrêt');
  const P = D.points;
  if (!Array.isArray(P) || !P.length) { E.push('inspection.points : la liste est vide (il faut au moins un point à inspecter)'); return E; }
  const ids = new Set(), objets = new Set();
  P.forEach((p, i) => {
    const nom = `inspection.points[${i}]${p && typeof p.id === 'string' && p.id ? ` (« ${p.id} »)` : ''}`;
    if (!p || typeof p !== 'object') { E.push(`${nom} : ce n’est pas un point`); return; }
    if (typeof p.id !== 'string' || !p.id.trim()) E.push(`${nom} : id vide`);
    else {
      if (ids.has(p.id)) E.push(`${nom} : id en double`);
      if (p.id === 'aucun-faux') E.push(`${nom} : l’id « aucun-faux » est réservé (jalon « aucun faux signalement »)`);
      ids.add(p.id);
    }
    const O = OBJETS_INSPECTION[p.objet];
    if (!O) { E.push(`${nom} : objet « ${p.objet} » inconnu (${Object.keys(OBJETS_INSPECTION).join(', ')})`); return; }
    if (O.numero && !NUMEROS_TRANSPALETTE.includes(p.n)) E.push(`${nom} : n (le numéro du transpalette) doit valoir ${NUMEROS_TRANSPALETTE.join(' ou ')}`);
    if (!O.numero && p.n !== undefined) E.push(`${nom} : n ne sert qu’au transpalette`);
    if (objets.has(cle(p))) E.push(`${nom} : deux points sur le même objet (${O.numero ? `transpalette n° ${p.n}` : p.objet})`);
    objets.add(cle(p));
    if (Array.isArray(vues) && !vues.includes(O.vue)) E.push(`${nom} : ${p.objet} se voit dans la vue « ${O.vue} », absente de inspection.vues`);
    if (!O.etats.includes(p.etat)) E.push(`${nom} : état « ${p.etat} » inconnu pour ${p.objet} (${O.etats.join(', ')})`);
    if (typeof p.ok !== 'boolean') E.push(`${nom} : ok manque (vrai si l’état est sûr, faux si c’est un défaut)`);
    else if (O.etats.includes(p.etat) && p.ok && p.etat !== O.sur) E.push(`${nom} : ok: true sur un état dangereux (${p.objet} « ${p.etat} »)`);
    else if (O.etats.includes(p.etat) && !p.ok && p.etat === O.sur) E.push(`${nom} : ok: false sur l’état sûr (${p.objet} « ${p.etat} »)`);
    if (p.reparable !== undefined && p.reparable !== false) E.push(`${nom} : reparable ne prend que la valeur false`);
    if (p.reparable === false && p.ok === true) E.push(`${nom} : reparable: false n’a pas de sens sur un point en ordre`);
    if (typeof p.lib !== 'string' || !p.lib.trim()) E.push(`${nom} : lib manque (il sert au bilan, il ne s’affiche jamais pendant l’inspection)`);
  });
  // 20/10/2026 : `signaler.reponse`, si elle est déclarée, doit être une phrase (le collègue ne dirait rien).
  if (D.signaler && D.signaler.reponse !== undefined && (typeof D.signaler.reponse !== 'string' || !D.signaler.reponse.trim())) E.push('inspection.signaler.reponse : une phrase non vide (la réponse unique du collègue)');
  const vusEssai = new Set();
  listeEssais(D).forEach((e, i) => {
    const nom = `inspection.essai${Array.isArray(D.essai) ? `[${i}]` : ''}`;
    if (!e || typeof e !== 'object') { E.push(`${nom} : ce n’est pas un essai`); return; }
    if (e.objet !== 'transpalette') E.push(`${nom} : objet « ${e.objet} » (seul le transpalette a un avertisseur)`);
    if (!NUMEROS_TRANSPALETTE.includes(e.n)) { E.push(`${nom} : n doit valoir ${NUMEROS_TRANSPALETTE.join(' ou ')}`); return; }
    if (vusEssai.has(e.n)) E.push(`${nom} : deux essais sur le transpalette n° ${e.n}`);
    vusEssai.add(e.n);
    if (!RESULTATS_ESSAI.includes(e.resultat)) E.push(`${nom} : resultat « ${e.resultat} » (${RESULTATS_ESSAI.join(' ou ')})`);
    const p = P.find((x) => x && x.objet === 'transpalette' && x.n === e.n);
    // L'engin essayé doit être déclaré par un point (G-5 : l'essai porte sur un transpalette que la séance inspecte vraiment).
    if (!p) E.push(`${nom} : le transpalette n° ${e.n} n’est déclaré par aucun point (ajouter son point, en ordre ou en défaut)`);
    // Un avertisseur muet est un défaut : l'engin doit être déclaré en défaut (sinon l'élève qui le signale ferait un « faux »).
    else if (e.resultat === 'muet' && p.ok !== false) E.push(`${nom} : avertisseur muet sur le transpalette n° ${e.n}, mais son point est en ordre (le mettre en défaut, état 'avertisseur' s’il n’a rien d’autre)`);
  });
  P.forEach((p, i) => {
    if (p && p.objet === 'transpalette' && p.etat === 'avertisseur' && !listeEssais(D).some((e) => e && e.n === p.n && e.resultat === 'muet')) {
      E.push(`inspection.points[${i}] : état 'avertisseur' sans essai « muet » sur le transpalette n° ${p.n} (rien ne le montrerait)`);
    }
  });
  return E;
}

/* ================================================================ l'état */
// L'état neuf, rangé dans `db.inspections[<séance>][<id>]` : les marques posées (`{ n, vue, x, y, point, envoi }`), le compteur
// qui ne réutilise jamais un numéro, les signaux envoyés (`{ points, marques, apresArret }`), les avertisseurs essayés
// (numéros, dans l'ordre), l'arrêt, le figeage et la dernière réponse du collègue. Les états des objets se CALCULENT.
export const inspectionNeuve = () => ({ marques: [], compteur: 0, signaux: [], essais: [], arrete: false, fait: false, chef: '' });
// Une base plus ancienne ou incomplète est complétée sans rien effacer.
function completer(st) {
  const n = inspectionNeuve();
  Object.keys(n).forEach((k) => { if (st[k] === undefined || (Array.isArray(n[k]) && !Array.isArray(st[k]))) st[k] = n[k]; });
  return st;
}

const pointsSignales = (st) => { const S = new Set(); ((st && st.signaux) || []).forEach((g) => (g.points || []).forEach((id) => S.add(id))); return S; };
// L'état dessiné de chaque objet : l'état déclaré, ou l'état SÛR s'il a été signalé et qu'il est réparable — jamais en copie
// (aucun retour). Un objet non déclaré est dessiné dans son état sûr. Le figeage ne répare rien : la scène reste ce qu'elle est.
export function etatsInspection(D, st, { copie = false } = {}) {
  const E = {};
  numerosDessines(D).forEach((n) => { E[`transpalette-${n}`] = 'ok'; });
  E.extincteur = 'present'; E.affichage = 'affiche';
  const vus = pointsSignales(st);
  ((D && D.points) || []).forEach((p) => {
    const repare = !copie && !p.ok && p.reparable !== false && vus.has(p.id);
    E[cle(p)] = repare ? OBJETS_INSPECTION[p.objet].sur : p.etat;
  });
  return E;
}

/* ================================================================ le dessin */
// Le local de charge : mur, panneau, borne et ses deux prises, places peintes au sol et numérotées, transpalettes.
export function sceneCharge(etats, { essai = false } = {}) {
  const I = projeterVue('charge'), { face, boite } = I, [sx0, sx1, sy1] = SOL_LARGE;
  let s = face([[sx0, 0, 0], [sx1, 0, 0], [sx1, sy1, 0], [sx0, sy1, 0]], '#e4dfd3', 'none');
  s += boite(sx0, -0.3, 0, sx1 - sx0, 0.3, 2.7, ['#b9b3a6', '#c9c3b6', '#a9a397']);
  s += borneCharge(I, BORNE, { essai });
  NUMEROS_TRANSPALETTE.forEach((n) => {
    const [x, y] = PLACE_TP[n];
    s += `<polygon points="${I.pts([[x - .12, y - .08, 0], [x + .84, y - .08, 0], [x + .84, y + 1.86, 0], [x - .12, y + 1.86, 0]])}" fill="none" stroke="#d1a90f" stroke-width="3"/>`;
    const [ox, oy] = I.P(x + .25, y + 2.28, 0), u = I.unite, C = 0.866, S = 0.5;
    s += `<text transform="matrix(${(C * u).toFixed(3)},${(S * u).toFixed(3)},${(-C * u).toFixed(3)},${(S * u).toFixed(3)},${ox.toFixed(1)},${oy.toFixed(1)})" font-size=".34" font-weight="800" font-family="Arial, sans-serif" fill="#8a6d00">${n}</text>`;
  });
  numerosDessines({ points: Object.keys(etats).filter((k) => /^transpalette-/.test(k)).map((k) => ({ objet: 'transpalette', n: +k.split('-')[1] })) })
    .forEach((n) => { s += transpaletteElectrique(I, PLACE_TP[n], dessinTp(etats[`transpalette-${n}`]), { n, prise: prisePour(n), essai }); });
  return s;
}
// Le quai vu de l'intérieur, porte fermée : sol et zone de réception, mur et porte (« QUAI B »), le cadre d'affichage à gauche
// de la porte, l'extincteur à droite.
export function sceneQuai(etats, { essai = false, nomQuai = 'Quai B' } = {}) {
  const I = projeterVue('quai'), [sx0, sx1] = SOL_LARGE, m = ['#b9b3a6', '#c9c3b6', '#a9a397'];
  // `murQuai` dessine le mur de −1,2 à 7,5 m : on le prolonge des deux côtés, à la même teinte (à gauche AVANT lui, à droite
  // APRÈS lui : chaque fois, c'est le morceau dessiné en second qui cache le bout de l'autre).
  return solQuai(I, 'Zone de réception', { zone: ZONE_QUAI, sol: SOL_LARGE })
    + I.boite(sx0, -0.3, 0, -1.2 - sx0, 0.3, 2.7, m) + murQuai(I, 0, nomQuai) + I.boite(7.5, -0.3, 0, sx1 - 7.5, 0.3, 2.7, m)
    + affichage(I, AFFICHAGE_QUAI, etats.affichage || 'affiche', { essai })
    + extincteur(I, EXTINCTEUR_QUAI, etats.extincteur || 'present', { essai });
}
export const sceneDe = (vue, etats, o) => (vue === 'quai' ? sceneQuai(etats, o) : sceneCharge(etats, o));
// Ce que voit l'élève : le kit balise certains détails de ses dessins (`data-iso-fourche-tordue`, `data-iso-voyant`, `data-iso-fuite`…,
// utiles à ses propres tests). Dans la vue, RIEN ne nomme un objet ni un défaut (même garde que l'inspection du quai) : ces balises
// sont retirées du dessin (le quai le fait avec `balises: false` pour ses avaries ; le transpalette n'a pas cette option).
const sansBalises = (s) => s.replace(/ data-iso-[\w-]+(?:="[^"]*")?/g, '');

/* ================================================================ les zones */
// Les zones où l'on clique pour chaque point déclaré, sur l'état dessiné : `[{ id, vue, rects: [{ x, y, w, h }] }]` (unités du
// viewBox de la vue). Une zone par boîte monde (le transpalette en a cinq ou plus) ; un objet absent garde sa zone.
export function zonesInspection(D, etats) {
  return ((D && D.points) || []).map((p) => {
    const vue = OBJETS_INSPECTION[p.objet].vue, I = projeterVue(vue);
    const B = p.objet === 'transpalette' ? boitesTranspalette(dessinTp(etats[cle(p)]), PLACE_TP[p.n], prisePour(p.n))
      : p.objet === 'extincteur' ? boitesExtincteur(EXTINCTEUR_QUAI) : boitesAffichage(AFFICHAGE_QUAI);
    return { id: p.id, vue, rects: B.map((b) => boiteEcran(I, b, MARGE_ZONE)) };
  });
}
// Le point touché par un clic en (x, y) de la vue `vue` : le PREMIER point déclaré de cette vue dont une zone contient le clic,
// sinon `null` (à côté).
export function pointTouche(D, etats, vue, x, y) {
  const z = zonesInspection(D, etats).find((q) => q.vue === vue && q.rects.some((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h));
  return z ? z.id : null;
}
// Les recouvrements entre zones de points DIFFÉRENTS d'une même vue (pour la page d'essai et les tests : doit rester vide).
export function recouvrements(D, etats) {
  const Z = zonesInspection(D, etats), L = [];
  Z.forEach((a, i) => Z.slice(i + 1).forEach((b) => {
    if (a.vue !== b.vue) return;
    a.rects.forEach((r) => b.rects.forEach((q) => {
      if (r.x < q.x + q.w && q.x < r.x + r.w && r.y < q.y + q.h && q.y < r.y + r.h) L.push(`${a.id} / ${b.id}`);
    }));
  }));
  return [...new Set(L)];
}

/* ================================================================ les gestes */
// Les textes par défaut ; la déclaration peut les remplacer (`signaler: { rien, fin, vide, deja, note, reponse }`).
export function textes(D) {
  const qui = (D && D.qui) || 'ton chef d’équipe';
  return Object.assign({ qui,
    rien: 'Là, je ne vois rien qui cloche.',
    fin: 'Tu me dis quand tu prends ton poste.',
    vide: 'Qu’est-ce qui ne va pas ? Clique d’abord sur ce que tu veux me signaler.',
    deja: 'Oui, je sais : c’est noté.',
    note: 'C’est noté.',
    arret: 'Stop ! Avant de prendre ton poste, tout doit être en ordre. Regarde encore et signale ce qui ne va pas.',
    commencer: 'C’est bon, je prends mon poste',
    confirmer: 'Tu prends ton poste, c’est définitif : clique pour confirmer',
    sonne: 'Tu appuies : le klaxon sonne.',
    muet: 'Tu appuies : rien ne sonne.',
    horsObjet: 'Clique un objet du poste.',
    reponse: null, // 20/10/2026 : si déclarée, LA seule phrase du collègue, quoi que l’élève signale (voir `signaler`)
  }, (D && D.signaler) || {}, D && typeof D.arret === 'string' ? { arret: D.arret } : {}, D && D.commencer ? { commencer: D.commencer } : {});
}
// Poser une marque (retour d'écran de Tristan, 19/10/2026 : AUCUNE MARQUE DANS LE VIDE). Rend `true` si une marque est posée,
// `null` si le clic ne touche aucun objet déclaré (rien n'est posé ni rangé, le compteur ne bouge pas : l'écran dit
// discrètement « Clique un objet du poste. »), `false` si l'inspection est figée. Une marque envoyée est inerte.
export function cliquer(D, st, vue, x, y, { copie = false } = {}) {
  if (st.fait) return false;
  const point = pointTouche(D, etatsInspection(D, st, { copie }), vue, x, y);
  if (!point) return null;
  st.compteur = (st.compteur || 0) + 1;
  st.marques.push({ n: st.compteur, vue, x, y, point, envoi: null });
  return true;
}
export function retirerMarque(st, n) {
  const k = st.marques.findIndex((m) => m.n === n);
  if (k < 0 || st.marques[k].envoi != null || st.fait) return false;
  st.marques.splice(k, 1);
  return true;
}
// « Signaler à … » : les marques pas encore envoyées partent en UN signal. Réponse composée comme au quai : la réparation de
// chaque défaut touché pas encore signalé (dans l'ordre de déclaration ; un défaut `reparable: false` donne son texte et reste
// tel quel), « je sais » une fois si un défaut non réparable est re-signalé (ce n'est PAS un faux), « rien » une fois s'il y a
// un point en ordre ou un défaut déjà réparé, puis la fin. En copie : « C'est noté. », rien ne se répare. Plus de marque « à
// côté » : `cliquer` n'en pose jamais (une marque sans point, venue d'une base plus ancienne, est ignorée).
// 20/10/2026 : `signaler.reponse` déclarée (chaîne non vide) = le collègue ne dit QUE cette phrase (défaut, point en ordre, défaut déjà
// réparé : la même, sans `fin`) ; marques envoyées, signal rangé et jalons ne changent pas. Sans elle, la composition ci-dessus. Aucune
// marque à envoyer : `vide`, comme avant.
// Rend `true` si un signal est vraiment parti (le geste `inspection:<id>:signaler` est alors publié).
export function signaler(D, st, { copie = false } = {}) {
  if (st.fait) return false;
  const T = textes(D);
  const envoyer = st.marques.filter((m) => m.envoi == null && m.point);
  if (!envoyer.length) { st.chef = T.vide; return false; }
  const deja = pointsSignales(st);
  const points = [...new Set(envoyer.map((m) => m.point))];
  st.signaux.push({ points, marques: envoyer.map((m) => m.n), apresArret: !!st.arrete });
  envoyer.forEach((m) => { m.envoi = st.signaux.length; });
  if (copie) { st.chef = T.note; return true; }
  if (typeof T.reponse === 'string' && T.reponse.trim()) { st.chef = T.reponse; return true; }
  const touche = D.points.filter((p) => points.includes(p.id));
  const L = touche.filter((p) => !p.ok && !deja.has(p.id)).map((p) => p.repare || 'Bien vu, je m’en occupe.');
  if (touche.some((p) => !p.ok && p.reparable === false && deja.has(p.id))) L.push(T.deja);
  if (touche.some((p) => p.ok || (deja.has(p.id) && p.reparable !== false))) L.push(T.rien);
  L.push(T.fin);
  st.chef = L.join(' ');
  return true;
}
// « Essayer l'avertisseur » du transpalette n : le texte (aucun son). Le premier essai de chaque engin est rangé ; rend
// `{ texte, premier }` (`premier` : publier le geste `inspection:<id>:essai`). Un engin sans essai déclaré sonne.
export function essayer(D, st, n) {
  const T = textes(D), e = listeEssais(D).find((x) => x && x.n === n);
  if (st.fait) return { texte: '', premier: false };
  const premier = !st.essais.includes(n);
  if (premier) st.essais.push(n);
  return { texte: e && e.resultat === 'muet' ? T.muet : T.sonne, premier };
}
// « C'est bon, je prends mon poste » (le SECOND clic). Un défaut jamais signalé arrête l'élève (hors copie, sauf `arret: false`) :
// rend 'arret', sans nommer le point. Sinon fige l'inspection (marques non envoyées abandonnées) et rend 'fait'.
export function valider(D, st, { copie = false } = {}) {
  if (st.fait) return 'fait';
  const S = pointsSignales(st);
  const oublie = D.points.some((p) => !p.ok && !S.has(p.id));
  if (oublie && !copie && D.arret !== false) { st.arrete = true; return 'arret'; }
  st.fait = true;
  st.marques = st.marques.filter((m) => m.envoi != null);
  return 'fait';
}

/* ================================================================ les jalons */
// Un jalon par défaut (`securite-<id>` : signalé dans un signal envoyé AVANT l'arrêt), un par essai déclaré (`essai-<n>` : avertisseur
// essayé avant de prendre le poste, même s'il sonne : l'essai est rangé seulement avant le figeage), puis `securite-aucun-faux` (au
// moins un signal, aucun sur un point en ordre ; le vide ne se marque plus, donc le seul faux possible est un objet en ordre ;
// re-signaler un défaut, réparé ou non, n'est pas un faux). Aucun n'est vrai par inaction. Les `lib` restent NEUTRES (le défaut
// est nommé dans `attendu`, lu au bilan). Même forme que les jalons du quai (`{ id, lib, fait, attendu, ok }`).
export function jalonsInspection(D, st) {
  const T = textes(D), sec = st || inspectionNeuve();
  const signaux = Array.isArray(sec.signaux) ? sec.signaux : [];
  const point = (id) => D.points.find((x) => x.id === id) || null;
  const L = [];
  D.points.filter((x) => !x.ok).forEach((x, i) => {
    const avant = signaux.some((g) => !g.apresArret && (g.points || []).includes(x.id));
    const apres = !avant && signaux.some((g) => (g.points || []).includes(x.id));
    L.push({ id: `securite-${x.id}`, lib: `Défaut n° ${i + 1} signalé avant de prendre le poste`,
      fait: avant ? 'signalé avant de prendre le poste' : apres ? `signalé seulement après l’arrêt de ${T.qui}` : sec.fait ? 'jamais signalé' : 'pas signalé',
      attendu: `signaler : ${x.lib}`, ok: avant });
  });
  listeEssais(D).forEach((e) => {
    const fait = (sec.essais || []).includes(e.n);
    L.push({ id: `essai-${e.n}`, lib: `Avertisseur du n° ${e.n} essayé avant de prendre le poste`, fait: fait ? 'essayé' : 'pas essayé',
      attendu: `essayer l’avertisseur (il ${e.resultat === 'muet' ? 'ne sonne pas' : 'sonne'})`, ok: fait });
  });
  const aTort = [...new Set([].concat(...signaux.map((g) => (g.points || []).filter((id) => point(id) && point(id).ok))))].map((id) => point(id).lib);
  L.push({ id: 'securite-aucun-faux', lib: 'Aucun faux signalement',
    fait: !signaux.length ? 'rien signalé' : !aTort.length ? 'aucun faux signalement' : `signalé à tort : ${aTort.join(', ')}`,
    attendu: 'au moins un signalement, et aucun sur un point en ordre', ok: signaux.length > 0 && !aTort.length });
  return L;
}

/* ================================================================ les marques (SVG) */
// Comme au quai : un rond d'encre à contour épais et son numéro (ni vert ni rouge : ce n'est pas un verdict). Une marque
// envoyée est grisée en tirets.
export const marquesSvg = (st, vue) => st.marques.filter((m) => m.vue === vue).map((m) => {
  const env = m.envoi != null;
  return `<g data-i-marque="${m.n}"><circle cx="${m.x}" cy="${m.y}" r="12" fill="rgba(255,255,255,.88)" stroke="${env ? '#6b6b6b' : '#1a1915'}" stroke-width="${env ? 2 : 3.5}"${env ? ' stroke-dasharray="4 3" opacity=".55"' : ''}/>`
    + `<text x="${m.x}" y="${(m.y + 4.6).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" font-family="system-ui,sans-serif" fill="#1a1915">${ech(String(m.n))}</text></g>`;
}).join('');
export const texteMarques = (st) => { const n = st.marques.filter((m) => m.envoi == null).length; return n ? `${n} marque${n > 1 ? 's' : ''} à envoyer` : ''; };

/* ================================================================ lire l'état d'un élève, les étapes de la séance */
// L'état rangé d'une inspection dans une base (`null` si l'élève n'y a rien fait).
export const etatInspection = (db, seance, id) => (db && db.inspections && db.inspections[seance] && db.inspections[seance][id]) || null;
// La déclaration d'une base : la déclaration fixe, ou celle de la graine de l'élève (inspection tirée).
export const declarationDe = (decl, db, { copie = false } = {}) => (typeof decl === 'function'
  ? decl(graineDeBase(db || {}) || '', { niveau: niveauEleve(db || {}, { copie }), copie }) : decl);
// Les lignes du bilan d'une base (même forme que `jalonsQuai(db, Q).L`) : pour un jalon de séance, le corrigé, le détail.
export function lignesInspection(decl, db, seance, { copie = false } = {}) {
  const D = declarationDe(decl, db, { copie });
  return jalonsInspection(D, etatInspection(db, seance, D.id));
}
// Les étapes à donner à `creerEntreprise` (la séance y pose `poids` et `groupe`) : une par ligne, dans l'ordre. `attente` tant que
// l'inspection n'est pas figée (« C'est bon, je prends mon poste »), puis `ok`, ou `ko` avec ce que l'élève a fait. Inspection
// tirée : l'étape n° k est la k-ième ligne du jeu DE LA BASE lue (ids pris sur la graine vide : même structure pour toutes).
export function etapesInspection(decl, seance, { copie = false } = {}) {
  if (typeof seance !== 'string' || !seance.trim()) throw new Error('etapesInspection(decl, seance) : il faut l’id de la séance (l’état est rangé sous db.inspections[séance][id])');
  const ref = lignesInspection(decl, {}, seance, { copie });
  return ref.map((l0, k) => ({
    id: l0.id, titre: l0.lib,
    verifier(db) {
      const D = declarationDe(decl, db, { copie });
      const st = etatInspection(db, seance, D.id);
      if (!st || st.fait !== true) return { status: 'attente' };
      const l = jalonsInspection(D, st)[k];
      return l && l.ok ? { status: 'ok' } : { status: 'ko', detail: l ? l.fait : '' };
    },
  }));
}

/* ================================================================ la vue */
// `decl` : la déclaration, ou sa fonction de la graine (résolue ici avec `graine` et `niveau`, comme le quai tiré).
// `copie` : évaluation (premier clic pris tel quel, « C'est noté. », rien ne se répare, aucun arrêt).
export function creerInspection(decl, { copie = false, graine = '', niveau = 'standard' } = {}) {
  const COPIE = !!copie;
  let D;
  try { D = typeof decl === 'function' ? decl(graine, { niveau, copie: COPIE }) : decl; }
  catch (x) { throw new Error(`inspection : la fonction de la graine ne marche pas (${x && x.message ? x.message : x})`); }
  const fautes = verifierInspection(D);
  if (fautes.length) throw new Error(`inspection${D && typeof D.id === 'string' && D.id ? ` « ${D.id} »` : ''} : ${fautes.join(' ; ')}`);
  const T = textes(D);
  const vues = D.vues || ['charge', 'quai'];
  const essais = listeEssais(D).map((e) => e.n);
  const geste = (g) => `inspection:${D.id}:${g}`;
  const signaux = [geste('signaler'), ...(essais.length ? [geste('essai')] : []), geste('fini')];
  // L'interface en mémoire (ce qui n'est pas du travail) : la vue regardée, la confirmation armée, l'arrêt affiché, le texte de l'essai.
  const ui = { vue: vues[0], arme: false, arret: false, essai: '', hors: false };
  const majuscule = (t) => String(t).charAt(0).toUpperCase() + String(t).slice(1);
  const bloque = (st, api) => !!(st.fait || (api && api.figee));

  function sceneHtml(st) {
    const V = VUES_INSPECTION[ui.vue], [vx, vy, vw, vh] = V.viewBox;
    return `<svg data-i-scene data-vue="${ui.vue}" viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="${ech(V.aria)}"><g data-g="iso">${sansBalises(sceneDe(ui.vue, etatsInspection(D, st, { copie: COPIE })))}</g><g data-i-marques>${marquesSvg(st, ui.vue)}</g></svg>`;
  }
  function panneauHtml(st, api) {
    const dis = bloque(st, api) ? ' disabled' : '';
    const bascule = vues.length < 2 ? '' : `<p class="insp-ligne insp-bascule" role="group" aria-label="Où regarder">${vues.map((v) =>
      `<button type="button" class="btn${v === ui.vue ? ' btn-p' : ''}" data-i="vue" data-v="${v}" aria-pressed="${v === ui.vue}"${dis}>${ech(VUES_INSPECTION[v].titre)}</button>`).join('')}</p>`;
    const boutonsEssai = ui.vue !== 'charge' ? '' : essais.map((n) => `<button type="button" class="btn" data-i="essai" data-n="${n}"${dis}>Essayer l’avertisseur du n° ${n}</button>`).join('');
    // Le bilan de la vue (guidage seulement) : la phrase `bilan` si un jalon est faux, sans nommer le point.
    const rate = !COPIE && st.fait && D.bilan && jalonsInspection(D, st).some((l) => !l.ok);
    return `<p class="insp-consigne" data-i-consigne>${ech(D.consigne || 'Clique sur ce qui ne va pas, puis signale-le.')}</p>
      ${bascule}
      ${boutonsEssai ? `<p class="insp-ligne">${boutonsEssai}</p>` : ''}
      ${ui.essai ? `<p class="insp-essai" role="status" data-i-essai>${ech(ui.essai)}</p>` : ''}
      <div class="insp-chef" data-i-chef role="status">${st.chef ? `<b>${ech(majuscule(T.qui))} :</b> « ${ech(st.chef)} »` : ''}</div>
      ${ui.arret && !st.fait ? `<div class="insp-arret" role="alert" data-i-arret><b>${ech(majuscule(T.qui))} :</b> « ${ech(T.arret)} »</div>` : ''}
      ${st.fait ? '<p class="note insp-fige" data-i-fige>Tu as pris ton poste : l’inspection est figée.</p>' : ''}
      ${rate ? `<p class="insp-bilan" data-i-bilan>${ech(D.bilan)}</p>` : ''}
      <p class="insp-ligne insp-actions">
        <button type="button" class="btn" data-i="signaler"${dis}>Signaler à ${ech(T.qui)}</button>
        <span class="note insp-nb${ui.hors ? ' insp-hors' : ''}" data-i-nb>${ui.hors ? ech(T.horsObjet) : texteMarques(st)}</span>
      </p>
      <p class="insp-ligne insp-actions">
        <button type="button" class="btn btn-p${ui.arme ? ' insp-arme' : ''}" data-i="valider"${dis}>${ui.arme ? ech(T.confirmer) : `${ech(T.commencer)} →`}</button>
        ${ui.arme ? '<button type="button" class="btn" data-i="desarmer">Annuler</button>' : ''}
      </p>`;
  }
  function html(st, api) {
    completer(st);
    return `<section class="insp" data-insp="${ech(D.id)}" data-i-inspection${COPIE ? ' data-i-copie' : ''}>
      <div class="insp-scene" data-i-cadre>${sceneHtml(st)}</div>
      <div class="insp-panneau" data-i-panneau>${panneauHtml(st, api)}</div>
    </section>`;
  }

  function brancher(z, st, api) {
    const racine = z.querySelector('[data-i-inspection]');
    if (!racine) return;
    completer(st);
    const gele = () => !!(api.gele && api.gele());
    const signal = (g) => { if (api.signal) api.signal(geste(g)); };
    caler(racine);
    // Redessine la scène et le panneau ; le focus (clavier ou souris) reste sur le même bouton s'il existe encore.
    function rendre({ scene = true } = {}) {
      const a = document.activeElement;
      const avant = a && racine.contains(a) && a.dataset && a.dataset.i ? `[data-i="${a.dataset.i}"]${a.dataset.n ? `[data-n="${a.dataset.n}"]` : ''}${a.dataset.v ? `[data-v="${a.dataset.v}"]` : ''}` : null;
      if (scene) racine.querySelector('[data-i-cadre]').innerHTML = sceneHtml(st);
      racine.querySelector('[data-i-panneau]').innerHTML = panneauHtml(st, api);
      if (avant) {
        const b = racine.querySelector(avant) || racine.querySelector('[data-i="valider"]');
        if (b && !b.disabled) b.focus({ preventScroll: true });
      }
    }
    // Une marque posée ou retirée : seules la couche des marques et le compteur changent (comme au quai) ; un « C'est bon » armé se désarme.
    function marques() {
      ui.hors = false;
      if (ui.arme) { ui.arme = false; rendre({ scene: false }); }
      racine.querySelector('[data-i-marques]').innerHTML = marquesSvg(st, ui.vue);
      const nb = racine.querySelector('[data-i-nb]');
      nb.textContent = texteMarques(st); nb.classList.remove('insp-hors');
    }
    function horsObjet() {
      ui.hors = true;
      const nb = racine.querySelector('[data-i-nb]');
      if (nb) { nb.textContent = T.horsObjet; nb.classList.add('insp-hors'); }
    }
    racine.addEventListener('click', (ev) => {
      if (gele()) return;
      const svg = ev.target.closest && ev.target.closest('[data-i-scene]');
      if (svg) {
        if (bloque(st, api)) return;
        const sur = ev.target.closest('[data-i-marque]');
        if (sur) { if (retirerMarque(st, +sur.getAttribute('data-i-marque'))) { marques(); api.sauver(); } return; }
        const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
        const M = svg.getScreenCTM();
        if (!M) return;
        const p = pt.matrixTransform(M.inverse()), [vx, vy, vw, vh] = VUES_INSPECTION[ui.vue].viewBox;
        if (p.x < vx || p.x > vx + vw || p.y < vy || p.y > vy + vh) { horsObjet(); return; }
        const r = cliquer(D, st, ui.vue, Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10, { copie: COPIE });
        if (r) { marques(); api.sauver(); }
        // Un clic qui ne touche aucun objet ne pose rien : un mot discret à la place du compteur, sans aplat ni rouge.
        else if (r === null) horsObjet();
        return;
      }
      const b = ev.target.closest('button[data-i]');
      if (!b || b.disabled) return;
      const quoi = b.dataset.i;
      ui.hors = false;
      if (quoi === 'vue') {
        ui.vue = b.dataset.v; ui.arme = false; ui.essai = '';
        rendre();
        return;
      }
      if (quoi === 'desarmer') { ui.arme = false; rendre({ scene: false }); return; }
      if (bloque(st, api)) return;
      if (quoi === 'essai') {
        ui.arme = false;
        const r = essayer(D, st, +b.dataset.n);
        ui.essai = r.texte;
        if (r.premier) { signal('essai'); api.sauver(); }
        rendre({ scene: false });
      } else if (quoi === 'signaler') {
        ui.arme = false;
        if (signaler(D, st, { copie: COPIE })) { signal('signaler'); ui.arret = false; }
        api.sauver();
        rendre();
      } else if (quoi === 'valider') {
        if (!secondClic(ui, 'arme')) { rendre({ scene: false }); return; }
        const r = valider(D, st, { copie: COPIE });
        ui.arret = r === 'arret';
        if (r === 'fait') { signal('fini'); ui.essai = ''; }
        api.sauver();
        rendre();
      }
    });
    if (!ecouteRedim) {
      ecouteRedim = true;
      window.addEventListener('resize', () => { document.querySelectorAll('[data-i-inspection]').forEach(caler); });
    }
    // Une question au fil pose son bandeau AU-DESSUS de l'écran sans le redessiner : la scène descend, la hauteur se recalcule.
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => { if (racine.isConnected) caler(racine); else ro.disconnect(); });
      ro.observe(document.body);
    }
    // Pour les tests et la page d'essai : l'état d'écran, sans passer par le DOM.
    racine.__insp = { lire: () => ({ vue: ui.vue, arme: ui.arme, arret: ui.arret, essai: ui.essai, hors: ui.hors }),
      zones: () => zonesInspection(D, etatsInspection(D, st, { copie: COPIE })) };
  }

  return {
    id: D.id,
    nav: { libelle: D.libelle || 'Mon poste' },
    signaux,
    copie: COPIE,
    declaration: D,
    etatNeuf: inspectionNeuve,
    jalons: (st) => jalonsInspection(D, st),
    html,
    brancher,
  };
}
let ecouteRedim = false;

// La scène prend la hauteur qui reste sous le bandeau : ni la page ni le panneau ne défilent à 1366 × 768 et 1280 × 720.
function caler(racine) {
  if (!racine.isConnected) return;
  if (window.innerWidth < 820) { racine.style.removeProperty('--insp-h'); return; }
  const haut = racine.getBoundingClientRect().top + window.scrollY;
  racine.style.setProperty('--insp-h', `${Math.max(340, Math.floor(window.innerHeight - haut - 14))}px`);
}
