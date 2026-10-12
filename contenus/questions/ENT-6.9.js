// Les questions d'ENT-6.9 — France Boissons, la tournée de la côte (brief `docs/briefs/ENT-6.9-france-boissons-tournee.md` §4 bis et
// §4 ter ; propositions de Cowork `docs/briefs/france-boissons/PROPOSITIONS-questions-au-fil.md` et `BANQUE-avant-de-commencer.md`,
// toutes gardées par Tristan le 10/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES.
//
// AU FIL (5, dont 3 notées : `part: 4`, poids 1 · 1,5 · 1,5 ; poids des jalons validés par Tristan le 12/10/2026, option A) :
// - `pourquoi-premier` : Karim, au premier arrêt posé sur la carte (cite le client), réflexion corrigée au bilan (le retour soufflerait
//   l'ordre).
// - `qui-attend-retour` (NOTÉE 1) : point d'étape de Karim quand la tournée est envoyée (carte et feuille figées), avant le SMS ; le texte
//   cite l'heure de retour de SA feuille (`selon`, figé à l'arrivée) ; ne dit pas si elle est juste.
// - `risque-sans-pause` (NOTÉE 1,5, 561/2006 art. 7) : Karim, au premier choix de la ligne « pause » du SMS ; ne dit pas s'il faut une
//   pause dans SA tournée. Le texte ne cite pas la phrase choisie : au moment du geste, elle n'est que dans le brouillon (pas dans la base).
// - `lire-le-sms` (NOTÉE 1,5, C. route R412-6-1) : Lucas, à l'envoi du SMS. Même texte que `sms-au-volant` de l'ouverture : les deux
//   sont gardées (« tout est gardé », 10/10/2026) ; l'ouverture n'en tire que 2 sur 4 en droit.
// - `malo-en-premier` : « Pour réfléchir » du brief §4 (règle 32), réponse libre non notée, à l'envoi du SMS, lue au bilan.
//
// AVANT DE COMMENCER : une banque de 8 questions NON notées, 4 tirées par élève (2 de préparation, 2 de droit), la calculette du site.
// Valeurs tirées (`variante`) : `minutes-90` (45, 60, 75, 105 ou 135 km : jamais les 142 km de la séance), `pas-avant` (ouverture de
// 8 h 30 à 9 h 30, jamais 10 h, celle de Malo). `dechargement-pause` dit 20 min (le temps par arrêt de la séance, et non 15 comme la
// banque, écrite avant le calage).

import { apresGeste, apresMail } from '../../core/declencheurs.js';
import { EQUIPE, mailDe } from '../france-boissons.js';
import { ID, CLE_SMS, ordreDe, nomDe, tourneeEnvoyee, retourFeuille, hDit } from '../france-boissons-ent69-donnees.js';

const pad = (n) => String(n).padStart(2, '0');
const hm = (m) => `${Math.floor(m / 60)}:${pad(m % 60)}`;
const fr = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n);

// ── Le premier arrêt posé.
const selonPremier = (db) => {
  const o = ordreDe(db);
  return o.length ? { enonce: `Tu mets ${nomDe(o[0])} en premier. Pourquoi ?` } : { enonce: 'Tu choisis ton premier arrêt. Pourquoi celui-là ?' };
};
// ── L'heure de retour de SA feuille, au moment de l'envoi.
const selonRetour = (db) => {
  const r = retourFeuille(db);
  return { enonce: r == null
    ? 'Ta feuille ne donne pas d’heure de retour à Buchelay. Qui a besoin de cette heure-là ?'
    : `Ta feuille donne un retour à Buchelay à ${hDit(r)}. Qui a besoin de cette heure ?` };
};
const varianteMinutes = (h) => {
  const km = h.choisir([45, 60, 75, 105, 135]);
  return {
    enonce: `À 90 km/h, combien de minutes faut-il pour faire ${km} km ?`,
    libs: { juste: `${fr(km / 90 * 60)} min`, heures: `${fr(km / 90)} min`, fois: `${fr(km * 90 / 60)} min` },
    retour: `${km} ÷ 90 × 60 = ${fr(km / 90 * 60)} min. Temps (min) = km ÷ vitesse × 60. Tu le referas dans ta feuille.`,
  };
};
const variantePasAvant = (h) => {
  const o = h.choisir([510, 525, 540, 555, 570]), a = o - h.choisir([15, 20, 25, 30, 35, 40]);
  return {
    enonce: `Un client ouvre à ${hm(o)}. Le camion arrive à ${hm(a)}. Que se passe-t-il ?`,
    libs: { attend: `Il attend jusqu’à ${hm(o)}, puis livre : il repartira plus tard`, tout: 'Il livre tout de suite',
      suivant: 'Il passe chez le client suivant et ne revient pas' },
    retour: `Il attend ${o - a} min, puis livre. Arriver trop tôt, c’est du temps perdu : toute la suite de la tournée glisse d’autant.`,
  };
};

const ENVOI_SMS = apresMail({ a: mailDe('lucas') });

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { karim: EQUIPE.karim, lucas: EQUIPE.lucas },
  ouverture: { id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Lucas est sur l’A13 avec la tournée de la côte, et c’est toi qui vas ordonner ses arrêts. Avant de commencer, '
      + 'lis les documents à gauche et réponds à mes questions.',
    calculette: true,
    documents: ['clients', 'droit', 'annuaire'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['minutes-90', 'pas-avant', 'feuille-route', 'jour-de-marche',
      'sms-au-volant', 'vitesse-porteur', 'dechargement-pause', 'rue-pietonne'] },
  etapes: [
    { id: 'avant-sms', de: 'karim', apres: tourneeEnvoyee,
      ferme: `repondre:${CLE_SMS}`, titre: 'Point d’étape avant le SMS à Lucas', continuer: 'répondre à Lucas',
      situation: 'J’ai bien ta tournée : la carte et la feuille sont figées. Lucas t’attend par SMS (son message est dans la Messagerie). '
        + 'Avant que tu lui répondes, une question sur ta feuille.',
      questions: ['qui-attend-retour'] },
  ],
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'minutes-90', type: 'ouverture', de: 'karim', doc: 'clients', rubrique: 'preparation', cle: true, variante: varianteMinutes,
      enonce: 'À 90 km/h, combien de minutes faut-il pour faire 60 km ?',
      aide: 'Temps (min) = km ÷ vitesse × 60. La calculette du site est là pour toi.',
      choix: [{ v: 'juste', lib: '40 min' }, { v: 'heures', lib: '0,7 min' }, { v: 'fois', lib: '90 min' }],
      juste: 'juste',
      retour: '60 ÷ 90 × 60 = 40 min. Temps (min) = km ÷ vitesse × 60. Tu le referas dans ta feuille.' },
    { id: 'pas-avant', type: 'ouverture', de: 'karim', doc: 'clients', rubrique: 'preparation', variante: variantePasAvant,
      enonce: 'Un client ouvre à 9:00. Le camion arrive à 8:35. Que se passe-t-il ?',
      aide: 'Un client fermé ne peut pas réceptionner sa livraison.',
      choix: [{ v: 'attend', lib: 'Il attend jusqu’à 9:00, puis livre : il repartira plus tard' }, { v: 'tout', lib: 'Il livre tout de suite' },
        { v: 'suivant', lib: 'Il passe chez le client suivant et ne revient pas' }],
      juste: 'attend',
      retour: 'Il attend 25 min, puis livre. Arriver trop tôt, c’est du temps perdu : toute la suite de la tournée glisse d’autant.' },
    { id: 'feuille-route', type: 'ouverture', de: 'karim', doc: 'clients', rubrique: 'preparation',
      enonce: 'Une feuille de route, c’est…',
      aide: 'Le mot [[feuille de route]] est dans le lexique.',
      choix: [{ v: 'ordre', lib: 'L’ordre des arrêts, avec les heures d’arrivée et de départ du chauffeur' },
        { v: 'facture', lib: 'La facture du client' }, { v: 'futs', lib: 'La liste des fûts à charger' }],
      juste: 'ordre',
      retour: 'C’est ce que Lucas suivra.' },
    { id: 'jour-de-marche', type: 'ouverture', de: 'karim', doc: 'clients', rubrique: 'preparation',
      enonce: 'Vendredi, c’est jour de marché à Deauville. Pourquoi est-ce important pour livrer un café de la place ?',
      aide: 'Regarde l’horaire du Café de l’Étal dans la liste des clients.',
      choix: [{ v: 'place', lib: 'La place est prise par le marché : après une certaine heure, le camion ne passe plus' },
        { v: 'boivent', lib: 'Les clients boivent plus le vendredi' }, { v: 'partout', lib: 'Rien, le camion passe partout' }],
      juste: 'place',
      retour: 'Un horaire de client, ça se respecte.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'sms-au-volant', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Tu envoies la tournée à Lucas, qui roule sur l’A13. Peut-il lire ton SMS en conduisant, téléphone en main ?',
      aide: 'Lis l’article R412-6-1 du Code de la route dans « Le droit ».',
      choix: [{ v: 'non', lib: 'Non : c’est interdit ; il le lira à l’arrêt' }, { v: 'autoroute', lib: 'Oui, sur autoroute c’est permis' },
        { v: 'travail', lib: 'Oui, si c’est pour le travail' }],
      juste: 'non',
      retour: 'Amende et 3 points en moins sur le permis : il lira à Touques, à l’arrêt.' },
    { id: 'vitesse-porteur', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit',
      enonce: 'Sur autoroute, à quelle vitesse au plus roule le porteur de 16 t de Lucas ?',
      aide: 'Lis l’article R413-8 du Code de la route dans « Le droit ».',
      choix: [{ v: '90', lib: '90 km/h' }, { v: '110', lib: '110 km/h' }, { v: '130', lib: '130 km/h' }],
      juste: '90',
      retour: 'C’est le 90 km/h de ta feuille de calcul.' },
    { id: 'dechargement-pause', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit',
      enonce: 'Chez chaque client, Lucas décharge pendant 20 min. Est-ce une pause, au sens du règlement européen ?',
      aide: 'Lis l’article 4 d du règlement (CE) n° 561/2006 dans « Le droit ».',
      choix: [{ v: 'non', lib: 'Non : une pause, c’est un temps où il ne conduit pas et ne fait aucun autre travail' },
        { v: 'oui', lib: 'Oui, il ne conduit pas' }, { v: 'dix', lib: 'Oui, si l’arrêt dure plus de 10 min' }],
      juste: 'non',
      retour: 'Décharger, c’est travailler.' },
    { id: 'rue-pietonne', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit',
      enonce: 'Qui peut interdire aux camions, à certaines heures, la rue piétonne de Trouville ?',
      aide: 'Lis l’article L2213-2 du Code général des collectivités territoriales dans « Le droit ».',
      choix: [{ v: 'maire', lib: 'Le maire, par un arrêté' }, { v: 'client', lib: 'Le client de la rue' }, { v: 'fb', lib: 'France Boissons' }],
      juste: 'maire',
      retour: 'D’où les horaires de livraison des rues piétonnes.' },
    // ── point d'étape
    { id: 'qui-attend-retour', type: 'transition', de: 'karim', selon: selonRetour,
      enonce: 'Ta feuille donne un retour à Buchelay à {son heure}. Qui a besoin de cette heure ?',
      choix: [{ v: 'quai', lib: 'Le quai, pour décharger les vides, et moi pour la suite de la journée' }, { v: 'malo', lib: 'Malo' },
        { v: 'personne', lib: 'Personne' }],
      juste: 'quai', groupe: 'Question de Karim : à qui sert l’heure de retour',
      retour: 'Le quai prépare la place pour les vides, et moi je prévois le camion et Lucas pour la suite. Une heure de retour, ça s’annonce.' },
    // ── au fil du travail
    { id: 'pourquoi-premier', type: 'fil', de: 'karim', quand: (db) => ordreDe(db).length > 0, reflexion: true, apres: 'bilan', selon: selonPremier,
      enonce: 'Tu choisis ton premier arrêt. Pourquoi celui-là ?',
      choix: [{ v: 'horaire', lib: 'Son horaire est le plus tôt' }, { v: 'pres', lib: 'Il est le plus près de la sortie de l’A13' },
        { v: 'malo', lib: 'C’est Malo' }, { v: 'hasard', lib: 'Au hasard' }],
      retour: 'Le premier arrêt, c’est celui qui ferme le plus tôt : le café de Deauville, avant 8 h 30, jour de marché. Le plus près n’est pas '
        + 'toujours le bon, et Malo n’ouvre qu’à 10 h : passer chez lui en premier, c’est attendre devant sa porte.' },
    { id: 'risque-sans-pause', type: 'fil', de: 'karim', quand: apresGeste('messagerie:phrase:pause'), poids: 1.5,
      enonce: 'Tu choisis la phrase sur la pause, dans ton SMS. S’il conduit plus de 4 h 30 sans pause, qu’est-ce que Lucas risque ?',
      choix: [{ v: 'amende', lib: 'Une amende, et France Boissons aussi : c’est une règle européenne' },
        { v: 'rien', lib: 'Rien, s’il ne lui arrive rien' }, { v: 'malo', lib: 'Une remarque de Malo' }],
      juste: 'amende', groupe: 'Question de Karim : conduire sans pause',
      retour: 'Le règlement européen (article 7) s’impose au chauffeur et à son entreprise : un contrôle sur la route, et c’est l’amende pour les deux.' },
    { id: 'lire-le-sms', type: 'fil', de: 'lucas', quand: ENVOI_SMS, poids: 1.5,
      enonce: 'Je roule sur l’A13. Quand puis-je lire ton SMS ?',
      choix: [{ v: 'arret', lib: 'À l’arrêt, à la sortie de Touques' }, { v: 'roulant', lib: 'Tout de suite, en roulant' },
        { v: 'soir', lib: 'Au retour, ce soir' }],
      juste: 'arret', groupe: 'Question de Lucas : lire un SMS au volant',
      retour: 'Téléphone en main au volant, c’est interdit (Code de la route, R412-6-1) : je le lirai à Touques, garé. Et pas ce soir : j’en ai besoin pour la tournée.' },
    { id: 'malo-en-premier', type: 'fil', de: 'karim', quand: ENVOI_SMS, reflexion: true, libre: true, apres: 'bilan',
      enonce: 'Pour réfléchir : Malo n’ouvre qu’à 10 h. Qu’est-ce que ton ordre aurait coûté à Lucas si tu étais passé chez lui en premier ?',
      retour: 'Arrivé vers 7 h 50, Lucas aurait attendu Malo plus de deux heures, camion arrêté. Le café de Deauville (avant 8 h 30) aurait forcément été '
        + 'livré trop tard, et toute la journée se serait allongée d’autant.' },
  ],
};
