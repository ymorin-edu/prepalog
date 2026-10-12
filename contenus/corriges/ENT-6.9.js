// Corrigé d'ENT-6.9 (France Boissons, la tournée de la côte), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données pures de la séance (`contenus/france-boissons-ent69-donnees.js`, sans le moteur : ce fichier
// se charge aussi dans Node) : la tournée de référence (une solution parmi 42), sa feuille de route, le SMS attendu. Rien n'est recopié.

import { SOLUTION, SOLUTION_2, journee, lignesFeuille, formulesReference, valeursFeuille, heuresSms, nomDe, hhmm, dureeDit, JOUR, CRENEAUX,
  PHRASE_PAUSE, REF, VILLES } from '../france-boissons-ent69-donnees.js';

const b = journee(SOLUTION);
const cases = formulesReference(b);
const val = valeursFeuille(lignesFeuille(b), cases);
const km = (x) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(Math.round(x * 10) / 10);
const fr = (x) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(x);
const horaire = (id) => { const c = CRENEAUX[id]; return !c ? '—' : c.apres != null ? `pas avant ${hhmm(c.apres)}` : `avant ${hhmm(c.avant)}`; };
const b2 = journee(SOLUTION_2);
const sms = heuresSms(b.arrivee, val[REF.retour]);

export const CORRIGE = {
  code: 'ENT-6.9',
  titre: 'France Boissons — la tournée de la côte',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Ordonner la tournée', genre: 'tableau', texte: `Une tournée juste (42 ordres sur 720 tiennent tout) : ${SOLUTION.map(nomDe).join(' → ')}`,
      contexte: `Départ de Buchelay ${hhmm(JOUR.depart)}, ${JOUR.autoroute.km} km d’autoroute à ${JOUR.autoroute.vitesse} km/h (aller et retour), `
        + `${JOUR.vitesse} km/h sur la côte, ${JOUR.service} min par arrêt ; 4 h 30 de conduite au plus sans pause ; retour avant ${hhmm(JOUR.limite)}.`,
      entetes: ['N°', 'Client', 'Horaire', 'Arrivée', 'Départ'],
      reponses: SOLUTION.map((id, i) => [String(i + 1), `${nomDe(id)} (${VILLES[id]})`, horaire(id), hhmm(b.arrivees[id]), hhmm(b.departs[id])]),
      note: `Conduite ${dureeDit(b.conduite)} (pas de pause), ${km(b.km)} km sur la côte, retour à ${hhmm(b.arrivee)}. Attente de ${Math.round(b.attente)} min chez Malo `
        + `(il n’ouvre qu’à 10 h). Autre tournée juste : ${SOLUTION_2.map(nomDe).join(' → ')} (retour ${hhmm(b2.arrivee)}, sans attente). Pièges : nord → sud et `
        + 'le plus court ratent le café de Deauville (avant 8 h 30) ; 80 ordres tiennent les horaires mais dépassent 4 h 30 (zigzag) ; tout ordre qui commence '
        + 'par Malo rate quelque chose. Les jalons jugent les contraintes, pas un ordre attendu.' },
    { etape: 2, etapeTitre: 'La feuille de route', genre: 'tableau', texte: 'Les formules attendues sur la tournée de référence (la feuille suit l’ordre de l’élève)',
      entetes: ['Cellule', 'Formule', 'Résultat'],
      reponses: Object.entries(cases).map(([ref, f]) => {
        const v = val[ref];
        const heure = /^[CD]1[3-8]$|^B11$|^B25$/.test(ref);
        return [ref, f, v == null ? '' : heure ? hhmm(v) : fr(v)];
      }),
      note: 'Les attendus se calculent sur les saisies de l’élève : une erreur ne se paie qu’une fois. Chez Malo, le camion arrive avant 10 h : il repart à '
        + 'l’ouverture + 20 min (=E…+B6). La conduite totale compte l’autoroute deux fois, ni les arrêts ni l’attente. Pause : 45 au-delà de 270 min, sinon 0.' },
    { etape: 3, etapeTitre: 'Le SMS à Lucas', genre: 'question', texte: 'Le SMS attendu (phrases à choisir ; menus calculés sur la tournée de l’élève)',
      rep: [`1er arrêt : ${nomDe(SOLUTION[0])}`, `2e arrêt : ${nomDe(SOLUTION[1])}`, `3e arrêt : ${nomDe(SOLUTION[2])}`,
        `Retour prévu à Buchelay vers ${hhmm(sms.juste)}.`, PHRASE_PAUSE[b.pauseDue ? 1 : 0]].join(' · '),
      note: 'Les trois premiers arrêts sont ceux de SA tournée envoyée ; l’heure de retour et la pause sont celles que Lucas vivra (le bilan), pas celles '
        + 'de sa feuille : un calcul faux transmis au chauffeur se paie au calcul et au message.' },
    { etape: 4, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '12 jalons pondérés et 3 questions notées, total 20 : la tournée 6,5 (six clients 0,5, horaires tenus 2,5, conduite sous 4 h 30 2, retour avant '
        + '15 h 30 1,5), la feuille de route 6,5 (aller 1, arrivées et départs 2, conduite totale 1,5, pause 1, heure de retour 1), le SMS 3 (trois premiers '
        + 'arrêts 1, heure de retour 1, pause 1), questions 4 (à qui sert l’heure de retour 1, conduire sans pause 1,5, lire un SMS au volant 1,5). Rien n’est '
        + 'vrai avant l’envoi de la tournée.',
      note: 'Poids validés par Tristan le 12/10/2026. Guidage : la feuille se vérifie à l’écran avant l’envoi ; pas de « Corriger » après le bilan.' },
  ],
};
