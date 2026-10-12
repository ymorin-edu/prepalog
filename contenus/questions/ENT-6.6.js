// Les questions d'ENT-6.6 — France Boissons, inventaire tournant (brief `docs/briefs/ENT-6.6-france-boissons-inventaire.md`, §4 bis et §4 ter :
// propositions de Cowork du 10/10/2026, « tout gardé » par Tristan ; poids validés le 12/10/2026). Modifier ce fichier suffit : voir
// « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES.
//
// AU FIL (4, dont 3 NOTÉES : `part: 4`, 1 + 1,5 + 1,5), énoncés fixes (le moteur ne glisse pas dans une question ce que l'élève a fait :
// « Tu as compté {n} fûts en M04 » de Cowork devient « Tu viens de compter… »).
// - Point d'étape `avant-inventaire` (Nadia), à la fin du comptage, garde fermé l'écran Inventaire jusqu'aux réponses :
//   · `aveugle-pourquoi` (Nadia), NOTÉE 1, corrigée tout de suite (ne dit pas si le compte est juste) ;
//   · `codes-faux` (Inès), NOTÉE 1,5, corrigée tout de suite. Éco-droit appliqué : C. trav. L1222-3 et L1222-4. Ne touche aucun jalon.
//   Les deux sont proches de `aveugle` et `terminal-informe` de l'ouverture : gardées toutes (choix de Tristan du 10/10/2026).
// - `m04-regul` (Nadia), NOTÉE 1,5, corrigée AU BILAN (c'est le jalon de M04). L'écran Inventaire ne publie pas encore la décision d'une
//   ligne : la question arrive à la première case du compte rendu (`fiche:compte-rendu:vides-futs`), l'inventaire déjà validé.
// - `taux-confiance` (Nadia), RÉFLEXION, au bilan, à la case du taux (`fiche:compte-rendu:taux`).
//
// AVANT DE COMMENCER : une banque de 10 questions NON notées, 5 tirées par élève : `{ preparation: 2, droit: 2, image: 1 }`, la calculette
// du site. Jamais le stock théorique (à l'aveugle). Aucune question sur la cause d'un écart ni sur « régulariser ou remettre en place »
// (jalons). `ecart-calcul`, `taux-fiabilite`, `inventaire-annuel` et `vides-manquants-euros` sont à VALEURS TIRÉES, jamais celles de la séance
// (écarts 1, 3, 8 ; 4 sur 7 ; 3 vides). `cle: true` = à reprendre en évaluation.

import { apresGeste } from '../../core/declencheurs.js';
import { comptageFini } from '../../core/types/entrepot.js';
import { EQUIPE } from '../france-boissons.js';
import { PLAN } from '../france-boissons-ent66-donnees.js';

const IMG = './contenus/images/france-boissons/';
const tirerHors = (h, a, b, exclus) => { let x; do { x = h.entier(a, b); } while (exclus.includes(x)); return x; };
const pct = (n) => `${String(Math.round(n * 10) / 10).replace('.', ',')} %`;
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

// « Le logiciel dit t fûts ; tu en comptes c. » (t de 10 à 30, c = t − k, k ∈ {2, 4, 5} : jamais 1, 3 ni 8, les écarts de la séance).
const varianteEcart = (h) => {
  const t = h.entier(10, 30), k = [2, 4, 5][h.entier(0, 2)], c = t - k;
  return { enonce: `Le logiciel dit ${t} fûts ; tu en comptes ${c}. Quel est l’écart ?`,
    libs: { ecart: `−${k}`, inverse: `+${k}`, compte: String(c) } };
};
// « Sur n lignes comptées, j sont justes. » ((10 ; 6 à 9) ou (20 ; 15 à 19) : jamais 4 sur 7).
const varianteTaux = (h) => {
  const n = h.entier(0, 1) ? 20 : 10, j = n === 10 ? h.entier(6, 9) : h.entier(15, 19);
  return { enonce: `Sur ${n} lignes comptées, ${j} sont justes. Quel est le taux de fiabilité ?`,
    libs: { taux: pct(j / n * 100), inverse: pct((n - j) / n * 100), justes: `${j} %` } };
};
// « Le dernier inventaire complet a eu lieu le … 2026. » Le suivant : au plus tard 12 mois après.
const varianteAnnuel = (h) => {
  const j = h.entier(1, 28), m = h.entier(0, 11);
  const date = (an) => `${j === 1 ? '1er' : j} ${MOIS[m]} ${an}`;
  return { enonce: `Le dernier inventaire complet de la plateforme a eu lieu le ${date(2026)}. D’après le Code de commerce, au plus tard quand doit avoir lieu le suivant ?`,
    libs: { douze: `Le ${date(2027)}`, vingtquatre: `Le ${date(2028)}`, jamais: 'Jamais : ce n’est pas obligatoire' } };
};
// « Il manque k fûts vides. » (k de 2 à 9, jamais 3 : l'écart de la séance).
const varianteVides = (h) => {
  const k = tirerHors(h, 2, 9, [3]);
  return { enonce: `Il manque ${k} fûts vides au compte. Combien de consigne est perdue ?`,
    libs: { fut: `${k * 40} €`, casier: `${k * 4} €`, un: '40 €' } };
};

export const QUESTIONS = {
  id: 'france-boissons-inventaire',
  part: 4,
  personnes: { nadia: EQUIPE.nadia, ines: EQUIPE.ines },
  ouverture: { id: 'avant-de-commencer', de: 'nadia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, on fait un inventaire tournant. Avant, lis les documents à gauche et réponds à mes questions.',
    calculette: true,
    documents: ['mots',
      { id: 'photos', court: 'Photos et dessins', titre: 'Le terminal vocal', type: 'images', images: [
        { src: IMG + 'materiel-terminal-vocal.svg', alt: 'Un préparateur porte un terminal à la ceinture, relié à un casque avec micro ; ses deux mains sont libres',
          credit: 'Dessin — matériel générique, sans marque', large: true }] },
      'droit'],
    tirage: { preparation: 2, droit: 2, image: 1 },
    questions: ['aveugle', 'tournant', 'ecart-calcul', 'taux-fiabilite',
      'inventaire-annuel', 'vides-manquants-euros', 'reemploi', 'terminal-informe',
      'terminal-mains', 'code-controle'] },
  etapes: [
    { id: 'avant-inventaire', de: 'nadia', apres: (db) => comptageFini(db, PLAN), ferme: 'ecran:inventaire',
      titre: 'Point d’étape avant l’inventaire', continuer: 'ouvrir l’inventaire',
      situation: 'Le comptage est fini. Avant de comparer avec le logiciel, deux questions.',
      questions: ['aveugle-pourquoi', 'codes-faux'] },
  ],
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'aveugle', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation', cle: true,
      enonce: 'Compter à l’aveugle, c’est…',
      aide: 'Regarde « Mots de l’inventaire » à gauche, puis le mot [[compter à l’aveugle]] dans le lexique.',
      choix: [{ v: 'voir', lib: 'Compter ce qu’on voit, sans regarder le chiffre du logiciel' },
        { v: 'yeux', lib: 'Compter les yeux fermés' },
        { v: 'recopier', lib: 'Recopier le stock du logiciel' }],
      juste: 'voir',
      retour: 'Si tu connais le chiffre, tu risques de le « voir ».' },
    { id: 'tournant', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation',
      enonce: 'Un inventaire tournant, c’est…',
      aide: 'Regarde « Mots de l’inventaire » à gauche, puis le mot [[inventaire tournant]] dans le lexique.',
      choix: [{ v: 'partie', lib: 'Compter une partie du stock à la fois, souvent le matin avant les flux' },
        { v: 'annuel', lib: 'Compter tout l’entrepôt une fois par an' },
        { v: 'vides', lib: 'Compter seulement les vides' }],
      juste: 'partie',
      retour: 'Ce matin : ce qui part demain, et les vides.' },
    { id: 'ecart-calcul', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation', variante: varianteEcart,
      enonce: 'Le logiciel dit 20 fûts ; tu en comptes 16. Quel est l’écart ?',
      aide: 'Regarde « Mots de l’inventaire » : écart = compté − théorique.',
      choix: [{ v: 'ecart', lib: '−4' }, { v: 'inverse', lib: '+4' }, { v: 'compte', lib: '16' }],
      juste: 'ecart',
      retour: 'Écart = compté − théorique. Ensuite, on cherche pourquoi.' },
    { id: 'taux-fiabilite', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation', variante: varianteTaux,
      enonce: 'Sur 10 lignes comptées, 8 sont justes. Quel est le taux de fiabilité ?',
      aide: 'Regarde « Mots de l’inventaire » : lignes justes ÷ lignes comptées × 100. La calculette du site est là pour toi.',
      choix: [{ v: 'taux', lib: '80 %' }, { v: 'inverse', lib: '20 %' }, { v: 'justes', lib: '8 %' }],
      juste: 'taux',
      retour: 'Plus il est proche de 100 %, plus on peut croire le logiciel.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'inventaire-annuel', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true, variante: varianteAnnuel,
      enonce: 'Le dernier inventaire complet de la plateforme a eu lieu le 15 mars 2026. D’après le Code de commerce, au plus tard quand doit avoir lieu le suivant ?',
      aide: 'Lis l’article L123-12 dans « Le droit » : tous les combien ?',
      choix: [{ v: 'douze', lib: 'Le 15 mars 2027' }, { v: 'vingtquatre', lib: 'Le 15 mars 2028' },
        { v: 'jamais', lib: 'Jamais : ce n’est pas obligatoire' }],
      juste: 'douze',
      retour: 'Une entreprise contrôle son stock au moins une fois tous les 12 mois : l’inventaire tournant aide à le tenir juste toute l’année.' },
    { id: 'vides-manquants-euros', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', variante: varianteVides,
      enonce: 'Il manque 5 fûts vides au compte. Combien de consigne est perdue ?',
      aide: 'Lis le montant de la consigne d’un fût dans « Le droit ». La calculette du site est là pour toi.',
      choix: [{ v: 'fut', lib: '200 €' }, { v: 'casier', lib: '20 €' }, { v: 'un', lib: '40 €' }],
      juste: 'fut',
      retour: 'Un vide perdu, c’est 40 € et un fût à refabriquer.' },
    { id: 'reemploi', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Un fût vide est lavé à la brasserie, puis rempli de nouveau. Pour la loi, c’est…',
      aide: 'Lis l’article L541-1-1 dans « Le droit » : comment s’appelle cette opération ?',
      choix: [{ v: 'reemploi', lib: 'Du réemploi : le fût n’est pas un déchet, il resert au même usage' },
        { v: 'recyclage', lib: 'Du recyclage' },
        { v: 'dechet', lib: 'Un déchet' }],
      juste: 'reemploi',
      retour: 'Un fût sert une cinquantaine de fois en 15 ans.' },
    { id: 'terminal-informe', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Le terminal enregistre chaque comptage avec ton nom et l’heure. Que dit la loi ?',
      aide: 'Lis l’article L1222-4 dans « Le droit » : quand le salarié doit-il le savoir ?',
      choix: [{ v: 'avant', lib: 'Le salarié doit en avoir été informé avant' },
        { v: 'rien', lib: 'L’entreprise n’a rien à dire' },
        { v: 'interdit', lib: 'C’est interdit' }],
      juste: 'avant',
      retour: 'Toute information sur toi collectée par un appareil : tu dois le savoir avant.' },
    // ── image (2 : l'élève en reçoit 1)
    { id: 'terminal-mains', type: 'ouverture', de: 'nadia', doc: 'photos', rubrique: 'image',
      enonce: 'Le terminal vocal se porte à la ceinture, avec un casque et un micro. Qu’est-ce que ça change ?',
      aide: 'Regarde le dessin à gauche, puis le mot [[terminal vocal]] dans le lexique.',
      choix: [{ v: 'mains', lib: 'Les mains et les yeux restent libres pour le travail' },
        { v: 'ecran', lib: 'Il faut regarder un écran tout le temps' },
        { v: 'compter', lib: 'On n’a plus besoin de compter' }],
      juste: 'mains',
      retour: 'Il te dit où aller ; tu réponds. Ici, tu tapes tes réponses au clavier.' },
    { id: 'code-controle', type: 'ouverture', de: 'nadia', doc: 'photos', rubrique: 'image',
      enonce: 'Avant de compter, le terminal demande le code de contrôle du couloir. À quoi sert-il ?',
      aide: 'Regarde le mot [[code de contrôle]] dans le lexique.',
      choix: [{ v: 'endroit', lib: 'À prouver qu’on est devant le bon couloir' },
        { v: 'nombre', lib: 'À donner le nombre de fûts' },
        { v: 'chariot', lib: 'À démarrer le chariot' }],
      juste: 'endroit',
      retour: 'Un code faux, et le terminal te renvoie vérifier le couloir.' },
    // ── point d'étape, à la fin du comptage
    { id: 'aveugle-pourquoi', type: 'transition', de: 'nadia',
      enonce: 'Tu viens de compter sans voir le chiffre du logiciel. Pourquoi compte-t-on ainsi ?',
      choix: [{ v: 'influence', lib: 'Pour compter ce qui est là, sans être influencé' },
        { v: 'vite', lib: 'Pour aller plus vite' },
        { v: 'panne', lib: 'Parce que le logiciel est en panne' }],
      juste: 'influence', poids: 1, groupe: 'Question de Nadia : compter à l’aveugle',
      retour: 'Si tu connais le chiffre, tu risques de le « voir » sur la pile. Maintenant, on compare.' },
    { id: 'codes-faux', type: 'transition', de: 'ines',
      enonce: 'Le terminal garde chacune de tes réponses avec l’heure, et tes codes faux s’il y en a. L’entreprise peut-elle s’en servir pour te noter sans te l’avoir dit ? (Code du travail, L1222-3 : « Le salarié est expressément informé, préalablement à leur mise en oeuvre, des méthodes et techniques d’évaluation professionnelles mises en oeuvre à son égard. »)',
      choix: [{ v: 'informe', lib: 'Non : je dois être informé avant de toute méthode d’évaluation' },
        { v: 'terminal', lib: 'Oui, c’est son terminal' },
        { v: 'justes', lib: 'Oui, si les chiffres sont justes' }],
      juste: 'informe', poids: 1.5, groupe: 'Question d’Inès : ce que garde le terminal',
      retour: 'La loi demande de prévenir le salarié avant (L1222-3 et L1222-4). Ici, tu le sais : le terminal garde tout, avec l’heure.' },
    // ── au fil du compte rendu
    { id: 'm04-regul', type: 'fil', de: 'nadia', quand: apresGeste('fiche:compte-rendu:vides-futs'), apres: 'bilan',
      enonce: 'Une question sur M04 : si on régularisait −8 et qu’on retrouvait la palette demain, que vaudrait le stock du logiciel ?',
      choix: [{ v: 'faux', lib: 'Il serait faux de 8 fûts, dans l’autre sens' },
        { v: 'juste', lib: 'Il redeviendrait juste tout seul' },
        { v: 'rien', lib: 'Rien ne changerait' }],
      juste: 'faux', poids: 1.5, groupe: 'Question de Nadia : régulariser M04 ?',
      retour: 'La palette n’avait pas disparu : elle était en M02. On la remet en place, et on ne touche pas au stock.' },
    { id: 'taux-confiance', type: 'fil', de: 'nadia', quand: apresGeste('fiche:compte-rendu:taux'), reflexion: true, apres: 'bilan',
      enonce: 'Tu as calculé ton taux de fiabilité. Peut-on préparer la commande de demain en se fiant au logiciel ?',
      choix: [{ v: 'sans', lib: 'Oui, sans vérifier' },
        { v: 'ecarts', lib: 'Oui, mais en vérifiant les lignes en écart' },
        { v: 'tout', lib: 'Non, il faut tout recompter' }],
      retour: 'Les lignes justes, on peut s’y fier. Les lignes en écart, on les vérifie avant de préparer : c’est à ça que sert l’inventaire tournant.' },
  ],
};
