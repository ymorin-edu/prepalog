// ENT-8.14 — Action, évaluation « ranger et compter dans le site d'évaluation » : les DONNÉES PURES de la séance (le palettier de chaque site, ses plaques de
// charge, son stock de départ, les produits et leur colisage, le tirage des cinq palettes et des quatre adresses à compter par élève, l'entrepôt d'un élève pour
// le mode `palettier`, les choix de la fiche « Signaler l'écart »). Aucun effet de bord à l'import, aucune dépendance au navigateur : le contenu
// (`contenus/action-ent814.js`), les questions (`contenus/questions/ENT-8.14.js`), le corrigé (`contenus/corriges/ENT-8.14.js`) et les tests l'importent.
// Brief : `docs/briefs/ENT-8.14-action-evaluation-stock.md` ; décisions du chef de chantier : `docs/briefs/COORDINATION-palettier.md` §3 (elles passent avant le
// brief là où elles diffèrent : n° 6 pas de plaque au sol, n° 7 une erreur ne se paie qu'une fois, n° 12 comptage au niveau 1, n° 13 ouverture neutre).
//
// LES SITES sont ceux d'ENT-8.5, 8.6 et 8.10 (`contenus/action-eval-sites.js`, jamais modifié) : Onnaing (GXO, Karim, Léo) ou Belleville-en-Beaujolais
// (Kuehne+Nagel, Sandrine, Hugo), tiré par une fonction PURE de l'identifiant de l'élève ; `siteDeGraine` et `COLLEGUES` viennent de `action-ent810-donnees.js` (lu,
// jamais modifié ici). Les produits sont recopiés d'ENT-8.11 (désignations génériques) : l'évaluation n'importe rien d'une séance de travail.
//
// VÉRIFIÉ (brief ENT-8.5 §2 et ENT-8.14 §2) : Onnaing (59), exploité par GXO, qui y fait réception, stockage, préparation, expédition et retours (communiqué de
// GXO du 15/10/2026) ; Belleville-en-Beaujolais (69), exploité par Kuehne+Nagel (communiqué du 06/09/2023).
// CONSTRUIT (dit dans la séance, `MENTION`) : le palettier de chaque site (allées, travées, niveaux, plaques de charge), les adresses, le stock du système, le
// Terminal, les palettes, les comptages et l'écart, le tuteur, le cariste ; les produits, leurs poids et leur colisage.
//
// LE PALETTIER DE CHAQUE SITE (brief §6.1, COORDINATION n° 6 : le sol n'a ni plaque ni limite, les « 3 000 kg / N1 » du brief ne se codent pas) :
//   Onnaing    : allées A, B, C (côtés 1 et 2 = 6 côtés), 4 travées, 4 niveaux, 3 emplacements ; plaques N2 1 400 · N3 1 200 · N4 1 000 kg.
//   Belleville : allées A, B (4 côtés), 4 travées, 4 niveaux (le moteur s'arrête à 4), 3 emplacements ; plaques N2 1 600 · N3 1 300 · N4 1 100 kg.
// LE STOCK DE DÉPART est le même pour toute la classe d'un site, fabriqué par une règle fixe (graine constante) : environ la moitié des emplacements au sol
// occupés (le picking, tous les produits) ; en N3 et N4, environ un niveau sur trois porte DEUX palettes lourdes dont la somme reste SOUS la plaque (de quoi
// faire dépasser la palette à signaler) ; les autres niveaux portent 0 à 2 palettes normales ou légères. Deux emplacements hors service par site.
//
// LE TIRAGE (par élève, graine = son identifiant + « |action-evaluation-stock », `tirerJeu` de `core/tirage.js`, un par site) :
//   P1 au sol, P2 au sol (une autre allée) ; P3 en réserve (N2 à N4), un produit normal ou léger, sur un niveau qui la porte ; P4 un produit LOURD, en N3 ou N4, à
//   signaler : son niveau porte déjà de quoi dépasser la plaque avec elle (jamais déjà surchargé sans elle), aucune nouvelle adresse ; P5 dont l'adresse (au
//   sol) est PRISE, avec une adresse libre (au sol, une autre travée) ; P3 et P4 sur deux niveaux différents (aucune palette de l'élève n'en alourdit une autre) ;
//   cinq produits différents. QUATRE ADRESSES À COMPTER, au sol, occupées par le stock, quatre produits différents parmi sept : 3 conformes + 1 écart (manque ou
//   surplus, tiré), l'écart à un rang tiré. AUCUNE adresse à compter n'est l'adresse donnée ou libre d'une palette (le moteur le refuse).
// PAS DE CLÉ sur les adresses à compter : le rang de l'écart est tiré, donc une clé nommée par rôle (`ecart`, `ok1`…) déplacerait les ids `recompte-<clé>` d'un
// élève à l'autre (le contrôle « mêmes jalons pour toutes les graines » d'`etapesPalettier` le refuse) ; les ids sont `compte-<rang>` et `recompte-<rang>`, les
// mêmes pour tous.
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ce fichier : ne rien changer aux plans, au stock, aux produits ni au tirage pendant qu'une
// classe passe l'évaluation (le jeu des élèves changerait).

import { tirerJeu, graineDeBase, hasard } from '../core/tirage.js';
import { siteDeGraine, COLLEGUES, equipeDe } from './action-ent810-donnees.js';

export { siteDeGraine, COLLEGUES, equipeDe };
export const ID = 'action-evaluation-stock';
export const ID_VOLET = 'action-ent814';
export const ENTREPOT_ID = 'action-evaluation-stock';      // les gestes publiés : `entrepot:action-evaluation-stock:<geste>`
export const FICHE_ID = 'ecarts-814';
export const SUPPORT_KG = 25;
export const siteEleve = (db) => siteDeGraine(graineDeBase(db));
// Le nom complet d'un geste publié par le plan d'entrepôt.
export const GESTE = (n) => `entrepot:${ENTREPOT_ID}:${n}`;

// ─────────────────────────────────────────────────────────────── les produits (catégories réelles d'Action, désignations génériques, recopiés d'ENT-8.11)
export const PRODUITS = {
  LES: { nom: 'Lessive liquide 3 L', court: 'Lessive', kg: 13, cartons: 36, classe: 'lourd' },
  NET: { nom: 'Nettoyant multi-usages 1 L', court: 'Nettoyant', kg: 13, cartons: 40, classe: 'lourd' },
  CRO: { nom: 'Croquettes pour chien 4 kg', court: 'Croquettes', kg: 12.5, cartons: 32, classe: 'lourd' },
  CAH: { nom: 'Cahiers grand format', court: 'Cahiers', kg: 9, cartons: 30, classe: 'normal' },
  SER: { nom: 'Serviettes de bain', court: 'Serviettes', kg: 6, cartons: 40, classe: 'normal' },
  BOU: { nom: 'Bougies parfumées', court: 'Bougies', kg: 3, cartons: 60, classe: 'leger' },
  BOI: { nom: 'Boîtes de rangement 10 L', court: 'Boîtes', kg: 4, cartons: 24, classe: 'leger' },
  PEL: { nom: 'Peluches', court: 'Peluches', kg: 3, cartons: 24, classe: 'leger' },
};
export const CODES = Object.keys(PRODUITS);
export const LOURDS = CODES.filter((k) => PRODUITS[k].classe === 'lourd');
export const NON_LOURDS = CODES.filter((k) => PRODUITS[k].classe !== 'lourd');
// Le poids d'une palette pleine d'un produit (cartons × kg d'un carton + 25 kg de palette), arrondi au centième comme la vue.
export const poidsDe = (k) => Math.round((PRODUITS[k].cartons * PRODUITS[k].kg + SUPPORT_KG) * 100) / 100;
// Le format d'une palette à compter (cartons par couche, couches) : le même nombre de cartons qu'une palette pleine (les bougies, 60, n'entrent pas).
export const FORMATS = {
  LES: { couche: [3, 3], couches: 4 }, NET: { couche: [2, 4], couches: 5 }, SER: { couche: [2, 4], couches: 5 }, CRO: { couche: [2, 4], couches: 4 },
  BOI: { couche: [2, 3], couches: 4 }, CAH: { couche: [2, 3], couches: 5 }, PEL: { couche: [2, 4], couches: 3 },
};
export const PRODUITS_COMPTAGE = Object.keys(FORMATS);
export const parCouche = (k) => FORMATS[k].couche[0] * FORMATS[k].couche[1];
export const pleine = (k) => parCouche(k) * FORMATS[k].couches;
PRODUITS_COMPTAGE.forEach((k) => { if (pleine(k) !== PRODUITS[k].cartons) throw new Error(`ENT-8.14 : le format de ${k} (${pleine(k)} cartons) n’est pas son colisage (${PRODUITS[k].cartons})`); });

// ─────────────────────────────────────────────────────────────── les deux palettiers (construits)
export const PLANS = {
  onnaing: { allees: ['A', 'B', 'C'], plaques: { 2: 1400, 3: 1200, 4: 1000 }, horsService: ['B1-T01-N2-E1', 'C2-T03-N3-E2'] },
  belleville: { allees: ['A', 'B'], plaques: { 2: 1600, 3: 1300, 4: 1100 }, horsService: ['A2-T02-N2-E3', 'B1-T04-N3-E1'] },
};
export const IDS_SITES = Object.keys(PLANS);
export const cotesDe = (site) => PLANS[site].allees.flatMap((a) => [`${a}1`, `${a}2`]);
const z2 = (n) => String(n).padStart(2, '0');
export const adresse = (c, t, n, e) => `${c}-T${z2(t)}-N${n}-E${e}`;
export const decoupe = (a) => { const m = /^([A-C]\d)-T(\d+)-N(\d)-E(\d)$/.exec(String(a || '')); return m ? { c: m[1], t: +m[2], n: +m[3], e: +m[4] } : null; };
export const niveauDe = (a) => { const d = decoupe(a); return d ? `${d.c}-T${z2(d.t)}-N${d.n}` : ''; };
export const toutesDe = (site) => cotesDe(site).flatMap((c) => [1, 2, 3, 4].flatMap((t) => [1, 2, 3, 4].flatMap((n) => [1, 2, 3].map((e) => adresse(c, t, n, e)))));
export function planDe(site) {
  const P = PLANS[site];
  return {
    allees: P.allees.map((a) => ({ id: a, cotes: [`${a}1`, `${a}2`] })),
    cotes: Object.fromEntries(cotesDe(site).map((c) => [c, { charge: { ...P.plaques } }])),
    travees: 4, niveaux: 4, emplacements: 3,
    horsService: P.horsService.slice(),
    zones: { quais: ['QUAI 2'] },
  };
}

// LE STOCK DE DÉPART d'un site (le même pour toute la classe) : { adresse: { produit, kg } }.
const stocks = {};
export function stockDe(site) {
  if (!stocks[site]) {
    const H = hasard(`action-ent814|stock|${site}`), P = PLANS[site], S = {};
    cotesDe(site).forEach((c) => [1, 2, 3, 4].forEach((t) => [1, 2, 3, 4].forEach((n) => {
      if (n === 1) { [1, 2, 3].forEach((e) => { const k = H.choisir(CODES); if (H.reel() < 0.55) S[adresse(c, t, n, e)] = k; }); return; }
      if (n >= 3 && H.reel() < 0.4) {
        // Deux palettes lourdes dont la somme reste SOUS la plaque : un rack n'est jamais déjà surchargé.
        const libre = H.entier(1, 3);
        let paire;
        do { paire = [H.choisir(LOURDS), H.choisir(LOURDS)]; } while (poidsDe(paire[0]) + poidsDe(paire[1]) > P.plaques[n]);
        [1, 2, 3].filter((e) => e !== libre).forEach((e, i) => { S[adresse(c, t, n, e)] = paire[i]; });
        return;
      }
      H.prendre([1, 2, 3], H.entier(0, 2)).forEach((e) => { S[adresse(c, t, n, e)] = H.choisir(NON_LOURDS); });
    })));
    P.horsService.forEach((a) => { delete S[a]; });
    stocks[site] = Object.fromEntries(Object.entries(S).map(([a, k]) => [a, { produit: k, kg: poidsDe(k) }]));
  }
  return stocks[site];
}
// La charge que le stock de départ met sur le niveau de `a` ; la plaque de ce niveau ; l'emplacement est-il libre ?
export const chargeStock = (site, a) => { const n = niveauDe(a), S = stockDe(site); return Object.keys(S).filter((x) => niveauDe(x) === n).reduce((t, x) => t + S[x].kg, 0); };
export const plaqueDe = (site, a) => PLANS[site].plaques[decoupe(a).n];
export const libre = (site, a) => !stockDe(site)[a] && !PLANS[site].horsService.includes(a);
const tient = (site, a, k) => chargeStock(site, a) + poidsDe(k) <= plaqueDe(site, a) + 1e-9;
const depasse = (site, a, k) => chargeStock(site, a) + poidsDe(k) > plaqueDe(site, a) + 1e-9;

// ─────────────────────────────────────────────────────────────── le tirage
export const IDS_PALETTES = ['P1', 'P2', 'P3', 'P4', 'P5'];
// Les chiffres d'un rôle pour un produit : { systeme, reel } (couche du dessus jamais vide ; conforme : incomplète ; surplus : palette pleine et 1 à 3 cartons dessus).
function chiffres(role, k, h) {
  const par = parCouche(k), bas = par * (FORMATS[k].couches - 1), plein = pleine(k);
  if (role === 'ok') { const n = bas + h.entier(2, par - 1); return { systeme: n, reel: n }; }
  if (role === 'manque') { const e = h.entier(2, 4); const s = bas + h.entier(e + 2, par); return { systeme: s, reel: s - e }; }
  return { systeme: plein, reel: plein + h.entier(1, 3) };   // surplus
}
const allee = (a) => decoupe(a).c[0];
function tirerSite(site) {
  const ST = stockDe(site), TOUTES = toutesDe(site);
  const libresN = (filtre) => TOUTES.filter((a) => libre(site, a) && filtre(decoupe(a)));
  return (h) => {
    // P4 : un produit lourd en N3 ou N4, à une adresse libre dont le niveau (jamais déjà surchargé) dépasse la plaque avec elle.
    const k4 = h.choisir(LOURDS);
    const a4 = h.choisir(libresN((d) => d.n >= 3).filter((a) => depasse(site, a, k4) && chargeStock(site, a) <= plaqueDe(site, a)));
    // P3 : un produit normal ou léger en réserve, sur un autre niveau que P4, qui la porte.
    const k3 = h.choisir(NON_LOURDS);
    const a3 = h.choisir(libresN((d) => d.n >= 2).filter((a) => niveauDe(a) !== niveauDe(a4) && tient(site, a, k3)));
    // P1, P2, P5 : trois autres produits, tous différents ; P1 et P2 au sol, dans deux allées.
    const [k1, k2, k5] = h.prendre(CODES.filter((k) => k !== k3 && k !== k4), 3);
    const a1 = h.choisir(libresN((d) => d.n === 1));
    const a2 = h.choisir(libresN((d) => d.n === 1).filter((a) => allee(a) !== allee(a1)));
    // P5 : l'adresse donnée est PRISE (au sol, occupée par le stock), l'adresse libre est une autre travée, au sol, libre.
    const a5 = h.choisir(Object.keys(ST).filter((a) => decoupe(a).n === 1));
    const lib5 = h.choisir(libresN((d) => d.n === 1).filter((a) => a !== a1 && a !== a2 && niveauDe(a) !== niveauDe(a5) && niveauDe(a) !== niveauDe(a1) && niveauDe(a) !== niveauDe(a2)));
    const palettes = { P1: { produit: k1, adresse: a1 }, P2: { produit: k2, adresse: a2 }, P3: { produit: k3, adresse: a3 }, P4: { produit: k4, adresse: a4 },
      P5: { produit: k5, adresse: a5, libre: lib5 } };
    // Les quatre adresses à compter : quatre produits différents, au sol, occupées par le stock, jamais l'adresse d'une palette.
    const prises = new Set([a1, a2, a3, a4, a5, lib5]);
    const compter = [];
    h.melanger(PRODUITS_COMPTAGE).forEach((k) => {
      if (compter.length >= 4) return;
      const pool = Object.keys(ST).filter((a) => decoupe(a).n === 1 && ST[a].produit === k && !prises.has(a));
      if (pool.length) compter.push({ produit: k, adresse: h.choisir(pool) });
    });
    const roles = h.melanger(['ecart', 'ok', 'ok', 'ok']);
    const sens = h.choisir(['manque', 'surplus']);
    const liste = compter.map((x, i) => Object.assign(x, { role: roles[i] === 'ecart' ? sens : 'ok' }, chiffres(roles[i] === 'ecart' ? sens : 'ok', x.produit, h)))
      .sort((p, q) => (p.adresse < q.adresse ? -1 : 1)).map((x, i) => Object.assign({ rang: i + 1 }, x));
    return { site, palettes, comptage: liste };
  };
}
// Les contraintes d'équité, en clair (liste vide = jeu conforme ; sinon il est retiré). Rejouées sur 200 graines par le bloc de tests.
export function verifier(jeu) {
  const f = [];
  if (!jeu || !PLANS[jeu.site] || !jeu.palettes || !Array.isArray(jeu.comptage)) return ['jeu incomplet'];
  const site = jeu.site, P = jeu.palettes, ST = stockDe(site), TOUTES = new Set(toutesDe(site));
  if (IDS_PALETTES.some((id) => !P[id] || !PRODUITS[P[id].produit] || !TOUTES.has(P[id].adresse)) || !TOUTES.has(P.P5 && P.P5.libre)) return ['palette ou adresse inconnue'];
  const d = (a) => decoupe(a) || {};
  if (new Set(IDS_PALETTES.map((id) => P[id].produit)).size !== 5) f.push('deux palettes du même produit');
  if (!LOURDS.includes(P.P4.produit)) f.push('P4 n’est pas lourde');
  if (LOURDS.includes(P.P3.produit)) f.push('P3 est lourde');
  const adr = [...IDS_PALETTES.map((id) => P[id].adresse), P.P5.libre];
  if (new Set(adr).size !== 6) f.push('deux adresses de palette identiques');
  // P1, P2 : au sol, libres, dans deux allées.
  [P.P1.adresse, P.P2.adresse].forEach((a, i) => { if (d(a).n !== 1 || !libre(site, a)) f.push(`P${i + 1} pas à un emplacement libre au sol`); });
  if (allee(P.P1.adresse) === allee(P.P2.adresse)) f.push('P1 et P2 dans la même allée');
  // P3 : en réserve, libre, qui tient. P4 : N3 ou N4, libre, dépasse, jamais déjà surchargé.
  if (![2, 3, 4].includes(d(P.P3.adresse).n) || !libre(site, P.P3.adresse)) f.push('P3 pas à un emplacement libre en réserve');
  else if (!tient(site, P.P3.adresse, P.P3.produit)) f.push('P3 dépasse la plaque');
  if (![3, 4].includes(d(P.P4.adresse).n) || !libre(site, P.P4.adresse)) f.push('P4 pas à un emplacement libre en N3 ou N4');
  else {
    if (!depasse(site, P.P4.adresse, P.P4.produit)) f.push('P4 ne dépasse pas la plaque à son adresse');
    if (chargeStock(site, P.P4.adresse) > plaqueDe(site, P.P4.adresse)) f.push('le niveau de P4 dépasse déjà sa plaque sans elle');
  }
  if (niveauDe(P.P3.adresse) === niveauDe(P.P4.adresse)) f.push('P3 et P4 sur le même niveau');
  // P5 : adresse prise (au sol, stock), adresse libre (au sol, libre, une autre travée).
  if (d(P.P5.adresse).n !== 1 || !ST[P.P5.adresse] || PLANS[site].horsService.includes(P.P5.adresse)) f.push('l’adresse de P5 n’est pas occupée au sol');
  if (d(P.P5.libre).n !== 1 || !libre(site, P.P5.libre)) f.push('l’adresse libre de P5 n’est pas libre au sol');
  if (niveauDe(P.P5.libre) === niveauDe(P.P5.adresse)) f.push('l’adresse libre de P5 est dans la même travée que son adresse');
  // Le comptage : quatre adresses au sol occupées par leur produit, quatre produits, l'ordre de l'allée, 3 conformes + 1 écart, jamais l'adresse d'une palette.
  const L = jeu.comptage;
  if (L.length !== 4) return [...f, 'pas quatre adresses à compter'];
  if (L.some((x) => !FORMATS[x.produit] || !ST[x.adresse] || ST[x.adresse].produit !== x.produit || d(x.adresse).n !== 1)) return [...f, 'adresse à compter hors stock au sol'];
  if (new Set(L.map((x) => x.adresse)).size !== 4) f.push('deux fois la même adresse à compter');
  if (new Set(L.map((x) => x.produit)).size !== 4) f.push('un produit en double à compter');
  if (L.some((x) => adr.includes(x.adresse))) f.push('une adresse à compter est l’adresse d’une palette');
  if (L.some((x, i) => x.rang !== i + 1 || (i && L[i - 1].adresse >= x.adresse))) f.push('la liste n’est pas dans l’ordre de l’allée');
  const ecarts = L.filter((x) => x.role !== 'ok');
  if (ecarts.length !== 1 || !['manque', 'surplus'].includes(ecarts[0].role) || L.filter((x) => x.role === 'ok').length !== 3) f.push('rôles : 1 écart (manque ou surplus), 3 conformes');
  L.forEach((x) => {
    const par = parCouche(x.produit), plein = pleine(x.produit), bas = plein - par, e = x.reel - x.systeme;
    if (!(x.reel > bas)) f.push(`${x.adresse} : couche du dessus vide`);
    if (x.role === 'ok' && (e !== 0 || x.reel >= plein || x.reel - bas < 2)) f.push(`${x.adresse} : conforme mal formée`);
    if (x.role === 'manque' && (e < -4 || e > -2 || x.reel >= plein || x.reel - bas < 2)) f.push(`${x.adresse} : manque mal formé`);
    if (x.role === 'surplus' && (x.systeme !== plein || e < 1 || e > 3)) f.push(`${x.adresse} : surplus mal formé`);
  });
  return f;
}
const DECL = {};
IDS_SITES.forEach((s) => {
  DECL[s] = { tirer: tirerSite(s), verifier, essais: 40 };
  DECL[s].secours = tirerJeu({ ...DECL[s], secours: null }, `secours-action-ent814|${s}`).jeu;
  if (!DECL[s].secours) throw new Error(`ENT-8.14 : le tirage de ${s} ne donne aucun jeu conforme (tirer et verifier se contredisent)`);
});
export const TIRAGES = DECL;

const jeux = new Map();
// Le jeu d'une graine (l'identifiant de l'élève ; '' : le jeu de référence, vu par l'enseignant), toujours le même pour la même graine.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!jeux.has(g)) jeux.set(g, tirerJeu(DECL[siteDeGraine(g).id], `${g}|${ID}`).jeu);
  return jeux.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));

// ─────────────────────────────────────────────────────────────── l'entrepôt d'un élève (lot 0 : fonction de la graine)
export const CONSIGNE_RANGER = 'Ce matin : la réception d’hier à ranger, puis quelques adresses à compter.';   // vraie aux deux phases (le texte du personnage ne change pas au comptage)
export const CONSIGNE_COMPTER = 'Compte les adresses de la liste « À compter », avec le Terminal.';   // neutre : ni qu'il y a un écart, ni de quel côté
export const BOUTON_COMPTAGE = 'Passer au comptage';
// La déclaration de l'élève. En évaluation (copie) : pas de `verdict`, pas de `regles`, `rendCopie: false` (la copie se rend par le bandeau), un seul niveau.
export function entrepotDe(graine, { copie = true } = {}) {
  const S = siteDeGraine(graine), jeu = jeuDe(graine), Q = equipeDe(S), P = jeu.palettes;
  const pal = (id) => ({ id, nom: PRODUITS[P[id].produit].nom, cartons: PRODUITS[P[id].produit].cartons, kg: PRODUITS[P[id].produit].kg, adresse: P[id].adresse });
  return {
    id: ENTREPOT_ID, libelle: 'Plan de l’entrepôt', mode: 'palettier',
    personnage: { nom: Q.tuteur, role: Q.chef, date: 'mardi, 6 h', texte: { evaluation: CONSIGNE_RANGER } },
    plan: planDe(S.id),
    produits: Object.fromEntries(CODES.map((k) => [k, { nom: PRODUITS[k].nom, court: PRODUITS[k].court }])),
    stock: stockDe(S.id),
    palettes: [pal('P1'), pal('P2'), pal('P3'), { ...pal('P4'), aSignaler: true }, { ...pal('P5'), adresseLibre: P.P5.libre }],
    cariste: { nom: Q.cariste, niveaux: [2, 3, 4] },
    aideCharge: 'plaque',
    terminal: { nom: 'Terminal' },
    comptage: { adresses: jeu.comptage.map((x) => ({ adresse: x.adresse, produit: x.produit, systeme: x.systeme, reel: x.reel, couche: FORMATS[x.produit].couche.slice(), couches: FORMATS[x.produit].couches })),
      recompte: 'ecart' },
    phases: [{ id: 'rangement' }, { id: 'comptage', bouton: BOUTON_COMPTAGE, consigne: CONSIGNE_COMPTER }],
    ...(copie ? { rendCopie: false } : {}),
  };
}

// ─────────────────────────────────────────────────────────────── la fiche « Signaler l'écart » (choix, jugés sur LE SENS de l'écart de l'élève)
// Ce que je fais : une seule bonne réponse. Une cause : deux réponses justes par sens (une suffit). Les pièges d'un sens sont des causes qui iraient dans
// l'autre sens, ou absurdes (aucune cause plausible n'est donnée pour fausse : trois propositions de l'ENT-8.12 l'étaient). Texte CONSTRUIT, au « tu ».
export const FAIRE = [
  { v: 'signaler', lib: 'je le signale à mon tuteur' },
  { v: 'corriger', lib: 'je corrige le stock moi-même' },
  { v: 'rien', lib: 'je ne dis rien : c’est peut-être une erreur du système' },
];
export const FAIRE_JUSTE = 'signaler';
export const CAUSES = {
  manque: [
    { v: 'abimes', lib: 'des cartons abîmés ont été sortis sans être déclarés', juste: true },
    { v: 'ailleurs', lib: 'une partie des cartons a été rangée à une autre adresse', juste: true },
    { v: 'dessus', lib: 'des cartons d’une autre palette ont été posés dessus' },
    { v: 'pluie', lib: 'il a plu dans l’entrepôt' },
  ],
  surplus: [
    { v: 'dessus', lib: 'des cartons d’une autre palette du même produit ont été posés dessus', juste: true },
    { v: 'saisie', lib: 'une réception a été saisie avec trop peu de cartons', juste: true },
    { v: 'abimes', lib: 'des cartons abîmés ont été sortis sans être déclarés' },
    { v: 'double', lib: 'le système a compté deux fois la même réception' },
  ],
};
export const causesJustes = (sens) => CAUSES[sens].filter((c) => c.juste).map((c) => c.v);
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };
export const nomSens = (sens) => (sens === 'manque' ? 'il manque des cartons' : 'il y a des cartons en trop');
