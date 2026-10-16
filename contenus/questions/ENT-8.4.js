// Les questions d'ENT-8.4 — Action, la semaine avant Noël (brief `docs/briefs/ENT-8.4-action-avant-noel.md` §4 bis et §4 ter, choix de Tristan du
// 15/10/2026 : Q, S, R ; banque « Avant de commencer » validée le même jour). Modifier ce fichier suffit : voir « Modifier les questions d'une
// séance » dans `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Romain, chef d'équipe à la réception de Labastide (le tuteur).
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions de Romain »), toutes corrigées tout de suite :
// - `heure-de-plus` (Q, 1,5 point) : à la première pose sur le planning des quais. Droit appliqué au cas : la convention-type nationale de PFMP
//   (DGESCO, version de septembre 2023, « Convention-type PFMP et annexes », éduscol, https://eduscol.education.fr/document/51185/download),
//   art. 8 et art. 10. Citations reprises du brief, VÉRIFIÉES par Cowork sur le PDF d'éduscol le 16/10/2026 (non relues par Claude Code).
//   Le texte est DANS l'énoncé (le panneau ne montre pas de document).
// - `qui-doit-livrer` (S, 1,5 point) : à l'envoi de la fiche des documents. Énoncé CALCULÉ sur la commande TIRÉE de l'élève (N et N − k : les
//   mêmes que sur SES documents), sans texte de loi (entraînement : reprise de la question I d'ENT-8.2).
// - `pourquoi-decembre` (R, 1 point) : au choix de la ligne « Quel camion Romain a-t-il mal placé ? » (geste `fiche:planigramme:trouve`).
//   Environnement économique (saisonnalité), ancré sur la grille pleine ; ne dit pas quel camion est mal placé.
//
// AVANT DE COMMENCER : banque de 10 notions NON notées, 4 tirées par élève (3 de préparation, 1 image). `img-transpalette` et `img-chariot` ne
// tombent jamais ensemble (une seule image tirée). Le niveleur : la photo du quai intérieur de Smoby (Pexels 1267327), comme en ENT-8.2.
//
// Ce fichier importe les DONNÉES de la séance (`contenus/action-ent84-donnees.js`), jamais le contenu (`contenus/action-ent84.js` l'importe).

import { apresGeste } from '../../core/declencheurs.js';
import { PHOTOS } from '../action.js';
import { ID, PLANNING_ID, EQUIPE_84, commandeDe, nombre } from '../action-ent84-donnees.js';

const GROUPE = 'Les questions de Romain';
const img = (id, court, titre, src, alt, credit) => ({ id, court, titre, type: 'images', images: [{ src, alt, credit }] });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { romain: EQUIPE_84.romain },
  ouverture: { id: 'avant-de-commencer', de: 'romain', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! C’est la semaine avant Noël, la réception est pleine. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['stage', 'planigramme-vide',
      img('photo-transpalette', 'Un engin', 'Un engin de la réception', PHOTOS.transpalette.src, 'Un engin rouge à deux fourches et à timon, posé dans une remorque vide',
        PHOTOS.transpalette.mention),
      img('photo-chariot', 'Un engin', 'Un engin de la réception', './contenus/images/action/chariot-elevateur.jpg',
        'Un engin orange avec un siège, un mât et deux fourches à l’avant, dans un entrepôt', 'Photo d’un autre entrepôt — Ani Set / Pexels'),
      img('photo-niveleur', 'Le bord du quai', 'Au bord du quai', './contenus/smoby/quai-interieur.jpg',
        'Une porte de quai ouverte sur l’intérieur d’une remorque ; au sol, une plaque bleue au bord du quai',
        'Photo d’un autre entrepôt — Pexels n° 1267327, marques effacées')],
    tirage: { preparation: 3, image: 1 },
    questions: ['creneau', 'zone-retours', 'rassemblement', 'planigramme', 'rendre-compte', 'cariste', 'consigne',
      'img-transpalette', 'img-chariot', 'img-niveleur'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    { id: 'creneau', type: 'ouverture', de: 'romain', doc: 'planigramme-vide', rubrique: 'preparation', cle: true,
      enonce: 'Un créneau de réception, c’est…',
      aide: 'Clique sur le mot [[créneau]].',
      choix: [{ v: 'reserve', lib: 'une heure réservée pour un camion à un quai' }, { v: 'pause', lib: 'une pause' }, { v: 'ferie', lib: 'un jour férié' }],
      juste: 'reserve',
      retour: 'Un créneau, c’est un rendez-vous : ce quai, à cette heure, pour ce camion.' },
    { id: 'zone-retours', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation', cle: true,
      enonce: 'La zone de retours sert à…',
      aide: 'Clique sur les mots [[zone de retours]].',
      choix: [{ v: 'magasins', lib: 'recevoir ce que les magasins renvoient' }, { v: 'epi', lib: 'ranger les EPI' }, { v: 'camions', lib: 'garer les camions' }],
      juste: 'magasins',
      retour: 'Les magasins renvoient des rolls, des palettes, des produits : on les pose en zone de retours avant de les trier.' },
    { id: 'rassemblement', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation', cle: true,
      enonce: 'Quand l’alarme sonne, tu vas…',
      aide: 'Clique sur les mots [[point de rassemblement]].',
      choix: [{ v: 'rassemblement', lib: 'au point de rassemblement' }, { v: 'poste', lib: 'à ton poste' }, { v: 'vestiaire', lib: 'au vestiaire' }],
      juste: 'rassemblement',
      retour: 'Au point de rassemblement, dehors : on y compte tout le monde.' },
    { id: 'planigramme', type: 'ouverture', de: 'romain', doc: 'planigramme-vide', rubrique: 'preparation',
      enonce: 'Un planigramme de réception montre…',
      aide: 'Regarde le tableau à gauche : des quais, des heures. Clique sur le mot [[planigramme]].',
      choix: [{ v: 'camions', lib: 'quel camion arrive, à quelle heure, à quel quai' }, { v: 'salaires', lib: 'les salaires' },
        { v: 'produits', lib: 'les produits du magasin' }],
      juste: 'camions',
      retour: 'Le planigramme dit, pour chaque quai, quel camion est attendu et à quelle heure.' },
    { id: 'rendre-compte', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: '« Rendre compte », c’est…',
      aide: 'Clique sur les mots [[rendre compte]].',
      choix: [{ v: 'dire', lib: 'dire à son chef ce qu’on a fait ou vu' }, { v: 'colis', lib: 'rendre un colis' }, { v: 'compter', lib: 'compter les palettes' }],
      juste: 'dire',
      retour: 'Rendre compte, c’est me dire ce que tu as fait ou vu, même quand tout va bien.' },
    { id: 'cariste', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: 'Un cariste…',
      aide: 'Clique sur le mot [[cariste]].',
      choix: [{ v: 'chariot', lib: 'conduit un chariot élévateur, avec son CACES' }, { v: 'camion', lib: 'conduit le camion' },
        { v: 'caisse', lib: 'tient la caisse du magasin' }],
      juste: 'chariot',
      retour: 'Le cariste conduit le chariot élévateur. Il lui faut son CACES : sans lui, il ne monte pas sur l’engin.' },
    { id: 'consigne', type: 'ouverture', de: 'romain', doc: 'stage', rubrique: 'preparation',
      enonce: 'Une consigne que tu ne comprends pas, tu…',
      aide: 'Que fait-on quand on n’est pas sûr ? Ton [[tuteur]] est là pour ça.',
      choix: [{ v: 'repeter', lib: 'la fais répéter par ton tuteur' }, { v: 'devine', lib: 'la devines' }, { v: 'ignore', lib: 'l’ignores' }],
      juste: 'repeter',
      retour: 'Tu me la fais répéter : mieux vaut une question qu’une erreur sur le quai.' },
    // ── image (3 : l'élève en reçoit 1)
    { id: 'img-transpalette', type: 'ouverture', de: 'romain', doc: 'photo-transpalette', rubrique: 'image',
      enonce: 'Comment s’appelle cet engin ?',
      aide: 'Regarde ses deux fourches et son timon. Clique sur le mot [[transpalette]].',
      choix: [{ v: 'transpalette', lib: 'un transpalette' }, { v: 'chariot', lib: 'un chariot élévateur' }, { v: 'gerbeur', lib: 'un gerbeur' }],
      juste: 'transpalette',
      retour: 'C’est un transpalette : il déplace une palette au sol. Les électriques se rechargent au local de charge.' },
    { id: 'img-chariot', type: 'ouverture', de: 'romain', doc: 'photo-chariot', rubrique: 'image',
      enonce: 'Comment s’appelle cet engin ?',
      aide: 'Regarde son siège, son mât et ses fourches. Clique sur le mot [[cariste]].',
      choix: [{ v: 'chariot', lib: 'un chariot élévateur' }, { v: 'transpalette', lib: 'un transpalette' }, { v: 'camion', lib: 'un camion' }],
      juste: 'chariot',
      retour: 'C’est un chariot élévateur : il lève les palettes. Seul un cariste avec son CACES le conduit.' },
    { id: 'img-niveleur', type: 'ouverture', de: 'romain', doc: 'photo-niveleur', rubrique: 'image',
      enonce: 'Cette plaque au bord du quai sert à…',
      aide: 'Regarde le bas de la photo, entre le quai et la remorque. Clique sur le mot [[niveleur]].',
      choix: [{ v: 'passer', lib: 'passer du quai au camion avec l’engin' }, { v: 'bloquer', lib: 'bloquer les roues' }, { v: 'peser', lib: 'peser la palette' }],
      juste: 'passer',
      retour: 'C’est le niveleur : il fait le pont entre le quai et le plancher du camion.' },
    // ── au fil du travail (notées, une ligne au bandeau, corrigées tout de suite)
    { id: 'heure-de-plus', type: 'fil', de: 'romain', quand: apresGeste(`planning:${PLANNING_ID}:poser`), poids: 1.5, groupe: GROUPE,
      enonce: 'Avec tous ces camions, je te demande de rester une heure de plus ce soir. Ta convention de stage dit : « tous les élèves sont soumis à la durée '
        + 'hebdomadaire légale » et, pour un mineur, « 8 heures par jour et 35 heures par semaine » au plus. Qui fixe la durée de ton travail en stage ?',
      choix: [{ v: 'convention', lib: 'ta convention de stage, qui fixe aussi des limites' }, { v: 'romain', lib: 'Romain, c’est lui qui décide' },
        { v: 'action', lib: 'Action, c’est son magasin' }, { v: 'personne', lib: 'personne : avant Noël, il n’y a pas de limite' }],
      juste: 'convention',
      retour: 'C’est ta convention : elle fixe tes horaires, avec des limites. Je ne peux pas te garder plus longtemps comme ça. Merci quand même !' },
    { id: 'qui-doit-livrer', type: 'fil', de: 'romain', quand: apresGeste('fiche:documents:envoyer'), poids: 1.5, groupe: GROUPE,
      enonce: 'Le bon de commande et le bon de livraison ne disent pas le même nombre de cartons. Ce que le fournisseur devait livrer est écrit sur…',
      selon: (db) => { const C = commandeDe(db);
        return { enonce: `Le bon de commande dit ${nombre(C.N)} cartons, le bon de livraison ${nombre(C.livre)}. Ce que le fournisseur devait livrer est écrit sur…`,
          retour: `Le bon de commande : c’est ce qu’Action a acheté. Le fournisseur doit les ${nombre(C.k)} cartons qui manquent.` }; },
      choix: [{ v: 'commande', lib: 'le bon de commande : c’est ce qu’il a promis en vendant' }, { v: 'bl', lib: 'le bon de livraison' },
        { v: 'lv', lib: 'la lettre de voiture' }],
      juste: 'commande',
      retour: 'Le bon de commande : c’est ce qu’Action a acheté. Le fournisseur doit les cartons qui manquent.' },
    { id: 'pourquoi-decembre', type: 'fil', de: 'romain', quand: apresGeste('fiche:planigramme:trouve'), poids: 1, groupe: GROUPE,
      enonce: 'Pourquoi y a-t-il tant de camions en décembre ?',
      choix: [{ v: 'noel', lib: 'avant Noël, les magasins vendent plus : il leur faut plus de produits' }, { v: 'temps', lib: 'les chauffeurs ont plus de temps' },
        { v: 'froid', lib: 'il fait froid, les camions roulent moins vite' }],
      juste: 'noel',
      retour: 'Avant Noël, les magasins vendent beaucoup plus : il faut les remplir, donc plus de camions.' },
  ],
};
