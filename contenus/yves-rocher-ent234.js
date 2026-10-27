// ENT-23.4 — Yves Rocher, « la réclamation de Vannes » : GUIDAGE de C2.1 (répondre à la demande des clients internes et/ou externes), 2de Bac Pro.
// Avec Inès (relation boutiques) : ce qu'on fait d'abord, une décision par article réclamé (renvoyer, remplacer, expliquer), le jour où partent les
// articles manquants, puis la réponse à la boutique, en vouvoyant.
// Univers : `contenus/yves-rocher.js` ; données : `contenus/yves-rocher-donnees.js` ; questions : `contenus/questions/ENT-23.4.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : vérifier d'abord 1,5 · décider 6 (2 × 3) · le jour de la livraison 1,5 ·
// la réponse à la boutique 7 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U_BOUTIQUES, SALUT_BOUTIQUE, FIN_BOUTIQUE } from './yves-rocher-commun.js';
import { DOC_SITE, DOC_REPONDRE, DOC_TOURNEES, docReclamation, blocsReclam, jalonsReclam, CHOIX_JOURS } from './yves-rocher.js';
import { RECLAM234, D_ABORD, prochaine } from './yves-rocher-donnees.js';
import { QUESTIONS } from './questions/ENT-23.4.js';

export * from './yves-rocher.js';

const R = RECLAM234;
const get = () => R;
const JOUR = prochaine(R.boutique, R.jour);

const S = seanceFiches(U_BOUTIQUES, {
  id: 'yves-rocher-reclamation', prefixe: '234', titre: 'La réclamation de Vannes', exercice: 'Séance 4 : la réclamation de Vannes',
  documents: [DOC_SITE, DOC_REPONDRE, DOC_TOURNEES, docReclamation(get)],
  pas: [
    { id: 'abord', libelle: 'D’abord', titre: 'Avant de répondre', sousTitre: 'Une boutique n’est pas contente. Que fais-tu d’abord ?',
      objet: 'Une réclamation', pieces: ['reclamation', 'repondre'], documents: ['reclamation', 'repondre'],
      message: 'Bonjour {prenom} ! Aujourd’hui, tu es avec moi au service des boutiques. La boutique de Vannes nous écrit : lis sa réclamation et « Répondre à une boutique ». Que fais-tu d’abord ?',
      blocs: [{ type: 'choix', id: 'abord', lib: 'D’abord…', colonne: true, manque: 'ce que tu fais d’abord', choix: D_ABORD }],
      jalons: [{ id: 'abord', titre: 'Vérifier avant de répondre', groupe: 'Vérifier', poids: 1.5, attendu: D_ABORD.find((x) => x.v === 'comparer').lib, juste: (v) => v.abord === 'comparer' }] },
    { id: 'decider', libelle: 'Décider', titre: 'Article par article', sousTitre: 'Compare la réclamation et le bon de préparation.',
      objet: 'Les trois articles', pieces: ['reclamation'], documents: ['reclamation', 'repondre'],
      message: 'La boutique parle de trois articles. Pour chacun, compare avec le bon de préparation et décide ce que nous faisons.',
      blocs: blocsReclam(R), jalons: jalonsReclam(get, { poids: 2, groupe: 'Décider' }) },
    { id: 'quand', libelle: 'Quand ?', titre: 'Quand partent les articles ?', sousTitre: 'Les camions d’aujourd’hui sont partis.',
      objet: 'La livraison', pieces: ['tournees'], documents: ['tournees', 'reclamation'],
      message: `Nous sommes ${R.jour}. Les articles à envoyer partiront avec la prochaine livraison de Vannes : quel jour ?`,
      blocs: [{ type: 'liste', id: 'jour', lib: 'Les articles partent…', vide: 'Choisir…', manque: 'le jour', choix: CHOIX_JOURS }],
      jalons: [{ id: 'jour', titre: 'Le jour de la livraison', groupe: 'Quand ?', poids: 1.5, attendu: JOUR, juste: (v) => v.jour === JOUR }] },
  ],
  compteRendu: { objet: 'La réponse à Vannes', poids: 7, titre: 'La réponse à la boutique',
    message: 'Merci {prenom}. Écris maintenant la réponse à la boutique, une phrase par ligne : je la relis et je l’envoie. On vouvoie la boutique.',
    lignes: (prenom) => [SALUT_BOUTIQUE,
      { id: 'gel', choix: [`Il manquait bien 6 gels douche : nous vous les envoyons ${JOUR}, avec votre prochaine livraison.`,
        'Il manquait bien 6 gels douche : nous vous les envoyons aujourd’hui.', 'Nous avons bien mis 24 gels douche dans votre commande.'], juste: 0 },
      { id: 'edt', choix: ['Merci pour la photo : nous remplaçons les 2 eaux de toilette cassées.', 'Les eaux de toilette cassées ne sont pas de notre faute.',
        'Envoyez-nous les morceaux, nous verrons.'], juste: 0 },
      { id: 'rouge', choix: ['Les 12 rouges à lèvres n’étaient pas dans votre commande : vous pouvez les commander pour la prochaine livraison.',
        'Nous vous envoyons aussi les 12 rouges à lèvres manquants.', 'Vous vous êtes trompée, débrouillez-vous.'], juste: 0 },
      FIN_BOUTIQUE(prenom)] },
  accueil: ['Que fais-tu d’abord ?', 'Une décision pour chaque article.', 'Quel jour partent les articles ?', 'La réponse à la boutique, une phrase par ligne.'],
  fin: 'Merci {prenom}, j’envoie ta réponse à Vannes. La prochaine fois : les demandes urgentes de fin novembre.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
