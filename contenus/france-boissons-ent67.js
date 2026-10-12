// ENT-6.7 — France Boissons, « la commande de Malo à la voix » : la séance (brief `docs/briefs/ENT-6.7-france-boissons-preparation.md`,
// poids, questions au fil et banque d'ouverture validés par Tristan le 12/10/2026 ; moteur : chantier D-7, lots 1 à 5).
// Univers commun : `contenus/france-boissons.js`. Données pures (allée, terminal, palettes, poids) : `contenus/france-boissons-ent67-donnees.js`.
// Activité : `activites/france-boissons-preparation.js`. Questions : `contenus/questions/ENT-6.7.js`. Corrigé : `contenus/corriges/ENT-6.7.js`.
//
// L'élève, en renfort au quai (jeudi 17 juin 2027, 14 h), préparateur, deuxième temps (entraînement) de C2.1 (guidage : ENT-5.6 Smoby) :
//   0. « Le matériel » : tiroirs coulissants, portique à fûts, palette client sur transpalette à ciseaux ; un écran, non noté ;
//   1. « Allée de picking » : le terminal donne les lignes une par une (code lu de près, quantité, « Abîmé » pour le fût cabossé),
//      chaque ligne posée sur la palette 1, la palette 2 ou « à côté » ;
//   2. dans la même vue : poser ce qui est à côté, filmer, étiqueter, « Vérifier ma préparation » ; « Ce que le terminal sait de toi ».
// Entraînement : aucun bon de préparation affiché, aucune aide, le bilan nomme seulement le critère. Pas de « Corriger » au bandeau :
// le montage se reprend dans la vue (« Reposer le dernier », revérifier), les lignes du terminal ne se refont pas.

import { etapesEntrepot, jalonsEntrepot } from '../core/types/entrepot.js';
import { QUESTIONS } from './questions/ENT-6.7.js';
import { EQUIPE, LEXIQUE as LEXIQUE_FB, mailDe, heureScenario, DOC_ANNUAIRE, STYLE_DOCUMENTS as STYLE_FB } from './france-boissons.js';
import { ID, ENTREPOT_ID, ID_VOLET, SCENARIO, MATERIEL, REFERENCES, EMPLACEMENTS, COMMANDE, LIGNES, ETIQUETTE, REGLES, ENTREPOT,
  GROUPES, POIDS, GROUPE_DE, ORDRE_JALONS } from './france-boissons-ent67-donnees.js';
export { ID, ENTREPOT_ID, ID_VOLET, SCENARIO, MATERIEL, REFERENCES, EMPLACEMENTS, COMMANDE, LIGNES, ETIQUETTE, REGLES, ENTREPOT, GROUPES, POIDS };

const NADIA = { nom: EQUIPE.nadia.nom, mail: mailDe('nadia') };

// La préparation est juste quand les 10 jalons de la vue le sont (lignes du terminal, puis critères jugés à « Vérifier »).
export const preparationJuste = (db) => { const J = jalonsEntrepot(db || {}, ENTREPOT); return J.total > 0 && J.ok === J.total; };

// ─────────────────────────────────────────────────────────────── les messages
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

// Textes de Nadia proposés par le brief (§4, à relire à l'écran par Tristan).
export const SUJET_ARRIVEE = 'La commande de Malo';
export const TEXTE_ARRIVEE = (prenom) => `Re-bonjour ${prenom} !\n\n`
  + 'Cet après-midi, la commande de Malo pour la tournée de la côte, demain 6 h.\n\n'
  + 'Le [[terminal vocal]] te donne les lignes une par une, dans l’ordre du parcours. Tu montes deux [[palette client|palettes client]] '
  + 'dans la zone de préparation, devant le quai 14.\n\nNadia';
export const TEXTE_FIN = (prenom) => `Parfait, ${prenom}. Les deux palettes partent demain 6 h avec Lucas.\n\n`
  + 'Le fût cabossé, je le passe en casse : sinon, demain, le stock mentirait.\n\nNadia';

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, NADIA, SUJET_ARRIVEE, TEXTE_ARRIVEE(prenom), { heure: '13:55' })] }),
  declencheurs: [
    // Les 10 jalons justes (après « Vérifier ») : Nadia confirme le départ ; lien avec ENT-6.6 (une casse non déclarée est un écart).
    { id: 'fin', quand: preparationJuste,
      semer: (prenom, db) => ({ mails: [mail(prenom, NADIA, 'RE : la commande de Malo', TEXTE_FIN(prenom), { db, decalage: 2 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les documents
const PIED = (quoi) => `<p class="fb-pied">${quoi} — Document pédagogique — reconstitution, non contractuel</p>`;

// Les mots de la préparation (aucun chiffre de la commande : on ne connaît que la ligne en cours).
const docMots = () => `<article class="fb7-doc" aria-label="Mots de la préparation">
    <p class="fb-t">Mots de la préparation</p>
    <table class="fb7-table"><tbody>
      <tr><th scope="row">Préparation vocale</th><td>Le terminal annonce l’emplacement, tu donnes son code, il annonce la quantité, tu confirmes.</td></tr>
      <tr><th scope="row">Picking</th><td>L’emplacement où l’on prélève les articles pour les commandes, à hauteur d’homme.</td></tr>
      <tr><th scope="row">Réserve</th><td>Le stock rangé ailleurs (ici, au sol, dans la zone de masse) qui sert à remplir le picking.</td></tr>
      <tr><th scope="row">Code détrompeur</th><td>Le code écrit sur l’étiquette de la lisse : tu le dis au terminal pour prouver que tu es au bon endroit.</td></tr>
      <tr><th scope="row">FIFO</th><td>Premier entré, premier sorti : le lot le plus ancien part d’abord.</td></tr>
      <tr><th scope="row">Les mots du terminal</th><td>Répète · Manquant · Abîmé · Emplacement vide.</td></tr>
    </tbody></table>
    ${PIED('Aide-mémoire')}
  </article>`;

// Les textes de loi des questions (brief §4 bis et §4 ter, choix de Tristan du 12/10/2026). Relus mot pour mot le 12/10/2026 sur
// code.travail.gouv.fr : L4121-1, R4541-3, L3121-16, L1222-4 ; règlement (UE) 1169/2011, art. 2 §2 r) et annexe X, sur sa version
// consolidée (EUR-Lex bloqué : à recouper). Code civil 1603 : mêmes mots dans toutes les sources, Légifrance non lu (bloqué) ; il
// n'existe pas d'article qui écrive « conforme » : la délivrance conforme est de jurisprudence (d'où la phrase d'explication sous
// l'article). Arrêté du 6 février 2026 : montant de la consigne, repris d'ENT-6.6, texte non relu.
const art = (code, num, texte) => `<p class="fb-st" style="margin-top:14px">${code}, ${num}</p>${texte}`;
export const TEXTES_DROIT = [
  ['Code du travail', 'article L4121-1 (extrait)', '<p>« L’employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé '
    + 'physique et mentale des travailleurs. »</p>'],
  ['Code du travail', 'article R4541-3', '<p>« L’employeur prend les mesures d’organisation appropriées ou utilise les moyens appropriés, et '
    + 'notamment les équipements mécaniques, afin d’éviter le recours à la manutention manuelle de charges par les travailleurs. »</p>'],
  ['Code du travail', 'article L3121-16', '<p>« Dès que le temps de travail quotidien atteint six heures, le salarié bénéficie d’un temps de '
    + 'pause d’une durée minimale de vingt minutes consécutives. »</p>'],
  ['Code du travail', 'article L1222-4', '<p>« Aucune information concernant personnellement un salarié ne peut être collectée par un '
    + 'dispositif qui n’a pas été porté préalablement à sa connaissance. »</p>'],
  ['Code civil', 'article 1603', '<p>« Il [le vendeur] a deux obligations principales, celle de délivrer et celle de garantir la chose qu’il vend. »</p>'
    + '<p>Délivrer, c’est remettre au client <b>ce qui a été commandé</b>, en bon état.</p>'],
  ['Règlement (UE) n° 1169/2011', 'article 2 et annexe X (extraits)', '<p>« Date de durabilité minimale d’une denrée alimentaire : la date '
    + 'jusqu’à laquelle cette denrée alimentaire conserve ses propriétés spécifiques dans des conditions de conservation appropriées. »</p>'
    + '<p>Elle est précédée des termes « à consommer de préférence avant… ». La bière la porte (sauf à 10 % d’alcool ou plus).</p>'],
  ['Arrêté du 6 février 2026', 'consignation des emballages (en vigueur le 1er janvier 2027)', '<p>Montant de la consigne : <b>40 €</b> par fût '
    + 'de 20 à 50 litres, <b>4 €</b> par casier.</p>'],
];
const docDroit = () => `<article class="fb7-doc" aria-label="Le droit">
    <p class="fb-t">Le droit : santé au travail, pause, information du salarié, vente, consigne</p>
    ${TEXTES_DROIT.map(([c, n, t]) => art(c, n, t)).join('')}
    <p class="fb-pied">Textes réels — sources : Code du travail, Code civil, règlement (UE) n° 1169/2011 ; montants de l’arrêté d’après la FNB</p>
  </article>`;

export const DOCUMENTS = [
  { id: 'mots', titre: 'Mots de la préparation', court: 'Mots de la préparation', html: docMots() },
  { id: 'droit', titre: 'Le droit : santé au travail, pause, information du salarié, vente, consigne', court: 'Le droit', html: docDroit() },
  DOC_ANNUAIRE,
];

export const STYLE_DOCUMENTS = `${STYLE_FB}
.fb7-doc{padding:14px 18px 0}
.fb7-doc p{margin:0 0 8px}
.fb7-table{border-collapse:collapse; width:100%; font-size:.9rem; margin-top:4px}
.fb7-table th, .fb7-table td{border-bottom:1px solid var(--filet); padding:5px 6px; text-align:left}
.fb7-table th{color:var(--douce); font-weight:600}
`;

// ─────────────────────────────────────────────────────────────── les jalons
// Les 10 jalons de la vue (5 lignes du terminal, 5 critères du montage), avec leurs poids et leur bloc, rangés bloc par bloc.
const DE_LA_VUE = Object.fromEntries(etapesEntrepot(ENTREPOT).map((e) => [e.id, e]));
const manquants = ORDRE_JALONS.filter((id) => !DE_LA_VUE[id]).concat(Object.keys(DE_LA_VUE).filter((id) => !POIDS[id]));
if (manquants.length) throw new Error(`ENT-6.7 : jalons de la vue et poids ne correspondent pas (${manquants.join(', ')})`);
export const ETAPES = ORDRE_JALONS.map((id) => ({ ...DE_LA_VUE[id], groupe: GROUPE_DE[id], poids: POIDS[id] }));

// ─────────────────────────────────────────────────────────────── le lexique et l'accueil
export const MENTION = 'Réels : France Boissons (filiale de Heineken), sa plateforme de Buchelay (Yvelines), sa préparation de commandes à la voix '
  + '(depuis 2014), les tiroirs coulissants sous les racks, le portique à fûts, le transpalette à ciseaux, 6 fûts au plus sur une palette client '
  + '1,20 × 0,80 (INRS, 2022) et les textes de loi. Construit : Nadia, le plan de l’allée, les emplacements, leurs codes et leurs quantités, le fût '
  + 'cabossé, la règle de pose, la palette client en bois, la zone de préparation devant le quai 14 et les messages. 8 fûts sur une palette de '
  + 'rétention en réserve : règle de l’exercice. Dessins — scène construite, ce n’est pas la plateforme de Buchelay.';
export const LEXIQUE = Object.assign({}, LEXIQUE_FB, {
  'préparation vocale': 'Préparer une commande guidé par un terminal qui parle : il annonce l’emplacement et la quantité, le préparateur répond à voix haute.',
  'terminal vocal': 'Petit appareil porté à la ceinture, avec un casque et un micro : il dit où aller et quoi faire ; on lui répond à voix haute.',
  'code détrompeur': 'Code écrit sur l’étiquette d’un emplacement (souvent deux chiffres) : on le dit au terminal pour prouver qu’on est au bon endroit.',
  'code de contrôle': 'Autre nom du code détrompeur : le code écrit sur l’étiquette de l’emplacement, à dire au terminal.',
  emplacement: 'Place précise où un article est rangé, repérée par une adresse (côté, travée, niveau : A-T03-N1).',
  picking: 'Emplacements où l’on prélève les articles pour préparer les commandes, à hauteur d’homme.',
  réserve: 'Stock rangé à part (en hauteur ou au sol) qui sert à remplir le picking quand il se vide.',
  'tiroir coulissant': 'Plateau qui glisse sous le rack : on le tire vers soi pour prendre le fût sans se pencher.',
  'portique à fûts': 'Structure fixe au-dessus de la zone de préparation, avec des rails : un manipulateur y glisse pour lever les fûts.',
  'manipulateur à air': 'Bras à air comprimé qui saisit un fût et le soulève ; le préparateur le guide avec une poignée, sans le porter.',
  'palette client': 'Palette de 1,20 × 0,80 m préparée pour un client : elle passe dans les couloirs et les monte-charges des bars.',
  'transpalette à ciseaux': 'Transpalette qui monte la palette à hauteur de travail : on pose les fûts sans se pencher.',
  FIFO: '« First in, first out » : premier entré, premier sorti. Le lot le plus ancien part le premier.',
  lot: 'Ensemble d’articles fabriqués en même temps, repéré par un numéro (ici, la semaine : S18, S24).',
  'film étirable': 'Film plastique qu’on enroule autour de la palette pour que la charge ne bouge pas pendant le transport.',
  'étiquette d’expédition': 'Étiquette collée sur la palette : le client, l’adresse, la tournée, le jour. On la lit de tous les côtés.',
  'date de durabilité minimale': 'Date « à consommer de préférence avant » : jusqu’à elle, le produit garde ses qualités s’il est bien conservé.',
});
export const ACCUEIL = {
  titre: 'La commande de Malo à la voix',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Nadia', 'Menu Messagerie : la commande de Malo pour la tournée de demain.'],
    ['Le matériel', 'Menu Le matériel : les tiroirs, le [[portique à fûts]], la [[palette client]].'],
    ['Préparer à la voix', 'Menu Allée de picking : le terminal te dit où aller ; lis le code de près, prends, puis pose sur une palette.'],
    ['Finir les palettes', 'Même écran : pose ce qui est à côté, filme, étiquette, puis « Vérifier ma préparation ».'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance
export const OPTIONS = {
  menu: [],
  exercice: 'Séance 7 : la commande de Malo à la voix',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  animations: [MATERIEL],
  entrepot: ENTREPOT,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
