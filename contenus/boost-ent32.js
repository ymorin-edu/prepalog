// Boost — ENT-3.2, « la tournée sous contrainte ». C2.4, organiser une tournée de livraison.
//
// Deuxième des quatre séances de C2.4 : l'ENTRAÎNEMENT. ENT-3.1 (guidage) a appris le geste —
// situer, charger, ordonner, calculer. Ici l'élève refait ce geste sur une AUTRE journée, avec
// une contrainte de plus et moins de béquilles. Décisions de Tristan, 02/10/2026, dans
// `claude/prepalog-boost-cadrage-ent32-34.md` :
//
//   · nouvelle journée : huit clients (dont quatre nouveaux à situer), d'autres poids ;
//   · un CRÉNEAU de livraison : la Pâtisserie Arnaud n'accepte qu'avant une heure donnée. L'ordre compte
//     vraiment — le trajet le plus court rate ce créneau (vérifié par `outils/carte/calibrer.mjs`) ;
//   · jauges MUETTES : elles donnent la limite, jamais le total. Le client à laisser à quai se
//     trouve par le calcul (poids total − charge utile) dans la feuille, pas « en cliquant au hasard » ;
//   · le trajet le plus court compte, en paliers : à moins de 10 %, puis à moins de 5 % de la
//     meilleure tournée qui tient tout. L'optimum est RECALCULÉ ici (énumération des 5 040
//     ordres), jamais recopié : si un client change, le jalon suit.
//
// La journée vient de `contenus/boost-ent32-carte.js`, GÉNÉRÉ par `outils/carte/construire.py`
// depuis `outils/carte/boost-ent32.json` — on ne le modifie pas à la main.
//
// ── Ce que la séance ne fait pas ────────────────────────────────────────────────────────
// Pas de cases de report : la feuille de calcul porte tout le travail chiffré, et c'est elle
// que le jalon « formules » note. Le refus d'une tournée qui ne tient pas se lit sur les
// jauges (pastille « créneau raté », « train manqué ») dès que la chaîne est complète.
// Pas de trame élève : déclarer une trame, c'est la valider.
//
// ── L'imprévu (phase 2), chantier C du plan Boost, 03/10/2026 ───────────────────────────
// Brief `docs/briefs/ENT-3.2-imprevu.md`. En 3.1 l'élève construit une fois ; ici il S'ADAPTE.
// Quand sa tournée tient tout ET que sa feuille de calcul est vérifiée juste (choix de Tristan :
// il a fini la phase 1 et a eu le temps de chercher plus court), un message de M. Morin arrive :
// l'Atelier Ribot annule, la Pâtisserie Arnaud n'a plus de créneau, l'Épicerie Roussel ferme
// tôt, la Cave Teissier reste à quai. Les données de l'imprévu sont dans
// `contenus/boost-ent32-imprevu.js` (calées par `outils/carte/calibrer.mjs`) ; le moteur les lit
// comme une PHASE de la tournée (`phases` dans `core/types/tournee.js`), et le message arrive par
// `volet.declencheurs` (`core/types/entreprise.js`). Une seule fois, marqué dans la base.
//
// Après le message, l'écran ne dit plus si les limites tiennent (`sansVerdict` de la phase) :
// l'élève recalcule dans la feuille. Les neuf jalons de la phase 1 sont FIGÉS à l'arrivée du
// message (ils lisent la tournée et la feuille gardées dans `phase.avant`) ; deux jalons de
// phase 2 s'ajoutent. TOUT est construit : commerces, annulation, fermeture, message.
//
// ENT-3.3 reprend `TOURNEE` (sans phases) : l'imprévu n'existe que dans `TOURNEE_IMPREVU`, que
// seule l'activité ENT-3.2 déclare.

import { creerTournee } from '../core/types/tournee.js';
import { creerCarte } from '../core/types/carte.js';
import { CARTE } from './boost-ent32-carte.js';
import { IMPREVU } from './boost-ent32-imprevu.js';

export const TRANSPORT_ID = 'boost-ent32';

/* ===================================================================== la journée ====== */

// La journée PROPRE à ENT-3.2 (et 3.3, même jour de travail) — chantier D, lot 2, jeu A choisi par
// Tristan le 03/10/2026 parmi trois calés par `outils/carte/calibrer.mjs`. Elle ne lit plus `VELO`
// (la journée d'ENT-3.1) : les données changent d'une séance à l'autre. Les mêmes valeurs sont dans
// `outils/carte/boost-ent32.json` (`calibrage`), que lit le script, et un test vérifie l'accord.
export const JOURNEE = {
  depart: 14 * 60 + 35,
  limite: 16 * 60 + 15,
  chargeUtile: 190,
  vitesse: 14,          // vélo-cargo à assistance électrique
  service: 5,
};

export const CLIENTS = CARTE.clients;
export const NOUVEAUX = CLIENTS.filter((c) => c.nouveau);
export const TOTAL = CLIENTS.reduce((t, c) => t + c.kg, 0);
export const CRENEAU = CLIENTS.find((c) => c.creneau) || null;

const h = (m) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')}`;
const nomDe = (id) => (CLIENTS.find((c) => String(c.id) === String(id)) || {}).nom || id;

/* =================================================================== le plan (carte) ===== */

export const PLAN = {
  libelle: 'Plan de Nîmes',
  titre: `Situer les ${NOUVEAUX.length} nouveaux clients sur le plan de Nîmes`,
  consigne: `Les ${CLIENTS.length - NOUVEAUX.length} clients habituels sont déjà sur la carte. Situez les `
    + `${NOUVEAUX.length} nouveaux : cherchez leur rue dans l’index, ouvrez le quartier, puis cliquez sur la rue.`,
  carte: CARTE,
};

/* ================================================================= la tournée (carte) ==== */

export const TOURNEE = {
  libelle: 'Tournée de l’après-midi',
  titre: 'Organiser la tournée du vélo-cargo',
  consigne: `Le vélo-cargo part de l’entrepôt à ${h(JOURNEE.depart)} et doit être à la gare de `
    + `Nîmes-Centre avant ${h(JOURNEE.limite)}, départ du train pour Paris. Il emporte au plus `
    + `${JOURNEE.chargeUtile} kg. Les ${CLIENTS.length} commandes dépassent cette charge : décidez ce qui reste à quai`
    + (CRENEAU ? `. Attention : ${CRENEAU.nom} n’accepte sa livraison qu’avant ${h(CRENEAU.creneau.avant)}.` : '.')
    + ' Cliquez l’entrepôt, les clients dans l’ordre de passage, puis la gare. Le tracé suit les rues ; '
    + 'les kilomètres sont ceux de l’itinéraire à vélo-cargo.',
  departAQuai: true,
  libelleCharge: 'Chargé dans le vélo-cargo',
  libelleQuai: 'Commandes restées à quai',
  libelleCharger: 'charger',
  // Jauges muettes : la limite, jamais le total (décision de Tristan, 02/10). Sans quoi la Cave
  // Teissier se trouve « en cliquant au hasard » et la feuille de calcul est décorative.
  jaugesRepere: true,
  extremitesACliquer: true,
  contraintesDansGrille: true,
  grille: null,   // posée plus bas : `feuilleColonnes()`
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

/* ============================================================ la feuille de calcul ==== */
const N_CMD = CLIENTS.length;
const AIDE_HEURE = 'Une heure se tape avec deux-points, sans formule : par exemple 9:05.';
const AIDE_EN_MINUTES = 'Dans la feuille, une heure compte en minutes : 9:05 + 20 donne 9 h 25.';
// Un résultat qui dépend de cases de la feuille de l'élève : `null` tant que l'une d'elles est vide.
const tous = (lire, refs) => { const v = refs.map(lire); return v.some((x) => x == null) ? null : v; };
const somme = (v) => (v == null ? null : v.reduce((t, x) => t + x, 0));

// EN COLONNES, comme un tableur (chantier F, livré le 03/10/2026 ; avant, 38 lignes en trois blocs).
// Tristan, le 03/10/2026 : la feuille de 38 lignes est « trop grande, pas ergonomique », et il
// n'aime pas « la répétition » — les poids tapés dans « Commandes du jour », puis répétés dans le
// bloc « Tournée ». Choix de Tristan : UN SEUL TABLEAU DES COMMANDES.
//
// Deux parties, pour les ONGLETS de la vue (décisions de Tristan du 03/10/2026 : « organiser la page
// en fonction du parcours élève ») : l'onglet « Données et poids » ne montre que le HAUT (lignes 1 à
// 11), l'onglet « Heures » la feuille entière.
//
//        A                                 B           C          D   E                        F
//    1   Commandes du jour (ordre du mail) Poids (kg)  Arrêt n°       Données de la journée
//    2…9 un client par ligne               (à taper)   (rempli)       départ, vitesse, temps par
//                                                                     arrêt, charge utile, train,
//                                                                     créneau (lignes 2 à 7, à taper)
//   10   Poids total (kg)                  =SOMME
//   11   Poids à laisser à quai, au moins  formule
//   12   Après la tournée                                             Calcul des heures
//   13   Poids laissé à quai (kg)          formule                    Distance du parcours (km)
//   14   Poids chargé (kg)                 formule                    Temps de route (min)
//   15…19                                                             temps aux arrêts, arrivée à la gare,
//                                                                     créneau : distance, rang, heure
//
// La colonne « Arrêt n° » se remplit toute seule d'après la tournée cliquée : vide = à quai. Le poids
// laissé à quai se désigne (la cellule du client sans numéro) et le poids chargé = total − à quai :
// plus de second bloc qui répète. Les adresses ne bougent jamais (`REF`). Aides derrière « ? Aide »
// sous la barre de formule (choix de Tristan) ; couleurs des étapes et des résultats case par case.
// « Une erreur de lecture ne se paie qu'une fois » : les cases calculées se jugent sur ce que l'élève
// a TAPÉ (`attendu: (lire) => …`).
const L_CMD = 2;                                   // première commande, ligne 2
export const LIGNES_HAUT = L_CMD + N_CMD + 1;      // la partie « Données et poids » : lignes 1 à 11
const L_BAS = LIGNES_HAUT + 2;                     // première ligne sous « Après la tournée » : 13
export const REF = {
  poids: CLIENTS.map((_, i) => `B${L_CMD + i}`),
  total: `B${L_CMD + N_CMD}`, ecart: `B${L_CMD + N_CMD + 1}`, quai: `B${L_BAS}`, charge: `B${L_BAS + 1}`,
  depart: 'F2', vitesse: 'F3', service: 'F4', chargeUtile: 'F5', train: 'F6', creneau: 'F7',
  km: `F${L_BAS}`, route: `F${L_BAS + 1}`, service2: `F${L_BAS + 2}`, gare: `F${L_BAS + 3}`,
  kmC: `F${L_BAS + 4}`, rangC: `F${L_BAS + 5}`, heureC: `F${L_BAS + 6}`,
};
// Les cases de DONNÉES (lues dans le mail) et les cases de FORMULES : deux jalons distincts.
export const REFS_DONNEES = [REF.depart, REF.vitesse, REF.service, REF.chargeUtile, REF.train, REF.creneau, ...REF.poids];
export const REFS_FORMULES = [REF.total, REF.ecart, REF.quai, REF.charge, REF.route, REF.service2, REF.gare, REF.heureC];
// Les deux cases que lit le jalon « choix ».
export const REF_TOTAL = REF.total;
export const REF_ECART = REF.ecart;

export function feuilleColonnes() {
  const R = REF;
  const lignes = (b) => {
    const n = b.retenus.length;
    const an = b.annules || [];
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
    // Le HAUT : les commandes (poids à taper, arrêt n° rempli) et les données de la journée.
    const hautG = [
      ...CLIENTS.map((c, i) => (an.includes(String(c.id))
        // Après l'imprévu, la commande annulée garde sa ligne (les adresses ne bougent pas) mais pèse 0 kg.
        ? { A: `${i + 1} · ${c.nom} — annulée`, B: 0, C: '' }
        : { A: `${i + 1} · ${c.nom}`, B: donnee(`poids de ${c.nom}`, c.kg), C: rangDe(c.id) >= 0 ? rangDe(c.id) + 1 : '' })),
      { A: lib('Poids total (kg)', 'resultat'), C: '',
        B: formule('poids total', (l) => somme(tous(l, R.poids)), { type: 'resultat', aide: `Additionnez les ${N_CMD} poids avec SOMME.` }) },
      { A: lib('Poids à laisser à quai, au moins (kg)', 'resultat'), C: '',
        B: formule('poids à laisser à quai', (l) => { const v = tous(l, [R.total, R.chargeUtile]); return v && v[0] - v[1]; },
          { type: 'resultat', aide: 'Poids total − charge utile : ce qu’il faut au minimum retirer du vélo-cargo.' }) },
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
    // Le BAS, « après la tournée » : ce qui part, et les heures.
    const basG = [
      { A: 'Poids laissé à quai (kg)', C: '',
        B: formule('poids laissé à quai', (l) => (refQuai.length ? somme(tous(l, refQuai)) : 0),
          { aide: 'Le poids de ce que vous laissez à quai : la commande sans numéro d’arrêt. Désignez sa cellule.' }) },
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
          { type: 'etape', aide: 'Nombre d’arrêts × temps par arrêt (comptez vos arrêts dans la colonne C).' }) },
      { E: lib('Heure d’arrivée à la gare', 'resultat'),
        F: formule('heure d’arrivée à la gare', (l) => somme(tous(l, [R.depart, R.route, R.service2])),
          { tolerance: 0.5, format: 'heure', type: 'resultat', aide: `Heure de départ + temps de route + temps aux arrêts. ${AIDE_EN_MINUTES}` }) },
      { E: CR ? `Distance jusqu’à ${CR.nom} (km)` : '', F: !CR ? '' : (kmC == null ? '(posez le départ et ce client)' : kmC) },
      { E: CR ? 'Arrêts servis avant lui' : '', F: !CR ? '' : (rang < 0 ? '(posez ce client)' : rang) },
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
    consigne: 'Cliquez une cellule, puis écrivez dans la barre au-dessus du tableau : les données du mail se tapent, '
      + 'les calculs sont des formules (elles commencent par « = »). La colonne « Arrêt n° » suit votre tournée : '
      + 'vide, la commande reste à quai. En jaune, les étapes du calcul ; en violet, les résultats à comparer aux '
      + 'contraintes (colonne de droite). « ? Aide » sous la barre donne une aide.',
    colonnes: ['A', 'B', 'C', 'D', 'E', 'F'],
    decimales: 1,
    aides: 'bouton',
    affichage: 'tableur',
    lignes,
  };
}

// ── Les onglets du parcours (chantier F, décisions de Tristan du 03/10/2026) ───────────────
// Trois étapes, dans l'ordre du travail : lire et calculer ce qui part, construire la tournée,
// calculer les heures. Les pastilles disent ce qui est FAIT, jamais si c'est juste. Après l'imprévu,
// elles repassent à « à faire » : chacune dit « fait » dès que l'élève a retouché l'étape depuis le
// message (une cellule du haut changée, la tournée replanifiée, la feuille vérifiée à nouveau).
const REFS_HAUT = () => [...REF.poids, REF.total, REF.ecart,
  REF.depart, REF.vitesse, REF.service, REF.chargeUtile, REF.train, REF.creneau];
const phaseDe = (e) => (e && e.phase && e.phase.n) || 1;
const casesDe = (g) => (g && g.cases) || {};
const rempli = (v) => v != null && String(v).trim() !== '';
const cleTournee = (x) => JSON.stringify([(x.ordre || []).map(String), [...(x.quai || [])].map(String).sort(), !!x.depart, !!x.arrivee]);
export const ONGLETS = [
  { id: 'donnees', libelle: 'Données et poids', contenu: 'feuille', lignesFeuille: LIGNES_HAUT,
    texte: 'Dans la feuille, tapez les données du mail et le poids de chaque commande, puis calculez le poids total '
      + 'et ce qu’il faut au moins laisser à quai. Décidez quelle commande reste à quai.',
    fait: (db, e) => {
      const c = casesDe(e && e.grille);
      if (phaseDe(e) < 2) return REFS_HAUT().every((r) => rempli(c[r]));
      const avant = casesDe(e.phase.avant && e.phase.avant.grille);
      return REFS_HAUT().some((r) => String(c[r] == null ? '' : c[r]) !== String(avant[r] == null ? '' : avant[r]));
    } },
  { id: 'tournee', libelle: 'Tournée', contenu: 'tournee',
    texte: 'Cliquez l’entrepôt, les clients dans l’ordre de passage, puis la gare. La commande que vous laissez à quai '
      + 'ne se clique pas.',
    fait: (db, e) => {
      if (!e || !e.ordre || !e.ordre.length || !e.depart || !e.arrivee) return false;
      return phaseDe(e) < 2 || cleTournee(e) !== cleTournee(e.phase.depart || {});
    } },
  { id: 'heures', libelle: 'Heures', contenu: 'calcul',
    texte: 'En bas de la feuille, « Après la tournée » : le poids chargé, l’heure d’arrivée à la gare et chez le client '
      + 'à créneau. Comparez-les aux contraintes, à droite, puis cliquez « Vérifier mes formules ».',
    // Fait quand la feuille a été vérifiée (juste ou pas) ; une retouche efface la vérification.
    fait: (db, e) => Object.keys((e && e.grille && e.grille.juge) || {}).length > 0 },
];

TOURNEE.grille = feuilleColonnes();

/* ===================================================== le calcul de la meilleure tournée == */
// Le client à laisser à quai est le SEUL dont le poids suffit, à lui seul, à ramener la charge
// sous la limite (ici la Cave Teissier, 52 kg pour 40 kg à écarter). Puis les 5 040 ordres des
// sept autres : on garde ceux qui attrapent le train ET tiennent le créneau, et on prend le plus
// court. Même règle que `outils/carte/calibrer.mjs`, recalculée ici plutôt que recopiée.
const dist = (a, b) => CARTE.trajets[`${a}|${b}`].m;
function* permutations(a) {
  if (a.length < 2) { yield a; return; }
  for (let i = 0; i < a.length; i++) {
    for (const p of permutations([...a.slice(0, i), ...a.slice(i + 1)])) yield [a[i], ...p];
  }
}

export const A_QUAI = (() => {
  const trop = TOTAL - JOURNEE.chargeUtile;
  const seuls = CLIENTS.filter((c) => c.kg >= trop);
  return seuls.length === 1 ? String(seuls[0].id) : null;
})();

// La meilleure tournée qui tient tout, sur une liste de clients à charger : le plus court des
// ordres qui attrapent le train et tiennent chaque créneau. Sert aux deux phases.
function meilleureTournee(S) {
  let meilleur = null;
  for (const p of permutations(S.map((c) => String(c.id)))) {
    const ch = ['depart', ...p, 'arrivee'];
    let m = 0;
    let tient = true;
    for (let i = 1; i < ch.length; i++) {
      m += dist(ch[i - 1], ch[i]);
      if (i < ch.length - 1) {
        const c = S.find((x) => String(x.id) === ch[i]);
        const arr = JOURNEE.depart + m / 1000 / JOURNEE.vitesse * 60 + (i - 1) * JOURNEE.service;
        if (c.creneau && arr > c.creneau.avant) { tient = false; break; }
      }
    }
    if (!tient) continue;
    const fin = JOURNEE.depart + m / 1000 / JOURNEE.vitesse * 60 + S.length * JOURNEE.service;
    if (fin > JOURNEE.limite) continue;
    if (!meilleur || m < meilleur.m) meilleur = { p, m };
  }
  return meilleur ? { ordre: meilleur.p, km: meilleur.m / 1000 } : null;
}

let _optimum;
export function optimum() {
  if (_optimum !== undefined) return _optimum;
  _optimum = A_QUAI ? meilleureTournee(CLIENTS.filter((c) => String(c.id) !== A_QUAI)) : null;
  return _optimum;
}

// ── La journée après l'imprévu (phase 2) ─────────────────────────────────────────────────
// Recalculée ici depuis `IMPREVU`, jamais recopiée : le client annulé sort, les créneaux de la
// phase remplacent ceux du matin, la Cave reste à quai. Puis les 720 ordres des six autres.
export const CLIENTS_IMPREVU = CLIENTS.filter((c) => !IMPREVU.annules.includes(String(c.id))).map((c) => {
  if (!Object.prototype.hasOwnProperty.call(IMPREVU.creneaux, String(c.id))) return c;
  const q = Object.assign({}, c);
  if (IMPREVU.creneaux[String(c.id)]) q.creneau = IMPREVU.creneaux[String(c.id)]; else delete q.creneau;
  return q;
});
export const ANNULE = CLIENTS.find((c) => IMPREVU.annules.includes(String(c.id)));
export const CRENEAU_IMPREVU = CLIENTS_IMPREVU.find((c) => c.creneau) || null;
let _optimum2;
export function optimumImprevu() {
  if (_optimum2 !== undefined) return _optimum2;
  _optimum2 = meilleureTournee(CLIENTS_IMPREVU.filter((c) => String(c.id) !== String(IMPREVU.aQuai)));
  return _optimum2;
}

// La tournée d'ENT-3.2, avec ses ONGLETS et sa phase 2. ENT-3.3 reprend `TOURNEE`, qui n'a ni l'un
// ni l'autre. Les onglets portent la consigne, étape par étape : plus de grand paragraphe en tête.
export const TOURNEE_IMPREVU = Object.assign({}, TOURNEE, {
  consigne: '',
  onglets: ONGLETS,
  phases: {
    2: {
      annules: IMPREVU.annules,
      creneaux: IMPREVU.creneaux,
      // *« Ma tournée d'avant ne tient plus et rien à l'écran ne me le dit : je dois recalculer. »*
      sansVerdict: true,
      consigne: 'La journée a changé : lisez le message de M. Morin. Le vélo-cargo part toujours de l’entrepôt '
        + `à ${h(JOURNEE.depart)}, doit être à la gare avant ${h(JOURNEE.limite)} et emporte au plus ${JOURNEE.chargeUtile} kg. `
        + 'Vérifiez dans la feuille de calcul si votre tournée tient encore et, sinon, replanifiez-la. '
        + 'L’écran ne vous dit plus si les limites sont tenues : c’est votre calcul qui le montre.',
    },
  },
});

/* ====================================================================== l'accueil ===== */

export const ACCUEIL = {
  titre: 'Une nouvelle tournée, une contrainte de plus',
  kpis: ['mail'],
  etapes: [
    ['Lire la consigne du responsable', 'Menu Messagerie : la fiche des huit commandes et ce qui change aujourd’hui.'],
    ['Situer les nouveaux clients', `Menu Plan de Nîmes : ${NOUVEAUX.length} clients à placer. Les habituels sont déjà sur la carte.`],
    ['Décider ce qui part', `Huit commandes pour ${JOURNEE.chargeUtile} kg de charge utile : calculez dans la feuille ce qu’il faut au moins laisser à quai, puis choisissez le client.`],
    ['Construire la tournée', 'Menu Tournée : l’entrepôt, vos clients dans l’ordre de passage, puis la gare.'],
    ['Tenir les deux contraintes', `Le train de ${h(JOURNEE.limite)}${CRENEAU ? ` et ${CRENEAU.creneau.libelle} chez ${CRENEAU.nom}` : ''}. Calculez vos heures dans la feuille.`],
    ['Chercher le trajet le plus court', 'Plusieurs ordres tiennent les contraintes, mais ils ne font pas tous la même distance.'],
  ],
};

/* ======================================================================== le volet ==== */

export const VOLET = {
  id: 'boost-ent32',
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
          text: `Bonjour ${prenom},\n\nVous reprenez la tournée du vélo-cargo cet après-midi. Même règle `
            + `que la dernière fois : les colis partent en vélo-cargo jusqu’à la gare de Nîmes-Centre, puis `
            + `en train. Le train de Paris part à ${h(JOURNEE.limite)}, et un colis qui arrive après est livré un jour plus tard.\n\n`
            + `Le vélo-cargo emporte au plus ${JOURNEE.chargeUtile} kg. Vous partez de l’entrepôt à ${h(JOURNEE.depart)}, `
            + `comptez ${JOURNEE.service} minutes par arrêt et ${JOURNEE.vitesse} km/h en ville : le vélo-cargo est à assistance électrique.\n\n`
            + `Voici les ${CLIENTS.length} commandes :\n\n${fiche}\n\n`
            + (CRENEAU ? `Une nouveauté : ${CRENEAU.nom} ne reçoit ses livraisons qu’avant ${h(CRENEAU.creneau.avant)}. `
              + `Passé cette heure, la boutique est fermée au public et le colis revient. Il faut donc y arriver à temps, `
              + `pas seulement attraper le train.\n\n` : '')
            + `Dans l’ordre :\n\n1. Les ${NOUVEAUX.length} nouveaux clients ne figurent pas encore sur notre carte : situez-les.\n`
            + `2. Additionnez les masses. Si ça ne passe pas, calculez ce qu’il faut retirer et décidez quelle commande reste à quai.\n`
            + `3. Construisez la tournée : elle doit tenir le train${CRENEAU ? ' et le créneau' : ''}. `
            + `Plusieurs ordres y arrivent, mais ils ne se valent pas : moins on roule, mieux c’est.\n\n`
            + `Bon courage,\nM. Morin` },
      ],
    };
  },
  // L'imprévu : il arrive quand la phase 1 est FINIE (voir `phase1Finie`), une seule fois, et fait
  // passer la tournée en phase 2 au même instant. « Il est 14 h 00 » : avant le départ de 14 h 35,
  // la tournée n'est pas partie (choix de Tristan). Texte courant, comme un vrai message : l'élève
  // cherche ce qui change, on ne lui donne pas de tableau. Tout ce qu'il dit est lu dans `IMPREVU`.
  declencheurs: [{
    id: 'imprevu',
    quand: (db) => phase1Finie(db),
    phaseTournee: 2,
    semer(prenom) {
      // Le client qui perd son créneau : celui du matin, s'il n'est plus le client à créneau.
      const leve = CRENEAU && (!CRENEAU_IMPREVU || CRENEAU.id !== CRENEAU_IMPREVU.id) ? CRENEAU : null;
      const quai = CLIENTS.find((c) => String(c.id) === String(IMPREVU.aQuai));
      return {
        mails: [
          { folder: 'in', ts: Date.now(), from: 'M. Morin, responsable d’exploitation',
            fromMail: 'exploitation@boost.example', to: prenom,
            subject: 'Changement pour la tournée de cet après-midi', kind: 'text',
            text: `Bonjour ${prenom},\n\nIl est 14 h 00 et la journée vient de changer, avant même votre départ. `
              + 'Deux appels coup sur coup.\n\n'
              + `${ANNULE.nom} vient d’annuler sa commande : l’atelier est fermé cet après-midi, ils la reprendront `
              + 'plus tard. Ne la chargez pas.\n\n'
              + (CRENEAU_IMPREVU ? `${CRENEAU_IMPREVU.nom} ferme exceptionnellement plus tôt aujourd’hui : la livraison doit `
                + `y arriver avant ${h(CRENEAU_IMPREVU.creneau.avant)}, sinon personne ne pourra la recevoir. ` : '')
              + (leve ? `En revanche, ${leve.nom} a quelqu’un au magasin tout l’après-midi : plus besoin d’y passer `
                + `avant ${h(leve.creneau.avant)}.` : '')
              + `\n\n${quai ? `${quai.nom} reste à quai comme prévu : elle est déjà prévenue pour demain. ` : ''}`
              + `Le train de ${h(JOURNEE.limite)}, lui, ne change pas, et le vélo-cargo emporte toujours ${JOURNEE.chargeUtile} kg au plus.\n\n`
              + 'Votre tournée était prévue pour la journée d’avant ces deux appels. Vérifiez qu’elle tient encore, '
              + 'refaites vos calculs, et replanifiez-la si besoin. Là encore, moins on roule, mieux c’est.\n\n'
              + 'Merci,\nM. Morin' },
        ],
      };
    },
  }],
};

/* ============================ Suivi de l'exercice ============================
 * Dix jalons, chacun vaut 2 points sur 20 (la séance déclare un barème, pas de notation).
 * Les huit de la phase 1 (FIGÉS à l'arrivée de l'imprévu : ils lisent `phase.avant`) :
 *
 *   reperage  les nouveaux clients sont situés
 *   choix     le calcul du poids à écarter est juste (formules) ET le bon client est à quai
 *   charge    la charge utile est respectée
 *   horaire   le train est attrapé
 *   creneau   le créneau de livraison est tenu
 *   formules  toutes les formules de la feuille sont justes
 *   trajet10  la tournée tient tout ET fait moins de 10 % de plus que la meilleure possible
 *   trajet5   idem, à moins de 5 %
 *
 * Les deux de la phase 2 (« en attente » tant que le message n'est pas arrivé) :
 *
 *   replanif  la tournée replanifiée tient tout : client annulé absent, Cave à quai, charge,
 *             train, nouveau créneau, chaîne complète — et elle a CHANGÉ depuis le message
 *   trajet2   elle tient tout ET fait moins de 10 % de plus que la meilleure de la phase 2
 *
 * Les jalons ne recalculent RIEN eux-mêmes : ils montent une seconde instance des vues et lui
 * demandent leur bilan. Deux calculs parallèles finiraient par ne plus dire la même chose.
 */

const VUE = creerTournee(Object.assign({ plan: PLAN }, TOURNEE_IMPREVU));
const VUE_CARTE = creerCarte(PLAN);

const etatDe = (db, vue) => (db && db.transport && db.transport[TRANSPORT_ID]
  ? db.transport[TRANSPORT_ID][vue] : null);
// La tournée que jugent les jalons de la PHASE 1 : la tournée en cours tant que l'imprévu n'est
// pas arrivé, puis celle (et sa feuille) gardée à l'instant du message. Elle ne porte pas de
// `phase` : son bilan se fait sur la journée d'avant l'imprévu.
const tour1 = (db) => {
  const e = etatDe(db, 'tournee');
  return e && e.phase && e.phase.avant ? e.phase.avant : e;
};

// Comme ENT-3.1 : le vélo-cargo part VIDE, donc « charge respectée » serait vrai avant que l'élève
// ait touché à quoi que ce soit. Il a commencé dès qu'il a chargé un client ou posé un bout.
function commencee(etat) {
  if (!etat || !etat.ordre) return false;
  return etat.ordre.length > 0 || !!etat.depart || !!etat.arrivee;
}
const grilleOk = (e, ref) => !!(e && e.grille && e.grille.juge && e.grille.juge[ref] === 'ok');

// La tournée de l'élève est-elle la bonne famille : le bon client à quai, tout le reste chargé ?
const bonChargement = (e) => {
  const quai = (e.quai || []).map(String);
  return !!A_QUAI && quai.length === 1 && quai[0] === A_QUAI;
};

// Un jalon de trajet : la tournée doit d'abord TENIR (bon client à quai, chaîne complète, train et
// créneau), puis être assez courte. `marge` : 0,10 puis 0,05.
function jalonTrajet(marge) {
  return (db) => {
    const e = tour1(db);
    if (!e || !e.ordre) return { status: 'na' };
    if (!commencee(e)) return { status: 'attente' };
    const opt = optimum();
    if (!opt) return { status: 'na', detail: 'Journée mal calée : pas de meilleure tournée.' };
    const b = VUE.bilan(e);
    if (!b.complete) return { status: 'attente', detail: 'Placez le départ et l’arrivée.' };
    if (!bonChargement(e)) return { status: 'ko', detail: 'Le chargement n’est pas le bon : la distance ne se juge pas.' };
    if (b.cumuls.charge > JOURNEE.chargeUtile) return { status: 'ko', detail: 'Le vélo-cargo est surchargé.' };
    if (b.enRetard || b.creneauRate) {
      return { status: 'ko', detail: `La tournée ne tient pas ${b.enRetard ? 'le train' : 'le créneau'} : la distance ne se juge pas.` };
    }
    const limite = opt.km * (1 + marge);
    const ecart = (b.km / opt.km - 1) * 100;
    const detail = `${b.km.toFixed(1)} km pour une meilleure tournée de ${opt.km.toFixed(1)} km (${ecart >= 0 ? '+' : ''}${ecart.toFixed(1)} %), `
      + `seuil ${Math.round(marge * 100)} %.`;
    return { status: b.km <= limite + 1e-9 ? 'ok' : 'ko', detail };
  };
}

// ── La phase 1 est-elle finie ? (le déclencheur de l'imprévu) ──────────────────────────────
// La tournée tient tout — même condition que les paliers de trajet, sans la distance : bon client
// à quai, chaîne complète, charge, train, créneau — ET la feuille de calcul est vérifiée juste.
// Choix de Tristan (03/10/2026) : l'élève a fini son travail et a eu le temps de chercher plus
// court ; les jalons de la phase 1 sont figés à cet instant. Jamais en phase 2.
function phase1Finie(db) {
  const e = etatDe(db, 'tournee');
  if (!e || !e.ordre || e.phase) return false;
  const b = VUE.bilan(e);
  if (!b.complete || !bonChargement(e)) return false;
  if (b.cumuls.charge > JOURNEE.chargeUtile || b.enRetard || b.creneauRate) return false;
  // Les FORMULES justes, vérifiées (le bouton a été cliqué). Une donnée mal recopiée ne bloque pas
  // l'imprévu : une erreur de lecture ne se paie qu'une fois, au jalon « données » (lot 2, 03/10).
  return formulesJustes(e) === true;
}

// Les cases de formules de la feuille, d'après la dernière vérification : `true` toutes justes,
// `false` au moins une à revoir, `null` pas encore vérifiées ou pas toutes remplies.
function formulesJustes(e) {
  const juge = (e && e.grille && e.grille.juge) || {};
  const refs = REFS_FORMULES.filter((r) => r in juge);
  if (!refs.length) return null;
  if (refs.some((r) => !['ok', 'vide', 'attente'].includes(juge[r]))) return false;
  return refs.length === REFS_FORMULES.length && refs.every((r) => juge[r] === 'ok') ? true : null;
}

// ── Les jalons de la phase 2 ─────────────────────────────────────────────────────────────
// La tournée en cours tient-elle tout sur la journée d'APRÈS l'imprévu ? Rend un statut, ou le
// bilan quand elle tient. « En attente » tant que le message n'est pas arrivé : on n'accuse
// jamais avant que l'élève ait pu agir.
function tientPhase2(db) {
  const e = etatDe(db, 'tournee');
  if (!e || !e.ordre) return { status: 'na' };
  if (!e.phase || e.phase.n < 2) return { status: 'attente', detail: 'Le message de l’imprévu n’est pas encore arrivé.' };
  const b = VUE.bilan(e);
  if (!b.complete) return { status: 'attente', detail: 'Placez le départ et l’arrivée.' };
  const quai = (e.quai || []).map(String);
  if (quai.length !== 1 || quai[0] !== String(IMPREVU.aQuai)) {
    return { status: 'ko', detail: `Le chargement n’est pas le bon : ${quai.length ? `à quai, ${quai.map(nomDe).join(', ')}` : 'rien n’est à quai'}.` };
  }
  // Ne pas récompenser l'inaction : la tournée laissée telle qu'à l'arrivée du message ne vaut
  // rien, même si elle tenait (le calage garantit qu'elle ne tient pas, ce garde le dit en plus).
  const d = e.phase.depart || {};
  const cle = (x) => JSON.stringify([(x.ordre || []).map(String), !!x.depart, !!x.arrivee]);
  if (cle(e) === cle(d)) return { status: 'ko', detail: 'La tournée n’a pas été replanifiée depuis le message.' };
  if (b.cumuls.charge > JOURNEE.chargeUtile) return { status: 'ko', detail: 'Le vélo-cargo est surchargé.' };
  if (b.enRetard) return { status: 'ko', detail: 'La tournée replanifiée manque le train.' };
  if (b.creneauRate) return { status: 'ko', detail: `La tournée replanifiée rate le créneau${CRENEAU_IMPREVU ? ` de ${CRENEAU_IMPREVU.nom}` : ''}.` };
  return { status: 'ok', b };
}

export const ETAPES = [
  {
    id: 'reperage',
    titre: `Les ${NOUVEAUX.length} nouveaux clients situés sur la carte`,
    verifier(db) {
      const e = etatDe(db, 'plan');
      const b = VUE_CARTE.bilan(e);
      if (!e || (!b.places && !b.essais)) return { status: 'na' };
      const detail = `${b.places} client(s) sur ${b.nouveaux} situé(s) ; ${b.premierCoup} du premier coup.`;
      return { status: b.places === b.nouveaux ? 'ok' : 'attente', detail, ts: e.valide || undefined };
    },
  },
  {
    id: 'donnees',
    titre: 'Les données du mail recopiées justes dans la feuille (journée et poids)',
    verifier(db) {
      const e = tour1(db);
      const g = e && e.grille;
      if (!g) return { status: 'na' };
      const juge = g.juge || {};
      const tapees = REFS_DONNEES.some((r) => String((g.cases || {})[r] || '').trim() !== '');
      if (!REFS_DONNEES.some((r) => r in juge)) return { status: tapees ? 'attente' : 'na' };
      const faux = REFS_DONNEES.filter((r) => juge[r] && juge[r] !== 'ok' && juge[r] !== 'vide');
      const vides = REFS_DONNEES.filter((r) => !juge[r] || juge[r] === 'vide');
      // Le détail dit QUELLES cases revoir, jamais la valeur du mail.
      if (faux.length) return { status: 'ko', detail: `Données à revoir : ${faux.join(', ')}.` };
      if (vides.length) return { status: 'attente', detail: `Données à taper : ${vides.join(', ')}.` };
      return { status: 'ok', detail: 'Les données du mail sont toutes recopiées justes.' };
    },
  },
  {
    id: 'choix',
    titre: 'Le poids à écarter calculé, et la bonne commande laissée à quai',
    verifier(db) {
      const e = tour1(db);
      if (!e || !e.ordre) return { status: 'na' };
      const calculOk = grilleOk(e, REF_TOTAL) && grilleOk(e, REF_ECART);
      const quai = (e.quai || []).map(String);
      if (!commencee(e)) return { status: calculOk ? 'attente' : 'na' };
      const detail = `Calcul du poids à écarter : ${calculOk ? 'juste' : 'pas encore juste'} ; `
        + (quai.length ? `à quai : ${quai.map(nomDe).join(', ')}.` : 'rien n’est à quai : le vélo-cargo déborde.');
      // Une mauvaise commande à quai est fausse, calcul fait ou pas ; la bonne, sans le calcul,
      // reste « en attente » : la décision est juste, le travail de la feuille manque.
      if (!quai.length || !bonChargement(e)) return { status: 'ko', detail };
      return { status: calculOk ? 'ok' : 'attente', detail };
    },
  },
  {
    id: 'charge',
    titre: 'La charge utile du vélo-cargo est respectée',
    verifier(db) {
      const e = tour1(db);
      if (!e || !e.ordre) return { status: 'na' };
      if (!commencee(e)) return { status: 'attente' };
      const b = VUE.bilan(e);
      const detail = `${b.cumuls.charge} kg chargés sur ${JOURNEE.chargeUtile} kg utiles, ${b.retenus.length} arrêt(s).`;
      if (!b.retenus.length) return { status: 'attente', detail };
      return { status: b.cumuls.charge <= JOURNEE.chargeUtile ? 'ok' : 'ko', detail };
    },
  },
  {
    id: 'horaire',
    titre: `Le train de ${h(JOURNEE.limite)} est attrapé`,
    verifier(db) {
      const e = tour1(db);
      if (!e || !e.ordre) return { status: 'na' };
      if (!commencee(e)) return { status: 'attente' };
      const b = VUE.bilan(e);
      if (b.cumuls.charge > JOURNEE.chargeUtile) {
        return { status: 'ko', detail: 'Le vélo-cargo est surchargé : l’horaire ne veut rien dire.' };
      }
      // Une chaîne incomplète raccourcit le trajet : oublier la gare ne doit pas valoir le train.
      if (!b.complete || b.arrivee == null) return { status: 'attente', detail: 'Placez le départ et l’arrivée.' };
      const detail = `Retour prévu à ${h(b.arrivee)} pour un train à ${h(JOURNEE.limite)} — `
        + `${Math.round(Math.abs(JOURNEE.limite - b.arrivee))} min ${b.enRetard ? 'de retard' : 'd’avance'}, ${b.km.toFixed(1)} km.`;
      return { status: b.enRetard ? 'ko' : 'ok', detail };
    },
  },
  {
    id: 'creneau',
    titre: CRENEAU ? `Le créneau de ${CRENEAU.nom} est tenu` : 'Le créneau de livraison est tenu',
    verifier(db) {
      const e = tour1(db);
      if (!e || !e.ordre) return { status: 'na' };
      if (!commencee(e)) return { status: 'attente' };
      const b = VUE.bilan(e);
      if (b.cumuls.charge > JOURNEE.chargeUtile) {
        return { status: 'ko', detail: 'Le vélo-cargo est surchargé : le créneau ne veut rien dire.' };
      }
      // L'heure d'arrivée chez le client se calcule depuis le départ : sans lui, elle serait trop tôt.
      if (!b.departPose) return { status: 'attente', detail: 'Placez le départ.' };
      const c = b.creneaux.find((x) => x.charge);
      if (!c) return { status: 'ko', detail: `${CRENEAU ? CRENEAU.nom : 'Le client à créneau'} n’est pas dans la tournée.` };
      const detail = `Arrivée chez ${c.nom} à ${h(c.arrivee)} pour une limite à ${h(c.avant)}.`;
      return { status: c.rate ? 'ko' : 'ok', detail };
    },
  },
  {
    id: 'formules',
    titre: 'Les formules de la feuille de calcul sont justes',
    verifier(db) {
      const e = tour1(db);
      const g = e && e.grille;
      if (!g) return { status: 'na' };
      // Les cases de FORMULES seulement : les données lues dans le mail ont leur jalon à elles.
      const saisies = REFS_FORMULES.some((k) => String((g.cases || {})[k] || '').trim() !== '');
      const juge = g.juge || {};
      const refs = REFS_FORMULES.filter((r) => r in juge);
      if (!refs.length) return { status: saisies ? 'attente' : 'na' };
      const faux = refs.filter((k) => !['ok', 'vide', 'attente'].includes(juge[k]));
      if (faux.length) return { status: 'ko', detail: `Cellules à revoir : ${faux.join(', ')}.` };
      if (formulesJustes(e) !== true) {
        const vides = REFS_FORMULES.filter((k) => !juge[k] || juge[k] !== 'ok');
        return { status: 'attente', detail: `Cellules à remplir : ${vides.join(', ')}.` };
      }
      return { status: 'ok', detail: 'Toutes les formules sont justes.', ts: g.valide || undefined };
    },
  },
  {
    id: 'trajet10',
    titre: 'La tournée tient tout, à moins de 10 % de la meilleure tournée possible',
    verifier: jalonTrajet(0.10),
  },
  {
    id: 'trajet5',
    titre: 'La tournée tient tout, à moins de 5 % de la meilleure tournée possible',
    verifier: jalonTrajet(0.05),
  },
  {
    id: 'replanif',
    titre: 'Après l’imprévu, la tournée replanifiée tient tout',
    verifier(db) {
      const r = tientPhase2(db);
      if (r.status !== 'ok') return r;
      return { status: 'ok', detail: `${r.b.km.toFixed(1)} km, ${r.b.retenus.length} arrêts : charge, train et créneau tenus.` };
    },
  },
  {
    id: 'trajet2',
    titre: 'Après l’imprévu, la nouvelle tournée est à moins de 10 % de la meilleure possible',
    verifier(db) {
      const r = tientPhase2(db);
      if (r.status !== 'ok') return r.status === 'ko' ? { status: 'ko', detail: `${r.detail} La distance ne se juge pas.` } : r;
      const opt = optimumImprevu();
      if (!opt) return { status: 'na', detail: 'Imprévu mal calé : pas de meilleure tournée.' };
      const ecart = (r.b.km / opt.km - 1) * 100;
      const detail = `${r.b.km.toFixed(1)} km pour une meilleure tournée de ${opt.km.toFixed(1)} km `
        + `(${ecart >= 0 ? '+' : ''}${ecart.toFixed(1)} %), seuil 10 %.`;
      return { status: r.b.km <= opt.km * 1.10 + 1e-9 ? 'ok' : 'ko', detail };
    },
  },
];
