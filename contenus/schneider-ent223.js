// ENT-22.3 — Schneider Electric, « les camions du mardi » : ENTRAÎNEMENT de CAP-C1.3 (prendre en charge les opérations de réception), CAP OL.
// Seul(e) au quai avec Mehdi : le quai des quatre camions, un camion en avance sur un quai pris, quatre pré-contrôles (palette en moins, pas de
// scellé, camion absent du planigramme), les colis lourds, le chauffeur qui veut aider, puis le compte rendu à Nadia.
// Univers : `contenus/schneider.js` ; données : `contenus/schneider-donnees.js` ; questions : `contenus/questions/ENT-22.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les quais 3 (0,75 × 4) · le camion en avance 1 · pré-contrôle 5 (1,25 × 4) ·
// colis lourds 3 · le chauffeur 1 · compte rendu 3 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './schneider-commun.js';
import { DOC_SITE, DOC_PROTOCOLE, docPlanigramme, docPrecontrole, docColis, blocsPrecontrole, jalonsPrecontrole, blocLourds, jalonLourds } from './schneider.js';
import { PLAN223, QUAIS, SIT223, LOURDS223, AVANCE, CHAUFFEUR, nomDe, aAider } from './schneider-donnees.js';
import { QUESTIONS } from './questions/ENT-22.3.js';

export * from './schneider.js';

const J = { plan: PLAN223, mon: null };
const CHOIX_QUAIS = QUAIS.map((q) => ({ v: q, lib: q }));

const S = seanceFiches(U, {
  id: 'schneider-mardi', prefixe: '223', titre: 'Les camions du mardi', exercice: 'Séance 3 : les camions du mardi',
  documents: [DOC_SITE, DOC_PROTOCOLE, docPlanigramme(J, 'Le planigramme du mardi'), docPrecontrole(SIT223), docColis(LOURDS223)],
  pas: [
    { id: 'quais', libelle: 'Les quais', titre: 'Les quais du mardi', sousTitre: 'Pour chaque camion, le quai du planigramme.',
      objet: 'Les camions du mardi', pieces: ['planigramme'], documents: ['planigramme'],
      message: 'Bonjour {prenom}. Ce matin, tu tiens le quai avec Mehdi : je suis en réunion jusqu’à midi. Commence par le planigramme du mardi : à quel quai va chaque camion ?',
      blocs: PLAN223.map((c) => ({ type: 'liste', id: `quai-${c.id}`, lib: `${c.id} : ${c.de} (${c.heure.replace(':', ' h ')})`, vide: 'Choisir…', manque: `le quai du camion ${c.id}`, choix: CHOIX_QUAIS })),
      jalons: PLAN223.map((c) => ({ id: `quai-${c.id}`, titre: `Le quai du camion ${c.id}`, groupe: 'Les quais', poids: 0.75, attendu: c.quai, juste: (v) => v[`quai-${c.id}`] === c.quai })) },
    { id: 'avance', libelle: 'Un camion en avance', titre: 'Un camion en avance', sousTitre: 'Lis bien le planigramme.',
      objet: 'Un camion en avance', pieces: ['planigramme'], documents: ['planigramme'],
      message: 'Il est 7 h 40. Le camion C3 est déjà là, avec 1 h 20 d’avance. Son quai, Q1, est pris par le camion C2 qui décharge. Que fais-tu ?',
      blocs: [{ type: 'choix', id: 'avance', lib: 'Le camion C3 en avance, son quai pris', colonne: true, manque: 'ce que tu fais', choix: AVANCE }],
      jalons: [{ id: 'avance', titre: 'Le camion en avance', groupe: 'Un camion en avance', poids: 1, attendu: AVANCE[0].lib, juste: (v) => v.avance === 'nadia' }] },
    { id: 'precontrole', libelle: 'Le pré-contrôle', titre: 'Avant d’ouvrir les portes', sousTitre: 'Quatre camions. Pour chacun, que fais-tu ?',
      objet: 'Le pré-contrôle', pieces: ['precontrole'], documents: ['precontrole', 'protocole'],
      message: 'Quatre camions sont arrivés. Pour chacun, compare l’avis d’expédition et ce que tu vois, puis dis-moi ce que tu fais.',
      blocs: blocsPrecontrole(SIT223), jalons: jalonsPrecontrole(() => SIT223, { poids: 1.25, groupe: 'Le pré-contrôle' }) },
    { id: 'lourds', libelle: 'Les colis lourds', titre: 'Les colis à porter', sousTitre: 'Coche les colis qui se portent avec un exosquelette ou à deux.',
      objet: 'Les colis lourds', pieces: ['colis'], documents: ['colis', 'protocole'],
      message: 'Des colis se déchargent à la main. Coche ceux qui demandent l’exosquelette ou un collègue. Puis un chauffeur te pose une question.',
      blocs: [blocLourds(LOURDS223), { type: 'choix', id: 'chauffeur', lib: 'Un chauffeur veut t’aider à décharger avec ton transpalette. Tu lui dis…', colonne: true, manque: 'ta réponse au chauffeur', choix: CHAUFFEUR }],
      jalons: [jalonLourds(() => LOURDS223, { poids: 3, groupe: 'Les colis lourds' }),
        { id: 'chauffeur', titre: 'Le chauffeur qui veut aider', groupe: 'Les colis lourds', poids: 1, attendu: CHAUFFEUR[0].lib, juste: (v) => v.chauffeur === 'salle' }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Je sors de réunion : écris-moi ce qui s’est passé ce matin, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'manque', choix: ['Le camion C2 avait 17 palettes au lieu de 18 : j’ai déchargé et noté le problème pour les réserves.', 'Le camion C2 avait 17 palettes au lieu de 18 : je l’ai renvoyé.', 'Le camion C2 avait bien ses 18 palettes.'], juste: 0 },
      { id: 'scelle', choix: ['Le camion C3 n’avait pas de scellé : je n’ai pas ouvert, je t’ai appelée.', 'Le camion C3 n’avait pas de scellé : j’ai ouvert et déchargé.', 'Tous les camions avaient leur scellé.'], juste: 0 },
      { id: 'inconnu', choix: ['Un camion qui n’était pas sur le planigramme est arrivé : je t’ai appelée.', 'Un camion qui n’était pas sur le planigramme est arrivé : je l’ai déchargé au quai Q8 sans rien dire.', 'Tous les camions étaient sur le planigramme.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Le quai de chaque camion.', 'Un camion en avance : que fais-tu ?', 'Quatre pré-contrôles.', 'Les colis lourds et le chauffeur.', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine fois, tu contrôles une livraison ligne par ligne.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
export { aAider, nomDe };
