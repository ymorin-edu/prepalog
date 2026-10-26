// Les questions d'ENT-11.4 — Mondial Relay, évaluation « le samedi du pic » (brief `docs/briefs/ENT-11.4-mondial-relay-evaluation-planning.md`
// §4 et §4 bis ; propositions acceptées par Tristan le 26/10/2026, `docs/briefs/mondial-relay/A-TRANCHER.md`). Modifier ce fichier suffit :
// voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personne CONSTRUITE : Samia, responsable d'exploitation.
//
// ÉVALUATION. AVANT DE COMMENCER est NOTÉ (`part: 4`) : 8 questions, l'élève en reçoit 4 (2 de préparation sur 4, 2 de droit sur 4) ; aucune aide,
// aucun mot cliquable, « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses),
// plancher 0 ; « Réponse enregistrée. » sans correction. Les trois questions clés (`cle: true`) d'ENT-6.8 sont reprises (même sens, autre décor) :
// `qui-decide-camions`, `repos-11h`, `affectation-sexe`. ENT-5.7 (Smoby) n'a pas de fichier de questions : rien à en reprendre.
// Valeurs tirées (`variante`) : `repos-11h` (fin de service entre 18:15 et 21:45) et `conduite-9h` (toujours plus de 10 h au total).
//
// AU FIL (3, NON NOTÉES — `reflexion: true`, « Merci, je note », lues par l'enseignant : la somme des poids du brief laisse 4 points aux questions,
// tous pris par « Avant de commencer ») : `repos-tardif` (le chauffeur au repos, nom et heure de SON jeu), `pause-t5` (la conduite de T5 de SON jeu),
// `arret-maladie` (éco-droit si l'imprévu tiré est un chauffeur malade ; sinon une question sur le repos).
// Le texte de l'arrêt maladie n'est PAS cité : les textes (Code de la sécurité sociale, art. R321-2 ; décret du 28 juin 2025 sur la transmission
// des avis d'arrêt de travail) n'ont pas pu être relus mot pour mot. À relever par Tristan ou Cowork avant d'en faire une question notée.

import { apresGeste, apresPlanning } from '../../core/declencheurs.js';
import { jeuDeBase, IDS_CHAUFFEURS, PL, duree, hm, mm } from '../mondial-relay-ent114-donnees.js';

export const PERSONNES = { samia: { nom: 'Samia', role: 'responsable d’exploitation de l’agence', registre: 'tu' } };
const plan = (db) => ((db && db.plannings) || {})[PL] || {};

// ── textes calculés sur le jeu de l'élève (une seule fois, à l'arrivée de la question)
const selonRepos = (db) => {
  const j = jeuDeBase(db), id = IDS_CHAUFFEURS.find((c) => j.roles[c] === 'repos'), nom = j.noms[id], fin = j.finHier[id];
  return {
    enonce: `${nom} a fini son service hier à ${fin}. Pourquoi ne peut-il pas partir à 6 h ?`,
    libs: { repos: `Il lui faut 11 h de repos depuis sa fin de service : au plus tôt ${hm(mm(fin) + 660 - 1440)}`, permis: 'Il n’a pas le bon permis',
      panne: 'Son camion est en panne', samedi: 'Il ne travaille pas le samedi' },
  };
};
const selonPauseT5 = (db) => {
  const j = jeuDeBase(db);
  return { enonce: `Tu as posé T5 Est : ${duree(j.t5)} de conduite. Son chauffeur doit-il faire une pause ?` };
};
const selonMaladie = (db) => {
  const j = jeuDeBase(db);
  if (j.alea === 'malade') {
    return { enonce: `${j.noms[j.cible]} prévient Samia à 5 h 30 qu’il est malade. Que doit-il faire pour son arrêt de travail ?`,
      libs: { a: 'Faire établir un arrêt de travail par un médecin et le faire parvenir dans les 48 heures', b: 'Rien : prévenir Samia suffit',
        c: 'Écrire une lettre de démission' } };
  }
  return { enonce: 'Un chauffeur a fini son service hier à 20:00. À quelle heure peut-il reprendre au plus tôt, avec 11 h de repos ?',
    libs: { a: '07:00', b: '05:00', c: '04:00' } };
};

const REPOS_FIN = ['18:15', '18:30', '18:45', '19:00', '19:15', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45'];
const varianteRepos = (h) => {
  const f = h.choisir(REPOS_FIN), m = mm(f);
  return {
    enonce: `Un chauffeur a fini son service hier à ${f}. Avec 11 h de repos, à quelle heure peut-il reprendre au plus tôt ?`,
    libs: { onze: hm(m + 660), neuf: hm(m + 540), huit: hm(m + 480) },
    retour: `${f} + 11 h = ${hm(m + 660)}. Le repos se compte depuis la fin du service, pas depuis minuit.`,
  };
};
const varianteConduite = (h) => {
  const a = h.choisir([240, 255, 270]), b = h.choisir([375, 390]);
  return {
    enonce: `Un chauffeur conduit ${duree(a)} le matin et ${duree(b)} l’après-midi, avec sa pause entre les deux. Respecte-t-il la durée de conduite de la journée ?`,
    libs: { non: 'Non : 9 h de conduite au plus par jour (10 h deux fois par semaine au plus)', pause: 'Oui : la pause remet le compteur à zéro',
      nuit: 'Oui, tant qu’il ne conduit pas la nuit' },
    retour: `${duree(a)} + ${duree(b)} = ${duree(a + b)} : c’est plus de 9 h (et même plus de 10 h). La pause coupe la conduite, elle ne remet pas la journée à zéro.`,
  };
};

export const QUESTIONS = {
  id: 'mondial-relay-evaluation-planning',
  part: 4,
  personnes: PERSONNES,
  ouverture: { id: 'avant-de-commencer', de: 'samia', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce samedi, c’est le pic : je te confie le planning des tournées. Avant de commencer, réponds à mes questions, sans aide.',
    calculette: true,
    documents: ['tournees-114', 'moyens-114', 'regles-114', 'droit-114'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['qui-decide-camions', 'jours-tournees', 'bulle-camion', 'permis-porteur', 'repos-11h', 'conduite-9h', 'pause-15-30', 'affectation-sexe'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'qui-decide-camions', type: 'ouverture', de: 'samia', doc: 'regles-114', rubrique: 'preparation', cle: true,
      enonce: 'Qui décide des tournées et des camions des chauffeurs de l’agence ?',
      choix: [{ v: 'samia', lib: 'Samia, responsable d’exploitation' }, { v: 'romain', lib: 'Romain, chef d’équipe du tri' }, { v: 'claire', lib: 'Claire, responsable du service client' },
        { v: 'chacun', lib: 'Chaque chauffeur' }],
      juste: 'samia',
      retour: 'C’est moi qui organise les tournées ; ce samedi, tu prépares le planning avec moi.' },
    { id: 'jours-tournees', type: 'ouverture', de: 'samia', doc: 'regles-114', rubrique: 'preparation',
      enonce: 'Quels jours les Points Relais sont-ils livrés ?',
      choix: [{ v: 'mar-sam', lib: 'Du mardi au samedi' }, { v: 'lun-ven', lib: 'Du lundi au vendredi' }, { v: 'tous', lib: 'Tous les jours, dimanche compris' }],
      juste: 'mar-sam',
      retour: 'Les tournées vont du mardi au samedi, pendant les heures d’ouverture des Points Relais : jamais le dimanche, le lundi ni les jours fériés.' },
    { id: 'bulle-camion', type: 'ouverture', de: 'samia', doc: 'regles-114', rubrique: 'preparation',
      enonce: 'Dans le planning, une ligne est un chauffeur. Que représente la bulle qui s’ouvre quand tu poses une tournée sur sa ligne ?',
      choix: [{ v: 'camion', lib: 'Le camion qu’il conduit' }, { v: 'pause', lib: 'Sa pause' }, { v: 'client', lib: 'Le client' }],
      juste: 'camion',
      retour: 'Un chauffeur, un camion, une tournée.' },
    { id: 'permis-porteur', type: 'ouverture', de: 'samia', doc: 'moyens-114', rubrique: 'preparation',
      enonce: 'Quel permis faut-il pour conduire un porteur de 12 t ?',
      choix: [{ v: 'c', lib: 'Le permis C' }, { v: 'b', lib: 'Le permis B' }, { v: 'aucun', lib: 'Aucun permis particulier' }],
      juste: 'c',
      retour: 'Le permis C pour un camion de plus de 3,5 t ; le permis B suffit pour un fourgon de 3,5 t.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'repos-11h', type: 'ouverture', de: 'samia', doc: 'droit-114', rubrique: 'droit', cle: true, variante: varianteRepos,
      enonce: 'Un chauffeur a fini son service hier à 20:00. Avec 11 h de repos, à quelle heure peut-il reprendre au plus tôt ?',
      choix: [{ v: 'onze', lib: '07:00' }, { v: 'neuf', lib: '05:00' }, { v: 'huit', lib: '04:00' }],
      juste: 'onze',
      retour: '20:00 + 11 h = 07:00. Le repos se compte depuis la fin du service, pas depuis minuit.' },
    { id: 'conduite-9h', type: 'ouverture', de: 'samia', doc: 'droit-114', rubrique: 'droit', variante: varianteConduite,
      enonce: 'Un chauffeur conduit 4 h 30 le matin et 6 h 30 l’après-midi, avec sa pause entre les deux. Respecte-t-il la durée de conduite de la journée ?',
      choix: [{ v: 'non', lib: 'Non : 9 h de conduite au plus par jour (10 h deux fois par semaine au plus)' },
        { v: 'pause', lib: 'Oui : la pause remet le compteur à zéro' }, { v: 'nuit', lib: 'Oui, tant qu’il ne conduit pas la nuit' }],
      juste: 'non',
      retour: '4 h 30 + 6 h 30 = 11 h : c’est plus de 9 h. La pause coupe la conduite, elle ne remet pas la journée à zéro.' },
    { id: 'pause-15-30', type: 'ouverture', de: 'samia', doc: 'droit-114', rubrique: 'droit',
      enonce: 'Pendant ses 4 h 30 de conduite, un chauffeur fait une pause de 15 min, puis une de 30 min. Est-ce permis ?',
      choix: [{ v: 'oui', lib: 'Oui : la pause de 45 min peut se faire en 15 min puis 30 min' },
        { v: 'bloc', lib: 'Non, 45 min d’un seul bloc' }, { v: 'dix', lib: 'Non, deux pauses de 10 min suffisent' }],
      juste: 'oui',
      retour: 'Dans cet ordre-là : 15 min d’abord, 30 min ensuite.' },
    { id: 'affectation-sexe', type: 'ouverture', de: 'samia', doc: 'droit-114', rubrique: 'droit', cle: true,
      enonce: 'Un responsable refuse de mettre une chauffeuse sur la tournée Sud « parce que c’est une femme ». Est-ce permis ?',
      choix: [{ v: 'non', lib: 'Non : c’est une discrimination en raison du sexe, interdite aussi pour l’affectation' },
        { v: 'decide', lib: 'Oui : c’est le responsable qui décide des tournées' }, { v: 'longue', lib: 'Oui, si la tournée est longue' }],
      juste: 'non',
      retour: 'Je décide des tournées, mais sur des raisons de travail : le permis, le camion, le repos.' },
    // ── au fil du travail (non notées)
    { id: 'repos-tardif', type: 'fil', de: 'samia', quand: apresGeste(`planning:${PL}:poser`), reflexion: true, apres: 'bilan', selon: selonRepos,
      enonce: 'Un chauffeur a fini son service hier soir tard. Pourquoi ne peut-il pas partir à 6 h ?',
      choix: [{ v: 'repos', lib: 'Il lui faut 11 h de repos depuis sa fin de service' }, { v: 'permis', lib: 'Il n’a pas le bon permis' },
        { v: 'panne', lib: 'Son camion est en panne' }, { v: 'samedi', lib: 'Il ne travaille pas le samedi' }],
      retour: 'Les 11 h de repos se comptent depuis la fin de service d’hier : il ne peut pas partir avant.' },
    { id: 'pause-t5', type: 'fil', de: 'samia',
      quand: (db) => { const p = (plan(db).place || {}).t5; return !!(p && p.s != null); }, reflexion: true, apres: 'bilan', selon: selonPauseT5,
      enonce: 'Tu as posé T5 Est. Son chauffeur doit-il faire une pause ?',
      choix: [{ v: 'oui', lib: 'Oui : après 4 h 30 de conduite, une pause de 45 min' }, { v: 'non', lib: 'Non : il peut rouler jusqu’au bout' },
        { v: 'courte', lib: 'Oui, mais 10 minutes suffisent' }],
      retour: 'Après 4 h 30 de conduite, une pause d’au moins 45 minutes (en 15 puis 30 si besoin). Avec moins de 4 h 30, pas de pause obligatoire sur la tournée.' },
    { id: 'arret-maladie', type: 'fil', de: 'samia', quand: apresPlanning(PL), reflexion: true, apres: 'bilan', selon: selonMaladie,
      enonce: 'Un chauffeur malade prévient à 5 h 30. Que doit-il faire pour son arrêt de travail ?',
      choix: [{ v: 'a', lib: 'Faire établir un arrêt de travail par un médecin et le faire parvenir dans les 48 heures' },
        { v: 'b', lib: 'Rien : prévenir suffit' }, { v: 'c', lib: 'Écrire une lettre de démission' }],
      retour: 'Il prévient tout de suite, puis fait établir son arrêt de travail et le transmet dans les 48 heures (textes à relever avant toute notation).' },
  ],
};
