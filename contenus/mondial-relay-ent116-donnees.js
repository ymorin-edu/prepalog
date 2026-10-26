// ENT-11.6 — Mondial Relay, « évaluation : les renforts de décembre » : les DONNÉES PURES de la séance (le jeu tiré de chaque élève : l'équipe de nuit, le
// besoin de chaque nuit, les trois demandes de congé ; ce qui s'en CALCULE : la décision juste de chaque demande, les renforts à prévoir, la personne à qui
// répondre). Aucun effet de bord, aucune interface, aucun import du moteur (le tirage de `core/tirage.js` est pur) : importé par le contenu
// (`contenus/mondial-relay-ent116.js`), les questions (`contenus/questions/ENT-11.6.js`) et le corrigé (`contenus/corriges/ENT-11.6.js`, qui se charge aussi
// sous Node). Brief `docs/briefs/ENT-11.6-mondial-relay-evaluation-renforts.md` ; univers commun `contenus/mondial-relay.js` (lu, jamais modifié).
//
// CONSTRUIT (dit à l'écran : pied des documents, `MENTION_116`) : l'équipe de nuit (prénoms), le besoin de chaque nuit, les demandes de congé et leurs dates,
// les règles du planning de nuit, les horaires de nuit (22 h – 5 h : non vérifiés). VÉRIFIÉ : voir l'en-tête de `contenus/mondial-relay.js` (pic de fin d'année,
// équipes de tri renforcées, hub de Buchères du lundi au samedi).
//
// ÉVALUATION, TIRÉE PAR ÉLÈVE (décision du 03/10/2026) : le jeu d'une graine (`jeuDe`) se tire avec `tirerJeu` (core/tirage.js) ; un tirage qui ne passe pas
// `ecartsJeu` est retiré (jusqu'à 40 fois), puis le jeu de secours. Ce qui est tiré :
//   - l'équipe : 8 agents en CDI (8 prénoms d'une banque de 16), dont DEUX titulaires du CACES 1 (les chargeurs) ;
//   - le besoin : base `b` (5 ou 6) les nuits de lundi à mercredi, +1 la deuxième semaine ; pic (jeudi à samedi) à partir de `p` (9 ou 10), +1 la deuxième semaine ;
//   - trois demandes de congé de DEUX nuits, présentées dans un ordre tiré : (X) un titulaire du CACES 1, nuits de base, qui peut partir ; (Y) l'autre titulaire,
//     une nuit en commun avec X, demande PLUS RÉCENTE, donc décalée ; (Z) un agent sans CACES, au moins une nuit de pic, donc refusée.
//
// LES RÈGLES (affichées dans le document « Les règles du planning de nuit ») :
//   1. chaque nuit, au moins le besoin ; les renforts (CDD) complètent l'équipe, ni plus ni moins que nécessaire ;
//   2. pas de congé pendant le pic (jeudi, vendredi, samedi) : la demande qui tombe sur une de ces nuits est REFUSÉE ;
//   3. chaque nuit, un chargeur titulaire du CACES 1 au moins ; deux titulaires ne partent pas la même nuit : la demande la plus ancienne garde ses nuits, l'autre est
//      DÉCALÉE ; sinon la demande est ACCORDÉE.
//
// CE QUI SE CALCULE (jamais écrit à la main) : la décision juste de chaque demande, les renforts attendus nuit par nuit (d'après les décisions DE L'ÉLÈVE : une
// erreur de congé ne se paie qu'une fois), le nombre de personnes à recruter, la personne à qui répondre, les phrases du message.
// RÈGLE « QUE, JAMAIS DE COMBIEN » : aucun écran ne dit combien de renforts il faut, ni quelle demande refuser, avant l'envoi du planning.

import { tirerJeu, graineDeBase } from '../core/tirage.js';
import { EQUIPE as EQUIPE_MR, VOCAB } from './mondial-relay.js';

export const ID = 'mondial-relay-evaluation-renforts';
export const ID_VOLET = 'mr-ent116';
export const FICHES = { planning: 'planning-116', recrutement: 'recrutement-116' };
export const PHRASES_ID = 'reponse-agent-116';

// ─────────────────────────────────────────────────────────────── les nuits du 7 au 19 décembre (lundi 7 : décembre 2026)
export const NB_AGENTS = 8;
export const NB_NUITS = 12;
export const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
// Une nuit : sa semaine (0 ou 1), son jour, sa date, « pic » = jeudi, vendredi, samedi.
export const NUITS = Array.from({ length: NB_NUITS }, (_, i) => {
  const semaine = Math.floor(i / 6), j = i % 6, date = 7 + 7 * semaine + j;
  return { i, semaine, j, jour: JOURS[j], date, pic: j >= 3, lib: `${JOURS[j]} ${date}`, court: `${COURTS[j]} ${date}` };
});
export const SEMAINES = [{ lib: 'du lundi 7 au samedi 12 décembre', court: 'Semaine du 7' }, { lib: 'du lundi 14 au samedi 19 décembre', court: 'Semaine du 14' }];
// « du jeudi 10 et du vendredi 11 décembre » (deux nuits consécutives).
export const nuitsTexte = (n) => `du ${NUITS[n[0]].lib} et du ${NUITS[n[1]].lib} décembre`;

// ─────────────────────────────────────────────────────────────── la banque de prénoms (construits ; aucun salarié réel)
export const NOMS = ['Nadia', 'Maxime', 'Julie', 'Thomas', 'Aïcha', 'Kévin', 'Camille', 'Mehdi', 'Laura', 'Antoine', 'Sofia', 'Dylan', 'Marion', 'Bastien', 'Yanis', 'Louise'];
export const slug = (nom) => String(nom).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

// ─────────────────────────────────────────────────────────────── le besoin d'une nuit (personnes au tri)
export const besoinDe = (jeu, i) => {
  const n = NUITS[i];
  return n.pic ? jeu.p + n.semaine + (n.j > 3 ? 1 : 0) : jeu.b + n.semaine;
};

// ─────────────────────────────────────────────────────────────── ce qui se calcule du jeu
// La décision juste de chaque demande (alignée sur `jeu.demandes`) : on prend les demandes de la plus ancienne à la plus récente.
export function decisionsJustes(jeu) {
  const ordre = jeu.demandes.map((_, k) => k).sort((a, b) => (jeu.demandes[a].jour - jeu.demandes[b].jour) || (a - b));
  const accordees = [], res = [];
  for (const k of ordre) {
    const d = jeu.demandes[k];
    if (d.nuits.some((i) => NUITS[i].pic)) res[k] = 'refuser';
    else if (jeu.equipe[d.agent].caces && accordees.some((a) => jeu.equipe[a.agent].caces && a.nuits.some((i) => d.nuits.includes(i)))) res[k] = 'decaler';
    else { res[k] = 'accorder'; accordees.push(d); }
  }
  return res;
}
// Le rang (0 à 2) de la demande qui doit recevoir la décision `d`.
export const rangDe = (jeu, decision) => decisionsJustes(jeu).indexOf(decision);
// Les absents de chaque nuit d'après des décisions `choix` (alignées sur `jeu.demandes`) : seul « accorder » fait partir l'agent.
export const absentsDe = (jeu, choix) => Array.from({ length: NB_NUITS }, (_, i) => jeu.demandes.filter((d, k) => choix[k] === 'accorder' && d.nuits.includes(i)).length);
// Les renforts à prévoir chaque nuit d'après les décisions de l'élève : le besoin moins les agents présents, jamais moins de 0.
export const renfortsAttendus = (jeu, choix) => absentsDe(jeu, choix).map((a, i) => Math.max(0, besoinDe(jeu, i) - (NB_AGENTS - a)));
export const renfortsJustes = (jeu) => renfortsAttendus(jeu, decisionsJustes(jeu));
// L'agent de la demande refusée (celui qui écrit à l'élève) et ses nuits.
export const agentRefuse = (jeu) => jeu.demandes[rangDe(jeu, 'refuser')];
export const nomAgent = (jeu, d) => jeu.equipe[d.agent].nom;
// La date d'une demande : « le 9 novembre ».
export const dateDemande = (d) => `le ${d.jour === 1 ? '1er' : d.jour} novembre`;

// ─────────────────────────────────────────────────────────────── le contrôle d'un jeu
export function ecartsJeu(jeu) {
  const E = [];
  if (!jeu || typeof jeu !== 'object') return ['pas de jeu'];
  if (!Array.isArray(jeu.equipe) || jeu.equipe.length !== NB_AGENTS) return [`il faut ${NB_AGENTS} agents`];
  if (!Array.isArray(jeu.demandes) || jeu.demandes.length !== 3) return ['il faut trois demandes'];
  if (new Set(jeu.equipe.map((a) => a.nom)).size !== NB_AGENTS) E.push('deux agents portent le même prénom');
  if (jeu.equipe.some((a) => !NOMS.includes(a.nom))) E.push('un prénom hors de la banque');
  if (jeu.equipe.filter((a) => a.caces).length !== 2) E.push('il faut exactement deux titulaires du CACES 1');
  if (![5, 6].includes(jeu.b)) E.push(`besoin de base « ${jeu.b} » inconnu`);
  if (![9, 10].includes(jeu.p)) E.push(`besoin de pic « ${jeu.p} » inconnu`);
  if (new Set(jeu.demandes.map((d) => d.agent)).size !== 3) E.push('deux demandes du même agent');
  for (const d of jeu.demandes) {
    if (!jeu.equipe[d.agent]) { E.push('une demande d’un agent inconnu'); continue; }
    if (!Array.isArray(d.nuits) || d.nuits.length !== 2 || d.nuits[1] !== d.nuits[0] + 1 || d.nuits.some((i) => !NUITS[i])
      || NUITS[d.nuits[0]].semaine !== NUITS[d.nuits[1]].semaine) E.push('une demande doit porter sur deux nuits consécutives de la même semaine');
    if (!(d.jour >= 1 && d.jour <= 28)) E.push('une demande datée hors de novembre');
  }
  if (E.length) return E;
  const dec = decisionsJustes(jeu);
  const nb = (x) => dec.filter((d) => d === x).length;
  if (nb('accorder') !== 1 || nb('decaler') !== 1 || nb('refuser') !== 1) E.push(`décisions ${dec.join(', ')} : il faut un accord, un décalage, un refus`);
  else {
    const X = jeu.demandes[dec.indexOf('accorder')], Y = jeu.demandes[dec.indexOf('decaler')], Z = jeu.demandes[dec.indexOf('refuser')];
    if (!jeu.equipe[X.agent].caces || !jeu.equipe[Y.agent].caces) E.push('l’accord et le décalage concernent les deux titulaires du CACES 1');
    if (jeu.equipe[Z.agent].caces) E.push('le refus concerne un agent sans CACES 1');
    if (X.nuits.filter((i) => Y.nuits.includes(i)).length !== 1) E.push('les deux titulaires partagent exactement une nuit');
    if (!(X.jour < Y.jour)) E.push('le titulaire accordé doit avoir demandé avant celui qui est décalé');
    if ([...X.nuits, ...Y.nuits].some((i) => NUITS[i].pic)) E.push('un titulaire demande une nuit de pic');
    if (!Z.nuits.some((i) => NUITS[i].pic)) E.push('le refus doit tomber sur au moins une nuit de pic');
    if (Z.nuits.some((i) => X.nuits.includes(i) || Y.nuits.includes(i))) E.push('la demande refusée recouvre une autre demande');
  }
  // Des nuits sous l'effectif même sans congé : toutes les nuits de pic ; et chaque semaine a au moins une nuit à renforcer (l'inaction ne vaut jamais 0 faute).
  const att = renfortsJustes(jeu);
  if (NUITS.filter((n) => n.pic).some((n) => besoinDe(jeu, n.i) <= NB_AGENTS)) E.push('une nuit de pic n’est pas sous l’effectif');
  [0, 1].forEach((s) => { if (!NUITS.some((n) => n.semaine === s && att[n.i] > 0)) E.push(`la semaine ${s + 1} n’a aucun renfort à prévoir`); });
  if (NUITS.some((n) => !n.pic && att[n.i] !== 0)) E.push('une nuit de base demande un renfort');
  return E;
}

// Le jeu de secours (donné si 40 tirages de suite ne passent pas `ecartsJeu` : jamais d'élève sans jeu).
export const SECOURS = {
  equipe: ['Nadia', 'Maxime', 'Julie', 'Thomas', 'Aïcha', 'Kévin', 'Camille', 'Mehdi'].map((nom, k) => ({ nom, caces: k === 1 || k === 4 })),
  b: 5, p: 9,
  demandes: [{ agent: 5, nuits: [10, 11], jour: 15 }, { agent: 1, nuits: [0, 1], jour: 4 }, { agent: 4, nuits: [1, 2], jour: 9 }],
};

const declTirage = {
  tirer(h) {
    for (let i = 0; i < 4; i++) h.reel();   // les premiers tirages de deux graines voisines (« eleve-1 », « eleve-2 ») se ressemblent : on les laisse passer
    const noms = h.prendre(NOMS, NB_AGENTS);
    const [ix, iy, iz] = h.melanger(Array.from({ length: NB_AGENTS }, (_, k) => k));
    const b = h.choisir([5, 6]), p = h.choisir([9, 10]);
    const w = h.choisir([0, 1]), s = h.choisir([0, 1]);
    const nx = [6 * w + s, 6 * w + s + 1];
    const ny = s === 0 ? [6 * w + 1, 6 * w + 2] : [6 * w, 6 * w + 1];
    const wz = h.choisir([0, 1]), o = h.choisir([2, 3, 4]);
    const nz = [6 * wz + o, 6 * wz + o + 1];
    const jx = h.entier(2, 12), jy = jx + h.entier(2, 9), jz = h.entier(1, 26);
    const demandes = h.melanger([{ agent: ix, nuits: nx, jour: jx }, { agent: iy, nuits: ny, jour: jy }, { agent: iz, nuits: nz, jour: jz }]);
    return { equipe: noms.map((nom, k) => ({ nom, caces: k === ix || k === iy })), b, p, demandes };
  },
  verifier: ecartsJeu,
  secours: SECOURS,
};
const memo = new Map();
// Le jeu d'une graine (l'identifiant de l'élève) : le même à chaque appel. Une graine vide (base vide au chargement) a son jeu aussi.
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!memo.has(g)) memo.set(g, tirerJeu(declTirage, `${g}|${ID}|jeu`));
  return memo.get(g).jeu;
}
// Le jeu est-il le jeu de secours (aucun tirage conforme) ? Pour les tests : zéro secours sur 300 graines.
export const jeuDeSecours = (graine) => { jeuDe(graine); return memo.get(String(graine == null ? '' : graine)).secours; };
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));

// ─────────────────────────────────────────────────────────────── les choix des fiches (les MÊMES pour tous les élèves)
export const CHOIX_CONGE = [
  { v: 'refuser', lib: 'Refuser le congé' },
  { v: 'accorder', lib: 'Accorder le congé aux nuits demandées' },
  { v: 'decaler', lib: 'Décaler le congé à d’autres nuits' },
];
export const nombres = (max) => Array.from({ length: max + 1 }, (_, i) => ({ v: String(i), lib: String(i) }));
export const MAX_RENFORTS_LISTE = 6;
export const champConge = (rang) => `conge-${rang + 1}`;
export const champRenforts = (i) => `renforts-${i}`;

// ─────────────────────────────────────────────────────────────── l'équipe (univers commun) sous la forme que lisent les questions et la messagerie
export const EQUIPE = Object.fromEntries(Object.entries(EQUIPE_MR).map(([id, p]) => [id, { nom: p.prenom, role: p.poste, appel: p.prenom, registre: 'tu' }]));
export const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;
