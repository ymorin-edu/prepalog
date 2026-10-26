// ENT-12.2 — IKEA, « la demande de Mme Benali » : le contenu de la séance (brief `docs/briefs/ENT-12.2-ikea-demande-de-mme-benali.md` ; choix de Tristan du
// 26/10/2026, `docs/briefs/ikea/A-TRANCHER.md`). Deuxième séance de l'entreprise n° 12 (2de GATL, poste B : agent(e) du service livraison, transport), GUIDAGE
// de OTM-C1.1 (prendre en compte la demande du client) et OTM-C1.2 (choisir les modalités de l'opération de transport). Évaluation : ENT-12.7.
// Univers commun : `contenus/ikea.js` (JAMAIS modifié ici). Données pures : `contenus/ikea-ent122-donnees.js`. Activité : `activites/ikea-demande-cliente.js`.
// Questions : `contenus/questions/ENT-12.2.js`. Corrigé : `contenus/corriges/ENT-12.2.js`.
//
// Mardi 9 mars 2027, 9 h, service livraison du centre de distribution de Gennevilliers. Écrans, un par étape :
//   Avant de commencer (non noté) → ① L'appel (vue Téléphone, guidage : une réplique maladroite fait réagir Mme Benali) → ② La fiche « mode de livraison »
//   (un mode et une raison par article, le prix) → ③ Le message à Mme Benali (phrases à choisir, au vous).
//
// Poids (brief §5, tranché par Tristan le 26/10/2026) : écoute 7 (accès 3 · créneau et reprise 2 · rien de faux promis 2) · mode 6 (2 par article) ·
// prix 2 · message 1 · ton 1 · questions notées 3 = 20. Rien n'est vrai avant l'envoi d'une fiche, d'un message ou la fin de l'appel : l'inaction vaut 0.

import { apresFiche, apresMail, dialogueFini } from '../core/declencheurs.js';
import { jalonDialogue, premiereReponse, appelRetenuDe } from '../core/types/dialogue.js';
import { phrasesJustes } from '../core/phrases.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQUIPE_IK, MODES, STYLE_DOCUMENTS, htmlTarifs, ech, pied, euros, FIL_ROUGE } from './ikea.js';
import { QUESTIONS } from './questions/ENT-12.2.js';
import {
  ID, ID_VOLET, DIALOGUE_ID, FICHE_ID, PHRASES_ID, MAIL_BENALI, JOUR_APPEL, CRENEAUX, REPLIQUES, FIN_APPEL, RAISONS, ARTICLES, CHAMP, TIRAGE,
  situationDe, envoyee, dejaEnvoyee, lireNombre, phrasesReponse, POIDS_CANAPE, POIDS_LAMPE, PRIX_LAMPE,
  ACCES_DEMANDE, CRENEAU_ET_REPRISE, SANS_PROMESSE_FAUSSE, TON_DE_L_APPEL,
} from './ikea-ent122-donnees.js';

export { ID, ID_VOLET, DIALOGUE_ID, FICHE_ID, PHRASES_ID, TIRAGE } from './ikea-ent122-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// ─────────────────────────────────────────────────────────────── ce que le moteur exige (aucun article de stock en jeu)
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
  claire: { nom: EQUIPE_IK.claire.prenom, role: `${EQUIPE_IK.claire.poste} (ta responsable)`, appel: 'Claire' },
  benali: { nom: `${FIL_ROUGE.cliente.prenom} ${FIL_ROUGE.cliente.nom}`, role: 'cliente', appel: 'Mme Benali' },
};
const mailDe = (id) => `${id}@cdc-gennevilliers.example`;
const CLAIRE = { nom: EQUIPE.claire.nom, mail: mailDe('claire') };
const BENALI = { nom: EQUIPE.benali.nom, mail: MAIL_BENALI };

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; pied imposé)
const DOC_POSTE = { id: 'poste-122', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="ik-doc" aria-label="Ton poste">
    <p class="ik-t">Ton poste</p>
    <p class="ik-st">Service livraison du centre de distribution clients IKEA de Gennevilliers — mardi 9 mars 2027</p>
    <p>Tu es agent(e) du <b>service livraison</b> du centre de distribution clients de Gennevilliers (Hauts-de-Seine), qui prépare les meubles lourds et volumineux
      vendus en ligne. Ta responsable : <b>Claire</b>.</p>
    <p>Ce matin, tu appelles une <b>cliente</b>, <b>Mme Leïla Benali</b> (Paris 11e), pour préparer la livraison de sa commande : une <b>armoire</b> (3 colis), un
      <b>canapé</b> (2 colis) et une <b>lampe</b>. Tu lui parles au <b>vous</b>. Ensuite tu choisis le <b>mode de livraison</b> de chaque article et tu lui confirmes
      tout par écrit.</p>
    ${pied('Document pédagogique. Réels : IKEA France, son centre de Gennevilliers, ses modes de livraison. Construits : Mme Benali, Claire, sa commande, l’idée que le service livraison du centre rappelle la cliente.')}
  </article>` };

const DOC_COMMANDE = { id: 'commande-122', titre: 'La commande de Mme Benali', court: 'La commande',
  html: (db) => {
    const S = situationDe(db);
    return `<article class="ik-doc" aria-label="Commande ${ech(FIL_ROUGE.commande)}">
    <p class="ik-t">Commande n° ${ech(FIL_ROUGE.commande)}</p>
    <p class="ik-st">Passée en ligne — mode choisi par la cliente sur le site pour les meubles : « devant chez vous »</p>
    <dl class="ik-dl">
      <dt>Cliente</dt><dd>Mme Leïla Benali, Paris 11e</dd>
      <dt>IKEA Family</dt><dd>${S.membre ? 'membre' : 'non membre'}</dd>
      <dt>Reprise de l’ancien canapé</dt><dd>réservée à la commande</dd>
      <dt>Créneaux libres</dt><dd>${CRENEAUX.map((c) => ech(c.lib)).join(' · ')}</dd>
    </dl>
    <table class="ik-table">
      <thead><tr><th scope="col">Article</th><th scope="col">Colis</th><th class="ik-d" scope="col">Poids par colis</th><th class="ik-d" scope="col">Prix</th></tr></thead>
      <tbody>
        <tr><td>Lampe de table</td><td>1 (42 cm)</td><td class="ik-d">${String(POIDS_LAMPE).replace('.', ',')} kg</td><td class="ik-d">${euros(PRIX_LAMPE)}</td></tr>
        <tr><td>Armoire</td><td>3 (au plus 201 cm)</td><td class="ik-d">${S.kg.join(' kg, ')} kg</td><td class="ik-d">${euros(S.armoire)}</td></tr>
        <tr><td>Canapé</td><td>2 (au plus 220 cm)</td><td class="ik-d">${POIDS_CANAPE.join(' kg, ')} kg</td><td class="ik-d">${euros(S.canape)}</td></tr>
      </tbody>
    </table>
    ${pied('Commande reconstituée pour l’exercice : la cliente, les articles, les poids et les prix sont construits. ' + 'Document pédagogique — reconstitution, non contractuel.')}
  </article>`;
  } };

const DOC_TARIFS = { id: 'tarifs-122', titre: 'Les modes de livraison et leurs prix', court: 'Modes et prix',
  html: `<article class="ik-doc" aria-label="Modes de livraison et prix">
    <p class="ik-t">Les modes de livraison et leurs prix</p>
    <p class="ik-st">D’après la page « Livraison » d’IKEA France, relevée le 26/10/2026 (les prix peuvent changer)</p>
    ${htmlTarifs()}
    <p class="ik-st" style="margin-top:10px">Règle de l’exercice (simplification) : la lampe part seule, en Point Relais ; les meubles (armoire et canapé) se livrent par un seul mode, dont le prix se lit sur le
      montant de ces deux articles ensemble, sans la lampe.</p>
    ${pied('Prix réels de la page « Livraison » d’IKEA France, relevés le 26/10/2026. Mise en page reconstituée. ' + 'Document pédagogique — reconstitution, non contractuel.')}
  </article>` };

export const DOC_CGV = { id: 'cgv-122', titre: 'Conditions de vente (extraits)', court: 'Conditions de vente',
  html: `<article class="ik-doc" aria-label="Conditions générales de vente d’IKEA France, extraits">
    <p class="ik-t">Conditions de vente d’IKEA France (extraits)</p>
    <p class="ik-st">Version du 10/08/2026 — extraits reformulés au plus près, avec les formules citées entre guillemets</p>
    <p><b>Art. 4.1.2 — Livraison à domicile de colis volumineux.</b></p>
    <ul class="ik-ul">
      <li>« IKEA s’engage à vous livrer à la date et au créneau horaire que vous aurez choisi. »</li>
      <li>Le client indique à l’achat les difficultés de transport (poids, volume) et vérifie son adresse.</li>
      <li>Si le produit ne peut pas entrer dans le logement, le client peut le faire reprendre à ses frais ; IKEA n’assure pas la livraison par la fenêtre.</li>
      <li>Si le client ne peut pas être présent, il doit en informer le Service client et reprogrammer au plus tard 72 heures avant la date prévue.</li>
    </ul>
    <p><b>Art. 4.1.2.1 — Livraison devant chez vous.</b> Réservée aux commandes de moins de 1 000 € ; les colis sont déposés devant la porte principale de l’immeuble, le client les transporte ensuite.</p>
    <p><b>Art. 14.2.2 — Reprise du meuble usagé lors de la livraison.</b></p>
    <ul class="ik-ul">
      <li>IKEA reprend sans frais un meuble volumineux usagé lors de la livraison.</li>
      <li>Conditions : le meuble mesure plus de deux mètres (largeur + longueur + hauteur), il est de même nature que le produit acheté, il est démonté.</li>
      <li>Pas de reprise pour une livraison Express. La reprise se réserve au moment de la commande.</li>
    </ul>
    ${pied('Extraits des conditions de vente d’IKEA France (version du 10/08/2026), reformulés : ce n’est pas le texte officiel. ' + 'Document pédagogique — reconstitution, non contractuel.')}
  </article>` };

export const STYLE = STYLE_DOCUMENTS;
export const DOCUMENTS = [DOC_POSTE, DOC_COMMANDE, DOC_TARIFS, DOC_CGV];

// ─────────────────────────────────────────────────────────────── ① l'appel (écran Téléphone, guidage)
export const TELEPHONE = {
  libelle: 'L’appel de Mme Benali',
  situation: 'Mme Benali attend ton appel : prépare la livraison de sa commande.',
  dialogues: [{ id: DIALOGUE_ID, de: 'benali', contact: { nom: 'Mme Leïla Benali', detail: 'cliente, Paris 11e' }, repliques: REPLIQUES, fin: FIN_APPEL }],
};
const appelFini = (db) => dialogueFini(DIALOGUE_ID)(db, ID);

// ─────────────────────────────────────────────────────────────── ② la fiche « mode de livraison »
const choixMode = MODES.map(({ v, lib }) => ({ v, lib }));
const bloc = (art) => ({ type: 'cadre', titre: art.lib, blocs: [
  { type: 'liste', id: CHAMP(art.id, 'mode'), lib: 'Mode de livraison', vide: 'Choisir…', manque: `le mode de ${art.lib.toLowerCase()}`, choix: choixMode },
  { type: 'liste', id: CHAMP(art.id, 'raison'), lib: 'Ce qui décide', vide: 'Choisir…', manque: `la raison pour ${art.lib.toLowerCase()}`, choix: RAISONS },
] });
export const FICHE = {
  id: FICHE_ID, libelle: 'Mode de livraison', titre: 'Choisir le mode de livraison de chaque article',
  sousTitre: 'À gauche : la commande, les modes et leurs prix, les conditions de vente. Un mode et ce qui le décide pour chaque article, puis le prix que paiera Mme Benali.',
  documents: ['commande-122', 'tarifs-122', 'cgv-122'], largeurDocs: 1.1, defile: true,
  bouton: 'Ouvrir la fiche « mode de livraison »',
  quand: (db) => appelFini(db) || envoyee(db, FICHE_ID),
  blocs: [
    ...ARTICLES.map(bloc),
    { type: 'cadre', titre: 'Le prix', blocs: [
      { type: 'nombre', id: 'prix', lib: 'Prix total de la livraison de Mme Benali', unite: '€', min: 0, entier: true, manque: 'le prix total' },
    ] },
  ],
  envoi: { bouton: 'Envoyer la fiche à Claire', a: 'Claire', suite: 'Merci, c’est noté.' },
};

// ─────────────────────────────────────────────────────────────── les messages (au tu entre collègues ; Mme Benali écrit au vous)
// Les messages portent la date du SCÉNARIO, jamais la date réelle.
function heureMail(db, hhmm, { decalage = 0 } = {}) {
  const [a, m, j] = JOUR_APPEL.iso.split('-').map(Number);
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
    mail(prenom, CLAIRE, 'Une cliente à appeler',
      `Bonjour ${prenom} ! Mme Benali a commandé une armoire, un canapé et une lampe. Appelle-la pour caler sa livraison : ouvre « L’appel de Mme Benali », dans le menu. `
        + 'Ensuite, tu choisiras le mode de livraison de chaque article.\n\nClaire',
      { db, heure: '09:00', extra: { pieces: ['poste-122', 'commande-122'] } }),
  ] }),
  declencheurs: [
    { id: 'fiche', quand: appelFini,
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Les modes de livraison',
        `Merci ${prenom}. Voici les modes de livraison et leurs prix, et les extraits des conditions de vente. Ouvre la fiche « mode de livraison » : un mode pour chaque article, `
          + 'ce qui le décide, puis le prix total de la livraison.\n\nClaire',
        { db, heure: '09:12', extra: { pieces: ['tarifs-122', 'cgv-122'], ouvreFiche: FICHE_ID } })] }) },
    { id: 'message', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, BENALI, 'Ma livraison : votre confirmation par écrit',
        'Bonjour,\n\nComme convenu au téléphone, pouvez-vous me confirmer par écrit la date, le mode de livraison de chaque article, le prix et la reprise de mon ancien canapé ? Merci.\n\nLeïla Benali',
        { db, heure: '09:25', extra: { phrases: phrasesReponse(prenom) } })] }) },
    { id: 'fin', quand: apresMail({ a: MAIL_BENALI }),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Merci',
        `Merci ${prenom}, c’est parti.\n\nClaire`, { db, heure: '09:32' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids du brief §5, 26/10/2026)
export const GROUPES = { ecoute: 'L’appel : écouter la cliente', mode: 'Le mode de livraison', message: 'Le message', ton: 'Le ton' };
const appelJuge = (id, titre, poids, juge) => jalonDialogue({ seance: ID, dialogue: DIALOGUE_ID, id, titre, groupe: GROUPES.ecoute, poids,
  juge: (appel) => juge(appel, premiereReponse) });
const surFiche = (id, titre, groupe, poids, juste) => ({ id, titre, groupe, poids, ecran: `fiche:${FICHE_ID}`,
  verifier(db) {
    if (!envoyee(db, FICHE_ID)) return attente;
    return juste(((db.fiches || {})[FICHE_ID] || {}).valeurs || {}, situationDe(db)) ? ok : ko;
  } });
const LIGNES_MESSAGE = ['creneau', 'mode', 'prix', 'reprise', 'rappel'];

export const ETAPES = [
  appelJuge('ecoute-acces', 'L’appel : l’étage, l’ascenseur et l’escalier demandés', 3, ACCES_DEMANDE),
  appelJuge('ecoute-creneau', 'L’appel : le créneau fixé et la reprise avec ses conditions', 2, CRENEAU_ET_REPRISE),
  appelJuge('ecoute-promesse', 'L’appel : rien de faux promis', 2, SANS_PROMESSE_FAUSSE),
  ...ARTICLES.map((a) => surFiche(`mode-${a.id}`, `Le mode : ${a.lib.toLowerCase()}`, GROUPES.mode, 2,
    (v) => v[CHAMP(a.id, 'mode')] === a.mode && v[CHAMP(a.id, 'raison')] === a.raison)),
  surFiche('prix', 'Le prix total de la livraison', GROUPES.mode, 2, (v, S) => lireNombre(v.prix) === S.total),
  { id: 'message', titre: 'Le message : date, mode, prix, reprise et rappel', groupe: GROUPES.message, poids: 1, ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return LIGNES_MESSAGE.every((l) => r.justes.includes(l)) ? ok : ko; } },
  { id: 'ton', titre: 'Le ton : l’appel et le message', groupe: GROUPES.ton, poids: 1,
    verifier(db) {
      const a = appelRetenuDe(db, ID, DIALOGUE_ID), r = phrasesJustes(db, PHRASES_ID);
      if (!a || !r.envoye) return attente;
      return TON_DE_L_APPEL(a, premiereReponse) && ['salutation', 'fin'].every((l) => r.justes.includes(l)) ? ok : ko;
    } },
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, accueil, options
export const PASTILLES = [
  { libelle: 'L’appel', fait: appelFini },
  { libelle: 'Le mode', fait: dejaEnvoyee(FICHE_ID) },
  { libelle: 'Le message', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const SUITE = [
  { vue: 'telephone', libelle: 'L’appel de Mme Benali', fait: appelFini },
  { vue: 'fiche', libelle: 'Le mode de livraison', fait: dejaEnvoyee(FICHE_ID) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Le message à Mme Benali', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const MENTION_122 = `${'Réels : IKEA France et son centre de Gennevilliers, les modes de livraison et leurs prix (relevés le 26/10/2026), les conditions de vente (10/08/2026). '}`
  + 'Construits : Mme Benali, sa commande, les poids et les prix des articles, les créneaux.';
export const ACCUEIL = {
  titre: 'La demande de Mme Benali',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Claire', 'Menu Messagerie.'],
    ['① L’appel', 'Appelle Mme Benali : demande-lui ce qu’il faut pour préparer sa livraison, et choisis tes répliques.'],
    ['② Le mode de livraison', 'Avec les prix et les conditions de vente, choisis le mode de chaque article et dis le prix total.'],
    ['③ Le message', 'Confirme tout à Mme Benali par écrit, une phrase par ligne.'],
    ['Bon à savoir', MENTION_122],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'La demande de Mme Benali',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE],
  telephone: TELEPHONE,
  pastilles: PASTILLES,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
