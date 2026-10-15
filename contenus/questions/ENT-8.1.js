// Les questions d’ENT-8.1 — Action, d’où viennent les produits du magasin de Nîmes ? (brief `docs/briefs/ENT-8.1-action-se-situer.md`,
// §4 bis et §4 ter ; choix de Tristan du 15/10/2026 à 19 h 13 et 19 h 14 ; geste de C tranché par le chef de chantier,
// `docs/briefs/COORDINATION-action.md` §3 n° 3). Modifier ce fichier suffit : voir « Modifier les questions d’une séance » dans
// `activites/FICHE-SEANCE.md`. Samia et ses phrases sont CONSTRUITES ; formulations de Cowork écrites telles quelles (à relire à l’écran).
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions de Samia ») :
// - `lien-action-geodis` (A) : point d’étape après l’envoi de « Qui est qui ? », poids 1,5 ; il garde la carte fermée jusqu’à la réponse
//   (juste ou fausse). Éco-droit appliqué : la prestation logistique, client / prestataire.
// - `voyage-bateau` (D) : au premier déplacement d’une étiquette de « La chaîne » (`fiche:chaine:ordre`), poids 1,5, corrigée AU BILAN
//   (« des conteneurs » ne doit pas souffler l’ordre). Le panneau des questions ne montre pas d’image : pas de dessin du conteneur.
// - `qui-remarque` (E) : à l’envoi de « Ce que je change » (`fiche:change:envoyer`), poids 1, ancrée sur la 1re situation tirée de
//   l’élève (`selon`, calculé à l’arrivée ; base vide : le texte déclaré).
// QUESTION NON NOTÉE :
// - `pourquoi-marseille` (C) : réflexion, à la fin de l’étape « département » de l’ENTREPÔT (`localiser:entrepot:departement`) : chez un
//   confirmé, « près de Marseille » ne souffle plus rien (l’entrepôt est trouvé, le port est ailleurs).
//
// AVANT DE COMMENCER (§4 ter) : une banque de 10 questions NON notées (l’élève ne le sait pas), 4 tirées par élève (`tirage: { preparation: 3,
// image: 1 }` : 7 notions ≥ 2 × 3, 3 images ≥ 2 × 1). Aucune ne porte sur un jalon : pas de conteneur (donnerait D), pas d’« Action client
// de Geodis » (donnerait A). `code-postal` est à VALEURS TIRÉES : une ville hors scénario (jamais les départements 30, 13, 76 ni 82), le
// juste = les deux premiers chiffres ; pièges calculés : les deux derniers chiffres, le premier chiffre seul. Photos libres (Pexels), crédit
// sous l’image ; `palette-filmee.jpg` est un recadrage de `zone-colis.jpg`, qui n’est pas montrée ici.

import { apresFiche, apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, PHOTOS } from '../action.js';
import { situationsSocle } from '../action-ent81-donnees.js';

const GROUPE = 'Les questions de Samia';

// Les villes du code postal : hors scénario, codes réels ; pour chacune, les deux pièges tombent sur des départements réels, jamais 30, 13,
// 76 ni 82, jamais celui de la ville.
const DEPS = { 75: 'Paris', 15: 'Cantal', '07': 'Ardèche', 69: 'Rhône', '03': 'Allier', '06': 'Alpes-Maritimes', 59: 'Nord', 40: 'Landes',
  '05': 'Hautes-Alpes', 80: 'Somme', 90: 'Territoire de Belfort', '08': 'Ardennes', 57: 'Moselle', 70: 'Haute-Saône' };
export const VILLES_CP = [['75015', 'Paris'], ['69003', 'Lyon'], ['59140', 'Dunkerque'], ['80090', 'Amiens'], ['57070', 'Metz']];
const dep = (n) => `le ${n} (${DEPS[n]})`;
export const varianteCodePostal = (h) => {
  const [code, ville] = h.choisir(VILLES_CP);
  const debut = code.slice(0, 2), fin = code.slice(3), premier = `0${code[0]}`;
  return {
    enonce: `Un lycée a pour adresse ${code} ${ville}. Dans quel département est-il ?`,
    libs: { debut: dep(debut), fin: dep(fin), premier: dep(premier) },
    retour: `Les deux premiers chiffres du code postal donnent le département : ${dep(debut)}.`,
  };
};

// Le texte de la question E, sur la 1re situation tirée de l’élève.
const selonE = (db) => {
  const p = situationsSocle(db)[0];
  return { enonce: p
    ? `À cause de ton erreur (« ${p.texte} »), le magasin de Nîmes a un problème. Qui le voit en premier ?`
    : 'À cause d’une erreur à la préparation, le magasin de Nîmes a un problème. Qui le voit en premier ?' };
};

const img = (id, photo, court) => ({ id, court, titre: court, type: 'images',
  images: [{ src: PHOTOS[photo].src, alt: PHOTOS[photo].alt, credit: PHOTOS[photo].mention, large: true }] });

export const QUESTIONS = {
  id: 'action-se-situer',
  part: 4,
  personnes: { samia: EQUIPE.samia },
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour, et bienvenue chez Geodis ! Avant ton premier matin, lis le document à gauche et réponds à mes questions.',
    documents: ['action', img('photo-semi', 'semi', 'Sur la route'), img('photo-palette', 'palette', 'Dans l’entrepôt'),
      img('photo-racks', 'entrepot', 'Une allée')],
    tirage: { preparation: 3, image: 1 },
    questions: ['action-vend', 'action-memes', 'entrepot-sert', 'port-sert', 'chaine', 'regions', 'code-postal',
      'img-semi', 'img-palette', 'img-rack'] },
  etapes: [
    { id: 'avant-carte', de: 'samia', apres: apresFiche('qui'), ferme: 'ecran:localiser',
      titre: 'Point d’étape avant la carte', continuer: 'la carte de France',
      situation: 'Merci, j’ai ta fiche. Avant la carte, une question.',
      questions: ['lien-action-geodis'] },
  ],
  liste: [
    // ── ouverture : préparation (7 : l’élève en reçoit 3)
    { id: 'action-vend', type: 'ouverture', de: 'samia', doc: 'action', rubrique: 'preparation',
      enonce: 'Que vend surtout Action ?',
      aide: 'Lis la première ligne du document.',
      choix: [{ v: 'maison', lib: 'Des produits pour la maison, la déco, le bricolage, l’hygiène, à petit prix' },
        { v: 'voitures', lib: 'Des voitures' }, { v: 'repas', lib: 'Des repas au restaurant' }, { v: 'medicaments', lib: 'Des médicaments sur ordonnance' }],
      juste: 'maison',
      retour: 'Des petits prix pour la maison : beaucoup de produits, souvent venus de loin.' },
    { id: 'action-memes', type: 'ouverture', de: 'samia', doc: 'action', rubrique: 'preparation',
      enonce: 'Un produit vu dans un magasin Action à Lille, je le trouve aussi à Nîmes ?',
      aide: 'Lis la deuxième ligne du document.',
      choix: [{ v: 'memes', lib: 'Oui : ce sont les mêmes produits dans tous les magasins' },
        { v: 'chacun', lib: 'Non : chaque magasin choisit ses produits' }, { v: 'paris', lib: 'Seulement dans les magasins de Paris' }],
      juste: 'memes',
      retour: 'Les mêmes produits partout : l’entrepôt prépare les mêmes articles pour tous les magasins qu’il livre.' },
    { id: 'entrepot-sert', type: 'ouverture', de: 'samia', doc: 'photo-racks', rubrique: 'preparation',
      enonce: 'Un entrepôt sert à…',
      aide: 'Regarde la photo : des produits rangés en hauteur. Le mot [[entrepôt]] est expliqué.',
      choix: [{ v: 'stocker', lib: 'Stocker les produits, puis préparer les commandes des magasins' },
        { v: 'vendre', lib: 'Vendre les produits aux clients' }, { v: 'fabriquer', lib: 'Fabriquer les produits' }],
      juste: 'stocker',
      retour: 'On y range les produits, puis on prépare ce que chaque magasin a commandé.' },
    { id: 'port-sert', type: 'ouverture', de: 'samia', doc: 'action', rubrique: 'preparation',
      enonce: 'Un port comme Le Havre sert à…',
      aide: 'Lis la troisième ligne du document : d’où viennent les produits ?',
      choix: [{ v: 'bateaux', lib: 'Décharger et charger les bateaux venus de loin' },
        { v: 'essence', lib: 'Stocker l’essence des voitures' }, { v: 'vendre', lib: 'Vendre des produits aux clients' }],
      juste: 'bateaux',
      retour: 'Les produits venus d’Asie arrivent par la mer : le port les décharge des bateaux.' },
    { id: 'chaine', type: 'ouverture', de: 'samia', doc: 'action', rubrique: 'preparation',
      enonce: 'La chaîne logistique, c’est…',
      aide: 'Le mot [[chaîne logistique]] est expliqué.',
      choix: [{ v: 'chemin', lib: 'Le chemin d’un produit, de l’usine jusqu’au client' },
        { v: 'caisses', lib: 'La file d’attente aux caisses du magasin' }, { v: 'salaries', lib: 'La liste des salariés d’un entrepôt' }],
      juste: 'chemin',
      retour: 'Usine, transports, entrepôts, magasin : toi, tu es sur ce chemin.' },
    { id: 'regions', type: 'ouverture', de: 'samia', doc: 'action', rubrique: 'preparation',
      enonce: 'La France est découpée en régions. Chaque région est découpée en…',
      aide: 'Un exemple : la Bretagne est une région, le Finistère en fait partie. Le mot [[région]] est expliqué.',
      choix: [{ v: 'departements', lib: 'Départements' }, { v: 'pays', lib: 'Pays' }, { v: 'continents', lib: 'Continents' }],
      juste: 'departements',
      retour: 'Régions, puis départements, puis villes : c’est ce que tu vas chercher sur la carte.' },
    { id: 'code-postal', type: 'ouverture', de: 'samia', doc: 'action', rubrique: 'preparation', variante: varianteCodePostal,
      enonce: 'Un lycée a pour adresse 69003 Lyon. Dans quel département est-il ?',
      aide: 'Regarde les deux premiers chiffres du code postal. Le mot [[département]] est expliqué.',
      choix: [{ v: 'debut', lib: 'le 69 (Rhône)' }, { v: 'fin', lib: 'le 03 (Allier)' }, { v: 'premier', lib: 'le 06 (Alpes-Maritimes)' }],
      juste: 'debut',
      retour: 'Les deux premiers chiffres du code postal donnent le département.' },
    // ── ouverture : images (3 : l’élève en reçoit 1)
    { id: 'img-semi', type: 'ouverture', de: 'samia', doc: 'photo-semi', rubrique: 'image',
      enonce: 'Comment s’appelle ce véhicule ?',
      choix: [{ v: 'semi', lib: 'Une semi-remorque' }, { v: 'camionnette', lib: 'Une camionnette' }, { v: 'tracteur', lib: 'Un tracteur agricole' }],
      juste: 'semi',
      retour: 'Une semi-remorque : c’est elle qui amène les palettes au quai.' },
    { id: 'img-palette', type: 'ouverture', de: 'samia', doc: 'photo-palette', rubrique: 'image',
      enonce: 'Qu’est-ce que c’est ?',
      aide: 'Regarde ce qui entoure les cartons. Le mot [[filmer]] est expliqué.',
      choix: [{ v: 'filmee', lib: 'Une palette filmée' }, { v: 'roll', lib: 'Un roll' }, { v: 'carton', lib: 'Un carton seul' }],
      juste: 'filmee',
      retour: 'Le film tient les cartons ensemble pendant le transport.' },
    { id: 'img-rack', type: 'ouverture', de: 'samia', doc: 'photo-racks', rubrique: 'image',
      enonce: 'Comment s’appellent ces meubles de stockage ?',
      choix: [{ v: 'racks', lib: 'Des racks à palettes' }, { v: 'etageres', lib: 'Des étagères de magasin' }, { v: 'quais', lib: 'Des quais' }],
      juste: 'racks',
      retour: 'Des racks : les palettes y sont rangées en hauteur, chacune à son emplacement.' },
    // ── point d’étape (après l’envoi de « Qui est qui ? ») : A
    { id: 'lien-action-geodis', type: 'transition', de: 'samia', poids: 1.5, groupe: GROUPE,
      enonce: 'L’entrepôt est rempli de produits Action, mais c’est Geodis qui le fait tourner. Qu’est-ce qui lie Action et Geodis ?',
      choix: [{ v: 'contrat', lib: 'Un contrat : Action paie Geodis pour stocker et préparer ses commandes' },
        { v: 'appartient', lib: 'Geodis appartient à Action' },
        { v: 'client-magasin', lib: 'Action est un client du magasin de Nîmes' },
        { v: 'aucun', lib: 'Aucun lien, chacun travaille de son côté' }],
      juste: 'contrat',
      retour: 'C’est ça : Geodis est un prestataire. Action le paie pour faire tourner l’entrepôt ; si le travail est mal fait, Action peut changer de prestataire.' },
    // ── au fil du travail
    { id: 'pourquoi-marseille', type: 'fil', de: 'samia', quand: apresGeste('localiser:entrepot:departement'), reflexion: true,
      enonce: 'Pourquoi Action a-t-il un entrepôt près de Marseille, plutôt qu’un seul entrepôt à côté de Paris ?',
      choix: [{ v: 'km', lib: 'Les camions font moins de kilomètres pour livrer les magasins du Sud-Est' },
        { v: 'vite', lib: 'Les magasins sont livrés plus vite' },
        { v: 'co2', lib: 'Moins de kilomètres, c’est moins de CO₂' },
        { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les trois sont vrais : un entrepôt près des magasins, c’est moins de route, des livraisons plus rapides et moins de CO₂.' },
    { id: 'voyage-bateau', type: 'fil', de: 'samia', quand: apresGeste('fiche:chaine:ordre'), apres: 'bilan', poids: 1.5, groupe: GROUPE,
      enonce: 'Les produits arrivent d’Asie au Havre. Dans quoi voyagent-ils sur le bateau ?',
      choix: [{ v: 'conteneurs', lib: 'Dans des conteneurs' }, { v: 'camions', lib: 'Dans des camions' },
        { v: 'rolls', lib: 'Dans des rolls' }, { v: 'palettes', lib: 'Sur des palettes posées seules sur le pont' }],
      juste: 'conteneurs',
      retour: 'Des conteneurs : de grandes boîtes en métal, toutes de la même taille, qu’on passe du bateau au camion sans ouvrir.' },
    { id: 'qui-remarque', type: 'fil', de: 'samia', quand: apresGeste('fiche:change:envoyer'), poids: 1, groupe: GROUPE, selon: selonE,
      enonce: 'À cause de ton erreur, le magasin de Nîmes a un problème. Qui le voit en premier ?',
      choix: [{ v: 'magasin', lib: 'Le personnel du magasin, en ouvrant les colis ou en remplissant le rayon' },
        { v: 'geodis', lib: 'Geodis, le soir même' }, { v: 'fournisseur', lib: 'Le fournisseur, en Asie' }],
      juste: 'magasin',
      retour: 'C’est le magasin qui le voit : un rayon vide ou un produit cassé, et c’est un client qui repart sans rien.' },
  ],
};
