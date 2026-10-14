// SÉANCE D'ESSAI de l'écran Téléphone (vue « Dialogue à choix », 14/10/2026, brief `docs/briefs/MOTEUR-vue-dialogue.md`, lot 2).
//
// L'élève appelle Nadia, cheffe de quai d'un entrepôt d'essai, pour réserver le créneau d'une livraison. Six répliques : une à
// quatre réponses (personne n'est bloqué), une réponse « acceptée mais sèche » (`accepte`), un texte calculé sur la base de
// l'élève (`selon` : son numéro de livraison), `{prenom}`, une dernière bulle (`fin`). Un contact sans dialogue (Thomas, sur
// messagerie). Le Stock reste fermé tant que l'appel n'est pas fini (`dialogueFini`).
//
// Montée par le bloc de tests `outils/test/dialogue.mjs`. Ce n'est pas une activité : elle n'apparaît nulle part dans le site.
// Entreprise, personnes, produits et numéros CONSTRUITS. Pas de Decathlon ici : l'appel au quai d'ENT-7.2 vit dans la page
// d'essai du lot 1 (`outils/essai-dialogue.html`), puis dans sa séance.
//
// Valeurs attendues, écrites à la main dans le bloc : numéro de livraison de la base de départ LIV-2041-07 (le piège : LIV-2401-07) ;
// réponses justes accueil = 'presente', refs = 'juste', jour = 'mardi', vehicule = 'porteur', confirme = 'oui', cloture = 'merci'.

import { catalogueSimple } from './entreprise-commun.js';
import { dialogueFini } from '../core/declencheurs.js';
import { jalonDialogue, reprises, premiereReponse } from '../core/types/dialogue.js';

export const SEANCE = 'essai-dialogue';
export const MENTION = 'Séance d’essai de l’écran Téléphone. <b>Construit</b> : l’entrepôt, Nadia, Thomas, la livraison et ses numéros.';

export const EQUIPE = {
  nadia: { nom: 'Nadia Ferrand', appel: 'Nadia', role: 'cheffe de quai' },
  thomas: { nom: 'Thomas Leroy', role: 'responsable de l’entrepôt' },
};

// Le numéro de livraison de l'élève (rangé dans sa base) et le piège (deux chiffres inversés).
export const noLivraison = (db) => (db && db.livraison) || 'LIV-2041-07';
export const noPiege = (db) => noLivraison(db).replace(/^LIV-(\d)(\d)(\d)(\d)/, 'LIV-$1$3$2$4');

export const TELEPHONE = {
  situation: 'Appelle le quai de réception pour réserver le créneau de la livraison de mardi.',
  leurres: [{ id: 'thomas', nom: 'Thomas Leroy', detail: 'responsable de l’entrepôt',
    message: 'Bonjour, vous êtes sur la messagerie de Thomas Leroy. Je suis absent aujourd’hui : laissez-moi un message.' }],
  dialogues: [{
    id: 'quai', de: 'nadia',
    contact: { nom: 'Quai de réception', detail: 'poste 214' },
    repliques: [
      { id: 'accueil', dit: 'Quai de réception, Nadia, j’écoute.',
        choix: [
          { v: 'presente', juste: true, lib: 'Bonjour Nadia, c’est {prenom}, du service transport. Je t’appelle pour réserver un créneau pour une livraison.' },
          { v: 'salut', lib: 'Salut, c’est pour un camion.', reaction: 'Euh… bonjour. C’est qui, et c’est pour quoi exactement ?' },
          { v: 'place', lib: 'Tu as de la place mardi ?', reaction: 'De la place pour quoi ? Tu es qui ?' },
        ] },
      { id: 'refs', dit: 'D’accord, {prenom}. Tu as le numéro de la livraison ?',
        choix: [
          { v: 'juste', juste: true, lib: 'Oui : livraison LIV-0000-00.' },
          { v: 'inverse', lib: 'Oui : livraison LIV-0000-01.', reaction: 'Je ne le trouve pas, ce numéro. Relis-le sur ton bon.' },
          { v: 'produit', lib: 'C’est les jus de pomme.', reaction: 'J’en reçois tous les jours, des jus de pomme. Il me faut le numéro.' },
          { v: 'bientot', lib: 'Je ne l’ai pas sous les yeux.', reaction: 'Sans numéro, je ne peux rien réserver. Regarde ton bon.' },
        ],
        // Calculé UNE FOIS, à l'arrivée de la réplique, sur la base de l'élève : figé ensuite.
        selon: (db) => ({ libs: { juste: `Oui : livraison ${noLivraison(db)}.`, inverse: `Oui : livraison ${noPiege(db)}.` } }) },
      { id: 'jour', dit: 'Je la vois. Elle arrive quand ?',
        choix: [
          { v: 'mardi', juste: true, lib: 'Mardi matin, vers 9 h.' },
          { v: 'semaine', lib: 'Dans la semaine.', reaction: 'Dans la semaine, ça ne me sert à rien. Quel jour, et à quelle heure ?' },
        ] },
      { id: 'vehicule', dit: 'Avec quel véhicule ?',
        choix: [
          { v: 'porteur', juste: true, lib: 'Un porteur de 19 tonnes, 12 palettes.' },
          { v: 'gros', lib: 'Un gros camion.', reaction: 'Gros comment ? Il me faut le type de véhicule et le nombre de palettes.' },
        ] },
      { id: 'confirme', dit: 'Je te mets mardi 9 h, quai 3. Ça te va ?',
        choix: [
          { v: 'oui', juste: true, lib: 'Oui, mardi 9 h au quai 3. Merci !' },
          { v: 'ouais', lib: 'Ouais.', reaction: '… Bon. Je note.', accepte: true },
        ] },
      { id: 'cloture', dit: 'Je t’envoie la confirmation par courriel.',
        choix: [
          { v: 'merci', juste: true, lib: 'Merci Nadia, bonne journée !' },
          { v: 'rien', lib: 'OK.', reaction: 'Euh… tu ne dis même pas au revoir ?' },
        ] },
    ],
    fin: 'Bonne journée, {prenom} !',
  }],
};

// Les jalons : l'appel fini avec au plus 2 reprises (comme ENT-7.2 jalon 10), le bon numéro du premier coup (comme ENT-7.4).
// Ils lisent le DERNIER appel terminé ; rien n'est vrai avant le raccrochage.
export const ETAPES = [
  jalonDialogue({ seance: SEANCE, dialogue: 'quai', id: 'appel-quai', titre: 'Appel au quai sans trop de reprises', groupe: 'Appel au quai', poids: 10,
    juge: (a) => reprises(a) <= 2 }),
  jalonDialogue({ seance: SEANCE, dialogue: 'quai', id: 'numero-quai', titre: 'Numéro de livraison donné du premier coup', groupe: 'Numéro de livraison', poids: 10,
    juge: (a) => premiereReponse(a, 'refs') === 'juste' }),
];

const PRODUITS = [{ ref: 'JUS-POM', designation: 'Jus de pomme 1 L (carton de 12)', stock: 24 }];

export function univers({ copie = false, telephone = TELEPHONE } = {}) {
  return {
    ENTREPRISE: { id: SEANCE, nom: 'Entrepôt d’essai', sousTitre: 'Téléphone — séance d’essai', exercice: 'Réserver le créneau de la livraison' },
    VOCAB: { unit: 'carton', unitPl: 'cartons', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'entrepot-essai.example' },
    CATALOGUE: catalogueSimple(PRODUITS.map((p) => ({ ref: p.ref, designation: p.designation }))),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: Object.fromEntries(PRODUITS.map((p) => [p.ref, p.stock])), moves: [], mails: [],
      orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [], livraison: 'LIV-2041-07' }),
    etapes: ETAPES, menu: ['stock'], stockOuvert: true,
    fermetures: { stock: { ouvertSi: dialogueFini('quai'), message: 'Appelle d’abord le quai.' } },
    accueil: { titre: 'Réserver le créneau', kpis: ['mail'], etapes: [
      ['Appeler le quai', 'Ouvre le Téléphone et appelle le quai de réception.'],
      ['Regarder le stock', 'Après l’appel.'],
    ] },
    telephone, equipe: EQUIPE,
    copie, sansTrame: 'Tout à l’écran',
  };
}

export const META = { id: SEANCE, code: 'ESSAI', titre: 'Essai — téléphone', portee: 'eleve', immersif: true,
  temps: 'guidage', parcours: true, suiteAuBilan: true, reinitialisable: true };
