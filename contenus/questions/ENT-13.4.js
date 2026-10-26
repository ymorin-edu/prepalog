// Les questions d'ENT-13.4 — Stellantis, « ranger et compter selon ABC » (brief `docs/briefs/ENT-13.4-stellantis-ranger-compter-abc.md` §4 bis et §4 ter ; choix de Tristan du
// 26/10/2026 : propositions du brief prises telles quelles). Modifier ce fichier suffit (voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`).
// Karim est CONSTRUIT. Entraînement : 5 questions notées (part 5 sur 20) corrigées tout de suite, plus une question de droit non notée.
// Les points : quelles références compter 2 · les clips près de la sortie 1 · la vis A en sorties et C en valeur 1 · l'écart des rétroviseurs 1.
// ★ éco-droit (inventaire tournant et L123-12) : NON NOTÉE tant que la règle comptable de l'inventaire tournant n'a pas été relue mot à mot (brief §11) ; elle ne s'appuie que sur le texte du Code.
// « Avant de commencer » : non noté, 3 questions tirées (une de calcul, une d'inventaire, une de droit) parmi 7.

import { ID, ID_INV, ID_PLAN, calcul, calculSorties, depose } from '../stellantis-ent134-donnees.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'karim', doc, rubrique, enonce, choix, juste, retour, ...o });
const repondue = (db, id) => !!(db && db.questions && db.questions[ID] && db.questions[ID][id] && db.questions[ID][id].premiere);
const invEtat = (db) => (db && db.inventaires && db.inventaires[ID_INV]) || null;
const liste = (L) => L.join(', ');
const sortiesA = (db) => { const K = calculSorties(db); return K.ordre.filter((r) => K.classe[r] === 'A'); };
const valeurA = (db) => { const K = calcul(db); return K.ordre.filter((r) => K.classe[r] === 'A'); };
const valeurC = (db) => { const K = calcul(db); return K.ordre.filter((r) => K.classe[r] === 'C').slice(-4); };

export const QUESTIONS = {
  id: ID,
  part: 5,
  personnes: { karim: { nom: 'Karim', role: 'chef d’équipe logistique', appel: 'Karim' } },
  ouverture: { id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['poste-134', 'valeur-134', 'inv-134', 'droit-134'],
    tirage: { calcul: 1, inventaire: 1, droit: 1 },
    questions: ['valeur', 'part', 'aveugle', 'ecart', 'tournant', 'annuel', 'accord'] },
  liste: [
    // ── calcul (2 : l'élève en reçoit 1)
    q('valeur', 'calcul', 'valeur-134', '120 pièces à 3,50 € : la valeur du stock est…',
      [{ v: '420', lib: '420 €' }, { v: '123', lib: '123,50 €' }, { v: '34', lib: '34,29 €' }], '420',
      '120 × 3,50 = 420 €. La valeur d’une référence, c’est ses sorties (ou son stock) multipliées par son prix unitaire.'),
    q('part', 'calcul', 'valeur-134', 'Une référence vaut 300 € sur un total de 1 500 € de valeur. Sa part de la valeur est…',
      [{ v: '20', lib: '20 %' }, { v: '30', lib: '30 %' }, { v: '5', lib: '5 %' }], '20',
      '300 ÷ 1 500 = 0,2, soit 20 %. C’est la même colonne « Part » qu’hier, calculée sur la valeur.'),
    // ── inventaire (3)
    q('aveugle', 'inventaire', 'inv-134', 'Compter « à l’aveugle », c’est…',
      [{ v: 'sans', lib: 'compter sans voir le stock du logiciel' }, { v: 'lumiere', lib: 'compter sans lumière' }, { v: 'deux', lib: 'compter à deux' }], 'sans',
      'On compte ce qu’on voit, sans connaître le chiffre du logiciel : on n’est pas influencé.'),
    q('ecart', 'inventaire', 'inv-134', 'Le logiciel dit 40, on compte 37 : l’écart est…',
      [{ v: 'moins3', lib: '−3' }, { v: 'plus3', lib: '+3' }, { v: '77', lib: '77' }], 'moins3',
      'Écart = compté − théorique = 37 − 40 = −3 : il en manque trois.'),
    q('tournant', 'inventaire', 'inv-134', 'Un inventaire tournant, c’est…',
      [{ v: 'partie', lib: 'compter une partie du stock à chaque fois, et tout dans l’année' }, { v: 'jour', lib: 'tout compter le même jour' }, { v: 'allees', lib: 'compter en tournant dans les allées' }], 'partie',
      'On compte une partie du stock à la fois : les références importantes souvent, les autres plus rarement, mais tout est compté dans l’année.'),
    // ── droit (2)
    q('annuel', 'droit', 'droit-134', 'Une entreprise doit contrôler son stock par inventaire…',
      [{ v: '12', lib: 'au moins une fois tous les douze mois' }, { v: 'jamais', lib: 'jamais, le logiciel suffit' }, { v: 'jour', lib: 'chaque jour' }], '12',
      'Code de commerce, art. L123-12 : un contrôle par inventaire « au moins une fois tous les douze mois ».'),
    q('accord', 'droit', 'droit-134', 'Un contrat de vente est formé quand…',
      [{ v: 'accord', lib: 'le vendeur et l’acheteur sont d’accord sur la chose et sur le prix' }, { v: 'livraison', lib: 'la marchandise est livrée' }, { v: 'facture', lib: 'la facture est payée' }], 'accord',
      'L’accord sur la chose et sur le prix suffit à former la vente ; la livraison et le paiement sont des suites du contrat.'),

    // ── au fil du travail
    { id: 'clips', type: 'fil', de: 'karim', groupe: 'Les questions', poids: 1, cle: true,
      quand: (db) => !!(db && db.entrepots && db.entrepots[ID_PLAN] && db.entrepots[ID_PLAN].place && db.entrepots[ID_PLAN].place.P1),
      enonce: 'Les clips sortent 900 fois par semaine, les caches de batterie 40 fois. Lesquels mets-tu le plus près de la sortie, et pourquoi ?',
      choix: [{ v: 'clips', lib: 'Les clips : on y va le plus souvent, on fait moins de trajets' }, { v: 'caches', lib: 'Les caches : ils sont plus légers' }, { v: 'peu', lib: 'Peu importe' }],
      juste: 'clips', retour: 'Chaque aller-retour évité compte : ce qui sort le plus doit être le plus près et le plus facile à prendre.' },
    { id: 'quoi-compter', type: 'fil', de: 'karim', groupe: 'Choisir ce qu’on compte', poids: 2, cle: true, quand: (db) => depose(db),
      enonce: 'Cette semaine, quelles références comptes-tu ?',
      selon: (db) => ({ enonce: 'Karim a refait le classement ABC sur la valeur. Cette semaine, quelles références comptes-tu ?',
        libs: { juste: `Les A en valeur : ${liste(valeurA(db))}`, sorties: `Les A en sorties : ${liste(sortiesA(db))}`, toutes: 'Les 18 références du magasin', c: `Les C en valeur : ${liste(valeurC(db))}` } }),
      choix: [{ v: 'juste', lib: 'Les références A en valeur' }, { v: 'sorties', lib: 'Les références A en sorties' }, { v: 'toutes', lib: 'Toutes' }, { v: 'c', lib: 'Les références C en valeur' }],
      juste: 'juste', retour: 'On compte le plus souvent ce qui vaut le plus d’argent : les A en valeur (voici les références que Karim a retenues : les deux rétroviseurs, le faisceau d’habitacle et la poignée extérieure).' },
    { id: 'vis', type: 'fil', de: 'karim', groupe: 'Les questions', poids: 1, cle: true, quand: (db) => repondue(db, 'quoi-compter'),
      enonce: 'Les vis M6 sont parmi les premières pièces en sorties, et elles sont en C sur la valeur. Pourquoi ?',
      choix: [{ v: 'cher', lib: 'Elles sortent beaucoup mais coûtent très peu' }, { v: 'erreur', lib: 'Le tableur s’est trompé' }, { v: 'moins', lib: 'On en a moins en stock' }],
      juste: 'cher', retour: 'Une vis vaut quelques centimes : même sortie des milliers de fois, elle pèse peu dans l’argent. Un rétroviseur sort quelques dizaines de fois, mais vaut 82 € : deux classements, deux usages.' },
    { id: 'ecart-retros', type: 'fil', de: 'karim', groupe: 'Les questions', poids: 1, cle: true,
      quand: (db) => { const e = invEtat(db); return !!e && (e.etape || 1) >= 2; },
      enonce: 'Il manque 2 rétroviseurs droits à l’emplacement. On régularise tout de suite ?',
      choix: [{ v: 'cause', lib: 'Non : on cherche d’abord la cause (mouvements, messages)' }, { v: 'casse', lib: 'Oui, c’est de la casse' }, { v: 'vite', lib: 'Oui, c’est plus rapide' }],
      juste: 'cause', retour: 'Un écart est un signal, pas une erreur à effacer : si on régularise sans chercher, on peut perdre l’endroit où la pièce est vraiment.' },
    { id: 'annuel-tournant', type: 'fil', de: 'karim', groupe: 'Les questions', reflexion: true,
      quand: (db) => { const e = invEtat(db); return !!e && !!e.valide; },
      enonce: 'La loi demande un contrôle du stock par inventaire au moins une fois tous les douze mois (Code de commerce, L123-12). Avec un inventaire tournant, on compte les A souvent et les C rarement. Qu’est-ce qui reste vrai ?',
      choix: [{ v: 'chaque', lib: 'Chaque référence, les C comprises, doit quand même être comptée dans l’année' }, { v: 'jamais', lib: 'Les C n’ont jamais besoin d’être comptées' }, { v: 'jour', lib: 'Il faut tout compter le même jour' }],
      retour: 'Les A se comptent souvent, mais le contrôle porte sur l’ensemble du stock : les C aussi sont comptés, plus rarement, avant la fin des douze mois.' },
  ],
};
