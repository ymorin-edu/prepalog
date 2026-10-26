// Les questions d'ENT-12.5 — IKEA, « les quais du mardi » (brief `docs/briefs/ENT-12.5-ikea-les-quais-du-mardi.md` §4 bis et §4 ter ; choix de Tristan du 26/10/2026 : propositions du brief
// prises telles quelles). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Samir est CONSTRUIT.
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions de Samir ») : `pourquoi-rdv` (au premier camion posé, 1,5, corrigée tout de suite), `semi-quai-26` (à l'envoi du
// premier planning, 1,5, corrigée tout de suite : posée à tous, le moteur ne sait pas la poser à l'élève qui a fait l'erreur), `quai-pris` (après le planning refait, 1, corrigée AU BILAN).
// RÉFLEXION non notée : `attente-chauffeur` (★ éco-droit : le temps d'attente du chauffeur est du temps de travail ; Code du travail, durée du travail effectif — reformulé, non cité).
// « Avant de commencer » : NON noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (4 + 2) ; la question `duree` a des VALEURS TIRÉES (nombre de palettes).

import { apresGeste, apresPlanning, apresFiche } from '../../core/declencheurs.js';
import { ID, PL, FICHE_SAMIR } from '../ikea-ent125-donnees.js';

const GROUPE = 'Les questions de Samir';
const SAMIR = { nom: 'Samir', role: 'chef d’équipe de la réception', appel: 'Samir' };
const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'samir', doc, rubrique, enonce, choix, juste, retour, ...o });
const hm = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`);

// `duree` : N palettes à 2 min chacune. Valeurs tirées.
const varianteDuree = (h) => {
  const n = h.choisir([18, 22, 26, 28, 32]);
  return {
    enonce: `${n} palettes à 2 min chacune : le déchargement prend…`,
    libs: { juste: hm(n * 2), moitie: hm(n), double: hm(n * 4) },
    retour: `${n} palettes × 2 min = ${hm(n * 2)}.`,
  };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { samir: SAMIR },
  ouverture: { id: 'avant-de-commencer', de: 'samir', titre: 'Avant de commencer', continuer: 'voir l’accueil', calculette: true,
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['poste-125', 'camions-125', 'quais-125', 'droit-125'],
    tirage: { preparation: 2, droit: 1 },
    questions: ['quai', 'rdv', 'duree', 'semi', 'attente', 'pause'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    q('quai', 'preparation', 'poste-125', 'Un quai, c’est…',
      [{ v: 'camion', lib: 'l’endroit où un camion se met à l’arrière pour être chargé ou déchargé' }, { v: 'parking', lib: 'le parking des salariés' }, { v: 'bureau', lib: 'le bureau du chef' }], 'camion',
      'Le camion recule contre le quai : on décharge directement dans l’entrepôt.', { cle: true }),
    q('rdv', 'preparation', 'poste-125', 'Un rendez-vous de réception, c’est…',
      [{ v: 'creneau', lib: 'le créneau donné à un camion pour décharger' }, { v: 'depart', lib: 'l’heure de départ du chauffeur' }, { v: 'reunion', lib: 'une réunion de l’équipe' }], 'creneau',
      'Le rendez-vous dit à quel quai et à quelle heure le camion décharge.', { cle: true }),
    q('duree', 'preparation', 'camions-125', '26 palettes à 2 min chacune : le déchargement prend…',
      [{ v: 'juste', lib: '52 min' }, { v: 'moitie', lib: '26 min' }, { v: 'double', lib: '1 h 44' }], 'juste',
      '26 palettes × 2 min = 52 min.', { cle: true, variante: varianteDuree }),
    q('semi', 'preparation', 'quais-125', 'Une semi-remorque, c’est…',
      [{ v: 'tracteur', lib: 'un tracteur et une remorque, jusqu’à 33 palettes' }, { v: 'petit', lib: 'un petit camion' }, { v: 'camionnette', lib: 'une camionnette' }], 'tracteur',
      'Une semi-remorque est un tracteur attelé à une remorque : elle porte beaucoup de palettes.', { cle: true }),
    // ── droit (2 : l'élève en reçoit 1)
    q('attente', 'droit', 'droit-125', 'Un chauffeur attend 2 h devant le quai, payé par son employeur. Ce temps est…',
      [{ v: 'travail', lib: 'du temps de travail' }, { v: 'pause', lib: 'une pause' }, { v: 'repos', lib: 'du repos' }], 'travail',
      'Le chauffeur n’est pas libre de partir : il est à la disposition de son employeur, son attente est du temps de travail.'),
    q('pause', 'droit', 'droit-125', 'Pendant sa pause, un cariste peut quitter son poste et s’occuper librement de ses affaires. Ce temps est…',
      [{ v: 'libre', lib: 'un temps libre, qui n’est pas du travail effectif' }, { v: 'travail', lib: 'du temps de travail effectif' }, { v: 'paye', lib: 'toujours du temps de travail payé en plus' }], 'libre',
      'Le salarié n’est plus à la disposition de son employeur : c’est ce qui distingue une vraie pause d’une attente.'),
    // ── au fil du travail : trois questions notées, une réflexion
    { id: 'pourquoi-rdv', type: 'fil', de: 'samir', groupe: GROUPE, poids: 1.5, quand: apresGeste(`planning:${PL}:poser`),
      enonce: 'Pourquoi donne-t-on un rendez-vous à chaque camion ?',
      choix: [{ v: 'attente', lib: 'Pour éviter l’attente des camions et les quais bloqués' }, { v: 'chauffeur', lib: 'Pour faire plaisir au chauffeur' }, { v: 'loi', lib: 'Parce que la loi l’oblige' }],
      juste: 'attente', retour: 'Sans rendez-vous, les camions arrivent en même temps et se gênent : certains attendent devant la porte, les quais sont bloqués, et l’équipe n’a plus de travail réparti.' },
    { id: 'semi-quai-26', type: 'fil', de: 'samir', groupe: GROUPE, poids: 1.5, quand: apresPlanning(PL),
      enonce: 'Pourquoi une semi-remorque ne peut-elle pas décharger au quai 26 ?',
      choix: [{ v: 'hauteur', lib: 'C’est un quai pour porteurs : sa hauteur ne convient pas à une semi-remorque' }, { v: 'loin', lib: 'Il est trop loin' }, { v: 'ferme', lib: 'Il est fermé' }],
      juste: 'hauteur', retour: 'Chaque quai est réglé pour un type de camion. Le quai 26 est celui des porteurs : une semi-remorque n’y est pas à la bonne hauteur.' },
    { id: 'quai-pris', type: 'fil', de: 'samir', groupe: GROUPE, poids: 1, apres: 'bilan', quand: apresPlanning(PL, 2),
      enonce: 'Le camion d’Allemagne a 30 palettes à 2 min chacune. Combien de temps son quai reste-t-il pris ?',
      choix: [{ v: 'heure', lib: '1 h' }, { v: 'demi', lib: '30 min' }, { v: 'deux', lib: '2 h' }], juste: 'heure',
      retour: '30 palettes × 2 min = 60 min : 1 h. Pendant ce temps, aucun autre camion ne peut décharger à ce quai.' },
    { id: 'attente-chauffeur', type: 'fil', de: 'samir', reflexion: true, quand: apresFiche(FICHE_SAMIR),
      enonce: 'Un chauffeur attend 3 h devant la porte parce que personne n’a prévu de quai. Ce temps d’attente, c’est…',
      choix: [{ v: 'travail', lib: 'du temps de travail pour lui, que son employeur paie' }, { v: 'pause', lib: 'une pause' }, { v: 'rien', lib: 'rien' }],
      retour: 'Le chauffeur est à la disposition de son employeur et ne peut pas partir : c’est du temps de travail. Une attente mal préparée coûte donc de l’argent à quelqu’un.' },
  ],
};
