// ENT-11.5 — Mondial Relay, évaluation « la tournée Sud et le colis bloqué » : le contenu de la séance (brief
// `docs/briefs/ENT-11.5-mondial-relay-evaluation-tournee.md`). Données pures (plan, horaires tirés, calcul d'une journée, suivi du colis) :
// `contenus/mondial-relay-ent115-donnees.js`. Univers commun : `contenus/mondial-relay.js` (lu, jamais modifié). Activité :
// `activites/mondial-relay-evaluation-tournee.js`. Questions : `contenus/questions/ENT-11.5.js`. Corrigé : `contenus/corriges/ENT-11.5.js`.
//
// Samedi 19 décembre 2026, 7 h 05. L'élève, agent d'exploitation à l'agence Mondial Relay de Buchères, est SEUL(E) (Samia est en réunion), en
// ÉVALUATION d'OTM-C1.3 (itinéraire), OTM-C2.3 (suivre l'opération, rendre compte) et OTM-C2.1 (documents), copie rendue (`copie: true`) :
//   A — la tournée T3 Sud : cinq Points Relais, chacun avec SES heures d'ouverture (tirées par élève), départ 7 h 30, retour avant 13 h 30. Vue
//       Tournée en copie (jauges muettes, aucun verdict) sur un plan SCHÉMATIQUE ; trois résultats à reporter (conduite, attente, durée) ;
//   B — le colis bloqué : son suivi (pièce jointe, cause TIRÉE parmi trois), puis deux réponses par phrases à choisir : au Point Relais (qui
//       attend le colis) et à l'expéditrice (qui veut savoir pourquoi et combien on lui rendrait si le colis était perdu) ;
//   puis « Rendre ma copie » (bandeau). Rien n'est jugé à l'écran avant la remise. Les personnages ne disent que « Bien reçu ».
//
// VÉRIFIÉ (cadrage S3 §2, recherches du 26/10/2026) : Mondial Relay et son hub-agence de Buchères ; Points Relais livrés du mardi au samedi
// pendant leurs heures d'ouverture ; colis gardé 5 jours au Point Relais ; états du suivi (« Pris en charge », « Au Point Relais® ») ; conditions
// de vente (art. 10 à 12) ; 4 h 30 de conduite puis 45 min de pause (règlement 561/2006) ; communes et codes postaux.
// CONSTRUIT (dit à l'écran) : le plan (SCHÉMATIQUE : la carte OpenStreetMap de l'Aube n'a pas pu être fabriquée, voir le §7 du brief), les cinq
// commerces et leurs horaires, la vitesse (40 km/h) et le temps par arrêt (10 min), la tournée T3 du samedi, le colis bloqué et son histoire,
// Samia, le gérant du Point Relais et l'expéditrice, tous les messages. Les conditions de vente reprises ne parlent pas de RETARD (perte et
// avarie seulement) : la ligne d'indemnité du courriel dit « si le colis était perdu ou abîmé ».
//
// Le courriel ne prévient PAS le destinataire du colis (question ouverte du brief §11 : qui le prévient, l'expéditeur ou Mondial Relay par SMS ? À
// vérifier) : aucune phrase du courriel ne dit qui le prévient, ni vraie ni fausse.

import { creerTournee } from '../core/types/tournee.js';
import { apresGeste, apresMail } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { normaliser, estJuste } from '../core/types/numerique.js';
import { catalogueSimple } from './entreprise-commun.js';
import { QUESTIONS } from './questions/ENT-11.5.js';
import { CODE_POSTAL, CGV, REGLES_COLIS, SOURCE_CGV } from './mondial-relay.js';
import {
  ID, ID_VOLET, TOURNEE_ID, MSG_RELAIS, MSG_EXPEDITEUR, SCENARIO, JOUR, PLAN_TAILLE, PX_PAR_KM, DEPART, ARRIVEE, LIEUX, IDS, communeDe,
  CAUSES, COLIS, EQUIPE, mailDe, heureScenario, hDit, kmEntre, libelleFenetre, jeuDeBase, fenetresDeBase, causeDe, pointsDe, etatTournee,
  evenementsSuivi,
} from './mondial-relay-ent115-donnees.js';

export { ID, TOURNEE_ID, MSG_RELAIS, MSG_EXPEDITEUR };

// ─────────────────────────────────────────────────────────────── ce que le moteur exige d'un univers (aucun article en jeu)
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

// ─────────────────────────────────────────────────────────────── sans lexique (évaluation)
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fr1 = (n) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
const PIED_RECONSTITUE = 'Document reconstitué — document pédagogique Prepalog. Mondial Relay et son hub de Buchères sont réels ; les commerces, les horaires, les personnes et le colis sont construits.';
const pied = (quoi) => `<p class="mr-pied">${quoi}</p>`;
const entete = (qui, refs) => `<div class="mr-entete"><b>${ech(qui)}</b><span>${refs.map(ech).join('<br>')}</span></div>`;
const art = (code, num, texte) => `<p class="mr-st" style="margin-top:14px">${code}, ${num}</p>${texte}`;

// Ton poste aujourd'hui (« Avant de commencer » : la situation, aucune réponse).
const DOC_POSTE = { id: 'poste', titre: 'Ton poste aujourd’hui', court: 'Ton poste',
  html: `<article class="mr-doc" aria-label="Ton poste aujourd’hui">
    ${entete('Mondial Relay — agence de Buchères (Aube)', ['Exploitation', 'Samedi 19 décembre 2026'])}
    <p class="mr-t">Ton poste aujourd’hui</p>
    <ul class="mr-ul">
      <li>Tu es agent d’exploitation à l’agence Mondial Relay de Buchères, en plein pic de fin d’année.</li>
      <li>Samia, ta responsable, est en réunion jusqu’à midi : tu travailles seul ou seule.</li>
      <li>Deux choses t’attendent dans la Messagerie : la tournée T3 Sud du samedi, et un colis resté bloqué depuis mardi.</li>
      <li>Le camion de la tournée roule à 40 km/h en moyenne et s’arrête 10 minutes à chaque Point Relais.</li>
      <li>C’est une évaluation : rien ne te dit si c’est juste avant que tu rendes ta copie.</li>
    </ul>
    ${pied('Situation construite pour l’exercice — document pédagogique Prepalog.')}
  </article>` };

// La tournée T3 Sud de CET élève : les cinq Points Relais et SES heures d'ouverture.
export function docTournee(db) {
  const F = fenetresDeBase(db || {});
  return `<article class="mr-doc" aria-label="Tournée T3 Sud">
    ${entete('Mondial Relay — agence de Buchères', ['Tournée T3 Sud', 'Samedi 19/12/2026'])}
    <p class="mr-t">Tournée T3 Sud — samedi 19 décembre</p>
    <p class="mr-st">Cinq Points Relais à livrer, dans l’ordre que tu choisis</p>
    <table class="mr-t2"><thead><tr><th scope="col">Point Relais</th><th scope="col">Commune</th><th scope="col">Heures d’ouverture ce matin</th></tr></thead>
      <tbody>${LIEUX.map((l) => `<tr data-pr="${l.id}"><td>${ech(l.commerce)}</td><td>${ech(l.commune)} (${ech(CODE_POSTAL[l.commune] || '')})</td>
        <td>${ech(libelleFenetre(F[l.id]))}</td></tr>`).join('')}</tbody></table>
    <ul class="mr-ul">
      <li>Le camion part de l’agence de Buchères à <b>${hDit(JOUR.depart)}</b> et doit y être rentré avant <b>${hDit(JOUR.limite)}</b>.</li>
      <li>Vitesse moyenne : <b>${JOUR.vitesse} km/h</b>. Arrêt à chaque Point Relais : <b>${JOUR.service} min</b> (décharger, scanner).</li>
      <li>Arrivé <b>avant l’ouverture</b>, le camion attend qu’elle ait lieu. Arrivé <b>après la fermeture</b>, le colis ne peut pas être remis.</li>
      <li>Les cinq Points Relais sont à livrer ce matin : aucun n’est reporté.</li>
      <li>Au plus ${Math.floor(JOUR.pause.apres / 60)} h ${String(JOUR.pause.apres % 60).padStart(2, '0')} de conduite, sinon une pause de ${JOUR.pause.duree} min est obligatoire.</li>
      <li>Les Points Relais sont livrés du mardi au samedi, pendant leurs heures d’ouverture.</li>
    </ul>
    ${pied('Horaires des commerces, vitesse et temps par arrêt construits pour l’exercice. ' + PIED_RECONSTITUE)}
  </article>`;
}

// Les distances entre les lieux (routes : le vol d'oiseau du plan majoré de 30 %), arrondies au dixième.
const LIGNES_DIST = [['depart', 'Buchères (départ)'], ...LIEUX.map((l) => [l.id, l.commune])];
const COLS_DIST = [...LIEUX.map((l) => [l.id, l.commune]), ['arrivee', 'Buchères (retour)']];
export const DOC_DISTANCES = { id: 'distances', titre: 'Les distances entre les Points Relais', court: 'Les distances',
  html: `<article class="mr-doc" aria-label="Les distances entre les Points Relais">
    ${entete('Mondial Relay — agence de Buchères', ['Exploitation', 'Distances par la route'])}
    <p class="mr-t">Les distances par la route, en kilomètres</p>
    <p class="mr-st">On lit la ligne du lieu de départ, puis la colonne du lieu d’arrivée</p>
    <table class="mr-t2 mr-dist"><thead><tr><th scope="col">De ↓ vers →</th>${COLS_DIST.map(([, n]) => `<th scope="col" class="mr-n">${ech(n)}</th>`).join('')}</tr></thead>
      <tbody>${LIGNES_DIST.map(([a, na]) => `<tr><th scope="row">${ech(na)}</th>${COLS_DIST.map(([b]) => `<td class="mr-n">${a === b ? '—'
        : fr1(kmEntre(a, b))}</td>`).join('')}</tr>`).join('')}</tbody></table>
    ${pied('Distances construites pour l’exercice (plan schématique, trajets par la route = vol d’oiseau majoré de 30 %). ' + PIED_RECONSTITUE)}
  </article>` };

// Le suivi du colis bloqué de CET élève (la cause est tirée).
export function docSuivi(db) {
  const E = evenementsSuivi(causeDe(db || {}));
  return `<article class="mr-doc" aria-label="Suivi du colis ${ech(COLIS.numero)}">
    ${entete('Mondial Relay — suivi d’un colis', [`Colis ${COLIS.numero}`, 'Consulté le samedi 19/12/2026'])}
    <p class="mr-t">Suivi du colis ${ech(COLIS.numero)}</p>
    <dl class="mr-dl">
      <dt>Expéditrice</dt><dd>${ech(COLIS.expeditrice.boutique)} — ${ech(COLIS.expeditrice.ville)}</dd>
      <dt>Destination</dt><dd>Point Relais « ${ech(COLIS.relais.commerce)} » — ${ech(COLIS.relais.commune)} (${ech(CODE_POSTAL[COLIS.relais.commune] || '')})</dd>
      <dt>Déposé le</dt><dd>${ech(COLIS.deposeLe)}</dd>
    </dl>
    <table class="mr-t2"><thead><tr><th scope="col">Jour</th><th scope="col">Heure</th><th scope="col">État</th><th scope="col">Détail</th></tr></thead>
      <tbody>${E.map(([j, hh, etat, detail]) => `<tr><td>${ech(j)}</td><td>${ech(hh)}</td><td><b>${ech(etat)}</b></td><td>${ech(detail)}</td></tr>`).join('')}</tbody></table>
    ${pied('Suivi construit pour l’exercice (les états « Pris en charge » et « Au Point Relais® » existent chez Mondial Relay). ' + PIED_RECONSTITUE)}
  </article>`;
}

// Les extraits des conditions de vente (art. 10 à 12) : reformulés au plus près, source datée.
export const DOC_CGV = { id: 'cgv', titre: 'Les conditions de vente (extraits)', court: 'Conditions de vente',
  html: `<article class="mr-doc" aria-label="Les conditions de vente (extraits)">
    ${entete('Mondial Relay — conditions générales de vente', ['Offre Start', 'Version du 07/01/2026'])}
    <p class="mr-t">Les conditions de vente (extraits)</p>
    ${art('Article 10', 'colis au Point Relais', `<p>Un colis est gardé <b>${REGLES_COLIS.joursAuRelais} jours</b> au Point Relais, à partir du lendemain de sa livraison. Passé ce délai, il est renvoyé au point de dépôt.</p>`)}
    ${art('Article 11', 'colis abîmé et réclamation', `<ul class="mr-ul">${CGV.art11.map((x) => `<li>${ech(x)}</li>`).join('')}</ul>`)}
    ${art('Article 12', 'indemnité', `<ul class="mr-ul">${CGV.art12.map((x) => `<li>${ech(x)}</li>`).join('')}</ul>`)}
    ${pied(`Extraits reformulés de : ${ech(SOURCE_CGV)} (articles 10 à 12). Le texte complet fait foi.`)}
  </article>` };

// « Le droit » (« Avant de commencer ») : textes réels, relus pour les séances France Boissons (ENT-6.9 et 6.10).
export const DOC_DROIT = { id: 'droit', titre: 'Le droit : téléphone, conduite, réemploi, information du salarié', court: 'Le droit',
  html: `<article class="mr-doc" aria-label="Le droit">
    <p class="mr-t">Le droit : téléphone, conduite, réemploi, information du salarié</p>
    ${art('Code de la route', 'article R412-6-1, alinéa 1', '<p>« L’usage d’un téléphone tenu en main par le conducteur d’un véhicule en circulation est interdit. »</p>')}
    ${art('Règlement (CE) n° 561/2006', 'article 4 d (extrait)', '<p>« “pause”: toute période pendant laquelle un conducteur n’a pas le droit de conduire ou d’effectuer d’autres tâches […] »</p>')}
    ${art('Règlement (CE) n° 561/2006', 'article 7 (extrait)', '<p>« Après un temps de conduite de quatre heures et demie, un conducteur observe une pause ininterrompue d’au moins quarante-cinq minutes, à moins qu’il ne prenne un temps de repos. […] »</p>')}
    ${art('Code de l’environnement', 'article L541-1-1 (extrait)', '<p>Réemploi : « toute opération par laquelle des substances, matières ou produits qui ne sont pas des déchets sont utilisés de nouveau pour un usage identique à celui pour lequel ils avaient été conçus ».</p>')}
    ${art('Code du travail', 'article L1222-4', '<p>« Aucune information concernant personnellement un salarié ne peut être collectée par un dispositif qui n’a pas été porté préalablement à sa connaissance. »</p>')}
    <p class="mr-pied">Textes réels — sources : Code de la route, Code de l’environnement, Code du travail (Légifrance, code.travail.gouv.fr) ; règlement (CE) n° 561/2006 (Office des publications de l’Union européenne)</p>
  </article>` };

export const DOCUMENTS = [
  DOC_POSTE,
  { id: 'tournee-t3', titre: 'Tournée T3 Sud du samedi', court: 'Tournée T3 Sud', html: docTournee },
  DOC_DISTANCES,
  { id: 'suivi', titre: `Suivi du colis ${COLIS.numero}`, court: 'Suivi du colis', html: docSuivi },
  DOC_CGV, DOC_DROIT,
];
// Tout à l'encre du papier, aucune couleur de repère.
export const STYLE = `
.mr-doc{padding:14px 18px 0}
.mr-doc p{margin:0 0 8px}
.mr-t{margin:0; font-size:1.05rem; font-weight:800}
.mr-st{margin:2px 0 10px; font-size:.82rem; color:var(--encre-douce)}
.mr-entete{display:flex; justify-content:space-between; align-items:baseline; gap:8px; border-bottom:2px solid var(--encre); padding-bottom:6px; margin-bottom:8px}
.mr-entete b{font-size:1.02rem; letter-spacing:.02em}
.mr-entete span{font-size:.78rem; color:var(--encre-douce); text-align:right}
.mr-dl{display:grid; grid-template-columns:110px 1fr; gap:4px 12px; margin:6px 0 10px; font-size:.9rem}
.mr-dl dt{color:var(--encre-douce)}
.mr-dl dd{margin:0}
.mr-ul{margin:6px 0 0; padding-left:20px; font-size:.9rem}
.mr-ul li{margin:4px 0}
.mr-t2{border-collapse:collapse; width:100%; margin:6px 0 10px; font-size:.86rem}
.mr-t2 th, .mr-t2 td{border:1px solid var(--filet); padding:4px 6px; text-align:left; vertical-align:top}
.mr-t2 th{font-weight:700}
.mr-t2 .mr-n{text-align:right}
.mr-dist th, .mr-dist td{font-size:.8rem}
.mr-pied{margin:12px -18px 0; font-size:.72rem; color:var(--encre-douce); border-top:1px solid var(--filet); padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────────────────────────── la tournée T3 Sud (plan schématique, vue Tournée)
export const PLAN = {
  largeur: PLAN_TAILLE.largeur, hauteur: PLAN_TAILLE.hauteur,
  grille: { colonnes: 'ABCDE', lignes: 4 },
  echelle: { pixels: PX_PAR_KM, libelle: '1 km', facteurRoute: JOUR.facteurRoute },
  depart: { nom: DEPART.nom, lettre: DEPART.lettre, x: DEPART.x, y: DEPART.y },
  arrivee: { nom: ARRIVEE.nom, x: ARRIVEE.x, y: ARRIVEE.y },
  points: pointsDe({}),
  alt: 'Plan schématique du sud de l’Aube : l’agence de Buchères et les cinq Points Relais de la tournée T3',
  legendePoints: 'Point Relais à livrer',
};

// Trois résultats à reporter, en minutes (les jauges, muettes en copie, ne donnent ni l'heure de retour, ni l'attente, ni la durée).
export const REPORT = [
  { id: 'conduite', libelle: 'Temps de conduite de la tournée (sans les arrêts ni l’attente)', unite: 'min', tolerance: 1, valeur: (b) => b.conduite },
  { id: 'attente', libelle: 'Attente devant les commerces avant leur ouverture', unite: 'min', tolerance: 2, valeur: (b) => b.attente },
  { id: 'duree', libelle: 'Durée de la journée, du départ au retour à l’agence (arrêts et attente compris)', unite: 'min', tolerance: 3, valeur: (b) => b.minutes },
];

export const TOURNEE = {
  id: TOURNEE_ID,
  libelle: 'Tournée Sud',
  titre: 'La tournée T3 Sud du samedi 19/12',
  consigne: `Le camion part de l’agence de Buchères à ${hDit(JOUR.depart)} et doit y être rentré avant ${hDit(JOUR.limite)}. Clique les cinq Points Relais sur le plan, `
    + 'dans l’ordre de passage : tous sont à livrer. Chaque commerce a ses heures d’ouverture (dans la liste, sur le document « Tournée T3 Sud »). '
    + 'Arrivé trop tôt, le camion attend l’ouverture ; trop tard, le colis ne peut pas être remis. Le plan est un schéma construit ; les distances par la route '
    + 'sont dans le document « Les distances ». Quand ta tournée est prête, reporte tes trois résultats en minutes.',
  plan: PLAN,
  points: (db) => pointsDe(fenetresDeBase(db)),
  mesures: [],
  horaire: {
    depart: JOUR.depart, limite: JOUR.limite, vitesse: JOUR.vitesse, service: JOUR.service,
    libelleLimite: 'retour à l’agence', libelleRate: 'Point Relais fermé à l’arrivée',
    pause: JOUR.pause,
  },
  // Pas de quai : les cinq Points Relais sont à livrer ; le camion part « vide » de la tournée, l'élève clique.
  quai: false,
  departAQuai: true,
  libelleCharge: 'Ordre de passage',
  libelleQuai: 'Points Relais à placer dans la tournée',
  titreReport: 'Reporte tes résultats',
  consigneReport: 'En minutes, d’après ta tournée. Elles s’enregistrent quand tu cliques sur « Enregistrer mes résultats » : tu peux les modifier jusqu’à la remise.',
  report: REPORT,
};

// Le moteur, pour les jalons : le bilan de LA vue (pas un calcul parallèle). ⚠ INSTANCE DE CALCUL : sa « base » n'est qu'un petit objet
// `{ fenetres }` (pas la base d'un élève) ; sur `{}` (chargement), aucune fenêtre.
const VUE = creerTournee({ ...TOURNEE, points: (calc) => pointsDe((calc && calc.fenetres) || {}) });
export const bilanTournee = (etat, db) => VUE.bilan({ ordre: (etat.ordre || []).map(String), quai: IDS.filter((id) => !(etat.ordre || []).map(String).includes(id)),
  report: {}, juge: {}, valide: null }, { fenetres: fenetresDeBase(db) });
// La tournée de l'élève et son bilan, ou `null` tant qu'il n'a placé aucun arrêt.
export function tourneeDeLeleve(db) {
  const e = etatTournee(db);
  if (!e || !Array.isArray(e.ordre) || !e.ordre.length) return null;
  return { e, b: bilanTournee(e, db) };
}
// Les trois résultats reportés sont-ils justes, d'après SA tournée ? (`{ id: vrai | faux | null }` ; null = case vide ou illisible.)
export function reportJuge(e, b) {
  return Object.fromEntries(REPORT.map((r) => {
    const v = normaliser(e.report && e.report[r.id]);
    return [r.id, Number.isNaN(v) ? null : estJuste(v, r.valeur(b), r.tolerance)];
  }));
}

// ─────────────────────────────────────────────────────────────── les deux courriels par phrases (au VOUS : personnes extérieures)
const GERANT = { nom: `${COLIS.relais.gerant}`, mail: 'regnier@quincaillerie-regnier.example' };
const EXPEDITRICE = { nom: COLIS.expeditrice.nom, mail: 'camille.brisset@maison-brisset.example' };
const SAMIA = { nom: 'Samia', mail: mailDe('samia') };

const numero = COLIS.numero;
const CAUSE_RELAIS = {
  ouvert: `Le colis ${numero} n’est pas arrivé chez vous : il a été écarté au tri, car son emballage était ouvert.`,
  etiquette: `Le colis ${numero} n’est pas arrivé chez vous : il a été écarté au tri, car son étiquette n’a pas pu être lue.`,
  ferme: `Le colis ${numero} est passé chez vous jeudi, mais votre Point Relais était fermé : il n’a pas pu être remis et il est revenu à l’agence.`,
};
const SUITE_RELAIS = {
  ouvert: 'Il reste à l’agence, dans la zone des colis à contrôler, et ne repart pas pour l’instant.',
  etiquette: 'Il reste à l’agence en attendant une nouvelle étiquette ; il repartira quand elle sera posée.',
  ferme: 'Il est à l’agence ; nous vous le représenterons à la prochaine tournée, mardi 22/12.',
};
const CAUSE_EXPEDITRICE = {
  ouvert: `Votre colis ${numero} a été écarté au tri : son emballage était ouvert.`,
  etiquette: `Votre colis ${numero} a été écarté au tri : son étiquette n’a pas pu être lue.`,
  ferme: `Votre colis ${numero} a été présenté jeudi au Point Relais de ${COLIS.relais.commune}, qui était fermé : il est revenu à notre agence.`,
};
const SUITE_EXPEDITRICE = {
  ouvert: 'Il reste à notre agence, dans la zone des colis à contrôler, et ne repart pas pour l’instant.',
  etiquette: 'Il reste à notre agence en attendant une nouvelle étiquette ; il repartira quand elle sera posée.',
  ferme: 'Il est à notre agence ; nous le représenterons au Point Relais à la prochaine tournée, mardi 22/12.',
};
const DELAI = ['Quand il sera livré, vous le garderez 5 jours pour que votre cliente vienne le retirer.',
  'Quand il sera livré, vous le garderez 2 jours pour que votre cliente vienne le retirer.',
  'Quand il sera livré, vous le garderez 14 jours pour que votre cliente vienne le retirer.',
  'Quand il sera livré, vous le garderez 30 jours pour que votre cliente vienne le retirer.'];
const INDEMNITE = ['Si le colis était perdu ou abîmé, l’indemnité serait de 25 € au plus par colis, et les frais d’envoi ne seraient pas remboursés (conditions de vente, article 12).',
  'Si le colis était perdu ou abîmé, l’indemnité serait de 100 € par colis, frais d’envoi remboursés en plus.',
  'Si le colis était perdu ou abîmé, l’indemnité serait égale à la valeur du contenu, sans limite.',
  'Si le colis était perdu ou abîmé, aucune indemnité ne serait versée.'];
const parCause = (T) => CAUSES.map((c) => T[c.id]);
const causeJuste = (db) => jeuDeBase(db).cause;

export function phrasesRelais(prenom) {
  return {
    id: MSG_RELAIS,
    lignes: [
      { id: 'salut', choix: ['Bonjour Monsieur Régnier,', 'Salut Georges,', 'Hello !'], juste: 0 },
      { id: 'cause', choix: () => parCause(CAUSE_RELAIS), juste: causeJuste },
      { id: 'suite', choix: () => parCause(SUITE_RELAIS), juste: causeJuste },
      { id: 'delai', choix: DELAI, juste: 0 },
      { id: 'fin', choix: ['Cordialement,', 'Merci,', 'À+'], juste: 0 },
      { id: 'signature', texte: `${prenom}, agence Mondial Relay de Buchères` },
    ],
    melanger: true,
  };
}
export function phrasesExpeditrice(prenom) {
  return {
    id: MSG_EXPEDITEUR,
    lignes: [
      { id: 'salut', choix: ['Bonjour Madame Brisset,', 'Salut Camille,', 'Bonjour Camille,'], juste: 0 },
      { id: 'cause', choix: () => parCause(CAUSE_EXPEDITRICE), juste: causeJuste },
      { id: 'suite', choix: () => parCause(SUITE_EXPEDITRICE), juste: causeJuste },
      { id: 'indemnite', choix: INDEMNITE, juste: 0 },
      { id: 'fin', choix: ['Cordialement,', 'Merci,', 'À+'], juste: 0 },
      { id: 'signature', texte: `${prenom}, agence Mondial Relay de Buchères` },
    ],
    melanger: true,
  };
}

// Le dernier envoi de l'élève pour un message par phrases : `{ ligne: rang choisi }` (rangs dans l'ordre DÉCLARÉ), ou `null`.
export function choixEnvoye(db, idMessage) {
  const envois = ((db && db.mails) || []).filter((m) => m.folder === 'out' && m.phrases && m.phrases.id === idMessage)
    .sort((a, b) => (a.ts - b.ts) || (a.id - b.id));
  return envois.length ? (envois[envois.length - 1].phrases.choix || {}) : null;
}

// ─────────────────────────────────────────────────────────────── les messages (date du scénario ; au tu avec Samia)
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: o.a || prenom, subject, kind: 'text', text, ...(o.extra || {}) });

export const RENDRE = 'Quand ta tournée est enregistrée et que tu as répondu aux deux personnes, clique sur « Rendre ma copie », en haut de l’écran. Une seule remise.';
export const texteSamia = (prenom) => `Bonjour ${prenom},\n\nje suis en réunion jusqu’à midi : tu es seul(e) à l’exploitation ce samedi. Deux choses.\n`
  + `1. La tournée T3 Sud : cinq Points Relais, départ de l’agence à ${hDit(JOUR.depart)}, retour avant ${hDit(JOUR.limite)}. Chaque commerce a ses heures `
  + 'd’ouverture (document « Tournée T3 Sud » et menu « Tournée Sud »). Ordonne les cinq arrêts, puis reporte tes trois résultats.\n'
  + `2. Le colis ${numero} est resté « Pris en charge » depuis mardi. Son suivi est joint. Le Point Relais et l’expéditrice m’ont écrit : trouve ce qui `
  + 'bloque le colis, puis réponds-leur.\n\n'
  + `${RENDRE}\n\nSamia`;
export const texteGerant = () => `Bonjour,\n\nGeorges Régnier, de la ${COLIS.relais.commerce} à ${COLIS.relais.commune} (Point Relais). Une cliente attend le colis ${numero} : `
  + 'son suivi dit « Pris en charge » depuis mardi et je n’ai rien à lui remettre. Pouvez-vous me dire pourquoi, et quoi lui répondre ?\n\n'
  + 'Cordialement,\nGeorges Régnier';
export const texteExpeditrice = () => `Bonjour,\n\nMon colis ${numero} (de Reims à ${COLIS.relais.commune}) est « Pris en charge » depuis mardi et n’avance plus. `
  + 'Que s’est-il passé ? Et si jamais il était perdu ou abîmé, combien me rendriez-vous ?\n\n'
  + `Cordialement,\n${COLIS.expeditrice.nom} — ${COLIS.expeditrice.boutique}, ${COLIS.expeditrice.ville}`;

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, SAMIA, 'Ta matinée', texteSamia(prenom), { db, heure: '07:05', extra: { pieces: ['tournee-t3', 'distances', 'suivi', 'cgv'] } }),
    mail(prenom, GERANT, `Colis ${numero} : où est-il ?`, texteGerant(), { db, heure: '07:12', extra: { phrases: phrasesRelais(prenom) } }),
    mail(prenom, EXPEDITRICE, `Mon colis ${numero} ne bouge plus`, texteExpeditrice(), { db, heure: '07:20', extra: { phrases: phrasesExpeditrice(prenom) } }),
  ] }),
  declencheurs: [
    { id: 'tournee-recue', quand: apresGeste(`tournee:${TOURNEE_ID}:envoyer`),
      semer: (prenom, db) => ({ mails: [mail(prenom, SAMIA, 'Bien reçu', 'Bien reçu.\n\nSamia', { db, heure: '09:10', decalage: 1 })] }) },
    { id: 'relais-recu', quand: apresMail({ a: GERANT.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, GERANT, 'RE : bien reçu', 'Bien reçu, merci.\n\nGeorges Régnier', { db, heure: '09:20', decalage: 1 })] }) },
    { id: 'expeditrice-recue', quand: apresMail({ a: EXPEDITRICE.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, EXPEDITRICE, 'RE : bien reçu', 'Bien reçu, merci.\n\n' + COLIS.expeditrice.nom, { db, heure: '09:30', decalage: 1 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (16 points + 4 d'ouverture = 20 ; poids du brief §5)
// Rien n'est vrai avant d'avoir commencé : l'inaction vaut 0. « Une erreur ne se paie qu'une fois » : les heures reportées sont jugées sur SA tournée,
// la suite du colis sur SA cause. Aucun `ecran` : une copie ne se corrige pas.
export const GROUPES = { tournee: 'La tournée Sud', suivi: 'Le colis bloqué', rendre: 'Rendre compte', forme: 'La forme des courriels' };
export const POIDS = { relais: 5, regles: 2, heures: 2, cause: 3, prevenir: 3, ton: 1 };
const ok = { status: 'ok' }, attente = { status: 'attente' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });
const jalonTournee = (id, titre, juge) => ({ id, titre, groupe: GROUPES.tournee, poids: POIDS[id],
  verifier(db) { const t = tourneeDeLeleve(db); if (!t) return attente; const r = juge(t.b, t.e); return r === true ? ok : ko(typeof r === 'string' ? r : undefined); } });

// Les deux messages par phrases, pour les jalons du colis : `{ mails: [{ id, envoye, justes, choix }] }`.
const MESSAGES = [MSG_RELAIS, MSG_EXPEDITEUR];
const lire = (db, id) => ({ id, ...phrasesJustes(db, id), choix: choixEnvoye(db, id) });
const envoyes = (db) => MESSAGES.map((id) => lire(db, id)).filter((m) => m.envoye);

export const ETAPES = [
  // A — la tournée (9) : les cinq Points Relais livrés ouverts (5), conduite et retour (2), les heures reportées (2).
  jalonTournee('relais', 'Les cinq Points Relais sont livrés pendant leurs heures d’ouverture',
    (b) => (b.retenus.length === IDS.length && !b.creneauxRates.length ? true : (b.retenus.length < IDS.length ? 'tournée incomplète' : `fermé à l’arrivée : ${b.creneauxRates.map(communeDe).join(', ')}`))),
  jalonTournee('regles', 'Conduite dans la règle (pas de pause obligatoire) et retour à l’agence avant 13 h 30',
    (b) => (b.retenus.length === IDS.length && !b.pauseDue && !b.enRetard ? true : (b.retenus.length < IDS.length ? 'tournée incomplète'
      : (b.pauseDue ? 'plus de 4 h 30 de conduite' : 'retour après l’heure fixée')))),
  jalonTournee('heures', 'Les trois résultats reportés sont justes, d’après ta tournée',
    (b, e) => { const j = reportJuge(e, b); return Object.values(j).every((x) => x === true) ? true : `à revoir : ${REPORT.filter((r) => j[r.id] !== true).map((r) => r.id).join(', ')}`; }),
  // B — le colis bloqué (7).
  // La cause : chaque courriel envoyé la dit juste (au moins un envoyé).
  { id: 'cause', titre: 'La cause du blocage est trouvée dans le suivi', groupe: GROUPES.suivi, poids: POIDS.cause,
    verifier(db) {
      const E = envoyes(db);
      if (!E.length) return attente;
      const faux = E.filter((m) => !m.justes.includes('cause'));
      return faux.length ? ko('la cause annoncée n’est pas celle du suivi') : ok;
    } },
  // Prévenir : les deux personnes ont reçu un courriel, et rien de faux n'y est annoncé : la suite du colis est celle de LA CAUSE CHOISIE dans le
  // même courriel (une erreur ne se paie qu'une fois), le délai de garde et l'indemnité sont ceux des conditions de vente.
  { id: 'prevenir', titre: 'Les bonnes personnes sont prévenues, sans rien annoncer de faux', groupe: GROUPES.rendre, poids: POIDS.prevenir,
    verifier(db) {
      const E = envoyes(db);
      if (!E.length) return attente;
      if (E.length < MESSAGES.length) return ko('une des deux personnes n’est pas prévenue');
      const faute = E.find((m) => {
        const c = m.choix || {};
        const suiteCoherente = Number.isInteger(c.cause) && c.suite === c.cause;
        const fait = m.id === MSG_RELAIS ? m.justes.includes('delai') : m.justes.includes('indemnite');
        return !(suiteCoherente && fait);
      });
      return faute ? ko(`à revoir : le courriel ${faute.id === MSG_RELAIS ? 'au Point Relais' : 'à l’expéditrice'}`) : ok;
    } },
  // La forme : la formule d'appel et la politesse de chaque courriel envoyé.
  { id: 'ton', titre: 'Le ton des courriels : la formule d’appel et la politesse', groupe: GROUPES.forme, poids: POIDS.ton,
    verifier(db) {
      const E = envoyes(db);
      if (!E.length) return attente;
      return E.every((m) => m.justes.includes('salut') && m.justes.includes('fin')) ? ok : ko();
    } },
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans au menu, l'accueil, les options
const messagesLus = (db) => (db.mails || []).filter((m) => m.folder === 'in').every((m) => m.read);
export const SUITE = [
  { vue: 'mail', libelle: 'Lire les messages', fait: (db) => messagesLus(db) },
  { vue: 'tournee', libelle: 'Tournée Sud', fait: (db) => !!tourneeDeLeleve(db) },
];
export const MENTION = 'Réels : Mondial Relay (groupe InPost) et son hub de Buchères (Aube) ; les communes et leurs codes postaux ; les Points Relais livrés du '
  + 'mardi au samedi pendant leurs heures d’ouverture ; les états du suivi d’un colis ; les règles du colis et des réclamations (conditions de vente, janvier '
  + '2026) ; le temps de conduite (règlement européen 561/2006). Construits : le plan (un schéma : les positions des communes sont approchées), les cinq '
  + 'commerces et leurs horaires, la vitesse et le temps par arrêt, la tournée du samedi, le colis bloqué, Samia, le gérant du Point Relais, l’expéditrice, '
  + 'tous les messages.';
export const ACCUEIL = {
  titre: 'Évaluation : la tournée Sud et le colis bloqué',
  kpis: ['mail'],
  etapes: [
    ['Lire les messages', 'Menu Messagerie : Samia te laisse deux tâches ; un Point Relais et une expéditrice t’écrivent aussi.'],
    ['A — La tournée Sud', 'Menu « Tournée Sud » : clique les cinq Points Relais sur le plan, dans l’ordre de passage, puis reporte tes trois résultats.'],
    ['B — Le colis bloqué', 'Lis le suivi du colis (pièce jointe du message de Samia), trouve ce qui le bloque, puis réponds au Point Relais et à l’expéditrice : « Répondre », une phrase par ligne.'],
    ['Rendre ma copie', RENDRE],
    ['Bon à savoir', MENTION],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : la tournée Sud et le colis bloqué',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  tirage: true,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  tournee: TOURNEE,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
