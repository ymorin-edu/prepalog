// ENT-9.2 — CHEP, « un retour à contrôler, une ramasse à organiser » : le contenu de la séance (brief
// `docs/briefs/ENT-9.2-chep-ramasse-et-retours.md`). Données (tirage des piles et de la pièce `dernier`, tournée, attendus) :
// `contenus/chep-ent92-donnees.js`. Univers commun : `contenus/chep.js` (lu, jamais modifié ici). Carte : `contenus/chep-carte.js`.
// Activité : `activites/chep-ramasse-retours.js`. Questions : `contenus/questions/ENT-9.2.js`. Corrigé : `contenus/corriges/ENT-9.2.js`.
//
// Mardi 19 janvier 2027. L'élève, alternant(e) au service relation clients et flux du centre CHEP de Templemars, en GUIDAGE de C2.5 :
//   MATIN (8 h, Grégory Vandamme, quai des retours)
//   ① contrôle le retour d'Opale Frais (vue quai iso, piles de palettes vides) : compter chaque pile, repérer les palettes d'un autre
//      pool et les palettes abîmées, décider, écrire les réserves sur le bon de collecte, faire signer, clore ;
//   ② prépare le crédit d'Opale Frais (fiche `credit`, le bon avec SES réserves à gauche) ;
//   APRÈS-MIDI (14 h, Yannick Desmet, exploitation)
//   ③ prépare la ramasse du mercredi 20/01 (fiche `besoin` : capacité du camion, Frais du Nord, total des autres sites) ;
//   ④ construit la tournée de ramasse sur la carte du Nord (vue Tournée, profil de charge en marches, horaires d'enlèvement, un site
//      à reporter à vendredi), puis l'envoie à Yannick.
// Rien n'est jugé à l'écran pendant le travail ; Grégory et Yannick reprennent ce que l'élève a écrit, sans corriger (règle du
// 10/10/2026). « Une erreur ne se paie qu'une fois » : le crédit est jugé sur SON contrôle, la tournée sur SA tournée.
//
// VÉRIFIÉ (coordination §2) : CHEP, son centre de Templemars, le tri et le contrôle systématiques des palettes collectées, la réparation
// des non conformes, la collecte sur avis des distributeurs, en camions complets dans les grandes plates-formes, souvent sous-traitée ;
// 900 transports par jour et 5 millions de km à vide évités en 2025 ; une palette pèse environ 25 kg (2017) ; le Code civil, art. 1732 ;
// la règle du contrat type sur les supports de charge (CITÉE par l'OTRE le 22/03/2023 : l'article exact n'a pas été relu).
// CONSTRUIT : Grégory, Yannick, Sandrine, Opale Frais, Transports Lys-Escaut, les plates-formes, le quai des retours (un dessin), les piles
// et leurs histoires, les numéros, les avis de vides et leurs heures, les horaires d'enlèvement, la règle « on reporte le site qui a
// signalé le plus tard », la capacité (26 × 15), la vitesse moyenne et le temps d'enlèvement. Ce que deviennent ensuite les palettes
// d'un autre pool (« mises de côté ») n'a pas été vérifié.

import { apresFiche, apresGeste } from '../core/declencheurs.js';
import { jalonsQuai, comptePile, decisionPile } from '../core/types/quai.js';
import { projection, palettePile, PAL_VIDE } from '../core/iso.js';
import { QUESTIONS } from './questions/ENT-9.2.js';
import { EQUIPE, LEXIQUE, mailDe, heureScenario, STYLE_DOCUMENTS, PIED, PIED_RECONSTITUE, DOC_DROIT, DOC_CHEP, DISTRIBUTEURS, cadreSupports,
  date, palettes, ech, JOURS } from './chep.js';
import {
  ID, ID_VOLET, QUAI_ID, TOURNEE_ID, FICHES, SCENARIO, EXPEDITEUR, TRANSPORTEUR, CAPACITE, PLACES_SOL, PILE_VIDES, NB_PILES,
  SITES, IDS_TOURNEE, FRAIS, nomSite, horaireDit, TOURNEE_BASE, POINTS, pilesDe, comptesDe, jeuDe, jeuDeBase, pilesDeBase, dernierDe, confirme,
  constats, creditDeSonControle, fiche, dejaEnvoyee, lireNombre, etatQuai, quaiClos, tourneeEnvoyee,
} from './chep-ent92-donnees.js';
import { graineDeBase, niveauEleve } from '../core/tirage.js';

export { ID, QUAI_ID, TOURNEE_ID, FICHES };

// ─────────────────────────────────────────────────────────────── formats
const z2 = (n) => String(n).padStart(2, '0');
// « lundi 18/01/2027 à 9 h 10 »
export function quandDit(s) {
  const [d, t] = s.split(' '); const [hh, mm] = t.split(':').map(Number);
  return `${date(d, { long: true })} à ${hh} h ${z2(mm)}`;
}
const plur = (n, un, des) => `${n} ${Math.abs(n) > 1 ? des : un}`;

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
const entete = (qui, refs) => `<div class="ch-entete"><b>${ech(qui)}</b><span>${refs.map(ech).join('<br>')}</span></div>`;
const PIED_92 = PIED(PIED_RECONSTITUE);

// Le bon de collecte d'Opale Frais (annoncé : des piles de 15), avec les réserves ÉCRITES PAR L'ÉLÈVE au quai (rien de corrigé).
export function docBonCollecte(db) {
  const J = jeuDeBase(db || {});
  return htmlBonCollecte({ bc: J.bc, piles: pilesDe(J, { confirme: confirme(db || {}) }), etat: etatQuai(db || {}), expediteur: EXPEDITEUR,
    prepare: '2027-01-18' });
}
// FABRIQUE (18/10/2026, partagée avec ENT-9.4) : le bon de collecte d'un distributeur (`expediteur`), ses piles, les réserves écrites au quai
// (`etat` = `db.quais[<id>]`, ou null) ; `prepare` = la date où il l'a préparé (iso).
export function htmlBonCollecte({ bc, piles: P, etat: e, expediteur, prepare }) {
  const C = comptesDe(P);
  const J = { bc };
  const EXPEDITEUR = expediteur;
  const lignes = e && e.ecrit ? (e.lignes || []) : null;
  const reserves = !lignes ? '<p class="ch-st" data-bc-reserves="vide">Pas encore de réserves écrites : elles s’écrivent au quai des retours.</p>'
    : lignes.length ? `<ul class="ch-ul" data-bc-reserves="eleve">${lignes.map((l) => `<li>${ech(l.texte)}</li>`).join('')}</ul>`
      : '<p class="ch-st" data-bc-reserves="aucune">Aucune réserve écrite.</p>';
  return `<article class="ch-doc" aria-label="Bon de collecte ${ech(J.bc)}">
    ${entete(`${EXPEDITEUR.nom} — plate-forme de produits frais`, [EXPEDITEUR.ville, `[[bon de collecte|Bon de collecte]] n° ${J.bc}`])}
    <p class="ch-t">Bon de collecte — palettes vides</p>
    <p class="ch-st">Préparé le ${date(prepare, { long: true })}, remis au transporteur pour le centre de service CHEP de Templemars</p>
    <dl class="ch-dl">
      <dt>Expéditeur</dt><dd>${ech(EXPEDITEUR.nom)} — ${ech(EXPEDITEUR.ville)}</dd>
      <dt>Destinataire</dt><dd>CHEP — [[centre de service]] de Templemars, quai des retours</dd>
      <dt>Transporteur</dt><dd>${ech(TRANSPORTEUR.nom)} (${ech(TRANSPORTEUR.ville)}), porteur</dd>
    </dl>
    <table class="ch-t2"><thead><tr><th scope="col">Pile</th><th scope="col">Désignation</th><th scope="col" class="ch-n">Palettes annoncées</th></tr></thead>
      <tbody>${P.map((p) => `<tr><td>${ech(p.id)}</td><td>Palettes CHEP 1 200 × 1 000 vides</td><td class="ch-n">${p.bl}</td></tr>`).join('')}</tbody></table>
    ${cadreSupports([`<b>Total annoncé : ${palettes(C.annoncees)} CHEP 1 200 × 1 000 vides, en piles de ${PILE_VIDES}</b>`])}
    <p class="ch-st" style="margin:10px 0 2px"><b>[[réserve|Réserves]] du destinataire</b> (écrites au quai des retours)</p>
    ${reserves}
    ${PIED_92}
  </article>`;
}
// Le même bon, vierge (« Avant de commencer » : aucun nombre).
const DOC_BON_VIERGE = { id: 'bon-vierge', titre: 'Un bon de collecte (vierge)', court: 'Un bon de collecte',
  html: `<article class="ch-doc" aria-label="Bon de collecte vierge">
    ${entete('Nom du distributeur — plate-forme', ['Ville', '[[bon de collecte|Bon de collecte]] n° …'])}
    <p class="ch-t">Bon de collecte — palettes vides</p>
    <p class="ch-st">Le distributeur l’écrit quand ses palettes vides partent vers le centre de service CHEP</p>
    <table class="ch-t2"><thead><tr><th scope="col">Pile</th><th scope="col">Désignation</th><th scope="col" class="ch-n">Palettes annoncées</th></tr></thead>
      <tbody><tr><td>…</td><td>Palettes CHEP 1 200 × 1 000 vides</td><td class="ch-n">…</td></tr><tr><td>…</td><td>…</td><td class="ch-n">…</td></tr></tbody></table>
    ${cadreSupports(['<b>Total annoncé : … palettes CHEP vides</b>'])}
    <p class="ch-st" style="margin:10px 0 2px"><b>[[réserve|Réserves]] du destinataire</b> (écrites au quai, à l’arrivée)</p>
    <div class="ch92-vide" aria-label="Case réserves, vide"></div>
    ${PIED('Modèle reconstitué — document pédagogique Prepalog.')}
  </article>` };

// Les règles de crédit (coordination §4, règle 5).
export const REGLES_CREDIT = [
  'Palettes à créditer au compte du distributeur = les palettes CHEP reçues, abîmées comprises : elles restent à CHEP, qui les répare.',
  'Ne se créditent pas : les palettes manquantes, les palettes d’un autre pool (LPR, Logipal) et les palettes Europe (EPAL). Celles qui sont arrivées sont mises de côté, en zone hors pool.',
  'À envoyer en réparation : les palettes CHEP abîmées.',
  'Le crédit se calcule sur ce qu’on a contrôlé au quai, pile par pile, pas sur ce que le bon annonce.',
];
export const DOC_REGLES = { id: 'regles-credit', titre: 'Règles de crédit d’un retour', court: 'Règles de crédit',
  html: `<article class="ch-doc" aria-label="Règles de crédit d’un retour">
    ${entete('CHEP — centre de service de Templemars', ['Quai des retours', 'Règle interne'])}
    <p class="ch-t">Créditer un retour de palettes vides</p>
    <p class="ch-st">Ce qui passe au compte du distributeur après le contrôle au quai</p>
    <ol class="ch-ol">${REGLES_CREDIT.map((r) => `<li>${r.replace('Palettes à créditer', '[[retour|Palettes à créditer]]').replace('d’un autre pool', 'd’un [[autre pool]]').replace('palettes Europe', '[[palette Europe|palettes Europe]]')}</li>`).join('')}</ol>
    ${PIED('Règle interne reconstituée à partir du fonctionnement public du pool (Autorité de la concurrence, 2009) — document pédagogique, non contractuel.')}
  </article>` };

// Les avis de palettes vides (un par site ; Frais du Nord : V, tiré ; les quatre autres : leurs vides tirés par élève, 135 à 145 pour Douai,
// 115 à 125 Prouvy, 90 à 100 Roubaix, 65 à 75 Dourges ; date et heure de la pièce `dernier`).
const ADRESSE = {};
POINTS.forEach((p) => { ADRESSE[p.id] = p.adresse; });
ADRESSE.lesquin = 'rue Henri Ghesquière, 59810 Lesquin';
export function avisDe(db, site) {
  const J = jeuDeBase(db || {}), P = dernierDe(db || {});
  const n = site === 'lesquin' ? J.V : J.vides[site];
  const signale = site === 'lesquin' ? FRAIS.signale : P.signale[site];
  const D = DISTRIBUTEURS[SITES[site].dist];
  return { site, nom: D.nom, ville: D.ville, n, signale, horaire: horaireDit(site), adresse: ADRESSE[site] };
}
export const AVIS_IDS = ['lesquin', ...IDS_TOURNEE];
const docAvis = (site) => ({ id: `avis-${site}`, titre: `Avis de palettes vides — ${nomSite(site)}`, court: `Avis — ${nomSite(site)}`,
  html: (db) => htmlAvis(avisDe(db, site)) });
// FABRIQUE (18/10/2026, partagée avec ENT-9.4) : l'avis d'un site, `A = { nom, ville, adresse, signale ('AAAA-MM-JJ hh:mm'), horaire (dit), n }`.
export function htmlAvis(A) {
    return `<article class="ch-doc" aria-label="Avis de palettes vides — ${ech(A.nom)}">
    ${entete(`${A.nom} — plate-forme de produits frais`, [A.ville, 'Portail clients CHEP'])}
    <p class="ch-t">Avis de palettes vides</p>
    <p class="ch-st">Signalé le <b>${ech(quandDit(A.signale))}</b></p>
    <dl class="ch-dl">
      <dt>Site</dt><dd>${ech(A.nom)} — ${ech(A.adresse || A.ville)}</dd>
      <dt>Quai des vides</dt><dd>ouvert <b>${ech(A.horaire)}</b> pour l’enlèvement</dd>
    </dl>
    ${cadreSupports([`<b>${palettes(A.n)} CHEP prêtes à l’enlèvement</b>`, `Palettes vides 1 200 × 1 000, empilées par ${PILE_VIDES}.`])}
    ${PIED_92}
  </article>`;
}
// La consigne de Yannick, en document (pour l'avoir sous les yeux à côté de la fiche).
export const TEXTE_REGLE = `La règle : un camion complet pour un site qui peut le remplir à lui seul ; les autres, en tournée. Si tout ne tient pas, on reporte le site qui a signalé ses vides le plus tard : il passera vendredi. Nos semis prennent ${PLACES_SOL} piles au sol, et on empile les vides par ${PILE_VIDES}. Départ et retour ici, à 6 h.`;
const DOC_REGLE = { id: 'regle-ramasse', titre: 'La règle de la ramasse (Yannick)', court: 'La règle de la ramasse',
  html: `<article class="ch-doc" aria-label="La règle de la ramasse">
    ${entete('CHEP — exploitation transport, Templemars', ['Yannick Desmet', 'Collectes du mercredi'])}
    <p class="ch-t">La règle de la [[ramasse]]</p>
    <ul class="ch-ul">
      <li>Un <b>camion complet</b> pour un site qui peut le remplir à lui seul ; les autres, <b>en tournée</b>.</li>
      <li>Si tout ne tient pas, on <b>reporte le site qui a signalé ses vides le plus tard</b> : il passera vendredi.</li>
      <li>Nos semis prennent <b>${PLACES_SOL} piles au sol</b> ; on empile les vides <b>par ${PILE_VIDES}</b>.</li>
      <li>Départ et retour au centre de Templemars, <b>à 6 h</b>. Chaque quai a ses heures d’enlèvement.</li>
      <li>La collecte est faite par notre transporteur, ${ech(TRANSPORTEUR.nom)}.</li>
    </ul>
    ${PIED('Consigne construite pour l’exercice — document pédagogique Prepalog.')}
  </article>` };
// Le contrat type (question n° 2 et d1) : la phrase CITÉE par l'OTRE (22/03/2023), pas relue dans le texte du contrat type.
export const PHRASE_CONTRAT_TYPE = 'les supports de charge ne donnent lieu ni à consignation ni à location au transporteur';
const DOC_CONTRAT_TYPE = { id: 'contrat-type', titre: 'Le contrat type : les palettes et le transporteur', court: 'Le contrat type',
  html: `<article class="ch-doc" aria-label="Le contrat type : les palettes et le transporteur">
    <p class="ch-t">Le contrat type : les palettes et le transporteur</p>
    <p class="ch-st">Contrat type « général » du transport routier de marchandises : il s’applique quand le client et le transporteur n’ont rien écrit d’autre</p>
    <p><b>Ce qu’il dit des supports de charge</b> (palettes, rolls, bacs)</p>
    <p class="ch-cite">« … ${PHRASE_CONTRAT_TYPE}. »</p>
    <p class="ch-st" style="margin-top:12px">Ce que ça veut dire</p>
    <ul class="ch-ul">
      <li>Le transporteur qui ramène des palettes vides <b>ne les loue pas</b> et ne verse <b>pas de consigne</b> : il ne fait que les transporter.</li>
      <li>La règle vaut <b>sauf accord contraire</b> : le client et le transporteur peuvent écrire autre chose dans leur contrat.</li>
      <li>Les palettes restent sous la responsabilité de celui qui les a en location.</li>
    </ul>
    ${PIED('Phrase citée par l’OTRE (organisation des transporteurs routiers), « Gestion des palettes », 22/03/2023. L’article exact du contrat type n’a pas été relu sur Légifrance : à vérifier avant de le citer.')}
  </article>` };
// Les mots du retour (« Avant de commencer »).
const DOC_MOTS = { id: 'mots-retour', titre: 'Les mots du retour', court: 'Les mots du retour',
  html: `<article class="ch-doc" aria-label="Les mots du retour">
    <p class="ch-t">Les mots du retour</p>
    <p class="ch-st">Clique un mot souligné pour relire sa définition</p>
    <dl class="ch-dl">
      <dt>[[bon de collecte]]</dt><dd>${ech(LEXIQUE['bon de collecte'])}</dd>
      <dt>[[réserve]]</dt><dd>${ech(LEXIQUE['réserve'])}</dd>
      <dt>[[ramasse]]</dt><dd>${ech(LEXIQUE.ramasse)}</dd>
      <dt>[[autre pool]]</dt><dd>${ech(LEXIQUE['autre pool'])}</dd>
      <dt>[[palette Europe]]</dt><dd>${ech(LEXIQUE['palette Europe'])}</dd>
      <dt>[[centre de service]]</dt><dd>${ech(LEXIQUE['centre de service'])}</dd>
    </dl>
    ${PIED('Lexique de la séance — document pédagogique Prepalog.')}
  </article>` };

// Les dessins (« Avant de commencer ») : le KIT ISO du moteur (`palettePile`), aucune image d'une autre source, aucun fichier. Une palette
// seule, vue de la face avant ; le contenu ne fait que cadrer le dessin.
function dessinPalette(p, aria) {
  const I = projection({ unite: 260, origine: [0, 0] }), L = PAL_VIDE.L, D = PAL_VIDE.D, H = PAL_VIDE.H;
  const ox = -L / 2, oy = -D / 2;
  const pts = [[ox, oy], [ox + L, oy], [ox, oy + D], [ox + L, oy + D]].flatMap(([x, y]) => [I.P(x, y, 0), I.P(x, y, H)]);
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), x0 = Math.min(...xs) - 10, y0 = Math.min(...ys) - 10;
  const vb = `${x0.toFixed(0)} ${y0.toFixed(0)} ${(Math.max(...xs) - x0 + 10).toFixed(0)} ${(Math.max(...ys) - y0 + 10).toFixed(0)}`;
  return `<svg class="ch92-dessin" viewBox="${vb}" role="img" aria-label="${ech(aria)}">${palettePile(I, { palettes: [{ no: 1, ...p }] }, ox, oy, 0, { lisible: true, balises: false })}</svg>`;
}
export const ALT_LPR = 'Dessin : une palette vide rouge, marquée « LPR » sur ses blocs.';
export const ALT_ABIMEE = 'Dessin : une palette vide bleue, marquée « CHEP » sur ses blocs ; une planche de la façade est cassée.';
export const DOC_DESSIN_LPR = { id: 'dessin-lpr', titre: 'Une palette arrivée avec un retour', court: 'Une palette (1)',
  html: `<article class="ch-doc" aria-label="Une palette arrivée avec un retour">${dessinPalette({ pool: 'lpr', abime: null }, ALT_LPR)}
    ${PIED('Dessin construit pour l’exercice (kit de dessin de Prepalog).')}</article>` };
const DOC_DESSIN_ABIMEE = { id: 'dessin-abimee', titre: 'Une palette vue au quai des retours', court: 'Une palette (2)',
  html: `<article class="ch-doc" aria-label="Une palette vue au quai des retours">${dessinPalette({ pool: 'chep', abime: 'S' }, ALT_ABIMEE)}
    ${PIED('Dessin construit pour l’exercice (kit de dessin de Prepalog).')}</article>` };

export const DOCUMENTS = [
  { id: 'bon-collecte', titre: 'Bon de collecte d’Opale Frais', court: 'Bon de collecte', html: docBonCollecte },
  DOC_REGLES,
  ...AVIS_IDS.map(docAvis),
  DOC_REGLE, DOC_CONTRAT_TYPE, DOC_DROIT, DOC_CHEP, DOC_BON_VIERGE, DOC_MOTS, DOC_DESSIN_LPR, DOC_DESSIN_ABIMEE,
];
export const STYLE = `${STYLE_DOCUMENTS}
.ch92-dessin{display:block; width:100%; max-width:420px; height:auto; margin:8px auto 12px}
.ch92-vide{border:1.5px solid #555047; min-height:42px; margin:2px 0 8px; border-radius:2px}
`;

// ─────────────────────────────────────────────────────────────── ① le quai des retours (une fonction de la graine et du niveau)
export const CONSIGNE_GREGORY = 'Compte chaque pile, regarde si ce sont bien des CHEP et si elles sont en état. Écris les réserves sur le bon, puis fais-le signer.';
export const RAPPEL_ACCOMPAGNE = 'Clique les palettes une à une : de près, chacune dit son numéro. Fais le tour de chaque pile avant de décider.';
export const LIBELLES_QUAI = { avarie: { nom: 'Palettes abîmées', precision: 'à réparer', adjectif: 'abîmé' }, manquant: { nom: 'Palettes manquantes' },
  produit: { nom: 'Palettes d’un autre pool' } };
export function quaiDuJeu(jeu, niveau = 'standard') {
  const piles = pilesDe(jeu, { confirme: niveau === 'confirme' });
  const consigne = niveau === 'accompagne' ? `${CONSIGNE_GREGORY} ${RAPPEL_ACCOMPAGNE}` : CONSIGNE_GREGORY;
  return quaiChep({ id: QUAI_ID, piles, bc: jeu.bc, debut: '08:05', arrivee: '08:10', fournisseur: `${EXPEDITEUR.nom} (Dunkerque)`,
    avertissement: `<b>Grégory :</b> « ${ech(consigne)} »<br>Le quai est un <b>dessin construit</b>. Opale Frais, le transporteur, les piles et le bon de collecte sont <b>construits pour l’exercice</b>.`,
    parole: 'Bonjour ! Les vides d’Opale Frais, de Dunkerque. Voilà le bon de collecte.', aides: { consignes: true, chefDeQuai: true } });
}
// FABRIQUE (18/10/2026, partagée avec ENT-9.4) : le quai des retours de Templemars pour des piles (`piles`, `bc`), un porteur (`fournisseur`,
// `arrivee`, `parole`), un mot en tête (`avertissement`), des aides (`aides`, `{}` en évaluation) et, en copie, `rendCopie: false`.
export function quaiChep({ id, piles, bc, debut, arrivee, fournisseur, avertissement, parole, aides, rendCopie }) {
  return {
    id,
    libelle: 'Quai des retours',
    rendu: 'iso',
    froid: false,
    titre: 'CHEP — centre de service de Templemars — quai des retours',
    destinataire: 'CHEP Templemars',
    avertissement,
    // Le porteur repart une fois le bon signé : le contrôle ne se recommence pas (une pile se « Modifie » tant que les réserves ne sont pas écrites).
    recommencer: false,
    ...(rendCopie === false ? { rendCopie: false } : {}),
    debut,
    unite: { un: 'palette', des: 'palettes', feminin: true },
    motifs: ['manquant', 'avarie', 'produit'],
    deuxMotifs: true,
    decisions: ['accepter', 'reserves'],
    libelles: JSON.parse(JSON.stringify(LIBELLES_QUAI)),
    document: { nom: 'Bon de collecte', court: 'BC' },
    lieu: { nom: 'Quai des retours', temp: 8, refrigere: false },
    zone: { nom: 'Zone de réception' },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste' },
    calcul: { forme: 'brouillon' },
    aides,
    camions: [{
      transporteur: TRANSPORTEUR.nom, fournisseur, bl: bc, arrivee,
      parole,
      palettes: piles,
    }],
  };
}
// Le quai d'une graine ET d'un niveau (une déclaration neuve à chaque appel : le moteur garde la sienne en cache).
export const quaiDe = (graine, { niveau = 'standard' } = {}) => quaiDuJeu(jeuDe(graine), niveau);
export const quaiDeBase = (db) => quaiDe(graineDeBase(db), { niveau: niveauEleve(db) });

// ─────────────────────────────────────────────────────────────── ② la fiche « crédit du retour »
export const SORT = [
  { v: 'stock', lib: '…sont mises dans le stock CHEP, puisqu’elles sont arrivées avec les nôtres.' },
  { v: 'cote', lib: '…sont mises de côté : elles ne sont pas à CHEP et ne se créditent pas.' },
  { v: 'factures', lib: '…sont créditées puis facturées à leur loueur.' },
];
export const nb = (id, lib, manque) => ({ type: 'nombre', id, lib, unite: 'palettes', min: 0, entier: true, manque });
// FABRIQUE (18/10/2026, partagée avec ENT-9.4) : la fiche du crédit d'un retour. `blocs(db)` : les cases (ENT-9.2 : l'encadré, les quatre
// nombres et le sort des autres pools ; ENT-9.4 : les nombres seuls, sans aide).
export function ficheCreditChep({ id, titre, sousTitre, documents, quand, blocs, envoi }) {
  return {
    id, libelle: 'Crédit du retour', titre,
    sousTitre,
    documents,
    largeurDocs: 1.1,
    serree: true,
    defile: true,   // cinq cases et un choix long : la fiche défile dans sa colonne, le bouton d'envoi reste visible (comme ENT-9.1)
    bouton: 'Préparer le crédit',
    quand,
    blocs,
    envoi,
  };
}
export const FICHE_CREDIT = ficheCreditChep({ id: FICHES.credit, titre: 'Crédit du retour — Opale Frais',
  sousTitre: 'À gauche, le bon de collecte avec tes réserves et les règles de crédit. Grégory valide avant midi.',
  documents: ['bon-collecte', 'regles-credit'],
  quand: quaiClos,
  blocs: (db) => [
    { type: 'encadre', titre: `Bon de collecte ${jeuDeBase(db || {}).bc}`, texte: 'Le crédit se calcule sur ton contrôle au quai, pile par pile.' },
    nb('annoncees', 'Palettes annoncées sur le bon', 'les palettes annoncées'),
    nb('aCrediter', 'Palettes CHEP reçues (abîmées comprises) — à créditer au compte d’Opale Frais', 'les palettes à créditer'),
    nb('horsPool', 'Palettes d’un autre pool, mises en zone hors pool', 'les palettes d’un autre pool'),
    nb('reparation', 'Palettes CHEP à envoyer en réparation', 'les palettes à réparer'),
    { type: 'choix', id: 'sort', lib: 'Les palettes d’un autre pool…', colonne: true, choix: SORT, manque: 'le sort des palettes d’un autre pool' },
  ],
  envoi: { bouton: 'Envoyer le crédit à Grégory', a: 'Grégory', suite: 'Grégory te répond dans la Messagerie.' } });

// ─────────────────────────────────────────────────────────────── ③ la fiche « besoin de la ramasse »
export const FRAIS_CHOIX = [
  { v: 'complet', lib: 'un camion complet rien que pour lui' },
  { v: 'tournee', lib: 'dans la tournée' },
  { v: 'attendre', lib: 'attendre la semaine prochaine' },
];
// FABRIQUE (18/10/2026, partagée avec ENT-9.4) : la fiche du besoin de la ramasse. `blocs(db)` : les cases (ENT-9.2 : capacité, Frais du Nord,
// total, « tout tient » ; ENT-9.4 : capacité et site à camion complet).
export function ficheBesoinChep({ id, libelle, titre, sousTitre, documents, quand, blocs, envoi }) {
  return {
    id, libelle, titre,
    sousTitre,
    documents,
    largeurDocs: 1,
    serree: true,
    bouton: 'Préparer la ramasse',
    quand,
    blocs,
    envoi,
  };
}
export const FICHE_BESOIN = ficheBesoinChep({ id: FICHES.besoin, libelle: 'Ramasse du mercredi', titre: 'Ramasse du mercredi 20/01 — besoin',
  sousTitre: 'À gauche, les avis de la semaine et la règle de Yannick.',
  documents: ['regle-ramasse', ...AVIS_IDS.map((s) => `avis-${s}`)],
  quand: dejaEnvoyee(FICHES.credit),
  blocs: (db) => [
    nb('capacite', 'Capacité d’un camion (palettes vides)', 'la capacité du camion'),
    { type: 'liste', id: 'frais', lib: `Frais du Nord (Lesquin), ${palettes(jeuDeBase(db || {}).V)} vides`, vide: 'Choisir…', choix: FRAIS_CHOIX, manque: 'ce que tu fais pour Frais du Nord' },
    nb('total', 'Les autres sites : total des palettes à collecter', 'le total des autres sites'),
    { type: 'choix', id: 'toutTient', lib: 'Tout tient-il dans un camion ?', choix: [{ v: 'oui', lib: 'Oui' }, { v: 'non', lib: 'Non' }], manque: 'si tout tient dans un camion' },
  ],
  envoi: { bouton: 'Envoyer à Yannick', a: 'Yannick', suite: 'Yannick te répond dans la Messagerie.' } });

// ─────────────────────────────────────────────────────────────── ④ la tournée de ramasse
export const TOURNEE = {
  ...TOURNEE_BASE,
  libelle: 'Tournée de ramasse',
  titre: 'La tournée de ramasse du mercredi 20/01',
  consigne: 'Frais du Nord (Lesquin) n’est pas dans cette tournée. Les quatre autres plates-formes se regroupent : clique-les sur la carte, dans '
    + `l’ordre de passage. Le semi part de Templemars à 6 h et y revient ; il prend ${PLACES_SOL} piles de ${PILE_VIDES} palettes vides. Si tout ne tient `
    + 'pas, reporte à vendredi le site qui a signalé ses vides le plus tard (regarde les avis). Chaque quai a ses heures d’enlèvement : arrivé trop tôt, '
    + 'le camion attend ; trop tard, le quai est fermé.',
  termine: { libelle: 'Envoyer la tournée à Yannick', confirmer: 'Envoyer cette tournée à Yannick ? Clique encore', fait: 'Tournée envoyée à Yannick à {h}.',
    toast: 'Tournée envoyée.' },
  rappel: [`Capacité : ${PLACES_SOL} piles de ${PILE_VIDES} palettes vides`, 'Départ 6 h de Templemars, retour à Templemars',
    '55 km/h, 20 min par arrêt + 3 min par 60 palettes'],
  quand: dejaEnvoyee(FICHES.besoin),
};

// ─────────────────────────────────────────────────────────────── les messages (date du scénario ; au tu entre collègues)
const GREGORY = { nom: EQUIPE.gregory.nom, mail: mailDe('gregory') };
const YANNICK = { nom: EQUIPE.yannick.nom, mail: mailDe('yannick') };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.matin, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const merci = (de, heure) => (prenom, n, db) => ({ mails: [mail(prenom, de, 'Bien reçu', `Bien reçu, merci.\n\n${de.nom.split(' ')[0]}`, { db, heure, decalage: 1 })] });
const valeur = (v) => { const n = lireNombre(v); return Number.isFinite(n) ? String(n) : (String(v == null ? '' : v).trim() || '…'); };
// Ce que Grégory reprend du crédit (SES nombres, jamais corrigés).
export const texteCreditRecu = (db) => {
  const { v } = fiche(db, FICHES.credit);
  return `Je note : ${valeur(v.aCrediter)} à créditer, ${valeur(v.reparation)} en réparation. Bon appétit !\n\nGrégory`;
};
// Ce que Yannick reprend du besoin (SON choix pour Frais du Nord).
export const texteBesoinRecu = (db) => {
  const { v } = fiche(db, FICHES.besoin);
  const tete = v.frais === 'complet' ? 'OK pour Frais du Nord : je réserve son camion. Ce qui ne tient pas dedans attendra la semaine prochaine.'
    : `Je note : ${(FRAIS_CHOIX.find((c) => c.v === v.frais) || { lib: '…' }).lib} pour Frais du Nord.`;
  return `${tete}\n\nMaintenant, la tournée des quatre autres plates-formes : ouvre « Tournée de ramasse ». Quand elle est prête, envoie-la-moi.\n\nYannick`;
};
// Ce que Yannick reprend de la tournée (SON ordre, SON site reporté).
export function texteTourneeRecue(db) {
  const T = tourneeEnvoyee(db);
  if (!T) return 'Bien reçu.\n\nYannick';
  const ordre = T.b.retenus.map((p) => p.nom).join(' → ') || '…';
  const rep = T.b.reportes.map(nomSite);
  const fin = rep.length ? `${rep.join(' et ')} ${rep.length > 1 ? 'passent' : 'passe'} vendredi.` : 'Aucun site ne passe à vendredi.';
  return `Je la passe à ${TRANSPORTEUR.nom} : ${ordre}. ${fin} Merci !\n\nYannick`;
}
export const SUJET_GREGORY = 'Le retour d’Opale Frais';
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, GREGORY, SUJET_GREGORY,
      `Salut ${prenom},\n\nle porteur de ${TRANSPORTEUR.nom} arrive de chez ${EXPEDITEUR.nom} (Dunkerque) avec les vides de la semaine. Le bon de collecte annonce `
        + `des piles de ${PILE_VIDES} palettes CHEP. Contrôle chaque pile : combien il y en a, si ce sont bien des CHEP, si elles sont en état. Écris les `
        + `[[réserve|réserves]] sur le bon, puis prépare le crédit pour ${EXPEDITEUR.nom}.\n\nOuvre « Quai des retours ». Les règles de crédit sont jointes.\n\nGrégory`,
      { heure: SCENARIO.matin, extra: { pieces: ['regles-credit'] } }),
  ] }),
  corrections: { [FICHES.credit]: merci(GREGORY, '11:50'), [FICHES.besoin]: merci(YANNICK, '14:20') },
  declencheurs: [
    // Le quai clos : Grégory demande le crédit (il ne dit rien de juste ou de faux).
    { id: 'quai-clos', quand: apresGeste(`quai:${QUAI_ID}:cloturer`),
      semer: (prenom, db) => ({ mails: [mail(prenom, GREGORY, 'Le crédit d’Opale Frais',
        `Merci. Prépare le crédit d’${EXPEDITEUR.nom} : je le valide avant midi.\n\nGrégory`,
        { db, decalage: 2, extra: { pieces: ['bon-collecte', 'regles-credit'], ouvreFiche: FICHES.credit } })] }) },
    // Le crédit envoyé : Grégory reprend SES nombres ; puis, l'après-midi, le message de Yannick (les avis de la semaine en pièces jointes).
    { id: 'credit-recu', quand: apresFiche(FICHES.credit),
      semer: (prenom, db) => ({ mails: [mail(prenom, GREGORY, 'Le crédit d’Opale Frais', texteCreditRecu(db), { db, heure: '11:50' })] }) },
    { id: 'ramasse', quand: apresFiche(FICHES.credit),
      semer: (prenom, db) => ({ mails: [mail(prenom, YANNICK, 'La collecte de demain',
        `Salut ${prenom},\n\nprépare la [[collecte]] de demain mercredi. ${TEXTE_REGLE}\n\nLes avis de la semaine sont joints, avec le contrat type pour le `
          + `transport.\n\nYannick`,
        { db, heure: SCENARIO.apresMidi, extra: { pieces: [...AVIS_IDS.map((s) => `avis-${s}`), 'regle-ramasse', 'contrat-type'], ouvreFiche: FICHES.besoin } })] }) },
    { id: 'besoin-recu', quand: apresFiche(FICHES.besoin),
      semer: (prenom, db) => ({ mails: [mail(prenom, YANNICK, 'Frais du Nord', texteBesoinRecu(db), { db, heure: SCENARIO.apresMidi, decalage: 3 })] }) },
    { id: 'tournee-recue', quand: apresGeste(`tournee:${TOURNEE_ID}:envoyer`),
      semer: (prenom, db) => ({ mails: [mail(prenom, YANNICK, 'La tournée de mercredi', texteTourneeRecue(db), { db, heure: SCENARIO.apresMidi, decalage: 5 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (17 points + 3 de questions = 20 ; poids de Cowork, brief §5)
export const GROUPES = { controler: '① Contrôler le retour', crediter: '② Créditer le compte', organiser: '③ Organiser la ramasse' };
export const POIDS = { compte: 0.4, 'autre-pool': 2, abimees: 2, decisions: 2, 'a-crediter': 2, 'hors-pool': 1, capacite: 1, frais: 1, reporte: 1.5, tient: 1, horaires: 1.5 };
const ok = { status: 'ok' }, attente = { status: 'attente' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });
const socle = (db) => pilesDeBase(db).slice(0, NB_PILES);
// Un jalon du quai : jugé une fois le quai clos (le bon est signé : plus rien n'y bouge ; rien n'est vrai par inaction).
const jalonQuai = (id, titre, juge) => ({ id, titre, groupe: GROUPES.controler, poids: POIDS[id],
  verifier(db) { if (!quaiClos(db)) return attente; const r = juge(db); return r === true ? ok : ko(typeof r === 'string' ? r : undefined); } });
// Une quantité de motif juste : le motif coché avec le bon nombre quand la pile en porte, aucun motif sinon.
const motifJuste = (attendu, saisi) => (attendu > 0 ? saisi === attendu : saisi === null);
const jalonFiche = (id, ficheId, groupe, titre, juge) => ({ id, titre, groupe: GROUPES[groupe], poids: POIDS[id], ecran: `fiche:${ficheId}`,
  verifier(db) { const f = fiche(db, ficheId); return f.envoye ? (juge(f.v, db) ? ok : ko()) : attente; } });
const jalonTournee = (id, titre, juge) => ({ id, titre, groupe: GROUPES.organiser, poids: POIDS[id],
  verifier(db) { const T = tourneeEnvoyee(db); return T ? (juge(T.b, db) ? ok : ko()) : attente; } });

export const ETAPES = [
  // ① Contrôler le retour (8) : le compte de chaque pile (0,4 × 5), les autres pools (2), les abîmées (2), décisions et réserves (2).
  ...['P1', 'P2', 'P3', 'P4', 'P5'].map((pid, k) => ({ ...jalonQuai('compte', `Le compte de la pile ${pid}`, (db) => {
    const p = socle(db)[k];
    return constats(db, p.id).compte === comptePile(p).hauteur;
  }), id: `compte-${pid}` })),
  jalonQuai('autre-pool', 'Les palettes d’un autre pool repérées', (db) => socle(db).every((p) => motifJuste(comptePile(p).intrus, constats(db, p.id).produit))),
  jalonQuai('abimees', 'Les palettes abîmées repérées', (db) => socle(db).every((p) => motifJuste(comptePile(p).abimees, constats(db, p.id).avarie))),
  // La décision est jugée sur SON comptage (une pile mal comptée ou une palette non vue coûte à son jalon, pas à celui-ci) : une pile comptée
  // juste (= le bon) n'a pas de motif « manquantes » ; une pile comptée en dessous est « sous réserve » avec « manquantes » = bon − son compte ;
  // la pile réellement juste est acceptée ; les réserves sont écrites, aucune sans quantité.
  jalonQuai('decisions', 'La décision de chaque pile et les réserves écrites sur le bon', (db) => {
    const e = etatQuai(db);
    const coherente = (p) => {
      const c = constats(db, p.id);
      if (c.compte == null || !c.decision) return false;
      if (decisionPile(p).attendu === 'accepter' && c.decision !== 'accepter') return false;
      if (c.compte < p.bl) return c.decision === 'reserves' && c.manquant === p.bl - c.compte;
      return c.compte === p.bl && c.manquant === null && (c.decision === 'accepter' || c.motifs.length > 0);
    };
    return socle(db).every(coherente) && !!e.ecrit && !(e.lignes || []).some((l) => l.vide);
  }),
  // ② Créditer le compte (3) : jugé sur SON contrôle (une pile mal comptée coûte au compte, pas au crédit).
  jalonFiche('a-crediter', FICHES.credit, 'crediter', 'Les palettes à créditer, d’après ton contrôle',
    (v, db) => lireNombre(v.aCrediter) === creditDeSonControle(db).aCrediter),
  jalonFiche('hors-pool', FICHES.credit, 'crediter', 'Les palettes hors pool, en réparation, et le sort des palettes d’un autre pool', (v, db) => {
    const c = creditDeSonControle(db);
    return lireNombre(v.horsPool) === c.horsPool && lireNombre(v.reparation) === c.reparation && v.sort === 'cote';
  }),
  // ③ Organiser la ramasse (6).
  jalonFiche('capacite', FICHES.besoin, 'organiser', 'La capacité d’un camion', (v) => lireNombre(v.capacite) === CAPACITE),
  jalonFiche('frais', FICHES.besoin, 'organiser', 'Frais du Nord', (v) => v.frais === 'complet'),
  jalonTournee('reporte', 'Le site reporté à vendredi', (b, db) => b.reportes.length === 1 && b.reportes[0] === dernierDe(db).site),
  jalonTournee('tient', 'La tournée tient dans le camion', (b) => !b.depassements.length),
  jalonTournee('horaires', 'Les horaires d’enlèvement respectés', (b) => b.retenus.length > 0 && !b.creneaux.some((c) => c.charge && c.trop === 'tard')),
  // Le cas bonus du confirmé : la 6e pile (compte, décision, réserve), sans poids ni groupe, `null` chez qui ne l'a pas reçue.
  { id: 'bonus-pile6', bonus: true, titre: 'La pile en plus bien contrôlée',
    verifier(db) {
      if (!confirme(db)) return null;
      if (!quaiClos(db)) return attente;
      const L = jalonsQuai(db, quaiDeBase(db)).L;
      const lu = (k) => (L.find((l) => l.id === `P6-${k}`) || {}).ok;
      return lu('comptage') && lu('decision') && lu('reserve') ? ok : ko();
    } },
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, accueil, options
export const PASTILLES = [
  { libelle: 'Contrôler le retour', fait: quaiClos },
  { libelle: 'Créditer le compte', fait: dejaEnvoyee(FICHES.credit) },
  { libelle: 'Préparer la ramasse', fait: dejaEnvoyee(FICHES.besoin) },
  { libelle: 'Construire la tournée', fait: (db) => !!tourneeEnvoyee(db) },
];
const messagesLus = (db) => (db.mails || []).filter((m) => m.folder === 'in').every((m) => m.read);
export const SUITE = [
  { vue: 'mail', libelle: 'Lire le message de Grégory', fait: (db) => messagesLus(db) || !!etatQuai(db) },
  { vue: 'quai', libelle: 'Quai des retours', fait: quaiClos },
  { vue: 'fiche', libelle: 'Crédit du retour', fait: dejaEnvoyee(FICHES.credit) },
  { vue: `fiche:${FICHES.besoin}`, libelle: 'Besoin de la ramasse', fait: dejaEnvoyee(FICHES.besoin) },
  { vue: 'tournee', libelle: 'Tournée de ramasse', fait: (db) => !!tourneeEnvoyee(db) },
];
export const LEXIQUE_92 = {
  ...LEXIQUE,
  'zone hors pool': 'L’endroit du quai où l’on pose les palettes qui n’appartiennent pas au pool CHEP, en attendant qu’elles repartent.',
  'contrat type': 'Un contrat fixé par décret pour un métier : il s’applique quand le client et le transporteur n’ont rien écrit d’autre.',
};
export const MENTION = 'Réels : CHEP et son centre de service de Templemars, le tri et la réparation des palettes collectées, la collecte sur avis '
  + 'des distributeurs, les villes de la tournée, la carte (© contributeurs OpenStreetMap), l’article 1732 du Code civil. Construits : Grégory, Yannick, '
  + 'Opale Frais, Transports Lys-Escaut, les plates-formes, les piles, les numéros, les avis de vides, les horaires des quais, la règle de report, la '
  + 'capacité du camion, la vitesse et le temps d’enlèvement.';
export const ACCUEIL = {
  titre: 'Un retour à contrôler, une ramasse à organiser',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Grégory', 'Menu Messagerie.'],
    ['① Le quai des retours', 'Pour chaque pile : compter les palettes, faire le tour, décider. Puis les [[réserve|réserves]] sur le bon et la signature.'],
    ['② Crédit du retour', 'Ce qui passe au compte d’Opale Frais, d’après ton contrôle.'],
    ['③ Ramasse du mercredi', 'L’après-midi, avec Yannick : la capacité du camion et ce qu’on fait de chaque site.'],
    ['④ Tournée de ramasse', 'Les plates-formes dans l’ordre, sur la carte, puis « Envoyer la tournée à Yannick ».'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Le bon de collecte est signé et la tournée est partie chez Transports Lys-Escaut : ils ne se refont pas. Les fiches, elles, se corrigent.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 2 : un retour à contrôler, une ramasse à organiser',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_92,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  quai: quaiDe,
  fiches: [FICHE_CREDIT, FICHE_BESOIN],
  tournee: TOURNEE,
  pastilles: PASTILLES,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
};
// Pour le corrigé et les tests.
export { comptesDe, pilesDe, creditDeSonControle, constats, JOURS, plur };
