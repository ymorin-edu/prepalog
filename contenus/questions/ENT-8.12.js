// Les questions d'ENT-8.12 — Action, l'inventaire tournant du matin (brief `docs/briefs/ENT-8.12-action-inventaire-tournant.md` §4 bis et §4 ter, décidées
// par Tristan le 21/10/2026 : « on garde tout »). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Samia (cheffe d'équipe, la tutrice) — univers `contenus/action.js`.
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions de Samia ») ; énoncés, choix et retours de Cowork, les gestes du brief REBRANCHÉS sur ceux que
// publie le mode palettier (COORDINATION-palettier §3 n° 4, lot 4 : `compte:scan`, `compte:<rang>`, `compte:fin`) :
// - `q-pourquoi` (0,5, tout de suite) : « premier scan » → `entrepot:action-inventaire-tournant:compte:scan` (la première adresse scannée pour compter). Faits
//   VÉRIFIÉS (Voxlog, 2022 ; communiqué d'Action).
// - `q-aveugle` (0,5, tout de suite) : « premier compte tapé » → le premier compte CONFIRMÉ (`compte:1` … `compte:7`) : un compte qui ne colle pas ne
//   publie son geste qu'à « Confirmer » ; le geste est donc publié au premier « Compris. » du Terminal.
// - `q-colisage` (0,75, tout de suite) : « 3e adresse comptée » → la troisième `compte:<rang>` rangée (même règle). Un exemple d'ARTICLES (valeurs
//   TIRÉES, jamais celles de l'élève), présenté comme un exemple : on compte les cartons de la palette, pas les articles.
// - `q-que-faire` et `q-cause` (0,75 chacune, AU BILAN) : « fiche envoyée » → `apresFiche('ecarts')` ; elles portent sur un AUTRE cas que le sien (le système dit
//   S, tu as compté C deux fois ; n cartons de trop ou de moins, sens tiré), jamais sur ses écarts : corrigées au bilan, elles éclaireraient les jalons de la fiche.
// - `q-argent` (0,75, tout de suite) : éco-droit, « message à Samia envoyé » → `apresMail` vers Samia (la réponse par phrases).
// - `q-robot` (non notée) : innovation (C3.6 en fil rouge), à « Terminer le comptage » (`compte:fin`) : le robot de comptage vient juste après le comptage à la main.
//   Dit « ce que propose Geodis », pas ce qui se fait à Ensuès. « Je ne sais pas » en dernier choix.
// Ajout de Claude Code : `q-pourquoi` et `q-colisage` disent leur source ou leur statut d'exemple ; les `selon` des trois questions à valeurs tirées.
//
// AVANT DE COMMENCER : banque de 10 notions NON notées, 4 tirées par élève (3 de préparation sur 8, 1 image sur 2). `k-couche` : c et k TIRÉS. Les `aide` sont
// écrites par Claude Code (à relire). Images : dessins en traits ou en perspective de la séance (aucune image nouvelle).
//
// Ce fichier importe les DONNÉES de la séance (`contenus/action-ent812-donnees.js`), jamais le contenu (`contenus/action-ent812.js` l'importe).

import { apresGeste, apresMail, apresFiche } from '../../core/declencheurs.js';
import { ID, FICHE_ID, SAMIA_MAIL, GESTE, COMPTES_GESTES, unDe, auMoinsComptes, valeursColisage, valeursQueFaire, valeursCause } from '../action-ent812-donnees.js';

const GROUPE = 'Les questions de Samia';
const PERSONNES = {
  samia: { nom: 'Samia', role: 'cheffe d’équipe à la réception (ta tutrice)', appel: 'Samia', registre: 'tu' },
};
const nb = (n) => Number(n).toLocaleString('fr-FR');

const varianteKCouche = (h) => {
  const c = h.entier(2, 5), k = h.choisir([6, 8, 9]);
  return {
    enonce: `Une palette de ${c} couches pleines de ${k} cartons a…`,
    libs: { juste: `${c * k} cartons`, somme: `${c + k} cartons`, plus: `${c * k + k} cartons` },
    retour: `${c} couches × ${k} cartons = ${c * k} cartons.`,
  };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: PERSONNES,
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, on compte des palettes. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['matin', 'couches', 'carton', 'couche-dessus', 'etiquette'],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-tournant', 'k-annuel', 'k-aveugle', 'k-ecart', 'k-recompte', 'k-couche', 'k-par-carton', 'k-inventoriste', 'img-couche-dessus', 'img-etiquette-lisse'] },
  liste: [
    // ── préparation (8 : l'élève en reçoit 3)
    { id: 'k-tournant', type: 'ouverture', de: 'samia', doc: 'matin', rubrique: 'preparation',
      enonce: 'Un inventaire tournant, c’est…',
      aide: 'Lis le document « Ton matin ». Clique sur les mots [[inventaire tournant]].',
      choix: [{ v: 'partie', lib: 'compter une partie du stock à la fois, souvent' }, { v: 'annuel', lib: 'compter tout le stock une fois par an' },
        { v: 'tourner', lib: 'faire tourner les palettes' }],
      juste: 'partie',
      retour: 'On compte un peu de stock à la fois, souvent : une allée ce matin, une autre demain.' },
    { id: 'k-annuel', type: 'ouverture', de: 'samia', doc: 'matin', rubrique: 'preparation',
      enonce: 'L’inventaire annuel, c’est…',
      aide: 'Annuel veut dire « une fois par an ». Clique sur les mots [[inventaire tournant]] pour voir la différence.',
      choix: [{ v: 'tout', lib: 'compter tout le stock, une fois par an' }, { v: 'allee', lib: 'compter une allée chaque matin' },
        { v: 'camions', lib: 'compter les camions' }],
      juste: 'tout',
      retour: 'L’inventaire annuel compte tout le stock en une fois. L’inventaire tournant le fait par petits morceaux.' },
    { id: 'k-aveugle', type: 'ouverture', de: 'samia', doc: 'matin', rubrique: 'preparation',
      enonce: 'Compter à l’aveugle, c’est…',
      aide: 'Clique sur les mots [[à l’aveugle]].',
      choix: [{ v: 'sans-voir', lib: 'compter sans voir le nombre du système' }, { v: 'yeux', lib: 'compter les yeux fermés' }, { v: 'noir', lib: 'compter dans le noir' }],
      juste: 'sans-voir',
      retour: 'À l’aveugle : tu ne vois pas le nombre du système, tu comptes ce que tu vois.' },
    { id: 'k-ecart', type: 'ouverture', de: 'samia', doc: 'matin', rubrique: 'preparation',
      enonce: 'Un écart, c’est…',
      aide: 'Clique sur le mot [[écart]].',
      choix: [{ v: 'difference', lib: 'la différence entre ce qu’on compte et ce que dit le système' }, { v: 'film', lib: 'une palette mal filmée' },
        { v: 'retard', lib: 'un retard de camion' }],
      juste: 'difference',
      retour: 'Un écart, c’est la différence entre ton compte et le système.' },
    { id: 'k-recompte', type: 'ouverture', de: 'samia', doc: 'matin', rubrique: 'preparation',
      enonce: 'Quand le compte ne colle pas, on…',
      aide: 'Clique sur le mot [[recompter]].',
      choix: [{ v: 'recompter', lib: 'recompte, puis on signale si ça ne colle toujours pas' }, { v: 'corriger', lib: 'corrige le système tout de suite' },
        { v: 'jeter', lib: 'jette la palette' }],
      juste: 'recompter',
      retour: 'On recompte d’abord ; si l’écart reste, on le signale. Ce n’est pas à toi de corriger le système.' },
    { id: 'k-couche', type: 'ouverture', de: 'samia', doc: 'couches', rubrique: 'preparation', variante: varianteKCouche,
      enonce: 'Une palette de 3 couches pleines de 9 cartons a…',
      aide: 'Regarde le dessin. Une [[couche]], c’est une rangée de cartons à plat. Multiplie.',
      choix: [{ v: 'juste', lib: '27 cartons' }, { v: 'somme', lib: '12 cartons' }, { v: 'plus', lib: '36 cartons' }],
      juste: 'juste',
      retour: '3 couches × 9 cartons = 27 cartons.' },
    { id: 'k-par-carton', type: 'ouverture', de: 'samia', doc: 'carton', rubrique: 'preparation',
      enonce: '« Carton de 12 » sur l’étiquette veut dire…',
      aide: 'Lis l’étiquette du carton à gauche.',
      choix: [{ v: 'articles', lib: '12 articles dans le carton' }, { v: 'kg', lib: '12 kg' }, { v: 'cartons', lib: '12 cartons sur la palette' }],
      juste: 'articles',
      retour: 'Carton de 12 : il y a 12 articles dans le carton.' },
    { id: 'k-inventoriste', type: 'ouverture', de: 'samia', doc: 'matin', rubrique: 'preparation',
      enonce: 'L’inventoriste, c’est…',
      aide: 'Clique sur le mot [[inventoriste]].',
      choix: [{ v: 'compte', lib: 'la personne qui compte le stock' }, { v: 'chauffeur', lib: 'le chauffeur' }, { v: 'comptable', lib: 'le comptable du magasin' }],
      juste: 'compte',
      retour: 'L’inventoriste compte le stock. À Ensuès, c’est un métier de l’entrepôt.' },
    // ── image (2 : l'élève en reçoit 1)
    { id: 'img-couche-dessus', type: 'ouverture', de: 'samia', doc: 'couche-dessus', rubrique: 'image',
      enonce: 'Sur cette palette, la couche du dessus est…',
      aide: 'Regarde le haut de la palette, sans compter les couches du dessous.',
      choix: [{ v: 'incomplete', lib: 'incomplète : il manque des cartons' }, { v: 'pleine', lib: 'pleine' }, { v: 'vide', lib: 'vide' }],
      juste: 'incomplete',
      retour: 'La couche du dessus n’est pas pleine : c’est elle qu’on compte en dernier, carton par carton.' },
    { id: 'img-etiquette-lisse', type: 'ouverture', de: 'samia', doc: 'etiquette', rubrique: 'image',
      enonce: 'Cette étiquette sur la poutre du rack donne…',
      aide: 'Lis ce qui est écrit sur l’étiquette.',
      choix: [{ v: 'adresse', lib: 'l’adresse de l’emplacement' }, { v: 'prix', lib: 'le prix du produit' }, { v: 'cariste', lib: 'le nom du cariste' }],
      juste: 'adresse',
      retour: 'C’est l’adresse de l’emplacement : c’est elle que tu scannes avant de compter.' },
    // ── au fil du travail (brief §4 bis ; une ligne au bandeau)
    { id: 'q-pourquoi', type: 'fil', de: 'samia', quand: apresGeste(GESTE('compte:scan')), poids: 0.5, groupe: GROUPE,
      enonce: 'Geodis a recruté des inventoristes pour Ensuès, et Action annonce 150 à 200 nouveautés par semaine. Pourquoi compter un peu chaque jour ?',
      choix: [{ v: 'juste', lib: 'pour que le stock du système reste juste sans arrêter l’entrepôt' }, { v: 'loi', lib: 'parce que la loi l’oblige chaque matin' },
        { v: 'occuper', lib: 'pour occuper l’équipe avant les camions' }],
      juste: 'juste',
      retour: 'Un peu chaque jour : le stock reste juste et l’entrepôt continue de tourner.' },
    { id: 'q-aveugle', type: 'fil', de: 'samia', quand: unDe(...COMPTES_GESTES.map((g) => apresGeste(g))), poids: 0.5, groupe: GROUPE,
      enonce: 'Le Terminal ne t’a pas montré le nombre du système. Pourquoi ?',
      choix: [{ v: 'sans-influence', lib: 'pour que je compte ce que je vois, sans être influencé' }, { v: 'panne', lib: 'parce qu’il est en panne' }, { v: 'vite', lib: 'pour aller plus vite' }],
      juste: 'sans-influence',
      retour: 'Si tu vois le chiffre, tu risques de le trouver même s’il est faux.' },
    { id: 'q-colisage', type: 'fil', de: 'samia', quand: auMoinsComptes(3), poids: 0.75, groupe: GROUPE,
      enonce: 'Un exemple, pas ton comptage : un magasin demande combien d’articles il reste. Il y a 6 cartons de 24 articles et un carton ouvert de 9 articles. Combien d’articles ?',
      selon: (db) => { const v = valeursColisage(db);
        return { enonce: `Un exemple, pas ton comptage : un magasin demande combien d’articles il reste. Il y a ${v.n} cartons de ${v.a} articles et un carton ouvert de ${v.r} articles. Combien d’articles ?`,
          libs: { juste: `${nb(v.juste)} articles`, somme: `${nb(v.somme)} articles`, sans: `${nb(v.sans)} articles`, produit: `${nb(v.produit)} articles` },
          retour: `${v.n} × ${v.a} = ${nb(v.n * v.a)}, plus ${v.r} : ${nb(v.juste)} articles.` }; },
      choix: [{ v: 'juste', lib: '153 articles' }, { v: 'somme', lib: '39 articles' }, { v: 'sans', lib: '144 articles' }, { v: 'produit', lib: '1 296 articles' }],
      juste: 'juste',
      retour: '6 × 24 = 144, plus 9 : 153 articles.' },
    { id: 'q-que-faire', type: 'fil', de: 'samia', quand: apresFiche(FICHE_ID), poids: 0.75, groupe: GROUPE, apres: 'bilan',
      enonce: 'Le système dit 160, tu as compté 153 deux fois. Que fais-tu ?',
      selon: (db) => { const v = valeursQueFaire(db);
        return { enonce: `Le système dit ${v.systeme}, tu as compté ${v.compte} deux fois. Que fais-tu ?`, libs: { jusqua: `je recompte jusqu’à trouver ${v.systeme}` } }; },
      choix: [{ v: 'signaler', lib: 'je le signale à la cheffe d’équipe' }, { v: 'corriger', lib: 'je corrige le stock du système' }, { v: 'jusqua', lib: 'je recompte jusqu’à trouver 160' }],
      juste: 'signaler',
      retour: 'Tu comptes, tu signales ; c’est la cheffe qui décide de corriger.' },
    { id: 'q-cause', type: 'fil', de: 'samia', quand: apresFiche(FICHE_ID), poids: 0.75, groupe: GROUPE, apres: 'bilan',
      enonce: 'Sur une autre adresse, il y a 2 cartons de trop. Qu’est-ce qui a pu se passer ?',
      selon: (db) => { const v = valeursCause(db);
        return v.sens === 'surplus'
          ? { enonce: `Sur une autre adresse, il y a ${v.n} cartons de trop. Qu’est-ce qui a pu se passer ?`,
            libs: { juste: 'des cartons d’une autre palette du même produit ont été posés là', sens: 'des cartons ont été volés', absurde: 'le carton s’est multiplié' },
            retour: 'Des cartons en trop viennent souvent d’une palette voisine.' }
          : { enonce: `Sur une autre adresse, il manque ${v.n} cartons. Qu’est-ce qui a pu se passer ?`,
            libs: { juste: 'des cartons abîmés ont été retirés sans être déclarés', sens: 'des cartons d’une autre palette ont été posés là', absurde: 'les cartons ont rétréci' },
            retour: 'Des cartons qui manquent ont souvent été retirés sans être déclarés.' }; },
      choix: [{ v: 'juste', lib: 'des cartons d’une autre palette du même produit ont été posés là' }, { v: 'sens', lib: 'des cartons ont été volés' },
        { v: 'absurde', lib: 'le carton s’est multiplié' }],
      juste: 'juste',
      retour: 'Des cartons en trop viennent souvent d’une palette voisine.' },
    { id: 'q-argent', type: 'fil', de: 'samia', quand: apresMail({ a: SAMIA_MAIL }), poids: 0.75, groupe: GROUPE,
      enonce: 'Pour Action, un écart de stock, c’est quoi ?',
      choix: [{ v: 'argent', lib: 'de l’argent : des produits payés qu’on ne peut plus vendre, ou qu’on croit avoir' }, { v: 'rien', lib: 'rien, c’est juste un chiffre' },
        { v: 'amende', lib: 'une amende' }],
      juste: 'argent',
      retour: 'Un carton perdu, c’est un carton payé et jamais vendu.' },
    { id: 'q-robot', type: 'fil', de: 'samia', quand: apresGeste(GESTE('compte:fin')), reflexion: true,
      enonce: 'Geodis propose un robot qui compte les palettes en hauteur (on ne sait pas s’il sert à Ensuès). Qu’est-ce que ça change pour l’inventoriste ?',
      choix: [{ v: 'verifier', lib: 'Moins de comptages en hauteur, plus de vérifications des écarts' }, { v: 'personne', lib: 'Plus besoin de personne' }, { v: 'rien', lib: 'Rien' },
        { v: 'nsp', lib: 'Je ne sais pas' }],
      retour: 'Le robot compte ; quelqu’un doit encore chercher pourquoi ça ne colle pas.' },
  ],
};
