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
//   competences: ['C1.6'],          // une ou plusieurs : référentiel Logistique 2025, ou OTM-…, AGO-… (liste plus bas)
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

  // La 2de GATL pioche aussi dans deux autres référentiels (décision du 03/10/2026, `docs/decisions.md`).
  // Leurs codes portent un préfixe : les codes C1.1 à C3.4 de l'OTM existent aussi en Logistique,
  // avec d'autres intitulés. Libellés recopiés le 04/10/2026 depuis les annexes officielles (Éduscol),
  // au mot près ; fiches `docs/fiches/referentiel-bac-otm.md` et `referentiel-bac-agora.md`.

  // Bac Pro Organisation de transport de marchandises, arrêté du 28 février 2020.
  'OTM-C1.1': "Prendre en compte la demande du client/donneur d'ordre",
  'OTM-C1.2': "Choisir les modalités de l'opération de transport",
  'OTM-C1.3': "Optimiser l'offre de transport",
  'OTM-C1.4': "Élaborer la cotation de l'offre de transport",
  'OTM-C2.1': 'Constituer le dossier transport',
  'OTM-C2.2': "Exécuter la demande du client/donneur d'ordre",
  'OTM-C2.3': "Suivre l'opération de transport et communiquer avec les interlocuteurs",
  'OTM-C3.1': "Contrôler les engagements contractuels avec le client/donneur d'ordre",
  'OTM-C3.2': 'Participer à la gestion des moyens matériels et humains',
  'OTM-C3.3': "Actualiser les tableaux de bord liés à l'activité de transport",
  'OTM-C3.4': "Contribuer à l'amélioration de la performance de l'entreprise",

  // Bac Pro AGOrA, arrêté du 18 février 2020. Le référentiel range ses compétences sous des
  // ACTIVITÉS numérotées : le code est celui de l'activité.
  'AGO-1.1': "Préparation et prise en charge de la relation avec le client, l'usager ou l'adhérent",
  'AGO-1.2': "Traitement des opérations administratives et de gestion liées aux relations avec le client, l'usager ou l'adhérent",
  'AGO-1.3': "Actualisation du système d'information en lien avec le client, l'usager ou l'adhérent",
  'AGO-2.1': "Suivi administratif de l'activité de production",
  'AGO-2.2': "Suivi financier de l'activité de production",
  'AGO-2.3': 'Gestion opérationnelle des espaces (physiques et virtuels) de travail',
  'AGO-3.1': 'Suivi de la carrière du personnel',
  'AGO-3.2': "Suivi organisationnel et financier de l'activité du personnel",
  'AGO-3.3': "Participation à l'activité sociale de l'organisation",
});

// La spécialité d'une compétence se lit sur son préfixe : `OTM-` transport, `AGO-` gestion,
// sans préfixe logistique. L'ordre est celui de l'écran.
export const SPECIALITES = Object.freeze({
  LOG: 'Logistique',
  OTM: 'Transport (OTM)',
  AGO: 'Gestion (AGOrA)',
});
export function specialite(code) {
  const p = String(code || '').split('-')[0];
  return p !== code && SPECIALITES[p] ? p : 'LOG';
}

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
 * Les trois spécialités, chacune avec ses séances (accord de Tristan, 03/10/2026 : en 2de, une
 * moyenne par spécialité à côté de la moyenne par compétence). Une séance compte UNE fois dans
 * une spécialité, même si elle y travaille deux compétences (C1.2 et C1.4 : une seule note en
 * logistique) ; elle compte dans deux spécialités si ses compétences y sont (C1.4 et OTM-C2.1).
 * La moyenne se calcule ensuite comme celle d'une compétence (`moyenneCompetence`).
 * Rend [{ code: 'LOG', libelle, seances: [meta…] }], les trois toujours, dans l'ordre de l'écran.
 */
export function seancesParSpecialite(metas) {
  const comptees = metas.filter(compteParCompetence);
  return Object.entries(SPECIALITES).map(([code, libelle]) => ({
    code, libelle, seances: comptees.filter((m) => m.competences.some((c) => specialite(c) === code)),
  }));
}

/**
 * Moyenne pondérée d'un élève sur une compétence (ou sur une spécialité).
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
