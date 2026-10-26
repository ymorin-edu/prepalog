// ENT-12.3 — IKEA, « la Seine est en crue » : le contenu de la séance (brief `docs/briefs/ENT-12.3-ikea-seine-en-crue.md` ; choix de Tristan du 26/10/2026, `docs/briefs/ikea/A-TRANCHER.md`).
// Troisième séance de l'entreprise n° 12 (2de GATL, poste B : agent(e) du service livraison, OTM), ENTRAÎNEMENT d'OTM-C3.1 (contrôler les engagements contractuels avec le client) et d'OTM-C1.2
// (choisir les modalités). Évaluation : ENT-12.7. Univers : `contenus/ikea.js` ; données : `contenus/ikea-ent123-donnees.js` ; questions : `contenus/questions/ENT-12.3.js` ;
// corrigé : `contenus/corriges/ENT-12.3.js` ; activité : `activites/ikea-seine-en-crue.js`.
//
// Jeudi 11 mars 2027, 6 h 15. Écrans, un par étape : Avant de commencer (non noté) → ① Le planning du jour (la vue Planning : d'abord le jour normal, tout part par la péniche ; on l'envoie ;
// puis la Seine monte, la péniche est retirée de la grille, il faut tout reposer sur trois camions ou reporter à demain) → ② Prévenir les clients (fiche : qui, et quelle nouvelle date) →
// ③ La réponse à Mme Roux, qui veut annuler (phrases à choisir, au vous).
//
// ÉCARTS AU BRIEF (dits à Tristan) : « prévenir » est une FICHE (cases : les clients à prévenir, et la nouvelle date) et non un message par phrases : le moteur ne sait pas choisir des destinataires par
// phrases ; le planning est FIXE (entraînement) ; les commandes qui ne tiennent pas sont « reportées à demain » (une ligne de la grille, après l'aléa) : Mme Roux et M. Haddad, dont le bloc « trajet + livraison »
// est plus long que le créneau promis. Poids (brief §5 et `A-TRANCHER.md` : planning 5, créneaux tenus 5, prévenir 4, annulation 2, questions 4) : poser les commandes sans qu'un camion soit à deux endroits à la fois 3 ·
// charge des camions 2 · créneaux tenus pour tout ce qui pouvait l'être 5 · prévenir les bons clients 3 + la nouvelle date 1 · réponse à Mme Roux 2 · questions notées 4 (`part`) = 20.
// Rien n'est vrai avant l'envoi : planning, fiche et message à « à faire » tant qu'ils ne sont pas envoyés ; l'inaction vaut 0.

import { apresPlanning, apresFiche, apresMail } from '../core/declencheurs.js';
import { etapesPlanning } from '../core/types/planning.js';
import { phrasesJustes } from '../core/phrases.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQUIPE_IK, STYLE_DOCUMENTS, ech, pied } from './ikea.js';
import { QUESTIONS } from './questions/ENT-12.3.js';
import {
  ID, ID_VOLET, PL, FICHE_PREVENIR, PHRASES_ROUX, MAIL_ROUX, JOUR, COTE, CAMIONS, CAMIONS_IDS, COMMANDES, IMPOSSIBLES, creneauLib, hlib, dansCreneau, nonTenues, toutesPosees,
  planningEnvoye, envoyee, valeursDe, dejaEnvoyee,
} from './ikea-ent123-donnees.js';

export { ID, ID_VOLET, PL, FICHE_PREVENIR, PHRASES_ROUX } from './ikea-ent123-donnees.js';

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
  claire: { nom: EQUIPE_IK.claire.prenom, role: `${EQUIPE_IK.claire.poste} (ta responsable)`, appel: 'Claire' },
  roux: { nom: 'Camille Roux', role: 'cliente', appel: 'Mme Roux' },
};
const CLAIRE = { nom: 'Claire', mail: 'claire@cdc-gennevilliers.example' };
const ROUX = { nom: 'Camille Roux', mail: MAIL_ROUX };

// ─────────────────────────────────────────────────────────────── les documents
const DOC_POSTE = { id: 'poste-123', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="ik-doc" aria-label="Ton poste">
    <p class="ik-t">Ton poste</p>
    <p class="ik-st">Service livraison du centre de distribution clients IKEA de Gennevilliers — jeudi 11 mars 2027</p>
    <p>Tu travailles au <b>service livraison</b>, avec <b>Claire</b>. Chaque jour, tu replaces les commandes des clients sur les <b>moyens de transport</b> du jour et tu tiens les
      <b>engagements</b> pris auprès d’eux : IKEA a promis une <b>date</b> et un <b>créneau</b>.</p>
    <p>D’ordinaire, les livraisons dans Paris partent par la <b>péniche</b> (Gennevilliers → Bercy), puis en <b>utilitaires électriques</b>. Quand la péniche ne peut pas partir, il reste les
      <b>camions</b> du centre.</p>
    ${pied('Document pédagogique. Réels : IKEA France et son centre de Gennevilliers (livraison par la Seine depuis décembre 2022). Construits : Claire, les clients, les commandes, les camions.')}
  </article>` };
const DOC_COMMANDES = { id: 'commandes-123', titre: 'Les dix commandes du jour', court: 'Les commandes',
  html: `<article class="ik-doc" aria-label="Les dix commandes du jour">
    <p class="ik-t">Les dix commandes du jeudi 11 mars</p>
    <p class="ik-st">Chaque client a reçu une date et un créneau. « Trajet + livraison » : le temps que le camion passe chez ce client, route comprise.</p>
    <table class="ik-table">
      <thead><tr><th scope="col">Client</th><th scope="col">Où</th><th scope="col">Créneau promis</th><th class="ik-d" scope="col">Trajet + livraison</th><th class="ik-d" scope="col">Poids</th><th class="ik-d" scope="col">km (aller-retour)</th></tr></thead>
      <tbody>${COMMANDES.map((c) => `<tr><td>${ech(c.client)} <span class="ik-st">(${ech(c.meuble)})</span></td><td>${ech(c.quartier)}</td><td>${ech(creneauLib(c))}</td>
        <td class="ik-d">${Math.floor(c.dur / 60)} h ${String(c.dur % 60).padStart(2, '0')}</td><td class="ik-d">${c.kg} kg</td><td class="ik-d">${c.km} km</td></tr>`).join('')}</tbody>
    </table>
    ${pied('Commandes CONSTRUITES pour l’exercice (clients fictifs, noms de famille seuls). Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
const DOC_CAMIONS = { id: 'camions-123', titre: 'Les trois camions', court: 'Les camions',
  html: `<article class="ik-doc" aria-label="Les trois camions">
    <p class="ik-t">Les trois camions de Gennevilliers</p>
    <p class="ik-st">Disponibles toute la journée, de 8 h à 20 h</p>
    <table class="ik-table">
      <thead><tr><th scope="col">Camion</th><th class="ik-d" scope="col">Peut porter</th></tr></thead>
      <tbody>${CAMIONS.map((c) => `<tr><td>${ech(c.nom)}</td><td class="ik-d">${ech(c.note)}</td></tr>`).join('')}</tbody>
    </table>
    <ul>
      <li>Un camion <b>ne fait qu’une livraison à la fois</b> : le bloc « trajet + livraison » d’une commande ne peut pas en recouvrir un autre.</li>
      <li>Un camion se charge <b>le matin, une seule fois</b> : le poids de <b>toutes</b> les commandes qu’il livre dans la journée doit tenir dans ce qu’il peut porter.</li>
      <li>Un client <b>reporté à demain</b> n’est pas livré aujourd’hui : on le prévient.</li>
    </ul>
    ${pied('Camions CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
const DOC_SEINE = { id: 'seine-123', titre: 'La Seine et la péniche', court: 'La Seine',
  html: `<article class="ik-doc" aria-label="La Seine et la péniche">
    <p class="ik-t">La Seine et la péniche</p>
    <p class="ik-st">Jeudi 11 mars 2027, 6 h</p>
    <p>La péniche d’IKEA relie Gennevilliers à Bercy et traverse Paris. Quand le fleuve monte, elle doit passer sous des ponts de plus en plus bas, et le courant devient fort.</p>
    <p><b>Règle de navigation (HAROPA, Ports de Paris) :</b> à la cote de <b>${ech(COTE.seuil)}</b> à l’échelle du pont d’Austerlitz, la navigation est interdite entre le pont de Grenelle et l’entrée du bassin de l’Arsenal.</p>
    <p><b>Ce matin, la Seine est à ${ech(COTE.jour)}</b> : la péniche ne part pas.</p>
    ${pied('Réel : la chaîne Gennevilliers → péniche → Bercy → utilitaires électriques (IKEA, HAROPA, décembre 2022) et la règle des 4,30 m (document HAROPA « Navigation : règles incontournables », non daté, règles en révision). Construit : la cote de ce matin (4,45 m).')}
  </article>` };
const DOC_DROIT = { id: 'droit-123', titre: 'Le droit : tenir sa date de livraison', court: 'Le droit',
  html: `<article class="ik-doc" aria-label="Le droit : la date de livraison">
    <p class="ik-t">Le droit : tenir sa date de livraison</p>
    <p class="ik-st">Conditions générales de vente d’IKEA (10/08/2026) et Code de la consommation</p>
    <p><b>L’engagement d’IKEA.</b> IKEA s’engage à livrer à la date et au créneau choisis par le client (art. 4.1.2 des conditions de vente). Si une circonstance exceptionnelle l’en empêche, IKEA prévient le
      client dans les plus brefs délais et convient avec lui d’une nouvelle date (art. 4.4).</p>
    <p><b>Si IKEA ne livre pas.</b> Le client ne peut pas annuler tout de suite : il doit d’abord <b>demander à IKEA de livrer dans un délai supplémentaire raisonnable</b>, par un écrit (un courriel suffit).
      <b>Si IKEA ne livre pas dans ce délai</b>, le client peut mettre fin au contrat et être remboursé (Code de la consommation, art. L216-6).</p>
    <p><b>Une exception.</b> Le client peut annuler <b>tout de suite</b> si la date de livraison était une <b>condition essentielle</b> du contrat (par exemple, un meuble commandé pour un mariage, et dit comme tel au vendeur),
      ou si le vendeur refuse de livrer.</p>
    ${pied('Texte reformulé (non cité mot pour mot) d’après la fiche pratique de la DGCCRF « Délais de livraison » (lue le 26/10/2026) et les conditions de vente d’IKEA. À relire sur Légifrance avant la classe.')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_COMMANDES, DOC_CAMIONS, DOC_SEINE, DOC_DROIT];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── le planning
const famille = { cmd: { couleur: '#8b5cf6', nom: 'violet', legende: 'commande à livrer' } };
const libCreneau = (c) => `<b>${ech(creneauLib(c))}</b>`;
const aucun = (L) => L.length === 0;
const camionsDe = (I) => CAMIONS_IDS.map((id) => [id, I.filter((i) => i.r === id).sort((a, b) => a.s - b.s)]);
export const PLANNING = {
  id: PL,
  libelle: 'Planning du jour',
  titre: 'Planning des livraisons — jeudi 11 mars 2027',
  date: 'Jeudi 11 mars 2027',
  infos: (o) => [
    'Dix commandes à livrer aujourd’hui, chacune avec le créneau promis au client',
    o.phase === 2 ? 'Trois camions : un seul bloc à la fois par camion, et le poids de tout ce qu’il livre doit tenir dans sa charge'
      : 'Aujourd’hui comme d’habitude : toutes les livraisons partent par la péniche',
    o.phase === 2 ? 'Une commande qui ne peut pas tenir son créneau se reporte à demain : on prévient le client' : 'Envoie le planning à Claire',
  ],
  echelle: { type: 'heures', debut: '08:00', fin: '20:00', pas: 15 },
  lignes: { titre: 'Planning des livraisons — jeudi 11 mars 2027', liste: [
    { id: 'peniche', nom: 'Péniche → Bercy', note: 'puis utilitaires électriques' },
    ...CAMIONS.map((c) => ({ id: c.id, nom: c.nom, note: `peut porter ${c.note}`, cap: c.cap })),
  ] },
  cartes: {
    titre: 'Commandes du jour',
    liste: COMMANDES.map((c) => ({ ...c, titre: `${c.client} — ${c.quartier}`, court: c.client.replace(/^(M\.|Mme) /, ''), famille: 'cmd', des: c.des, avant: c.avant,
      depart: { ligne: 'peniche', de: c.des } })),
    details: (c) => [
      `${ech(c.meuble)} · ${c.kg} kg · ${c.km} km aller-retour`,
      `Créneau promis : ${libCreneau(c)}`,
    ],
    duree: (c) => c.dur,
    libDuree: 'Trajet + livraison',
    detailDuree: (c) => `${Math.floor(c.dur / 60)} h ${String(c.dur % 60).padStart(2, '0')} chez ce client, route comprise`,
    aPlacer: 'À poser',
    nonPosees: (L) => `Commandes pas encore posées : ${L.map((c) => c.court || c.id).join(', ')}.`,
    legende: 'Glisse une commande sur un camion, à l’heure où commence son bloc « trajet + livraison » : il doit tenir dans son créneau. Ou clique la commande, puis la case. '
      + 'Une commande qui ne peut pas tenir son créneau se pose sur la ligne « Reporté à demain ». Clavier : Entrée pour la prendre, flèches, Suppr pour la retirer.',
  },
  familles: famille,
  regles: [
    // Un camion ne fait qu'une livraison à la fois (la péniche et la ligne « demain » n'ont pas cette limite).
    { id: 'chevauche', type: 'critere', verifier: ({ I }) => {
      const out = [];
      camionsDe(I).forEach(([id, L]) => {
        for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) {
          if (L[a].s < L[b].e && L[b].s < L[a].e) out.push({ texte: `${CAMIONS.find((c) => c.id === id).nom} : deux livraisons en même temps.`, cartes: [L[a].id, L[b].id] });
        }
      });
      return out;
    } },
    // Le poids de tout ce qu'un camion livre dans la journée tient dans sa charge.
    { id: 'charge', type: 'critere', verifier: ({ I }) => {
      const out = [];
      camionsDe(I).forEach(([id, L]) => {
        const cam = CAMIONS.find((c) => c.id === id);
        if (L.reduce((s, i) => s + i.c.kg, 0) > cam.cap) out.push({ texte: `${cam.nom} : la charge dépasse ce qu’il peut porter.`, cartes: L.map((i) => i.id) });
      });
      return out;
    } },
    // Les créneaux : toute commande sur un camion est dans son créneau ; on ne reporte à demain que ce qui ne peut pas tenir.
    { id: 'tenus', type: 'critere', verifier: ({ I }) => {
      const out = [];
      I.forEach((i) => {
        if (i.r === 'demain') {
          if (!IMPOSSIBLES.includes(i.id)) out.push({ texte: `${i.c.titre} : cette commande pouvait tenir son créneau, elle n’avait pas à être reportée.`, cartes: [i.id] });
        } else if (CAMIONS_IDS.includes(i.r) && !dansCreneau(i.c, i.s)) {
          out.push({ texte: `${i.c.titre} : la livraison sort du créneau promis (tenir le créneau, ou reporter à demain).`, cartes: [i.id] });
        }
      });
      return out;
    } },
  ],
  jalons: [
    { id: 'poses', lib: 'Toutes les commandes sont posées, sans qu’un camion soit à deux endroits à la fois', regles: ['chevauche'], versions: [2] },
    { id: 'charge', lib: 'La charge de chaque camion est respectée', regles: ['chevauche', 'charge'], versions: [2] },
    { id: 'creneaux', lib: 'Les créneaux sont tenus pour toutes les commandes qui pouvaient l’être', regles: ['chevauche', 'tenus'], versions: [2] },
  ],
  repriseIdentique: 'faux',
  aides: {
    consignes: {
      regles: 'Pose chaque commande sur un camion. Un camion ne fait <b>qu’une livraison à la fois</b>, le poids de tout ce qu’il livre doit tenir dans sa charge, '
        + 'et chaque livraison doit tenir dans le <b>créneau promis</b> au client. Si une commande ne peut pas tenir son créneau, reporte-la à demain.',
    },
    fenetre: {
      invite: 'Clique une commande : une bande ambrée montre le créneau promis au client.',
      carte: (c) => `<b>${ech(c.titre)}</b> : créneau promis <b>${ech(creneauLib(c))}</b>. Le bloc « trajet + livraison » doit tenir dans la bande ambrée.`,
    },
    detailDuree: true,
  },
  alea: {
    de: 'Claire',
    texte: `La Seine est à <b>${COTE.jour}</b> à l’échelle du pont d’Austerlitz : la péniche ne part pas. Les dix livraisons passent en camion, avec <b>trois camions</b> seulement.`,
    retraits: { lignes: ['peniche'] },
    ajoutLignes: [{ id: 'demain', nom: 'Reporté à demain', note: 'vendredi 12 mars' }],
  },
  note: { sur: 20 },
};

// ─────────────────────────────────────────────────────────────── prévenir les clients (fiche)
export const FICHE = {
  id: FICHE_PREVENIR, libelle: 'Prévenir les clients', titre: 'Prévenir les clients qui ne seront pas livrés à l’heure',
  sousTitre: 'Les commandes à gauche, avec leur créneau promis. Coche les clients à prévenir, et choisis la nouvelle date à leur proposer.',
  documents: ['commandes-123', 'droit-123'], largeurDocs: 1.2, defile: true,
  bouton: 'Ouvrir la fiche « Prévenir les clients »',
  quand: (db) => !!planningEnvoye(db, 2),
  blocs: [
    { type: 'cadre', titre: '1. Les clients à prévenir', large: true, blocs: [
      { type: 'cases', id: 'clients', titre: 'Qui ne sera pas livré dans son créneau ?', choix: COMMANDES.map((c) => ({ v: c.id, lib: `${c.client} — ${c.quartier} — créneau promis ${creneauLib(c)}` })) },
    ] },
    { type: 'cadre', titre: '2. La nouvelle date', blocs: [
      { type: 'choix', id: 'date', lib: 'Que leur proposes-tu ?', manque: 'la nouvelle date', colonne: true, choix: [
        { v: 'demain', lib: 'Demain, vendredi 12 mars, le matin' },
        { v: 'mois', lib: 'Dans un mois' },
        { v: 'aucune', lib: 'Pas de date : on les rappellera' },
      ] },
    ] },
  ],
  envoi: { bouton: 'Envoyer à Claire', a: 'Claire', suite: 'Merci, c’est noté.', incomplet: true },
};
// Ce que le planning ENVOYÉ de l'élève dit de ses commandes non tenues (jamais « les deux de la correction » : c'est SON planning qui décide).
export const nonTenuesDeLEleve = (db) => { const v = planningEnvoye(db, 2); return v ? nonTenues(v.place) : null; };

// ─────────────────────────────────────────────────────────────── la réponse à Mme Roux (phrases à choisir, au vous)
export const phrasesRoux = (prenom) => ({ id: PHRASES_ROUX, melanger: true, lignes: [
  { id: 'salutation', choix: ['Bonjour Madame Roux,', 'Salut Camille !', 'Coucou,'], juste: 0 },
  { id: 'regle', choix: [
    'Vous pouvez mettre fin à votre commande si nous ne livrons pas dans le délai supplémentaire que vous nous accordez par écrit : la loi demande d’abord de nous laisser ce délai.',
    'Vous pouvez annuler tout de suite, sans condition.',
    'Vous ne pouvez pas annuler une commande déjà préparée.',
  ], juste: 0 },
  { id: 'date', choix: ['Nous vous proposons de vous livrer demain, vendredi 12 mars, le matin.', 'Nous vous livrerons dans un mois.', 'Nous vous rappellerons plus tard.'], juste: 0 },
  { id: 'fin', choix: [`Cordialement, ${prenom}, service livraison IKEA Gennevilliers`, 'Bisous', 'À plus !'], juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── les messages (Claire tutoie ; Mme Roux écrit au vous)
function heure(db, hhmm) {
  const [a, m, j] = JOUR.iso.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '06:15'), from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, CLAIRE, 'Le planning du jeudi 11 mars',
      `Bonjour ${prenom} ! Voici les dix commandes du jour : tout part par la péniche, comme d’habitude. Ouvre « Planning du jour », regarde-le, puis envoie-le-moi.\n\nClaire`,
      { db, heure: '06:15', extra: { pieces: ['poste-123', 'commandes-123', 'camions-123'] } }),
  ] }),
  declencheurs: [
    // Le 1er planning envoyé (juste ou faux, peu importe) : la Seine monte, et la grille passe à la reprise.
    { id: 'crue', quand: apresPlanning(PL), phasePlanning: 2,
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'La Seine est en crue : il faut tout replanifier',
        `${prenom}, la Seine est à ${COTE.jour} à l’échelle d’Austerlitz : la péniche ne part pas. Les dix livraisons passent en camion, et nous n’avons que trois camions.\n\n`
          + 'Reprends le planning : tiens les créneaux promis aux clients autant que possible, et reporte à demain ce qui ne peut pas tenir. Puis envoie-le-moi.\n\nClaire',
        { db, heure: '06:30', extra: { pieces: ['seine-123', 'camions-123', 'droit-123'] } })] }) },
    // Le planning repris et envoyé : il faut prévenir les clients (la fiche s'ouvre).
    { id: 'prevenir', quand: apresPlanning(PL, 2),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Les clients à prévenir',
        `Merci ${prenom}. Maintenant, il faut prévenir les clients que nous ne livrerons pas dans leur créneau. Ouvre la fiche « Prévenir les clients » : coche ceux qu’il faut appeler, et propose-leur une nouvelle date.\n\nClaire`,
        { db, heure: '08:30', extra: { ouvreFiche: FICHE_PREVENIR } })] }) },
    // La fiche envoyée : Mme Roux écrit.
    { id: 'roux', quand: apresFiche(FICHE_PREVENIR),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, CLAIRE, 'Merci', `Merci ${prenom}, c’est noté. Mme Roux vient d’écrire : réponds-lui.\n\nClaire`, { db, heure: '09:00' }),
        mail(prenom, ROUX, 'Ma livraison reportée : j’annule',
          `Bonjour,\n\nOn m’a prévenue que mon armoire ne serait pas livrée aujourd’hui mais demain. Ça ne me convient pas : j’annule ma commande, tout de suite. Que dois-je faire ?\n\nCamille Roux`,
          { db, heure: '09:20', extra: { phrases: phrasesRoux(prenom) } }),
      ] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons
export const GROUPES = { planning: 'Le planning', engagement: 'Les engagements', annulation: 'La réponse à Mme Roux' };
const POIDS_PLANNING = { poses: 3, charge: 2, creneaux: 5 };
const jalonsPlanning = etapesPlanning(PLANNING).map((e) => {
  const k = e.id.replace(/^v2-/, '');
  return Object.assign(e, { groupe: k === 'creneaux' ? GROUPES.engagement : GROUPES.planning, poids: POIDS_PLANNING[k], ecran: `planning:${PL}` });
}).filter((e) => e.id.startsWith('v2-'));
const surFiche = (id, titre, groupe, poids, juste) => ({ id, titre, groupe, poids, ecran: `fiche:${FICHE_PREVENIR}`,
  verifier(db) {
    if (!envoyee(db, FICHE_PREVENIR)) return attente;
    return juste(valeursDe(db, FICHE_PREVENIR), db) ? ok : ko;
  } });
const ligneRoux = (id) => (db) => { const r = phrasesJustes(db, PHRASES_ROUX); if (!r.envoye) return attente; return r.justes.includes(id); };
export const ETAPES = [
  ...jalonsPlanning,
  // Les clients prévenus sont, ni plus ni moins, ceux que SON planning ne tient pas (reportés ou hors créneau) ; le planning doit être complet (sans quoi tout est « non tenu »).
  surFiche('prevenir-qui', 'Les clients non tenus sont prévenus, et eux seuls', GROUPES.engagement, 3, (v, db) => {
    const p = planningEnvoye(db, 2);
    if (!p || !toutesPosees(p.place)) return false;
    const attendu = nonTenues(p.place).sort(), coches = (v.clients || []).slice().sort();
    return attendu.length > 0 && attendu.length === coches.length && attendu.every((x, i) => x === coches[i]);
  }),
  surFiche('prevenir-date', 'La nouvelle date proposée aux clients', GROUPES.engagement, 1, (v, db) => {
    const p = planningEnvoye(db, 2);
    return !!p && toutesPosees(p.place) && v.date === 'demain' && (v.clients || []).length > 0;
  }),
  { id: 'annulation', titre: 'La réponse à Mme Roux : la règle et la nouvelle date', groupe: GROUPES.annulation, poids: 2, ecran: `phrases:${PHRASES_ROUX}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ROUX); if (!r.envoye) return attente; return ['regle', 'date'].every((l) => r.justes.includes(l)) ? ok : ko; } },
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, accueil, options
export const PASTILLES = [
  { libelle: 'Le planning', fait: (db) => !!planningEnvoye(db, 1) },
  { libelle: 'La reprise', fait: (db) => !!planningEnvoye(db, 2) },
  { libelle: 'Prévenir', fait: dejaEnvoyee(FICHE_PREVENIR) },
  { libelle: 'Mme Roux', fait: (db) => phrasesJustes(db, PHRASES_ROUX).envoye },
];
export const SUITE = [
  { vue: 'planning', libelle: 'Le planning du jour', fait: (db) => !!planningEnvoye(db, 2) },
  { vue: 'fiche', libelle: 'Prévenir les clients', fait: dejaEnvoyee(FICHE_PREVENIR) },
  { vue: 'mail', mail: PHRASES_ROUX, libelle: 'La réponse à Mme Roux', fait: (db) => phrasesJustes(db, PHRASES_ROUX).envoye },
];
export const MENTION_123 = 'Réels : IKEA France et son centre de Gennevilliers, la péniche Gennevilliers → Bercy puis les utilitaires électriques (depuis décembre 2022), la règle de navigation des 4,30 m d’Austerlitz '
  + '(HAROPA), les conditions de vente d’IKEA, le Code de la consommation. Construits : la cote de ce matin (4,45 m), les dix commandes, leurs créneaux, les trois camions, Claire, Mme Roux.';
export const ACCUEIL = {
  titre: 'La Seine est en crue',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Claire', 'Menu Messagerie.'],
    ['① Le planning du jour', 'Regarde le planning : tout part par la péniche. Envoie-le à Claire. Puis la Seine monte : il faut tout replanifier sur trois camions.'],
    ['② Prévenir les clients', 'Coche les clients que tu ne livreras pas dans leur créneau, et propose-leur une nouvelle date.'],
    ['③ Mme Roux', 'Elle veut annuler : réponds-lui, une phrase par ligne.'],
    ['Bon à savoir', MENTION_123],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'La Seine est en crue',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  planning: PLANNING,
  fiches: [FICHE],
  pastilles: PASTILLES,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
