// Les questions d'ENT-6.10 — France Boissons, le retour de Lucas (brief `docs/briefs/ENT-6.10-france-boissons-retour.md` §4 bis et §4 ter ;
// propositions de Cowork `docs/briefs/france-boissons/PROPOSITIONS-questions-au-fil.md` et `BANQUE-avant-de-commencer.md`, toutes gardées
// par Tristan le 10/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`.
// Personnes et situations CONSTRUITES.
//
// AU FIL (5, dont 3 notées : `part: 4`, poids 1,5 · 1,5 · 1 ; poids validés par Tristan le 13/10/2026, option A) :
// - `ce-que-tu-compares` : Karim, au choix de « Le ticket est-il juste ? » (cite son choix), réflexion corrigée au bilan (le retour
//   soufflerait l'écart avant l'envoi du contrôle).
// - `qui-aurait-du-compter` (NOTÉE 1,5) : point d'étape de Karim après l'envoi du contrôle ; garde fermé le compte de consignes.
// - `consigne-due` (NOTÉE 1,5, C. civ. 1103) : Inès, au premier choix de la ligne « solde » de la réponse à Malo ; corrigée au bilan.
//   ÉCART avec la proposition de Cowork : l'énoncé est GÉNÉRAL (« un client garde un fût de plus ») et non « Malo garde chez lui un fût
//   de plus » : cité tel quel, il donnait d'avance le solde de Malo et la phrase d'Inès (jalons 8 et 9) pendant que l'élève les écrit.
// - `reemploi-loi` (NOTÉE 1, C. env. L541-1-1) : Karim, à l'envoi du chiffrage, cite le verre jeté de SA feuille (`selon`).
// - `si-personne-navait-compte` : « Pour réfléchir » du brief §4 (règle 32), réponse libre non notée, à l'envoi du chiffrage, lue au bilan.
// Les deux questions de l'animation sont des jalons de la séance (10 et 11), pas des questions au fil.
//
// AVANT DE COMMENCER : une banque de 8 questions NON notées, 4 tirées par élève (2 de préparation, 2 de droit), la calculette du site.
// Valeurs tirées (`variante`) : `solde-chez-client` (jamais 9 / 9 / 8, les nombres de Malo), `consigne-nette` (jamais 9 pleins et 8 vides).

import { apresGeste, apresFiche } from '../../core/declencheurs.js';
import { EQUIPE } from '../france-boissons.js';
import { ID, FICHE_CONTROLE, FICHE_COMPTE, FICHE_CHIFFRAGE, CHOIX_TICKET, comptesEleve, valeurChiffrage } from '../france-boissons-ent610-donnees.js';

const fr = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

// ── Son choix sur le ticket, au moment du geste (la fiche n'est pas encore envoyée : on lit ce qu'il vient de choisir).
const selonTicket = (db) => {
  const v = db && db.fiches && db.fiches[FICHE_CONTROLE] && db.fiches[FICHE_CONTROLE].valeurs && db.fiches[FICHE_CONTROLE].valeurs.ticket;
  const c = CHOIX_TICKET.find((x) => x.v === v);
  return { enonce: c ? `Tu as répondu « ${c.lib} ». Qu’as-tu comparé ?` : 'Tu as répondu sur le ticket. Qu’as-tu comparé ?' };
};
// ── Le verre jeté de SA feuille (ligne 9), à l'envoi.
const selonVerre = (db) => {
  const x = valeurChiffrage(db, 'B9');
  return { enonce: x == null
    ? 'Un fût lavé puis rempli de nouveau évite de jeter du verre. Pour la loi, ce que fait le fût s’appelle…'
    : `Ton calcul : ${fr(x)} kg de verre jeté évités pour un seul fût, sur sa vie. Pour la loi, ce que fait le fût s’appelle…` };
};
// ── Les valeurs tirées de l'ouverture.
const varianteSolde = (h) => {
  let a, l, r;
  do { a = h.choisir([3, 4, 5, 6, 7, 8]); l = h.choisir([2, 3, 4, 5, 6]); r = h.choisir(Array.from({ length: a }, (_, k) => k + 1)); } while (r === l);
  return {
    enonce: `Un restaurant avait ${a} fûts chez lui. On lui en livre ${l} pleins et on reprend ${r} vides. Combien de fûts a-t-il maintenant ?`,
    libs: { juste: `${a + l - r} fûts`, plus: `${a + l + r} fûts`, inverse: `${a - l + r} fûts` },
    retour: `${a} + ${l} − ${r} = ${a + l - r} fûts. Avant + livré − repris : c’est la ligne 5 de ta feuille.`,
  };
};
const varianteConsigne = (h) => {
  const p = h.choisir([3, 4, 5, 6, 7, 8]), v = h.choisir(Array.from({ length: p - 1 }, (_, k) => k + 1));
  return {
    enonce: `Un restaurant reçoit ${p} fûts pleins et rend ${v} fûts vides. Combien de consigne de fûts lui facture-t-on en plus ?`,
    libs: { juste: `${(p - v) * 40} €`, pleins: `${p * 40} €`, somme: `${(p + v) * 40} €` },
    retour: `(${p} − ${v}) × 40 = ${(p - v) * 40} €. On facture la consigne des pleins, on rend celle des vides.`,
  };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { karim: EQUIPE.karim, ines: EQUIPE.ines },
  ouverture: { id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Lucas rentre avec les vides de la côte, et c’est toi qui vas l’accueillir au quai. Avant de commencer, lis les '
      + 'documents à gauche et réponds à mes questions.',
    calculette: true,
    documents: ['conditions', 'droit', 'annuaire'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['avoir', 'solde-chez-client', 'ticket-terminal', 'qui-facture',
      'consigne-nette', 'reemploi-recyclage', 'contrat-vides', 'terminal-chauffeur'] },
  etapes: [
    { id: 'apres-controle', de: 'karim', apres: (db) => comptesEleve(db) != null,
      ferme: `ecran:fiche:${FICHE_COMPTE}`, titre: 'Point d’étape avant le compte de consignes', continuer: 'faire le compte de consignes',
      situation: 'J’ai bien ton contrôle. Avant que tu fasses le compte de consignes de Malo, une question sur le ticket.',
      questions: ['qui-aurait-du-compter'] },
  ],
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'avoir', type: 'ouverture', de: 'karim', doc: 'conditions', rubrique: 'preparation', cle: true,
      enonce: 'Un avoir, c’est…',
      aide: 'Le mot [[avoir]] est dans le lexique, et dans les conditions de vente.',
      choix: [{ v: 'du', lib: 'Une somme que l’entreprise doit au client, déduite de sa prochaine facture' },
        { v: 'facture', lib: 'Une facture en plus' }, { v: 'amende', lib: 'Une amende' }],
      juste: 'du',
      retour: 'Quand un client rend plus de vides qu’il n’a reçu de pleins, on lui doit de l’argent.' },
    { id: 'solde-chez-client', type: 'ouverture', de: 'karim', doc: 'conditions', rubrique: 'preparation', cle: true, variante: varianteSolde,
      enonce: 'Un restaurant avait 5 fûts chez lui. On lui en livre 4 pleins et on reprend 3 vides. Combien de fûts a-t-il maintenant ?',
      aide: 'Ce qu’il avait, plus ce qu’on lui livre, moins ce qu’on lui reprend.',
      choix: [{ v: 'juste', lib: '6 fûts' }, { v: 'plus', lib: '12 fûts' }, { v: 'inverse', lib: '4 fûts' }],
      juste: 'juste',
      retour: '5 + 4 − 3 = 6 fûts. Avant + livré − repris : c’est la ligne 5 de ta feuille.' },
    { id: 'ticket-terminal', type: 'ouverture', de: 'karim', doc: 'conditions', rubrique: 'preparation',
      enonce: 'Le ticket de livraison et de reprise est imprimé par…',
      aide: 'Le mot [[ticket de livraison]] est dans le lexique.',
      choix: [{ v: 'terminal', lib: 'Le terminal du chauffeur, chez le client' }, { v: 'brasserie', lib: 'La brasserie' },
        { v: 'ines', lib: 'Inès, le lendemain' }],
      juste: 'terminal',
      retour: 'Il est rempli sur place, et signé par le client.' },
    { id: 'qui-facture', type: 'ouverture', de: 'karim', doc: 'annuaire', rubrique: 'preparation',
      enonce: 'Qui édite la facture des clients ?',
      aide: 'Regarde l’annuaire de la plateforme.',
      choix: [{ v: 'ines', lib: 'Inès, au service des ventes' }, { v: 'karim', lib: 'Karim' }, { v: 'lucas', lib: 'Lucas' },
        { v: 'client', lib: 'Le client' }],
      juste: 'ines',
      retour: 'C’est à elle que tu enverras le compte de consignes.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'consigne-nette', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit', variante: varianteConsigne,
      enonce: 'Un restaurant reçoit 6 fûts pleins et rend 4 fûts vides. Combien de consigne de fûts lui facture-t-on en plus ?',
      aide: 'Lis le montant de la consigne d’un fût (arrêté du 6 février 2026) dans « Le droit ».',
      choix: [{ v: 'juste', lib: '80 €' }, { v: 'pleins', lib: '240 €' }, { v: 'somme', lib: '400 €' }],
      juste: 'juste',
      retour: '(6 − 4) × 40 = 80 €. On facture la consigne des pleins, on rend celle des vides.' },
    { id: 'reemploi-recyclage', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Une bouteille jetée au verre devient du verre neuf. Un fût vide est lavé, puis rempli. Lequel est du réemploi ?',
      aide: 'Lis la définition du réemploi (Code de l’environnement, L541-1-1) dans « Le droit ».',
      choix: [{ v: 'fut', lib: 'Le fût' }, { v: 'bouteille', lib: 'La bouteille' }, { v: 'deux', lib: 'Les deux' }],
      juste: 'fut',
      retour: 'Réemploi : le même objet resert. Recyclage : on refait de la matière.' },
    { id: 'contrat-vides', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit',
      enonce: 'Les conditions de vente acceptées par Malo disent : « vides repris par le chauffeur à la livraison ». Un chauffeur pourrait-il refuser de les reprendre ?',
      aide: 'Lis l’article 1103 du Code civil dans « Le droit ».',
      choix: [{ v: 'non', lib: 'Non : le contrat s’impose aux deux parties, France Boissons doit les reprendre' },
        { v: 'place', lib: 'Oui, s’il manque de place' }, { v: 'choix', lib: 'Oui, au choix du chauffeur' }],
      juste: 'non',
      retour: 'Ce qu’on a promis par contrat, on le tient.' },
    { id: 'terminal-chauffeur', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Le terminal de Lucas enregistre l’heure de chaque livraison. Lucas doit-il le savoir ?',
      aide: 'Lis l’article L1222-4 du Code du travail dans « Le droit ».',
      choix: [{ v: 'oui', lib: 'Oui : il doit en avoir été informé avant' }, { v: 'non', lib: 'Non, c’est le terminal de l’entreprise' },
        { v: 'demande', lib: 'Non, seulement s’il le demande' }],
      juste: 'oui',
      retour: 'Même règle que pour le terminal vocal de jeudi.' },
    // ── point d'étape
    { id: 'qui-aurait-du-compter', type: 'transition', de: 'karim', poids: 1.5,
      enonce: 'Le ticket disait 9 vides. Qui aurait dû les compter, et quand ?',
      choix: [{ v: 'lucas', lib: 'Lucas, avec Malo, au moment de la reprise' }, { v: 'ines', lib: 'Inès, en faisant la facture' },
        { v: 'terminal', lib: 'Personne : le terminal compte tout seul' }],
      juste: 'lucas', groupe: 'Question de Karim : qui compte les vides',
      retour: 'Le chauffeur compte avec le client, au moment de la reprise : c’est là que le ticket se signe. Après, c’est trop tard, et la facture part avec.' },
    // ── au fil du travail
    { id: 'ce-que-tu-compares', type: 'fil', de: 'karim', quand: apresGeste(`fiche:${FICHE_CONTROLE}:ticket`), reflexion: true, apres: 'bilan',
      selon: selonTicket,
      enonce: 'Tu as répondu sur le ticket. Qu’as-tu comparé ?',
      choix: [{ v: 'quai', lib: 'Le ticket et ce qui est au quai' }, { v: 'commande', lib: 'Le ticket et la commande' },
        { v: 'rien', lib: 'Rien, le ticket est signé' }],
      retour: 'Un ticket se compare à ce qui est au quai, pas à la commande : il avait justement recopié les vides de la commande.' },
    { id: 'consigne-due', type: 'fil', de: 'ines', quand: apresGeste('messagerie:phrase:solde'), poids: 1.5, apres: 'bilan',
      enonce: 'Un client garde chez lui un fût consigné de plus qu’avant la livraison. Que doit-il à France Boissons pour ce fût ?',
      choix: [{ v: 'consigne', lib: 'Sa consigne, prévue par les conditions de vente qu’il a acceptées' },
        { v: 'rien', lib: 'Rien, il l’a déjà payé' }, { v: 'biere', lib: 'Le prix de la bière' }],
      juste: 'consigne', groupe: 'Question d’Inès : la consigne d’un fût gardé',
      retour: 'Le contrat (les conditions de vente) s’impose au client comme à nous (Code civil, 1103) : un fût de plus chez lui, c’est une consigne de plus à facturer.' },
    { id: 'reemploi-loi', type: 'fil', de: 'karim', quand: apresFiche(FICHE_CHIFFRAGE), poids: 1, selon: selonVerre,
      enonce: 'Un fût lavé puis rempli de nouveau évite de jeter du verre. Pour la loi, ce que fait le fût s’appelle…',
      choix: [{ v: 'reemploi', lib: 'Du réemploi' }, { v: 'recyclage', lib: 'Du recyclage' }, { v: 'valorisation', lib: 'De la valorisation' }],
      juste: 'reemploi', groupe: 'Question de Karim : réemploi ou recyclage',
      retour: 'Le même fût resert pour le même usage : c’est du réemploi (Code de l’environnement, L541-1-1). Le recyclage refait de la matière neuve.' },
    { id: 'si-personne-navait-compte', type: 'fil', de: 'karim', quand: apresFiche(FICHE_CHIFFRAGE), reflexion: true, libre: true, apres: 'bilan',
      enonce: 'Pour réfléchir : le ticket disait 9 vides parce qu’il avait recopié la commande que tu as saisie mardi. Qu’est-ce qui se serait passé ce soir si personne n’avait compté ?',
      retour: 'Inès aurait déconsigné 9 vides au lieu de 8 : France Boissons aurait rendu à Malo 40 € de consigne pour un fût qui est encore chez lui, '
        + 'et son compte de consignes serait resté faux jusqu’à ce que quelqu’un compte.' },
  ],
};
