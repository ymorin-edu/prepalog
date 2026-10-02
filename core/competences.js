// Notes par compétence.
//
// Décision de Tristan, 02/10/2026 (voir la fiche projet `prepalog-finalite.md`, section B) :
// la note qui compte porte sur une COMPÉTENCE du référentiel, et le poids de chaque séance
// dépend de son TEMPS PÉDAGOGIQUE :
//
//   - guidage, entraînement, erreur induite → évaluation formative, coefficient 1 ;
//   - évaluation                            → évaluation sommative, coefficient 3.
//
// Les coefficients sont ceux PAR DÉFAUT. L'enseignant les change depuis l'espace enseignant,
// onglet « Compétences » ; ils sont rangés dans le document du groupe (`groupes/{gid}.coefs`),
// donc chaque classe peut avoir les siens. Les règles Firestore laissent déjà le prof du
// groupe modifier son groupe : aucune règle à republier.
//
// Comment une séance entre dans le tableau : elle déclare dans son `meta`
//
//   competences: ['C1.6'],          // une ou plusieurs, codes du référentiel 2025
//   temps: 'entrainement',          // 'guidage' | 'entrainement' | 'erreur' | 'evaluation'
//
// et elle a un `bareme` (sinon elle n'a pas de note). Une séance sans compétence reste dans le
// suivi par séance, mais n'entre dans aucune moyenne : c'est le cas, voulu, des modules
// transversaux (TAB-1, TAB-3, QUI-8 à 10).
//
// Deux règles tranchées par Tristan le 02/10 :
//
// - une séance qui travaille DEUX compétences compte pour les deux : la même note entre dans
//   la moyenne de chacune ;
// - les séances en jalons (`notation: 'avancement'`, Spartoo) entrent dans la moyenne,
//   CONVERTIES SUR 20 (3 jalons sur 3 = 20/20), au coefficient de leur temps. Cette
//   conversion ne vaut QUE ici : le suivi par séance garde son « 3 / 3 » (voir notes.js).
//
// Une séance pas encore faite ne compte pas pour zéro : elle n'entre pas dans la moyenne.
// Une moyenne se lit donc toujours avec le nombre de séances qui la composent, et l'écran
// comme l'export le donnent.

import { noteSur20 } from './notes.js';

// Libellés officiels, arrêté du 8 janvier 2025 (Bac Pro Logistique, rentrée 2025), blocs 1 à 3.
// Le bloc 4 (conduite d'engins) demande une manipulation réelle : hors Prepalog.
export const COMPETENCES = Object.freeze({
  'C1.1': 'Positionner des activités logistiques dans la supply chain',
  'C1.2': 'Mettre en œuvre les règles de sécurité dans le cadre de la prévention des risques',
  'C1.3': "Préparer l'action de réception",
  'C1.4': 'Traiter les opérations de réception de produits selon les procédures',
  'C1.5': 'Mettre en stock les produits',
  'C1.6': 'Gérer le suivi des stocks',
  'C2.1': 'Répondre à la demande des clients internes et/ou externes',
  'C2.2': 'Optimiser les préparations de commandes en fonction des demandes',
  'C2.3': 'Contribuer au processus de logistique industrielle',
  'C2.4': 'Organiser une tournée de livraison',
  'C2.5': 'Traiter les retours des supports de charges et/ou des contenants',
  'C2.6': "Confier l'expédition à un prestataire de transport externe",
  'C3.1': 'Adapter le processus logistique selon le type de produit ou de flux',
  'C3.2': 'Mettre en œuvre le processus de traçabilité dans la chaîne logistique',
  'C3.3': "Proposer des axes d'amélioration de l'activité logistique dans le cadre d'une démarche RSE",
  'C3.4': 'Coordonner une petite équipe logistique',
});

// Les quatre temps pédagogiques (doctrine du 02/10, `prepalog-progression-pedagogique.md`).
// L'ordre est celui de l'écran des coefficients.
export const TEMPS = Object.freeze({
  guidage: 'Guidage',
  entrainement: 'Entraînement',
  erreur: 'Erreur induite',
  evaluation: 'Évaluation',
});

export const COEFS_DEFAUT = Object.freeze({ guidage: 1, entrainement: 1, erreur: 1, evaluation: 3 });

/**
 * Les coefficients d'un groupe : ceux que l'enseignant a enregistrés, complétés par les
 * valeurs par défaut. Une valeur absente, négative ou illisible retombe sur le défaut :
 * un champ abîmé dans la base ne doit pas faire disparaître une note.
 */
export function coefsDuGroupe(groupe) {
  const enr = (groupe && groupe.coefs) || {};
  const out = {};
  for (const k of Object.keys(TEMPS)) {
    const v = enr[k];
    out[k] = typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : COEFS_DEFAUT[k];
  }
  return out;
}

/** Une séance entre-t-elle dans le tableau par compétence ? */
export function compteParCompetence(meta) {
  return !!(meta && meta.bareme && Array.isArray(meta.competences) && meta.competences.length
    && TEMPS[meta.temps]);
}

/**
 * Note sur 20 d'une séance pour le tableau par compétence, quel que soit son mode de
 * notation : corrigée par le noyau, saisie à la main (sur son barème) ou en jalons.
 * `null` si l'élève n'a pas de score.
 */
export function noteDeSeance(meta, travail) {
  if (!travail || typeof travail.meilleur !== 'number') return null;
  return noteSur20(travail.meilleur, travail.max || meta.bareme);
}

/**
 * Les compétences travaillées, dans l'ordre du référentiel, chacune avec ses séances
 * (dans l'ordre reçu, qui est celui des numéros de module).
 * Rend [{ code, libelle, seances: [meta…] }].
 */
export function seancesParCompetence(metas) {
  const par = new Map();
  metas.filter(compteParCompetence).forEach((m) => {
    m.competences.forEach((c) => {
      if (!par.has(c)) par.set(c, []);
      par.get(c).push(m);
    });
  });
  const ordre = Object.keys(COMPETENCES);
  const rang = (c) => { const i = ordre.indexOf(c); return i < 0 ? ordre.length : i; };
  return [...par.keys()]
    .sort((a, b) => rang(a) - rang(b) || a.localeCompare(b))
    .map((code) => ({ code, libelle: COMPETENCES[code] || '', seances: par.get(code) }));
}

/**
 * Moyenne pondérée d'un élève sur une compétence.
 * `travaux` : { [idSeance]: travail } pour cet élève.
 * Rend { moyenne, detail: [{ meta, temps, coef, note }], nbNotes }.
 * `moyenne` est null tant qu'aucune séance notée n'a un coefficient non nul.
 */
export function moyenneCompetence(seances, travaux, coefs) {
  let somme = 0;
  let poids = 0;
  let nbNotes = 0;
  const detail = seances.map((m) => {
    const coef = coefs[m.temps];
    const note = noteDeSeance(m, travaux ? travaux[m.id] : null);
    if (note !== null) {
      nbNotes++;
      somme += note * coef;
      poids += coef;
    }
    return { meta: m, temps: m.temps, coef, note };
  });
  // Deux décimales, comme sur un bulletin.
  const moyenne = poids > 0 ? Math.round((somme / poids) * 100) / 100 : null;
  return { moyenne, detail, nbNotes };
}
