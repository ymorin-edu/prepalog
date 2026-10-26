// Corrigé d'ENT-3.4 (Boost, évaluation de la tournée), onglet « Corrigés » de l'enseignant. Pas de trame : tout se fait à l'écran.
// Tout se recalcule depuis le contenu de la séance (`contenus/boost-ent34.js`) : journée, poids, commande laissée à quai, meilleure tournée.

import { JOURNEE, CLIENTS, NOUVEAUX, TOTAL, CRENEAU, A_QUAI, optimum, BAREME } from '../boost-ent34.js';

const hm = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
const nom = (id) => (CLIENTS.find((c) => c.id === id) || {}).nom;
const quai = CLIENTS.find((c) => c.id === A_QUAI);
const best = optimum();
const pts = (k) => `${BAREME[k][0]} point${BAREME[k][0] > 1 ? 's' : ''}`;

export const CORRIGE = {
  code: 'ENT-3.4',
  titre: 'Boost — évaluation de la tournée',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: `Situer les nouveaux clients (${pts('reperage')})`, genre: 'question', texte: 'Les quatre nouveaux clients sur la carte',
      rep: NOUVEAUX.map((c) => c.nom).join(' · '), note: 'Juste avec au plus trois clics sur une autre rue.' },
    { etape: 2, etapeTitre: `Les données et ce qui reste à quai (${pts('donnees')} + ${pts('choix')})`, genre: 'question', texte: 'Le poids à écarter, la commande laissée à quai',
      rep: `Total des commandes ${TOTAL} kg, charge utile ${JOURNEE.chargeUtile} kg : il faut écarter au moins ${TOTAL - JOURNEE.chargeUtile} kg. Laisser à quai : ${quai.nom} (${quai.kg} kg), la seule assez lourde à elle seule.`,
      note: `Départ ${hm(JOURNEE.depart)}, vitesse ${JOURNEE.vitesse} km/h, ${JOURNEE.service} min par arrêt.` },
    { etape: 3, etapeTitre: `Les contraintes (${pts('charge')} + ${pts('horaire')} + ${pts('creneau')})`, genre: 'question', texte: 'Charge, train, créneau',
      rep: `Charge ≤ ${JOURNEE.chargeUtile} kg · retour à la gare avant ${hm(JOURNEE.limite)} · ${CRENEAU ? `${CRENEAU.nom} : ${CRENEAU.creneau.libelle}` : 'pas de créneau'}.` },
    { etape: 4, etapeTitre: `La feuille de calcul (${pts('formules')})`, genre: 'question', texte: 'Les formules',
      rep: 'Total des poids, écart à la charge utile, poids laissé à quai, charge, temps de route et de service, heure à la gare et heure au client à créneau : des formules (pas des nombres tapés).' },
    { etape: 5, etapeTitre: `Le trajet (${pts('trajet10')} + ${pts('trajet5')})`, genre: 'question', texte: 'La meilleure tournée qui tient tout',
      rep: `${best.ordre.map(nom).join(' → ')} : ${String(Math.round(best.km * 100) / 100).replace('.', ',')} km.`,
      note: 'Juste à moins de 10 % puis à moins de 5 % de ce trajet, si la tournée tient la charge, le train et le créneau.' },
  ],
};
export function corrigeEleve() { return { texte: '', items: [] }; }
