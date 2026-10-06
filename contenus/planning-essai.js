// Contenus d'ESSAI de la vue « Planning » (core/types/planning.js) — 04/10/2026.
//
// Les trois cas de la maquette v8 (`docs/briefs/planning/maquette-planning.html`), validée par
// Tristan le 04/10/2026 : mêmes données, mêmes textes, règles DÉCLARÉES ici et non plus écrites
// dans la vue. Ils servent à la page d'essai (`outils/essai-planning.html`) et au bloc de tests
// `planning`. **Ce ne sont pas des séances** : les séances A2 et B1 de S1 écriront leurs contenus.
//
// Vérifié (mention de la maquette) : Smoby Toys a une plateforme logistique à Moirans-en-Montagne
// (Jura) ; Kuehne+Nagel est un transporteur réel, avec une agence Route à Besançon ; règles de conduite
// et de repos du règlement CE 561/2006.
// Construit : quais, horaires, palettes, salariés, effectifs, règles internes ; transporteurs et
// clients marqués « (fictif) » ; chauffeurs, camions, trajets et durées.

import { apresPlanning } from '../core/declencheurs.js';

export const MENTION = 'Essai de la vue Planning. <b>Vérifié</b> : Smoby Toys a une plateforme logistique à Moirans-en-Montagne (Jura) ; '
  + 'Kuehne+Nagel est un transporteur réel, avec une agence Route à Besançon ; règles de conduite et de repos du règlement CE 561/2006. '
  + '<b>Construit</b> : quais, horaires, palettes, salariés, effectifs, règles internes ; transporteurs et clients marqués « (fictif) » ; '
  + 'chauffeurs, camions, trajets et durées.';

const sansBalises = (t) => String(t).replace(/<[^>]+>/g, '');
const ids = (L) => L.map((c) => c.id).join(', ');
const semi = (c) => c.famille === 'semi';

/* ============================================================ 1. les quais */
const CARISTES = [
  { id: 'lea', nom: 'Léa', caces: true, de: '06:00', a: '13:00', note: '06:00–13:00 · CACES' },
  { id: 'karim', nom: 'Karim', caces: true, de: '07:00', a: '14:00', note: '07:00–14:00 · CACES' },
  { id: 'mathis', nom: 'Mathis', caces: false, de: '06:00', a: '14:00', note: '06:00–14:00 · sans CACES' },
];
const camion = (id, transp, famille, pal, des, avant) => ({ id, titre: `${id} — ${transp}`, transp, famille, pal, des, avant });

export const QUAI = {
  id: 'essai-quais',
  libelle: 'Planning des quais',
  titre: "Quais d'expédition — plateforme Smoby, Moirans-en-Montagne",
  date: 'Jeudi 10 décembre',
  infos: () => [
    "3 quais ; le quai 3 n'a pas de niveleur (porteurs seulement)",
    ...CARISTES.map((L) => `<b>${L.nom}</b> (cariste) : ${L.de}–${L.a}${L.caces ? ' · CACES' : ' · sans CACES'}`),
    "Attente d'un chauffeur : 30 min au plus",
  ],
  echelle: { type: 'heures', debut: '06:00', fin: '14:00', pas: 15 },
  lignes: { titre: 'Planning des quais — Jeudi 10 décembre', liste: [
    { id: 'Q1', nom: 'Quai 1', semi: true },
    { id: 'Q2', nom: 'Quai 2', semi: true },
    { id: 'Q3', nom: 'Quai 3', semi: false, note: 'sans niveleur : porteurs seulement' },
  ] },
  affectation: {
    question: 'Qui charge le camion {carte} ?', manque: 'cariste ?', lien: 'le cariste',
    liste: CARISTES,
    nonAffectees: (L) => `Camions sans cariste : ${ids(L)}.`,
    lecture: { titre: 'Journée des caristes', bloc: (c, q) => `${c.id} ${q.nom}`,
      legende: "Ce planning se remplit tout seul quand vous choisissez un cariste. Hachures : le cariste n'est pas encore arrivé ou est déjà parti." },
  },
  cartes: {
    titre: 'Camions du jour',
    liste: [
      camion('A', 'Kuehne+Nagel', 'semi', 33, '06:00', '08:30'),
      camion('B', 'Transports Comtois (fictif)', 'porteur', 12, '06:30', '09:00'),
      camion('C', 'Kuehne+Nagel', 'semi', 26, '07:00', '10:00'),
      camion('D', 'Rhône Fret (fictif)', 'semi', 30, '08:00', '11:00'),
      camion('E', 'Jura Express (fictif)', 'porteur', 8, '09:00', '11:00'),
      camion('F', 'Kuehne+Nagel', 'semi', 20, '10:00', '13:00'),
    ],
    details: (c) => [
      `${semi(c) ? 'Semi-remorque' : 'Porteur'} · ${c.pal} palettes`,
      `Arrivée <b>${c.des}</b>${c.modifie.includes('des') ? ' <b>(nouvelle heure)</b>' : ''} · départ au plus tard <b>${c.avant}</b>`,
    ],
    duree: (c) => 10 + 2 * c.pal,
    libDuree: 'Chargement',
    detailDuree: (c) => `10 min + ${c.pal} × 2 min`,
    nonPosees: (L) => `Camions sans quai : ${ids(L)}.`,
    legende: "Glissez un camion sur un quai, à l'heure où commence son chargement : une bulle s'ouvre pour choisir le cariste. "
      + 'Ou cliquez le camion, puis la case. Sur le planning, cliquez un camion pour rouvrir sa bulle ; pour le déplacer, glissez-le '
      + 'ou choisissez « Déplacer ». Clavier : Entrée pour prendre une carte (ou ouvrir la bulle sur le planning), Espace pour déplacer '
      + 'un bloc, flèches, Suppr pour retirer, Échap pour fermer.',
  },
  familles: { semi: { couleur: '#f0be00', nom: 'jaune', legende: 'semi-remorque' }, porteur: { couleur: '#8b5cf6', nom: 'violet', legende: 'porteur' } },
  regles: [
    { id: 'quaiUnique', type: 'unAlaFois', sur: 'ligne',
      message: (a, b, q) => `${q.nom} : les camions ${a.id} et ${b.id} sont sur le quai en même temps.` },
    { id: 'niveleur', type: 'compatible', sur: 'ligne', si: semi, exige: (q) => q.semi,
      message: (c, q) => `${q.nom} : le camion ${c.id} est une semi-remorque, ce quai n'a pas de niveleur.` },
    { id: 'cariste', type: 'unAlaFois', sur: 'affectation',
      message: (a, b, L) => `${L.nom} charge les camions ${a.id} et ${b.id} en même temps.` },
    { id: 'horaires', type: 'disponible', sur: 'affectation',
      message: (c, L) => `${L.nom} ne travaille pas à l'heure du chargement du camion ${c.id}.` },
    { id: 'caces', type: 'compatible', sur: 'affectation', si: semi, exige: (L) => L.caces,
      message: (c, L) => `${L.nom} n'a pas le CACES : il ne peut pas charger la semi-remorque ${c.id}.` },
    { id: 'fenetre', type: 'fenetre', message: {
      debut: (c) => `Camion ${c.id} : le chargement commence avant l'arrivée du camion.`,
      fin: (c) => `Camion ${c.id} : le chargement finit après l'heure de départ du camion.` } },
    { id: 'attente', type: 'attenteMax', minutes: 30,
      message: (c) => `Camion ${c.id} : le chauffeur attend plus de 30 min avant d'être chargé.` },
  ],
  jalons: [
    { id: 'tous', lib: 'Chaque camion a un quai et un cariste', regles: [] },
    { id: 'quais', lib: 'Quais : un camion à la fois, sur un quai qui lui convient', regles: ['quaiUnique', 'niveleur'] },
    { id: 'caristes', lib: 'Caristes : un camion à la fois, pendant leurs horaires, avec le CACES pour les semi-remorques', regles: ['cariste', 'horaires', 'caces'] },
    { id: 'fenetre', lib: "Chaque chargement commence après l'arrivée du camion et finit avant son départ", regles: ['fenetre'] },
    { id: 'attente', lib: "Critère métier : aucun chauffeur n'attend plus de 30 min", regles: ['attente', 'fenetre'] },
  ],
  aides: {
    consignes: {
      regles: "Chaque camion se charge sur <b>un quai</b>, par <b>un cariste</b> (bulle qui s'ouvre sur le planning). Le chargement dure 10 min (ouverture, documents) + 2 min par palette, arrondi au quart d'heure supérieur.",
      caristes: "Un cariste ne charge qu'un camion à la fois, et seulement pendant ses horaires (les heures hachurées, il n'est pas là). Une semi-remorque se charge au chariot élévateur : il faut un cariste qui a le <b>CACES</b>. Un porteur se charge au transpalette : tout le monde peut le faire.",
      attente: "Un chauffeur qui attend coûte de l'argent au transporteur (et à Smoby s'il le refacture). Règle de la plateforme : pas plus de 30 min d'attente.",
    },
    fenetre: {
      invite: 'Cliquez un camion : une bande ambrée montre de quelle heure à quelle heure on peut le charger.',
      carte: (c) => `Camion <b>${c.id}</b> : il arrive à <b>${c.des}</b> et doit être parti à <b>${c.avant}</b>. Son chargement doit tenir dans la bande ambrée.`,
    },
    detailDuree: true,
  },
  alea: {
    de: 'Rhône Fret (fictif) — exploitation',
    texte: 'Notre chauffeur est bloqué par la neige au col de la Savine. Il arrivera à <b>09:00</b> au lieu de 08:00. Son départ au plus tard ne change pas : <b>11:00</b>.',
    cartes: { D: { des: '09:00' } },
  },
  note: { sur: 20 },
};

/* ======================================================= 2. le personnel */
const SALARIES = [
  { id: 'karim', nom: 'Karim', caces: true, note: 'CACES' },
  { id: 'lea', nom: 'Léa', caces: true, note: 'CACES' },
  { id: 'mathis', nom: 'Mathis' },
  { id: 'ines', nom: 'Inès' },
  { id: 'chloe', nom: 'Chloé' },
  { id: 'yanis', nom: 'Yanis', caces: true, interim: true, arrivee: 'mer 9', note: 'CACES · intérim' },
];
const NOA = { id: 'noa', nom: 'Noa', interim: true, arrivee: 'mar 15', note: 'intérim' };
const nomDe = (id) => (SALARIES.concat(NOA).find((s) => s.id === id) || {}).nom || id;
const de = (id) => (/^[AEIOUYÉÈÎ]/.test(nomDe(id)) ? "d'" : 'de ') + nomDe(id);
const absence = (id, qui, lib, jours, date, impose, motif) => ({
  id, qui, lib, court: lib, jours, date, impose, motif, famille: impose ? 'impose' : 'conge', titre: `${nomDe(qui)} — ${lib}` });
const SANS_CHEVAUCHER = ['chevauche', 'arrivee'];

export const PERSO = {
  id: 'essai-personnel',
  libelle: 'Planning des absences',
  titre: 'Équipe de préparation — plateforme Smoby, Moirans-en-Montagne',
  date: 'Semaines du 7 et du 14 décembre',
  infos: (o) => [
    'Besoin du jour : ligne « Besoin »',
    'Au moins un cariste CACES présent par jour',
    ...o.lignes.map((s) => `<b>${s.nom}</b>${s.caces ? ' · CACES' : ''}${s.interim ? ' · intérimaire' : ''}${s.arrivee ? ` · arrive le ${s.arrivee}` : ''}`),
  ],
  echelle: { type: 'jours', jours: ['lun 7', 'mar 8', 'mer 9', 'jeu 10', 'ven 11', 'lun 14', 'mar 15', 'mer 16', 'jeu 17', 'ven 18'], semaine: 5 },
  lignes: { titre: 'Planning des présences — Semaines du 7 et du 14 décembre', liste: SALARIES,
    legende: 'Un jour sans absence, la personne est présente. Hachures : pas encore arrivé·e.' },
  cartes: {
    titre: "Demandes d'absence",
    liste: [
      absence('form-mathis', 'mathis', 'Formation CACES', 2, 'mar 8', true, 'Organisme de formation : session fixée.'),
      absence('visite-ines', 'ines', 'Visite médicale', 1, 'jeu 10', true, 'Médecine du travail : rendez-vous fixé.'),
      absence('cp-chloe', 'chloe', 'Congé payé', 2, 'lun 14', false, 'Demandé le 2 novembre.'),
      absence('cp-karim', 'karim', 'Congé payé', 1, 'mer 16', false, 'Demandé le 20 novembre.'),
      absence('cp-lea', 'lea', 'Congé payé', 3, 'mer 16', false, 'Demandé le 5 novembre.'),
    ],
    duree: (c) => c.jours,
    ligne: (c) => c.qui,
    semaineEntiere: true,
    aPlacer: 'À poser',
    details: (c, o) => [
      `${c.jours} jour${c.jours > 1 ? 's' : ''} · ${c.impose ? 'date <b>imposée</b>' : 'congé <b>demandé</b>'}`,
      `${c.impose ? 'Date' : 'Dates souhaitées'} : <b>${o.plage(c._dem, c._dem + c._L)}</b>`,
      c.motif,
    ],
    nonPosees: (L) => `Absences pas encore posées : ${L.map((a) => `${a.lib.toLowerCase()} ${de(a.qui)}`).join(', ')}.`,
    legende: 'Violet : absence imposée · jaune : congé demandé. Glissez une carte sur le planning (elle se pose sur la ligne de la personne, au jour visé), '
      + 'ou cliquez-la puis cliquez le jour. Clavier : Entrée pour la prendre, flèches gauche/droite, Suppr pour la retirer.',
  },
  familles: { impose: { couleur: '#8b5cf6', nom: 'violet', legende: 'absence imposée' }, conge: { couleur: '#f0be00', nom: 'jaune', legende: 'congé demandé' } },
  compteurs: [
    { lib: 'Présents', valeur: 'presents', regle: 'effectif' },
    { lib: 'Besoin', valeur: 'besoin', regle: 'effectif' },
    { lib: 'Caristes CACES', valeur: 'filtre', regle: 'caces' },
  ],
  regles: [
    { id: 'chevauche', type: 'unAlaFois', sur: 'ligne',
      message: (a, b, l) => `${l.nom} : cette absence tombe un jour où la personne est déjà absente ou pas encore arrivée.` },
    { id: 'arrivee', type: 'disponible', sur: 'ligne',
      message: (c, l) => `${l.nom} : cette absence tombe un jour où la personne est déjà absente ou pas encore arrivée.` },
    { id: 'imposee', type: 'dateImposee',
      message: (c, o) => `${c.lib} ${de(c.qui)} : la date est imposée (${o.jour(c._dem)}), elle ne se déplace pas.` },
    { id: 'effectif', type: 'effectif', besoin: [4, 4, 4, 5, 5, 5, 5, 5, 5, 4], message: (j) => `${j} : pas assez de monde présent.` },
    { id: 'caces', type: 'auMoinsUn', filtre: (l) => !!l.caces, libelle: 'cariste CACES', message: (j) => `${j} : aucun cariste CACES présent.` },
    { id: 'sansNecessite', type: 'sansNecessite', avec: ['chevauche', 'arrivee', 'effectif', 'caces'],
      message: (c) => `Le congé ${de(c.qui)} pouvait être accordé à la date demandée.` },
  ],
  // Chaque jalon exige aussi « sans se chevaucher » (dans la maquette, « tout est posé » le comprenait).
  jalons: [
    { id: 'tous', lib: 'Toutes les absences sont posées, sans se chevaucher', regles: SANS_CHEVAUCHER },
    { id: 'imposees', lib: 'Les absences imposées (formation, visite, arrêt) sont à leur date', regles: [...SANS_CHEVAUCHER, 'imposee'] },
    { id: 'effectif', lib: 'Chaque jour a assez de monde présent', regles: [...SANS_CHEVAUCHER, 'effectif'] },
    { id: 'caces', lib: 'Chaque jour a au moins un cariste CACES présent', regles: [...SANS_CHEVAUCHER, 'caces'] },
    { id: 'conges', lib: 'Critère métier : aucun congé décalé sans nécessité', regles: [...SANS_CHEVAUCHER, 'sansNecessite', 'imposee', 'effectif', 'caces'] },
  ],
  aides: {
    consignes: {
      regles: 'Posez chaque absence sur la ligne de la personne. Les absences <b>imposées</b> (formation, visite, arrêt) se posent à leur date. Les <b>congés</b> se posent à la date demandée… sauf s\'il manque alors du monde : il faut les décaler. Un jour sans absence, la personne est présente.',
      caces: 'Le chargement des camions se fait au chariot : il faut au moins un cariste qui a le CACES présent chaque jour.',
      conge: "Un congé se refuse ou se décale seulement s'il met l'équipe en difficulté. Quand c'est possible, on l'accorde à la date demandée.",
    },
    fenetre: {
      invite: "Cliquez une demande : ses dates (imposées ou souhaitées) s'affichent en ambré sur la ligne de la personne.",
      carte: (c) => `${c.titre} : ${c.impose ? 'date imposée' : 'dates souhaitées'} en ambré.`,
    },
  },
  alea: {
    de: 'Responsable de la plateforme',
    texte: "Inès est en <b>arrêt maladie du lundi 14 au mercredi 16</b> (une nouvelle carte est arrivée dans les demandes). L'agence d'intérim nous envoie <b>Noa</b> (intérimaire, <b>sans CACES</b>) à partir du <b>mardi 15</b>. Reprenez le planning des absences et renvoyez-le-moi.",
    ajoutCartes: [absence('am-ines', 'ines', 'Arrêt maladie', 3, 'lun 14', true, 'Certificat reçu ce matin.')],
    ajoutLignes: [NOA],
  },
  note: { sur: 20 },
};

/* ====================================================== 3. les chauffeurs */
const CHAUFFEURS = [
  { id: 'sofiane', nom: 'Sofiane', permis: 'CE', finHier: '20:00', note: 'permis CE' },
  { id: 'julie', nom: 'Julie', permis: 'CE', finHier: '17:00', note: 'permis CE' },
  { id: 'marc', nom: 'Marc', permis: 'C', finHier: '18:00', note: 'permis C' },
  { id: 'nadia', nom: 'Nadia', permis: 'CE', finHier: '23:00', note: 'permis CE' },
];
const CAMIONS = [
  { id: 's1', nom: 'Semi n° 1', type: 'semi', note: 'semi-remorque' },
  { id: 's2', nom: 'Semi n° 2', type: 'semi', note: 'semi-remorque' },
  { id: 'p3', nom: 'Porteur n° 3', type: 'porteur', note: 'porteur' },
];
const fmtH = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
const trajet = (id, vers, type, pal, conduite, des, avant) => ({ id, vers, type, famille: type, pal, conduite, des, avant,
  titre: `${id} — Moirans → ${vers}` });

export const CHAUF = {
  id: 'essai-chauffeurs',
  libelle: 'Planning des chauffeurs',
  titre: 'Exploitation — Kuehne+Nagel, agence Route de Besançon',
  date: 'Jeudi 10 décembre — enlèvements de la commande de Noël chez Smoby (Moirans-en-Montagne)',
  infos: (o) => [
    ...o.lignes.map((c) => `<b>${c.nom}</b> : permis ${c.permis} · fin de service hier <b>${c.finHier}</b>${o.reprise(c) ? ` → départ possible dès <b>${o.reprise(c)}</b>` : ''}`),
    'Conduite : 4 h 30 au plus sans pause de 45 min · 9 h au plus par jour · 11 h de repos depuis hier',
    ...o.ressources.map((k) => `${k.nom} (${k.type === 'semi' ? 'semi-remorque' : 'porteur'})${k.dispo ? ` · <b>à l'atelier jusqu'à ${k.dispo}</b>` : ''}`),
  ],
  echelle: { type: 'heures', debut: '05:00', fin: '19:00', pas: 15 },
  lignes: { titre: 'Planning des chauffeurs — jeudi 10 décembre', liste: CHAUFFEURS },
  affectation: {
    question: 'Quel camion pour {carte} ?', manque: 'camion ?', lien: 'le camion',
    liste: CAMIONS,
    nonAffectees: (L) => `Enlèvements sans camion : ${ids(L)}.`,
    lecture: { titre: 'Utilisation des camions', bloc: (c, l) => `${c.id} ${l.nom}`,
      legende: "Ce planning se remplit tout seul quand vous choisissez un camion. Hachures : camion à l'atelier." },
  },
  cartes: {
    titre: 'Enlèvements du jour',
    liste: [
      trajet('E1', 'Lyon — Jouets du Rhône (fictif)', 'semi', 33, 240, '06:00', '12:00'),
      trajet('E2', 'Dijon — Maxi Jouets (fictif)', 'semi', 26, 210, '08:00', '14:00'),
      trajet('E3', 'Besançon — magasin Ludik (fictif)', 'porteur', 12, 150, '07:00', '12:00'),
      trajet('E4', 'Mâcon — Centrale du Jouet (fictif)', 'semi', 30, 180, '11:00', '17:00'),
      trajet('E5', 'Besançon — magasin Ludik (fictif), 2e livraison', 'porteur', 8, 120, '12:00', '17:00'),
    ],
    duree: (c) => c.conduite,
    details: (c) => [
      `${c.type === 'semi' ? 'Semi-remorque' : 'Porteur'} · ${c.pal} palettes · trajet <b>${fmtH(c.conduite)}</b> de conduite`,
      `Prêt à partir dès <b>${c.des}</b> · livré avant <b>${c.avant}</b>`,
    ],
    pauses: { nombre: 4, duree: 45, libelle: 'Pause 45 min', aPoser: 'À poser si besoin' },
    nonPosees: (L) => `Enlèvements sans chauffeur : ${ids(L)}.`,
    legende: "Glissez un enlèvement sur la ligne d'un chauffeur, à l'heure du départ : une bulle s'ouvre pour choisir son camion. Même geste pour une pause. "
      + 'Ou cliquez la carte, puis la case. Sur le planning, cliquez un enlèvement pour rouvrir sa bulle ; pour le déplacer, glissez-le ou choisissez '
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
  jalons: [
    { id: 'tous', lib: 'Chaque enlèvement a un chauffeur et un camion', regles: [] },
    { id: 'chauffeurs', lib: 'Chauffeurs : un trajet à la fois, avec le bon permis', regles: ['chauffeurUnique', 'permis'] },
    { id: 'camions', lib: 'Camions : un trajet à la fois, du bon type, disponibles', regles: ['camionUnique', 'typeCamion', 'atelier'] },
    { id: 'fenetre', lib: "Chaque trajet part quand la marchandise est prête et livre avant l'heure limite", regles: ['fenetre'] },
    { id: 'conduite', lib: 'Temps de conduite et repos respectés (4 h 30, 9 h, 11 h)', regles: ['repos', 'pause', 'jour'] },
  ],
  aides: {
    consignes: {
      regles: "Chaque enlèvement se pose sur la ligne d'<b>un chauffeur</b>, à l'heure du départ, et reçoit <b>un camion</b> (bulle qui s'ouvre sur le planning). Un chauffeur et un camion ne font qu'un trajet à la fois. Une semi-remorque demande le permis <b>CE</b> ; un porteur se conduit avec le permis <b>C</b> (le permis CE le permet aussi).",
      conduite: 'Temps de conduite : <b>4 h 30</b> au plus sans pause ; la pause dure <b>45 min</b> (posez une carte Pause sur la ligne du chauffeur, entre deux trajets). <b>9 h</b> de conduite au plus dans la journée.',
      repos: "Entre la fin de service d'hier et le premier départ d'aujourd'hui : <b>11 h de repos</b> au moins.",
    },
    fenetre: {
      invite: 'Cliquez un enlèvement : une bande ambrée montre quand il peut rouler. Quadrillé : le chauffeur est encore en repos.',
      carte: (c) => `${c.id} : prêt dès <b>${c.des}</b>, livré avant <b>${c.avant}</b>. Le trajet doit tenir dans la bande ambrée.`,
    },
    reprise: true,
    compteurConduite: true,
  },
  alea: {
    de: 'Atelier Kuehne+Nagel Besançon',
    texte: "Le <b>Semi n° 2</b> a un problème de freins : il reste à l'atelier jusqu'à <b>12:00</b>. Il ne peut faire aucun trajet avant cette heure. Reprenez le planning des chauffeurs et renvoyez-le-moi.",
    ressources: { s2: { dispo: '12:00' } },
  },
  note: { sur: 20 },
};

export const CAS = { quai: QUAI, perso: PERSO, chauf: CHAUF };

// Le volet d'essai : l'aléa arrive par la messagerie, une fois le 1er planning envoyé (juste ou faux).
export function voletEssai(P) {
  return {
    id: `volet-${P.id}`,
    semer: () => ({}),
    declencheurs: [{
      id: 'alea', quand: apresPlanning(P.id),
      semer: (prenom) => ({ mails: [{ folder: 'in', ts: Date.now(), from: P.alea.de, fromMail: 'exploitation@essai.example', to: prenom,
        subject: 'Changement : planning à reprendre', kind: 'text', text: sansBalises(P.alea.texte) }] }),
      phasePlanning: 2,
    }],
  };
}
