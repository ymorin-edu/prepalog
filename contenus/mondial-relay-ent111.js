// ENT-11.1 — Mondial Relay, « le voyage d’un colis » : le contenu de la séance (brief `docs/briefs/ENT-11.1-mondial-relay-voyage-colis.md`,
// choix de Tristan du 26/10/2026). Univers commun : `contenus/mondial-relay.js` (À LIRE). Activité : `activites/mondial-relay-voyage-colis.js`.
// Questions : `contenus/questions/ENT-11.1.js`.
//
// 2de, DÉCOUVERTE de C1.1 (guidage), première séance du scénario S3 « Le pic de fin d’année » (le scénario d’évaluation de la 2de).
// Décembre, au hub de Buchères. Romain, chef d’équipe du tri, accueille l’élève en renfort pour le pic :
//   ① la carte de France (vue « Localiser ») : le hub de Buchères, région et département notés (comme au CAP), la ville sans note ;
//   ② « Le voyage d’un colis » : remettre dans l’ordre les 7 étapes du colis d’Inès (fiche `voyage`, départ mélangé par élève) ;
//   ③ « Peut-il voyager ? » : classer des colis (Point Relais / locker / refusé) d’après les règles de Mondial Relay (fiche `colis`,
//      pièce fixe = le colis d’Inès, 6 colis tirés par élève dans une banque de 12 : 2 faciles, 3 moyens, 1 difficile ; le confirmé en reçoit 2 de plus).
// Les valeurs attendues du classement sont CALCULÉES à partir de `REGLES_COLIS` (jamais recopiées) : `classer(colis)`.
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) — voir l’en-tête de `contenus/mondial-relay.js` et `MENTION` :
//   Vérifié : Mondial Relay (groupe InPost), le hub de Buchères (Aube), le pic de fin d’année, les règles du colis (30 kg, 120 cm, 150 cm ;
//   locker 25 kg, 64 cm, 142 cm), les cinq jours au Point Relais, les marchandises interdites (dangereuses, animaux, produits sous température dirigée).
//   Construit : Romain et ses messages, Inès et son colis, le trajet exact du colis (les étapes sont celles d’un réseau de messagerie ; leur détail
//   est imaginé pour l’exercice), les 12 colis de la banque (objets, poids et dimensions inventés), le Point Relais de Bar-sur-Seine.
//   APPROCHÉ : la position du hub sur la carte est le CENTRE de la commune de Buchères (relevée de mémoire, à confirmer dans OpenStreetMap),
//   pas l’adresse du Parc logistique de l’Aube.

import { FRANCE } from './france-contours.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { apresFiche, localiserFini } from '../core/declencheurs.js';
import { catalogueSimple } from './entreprise-commun.js';
import { QUESTIONS } from './questions/ENT-11.1.js';
import { EQUIPE, FIL_ROUGE, LIEUX, MENTION } from './mondial-relay.js';

import {
  ID, VUE, ID_VOLET, FICHES, VOYAGE, ORDRE_JUSTE, libVoyage, memeOrdre, inversions, classer, CLASSES, TIRAGE, colisSocle, colisDe, ordreDepart,
  champColis, fiche, dejaEnvoyee, texteRegles, decrireColis,
} from './mondial-relay-ent111-donnees.js';

export { ID, VUE, ID_VOLET, FICHES, VOYAGE, ORDRE_JUSTE, TIRAGE, classer, CLASSES, COLIS } from './mondial-relay-ent111-donnees.js';


// ─────────────────────────────────────────────────────────────── ce que le moteur exige (aucun article en jeu)
// L’univers `contenus/mondial-relay.js` ne les porte pas encore : la séance les fournit (le contenu l’emporte sur l’univers).
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

// L’équipe telle que la lisent les questions et les messages (l’univers donne { prenom, poste }).
export const EQUIPE_111 = {
  romain: { nom: EQUIPE.romain.prenom, role: EQUIPE.romain.poste, appel: EQUIPE.romain.prenom, registre: 'tu' },
};
const mailDe = (id) => `${id}@mr-bucheres.example`;

// ─────────────────────────────────────────────────────────────── la carte de France (vue « Localiser »)
// Position APPROCHÉE : centre de la commune de Buchères (Aube), relevée de mémoire — à confirmer dans OpenStreetMap. Les trois « autres »
// villes (même département, plus de 8 km du point et entre elles) sont des centres de commune ; Troyes est un repère.
export const LOCALISER = {
  id: VUE, libelle: 'Carte de France', titre: 'Où est le hub ?', contours: FRANCE,
  lieux: [
    { id: 'hub', lettre: 'H', type: 'entrepot',
      nom: 'Hub et agence Mondial Relay de Buchères', role: 'Le hub où passent les colis. C’est là que tu travailles cette nuit.',
      ville: LIEUX.ville, dep: '10', region: '44',
      lonlat: [4.118, 48.271], osm: 'commune de Buchères (position approchée)',
      autres: [
        { ville: 'Bar-sur-Seine', lonlat: [4.3772, 48.1131] },
        { ville: 'Bar-sur-Aube', lonlat: [4.7109, 48.2338] },
        { ville: 'Romilly-sur-Seine', lonlat: [3.7236, 48.5166] },
      ],
      reperes: [{ ville: 'Troyes', lonlat: [4.0744, 48.2973] }],
      indice: 'Juste au sud-est de Troyes, dans l’est de la France.', etiq: 'd' },
  ],
  fin: { titre: 'Le hub de Buchères',
    texte: 'Le hub de Buchères est dans l’Aube, en Grand Est, près de Troyes. Il fait partie des gros centres de tri de Mondial Relay. '
      + '(Sa place sur la carte est approchée : c’est le centre de la commune.)' },
};

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
export const DOC_MR = { id: 'mr', titre: 'Mondial Relay en bref', court: 'Mondial Relay en bref',
  html: `<article class="mr-doc" aria-label="Mondial Relay en bref">
    <p class="mr-t">Mondial Relay en bref</p>
    <p class="mr-st">Lis ces lignes avant de répondre.</p>
    <div class="mr-l"><span class="mr-n">1</span><p>Mondial Relay transporte des colis. On peut en déposer ou en retirer dans un [[Point Relais]] : un commerce (une boutique, une quincaillerie…) qui garde les colis.</p></div>
    <div class="mr-l"><span class="mr-n">2</span><p>Il existe aussi des [[locker|lockers]] : des casiers automatiques.</p></div>
    <div class="mr-l"><span class="mr-n">3</span><p>Entre le dépôt et le retrait, les colis passent par un [[hub]] : un gros centre de tri. Le hub de Buchères est près de Troyes (Aube). Un hub ne stocke pas : les colis arrivent de partout, sont triés, puis repartent.</p></div>
    <div class="mr-l"><span class="mr-n">4</span><p>De la fin octobre à la mi-janvier, il y a beaucoup plus de colis (Black Friday, Noël, soldes). C’est le pic de fin d’année : Mondial Relay prend des renforts.</p></div>
    <div class="mr-l"><span class="mr-n">5</span><p>Quand Inès envoie un colis, elle choisit le transporteur et paie l’envoi. Elle est la cliente de Mondial Relay. L’acheteur, lui, vient retirer le colis.</p></div>
    <div class="mr-l"><span class="mr-n">6</span><p>Payer pour faire transporter un colis, c’est un contrat de transport.</p></div>
    <p class="mr-pied">Document pédagogique — reconstitution d’après des informations publiques, non contractuel. Inès et les noms des salariés sont inventés.</p>
  </article>` };
export const STYLE_DOCUMENTS = `
--douce:#555047;
.mr-doc{padding:14px 18px 0}
.mr-doc p{margin:0 0 8px}
.mr-t{margin:0; font-size:1.1rem; font-weight:800}
.mr-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.mr-l{display:flex; gap:10px; align-items:baseline; margin:0 0 8px; font-size:1rem; line-height:1.4}
.mr-n{flex:0 0 1.6em; font-weight:800; color:var(--ardoise)}
.mr-l p{margin:0}
.mr-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────────────────────────── les fiches
export const FICHE_VOYAGE = {
  id: FICHES.voyage, libelle: 'Le voyage du colis', titre: 'Le voyage du colis d’Inès',
  sousTitre: `${FIL_ROUGE.expeditrice.prenom} dépose son colis à ${FIL_ROUGE.expeditrice.ville}. L’acheteur est à ${FIL_ROUGE.destination.commune}.`,
  documents: ['mr'],
  bouton: 'Ouvrir la fiche « Le voyage du colis »',
  blocs: (db) => [
    { type: 'ordre', id: 'voyage', titre: 'Les étapes du voyage', consigne: 'Remets les étapes dans l’ordre, de la première à la dernière.',
      choix: ordreDepart(db).map((v) => ({ v, lib: libVoyage(v) })) },
  ],
  envoi: { bouton: 'Envoyer la fiche à Romain', a: 'Romain', suite: 'Romain va te répondre.' },
};
// Les lignes de la fiche des colis. Sur une base VIDE (contrôle au chargement, rien de tiré), une ligne de repère : le geste
// `fiche:colis:colis-1` doit exister pour que la question « locker-27-kg » se branche. Un élève a toujours au moins 7 colis.
const lignesColis = (db) => {
  const L = colisDe(db);
  if (!L.length) return [{ type: 'liste', id: champColis(0), lib: 'Un colis', vide: 'Choisir…', manque: 'le colis 1', choix: CLASSES }];
  return L.map((c, i) => ({ type: 'liste', id: champColis(i), lib: decrireColis(c), vide: 'Choisir…', manque: `le colis ${i + 1}`, choix: CLASSES }));
};
export const FICHE_COLIS = {
  id: FICHES.colis, libelle: 'Peut-il voyager ?', titre: 'Peut-il voyager ?',
  sousTitre: 'Pour chaque colis, choisis où il va. Les règles sont en haut.',
  bouton: 'Ouvrir la fiche « Peut-il voyager ? »',
  quand: (db) => dejaEnvoyee(FICHES.voyage)(db),
  blocs: (db) => [
    { type: 'encadre', titre: 'Les règles de Mondial Relay', texte: texteRegles() },
    ...lignesColis(db),
  ],
  envoi: { bouton: 'Envoyer la fiche à Romain', a: 'Romain', suite: 'Romain va te répondre.' },
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de questions = 20)
// Poids validés par Tristan le 26/10/2026 (brief §5) : situer le hub 4 (région 2, département 2) · le voyage 6 (l’ordre exact 3 + l’ordre à
// une inversion près 3 : une inversion = moitié, deux jalons binaires qui reproduisent la demi-note) · les règles du colis 6 (la pièce fixe
// 0,75 + six colis tirés 0,875 chacun) · les questions de Romain 4 (`part`). Rien n’est vrai avant l’envoi d’une fiche ou le premier essai d’une
// étape de la carte : l’inaction vaut 0. Le colis bonus du confirmé n’a ni poids ni groupe (caché à l’élève).
export const GROUPES = { carte: 'Situer le hub', voyage: 'Le voyage du colis', colis: 'Les règles du colis' };
export const POIDS = { carte: 2, voyageExact: 3, voyagePresque: 3, fixe: 0.75, tire: 0.875 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = { status: 'ko' };
const juge = (b) => (b ? ok : ko);

const ECRAN = { voyage: 'fiche', colis: `fiche:${FICHES.colis}` };
// Le colis d’un jalon : la pièce fixe, ou le k-ième colis (dans l’ordre de l’élève) de cette difficulté.
function jugerColis(db, quoi, k) {
  const f = fiche(db, FICHES.colis);
  if (!f.envoye) return attente;
  const L = colisDe(db);
  let i = -1;
  if (quoi === 'fixe') i = L.findIndex((p) => p.id === 'c-ines');
  else if (quoi === 'bonus') { const b = TIRAGE.piecesBonus(db, 'colis'); const p = b[k]; i = p ? L.indexOf(p) : -1; }
  else { const m = colisSocle(db).filter((p) => p.difficulte === quoi); const p = m[k]; i = p ? L.indexOf(p) : -1; }
  if (i < 0) throw new Error(`colis « ${quoi} ${k} » absent du tirage de l’élève`);
  return juge(f.valeurs[champColis(i)] === classer(L[i]));
}
const colisJalon = (id, quoi, k, poids) => ({ id, titre: 'Les règles du colis : où va un colis', groupe: GROUPES.colis, ecran: ECRAN.colis, poids,
  verifier: (db) => jugerColis(db, quoi, k) });

export const ETAPES = [
  ...etapesLocaliser(LOCALISER, ID).map((j) => (j.bonus ? j : Object.assign(j, { poids: POIDS.carte, groupe: GROUPES.carte }))),
  { id: 'voyage-ordre', titre: 'Le voyage : les 7 étapes dans l’ordre', groupe: GROUPES.voyage, ecran: ECRAN.voyage, poids: POIDS.voyageExact,
    verifier(db) { const f = fiche(db, FICHES.voyage); return !f.envoye ? attente : juge(memeOrdre(f.valeurs.voyage, ORDRE_JUSTE)); } },
  { id: 'voyage-presque', titre: 'Le voyage : l’ordre, à une inversion près', groupe: GROUPES.voyage, ecran: ECRAN.voyage, poids: POIDS.voyagePresque,
    verifier(db) { const f = fiche(db, FICHES.voyage); return !f.envoye ? attente : juge(inversions(f.valeurs.voyage) <= 1); } },
  colisJalon('colis-fixe', 'fixe', 0, POIDS.fixe),
  colisJalon('colis-facile-1', 'facile', 0, POIDS.tire), colisJalon('colis-facile-2', 'facile', 1, POIDS.tire),
  colisJalon('colis-moyen-1', 'moyen', 0, POIDS.tire), colisJalon('colis-moyen-2', 'moyen', 1, POIDS.tire), colisJalon('colis-moyen-3', 'moyen', 2, POIDS.tire),
  colisJalon('colis-difficile-1', 'difficile', 0, POIDS.tire),
  // Les colis bonus du confirmé : sans poids ni groupe, `null` quand l’élève ne les a pas reçus (cachés à l’élève).
  ...[0, 1].map((k) => ({ id: `colis-bonus-${k + 1}`, bonus: true, ecran: ECRAN.colis, titre: 'Les règles du colis : un colis en plus',
    verifier: (db) => (TIRAGE.piecesBonus(db, 'colis')[k] ? jugerColis(db, 'bonus', k) : null) })),
];

// ─────────────────────────────────────────────────────────────── les messages de Romain (au tu ; décembre, une soirée)
// Le 2 décembre de l’année scolaire en cours (de septembre à décembre : cette année ; de janvier à août : l’année d’avant). Aucun jour de la semaine.
const anScolaire = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anScolaire(), 11, 2, h, mn).getTime() + ecoule + decalage * 60000;
}
const ROMAIN = { nom: EQUIPE_111.romain.nom, mail: mailDe('romain') };
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '19:30', { db: o.db, decalage: o.decalage || 0 }),
  from: ROMAIN.nom, fromMail: ROMAIN.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const accuse = (sujet) => (prenom, n, db) => ({ mails: [mail(prenom, `RE : ${sujet}`, `Merci, j’ai ta nouvelle fiche.\n\nRomain`, { db, decalage: 1 })] });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, 'Bienvenue au hub',
    `Bonjour ${prenom}, bienvenue en renfort pour le pic de fin d’année. Je suis Romain, chef d’équipe du tri.\n\n`
      + 'Avant ta première nuit au tri, je te montre où tu es et ce que devient un colis. Lis le document « Mondial Relay en bref ».\n\n'
      + 'Puis ouvre la carte de France (menu) et place le [[hub]] de Buchères.\n\nRomain',
    { extra: { pieces: ['mr'] } })] }),
  declencheurs: [
    { id: 'voyage', quand: localiserFini(VUE), semer: (prenom, db) => ({ mails: [mail(prenom, 'Le voyage d’un colis',
      `Tu sais où est le hub. Prenons un vrai colis : celui d’${FIL_ROUGE.expeditrice.prenom}, à ${FIL_ROUGE.expeditrice.ville}. Elle vend ${FIL_ROUGE.objet}, `
        + `et l’acheteur est à ${FIL_ROUGE.destination.commune}. Elle l’a déposé dans un [[Point Relais]] de ${FIL_ROUGE.expeditrice.ville}.\n\n`
        + 'Remets dans l’ordre les étapes de son voyage.\n\nRomain', { db, decalage: 1, extra: { ouvreFiche: FICHES.voyage } })] }) },
    { id: 'colis', quand: apresFiche(FICHES.voyage), semer: (prenom, db) => ({ mails: [mail(prenom, 'Peut-il voyager ?',
      'Au tri, certains colis ne peuvent pas voyager. Il y a des règles : le poids, la taille, ce qu’il y a dedans.\n\n'
        + 'Pour chaque colis de la fiche, choisis où il va.\n\nRomain', { db, decalage: 1, extra: { ouvreFiche: FICHES.colis } })] }) },
    { id: 'fin', quand: apresFiche(FICHES.colis), semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci pour cette soirée',
      'Merci ! Tu sais où est le hub, quel chemin suit un colis et quelles règles décident s’il peut voyager. '
        + 'Ta première nuit au tri, c’est bientôt : je t’y accueille.\n\nRomain', { db, decalage: 2 })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: { [FICHES.voyage]: accuse('Le voyage d’un colis'), [FICHES.colis]: accuse('Peut-il voyager ?') },
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
export const LEXIQUE_111 = {
  'hub': 'Un gros centre de tri. Les colis y arrivent de partout, sont triés, puis repartent vers leur destination. Un hub ne stocke pas.',
  'Point Relais': 'Un commerce (boutique, quincaillerie…) qui garde les colis pour les clients.',
  'locker': 'Un casier automatique où l’on dépose ou retire un colis.',
  'agence': 'Un site de Mondial Relay qui ramasse les colis et prépare les tournées de livraison dans sa région.',
  'région': 'Une grande zone de la France. La France métropolitaine en compte 13. Chaque région est découpée en départements.',
  'département': 'Une zone plus petite qu’une région. Chaque département a un numéro : l’Aube, c’est le 10.',
};
export const ACCUEIL = {
  titre: 'Le voyage d’un colis',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Romain', 'Menu Messagerie : le document « Mondial Relay en bref » est joint.'],
    ['① La carte de France', 'Place le [[hub]] de Buchères : sa [[région]], son [[département]], sa ville.'],
    ['② Le voyage du colis', 'Remets dans l’ordre les étapes du voyage du colis d’Inès.'],
    ['③ Peut-il voyager ?', 'Pour chaque colis, choisis où il va : locker, Point Relais ou refusé.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'La carte et les questions de Romain se jouent au premier essai : elles ne se rejouent pas.';

// L’ordre des écrans de travail (barre « Étape suivante » et menu « Mon poste »).
export const SUITE = [
  { vue: 'localiser', libelle: 'Carte de France', fait: localiserFini(VUE) },
  { vue: 'fiche', libelle: 'Le voyage du colis', fait: dejaEnvoyee(FICHES.voyage) },
  { vue: `fiche:${FICHES.colis}`, libelle: 'Peut-il voyager ?', fait: dejaEnvoyee(FICHES.colis) },
];
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Séance 1 : le voyage d’un colis',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_111,
  equipe: EQUIPE_111,
  questions: QUESTIONS,
  documents: [DOC_MR],
  documentsStyle: STYLE_DOCUMENTS,
  fiches: [FICHE_VOYAGE, FICHE_COLIS],
  localiser: LOCALISER,
  // La carte est le premier travail ; le voyage s’ouvre après la carte, les colis après le voyage.
  fermetures: {
    fiche: { ouvertSi: (db) => localiserFini(VUE)(db, ID), message: 'Après la carte de France' },
    [`fiche:${FICHES.colis}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.voyage)(db), message: 'Après « Le voyage du colis »' },
  },
  finFige: FIN_FIGE,
};
