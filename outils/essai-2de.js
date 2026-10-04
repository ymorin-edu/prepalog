// Univers d'ESSAI des briques de la 2de (brief `docs/briefs/MOTEUR-2de-S1.md`) — 04/10/2026.
//
// La page `outils/essai-2de.html` et le bloc de tests `outils/test/smoby.mjs` montent le vrai moteur
// d'entreprise sur ce petit univers. Lot 2 : la réponse à Sophie par phrases à choisir (texte du brief
// ENT-5.1), la réponse de Sophie qui arrive après l'envoi (juste ou faux), et un jalon qui lit les
// choix (`phrasesJustes`). Lot 3 : les mots cliquables du mail de Sophie (lexique d'ENT-5.1 ; « fiche
// de poste » est marqué mais absent du lexique : il doit s'afficher en texte normal).
//
// Documents joints (brief `MOTEUR-documents-formulaire.md`, lot 1) : le mail « Recrutement du cariste de
// Noël » porte la fiche de poste et les cinq CV de la maquette validée (`outils/essai-2de-documents.js`).
// Fiche à remplir (lot 2) : la fiche de sélection de la maquette (tableau de tri, candidat, contrat), que
// le même mail ouvre ; Sophie répond quand la fiche est envoyée (`apresFiche`, juste ou faux).
//
// Les personnes (Sophie Martin, les candidats) sont CONSTRUITES, comme dans le brief de la séance.
//
// Lots 4 et 5 : `univers({ quai: { securite, evaluation } })` ajoute un quai sans froid, déchargé par un
// cariste au chariot, précédé (ou non) de l'étape « Avant de décharger », et ses jalons aux étapes.

import { catalogueSimple } from '../contenus/entreprise-commun.js';
import { apresMail, apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { DOCUMENTS, STYLE_DOCUMENTS } from './essai-2de-documents.js';
import { etapesQuai } from '../core/types/quai.js';

export const MENTION = 'Page d’essai des briques de la 2de. <b>Construit</b> : Sophie Martin, les candidats et '
  + 'leurs situations (personnes fictives, comme dans le brief ENT-5.1).';

// Définitions en une phrase (brief ENT-5.1 : CACES mot pour mot, CDD / CDI d'après l'encadré).
export const LEXIQUE = {
  CACES: 'Certificat qui prouve qu’on sait conduire un type d’engin ; une catégorie par sorte de chariot ; valable 5 ans.',
  CDD: 'Contrat de travail avec une date de fin, pour un besoin limité dans le temps.',
  CDI: 'Contrat de travail sans date de fin.',
  saisonnier: 'Se dit d’un travail qui revient chaque année à la même période (Noël, les vendanges…).',
  cariste: 'Personne qui conduit un chariot élévateur pour déplacer et ranger les palettes.',
};

export const SOPHIE ='sophie.martin@smoby-essai.example';
export const CANDIDATS = ['Yanis Morel', 'Léa Garnier', 'Hugo Petit', 'Inès Benali', 'Tom Leroy'];

// La réponse à Sophie (brief ENT-5.1, étape 6). `juste` = rang dans l'ordre déclaré ci-dessous.
export const PHRASES_SOPHIE = {
  id: 'reponse-sophie',
  lignes: [
    { id: 'salut', choix: ['Bonjour Sophie,', 'Salut !', 'Coucou Sophie'], juste: 0 },
    // Calculée (essai d'une valeur tirée de la base) : le candidat retenu est le premier de la liste.
    { id: 'choix', choix: () => CANDIDATS.map((c) => `Je retiens la candidature de ${c}`), juste: () => 0 },
    { id: 'raison', choix: [
      'car il a le CACES 3 valide, il est disponible le 9 décembre et il accepte un CDD.',
      'car il habite le plus près.',
      'car il a le CACES.'], juste: 0 },
    { id: 'contrat', choix: ['Je propose un CDD saisonnier.', 'Je propose un CDI.'], juste: 0 },
    { id: 'fin', choix: ['Pouvez-vous valider ? Cordialement,', 'Merci de valider vite', 'Bisous'], juste: 0 },
  ],
  melanger: true,
};

function voletEssai() {
  return {
    id: 'essai-2de',
    semer: (prenom) => ({
      mails: [{
        folder: 'in', ts: Date.now() - 60000, from: 'Sophie Martin', fromMail: SOPHIE, to: prenom,
        subject: 'Recrutement du cariste de Noël', kind: 'text',
        text: `Bonjour ${prenom}, bienvenue au service RH !

Pour le pic de Noël, nous recrutons un [[cariste]] en CDD saisonnier. Tu trouveras ci-dessous la fiche de poste et les cinq CV reçus.

Sophie`,
        pieces: ['poste', 'yanis', 'laura', 'mehdi', 'thomas', 'sabrina'],
        ouvreFiche: 'selection',
      }, {
        folder: 'in', ts: Date.now(), from: 'Sophie Martin', fromMail: SOPHIE, to: prenom,
        subject: 'Le cariste pour le pic de Noël', kind: 'text',
        text: `Bonjour ${prenom},\n\nTu as trié les candidatures pour le poste de [[cariste]] (voir la [[fiche de poste]]). Il faut le [[CACES]] 3.\nRéponds-moi : qui retiens-tu, pourquoi, et quel contrat ([[CDD]] [[saisonnier]] ou [[cdi|CDI]]) ?\n\nSophie`,
        phrases: PHRASES_SOPHIE,
      }],
    }),
    declencheurs: [{
      id: 'fiche-recue',
      quand: apresFiche('selection'),
      semer: (prenom) => ({
        mails: [{
          folder: 'in', ts: Date.now() + 1000, from: 'Sophie Martin', fromMail: SOPHIE, to: prenom,
          subject: 'Fiche de sélection reçue', kind: 'text',
          text: 'Merci, j’ai bien reçu ta fiche. Je la relis avec la direction.',
        }],
      }),
    }, {
      id: 'reponse',
      quand: apresMail({ a: SOPHIE }),
      semer: (prenom) => ({
        mails: [{
          folder: 'in', ts: Date.now() + 1000, from: 'Sophie Martin', fromMail: SOPHIE, to: prenom,
          subject: 'RE : Le cariste pour le pic de Noël', kind: 'text',
          text: 'Merci ! La direction valide. Il arrive le mercredi 9 décembre : on prépare son arrivée la prochaine fois.',
        }],
      }),
    }],
  };
}

// La fiche de sélection de la maquette validée. Les candidats sont ceux des CV (construits).
export const CANDIDATS_FICHE = [
  { id: 'yanis', lib: 'Yanis Morel' }, { id: 'laura', lib: 'Laura Petit' }, { id: 'mehdi', lib: 'Mehdi Benali' },
  { id: 'thomas', lib: 'Thomas Girod' }, { id: 'sabrina', lib: 'Sabrina Lopez' },
];
export const FICHE = {
  id: 'selection', libelle: 'Fiche de sélection', titre: 'Fiche de sélection',
  sousTitre: 'Poste : cariste en CDD saisonnier, prise de poste le mercredi 9 décembre 2026.',
  documents: ['poste', 'yanis', 'laura', 'mehdi', 'thomas', 'sabrina'],
  blocs: [
    { type: 'ouinon', id: 'tri', titre: '1. Tableau de tri', entete: 'Candidat', lignes: CANDIDATS_FICHE,
      colonnes: [{ id: 'caces', lib: 'CACES 3 valide le 9/12' }, { id: 'dispo', lib: 'Disponible le 9/12' }, { id: 'cdd', lib: 'Accepte un CDD' }] },
    { type: 'liste', id: 'candidat', titre: '2. Mon choix', lib: 'Je retiens', vide: 'Choisir un candidat…', manque: 'le candidat',
      choix: CANDIDATS_FICHE.map((c) => ({ v: c.id, lib: c.lib })) },
    { type: 'choix', id: 'contrat', lib: 'Contrat proposé', manque: 'le contrat', choix: ['CDD', 'CDI'] },
    { type: 'encadre', titre: 'CDD ou CDI ?', texte: 'CDI : contrat sans date de fin. CDD : contrat avec une date de fin, pour un besoin limité dans le temps (un pic d’activité, un remplacement). Le CDD saisonnier sert aux activités qui reviennent chaque année à la même période.' },
  ],
  envoi: { bouton: 'Envoyer la fiche à Sophie', a: 'Sophie', suite: 'Réponds-lui maintenant dans la Messagerie.' },
};

export const ETAPES = [{
  id: 'message',
  titre: 'Message à Sophie juste',
  verifier(db) {
    const r = phrasesJustes(db, PHRASES_SOPHIE.id);
    if (!r.envoye) return { status: 'attente' };
    return r.faux.length ? { status: 'ko', detail: `Lignes fausses : ${r.faux.join(', ')}.` } : { status: 'ok' };
  },
}];


// Lots 4 et 5 : un quai SANS FROID, déchargé par un cariste au chariot, précédé de l'étape « Avant de
// décharger ». Palettes, BL, fournisseur, transporteur, scène et points de sécurité : CONSTRUITS pour
// l'essai (la séance ENT-5.4 apportera les siens, et ses propres photos). Les photos du quai sont
// celles de Picard (les seules calibrées aujourd'hui : porte, places au sol).
export const PALETTES_QUAI = [
  { id: 'P1', ref: 'JEU-101', nom: 'Jouets d’essai A', bl: 24,
    etiq: { ref: 'JEU-101', nom: 'JOUETS D’ESSAI A', poids: '1 jouet par carton', lot: 'L26-4401', ddm: '—' },
    W: 3, D: 2, L: 4, manque: [], avarie: {}, temp: 18, attendu: 'accepter', motifAttendu: 'aucun' },
  { id: 'P2', ref: 'JEU-102', nom: 'Jouets d’essai B', bl: 24,
    etiq: { ref: 'JEU-102', nom: 'JOUETS D’ESSAI B', poids: '1 jouet par carton', lot: 'L26-4402', ddm: '—' },
    W: 3, D: 2, L: 4, manque: [], avarie: {}, temp: 18, attendu: 'accepter', motifAttendu: 'aucun' },
  { id: 'P3', ref: 'JEU-103', nom: 'Jouets d’essai C', bl: 20,
    etiq: { ref: 'JEU-103', nom: 'JOUETS D’ESSAI C', poids: '1 jouet par carton', lot: 'L26-4403', ddm: '—' },
    W: 2, D: 2, L: 5, manque: [], avarie: { '1,0,3': [0, -1] }, temp: 18, attendu: 'reserves', motifAttendu: 'avarie' },
  { id: 'P4', ref: 'JEU-104', nom: 'Jouets d’essai D', bl: 24,
    etiq: { ref: 'JEU-104', nom: 'JOUETS D’ESSAI D', poids: '2 jouets par carton', lot: 'L26-4404', ddm: '—' },
    W: 3, D: 2, L: 4, manque: ['0,0,3', '2,1,3'], avarie: {}, temp: 18, attendu: 'reserves', motifAttendu: 'manquant' },
];

export const SECURITE_QUAI = {
  scene: 'Le semi est à quai, quai 2, 07:10. Le chauffeur a coupé le moteur et te tend ses clés. '
    + 'Le niveleur est en place. Avant d’entrer dans la remorque, regarde si tout est en sécurité.',
  points: [
    { id: 'moteur', lib: 'Moteur coupé, clés remises', ok: true },
    { id: 'cale', lib: 'Camion calé (cale sous la roue)', ok: false },
    { id: 'niveleur', lib: 'Niveleur en place', ok: true },
    { id: 'epi', lib: 'Chaussures de sécurité et gilet', ok: true },
  ],
  signaler: { bouton: 'Signaler au chef de quai', reponse: 'Bien vu, je fais poser la cale. Tu peux décharger.' },
};

export function quaiSansFroid({ securite = true, evaluation = false } = {}) {
  return {
    id: `essai-2de-quai${evaluation ? '-eval' : ''}`,
    titre: 'Essai — quai de réception sans froid',
    destinataire: 'Smoby (essai)',
    avertissement: 'Page d’essai : palettes, fournisseur, transporteur, scène de sécurité <b>construits</b> ; photos du quai reprises de Picard.',
    froid: false,
    motifs: ['avarie', 'manquant'],
    lieu: { nom: 'Quai 2', temp: 15, refrigere: false },
    zone: { nom: 'Zone de réception' },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste', nom: 'Yanis' },
    aides: evaluation ? {} : { regleCouches: true, detailComptage: false, repere: true, chefDeQuai: true, consignes: true },
    photos: { arrivee: './contenus/picard/quai-remorques.jpg', quai: './contenus/picard/quai-interieur.jpg',
      porte: { x0: 455, x1: 786, y0: 352, y1: 585 }, altArrivee: 'Camions à quai devant un entrepôt' },
    securite: securite ? SECURITE_QUAI : undefined,
    camions: [{ transporteur: 'Transports d’essai', fournisseur: 'Usine d’essai', fictif: true, bl: 'ESS-26-0001', arrivee: '07:10',
      palettes: PALETTES_QUAI }],
  };
}

export function univers({ temps = 'guidage', quai = null } = {}) {
  const Q = quai ? quaiSansFroid(quai) : null;
  return {
    ENTREPRISE: { id: 'essai-2de', nom: 'Smoby — essai 2de', sousTitre: 'Plateforme de Moirans-en-Montagne (39)', exercice: 'Essai des briques de la 2de' },
    VOCAB: { unit: 'unité', unitPl: 'unités', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'smoby-essai.example' },
    CATALOGUE: catalogueSimple([{ ref: 'ESSAI', designation: 'Article d’essai' }]),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
      customers: [], suppliers: [], seq: 1, _depart: [] }),
    etapes: Q ? ETAPES.concat(etapesQuai(Q)) : ETAPES, exercice: 'Essai des briques de la 2de',
    volet: voletEssai(),
    lexique: LEXIQUE,
    documents: DOCUMENTS, documentsStyle: STYLE_DOCUMENTS,
    fiche: FICHE,
    ...(Q ? { quai: Q } : {}),
    copie: temps === 'evaluation' || !!(quai && quai.evaluation), sansTrame: "Tout à l'écran",
  };
}
