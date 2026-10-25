// Les questions d'ENT-8.17 — Action, monter et conditionner sa palette (brief `docs/briefs/ENT-8.17-action-conditionner.md` §4 bis et §4 ter,
// PROPOSÉES par le brief, à relire par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`.
//
// AU FIL (`part: 4`, « Les questions de Samia »), branchées sur les gestes de la préparation vocale :
// - `q-lourd` (1, AU BILAN : elle éclairerait le jalon) : le premier groupe lourd posé sur la palette (`pose:lourd`) ;
// - `q-a-cote` (0,75) : la première pose « À côté » (`poser:cote`), ou la 3e ligne si l'élève ne pose jamais à côté (`ligne:L3`) ;
// - `q-film` (0,75) : le film posé (`film`) ;
// - `q-tours` (0,75, écogeste) : les étiquettes posées (`etiquettes`) ;
// - `q-etiquette` (0,75) : « Vérifier ma préparation » (le brief disait « fiche envoyée » ; la fiche « Lire un carton » vient AVANT la palette,
//   la question sur les étiquettes y arriverait trop tôt). Le rattrapage du moteur la pose souvent avant : dès que tous les jalons sont jugés,
//   c'est-à-dire juste après les étiquettes.
// AVANT DE COMMENCER : banque de 8 notions NON notées, 4 tirées (3 de préparation, 1 image) ; `k-acote`, `k-etiquette` et `img-haut` ajoutées
// par Claude Code (le moteur veut une banque double du tirage). Les `aide` sont de Claude Code (à relire).

import { apresGeste } from '../../core/declencheurs.js';
import { ID, GESTE, unDe } from '../action-ent817-donnees.js';

const GROUPE = 'Les questions de Samia';
const PERSONNES = { samia: { nom: 'Samia', role: 'cheffe d’équipe (ta tutrice)', appel: 'Samia', registre: 'tu' } };

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: PERSONNES,
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Aujourd’hui, tu montes ta palette. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['jour', 'picto-fragile', 'picto-haut'],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-lourds', 'k-fragile', 'k-film', 'k-poids', 'k-acote', 'k-etiquette', 'img-fragile', 'img-haut'] },
  liste: [
    { id: 'k-lourds', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Sur une palette, les cartons lourds vont…', aide: 'Lis « Ta matinée ».',
      choix: [{ v: 'bas', lib: 'en bas' }, { v: 'haut', lib: 'en haut' }, { v: 'milieu', lib: 'au milieu' }],
      juste: 'bas', retour: 'En bas : rien ne les écrase, la palette tient.' },
    { id: 'k-fragile', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Un carton de verres va…', aide: 'Clique sur le mot [[fragile]].',
      choix: [{ v: 'haut', lib: 'en haut de la palette' }, { v: 'bas', lib: 'en bas de la palette' }, { v: 'quai', lib: 'à côté de la palette, sur le quai' }],
      juste: 'haut', retour: 'En haut : rien ne pèse sur lui.' },
    { id: 'k-film', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'On filme une palette…', aide: 'Clique sur le mot [[filmer]].',
      choix: [{ v: 'finie', lib: 'quand elle est finie, avant le quai' }, { v: 'avant', lib: 'avant de la remplir' }, { v: 'magasin', lib: 'au magasin' }],
      juste: 'finie', retour: 'Quand tous les cartons sont posés : le film les tient ensemble.' },
    { id: 'k-poids', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Une palette trop lourde…', aide: 'Pense au transpalette et au camion.',
      choix: [{ v: 'refaire', lib: 'ne doit pas partir : on la refait' }, { v: 'part', lib: 'part quand même' }, { v: 'couper', lib: 'est coupée en deux au magasin' }],
      juste: 'refaire', retour: 'Trop lourde, elle est dangereuse : on la refait.' },
    { id: 'k-acote', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Le terminal te donne un carton fragile avant un lourd. Tu…', aide: 'Lis « Ta matinée ».',
      choix: [{ v: 'cote', lib: 'poses le fragile à côté, et le mets sur la palette à la fin' }, { v: 'dessous', lib: 'poses le fragile en bas, tant pis' },
        { v: 'laisse', lib: 'laisses le fragile dans l’allée' }],
      juste: 'cote', retour: 'À côté : tu le poses au bon moment.' },
    { id: 'k-etiquette', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'L’étiquette d’une palette dit surtout…', aide: 'Clique sur le mot [[étiquette]].',
      choix: [{ v: 'magasin', lib: 'pour quel magasin elle part' }, { v: 'prix', lib: 'le prix des produits' }, { v: 'nom', lib: 'le nom du préparateur' }],
      juste: 'magasin', retour: 'Le magasin : la palette part au bon endroit.' },
    { id: 'img-fragile', type: 'ouverture', de: 'samia', doc: 'picto-fragile', rubrique: 'image',
      enonce: 'Ce pictogramme (un verre) veut dire…', aide: 'Clique sur le mot [[pictogramme]].',
      choix: [{ v: 'fragile', lib: 'fragile' }, { v: 'boisson', lib: 'boisson' }, { v: 'recyclable', lib: 'recyclable' }],
      juste: 'fragile', retour: 'Le verre : fragile, ça se casse.' },
    { id: 'img-haut', type: 'ouverture', de: 'samia', doc: 'picto-haut', rubrique: 'image',
      enonce: 'Ces deux flèches veulent dire…', aide: 'Regarde où elles pointent.',
      choix: [{ v: 'haut', lib: 'ce côté en haut : le carton reste debout' }, { v: 'empiler', lib: 'empiler deux cartons' }, { v: 'ouvrir', lib: 'ouvrir par le haut' }],
      juste: 'haut', retour: 'Les flèches montrent le haut : on ne couche pas le carton.' },
    // ── au fil du travail (brief §4 bis)
    { id: 'q-lourd', type: 'fil', de: 'samia', quand: apresGeste(GESTE('pose:lourd')), poids: 1, groupe: GROUPE, apres: 'bilan',
      enonce: 'Pourquoi les lourds en bas ?',
      choix: [{ v: 'tient', lib: 'la palette tient mieux et rien n’écrase les cartons du dessous' }, { v: 'voir', lib: 'ils se voient mieux' },
        { v: 'vite', lib: 'c’est plus rapide' }],
      juste: 'tient', retour: 'Un fragile sous un lourd, c’est de la casse au magasin.' },
    { id: 'q-a-cote', type: 'fil', de: 'samia', quand: unDe(apresGeste(GESTE('poser:cote')), apresGeste(GESTE('ligne:L3'))), poids: 0.75, groupe: GROUPE,
      enonce: 'À quoi sert de poser un carton à côté ?',
      choix: [{ v: 'tard', lib: 'à le mettre sur la palette au bon moment, plus tard' }, { v: 'laisser', lib: 'à le laisser au magasin' },
        { v: 'renvoyer', lib: 'à le renvoyer' }],
      juste: 'tard', retour: 'Le terminal décide de l’ordre de l’allée, toi de l’ordre de la palette.' },
    { id: 'q-film', type: 'fil', de: 'samia', quand: apresGeste(GESTE('film')), poids: 0.75, groupe: GROUPE,
      enonce: 'Le film, ça sert à…',
      choix: [{ v: 'tenir', lib: 'tenir les cartons ensemble pendant le transport' }, { v: 'cacher', lib: 'cacher les produits' },
        { v: 'pluie', lib: 'protéger de la pluie au magasin' }],
      juste: 'tenir', retour: 'Sans film, la palette s’effondre au premier virage.' },
    { id: 'q-tours', type: 'fil', de: 'samia', quand: apresGeste(GESTE('etiquettes')), poids: 0.75, groupe: GROUPE,
      enonce: 'Pourquoi pas 15 tours de film, pour être sûr ?',
      choix: [{ v: 'dechet', lib: 'c’est du plastique gaspillé : il devient un déchet au magasin' }, { v: 'temps', lib: 'ça coûte du temps, seulement' },
        { v: 'abime', lib: 'ça abîme la palette' }],
      juste: 'dechet', retour: 'Assez pour tenir, pas plus.' },
    { id: 'q-etiquette', type: 'fil', de: 'samia', quand: apresGeste(GESTE('verifier')), poids: 0.75, groupe: GROUPE,
      enonce: 'Pourquoi une étiquette sur deux côtés et sur le dessus ?',
      choix: [{ v: 'partout', lib: 'pour la lire de partout sur le quai et dans le camion' }, { v: 'joli', lib: 'c’est plus joli' },
        { v: 'garde', lib: 'le magasin en garde une' }],
      juste: 'partout', retour: 'Une palette qu’on ne lit pas part au mauvais magasin.' },
  ],
};
