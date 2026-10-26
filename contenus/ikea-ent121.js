// ENT-12.1 — IKEA, « une commande, deux chemins » : le contenu de la séance (brief `docs/briefs/ENT-12.1-ikea-une-commande-deux-chemins.md` ; choix de Tristan du 26/10/2026).
// Première séance de l'entreprise n° 12 (2de GATL, tous les postes), DÉCOUVERTE de C1.1 (guidage). Univers : `contenus/ikea.js` ; données : `contenus/ikea-ent121-donnees.js` ;
// questions : `contenus/questions/ENT-12.1.js` ; corrigé : `contenus/corriges/ENT-12.1.js` ; activité : `activites/ikea-deux-chemins.js`.
//
// Lundi 8 mars 2027. Claire, responsable du service livraison, accueille l'élève au centre de distribution clients de Gennevilliers :
//   ① la carte de France (vue « Localiser ») : région et département du centre, notés (comme au CAP et en 11.1), la ville sans note ;
//   ② le chemin de l'armoire de Mme Benali (fiche, 7 étapes à remettre dans l'ordre ; départ mélangé par élève) ;
//   ③ le chemin de sa lampe (fiche, 6 étapes ; même principe) ;
//   ④ pourquoi deux chemins : pour chacun des trois articles, le mode de livraison (Point Relais, colis à domicile, livraison de meubles), d'après le poids et la taille.
//
// ÉCARTS AU BRIEF (dits à Tristan) : pas de bonus « article en plus » du confirmé (aucune banque d'articles construite) ; la carte se limite à la région et au département (l'Île-de-France en gros plan et
// la Seine dessinée ne sont pas dans la vue) ; les parcours sont jugés à l'ordre EXACT seulement (pas de demi-note pour une inversion).
// VÉRIFIÉ / CONSTRUIT (alerte 9) : voir `contenus/ikea-ent121-donnees.js` et `MENTION_121`. APPROCHÉ : la position du centre sur la carte (centre de la commune de Gennevilliers, relevé de mémoire).

import { FRANCE } from './france-contours.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { apresFiche, localiserFini } from '../core/declencheurs.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQUIPE_IK, LIEUX, STYLE_DOCUMENTS, htmlTarifs, pied } from './ikea.js';
import { DOC_CGV } from './ikea-ent122.js';
import { QUESTIONS } from './questions/ENT-12.1.js';
import {
  ID, VUE, ID_VOLET, FICHES, JOUR, ARMOIRE, LAMPE, ORDRE_ARMOIRE, ORDRE_LAMPE, memeOrdre, MODES, ARTICLES, CHAMP, TIRAGE, ordreDepart, fiche, dejaEnvoyee,
} from './ikea-ent121-donnees.js';

export { ID, VUE, ID_VOLET, FICHES, TIRAGE } from './ikea-ent121-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
const juge = (b) => (b ? ok : ko);

// ─────────────────────────────────────────────────────────────── ce que le moteur exige (aucun article en jeu)
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}
export const EQUIPE = { claire: { nom: EQUIPE_IK.claire.prenom, role: `${EQUIPE_IK.claire.poste} (ta responsable)`, appel: 'Claire', registre: 'tu' } };
const CLAIRE = { nom: 'Claire', mail: 'claire@cdc-gennevilliers.example' };

// ─────────────────────────────────────────────────────────────── la carte de France (vue « Localiser »)
// Position APPROCHÉE : centre de la commune de Gennevilliers (Hauts-de-Seine), relevé de mémoire. Les trois « autres » villes (même département, à plus de 8 km du point et entre elles) sont
// des centres de commune ; Paris est un repère.
export const LOCALISER = {
  id: VUE, libelle: 'Carte de France', titre: 'Où est le centre ?', contours: FRANCE,
  lieux: [
    { id: 'cdc', lettre: 'G', type: 'entrepot',
      nom: 'Centre de distribution clients IKEA de Gennevilliers', role: 'Le centre où sont préparées les commandes des clients. C’est là que tu travailles.',
      ville: LIEUX.ville, dep: '92', region: '11',
      lonlat: [2.2939, 48.9333], osm: 'commune de Gennevilliers (position approchée)',
      autres: [
        { ville: 'Rueil-Malmaison', lonlat: [2.1806, 48.8765] },
        { ville: 'Issy-les-Moulineaux', lonlat: [2.2700, 48.8240] },
        { ville: 'Antony', lonlat: [2.2986, 48.7539] },
      ],
      reperes: [{ ville: 'Paris', lonlat: [2.3522, 48.8566] }],
      indice: 'Juste au nord-ouest de Paris, en Île-de-France, au bord de la Seine.', etiq: 'd' },
  ],
  fin: { titre: 'Le centre de Gennevilliers',
    texte: 'Le centre de distribution clients d’IKEA est à Gennevilliers, dans les Hauts-de-Seine, en Île-de-France, tout près de Paris et au bord de la Seine. '
      + '(Sa place sur la carte est approchée : c’est le centre de la commune.)' },
};

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
export const DOC_CDC = { id: 'cdc-121', titre: 'Le centre de Gennevilliers en bref', court: 'Le centre en bref',
  html: `<article class="ik-doc" aria-label="Le centre de Gennevilliers en bref">
    <p class="ik-t">Le centre de Gennevilliers en bref</p>
    <p class="ik-st">Lis ces lignes avant de répondre.</p>
    <p>IKEA vend des meubles. Un client qui commande sur internet ne vient pas les chercher en magasin : on les lui livre. Les commandes partent d’un <b>centre de distribution clients</b>,
      un entrepôt qui reçoit les articles des fournisseurs, les range, puis prépare et expédie la commande de chaque client.</p>
    <p>Le centre de <b>Gennevilliers</b> (Hauts-de-Seine) est au bord de la Seine, juste à côté de Paris. Il livre Paris et l’ouest parisien. Il traite surtout des meubles lourds et volumineux.</p>
    <p>Depuis décembre 2022, une <b>péniche</b> emmène une partie des commandes de Gennevilliers jusqu’au <b>port de Bercy</b>, à Paris. Des <b>utilitaires électriques</b> les livrent ensuite aux clients.</p>
    <p>Les petits articles, eux, peuvent voyager par <b>Mondial Relay</b> : le colis est déposé dans un <b>Point Relais</b>, un commerce qui le garde cinq jours pour que le client vienne le chercher.</p>
    <p>Aujourd’hui, tu suis la commande de <b>Mme Benali</b> : une armoire, un canapé et une lampe.</p>
    ${pied('Réels : IKEA France, le centre de Gennevilliers, la péniche vers Bercy (depuis décembre 2022), Mondial Relay et les Points Relais. Construits : Mme Benali, sa commande, Claire.')}
  </article>` };
export const DOC_DROIT = { id: 'droit-121', titre: 'Le droit : acheter et se faire livrer', court: 'Le droit',
  html: `<article class="ik-doc" aria-label="Le droit : acheter et se faire livrer">
    <p class="ik-t">Le droit : acheter et se faire livrer</p>
    <p class="ik-st">Deux règles à connaître quand on achète à distance</p>
    <p><b>Changer d’avis.</b> Quand on achète à distance (sur internet, par téléphone), le client a <b>14 jours</b> pour changer d’avis et renvoyer le produit, sans avoir à dire pourquoi. C’est le
      droit de rétractation.</p>
    <p><b>Un vieux meuble.</b> Un vendeur de meubles qui livre un meuble neuf doit aussi reprendre le vieux meuble de même nature que le client veut remplacer. Les conditions de vente d’IKEA donnent
      les détails.</p>
    ${pied('Texte reformulé (aucune loi citée mot pour mot). Document pédagogique, non contractuel.')}
  </article>` };
export const DOC_TARIFS = { id: 'tarifs-121', titre: 'Les modes de livraison', court: 'Modes de livraison',
  html: `<article class="ik-doc" aria-label="Les modes de livraison d’IKEA">
    <p class="ik-t">Les modes de livraison d’IKEA</p>
    <p class="ik-st">D’après la page « Livraison » d’IKEA France, relevée le 26/10/2026 (les prix peuvent changer)</p>
    ${htmlTarifs()}
    <p class="ik-st" style="margin-top:10px">Dans cet exercice, « livraison de meubles » veut dire : « devant chez vous » ou « dans la pièce de votre choix ». C’est le mode des articles trop lourds ou trop longs
      pour un Point Relais ou un colis à domicile.</p>
    ${pied('Prix réels de la page « Livraison » d’IKEA France, relevés le 26/10/2026. Mise en page reconstituée. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
export const DOCUMENTS = [DOC_CDC, DOC_DROIT, DOC_TARIFS, DOC_CGV];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── les fiches
const etapes = (L) => (db, quoi) => ordreDepart(db, quoi).map((v) => ({ v, lib: (L.find((e) => e.v === v) || {}).lib || v }));
export const FICHE_ARMOIRE = {
  id: FICHES.armoire, libelle: 'Le chemin de l’armoire', titre: 'Le chemin de l’armoire de Mme Benali',
  sousTitre: 'Mme Benali habite à Paris (11e). Son armoire est en trois colis : elle voyage par la Seine.',
  documents: ['cdc-121'],
  bouton: 'Ouvrir la fiche « Le chemin de l’armoire »',
  blocs: (db) => [
    { type: 'ordre', id: 'armoire', titre: 'Les étapes du chemin', consigne: 'Remets les étapes dans l’ordre, de la première à la dernière.', choix: etapes(ARMOIRE)(db, 'armoire') },
  ],
  envoi: { bouton: 'Envoyer la fiche à Claire', a: 'Claire', suite: 'Claire va te répondre.' },
};
export const FICHE_LAMPE = {
  id: FICHES.lampe, libelle: 'Le chemin de la lampe', titre: 'Le chemin de la lampe de Mme Benali',
  sousTitre: 'La lampe est un petit colis : elle ne prend pas le même chemin que l’armoire.',
  documents: ['cdc-121'],
  bouton: 'Ouvrir la fiche « Le chemin de la lampe »',
  quand: (db) => dejaEnvoyee(FICHES.armoire)(db),
  blocs: (db) => [
    { type: 'ordre', id: 'lampe', titre: 'Les étapes du chemin', consigne: 'Remets les étapes dans l’ordre, de la première à la dernière.', choix: etapes(LAMPE)(db, 'lampe') },
  ],
  envoi: { bouton: 'Envoyer la fiche à Claire', a: 'Claire', suite: 'Claire va te répondre.' },
};
export const FICHE_CHEMINS = {
  id: FICHES.chemins, libelle: 'Pourquoi deux chemins ?', titre: 'Pourquoi deux chemins ?',
  sousTitre: 'Pour chaque article de Mme Benali, choisis le mode de livraison. Lis le document « Les modes de livraison ».',
  documents: ['tarifs-121', 'cgv-122'],
  bouton: 'Ouvrir la fiche « Pourquoi deux chemins ? »',
  quand: (db) => dejaEnvoyee(FICHES.lampe)(db),
  blocs: ARTICLES.map((a) => ({ type: 'liste', id: CHAMP(a.id), lib: `${a.lib} : ${a.detail}`, vide: 'Choisir…', manque: a.lib.toLowerCase(), choix: MODES })),
  envoi: { bouton: 'Envoyer la fiche à Claire', a: 'Claire', suite: 'Claire va te répondre.' },
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de questions = 20)
// Poids (brief §5, validés par Tristan le 26/10/2026) : situer le centre 4 (région 2, département 2) · le chemin de l'armoire 4 (ordre exact) · le chemin de la lampe 3 (ordre exact) ·
// le mode de chaque article 5 (lampe 1, armoire 2, canapé 2) · les questions de Claire 4 (`part`). Rien n'est vrai avant l'envoi d'une fiche ou le premier essai d'une étape de la carte : l'inaction vaut 0.
export const GROUPES = { carte: 'Situer le centre', armoire: 'Le chemin de l’armoire', lampe: 'Le chemin de la lampe', modes: 'Pourquoi deux chemins' };
export const POIDS = { carte: 2, armoire: 4, lampe: 3, modes: { lampe: 1, armoire: 2, canape: 2 } };
export const ETAPES = [
  ...etapesLocaliser(LOCALISER, ID).map((j) => (j.bonus ? j : Object.assign(j, { poids: POIDS.carte, groupe: GROUPES.carte }))),
  { id: 'armoire-ordre', titre: 'Le chemin de l’armoire : les 7 étapes dans l’ordre', groupe: GROUPES.armoire, ecran: 'fiche', poids: POIDS.armoire,
    verifier(db) { const f = fiche(db, FICHES.armoire); return !f.envoye ? attente : juge(memeOrdre(f.valeurs.armoire, ORDRE_ARMOIRE)); } },
  { id: 'lampe-ordre', titre: 'Le chemin de la lampe : les 6 étapes dans l’ordre', groupe: GROUPES.lampe, ecran: `fiche:${FICHES.lampe}`, poids: POIDS.lampe,
    verifier(db) { const f = fiche(db, FICHES.lampe); return !f.envoye ? attente : juge(memeOrdre(f.valeurs.lampe, ORDRE_LAMPE)); } },
  ...ARTICLES.map((a) => ({ id: `mode-${a.id}`, titre: `${a.lib} : le bon mode de livraison`, groupe: GROUPES.modes, ecran: `fiche:${FICHES.chemins}`, poids: POIDS.modes[a.id],
    verifier(db) { const f = fiche(db, FICHES.chemins); return !f.envoye ? attente : juge(f.valeurs[CHAMP(a.id)] === a.mode); } })),
];

// ─────────────────────────────────────────────────────────────── les messages de Claire (au tu ; lundi 8 mars 2027)
function heure(db, hhmm) {
  const [a, m, j] = JOUR.iso.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '08:00'), from: CLAIRE.nom, fromMail: CLAIRE.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const accuse = (sujet) => (prenom, n, db) => ({ mails: [mail(prenom, `RE : ${sujet}`, `Merci, j’ai ta nouvelle fiche.\n\nClaire`, { db, heure: '10:30' })] });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [mail(prenom, 'Bienvenue à Gennevilliers',
    `Bonjour ${prenom}, bienvenue au centre de distribution clients d’IKEA. Je suis Claire, responsable du service livraison.\n\n`
      + 'Aujourd’hui, tu suis la commande de Mme Benali, une cliente de Paris : une armoire, un canapé et une lampe. Lis d’abord le document « Le centre de Gennevilliers en bref ».\n\n'
      + 'Puis ouvre la carte de France (menu) et place le centre de Gennevilliers.\n\nClaire',
    { db, extra: { pieces: ['cdc-121'] } })] }),
  declencheurs: [
    { id: 'armoire', quand: localiserFini(VUE), semer: (prenom, db) => ({ mails: [mail(prenom, 'Le chemin de l’armoire',
      `Tu sais où est le centre. Voyons ce que devient l’armoire de Mme Benali, de l’arrivée chez nous jusqu’à son 4e étage sans ascenseur. Elle est en trois colis.\n\n`
        + 'Remets dans l’ordre les étapes de son chemin.\n\nClaire', { db, heure: '09:00', extra: { ouvreFiche: FICHES.armoire } })] }) },
    { id: 'lampe', quand: apresFiche(FICHES.armoire), semer: (prenom, db) => ({ mails: [mail(prenom, 'Le chemin de la lampe',
      'Merci. La lampe de Mme Benali, elle, ne voyage pas du tout comme l’armoire. Tu as peut-être déjà vu ce chemin ailleurs.\n\nRemets dans l’ordre les étapes de son chemin.\n\nClaire',
      { db, heure: '09:45', extra: { ouvreFiche: FICHES.lampe } })] }) },
    { id: 'chemins', quand: apresFiche(FICHES.lampe), semer: (prenom, db) => ({ mails: [mail(prenom, 'Pourquoi deux chemins ?',
      'Une seule commande, deux chemins. Pourquoi ? C’est une question de poids et de taille. Lis le document « Les modes de livraison », puis choisis le mode de chacun des trois articles.\n\nClaire',
      { db, heure: '10:15', extra: { pieces: ['tarifs-121'], ouvreFiche: FICHES.chemins } })] }) },
    { id: 'fin', quand: apresFiche(FICHES.chemins), semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci pour cette matinée',
      'Merci ! Tu sais où est le centre, quel chemin suivent l’armoire et la lampe, et pourquoi elles ne voyagent pas ensemble. La prochaine fois, tu travailleras à ton poste.\n\nClaire',
      { db, heure: '11:00' })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: { [FICHES.armoire]: accuse('Le chemin de l’armoire'), [FICHES.lampe]: accuse('Le chemin de la lampe'), [FICHES.chemins]: accuse('Pourquoi deux chemins ?') },
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
export const LEXIQUE_121 = {
  'région': 'Une grande zone de la France. La France métropolitaine en compte 13. Chaque région est découpée en départements.',
  'département': 'Une zone plus petite qu’une région. Chaque département a un numéro : les Hauts-de-Seine, c’est le 92.',
  'centre de distribution': 'Un entrepôt qui reçoit les articles des fournisseurs, les range, puis prépare et expédie les commandes des clients.',
  'Point Relais': 'Un commerce (boutique, quincaillerie…) qui garde les colis pour les clients.',
};
export const MENTION_121 = 'Réels : IKEA France et son centre de distribution clients de Gennevilliers (Hauts-de-Seine), la livraison par la Seine (péniche jusqu’à Bercy depuis décembre 2022, puis utilitaires électriques), '
  + 'Mondial Relay et les Points Relais (cinq jours de garde), les modes de livraison et leurs règles (page « Livraison » d’IKEA, relevée le 26/10/2026). '
  + 'Construits : Mme Benali et sa commande, Claire, les étapes détaillées de chaque chemin.';
export const ACCUEIL = {
  titre: 'Une commande, deux chemins',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Claire', 'Menu Messagerie : le document « Le centre de Gennevilliers en bref » est joint.'],
    ['① La carte de France', 'Place le centre de Gennevilliers : sa région, son département, sa ville.'],
    ['② Le chemin de l’armoire', 'Remets dans l’ordre les étapes du chemin de l’armoire de Mme Benali.'],
    ['③ Le chemin de la lampe', 'Remets dans l’ordre les étapes du chemin de sa lampe.'],
    ['④ Pourquoi deux chemins ?', 'Pour chaque article, choisis le mode de livraison.'],
    ['Bon à savoir', MENTION_121],
  ],
};
export const FIN_FIGE = 'La carte et les questions de Claire se jouent au premier essai : elles ne se rejouent pas.';
export const SUITE = [
  { vue: 'localiser', libelle: 'Carte de France', fait: localiserFini(VUE) },
  { vue: 'fiche', libelle: 'Le chemin de l’armoire', fait: dejaEnvoyee(FICHES.armoire) },
  { vue: `fiche:${FICHES.lampe}`, libelle: 'Le chemin de la lampe', fait: dejaEnvoyee(FICHES.lampe) },
  { vue: `fiche:${FICHES.chemins}`, libelle: 'Pourquoi deux chemins ?', fait: dejaEnvoyee(FICHES.chemins) },
];
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Une commande, deux chemins',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_121,
  equipe: EQUIPE,
  questions: QUESTIONS,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_ARMOIRE, FICHE_LAMPE, FICHE_CHEMINS],
  localiser: LOCALISER,
  // La carte est le premier travail ; l'armoire s'ouvre après la carte, la lampe après l'armoire, les modes après la lampe.
  fermetures: {
    fiche: { ouvertSi: (db) => localiserFini(VUE)(db, ID), message: 'Après la carte de France' },
    [`fiche:${FICHES.lampe}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.armoire)(db), message: 'Après « Le chemin de l’armoire »' },
    [`fiche:${FICHES.chemins}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.lampe)(db), message: 'Après « Le chemin de la lampe »' },
  },
  finFige: FIN_FIGE,
};
