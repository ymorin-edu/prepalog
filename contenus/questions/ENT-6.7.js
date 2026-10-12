// Les questions d'ENT-6.7 — France Boissons, la commande de Malo à la voix (brief `docs/briefs/ENT-6.7-france-boissons-preparation.md`, §4 bis
// et §4 ter : propositions de Claude Code, gardées telles quelles par Tristan le 12/10/2026, poids validés le même jour). Modifier ce fichier
// suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES.
//
// AU FIL (3, toutes NOTÉES : `part: 4`, 1 + 1,5 + 1,5). Aucune ne donne d'avance la réponse d'un jalon (ni « Abîmé », ni les 6 fûts, ni le
// fût sur un casier, ni le film, ni les étiquettes).
// - `code-emplacement` (Nadia), NOTÉE 1, à la première ligne posée (`entrepot:…:ligne:A-T01`), corrigée tout de suite.
// - `materiel-employeur` (Inès), NOTÉE 1,5, à la deuxième ligne posée (`…:ligne:A-T02`), corrigée tout de suite. Éco-droit appliqué :
//   C. trav. L4121-1 et R4541-3. Ne touche aucun jalon.
// - `futs-abimes-vendeur` (Nadia), NOTÉE 1,5, au premier « Vérifier ma préparation » (`…:verifier`), corrigée AU BILAN (elle parle du fût
//   cabossé : jalon 3). Éco-droit appliqué : C. civ. 1603 (délivrance).
// La réflexion « gagné / perdu à la voix » (brief §4, choix E de Tristan) est celle de la vue (`montage.reflexion`), sous le bilan : pas ici.
//
// AVANT DE COMMENCER : une banque de 10 questions NON notées, 5 tirées par élève : `{ preparation: 2, droit: 2, image: 1 }`, la calculette
// du site. `fifo-lots`, `poids-futs` et `consigne-vides` sont à VALEURS TIRÉES, jamais celles de la séance (lots S18 et S24 ; 6 fûts de 30 L ;
// les 9 fûts vides de Malo). `cle: true` = à reprendre en évaluation.

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, CONSIGNES } from '../france-boissons.js';
import { ENTREPOT_ID } from '../france-boissons-ent67-donnees.js';

const IMG = './contenus/images/france-boissons/';
const G = (geste) => apresGeste(`entrepot:${ENTREPOT_ID}:${geste}`);
const tirerHors = (h, a, b, exclus) => { let x; do { x = h.entier(a, b); } while (exclus.includes(x)); return x; };

// « Deux lots du même fût : S<a> et S<b>. » (semaines de 10 à 30, jamais 18 ni 24, celles de la séance ; a < b).
const varianteFifo = (h) => {
  const a = tirerHors(h, 10, 28, [18, 24]);
  const b = tirerHors(h, a + 1, 30, [18, 24]);
  return { enonce: `Dans le picking, deux lots du même fût : S${a} et S${b}. Lequel part en premier ?`,
    libs: { ancien: `S${a}, le plus ancien`, recent: `S${b}, le plus récent`, egal: 'Peu importe' } };
};
// « n fûts de 30 L, environ 40 kg chacun. » (n de 2 à 9, jamais 6 : la ligne Heineken de la séance).
const variantePoids = (h) => {
  const n = tirerHors(h, 2, 9, [6]);
  return { enonce: `Un fût de 30 L plein pèse environ 40 kg. Combien pèsent ${n} fûts, sans la palette ?`,
    libs: { juste: `${n * 40} kg`, trente: `${n * 30} kg`, un: '40 kg' } };
};
// « Malo rend k fûts vides. » (k de 2 à 8 : jamais 9, ses vides de la S2).
const varianteConsigne = (h) => {
  const k = h.entier(2, 8);
  return { enonce: `À la livraison, Malo rend ${k} fûts vides. Combien de consigne lui est rendue ?`,
    libs: { fut: `${k * CONSIGNES.fut} €`, casier: `${k * CONSIGNES.casier} €`, un: `${CONSIGNES.fut} €` } };
};

export const QUESTIONS = {
  id: 'france-boissons-preparation',
  part: 4,
  personnes: { nadia: EQUIPE.nadia, ines: EQUIPE.ines },
  ouverture: { id: 'avant-de-commencer', de: 'nadia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Re-bonjour ! Cet après-midi, tu prépares une commande à la voix. Avant, lis les documents à gauche et réponds à mes questions.',
    calculette: true,
    documents: ['mots',
      { id: 'photos', court: 'Dessins', titre: 'Le poste de préparation', type: 'images', images: [
        { src: IMG + 'materiel-portique-futs.svg', alt: 'Sous un portique fixe, un préparateur guide un manipulateur à air qui lève un fût vers une palette client de 1,20 × 0,80 m',
          credit: 'Dessin simplifié d’après une vidéo de présentation de la plateforme de Buchelay', large: true }] },
      'droit'],
    tirage: { preparation: 2, droit: 2, image: 1 },
    questions: ['fifo-lots', 'vocal-dialogue', 'picking-reserve', 'poids-futs',
      'terminal-informe', 'pause-6h', 'consigne-vides', 'ddm-biere',
      'portique-role', 'ciseaux-hauteur'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'fifo-lots', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation', cle: true, variante: varianteFifo,
      enonce: 'Dans le picking, deux lots du même fût : S12 et S20. Lequel part en premier ?',
      aide: 'Regarde « Mots de la préparation » à gauche, puis le mot [[FIFO]] dans le lexique.',
      choix: [{ v: 'ancien', lib: 'S12, le plus ancien' }, { v: 'recent', lib: 'S20, le plus récent' }, { v: 'egal', lib: 'Peu importe' }],
      juste: 'ancien',
      retour: 'Premier entré, premier sorti : le plus ancien part d’abord, sinon il vieillit en stock.' },
    { id: 'vocal-dialogue', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation', cle: true,
      enonce: 'En préparation vocale, que fait le terminal ?',
      aide: 'Regarde « Mots de la préparation » à gauche, puis le mot [[préparation vocale]] dans le lexique.',
      choix: [{ v: 'annonce', lib: 'Il annonce l’emplacement, puis la quantité ; tu lui réponds' },
        { v: 'liste', lib: 'Il affiche toute la commande d’un coup' },
        { v: 'seul', lib: 'Il prépare la commande tout seul' }],
      juste: 'annonce',
      retour: 'Une ligne à la fois, dans l’ordre du parcours : tu ne vois pas la suite.' },
    { id: 'picking-reserve', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation',
      enonce: 'Le picking et la réserve, c’est…',
      aide: 'Regarde « Mots de la préparation » à gauche, puis les mots [[picking]] et [[réserve]] dans le lexique.',
      choix: [{ v: 'prelever', lib: 'On prélève au picking ; la réserve sert à le remplir' },
        { v: 'pareil', lib: 'Deux noms pour le même endroit' },
        { v: 'inverse', lib: 'On prélève dans la réserve ; le picking sert à la remplir' }],
      juste: 'prelever',
      retour: 'Ce matin, le lot S18 est passé de la réserve (zone de masse) au picking.' },
    { id: 'poids-futs', type: 'ouverture', de: 'nadia', doc: 'mots', rubrique: 'preparation', variante: variantePoids,
      enonce: 'Un fût de 30 L plein pèse environ 40 kg. Combien pèsent 4 fûts, sans la palette ?',
      aide: 'Multiplie le nombre de fûts par le poids d’un fût. La calculette du site est là pour toi.',
      choix: [{ v: 'juste', lib: '160 kg' }, { v: 'trente', lib: '120 kg' }, { v: 'un', lib: '40 kg' }],
      juste: 'juste',
      retour: 'C’est pour ça qu’on lève les fûts avec le portique, jamais à la main.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'terminal-informe', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Le terminal enregistre chacune de tes réponses avec l’heure. Que dit la loi ?',
      aide: 'Lis l’article L1222-4 dans « Le droit » : quand le salarié doit-il le savoir ?',
      choix: [{ v: 'avant', lib: 'Le salarié doit en avoir été informé avant' },
        { v: 'rien', lib: 'L’entreprise n’a rien à dire' },
        { v: 'interdit', lib: 'C’est interdit' }],
      juste: 'avant',
      retour: 'Ce matin déjà, tu le savais : le terminal garde tout, avec l’heure.' },
    { id: 'pause-6h', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit',
      enonce: 'Tu as travaillé 6 heures aujourd’hui. As-tu droit à une pause ?',
      aide: 'Lis l’article L3121-16 dans « Le droit ».',
      choix: [{ v: 'vingt', lib: 'Oui, au moins 20 minutes d’affilée' },
        { v: 'non', lib: 'Non, seulement après 8 heures' },
        { v: 'cinq', lib: 'Oui, 5 minutes' }],
      juste: 'vingt',
      retour: 'Un préparateur fatigué se trompe et se blesse : la pause fait partie de la sécurité.' },
    { id: 'consigne-vides', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit', variante: varianteConsigne,
      enonce: 'À la livraison, Malo rend 5 fûts vides. Combien de consigne lui est rendue ?',
      aide: 'Lis le montant de la consigne d’un fût dans « Le droit ». La calculette du site est là pour toi.',
      choix: [{ v: 'fut', lib: '200 €' }, { v: 'casier', lib: '20 €' }, { v: 'un', lib: '40 €' }],
      juste: 'fut',
      retour: 'Chaque fût vide rendu, c’est 40 € rendus au client, et un fût qui repart à la brasserie.' },
    { id: 'ddm-biere', type: 'ouverture', de: 'nadia', doc: 'droit', rubrique: 'droit',
      enonce: 'Sur un fût de bière, « à consommer de préférence avant », c’est…',
      aide: 'Lis l’extrait du règlement européen dans « Le droit ».',
      choix: [{ v: 'ddm', lib: 'Une date de durabilité minimale : on fait partir le plus ancien d’abord' },
        { v: 'dlc', lib: 'Une date après laquelle la bière est dangereuse' },
        { v: 'fabrication', lib: 'La date de fabrication' }],
      juste: 'ddm',
      retour: 'Passée la date, la bière perd ses qualités : c’est une raison de plus de suivre le FIFO.' },
    // ── image (2 : l'élève en reçoit 1)
    { id: 'portique-role', type: 'ouverture', de: 'nadia', doc: 'photos', rubrique: 'image',
      enonce: 'Sur le dessin, à quoi sert le manipulateur du portique ?',
      aide: 'Regarde le dessin à gauche, puis le mot [[manipulateur à air]] dans le lexique.',
      choix: [{ v: 'lever', lib: 'À soulever le fût : tu le guides avec la poignée' },
        { v: 'compter', lib: 'À compter les fûts' },
        { v: 'filmer', lib: 'À filmer la palette' }],
      juste: 'lever',
      retour: 'Tu guides, l’air porte : ton dos ne porte pas les 40 kg.' },
    { id: 'ciseaux-hauteur', type: 'ouverture', de: 'nadia', doc: 'photos', rubrique: 'image',
      enonce: 'Pourquoi prépare-t-on la palette client sur un transpalette à ciseaux ?',
      aide: 'Regarde le mot [[transpalette à ciseaux]] dans le lexique.',
      choix: [{ v: 'hauteur', lib: 'Il la monte à hauteur de travail : on ne se penche pas' },
        { v: 'vite', lib: 'Il va plus vite qu’un transpalette ordinaire' },
        { v: 'filmer', lib: 'Il filme la palette tout seul' }],
      juste: 'hauteur',
      retour: 'Moins se pencher, c’est moins de mal de dos à la fin de la journée.' },
    // ── au fil de la préparation
    { id: 'code-emplacement', type: 'fil', de: 'nadia', quand: G('ligne:A-T01'),
      enonce: 'Tu viens de faire ta première ligne. Pourquoi le terminal te demande-t-il le code de l’emplacement ?',
      choix: [{ v: 'endroit', lib: 'Pour prouver que je suis devant le bon emplacement' },
        { v: 'quantite', lib: 'Pour connaître la quantité à prendre' },
        { v: 'nom', lib: 'Pour savoir qui prépare' }],
      juste: 'endroit', poids: 1, groupe: 'Question de Nadia : le code de l’emplacement',
      retour: 'Sans le bon code, pas de quantité : tu ne peux pas prendre dans le mauvais tiroir.' },
    { id: 'materiel-employeur', type: 'fil', de: 'ines', quand: G('ligne:A-T02'),
      enonce: 'Les tiroirs coulissants, le portique, le transpalette à ciseaux : qui doit les fournir ? (Code du travail, R4541-3 : « L’employeur '
        + 'prend les mesures d’organisation appropriées ou utilise les moyens appropriés, et notamment les équipements mécaniques, afin '
        + 'd’éviter le recours à la manutention manuelle de charges par les travailleurs. »)',
      choix: [{ v: 'employeur', lib: 'L’employeur : il doit éviter que je porte les fûts à la main' },
        { v: 'salarie', lib: 'Moi, si je veux travailler plus facilement' },
        { v: 'client', lib: 'Le client, qui achète les fûts' }],
      juste: 'employeur', poids: 1.5, groupe: 'Question d’Inès : le matériel du poste',
      retour: 'C’est une obligation de l’employeur (L4121-1 et R4541-3) : protéger la santé de ses salariés, ici leur dos.' },
    { id: 'futs-abimes-vendeur', type: 'fil', de: 'nadia', quand: G('verifier'), apres: 'bilan',
      enonce: 'Imagine : un fût cabossé arrive vendredi chez Malo. Qui en répond ? (Code civil, article 1603 : le vendeur « a deux obligations '
        + 'principales, celle de délivrer et celle de garantir la chose qu’il vend. »)',
      choix: [{ v: 'vendeur', lib: 'France Boissons, le vendeur : il doit livrer ce qui a été commandé, en bon état' },
        { v: 'malo', lib: 'Malo : il n’avait qu’à vérifier' },
        { v: 'lucas', lib: 'Lucas, le chauffeur' }],
      juste: 'vendeur', poids: 1.5, groupe: 'Question de Nadia : le fût cabossé',
      retour: 'Un fût cabossé peut fuir ou mal se servir : c’est France Boissons qui le reprend et le remplace. D’où « Abîmé » au terminal, avant le départ.' },
  ],
};
