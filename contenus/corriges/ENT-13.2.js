// Corrigé d'ENT-13.2 (Stellantis, « les camions du matin »), montré dans l'onglet « Corrigés » de l'enseignant. La matinée est la même pour tous : les valeurs sont celles des données
// (`contenus/stellantis-ent132-donnees.js`), jamais recopiées à la main ici. N'importe que les données pures : se charge aussi sous Node.

import { CAMIONS, PALETTES, BL_TOTAL, RECU, MANQUANTS, ECRASES, UTILISABLES, LIGNE_COUVERTURE, SEUIL_URGENT, ARRIVEE_AVANT, duree, hlib } from '../stellantis-ent132-donnees.js';

const urgents = CAMIONS.filter((c) => c.urgent).map((c) => `${c.court} (${duree(c.couv)})`).join(' et ');

export const CORRIGE = {
  code: 'ENT-13.2',
  titre: 'Stellantis Sochaux — les camions du matin',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Le planning des quais (10 points)', genre: 'question', texte: 'Huit camions, cinq quais',
      rep: `Chaque camion posé sur un quai qui lui convient (la semi-remorque jamais au quai 5), jamais avant son arrivée, sans chevauchement ni passage sur le créneau pris du quai 2. `
        + `Les camions urgents (couverture de moins de ${duree(SEUIL_URGENT)} : ${urgents}) commencent DÈS leur arrivée.`,
      note: 'Une solution juste : Sièges quai 1 à 5 h 45 · Planches de bord quai 3 à 5 h 45 · Rétroviseurs quai 5 à 6 h · Faisceaux quai 4 à 6 h 15 · Roues quai 2 à 6 h 30 (le quai se libère) · Moquettes quai 5 à 7 h 30 · Batteries quai 1 à 8 h · Joints quai 3 à 9 h. '
        + 'Le piège : servir les camions dans l’ordre d’arrivée laisse les faisceaux sans quai à 6 h 15.' },
    { etape: 2, etapeTitre: 'L’avance du camion (2 points)', genre: 'question', texte: `Le camion de faisceaux arrive à ${hlib(ARRIVEE_AVANT)}`,
      rep: `Les faisceaux passent au quai 4 à ${hlib(ARRIVEE_AVANT)} (leur nouvelle arrivée). Renvoyer le planning sans le toucher ne rapporte rien : les faisceaux commenceraient après leur arrivée.`,
      note: 'Le reste du planning peut rester tel quel : seul un camion bouge.' },
    { etape: 3, etapeTitre: 'Recevoir le camion de faisceaux (7 points)', genre: 'question', texte: `Quatre palettes, ${BL_TOTAL} cartons annoncés`,
      rep: PALETTES.map((p) => `${p.id} (${p.nom}) : ${p.attendu === 'accepter' ? 'accepter, sans réserve' : p.motifAttendu === 'avarie' ? `accepter avec réserves : ${Object.keys(p.avarie).length} cartons écrasés` : `accepter avec réserves : ${p.manque.length} cartons manquants`}`).join(' · '),
      note: 'P2 a une couche du dessus incomplète mais conforme au BL : rien à signaler. Les réserves sont précises (nombre, nature, référence) et écrites AVANT la signature ; aucune mention « sous réserve de déballage ».' },
    { etape: 4, etapeTitre: 'Le message à Karim (1 point)', genre: 'question', texte: 'Ce qui est arrivé, combien de temps la ligne tient',
      rep: `${RECU} cartons reçus sur ${BL_TOTAL} annoncés (${MANQUANTS} manquants, ${ECRASES} écrasés) : ${UTILISABLES} utilisables. ${LIGNE_COUVERTURE}`,
      note: 'La ligne consomme 1 carton par minute : seuls les cartons utilisables comptent, ni les manquants, ni les écrasés.' },
    { etape: 5, etapeTitre: 'Les questions notées (3 points)', genre: 'question', texte: 'Priorité, quai 5, réserve vague, protestation motivée',
      rep: 'Les faisceaux d’abord : la ligne en manquera la première (0,75) · le quai 5 est fait pour les porteurs (0,75) · « colis abîmés » est trop vague, il faut le nombre, la référence, le dommage (0,75) · '
        + 'après la signature, trois jours (jours fériés non compris) pour une protestation motivée par lettre recommandée, Code de commerce L133-3 (0,75).',
      note: 'Le texte de L133-3 est celui des séances Action (relu sur Légifrance le 17/10/2026).' },
  ],
};
