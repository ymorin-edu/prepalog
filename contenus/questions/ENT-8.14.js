// Les questions d'ENT-8.14 — Action, évaluation « ranger et compter dans le site d'évaluation » (brief `docs/briefs/ENT-8.14-action-evaluation-stock.md`, §4 ter ;
// questions de Cowork, corrigées le 21/10/2026 au soir, décision de Tristan sur les trois questions passées dans « Avant de commencer »). Modifier ce fichier
// suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`.
//
// ÉVALUATION : AUCUNE question au fil. Seul l'écran « Avant de commencer » est NOTÉ (`part: 4`) : 10 questions clés reprises des séances ENT-8.11 à 8.13
// (5 de préparation, 3 d'éco-droit, 2 d'image), l'élève en reçoit 4 (`tirage: { preparation: 2, ecodroit: 1, image: 1 }`) ; aucune aide, aucun mot cliquable, « Je
// ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. « Le droit » (C. trav. L4122-1,
// recopié d'ENT-8.11) est lisible à gauche (`doc: 'droit'`).
// Valeurs TIRÉES (`variante`) et RÉPONSES RÉÉCRITES : aucune phrase juste n'est identique à celle des séances de travail (la mémoire seule ne suffit pas).
// Écartées (brief) : `k-adresse-libre` (donnerait le bon geste de P5) et `k-scan` (donnerait le bloc scan).
//
// ÉCART au brief (le même qu'en ENT-8.5, 8.6 et 8.10, COORDINATION §3 n° 13) : le moteur ne sait pas écrire le site de l'élève dans une question d'ouverture.
// Les questions disent « ton tuteur » et « l'entreprise qui t'accueille » (jamais {tuteur} ni {prestataire}) ; l'adresse de `e-adresse` est tirée dans l'allée A ou B
// (jamais C, absente de Belleville). Les `retour` (jamais montrés en évaluation, lus par l'enseignant) sont écrits par Claude Code.
//
// Ce fichier importe les DONNÉES de la séance (`contenus/action-ent814-donnees.js`), jamais le contenu (`contenus/action-ent814.js` l'importe).

import { ID } from '../action-ent814-donnees.js';

// La personne qui pose les questions : le tuteur ou la tutrice du site (CONSTRUIT), nommé sans prénom (voir l'en-tête).
export const TUTEUR = { nom: 'Ton tuteur', role: 'chef d’équipe à la réception', appel: 'Ton tuteur', registre: 'tu' };

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'tuteur', doc, rubrique, enonce, choix, juste, retour, ...o });
const nb = (n) => Number(n).toLocaleString('fr-FR');
const ord = (n) => (n === 1 ? '1er' : `${n}e`);
const sauf = (liste, x) => liste.filter((y) => y !== x);

// `e-adresse` : une adresse de l'allée A ou B, dont le chiffre du niveau n'est celui d'aucun autre morceau (« le 4 » n'a qu'une réponse).
const varianteAdresse = (h) => {
  const n = h.choisir([2, 3, 4]), a = h.choisir(['A', 'B']), cote = h.choisir(sauf([1, 2], n)), t = h.choisir(sauf([1, 2, 3, 4], n)), e = h.choisir(sauf([1, 2, 3], n));
  return { enonce: `${a}${cote}-T0${t}-N${n}-E${e} : que veut dire le ${n} ?`, libs: { niveau: `le niveau (le ${ord(n)} en partant du sol)`, travee: 'la travée', emplacement: 'l’emplacement', allee: 'l’allée' },
    retour: `Le ${ord(n)} niveau en partant du sol : le N de l’adresse.` };
};
// `e-adresse-b` : une adresse au sol (N1) ; le piège est la travée lue comme un niveau.
const varianteHauteur = (h) => {
  const a = h.choisir(['A', 'B']), cote = h.choisir([1, 2]), t = h.choisir([2, 3, 4]), e = h.choisir([1, 2, 3]);
  return { enonce: `${a}${cote}-T0${t}-N1-E${e} : à quelle hauteur ?`, libs: { sol: 'au sol', niveau: `au ${ord(t)} niveau`, haut: 'en haut du rack' }, retour: 'N1 : le niveau 1, au sol.' };
};
// `e-couches` : c couches pleines de k cartons et r cartons sur le dessus. Les quatre résultats sont distincts (vérifié à la main : r < k).
const varianteCouches = (h) => {
  const c = h.choisir([3, 4, 5]), k = h.choisir([6, 8, 9]), r = h.entier(2, k - 2);
  return { enonce: `${c} couches pleines de ${k} cartons, et ${r} cartons sur le dessus : combien de cartons ?`,
    libs: { juste: `${c * k + r} cartons sur la palette`, sans: `${c * k} cartons sur la palette`, somme: `${c + k + r} cartons sur la palette`, plus: `${(c + 1) * k} cartons sur la palette` },
    retour: `${c} × ${k} = ${c * k}, plus ${r} sur le dessus : ${c * k + r} cartons.` };
};
// `e-couches-b` : c couches dont c − 1 pleines de k cartons, et r cartons sur la dernière (r ≤ k − 3 : les quatre résultats sont distincts).
const varianteCouchesB = (h) => {
  const c = h.choisir([3, 4]), k = h.choisir([6, 8, 9]), r = h.entier(2, k - 3);
  return { enonce: `Une palette de ${c} couches : les ${c - 1} du dessous sont pleines de ${k} cartons, celle du dessus en a ${r}. Combien de cartons en tout ?`,
    libs: { juste: `${(c - 1) * k + r} cartons en tout`, pleine: `${c * k} cartons en tout`, sans: `${(c - 1) * k} cartons en tout`, somme: `${c - 1 + k + r} cartons en tout` },
    retour: `${c - 1} × ${k} = ${(c - 1) * k}, plus ${r} : ${(c - 1) * k + r} cartons.` };
};
// `e-plaque` : une plaque, un « déjà posé » et une palette qui dépassent (palette d'au moins 350 kg).
const variantePlaque = (h) => {
  const plaque = h.choisir([800, 1000, 1200]), deja = h.choisir([300, 400, 500, 600, 700].filter((d) => d <= plaque - 300)), palette = plaque - deja + 50 * h.entier(1, 4);
  return { enonce: `Plaque : ${nb(plaque)} kg par niveau. Déjà ${nb(deja)} kg. Palette de ${nb(palette)} kg : on la pose ?`,
    libs: { non: 'non : avec elle, le niveau serait trop chargé', oui: 'oui', fond: 'oui, si on la pousse au fond' },
    retour: `${nb(deja)} + ${nb(palette)} = ${nb(deja + palette)} kg, plus que ${nb(plaque)} : on ne la pose pas, on le signale.` };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { tuteur: TUTEUR },
  ouverture: { id: 'avant-de-commencer', de: 'tuteur', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, réponds à mes questions, sans aide. Si une question parle du droit, lis « Le droit », à gauche.',
    documents: ['stage', 'droit', 'panneau', 'allee'],
    tirage: { preparation: 2, ecodroit: 1, image: 1 },
    questions: ['e-adresse', 'e-adresse-b', 'e-couches', 'e-couches-b', 'e-plaque', 'e-materiel', 'e-argent', 'e-consignes', 'e-img-plaque', 'e-img-allee'] },
  liste: [
    // ── préparation (5 : l'élève en reçoit 2)
    q('e-adresse', 'preparation', 'stage', 'A2-T02-N4-E1 : que veut dire le 4 ?',
      [{ v: 'niveau', lib: 'le niveau (le 4e en partant du sol)' }, { v: 'travee', lib: 'la travée' }, { v: 'emplacement', lib: 'l’emplacement' }, { v: 'allee', lib: 'l’allée' }],
      'niveau', 'Le 4e niveau en partant du sol : le N de l’adresse.', { variante: varianteAdresse }),
    q('e-adresse-b', 'preparation', 'stage', 'A1-T03-N1-E2 : à quelle hauteur ?',
      [{ v: 'sol', lib: 'au sol' }, { v: 'niveau', lib: 'au 3e niveau' }, { v: 'haut', lib: 'en haut du rack' }],
      'sol', 'N1 : le niveau 1, au sol.', { variante: varianteHauteur }),
    q('e-couches', 'preparation', 'stage', '4 couches pleines de 6 cartons, et 3 cartons sur le dessus : combien de cartons ?',
      [{ v: 'juste', lib: '27 cartons sur la palette' }, { v: 'sans', lib: '24 cartons sur la palette' }, { v: 'somme', lib: '13 cartons sur la palette' }, { v: 'plus', lib: '30 cartons sur la palette' }],
      'juste', '4 × 6 = 24, plus 3 sur le dessus : 27 cartons.', { variante: varianteCouches }),
    q('e-couches-b', 'preparation', 'stage', 'Une palette de 3 couches : les 2 du dessous sont pleines de 9 cartons, celle du dessus en a 5. Combien de cartons en tout ?',
      [{ v: 'juste', lib: '23 cartons en tout' }, { v: 'pleine', lib: '27 cartons en tout' }, { v: 'sans', lib: '18 cartons en tout' }, { v: 'somme', lib: '16 cartons en tout' }],
      'juste', '2 × 9 = 18, plus 5 : 23 cartons.', { variante: varianteCouchesB }),
    q('e-plaque', 'preparation', 'stage', 'Plaque : 1 200 kg par niveau. Déjà 700 kg. Palette de 600 kg : on la pose ?',
      [{ v: 'non', lib: 'non : avec elle, le niveau serait trop chargé' }, { v: 'oui', lib: 'oui' }, { v: 'fond', lib: 'oui, si on la pousse au fond' }],
      'non', '700 + 600 = 1 300 kg, plus que 1 200 : on ne la pose pas, on le signale.', { variante: variantePlaque }),
    // ── éco-droit (3 : l'élève en reçoit 1)
    q('e-materiel', 'ecodroit', 'stage', 'Dans cet entrepôt, le matériel appartient à Action, mais l’équipe travaille pour l’entreprise qui t’accueille. Pourquoi ?',
      [{ v: 'prestataire', lib: 'c’est un prestataire logistique : il fournit le personnel, et Action garde ses chariots et son informatique' },
        { v: 'loue', lib: 'l’entreprise qui t’accueille loue ses salariés à Action' }, { v: 'patron', lib: 'Action est le patron de l’entreprise qui t’accueille' }],
      'prestataire', 'Action confie son entrepôt à un prestataire, qui fournit l’équipe.'),
    q('e-argent', 'ecodroit', 'stage', 'Un écart de stock, pour Action, c’est…',
      [{ v: 'argent', lib: 'de l’argent : des produits payés qu’on ne retrouve plus pour les vendre' }, { v: 'rien', lib: 'rien : ce n’est qu’un chiffre' },
        { v: 'amende', lib: 'une amende pour le magasin' }],
      'argent', 'Un carton perdu, c’est un carton payé et jamais vendu.'),
    q('e-consignes', 'ecodroit', 'droit', 'Un collègue pressé te dit : « Range sans scanner, on verra plus tard. » Que fais-tu ? (lis « Le droit »)',
      [{ v: 'scanner', lib: 'je scanne : je suis les instructions de l’employeur, pas celles d’un collègue pressé' },
        { v: 'obeir', lib: 'j’obéis : il est pressé et il est là depuis plus longtemps' }, { v: 'attendre', lib: 'je ne fais plus rien jusqu’à ce qu’il me le redise' }],
      'scanner', 'Les instructions viennent de l’employeur (L4122-1) : un collègue pressé ne les change pas.'),
    // ── images (2 : l'élève en reçoit 1)
    q('e-img-plaque', 'image', 'panneau', 'Ce panneau fixé au bout du rack donne…',
      [{ v: 'charge', lib: 'le poids maximum que peut porter chaque niveau' }, { v: 'evacuation', lib: 'le plan d’évacuation du site' }, { v: 'adresse', lib: 'l’adresse de la travée' }],
      'charge', 'C’est la plaque de charge : au-delà, le rack peut plier.'),
    q('e-img-allee', 'image', 'allee', 'Sur ce dessin, que faut-il signaler ?',
      [{ v: 'palette', lib: 'une palette posée au milieu du passage' }, { v: 'rien', lib: 'rien : tout est en ordre' }, { v: 'racks', lib: 'les racks sont trop proches' }],
      'palette', 'Une palette posée dans l’allée gêne les chariots, et le système ne sait pas qu’elle est là.'),
  ],
};
