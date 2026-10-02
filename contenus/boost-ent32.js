// Boost — ENT-3.2, « la tournée sous contrainte ». C2.4, organiser une tournée de livraison.
//
// Deuxième des quatre séances de C2.4 : l'ENTRAÎNEMENT. ENT-3.1 (guidage) a appris le geste —
// situer, charger, ordonner, calculer. Ici l'élève refait ce geste sur une AUTRE journée, avec
// une contrainte de plus et moins de béquilles. Décisions de Tristan, 02/10/2026, dans
// `claude/prepalog-boost-cadrage-ent32-34.md` :
//
//   · nouvelle journée : huit clients (dont quatre nouveaux à situer), d'autres poids ;
//   · un CRÉNEAU de livraison : la Pâtisserie Arnaud n'accepte qu'avant 14 h 45. L'ordre compte
//     vraiment — le trajet le plus court rate ce créneau (vérifié par `outils/carte/calibrer.mjs`) ;
//   · jauges MUETTES : elles donnent la limite, jamais le total. Le client à laisser à quai se
//     trouve par le calcul (230 − 180 = 50 kg) dans la feuille, pas « en cliquant au hasard » ;
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

import { creerTournee } from '../core/types/tournee.js';
import { creerCarte } from '../core/types/carte.js';
import { VELO } from './boost.js';
import { CARTE } from './boost-ent32-carte.js';

export const TRANSPORT_ID = 'boost-ent32';

/* ===================================================================== la journée ====== */

// Le départ est à 14 h 10 (celui d'ENT-3.1 est à 13 h 00). Le reste est l'univers commun.
export const JOURNEE = {
  depart: 14 * 60 + 10,
  limite: VELO.train,
  chargeUtile: VELO.chargeUtile,
  vitesse: VELO.vitesse,
  service: VELO.service,
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
  grille: {
    titre: 'Feuille de calcul du vélo-cargo',
    consigne: 'Les cellules colorées sont à remplir, et il faut y écrire une FORMULE — elle commence '
      + 'par « = ». Le résultat s’affiche à droite de chaque case. En jaune, les étapes du calcul ; '
      + 'en violet, les résultats à comparer aux contraintes (colonne de droite). L’heure de départ '
      + 'se tape simplement (14:10). Si vous changez votre tournée, les données changent et vos '
      + 'formules se recalculent toutes seules.',
    colonnes: ['A', 'B'],
    decimales: 1,
    // Le début de la feuille est FIXE : les huit poids dans l'ordre de la fiche, puis le total, la
    // charge utile et ce qu'il faut écarter. Ses adresses ne bougent pas, et le jalon « choix »
    // peut donc les lire. La suite (temps de route, créneau) dépend de la tournée de l'élève.
    lignes: (b) => {
      const n = b.retenus.length;
      const km = Math.round(b.km * 10) / 10;     // arrondi comme affiché : l'élève ne tape que ce qu'il lit
      const heures = km / JOURNEE.vitesse;
      const route = heures * 60;
      const service = n * JOURNEE.service;

      // Le créneau : distance jusqu'au client concerné, déduite de son heure d'arrivée dans le bilan.
      let kmC = null, rang = -1, attenduC = null;
      if (CRENEAU) {
        rang = b.retenus.findIndex((p) => String(p.id) === String(CRENEAU.id));
        const arr = b.arrivees[String(CRENEAU.id)];
        if (rang >= 0 && b.departPose && arr != null) {
          kmC = Math.round(((arr - JOURNEE.depart - rang * JOURNEE.service) * JOURNEE.vitesse / 60) * 10) / 10;
          attenduC = JOURNEE.depart + kmC / JOURNEE.vitesse * 60 + rang * JOURNEE.service;
        }
      }
      const attente = '(posez d’abord le départ et ce client)';

      return [
        ...LIGNES_TETE,
        {},
        { A: 'Distance du parcours (km)', B: km },
        { A: 'Vitesse en ville (km/h)', B: JOURNEE.vitesse },
        { A: 'Étape 1 · Temps de route (heures)', type: 'etape',
          note: 'Distance (km) ÷ vitesse (km/h) = temps (h).',
          B: { saisie: true, formule: true, attendu: heures, tolerance: 0.01, decimales: 2,
               libelle: 'temps de route en heures' } },
        { A: 'Étape 2 · Temps de route (min)', type: 'etape',
          note: '1 heure = 60 minutes : on multiplie les heures par 60.',
          B: { saisie: true, formule: true, attendu: route, tolerance: 0.5,
               libelle: 'temps de route en minutes' } },
        { A: 'Nombre d’arrêts', B: n },
        { A: 'Temps par arrêt (min)', B: JOURNEE.service },
        { A: 'Étape 3 · Temps aux arrêts (min)', type: 'etape',
          note: 'Nombre d’arrêts × temps par arrêt.',
          B: { saisie: true, formule: true, attendu: service, libelle: 'temps aux arrêts' } },
        { A: 'Heure de départ',
          note: 'À taper sous la forme 14:10 (pas de formule ici).',
          B: { saisie: true, formule: false, attendu: JOURNEE.depart, format: 'heure',
               placeholder: 'ex. 14:10', libelle: 'heure de départ' } },
        { A: 'Heure d’arrivée à la gare', type: 'resultat',
          note: 'Heure de départ + temps de route (min) + temps aux arrêts (min).',
          B: { saisie: true, formule: true, attendu: JOURNEE.depart + route + service, tolerance: 0.5,
               format: 'heure', libelle: 'heure d’arrivée' } },
        { A: 'Départ du train (contrainte)', type: 'contrainte',
          B: { valeur: JOURNEE.limite, format: 'heure' } },
        ...(!CRENEAU ? [] : [
          {},
          { A: `Distance jusqu’à ${CRENEAU.nom} (km)`, B: kmC == null ? attente : kmC },
          { A: 'Arrêts servis avant lui', B: rang < 0 ? attente : rang },
          { A: `Heure d’arrivée chez ${CRENEAU.nom}`, type: 'resultat',
            note: 'Heure de départ + temps de route jusqu’à lui (distance ÷ vitesse × 60) + arrêts déjà servis × temps par arrêt.',
            B: attenduC == null ? attente
              : { saisie: true, formule: true, attendu: attenduC, tolerance: 0.5, format: 'heure',
                  libelle: 'heure d’arrivée chez le client à créneau' } },
          { A: 'Heure limite de livraison (contrainte)', type: 'contrainte',
            B: { valeur: CRENEAU.creneau.avant, format: 'heure' } },
        ]),
      ];
    },
  },
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

// Le début de la feuille : les huit poids de la fiche, le total, la charge utile, ce qu'on écarte,
// ce qu'on charge. Défini après TOURNEE pour que les adresses se déduisent de la place des lignes.
const LIGNES_TETE = [
  { A: 'Client', B: 'Poids (kg)', entete: true },
  ...CLIENTS.map((c, i) => ({ A: `${i + 1} · ${c.nom}`, B: c.kg })),
  { A: 'Poids total des commandes (kg)', type: 'resultat',
    note: `Additionnez les ${CLIENTS.length} poids avec SOMME.`,
    B: { saisie: true, formule: true, attendu: TOTAL, libelle: 'poids total des commandes' } },
  { A: 'Charge utile maximale (kg)', type: 'contrainte', B: JOURNEE.chargeUtile },
  { A: 'Poids à laisser à quai, au moins (kg)', type: 'resultat',
    note: 'Poids total − charge utile : ce qu’il faut au minimum retirer du vélo-cargo.',
    B: { saisie: true, formule: true, attendu: TOTAL - JOURNEE.chargeUtile, libelle: 'poids à laisser à quai' } },
  { A: 'Poids chargé dans le vélo-cargo (kg)', type: 'resultat',
    note: 'Poids total − poids de ce qui reste à quai. À comparer à la charge utile.',
    B: { saisie: true, formule: true, attendu: null, libelle: 'poids chargé' } },
];
// L'attendu du dernier résultat dépend de la tournée : on le pose à chaque dessin.
const lignesBrutes = TOURNEE.grille.lignes;
TOURNEE.grille.lignes = (b) => {
  const L = lignesBrutes(b);
  const i = L.findIndex((l) => l.A === 'Poids chargé dans le vélo-cargo (kg)');
  L[i] = Object.assign({}, L[i], { B: Object.assign({}, L[i].B, { attendu: b.cumuls.charge }) });
  return L;
};

// Les adresses des deux cellules que le jalon « choix » lit : jamais écrites en dur.
const adresseDe = (intitule) => `B${LIGNES_TETE.findIndex((l) => l.A === intitule) + 1}`;
export const REF_TOTAL = adresseDe('Poids total des commandes (kg)');
export const REF_ECART = adresseDe('Poids à laisser à quai, au moins (kg)');

/* ===================================================== le calcul de la meilleure tournée == */
// Le client à laisser à quai est le SEUL dont le poids suffit, à lui seul, à ramener la charge
// sous la limite (ici la Cave Teissier, 52 kg pour 50 kg à écarter). Puis les 5 040 ordres des
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

let _optimum;
export function optimum() {
  if (_optimum !== undefined) return _optimum;
  _optimum = null;
  if (!A_QUAI) return _optimum;
  const S = CLIENTS.filter((c) => String(c.id) !== A_QUAI);
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
  if (meilleur) _optimum = { ordre: meilleur.p, km: meilleur.m / 1000 };
  return _optimum;
}

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
          subject: 'Tournée vélo-cargo de cet après-midi — départ 14 h 10', kind: 'text',
          text: `Bonjour ${prenom},\n\nVous reprenez la tournée du vélo-cargo cet après-midi. Même règle `
            + `que la dernière fois : les colis partent en vélo-cargo jusqu’à la gare de Nîmes-Centre, puis `
            + `en train. Le train de Paris part à ${h(JOURNEE.limite)}, et un colis qui arrive après est livré un jour plus tard.\n\n`
            + `Le vélo-cargo emporte au plus ${JOURNEE.chargeUtile} kg. Vous partez de l’entrepôt à ${h(JOURNEE.depart)}, `
            + `comptez ${JOURNEE.service} minutes par arrêt et une douzaine de kilomètres à l’heure en ville.\n\n`
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
};

/* ============================ Suivi de l'exercice ============================
 * Huit jalons, chacun vaut 2,5 points sur 20 (la séance déclare un barème, pas de notation) :
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
 * Les jalons ne recalculent RIEN eux-mêmes : ils montent une seconde instance des vues et lui
 * demandent leur bilan. Deux calculs parallèles finiraient par ne plus dire la même chose.
 */

const VUE = creerTournee(Object.assign({ plan: PLAN }, TOURNEE));
const VUE_CARTE = creerCarte(PLAN);

const etatDe = (db, vue) => (db && db.transport && db.transport[TRANSPORT_ID]
  ? db.transport[TRANSPORT_ID][vue] : null);

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
    const e = etatDe(db, 'tournee');
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
    id: 'choix',
    titre: 'Le poids à écarter calculé, et la bonne commande laissée à quai',
    verifier(db) {
      const e = etatDe(db, 'tournee');
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
      const e = etatDe(db, 'tournee');
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
      const e = etatDe(db, 'tournee');
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
      const e = etatDe(db, 'tournee');
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
      const e = etatDe(db, 'tournee');
      const g = e && e.grille;
      if (!g) return { status: 'na' };
      const saisies = Object.keys(g.cases || {}).some((k) => String(g.cases[k] || '').trim() !== '');
      const juge = g.juge || {};
      if (!Object.keys(juge).length) return { status: saisies ? 'attente' : 'na' };
      const faux = Object.keys(juge).filter((k) => juge[k] !== 'ok' && juge[k] !== 'vide');
      const vides = Object.keys(juge).filter((k) => juge[k] === 'vide');
      if (faux.length) return { status: 'ko', detail: `Cellules à revoir : ${faux.join(', ')}.` };
      if (vides.length || !g.valide) {
        return { status: 'attente', detail: vides.length ? `Cellules à remplir : ${vides.join(', ')}.` : undefined };
      }
      return { status: 'ok', detail: 'Toutes les formules sont justes.', ts: g.valide };
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
];
