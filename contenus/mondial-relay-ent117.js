// ENT-11.7 — Mondial Relay, évaluation « la lampe d'Inès » : le contenu de la séance (brief
// `docs/briefs/ENT-11.7-mondial-relay-evaluation-client.md` ; choix de Tristan du 26/10/2026, `docs/briefs/mondial-relay/A-TRANCHER.md`). Septième séance
// de l'entreprise n° 11 (2de GATL, poste A : AGOrA, conseiller(ère) au service client), ÉVALUATION de AGO-1.1 (identifier la demande, apporter une
// réponse adaptée) et AGO-1.2 (appliquer les procédures internes, produire les documents de la relation client), en copie rendue
// (`copie: true`) : rien ne remonte pendant le travail, une seule remise (bouton « Rendre ma copie » du bandeau), note figée ; aucun bilan, aucun
// « Corriger », aucun mot cliquable, rien à l'écran ne dit juste ou faux.
// Univers commun : `contenus/mondial-relay.js` (JAMAIS modifié ici). Données pures (cas tiré, appel, réponses, dates) :
// `contenus/mondial-relay-ent117-donnees.js`. Activité : `activites/mondial-relay-evaluation-client.js`. Questions : `contenus/questions/ENT-11.7.js`.
// Corrigé : `contenus/corriges/ENT-11.7.js`.
//
// Écrans, un par étape (chacun ne s'ouvre qu'après le précédent) :
//   Avant de commencer (noté, 4 / 20, sans aide) → ① L'appel d'Inès (vue Téléphone, évaluation : aucune réaction, la première réponse compte) →
//   ② La règle (fiche : recevable ou non ; combien au plus ; documents joints : le suivi du colis et les articles 11 et 12) → ③ Le dossier de
//   réclamation (fiche : colis, date, nature du dommage, suite donnée) → ④ Le courriel à Inès (phrases à choisir, au vous) → « Rendre ma copie ».
//
// VÉRIFIÉ / CONSTRUIT : voir l'en-tête de `contenus/mondial-relay-ent117-donnees.js` (règles des conditions de vente vérifiées au 07/01/2026 ;
// Inès, sa lampe, les prix, les dates, le suivi du colis, la valeur déclarée du cas b CONSTRUITS et dits à l'écran ; aucun montant des niveaux
// d'assurance, aucun délai de versement).
//
// Poids (brief §5, choix de Tristan du 26/10/2026) : écoute 3 (numéro demandé 1 · situation reformulée 1 · aucune promesse avant de vérifier 1) ·
// la règle 4 · le montant 3 · le dossier 3 (colis et date 1,5 · nature du dommage et suite 1,5) · le courriel 2 (décision 0,75 · montant 0,75 ·
// rappel de la règle 0,5) · le ton 1 · Avant de commencer 4 = 20. Rien n'est vrai avant l'envoi d'une fiche, d'un courriel ou la fin de l'appel :
// l'inaction vaut 0.

import { apresFiche, apresMail, dialogueFini } from '../core/declencheurs.js';
import { jalonDialogue, premiereReponse, appelRetenuDe } from '../core/types/dialogue.js';
import { phrasesJustes } from '../core/phrases.js';
import { catalogueSimple } from './entreprise-commun.js';
import { VOCAB, MENTION, EQUIPE as EQUIPE_MR, FIL_ROUGE } from './mondial-relay.js';
import { QUESTIONS } from './questions/ENT-11.7.js';
import {
  ID, ID_VOLET, DIALOGUE_ID, PHRASES_ID, FICHES, MAIL_INES, CONCLUSIONS, DOMMAGES, SUITES, REPLIQUES, FIN_APPEL, NUMERO_COLIS,
  situationDe, libDate, envoyee, dejaEnvoyee, lireNombre, COLIS_JUSTE, phrasesReponse, CGV, SOURCE_CGV,
  NUMERO_DEMANDE, SITUATION_REFORMULEE, SANS_PROMESSE, TON_DE_L_APPEL,
} from './mondial-relay-ent117-donnees.js';

export { ID, ID_VOLET, DIALOGUE_ID, PHRASES_ID, FICHES, TIRAGE } from './mondial-relay-ent117-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

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

// ─────────────────────────────────────────────────────────────── les personnes (prénoms seuls, construits)
export const EQUIPE = {
  claire: { nom: EQUIPE_MR.claire.prenom, role: `${EQUIPE_MR.claire.poste} (ta responsable)`, appel: 'Claire' },
  ines: { nom: `${FIL_ROUGE.expeditrice.prenom} ${FIL_ROUGE.expeditrice.nom}`, role: 'cliente', appel: FIL_ROUGE.expeditrice.prenom },
};
const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;
const CLAIRE = { nom: EQUIPE.claire.nom, mail: mailDe('claire') };
const INES = { nom: EQUIPE.ines.nom, mail: MAIL_INES };

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; pied imposé)
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pied = (texte) => `<p class="mr-pied">${ech(texte)}</p>`;
const PIED = 'Document pédagogique — reconstitution, non contractuel.';
export const ARTICLE_1113 = {
  1: 'Le contrat est formé par la rencontre d’une offre et d’une acceptation par lesquelles les parties manifestent leur volonté de s’engager.',
  2: 'Cette volonté peut résulter d’une déclaration ou d’un comportement non équivoque de son auteur.',
};

const DOC_POSTE = { id: 'poste-117', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="mr-doc" aria-label="Ton poste">
    <p class="mr-t">Ton poste</p>
    <p class="mr-st">Service client de Mondial Relay — décembre, au pic de fin d’année</p>
    <p>Tu es en renfort au <b>service client</b> du hub et de l’agence de Buchères (Aube). Ta responsable : <b>Claire</b>. Au pic de fin d’année, le service
      client compte plus de 350 conseillers en France.</p>
    <p>Ce matin, une <b>cliente</b> t’attend : <b>Inès Garnier</b>, une particulière de Reims. Elle a vendu une lampe d’occasion à un acheteur de Bar-sur-Seine
      et lui a envoyé en <b>Point Relais</b> : un commerce où le destinataire vient chercher son colis. Elle a laissé un message.</p>
    <p>Tu lui réponds au <b>vous</b>, par téléphone puis par écrit, en appliquant les <b>conditions de vente</b> de Mondial Relay.</p>
    ${pied('Document pédagogique. Réels : Mondial Relay, son hub de Buchères, le service client de plus de 350 conseillers au pic (communiqué « Peak 2025 »). Construits : Inès, Claire, la lampe.')}
  </article>` };

const DOC_DROIT = { id: 'droit-117', titre: 'Le droit : le contrat', court: 'Le droit',
  html: `<article class="mr-doc" aria-label="Le droit : le contrat">
    <p class="mr-t">Le droit : former un contrat</p>
    <p class="mr-st">Code civil, article 1113</p>
    <p class="mr-loi">« ${ARTICLE_1113[1]} ${ARTICLE_1113[2]} »</p>
    ${pied('Texte de loi (réel) — source : Légifrance.')}
  </article>` };

const DOC_CGV = { id: 'cgv-117', titre: 'Conditions de vente (extraits)', court: 'Conditions de vente',
  html: `<article class="mr-doc" aria-label="Conditions de vente de Mondial Relay, articles 11 et 12">
    <p class="mr-t">Conditions de vente Mondial Relay (extraits)</p>
    <p class="mr-st">${ech(SOURCE_CGV)}</p>
    <p class="mr-art"><b>Article 11 — Le dommage visible : la réclamation</b></p>
    <ul class="mr-ul">${CGV.art11.map((l) => `<li>${ech(l)}</li>`).join('')}</ul>
    <p class="mr-art"><b>Article 12 — La perte et l’avarie : l’indemnité</b></p>
    <ul class="mr-ul">${CGV.art12.map((l) => `<li>${ech(l)}</li>`).join('')}</ul>
    ${pied(`Extraits des conditions de vente, reformulés au plus près : ce n’est pas le texte officiel. ${PIED}`)}
  </article>` };

// Le suivi du colis : CONSTRUIT pour l'exercice, calculé sur le tirage de l'élève (le cas, les dates, l'assurance).
const DOC_SUIVI = { id: 'suivi-117', titre: 'Suivi du colis', court: 'Suivi du colis',
  html: (db) => {
    const S = situationDe(db), R = FIL_ROUGE.destination;
    return `<article class="mr-doc" aria-label="Suivi du colis ${ech(NUMERO_COLIS)}">
    <p class="mr-t">Suivi du colis ${ech(NUMERO_COLIS)}</p>
    <p class="mr-st">Suivi consulté le <b>${ech(libDate(S.aujourdhui))}</b></p>
    <dl class="mr-dl">
      <dt>Expéditrice</dt><dd>${ech(FIL_ROUGE.expeditrice.prenom)} ${ech(FIL_ROUGE.expeditrice.nom)}, ${ech(FIL_ROUGE.expeditrice.ville)}</dd>
      <dt>Contenu déclaré</dt><dd>Une lampe en céramique d’occasion</dd>
      <dt>Point Relais</dt><dd>${ech(R.relais)}, ${ech(R.commune)}</dd>
      <dt>Assurance en option</dt><dd>${S.assure ? `oui — valeur déclarée à l’assurance : <b>${S.valeur} €</b>` : 'non'}</dd>
    </dl>
    <table class="mr-table">
      <thead><tr><th scope="col">Date</th><th scope="col">État du colis</th></tr></thead>
      <tbody>
        <tr><td>${ech(libDate(S.jour))}</td><td>Au Point Relais — ${ech(R.relais)}, ${ech(R.commune)}</td></tr>
        <tr><td>${ech(libDate(S.jour))}</td><td>${S.refuse ? 'Refusé par le destinataire au Point Relais' : 'Retiré par le destinataire au Point Relais'}</td></tr>
      </tbody>
    </table>
    ${pied('Suivi reconstitué pour l’exercice : dates, assurance et valeur déclarée sont construites. Ce n’est pas un vrai suivi Mondial Relay.')}
  </article>`;
  } };

export const STYLE = `
--douce:#555047;
.mr-doc{padding:14px 18px 0}
.mr-doc p{margin:0 0 8px}
.mr-t{margin:0; font-size:1.08rem; font-weight:800}
.mr-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.mr-art{margin:10px 0 2px}
.mr-ul{margin:4px 0 0; padding-left:20px; font-size:.92rem}
.mr-ul li{margin:4px 0}
.mr-loi{margin:2px 0 6px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.mr-dl{display:grid; grid-template-columns:150px 1fr; gap:5px 12px; margin:6px 0 10px; font-size:.9rem}
.mr-dl dt{color:var(--douce)}
.mr-dl dd{margin:0}
.mr-table{border-collapse:collapse; width:100%; font-size:.9rem; margin-top:4px}
.mr-table th, .mr-table td{border-bottom:1px solid #d6d0c3; padding:5px 6px; text-align:left}
.mr-table th{color:var(--douce); font-weight:600}
.mr-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;
export const DOCUMENTS = [DOC_POSTE, DOC_DROIT, DOC_CGV, DOC_SUIVI];

// ─────────────────────────────────────────────────────────────── ① l'appel d'Inès (écran Téléphone, évaluation)
export const TELEPHONE = {
  libelle: 'L’appel d’Inès',
  situation: 'Inès Garnier a laissé un message : rappelle-la.',
  dialogues: [{ id: DIALOGUE_ID, de: 'ines', contact: { nom: 'Inès Garnier', detail: 'cliente, Reims' }, repliques: REPLIQUES, fin: FIN_APPEL }],
};
const appelFini = (db) => dialogueFini(DIALOGUE_ID)(db, ID);

// ─────────────────────────────────────────────────────────────── ② la règle et ③ le dossier (deux fiches)
const ENVOI = (bouton, suite = 'Merci, c’est noté.') => ({ bouton, a: 'Claire', suite });
export const FICHE_REGLE = {
  id: FICHES.regle, libelle: 'La règle', titre: 'Appliquer nos conditions de vente',
  sousTitre: 'À gauche : le suivi du colis et les articles 11 et 12. Dis si la réclamation d’Inès est recevable, puis ce que tu peux lui accorder.',
  documents: ['suivi-117', 'cgv-117'], largeurDocs: 1.1,
  bouton: 'Ouvrir la fiche « La règle »',
  quand: (db) => appelFini(db) || envoyee(db, FICHES.regle),
  blocs: [
    { type: 'liste', id: 'conclusion', lib: 'La réclamation d’Inès est…', vide: 'Choisir…', manque: 'ta conclusion', choix: CONCLUSIONS },
    { type: 'nombre', id: 'montant', lib: 'Ce que je peux lui accorder au plus', unite: '€', min: 0, entier: true, manque: 'le montant' },
  ],
  envoi: ENVOI('Envoyer ma réponse à Claire'),
};
export const FICHE_DOSSIER = {
  id: FICHES.dossier, libelle: 'Le dossier', titre: 'Dossier de réclamation',
  sousTitre: 'Enregistre le dossier d’Inès avec le numéro de colis : les documents sont à gauche.',
  documents: ['suivi-117', 'cgv-117'], largeurDocs: 1.1,
  bouton: 'Ouvrir le dossier de réclamation',
  quand: (db) => dejaEnvoyee(FICHES.regle)(db) || envoyee(db, FICHES.dossier),
  blocs: [
    { type: 'texte', id: 'colis', lib: 'Numéro de colis', manque: 'le numéro de colis' },
    { type: 'date', id: 'livraison', lib: 'Date de livraison au Point Relais', manque: 'la date de livraison' },
    { type: 'liste', id: 'dommage', lib: 'Nature du dommage', vide: 'Choisir…', manque: 'la nature du dommage', choix: DOMMAGES },
    { type: 'liste', id: 'suite', lib: 'Suite donnée au dossier', vide: 'Choisir…', manque: 'la suite donnée', choix: SUITES },
  ],
  envoi: ENVOI('Enregistrer le dossier et prévenir Claire'),
};

// ─────────────────────────────────────────────────────────────── les messages (au tu entre collègues ; Inès écrit au vous)
// Les messages portent la date du SCÉNARIO : le jour du suivi consulté (tirage de l'élève), plus le temps réellement passé depuis l'ouverture.
function heureMail(db, hhmm, { decalage = 0 } = {}) {
  const S = situationDe(db);
  const [a, m, j] = S.aujourdhui.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(a, m - 1, j, h, mn).getTime() + ecoule + decalage * 60000;
}
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heureMail(o.db, o.heure || '09:00', { decalage: o.decalage || 0 }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, CLAIRE, 'Une cliente à rappeler',
      `Bonjour ${prenom} ! Inès Garnier, de Reims, a laissé un message : la lampe qu’elle a vendue est arrivée cassée à Bar-sur-Seine. `
        + 'Rappelle-la : ouvre « L’appel d’Inès », dans le menu. Ensuite, tu appliqueras nos conditions de vente.\n\nClaire',
      { db, heure: '09:00', extra: { pieces: ['poste-117'] } }),
  ] }),
  declencheurs: [
    { id: 'regle', quand: appelFini,
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Le suivi et les conditions de vente',
        `Merci ${prenom}. Voici le suivi du colis et l’extrait de nos conditions de vente (articles 11 et 12). `
          + 'Ouvre la fiche « La règle » : dis si la réclamation d’Inès est recevable et ce que nous pouvons lui accorder.\n\nClaire',
        { db, heure: '09:12', extra: { pieces: ['suivi-117', 'cgv-117'], ouvreFiche: FICHES.regle } })] }) },
    { id: 'dossier', quand: apresFiche(FICHES.regle),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Le dossier de réclamation',
        'Merci. Enregistre maintenant le dossier d’Inès : ouvre « Le dossier ».\n\nClaire',
        { db, heure: '09:20', extra: { ouvreFiche: FICHES.dossier } })] }) },
    { id: 'courriel', quand: apresFiche(FICHES.dossier),
      semer: (prenom, db) => ({ mails: [mail(prenom, INES, 'Ma lampe cassée : votre réponse par écrit',
        'Bonjour,\n\nComme convenu au téléphone, pouvez-vous me confirmer par écrit ce que vous pouvez faire pour ma lampe ? Merci.\n\nInès Garnier',
        { db, heure: '09:28', extra: { phrases: phrasesReponse(prenom) } })] }) },
    { id: 'fin', quand: apresMail({ a: MAIL_INES }),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Merci',
        `Merci ${prenom}.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\nClaire`, { db, heure: '09:35' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids du brief §5, 26/10/2026)
export const GROUPES = { ecoute: 'L’appel : écouter', regle: 'La règle', dossier: 'Le dossier', reponse: 'Le courriel', ton: 'Le ton' };
const appelJuge = (id, titre, poids, juge) => jalonDialogue({ seance: ID, dialogue: DIALOGUE_ID, id, titre, groupe: GROUPES.ecoute, poids,
  juge: (appel) => juge(appel, premiereReponse) });
const sur = (idFiche, id, titre, groupe, poids, juste) => ({ id, titre, groupe, poids, ecran: `fiche:${idFiche}`,
  verifier(db) {
    if (!envoyee(db, idFiche)) return attente;
    return juste(((db.fiches || {})[idFiche] || {}).valeurs || {}, situationDe(db)) ? ok : ko;
  } });
const ligneCourriel = (id, titre, ligne, poids) => ({ id, titre, groupe: GROUPES.reponse, poids, ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return r.justes.includes(ligne) ? ok : ko; } });

export const ETAPES = [
  appelJuge('ecoute-numero', 'L’appel : le numéro de colis demandé', 1, NUMERO_DEMANDE),
  appelJuge('ecoute-situation', 'L’appel : la situation reformulée', 1, SITUATION_REFORMULEE),
  appelJuge('ecoute-promesse', 'L’appel : aucune promesse avant de vérifier', 1, SANS_PROMESSE),
  sur(FICHES.regle, 'regle', 'La règle : recevable ou non, et pourquoi', GROUPES.regle, 4, (v, S) => v.conclusion === S.conclusion),
  // Le montant ne compte que si la conclusion est juste aussi : un « 0 » deviné ne rapporte rien (cas c et d).
  sur(FICHES.regle, 'montant', 'La règle : le montant', GROUPES.regle, 3,
    (v, S) => v.conclusion === S.conclusion && lireNombre(v.montant) === S.montant),
  sur(FICHES.dossier, 'dossier-colis', 'Le dossier : le numéro de colis et la date de livraison', GROUPES.dossier, 1.5,
    (v, S) => COLIS_JUSTE(v.colis) && v.livraison === S.jour),
  sur(FICHES.dossier, 'dossier-motif', 'Le dossier : la nature du dommage et la suite donnée', GROUPES.dossier, 1.5,
    (v, S) => v.dommage === 'abime' && v.suite === S.decision),
  ligneCourriel('courriel-decision', 'Le courriel : la décision', 'decision', 0.75),
  ligneCourriel('courriel-montant', 'Le courriel : le montant', 'montant', 0.75),
  ligneCourriel('courriel-regle', 'Le courriel : le rappel de la règle', 'regle', 0.5),
  // La forme : aucune réplique familière ou agressive à l'appel, une salutation et une fin polies dans le courriel. Rien avant les deux.
  { id: 'ton', titre: 'Le ton : l’appel et le courriel', groupe: GROUPES.ton, poids: 1,
    verifier(db) {
      const a = appelRetenuDe(db, ID, DIALOGUE_ID), r = phrasesJustes(db, PHRASES_ID);
      if (!a || !r.envoye) return attente;
      return TON_DE_L_APPEL(a, premiereReponse) && ['salutation', 'fin'].every((l) => r.justes.includes(l)) ? ok : ko;
    } },
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, accueil, options
export const PASTILLES = [
  { libelle: 'L’appel', fait: appelFini },
  { libelle: 'La règle', fait: dejaEnvoyee(FICHES.regle) },
  { libelle: 'Le dossier', fait: dejaEnvoyee(FICHES.dossier) },
  { libelle: 'Le courriel', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const SUITE = [
  { vue: 'telephone', libelle: 'L’appel d’Inès', fait: appelFini },
  { vue: 'fiche', libelle: 'La règle', fait: dejaEnvoyee(FICHES.regle) },
  { vue: `fiche:${FICHES.dossier}`, libelle: 'Le dossier', fait: dejaEnvoyee(FICHES.dossier) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Le courriel à Inès', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const MENTION_117 = `${MENTION} Construits aussi : Inès Garnier et sa lampe, les prix, les dates, le suivi du colis et la valeur déclarée à l’assurance.`
  + ' Les règles de réclamation sont celles des conditions de vente de Mondial Relay (janvier 2026).';
export const ACCUEIL = {
  titre: 'Évaluation : la lampe d’Inès',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Claire', 'Menu Messagerie.'],
    ['① L’appel d’Inès', 'Rappelle la cliente : écoute-la et choisis tes répliques.'],
    ['② La règle', 'Avec le suivi du colis et les conditions de vente, dis si sa réclamation est recevable et ce que tu peux lui accorder.'],
    ['③ Le dossier', 'Enregistre le dossier de réclamation.'],
    ['④ Le courriel', 'Réponds à Inès par écrit, une phrase par ligne.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION_117],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : la lampe d’Inès',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_REGLE, FICHE_DOSSIER],
  telephone: TELEPHONE,
  pastilles: PASTILLES,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};

