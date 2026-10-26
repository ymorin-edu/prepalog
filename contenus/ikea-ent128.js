// ENT-12.8 — IKEA, « évaluation : la facture de mars » : le contenu de la séance (brief `docs/briefs/ENT-12.8-ikea-evaluation-gestion.md` ; choix de Tristan du 26/10/2026).
// Huitième et dernière séance de l'entreprise n° 12 (2de GATL, poste A : assistant(e) de gestion du service transport, AGOrA) : ÉVALUATION de AGO-2.1 (suivre l'activité :
// contrôler la facture d'achat), travaillée en ENT-12.4. Sans aide : « Avant de commencer » noté, le contrôle de la facture de mars (trois erreurs tirées parmi six, la consigne
// ne dit pas combien), le bon montant, la réclamation par phrases. Copie rendue (`copie: true`) : rien ne remonte pendant le travail, une seule remise.
// Univers : `contenus/ikea.js` ; mécanique : `contenus/ikea-facture.js` ; écrans : `contenus/ikea-facture-ecrans.js` ; tirage et lectures : `contenus/ikea-ent128-donnees.js` ;
// questions : `contenus/questions/ENT-12.8.js` ; corrigé : `contenus/corriges/ENT-12.8.js` ; activité : `activites/ikea-evaluation-gestion.js`.
//
// Poids (brief §5, adaptés le 26/10/2026 : l'évaluation de Mondial Relay ENT-11.7 montre que les questions au fil d'une évaluation sont des RÉFLEXIONS non notées, donc le
// point du brief §5 « questions au fil » passe à la réclamation) : une erreur de chaque niveau trouvée avec le bon motif 3 + 3 + 3 · aucune ligne juste contestée 2 ·
// le bon montant 3 · la réclamation 2 · « Avant de commencer » 4 (`part`) = 20. Rien n'est vrai avant l'envoi de la fiche ou du message : l'inaction vaut 0.

import { apresFiche, apresMail } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQUIPE_IK, STYLE_DOCUMENTS, ech, pied } from './ikea.js';
import { juger } from './ikea-facture.js';
import { docTarif, docBons, docFacture, blocsControle, jugerFiche, phrasesReclamation } from './ikea-facture-ecrans.js';
import { QUESTIONS } from './questions/ENT-12.8.js';
import { ID, ID_VOLET, FICHE_ID, PHRASES_ID, MAIL_PRESTA, JOUR, NUMERO, PERIODE, ARTICLE_1302, TIRAGE, dossier, erreursDe, niveauDe, envoyee, valeursDe, dejaEnvoyee } from './ikea-ent128-donnees.js';

export { ID, ID_VOLET, FICHE_ID, PHRASES_ID, TIRAGE } from './ikea-ent128-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const EQUIPE = {
  hugo: { nom: EQUIPE_IK.hugo.prenom, role: `${EQUIPE_IK.hugo.poste} (ton responsable)`, appel: 'Hugo' },
  presta: { nom: 'Service facturation du prestataire', role: 'prestataire de livraison', appel: 'le prestataire' },
};
const HUGO = { nom: 'Hugo', mail: 'hugo@cdc-gennevilliers.example' };
const PRESTA = { nom: 'Service facturation — prestataire de livraison', mail: MAIL_PRESTA };

// ─────────────────────────────────────────────────────────────── les documents
const DOC_POSTE = { id: 'poste-128', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="ik-doc" aria-label="Ton poste">
    <p class="ik-t">Ton poste</p>
    <p class="ik-st">Service transport du centre de distribution clients IKEA de Gennevilliers — mardi 6 avril 2027</p>
    <p>Tu es assistant(e) de gestion au <b>service transport</b>. Le <b>prestataire de livraison</b> d’IKEA (il n’est pas nommé ici) vient d’envoyer sa <b>facture de mars</b>.
      Ton responsable : <b>Hugo</b>.</p>
    <p>Ton travail : <b>contrôler cette facture</b> avant qu’elle soit payée, avec le <b>tarif</b> et les <b>bons de livraison signés</b>, puis <b>réclamer par écrit</b> ce qui n’est pas dû.
      Personne ne te dit où regarder.</p>
    ${pied('Document pédagogique. Réels : IKEA France et son centre de Gennevilliers, qui confie ses livraisons à des transporteurs. Construits : Hugo, le prestataire (jamais nommé), son tarif, la facture, les bons.')}
  </article>` };
const DOC_DROIT = { id: 'droit-128', titre: 'Le droit : ce qui n’est pas dû', court: 'Le droit',
  html: `<article class="ik-doc" aria-label="Le droit : le paiement de l’indu">
    <p class="ik-t">Le droit : payer ce qui est dû</p>
    <p class="ik-st">Code civil, article 1302 (alinéa 1)</p>
    <p class="ik-loi">« ${ech(ARTICLE_1302)} »</p>
    ${pied('Texte de loi (réel) — source : Légifrance.')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_DROIT, docTarif('tarif-128', 'mars 2027'), docBons('bons-128', dossier, 'mars'),
  docFacture('facture-128', dossier, { mois: 'mars', numero: NUMERO, periode: PERIODE })];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── la fiche de contrôle
export const FICHE = {
  id: FICHE_ID, libelle: 'Contrôle de la facture', titre: 'Contrôler la facture du prestataire',
  sousTitre: 'À gauche : le tarif, les bons signés et la facture. Coche les lignes à contester sous leur motif, dis si le total est exact, puis calcule le bon montant.',
  documents: ['facture-128', 'bons-128', 'tarif-128'], largeurDocs: 1.3, defile: true,
  bouton: 'Ouvrir la fiche de contrôle',
  blocs: blocsControle(dossier, { avecTotal: true }),
  envoi: { bouton: 'Envoyer le contrôle à Hugo', a: 'Hugo', suite: 'Merci, c’est noté.', incomplet: true },
};

// ─────────────────────────────────────────────────────────────── les messages (Hugo tutoie ; le prestataire écrit au vous)
function heure(db, hhmm) {
  const [a, m, j] = JOUR.iso.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '09:00'), from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, HUGO, 'La facture de mars à contrôler',
      `Bonjour ${prenom} ! Le prestataire de livraison nous a envoyé sa facture de mars. Avant de la payer, contrôle-la avec le tarif et les bons de livraison signés. `
        + 'Ouvre la fiche « Contrôle de la facture ».\n\nHugo',
      { db, heure: '09:00', extra: { pieces: ['poste-128', 'facture-128', 'bons-128', 'tarif-128'], ouvreFiche: FICHE_ID } }),
  ] }),
  declencheurs: [
    { id: 'reclamation', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, PRESTA, `Facture ${NUMERO} — ${PERIODE}`,
        `Bonjour,\n\nVeuillez trouver ci-joint notre facture n° ${NUMERO} pour les livraisons de mars 2027, à régler sous 30 jours.\n\nLe service facturation`,
        { db, heure: '09:40', extra: { phrases: phrasesReclamation(PHRASES_ID, dossier, prenom) } })] }) },
    { id: 'fin', quand: apresMail({ a: MAIL_PRESTA }),
      semer: (prenom, db) => ({ mails: [mail(prenom, HUGO, 'Merci', `Merci ${prenom}, je transmets à la comptabilité.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\nHugo`, { db, heure: '09:50' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons
export const GROUPES = { lignes: 'Les lignes à contester', montant: 'Le bon montant', reclamation: 'La réclamation' };
// Une erreur d'un niveau donné est trouvée (bon motif, une seule ligne du doublon), sans que l'élève ait contesté trois lignes justes ou davantage (cocher tout n'est pas contrôler).
const trouvee = (niveau) => (v, db) => {
  const F = dossier(db), t = erreursDe(db).find((x) => niveauDe(x) === niveau);
  const j = juger(v, F);
  return !!t && j.trouvees[t] === true && j.surcontestees.length < 3;
};
const surFiche = (id, titre, groupe, poids, juste) => ({ id, titre, groupe, poids, ecran: `fiche:${FICHE_ID}`,
  verifier(db) {
    if (!envoyee(db, FICHE_ID)) return attente;
    return juste(valeursDe(db, FICHE_ID), db) ? ok : ko;
  } });
export const ETAPES = [
  surFiche('erreur-facile', 'Une erreur « facile » trouvée avec le bon motif', GROUPES.lignes, 3, trouvee('facile')),
  surFiche('erreur-moyenne', 'Une erreur « moyenne » trouvée avec le bon motif', GROUPES.lignes, 3, trouvee('moyen')),
  surFiche('erreur-difficile', 'Une erreur « difficile » trouvée avec le bon motif', GROUPES.lignes, 3, trouvee('difficile')),
  // Aucune ligne juste contestée (et le total jugé faux seulement s'il l'est) : vrai seulement si l'élève a contesté au moins une ligne (une fiche vide ne rapporte rien).
  surFiche('aucune-juste', 'Aucune ligne juste contestée', GROUPES.lignes, 2, (v, db) => {
    const F = dossier(db), j = juger(v, F);
    return j.cochees.length > 0 && j.surcontestees.length === 0 && (F.fautes.calcul ? true : (v || {}).total !== 'faux');
  }),
  surFiche('calcul', 'Le total HT, la TVA, le total TTC et l’écart', GROUPES.montant, 3, (v, db) => jugerFiche(v, dossier(db)).calcul),
  { id: 'reclamation', titre: 'La réclamation : lignes, motifs et avoir', groupe: GROUPES.reclamation, poids: 2, ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return ['lignes', 'motifs', 'avoir'].every((l) => r.justes.includes(l)) ? ok : ko; } },
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, accueil, options
export const PASTILLES = [
  { libelle: 'Le contrôle', fait: dejaEnvoyee(FICHE_ID) },
  { libelle: 'La réclamation', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const SUITE = [
  { vue: 'fiche', libelle: 'Le contrôle de la facture', fait: dejaEnvoyee(FICHE_ID) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'La réclamation au prestataire', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const MENTION_128 = 'Réels : IKEA France et son centre de Gennevilliers, qui confie le dernier kilomètre à des transporteurs ; l’article 1302 du Code civil. '
  + 'Construits : le prestataire de livraison (jamais nommé), son tarif, les bons, la facture, les clients.';
export const ACCUEIL = {
  titre: 'Évaluation : la facture de mars',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Hugo', 'Menu Messagerie.'],
    ['① Le contrôle', 'Compare chaque ligne de la facture aux bons signés et au tarif, sans aide : coche les lignes à contester, dis si le total est exact, puis calcule le bon montant.'],
    ['② La réclamation', 'Écris au prestataire, une phrase par ligne.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION_128],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : la facture de mars',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE],
  pastilles: PASTILLES,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
