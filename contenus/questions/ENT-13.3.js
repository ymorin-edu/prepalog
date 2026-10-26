// Les questions d'ENT-13.3 — Stellantis, « la méthode ABC au tableur » (brief `docs/briefs/ENT-13.3-stellantis-methode-abc.md` §4 bis et §4 ter ; choix de Tristan du
// 26/10/2026 : propositions du brief prises telles quelles). Modifier ce fichier suffit (voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`).
// Karim est CONSTRUIT. Guidage : 6 questions notées (part 7 sur 20) corrigées tout de suite, et deux réflexions non notées.
// Les points : lire son classement 2 (combien de A, quelle part) · décider où ranger 2 · pourquoi les A près de la sortie 1,5 · le stock qui dort (éco-droit) 1,5.
// « Avant de commencer » : non noté, 3 questions tirées (une de calcul, une de tableur, une de droit) parmi 6.
// Les deux premières questions notées se posent une fois la classe déposée JUSTE (valeurs calculées sur les bonnes données : si le fichier est juste, ce sont les siennes) ;
// la suite s'enchaîne dans l'ordre des décisions. Une question jamais atteinte arrive en rattrapage, quand tout le reste est jugé.

import { exportFait } from '../../core/types/export-tableur.js';
import { ID, ID_EXPORT, juste, lesA, refMalPlacee } from '../stellantis-ent133-donnees.js';
import { parRef } from '../stellantis.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'karim', doc, rubrique, enonce, choix, juste, retour, ...o });
const repondue = (db, id) => !!(db && db.questions && db.questions[ID] && db.questions[ID][id] && db.questions[ID][id].premiere);
const pct = (x) => `${Math.round(x * 100)} %`;
// Trois choix faux, tous différents du bon et entre eux (une valeur numérique proche d'une autre est décalée).
const autres = (bon, candidats) => { const v = []; candidats.forEach((c) => { if (c !== bon && !v.includes(c)) v.push(c); }); return v; };

export const QUESTIONS = {
  id: ID,
  part: 7,
  personnes: { karim: { nom: 'Karim', role: 'chef d’équipe logistique', appel: 'Karim' } },
  ouverture: { id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['poste-133', 'methode-133'],
    tirage: { calcul: 1, tableur: 1, droit: 1 },
    questions: ['pct', 'cumul', 'somme', 'dollar', 'payer', 'accord'] },
  liste: [
    // ── calcul (2 : l'élève en reçoit 1)
    q('pct', 'calcul', 'methode-133', '300 sorties sur un total de 1 500, c’est…',
      [{ v: '20', lib: '20 %' }, { v: '30', lib: '30 %' }, { v: '5', lib: '5 %' }], '20',
      '300 ÷ 1 500 = 0,2, soit 20 %. C’est la « part » de la référence, première colonne à calculer dans le tableur.'),
    q('cumul', 'calcul', 'methode-133', '40 %, puis 25 %, puis 15 % : le cumul après la troisième ligne est…',
      [{ v: '80', lib: '80 %' }, { v: '15', lib: '15 %' }, { v: '40', lib: '40 %' }], '80',
      'On additionne en descendant : 40 + 25 + 15 = 80 %. Le cumul dit quelle part des sorties est déjà couverte.'),
    // ── tableur (2)
    q('somme', 'tableur', 'methode-133', 'Pour additionner une colonne dans le tableur, j’utilise…',
      [{ v: 'somme', lib: 'SOMME' }, { v: 'si', lib: 'SI' }, { v: 'moyenne', lib: 'MOYENNE' }], 'somme',
      'SOMME additionne une plage : =SOMME(E2:E19). SI sert à choisir entre deux résultats, MOYENNE à faire une moyenne.'),
    q('dollar', 'tableur', 'methode-133', 'Dans la formule =E2/E$20, le signe $ sert à…',
      [{ v: 'fixer', lib: 'garder la ligne 20 quand on recopie la formule vers le bas' }, { v: 'euros', lib: 'afficher des euros' }, { v: 'fois', lib: 'multiplier par 20' }], 'fixer',
      'Le $ bloque la ligne : en recopiant vers le bas, on divise toujours par le total de la ligne 20.'),
    // ── droit (2)
    q('payer', 'droit', 'poste-133', 'L’usine commande des pièces à un fournisseur, qui les livre. L’usine doit…',
      [{ v: 'prix', lib: 'les payer au prix et dans le délai prévus au contrat' }, { v: 'quand', lib: 'les payer quand elle veut' }, { v: 'apres', lib: 'ne les payer qu’après les avoir toutes utilisées' }], 'prix',
      'Le contrat de vente oblige l’acheteur à payer le prix convenu, au moment convenu : c’est ce qui permet au fournisseur de livrer sans risque.'),
    q('accord', 'droit', 'poste-133', 'Un contrat de vente est formé quand…',
      [{ v: 'accord', lib: 'le vendeur et l’acheteur sont d’accord sur la chose et sur le prix' }, { v: 'livraison', lib: 'la marchandise est livrée' }, { v: 'facture', lib: 'la facture est payée' }], 'accord',
      'L’accord sur la chose et sur le prix suffit à former la vente ; la livraison et le paiement sont des suites du contrat.'),

    // ── au fil du travail
    { id: 'pari', type: 'fil', de: 'karim', reflexion: true, quand: (db) => exportFait(db, ID_EXPORT),
      enonce: 'Avant de calculer : à ton avis, parmi les références de ta liste, combien font l’essentiel des sorties de la semaine ?',
      choix: [{ v: 'peu', lib: 'Quelques-unes seulement' }, { v: 'moitie', lib: 'À peu près la moitié' }, { v: 'toutes', lib: 'Toutes à peu près pareil' }],
      retour: 'Garde ton pari en tête : le tableur va répondre. Dans presque tous les magasins, quelques références font l’essentiel des sorties.' },
    { id: 'combien-a', type: 'fil', de: 'karim', groupe: 'Lire son classement', cle: true, quand: (db) => juste(db, 'classe'),
      enonce: 'Dans ton classement, combien de références sont en A ?',
      selon: (db) => {
        const { n, total } = lesA(db);
        const mal = autres(n, [n + 4, Math.max(1, n - 2), total, n + 1]);
        return { enonce: 'Dans ton classement, combien de références sont en A ?', libs: { juste: String(n), plus: String(mal[0]), moins: String(mal[1]), toutes: String(mal[2]) } };
      },
      choix: [{ v: 'juste', lib: 'Le nombre de références dont le cumul reste sous 80 %' }, { v: 'plus', lib: 'Beaucoup plus' }, { v: 'moins', lib: 'Beaucoup moins' }, { v: 'toutes', lib: 'Toutes' }],
      juste: 'juste', retour: 'Les A sont peu nombreux : ce sont les références qui sortent le plus. C’est sur elles qu’on veut gagner du temps.' },
    { id: 'part-a', type: 'fil', de: 'karim', groupe: 'Lire son classement', cle: true, quand: (db) => juste(db, 'classe'),
      enonce: 'Ces références A font quelle part des sorties de la semaine ?',
      selon: (db) => {
        const { n, total, part } = lesA(db);
        const bon = pct(part);
        const mal = autres(bon, [pct(n / total), '50 %', '95 %', '30 %']);
        return { enonce: 'Ces références A font quelle part des sorties de la semaine ?', libs: { juste: bon, nombre: mal[0], moitie: mal[1], presque: mal[2] } };
      },
      choix: [{ v: 'juste', lib: 'La part cumulée de tes A' }, { v: 'nombre', lib: 'Leur part dans la liste des références' }, { v: 'moitie', lib: 'La moitié' }, { v: 'presque', lib: 'Presque tout' }],
      juste: 'juste', retour: 'Peu de références, l’essentiel des sorties : c’est ce que montre le cumul.' },
    { id: 'pourquoi-a', type: 'fil', de: 'karim', groupe: 'Les questions', poids: 1.5, cle: true, quand: (db) => repondue(db, 'part-a') || (juste(db, 'classe') && repondue(db, 'combien-a')),
      enonce: 'Pourquoi ranger les références A près de la sortie du magasin ?',
      choix: [{ v: 'trajets', lib: 'On y va le plus souvent : moins de trajets' }, { v: 'cheres', lib: 'Elles sont plus chères' }, { v: 'lourdes', lib: 'Elles sont plus lourdes' }],
      juste: 'trajets', retour: 'Chaque aller-retour évité compte : ce qui sort le plus doit être le plus près et le plus facile à prendre (entre la taille et l’épaule).' },
    { id: 'ou-ranger-a', type: 'fil', de: 'karim', groupe: 'Décider où ranger', quand: (db) => repondue(db, 'pourquoi-a'),
      enonce: 'Où ranges-tu tes références A ?',
      choix: [{ v: 'devant-main', lib: 'Près de la sortie, à hauteur d’homme (niveau 2)' }, { v: 'fond-haut', lib: 'Au fond, en hauteur' }, { v: 'devant-haut', lib: 'Près de la sortie, tout en haut' }, { v: 'fond-sol', lib: 'Au fond, au sol' }],
      juste: 'devant-main', retour: 'Près de la sortie et entre la taille et l’épaule : on prend sans se baisser ni monter. Les C, qu’on prend rarement, vont au fond, en hauteur ou au sol.' },
    { id: 'c-mal-placee', type: 'fil', de: 'karim', groupe: 'Décider où ranger', cle: true, quand: (db) => repondue(db, 'ou-ranger-a'),
      enonce: 'Dans ton classement, une référence en C occupe aujourd’hui le meilleur emplacement du magasin. Que fais-tu ?',
      selon: (db) => {
        const r = parRef[refMalPlacee()];
        return { enonce: `Dans ton classement, ${r.designation.toLowerCase()} (${r.ref}) est en C, mais elle occupe aujourd’hui le meilleur emplacement du magasin (${r.emplacement}). Que fais-tu ?` };
      },
      choix: [{ v: 'deplacer', lib: 'Je la déplace au fond ou en hauteur et je donne sa place à une référence A' }, { v: 'laisser', lib: 'Je la laisse : elle est déjà rangée' }, { v: 'devant', lib: 'Je la déplace encore plus près de la sortie' }],
      juste: 'deplacer', retour: 'Le meilleur emplacement est précieux : il doit servir à ce qui sort le plus. Le rangement d’il y a deux ans ne suit plus les sorties de la semaine.' },
    { id: 'stock-dort', type: 'fil', de: 'karim', groupe: 'Les questions', poids: 1.5, quand: (db) => repondue(db, 'c-mal-placee'),
      enonce: 'Au magasin, six références C n’ont pas bougé depuis des mois. Pour l’usine, ce stock qui dort, c’est…',
      choix: [{ v: 'argent', lib: 'de l’argent immobilisé, de la place et du travail qu’elle paie sans rien produire' }, { v: 'reserve', lib: 'une réserve gratuite' }, { v: 'rien', lib: 'rien du tout' }],
      juste: 'argent', retour: 'Chaque pièce rangée a été payée : tant qu’elle dort, cet argent ne sert à rien d’autre, et il faut payer la place, l’assurance et la manutention.' },
    { id: 'transstockeur', type: 'fil', de: 'karim', reflexion: true, quand: (db) => repondue(db, 'stock-dort'),
      enonce: 'Au grand transstockeur de l’usine, Stellantis fait l’inverse : chaque référence est répartie sur les quatre allées, pas regroupée près de la sortie. Pourquoi, à ton avis ?',
      choix: [{ v: 'panne', lib: 'Si une allée tombe en panne, les pièces restent accessibles : la ligne ne s’arrête pas' }, { v: 'vite', lib: 'Pour aller plus vite' }, { v: 'trous', lib: 'Pour remplir les trous' }],
      retour: 'Une chaîne à l’arrêt immobilise environ 1 200 personnes : à cette échelle, la continuité passe avant la distance. La méthode ABC est une règle utile, pas une loi.' },
  ],
};
