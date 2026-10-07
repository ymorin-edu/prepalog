// ENT-5.7 — Kuehne+Nagel, « les enlèvements de Noël » : les données de la séance (brief
// `docs/briefs/ENT-5.7-smoby-enlevements.md`). Univers commun : `contenus/smoby.js`.
//
// L'élève, agent d'exploitation à l'agence Kuehne+Nagel de Besançon, affecte un chauffeur et un camion
// à chacun des 5 enlèvements de la commande de Noël chez Smoby (jeudi 10 décembre), en respectant
// permis, fenêtres, pauses, plafond de conduite et repos (vue Planning, cas « chauffeurs et camions » de
// la maquette v8), puis replanifie quand le Semi n° 2 part à l'atelier.
//
// Vérifié / construit : voir `contenus/smoby.js` (bloc Kuehne+Nagel). Simplifications assumées (validées
// avec la maquette v8) : une pause ne compte que si une carte Pause est posée ; le trajet compte en entier
// comme de la conduite ; pas de critère métier.
//
// Le planning reprend TELLES QUELLES les données et règles du cas « chauffeurs » de la maquette v8
// (`contenus/planning-essai.js`, `CHAUF`), dans l'environnement Smoby / K+N.

import { apresPlanning } from '../core/declencheurs.js';
import { etapesPlanning } from '../core/types/planning.js';
import { LEXIQUE as LEXIQUE_SMOBY, CHAUFFEURS, CAMIONS, ENLEVEMENTS, KN_AGENCE } from './smoby.js';
import { BRUNO } from './smoby-ent54.js';

// ─────────────────────────────────────────────────────────────── les mots cliquables

export const LEXIQUE = Object.assign({}, LEXIQUE_SMOBY, {
  'enlèvement': 'Passage du transporteur chez l’expéditeur pour charger la marchandise et l’emmener chez le client.',
  'permis CE': 'Permis pour conduire un camion avec une remorque lourde, comme une semi-remorque. Il permet aussi de conduire un porteur.',
  'semi-remorque': 'Ensemble d’un tracteur et d’une grande remorque sans essieu avant ; il faut le permis CE.',
  porteur: 'Camion d’un seul tenant : la caisse est fixée sur le châssis. Il se conduit avec le permis C.',
  'temps de conduite': 'Le temps passé au volant. Il est limité par la loi : 4 h 30 d’affilée au plus, 9 h dans la journée.',
  pause: 'Arrêt obligatoire de 45 min après 4 h 30 de conduite au plus.',
  'repos journalier': 'Temps sans travailler entre deux journées : au moins 11 h entre la fin d’hier et le premier départ.',
});

// ─────────────────────────────────────────────────────────────── le planning des chauffeurs

const ids = (L) => L.map((c) => c.id).join(', ');
const semi = (c) => c.famille === 'semi';
const fmtH = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
const sansBalises = (t) => String(t).replace(/<[^>]+>/g, '');

export const PLANNING = {
  id: 'kn-chauffeurs',
  libelle: 'Planning des chauffeurs',
  titre: 'Exploitation — Kuehne+Nagel, agence Route de Besançon',
  date: 'Jeudi 10 décembre — enlèvements de la commande de Noël chez Smoby (Moirans-en-Montagne)',
  infos: (o) => [
    ...o.lignes.map((c) => `<b>${c.nom}</b> : permis ${c.permis} · fin de service hier <b>${c.finHier}</b>${o.reprise(c) ? ` → départ possible dès <b>${o.reprise(c)}</b>` : ''}`),
    '[[temps de conduite]] : 4 h 30 au plus sans [[pause]] de 45 min · 9 h au plus par jour · 11 h de [[repos journalier]] depuis hier',
    ...o.ressources.map((k) => `${k.nom} (${k.type === 'semi' ? '[[semi-remorque]]' : '[[porteur]]'})${k.dispo ? ` · <b>à l'atelier jusqu'à ${k.dispo}</b>` : ''}`),
  ],
  echelle: { type: 'heures', debut: '05:00', fin: '19:00', pas: 15 },
  lignes: { titre: 'Planning des chauffeurs — jeudi 10 décembre', liste: CHAUFFEURS },
  affectation: {
    question: 'Quel camion pour {carte} ?', manque: 'camion ?', lien: 'le camion',
    liste: CAMIONS,
    nonAffectees: (L) => `Enlèvements sans camion : ${ids(L)}.`,
    lecture: { titre: 'Utilisation des camions', bloc: (c, l) => `${c.id} ${l.nom}`,
      legende: "Ce planning se remplit tout seul quand tu choisis un camion. Hachures : camion à l'atelier." },
  },
  cartes: {
    titre: 'Enlèvements du jour',
    liste: ENLEVEMENTS,
    duree: (c) => c.conduite,
    details: (c) => [
      `${c.type === 'semi' ? 'Semi-remorque' : 'Porteur'} · ${c.pal} palettes · trajet <b>${fmtH(c.conduite)}</b> de conduite`,
      `Prêt à partir dès <b>${c.des}</b> · livré avant <b>${c.avant}</b>`,
    ],
    pauses: { nombre: 4, duree: 45, libelle: 'Pause 45 min', aPoser: 'À poser si besoin' },
    nonPosees: (L) => `Enlèvements sans chauffeur : ${ids(L)}.`,
    legende: "Glisse un enlèvement sur la ligne d'un chauffeur, à l'heure du départ : une bulle s'ouvre pour choisir son camion. Même geste pour une pause. "
      + 'Ou clique la carte, puis la case. Sur le planning, clique un enlèvement pour rouvrir sa bulle ; pour le déplacer, glisse-le ou choisis '
      + '« Déplacer ». Clavier : Entrée pour prendre une carte (ou ouvrir la bulle sur le planning), Espace pour déplacer un bloc, flèches, Suppr '
      + 'pour retirer, Échap pour fermer.',
  },
  familles: { semi: { couleur: '#f0be00', nom: 'jaune', legende: 'semi-remorque' }, porteur: { couleur: '#8b5cf6', nom: 'violet', legende: 'porteur' } },
  regles: [
    { id: 'chauffeurUnique', type: 'unAlaFois', sur: 'ligne',
      message: (a, b, l) => `${l.nom} a deux choses en même temps (${a.pause ? 'pause' : a.id} et ${b.pause ? 'pause' : b.id}).` },
    { id: 'permis', type: 'compatible', sur: 'ligne', si: semi, exige: (l) => l.permis === 'CE',
      message: (c, l) => `${l.nom} a le permis C : il ne peut pas conduire la semi-remorque de ${c.id}.` },
    { id: 'camionUnique', type: 'unAlaFois', sur: 'affectation',
      message: (a, b, k) => `Le ${k.nom} fait ${a.id} et ${b.id} en même temps.` },
    { id: 'typeCamion', type: 'compatible', sur: 'affectation', exige: (k, c) => k.type === c.type,
      message: (c, k) => `${c.id} demande un ${c.type === 'semi' ? 'semi' : 'porteur'} : le ${k.nom} ne convient pas.` },
    { id: 'atelier', type: 'disponible', sur: 'affectation',
      message: (c, k) => `${c.id} : le ${k.nom} est à l'atelier jusqu'à ${k.dispo}.` },
    { id: 'fenetre', type: 'fenetre', marque: 'ligne', message: {
      debut: (c) => `${c.id} : le départ est prévu avant que la marchandise soit prête.`,
      fin: (c) => `${c.id} : la livraison arrive après l'heure limite.` } },
    { id: 'repos', type: 'reposDepuisVeille', repos: 11 * 60, message: (l) => `${l.nom} n'a pas eu ses 11 h de repos depuis hier soir.` },
    { id: 'pause', type: 'cumulSansPause', max: 4 * 60 + 30, message: (l) => `${l.nom} conduit plus de 4 h 30 sans pause.` },
    { id: 'jour', type: 'plafond', max: 9 * 60, message: (l) => `${l.nom} conduit plus de 9 h dans la journée.` },
  ],
  // Une règle = un jalon (brief SMOBY-notation-5.3-5.8, lot 1, 07/10/2026). Chacun n'est vrai que si tous les
  // enlèvements sont posés ET affectés (moteur). L'atelier n'est jugé qu'après la panne : avant, il serait gratuit.
  jalons: [
    { id: 'chauffeurUnique', lib: 'Un chauffeur ne fait qu’un trajet à la fois', regles: ['chauffeurUnique'] },
    { id: 'permis', lib: 'Une semi-remorque est conduite avec le permis CE', regles: ['permis'] },
    { id: 'camionUnique', lib: 'Un camion ne fait qu’un trajet à la fois', regles: ['camionUnique'] },
    { id: 'typeCamion', lib: 'Chaque enlèvement a le bon type de camion', regles: ['typeCamion'] },
    { id: 'atelier', lib: 'Le Semi n° 2 ne roule pas avant sa sortie d’atelier', regles: ['atelier'], versions: [2] },
    { id: 'fenetre', lib: "Chaque trajet part quand la marchandise est prête et livre avant l'heure limite", regles: ['fenetre'] },
    { id: 'repos', lib: '11 h de repos depuis hier soir', regles: ['repos'] },
    { id: 'pause', lib: 'Pas plus de 4 h 30 de conduite sans pause', regles: ['pause'] },
    { id: 'jour', lib: 'Pas plus de 9 h de conduite dans la journée', regles: ['jour'] },
  ],
  // Le planning d'après la panne renvoyé sans changement : toutes ses cases fausses, sauf s'il respectait déjà la
  // panne (décision de Tristan, 07/10/2026, Q4 et sa précision).
  repriseIdentique: 'faux',
  aides: {
    consignes: {
      regles: "Chaque enlèvement se pose sur la ligne d'<b>un chauffeur</b>, à l'heure du départ, et reçoit <b>un camion</b> (bulle qui s'ouvre sur le planning). Un chauffeur et un camion ne font qu'un trajet à la fois. Une semi-remorque demande le permis <b>CE</b> ; un porteur se conduit avec le permis <b>C</b> (le permis CE le permet aussi).",
      conduite: 'Temps de conduite : <b>4 h 30</b> au plus sans pause ; la pause dure <b>45 min</b> (pose une carte Pause sur la ligne du chauffeur, entre deux trajets). <b>9 h</b> de conduite au plus dans la journée.',
      repos: "Entre la fin de service d'hier et le premier départ d'aujourd'hui : <b>11 h de repos</b> au moins.",
    },
    fenetre: {
      invite: 'Clique un enlèvement : une bande ambrée montre quand il peut rouler. Quadrillé : le chauffeur est encore en repos.',
      carte: (c) => `${c.id} : prêt dès <b>${c.des}</b>, livré avant <b>${c.avant}</b>. Le trajet doit tenir dans la bande ambrée.`,
    },
    reprise: true,
    compteurConduite: true,
  },
  alea: {
    de: 'Atelier Kuehne+Nagel Besançon',
    texte: "Le <b>Semi n° 2</b> a un problème de freins : il reste à l'atelier jusqu'à <b>12:00</b>. Il ne peut faire aucun trajet avant cette heure. Reprends le planning des chauffeurs et renvoie-le-moi.",
    ressources: { s2: { dispo: '12:00' } },
  },
  // Pas de `note` : en guidage, la note de la séance est celle de ses 17 étapes pondérées.
};

// Une solution juste avant et après la panne (`s` = quart d'heure depuis 05:00 : 07:00 → 8). Elle n'est pas
// recopiée d'ailleurs : la suite de tests la fait juger par le moteur (20 / 20), le corrigé l'affiche.
// Avant : Sofiane E1 puis E4 sur le Semi n° 1, Julie E2 (Semi n° 2) puis E5 (Porteur n° 3), Marc E3.
// Après : le Semi n° 2 ne roule qu'à partir de 12:00 → E4 passe dessus avec Julie, E2 part avec Sofiane.
export const SOLUTION = {
  v1: { E1: { r: 'sofiane', s: 8, k: 's1' }, E3: { r: 'marc', s: 8, k: 'p3' }, E2: { r: 'julie', s: 12, k: 's2' },
    'pause-1': { r: 'julie', s: 26 }, 'pause-2': { r: 'sofiane', s: 24 }, E4: { r: 'sofiane', s: 27, k: 's1' }, E5: { r: 'julie', s: 29, k: 'p3' } },
  v2: { E1: { r: 'julie', s: 4, k: 's1' }, E3: { r: 'marc', s: 8, k: 'p3' }, 'pause-1': { r: 'julie', s: 20 },
    E2: { r: 'sofiane', s: 20, k: 's1' }, E4: { r: 'julie', s: 28, k: 's2' }, 'pause-2': { r: 'sofiane', s: 34 }, E5: { r: 'sofiane', s: 37, k: 'p3' } },
};

// ─────────────────────────────────────────────────────────────── les messages

const RESPONSABLE = { nom: 'Responsable d’exploitation — Kuehne+Nagel Besançon', mail: `exploitation@${KN_AGENCE.mailDomain}` };
const ATELIER = { nom: PLANNING.alea.de, mail: `atelier@${KN_AGENCE.mailDomain}` };
export const SUJET_ACCUEIL = 'Commande de Noël : 5 enlèvements jeudi';
export const SUJET_PLANNING = 'Planning de jeudi';

export const VOLET = {
  id: 'smoby-ent57',
  // Chaque planning renvoyé après correction (séance `correction`) reçoit un accusé : il ne rejoue pas la panne
  // et ne dit jamais si la correction est juste.
  corrections: {
    [PLANNING.id]: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 5000, from: RESPONSABLE.nom, fromMail: RESPONSABLE.mail, to: prenom,
      subject: 'Planning corrigé', kind: 'text', text: `Merci ${prenom}, j’ai bien reçu ton planning corrigé.`,
    }] }),
  },
  semer: (prenom) => ({
    mails: [{
      // Le passage de relais d'ENT-5.6 : Bruno, chef de quai Smoby, prévient l'exploitation K+N.
      folder: 'in', ts: Date.now() - 120000, from: `${BRUNO.nom} (Smoby Moirans)`, fromMail: BRUNO.mail, to: 'Exploitation K+N',
      subject: SUJET_ACCUEIL, kind: 'text',
      text: 'Bonjour l’exploitation !\n\n'
        + 'La commande de Noël est en stock, prête à partir jeudi 10 décembre : 5 [[enlèvement]]s.\n'
        + ENLEVEMENTS.map((e) => `· ${e.id} ${e.vers.split(' — ')[0]}, ${e.pal} palettes, en ${e.type}, dès ${e.des}`).join('\n') + '\n\n'
        + 'Le détail (heures limites de livraison) est sur votre planning.\n\nBruno — Smoby Moirans',
    }, {
      folder: 'in', ts: Date.now() - 60000, from: RESPONSABLE.nom, fromMail: RESPONSABLE.mail, to: prenom,
      subject: SUJET_PLANNING, kind: 'text',
      text: `${prenom}, planifie les 5 enlèvements de jeudi chez Smoby : un chauffeur et un camion pour chacun `
        + '(menu « Planning des chauffeurs »).\n\n'
        + 'Attention aux temps de conduite : 4 h 30 au plus sans [[pause]], 9 h dans la journée, 11 h de [[repos journalier]] depuis hier soir. '
        + 'Et une [[semi-remorque]] ne se conduit pas sans le [[permis CE]].\n\n'
        + 'Quand ton planning est prêt, envoie-le-moi depuis l’écran du planning.',
    }],
  }),
  declencheurs: [{
    // Le 1er planning envoyé (juste ou faux) : la panne, et la vue passe à la reprise.
    id: 'alea',
    quand: apresPlanning(PLANNING.id),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 1000, from: ATELIER.nom, fromMail: ATELIER.mail, to: prenom,
      subject: 'Changement : planning à reprendre', kind: 'text', text: sansBalises(PLANNING.alea.texte),
    }] }),
    phasePlanning: 2,
  }, {
    // Le planning repris et renvoyé (juste ou faux) : la suite de l'histoire, sans dire si c'était juste.
    id: 'fin',
    quand: apresPlanning(PLANNING.id, 2),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 2000, from: RESPONSABLE.nom, fromMail: RESPONSABLE.mail, to: prenom,
      subject: `RE : ${SUJET_PLANNING}`, kind: 'text',
      text: `Merci ${prenom}, c’est noté. Demain matin, je te confie la lettre de voiture d’E1.`,
    }] }),
  }],
};

// ─────────────────────────────────────────────────────────────── les jalons (17, barème sur 20)

// Lot 1 du brief SMOBY-notation-5.3-5.8, barème validé par Tristan le 07/10/2026 : une règle = une case, dans chaque
// version. Avant la panne 9 points (8 règles), après la panne 11 points (les mêmes 9 + l'atelier 2). Total : 20.
// `groupe` = la ligne du bandeau de fin (4 par version) ; `ecran` = où l'élève corrige.
export const POIDS = { chauffeurUnique: 1, permis: 1.5, camionUnique: 1, typeCamion: 1.5, atelier: 2, fenetre: 1, repos: 1, pause: 1, jour: 1 };
const GROUPE = { chauffeurUnique: 'les chauffeurs', permis: 'les chauffeurs', camionUnique: 'les camions', typeCamion: 'les camions',
  atelier: 'les camions', fenetre: 'les horaires d’enlèvement', repos: 'la conduite et le repos', pause: 'la conduite et le repos',
  jour: 'la conduite et le repos' };
export const ETAPES = etapesPlanning(PLANNING).map((e) => {
  const avant = e.id.startsWith('v1-'), regle = e.id.slice(3);
  return Object.assign(e, {
    groupe: `${avant ? 'Avant la panne' : 'Après la panne'} : ${GROUPE[regle]}`,
    ecran: `planning:${PLANNING.id}`,
    poids: POIDS[regle],
  });
});

// ─────────────────────────────────────────────────────────────── l'accueil

export const ACCUEIL = {
  titre: 'Les enlèvements de Noël',
  kpis: ['mail'],
  etapes: [
    ['Lire les messages', 'Menu Messagerie : Bruno (Smoby) annonce les 5 enlèvements, ton responsable te confie le planning.'],
    ['Planifier les chauffeurs', 'Menu Planning des chauffeurs : un chauffeur et un camion pour chaque enlèvement, des pauses si besoin. Puis envoie le planning.'],
    ['Reprendre après la panne', 'Un message de l’atelier t’annonce un camion indisponible : reprends le planning et renvoie-le.'],
    ['Bon à savoir', 'Smoby, sa plateforme de Moirans-en-Montagne et l’agence Kuehne+Nagel de Besançon sont réelles. Le contrat entre les deux, '
      + 'les chauffeurs, les camions, les clients et les horaires sont inventés pour l’exercice.'],
  ],
};
