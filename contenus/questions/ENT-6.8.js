// Les questions d'ENT-6.8 — France Boissons, chauffeurs et camions du vendredi (brief `docs/briefs/ENT-6.8-france-boissons-planning.md`
// §4 bis et §4 ter ; propositions de Cowork `docs/briefs/france-boissons/PROPOSITIONS-questions-au-fil.md` et `BANQUE-avant-de-commencer.md`,
// toutes gardées par Tristan le 10/10/2026 ; question du véhicule loué ajoutée par Tristan le 12/10/2026). Modifier ce fichier suffit :
// voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES.
//
// AU FIL (5, dont 2 notées : `part: 3`, 1,5 point chacune) :
// - `repos-sebastien` (NOTÉE, 561/2006 art. 4 g) : point d'étape de Karim après le 1er envoi, avant la reprise ; le texte cite l'heure
//   de départ de Sébastien dans le planning ENVOYÉ (`selon`, figé à l'arrivée) ; corrigée tout de suite (le 1er envoi est figé).
// - `temps-transporteur` (NOTÉE, 561/2006 art. 2) : point d'étape de Karim après le 2e envoi, avant la confirmation au loueur.
// - `que-verifies-tu` : Karim, au premier geste sur le planning (cite la tournée posée), réflexion corrigée au bilan.
// - `pourquoi-vehicule` : Karim, à l'envoi de la confirmation au loueur (cite le véhicule demandé), réflexion corrigée au bilan (le retour
//   parle de compte propre : il soufflerait la fiche « Documents à bord », qui vient juste après).
// - `qui-transporte-mantes` : Karim, au classement de la ligne Mantes de la fiche (cite ce que l'élève a coché), réflexion corrigée au bilan.
//
// AVANT DE COMMENCER : une banque de 8 questions NON notées, 4 tirées par élève (2 de préparation, 2 de droit), la calculette du site.
// Valeurs tirées (`variante`) : `repos-11h` (fin de service de 18:15 à 21:45, jamais 17:00, 19:30 ni 22:00, les chauffeurs de la séance),
// `conduite-9h` (4 h à 4 h 30 le matin, 6 h 15 ou 6 h 30 l'après-midi : toujours plus de 10 h). Écartées par Cowork (elles donneraient un
// jalon) : le départ au plus tard de Rouen, l'autonomie face aux km, « louer ou sous-traiter ? », lettre de voiture et contrat de location.
// Textes de loi dans le document « Le droit » de la séance (relus le 12/10/2026).
//
// Les noms des chauffeurs et des tournées sont recopiés ici (pas d'import du contenu de la séance, qui importe ce fichier).

import { apresGeste, apresPlanning } from '../../core/declencheurs.js';
import { EQUIPE } from '../france-boissons.js';

const PL = 'fb-chauffeurs', MSG = 'confirmation-loueur';
const NOMS = { lucas: 'Lucas', amandine: 'Amandine', julien: 'Julien', sebastien: 'Sébastien', fatou: 'Fatou', tr: 'le transporteur' };
const TOURNEES = { cote: 'la côte', rouen: 'Rouen', versailles: 'Versailles', mantes: 'Mantes', evreux: 'Évreux' };
const VEHICULES = ['un porteur 16 t thermique, sans chauffeur', 'un porteur électrique 16 t, sans chauffeur', 'un fourgon 3,5 t', 'un porteur 16 t avec son chauffeur'];
const pad = (n) => String(n).padStart(2, '0');
const hm = (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const duree = (m) => `${Math.floor(m / 60)} h${m % 60 ? ` ${pad(m % 60)}` : ''}`;
const plan = (db) => ((db && db.plannings) || {})[PL] || {};

// ── Sébastien (fin de service hier 22:00) dans le planning ENVOYÉ : l'heure de son premier départ (créneaux depuis 05:00).
const departSebastien = (db) => {
  const L = Object.values(((plan(db).v1 || {}).place) || {}).filter((p) => p && p.r === 'sebastien' && p.s != null).map((p) => 300 + p.s * 15);
  return L.length ? Math.min(...L) : null;
};
const selonRepos = (db) => {
  const d = departSebastien(db);
  const dep = d == null ? 540 : d, repos = dep + 1440 - 22 * 60;
  return {
    enonce: d == null
      ? 'Sébastien a fini son service hier à 22:00. Ton planning ne lui donne pas de tournée. S’il partait à 09:00, combien d’heures de repos aurait-il eues ?'
      : `Sébastien a fini son service hier à 22:00. Ton planning le fait partir à ${hm(dep)}. Combien d’heures de repos a-t-il eues ?`,
    libs: { calc: duree(repos), plus: duree(repos + 60), moins: duree(repos - 60) },
    retour: `De 22:00 hier à ${hm(dep)} : ${duree(repos)} de repos. Il en faut 11 au moins (règlement européen) : `
      + `${repos >= 660 ? 'c’est respecté.' : 'il part trop tôt.'} Le repos se compte depuis la fin du service, pas depuis minuit.`,
  };
};

// ── La première tournée posée (le premier geste : une seule carte sur le planning).
const selonPose = (db) => {
  const e = Object.entries(plan(db).place || {}).find(([, p]) => p && p.s != null);
  return e && NOMS[e[1].r] && TOURNEES[e[0]]
    ? { enonce: `Tu poses ${NOMS[e[1].r]} sur ${TOURNEES[e[0]]}. Que vérifies-tu d’abord ?` }
    : { enonce: 'Tu poses une tournée sur le planning. Que vérifies-tu d’abord ?' };
};

// ── Le véhicule demandé au loueur (le dernier envoi de la confirmation).
const dernierEnvoi = (db) => ((db && db.mails) || []).filter((m) => m.folder === 'out' && m.phrases && m.phrases.id === MSG)
  .sort((a, b) => (a.ts - b.ts) || (a.id - b.id)).pop() || null;
const selonVehicule = (db) => {
  const e = dernierEnvoi(db), v = e && e.phrases && e.phrases.choix ? VEHICULES[e.phrases.choix.vehicule] : null;
  return { enonce: v ? `Tu as demandé au loueur ${v}. Pourquoi ce véhicule-là ?` : 'Tu as choisi le véhicule à louer. Pourquoi celui-là ?' };
};

// ── Ce que l'élève a coché pour Mantes sur la fiche (au moment du geste).
const COL = { fb: 'transportée par France Boissons', lettre: 'lettre de voiture', contrat: 'contrat de location' };
const selonMantes = (db) => {
  const L = (((((db && db.fiches) || {}).documents || {}).valeurs || {}).bord || {}).mantes || {};
  const dits = Object.keys(COL).filter((c) => L[c] != null).map((c) => `${COL[c]} : ${L[c] ? 'oui' : 'non'}`);
  return { enonce: dits.length ? `Pour Mantes, tu as répondu « ${dits.join(' ; ')} ». Qui transporte la marchandise de Mantes ?`
    : 'Pour Mantes, qui transporte la marchandise ?' };
};

const REPOS_FIN = ['18:15', '18:30', '18:45', '19:00', '19:15', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45'];
const varianteRepos = (h) => {
  const f = h.choisir(REPOS_FIN), [hh, mm] = f.split(':').map(Number), m = hh * 60 + mm;
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
  id: 'france-boissons-planning',
  part: 3,
  personnes: { karim: EQUIPE.karim },
  ouverture: { id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, je te confie 5 tournées à planifier. Avant de commencer, lis les documents à gauche et réponds à mes questions.',
    calculette: true,
    documents: ['tournees', 'moyens', 'regles', 'droit', 'annuaire'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['tournees-haute-saison', 'qui-decide-camions', 'bulle-camion', 'sous-traiter',
      'repos-11h', 'conduite-9h', 'pause-15-30', 'affectation-sexe'] },
  etapes: [
    { id: 'avant-reprise', de: 'karim', apres: apresPlanning(PL),
      ferme: 'ecran:planning', titre: 'Point d’étape avant de reprendre le planning', continuer: 'reprendre le planning',
      situation: 'J’ai bien ton planning. Une panne vient de tout changer (mon message est dans la Messagerie). Avant que tu le reprennes, une question sur celui que tu m’as envoyé.',
      questions: ['repos-sebastien'] },
    { id: 'avant-loueur', de: 'karim', apres: apresPlanning(PL, 2),
      ferme: 'repondre:loueur', titre: 'Point d’étape avant de confirmer la location', continuer: 'répondre au loueur',
      situation: 'Merci pour le planning repris. Avant que tu confirmes la location au loueur, une question sur le transporteur.',
      questions: ['temps-transporteur'] },
  ],
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'tournees-haute-saison', type: 'ouverture', de: 'karim', doc: 'tournees', rubrique: 'preparation',
      enonce: 'En haute saison, combien de tournées partent chaque jour de Buchelay ? (C’était dans la vidéo de la plateforme.)',
      aide: 'Repense à la présentation de la plateforme : en basse saison 18 tournées ; en haute saison, beaucoup plus.',
      choix: [{ v: '30', lib: '30' }, { v: '18', lib: '18' }, { v: '150', lib: '150' }],
      juste: '30',
      retour: 'Jusqu’à 30 tournées par jour en haute saison. Ce matin, j’en confie 5 à toi.' },
    { id: 'qui-decide-camions', type: 'ouverture', de: 'karim', doc: 'annuaire', rubrique: 'preparation', cle: true,
      enonce: 'Qui décide des tournées et des camions des chauffeurs ?',
      aide: 'Regarde l’annuaire : qui est responsable d’exploitation transport ?',
      choix: [{ v: 'karim', lib: 'Karim, responsable d’exploitation' }, { v: 'nadia', lib: 'Nadia' }, { v: 'ines', lib: 'Inès' },
        { v: 'chacun', lib: 'Chaque chauffeur' }],
      juste: 'karim',
      retour: 'C’est moi qui organise les tournées ; ce matin, tu prépares le planning avec moi.' },
    { id: 'bulle-camion', type: 'ouverture', de: 'karim', doc: 'regles', rubrique: 'preparation',
      enonce: 'Dans le planning de ce matin, une ligne est un chauffeur. Que représente la bulle qui s’ouvre sur sa tournée ?',
      aide: 'Lis le message de Karim : un chauffeur et un camion pour chaque tournée.',
      choix: [{ v: 'camion', lib: 'Le camion qu’il conduit' }, { v: 'pause', lib: 'Sa pause' }, { v: 'client', lib: 'Le client' }],
      juste: 'camion',
      retour: 'Un chauffeur, un camion, une tournée.' },
    { id: 'sous-traiter', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'preparation',
      enonce: '« Sous-traiter » une tournée, c’est…',
      aide: 'Le mot [[sous-traiter]] est dans le lexique.',
      choix: [{ v: 'transporteur', lib: 'La confier à un transporteur, qui vient avec son chauffeur et son camion' },
        { v: 'louer', lib: 'Louer un camion sans chauffeur' }, { v: 'annuler', lib: 'L’annuler' }],
      juste: 'transporteur',
      retour: 'Louer ou sous-traiter : ce n’est pas la même chose.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'repos-11h', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit', cle: true, variante: varianteRepos,
      enonce: 'Un chauffeur a fini son service hier à 20:00. Avec 11 h de repos, à quelle heure peut-il reprendre au plus tôt ?',
      aide: 'Lis l’article 4 g du règlement dans « Le droit » : le repos journalier normal dure au moins 11 h. La calculette du site est là pour toi.',
      choix: [{ v: 'onze', lib: '07:00' }, { v: 'neuf', lib: '05:00' }, { v: 'huit', lib: '04:00' }],
      juste: 'onze',
      retour: '20:00 + 11 h = 07:00. Le repos se compte depuis la fin du service, pas depuis minuit.' },
    { id: 'conduite-9h', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit', variante: varianteConduite,
      enonce: 'Un chauffeur conduit 4 h 30 le matin et 6 h 30 l’après-midi, avec sa pause entre les deux. Respecte-t-il la durée de conduite de la journée ?',
      aide: 'Lis l’article 6 du règlement dans « Le droit » : combien d’heures de conduite par jour ?',
      choix: [{ v: 'non', lib: 'Non : 9 h de conduite au plus par jour (10 h deux fois par semaine au plus)' },
        { v: 'pause', lib: 'Oui : la pause remet le compteur à zéro' }, { v: 'nuit', lib: 'Oui, tant qu’il ne conduit pas la nuit' }],
      juste: 'non',
      retour: '4 h 30 + 6 h 30 = 11 h : c’est plus de 9 h (et même plus de 10 h). La pause coupe la conduite, elle ne remet pas la journée à zéro.' },
    { id: 'pause-15-30', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit',
      enonce: 'Pendant ses 4 h 30 de conduite, un chauffeur fait une pause de 15 min, puis une de 30 min. Est-ce permis ?',
      aide: 'Lis l’article 7 du règlement dans « Le droit » : la pause de 45 min peut-elle se couper ?',
      choix: [{ v: 'oui', lib: 'Oui : la pause de 45 min peut se faire en 15 min puis 30 min' },
        { v: 'bloc', lib: 'Non, 45 min d’un seul bloc' }, { v: 'dix', lib: 'Non, deux pauses de 10 min suffisent' }],
      juste: 'oui',
      retour: 'Dans cet ordre-là : 15 min d’abord, 30 min ensuite.' },
    { id: 'affectation-sexe', type: 'ouverture', de: 'karim', doc: 'droit', rubrique: 'droit', cle: true,
      enonce: 'Un responsable refuse de mettre une chauffeuse sur la tournée de la côte « parce que c’est une femme ». Est-ce permis ?',
      aide: 'Lis l’article L1132-1 du Code du travail dans « Le droit » : il parle de l’affectation.',
      choix: [{ v: 'non', lib: 'Non : c’est une discrimination en raison du sexe, interdite aussi pour l’affectation' },
        { v: 'decide', lib: 'Oui : c’est le responsable qui décide des tournées' }, { v: 'longue', lib: 'Oui, si la tournée est longue' }],
      juste: 'non',
      retour: 'Je décide des tournées, mais sur des raisons de travail : le permis, le camion, le repos.' },
    // ── points d'étape
    { id: 'repos-sebastien', type: 'transition', de: 'karim', selon: selonRepos, melanger: false,
      enonce: 'Sébastien a fini son service hier à 22:00. Ton planning le fait partir à {son heure}. Combien d’heures de repos a-t-il eues ?',
      choix: [{ v: 'moins', lib: '10 h' }, { v: 'calc', lib: '11 h' }, { v: 'plus', lib: '12 h' }],
      juste: 'calc', groupe: 'Question de Karim : le repos de Sébastien',
      retour: 'De 22:00 hier à son départ : les heures de repos. Il en faut 11 au moins (règlement européen). Le repos se compte depuis la fin du service, pas depuis minuit.' },
    { id: 'temps-transporteur', type: 'transition', de: 'karim',
      enonce: 'Le chauffeur du transporteur conduit un porteur de 16 t, lui aussi. Doit-il respecter les mêmes temps de conduite que nos chauffeurs ?',
      choix: [{ v: 'oui', lib: 'Oui : la règle vaut pour tous les camions de plus de 3,5 t' },
        { v: 'compte', lib: 'Non, il travaille pour une autre entreprise' }, { v: 'patron', lib: 'Non, c’est son patron qui décide' }],
      juste: 'oui', groupe: 'Question de Karim : les temps de conduite du transporteur',
      retour: 'Le règlement européen vaut pour tout transport de marchandises dans un camion de plus de 3,5 t (article 2), quelle que soit l’entreprise.' },
    // ── au fil du travail
    { id: 'que-verifies-tu', type: 'fil', de: 'karim', quand: apresGeste('planning:fb-chauffeurs:poser'), reflexion: true, apres: 'bilan', selon: selonPose,
      enonce: 'Tu poses une tournée sur le planning. Que vérifies-tu d’abord ?',
      choix: [{ v: 'permis', lib: 'Son permis' }, { v: 'repos', lib: 'Son repos depuis hier' }, { v: 'autonomie', lib: 'L’autonomie du camion' },
        { v: 'rien', lib: 'Rien de spécial' }],
      retour: 'Les trois premiers comptent : le permis du chauffeur, son repos depuis hier soir, et un camion qui peut faire la tournée (type, autonomie). On les vérifie à chaque tournée.' },
    { id: 'pourquoi-vehicule', type: 'fil', de: 'karim', quand: (db) => !!dernierEnvoi(db), reflexion: true, apres: 'bilan', selon: selonVehicule,
      enonce: 'Tu as choisi le véhicule à louer. Pourquoi celui-là ?',
      choix: [{ v: 'recharge', lib: 'Pas d’électrique : la borne n° 2 est en panne, on ne pourrait pas le recharger' },
        { v: 'taille', lib: 'Mantes demande un porteur : un fourgon est trop petit' },
        { v: 'chauffeur', lib: 'Sans chauffeur : c’est notre chauffeur qui conduit' },
        { v: 'prix', lib: 'C’est le moins cher' }],
      retour: 'Un porteur 16 t thermique, sans chauffeur : un électrique ne se rechargerait pas (borne en panne), un fourgon est trop petit pour Mantes, '
        + 'et avec un chauffeur du loueur, ce ne serait plus nous qui transportons. Louer sans chauffeur, c’est rester en compte propre.' },
    { id: 'qui-transporte-mantes', type: 'fil', de: 'karim', quand: apresGeste('fiche:documents:bord:mantes'), reflexion: true, apres: 'bilan', selon: selonMantes,
      enonce: 'Pour Mantes, qui transporte la marchandise ?',
      choix: [{ v: 'nous', lib: 'Nos chauffeurs, dans un camion loué' }, { v: 'loueur', lib: 'Le loueur' }, { v: 'transporteur', lib: 'Un transporteur' }],
      retour: 'Nos chauffeurs, dans un camion loué sans chauffeur : c’est France Boissons qui transporte, en compte propre. Le loueur prête le camion, il ne transporte rien : '
        + 'pas de lettre de voiture, mais le contrat de location à bord, avec le bon de livraison.' },
  ],
};
