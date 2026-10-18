// Les questions d'ENT-9.4 — CHEP, évaluation « la semaine de Légumes de la Lys » (brief `docs/briefs/ENT-9.4-chep-evaluation.md` §4 bis et §4 ter ;
// questions de Cowork, décision du 17/10/2026 sur délégation de Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une séance »
// dans `activites/FICHE-SEANCE.md`.
//
// ÉVALUATION : AUCUNE question au fil. Seul l'écran « Avant de commencer » est NOTÉ (`part: 4`) : 10 questions clés reprises des questions ★
// d'ENT-9.1 à 9.3 (`cle: true`), réécrites pour Légumes de la Lys (6 de préparation, 4 de droit) ; l'élève en reçoit 4
// (`tirage: { preparation: 2, droit: 2 }`) ; aucune aide, aucun mot cliquable, « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais
// pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Les textes de droit (Code civil, conditions de location) sont lisibles à
// gauche ; k-p5 montre un dessin (palette rouge LPR, kit iso du moteur, document `dessin-lpr` d'ENT-9.2).
// Les variantes tirent leurs PROPRES nombres, choisis pour ne jamais valoir une quantité de la séance (pas de 1 ou 2 manquantes pour k-d3, pas
// de 13 à 24 pour k-d4). Les `retour` (jamais montrés en évaluation) sont lus par l'enseignant.

import { EQUIPE } from '../chep.js';
import { ID } from '../chep-ent94-donnees.js';

// Une question clé. Une `variante` ne rend que ce qui change : les autres choix gardent leur texte (`libs` complet, exigé par le moteur).
const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => {
  const libs = Object.fromEntries(choix.map((c) => [c.v, c.lib]));
  const variante = o.variante ? (h) => { const v = o.variante(h); return { ...v, libs: { ...libs, ...(v.libs || {}) } }; } : undefined;
  return { id, type: 'ouverture', de: 'sandrine', doc, rubrique, cle: true, enonce, choix, juste, retour, ...(variante ? { variante } : {}) };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { sandrine: EQUIPE.sandrine },
  ouverture: { id: 'avant-de-commencer', de: 'sandrine', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Je suis en congé aujourd’hui : avant de partir, je t’ai laissé ces questions. Réponds sans aide ; pour celles de droit, '
      + 'lis le texte à gauche. Mes consignes sont ensuite dans la Messagerie.',
    documents: ['poste', 'dessin-lpr', 'droit', 'conditions'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['k-p1', 'k-p2', 'k-p3', 'k-p4', 'k-p5', 'k-p6', 'k-d1', 'k-d2', 'k-d3', 'k-d4'] },
  liste: [
    // ── préparation (6 : l'élève en reçoit 2)
    q('k-p1', 'preparation', 'poste', 'CHEP, c’est…',
      [{ v: 'loueur', lib: 'un loueur de palettes qui les récupère, les répare et les remet en circulation' },
        { v: 'fabricant', lib: 'un fabricant qui vend des palettes neuves' }, { v: 'transporteur', lib: 'un transporteur de marchandises' }], 'loueur',
      'CHEP loue ses palettes bleues et les fait tourner : livrées à un client, elles reviennent dans un centre de service pour repartir.'),
    q('k-p2', 'preparation', 'poste', 'Légumes de la Lys reçoit des palettes de CHEP et y charge ses légumes. C’est…',
      [{ v: 'emetteur', lib: 'un émetteur' }, { v: 'distributeur', lib: 'un distributeur' }, { v: 'centre', lib: 'un centre de service' }], 'emetteur',
      'Légumes de la Lys reçoit des palettes vides, les charge et les expédie : c’est un émetteur. C’est lui qui déclare ses transferts.'),
    q('k-p3', 'preparation', 'poste', 'Une palette en bois brut marquée EPAL, dans un compte CHEP…',
      [{ v: 'hors', lib: 'ne se déclare pas : elle n’est pas dans le pool' }, { v: 'declare', lib: 'se déclare comme une palette bleue' },
        { v: 'repeinte', lib: 'est repeinte en bleu et devient CHEP' }], 'hors',
      'Une palette Europe s’échange une pour une entre entreprises : elle n’a rien à faire sur un compte CHEP.'),
    q('k-p4', 'preparation', 'poste', 'Une palette CHEP abîmée, au retour…',
      [{ v: 'reparer', lib: 'est créditée et part en réparation' }, { v: 'jetee', lib: 'est jetée et retirée du crédit' },
        { v: 'rendue', lib: 'est rendue au distributeur' }], 'reparer',
      'Elle est à CHEP, abîmée ou non : le distributeur l’a bien rendue, elle se crédite, et l’atelier la répare.'),
    q('k-p5', 'preparation', 'dessin-lpr', 'Dans un retour CHEP, cette palette…',
      [{ v: 'cote', lib: 'est mise de côté : c’est une palette d’un autre pool' }, { v: 'credite', lib: 'est créditée : elle est arrivée avec les nôtres' },
        { v: 'reparation', lib: 'part en réparation' }], 'cote',
      'Rouge et marquée LPR : elle appartient à un autre loueur. Elle ne passe pas sur un compte CHEP.'),
    q('k-p6', 'preparation', 'poste', 'Un transfert non déclaré…',
      [{ v: 'reste', lib: 'laisse les palettes sur le compte de l’émetteur, qui continue à payer' },
        { v: 'passe', lib: 'passe tout seul sur le compte du distributeur' }, { v: 'annule', lib: 'est annulé au bout d’une semaine' }], 'reste',
      'Tant que le transfert n’est pas déclaré, les palettes restent sur son compte : il paie leur location chaque jour.'),
    // ── droit (4 : l'élève en reçoit 2)
    q('k-d1', 'droit', 'droit', 'Un cariste de Légumes de la Lys casse des palettes CHEP. Qui en répond devant CHEP ?',
      [{ v: 'lys', lib: 'Légumes de la Lys, qui les avait en location' }, { v: 'chep', lib: 'CHEP, propriétaire des palettes' },
        { v: 'personne', lib: 'Personne : c’est un accident' }], 'lys',
      'L’article 1732 : le locataire répond des dégradations et des pertes pendant sa jouissance.',
      { variante: (h) => { const n = h.entier(3, 9); return { enonce: `Un cariste de Légumes de la Lys casse ${n} palettes CHEP. Qui en répond devant CHEP ?`,
        retour: `L’article 1732 : le locataire répond des dégradations pendant sa jouissance. Les ${n} palettes cassées sont pour Légumes de la Lys.` }; } }),
    q('k-d2', 'droit', 'conditions', 'M. Deroo a oublié de déclarer un transfert. Le contrat dit que la location court jusqu’à la déclaration. Doit-il payer ces jours ?',
      [{ v: 'oui', lib: 'Oui : le contrat signé s’impose aux deux parties' }, { v: 'oubli', lib: 'Non : un oubli n’engage à rien' },
        { v: 'loi', lib: 'Non : la loi interdit de faire payer une location' }], 'oui',
      'Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits (art. 1103) : tant que le transfert n’est pas déclaré, la location court.'),
    q('k-d3', 'droit', 'droit', 'Halles d’Artois rend moins de palettes que ce qu’elle avait. Qui en répond ?',
      [{ v: 'halles', lib: 'Halles d’Artois, qui les avait en location, sauf preuve qu’elle n’y est pour rien' },
        { v: 'chep', lib: 'CHEP, propriétaire' }, { v: 'transporteur', lib: 'Le transporteur de la collecte' }], 'halles',
      'L’article 1732 : le locataire répond des pertes pendant sa jouissance, sauf s’il prouve qu’elles ne sont pas de sa faute.',
      { variante: (h) => { const n = 5 * h.entier(16, 22), k = h.entier(3, 6);
        return { enonce: `En janvier, Halles d’Artois avait ${n} palettes CHEP sur son compte et n’en a rendu que ${n - k}. Qui répond des ${k} palettes qui manquent ?`,
          retour: `L’article 1732 : le locataire répond des pertes pendant sa jouissance. Les ${k} palettes sont pour Halles d’Artois, sauf preuve qu’elle n’y est pour rien.` }; } }),
    q('k-d4', 'droit', 'conditions', 'M. Deroo a déclaré moins de palettes qu’il n’en a expédié. Qui doit corriger ?',
      [{ v: 'lys', lib: 'Légumes de la Lys : l’émetteur déclare ses transferts' }, { v: 'chep', lib: 'CHEP, propriétaire' },
        { v: 'personne', lib: 'Personne : il n’en manque presque pas' }], 'lys',
      'Le contrat signé s’impose à lui (art. 1103) et l’émetteur déclare ses transferts (conditions, art. 3) : c’est Légumes de la Lys qui corrige.',
      { variante: (h) => { const d = h.entier(30, 36), r = d + h.entier(10, 16);
        return { enonce: `M. Deroo a déclaré ${d} palettes au lieu de ${r}. Qui doit corriger ?`,
          libs: { personne: `Personne : ${r - d} palettes, ce n’est presque rien` },
          retour: `Le contrat signé s’impose à lui (art. 1103) : c’est Légumes de la Lys qui corrige sa déclaration, ${r} palettes et non ${d}.` }; } }),
  ],
};
