// Les questions d'ENT-7.2 — Decathlon, passer la commande (brief `docs/briefs/ENT-7.2-decathlon-ordre-de-transport.md` §4 bis et §4 ter,
// choix de Tristan du 14/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`.
// Personnes CONSTRUITES (Claire Vasseur, Mehdi Benali).
//
// AU FIL (3 notées : `part: 3`, 1 point chacune, corrigées tout de suite) :
// - `chiffre-controle` : Claire, quand l'élève a tapé le n° de conteneur (sortie de la case). Ancrée sur ce qu'il a tapé.
// - `reserves` : Claire, au premier geste sur les instructions de l'ordre. Éco-droit appliqué au cas (remplace la question « L. 133-3 »,
//   décision du 14/10/2026 : ce texte vise le transport intérieur ; ici, route internationale = CMR, barge = CMNI : on garde une réponse
//   juste sous tous les régimes, les réserves écrites sur le document de livraison à la réception).
// - `ecrit-et-oral` : Claire, au premier courriel envoyé.
// - `rdv-quai` : EN RÉSERVE (`actif: false`), Mehdi, à la pose du conteneur sur le planning ; corrigée au bilan.
// - `numero-quai` (réflexion non notée, au bilan) : Mehdi, au raccrochage. - `seulement-telephone` : « Pour réfléchir » du brief §4.
//
// AVANT DE COMMENCER : banque de 9 questions NON notées, 4 tirées par élève (2 préparation, 2 droit). d4 retirée (doublon de `reserves`) ;
// d5 AJOUTÉE par Claude Code : le moteur exige au moins le double de ce qu'on tire par rubrique (4 en droit pour en tirer 2).

import { apresGeste, apresPlanning } from '../../core/declencheurs.js';
import { EQUIPE } from '../decathlon.js';
import { ID, PLANNING_ID, DIALOGUE, FICHE, B, jeuEleve, ordre } from '../decathlon-ent72-donnees.js';

const tape = (db) => { const x = ordre(db).v[B.cont]; return x == null ? '' : String(x).trim(); };

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: { claire: EQUIPE.claire, mehdi: EQUIPE.mehdi },
  ouverture: { id: 'avant-de-commencer', de: 'claire', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, tu passes la commande d’un conteneur : un ordre de transport, un courriel, un appel au quai. Avant de commencer, lis les '
      + 'documents à gauche et réponds à mes questions.',
    documents: ['modele', 'cahier', 'avis', 'ecrit', 'pesee', 'droit'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['p1', 'p2', 'p3', 'p4', 'p5', 'd1', 'd2', 'd3', 'd5'] },
  liste: [
    // ── préparation (5 : l'élève en reçoit 2)
    { id: 'p1', type: 'ouverture', de: 'claire', doc: 'modele', rubrique: 'preparation', cle: true,
      enonce: 'Un ordre de transport, c’est…',
      aide: 'Regarde le modèle vierge à gauche ; le mot [[ordre de transport]] est dans le lexique.',
      choix: [{ v: 'commande', lib: 'le document par lequel le donneur d’ordre commande le transport et donne ses instructions' },
        { v: 'facture', lib: 'la facture du transporteur' }, { v: 'recu', lib: 'le reçu signé à l’arrivée' }],
      juste: 'commande',
      retour: 'C’est le document qui engage la commande : le transporteur y lit quoi enlever, où, pour quand, et avec quelles consignes.' },
    { id: 'p2', type: 'ouverture', de: 'claire', doc: 'cahier', rubrique: 'preparation', cle: true,
      enonce: 'Dans ce transport, qui est le donneur d’ordre ?',
      aide: 'Lis la première ligne du cahier des charges ; le mot [[donneur d’ordre]] est dans le lexique.',
      choix: [{ v: 'decathlon', lib: 'Decathlon' }, { v: 'contargo', lib: 'Contargo' }, { v: 'terminal', lib: 'Le terminal d’Anvers' }],
      juste: 'decathlon',
      retour: 'Le donneur d’ordre commande et paie le transport : c’est Decathlon. Contargo l’exécute.' },
    { id: 'p3', type: 'ouverture', de: 'claire', doc: 'avis', rubrique: 'preparation', cle: true,
      enonce: 'À quoi sert le scellé d’un conteneur ?',
      aide: 'Le mot [[scellé]] est dans le lexique.',
      choix: [{ v: 'preuve', lib: 'À prouver qu’il n’a pas été ouvert depuis son chargement.' }, { v: 'cle', lib: 'À le fermer à clé pendant le voyage.' },
        { v: 'poids', lib: 'À indiquer son poids.' }],
      juste: 'preuve',
      retour: 'Un scellé intact, dont le numéro est le bon, prouve que personne n’a ouvert le conteneur en route.' },
    { id: 'p4', type: 'ouverture', de: 'claire', doc: 'avis', rubrique: 'preparation',
      enonce: 'Où trouves-tu le numéro de scellé de ton conteneur ?',
      aide: 'Regarde l’avis, à gauche.',
      choix: [{ v: 'avis', lib: 'Sur l’avis de mise à disposition du terminal.' }, { v: 'devis', lib: 'Sur le devis de Contargo.' },
        { v: 'cahier', lib: 'Sur le cahier des charges.' }],
      juste: 'avis',
      retour: 'Le numéro vient du terminal qui a posé le scellé : tu le recopies depuis l’avis, caractère par caractère.' },
    { id: 'p5', type: 'ouverture', de: 'claire', doc: 'avis', rubrique: 'preparation',
      enonce: 'Sur l’avis, le poids est « brut vérifié ». Que veut dire « brut » ?',
      aide: 'Le mot [[poids brut vérifié]] est dans le lexique.',
      choix: [{ v: 'tout', lib: 'Marchandise, emballages et conteneur compris.' }, { v: 'marchandise', lib: 'La marchandise seule.' },
        { v: 'vide', lib: 'Le conteneur vide.' }],
      juste: 'tout',
      retour: 'Le poids brut est celui du conteneur plein, tout compris.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'd1', type: 'ouverture', de: 'claire', doc: 'ecrit', rubrique: 'droit', cle: true,
      enonce: 'Contargo dit n’avoir jamais reçu ta commande. Ton courriel avec l’ordre en pièce jointe peut-il servir de preuve ?',
      aide: 'Lis l’article 1366 du Code civil, à gauche.',
      choix: [{ v: 'oui', lib: 'Oui : un écrit électronique vaut un écrit papier, si l’on sait qu’il vient de toi et qu’il n’a pas été modifié.' },
        { v: 'papier', lib: 'Non : seul un papier signé compte.' }, { v: 'imprime', lib: 'Oui, mais seulement s’il est imprimé.' }],
      juste: 'oui',
      retour: 'L’écrit électronique a la même force probante que le papier, si la personne est identifiée et si le texte est conservé sans modification.' },
    { id: 'd2', type: 'ouverture', de: 'claire', doc: 'pesee', rubrique: 'droit',
      enonce: 'Pourquoi l’avis parle-t-il de poids « vérifié » ?',
      aide: 'Lis le document sur la pesée, à gauche.',
      choix: [{ v: 'regle', lib: 'Une règle internationale oblige à peser le conteneur avant de le charger sur un navire.' },
        { v: 'decathlon', lib: 'C’est Decathlon qui le pèse à Rouvignies.' }, { v: 'facultatif', lib: 'C’est facultatif, pour information.' }],
      juste: 'regle',
      retour: 'Depuis 2016, la convention SOLAS oblige à vérifier le poids du conteneur avant son embarquement.' },
    { id: 'd3', type: 'ouverture', de: 'claire', doc: 'droit', rubrique: 'droit',
      enonce: 'Les devis de la séance précédente donnaient le CO₂ de la prestation. Contargo y était-il obligé par la loi ?',
      aide: 'Lis la fin du document « Le droit », à gauche.',
      choix: [{ v: 'cahier', lib: 'Non, la loi ne l’impose pas encore pour un transport parti de l’étranger : c’est le cahier des charges de Decathlon qui l’exige.' },
        { v: 'loi', lib: 'Oui : la loi française l’impose pour tout transport, quel que soit le pays de départ.' },
        { v: 'commercial', lib: 'Non : c’est un simple geste commercial, personne ne l’exige.' }],
      juste: 'cahier',
      retour: 'Le Code des transports renvoie à plus tard les transports qui partent de l’étranger. Ici, c’est Decathlon qui exige le chiffre dans son cahier des charges.' },
    { id: 'd5', type: 'ouverture', de: 'claire', doc: 'pesee', rubrique: 'droit',
      enonce: 'Qui doit faire vérifier le poids d’un conteneur avant son chargement sur un navire ?',
      aide: 'Lis le document sur la pesée, à gauche.',
      choix: [{ v: 'chargeur', lib: 'Le chargeur : celui qui expédie la marchandise.' }, { v: 'transporteur', lib: 'Le transporteur qui récupère le conteneur à l’arrivée.' },
        { v: 'destinataire', lib: 'Le destinataire, Decathlon Rouvignies.' }],
      juste: 'chargeur',
      retour: 'La pesée se fait avant l’embarquement, donc au départ : elle pèse sur le chargeur.' },
    // ── au fil du travail (notées : 1 point chacune, corrigées tout de suite)
    { id: 'chiffre-controle', type: 'fil', de: 'claire', quand: apresGeste(`fiche:${FICHE}:${B.cont}`), poids: 1,
      selon: (db) => ({ enonce: tape(db) ? `Tu viens de taper « ${tape(db)} ». À quoi sert le dernier chiffre d’un numéro de conteneur ?`
        : 'À quoi sert le dernier chiffre du numéro de conteneur que tu viens de taper ?' }),
      enonce: 'À quoi sert le dernier chiffre du numéro de conteneur que tu viens de taper ?',
      choix: [{ v: 'controle', lib: 'C’est un chiffre de contrôle : il fait repérer une erreur de saisie.' }, { v: 'lot', lib: 'C’est le nombre de conteneurs du lot.' },
        { v: 'quai', lib: 'C’est le numéro du quai d’arrivée.' }, { v: 'rien', lib: 'Il ne sert à rien, on peut l’oublier.' }],
      juste: 'controle', groupe: 'Question de Claire : le numéro de conteneur',
      retour: 'Le dernier chiffre est calculé à partir des autres : si on se trompe d’un chiffre en recopiant, il ne colle plus. D’où le « caractère par caractère ».' },
    { id: 'reserves', type: 'fil', de: 'claire', quand: apresGeste(`fiche:${FICHE}:${B.inst}`), poids: 1,
      enonce: 'Le conteneur arrive : scellé intact, mais trois cartons écrasés. Que fais-tu pour que Decathlon garde un recours contre le transporteur ?',
      choix: [{ v: 'reserves', lib: 'J’écris des réserves précises sur le document de livraison, à la réception, avant que le chauffeur reparte.' },
        { v: 'rien', lib: 'Rien : le scellé intact prouve que tout va bien.' }, { v: 'facture', lib: 'Je le signale à la fin du mois, sur la facture.' },
        { v: 'douane', lib: 'Je préviens la douane d’Anvers.' }],
      juste: 'reserves', groupe: 'Question de Claire : un dommage à l’arrivée',
      retour: 'Un scellé intact ne dit rien des cartons écrasés. Les réserves écrites à la réception, sur le document de livraison, gardent le recours de Decathlon.' },
    { id: 'ecrit-et-oral', type: 'fil', de: 'claire', quand: apresGeste('courriel:envoyer'), poids: 1,
      enonce: 'Tu as envoyé l’ordre par écrit, et tu vas appeler le quai. Pourquoi pas tout par téléphone ?',
      choix: [{ v: 'trace', lib: 'L’écrit garde la trace de ce qui engage : conteneur, dates, instructions.' }, { v: 'cout', lib: 'Le téléphone coûte plus cher.' },
        { v: 'repond', lib: 'Le prestataire ne répond jamais au téléphone.' }, { v: 'pareil', lib: 'C’est pareil, c’est une habitude.' }],
      juste: 'trace', groupe: 'Question de Claire : l’écrit et l’oral',
      retour: 'Ce qui engage (conteneur, dates, instructions) s’écrit et se conserve. L’oral sert à s’organiser vite, comme pour ton créneau.' },
    // ── en réserve et en réflexion
    { id: 'rdv-quai', type: 'fil', de: 'mehdi', actif: false, quand: apresGeste(`planning:${PLANNING_ID}:poser`), poids: 1, apres: 'bilan',
      enonce: 'Pourquoi Decathlon impose-t-il un rendez-vous au quai ?',
      choix: [{ v: 'attente', lib: 'Pour décharger chaque camion sans attente et sans bloquer les autres quais.' }, { v: 'facturer', lib: 'Pour facturer le transporteur.' },
        { v: 'ferme', lib: 'Parce que le quai ferme à midi.' }],
      juste: 'attente', groupe: 'Question de Mehdi : le rendez-vous au quai',
      retour: 'Un quai ne reçoit qu’un camion à la fois : le rendez-vous évite les files de camions.' },
    { id: 'numero-quai', type: 'fil', de: 'mehdi', quand: apresGeste(`dialogue:${DIALOGUE}:fin`), reflexion: true, libre: true, apres: 'bilan',
      selon: (db) => ({ enonce: `Tu m’as donné le numéro du conteneur, ${jeuEleve(db).conteneur}. Pourquoi pas seulement « la collection printemps » ?` }),
      enonce: 'Tu m’as donné le numéro du conteneur. Pourquoi pas seulement « la collection printemps » ?',
      retour: 'J’en reçois dix par semaine : seul le numéro me dit de quel conteneur on parle. Avec lui, je retrouve ton avis et ton ordre sans me tromper.' },
    { id: 'seulement-telephone', type: 'fil', de: 'claire', quand: apresPlanning(PLANNING_ID), reflexion: true, libre: true, apres: 'bilan',
      enonce: 'Pour réfléchir : tu as écrit au prestataire et téléphoné au quai. Qu’est-ce qui se passerait si tu avais seulement téléphoné à Contargo ?',
      retour: 'Sans écrit, Contargo n’aurait aucune trace de ta commande : ni numéro de conteneur, ni dates, ni instructions. En cas de litige, rien à montrer.' },
  ],
};
