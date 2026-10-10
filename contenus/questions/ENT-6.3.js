// Les questions d'ENT-6.3 — France Boissons, les congés d'été (brief `docs/briefs/ENT-6.3-france-boissons-conges.md` §4 bis et §4 ter ;
// propositions de Cowork `docs/briefs/france-boissons/PROPOSITIONS-questions-au-fil.md` et `BANQUE-avant-de-commencer.md`, toutes gardées
// par Tristan le 10/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`.
// Personnes et situations CONSTRUITES.
//
// AU FIL (5, dont 2 notées : `part: 3`, 1,5 point chacune) :
// - `que-regardes-tu` : Karim, au premier geste sur le planning, réflexion corrigée au bilan (elle guiderait le 1er envoi).
// - `depart-kevin` : point d'étape d'Inès après le 1er envoi, RÉFLEXION non notée (décision de Tristan du 10/10/2026 : aucun texte de loi
//   ne définit la démission) ; il garde fermé le planning de la reprise jusqu'à la réponse.
// - `pourquoi-raison` : Inès, au choix de la phrase « raison » du message à Lucas, réflexion.
// - `pourquoi-cdd` (NOTÉE, L1242-2 3°) et `age-candidat` (NOTÉE, L1132-1) : Karim, à l'envoi de l'annonce, l'une après l'autre ;
//   corrigées au bilan (elles diraient le contrat et la mention « Moins de 30 ans » avant une correction).
//
// AVANT DE COMMENCER : une banque de 8 questions NON notées, 4 tirées par élève (2 de préparation, 2 de droit), la calculette du site
// (`calculette: true` : les questions à valeurs tirées demandent un calcul). Aucune ne porte sur une mention de l'annonce, le contrat ou
// les dates du CDD (jalons). Valeurs tirées (`variante`) : `demande-ancienne` (prénoms hors de l'équipe de Karim, dates de mars à mai),
// `conges-acquis` (m de 2 à 10, pair), `plafond-30` (m de 13 à 16), `essai-cdd` (w parmi 3, 4, 5, 8, 9, 10, 12 : jamais 6 ou 7, la durée
// du CDD de l'annonce). La clé de la bonne réponse est la même pour tous ; seuls les textes changent. `cle: true` = à reprendre en évaluation.
// Textes de loi dans le document « Le droit » de la séance (relus le 10/10/2026 sur code.travail.gouv.fr).

import { apresGeste, apresPlanning } from '../../core/declencheurs.js';
import { EQUIPE } from '../france-boissons.js';

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin'];
const PRENOMS = ['Mathieu', 'Sarah', 'Nordine', 'Chloé', 'Hugo', 'Léna', 'Rayan', 'Manon'];
const virgule = (x) => String(x).replace('.', ',');

// Deux préparateurs, deux dates de demande (mars à mai) ; l'ordre de l'énoncé est tiré (le premier nommé n'est pas toujours le premier).
const varianteDemande = (h) => {
  const [a, b] = h.prendre(PRENOMS, 2);
  const jour = () => ({ m: h.entier(2, 4), j: h.entier(1, 28) });
  let d1 = jour(), d2 = jour();
  while (d1.m === d2.m && d1.j === d2.j) d2 = jour();
  const avant = d1.m < d2.m || (d1.m === d2.m && d1.j < d2.j);
  const [premier, second] = avant ? [a, b] : [b, a];
  const lib = (d) => `${d.j === 1 ? '1er' : d.j} ${MOIS[d.m]}`;
  return {
    enonce: `Deux préparateurs veulent la même semaine de congé. ${a} a demandé le ${lib(d1)}, ${b} le ${lib(d2)}. D’après la règle de la plateforme, qui garde sa date ?`,
    libs: { premier, second, sort: 'On tire au sort' },
    retour: `${premier} a demandé le premier : sa demande est la plus ancienne, elle garde sa date. On décale l’autre, le moins possible.`,
  };
};
const varianteAcquis = (h) => {
  const m = 2 * h.entier(1, 5);
  return {
    enonce: `Un chauffeur travaille depuis ${m} mois chez France Boissons. Combien de jours de congé a-t-il acquis ?`,
    libs: { '25': `${virgule(m * 2.5)} jours ouvrables`, '2': `${m * 2} jours ouvrables`, '1': `${m} jours ouvrables` },
    retour: `2,5 jours ouvrables par mois travaillé : ${m} × 2,5 = ${virgule(m * 2.5)} jours. Sur une année entière, cela fait 30 jours (5 semaines).`,
  };
};
const variantePlafond = (h) => {
  const m = h.entier(13, 16);
  return {
    enonce: `Un chauffeur a travaillé ${m} mois sur la période de calcul de ses congés. Combien de jours de congé peut-il exiger au plus ?`,
    libs: { '30': '30 jours ouvrables', calcul: `${virgule(m * 2.5)} jours ouvrables`, '24': '24 jours ouvrables' },
    retour: `2,5 jours par mois, mais jamais plus de 30 jours ouvrables : ${m} × 2,5 dépasse 30, il peut en exiger 30.`,
  };
};
const varianteEssai = (h) => {
  const w = h.choisir([3, 4, 5, 8, 9, 10, 12]);
  return {
    enonce: `Un préparateur saisonnier est embauché en CDD de ${w} semaines. Sa période d’essai peut durer au plus…`,
    libs: { jours: `${w} jours`, mois: '1 mois', aucune: 'Il n’y a pas de période d’essai en CDD' },
    retour: `Un jour par semaine de contrat : ${w} semaines, ${w} jours au plus. Et jamais plus de 2 semaines pour un contrat de 6 mois ou moins.`,
  };
};

export const QUESTIONS = {
  id: 'france-boissons-conges',
  part: 3,
  personnes: { ines: EQUIPE.ines, karim: EQUIPE.karim, lucas: EQUIPE.lucas },
  ouverture: { id: 'avant-de-commencer', de: 'ines', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Les chauffeurs ont posé leurs congés d’été, et Karim attend le planning ce soir. Avant de commencer, lis les documents à gauche et réponds à mes questions.',
    calculette: true,
    documents: ['cartes', 'regle', 'annuaire', 'fiche-de-poste', 'droit'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['qui-decide-conges-2', 'besoin-semaine', 'demande-ancienne', 'annonce-sert',
      'conges-acquis', 'plafond-30', 'bloc-24-jours', 'essai-cdd'] },
  etapes: [
    { id: 'avant-reprise', de: 'ines', apres: apresPlanning('fb-conges'),
      ferme: 'ecran:planning', titre: 'Point d’étape avant de reprendre le planning', continuer: 'reprendre le planning',
      situation: 'J’ai bien ton planning. Karim vient de me prévenir : Kevin nous quitte (mon message est dans la Messagerie). Avant que tu reprennes le planning, une question.',
      questions: ['depart-kevin'] },
  ],
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'qui-decide-conges-2', type: 'ouverture', de: 'ines', doc: 'annuaire', rubrique: 'preparation', cle: true,
      enonce: 'Qui décide des congés des chauffeurs ?',
      aide: 'Regarde l’annuaire : la fiche de Karim et la mienne. Qui est le chef des chauffeurs ?',
      choix: [{ v: 'karim', lib: 'Karim, leur responsable ; Inès les enregistre' },
        { v: 'ines', lib: 'Inès' },
        { v: 'helene', lib: 'Hélène' },
        { v: 'chacun', lib: 'Chaque chauffeur pour lui-même' }],
      juste: 'karim',
      retour: 'Karim décide (lien hiérarchique) ; moi, je mets en forme et j’informe (lien fonctionnel).' },
    { id: 'besoin-semaine', type: 'ouverture', de: 'ines', doc: 'cartes', rubrique: 'preparation',
      enonce: 'Dans le planning, le « besoin » d’une semaine, c’est…',
      aide: 'Lis la règle de la plateforme : combien de chauffeurs faut-il chaque semaine ? Le mot [[effectif]] est dans le lexique.',
      choix: [{ v: 'travail', lib: 'Le nombre de chauffeurs qui doivent être au travail cette semaine' },
        { v: 'conge', lib: 'Le nombre de chauffeurs en congé' },
        { v: 'tournees', lib: 'Le nombre de tournées' }],
      juste: 'travail',
      retour: 'Si trop de chauffeurs partent la même semaine, il manque du monde pour les tournées.' },
    { id: 'demande-ancienne', type: 'ouverture', de: 'ines', doc: 'regle', rubrique: 'preparation', variante: varianteDemande,
      enonce: 'Deux préparateurs veulent la même semaine de congé. Mathieu a demandé le 3 mars, Sarah le 12 avril. D’après la règle de la plateforme, qui garde sa date ?',
      aide: 'Lis la règle de la plateforme : en cas de conflit, quelle demande garde sa date ? Le mot [[priorité]] est dans le lexique.',
      choix: [{ v: 'premier', lib: 'Mathieu' }, { v: 'second', lib: 'Sarah' }, { v: 'sort', lib: 'On tire au sort' }],
      juste: 'premier',
      retour: 'La demande la plus ancienne garde sa date ; on décale l’autre, le moins possible.' },
    { id: 'annonce-sert', type: 'ouverture', de: 'ines', doc: 'fiche-de-poste', rubrique: 'preparation',
      enonce: 'À quoi sert une annonce d’emploi ?',
      aide: 'Pense à ce qui se passe avant l’embauche : il faut d’abord que des personnes sachent que le poste existe.',
      choix: [{ v: 'candidatures', lib: 'À faire connaître le poste pour recevoir des candidatures' },
        { v: 'signer', lib: 'À signer le contrat' },
        { v: 'salaire', lib: 'À fixer le salaire de chaque candidat' }],
      juste: 'candidatures',
      retour: 'L’annonce attire les candidats ; Karim choisira, Hélène validera.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'conges-acquis', type: 'ouverture', de: 'ines', doc: 'droit', rubrique: 'droit', cle: true, variante: varianteAcquis,
      enonce: 'Un chauffeur travaille depuis 4 mois chez France Boissons. Combien de jours de congé a-t-il acquis ?',
      aide: 'Lis l’article L3141-3 dans « Le droit » : combien de jours par mois de travail ? Les [[jours ouvrables]] sont dans le lexique. La calculette du site est là pour toi.',
      choix: [{ v: '25', lib: '10 jours ouvrables' }, { v: '2', lib: '8 jours ouvrables' }, { v: '1', lib: '4 jours ouvrables' }],
      juste: '25',
      retour: '2,5 jours ouvrables par mois travaillé : 4 × 2,5 = 10 jours. Sur une année entière, cela fait 30 jours (5 semaines).' },
    { id: 'plafond-30', type: 'ouverture', de: 'ines', doc: 'droit', rubrique: 'droit', variante: variantePlafond,
      enonce: 'Un chauffeur a travaillé 14 mois sur la période de calcul de ses congés. Combien de jours de congé peut-il exiger au plus ?',
      aide: 'Lis la deuxième phrase de l’article L3141-3 dans « Le droit » : la durée totale a une limite.',
      choix: [{ v: '30', lib: '30 jours ouvrables' }, { v: 'calcul', lib: '35 jours ouvrables' }, { v: '24', lib: '24 jours ouvrables' }],
      juste: '30',
      retour: '2,5 jours par mois, mais jamais plus de 30 jours ouvrables : 14 × 2,5 dépasse 30, il peut en exiger 30.' },
    { id: 'bloc-24-jours', type: 'ouverture', de: 'ines', doc: 'droit', rubrique: 'droit',
      enonce: 'Un chauffeur demande 5 semaines de congé d’affilée en août. Karim doit-il les accorder d’un seul bloc ?',
      aide: 'Lis l’article L3141-17 dans « Le droit » : combien de jours peut-on prendre en une seule fois ? Une semaine compte 6 [[jours ouvrables]].',
      choix: [{ v: 'non24', lib: 'Non : un congé pris en une seule fois ne dépasse pas 24 jours ouvrables (4 semaines), sauf cas prévus par la loi' },
        { v: 'oui', lib: 'Oui : il a 30 jours, il les prend comme il veut' },
        { v: 'non1', lib: 'Non : un congé d’été ne dépasse jamais 1 semaine' }],
      juste: 'non24',
      retour: '24 jours ouvrables au plus d’un coup ; la loi prévoit des exceptions (éloignement, enfant ou proche à charge).' },
    { id: 'essai-cdd', type: 'ouverture', de: 'ines', doc: 'droit', rubrique: 'droit', variante: varianteEssai,
      enonce: 'Un préparateur saisonnier est embauché en CDD de 4 semaines. Sa période d’essai peut durer au plus…',
      aide: 'Lis l’article L1242-10 dans « Le droit » : la période d’essai d’un CDD se calcule par semaine de contrat.',
      choix: [{ v: 'jours', lib: '4 jours' }, { v: 'mois', lib: '1 mois' }, { v: 'aucune', lib: 'Il n’y a pas de période d’essai en CDD' }],
      juste: 'jours',
      retour: 'Un jour par semaine de contrat : 4 semaines, 4 jours au plus. Et jamais plus de 2 semaines pour un contrat de 6 mois ou moins.' },
    // ── au fil du travail
    { id: 'que-regardes-tu', type: 'fil', de: 'karim', quand: apresGeste('planning:fb-conges:poser'), reflexion: true, apres: 'bilan',
      enonce: 'Tu poses un congé sur le planning. Que regardes-tu d’abord ?',
      choix: [{ v: 'besoin', lib: 'Le nombre de chauffeurs qu’il faut cette semaine' },
        { v: 'anciennete', lib: 'Qui a demandé le premier' },
        { v: 'cote', lib: 'Qui connaît la côte' },
        { v: 'rien', lib: 'Rien de spécial' }],
      retour: 'Les trois premiers comptent : ce sont les règles du planning. Assez de chauffeurs chaque semaine, la demande la plus ancienne d’abord, et toujours quelqu’un qui connaît la côte.' },
    { id: 'depart-kevin', type: 'transition', de: 'ines', reflexion: true,
      enonce: 'Kevin quitte France Boissons parce qu’il a trouvé un poste près de chez lui. Comment s’appelle ce départ ?',
      choix: [{ v: 'demission', lib: 'Une démission : c’est lui qui rompt son contrat' },
        { v: 'licenciement', lib: 'Un licenciement : c’est Karim qui le renvoie' },
        { v: 'fin-cdd', lib: 'Une fin de CDD' },
        { v: 'sanction', lib: 'Une sanction' }],
      retour: 'C’est Kevin qui part, de lui-même : on parle de démission. Un licenciement, c’est l’employeur qui décide ; un CDD s’arrête à sa date. Pour nous, il faut surtout reprendre le planning sans lui.' },
    { id: 'pourquoi-raison', type: 'fil', de: 'ines', quand: apresGeste('messagerie:phrase:raison'), reflexion: true,
      enonce: 'Pourquoi faut-il donner la raison à Lucas, et pas seulement la décision ?',
      choix: [{ v: 'comprendre', lib: 'Pour qu’il comprenne, et puisse en parler à Karim' },
        { v: 'helene', lib: 'Pour se justifier devant Hélène' },
        { v: 'inutile', lib: 'Ce n’est pas utile' }],
      retour: 'Une décision expliquée se comprend mieux, même quand elle déçoit. Lucas sait pourquoi, et à qui en parler.' },
    { id: 'pourquoi-cdd', type: 'fil', de: 'karim', quand: apresGeste('fiche:annonce:envoyer'), apres: 'bilan',
      enonce: 'Pour ce poste d’été, la loi permet un CDD saisonnier. Pourquoi ? (Le texte est dans « Le droit ».)',
      choix: [{ v: 'saison', lib: 'Le travail revient chaque été, à peu près aux mêmes dates' },
        { v: 'cout', lib: 'Un CDD coûte moins cher' },
        { v: 'veut', lib: 'Le saisonnier ne veut pas de CDI' }],
      juste: 'saison', groupe: 'Question de Karim : pourquoi un CDD saisonnier',
      retour: 'Le pic de l’été revient chaque année : c’est un emploi saisonnier, un des cas où la loi permet le CDD (article L1242-2, 3°).' },
    { id: 'age-candidat', type: 'fil', de: 'karim', quand: apresGeste('fiche:annonce:envoyer'), apres: 'bilan',
      enonce: 'Un candidat de 52 ans répond à ton annonce, avec son permis B. Puis-je écarter sa candidature à cause de son âge ?',
      choix: [{ v: 'non', lib: 'Non : c’est une discrimination, interdite' },
        { v: 'physique', lib: 'Oui, le poste est physique' },
        { v: 'annonce', lib: 'Oui, si l’annonce le disait' }],
      juste: 'non', groupe: 'Question de Karim : l’âge d’un candidat',
      retour: 'L’âge est un des critères interdits, y compris au recrutement (article L1132-1). On regarde ce qui sert au poste : le permis, la manutention.' },
  ],
};
