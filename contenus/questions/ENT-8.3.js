// Les questions d’ENT-8.3 — Action, un autre site, un autre prestataire (brief `docs/briefs/ENT-8.3-action-autre-site.md`, §4 bis et §4 ter ;
// choix de Tristan du 15/10/2026 : L, N, P ; banque « Avant de commencer » validée le 15/10/2026). Modifier ce fichier suffit : voir
// « Modifier les questions d’une séance » dans `activites/FICHE-SEANCE.md`. Romain et ses phrases sont CONSTRUITS ; formulations de Cowork
// écrites telles quelles (à relire à l’écran).
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions de Romain »), toutes corrigées tout de suite :
// - `changer-prestataire` (L) : à l’envoi de « Qui est qui ? » (`fiche:qui:envoyer`), poids 1,5. Éco-droit appliqué : le contrat de
//   prestation (client / prestataire) ; le fait de Moissy-Cramayel (VÉRIFIÉ) est dans le document à gauche. Le piège « Geodis » est gardé
//   (décision du chef de chantier §6.2).
// - `comme-geodis` (N) : à l’envoi de « La chaîne de Romain » (`fiche:chaine:envoyer`), poids 1. Types d’organisation (C1.1.1).
// - `deux-planchers` (P) : au choix de la PREMIÈRE ligne de « Ce que je change » (`fiche:change:situation-1`), poids 1,5. Fait VÉRIFIÉ
//   (195 semi-remorques à deux planchers à l’époque XPO) ; ancrée sur le dessin à gauche ; ne donne aucune situation.
//
// AVANT DE COMMENCER (§4 ter) : 10 questions NON notées (l’élève ne le sait pas), 4 tirées (`tirage: { preparation: 3, image: 1 }` : 7 ≥ 2 × 3,
// 3 ≥ 2 × 1). Écartées par Tristan : la remorque (donnerait P), « même métier qu’à Ensuès » (donnerait N), le code postal de Labastide.

import { apresGeste } from '../../core/declencheurs.js';
import { PHOTOS } from '../action.js';
import { IMAGES_83 } from '../action-ent83-donnees.js';

const GROUPE = 'Les questions de Romain';
// Romain (construit) : déclaré ici et dans le contenu (`EQUIPE_83`), l’univers d’Action ne le connaît pas (son équipe est celle d’Ensuès).
export const ROMAIN = { nom: 'Romain', role: 'chef d’équipe à la réception (ton tuteur)', appel: 'Romain', registre: 'tu' };

const visuel = (id, court, im) => ({ id, court, titre: court, type: 'images',
  images: [{ src: im.src, alt: im.alt, credit: im.mention, large: true }] });

export const QUESTIONS = {
  id: 'action-autre-site',
  part: 4,
  personnes: { romain: ROMAIN },
  ouverture: { id: 'avant-de-commencer', de: 'romain', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour, et bienvenue chez GXO ! Avant de commencer, lis le document à gauche et réponds à mes questions.',
    documents: ['stage', visuel('photo-rayon', 'Un magasin', PHOTOS.rayon), visuel('photo-palette', 'Une palette', PHOTOS.palette),
      visuel('photo-quai', 'Des quais', IMAGES_83.quaiNumero), visuel('dessin-rassemblement', 'Un panneau', IMAGES_83.rassemblement)],
    tirage: { preparation: 3, image: 1 },
    questions: ['prestataire', 'tuteur', 'ouverture', 'etiquette-palette', 'nouveautes', 'code-postal', 'client-prestataire',
      'img-quai-numero', 'img-rassemblement', 'img-palette-filmee'] },
  liste: [
    // ── ouverture : préparation (7 : l’élève en reçoit 3)
    { id: 'prestataire', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: 'Une entreprise qui fait la logistique pour une autre, c’est…',
      aide: 'Le mot [[prestataire logistique]] est expliqué.',
      choix: [{ v: 'prestataire', lib: 'un prestataire logistique' }, { v: 'fournisseur', lib: 'un fournisseur' }, { v: 'client', lib: 'un client' }],
      juste: 'prestataire',
      retour: 'Un prestataire logistique : GXO fait tourner l’entrepôt, les produits restent à Action.' },
    { id: 'tuteur', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: 'Ton tuteur de stage, c’est…',
      aide: 'Le mot [[tuteur]] est expliqué.',
      choix: [{ v: 'entreprise', lib: 'la personne de l’entreprise qui te guide' }, { v: 'prof', lib: 'ton professeur' },
        { v: 'directeur', lib: 'le directeur d’Action' }],
      juste: 'entreprise',
      retour: 'C’est moi : je te donne les consignes et je suis ton travail pendant le stage.' },
    { id: 'ouverture', type: 'ouverture', de: 'romain', doc: 'photo-rayon', rubrique: 'preparation',
      enonce: 'Avant qu’un nouveau magasin ouvre, il faut…',
      choix: [{ v: 'remplir', lib: 'le remplir avec des produits livrés par l’entrepôt' }, { v: 'attendre', lib: 'attendre les clients' },
        { v: 'fabriquer', lib: 'fabriquer les produits' }],
      juste: 'remplir',
      retour: 'Des rayons vides, ça ne se vend pas : l’entrepôt livre tout avant l’ouverture.' },
    { id: 'etiquette-palette', type: 'ouverture', de: 'romain', doc: 'photo-palette', rubrique: 'preparation',
      enonce: 'L’étiquette sur une palette sert à savoir…',
      choix: [{ v: 'magasin', lib: 'à quel magasin elle va' }, { v: 'filmee', lib: 'qui l’a filmée' }, { v: 'prix', lib: 'combien elle coûte' }],
      juste: 'magasin',
      retour: 'L’étiquette dit où va la palette : sans elle, on ne sait pas dans quel camion la mettre.' },
    { id: 'nouveautes', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: 'Chez Action, chaque semaine…',
      choix: [{ v: 'nouveaux', lib: 'environ 150 nouveaux produits arrivent' }, { v: 'rien', lib: 'rien ne change' },
        { v: 'fermer', lib: 'tous les magasins ferment' }],
      juste: 'nouveaux',
      retour: 'Environ 150 nouveautés par semaine : à l’entrepôt, il faut leur trouver une place.' },
    { id: 'code-postal', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: 'Lyon 69003 : quel département ?',
      aide: 'Regarde les deux premiers chiffres du code postal.',
      choix: [{ v: 'debut', lib: '69' }, { v: 'fin', lib: '03' }, { v: 'trois', lib: '690' }],
      juste: 'debut',
      retour: 'Les deux premiers chiffres du code postal donnent le département : 69, le Rhône.' },
    { id: 'client-prestataire', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: 'GXO travaille pour Action. Pour GXO, Action est…',
      choix: [{ v: 'client', lib: 'un client' }, { v: 'concurrent', lib: 'un concurrent' }, { v: 'salarie', lib: 'un salarié' }],
      juste: 'client',
      retour: 'Un client : Action paie GXO pour stocker et préparer ses commandes.' },
    // ── ouverture : images (3 : l’élève en reçoit 1)
    { id: 'img-quai-numero', type: 'ouverture', de: 'romain', doc: 'photo-quai', rubrique: 'image',
      enonce: 'La plaque au-dessus de chaque porte (B56, B57…) sert à…',
      choix: [{ v: 'quai', lib: 'savoir à quel quai le camion doit se mettre' }, { v: 'compter', lib: 'compter les camions' },
        { v: 'ranger', lib: 'ranger les palettes' }],
      juste: 'quai',
      retour: 'Chaque porte a son numéro : le chauffeur sait où se mettre à quai.' },
    { id: 'img-rassemblement', type: 'ouverture', de: 'romain', doc: 'dessin-rassemblement', rubrique: 'image',
      enonce: 'Ce panneau montre…',
      choix: [{ v: 'rassemblement', lib: 'le point de rassemblement, où aller quand l’alarme sonne' },
        { v: 'sortie', lib: 'la sortie des camions' }, { v: 'vestiaire', lib: 'le vestiaire' }],
      juste: 'rassemblement',
      retour: 'Quand l’alarme sonne, tout le monde va au point de rassemblement : on compte qui est sorti.' },
    { id: 'img-palette-filmee', type: 'ouverture', de: 'romain', doc: 'photo-palette', rubrique: 'image',
      enonce: 'Pourquoi filme-t-on une palette ?',
      aide: 'Le mot [[filmer]] est expliqué.',
      choix: [{ v: 'tenir', lib: 'pour que les cartons ne tombent pas pendant le transport' }, { v: 'decorer', lib: 'pour la décorer' },
        { v: 'peser', lib: 'pour la peser' }],
      juste: 'tenir',
      retour: 'Le film tient les cartons ensemble : rien ne tombe dans le camion.' },
    // ── au fil du travail
    { id: 'changer-prestataire', type: 'fil', de: 'romain', quand: apresGeste('fiche:qui:envoyer'), poids: 1.5, groupe: GROUPE,
      enonce: 'Imagine : GXO livre mal les magasins pendant des mois. Que peut faire Action ?',
      choix: [{ v: 'changer', lib: 'Choisir un autre prestataire à la fin du contrat, comme à Moissy-Cramayel' },
        { v: 'fermer', lib: 'Fermer ses magasins' }, { v: 'rien', lib: 'Rien : GXO appartient à Action' },
        { v: 'geodis', lib: 'Demander à Geodis de diriger GXO' }],
      juste: 'changer',
      retour: 'Oui : Action est le client de GXO. Si le travail est mal fait, Action peut choisir un autre prestataire, comme à Moissy-Cramayel.' },
    { id: 'comme-geodis', type: 'fil', de: 'romain', quand: apresGeste('fiche:chaine:envoyer'), poids: 1, groupe: GROUPE,
      enonce: 'Je dis souvent : « ici, c’est comme chez Geodis à Ensuès ». Qu’est-ce qui est pareil ?',
      choix: [{ v: 'metier', lib: 'Les deux stockent et préparent les commandes pour Action' },
        { v: 'meme', lib: 'C’est la même entreprise' }, { v: 'patron', lib: 'C’est le même patron' }, { v: 'fabrique', lib: 'Ils fabriquent les produits' }],
      juste: 'metier',
      retour: 'C’est le même métier : on stocke et on prépare pour Action. Mais ce sont deux entreprises différentes.' },
    { id: 'deux-planchers', type: 'fil', de: 'romain', quand: apresGeste('fiche:change:situation-1'), poids: 1.5, groupe: GROUPE,
      enonce: 'Regarde le camion à gauche : il a deux planchers. À quoi ça sert ?',
      choix: [{ v: 'plus', lib: 'Mettre plus de palettes dans un camion, donc faire moins de trajets' },
        { v: 'solide', lib: 'Le rendre plus solide' }, { v: 'separer', lib: 'Séparer deux magasins' }],
      juste: 'plus',
      retour: 'Deux planchers, c’est presque deux fois plus de palettes par voyage : moins de camions sur la route.' },
  ],
};
