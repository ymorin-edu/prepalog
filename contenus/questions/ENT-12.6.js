// Les questions d'ENT-12.6 — IKEA, « l'armoire de Mme Benali » (brief `docs/briefs/ENT-12.6-ikea-larmoire-de-mme-benali.md` §4 bis et §4 ter ; choix de Tristan du 26/10/2026 : propositions du
// brief prises telles quelles). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Moussa est CONSTRUIT.
//
// QUESTIONS NOTÉES (`part: 4`, une seule ligne au bandeau de fin, « Les questions de Moussa ») : `lourd-dabord` (au premier colis déplacé, 1,5, corrigée tout de suite), `pourquoi-deux`
// (au premier colis classé seul ou à deux, 1,5, corrigée tout de suite), `ton-parcours` (à l'envoi de l'ordre, 1, corrigée AU BILAN ; son texte est CALCULÉ sur le parcours de l'élève).
// RÉFLEXION non notée : `soixante-kg` (★ éco-droit : porter 60 kg tous les jours ; Code du travail, art. R4541-9 — reformulé, non cité, à relire sur Légifrance).
// « Avant de commencer » : NON noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6 (4 + 2) ; la question `volume` a des VALEURS TIRÉES (dimensions).

import { apresGeste, apresFiche } from '../../core/declencheurs.js';
import { ID, FICHES, colisDe, ordreDepart, longueurParcours, meilleurParcours, champDeux } from '../ikea-ent126-donnees.js';

const GROUPE = 'Les questions de Moussa';
const MOUSSA = { nom: 'Moussa', role: 'collègue préparateur', appel: 'Moussa' };
const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'moussa', doc, rubrique, enonce, choix, juste, retour, ...o });
const mlib = (x) => String(Math.round(x * 1000) / 1000).replace('.', ',');

// `volume` : un colis de L m × l m × h m. Valeurs tirées.
const varianteVolume = (h) => {
  const L = h.choisir([1.5, 2, 2.5]), l = h.choisir([0.4, 0.5, 0.6]), ha = h.choisir([0.2, 0.4, 0.5]);
  const v = Math.round(L * l * ha * 1000) / 1000, somme = Math.round((L + l + ha) * 1000) / 1000;
  return {
    enonce: `Un colis de ${mlib(L)} m × ${mlib(l)} m × ${mlib(ha)} m fait…`,
    libs: { juste: `${mlib(v)} m³`, somme: `${mlib(somme)} m³`, double: `${mlib(Math.round(v * 20) / 10)} m³` },
    retour: `Volume = longueur × largeur × hauteur : ${mlib(L)} × ${mlib(l)} × ${mlib(ha)} = ${mlib(v)} m³.`,
  };
};
// Le texte du parcours de l'élève (calculé UNE FOIS, à l'arrivée de la question).
const texteParcours = (db) => {
  const colis = colisDe(db), f = db && db.fiches && db.fiches[FICHES.ordre];
  const ordre = (f && f.valeurs && Array.isArray(f.valeurs.ordre) && f.valeurs.ordre.length === colis.length) ? f.valeurs.ordre : ordreDepart(db);
  const mien = longueurParcours(ordre, colis), court = meilleurParcours(colis).m;
  return { enonce: `Ton parcours fait ${mien} m. Le plus court qui garde les lourds et longs d’abord et les fragiles à la fin fait ${court} m. Qu’est-ce qui aurait raccourci le tien ?` };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { moussa: MOUSSA },
  ouverture: { id: 'avant-de-commencer', de: 'moussa', titre: 'Avant de commencer', continuer: 'voir l’accueil', calculette: true,
    situation: 'Salut ! Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['poste-126', 'regles-126', 'droit-126'],
    tirage: { preparation: 2, droit: 1 },
    questions: ['bon', 'ordre', 'volume', 'dos', 'charge', 'consigne'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    q('bon', 'preparation', 'poste-126', 'Un bon de préparation dit…',
      [{ v: 'quoi', lib: 'quels articles prendre, combien, et où' }, { v: 'prix', lib: 'le prix de la commande' }, { v: 'client', lib: 'le client à appeler' }], 'quoi',
      'Le bon de préparation est la liste de ce qu’il faut prendre : les articles, les quantités et les emplacements.', { cle: true }),
    q('ordre', 'preparation', 'regles-126', 'Sur un chariot, on met en bas…',
      [{ v: 'lourds', lib: 'les colis lourds' }, { v: 'fragiles', lib: 'les colis fragiles' }, { v: 'petits', lib: 'les petits colis' }], 'lourds',
      'Les colis lourds vont en bas : ils sont stables et n’écrasent rien. Les fragiles se mettent en haut, à la fin.', { cle: true }),
    q('volume', 'preparation', 'regles-126', 'Un colis de 2 m × 0,6 m × 0,5 m fait…',
      [{ v: 'juste', lib: '0,6 m³' }, { v: 'somme', lib: '3,1 m³' }, { v: 'double', lib: '6 m³' }], 'juste',
      'Volume = longueur × largeur × hauteur : 2 × 0,6 × 0,5 = 0,6 m³.', { cle: true, variante: varianteVolume }),
    q('dos', 'preparation', 'regles-126', 'Pour soulever un colis lourd, on…',
      [{ v: 'jambes', lib: 'plie les jambes, garde le dos droit, et demande de l’aide si besoin' }, { v: 'penche', lib: 'se penche en avant, jambes tendues' }, { v: 'coup', lib: 'le tire d’un coup' }], 'jambes',
      'On travaille avec les jambes, dos droit, et on ne reste pas seul face à un colis trop lourd.', { cle: true }),
    // ── droit (2 : l'élève en reçoit 1)
    q('charge', 'droit', 'droit-126', 'Un salarié doit porter plus de 55 kg tous les jours. Il faut…',
      [{ v: 'medecin', lib: 'que le médecin du travail l’ait reconnu apte' }, { v: 'chef', lib: 'seulement l’accord du chef' }, { v: 'rien', lib: 'rien de particulier' }], 'medecin',
      'Au-delà de 55 kg portés de façon habituelle, l’aptitude du salarié doit être reconnue par le médecin du travail.'),
    q('consigne', 'droit', 'droit-126', 'La consigne de la zone dit « à deux dès 25 kg », plus prudente que la loi. Un salarié…',
      [{ v: 'respecte', lib: 'doit la respecter : les consignes de l’entreprise s’imposent à lui' }, { v: 'ignore', lib: 'peut l’ignorer, la loi est moins stricte' }, { v: 'choisit', lib: 'la respecte seulement s’il en a envie' }], 'respecte',
      'Une entreprise peut être plus prudente que la loi, et ses consignes de sécurité s’imposent aux salariés.'),
    // ── au fil du travail : trois questions notées, une réflexion
    { id: 'lourd-dabord', type: 'fil', de: 'moussa', groupe: GROUPE, poids: 1.5, quand: apresGeste(`fiche:${FICHES.ordre}:ordre`),
      enonce: 'Pourquoi commencer par le plus lourd ?',
      choix: [{ v: 'bas', lib: 'Il va en bas du chariot et n’écrase rien' }, { v: 'proche', lib: 'Il est plus près du quai' }, { v: 'vite', lib: 'C’est plus rapide' }],
      juste: 'bas', retour: 'Le colis lourd se pose en premier, tout en bas : le chariot est stable, et il n’écrase pas les colis fragiles posés après lui.' },
    { id: 'pourquoi-deux', type: 'fil', de: 'moussa', groupe: GROUPE, poids: 1.5, quand: apresGeste(`fiche:${FICHES.deux}:${champDeux('arm1')}`),
      enonce: 'Le premier colis de l’armoire pèse 40 kg et mesure 2,01 m. Pourquoi le porter à deux ?',
      choix: [{ v: 'dos', lib: 'Il est lourd et long : risque pour le dos et pour les autres' }, { v: 'vite', lib: 'Pour aller plus vite' }, { v: 'drole', lib: 'C’est plus drôle' }],
      juste: 'dos', retour: 'Un colis lourd et long est dangereux à porter seul : on risque de se blesser, ou de heurter quelqu’un. À deux, on se partage la charge et on voit où l’on va.' },
    { id: 'ton-parcours', type: 'fil', de: 'moussa', groupe: GROUPE, poids: 1, apres: 'bilan', quand: apresFiche(FICHES.ordre), selon: texteParcours,
      enonce: 'Ton parcours fait X m. Le plus court qui garde les lourds et longs d’abord et les fragiles à la fin fait Y m. Qu’est-ce qui aurait raccourci le tien ?',
      choix: [{ v: 'sens', lib: 'Prendre les lourds du plus proche au plus lointain, puis rentrer en prenant le reste au passage' }, { v: 'fragile', lib: 'Prendre d’abord le fragile pour ne pas l’oublier' }, { v: 'retours', lib: 'Revenir au quai après chaque colis' }],
      juste: 'sens', retour: 'On avance dans un seul sens : on prend les colis lourds en s’éloignant du quai, puis les autres au retour. Chaque aller-retour inutile ajoute des mètres.' },
    { id: 'soixante-kg', type: 'fil', de: 'moussa', reflexion: true, quand: apresFiche(FICHES.caisse),
      enonce: 'Un collègue porte seul un colis de 60 kg tous les jours. Peut-il ?',
      choix: [{ v: 'medecin', lib: 'Seulement si le médecin du travail l’a reconnu apte' }, { v: 'fort', lib: 'Oui, s’il est fort' }, { v: 'jamais', lib: 'Jamais, sans exception' }],
      retour: 'Au-delà de 55 kg portés de façon habituelle, le salarié doit avoir été reconnu apte par le médecin du travail. Et l’employeur doit d’abord chercher à éviter le port de charges lourdes (chariot, aide).' },
  ],
};
