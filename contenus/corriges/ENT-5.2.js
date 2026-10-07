// Corrigé d'ENT-5.2 (Smoby, l'arrivée de Yanis), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/smoby-ent52.js`) : les pièces et
// leur explication, l'ordre du premier jour, une solution du planning (jugée 10 / 10 par le moteur dans
// la suite de tests) avant et après l'imprévu, et le message juste. Rien n'est recopié.

import { PIECES, PREMIER_JOUR, PLANNING, SOLUTION, PHRASES } from '../smoby-ent52.js';
import { CORRIGE as TRAME } from './ENT-5.2-trame.js';

// Le corrigé de la trame élève (généré, relue par Tristan le 06/10/2026), après celui calculé
// depuis la séance. Ses étapes sont celles de la trame : marquées « (trame) », sinon l'onglet
// Corrigés, qui regroupe par numéro d'étape, les mêlerait aux étapes de l'écran (mêmes numéros).
const DE_LA_TRAME = TRAME.items.map((it) => ({ ...it, etape: `${it.etape} (trame)` }));

const JOURS = PLANNING.echelle.jours;
const CARTES = PLANNING.cartes.liste.concat(PLANNING.alea.ajoutCartes);
const plage = (t, n) => (n > 1 ? `${JOURS[t]} → ${JOURS[t + n - 1]}` : JOURS[t]);
const ligneDe = (version) => Object.entries(SOLUTION[version]).map(([id, t]) => {
  const c = CARTES.find((x) => x.id === id);
  const dem = JOURS.indexOf(c.date);
  return [c.titre, plage(t, c.jours), c.impose ? 'date imposée' : t === dem ? 'accordé à la date demandée' : `décalé (demandé : ${plage(dem, c.jours)})`];
});
const BESOIN = PLANNING.regles.find((r) => r.id === 'effectif').besoin;
const juste = (l) => (l.texte != null ? l.texte : l.choix[l.juste]);

export const CORRIGE = {
  code: 'ENT-5.2',
  titre: 'Smoby — l’arrivée du cariste',
  trame: TRAME.trame,
  items: [
    { etape: 1, etapeTitre: 'Fiche d’arrivée', genre: 'tableau', texte: 'Les pièces à demander à Yanis',
      contexte: 'L’employeur ne demande que ce qui a un lien direct et nécessaire avec le poste (Code du travail, art. L1221-6).',
      entetes: ['Pièce', 'À demander ?', 'Pourquoi'],
      reponses: PIECES.map((p) => [p.lib, p.demander ? 'oui' : 'non', p.pourquoi]),
      note: 'Une pièce = un jalon (0,5 point) : juste si cochée quand elle est à demander, laissée sinon. Aucune case cochée : toutes fausses.' },
    { etape: 1, etapeTitre: 'Fiche d’arrivée', genre: 'question', texte: 'Le premier jour, dans l’ordre',
      rep: PREMIER_JOUR.map((e, k) => `${k + 1}. ${e.lib}`).join(' · '),
      note: '4 liens « juste avant » (0,75 point chacun) ; l’ordre de départ laissé tel quel ne vaut rien. Le CACES ne suffit pas : l’autorisation de conduite est signée par l’employeur après le CACES, l’avis du médecin '
        + 'du travail et la visite des lieux (art. R4323-56) ; elle vient donc après la visite de sécurité.' },
    { etape: 2, etapeTitre: 'Planning des présences', genre: 'tableau', texte: 'Une solution, au 1er envoi',
      contexte: `Besoin ${BESOIN.slice(0, 5).join('-')} / ${BESOIN.slice(5).join('-')}, au moins un cariste CACES par jour, Yanis présent à partir du mer 9. `
        + 'Le mer 16, Karim et Léa ne peuvent pas être en congé tous les deux : l’un des deux congés est décalé (ici celui de Karim).',
      entetes: ['Absence', 'Posée', 'Pourquoi'],
      reponses: ligneDe('v1'),
      note: '5 règles à 0,7 point. D’autres solutions sont justes : le moteur juge les règles, pas une solution unique.' },
    { etape: 3, etapeTitre: 'Après l’imprévu', genre: 'tableau', texte: 'Une solution, après l’arrêt d’Inès',
      contexte: 'Inès en arrêt du lun 14 au mer 16 ; Noa, intérimaire sans CACES, arrive le mar 15. Le lun 14, il manque du monde : '
        + 'le congé de Chloé est décalé.',
      entetes: ['Absence', 'Posée', 'Pourquoi'],
      reponses: ligneDe('v2'),
      note: '5 règles à 1,1 point.' },
    { etape: 4, etapeTitre: 'Le point à Sophie', genre: 'question', texte: 'Le message juste (phrases à choisir)',
      rep: PHRASES.lignes.map(juste).join(' '),
      note: 'Une ligne = un jalon : le constat (2 points), la salutation (1), la formule de fin (1). Le dernier envoi compte.' },
    ...DE_LA_TRAME,
  ],
};
