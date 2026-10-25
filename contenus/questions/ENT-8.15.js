// Les questions d'ENT-8.15 — Action, prendre en charge une préparation (brief `docs/briefs/ENT-8.15-action-preparer.md` §4 bis et §4 ter,
// PROPOSÉES par le brief, à relire par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Samia (cheffe d'équipe, la tutrice) — univers `contenus/action.js`.
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions de Samia »), les gestes du brief branchés sur ceux que publient les vues :
// - `q-caces` (0,75) : l'inspection figée (`inspection:action-poste-815:fini`) ;
// - `q-epi` (0,5) : la fiche « Ma mission » envoyée ;
// - `q-code` (0,75) : le premier code juste (le terminal va dans l'ordre : `code:L1`) ;
// - `q-circuit` (1, AU BILAN : elle éclairerait les lignes) : la 3e ligne posée (`ligne:L3`) ;
// - `q-nuit` (1, éco-droit) : le message à Samia envoyé ; « Le droit » (C. trav. L3163-1, L3163-2) est joint au message « Ton transpalette ».
// AVANT DE COMMENCER : banque de 8 notions NON notées (k-terminal, k-mission, img-terminal ajoutées par Claude Code : le moteur veut le double), 4 tirées par élève (3 de préparation, 1 image). Les `aide` sont de Claude Code (à relire).
//
// Ce fichier importe les DONNÉES de la séance (`contenus/action-ent815-donnees.js`), jamais le contenu.

import { apresFiche, apresGeste, apresMail } from '../../core/declencheurs.js';
import { ID, INSPECTION_ID, FICHE_ID, SAMIA_MAIL, GESTE } from '../action-ent815-donnees.js';

const GROUPE = 'Les questions de Samia';
const PERSONNES = { samia: { nom: 'Samia', role: 'cheffe d’équipe (ta tutrice)', appel: 'Samia', registre: 'tu' } };

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: PERSONNES,
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, tu prépares une commande. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['poste', 'dessin-engin', 'terminal-exemple'],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-preparer', 'k-ligne', 'k-picking', 'k-quai', 'k-terminal', 'k-mission', 'img-transpalette', 'img-terminal'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 3)
    { id: 'k-preparer', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Préparer une commande, c’est…',
      aide: 'Lis « Ta matinée », à gauche.',
      choix: [{ v: 'prendre', lib: 'prendre dans le stock ce qu’un magasin a commandé' }, { v: 'ranger', lib: 'ranger les palettes qui arrivent' },
        { v: 'charger', lib: 'charger le camion' }],
      juste: 'prendre',
      retour: 'Préparer, c’est prendre dans le stock ce qu’un magasin a commandé.' },
    { id: 'k-ligne', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Une ligne de commande dit…',
      aide: 'Clique sur le mot [[ligne]].',
      choix: [{ v: 'produit', lib: 'un produit, son adresse, combien en prendre' }, { v: 'prix', lib: 'le prix du produit' },
        { v: 'chauffeur', lib: 'le nom du chauffeur' }],
      juste: 'produit',
      retour: 'Une ligne : un produit, son adresse, combien en prendre.' },
    { id: 'k-picking', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'On prend les cartons…',
      aide: 'Clique sur le mot [[picking]].',
      choix: [{ v: 'sol', lib: 'au niveau 1, au sol (le picking)' }, { v: 'haut', lib: 'tout en haut du rack' }, { v: 'camion', lib: 'dans le camion' }],
      juste: 'sol',
      retour: 'Au sol, au niveau 1 : le picking. Au-dessus, c’est la réserve.' },
    { id: 'k-quai', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Une commande prête va…',
      aide: 'Clique sur le mot [[quai]].',
      choix: [{ v: 'quai', lib: 'sur le quai de son camion' }, { v: 'reserve', lib: 'en réserve' }, { v: 'bureau', lib: 'au bureau' }],
      juste: 'quai',
      retour: 'Sur le quai de son camion : il part à l’heure.' },
    { id: 'k-terminal', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Ici, le terminal te dit à la voix…',
      aide: 'Lis « Ta matinée » : tu n’as pas de bon papier.',
      choix: [{ v: 'ligne', lib: 'où aller, quel produit et combien en prendre' }, { v: 'heure', lib: 'l’heure qu’il est' }, { v: 'musique', lib: 'de la musique' }],
      juste: 'ligne',
      retour: 'Le terminal remplace le bon papier : l’adresse, le produit, la quantité.' },
    { id: 'k-mission', type: 'ouverture', de: 'samia', doc: 'terminal-exemple', rubrique: 'preparation',
      enonce: 'L’écran de ta mission te dit…',
      aide: 'Regarde l’écran du terminal, à gauche.',
      choix: [{ v: 'mission', lib: 'le magasin, le nombre de cartons, le quai et l’heure du camion' }, { v: 'salaire', lib: 'ton salaire' },
        { v: 'stock', lib: 'tout le stock de l’entrepôt' }],
      juste: 'mission',
      retour: 'Pour qui, combien, quel quai, avant quelle heure : tout est sur l’écran.' },
    // ── image (2 : l'élève en reçoit 1)
    { id: 'img-terminal', type: 'ouverture', de: 'samia', doc: 'terminal-exemple', rubrique: 'image',
      enonce: 'Cet appareil, c’est…',
      aide: 'Regarde l’écran : « Préparation », une mission, un quai.',
      choix: [{ v: 'terminal', lib: 'le terminal du préparateur' }, { v: 'telephone', lib: 'un téléphone personnel' }, { v: 'caisse', lib: 'une caisse de magasin' }],
      juste: 'terminal',
      retour: 'Le terminal : il donne la mission et guide à la voix.' },
    { id: 'img-transpalette', type: 'ouverture', de: 'samia', doc: 'dessin-engin', rubrique: 'image',
      enonce: 'Cet engin, c’est…',
      aide: 'Regarde les deux fourches, au ras du sol, et le long manche.',
      choix: [{ v: 'transpalette', lib: 'un transpalette électrique' }, { v: 'chariot', lib: 'un chariot élévateur' }, { v: 'gerbeur', lib: 'un gerbeur' }],
      juste: 'transpalette',
      retour: 'Un transpalette électrique : il déplace les palettes au sol.' },
    // ── au fil du travail (brief §4 bis ; une ligne au bandeau)
    { id: 'q-caces', type: 'fil', de: 'samia', quand: apresGeste(`inspection:${INSPECTION_ID}:fini`), poids: 0.75, groupe: GROUPE,
      enonce: 'Pour conduire ce transpalette, il te faut…',
      choix: [{ v: 'autorisation', lib: 'une formation et une autorisation de conduite de mon employeur (le CACES aide à l’obtenir)' },
        { v: 'rien', lib: 'rien, c’est un petit engin' }, { v: 'permis', lib: 'le permis B' }],
      juste: 'autorisation',
      retour: 'Sans autorisation, pas de conduite, même pour un transpalette.' },
    { id: 'q-epi', type: 'fil', de: 'samia', quand: apresFiche(FICHE_ID), poids: 0.5, groupe: GROUPE,
      enonce: 'Pourquoi des chaussures de sécurité pour préparer ?',
      choix: [{ v: 'pied', lib: 'un carton ou le transpalette peut m’écraser le pied' }, { v: 'uniforme', lib: 'c’est l’uniforme d’Action' },
        { v: 'vite', lib: 'pour marcher plus vite' }],
      juste: 'pied',
      retour: 'Un pied écrasé, c’est des semaines d’arrêt.' },
    { id: 'q-code', type: 'fil', de: 'samia', quand: apresGeste(GESTE('code:L1')), poids: 0.75, groupe: GROUPE,
      enonce: 'Le code de contrôle, ça sert à…',
      choix: [{ v: 'prouver', lib: 'prouver au système que je suis devant le bon emplacement' }, { v: 'compter', lib: 'compter les cartons' },
        { v: 'ouvrir', lib: 'ouvrir le carton' }],
      juste: 'prouver',
      retour: 'Un mauvais code, c’est un mauvais produit chez le magasin.' },
    { id: 'q-circuit', type: 'fil', de: 'samia', quand: apresGeste(GESTE('ligne:L3')), poids: 1, groupe: GROUPE, apres: 'bilan',
      enonce: 'Pourquoi le terminal te fait passer dans cet ordre ?',
      choix: [{ v: 'court', lib: 'c’est le chemin le plus court : on ne revient jamais en arrière' }, { v: 'alpha', lib: 'c’est l’ordre alphabétique des produits' },
        { v: 'hasard', lib: 'au hasard' }],
      juste: 'court',
      retour: 'Moins de pas, moins de fatigue, le camion part à l’heure.' },
    { id: 'q-nuit', type: 'fil', de: 'samia', quand: apresMail({ a: SAMIA_MAIL }), poids: 1, groupe: GROUPE,
      enonce: 'L’équipe commence à 5 h. Toi, tu as 16 ans et tu commences à 6 h. Pourquoi ? (Lis « Le droit », joint au message de Samia.)',
      choix: [{ v: 'loi', lib: 'la loi interdit le travail de nuit aux moins de 18 ans' }, { v: 'bus', lib: 'c’est plus pratique pour le bus' },
        { v: 'dormir', lib: 'les stagiaires dorment plus' }],
      juste: 'loi',
      retour: 'Tu es protégé par la loi. À 18 ans, tu pourras commencer à 5 h.' },
  ],
};
