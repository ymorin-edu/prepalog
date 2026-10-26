// ENT-13.1 — Stellantis Sochaux, « une voiture par minute » : le contenu de la séance (brief `docs/briefs/ENT-13.1-stellantis-une-voiture-par-minute.md` ; choix de Tristan du
// 26/10/2026, `docs/briefs/stellantis/A-TRANCHER.md`). Première séance de l'entreprise n° 13 (Terminale, la rentrée), GUIDAGE-rappel de C1.1 (situer l'entreprise dans sa chaîne logistique),
// apprise en 1re : la séance d'accueil de l'année, dans un milieu nouveau, une USINE. Sur le modèle d'ENT-12.1 (IKEA) : une carte, des fiches qui s'ouvrent l'une après l'autre.
// Univers : `contenus/stellantis.js` ; données et tirage : `contenus/stellantis-ent131-donnees.js` ; questions : `contenus/questions/ENT-13.1.js` ;
// corrigé : `contenus/corriges/ENT-13.1.js` ; activité : `activites/stellantis-une-voiture-par-minute.js`.
//
// Lundi 13 septembre 2027, 7 h 30, bureau de la logistique du montage. Karim accueille :
//   ① la carte de France (vue « Localiser ») : l'usine de Sochaux et l'équipementier voisin de Rougegoutte (région et département notés, la ville sans note) ; lieu BONUS du confirmé :
//      l'ancien aérodrome de Lure-Malbouhans (les voitures garées en 2022) ;
//   ② le voyage d'une pièce (fiche, 8 étapes à remettre dans l'ordre ; départ mélangé par élève) ;
//   ③ les chiffres de l'usine (fiche : voitures par heure, nombre de 5008 du jour, pourquoi si peu de stock, ce qu'un manque provoque) ;
//   ④ usine ou entrepôt ? (fiche : six phrases à ranger).
//
// ÉCARTS AU BRIEF (dits à Tristan) : la carte se joue sur deux lieux (l'usine, le fournisseur voisin) et la ville est sans note, comme ENT-12.1 ; les positions sont APPROCHÉES (centre de la commune,
// relevées de mémoire) ; « usine ou entrepôt » est une fiche à six listes (la vue `assoc` n'est pas déclarable dans l'environnement d'entreprise) ; la question d'éco-droit sur l'externalisation est
// posée à la fin des chiffres, corrigée AU BILAN ; une photo de l'usine : aucune (dessin maison du voyage : non fait, la fiche suffit).
// Poids (brief §5, validés par Tristan le 26/10/2026) : situer les deux lieux 4 (région et département de chacun, 1 point chacun) · le voyage de la pièce 5 (ordre exact) · les chiffres 5
// (voitures par heure 1, 5008 du jour 2, pourquoi si peu de stock 1, ce que provoque un manque 1) · usine ou entrepôt 3 (six phrases, 0,5 chacune) · les questions notées 3 (`part`) = 20.
// Rien n'est vrai avant l'envoi d'une fiche ou le premier essai d'une étape de la carte : l'inaction vaut 0.

import { FRANCE } from './france-contours.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { lireNombre } from '../core/types/fiche.js';
import { apresFiche, localiserFini } from '../core/declencheurs.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQ, KARIM, STYLE_DOCUMENTS, ech, pied, heureScenario } from './stellantis.js';
import { QUESTIONS } from './questions/ENT-13.1.js';
import {
  ID, VUE, ID_VOLET, FICHES, JOUR, VOYAGE, ORDRE_VOYAGE, memeOrdre, PAR_HEURE, STOCK_RAISONS, MANQUE_EFFETS, JUSTE_STOCK, JUSTE_MANQUE, accepte5008, PHRASES, LIEUX_CHOIX,
  CHAMP, CHAMP_PHRASE, TIRAGE, ordreDepart, voituresDuJour, partCinq, phrasesDepart, fiche, dejaEnvoyee,
} from './stellantis-ent131-donnees.js';

export { ID, VUE, ID_VOLET, FICHES, TIRAGE } from './stellantis-ent131-donnees.js';

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
export const EQUIPE = { karim: { nom: EQ.karim.prenom, role: `${EQ.karim.poste} (ton responsable)`, appel: 'Karim' } };

// ─────────────────────────────────────────────────────────────── la carte de France (vue « Localiser »)
// Positions APPROCHÉES : le centre de la commune, relevé de mémoire (le contrôle de la vue vérifie que chaque point tombe dans son département et que les quatre villes d'un lieu sont à plus de 8 km).
export const LOCALISER = {
  id: VUE, libelle: 'Carte de France', titre: 'Où est l’usine ?', contours: FRANCE,
  lieux: [
    { id: 'sochaux', lettre: 'S', type: 'usine',
      nom: 'Usine Stellantis de Sochaux', role: 'L’usine où tu fais ta PFMP : on y monte les Peugeot 3008 et 5008, environ une voiture par minute.',
      ville: 'Sochaux', dep: '25', region: '27',
      lonlat: [6.8331, 47.5125], osm: 'commune de Sochaux (position approchée)',
      autres: [
        { ville: 'Besançon', lonlat: [6.0240, 47.2378] },
        { ville: 'Pontarlier', lonlat: [6.3547, 46.9047] },
        { ville: 'Morteau', lonlat: [6.6014, 47.0590] },
      ],
      reperes: [{ ville: 'Belfort', lonlat: [6.8628, 47.6397] }],
      indice: 'Dans l’est de la France, au pied du Jura, juste à côté de Montbéliard.', etiq: 'b' },
    { id: 'smrc', lettre: 'R', type: 'site',
      nom: 'Un équipementier voisin (SMRC)', role: 'Un fournisseur proche de l’usine : certaines pièces lui sont commandées le matin même.',
      ville: 'Rougegoutte', dep: '90', region: '27',
      lonlat: [6.8447, 47.7136], osm: 'commune de Rougegoutte (position approchée)',
      autres: [
        { ville: 'Belfort', lonlat: [6.8628, 47.6397] },
        { ville: 'Delle', lonlat: [7.0003, 47.5058] },
        { ville: 'Montreux-Château', lonlat: [6.9569, 47.6006] },
      ],
      reperes: [{ ville: 'Sochaux', lonlat: [6.8331, 47.5125] }],
      indice: 'Dans le plus petit département de la région, au nord de Belfort, au pied des Vosges.', etiq: 'h' },
    { id: 'lure', lettre: 'L', type: 'site', bonus: true,
      nom: 'Ancien aérodrome de Lure-Malbouhans', role: 'En 2022, des voitures finies y ont été garées faute de place sur le parking de l’usine.',
      ville: 'Malbouhans', dep: '70', region: '27',
      lonlat: [6.4975, 47.7056], osm: 'commune de Malbouhans (position approchée)',
      autres: [
        { ville: 'Vesoul', lonlat: [6.1544, 47.6199] },
        { ville: 'Luxeuil-les-Bains', lonlat: [6.3786, 47.8208] },
        { ville: 'Gray', lonlat: [5.5953, 47.4423] },
      ],
      reperes: [{ ville: 'Sochaux', lonlat: [6.8331, 47.5125] }], etiq: 'g' },
  ],
  flux: ['smrc', 'sochaux'],
  fin: (db) => ({ titre: 'Sochaux et son fournisseur voisin',
    texte: 'L’usine de Sochaux est dans le Doubs. Un équipementier voisin, à Rougegoutte (Territoire de Belfort), est à moins d’une heure : certaines pièces lui sont commandées le matin même. '
      + 'D’autres viennent de Shanghai, commandées quinze semaines à l’avance.'
      + (db && db.aisance === 'confirme' ? ' En 2022, faute de place, des voitures finies ont même été garées sur l’ancien aérodrome de Lure-Malbouhans (Haute-Saône).' : '')
      + ' (Les places sur la carte sont approchées : ce sont les centres des communes.)' }),
};

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
export const DOC_CHIFFRES = { id: 'sochaux-131', titre: 'Sochaux en chiffres', court: 'Sochaux en chiffres',
  html: `<article class="st-doc" aria-label="Sochaux en chiffres">
    <p class="st-t">Sochaux en chiffres</p>
    <p class="st-st">L’usine Stellantis de Sochaux (Doubs), 2026 — lis ces lignes avant de répondre</p>
    <table class="st-table"><tbody>
      <tr><th scope="row">Les voitures</th><td>Une usine Peugeot depuis 1912. Aujourd’hui, la même ligne monte la <b>3008</b> (environ 70 %) et la <b>5008</b> (environ 30 %). Environ <b>1 045 voitures par jour</b> : une par minute.</td></tr>
      <tr><th scope="row">Les gens</th><td>Environ 5 400 salariés en CDI et 1 050 intérimaires. Une chaîne à l’arrêt immobilise environ <b>1 200 personnes</b>.</td></tr>
      <tr><th scope="row">Les camions</th><td>Environ <b>250 camions</b> et <b>500 fournisseurs</b> par jour.</td></tr>
      <tr><th scope="row">Le stock</th><td>Le stock sur place ne couvre que <b>quelques heures à une journée et demie</b> de production : l’usine a deux fois moins de surface depuis 2022.</td></tr>
      <tr><th scope="row">Le transstockeur</th><td>Un grand magasin automatique de 4 500 palettes, mis en service en 2022. Une palette en sort en environ <b>6 minutes</b>.</td></tr>
      <tr><th scope="row">Le bord de ligne</th><td>Environ trois quarts des pièces arrivent au bord de ligne sur des <b>robots autonomes</b>. Une pièce parcourt 150 à 200 m du camion à la ligne (1 km avant 2022).</td></tr>
      <tr><th scope="row">Près ou loin</th><td>Certaines pièces sont commandées <b>le matin même</b> à un équipementier voisin, à Rougegoutte. D’autres sont commandées <b>quinze semaines à l’avance</b> à Shanghai.</td></tr>
      <tr><th scope="row">Les voitures finies</th><td>70 % partent par la route, 30 % par le rail.</td></tr>
    </tbody></table>
    ${pied('Sources : Le Trois (13/04/2026, 16/07/2026, 05/09/2022), Journal de l’Automobile (13/04/2026), communiqué Stellantis du 05/09/2022. Mise en page construite pour la séance.')}
  </article>` };
export const DOC_CHAINE = { id: 'chaine-131', titre: 'Une usine dans sa chaîne', court: 'Une usine dans sa chaîne',
  html: `<article class="st-doc" aria-label="Une usine dans sa chaîne">
    <p class="st-t">Une usine dans sa chaîne</p>
    <p class="st-st">Ce que tu as vu en 2de et en 1re, dans une usine</p>
    <ul class="st-ul">
      <li>L’<b>amont</b> d’une usine, ce sont ses <b>fournisseurs</b> : ils lui envoient les pièces. Son <b>aval</b>, ce sont ses clients : ici, les voitures terminées partent par la route ou par le rail.</li>
      <li>Le <b>client de la logistique d’usine</b>, c’est <b>la ligne de montage</b> : il faut lui amener la bonne pièce, au bon moment, au bord de la ligne.</li>
      <li>Travailler à <b>flux tendu</b> (juste-à-temps), c’est recevoir juste ce qu’il faut, juste au moment où il le faut : le stock est petit, donc un manque arrête vite la ligne.</li>
      <li><b>Externaliser</b>, c’est confier une partie du travail (ici, fabriquer des pièces) à une autre entreprise spécialisée : l’usine achète ses pièces à ses fournisseurs au lieu de toutes les fabriquer.</li>
    </ul>
    ${pied('Fiche de travail construite pour la séance.')}
  </article>` };
export const DOCUMENTS = [DOC_CHIFFRES, DOC_CHAINE];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── les fiches
const etapes = (db) => ordreDepart(db).map((v) => ({ v, lib: (VOYAGE.find((e) => e.v === v) || {}).lib || v }));
export const FICHE_VOYAGE = {
  id: FICHES.voyage, libelle: 'Le voyage d’une pièce', titre: 'Le voyage d’un rétroviseur',
  sousTitre: 'Un rétroviseur voyage du fournisseur jusqu’à la voiture. Remets les étapes dans l’ordre.',
  documents: ['sochaux-131', 'chaine-131'],
  bouton: 'Ouvrir la fiche « Le voyage d’une pièce »',
  blocs: (db) => [
    { type: 'ordre', id: 'voyage', titre: 'Les étapes du voyage', consigne: 'Remets les étapes dans l’ordre, de la première à la dernière.', choix: etapes(db) },
  ],
  envoi: { bouton: 'Envoyer la fiche à Karim', a: 'Karim', suite: 'Karim va te répondre.' },
};
export const FICHE_CHIFFRES = {
  id: FICHES.chiffres, libelle: 'Les chiffres de l’usine', titre: 'Les chiffres de l’usine',
  sousTitre: 'Lis le document « Sochaux en chiffres » et réponds.',
  documents: ['sochaux-131'],
  bouton: 'Ouvrir la fiche « Les chiffres de l’usine »',
  quand: (db) => dejaEnvoyee(FICHES.voyage)(db),
  blocs: (db) => [
    { type: 'nombre', id: CHAMP.parheure, lib: 'L’usine sort une voiture par minute. Combien de voitures par heure ?', unite: 'voitures', min: 0, entier: true, manque: 'le nombre de voitures par heure' },
    { type: 'nombre', id: CHAMP.cinq, lib: `Aujourd’hui, ${String(voituresDuJour(db)).replace(/\B(?=(\d{3})+$)/g, ' ')} voitures sont sorties, dont ${partCinq(db)} % de 5008. Combien de 5008 environ ?`,
      unite: 'voitures', min: 0, entier: true, manque: 'le nombre de 5008' },
    { type: 'liste', id: CHAMP.stock, lib: 'Pourquoi l’usine garde-t-elle si peu de stock ?', vide: 'Choisir…', manque: 'la raison du peu de stock', choix: STOCK_RAISONS },
    { type: 'liste', id: CHAMP.manque, lib: 'Une pièce manque au bord de la ligne. Que se passe-t-il ?', vide: 'Choisir…', manque: 'ce qui se passe', choix: MANQUE_EFFETS },
  ],
  envoi: { bouton: 'Envoyer la fiche à Karim', a: 'Karim', suite: 'Karim va te répondre.' },
};
export const FICHE_USINE = {
  id: FICHES.usine, libelle: 'Usine ou entrepôt ?', titre: 'Usine ou entrepôt ?',
  sousTitre: 'Pour chaque phrase, choisis : plutôt l’usine de Sochaux, ou plutôt un entrepôt de distribution comme celui de Cdiscount ?',
  documents: ['sochaux-131', 'chaine-131'],
  bouton: 'Ouvrir la fiche « Usine ou entrepôt ? »',
  quand: (db) => dejaEnvoyee(FICHES.chiffres)(db),
  blocs: (db) => phrasesDepart(db).map((p) => ({ type: 'liste', id: CHAMP_PHRASE(p.id), lib: p.lib, vide: 'Choisir…', manque: 'une phrase', choix: LIEUX_CHOIX })),
  envoi: { bouton: 'Envoyer la fiche à Karim', a: 'Karim', suite: 'Karim va te répondre.' },
};

// ─────────────────────────────────────────────────────────────── les jalons
export const GROUPES = { carte: 'Situer l’usine et son fournisseur', voyage: 'Le voyage d’une pièce', chiffres: 'Les chiffres de l’usine', usine: 'Usine ou entrepôt' };
export const POIDS = { carte: 1, voyage: 5, parheure: 1, cinq: 2, stock: 1, manque: 1, phrase: 0.5 };
const lire = (db, id, champ) => fiche(db, id).valeurs[champ];
export const ETAPES = [
  ...etapesLocaliser(LOCALISER, ID).map((j) => (j.bonus ? j : Object.assign(j, { poids: POIDS.carte, groupe: GROUPES.carte }))),
  { id: 'voyage-ordre', titre: 'Le voyage de la pièce : les 8 étapes dans l’ordre', groupe: GROUPES.voyage, ecran: 'fiche', poids: POIDS.voyage,
    verifier(db) { const f = fiche(db, FICHES.voyage); return !f.envoye ? attente : juge(memeOrdre(f.valeurs.voyage, ORDRE_VOYAGE)); } },
  { id: 'voitures-par-heure', titre: 'Les voitures par heure', groupe: GROUPES.chiffres, ecran: `fiche:${FICHES.chiffres}`, poids: POIDS.parheure,
    verifier(db) { const f = fiche(db, FICHES.chiffres); return !f.envoye ? attente : juge(lireNombre(f.valeurs[CHAMP.parheure]) === PAR_HEURE); } },
  { id: 'voitures-5008', titre: 'Le nombre de 5008 du jour', groupe: GROUPES.chiffres, ecran: `fiche:${FICHES.chiffres}`, poids: POIDS.cinq,
    verifier(db) { const f = fiche(db, FICHES.chiffres); return !f.envoye ? attente : juge(accepte5008(voituresDuJour(db), partCinq(db), lireNombre(f.valeurs[CHAMP.cinq]))); } },
  { id: 'peu-de-stock', titre: 'Pourquoi si peu de stock', groupe: GROUPES.chiffres, ecran: `fiche:${FICHES.chiffres}`, poids: POIDS.stock,
    verifier(db) { const f = fiche(db, FICHES.chiffres); return !f.envoye ? attente : juge(f.valeurs[CHAMP.stock] === JUSTE_STOCK); } },
  { id: 'piece-qui-manque', titre: 'Ce que provoque une pièce qui manque', groupe: GROUPES.chiffres, ecran: `fiche:${FICHES.chiffres}`, poids: POIDS.manque,
    verifier(db) { const f = fiche(db, FICHES.chiffres); return !f.envoye ? attente : juge(f.valeurs[CHAMP.manque] === JUSTE_MANQUE); } },
  ...PHRASES.map((p) => ({ id: `usine-${p.id}`, titre: `« ${p.lib} »`, groupe: GROUPES.usine, ecran: `fiche:${FICHES.usine}`, poids: POIDS.phrase,
    verifier(db) { const f = fiche(db, FICHES.usine); return !f.envoye ? attente : juge(f.valeurs[CHAMP_PHRASE(p.id)] === p.juste); } })),
];

// ─────────────────────────────────────────────────────────────── les messages de Karim (il tutoie ; lundi 13 septembre 2027)
const heure = (db, hhmm) => heureScenario(JOUR.iso, hhmm, { db, volet: ID_VOLET });
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '07:30'), from: KARIM.nom, fromMail: KARIM.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const accuse = (sujet) => (prenom, n, db) => ({ mails: [mail(prenom, `RE : ${sujet}`, 'Merci, j’ai ta nouvelle fiche.\n\nKarim', { db, heure: '10:30' })] });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [mail(prenom, 'Bienvenue à l’usine de Sochaux',
    `Bonjour ${prenom}, bienvenue dans l’équipe logistique de l’usine Stellantis de Sochaux. Je suis Karim, ton chef d’équipe pendant ta PFMP.\n\n`
      + 'Ici, on monte environ une voiture par minute. Aujourd’hui, tu découvres l’usine : où elle est, comment une pièce y voyage, ce que la logistique a de particulier ici. Lis d’abord le document « Sochaux en chiffres ».\n\n'
      + 'Puis ouvre la carte de France (menu) et place l’usine, et l’équipementier voisin qui lui livre des pièces.\n\nKarim',
    { db, extra: { pieces: ['sochaux-131', 'chaine-131'] } })] }),
  declencheurs: [
    { id: 'voyage', quand: localiserFini(VUE), semer: (prenom, db) => ({ mails: [mail(prenom, 'Le voyage d’une pièce',
      'Tu sais où est l’usine. Suivons maintenant un rétroviseur, depuis la commande au fournisseur jusqu’à la voiture terminée. Il y a huit étapes.\n\n'
        + 'Remets-les dans l’ordre.\n\nKarim', { db, heure: '08:30', extra: { ouvreFiche: FICHES.voyage } })] }) },
    { id: 'chiffres', quand: apresFiche(FICHES.voyage), semer: (prenom, db) => ({ mails: [mail(prenom, 'Les chiffres de l’usine',
      'Merci. Une usine comme la nôtre se lit dans ses chiffres. Relis le document « Sochaux en chiffres », puis réponds aux quatre questions de la fiche.\n\nKarim',
      { db, heure: '09:15', extra: { pieces: ['sochaux-131'], ouvreFiche: FICHES.chiffres } })] }) },
    { id: 'usine', quand: apresFiche(FICHES.chiffres), semer: (prenom, db) => ({ mails: [mail(prenom, 'Usine ou entrepôt ?',
      'Tu as déjà vu des entrepôts de distribution, en 2de et en 1re. Une usine, ce n’est pas la même logistique. Pour chaque phrase de la fiche, dis si elle va plutôt avec l’usine de Sochaux ou plutôt avec un entrepôt de distribution.\n\nKarim',
      { db, heure: '10:00', extra: { ouvreFiche: FICHES.usine } })] }) },
    { id: 'fin', quand: apresFiche(FICHES.usine), semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci pour cette matinée',
      'Merci ! Tu sais où est l’usine, comment une pièce y voyage et ce qui la distingue d’un entrepôt de distribution : ici, le client, c’est la ligne, et un manque l’arrête. La prochaine fois, on regarde comment on classe les références du magasin.\n\nKarim',
      { db, heure: '11:00' })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: { [FICHES.voyage]: accuse('Le voyage d’une pièce'), [FICHES.chiffres]: accuse('Les chiffres de l’usine'), [FICHES.usine]: accuse('Usine ou entrepôt ?') },
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
export const LEXIQUE_131 = {
  'région': 'Une grande zone de la France. La France métropolitaine en compte 13. Chaque région est découpée en départements.',
  'département': 'Une zone plus petite qu’une région. Chaque département a un numéro : le Doubs, c’est le 25.',
  'transstockeur': 'Un grand magasin automatique : une machine monte et descend le long d’allées pour ranger et sortir les palettes toute seule.',
  'flux tendu': 'Recevoir juste ce qu’il faut, juste au moment où il le faut : presque pas de stock.',
  'équipementier': 'Une entreprise qui fabrique des pièces pour les constructeurs de voitures.',
};
export const MENTION_131 = 'Réels : l’usine Stellantis de Sochaux (Doubs), la ligne unique 3008 et 5008, ses chiffres de logistique, le transstockeur, les robots autonomes, un équipementier voisin à Rougegoutte et '
  + 'les pièces commandées à Shanghai (Le Trois, avril et juillet 2026 ; communiqué Stellantis du 05/09/2022). Construits : Karim, le rétroviseur suivi et les étapes de son voyage, les questions de calcul.';
export const ACCUEIL = {
  titre: 'Une voiture par minute',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Karim', 'Menu Messagerie : le document « Sochaux en chiffres » est joint.'],
    ['① La carte de France', 'Place l’usine de Sochaux et l’équipementier voisin : leur région, leur département, leur ville.'],
    ['② Le voyage d’une pièce', 'Remets dans l’ordre les étapes du voyage d’un rétroviseur.'],
    ['③ Les chiffres de l’usine', 'Quatre questions, d’après le document « Sochaux en chiffres ».'],
    ['④ Usine ou entrepôt ?', 'Six phrases à ranger.'],
    ['Bon à savoir', MENTION_131],
  ],
};
export const FIN_FIGE = 'La carte et les questions de Karim se jouent au premier essai : elles ne se rejouent pas.';
export const SUITE = [
  { vue: 'localiser', libelle: 'Carte de France', fait: localiserFini(VUE) },
  { vue: 'fiche', libelle: 'Le voyage d’une pièce', fait: dejaEnvoyee(FICHES.voyage) },
  { vue: `fiche:${FICHES.chiffres}`, libelle: 'Les chiffres de l’usine', fait: dejaEnvoyee(FICHES.chiffres) },
  { vue: `fiche:${FICHES.usine}`, libelle: 'Usine ou entrepôt ?', fait: dejaEnvoyee(FICHES.usine) },
];
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Une voiture par minute',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_131,
  equipe: EQUIPE,
  questions: QUESTIONS,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_VOYAGE, FICHE_CHIFFRES, FICHE_USINE],
  localiser: LOCALISER,
  // La carte est le premier travail ; le voyage s'ouvre après la carte, les chiffres après le voyage, « usine ou entrepôt » après les chiffres.
  fermetures: {
    fiche: { ouvertSi: (db) => localiserFini(VUE)(db, ID), message: 'Après la carte de France' },
    [`fiche:${FICHES.chiffres}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.voyage)(db), message: 'Après « Le voyage d’une pièce »' },
    [`fiche:${FICHES.usine}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.chiffres)(db), message: 'Après « Les chiffres de l’usine »' },
  },
  finFige: FIN_FIGE,
};
