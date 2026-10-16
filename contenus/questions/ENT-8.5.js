// Les questions d’ENT-8.5 — Action, évaluation « se situer dans un nouveau site » (brief `docs/briefs/ENT-8.5-action-evaluation-se-situer.md`,
// §4 bis et §4 ter ; questions de Cowork, décision du 16/10/2026 sur délégation de Tristan). Modifier ce fichier suffit : voir « Modifier les
// questions d’une séance » dans `activites/FICHE-SEANCE.md`.
//
// ÉVALUATION : AUCUNE question au fil. Seul l’écran « Avant de commencer » est NOTÉ (`part: 4`) : 12 questions clés reprises d’ENT-8.1 et
// d’ENT-8.3 (8 de préparation, 4 d’image), l’élève en reçoit 4 (`tirage: { preparation: 3, image: 1 }`) ; aucune aide, aucun mot cliquable,
// « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.
//
// ÉCARTS au brief (dits au compte rendu) :
// - « réécrites pour le site » : le moteur ne sait pas écrire le site de l’élève dans une question d’ouverture (`variante` reçoit un tirage
//   au hasard, pas la base ; `selon` y est refusé) ni dans le nom de la personne qui pose les questions. Les énoncés disent donc « ton
//   stage », « le magasin que ton entrepôt livre », « ton tuteur » ; le site de l’élève est écrit dans le document à gauche (« Ton stage »,
//   calculé sur sa base) ; la personne est « Ton tuteur » (Karim ou Sandrine dans les messages). Demande au moteur notée au compte rendu.
// - `k-img-palette` est déclarée mais MISE DE CÔTÉ (`actif: false`) : le brief voulait l’exclure du tirage d’un élève qui a la situation
//   `s-film` (`verifier`), or le tirage des questions d’ouverture ne voit pas celui de la séance. La banque d’images garde 3 questions
//   (≥ 2 × 1). Écartées par Cowork (brief §4 ter) : « prestataire », « pour le prestataire, Action est un client », « Action peut changer de
//   prestataire », le code postal.

import { PHOTOS } from '../action.js';
import { IMAGES_83 } from '../action-ent83-donnees.js';
import { ID } from '../action-ent85-donnees.js';

// La personne qui pose les questions : le tuteur ou la tutrice du site (CONSTRUIT), nommé sans prénom (voir l’en-tête).
export const TUTEUR = { nom: 'Ton tuteur', role: 'chef d’équipe à la réception', appel: 'Ton tuteur', registre: 'tu' };

const visuel = (id, court, im) => ({ id, court, titre: court, type: 'images',
  images: [{ src: im.src, alt: im.alt, credit: im.mention, large: true }] });
const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'tuteur', doc, rubrique,
  enonce, choix, juste, retour, ...o });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { tuteur: TUTEUR },
  ouverture: { id: 'avant-de-commencer', de: 'tuteur', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour, et bienvenue ! Avant de commencer, réponds à mes questions, sans aide.',
    documents: ['stage', visuel('photo-semi', 'Sur la route', PHOTOS.semi), visuel('photo-palette', 'Dans l’entrepôt', PHOTOS.palette),
      visuel('photo-racks', 'Une allée', PHOTOS.entrepot), visuel('dessin-remorque', 'Une remorque', IMAGES_83.remorque)],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-vend', 'k-entrepot', 'k-chaine', 'k-regions', 'k-memes', 'k-ouverture', 'k-port', 'k-tuteur',
      'k-img-semi', 'k-img-palette', 'k-img-rack', 'k-img-planchers'] },
  liste: [
    // ── préparation (8 : l’élève en reçoit 3)
    q('k-vend', 'preparation', 'stage', 'Que vend surtout Action ?',
      [{ v: 'petitprix', lib: 'des produits non alimentaires à petit prix' }, { v: 'voitures', lib: 'des voitures' }, { v: 'repas', lib: 'des repas' },
        { v: 'medicaments', lib: 'des médicaments' }], 'petitprix',
      'Des produits pour la maison, la déco, le bricolage, l’hygiène, à petit prix.'),
    q('k-entrepot', 'preparation', 'stage', 'L’entrepôt où tu fais ce stage sert à…',
      [{ v: 'stocker', lib: 'stocker les produits puis préparer les commandes des magasins' }, { v: 'vendre', lib: 'vendre aux clients' },
        { v: 'fabriquer', lib: 'fabriquer les produits' }], 'stocker',
      'On y range les produits, puis on prépare ce que chaque magasin a commandé.'),
    q('k-chaine', 'preparation', 'stage', 'Le chemin d’un produit, de l’usine jusqu’au client, s’appelle…',
      [{ v: 'chaine', lib: 'la chaîne logistique' }, { v: 'rayon', lib: 'le rayon' }, { v: 'caisse', lib: 'la caisse' }], 'chaine',
      'La chaîne logistique : usine, transports, entrepôts, magasin.'),
    q('k-regions', 'preparation', 'stage', 'La France est découpée en régions, et chaque région en…',
      [{ v: 'departements', lib: 'départements' }, { v: 'villes', lib: 'villes seulement' }, { v: 'pays', lib: 'pays' }], 'departements',
      'Régions, puis départements, puis villes.'),
    q('k-memes', 'preparation', 'stage', 'Un produit vu dans un magasin Action à Lille, je le trouve aussi dans le magasin que ton entrepôt livre ?',
      [{ v: 'memes', lib: 'oui, ce sont les mêmes produits partout' }, { v: 'chacun', lib: 'non, chaque magasin choisit' },
        { v: 'paris', lib: 'seulement à Paris' }], 'memes',
      'Les mêmes produits dans tous les magasins Action.'),
    q('k-ouverture', 'preparation', 'stage', 'Avant qu’un nouveau magasin Action ouvre, il faut…',
      [{ v: 'remplir', lib: 'le remplir avec des produits livrés par l’entrepôt' }, { v: 'attendre', lib: 'attendre les clients' },
        { v: 'fabriquer', lib: 'fabriquer les produits' }], 'remplir',
      'L’entrepôt livre tout avant l’ouverture.'),
    q('k-port', 'preparation', 'stage', 'Un port comme Le Havre sert à…',
      [{ v: 'bateaux', lib: 'décharger les bateaux venus de loin' }, { v: 'essence', lib: 'stocker l’essence' }, { v: 'vendre', lib: 'vendre les produits' }], 'bateaux',
      'Les produits venus d’Asie arrivent par la mer.'),
    q('k-tuteur', 'preparation', 'stage', 'Ton tuteur de stage, c’est…',
      [{ v: 'entreprise', lib: 'la personne de l’entreprise qui te guide' }, { v: 'prof', lib: 'ton professeur' },
        { v: 'directeur', lib: 'le directeur d’Action' }], 'entreprise',
      'La personne de l’entreprise qui te donne les consignes et suit ton travail.'),
    // ── images (4 déclarées, 3 actives : l’élève en reçoit 1)
    q('k-img-semi', 'image', 'photo-semi', 'Ce véhicule sert à…',
      [{ v: 'transporter', lib: 'transporter les palettes de l’entrepôt aux magasins' }, { v: 'ranger', lib: 'ranger les palettes' },
        { v: 'decharger', lib: 'décharger les bateaux' }], 'transporter',
      'Une semi-remorque : elle emmène les palettes aux magasins.'),
    q('k-img-palette', 'image', 'photo-palette', 'Pourquoi ces cartons sont-ils filmés ?',
      [{ v: 'tenir', lib: 'pour qu’ils ne tombent pas pendant le transport' }, { v: 'decorer', lib: 'pour les décorer' },
        { v: 'peser', lib: 'pour les peser' }], 'tenir',
      'Le film tient les cartons ensemble pendant le transport.', { actif: false }),
    q('k-img-rack', 'image', 'photo-racks', 'Ces grandes étagères s’appellent…',
      [{ v: 'racks', lib: 'des racks (palettiers)' }, { v: 'quais', lib: 'des quais' }, { v: 'rayons', lib: 'des rayons de magasin' }], 'racks',
      'Des racks : les palettes y sont rangées en hauteur.'),
    q('k-img-planchers', 'image', 'dessin-remorque', 'Cette remorque a deux planchers. Deux planchers, ça sert à…',
      [{ v: 'plus', lib: 'mettre plus de palettes par camion, donc faire moins de trajets' }, { v: 'solide', lib: 'la rendre plus solide' },
        { v: 'separer', lib: 'séparer deux magasins' }], 'plus',
      'Presque deux fois plus de palettes par voyage : moins de camions sur la route.'),
  ],
};
