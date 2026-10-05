// ENT-5.2 — Smoby, « l'arrivée de Yanis » : les données de la séance (brief
// `docs/briefs/ENT-5.2-smoby-arrivee.md`). Univers commun : `contenus/smoby.js`.
//
// L'élève, assistant RH, prépare l'arrivée du cariste recruté en ENT-5.1 dans une fiche (les pièces à
// lui demander, son premier jour dans l'ordre), puis planifie les présences de l'équipe pour les deux
// semaines du pic (vue Planning, cas « personnel » de la maquette v8), reprend le planning après un
// imprévu et fait le point avec Sophie par phrases à choisir.
//
// Vérifié (brief §2) : ce que l'employeur peut demander à l'embauche (lien direct et nécessaire avec le
// poste, Code du travail art. L1221-6) ; l'autorisation de conduite, délivrée par l'employeur après le
// CACES, l'avis du médecin du travail et la connaissance des lieux (art. R4323-56).
// Construit : l'équipe (prénoms fictifs), les besoins par jour, les absences, l'imprévu, les textes.
//
// Le planning reprend TELLES QUELLES les données du cas « personnel » de la maquette v8 (validée par
// Tristan), un seul changement : Yanis n'est plus intérimaire, c'est le cariste en CDD saisonnier
// recruté en ENT-5.1. Les attendus de la fiche sont calculés depuis `PIECES` et `PREMIER_JOUR`.

import { apresFiche, apresPlanning } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { etapesPlanning } from '../core/types/planning.js';
import { SOPHIE, LEXIQUE as LEXIQUE_SMOBY } from './smoby.js';

// La fiche envoyée, lue dans la base comme `ficheEnvoyee` (core/types/fiche.js), sans importer ce module :
// il tire `core/ui.js`, qui suppose un navigateur (le corrigé lit ce fichier hors navigateur).
function ficheEnvoyee(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}

// ─────────────────────────────────────────────────────────────── les mots cliquables

export const LEXIQUE = Object.assign({}, LEXIQUE_SMOBY, {
  EPI: 'Équipements de protection individuelle : ce que le salarié porte pour se protéger (chaussures de sécurité, gilet, gants…).',
  'autorisation de conduite': 'Document signé par l’employeur qui permet à un salarié de conduire un chariot dans l’entreprise. '
    + 'Il se donne après le CACES, l’avis du médecin du travail et la visite des lieux.',
  RIB: 'Relevé d’identité bancaire : les coordonnées du compte sur lequel l’employeur verse le salaire.',
  'carte Vitale': 'Carte de l’Assurance maladie ; elle porte le numéro de sécurité sociale.',
  'intérimaire': 'Salarié d’une agence d’intérim, envoyé dans une entreprise pour une mission courte.',
  'CDD saisonnier': 'Contrat avec une date de fin, pour un travail qui revient chaque année à la même période (ici, le pic de Noël).',
  'congé': 'Jours où le salarié ne travaille pas. Il les demande ; l’employeur les accorde, sauf si l’équipe est alors en difficulté.',
  effectif: 'Nombre de personnes présentes au travail (ici, chaque jour).',
});

// ─────────────────────────────────────────────────────────────── 1. les pièces à demander

// Brief §4, étape 1. `demander` : ce que l'employeur a le droit (et besoin) de demander pour CE poste.
// `pourquoi` : la phrase d'explication, dite au bilan (et au corrigé).
export const PIECES = [
  { v: 'identite', lib: 'Pièce d’identité', demander: true, pourquoi: 'Pour vérifier qui il est et établir le contrat.' },
  { v: 'vitale', lib: 'Numéro de sécurité sociale (carte Vitale)', demander: true, pourquoi: 'Obligatoire pour déclarer l’embauche.' },
  { v: 'notes', lib: 'Relevé de notes du collège', demander: false, pourquoi: 'Aucun lien avec le poste.' },
  { v: 'rib', lib: 'RIB', demander: true, pourquoi: 'Pour verser son salaire.' },
  { v: 'sang', lib: 'Groupe sanguin', demander: false, pourquoi: 'Donnée de santé : l’employeur n’a pas à la demander.' },
  { v: 'caces', lib: 'Copie des CACES 3 et 5', demander: true, pourquoi: 'Le poste demande de conduire des chariots.' },
  { v: 'casier', lib: 'Extrait de casier judiciaire', demander: false, pourquoi: 'Réservé à certains métiers (sécurité, petite enfance).' },
  { v: 'parents', lib: 'Autorisation parentale', demander: false, pourquoi: 'Yanis est majeur.' },
];
export const PIECES_ATTENDUES = PIECES.filter((p) => p.demander).map((p) => p.v);

// ─────────────────────────────────────────────────────────────── 2. le premier jour

// Dans l'ORDRE JUSTE (brief §4, étape 2). L'ordre de départ, à l'écran, est `DEPART` (aucune étape à sa place).
export const PREMIER_JOUR = [
  { v: 'accueil', lib: 'Accueil par Sophie et signature du contrat' },
  { v: 'epi', lib: 'Remise des EPI (chaussures de sécurité, gilet haute visibilité, gants)' },
  { v: 'visite', lib: 'Visite de sécurité de la plateforme avec le chef de quai' },
  { v: 'autorisation', lib: 'Remise de l’autorisation de conduite signée par Smoby' },
  { v: 'dechargement', lib: 'Premier déchargement au quai' },
];
export const ORDRE_ATTENDU = PREMIER_JOUR.map((e) => e.v);
const DEPART = ['autorisation', 'dechargement', 'epi', 'accueil', 'visite'];

// ─────────────────────────────────────────────────────────────── la fiche d'arrivée

export const FICHE = {
  id: 'arrivee', libelle: 'Fiche d’arrivée', titre: 'Préparer l’arrivée de Yanis',
  sousTitre: 'Yanis Morel, cariste en CDD saisonnier, arrive le mercredi 9 décembre 2026.',
  bouton: 'Ouvrir la fiche d’arrivée',
  blocs: [
    { type: 'cases', id: 'pieces', titre: '1. Les pièces à demander à Yanis',
      consigne: 'Coche les pièces que Smoby doit demander à Yanis. L’employeur ne demande que ce qui a un lien direct avec le poste. '
        + 'Mots utiles : [[RIB]], [[carte Vitale]].',
      choix: PIECES.map((p) => ({ v: p.v, lib: p.lib })) },
    { type: 'ordre', id: 'jour', titre: '2. Le premier jour de Yanis',
      consigne: 'Remets les étapes dans l’ordre, de la première à la dernière, avec les flèches ↑ ↓. Mots utiles : [[EPI]], [[autorisation de conduite]].',
      choix: DEPART.map((v) => PREMIER_JOUR.find((e) => e.v === v)) },
    { type: 'encadre', titre: 'Le CACES ne suffit pas',
      texte: 'Pour conduire un chariot chez Smoby, Yanis a besoin d’une [[autorisation de conduite]], signée par l’employeur. '
        + 'Elle se donne après le CACES, l’avis du médecin du travail et la visite des lieux.' },
  ],
  envoi: { bouton: 'Envoyer la fiche à Sophie', a: 'Sophie', suite: 'Sophie va te répondre dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── 3. le planning des présences

// Cas « personnel » de la maquette v8 (`contenus/planning-essai.js`, `PERSO`) : mêmes données, mêmes règles.
const SALARIES = [
  { id: 'karim', nom: 'Karim', caces: true, note: 'CACES' },
  { id: 'lea', nom: 'Léa', caces: true, note: 'CACES' },
  { id: 'mathis', nom: 'Mathis' },
  { id: 'ines', nom: 'Inès' },
  { id: 'chloe', nom: 'Chloé' },
  // Le seul changement : Yanis est le cariste en CDD saisonnier recruté en ENT-5.1, plus un intérimaire.
  { id: 'yanis', nom: 'Yanis', caces: true, cdd: true, arrivee: 'mer 9', note: 'CACES · CDD' },
];
const NOA = { id: 'noa', nom: 'Noa', interim: true, arrivee: 'mar 15', note: 'intérim' };
const nomDe = (id) => (SALARIES.concat(NOA).find((s) => s.id === id) || {}).nom || id;
const de = (id) => (/^[AEIOUYÉÈÎ]/.test(nomDe(id)) ? "d'" : 'de ') + nomDe(id);
const absence = (id, qui, lib, jours, date, impose, motif) => ({
  id, qui, lib, court: lib, jours, date, impose, motif, famille: impose ? 'impose' : 'conge', titre: `${nomDe(qui)} — ${lib}` });
const SANS_CHEVAUCHER = ['chevauche', 'arrivee'];
const sansBalises = (t) => String(t).replace(/<[^>]+>/g, '');

export const PLANNING = {
  id: 'smoby-presences',
  libelle: 'Planning des présences',
  titre: 'Équipe de préparation — plateforme Smoby, Moirans-en-Montagne',
  date: 'Semaines du 7 et du 14 décembre',
  infos: (o) => [
    'Besoin du jour (l’[[effectif]] nécessaire) : ligne « Besoin »',
    'Au moins un cariste CACES présent par jour',
    ...o.lignes.map((s) => `<b>${s.nom}</b>${s.caces ? ' · CACES' : ''}${s.cdd ? ' · [[CDD saisonnier]]' : ''}${
      s.interim ? ' · [[intérimaire]]' : ''}${s.arrivee ? ` · arrive le ${s.arrivee}` : ''}`),
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
  // Pas de `note` : en guidage, la note de la séance est celle de ses 14 étapes (avec `note`, celle du
  // planning seul la remplacerait).
};

// Une solution juste, avant et après l'imprévu (jour = rang dans `echelle.jours`, lun 7 = 0). Elle n'est
// pas recopiée d'ailleurs : la suite de tests la fait juger par le moteur (10 / 10), le corrigé l'affiche.
export const SOLUTION = {
  v1: { 'form-mathis': 1, 'visite-ines': 3, 'cp-chloe': 5, 'cp-karim': 0, 'cp-lea': 7 },
  v2: { 'form-mathis': 1, 'visite-ines': 3, 'cp-chloe': 8, 'cp-karim': 0, 'cp-lea': 7, 'am-ines': 5 },
};

// ─────────────────────────────────────────────────────────────── 4. le point avec Sophie

// Brief §4, étape 5. `juste` = rang dans l'ordre déclaré ; l'ordre affiché est tiré par élève.
export const PHRASES = {
  id: 'point-sophie',
  lignes: [
    { id: 'salut', choix: ['Bonjour Sophie,', 'Salut !', 'Coucou Sophie'], juste: 0 },
    { id: 'reprise', texte: 'J’ai repris le planning après l’arrêt d’Inès.' },
    { id: 'constat', choix: [
      'Chaque jour a assez de monde et au moins un cariste CACES.',
      'Il manque du monde mardi 15.',
      'J’ai annulé tous les congés.'], juste: 0 },
    { id: 'fin', choix: ['Pouvez-vous valider ? Cordialement,', 'Tu valides vite stp', 'Bisous'], juste: 0 },
  ],
  melanger: true,
};

// ─────────────────────────────────────────────────────────────── les messages

const RESPONSABLE = { nom: PLANNING.alea.de, mail: 'responsable.plateforme@smoby-moirans.example' };
export const SUJET_POINT = 'Le point sur le planning';

export const VOLET = {
  id: 'smoby-ent52',
  semer: (prenom) => ({
    mails: [{
      folder: 'in', ts: Date.now() - 60000, from: SOPHIE.nom, fromMail: SOPHIE.mail, to: prenom,
      subject: 'L’arrivée de Yanis', kind: 'text',
      text: `Bonjour ${prenom} !\n\n`
        + 'La direction a validé Yanis Morel : il arrive le mercredi 9 décembre, en [[CDD saisonnier]].\n\n'
        + 'Aujourd’hui : préparer son arrivée, puis le planning de l’équipe pour les deux semaines du pic.\n'
        + 'Commence par la fiche d’arrivée : les pièces à lui demander et son premier jour dans l’ordre.\n\nSophie',
      ouvreFiche: FICHE.id,
    }],
  }),
  declencheurs: [{
    // La fiche envoyée (juste ou fausse) : Sophie passe au planning, sans dire si la fiche était juste.
    id: 'fiche-recue',
    quand: apresFiche(FICHE.id),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 1000, from: SOPHIE.nom, fromMail: SOPHIE.mail, to: prenom,
      subject: 'Le planning des présences', kind: 'text',
      text: `Merci ${prenom}, j’ai bien reçu ta fiche.\n\n`
        + 'Maintenant, le planning des présences de l’équipe pour les semaines du 7 et du 14 décembre (menu « Planning des présences »). '
        + 'Pose chaque demande d’absence et de [[congé]] : chaque jour, il faut assez de monde (l’[[effectif]] du jour) et au moins un cariste CACES. '
        + 'Yanis arrive le mercredi 9.\n\n'
        + 'Quand il est prêt, envoie-le : c’est le responsable de la plateforme qui le valide.\n\nSophie',
    }] }),
  }, {
    // Le 1er planning envoyé (juste ou faux) : l'imprévu, et la vue passe à la reprise.
    id: 'alea',
    quand: apresPlanning(PLANNING.id),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 2000, from: RESPONSABLE.nom, fromMail: RESPONSABLE.mail, to: prenom,
      subject: 'Changement : planning à reprendre', kind: 'text', text: sansBalises(PLANNING.alea.texte),
    }] }),
    phasePlanning: 2,
  }, {
    // Le planning repris et renvoyé (juste ou faux) : Sophie demande le point, par phrases.
    id: 'point',
    quand: apresPlanning(PLANNING.id, 2),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 3000, from: SOPHIE.nom, fromMail: SOPHIE.mail, to: prenom,
      subject: SUJET_POINT, kind: 'text',
      text: `${prenom}, le responsable m’a dit qu’Inès est en arrêt et que tu as repris le planning.\n\n`
        + 'Fais-moi le point en quelques lignes : clique sur « Répondre » et choisis une phrase par ligne.\n\nSophie',
      phrases: PHRASES,
    }] }),
  }, {
    // Le point envoyé (juste ou faux) : la suite de l'histoire, sans dire si c'était juste.
    id: 'fin',
    quand: (db) => phrasesJustes(db, PHRASES.id).envoye,
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 4000, from: SOPHIE.nom, fromMail: SOPHIE.mail, to: prenom,
      subject: `RE : ${SUJET_POINT}`, kind: 'text',
      text: 'Merci ! Je transmets à la direction. Mercredi matin, j’accueille Yanis, puis Bruno lui fait visiter la plateforme.\n\nSophie',
    }] }),
  }],
};

// ─────────────────────────────────────────────────────────────── les jalons (14, brief §5)

const libDe = (v) => (PIECES.find((p) => p.v === v) || {}).lib || v;
const coches = (f) => (Array.isArray(f.valeurs.pieces) ? f.valeurs.pieces : []);

export const ETAPES = [
  {
    id: 'pieces',
    titre: 'Les 4 pièces à demander sont cochées',
    verifier(db) {
      const f = ficheEnvoyee(db, FICHE.id);
      if (!f.envoye) return { status: 'attente' };
      const manquent = PIECES.filter((p) => p.demander && !coches(f).includes(p.v));
      if (!manquent.length) return { status: 'ok' };
      return { status: 'ko', detail: `À demander aussi : ${manquent.map((p) => `${p.lib} (${p.pourquoi.charAt(0).toLowerCase()}${p.pourquoi.slice(1, -1)})`).join(' ; ')}.` };
    },
  },
  {
    // Vrai seulement si au moins une pièce est cochée : sinon « rien de trop » serait vrai par inaction.
    id: 'pas-de-trop',
    titre: 'Aucune pièce de trop',
    verifier(db) {
      const f = ficheEnvoyee(db, FICHE.id);
      if (!f.envoye) return { status: 'attente' };
      if (!coches(f).length) return { status: 'ko', detail: 'Aucune pièce cochée.' };
      const trop = PIECES.filter((p) => !p.demander && coches(f).includes(p.v));
      if (!trop.length) return { status: 'ok' };
      return { status: 'ko', detail: `À ne pas demander : ${trop.map((p) => `${p.lib} (${p.pourquoi.charAt(0).toLowerCase()}${p.pourquoi.slice(1, -1)})`).join(' ; ')}.` };
    },
  },
  {
    id: 'premier-jour',
    titre: 'Le premier jour de Yanis est dans l’ordre',
    verifier(db) {
      const f = ficheEnvoyee(db, FICHE.id);
      if (!f.envoye) return { status: 'attente' };
      const o = f.valeurs.jour || [];
      if (o.join('|') === ORDRE_ATTENDU.join('|')) return { status: 'ok' };
      const ia = o.indexOf('autorisation'), iv = o.indexOf('visite');
      return { status: 'ko', detail: ia >= 0 && iv >= 0 && ia < iv
        ? 'L’autorisation de conduite se donne après la visite des lieux.'
        : 'D’abord on accueille et on signe le contrat, puis on équipe, on fait visiter, on autorise à conduire, et seulement ensuite on travaille.' };
    },
  },
  ...etapesPlanning(PLANNING),
  {
    id: 'message',
    titre: 'Le point à Sophie est juste (constat et ton)',
    verifier(db) {
      const r = phrasesJustes(db, PHRASES.id);
      if (!r.envoye) return { status: 'attente' };
      if (['salut', 'constat', 'fin'].every((l) => r.justes.includes(l))) return { status: 'ok' };
      return { status: 'ko', detail: !r.justes.includes('constat')
        ? 'Le constat doit dire ce que ton planning respecte : assez de monde et un cariste CACES chaque jour.'
        : 'Salutation et formule de fin : on écrit à une collègue, au travail.' };
    },
  },
];

// ─────────────────────────────────────────────────────────────── l'accueil

export const ACCUEIL = {
  titre: 'L’arrivée de Yanis',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Sophie', 'Menu Messagerie : Yanis arrive le mercredi 9 décembre.'],
    ['Remplir la fiche d’arrivée', 'Les pièces à demander à Yanis, puis son premier jour dans l’ordre. Envoie-la à Sophie.'],
    ['Planifier les présences', 'Menu Planning des présences : pose les absences et les congés des deux semaines, puis envoie le planning.'],
    ['Reprendre après un imprévu', 'Un message t’annonce un changement : reprends le planning et renvoie-le.'],
    ['Faire le point avec Sophie', '« Répondre » à son message, puis une phrase par ligne.'],
    ['Bon à savoir', 'Smoby et sa plateforme de Moirans-en-Montagne sont réels. Sophie, Yanis, l’équipe et le planning sont inventés pour l’exercice.'],
  ],
};
