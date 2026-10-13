// ENT-7.1 — Decathlon, « ton premier conteneur » : le contenu de la séance (brief `docs/briefs/ENT-7.1-decathlon-choisir-transporteur.md`).
// Données pures (conteneur, offres, tirage, attendus) : `contenus/decathlon-ent71-donnees.js`. Univers commun : `contenus/decathlon.js`.
// Activité : `activites/decathlon-choix-transporteur.js`. Questions : `contenus/questions/ENT-7.1.js`. Corrigé : `contenus/corriges/ENT-7.1.js`.
//
// Lundi 25 janvier 2027, 8 h 30 : l'élève, alternant au service transport amont de l'entrepôt de Rouvignies (tutrice : Claire Vasseur),
// en GUIDAGE de C2.6.1, choisit le transporteur d'un conteneur dédouané à Anvers :
//   ① lit le besoin dans le cahier des charges (date limite, budget, critère) ;
//   ② trie les offres (dans la liste référencée ? tient la date ?) ;
//   ③ reporte le prix et le CO₂ de chaque devis ;
//   ④ choisit et justifie (« la date d'abord, puis le CO₂ » : la moins chère n'est pas la bonne réponse).
// Rien n'est jugé avant l'envoi ; Claire reprend ce que l'élève a écrit, sans corriger (règle du 10/10/2026).

import { apresFiche } from '../core/declencheurs.js';
import { QUESTIONS } from './questions/ENT-7.1.js';
import { CARTE, EQUIPE, LEXIQUE, mailDe, heureScenario, STYLE_DOCUMENTS, DOC_LISTE, DOC_DECATHLON, DOC_DROIT, DOC_ITINERAIRES, PIED,
  PRESTATAIRES, nomLieu, quand, euros, kg, ech } from './decathlon.js';
import {
  ID, ID_VOLET, SCENARIO, DESTINATION, FICHE, B, COL, DISPO, LIMITE, BUDGET, REFERENCE, CRITERES, CRITERE_JUSTE, JUSTIFS, JUSTIF_JUSTE,
  jeuEleve, fiche, reporte, tri, lireNombre, lireHeure, caseDe, casePrix, caseCO2,
} from './decathlon-ent71-donnees.js';
import { hasard } from '../core/tirage.js';

export { ID, SCENARIO, TIRAGE } from './decathlon-ent71-donnees.js';

const LETTRES = ['a', 'b', 'c', 'd', 'e', 'f'];
const idDevis = (i) => `devis-${LETTRES[i]}`;

// ─────────────────────────────────────────────────────────────── les documents
// Le cahier des charges (Decathlon) : tout ce qu'il faut pour ① Le besoin.
const docCahier = (db) => {
  const J = jeuEleve(db);
  return `<article class="dk-doc" aria-label="Cahier des charges">
    <div class="dk-entete"><b>DECATHLON</b><span>Entrepôt de Rouvignies · transport amont<br>Réf. ${REFERENCE}</span></div>
    <p class="dk-t">[[cahier des charges|Cahier des charges]] — acheminement d’un [[conteneur]]</p>
    <dl class="dk-dl">
      <dt>Conteneur</dt><dd>${ech(J.conteneur)} — [[40 pieds high cube|40’ HC]], poids brut ${kg(J.poids)}</dd>
      <dt>Contenu</dt><dd>Collection printemps : textile, chaussures de running et de randonnée (fabriqués au Vietnam)</dd>
      <dt>Situation</dt><dd>[[dédouané|Dédouané]] à Anvers. [[mise à disposition|Disponible]] au terminal d’Anvers le ${quand(DISPO.iso, DISPO.h, { long: true })}.</dd>
      <dt>Destination</dt><dd>Entrepôt Decathlon de Rouvignies (59), quai de réception</dd>
      <dt>Arrivée au quai</dt><dd><b>Au plus tard le ${quand(LIMITE.iso, LIMITE.h, { long: true })}</b> : la collection est mise en rayon dans les magasins à partir du vendredi.</dd>
      <dt>Budget</dt><dd><b>${euros(BUDGET)} HT</b> au maximum, tout compris (transport, manutention, camion final)</dd>
      <dt>Prestataire</dt><dd>Obligatoirement un [[prestataire référencé]] (liste du transport amont)</dd>
      <dt>Critère de choix</dt><dd>Parmi les offres qui tiennent la date et le budget, retenir <b>celle qui émet le moins de CO₂</b> (engagement de Decathlon :
        −20 % d’émissions du transport en 2026)</dd>
      <dt>Information CO₂</dt><dd>Chaque [[devis]] indique le CO₂ de la prestation, calculé selon la méthode du Code des transports</dd>
    </dl>
    ${PIED('Document reconstitué — document pédagogique Prepalog. Dates, budget et références construits.')}
  </article>`;
};

// L'avis de mise à disposition (terminal d'Anvers, sans nom d'exploitant : reconstitué).
const docAvis = (db) => {
  const J = jeuEleve(db);
  return `<article class="dk-doc" aria-label="Avis de mise à disposition">
    <div class="dk-entete"><b>Port d’Anvers — terminal à conteneurs</b><span>Deurganckdok<br>Avis n° AV-2701-${String(J.valeurs.scelle).slice(-4)}</span></div>
    <p class="dk-t">Avis de [[mise à disposition]]</p>
    <p class="dk-st">Destinataire : Decathlon — entrepôt de Rouvignies (réf. ${REFERENCE})</p>
    <dl class="dk-dl">
      <dt>Conteneur</dt><dd>${ech(J.conteneur)}</dd>
      <dt>Type</dt><dd>[[40 pieds high cube|40’ HC]] (40 pieds, high cube)</dd>
      <dt>[[scellé|Scellé]]</dt><dd>${ech(J.scelle)}</dd>
      <dt>Poids brut</dt><dd>${kg(J.poids)}</dd>
      <dt>Douane</dt><dd>[[dédouané|Dédouané]] le vendredi 22/01/2027</dd>
      <dt>Disponible</dt><dd>à partir du ${quand(DISPO.iso, DISPO.h, { long: true })}, au terminal</dd>
    </dl>
    ${PIED('Document reconstitué — document pédagogique Prepalog. Numéros et dates construits.')}
  </article>`;
};

// Un devis (un par offre, dans l'ordre de l'élève). La ligne « Information CO₂ » encadrée (brief §6.4).
const PIED_CONTARGO = 'Devis reconstitué — document pédagogique Prepalog. Prix, dates et CO₂ construits ; Contargo assure réellement la ligne Anvers ↔ Valenciennes.';
const PIED_FICTIF = 'Devis reconstitué — document pédagogique Prepalog. Prestataire fictif ; prix, dates et CO₂ construits.';
function devisHtml(o) {
  if (!o) return '<article class="dk-doc"><p class="dk-st">Pas de devis à cette place.</p></article>';
  const km = o.troncons.map((s) => `${s.type === 'camion' ? 'camion' : s.type} ${s.km} km`).join(' + ');
  const qui = o.prestataire === 'barge' ? `${ech(o.nom.replace(/ \(.*\)$/, ''))} — ${ech(PRESTATAIRES.barge.service)}` : ech(o.nom.replace(/ \(.*\)$/, ''));
  return `<article class="dk-doc" aria-label="Devis ${ech(o.devis)}">
    <div class="dk-entete"><b>${qui}</b><span>${ech(o.ville || 'Transport — Benelux et nord de la France')}<br>${ech(o.mail)}</span></div>
    <p class="dk-t">[[devis|DEVIS]] n° ${ech(o.devis)} pour Decathlon</p>
    <p class="dk-st">Entrepôt de Rouvignies · votre référence ${REFERENCE}</p>
    <dl class="dk-dl">
      <dt>Trajet</dt><dd>${ech(nomLieu('anvers'))} → ${ech(nomLieu(DESTINATION))}</dd>
      <dt>Mode</dt><dd>${ech(o.modeLib)}</dd>
      <dt>Déroulé</dt><dd>${o.deroule.map(ech).join('<br>')}</dd>
      <dt>Arrivée au quai</dt><dd><b>${quand(o.arrivee.iso, o.arrivee.h, { long: true })}</b></dd>
      <dt>Prix total HT</dt><dd><b>${euros(o.prix)}</b>${o.detailPrix ? ` (${o.detailPrix.map(([l, p]) => `${l} ${euros(p)}`).join(' + ')})` : ''}</dd>
    </dl>
    <p class="dk-co2"><span class="dk-gros">[[information CO₂|Information CO₂]] de la prestation : ${kg(o.co2)} de CO₂</span><br>
      <small>Calcul selon la méthode du Code des transports, sur ${km}.</small></p>
    ${PIED(o.prestataire === 'barge' ? PIED_CONTARGO : PIED_FICTIF)}
  </article>`;
}

export const DOCUMENTS = [
  { id: 'cahier', titre: 'Cahier des charges', court: 'Cahier des charges', html: docCahier },
  DOC_LISTE,
  { id: 'avis', titre: 'Avis de mise à disposition', court: 'Avis de mise à disposition', html: docAvis },
  ...LETTRES.map((l, i) => ({ id: idDevis(i), titre: `Devis ${l.toUpperCase()}`, court: `Devis ${l.toUpperCase()}`,
    html: (db) => devisHtml(jeuEleve(db).offres[i]) })),
  DOC_DECATHLON, DOC_DROIT, DOC_ITINERAIRES,
];
export { STYLE_DOCUMENTS };
// Les devis de l'élève (autant que d'offres reçues : 4 au socle, 6 pour un confirmé).
export const devisDe = (db) => jeuEleve(db).offres.map((o, i) => idDevis(i));

// ─────────────────────────────────────────────────────────────── la fiche « Comparateur d'offres »
const libOffre = (o) => `${o.lettre} — ${o.nom}`;
// La feuille ③ : un bloc CONSTANT (la feuille de calcul garde son état dans l'objet), ses lignes calculées sur le jeu de l'élève.
export function lignesOffres(db) {
  const J = jeuEleve(db);
  const saisie = (attendu) => ({ saisie: true, attendu, tolerance: 0, placeholder: ' ' });
  return [
    { A: 'Devis', B: 'Prix total (€ HT)', C: 'CO₂ (kg)', entete: true },
    ...J.offres.map((o) => ({ A: libOffre(o), B: saisie(o.prix), C: saisie(o.co2) })),
  ];
}
export const BLOC_OFFRES = { type: 'grille', id: B.offres, titre: '③ Comparer : reporte le prix et le CO₂ de chaque devis', lignes: lignesOffres,
  manque: 'des cases du tableau ③ ({n})',
  feuille: { colonnes: ['A', 'B', 'C'], decimales: 0, largeurs: { A: '52%', B: '24%', C: '24%' } } };
// La justification : trois phrases, dans un ordre tiré par élève (rien n'est rangé : recalculé de la graine).
function justifsDe(db) {
  const g = db && db.tirages && db.tirages[ID] && db.tirages[ID].graine;
  return g ? hasard(`${g}|justif`).melanger(JUSTIFS) : JUSTIFS;
}
export const FICHE_CMP = {
  id: FICHE, libelle: 'Comparateur d’offres', titre: 'Comparateur d’offres',
  sousTitre: 'Les documents à gauche : le cahier des charges, la liste référencée, un devis par offre.',
  documents: (db) => ['cahier', 'liste', ...devisDe(db)],
  largeurDocs: 0.9,
  serree: true,
  defile: true,   // cinq blocs, jusqu'à six offres : la fiche défile dans sa colonne, le bouton d'envoi reste visible (choix de Tristan, 13/10/2026)
  bouton: 'Ouvrir le comparateur d’offres',
  blocs: (db) => {
    const J = jeuEleve(db);
    return [
      { type: 'cadre', titre: '① Le besoin', blocs: [
        { type: 'date', id: B.limite, lib: 'Arrivée au quai au plus tard le', manque: 'la date limite' },
        { type: 'heure', id: B.heure, lib: 'à (heure)', manque: 'l’heure limite' },
        { type: 'nombre', id: B.budget, lib: 'Budget maximum', unite: '€ HT', min: 0, entier: true, manque: 'le budget' },
        { type: 'liste', id: B.critere, lib: 'Pour départager les offres qui tiennent la date', vide: 'Choisir…', choix: CRITERES, manque: 'le critère' },
      ] },
      { type: 'ouinon', id: B.tri, titre: '② Trier les offres', entete: 'Devis', manque: 'le tri des offres ({n} case(s))',
        lignes: J.offres.map((o) => ({ id: o.slot, lib: libOffre(o) })),
        colonnes: [{ id: COL.liste, lib: 'Dans la liste référencée ?' }, { id: COL.date, lib: 'Tient la date ?' }] },
      { type: 'encadre', titre: 'Pour trier', texte: 'Une offre hors liste ne peut pas être commandée.\nUne offre qui arrive après la limite est écartée.\n'
        + 'Entre celles qui restent, applique le critère du cahier des charges.' },
      BLOC_OFFRES,
      { type: 'cadre', titre: '④ Ma décision', blocs: [
        { type: 'liste', id: B.retenue, lib: 'Je retiens', vide: 'Choisir une offre…', choix: J.offres.map((o) => ({ v: o.slot, lib: libOffre(o) })), manque: 'l’offre retenue' },
        { type: 'choix', id: B.justif, lib: 'Ma justification', colonne: true, choix: justifsDe(db), manque: 'ta justification' },
      ] },
    ];
  },
  envoi: { bouton: 'Envoyer mon choix à Claire', a: 'Claire', suite: 'Claire te répond dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── les messages
const CLAIRE = { nom: EQUIPE.claire.nom, mail: mailDe('claire') };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

// Ce que Claire reprend de l'envoi : l'offre retenue et les chiffres que L'ÉLÈVE a reportés pour elle (sans corriger).
export function texteMerci(prenom, db) {
  const J = jeuEleve(db), { v } = fiche(db);
  const o = J.offres.find((x) => x.slot === v[B.retenue]);
  if (!o) return `Merci ${prenom}. Je regarde ton choix et je te dis demain qui on commande.\n\nClaire`;
  const brut = (ref) => String(caseDe(v, ref) == null ? '?' : caseDe(v, ref)).trim();
  const r = reporte(J, v, o.slot);
  const prix = Number.isFinite(r.prix) ? euros(r.prix) : `${brut(casePrix(J, o.slot))} €`;
  const c = Number.isFinite(r.co2) ? kg(r.co2) : `${brut(caseCO2(J, o.slot))} kg`;
  return `Merci ${prenom}. Je note : ${o.nom}, ${prix}, ${c} de CO₂. Je regarde et je te dis demain qui on commande.\n\nClaire`;
}

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, CLAIRE, 'Ton premier conteneur',
      `Bonjour ${prenom},\n\nun [[conteneur]] de la collection printemps vient d’être [[dédouané]] à Anvers. Il doit être à notre quai avant la mise en rayon.\n\n`
        + 'Le [[cahier des charges]], notre liste de prestataires référencés et les [[devis]] reçus sont joints. Regarde les trois itinéraires sur la carte, '
        + 'remplis le comparateur et envoie-moi ton choix.\n\nClaire',
      { extra: { pieces: ['cahier', 'liste', ...devisDe(db), 'avis'], ouvreFiche: FICHE } }),
  ] }),
  declencheurs: [
    // Le comparateur envoyé (juste ou faux) : Claire reprend ce que l'élève a écrit, sans dire si c'est juste (la commande : ENT-7.2).
    { id: 'choix-recu', quand: apresFiche(FICHE),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Ton choix', texteMerci(prenom, db), { db, decalage: 3 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (7, pondérés : 17 + 3 de questions = 20)
// Poids validés par Tristan le 13/10/2026 (décision 14, option b du §11 n° 2) : Lire le besoin 3 · Trier 7 · Comparer 4 · Décider 3 ·
// questions 3 (`part`). Rien n'est vrai avant l'envoi : l'inaction vaut 0. Tout attendu est calculé sur le jeu de l'élève.
export const GROUPES = {
  besoin: '① Lire le besoin',
  trier: '② Trier les offres',
  comparer: '③ Comparer',
  decider: '④ Décider',
};
export const POIDS = { 'besoin-date': 1.5, 'besoin-budget': 1.5, 'tri-liste': 3, 'tri-date': 4, comparer: 4, 'decision-offre': 2, 'decision-justif': 1 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = { status: 'ko' };
const jalon = (id, groupe, titre, juste) => ({ id, titre, groupe: GROUPES[groupe], poids: POIDS[id], ecran: 'fiche',
  verifier(db) { const f = fiche(db); return f.envoye ? (juste(f.v, jeuEleve(db)) ? ok : ko) : attente; } });
const refs = (J) => J.offres.filter((o) => ['route', 'barge', 'rail'].includes(o.slot));

export const ETAPES = [
  jalon('besoin-date', 'besoin', 'Le besoin : la date et l’heure limites au quai', (v) => v[B.limite] === LIMITE.iso && lireHeure(v[B.heure]) === LIMITE.h * 60),
  jalon('besoin-budget', 'besoin', 'Le besoin : le budget et le critère « le moins de CO₂ »',
    (v) => lireNombre(v[B.budget]) === BUDGET && v[B.critere] === CRITERE_JUSTE),
  jalon('tri-liste', 'trier', 'Trier : l’offre hors liste écartée, les trois référencées gardées',
    (v, J) => tri(v, 'horsliste', COL.liste) === false && refs(J).every((o) => tri(v, o.slot, COL.liste) === true)),
  jalon('tri-date', 'trier', 'Trier : l’offre référencée en retard écartée, les deux autres tiennent la date',
    (v, J) => refs(J).every((o) => tri(v, o.slot, COL.date) === o.tient)),
  // Seules les offres RESTANTES (référencées et à l'heure) : une offre écartée mal reportée ne se paie pas deux fois.
  jalon('comparer', 'comparer', 'Comparer : prix et CO₂ reportés justes pour les offres qui restent',
    (v, J) => J.restantes.every((o) => { const r = reporte(J, v, o.slot); return r.prix === o.prix && r.co2 === o.co2; })),
  // Jugé sur le RÉEL (c'est la décision qui part chez Claire), même si l'élève a mal trié (brief §11 n° 3).
  jalon('decision-offre', 'decider', 'Décider : l’offre qui émet le moins de CO₂ parmi celles qui restent', (v, J) => v[B.retenue] === J.bonne.slot),
  jalon('decision-justif', 'decider', 'Décider : la justification « la date d’abord, puis le CO₂ »', (v) => v[B.justif] === JUSTIF_JUSTE),
  // Les cas bonus du confirmé : sans poids ni groupe, `null` quand l'élève ne les a pas reçus (caché à l'élève).
  ...[1, 2].map((k) => ({ id: `bonus-${k}`, bonus: true, ecran: 'fiche', titre: `Offre en plus n° ${k} écartée pour la bonne raison`,
    verifier(db) {
      const o = jeuEleve(db).offres.find((x) => x.slot === `bonus${k}`);
      if (!o) return null;
      const f = fiche(db);
      return f.envoye ? (tri(f.v, o.slot, o.ecarte) === false ? ok : ko) : attente;
    } })),
];

// ─────────────────────────────────────────────────────────────── les pastilles d'étape (« fait », jamais « juste »)
const rempli = (x) => x != null && String(x).trim() !== '';
export const PASTILLES = [
  { libelle: 'Lire le besoin', fait: (db) => { const { v } = fiche(db); return [B.limite, B.heure, B.budget, B.critere].every((k) => rempli(v[k])); } },
  { libelle: 'Trier les offres', fait: (db) => { const { v } = fiche(db);
    return jeuEleve(db).offres.every((o) => [COL.liste, COL.date].every((c) => tri(v, o.slot, c) !== undefined)); } },
  { libelle: 'Comparer', fait: (db) => { const { v } = fiche(db), J = jeuEleve(db);
    return J.offres.every((o) => rempli(caseDe(v, casePrix(J, o.slot))) && rempli(caseDe(v, caseCO2(J, o.slot)))); } },
  { libelle: 'Choisir', fait: (db) => fiche(db).envoye },
];

// ─────────────────────────────────────────────────────────────── la carte des itinéraires (consultée, jamais notée)
export const CARTE_ITINERAIRES = {
  carte: CARTE,
  destination: DESTINATION,
  libelle: 'Carte des itinéraires',
  titre: 'D’Anvers à Rouvignies : trois itinéraires',
  consigne: 'Clique sur un itinéraire (ou dans la liste) pour lire sa fiche. Les prix, les dates et le CO₂ sont dans les devis.',
  alt: 'Carte d’Anvers à Rouvignies : trois itinéraires, route, barge et rail',
  offres: (mode, db) => jeuEleve(db).offres.filter((o) => o.mode === mode).map((o) => o.nom),
};

// ─────────────────────────────────────────────────────────────── l'accueil
export const MENTION = 'Réels : Decathlon et son entrepôt de Rouvignies (Nord), l’objectif de −20 % d’émissions du transport en 2026, la ligne de barges '
  + 'de Contargo entre Anvers et Valenciennes, l’obligation d’informer le client du CO₂ d’un transport (Code des transports), le facteur d’émission du camion '
  + '(ADEME). Construit : la liste référencée, les autres prestataires, tous les prix, dates et CO₂ des devis, le conteneur, Claire.';
export const ACCUEIL = {
  titre: 'Ton premier conteneur',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Claire', 'Menu Messagerie : le cahier des charges, la liste référencée et les devis sont joints.'],
    ['Regarder la carte', 'Carte des itinéraires : la route, la barge, le rail. Clique sur chacun.'],
    ['① Lire le besoin', 'Dans le comparateur : la date limite au quai, le budget, le critère du cahier des charges.'],
    ['② Trier les offres', 'Chaque offre : dans la liste référencée ? arrive-t-elle à temps ?'],
    ['③ Comparer', 'Reporte le prix et le CO₂ de chaque devis.'],
    ['④ Choisir', 'Choisis l’offre, justifie, et envoie ton choix à Claire.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance
export const OPTIONS = {
  menu: [],
  exercice: 'Séance 1 : ton premier conteneur',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  fiche: FICHE_CMP,
  carteItineraires: CARTE_ITINERAIRES,
  pastilles: PASTILLES,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
