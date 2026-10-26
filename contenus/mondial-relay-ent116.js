// ENT-11.6 — Mondial Relay, « évaluation : les renforts de décembre » : le contenu de la séance (brief `docs/briefs/ENT-11.6-mondial-relay-evaluation-renforts.md`,
// cadrage `docs/briefs/mondial-relay/CADRAGE-S3-mondial-relay.md`, choix tranchés le 26/10/2026 : `docs/briefs/mondial-relay/A-TRANCHER.md`). Univers commun :
// `contenus/mondial-relay.js` (lu, jamais modifié). Données pures (le jeu tiré, les décisions et les renforts qui s'en calculent) :
// `contenus/mondial-relay-ent116-donnees.js`. Activité : `activites/mondial-relay-evaluation-renforts.js`. Questions : `contenus/questions/ENT-11.6.js`.
// Corrigé : `contenus/corriges/ENT-11.6.js`.
//
// Jeudi 26 novembre (aucune année écrite), 2de, poste A (gestion : AGOrA), ÉVALUATION d'AGO-3.2 (planifier présences et congés) et d'AGO-3.1 (procédures d'entrée,
// contrats), en copie rendue (`copie: true`), sans aide. Rien ne remonte pendant le travail, une seule remise (« Rendre ma copie » du bandeau), note figée ; aucun bilan,
// aucun « Corriger », aucun mot cliquable, rien à l'écran ne dit juste ou faux (Hélène ne reprend jamais ce que l'élève a décidé ou écrit).
//   Avant de commencer (noté, 4 points) → ① Le planning des nuits du 7 au 19 décembre (fiche : une décision par demande de congé, puis les renforts à prévoir nuit
//   par nuit) → ② La demande de recrutement des renforts (fiche : poste, contrat, dates, horaires, ce qu'on écrit dans l'offre) → ③ La réponse à l'agent dont le
//   congé est refusé (phrases à choisir) → Rendre ma copie.
//
// DÉCISION DE TRISTAN (26/10/2026, règle 15 du 05/10/2026) : les renforts se font en CDD SAISONNIER (noté) ; l'INTÉRIM n'apparaît que dans une question de réflexion NON
// NOTÉE (il n'a jamais été travaillé en 2de). La « demande de mission à l'agence d'intérim » du brief est donc une DEMANDE DE RECRUTEMENT EN CDD SAISONNIER.
//
// ÉCART AU BRIEF (moteur) : un `planning` est une déclaration FIXE (ses cartes et ses lignes ne se calculent pas sur la base de l'élève : `activites/FICHE-SEANCE.md`,
// « Pièges »). La décision du 03/10/2026 veut un jeu TIRÉ par élève : le planning des nuits est donc une fiche (`blocs(db)` est une fonction de la base) et des
// documents (`html(db)`). Demande au moteur (planning tiré par élève) : brief §7. Le jeu est un contenu, pas une vue.
//
// VÉRIFIÉ / CONSTRUIT : voir l'en-tête de `contenus/mondial-relay.js` et de `contenus/mondial-relay-ent116-donnees.js`. Tous les documents portent le pied imposé (`PIED`).

import { apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-11.6.js';
import { catalogueSimple } from './entreprise-commun.js';
import { MENTION as MENTION_MR } from './mondial-relay.js';
import {
  ID, ID_VOLET, FICHES, PHRASES_ID, NB_AGENTS, NUITS, SEMAINES, nuitsTexte, slug, besoinDe, decisionsJustes, rangDe, renfortsAttendus, agentRefuse, nomAgent,
  dateDemande, jeuDeBase, CHOIX_CONGE, nombres, MAX_RENFORTS_LISTE, champConge, champRenforts, EQUIPE, mailDe,
} from './mondial-relay-ent116-donnees.js';

export { ID, ID_VOLET, FICHES, PHRASES_ID, EQUIPE } from './mondial-relay-ent116-donnees.js';

// ─────────────────────────────────────────────────────────────── ce que le moteur exige (aucun article en jeu)
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return {
    v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
    customers: [], suppliers: [], seq: 1, _depart: [],
  };
}

// ─────────────────────────────────────────────────────────────── l'heure du scénario : jeudi 26 novembre (jamais écrit dans un message)
export const JOUR = 26;
export function heureScenario(jour, hhmm, { db, volet, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && volet && db.volets[volet]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(2026, 10, jour, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
// Les trois décisions de l'élève, alignées sur ses trois demandes.
export const choixConges = (db) => [0, 1, 2].map((k) => valeurDe(db, FICHES.planning, champConge(k)));
export const renfortsDeLEleve = (db) => renfortsAttendus(jeuDeBase(db), choixConges(db));
const reponduAgent = (db) => phrasesJustes(db, PHRASES_ID).envoye;

// ─────────────────────────────────────────────────────────────── les documents (construits ; pied imposé)
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const PIED = 'Document pédagogique — reconstitution, non contractuel. L’équipe, les besoins, les demandes et les règles sont construits pour l’exercice.';
const pied = (texte = PIED) => `<p class="mr6-pied">${ech(texte)}</p>`;
const entete = (qui, refs = []) => `<div class="mr6-entete"><b>${ech(qui)}</b><span>${refs.map(ech).join('<br>')}</span></div>`;

// Le planning des nuits DE CET élève : le besoin de chaque nuit, les agents en CDI, et l'équipe (qui a le CACES 1).
export const DOC_PLANNING = { id: 'planning-116', titre: 'Planning des nuits de tri — du 7 au 19 décembre', court: 'Planning des nuits',
  html: (db) => { const jeu = jeuDeBase(db); return `<article class="mr6-doc" aria-label="Planning des nuits de tri du 7 au 19 décembre">
    ${entete('Planning des nuits de tri', ['Du 7 au 19 décembre', 'Hub de Buchères · équipe de nuit de Romain', 'Nuit de 22 h à 5 h'])}
    <table class="mr6-tab mr6-nuits">
      <thead><tr><th rowspan="2" scope="col"></th>${SEMAINES.map((s) => `<th colspan="6" scope="colgroup">${ech(s.court)}</th>`).join('')}</tr>
        <tr>${NUITS.map((n) => `<th scope="col">${ech(n.court)}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><th scope="row">Nuit de pic</th>${NUITS.map((n) => `<td>${n.pic ? 'pic' : ''}</td>`).join('')}</tr>
        <tr><th scope="row">Besoin</th>${NUITS.map((n) => `<td class="mr6-nb">${besoinDe(jeu, n.i)}</td>`).join('')}</tr>
        <tr><th scope="row">Agents en CDI</th>${NUITS.map(() => `<td class="mr6-nb">${NB_AGENTS}</td>`).join('')}</tr>
      </tbody>
    </table>
    <p class="mr6-st">Le besoin est le nombre de personnes qui doivent travailler au tri cette nuit-là. Du jeudi au samedi, c’est le pic. Le hub travaille du lundi au samedi.</p>
    <p class="mr6-t2">L’équipe de nuit en CDI</p>
    <table class="mr6-tab mr6-equipe">
      <thead><tr><th scope="col">Agent</th><th scope="col">CACES 1 (chargeur)</th></tr></thead>
      <tbody>${jeu.equipe.map((a) => `<tr><td>${ech(a.nom)}</td><td>${a.caces ? 'oui' : 'non'}</td></tr>`).join('')}</tbody>
    </table>
    ${pied()}
  </article>`; } };
// Les demandes de congé DE CET élève, dans l'ordre tiré.
export const DOC_DEMANDES = { id: 'demandes-116', titre: 'Les demandes de congé de décembre', court: 'Demandes de congé',
  html: (db) => { const jeu = jeuDeBase(db); return `<article class="mr6-doc" aria-label="Les demandes de congé de décembre">
    ${entete('Demandes de congé', ['Équipe de nuit', 'Décembre'])}
    <table class="mr6-tab">
      <thead><tr><th scope="col">Agent</th><th scope="col">Nuits demandées</th><th scope="col">Demandé</th></tr></thead>
      <tbody>${jeu.demandes.map((d) => `<tr><td>${ech(nomAgent(jeu, d))}</td><td>${ech(nuitsTexte(d.nuits))}</td><td>${ech(dateDemande(d))}</td></tr>`).join('')}</tbody>
    </table>
    <p class="mr6-st">Chaque demande porte sur deux nuits de suite.</p>
    ${pied()}
  </article>`; } };
// Les règles du planning de nuit (construites), les mêmes pour tous.
export const DOC_REGLES = { id: 'regles-116', titre: 'Les règles du planning de nuit', court: 'Les règles du planning',
  html: `<article class="mr6-doc" aria-label="Les règles du planning de nuit">
    ${entete('Les règles du planning de nuit', ['Ressources humaines · hub de Buchères'])}
    <ol class="mr6-ol">
      <li><b>Le besoin.</b> Chaque nuit, il faut au moins le nombre de personnes de la ligne « Besoin ». Les agents en CDI sont 8 ; s’ils ne suffisent pas, on engage des
        <b>renforts</b>, ni plus ni moins que nécessaire.</li>
      <li><b>Le pic.</b> Du jeudi au samedi, toute l’équipe est nécessaire : <b>pas de congé</b>. Une demande qui tombe sur l’une de ces nuits est <b>refusée</b>.</li>
      <li><b>Le chargeur.</b> Chaque nuit, il faut au moins un chargeur titulaire du <b>CACES 1</b>. Les renforts n’ont pas ce CACES. Deux titulaires ne peuvent pas
        être en congé la même nuit : la demande la <b>plus ancienne</b> garde ses nuits, l’autre est <b>décalée</b> (on lui proposera d’autres nuits).</li>
      <li><b>Sinon</b>, la demande est <b>accordée</b>.</li>
    </ol>
    <p class="mr6-st">Refuser, c’est dire non. Décaler, c’est dire oui à d’autres nuits. Un agent en congé n’est pas au travail ces nuits-là.</p>
    ${pied()}
  </article>` };
// « Qui est qui au hub » (écran « Avant de commencer » seulement).
export const DOC_ORGANIGRAMME = { id: 'organigramme-116', titre: 'Qui est qui au hub de Buchères', court: 'Qui est qui ?',
  html: `<article class="mr6-doc" aria-label="Qui est qui au hub de Buchères">
    ${entete('Qui est qui au hub de Buchères', ['Équipe construite pour l’exercice'])}
    <ul class="mr6-cartes">
      <li><b>Hélène</b><span>Responsable des ressources humaines du hub</span><p>Elle décide des congés, des recrutements et des contrats. Tu travailles avec elle : tu prépares les dossiers et tu informes les agents.</p></li>
      <li><b>Romain</b><span>Chef d’équipe du tri (nuit)</span><p>Il dirige l’équipe de nuit au quotidien et dit combien de personnes il lui faut, nuit par nuit.</p></li>
      <li><b>Samia</b><span>Responsable d’exploitation de l’agence</span><p>Elle organise les tournées de l’agence.</p></li>
      <li><b>Claire</b><span>Responsable du service client</span><p>Elle dirige les conseillers qui répondent aux clients.</p></li>
    </ul>
    ${pied()}
  </article>` };
// Le droit (écran « Avant de commencer » seulement) : les articles d'ENT-6.3, relus le 10/10/2026 sur code.travail.gouv.fr (reprise de Légifrance).
const art = (num, texte) => `<p class="mr6-st" style="margin-top:14px">Code du travail, article ${num}</p>${texte}`;
export const DOC_DROIT = { id: 'droit-116', titre: 'Le droit : les congés et l’essai d’un CDD', court: 'Le droit',
  html: `<article class="mr6-doc" aria-label="Le droit : les congés et l’essai d’un CDD">
    <p class="mr6-t">Le droit : les congés et l’essai d’un CDD</p>
    ${art('L3141-3', '<p>« Le salarié a droit à un congé de deux jours et demi ouvrables par mois de travail effectif chez le même employeur.</p>'
      + '<p>La durée totale du congé exigible ne peut excéder trente jours ouvrables. »</p>')}
    ${art('L3141-17', '<p>« La durée des congés pouvant être pris en une seule fois ne peut excéder vingt-quatre jours ouvrables. Il peut être dérogé '
      + 'individuellement à cette limite pour les salariés qui justifient de contraintes géographiques particulières ou de la présence au sein du '
      + 'foyer d’un enfant ou d’un adulte handicapé ou d’une personne âgée en perte d’autonomie. »</p>')}
    ${art('L1242-10 (extrait)', '<p>« Le contrat de travail à durée déterminée peut comporter une période d’essai.</p><p>Sauf si des usages ou des '
      + 'stipulations conventionnelles prévoient des durées moindres, cette période d’essai ne peut excéder une durée calculée à raison d’un jour '
      + 'par semaine, dans la limite de deux semaines lorsque la durée initialement prévue au contrat est au plus égale à six mois et d’un mois '
      + 'dans les autres cas. […] »</p>')}
    <p class="mr6-pied">Texte de loi (réel) — source : Légifrance</p>
  </article>` };
export const DOCUMENTS = [DOC_PLANNING, DOC_DEMANDES, DOC_REGLES, DOC_ORGANIGRAMME, DOC_DROIT];
const PIECES_DEPART = [DOC_PLANNING.id, DOC_DEMANDES.id, DOC_REGLES.id];

export const STYLE = `
--douce:#555047;
.mr6-doc{padding:14px 18px 0}
.mr6-doc p{margin:0 0 8px}
.mr6-t{margin:0; font-size:1.08rem; font-weight:800}
.mr6-t2{margin:12px 0 4px; font-size:.95rem; font-weight:800}
.mr6-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.mr6-entete{display:flex; justify-content:space-between; align-items:baseline; gap:8px; border-bottom:2px solid var(--encre); padding-bottom:6px; margin-bottom:8px}
.mr6-entete b{font-size:1.02rem}
.mr6-entete span{font-size:.78rem; color:var(--douce); text-align:right}
.mr6-tab{width:100%; border-collapse:collapse; margin:4px 0 8px; font-size:.88rem}
.mr6-tab th,.mr6-tab td{border:1px solid #cfc8ba; padding:4px 6px; text-align:left; vertical-align:top}
.mr6-tab th{font-size:.8rem}
.mr6-nuits th,.mr6-nuits td{text-align:center; padding:3px 2px; font-size:.78rem}
.mr6-nuits th[scope="row"]{text-align:left; white-space:nowrap; padding:3px 6px}
.mr6-nb{font-weight:800}
.mr6-equipe{width:auto; min-width:60%}
.mr6-ol{margin:6px 0 0; padding-left:20px; font-size:.92rem}
.mr6-ol li{margin:6px 0}
.mr6-cartes{list-style:none; margin:6px 0 4px; padding:0; display:grid; grid-template-columns:1fr 1fr; gap:10px}
.mr6-cartes li{border:1.5px solid #cfc8ba; border-radius:6px; padding:8px 10px}
.mr6-cartes b{display:block; font-size:1rem}
.mr6-cartes span{display:block; font-size:.82rem; color:var(--douce)}
.mr6-cartes p{margin:4px 0 0; font-size:.88rem; line-height:1.35}
.mr6-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────────────────────────── ① la fiche « Planning des nuits » (trois décisions, douze lignes de renforts)
// Les MÊMES blocs (mêmes ids, mêmes choix) pour tous les élèves : seule l'identité des trois demandes (libellés) suit le jeu. Les choix de renfort vont de 0 à 6 pour tous.
export const FICHE_PLANNING = {
  id: FICHES.planning, libelle: 'Planning des nuits', titre: 'Planning des nuits de tri — du 7 au 19 décembre',
  sousTitre: 'Lis le planning, les demandes et les règles, à gauche. Décide des trois congés, puis prévois les renforts de chaque nuit.',
  documents: PIECES_DEPART,
  bouton: 'Ouvrir le planning des nuits',
  defile: true,
  blocs: (db) => {
    const jeu = jeuDeBase(db);
    return [
      { type: 'cadre', titre: '1. Les trois demandes de congé', consigne: 'Pour chaque demande, applique les règles : accorder, décaler ou refuser.', large: true,
        blocs: jeu.demandes.map((d, k) => ({ type: 'liste', id: champConge(k), lib: `${nomAgent(jeu, d)} — ${nuitsTexte(d.nuits)}`, vide: 'Choisir…',
          manque: `la décision pour ${nomAgent(jeu, d)}`, choix: CHOIX_CONGE })) },
      ...SEMAINES.map((s, w) => ({ type: 'cadre', titre: `${w + 2}. Les renforts à prévoir — ${s.lib}`, large: true,
        consigne: w === 0 ? 'Pour chaque nuit, le nombre de renforts à engager (0 si l’équipe suffit), compte tenu de tes décisions : ni plus ni moins que nécessaire.' : undefined,
        blocs: NUITS.filter((n) => n.semaine === w).map((n) => ({ type: 'liste', id: champRenforts(n.i), lib: n.lib, vide: 'Choisir…',
          manque: `les renforts du ${n.lib}`, choix: nombres(MAX_RENFORTS_LISTE) })) })),
    ];
  },
  envoi: { bouton: 'Envoyer le planning à Hélène', a: 'Hélène', suite: 'Hélène te répond dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── ② la fiche « Demande de recrutement » (CDD saisonnier)
// Les listes ont le même ordre pour tous, écrit à la main, la juste à une place différente d'une liste à l'autre.
export const CHOIX_POSTE = [{ v: 'conseiller', lib: 'Conseiller(ère) au service client (H/F)' }, { v: 'tri', lib: 'Agent de tri de nuit (H/F)' }, { v: 'chargeur', lib: 'Chargeur CACES 1 (H/F)' }];
export const CHOIX_CONTRAT = [{ v: 'cdi', lib: 'CDI' }, { v: 'stage', lib: 'Stage' }, { v: 'cdd', lib: 'CDD saisonnier' }, { v: 'apprentissage', lib: 'Contrat d’apprentissage' }];
export const CHOIX_MOTIF = [{ v: 'remplacer', lib: 'Remplacer des agents absents' }, { v: 'essai', lib: 'Tester des candidats avant un CDI' },
  { v: 'saison', lib: 'Un travail qui revient chaque fin d’année, pendant le pic' }];
export const CHOIX_DATES = [{ v: 'tot', lib: 'du lundi 7 au samedi 12 décembre' }, { v: 'tard', lib: 'du lundi 14 au samedi 19 décembre' },
  { v: 'juste', lib: 'du jeudi 10 au samedi 19 décembre' }];
export const CHOIX_HORAIRES = [{ v: 'jour', lib: 'de 9 h à 17 h' }, { v: 'nuit', lib: 'de 22 h à 5 h' }, { v: 'matin', lib: 'de 6 h à 14 h' }];
export const ATTENDU = { poste: 'tri', contrat: 'cdd', motif: 'saison', dates: 'juste', horaires: 'nuit' };
// Les mentions : `oui` = à écrire (utile au poste) ; `non` = à ne pas écrire. Ordre écrit à la main, oui et non mêlés.
export const MENTIONS = [
  { id: 'chaussures', lib: 'Chaussures de sécurité obligatoires', oui: true },
  { id: 'age', lib: '« Moins de 30 ans »', oui: false },
  { id: 'porter', lib: 'Porter des colis jusqu’à 30 kg', oui: true },
  { id: 'caces', lib: 'CACES 1 exigé', oui: false },
  { id: 'sexe', lib: '« Homme de préférence »', oui: false },
];
export const FICHE_RECRUTEMENT = {
  id: FICHES.recrutement, libelle: 'Demande de recrutement', titre: 'Demande de recrutement — renforts du pic',
  sousTitre: 'Remplis la demande de recrutement des renforts, puis envoie-la à Hélène.',
  documents: [DOC_PLANNING.id, DOC_REGLES.id],
  bouton: 'Ouvrir la demande de recrutement',
  quand: (db) => envoyee(db, FICHES.planning),
  blocs: [
    { type: 'cadre', titre: '1. Le poste', blocs: [
      { type: 'liste', id: 'poste', lib: 'Intitulé du poste', vide: 'Choisir…', manque: 'l’intitulé du poste', choix: CHOIX_POSTE },
      { type: 'nombre', id: 'nombre', lib: 'Nombre de personnes à recruter', unite: 'personnes', min: 1, entier: true, manque: 'le nombre de personnes' },
    ] },
    { type: 'cadre', titre: '2. Le contrat', blocs: [
      { type: 'choix', id: 'contrat', lib: 'Contrat', manque: 'le contrat', choix: CHOIX_CONTRAT },
      { type: 'liste', id: 'motif', lib: 'Pourquoi ce contrat ?', vide: 'Choisir…', manque: 'pourquoi ce contrat', choix: CHOIX_MOTIF },
    ] },
    { type: 'cadre', titre: '3. Les dates et les horaires', blocs: [
      { type: 'liste', id: 'dates', lib: 'Dates du contrat', vide: 'Choisir…', manque: 'les dates', choix: CHOIX_DATES },
      { type: 'liste', id: 'horaires', lib: 'Horaires', vide: 'Choisir…', manque: 'les horaires', choix: CHOIX_HORAIRES },
    ] },
    { type: 'cadre', titre: '4. À écrire dans l’offre ?', consigne: 'Pour chaque mention : oui si elle va dans l’offre, non sinon.',
      blocs: [{ type: 'ouinon', id: 'mentions', entete: 'Mention', manque: '{n} mention(s) sans réponse',
        colonnes: [{ id: 'ecrire', lib: 'À écrire ?' }], lignes: MENTIONS.map((m) => ({ id: m.id, lib: m.lib })) }] },
  ],
  pied: 'Demande de recrutement — document pédagogique, reconstitution, non contractuel',
  envoi: { bouton: 'Envoyer la demande à Hélène', a: 'Hélène', suite: 'Merci, c’est noté.' },
};

// ─────────────────────────────────────────────────────────────── ③ la réponse à l'agent dont le congé est refusé (phrases à choisir, au tu)
// L'agent écrit toujours : c'est celui de la demande qui doit être refusée d'après les règles (les phrases sont donc les mêmes pour tous, calculées de SON jeu).
export const phrasesReponse = (prenom, db) => {
  const jeu = jeuDeBase(db), z = agentRefuse(jeu), nom = nomAgent(jeu, z), nuits = nuitsTexte(z.nuits);
  const nuitPic = z.nuits.map((i) => NUITS[i]).find((n) => n.pic);
  return { id: PHRASES_ID, melanger: true, lignes: [
    { id: 'salutation', choix: [`Bonjour ${nom},`, 'Yo !', 'Coucou !'], juste: 0 },
    { id: 'decision', choix: [`Ta demande de congé pour les nuits ${nuits} ne peut pas être accordée.`, `Ta demande de congé pour les nuits ${nuits} est accordée.`,
      `Ta demande de congé pour les nuits ${nuits} est annulée.`], juste: 0 },
    { id: 'raison', choix: [`La nuit du ${nuitPic.lib} est une nuit de pic : pendant le pic, il n’y a pas de congé, toute l’équipe est nécessaire.`,
      'Romain ne veut pas que tu partes.', 'Tu as déjà eu trop de congés cette année.'], juste: 0 },
    { id: 'fin', choix: [`Je reste à ta disposition. Cordialement, ${prenom}, pour Hélène`, 'Désolé !', 'Bisous'], juste: 0 },
  ] };
};

// ─────────────────────────────────────────────────────────────── les messages (au tu ; jeudi 26 novembre, jamais écrit ; jamais juste ni faux)
const HELENE = { nom: EQUIPE.helene.nom, mail: mailDe('helene') };
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOUR, o.heure || '08:30', { db: o.db, volet: ID_VOLET, decalage: o.decalage || 0 }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJETS = { debut: 'Le pic de décembre : les nuits de tri', recu: 'Planning reçu', agent: 'Mon congé de décembre', fin: 'Merci' };
export const agentDe = (db) => { const jeu = jeuDeBase(db); return nomAgent(jeu, agentRefuse(jeu)); };

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, HELENE, SUJETS.debut,
      `Bonjour ${prenom},\n\nLe pic de fin d’année commence : au tri de nuit, Romain a besoin de monde du lundi 7 au samedi 19 décembre. Tu trouveras en pièces jointes `
        + 'le planning des nuits (le besoin de chaque nuit), les demandes de congé des agents et les règles que nous appliquons.\n\n'
        + 'Prépare le planning : dis-moi ce qu’on fait de chaque demande de congé, puis combien de renforts il faut chaque nuit. Ensuite, tu me feras la demande de '
        + 'recrutement de ces renforts, avec le contrat qui convient.\n\nHélène',
      { db, extra: { pieces: PIECES_DEPART, ouvreFiche: FICHES.planning } }),
  ] }),
  declencheurs: [
    // Le planning envoyé : Hélène l'accuse (sans dire s'il est juste), la demande de recrutement s'ouvre, et l'agent dont le congé doit être refusé écrit.
    { id: 'planning-recu', quand: apresFiche(FICHES.planning),
      semer: (prenom, db) => {
        const jeu = jeuDeBase(db), z = agentRefuse(jeu), nom = nomAgent(jeu, z);
        return { mails: [
          mail(prenom, HELENE, SUJETS.recu,
            `Merci ${prenom}, j’ai bien reçu ton planning.\n\nDeux choses maintenant : la demande de recrutement des renforts (menu « Demande de recrutement »), et ${nom}, `
              + 'qui m’a écrit à propos de son congé : réponds-lui.\n\nHélène', { db, decalage: 2, extra: { ouvreFiche: FICHES.recrutement } }),
          mail(prenom, { nom, mail: mailDe(slug(nom)) }, SUJETS.agent,
            `Bonjour ${prenom},\n\nJ’ai demandé un congé pour les nuits ${nuitsTexte(z.nuits)}. C’est bon ?\n\n${nom}`,
            { db, decalage: 3, extra: { cle: 'agent', phrases: phrasesReponse(prenom, db) } }),
        ] };
      } },
    // La réponse à l'agent : la fin, neutre (Hélène ne reprend pas ce que l'élève a écrit), et la remise.
    { id: 'fin', quand: reponduAgent,
      semer: (prenom, db) => ({ mails: [mail(prenom, HELENE, SUJETS.fin,
        `Merci ${prenom}.\n\nQuand tu as tout envoyé, clique sur « Rendre ma copie », en haut de l’écran.\n\nHélène`, { db, decalage: 5 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 d'« Avant de commencer » = 20)
// Nuits couvertes 4 (2 par semaine) · congés 3 (1 par demande) · contrat des renforts 3 (poste 0,5 ; contrat 1,5 ; pourquoi 1) · demande de recrutement 3 (nombre 0,5 ;
// dates 0,75 ; horaires 0,5 ; cinq mentions 0,25) · réponse à l'agent 2 (décision 1 ; raison 1) · ton 1 (salutation 0,5 ; fin 0,5). Poids du brief §5, tranchés par Tristan le
// 26/10/2026 (« tout ce que proposent les briefs est accepté »). Rien n'est vrai avant un envoi : l'inaction vaut 0. Les renforts sont jugés sur les décisions DE L'ÉLÈVE
// (une erreur de congé ne se paie qu'une fois), exacts nuit par nuit (renforcer toutes les nuits au maximum ne rapporte rien).
export const GROUPES = { nuits: 'Les nuits couvertes', conges: 'Les congés', contrat: 'Le contrat des renforts', demande: 'La demande de recrutement',
  reponse: 'Répondre à l’agent', ton: 'Le ton' };
export const ECRAN = { planning: `fiche:${FICHES.planning}`, recrutement: `fiche:${FICHES.recrutement}`, phrases: `phrases:${PHRASES_ID}` };
const juge = (db, ficheId, champ, juste) => (!envoyee(db, ficheId) ? attente : valeurDe(db, ficheId, champ) === juste ? ok : ko);
// Les six nuits d'une semaine : les renforts de l'élève égalent le besoin moins les présents, d'après SES décisions.
const jalonNuits = (w, poids) => ({ id: `nuits-semaine-${w + 1}`, titre: `Les nuits couvertes : ${SEMAINES[w].lib}`, groupe: GROUPES.nuits, poids, ecran: ECRAN.planning,
  verifier(db) {
    if (!envoyee(db, FICHES.planning)) return attente;
    const att = renfortsDeLEleve(db);
    return NUITS.filter((n) => n.semaine === w).every((n) => String(att[n.i]) === String(valeurDe(db, FICHES.planning, champRenforts(n.i)))) ? ok : ko;
  } });
// Le congé qui doit recevoir la décision `d` : sa ligne (le rang change d'un élève à l'autre, l'id du jalon non).
const jalonConge = (d, titre) => ({ id: `conge-${d}`, titre, groupe: GROUPES.conges, poids: 1, ecran: ECRAN.planning,
  verifier(db) {
    if (!envoyee(db, FICHES.planning)) return attente;
    const rang = rangDe(jeuDeBase(db), d);
    return valeurDe(db, FICHES.planning, champConge(rang)) === d ? ok : ko;
  } });
// Le nombre de personnes à recruter : le plus grand nombre de renforts prévu une nuit (jamais 0 : l'inaction ne rapporte pas).
const nombreJuste = (db) => Math.max(0, ...renfortsDeLEleve(db));
const lireEntier = (x) => { const n = Number(String(x == null ? '' : x).replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) && String(x).trim() !== '' ? n : NaN; };
const jalonMention = (m) => ({ id: `mention-${m.id}`, titre: `La demande : « ${m.lib} » — ${m.oui ? 'à écrire' : 'à ne pas écrire'}`, groupe: GROUPES.demande, poids: 0.25, ecran: ECRAN.recrutement,
  verifier(db) {
    if (!envoyee(db, FICHES.recrutement)) return attente;
    const v = valeurDe(db, FICHES.recrutement, 'mentions');
    return !!(v && v[m.id]) && v[m.id].ecrire === m.oui ? ok : ko;
  } });
const lignePhrases = (id, ligne, titre, groupe, poids) => ({ id, titre, groupe, poids, ecran: ECRAN.phrases,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return r.justes.includes(ligne) ? ok : ko; } });

export const ETAPES = [
  jalonNuits(0, 2),
  jalonNuits(1, 2),
  jalonConge('accorder', 'Les congés : la demande à accorder'),
  jalonConge('decaler', 'Les congés : la demande à décaler'),
  jalonConge('refuser', 'Les congés : la demande à refuser'),
  { id: 'contrat-poste', titre: 'Le contrat des renforts : l’intitulé du poste', groupe: GROUPES.contrat, poids: 0.5, ecran: ECRAN.recrutement,
    verifier: (db) => juge(db, FICHES.recrutement, 'poste', ATTENDU.poste) },
  { id: 'contrat-type', titre: 'Le contrat des renforts : le contrat', groupe: GROUPES.contrat, poids: 1.5, ecran: ECRAN.recrutement,
    verifier: (db) => juge(db, FICHES.recrutement, 'contrat', ATTENDU.contrat) },
  { id: 'contrat-motif', titre: 'Le contrat des renforts : pourquoi ce contrat', groupe: GROUPES.contrat, poids: 1, ecran: ECRAN.recrutement,
    verifier: (db) => juge(db, FICHES.recrutement, 'motif', ATTENDU.motif) },
  { id: 'demande-nombre', titre: 'La demande : le nombre de personnes', groupe: GROUPES.demande, poids: 0.5, ecran: ECRAN.recrutement,
    verifier(db) {
      if (!envoyee(db, FICHES.recrutement)) return attente;
      if (!envoyee(db, FICHES.planning)) return ko;
      const attendu = nombreJuste(db);
      return attendu >= 1 && lireEntier(valeurDe(db, FICHES.recrutement, 'nombre')) === attendu ? ok : ko;
    } },
  { id: 'demande-dates', titre: 'La demande : les dates du contrat', groupe: GROUPES.demande, poids: 0.75, ecran: ECRAN.recrutement,
    verifier: (db) => juge(db, FICHES.recrutement, 'dates', ATTENDU.dates) },
  { id: 'demande-horaires', titre: 'La demande : les horaires de nuit', groupe: GROUPES.demande, poids: 0.5, ecran: ECRAN.recrutement,
    verifier: (db) => juge(db, FICHES.recrutement, 'horaires', ATTENDU.horaires) },
  ...MENTIONS.map(jalonMention),
  lignePhrases('reponse-decision', 'decision', 'Répondre à l’agent : la décision', GROUPES.reponse, 1),
  lignePhrases('reponse-raison', 'raison', 'Répondre à l’agent : la raison', GROUPES.reponse, 1),
  lignePhrases('reponse-salutation', 'salutation', 'Répondre à l’agent : la salutation', GROUPES.ton, 0.5),
  lignePhrases('reponse-fin', 'fin', 'Répondre à l’agent : la formule de fin', GROUPES.ton, 0.5),
];

// ─────────────────────────────────────────────────────────────── pastilles, ordre des écrans, accueil, options
export const PASTILLES = [
  { libelle: 'Planning', fait: (db) => envoyee(db, FICHES.planning) },
  { libelle: 'Recrutement', fait: (db) => envoyee(db, FICHES.recrutement) },
  { libelle: 'Réponse', fait: reponduAgent },
];
export const SUITE = [
  { vue: 'fiche', libelle: 'Planning des nuits', fait: (db) => envoyee(db, FICHES.planning) },
  { vue: `fiche:${FICHES.recrutement}`, libelle: 'Demande de recrutement', fait: (db) => envoyee(db, FICHES.recrutement) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Répondre à l’agent', fait: reponduAgent },
];
export const MENTION = `${MENTION_MR} Pour cette séance : l’équipe de nuit, les besoins de chaque nuit, les demandes de congé, les règles du planning de nuit et les horaires `
  + 'de nuit (de 22 h à 5 h, non vérifiés) sont construits.';
export const ACCUEIL = {
  titre: 'Évaluation : les renforts de décembre',
  kpis: ['mail'],
  etapes: [
    ['Lire le message d’Hélène', 'Menu Messagerie : le planning des nuits, les demandes de congé et les règles sont joints.'],
    ['① Le planning des nuits', 'Décide des trois demandes de congé, puis prévois les renforts de chaque nuit. Envoie le planning.'],
    ['② La demande de recrutement', 'Remplis la demande de recrutement des renforts, puis envoie-la à Hélène.'],
    ['③ Répondre à l’agent', 'Un agent t’écrit à propos de son congé : réponds-lui, une phrase par ligne.'],
    ['Rendre ma copie', 'Quand tu as tout envoyé, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : les renforts de décembre',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  equipe: EQUIPE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_PLANNING, FICHE_RECRUTEMENT],
  suite: SUITE,
  pastilles: PASTILLES,
  tirage: true,   // jeu tiré par élève sans quai ni inventaire : le moteur pose la graine (l'identifiant de l'élève) AVANT le volet
  questions: QUESTIONS,
};
