// ENT-6.3 — France Boissons, « les congés d'été » : les données de la séance (brief `docs/briefs/ENT-6.3-france-boissons-conges.md`,
// règles postérieures de `docs/briefs/FRANCE-BOISSONS-refonte.md` §0, rapport du lot 0 `docs/briefs/france-boissons/RAPPORT-6.3-lot0.md`).
// Univers commun : `contenus/france-boissons.js`. Activité : `activites/france-boissons-conges.js`. Corrigé : `contenus/corriges/ENT-6.3.js`.
//
// L'élève, en renfort auprès d'Inès (mardi 15 juin 2027, après-midi) :
//   1. place les congés d'été des 7 chauffeurs-livreurs de Karim sur 9 semaines (vue Planning, échelle en semaines) et l'envoie ;
//   2. l'imprévu : Kevin part (ligne et carte retirées par l'aléa, `alea.retraits`), un saisonnier arrive le 12 juillet ;
//      il reprend le planning et le renvoie (renvoyé sans changement = faux, `repriseIdentique`) ;
//   3. Lucas, dont le congé saute deux fois, lui écrit : il répond par phrases (au TU, collègue) ; Lucas répond, déçu, en
//      reprenant ce que l'élève a écrit, et l'élève choisit sa réponse (non notée) ;
//   4. Karim demande l'annonce du chauffeur saisonnier (fiche fermée tant que Lucas n'a pas sa réponse) ; il en accuse réception.
//
// LE SENS DE « ON DÉCALE LE MOINS POSSIBLE » (décision de Tristan, 10/10/2026) : le NOMBRE MINIMAL de congés décalés, plus la
// priorité à la demande la plus ancienne. C'est la seule lecture qui donne une solution unique (calage du lot 0 : Lucas du 5 au
// 16 juillet au 1er envoi, du 23 août au 3 septembre après l'imprévu). Le minimum est CALCULÉ à la première lecture (essai de 0,
// 1, 2… congés déplacés), jamais écrit en dur. Les deux critères sont reliés à l'effectif (jamais vrais par vacuité).
// D3141-6 (« un mois avant le départ ») : laissé tel quel (décision de Tristan, 10/10/2026), aucune phrase ajoutée.
//
// Vérifié (brief §2, 05/10/2026) : France Boissons publie des offres « SAISON – Chauffeur livreur VL » en CDD ; permis B pour un
// véhicule léger ; mentions interdites dans une offre (Code du travail). Textes de loi relus le 10/10/2026 sur code.travail.gouv.fr
// (reprise de Légifrance). Construit : l'équipe, les demandes, les besoins, la règle de priorité, le départ de Kevin, les dates du CDD.

import { apresFiche, apresPlanning } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { etapesPlanning } from '../core/types/planning.js';
import { QUESTIONS } from './questions/ENT-6.3.js';
import { EQUIPE, LEXIQUE as LEXIQUE_FB, mailDe, heureScenario, DOC_ORGANIGRAMME, DOC_ANNUAIRE, STYLE_DOCUMENTS as STYLE_FB } from './france-boissons.js';

export const ID = 'france-boissons-conges';
export const PL = 'fb-conges';
export const MSG = 'message-lucas';
export const REPONSE = 'reponse-lucas';
export const ANNONCE = 'annonce';

// Mardi 15 juin 2027, après-midi (calendrier de S2 : 6.2 le matin, 6.3 l'après-midi).
export const SCENARIO = { date: '2027-06-15' };

// La fiche envoyée, lue comme `ficheEnvoyee` (core/types/fiche.js) sans importer ce module (il tire `core/ui.js`, et le corrigé
// lit ce fichier hors de l'écran).
function ficheEnvoyee(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}

// ─────────────────────────────────────────────────────────────── les semaines (le lundi de chacune)

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const PREMIER_LUNDI = Date.UTC(2027, 6, 5);               // S1 = semaine du lundi 5 juillet 2027
const JOUR = 86400000;
export const NB_SEMAINES = 9;                             // 8 semaines du pic + la semaine du 30 août (après le pic)
const lundi = (s) => new Date(PREMIER_LUNDI + 7 * s * JOUR);
const vendredi = (s) => new Date(PREMIER_LUNDI + (7 * s + 4) * JOUR);
const jm = (d) => `${d.getUTCDate()} ${MOIS[d.getUTCMonth()]}`;
// « du 12 au 23 juillet », « du 23 août au 3 septembre » : du lundi de la semaine `s` au vendredi de la semaine `s + L - 1`.
export function periode(s, L) {
  const a = lundi(s), b = vendredi(s + L - 1);
  return a.getUTCMonth() === b.getUTCMonth() ? `du ${a.getUTCDate()} au ${jm(b)}` : `du ${jm(a)} au ${jm(b)}`;
}
export const semaineDu = (s) => `la semaine du ${jm(lundi(s))}`;
export const JOURS_GRILLE = Array.from({ length: NB_SEMAINES }, (_, s) => `S${s + 1} · ${lundi(s).getUTCDate()} ${COURT[lundi(s).getUTCMonth()]}`);
const dateDemande = (iso) => { const [, m, j] = iso.split('-').map(Number); return `${j === 1 ? '1er' : j} ${MOIS[m - 1]}`; };

// ─────────────────────────────────────────────────────────────── l'équipe de Karim et les demandes (construites)

// Les 7 chauffeurs-livreurs (brief §4) ; Lucas, Amandine et Julien connaissent la tournée de la côte.
export const CHAUFFEURS = [
  { id: 'lucas', nom: 'Lucas', cote: true, note: 'connaît la côte' },
  { id: 'amandine', nom: 'Amandine', cote: true, note: 'connaît la côte' },
  { id: 'julien', nom: 'Julien', cote: true, note: 'connaît la côte' },
  { id: 'sebastien', nom: 'Sébastien' },
  { id: 'fatou', nom: 'Fatou' },
  { id: 'yoann', nom: 'Yoann' },
  { id: 'kevin', nom: 'Kevin' },
];
// L'imprévu : Kevin part (dernier jour le vendredi 2 juillet, avant S1) ; le saisonnier est là de S2 à S8 (12 juillet → 27 août).
export const PARTANT = 'kevin';
export const SAISONNIER = { id: 'saisonnier', nom: 'Saisonnier (à recruter)', dispo: 1, a: 7, note: 'ne connaît pas la côte' };
// Chauffeurs au travail nécessaires chaque semaine : 6 en juillet, 5 en août, 0 la semaine du 30 août (après le pic).
export const BESOIN = [6, 6, 6, 6, 5, 5, 5, 5, 0];

// Les demandes : semaine demandée (rang, S1 = 0), nombre de semaines, date de la demande. Julien : déjà validé (imposé).
export const DEMANDES = [
  { id: 'conge-amandine', qui: 'amandine', date: 2, semaines: 1, demande: '2027-03-02' },
  { id: 'conge-sebastien', qui: 'sebastien', date: 4, semaines: 2, demande: '2027-03-18' },
  { id: 'conge-lucas', qui: 'lucas', date: 1, semaines: 2, demande: '2027-05-05' },
  { id: 'conge-fatou', qui: 'fatou', date: 5, semaines: 2, demande: '2027-05-12' },
  { id: 'conge-yoann', qui: 'yoann', date: 6, semaines: 2, demande: '2027-05-20' },
  { id: 'conge-kevin', qui: 'kevin', date: 7, semaines: 1, demande: '2027-05-28' },
  { id: 'conge-julien', qui: 'julien', date: 4, semaines: 1, impose: true },
];
const nomDe = (id) => ((CHAUFFEURS.concat(SAISONNIER)).find((c) => c.id === id) || {}).nom || id;
const de = (id) => (/^[AEIOUYÉÈ]/.test(nomDe(id)) ? 'd’' : 'de ') + nomDe(id);

// ─────────────────────────────────────────────────────────────── les règles « métier » (critères du planning, et calage)
// Elles lisent les données d'une phase sous la forme du moteur (`D` : lignes avec `_debut` / `_fin`, cartes avec `_dem`, `_L`,
// `_impose`, `_ligne`, `demande`) et un placement `pl` = { carte: semaine de début }. Le corrigé et les tests les appellent sur
// `donneesBrutes(phase)`, qui fabrique la même forme depuis les déclarations ci-dessus (sans le moteur).

const recouvre = (a, b) => a._dem < b._dem + b._L && b._dem < a._dem + a._L;
const estDecale = (c, s) => !c._impose && c._dem != null && s !== c._dem;
// Effectif et côte, colonne par colonne (les règles `effectif` et `auMoinsUn` du moteur), plus la date imposée.
export function valide(D, pl) {
  if (D.cartes.some((c) => c._impose && pl[c.id] !== c._dem)) return false;
  for (let t = 0; t < BESOIN.length; t++) {
    const pr = D.lignes.filter((l) => t >= l._debut && t < l._fin
      && !D.cartes.some((c) => c._ligne === l.id && pl[c.id] != null && pl[c.id] <= t && t < pl[c.id] + c._L));
    if (pr.length < BESOIN[t] || !pr.some((l) => l.cote)) return false;
  }
  return true;
}
// Priorité à la demande la plus ancienne (lecture P1 du calage) : un congé décalé ne doit pas avoir, sur ses semaines demandées,
// un congé demandé APRÈS lui et resté à sa date.
export function fautesPriorite(D, pl) {
  const L = D.cartes.filter((c) => !c._impose && c._dem != null && pl[c.id] != null);
  const decales = L.filter((c) => estDecale(c, pl[c.id])), gardes = L.filter((c) => !estDecale(c, pl[c.id]));
  return decales.filter((x) => gardes.some((y) => recouvre(x, y) && y.demande > x.demande));
}
export const nbDecales = (D, pl) => D.cartes.filter((c) => pl[c.id] != null && estDecale(c, pl[c.id])).length;
// Le NOMBRE MINIMAL de congés décalés d'un planning qui respecte effectif, côte et date imposée : on essaie 0, 1, 2… cartes
// déplacées (calculé une fois par jeu de données).
const MINIMA = new WeakMap();
function* combinaisons(L, k, i = 0, pris = []) {
  if (pris.length === k) { yield pris; return; }
  for (let j = i; j < L.length; j++) yield* combinaisons(L, k, j + 1, [...pris, L[j]]);
}
function* deplacements(D, choisies, base, i = 0) {
  if (i === choisies.length) { yield base; return; }
  const c = choisies[i];
  for (let s = 0; s + c._L <= BESOIN.length; s++) if (s !== c._dem) yield* deplacements(D, choisies, { ...base, [c.id]: s }, i + 1);
}
export function minimumDecales(D) {
  if (MINIMA.has(D)) return MINIMA.get(D);
  const libres = D.cartes.filter((c) => !c._impose && c._dem != null);
  const base = Object.fromEntries(D.cartes.map((c) => [c.id, c._dem]));
  let min = null;
  for (let k = 0; k <= libres.length && min == null; k++) {
    for (const ch of combinaisons(libres, k)) {
      for (const pl of deplacements(D, ch, base)) if (valide(D, pl)) { min = k; break; }
      if (min != null) break;
    }
  }
  MINIMA.set(D, min);
  return min;
}
// Les plannings justes (valides, nombre minimal de décalés, priorité respectée) : ceux à `min` cartes déplacées seulement.
export function solutions(D) {
  const min = minimumDecales(D), out = [];
  const libres = D.cartes.filter((c) => !c._impose && c._dem != null);
  const base = Object.fromEntries(D.cartes.map((c) => [c.id, c._dem]));
  for (const ch of combinaisons(libres, min)) {
    for (const pl of deplacements(D, ch, base)) if (valide(D, pl) && !fautesPriorite(D, pl).length) out.push(pl);
  }
  return out;
}
// Le calage complet (tests) : toutes les façons de poser les cartes libres (la date imposée à sa place).
export function calage(D) {
  const libres = D.cartes.filter((c) => !c._impose), fixes = Object.fromEntries(D.cartes.filter((c) => c._impose).map((c) => [c.id, c._dem]));
  let facons = 0, valides = 0, justes = 0;
  const min = minimumDecales(D);
  const rec = (k, pl) => {
    if (k === libres.length) {
      facons++;
      if (valide(D, pl)) { valides++; if (nbDecales(D, pl) === min && !fautesPriorite(D, pl).length) justes++; }
      return;
    }
    const c = libres[k];
    for (let s = 0; s + c._L <= BESOIN.length; s++) { pl[c.id] = s; rec(k + 1, pl); }
    delete pl[c.id];
  };
  rec(0, { ...fixes });
  return { facons, valides, minimum: min, justes };
}
// Les données d'une phase sous la forme du moteur, sans le moteur (corrigé, tests, textes des messages).
export function donneesBrutes(phase) {
  const lignes = (phase >= 2 ? CHAUFFEURS.filter((c) => c.id !== PARTANT).concat(SAISONNIER) : CHAUFFEURS)
    .map((l) => ({ ...l, _debut: l.dispo || 0, _fin: l.a != null ? l.a + 1 : NB_SEMAINES }));
  const cartes = DEMANDES.filter((c) => phase < 2 || c.qui !== PARTANT)
    .map((c) => ({ ...c, _dem: c.date, _L: c.semaines, _impose: !!c.impose, _ligne: c.qui }));
  return { lignes, cartes };
}
// Les deux plannings justes (un seul chacun : calage du lot 0, contrôlé par le bloc de tests).
export const SOLUTIONS = { v1: solutions(donneesBrutes(1)), v2: solutions(donneesBrutes(2)) };
const SOL1 = SOLUTIONS.v1[0] || {}, SOL2 = SOLUTIONS.v2[0] || {};
const LUCAS = DEMANDES.find((c) => c.qui === 'lucas'), AMANDINE = DEMANDES.find((c) => c.qui === 'amandine');

// ─────────────────────────────────────────────────────────────── le planning des congés

const sansBalises = (t) => String(t).replace(/<[^>]+>/g, '').replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1');
const D_SAIS = { de: jm(lundi(SAISONNIER.dispo)), a: jm(vendredi(SAISONNIER.a)) };
export const ALEA_TEXTE = `Kevin a trouvé un poste près de chez lui : son dernier jour est le <b>vendredi 2 juillet</b>. Karim a obtenu un `
  + `<b>chauffeur saisonnier</b>, mais il ne pourra commencer que le <b>lundi ${D_SAIS.de}</b> (le temps de recruter). Reprends le planning, puis renvoie-le.`;

export const PLANNING = {
  id: PL,
  libelle: 'Planning des congés',
  titre: 'Congés d’été des chauffeurs-livreurs — équipe de Karim, plateforme de Buchelay',
  date: 'Été 2027 : semaines du 5 juillet au 30 août',
  infos: (o) => [
    'Besoin de la semaine (chauffeurs au travail) : ligne « Besoin »',
    'Au moins un chauffeur qui connaît la tournée de la côte chaque semaine',
    'Règle de la plateforme : la demande la plus ancienne garde sa date ; on décale le moins de congés possible',
    'Le congé de Julien est déjà validé : il ne bouge pas',
    ...o.lignes.map((l) => `<b>${l.nom}</b>${l.cote ? ' · connaît la côte' : ''}${l.dispo ? ` · là du lundi ${D_SAIS.de} au vendredi ${D_SAIS.a}` : ''}`),
  ],
  echelle: { type: 'jours', jours: JOURS_GRILLE, semaine: 4, largeur: 96, col1: 150 },
  lignes: { titre: 'Congés d’été — une colonne par semaine (S1 = semaine du lundi 5 juillet)', liste: CHAUFFEURS,
    legende: 'Une semaine sans congé, le chauffeur travaille. « pas là » : pas encore arrivé. S9 (semaine du 30 août) : après le pic, besoin 0.' },
  cartes: {
    titre: 'Demandes de congés',
    liste: DEMANDES.map((c) => ({ ...c, famille: c.impose ? 'impose' : 'conge', titre: `${nomDe(c.qui)} — congé d’été`, court: nomDe(c.qui) })),
    duree: (c) => c.semaines,
    ligne: (c) => c.qui,
    aPlacer: 'À poser',
    details: (c) => [
      `${c.semaines} semaine${c.semaines > 1 ? 's' : ''} · ${c.impose ? 'congé <b>déjà validé</b>' : 'congé <b>demandé</b>'}`,
      `${c.impose ? 'Dates' : 'Dates souhaitées'} : <b>${periode(c.date, c.semaines)}</b>`,
      c.impose ? 'Validé par Karim : il ne se déplace pas.' : `Demandé le ${dateDemande(c.demande)}`,
    ],
    nonPosees: (L) => `Congés pas encore posés : ${L.map((c) => `celui ${de(c.qui)}`).join(', ')}.`,
    legende: 'Jaune : congé demandé · violet : congé déjà validé. Glisse une carte sur le planning (elle se pose sur la ligne du chauffeur, à la semaine visée), '
      + 'ou clique-la puis clique la semaine. Clavier : Entrée pour la prendre, flèches gauche/droite, Suppr pour la retirer.',
  },
  familles: { conge: { couleur: '#f0be00', nom: 'jaune', legende: 'congé demandé' }, impose: { couleur: '#8b5cf6', nom: 'violet', legende: 'congé déjà validé' } },
  compteurs: [
    { lib: 'Au travail', valeur: 'presents', regle: 'effectif' },
    { lib: 'Besoin', valeur: 'besoin', regle: 'effectif' },
    { lib: 'Chauffeurs de la côte', valeur: 'filtre', regle: 'cote' },
  ],
  regles: [
    { id: 'effectif', type: 'effectif', besoin: BESOIN, message: (j) => `${j} : pas assez de chauffeurs au travail.` },
    { id: 'cote', type: 'auMoinsUn', filtre: (l) => !!l.cote, libelle: 'chauffeur qui connaît la côte',
      message: (j) => `${j} : aucun chauffeur de la côte au travail.` },
    { id: 'julien', type: 'dateImposee', message: (c) => `Le congé ${de(c.qui)} est déjà validé : il ne se déplace pas.` },
    { id: 'priorite', type: 'critere',
      verifier: ({ D, I }) => fautesPriorite(D, Object.fromEntries(I.map((i) => [i.id, i.s])))
        .map((c) => ({ texte: `Le congé ${de(c.qui)} est décalé alors qu’une demande plus récente garde sa date.`, cartes: [c.id] })) },
    { id: 'minimum', type: 'critere',
      verifier: ({ D, I }) => {
        const pl = Object.fromEntries(I.map((i) => [i.id, i.s]));
        const min = minimumDecales(D);
        return min != null && nbDecales(D, pl) > min ? [{ texte: 'Des congés sont décalés alors qu’on pouvait en décaler moins.',
          cartes: I.filter((i) => estDecale(i.c, i.s)).map((i) => i.id) }] : [];
      } },
  ],
  // Les deux critères « métier » citent aussi l'effectif : un planning qui manque de monde ne les gagne jamais par vacuité.
  jalons: [
    { id: 'effectif', lib: 'Chaque semaine a assez de chauffeurs au travail', regles: ['effectif'] },
    { id: 'cote', lib: 'Chaque semaine, un chauffeur qui connaît la côte', regles: ['cote'] },
    { id: 'julien', lib: 'Le congé déjà validé de Julien reste à sa date', regles: ['julien'] },
    { id: 'priorite', lib: 'La demande la plus ancienne garde sa date', regles: ['effectif', 'priorite'] },
    { id: 'minimum', lib: 'Le moins de congés décalés possible', regles: ['effectif', 'minimum'] },
  ],
  repriseIdentique: 'faux',
  aides: {
    verifier: false,
    consignes: {
      regles: 'Pose chaque congé sur la ligne du chauffeur. Chaque semaine, il faut assez de chauffeurs au travail (ligne « Besoin ») et '
        + 'au moins un chauffeur qui connaît la côte. Un congé se pose à la date demandée, sauf s’il manque alors du monde : il faut '
        + 'le décaler. En cas de conflit, la <b>demande la plus ancienne</b> garde sa date, et on décale <b>le moins de congés possible</b>.',
    },
  },
  alea: {
    de: 'Inès',
    texte: ALEA_TEXTE,
    retraits: { lignes: [PARTANT], cartes: DEMANDES.filter((c) => c.qui === PARTANT).map((c) => c.id) },
    ajoutLignes: [SAISONNIER],
  },
};

// ─────────────────────────────────────────────────────────────── le message à Lucas (phrases à choisir, au TU)

// Chaque ligne de décision, de raison et de proposition porte une date : la proposition n'est pas la seule datée (refonte §1).
// Lucas REPREND la décision et la proposition du dernier envoi (`echo`), sans corriger. La juste en tête (rang déclaré).
const DEM_LUCAS = periode(LUCAS.date, LUCAS.semaines);
export const CHOIX_DECISION = [
  { phrase: `Ton congé ${DEM_LUCAS} ne peut pas être accordé.`, echo: 'Pas accordé… Dommage, j’avais déjà prévenu ma famille.' },
  { phrase: `Ton congé ${DEM_LUCAS} est accepté.`, echo: 'Accepté ? Super, merci !' },
  { phrase: `Ton congé ${DEM_LUCAS} est annulé.`, echo: 'Annulé ? Alors je n’ai plus rien cet été ?' },
];
export const CHOIX_RAISON = [
  `Avec le départ de Kevin, il faut ${BESOIN[0] === 6 ? 'six' : BESOIN[0]} chauffeurs chaque semaine de juillet, et Amandine avait demandé ${semaineDu(AMANDINE.date)} avant toi.`,
  `Karim ne veut pas que tu partes ${DEM_LUCAS}.`,
  `Il y a trop de travail ${DEM_LUCAS}.`,
];
const PROP = (pl, L) => periode(pl[LUCAS.id], L);
export const CHOIX_PROPOSITION = [
  { phrase: `Karim te propose ${PROP(SOL2, LUCAS.semaines)}.`, echo: `${majuscule(PROP(SOL2, LUCAS.semaines))}, c’est tard, mais je prends.` },
  { phrase: `Karim te propose ${PROP(SOL1, LUCAS.semaines)}.`, echo: `${majuscule(PROP(SOL1, LUCAS.semaines))}, je vais voir si je peux changer mes réservations.` },
  { phrase: `Tu prendras tes congés ${periode(NB_SEMAINES - 1, LUCAS.semaines)}.`, echo: `${majuscule(periode(NB_SEMAINES - 1, LUCAS.semaines))}, c’est tard, mais je prends.` },
  { phrase: 'Tu n’auras pas de congé cet été.', echo: 'Pas de congé du tout ? Ça me déçoit beaucoup.' },
];
function majuscule(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function phrasesLucas(prenom) {
  return {
    id: MSG,
    lignes: [
      { id: 'salutation', choix: ['Bonjour Lucas,', 'Salut Lucas !', 'Coucou Lucas !'], juste: 0 },
      { id: 'decision', choix: CHOIX_DECISION.map((c) => c.phrase), juste: 0 },
      { id: 'raison', choix: CHOIX_RAISON, juste: 0 },
      { id: 'proposition', choix: CHOIX_PROPOSITION.map((c) => c.phrase), juste: 0 },
      { id: 'fin', choix: [`Je reste à ta disposition. Cordialement, ${prenom}, pour Inès`, 'Désolé !', 'Bisous'], juste: 0 },
    ],
    melanger: true,
  };
}
// La réponse de l'élève à Lucas déçu : NON notée (aucun jalon ne la lit). Ids de lignes distincts du premier message (les gestes
// `messagerie:phrase:<ligne>` ne disent pas de quel message).
export function phrasesReponse(prenom) {
  return {
    id: REPONSE,
    lignes: [
      { id: 'comprendre', choix: ['Je comprends que ce soit décevant pour toi.', 'Ce n’est pas mon problème.', 'Tu n’avais qu’à demander plus tôt !'], juste: 0 },
      { id: 'suite', choix: ['Si tu veux en parler, Karim peut te recevoir : c’est lui qui décide des congés.', 'Inès va tout arranger.',
        'De toute façon, on ne peut plus rien changer.'], juste: 0 },
      { id: 'au-revoir', choix: [`Bonne fin de journée, ${prenom}`, 'Bisous'], juste: 0 },
    ],
    melanger: true,
  };
}

// ─────────────────────────────────────────────────────────────── l'annonce du saisonnier

// Le poste (fiche de poste, construite d'après les offres réelles « SAISON – Chauffeur livreur VL »).
export const POSTE = {
  intitule: 'Chauffeur-livreur VL saisonnier (H/F)',
  contrat: 'cdd',
  rattache: 'karim',
  dates: `${periode(SAISONNIER.dispo, SAISONNIER.a - SAISONNIER.dispo + 1)} 2027`,
};
// Les mentions : `oui` = à écrire (utile au poste) ; `non` = interdite (discrimination). Ordre écrit À LA MAIN, oui et non mêlés.
export const MENTIONS = [
  { id: 'permis', lib: 'Permis B exigé', oui: true },
  { id: 'age', lib: '« Moins de 30 ans »', oui: false },
  { id: 'manutention', lib: 'Manutention de fûts et de casiers', oui: true },
  { id: 'sexe', lib: '« Homme de préférence »', oui: false },
  { id: 'nationalite', lib: '« Nationalité française exigée »', oui: false },
  { id: 'lieu', lib: 'Lieu : Buchelay (78)', oui: true },
  { id: 'famille', lib: '« Célibataire sans enfant »', oui: false },
  { id: 'horaires', lib: 'Horaires et salaire', oui: true },
];
// Les listes : ordre écrit à la main, la juste à une place différente d'une liste à l'autre.
export const CHOIX_INTITULE = [
  { v: 'pl', lib: 'Chauffeur poids lourd (H/F)' },
  { v: 'vl', lib: POSTE.intitule },
  { v: 'prepa', lib: 'Préparateur de commandes (H/F)' },
];
export const CHOIX_CONTRAT = [{ v: 'cdi', lib: 'CDI' }, { v: 'stage', lib: 'Stage' }, { v: 'cdd', lib: 'CDD saisonnier' }];
export const CHOIX_DATES = [
  { v: 'juste', lib: POSTE.dates },
  { v: 'tot', lib: `${periode(0, SAISONNIER.a + 1)} 2027` },
  { v: 'sans-fin', lib: `à partir du lundi ${D_SAIS.de} 2027, sans date de fin` },
];
export const CHOIX_RATTACHE = [
  { v: 'ines', lib: `Inès, ${EQUIPE.ines.role}` },
  { v: 'karim', lib: `Karim, ${EQUIPE.karim.role}` },
  { v: 'nadia', lib: `Nadia, ${EQUIPE.nadia.role}` },
];
export const ATTENDU_ANNONCE = { intitule: 'vl', contrat: POSTE.contrat, dates: 'juste', rattache: POSTE.rattache };

export const FICHE = {
  id: ANNONCE, libelle: 'Annonce du saisonnier', titre: 'Annonce — chauffeur-livreur saisonnier',
  sousTitre: 'Le message de Karim, la fiche de poste et le droit sont à gauche. Remplis l’annonce, puis envoie-la à Karim.',
  documents: ['besoin-karim', 'fiche-de-poste', 'droit'],
  bouton: 'Ouvrir l’annonce',
  blocs: [
    { type: 'cadre', titre: '1. Le poste', blocs: [
      { type: 'liste', id: 'intitule', lib: 'Intitulé du poste', vide: 'Choisir…', manque: 'l’intitulé', choix: CHOIX_INTITULE },
      { type: 'choix', id: 'contrat', lib: 'Contrat', manque: 'le contrat', choix: CHOIX_CONTRAT },
      { type: 'liste', id: 'dates', lib: 'Dates', vide: 'Choisir…', manque: 'les dates', choix: CHOIX_DATES },
      { type: 'liste', id: 'rattache', lib: 'Rattaché à', vide: 'Choisir…', manque: 'à qui le poste est rattaché', choix: CHOIX_RATTACHE },
    ] },
    { type: 'cadre', titre: '2. À écrire dans l’annonce ?', consigne: 'Pour chaque mention : oui si elle va dans l’annonce, non sinon.',
      blocs: [{ type: 'ouinon', id: 'mentions', entete: 'Mention', manque: '{n} mention(s) sans réponse',
        colonnes: [{ id: 'ecrire', lib: 'À écrire ?' }], lignes: MENTIONS.map((m) => ({ id: m.id, lib: m.lib })) }] },
    { type: 'encadre', titre: 'Ce qu’une annonce n’a pas le droit de dire',
      texte: 'Une annonce ne peut pas trier les candidats sur leur âge, leur sexe, leur origine ou leur famille : c’est une '
        + '[[discrimination]], interdite par le Code du travail. On demande ce qui sert au poste.' },
  ],
  pied: 'Annonce — document pédagogique, reconstitution, non contractuel',
  envoi: { bouton: 'Envoyer l’annonce à Karim', a: 'Karim', suite: 'Karim va te répondre dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── les documents (reconstitués, mention en pied)

const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = (quoi) => `<p class="fb-pied">${quoi} — Document pédagogique — reconstitution, non contractuel</p>`;

const docCartes = () => `<article class="fb3-doc" aria-label="Les demandes de congés d’été">
    <p class="fb-t">Les demandes de [[congé|congés]] d’été — équipe de Karim</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay · été 2027</p>
    <table class="fb3-table">
      <thead><tr><th scope="col">Chauffeur</th><th scope="col">Congé demandé</th><th scope="col">Durée</th><th scope="col">Demandé le</th></tr></thead>
      <tbody>${DEMANDES.map((c) => `<tr data-demande="${c.qui}"><td>${ech(nomDe(c.qui))}</td><td>${ech(periode(c.date, c.semaines))}</td>
        <td>${c.semaines} semaine${c.semaines > 1 ? 's' : ''}</td><td>${c.impose ? 'déjà validé par Karim' : ech(dateDemande(c.demande))}</td></tr>`).join('')}</tbody>
    </table>
    <p class="fb3-note">Lucas, Amandine et Julien connaissent la tournée de la côte.</p>
    ${PIED('Demandes de congés')}
  </article>`;

const docRegle = () => `<article class="fb3-doc" aria-label="Règle de la plateforme : les congés d’été">
    <p class="fb-t">Règle de la plateforme : les congés d’été des chauffeurs</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay · service transport (Karim)</p>
    <ul class="fb3-ul">
      <li>Chauffeurs au travail chaque semaine (l’[[effectif]] nécessaire) : <b>${BESOIN[0]} en juillet</b>, <b>${BESOIN[4]} en août</b>.
        La semaine du 30 août, après le pic : pas de besoin.</li>
      <li>Chaque semaine, au moins <b>un chauffeur qui connaît la tournée de la côte</b>.</li>
      <li>Un congé déjà validé ne se déplace pas.</li>
      <li>En cas de conflit, la <b>demande la plus ancienne</b> garde sa date ([[priorité]]).</li>
      <li>On décale <b>le moins de congés possible</b>.</li>
      <li>Karim décide des congés ; Inès les enregistre et prévient les chauffeurs.</li>
    </ul>
    ${PIED('Règle de la plateforme')}
  </article>`;

const docPoste = () => `<article class="fb3-doc" aria-label="Fiche de poste : chauffeur-livreur VL">
    <p class="fb-t">Fiche de poste — chauffeur-livreur [[VL]]</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay (78)</p>
    <dl class="fb3-dl">
      <dt>Missions</dt><dd>Livrer les cafés, hôtels et restaurants (clients [[CHR]]) sur une tournée au départ de Buchelay ; décharger les [[fût|fûts]]
        et les casiers ; reprendre les [[vides]].</dd>
      <dt>Véhicule</dt><dd>Véhicule léger, moins de 3,5 t : [[permis B]].</dd>
      <dt>Lieu</dt><dd>Buchelay (78), départ du quai.</dd>
      <dt>Horaires</dt><dd>Du lundi au vendredi, départ du quai à 6 h.</dd>
      <dt>Salaire</dt><dd>Selon la grille de la plateforme.</dd>
      <dt>[[rattaché|Rattachement]]</dt><dd>Responsable d’exploitation transport.</dd>
    </dl>
    ${PIED('Fiche de poste')}
  </article>`;

export const TEXTE_KARIM = (prenom) => `Bonjour ${prenom},\n\nAvec le départ de Kevin, il me faut un chauffeur saisonnier pour l’été : il commence `
  + `le lundi ${D_SAIS.de} et reste jusqu’à la fin du pic, le vendredi ${D_SAIS.a}. Prépare l’annonce à partir de la fiche de poste (jointe), `
  + 'puis envoie-la-moi : je la relirai avant de la donner à Hélène.\n\nKarim';
const docBesoin = () => `<article class="fb3-doc" aria-label="Le message de Karim">
    <p class="fb-t">Le message de Karim</p>
    <p class="fb-st">De : Karim (responsable d’exploitation transport) · mardi 15 juin 2027</p>
    <div class="fb3-mail">${TEXTE_KARIM('{ton prénom}').split('\n\n').map((p) => `<p>${ech(p)}</p>`).join('')}</div>
    <p class="fb-pied">Copie du message reçu dans la Messagerie</p>
  </article>`;

// Textes de loi relus le 10/10/2026 sur code.travail.gouv.fr (Code du travail numérique, reprise de Légifrance).
const art = (num, texte) => `<p class="fb-st" style="margin-top:14px">Code du travail, article ${num}</p>${texte}`;
const docDroit = () => `<article class="fb3-doc" aria-label="Le droit">
    <p class="fb-t">Le droit : congés, CDD saisonnier, discrimination</p>
    ${art('L3141-3', '<p>« Le salarié a droit à un congé de deux jours et demi ouvrables par mois de travail effectif chez le même employeur.</p>'
      + '<p>La durée totale du congé exigible ne peut excéder trente jours ouvrables. »</p>')}
    ${art('L3141-17', '<p>« La durée des congés pouvant être pris en une seule fois ne peut excéder vingt-quatre jours ouvrables. Il peut être dérogé '
      + 'individuellement à cette limite pour les salariés qui justifient de contraintes géographiques particulières ou de la présence au sein du '
      + 'foyer d’un enfant ou d’un adulte handicapé ou d’une personne âgée en perte d’autonomie. »</p>')}
    ${art('L1242-2 (extrait)', '<p>« […] un contrat de travail à durée déterminée ne peut être conclu que pour l’exécution d’une tâche précise et '
      + 'temporaire, et seulement dans les cas suivants : […]</p><p>3° Emplois à caractère saisonnier, dont les tâches sont appelées à se répéter '
      + 'chaque année selon une périodicité à peu près fixe, en fonction du rythme des saisons ou des modes de vie collectifs […] »</p>')}
    ${art('L1242-10 (extrait)', '<p>« Le contrat de travail à durée déterminée peut comporter une période d’essai.</p><p>Sauf si des usages ou des '
      + 'stipulations conventionnelles prévoient des durées moindres, cette période d’essai ne peut excéder une durée calculée à raison d’un jour '
      + 'par semaine, dans la limite de deux semaines lorsque la durée initialement prévue au contrat est au plus égale à six mois et d’un mois '
      + 'dans les autres cas. […] »</p>')}
    ${art('L1132-1 (extrait)', '<p>« Aucune personne ne peut être écartée d’une procédure de recrutement […] en raison de son origine, de son sexe, '
      + '[…] de son âge, de sa situation de famille ou de sa grossesse, […] de son appartenance ou de sa non-appartenance, vraie ou supposée, à '
      + 'une ethnie, une nation ou une prétendue race, […] »</p>')}
    <p class="fb-pied">Texte de loi (réel) — source : Légifrance</p>
  </article>`;

export const DOCUMENTS = [
  { id: 'cartes', titre: 'Les demandes de congés d’été', court: 'Demandes de congés', html: docCartes() },
  { id: 'regle', titre: 'Règle de la plateforme : les congés d’été', court: 'Règle des congés', html: docRegle() },
  { id: 'fiche-de-poste', titre: 'Fiche de poste — chauffeur-livreur VL', court: 'Fiche de poste', html: docPoste() },
  { id: 'besoin-karim', titre: 'Le message de Karim', court: 'Message de Karim', html: docBesoin() },
  { id: 'droit', titre: 'Le droit : congés, CDD saisonnier, discrimination', court: 'Le droit', html: docDroit() },
  DOC_ORGANIGRAMME, DOC_ANNUAIRE,
];

export const STYLE_DOCUMENTS = `${STYLE_FB}
.fb3-doc{padding:14px 18px 0}
.fb3-doc p{margin:0 0 8px}
.fb3-mail p{margin:0 0 8px}
.fb3-table{border-collapse:collapse; width:100%; font-size:.9rem; margin-top:4px}
.fb3-table th, .fb3-table td{border-bottom:1px solid var(--filet); padding:5px 6px; text-align:left}
.fb3-table th{color:var(--douce); font-weight:600}
.fb3-note{margin:10px 0 0; font-size:.86rem}
.fb3-ul{margin:6px 0 0; padding-left:18px; font-size:.9rem}
.fb3-ul li{margin:4px 0}
.fb3-dl{display:grid; grid-template-columns:130px 1fr; gap:5px 12px; margin:6px 0 0; font-size:.9rem}
.fb3-dl dt{color:var(--douce)}
.fb3-dl dd{margin:0}
`;

// ─────────────────────────────────────────────────────────────── les messages

const INES = { nom: EQUIPE.ines.nom, mail: mailDe('ines') };
const KARIM = { nom: EQUIPE.karim.nom, mail: mailDe('karim') };
const LUCAS_M = { nom: EQUIPE.lucas.nom, mail: mailDe('lucas') };
export const ID_VOLET = 'fb-ent63';
// Les messages portent la date du scénario (règle du 10/10/2026) : semis à 14 h 05, puis heure d'ouverture + temps passé + décalage.
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || '14:05', { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJET_LUCAS = 'Mon congé d’été';
export const SUJET_ANNONCE = 'L’annonce du chauffeur saisonnier';
const repondu = (db) => phrasesJustes(db, MSG).envoye;

// Le DERNIER envoi du message à Lucas (même tri que `phrasesJustes`), ou null.
const dernierEnvoi = (db) => ((db && db.mails) || []).filter((m) => m.folder === 'out' && m.phrases && m.phrases.id === MSG)
  .sort((a, b) => (a.ts - b.ts) || (a.id - b.id)).pop() || null;
// La réponse de Lucas : il reprend la décision et la proposition que l'élève lui a écrites, sans corriger. Exportée pour les tests.
export function texteReponseLucas(db) {
  const e = dernierEnvoi(db), c = (e && e.phrases && e.phrases.choix) || {};
  const d = CHOIX_DECISION[c.decision], p = CHOIX_PROPOSITION[c.proposition];
  return `${[d && d.echo, p && p.echo].filter(Boolean).join(' ') || 'D’accord.'}\n\nLucas`;
}

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, INES, 'Les congés d’été des chauffeurs',
      `Bonjour ${prenom} !\n\nLes chauffeurs ont posé leurs [[congé|congés]] d’été. Karim veut le planning ce soir : il doit rester assez de `
        + 'chauffeurs chaque semaine.\n\nPlace les congés (menu « Planning des congés »), puis envoie-le.\n\nInès',
      { extra: { pieces: ['cartes', 'regle', 'organigramme', 'annuaire'] } }),
  ] }),
  declencheurs: [
    // Le 1er planning envoyé (juste ou faux) : l'imprévu, et la vue passe à la reprise.
    { id: 'imprevu', quand: apresPlanning(PL), phasePlanning: 2,
      semer: (prenom, db) => ({ mails: [mail(prenom, INES, 'Kevin nous quitte : planning à reprendre', `${sansBalises(ALEA_TEXTE)}\n\nInès`, { db, decalage: 2 })] }) },
    // Le planning repris et renvoyé (juste ou faux) : Inès le transmet, Lucas écrit à propos de son congé (le message à lui répondre).
    { id: 'lucas', quand: apresPlanning(PL, 2),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, INES, 'Planning reçu', `Merci ${prenom}, je transmets ton planning à Karim.\n\nLucas t’a écrit à propos de son congé : `
          + 'ouvre son message, clique sur « Répondre » et choisis une phrase par ligne.\n\nInès', { db, decalage: 2 }),
        mail(prenom, LUCAS_M, SUJET_LUCAS, `Salut ${prenom} !\n\nKarim m’a dit que c’est toi qui prépares le planning des congés. `
          + `Mes deux semaines ${DEM_LUCAS}, c’est bon ?\n\nLucas`, { db, decalage: 3, extra: { cle: 'lucas', phrases: phrasesLucas(prenom) } }),
      ] }) },
    // Le message à Lucas envoyé (juste ou faux) : Lucas répond, déçu, en reprenant ce qu'il a lu ; Karim demande l'annonce.
    { id: 'apres-lucas', quand: repondu,
      semer: (prenom, db) => ({ mails: [
        mail(prenom, LUCAS_M, `RE : ${SUJET_LUCAS}`, texteReponseLucas(db), { db, decalage: 3, extra: { phrases: phrasesReponse(prenom) } }),
        mail(prenom, KARIM, SUJET_ANNONCE, TEXTE_KARIM(prenom), { db, decalage: 5, extra: { pieces: ['fiche-de-poste', 'droit'], ouvreFiche: ANNONCE } }),
      ] }) },
    // L'annonce envoyée (juste ou fausse) : Karim la transmet à Hélène (lien hiérarchique d'ENT-6.1), sans dire si c'est juste.
    { id: 'annonce-recue', quand: apresFiche(ANNONCE),
      semer: (prenom, db) => ({ mails: [mail(prenom, KARIM, `RE : ${SUJET_ANNONCE}`, 'Merci, je la transmets à Hélène pour validation.\n\nKarim', { db, decalage: 2 })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: {
    [PL]: (prenom, n, db) => ({ mails: [mail(prenom, INES, 'Planning corrigé', `Merci ${prenom}, j’ai bien reçu ton planning corrigé.\n\nInès`, { db, decalage: 2 })] }),
    [MSG]: (prenom, n, db) => ({ mails: [mail(prenom, LUCAS_M, `RE : ${SUJET_LUCAS}`, 'Bien reçu.\n\nLucas', { db, decalage: 2 })] }),
    [ANNONCE]: (prenom, n, db) => ({ mails: [mail(prenom, KARIM, 'Annonce corrigée', `Merci ${prenom}, j’ai bien reçu ton annonce corrigée.\n\nKarim`, { db, decalage: 2 })] }),
  },
};

// L'annonce attend le message à Lucas (rapport du lot 0, f) : on répond d'abord à la personne dont on décale le congé.
export const FERMETURES = {
  fiche: { ouvertSi: (db) => repondu(db), message: 'Réponds d’abord à Lucas (Messagerie).' },
};

// ─────────────────────────────────────────────────────────────── les jalons (27, pondérés : 17 + 3 de questions = 20)
// Poids validés par Tristan le 10/10/2026. Planning 1er envoi 4,5 · après l'imprévu 5,5 · annonce, le poste 1,5 · annonce, ce qu'on
// écrit ou pas 3 · message à Lucas, le fond 1,5 · le ton 1 · questions notées 3 (`part`). Rien n'est vrai avant l'envoi : « à faire ».
export const POIDS = {
  v1: { effectif: 1, cote: 0.5, julien: 0.5, priorite: 1.5, minimum: 1 },
  v2: { effectif: 1.5, cote: 0.5, julien: 0.5, priorite: 1.5, minimum: 1.5 },
  poste: { intitule: 0.5, contrat: 0.5, dates: 0.25, rattache: 0.25 },
  mention: { oui: 0.25, non: 0.5 },
  message: { decision: 0.5, raison: 0.5, proposition: 0.5, salutation: 0.5, fin: 0.5 },
};
export const GROUPES = {
  v1: 'Le planning : premier envoi',
  v2: 'Le planning : après l’imprévu',
  poste: 'L’annonce : le poste',
  mentions: 'L’annonce : ce qu’on écrit, ce qu’on n’écrit pas',
  fond: 'Le message à Lucas : la décision, la raison, la proposition',
  ton: 'Le message à Lucas : le ton',
};
const attente = { status: 'attente' }, ok = { status: 'ok' }, ko = { status: 'ko' };

const jalonsPlanning63 = etapesPlanning(PLANNING).map((e) => {
  const v = e.id.startsWith('v1-') ? 'v1' : 'v2';
  return Object.assign(e, { groupe: GROUPES[v], ecran: `planning:${PL}`, poids: POIDS[v][e.id.slice(3)] });
});
const jalonAnnonce = (id, titre, groupe, poids, juste) => ({ id, titre, groupe, poids, ecran: `fiche:${ANNONCE}`,
  verifier(db) {
    const f = ficheEnvoyee(db, ANNONCE);
    if (!f.envoye) return attente;
    return juste(f.valeurs) ? ok : ko;
  } });
const jalonMessage = (ligne, titre, groupe, poids) => ({ id: `msg-${ligne}`, titre, groupe, poids, ecran: `phrases:${MSG}`,
  verifier(db) {
    const r = phrasesJustes(db, MSG);
    if (!r.envoye) return attente;
    return r.justes.includes(ligne) ? ok : ko;
  } });
const LIB_POSTE = { intitule: 'l’intitulé', contrat: 'le contrat', dates: 'les dates', rattache: 'à qui le poste est rattaché' };

export const ETAPES = [
  ...jalonsPlanning63,
  ...['intitule', 'contrat', 'dates', 'rattache'].map((k) => jalonAnnonce(`annonce-${k}`, `Annonce : ${LIB_POSTE[k]}`, GROUPES.poste, POIDS.poste[k],
    (v) => v[k] === ATTENDU_ANNONCE[k])),
  ...MENTIONS.map((m) => jalonAnnonce(`mention-${m.id}`, `Annonce : ${m.lib} — ${m.oui ? 'à écrire' : 'à ne pas écrire'}`, GROUPES.mentions,
    m.oui ? POIDS.mention.oui : POIDS.mention.non, (v) => !!(v.mentions && v.mentions[m.id]) && v.mentions[m.id].ecrire === m.oui)),
  jalonMessage('decision', 'Message à Lucas : la décision', GROUPES.fond, POIDS.message.decision),
  jalonMessage('raison', 'Message à Lucas : la raison', GROUPES.fond, POIDS.message.raison),
  jalonMessage('proposition', 'Message à Lucas : la proposition', GROUPES.fond, POIDS.message.proposition),
  jalonMessage('salutation', 'Message à Lucas : la salutation', GROUPES.ton, POIDS.message.salutation),
  jalonMessage('fin', 'Message à Lucas : la formule de fin', GROUPES.ton, POIDS.message.fin),
];

// ─────────────────────────────────────────────────────────────── l'accueil

export const MENTION = 'Réels : France Boissons et sa plateforme de Buchelay (Yvelines), ses offres « Saison – Chauffeur livreur VL » en CDD, '
  + 'le permis B pour un véhicule léger, les articles du Code du travail cités. Construit : l’équipe de Karim et ses prénoms, les demandes de '
  + 'congés, les besoins par semaine, la règle de priorité, le départ de Kevin, les dates du CDD, tous les messages.';
export const LEXIQUE = Object.assign({}, LEXIQUE_FB, {
  congé: 'Période où le salarié ne travaille pas. Il la demande ; l’employeur l’accorde, ou la décale si l’équipe manque alors de monde.',
  effectif: 'Nombre de personnes au travail (ici, de chauffeurs, chaque semaine).',
  'CDD saisonnier': 'Contrat avec une date de fin, pour un travail qui revient chaque année à la même période (ici, l’été).',
  VL: 'Véhicule léger : moins de 3,5 tonnes. Il se conduit avec le permis B.',
  'permis B': 'Permis de conduire des véhicules de moins de 3,5 tonnes (voitures, camionnettes).',
  discrimination: 'Traiter une personne moins bien qu’une autre à cause de son âge, son sexe, son origine, sa famille… C’est interdit, y compris à l’embauche.',
  rattaché: 'Être rattaché à quelqu’un : l’avoir pour chef (lien hiérarchique).',
  priorité: 'Ce qui passe avant le reste. Ici, la demande de congé la plus ancienne garde sa date.',
  'jours ouvrables': 'Tous les jours de la semaine sauf le dimanche et les jours fériés chômés : 6 jours par semaine.',
});
export const ACCUEIL = {
  titre: 'Les congés d’été',
  kpis: ['mail'],
  etapes: [
    ['Lire le message d’Inès', 'Menu Messagerie : les chauffeurs ont posé leurs congés d’été, avec les demandes et la règle de la plateforme en pièces jointes.'],
    ['Placer les congés', 'Menu « Planning des congés » : pose chaque congé, assez de chauffeurs chaque semaine ([[effectif]]), puis envoie le planning.'],
    ['Reprendre après l’imprévu', 'Un message t’annonce un changement : reprends le planning et renvoie-le.'],
    ['Répondre à Lucas', 'Ouvre son message : « Répondre », puis une phrase par ligne.'],
    ['Rédiger l’annonce du saisonnier', 'Karim te la demande : remplis-la, puis envoie-la-lui.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 3 : les congés d’été des chauffeurs',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  planning: PLANNING,
  fiche: FICHE,
  fermetures: FERMETURES,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
