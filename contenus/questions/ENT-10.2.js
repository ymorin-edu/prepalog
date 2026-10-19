// Les questions d'ENT-10.2 — Transports Pelleau, mon premier jour dans l'entrepôt neuf (brief `docs/briefs/ENT-10.2-pelleau-premier-jour.md` §4 bis
// et §4 ter ; choix de Cowork sur délégation du 18/10/2026, à relire à l'écran par Tristan). Modifier ce fichier suffit : voir « Modifier les
// questions d'une séance » dans `activites/FICHE-SEANCE.md`. Erwan et ses phrases sont CONSTRUITS ; formulations de Cowork écrites telles quelles
// (sauf « jeudi » : aucun jour de la semaine).
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions d'Erwan ») :
// - `mineur-engin` (A, 1,5, tout de suite) : au premier essai de l'avertisseur (`inspection:pelleau-poste-102:essai`). ÉCO-DROIT appliqué au cas :
//   C. trav. D4153-27, R4153-40, R4153-51 (document « Le droit », joint au message de l'étape 2).
// - `qui-affiche` (B, 1, tout de suite) : au premier signalement (`inspection:pelleau-poste-102:signaler`). Énoncé CALCULÉ (`selon`) sur le défaut
//   tiré de l'élève (extincteur ou plan de circulation). C. trav. L4141-1 (l'employeur informe des risques).
// - `retard-loic` (C, 1,5, AU BILAN) : à la première pose sur le planning (`planning:pelleau-quais-102:poser`) ; proche du jalon « rendre compte ».
// QUESTION NON NOTÉE :
// - `pourquoi-controler` (D) : réflexion, au premier choix de la ligne « fin » du compte rendu (`messagerie:phrase:fin`).
// Écartées (brief) : « Que fait l'arrêt d'urgence ? » (donnerait un point de l'inspection), « droit de retrait » (gardée pour ENT-10.3).
//
// AVANT DE COMMENCER (§4 ter) : 9 questions NON notées, 4 tirées par élève (`tirage: { preparation: 3, image: 1 }` : 6 notions ≥ 2 × 3,
// 3 images ≥ 2 × 1). `cle: true` = question clé (★ du brief), à reprendre dans l'ouverture notée d'ENT-10.4. Écartées (brief) : `avertisseur` et
// `arret-urgence` (elles donneraient l'inspection).
// ÉCART AVEC LE BRIEF : aucune photo libre d'un transpalette électrique ni d'un extincteur n'est au dépôt : `img-tpe` et `img-extincteur` montrent
// des DESSINS du kit iso (documents `dessin-engin` et `dessin-extincteur` de la séance) ; `img-gilet` garde la photo d'Action (Pexels).
//
// Ce fichier n'importe RIEN de `contenus/pelleau-ent102.js` (qui l'importe : un cycle casserait le chargement quand ce fichier est lu seul,
// bloc `questions`) : le défaut de l'élève se lit dans les données pures (`contenus/pelleau-ent102-donnees.js`).

import { EQUIPE } from '../pelleau.js';
import { apresGeste } from '../../core/declencheurs.js';
import { SITE, defautDeBase } from '../pelleau-ent102-donnees.js';

const GROUPE = 'Les questions d’Erwan';
const GILET = { src: './contenus/images/action/gilets-epi.jpg', alt: 'Des gilets orange à bandes réfléchissantes et des casques bleus, accrochés côte à côte',
  credit: 'Photo d’un autre site — Carsten Ruthemann / Pexels' };

export const QUESTIONS = {
  id: 'pelleau-premier-jour',
  part: 4,
  personnes: { erwan: EQUIPE.erwan },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Aujourd’hui, tu prends ton poste dans l’entrepôt neuf. Avant de commencer, regarde le document à gauche et réponds à mes questions.',
    documents: ['stage-102', 'planning-vide', 'dessin-engin', 'dessin-extincteur',
      { id: 'photo-gilet', court: 'Un gilet', titre: 'Un gilet', type: 'images', images: [{ ...GILET, large: true }] }],
    tirage: { preparation: 3, image: 1 },
    questions: ['epi', 'prise-poste', 'planning-quais', 'allee-pietonne', 'rendre-compte', 'local-charge', 'img-tpe', 'img-extincteur', 'img-gilet'] },
  liste: [
    // ── ouverture : préparation (6 : l'élève en reçoit 3)
    { id: 'epi', type: 'ouverture', de: 'erwan', doc: 'stage-102', rubrique: 'preparation', cle: true,
      enonce: 'Les EPI, ce sont…',
      aide: 'Clique sur le mot [[EPI]].',
      choix: [{ v: 'protection', lib: 'les équipements de protection individuelle : chaussures de sécurité, gilet, gants' },
        { v: 'engins', lib: 'les engins de l’entrepôt' }, { v: 'documents', lib: 'les documents du camion' }],
      juste: 'protection',
      retour: 'Les EPI te protègent : chaussures de sécurité, gilet, gants. Sans eux, tu n’entres pas dans l’entrepôt.' },
    { id: 'prise-poste', type: 'ouverture', de: 'erwan', doc: 'stage-102', rubrique: 'preparation', cle: true,
      enonce: '« Prendre son poste », c’est…',
      aide: 'Relis la dernière phrase du document.',
      choix: [{ v: 'preparer', lib: 'se préparer et vérifier son matériel avant de commencer' }, { v: 'pause', lib: 'partir en pause' },
        { v: 'badge', lib: 'rendre son badge' }],
      juste: 'preparer',
      retour: 'Prendre son poste, c’est se préparer : tes EPI, ton poste, ton engin. Ensuite seulement, tu travailles.' },
    { id: 'planning-quais', type: 'ouverture', de: 'erwan', doc: 'planning-vide', rubrique: 'preparation', cle: true,
      enonce: 'Le planning des quais montre…',
      aide: 'Regarde le tableau à gauche : des quais, des heures. Clique sur les mots [[planning des quais]].',
      choix: [{ v: 'camions', lib: 'quel camion arrive, à quelle heure, à quel quai' }, { v: 'conges', lib: 'les congés de l’équipe' },
        { v: 'stock', lib: 'le stock du client' }],
      juste: 'camions',
      retour: 'Le planning des quais dit, pour chaque quai, quel camion est attendu et à quelle heure.' },
    { id: 'allee-pietonne', type: 'ouverture', de: 'erwan', doc: 'stage-102', rubrique: 'preparation',
      enonce: 'L’allée piétonne sert à…',
      aide: 'Clique sur les mots [[allée piétonne]].',
      choix: [{ v: 'marcher', lib: 'marcher à l’abri des engins' }, { v: 'garer', lib: 'garer les transpalettes' }, { v: 'poser', lib: 'poser les palettes' }],
      juste: 'marcher',
      retour: 'À pied, tu restes dans l’allée piétonne : les engins ne la prennent pas.' },
    { id: 'rendre-compte', type: 'ouverture', de: 'erwan', doc: 'stage-102', rubrique: 'preparation',
      enonce: '« Rendre compte », c’est…',
      aide: 'Clique sur les mots [[rendre compte]].',
      choix: [{ v: 'dire', lib: 'dire à son chef ce qu’on a fait ou vu' }, { v: 'colis', lib: 'rendre un colis' }, { v: 'compter', lib: 'compter les palettes' }],
      juste: 'dire',
      retour: 'Rendre compte, c’est me dire ce que tu as fait ou vu, même quand tout va bien.' },
    { id: 'local-charge', type: 'ouverture', de: 'erwan', doc: 'stage-102', rubrique: 'preparation',
      enonce: 'Le local de charge sert à…',
      aide: 'Clique sur les mots [[local de charge]].',
      choix: [{ v: 'recharger', lib: 'recharger les batteries des engins' }, { v: 'epi', lib: 'ranger les EPI' }, { v: 'camions', lib: 'garer les camions' }],
      juste: 'recharger',
      retour: 'Les transpalettes électriques passent la nuit au local de charge : le matin, leur batterie est pleine.' },
    // ── ouverture : image (3 : l'élève en reçoit 1)
    { id: 'img-tpe', type: 'ouverture', de: 'erwan', doc: 'dessin-engin', rubrique: 'image', cle: true,
      enonce: 'Comment s’appelle cet engin ?',
      aide: 'Regarde ses deux fourches, son capot et son long manche. Clique sur les mots [[transpalette électrique]].',
      choix: [{ v: 'tpe', lib: 'un transpalette électrique' }, { v: 'frontal', lib: 'un chariot élévateur frontal' }, { v: 'gerbeur', lib: 'un gerbeur' }],
      juste: 'tpe',
      retour: 'C’est un transpalette électrique : tu marches à côté et tu le guides avec le timon. C’est ton engin aujourd’hui.' },
    { id: 'img-extincteur', type: 'ouverture', de: 'erwan', doc: 'dessin-extincteur', rubrique: 'image',
      enonce: 'Où doit être l’extincteur ?',
      aide: 'Regarde où il est accroché. Clique sur le mot [[extincteur]].',
      choix: [{ v: 'support', lib: 'sur son support, visible et dégagé' }, { v: 'placard', lib: 'dans un placard fermé' },
        { v: 'camion', lib: 'dans le camion du chauffeur' }],
      juste: 'support',
      retour: 'L’extincteur reste sur son support, sous son panneau : en cas de feu, on le trouve tout de suite.' },
    { id: 'img-gilet', type: 'ouverture', de: 'erwan', doc: 'photo-gilet', rubrique: 'image',
      enonce: 'Ce gilet sert à…',
      aide: 'Regarde la couleur et les bandes du gilet.',
      choix: [{ v: 'vu', lib: 'être bien vu des caristes et des conducteurs' }, { v: 'chaud', lib: 'avoir chaud' }, { v: 'scanner', lib: 'ranger le scanner' }],
      juste: 'vu',
      retour: 'Le gilet haute visibilité te rend visible de loin : un cariste ou un conducteur te voit avant de manœuvrer.' },
    // ── au fil du travail (notées, une ligne au bandeau)
    { id: 'mineur-engin', type: 'fil', de: 'erwan', quand: apresGeste('inspection:pelleau-poste-102:essai'), poids: 1.5, groupe: GROUPE,
      enonce: 'Tu as 17 ans. As-tu le droit de conduire ce transpalette électrique ? (Lis « Le droit », joint à mon message.)',
      choix: [{ v: 'derogation', lib: 'Oui, si j’ai été formé, déclaré apte par le médecin, encadré, et que l’entreprise l’a déclaré' },
        { v: 'jamais', lib: 'Non, jamais avant 18 ans' }, { v: 'libre', lib: 'Oui, comme tout le monde' }, { v: 'yann', lib: 'Oui, si Yann est d’accord' }],
      juste: 'derogation',
      retour: 'Oui, mais seulement comme ça : formé, apte, encadré, et Pelleau l’a déclaré. Sans ça, tu ne conduis pas.' },
    { id: 'qui-affiche', type: 'fil', de: 'erwan', quand: apresGeste('inspection:pelleau-poste-102:signaler'), poids: 1, groupe: GROUPE,
      enonce: 'Il manque quelque chose au site. Qui doit s’en occuper ? (Lis « Le droit », joint à mon message.)',
      selon: (db) => ({ enonce: `${SITE[defautDeBase(db)].question} (Lis « Le droit », joint à mon message.)` }),
      choix: [{ v: 'employeur', lib: 'L’entreprise : moi, pour Pelleau' }, { v: 'toi', lib: 'Toi, le stagiaire' }, { v: 'lycee', lib: 'Le lycée' },
        { v: 'conducteur', lib: 'Le conducteur du camion' }],
      juste: 'employeur',
      retour: 'C’est à l’entreprise : elle doit informer et protéger. Toi, tu le vois et tu le dis.' },
    { id: 'retard-loic', type: 'fil', de: 'erwan', quand: apresGeste('planning:pelleau-quais-102:poser'), poids: 1.5, groupe: GROUPE, apres: 'bilan',
      enonce: 'Loïc appelle : il a une heure de retard. Tu le dis à qui en premier ?',
      choix: [{ v: 'erwan', lib: 'À Erwan, ton tuteur' }, { v: 'client', lib: 'À la Biscuiterie' }, { v: 'personne', lib: 'À personne' },
        { v: 'yann', lib: 'À Yann' }],
      juste: 'erwan',
      retour: 'À moi : je préviens Maëlys et je change l’organisation.' },
    { id: 'pourquoi-controler', type: 'fil', de: 'erwan', quand: apresGeste('messagerie:phrase:fin'), reflexion: true,
      enonce: 'Pourquoi contrôler un transpalette neuf ?',
      choix: [{ v: 'neuf', lib: 'Neuf ne veut pas dire chargé ou réglé' }, { v: 'abime', lib: 'Quelqu’un a pu l’abîmer hier' },
        { v: 'regle', lib: 'C’est la règle à chaque prise de poste' }, { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les trois : neuf ne veut pas dire chargé ou réglé, quelqu’un a pu l’abîmer, et c’est la règle à chaque prise de poste.' },
  ],
};
