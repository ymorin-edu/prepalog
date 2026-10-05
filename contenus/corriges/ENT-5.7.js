// Corrigé d'ENT-5.7 (Kuehne+Nagel, les enlèvements de Noël), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/smoby-ent57.js`) : une solution du
// planning (jugée 10 / 10 par le moteur dans la suite de tests) avant et après la panne du Semi n° 2,
// heures d'arrivée et conduite de chaque chauffeur comprises. Rien n'est recopié.

import { PLANNING, SOLUTION } from '../smoby-ent57.js';

const DEBUT = 5 * 60;
const PAS = PLANNING.echelle.pas;
const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const duree = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
const nomDe = (L, id) => (L.find((x) => x.id === id) || {}).nom || id;
const CHAUF = PLANNING.lignes.liste;
const CAMIONS = PLANNING.affectation.liste;
const PAUSE = PLANNING.cartes.pauses.duree;

const lignes = (v) => Object.entries(SOLUTION[v]).map(([id, p]) => ({ id, ...p, debut: DEBUT + p.s * PAS }))
  .sort((a, b) => a.r.localeCompare(b.r) || a.debut - b.debut)
  .map((p) => {
    if (/^pause/.test(p.id)) return [nomDe(CHAUF, p.r), 'Pause', '—', `${hm(p.debut)} → ${hm(p.debut + PAUSE)}`, ''];
    const c = PLANNING.cartes.liste.find((x) => x.id === p.id);
    return [nomDe(CHAUF, p.r), c.titre, nomDe(CAMIONS, p.k), `${hm(p.debut)} → ${hm(p.debut + c.conduite)}`,
      `prêt dès ${c.des}, livré avant ${c.avant}`];
  });
const conduite = (v) => CHAUF.map((l) => {
  const m = Object.entries(SOLUTION[v]).filter(([id, p]) => p.r === l.id && !/^pause/.test(id))
    .reduce((a, [id]) => a + PLANNING.cartes.liste.find((x) => x.id === id).conduite, 0);
  return `${l.nom} ${duree(m)}`;
}).join(' · ');

export const CORRIGE = {
  code: 'ENT-5.7',
  titre: 'Kuehne+Nagel — les enlèvements de Noël',
  items: [
    { etape: 1, etapeTitre: 'Planning des chauffeurs', genre: 'tableau', texte: 'Une solution, au 1er envoi',
      contexte: 'Marc n’a que le permis C : il prend un porteur. Nadia a fini à 23:00 hier : 11 h de repos, pas de départ avant 10:00. '
        + 'Deux trajets qui dépassent 4 h 30 de conduite à la suite demandent une pause de 45 min entre les deux.',
      entetes: ['Chauffeur', 'Enlèvement', 'Camion', 'Heures', 'Fenêtre'],
      reponses: lignes('v1'),
      note: `Jalons 1 à 5. Conduite de la journée : ${conduite('v1')} (9 h au plus). D’autres solutions sont justes : le moteur juge les règles, pas une solution unique.` },
    { etape: 2, etapeTitre: 'Après la panne', genre: 'tableau', texte: 'Une solution, Semi n° 2 à l’atelier jusqu’à 12:00',
      contexte: 'Au 1er envoi, E2 roulait sur le Semi n° 2 dès 08:00 : ce n’est plus possible. Le Semi n° 1 fait E1 tôt puis E2 ; '
        + 'le Semi n° 2 prend E4 à partir de 12:00.',
      entetes: ['Chauffeur', 'Enlèvement', 'Camion', 'Heures', 'Fenêtre'],
      reponses: lignes('v2'),
      note: `Jalons 6 à 10. Conduite de la journée : ${conduite('v2')}. Simplifications de la séance : la pause ne compte que si une carte Pause est posée ; `
        + 'tout le trajet compte comme de la conduite.' },
  ],
};
