// Les questions d'ENT-8.18 — Action, deux magasins, deux palettes (brief `docs/briefs/ENT-8.18-action-deux-magasins.md` §4 bis et §4 ter,
// PROPOSÉES par le brief, à relire par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`.
//
// AU FIL (`part: 4`, « Les questions de Samia »), branchées sur les gestes de la préparation vocale :
// - `q-pour-qui` (0,75) : la 2e ligne finie (`ligne:L2`) ;
// - `q-colisage` (1) : « Contrôler mes palettes » ouvert (`controle:ouvrir`) ;
// - `q-melange` (1, AU BILAN : elle éclairerait le jalon « grouper ») : le contrôle fermé (`controle:fermer`) ;
// - `q-retour` (0,75, écogeste) : les étiquettes posées (`etiquettes`) ;
// - `q-yanis` (0,5) : la réponse à Yanis envoyée. Elle porte la ligne du fond de la réponse (pas de jalon à part).
// AVANT DE COMMENCER : banque de 8 notions NON notées, 4 tirées (3 de préparation, 1 image) ; `k-grouper`, `k-pour-qui`, `k-controle` et
// `img-fragile` ajoutées par Claude Code (le moteur veut une banque double du tirage). Les `aide` sont de Claude Code (à relire).

import { apresGeste, apresMail } from '../../core/declencheurs.js';
import { ID, GESTE, YANIS_MAIL } from '../action-ent818-donnees.js';

const GROUPE = 'Les questions de Samia';
const PERSONNES = { samia: { nom: 'Samia', role: 'cheffe d’équipe (ta tutrice)', appel: 'Samia', registre: 'tu' } };

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: PERSONNES,
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Aujourd’hui, deux magasins à la fois. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['jour', 'etiquette', 'picto-fragile'],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-lourds', 'k-fragile', 'k-abime', 'k-colisage', 'k-grouper', 'k-pour-qui', 'k-controle', 'img-etiquette', 'img-fragile'] },
  liste: [
    { id: 'k-lourds', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Sur une palette, les cartons lourds vont…', aide: 'Pense à ta palette d’hier.',
      choix: [{ v: 'bas', lib: 'en bas' }, { v: 'haut', lib: 'en haut' }, { v: 'milieu', lib: 'au milieu' }],
      juste: 'bas', retour: 'En bas : rien ne les écrase, la palette tient.' },
    { id: 'k-fragile', type: 'ouverture', de: 'samia', doc: 'picto-fragile', rubrique: 'preparation',
      enonce: 'Un carton de verres va…', aide: 'Pense à ta palette d’hier.',
      choix: [{ v: 'haut', lib: 'en haut de la palette' }, { v: 'bas', lib: 'en bas de la palette' }, { v: 'quai', lib: 'à côté de la palette, sur le quai' }],
      juste: 'haut', retour: 'En haut : rien ne pèse sur lui.' },
    { id: 'k-abime', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Un carton est abîmé devant la pile. Je…', aide: 'Pense à mardi.',
      choix: [{ v: 'signale', lib: 'dis « Abîmé » au terminal et prends un bon carton' }, { v: 'prends', lib: 'le prends quand même' }, { v: 'cache', lib: 'le cache derrière la pile' }],
      juste: 'signale', retour: 'On le signale : le magasin ne recevra pas un carton qu’il ne pourrait pas vendre.' },
    { id: 'k-colisage', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Avant de filmer, on compare la palette à…', aide: 'Clique sur les mots [[liste de colisage]].',
      choix: [{ v: 'liste', lib: 'sa liste de colisage' }, { v: 'voisine', lib: 'la palette d’à côté' }, { v: 'rien', lib: 'rien' }],
      juste: 'liste', retour: 'Sa liste de colisage : ce qui doit être sur la palette.' },
    { id: 'k-grouper', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Deux magasins dans la même tournée, je fais…', aide: 'Clique sur les mots [[grouper par client]].',
      choix: [{ v: 'deux', lib: 'une palette par magasin' }, { v: 'une', lib: 'une seule palette pour les deux' }, { v: 'trois', lib: 'une palette par produit' }],
      juste: 'deux', retour: 'Une palette par magasin : chacune part au bon endroit.' },
    { id: 'k-pour-qui', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Le terminal dit « Pour Nîmes ». Je pose les cartons…', aide: 'Lis « Ta matinée ».',
      choix: [{ v: 'nimes', lib: 'sur la palette de Nîmes' }, { v: 'pleine', lib: 'sur la palette la moins pleine' }, { v: 'cote', lib: 'toujours à côté' }],
      juste: 'nimes', retour: 'Sur la palette de Nîmes : le terminal dit pour qui.' },
    { id: 'k-controle', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Le contrôle se fait…', aide: 'Clique sur le mot [[contrôle]].',
      choix: [{ v: 'avant', lib: 'avant de filmer' }, { v: 'apres', lib: 'quand la palette est au magasin' }, { v: 'jamais', lib: 'seulement si le chef le demande' }],
      juste: 'avant', retour: 'Avant de filmer : après, on ne peut plus rien déplacer.' },
    { id: 'img-etiquette', type: 'ouverture', de: 'samia', doc: 'etiquette', rubrique: 'image',
      enonce: 'Cette étiquette (nom du magasin, n° de commande) se colle…', aide: 'Lis ce qui est écrit en gros.',
      choix: [{ v: 'palette', lib: 'sur la palette de ce magasin' }, { v: 'terminal', lib: 'sur le terminal' }, { v: 'rack', lib: 'sur le rack' }],
      juste: 'palette', retour: 'Sur la palette de Nîmes, et sur aucune autre.' },
    { id: 'img-fragile', type: 'ouverture', de: 'samia', doc: 'picto-fragile', rubrique: 'image',
      enonce: 'Ce pictogramme (un verre) veut dire…', aide: 'Pense aux cartons d’hier.',
      choix: [{ v: 'fragile', lib: 'fragile' }, { v: 'boisson', lib: 'boisson' }, { v: 'recyclable', lib: 'recyclable' }],
      juste: 'fragile', retour: 'Le verre : fragile, ça se casse.' },
    // ── au fil du travail (brief §4 bis)
    { id: 'q-pour-qui', type: 'fil', de: 'samia', quand: apresGeste(GESTE('ligne:L2')), poids: 0.75, groupe: GROUPE,
      enonce: 'Le terminal dit le magasin à chaque ligne. Pourquoi ?',
      choix: [{ v: 'palette', lib: 'parce que chaque carton doit aller sur la palette de son magasin' }, { v: 'joli', lib: 'pour faire joli' },
        { v: 'trompe', lib: 'parce qu’il se trompe parfois' }],
      juste: 'palette', retour: 'Pour qui, puis où : chaque ligne a son magasin.' },
    { id: 'q-colisage', type: 'fil', de: 'samia', quand: apresGeste(GESTE('controle:ouvrir')), poids: 1, groupe: GROUPE,
      enonce: 'La liste de colisage, c’est…',
      choix: [{ v: 'liste', lib: 'la liste de ce qui doit être sur la palette' }, { v: 'facture', lib: 'la facture du magasin' },
        { v: 'preparateurs', lib: 'la liste des préparateurs' }],
      juste: 'liste', retour: 'Ce que le système attend sur cette palette : on compare ligne à ligne.' },
    { id: 'q-melange', type: 'fil', de: 'samia', quand: apresGeste(GESTE('controle:fermer')), poids: 1, groupe: GROUPE, apres: 'bilan',
      enonce: 'Un carton de Nîmes part dans l’autre magasin. Que se passe-t-il ?',
      choix: [{ v: 'manque', lib: 'Nîmes en manque, l’autre en a trop : il faudra le reprendre et le renvoyer' }, { v: 'rien', lib: 'rien, c’est le même produit' },
        { v: 'chauffeur', lib: 'le chauffeur s’en occupe' }],
      juste: 'manque', retour: 'Une erreur de palette, ce sont deux magasins mal servis.' },
    { id: 'q-retour', type: 'fil', de: 'samia', quand: apresGeste(GESTE('etiquettes')), poids: 0.75, groupe: GROUPE,
      enonce: 'Renvoyer un carton parti au mauvais magasin, ça coûte…',
      choix: [{ v: 'transport', lib: 'un transport en plus : du carburant, du temps et de l’argent' }, { v: 'rien', lib: 'rien, le camion repasse' },
        { v: 'appel', lib: 'seulement un coup de téléphone' }],
      juste: 'transport', retour: 'La bonne palette du premier coup, c’est un camion de moins sur la route.' },
    { id: 'q-yanis', type: 'fil', de: 'samia', quand: apresMail({ a: YANIS_MAIL }), poids: 0.5, groupe: GROUPE,
      enonce: 'Yanis te demandait de tout mettre sur une palette. Tu aurais dû…',
      choix: [{ v: 'expliquer', lib: 'faire une palette par magasin et lui expliquer pourquoi' }, { v: 'obeir', lib: 'obéir, il a plus d’expérience' },
        { v: 'rien', lib: 'ne rien répondre' }],
      juste: 'expliquer', retour: 'Trier au quai, c’est refaire le travail, et se tromper plus.' },
  ],
};
