// ENT-21.2 — Lidl, « le planning du lundi » : ENTRAÎNEMENT de C1.3, 2de GATL. La zone de six camions, leur créneau d'après la règle des
// rendez-vous (un créneau d'une heure par quai, dans l'ordre des demandes), la durée d'un déchargement, un camion de surgelés en retard.
// Univers : `contenus/lidl.js` ; données : `D212`, `planning`, `duree` ; questions : `contenus/questions/ENT-21.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les zones 3 (0,5 × 6) · les créneaux 4,5 (0,75 × 6) · la durée 3
// (minutes 2 + créneau 1) · le retard 1,5 · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches, proche } from './fabrique-fiches.js';
import { U_RECEPTION, SALUT, FIN } from './lidl-commun.js';
import { DOC_SITE, DOC_ZONES, DOC_RECEPTION, docRdv, blocsZonesCamions, jalonsZonesCamions } from './lidl.js';
import { D212, HEURES, planning, duree } from './lidl-donnees.js';
import { QUESTIONS } from './questions/ENT-21.2.js';

export * from './lidl.js';

const PL = planning(D212);
const C6 = D212.find((c) => c.id === 'C6');
const TIENT = [{ v: 'oui', lib: 'Oui : il tient dans son créneau d’une heure' }, { v: 'non', lib: 'Non : il dépasse son créneau d’une heure' }];
const RETARD = [{ v: 'attendre', lib: 'Il attend 20 minutes, groupe froid allumé, que le quai 6 se libère' },
  { v: 'sec', lib: 'Je le décharge tout de suite sur un quai de produits secs' }, { v: 'refuser', lib: 'Je le renvoie : il est en retard' }];

const S = seanceFiches(U_RECEPTION, {
  id: 'lidl-planning', prefixe: '212', titre: 'Le planning du lundi', exercice: 'Séance 2 : le planning du lundi',
  documents: [DOC_SITE, DOC_ZONES, DOC_RECEPTION, docRdv(D212)],
  pas: [
    { id: 'zones', libelle: 'Les zones', titre: 'La zone de chaque camion', sousTitre: 'D’après ses produits.',
      objet: 'Le planning du lundi', pieces: ['rdv', 'zones'], documents: ['rdv', 'zones'], largeurDocs: 1.2,
      message: 'Bonjour {prenom}. Six fournisseurs demandent un rendez-vous lundi. D’abord, la zone de chaque camion.',
      blocs: blocsZonesCamions(D212), jalons: jalonsZonesCamions(D212, { poids: 0.5, groupe: 'Les zones' }) },
    { id: 'creneaux', libelle: 'Les créneaux', titre: 'Le créneau de chaque camion', sousTitre: 'La règle des rendez-vous est sous le tableau.',
      objet: 'Les créneaux', pieces: ['rdv'], documents: ['rdv', 'zones'], largeurDocs: 1.3,
      message: 'Maintenant, donne à chaque camion son heure de rendez-vous. Suis la règle : dans l’ordre des demandes, et pas plus de camions que de quais dans une zone.',
      blocs: D212.map((c) => ({ type: 'liste', id: `heure-${c.id}`, lib: `${c.id} · ${c.de} (demande ${c.heure} h)`, vide: 'Choisir l’heure…', manque: `l’heure du camion ${c.id}`,
        choix: HEURES.map((h) => ({ v: h, lib: `${h} h` })) })),
      jalons: D212.map((c, i) => ({ id: `heure-${i + 1}`, titre: `Le créneau du camion ${c.id}`, groupe: 'Les créneaux', poids: 0.75,
        attendu: `${PL[c.id]} h`, juste: (v) => v[`heure-${c.id}`] === PL[c.id] })) },
    { id: 'duree', libelle: 'La durée', titre: 'Le camion d’eau', sousTitre: 'La durée de déchargement est sous le tableau.',
      objet: 'Le camion d’eau', pieces: ['rdv'], documents: ['rdv'],
      message: `Le camion C6 apporte ${C6.palettes} palettes d’eau. Combien de minutes faut-il pour le décharger ? Tient-il dans son créneau ?`,
      blocs: [{ type: 'nombre', id: 'minutes', lib: 'La durée de déchargement du camion C6', unite: 'min', min: 0, manque: 'la durée' },
        { type: 'choix', id: 'tient', lib: 'Le camion C6 tient-il dans son créneau ?', colonne: true, manque: 'ta réponse', choix: TIENT }],
      jalons: [{ id: 'minutes', titre: 'La durée de déchargement', groupe: 'La durée', poids: 2, attendu: `${C6.palettes} × 2 + 15 = ${duree(C6.palettes)} minutes`,
        juste: (v) => proche(v.minutes, duree(C6.palettes)) },
        { id: 'tient', titre: 'Le créneau suffit-il ?', groupe: 'La durée', poids: 1, attendu: TIENT[1].lib, juste: (v) => v.tient === (duree(C6.palettes) <= 60 ? 'oui' : 'non') }] },
    { id: 'retard', libelle: 'Le retard', titre: 'Un camion de surgelés en retard', sousTitre: 'Le quai 6 est pris jusqu’à 10 h.',
      objet: 'Un retard', pieces: ['zones'], documents: ['zones'],
      message: 'Il est 9 h 40 : un camion de surgelés arrive avec deux heures de retard. Le quai 6, le seul quai des surgelés, est pris jusqu’à 10 h. Que fais-tu ?',
      blocs: [{ type: 'choix', id: 'retard', lib: 'Le camion de surgelés en retard', colonne: true, manque: 'ta décision', choix: RETARD }],
      jalons: [{ id: 'retard', titre: 'Le camion en retard', groupe: 'Le retard', poids: 1.5, attendu: RETARD[0].lib, juste: (v) => v.retard === 'attendre' }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ce que je dois savoir du planning de lundi.',
    lignes: (prenom) => [SALUT('Fatou'),
      { id: 'decale', choix: ['Le glacier (C3) et la laiterie (C5) passent à 7 h : leurs quais sont déjà pris à 6 h.', 'Tous les camions passent à 6 h, comme demandé.', 'Le glacier (C3) passe à 9 h : il est arrivé le dernier.'], juste: 0 },
      { id: 'eau', choix: [`Le camion d’eau demande ${duree(C6.palettes)} minutes : il dépasse son créneau, il faut le prévoir.`, 'Le camion d’eau se décharge en 26 minutes.', 'Le camion d’eau tient largement dans son créneau.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['La zone de six camions.', 'Le créneau de chacun.', 'La durée d’un déchargement.', 'Un camion en retard.', 'Réponds à Fatou, une phrase par ligne.'],
  fin: 'Merci {prenom}. La semaine prochaine, tu découvres le service transport avec Mehdi.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
