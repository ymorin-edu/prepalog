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
