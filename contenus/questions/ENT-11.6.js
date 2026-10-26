// Les questions d'ENT-11.6 — Mondial Relay, évaluation « les renforts de décembre » (brief `docs/briefs/ENT-11.6-mondial-relay-evaluation-renforts.md` §4 bis et §4 ter ;
// propositions acceptées par Tristan le 26/10/2026 : `docs/briefs/mondial-relay/A-TRANCHER.md`). Modifier ce fichier suffit : voir « Modifier les questions d'une
// séance » dans `activites/FICHE-SEANCE.md`. Personnes CONSTRUITES : Hélène (responsable RH du hub, tutrice), Romain (chef d'équipe du tri de nuit).
//
// AVANT DE COMMENCER (noté, `part: 4`) : 8 questions, l'élève en reçoit 4 (`tirage: { preparation: 2, droit: 2 }`), aucune aide, aucun mot cliquable, « Je ne sais
// pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0 ; « Réponse enregistrée. » sans correction.
// La banque reprend les questions ★ (`cle: true`) d'ENT-6.3 (« qui décide des congés », « congés acquis »), adaptées au hub (ENT-5.1 et 5.2 n'en ont pas) ; les
// autres viennent de la banque d'ENT-6.3 (plafond de 30 jours, 24 jours d'affilée, essai d'un CDD) ou sont nouvelles (le besoin d'une nuit, les renforts à prévoir,
// le rôle de Romain). Aucune ne dit le contrat des renforts, les dates du CDD ni la décision d'un congé (ce sont des jalons). Valeurs tirées (`variante`) : le
// nombre de personnes qu'il faut (de 10 à 13), les mois travaillés (4 à 10, pairs ; 13 à 16), les semaines d'un CDD (jamais celles de la demande). La clé de la
// bonne réponse est la même pour tous ; seuls les textes changent. Textes de loi : le document « Le droit » (articles de l'ENT-6.3, relus le 10/10/2026 sur
// code.travail.gouv.fr).
//
// AU FIL (3, TOUTES NON NOTÉES : le tableau des poids validé n'en réserve aucun ; en évaluation « Merci, je note » à l'écran, aucun retour) :
// - `pourquoi-refus` : Hélène, dès qu'un congé est refusé dans le planning de l'élève, ancrée sur CE congé (le prénom de l'agent est calculé) ;
// - `quel-contrat` : Hélène, à l'envoi de la demande de recrutement ;
// - `qui-paie-interim` (★ éco-droit, RÉFLEXION) : l'intérim n'a jamais été travaillé en 2de (règle 15 du 05/10/2026, décision de Tristan du 26/10/2026) ; il
//   n'apparaît donc qu'ici, sans note. Code du travail, travail temporaire : article à relever sur Légifrance (non cité à l'écran).

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, FICHES, ID, champConge, jeuDeBase } from '../mondial-relay-ent116-donnees.js';

const virgule = (x) => String(x).replace('.', ',');

const varianteRenforts = (h) => {
  const n = h.entier(10, 13);
  return {
    enonce: `Une nuit, le tri a besoin de ${n} personnes. L’équipe compte 8 agents en CDI, tous au travail. Combien de renforts faut-il ?`,
    libs: { ecart: `${n - 8} renforts`, besoin: `${n} renforts`, tous: `${n + 8} renforts` },
    retour: `Le besoin moins les agents présents : ${n} − 8 = ${n - 8} renforts.`,
  };
};
const varianteAcquis = (h) => {
  const m = 2 * h.entier(1, 5);
  return {
    enonce: `Un agent travaille depuis ${m} mois au hub. Combien de jours de congé a-t-il acquis ?`,
    libs: { '25': `${virgule(m * 2.5)} jours ouvrables`, '2': `${m * 2} jours ouvrables`, '1': `${m} jours ouvrables` },
    retour: `2,5 jours ouvrables par mois travaillé : ${m} × 2,5 = ${virgule(m * 2.5)} jours. Sur une année entière, cela fait 30 jours (5 semaines).`,
  };
};
const variantePlafond = (h) => {
  const m = h.entier(13, 16);
  return {
    enonce: `Un agent a travaillé ${m} mois sur la période de calcul de ses congés. Combien de jours de congé peut-il exiger au plus ?`,
    libs: { '30': '30 jours ouvrables', calcul: `${virgule(m * 2.5)} jours ouvrables`, '24': '24 jours ouvrables' },
    retour: `2,5 jours par mois, mais jamais plus de 30 jours ouvrables : ${m} × 2,5 dépasse 30, il peut en exiger 30.`,
  };
};
const varianteEssai = (h) => {
  const w = h.choisir([3, 4, 5, 8, 9, 10, 12]);
  return {
    enonce: `Un agent de tri saisonnier est embauché en CDD de ${w} semaines. Sa période d’essai peut durer au plus…`,
    libs: { jours: `${w} jours`, mois: '1 mois', aucune: 'Il n’y a pas de période d’essai en CDD' },
    retour: `Un jour par semaine de contrat : ${w} semaines, ${w} jours au plus. Et jamais plus de 2 semaines pour un contrat de 6 mois ou moins.`,
  };
};

// Le congé que l'élève vient de refuser dans SON planning (le rang 0 à 2 de la première demande refusée), ou undefined.
const refuseDe = (db) => {
  const v = ((db && db.fiches && db.fiches[FICHES.planning]) || {}).valeurs || {};
  return [0, 1, 2].find((k) => v[champConge(k)] === 'refuser');
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { helene: EQUIPE.helene, romain: EQUIPE.romain },
  ouverture: { id: 'avant-de-commencer', de: 'helene', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Le pic de fin d’année arrive au hub, et il faut préparer les nuits de tri. Avant de commencer, réponds à mes questions, sans aide.',
    calculette: true,
    documents: ['planning-116', 'organigramme-116', 'droit-116'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['qui-decide-conges', 'besoin-nuit', 'calcul-renforts', 'role-romain', 'conges-acquis', 'plafond-30', 'bloc-24-jours', 'essai-cdd'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'qui-decide-conges', type: 'ouverture', de: 'helene', doc: 'organigramme-116', rubrique: 'preparation', cle: true,
      enonce: 'Qui décide des congés des agents de tri de nuit ?',
      choix: [{ v: 'helene', lib: 'Hélène, la responsable des ressources humaines ; l’assistant(e) RH prépare et informe' },
        { v: 'romain', lib: 'Romain, le chef d’équipe, tout seul' },
        { v: 'assistant', lib: 'L’assistant(e) RH, tout(e) seul(e)' },
        { v: 'chacun', lib: 'Chaque agent pour lui-même' }],
      juste: 'helene',
      retour: 'Hélène décide (lien hiérarchique) ; l’assistant(e) RH met en forme et informe (lien fonctionnel). Romain donne le besoin de son équipe.' },
    { id: 'besoin-nuit', type: 'ouverture', de: 'helene', doc: 'planning-116', rubrique: 'preparation',
      enonce: 'Dans le planning des nuits, le « besoin » d’une nuit, c’est…',
      choix: [{ v: 'travail', lib: 'Le nombre de personnes qui doivent travailler au tri cette nuit-là' },
        { v: 'conge', lib: 'Le nombre d’agents en congé' },
        { v: 'colis', lib: 'Le nombre de colis à trier' }],
      juste: 'travail',
      retour: 'Si trop d’agents partent, il manque du monde pour trier les colis : le besoin dit combien de personnes il faut.' },
    { id: 'calcul-renforts', type: 'ouverture', de: 'helene', doc: 'planning-116', rubrique: 'preparation', variante: varianteRenforts,
      enonce: 'Une nuit, le tri a besoin de 12 personnes. L’équipe compte 8 agents en CDI, tous au travail. Combien de renforts faut-il ?',
      choix: [{ v: 'ecart', lib: '4 renforts' }, { v: 'besoin', lib: '12 renforts' }, { v: 'tous', lib: '20 renforts' }],
      juste: 'ecart',
      retour: 'Le besoin moins les agents présents : 12 − 8 = 4 renforts.' },
    { id: 'role-romain', type: 'ouverture', de: 'helene', doc: 'organigramme-116', rubrique: 'preparation',
      enonce: 'Romain est chef d’équipe du tri de nuit. Dans la préparation du pic, il…',
      choix: [{ v: 'besoin', lib: 'donne le besoin de son équipe, nuit par nuit' },
        { v: 'contrats', lib: 'signe les contrats des renforts' },
        { v: 'paie', lib: 'prépare la paie des agents' }],
      juste: 'besoin',
      retour: 'Romain connaît le terrain : il dit combien de personnes il lui faut. Les contrats et la paie passent par les ressources humaines.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'conges-acquis', type: 'ouverture', de: 'helene', doc: 'droit-116', rubrique: 'droit', cle: true, variante: varianteAcquis,
      enonce: 'Un agent travaille depuis 4 mois au hub. Combien de jours de congé a-t-il acquis ?',
      choix: [{ v: '25', lib: '10 jours ouvrables' }, { v: '2', lib: '8 jours ouvrables' }, { v: '1', lib: '4 jours ouvrables' }],
      juste: '25',
      retour: '2,5 jours ouvrables par mois travaillé : 4 × 2,5 = 10 jours. Sur une année entière, cela fait 30 jours (5 semaines).' },
    { id: 'plafond-30', type: 'ouverture', de: 'helene', doc: 'droit-116', rubrique: 'droit', variante: variantePlafond,
      enonce: 'Un agent a travaillé 14 mois sur la période de calcul de ses congés. Combien de jours de congé peut-il exiger au plus ?',
      choix: [{ v: '30', lib: '30 jours ouvrables' }, { v: 'calcul', lib: '35 jours ouvrables' }, { v: '24', lib: '24 jours ouvrables' }],
      juste: '30',
      retour: '2,5 jours par mois, mais jamais plus de 30 jours ouvrables : 14 × 2,5 dépasse 30, il peut en exiger 30.' },
    { id: 'bloc-24-jours', type: 'ouverture', de: 'helene', doc: 'droit-116', rubrique: 'droit',
      enonce: 'Un agent demande 5 semaines de congé d’affilée. Doit-on les lui accorder d’un seul bloc ?',
      choix: [{ v: 'non24', lib: 'Non : un congé pris en une seule fois ne dépasse pas 24 jours ouvrables (4 semaines), sauf cas prévus par la loi' },
        { v: 'oui', lib: 'Oui : il a 30 jours, il les prend comme il veut' },
        { v: 'non1', lib: 'Non : un congé ne dépasse jamais 1 semaine' }],
      juste: 'non24',
      retour: '24 jours ouvrables au plus d’un coup ; la loi prévoit des exceptions (éloignement, enfant ou proche à charge).' },
    { id: 'essai-cdd', type: 'ouverture', de: 'helene', doc: 'droit-116', rubrique: 'droit', variante: varianteEssai,
      enonce: 'Un agent de tri saisonnier est embauché en CDD de 4 semaines. Sa période d’essai peut durer au plus…',
      choix: [{ v: 'jours', lib: '4 jours' }, { v: 'mois', lib: '1 mois' }, { v: 'aucune', lib: 'Il n’y a pas de période d’essai en CDD' }],
      juste: 'jours',
      retour: 'Un jour par semaine de contrat : 4 semaines, 4 jours au plus. Et jamais plus de 2 semaines pour un contrat de 6 mois ou moins.' },
    // ── au fil du travail (non notées)
    { id: 'pourquoi-refus', type: 'fil', de: 'helene', reflexion: true, quand: (db) => refuseDe(db) !== undefined,
      selon: (db) => {
        const k = refuseDe(db);
        if (k === undefined) return { enonce: 'Tu refuses un congé. Pourquoi ?' };
        const jeu = jeuDeBase(db);
        return { enonce: `Tu refuses le congé de ${jeu.equipe[jeu.demandes[k].agent].nom}. Pourquoi ?` };
      },
      enonce: 'Tu refuses un congé. Pourquoi ?',
      choix: [{ v: 'pic', lib: 'Une des nuits demandées est une nuit de pic' },
        { v: 'caces', lib: 'Cet agent n’a pas le CACES 1' },
        { v: 'passe', lib: 'Cet agent a déjà eu des congés cette année' },
        { v: 'envie', lib: 'Je n’ai pas envie qu’il parte' }],
      retour: 'Un refus s’appuie sur une règle écrite, jamais sur une envie : ici, les nuits de pic, où toute l’équipe est nécessaire.' },
    { id: 'quel-contrat', type: 'fil', de: 'helene', reflexion: true, quand: apresGeste(`fiche:${FICHES.recrutement}:envoyer`),
      enonce: 'Les renforts travaillent 6 nuits de pic, réparties sur deux semaines. Quel contrat est le plus simple pour le hub ?',
      choix: [{ v: 'cdd', lib: 'Un CDD saisonnier, qui s’arrête à la fin du pic' },
        { v: 'cdi', lib: 'Un CDI, sans date de fin' },
        { v: 'stage', lib: 'Un stage' }],
      retour: 'Le besoin est court et revient chaque année à la même période : le CDD saisonnier s’arrête tout seul à sa date de fin.' },
    { id: 'qui-paie-interim', type: 'fil', de: 'helene', reflexion: true, quand: apresGeste(`fiche:${FICHES.recrutement}:envoyer`),
      enonce: 'Il existe une autre solution : l’intérim. Un intérimaire travaille pour Mondial Relay, mais c’est une agence d’intérim qui l’embauche. Qui le paie ?',
      choix: [{ v: 'agence', lib: 'L’agence d’intérim' },
        { v: 'mr', lib: 'Mondial Relay directement' },
        { v: 'france-travail', lib: 'France Travail' }],
      retour: 'L’agence d’intérim est l’employeur de l’intérimaire et le paie. Mondial Relay paie l’agence : trois personnes sont en jeu (l’intérimaire, l’agence, l’entreprise).' },
  ],
};
