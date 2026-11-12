// Corrigé d'ENT-25.1 (la vitrine du Bac Pro Logistique, semaine des filières de 2de), montré dans l'onglet « Corrigés » de l'enseignant.
// Le même jeu pour tous (aucun tirage). N'importe que les données pures : se charge aussi sous Node.

import { CHEMIN, QUI_BOUGE, QUI_BOUGE_JUSTE, PAR_HEURE, ROUES_HEURE, RETARD, RETARD_JUSTE, PRESTATAIRES, CAS_AIRBUS, EXPORT_PCT, LOTS, LOT_JUSTE, AFFIRMATIONS, POIDS }
  from '../vitrine-logistique.js';

const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;

export const CORRIGE = {
  code: 'ENT-25.1',
  titre: 'Et si tu choisissais la Logistique ?',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: `① Amazon (${POIDS.chemin + POIDS.bouge} points)`, genre: 'question', texte: 'Le chemin d’un article, dans l’ordre ; qui se déplace ?',
      rep: `${CHEMIN.map((e) => e.lib).join(' → ')}. Qui se déplace : ${lib(QUI_BOUGE, QUI_BOUGE_JUSTE).toLowerCase()}.`,
      note: `Ordre exact : ${POIDS.chemin} points, sinon 0 (départ identique pour tous). Le robot : ${POIDS.bouge} point.` },
    { etape: 2, etapeTitre: `② Stellantis (${POIDS.parheure + POIDS.roues + POIDS.retard} points)`, genre: 'question', texte: 'Voitures par heure, roues par heure, pièce en retard',
      rep: `${PAR_HEURE} voitures par heure · ${ROUES_HEURE} roues par heure (60 × 4) · ${lib(RETARD, RETARD_JUSTE)}.`,
      note: `${POIDS.parheure} + ${POIDS.roues} + ${POIDS.retard} points. Chaque case est jugée sur la valeur juste (60, puis 240).` },
    { etape: 3, etapeTitre: `③ Airbus Helicopters (${POIDS.aog + POIDS.revision} points)`, genre: 'tableau', texte: 'Le transport de chaque pièce',
      entetes: ['Cas', 'Transport attendu'],
      reponses: CAS_AIRBUS.map((c) => [c.lib, lib(PRESTATAIRES, c.juste)]),
      note: 'Règle : hélicoptère au sol, le plus rapide ; sinon, le moins cher qui arrive à temps (la messagerie, 3 jours, arrive bien avant la révision dans deux semaines).' },
    { etape: 4, etapeTitre: `④ Royal Canin (${POIDS.export + POIDS.lot} points)`, genre: 'question', texte: 'Tonnes exportées sur 100 ; le lot à sortir en premier',
      rep: `${EXPORT_PCT} tonnes · ${lib(LOTS, LOT_JUSTE)} (FEFO : la date la plus proche sort d’abord).`,
      note: `${POIDS.export} + ${POIDS.lot} points.` },
    { etape: 5, etapeTitre: `⑤ Le Bac Pro Logistique (${AFFIRMATIONS.length * POIDS.vf} points)`, genre: 'tableau', texte: 'Vrai ou faux',
      entetes: ['Affirmation', 'Réponse'],
      reponses: AFFIRMATIONS.map((a) => [a.lib, a.juste === 'vrai' ? 'Vrai' : 'Faux']),
      note: 'Le poste préféré n’est pas jugé : la réponse de chaque élève est rangée dans sa base (fiche « Et toi ? », champ « prefere »).' },
  ],
};
