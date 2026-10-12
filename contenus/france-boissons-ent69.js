// ENT-6.9 — France Boissons, « la tournée de la côte » : le contenu de la séance (brief `docs/briefs/ENT-6.9-france-boissons-tournee.md`,
// calage `docs/briefs/france-boissons/calage-6.9.py`, jeu C retenu par Tristan le 12/10/2026). Données pures (clients, journée, feuille de
// route, menus du SMS) : `contenus/france-boissons-ent69-donnees.js`. Carte : `contenus/fb-ent69-carte.js` (générée). Univers commun :
// `contenus/france-boissons.js`. Activité : `activites/france-boissons-tournee.js`. Questions : `contenus/questions/ENT-6.9.js`. Corrigé :
// `contenus/corriges/ENT-6.9.js`.
//
// Vendredi 18 juin 2027, 6 h 30 : Lucas est parti de Buchelay à 6 h 00 avec T1, il roule sur l'A13. L'élève, agent d'exploitation
// (tuteur : Karim), en GUIDAGE d'OTM-C1.3 :
//   1. ordonne les six arrêts de la côte sur la carte réelle (vue Tournée, points visibles et nommés, pas de quai : tout le camion part) ;
//      les jauges disent QUE un horaire est raté, QUE la pause de 45 min est due, QUE le retour est trop tard — jamais de combien ;
//   2. calcule la feuille de route (feuille colorée, aides visibles, « Vérifier ») ; adresses stables, attendus sur SES saisies ;
//   3. envoie la tournée (« Envoyer la tournée à Lucas », deux clics : la carte et la feuille se figent), puis répond au SMS de Lucas
//      par phrases à choisir (menus calculés : ses trois premiers arrêts, son heure de retour, la pause).
//
// Vérifié (brief §2, 06/10/2026) : vitesses d'un camion de plus de 12 t (90 km/h sur autoroute, 80 sur route, 50 en ville) ; A13 puis
// A132 jusqu'à Touques ; marché de Deauville le vendredi ; zone piétonne rue des Bains à Trouville ; 4 h 30 de conduite puis 45 min de
// pause (561/2006). Mesuré : 142 km d'autoroute, Buchelay → sortie de Touques ; les km sur la côte (OSM, profil porteur). Construit : les six
// clients (noms vérifiés libres le 12/10/2026, rues réelles), leurs horaires et leurs commandes, 45 km/h sur la côte, 20 min par arrêt.

import { creerTournee } from '../core/types/tournee.js';
import { creerGrille } from '../core/types/grille.js';
import { apresMail } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-6.9.js';
import { EQUIPE, LEXIQUE as LEXIQUE_FB, mailDe, heureScenario, DOC_ORGANIGRAMME, DOC_ANNUAIRE, STYLE_DOCUMENTS as STYLE_FB } from './france-boissons.js';
import { CARTE } from './fb-ent69-carte.js';
import {
  ID, TRANSPORT_ID, ID_VOLET, MSG_SMS, CLE_SMS, SCENARIO, JOUR, CRENEAUX, COMMANDES, VILLES, POINTS, IDS, nomDe, hDit, hhmm,
  journee, lignesFeuille, REF, LIGNES_ARRETS, etatTournee, ordreDe, tourneeEnvoyee, retourFeuille, heuresSms, PHRASE_PAUSE,
} from './france-boissons-ent69-donnees.js';

export { ID, TRANSPORT_ID, SCENARIO };

// ─────────────────────────────────────────────────────────────── la carte et la tournée
export const PLAN = {
  libelle: 'Carte de la côte',
  titre: 'La côte normande, de Villerville à Houlgate',
  consigne: 'Les six clients de la tournée de la côte, et la sortie de l’A13 à Touques, d’où part la tournée et où elle revient.',
  carte: CARTE,
  clients: POINTS,
};

const sansVide = (x) => String(x == null ? '' : x).trim() !== '';
export const TOURNEE = {
  libelle: 'Tournée de la côte',
  titre: 'Ordonner la tournée de la côte',
  consigne: `Lucas est parti de Buchelay à ${hDit(JOUR.depart)}. Cliquez les six clients sur la carte, dans l’ordre où il passera : la tournée `
    + 'part de la sortie de Touques et y revient. Il faut tenir les horaires des clients, pas plus de 4 h 30 de conduite sans pause '
    + '(autoroute comprise) et un retour à Buchelay avant 15 h 30.',
  points: POINTS,
  mesures: [],
  horaire: {
    depart: JOUR.depart, limite: JOUR.limite, vitesse: JOUR.vitesse, service: JOUR.service,
    libelleLimite: 'retour à Buchelay',
    repere: 'Lucas doit être rentré à Buchelay avant cette heure. L’heure de retour, c’est à vous de la calculer.',
    comparaison: 'À comparer à l’heure de retour de la feuille (cellule violette).',
    approche: { km: JOUR.autoroute.km, vitesse: JOUR.autoroute.vitesse, libelle: 'A13 Buchelay → sortie de Touques', retour: true },
    pause: JOUR.pause,
  },
  // Pas de quai : tout le camion part, aucune commande n'est laissée (lot 2) ; le camion part « vide » de la tournée, l'élève clique.
  quai: false,
  departAQuai: true,
  libelleCharge: 'Ordre de passage',
  libelleQuai: 'Clients à placer dans la tournée',
  // Les jauges disent QUE (raté, pause due, retour trop tard), jamais de combien ni l'heure : c'est la feuille qui la donne.
  jaugesRepere: true,
  contraintesDansGrille: true,
  pastilles: [
    { libelle: 'Ordonner', texte: 'Cliquez les six clients sur la carte, dans l’ordre de passage. Les pastilles disent si un horaire est raté, '
      + 'si la pause devient obligatoire, si le retour est trop tard : à vous de trouver un ordre qui tient tout.',
    fait: (db, e) => !!(e && e.ordre && e.ordre.length === LIGNES_ARRETS) },
    { libelle: 'Calculer', texte: 'Remplissez la feuille de route sous la carte, de l’étape 1 à l’heure de retour, puis « Vérifier ».',
      fait: (db, e) => !!(e && e.grille && e.grille.cases && sansVide(e.grille.cases[REF.retour])) },
    { libelle: 'Envoyer', texte: '« Envoyer la tournée à Lucas » (deux clics : la carte et la feuille se figent), puis répondez à son SMS.',
      fait: (db, e) => !!(e && e.termine) },
  ],
  termine: {
    libelle: 'Envoyer la tournée à Lucas',
    confirmer: 'Confirmer l’envoi : la carte et la feuille seront figées',
    fait: 'Tournée envoyée à Lucas : la carte et la feuille sont figées. Son SMS est dans la Messagerie.',
  },
  grille: {
    titre: 'Feuille de route de la tournée de la côte',
    consigne: 'Cliquez une cellule colorée, puis écrivez dans la barre au-dessus du tableau une FORMULE : elle commence par « = ». L’aide '
      + 'de la cellule s’affiche sous la barre. En jaune, les étapes ; en violet, les deux résultats à comparer aux contraintes. La pause '
      + 'se tape simplement (45 ou 0). Les heures s’écrivent comme 07:35. La feuille de route suit l’ordre de votre tournée : si vous '
      + 'le changez, vos formules se recalculent.',
    colonnes: ['A', 'B', 'C', 'D', 'E', 'F'],
    decimales: 1,
    affichage: 'tableur',
    lignes: lignesFeuille,
  },
};

// Le moteur, pour les jalons : le bilan de LA vue (pas un calcul parallèle) et le jugement de la feuille.
const VUE = creerTournee(Object.assign({ plan: PLAN }, TOURNEE));
const GRILLE = creerGrille(TOURNEE.grille);
export const bilanMoteur = (etat) => VUE.bilan(etat);

// ─────────────────────────────────────────────────────────────── les documents
const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = (quoi) => `<p class="fb-pied">${quoi} — Document pédagogique — reconstitution, non contractuel</p>`;
const horaireDe = (id) => {
  const c = CRENEAUX[id];
  if (!c) return 'aucun horaire';
  return `${c.apres != null ? `pas avant ${hDit(c.apres)}` : `avant ${hDit(c.avant)}`} — ${c.libelle}`;
};

const docClients = () => `<article class="fb9-doc" aria-label="Les six clients de la côte">
    <p class="fb-t">La [[tournée]] de la côte — vendredi 18 juin</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay · exploitation (Karim) · camion T1, chauffeur Lucas</p>
    <table class="fb9-table">
      <thead><tr><th scope="col">Client</th><th scope="col">Adresse</th><th scope="col">[[horaire d’ouverture|Horaire]]</th><th scope="col">Commande</th></tr></thead>
      <tbody>${POINTS.map((p) => `<tr data-client="${p.id}"><td>${ech(p.nom)}</td><td>${ech(p.adresse)}</td><td>${ech(horaireDe(p.id))}</td>
        <td>${ech(COMMANDES[p.id] || '')}</td></tr>`).join('')}</tbody>
    </table>
    <ul class="fb9-ul">
      <li>Départ de Buchelay à ${hDit(JOUR.depart)} ; ${JOUR.autoroute.km} km d’[[autoroute]] jusqu’à la sortie de Touques (A13 puis A132), autant au retour.</li>
      <li>Sur la côte : environ ${JOUR.vitesse} km/h de [[vitesse moyenne]] ; ${JOUR.service} min par arrêt pour décharger.</li>
      <li>4 h 30 de [[temps de conduite|conduite]] au plus sans [[pause]], autoroute comprise. Retour à Buchelay avant ${hDit(JOUR.limite)}.</li>
      <li>Toutes les commandes sont dans le camion : les six clients sont à livrer.</li>
    </ul>
    ${PIED('Tournée du jour')}
  </article>`;

// R412-6-1 (alinéa 1), 561/2006 (art. 4 d, art. 7) : textes cités tels quels (relus par Cowork le 10/10/2026 et par Claude Code le
// 12/10/2026 pour ENT-6.8). R413-8 et L2213-2 : RÉSUMÉS, annoncés comme tels (le texte exact n'a pas été relu).
const src = (t) => `<p class="fb-st" style="margin-top:14px">${t}</p>`;
const docDroit = () => `<article class="fb9-doc" aria-label="Le droit">
    <p class="fb-t">Le droit : vitesse, téléphone, temps de conduite, rues piétonnes</p>
    ${src('Code de la route, article R412-6-1, alinéa 1')}<p>« L’usage d’un téléphone tenu en main par le conducteur d’un véhicule en circulation est interdit. »</p>
    ${src('Code de la route, article R413-8 (résumé, pas le texte exact)')}<p>Un camion de plus de 12 t roule au plus à 90 km/h sur autoroute, à 80 km/h sur les autres routes et à 50 km/h en agglomération.</p>
    ${src('Règlement (CE) n° 561/2006, article 4 d (extrait)')}<p>« “pause”: toute période pendant laquelle un conducteur n’a pas le droit de conduire ou d’effectuer d’autres tâches […] »</p>
    ${src('Règlement (CE) n° 561/2006, article 7 (extrait)')}<p>« Après un temps de conduite de quatre heures et demie, un conducteur observe une pause ininterrompue d’au moins quarante-cinq minutes, à moins qu’il ne prenne un temps de repos. […] »</p>
    ${src('Code général des collectivités territoriales, article L2213-2, 1° (résumé, pas le texte exact)')}<p>Le maire peut, par un arrêté, interdire à certaines heures l’accès de certaines rues de la commune à certains véhicules : c’est ce qui fixe les horaires de livraison d’une rue piétonne.</p>
    <p class="fb-pied">Textes de loi (réels) — sources : Légifrance (codes) ; Office des publications de l’Union européenne (règlement)</p>
  </article>`;

export const DOCUMENTS = [
  { id: 'clients', titre: 'La tournée de la côte : les six clients', court: 'Les clients', html: docClients() },
  { id: 'droit', titre: 'Le droit : vitesse, téléphone, temps de conduite', court: 'Le droit', html: docDroit() },
  DOC_ORGANIGRAMME, DOC_ANNUAIRE,
];

export const STYLE_DOCUMENTS = `${STYLE_FB}
.fb9-doc{padding:14px 18px 0}
.fb9-doc p{margin:0 0 8px}
.fb9-table{border-collapse:collapse; width:100%; font-size:.9rem; margin:4px 0 10px}
.fb9-table th, .fb9-table td{border-bottom:1px solid var(--filet); padding:5px 6px; text-align:left; vertical-align:top}
.fb9-table th{color:var(--douce); font-weight:600}
.fb9-ul{margin:6px 0 0; padding-left:20px; font-size:.9rem}
.fb9-ul li{margin:4px 0}
`;

// ─────────────────────────────────────────────────────────────── le SMS à Lucas (phrases à choisir, menus calculés)
const RANGS = ['1er', '2e', '3e'];
const choixClient = (k) => POINTS.map((p) => `${RANGS[k]} arrêt : ${p.nom} (${VILLES[p.id]})`);
const justeClient = (k) => (db) => IDS.indexOf(ordreDe(db)[k]);
// Les heures du menu : la plus proche du retour RÉEL de sa tournée, celle de sa feuille, et des voisines (au quart d'heure).
const menuRetour = (db) => {
  const b = journee(ordreDe(db));
  return heuresSms(b.arrivee == null ? JOUR.limite : b.arrivee, retourFeuille(db));
};
export function phrasesSms(prenom) {
  return {
    id: MSG_SMS,
    lignes: [
      { id: 'salut', texte: 'Salut Lucas, ta tournée :' },
      { id: 'a1', choix: choixClient(0), juste: justeClient(0) },
      { id: 'a2', choix: choixClient(1), juste: justeClient(1) },
      { id: 'a3', choix: choixClient(2), juste: justeClient(2) },
      { id: 'retour', choix: (db) => menuRetour(db).heures.map((m) => `Retour prévu à Buchelay vers ${hDit(m)}.`),
        juste: (db) => { const M = menuRetour(db); return M.heures.indexOf(M.juste); } },
      { id: 'pause', choix: PHRASE_PAUSE, juste: (db) => (journee(ordreDe(db)).pauseDue ? 1 : 0) },
      { id: 'fin', texte: `La suite de l’ordre est dans ton terminal. ${prenom}` },
    ],
    melanger: true,
  };
}

// ─────────────────────────────────────────────────────────────── les messages
const KARIM = { nom: EQUIPE.karim.nom, mail: mailDe('karim') };
const LUCAS = { nom: EQUIPE.lucas.nom, mail: mailDe('lucas') };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJET_SMS = 'SMS de Lucas : l’ordre des arrêts ?';

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, KARIM, 'La tournée de la côte : à toi d’ordonner les arrêts',
      `${prenom}, Lucas est sur l’A13 avec la [[tournée]] de la côte. Le logiciel n’a pas sorti l’ordre des arrêts ce matin : c’est toi qui le fais.\n\n`
        + 'Six clients, dont Malo à Villers. Regarde bien les [[horaire d’ouverture|horaires d’ouverture]], et n’oublie pas : 4 h 30 de '
        + '[[temps de conduite|conduite]] au plus sans [[pause]], autoroute comprise. Lucas doit être rentré à Buchelay avant 15 h 30.\n\n'
        + 'Ordonne les arrêts, calcule la [[feuille de route]], puis envoie-lui la tournée par SMS avant qu’il sorte de l’autoroute. '
        + 'La liste des clients est en pièce jointe.\n\nKarim',
      { extra: { pieces: ['clients', 'droit', 'organigramme', 'annuaire'] } }),
  ] }),
  declencheurs: [
    // La tournée envoyée (juste ou fausse) : Lucas demande l'ordre par SMS (le point d'étape de Karim garde la réponse fermée).
    { id: 'sms', quand: tourneeEnvoyee,
      semer: (prenom, db) => ({ mails: [mail(prenom, LUCAS, SUJET_SMS,
        `Salut ${prenom} ! Je suis sur l’A13, je sors bientôt à Touques. Tu m’envoies l’ordre des arrêts ? Je le lirai à la sortie.\n\nLucas`,
        { db, decalage: 2, extra: { cle: CLE_SMS, phrases: phrasesSms(prenom) } })] }) },
    // Le SMS envoyé (juste ou faux) : Lucas accuse réception sans juger ; Karim annonce ENT-6.10.
    { id: 'fin', quand: apresMail({ a: LUCAS.mail }),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, LUCAS, 'RE : SMS', 'Bien reçu, je sors à Touques.\n\nLucas', { db, decalage: 3 }),
        mail(prenom, KARIM, 'Merci', `Merci ${prenom}. Ce soir, Lucas rentre avec les vides de Malo : tu l’accueilleras au quai.\n\nKarim`, { db, decalage: 4 }),
      ] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (12, pondérés : 16 + 4 de questions = 20)
// Poids validés par Tristan le 12/10/2026 (option A) : la tournée 6,5 · la feuille de route 6,5 · le SMS 3 · questions notées 4 (`part`).
// Rien n'est vrai avant l'envoi de la tournée (« à faire ») : l'inaction vaut 0. Les jalons 5 à 9 jugent la feuille SUR SA TOURNÉE (une
// mauvaise tournée bien calculée garde ses points) ; les jalons 11 et 12 jugent ce que Lucas vivra (le bilan), pas la feuille.
export const GROUPES = { tournee: 'La tournée envoyée', feuille: 'La feuille de route', sms: 'Le SMS à Lucas' };
export const POIDS = {
  clients: 0.5, horaires: 2.5, conduite: 2, retour: 1.5,
  aller: 1, heures: 2, 'conduite-totale': 1.5, pause: 1, 'heure-retour': 1,
  'sms-arrets': 1, 'sms-retour': 1, 'sms-pause': 1,
};
const attente = { status: 'attente' };
const etat = (st, detail) => (detail ? { status: st, detail } : { status: st });

// La tournée envoyée et son bilan (celui du moteur), ou `null` tant qu'elle n'est pas envoyée.
const envoyee = (db) => { const e = etatTournee(db); return e && e.termine ? { e, b: VUE.bilan(e) } : null; };
const jalonTournee = (id, titre, juger) => ({ id, titre, groupe: GROUPES.tournee, poids: POIDS[id],
  verifier(db) { const t = envoyee(db); return t ? juger(t.b, t.e) : attente; } });

// La feuille : les cellules de chaque jalon, jugées par la grille du moteur sur la tournée envoyée.
const refsHeures = (n) => Array.from({ length: n }, (_, i) => [`C${REF.premiereLigne + i}`, `D${REF.premiereLigne + i}`]).flat();
const CELLULES = {
  aller: () => [REF.tempsAuto, REF.sortie],
  heures: (b) => refsHeures(Math.min(b.retenus.length, LIGNES_ARRETS)),
  'conduite-totale': () => [REF.kmCote, REF.conduiteCote, REF.conduite],
  pause: () => [REF.pause],
  'heure-retour': () => [REF.retour],
};
const MOTS = { vide: 'vide', pasFormule: 'nombre tapé au lieu d’une formule', erreur: 'formule mal écrite', attente: 'il manque une donnée', valeur: 'à revoir' };
const jalonFeuille = (id, titre) => ({ id, titre, groupe: GROUPES.feuille, poids: POIDS[id],
  verifier(db) {
    const t = envoyee(db);
    if (!t) return attente;
    const j = GRILLE.juger(lignesFeuille(t.b), (t.e.grille && t.e.grille.cases) || {});
    const refs = CELLULES[id](t.b);
    const faux = refs.filter((r) => j[r] !== 'ok');
    return faux.length ? etat('ko', `À revoir : ${faux.map((r) => `${r} (${MOTS[j[r]] || 'à revoir'})`).join(', ')}.`) : etat('ok');
  } });

const jalonSms = (id, titre, lignes) => ({ id, titre, groupe: GROUPES.sms, poids: POIDS[id],
  verifier(db) {
    const r = phrasesJustes(db, MSG_SMS);
    if (!r.envoye) return attente;
    return lignes.every((l) => r.justes.includes(l)) ? etat('ok') : etat('ko');
  } });

export const ETAPES = [
  jalonTournee('clients', 'Les six clients sont dans la tournée envoyée',
    (b, e) => (e.ordre.length === LIGNES_ARRETS && !b.aPlacer.length ? etat('ok') : etat('ko', 'Tournée incomplète.'))),
  jalonTournee('horaires', 'Tous les horaires des clients sont tenus',
    (b) => (b.creneauxRates.length ? etat('ko', `Horaire raté : ${b.creneauxRates.map(nomDe).join(', ')}.`) : etat('ok'))),
  jalonTournee('conduite', 'Pas plus de 4 h 30 de conduite : pas de pause obligatoire',
    (b) => (b.pauseDue ? etat('ko', 'La conduite dépasse 4 h 30 : la pause de 45 min est obligatoire.') : etat('ok'))),
  jalonTournee('retour', 'Lucas rentre à Buchelay avant 15 h 30',
    (b) => (b.enRetard ? etat('ko', `Retour après ${hDit(JOUR.limite)}.`) : etat('ok'))),
  jalonFeuille('aller', 'Feuille : temps d’autoroute et heure de sortie justes'),
  jalonFeuille('heures', 'Feuille : heures d’arrivée et de départ justes, sur ta tournée'),
  jalonFeuille('conduite-totale', 'Feuille : conduite totale juste (autoroute comprise, arrêts non compris)'),
  jalonFeuille('pause', 'Feuille : la pause, d’après ta conduite totale'),
  jalonFeuille('heure-retour', 'Feuille : heure de retour à Buchelay juste'),
  jalonSms('sms-arrets', 'SMS : les trois premiers arrêts sont ceux de ta tournée', ['a1', 'a2', 'a3']),
  jalonSms('sms-retour', 'SMS : l’heure de retour est celle que Lucas vivra', ['retour']),
  jalonSms('sms-pause', 'SMS : la pause dite à Lucas est celle de ta tournée', ['pause']),
];

// ─────────────────────────────────────────────────────────────── l'accueil
export const MENTION = 'Réels : France Boissons et sa plateforme de Buchelay (Yvelines), l’A13 et l’A132 jusqu’à Touques (142 km mesurés), les '
  + 'communes et les rues de la côte (carte © contributeurs OpenStreetMap), le marché de Deauville le vendredi, la zone piétonne de la rue des '
  + 'Bains à Trouville, les vitesses des camions et le règlement européen sur les temps de conduite. Construit : les six clients (noms inventés), '
  + 'leurs horaires et leurs commandes, la vitesse moyenne sur la côte, le temps par arrêt, tous les messages.';
export const LEXIQUE = Object.assign({}, LEXIQUE_FB, {
  tournée: 'Le trajet d’un camion qui livre plusieurs clients dans la journée, au départ de la plateforme.',
  'feuille de route': 'Le document du chauffeur : l’ordre des arrêts, avec l’heure d’arrivée et l’heure de départ chez chaque client.',
  itinéraire: 'Le chemin suivi par le camion, rue par rue, d’un point à un autre.',
  'temps de conduite': 'Le temps passé au volant. Pour un camion de plus de 3,5 t : 4 h 30 au plus sans pause, 9 h au plus dans la journée.',
  pause: 'Un temps où le chauffeur ne conduit pas et ne fait aucun autre travail : 45 min après 4 h 30 de conduite. Décharger n’est pas une pause.',
  'horaire d’ouverture': 'Les heures où un client peut recevoir sa livraison. Arrivé trop tôt, le camion attend ; trop tard, la livraison est ratée.',
  'zone piétonne': 'Rue réservée aux piétons : le maire n’y autorise les camions de livraison qu’à certaines heures.',
  porteur: 'Camion d’un seul tenant (la caisse est fixée sur le châssis), sans remorque.',
  autoroute: 'Route rapide, à chaussées séparées : un camion de plus de 12 t y roule à 90 km/h au plus.',
  'vitesse moyenne': 'La distance divisée par le temps mis à la parcourir, arrêts aux feux et ralentissements compris.',
});
export const ACCUEIL = {
  titre: 'La tournée de la côte',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Karim', 'Menu Messagerie : la tournée de la côte, et la liste des six clients en pièce jointe.'],
    ['Ordonner les arrêts', 'Menu « Tournée de la côte » : cliquez les six clients sur la carte, dans l’ordre de passage. Les pastilles disent '
      + 'si un horaire est raté, si la pause devient obligatoire, si le retour est trop tard — pas de combien.'],
    ['Calculer la feuille de route', 'Sous la carte : une formule par cellule colorée, de l’étape 1 à l’heure de retour. « Vérifier » dit ce qui est juste.'],
    ['Envoyer la tournée', '« Envoyer la tournée à Lucas » (deux clics) : la carte et la feuille se figent.'],
    ['Répondre à Lucas', 'Son SMS arrive dans la Messagerie : « Répondre », puis une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance
export const OPTIONS = {
  menu: [],
  exercice: 'Séance 9 : la tournée de la côte',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  transportSection: 'Tournées',
  transportId: TRANSPORT_ID,
  plan: PLAN,
  tournee: TOURNEE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};

// Pour le corrigé et les tests : l'heure écrite comme la feuille l'affiche.
export { hhmm };
