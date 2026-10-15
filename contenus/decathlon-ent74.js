// ENT-7.4 — Decathlon, évaluation « un conteneur pour Dourges » : le contenu de la séance (brief `docs/briefs/ENT-7.4-decathlon-evaluation-dourges.md`).
// Données pures (conteneur, offres, tirage, attendus) : `contenus/decathlon-ent74-donnees.js`. Univers commun : `contenus/decathlon.js`.
// Activité : `activites/decathlon-evaluation-dourges.js`. Questions : `contenus/questions/ENT-7.4.js`. Corrigé : `contenus/corriges/ENT-7.4.js`.
//
// Lundi 1er mars 2027, 8 h 30 : l'élève, alternant au service transport amont (Claire est en déplacement toute la semaine), est ÉVALUÉ sur C2.6.1 et C2.6.2.
// Un conteneur arrive à Anvers pour l'entrepôt Decathlon de DOURGES (Delta 3). Seul, sans aide :
//   ① Choisir : lire le besoin, trier les offres, comparer prix et CO₂, décider et justifier (comparateur, comme ENT-7.1) ;
//   ② Transmettre : remplir l'ordre de transport, l'envoyer au prestataire RETENU par courriel (ordre en pièce jointe), appeler le quai de Dourges.
// Contre la copie (décision 22) : l'offre référencée en retard est tirée par élève (le rail ou la barge) ; le numéro du conteneur, le scellé, le poids,
// la référence, le contenu, les prix et les instructions de l'ordre sont tirés aussi. Rien à l'écran ne dit juste ou faux : aucun encadré, aucune phrase
// d'aide, aucune réaction du chef de quai. Les pastilles disent « fait », jamais « juste ». Une erreur ne se paie qu'une fois : l'ordre, le courriel et
// l'appel se jugent sur l'offre que l'élève a RETENUE (ou commandée) ; seule la décision dit si le choix était le bon.
//
// VÉRIFIÉ / CONSTRUIT : voir MENTION. Vérifié (Cowork, 13/10/2026) : Dourges (62), plateforme multimodale Delta 3, entrepôt continental de Decathlon ;
// terminal rail-barge LDCT ; barge Anvers → Dourges de Contargo, 2 à 3 dessertes par semaine (communiqué du 04/02/2025). Construit : que Decathlon utilise
// ces services, toutes les offres, le chef de quai (Yanis Haddad), Claire, les dates.

import { apresFiche, apresGeste, dialogueFini } from '../core/declencheurs.js';
import { courrielsEnvoyes } from '../core/types/courriel.js';
import { jalonDialogue, premiereReponse } from '../core/types/dialogue.js';
import { QUESTIONS } from './questions/ENT-7.4.js';
import { CARTE, EQUIPE, mailDe, heureScenario, STYLE_DOCUMENTS, DOC_LISTE, PIED, PRESTATAIRES, nomLieu, quand, kg, euros, ech, JOURS } from './decathlon.js';
import {
  ID, ID_VOLET, SCENARIO, DESTINATION, CMP, OT, DIALOGUE, B, BO, COL, DISPO, LIMITE, BUDGET, OT_NUM, FICHIER, CRITERES, CRITERE_JUSTE, JUSTIFS, JUSTIF_JUSTE,
  PRESTAS, PRESTA_DE, TYPES, LIEUX_ENL, LIEUX_LIV, BONNES, INSTRUCTIONS_JUSTES,
  jeuEleve, fiche, tri, reporte, lireNombre, lireHeure, sansEspaces, caseDe, casePrix, caseCO2, cochees, prenomDe, commandee,
} from './decathlon-ent74-donnees.js';
import { hasard } from '../core/tirage.js';

export { ID, TIRAGE } from './decathlon-ent74-donnees.js';

const nrm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const LETTRES = ['a', 'b', 'c', 'd'];
const idDevis = (i) => `devis-${LETTRES[i]}`;
const libOffre = (o) => `${o.lettre} — ${o.nom}`;
const PRESTA_MAIL = ['routiers', 'contargo', 'rail'];
// Une évaluation n'a aucune aide : pas de mot cliquable. On retire le balisage [[mot|texte]] des documents repris des séances de travail.
const sansMots = (html) => html.replace(/\[\[([^\]|]*)\|?([^\]]*)\]\]/g, (m, a, b) => b || a);

// ─────────────────────────────────────────────────────────────── les documents (sans mot cliquable)
const docCahier = (db) => {
  const J = jeuEleve(db);
  return `<article class="dk-doc" aria-label="Cahier des charges">
    <div class="dk-entete"><b>DECATHLON</b><span>Entrepôt de Dourges (Delta 3) · transport amont<br>Réf. ${ech(J.reference)}</span></div>
    <p class="dk-t">Cahier des charges — acheminement d’un conteneur à Dourges</p>
    <dl class="dk-dl">
      <dt>Conteneur</dt><dd class="dk-mono">${ech(J.conteneur)}</dd><dt></dt><dd>40’ HC (40 pieds high cube), poids brut ${kg(J.poids)}</dd>
      <dt>Contenu</dt><dd>${ech(J.contenu)}</dd>
      <dt>Situation</dt><dd>Dédouané à Anvers. Disponible au terminal d’Anvers le ${quand(DISPO.iso, DISPO.h, { long: true })}.</dd>
      <dt>Destination</dt><dd>Entrepôt Decathlon de Dourges (62), plateforme Delta 3, quai de réception, sur rendez-vous</dd>
      <dt>Arrivée au quai</dt><dd><b>Au plus tard le ${quand(LIMITE.iso, LIMITE.h, { long: true })}</b></dd>
      <dt>Budget</dt><dd><b>${euros(BUDGET)} HT</b> au maximum, tout compris (transport, manutention, camion final)</dd>
      <dt>Prestataire</dt><dd>Obligatoirement un prestataire référencé (liste du transport amont)</dd>
      <dt>Critère de choix</dt><dd>Parmi les offres qui tiennent la date et le budget, retenir <b>celle qui émet le moins de CO₂</b></dd>
      <dt>Information CO₂</dt><dd>Chaque devis indique le CO₂ de la prestation, calculé selon la méthode du Code des transports</dd>
    </dl>
    ${PIED('Document reconstitué — document pédagogique Prepalog. Dates, budget et références construits.')}
  </article>`;
};

const docAvis = (db) => {
  const J = jeuEleve(db);
  return `<article class="dk-doc" aria-label="Avis de mise à disposition">
    <div class="dk-entete"><b>Port d’Anvers — terminal à conteneurs</b><span>Deurganckdok<br>Avis n° AV-2703-${String(J.valeurs.scelle).replace(/\D/g, '').slice(-4)}</span></div>
    <p class="dk-t">Avis de mise à disposition</p>
    <p class="dk-st">Destinataire : Decathlon — entrepôt de Dourges (réf. ${ech(J.reference)})</p>
    <dl class="dk-dl">
      <dt>Conteneur</dt><dd class="dk-mono">${ech(J.conteneur)}</dd>
      <dt>Type</dt><dd>40 pieds high cube (40’ HC)</dd>
      <dt>Scellé</dt><dd class="dk-mono">${ech(J.scelle)}</dd>
      <dt>Poids brut vérifié</dt><dd>${kg(J.poids)}</dd>
      <dt>Marchandise</dt><dd>${ech(J.contenu)}, non dangereuses, à température ambiante</dd>
      <dt>Douane</dt><dd>Dédouané à Anvers</dd>
      <dt>Référence Decathlon</dt><dd class="dk-mono">${ech(J.reference)}</dd>
      <dt>Disponible</dt><dd>à partir du ${quand(DISPO.iso, DISPO.h, { long: true })}, au terminal</dd>
    </dl>
    ${PIED('Document reconstitué — document pédagogique Prepalog. Numéros et dates construits.')}
  </article>`;
};

const PIED_CONTARGO = 'Devis reconstitué — document pédagogique Prepalog. Prix, dates et CO₂ construits ; Contargo assure réellement des barges d’Anvers à Dourges.';
const PIED_FICTIF = 'Devis reconstitué — document pédagogique Prepalog. Prestataire fictif ; prix, dates et CO₂ construits.';
function devisHtml(o) {
  if (!o) return '<article class="dk-doc"><p class="dk-st">Pas de devis à cette place.</p></article>';
  const km = o.troncons.map((s) => `${s.type === 'camion' ? 'camion' : s.type} ${s.km} km`).join(' + ');
  const qui = o.prestataire === 'barge' ? `${ech(o.nom)} — ${ech(PRESTATAIRES.barge.service)}` : ech(o.nom);
  return `<article class="dk-doc" aria-label="Devis ${ech(o.devis)}">
    <div class="dk-entete"><b>${qui}</b><span>${ech(o.ville || 'Transport — Benelux et nord de la France')}<br>${ech(o.mail)}</span></div>
    <p class="dk-t">DEVIS n° ${ech(o.devis)} pour Decathlon</p>
    <p class="dk-st">Entrepôt de Dourges · devis du lundi 01/03/2027</p>
    <dl class="dk-dl">
      <dt>Trajet</dt><dd>${ech(nomLieu('anvers'))} → ${ech(nomLieu('delta3'))}</dd>
      <dt>Mode</dt><dd>${ech(o.modeLib)}</dd>
      <dt>Déroulé</dt><dd>${o.deroule.map(ech).join('<br>')}</dd>
      <dt>Arrivée au quai</dt><dd><b>${quand(o.arrivee.iso, o.arrivee.h, { long: true })}</b></dd>
      <dt>Prix total HT</dt><dd><b>${euros(o.prix)}</b></dd>
    </dl>
    <p class="dk-co2"><span class="dk-gros">Information CO₂ de la prestation : ${kg(o.co2)} de CO₂</span><br>
      <small>Calcul selon la méthode du Code des transports, sur ${km}.</small></p>
    ${PIED(o.prestataire === 'barge' ? PIED_CONTARGO : PIED_FICTIF)}
  </article>`;
}

export const STYLE = `${STYLE_DOCUMENTS}
.dk-mono{font-family:ui-monospace,Consolas,'Courier New',monospace; letter-spacing:.05em; font-weight:700}
`;
export const DOCUMENTS = [
  { id: 'avis', titre: 'Avis de mise à disposition', court: 'Avis de mise à disposition', html: docAvis },
  { id: 'cahier', titre: 'Cahier des charges', court: 'Cahier des charges', html: docCahier },
  { ...DOC_LISTE, html: sansMots(DOC_LISTE.html) },
  ...LETTRES.map((l, i) => ({ id: idDevis(i), titre: `Devis ${l.toUpperCase()}`, court: `Devis ${l.toUpperCase()}`, html: (db) => devisHtml(jeuEleve(db).offres[i]) })),
];
// Les 4 devis de l'élève (3 offres référencées et 1 hors liste).
export const devisDe = (db) => jeuEleve(db).offres.map((o, i) => idDevis(i));

// ─────────────────────────────────────────────────────────────── le comparateur d'offres (aucun encadré)
// La feuille ③ : un bloc CONSTANT par fiche (la feuille garde son état dans l'objet), ses lignes calculées sur le jeu de l'élève.
export function lignesOffres(db) {
  const J = jeuEleve(db);
  const saisie = (attendu) => ({ saisie: true, attendu, tolerance: 0, placeholder: ' ' });
  return [
    { A: 'Devis', B: 'Prix total (€ HT)', C: 'CO₂ (kg)', entete: true },
    ...J.offres.map((o) => ({ A: libOffre(o), B: saisie(o.prix), C: saisie(o.co2) })),
  ];
}
const BLOC_OFFRES = { type: 'grille', id: B.offres, titre: '③ Comparer : reporte le prix et le CO₂ de chaque devis', lignes: lignesOffres, manque: 'des cases du tableau ({n})',
  feuille: { colonnes: ['A', 'B', 'C'], decimales: 0, largeurs: { A: '52%', B: '24%', C: '24%' } } };
const blocTri = (db) => {
  const J = jeuEleve(db);
  return { type: 'ouinon', id: B.tri, titre: '② Trier les offres', entete: 'Devis', manque: 'le tri des offres ({n} case(s))',
    lignes: J.offres.map((o) => ({ id: o.slot, lib: libOffre(o) })),
    colonnes: [{ id: COL.liste, lib: 'Dans la liste référencée ?' }, { id: COL.date, lib: 'Tient la date ?' }] };
};
// L'ordre des phrases de justification est tiré par élève (recalculé de la graine, rien n'est rangé).
const justifs = (db) => {
  const g = db && db.tirages && db.tirages[ID] && db.tirages[ID].graine;
  return g ? hasard(`${g}|justif74`).melanger(JUSTIFS) : JUSTIFS;
};

export const FICHE_CMP = {
  id: CMP, libelle: 'Comparateur d’offres', titre: 'Comparateur d’offres',
  sousTitre: 'Les documents à gauche : le cahier des charges, la liste référencée, un devis par offre.',
  documents: (db) => ['cahier', 'liste', ...devisDe(db)],
  largeurDocs: 0.9, serree: true, defile: true,
  bouton: 'Ouvrir le comparateur d’offres',
  blocs: (db) => [
    { type: 'cadre', titre: '① Le besoin', blocs: [
      { type: 'date', id: B.limite, lib: 'Arrivée au quai au plus tard le', manque: 'la date limite' },
      { type: 'heure', id: B.heure, lib: 'à (heure)', manque: 'l’heure limite' },
      { type: 'nombre', id: B.budget, lib: 'Budget maximum', unite: '€ HT', min: 0, entier: true, manque: 'le budget' },
      { type: 'liste', id: B.critere, lib: 'Pour départager les offres qui tiennent la date', vide: 'Choisir…', choix: CRITERES, manque: 'le critère' },
    ] },
    blocTri(db),
    BLOC_OFFRES,
    { type: 'cadre', titre: '④ Ma décision', blocs: [
      { type: 'liste', id: B.retenue, lib: 'Je retiens', vide: 'Choisir une offre…', choix: jeuEleve(db).offres.map((o) => ({ v: o.slot, lib: libOffre(o) })), manque: 'l’offre retenue' },
      { type: 'choix', id: B.justif, lib: 'Ma justification', colonne: true, choix: justifs(db), manque: 'ta justification' },
    ] },
  ],
  envoi: { bouton: 'Envoyer mon choix à Claire', a: 'Claire', suite: 'Claire te répond dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── l'ordre de transport (fiche enregistrée, aucun encadré)
const saisie = (type, id, lib, manque, o = {}) => ({ type, id, lib, manque, ...o });
export const FICHE_OT = {
  id: OT, libelle: 'Ordre de transport', titre: `Ordre de transport ${OT_NUM}`,
  sousTitre: 'Les documents à gauche : l’avis du terminal, le cahier des charges, la liste référencée et les devis.',
  entete: '<b>Donneur d’ordre :</b> Decathlon, entrepôt de Dourges — service transport amont.',
  documents: (db) => ['avis', 'cahier', 'liste', ...devisDe(db)],
  quand: apresFiche(CMP),
  largeurDocs: 0.9, serree: true, grille: true, defile: true,
  pied: 'Document reconstitué — document pédagogique Prepalog.',
  bouton: 'Ouvrir l’ordre de transport',
  blocs: (db) => [
    { type: 'cadre', titre: 'Prestataire', blocs: [{ type: 'liste', id: BO.presta, lib: 'Transporteur', vide: 'Choisir…', choix: PRESTAS, manque: 'le transporteur' }] },
    { type: 'cadre', titre: 'Le conteneur', blocs: [
      saisie('texte', BO.cont, 'N° de conteneur', 'le n° de conteneur'),
      { type: 'liste', id: BO.type, lib: 'Type', vide: 'Choisir…', choix: TYPES, manque: 'le type du conteneur' },
      saisie('texte', BO.scelle, 'N° de scellé', 'le n° de scellé'),
      saisie('nombre', BO.poids, 'Poids brut', 'le poids brut', { unite: 'kg' }),
    ] },
    { type: 'cadre', titre: 'Enlèvement et livraison', large: true, blocs: [
      { type: 'liste', id: BO.enl, lib: 'Lieu d’enlèvement', vide: 'Choisir…', choix: LIEUX_ENL, manque: 'le lieu d’enlèvement' },
      saisie('date', BO.dispo, 'Disponible à partir du', 'la date de mise à disposition'),
      saisie('texte', BO.ref, 'Référence Decathlon', 'la référence Decathlon'),
      { type: 'liste', id: BO.liv, lib: 'Lieu de livraison', vide: 'Choisir…', choix: LIEUX_LIV, manque: 'le lieu de livraison' },
      saisie('date', BO.limd, 'Arrivée au quai au plus tard le', 'la date limite d’arrivée'),
      saisie('heure', BO.limh, 'à (heure)', 'l’heure limite d’arrivée'),
    ] },
    { type: 'cadre', titre: 'Instructions', large: true, blocs: [{ type: 'cases', id: BO.inst, choix: jeuEleve(db).instructions.map((x) => ({ v: x.v, lib: x.lib })) }] },
  ],
  envoi: { enregistrer: true, nomPiece: FICHIER, bouton: 'Enregistrer l’ordre de transport', suite: 'Il est prêt à être joint à un courriel.' },
};

// ─────────────────────────────────────────────────────────────── le courriel au prestataire
export const CARNET = [
  { id: 'routiers', nom: PRESTATAIRES.route.nom, mail: PRESTATAIRES.route.mail, role: 'transporteur routier' },
  { id: 'contargo', nom: PRESTATAIRES.barge.nom, mail: PRESTATAIRES.barge.mail, role: 'barge · service réservations' },
  { id: 'rail', nom: PRESTATAIRES.rail.nom, mail: PRESTATAIRES.rail.mail, role: 'transport ferroviaire' },
  { id: 'quai', nom: 'Quai de réception Dourges', mail: mailDe('quai-dourges'), role: 'entrepôt Decathlon' },
  { id: 'claire', nom: EQUIPE.claire.nom, mail: mailDe('claire'), role: 'transport amont' },
];
const SIGNATURES = { contargo: 'Service réservations, Contargo', routiers: 'Affrètement, Routiers du Hainaut', rail: 'Service commandes, Rail Flandres-Artois' };
// La réponse reprend le n° ÉCRIT DANS L'ORDRE DE L'ÉLÈVE (jamais celui de l'avis), annonce l'arrivée de l'offre du prestataire dans le tirage de l'élève, et
// ne dit jamais si l'ordre ou le choix est le bon.
export function reponse(c, db) {
  if (!PRESTA_MAIL.includes(c.a)) return null;
  const S = SIGNATURES[c.a];
  if (!c.pieces.includes(`fiche:${OT}`)) {
    return { de: c.a, texte: `Bonjour,\n\nnous ne pouvons pas enregistrer votre demande sans l’ordre de transport. Merci de nous le transmettre en pièce jointe.\n\n${S}` };
  }
  const mode = Object.keys(PRESTA_DE).find((m) => PRESTA_DE[m] === c.a);
  const o = jeuEleve(db).offres.find((x) => x.slot === mode);
  const n = String(fiche(db, OT).v[BO.cont] == null ? '' : fiche(db, OT).v[BO.cont]).trim();
  return { de: c.a, texte: `Bonjour,\n\nnous avons reçu votre ordre de transport ${OT_NUM} pour le conteneur ${n}. Enlèvement confirmé, livraison à votre quai ${o ? quand(o.arrivee.iso, o.arrivee.h, { long: true }) : 'à la date de notre devis'}.\n\n${S}` };
}
export const COURRIEL = { carnet: CARNET, pieces: ['cahier', 'avis'], reponse };

// ─────────────────────────────────────────────────────────────── le téléphone (le chef de quai de Dourges)
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
// « Mardi 9 mars vers 15 h ».
const dateParlee = (iso, h) => {
  const [a, m, j] = iso.split('-').map(Number);
  const jour = JOURS[new Date(a, m - 1, j).getDay()];
  return `${jour.charAt(0).toUpperCase()}${jour.slice(1)} ${j} ${MOIS[m - 1]} vers ${Math.floor(h)} h`;
};
// L'arrivée d'une offre, dite au téléphone : par quel moyen, avec les kilomètres de la carte.
export function arriveeDite(o) {
  const T = o.troncons, fin = T[T.length - 1];
  const dernier = fin && fin.type === 'camion' && T.length > 1 ? `, puis ${fin.km} km de camion` : '';
  const moyen = o.mode === 'route' ? 'par la route, directement jusqu’à Delta 3' : o.mode === 'barge' ? `par la barge jusqu’au terminal de Dourges${dernier}`
    : `par le train jusqu’au terminal de Dourges${dernier}`;
  return `${dateParlee(o.arrivee.iso, o.arrivee.h)}, ${moyen}.`;
}
export const TELEPHONE = {
  libelle: 'Téléphone',
  quand: apresGeste('courriel:envoyer'),
  situation: 'Appelle le quai de réception de Dourges pour annoncer ton conteneur.',
  dialogues: [{
    id: DIALOGUE, de: 'yanis',
    contact: { nom: 'Quai de réception — Dourges', detail: 'Delta 3' },
    repliques: [
      { id: 'accueil', dit: 'Réception Dourges, j’écoute.',
        choix: [
          { v: 'presente', juste: true, lib: 'Bonjour, c’est {prenom}, du transport amont. J’appelle pour annoncer un conteneur.' },
          { v: 'camion', lib: 'Salut, c’est pour un camion.' },
          { v: 'place', lib: 'Vous avez de la place ?' },
        ] },
      { id: 'refs', dit: 'Les références ?',
        choix: [
          { v: 'juste', juste: true, lib: 'Conteneur PRPU 000000 0, ordre de transport ' + OT_NUM + '.' },
          { v: 'inverse', lib: 'Conteneur PRPU 000000 1, ordre de transport ' + OT_NUM + '.' },
          { v: 'contenu', lib: 'Des vélos.' },
        ],
        // Calculé UNE FOIS, sur l'AVIS de l'élève (le chef de quai lit l'avis du terminal, pas l'ordre de l'élève).
        selon: (db) => { const J = jeuEleve(db);
          return { libs: { juste: `Conteneur ${J.conteneur}, ordre de transport ${OT_NUM}.`, inverse: `Conteneur ${J.piege}, ordre de transport ${OT_NUM}.`,
            contenu: `${J.contenu}.` } }; } },
      { id: 'arrivee', dit: 'Il arrive quand, et comment ?',
        choix: [
          { v: 'commandee', juste: true, lib: 'Mardi 9 mars vers 15 h, par le train jusqu’au terminal de Dourges, puis 3 km de camion.' },
          { v: 'autre1', lib: 'Mardi 9 mars vers 10 h, par la route.' },
          { v: 'autre2', lib: 'Vendredi 12 mars vers 9 h, par la barge.' },
        ],
        // Calculé UNE FOIS : l'arrivée de l'offre que l'élève a COMMANDÉE (juste) ; les pièges sont les arrivées des autres offres référencées de SON tirage.
        selon: (db) => {
          const J = jeuEleve(db), c = commandee(db);
          const autres = J.offres.filter((o) => o.referencee && o.slot !== c.slot);
          return { libs: { commandee: arriveeDite(c), autre1: arriveeDite(autres[0]), autre2: arriveeDite(autres[1]) } };
        } },
    ],
    fin: 'Merci, {prenom}. À bientôt.',
  }],
};

// ─────────────────────────────────────────────────────────────── les messages
const CLAIRE = { nom: EQUIPE.claire.nom, mail: mailDe('claire') };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, CLAIRE, 'Un conteneur pour Dourges',
      `Bonjour ${prenom},\n\nun conteneur arrive à Anvers pour l’entrepôt de Dourges. Je suis en déplacement toute la semaine : choisis le prestataire, passe la commande et préviens le quai. `
        + 'Tout est en pièce jointe.\n\nClaire',
      { extra: { pieces: ['cahier', 'liste', ...devisDe(db), 'avis'], ouvreFiche: CMP } }),
  ] }),
  declencheurs: [
    // Le comparateur envoyé (juste ou faux) : réponse neutre de Claire, qui ouvre l'ordre de transport.
    { id: 'choix-recu', quand: apresFiche(CMP),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Ton choix', 'Bien reçu, je te fais confiance pour la suite.\n\nClaire', { db, decalage: 2, extra: { ouvreFiche: OT } })] }) },
    // L'appel fini : le mot de la fin, neutre.
    { id: 'fin', quand: dialogueFini(DIALOGUE),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Merci', `Merci ${prenom}, je regarde à mon retour.\n\nClaire`, { db, decalage: 6 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (14 : 17 + 3 de questions = 20)
// Poids validés par Tristan le 13/10/2026 (décision 14) : Choisir 10 (besoin 2, tri 3, comparaison 3, décision 2) · Transmettre 7 (ordre 4, courriel 2, quai 1) ·
// questions clés 3 (`part`). Le brief les donne par groupe ; ils sont ici répartis en jalons (besoin 1 + 1, tri 1,5 + 1,5, comparaison 1,5 + 1,5, décision 1 + 1,
// ordre 2 + 1 + 1, courriel 1,5 + 0,5, quai 1) : aucun jalon à 0, la forme ne dépasse pas 0,5 point. Rien n'est vrai avant le geste : l'inaction vaut 0.
export const GROUPES = {
  besoin: '① Lire le besoin', tri: '② Trier les offres', comparer: '③ Comparer', decider: '④ Décider',
  ordre: 'Ordre de transport', courriel: 'Courriel', quai: 'Appel au quai',
};
export const POIDS = { 'besoin-date': 1, 'besoin-budget': 1, 'tri-liste': 1.5, 'tri-date': 1.5, 'comparer-route': 1.5, 'comparer-bonne': 1.5, 'decision-offre': 1, 'decision-justif': 1,
  'ot-conteneur': 2, 'ot-transport': 1, 'ot-instructions': 1, 'courriel-destinataire': 1.5, 'courriel-forme': 0.5, 'appel-quai': 1 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = { status: 'ko' };

const jalonCmp = (id, groupe, titre, juste) => ({ id, titre, groupe: GROUPES[groupe], poids: POIDS[id],
  verifier(db) { const f = fiche(db, CMP); return f.envoye ? (juste(f.v, jeuEleve(db)) ? ok : ko) : attente; } });
const jalonOt = (id, titre, juste) => ({ id, titre, groupe: GROUPES.ordre, poids: POIDS[id],
  verifier(db) { const f = fiche(db, OT); return f.envoye ? (juste(f.v, jeuEleve(db), db) ? ok : ko) : attente; } });
const refs = (J) => J.offres.filter((o) => o.referencee);
const reporteJuste = (J, v, o) => { const r = reporte(J, v, o.slot); return r.prix === o.prix && r.co2 === o.co2; };
// Le prestataire de l'ordre d'après l'offre que l'élève a RETENUE (une erreur de choix ne se paie pas ici).
const prestaRetenu = (db) => { const r = fiche(db, CMP).v[B.retenue]; const J = jeuEleve(db); const o = J.offres.find((x) => x.slot === r); return o && o.referencee ? PRESTA_DE[o.slot] : null; };

// Les courriels, lus à l'HEURE (`at`) : jamais sur l'ordre du tableau.
const courrielsA = (db) => courrielsEnvoyes(db, ID).slice().sort((a, b) => a.at - b.at);
// Le courriel qui porte l'ordre au prestataire RETENU ; à défaut, le dernier courriel à un prestataire ; à défaut, le dernier courriel.
export function courrielJuge(db) {
  const L = courrielsA(db), presta = prestaRetenu(db);
  const porte = L.find((c) => presta && c.a === presta && c.pieces.includes(`fiche:${OT}`));
  if (porte) return porte;
  const aPresta = L.filter((c) => PRESTA_MAIL.includes(c.a));
  return aPresta.length ? aPresta[aPresta.length - 1] : (L[L.length - 1] || null);
}
// La forme d'un courriel : un objet clair, une formule d'appel, une signature, le vouvoiement.
export function formeCourriel(c, db) {
  const J = jeuEleve(db);
  const objet = nrm(c.objet), compact = objet.replace(/\s/g, '');
  const objetOk = compact.includes(nrm(J.sansEspaces)) || objet.includes('ordre de transport') || compact.includes(nrm(OT_NUM));
  const corps = nrm(c.corps);
  const lignes = String(c.corps || '').split('\n').map((x) => nrm(x).trim()).filter(Boolean).slice(-3).join(' ');
  const prenom = nrm(prenomDe(db)).trim();
  const signe = lignes.includes('decathlon') || (prenom !== '' && lignes.includes(prenom));
  const formule = /\b(bonjour|madame|monsieur)\b/.test(corps);
  const tutoie = /\b(tu|te|ton|ta|salut|stp)\b/.test(corps);
  return objetOk && formule && signe && !tutoie;
}

export const ETAPES = [
  jalonCmp('besoin-date', 'besoin', 'Le besoin : la date et l’heure limites au quai', (v) => v[B.limite] === LIMITE.iso && lireHeure(v[B.heure]) === LIMITE.h * 60),
  jalonCmp('besoin-budget', 'besoin', 'Le besoin : le budget et le critère « le moins de CO₂ »', (v) => lireNombre(v[B.budget]) === BUDGET && v[B.critere] === CRITERE_JUSTE),
  jalonCmp('tri-liste', 'tri', 'Trier : l’offre hors liste écartée, les trois référencées gardées',
    (v, J) => tri(v, 'horsliste', COL.liste) === false && refs(J).every((o) => tri(v, o.slot, COL.liste) === true)),
  jalonCmp('tri-date', 'tri', 'Trier : l’offre référencée en retard écartée, les deux autres tiennent la date', (v, J) => refs(J).every((o) => tri(v, o.slot, COL.date) === o.tient)),
  // Seules les offres RESTANTES (référencées et à l'heure) : la route, et la bonne réponse. Une offre écartée mal reportée ne se paie pas deux fois.
  jalonCmp('comparer-route', 'comparer', 'Comparer : prix et CO₂ de la route reportés justes', (v, J) => reporteJuste(J, v, J.offres.find((o) => o.slot === 'route'))),
  jalonCmp('comparer-bonne', 'comparer', 'Comparer : prix et CO₂ de l’autre offre qui tient la date reportés justes', (v, J) => reporteJuste(J, v, J.bonne)),
  // Jugé sur le RÉEL (c'est la décision qui part chez Claire), même si l'élève a mal trié.
  jalonCmp('decision-offre', 'decider', 'Décider : l’offre référencée à l’heure qui émet le moins de CO₂', (v, J) => v[B.retenue] === J.bonne.slot),
  jalonCmp('decision-justif', 'decider', 'Décider : la justification « la date d’abord, puis le CO₂ »', (v) => v[B.justif] === JUSTIF_JUSTE),
  jalonOt('ot-conteneur', 'L’ordre : le numéro du conteneur, le scellé, le poids brut et le type',
    (v, J) => sansEspaces(v[BO.cont]) === J.sansEspaces.toUpperCase() && sansEspaces(v[BO.scelle]) === sansEspaces(J.scelle) && lireNombre(v[BO.poids]) === J.poids && v[BO.type] === BONNES.type),
  // Le transporteur est celui que l'élève a retenu (il ne perd pas deux fois) ; l'enlèvement, la livraison à Dourges et l'arrivée au plus tard sont fixes.
  jalonOt('ot-transport', 'L’ordre : le transporteur retenu, l’enlèvement, la livraison à Dourges et l’arrivée au plus tard',
    (v, J, db) => !!prestaRetenu(db) && v[BO.presta] === prestaRetenu(db) && v[BO.enl] === BONNES.enl && v[BO.liv] === BONNES.liv
      && v[BO.limd] === LIMITE.iso && lireHeure(v[BO.limh]) === LIMITE.h * 60),
  jalonOt('ot-instructions', 'L’ordre : les instructions qui concernent ce conteneur, et elles seules',
    (v, J) => { const c = cochees(v); return INSTRUCTIONS_JUSTES.every((x) => c.includes(x.v)) && J.fausses.every((f) => !c.includes(f)); }),
  { id: 'courriel-destinataire', titre: 'Le courriel : envoyé au prestataire retenu avec l’ordre en pièce jointe', groupe: GROUPES.courriel, poids: POIDS['courriel-destinataire'],
    verifier(db) {
      const L = courrielsA(db);
      if (!L.length) return attente;
      const presta = prestaRetenu(db);
      return presta && L.some((c) => c.a === presta && c.pieces.includes(`fiche:${OT}`)) ? ok : ko;
    } },
  { id: 'courriel-forme', titre: 'Le courriel : un objet clair, une formule d’appel, le vouvoiement et une signature', groupe: GROUPES.courriel, poids: POIDS['courriel-forme'],
    verifier(db) { const c = courrielJuge(db); return c ? (formeCourriel(c, db) ? ok : ko) : attente; } },
  // Jugé sur les PREMIÈRES réponses (en évaluation, la première réponse est la réponse) : les références, puis l'arrivée de l'offre COMMANDÉE.
  { ...jalonDialogue({ seance: ID, dialogue: DIALOGUE, id: 'appel-quai', titre: 'L’appel au quai : les bonnes références et l’arrivée de l’offre commandée, du premier coup',
    groupe: GROUPES.quai, poids: POIDS['appel-quai'], juge: (a) => premiereReponse(a, 'refs') === 'juste' && premiereReponse(a, 'arrivee') === 'commandee' }), ecran: undefined },
];

// ─────────────────────────────────────────────────────────────── les pastilles d'étape (« fait », jamais « juste »)
export const PASTILLES = [
  { libelle: 'Comparer et choisir', fait: (db) => fiche(db, CMP).envoye },
  { libelle: 'Ordre de transport', fait: (db) => fiche(db, OT).envoye },
  { libelle: 'Courriel au prestataire', fait: (db) => courrielsA(db).some((c) => PRESTA_MAIL.includes(c.a)) },
  { libelle: 'Appel au quai', fait: (db) => dialogueFini(DIALOGUE)(db, ID) },
];

// ─────────────────────────────────────────────────────────────── la carte (consultée, jamais notée)
export const CARTE_ITINERAIRES = {
  carte: CARTE,
  destination: DESTINATION,
  libelle: 'Carte des itinéraires',
  titre: 'D’Anvers à Dourges : trois itinéraires',
  consigne: 'Clique sur un itinéraire (ou dans la liste) pour lire sa fiche. Les prix, les dates et le CO₂ sont dans les devis.',
  alt: 'Carte d’Anvers à Dourges : trois itinéraires, route, barge et rail',
  offres: (mode, db) => jeuEleve(db).offres.filter((o) => o.mode === mode).map((o) => o.nom),
};

// ─────────────────────────────────────────────────────────────── accueil, options
export const MENTION = 'Réels : Decathlon, son entrepôt de Dourges (plateforme multimodale Delta 3) et le terminal rail-barge de Dourges, les barges de Contargo '
  + 'entre Anvers et Dourges (2 à 3 dessertes par semaine, communiqué de février 2025). Construit : que Decathlon utilise ces services, toutes les offres, '
  + 'les prix, les dates, le chef de quai (Yanis Haddad), Claire.';
export const ACCUEIL = {
  titre: 'Un conteneur pour Dourges',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Claire', 'Menu Messagerie : le cahier des charges, la liste référencée, les devis et l’avis du terminal sont joints.'],
    ['① Choisir', 'Compare les offres, choisis le prestataire et envoie ton choix à Claire.'],
    ['② Transmettre', 'Remplis l’ordre de transport, envoie-le au prestataire par courriel, puis appelle le quai.'],
    ['Bon à savoir', MENTION],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : un conteneur pour Dourges',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_CMP, FICHE_OT],
  courriel: COURRIEL,
  telephone: TELEPHONE,
  carteItineraires: CARTE_ITINERAIRES,
  pastilles: PASTILLES,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
