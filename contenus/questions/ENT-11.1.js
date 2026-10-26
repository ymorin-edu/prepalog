// Les questions d’ENT-11.1 — Mondial Relay, le voyage d’un colis (brief `docs/briefs/ENT-11.1-mondial-relay-voyage-colis.md`, §4 bis et §4 ter ;
// toutes les propositions acceptées par Tristan le 26/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d’une séance » dans
// `activites/FICHE-SEANCE.md`. Romain et ses phrases sont CONSTRUITS.
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions de Romain ») :
// - `hub-temps` : au premier déplacement d’une étape du voyage (`fiche:voyage:voyage`), poids 1,5, corrigée tout de suite
//   (« le hub ne stocke pas », prépare ENT-11.2).
// - `retrait-sept-jours` : à l’envoi du voyage (`fiche:voyage:envoyer`), poids 1,5, corrigée AU BILAN. Le brief la posait quand l’étape « retrait »
//   est placée ; le moteur ne sait pas dire « cette étape est placée » (aucun geste par étape), l’envoi du voyage en est le moment.
// - `locker-27-kg` : au premier colis classé (`fiche:colis:colis-1`), poids 1, corrigée tout de suite. Le colis (27 kg) est une valeur CALCULÉE
//   depuis `REGLES_COLIS` (le poids maximum du locker + 2), les mêmes pour tous.
// QUESTIONS NON NOTÉES (réflexion) :
// - `axes-routiers` : après la région du hub. Le brief citait « l’A5 et l’A26 (à vérifier) » : aucune autoroute n’est nommée ici, seulement
//   « les grands axes routiers » (décision de Tristan du 26/10/2026).
// - `petits-villages` (éco-droit) : à l’envoi des colis. Elle s’appuie sur l’actualité de 2025 (Mondial Relay retire des Points Relais au profit des
//   lockers, d’après la presse, source : Univers Colis, 29/10/2025, source secondaire) SANS chiffre ni citation : l’article n’a pas été relu pour
//   la séance. À RELIRE avant d’en citer un chiffre.
//
// AVANT DE COMMENCER (§4 ter) : 5 questions NON notées (l’élève ne le sait pas), toutes montrées (pas de tirage : la banque est trop courte pour
// tirer par rubrique). Le document de gauche est « Mondial Relay en bref » (texte) : les images prévues au brief (photo d’un comptoir, extrait du
// communiqué « Peak 2025 », extrait des conditions de vente) ne sont PAS montrées — aucune image libre de droits n’était disponible.

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, REGLES_COLIS } from '../mondial-relay.js';

const GROUPE = 'Les questions de Romain';
const ROMAIN = { nom: EQUIPE.romain.prenom, role: EQUIPE.romain.poste, appel: EQUIPE.romain.prenom, registre: 'tu' };

// Les valeurs de la règle, calculées (jamais recopiées).
const { relais, locker, joursAuRelais } = REGLES_COLIS;
const KG_LOURD = locker.poidsMax + 2;          // 27 kg : trop lourd pour le locker, accepté au Point Relais
const JOURS_RETARD = joursAuRelais + 2;        // 7 jours : le colis a déjà dû repartir

export const QUESTIONS = {
  id: 'mondial-relay-voyage-colis',
  part: 4,
  personnes: { romain: ROMAIN },
  ouverture: { id: 'avant-de-commencer', de: 'romain', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour, et bienvenue au hub ! Avant ta première nuit, lis le document à gauche et réponds à mes questions.',
    documents: ['mr'],
    questions: ['mr1-a', 'mr1-b', 'mr1-c', 'mr1-d', 'mr1-e'] },
  etapes: [],
  liste: [
    // ── ouverture
    { id: 'mr1-a', type: 'ouverture', de: 'romain', doc: 'mr',
      enonce: 'Un Point Relais, c’est…',
      aide: 'Lis la ligne 1 du document. Le mot [[Point Relais]] est expliqué.',
      choix: [{ v: 'commerce', lib: 'Un commerce qui garde les colis' }, { v: 'entrepot', lib: 'Un grand entrepôt de Mondial Relay' },
        { v: 'poste', lib: 'Un bureau de poste' }],
      juste: 'commerce',
      retour: 'Une boutique, une quincaillerie… qui garde les colis en attendant que le client passe.' },
    { id: 'mr1-b', type: 'ouverture', de: 'romain', doc: 'mr',
      enonce: 'Un hub de messagerie sert à…',
      aide: 'Lis la ligne 3 du document. Le mot [[hub]] est expliqué.',
      choix: [{ v: 'trier', lib: 'Trier les colis qui arrivent de partout' }, { v: 'stocker', lib: 'Stocker les colis pendant des mois' },
        { v: 'fabriquer', lib: 'Fabriquer les colis' }],
      juste: 'trier',
      retour: 'Les colis arrivent de partout, sont triés, puis repartent. Un hub ne garde pas les colis.' },
    { id: 'mr1-c', type: 'ouverture', de: 'romain', doc: 'mr',
      enonce: 'Le pic de fin d’année va de…',
      aide: 'Lis la ligne 4 du document.',
      choix: [{ v: 'octobre', lib: 'La fin octobre à la mi-janvier' }, { v: 'ete', lib: 'Juillet à août' }, { v: 'printemps', lib: 'Mars à avril' }],
      juste: 'octobre',
      retour: 'Black Friday, Noël, soldes : il y a deux fois plus de colis, alors on prend des renforts.' },
    { id: 'mr1-d', type: 'ouverture', de: 'romain', doc: 'mr',
      enonce: 'Inès envoie un colis par Mondial Relay. Qui est le client de Mondial Relay pour cet envoi ?',
      aide: 'Lis la ligne 5 du document : qui paie l’envoi ?',
      choix: [{ v: 'ines', lib: 'Inès, qui envoie le colis' }, { v: 'acheteur', lib: 'L’acheteur, qui reçoit le colis' },
        { v: 'relais', lib: 'Le commerçant du Point Relais' }],
      juste: 'ines',
      retour: 'Celle qui paie l’envoi est la cliente : c’est Inès, l’expéditrice.' },
    { id: 'mr1-e', type: 'ouverture', de: 'romain', doc: 'mr',
      enonce: 'Le contrat entre Inès et Mondial Relay s’appelle…',
      aide: 'Lis la ligne 6 du document.',
      choix: [{ v: 'transport', lib: 'Un contrat de transport' }, { v: 'travail', lib: 'Un contrat de travail' }, { v: 'bail', lib: 'Un bail' }],
      juste: 'transport',
      retour: 'Inès paie, Mondial Relay s’engage à transporter le colis : c’est un contrat de transport.' },
    // ── au fil du travail
    { id: 'axes-routiers', type: 'fil', de: 'romain', quand: apresGeste('localiser:hub:region'), reflexion: true,
      enonce: 'Un hub de colis s’installe près des grands axes routiers. Pourquoi, à ton avis ?',
      choix: [{ v: 'vite', lib: 'Les camions arrivent et repartent vite' },
        { v: 'km', lib: 'Les camions font moins de kilomètres pour relier toutes les villes' },
        { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Les deux premières réponses sont bonnes : des camions qui roulent vite et loin, c’est des colis qui arrivent plus tôt.' },
    { id: 'hub-temps', type: 'fil', de: 'romain', quand: apresGeste('fiche:voyage:voyage'), poids: 1.5, groupe: GROUPE,
      enonce: 'Au hub, combien de temps reste le colis d’Inès ?',
      choix: [{ v: 'heures', lib: 'Quelques heures' }, { v: 'jours', lib: `${joursAuRelais} jours` }, { v: 'mois', lib: 'Un mois' }],
      juste: 'heures',
      retour: 'Quelques heures : un hub ne stocke pas. Le colis arrive, il est trié, et il repart.' },
    { id: 'retrait-sept-jours', type: 'fil', de: 'romain', quand: apresGeste('fiche:voyage:envoyer'), apres: 'bilan', poids: 1.5, groupe: GROUPE,
      enonce: `L’acheteur passe chercher son colis au bout de ${JOURS_RETARD} jours. Que devient le colis ?`,
      choix: [{ v: 'attend', lib: 'Il attend encore au Point Relais' }, { v: 'retour', lib: 'Il est renvoyé au point de dépôt' },
        { v: 'jete', lib: 'Il est jeté' }],
      juste: 'retour',
      retour: `Un colis reste ${joursAuRelais} jours au Point Relais. Passé ce délai, il repart : l’acheteur arrive trop tard.` },
    { id: 'locker-27-kg', type: 'fil', de: 'romain', quand: apresGeste('fiche:colis:colis-1'), poids: 1, groupe: GROUPE,
      enonce: `Un colis pèse ${KG_LOURD} kg et mesure 50 × 30 × 30 cm. Peut-il aller en locker ?`,
      choix: [{ v: 'oui', lib: 'Oui, il peut aller en locker' },
        { v: 'relais', lib: `Non : il est trop lourd pour un locker, mais il peut aller au Point Relais` },
        { v: 'refuse', lib: 'Non : il est refusé' }],
      juste: 'relais',
      retour: `Un locker accepte ${locker.poidsMax} kg au plus. Ce colis dépasse, mais il passe au Point Relais (${relais.poidsMax} kg au plus).` },
    { id: 'petits-villages', type: 'fil', de: 'romain', quand: apresGeste('fiche:colis:envoyer'), apres: 'bilan', reflexion: true,
      enonce: 'En 2025, la presse a annoncé que Mondial Relay retire des Points Relais au profit des lockers. '
        + 'Pour le commerçant d’un petit village, quelle conséquence ?',
      choix: [{ v: 'clients', lib: 'Il voit passer moins de clients dans sa boutique' },
        { v: 'revenu', lib: 'Il perd les achats que les clients faisaient en venant chercher un colis' },
        { v: 'habitants', lib: 'Les habitants doivent aller plus loin pour retirer leurs colis' },
        { v: 'pas-pense', lib: 'Je n’y avais pas pensé' }],
      retour: 'Plusieurs réponses se tiennent : un Point Relais, c’est des clients qui passent dans la boutique et un service près de chez soi. '
        + 'Un locker automatique remplace le service, mais pas le commerçant.' },
  ],
};
