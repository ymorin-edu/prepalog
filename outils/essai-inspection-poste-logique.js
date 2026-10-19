// LOGIQUE PURE de la vue « Inspection du poste » (chantier Transports Pelleau, lot B, phase 1 : la maquette ; 19/10/2026).
// Brief `docs/briefs/MOTEUR-inspection-poste.md`, décisions `docs/briefs/COORDINATION-pelleau.md` §2 (points 1 à 6).
//
// Ce fichier ne touche ni au DOM ni à la base : des fonctions qui lisent une DÉCLARATION (`D`, le bloc `inspection` d'une séance)
// et un ÉTAT (`st`, ce qui sera rangé dans `db.inspections[<séance>][<id>]`) et rendent du texte SVG, des zones, des jalons. La
// phase 2 le déplace dans `core/types/inspection.js` sans le réécrire (seul le chemin de l'import du kit change : '../iso.js').
//
// REPRIS DU QUAI (core/types/quai.js, inspection sur la scène, D-4) — même algorithme, réécrit ici et pourquoi :
//   - `pointTouche` / `zonesScene` : ceux du quai sont liés au camion (`boitesCamion`, `OBJETS_SCENE`, `VUES_SCENE`) : pas
//     réutilisables tels quels ; ici, une zone par BOÎTE (deux transpalettes côte à côte ne se recouvrent pas).
//   - `signalerScene`, `validerScene`, `jalonsScene` : ce sont des fonctions internes de `creerQuai` (fermeture), non exportées,
//     et `quai.js` est en cours de modification par le lot D ; mêmes règles (réponse composée, arrêt sans nommer, jalons sans
//     inaction), avec ce que l'inspection ajoute : `reparable: false`, l'essai de l'avertisseur, la copie sans commentaire.
//     DIFFÉRENCE voulue (Tristan, 19/10/2026) : le quai pose une marque « à côté » sur un clic dans le vide ; ici, un clic qui ne
//     touche aucun objet ne pose RIEN (`cliquer` rend `null`), et `securite-aucun-faux` ne compte que les objets en ordre signalés.
//   La phase 2 décidera s'il vaut la peine d'extraire un module commun `core/types/inspection-commun.js` (décision 1 du chef).

import { projection, boiteEcran, solQuai, murQuai, transpaletteElectrique, boitesTranspalette, ETATS_TRANSPALETTE,
  extincteur, boitesExtincteur, ETATS_EXTINCTEUR, affichage, boitesAffichage, ETATS_AFFICHAGE, borneCharge, prisesBorne } from '../core/iso.js';
import { ech } from '../core/texte.js';

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
const listeEssais = (D) => (!D || D.essai == null ? [] : Array.isArray(D.essai) ? D.essai : [D.essai]);
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
  const vusEssai = new Set();
  listeEssais(D).forEach((e, i) => {
    const nom = `inspection.essai${Array.isArray(D.essai) ? `[${i}]` : ''}`;
    if (!e || typeof e !== 'object') { E.push(`${nom} : ce n’est pas un essai`); return; }
    if (e.objet !== 'transpalette') E.push(`${nom} : objet « ${e.objet} » (seul le transpalette a un avertisseur)`);
    if (!NUMEROS_TRANSPALETTE.includes(e.n)) E.push(`${nom} : n doit valoir ${NUMEROS_TRANSPALETTE.join(' ou ')}`);
    else if (vusEssai.has(e.n)) E.push(`${nom} : deux essais sur le transpalette n° ${e.n}`);
    vusEssai.add(e.n);
    if (!RESULTATS_ESSAI.includes(e.resultat)) E.push(`${nom} : resultat « ${e.resultat} » (${RESULTATS_ESSAI.join(' ou ')})`);
    const p = P.find((x) => x && x.objet === 'transpalette' && x.n === e.n);
    // Un avertisseur muet est un défaut : l'engin doit être déclaré en défaut (sinon l'élève qui le signale ferait un « faux »).
    if (e.resultat === 'muet' && (!p || p.ok !== false)) E.push(`${nom} : avertisseur muet sur le transpalette n° ${e.n}, mais aucun point en défaut ne le déclare (ajouter un point, état 'avertisseur' s’il n’a rien d’autre)`);
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
// qui ne réutilise jamais un numéro, les signaux envoyés (`{ points, rien, marques, apresArret }`), les avertisseurs essayés
// (numéros, dans l'ordre), l'arrêt, le figeage et la dernière réponse du collègue. Les états des objets se CALCULENT.
export const inspectionNeuve = () => ({ marques: [], compteur: 0, signaux: [], essais: [], arrete: false, fait: false, chef: '' });

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
// Les textes par défaut ; la déclaration peut les remplacer (`signaler: { rien, fin, vide, deja, note }`).
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
  }, (D && D.signaler) || {}, D && typeof D.arret === 'string' ? { arret: D.arret } : {}, D && D.commencer ? { commencer: D.commencer } : {});
}
// Poser une marque (retour d'écran de Tristan, 19/10/2026 : AUCUNE MARQUE DANS LE VIDE). Rend `true` si une marque est posée,
// `null` si le clic ne touche aucun objet déclaré (rien n'est posé ni rangé, le compteur ne bouge pas : l'écran peut dire
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
// essayé, même s'il sonne), puis `securite-aucun-faux` (au moins un signal, aucun sur un point en ordre ; le vide ne se marque
// plus, donc le seul faux possible est un objet en ordre ; re-signaler un défaut, réparé ou non, n'est pas un faux). Aucun n'est vrai par inaction. Les `lib` restent NEUTRES (le défaut
// est nommé dans `attendu`, lu au bilan).
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
    L.push({ id: `essai-${e.n}`, lib: `Avertisseur du transpalette n° ${e.n} essayé`, fait: fait ? 'essayé' : 'pas essayé',
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
