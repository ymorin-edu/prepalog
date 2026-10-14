// ENT-7.2 — Decathlon, « passer la commande » : le contenu de la séance (brief `docs/briefs/ENT-7.2-decathlon-ordre-de-transport.md`).
// Données pures (conteneur, tirage, attendus) : `contenus/decathlon-ent72-donnees.js`. Univers commun : `contenus/decathlon.js`.
// Activité : `activites/decathlon-ordre-transport.js`. Questions : `contenus/questions/ENT-7.2.js`. Corrigé : `contenus/corriges/ENT-7.2.js`.
//
// Mercredi 27 janvier 2027, 9 h : la barge de Contargo est choisie (ENT-7.1). L'élève, alternant au service transport amont de Rouvignies,
// en GUIDAGE de C2.6 (échanger informations, documents et instructions par le moyen adapté) :
//   ① remplit et ENREGISTRE l'ordre de transport, en recopiant l'avis du terminal au caractère près ;
//   ② l'envoie par COURRIEL au prestataire (l'ordre en pièce jointe) ;
//   ③ APPELLE le chef de quai (tu poli) ;
//   ④ pose son conteneur sur un créneau libre du planning du quai.
// Rien n'est jugé à l'écran ; les réponses automatiques reprennent ce que l'élève a écrit, sans le corriger.
//
// VÉRIFIÉ / CONSTRUIT : voir MENTION (et l'en-tête de `contenus/decathlon.js`). Poids brut vérifié (VGM) : amendement SOLAS règle VI/2
// (résolution OMI MSC.380(94)), en vigueur le 1er juillet 2016, obligation du chargeur (coordinateur, 14/10/2026). Code civil art. 1366
// lu le 14/10/2026 sur un site tiers qui le cite (Légifrance non lisible depuis le poste) : à relire sur Légifrance.

import { apresGeste, apresPlanning, dialogueFini } from '../core/declencheurs.js';
import { etapesPlanning } from '../core/types/planning.js';
import { courrielsEnvoyes } from '../core/types/courriel.js';
import { jalonDialogue, reprises, leurresAppeles } from '../core/types/dialogue.js';
import { QUESTIONS } from './questions/ENT-7.2.js';
import { EQUIPE, LEXIQUE, mailDe, heureScenario, STYLE_DOCUMENTS, DOC_LISTE, DOC_DROIT, PIED, PRESTATAIRES, quand, kg, euros, co2, ech } from './decathlon.js';
import {
  ID, ID_VOLET, SCENARIO, FICHE, B, PLANNING_ID, DIALOGUE, OT, FICHIER, DISPO, LIMITE, ARRIVEE, PRIX, PRESTAS, TYPES, LIEUX_ENL, LIEUX_LIV, BONNES,
  jeuEleve, ordre, lireNombre, lireHeure, sansEspaces, cochees, prenomDe, creneauEnvoye, heureCreneau, INSTRUCTIONS_JUSTES, TIRAGE,
} from './decathlon-ent72-donnees.js';

export { ID, TIRAGE } from './decathlon-ent72-donnees.js';

const nrm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ─────────────────────────────────────────────────────────────── les documents
const docAvis = (db) => {
  const J = jeuEleve(db);
  return `<article class="dk-doc" aria-label="Avis de mise à disposition">
    <div class="dk-entete"><b>Port d’Anvers — terminal à conteneurs</b><span>Deurganckdok<br>Avis n° AV-2701-${String(J.scelle).replace(/\D/g, '').slice(-4)}</span></div>
    <p class="dk-t">Avis de [[mise à disposition]]</p>
    <p class="dk-st">Destinataire : Decathlon — entrepôt de Rouvignies (réf. ${ech(J.reference)})</p>
    <dl class="dk-dl">
      <dt>Conteneur</dt><dd class="dk-mono">${ech(J.conteneur)}</dd>
      <dt>Type</dt><dd>40 pieds high cube (40’ HC)</dd>
      <dt>[[scellé|Scellé]]</dt><dd class="dk-mono">${ech(J.scelle)}</dd>
      <dt>Poids brut vérifié</dt><dd>${kg(J.poids)} ([[poids brut vérifié|pesée]] avant embarquement)</dd>
      <dt>Marchandise</dt><dd>Textile et chaussures, non dangereuses, à température ambiante</dd>
      <dt>Douane</dt><dd>Dédouané à Anvers</dd>
      <dt>Référence Decathlon</dt><dd class="dk-mono">${ech(J.reference)}</dd>
      <dt>Disponible</dt><dd>à partir du ${quand(DISPO.iso, DISPO.h, { long: true })}, au terminal</dd>
    </dl>
    ${PIED('Document reconstitué — document pédagogique Prepalog. Numéros et dates construits.')}
  </article>`;
};

const docCahier = (db) => {
  const J = jeuEleve(db);
  return `<article class="dk-doc" aria-label="Cahier des charges">
    <div class="dk-entete"><b>DECATHLON</b><span>Entrepôt de Rouvignies · transport amont<br>Réf. ${ech(J.reference)}</span></div>
    <p class="dk-t">[[cahier des charges|Cahier des charges]] — réception d’un [[conteneur]] à Rouvignies</p>
    <dl class="dk-dl">
      <dt>[[donneur d’ordre|Donneur d’ordre]]</dt><dd>Decathlon, entrepôt de Rouvignies (service transport amont)</dd>
      <dt>Prestataire</dt><dd>Un prestataire référencé (liste jointe). Retenu pour ce conteneur : la barge de Contargo.</dd>
      <dt>Conteneur</dt><dd>40’ HC, poids brut ${kg(J.poids)}, dédouané à Anvers</dd>
      <dt>[[ordre de transport|Ordre de transport]]</dt><dd>Chaque commande est passée avec un ordre de transport : n° du conteneur, scellé, poids brut vérifié, type,
        lieu d’[[enlèvement]], date de mise à disposition, référence Decathlon, lieu de livraison, arrivée au plus tard, instructions.</dd>
      <dt>Arrivée au quai</dt><dd><b>Au plus tard le ${quand(LIMITE.iso, LIMITE.h, { long: true })}</b></dd>
      <dt>Livraison</dt><dd>Au quai de réception de Rouvignies, <b>sur [[rendez-vous au quai|rendez-vous]]</b> : le créneau se prend auprès du chef de quai.</dd>
      <dt>Scellé</dt><dd>Le [[scellé]] n’est pas brisé en route : il est ouvert au quai, à la réception.</dd>
      <dt>Conteneur vide</dt><dd>Ramené au terminal par le transporteur après le déchargement.</dd>
      <dt>Réception</dt><dd>Les dommages constatés à l’arrivée s’écrivent en réserves précises sur le document de livraison, avant le départ du chauffeur.</dd>
      <dt>Information CO₂</dt><dd>Chaque devis indique le CO₂ de la prestation, même pour un transport parti de l’étranger.</dd>
    </dl>
    ${PIED('Document reconstitué — document pédagogique Prepalog. Dates et références construites.')}
  </article>`;
};

const docDevis = (db) => {
  const J = jeuEleve(db);
  return `<article class="dk-doc" aria-label="Devis retenu">
    <div class="dk-entete"><b>Contargo — ${ech(PRESTATAIRES.barge.service)}</b><span>Anvers ↔ Valenciennes<br>${ech(PRESTATAIRES.barge.mail)}</span></div>
    <p class="dk-t">Devis n° CTG-ANT-27-0371 pour Decathlon (devis retenu)</p>
    <p class="dk-st">Entrepôt de Rouvignies · votre référence ${ech(J.reference)}</p>
    <dl class="dk-dl">
      <dt>Trajet</dt><dd>Terminal à conteneurs, port d’Anvers → Decathlon Rouvignies</dd>
      <dt>Mode</dt><dd>barge + camion</dd>
      <dt>Déroulé</dt><dd>[[enlèvement|Enlèvement]] au terminal d’Anvers dès la mise à disposition (${quand(DISPO.iso, DISPO.h)})<br>
        Barge : départ jeudi 28/01 au soir, arrivée au terminal de Bruay-sur-l’Escaut vendredi 29/01<br>
        Camion final : livraison au quai de Rouvignies ${quand(ARRIVEE.iso, ARRIVEE.h, { long: true })}</dd>
      <dt>Prix total HT</dt><dd><b>${euros(PRIX)}</b></dd>
    </dl>
    <p class="dk-co2"><span class="dk-gros">Information CO₂ de la prestation : ${kg(co2(J.poids, 'rouvignies', 'barge'))} de CO₂</span></p>
    ${PIED('Devis reconstitué — document pédagogique Prepalog. Prix, dates et CO₂ construits ; Contargo assure réellement la ligne Anvers ↔ Valenciennes.')}
  </article>`;
};

const DOC_MODELE = { id: 'modele', titre: 'Modèle d’ordre de transport (vierge)', court: 'Modèle d’ordre',
  html: `<article class="dk-doc" aria-label="Modèle d’ordre de transport">
    <p class="dk-t">[[ordre de transport|Ordre de transport]] — modèle vierge</p>
    <p class="dk-st">Le document par lequel le [[donneur d’ordre]] commande un transport et donne ses instructions</p>
    <table class="dk-t2"><thead><tr><th scope="col">Rubrique</th><th scope="col">Ce qu’on y écrit</th></tr></thead><tbody>
      <tr><td><b>Prestataire</b></td><td>Le transporteur à qui l’on commande</td></tr>
      <tr><td><b>Le conteneur</b></td><td>Numéro (le dernier chiffre est un [[chiffre de contrôle]]), type, numéro de [[scellé]], poids brut</td></tr>
      <tr><td><b>Enlèvement et livraison</b></td><td>Où et quand il est pris ; où et pour quand il est livré ; la référence du donneur d’ordre</td></tr>
      <tr><td><b>Instructions</b></td><td>Les consignes qui concernent CE transport, et seulement celles-là</td></tr>
    </tbody></table>
    ${PIED('Modèle construit — document pédagogique Prepalog, sans modèle d’entreprise réelle.')}
  </article>` };

const DOC_ECRIT = { id: 'ecrit', titre: 'Le droit : l’écrit électronique', court: 'Le droit (écrit)',
  html: `<article class="dk-doc" aria-label="Le droit : l’écrit électronique">
    <p class="dk-t">L’écrit électronique comme preuve</p>
    <p class="dk-st">Code civil, article 1366</p>
    <p class="dk-cite">« L’écrit électronique a la même force probante que l’écrit sur support papier, sous réserve que puisse être dûment identifiée la personne
      dont il émane et qu’il soit établi et conservé dans des conditions de nature à en garantir l’intégrité. »</p>
    <p>Un courriel avec une [[pièce jointe]] est un écrit électronique : il garde la trace de ce qu’on a demandé, à qui, et quand.</p>
    <p class="dk-pied">Texte réel — source : Code civil, art. 1366 (lu sur un site qui le cite le 14/10/2026 ; à relire sur Légifrance).</p>
  </article>` };

const DOC_PESEE = { id: 'pesee', titre: 'Le poids brut vérifié d’un conteneur', court: 'La pesée (SOLAS)',
  html: `<article class="dk-doc" aria-label="Le poids brut vérifié">
    <p class="dk-t">Le [[poids brut vérifié]] d’un conteneur</p>
    <p class="dk-st">Convention internationale SOLAS, règle VI/2 (amendée)</p>
    <ul class="dk-ul">
      <li>Depuis le <b>1er juillet 2016</b>, le poids brut d’un conteneur plein doit être <b>vérifié</b> (pesé) avant d’être chargé sur un navire.</li>
      <li>Le poids <b>brut</b> compte la marchandise, les emballages et le conteneur.</li>
      <li>L’obligation pèse sur le <b>chargeur</b> : celui qui expédie la marchandise, au départ.</li>
      <li>En France, elle est reprise par un arrêté du 28 avril 2016.</li>
    </ul>
    <p class="dk-pied">Sources : amendement SOLAS VI/2 (résolution OMI MSC.380(94), circulaire MSC.1/Circ.1548) ; arrêté du 28 avril 2016. Vérifié par le coordinateur le 14/10/2026.</p>
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.dk-mono{font-family:ui-monospace,Consolas,'Courier New',monospace; letter-spacing:.05em; font-weight:700}
`;
export const DOCUMENTS = [
  { id: 'avis', titre: 'Avis de mise à disposition', court: 'Avis de mise à disposition', html: docAvis },
  { id: 'cahier', titre: 'Cahier des charges', court: 'Cahier des charges', html: docCahier },
  { id: 'devis', titre: 'Devis Contargo (retenu)', court: 'Devis Contargo', html: docDevis },
  DOC_LISTE, DOC_MODELE, DOC_ECRIT, DOC_PESEE, DOC_DROIT,
];

// ─────────────────────────────────────────────────────────────── l'ordre de transport (fiche enregistrée)
const saisie = (type, id, lib, manque, o = {}) => ({ type, id, lib, manque, ...o });
export const FICHE_OT = {
  id: FICHE, libelle: 'Ordre de transport', titre: `Ordre de transport ${OT}`,
  sousTitre: 'Les documents à gauche : l’avis du terminal, le cahier des charges, le devis retenu.',
  entete: '<b>Donneur d’ordre :</b> Decathlon, entrepôt de Rouvignies — service transport amont.',
  documents: ['avis', 'cahier', 'devis'],
  largeurDocs: 0.9, serree: true, grille: true, defile: true,
  pied: 'Document reconstitué — document pédagogique Prepalog.',
  bouton: 'Ouvrir l’ordre de transport',
  blocs: (db) => {
    const J = jeuEleve(db);
    return [
      { type: 'cadre', titre: 'Prestataire', blocs: [{ type: 'liste', id: B.presta, lib: 'Transporteur', vide: 'Choisir…', choix: PRESTAS, manque: 'le transporteur' }] },
      { type: 'cadre', titre: 'Le conteneur', blocs: [
        saisie('texte', B.cont, 'N° de conteneur', 'le n° de conteneur'),
        { type: 'liste', id: B.type, lib: 'Type', vide: 'Choisir…', choix: TYPES, manque: 'le type du conteneur' },
        saisie('texte', B.scelle, 'N° de scellé', 'le n° de scellé'),
        saisie('nombre', B.poids, 'Poids brut', 'le poids brut', { unite: 'kg' }),
      ] },
      { type: 'cadre', titre: 'Enlèvement et livraison', large: true, blocs: [
        { type: 'liste', id: B.enl, lib: 'Lieu d’enlèvement', vide: 'Choisir…', choix: LIEUX_ENL, manque: 'le lieu d’enlèvement' },
        saisie('date', B.dispo, 'Disponible à partir du', 'la date de mise à disposition'),
        saisie('texte', B.ref, 'Référence Decathlon', 'la référence Decathlon'),
        { type: 'liste', id: B.liv, lib: 'Lieu de livraison', vide: 'Choisir…', choix: LIEUX_LIV, manque: 'le lieu de livraison' },
        saisie('date', B.limd, 'Arrivée au quai au plus tard le', 'la date limite d’arrivée'),
        saisie('heure', B.limh, 'à (heure)', 'l’heure limite d’arrivée'),
      ] },
      { type: 'cadre', titre: 'Instructions', large: true, blocs: [
        { type: 'cases', id: B.inst, choix: J.instructions.map((x) => ({ v: x.v, lib: x.lib })) },
        { type: 'encadre', texte: 'Recopie les numéros depuis l’avis, caractère par caractère.\nLe dernier chiffre du n° de conteneur est un chiffre de contrôle.\n'
          + 'N’ajoute que les instructions qui concernent ce conteneur.' },
      ] },
    ];
  },
  envoi: { enregistrer: true, nomPiece: FICHIER, bouton: 'Enregistrer l’ordre de transport', suite: 'Il est prêt à être joint à un courriel.' },
};

// ─────────────────────────────────────────────────────────────── le courriel au prestataire
export const CARNET = [
  { id: 'routiers', nom: PRESTATAIRES.route.nom, mail: PRESTATAIRES.route.mail, role: 'transporteur routier' },
  { id: 'contargo', nom: PRESTATAIRES.barge.nom, mail: PRESTATAIRES.barge.mail, role: 'barge · service réservations' },
  { id: 'rail', nom: PRESTATAIRES.rail.nom, mail: PRESTATAIRES.rail.mail, role: 'transport ferroviaire' },
  { id: 'quai', nom: 'Quai de réception Rouvignies', mail: mailDe('quai'), role: 'entrepôt Decathlon' },
  { id: 'claire', nom: EQUIPE.claire.nom, mail: mailDe('claire'), role: 'transport amont' },
];
const PRESTA_MAIL = ['routiers', 'contargo', 'rail'];
// Ce que chaque prestataire annonce (construit ; seule la barge est celle de l'ordre juste).
const HORAIRES = {
  contargo: { texte: 'Enlèvement confirmé : départ de la barge jeudi 28/01 au soir, arrivée au terminal de Bruay vendredi 29/01, livraison à votre quai lundi 01/02 vers 9 h.',
    signature: 'Service réservations, Contargo' },
  routiers: { texte: 'Enlèvement confirmé : départ du camion vendredi 29/01, livraison à votre quai mardi 02/02 vers 8 h.', signature: 'Affrètement, Routiers du Hainaut' },
  rail: { texte: 'Enlèvement confirmé : départ du train vendredi 29/01, livraison à votre quai mercredi 03/02 vers 10 h.', signature: 'Service commandes, Rail Flandres-Artois' },
};
// La réponse reprend le n° ÉCRIT DANS L'ORDRE DE L'ÉLÈVE (jamais celui de l'avis) et ne corrige rien.
export function reponse(c, db) {
  if (!PRESTA_MAIL.includes(c.a)) return null;
  const H = HORAIRES[c.a];
  if (!c.pieces.includes(`fiche:${FICHE}`)) {
    return { de: c.a, texte: 'Bonjour,\n\nnous ne pouvons pas enregistrer votre demande sans l’ordre de transport. Merci de nous le transmettre en pièce jointe.\n\n' + H.signature };
  }
  const n = String(ordre(db).v[B.cont] == null ? '' : ordre(db).v[B.cont]).trim();
  return { de: c.a, texte: `Bonjour,\n\nnous avons bien reçu votre ordre de transport ${OT} pour le conteneur ${n}. ${H.texte}\n\n${H.signature}` };
}
export const COURRIEL = { carnet: CARNET, pieces: ['cahier', 'avis'], reponse };

// ─────────────────────────────────────────────────────────────── le téléphone (le chef de quai)
const nomsLieu = { Q5: 'Quai 5', Q6: 'Quai 6', Q7: 'Quai 7' };
export const TELEPHONE = {
  libelle: 'Téléphone',
  quand: apresGeste('courriel:envoyer'),
  situation: 'Appelle le quai de réception pour réserver le créneau d’arrivée du conteneur.',
  leurres: [
    { id: 'claire', nom: 'Claire Vasseur', detail: 'responsable transport amont',
      message: 'Bonjour, vous êtes sur la messagerie de Claire Vasseur. Je suis en réunion : laissez-moi un message.' },
    { id: 'contargo', nom: 'Contargo — réservations', detail: 'service réservations',
      message: 'Bonjour, vous êtes sur la messagerie du service réservations de Contargo. Nos bureaux sont fermés pour le moment : laissez un message ou écrivez-nous par courriel.' },
  ],
  dialogues: [{
    id: DIALOGUE, de: 'mehdi',
    contact: { nom: 'Quai de réception — Rouvignies', detail: 'poste 214' },
    repliques: [
      { id: 'accueil', dit: 'Quai de réception de Rouvignies, Mehdi, j’écoute.',
        choix: [
          { v: 'presente', juste: true, lib: 'Bonjour, c’est {prenom}, du transport amont. Je t’appelle pour réserver un créneau pour un conteneur.' },
          { v: 'camion', lib: 'Salut, c’est pour un camion.', reaction: 'Euh… bonjour. C’est qui, et c’est pour quoi exactement ?' },
          { v: 'lundi', lib: 'Tu as de la place lundi ?', reaction: 'De la place pour quoi ? Tu es qui ?' },
        ] },
      { id: 'refs', dit: 'D’accord. Tu as les références ?',
        choix: [
          { v: 'juste', juste: true, lib: 'Oui : conteneur PRPU 000000 0, ordre de transport ' + OT + '.' },
          { v: 'inverse', lib: 'Oui : conteneur PRPU 000000 1, ordre de transport ' + OT + '.', reaction: 'Je ne le trouve pas, ce numéro. Relis-le sur ton avis.' },
          { v: 'collection', lib: 'C’est la collection printemps.', reaction: 'J’en reçois dix par semaine, de la collection printemps. Il me faut le numéro du conteneur.' },
        ],
        // Calculé UNE FOIS, sur l'AVIS de l'élève (le chef de quai lit l'avis du terminal, pas l'ordre de l'élève).
        selon: (db) => { const J = jeuEleve(db);
          return { libs: { juste: `Oui : conteneur ${J.conteneur}, ordre de transport ${OT}.`, inverse: `Oui : conteneur ${J.piege}, ordre de transport ${OT}.` } }; } },
      { id: 'arrivee', dit: 'Il arrive quand, et comment ?',
        choix: [
          { v: 'juste', juste: true, lib: 'Lundi 1er février vers 9 h, en camion depuis le terminal de Bruay.' },
          { v: 'bateau', lib: 'Par bateau, directement au quai.', reaction: 'Un bateau ne vient pas à mon quai ! Le dernier bout, c’est en camion, non ? Et quel jour ?' },
          { v: 'jeudi', lib: 'Jeudi.', reaction: 'Jeudi, c’est le départ d’Anvers. Moi, je veux le jour où il arrive ici.' },
        ] },
      { id: 'planning', dit: 'OK. Je t’ouvre le planning du quai de lundi : pose ton conteneur sur un créneau libre et envoie-le-moi.',
        choix: [
          { v: 'merci', juste: true, lib: 'D’accord, je le fais tout de suite. Merci !' },
          { v: 'salut', lib: 'C’est bon, salut !', reaction: '… Bon. Tu me l’envoies, le planning ?' },
        ] },
    ],
    fin: 'Merci, {prenom}. À tout de suite sur le planning.',
  }],
};

// ─────────────────────────────────────────────────────────────── le planning du quai (créneaux déjà pris)
const PRIS = 'Livraison d’un autre transporteur';
export const PLANNING = {
  id: PLANNING_ID, libelle: 'Planning du quai', titre: 'Quais de réception — Rouvignies, lundi 01/02/2027', date: 'Lundi 01/02/2027',
  quand: dialogueFini(DIALOGUE),
  infos: () => ['3 quais de réception ; ton conteneur arrive en camion à <b>09:00</b>',
    'Déchargement : <b>1 h 30</b>', 'Un quai ne reçoit qu’un conteneur à la fois', 'Un chauffeur n’attend pas plus d’une heure avant d’être déchargé'],
  echelle: { type: 'heures', debut: '07:00', fin: '13:00', pas: 30 },
  lignes: { titre: 'Planning du quai — lundi 01/02/2027', liste: [
    { id: 'Q5', nom: 'Quai 5', occupe: [{ de: '07:30', a: '10:30', titre: PRIS }, { de: '11:00', a: '12:00', titre: PRIS }] },
    { id: 'Q6', nom: 'Quai 6', occupe: [{ de: '08:00', a: '09:30', titre: PRIS }, { de: '11:00', a: '12:30', titre: PRIS }] },
    { id: 'Q7', nom: 'Quai 7', occupe: [{ de: '09:00', a: '12:00', titre: PRIS }] },
  ] },
  cartes: { titre: 'Ton conteneur à placer',
    liste: [{ id: 'cont', titre: 'Ton conteneur · 1 h 30', court: 'Ton conteneur', famille: 'cont', des: '09:00', avant: '13:00' }],
    details: () => [],
    duree: () => 90,
    nonPosees: () => 'Ton conteneur n’est pas encore posé.',
    legende: ' ' },   // une légende vide : la consigne (à gauche) dit déjà comment poser la carte, et la page doit tenir à 1280 × 720
  familles: { cont: { couleur: '#f0be00', nom: 'jaune', legende: 'ton conteneur' } },
  regles: [
    { id: 'un', type: 'unAlaFois', sur: 'ligne' },
    { id: 'fen', type: 'fenetre', message: { debut: () => 'Le déchargement commence avant l’arrivée du camion.', fin: () => 'Le déchargement finit trop tard.' } },
    { id: 'att', type: 'attenteMax', minutes: 60, message: () => 'Le chauffeur attend plus d’une heure avant d’être déchargé.' },
  ],
  jalons: [{ id: 'creneau', lib: 'Un créneau libre, après l’arrivée du camion, sans attendre plus d’une heure', regles: ['un', 'fen', 'att'] }],
  aides: {
    consignes: { regles: 'Glisse ton conteneur sur un quai, à l’heure où commence le déchargement (ou clique-le, puis clique la case). Un quai ne reçoit qu’un conteneur à la fois : les blocs gris pointillés sont déjà pris. Le déchargement dure 1 h 30 ; il ne peut pas commencer avant l’arrivée du camion (09:00), et le chauffeur n’attend pas plus d’une heure.' },
  },
};

// ─────────────────────────────────────────────────────────────── les messages
const CLAIRE = { nom: EQUIPE.claire.nom, mail: mailDe('claire') };
const MEHDI = { nom: EQUIPE.mehdi.nom, mail: mailDe('mehdi') };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, CLAIRE, 'Un nouveau conteneur à commander',
      `Bonjour ${prenom},\n\non a retenu la barge de Contargo pour les conteneurs de la collection printemps. Un nouveau vient d’être [[mise à disposition|mis à disposition]] à Anvers.\n\n`
        + 'À toi de passer la commande : remplis l’[[ordre de transport]], envoie-le à Contargo par courriel, puis appelle le quai pour le créneau.\n\nClaire',
      { extra: { pieces: ['avis', 'cahier', 'devis', 'liste'], ouvreFiche: FICHE } }),
  ] }),
  declencheurs: [
    // Le planning envoyé (juste ou faux) : le chef de quai reprend le créneau que l'élève a choisi, puis Claire. Aucun ne dit si c'est juste.
    { id: 'creneau-recu', quand: apresPlanning(PLANNING_ID),
      semer: (prenom, db) => {
        const p = creneauEnvoye(db);
        const t = p ? `C’est noté : ${nomsLieu[p.r] || p.r}, lundi 01/02 à ${heureCreneau(p.s)}. Merci !\n\nMehdi` : 'C’est noté. Merci !\n\nMehdi';
        return { mails: [
          mail(prenom, MEHDI, 'Ton créneau', t, { db, decalage: 1 }),
          mail(prenom, CLAIRE, 'Commande passée', `Merci ${prenom}. Commande passée, créneau réservé : je regarde tout ça.\n\nClaire`, { db, decalage: 3 }),
        ] };
      } },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (11 + 1 de passage : 17 + 3 de questions = 20)
// Poids validés par Tristan le 14/10/2026 (option b, §11 n° 1) : Ordre 10 (3 · 1,5 · 1,5 · 1,5 · 1,5 · 1) · Courriel 4 (3 · 1) · Appel 3 (1,5 · 1,5) ·
// questions 3 (`part`). Rien n'est vrai avant l'enregistrement, l'envoi, le raccrochage ou l'envoi du planning : l'inaction vaut 0.
export const GROUPES = {
  conteneur: 'Ordre de transport : le conteneur', transport: 'Ordre de transport : enlèvement et livraison', instructions: 'Ordre de transport : les instructions',
  destinataire: 'Courriel : destinataire et pièce jointe', forme: 'Courriel : la forme', appel: 'Appel au quai', creneau: 'Créneau au quai',
};
export const POIDS = { 'ot-conteneur': 3, 'ot-scelle': 1.5, 'ot-poids-type': 1.5, 'ot-presta-enlevement': 1.5, 'ot-livraison-limite': 1.5, 'ot-instructions': 1,
  'courriel-destinataire': 3, 'courriel-forme': 1, 'appel-quai': 1.5, creneau: 1.5 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = { status: 'ko' };

const jalonOrdre = (id, groupe, titre, juste) => ({ id, titre, groupe: GROUPES[groupe], poids: POIDS[id],
  verifier(db) { const o = ordre(db); return o.envoye ? (juste(o.v, jeuEleve(db)) ? ok : ko) : attente; } });

// Le courriel qui porte l'ordre à Contargo (le premier) ; à défaut, le dernier courriel à un prestataire ; à défaut, le dernier courriel.
export function courrielJuge(db) {
  const L = courrielsEnvoyes(db, ID);
  const porte = L.find((c) => c.a === 'contargo' && c.pieces.includes(`fiche:${FICHE}`));
  if (porte) return porte;
  const aPresta = L.filter((c) => PRESTA_MAIL.includes(c.a));
  return aPresta.length ? aPresta[aPresta.length - 1] : (L[L.length - 1] || null);
}
export function formeCourriel(c, db) {
  const J = jeuEleve(db);
  const objet = nrm(c.objet), compact = objet.replace(/\s/g, '');
  const objetOk = compact.includes(nrm(J.sansEspaces)) || objet.includes('ordre de transport') || compact.includes(nrm(OT));
  const corps = nrm(c.corps);
  const lignes = String(c.corps || '').split('\n').map((x) => nrm(x).trim()).filter(Boolean).slice(-3).join(' ');
  const prenom = nrm(prenomDe(db)).trim();
  const signe = lignes.includes('decathlon') || (prenom !== '' && lignes.includes(prenom));
  const formule = /\b(bonjour|madame|monsieur)\b/.test(corps);
  const tutoie = /\b(tu|te|ton|ta|salut|stp)\b/.test(corps);
  return objetOk && formule && signe && !tutoie;
}

export const ETAPES = [
  jalonOrdre('ot-conteneur', 'conteneur', 'L’ordre : le numéro du conteneur, recopié au caractère près', (v, J) => sansEspaces(v[B.cont]) === J.sansEspaces.toUpperCase()),
  jalonOrdre('ot-scelle', 'conteneur', 'L’ordre : le numéro de scellé', (v, J) => sansEspaces(v[B.scelle]) === sansEspaces(J.scelle)),
  jalonOrdre('ot-poids-type', 'conteneur', 'L’ordre : le poids brut et le type de conteneur',
    (v, J) => lireNombre(v[B.poids]) === J.poids && v[B.type] === BONNES.type),
  jalonOrdre('ot-presta-enlevement', 'transport', 'L’ordre : le transporteur retenu et le lieu d’enlèvement',
    (v) => v[B.presta] === BONNES.presta && v[B.enl] === BONNES.enl),
  jalonOrdre('ot-livraison-limite', 'transport', 'L’ordre : le lieu de livraison et l’arrivée au plus tard',
    (v) => v[B.liv] === BONNES.liv && v[B.limd] === LIMITE.iso && lireHeure(v[B.limh]) === LIMITE.h * 60),
  jalonOrdre('ot-instructions', 'instructions', 'L’ordre : les instructions qui concernent ce conteneur, et elles seules',
    (v, J) => { const c = cochees(v); return INSTRUCTIONS_JUSTES.every((x) => c.includes(x.v)) && J.fausses.every((f) => !c.includes(f)); }),
  { id: 'ot-enregistre', compte: false, titre: 'L’ordre de transport est enregistré', verifier: (db) => (ordre(db).envoye ? ok : attente) },
  { id: 'courriel-destinataire', titre: 'Le courriel : envoyé à Contargo avec l’ordre en pièce jointe', groupe: GROUPES.destinataire, poids: POIDS['courriel-destinataire'],
    verifier(db) {
      const L = courrielsEnvoyes(db, ID);
      if (!L.length) return attente;
      return L.some((c) => c.a === 'contargo' && c.pieces.includes(`fiche:${FICHE}`)) ? ok : ko;
    } },
  { id: 'courriel-forme', titre: 'Le courriel : un objet clair, une formule d’appel, le vouvoiement et une signature', groupe: GROUPES.forme, poids: POIDS['courriel-forme'],
    verifier(db) {
      const c = courrielJuge(db);
      return c ? (formeCourriel(c, db) ? ok : ko) : attente;
    } },
  // L'appel fini avec au plus 2 reprises ; un contact sans dialogue appelé AVANT le quai compte comme une reprise (décision du 14/10/2026).
  { ...jalonDialogue({ seance: ID, dialogue: DIALOGUE, id: 'appel-quai', titre: 'L’appel au quai : mené jusqu’au bout avec au plus deux reprises', groupe: GROUPES.appel,
    poids: POIDS['appel-quai'], juge: (a, db) => reprises(a) + leurresAppeles(db.dialogues && db.dialogues[ID], { avant: DIALOGUE }).length <= 2 }), ecran: undefined },
  ...etapesPlanning(PLANNING).map((e) => Object.assign(e, { id: 'creneau', titre: 'Le créneau : un quai libre, après l’arrivée du camion, sans attendre plus d’une heure',
    groupe: GROUPES.creneau, poids: POIDS.creneau })),
  // Le bonus du confirmé : une instruction fausse de plus (« hayon élévateur »), non cochée. `null` si l'élève ne l'a pas reçue.
  { id: 'bonus-hayon', bonus: true, titre: 'Instruction en trop non cochée',
    verifier(db) {
      const J = jeuEleve(db);
      if (!J.bonusV.length) return null;
      const o = ordre(db);
      return o.envoye ? (J.bonusV.every((f) => !cochees(o.v).includes(f)) ? ok : ko) : attente;
    } },
];

// ─────────────────────────────────────────────────────────────── les pastilles d'étape (« fait », jamais « juste »)
export const PASTILLES = [
  { libelle: 'Ordre de transport', fait: (db) => ordre(db).envoye },
  { libelle: 'Courriel au prestataire', fait: (db) => courrielsEnvoyes(db, ID).length > 0 },
  { libelle: 'Appel au quai', fait: (db) => dialogueFini(DIALOGUE)(db, ID) },
  { libelle: 'Créneau', fait: (db) => !!creneauEnvoye(db) },
];

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
export const LEXIQUE_72 = {
  ...LEXIQUE,
  'ordre de transport': 'Document par lequel le donneur d’ordre commande un transport à un prestataire et lui donne ses instructions.',
  'donneur d’ordre': 'Celui qui commande et paie le transport. Ici : Decathlon.',
  'chiffre de contrôle': 'Dernier chiffre du numéro d’un conteneur, calculé à partir des autres : il fait repérer une erreur de recopie.',
  'poids brut vérifié': 'Poids du conteneur plein (marchandise, emballages, conteneur), pesé avant l’embarquement sur un navire.',
  enlèvement: 'Moment et lieu où le transporteur prend le conteneur pour le transporter.',
  créneau: 'Plage d’heures réservée pour décharger un camion à un quai.',
  'rendez-vous au quai': 'Heure et quai fixés à l’avance pour décharger un camion, afin que les quais ne se bloquent pas.',
  'pièce jointe': 'Fichier joint à un courriel.',
};
export const MENTION = 'Réels : Decathlon et son entrepôt de Rouvignies (Nord), la ligne de barges de Contargo entre Anvers et Valenciennes, la règle internationale de '
  + 'pesée des conteneurs (SOLAS, depuis 2016), le Code civil (art. 1366). Construit : le format de l’ordre de transport, tous les numéros, le planning du quai, le chef '
  + 'de quai (Mehdi Benali), les réponses des prestataires (aucune personne de Contargo n’est nommée), Claire.';
export const ACCUEIL = {
  titre: 'Passer la commande',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Claire', 'Menu Messagerie : l’avis du terminal, le cahier des charges, le devis retenu et la liste référencée sont joints.'],
    ['① L’ordre de transport', 'Remplis l’ordre à partir de l’avis du terminal, puis enregistre-le.'],
    ['② Le courriel', 'Écris à ton prestataire et joins l’ordre.'],
    ['③ L’appel au quai', 'Après ton premier courriel, appelle le chef de quai pour le créneau d’arrivée.'],
    ['④ Le créneau', 'Après l’appel, pose ton conteneur sur le planning du quai.'],
    ['Bon à savoir', MENTION],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 2 : passer la commande',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_72,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiche: FICHE_OT,
  courriel: COURRIEL,
  telephone: TELEPHONE,
  planning: PLANNING,
  pastilles: PASTILLES,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
