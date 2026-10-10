// Corrigé d'ENT-6.3 (France Boissons, les congés d'été), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/france-boissons-ent63.js`) : les deux plannings justes
// (énumérés : un seul chacun), l'annonce attendue, le message à Lucas. Rien n'est recopié.

import { SOLUTIONS, DEMANDES, BESOIN, periode, phrasesLucas, phrasesReponse, MENTIONS, POSTE, CHOIX_CONTRAT, CHOIX_RATTACHE,
  CHOIX_INTITULE, PARTANT, SAISONNIER } from '../france-boissons-ent63.js';
import { EQUIPE } from '../france-boissons.js';

const NOMS = { lucas: 'Lucas', amandine: 'Amandine', julien: 'Julien', sebastien: 'Sébastien', fatou: 'Fatou', yoann: 'Yoann', kevin: 'Kevin' };
const lignesPlanning = (pl) => DEMANDES.filter((c) => pl[c.id] != null).map((c) => {
  const s = pl[c.id], decale = !c.impose && s !== c.date;
  return [NOMS[c.qui], periode(c.date, c.semaines), periode(s, c.semaines), c.impose ? 'déjà validé : ne bouge pas' : decale ? 'DÉCALÉ' : 'à sa date'];
});
const sol1 = SOLUTIONS.v1[0] || {}, sol2 = SOLUTIONS.v2[0] || {};
const juste = (l) => l.choix[l.juste];
const lib = (L, v) => (L.find((c) => c.v === v) || {}).lib || v;

export const CORRIGE = {
  code: 'ENT-6.3',
  titre: 'France Boissons — les congés d’été',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Le planning, premier envoi', genre: 'tableau', texte: `Le planning juste (${SOLUTIONS.v1.length} solution)`,
      contexte: `Besoin par semaine : ${BESOIN.join(' · ')} (S1 à S9). Au moins un chauffeur de la côte chaque semaine. Règle : la demande la plus ancienne `
        + 'garde sa date, on décale le MOINS DE CONGÉS possible (nombre minimal de congés décalés, décision de Tristan du 10/10/2026).',
      entetes: ['Chauffeur', 'Demandé', 'Accordé', ''],
      reponses: lignesPlanning(sol1),
      note: 'Lucas (demande du 5 mai) et Amandine (2 mars) se disputent la semaine du 19 juillet : Amandine garde sa date, Lucas part une semaine plus tôt. '
        + 'Pièges : décaler Amandine à la place de Lucas (priorité fausse) ; décaler plusieurs congés « chacun bloqué par les autres » (pas le minimum).' },
    { etape: 2, etapeTitre: 'Le planning, après l’imprévu', genre: 'tableau', texte: `Le planning juste après le départ de Kevin (${SOLUTIONS.v2.length} solution)`,
      contexte: `Kevin part avant le 5 juillet (ligne et carte retirées) ; ${SAISONNIER.nom} là ${periode(SAISONNIER.dispo, SAISONNIER.a - SAISONNIER.dispo + 1)}, `
        + 'il ne connaît pas la côte. En S1, il faut les six chauffeurs restants : aucun congé possible.',
      entetes: ['Chauffeur', 'Demandé', 'Accordé', ''],
      reponses: lignesPlanning(sol2),
      note: 'Le congé de Lucas saute une deuxième fois : c’est le cœur du message. Le planning du 1er envoi renvoyé sans changement est faux (tous ses jalons). '
        + `La semaine du 30 août est indispensable (sans elle, aucune solution à un seul décalage). ${NOMS[PARTANT]} n’est plus dans l’équipe.` },
    { etape: 3, etapeTitre: 'Le message à Lucas', genre: 'question', texte: 'Le message juste (phrases à choisir, au tu : Lucas est un collègue)',
      rep: phrasesLucas('{prénom}').lignes.map(juste).join(' '),
      note: 'Jalons : décision, raison, proposition (le fond), salutation et formule de fin (le ton). Lucas répond en reprenant la décision et la '
        + `proposition choisies, sans corriger. La réponse de l’élève à Lucas n’est pas notée (juste attendu : ${phrasesReponse('{prénom}').lignes.map(juste).join(' ')})` },
    { etape: 4, etapeTitre: 'L’annonce du saisonnier', genre: 'tableau', texte: 'L’annonce attendue',
      entetes: ['Case', 'Attendu'],
      reponses: [
        ['Intitulé', POSTE.intitule], ['Contrat', lib(CHOIX_CONTRAT, POSTE.contrat)], ['Dates', POSTE.dates],
        ['Rattaché à', lib(CHOIX_RATTACHE, POSTE.rattache)],
        ...MENTIONS.map((m) => [m.lib, m.oui ? 'Oui : sert au poste' : 'Non : discrimination (Code du travail, L1132-1)']),
      ],
      note: `Pièges de l’intitulé : ${CHOIX_INTITULE.filter((c) => c.lib !== POSTE.intitule).map((c) => c.lib).join(' · ')}. Le CDD saisonnier : L1242-2, 3°. `
        + `Karim (${EQUIPE.karim.role}) transmet l’annonce à Hélène : lien hiérarchique d’ENT-6.1.` },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '27 jalons pondérés et 2 questions notées, total 20 : planning 1er envoi 4,5 (effectif 1, côte 0,5, Julien 0,5, priorité 1,5, décalés au minimum 1), '
        + 'après l’imprévu 5,5 (1,5 · 0,5 · 0,5 · 1,5 · 1,5), annonce le poste 1,5, ce qu’on écrit ou pas 3 (4 × 0,25 et 4 × 0,5), message à Lucas le fond 1,5 et '
        + 'le ton 1, questions de Karim 3 (CDD saisonnier 1,5, âge d’un candidat 1,5). Rien n’est vrai sans envoi.',
      note: 'Règle du premier bilan : « Corriger » rouvre le planning (la 1re version fausse d’abord), l’annonce et le message à Lucas ; la note devient la moyenne '
        + 'du premier bilan et de l’état à la première correction. D3141-6 (ordre des départs communiqué un mois avant) : non abordé, laissé tel quel (Tristan, 10/10/2026).' },
  ],
};
