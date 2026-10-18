// ENT-9.3 — CHEP, « le relevé contesté » : le contenu de la séance (brief `docs/briefs/ENT-9.3-chep-releve-conteste.md`).
// Données pures (le tirage, les documents de la semaine, les attendus, la grille) : `contenus/chep-ent93-donnees.js`. Univers commun :
// `contenus/chep.js` (lu, jamais modifié ici). Activité : `activites/chep-releve-conteste.js`. Questions : `contenus/questions/ENT-9.3.js`.
// Corrigé : `contenus/corriges/ENT-9.3.js`.
//
// Lundi 25 janvier 2027, 8 h 30 : l'élève, alternant au service relation clients et flux du centre CHEP de Templemars (tutrice : Sandrine
// Delattre), en ENTRAÎNEMENT de C2.5 avec une ERREUR INDUITE (le retour validé par Grégory sans compter les piles), traite la contestation
// d'Hélène Caron (Endives du Ternois) :
//   ① enquête (fiche `enquete`) : pour chaque document de la semaine (son bon de retour, ses bordereaux), ce que dit notre relevé, la
//      correction sur le solde, qui la fait ; d'où vient l'écart restant avec son inventaire ; la demande de Frais du Nord (un geste de ramasse) ;
//   ② refait le solde (fiche `corrige` : une grille dont les lignes sont SES corrections, le solde corrigé et l'écart restant par formule) ;
//   ③ lui répond par phrases, honnêtement (l'erreur de CHEP était en sa faveur : son solde AUGMENTE).
// Moins guidé que 9.1 et 9.2 : pas d'encadré, pas de colonne d'aide, pas de barre « Étape suivante » ; les pastilles restent.
// Rien n'est jugé avant l'envoi ; Hélène et Sandrine reprennent ce que l'élève a écrit, sans corriger (règle du 10/10/2026).
// « Une erreur ne se paie qu'une fois » : le relevé corrigé est jugé sur SON enquête, jamais sur le solde réel ; la réponse, elle, part chez
// la cliente : elle est jugée sur le réel (comme ENT-7.1).
//
// VÉRIFIÉ (coordination §2, brief §2) : c'est l'émetteur qui déclare ses transferts (Autorité de la concurrence, 2009, §29) ; un transfert
// non déclaré fait payer la location à l'expéditeur, l'écart apparaît à l'inventaire ; corrections dans les 60 jours qui suivent la facture
// (pratique publique de CHEP en Australie, généralisée avec prudence) ; le système repose sur la bonne foi des déclarations (même décision,
// §32) ; les centres trient et contrôlent les palettes collectées. CONSTRUIT : la contestation, l'inventaire d'Hélène, le rapport de la ligne
// de tri, l'erreur de Grégory (un personnage fictif : elle ne dit rien du vrai centre de Templemars, le pied du rapport le dit), Frais du
// Nord et ses palettes, tous les numéros et toutes les quantités.

import { apresFiche, apresMail } from '../core/declencheurs.js';
import { lireFeuille } from '../core/types/fiche.js';
import { phrasesJustes } from '../core/phrases.js';
import { estFormule } from '../core/formules.js';
import { QUESTIONS } from './questions/ENT-9.3.js';
import { EQUIPE, DISTRIBUTEURS, LEXIQUE, mailDe, heureScenario, STYLE_DOCUMENTS, PIED, PIED_RECONSTITUE, DOC_CONDITIONS, DOC_CHEP, DOC_DROIT,
  cadreSupports, docBordereau, date, palettes, nombre, ech } from './chep.js';
import {
  ID, ID_VOLET, SCENARIO, CLIENT, SEMAINE, INVENTAIRE_ISO, CREDITE, PILES, PAR_PILE, FICHES, BLOC_GRILLE, PHRASES_ID, ROLES, champ,
  TYPES, CORRECTIONS, QUI, NUMEROS, DATES, BANQUE_CLIENT, pieceDuRole, jeuEleve, fiche, dejaEnvoyee, enquete, correctionsEleve, melangeDe,
  accompagne, lireNombre, BLOC_CORRIGE, caseSoldeCorrige, caseEcart, casePlus, caseMoins, valeurDeSaFeuille,
} from './chep-ent93-donnees.js';

export { ID, SCENARIO, TIRAGE, BLOC_CORRIGE, lignesCorrige } from './chep-ent93-donnees.js';

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
const entete = (qui, refs) => `<div class="ch-entete"><b>${ech(qui)}</b><span>${refs.map(ech).join('<br>')}</span></div>`;
const PIED_93 = PIED(PIED_RECONSTITUE);
const nomDist = (k) => (DISTRIBUTEURS[k] ? DISTRIBUTEURS[k].nom : '');

// Notre relevé de la semaine (mouvements ENREGISTRÉS) : le solde au 15/01, l'émission, les transferts DÉCLARÉS, le retour crédité, le solde au
// 22/01 (= S_rel). Gabarit propre à cette séance (ENT-9.4 pourra le reprendre : il faudrait alors le monter dans `contenus/chep.js`).
const LIB_MVT = { emission: 'Émission — livraison de palettes vides', transfert: 'Transfert déclaré', retour: 'Retour au centre de service' };
export function docReleveSemaine(db) {
  const J = jeuEleve(db || {});
  const ligne = (m) => `<tr><td>${date(m.iso)}</td><td>${LIB_MVT[m.genre]}${m.a ? ` → ${ech(nomDist(m.a))}` : ''}</td><td>${ech(m.numero)}</td>
    <td class="ch-n">${m.entree ? `+ ${nombre(m.entree)}` : ''}</td><td class="ch-n">${m.sortie ? `− ${nombre(m.sortie)}` : ''}</td></tr>`;
  return `<article class="ch-doc" aria-label="Relevé du compte ${ech(CLIENT.compte)} — semaine du 18 au 22 janvier">
    ${entete('CHEP — portail clients', [`Relevé du compte ${CLIENT.compte}`, CLIENT.nom])}
    <p class="ch-t">Relevé du compte palettes — semaine du 18 au 22 janvier 2027</p>
    <p class="ch-st">Mouvements enregistrés, arrêté au ${date(SEMAINE.fin, { long: true })}</p>
    <p>[[solde|Solde]] au ${date(SEMAINE.avant)} : <b>${palettes(J.sAvant)} CHEP</b></p>
    <table class="ch-t2"><thead><tr><th scope="col">Date</th><th scope="col">Mouvement</th><th scope="col">Document</th>
      <th scope="col" class="ch-n">Entrées</th><th scope="col" class="ch-n">Sorties</th></tr></thead>
      <tbody>${J.mouvements.map(ligne).join('')}</tbody></table>
    ${cadreSupports([`<b>Solde du compte au ${date(SEMAINE.fin)} : ${palettes(J.sRel)} CHEP</b>`,
    `C’est le nombre de palettes dont ${ech(CLIENT.nom)} paie la location chaque jour.`], { titre: 'Solde' })}
    <p class="ch-st">Un [[transfert]] apparaît ici une fois déclaré par l’émetteur sur le portail.</p>
    ${PIED_93}
  </article>`;
}

// Le bon de retour du mardi 19/01, avec le visa de Grégory écrit à la main (en italique, police du site : jamais une image).
export const VISA_GREGORY = `${PILES} piles × ${PAR_PILE} = ${CREDITE} — OK, G.V.`;
export function docBonRetour93() {
  return `<article class="ch-doc" aria-label="Bon de retour ${ech(NUMEROS.retour)}">
    ${entete('CHEP — centre de service de Templemars', [`Bon de [[retour]] n° ${NUMEROS.retour}`, `Compte ${CLIENT.compte}`])}
    <p class="ch-t">Bon de retour — palettes vides rendues au centre de service</p>
    <p class="ch-st">Date de réception au centre : ${date(DATES.retour, { long: true })}</p>
    <dl class="ch-dl">
      <dt>Rendues par</dt><dd>${ech(CLIENT.nom)} — ${ech(CLIENT.ville)}</dd>
      <dt>Compte client</dt><dd>${ech(CLIENT.compte)}</dd>
      <dt>Motif</dt><dd>surplus de campagne, palettes vides</dd>
      <dt>Annoncé</dt><dd>${PILES} piles de ${PAR_PILE} palettes</dd>
    </dl>
    ${cadreSupports([`<b>Palettes CHEP rendues : ${PILES} piles de ${PAR_PILE} — ${palettes(CREDITE)} CHEP</b>`, 'Ces palettes sortent du compte du client à la date de réception.'])}
    <p class="ch-st" style="margin-bottom:2px">Visa du chef d’équipe du quai des retours :</p>
    <p class="ch93-main" data-visa>${ech(VISA_GREGORY)}</p>
    ${PIED_93}
  </article>`;
}

// Le rapport de la ligne de tri du mercredi 20/01 (lot du retour) : ce que le tri a vraiment trouvé.
export const PIED_TRI = 'Situation construite pour l’exercice : l’erreur de comptage est celle d’un personnage fictif et ne dit rien du vrai centre de Templemars. '
  + 'Document reconstitué — document pédagogique Prepalog.';
export function docRapportTri(db) {
  const R = jeuEleve(db || {}).retour;
  return `<article class="ch-doc" aria-label="Rapport de la ligne de tri ${ech(NUMEROS.tri)}">
    ${entete('CHEP — centre de service de Templemars', [`Rapport de tri n° ${NUMEROS.tri}`, `Lot ${NUMEROS.retour}`])}
    <p class="ch-t">Rapport de la ligne de tri</p>
    <p class="ch-st">Passage en ligne le ${date(DATES.tri, { long: true })} — lot ${ech(NUMEROS.retour)} (${ech(CLIENT.nom)})</p>
    <table class="ch-t2"><tbody>
      <tr><th scope="row">Palettes CHEP</th><td class="ch-n">${nombre(R.chep)}</td><td>dont ${nombre(R.reparer)} à réparer</td></tr>
      <tr><th scope="row">Palettes LPR écartées</th><td class="ch-n">${nombre(R.lpr)}</td><td>rouges, marquées « LPR » : mises de côté en zone hors pool</td></tr>
      <tr><th scope="row">Total passé en ligne</th><td class="ch-n">${nombre(CREDITE)}</td><td></td></tr>
    </tbody></table>
    <p class="ch-st">Chaque palette passe une à une sur la ligne : elle est inspectée, triée, puis réparée s’il le faut.</p>
    ${PIED(PIED_TRI)}
  </article>`;
}

// L'inventaire d'Hélène du lundi 25/01. La phrase entre parenthèses est l'INDICE (discret) : elle n'est jamais une donnée lue par un jalon.
export const INDICE_INVENTAIRE = '(palettes bleues et palettes en bois brut, comptées ensemble)';
export function docInventaire(db) {
  const J = jeuEleve(db || {});
  return `<article class="ch-doc" aria-label="Inventaire du parc palettes — ${ech(CLIENT.nom)}">
    ${entete(CLIENT.nom, [`${CLIENT.forme} — ${CLIENT.ville}`, 'Inventaire du parc palettes'])}
    <p class="ch-t">Inventaire des palettes vides</p>
    <p class="ch-st">${date(INVENTAIRE_ISO, { long: true })}, 7 h 30 — parc palettes du quai d’expédition</p>
    <dl class="ch-dl">
      <dt>Compté par</dt><dd>l’équipe du quai d’expédition</dd>
      <dt>Pour</dt><dd>Hélène Caron, responsable logistique</dd>
    </dl>
    ${cadreSupports([`<b>Palettes sur le parc ce matin : ${palettes(J.sParc)}</b> ${INDICE_INVENTAIRE}`])}
    ${PIED_93}
  </article>`;
}

// Un bordereau d'Hélène, à sa place (1 à 4) : le gabarit de l'univers (cadre « Supports de charge »).
function bordereauHtml(b) {
  if (!b) return '<article class="ch-doc"><p class="ch-st">Pas de document à cette place.</p></article>';
  return docBordereau({ numero: b.numero, iso: b.iso, de: CLIENT, a: DISTRIBUTEURS[b.a], lignes: b.lignes, supports: { chep: b.qte } });
}
export const DOCUMENTS = [
  { id: 'releve', titre: 'Notre relevé — semaine du 18 au 22/01', court: 'Notre relevé', html: docReleveSemaine },
  { id: 'bon-retour', titre: `Bon de retour ${NUMEROS.retour}`, court: 'Bon de retour', html: docBonRetour93 },
  { id: 'rapport-tri', titre: 'Rapport de la ligne de tri', court: 'Rapport de tri', html: docRapportTri },
  ...[1, 2, 3, 4].map((n) => ({ id: `bl-${n}`, titre: `Bordereau ${n} (Endives du Ternois)`, court: `Bordereau ${n}`,
    html: (db) => bordereauHtml(jeuEleve(db || {}).bordereaux[n - 1]) })),
  { id: 'inventaire', titre: 'Inventaire d’Hélène du 25/01', court: 'Son inventaire', html: docInventaire },
  DOC_CONDITIONS, DOC_CHEP, DOC_DROIT,
];
export const STYLE = `${STYLE_DOCUMENTS}
.ch93-main{margin:0 0 10px !important; padding-left:10px; font-style:italic; font-size:1.05rem; letter-spacing:.01em}
`;
// Ses bordereaux (3, ou 4 pour un confirmé), dans son ordre.
export const bordereauxDe = (db) => jeuEleve(db || {}).bordereaux.map((b) => b.docId);

// ─────────────────────────────────────────────────────────────── ① la fiche « enquête » (portail clients)
export const INVENTAIRE_CHOIX = [
  { v: 'europe', lib: 'palettes Europe comptées comme des CHEP dans son inventaire' },
  { v: 'perdues', lib: 'palettes CHEP perdues par le transporteur' },
  { v: 'calcul', lib: 'une erreur de calcul dans notre relevé' },
];
export const FRAIS_CHOIX = (f) => [
  { v: 'tournee', lib: `Ajouter Frais du Nord à la prochaine tournée de ramasse : ${f} palettes, c’est moins qu’un camion complet.` },
  { v: 'complet', lib: 'Envoyer tout de suite un camion complet.' },
  { v: 'reprendre', lib: 'Demander à Endives du Ternois d’aller les reprendre.' },
];
export const AIDES = {
  retour: 'Compare le bon de retour et le rapport de la ligne de tri.',
  bordereau: 'Compare la quantité du bordereau et celle du relevé.',
  inventaire: 'Relis comment l’équipe d’Hélène a compté les palettes de son parc.',
  frais: 'Un camion complet emporte 26 piles de 15 palettes vides.',
};
const titreCadre = (c) => (c.role === 'retour' ? `Bon de retour ${c.numero} (${date(c.iso)})` : `Bordereau ${c.rang} — ${c.numero}`);
const nomCadre = (c) => (c.role === 'retour' ? 'du bon de retour' : `du bordereau ${c.rang}`);
export const FICHE_ENQUETE = {
  id: FICHES.enquete, libelle: 'Portail clients — Enquête', titre: `Portail clients CHEP — enquête sur le compte ${CLIENT.compte}`,
  sousTitre: 'Tes documents et les nôtres à gauche ; à droite, un cadre par document de la semaine, puis son inventaire et la demande de Frais du Nord.',
  documents: (db) => ['releve', 'bon-retour', 'rapport-tri', ...bordereauxDe(db), 'inventaire', 'conditions'],
  largeurDocs: 1,
  serree: true,
  defile: true,   // six ou sept cadres : la fiche défile dans sa colonne, le bouton d'envoi reste visible (comme ENT-9.1)
  bouton: 'Ouvrir le portail — enquête',
  blocs: (db) => {
    const J = jeuEleve(db || {}), acc = accompagne(db || {});
    const aide = (quoi) => (acc ? { consigne: AIDES[quoi] } : {});
    return [
      ...J.cadres.map((c) => ({ type: 'cadre', titre: titreCadre(c), ...aide(c.role === 'retour' ? 'retour' : 'bordereau'), blocs: [
        { type: 'liste', id: champ('type', c.role), lib: 'Dans notre relevé, ce document est…', vide: 'Choisir…', choix: TYPES, manque: `ce que dit le relevé ${nomCadre(c)}` },
        { type: 'liste', id: champ('corr', c.role), lib: 'Correction sur le solde', vide: 'Choisir…', choix: CORRECTIONS, manque: `la correction ${nomCadre(c)}` },
        { type: 'nombre', id: champ('qte', c.role), lib: 'Palettes à corriger (0 si aucune)', unite: 'palettes', min: 0, entier: true,
          manque: `le nombre de palettes ${nomCadre(c)}` },
        { type: 'liste', id: champ('qui', c.role), lib: 'Qui fait la correction ?', vide: 'Choisir…', choix: QUI, manque: `qui corrige ${nomCadre(c).replace(/^du /, 'le ')}` },
      ] })),
      { type: 'cadre', titre: 'Son inventaire', ...aide('inventaire'), blocs: [
        { type: 'choix', id: 'inventaire', lib: 'Après les corrections, il restera un écart avec l’inventaire d’Hélène. Il vient de…', colonne: true,
          choix: melangeDe(db, 'inventaire', INVENTAIRE_CHOIX), manque: 'd’où vient l’écart avec son inventaire' },
      ] },
      { type: 'cadre', titre: 'La demande de Frais du Nord', ...aide('frais'), blocs: [
        { type: 'choix', id: 'frais', colonne: true,
          lib: `Hélène écrit : « Frais du Nord nous dit avoir ${J.valeurs.f} palettes CHEP vides de nos livraisons qui encombrent son quai. » Que proposes-tu à Yannick ?`,
          choix: melangeDe(db, 'frais', FRAIS_CHOIX(J.valeurs.f)), manque: 'ce que tu proposes pour Frais du Nord' },
      ] },
    ];
  },
  envoi: { bouton: 'Envoyer l’enquête à Sandrine', a: 'Sandrine', suite: 'Sandrine te répond dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── ② le relevé corrigé (bloc grille, lignes = SES corrections)
export const FICHE_CORRIGE = {
  id: FICHES.corrige, libelle: 'Portail clients — Relevé corrigé', titre: `Relevé corrigé du compte ${CLIENT.compte}`,
  sousTitre: 'Une ligne par correction de ton enquête. Solde corrigé et écart restant : tape « = » puis clique sur les cases.',
  documents: ['releve', 'inventaire', 'conditions'],
  largeurDocs: 0.6,
  serree: true,
  defile: true,
  bouton: 'Ouvrir le relevé corrigé',
  // « Déjà envoyée » et non « envoyée » : une fiche rouverte par « Corriger » perd son état envoyé, le relevé resterait ouvert.
  quand: dejaEnvoyee(FICHES.enquete),
  blocs: [BLOC_CORRIGE],
  envoi: { bouton: 'Enregistrer le relevé corrigé', a: 'Sandrine', suite: 'Hélène t’écrit dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── ③ la réponse à Hélène (phrases à choisir, jugées sur le réel)
const iso2 = (iso) => date(iso).replace(/^\S+\s/, '');   // « 21/01 »
// Ce qu'Hélène doit faire elle-même, pour une pièce (A2 : déclarer ; A3 : corriger la quantité). Calculé sur SES valeurs.
export function actionDe(role, J) {
  const V = J.valeurs, p = pieceDuRole(role);
  if (role === 'a2') return `Il vous reste à déclarer sur le portail le transfert du ${iso2(p.iso)} vers ${nomDist(p.a)} (${V.t2} palettes).`;
  return `Il vous reste à corriger sur le portail la quantité du transfert du ${iso2(p.iso)} : ${V.d + V.x} palettes, et non ${V.d}.`;
}
export const NOUS_CORRIGEONS = 'Nous corrigeons nous-mêmes vos déclarations.';
export const choixChep = (k) => [
  `En reprenant votre retour du 19/01, nous avons vu que nous vous avions crédité ${CREDITE} palettes au lieu de ${CREDITE - k} : nous corrigeons, et votre solde augmente de ${k}.`,
  'Votre retour du 19/01 était juste.',
  `Nous retirons ${k} palettes de votre compte : elles ont été mal comptées.`,
];
// La ligne « demande » : la bonne pour SA pièce (rang 0). Un confirmé (les deux pièces) : les deux actions ensemble ; les pièges ne sont alors
// jamais une action qu'il doit vraiment faire.
export function choixDemande(db) {
  const J = jeuEleve(db || {});
  if (J.rolesBonus.length) {
    const deux = [J.role, ...J.rolesBonus].sort().map((r) => actionDe(r, J).replace(/^Il vous reste à /, '').replace(/\.$/, ''));
    return [`Il vous reste à ${deux.join(' ; et à ')}.`, NOUS_CORRIGEONS, 'Il n’y a rien à faire de votre côté.'];
  }
  return [actionDe(J.role, J), actionDe(J.role === 'a2' ? 'a3' : 'a2', J), NOUS_CORRIGEONS];
}
export const choixInventaire = (e) => [
  `L’écart restant vient de ${e} palettes Europe comptées dans votre inventaire : elles ne sont pas sur votre compte CHEP.`,
  'L’écart restant, ce sont des palettes perdues : nous les retirons.',
  'Il n’y a plus d’écart.',
];
export const FIN = (prenom) => `Je reste à votre disposition. Bien cordialement, ${prenom} — CHEP France, Templemars`;
export const phrasesReponse = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salut', texte: 'Bonjour Madame Caron,' },
  { id: 'chep', choix: (db) => choixChep(jeuEleve(db || {}).valeurs.k), juste: 0 },
  { id: 'demande', choix: (db) => choixDemande(db), juste: 0 },
  { id: 'inventaire', choix: (db) => choixInventaire(jeuEleve(db || {}).valeurs.e), juste: 0 },
  { id: 'fin', texte: FIN(prenom) },
] });

// ─────────────────────────────────────────────────────────────── les messages (date du scénario ; au tu entre collègues, au vous avec la cliente)
const SANDRINE = { nom: EQUIPE.sandrine.nom, mail: mailDe('sandrine') };
const HELENE = { nom: CLIENT.contact.nom, mail: CLIENT.contact.mail };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: o.a || prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const merci = (de, texte = 'Bien reçu, merci.') => (prenom, nb, db) => ({ mails: [mail(prenom, de, 'Bien reçu', `${texte}\n\n${de.nom.split(' ')[0]}`, { db, decalage: 1 })] });
// Une enquête corrigée ne rouvre pas le relevé corrigé (resté tel qu'il a été enregistré) : Sandrine le dit, sans dire si c'est juste.
const MERCI_ENQUETE = 'Bien reçu, merci. Ton relevé corrigé, lui, reste tel que tu l’as enregistré.';
export const texteHelene = (db) => {
  const J = jeuEleve(db || {});
  return `Bonjour,\n\nvotre relevé au vendredi 22/01 indique ${J.sRel} palettes CHEP sur notre compte. Notre inventaire de ce matin en compte ${J.sParc} `
    + 'sur notre parc. Nous ne voulons pas payer la location de palettes que nous n’avons pas. Merci de corriger.\n\n'
    + `P.S. Frais du Nord nous dit avoir ${J.valeurs.f} palettes CHEP vides de nos livraisons qui encombrent son quai.\n\n`
    + 'Hélène Caron — Responsable logistique, Endives du Ternois';
};
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, HELENE, 'Votre relevé du 22/01', texteHelene(db),
      { heure: '08:05', a: 'Service relation clients', extra: { pieces: ['inventaire', ...bordereauxDe(db)] } }),
    mail(prenom, SANDRINE, 'Hélène conteste son relevé',
      `Bonjour ${prenom},\n\nHélène conteste son relevé. Reprends tout, document par document, les siens et les nôtres. Dis-moi ce qu’il faut `
        + 'corriger et qui doit le faire, refais son solde, et réponds-lui.\n\nJe te joins notre relevé, le bon de retour de mardi et le rapport '
        + 'de la ligne de tri, avec ses conditions de location.\n\nSandrine',
      { heure: '08:20', extra: { pieces: ['releve', 'bon-retour', 'rapport-tri', 'conditions'], ouvreFiche: FICHES.enquete } }),
  ] }),
  // « Corriger » : un accusé à chaque renvoi, jamais « juste ».
  corrections: { [FICHES.enquete]: merci(SANDRINE, MERCI_ENQUETE), [FICHES.corrige]: merci(SANDRINE), [PHRASES_ID]: merci(HELENE) },
  declencheurs: [
    // L'enquête envoyée (juste ou fausse) : Sandrine passe au solde, sans dire si c'est juste.
    { id: 'enquete-recue', quand: apresFiche(FICHES.enquete),
      semer: (prenom, db) => ({ mails: [mail(prenom, SANDRINE, 'Son solde',
        'Merci. Refais son solde avec tes corrections.\n\nSandrine', { db, decalage: 3, extra: { ouvreFiche: FICHES.corrige } })] }) },
    // Le relevé corrigé enregistré : Hélène relance (la réponse par phrases).
    { id: 'corrige-recu', quand: apresFiche(FICHES.corrige),
      semer: (prenom, db) => ({ mails: [mail(prenom, HELENE, 'Alors ?',
        'Bonjour,\n\nalors ? Où en est notre compte ?\n\nHélène Caron',
        { db, decalage: 5, a: 'Service relation clients', extra: { phrases: phrasesReponse(prenom) } })] }) },
    // La réponse partie : Hélène remercie (neutre).
    { id: 'reponse-partie', quand: apresMail({ a: HELENE.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, HELENE, 'Merci', 'Merci pour votre franchise. Je fais le nécessaire.\n\nHélène Caron',
        { db, decalage: 8, a: 'Service relation clients' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (11, pondérés : 17 + 3 de questions = 20)
// Poids fixés par Cowork sur délégation de Tristan (17/10/2026), codés tels quels (brief §5) : Repérer 7 · Mettre à jour 6 · Ramasse 1 ·
// Répondre 3 · questions 3 (`part`). Rien n'est vrai avant l'envoi : l'inaction vaut 0. Tout attendu est calculé sur le jeu de l'élève.
export const GROUPES = {
  reperer: '① Repérer ce qui explique l’écart',
  maj: '② Mettre à jour le compte',
  ramasse: '③ Organiser la ramasse',
  repondre: '④ Répondre à la cliente',
};
export const POIDS = { retour: 2, client: 2, justes: 1, inventaire: 2, qui: 2, colonnes: 2, solde: 2, frais: 1, 'rep-chep': 1, 'rep-demande': 1, 'rep-inventaire': 1 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = (detail) => (detail ? { status: 'ko', detail } : { status: 'ko' });
const jalonEnquete = (id, groupe, titre, juste) => ({ id, titre, groupe: GROUPES[groupe], poids: POIDS[id], ecran: `fiche:${FICHES.enquete}`,
  verifier(db) { const f = fiche(db, FICHES.enquete); return f.envoye ? (juste(f.v, jeuEleve(db)) ? ok : ko()) : attente; } });
const jalonCorrige = (id, titre, juste) => ({ id, titre, groupe: GROUPES.maj, poids: POIDS[id], ecran: `fiche:${FICHES.corrige}`,
  verifier(db) { if (!fiche(db, FICHES.corrige).envoye) return attente; const r = juste(db); return r === true ? ok : ko(typeof r === 'string' ? r : undefined); } });
const jalonPhrase = (id, titre, ligne) => ({ id, titre, groupe: GROUPES.repondre, poids: POIDS[id], ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); return !r.envoye ? attente : (r.justes.includes(ligne) ? ok : ko()); } });
// Un cadre juste : le type, la correction et le nombre attendus (le nombre n'est pas jugé quand il n'y a rien à corriger).
const typeJuste = (v, c) => enquete(v, c.role).type === c.attendu.type;
const corrJuste = (v, c) => { const e = enquete(v, c.role); return e.corr === c.attendu.corr && (c.attendu.corr === 'aucune' || e.qte === c.attendu.qte); };
const quiJuste = (v, c) => enquete(v, c.role).qui === c.attendu.qui;

export const ETAPES = [
  // ① Repérer (7).
  jalonEnquete('retour', 'reperer', 'Le bon de retour : mal crédité, la correction et son nombre',
    (v, J) => typeJuste(v, J.retour) && corrJuste(v, J.retour)),
  jalonEnquete('client', 'reperer', 'Le document de la cliente qui explique l’écart : ce qu’il est, la correction et son nombre',
    (v, J) => { const c = J.parRole[J.role]; return typeJuste(v, c) && corrJuste(v, c); }),
  jalonEnquete('justes', 'reperer', 'Les documents justes, laissés sans correction',
    (v, J) => ['b1', 'b2'].every((r) => typeJuste(v, J.parRole[r]) && enquete(v, r).corr === 'aucune')),
  jalonEnquete('inventaire', 'reperer', 'D’où vient l’écart avec son inventaire', (v) => v.inventaire === 'europe'),
  // ② Mettre à jour (6) : qui corrige (les deux cadres en anomalie seulement), puis le relevé corrigé jugé sur SON enquête.
  jalonEnquete('qui', 'maj', 'Qui fait chaque correction', (v, J) => quiJuste(v, J.retour) && quiJuste(v, J.parRole[J.role])),
  // La bonne colonne : la quantité (> 0) du côté de SA correction, 0 de l'autre. On ne rejuge pas la quantité (jalons 1 et 2), et un élève qui
  // corrige une quantité de son enquête après le bilan ne voit pas son relevé corrigé, resté tel quel, retomber. Sans aucune ligne, rien n'est
  // « dans la bonne colonne ».
  jalonCorrige('colonnes', 'Le relevé corrigé : chaque correction dans la bonne colonne, d’après ton enquête', (db) => {
    const L = correctionsEleve(db);
    if (!L.length) return 'aucune correction dans ton enquête : le relevé n’a pas de ligne';
    const F = lireFeuille(FICHES.corrige, BLOC_CORRIGE, db);
    const faux = L.flatMap((l, i) => {
      const b = F.valeur(casePlus(i)), c = F.valeur(caseMoins(i));
      const [bonne, autre, refBonne] = l.sens === 'plus' ? [b, c, casePlus(i)] : [c, b, caseMoins(i)];
      return Number.isFinite(bonne) && bonne > 0 && autre === 0 ? [] : [refBonne];
    });
    return faux.length ? `À revoir : ligne${faux.length > 1 ? 's' : ''} ${faux.map((r) => r.slice(1)).join(', ')}.` : true;
  }),
  // Le solde corrigé = S_rel + SES ajouts − SES retraits (tels qu'il les a écrits dans la grille), l'écart restant = l'inventaire − SON solde
  // corrigé ; les deux par une formule. Jamais comparé au solde réel.
  jalonCorrige('solde', 'Le relevé corrigé : le solde et l’écart restant, par formule, d’après tes corrections', (db) => {
    const L = correctionsEleve(db), n = L.length;
    if (!n) return 'aucune correction dans ton enquête';
    const F = lireFeuille(FICHES.corrige, BLOC_CORRIGE, db), J = jeuEleve(db);
    const brut = (ref) => String(F.brut(ref) == null ? '' : F.brut(ref));
    if (!estFormule(brut(caseSoldeCorrige(n))) || !estFormule(brut(caseEcart(n)))) return 'le solde corrigé et l’écart restant se calculent par une formule (elle commence par « = »)';
    const cases = [...Array(n).keys()].flatMap((i) => [F.valeur(casePlus(i)), F.valeur(caseMoins(i))]);
    if (cases.some((x) => x == null || !Number.isFinite(x))) return 'une case de correction est vide ou illisible';
    const att = J.sRel + [...Array(n).keys()].reduce((s, i) => s + F.valeur(casePlus(i)) - F.valeur(caseMoins(i)), 0);
    const s = F.valeur(caseSoldeCorrige(n)), e = F.valeur(caseEcart(n));
    if (!Number.isFinite(s) || Math.abs(s - att) > 0.01) return 'le solde corrigé ne vaut pas le solde du relevé + tes ajouts − tes retraits';
    if (!Number.isFinite(e) || Math.abs(e - (J.sParc - s)) > 0.01) return 'l’écart restant ne vaut pas l’inventaire − ton solde corrigé';
    return true;
  }),
  // ③ Organiser la ramasse (1).
  jalonEnquete('frais', 'ramasse', 'La demande de Frais du Nord', (v) => v.frais === 'tournee'),
  // ④ Répondre (3) : ce qui part chez la cliente, jugé sur le réel.
  jalonPhrase('rep-chep', 'La réponse : la correction de CHEP', 'chep'),
  jalonPhrase('rep-demande', 'La réponse : ce qu’elle doit faire elle-même', 'demande'),
  jalonPhrase('rep-inventaire', 'La réponse : l’écart restant', 'inventaire'),
  // Les cas bonus du confirmé (la seconde pièce de la banque) : sans poids ni groupe, `null` quand l'élève ne l'a pas reçue (caché à l'élève).
  ...[['type', 'ce qu’il est', typeJuste], ['qte', 'la correction et son nombre', corrJuste], ['qui', 'qui la fait', quiJuste]].map(([k, quoi, juge]) => ({
    id: `bonus-${k}`, bonus: true, ecran: `fiche:${FICHES.enquete}`, titre: `Le second document de la cliente : ${quoi}`,
    verifier(db) {
      const J = jeuEleve(db);
      if (!TIRAGE_DE(db) || !J.rolesBonus.length) return null;
      const f = fiche(db, FICHES.enquete);
      return f.envoye ? (juge(f.v, J.parRole[J.rolesBonus[0]]) ? ok : ko()) : attente;
    } })),
];
// Le bonus n'existe que chez un élève qui a un tirage rangé avec la pièce en plus (la base vide du contrôle au chargement n'en a pas).
const TIRAGE_DE = (db) => !!(db && db.tirages && db.tirages[ID]);

// ─────────────────────────────────────────────────────────────── les pastilles d'étape (« fait », jamais « juste »)
export const PASTILLES = [
  { libelle: 'Enquêter', fait: dejaEnvoyee(FICHES.enquete) },
  { libelle: 'Refaire le solde', fait: dejaEnvoyee(FICHES.corrige) },
  { libelle: 'Répondre à la cliente', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];

// ─────────────────────────────────────────────────────────────── l'accueil
export const MENTION = 'Réels : CHEP et son centre de service de Templemars, le fonctionnement du pool (l’émetteur déclare ses transferts, les '
  + 'palettes collectées sont triées et contrôlées), les palettes Europe et LPR hors du pool CHEP, les articles du Code civil. Construits : '
  + 'Endives du Ternois, Hélène Caron, Frais du Nord et les autres plates-formes, Sandrine, Grégory et son erreur, le portail, le rapport de tri, '
  + 'tous les numéros et toutes les quantités.';
export const ACCUEIL = {
  titre: 'Le relevé contesté',
  kpis: ['mail'],
  etapes: [
    ['Lire les messages', 'Menu Messagerie : Hélène Caron conteste son relevé, Sandrine te dit quoi faire.'],
    ['① Enquêter', 'Portail clients — Enquête : pour chaque document de la semaine, ce que dit notre relevé, la correction, qui la fait.'],
    ['② Refaire le solde', 'Portail clients — Relevé corrigé : tes corrections dans les bonnes colonnes, puis les formules.'],
    ['③ Répondre à la cliente', 'Messagerie : réponds-lui en choisissant les phrases, honnêtement.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance
export const OPTIONS = {
  menu: [],
  exercice: 'Séance 3 : le relevé contesté',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_ENQUETE, FICHE_CORRIGE],
  pastilles: PASTILLES,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
// Pour le corrigé et les tests.
export { jeuEleve, correctionsEleve, valeurDeSaFeuille, ROLES, BANQUE_CLIENT, caseSoldeCorrige, caseEcart, lireNombre, BLOC_GRILLE, ech };
