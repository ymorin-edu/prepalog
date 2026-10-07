// ENT-5.4 — Smoby, « premier déchargement » : les données de la séance (brief
// `docs/briefs/ENT-5.4-smoby-reception.md`). Univers commun : `contenus/smoby.js`.
//
// Yanis (l'élève), cariste au quai 2 de la plateforme de Moirans-en-Montagne, mercredi 9 décembre 2026
// à 14 h : constater la sécurité avant de décharger (étape ⓪), décharger au chariot la navette de l'usine
// d'Arinthod, contrôler 4 palettes de jouets, écrire des réserves précises, puis rendre compte à Bruno par
// phrases à choisir. Toute la séance se joue sur la vue quai (`core/types/quai.js`), en mode SANS FROID.
//
// Vérifié (brief §2) : l'usine d'Arinthod et la plateforme de Moirans ; les gammes Smoby Life, Tefal,
// Little Smoby, Black+Decker et la maison Neo Jura Lodge ; les points de sécurité au quai.
// Construit : le flux usine → plateforme tel qu'il est joué, le quai n° 2, l'horaire, le transporteur
// « Transports Jurassiens », Bruno, les références, quantités, lots et défauts.
//
// Les valeurs attendues (cartons réels, réserves, phrase juste du compte rendu) sont CALCULÉES depuis les
// palettes (W × D × L − manque, BL − réel, nombre d'avaries), jamais recopiées.

import { jalonsQuai, MOTIFS } from '../core/types/quai.js';
import { apresMail } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { LEXIQUE as LEXIQUE_SMOBY } from './smoby.js';

export const BRUNO = { nom: 'Bruno', mail: 'bruno.quai@smoby-moirans.example', role: 'chef de quai' };

// Une palette : W cartons en largeur × D en profondeur × L couches. `manque` : cartons absents « i,j,k »
// (k = couche, 0 en bas ; j = 0 au fond, D − 1 devant). `avarie` : carton abîmé « i,j,k » → côté abîmé.
export const PALETTES_ENT54 = [
  // Aucun aléa.
  { id: 'P1', ref: 'SMB-NJL', nom: 'Maison Neo Jura Lodge', bl: 8,
    etiq: { ref: 'SMB-NJL', nom: 'MAISON NEO JURA LODGE', poids: '1 maison en kit par carton', lot: 'ARI-26-4812' },
    W: 2, D: 2, L: 2, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun' },
  // Couche du dessus incomplète, mais conforme au BL : le piège de comptage.
  { id: 'P2', ref: 'SMB-CTF', nom: 'Cuisine Tefal', bl: 45,
    etiq: { ref: 'SMB-CTF', nom: 'CUISINE TEFAL', poids: '1 cuisine par carton', lot: 'ARI-26-4790' },
    W: 4, D: 3, L: 4, manque: ['0,0,3', '1,0,3', '2,0,3'], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun' },
  // Un carton écrasé, sur la face arrière : il faut faire le tour.
  { id: 'P3', ref: 'SMB-EBD', nom: 'Établi Black+Decker', bl: 36,
    etiq: { ref: 'SMB-EBD', nom: 'ÉTABLI BLACK+DECKER', poids: '1 établi par carton', lot: 'ARI-26-4805' },
    W: 4, D: 3, L: 3, manque: [], avarie: { '2,0,1': [0, -1] }, attendu: 'reserves', motifAttendu: 'avarie' },
  // Deux cartons manquants, dont un dans le coin du fond.
  { id: 'P4', ref: 'SMB-PLS', nom: 'Porteur Little Smoby', bl: 36,
    etiq: { ref: 'SMB-PLS', nom: 'PORTEUR LITTLE SMOBY', poids: '1 porteur par carton', lot: 'ARI-26-4777' },
    W: 3, D: 3, L: 4, manque: ['2,2,3', '0,0,3'], avarie: {}, attendu: 'reserves', motifAttendu: 'manquant' },
];

const reel = (p) => p.W * p.D * p.L - p.manque.length;
const pal = (id) => PALETTES_ENT54.find((p) => p.id === id);

// L'étape ⓪ (brief §4.1). La dernière phrase de la scène est écrite comme les autres : rien ne la souligne.
export const SECURITE = {
  scene: 'La navette d’Arinthod est à quai. Le chauffeur a coupé le moteur et t’a remis ses clés ; il attend dans le '
    + 'local chauffeurs. Le [[niveleur]] est posé, la remorque est éclairée. Tu portes tes chaussures de sécurité et ton '
    + 'gilet. Les roues arrière ne sont pas calées.',
  points: [
    { id: 'cale', lib: 'Camion [[cale|calé]] (cale ou bloqueur de roue)', ok: false },
    { id: 'moteur', lib: 'Moteur coupé, clés remises', ok: true },
    { id: 'chauffeur', lib: 'Chauffeur hors de la zone (local chauffeurs)', ok: true },
    { id: 'niveleur', lib: 'Niveleur bien posé', ok: true },
    { id: 'plancher', lib: 'Plancher de la remorque en bon état et éclairé', ok: true },
    { id: 'epi', lib: '[[EPI]] portés', ok: true },
  ],
  signaler: { bouton: 'Signaler au chef de quai', reponse: 'Bien vu ! Je fais poser la cale. C’est bon, tu peux décharger.' },
  arret: 'Stop ! Le camion n’est pas calé : il peut bouger pendant que tu es dedans.',
  photo: './contenus/smoby/quai-exterieur.jpg',
  alt: 'Portes à quai d’un entrepôt vues de l’extérieur : sas, niveleurs, butoirs',
};

export const QUAI_ENT54 = {
  id: 'smoby-ent54',
  titre: 'Plateforme Smoby de Moirans-en-Montagne (39) — Quai 2, réception',
  destinataire: 'Smoby',
  avertissement: 'Réels : Smoby, l’usine d’Arinthod, la plateforme de Moirans-en-Montagne et les gammes de jouets. '
    + 'Le quai 2, l’horaire, le transporteur, Bruno, les références, quantités et défauts sont <b>construits pour l’exercice</b>.',
  froid: false,
  // Le BL signé, le camion est reparti : pas de « Recommencer la réception » (choix de Tristan, 07/10/2026). La note
  // est le premier bilan, refaire le quai ne doit pas le changer.
  recommencer: false,
  motifs: ['avarie', 'manquant'],
  lieu: { nom: 'Quai 2', temp: 15, refrigere: false },
  zone: { nom: 'Zone de réception' },
  dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yanis' },
  calcul: { forme: 'feuille', rappel: true },
  aides: { regleCouches: true, detailComptage: true, repere: true, chefDeQuai: true, consignes: true },
  // Photo intérieure prise porte ouverte (cariste de dos dans la remorque) : décor fixe, le chariot dessiné
  // sort de l'ouverture et pose les palettes sur la dalle dessinée sous la photo (1280 × 854).
  photos: {
    arrivee: './contenus/smoby/quai-remorques.jpg', altArrivee: 'Semi-remorques à quai devant la plateforme',
    quai: './contenus/smoby/quai-interieur.jpg', decor: 'fixe', largeur: 1280, hauteur: 854,
    porte: { x0: 365, x1: 935, y0: 220, y1: 820 }, cadre: [0, 240, 1280, 820],
    places: [[190, 990], [500, 1000], [800, 1000], [1100, 990]], horloge: [1150, 262],
  },
  securite: SECURITE,
  camions: [{
    transporteur: 'Transports Jurassiens (fictif)', fournisseur: 'Smoby, usine d’Arinthod', bl: 'ARI-26-1209', arrivee: '14:00',
    parole: 'Bonjour ! La navette d’Arinthod, 4 palettes. Voilà le bon de livraison. Je vous attends au local chauffeurs.',
    palettes: PALETTES_ENT54,
  }],
};

// ─────────────────────────────────────────────────────────────── le compte rendu à Bruno

const nb = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`;
// La ligne juste, calculée depuis les palettes : cartons écrasés (avaries) et manquants (BL − réel).
const P3 = pal('P3'), P4 = pal('P4');
export const LIGNE_RESERVES = `Réserves : ${nb(Object.keys(P3.avarie).length, 'carton écrasé', 'cartons écrasés')} sur l’établi `
  + `Black+Decker et ${nb(P4.bl - reel(P4), 'porteur manquant', 'porteurs manquants')}.`;

export const PHRASES = {
  id: 'compte-rendu-bruno',
  lignes: [
    { id: 'salutation', choix: ['Bonjour Bruno,', 'Salut !', 'Coucou Bruno'], juste: 0 },
    { id: 'recu', texte: `J’ai reçu les ${PALETTES_ENT54.length} palettes d’Arinthod.` },
    { id: 'reserves', choix: [LIGNE_RESERVES, 'Tout est conforme.', 'Réserves : 2 cartons écrasés.'], juste: 0 },
    { id: 'fin', choix: ['Bonne fin de journée, Yanis', 'Bisous', 'À plus'], juste: 0 },
  ],
  melanger: true,
};

// ─────────────────────────────────────────────────────────────── les messages

const etat = (db) => (db && db.quais && db.quais[QUAI_ENT54.id]) || null;
const signe = (db) => !!(etat(db) && etat(db).signe);

export const VOLET = {
  id: 'smoby-ent54',
  // « Corriger » ne rouvre que le compte rendu : à chaque renvoi, Bruno accuse réception, sans dire si c'est juste.
  corrections: {
    [PHRASES.id]: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 5000, from: BRUNO.nom, fromMail: BRUNO.mail, to: prenom,
      subject: 'Ton compte rendu corrigé', kind: 'text', text: `Bien reçu, merci ${prenom}.

Bruno`,
    }] }),
  },
  semer: () => ({
    mails: [{
      folder: 'in', ts: Date.now() - 60000, from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
      subject: 'Ton premier camion à 14 h 00', kind: 'text',
      text: 'Bonjour Yanis, bienvenue au quai !\n\nTon premier camion arrive à 14 h 00 au quai 2 : la navette de l’usine '
        + 'd’Arinthod, 4 palettes de jouets.\n\nAvant de décharger, on vérifie toujours la sécurité.\n\nBruno',
    }],
  }),
  declencheurs: [{
    // Le BL signé : Bruno demande le compte rendu, par phrases.
    id: 'compte-rendu',
    quand: signe,
    semer: () => ({ mails: [{
      folder: 'in', ts: Date.now() + 1000, from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
      subject: 'La navette d’Arinthod', kind: 'text',
      text: 'Le chauffeur est reparti. Fais-moi un compte rendu de ta réception : ce que tu as reçu et tes [[reserve|réserves]].\n\n'
        + 'Clique sur « Répondre » et choisis une phrase par ligne.\n\nBruno',
      phrases: PHRASES,
    }] }),
  }, {
    id: 'reponse',
    quand: apresMail({ a: BRUNO.mail }),
    semer: () => ({ mails: [{
      folder: 'in', ts: Date.now() + 2000, from: BRUNO.nom, fromMail: BRUNO.mail, to: 'Yanis',
      subject: 'RE : La navette d’Arinthod', kind: 'text',
      text: 'Merci Yanis. Maintenant, on range : la commande de Noël part demain.\n\nBruno',
    }] }),
  }],
};

export const LEXIQUE = Object.assign({}, LEXIQUE_SMOBY, {
  cale: 'Bloc posé contre une roue du camion (ou bloqueur fixé au quai) qui l’empêche de bouger pendant le déchargement.',
  niveleur: 'Plaque mobile du quai qui fait le pont entre le quai et le plancher de la remorque.',
  EPI: 'Équipements de protection individuelle : chaussures de sécurité, gilet haute visibilité, gants…',
  BL: 'Bon de livraison : la liste de ce que le camion apporte ; on compare ce qu’on reçoit à ce papier.',
  reserve: 'Remarque précise écrite sur le BL avant la signature du chauffeur, quand la livraison n’est pas conforme.',
  'chariot frontal': 'Chariot élévateur qui porte la charge à l’avant ; il faut le CACES 3 pour le conduire.',
});

// ─────────────────────────────────────────────────────────────── les jalons (16, barème sur 20)

// Lot 2 du brief SMOBY-notation-5.3-5.8, barème validé par Tristan le 07/10/2026 : une case = un jalon, chaque bloc a
// une part FIXE de la note sur 20.
//   Sécurité 4 (cale signalée avant de décharger 3, constat sans erreur 1 : gardé en UNE case, « tout OK » en
//   donnerait 5 sur 6 sans rien regarder) · Contrôle des palettes 8 (4 décisions avec motif à 1,25 ; 4 comptages
//   à 0,75 : recopier le BL donne P1, P2 et P3) · Réserves sur le BL 4 (P3 2, P4 2) · Compte rendu à Bruno 4
//   (réserves 3, salutation 0,5, fin 0,5). Total : 20.
// La signature du BL sort de la note (Q3) : juste dès qu'elle est obtenue, même avec un BL vide. Elle reste un
// jalon `compte: false` (sans poids ni ligne au bandeau).
// `groupe` = la ligne du bandeau de fin (10 lignes). Seul le compte rendu a un `ecran` : le BL signé ne se rouvre
// pas (Q2), la vue quai n'offre plus « Recommencer la réception » (`recommencer: false`).
export const BAREME = {
  'securite-signalee': 3, 'securite-constat': 1,
  decision: 1.25, comptage: 0.75,
  reserve: 2,
  'message-reserves': 3, 'message-salutation': 0.5, 'message-fin': 0.5,
};

// Les lignes de la vue quai, lues une fois par jalon. `essaye` : l'élève a déjà agi sur ce que juge le
// jalon (sinon l'étape reste « attente », convention du repérage « premier coup »).
const ligne = (db, id) => jalonsQuai(db, QUAI_ENT54).L.find((l) => l.id === id) || {};
const statut = (ok, essaye, detail) => (ok ? { status: 'ok' } : essaye ? { status: 'ko', detail } : { status: 'attente' });
const decidee = (db, p) => { const s = etat(db) && etat(db).palettes && etat(db).palettes[p.id]; return !!(s && s.decision); };

// Une palette = deux cases, une ligne au bandeau. Les deux sont jugées quand la palette est décidée.
const jalonsPalettes = PALETTES_ENT54.flatMap((p) => [{
  id: `${p.id}-decision`, titre: `${p.id} (${p.nom}) : décision et motif justes`,
  groupe: `Palette ${p.id}`, poids: BAREME.decision,
  verifier(db) { const d = ligne(db, `${p.id}-decision`); return statut(d.ok, decidee(db, p), `décision : ${d.fait}`); },
}, {
  id: `${p.id}-comptage`, titre: `${p.id} (${p.nom}) : comptage juste`,
  groupe: `Palette ${p.id}`, poids: BAREME.comptage,
  verifier(db) { const c = ligne(db, `${p.id}-comptage`); return statut(c.ok, decidee(db, p), `comptage : ${c.fait}`); },
}]);

const jalonsReserves = PALETTES_ENT54.filter((p) => p.attendu !== 'accepter').map((p) => ({
  id: `${p.id}-reserve`,
  titre: `Réserve précise pour ${p.id} (${MOTIFS[p.motifAttendu].toLowerCase()})`,
  groupe: `Réserve de la palette ${p.id}`, poids: BAREME.reserve,
  verifier(db) {
    const l = ligne(db, `${p.id}-reserve`);
    return statut(l.ok, !!(etat(db) && etat(db).ecrit), `écrit : ${l.fait} — attendu : ${l.attendu}`);
  },
}));

// Une ligne choisie du compte rendu = un jalon (la ligne « J'ai reçu les 4 palettes » est imposée : rien à juger).
const ECRAN_MESSAGE = `phrases:${PHRASES.id}`;
const jalonLigne = (lig, id, titre, groupe, detail) => ({
  id, titre, groupe, ecran: ECRAN_MESSAGE, poids: BAREME[id],
  verifier(db) {
    const r = phrasesJustes(db, PHRASES.id);
    if (!r.envoye) return { status: 'attente' };
    return r.justes.includes(lig) ? { status: 'ok' } : { status: 'ko', detail };
  },
});

export const ETAPES = [
  {
    id: 'securite-signalee',
    titre: 'La cale signalée avant de décharger',
    groupe: 'Sécurité : la cale signalée', poids: BAREME['securite-signalee'],
    verifier(db) {
      const l = ligne(db, 'securiteSignalee'), e = etat(db);
      return statut(l.ok, !!(e && e.securite && (e.securite.fait || e.securite.arrete || e.securite.signaux.length)), l.fait);
    },
  },
  {
    id: 'securite-constat',
    titre: 'Aucune erreur de constat',
    groupe: 'Sécurité : le constat', poids: BAREME['securite-constat'],
    verifier(db) {
      const l = ligne(db, 'securiteConstat'), e = etat(db);
      return statut(l.ok, !!(e && e.securite && e.securite.fait), l.fait);
    },
  },
  ...jalonsPalettes,
  ...jalonsReserves,
  {
    id: 'signature',
    titre: 'BL signé par le chauffeur',
    compte: false,
    verifier(db) { return signe(db) ? { status: 'ok' } : { status: 'attente' }; },
  },
  jalonLigne('reserves', 'message-reserves', 'Compte rendu à Bruno : les réserves sont justes', 'Compte rendu : les réserves',
    'La ligne des réserves doit dire ce que tu as écrit sur le BL.'),
  jalonLigne('salutation', 'message-salutation', 'Compte rendu à Bruno : la salutation', 'Compte rendu : le ton',
    'On écrit à son chef de quai.'),
  jalonLigne('fin', 'message-fin', 'Compte rendu à Bruno : la formule de fin', 'Compte rendu : le ton',
    'On écrit à son chef de quai.'),
];

// Ce que le bandeau de fin dit quand une case du quai est fausse (elle ne se rouvre pas). La suite (« Tu peux
// corriger… ») vient du moteur, seulement si le compte rendu a une case fausse.
export const FIN_FIGE = 'Le camion est reparti : le BL ne se corrige plus.';

// ─────────────────────────────────────────────────────────────── l'accueil

export const ACCUEIL = {
  titre: 'Premier déchargement',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Bruno', 'Menu Messagerie : le camion attendu à 14 h 00 au quai 2.'],
    ['Avant de décharger : la sécurité', 'Menu Quai de réception : regarde chaque point, signale ce qui ne va pas.'],
    ['Décharger, puis contrôler chaque palette', 'Tu sors les palettes au [[chariot frontal]], puis pour chacune : faire le tour, compter, lire l’étiquette, décider.'],
    ['Les papiers', 'Écrire des [[reserve|réserves]] précises sur le [[BL]], faire signer le chauffeur, rentrer les palettes.'],
    ['Rendre compte à Bruno', 'Quand le chauffeur est reparti : « Répondre » à Bruno, une phrase par ligne.'],
  ],
};
