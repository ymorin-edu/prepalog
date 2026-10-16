// Les questions d’ENT-8.6 — Action, évaluation « ma prise de poste dans un nouveau site » (brief `docs/briefs/ENT-8.6-action-evaluation-prise-de-poste.md`,
// §4 bis et §4 ter ; questions de Cowork, décision du 16/10/2026 sur délégation de Tristan). Modifier ce fichier suffit : voir « Modifier les
// questions d’une séance » dans `activites/FICHE-SEANCE.md`.
//
// ÉVALUATION : AUCUNE question au fil. Seul l’écran « Avant de commencer » est NOTÉ (`part: 4`) : 13 questions clés reprises d’ENT-8.2 et
// d’ENT-8.4 (9 de préparation, 4 d’image), l’élève en reçoit 4 (`tirage: { preparation: 3, image: 1 }`) ; aucune aide, aucun mot cliquable,
// « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.
// « Le droit » (Code du travail L4111-5 et L4141-1, convention-type de PFMP art. 8 et 10) est lisible à gauche (`doc: 'droit'`).
//
// ÉCART au brief (le même qu’en ENT-8.5, compte rendu) : le moteur ne sait pas écrire le site de l’élève dans une question d’ouverture ni dans
// le nom de la personne. `k-consignes` dit donc « Tu es en stage dans cet entrepôt » et sa bonne réponse « l’entreprise qui t’accueille » (sans
// « {prestataire} ») ; la personne est « Ton tuteur » (Karim ou Sandrine dans les messages). Le site est écrit dans le document « Ton stage ».
// Écartées par Cowork (brief §4 ter) : « ce que le fournisseur devait livrer est écrit sur… » et le bon de livraison (elles donneraient une
// question de la fiche des documents).

import { PHOTOS } from '../action.js';
import { ID } from '../action-ent86-donnees.js';

// La personne qui pose les questions : le tuteur ou la tutrice du site (CONSTRUIT), nommé sans prénom (voir l’en-tête).
export const TUTEUR = { nom: 'Ton tuteur', role: 'chef d’équipe à la réception', appel: 'Ton tuteur', registre: 'tu' };

const img = (id, src, alt, credit) => ({ id, court: 'Une photo', titre: 'Une photo de la réception', type: 'images', images: [{ src, alt, credit, large: true }] });
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'tuteur', doc, rubrique, enonce, choix, juste, retour });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { tuteur: TUTEUR },
  ouverture: { id: 'avant-de-commencer', de: 'tuteur', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, réponds à mes questions, sans aide. Pour deux d’entre elles, lis « Le droit », à gauche.',
    documents: ['stage', 'droit', 'planigramme-vide',
      img('photo-transpalette', PHOTOS.transpalette.src, 'Un engin rouge à deux fourches et à timon, posé dans une remorque vide', PHOTOS.transpalette.mention),
      img('photo-chariot', './contenus/images/action/chariot-elevateur.jpg', 'Un engin orange avec un siège, un mât et deux fourches à l’avant, dans un entrepôt',
        'Photo d’un autre entrepôt — Ani Set / Pexels'),
      img('photo-niveleur', './contenus/smoby/quai-interieur.jpg', 'Une porte de quai ouverte sur l’intérieur d’une remorque ; au sol, une plaque bleue au bord du quai',
        'Photo d’un autre entrepôt — Pexels n° 1267327, marques effacées'),
      img('photo-gilet', PHOTOS.gilet.src, PHOTOS.gilet.alt, PHOTOS.gilet.mention)],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-planigramme', 'k-creneau', 'k-zone-litiges', 'k-zone-retours', 'k-rassemblement', 'k-epi', 'k-rendre-compte', 'k-consignes',
      'k-convention', 'k-img-transpalette', 'k-img-chariot', 'k-img-niveleur', 'k-img-gilet'] },
  liste: [
    // ── préparation (9 : l’élève en reçoit 3)
    q('k-planigramme', 'preparation', 'planigramme-vide', 'Un planigramme de réception montre…',
      [{ v: 'camions', lib: 'quel camion arrive, à quelle heure, à quel quai' }, { v: 'salaires', lib: 'les salaires de l’équipe' },
        { v: 'produits', lib: 'les produits du magasin' }], 'camions',
      'Le planigramme dit, pour chaque quai, quel camion est attendu et à quelle heure.'),
    q('k-creneau', 'preparation', 'planigramme-vide', 'Un créneau de réception, c’est…',
      [{ v: 'reserve', lib: 'une heure et un quai réservés pour un camion' }, { v: 'pause', lib: 'une pause' }, { v: 'parking', lib: 'une place de parking' }],
      'reserve', 'Un créneau, c’est un rendez-vous : ce quai, à cette heure, pour ce camion.'),
    q('k-zone-litiges', 'preparation', 'stage', 'La zone litiges sert à…',
      [{ v: 'cote', lib: 'mettre de côté la marchandise qui pose problème' }, { v: 'vides', lib: 'jeter les cartons vides' }, { v: 'epi', lib: 'ranger les EPI' }],
      'cote', 'On y met de côté ce qui pose problème, le temps de décider.'),
    q('k-zone-retours', 'preparation', 'stage', 'La zone de retours sert à…',
      [{ v: 'magasins', lib: 'recevoir ce que les magasins renvoient' }, { v: 'epi', lib: 'ranger les EPI' }, { v: 'camions', lib: 'garer les camions' }],
      'magasins', 'Les magasins renvoient des rolls, des palettes, des produits : on les pose en zone de retours avant de les trier.'),
    q('k-rassemblement', 'preparation', 'stage', 'Quand l’alarme sonne, tu vas…',
      [{ v: 'rassemblement', lib: 'au point de rassemblement' }, { v: 'poste', lib: 'à ton poste' }, { v: 'vestiaire', lib: 'au vestiaire' }],
      'rassemblement', 'Au point de rassemblement, dehors : on y compte tout le monde.'),
    q('k-epi', 'preparation', 'stage', 'Les EPI, ce sont…',
      [{ v: 'protection', lib: 'les équipements de protection individuelle : chaussures de sécurité, gilet, gants' },
        { v: 'engins', lib: 'les engins de la réception' }, { v: 'documents', lib: 'les documents du camion' }],
      'protection', 'Les équipements de protection individuelle : on les met avant d’entrer sur le quai.'),
    q('k-rendre-compte', 'preparation', 'stage', '« Rendre compte », c’est…',
      [{ v: 'dire', lib: 'dire à son chef ce qu’on a fait ou vu' }, { v: 'colis', lib: 'rendre un colis' }, { v: 'compter', lib: 'compter les palettes' }],
      'dire', 'Rendre compte, c’est dire à son chef ce qu’on a fait ou vu, même quand tout va bien.'),
    q('k-consignes', 'preparation', 'droit', 'Tu es en stage dans cet entrepôt. Qui doit te donner les consignes de sécurité du site ? (lis « Le droit »)',
      [{ v: 'entreprise', lib: 'l’entreprise qui t’accueille' }, { v: 'lycee', lib: 'ton lycée' }, { v: 'action', lib: 'Action' }, { v: 'personne', lib: 'personne' }],
      'entreprise', 'L’employeur informe les travailleurs, et le stagiaire en est un : c’est l’entreprise qui t’accueille.'),
    q('k-convention', 'preparation', 'droit', 'Ton tuteur te demande de rester une heure de plus. Qui fixe la durée de ton travail en stage ? (lis « Le droit »)',
      [{ v: 'convention', lib: 'ta convention de stage, qui fixe aussi des limites' }, { v: 'tuteur', lib: 'ton tuteur seul' }, { v: 'action', lib: 'Action' }],
      'convention', 'C’est ta convention de stage : elle fixe tes horaires, avec des limites.'),
    // ── images (4 : l’élève en reçoit 1)
    q('k-img-transpalette', 'image', 'photo-transpalette', 'Comment s’appelle cet engin ?',
      [{ v: 'transpalette', lib: 'un transpalette' }, { v: 'chariot', lib: 'un chariot élévateur' }, { v: 'gerbeur', lib: 'un gerbeur' }],
      'transpalette', 'C’est un transpalette : il déplace une palette au sol.'),
    q('k-img-chariot', 'image', 'photo-chariot', 'Comment s’appelle cet engin ?',
      [{ v: 'chariot', lib: 'un chariot élévateur' }, { v: 'transpalette', lib: 'un transpalette' }, { v: 'camion', lib: 'un camion' }],
      'chariot', 'C’est un chariot élévateur : il lève les palettes.'),
    q('k-img-niveleur', 'image', 'photo-niveleur', 'Cette plaque au bord du quai sert à…',
      [{ v: 'passer', lib: 'passer du quai au camion avec l’engin' }, { v: 'bloquer', lib: 'bloquer les roues' }, { v: 'peser', lib: 'peser la palette' }],
      'passer', 'C’est le niveleur : il fait le pont entre le quai et le plancher du camion.'),
    q('k-img-gilet', 'image', 'photo-gilet', 'Ce gilet sert à…',
      [{ v: 'vu', lib: 'être bien vu des caristes et des chauffeurs' }, { v: 'chaud', lib: 'avoir chaud' }, { v: 'scanner', lib: 'ranger le scanner' }],
      'vu', 'Le gilet à bandes réfléchissantes : les caristes et les chauffeurs te voient de loin.'),
  ],
};
