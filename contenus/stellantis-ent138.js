// ENT-13.8 — Stellantis Sochaux, « le camion en retard » : ENTRAÎNEMENT avec ERREUR INDUITE, C2.3 (et C3.4 : qui prévenir, quoi décider),
// Terminale. La matinée commence tout de suite ; à 6 h 20, Karim annonce que le camion de planches de bord (trois racks seulement au
// transstockeur) arrivera vers 7 h 15 au lieu de 6 h 30 : l'élève calcule l'heure d'arrêt sur SON bord de ligne, les voitures perdues si l'on
// attend, et décide. Puis la note de Julien sur l'arrêt d'hier (deux erreurs : des minutes comptées en heures, une cause fausse).
// Brief : `docs/briefs/ENT-13.8-stellantis-camion-en-retard.md`. Écart au brief : le compte rendu va à Karim (la fabrique n'écrit qu'au tuteur) ;
// il dit ce qui a été fait pour Sandrine. Univers : `contenus/stellantis.js` ; données : `contenus/stellantis-ligne.js` ; questions : `contenus/questions/ENT-13.8.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : la matinée 10 (voitures 2, sans arrêt 2, robots bien remplis 1, heure d'arrêt 2,
// voitures perdues 1,5, décision 1,5) · la note de Julien 4 (erreurs 2, heures 2) · compte rendu 2 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { hhmm, minutesDe } from '../core/types/ligne.js';
import { U, SALUT, FIN, DOC_KANBAN, DOC_LIGNE, DOC_NOTE, DOC_DROIT, TITRES_LIGNE, ligne138, matineeDe, LIGNE_DECISION, blocsNote, jalonsNote } from './stellantis-ligne.js';
import { QUESTIONS } from './questions/ENT-13.8.js';

export * from './stellantis.js';
export { CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM, baseDeDepart } from './stellantis-ligne.js';

const ID = 'stellantis-camion-en-retard';
// L'heure d'arrêt de SA matinée (calculée à l'instant du message), et deux heures fausses (± 10 minutes).
const ligneHeure = (D, R) => {
  if (!R || R.heureJuste == null) return { id: 'heure', choix: ['J’ai calculé l’heure où la ligne aurait manqué de planches de bord.', 'Je n’ai rien calculé.', 'J’ai calculé l’heure d’arrivée du camion.'], juste: 0 };
  const h = (d) => hhmm(minutesDe(D.debut) + R.heureJuste + d);
  const p = (x) => `Sans rien faire, la ligne aurait manqué de planches de bord à ${x}.`;
  return { id: 'heure', choix: [p(h(0)), p(h(10)), p(h(-10))], juste: 0 };
};
const S = seanceFiches(U, {
  id: ID, prefixe: '138', titre: 'Le camion en retard', exercice: 'Temps 2 : le bord de ligne, le camion en retard',
  documents: [DOC_LIGNE, DOC_KANBAN, DOC_NOTE, DOC_DROIT],
  pas: [
    { id: 'note', libelle: 'La note de Julien', titre: 'La note de Julien', sousTitre: 'La note est dans « La note ». Attention : tout n’y est pas juste.',
      objet: 'La note de Julien sur hier', pieces: ['note-julien'], documents: ['note-julien'],
      message: 'Merci {prenom}, belle matinée. Julien, de l’équipe d’après-midi, m’a laissé une note sur l’arrêt d’hier, et je dois la transmettre à Sandrine.\n\n'
        + 'Relis-la avant : coche ce qui est faux, et corrige le temps de travail perdu.',
      blocs: blocsNote(), jalons: jalonsNote({ erreurs: 2, heures: 2, groupe: 'La note de Julien' }) },
  ],
  ligne: { apres: -1, decl: ligne138, poids: { voitures: 2, arret: 2, groupes: 1, heure: 2, perdues: 1.5, decision: 1.5 }, titres: TITRES_LIGNE,
    groupes: { heure: 'Le camion en retard', perdues: 'Le camion en retard', decision: 'Le camion en retard' }, groupe: 'La matinée', libelle: 'Bord de ligne',
    objet: 'La matinée de jeudi', pieces: ['postes-ligne'],
    message: 'Bonjour {prenom}. Ouvre « Bord de ligne » dans le menu : de 6 h à 7 h 30, tu tiens le bord de ligne, comme hier.\n\n'
      + 'Attention : il ne reste que trois racks de planches de bord au transstockeur. Le camion de l’équipementier doit en livrer à 6 h 30.' },
  compteRendu: { objet: 'Ton compte rendu', poids: 2, message: 'Merci {prenom}. Écris-moi ce que je dis à Sandrine, la cheffe d’atelier du montage.',
    lignes: (prenom, db) => { const { D, R } = matineeDe(ligne138, ID, db); return [SALUT,
      ligneHeure(D, R),
      LIGNE_DECISION,
      { id: 'note', choix: ['La note de Julien se trompe : 28 minutes × 1 200 personnes, c’est 560 heures, et la cause est le camion en retard.',
        'La note de Julien est juste : 33 600 heures perdues à cause du cariste.', 'La note de Julien se trompe : 28 × 1 200, c’est 33 600 jours perdus.'], juste: 0 },
      FIN(prenom)]; } },
  accueil: ['La matinée, avec le camion de l’équipementier.', 'La note de Julien : ce qui est faux.', 'Réponds à Karim, une phrase par ligne.'],
  fin: 'Merci {prenom}. Je transmets à Sandrine. Demain, c’est l’évaluation : une matinée seul(e), sans bilan.',
  questions: QUESTIONS,
});
export const { FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
export { ID };
