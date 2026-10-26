// ENT-12.4 — IKEA, « la facture du transporteur » : le contenu de la séance (brief `docs/briefs/ENT-12.4-ikea-facture-du-transporteur.md` ; choix de Tristan du 26/10/2026,
// `docs/briefs/ikea/A-TRANCHER.md`). Quatrième séance de l'entreprise n° 12 (2de GATL, poste A : assistant(e) de gestion du service transport, AGOrA), GUIDAGE de AGO-2.1
// (suivre l'activité : contrôler la facture d'achat). Évaluation : ENT-12.8. Univers : `contenus/ikea.js` ; facture : `contenus/ikea-facture.js` et `contenus/ikea-facture-ecrans.js` ;
// données : `contenus/ikea-ent124-donnees.js` ; questions : `contenus/questions/ENT-12.4.js` ; corrigé : `contenus/corriges/ENT-12.4.js` ; activité : `activites/ikea-facture-transporteur.js`.
//
// Lundi 8 mars 2027. Écrans, un par étape : Avant de commencer (non noté) → ① La fiche de contrôle (trois blocs de cases : on coche la ligne sous son motif ; le bon montant) →
// ② La réclamation au prestataire (phrases à choisir, au vous).
//
// Poids (brief §5, tranché par Tristan le 26/10/2026) : trois erreurs 9 (3 chacune) · aucune ligne juste contestée 2 · le bon montant 3 · la réclamation 2 · questions notées 4 = 20.
// Rien n'est vrai avant l'envoi de la fiche ou du message : l'inaction vaut 0, et une fiche vide n'accuse aucune ligne juste mais ne rapporte pas non plus les 2 points.

import { apresFiche, apresMail } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQUIPE_IK, STYLE_DOCUMENTS, ech, pied } from './ikea.js';
import { juger } from './ikea-facture.js';
import { docTarif, docBons, docFacture, blocsControle, jugerFiche, phrasesReclamation } from './ikea-facture-ecrans.js';
import { QUESTIONS } from './questions/ENT-12.4.js';
import { ID, ID_VOLET, FICHE_ID, PHRASES_ID, MAIL_PRESTA, JOUR, NUMERO, PERIODE, ARTICLE_1302, dossier, envoyee, valeursDe, dejaEnvoyee } from './ikea-ent124-donnees.js';

export { ID, ID_VOLET, FICHE_ID, PHRASES_ID } from './ikea-ent124-donnees.js';

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
const DOC_POSTE = { id: 'poste-124', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="ik-doc" aria-label="Ton poste">
    <p class="ik-t">Ton poste</p>
    <p class="ik-st">Service transport du centre de distribution clients IKEA de Gennevilliers — lundi 8 mars 2027</p>
    <p>Tu es assistant(e) de gestion au <b>service transport</b>. IKEA confie le dernier kilomètre à un <b>prestataire de livraison</b> (il n’est pas nommé ici), qui lui envoie une
      <b>facture</b> chaque mois. Ton responsable : <b>Hugo</b>.</p>
    <p>Ton travail : <b>contrôler la facture de février</b> avant qu’elle soit payée. Tu la compares aux <b>bons de livraison signés</b> et au <b>tarif</b>, tu repères les lignes fausses,
      tu calcules le bon montant, puis tu <b>réclames par écrit</b> ce qui n’est pas dû.</p>
    ${pied('Document pédagogique. Réels : IKEA France et son centre de Gennevilliers, qui confie ses livraisons à des transporteurs. Construits : Hugo, le prestataire (jamais nommé), son tarif, la facture, les bons.')}
  </article>` };
const DOC_DROIT = { id: 'droit-124', titre: 'Le droit : ce qui n’est pas dû', court: 'Le droit',
  html: `<article class="ik-doc" aria-label="Le droit : le paiement de l’indu">
    <p class="ik-t">Le droit : payer ce qui est dû</p>
    <p class="ik-st">Code civil, article 1302 (alinéa 1)</p>
    <p class="ik-loi">« ${ech(ARTICLE_1302)} »</p>
    ${pied('Texte de loi (réel) — source : Légifrance.')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_DROIT, docTarif('tarif-124', 'février 2027'), docBons('bons-124', dossier, 'février'),
  docFacture('facture-124', dossier, { mois: 'février', numero: NUMERO, periode: PERIODE })];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── la fiche de contrôle
export const FICHE = {
  id: FICHE_ID, libelle: 'Contrôle de la facture', titre: 'Contrôler la facture du prestataire',
  sousTitre: 'À gauche : le tarif, les bons signés et la facture. Coche les lignes à contester sous leur motif, puis calcule le bon montant.',
  documents: ['facture-124', 'bons-124', 'tarif-124'], largeurDocs: 1.3, defile: true,
  bouton: 'Ouvrir la fiche de contrôle',
  blocs: blocsControle(dossier),
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
    mail(prenom, HUGO, 'La facture de février à contrôler',
      `Bonjour ${prenom} ! Le prestataire de livraison nous a envoyé sa facture de février. Avant de la payer, contrôle-la : compare chaque ligne aux bons de livraison signés et au tarif. `
        + 'Ouvre la fiche « Contrôle de la facture ».\n\nHugo',
      { db, heure: '09:00', extra: { pieces: ['poste-124', 'facture-124', 'bons-124', 'tarif-124'], ouvreFiche: FICHE_ID } }),
  ] }),
  declencheurs: [
    { id: 'reclamation', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, PRESTA, `Facture ${NUMERO} — ${PERIODE}`,
        `Bonjour,\n\nVeuillez trouver ci-joint notre facture n° ${NUMERO} pour les livraisons de février 2027, à régler sous 30 jours.\n\nLe service facturation`,
        { db, heure: '09:40', extra: { phrases: phrasesReclamation(PHRASES_ID, dossier, prenom) } })] }) },
    { id: 'fin', quand: apresMail({ a: MAIL_PRESTA }),
      semer: (prenom, db) => ({ mails: [mail(prenom, HUGO, 'Merci', `Merci ${prenom}, je transmets à la comptabilité.\n\nHugo`, { db, heure: '09:50' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids du brief §5, 26/10/2026)
export const GROUPES = { lignes: 'Les lignes à contester', montant: 'Le bon montant', reclamation: 'La réclamation' };
const surFiche = (id, titre, groupe, poids, juste) => ({ id, titre, groupe, poids, ecran: `fiche:${FICHE_ID}`,
  verifier(db) {
    if (!envoyee(db, FICHE_ID)) return attente;
    return juste(valeursDe(db, FICHE_ID), dossier()) ? ok : ko;
  } });
const ligne = (id) => (db) => { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return r.justes.includes(id); };
export const ETAPES = [
  surFiche('doublon', 'La livraison facturée deux fois', GROUPES.lignes, 3, (v, F) => juger(v, F).trouvees.doublon),
  surFiche('tarif', 'La livraison au mauvais tarif', GROUPES.lignes, 3, (v, F) => juger(v, F).trouvees.tarif),
  surFiche('nonfaite', 'La livraison non faite', GROUPES.lignes, 3, (v, F) => juger(v, F).trouvees.nonfaite),
  // Aucune ligne juste contestée : vrai seulement si l'élève a contesté au moins une ligne (une fiche vide ne rapporte rien).
  surFiche('aucune-juste', 'Aucune ligne juste contestée', GROUPES.lignes, 2, (v, F) => { const j = juger(v, F); return j.cochees.length > 0 && j.surcontestees.length === 0; }),
  surFiche('calcul', 'Le total HT, la TVA, le total TTC et l’écart', GROUPES.montant, 3, (v, F) => jugerFiche(v, F).calcul),
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
export const MENTION_124 = 'Réels : IKEA France et son centre de Gennevilliers, qui confie le dernier kilomètre à des transporteurs ; l’article 1302 du Code civil. '
  + 'Construits : le prestataire de livraison (jamais nommé), son tarif, les bons, la facture, les clients.';
export const ACCUEIL = {
  titre: 'La facture du transporteur',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Hugo', 'Menu Messagerie.'],
    ['① Le contrôle', 'Compare chaque ligne de la facture aux bons signés et au tarif : coche les lignes à contester sous leur motif, puis calcule le bon montant.'],
    ['② La réclamation', 'Écris au prestataire, une phrase par ligne.'],
    ['Bon à savoir', MENTION_124],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'La facture du transporteur',
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
