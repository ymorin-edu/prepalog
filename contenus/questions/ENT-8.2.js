// Les questions d'ENT-8.2 — Action, ma prise de poste à la réception (brief `docs/briefs/ENT-8.2-action-prise-de-poste.md` §4 bis et §4 ter,
// choix de Tristan du 15/10/2026 à 19 h 16). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Samia, cheffe d'équipe à la réception (la tutrice).
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions de Samia ») :
// - `consignes-securite` (F, 1 point, tout de suite) : à l'envoi de la fiche « Avant d'ouvrir le camion ». Éco-droit appliqué au cas :
//   C. trav. L4111-5 (le stagiaire est un travailleur pour la santé et la sécurité) et L4141-1 (l'employeur informe des risques).
// - `retard-havre` (H, 1,5 point, AU BILAN) : à la première pose sur le planning des quais (elle toucherait le jalon « rendre compte »).
// - `qui-doit` (I, 1,5 point, tout de suite) : au choix de la 1re ligne de la fiche des documents. Énoncé CALCULÉ sur la commande TIRÉE de
//   l'élève (N et k : les mêmes que sur SES documents). Éco-droit : C. civ. 1603 et 1604 (le vendeur doit délivrer ce qui est commandé).
// - `pourquoi-rendre-compte` (K, réflexion, au bilan) : au premier choix de la ligne « fin » du compte rendu.
// Le panneau d'une question n'affiche pas de document : « Le droit » est joint au message de Samia de l'étape 4 et cité dans F et I.
//
// AVANT DE COMMENCER : banque de 10 notions NON notées, 4 tirées par élève (3 de préparation, 1 image). Le transpalette de la photo est
// MANUEL (aucune photo libre d'un transpalette électrique) : la question devient « Comment s'appelle cet engin ? → un transpalette ». Le
// niveleur : la photo du quai intérieur déjà au dépôt (Pexels 1267327, `contenus/smoby/LISEZMOI.md`), le kit iso (`core/iso.js`) ne
// fournissant pas d'image fichier.
//
// Ce fichier n'importe RIEN de `contenus/action-ent82.js` (qui l'importe : un cycle casserait le chargement quand ce fichier est lu seul,
// bloc `questions`) : les quantités de I sont lues dans le tirage rangé, la commande témoin (960 / 48) recopiée de `DEFAUT` — un cas du bloc
// `action` vérifie que l'énoncé et les documents disent les mêmes nombres.

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, PHOTOS } from '../action.js';

const GROUPE = 'Les questions de Samia';
const img = (id, court, titre, src, alt, credit) => ({ id, court, titre, type: 'images', images: [{ src, alt, credit }] });

// I : les quantités de la commande de l'élève (sur base vide : la commande témoin, `DEFAUT.valeurs` de `contenus/action-ent82.js`).
const n = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const quantites = (db) => {
  const T = db && db.tirages && db.tirages['action-prise-de-poste'];
  const V = (T && T.valeurs) || { N: 960, k: 48 };
  return { N: n(V.N), livre: n(V.N - V.k), k: n(V.k) };
};

export const QUESTIONS = {
  id: 'action-prise-de-poste',
  part: 4,
  personnes: { samia: EQUIPE.samia },
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Aujourd’hui, tu tiens le poste de réception. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['stage', 'planigramme-vide',
      img('photo-quai', 'Le quai', 'Un quai', PHOTOS.quai.src, PHOTOS.quai.alt, PHOTOS.quai.mention),
      img('photo-transpalette', 'Un engin', 'Un engin de la réception', PHOTOS.transpalette.src, 'Un engin rouge à deux fourches et à timon, posé dans une remorque vide',
        PHOTOS.transpalette.mention),
      img('photo-gilet', 'Un gilet', 'Un gilet', PHOTOS.gilet.src, PHOTOS.gilet.alt, PHOTOS.gilet.mention),
      img('photo-niveleur', 'Le bord du quai', 'Au bord du quai', './contenus/smoby/quai-interieur.jpg',
        'Une porte de quai ouverte sur l’intérieur d’une remorque ; au sol, une plaque bleue au bord du quai',
        'Photo d’un autre entrepôt — Pexels n° 1267327, marques effacées')],
    tirage: { preparation: 3, image: 1 },
    questions: ['tutrice', 'planigramme', 'creneau', 'quai-sert', 'zone-litiges', 'epi', 'rendre-compte',
      'img-transpalette', 'img-gilet', 'img-niveleur'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    { id: 'tutrice', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation', cle: true,
      enonce: 'Pendant ton stage, ta tutrice…',
      aide: 'Clique sur le mot [[tutrice]].',
      choix: [{ v: 'suit', lib: 't’accueille, te donne les consignes et suit ton travail' }, { v: 'paie', lib: 'te paie ton salaire' },
        { v: 'place', lib: 'fait ton travail à ta place' }],
      juste: 'suit',
      retour: 'Ta tutrice t’accueille, te dit quoi faire et regarde comment tu travailles. C’est à elle que tu rends compte.' },
    { id: 'planigramme', type: 'ouverture', de: 'samia', doc: 'planigramme-vide', rubrique: 'preparation', cle: true,
      enonce: 'Un planigramme de réception montre…',
      aide: 'Regarde le tableau à gauche : des quais, des heures. Clique sur le mot [[planigramme]].',
      choix: [{ v: 'camions', lib: 'quel camion arrive, à quelle heure, à quel quai' }, { v: 'salaires', lib: 'les salaires de l’équipe' },
        { v: 'rayons', lib: 'les produits en rayon du magasin' }],
      juste: 'camions',
      retour: 'Le planigramme dit, pour chaque quai, quel camion est attendu et à quelle heure.' },
    { id: 'creneau', type: 'ouverture', de: 'samia', doc: 'planigramme-vide', rubrique: 'preparation', cle: true,
      enonce: 'Un créneau de réception, c’est…',
      aide: 'Clique sur le mot [[créneau]].',
      choix: [{ v: 'reserve', lib: 'une heure et un quai réservés pour un camion' }, { v: 'pause', lib: 'une pause de l’équipe' },
        { v: 'parking', lib: 'une place de parking pour les voitures' }],
      juste: 'reserve',
      retour: 'Un créneau, c’est un rendez-vous : ce quai, à cette heure, pour ce camion.' },
    { id: 'quai-sert', type: 'ouverture', de: 'samia', doc: 'photo-quai', rubrique: 'preparation',
      enonce: 'Un quai sert à…',
      aide: 'Regarde la photo. Clique sur le mot [[quai]].',
      choix: [{ v: 'charger', lib: 'charger et décharger les camions' }, { v: 'stock', lib: 'ranger les palettes pour longtemps' },
        { v: 'garer', lib: 'garer les voitures' }],
      juste: 'charger',
      retour: 'Les camions reculent contre le quai : on les décharge (ou on les charge) par la porte.' },
    { id: 'zone-litiges', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation',
      enonce: 'La zone litiges sert à…',
      aide: 'Clique sur le mot [[zone litiges]].',
      choix: [{ v: 'cote', lib: 'mettre de côté la marchandise qui pose problème' }, { v: 'jeter', lib: 'jeter les cartons vides' },
        { v: 'epi', lib: 'ranger les EPI' }],
      juste: 'cote',
      retour: 'Ce qui pose problème attend en zone litiges : il n’entre pas en stock tant qu’on n’a pas décidé.' },
    { id: 'epi', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation',
      enonce: 'Les EPI, ce sont…',
      aide: 'Clique sur le mot [[EPI]].',
      choix: [{ v: 'protection', lib: 'les équipements de protection individuelle : chaussures de sécurité, gilet, gants' },
        { v: 'engins', lib: 'les engins de la réception' }, { v: 'documents', lib: 'les documents du camion' }],
      juste: 'protection',
      retour: 'Les EPI te protègent : chaussures de sécurité, gilet, gants. Sans eux, pas de quai.' },
    { id: 'rendre-compte', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation',
      enonce: '« Rendre compte », c’est…',
      aide: 'Clique sur les mots [[rendre compte]].',
      choix: [{ v: 'dire', lib: 'dire à son chef ce qu’on a fait ou vu' }, { v: 'colis', lib: 'rendre un colis au fournisseur' },
        { v: 'compter', lib: 'compter les palettes' }],
      juste: 'dire',
      retour: 'Rendre compte, c’est me dire ce que tu as fait ou vu, même quand tout va bien.' },
    // ── image (3 : l'élève en reçoit 1)
    { id: 'img-transpalette', type: 'ouverture', de: 'samia', doc: 'photo-transpalette', rubrique: 'image',
      enonce: 'Comment s’appelle cet engin ?',
      aide: 'Regarde ses deux fourches et son timon. Clique sur le mot [[transpalette]].',
      choix: [{ v: 'transpalette', lib: 'un transpalette' }, { v: 'frontal', lib: 'un chariot élévateur frontal' }, { v: 'gerbeur', lib: 'un gerbeur' }],
      juste: 'transpalette',
      retour: 'C’est un transpalette : il déplace une palette au sol. Celui-ci est manuel ; à la réception, on a aussi des transpalettes électriques, à recharger.' },
    { id: 'img-gilet', type: 'ouverture', de: 'samia', doc: 'photo-gilet', rubrique: 'image',
      enonce: 'Ce gilet sert à…',
      aide: 'Regarde la couleur et les bandes du gilet.',
      choix: [{ v: 'vu', lib: 'être bien vu des caristes et des chauffeurs' }, { v: 'chaud', lib: 'avoir chaud' }, { v: 'scanner', lib: 'ranger le scanner' }],
      juste: 'vu',
      retour: 'Le gilet haute visibilité te rend visible de loin : un cariste ou un chauffeur te voit avant de manœuvrer.' },
    { id: 'img-niveleur', type: 'ouverture', de: 'samia', doc: 'photo-niveleur', rubrique: 'image',
      enonce: 'La plaque bleue au bord du quai sert à…',
      aide: 'Regarde le bas de la photo, entre le quai et la remorque. Clique sur le mot [[niveleur]].',
      choix: [{ v: 'passer', lib: 'passer du quai au camion avec l’engin' }, { v: 'bloquer', lib: 'bloquer les roues du camion' },
        { v: 'peser', lib: 'peser la palette' }],
      juste: 'passer',
      retour: 'C’est le niveleur : il fait le pont entre le quai et le plancher du camion.' },
    // ── au fil du travail (notées, une ligne au bandeau)
    { id: 'consignes-securite', type: 'fil', de: 'samia', quand: apresGeste('fiche:avant-ouvrir:envoyer'), poids: 1, groupe: GROUPE,
      enonce: 'Tu es en stage chez Geodis. Qui doit te donner les consignes de sécurité du site ? (Lis le document « Le droit », joint à mon message.)',
      choix: [{ v: 'geodis', lib: 'Geodis, l’entreprise qui t’accueille' }, { v: 'lycee', lib: 'ton lycée' }, { v: 'action', lib: 'Action' },
        { v: 'personne', lib: 'personne : tu dois les connaître seul' }],
      juste: 'geodis',
      retour: 'C’est Geodis : pour la sécurité, un stagiaire est un travailleur comme les autres. L’entreprise doit t’informer des risques et te donner tes EPI.' },
    { id: 'retard-havre', type: 'fil', de: 'samia', quand: apresGeste('planning:action-quais:poser'), poids: 1.5, groupe: GROUPE, apres: 'bilan',
      enonce: 'Imagine : le camion du Havre a 2 heures de retard. Tu le dis à qui en premier ?',
      choix: [{ v: 'samia', lib: 'à moi, ta cheffe d’équipe' }, { v: 'chauffeur', lib: 'au chauffeur' }, { v: 'action', lib: 'à Action' },
        { v: 'personne', lib: 'à personne : il finira par arriver' }],
      juste: 'samia',
      retour: 'C’est à moi : je change l’ordre des camions et je préviens l’équipe.' },
    { id: 'qui-doit', type: 'fil', de: 'samia', quand: apresGeste('fiche:documents:commande'), poids: 1.5, groupe: GROUPE,
      enonce: 'Action a commandé des cartons au fournisseur. Le camion n’en apporte pas assez. Qui doit les cartons qui manquent ? (Lis le document « Le droit », joint à mon message.)',
      selon: (db) => { const Q = quantites(db);
        return { enonce: `Action a commandé ${Q.N} cartons au fournisseur. Le camion n’en apporte que ${Q.livre}. Qui doit les ${Q.k} cartons ? (Lis le document « Le droit », joint à mon message.)` }; },
      choix: [{ v: 'fournisseur', lib: 'le fournisseur : il s’est engagé à livrer ce qui est commandé' }, { v: 'geodis', lib: 'Geodis' },
        { v: 'chauffeur', lib: 'le chauffeur' }, { v: 'magasin', lib: 'le magasin de Nîmes' }],
      juste: 'fournisseur',
      retour: 'C’est le fournisseur : en vendant, il s’est engagé à livrer ce qu’Action a commandé. On le note sur le bon de livraison.' },
    { id: 'pourquoi-rendre-compte', type: 'fil', de: 'samia', quand: apresGeste('messagerie:phrase:fin'), reflexion: true, apres: 'bilan',
      enonce: 'Pourquoi je te demande de me prévenir, même quand tout va bien ?',
      choix: [{ v: 'organiser', lib: 'Pour organiser l’équipe et les camions qui suivent' }, { v: 'reagir', lib: 'Pour réagir vite si quelque chose change' },
        { v: 'repondre', lib: 'Parce que c’est moi qui réponds de la réception devant Action' }, { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les trois sont vrais : quand je sais ce qui se passe, j’organise, je réagis, et je peux répondre à Action.' },
  ],
};
