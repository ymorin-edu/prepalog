// Les questions d'ENT-10.4 — Transports Pelleau, évaluation « prendre son poste » (brief `docs/briefs/ENT-10.4-pelleau-evaluation-prise-de-poste.md`
// §4 étape 0, §4 bis ; règle de la feuille de route §0 point 8). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Erwan et ses phrases sont CONSTRUITS.
//
// ÉVALUATION : AUCUNE question au fil (§4 bis). Seul l'écran « Avant de commencer » est NOTÉ (`part: 4`) : 9 questions clés reprises d'ENT-10.1 (les
// questions `cle: true` : transporteur, entreposeur, ramasse, ambiant, img-racks) et d'ENT-10.2 (epi, prise-poste, planning-quais, img-tpe) ; l'élève
// en reçoit 4 (`tirage: { preparation: 3, image: 1 }`) ; aucune aide, aucun mot cliquable ; « Je ne sais pas » ajouté par le moteur ; juste +1,
// « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.
//
// ÉCARTS AVEC LE BRIEF :
// - le brief écrit `tirage: { preparation: 4 }` ; comme ses questions clés comptent deux images (img-racks, img-tpe), le tirage qui couvre les
//   rubriques réellement déclarées est `{ preparation: 3, image: 1 }` (7 notions, 2 images : 3 + 1 = 4) ;
// - `consigner` et `img-fourche` (ENT-10.3 : « mettre un engin de côté ») ne sont pas reprises : ENT-10.3 n'est pas encore construite et le brief
//   10.3 les écrit pour sa banque, pas pour celle-ci ;
// - les documents « à gauche » sont ceux de CETTE séance (`stage-104`, `planning-vide-104`, `dessin-engin-104`, la photo des racks de Pelleau) :
//   rien n'est importé d'une autre séance (FDR §0.12).
//
// Ce fichier n'importe que les données pures de la séance (`contenus/pelleau-ent104-donnees.js`) et l'univers.

import { EQUIPE, PHOTOS } from '../pelleau.js';
import { ID } from '../pelleau-ent104-donnees.js';

const img = (id, photo, court) => ({ id, court, titre: court, type: 'images',
  images: [{ src: PHOTOS[photo].src, alt: PHOTOS[photo].alt, credit: PHOTOS[photo].mention, large: true }] });
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'erwan', doc, rubrique, enonce, choix, juste, retour });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { erwan: EQUIPE.erwan },
  ouverture: { id: 'avant-de-commencer', de: 'erwan', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, regarde le document à gauche et réponds à mes questions, sans aide.',
    documents: ['stage-104', 'planning-vide-104', 'dessin-engin-104', img('photo-racks', 'racks', 'Une allée')],
    tirage: { preparation: 3, image: 1 },
    questions: ['transporteur', 'entreposeur', 'ramasse', 'ambiant', 'epi', 'prise-poste', 'planning-quais', 'img-racks', 'img-tpe'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    q('transporteur', 'preparation', 'stage-104', 'Un transporteur…',
      [{ v: 'deplace', lib: 'déplace la marchandise d’un lieu à un autre' }, { v: 'fabrique', lib: 'fabrique la marchandise' },
        { v: 'vend', lib: 'vend en magasin' }], 'deplace',
      'C’est le premier métier de Pelleau : ses camions emmènent la marchandise de ses clients.'),
    q('entreposeur', 'preparation', 'stage-104', 'Un entreposeur…',
      [{ v: 'garde', lib: 'garde la marchandise de ses clients dans son entrepôt' }, { v: 'transporte', lib: 'la transporte jusqu’au client' },
        { v: 'fabrique', lib: 'la fabrique' }], 'garde',
      'C’est le nouveau métier de Pelleau, depuis l’entrepôt de Gouesnou.'),
    q('ramasse', 'preparation', 'stage-104', 'Une ramasse, c’est…',
      [{ v: 'tournee', lib: 'une tournée pour aller chercher la marchandise chez les expéditeurs' }, { v: 'livraison', lib: 'une livraison au magasin' },
        { v: 'inventaire', lib: 'un inventaire' }], 'tournee',
      'Chaque matin, Loïc fait sa ramasse chez les producteurs.'),
    q('ambiant', 'preparation', 'stage-104', 'Un stockage « ambiant », c’est…',
      [{ v: 'sans-froid', lib: 'sans froid : à la température de l’entrepôt' }, { v: 'congelateur', lib: 'au congélateur' },
        { v: 'parking', lib: 'dehors, sur le parking' }], 'sans-froid',
      'L’entrepôt de Gouesnou n’a pas de froid : on n’y garde que ce qui supporte la température de l’entrepôt.'),
    q('epi', 'preparation', 'stage-104', 'Les EPI, ce sont…',
      [{ v: 'protection', lib: 'les équipements de protection individuelle : chaussures de sécurité, gilet, gants' },
        { v: 'engins', lib: 'les engins de l’entrepôt' }, { v: 'documents', lib: 'les documents du camion' }], 'protection',
      'Les EPI te protègent : chaussures de sécurité, gilet, gants. Sans eux, tu n’entres pas dans l’entrepôt.'),
    q('prise-poste', 'preparation', 'stage-104', '« Prendre son poste », c’est…',
      [{ v: 'preparer', lib: 'se préparer et vérifier son matériel avant de commencer' }, { v: 'pause', lib: 'partir en pause' },
        { v: 'badge', lib: 'rendre son badge' }], 'preparer',
      'Prendre son poste, c’est se préparer : tes EPI, ton poste, ton engin. Ensuite seulement, tu travailles.'),
    q('planning-quais', 'preparation', 'planning-vide-104', 'Le planning des quais montre…',
      [{ v: 'camions', lib: 'quel camion arrive, à quelle heure, à quel quai' }, { v: 'conges', lib: 'les congés de l’équipe' },
        { v: 'stock', lib: 'le stock du client' }], 'camions',
      'Le planning des quais dit, pour chaque quai, quel camion est attendu et à quelle heure.'),
    // ── images (2 : l'élève en reçoit 1)
    q('img-racks', 'image', 'photo-racks', 'Ici, on…',
      [{ v: 'stocke', lib: 'stocke des palettes en hauteur' }, { v: 'gare', lib: 'gare les camions' }, { v: 'charge', lib: 'charge les batteries' }], 'stocke',
      'Des racks : chez nous, deux allées comme celle-ci.'),
    q('img-tpe', 'image', 'dessin-engin-104', 'Comment s’appelle cet engin ?',
      [{ v: 'tpe', lib: 'un transpalette électrique' }, { v: 'frontal', lib: 'un chariot élévateur frontal' }, { v: 'gerbeur', lib: 'un gerbeur' }], 'tpe',
      'C’est un transpalette électrique : tu marches à côté et tu le guides avec le timon.'),
  ],
};
