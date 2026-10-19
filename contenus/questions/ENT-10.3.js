// Les questions d'ENT-10.3 — Transports Pelleau, « on commence quand même ? » (brief `docs/briefs/ENT-10.3-pelleau-on-commence-quand-meme.md` §4 bis et
// §4 ter ; choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une
// séance » dans `activites/FICHE-SEANCE.md`. Erwan et ses phrases sont CONSTRUITS.
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions d'Erwan ») :
// - `l4122` (A, 1,5, AU BILAN) : à la prise de poste (`inspection:pelleau-poste-103:fini`) ; ÉCO-DROIT appliqué au cas : C. trav. L4122-1 (document « Le
//   droit », joint au premier message). Corrigée au bilan : le retour soufflerait la bonne réplique de Yann (l'étape suivante). ÉCART : le brief la dit
//   « point d'étape » ; une question au fil `apres: 'bilan'` fait le même effet sans écran de transition (comme ENT-10.2).
// - `qui-repare` (B, 1, tout de suite) : à la première ligne de la fiche « Signalement ». Énoncé CALCULÉ (`selon`) sur le défaut tiré de l'élève.
// - `pourquoi-ecrire` (C, 1,5, tout de suite) : à l'envoi de la fiche.
// QUESTION NON NOTÉE :
// - `le-plus-dur` (D) : réflexion, au premier choix de la ligne « fin » du compte rendu (`messagerie:phrase:fin`).
//
// AVANT DE COMMENCER (§4 ter) : 8 questions NON notées, 4 tirées par élève (`tirage: { preparation: 3, image: 1 }` : 6 notions ≥ 2 × 3, 2 images ≥ 2 × 1).
// La banque d'ENT-10.2 (mêmes ids, mêmes `cle`) sauf `prise-poste` remplacée par `consigner` ; images `img-fourche` et `img-batterie` (dessins du kit iso :
// aucune photo libre au dépôt). `cle: true` = question clé (★ du brief), à reprendre dans l'ouverture notée d'ENT-10.4. Écartées : tout ce qui donnerait un
// défaut à trouver.
//
// Ce fichier n'importe RIEN de `contenus/pelleau-ent103.js` (qui l'importe : un cycle casserait le chargement quand ce fichier est lu seul, bloc
// `questions`) : le défaut de l'élève se lit dans les données pures (`contenus/pelleau-ent103-donnees.js`).

import { EQUIPE } from '../pelleau.js';
import { apresGeste } from '../../core/declencheurs.js';
import { DEFAUTS, defautDeBase, INSPECTION_ID, FICHES, LIGNES } from '../pelleau-ent103-donnees.js';

const GROUPE = 'Les questions d’Erwan';

export const QUESTIONS = {
  id: 'pelleau-on-commence-quand-meme',
  part: 4,
  personnes: { erwan: EQUIPE.erwan },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Demain matin, tu prends ton poste avec Yann. Avant de commencer, regarde le document à gauche et réponds à mes questions.',
    documents: ['stage-103', 'dessin-fourches-103', 'dessin-charge-103'],
    tirage: { preparation: 3, image: 1 },
    questions: ['epi', 'consigner', 'planning-quais', 'allee-pietonne', 'rendre-compte', 'local-charge', 'img-fourche', 'img-batterie'] },
  liste: [
    // ── ouverture : préparation (6 : l'élève en reçoit 3)
    { id: 'epi', type: 'ouverture', de: 'erwan', doc: 'stage-103', rubrique: 'preparation', cle: true,
      enonce: 'Les EPI, ce sont…',
      aide: 'Clique sur le mot [[EPI]].',
      choix: [{ v: 'protection', lib: 'les équipements de protection individuelle : chaussures de sécurité, gilet, gants' },
        { v: 'engins', lib: 'les engins de l’entrepôt' }, { v: 'documents', lib: 'les documents du camion' }],
      juste: 'protection',
      retour: 'Les EPI te protègent : chaussures de sécurité, gilet, gants. Sans eux, tu n’entres pas dans l’entrepôt.' },
    { id: 'consigner', type: 'ouverture', de: 'erwan', doc: 'stage-103', rubrique: 'preparation', cle: true,
      enonce: 'Mettre un engin de côté avec un mot « ne pas utiliser », c’est…',
      aide: 'Pense à la personne qui prend l’engin après toi.',
      choix: [{ v: 'eviter', lib: 'éviter qu’un autre s’en serve avant la réparation' }, { v: 'ranger', lib: 'le ranger pour la nuit' },
        { v: 'preter', lib: 'le prêter à un collègue' }],
      juste: 'eviter',
      retour: 'Le mot « ne pas utiliser » prévient les autres : personne ne monte sur un engin en défaut sans le savoir.' },
    { id: 'planning-quais', type: 'ouverture', de: 'erwan', doc: 'stage-103', rubrique: 'preparation', cle: true,
      enonce: 'Le planning des quais montre…',
      aide: 'Clique sur les mots [[planning des quais]].',
      choix: [{ v: 'camions', lib: 'quel camion arrive, à quelle heure, à quel quai' }, { v: 'conges', lib: 'les congés de l’équipe' },
        { v: 'stock', lib: 'le stock du client' }],
      juste: 'camions',
      retour: 'Le planning des quais dit, pour chaque quai, quel camion est attendu et à quelle heure.' },
    { id: 'allee-pietonne', type: 'ouverture', de: 'erwan', doc: 'stage-103', rubrique: 'preparation',
      enonce: 'L’allée piétonne sert à…',
      aide: 'Clique sur les mots [[allée piétonne]].',
      choix: [{ v: 'marcher', lib: 'marcher à l’abri des engins' }, { v: 'garer', lib: 'garer les transpalettes' }, { v: 'poser', lib: 'poser les palettes' }],
      juste: 'marcher',
      retour: 'À pied, tu restes dans l’allée piétonne : les engins ne la prennent pas.' },
    { id: 'rendre-compte', type: 'ouverture', de: 'erwan', doc: 'stage-103', rubrique: 'preparation',
      enonce: '« Rendre compte », c’est…',
      aide: 'Clique sur les mots [[rendre compte]].',
      choix: [{ v: 'dire', lib: 'dire à son chef ce qu’on a fait ou vu' }, { v: 'colis', lib: 'rendre un colis' }, { v: 'compter', lib: 'compter les palettes' }],
      juste: 'dire',
      retour: 'Rendre compte, c’est me dire ce que tu as fait ou vu, même quand tout va bien.' },
    { id: 'local-charge', type: 'ouverture', de: 'erwan', doc: 'stage-103', rubrique: 'preparation',
      enonce: 'Le local de charge sert à…',
      aide: 'Clique sur les mots [[local de charge]].',
      choix: [{ v: 'recharger', lib: 'recharger les batteries des engins' }, { v: 'epi', lib: 'ranger les EPI' }, { v: 'camions', lib: 'garer les camions' }],
      juste: 'recharger',
      retour: 'Les transpalettes électriques passent la nuit au local de charge : le matin, leur batterie est pleine.' },
    // ── ouverture : image (2 : l'élève en reçoit 1)
    { id: 'img-fourche', type: 'ouverture', de: 'erwan', doc: 'dessin-fourches-103', rubrique: 'image',
      enonce: 'Les fourches de cet engin servent à…',
      aide: 'Regarde ses deux fourches, sous la palette qu’il porterait.',
      choix: [{ v: 'soulever', lib: 'soulever la palette' }, { v: 'freiner', lib: 'freiner l’engin' }, { v: 'recharger', lib: 'recharger la batterie' }],
      juste: 'soulever',
      retour: 'Les fourches glissent sous la palette et la soulèvent : c’est pour cela qu’elles doivent être droites.' },
    { id: 'img-batterie', type: 'ouverture', de: 'erwan', doc: 'dessin-charge-103', rubrique: 'image',
      enonce: 'Le câble qui relie chaque engin à la borne du mur sert à…',
      aide: 'Regarde où va le câble : de l’engin à la borne fixée au mur.',
      choix: [{ v: 'recharger', lib: 'recharger la batterie' }, { v: 'commander', lib: 'commander l’engin à distance' }, { v: 'eclairer', lib: 'éclairer le local' }],
      juste: 'recharger',
      retour: 'Le câble recharge la batterie : un engin débranché le matin peut tomber en panne en route.' },
    // ── au fil du travail (notées, une ligne au bandeau)
    { id: 'l4122', type: 'fil', de: 'erwan', quand: apresGeste(`inspection:${INSPECTION_ID}:fini`), poids: 1.5, groupe: GROUPE, apres: 'bilan',
      enonce: 'Si un collègue te presse, que dit le Code du travail ? (Lis « Le droit », joint à mon message.)',
      choix: [{ v: 'chacun', lib: 'Chacun doit prendre soin de sa sécurité et de celle des autres' }, { v: 'ancien', lib: 'Le stagiaire obéit au plus ancien' },
        { v: 'chef', lib: 'Seul le chef répond de la sécurité' }, { v: 'tout', lib: 'On peut tout refuser, toujours' }],
      juste: 'chacun',
      retour: 'Chacun : toi aussi. Un engin en défaut, on ne s’en sert pas, même si on est pressé.' },
    { id: 'qui-repare', type: 'fil', de: 'erwan', quand: apresGeste(`fiche:${FICHES.signalement}:${LIGNES.quoi}`), poids: 1, groupe: GROUPE,
      enonce: 'Il y a un défaut dans ce que tu as vu. Qui s’en occupe ?',
      selon: (db) => ({ enonce: DEFAUTS[defautDeBase(db)].qui }),
      choix: [{ v: 'entreprise', lib: 'L’entreprise : Erwan s’en occupe' }, { v: 'toi', lib: 'Toi, le stagiaire' }, { v: 'yann', lib: 'Yann' },
        { v: 'fabricant', lib: 'Le fabricant vient tout seul' }],
      juste: 'entreprise',
      retour: 'L’entreprise : moi. Toi, tu le signales et tu ne t’en sers pas.' },
    { id: 'pourquoi-ecrire', type: 'fil', de: 'erwan', quand: apresGeste(`fiche:${FICHES.signalement}:envoyer`), poids: 1.5, groupe: GROUPE,
      enonce: 'Pourquoi l’écrire, et pas seulement le dire à Yann ?',
      choix: [{ v: 'trace', lib: 'Pour qu’Erwan le sache même absent, et que personne d’autre ne s’en serve' }, { v: 'note', lib: 'Pour avoir une bonne note' },
        { v: 'accuser', lib: 'Pour accuser Yann' }],
      juste: 'trace',
      retour: 'Écrit, ça reste : la personne de l’après-midi le lira aussi.' },
    { id: 'le-plus-dur', type: 'fil', de: 'erwan', quand: apresGeste('messagerie:phrase:fin'), reflexion: true,
      enonce: 'Ce matin, qu’est-ce qui était le plus dur ?',
      choix: [{ v: 'trouver', lib: 'Trouver ce qui n’allait pas' }, { v: 'dire-non', lib: 'Dire non à Yann' }, { v: 'quoi-faire', lib: 'Savoir quoi faire à la place' },
        { v: 'rien', lib: 'Rien' }],
      retour: 'Dire non à un collègue, c’est souvent le plus dur. Tu peux le dire gentiment : « je contrôle d’abord ».' },
  ],
};
