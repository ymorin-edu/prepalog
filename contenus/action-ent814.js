// ENT-8.14 — Action, évaluation « ranger et compter dans le site d'évaluation » : le contenu de la séance (brief `docs/briefs/ENT-8.14-action-evaluation-stock.md` ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-palettier.md` §3 et §4, qui passent avant le brief là où elles diffèrent). CAP OL, ÉVALUATION de
// CAP-C1.5 (mettre en stock : repérer, ranger, voir une plaque de charge, traiter une adresse prise, scanner, compter, signaler un écart), en copie rendue
// (`copie: true`). Univers commun : `contenus/action.js` (lu, jamais modifié ici). Données pures (palettiers des deux sites, tirage, entrepôt d'un élève, choix de la
// fiche) : `contenus/action-ent814-donnees.js`. Activité : `activites/action-evaluation-stock.js`. Questions : `contenus/questions/ENT-8.14.js`. Corrigé :
// `contenus/corriges/ENT-8.14.js`.
//
// Un mardi, 6 h (AUCUNE date écrite, décision de Tristan du 21/10/2026), dans le MÊME site tiré qu'ENT-8.5, 8.6 et 8.10 (Onnaing / GXO, ou Belleville-en-Beaujolais /
// Kuehne+Nagel) : « De retour chez {prestataire} à {site} pour une journée. » L'élève range la réception d'hier, puis compte quelques adresses, puis signale
// l'écart. Avant de commencer (noté, 4 points, « Le droit » à gauche) → ① Le plan de l'entrepôt, mode `palettier`, phase « rangement » (5 palettes : deux au sol,
// une en réserve à confier, une dont l'adresse dépasserait la plaque à signaler, une dont l'adresse est prise) → « Passer au comptage » → ② le même plan, phase
// « comptage » (4 adresses, 3 conformes et 1 écart, à l'aveugle, au Terminal) → ③ la fiche « Signaler l'écart » (UNE LIGNE PAR ÉCART CONFIRMÉ de l'élève) → « Rendre ma
// copie » (le bandeau du moteur : `rendCopie: false`, l'entrepôt ne rend jamais la copie).
// Copie rendue : rien à l'écran ne dit juste ou faux (ni verdict sur les cartes ni sur la liste, ni « Les règles », ni bilan, ni « Corriger », aucun mot cliquable) ; le
// Terminal dit « Confirmé. », « Ce n'est pas l'adresse de cette palette. », « Quantité différente. Recompter ou confirmer ? » : c'est l'outil, pas une aide.
// La barre « Étape suivante » n'existe pas en évaluation (moteur) : l'ordre se lit au menu « Mon poste », et les messages du tuteur annoncent l'écran suivant.
//
// LA FICHE ET SES JALONS (même choix qu'ENT-8.12) : la fiche est une fonction de la base (`blocs(db)`), donc calculée sur une base VIDE au chargement (zéro ligne) : les
// jalons ne peuvent pas être dérivés de ses blocs. La séance les DÉCLARE, à ids fixes : `fiche-signaler` (1 point : TOUTES les lignes de SA fiche disent « je le signale »)
// et `fiche-cause` (1 point : toutes les lignes ont une cause juste POUR LEUR SENS). Une fiche sans ligne (aucun écart confirmé) : les deux faux. Une ligne de trop (un compte
// faux confirmé sur une adresse conforme) est jugée comme les autres : son erreur est déjà payée au jalon `compte-`.
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) : voir l'en-tête de `contenus/action-ent814-donnees.js` et `MENTION`. « Le droit » : C. trav. L4122-1, alinéas 1 et 3, RECOPIÉ d'ENT-8.11
// (relu sur code.travail.gouv.fr, le Code du travail numérique qui reprend Légifrance, le 22/10/2026 ; LEGIARTI000006903153, en vigueur depuis le 01/05/2008).

import { apresFiche, apresGeste } from '../core/declencheurs.js';
import { etapesPalettier, ecartsConfirmes, etatComptage } from '../core/types/entrepot.js';
import { QUESTIONS, TUTEUR } from './questions/ENT-8.14.js';
import * as ACTION from './action.js';
import { STYLE_DOCUMENTS, PIED, ech } from './action.js';
import {
  ID, ID_VOLET, ENTREPOT_ID, FICHE_ID, GESTE, siteEleve, equipeDe, entrepotDe, FAIRE, FAIRE_JUSTE, CAUSES, causesJustes, melangerPour, jeuDeBase, PRODUITS,
} from './action-ent814-donnees.js';

export { ID, ENTREPOT_ID, FICHE_ID };

// ─────────────────────────────────────────────────────────────── l'entreprise de CETTE séance (le site est tiré : bandeau neutre)
export const ENTREPRISE = { ...ACTION.ENTREPRISE,
  sousTitre: 'Un nouvel entrepôt d’Action — commerce à petits prix', exercice: 'Évaluation : ranger et compter dans un nouveau site' };
export const VOCAB = { ...ACTION.VOCAB, mailDomain: 'action-stage.example' };
export const EQUIPE_814 = { tuteur: TUTEUR };

// ─────────────────────────────────────────────────────────────── l'heure du scénario : « un mardi, 6 h », sans date
// Aucune date n'est écrite (ni dans les textes, ni dans un document) ; la Messagerie affiche pourtant l'horodatage de chaque message : on prend le DERNIER MARDI (aujourd'hui si
// on est mardi) à l'heure du scénario, plus le temps réellement passé depuis l'ouverture. Même compromis qu'ENT-8.11 et 8.12 (dit à Tristan).
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 7 - 2) % 7));
  d.setHours(h, mn, 0, 0);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return d.getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const O = { copie: true };   // en évaluation, un seul niveau (standard) : les lectures de l'entrepôt le disent
export const ecartsDe = (db) => ecartsConfirmes(db, entrepotDe, O);
export const comptageFini = (db) => !!etatComptage(db, entrepotDe, O).fini;
const etatPlan = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID]) || null;
export const rangementValide = (db) => !!(etatPlan(db) && etatPlan(db).valide);
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// ─────────────────────────────────────────────────────────────── les documents (dessins en traits, construits ; aucune image nouvelle)
const PIED_DESSIN = 'Dessin construit pour l’exercice.';
const T = 'fill="none" stroke="#2b2824" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
const TXT = 'stroke="none" fill="#2b2824"';
// La plaque de charge, fixée au bout du rack : des valeurs d'exemple, ni celles d'Onnaing ni celles de Belleville.
const SVG_PANNEAU = `<svg class="ac814-fig" viewBox="0 0 380 240" role="img" aria-label="Le bout d’un rack ; un panneau y est fixé avec trois lignes : niveau 2, 1 500 kilos ; niveau 3, 1 100 kilos ; niveau 4, 900 kilos">
  <g ${T}><path d="M60 230 V10 M110 230 V10"/><path d="M60 40 L110 70 M110 70 L60 100 M60 100 L110 130 M110 130 L60 160 M60 160 L110 190" stroke-width="1.4"/>
    <path d="M20 230 H360"/><rect x="128" y="40" width="226" height="150" rx="6" fill="#fdfbf7" stroke-width="2.6"/><path d="M110 70 H128 M110 160 H128"/></g>
  <text x="241" y="66" font-size="15" font-weight="900" text-anchor="middle" ${TXT}>CHARGE MAX PAR NIVEAU</text>
  ${[[2, '1 500'], [3, '1 100'], [4, '900']].map(([n, kg], i) => `<text x="150" y="${100 + i * 30}" font-size="16" ${TXT}>Niveau ${n}</text><text x="334" y="${100 + i * 30}" font-size="16" font-weight="800" text-anchor="end" ${TXT}>${kg} kg</text>`).join('')}
  </svg>`;
// Une palette chargée vue de face (des cartons sur une palette), en traits.
const palette = (x, y, w, h) => {
  const ch = h - 10, cw = w / 3;
  let s = `<rect x="${x}" y="${y + ch}" width="${w}" height="10"/><path d="M${x + 6} ${y + h} v-4 M${x + w / 2} ${y + h} v-4 M${x + w - 6} ${y + h} v-4"/>`;
  [0, 1].forEach((r) => [0, 1, 2].forEach((k) => { s += `<rect x="${x + k * cw}" y="${y + r * ch / 2}" width="${cw}" height="${ch / 2}"/>`; }));
  return s;
};
// L'allée : deux rangées de racks vues de face, une palette posée au milieu du passage. Personne.
const SVG_ALLEE = `<svg class="ac814-fig" viewBox="0 0 420 260" role="img" aria-label="Une allée d’entrepôt entre deux rangées de racks, vue de face : une palette chargée est posée au milieu de l’allée, sur le passage">
  <defs><pattern id="ac814sol" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="#2b2824" stroke-width="0.8"/></pattern></defs>
  <g ${T}>
    <path d="M20 250 L170 120 M400 250 L250 120 M170 120 H250"/>
    <path d="M20 250 V20 L170 60 V120 M60 216 V30 M110 172 V45 M150 138 V56 M20 90 L170 85 M20 170 L170 105"/>
    <path d="M400 250 V20 L250 60 V120 M360 216 V30 M310 172 V45 M270 138 V56 M400 90 L250 85 M400 170 L250 105"/>
    ${palette(145, 150, 130, 76)}
  </g>
  <rect x="135" y="227" width="150" height="7" fill="url(#ac814sol)" stroke="none"/>
  <text x="210" y="252" font-size="12" text-anchor="middle" ${TXT}>le passage entre les racks</text></svg>`;
const dessin = (id, titre, svg, pied = PIED_DESSIN) => ({ id, titre, court: titre, html: `<article class="ac-doc" aria-label="${ech(titre)}">${svg}${PIED(pied)}</article>` });
const DOC_PANNEAU = dessin('panneau', 'Au bout du rack', SVG_PANNEAU);
const DOC_ALLEE = dessin('allee', 'Un passage', SVG_ALLEE);

// « Ton stage » : le site, le jour, l'équipe, qui possède quoi (aucune réponse d'un jalon).
const docStage = (db) => { const S = siteEleve(db), Q = equipeDe(S);
  return `<article class="ac-doc" aria-label="Ton stage">
    <p class="ac-t">Ton stage chez ${ech(S.prestataire)}</p>
    <p class="ac-st">Un mardi, 6 h</p>
    <p>De retour chez <b>${ech(S.prestataire)}</b> à <b>${ech(S.site)}</b> pour une journée.</p>
    <p>Dans cet entrepôt Action, les chariots et l’informatique sont à Action ; l’équipe est celle de ${ech(S.prestataire)}, qui fait tourner l’entrepôt pour Action. ${ech(Q.tuteur)}, ${ech(Q.chef)}, est ton tuteur ; ${ech(Q.cariste)}, cariste, monte les palettes en hauteur.</p>
    ${PIED(`${ech(Q.tuteur)} et ${ech(Q.cariste)} sont construits pour l’exercice ; l’organisation de l’entrepôt est construite aussi.`)}
  </article>`; };
// « Le droit » : C. trav. L4122-1, alinéas 1 et 3, RECOPIÉ d'ENT-8.11 (voir l'en-tête).
export const TEXTE_L4122_1 = ['Conformément aux instructions qui lui sont données par l’employeur, dans les conditions prévues au règlement intérieur pour les '
  + 'entreprises tenues d’en élaborer un, il incombe à chaque travailleur de prendre soin, en fonction de sa formation et selon ses possibilités, de sa '
  + 'santé et de sa sécurité ainsi que de celles des autres personnes concernées par ses actes ou ses omissions au travail.', '[…]',
  'Les dispositions du premier alinéa sont sans incidence sur le principe de la responsabilité de l’employeur.'];
export const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-t">Le droit : les instructions de l’employeur</p>
    <p class="ac-art"><b>Code du travail, article L4122-1</b> (alinéas 1 et 3)</p>
    <div class="ac-cite">${TEXTE_L4122_1.map((p, i) => `<p>${i === 0 ? '« ' : ''}${p}${i === TEXTE_L4122_1.length - 1 ? ' »' : ''}</p>`).join('')}</div>
    ${PIED('Texte réel, recopié du Code du travail numérique (code.travail.gouv.fr, qui reprend Légifrance), consulté le 22/10/2026.')}
  </article>` };
// À gauche de la fiche : SES écarts confirmés, avec son compte et — maintenant seulement — le nombre du système. Calculé à chaque dessin.
const DOC_ECARTS = { id: 'ecarts-doc', titre: 'Mes comptes et le système', court: 'Mes écarts',
  html: (db) => {
    const E = ecartsDe(db);
    return `<article class="ac-doc" aria-label="Mes comptes et le système">
      <p class="ac-t">Mes comptes et le système</p>
      <p class="ac-st">Les adresses où ton compte ne colle pas avec le système.</p>
      ${E.length ? `<table class="ac814-tab"><thead><tr><th>Adresse</th><th>Produit</th><th>Ton compte</th><th>Le système</th></tr></thead><tbody>${E.map((e) => `<tr>
        <td><b>${ech(e.adresse)}</b></td><td>${ech(e.produit)}</td><td>${e.compte}</td><td>${e.systeme}</td></tr>`).join('')}</tbody></table>`
        : '<p>Sur toutes les adresses que tu as comptées, ton compte est le même que celui du système.</p>'}
      ${PIED('Les nombres du système et les écarts sont construits pour l’exercice.')}
    </article>`;
  } };

export const STYLE = `${STYLE_DOCUMENTS}
.ac-art{margin:10px 0 2px; font-size:.95rem}
.ac-cite{margin:2px 0 10px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.ac-cite p{margin:0 0 4px}
.ac814-fig{display:block; width:100%; max-width:440px; height:auto; margin:4px auto 10px; color:#2b2824}
.ac814-fig text{font-family:inherit}
.ac814-tab{width:100%; border-collapse:collapse; margin:4px 0 8px; font-size:.92rem}
.ac814-tab th,.ac814-tab td{border:1px solid #cdc7b9; padding:4px 8px; text-align:left}
.ac814-tab td:first-child{white-space:nowrap}
.ac814-tab th{font-size:.8rem; color:var(--douce); font-weight:700}
`;
export const DOCUMENTS = [{ id: 'stage', titre: 'Ton stage', court: 'Ton stage', html: docStage }, DOC_DROIT, DOC_PANNEAU, DOC_ALLEE, DOC_ECARTS];

// ─────────────────────────────────────────────────────────────── ③ la fiche « Signaler l'écart » : une ligne par écart confirmé de l'élève
// Les textes fixes du moteur (sous-titre, bouton d'envoi) ne connaissent pas le site : ils disent « ton tuteur ».
const titreLigne = (e) => `${e.adresse} · ${e.produit} : tu as compté ${e.compte}, le système dit ${e.systeme}`;
export const FICHE = {
  id: FICHE_ID, libelle: 'Signaler l’écart', titre: 'Signaler l’écart',
  sousTitre: 'À gauche : tes comptes et ceux du système. Pour chaque écart, dis ce que tu fais et ce qui a pu se passer.',
  documents: ['ecarts-doc'], largeurDocs: 0.9,
  bouton: 'Ouvrir la fiche « Signaler l’écart »',
  quand: comptageFini,
  blocs: (db) => {
    const E = ecartsDe(db);
    if (!E.length) return [{ type: 'encadre', titre: 'Aucun écart', texte: 'Sur les adresses que tu as comptées, aucun écart avec le système : il n’y a rien à ajouter. Envoie la fiche à ton tuteur.' }];
    return E.map((e) => ({ type: 'cadre', titre: titreLigne(e), blocs: [
      { type: 'liste', id: `faire-${e.rang}`, lib: 'Que fais-tu ?', vide: 'Choisir…', manque: `ce que tu fais pour ${e.adresse}`, choix: melangerPour(db, `faire-${e.rang}`, FAIRE) },
      { type: 'liste', id: `cause-${e.rang}`, lib: 'Ce qui a pu se passer', vide: 'Choisir…', manque: `ce qui a pu se passer à ${e.adresse}`,
        choix: melangerPour(db, `cause-${e.rang}`, CAUSES[e.sens].map((c) => ({ v: c.v, lib: c.lib }))) },
    ] }));
  },
  envoi: { bouton: 'Envoyer à ton tuteur', a: 'ton tuteur', suite: 'Merci, c’est noté.', incomplet: true },
};

// ─────────────────────────────────────────────────────────────── les messages du tuteur (au tu ; l'heure du scénario ; jamais juste ni faux ; aucune date)
const mail = (prenom, db, subject, text, o = {}) => { const Q = equipeDe(siteEleve(db));
  return { folder: 'in', ts: tsScenario(o.heure || '06:00', { db, decalage: o.decalage || 0 }),
    from: Q.tuteur, fromMail: Q.mailTuteur, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) }; };
const signeDe = (db) => equipeDe(siteEleve(db)).tuteur;
export const SUJETS = { accueil: 'Ce matin : ranger, puis compter', comptage: 'Maintenant, on compte', ecart: 'Ton comptage', fin: 'Merci' };
export const VOLET = {
  id: ID_VOLET,
  // L'accueil : texte du brief (§4) et une phrase du retour chez le prestataire.
  semer: (prenom, db) => { const S = siteEleve(db), Q = equipeDe(S);
    return { mails: [mail(prenom, db, SUJETS.accueil,
      `Bonjour ${prenom}, content de te revoir chez ${S.prestataire} ! Ce matin : la réception d’hier à ranger, puis quelques adresses à compter. Tu connais le travail.\n\n`
        + `Le Plan de l’entrepôt est dans le menu. ${Q.cariste} monte les palettes en hauteur.\n\n${Q.tuteur}`)] }; },
  declencheurs: [
    // « Passer au comptage » (le bouton de la phase) : les quatre adresses.
    { id: 'comptage', quand: apresGeste(GESTE('phase:comptage')),
      semer: (prenom, db) => ({ mails: [mail(prenom, db, SUJETS.comptage, `Merci. Maintenant, compte ces 4 adresses.\n\n${signeDe(db)}`, { heure: '06:40' })] }) },
    // « Terminer le comptage » : la fiche s'ouvre (le message ne dit ni s'il y a un écart ni de quel côté).
    { id: 'ecart', quand: apresGeste(GESTE('compte:fin')),
      semer: (prenom, db) => ({ mails: [mail(prenom, db, SUJETS.ecart,
        `Merci. Voici la fiche « Signaler l’écart » : ton compte et celui du système sont à gauche. Dis-moi, pour chaque écart, ce que tu fais et ce qui a pu se passer.\n\n${signeDe(db)}`,
        { heure: '07:10', extra: { ouvreFiche: FICHE_ID } })] }) },
    // La fiche envoyée (juste ou non) : la fin, et la remise.
    { id: 'fin', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, db, SUJETS.fin,
        `Merci, c’est noté.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\n${signeDe(db)}`, { heure: '07:20' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids du brief §5, validés par Tristan le 21/10/2026 : somme 20 avec l'ouverture, `part: 4`)
// Repérer les adresses 3 (place-P1 à P3, 1 chacune) · Ranger et voir la plaque 4 (pasPoseHaut 1, signale-P4 3) · Adresse prise 2 (adresseLibre-P5) · Scanner 3 (scan-P1, P2,
// P3, P5, 0,75 chacune ; P4, signalée sans nouvelle adresse, n'a pas de scan) · Comptages justes 2 (compte-1 à 4, 0,5 chacune) · Écart signalé 2 (fiche-signaler 1, fiche-cause 1).
// SANS POINT (`poids: 0`, sans ligne au bandeau) : `charge` (la plaque dépassée se lit déjà dans `signale-P4`), les `recompte-<rang>` (le Terminal PROPOSE de recompter, en copie
// aussi : c'est l'outil, décision de Tristan 21/10 ; seul le compte final est noté) et `scanAvant`. Rien n'est vrai avant « Valider » (rangement) ni « Terminer » (comptage)
// ni avant l'envoi (fiche) : l'inaction vaut 0. `pasPoseHaut` (aucune pose tentée au-dessus du sol ET toutes les palettes traitées : posée, confiée ou SIGNALÉE) : une palette
// laissée en réception (P4 non signalée comprise) le rend faux, c'est voulu.
export const GROUPES = { adresses: 'Repérer les adresses du site', plaque: 'Ranger et voir la plaque', prise: 'L’adresse prise', scanner: 'Scanner', comptages: 'Comptages justes',
  ecart: 'Écart signalé, avec une cause' };
export const POIDS = {
  'place-P1': 1, 'place-P2': 1, 'place-P3': 1,
  pasPoseHaut: 1, 'signale-P4': 3,
  'adresseLibre-P5': 2,
  'scan-P1': 0.75, 'scan-P2': 0.75, 'scan-P3': 0.75, 'scan-P5': 0.75,
  'compte-1': 0.5, 'compte-2': 0.5, 'compte-3': 0.5, 'compte-4': 0.5,
  'fiche-signaler': 1, 'fiche-cause': 1,
};
const SANS_POINT = ['charge', 'recompte-1', 'recompte-2', 'recompte-3', 'recompte-4', 'scanAvant'];
// Le nom du produit de l'élève (titres du bilan, jamais le titre commun : la liste vient de la déclaration de référence).
const nomDe = (db, id) => PRODUITS[jeuDeBase(db).palettes[id].produit].nom;
const avecNom = (id, quoi) => [`${id} ${quoi}`, (db) => `${id} (${nomDe(db, id)}) ${quoi}`];
const ligneDe = (db, rang) => jeuDeBase(db).comptage[rang - 1];
const PLAN_JALON = {
  'place-P1': [GROUPES.adresses, ...avecNom('P1', 'rangée à son adresse')],
  'place-P2': [GROUPES.adresses, ...avecNom('P2', 'rangée à son adresse')],
  'place-P3': [GROUPES.adresses, ...avecNom('P3', 'confiée au cariste à son adresse, et montée')],
  pasPoseHaut: [GROUPES.plaque, 'Aucune palette posée soi-même au-dessus du sol, et toutes les palettes traitées'],
  'signale-P4': [GROUPES.plaque, ...avecNom('P4', 'signalée « charge dépassée », ni posée ni confiée là')],
  'adresseLibre-P5': [GROUPES.prise, ...avecNom('P5', 'rangée à l’adresse libre demandée')],
  ...Object.fromEntries(['P1', 'P2', 'P3', 'P5'].map((id) => [`scan-${id}`, [GROUPES.scanner, ...avecNom(id, 'scannée à son adresse')]])),
};
// L'ordre d'AFFICHAGE (le bandeau, le Suivi) : bloc par bloc, comme le brief §5 ; le moteur donne les siens dans l'ordre des palettes (chaque scan après son place-).
const ORDRE = ['place-P1', 'place-P2', 'place-P3', 'pasPoseHaut', 'signale-P4', 'charge', 'adresseLibre-P5', 'scan-P1', 'scan-P2', 'scan-P3', 'scan-P5',
  'compte-1', 'compte-2', 'compte-3', 'compte-4', 'recompte-1', 'recompte-2', 'recompte-3', 'recompte-4', 'scanAvant'];
function jalonsEntrepot() {
  const L = etapesPalettier(entrepotDe, { copie: true });
  const ids = L.map((e) => e.id);
  const manque = ORDRE.filter((id) => !ids.includes(id)), deTrop = ids.filter((id) => !ORDRE.includes(id));
  if (manque.length || deTrop.length || L.some((e) => e.bonus)) {
    throw new Error(`ENT-8.14 : les jalons du plan ne sont pas ceux attendus (manquent : ${manque.join(', ') || '—'} ; en trop : ${deTrop.join(', ') || '—'}) — le chantier E-7 est-il livré ?`);
  }
  return ORDRE.map((id) => {
    const e = L.find((x) => x.id === id);
    if (SANS_POINT.includes(id)) return Object.assign(e, { poids: 0, compte: false });
    const m = /^compte-(\d)$/.exec(id);
    if (m) { const r = Number(m[1]); return Object.assign(e, { titre: `Compter l’adresse n° ${r}`, titreBilan: (db) => `Compter ${ligneDe(db, r).adresse} (${PRODUITS[ligneDe(db, r).produit].court})`,
      groupe: GROUPES.comptages, poids: POIDS[id] }); }
    const [groupe, titre, titreBilan] = PLAN_JALON[id];
    return Object.assign(e, { titre, titreBilan: titreBilan || titre, groupe, poids: POIDS[id] });
  });
}
// Les lignes de la fiche que les jalons jugent : toutes (aucun bonus en évaluation).
const aucune = (db) => !ecartsDe(db).length;
export const ETAPES = [
  ...jalonsEntrepot(),
  // Les jalons de la fiche, déclarés ICI (la fiche est une fonction de la base : voir l'en-tête) ; jugés sur SES écarts confirmés, jamais sur les écarts réels.
  { id: 'fiche-signaler', titre: 'Signaler chaque écart à son tuteur', groupe: GROUPES.ecart, poids: POIDS['fiche-signaler'], ecran: `fiche:${FICHE_ID}`,
    titreBilan: 'Signaler à son tuteur chaque écart de sa fiche, sans corriger le stock soi-même',
    verifier(db) {
      if (!envoyee(db, FICHE_ID)) return attente;
      if (aucune(db)) return ko;
      return ecartsDe(db).every((e) => valeurDe(db, FICHE_ID, `faire-${e.rang}`) === FAIRE_JUSTE) ? ok : ko;
    } },
  { id: 'fiche-cause', titre: 'Une cause possible pour chaque écart', groupe: GROUPES.ecart, poids: POIDS['fiche-cause'], ecran: `fiche:${FICHE_ID}`,
    titreBilan: 'Une cause possible pour chaque écart de sa fiche, selon le sens de l’écart',
    verifier(db) {
      if (!envoyee(db, FICHE_ID)) return attente;
      if (aucune(db)) return ko;
      return ecartsDe(db).every((e) => causesJustes(e.sens).includes(valeurDe(db, FICHE_ID, `cause-${e.rang}`))) ? ok : ko;
    } },
];

// ─────────────────────────────────────────────────────────────── pastilles, ordre des écrans, accueil, options
export const PASTILLES = [
  { libelle: 'Ranger', fait: rangementValide },
  { libelle: 'Compter', fait: comptageFini },
  { libelle: 'Signaler l’écart', fait: (db) => envoyee(db, FICHE_ID) },
];
// L'ordre des écrans de travail (menu « Mon poste » ; le moteur ne montre pas la barre « Étape suivante » en évaluation). Deux étapes sur le même écran : le plan.
export const SUITE = [
  { vue: 'entrepot', libelle: 'Ranger les palettes', fait: rangementValide },
  { vue: 'entrepot', libelle: 'Compter les adresses', fait: comptageFini },
  { vue: 'fiche', libelle: 'Signaler l’écart', fait: (db) => envoyee(db, FICHE_ID) },
];
export const MENTION = 'Réels : Action ; GXO, qui fait tourner l’entrepôt Action d’Onnaing (réception, stockage, préparation, expédition, retours) ; Kuehne+Nagel, qui fait tourner celui de '
  + 'Belleville-en-Beaujolais ; le Code du travail. Construits pour l’exercice : le palettier de chaque site (allées, travées, niveaux, plaques de charge), les adresses, le stock du système, '
  + 'le Terminal, les palettes, les comptages et l’écart, ton tuteur ou ta tutrice et le cariste, l’organisation de l’entrepôt (matériel d’Action, équipe du prestataire), les produits (sans marque) et leurs poids.';
export const ACCUEIL = {
  titre: 'Évaluation : ranger et compter dans un nouveau site',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de ton tuteur', 'Menu Messagerie.'],
    ['① Ranger', 'Plan de l’entrepôt : range les palettes de la réception, puis clique « Passer au comptage ».'],
    ['② Compter', 'Compte les adresses de la liste « À compter », avec le Terminal.'],
    ['③ Signaler l’écart', 'Remplis la fiche « Signaler l’écart » et envoie-la à ton tuteur.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION],
  ],
};
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Évaluation : ranger et compter dans un nouveau site',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  equipe: EQUIPE_814,
  questions: QUESTIONS,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiche: FICHE,
  entrepot: entrepotDe,
  pastilles: PASTILLES,
};
