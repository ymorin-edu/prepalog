// Smoby (Moirans-en-Montagne) — l'univers commun des séances ENT-5.x (scénario S1 de la 2de GATL,
// « La commande de Noël » : Smoby puis Kuehne+Nagel). Coordination : `docs/briefs/COORDINATION-smoby.md`.
//
// Ce fichier porte ce qui est COMMUN aux séances : identité, charte, personnages, base de départ.
// Chaque séance apporte ses documents, ses messages et ses jalons : voir `contenus/smoby-ent51.js`.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (brief `docs/briefs/ENT-5.1-smoby-recrutement.md` §2)
//
// Vérifié (Cowork, recherche web des 03-04/10/2026) : Smoby Toys (groupe Simba Dickie), ses
// implantations du Jura ; à Moirans-en-Montagne, montage et stockage logistique, la logistique y
// emploie 25 à 60 personnes selon la saison ; le CACES R489 (cat. 3 chariot frontal, cat. 5 chariot
// à mât rétractable, valable 5 ans) ; le CDD saisonnier possible pour le pic de Noël.
//
// Construit, et annoncé comme tel à l'écran : tous les personnages (Sophie Martin, Yanis et les
// autres candidats, Bruno…), le besoin de recrutement, la fiche de poste, les CV, les dates, les
// adresses de messagerie. Aucun visage, aucune parole prêtée à un salarié réel.
//
// Logo : `smoby_logo.svg` de smoby.com, récupéré avec l'accord de Tristan le 04/10/2026
// (`docs/briefs/smoby/LISEZMOI.md`, empreinte c93a59bf…3b25 vérifiée à la copie).
// Charte (décision de Tristan, 04/10/2026, d'après smoby.com relevé le jour même : barre de menu,
// onglets, titres et boutons en rouge, texte blanc sur les boutons, police Quicksand) : accent ROUGE
// SMOBY `#E40613` (contraste 4,7 sur le papier, 4,8 en texte blanc sur l'aplat). Exception voulue à
// « rouge = faux » : le « faux » de Prepalog reste le rouge sombre `--rouge`, en texte seul, et rien
// n'est jugé à l'écran avant le bilan dans ces séances. Fond : le papier de Prepalog (pas le blanc
// du site), comme Picard. Le vert « juste » reste celui de Prepalog.

import { catalogueSimple } from './entreprise-commun.js';

export const ENTREPRISE = {
  id: 'smoby',
  nom: 'Smoby',
  sousTitre: 'Plateforme logistique de Moirans-en-Montagne (39)',
  exercice: 'Le renfort du pic de Noël',
  logo: './contenus/trames/logos/smoby.svg',
};

export const VOCAB = {
  unit: 'unité', unitPl: 'unités',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'smoby-moirans.example',
};

export const THEME = { accent: '#e40613', papier: true };

// Les personnages communs (tous fictifs).
export const SOPHIE = { nom: 'Sophie Martin', mail: 'sophie.martin@smoby-moirans.example', role: 'assistante RH' };

export const AVERTISSEMENT = 'Réels : Smoby, son logo et sa plateforme logistique de Moirans-en-Montagne (Jura). '
  + 'Le recrutement, Sophie, la fiche de poste, les candidats et leurs CV sont <b>construits pour l’exercice</b>.';

// Le lexique commun (mots cliquables, une phrase chacun). Une séance peut l'étendre.
export const LEXIQUE = {
  CACES: 'Certificat qui prouve qu’on sait conduire un type d’engin ; une catégorie par sorte de chariot ; valable 5 ans.',
  CDD: 'Contrat de travail avec une date de fin, pour un besoin limité dans le temps.',
  CDI: 'Contrat de travail sans date de fin.',
  saisonnier: 'Se dit d’un travail qui revient chaque année à la même période (Noël, les vendanges…).',
  cariste: 'Personne qui conduit un chariot élévateur pour déplacer et ranger les palettes.',
  'fiche de poste': 'Document qui décrit un poste : les missions, le lieu, les horaires, le contrat et le profil recherché.',
};

// Pas d'article en jeu dans les séances RH : un catalogue vide, une base neuve.
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};

export function baseDeDepart() {
  return {
    v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
    customers: [], suppliers: [], seq: 1, _depart: [],
  };
}

// ─────────────────────────────────────────── Kuehne+Nagel, agence Route de Besançon (ENT-5.7, ENT-5.8)
// Vérifié : Kuehne+Nagel, transporteur réel, a une agence Route à Besançon (École-Valentin) ; règles de
// conduite et de repos du règlement CE 561/2006 (4 h 30 puis 45 min de pause, 9 h par jour, 11 h de
// repos journalier) ; une semi-remorque demande le permis CE.
// Construit : le contrat Smoby ↔ K+N, les chauffeurs, les camions, les trajets, durées et fenêtres, les
// clients (marqués « (fictif) »). Données reprises TELLES QUELLES du cas « chauffeurs et camions » de la
// maquette Planning v8, validée par Tristan le 04/10/2026 (`contenus/planning-essai.js`, `CHAUF`).
// Communes à ENT-5.7 (le planning de la journée) et ENT-5.8 (la lettre de voiture d'E1).
export const KN_AGENCE = { nom: 'Kuehne+Nagel', agence: 'agence Route de Besançon', lieu: 'École-Valentin (25)',
  mailDomain: 'kn-besancon.example' };
export const CHAUFFEURS = [
  { id: 'sofiane', nom: 'Sofiane', permis: 'CE', finHier: '20:00', note: 'permis CE' },
  { id: 'julie', nom: 'Julie', permis: 'CE', finHier: '17:00', note: 'permis CE' },
  { id: 'marc', nom: 'Marc', permis: 'C', finHier: '18:00', note: 'permis C' },
  { id: 'nadia', nom: 'Nadia', permis: 'CE', finHier: '23:00', note: 'permis CE' },
];
export const CAMIONS = [
  { id: 's1', nom: 'Semi n° 1', type: 'semi', note: 'semi-remorque' },
  { id: 's2', nom: 'Semi n° 2', type: 'semi', note: 'semi-remorque' },
  { id: 'p3', nom: 'Porteur n° 3', type: 'porteur', note: 'porteur' },
];
// `conduite` : minutes de conduite du trajet ; `des` / `avant` : prêt à partir dès, livré avant.
const enlevement = (id, vers, type, pal, conduite, des, avant) => ({ id, vers, type, famille: type, pal, conduite, des, avant,
  titre: `${id} — Moirans → ${vers}` });
export const ENLEVEMENTS = [
  enlevement('E1', 'Lyon — Jouets du Rhône (fictif)', 'semi', 33, 240, '06:00', '12:00'),
  enlevement('E2', 'Dijon — Maxi Jouets (fictif)', 'semi', 26, 210, '08:00', '14:00'),
  enlevement('E3', 'Besançon — magasin Ludik (fictif)', 'porteur', 12, 150, '07:00', '12:00'),
  enlevement('E4', 'Mâcon — Centrale du Jouet (fictif)', 'semi', 30, 180, '11:00', '17:00'),
  enlevement('E5', 'Besançon — magasin Ludik (fictif), 2e livraison', 'porteur', 8, 120, '12:00', '17:00'),
];
