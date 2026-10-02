// Boost — ENT-3.1, « la tournée du vélo-cargo ». C2.4, organiser une tournée de livraison.
//
// Première des quatre séances de C2.4, et séance de GUIDAGE : organiser une tournée est une
// notion entièrement nouvelle pour les élèves. La doctrine des trois temps est dans
// `claude/prepalog-progression-pedagogique.md` — guidage, entraînement, erreur induite,
// évaluation — et c'est elle qui décide de la notation et de ce qu'on rend à l'élève.
//
// ── Les deux temps tiennent dans UNE séance ──────────────────────────────────────────────
// Repérer les clients sur le plan, puis ordonner le passage : ce sont deux moments du même
// geste professionnel, pas deux étapes d'apprentissage, et le second est impossible sans le
// premier. Décision de Tristan, prise deux fois. Le noyau tient l'enchaînement tout seul :
// la vue « Tournée » reste fermée tant que le repérage n'est pas validé.
//
// ── Ce que l'élève fait, dans l'ordre ───────────────────────────────────────────────────
//   1. il lit la fiche de tournée : sept clients, une adresse de RUE pour chacun ;
//   2. il ouvre un plan en ligne dans un autre onglet, situe chaque adresse, et écrit la
//      case du quadrillage sur notre plan. C'est le geste du métier : on reçoit une adresse,
//      on la situe, puis on construit la tournée ;
//   3. les sept noms apparaissent sur le plan ; il découvre que les commandes pèsent 237 kg
//      pour 180 kg de charge utile, donc qu'il faut laisser un client à quai ;
//   4. il ordonne les arrêts, en glissant ou avec les flèches, et regarde les jauges ;
//   5. il reporte quatre résultats dans des cases qui se corrigent seules.
//
// ── La notation : jalons ET note sur 20 ─────────────────────────────────────────────────
// Tristan, le 02/10 : « les élèves sont motivés par les notes, je peux l'utiliser avec un
// petit coefficient pour récompenser leur implication ». Donc cette séance déclare
// `bareme: ETAPES.length` et **PAS** `notation: 'avancement'` — c'est son seul écart avec les
// trois séances Spartoo. Vérifié dans le code : `noteConvertie` de `core/notes.js` rend vrai
// dès qu'un module ne déclare pas de `notation`, le score est ramené sur 20, et le score brut
// en jalons reste lisible en infobulle dans le suivi de classe. Aucun ajout au moteur.
//
// ── L'autocorrection dans une séance de guidage ─────────────────────────────────────────
// Les cases de report se corrigent seules, ce qui s'écarte de la règle « un environnement ne
// rend rien à l'élève pendant l'exercice ». C'est la décision n° 2 de Tristan, et dans une
// séance de guidage l'écart devient cohérent : on corrige parce qu'on guide. ENT-3.4,
// l'évaluation, devra resserrer ce point.
//
// Même esprit pour le repérage : une case fausse est tolérée (`toleres: 1`), la suite n'attend
// pas la perfection, et au bout de trois validations infructueuses une porte de sortie
// apparaît. Règle de Tristan : « il ne faut pas que l'élève se retrouve complètement bloqué
// mais il faut en même temps lui laisser la possibilité de faire certaines erreurs ».
// **Débloquer n'est pas valider** : le jalon ne compte le point que si les sept cases sont
// justes, et le suivi montre la différence.

import { creerTournee } from '../core/types/tournee.js';
import { PLAN_NIMES, DESTINATAIRES, VELO } from './boost.js';

export const TRANSPORT_ID = 'boost-ent31';

/* ======================================================================= le plan ====== */

export const PLAN = Object.assign({}, PLAN_NIMES, {
  libelle: 'Plan de Nîmes',
  titre: 'Situer les sept clients sur le plan de Nîmes',
  consigne: "La fiche de tournée ne donne que le nom de la rue. Pour chaque client, trouvez "
    + "la rue sur un plan en ligne, repérez-la sur le plan de Nîmes ci-dessous, puis écrivez "
    + 'sa case du quadrillage (une lettre et un chiffre, par exemple C2).',
  // Un lien vers un plan libre, qui s'ouvre dans un autre onglet. On n'intègre AUCUNE carte
  // en ligne dans Prepalog : pas d'iframe, pas de fond repris. L'élève cherche, puis revient.
  enLigne: {
    libelle: 'Ouvrir un plan de Nîmes (OpenStreetMap)',
    url: 'https://www.openstreetmap.org/#map=13/43.8367/4.3601',
  },
  reperage: {
    consigne: 'Sept clients, sept cases à trouver. Validez quand vous les avez toutes : '
      + 'les noms apparaîtront sur le plan et la tournée s’ouvrira.',
    champ: 'Case',
    // Le filet de sécurité donne le QUARTIER, pas la case : il débloque un poste sans accès
    // à Internet sans donner la réponse. Son usage est horodaté dans la base.
    secours: 'Je n’ai pas accès à Internet',
    // Une case fausse n'empêche pas d'avancer, et elle reste visible à l'écran comme dans le
    // suivi. Le jalon, lui, exige les sept.
    toleres: 1,
    blocant: true,
    essaisAvantIssue: 3,
    issue: 'Je ne trouve pas, continuer quand même',
  },
});

/* ==================================================================== la tournée ====== */

export const TOURNEE = {
  libelle: 'Tournée du 14 avril',
  titre: 'Organiser la tournée du vélo-cargo',
  consigne: `Le vélo-cargo part de l’entrepôt à ${Math.floor(VELO.depart / 60)} h 00 et doit `
    + `être à la gare de Nîmes-Centre avant ${Math.floor(VELO.train / 60)} h `
    + `${String(VELO.train % 60).padStart(2, '0')}, départ du train pour Paris. Il emporte au `
    + `plus ${VELO.chargeUtile} kg. Les sept commandes dépassent cette charge : laissez à quai `
    + 'ce qui ne peut pas partir, puis mettez les arrêts dans un ordre qui tienne l’horaire.',
  mesures: [
    { id: 'charge', libelle: 'Charge du vélo-cargo', unite: 'kg', champ: 'kg', max: VELO.chargeUtile },
    { id: 'colis', libelle: 'Colis chargés', unite: 'colis', champ: 'colis' },
  ],
  horaire: {
    depart: VELO.depart, limite: VELO.train, vitesse: VELO.vitesse, service: VELO.service,
    libelleLimite: 'départ du train',
  },
  titreReport: 'Reportez vos résultats sur la fiche de tournée',
  consigneReport: 'Un seul de ces quatre résultats se lit sur une jauge ; les trois autres se '
    + 'calculent. Les cases ne donnent pas la réponse : elles disent seulement si la vôtre est '
    + 'juste.',
  // QUATRE cases, et le choix n'est pas neutre.
  //
  // Les deux premières portent sur la DÉCISION : il faut additionner les sept masses de la
  // fiche — aucune jauge ne donne ce total, puisque la jauge ne compte que ce qui est chargé —
  // puis mesurer le dépassement. La troisième est la seule qui se lise sur une jauge : elle
  // confirme à l'élève qu'il lit bien son tableau de bord, et elle lui met sous les yeux les
  // 179 kg sur 180 — on ne remplit jamais pile. La quatrième est le point de la séance :
  // **le temps passé aux arrêts pèse plus lourd que la distance**, et il faut l'avoir calculé
  // une fois pour le croire (36 minutes d'arrêts pour environ 110 minutes de route).
  //
  // Ce qu'on NE demande pas, et volontairement : l'avance sur le départ du train. La valeur
  // attendue deviendrait négative dès qu'un élève est en retard, et faire taper « −12 » à un
  // élève de première qui s'est déjà trompé n'apprend rien. La jauge le lui dit en clair, et
  // c'est le jalon « horaire » qui en tient le compte.
  report: [
    { id: 'total', libelle: 'Masse totale des sept commandes', unite: 'kg',
      valeur: (b) => b.retenus.concat(b.ecartes).reduce((t, p) => t + Number(p.kg || 0), 0) },
    { id: 'trop', libelle: 'Masse qui ne peut pas partir aujourd’hui', unite: 'kg',
      valeur: (b) => b.retenus.concat(b.ecartes).reduce((t, p) => t + Number(p.kg || 0), 0)
        - VELO.chargeUtile },
    { id: 'chargee', libelle: 'Masse chargée dans le vélo-cargo', unite: 'kg',
      valeur: (b) => b.cumuls.charge },
    { id: 'arrets', libelle: 'Temps passé aux arrêts sur toute la tournée', unite: 'min',
      valeur: (b) => b.retenus.length * VELO.service },
  ],
};

/* ====================================================================== l'accueil ===== */

export const ACCUEIL = {
  titre: 'Organiser la tournée, dans l’ordre',
  // Une seule tuile : les écrans Catalogue, Stock, Réceptions et Commandes sont vides pour
  // cette séance (voir `contenus/boost.js`), et des compteurs à zéro ne diraient rien.
  kpis: ['mail'],
  etapes: [
    ['Lire la consigne du responsable', 'Menu Messagerie : la fiche de tournée du jour et ce qu’on attend de vous.'],
    ['Situer les sept clients', 'Menu Plan de Nîmes. Vous n’avez que le nom de la rue : cherchez-la sur un plan en ligne, puis écrivez la case.'],
    ['Valider le repérage', 'Les noms s’affichent sur le plan, et la tournée s’ouvre.'],
    ['Choisir ce qui part', 'Menu Tournée. Les sept commandes pèsent plus que la charge utile du vélo-cargo : laissez à quai ce qui ne peut pas partir.'],
    ['Ordonner les arrêts', 'Glissez-les, ou utilisez les flèches. Le tracé et l’heure de retour suivent votre ordre.'],
    ['Reporter vos résultats', 'Les quatre cases du bas de la page, puis « Valider mes résultats ».'],
  ],
};

/* ======================================================================== le volet ==== */

export const VOLET = {
  id: 'boost-ent31',
  semer(prenom) {
    const now = Date.now();
    const fiche = DESTINATAIRES
      .map((d, i) => `${i + 1}. ${d.nom} — ${d.adresse} — ${d.colis} colis, ${d.kg} kg (${d.marque})`)
      .join('\n');
    return {
      mails: [
        { folder: 'in', ts: now - 3600e3 * 2, from: 'M. Morin, responsable d’exploitation',
          fromMail: 'exploitation@boost.example', to: prenom,
          subject: 'Tournée vélo-cargo du jour — à organiser avant 13 h', kind: 'text',
          text: `Bonjour ${prenom},\n\nVous prenez la tournée du vélo-cargo cet après-midi. `
            + `Rappel de la règle maison : nos colis partent en vélo-cargo jusqu’à la gare de `
            + `Nîmes-Centre, puis en train. Le train de Paris part à 16 h 10. Un colis qui `
            + `arrive après, c’est un client livré un jour plus tard.\n\nLe vélo-cargo emporte `
            + `au plus ${VELO.chargeUtile} kg. Vous partez de l’entrepôt à 13 h 00, comptez `
            + `${VELO.service} minutes par arrêt et une douzaine de kilomètres à l’heure en `
            + `ville.\n\nVoici les sept commandes à livrer :\n\n${fiche}\n\nTrois choses dans `
            + `l’ordre :\n\n1. Les clients ne nous donnent que le nom de leur rue. Situez-les `
            + `vous-même sur un plan, c’est la première chose qu’on fait ici.\n2. Additionnez `
            + `les masses. Si ça ne passe pas, décidez ce qui reste à quai — et dites-vous bien `
            + `que ce qui reste partira demain, donc autant que ce soit le moins pénalisant.\n`
            + `3. Mettez les arrêts dans un ordre qui vous ramène à la gare à l’heure.\n\n`
            + `Bon courage,\nM. Morin` },
      ],
    };
  },
};

/* ============================ Suivi de l'exercice ============================
 * Cinq jalons. Le barème de la séance, c'est leur nombre : chacun vaut 4 points sur 20.
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente il est commencé, la réponse manque
 *   na      l'élève n'en est pas encore là
 *
 * Les jalons ne recalculent RIEN eux-mêmes : ils montent une seconde instance de la vue
 * tournée et lui demandent son bilan. Deux calculs parallèles — un pour l'écran, un pour le
 * suivi — finiraient par ne plus dire la même chose, et c'est l'enseignant qui le
 * découvrirait en corrigeant.
 */

const VUE = creerTournee(Object.assign({ plan: PLAN }, TOURNEE));

const ORDRE_INITIAL = DESTINATAIRES.map((d) => String(d.id)).join(',');
const etatDe = (db, vue) => (db && db.transport && db.transport[TRANSPORT_ID]
  ? db.transport[TRANSPORT_ID][vue] : null);

// L'élève a-t-il touché à la tournée ? Tant qu'il ne l'a pas fait, on ne lui reproche pas
// une charge dépassée : c'est l'état de départ, pas une erreur.
function commencee(etat) {
  if (!etat || !etat.ordre) return false;
  if ((etat.quai || []).length) return true;
  if (etat.ordre.map(String).join(',') !== ORDRE_INITIAL) return true;
  return Object.keys(etat.report || {}).some((k) => String(etat.report[k] || '').trim() !== '');
}

const nomDe = (id) => (DESTINATAIRES.find((d) => String(d.id) === String(id)) || {}).nom || id;
const hhmm = (m) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')}`;

// Le client qu'il faut laisser à quai, et c'est le SEUL possible : avec 237 kg pour 180 kg
// utiles, il faut écarter au moins 57 kg, et La Pointe Sud (58 kg) est la seule commande qui
// y suffise à elle seule. Vérifié par énumération des 128 combinaisons, deux fois — avant et
// après le déplacement de l'entrepôt. Recalculé ici plutôt que recopié : si un poids change
// un jour, le jalon suit.
const A_QUAI = (() => {
  const trop = DESTINATAIRES.reduce((t, d) => t + d.kg, 0) - VELO.chargeUtile;
  const seuls = DESTINATAIRES.filter((d) => d.kg >= trop);
  return seuls.length === 1 ? String(seuls[0].id) : null;
})();

export const ETAPES = [
  {
    id: 'reperage',
    titre: 'Les sept clients situés sur le plan de Nîmes',
    verifier(db) {
      const e = etatDe(db, 'plan');
      if (!e || !e.juge || !Object.keys(e.juge).length) {
        return { status: e && e.secours ? 'attente' : 'na' };
      }
      const faux = DESTINATAIRES.filter((d) => e.juge[d.id] !== true);
      const detail = (faux.length
        ? `À revoir : ${faux.map((d) => d.nom).join(', ')}.`
        : 'Les sept cases sont justes.')
        + ` ${e.essais || 0} validation(s).`
        + (e.secours ? ' Quartiers révélés (pas d’accès à Internet).' : '')
        + (e.force ? ' A continué sans avoir validé le repérage.' : '');
      if (e.force && !e.valide) return { status: 'ko', detail, ts: e.force };
      if (!e.valide) return { status: 'attente', detail };
      // Le repérage peut être « validé » avec une case fausse (toleres: 1). Le point, non.
      return { status: faux.length === 0 ? 'ok' : 'ko', detail, ts: e.valide };
    },
  },
  {
    id: 'choix',
    titre: 'La bonne commande laissée à quai',
    verifier(db) {
      const e = etatDe(db, 'tournee');
      if (!e || !e.ordre) return { status: 'na' };
      const quai = (e.quai || []).map(String);
      if (!quai.length) return { status: 'attente', detail: 'Rien n’est encore laissé à quai.' };
      const detail = `Laissé(s) à quai : ${quai.map(nomDe).join(', ')}.`
        + (A_QUAI ? ` Attendu : ${nomDe(A_QUAI)} seul.` : '');
      const juste = A_QUAI && quai.length === 1 && quai[0] === A_QUAI;
      return { status: juste ? 'ok' : 'ko', detail };
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
      const detail = `${b.cumuls.charge} kg chargés sur ${VELO.chargeUtile} kg utiles, `
        + `${b.retenus.length} arrêt(s).`;
      return { status: b.cumuls.charge <= VELO.chargeUtile ? 'ok' : 'ko', detail };
    },
  },
  {
    id: 'horaire',
    titre: 'Le train de 16 h 10 est attrapé',
    verifier(db) {
      const e = etatDe(db, 'tournee');
      if (!e || !e.ordre) return { status: 'na' };
      if (!commencee(e)) return { status: 'attente' };
      const b = VUE.bilan(e);
      // Un ordre qui tient l'horaire en dépassant la charge ne vaut rien : le vélo n'aurait
      // pas pu partir chargé comme ça. Les deux contraintes se jugent ensemble.
      if (b.cumuls.charge > VELO.chargeUtile) {
        return { status: 'ko', detail: 'Le vélo-cargo est surchargé : l’horaire ne veut rien dire.' };
      }
      if (b.arrivee == null) return { status: 'attente' };
      const detail = `Retour prévu à ${hhmm(b.arrivee)} pour un train à ${hhmm(VELO.train)} — `
        + `${Math.round(Math.abs(VELO.train - b.arrivee))} min `
        + (b.enRetard ? 'de retard' : 'd’avance') + `, ${b.km.toFixed(1)} km.`;
      return { status: b.enRetard ? 'ko' : 'ok', detail };
    },
  },
  {
    id: 'report',
    titre: 'Les quatre résultats reportés sont justes',
    verifier(db) {
      const e = etatDe(db, 'tournee');
      if (!e || !e.juge || !Object.keys(e.juge).length) return { status: 'na' };
      const faux = TOURNEE.report.filter((r) => e.juge[r.id] !== true);
      const b = VUE.bilan(e);
      const detail = TOURNEE.report.map((r) => `${r.libelle} : `
        + `${e.report && e.report[r.id] !== undefined && String(e.report[r.id]).trim() !== ''
          ? e.report[r.id] : '(vide)'} `
        + `(attendu ${r.valeur(b)}) — ${e.juge[r.id] === true ? 'juste' : 'à revoir'}`).join('\n');
      return { status: faux.length === 0 ? 'ok' : 'ko', detail, ts: e.valide || undefined };
    },
  },
];
