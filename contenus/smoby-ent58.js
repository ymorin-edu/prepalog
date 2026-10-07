// ENT-5.8 — Kuehne+Nagel, « la lettre de voiture et le retard » : les données de la séance (brief
// `docs/briefs/ENT-5.8-smoby-lettre-voiture.md`). Univers commun : `contenus/smoby.js`.
//
// L'élève, agent d'exploitation à l'agence Kuehne+Nagel de Besançon, jeudi 10 décembre 2026 au matin :
// remplit la lettre de voiture de l'enlèvement E1 (Smoby → Jouets du Rhône) à partir de trois documents
// (ordre d'enlèvement, fiche client, planning d'ENT-5.7), puis, après l'accident sur l'A40, calcule la
// nouvelle heure d'arrivée de Julie et prévient le client et Smoby par phrases à choisir.
//
// Vérifié (brief §2) : Kuehne+Nagel et son agence Route de Besançon (École-Valentin) ; les mentions de la
// lettre de voiture nationale (arrêté du 9 novembre 1999 : expéditeur, transporteur, destinataire, lieux et
// dates de prise en charge et de livraison, nature, quantité et poids ; signatures).
// Construit et annoncé : le contrat Smoby ↔ K+N, le client Jouets du Rhône (fictif, Corbas), Julie, le
// Semi n° 1, l'ordre d'enlèvement et son numéro, l'accident, les durées, le poids de 180 kg d'une palette
// complète. Documents reconstitués : mention en pied. Pas de logo K+N.
//
// Les valeurs attendues sont CALCULÉES, jamais recopiées : chauffeur, camion et départ d'E1 depuis la
// solution du planning d'ENT-5.7 (après la panne) ; le poids depuis la palette mixte d'ENT-5.6 (support +
// cartons de la commande) ; l'heure d'arrivée = départ + conduite + retard. Simplification assumée (écrite
// au corrigé) : le temps arrêté, moteur coupé, ne compte pas comme de la conduite.

import { apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { LEXIQUE as LEXIQUE_SMOBY, CHAUFFEURS, CAMIONS, ENLEVEMENTS, KN_AGENCE } from './smoby.js';
import { BRUNO } from './smoby-ent54.js';
import { SOLUTION } from './smoby-ent57.js';
import { COMMANDE, PRODUITS } from './smoby-entrepot.js';

// La fiche envoyée et les saisies, lues comme `ficheEnvoyee`, `lireNombre` et `lireHeure`
// (core/types/fiche.js), sans importer ce module : il tire `core/ui.js`, qui suppose un navigateur.
function ficheEnvoyee(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
export function lireHeure(s) {
  const m = String(s == null ? '' : s).trim().toLowerCase().match(/^(\d{1,2})\s*(?:[:h]\s*(\d{2})?)?$/);
  if (!m) return NaN;
  const h = Number(m[1]), mn = m[2] ? Number(m[2]) : 0;
  return h < 24 && mn < 60 ? h * 60 + mn : NaN;
}

// ─────────────────────────────────────────────────────────────── les données d'E1

const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const enH = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;     // « 11 h 00 »
const minutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const nomDe = (L, id) => (L.find((x) => x.id === id) || {}).nom || id;
const kg = (n) => n.toLocaleString('fr-FR').replace(/[  ]/g, ' ');

export const E1 = ENLEVEMENTS.find((e) => e.id === 'E1');
// Le planning d'ENT-5.7 après la panne : c'est lui qui a roulé (dossier propre : fourni juste).
const PLACE = SOLUTION.v2;
const DEBUT_PLANNING = 5 * 60, PAS = 15;
const departDe = (p) => DEBUT_PLANNING + p.s * PAS;
const D1 = PLACE.E1;
export const DEPART = departDe(D1);                          // 06:00
export const ARRIVEE_PREVUE = DEPART + E1.conduite;          // 10:00
export const LIMITE = minutes(E1.avant);                     // 12:00
export const RETARD = 60;                                    // « On m'annonce 1 h de retard. »
export const ARRIVEE = ARRIVEE_PREVUE + RETARD;              // 11:00
export const ACCIDENT = '08:30';

// Le poids brut : les palettes complètes (180 kg, construit) et la palette mixte préparée en ENT-5.6,
// pesée comme le moteur de la préparation (support + cartons de la commande, arrondi au kg).
export const KG_PALETTE_COMPLETE = 180;
export const KG_MIXTE = Math.round(COMMANDE.support.kg + COMMANDE.lignes.reduce((t, l) => t + l.q * PRODUITS[l.produit].carton.kg, 0));
export const POIDS = (E1.pal - 1) * KG_PALETTE_COMPLETE + KG_MIXTE;

export const JOUR = '2026-12-10';
const JOUR_LONG = 'jeudi 10 décembre 2026';
export const NUMERO_LV = 'LV-BES-26-12-0417';
export const NUMERO_OE = 'OE-26-1210-01';

// Les noms et les lieux des listes de choix (les mêmes trois partout : le piège est de les confondre).
export const ACTEURS = [
  { v: 'smoby', lib: 'Smoby Toys — plateforme logistique' },
  { v: 'jdr', lib: 'Jouets du Rhône (fictif) — entrepôt' },
  { v: 'kn', lib: `${KN_AGENCE.nom} — ${KN_AGENCE.agence}` },
];
export const LIEUX = [
  { v: 'moirans', lib: 'Moirans-en-Montagne (39260)' },
  { v: 'corbas', lib: 'Corbas (69960)' },
  { v: 'ecole', lib: KN_AGENCE.lieu },
];
export const NATURES = [
  { v: 'jouets', lib: 'Jouets (maisons de jardin, cuisines, porteurs)' },
  { v: 'meubles', lib: 'Meubles de jardin' },
  { v: 'vides', lib: 'Palettes vides' },
];
const CLIENT = { nom: 'Jouets du Rhône (fictif)', lieu: 'corbas', ville: 'Corbas (69960)', quai: 'quai 4' };

// La lettre attendue, champ par champ (les ids sont ceux de la fiche ci-dessous).
export const ATTENDU = {
  date: JOUR,
  expNom: 'smoby', expLieu: 'moirans',
  destNom: 'jdr', destLieu: CLIENT.lieu,
  transporteur: 'kn', chauffeur: D1.r, vehicule: D1.k,
  chargLieu: 'moirans', chargDate: JOUR,
  livLieu: CLIENT.lieu, livDate: JOUR,
  nature: 'jouets', palettes: E1.pal, poids: POIDS,
};

// ─────────────────────────────────────────────────────────────── les mots cliquables

export const LEXIQUE = Object.assign({}, LEXIQUE_SMOBY, {
  'lettre de voiture': 'Document de transport qui accompagne la marchandise : qui envoie, qui transporte, qui reçoit, quoi, combien, d’où et vers où.',
  'expéditeur': 'L’entreprise qui envoie la marchandise. Ici, celle chez qui le camion charge.',
  destinataire: 'L’entreprise qui reçoit la marchandise, chez qui le camion livre.',
  transporteur: 'L’entreprise qui transporte la marchandise de l’expéditeur au destinataire, avec ses chauffeurs et ses camions.',
  'ordre d’enlèvement': 'Demande écrite de l’expéditeur au transporteur : venir chercher telle marchandise, tel jour, à telle adresse.',
  'palette Europe': 'Palette de bois de 80 cm × 120 cm, la plus utilisée en Europe.',
  'poids brut': 'Le poids de la marchandise avec ses emballages et ses palettes.',
  'enlèvement': 'Passage du transporteur chez l’expéditeur pour charger la marchandise et l’emmener chez le client.',
});

// ─────────────────────────────────────────────────────────────── les documents sources

const PIED = '<div class="pied">Document pédagogique, reconstitution, non contractuel</div>';

export const STYLE_DOCUMENTS = `
--douce:#555047;
.pied{margin:0; font-size:.72rem; color:var(--douce); border-top:1px solid var(--filet); padding:6px 22px; text-align:right}
.lv-doc .tete{padding:16px 22px 10px; border-bottom:2px solid #1a1915}
.lv-doc .tete p{margin:0}
.lv-doc .tete .t{font-size:1.15rem; font-weight:800; letter-spacing:.02em}
.lv-doc .tete .n{font-family:var(--mono); font-size:.85rem; color:var(--douce)}
.lv-doc .corps{padding:12px 22px 14px; font-size:.9rem}
.lv-doc dl{display:grid; grid-template-columns:170px 1fr; gap:5px 10px; margin:0}
.lv-doc dt{color:var(--douce)}
.lv-doc dd{margin:0}
.lv-doc h2{font-size:.82rem; text-transform:uppercase; letter-spacing:.05em; margin:14px 0 6px; color:var(--douce)}
.lv-doc table{border-collapse:collapse; width:100%; font-size:.86rem}
.lv-doc th, .lv-doc td{border:1px solid var(--filet); padding:5px 7px; text-align:left; vertical-align:top}
.lv-doc thead th{font-weight:700; background:rgba(26,25,21,.05)}
.lv-doc .rem{border-left:3px solid #9c620a; padding:6px 10px; margin-top:12px; font-size:.86rem}
`;

const lignePlanning = (id) => {
  const p = PLACE[id], e = ENLEVEMENTS.find((x) => x.id === id), d = departDe(p);
  return `<tr><td><b>${id}</b></td><td>${e.vers}</td><td>${nomDe(CHAUFFEURS, p.r)}</td><td>${nomDe(CAMIONS, p.k)}</td>`
    + `<td>${hm(d)}</td><td>${hm(d + e.conduite)}</td></tr>`;
};
// Le planning, dans l'ordre des départs.
const ORDRE_PLANNING = ENLEVEMENTS.map((e) => e.id).sort((a, b) => PLACE[a].s - PLACE[b].s || a.localeCompare(b));

export const DOCUMENTS = [
  { id: 'ordre', titre: `Ordre d’enlèvement Smoby n° ${NUMERO_OE}`, court: 'Ordre d’enlèvement', html: `
  <article class="lv-doc" aria-label="Ordre d’enlèvement">
    <div class="tete"><p class="t">[[ordre d’enlèvement|ORDRE D’ENLÈVEMENT]]</p><p class="n">N° ${NUMERO_OE} · émis le mercredi 9 décembre 2026</p></div>
    <div class="corps">
      <dl>
        <dt>De la part de</dt><dd><b>Smoby Toys — plateforme logistique</b><br>Moirans-en-Montagne (39260)</dd>
        <dt>À l’attention de</dt><dd>${KN_AGENCE.nom}, ${KN_AGENCE.agence} — service exploitation</dd>
        <dt>Enlèvement</dt><dd><b>${E1.id}</b> · commande de Noël · <b>${JOUR_LONG}</b>, à partir de <b>${E1.des}</b></dd>
        <dt>Lieu de chargement</dt><dd>Smoby Toys, plateforme logistique, Moirans-en-Montagne (39260)</dd>
        <dt>Livrer à</dt><dd>${CLIENT.nom} — voir la fiche client</dd>
      </dl>
      <h2>Marchandise</h2>
      <dl>
        <dt>Nature</dt><dd>${NATURES[0].lib}</dd>
        <dt>Conditionnement</dt><dd><b>${E1.pal} [[palette Europe|palettes Europe]]</b> (dont 1 palette mixte de complément)</dd>
        <dt>[[poids brut|Poids brut]] total</dt><dd><b>${kg(POIDS)} kg</b></dd>
      </dl>
      <p class="rem">Merci d’établir la [[lettre de voiture]] au départ. Contact quai : ${BRUNO.nom}, chef de quai.</p>
    </div>
    ${PIED}
  </article>` },

  { id: 'client', titre: `Fiche client — ${CLIENT.nom}`, court: 'Fiche client', html: `
  <article class="lv-doc" aria-label="Fiche client">
    <div class="tete"><p class="t">FICHE CLIENT</p><p class="n">${KN_AGENCE.nom} · ${KN_AGENCE.agence}</p></div>
    <div class="corps">
      <dl>
        <dt>Client</dt><dd><b>${CLIENT.nom}</b> — entrepôt</dd>
        <dt>Adresse de livraison</dt><dd><b>${CLIENT.ville}</b></dd>
        <dt>Jours de réception</dt><dd>du lundi au vendredi</dd>
        <dt>Heure limite de livraison</dt><dd><b>avant ${E1.avant.replace(':', ' h ')}</b></dd>
        <dt>Quai</dt><dd><b>${CLIENT.quai}</b></dd>
        <dt>Contact</dt><dd>service réception (par la messagerie)</dd>
      </dl>
      <p class="rem">Prévenir le client de tout retard dès qu’il est connu.</p>
    </div>
    ${PIED}
  </article>` },

  { id: 'planning', titre: 'Planning des chauffeurs — jeudi 10 décembre (extrait)', court: 'Planning', html: `
  <article class="lv-doc" aria-label="Planning des chauffeurs">
    <div class="tete"><p class="t">PLANNING DES CHAUFFEURS</p><p class="n">${KN_AGENCE.nom} · ${JOUR_LONG} · enlèvements chez Smoby</p></div>
    <div class="corps">
      <table>
        <thead><tr><th>Enlèvement</th><th>Vers</th><th>Chauffeur</th><th>Camion</th><th>Départ</th><th>Arrivée prévue</th></tr></thead>
        <tbody>${ORDRE_PLANNING.map(lignePlanning).join('')}</tbody>
      </table>
    </div>
    ${PIED}
  </article>` },
];

// ─────────────────────────────────────────────────────────────── la lettre de voiture

const L = (id, lib, choix, manque) => ({ type: 'liste', id, lib, vide: 'Choisir…', manque, choix });
export const LETTRE = {
  id: 'lettre', libelle: 'Lettre de voiture', titre: 'Lettre de voiture — enlèvement E1',
  sousTitre: 'Remplis chaque case à partir des trois documents, puis envoie la lettre au chauffeur.',
  documents: DOCUMENTS.map((d) => d.id),
  bouton: 'Ouvrir la lettre de voiture',
  grille: true,
  entete: `<p style="margin:0"><b>[[lettre de voiture|LETTRE DE VOITURE]]</b> — transport routier national de marchandises</p>`,
  pied: 'Document pédagogique, reconstitution, non contractuel. Pas de logo Kuehne+Nagel.',
  blocs: [
    { type: 'cadre', titre: 'Lettre de voiture', large: true, blocs: [
      { type: 'texte', id: 'numero', lib: 'N°', valeur: NUMERO_LV, fige: true },
      { type: 'date', id: 'date', lib: 'Établie le', manque: 'la date de la lettre' },
    ] },
    { type: 'cadre', titre: '1. [[Expéditeur]]', blocs: [
      L('expNom', 'Nom', ACTEURS, 'le nom de l’expéditeur'), L('expLieu', 'Adresse', LIEUX, 'l’adresse de l’expéditeur')] },
    { type: 'cadre', titre: '2. [[Destinataire]]', blocs: [
      L('destNom', 'Nom', ACTEURS, 'le nom du destinataire'), L('destLieu', 'Adresse', LIEUX, 'l’adresse du destinataire')] },
    { type: 'cadre', titre: '3. [[Transporteur]]', large: true, blocs: [
      L('transporteur', 'Transporteur', ACTEURS, 'le transporteur'),
      L('chauffeur', 'Chauffeur', CHAUFFEURS.map((c) => ({ v: c.id, lib: c.nom })), 'le chauffeur'),
      L('vehicule', 'Véhicule', CAMIONS.map((c) => ({ v: c.id, lib: c.nom })), 'le véhicule')] },
    { type: 'cadre', titre: '4. Prise en charge (chargement)', blocs: [
      L('chargLieu', 'Lieu', LIEUX, 'le lieu de chargement'),
      { type: 'date', id: 'chargDate', lib: 'Date', manque: 'la date de chargement' }] },
    { type: 'cadre', titre: '5. Livraison', blocs: [
      L('livLieu', 'Lieu', LIEUX, 'le lieu de livraison'),
      { type: 'date', id: 'livDate', lib: 'Date', manque: 'la date de livraison' }] },
    { type: 'cadre', titre: '6. Marchandise', large: true, blocs: [
      L('nature', 'Nature', NATURES, 'la nature de la marchandise'),
      { type: 'nombre', id: 'palettes', lib: 'Nombre de palettes', unite: 'palettes', manque: 'le nombre de palettes' },
      { type: 'nombre', id: 'poids', lib: 'Poids brut', unite: 'kg', manque: 'le poids' }] },
    { type: 'cadre', titre: '7. Signatures', large: true, blocs: [
      { type: 'encadre', texte: 'Au chargement : l’expéditeur et le chauffeur signent. À la livraison : le destinataire signe et note ses réserves s’il y en a.' }] },
  ],
  // Une vraie lettre peut partir mal remplie : le jalon « complète » le dit (décision de Tristan, 05/10/2026).
  envoi: { bouton: 'Envoyer la lettre de voiture', a: 'Julie', suite: 'Julie part à 6 h 00 avec ce document.', incomplet: true },
};

// ─────────────────────────────────────────────────────────────── le suivi du retard

export const SUIVI = {
  id: 'suivi', libelle: 'Suivi de l’enlèvement E1', titre: 'Suivi de l’enlèvement E1',
  sousTitre: `Message de Julie à ${ACCIDENT.replace(':', ' h ')} : accident sur l’A40, 1 h de retard.`,
  documents: ['planning', 'client'],
  bouton: 'Ouvrir le suivi de l’enlèvement E1',
  // Une fois la lettre envoyée, le Suivi reste au menu, même quand « Corriger » la rouvre (Q6, Tristan 07/10/2026).
  quand: (db) => apresFiche(LETTRE.id)(db) || !!(db.fiches && db.fiches[LETTRE.id] && db.fiches[LETTRE.id].envois),
  blocs: [
    { type: 'encadre', titre: 'Pour calculer', texte: 'Pars de l’heure d’arrivée prévue au planning et ajoute le retard. '
      + 'Le temps où Julie est arrêtée, moteur coupé, ne compte pas comme de la conduite.' },
    { type: 'heure', id: 'arrivee', lib: 'À quelle heure Julie arrivera-t-elle chez Jouets du Rhône ?', manque: 'l’heure d’arrivée' },
    { type: 'choix', id: 'avant', lib: 'Est-ce encore avant l’heure limite de livraison ?', manque: 'la réponse oui / non', choix: ['Oui', 'Non'] },
  ],
  envoi: { bouton: 'Envoyer au responsable d’exploitation', a: 'ton responsable', suite: 'Le client t’écrit dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── les messages par phrases

// Une heure proposée au client ; « avant votre heure limite » seulement si c'est vrai.
const phraseHeure = (m) => `Il arrivera vers ${enH(m)}${m < LIMITE ? ', avant votre heure limite' : ''}.`;
const HEURES = [ARRIVEE_PREVUE, ARRIVEE, LIMITE + 30];

export const PHRASES_CLIENT = {
  id: 'message-client',
  lignes: [
    { id: 'salut', choix: ['Bonjour,', 'Salut !', 'Coucou'], juste: 0 },
    { id: 'cause', choix: [
      'Notre camion a 1 h de retard à cause d’un accident sur l’A40.',
      'Notre camion a 30 min de retard à cause des bouchons.',
      'Notre camion ne pourra pas livrer aujourd’hui.'], juste: 0 },
    { id: 'heure', choix: HEURES.map(phraseHeure), juste: HEURES.indexOf(ARRIVEE) },
    { id: 'quai', choix: [
      `Pouvez-vous nous confirmer que le ${CLIENT.quai} sera libre ?`,
      'Pouvez-vous nous confirmer que le quai 1 sera libre ?'], juste: 0 },
    { id: 'fin', choix: ['Cordialement, l’exploitation Kuehne+Nagel Besançon', 'À plus !', 'Bisous'], juste: 0 },
  ],
  melanger: true,
};

export const PHRASES_SMOBY = {
  id: 'message-smoby',
  lignes: [
    { id: 'salut', choix: [`Bonjour ${BRUNO.nom},`, 'Salut !', `Coucou ${BRUNO.nom}`], juste: 0 },
    { id: 'retard', choix: [
      `La livraison ${E1.id} pour Jouets du Rhône aura 1 h de retard (accident).`,
      `La livraison ${E1.id} pour Jouets du Rhône est annulée.`,
      'La livraison E2 pour Maxi Jouets aura 1 h de retard (accident).'], juste: 0 },
    { id: 'client', choix: ['Le client est prévenu.', 'Pouvez-vous prévenir le client ?'], juste: 0 },
    { id: 'fin', choix: ['Cordialement,', 'Bisous', 'À plus !'], juste: 0 },
  ],
  melanger: true,
};

// ─────────────────────────────────────────────────────────────── les messages

export const RESPONSABLE = { nom: 'Responsable d’exploitation — Kuehne+Nagel Besançon', mail: `exploitation@${KN_AGENCE.mailDomain}` };
export const JULIE = { nom: 'Julie (chauffeuse, Kuehne+Nagel)', mail: `julie@${KN_AGENCE.mailDomain}` };
export const RECEPTION_CLIENT = { nom: 'Jouets du Rhône (fictif) — réception', mail: 'reception@jouets-du-rhone.example' };
export const SUJET_ACCUEIL = 'Lettre de voiture d’E1';
export const SUJET_JULIE = 'E1 : accident sur l’A40';
export const SUJET_CLIENT = 'Livraison E1 de ce matin';
export const SUJET_SMOBY = 'E1 bien parti ?';
const repondu = (id) => (db) => phrasesJustes(db, id).envoye;

// Les accusés des envois corrigés (séance `correction`) : ils ne rejouent pas l'histoire (le message de Julie n'est
// pas renvoyé) et ne disent jamais si la correction est juste.
const accuse = (de, sujet, texte) => (prenom) => ({ mails: [{
  folder: 'in', ts: Date.now() + 5000, from: de.nom, fromMail: de.mail, to: prenom, subject: sujet, kind: 'text', text: texte(prenom),
}] });

export const VOLET = {
  id: 'smoby-ent58',
  corrections: {
    [LETTRE.id]: accuse(RESPONSABLE, 'Lettre de voiture corrigée', (p) => `Merci ${p}, j’ai bien reçu ta lettre corrigée.`),
    [SUIVI.id]: accuse(RESPONSABLE, 'Suivi corrigé', (p) => `Merci ${p}, j’ai bien reçu ton suivi corrigé.`),
    [PHRASES_CLIENT.id]: accuse(RECEPTION_CLIENT, 'Votre message corrigé', () => 'Bien reçu, merci.\n\nLe service réception — Jouets du Rhône'),
    [PHRASES_SMOBY.id]: accuse({ nom: `${BRUNO.nom} (Smoby Moirans)`, mail: BRUNO.mail }, 'Ton message corrigé',
      () => 'Bien reçu, merci.\n\nBruno — Smoby Moirans'),
  },
  semer: (prenom) => ({
    mails: [{
      folder: 'in', ts: Date.now() - 60000, from: RESPONSABLE.nom, fromMail: RESPONSABLE.mail, to: prenom,
      subject: SUJET_ACCUEIL, kind: 'text',
      text: `Bonjour ${prenom} !\n\n`
        + `Ce matin, ${nomDe(CHAUFFEURS, D1.r)} part à ${enH(DEPART)} chez Smoby à Moirans pour l’[[enlèvement]] ${E1.id} `
        + `(commande de Noël, ${E1.pal} palettes pour Lyon).\n\n`
        + 'Prépare sa [[lettre de voiture]] avec l’[[ordre d’enlèvement]], la fiche client et le planning (en pièces jointes).\n\n'
        + 'S’il se passe quelque chose sur la route, c’est toi qui préviens le client et Smoby.',
      pieces: DOCUMENTS.map((d) => d.id),
      ouvreFiche: LETTRE.id,
    }],
  }),
  declencheurs: [{
    // La lettre envoyée (juste ou fausse) : l'accident, et le suivi s'ouvre.
    id: 'retard',
    quand: apresFiche(LETTRE.id),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 1000, from: JULIE.nom, fromMail: JULIE.mail, to: prenom,
      subject: SUJET_JULIE, kind: 'text',
      text: `${ACCIDENT.replace(':', ' h ')}. Accident sur l’A40, l’autoroute est fermée. Je suis arrêtée, moteur coupé. `
        + 'On m’annonce 1 h de retard.\n\nJulie',
      ouvreFiche: SUIVI.id,
    }] }),
  }, {
    // Le suivi envoyé (juste ou faux) : le client demande des nouvelles.
    id: 'client',
    quand: apresFiche(SUIVI.id),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 2000, from: RECEPTION_CLIENT.nom, fromMail: RECEPTION_CLIENT.mail, to: prenom,
      subject: SUJET_CLIENT, kind: 'text',
      text: `Bonjour,\n\nNous attendons votre camion ${E1.id} ce matin au ${CLIENT.quai}. Tout se passe bien ?\n\n`
        + 'Le service réception — Jouets du Rhône\n\n(Clique sur « Répondre » et choisis une phrase par ligne.)',
      phrases: PHRASES_CLIENT,
    }] }),
  }, {
    // Le client prévenu : l'expéditeur demande à son tour.
    id: 'smoby',
    quand: repondu(PHRASES_CLIENT.id),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 3000, from: `${BRUNO.nom} (Smoby Moirans)`, fromMail: BRUNO.mail, to: prenom,
      subject: SUJET_SMOBY, kind: 'text',
      text: `Bonjour l’exploitation,\n\n${nomDe(CHAUFFEURS, D1.r)} est partie à ${enH(DEPART)} avec les ${E1.pal} palettes d’${E1.id}. `
        + 'Tout va bien sur la route ?\n\nBruno — Smoby Moirans',
      phrases: PHRASES_SMOBY,
    }] }),
  }, {
    // Les deux prévenus : la fin de l'histoire, sans dire si c'était juste.
    id: 'fin',
    quand: repondu(PHRASES_SMOBY.id),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 4000, from: RESPONSABLE.nom, fromMail: RESPONSABLE.mail, to: prenom,
      subject: `RE : ${SUJET_ACCUEIL}`, kind: 'text',
      text: `Merci ${prenom}, c’est noté. La commande de Noël est sur la route : fin de ta mission chez nous.`,
    }] }),
  }],
};

// ─────────────────────────────────────────────────────────────── les jalons (26, barème sur 20)

// Lot 1 du brief SMOBY-notation-5.3-5.8, barème validé par Tristan le 07/10/2026 : une case = un jalon, chaque bloc
// a une part FIXE de la note sur 20.
//   Lettre : les parties 3 (4 champs à 0,75) · le transport 2,25 (3 à 0,75) · lieux et dates 2,5 (5 à 0,5 : les trois
//   dates sont la même) · la marchandise 3,25 (nature 0,75, palettes 1, poids 1,5) · Suivi 2 (heure 1,5, « Oui » 0,5) ·
//   Message au client 4 (cause, heure, quai à 1 ; salutation, fin à 0,5) · Message à Smoby 3 (retard, client à 1 ;
//   salutation, fin à 0,5). Total : 20. Le jalon « lettre complète » a disparu : une case vide est déjà fausse.
// `groupe` = la ligne du bandeau de fin (9 lignes) ; `ecran` = où l'élève corrige. Rien n'est vrai avant l'envoi ;
// une case vide est fausse (les listes démarrent sur « Choisir… », les dates et nombres sont vides).
export const BAREME = {
  expNom: 0.75, expLieu: 0.75, destNom: 0.75, destLieu: 0.75,
  transporteur: 0.75, chauffeur: 0.75, vehicule: 0.75,
  date: 0.5, chargLieu: 0.5, chargDate: 0.5, livLieu: 0.5, livDate: 0.5,
  nature: 0.75, palettes: 1, poids: 1.5,
  arrivee: 1.5, avant: 0.5,
  'client-cause': 1, 'client-heure': 1, 'client-quai': 1, 'client-salut': 0.5, 'client-fin': 0.5,
  'smoby-retard': 1, 'smoby-client': 1, 'smoby-salut': 0.5, 'smoby-fin': 0.5,
};
const LIBS = {
  date: 'date de la lettre', expNom: 'nom de l’expéditeur', expLieu: 'adresse de l’expéditeur', destNom: 'nom du destinataire',
  destLieu: 'adresse du destinataire', transporteur: 'transporteur', chauffeur: 'chauffeur', vehicule: 'véhicule',
  chargLieu: 'lieu de chargement', chargDate: 'date de chargement', livLieu: 'lieu de livraison', livDate: 'date de livraison',
  nature: 'nature', palettes: 'nombre de palettes', poids: 'poids',
};
const juste = (k, x) => (typeof ATTENDU[k] === 'number' ? lireNombre(x) === ATTENDU[k] : x === ATTENDU[k]);
export const CHAMPS = Object.keys(LIBS);
const vide = (x) => x == null || String(x).trim() === '';

// Un champ de la lettre. L'aide ne donne jamais la réponse : elle dit où chercher, ou nomme une confusion.
const INVERSES = 'Expéditeur et destinataire sont inversés : qui envoie, qui reçoit ?';
const PLANNING_E1 = 'Relis la ligne d’E1 du planning.';
const ORDRE = 'Tout est sur l’ordre d’enlèvement.';
const AIDES = {
  expNom: (v) => (v.expNom === ATTENDU.destNom ? INVERSES : ''),
  destNom: (v) => (v.destNom === ATTENDU.expNom ? INVERSES : ''),
  transporteur: (v) => (v.transporteur === 'smoby' ? 'Smoby envoie la marchandise : ce n’est pas lui qui la transporte.' : ''),
  chauffeur: () => PLANNING_E1,
  vehicule: () => PLANNING_E1,
  chargLieu: (v) => (v.chargLieu === ATTENDU.livLieu ? 'Le camion charge chez l’expéditeur, il livre chez le client.' : ''),
  nature: () => ORDRE,
  palettes: () => ORDRE,
  poids: () => ORDRE,
};
const PARTIES = 'Lettre : les parties', TRANSPORT = 'Lettre : le transport', LIEUX_DATES = 'Lettre : lieux et dates',
  MARCHANDISE = 'Lettre : la marchandise';
const GROUPE_LETTRE = {
  expNom: PARTIES, expLieu: PARTIES, destNom: PARTIES, destLieu: PARTIES,
  transporteur: TRANSPORT, chauffeur: TRANSPORT, vehicule: TRANSPORT,
  date: LIEUX_DATES, chargLieu: LIEUX_DATES, chargDate: LIEUX_DATES, livLieu: LIEUX_DATES, livDate: LIEUX_DATES,
  nature: MARCHANDISE, palettes: MARCHANDISE, poids: MARCHANDISE,
};
const jalonsLettre = Object.keys(GROUPE_LETTRE).map((k) => ({
  id: `lettre-${k}`, titre: `Lettre de voiture : ${LIBS[k]}`,
  groupe: GROUPE_LETTRE[k], ecran: `fiche:${LETTRE.id}`, poids: BAREME[k],
  verifier(db) {
    const f = ficheEnvoyee(db, LETTRE.id);
    if (!f.envoye) return { status: 'attente' };
    if (juste(k, f.valeurs[k])) return { status: 'ok' };
    if (vide(f.valeurs[k])) return { status: 'ko', detail: 'Case vide.' };
    const d = AIDES[k] ? AIDES[k](f.valeurs) : '';
    return { status: 'ko', detail: `Faux.${d ? ' ' + d : ''}` };
  },
}));

// Le suivi : l'heure, puis « avant l'heure limite ? », jugés chacun seul.
const AVANT = ARRIVEE < LIMITE ? 'Oui' : 'Non';
const SUIVI_E1 = 'Le suivi de l’enlèvement';
const jalonsSuivi = [{
  id: 'suivi-heure', titre: 'Nouvelle heure d’arrivée juste',
  groupe: SUIVI_E1, ecran: `fiche:${SUIVI.id}`, poids: BAREME.arrivee,
  verifier(db) {
    const f = ficheEnvoyee(db, SUIVI.id);
    if (!f.envoye) return { status: 'attente' };
    const h = lireHeure(f.valeurs.arrivee);
    if (h === ARRIVEE) return { status: 'ok' };
    if (h === ARRIVEE_PREVUE) return { status: 'ko', detail: 'C’est l’heure prévue au planning : il manque le retard.' };
    return { status: 'ko', detail: 'Heure prévue au planning + le retard annoncé par Julie.' };
  },
}, {
  id: 'suivi-avant', titre: 'Avant l’heure limite : la bonne réponse',
  groupe: SUIVI_E1, ecran: `fiche:${SUIVI.id}`, poids: BAREME.avant,
  verifier(db) {
    const f = ficheEnvoyee(db, SUIVI.id);
    if (!f.envoye) return { status: 'attente' };
    return f.valeurs.avant === AVANT ? { status: 'ok' } : { status: 'ko', detail: 'Compare la nouvelle heure à l’heure limite de la fiche client.' };
  },
}];

// Une ligne choisie d'un message = un jalon.
const jalonLigne = (P, ligne, id, titre, groupe, detail) => ({
  id, titre, groupe, ecran: `phrases:${P.id}`, poids: BAREME[id],
  verifier(db) {
    const r = phrasesJustes(db, P.id);
    if (!r.envoye) return { status: 'attente' };
    return r.justes.includes(ligne) ? { status: 'ok' } : { status: 'ko', detail };
  },
});
const C = 'Message au client', S = 'Message à Smoby';
const jalonsMessages = [
  jalonLigne(PHRASES_CLIENT, 'cause', 'client-cause', `${C} : la cause du retard`, `${C} : les informations`, 'Relis le message de Julie.'),
  jalonLigne(PHRASES_CLIENT, 'heure', 'client-heure', `${C} : la nouvelle heure`, `${C} : les informations`, 'La nouvelle heure est celle de ton suivi.'),
  jalonLigne(PHRASES_CLIENT, 'quai', 'client-quai', `${C} : le quai`, `${C} : les informations`, 'Le quai est sur la fiche client.'),
  jalonLigne(PHRASES_CLIENT, 'salut', 'client-salut', `${C} : la salutation`, `${C} : le ton`, 'On écrit à un client.'),
  jalonLigne(PHRASES_CLIENT, 'fin', 'client-fin', `${C} : la formule de fin`, `${C} : le ton`, 'On écrit à un client.'),
  jalonLigne(PHRASES_SMOBY, 'retard', 'smoby-retard', `${S} : la livraison en retard`, `${S} : les informations`, 'Quelle livraison, pour quel client ?'),
  jalonLigne(PHRASES_SMOBY, 'client', 'smoby-client', `${S} : ce qui est fait pour le client`, `${S} : les informations`, 'Qui a déjà prévenu le client ?'),
  jalonLigne(PHRASES_SMOBY, 'salut', 'smoby-salut', `${S} : la salutation`, `${S} : le ton`, 'On écrit à un partenaire.'),
  jalonLigne(PHRASES_SMOBY, 'fin', 'smoby-fin', `${S} : la formule de fin`, `${S} : le ton`, 'On écrit à un partenaire.'),
];

export const ETAPES = [...jalonsLettre, ...jalonsSuivi, ...jalonsMessages];

// ─────────────────────────────────────────────────────────────── l'accueil

export const ACCUEIL = {
  titre: 'La lettre de voiture et le retard',
  kpis: ['mail'],
  etapes: [
    ['Lire le message', 'Menu Messagerie : ton responsable te confie la lettre de voiture d’E1 ; l’ordre d’enlèvement, la fiche client et le planning sont joints.'],
    ['Remplir la lettre de voiture', 'Menu Lettre de voiture : chaque case se trouve dans un des trois documents. Puis envoie-la.'],
    ['Gérer le retard', 'Un message de Julie arrive : calcule sa nouvelle heure d’arrivée, puis préviens le client et Smoby (« Répondre », une phrase par ligne).'],
    ['Bon à savoir', 'Smoby, sa plateforme de Moirans-en-Montagne et l’agence Kuehne+Nagel de Besançon sont réelles. Le contrat entre les deux, '
      + 'Julie, le client Jouets du Rhône, l’accident et les horaires sont inventés pour l’exercice. Les documents sont des reconstitutions.'],
  ],
};
