// Corrigé d'ENT-6.8 (France Boissons, chauffeurs et camions du vendredi), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/france-boissons-ent68.js`) : les deux plannings de référence
// (jugés par le moteur : une solution parmi d'autres), la confirmation au loueur, la fiche « Documents à bord ». Rien n'est recopié.

import { SOLUTION, TOURNEES, CHAUFFEURS, LIGNE_TRANSPORTEUR, LOCATION, TRANSPORTEUR, LOUEUR, ATTENDU, COLONNES, phrasesLoueur } from '../france-boissons-ent68.js';

const nom = (r) => (r === LIGNE_TRANSPORTEUR.id ? TRANSPORTEUR.nom : (CHAUFFEURS.find((c) => c.id === r) || {}).nom || r);
const camion = (k) => (k === LOCATION.id ? LOCATION.nom : k || '— (son camion)');
const heure = (s) => { const m = 300 + s * 15; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
const lignes = (pl) => TOURNEES.map((t) => [t.court, nom(pl[t.id].r), camion(pl[t.id].k), heure(pl[t.id].s)]);
const ouiNon = (b) => (b ? 'oui' : 'non');
const juste = (l) => l.choix[l.juste];

export const CORRIGE = {
  code: 'ENT-6.8',
  titre: 'France Boissons — chauffeurs et camions du vendredi',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Le planning, premier envoi', genre: 'tableau', texte: 'Un planning juste (16 organisations justes au calage)',
      contexte: 'La côte va sur la ligne de Lucas (décision de Tristan du 06/10/2026). Reprise : Amandine 06:30 (fin hier 19:30 + 11 h), Sébastien 09:00 '
        + '(22:00 + 11 h). Julien a le permis B : seulement le fourgon. Côte et Rouen : porteurs thermiques (trop de km pour un électrique). Versailles : électrique.',
      entetes: ['Tournée', 'Chauffeur', 'Camion', 'Départ'],
      reponses: lignes(SOLUTION.v1),
      note: 'Dans tout 1er envoi juste : Julien sur Évreux avec le fourgon, la côte et Rouen sur T1 et T2, Versailles et Mantes sur E1 et E2. '
        + 'Pièges : Julien sur un porteur (permis), Sébastien avant 09:00 ou Amandine avant 06:30 (repos), la côte ou Rouen en électrique (autonomie), '
        + 'Versailles en thermique, un chauffeur sur deux tournées (une tournée chacun, et plus de 4 h 30 de conduite sans pause).' },
    { etape: 2, etapeTitre: 'Le planning, après l’imprévu', genre: 'tableau', texte: 'Un planning juste après la panne (12 organisations justes, toutes avec ces camions)',
      contexte: `T2 en panne toute la journée ; E2 chargé à 40 % (≈ 80 km) ; ${LOCATION.nom} dès 09:00 ; ${TRANSPORTEUR.nom} dès 07:00, avec son chauffeur et son camion. `
        + 'Une tournée avec des vides reste chez France Boissons : seule Rouen (pas de vides) peut partir au transporteur.',
      entetes: ['Tournée', 'Chauffeur', 'Camion', 'Départ'],
      reponses: lignes(SOLUTION.v2),
      note: 'Côte sur T1 ; Rouen au transporteur (07:00 à 08:30) ; Versailles sur E1 ; Mantes sur le porteur de location à partir de 09:00 ; Évreux sur le fourgon. '
        + 'Aucun 1er envoi juste ne reste juste (tous utilisent T2). Renvoyé sans changement : tous les jalons de la reprise sont faux. Pièges : Mantes sur E2 '
        + '(80 km d’autonomie, 90 km de tournée), Rouen sur le camion loué (09:00 : trop tard), la côte ou Mantes au transporteur (vides).' },
    { etape: 3, etapeTitre: 'La confirmation au loueur', genre: 'question', texte: `Le message attendu à ${LOUEUR.nom} (phrases à choisir, au vous) — non noté`,
      rep: phrasesLoueur('{prénom}').lignes.map(juste).join(' '),
      note: 'Pièges de la ligne « véhicule » : un électrique (borne en panne), un fourgon (trop petit pour Mantes), un porteur avec chauffeur (ce ne serait plus '
        + 'nous qui transportons). Karim pose une question de réflexion à l’envoi, corrigée au bilan.' },
    { etape: 4, etapeTitre: 'Les documents à bord', genre: 'tableau', texte: 'La fiche attendue (calculée depuis l’organisation retenue)',
      entetes: ['Tournée', ...COLONNES.map((c) => c.lib)],
      reponses: TOURNEES.map((t) => [t.court, ...COLONNES.map((c) => ouiNon(ATTENDU[t.id][c.id]))]),
      note: 'Notées : Rouen (transporteur : compte d’autrui, lettre de voiture) et Mantes (camion loué sans chauffeur : compte propre, contrat de location, pas de '
        + 'lettre de voiture). Les trois autres lignes servent de contraste, non notées. Arrêté du 9 novembre 1999, articles 2, 4, 7 et 9.' },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '13 jalons pondérés et 2 questions notées, total 20 : planning 1er envoi 5 (tout affecté 0,5, chauffeurs 1, camions 1,5, fenêtres 1, conduite et repos 1), '
        + 'après l’imprévu 7 (0,5 · 1 · 2 · 1 · 1, et les vides chez nous 1,5), documents à bord 5 (Rouen 2,5, Mantes 2,5), questions de Karim 3 (repos de '
        + 'Sébastien 1,5, temps de conduite du transporteur 1,5). Rien n’est vrai sans envoi ; un planning incomplet ne rapporte aucun jalon de sa version.',
      note: 'Règle du premier bilan : « Corriger » rouvre le planning (la 1re version fausse d’abord) et la fiche ; la note devient la moyenne du premier bilan et '
        + 'de l’état à la première correction. Poids validés par Tristan le 12/10/2026.' },
  ],
};
