// Boost — ENT-3.4, « évaluation de la tournée ». C2.4, organiser une tournée de livraison.
//
// Quatrième et dernière séance de C2.4 : l'ÉVALUATION (coefficient 3), après le guidage (3.1), l'entraînement
// (3.2) et l'erreur induite (3.3). Brief : `docs/briefs/ENT-3.4-boost-evaluation-tournee.md` ; questions ouvertes du
// brief tranchées par Claude le 26/10/2026, sur délégation de Tristan (« je te donne mon accord pour décider le poids
// des jalons et les questions au fil ») : même quartier qu'ENT-3.2 avec d'autres adresses, seuil de repérage 3 clics
// ratés, neuf jalons pondérés, la feuille porte tout (pas de cases de report), pas d'écran « Avant de commencer »
// (aucune séance de travail de Boost n'a de question clé à reprendre).
//
//   · une journée NEUVE : quatre nouveaux commerces à situer (adresses réelles, BAN), les quatre habituels d'ENT-3.2
//     avec d'autres commandes, un créneau chez un AUTRE client qu'en 3.2. Mêmes contraintes, aucune nouvelle :
//     charge utile, train, un créneau. Calée par `outils/carte/calibrer.mjs` (profil d'ENT-3.2 : un seul client
//     écartable, le plus court rate une contrainte, une minorité d'ordres tient tout) ;
//   · COPIE RENDUE (`copie: true`) : jauges muettes, aucun verdict, feuille sans « Vérifier », note figée à la remise ;
//   · les jalons lisent ce que l'élève a FAIT (les cases de la feuille, jugées ici par la grille ; le bilan de sa
//     tournée ; ses clics sur la carte), jamais `valide` ni `juge` (jamais posés en copie).
//
// La journée vient de `contenus/boost-ent34-carte.js`, GÉNÉRÉ par `outils/carte/construire.py` depuis
// `outils/carte/boost-ent34.json` — on ne le modifie pas à la main. `JOURNEE` reprend le `calibrage` du JSON (un test
// vérifie l'accord). L'optimum est RECALCULÉ ici (énumération des 5 040 ordres), jamais recopié.
//
// ── Ce qui est vérifié, ce qui est construit ────────────────────────────────────────────
// Boost, son métier et le vélo-cargo jusqu'à la gare : vérifiés (en-tête de `contenus/boost.js`). Les adresses des
// clients sont réelles (Base Adresse Nationale) ; les commerces, les poids, les colis et le créneau sont INVENTÉS.

import { creerTournee } from '../core/types/tournee.js';
import { creerCarte } from '../core/types/carte.js';
import { creerGrille } from '../core/types/grille.js';
import { CARTE } from './boost-ent34-carte.js';
import { ponderer } from './ponderation.js';

export const TRANSPORT_ID = 'boost-ent34';

/* ===================================================================== la journée ====== */

// Les mêmes valeurs que `calibrage` dans `outils/carte/boost-ent34.json` (un test vérifie l'accord).
export const JOURNEE = {
  depart: 14 * 60 + 35,
  limite: 16 * 60 + 7,
  chargeUtile: 190,
  vitesse: 14,          // vélo-cargo à assistance électrique
  service: 5,
};

export const CLIENTS = CARTE.clients;
export const NOUVEAUX = CLIENTS.filter((c) => c.nouveau);
export const TOTAL = CLIENTS.reduce((t, c) => t + c.kg, 0);
export const CRENEAU = CLIENTS.find((c) => c.creneau) || null;
// Le repérage : tous les nouveaux situés, et au plus ce nombre de clics sur une mauvaise rue en tout (brief §11, n° 2).
export const ESSAIS_MAX = 3;

const h = (m) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')}`;
const nomDe = (id) => (CLIENTS.find((c) => String(c.id) === String(id)) || {}).nom || id;

/* =================================================================== le plan (carte) ===== */

export const PLAN = {
  libelle: 'Plan de Nîmes',
  titre: `Situer les ${NOUVEAUX.length} nouveaux clients sur le plan de Nîmes`,
  consigne: `Les ${CLIENTS.length - NOUVEAUX.length} clients habituels sont déjà sur la carte. Situe les `
    + `${NOUVEAUX.length} nouveaux : cherche leur rue dans l’index, ouvre le quartier, puis clique sur la rue. `
    + 'Attention : chaque clic sur une autre rue compte.',
  carte: CARTE,
};

/* ===================================================================== la tournée ====== */

const N_CMD = CLIENTS.length;
const AIDE_HEURE = 'Une heure se tape avec deux-points, sans formule : par exemple 9:05.';
const AIDE_EN_MINUTES = 'Dans la feuille, une heure compte en minutes : 9:05 + 20 donne 9 h 25.';
const tous = (lire, refs) => { const v = refs.map(lire); return v.some((x) => x == null) ? null : v; };
const somme = (v) => (v == null ? null : v.reduce((t, x) => t + x, 0));

// La feuille EN COLONNES d'ENT-3.2, sans l'imprévu : mêmes adresses, mêmes formules (l'élève la connaît).
const L_CMD = 2;
export const LIGNES_HAUT = L_CMD + N_CMD + 1;
const L_BAS = LIGNES_HAUT + 2;
export const REF = {
  poids: CLIENTS.map((_, i) => `B${L_CMD + i}`),
  total: `B${L_CMD + N_CMD}`, ecart: `B${L_CMD + N_CMD + 1}`, quai: `B${L_BAS}`, charge: `B${L_BAS + 1}`,
  depart: 'F2', vitesse: 'F3', service: 'F4', chargeUtile: 'F5', train: 'F6', creneau: 'F7',
  km: `F${L_BAS}`, route: `F${L_BAS + 1}`, service2: `F${L_BAS + 2}`, gare: `F${L_BAS + 3}`,
  kmC: `F${L_BAS + 4}`, rangC: `F${L_BAS + 5}`, heureC: `F${L_BAS + 6}`,
};
export const REFS_DONNEES = [REF.depart, REF.vitesse, REF.service, REF.chargeUtile, REF.train, REF.creneau, ...REF.poids];
export const REFS_FORMULES = [REF.total, REF.ecart, REF.quai, REF.charge, REF.route, REF.service2, REF.gare, REF.heureC];

function feuille() {
  const R = REF;
  const lignes = (b) => {
    const n = b.retenus.length;
    const km = Math.round(b.km * 10) / 10;
    const CR = (b.creneaux || [])[0] || null;
    let kmC = null, rang = -1;
    if (CR) {
      rang = b.retenus.findIndex((p) => String(p.id) === String(CR.id));
      const arr = b.arrivees[String(CR.id)];
      if (rang >= 0 && b.departPose && arr != null) {
        kmC = Math.round(((arr - JOURNEE.depart - rang * JOURNEE.service) * JOURNEE.vitesse / 60) * 10) / 10;
      }
    }
    const rangDe = (id) => b.retenus.findIndex((p) => String(p.id) === String(id));
    const refQuai = (b.ecartes || []).map((p) => R.poids[CLIENTS.findIndex((c) => String(c.id) === String(p.id))]);
    const donnee = (libelle, attendu, o = {}) => ({ saisie: true, formule: false, attendu, libelle,
      placeholder: o.format === 'heure' ? 'hh:mm' : '', ...o });
    const formule = (libelle, attendu, o = {}) => ({ saisie: true, formule: true, attendu, libelle, ...o });
    const lib = (valeur, type) => ({ valeur, type });
    const hautG = [
      ...CLIENTS.map((c, i) => ({ A: `${i + 1} · ${c.nom}`, B: donnee(`poids de ${c.nom}`, c.kg), C: rangDe(c.id) >= 0 ? rangDe(c.id) + 1 : '' })),
      { A: lib('Poids total (kg)', 'resultat'), C: '',
        B: formule('poids total', (l) => somme(tous(l, R.poids)), { type: 'resultat', aide: `Additionne les ${N_CMD} poids avec SOMME.` }) },
      { A: lib('Poids à laisser à quai, au moins (kg)', 'resultat'), C: '',
        B: formule('poids à laisser à quai', (l) => { const v = tous(l, [R.total, R.chargeUtile]); return v && v[0] - v[1]; },
          { type: 'resultat', aide: 'Poids total − charge utile.' }) },
    ];
    const hautD = [
      { E: 'Heure de départ de l’entrepôt', F: donnee('heure de départ', JOURNEE.depart, { format: 'heure', aide: AIDE_HEURE }) },
      { E: 'Vitesse en ville (km/h)', F: donnee('vitesse', JOURNEE.vitesse) },
      { E: 'Temps par arrêt (min)', F: donnee('temps par arrêt', JOURNEE.service) },
      { E: lib('Charge utile du vélo-cargo (kg)', 'contrainte'), F: donnee('charge utile', JOURNEE.chargeUtile, { type: 'contrainte' }) },
      { E: lib('Départ du train', 'contrainte'), F: donnee('départ du train', JOURNEE.limite, { format: 'heure', type: 'contrainte', aide: AIDE_HEURE }) },
      { E: lib(CR ? `Limite du créneau (${CR.nom})` : 'Limite du créneau', 'contrainte'),
        F: CR ? donnee('limite du créneau', CR.avant, { format: 'heure', type: 'contrainte', aide: AIDE_HEURE }) : '' },
    ];
    const basG = [
      { A: 'Poids laissé à quai (kg)', C: '',
        B: formule('poids laissé à quai', (l) => (refQuai.length ? somme(tous(l, refQuai)) : 0),
          { aide: 'Le poids de ce que tu laisses à quai : la commande sans numéro d’arrêt. Désigne sa cellule.' }) },
      { A: lib('Poids chargé (kg)', 'resultat'), C: '',
        B: formule('poids chargé', (l) => (n ? (() => { const v = tous(l, [R.total, R.quai]); return v && v[0] - v[1]; })() : null),
          { type: 'resultat', aide: 'Poids total − poids laissé à quai.' }) },
    ];
    const basD = [
      { E: 'Distance du parcours (km)', F: km },
      { E: lib('Temps de route (min)', 'etape'),
        F: formule('temps de route', (l) => { const v = tous(l, [R.km, R.vitesse]); return v && v[1] ? v[0] / v[1] * 60 : null; },
          { tolerance: 0.5, type: 'etape', aide: 'Distance ÷ vitesse donne des heures ; × 60 pour des minutes.' }) },
      { E: lib('Temps aux arrêts (min)', 'etape'),
        F: formule('temps aux arrêts', (l) => { const v = l(R.service); return v == null || !n ? null : n * v; },
          { type: 'etape', aide: 'Nombre d’arrêts × temps par arrêt (compte tes arrêts dans la colonne C).' }) },
      { E: lib('Heure d’arrivée à la gare', 'resultat'),
        F: formule('heure d’arrivée à la gare', (l) => somme(tous(l, [R.depart, R.route, R.service2])),
          { tolerance: 0.5, format: 'heure', type: 'resultat', aide: `Heure de départ + temps de route + temps aux arrêts. ${AIDE_EN_MINUTES}` }) },
      { E: CR ? `Distance jusqu’à ${CR.nom} (km)` : '', F: !CR ? '' : (kmC == null ? '(pose le départ et ce client)' : kmC) },
      { E: CR ? 'Arrêts servis avant lui' : '', F: !CR ? '' : (rang < 0 ? '(pose ce client)' : rang) },
      { E: lib(CR ? `Heure d’arrivée chez ${CR.nom}` : '', 'resultat'),
        F: !CR || kmC == null ? '' : formule('heure d’arrivée chez le client à créneau', (l) => {
          const v = tous(l, [R.depart, R.kmC, R.vitesse, R.rangC, R.service]);
          return v && v[2] ? v[0] + v[1] / v[2] * 60 + v[3] * v[4] : null;
        }, { tolerance: 0.5, format: 'heure', type: 'resultat',
          aide: `Heure de départ + temps de route jusqu’à lui (distance ÷ vitesse × 60) + arrêts déjà servis × temps par arrêt. ${AIDE_EN_MINUTES}` }) },
    ];
    const VIDE_G = { A: '', B: '', C: '' }, VIDE_D = { E: '', F: '' };
    const fusion = (g, d) => Array.from({ length: Math.max(g.length, d.length) },
      (_, i) => Object.assign({ D: '' }, g[i] || VIDE_G, d[i] || VIDE_D));
    const tete = { A: 'Commandes du jour (ordre du mail)', B: 'Poids (kg)', C: 'Arrêt n°', D: '',
      E: 'Données de la journée (à chercher dans le mail)', F: '', entete: true };
    const teteBas = { A: 'Après la tournée', B: '', C: '', D: '', E: 'Calcul des heures', F: '', entete: true };
    return [tete, ...fusion(hautG, hautD), teteBas, ...fusion(basG, basD)];
  };
  return {
    titre: 'Feuille de calcul du vélo-cargo',
    consigne: 'Clique une cellule, puis écris dans la barre au-dessus du tableau : les données du mail se tapent, '
      + 'les calculs sont des formules (elles commencent par « = »). La colonne « Arrêt n° » suit ta tournée : '
      + 'vide, la commande reste à quai. Évaluation : la feuille n’est pas corrigée avant la remise de ta copie.',
    colonnes: ['A', 'B', 'C', 'D', 'E', 'F'],
    decimales: 1,
    aides: 'bouton',
    affichage: 'tableur',
    lignes,
  };
}

const casesDe = (e) => (e && e.grille && e.grille.cases) || {};
const rempli = (v) => v != null && String(v).trim() !== '';
const REFS_HAUT = [...REF.poids, REF.total, REF.ecart, REF.depart, REF.vitesse, REF.service, REF.chargeUtile, REF.train, REF.creneau];
// Les onglets d'ENT-3.2 : les pastilles disent ce qui est FAIT, jamais si c'est juste.
export const ONGLETS = [
  { id: 'donnees', libelle: 'Données et poids', contenu: 'feuille', lignesFeuille: LIGNES_HAUT,
    texte: 'Dans la feuille, tape les données du mail et le poids de chaque commande, puis calcule le poids total '
      + 'et ce qu’il faut au moins laisser à quai. Décide quelle commande reste à quai.',
    fait: (db, e) => REFS_HAUT.every((r) => rempli(casesDe(e)[r])) },
  { id: 'tournee', libelle: 'Tournée', contenu: 'tournee',
    texte: 'Clique l’entrepôt, les clients dans l’ordre de passage, puis la gare. La commande que tu laisses à quai '
      + 'ne se clique pas.',
    fait: (db, e) => !!(e && e.ordre && e.ordre.length && e.depart && e.arrivee) },
  { id: 'heures', libelle: 'Heures', contenu: 'calcul',
    texte: 'En bas de la feuille, « Après la tournée » : le poids chargé, l’heure d’arrivée à la gare et chez le client '
      + 'à créneau. Compare-les aux contraintes, à droite. Quand tout est prêt, rends ta copie (bandeau du haut).',
    fait: (db, e) => [REF.charge, REF.gare, REF.heureC].every((r) => rempli(casesDe(e)[r])) },
];

export const TOURNEE = {
  libelle: 'Tournée de l’après-midi',
  titre: 'Organiser la tournée du vélo-cargo',
  consigne: '',
  departAQuai: true,
  libelleCharge: 'Chargé dans le vélo-cargo',
  libelleQuai: 'Commandes restées à quai',
  libelleCharger: 'charger',
  jaugesRepere: true,
  extremitesACliquer: true,
  contraintesDansGrille: true,
  onglets: ONGLETS,
  grille: feuille(),
  mesures: [
    { id: 'charge', libelle: 'Charge du vélo-cargo', unite: 'kg', champ: 'kg', max: JOURNEE.chargeUtile,
      comparaison: 'À comparer au poids chargé dans la feuille (cellule violette).' },
    { id: 'colis', libelle: 'Colis chargés', unite: 'colis', champ: 'colis' },
  ],
  horaire: {
    depart: JOURNEE.depart, limite: JOURNEE.limite, vitesse: JOURNEE.vitesse, service: JOURNEE.service,
    libelleLimite: 'départ du train',
    comparaison: 'À comparer à l’heure d’arrivée à la gare (cellule violette).',
  },
};

/* ===================================================== le calcul de la meilleure tournée == */
const dist = (a, b) => CARTE.trajets[`${a}|${b}`].m;
function* permutations(a) {
  if (a.length < 2) { yield a; return; }
  for (let i = 0; i < a.length; i++) {
    for (const p of permutations([...a.slice(0, i), ...a.slice(i + 1)])) yield [a[i], ...p];
  }
}
// Le seul client dont le poids suffit, à lui seul, à ramener la charge sous la limite.
export const A_QUAI = (() => {
  const trop = TOTAL - JOURNEE.chargeUtile;
  const seuls = CLIENTS.filter((c) => c.kg >= trop);
  return seuls.length === 1 ? String(seuls[0].id) : null;
})();
let _optimum;
export function optimum() {
  if (_optimum !== undefined) return _optimum;
  const S = CLIENTS.filter((c) => String(c.id) !== A_QUAI);
  let meilleur = null;
  if (A_QUAI) {
    for (const p of permutations(S.map((c) => String(c.id)))) {
      const ch = ['depart', ...p, 'arrivee'];
      let m = 0, tient = true;
      for (let i = 1; i < ch.length; i++) {
        m += dist(ch[i - 1], ch[i]);
        if (i < ch.length - 1) {
          const c = S.find((x) => String(x.id) === ch[i]);
          const arr = JOURNEE.depart + m / 1000 / JOURNEE.vitesse * 60 + (i - 1) * JOURNEE.service;
          if (c.creneau && arr > c.creneau.avant) { tient = false; break; }
        }
      }
      if (!tient) continue;
      if (JOURNEE.depart + m / 1000 / JOURNEE.vitesse * 60 + S.length * JOURNEE.service > JOURNEE.limite) continue;
      if (!meilleur || m < meilleur.m) meilleur = { p, m };
    }
  }
  _optimum = meilleur ? { ordre: meilleur.p, km: meilleur.m / 1000 } : null;
  return _optimum;
}

/* ====================================================================== l'accueil ===== */

export const ACCUEIL = {
  titre: 'Évaluation : ta tournée, seul(e)',
  kpis: ['mail'],
  etapes: [
    ['Lire la consigne de M. Morin', 'Menu Messagerie : les huit commandes et les contraintes du jour.'],
    ['Situer les nouveaux clients', `Menu Plan de Nîmes : ${NOUVEAUX.length} clients à placer. Chaque clic sur une autre rue compte.`],
    ['Décider ce qui part', `Calcule dans la feuille ce qu’il faut au moins laisser à quai (charge utile ${JOURNEE.chargeUtile} kg), puis choisis la commande.`],
    ['Construire la tournée', 'Menu Tournée : l’entrepôt, tes clients dans l’ordre de passage, puis la gare. Elle doit tenir le train et le créneau, en roulant le moins possible.'],
    ['Calculer tes heures', 'En bas de la feuille. L’écran ne te dit pas si les limites sont tenues : c’est ton calcul qui le montre.'],
    ['Rendre ta copie', 'Une seule fois, par le bouton « Rendre ma copie ». Ensuite, plus rien ne se modifie.'],
  ],
};

/* ======================================================================== le volet ==== */

export const VOLET = {
  id: 'boost-ent34',
  semer(prenom) {
    const now = Date.now();
    const fiche = CLIENTS
      .map((c, i) => `${i + 1}. ${c.nom} — ${c.adresse} — ${c.colis} colis, ${c.kg} kg`
        + (c.creneau ? ` — ${c.creneau.libelle}` : '')
        + (c.nouveau ? ' (nouveau client)' : ''))
      .join('\n');
    return {
      mails: [
        { folder: 'in', ts: now - 3600e3 * 2, from: 'M. Morin, responsable d’exploitation',
          fromMail: 'exploitation@boost.example', to: prenom,
          subject: `Tournée vélo-cargo de cet après-midi — départ ${h(JOURNEE.depart)}`, kind: 'text',
          text: `Bonjour ${prenom},\n\nCet après-midi, tu prépares la tournée du vélo-cargo seul(e) : je suis en réunion tout l’après-midi. `
            + `Les colis partent en vélo-cargo jusqu’à la gare de Nîmes-Centre, puis en train. Le train de Paris part à `
            + `${h(JOURNEE.limite)}, et un colis qui arrive après est livré un jour plus tard.\n\n`
            + `Le vélo-cargo emporte au plus ${JOURNEE.chargeUtile} kg. Tu pars de l’entrepôt à ${h(JOURNEE.depart)}, `
            + `compte ${JOURNEE.service} minutes par arrêt et ${JOURNEE.vitesse} km/h en ville.\n\n`
            + `Voici les ${CLIENTS.length} commandes :\n\n${fiche}\n\n`
            + (CRENEAU ? `Attention : ${CRENEAU.nom} ne reçoit ses livraisons qu’avant ${h(CRENEAU.creneau.avant)}. `
              + 'Passé cette heure, personne ne pourra la recevoir.\n\n' : '')
            + `Comme d’habitude : situe les ${NOUVEAUX.length} nouveaux clients, calcule ce qui reste à quai, construis une `
            + `tournée qui tient le train${CRENEAU ? ' et le créneau' : ''} en roulant le moins possible, et calcule tes heures dans la feuille.\n\n`
            + `Bon courage,\nM. Morin` },
      ],
    };
  },
};

/* ============================ Les jalons (lus à la remise de la copie) ============================
 * Neuf jalons, poids décidés le 26/10/2026 (délégation de Tristan) : le cœur de C2.4 — la bonne commande à quai,
 * les trois contraintes tenues, les formules — pèse 12 ; le repérage et les données recopiées 4 ; le trajet court 4.
 * Ils lisent ce que l'élève a FAIT : la carte (`places`, `essais`), la tournée (bilan de la vue) et les cases de la
 * feuille, jugées ici par la grille. Jamais `valide` ni `juge`. Une copie vide vaut 0 (aucun jalon vrai par inaction).
 */
const VUE = creerTournee(Object.assign({ plan: PLAN }, TOURNEE));
const VUE_CARTE = creerCarte(PLAN);
const GRILLE = creerGrille(TOURNEE.grille);

const etatDe = (db, vue) => (db && db.transport && db.transport[TRANSPORT_ID] ? db.transport[TRANSPORT_ID][vue] : null);
const commencee = (e) => !!(e && e.ordre && (e.ordre.length > 0 || e.depart || e.arrivee));
const bonChargement = (e) => {
  const quai = (e.quai || []).map(String);
  return !!A_QUAI && quai.length === 1 && quai[0] === A_QUAI;
};
// La feuille jugée sur la tournée de l'élève (la colonne « Arrêt n° » et la distance en dépendent).
export function jugeFeuille(db) {
  const e = etatDe(db, 'tournee');
  if (!e) return {};
  return GRILLE.juger(TOURNEE.grille.lignes(VUE.bilan(e)), casesDe(e));
}
const ko = (detail) => ({ status: 'ko', detail });

function jalonTrajet(marge) {
  return (db) => {
    const e = etatDe(db, 'tournee');
    if (!commencee(e)) return ko('Aucune tournée construite.');
    const opt = optimum();
    if (!opt) return { status: 'na', detail: 'Journée mal calée : pas de meilleure tournée.' };
    const b = VUE.bilan(e);
    if (!b.complete) return ko('La tournée ne part pas de l’entrepôt ou ne finit pas à la gare.');
    if (!bonChargement(e)) return ko('Le chargement n’est pas le bon : la distance ne se juge pas.');
    if (b.cumuls.charge > JOURNEE.chargeUtile) return ko('Le vélo-cargo est surchargé.');
    if (b.enRetard || b.creneauRate) return ko(`La tournée ne tient pas ${b.enRetard ? 'le train' : 'le créneau'} : la distance ne se juge pas.`);
    const ecart = (b.km / opt.km - 1) * 100;
    const detail = `${b.km.toFixed(1)} km pour une meilleure tournée de ${opt.km.toFixed(1)} km (${ecart >= 0 ? '+' : ''}${ecart.toFixed(1)} %), `
      + `seuil ${Math.round(marge * 100)} %.`;
    return { status: b.km <= opt.km * (1 + marge) + 1e-9 ? 'ok' : 'ko', detail };
  };
}
// Un jalon de contrainte : jugé seulement sur une tournée chargée, partie de l'entrepôt (et finie à la gare pour le train).
function contrainte(e, quoi) {
  if (!commencee(e)) return ko('Aucune tournée construite.');
  const b = VUE.bilan(e);
  if (!b.retenus.length) return ko('Rien n’est chargé.');
  if (quoi !== 'charge' && b.cumuls.charge > JOURNEE.chargeUtile) return ko('Le vélo-cargo est surchargé : cette contrainte ne veut rien dire.');
  return b;
}

const JALONS = [
  {
    id: 'reperage',
    titre: `Les ${NOUVEAUX.length} nouveaux clients situés, au plus ${ESSAIS_MAX} clics sur une autre rue`,
    verifier(db) {
      const b = VUE_CARTE.bilan(etatDe(db, 'plan'));
      const detail = `${b.places} client(s) sur ${b.nouveaux} situé(s) ; ${b.essais} clic(s) sur une autre rue.`;
      return { status: b.places === b.nouveaux && b.essais <= ESSAIS_MAX ? 'ok' : 'ko', detail };
    },
  },
  {
    id: 'donnees',
    titre: 'Les données du mail recopiées justes dans la feuille (journée et poids)',
    verifier(db) {
      const j = jugeFeuille(db);
      const faux = REFS_DONNEES.filter((r) => j[r] !== 'ok');
      return faux.length ? ko(`Données fausses ou manquantes : ${faux.join(', ')}.`) : { status: 'ok', detail: 'Toutes justes.' };
    },
  },
  {
    id: 'choix',
    titre: 'Le poids à écarter calculé, et la bonne commande laissée à quai',
    verifier(db) {
      const e = etatDe(db, 'tournee');
      if (!commencee(e)) return ko('Aucune tournée construite.');
      const j = jugeFeuille(db);
      const calculOk = j[REF.total] === 'ok' && j[REF.ecart] === 'ok';
      const quai = (e.quai || []).map(String);
      const detail = `Calcul du poids à écarter : ${calculOk ? 'juste' : 'faux ou absent'} ; `
        + (quai.length ? `à quai : ${quai.map(nomDe).join(', ')}.` : 'rien n’est à quai.');
      return { status: calculOk && bonChargement(e) ? 'ok' : 'ko', detail };
    },
  },
  {
    id: 'charge',
    titre: 'La charge utile du vélo-cargo est respectée',
    verifier(db) {
      const b = contrainte(etatDe(db, 'tournee'), 'charge');
      if (b.status) return b;
      return { status: b.cumuls.charge <= JOURNEE.chargeUtile ? 'ok' : 'ko',
        detail: `${b.cumuls.charge} kg chargés sur ${JOURNEE.chargeUtile} kg utiles.` };
    },
  },
  {
    id: 'horaire',
    titre: `Le train de ${h(JOURNEE.limite)} est attrapé`,
    verifier(db) {
      const b = contrainte(etatDe(db, 'tournee'), 'horaire');
      if (b.status) return b;
      if (!b.complete || b.arrivee == null) return ko('La tournée ne part pas de l’entrepôt ou ne finit pas à la gare.');
      return { status: b.enRetard ? 'ko' : 'ok', detail: `Arrivée à la gare à ${h(b.arrivee)} pour un train à ${h(JOURNEE.limite)}.` };
    },
  },
  {
    id: 'creneau',
    titre: CRENEAU ? `Le créneau de ${CRENEAU.nom} est tenu` : 'Le créneau de livraison est tenu',
    verifier(db) {
      const b = contrainte(etatDe(db, 'tournee'), 'creneau');
      if (b.status) return b;
      if (!b.departPose) return ko('La tournée ne part pas de l’entrepôt.');
      const c = b.creneaux.find((x) => x.charge);
      if (!c) return ko(`${CRENEAU ? CRENEAU.nom : 'Le client à créneau'} n’est pas dans la tournée.`);
      return { status: c.rate ? 'ko' : 'ok', detail: `Arrivée chez ${c.nom} à ${h(c.arrivee)} pour une limite à ${h(c.avant)}.` };
    },
  },
  {
    id: 'formules',
    titre: 'Les formules de la feuille de calcul sont justes',
    verifier(db) {
      if (!commencee(etatDe(db, 'tournee'))) return ko('Aucune tournée construite.');
      const j = jugeFeuille(db);
      const faux = REFS_FORMULES.filter((r) => j[r] !== 'ok');
      return faux.length ? ko(`Cellules fausses ou vides : ${faux.join(', ')}.`) : { status: 'ok', detail: 'Toutes les formules sont justes.' };
    },
  },
  { id: 'trajet10', titre: 'La tournée tient tout, à moins de 10 % de la meilleure tournée possible', verifier: jalonTrajet(0.10) },
  { id: 'trajet5', titre: 'La tournée tient tout, à moins de 5 % de la meilleure tournée possible', verifier: jalonTrajet(0.05) },
];

export const BAREME = {
  reperage: [2],
  donnees: [2],
  choix: [3],
  charge: [2],
  horaire: [2],
  creneau: [2],
  formules: [3],
  trajet10: [2],
  trajet5: [2],
};
export const ETAPES = ponderer(JALONS, BAREME, 'ENT-3.4');
