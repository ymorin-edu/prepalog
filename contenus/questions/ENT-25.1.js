// Les questions d'ENT-25.1 — « Et si tu choisissais la Logistique ? », une réception chez Spartoo (semaine des filières de 2de).
// Choix de Tristan du 14/11/2026 : « je prends les questions au fil et ajoute des questions sur la fiche entreprise ». Modifier ce fichier
// suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Sarah (élève de Terminale).
//
// AUCUNE QUESTION NOTÉE (pas de `part`) : les 20 points restent ceux des jalons validés (carte 2, quai 9, rangement 3, saisie 6).
// Les questions au fil sont des RÉFLEXIONS : Sarah dit ce qu'elle en pense. Celles qui souffleraient un jalon encore à faire sont
// corrigées au bilan (`apres: 'bilan'`) : le calcul des paires (la saisie le juge) et la rotation (le rangement se reprend tant qu'on n'a pas fini).
//   1. `signer-tout-de-suite` : au déchargement — le chauffeur tend le bon : on signe ? (tout de suite)
//   2. `paires-annoncees` : à la palette validée — 12 cartons × 6 paires = 72 (au bilan)
//   3. `trois-jours` : à la clôture du quai — éco-droit, C. com. L133-3, 1er alinéa (tout de suite)
//   4. `pres-des-quais` : à la palette posée sur le plan — la rotation (au bilan)
//   5. `pourquoi-66` : à la saisie validée — on saisit ce qui est arrivé (tout de suite)
//   6. `apres-le-bac` : à la saisie validée — le Bac Pro Logistique (document « Le Bac Pro Logistique », Onisep)
// AVANT DE COMMENCER : 5 questions NON notées sur les documents « Spartoo » et « Accepter avec réserves » (corrigées à l'écran).
//
// Ce fichier importe les données du contenu (`contenus/vitrine-logistique.js`), qui ne l'importe pas : l'activité branche les deux.

import { apresGeste } from '../../core/declencheurs.js';
import { ID, QUAI_ID, ENTREPOT_ID, DOC_SPARTOO, DOC_RESERVES, saisieFaite } from '../vitrine-logistique.js';

export const QUESTIONS = {
  id: ID,
  personnes: { sarah: { nom: 'Sarah', role: 'élève de Terminale Bac Pro Logistique' } },
  ouverture: { id: 'avant-de-commencer', de: 'sarah', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Salut ! Je m’appelle Sarah, je suis en Terminale Bac Pro Logistique. Aujourd’hui, tu es réceptionnaire chez Spartoo. '
      + 'Avant de commencer, lis les deux documents à gauche et réponds à mes questions.',
    documents: [DOC_SPARTOO.id, DOC_RESERVES.id],
    questions: ['vend', 'surface', 'rangement', 'rfid', 'reserves'] },
  liste: [
    // ── Avant de commencer (non notées, corrigées à l'écran)
    { id: 'vend', type: 'ouverture', de: 'sarah', doc: DOC_SPARTOO.id,
      enonce: 'Que vend Spartoo ?',
      aide: 'Regarde le titre du document « Spartoo ».',
      choix: [{ v: 'chaussures', lib: 'Des chaussures, sur Internet' }, { v: 'magasins', lib: 'Des vêtements, dans des magasins de centre-ville' },
        { v: 'camions', lib: 'Des camions de livraison' }],
      juste: 'chaussures',
      retour: 'Spartoo vend des chaussures sur Internet. Pas de magasin : tout part de l’entrepôt, d’où l’importance de la logistique.' },
    { id: 'surface', type: 'ouverture', de: 'sarah', doc: DOC_SPARTOO.id,
      enonce: 'L’entrepôt Toolog fait 88 000 m². C’est à peu près…',
      aide: 'Regarde la ligne « L’entrepôt ».',
      choix: [{ v: 'foot', lib: 'une douzaine de terrains de football' }, { v: 'gymnase', lib: 'un gymnase' }, { v: 'classe', lib: 'une salle de classe' }],
      juste: 'foot',
      retour: 'Une douzaine de terrains de football, avec 2 millions de paires dedans. Sans emplacements bien rangés, on n’y retrouverait rien.' },
    { id: 'rangement', type: 'ouverture', de: 'sarah', doc: DOC_SPARTOO.id,
      enonce: 'Chez Toolog, les chaussures sont rangées…',
      aide: 'Regarde la ligne « Le rangement ».',
      choix: [{ v: 'categorie', lib: 'par catégorie (sport, ville…)' }, { v: 'marque', lib: 'par marque' }, { v: 'couleur', lib: 'par couleur' }],
      juste: 'categorie',
      retour: 'Par catégorie, pas par marque. Tu t’en serviras tout à l’heure pour ranger ta palette.' },
    { id: 'rfid', type: 'ouverture', de: 'sarah', doc: DOC_SPARTOO.id,
      enonce: 'La puce RFID collée sur chaque boîte sert à…',
      aide: 'Regarde la ligne « Le suivi ». Le mot [[RFID]] est expliqué.',
      choix: [{ v: 'ou', lib: 'savoir où est chaque paire' }, { v: 'antivol', lib: 'sonner si on vole la boîte en magasin' }, { v: 'prix', lib: 'afficher le prix' }],
      juste: 'ou',
      retour: 'Elle dit à l’ordinateur où est chaque paire, sans avoir à la chercher.' },
    { id: 'reserves', type: 'ouverture', de: 'sarah', doc: DOC_RESERVES.id,
      enonce: 'Il manque un carton sur la palette. « Accepter avec réserves », c’est…',
      aide: 'Lis le document « Accepter avec réserves ». Le mot [[avec réserves]] est expliqué.',
      choix: [{ v: 'garder-ecrire', lib: 'garder la marchandise, et écrire le problème sur le bon avant de signer' },
        { v: 'refuser', lib: 'renvoyer toute la palette dans le camion' }, { v: 'signer', lib: 'signer le bon sans rien écrire, et appeler le fournisseur demain' }],
      juste: 'garder-ecrire',
      retour: 'On garde ce qui est arrivé, mais on écrit le problème sur le bon, précisément, et le chauffeur signe. Sans cela, on ne pourra plus réclamer.' },

    // ── Au fil (réflexions de Sarah, non notées)
    { id: 'signer-tout-de-suite', type: 'fil', de: 'sarah', quand: apresGeste(`quai:${QUAI_ID}:decharger`), reflexion: true,
      enonce: 'Le chauffeur te tend le bon de livraison : « Tu me signes ça ? Je suis pressé. » Que fais-tu ?',
      choix: [{ v: 'controle', lib: 'Je contrôle la palette d’abord, je signe après' }, { v: 'signe', lib: 'Je signe tout de suite, il est pressé' },
        { v: 'chef', lib: 'Je signe, et je contrôlerai demain' }],
      retour: 'On contrôle d’abord. Le bon signé dit « j’ai tout reçu en bon état » : s’il manque un carton, c’est trop tard pour le dire.' },
    { id: 'paires-annoncees', type: 'fil', de: 'sarah', quand: apresGeste(`quai:${QUAI_ID}:valider`), reflexion: true, apres: 'bilan',
      enonce: 'Le bon annonce 12 cartons. Dans chaque carton, il y a 6 paires. Combien de paires sont annoncées ?',
      choix: [{ v: '72', lib: '72 paires' }, { v: '18', lib: '18 paires' }, { v: '66', lib: '66 paires' }],
      retour: '12 cartons × 6 paires = 72 paires annoncées. Le logiciel compte en paires : c’est ce chiffre qu’on saisit dans « annoncées ».' },
    { id: 'trois-jours', type: 'fil', de: 'sarah', quand: apresGeste(`quai:${QUAI_ID}:cloturer`), reflexion: true,
      enonce: 'Lis l’article L133-3 dans le document « Accepter avec réserves ». Pourquoi écrire les réserves sur le bon AVANT que le chauffeur reparte ?',
      choix: [{ v: 'preuve', lib: 'Parce que le transporteur signe : c’est la preuve, et ensuite la loi ne laisse que 3 jours pour protester' },
        { v: 'politesse', lib: 'Par politesse envers le chauffeur' }, { v: 'jamais', lib: 'Pour rien : on peut réclamer quand on veut, même un mois après' }],
      retour: 'Le chauffeur a signé tes réserves : c’est une preuve. Sans elles, la loi ne donne que 3 jours (et une lettre recommandée) pour protester contre le transporteur.' },
    { id: 'pres-des-quais', type: 'fil', de: 'sarah', quand: apresGeste(`entrepot:${ENTREPOT_ID}:poser`), reflexion: true, apres: 'bilan',
      enonce: 'Pourquoi range-t-on près des quais les produits qui partent souvent ?',
      choix: [{ v: 'chemin', lib: 'Pour faire moins de chemin quand on prépare les commandes' }, { v: 'joli', lib: 'Pour que l’entrepôt soit plus joli' },
        { v: 'lourd', lib: 'Parce qu’ils sont plus lourds' }],
      retour: 'Moins de chemin pour les préparateurs, donc des commandes plus rapides. C’est la rotation : A part souvent, près des quais ; C part rarement, au fond.' },
    { id: 'pourquoi-66', type: 'fil', de: 'sarah', quand: saisieFaite, reflexion: true,
      enonce: 'Pourquoi saisir 66 paires reçues, et pas les 72 du bon ?',
      choix: [{ v: 'reel', lib: 'Parce que le stock doit dire ce qu’il y a vraiment dans l’entrepôt' }, { v: 'erreur', lib: 'Parce que le bon de livraison est toujours faux' },
        { v: 'pareil', lib: 'Ça ne change rien, 66 ou 72' }],
      retour: 'Le stock doit dire ce qu’il y a vraiment : 11 cartons, donc 66 paires. Avec 72, le site vendrait 6 paires qui n’existent pas, et un client attendrait pour rien.' },
    { id: 'apres-le-bac', type: 'fil', de: 'sarah', quand: saisieFaite, reflexion: true,
      enonce: 'Lis le document « Le Bac Pro Logistique » (dans ta messagerie). Après le Bac Pro Logistique, on peut…',
      choix: [{ v: 'deux', lib: 'travailler, ou continuer ses études (par exemple en BTS)' }, { v: 'travailler', lib: 'seulement travailler' },
        { v: 'etudes', lib: 'seulement continuer ses études' }],
      retour: 'Les deux. Moi, je vise un BTS Gestion des transports et logistique associée. D’autres vont directement travailler comme préparateurs ou magasiniers caristes.' },
  ],
};
